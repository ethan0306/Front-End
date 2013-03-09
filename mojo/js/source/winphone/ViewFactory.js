(function () {
    
    mstrmojo.requiresCls("mstrmojo.android.medium.ViewFactory",
                         "mstrmojo.winphone.MobileDoc");
 
    /**
     * <p>A static factory for creating windows phone specific objects.</p>
     * 
     * @class
     * @extends mstrmojo.android.medium.ViewFactory
     * @public
     */
    mstrmojo.winphone.ViewFactory = mstrmojo.declare(
        mstrmojo.android.medium.ViewFactory,
        
        null,
        
        /**
         * @lends mstrmojo.android.medium.ViewFactory
         */
        {
            scriptClass: 'mstrmojo.winphone.ViewFactory',
            
            /**
             * Creates application root view
             * 
             * @param {String} params.id A view ID.
             * @param {String} params.placeholder A view placeholder.
             * 
             * @returns mstrmojo.winphone.RootView
             */
            newRootView: function newRootView(params) {
                return new mstrmojo.winphone.RootView(params);
            },

            /**
             * Custom hook used to create MobileDoc from winphone package
             * 
             */            
            mobileDoc: mstrmojo.winphone.MobileDoc            
        }
    );
}());