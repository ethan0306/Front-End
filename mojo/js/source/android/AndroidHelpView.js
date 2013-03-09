/**
  * AndroidHelpView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>Widget for displaying the Help page on Android devices.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */

(function () {

    mstrmojo.requiresCls("mstrmojo.ui.TouchScrollableView");
                
    mstrmojo.android.AndroidHelpView = mstrmojo.declare(
        mstrmojo.ui.TouchScrollableView,
        null, /* mixins */

        /**
         * @lends mstrmojo.AndroidHelpView.prototype
         */
        {
            scriptClass: "mstrmojo.android.AndroidHelpView",
            cssClass: "help-view",
            preConfigScroller: function() {
                // if we are on a device, load up the help HTML page from the embedded resources
                var		helpMarkup;
                if ( mstrApp.onMobileDevice() ) {
                	helpMarkup = String(mstrMobileApp.getTextAsset("help/help.html"));  
                } else {
                	helpMarkup = "<div><p>Help is only available on Android devices.</p></div>";
                }                	
                // replace the content child's markup string and tell the app. we're ready to be rendered
                this.containerNode.innerHTML = helpMarkup;
            }	            
        }
    );
})();




