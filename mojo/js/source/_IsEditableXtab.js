(function() {
    
    mstrmojo.requiresCls("mstrmojo.Button", "mstrmojo.XtabZone", "mstrmojo.DICFactory");
    
    /**
     * DataInput Type:
     * 1. Textbox
     * 2. Switch
     * 3. List
     * 4. Slider
     * 5. Calendar
     * 6. TimePicker
     */
    var TEXTAREA = 8,
        MARKROW = 102,
        
        TX_DEFAULT = 1, //transaction type: EnumDSSXMLRWNodeTransactionChangeType.DssXmlRWNodeTransactionChangeTypeDefault
        TX_MARK = 2, //transaction type: EnumDSSXMLRWNodeTransactionChangeType.DssXmlRWNodeTransactionChangeTypeMark
        EDIT = 32,
        $C = mstrmojo.css,
        $D = mstrmojo.dom,
        $H = mstrmojo.hash,
        $CFC = mstrmojo.DynamicClassFactory.newComponent,
        CP_TITLE = 1,  
        CP_COL_HEADERS = 2,
        CP_ROW_HEADERS = 4,        
        COL_AXIS = 2,
        TX_ELEM_ATT_FORM = 1,
        TX_ELEM_METRIC = 2,
        MARK_ROW = 1, //manipulation type for mark row
        CHANGE_DATA = 2, //manipulation type for grid cell change
        MR_MANIPULATION_UNSET = 1,
        MR_MANIPULATION_SELECT = 2,
        DATA_DRIVEN_CONTROL = 2,
        XTAB = 1,
        getGroupIdx = function(cell){
            if (cell){
                return cell.tui >= 0 ? ('h_' + cell.tui + '_' + cell.fi + '_' + cell.axis) : ('m_' + cell.mix);
            }
            return '';
        };

        //converting em, pt, etc. style value into px
        var convert2Px = function(dom, v) {
            if ($D.isIE && !/px$/.test(v)) {
                var img = document.createElement('img');
                img.style.zIndex = -1;
                img.style.left = v;
                
                dom.appendChild(img);
                
                //get the pixel value
                var pl = img.style.pixelLeft;
                dom.removeChild(img);
                
                return pl;
            }
            return parseInt(v, 10);
        };
        
    /**
     * Apply changes to the target cell
     * @param {Object} c Cell object including the values
     * @param {Integer} k The index of expected the node map
     * @param {Object} vo The new value object
     * @returns {Object} the DOMNode object of the target cell
     */
    function applyChange(c, k, vo) {
        var t = this.nm[k],
            v = vo.v,
            dv = vo.dv;
        
        c.rv = v;
        c.v = dv;
        c.mdf = 1;
        //if the cell has the reference to the unmerged cell, that means the cell is a copy of unmerged cell
        //we set the new value to the original unmerged cell so that when it is unmerged again, we can see the changes.
        if(c._src) {
            c._src.rv = v;
            c._src.v = dv;
            c._src.mdf = 1;
        }
        
        // retrieve the related input control widget attached with this grid cell
        var dicWidget = this.dicGroupMap[getGroupIdx(c)].widgetsMap[c._ei];
        
        // Update the cell content only if it's a popup dic without preview.
        if(!dicWidget.showByDefault) {
            if (dicWidget.hasPreview){
                dicWidget.renderPreview();
            }else{
                //TQMS 529617: In IE7, if the applied value is empty, the grid cell will lose its border.
                if ($D.isIE7 && mstrmojo.string.isEmpty(v)){
                    v = ' ';
                }
                t[t.innerText !== undefined ? 'innerText':'textContent'] = v;
            }
        }
        
        return t;
    }
    
    /**
     * Compare the row selections to find our whether there is a change in the row collection
     * @param {Object} cur_rs The current row selection collection
     * @param {Object} org_rs The original row selection collection
     * @returns {Array} An array of object which has row ordinal as key, and check or unchecked as value 
     */
    function findChangedMarks(cur_rs, org_rs) {
        var upd = [];
        $H.forEach(cur_rs, function(v, k) {
           if((v === 1 && org_rs[k] !== 1) || (v === -1 && org_rs[k] !== -1)) {
               upd.push({o: k, v: v});
           }
        });
        return upd;
    }
    
    /**
     * Check whether the row is on the total row or not. Return true if it is on total row.
     */
    function onTotalRow(cp, o, rs) {
        if(rs[o] === 0) {
            return true;
        } else if(cp && rs[o] === undefined) {
            try{
                var cells = cp.getRowCells(o), 
                    c = cells && cells[0];
                if(c && c.o === o) {
                    if(c.sst) {
                        rs[o] = 0;
                    }
                    return !!c.stt;
                } else if(c && c.o){
                    return onTotalRow(cp, o + o - c.o, rs);
                } else {
                    return false;
                }
            } catch(ex) {
                return false;
            }
        } else {
            return false;
        }
    }
    
    /**
     * Update selected rows
     * @param {Array} marked An array object contains a list of object describing which row is marked
     * @returns {Object} A map object contains the row ordinal as the name, and 1 as the value
     */
    function getSelectedRows(marked) {
        var rs = {};
        mstrmojo.array.forEach(marked, function(m) {
            rs[m.o] = 1; 
        });
        return rs;
    }

    mstrmojo._IsEditableGridCP = {

        _mixinName: "mstrmojo._IsEditableGridCP",
        
        initContent: function initContent(/* Integer */ startIndexInContainer) {
            this._super(startIndexInContainer);

            //if the grid is Interactive Grid, we need to change the 'vp' property to reflecting the newly added column
            //So we must change: 
            //1. for each attribute forms, change the idx to increase value 1 because the index is the column index used to find the attribute
            //2. insert a new column group property into the vp.cols.cg; As the cg is an object, we need to shift the existing items to the next slot by copying and replacing 
            //3. insert a column width property to the vp.cols.cws; The default width for the checkbox is set to be 60px.
            var gd = this.gridData,
                vp = gd && gd.vp, i, j, len, fm, size, cg, cl, cws, cw, rt;
            if(this.type === CP_ROW_HEADERS && vp && vp.cols && !vp._adjusted) {
                cg = vp.cols.cg;
                cws = vp.cols.cws;
                //for column group property
                if(cg && cg.cgc > 0) {
                    for(i = cg.cgc; i > 0; i--) {
                        
                        cg[i] = $H.copy(cg[i-1], {});
                        cl = cg[i];
                        fms = cl.attForms; 
                        if(fms) {
                            for(j = 0, size = fms.length; j < size; j++) {
                                fm = fms[j];
                                //increase index by one because we insert a new column
                                fm.idx += 1;
                            }
                        }
                    }
                    //new column group property
                    cg[0] = {tg: false, cc: 0, cl: 1, attForms: [{n: '', idx: 0}]};
                    //increase the column group count by one
                    cg.cgc += 1;
                }
                //add the column width for the new column
                if(cws) {
                    cws.splice(0, 0, {w: '60px', xc: true});
                }
                //increase default form action index by one
                if(vp.dafIdx !== undefined) {
                    vp.dafIdx += 1;
                }
                
                rt = gd.gts.row;
                for(i = 0, size = rt.length; i < size; i++) {
                    rt[i].ci = i + 1; //set column index
                }
                
                //only adjust once
                vp._adjusted = true;
            }
            
            //extra column
            this.colWidths = [{w: ''}].concat(this.colWidths);
            this.unmergedCells = [];
        },
        
        getUnmergedCells: function(ri) {
            return null;
        },

        getRowCells: function (/*Integer*/ ri) {
            var cells = this._super(ri),
                cell = cells[0], // start inspecting the first cell
                o = (cell && cell.o) || 0,
                isTtl = (this.tp === CP_TITLE),
                ics = this.interactiveCellsArray,
                fc = {css: '', v:''},
                umc = [], ncs = [], i, len;
            
            if(!isTtl) {
                var rows = this.base.items,
                    lb = this.lookupBase,
                    cssBase = this.gridData.css,
                    pi = cell && cell.pi, // get the parent index node
                    r = pi && pi.ri, // row number for the parent node
                    c = pi && pi.ci, // column number for the parent node
                    otr = cell.stt > 0;
                while(pi && r > -1 && c > -1) { //has left parent
                    cell = cell._p || rows[r].items[c];
                    //create a copy of unmerged cell
                    var _c = $H.copy(cell, {});
                    //save the reference of the unmerged cell
                    _c._src = cell;
                    if(!_c.css) {
                        _c.css = cssBase[_c.cni].n;
                    }
                    
                    var unit = lb[cell.tui],
                        e = unit && unit.es[cell.idx];
                    if (e) {
                        _c.v = cell.v || e.n; //we need to first check cell.v because the cell's v value has higher priority than the name of the look up element 
                        // if we found the element object for the cell, attach it to the cell too. This will be useful during actions (looking up element ID) - especially for cases where there are multiple grid data blocks. 
                        _c._e = e;
                    }
                    _c.rs = 1;
                    if (otr){
                        _c.at &= ~32;
                    }
                    if(o > -1) {
                        _c.o = o;
                    }
                    _c._ei = ics.push(_c) - 1;
                    umc.splice(0, 0, _c);
                    
                    // find the next parent
                    pi = cell && cell.pi;
                    r = pi && pi.ri;
                    c = pi && pi.ci;
                }

                for(i = 0, len = cells.length; i < len; i++) {
                    var nc = cells[i];
                    if(nc.rs > 1) {
                        var tc = $H.copy(nc, {});
                        tc.rs = 1;
                        nc = tc;
                    }
                    ncs.push(nc);
                }

            } else {
                ncs = cells;
                if (ri > 0) {
                    return cells;
                }
            }

            if(ncs[0]) {
                fc = $H.copy(ncs[0], {});
                fc.rv = fc.v = '';
                if(this.tp === CP_TITLE) {
                    fc.n = fc.v = '';
                    fc.markAll = true;
//                    fc._ei = -1;
                } else {
                    fc.n = '';
                }
                fc._ei = ics.push(fc) - 1;
                fc.at = 32;
                fc.cs = 1;
                fc.mark = true; // row mark flag
                fc.mix = 'x';
                delete fc.ui;
                delete fc.tui;
                delete fc.fs;
                delete fc.mdf;
            }
            
            return [fc].concat(umc.concat(ncs));
        }
    };
    
    /**
     * Editable grid widget.
     * 
     * @class
     * @extends mstrmojo.EditableXtab 
     */
    mstrmojo._IsEditableXtab = 
        {
            _mixinName: "mstrmojo._IsEditableXtab",
            
            /**
             * Update
             */
            update: function update(node) {
                var marks,
                    gd = node.data;
                
                if(this._super) {
                    this._super(node);
                }
                
                this.kc = {};
                this.rs = {};
                this._rs = {};

                //empty grid
                if(gd.eg) {
                    return ;
                }
                
                //empty grid
                if(gd.eg) {
                    return ;
                }
                
                //row marked info
                marks = node.data.marked;
                if(marks) {
                    this.rs = getSelectedRows(marks);
                    this._rs = $H.clone(this.rs);
                }
                
                if(!gd.rw) {
                    var rc = gd.gvs.items.length;
                    gd.rw = {row: {bb:1, bc:rc, tc:rc}, col:{bb:-1, bc:-1, tc:0}};
                }                
            },
            
            /**
             *  Overrides the super function in order to replace the Content provider with editable grid content provider
             * @private
             * @ignore
             */
            initCP: function initCP (/* GridJSON */ gd, /* Array */ interactiveCellsArray, /* Integer */ tp, /* JSONNode */ base, /* JSONNode */ lkpBase, /* Integer */ ax, /* ContentProvider */ cp) {     
                var props = {
                            gridData:gd,
                            type:tp,
                            interactiveCellsArray:interactiveCellsArray
                    };
                
                props.base = base || props.base;
                props.lookupBase = lkpBase || props.lookupBase;
                props.axis = ax || props.axis;
                props.dataSource = this;
                
                if(!cp) {
                    // are we in mark rows mode AND is the mode enabled ?  
                    if(this.tca === TX_MARK && this.editing) {
                        if(tp === CP_TITLE) {
                            mstrmojo.EditableXtabTitlesCP = $CFC(mstrmojo.XtabTitlesCP, [mstrmojo._IsEditableGridCP], {scriptClass: "mstrmojo.EditableXtabTitlesCP", tp: CP_TITLE} );
                            cp = new mstrmojo.EditableXtabTitlesCP(props);
                        } else if (tp === CP_ROW_HEADERS) {
                            mstrmojo.EditableXtabCP = $CFC(mstrmojo.XtabCP, [mstrmojo._IsEditableGridCP], {scriptClass: "mstrmojo.EditableXtabCP"} );
                            cp = new mstrmojo.EditableXtabCP(props);
                        } else {
                            cp = new mstrmojo.XtabCP(props);
                        }
                    }else {
                        if(tp === CP_TITLE) {
                            cp = new mstrmojo.XtabTitlesCP(props);
                        } else {
                            cp = new mstrmojo.XtabCP(props);
                        }
                    }
                } else {
                    $H.copy(props, cp);
                }       
                
                return cp;
            },
            
            /**
             * Gets the OnDemand CP
             * @ignore
             */
            createOnDemandCP: function(blockNum, rc, zone) {
                var cp;
                
                // are we in mark rows mode AND is the mode enabled ?  
                if(this.tca === TX_MARK && this.editing && zone === CP_ROW_HEADERS) {
                    mstrmojo.EditableXtabOnDemandCP = $CFC(mstrmojo.XtabOnDemandCP, [mstrmojo._IsEditableGridCP], {scriptClass: "mstrmojo.EditableXtabOnDemandCP"});
                    cp = new mstrmojo.EditableXtabOnDemandCP();
                } else {
                    cp =  new mstrmojo.XtabOnDemandCP();
                }
                
                cp.dataSource = this;
                cp.blockNum = blockNum;
                cp.rc = rc;
                return cp;
            },
            
            preBuildRendering: function preBldRndr() {
                var txi = this.defn.txi;
                
                if(this._super) {
                    this._super();
                }

                this.txar = txi.txar;
                //show changed icon
                this.sci = txi.sci;
                this.tca = txi.tca;
                
                // make sure editing is disabled, if tca doesn't support mark - rows
                if(this.tca !== TX_MARK) {
                    this.editing = false;
                }else {
                    if (mstrApp.isMobile){
                    // If mark-rows is enabled on android device, the check box should always be displayed.
                        this.editing = this.alwaysEditing = true;
                    }
                }
                //reset node DOM map each rendering time
                this.nm = {};
                this.ko = {};
                
                this.dicGroupMap = {};
                this.lastIndex = 0;
                this.lastHeaderIndex = 0;                
            },
            
            postBuildRendering: function pstBldRndr() {
                if(this._super) {
                    this._super();
                }

                //if empty grid or template is not default, render the expand button
                if(this.tca === TX_MARK && this.gridData.eg === undefined) {
                    var r = this.domNode.offsetWidth,
                        t = Math.max(-16, -this.domNode.offsetTop), //16 is the height of the button
                        me = this;
                    
                    if (!this.alwaysEditing){
                        var dn = mstrmojo.Button.newIconButton(mstrmojo.desc(8324, 'Mark rows'), 'mstrmojo-EditButton', function() {
                            me.editing = !me.editing;
                            me.refresh(); 
                        }),
                        btn = new mstrmojo.Button(mstrmojo.hash.copy({cssText: 'top:' + t +'px;'}, dn));
                        btn.render();
                        this.domNode.appendChild(btn.domNode);
                        
                        
                        if(this.editing) {
                            this.domNode.style.zIndex = 1000;
                            //this.viewport.onclick = null;
                            $C.addClass(btn.domNode, 'close');
                        } else {
                            $C.removeClass(btn.domNode, 'close');
                        }
                    }
                }
            },
            
            dataDownloadErr: function dataDownloadErr() {
                if(this.txar && this.recalculating) {
                    var z = this.zones;
                    if(z._BL) {
                        z._BL.isDownloading = false;
                    }
                    z._BR.isDownloading = false;
                    
                    this.rhsCP.initContent();
                    this.valuesCP.initContent();
                    
                    //clear the mask if any
                    $C.removeClass(this.maskNode, 'wait');
                    this.recalculating = false;
                }
            },
            
            dataDownloaded:function dataDownloaded(/* RWJSONDataNode */ node, /* Object */ memo) {
                var gd = node.data;
                if(this.txar) {
                    var idx = memo.blockNum, zn = this.zones, ica;
                    
                    if(this.recalculating) {                    
                        memo.recalculating = true;
                        this.interactiveCellsArray = [];
                        this.lastIndex = 0;
                        this.lastHeaderIndex = 0;                        
                        this.kc = {};
                        this.nm = {};
                        this.updatedCellsMap = {};
                        this.recalculating = false;
                        this.destroyDICs();
                    } else {
                        memo.recalculating = false;
                    }

                    //for the first block of data, we need to update the Xtab's gridData so that we can get the latest data when rerender the grid
                    if(idx === 0) {
                        this.gridData = gd;
                    }

                    //TQMS 511405 if fetches an empty grid, we will skip initializing the cp and refresh the xtab 
                    //to render an empty grid
                    if(gd.eg) {
                        this.refresh();
                        return;
                    }
                    
                    ica = this.interactiveCellsArray;
                    this.initCP(gd, ica, CP_TITLE, null, null, null, this.titlesCP);
                    this.initCP(gd, ica, CP_COL_HEADERS, gd.ghs.chs, gd.gts.col, COL_AXIS, this.chsCP);
                    this.titlesCP.initContent();
                    this.chsCP.initContent();
                                        
                    //TQMS 507486 Once we are doing the auto-recalculating, the interactive arrays is cleared.
                    //So the interactive cells on the headers can be lost if they are locked (especially for interactive grid).
                    //The headers needs to be re-rendered once we clear the interactive cells.
                    if(ica && ica.length === 0) {
                        if(zn._TR) {
                            zn._TR.refresh();
                        }
                        if(zn._TL) {
                            zn._TL.refresh();
                        }
                    }                
                }
                
                if(this._super) {
                    this._super(node, memo);
                }
                
                if(gd.marked) {
                    this.rs = getSelectedRows(gd.marked);
                    this._rs = $H.clone(this.rs);
                }
            },
            
            closeDownloadStatus: function() {
                if(this._super) {
                    this._super();
                }
                mstrmojo.css.removeClass(this._STATUS, 'recalculate');
            },
            
            
            /**
             * Key context map
             */
            kc: null,
            
            /**
             * Key context with row ordinal map
             */
            ko: null,
            
            /**
             * DOM node map
             */
            nm: null,
            
            /**
             * Row selection
             */
            rs: null,
            
            /**
             * created DICs.
             */
            dicGroupMap: null,
            
            /**
             * index of last processed editable cell in grid.posMap
             */
            lastIndex: 0,
            
            /**
             * index of last processed editable header in grid.thPosMap
             */
            lastHeaderIndex: 0,
            
            /**
             * Gets the data info object
             * @param {Object} cell
             * @param {Integer} r The row number
             * @returns {Object} The data input info object
             */
            getDataInputInfo: function(cell) {
                var k = cell._ei, o,
                    defn = this.node.defn,
                    data = this.node.data;
                
                if(cell.mark) {
                    o = cell.o;
                    if(cell.stt) {
                        this.rs[o] = 0; //set the row to be unmarkable
                        return ;
                    }
                    this.ko[o] = k;
                    cell.rv = cell.v = this.rs[o] || -1;
                    this.kc[k] = {rowop: true};
                    return {
                        key: k,
                        t: MARKROW,
                        vls: [{'v': -1},{'v': 1}],
                        wm: 1,
                        w: 22,
                        hm: 1,
                        h: 16,
                        dm: 1
                    };
                }
                
                var titleInfo = this.model.getCellTitleInfo(cell),
                    title = titleInfo && titleInfo.title,
                    es = title && title.es,
                    mti = (cell.mti !== undefined) ? cell.mti : cell.mix,
                    isMtx = (cell.mix !== undefined),
                    dic = defn.txi.dic,
                    elem, di;
                
                di = !isMtx ? dic.att && dic.att[title.id] && dic.att[title.id][title.fs[cell.fi].id] : dic.mtx && dic.mtx[es[mti].oid];
                
                if(!di) {
                    return null;
                }

                if(data.dcv && data.dcv[di.k]) {
                    di.vls = data.dcv[di.k];
                }
                
                // cache the title related information into key context map 
                if(k >= 0 && !this.kc[k]) {                    
                    var isMv = !cell.axis,
                        t = {
                            isMv: isMv 
                        };
                        
                    if(isMv) {
                        var pi = cell.pi,
                            tp = pi && pi.top;
                        t.co = (tp && tp.ci) || 0;
                        t.metric_id = es[mti].oid;
                        cell.o = t.o = (cell._lp && cell._lp.o) || 0; 
                        t.tp = TX_ELEM_METRIC;
                    } else {
                        t.ax = cell.axis;
                        t.atid = title.id;
                        t.form_id = title.fs[cell.fi].id;
                        t.o = cell.o;
                        t.tp = TX_ELEM_ATT_FORM;
                        t.fi = cell.fi;
                        t.ui = cell.ui;
                        t.tui = cell.tui;
                        t.rs = cell.rs;
                    }
                    
                    t.dt = di.dt;
                    if(di.ipt === DATA_DRIVEN_CONTROL) {
                        t.vls = di.vls;
                        t.k = di.k;
                    }                    
                    
                    this.kc[k] = t;

                }

                di.key = k;
                
                if(di.dm) {
                    di.dm = parseInt(di.dm, 10);
                }
                
                return di;
                
            },

            isEditableHeader: function(cell) {
                var defn = this.node.defn,
                    dic = defn.txi.dic;
                
                if(cell.sst || !dic) {
                    return false;
                }
                
                if(cell.id !== undefined && dic.att) { //attribute
                    return !!(dic.att[cell.id] && (cell.fix ? dic.att[cell.id][cell.fid] : dic.att[cell.id]));
                } else if(cell.tui !== undefined && cell.mix !== undefined && dic.mtx) { //column header
                    return !!(dic.mtx[cell._e.oid]);
                } else {
                    return false;
                }              
            },            
            
            /**
             * Once the data changed, we save the target DOM into node map
             */
            dataChanged: function(k, r, v, d) {
                if(d) {
                    this.nm[k] = d;
                }
                
                if (this._super){
                    this._super(k, r, v, d);
                }
            },
            
            /**
             *  Applies the new value to the grid data
             *  @param {Integer} k The key of the interactiveCellsArray
             *  @param {Object} v The new value object
             *  @returns {Boolean} True if the grid needs to be refreshed, otherwise returns false
             */
            updateValue: function(k, vo) {
                if (this._super){
                    this._super(k, vo);
                }

                var c = this.interactiveCellsArray[k],
                    v = vo.v,
                    t;
                this.lmr = null; //clear the last marked row always.
                
                if(c.v === v) {
                    //nothing changed since last update
                    return ;
                }
                
                t = applyChange.call(this, c, k, vo);
                if(c.r !== v) {
                    if(!c.mark) {
                        this.flagDirtyUnit(t);
                    }
                } else {
                    this.clearDirtyUnit(t);
                }
                
                // if the template has Mark-rows enabled, we should mark the rows if any cell get changed
                if(this.tca === TX_MARK) {
                    //is the change from row marker checkbox? 
                    if(c.mark) { //yes, we should use the current checkbox value  
                        this.rs[c.o] = v;
                        this.lmr = {r: c.o, v: v}; //last marked row
                    } else { //no, we need mark the row as selected.
                        if(this.rs[c.o] !== 0) {                            
                            this.rs[c.o] = 1;
                        }
                        //if the row span of the cell is more than 1, we need mark all the rows within the span
                        //we do this only when the xtab is collapsed
                        if(!this.editing && c.rs > 1) { 
                            var o = c.o + 1;
                            while(o - c.o < c.rs) {
                                if(!onTotalRow(this.rhsCP, o, this.rs)) {
                                    this.rs[o] = 1;
                                }
                                o += 1;
                            }
                        } 
                        if(this.editing && !this.txar) {
                            var w = this.dicGroupMap['m_x'].widgetsMap[this.ko[c.o]];
                            if(w) { 
                                w.set('checked', true);
                            }
                        }
                    }
                }
                
                //check whether auto refresh is enabled. If it is, we should execute the auto refresh code (set invalid pages, call onscroll etc) except for one case 
                //that is, if the user check/uncheck the row marker checkbox, we should not auto refresh.
                if(this.txar && !c.mark) {
                    return true;
                }
                
                return false;
            },
            
            autoRefresh: function autoRefresh() {
                //notify pages to re-download blocks
                var z = this.zones;
                if(z._BL) {
                    z._BL.invalidAllPages();
                }
                z._BR.invalidAllPages();
                //invalid row headers and values
                this.rhsCP.invalid();
                this.valuesCP.invalid();
                                    
                //set new css to disable the previous status bar been displayed
                $C.addClass(this._STATUS, 'recalculate');
                
                //trigger _BR onscroll to fetch new data
                z._BR.onscroll(true); //set the mask
                this.recalculating = true;
            },

            /**
             * Get the cached update related title information object
             * @param {Integer} The key of the interactiveCellsArray
             * @returns {Object} An object contains title information such as column number, ordinal, metric id, form_id etc
             */
            getKeyContext: function(key) {
                return this.kc[key];
            },
            
            /**
             * Returns the transaction updates in JSON object. The object is used for task parameters
             * @returns {Object} Transaction update object.
             */
            getUpdateObject: function getUpdateObject() {
                var cs = [], j, udvs, udv, lmr = this.lmr;
                
                if(lmr) { //row marked? 
                    //TQMS 518625 and 518622 clear the last marked row so that mark row requests will not be sent repeatedly. 
                    this.lmr = null;
                    return {
                        manipulation: MARK_ROW,
                        actionType: (lmr.v === -1) ? MR_MANIPULATION_UNSET : MR_MANIPULATION_SELECT,
                        rowOrdinal: lmr.r, //always use the first item since we can only have one marked row change at a time
                        nodeKey: this.k,
                        sliceId: this.sid
                    }; 
                } else { // data cell changed?
                    udvs = this.getUpdatedValues();
                    udv = udvs && udvs[0];
                    if(udv) {
                        //encode the value, convert it to string
                        var v = mstrmojo.string.encodeXMLAttribute(String(udv.v));
                        if(!!udv.isMv) {
                            cs.push({
                                rowOrdinal: udv.o,
                                colOrdinal: udv.co,
                                newValue: v,
                                dataType: udv.dt
                            });
                        } else {
                            var i, len;
                            for(i = 0, len = parseInt(udv.rs) || 1; i < len; i++) {
                                cs.push({
                                    rowOrdinal: udv.o + i,
                                    attId: udv.atid,
                                    formId: udv.form_id,
                                    unitIndex: udv.tui || udv.ui, //AE binary still needs this parameter
                                    newValue: v,
                                    dataType: udv.dt
                                });
                            }
                        }
                    }
                    
                    return {
                        manipulation: CHANGE_DATA,
                        nodeKey: this.k,
                        sliceId: this.sid,
                        cells: cs,
                        //TQMS501190 set the autoRefresh to be true to trigger the binary side recalculation
                        autoRefresh: true
                    };
                }
            },
            
            /**
             * Gets the update xml for the Xtab
             * @returns {String} update XML string
             */
            getUpdates: function() {
                var w = this, i, len, j, udv,
                    udvs = w.getUpdatedValues(),
                    srs = findChangedMarks(this.rs, this._rs),                    
                    eg = [], gd = [], udt = false;
                
                
                eg.push('<gr rw_tree_type="' + w.treeType + '" rw_node_key="' + w.k + '" slice_id="' + w.sid + '">');
                for(j in udvs) {
                    if(udvs.hasOwnProperty(j)) {
                        udv = udvs[j];
                        if(!udv.rowop) {
                            //encode the value, convert it to string
                            var v = mstrmojo.string.encodeXMLAttribute(String(udv.v)),
                                k = '';
                            
                            //DDIC controls, we need pass element id for selection
                            if(udv.k && udv.vls) {
                                var m = mstrmojo.array.find(udv.vls, 'v', udv.v);
                                k = 'rw_control_key="' + udv.k + '" element_id="' + udv.vls[m].eid +'" ';
                            }
                                
                            if(!!udv.isMv) {
                                gd.push('<cli cordinal="' + udv.co + '" metric_id="' + udv.metric_id + '"><updt types="' + udv.tp + '" rordinal="' + udv.o + '" ' + k + 'value="' + v + '" dt="' + udv.dt + '"/></cli>');
                            } else {
                                for(i = 0, len = parseInt(udv.rs) || 1; i < len; i++) {
                                    gd.push('<cli ax="' + udv.ax + '" attribute_id="' + udv.atid + '" form_id="' + udv.form_id + '"><updt types="' + udv.tp +'" ordinal="' + (udv.o + i) + '" '+ k + 'value="' + v + '" dt="' + udv.dt + '"/></cli>');
                                }
                            }
                            udt = true;
                        }
                    }
                }
                
                //if there is any updates, send the mark operations
                if(srs && srs.length > 0) {
                    udt = true;
                    for(j in srs){
                        if(srs.hasOwnProperty(j)) {
                            if(srs[j].v === 1) {
                                gd.push('<mark rordinal="' + srs[j].o + '" types="4"/>');
                            } else {
                                gd.push('<mark rordinal="' + srs[j].o + '" types="5"/>');
                            }
                        }
                    }
                }
                
                eg.push(gd.join(''));
                eg.push('</gr>');
                
                //if we don't have any update, we should get an empty string
                if(!udt) {
                    eg = [];
                }
                return eg.join('');
            },
            
            /**
             * Set the target DOM node a dirty flag on it.
             * Should be overrided by subclass if needed.
             * @param {HTMLElement} t the target DOM node 
             */
            flagDirtyUnit: function flgDtUnt(t) {
                if(t && this.sci) {
                    var v = document.createElement('div'),
                        df, tf = false, 
                        trans3d = $C.getStyleValue(this.domNode, 'webkitTransform'),
                        isTDRelative;
                    v.className = "flag-container";
                    v.innerHTML = '<div class="dirty-cell"/>';                    
                    if(t.insertBefore) {
                        t.insertBefore(v, t.firstChild);
                        isTDRelative = (v.offsetParent == t);
                    }
                    tf = mstrmojo.string.isEmpty(trans3d) || trans3d === "none";
                    //we need to adjust the top and left
                    df = v.firstChild;
                        df.style.top = ((!tf || isTDRelative)? (0 - v.offsetTop) : (t.offsetTop - v.offsetTop)) + 'px';
                    df.style.left = (t.clientWidth + ((!tf || isTDRelative) ? (0 - v.offsetLeft) : (t.offsetLeft - v.offsetLeft)) - 8)+ 'px';
                }
            },
            
            /**
             * Clear the dirty flag on the target DOM node.
             * Should be overrided by subclass if needed.
             * @param {HTMLElement} t the target DOM node
             */
            clearDirtyUnit: function clrDtUnt(t) {
                var c = t.firstChild;
                if(t) {
                    if(c && c.className && c.className === 'flag-container') {
                        t.removeChild(c);
                    }
                }                        
            },
            
            /**
             * Process the editable cells / headers on the grid.
             */
            configureActions: function cfgAct(){
                var grid = this.zones._BR,
                    posMap = grid.posMap,
                    thPosMap = grid.thPosMap,
                    ics = this.interactiveCellsArray,
                    dicGroupMap = this.dicGroupMap,
                    dirtyNodes = [], ei, len, i, 
                    cell, pos, node, widx,
                    config, dicGroup,
                    me = this,
                    flagDirtyNodes = function(dns){
                        for (var j = 0, jLen = dns.length; j < jLen; j++) {
                            me.flagDirtyUnit(dns[j]);
                        }
                    };
                
                for (ei = this.lastIndex, len = ics.length; ics[ei] && ei < len; ei++){
                    cell = ics[ei];
                    pos = posMap[ei];
                    
                    if (pos && ((cell.at & 32) > 0)){
                        node = grid.getNodeByPosition(pos);
                        //#466957. Current approach is to overwrite the other action type (for link and drilling).
                        //A better solution in the future should be use dropdown context menu for all possible actions.
                        cell.at = 32;
                        
                        if (cell.rv == null){
                            cell.rv = isNaN(cell.mix) ? cell._e.n : cell.v;
                        }
                        
                        widx = getGroupIdx(cell);
                        config = this.getDataInputInfo(cell);
                        dicGroup = this.dicGroupMap[widx];
                        
                        if (config){
                            if (!dicGroup){
                                dicGroup = dicGroupMap[widx] = mstrmojo.DICFactory.createDICGroup({gk: widx, dic: config, owner:this, openerType: XTAB});
                            }
                            
                            var dicProps = { 
                                    value: (cell.rv===undefined) ? (cell.v || cell.n) : cell.rv, 
                                    dv: cell.v || cell.n, 
                                    ts: cell.ts,
                                    markAll: cell.markAll, 
                                    openerNode: node, 
                                    k: cell._ei
                                },
                                stackedRh = grid.cp.stackedRh;
                            
                            if (stackedRh) {
                                var tdHeight = node.offsetHeight;
                                
                                // Add the css
                                node.className = 'igDIC';
                                node.style.cssText = 'height:' + tdHeight + 'px;';
                                
                                mstrmojo.hash.copy({
                                    extraCssText: 'position:absolute;' +
                                                  'top:' +  parseInt(stackedRh/2 - tdHeight/2 + 1, 10) + 'px;'
                                             
                                }, dicProps);
                            }
                            
                            dicGroup.addDIC(cell._ei, dicProps);
                        }

                        //remember dirty cells and flag them later
                        if (cell.mdf){
                            dirtyNodes.push(node);
                        }
                    } 
                }
                this.lastIndex = ei;
                
                //render inline DICs
                for (widx in dicGroupMap){
                    dicGroupMap[widx].render();
                }
                
                //flag the modified cells
                if (mstrmojo.dom.isIE7){
                    //TQMS 523966: IE 7 calculates the position of the dirty flag incorrectly while loading the grid for the first time.
                    //Fix: delay the process to ensure it works correctly.
                    setTimeout(function(){
                        flagDirtyNodes(dirtyNodes);
                    }, 10);
                }else{
                    flagDirtyNodes(dirtyNodes);
                }
                
                //render editable column headers
                for (i = this.lastHeaderIndex, len = thPosMap.length; i < len; i++){
                    pos = thPosMap[i];
                    node = grid.getNodeByPosition(pos);
                    cell = pos.obj;
                    
                    if (this.isEditableHeader(cell)) {
                        node.innerHTML = '<div class="editable-column">' + node.innerHTML + '</div>';
                    }
                }
                this.lastHeaderIndex = i;
                
                if (this._super){
                    this._super();
                }
            },
            
            showPopupDIC: function(target){
                var tn = target && $D.findAncestorByAttr(target, 'ei', true, this.viewport);
                
                if (tn) {
                    var td = tn.node,
                        cell = this.getCellForNode(td),
                        group = this.dicGroupMap[getGroupIdx(cell)];
                
                    if (group){
                        group.showPopupDIC(cell._ei);
                        return true;
                    }
                }
                
                return false;
            },
            
            /**
             * If the clicked cell has a popup DIC attached, create and render it
             * @override XtabBase.onclick
             */
            onclick: function(e){
                //Prevent hosted environment popup two dialogs
                if (!mstrApp.isMobile){
                    var target = mstrmojo.dom.eventTarget(window, e.e);
                    
                    if (!this.showPopupDIC(target) && this._super){
                        this._super(e);
                    }
                }
            },
            
            /**
             * @override MobileXtab.touchTap
             */
            touchTap: function(e){
                if (!this.showPopupDIC(e.target) && this._super){
                    this._super(e);
                }
            },
            
            unrender: function(){
                if (this._super){
                    this._super();
                }
                this.destroyDICs();
            },
            
            destroyDICs: function(){
                var dicGroupMap = this.dicGroupMap, i;
                this.dicGroupMap = {};
                
                //delay the destroy process so that it won't freeze the UI
                setTimeout(function(){
                    for (i in dicGroupMap){
                        dicGroupMap[i].destroy();
                    }
                }, 10);
            }
        };
}());
