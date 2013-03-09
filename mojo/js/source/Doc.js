(function(){

    mstrmojo.requiresCls("mstrmojo.StackContainer",
                         "mstrmojo._IsRwDocument",
        "mstrmojo._HasBuilder",
        "mstrmojo._HasLayout",
        "mstrmojo._HasPopup",
                         "mstrmojo.array",
        "mstrmojo.css");
    
    /**
     * The widget for a single MicroStrategy Report Services document.
     * 
     * @class
     * @extends mstrmojo.StackContainer
     * 
     * @borrows mstrmojo._IsRwDocument#updateXtabStyles as #updateXtabStyles
     * @borrows mstrmojo._IsRwDocument#buildChildren as #buildChildren
     *
     * @borrows mstrmojo._HasBulder#buildChildren as #buildChildren
     * 
     * @borrows mstrmojo._HasLayout#height as #height
     * @borrows mstrmojo._HasLayout#width as #width
     * @borrows mstrmojo._HasLayout#layoutConfig as #layoutConfig
     * @borrows mstrmojo._HasLayout#onwidthChange as #onwidthChange
     * @borrows mstrmojo._HasLayout#onheightChange as #onheightChange
     * @borrows mstrmojo._HasLayout#setSlotDimension as #setSlotDimension
     */
    mstrmojo.Doc = mstrmojo.declare(
        // superclass
        mstrmojo.StackContainer,
        
        [ mstrmojo._HasBuilder, mstrmojo._IsRwDocument, mstrmojo._HasLayout, mstrmojo._HasPopup],
        
        /**
         * @lends mstrmojo.Doc.prototype
         */
        {
            scriptClass: "mstrmojo.Doc",

            cssClass: "mstrmojo-Doc",
            
            methods: {"*": "mstrmojo._DocOIVMMethods"},
            
            markupSlots: {
                containerNode: function(){ return this.domNode; },
                popupNode: function(){ return this.domNode; },
                drillLinkMenuNode:  function(){ return this.domNode; }
            },

            layoutConfig: {
                h: {
                    containerNode: '100%'
                },
                w: {
                    containerNode: '100%'
                }
            },
            
            getLayouts: function () {
                return this.children;
            },

            buildChildren: function buildChildren(noAddChildren) {
                // Did we build children (pass false to add children automatically)?
                if (this._super(false)) {
                    // Select the current layout if any. Use set() so that stack can use a custom setter to show/hide its children.
                    var k = this.model.getSelectedKey(this.node),
                        i = (k !== null) ? mstrmojo.array.find(this.children, "k", k) : -1,
                        ch = (i > -1) ? this.children[i] : null;

                    if (ch) {
                        // Select layout.
                        this.set("selected", ch);
                    }
                    return true;
                }

                return false;
            },

            restoreLayoutState: function restoreLayoutState(selectedChild) {
                // Call super for default processing.
                this._super(selectedChild);

                // The zf field is the last zoom factor of selected layout.
                // TQMS 496226: synchronize and update the zf value either when the zf in the doc or zf in the model is
                // different with the value in selected doclayout viewer
                var childZoom = selectedChild.zf;
                if ((this.zf !== childZoom || this.model.zf !== childZoom) && this.updateZoom) {
                    this.zf = this.model.zf = childZoom;
                    this.updateZoom();
                }
            },

            /**
             * Overridden to request new layouts from the server as well as silently update the server when the new layout is cached client-side.
             * 
             * @param {String} prop The name of the property that changed (always 'selected').
             * @param {mstrmojo.DocLayoutViewer} layout The DocLayoutViewer instance that should be visible.
             * @param {Boolean} noUpdate True if we should not silently update the server for the new layout.  This parameter is only true when this method
             *     is called recursively after downloading a new layout.
             *
             * @ignore
             */
            _set_selected: function _set_selected(prop, layout) {

                // Do we NOT already have a selected layout?
                if (!this.selected) {
                    // This is the initial call so we only need to call super.
                    return this._super(prop, layout);

                // Do we have a layout to select?
                } else if (layout) {
                    var me = this,
                        _super = this._super,
                        newKey = layout.k;

                    // Call getNewLayout to load the layout (only select layout if the new key is different from the current key).
                    this.getNewLayout({ layoutKey: newKey }, this.children, (newKey !== this.model.currlaykey), {
                        success: function (newLayout) {
                            // Show the layout.
                            var old = me.selected;
                            _super.call(me, prop, newLayout);

                            // TQMS 496213: manually raise the selectedChange event, to trigger selectionChange method in TabStrip.
                            me.raiseEvent({
                                name: 'selectedChange',
                                prop: 'selected',
                                value: newLayout,
                                valueWas: old
                            });
                        }
                    });
                }

                return true;
            },

            onLayoutRebuilt: function onLayoutRebuilt(layout) {
                this._set_selected('selected', layout, true);
            },

            replaceLayout: function replaceLayout(oldLayout, newLayoutNode) {
                // Remove and destroy old DocLayoutViewer.
                var idx = this.removeChildren(oldLayout);
                oldLayout.destroy();
                
                // Create the new DocLayoutViewer.
                var c = this.builder.build([ newLayoutNode ], this.model);
                
                // Add the new DocLayoutViewer.
                this.addChildren(c, idx);
                
                return c[0];
            },
            
            /**
             * Returns the currently selected layout.
             * 
             * @return mstrmojo.DocLayoutViewer
             */
            getSelectedLayoutWidget: function getSelectedLayout() {
                //TODO: Since the OIVM Doc is a StackContainer, we can return the selected stack. However, once the MOBILE_UNIVERSAL changes
                //are in, MobileDoc will have to override this method to return the selected layout from the MobileBooklet. 
                return this.selected;
            },
            
            xtabCellMenuRef: "mstrmojo.XtabCellMenu",
            
            openXtabCellMenu: function (config) {
                if (config) {
                    config.opener = this;
                }
                // Use a property-name reference in order to leverage caching.
                this.openPopup("xtabCellMenuRef", config);
            },
            
            closeXtabCellMenu: function(){
                this.closePopup();
            },
            
            drillLinkMenuRef: "mstrmojo.DrillLinkMenu",
            
            /**
             * Show the popup menu of Drill Links for Textfields or Images.
             * 
             * @ignore
             */
            openDrillLinkMenu: function openDrillLinkMenu(config) {
                if (config) {
                    config.opener = this;
                }
                // Use a property-name reference in order to leverage caching.
                this.openPopup("drillLinkMenuRef", config);
            },
            
            /**
             * Close the popup menu of Drill Links.
             * 
             * @ignore
             */            
            closeDrillLinkMenu: function closeDrillLinkMenu(){
                this.closePopup();
            },

            /**
             * The method that are used by the popup menu of Drill Links. 
             * Users click on a Drill Link, and the browser will be redirected into another page.
             * 
             * @ignore
             */                
            goToLink: function goToLink(link) {
                if (link) {
                // Open a window...
                window.open(link.url, (link.target || '_self') );
                }
            },

            /**
             * Show the popup menu of Selectors titlebar's pulldown button.
             * 
             * @ignore
             */
            selectorMenuRef: "mstrmojo.SelectorMenu",
            fpMenuRef: "mstrmojo.FilterPanelMenu",
            
            openPopupMenu: function(mnRef, config) {
                if (config) {
                    config.opener = this;
                }
                // Use a property-name reference in order to leverage caching.
                this.openPopup(mnRef, config);
            } 

        }
    );
    
}());