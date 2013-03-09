(function() {

    mstrmojo.requiresCls("mstrmojo.MobileDoc", 
                         "mstrmojo.winphone._IsMobileBookletWinPhone");      
    
    /**
     * MobileDoc class for Windows phone
     * 
     * @class
     * @extends mstrmojo.MobileDoc
     * 
     * @borrows mstrmojo.winphone._IsMobileBookletWinPhone
     */
    mstrmojo.winphone.MobileDoc = mstrmojo.declare(
            
        mstrmojo.MobileDoc,

        [ mstrmojo.winphone._IsMobileBookletWinPhone ],

        /**
         * @lends mstrmojo.android.medium.RootView.prototype
         */
        {
            scriptClass: "mstrmojo.winphone.RootView"
        });
})();