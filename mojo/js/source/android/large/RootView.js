(function() {

    mstrmojo.requiresCls("mstrmojo.android.AndroidMainView",
                         "mstrmojo.android._IsRootView",
                         "mstrmojo._FillsBrowser",
                         "mstrmojo.dom");
    
    /**
     * Main Widget class for large form factor Android applications.
     * 
     * @class
     * @extends mstrmojo.android.AndroidMainView
     * 
     * @borrows mstrmojo._FillsBrowser
     * @borrows mstrmojo.android._IsRootView
     */
    mstrmojo.android.large.RootView = mstrmojo.declare(
        mstrmojo.MobileBooklet,


        [ mstrmojo._FillsBrowser, mstrmojo.android._IsRootView ],

        /**
         * @lends mstrmojo.android.large.RootView.prototype
         */
        {
            scriptClass: "mstrmojo.android.large.RootView",
            
            /**
             * Asks the native shell to capture a screen shot of the given DOM Element.
             * 
             * @param {HTMLElement} el The element to capture.
             * @param {String} id The id that will be used to retrieve the screen shot.
             */
            takeScreenShot: function takeScreenShot(el, id) {
                // Do we NOT have an element?
                if (!el) {
                    return;
                }
                
                // Get preview size and position of element to capture.
                var preview = this.controller.browser.getPreviewSize(),
                    position = mstrmojo.dom.position(el);

                //TQMS 544047. When we start with a document we don't know preview size at this point.
                if ( preview ) {
                    // Ask app to take the screen shot.
                    mstrMobileApp.takeScreenShot(JSON.stringify({
                        pid: mstrApp.getCurrentProjectId(),
                        dssId: id,
                        x: position.x,
                        y: position.y,
                        w: position.w,
                        h: position.h,
                        pw: preview.w,
                        ph: preview.h
                    }));
                }
            }
            
        });
}());