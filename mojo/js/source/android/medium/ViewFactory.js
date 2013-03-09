(function () {
    
    mstrmojo.requiresCls("mstrmojo.android.ViewFactory",
                         "mstrmojo.android.medium.HomeScreenController",
                         "mstrmojo.android.medium.HomeScreen",
                         "mstrmojo.android.medium.FolderController",
                         "mstrmojo.android.medium.FolderView",
                         "mstrmojo.android.medium.ProjectController",
                         "mstrmojo.android.medium.RootView",
                         "mstrmojo.android.medium.RootController");
    
    /**
     * <p>A static factory for creating {@link mstrmojo.android.AndroidMainView} instances.</p>
     * 
     * @class
     * @extends mstrmojo.android.ViewFactory
     * @public
     */
    mstrmojo.android.medium.ViewFactory = mstrmojo.declare(
        mstrmojo.android.ViewFactory,
        
        null,
        
        /**
         * @lends mstrmojo.android.medium.ViewFactory
         */
        {
            scriptClass: 'mstrmojo.android.medium.ViewFactory',
            
            /**
             * Creates application root view
             * 
             * @param {String} params.id A view ID.
             * @param {String} params.placeholder A view placeholder.
             * 
             * @returns mstrmojo.android.medium.RootView
             */
            newRootView: function newRootView(params) {
                return new mstrmojo.android.medium.RootView(params);
            },
            
            /**
             * Creates Application root controller
             * 
             * @param {String} params.id A controller id.
             * @param {mstrmojo.MobileBooklet} params.booklet A booklet to control.
             * 
             * @returns {mstrmojo.android.medium.RootController}
             */
            newRootController: function newRootController(params) {
                return new mstrmojo.android.medium.RootController(params);
            },
            
            /**
             * Creates Home Screen view
             * 
             * @param {MobileBookletController} params.controller A view controller.
             * 
             * @returns {mstrmojo.android.medium.HomeScreen}
             */
            newHomeScreenView: function newHomeScreenView(params) {
                return new mstrmojo.android.medium.HomeScreen(params);
            },
            
            /**
             * Creates Folder view
             * 
             * @param {MobileBookletController} params.controller A view controller.
             * @param {String} params.ttl A view title.
             * @param {String} params.did A folder ID.
             * 
             * @returns {mstrmojo.android.medium.FolderView}
             */
            newFolderView: function newFolderView(params) {
                return this.newFramedView(params, mstrmojo.android.medium.FolderView);
            },
            
            /**
             * Creates homescreen controller
             * 
             * @param {String} params.id A controller id.
             * @param {mstrmojo.MobileBooklet} params.booklet A booklet to control.
             * 
             * @returns {mstrmojo.android.medium.HomeScreenController}
             */
            newHomeScreenController: function newHomeScreenController(params) {
                return new mstrmojo.android.medium.HomeScreenController(params);
            },

            /**
             * Creates Folder controller
             * 
             * @param {String} params.ttl A view title.
             * @param {String} params.did A folder ID.
             * 
             * @returns {mstrmojo.android.medium.FolderController}
             */
            newFolderController: function newFolderController(params) {
                return new mstrmojo.android.medium.FolderController(params);
            },

            newFolderScreenController: function newFolderScreenController(params) {
                return this.newFolderController(params);
            },
            
            /**
             * Creates a new projects controller.
             * 
             * @param {Object} params A controller-specific params
             * 
             * @returns {mstrmojo.android.medium.ProjectController} A controller to display the project list.
             */
            newProjectsController: function newProjectsController(params) {
                return new mstrmojo.android.medium.ProjectController(params);
            },
            
            newProjectsScreenController: function newProjectsController(params) {
                return this.newProjectsController(params);
            }
        }
    );
}());