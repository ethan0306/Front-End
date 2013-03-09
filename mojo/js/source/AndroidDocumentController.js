/**
 * AndroidDocumentController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 *
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */

(function () {

    mstrmojo.requiresCls("mstrmojo.AndroidResultSetController",
                         "mstrmojo._IsDocController");

    var UNIT_SEPARATOR = "\u001F",
        MARK_ROW = 1; //mark row manipulation

    function handleSpecialLink(me, uri, action) {
        var param = uri.queryKey,
            view = me.contentView,
            eventId = param.evt,
            authority = uri.authority;

        if (eventId === "2048500") {
            //Info window link
            var name = param.panelName,
                model = view.model,
                unit = model.getInfoWindow(name);
            if (unit) {
                view.showInfoWindow(unit.id, unit.k, action.src.domNode);
            }
        } else if (authority === 'gb') {
            //Group by link
            var curLayout = view.getSelectedLayoutWidget(),
                gpby = curLayout.gb,
                attId = param.a,
                eId = param.e,
                $forEach = mstrmojo.array.forEach;


            // Iterate group by units.
            $forEach(gpby.groupbys, function (gb) {
                var unit = gb.unit,
                    target = unit.target;
                if (target.did === attId) {
                    var showDialog = function () {
                        var options = unit.elms,
                            items = [];

                        // Create items collection.
                        $forEach(options, function (opt, idx) {
                            items.push(mstrmojo.hash.copy(opt, {
                                k: gb.k,
                                on: (idx === unit.idx)
                            }));
                        });

                        mstrApp.showDialog({
                            title: target.n,
                            children: [{
                                scriptClass: 'mstrmojo.ui.MobileCheckList',

                                /**
                                 * Setting the selection policy to 'reselect' allows items to be reselected from the group-by list.
                                 *
                                 * @see mstrmojo.ListBase
                                 */
                                selectionPolicy: 'reselect',
                                items: items,
                                multiSelect: false,
                                isElastic: true,
                                selectedIndex: unit.idx,

                                /**
                                 * Callback once the selection on the list changes.
                                 */
                                preselectionChange: function (evt) {
                                    // Check if the user is selecting the same thing. Not adding a nulll check
                                    if (evt.added[0] === evt.removed[0]) {
                                        // Close the dialog since we don't have to do anything more.
                                        mstrApp.closeDialog();

                                        // Return false so that the other events don't get fired.
                                        return false;
                                    }

                                    // Call super if there is one.
                                    if (this._super) {
                                        return this._super(evt);
                                    }
                                },

                                postselectionChange: function (evt) {
                                    mstrApp.closeDialog();
                                    var item = items[evt.added[0]];
                                    me.onGroupBy(curLayout, {
                                        groupbyKey: item.k,
                                        elementId: item.v
                                    });
                                }
                            }]
                        });
                    };

                    if (eId && parseInt(eId, 10) !== 0) {
                        me.onGroupBy(curLayout, { //params
                            groupbyKey: gb.k,
                            elementId: eId
                        }, {   //Callback
                            //TQMS 506983. We need to show elements selection if provided element is incorrect
                            failure: showDialog
                        }, {   //config
                            //TQMS 506983. We need to suppress showing error message
                            noErrorMessage: true
                        });
                    } else {
                        showDialog();
                    }
                    return false; //Stop the loop
                }
            });
        }
    }

    function getDesiredUnits(me, elements) {

        var model = me.model,
            lyts = model.data.layouts,
            lytKey = model.currlaykey,
            i = 0,
            cnt = (lyts && lyts.length) || 0,
            //513644. Inherit desired from the previous document
            res = me.desiredUnits || {},
            lyt,
            elemSize = elements && elements.length;

        //Find current layut
        for (i = 0; i < cnt; i++) {
            if (lyts[i].k === lytKey) {
                lyt = lyts[i];
                break;
            }
        }

        if (lyt && lyt.gbys) {
            var gbys = lyt.gbys.groupbys,
                size = gbys.length;

            for (i = 0; i < size; i++) {
                var gb = gbys[i].unit,
                    elem;
                if (elements) {
                    if (i < elemSize) {
                        elem = elements[i];
                    } else {
                        //If we have elements then we shall not generate more desired elements then
                        //elements.length.
                        break;
                    }
                } else {
                    elem = gb.elms[gb.idx].v;
                }
                res[gb.target.did] = elem;
            }
        }
        return res;
    }

    function toDesiredElements(units) {
        var res = '',
            i = 0,
            u;

        for (u in units) {
            if (i > 0) {
                res += UNIT_SEPARATOR;
            }
            res += u + UNIT_SEPARATOR + units[u];
            i++;
        }

        return res;
    }

    /**
     * Returns the orientation to it's prevous locked (or not) state.
     *
     * @private
     */
    function clearOrientation() {
        // Get the previous orientation.
        var previousOrientation = this._previousOr;

        // Has the orientation already been cleared?
        if (previousOrientation === -1) {
            // Nothing to do.
            return;
        }

        // Was the device previously unlocked?
        if (previousOrientation === 0) {
            // Notify application to release orientation lock.
            mstrMobileApp.releaseOrientation();

        // Was the device previously locked?
        } else if (previousOrientation > 0) {
            // Ask the native side to lock the device to the previous orientation.
            mstrMobileApp.lockOrientation(previousOrientation);
        }

        // Mark orientation as cleared.
        this._previousOr = -1;
    }

    /**
     * The Document data controller for the Android application.
     *
     * @class
     * @extends mstrmojo.AndroidResultSetController
     */
    mstrmojo.AndroidDocumentController = mstrmojo.declare(

        mstrmojo.AndroidResultSetController,

        [mstrmojo._IsDocController],

        /**
         * @lends mstrmojo.AndroidDocumentController.prototype
         */
        {
            scriptClass: "mstrmojo.AndroidDocumentController",

            modelName: 'Document',

            start: function start(params, callback) {
                //513644. Remember desired elements passed to us from the previous document
                var du = this.desiredUnits = params.desiredUnits;
                if (du) {
                    var desired = toDesiredElements(du);
                    if (desired) {
                        params.desiredElements = desired;
                    }
                    delete params.desiredUnits;
                }
                this._super(params, callback);
            },

            /**
             * Creates a view.
             *
             * @param {Object} The execution parameters.
             *
             */
            createView: function createView(res, params) {
                // Are we on a phone?
                if (!mstrApp.isTablet()) {
                    var layouts = res.defn.layouts,
                        currentLockedOrientation = mstrMobileApp.getLockedOrientation(),        // Previous locked orientation.
                        lastLayoutOrientation = -1,                                             // Undefined layout orientation.
                        newOrientation = -1,                                                    // Undefined new locked orientation.
                        shouldLock = true,                                                      // Assume we need to lock the device orientation.
                        cnt = layouts.length,
                        i;

                    // Iterate layout definitions.
                    for (i = 0; i < cnt; i++) {
                        // Get the orientation for this layout.
                        var layoutOrientation = layouts[i].or;

                        // Has the new locked orientation NOT been set?
                        if (lastLayoutOrientation === -1) {
                            // Initialize the new locked orientation.
                            lastLayoutOrientation = layoutOrientation;
                        }

                        // Does the orientation of this layout NOT match the new locked orientation OR is the orientation of this layout set to BOTH?
                        if (layoutOrientation !== lastLayoutOrientation || layoutOrientation === 3) {
                            // No need to lock orientation.
                            shouldLock = false;

                            // Halt iteration.
                            break;
                        }
                    }

                    // Is the device already locked?
                    if (currentLockedOrientation > 0) {
                        // Should we lock for this document?
                        if (shouldLock) {
                            // Is the locked orientation different?
                            if (lastLayoutOrientation !== currentLockedOrientation) {
                                // New orientation will be the last layout orientation.
                                newOrientation = lastLayoutOrientation;
                            }

                        } else {
                            // Device was locked, but we don't want it locked, so orientation should be released.
                            newOrientation = 0;
                        }

                    } else {
                        // Should we lock the orientation for this document?
                        if (shouldLock) {
                            // New orientation will be the last layout orientation.
                            newOrientation = lastLayoutOrientation;
                        }
                    }

                    // Do we need to change the orientation?
                    if (newOrientation > -1) {
                        // Should we release the orientation?
                        if (newOrientation === 0) {
                            // Ask native side to unlock the device orientation.
                            mstrMobileApp.releaseOrientation();
                        } else {
                            // Ask the native side to lock the device orientation.
                            mstrMobileApp.lockOrientation(newOrientation);
                        }

                        // We changed the lock status so cache the previous locked value.
                        this._previousOr = currentLockedOrientation;
                    }
                }

                // Get the frame.
                var frame = this.contentFrame = this.newView('Document', params);

                // Update the title.
                frame.updateTitle(res.n);

                // Get the doc and set the model.
                var doc = this.contentView = frame.getContentView();
                doc.set('model', this.model);

                // Tell the doc to build children.
                doc.buildChildren();
                return frame;
            },

            answerPrompts: function answerPrompts(callback) {
                var me = this;
                if (me.repromptFlag) {
                    me.model.answerPrompts({
                        success: function (res) {
                            me.repromptFlag = false;
                            //TQMS 516550. We need to unload all non-current layouts when we reprompt
                            me.contentView.unloadLayouts(null, false);
                            me.contentView.model.loadLayout(res, true);
                            callback.success(me.contentFrame);
                            me._checkCache(res, {
                                did: me.did,
                                n: me.n,
                                st: me.st,
                                t: me.t
                                //promptsAnswerXML: me.model.prompts.getAnswerXML()
                            });
                        },
                        failure: callback.failure,
                        prompts: callback.prompts
                    });
                } else {
                    this._super(callback);
                }
            },

            onGroupBy: function onGroupBy(view, params, callback, config) {
                var me = this;

                config = config || {};
                config.showWait = true;
                config.hideWait = true;
                config.delay = true;

                // Wrap callback method
                callback = mstrmojo.func.wrapMethods(callback, {
                    success: function (res) {
                        //TQMS 506058 We need to unload layouts with group bys because desired elements changed.
                        me.contentView.unloadLayouts(null, true);
                        me.model.loadLayout(res);
                    }
                });
                me.model.getDataService().changeDocGroupBy(params, callback, config);
            },

            setData: function setData(res) {
                this.model.loadLayout(res);
            },

            onDrill: function onDrill(view, action) {
                // TQMS 493914 check if there is no request currently processing if not than drill else ignore drilling
                if (!this.isInRequest()) {
                    // Is drilling within?
                    if (action.isWithin) {
                        // Yes, then we need to submit the request and replace the grid within the document
                        view.model.drillGrid(this._addNodeKeyToAction(view, action), this._getXtabCallback.call(this, view));
                    } else {
                        // No, we pass the action to parent to open a new report
                        this.parent.onDrill(this._addNodeKeyToAction(view, action));
                    }
                }
            },

            onDownloadGridData: function onDownloadGridData(view, action) {
                this.model.downloadGridData(this._addNodeKeyToAction(view, action));
            },

            onExecuteNewObject: function onExecuteNewObject(view, action) {
                this.parent.onExecuteNewObject(action);
            },

            onReExecute: function onReExecute(view) {
                this.reExecute(view);
            },

            invalidClientCache: function () {
                if (mstrApp.useBinaryFormat) {
                    mstrMobileApp.removeLiveCache(mstrApp.getCurrentProjectId(), this.model.ci.cid);
                }
            },

            /**
             * Send the transaction updates to the backend.
             */
            onTransactionUpdates: function onTransactionUpdates(view, updateObject, autoRefresh) {
                var me = this, callback;

                if (mstrApp.useBinaryFormat) {
                    callback = {
                        success: function () {
                            var m = me.model;

                            //clear the transaction delta
                            view.clear();

                            m.clearTxDeltaUpdate();

                            if (autoRefresh) {
                                //let view refresh its data model to get new data if needed
                                //TQMS 504408: delay the process of incremental fetch call so that it won't cause damage to the Android soft input.
                                setTimeout(function () {
                                    view.autoRefresh();
                                }, 250); //250ms is the least time required to do the fix
                            }
                        }
                    };

                    if (updateObject.manipulation === MARK_ROW) {
                        this.model.getDataService().txMarkRows(updateObject, callback);
                    } else {
                        this.model.getDataService().txChangeData(updateObject, callback);
                    }
                } else {
                    //xml mode, we make it go
                    if (autoRefresh) {
                        //let view refresh its data model to get new data if needed
                        view.autoRefresh();
                    }
                }
            },

            onLink: function onLink(view, action) {

                // If action.url is not defined, then it's from a template and linking to a report/document.
                if (!action.url) {
                    this.parent.onLink(action);
                    return;
                }

                // Parse URL.
                var uri = mstrmojo.string.parseUri(action.url),
                    authority = uri.authority,
                    directory = uri.directory;

                if (uri.protocol === 'mstr') {
                    handleSpecialLink(this, uri, action);
                } else if (authority === 'mstrWeb' || authority === 'Main.aspx' || (/mstrWeb$/.test(directory)) || (/Main.aspx$/.test(directory))) {
                    // Create parameters.
                    var params = {
                            srcMsgId: this.model.mid,
                            desiredUnits: getDesiredUnits(this, this.getGroupByElements(action.src))
                        };

                    mstrmojo.hash.forEach(uri.queryKey, function (v, k) {
                        //TQMS 488500 The decodeURIComponent method doesn't replace pluses with spaces
                        v = v.replace(/\+/g, ' ');
                        params[k] = decodeURIComponent(v);
                    });


                    // Pass to screen controller.
                    this.parent.onLink(params);

                } else {
                    // Open url.
                    var err = mstrMobileApp.openLink(uri.source, action.target);
                    if (err) {
                        mstrApp.onerror({message: err});
                    }
                }
            },

            getDesiredElements: function getDesiredElements(elements) {
            	var gbElements = this.model.gbElements,
            		res = '';
            	//TQMS 530077. IggbElements not null then we got here while switching the layouts becuase of orientation.
            	//In this case we must simple reuse group bys from the original request.
            	if ( gbElements) {
            		var gbs = gbElements.split(';'),
            		    i, size = gbs.length;
            		for (i = 0; i < size; i += 3) {
        	            if (i > 0) {
        	                res += UNIT_SEPARATOR;
        	            }
        	            res += gbs[i] + UNIT_SEPARATOR + gbs[i + 2];
            		}
            	} else {
            		res = toDesiredElements(getDesiredUnits(this, elements));
            	}
            	return res;
            },

            destroy: function destroy() {
                // Make sure the orientation is cleared.
                clearOrientation.call(this);

                // Call super.
                this._super();
            },

            /**
             * Resets the orientation to it's previous locked (or not) state.
             *
             */
            resetOrientation: function resetOrientation() {
                clearOrientation.call(this);
            }
        }
    );
}());
