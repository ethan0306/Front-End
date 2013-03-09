(function () {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.hash",
                         "mstrmojo._ResultSetXt",
                         "mstrmojo._ReportDataService");

    function submitAndGetResults(request, callback, config, resultParams) {
        var me = this;

        mstrApp.serverRequest(request, {
            success: function (res) {
                // Update message Id.
                me.msgId = res.id;

                // Update visualization name
                me.visName = res.visName;

                // Get results.
                me.getResults(resultParams, callback);
            }
        }, config);
    }

    function waitConfig(noHideWait, isProgress) {
        var cfg = {
            hideWait: !noHideWait,
            delay: true    
        };
        
        // Do we want to show the progress instead of the wait.
        cfg['show' + (isProgress ? 'Progress' : 'Wait')] = true;
        
        // Return the new wait config.
        return cfg;
    }

    var promptObjType = {
        objectType: 3
    };

    var $C = mstrmojo.hash.copy;

    function getXtabStyleName() {
        var styleName = 'MojoXtabStyle',       // Default to MojoXtabStyle.
            visName = this.visName;            // Visualization name (optional).

        // Do we have a visualization name?
        if (visName) {
            // Get the visualization info object from the VisList.
            var visObj = mstrmojo.AndroidVisList.getVis(visName);

            // Style name should be the 's' property of the visualization info object (if found) or the default (if not found).
            styleName = (visObj && visObj.s) || styleName;
        }

        return styleName;
    }

    /**
     * <p>Mobile report data service.</p>
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.XtabDataService = mstrmojo.declare(
        mstrmojo.Obj,

        [ mstrmojo._ResultSetXt, mstrmojo._ReportDataService ],

        /*
         * @lends mstrmojo.XtabDataService.prototype
         */
        {
            scriptClass: "mstrmojo.XtabDataService",

            /**
             * Executes Object.
             *
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if document is not prompted. The parameter passed to this function will the data from the object execution.
             * @param {Function} callback.prompts A function called if document is prompted. The parameter passed to this function will contain the prompts data.
             * @param {Function} callback.failure A function called if the request failed.
            */
            execute: function execute(params, callback, resParams) {
                var id = this.id;

                // set visualization from abbreviation
                var ab = this.controller.ab;
                if (ab) {
                    var i = ab.indexOf('|72^');
                    if (i > 0) {
                        mstrmojo.all[id].visName = ab.substring(i + 4);
                    }
                }

                var request = mstrmojo.hash.copy(params, {});
                request.taskId = request.taskId || 'reportExecute';
                request.reportID = request.reportID || this.dssId;

                if (params) {
                    if (params.dssId) {
                        request.reportID = params.dssId;
                    }
                }
                this.dssId = request.reportID;
                this._super(request, callback, resParams);
            },

            /**
             * Gets object execution results.
             *
             * @param {Object} params The parameters for this request.
             * @param {Function} callback.success A function called if the request succeeds. The parameter passed to this function will contain executed object data.
             * @param {Function} callback.failure A function called if the request failed.
             */
            getResults: function getResults(params, callback) {
                var styleName = getXtabStyleName.call(this),
                    dpi = mstrMobileApp.getDeviceDPI(),
                    zoom = 160;       // #484208 use zoom factor of 200 for all devices
                
                if (dpi < 160) {
                    zoom = 80; 
                } else if (dpi > 240) {
                    zoom = 230;
                }

                 // Create the request.
                var request = {
                    taskId: 'iPhoneGetReportResults',
                    styleName:  styleName,
                    zoomFactor: zoom
                };

                if (params) {
                    var pbUnits = params.pbUnits,
                        yPos = params.yPos,
                        colsPerPage = params.colsPerPage,
                        rowPerPage = params.rowsPerPage;

                    if (pbUnits) {
                        request.pageByKeys = this.pageByUnitsToKeys(pbUnits);
                    }
                    if (yPos) {
                        request.yPos = yPos;
                    }
                    // #493144, #493156 disable incremental fetch for visualizations
                    if (colsPerPage) {
                        request.colsPerPage = colsPerPage;
                    }
                    if (rowPerPage) {
                        request.rowsPerPage = rowPerPage;
                    }
                }

                this._super(request, callback);
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
                this._super(prompts, callback, $C(promptObjType));
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

            drill2Grid: function drill2Grid(params, callback) {
                var p = {
                    taskId: 'RWGridDrillToReport',
                    msgID: params.srcMsgId,
                    displayMode: -1,
                    retainParent: 3,
                    retainThreshold: 3,
                    drillPathKey: params.drillPathKey,
                    drillPathIndex: params.drillPathIndex,
                    elementList: params.drillElements,
                    nodeKey: params.nodeKey
                };
                
                // TQMS 496126 We need to pass the slice ID to the server
                if (params.sliceId) {
                    p.sliceId = params.sliceId;
                }
                
                submitAndGetResults.call(this, p, callback, waitConfig(true, true));
            },

            drillGrid: function drillGrid(params, callback) {
                submitAndGetResults.call(this, {
                    taskId: 'gridDrill',
                    msgID: params.srcMsgId,
                    drillPathKey: params.drillPathKey,
                    drillPathIndex: params.drillPathIndex,
                    elementList: params.drillElements
                }, callback, waitConfig(true, true));
            },

            pageBy: function pageBy(pbUnits, callback) {
                var app = mstrApp,
                    request = {
                        taskId: 'changePageBy',
                        messageID: this.msgId,
                        pageByKeys: this.pageByUnitsToKeys(pbUnits)
                    };

                if (!app.useBinaryFormat) {
                    request.taskId = 'iPhoneGetReportResults';
                    request.styleName = getXtabStyleName.call(this);
                    request.zoomFactor = 200; // #484208 use zoom factor of 200 for all devices
                }

                mstrApp.serverRequest(request, callback, waitConfig());
            },

            sort: function sort(params, callback) {
                submitAndGetResults.call(this, {
                    taskId: 'gridSort',
                    msgID: this.msgId,
                    sortKey: params.sortKey,
                    sortOrder: ((params.isAsc) ? 1 : 0),
                    subtotalPos: params.subTotalsPos,
                    clearSorts: 1
                }, callback, waitConfig());
            },

            pivot: function pivot(params, callback) {
                var request = {
                    taskId: 'gridPivot',
                    msgID: this.msgId,
                    objectId: params.objectId,
                    pos: params.pos,
                    objectType: params.objectType
                };

                if (params.axis) {
                    request.axis = params.axis;
                }

                submitAndGetResults.call(this, request, callback, waitConfig());
            },

            // TODO: We need to pull this method into the superclass.
            getImage: function getImage(url) {
                if (url && url.indexOf('://') === -1) {
                    // Add the hostUrl value.
                    url = mstrApp.getConfiguration().getHostUrlByProject(mstrApp.getCurrentProjectId()) + url;
                }

                return (mstrApp.useBinaryFormat) ? String(mstrMobileApp.getImage(url)) : url;
            },

            /**
             * This method invokes an DocXtabIncrementalFetch task to fetch data for the reports (even in the case of reports).
             * At this point, this task works only in Binary.
             *
             * @param params The task params
             * @param callback The callback for when the task returns.
             */
            downloadGridData: function downloadGridData(params, callback) {
                mstrApp.serverRequest({
                    taskId: 'DocXtabIncrementalFetch',
                    nodeKey: '',
                    rowPosition: params.rowPosition,
                    maxRows: params.maxRows,
                    colPosition: -1,
                    maxColumns: -1
                }, callback);
            }
        }
    );
}());
