(function() {
    
    mstrmojo.requiresCls("mstrmojo.DocSelector", "mstrmojo.Button", "mstrmojo.form", "mstrmojo.base64");
    
    var SUBMIT = 8,
        RECALCULATE = 16,
        DISCARD = 4,
        //subsequent actions, refer to EnumDSSXMLRWControlSubsequentAction
        DISPLAY_MSG = 1,
        DISPLAY_TXREPORT = 2,
        REFRESH_GRID = 4,
        REEXECUTE_DOCUMENT = 8,
        EXECUTE_OBJECT = 16,
        FORCE_LIVE_EXECUTION = 0x10000000,
        INVALID_CLIENT_CACHE = 0x20000000, 
        AUTO_ANSWER_PROMPT = 0x40000000,
        useMojoDialog = window.mstrConfig && !window.mstrConfig.simpleDialog;
    
    var $NIB = mstrmojo.Button.newInteractiveButton,
        BC = 'mstrmojo-oivmSprite '; //button style prefix    


    function confirmMsg(msg, okFn, cancelFn) {
        if (useMojoDialog) {
            mstrmojo.confirm(msg, [$NIB(
                    mstrmojo.desc(1442),
                    okFn || null,
                    null
                ),$NIB(
                    mstrmojo.desc(2140), 
                    cancelFn || null, 
                    null
                   )
                ]);
        }else {
            // For the browser native confirmation dialog, check the return value to decide which function to execute.
            if (mstrmojo.confirm(msg)){
                if (okFn){
                    okFn();
                }
            }else if (cancelFn){
                cancelFn();
            }
        }
    }
    
    function alertMsg(msg, okFn){
        if (useMojoDialog) {
            mstrmojo.alert(msg, okFn);
        }else{
            mstrmojo.alert(msg);
            okFn();
        }
    }
    
    /**
     * The Action Selector Widget.
     * @class mstrmojo.ActionSelector
     * @extends mstrmojo.Container
     */
    mstrmojo.DocActionSelector = mstrmojo.declare(
        //base class    
        mstrmojo.DocSelector,
        //mixin
        null,
        /**
         * @lends mstrmojo.ActionSelector.prototype
         */
        {
            scriptClass: 'mstrmojo.ActionSelector',
            
            extCls: 'mstrmojo-ActionSelector',
            
            /**
             * Action selector type, can be SUBMIT, RECALCULATE, and DISCARD
             */
            type: SUBMIT,
            
            /**
             * An array of the key of the target widgets
             */
            targets: null,
                       
            initControlInfo:function initControlInfo() {
                var defn = this.node.defn;
                this.aa = parseInt(defn.aa, 10);
                this.dpTxt = defn.dpTxt || {8: mstrmojo.desc(5369), 4: mstrmojo.desc(8233), 16: mstrmojo.desc(8232)}[this.aa] || '';
                this.dpCfm = defn.dpCfm;
                this.sac = parseInt(defn.sac, 10);
                this.msg = defn.msg;
                this.rsid = defn.rsid;
                this.rst = defn.rst;
                
                this.node.data.elms = [{n: this.dpTxt, v: this.dpTxt}];
                if(this._super) {
                    this._super();
                }
            },
            
            selectorControlChange: function(w) {
                //Since we use the same selector code for the button/link rendering, the button/link cannot behavior as a single selection buttons
                //So we need to clear the selected item immediately
                //As we clear selections will trigger onselectionChange, and it will come to this function again
                //To prevent the tasks triggered twice, we should terminate it when we know this is a clear selection action.
                if(w.selectedIndex !== 0) {
                    return ;
                }
                this.executeAction();
                w.select([]);
            },
                        
            executeAction: function() {
                var aa = this.aa,
                    me = this;
                
                if(aa === SUBMIT) {
                    if(this.dpCfm) {
                        confirmMsg(mstrmojo.desc(8313), function(){
                            me.onCommit();
                        });
                    } else {
                        me.onCommit();
                    }
                } else if(aa === DISCARD) {
                    if(this.dpCfm) {
                        confirmMsg(mstrmojo.desc(8322), function(){
                            me.onDiscard();
                        });             
                    } else {
                        me.onDiscard();
                    }
                } else {
                    this.onRecalculate();
                }
            },
            
            postBuildRendering: function(){
                this._super();
                
                this.domNode.ontouchstart = function(e){
                    mstrmojo.css.addClass(e.target, 'glow');
                };
                
                this.domNode.ontouchend = function(e){
                    mstrmojo.css.removeClass(e.target, 'glow');
                };
            },
            
            /**
             * Commits all the changes
             */
            onCommit: function() {
                var me = this,
                    md = this.model,
                    params;
                
                //execute the subsequent actions
                var executeActions = function(res) {
     
                    if((me.sac & INVALID_CLIENT_CACHE) > 0) {
                        me.controller.invalidClientCache();
                    }
                    
                    if((me.sac & EXECUTE_OBJECT) > 0) {
                        params = {
                            did: me.rsid, 
                            objType: me.rst, 
                            forceExec: (me.sac & FORCE_LIVE_EXECUTION) > 0
                        };
                        if ((me.sac & AUTO_ANSWER_PROMPT) > 0){
                            params.linkAnswers = '<hl mid="' + md.mid + '" srct="2" aopam="1"><prms></prms></hl>';
                        }
                        me.controller.onExecuteNewObject(me, params);
                    } else if((me.sac & REEXECUTE_DOCUMENT) > 0) {
                        me.controller.onReExecute(me);
                    } else {
                        //refresh the document to clear all the flags
                        md.transactionUpdate(res);
                    }                    
                };
                
                md.sendTransactionActions(this.ck, SUBMIT, {
                    success: function(res) {
                        //if there is display message, we will display confirm dialog first, then execute the subsequent actions
                        if((me.sac & DISPLAY_MSG) > 0 && me.msg) {
                            alertMsg(me.msg, function(){
                                executeActions(res);
                            });
                        } else {
                            executeActions(res);
                        }
                    },
                    failure: function(res) {
                        if(mstrmojo.all.mojoAlertx9) {
                            mstrmojo.all.mojoAlertx9.destroy();
                        }
                        //currently we only refresh the document if error happens
                        alertMsg(mstrmojo.base64.decodeHttpHeader(res.message), function(){
                            me.controller.onReExecute(me, true);
                        });
                    }
                });               
            },

            /**
             * Executes the clear all action once the discard button is clicked
             */
            onDiscard: function() {
                this.model.sendTransactionActions(this.ck, DISCARD);
            },
            
            /**
             * Submits recalculate action
             */
            onRecalculate: function() {
                this.model.sendTransactionActions(this.ck, RECALCULATE);
            }
            
        }
    );
}());