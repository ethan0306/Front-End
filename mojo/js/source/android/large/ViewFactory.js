(function () {
    
    mstrmojo.requiresCls("mstrmojo.android.ViewFactory",
                         "mstrmojo.android.large.RootController",
                         "mstrmojo.android.large.RootView",
                         "mstrmojo.android.large.AppBrowser");
    
    /**
     * <p>A factory for creating {@link mstrmojo.android.AndroidMainView} instances.</p>
     * 
     * @class
     * @extends mstrmojo.android.ViewFactory
     * @public
     */
    mstrmojo.android.large.ViewFactory = mstrmojo.declare(
        mstrmojo.android.ViewFactory,
        
        null,
        
        /**
         * @lends mstrmojo.android.large.ViewFactory
         */
        {
            scriptClass: 'mstrmojo.android.large.ViewFactory',
            
            /**
             * Creates application root view
             * 
             * @param {String} params.id A view ID.
             * @param {String} params.placeholder A view placeholder.
             * 
             * @returns mstrmojo.android.medium.RootView
             */
            newRootView: function newRootView(params) {
                return new mstrmojo.android.large.RootView(params);
            },
            
            /**
             * Creates Application root controller
             * 
             * @param {String} params.id A controller id.
             * @param {mstrmojo.MobileBooklet} params.booklet A booklet to control.
             * 
             * @returns {mstrmojo.android.medium.RootController}
             */
            newRootController: function newRootController(params) {
                return new mstrmojo.android.large.RootController(params);
            },
            
            newHomeScreenView: function newHomeScreenView(params) {
                return this.newFramedView(params, mstrmojo.android.large.AppBrowser);
            }
        }
    );
}());