/**
 * AndroidXtabController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */

(function () {

    mstrmojo.requiresCls("mstrmojo.AndroidResultSetController",
                         "mstrmojo.AndroidXtab",
                         "mstrmojo._IsInteractiveGrid");
    
    function getUpdateXtabCallback(me) {
        return {
            success: function (res) {
            	me.setData(res);
            }
        };
    }
        
    /**
     * Passes the action and a standard crosstab GUI update callback to the indicated method of the controller model.
     * 
     * @param {String} methodName The name of model method to call.
     * @param {Any[]} args The array of parameters to be passed to the model method.
     * 
     * @private
     */
    function initiateXtabInteractivity(methodName, args) {
        // Add callbacks to args collection.
        args.push(getUpdateXtabCallback(this));
        
        // Call indicated method.
        var model = this.model;
        model[methodName].apply(model, args);
    }
    
    /**
     * The Xtab data controller for the Android application.
     * 
     * @class
     * @extends mstrmojo.AndroidResultSetController
     */
    mstrmojo.AndroidXtabController = mstrmojo.declare(
            
        mstrmojo.AndroidResultSetController,
        
        null,

        /**
         * @lends mstrmojo.AndroidXtabController.prototype
         */
        {
            scriptClass: "mstrmojo.AndroidXtabController",
            
            modelName: "Xtab",
            
            /**
             * Creates a view.
             * 
             * @param {Object} The execution parameters.
             *  
             */
            createView: function createView(res, params) {
                var me = this,
                    styleName = me.model.data.visName;
                if (styleName) {
                    // Is this a visualization?
                    var vis = mstrmojo.AndroidVisList.getVis(styleName);
                    if (vis) {
                        // Add the visualization info to the parameters.
                        params.viz = vis;
                    }
                }   
                
                
                // Create the frame.
                var frame = me.contentFrame = me.newView('Xtab', params);
                
                // Update the title.
                frame.updateTitle(res.n);
                
                // Get the xtab and set the model.
                var xtab = me.contentView = frame.getContentView();
                
                xtab.setModel(me.model);
                return frame;
            },

            answerPrompts: function answerPrompts(callback) {
                var me = this,
                    contentView = me.contentView;
                if (me.repromptFlag) {
                    me.model.answerPrompts({
                        success: function (res) {
                            me.repromptFlag = false;
                            contentView.set('gridData', res);
                            me.getPageByTree(contentView);
                            callback.success(me.contentFrame);
                            var params = {
                                    did: me.did,
                                    n: me.n,
                                    st: me.st,
                                    t: me.t
                                    //promptsAnswerXML: me.model.prompts.getAnswerXML()
                                };
                                me._checkCache(res, params);
                        },
                        failure: callback.failure,
                        prompts: callback.prompts
                    });
                } else {
                    this._super(callback);
                }
            },
            
            onDrill: function onDrill(view, action) {
                var me = this,
                    params = {
                        did: me.did,
                        t: me.t,
                        st: me.st
                    },
                    callback = function() {
                        me.parent.onDrill(action);
                    };
                me._checkCache(me.model.data, params, callback);
            },
            
            onLink: function onLink(view, action) {
                this.parent.onLink(action);
            },
            
            onSort: function onSort(view, action) {
                initiateXtabInteractivity.call(this, 'sort', [ action ]);
            },
            
            onPivot: function onPivot(view, action) {
                initiateXtabInteractivity.call(this, 'pivot', [ action ]);
            },
            
            onPageBy: function onPageBy(view, pageByKeys) {
                this.model.pageBy(pageByKeys, mstrmojo.func.wrapMethods(getUpdateXtabCallback(this), {
                    failure: function (res) {
                        mstrApp.onerror(res);
                    }
                }));
            },
            
            /**
             * This function on the controller delegates the fetching of inceremetal fetch grid data from the server.
             * 
             * @param view The Xtab view widget
             * @param action The task parameters.
             */
            onDownloadGridData: function onDownloadGridData(view, action) {
                this.model.downloadGridData(action);
            },
            
            setData: function setData(res) {
                var xtab = this.contentView;
                             
                xtab.set('gridData', res);
                var dim = mstrApp.getContentDimensions();
                
                // Render again.
                xtab.unrender();

                xtab.width = dim.w;
                xtab.height = dim.h;                                
                xtab.render();
            }
        });
}());