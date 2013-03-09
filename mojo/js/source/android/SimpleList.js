(function () {

    mstrmojo.requiresCls("mstrmojo.ListBase",
                         "mstrmojo._TouchGestures",
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo.android._IsList",
                         "mstrmojo.css",
                         "mstrmojo.dom",
                         "mstrmojo.array");
    
    var $DOM = mstrmojo.dom;
    
    /**
     * Selects (or unselects) a node without actually selecting it in the list.
     * 
     * @param {Object} touch The touch event.
     * @param {String} mthName The name of the method to call on the item renderer.
     * 
     * @private
     */
    function selectNode(touch, mthName) {
        var item = $DOM.findAncestorByAttr(touch.target, 'idx', true, this.domNode);
        if (item) {
            var v = item.value,
                ir = this.itemRenderer;
            
            ir[mthName](item.node, this.items[v], v, this);
        }
    }    
    
    /**
     * A simple touch enabled list for the Android platform.
     * 
     * @class
     * @extends mstrmojo.ListBase
     */
    mstrmojo.android.SimpleList = mstrmojo.declare(

        mstrmojo.ListBase,
        
        [ mstrmojo.android._IsList, mstrmojo._TouchGestures, mstrmojo._HasTouchScroller ],
        
        /**
         * @lends mstrmojo.android.SimpleList.prototype
         */
        {
            scriptClass: "mstrmojo.android.SimpleList",
            
            scrollerConfig: {
                bounces: false,
                showScrollbars: false
            },
            
            /**
             * If true, the item will be highlighted, but not selected during a select move operation.
             * 
             * @type boolean
             * @default false
             */
            highlightOnSelect: false,
            
            /**
             * Denotes whether the list contains items that have a even height. This allows for a performance optimization that allows us to cache the 
             * row height and then use that for all our calculations.
             * 
             * @type boolean
             * @default false
             */
            hasEvenRows: false,
            
            /**
             * If the property mstrmojo.SimpleList.hasEventRows has even rows, this property is used to cache the individual row height.
             * 
             * @type Integer
             * @default -1
             */
            rowHeight: -1,
            
            /**
             * Overridden to add hosted css class for non touch enabled applications.
             * 
             * @ignore
             */
            init: function init(props) {
                this._super(props);
                
                // Are we in the hosted environment?
                if (!mstrApp.isTouchApp()) {
                    // Add hosted class.
                    mstrmojo.css.addWidgetCssClass(this, [ 'hosted' ]);
                }
            },
            
            /**
             * Re-renders and replaces the list node at the given index.
             * 
             * @param {Integer} idx The index of the item to replace.
             */
            updateItem: function updateItem(idx) {
                // Create local DIV for element from string creation and get the item.
                var div = document.createElement('div'),
                    item = this.items[idx],
                    me = this;
                
                // Set innerHTML of local DIV
                div.innerHTML = this.itemRenderer.render(this.items[idx], idx, this);
                
                // Replace original element with new element.
                var newEl = div.firstChild;
                this.itemsContainerNode.replaceChild(newEl, this._getItemNode(idx));

                // Iterate the dependents of this item and update them.
                mstrmojo.array.forEach(item.dependents, function (d) {
                    me.updateItem(d._renderIdx);
                });
                
                return newEl;
            },
            
            preBuildRendering: function preBuildRendering() {
                var cfg = this.scrollerConfig,
                    origin = cfg && cfg.origin;

                // Do we already have an origin?
                if (origin) {
                    // Build items container css text.
                    this.icnCssText = '-' + (($DOM.isWinPhone) ? 'ms' : 'webkit') + '-transform:' + $DOM.createTranslateString(-origin.x, -origin.y, 0, true) + ';';
                }
                
                // Call super.
                return this._super();
            },
            
            /**
             * Overridden to update scroller after resize.
             * 
             * @ignore
             */
            setDimensions: function setDimensions(h, w) {
                // Is either height or width different from current value?
                if (this.height !== h || this.width !== w) {
                    // Set new dimensions.
                    this.height = h;
                    this.width = w;
                    
                    // Resize dom node.
                    var dn = this.domNode;
                    if (dn) {
                        dn.style.height = h;
                        dn.style.width = w;
                        
                        // Update the scroller.
                        this.updateScroller();
                    }
                }
            },
            
            updateScrollerConfig: function updateScrollerConfig() {
                var cfg = this._super(),
                    icn = this.itemsContainerNode,
                    h = parseInt(this.height, 10);
                
                // Is our height specified?
                if (isNaN(h)) {
                    // Height wasn't specified in the properties, so measure.
                    h = this.domNode.clientHeight;
                }
                
                // Add the scrollEl to the scroll config.
                cfg.scrollEl = icn;
                
                // Initialize origin to 0,0 (if not already there).
                cfg.origin = cfg.origin || {
                    x: 0,
                    y: 0
                };
                
                // Calculate offset end (items container node height minus widget height).
                var offsetEnd = Math.max(this.getItemsContainerHeight() - h, 0);
                
                // Should we be able to vertically scroll?
                var enableScroll = cfg.vScroll = (offsetEnd !== 0 && cfg.noVScroll !== true);
                if (enableScroll) {
                    // Add the computed offset.
                    cfg.offset = {
                        y: {
                            start: 0,
                            end: offsetEnd
                        }
                    };
                }
                
                return cfg;
            },
            
            /**
             * Calculates the items container's height. It has a performance optimization to avoid making a dom measurement by caching the row
             * height of a single node the first time and reusing the cached height for future calculations.
             * 
             * @return The items container's height as a integer. 
             */
            getItemsContainerHeight: function getITemsContainerHeight() {
                //Does the list not have evenRows OR do we have not a cached row height?
                if (!this.hasEvenRows || this.rowHeight === -1) {
                    //Does the list have any items?
                    var firstItem = this._getItemNode(0);
                    if (firstItem) {
                        //Cache the row height for future use.
                        this.rowHeight = firstItem.offsetHeight;
                    }
                    
                    //Measure the container's height.
                    return this.itemsContainerNode.offsetHeight;
                } else {
                    //Calculate the container height by using the cached row height and multiplying it for each of the items.
                    return (this.rowHeight * this.items.length);
                }
            },
            
            touchSelectBegin: function touchSelectBegin(touch) {
                // Should we highlight on select?
                if (this.highlightOnSelect) {
                    // Highlight the element.
                    selectNode.call(this, touch, 'select');
                }
          
                this._super(touch);
            },       
            
            touchSelectMove: function touchSelectMove(touch) {
                // Cache that this was a select move.
                this._selectMove = true;
                
                this._super(touch);
            },
            
            touchSelectEnd: function touchSelectEnd(touch) {
                var wasMoved = this._selectMove;
                delete this._selectMove;
    
                // Was the select NOT a select move?
                if (!wasMoved) {
                    // Simulate tap.
                    this.touchTap(touch);
                    
                } else {
                    // Did we highlight on select?
                    if (this.highlightOnSelect) {
                        // Remove element highlight.
                        selectNode.call(this, touch, 'unselect');
                    }
                }
            }            
        }
    );
}());