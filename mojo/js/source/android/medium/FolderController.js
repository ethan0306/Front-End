/**
 * FolderController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Booklet-based folder controller.
 */
(function () {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController",
                         "mstrmojo.android.EnumMenuOptions");

	mstrmojo.requiresDescs(773);

    /**
     * @private
     */
    var CLASS_NAME = 'mstrmojo.android.medium.FolderController',
    
        /**
         * Action constants
         *
         * @type Integer
         * @private
         */
        REFRESH = mstrmojo.android.EnumMenuOptions.REFRESH;

    /**
     * Loads a folder into the booklet.
     * 
     * @param curFrame Optional parameter used to get the current frame. Used only for refresh.
     * 
     * @private
     */
    function loadFolder(params, curFrame) {
        var controller = this,
            refresh = params.refreshOnly;
        
        params.csp = controller.csp;
        controller.dataService.getData(params, {
            success: function (res) {
                //We need to create a new view only if we're browsing to a new folder, not when we're refreshing.
                var createView = !refresh,
                    frame;
                
                //Do we need to create a new view.
                if (createView) {
                    // Create frame view.
                    frame = controller.newView('Folder', {
                        controller: controller
                    });
                } else {
                    //Else, re-use the old view.
                    frame = curFrame;
                }
                
                // Update the title (default to the title from the parameters if not found in the response).
                frame.updateTitle(res.n || params.ttl);
                
                // Set data on frame content view.
                frame.getContentView().setData(res);
                
                if (createView) {
                    // Add view to controller.
                    controller.addView(frame);
                }
            },
            failure: function (details) {
                controller.viewFailed(details);
            }
        }, refresh);
    }
    
    /**
     * Booklet-based folder controller.
     * 
     * @class
     * @extends mstrmojo.MobileBookletController
     * 
     */
    mstrmojo.android.medium.FolderController = mstrmojo.declare(
            
        mstrmojo.MobileBookletController,
        
        null,

        /**
         * @lends mstrmojo.android.medium.FolderController.prototype
         */
        {
            scriptClass: "mstrmojo.android.medium.FolderController",
            
            init: function init(params) {
                this._super(params);
                
                // Do we NOT have a data provider already?
                if (!this.dataService) {
                    // Use the app factory to create a folder data service.
                    this.dataService = mstrApp.viewFactory.newFolderDataService();
                }
            },

            start: function start(params) {
                // Load the first folder.
                loadFolder.call(this, params);
                this.csp = params.csp;
            },
            
            /**
             * Handles the passed request, or delegates it to another controller who can.
             * 
             * @param {Object} params An object with parameters for this request.
             * @param {Boolean} delegate If true, this controller will spawn another controller (based on view key) to handle this request.
             */
            handleRequest: function handleRequest(params, delegate) {
                // Can we handle this?
                if (!delegate) {
                    // Load the folder.
                    loadFolder.call(this, params);
                    
                } else {
                    // Spawn new controller.
                    this.spawn(mstrApp.viewFactory.newScreenController(this.getViewKey(params.st), params), params);
                }
            },
            
            /**
             * This callback gets invoked by the view's postSelectionChange to let the controller handle the request.
             * 
             * @param params Object which has information about the selected item in the mstrmojo.android.medium.FolderView.
             */
            openObject: function openObject(params) {
                $MAPF(true, CLASS_NAME);
                try {
                    // Handle the request (for folders) or delegate for others.
                    this.handleRequest(params, (params.st !== 2048));
                    
                } finally {
                    $MAPF(false, CLASS_NAME);
                }
            },
            
            /**
             * Given the view, it refreshes the contents of that folder.
             * 
             * @param view The content view for the controller.
             */
            handleRefresh: function handleRefresh(view) {
                var refreshParams = {};
                
                //Make a copy of the view's data to pass as task params...
                mstrmojo.hash.copy(view.params, refreshParams);
                
                //Update the parameters needed to update the view.
                refreshParams.refreshOnly = true;
                
                //Get new data for this view.
                loadFolder.call(this, refreshParams, view.parent);
            },
            
            /**
             * Handles the request delegated to the view to populate the action menus for that view.
             * 
             * @param config The configuration object that stores the action menu information.
             */
            populateMenu: function populateMenu(config) {
                // Add Refresh grouping item
                config.addItem(REFRESH, mstrmojo.desc(773, 'Refresh'), REFRESH, true, 5);
            },
            
            /**
             * Handles the request delegated from the view to handle the menu item actions.
             * 
             * @param group The menu group
             * @param command The 
             */
            handleMenuItem: function handleMenuItem(group, command) {
                //Check if the user clicked on the refresh menu option and if yes, handle it.
                switch (group) {
                case REFRESH:
                    this.handleRefresh(command.view);
                    break;
                }
            }
        }
    );
}());