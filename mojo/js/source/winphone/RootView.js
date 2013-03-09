(function() {

    mstrmojo.requiresCls("mstrmojo.android.medium.RootView", 
                         "mstrmojo.winphone._IsMobileBookletWinPhone");      
    
    /**
     * RootView class for Windows phone
     * 
     * @class
     * @extends mstrmojo.android.medium.RootView
     * 
     * @borrows mstrmojo.winphone._IsMobileBookletWinPhone
     */
    mstrmojo.winphone.RootView = mstrmojo.declare(
            
        mstrmojo.android.medium.RootView,

        [ mstrmojo.winphone._IsMobileBookletWinPhone ],

        /**
         * @lends mstrmojo.android.medium.RootView.prototype
         */
        {
            scriptClass: "mstrmojo.winphone.RootView"
        });
})();