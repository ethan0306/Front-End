(function(){

    mstrmojo.requiresCls("mstrmojo.Doc",
                         "mstrmojo._HasBuilder",
                         "mstrmojo._IsRwDocument",
                         "mstrmojo.hash",
                         "mstrmojo.array",
                         "mstrmojo.DocModel");
    
    var $A = mstrmojo.array,
        $AFE = $A.forEach;
    
    /**
     * Returns TRUE if layout is for use as info window
     * @private
     */    
        
    function isInfoWindowLayout(l){
        return (typeof l.defn.iw !== "undefined" && l.defn.iw);
    }
    
    /**
     * The widget for a single MicroStrategy Report Services document displayed on a MobileDevice.
     * 
     * @class
     * @extends mstrmojo.MobileBooklet
     */
    mstrmojo.maps.AndroidMapDoc = mstrmojo.declare(
        // superclass
        mstrmojo.Doc,
        
        null,
        
        /**
         * @lends mstrmojo.MobileDoc.prototype
         */
        {
            scriptClass: "mstrmojo.maps.AndroidMapDoc",
            
            cssClass: 'mstrmojo-Doc',
            
            getContentView: function getContentView(options) {
                return this;
            },
            
            /**
             * Adds a view as a child of the MobileBooklet.
             * 
             * @param {mstrmojo.Widget} view The view to add.
             * 
             * @private
             */
            addChild: function(view) {
                // Set the dimensions of the new child to match booklet dimensions.
                view.height = this.height;
                view.width = this.width;
                
                // Make sure child is visible.
                view.visible = true;
            
                // Add the view as a child.
                this.addChildren([ view ]);
            },
            
            buildChildren: function buildChildren(noAddChildren) {
                // Mask the noAddChildren parameter to always return the children (rather than add them as children) and then
                // cache the children.
                this._layouts = this._super(true);
            },
            
            /**
             * Creates and returns a label configured as the layout loading place holder.
             * 
             * @param {mstrmojo.Widget} view The view that the place holder should be based on (placeholder will contain same "n" and "k" properties).
             * 
             * @private
             * @returns {mstrmojo.Label}
             */
            getLoadingPlaceholder: function(view) {
                var n = view.n || "";
                return new mstrmojo.Label({
                    cssClass: 'pre-loader',
                    n: n,
                    k: view.k,
                    isPreloader: true,
                    t: "foo"
                });
            },
                                    
            /**
             * Overridden to mask the destroy parameter (to false) for better performance.
             * 
             * @ignore
             */
            cleanUpLastWidget: function cleanUpLastWidget(destroy) {
                this._super(false);
            },
            
            
            /**
             * Overridden to raise the layoutSelected event.
             * 
             * @ignore
             */
            selectLayout: function selectLayout(layout, updateServer,callback) {
                this._super(layout, updateServer,callback);
                
                return layout;
            },
                        
            /**
             * <p>Replaces the current view with the view passed in (no animation).</p>
             * 
             * <p>Current view will be unrendered and destroyed.</p>
             * 
             * @param {mstrmojo.Widget} view The new view to display.
             * @param {mstrmojo.Widget} targetView The view to replace.
             */
            replaceView: function replaceView (view, targetView) {
                // Set the slot on the new view to match.
                view.slot = targetView.slot;
                
                // Remove the current view and unrender it.
                this.removeChildren(targetView, true);
                targetView.unrender();
                targetView.destroy();
                
                // Add the new view.
                this.addChild(view);                
                return view;
            },

            replaceLayout: function replaceLayout(oldLayout, newLayoutNode) {
                // Get index of old DocLayoutViewer.
                var layouts = this._layouts || [],
                    idx = $A.find(layouts, 'k', oldLayout.k);
                    
                // Destroy old DocLayoutViewer.
                if ( idx >=0 ) {
                    oldLayout.unrender();
                    oldLayout.destroy();
                }
                                
                // Create the new DocLayoutViewer.
                var c = this.builder.build([ newLayoutNode ], this.model)[0];
                
                // Replace old DocLayoutViewer in our cached layouts collection.
                // if the old layout was previously loaded, we expect it to be in the _layouts collection at position IDX
                if ( idx >=0 ) {
                    layouts[idx] = c;
                } else {
                    layouts.push(c);
                }
                
                // copy back the layouts array in case we just created it.
                this._layouts = layouts;
                
                // Return newly created DocLayoutViewer.
                return c;
            },
            
            onLayoutRebuilt: function onLayoutRebuilt(layout) {
                // Replace current layout with new one.
                this.replaceView(layout, this.currentView);
                this.currentView = layout;
                layout.set("visible",true);
            },
                        
            /**
             * <p>Overridden to destroy layouts.</p>
             * 
             * <p>Normally all children are destroyed by the parent, but in this case the non visible layouts 
             * aren't actually children so we do it manually.</p>
             * 
             * @ignore
             */
            destroy: function destroy(ignoreDom) {
                $AFE(this._layouts, function (lyt) {
                    lyt.destroy(ignoreDom);
                });
                
                this._super(ignoreDom);
            }            
            
                        
        }
    );
    
}());