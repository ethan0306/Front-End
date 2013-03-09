/**
  * FolderDataService.js
  * Copyright 2010-2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0
  */
  /*
  * @fileoverview <p>Widget for displaying folder contents on Android devices.</p>
  * @author <a href="mailto:mhaugen@microstrategy.com">Mark Haugen</a>
  * @version 1.0
  */
(function () {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.hash");

    var CLASS_NAME = 'FolderDataService';

    /**
     * Folder data provider.
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.FolderDataService = mstrmojo.declare(
        mstrmojo.Obj,

        null,

        /**
         * @lends mstrmojo.FolderDataService.prototype
         */
        {
            scriptClass: "mstrmojo.FolderDataService",


            getData: function getData(params, callback, refresh) {
                $MAPF(true, CLASS_NAME);

                try {
                    // Retieve folder ID or use cached value.
                    var folderId = (params && params.did) || this.did,
                        rtf = params.rtf;

                    // Get common folder browsing parameters.
                    params = mstrmojo.hash.copy(params, {
                        taskId: 'folderBrowse',
                        styleName: 'MojoFolderStyle',
                        includeObjectDesc: true,
                        objectType: '8,3,55',
                        useEncoding: true,
                        dereferenceShortcuts: false
                    });

                    // TQMS#496011 are we getting data for a project with a root folder property?
                    if ( rtf ) {                        
                        // yes, browse to the specified root folder rather than the system folder
                        params.did = rtf.did;
                        params.folderID = rtf.did;
                        
                    // is there NOT a system folder specified?
                    } else if (params && !params.systemFolder) {
                        
                        // use the provided folder ID
                        params.folderID = folderId;
                    }

                    //Do we want to ask the folder browser to refresh?
                    if (refresh) {
                        //Append a refresh parameter to the task.
                        params.refresh = true;
                    }

                    // Pass server request to the mobile app.
                    mstrApp.serverRequest(params, callback, {
                        src: CLASS_NAME + '::getData',
                        override: true,
                        showWait: true,
                        hideWait: true,
                        delay: false
                    });

                    // Return false to indicate that we are retrieving data from the server.
                    return false;

                } finally {
                    $MAPF(false, CLASS_NAME);
                }
            }
        }
    );
}());