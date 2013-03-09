(function(){
    mstrmojo.requiresCls("mstrmojo.TouchScroller", "mstrmojo.dom");
    
    var LOCK_OFF = 0,
        LOCK_ROW = 1,
        LOCK_COL = 2,
        LOCK_BOTH =3,
        TOUCH_OFFSET = 25;
    
    mstrmojo.XtabMagnifierHelper = {
            newInstance: function(xtab){
                return {
                    xtab: xtab,
                    
                    /**
                     * Resolve the touch event to find:
                     * 1) which grid cell is under user's finger?
                     * 2) which xtab zone does this cell belong to?
                     * 3) a rectangle area calculated based the touched position which the magnifier should not be overlapped with.
                     * 
                     * If we cannot find 1), we would return null as result.
                     */
                    resolveTouchEvent: function(touch){
                        var x = touch.pageX, y = touch.pageY,
                            dom = document.elementFromPoint(x, y),
                            xtab = this.xtab, zones = xtab.zones, td, z;
                        
                        // go up through the dom tree
                        while (dom){
                            // if it's the first table cell we encounterd, remember it!
                            if (dom.tagName === 'TD' && !td){
                                td = dom;
                            }
                            // if we encounter a DOM node for the xtab zone. 
                            if (/mstrmojo-XtabZone/.test(dom.className)){
                                // try to find out which zone it is
                                for (var i in zones){
                                    if (dom == zones[i].domNode){
                                        z = zones[i];
                                    }
                                }
                                // exit the loop
                                break;
                            }
                            dom = dom.parentNode;
                        }

                        // if the touched grid cell is found
                        if (td && z){
                            return {
                                cell: td,
                                zone: z,
                                pos: {x: x - TOUCH_OFFSET, y: y - TOUCH_OFFSET, w: TOUCH_OFFSET*2, h: TOUCH_OFFSET*2}
                            };
                        }
                        
                        // return null otherwise
                        return null;
                    },
                        
                    /**
                     * create the content to be shown in the info viewer for grid.
                     */
                    createContent: function(touchObj){
                        var td = touchObj.cell,
                            zone = touchObj.zone,
                            xtab = this.xtab,
                            lv = xtab.lockHeadersCase,
                            r = parseInt(td.getAttribute('r'), 10),
                            isColOrTitle, colTitleCell,
                            umCells, row, i, tdIndex;
                        
                        // get the actual row index relative to the content provider of row headers or values
                        if (lv == LOCK_OFF || lv == LOCK_ROW){
                            //Need to subtract the row count of column headers if they are in the same zone 
                            r = r - (xtab.titlesCP.rc || 0);
                        }else if (zone.slot == '_TR' || zone.slot == '_TL'){
                            r = -1;
                        }
                        
                        //We have different logic for column headers or title cells
                        isColOrTitle = (r < 0);
                        
                        if (isColOrTitle){
                            //find the title cell or the column header cell
                            colTitleCell = xtab.getCellForNode(td);
                            if (!colTitleCell || colTitleCell.o === undefined){
                                return null;//return null if it's a grid title
                            }
                        }else{
                            //retrieve the merged row headers
                            umCells = xtab.rhsCP.getUnmergedCells(r),
                            
                            row = {
                                rh: umCells.concat(xtab.rhsCP.getRowCells(r)),//row headers
                                vs: xtab.valuesCP.getRowCells(r),//values
                                ch: []//column headers
                            };
                            
                            for(i = 0, len = xtab.chsCP.rc; i < len; i++) {
                                row.ch.push(xtab.chsCP.getRowCells(i));
                            }
                            
                            tdIndex = td.cellIndex;
                            
                            // If the selected cell are in the same zone with row headers
                            if (lv == LOCK_OFF || lv == LOCK_COL || zone.slot == '_BL'){
                                //the selected index should take unmerged headers into account
                                row.si = tdIndex + umCells.length;
                            }else { // Otherwise, the selected cell in the zone right to the row header zone
                                //add up the count of row headers
                                row.si = tdIndex + row.rh.length;
                            }
                        }
                    
                        var mks = [], pairCount = 0,
                            rows = [], selectedPair = [],
                            actions = [], selCell,
                            addPair = function(l, r, selected) {
                                var _cellMarkup = function(c, cs) {          
                                        var cmk = []; 
                                        cmk.push('<td class="', cs);
                                        if (selected){
                                            cmk.push(' selected');
                                        }
                                        cmk.push('">');
                                        if (c){
                                            if (c.ts == 4){
                                                var imgURL = (c.n || c.v),
                                                    ds = xtab.controller && xtab.controller.model && xtab.controller.model.dataService;
                                                if ( ds && ds.getImage ) {
                                                    imgURL = ds.getImage(imgURL);
                                                }
                                                cmk.push('<img src="' + imgURL + '"/>');
                                            }else{
                                                cmk.push(c.n || c.v || '&nbsp;');
                                            }
                                        }
                                        cmk.push('</td>');
                                        return cmk.join('');
                                    },
                                    nc = _cellMarkup(l, 'title'),
                                    vc = _cellMarkup(r, 'value');
                                    
                                if (selected){
                                    //remember the selected pair so that we could decide where to place it later
                                    selectedPair.push(nc, vc);
                                    selCell = r;
                                } else {
                                    rows.push('<tr>', nc, vc, '</tr>');
                                }
                                
                                pairCount++;
                            },
                            si = row && row.si, //selected index
                            rhc = row && row.rh.length,
                            j, jLen, k, kLen, i, iLen, colIdx, c, cs;
                        
                        if (isColOrTitle){
                            if (colTitleCell){
                                addPair(xtab.model.getCellTitleInfo(colTitleCell).title, colTitleCell, true);
                            }
                        }else{
                            
                            //Is the selected index is larger than the total count of row headers?
                            if (si >= rhc){
                                //It must be a metric value cell, find the relative index of the values collection 
                                si -= rhc;
                                //process column headers
                                for (j = 0, jLen = row.ch.length; j < jLen; j++) {
                                    colIdx = 0;//remember the current column index
                                    for (k = 0, kLen = row.ch[j].length; k < kLen; k++) {
                                        c = row.ch[j][k];
                                        cs = (c && c.cs) || 1; //column span
                        
                                        //If the selected cell falls in this column
                                        if((si >= colIdx) && (si < colIdx + cs)) {
                                            if(c.mix !== undefined) { //metric value
                                                addPair(c, row.vs[si], true);
                                            } else { //col headers
                                                addPair(xtab.model.getCellTitleInfo(c).title, c);
                                            }
                                            break;
                                        }
                                        // move the current column index forward
                                        colIdx += cs;
                                    }
                                }
                                
                                // reset "si" so that it won't highlight any row headers.
                                si = -1;
                            }
                            
                            //process row headers from leftmost
                            for(i = 0, iLen = rhc; i < iLen; i++) {
                                c = row.rh[i];
                                addPair(xtab.model.getCellTitleInfo(c).title , c, i == si);
                                
                                //stop at the selected cell
                                if (i == si){
                                    break;
                                }
                            }
                        }    
                        mks.push('<table class="content">');
                        
                        rows.unshift('<tr>', selectedPair[0], selectedPair[1], '</tr>');
                        if (pairCount > 4){
                            rows.push('<tr class="moreBtnRow"><td class="moreBtn" colspan="2">', mstrmojo.desc(8995, 'See all...'), '</td></tr>');
                        }
                
                        rows.push('<tr class="actionBtnsRow"><td colspan="2"><div class="drillBtn', (selCell.at & 1) ? '':' disabled', '">', 
                                mstrmojo.desc(145, 'Drill'), '</div><div class="linkBtn', (selCell.at & 4) ? '':' disabled','">', mstrmojo.desc(8149, 'Link'), '</div></td></tr>');
                        
                        mks.push(rows.join(''));
                        
                        mks.push('</table>');
                        
                        var div = document.createElement('div');
                        div.innerHTML = mks.join('');
                    
                        var table = div.firstChild, me = this;
                        
                        if (pairCount > 4){
                            table.className += ' hideMore';
                        }
                        
                        mstrmojo.dom.attachEvent(table, mstrmojo.dom.TOUCHEND, function(e){
                            var dom = e.target;
                            if (dom.className == 'moreBtn'){
                                table.className = table.className.replace(/hideMore/, '');
                                xtab.magnifier.updateContent();
                            }else if (dom.className == 'drillBtn' || dom.className == "linkBtn"){
                                me.createActionMenu(selCell, dom.className);
                                dom.style.backgroundColor = 'transparent';
                                dom.style.color = '#000';
                            }
                        });
                        
                        mstrmojo.dom.attachEvent(table, mstrmojo.dom.TOUCHSTART, function(e){
                            var dom = e.target;
                            if (dom.className == 'drillBtn' || dom.className == "linkBtn"){
                                dom.style.backgroundColor = '#33b5e5';
                                dom.style.color = '#333';
                            }
                        });
                        
                        return table;  
                    },
                    
                    /**
                     * create options for drill/link action.
                     */
                    createActionMenu: function(cell, at){
                        var xtab = this.xtab,
                            c = xtab.magnifier.containerNode,
                            f = c.firstChild,
                            l = c.lastChild,
                            div, ss = '',
                            title = (at == 'linkBtn') ? mstrmojo.desc(8996, 'Link to:') : mstrmojo.desc(8997, 'Drill to:');
                        
                        
                            div = document.createElement('div');
                            div.className = 'actionMenu';
                            if (at == 'linkBtn'){
                                var lInf = xtab.model.getCellLinksInfo(cell);
                                for (var i = 0, len = lInf.links.length;i < len;i++){
                                    ss += '<div class="linkTo" lnk="' + i + '">'+ lInf.links[i].n + '</div>';
                                }
                            }else if (at == 'drillBtn'){
                                ss += '<div class="drillTo">' + xtab.model.getCellDrillsInfo(cell).n + '</div>';
                            }
                            div.innerHTML = ss;
                            
                            
                            mstrmojo.dom.attachEvent(div, mstrmojo.dom.TOUCHEND, function(e){
                                var dom = e.target;
                                if (dom.className == 'linkTo'){
                                    mstrApp.closeAllDialogs();
                                    xtab.controller.onLink(xtab, xtab.model.getLinkAction(cell, dom.getAttribute('lnk')));
                                }else if (dom.className == 'drillTo'){
                                    mstrApp.closeAllDialogs();
                                    xtab.controller.onDrill(xtab, xtab.model.getDrillAction([cell]));
                                }
                            });
                        
                        if (l.className != 'actionMenu'){
                            c.appendChild(div);
                        }else{
                            c.replaceChild(div, l);
                        }
                        l = div;

                        f.style.display = 'none';
                        xtab.magnifier.set('title', title);
                        
                        //This is a hack to allow tapping on BACK button to go back to the info viewer rather than close the entire dialog.
                        mstrApp.showDialog({
                            scriptClass: 'mstrmojo.Widget',
                            markupString: '',
                            close: function(){ //would be invoked by mobileApp.closeDialog
                                f.style.display = 'table';
                                l.style.display = 'none'; 
                                xtab.magnifier.set('title', mstrmojo.desc(8994)); //'Info Viewer'
                                this.onClose();
                                this.destroy();
                            }
                        });
                    }
                };
        }
    };
}());