(function(){

    var AUTO_TR = '<tr>';
    var TBL_MKP_START = ['<table cellspacing="0" cellpadding="0" style="table-layout:', null, 
                                                   ';width:', null, 
                                                   ';mstr-tablestyle-slot" ', null, 
                                                   '>', null, 
                                                   '<tbody>'];
    var NBSP = "&nbsp;";
    var STITCH_TOP_CSS = "fsbp_1 ";
    var STITCH_MIDDLE_CSS = "fsbp_2 ";
    var STITCH_BOTTOM_CSS = "fsbp_3 ";
    var STACK_TOP = 1,
        STACK_MIDDLE = 2,
        STACK_BOTTOM = 3,    
        NO_STACK = 4,
        FULL_STACK = 5,
        STACK_CSS = {
        1: ' stack-top',
        2: ' stack-middle',
        3: ' stack-bottom',
        4: ' no-stack',
        5: ' stack-full'
    };

    var $CSS = mstrmojo.css;
    
    var BASEFORM_PICTURE = 4;

    /**
     * The function stitch the cells in the last block of data
     * @param {Array} cells the array holding the locations of the cells that needs to be stitched
     * @param {DOMNode} tbody The tobody which has the last rows to be stitched
     */
    function stitchBottomCells(cells, tbody) {        
        for(var i=0, iLen = cells.length; i < iLen; i++) {
            var c = cells[i];
            var d = tbody.rows[c.rows].cells[c.cells];
            if(d) {        
                mstrmojo.css.addClass(d, STITCH_TOP_CSS);
            }
        }
        
    }    
    
    mstrmojo.requiresCls(
            "mstrmojo.Widget");

    mstrmojo.GridBase = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins.
        null,
        
        // instance methods
        {
            scriptClass: "mstrmojo.GridBase",
            
            // Note - this can be overriden in the widgets extending this one e.g. XtabZone. 
            markupString: '<span id="{@id}" class="mstrmojo-Grid {@cssClass}" style="{@cssText}"></span>',
           
            markupSlots: {
                gridContainerNode: function(){ return this.domNode; }
            },
            
            /**
             * AutoFitWindow - This property represents whether auto fit to window is set ON for the Table.
             * The value should be set by the parent container (e.g. Xtab, SelectorControl). 
             */            
            autoFitWindow:false,

            /**
             * This property represents the fixed layout to use (auto or fixed). For Xtabs, we would typically figure out the value using col widths collection, however
             * for cases like Selector Controls the caller may want to force the layout (e.g. Auto when ItemWidthMode is set to Proportional).  
             */            
            tableLayout:null,
            
            /**
            for xtabs, titles & colHeaders zones are not rendered with fixed height. So, we check (and cache) from the CP - number of initial rows that need to be rendered in auto height mode.
            */  
            numAutoHeightRows:0,

            /**
            * This property represents the content provider for this zone.
            */
            cp:null,
            
            /**
            * Row count of this zone. Typically read from the content provider & cached
            * locally for quick lookup.
            */
            rc:0,
            
            /**
            * Column count of this zone. Typically derived from content provider's column
            * widths array & cached locally for quick lookup.
            */
            cc:0,
            
            /**
            * Column widths array. Typically read from the content provided & cached
            * locally for quick lookup.
            */
            cws:null,
            
            /**
             * Row height for every row of this zone. Typically read from content provider
             * and cached locally for quick lookup.
             */
            rh:null,

            /**
             * The total width of all the coloumns in a particular zone.
             */
            totalColWidth: 0,

            /**
             * Index of the Start row to render. 
             */
            start:0,
            
            /**
             * Index of the End row to render. 
             */
            end:0,
            
            forceFixedSizes:true,
            
            /**
             * A map contains the groups of the domNodes that have been highlighted and the positions of the cells that need
             * to be hilighted
             */
            hiliteCellsMap: null,
            
            /**
             * A map contains the extra info and the cell position that contains the extra info
             */
            eiMap: null,

            /**
             * Called from constructor.
             */
            init: function init_Grid(/*Object?*/ props) {
                // Apply the superclass constructor first.
                this._super(props);
            },
            
            /**
             * A number passed by Xtab to identify how many columns the grid can have. The
             * value is used to exclude the cells (such as value cells to be merged)
             */
            numColumnCanMerge: 0,            
            
            /**
             * Preps content provider and caches some commonly-used content provider
             * properties (after null-checking).
             */
            preBuildRendering: function preBuildRendering(res) {
                var cp = this.cp;
                if(!cp) {
                    return;
                }
                cp.initContent();
                this.rc = cp.rc || 0;           // Row count.
                this.cws = cp.colWidths || [];  // Column widths array.
                this.cc = this.cws.length;              // Column count.
                
                this.start = 0;
                this.end = this.rc - 1;

                // for xtabs, titles & colHeaders zones are not rendered with fixed height. So, we check (and cache) from the CP - number of initial rows that need to be rendered in auto height mode.  
                this.numAutoHeightRows = cp.getNumAutoHeightRows && cp.getNumAutoHeightRows() || 0;

                this.hiliteCellsMap= {};                
                this.eiMap= {};
                this.posMap = [];
                this.thPosMap = [];
                
                //initial the totalColWidth
                this.totalColWidth = 0;
                
                // trigger the parent's prebuild rendering. 
                //return this._super(res);
            },

            /**
             * Extends the widget's buildRendering method in order to first build a "tableHtml" string
             * from the widget's data and store the string in a widget property,
             * which can then be applied to the rendering.
             */            
            buildRendering: function buildRendering(res) {
                // The inherited method will do the actual DOM construction.
                var ret = this._super(res);

                this.renderGrid();
                
                return ret;
            },

            /**
             * This is the main method that renders the Grid Table. It builds the table at the position specified by top, left.
             * @param {Boolean} [append] If the append flag is set to be true, the give rows [start, end] will be rendered into a tbody and append to the grid container.
             * Otherwise, the grid data will replace the whole content in the grid container.
             */
            renderGrid: function renderGrid(append) {
                // Which node should the Grid Table reside in ?.
                var containerNode = this.getGridContainer();
                
                // extensions for subclasses to override
                this.preBuildGridTable();
                
                // build the grid table.
                this.buildGridTable(containerNode, append);
                
             // extensions for subclasses to override
                this.postBuildGridTable();
            },
            
            /**
             * This builds a DOM Container node that will host the Grid HTML. Since we would be rendering tableHTML for some on demand cases, this API abstraction would help avoid having to overwrite innerHTML as we 
             * build new tableHTMLs on demand. Note that in IE, we cannot change innerHTML table - otherwise we may be able to avoid this container node. 
             */
            getGridContainer: function getGridContainer() {
                return this.gridContainerNode;
            },
            
            
            /**
             * Constructs the Grid Table. .
             */
            buildGridTable: function buildGridTable(/* DomNode */ gridContainer, /* Boolean */append) {
                // build the table start markup (<table ...><colgroup>....</colgroup><tbody>)
                var tms = this.getTableStartMarkup();
                
                // build the table end markup (</tbody></table>)
                var tme = this.getTableEndMarkup();
                
                // set mergeHdrsAcrossBlks flag to notify merging headers when building table
                if(append) {
                    this.mergeHdrsAcrossBlks = true;
                }                
                
                // finally build the table rows markup. The APIsupports prefix and suffix which we will use to concatenate the tableStart and tableEnd markups above.  
                var tInnerHTML = this.buildTableRowsMarkup(this.start, this.end, tms, tme).join('');
                
                if(append) {
                    // Create the HTMLElement from html fragment.
                    var creationContainer = document.createElement('div');
                    creationContainer.innerHTML = tInnerHTML;

                    var cn = gridContainer.firstChild,
                        tBodies = cn && cn.tBodies,
                        ntBody = creationContainer.firstChild.tBodies[0],
                        mh = this.matchedHdrsAcrossBlks; 
                    
                    cn.appendChild(ntBody);
                    
                    if(mh && mh.length > 0) {
                        stitchBottomCells(mh, tBodies[tBodies.length - 2]);
                    }
                } else {
                    // Replace the container HTML. 
                gridContainer.innerHTML = tInnerHTML; 
                }
            },
            
            getTableStartMarkup : function _bldTableSMkp() {
                // get the grid column widths
                var gw = this._getGridWidths(),
                       mkp = TBL_MKP_START;
                
                mkp[1] = gw.tableLayout;
                
                mkp[3] = gw.totalColWidths;
                
                // since we render <table> within <table> (Xtab-Table::XtabZone-Tables), some of the CSS properties from outer table don't get inherited e.g. border, padding. This is
                // a way to accomplish that - pass on the css class to inner tables. 
                mkp[5] = this.tableCssClass ? "class=" + this.tableCssClass : '';
                
                mkp[7] = '<colgroup>' + gw.colgroup + '</colgroup>'; 
                        
                if(this.tbodyStyle) {
                    mkp[8] = '<tbody style="' + this.tbodyStyle + '">';
                }
                return mkp.join('');
            },

            getTableEndMarkup : function _bldTableEMkp() {
                return '</tbody></table>';
            },

            /**
             * Returns a JSON Object that includes grid column widths related information. 
             * {
             *     totalColWidths: String               // total of the column widths
             *     colgroup:String                                 // col group String for the table HTML
             *     tableLayout:String                           // table layout based on settings, colwidths. 
             * }
             */
            _getGridWidths : function _initGridWidths() {
                var gw = {};
                
                // Replace the tableContainerNode's HTML with a row-less table.
                var totalColWidths = '',
                    colgroup = [],
                    tl='fixed',
                    cws = this.cws,
                    cols = cws.length;

                if (cols) {
                    totalColWidths = 0;
                    colgroup = [];
                    // TQMS 395589: for IE7, the column width value setting on col tag is normally smaller than the expected column width.
                    // Using percentage in column width for IE, we can get expected column width.
                    for (var i=0; i<cols; i++) {
                        if(cws[i].w !== "") {
                            totalColWidths += parseInt(cws[i].w, 10);
                        }
                    }
                    
                    for (i=0; i<cols; i++) {
                        var width = cws[i];
                        if(width.w !== "") {
                            // update the total.
                            var w = parseInt(width.w, 10);

                            // add col group string.
                            if (mstrmojo.dom.isIE7) {
                                if(w === 0) {
                                    colgroup.push('<col style="width:0%;display:none"></col>');
                                } else {
                                    colgroup.push('<col style="width:' + (w / totalColWidths * 100) + '%"></col>');
                                }
                            } else if (mstrmojo.dom.isWK && w === 0) {
                                //Bug with Webkit browsers causes it to mess up the grid widths if set to 0. Small values such as 0.0001px and the likes don't work either. 
                                //So, I've set the col width to -1px.
                                colgroup.push('<col style="width:-1px"></col>');
                            } else {
                                colgroup.push('<col style="width:' + width.w +'"></col>');
                            }
                        } else {
                            colgroup.push('<col />');
                            // if any of the widths is not fixed, grid needs to be rendered in auto mode. 
                            tl = 'auto';
                        }
                    }
                    
                    //Cache the value of the total col widths in a class property
                    this.totalColWidth = totalColWidths;
                }
                
                //425393
                // update our gridWidths object. 
                gw.colgroup = colgroup.join('');
                
                // do we have a tableLayout set ? If yes, use that otherwise, use the value derived through the column widths iteration above. 
                tl = this.tableLayout || tl;  
                
                if(this.autoFitWindow) {
                    // Xtabs render in 'fixed' mode for this setting. So, unless the setting is forced (using tableLayout), use 'fixed'.   
                    tl = this.tableLayout || tl || 'fixed';
                    totalColWidths = '100%';
                } else if(tl == 'fixed') {
                    totalColWidths += 'px';
                } else {
                    totalColWidths = 'auto';
                }
                
                // update our gridWidths object. 
                gw.totalColWidths = totalColWidths;
                gw.tableLayout = tl;

                return gw;
            },
            
            
            /**
             * Array of static string parts that comprise the HTML for a table cell.  Dynamic parts are left as null.
             * They are populated at run-time as each cell is rendered by the method _buildRowsMarkup. 
             */
            //_CELL_MARKUP: ['<td style="overflow:hidden;white-space:nowrap" rowSpan="', null, '" colSpan="', null, '" class="', null, '" ei="',null, '">', null, '</td>'],
            _CELL_MARKUP: ['<td rowSpan="', null, '" colSpan="', null, '" class="', null, '" ei="',null, '" style="', null, '" r="', null, '">', null, '</td>'],
            
            /**
             * Generates the HTML string for a block of rows starting at the given row index.
             * Since the HTML String can be long and string concatenation can be slow, we avoid doing
             * concatenations here by returning an array of small strings.  The caller
             * function can then do an Array.join('') to build the result String when desired.
             * As an optimization, we support an optional "markup" Array argument. If given, this
             * array will be appended to with the HTML string pieces; otherwise a new array is constructed.
             * This argument allows us to support a performance optimization whereby, for the first block of
             * rows rendered, we do NOT set the innerHTML of a temporary <div> but rather of the actual
             * XtabZone's tableContainerNode itself!  
             */
            buildTableRowsMarkup: function _buildRowsMarkup(/*Integer*/ start, /*Integer*/ end, /*String?*/ markupPrefix, /*String?*/ markupSuffix) {
                // Have we been given a string with the markup for the <table> & <tbody> tags?
                // If not, generate our own such string. If so, start our markup with it, and assume it
                // has a <table..> & <tbody> in it; otherwise, start the markup with a plain "<table><tbody>" string.
                // This assumption works because the argument is only ever supplied by our _buildTableMarkup method, 
                // which does indeed create the <table> and <tbody> strings.
                var markup = [],
                    i = 0;
                markup[i++] = markupPrefix || '<table><tbody>';

                // Cache handle to content provider for frequent usage.
                var cp = this.cp,
                    // Use the content provider's row height by default
                    rh = cp.getRowHeight(),
                    // Cache HTML string pieces for each <td>.
                    TD = this._CELL_MARKUP,
                    // Cache HTML string for each <tr> [assumes they'll all share the same height].
                    TR = rh ? '<tr style="height:' + (rh ? rh + 'px' : '') + '">' : AUTO_TR;
                            
                // For each row to render...
                var firstRow = true, 
                    lastMatched = true, 
                    nlr = [], rhi; //the row headers that can across blocks
                
                this.matchedHdrsAcrossBlks = [];
                            
                for (var r = start; r<=end; r++) {
                    //save markup <tr> index
                    rhi = i++;
                    // Append the <tr> tag. If the row index is less than the number of auto height rows configured, we use the TR markup without row height. 
                    markup[rhi] = r < this.numAutoHeightRows ? AUTO_TR : TR;
                    var cells = cp.getRowCells(r);

                    // What is the maximum rowspan a cell can have
                    var maxRowspan = end + 1 - r;
                    
                    var umCellsLen = 0;
                    //stitch Top always assume that the top row has all the elements
                    if(!this.mergeHdrsAcrossBlks) {
                    // Starts stitching the first row when 1. not the first page 2. there some cells missing (cell number < column number)  
                    if(firstRow && start > 0 && cells.length < cp.colWidths.length) {
                        // Get the missing cells from content provider
                        var umCells = cp.getUnmergedCells(start);
                        if (umCells) {
                            umCellsLen = umCells.length;
                        }
                        for(var j in umCells) {
                            var p = umCells[j]; 
                            // Does the rowspan of the cell exceeds the maximun rowspan?
                            if(p.rs > maxRowspan) { // Yes, we need to truncate the row in the generated markup string                                 
                                TD[1] = maxRowspan;
                                // Apply the stitch middle css
                                TD[5] = STITCH_MIDDLE_CSS + p.css; 
                            } else { // No, we set the rowspan of the cell to its original value
                                TD[1] = p.rs || 1; //bottom
                                // Apply the stitch bottom css
                                TD[5] = STITCH_BOTTOM_CSS + p.css; 
                            }
                            if(p.cet) {
                                TD[5] += " mstrmojo-selected-cell";
                                this.addHilitePosition(p.cet, r, j);
                            }
                            if(p._ei) {
                                this.addExtraInfoMap(p._ei, r, j);
                                TD[5] += " pt";                                
                            }
                                TD[9] = "";
                                TD[13] = NBSP;
                            TD[3] = p.cs;
                            TD[7] = p._ei !== undefined ? p._ei : "";;
                            
                            markup[i++] = TD.join('') ;
                        }
                        firstRow = false;
                    }                        
                    }
                    
                    for (var c=0, len=cells.length; c<len; c++) {
                        var cell = cells[c], rt;
                        if(cell.rs && cell.rs > maxRowspan) {
                            TD[1] = maxRowspan;
                            TD[5] = STITCH_TOP_CSS + cell.css;
                            if(cell._ei) {
                                this.addExtraInfoMap(cell._ei, r, c);
                            }  
                            
                        } else {
                            TD[1] = cell.rs || 1;
                            // todo: is xtab-td really required?
                            TD[5] = cell.css + (cell.rowType === STACK_TOP ? "" : " xtab-td ");
                        }
                        if(cell.cet) {
                            TD[5] += "sc_" + this.parent.k;
                            this.addHilitePosition(cell.cet, r, c);
                        }
                        
                        rt = cell.rowType;
                        if(rt) {
                            //set css for the stacked row cells
                            TD[5] += STACK_CSS[rt] || '';
                            //row height for speical rows, most likely the Interactive Grid rows
                            var srh = cp.getRowHeight(rt);
                            if(srh) {
                                markup[rhi] = '<tr style="height:' + (srh ? srh + 'px' : '') + '">';
                            }                            
                        }
                        
                        TD[3] = cell.cs || 1;
                        // extra info ? Typically for interactivity e.g. Drilling, Selector Controls. 
                        TD[7] = cell._ei !== undefined ? cell._ei : "";
                        
                        if (cell.fs || cell._e){
                            this.addTitleHeaderPositionMap(r, c + umCellsLen, cell);
                        }
                        
                        if (cell._ei != null){
                            this.addPositionMap(cell._ei, r, c + umCellsLen);
                        }
                        
                        TD[11] = r;
                        if(cell.ts === BASEFORM_PICTURE) {
                            
                            // if we can use image cache
                            // imgCacheMap object contains:
                            // baseURL: the base URL of the image. The absolute url of the image will be the baseURL + the imageName
                            // cachedImg: an map stores the map from original url to cahced image name
                            // unCachedImg: an array stores the images that are not previously cached
                            
                            /** used for mojo grid 
                            if(this.imgCacheMap) {
                                var m = this.imgCacheMap;
                                if(m.cachedImg[cell.v]) {
                                    cell.v = m.baseURL + m.cachedImg[cell.v];
                                } else {
                                    if(this.unCachedMap && !this.unCachedMap["'" + cell.v + "'"]) {
                                        this.unCachedMap["'" + cell.v + "'"] = true;
                                        m.unCachedImg.push(cell.v);                                     
                                    }                                   
                                }                                
                            }**/
                            
                            var imgUrl = cell.v;
                            //Used for iPhone mojo document
                            if(this.imgCacheMap) {
                                var m = this.imgCacheMap,
                                    v = imgUrl && imgUrl.replace(/\\/g, '/');
                                
                                if(m.cachedImg[v]) {
                                    cell.v = imgUrl = m.baseURL + m.cachedImg[v];
                                } else {
                                    if(v && !m.unCachedImg[v]) {
                                        //this.unCachedMap["'" + v + "'"] = true;
                                        m.unCachedImg[v] = v;                                     
                                    }                                   
                                }                                
                            } else {
                                var ds = this.parent && this.parent.controller && this.parent.controller.model && this.parent.controller.model.dataService;
                                if ( ds && ds.getImage ) {
                                    imgUrl = ds.getImage(imgUrl);
                                }
                            }
                        
                            // For all cells with a row type (no stack, top, bottom, full stack) we want to add a div and an image tag.
                            if(cell.rowType) {
                                var height = (cp.stackedRh || cp.rh || rh),
                                    fsHeight = cp.getRowHeight(FULL_STACK);
                                TD[13] = '<div><div style="top:' + (-parseInt(fsHeight/2, 10)) + 'px;height:' + height + 'px;line-height:' + height + 'px;">&nbsp;<img style="height:' + height + 'px;" src="' + imgUrl + '"></img></div></div>';
                            // Is this a lock headers case?
                            } else if (this.parent.gridData.lhv) {
                                // Insert threshold image as a background since table layout is fixed.
                                TD[9] = "background-image:url('" + imgUrl + "');background-repeat:no-repeat;background-position:center top";
                                TD[13] = NBSP;
                            } else {
                                // Insert threshold image as an <img> tag since table layout is not fixed.
                                TD[9] = '';
                                TD[13] = '<img src="' + imgUrl + '"></img>';
                                //The <span> tag is only added for the cells with clickable text(LINK/DRILL/SELECTOR actions) so that we can 
                                //know whether user wants to select this cell or perform the default action on it.
                                if (cell.css && cell.css.indexOf('hl') > -1){
                                    TD[13] = '<span>' + TD[13] + '</span>';
                                }
                            }
                            
                        } else {
                            TD[9] = "";
                            //TQMS 433770 if empty cell, we need &nbsp;. Otherwise the row with only empty cells will shrink. 
                            TD[13] = cell.v || cell.n || NBSP;
                            //The <span> tag is only added for the cells with clickable text(LINK/DRILL/SELECTOR actions) so that we can 
                            //know whether user wants to select this cell or perform the default action on it.
                            if (cell.css && cell.css.indexOf('hl') > -1){
                                TD[13] = '<span>' + TD[13] + '</span>';
                            }
                        }
                        
                        // if grid can have merged cells across blocks, we should found out those cells
                        // numColumnCanMerge is used for identify the cells we need to check
                        // for unmerged header case, the numColumnCanMerge will be 0
                        if(c < this.numColumnCanMerge) { 
                            // if we are at the top of the block, for the cells, the cells that match to the row headers in previous block should be 
                            // 1. remove the up border
                            // 2. set the content to be empty string
                            if(r === start && this.mergeHdrsAcrossBlks) {
                                var lr = this.rowHdsAcrossBlks;
                                //lastMatched flag is used to stop the unnecessary comparisons 
                                //if we already find any cell that is not match, we should not continue going through all the following cells
                                // because those cells cannot be merged
                                if(lastMatched && cell.v && lr && lr[c]) {
                                    if(cell.v === lr[c].v) { // find the cell that can be merged
                                        TD[1] = cell.rs || 1;
                                        TD[5] = STITCH_BOTTOM_CSS + cell.css;
                                        TD[13] = "";
                                        // push the found cell to the matchedHdrsAcrossBlks array
                                        // the array will be used to merge the headers in previous rendered tbody
                                        this.matchedHdrsAcrossBlks.push(lr[c]);
                                    } else {
                                        lastMatched = false;
                                    }
                                } 
                            }                        
                            
                            if(TD[1] >= maxRowspan && cell.v) { // last row
                                nlr.push({rows: r-start, cells: c, v:cell.v}); 
                            }
                        }
                        markup[i++] = TD.join('');
                    }
                    // Append the </tr> tag.
                    markup[i++] = '</tr>';
                }                 
                
                // Append the </tbody></table> tags.
                markup[i++] =  markupSuffix || '</tbody></table>';
                
                // cache the row headers that can be across blocks
                this.rowHdsAcrossBlks = nlr;
                return markup;
            },

            addHilitePosition: function(key, row, cell) {
                var hm = this.hiliteCellsMap[key];
                if(!hm) {
                    this.hiliteCellsMap[key] = {pos: [], nodes: []};
                }
                this.hiliteCellsMap[key].pos.push({row: row, cell: cell, page: 0});                
            },
            
            addExtraInfoMap: function(ei, r, c) {
                if(!this.eiMap[ei]) {
                    this.eiMap[ei] = [];
                }
                this.eiMap[ei].push({row:r, cell:c, page: 0});                
            },
            
            addPositionMap: function(ei, r, c){
                //only remember the first cell that has the same _ei
                if(!this.posMap[ei]) {
                    this.posMap[ei] = {row:r, cell:c, page:0};
                }
            },
            
            addTitleHeaderPositionMap: function(r, c, o){
                this.thPosMap.push({row:r, cell:c, page:0, obj:o});
            },
            
            /**
             * Clear the highlight cells using the same group key
             * @param {String} key The group key used to group highlighted cells 
             */
            clearHilites: function(key) {
                //hilited cells
                var hc = this.hiliteCellsMap[key],
                    ns = hc && hc.nodes;
                
                if(ns) {
                    if (ns.length == 0 && hc.pos) {
                        ns = this.getNodesByPositions(hc.pos);
                    }
                    for(var i = 0, iLen = ns.length; i < iLen; i++) {
                        var nd = ns[i],
                            cn = nd.className;
                        $CSS.removeClass(nd, "sc_" + this.parent.k);                        
                    }
                    this.hiliteCellsMap[key].nodes = [];
                }
            },
            
            /**
             * Set the given node to be highlighted.
             * @param {String} key the key of the group
             * @param {DOMNode} the dom node that needs to be highlighted
             */
            setHilites: function(key, node) {
                $CSS.addClass(node, "sc_" + this.parent.k);
                
                if(!this.hiliteCellsMap[key]) {
                    this.hiliteCellsMap[key] = {pos:[], nodes:[]};
                }
                this.hiliteCellsMap[key].nodes.push(node);                
            },            
            
            /**
             * Get the cell dom node by using the row and column
             * @param {Object} pos A json object contains row and column
             */
            getNodesByPositions: function(/*JSON*/pos) {
                var tbl = this.tableNode,
                    arr = [];
                
                for(var i in pos) {
                    var v = pos[i];
                    arr.push(tbl.tBodies[0].rows[v.row].cells[v.cell]);
                }
                return arr;
            },
            
            preBuildGridTable : function preBuildGridTable() {
                //do nothing. 
            },

            /**
             * Sets the "tableNode" slot to the dynamically-generated data table HTML node.
             * For memory optimization, the "tableHtml" property is then deleted after the rendering is completed.
             */
            postBuildGridTable : function postBuildGridTable() {
                this.addSlots({tableNode: this.gridContainerNode && this.gridContainerNode.firstChild});
                //delete this.tableHtml;
            }
        }   // close - instance methods block.
    );
            
})();