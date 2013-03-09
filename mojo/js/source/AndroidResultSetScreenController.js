(function () {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController",
                         "mstrmojo.Vis",
                         "mstrmojo.hash");

    mstrmojo.requiresDescs(8623,8624,8625);

    var $HSH = mstrmojo.hash,
        TYPE_REPORT = 768,
        OBJECT_TYPE_REPORT = 3, //EnumDSSXMLObjectTypes.DssXmlTypeReportDefinition
        $APP,
        CLASS_NAME = 'AndroidResultSetScreenController';

    /**
     * Used for retrieving link drill parameters from parameter object.
     *
     * @private
     */
    var linkDrillParams = {
        currentViewMedia : 0,
        documentID : 'objectID',
        elementsPromptAnswers : 0,
        link : 0,
        linkAnswers : 0,
        objectID : 0,
        objectsPromptAnswers : 0,
        promptsAnswerXML : 0,
        reportID : 0,
        reportViewMode : 0,
        valuePromptAnswers : 0,
        visMode : 0,
        desiredElements : 0,
        //TQMS 513644 We need to remember desired elements passed to us
        desiredUnits : 0,
        //TQMS 494767 We need to support links to a different project
        projectID : 0,
        //TQMS 497693. We need to pass the groupByElements and layoutIndex to the task
        groupByElements : 0,
        layoutIndex : 0
    };

    /**
     * Restores the previous project ID to the mobile app (if cached on the instance).
     *
     * @private
     */
    function restoreProjectId() {
        var oldPrjId = this._oldPID;
        if (oldPrjId) {
            // TQMS #494767, #498288: Restore cached project ID.
            $APP.setCurrentProjectId(oldPrjId);
        }
    }

    /**
     * Base screen controller for result set views.
     *
     * @class
     * @extends mstrmojo.MobileBookletController
     */
    mstrmojo.AndroidResultSetScreenController = mstrmojo.declare(

        mstrmojo.MobileBookletController,

        null,

        /**
         * @lends mstrmojo.AndroidResultSetScreenController.prototype
         */
        {
            scriptClass : "mstrmojo.AndroidResultSetScreenController",

            /**
             * Initializer.
             *
             * @param {String}
             *            params.did An Object ID.
             * @param {int}
             *            params.st An object subtype.
             */
            init : function init(params) {
                this._super();
                $APP = mstrApp;

                // Cache the object subtype.
                this.type = params.st;

                // Create child view controller.
                this.viewController = $APP.viewFactory.newController(this.getViewKey(this.type), $HSH.copy(params || {}, {
                    parent : this
                }));
            },

            /**
             * Activates controller
             */
            start: function start(params) {
                var me = this,
                    newPrjId = params.projectID,
                    prevController = me.prevController.viewController,
                    fnViewFailed = function (e) {
                        // Restore the previous project ID.
                        restoreProjectId.call(me);

                        // Display error and signal view loading failed.
                        me.viewFailed(e);
                    },
                    fnLogMethod = function (isEntry) {
                        // Log method entry (or exit).
                        $MAPF(isEntry, CLASS_NAME, 'start');
                    };

                // Log the entry point.
                fnLogMethod(true);

                // Was a new projectID passed through the parameters?
                if (newPrjId) {
                    // Cache the old project ID on the instance.
                    this._oldPID = $APP.getCurrentProjectId();

                    // TQMS #494767: Modify application current project ID.
                    $APP.setCurrentProjectId(newPrjId);
                }

                try {
                    this.viewController.start(params, {
                        success : function (view) {
                            try {
                                // Add the view.
                                me.addView(view);
                            } catch (e) {
                                // View failed during display.
                                fnViewFailed(e);
                            }
                        },
                        prompts : function () {
                            // Open prompts.
                            me.openPrompts();
                        },

                        failure : function (details) {
                            // View failed during data request.
                            fnViewFailed(details);
                        },

                        complete: function () {
                            // Log the method exit.
                            fnLogMethod(false);
                            // TQMS 493914 mark the progress status to be complete.
                            if(prevController && prevController.docRequestComplete) {
                            	prevController.docRequestComplete();
                            }
                        }
                    });
                } catch (e) {
                    // View failed during request initiation.
                    fnViewFailed(e);
                    // TQMS 493914 mark the progress status to be complete.
                    if(prevController && prevController.docRequestComplete) {
                    	prevController.docRequestComplete();
                    }
                }
            },

            /**
             * Destroy the view controller when detaching the screen controller.
             *
             * @see mstrmojo.ViewController
             */
            detach: function () {
                //Destroy the view controller before calling super.
                this.viewController.destroy();

                // Restore the previous project ID.
                restoreProjectId.call(this);

                //Call super
                this._super();
            },

            openPrompts : function openPrompts() {
                var me = this,
                    prompts = me.viewController.model.prompts,
                    i = 0,
                    size = prompts.size(),
                    prompt,
                    supportedPrompts = [],
                    hasUnanswerdUnsupportedPrompts = false;

                // Look for unsupported prompts.
                for (; i < size; i++) {
                    prompt = prompts.get(i);
                    if (prompt.supported()) {
                        supportedPrompts.push(prompt);
                    } else {
                        if (!prompt.hasAnswer) {
                            if ( prompt.req ) {
                                this.viewFailed({
                                    message: mstrmojo.desc(8623, 'Report cannot be executed because it contains unanswered, required prompts.')
                                });
                                return;
                            } else if (!prompt.hasAnswer) {
                                //TQMS 491433. We need to worn a user because report execution may fail
                                hasUnanswerdUnsupportedPrompts = true;
                            }
                        }
                    }
                }

                function answerPrompts() {
                    if ( hasUnanswerdUnsupportedPrompts) {
                        mstrmojo.alert(
                            mstrmojo.desc(8624, "Warning: Report contains unasnwered, unsupported prompts."),
                            function () {me.answerPrompts();}
                        ); 
                    } else {
                        me.answerPrompts();
                    }
                }
                //If we have supported prompts open Prompts screen
                if (supportedPrompts.length > 0) {
                    me.spawn($APP.viewFactory.newPromptsController(), {
                        prompts : prompts,
                        supportedPrompts: supportedPrompts,
                        callback : function () {
                            answerPrompts();
                        }
                    });
                } else {
                    //All prompts are unsupported but each either has answer or is optional.
                    //We can just answer them
                    answerPrompts();
                }
            },
            /**
             * Answers prompts then retrieves and redisplays new report data.
             *
             * @param {String}
             *            ans A prompt answer XML.
             */
            answerPrompts : function answerPrompts() {
                var me = this;
                this.viewController.answerPrompts({
                    success : function (view) {

                        // Do we NOT have a last view?
                        var lastView = me.lastView;
                        if (!lastView) {

                            // wrap addView call with try/catch in case rendering new view fails
                            try {
                                // Add view at the end.
                                me.addView(view);
                            } catch (e) {
                                me.viewFailed(e);
                            }

                        } else {
                            me.makeCurrent();
                        }
                    },

                    prompts : function () {
                        // We don't support prompts in prompts yet.
                        me.viewFailed({
                            message : mstrmojo.desc(8625, 'Prompts in prompts are not supported.')
                        });
                    },

                    failure : function (details) {
                        mstrApp.onerror(details);
                    }
                });
            },

            onLink : function onLink(action) {
                // Create parameters object.
                var params = {
                    action : 'linkToObject'
                };

                // Iterate supplied action and pull out what we need.
                $HSH.forEach(action, function (v, p) {
                    var pV = linkDrillParams[p];

                    // Do we care about this parameter?
                    if (pV !== undefined) {
                        // Add it using either the value of the parameter in
                        // linkDrillParams, or the actual
                        // parameter name.
                        params[pV || p] = v;
                    }
                });

                if ($APP.useBinaryFormat) {
                    params.srcMsgId = action.srcMsgId;
                }
                var type;
                switch (parseInt(action.evt, 10)) {
                case 4001:
                    // TQMS #490692 Please don't replace '==' with '==='.
                    if (parseInt(action.reportViewMode, 10) === 2) {
                        type = {
                            sc : 'Graph',
                            c : 769
                        };
                    } else {
                        type = {
                            sc : 'Xtab',
                            c : 768
                        };
                    }
                    params.styleName = "AndroidMessageResultStyle"; // use this style so we can get the 'visName' for reports
                    break;
                case 32001:
                    type = {
                        sc : 'HTMLDoc',
                        c : 768
                    };
                    break;
                case 2048001:
                    type = {
                        sc : 'Document',
                        c : 14081
                    };
                    break;
                }
                this.spawn($APP.viewFactory.newScreenController(type.sc, {
                    st : type.c
                }), params);
            },

            onExecuteNewObject: function onExecuteNewObject(params) {
                var type = (params.objType === OBJECT_TYPE_REPORT) ? /*Execute report in grid mode*/{ sc: 'Xtab', c: 768} : /*Execute document*/{sc: 'Document', c: 14081};
                this.spawn($APP.viewFactory.newScreenController(type.sc, {st: type.c}), params);
            },

            onDrill : function onDrill(params) {
                var action = (this.type === TYPE_REPORT) ? 'drillGrid' : 'drill2Grid';

                // Spawn new screen controller for this action.
                this.spawn($APP.viewFactory.newXtabScreenController({
                    st : TYPE_REPORT
                }), $HSH.copy(params, {
                    action : action
                }));
            }
        }
    );
}());
