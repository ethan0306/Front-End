(function () {

    mstrmojo.requiresCls("mstrmojo._FillsBrowser", 
                         "mstrmojo.MobileBooklet",
                         "mstrmojo.android._IsRootView",
                         "mstrmojo.css");
    
    /**
     * Main Widget class for mobile applications.
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._FillsBrowser
     * @borrows mstrmojo.android._IsRootView
     */
    mstrmojo.android.medium.RootView = mstrmojo.declare(
        mstrmojo.MobileBooklet,

        [ mstrmojo._FillsBrowser, mstrmojo.android._IsRootView ],

        /**
         * @lends mstrmojo.android.medium.RootView.prototype
         */
        {
            scriptClass: "mstrmojo.android.medium.RootView",
            
            preBuildRendering: function preBuildRendering() {
                // Add DPI based css class.
                mstrmojo.css.addClass(document.body, 'dpi' + mstrMobileApp.getDeviceDPI());
                
                return this._super();
            },
            
            getContentDimensions: function getContentDimensions(supportsFullScreen) {
                // Use super to get dimensions.
                var dimensions = this._super();
                
                // Do we support full screen mode and are we in landscape?
                if (supportsFullScreen && dimensions.w > dimensions.h) {
                    // Reset dimensions to screen dimensions since title bar will not be visible.
                    dimensions = mstrApp.getScreenDimensions();
                }
                
                // Return calculated dimensions.
                return dimensions;
            }
        }
    );
}());