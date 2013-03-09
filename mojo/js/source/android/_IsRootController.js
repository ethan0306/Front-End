(function() {
    
    /**
     * A mixin to add Android view controller functionality.
     * 
     * @class
     * @public
     */
    mstrmojo.android._IsRootController = {
            
        _mixinName: 'mstrmojo.android._IsRootController',
        
        rootView: null,
        
        start: function start(params) {
            // Do we not have a device configuration?
            var deviceCfg = mstrApp.getConfiguration();
            if (!deviceCfg) {
                // Show error and return.
                mstrmojo.err({
                    name:'StartupError', 
                    message: 'no device configuration found.'
                });
                return false;
            }
                    
            return true;
        },
        
        /**
         * Restarts the application by killing all controllers in the chain.  Any views associated with each controller are also disposed of.
         * 
         */
        restart: function restart() {
            mstrApp.showMessage();
            
            // Start killing off the controllers leaving ourselves intact (as the root controller).
            var nextController = this.nextController;
            if (nextController) {
                
                // Detach the next controller.
                nextController.detach();
            }
            
            // Start up again.
            this.start();
        },
        
        /**
         * Returns the application to the home screen.
         * 
         */
        goHome: mstrmojo.emptyFn,

        /**
         * we are cancelling outstanding connection/task requests - make sure any "loading..." UI is hidden
         */
        cancelPending: mstrmojo.emptyFn
        
    };
}());