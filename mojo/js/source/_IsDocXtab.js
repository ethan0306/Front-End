(function() {
    
    mstrmojo.requiresCls("mstrmojo.dom");
    
    var $D = mstrmojo.dom;
    
    /**
     * The mixin includes the document specific components (e.g. formatHandlers, format applying functions etc) for Xtab
     */
    mstrmojo._IsDocXtab = {
            
        _mixinName: 'mstrmojo._IsDocXtab',            
        
        /**
         * Flag denotes whether the xtab is featured within a document.
         * 
         * @type boolean
         */
        isDocXtab: true,
        
        formatHandlers: {
            // note - we need 'font' for Zoom feature. 
            domNode: [ 'RW', 'T', 'font'],
            msgNode: [ 'height', 'background-color' ],
            viewport: [ 'D', 'background-color', 'B', 'fx' ]
        },
                
        preBuildRendering: function preBuildRendering() {
            
            // Set scrollbox dimensions.
            var f = this.getFormats(),
                cs = '',
                setDim = function setDim(dim) {
                    if(f[dim]) {
                        //Do we already have a dimension set on the widget? use that or else get it from the formatting object.
                        var d = this[dim] || f[dim];
                        
                        //Sync up the dimension property on the widget and the formatting property. 
                        this[dim] = d;
                        
                        //Are we rendering in fullscreen screen mode?
                        if (this.isFullScreenWidget) {
                            f[dim] = d;
                        }
                        
                        //Set the dimension limit on the widget.
                        this[dim + 'Limit'] = parseInt(d, 10);
                    }
                };

            //Initialize the dimensions
            setDim.call(this, 'height');
            setDim.call(this, 'width');
            
            // todo: do we need this? Why not just use scrollBox node format handler?
            // Utility function for calculating a scroll box dimension.
            var fn = function (d, offset) {
                // Get value for passed in dimension.
                var x = f[d];

                // Is this dimension fixed (not auto or %)?
                if (x && x.charAt(x.length - 1) !== '%') {
                    var v = parseInt(x, 10);
                    
                    // Is it a number (not 'auto')?
                    if (!isNaN(v)) {
                        // Subtract the offset.
                        if (offset) {
                            v -= offset;
                        }
                        
                        // NOTE : We tried using max-width and max-height here .... Since grid is rendered incrementally, it causes entire table (including scroller) to jump as you scroll and render cols with larger values. Also, the pageHeight 
                        // calculation is messed up at the bottom of the viewport. 
                        cs += d + ':' + v + 'px;';
                    }
                }

                // ensure that scrollbox is disconnected off the old DOM.
                /*
                if (this.lockHeadersCase) {
                    this.disconnectScrollbox(this);
                }
                */
                
                return null;
            };
            
            // Calculate the scrollbox height.  If the title bar is visible we need to pass the height of the titlebar for the offset.
            fn('height', 0);
            
            // Calculate the scrollbox width.
            fn('width', 0);
            
            var gd = this.gridData,
                afc = gd && gd.afc; 
        
            if(afc && mstrmojo.dom.isIE && !mstrmojo.dom.isIE8) {
                
                var fc = function findContainerByScriptName(w, s) {
                    var anc = w && w.parent;
                    
                    while(anc && anc.scriptClass.indexOf('DocPanelStack') === -1) {
                        if(anc.scriptClass === s) {
                            return anc;
                        }
                        anc = anc.parent;
                    }
                    return null;
                };
    
                var layout = fc(this, 'mstrmojo.DocLayout');
                if(layout) {
                    var lf = layout.getFormats(),
                        w = parseInt(lf.width, 10);
                    if(w) {
                        var mw = w - ( parseInt(f.left, 10) || 0 ); 
                        cs += "max-width:" + mw + "px;";
                    }
                }
            }            
            
            this.scrollboxNodeCssText = cs;
            
            return this._super();
        },        
               
        /**
         * The function is called when we resize the portal from the title bar.
         */
        resize: function() {              
            // Clear the format from cache
            this.clearCache();                
            // Get the new format
            var f = this.getFormats(),
                h = parseInt(f.height, 10),
                w = parseInt(f.width, 10);
            if (w > 0 && h > 0) {
                if (!this.visible && this.forcedHidden){
                    this.set('visible', true);
                    this.forcedHidden = false;
                }
                //this.renderPortalState();
                
                // Resize domNodes
                mstrmojo.array.forEach([this.scrollboxNode, this.viewport], function (node) {
                    var nodeStyle = node.style;
                    nodeStyle.height = h + 'px';
                    nodeStyle.width = w + 'px';
                });
                
                // The _HasTitleBar applyWindowSize() has already set the domNode size, we only need to reset the scrollBox node size 
                if (this.scrollboxNode) {
                    
                    this.scrollboxHeightFixed = h && (h !== "auto");

                    // todo1-what if we come here with non-fixed height and width?
                    if (this.scrollboxHeightFixed) {
                        this.scrollboxHeight = parseInt(h, 10); 
                        // Update scrollboxBottom so that the ondemandGrid can have the right viewport size
                        this.scrollboxBottom = this.scrollboxTop + h;
                        // Do we need this? 
                        //this.scrollboxRight = this.scrollboxLeft + w;
                    }                            

                    // If we have any locked headers, wire the scrollboxNode to our onscroll handler.
                    if (this.lockHeadersCase) {
                        this.resizeScrollBox($D.isIE);
                    }
                }                   

                // trigger the onscoll of the zones so that they can render based on the new viewport size. 
                var zs = this.zones;
                if(zs) {
                    if(zs._BL) {
                        zs._BL.onscroll();
                    }
                    if(zs._BR) {
                        zs._BR.onscroll();
                    }
                }
                
                if (!(this.gridData && this.gridData.eg)) {
                    //TQMS 423289: we need to update the xtab._pl if it is resized.
                    this.onGridWidthChanged();
                }
            } else {
                // since portlet will not have overflow: hidden, we need to hide the grid
                if (this.visible) {
                    this.set('visible', false);
                    this.forcedHidden = true;
                }
            }
        },        
                
        /**
         * <p>Clears the formatting cache, unrenders and then renders this control.</p>
         * 
         * <p>Typically called when the formatting properties have changed and you want to re-render the mstrmojo.Xtab.</p>
         */
        renderPortalState: function renderPortalState() {
            this.clearCache();
            this.unrender();
            this.render();
        },        
        
        /**
         * On unrendering the doc Xtab, we need to clear it's formatting cache.
         * 
         * @see mstrmojo._HasMarkup
         */
        unrender: function unrender() {
            //Clear the cache.
            this.clearCache();
            
            //Call super.
            if (this._super) {
                this._super();
            }
        },        
        
        /**
         * Overwrite the default action function from XtabBase, and add setting high light color
         */
        defaultAction: function defaultAction(td, tCell) {
            if (this._super(td, tCell)) {
                var titleId = this.model.sti, 
                    z;
                
                // If the a cell is selected as selector control, the sti is the title id for the column.
                if (titleId) {
                    // Find the right zone to response the click action, highlight selected cell.
                    for (z in this.zones) {
                        var zn = this.zones[z],
                            dn = zn.domNode,
                            fc = dn && dn.firstChild;
                        
                        if (fc && (td.offsetParent === fc || td.offsetParent === dn)) {
                            zn.clearHilites(titleId);
                            zn.setHilites(titleId, td);
                            
                            this.model.sti = null;
                            return true;
                        }
                    }
                }
                
                //Remember the current selected td.
                this._currentSelectedTD = td;            
                
                return true;
            }
            
            return false;
        }        
    };
}());