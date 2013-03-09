(function () {
    
    /**
     * <p>A mixin that adds incremental fetch functionality to subclasses of {@link @mstrmojo.ListBase}.</p>
     * 
     * @class
     * @public
     */
    mstrmojo.android._IsIncFetchList = mstrmojo.provide(
            
        "mstrmojo.android._IsIncFetchList",
        
        /**
         * @lends mstrmojo.android._IsIncFetchList.prototype
         */
        {
            _mixinName: 'mstrmojo.android._IsIncFetchList',
            
            /**
             * Supports incremental fetch.
             * 
             * @ignore
             */
            supportsIncFetch: true,
            
            /**
             * This property should be set to a data helper that provides an interface for the widget to get the next block of data.
             */
            ifDataHelper: null,
            
            /**
             * Overridden to attach an event listener to the scroller for incremental fetch.
             * 
             * @ignore
             */
            initScroller: function initScroller(scroller) {
                this._super(scroller);
                
                // Does the list have a data helper?
                var dataHelper = this.ifDataHelper;
                if (dataHelper) {
                    //Attach an event listener on the scroller whenever it needs more data...
                    scroller.attachEventListener('incFetch', this.id, function () {
                        var me = this;
                        
                        //Get the next block of data from the data helper. 
                        dataHelper.next({
                            success: function (e, items) {
                                me.addItems(items || e.items);
                                me._scroller.STATUS_INC_FETCH = false;
                            },
                            
                            failure: function (res) {
                                alert("Error in fetching next: " + res);
                            }
                        });
                    });
                }
            },
            
            /**
             * Overridden to update scroller config with incremental fetch properties.
             * 
             * @ignore
             */
            updateScrollerConfig: function updateScrollerConfig() {
                var cfg = this._super(),
                    incFetch = this.supportsIncFetch;
                
                // Can the list scroll?
                if (cfg.vScroll) {
                    var yOffset = cfg.offset.y;
                    
                    // Set the incremental fetch properties.
                    yOffset.incFetch = incFetch;
                    yOffset.pageSize = incFetch ? (parseInt(this.height, 10) - 100) : 0;
                    
                    // Store the configuration back on the instance.
                    this.scrollerConfig = cfg;
                }
                
                return cfg;
            },
            
            /**
             * Overridden to render new markup and update scroller.
             * 
             * @ignore
             */
            addItems: function addItems(items) {
                // Call super.
                this._super(items);
                
                // Get the new count.
                var end = this.items.length;
                
                //Do we need to fetch more elements? Set the incremental fetch flag appropriately
                this.supportsIncFetch = (end < this.ifDataHelper.totalSize);

                // Do we have a scroller?
                if (this.updateScroller) {
                    // Update the scroller config.
                    this.updateScroller();
                }
            }
        }
    );
}());