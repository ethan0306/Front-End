/**
 * HomeScreenController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */

(function () {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController");

    /**
     * @private
     */
    var CLASS_NAME = 'mstrmojo.android.medium.HomeScreenController';

    /**
     * Home screen controller for a custom Android home screen.
     * 
     * @class
     * @extends mstrmojo.MobileBookletController
     */
    mstrmojo.android.medium.HomeScreenController = mstrmojo.declare(
            
        mstrmojo.MobileBookletController,
        
        null,

        /**
         * @lends mstrmojo.android.medium.HomeScreenController.prototype
         */
        {
            scriptClass: "mstrmojo.android.medium.HomeScreenController",
            
            start: function start(params) {
                // Create the home screen view.
                var hs = mstrApp.viewFactory.newView('HomeScreen', {
                    controller: this
                });   
                                 
                // Pass the homescreen configuration to the view.
                hs.setData(mstrApp.getConfiguration().getHomeScreen());   
                         
                // Display the view.
                this.addView(hs);
            },

            /**
             * Creates and activates either controller or view based on the action
             * parameters.
             *
             * @param {Object} action An object containing action parameters. (Please notice
             * that this method modifs action object).
             * 
             */
            execAction: function execAction(action) {
                $MAPF(true, CLASS_NAME);
                try {
                    // Get the view key.
                    var getVK = this.getViewKey,
                        viewKey = (action.type === 'Object') ? getVK(action.st) : getVK(action.type);
                        
                    // Is this the Help view key?
                    if (viewKey === 'Help') {
                        mstrApp.displayHelp();
                        return;
                    }
                        
                    // Is the view key an empty string?
                    if (viewKey === '') {
                        // Use the action type.
                        viewKey = action.type;
                    }
                    
                    // Remove the action type.
                    delete action.type;
                    
                    // Are we trying to browse the shared library?
                    if (viewKey === getVK(5)) {
                        var deviceConfig = mstrApp.getConfiguration(),
                            projectCount = deviceConfig.getProjectCount();
                        
                        // Do we only have one project configured?
                        if (projectCount === 1) {
                            // Skip the project controller and move directly to the shared library of the sole project.
                            // Change the viewKey to folder browsing.
                            viewKey = getVK(2048);
                            
                            // By default browse to system folder 7 "Shared Reports"
                            action.systemFolder = 7;
                            
                            // Get the sole project id
                            action.pid = mstrmojo.hash.any(deviceConfig.getProjectHash(), true);
                        }
                    }

                    // Pass the new project ID to the application.
                    mstrApp.setCurrentProjectId(action.pid);
                    delete action.pid;
                    
                    // Spawn the controller.
                    this.spawn(mstrApp.viewFactory.newScreenController(viewKey, action), action);
                    
                } catch (ex) {
                    
                    //Throw the exception, so that it can be handled by the underlying classes. 
                    throw ex;
                } finally {
                    $MAPF(false, CLASS_NAME);
                }
            }
        }
    );
}());