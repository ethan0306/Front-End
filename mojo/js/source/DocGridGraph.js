/*global mstrmojo:false, window:false */

(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Container",
        "mstrmojo._HasBuilder",
        "mstrmojo._Formattable",
        "mstrmojo._HasToolbar");
    
    var ELEM_SEP = "\u001E";
    
    var GD = 1;
    var GP = 2;
    
    /**
     * Helper object for repositioning children of the Grid/Graph object.
     * 
     * @class
     * @private
     * @ignore
     */
    var ggHelper = {
            
        TOP: 0,
        
        BOTTOM: 1,
        
        LEFT: 2,
        
        RIGHT: 3,
        
        vert: [ 'height', 'width', 'top' ],
        
        horiz: [ 'width', 'height', 'left' ],
        
        updateStyle: function (gg) {
            var qsm = gg.defn.qsm;
            if (!qsm) {
                return;
            }
            if (gg.getFormats().width) {
                return;
            }
            var child = null;
            if (qsm == GD) {
                child = gg.containerNode.firstChild; // grid node
            }
            else {
                child = gg.containerNode.lastChild; // graph node
            }
            if(!child){
                return;
            }
            var h = child.clientHeight + 'px';
            var w = child.clientWidth + 'px';
            
            var dnStyle = gg.domNode.style;
            dnStyle.height = h;
            dnStyle.width = w;
            
            if (gg.parent.updateStyle){
                gg.parent.updateStyle(h, w);
            }

        },
        
        repositionChildren: function (gg) {
        
            var f = gg.getFormats(),
                h = parseInt(f.height, 10),                                 // Unit height.
                w = parseInt(f.width, 10);                                    // Unit width.
        
            var ch = gg.children,
                gdf = ch[0].getFormats(),    // The format node for the grid (always index 0).
                gpf = ch[1].getFormats();    // The format node for the graph (always index 1).
            
            var isVert = (gg.defn.gp < this.LEFT),    // Is vertical orientation?
                x = (isVert) ? h : w,
                y = (isVert) ? w : h,
                dd = this[((isVert) ? 'vert' : 'horiz')];
            
            // Calculate the actual size devoted to the grid component as the RWUnit size times the percentage of grid area. 
            var gs = Math.round(x * (gg.defn.ga / 100));
            
            // Set dimensions of the grid.
            gdf[dd[0]] = gs + 'px';    // Grid size
            gdf[dd[1]] = y + 'px';    // Unit size
            
            // Set dimensions of the graph.
            gpf[dd[0]] = (x - gs) + 'px';     // Unit size minus grid size
            gpf[dd[1]] = y + 'px';            // Unit size.
            
            // Is the grid position top or left?
            if ((gg.defn.gp % 2) === 0) {
                // Set the top/left of the graph to the grid size.
                gpf[dd[2]] = gs + 'px';
            } else {
                // set the top/left of the grid to the Unit size minus grid size.
                gdf[dd[2]] = (x - gs) + 'px';
            }
            this.resizeChildren(ch[0], ch[1]);
        },
        stackChildren: function(gg) {
            var ch = gg.children,
            f = gg.getFormats(),
            gf;
            
            for (var i = ch.length - 1; i >= 0; i --){
              gf = ch[i].getFormats();
              gf.width = f.width;
              gf.height = f.height;
            }
            this.resizeChildren(ch[0], ch[1]);
        },
        resizeChildren: function(gd, gp) {
            // Remove and then render the grid again.
            gd.renderPortalState();

            // Resize the graph.
            var gpf = gp.getFormats();
            gp.resizeForDisplayState(parseInt(gpf.height, 10), parseInt(gpf.width, 10), true);
        },
        // show/hide GridGraph
        // TODO Question: quick switch mode?
        // TODO check with GB/Mark is it better to use onvisiblechange()?
        changeVisibility: function(gg, show) {
            var cd = gg.children,
                qsm = gg.defn.qsm,
                gds = show && (!qsm || gg.viewMode === GD),
                gps = show && (!qsm || gg.viewMode === GP);
            
            if(cd && cd.length > 0) {
                if (cd[0].visible !== gds) {
                    cd[0].set('visible', gds);
                }
                if (cd[1].visible !== gps){
                    cd[1].set('visible', gps);
                }
            }
            gg.visible = show;
        },
        
        // Set the visibility of the grid or graph
        setViewMode: function setViewMode(gg) {
            var cd = gg.children,
                vs = gg.visible;
            
            if(gg.defn.qsm && cd && cd.length > 0) {
                var ggm = gg.viewMode;
                cd[0].set('visible', (ggm == GD) && vs );
                cd[1].set('visible', (ggm == GP) && vs);
            }
        },
        
        clearFormatCache: function clearFormatCache(gg) {
            var cd = gg.children;
            for (var i = 0, len = cd && cd.length || 0; i < len; i ++) {
                cd[i].clearCache();
            }
        }
        
    };
    
    /**
     * <p>The widget for a single MicroStrategy Report Services Grid and Graph control.</p>
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
     * @borrows mstrmojo._Formattable#getFormats as #getFormats
     */
    mstrmojo.DocGridGraph = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [ mstrmojo._HasBuilder, mstrmojo._Formattable],
        
        /** 
         * @lends mstrmojo.DocGridGraph.prototype
         */
        {
            scriptClass: "mstrmojo.DocGridGraph",
            
            markupString: '<div id="{@id}" title="{@tooltip}" class="mstrmojo-DocGridGraph" style="{@domNodeCssText}">' +
                            '<div class="mstrmojo-DocGridGraph-msg"></div>' +
                            '<div class="mstrmojo-DocGridGraph-container"></div>' +
                          '</div>',
                        
            markupSlots: {
                msgNode: function(){ return this.domNode.firstChild; },
                containerNode: function(){ return this.domNode.lastChild; }
            },
            
            formatHandlers: {
                // note - we need 'font' for Zoom feature. 
                domNode: [ 'RW', 'B', 'background-color', 'fx', 'font' ]
            },
            
            /**
             * Grid (1) or graph (2) displayed
             */
            viewMode: null,
            /**
             * Whether this container is visible. When it is minimized, it is not visible.
             */
            visible: true,
            
            resize: function resize() {
                // Clear the format from cache
                this.clearCache();                
                // clear children cache
                ggHelper.clearFormatCache(this);
                var f = this.getFormats(),
                w = parseInt(f.width,10),
                h = parseInt(f.height,10);
                
                if (w > 0 && h > 0) {
                    ggHelper.changeVisibility(this, true);
                    // If it is quick switch mode, will not do reposition
                    if (!this.defn.qsm) {
                        ggHelper.repositionChildren(this);
                    } else {
                        ggHelper.stackChildren(this);
                    }
                }else {
                    // since portlet will not have overflow: hidden, we need to hide grid/graph
                    ggHelper.changeVisibility(this, false);
                }
            },
            
            postBuildRendering: function postBuildRendering() {
                this._super();
                
                var eg = this.node.data.eg;
                if (eg === undefined) {
                    // hide the msgNode
                    this.msgNode.style.display = "none";
                    // render grid normally
                    this.containerNode.style.display = "block";
                } else {
                    this.msgNode.innerHTML = eg;
                    this.msgNode.style.display = "block";
                    this.containerNode.style.display = "none";
                }
                
                // Set the view mode value
                var qsm = this.defn.qsm;
                if(!this.viewMode && qsm) {
                    this.viewMode = qsm;
                }
                
                //Grab the node definition... 
                var d = this.node.defn;
                
                // ...and attach an event listener for qsm (Quick Switch Mode) change. Since multiple instances of the same grid
                // share the same definition object, they all listen to this event. Furthermore, since different grids have different 
                // definition objects, the event is not broadcasted to all grids on the page. 
                d.attachEventListener("qsmChange", this.id, function (evt){
                    // Flip the current view mode.
                    this.viewMode = evt.value;
                    
                    // set the view mode.
                    ggHelper.setViewMode(this);
                    
                    // Silently calls quick switch task to save the display mode
                    this.model.getDataService().setQuickSwitchViewMode(this.defn.tt + ELEM_SEP + this.k, this.viewMode);
                    
                    ggHelper.updateStyle(this);
                });

                ggHelper.setViewMode(this);
                ggHelper.updateStyle(this);
            },

            getGridWidget: function() {
                return this.children[0];
            },
            
            getGraphWidget: function() {
                return this.children[1];
            },
            
            /**
             * Update and refresh graph object
             * @param {Object} node New node date
             */
            updateGraph: function(node) {
                var gp = this.getGraphWidget();
                
                if(gp) {
                    gp.update(node);
                    gp.refresh();
                }
            },
                                    
            quickSwitch: function quickSwitch() {
                // Is current view mode grid?
                var gd = this.viewMode != GP;                
                
                // update qsm on definition
                this.defn.set('qsm', (gd ? GP : GD));
                
                return true;
            }
        }
    );
    
})();