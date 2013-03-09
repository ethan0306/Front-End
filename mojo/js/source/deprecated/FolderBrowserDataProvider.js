(function () {
    mstrmojo.requiresCls("mstrmojo.hash");
    
    /**
     * Exposes methods for executing folder browse and creation task calls.
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.FolderBrowserDataProvider = mstrmojo.declare(

        mstrmojo.Obj,

        null,

        /**
         * @lends mstrmojo.FolderBrowserDataProvider.prototype
         */
        {
            scriptClass: "mstrmojo.FolderBrowserDataProvider",

            /**
             * Executes the "folderBrowse" task with the supplied parameters.
             * 
             * @param {Object} params The parameters to be passed to the "search Metadata" task call (excluding taskId and styleName).
             * @param {Object} [callback] An optional callback interface with functions to be called after the task has been executed.
             * @param {Function} [callback.success] An optional Function to call when the task request succeeds.
             * @param {Function} [callback.failure] An optional Function to call when the task request fails.
             * @param {Function} [callback.complete] An optional Function to call when the task request is complete (regardless of status).
             * @param {String} [style=MojoFolderStyle] An optional style (from the styleCatalog) that the task should use to determine the response.
             * @param {Boolean} [customTransport=false] If TRUE this method will return the XHR parameters rather than submitting them via XHR.  
             */
            searchMetadata: function searchMetadata(params, callback, style, customTransport) {
                var xhrParams = mstrmojo.hash.copy(params, {
                    taskId: 'folderBrowse', 
                    styleName: style || 'MojoFolderStyle',
                    taskEnv: 'xhr',
                    taskContentType: 'json'
                });
                
                if (!!customTransport) {
                    return xhrParams;
                } else {
                    mstrmojo.xhr.request('GET', this.path || mstrConfig.taskURL, callback, xhrParams, undefined, this.XServer, this.baseParams);
                }
            },
            
            /**
             * Executes the "createFolder" task to create a folder.
             * 
             * @param {String} parentId The id of the new folders parent folder.
             * @param {String} name The name of the new folder.
             * @param {String} [description] An optional description for the new folder.
             * @param {Object} [callback] An optional callback interface with functions to be called after the task has been executed.
             * @param {Function} [callback.success] An optional Function to call when the task request succeeds.
             * @param {Function} [callback.failure] An optional Function to call when the task request fails.
             * @param {Function} [callback.complete] An optional Function to call when the task request is complete (regardless of status).
             */
            createFolder: function createFolder(parentId, name, description, callback){
                mstrmojo.xhr.request('GET', this.path || mstrConfig.taskURL, callback, {
                    taskId: 'createFolder',
                    folderID: parentId,
                    name : name,
                    description : description || ''
                });
            }
        }
    );
    
})();