(function() {
    
    /**
     * <p>A mixin that adds lingering selections to Android lists.</p>
     * 
     * <p>Lists that consume this mixin will show items as selected for 800 milliseconds after rendering.</p>
     * 
     * @class
     * @public
     */
    mstrmojo.android._HasLingeringListSelections = mstrmojo.provide(
            
        "mstrmojo.android._HasLingeringListSelections",
        
        /**
         * @lends mstrmojo.android._HasLingeringListSelections.prototype
         */
        {
            _mixinName: 'mstrmojo.android._HasLingeringListSelections',
            
            /**
             * Need to use a selection policy of reselect in case user tries to reselect before selections are cleared by timer.
             * 
             * @type String
             * @ignore
             */
            selectionPolicy: 'reselect',
            
            /**
             * If the list has a selectedIndex this method will clear all selections after the delay elapses.
             * 
             * @param {Integer} delay The number of milliseconds to delay before clearing selections.
             */
            setClearHandler: function setClearHandler(delay) {
                var idx = this.selectedIndex,
                    id = this.id;
                
                // Do we have a selected item?
                if (idx > -1) {
                    // Create timeout (cache handle).
                    this._clearHandler = window.setTimeout(function () {
                        var list = mstrmojo.all[id];
                        
                        // if the list exists (it may not if it's containing view has been destroyed during the timeout) 
                        if ( list ) {
                            // Has the selection not changed?
                            if ( list.selectedIndex === idx) {
                                // Clear select.
                                list.clearSelect();
                            }
                            // Delete handle.
                            delete list._clearHandler;
                        }
                        
                    }, delay);
                }
            },
            
            /**
             * Sets timeout to clear selections. 
             * 
             * @ignore
             */
            postBuildRendering: function postBuildRendering() {
                this._super();
                
                // Enable selection clearing in 800 milliseconds.
                this.setClearHandler(800);
            },
            
            /**
             * Clears selection clear timeout when the user selects a new item.
             * 
             * @ignore
             */
            preselectionChange: function preselectionChange(evt) {
                // Do we have a selection handler?
                var selectionHandler = this._clearHandler;
                if (selectionHandler) {
                    // Clear the timeout...
                    window.clearTimeout(selectionHandler);
                    
                    // and delete the reference.
                    delete this._clearHandler;
                }
            }
        });
}());