(function () {

    mstrmojo.requiresCls("mstrmojo.ListBase", 
                         "mstrmojo._HasLayout",
                         "mstrmojo._TouchGestures", 
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo.dom");
    
    var $D = mstrmojo.dom,
        $C = mstrmojo.css;
    
    function getTouchedElement(touch) {
        var item = $D.findAncestorByAttr(touch.target, 'idx', true, this.domNode);
        return item || null;
    }
    
    /**
     * Widget for displaying a list of items that are Mobile "Touch" enabled to support selection and scrolling.
     * 
     * @class
     * @extends mstrmojo.ListBase
     * 
     * @borrows mstrmojo._HasLayout
     * @borrows mstrmojo._TouchGestures
     * @borrows mstrmojo._HasTouchScroller
     */
    mstrmojo.MobileList2 = mstrmojo.declare(
        mstrmojo.ListBase,

        [ mstrmojo._HasLayout, mstrmojo._TouchGestures, mstrmojo._HasTouchScroller ],
        
        /**
         * @lends mstrmojo.MobileList2.prototype
         */
        {
            scriptClass: 'mstrmojo.MobileList2',
            
            layoutConfig: {
                h: {
                    itemsContainerNode: '100%'
                }, 
                w: {
                    itemsContainerNode: '100%'
                }
            },
            
            /**
             * This property tells the MobileList widget whether it needs to support incremental
             * fetch of data.
             * 
             * This property also needs a data helper to work correctly.
             * 
             * @default false
             */
            supportsIncFetch: false,
            
            /**
             * This property should be set to a data helper that provides an interface for the widget to get the 
             * next block of data.
             * 
             * @borrows #next(callbacks)
             */
            ifDataHelper: null,
            
            /**
             * This property needs to be set if seamless incremental fetch is switched on and the selections may not be in the initial
             * fetched block of elements. The Mobile list will update it's selections whenever a new chunk of data is fetched.
             * 
             * @type Array
             * @default null
             */
            initialSelectedItems: null,
            
            /**
             * @ignore 
             */
            renderOnScroll: false,
            
            useSelectScroll: true,
            
            selectionPolicy : 'reselect',
            
            scrollerConfig: {
                bounces: false,
                showScrollbars: false
            },
            
            /**
             * Very generic item render (should be overridden in most cases).
             * 
             * @type Object
             */
            itemRenderer: {
                render: function(item, idx) {
                    return '<div class="mobileList2-item ' + (item.css || '') + '" idx="' + idx + '"><div><h3>' + item.n + '</h4></div></div>';
                },
                
                /**
                 * @param {HTMLElement} el
                 * @param {Object} item 
                 * @param {Number} idx
                 * @param {mstrmojo.MobileList2} widget
                 */
                select: function(el, item, idx, widget) {
                    // Add selected class.
                    $C.addClass(el, 'selected');
                    
                    window.setTimeout(function () {
                        // Remove selected class.
                        $C.removeClass(el, 'selected');
                        
                        // Clear selected.
                        widget.clearSelect(true);                        
                    }, 150);
                }                
            },
            
            init: function init(props) {
                this._super(props);
                
                var css = [ 'mstrmojo-mobileList2' ];
                    
                // Are we in the hosted environment?
                if (!mstrApp.isTouchApp()) {
                    // Add hosted class.
                    css.push('hosted');
                }
                
                $C.addWidgetCssClass(this, css);
            },
            
            preBuildRendering: function preBuildRendering() {
                var cfg = this.scrollerConfig,
                    origin = cfg && cfg.origin;

                // Do we already have an origin?
                if (origin) {
                	
                    // We have rendered this before so we need to restore the last origin positions.
                	if(!$D.isWinPhone) {
	                    this.icnCssText = '-webkit-transform:translate3d(-' + origin.x + 'px,-' + origin.y + 'px,0);'; 
	                                      
                	} else {                		
                        this.icnCssText = '-ms-transform:translate(-' + origin.x + 'px,-' + origin.y + 'px);';                                       		
                	}
                }
                
                // Call super.
                return this._super();
            },
            
            updateScrollerConfig: function updateScrollerConfig() {
                var cfg = this.scrollerConfig,
                    icn = this.itemsContainerNode,
                    h = parseInt(this.height, 10),
                    incFetch = this.supportsIncFetch;
                
                // Is the height not a number?  
                if (isNaN(h)) {
                    // Height wasn't specified in the properties, so measure.
                    h = this.domNode.clientHeight;
                }
                
                // Calculate offset end (items container node height minus widget height).
                var offsetEnd = Math.max(icn.offsetHeight - h, 0);
                
                // Add the scrollEl to the scroll config.
                cfg.scrollEl = icn;
                
                // Do we NOT already have an origin?
                if (!cfg.origin) {
                    // Initialize origin to 0,0.
                    cfg.origin = {
                        x: 0,
                        y: 0
                    };
                }
                
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
                    
                    //Does the Mobile List support incremental fetch?
                    if (incFetch) {
                        var yOffset = cfg.offset.y;
                        
                        //Set the incremental fetch properties.
                        yOffset.incFetch = true;
                        yOffset.pageSize = parseInt(this.height, 10) - 100;
                    }
                }
                
                // Store the modified config back on the instance.
                this.scrollerConfig = cfg;
                
                // Call the super
                return this._super();
            },
            
            /**
             * Overridden to attach an event listener to the scroller for incremental fetch.
             * 
             * @ignore
             */
            initScroller: function initScroller(scroller) {
                this._super(scroller);
                
                //Store the current instance for closure...
                var me = this,
                    dataHelper = me.ifDataHelper;
                
                //Does the mobile list support incremental fetch and has the widget been initialized with a dataHelper.
                if (this.supportsIncFetch && dataHelper) {
                    
                    //Attach an event listener on the scroller whenever it needs more data...
                    scroller.attachEventListener('incFetch', this.id, function () {
                        
                        //Get the next block of data from the data helper. 
                        dataHelper.next({
                            /**
                             * Callback for when the task returns successfully. This method 
                             * 
                             * 1. Gets the new set of items and updates the items property of the MobileList silently 
                             * 2. Builds the markup for the newly retreived items
                             * 3. Changes the innerHTML of the itemsContainerNode.
                             * 4. Updates the selections, if any changes...
                             * 5. Updates the scroller config to reflect the new items.
                             */
                            success: function(e, items){
                                me.addItems(items || e.items);
                                me._scroller.STATUS_INC_FETCH = false;
                            },
                            
                            /**
                             * Callback for when the task returns with a failure.
                             * 
                             * Alerts the task's error message.
                             */
                            failure: function(res){
                              alert("Error in fetching next: " + res);
                            }
                        });
                    });
                }
            },
            
            addItems: function addItems(items) {
                var start = this.items.length;
                this._super(items);
                var end = this.items.length;
                if ( end > start) {
                    this.itemsContainerNode.innerHTML += this._buildItemsMarkup(start, end - 1).join('');
                }
                
                //Update the scroller config.
                this.updateScroller();
            }, 
            
            touchTap: function touchTap(touch) {
                // Select the element.
                var item = getTouchedElement.call(this, touch);
                if (item) {
                    if (!this.multiSelect) {
                        this.singleSelect(item.value);
                    } else {
                        // Grab the selected indices and figure out whether we need to perform an add or remove.
                        var si = this.selectedIndices,
                            idx = parseInt(item.value, 10),
                            m = (si[idx]) ? 'remove' : 'add';
                        
                        // Trigger the addSelect or removeSelect method.
                        this[m + 'Select'](idx);
                    }
                }
            },
            
            onclick: function onclick(e) {
                this.touchTap(e.e);
            },
            
            touchSelectBegin: function touchSelectBegin(touch) {
                // Highlight the element.
                var item = getTouchedElement.call(this, touch);
                if (item) {
                    $C.addClass(item.node, 'selected');
                }
                
                this._super(touch);
            },            
            
            touchSelectMove: function touchSelectMove(touch) {
                // Cache that this is a select move.
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
                    // Remove the highlight that we added in touchSelectBegin.
                    var item = getTouchedElement.call(this, touch);
                    if (item) {
                        $C.removeClass(item.node, 'selected');
                    }
                    
                    this._super(touch);
                }
            }
        }
    );
    
}());