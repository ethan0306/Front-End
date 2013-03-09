(function () {
    
    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.hash",
                         "mstrmojo.XtabDataService");
    
    var INFO = 'info';
    
    function getInfo(me, data) {
        var pid = mstrApp.getCurrentProjectId(),
            visName = me.delegate.visName;
            info =  {
                obId: me.delegate.dssId,
                obTp: me.getObjectType(),
                prId: pid,
                server: mstrApp.getConfiguration().getServerByProjectId(pid).nm
            };
            if (visName) {
                info.visName = visName;
            }
        
        return info;
    }
    
    /**
     * Builds link-related cache key based on the link-related parameters and adds it to the keys array.
     * The key will be build only if the link is "cacheable", that is it uniquely identifies the cache. 
     * For example the link is considered non-cacheable if at least one link element is of type "Answer
     * With the Same Answer" or "Do not Answer".
     * @param me
     * @param keys
     * @param params
     * @param obId
     * @returns An indicator whether the execute command shall try to use cache. The return value will be true
     *          if there is no link info in parameters or if the link is cacheble.
     */
    function  addLinkKeys(me, keys, params, obId) {
        var hasLink = false,
            l = params.link,
            key;
        if ( l ) {
            hasLink = true;
            var prms = l.prms,
                prmCnt = prms && prms.length,
                cacheble = true;
          
            if (prmCnt) {
                //Check if all link units are cachable
                for (var i = 0; i < prmCnt && cacheble; i++) {
                    var am = prms[i].am;
                    switch (am) {
                        case l.DO_NOT_ANSWER:
                        case l.SAME_PROMPT:
                            cacheble = false;
                            break;
                    };
                }
            }
            if ( cacheble ) {
                key = 'a:' + l.toXml();
            }
        } else {
            var i, param,
                urlLinkParams = me.delegate.urlLinkParams();
            for ( i = 0; i < urlLinkParams.length; i++ ) {
                param = params[urlLinkParams[i]];
                if ( param ) {
                    hasLink = true;
                    if ( ! key ) {
                        key = 'a:';
                    }
                    key += param;
                }
            }
        }
        if ( key ) {
            keys.push(key);
        }
        if ( hasLink ) {
            me.promptLevel = me.obLevel + 1;
            me.levelCount = me.promptLevel + 1;
        }
        return hasLink && ! key;
    }
    
    /**
     * <p>Mobile report data service.</p>
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.ResSetCachedDataService = mstrmojo.declare(
        mstrmojo.Obj,

        null,

        /*
         * @lends mstrmojo.ResSetCachedDataService.prototype
         */
        {
            scriptClass: "mstrmojo.ResSetCachedDataService",
            
            STATUS_ONLY_PARAM: {
                    statusOnly: true
                },

            
            delegate: null,
            store: null,
            levelCount:2,
            //projLevel: 0,
            obLevel: 1,
            promptLevel: 0,
            layoutLevel: 0,
            pbLevel: 0,
            pbLength: 0,

            init: function init(props){
                this._super(props);
                if ( ! this.store ) {
                    this.store = mstrApp.getResSetStore();
                }
            },
            
            /**
             * Executes Object.
             * 
             * @param {Object} params An object containing call parameters.
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if document is not prompted. The parameter passed to this function will the data from the object execution.
             * @param {Function} callback.prompts A function called if document is prompted. The parameter passed to this function will contain the prompts data.
             * @param {Function} callback.failure A function called if the request failed. 
            */
            execute: function execute(params, callback) {
                this.levelCount = this.obLevel + 1;
                var me = this,
                    delegate = me.delegate,
                    store = me.store,
                    obId = (params && (params.dssId || params.objectID)) || me.dssId,
                    keys = ['r:' + obId],
                    uncachebleLink = addLinkKeys(me, keys, params, obId),
                    cachedStr,
                    //A helper function called when we hit the cache
                    onCacheHit = function() {
                        var cachedData = JSON.parse(cachedStr),
                            obInfoStr = store.getValue(INFO, me.obLevel),
                            obInfo = JSON.parse(obInfoStr),
                            //If the report is prompted then we need to adjust state
                            prompts = obInfo.prompts;
                        if ( prompts) {
                            //Set up prompt level
                            me.promptLevel = me.obLevel + 1;
                            me.levelCount = me.promptLevel + 1;
                            
                            //Update delegate status
                            var answerInfo = JSON.parse(store.getValue(INFO, me.promptLevel));
                            delegate.prompts = prompts;
                            delegate.answers = answerInfo.answers;
                            //cachedData.prompts = delegate.getPrompts();
                        }
                        if ( obInfo.visName ) {
                            delegate.visName = obInfo.visName;
                        }
                        me.processData(cachedData, 'exec', false);
                        callback.success(cachedData);
                    },
                    
                    //Callback wrapper for caching results
                    myCallback = {
                            success: function (res) {
                                //Cache results
                                me.processData(res, 'exec', true);
                                me.addLayoutCacheKey(keys, res);
                                me.addPbCacheKeys(keys, res);
                                
                                //Add object level info
                                var info = getInfo(me, res),
                                    ci = res.ci,
                                    prompts = delegate.prompts,
                                    curAnswers = delegate.answers;
                                if ( prompts ) {
                                    info.prompts = delegate.prompts;
                                } else if ( ci) {
                                    //We store cache info at the object level only if
                                    //it is not prompted. Otherwise we will store it 
                                    //at the prompts level.
                                    info.ci = ci;
                                }
                                var extras = [{
                                    l:me.obLevel,
                                    n:INFO,
                                    v:JSON.stringify(info)
       
                                }];
                                //Add prompts level info
                                if ( prompts && (ci || curAnswers)) {
                                    var linkInfo = {};
                                    if ( ci ) {
                                        linkInfo.ci = ci;
                                    }
                                    if ( curAnswers) {
                                        linkInfo.answers = curAnswers;
                                    }
                                    extras.push({
                                        l:me.promptLevel,
                                        n:INFO,
                                        v:JSON.stringify(linkInfo)
                                    });
                                }
                                me.putData(store, me.obLevel, keys, res, false, extras);
                                
                                callback.success(res);
                           },
                            
                            prompts: callback.prompts,
                            failure: callback.failure
                       };
                //=============================================================================
                //This is main method logic
                    
                //Remember object id    
                delegate.dssId = obId;    
                    
                //If there is a link but we cannot use it as a cache key then we need to
                //execute report and get answers from the server to use them as the key
                if (  uncachebleLink ) {
                    //Execute report with status only. (The delegate will recognize that this is from link
                    //and get prompt answers from the server).
                    delegate.execute(
                        params, {
                            success: function(res) {
                                var answer = delegate.answers;
                                if ( answer ) {
                                    keys.push('a' + JSON.stringify(answer));
                                    cachedStr = store.getData(me.obLevel, keys);
                                    if ( cachedStr  ) {
                                        onCacheHit();
                                    } else {
                                        //No cache found - need to get results from the server.
                                        delegate.getResults(params, myCallback);
                                    }
                                }
                            },
                            prompts: callback.prompts,
                            failure: callback.failure
                        }, me.STATUS_ONLY_PARAM);
                }  else { 
                    cachedStr = store.getData(me.obLevel, keys);
                    if ( cachedStr  ) {
                        onCacheHit();
                    } else {
                        //No cache found - need to execute report or document.
                        delegate.execute(params, myCallback);
                    }
                }
             },

             /**
              * Gets object execution results.
              * 
              * @param {Function} callback.success A function called if the request succeeds. The parameter passed to this function will contain executed object data.
              * @param {Function} callback.failure A function called if the request failed. 
              */
             getResults: function getResults(params, callback) {
                 this.delegate.getResults(params, callback);
             },
             
             /**
             * Answers prompts.
             * 
             * @param {mstrmojo.prompt.WebPrompts} prompts A prompt object containing data.
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if prompts answered successfully. The parameter passed to this function will be the data from the object execution.
             * @param {Function} callback.prompts A function called if document is prompted. The parameter passed to this function will contain the prompts data.
             * @param {Function} callback.failure A function called if the request failed. 
             */
            answerPrompts: function answerPrompts(prompts, callback) {
                var me = this;
                me.promptLevel = me.obLevel + 1;
                me.levelCount = me.promptLevel + 1;
                var delegate = me.delegate,
                    store = me.store,
                    data = null,
                    answer = prompts.buildAnswerObject(),
                    answerXml = prompts.getAnswerXML(),
                    answerKey = 'a:' + answerXml,
                    v = store.getData(me.promptLevel, [answerKey]);
                //Found data in cache
                if ( v ) {
                    data = JSON.parse(v);
                    var obInfoStr = store.getValue(INFO, me.obLevel),
                        obInfo = JSON.parse(obInfoStr);
                    if ( obInfo.visName ) {
                        delegate.visName = obInfo.visName;
                    }
                    me.processData(data, 'answer', false);
                    //Update delegate state
                    delegate.answers = answer;
                    store.setAsDefault(me.promptLevel);
                    
                    callback.success(data);
                    return;
                }
                var myCallback = {
                        success: function (res) {
                            
                            //Cache results
                            me.processData(res, 'answer', true);
                            var keys = ['r:' + me.delegate.dssId, answerKey];
                            me.addLayoutCacheKey(keys, res);
                            me.addPbCacheKeys(keys, res);
                            
                            //Prepare extras for caching
                            var extras = [];
                            //If we don't have an object node yet (answering prompts during report execution rather then
                            //during re-prompting), then we need to store object info
                            if ( ! store.hasNode(me.obLevel) ) {
                                var info = getInfo(me, res)
                                //Save prompts data we remembered during execution 
                                info.prompts = delegate.prompts;
                                extras.push({
                                    l:me.obLevel,
                                    n:INFO,
                                    v:JSON.stringify(info)
                                });
                            }
                            var answerInfo = {
                                answers: answer
                            };
                            //We need to store server cache info at the prompt level
                            if ( res.ci) {
                                answerInfo.ci = res.ci;
                            }
                            extras.push({
                                l:me.promptLevel,
                                n:INFO,
                                v:JSON.stringify(answerInfo)
                            });
                            me.putData(store, me.obLevel, keys, res, true, extras);
                            delegate.answers = answer;
                            callback.success(res);
                        },
                        
                        prompts: callback.prompts,
                        failure: callback.failure
                   };   
                //No cache found - need to call server.
                if ( delegate.msgId) {
                    delegate.answerPrompts(prompts, myCallback);
                } else {
                    //No message ID - need to re-execute 
                    var keys = JSON.parse(store.getKeys()),
                        execParams = {
                            dssId: keys[me.obLevel].substr(2),
                            promptsAnswerXML: answerXml
                        };
                    delegate.execute(execParams, myCallback);
                }
            },
             
            /**
             * Get prompts.
             * 
             * @param {Object} callback An object containing functions to be called when the request is complete.
             * @param {Function} callback.success A function called if prompts answered successfully. The parameter passed to this function will be the data from the object execution.
             * @param {Function} callback.failure A function called if the request failed. 
             */
            loadPrompts: function loadPrompts(callback) {
                this.delegate.loadPrompts(callback);
            },
            
            linkToObject: function linkToObject(params, callback) {
                this.execute(params, callback, true);
            },
            
            getPrompts: function getPrompts() {
                return this.delegate.getPrompts();
            },

            getImage: function getImage(url)  {
                var me = this,
                    store = me.store,
                    dataLevel = me.levelCount - 1,
                    hostUrl = mstrApp.getConfiguration().getHostUrlByProject(mstrApp.getCurrentProjectId());

                if (url && url.indexOf('://') === -1) {
                    // Add the hostUrl value.
                    url = hostUrl + url;
                }
                return '' + store.getImage(url, dataLevel);
                //return url;
            },
            
            //=========================================================================
            //Protected methods
            
            resetLevelCount: function resetLevelCount() {
                var me = this;
                me.pbLevel = 0;
                me.layoutLevel = 0;
                me.levelCount = (me.promptLevel || me.obLevel) + 1;
            },
            
            putData: function putData(store, level, keys, data, updateParent, extras) {
                var d = {
                        level:level, 
                        keys:keys,
                        data:JSON.stringify(data),
                        updateParent:updateParent
                    };
                if ( extras ) {
                    d.extras = extras;
                }
                store.putData(JSON.stringify(d));
            },
            
            reexecParams: function reexecParams(store) {
                var me = this,
                    delegate = me.delegate,
                    webPrompt = delegate.getPrompts(),
                    keys = JSON.parse(store.getKeys()),
                    execParams = {
                        dssId: keys[me.obLevel].substr(2)
                    };
                
                if ( webPrompt ) {
                    execParams.promptsAnswerXML = webPrompt.getAnswerXML();
                }
                return execParams;
            }
            
        }
    );
})();
