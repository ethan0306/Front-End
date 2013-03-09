(function () {
    
    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.hash",
                         "mstrmojo.XtabDataService",
                         "mstrmojo.ResSetCachedDataService");
    
    var delim = '\u001F';
    
    function addPbHeaders(res, ph ) {
        res.push({
            id: ph.id,
            tp: ph.tp,
            n:  ph.n
        });
        if ( ph.h ) {
            var child = ph.h[0];
            if ( child ) {
                addPbHeaders(res, child);
            }
        }
    }
    
    function getPbHeaders(me, data) {
        var res = [];
        if ( data.ph ) {
            addPbHeaders(res, data.ph);
        }
        me.pbHeaders = res;
        //alert("getPbHeaders " + res);
    }

    /* We will need it for incremental fetch
    function toPbUnits(me, pbKey) {
        var pbElements = pbKey.split(delim),
            pbUnits = [];
        for (var i = 0; i < pbElements.lenth; i++) {
            var ph = me.pbHeaders[i];
            pbUnits.push({
                id: ph.id, 
                tp: ph.tp,
                v:  pbElements[i]
            });
        }
        return pbUnits;
    }*/

    function toPbCacheKey(pbUnits) {
        res = [];
        for (var i = 0; i < pbUnits.length; i++) {
            var p = pbUnits[i];
            res.push('p:' + p.v );
        }
        return res;
    }

    /**
     * <p>Mobile report data service.</p>
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.XtabCachedDataService = mstrmojo.declare(
            mstrmojo.ResSetCachedDataService,

        null,

        /*
         * @lends mstrmojo.XtabCachedDataService.prototype
         */
        {
            scriptClass: "mstrmojo.XtabCachedDataService",
            
            init: function init(props){
                this._super(props);
                if ( ! this.delegate ) {
                    this.delegate = new mstrmojo.XtabDataService(props);
                }
            },
            
            getPageByTree: function getPageByTree(callback) {
                var me = this,
                    store = me.store,
                    cachedStr = store.getValue('pb', -1);
                if ( cachedStr  ) {
                    var cachedData = JSON.parse(cachedStr);
                    getPbHeaders(me, cachedData);
                    callback.success(cachedData);
                    return;
                        
                }
                this.delegate.getPageByTree({
                     success: function (res) {
                         var level = me.promptLevel || me.obLevel;
                         store.setValue(level, 'pb', JSON.stringify(res));
                         getPbHeaders(me, res);
                         callback.success(res);
                     },
                     
                     failure: callback.failure
                });
            },
            
            pageBy: function pageBy(pbUnits, callback) {
                var me = this,
                    store = me.store,
                    pbKeys = toPbCacheKey(pbUnits);
                var cachedStr = store.getData(me.pbLevel, pbKeys);
                if ( cachedStr  ) {
                    var cachedData = JSON.parse(cachedStr);
                    me.processData(cachedData, 'pb', false);
                    callback.success(cachedData);
                    return;
                        
                }
                var delegate = this.delegate;
                //A helper function containing page by code.
                function doPageBy() {
                    delegate.pageBy(pbUnits, {
                        success: function (res) {
                            me.processData(res, 'pb', true);
                            me.putData(store, me.pbLevel, pbKeys, res, false);
                            callback.success(res);
                        },
                        
                        failure: callback.failure
                   });
                }
                //If we have message ID we can simply do page by.
                //Otherwise we need to re-execute the report first.
                if ( delegate.msgId  ) {
                    doPageBy();
                } else {
                    var p = me.reexecParams(store);
                    delegate.execute(p, {
                        success: function (res) {
                            //Now we can do page by
                            doPageBy();
                        },
                        
                        failure: callback.failure
                    }, me.STATUS_ONLY_PARAM);
                }
            },
            
            drillGrid: function drillGrid(params, callback) {
                this.delegate.drillGrid(params, callback);
            },
            
            //==============================================================
            // Protected methods
            processData: function processData(data, command, fromServer) {
                this.resetLevelCount();
                var cets;
                if ( data.ghs && data.ghs.phs && data.ghs.phs && (cets = data.ghs.phs.cets) ) {
                    if ( cets.length > 0 ) {
                        this.pbLevel = this.levelCount++;
                        this.pbSize = cets.length;
                        this.cets = cets;
                    } else {
                        this.pbLevel = 0;
                    }
                }
            },
            
            addPbCacheKeys: function addPbCacheKeys(keys, data) {
                if ( this.pbLevel ) {
                    var cets = this.cets;
                    for (var i = 0; i < cets.length; i++) {
                        keys.push('p:' + cets[i].eid);
                    }
                }
            },
            
            addLayoutCacheKey: function addLayoutCacheKey(data) {
                return;
            },
            
            getObjectType: function getObjectType() {
                return 3;
            }
            
            /*,

             I.B. We cannot cache this stuff.
            
            sort: function sort(params, callback) {
                this._super(params, callback);
            },
            
            pivot: function pivot(params, callback) {
                this._super(params, callback);
            }
            */
        }
    );
})();
