/**
  * ProjectEditController.js
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
    mstrmojo.settings.AndroidProjectEditController = mstrmojo.declare(
        mstrmojo.MobileBookletController,
        null,

        /**
         * @lends mstrmojo.AndroidProjectEditController.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidProjectEditController",

            start: function start() {
                // Create new view to display the device settings.
                var frame = this.newView('ProjectEdit', {});        
                
                // Update the frame's title to be the web server's name
                frame.updateTitle("Project");
                
                // Get the content view (this should be our ProjectEditView) and pass along the project details to the view, and display the view.
                frame.getContentView().setData(this.prj);
            
                this.addView(frame);                
            },
            
            handleWriteSettings: function() {

                // before performing the back operation, check to see if the user is trying to cancel the addition of a new project.
                
                var cv = this.firstView.getContentView(),
                    is_new = this.is_new,
                    p = this.prj,         
                    pn = cv.projectName.value,
                    sn = cv.prjServer.value,
                    am = parseInt(cv.authType.getSelectedValue(),10),
                    lo = cv.userName.value,
                    ps = cv.password.value;                    
                if ( is_new && (pn == "") && ( sn == "" ) ) {
                    
                    // this is a newly added server with a blank name - we treat this condition as a "cancel" and delete the new project
                    // ASSUMPTION: we assume that this controller always follows a webServerEdit so prevController is a WebServerEditController
                    this.prevController.handleSettingsAction( {  vw: cv,  type: 'rmv_project', actionData: p, noconfirm: true } );
                } else {
                    var pc = p.pc;
                    
                    if ( ! is_new && (p.pn != pn || p.sn != sn || pc.am != am || (am > 0 && pc.lo != lo)) ) {
                        mstrApp.removeProjectCaches(p.pid);
                    }
                    p.pn = pn;
                    p.sn = sn;
                    
                    // get the authentication type - if "Default" is selected, set the udc property to true;
                    pc.am = am;
                    p.udc = ( am === 0 );

                    if ( am < 1 ) {
                        // if we're using DEFAULT, delete any old user name and password
                        pc.lo = pc.ps = "";
                        
                    } else {
                        pc.lo = lo;
                        pc.ps = ps;                    
                    }

                }
            }
            
            
        });
})();

