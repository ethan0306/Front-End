(function () {

    mstrmojo.requiresCls("mstrmojo.StringBuffer",
                         "mstrmojo.hash",
                         "mstrmojo.dom",
                         "mstrmojo._IsGraphDataService");

    var $H = mstrmojo.hash;
    var $DOM = mstrmojo.dom;

    function submitRequest(params, callback, config) {
        var updates = this.getTxUpdates();
        // Add caller name as the server request source (for error handling).
        config = config || {};
        config.src = arguments.callee.caller.name;

        if (!mstrmojo.string.isEmpty(updates)) {
            params.updateChanges = updates;
        }

        // Submit request.
        mstrApp.serverRequest(params, this.wrapCallback(callback), config);
    }

    function addContentSize(request) {
        var availableDim = mstrApp.getContentDimensions();
        if (availableDim) {
            // We must be on a mobile device so add style name as well.
            request.styleName = 'RWDocumentMobileStyle';
            request.availableWidth = availableDim.w;
            request.availableHeight = availableDim.h;
        }
    }

    /**
     * <p>Document data service.</p>
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.DocDataService = mstrmojo.declare(
        mstrmojo.Obj,

        [mstrmojo._IsGraphDataService],

        /*
         * @lends mstrmojo.DocDataService.prototype
         */
        {
            scriptClass: "mstrmojo.DocDataService",

            wrapCallback: function wrapCallback(callback) {
                var me = this;
                return mstrmojo.func.wrapMethods({
                    success: function (res) {
                        if (res) {
                            me.rwb = res.bs || me.rwb;
                            me.msgId = res.mid || me.msgId;
                        }
                        me.clearTxUpdates();
                    }
                }, callback);
            },

            getTxUpdates: function getTxUpdates() {
                var m = this.model;
                return m && m.getTransactionUpdates && m.getTransactionUpdates();
            },

            clearTxUpdates: function clearTxUpdates() {
                var m = this.model;
                if (m && m.clearTransactionUpdates) {
                    m.clearTransactionUpdates();
                }
            },

            loadDocLayout: function loadDocLayout(params, callback) {
                // Create parameters.
                var taskParams = $H.copy(params, {
                    taskId: 'loadDocLayout',
                    rwb: this.rwb
                });

                // Add content size parameters to the request.
                addContentSize(taskParams);

                // Submit request.
                submitRequest.call(this, taskParams, callback);
            },

            setCurrentDocLayout: function setCurrentDocLayout(layoutKey, callback) {
                callback = callback || null;

                submitRequest.call(this, {
                    taskId: 'setDocLayout',
                    rwb: this.rwb,
                    layoutKey: layoutKey
                }, callback, {
                    silent: (callback === null)
                });
            },

            fetchDocPage: function fetchDocPage(position, callback) {
                submitRequest.call(this, {
                    taskId: 'fetchDocPage',
                    rwb: this.rwb,
                    pos: position
                }, callback);
            },

            /**
             * Silently updates the server as to which panel is currently selected.
             *
             * @param {String} panelKey The RW Unit key of the currently selected panel.
             * @param {String} panelStackKey The RW Unit key of the panel stack containing the panel.
             * @param {String} selectorKeyContext The selector keys context.
             */
            setCurrentPanel: function setCurrentPanel(panelKey, panelStackKey, selectorKeyContext) {
                submitRequest.call(this, {
                    taskId: 'setCurrentPanel',
                    rwb: this.rwb,
                    key: panelKey,
                    panelStackKey: panelStackKey,
                    selectorKeyContext: selectorKeyContext
                }, null, {
                    silent: true   // Silent update so XHR shouldn't fail on empty payload.
                });
            },

            /**
             * Downloads a partial update tree for the indicated panel.
             *
             * @param {String} panelKey The RW Unit key of the currently selected panel.
             * @param {String} panelStackKey The RW Unit key of the panel stack containing the panel.
             * @param {String} selectorKeyContext The selector keys context.
             * @param {String} dirtyKeys The collection of the panels dirty child keys.
             * @param {Boolean} useLoader A boolean that will indicate whether to show a default loading message.
             * @param {Object} [callback] An optional object containing functions to be called as the request process proceeds.
             * @param {Function} [callback.submission] A function called as the server request is initiated.
             * @param {Function} [callback.success] A function called when the server request completes successfully.
             * @param {Function} [callback.failure] A function called if the server request fails for any reason.
             * @param {Function} [callback.complete] A function called when the server request is completed, regardless of status.
             */
            requestNewPanel: function requestNewPanel(panelKey, panelStackKey, selectorKeyContext, dirtyKeys, useLoader, callback) {
                submitRequest.call(this, {
                    taskId: 'requestNewPanel',
                    rwb: this.rwb,
                    key: panelKey,
                    panelStackKey: panelStackKey,
                    selectorKeyContext: selectorKeyContext,
                    dirtyKeys: dirtyKeys
                }, callback, {
                    showWait: useLoader,
                    hideWait: useLoader
                });
            },

            /**
             * Applies a selector action from a graph.
             *
             * @param {String} selectorKeyContext The selector keys context.
             * @param {String} targetList A collection of target keys for this selector operation.
             * @param {String} sliceID The slice ID for the graph that is making this selector request.
             * @param {Integer} x The position along the horizontal axis of the graph image that the user clicked.
             * @param {Integer} y The position along the vertical axis of the graph image that the user clicked.
             * @param {Object} [callback] An optional object containing functions to be called as the request process proceeds.
             * @param {Function} [callback.submission] A function called as the server request is initiated.
             * @param {Function} [callback.success] A function called when the server request completes successfully.
             * @param {Function} [callback.failure] A function called if the server request fails for any reason.
             * @param {Function} [callback.complete] A function called when the server request is completed, regardless of status.
             */
            applyGraphSelectorAction: function applyGraphSelectorAction(selectorKeyContext, targetList, sliceID, x, y, callback, zoomFactor) {
                submitRequest.call(this, {
                    taskId: 'applyGraphSelectorAction',
                    rwb: this.rwb,
                    selectorKeyContext: selectorKeyContext,
                    ctrlKeys: targetList,
                    sliceID: sliceID,
                    x: x,
                    y: y,
                    zoomFactor : zoomFactor
                }, callback);
            },

            /**
             * Applies a selector action.
             *
             * @param {String} selectorKeyContext The selector keys context.
             * @param {String} elemList The list of elements selected.
             * @param {String} controlKey The control key of the selector.
             * @param {Boolean} includeClause The include/exclude expression condition.
             * @param {Object} [callback] An optional object containing functions to be called as the request process proceeds.
             * @param {Function} [callback.submission] A function called as the server request is initiated.
             * @param {Function} [callback.success] A function called when the server request completes successfully.
             * @param {Function} [callback.failure] A function called if the server request fails for any reason.
             * @param {Function} [callback.complete] A function called when the server request is completed, regardless of status.
             * @param {Integer} zoomFactor of the document
             */
            setDocSelectorElements: function setDocSelectorElements(selectorKeyContext, elemList, controlKey, includeClause, callback, zoomFactor, useAndroidTask) {
                var params = {
                    taskId: 'setDocSelectorElements',
                    rwb: this.rwb,
                    selectorKeyContext: selectorKeyContext,
                    elemList: elemList,
                    ctlKey: controlKey,
                    zoomFactor : zoomFactor
                };

                if ($DOM.isAndroid || useAndroidTask) {
                    params.taskId = 'androidSetDocSelectorElements';
                }

                if (includeClause !== null && includeClause !== undefined) {
                    params.include = includeClause;
                }

                submitRequest.call(this, params, callback, {
                    showWait: true,
                    hideWait: true,
                    delay: true
                });
            },

            /**
             * Applies a selector expression.
             *
             * @param {String} unitKeyContext The selector keys context.
             * @param {String} controlKey The control key of the selector.
             * @param {String} objectId The control key of the selector.
             * @param {String} objectType The control key of the selector.
             * @param {String} expressionFunction The control key of the selector.
             * @param {String} expressionFunctionType The control key of the selector.
             * @param {Boolean} includeClause The include/exclude expression condition.
             * @param {String} expressionConstants The control key of the selector.
             * @param {Integer} dataType The control key of the selector.
             * @param {Object} [callback] An optional object containing functions to be called as the request process proceeds.
             * @param {Function} [callback.submission] A function called as the server request is initiated.
             * @param {Function} [callback.success] A function called when the server request completes successfully.
             * @param {Function} [callback.failure] A function called if the server request fails for any reason.
             * @param {Function} [callback.complete] A function called when the server request is completed, regardless of status.
             * @param {Integer} zoomFactor of the document
             * @param {Bollean} a flag indicate whether the expression need to be unset
             */
            setDocSelectorExpression: function setDocSelectorExpression(unitKeyContext, controlKey, objectId, objectType, expressionFunction, expressionFunctionType, includeClause, expressionConstants, dataType, callback, zoomFactor, unset) {
                var params = {
                    taskId: 'setDocSelectorExpression' + (unset ? 'Unset' : ''),
                    rwb: this.rwb,
                    unitKeyContext: unitKeyContext,
                    ctlKey: controlKey,
                    objectId: objectId,
                    objType: objectType,
                    expFunction: expressionFunction,
                    expFunctionType: expressionFunctionType,
                    zoomFactor : zoomFactor
                };

                if (includeClause !== null && includeClause !== undefined) {
                    params.include = includeClause;
                }

                if (expressionConstants !== null && expressionConstants !== undefined) {
                    params.expConstants = expressionConstants;
                }

                if (dataType !== null && dataType !== undefined) {
                    params.dataType = dataType;
                }

                submitRequest.call(this, params, callback);
            },

            /**
             * Modifies a selector include/exclude condition.
             *
             * @param {String} controlKey The control key of the selector.
             * @param {Boolean} includeClause The include/exclude expression condition.
             * @param {Object} [callback] An optional object containing functions to be called as the request process proceeds.
             * @param {Function} [callback.submission] A function called as the server request is initiated.
             * @param {Function} [callback.success] A function called when the server request completes successfully.
             * @param {Function} [callback.failure] A function called if the server request fails for any reason.
             * @param {Function} [callback.complete] A function called when the server request is completed, regardless of status.
             * @param {Integer} zoomFactor of the document
             */
            setDocSelectorInclude: function setDocSelectorInclude(controlKey, includeClause, callback, objectID, objectType, zoomFactor) {
                var params = {
                    taskId: 'setDocSelectorInclude',
                    rwb: this.rwb,
                    include: includeClause,
                    ctlKey: controlKey,
                    zoomFactor : zoomFactor
                };

                if (objectID) {
                    params.objectID = objectID;
                }

                if (objectType) {
                    params.objType = objectType;
                }

                submitRequest.call(this, params, callback);
            },

            /**
             * Clears the selections and returns to the default state on a selector
             * @param {String} unitKeyContext The unitKeyContext of the selector.
             * @param {Function} [callback.submission] A function called as the server request is initiated.
             * @param {Function} [callback.success] A function called when the server request completes successfully.
             * @param {Function} [callback.failure] A function called if the server request fails for any reason.
             * @param {Function} [callback.complete] A function called when the server request is completed, regardless of status.
             * @param {String} controlKey The control key of the selector.
             * @param {Integer} zoomFactor of the document
             */
            setDocUnsetSelector: function setDocUnsetSelector(unitKeyContext, ctlKey, callback, zoomFactor) {
                submitRequest.call(this, {
                    taskId: 'unsetSelector',
                    rwb: this.rwb,
                    unitKeyContext: unitKeyContext,
                    ctlKey: ctlKey,
                    zoomFactor: zoomFactor
                }, callback);
            },

            /**
             * Request the RW graph image from the server.
             *
             */
            getRWGraphImage: function getRWGraphImage(params, callback) {
                var app = mstrApp,
                	id = this.id,
                    p = {
                        taskId: 'getRWGraphImage',
                        taskEnv: 'xhr',
                        imgType: 4,
                        messageID: this.msgId,
                        nodeKey: params.k,
                        sliceID: parseInt(params.sid, 10),
                        width: parseInt(params.w, 10),
                        height: parseInt(params.h, 10)
                    };

                // For mobile devices using the binary format, we submit a task request to get the graph image.
                // The native application (Android) will intercept this request and return us JSON representing the graph.
                // This JSON contains instructions on how to draw the graph using HTML5 canvas element.
                if (app.onMobileDevice() && app.useBinaryFormat) {
                    // TQMS #511440: Request graph JSON in timeout to prevent errant toucheEnd event that cancels scrolling.
                    window.setTimeout(function () {
                        submitRequest.call(mstrmojo.all[id], p, callback);
                    }, 0);

                } else {
                    if (params.encodeImage) {
                        // Add encoding type.
                        p.taskContentEncoding = 'base64';

                        // Remove task envelope.
                        delete p.taskEnv;

                        // Submit request.
                        submitRequest.call(this, p, {
                            success: function (res) {
                                callback.success('data:image/png;base64,' + res);
                            },
                            failure: function (err) {
                                (callback.failure || app.onerror)(err);
                            }
                        });

                    } else {
                        var cfg = app.getConfiguration(),
                            projectId = app.getCurrentProjectId(),
                            values = new mstrmojo.StringBuffer();

                        // Add time stamp and session state to parameters.
                        p.__ts__ = new Date().getTime();
                        p.sessionState = app.getSessionState(projectId);

                        // Convert parameters hash to URL string.
                        $H.forEach(p, function (v, n) {
                            // Use name value pairs with value encoded.
                            values.append(n + '=' + encodeURIComponent(v));
                        });

                        // Pass src url back to success handler.
                        callback.success(cfg.getTaskUrlByProject(projectId) + '?' + values.toString('&'));
                    }
                }
            },

            getImage: function getImage(url) {
                var app = mstrApp,
                    config = app.getConfiguration();

                if (config && url && url.indexOf('://') === -1) {
                    // Add the hostUrl value.
                    url = config.getHostUrlByProject(app.getCurrentProjectId()) + url;
                }

                return (mstrApp.useBinaryFormat) ? String(mstrMobileApp.getImage(url)) : url;
            },

            getDocImage: function getDocImage(url) {
                return this.getImage(url);
            },

            setQuickSwitchViewMode: function setQuickSwitchViewMode(gridKeyContext, displayMode) {
                submitRequest.call(this, {
                    taskId: 'setDisplayMode',
                    gridKeyContext: gridKeyContext,
                    messageID: this.msgId,
                    displayMode: displayMode
                }, null, {
                    silent: true
                });
            },

            setRWUnitProperties: function setRWUnitProperties(key, props, formatType, returnData, callback) {
                submitRequest.call(this, {
                    taskId: 'setRWUnitProperties',
                    rwb: this.rwb,
                    nodeKey: key,
                    props: props,
                    formatType: formatType,
                    returnData: returnData
                }, callback, {
                    silent: true
                });
            },

            setDocZoom: function setDocZoom(params, callback) {
                submitRequest.call(this, {
                    taskId: 'setDocZoom',
                    rwb: this.rwb,
                    zoomType: params.zoomType,
                    zoomFactor: params.zoomFactor
                }, callback);
            },

            sort: function sort(params, callback) {
                submitRequest.call(this, $H.copy(params, {
                    taskId: 'DocSort',
                    rwb: this.rwb
                }), callback);
            },

            pivot: function pivot(params, callback) {
                var request = $H.copy(params, {
                    messageID: this.msgId,
                    rwb: this.rwb
                });

                request.key = params.nodeKey;
                delete request.nodeKey;
                request.taskId = params.formID ? 'docPivotForm' : 'docPivot';

                submitRequest.call(this, request, callback);
            },

            drillGrid: function drillGrid(params, callback) {
                submitRequest.call(this, {
                    taskId: 'DocDrill',
                    messageID: this.msgId,
                    nodeKey: params.nodeKey,
                    drillPathIndex: params.drillPathIndex, // used if is Binary Format
                    drillPathKey: params.drillPathKey,
                    elementList: params.drillElements
                }, callback, {
                    showProgress: true,
                    hideProgress: true,
                    delay: true
                });
            },

            changeDocGroupBy: function changeDocGroupBy(params, callback, config) {
                var request = {
                    taskId: 'changeDocGroupBy',
                    rwb: this.rwb,
                    messageID: this.msgId,
                    treesToRender: 3
                };

                request.flags = params.flags;
                if (params.groupbyKey) {
                    request.groupByKey = params.groupbyKey;
                    request.elementID = params.elementId;
                } else {
                    request.gbUnits = params.gbUnits;
                }

                // Add the content size parameters to the request.
                addContentSize(request);

                submitRequest.call(this, request, callback, config);
            },

            downloadGridData: function downloadGridData(params, callback) {
                submitRequest.call(this, {
                    taskId: 'DocXtabIncrementalFetch',
                    rwb: this.rwb,
                    nodeKey: params.nodeKey,
                    rowPosition: params.rowPosition,
                    maxRows: params.maxRows,
                    colPosition: params.colPosition,
                    sliceId: params.sliceId,
                    maxColumns: params.maxColumns
                }, callback);
            },

            txMarkRows: function txMarkRows(params, callback) {
                submitRequest.call(this, {
                    taskId: 'markRow',
                    rwb: this.rwb,
                    nodeKey: params.nodeKey,
                    sliceId: params.sliceId,
                    rowOrdinal: params.rowOrdinal,
                    actionType: params.actionType
                }, callback);
            },

            txChangeData: function txChangeData(params, callback) {
                submitRequest.call(this, {
                    taskId: 'changeData',
                    rwb: this.rwb,
                    nodeKey: params.nodeKey,
                    sliceId: params.sliceId,
                    cells: params.cells,
                    autoRefresh: params.autoRefresh
                }, callback);
            },

            sendTransactionActions: function sntTxActs(params, callback) {
                submitRequest.call(this, {
                    taskId: 'DocTransaction',
                    rwb: this.rwb,
                    keyContext: params.keyContext,
                    actions: params.actions,
                    messageID: this.msgId
                }, callback, {silent: !!callback}); //if callback defined, it will handle error itself.
            },
            RWEventsTask: function RWEventsTask(params, callback){
                submitRequest.call(this, {
                    taskId: 'RWEventsTask',
                    rwb: this.rwb,
                    messageID: params.messageID,
                    styleName: params.styleName,
                    events: params.events
                }, callback);
            }
        }
    );
}());