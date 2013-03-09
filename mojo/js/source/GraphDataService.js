(function () {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.hash",
                         "mstrmojo._ResultSetXt",
                         "mstrmojo._ReportDataService",
                         "mstrmojo._IsGraphDataService");

    var promptObjType = {
            objectType: 3
        },
        waitConfig = {
            showWait: true,
            hideWait: true
        },
        $C = mstrmojo.hash.copy;

    function getResultsParams() {
        var availableDim = mstrApp.getContentDimensions(true);

        return {
            taskId: 'getReportGraphImage',
            height: 0,
            width: 0,
            availHeight: availableDim.h,
            availWidth: availableDim.w,
            imgType: 4,
            showTooltips: true
        };
    }
    /**
     * <p>Mobile report data service.</p>
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.GraphDataService = mstrmojo.declare(
        mstrmojo.Obj,

        [ mstrmojo._ResultSetXt, mstrmojo._ReportDataService, mstrmojo._IsGraphDataService ],

        /*
         * @lends mstrmojo.GraphDataService.prototype
         */
        {
            scriptClass: "mstrmojo.GraphDataService",

            /**
             * Executes Object.
             *
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if document is not prompted. The parameter passed to this function will the data from the object execution.
             * @param {Function} callback.prompts A function called if document is prompted. The parameter passed to this function will contain the prompts data.
             * @param {Function} callback.failure A function called if the request failed.
            */
            execute: function execute(params, callback) {
                var request = mstrmojo.hash.copy(params, {});

                request.taskId = request.taskId || 'reportExecute';

                request.reportID = request.reportID || (params && params.dssId) || this.dssId;
                this.dssId = request.reportID;

                this._super(request, callback);
            },

            /**
             * Gets object execution results.
             *
             * @param {Function} callback.success A function called if the request succeeds. The parameter passed to this function will contain executed object data.
             * @param {Function} callback.failure A function called if the request failed.
             */
            getResults: function getResults(params, callback) {
                this._super(getResultsParams(), callback);
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
            answerPrompts: function answerPrompts(answer, callback) {
                this._super(answer, callback, $C(promptObjType));
            },

            /**
             * Get prompts.
             *
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if prompts answered successfully. The parameter passed to this function will be the data from the object execution.
             * @param {Function} callback.failure A function called if the request failed.
             */
            loadPrompts: function loadPrompts(callback) {
                this._super(callback, $C(promptObjType));
            },

            pageBy: function pageBy(pbUnits, callback) {
                var app = mstrApp,
                    request = {
                        taskId: 'changePageBy',
                        messageID: this.msgId,
                        pageByKeys: this.pageByUnitsToKeys(pbUnits)
                    };

                if (!app.useBinaryFormat) {
                    $C(getResultsParams(), request);
                }

                mstrApp.serverRequest(request, callback, waitConfig);
            }
        }
    );
}());
