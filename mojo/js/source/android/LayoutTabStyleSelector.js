(function () {

    mstrmojo.requiresCls("mstrmojo.ListBase",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.android._IsLayoutSelector",
                         "mstrmojo.android._IsList",
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo.array");
    
    var itemMarkup;
    
    /**
     * A Mobile Report Service layout selector "tab" style widget.
     * 
     * @class
     * @extends mstrmojo.ListBase
     */
    mstrmojo.android.LayoutTabStyleSelector = mstrmojo.declare(

        mstrmojo.ListBase,
        
        [ mstrmojo._TouchGestures, mstrmojo.android._IsLayoutSelector, mstrmojo.android._IsList, mstrmojo._HasTouchScroller ],
        
        /**
         * @lends mstrmojo.android.LayoutTabStyleSelector.prototype
         */
        {
            scriptClass: "mstrmojo.android.LayoutTabStyleSelector",
            
            cssClass: 'mstrmojo-MobileLayoutSelector TabStyle',
            
            getItemMarkup: function getItemMarkup(item) {
                if (!itemMarkup) {
                    itemMarkup = this._super(item).replace('{@n}', '<div>{@n}</div>');
                }
                
                return itemMarkup;
            },
            
            /**
             * Creates the list items and selects the current item.
             * 
             * @ignore
             */
            renderSelector: function renderSelector(layouts, currentLayout) {
                if (this._super(layouts, currentLayout)) {
                    // Replace the current items
                    this.set('items', layouts);
                    
                    //Show the layout selector.
                    this.toggleSelectorDisplay(true);
                    
                    // Select the current layout.
                    this.singleSelect(mstrmojo.array.find(layouts, 'k', currentLayout.k));
                } else {
                    //Hide the layout selector.
                    this.toggleSelectorDisplay(false);
                    
                    // Replace the current items
                    this.set('items', []);
                }
            },
            
            /**
             * Overridden to change layout on target.
             * 
             * @ignore
             */
            postselectionChange: function postselectionChange(evt) {
                // Were any items selected?
                var added = evt.added;
                if (added) {
                    // Show the first selected item (should only be one since by default we don't support multi select.
                    this.target.showLayout(this.items[added[0]]);
                }
            },
            
            updateScrollerConfig: function updateScrollerConfig() {
                var cfg = this._super(),
                    icn = this.itemsContainerNode,
                    w = parseInt(this.width, 10);
                
                // Is our width specified?
                if (isNaN(w)) {
                    // Height wasn't specified in the properties, so measure.
                    w = this.domNode.clientWidth;
                }
                
                // Add the scrollEl to the scroll config.
                cfg.scrollEl = icn;
                
                // Turn off bouncing because android lists generally don't bounce.
                cfg.bounces = false;
                
                // Calculate offset end (items container node height minus widget height).
                var offsetEnd = Math.max(icn.offsetWidth - w, 0),
                    origin = cfg.origin;
                
                // Should we be able to vertically scroll?
                var enableScroll = cfg.hScroll = (offsetEnd !== 0 && cfg.noHScroll !== true);
                if (enableScroll) {
                    // Add the computed offset.
                    cfg.offset = {
                        x: {
                            start: 0,
                            end: offsetEnd
                        }
                    };
                    
                    // Do we NOT already have an origin?
                    if (!origin) {
                        // Calculate difference between width and right edge of selected element.
                        var el = this._getItemNode(this.selectedIndex),
                            delta = el.offsetLeft + el.offsetWidth - w;
                        
                        // Is the right edge of the element past the width?
                        if (delta > 0) {
                            // Set origin so right edge of element will be visible.
                            origin = {
                                x: delta,
                                y: 0
                            };
                        }
                    }
                }
                
                // Add origin, initializing to 0,0 if we don't have one.
                cfg.origin = origin || {
                    x: 0,
                    y: 0
                };
                
                return cfg;
            }
            
        }
    );
}());