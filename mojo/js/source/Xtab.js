(function(){

    mstrmojo.requiresCls(
        "mstrmojo.XtabBase",
        "mstrmojo._Formattable", 
        "mstrmojo._HasWaitIcon",         
        "mstrmojo._IsSelectorTarget",
        "mstrmojo._IsDocXtab",
        "mstrmojo._XtabSelections");        

    var LOCK_OFF = 0;

    var ROW_AXIS = 1;
    
    var OVERFLOW_A = "overflow:auto";
    var OVERFLOW_H = "overflow:hidden";

    var CP_ROW_HEADERS = 4;
    var CP_VALUES = 8;
    
    var $D = mstrmojo.dom,
        $PS = "mstrmojo.DocPanelStack";
           
    var fc = function findContainerByScriptName(w, s) {
        var anc = w && w.parent;
        
        while(anc && anc.scriptClass !== $PS) {
            if(anc.scriptClass === s) {
                return anc;
            }
            anc = anc.parent;
        }

        return anc;
    };
    /**
     * Xtab is a crosstabbed data grid display.  
     */
    /**
     * <p>The widget for a single MicroStrategy Report Services Crosstabbed data grid display.</p>
     * 
     * <p>Or at least, that's how it appears.  It is actually a container with up to 4 child widgets, each of which is a XtabZone instance.  The HTML of
     * the Xtab is typically a 2x2 HTML table, whose cells contain the HTML of each XtabZone.  The 2x2 HTML table of the Xtab is wrapped in a 
     * non-scrolling div, called the "viewport" of the Xtab.  The viewport node does not scroll; however, the bottom-right cell of the 2x2
     * table does have a scrolling div (called the "scrollboxNode" of the Xtab), which contains the HTML of the bottom-right XtabZone width.  
     * This HTML arrangement allows us to produce a "locked headers" effect.</p>
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
     * @borrows mstrmojo._Formattable#getFormats as #getFormats
     * 
     * @borrows mstrmojo._IsSelectorTarget#setDirty as #setDirty
     */
    mstrmojo.Xtab = mstrmojo.declare(
        // superclass
        mstrmojo.XtabBase,
        
        [ mstrmojo._Formattable, mstrmojo._HasWaitIcon, mstrmojo._IsSelectorTarget, mstrmojo._IsDocXtab, mstrmojo._XtabSelections],
        
        /** 
         * @lends mstrmojo.Xtab.prototype
         */
        {            
            scriptClass: "mstrmojo.Xtab",

             /**
             * Reference to the delegate object that manages the xtab's cells' hover popup.
             * Optional. If missing, selections will not show anything upon hover; otherwise the
             * delegate object will be loaded once the xtab is rendered.
             * @type String
             */
            cellHoverMgr: "mstrmojo._XtabCellHoverMgr",

            /**
             * Reference to the context popup. This is the popup that the delegate "cellHoverMgr"
             * will open if/when end-user hoves over actionable cells.
             * Optional. If missing, cells will not show anything upon hover.
             * @type String 
             */
            cellHoverPopupRef: "mstrmojo.XtabCellHoverPopup",
            
            preBuildRendering: function preBuildRendering() {
                // trigger the parent's prebuild rendering.                 
                var rtn = this._super();
                
                var gd = this.gridData;
                
                // For LockHeaders OFF case, is Clip Overflow Set ?
                var overflowClip = this.lockHeadersCase === LOCK_OFF && gd.co;          
                
                // Note - For other lock headers case, the scrollboxnode <TD> represents the (unlocked) scrollable region within the grid (unlike Lock=OFF case where this <td> represents
                // the complete Grid Container). So, we don't set overflow:hidden in that case. 
                // Also, if the numRowFixed flag is true, that means we need a scrollbar to fetch data. Therefore, set scrollboxNode to be overflow:auto 
                // if overflowClip is set, pass it on to the scrollboxNode otherwise default to overflow:auto
                this.scrollboxNodeOverflow = overflowClip && !this.numRowFixed ? OVERFLOW_H: OVERFLOW_A;
                
                var f = this.getFormats();
                //#456877 - IE8 only - Not clip AND fit-to-content AND no incremental fetch AND no locked-headers case:
                if (mstrmojo.dom.isIE8 && !gd.co && this.lockHeadersCase === LOCK_OFF && (!gd.rw || gd.rw && (gd.rw.row.bc >= gd.rw.row.tc)) && f.height === '' && f.width === '') {
                    this.scrollboxNodeOverflow = '';
                }

                //In partial update we do not send down the default css information. This causes the _usesFilter flag to be false when we have a manipulation
                //like a selector change. Hence, we will check if the flag is already true and assume it to be true for all subsequent manipulations.
                this._useFilter = this._useFilter || gd.cssflt || false;
                
                return rtn;
            }, 
            
            /**
             * This method extends the rendering life-cycle inherited from Container in order to 
             * [1] trigger the intialization of the child widgets (XtabZones) and their content providers
             * BEFORE the rendering of children is started, and
             * [2] resize the scrollboxNode AFTER the children have been rendered.
             * This extended processing is done only after a rendering has produced a BOTTOMRIGHT slot; presumably, 
             * a rendering that omits that slot doesn't want to show data. 
             */
            postBuildRendering: function postBldRndr() {
                var gd = this.gridData,
                    bInitZones = !!this._BR && gd;
                               
                var rtn = this._super();

                // If not on a touch supported device we need to include the cell hover manager.
                if (!$D.supportsTouches) {
                    var xtab = this;
                    if (this.contentNode) {
                        //To ensure that the Xtab is completely rendered when the cellHoverMgr is created, we'll trigger it when
                        //we call onmouseover
                        this.contentNode.onmouseover = function() {
                            //Apply the cell Hover manager
                            xtab.requiresContrib("cellHoverMgr", true);
                            
                            //clear the onmouseover.
                            xtab.contentNode.onmouseover = null;
                        };
                    }
                }
                
                // Does this xtab have a 'Fit to Content' width (signified by the fact that the 'width' parameter is missing from the formats node)?
                if (!('width' in this.getFormats()) && this.model.addAutoWidthID) {
                    // Notify the DocumentInstance.
                    this.model.docModel.addAutoWidthID(this.id);
                    
                    //#463408 - Fit-To-Content Width Mode xtab inside a PanelStack in IE7
                    var gd = this.gridData,
                        afc = gd && gd.afc; 
                    if (afc && mstrmojo.dom.isIE7) {
                        var p = fc(this, $PS);
                        if (p && p.scriptClass == $PS) {
                            this.viewport.style.width = this.contentNode.offsetWidth + 'px';
                        }
                    }
                }
                
                /* 
                 * TQMS 396605: Hack, (IE7 only) force repainting to display the titles with filters
                 */ 
                if ($D.isIE && !$D.isIE8 && this._useFilter && !this.lockHeadersCase) {
                    var sn = this.scrollboxNode;
                    window.setTimeout(function() {
                            var img = document.createElement('img');
                            sn.appendChild(img);
                            sn.removeChild(img);
                    }, 0);
                }
                return rtn;
            },

            createZone: function(cfg) {
                return new mstrmojo.XtabZone(cfg || {});
                
                //Resolve the control group bys (if any) into target keys. We need to do this because during partial update we do not get the target keys
                //from backend.
                this._resolveCGBToTKS(this.model.docModel.getCGBMap());
            },
            
            /**
             * Updates its 'tks' property based on the the updated values received from the webserver.
             * 
             * @param {Object} The evt object that consists of the cgbMap property
             */
            onCGBMapChange: function(evt) {
                //If the Control Group by map has changed on the current layout, resolve any pending control group bys to target keys.
                var updatedTks = this._resolveCGBToTKS(evt.cgbMap);             
                
                if (updatedTks) {
                    this.defaultAction(this._currentSelectedTD);
                }
            },
            
            /**
             * Resolves any control group by (if any) to the target keys property (tks) in the selector control map.
             * 
             *  @param {Object} The control group by mapping of all the control group bys and their respective target keys in a 
             *  given layout.
             */
            _resolveCGBToTKS: function _resolveCGBToTKS(cgbMap) {
                //Return if we don't have new values
                if (!cgbMap) {
                    return;
                }
                
                var scm = this.model.scm,
                    delim = '\u001E',
                    i = 0,
                    id = null,
                    curSelector = null,
                    cgb = null,
                    targetKey = null,
                    updatedTks = false;
                
                for (id in scm) {
                    curSelector = scm[id];
                    cgb = curSelector.cgb;
                    
                    //Loop through the control group by that the selector targets and see if we have 
                    //the respective target keys.
                    for (i in cgb) {
                        cgbKey = cgb[i];
                        targetKey = cgbMap[cgbKey];
                        
                        //We append the target key only if it doesn't exist
                        if (targetKey) {
                            if (!curSelector.tks){
                                curSelector.tks = targetKey;
                                updatedTks = true;
                            } else if (curSelector.tks && (curSelector.tks.indexOf(targetKey) < 0)) {
                                curSelector.tks += delim + targetKey;
                                updatedTks = true;
                            }
                        }
                    }
                }
                
                return updatedTks;
            },
            
            /**
             * The function responses the width change of the xtab 
             */
            onGridWidthChanged: function onGridWidthChange(b) {
                //The cell hover manager might not have been created when this method is called, (as it gets created onmouseover)
                //In not created, it'll be a string and will not have the onXtabWidthChanged method.
                if (this.cellHoverMgr.onXtabWidthChanged) {
                    //the cellHover manager needs k
                    this.cellHoverMgr.onXtabWidthChanged();
                }

                if(this._super) {
                    this._super(b);
                }
                
//                //#475923 update scrollbox width only when lock is off
//                if(this.lockHeadersCase === LOCK_OFF) {
//                    this._resizeScrollBoxWidth();
//                }
            },
            
            /**
             * Handler for change in this Xtab's height property.
             */
            onheightChange: function onsetheight(){ 
                mstrmojo.buffer.call(this.id, "_resizeScrollBox", this._resizeBuffer || 50);
            },
            
            /**
             * Handler for change in this Xtab's width property.
             */
            onwidthChange: function onsetwidth() { 
                mstrmojo.buffer.call(this.id, "_resizeScrollBox", this._resizeBuffer || 50);
            },

            unrender: function unrender(ignoreDom) {
                // Before wiping out our DOM, notify the cell hover mgr, so it can
                // do any detaching/cleanup it needs.
                var chm = this.cellHoverMgr;
                if (chm && chm.shutdown) {
                    chm.shutdown();
                }
                // Also detach listeners to scrollboxNode, if any; that allows us
                // to reattach to a new scrollboxNode after a re-render later.
//                this.disconnectScrollbox(this);
                this._super(ignoreDom);
            },
            
            link: function link(cell, idx) {
                this.controller.onLink(this, this.model.getLinkAction(cell, idx));
            },
            
            sort: function sort(cell, isAsc) {
                this.controller.onSort(this, this.model.getSortAction(cell, isAsc));
            },
            
            pivot: function pivot(cell, btn) {
                this.controller.onPivot(this, this.model.getPivotAction(cell, btn));
            },
            
            drill: function drill(cell) {
                this.controller.onDrill(this, this.model.getDrillAction(this.getActionCells(cell)));
            }
        }
    );
}());