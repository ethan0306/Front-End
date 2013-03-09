(function () {
    mstrmojo.requiresCls("mstrmojo.prompt.WebPrompts");

    var CLASS_NAME = 'mstrmojo._ResultSetXt',
        STATUS_MISSING = 0,
        STATUS_COMPLETE = 1,
        STATUS_ERROR = 2,
        STATUS_PROMPT = 3,
        STATUS_POLL = 4;

    var URL_LINK_PARAMS = ["promptsAnswerXML", "elementsPromptAnswers", "valuePromptAnswers", "objectsPromptAnswers"];

    function fromLink(params) {
        if (params.linkAnswers) {
            return true;
        }
        var i = 0,
            len = URL_LINK_PARAMS.length;

        for (; i < len; i++) {
            if (params[URL_LINK_PARAMS[i]]) {
                return true;
            }
        }
        return false;
    }

    function resolveStatus(res) {
        // Detect error conditions where no response was returned or status is not defined.
        if ((!res) || (typeof res.status === "undefined") || (isNaN(res.status))) {
            return STATUS_MISSING;
        }

        switch (parseInt(res.status, 10)) {
        case 0:  // MsgID
        case 1:  // Result
            return STATUS_COMPLETE;

        case 2:  // Prompt
            return STATUS_PROMPT;

        case 3:  // Error Msg
            return STATUS_ERROR;

        default: // Poll
            return STATUS_POLL;
        }
    }

    function pollForResult(request, isInitialRequest, callback) {
        // Cache the success method and remove from callback. We are going to swap in our own callback until its time to get the object results.
        var fnSuccess = callback.success;
        delete callback.success;

        var app = mstrApp;

        // Wrap supplied callback with default callback methods.
        callback.success = function (res) {
            // NOTE: If there was a server error processing the xhr, response /may/ be null.
            // What status was returned?
            switch (resolveStatus(res)) {
            case STATUS_COMPLETE:
            case STATUS_PROMPT:
            case STATUS_MISSING:
                fnSuccess(res);
                break;

            case STATUS_ERROR:
                callback.failure(res);
                break;

            case STATUS_POLL:
                // server has told us to check back later for the results so we must poll to find out when it's ready.
                // we do so once every 100ms for a finite amount of time.  If the timeout is exceeded we call the failure callback.  Any failure
                // executing the pollStatus call will immediately be reported to the caller via the failure callback.
                var hInterval;

                // Overwrite the success handler to process the results of the pollStatus call.
                callback.success = function (res) {

                    // We successfully got the status we asked for, what is it?
                    var pollStatus = resolveStatus(res);

                    // if we're not to poll anymore we can cancel the timer
                    if (pollStatus !== STATUS_POLL) {
                        window.clearInterval(hInterval);
                    }

                    switch (pollStatus) {
                    case STATUS_COMPLETE:
                    case STATUS_PROMPT:
                        // we're done
                        fnSuccess(res);
                        break;

                    case STATUS_MISSING:
                        // handle the missing status case the same STATUS_POLL and try again. Note the intentional fallthrough.
                    case STATUS_POLL:
                        // still not ready so do nothing until the timer fires again
                        break;

                    default:
                        // handle unknown status and errors the same, fire the failure callback
                        res.message = "Error checking the status of running report/document.";
                        callback.failure(res);
                        break;
                    }
                };

                // Poll for completion.
                hInterval = window.setInterval(function () {
                    app.serverRequest({
                        taskId: 'pollStatus',
                        msgID: res.id
                    }, callback, {
                        src: CLASS_NAME + '::pollForResult',
                        override: true
                    });
                }, 100);    // TODO We need to send the poll time down from the server.

                break;
            }
        };

        // Submit request.
        app.serverRequest(request, callback, {
            src: CLASS_NAME + '::pollForResult',
            override: true,
            showProgress: isInitialRequest,
            hideProgress: !isInitialRequest,
            hideWait: !isInitialRequest
        });
    }

    function execAndPoll(request, callback, isInitialRequest, resParams) {
        var me = this;
        pollForResult.call(this, request, isInitialRequest, {  // Request callback.
            success: function (res) {
                me.msgId = res.id;
                if (res.visName) {
                    me.visName = res.visName;
                }
                var rc = resolveStatus(res);
                if (rc === STATUS_PROMPT) {
                    if (callback.prompts) {
                        me.loadPrompts({
                            success: callback.prompts,
                            failure: callback.failure
                        });
                    } else {
                        callback.failure({
                            message: "Wrong status. Received Prompts while expected Result."
                        });
                    }
                } else {
                    // Do we have a success handler for execution?
                    if (callback.execSuccess) {
                        // Call it.
                        callback.execSuccess(res);
                    }

                    if (resParams && resParams.statusOnly) {
                        callback.success(res);
                    } else {
                        // #493144, #493156 disable incremental fetch for visualizations
                        if (me.visName && me.visName !== "") {
                            if (!resParams) {
                                resParams = {};
                            }
                            resParams.colsPerPage = -1;
                            resParams.rowsPerPage = -1;
                        }
                        me.getResults(resParams, {
                            success: callback.success,
                            failure: callback.failure,
                            complete: callback.complete || mstrmojo.emptyFn
                        });
                    }
                }
            },

            failure: callback.failure,
            complete: callback.complete || mstrmojo.emptyFn
        });
    }

    /**
     * <p>A mixin with methods for executing a MicroStrategy object(Report, Graph or Document)and polling for execution status until complete.</p>
     *
     * @class
     * @public
     */
    mstrmojo._ResultSetXt = mstrmojo.provide(
        'mstrmojo._ResultSetXt',

        /**
         * @lends mstrmojo._ResultSetXt
         */
        {
            _mixinName: 'mstrmojo._ResultSetXt',

            /**
             * The msgId of the current executed object.
             *
             * @type String
             */
            msgId: null,

            /**
             * Executes Object.
             *
             * @param {Object} request An object containing request parameters.
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if document is not prompted. The parameter passed to this function will the data from the object execution.
             * @param {Function} callback.prompts A function called if document is prompted. The parameter passed to this function will contain the prompts data.
             * @param {Function} callback.failure A function called if the request failed.
             */
            execute: function execute(request, callback, resParams) {
                if (request.link) {
                    request.linkAnswers = request.link.toXml();
                    delete request.link;
                }

                var me = this,
                    cb = mstrmojo.func.addMethods(callback, {
                        prompts: function (res) {
                            me.prompts = res;
                            callback.prompts(res);
                        },
                        //495095 For cached reports we get prompts in result JSON
                        //486791 For non-cached reports, if we have saved prompt, we also get prompts in result JSON
                        success: function (res) {
                            if (res.prompt) {
                                me.prompts = res.prompt;
                            }
                            callback.success(res);
                        }
                    });

                //Modify callback for link request.
                //If the request is from link then we need to get prompt answers to be able to
                //reprompt.
                if (!me.prompts && fromLink(request)) {
                    cb.success = function (res) {
                        me.loadPrompts({
                            success: function (prm) {
                                if (prm.prompts) {
                                    me.prompts = prm;
                                    me.answers = mstrApp.viewFactory.newPrompts(prm).buildAnswerObject();
                                }
                                callback.success(res);
                            },
                            failure: callback.failure,
                            complete: callback.complete || mstrmojo.emptyFn
                        });
                    };
                } else if (request.promptsAnswerXML) {
                    // TQMS 506945. When we re-execute prompted report we need to check whether it is still prompted.  
                    cb.success = function (res) {
                        me.prompts = null;
                        me.answers = null;
                        me.loadPrompts({
                            success: function (prm) {
                                if (prm.prompts) {
                                    me.prompts = prm;
                                    me.answers = mstrApp.viewFactory.newPrompts(prm).buildAnswerObject();
                                } 
                                callback.success(res);
                            },
                            failure: mstrmojo.emptyFn
                        });
                    };
                }
                execAndPoll.call(this, request, cb, true, resParams);
            },

            /**
             * Answers prompts.
             *
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if prompts answered successfully. The parameter passed to this function will be the data from the object execution.
             * @param {Function} callback.prompts A function called if document is prompted. The parameter passed to this function will contain the prompts data.
             * @param {Function} callback.failure A function called if the request failed.
             * @param {Object} request An object containing request parameters.
             */
            answerPrompts: function answerPrompts(prompts, callback, request) {
                if (mstrApp.useBinaryFormat) {
                    request.objectType = 55;
                }
                request.taskId = 'answerPrompts';
                request.msgID = request.msgId || this.msgId;
                request.promptAnswerXML = prompts.getAnswerXML();

                var me = this;
                execAndPoll.call(this, request, {
                    success: function (res) {
                        //Remember current answer
                        me.answers = prompts.buildAnswerObject();
                        callback.success(res);
                    },
                    prompts: callback.prompts,
                    failure: callback.failure
                }, true);
            },

            /**
             * Gets object execution results.
             *
             * @param {Function} callback.success A function called if the request succeeds. The parameter passed to this function will contain executed object data.
             * @param {Function} callback.failure A function called if the request failed.
             * @param {Object} request An object containing request parameters.
             */
            getResults: function getResults(request, callback) {
                request.messageID = request.msgId || this.msgId;
                pollForResult.apply(this, [ request, false, callback ]);
            },


            /**
             * Gets prompts.
             *
             * @param {Function} callback.success A function called if the request succeeds. The parameter passed to this function will contain executed object data.
             * @param {Function} callback.failure A function called if the request failed.
             * @param {Object} request An object containing request parameters.
             */
            loadPrompts: function loadPrompts(callback, request) {
                request.taskId = 'getPrompts';
                request.msgID = request.msgID || this.msgId;
                pollForResult.apply(this, [ request, false, callback ]);
            },

            linkToObject: function linkToObject(params, callback) {
                // Execut the document.
                this.execute(params, callback);
            },

            getPrompts: function getPrompts() {
                return this.prompts && mstrApp.viewFactory.newPrompts(this.prompts, this.answers);
            },

            checkCache: function checkCache(request, callback) {
                request.taskId = 'checkCache';
                mstrApp.serverRequest(request, callback, {
                    src: CLASS_NAME + '::checkCache',
                    override: false,
                    silent: true
                });
            },
            //==================================================
            // Protected methods
            urlLinkParams: function urlLinkParams() {
                return URL_LINK_PARAMS;
            }
        }
    );
}());
