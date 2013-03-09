/**
 * AndroidProjectController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Booklet-based project browser controller.
 */
(function() {

    mstrmojo.requiresCls("mstrmojo.android.medium.FolderController",
                         "mstrmojo.hash");
                         
	mstrmojo.requiresDescs(3373,7832,8394);

    /**
     * @private
     */
    var CLASS_NAME = 'mstrmojo.android.medium.ProjectController';

    /**
     * Booklet-based project browser controller.
     * 
     * @class
     * @extends mstrmojo.android.medium.FolderController
     * 
     */
    mstrmojo.android.medium.ProjectController = mstrmojo.declare(
            
        mstrmojo.android.medium.FolderController,
        
        null,

        /**
         * @lends mstrmojo.android.medium.ProjectController.prototype
         */
        {
            scriptClass: "mstrmojo.android.medium.ProjectController",

            start: function start(params) {
                // Build a list of projects (in mstrmojo.android.medium.FolderView items forms).
                var projList = [];
                mstrmojo.hash.forEach(mstrApp.getConfiguration().getProjectHash(), function (project) {
                    projList.push({
                        did: project.pid,
                        n: project.pn,
                        desc: project.sn,
                        st: "Project",
                        t: 8,
                        rtf: project.rtf
                    });
                });
                
                if ( projList.length < 1 ) {
                    throw new Error(mstrmojo.desc(8394, "No projects configured."));
                }   
                this.csp = params.csp;
                // Create a folder view.
                var frame = this.newView('Folder', {
                    controller: this
                });
                
                frame.updateTitle(mstrmojo.desc(7832, 'Shared Library'));
                
                // Set projects as data of folder view.
                frame.getContentView().setData({
                    items: projList
                });
                
                // Add new view.
                this.addView(frame);
            },
            
            openObject: function openObject(params) {
                $MAPF(true, CLASS_NAME);
                
                try {
                    //User has selected his/her project. Tell the app the current project id.
                    mstrApp.setCurrentProjectId(params.did);
                    
                    var rtf = params.rtf;
                    if ( rtf ) {
                        params.did = rtf.did;
                        params.folderID = rtf.did;
                    } else {
                        // Set the system folder to shared reports.
                        params.systemFolder = 7;
                    }
                    
                    params.st = 2048;                    
                    params.csp = this.csp;
                    
                    // Handle the request (for folders) or delegate for others.
                    this.handleRequest(params, true);
                    
                } finally {
                    $MAPF(false, CLASS_NAME);
                }
            },
            
            /**
             * Doesn't support any menu items yet.
             * @extends mstrmojo.android.medium.FolderController
             */
            populateMenu: mstrmojo.emptyFn,
            
            /**
             * Doesn't support any menu items yet.
             * 
             * @extends mstrmojo.android.medium.FolderController
             */
            handleMenuItem: mstrmojo.emptyFn
        });
}());