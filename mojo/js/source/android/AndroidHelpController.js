/**
  * AndroidHelpController.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>Controller that drives display and editing of project.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */

(function() {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController");

	mstrmojo.requiresDescs(1143);

    /**
     * 
     * 
     * @class
     * @extends mstrmojo.MobileBookletController
     * 
     */
    mstrmojo.android.AndroidHelpController = mstrmojo.declare(
        mstrmojo.MobileBookletController,
        null,

        /**
         * @lends mstrmojo.AndroidHelpController.prototype
         */
        {
            scriptClass: "mstrmojo.android.AndroidHelpController",

            start: function start() {
                // Create new view to display the device settings.
                var frame = this.newView('Help', {});        
                
                // Update the frame's title to be the web server's name
                frame.updateTitle(mstrmojo.desc(1143, "Help")); 
                this.addView(frame);                
            }
        });
})();

