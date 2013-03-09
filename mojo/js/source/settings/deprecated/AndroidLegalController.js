/**
  * AndroidLegalController.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>Controller that drives display and editing of project.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */

(function() {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController");

    /**
     * 
     * 
     * @class
     * @extends mstrmojo.MobileBookletController
     * 
     */
    mstrmojo.settings.AndroidLegalController = mstrmojo.declare(
        mstrmojo.MobileBookletController,
        null,

        /**
         * @lends mstrmojo.AndroidLegalController.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidLegalController",

            start: function start() {
                // Create new view to display the device settings.
                var frame = this.newView('Legal', {});        
                
                // Update the frame's title to be the web server's name
                frame.updateTitle("Legal");
                
                // Get the content view (this should be our LegalView) and pass along the project details to the view, and display the view.
                // frame.getContentView().setData({});
            
                this.addView(frame);                
            }
                        
        });
})();

