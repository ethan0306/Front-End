(function () {
    
    mstrmojo.requiresCls("mstrmojo.DocDataService", 
                         "mstrmojo._ResultSetXt");
    
    var docObjType = {
        objectType: 55
    };
    var $C = mstrmojo.hash.copy;
    
    /**
     * <p>A report services document data provider with the ability to execute report services documents.</p>
     * 
     * @class
     * @extends mstrmojo.DocDataService
     */
    mstrmojo.DocDataServiceXt = mstrmojo.declare(
        mstrmojo.DocDataService,

        [ mstrmojo._ResultSetXt ],

        /*
         * @lends mstrmojo.DocDataServiceXt.prototype
         */
        {
            scriptClass: "mstrmojo.DocDataServiceXt",
            
            /**
             * Executes Object.
             * 
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if document is not prompted. The parameter passed to this function will the data from the object execution.
             * @param {Function} callback.prompts A function called if document is prompted. The parameter passed to this function will contain the prompts data.
             * @param {Function} callback.failure A function called if the request failed. 
             * @param {Object} resParams The polling result function parameters
            */
            execute: function execute(params, callback, resParams) {
                var request = mstrmojo.hash.copy(params, {});
                
                // Add taskId.
                request.taskId = 'RWExecute';
                
                // Does the request not already have an objectID?
                if (!request.objectID) {
                    request.objectID = (params && params.dssId) || this.dssId;
                }
                 
                // Cache the dssId
                this.dssId = request.objectID;
                
                // Call super.
                this._super(request, callback, resParams);
            },
             
            /**
             * Gets object execution results.
             * 
             * @param {Function} callback.success A function called if the request succeeds. The parameter passed to this function will contain executed object data.
             * @param {Function} callback.failure A function called if the request failed. 
             */
            getResults: function getResults(params, callback) {  
                params = params || {};
                params.taskId = params.taskId || 'androidRWExecute';
                params.styleName = params.styleName || 'RWDocumentMobileStyle';
                params.useTerseElementId = params.useTerseElementId || 1;
                 
                // Add content screen dimension information for fit to page, fit to width feature.
                var dim = mstrApp.getContentDimensions();
                params.availableWidth = dim.w;
                params.availableHeight = dim.h;
                
                this._super(params, this.wrapCallback(callback));
            },
             
            /**
             * Answers prompts.
             * 
             * @param {String} answer An answer XML.
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if prompts answered successfully. The parameter passed to this function will be the data from the object execution.
             * @param {Function} callback.prompts A function called if document is prompted. The parameter passed to this function will contain the prompts data.
             * @param {Function} callback.failure A function called if the request failed. 
             */
            answerPrompts: function answerPrompts(prompts, callback) {
                this._super(prompts, this.wrapCallback(callback), $C(docObjType));
            },
             
            /**
             * Get prompts.
             * 
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if prompts answered successfully. The parameter passed to this function will be the data from the object execution.
             * @param {Function} callback.failure A function called if the request failed. 
             */
            loadPrompts: function loadPrompts(callback) {
                this._super(this.wrapCallback(callback), $C(docObjType));
            }
        }
    );
}());
