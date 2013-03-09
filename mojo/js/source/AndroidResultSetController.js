(function () {

    mstrmojo.requiresCls("mstrmojo.ViewController");

    mstrmojo.requiresDescs(1442,8616,8617,8618,8619);

    //Re-executes report if cache is not invalid
    function reExecute(me, params, callback, resParams) {
        if (me.model.prompts) {
            params.promptsAnswerXML = me.model.prompts.getAnswerXML();
        }
        me.model.execute(params, callback, resParams);
    }

    /**
     * The Generic Result Set view controller for the Android application.
     *
     * @class
     * @extends mstrmojo.ViewController
     */
    mstrmojo.AndroidResultSetController = mstrmojo.declare(

        mstrmojo.ViewController,

        null,

        /**
         * @lends mstrmojo.AndroidResultSetController.prototype
         */
        {
            scriptClass: "mstrmojo.AndroidResultSetController",

            modelName: null,

            start: function start(params, callback) {
                var me = this,
                    action = params.action || 'execute';

                // Remove action from parameters.
                delete params.action;

                // Create the model.
                var model = this.model = mstrApp.viewFactory['new' + this.modelName + 'Model']({
                    controller: me
                });
                if (params && params.st) {
                    model.st = params.st;
                    model.n = params.ttl;
                }

                //Preserve copy of params for checkCache as create view modifies them
                var p = mstrmojo.hash.copy(params, {}),
                    fnSuccess = callback.success;

                callback.success = function (res) {
                    fnSuccess(me.createView(res, params));

                    me._checkCache(res, p);
                };

                //TQMS 516550
                if ( ! me.did ) {
                    me.did = params.documentID || params.reportID || params.objectID;
                }
                model[action](params, callback);
            },


            reprompt: function reprompt() {
                this.repromptFlag = true;
                this.parent.openPrompts();
            },

            refresh: function (view) {
                this.model.refresh(null, {
                    success: function (res) {
                        if (res) {
                            view.refresh();
                        }
                    }
                });
            },

            reExecute: function (view) {
                var me = this;
                if (mstrApp.useBinaryFormat) {
                    mstrMobileApp.removeLiveCache(mstrApp.getCurrentProjectId(), this.model.ci.cid);
                    // Pass empty object as execute function will auto populate required parameters
                    reExecute(this, {}, {
                        success: function (res) {
                            me.setData(res);
                        }
                    }, {refresh: true});
                } else {
                    view.model.raiseEvent({name: 'refresh'});
                }
            },

            answerPrompts: function answerPrompts(callback) {
                var me = this;
                // Answer prompts.
                this.model.answerPrompts({
                    /**
                     * To be provided by caller
                     */
                    success: function (res) {
                        // Call success (passing in the frame).
                        callback.success(me.createView(res, {}));
                        var params = {
                            did: me.did,
                            n: me.n,
                            st: me.st,
                            t: me.t
                            //promptsAnswerXML: me.model.prompts.getAnswerXML()
                        };
                        me._checkCache(res, params);
                    },

                    prompts: function () {
                        callback.failure({
                            message: 'Prompts in prompts are not supported.'
                        });
                    },

                    failure: callback.failure
                });
            },

            getPageByTree: function getPageByTree(view) {
                if (view.model.getPageByTree) {
                    if (view.pageByData) {
                        view.set('pageByData', null);
                    }
                    // Use model to retrieve page by data.
                    view.model.getPageByTree({
                        success: function (data) {
                            view.set('pageByData', data);
                        },
                        failure: function (res) {
                            mstrApp.onerror(res);
                        }
                    });
                }
            },

            /**
             * Extends the destroy method from mstrmojo.Obj and destroys the ResultSet model when it gets destroyed.
             */
            destroy: function destroy() {
                //Destroy the model.
                this.model.destroy();

                //Call super
                if (this._super) {
                    this._super();
                }
            },

            //Checks if the cache we used for rendering is valid.
            //I.B. To do:
            // 1. After execute we must get prompts and answers from the JSON
            // 2. For re-execution we must set up proper config to avoid canceling other requests and showing "Loading" message.
            // 3. What shall we do if while we are re-executing user drills, switches to another report or simply hits back button?
            _checkCache: function _checkCache(res, params, cacheIsGoodCallback) {

                var me = this, 
                    dataService = me.model.getDataService(),
                    cacheIsGoodCallback = cacheIsGoodCallback || mstrmojo.emptyFn,
                    ifc = res.ifc,
                    contentView = me.contentView;

                /* These three lines are used to commented out a portion of code for debugging purposes.
                 * If code below is commented out then it's been checked in by mistake.
                 * To un-comment just add the '*' before '/' at the end of this line.
                 */
                if (!mstrApp.useBinaryFormat || !ifc) {
                    cacheIsGoodCallback();
                    return;
                }
                // */
                
                //Find a view that contains the updateActionMenu method.
                var menuView = null,
                    v = contentView.parent;
                while (v) {
                    if (v.updateActionMenu) {
                        menuView = v;
                        break;
                    }
                    v = v.parent;
                }

                //TQMS 500631
                //While we are checking cache we shall not display report-related menu items
                //because report may be changed so that those menu items don't apply anymore 
                function updateMenu(checkingCache) {
                    contentView.suspendMenu = checkingCache;
                    menuView && menuView.updateActionMenu();
                }
                
                function showDialog(message, callback) {
                    mstrApp.doAfterAnimation(function () {
                        mstrmojo.alert(message, callback); 
                        /*   
                        // Show dialog
                        mstrApp.showDialog({
                            title: title,
                            alignment: 'center',
                            children: [{
                                scriptClass: 'mstrmojo.Label',
                                text: message,
                                visible: true,
                                cssClass: 'mstrmojo-androidAlert'
                            }],
                            buttons: [ mstrmojo.Button.newAndroidButton(mstrmojo.desc(1442, 'OK'), callback) ]
                        });
                        */
                    });
                }
                
                var reExecuteCallback = {
                        success: function (res) {
                            showDialog(
                                mstrmojo.desc(8617, 'Your view has been updated with the latest version of the document.'), 
                                function () {
                                    me.setData(res);
                                    me.getPageByTree(contentView);
                                    updateMenu(false);
                                }
                            );
                        },

                        prompts: function () {
                            showDialog(
                                mstrmojo.desc(8619, 'New prompts were added to the document.'), 
                                function () {
                                    updateMenu(false);
                                    me.reprompt();
                                }
                            );
                        },

                        //TODO: Add a proper handler.
                        //If the report is prompted then the error may be caused by changes in prompts
                        //so we need to treat it like above case
                        failure: function() {
                            updateMenu(false);
                        }
                    };
                
                updateMenu(true);
                dataService.checkCache(
                    mstrmojo.hash.copy(res.ci, {}), //Params
                    {                               //Callback
                        success: function (res) {
                            if (res.needUpdate) {
                                reExecute(me, params, reExecuteCallback);
                            } else {
                                cacheIsGoodCallback();
                                updateMenu(false);
                            }
                        },

                        failure: function () {
                            // In hosted environment the checkCache request will always fail because we don't have corresponding task.
                            // However, for debugging purposes we will always re-execute if we got to this point.
                            if (!mstrApp.onMobileDevice()) {
                                reExecute(me, params, reExecuteCallback);
                            } else {
                                updateMenu(false);
                            }
                        }
                    }
                );
            }
        }
    );
}());