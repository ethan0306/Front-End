(function () {
    
    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.hash",
                         "mstrmojo.DocDataServiceXt",
                         "mstrmojo.ResSetCachedDataService");
    
    var delim = '\u001F';
    
    
    //Builds group by cache key
    function gbCacheKey(me, gbKey, eId) {
        var gBys = me.gBys,
            gb, i;
        if ( ! gBys ) {
            return null;
        }
        for (i = 0; i < gBys.length; i++ ) {
            gb = gBys[i];
            if (gb.k === gbKey ){
                return {
                    l: me.pbLevel + i,
                    v: 'p:' + eId
                };
            } 
        }
        return null;
    }
    
    function gbUnitsParam(me, gbKey, eId) {
        var res = [],
            gBys = me.gBys,
            gb, i;
        if ( ! gBys ) {
            return null;
        }
        for (i = 0; i < gBys.length; i++ ) {
            gb = gBys[i];
            res.push(gb.k);
            if ( gb.k === gbKey ) {
                res.push(eId);
                break;
            } else {
                res.push(gb.e.v);
            }
        }
        return res.join(delim);
    }
    
    /**
     * <p>Mobile report data service.</p>
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.DocCachedDataService = mstrmojo.declare(
        mstrmojo.ResSetCachedDataService,

        null,

        /*
         * @lends mstrmojo.DocCachedDataService.prototype
         */
        {
            scriptClass: "mstrmojo.DocCachedDataService",

            init: function init(props){
                this._super(props);
                if ( ! this.delegate ) {
                    this.delegate = new mstrmojo.DocDataServiceXt(props);
                }
            },

            loadDocLayout: function loadDocLayout (params, callback) {
                //Try cache first
                var me = this,
                    layoutKey = params.layoutKey,
                    store = me.store,
                    
                    // @@@ TODO: DJH - keys should include the groupby?
                    keys = ['l:' + layoutKey],
                    cachedStr = store.getData(me.layoutLevel, keys);
                    
                if ( cachedStr  ) {
                    var cachedData = JSON.parse(cachedStr);
                    this.processData(cachedData, 'layout', false);
                    store.setAsDefault(me.layoutLevel);
                    callback.success(cachedData);
                    return;
                }
                
                //No luck with cache. We have to load layout from server
                var delegate = this.delegate,
                //A helper function containing load layout code.
                    doLoadLayout = function doLoadLayout() {
                            delegate.loadDocLayout(params, {
                            success: function (res) {
                                me.processData(res, 'layout', true);
                                me.addPbCacheKeys(keys, res);
                                me.putData(store, me.layoutLevel, keys, res, true);
                                callback.success(res);
                            },
                            
                            failure: callback.failure
                       });
                    };
                //If we have message ID we can load layout right away
                if ( delegate.msgId  ) {
                    doLoadLayout();
                } else {
                    //We don't have message ID so we need to re-execute document before loading layout 
                    var p = me.reexecParams(store);
                    delegate.execute(p, 
                        {   success: function (res) {
                                //Now we can load layout
                                doLoadLayout();
                            },
                            
                            failure: callback.failure
                        }, me.STATUS_ONLY_PARAM
                    );
                }
            },

            setCurrentDocLayout: function setCurrentDocLayout (layoutKey) {
                //This method is called when user switches to the layout already cached by MOJO GUI. 
                //We don't need to set current layout on the server here because we may never need it.
                //We may be able to satisfy all requests from the cache. Instead we will set proper layout
                //when we miss a cache. But we need to get cache into a proper state.
                var me = this;
                if ( me.layoutKey != layoutKey ) {
                    me.layoutKey = layoutKey;
                    var store = me.store,
                        keys = ['l:' + layoutKey],
                        cachedStr = store.getData(me.layoutLevel, keys);
                    if ( cachedStr  ) {
                        var cachedData = JSON.parse(cachedStr);
                        this.processData(cachedData, 'layout', false);
                        store.setAsDefault(me.layoutLevel);
                    }
                }
            },          
            
            changeDocGroupBy: function changeDocGroupBy(params, callback) {
                //Try cache first.
                var me = this,
                    store = me.store,
                    gbKey = params.groupbyKey,
                    eId = params.elementId,
                    cacheKey = gbCacheKey(me, gbKey, eId),
                    cachedStr = store.getData(cacheKey.l, [cacheKey.v]);
                
                if ( cachedStr  ) {
                    var cachedData = JSON.parse(cachedStr);
                    me.processData(cachedData, 'pb', false);
                    callback.success(cachedData);
                    return;
                }
                
                //No luck with cache. We need to load data from server.
                var delegate = this.delegate,
                //A helper function containing code for changing group by
                    doChangeGroupBy = function(params) {
                    delegate.changeDocGroupBy(params, {
                        success: function (res) {
                            me.processData(res, 'pb' , true);
                            var keys = me.addPbCacheKeys([]);;
                            me.putData(store, me.pbLevel, keys, res, false);
                            callback.success(res);
                        },
                        
                        failure: callback.failure
                   });
                    };
                //If we have the message ID then we can change group by right away
                if ( delegate.msgId  ) {
                    //We need to pass all group by units because it is possible
                    //that we got previous page by(s) from cache. In this case
                    //the server status will not match the client status and using
                    //only one group by unit will produce incorrect result
                    params.gbUnits = gbUnitsParam(me, gbKey, eId);
                    
                    delete params.groupbyKey;
                    delete params.elementId;
                    
                    doChangeGroupBy(params);
                } else {
                    //We don't have the message ID (because we got data from the cache),
                    //so we need to re-execute document before changing group by.
                    var p = me.reexecParams(store);
                    delegate.execute(p, {
                        success: function (res) {
                            var layoutKey = me.layoutKey;
                            //If our current layout is not the same as the server layout we need to 
                            //set proper server layout before changing group bys
                            if ( layoutKey && me.serverLayoutKey != layoutKey ) {
                                delegate.setCurrentDocLayout(layoutKey, {
                                    success: function (res) {
                                        me.serverLayoutKey = layoutKey;
                                        //Now we can set group by
                                        doChangeGroupBy({
                                            gbUnits: gbUnitsParam(me, gbKey, eId)                            
                                        });
                                    },
                                    
                                    failure: callback.failure
                               });
                            } else {
                                //Layout is OK - just set group by
                                doChangeGroupBy({
                                    gbUnits: gbUnitsParam(me, gbKey, eId)                            
                                });
                            }
                        },
                        
                        failure: callback.failure
                    }, me.STATUS_ONLY_PARAM);
                }
            },            

            getRWGraphImage: function getRWGraphImage(params, callback) {
                this.delegate.getRWGraphImage(params, callback);
                var me = this,
                    delegate = me.delegate,
                    store = me.store,
                    imageKey = 'G:' + params.k + '_' + params.sid + '_' + params.w + '_' + params.h,
                    dataLevel = me.levelCount - 1,
                    cachedStr = store.getValue(imageKey, dataLevel);
                
                    if ( cachedStr) {
                        callback.success(cachedStr);
                        return;
                    }
                params.encodeImage = true;
                //TODO. I.B. We need to add re-execute option here in case we failed to save image in
                //      cache. We need to set proper layout and page by for re-execute.
                me.delegate.getRWGraphImage(params, {
                        success: function(res) {
                            store.setValue(dataLevel, imageKey, res);
                            callback.success(res);
                        },
                        failure: callback.failure
                    });
            },

            getDocImage: function getDocImage(url)  {
                return this.getImage(url);
            },

            fetchDocPage: function fetchDocPage(position, callback) {
                this.delegate.fetchDocPage(position, callback);
            },
            
            drillGrid: function drillGrid(params, callback) {
                this.delegate.drillGrid(params, callback);
            },        
            
            //=============================================================
            // Protected methods
            processData: function processData(data, command, fromServer) {
                var me = this;
                me.resetLevelCount();
                var layouts = data.defn && data.defn.layouts;
                if ( layouts && layouts.length > 1 ) {
                    me.layoutLevel = me.levelCount++;
                }
                
                me.gBys = null;
                me.gbMap = null;
                var res = [],
                    map = {},
                    d = data.data;
                    
                if ( ! d ) {
                    return;
                }
                var curLayoutKey = data.currlaykey,
                    layouts = d.layouts,
                    gBys, l, i;
                
                me.layoutKey = curLayoutKey;
                if ( fromServer ) {
                    me.serverLayoutKey = curLayoutKey;
                }
                //Find current layout
                for ( i = 0; i < layouts.length; i++ ) {
                    l = layouts[i];
                    if ( l.k === curLayoutKey ) {
                        gBys = l.gbys && l.gbys.groupbys;
                        break;
                    }
                }
                if ( gBys && gBys.length ) {
                    
                    //Populate group by info
                    for ( i = 0; i < gBys.length; i++ ) {
                        var gb = gBys[i],
                            unit = gb.unit,
                            info = {
                                k: gb.k,
                                target: unit.target,
                                e: unit.elms[unit.idx]
                            };
                        res.push(info);
                        map[gb.k] = info;
                    }  
                    me.gBys = res;
                    me.gbMap = map;
                    me.pbLevel = me.levelCount++;
                }
            },
            
            addPbCacheKeys: function addPbCacheKeys(keys, data) {
                var gBys = this.gBys;
                if ( gBys ) {
                    var i, gb;
                    for ( i = 0; i < gBys.length; i++ ) {
                        gb = gBys[i];
                        keys.push('p:' + gb.e.v);
                    }  
                }
                return keys;
            }, 
            
            addLayoutCacheKey: function addLayoutCacheKey(keys, data) {
                if ( this.layoutLevel ) {
                    keys.push('l:' + data.currlaykey);
                }
                return keys;
            },
            
            getObjectType: function getObjectType() {
                return 55;
            },
            
            setDocSelectorElements: function setDocSelectorElements(selectorKeyContext, elemList, controlKey, includeClause, callback, zoomFactor) {
                var delegate = this.delegate;
                delegate.setDocSelectorElements.apply(delegate, arguments);  
            }
            
            /* I.B. Uncacheable actions
            setCurrentPanel: function setCurrentPanel(panelKey, panelStackKey, selectorKeyContext) {
            },
            setCurrentDocLayout: function setCurrentDocLayout (layoutKey) {
            },
            
            requestNewPanel: function requestNewPanel(panelKey, panelStackKey, selectorKeyContext, dirtyKeys, callback) {
            },
            
            applyGraphSelectorAction: function applyGraphSelectorAction(selectorKeyContext, targetList, sliceID, x, y, callback) {
            },
                        
            setDocSelectorExpression: function setDocSelectorExpression(unitKeyContext, controlKey, objectId, objectType, expressionFunction, expressionFunctionType, includeClause, expressionConstants, dataType, callback) {
            },
            
            setDocSelectorInclude: function setDocSelectorInclude(controlKey, includeClause, callback) {
            },
            
            setQuickSwitchViewMode: function setQuickSwitchViewMode (gridKeyContext, displayMode) {
            },
            
            setRWUnitProperties: function setRWUnitProperties(key, props, formatType, returnData, callback) {
            },
            
            sort: function sort(params, callback) {
            },
            
            pivot: function pivot(params, callback) {
            },
            */
        }
    );
})();
