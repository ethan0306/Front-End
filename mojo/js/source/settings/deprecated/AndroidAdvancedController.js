/**
  * AndroidadvancedController.js
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
    mstrmojo.settings.AndroidAdvancedController = mstrmojo.declare(
        mstrmojo.MobileBookletController,
        null,

        /**
         * @lends mstrmojo.AndroidAdvancedController.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidAdvancedController",

            start: function start() {
                // Create new view to display the device settings.
                var frame = this.newView('AdvancedSettings', {});        
                
                // Update the frame's title to be the web server's name
                frame.updateTitle("Advanced");
                
                // Get the content view (this should be our AdvancedView) and pass along the project details to the view, and display the view.
                frame.getContentView().setData(this.settings.gnl, this.settings.cacheEnabled, this.settings.connectionMode);
            
                this.addView(frame);                
            },
            
            handleWriteSettings: function goBack() {
                var cv = this.firstView.contentChild;
                var g = this.settings.gnl;
                      
                g.nt = cv.netTimeout.value;
                g.mgc = cv.maxGridCols.value;
                g.ml = parseInt( cv.memLimit.getSelectedValue(),10);
                g.fc = parseInt( cv.fldrCaching.getSelectedValue(),10);
                g.cc = parseInt( cv.clrClose.getSelectedValue(),10);
                g.ll = parseInt( cv.logLvl.getSelectedValue(),10);
                g.mls = cv.maxLog.value;   
                g.ll = parseInt( cv.logLvl.getSelectedValue(),10);             

                var cacheEnabled = cv.reportCaching.getSelectedIndex();
                if ( ! cacheEnabled ) {
                    mstrApp.getResSetStoreMgr().clear();
                }
                mstrApp.getConfiguration().setCacheEnabled(cacheEnabled);
                mstrApp.getConfiguration().setBinaryMode(cv.connection.getSelectedValue());
            }
            
            
        });
})();

