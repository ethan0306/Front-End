(function(){

    mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.QueuedXHR"
        );
    
    var _H = mstrmojo.hash;
    
    /**
     * Helper method creates a callback function to fire a method on an AjaxCall instance.
     * @param {mstrmojo.AjaxCall} me The AjaxCall instance being called back.
     * @param {String} n The AjaxCall method name being called back.
     * @private
     */
    function _cb(me, n){
        return function(){
            if (me[n]) {
                me[n]();
            }
        };
    }
    
    // ================ Cache ================================
    /**
     * Global cache for Ajax call response. It is used when the cacheLevel is "global".
     * Keyed by request parameters
     * @private
     * @ignore
     */
    var _cache = [];
    /** 
     * Returns the correct cache.
     */
    function __getCache(me){
        var cch;
        // create cache if not there
        switch (me.cacheLevel){
            case mstrmojo.AjaxCall.CACHELEVEL_LOCAL:
                if (me._cache == null){
                    me._cache = [];
                }
                cch = me._cache;
                break;
            default: 
                if (_cache == null) {
                    _cache = [];
                }
                cch = _cache;
                break;
        }
        return cch;
    }
    /**
     * retrieve cache for this ajax call
     */
    function __findCache(me) {
        var cch = __getCache(me);
        
        // search
        var _r = {cache: cch, idx: -1}, // return value
            params = me.params;         // params to search for
        // remove 'xts', which is a time stamp, can not be used in comparison. 
        if ('xts' in params) {
            delete params.xts;
        }
        for (var i = 0, len = cch.length; i < len; i ++){
            var c = cch[i];
            if (c && _H.equals(c.url, me.url) && _H.equals(c.params, params)){ // found the key
                _r.idx = i;
                break;
            }
        }
        return _r;
    }
    /**
     * Helper method to save response in cache
     */
    function _saveToCache(me) {
        var cch = __getCache(me),
            params = _H.copy(me.params);
        // remove 'xts', which is a time stamp, can not be used in comparison. 
        delete params.xts;
        // no found, need to save to cache
        cch.push({url: me.url, params: params, res:_H.copy(me.response)});
    }
    
    /** 
     * Helper method to search response in cache.
     * If matching response found, set it to response of current AjaxCall object, and return true.
     * If no matching response found, return false.
     */
    function _fetchCache(me) {
        var f = __findCache(me);
        if (f && f.idx >= 0){
            me.response = f.cache[f.idx].res;
            return true;
        }
        return false;
    }

    // ================ End of Cache ================================
    /**
     * <p>A reusable object for making ajax requests via a declarative interface.</p>
     *
     * <p>AjaxCall is essentially a wrapper for QueuedXHR with developer-friendly properties & methods for
     * configuring a request in a declarative manner.</p>
     *
     * @class
     * @extends mstrmojo.QueuedXHR
     */
    mstrmojo.AjaxCall = mstrmojo.declare(
        // superclass
        mstrmojo.QueuedXHR,
        // mixins
        null,
        /**
         * @lends mstrmojo.AjaxCall.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.AjaxCall",
            
            /**
             * HTTP method for this object's requests; either "GET" (default) or "POST".
             * @type String
             */
            method: "GET",
            
            /**
             * The base URL for the request, without any parameters.
             * @type String
             */
            url: "",
            
            /**
             * Optional hashtable of name-value pairs to be submitted as input parameters for this request.
             * @type Object
             */
            params: null,
            
            /**
             * Optional callback for a successful response.
             * @type Function
             */
            onsuccess: null,

            /**
             * Optional callback for an error response.
             * @type Function
             */
            onerr: null,
            
            /**
             * Optional callback for any response.  If an onsuccess/onerr callback is specified, the oncomplete callback is fired second.
             * @type Function
             */
            oncomplete: null,

            /**
             * Optional callback fired whenever the cancel method is called.
             * @type Function
             */
            oncancel: null,            
            
            /**
             * If true, the cache will be searched before submitting a request.
             * @type Boolean
             */
            readCache: false,
            
            /**
             * If true, the response will be written to a cache after a successful response.
             * @type Boolean
             */
            writeCache: false,

            /**
             * Indicates which cache is used by this instance. If "global", a single cache for all instances of AjaxCall
             * is used by this instance.  Otherwise, a local cache for just this instance only is used.
             * @type String
             */
            cacheLevel: "",
            /**
             * Local cache of responses. It is used when the cacheLevel is "local".
             * @private
             * @ignore
             */
            _cache: null, 
            
            /**
             * If true, calling send() while a prior request is still in progress will queue the new request; otherwise
             * the prior request is cancelled first.
             * @type Boolean
             */
            useQueue: false,
            
            /**
             * Constructor. Extends the inherited constructor in order to apply a given set a properties.
             * @param {Object} [props] Optional hash of properties to be applied to this instance.
             */
            init: function init(props){
                this._super(props);
                // Apply the given properties to this instance.
                _H.copy(props, this);
            },
            
            /**
             * Submits a request using this object's given property values.
             */
            send: function sn(){
                var me = this;
                // Look for a cache before calling request(). 
                if (this.readCache && _fetchCache(this)){
                    this.onsuccess();
                    return;
                }
                this.request(
                    this.method,
                    this.url,
                    {
                        success: function() {
                            // Write to cache on successful callback.
                            if (me.writeCache) {
                                _saveToCache(me);
                            }
                            if (me && me.onsuccess) {
                                me.onsuccess();
                            }
                        },
                        failure: _cb(me, 'onerr'),
                        complete: _cb(me, 'oncomplete')
                    },
                    this.params,
                    !this.useQueue
                );
            },
            
            /**
             * Cancels the current request in progress, if any.
             */
            cancel: function cl(){
                this._super();
                if (this.oncancel) {
                    this.oncancel();
                }
            }            
        });
    mstrmojo.AjaxCall.CACHELEVEL_GLOBAL = 'global';
    mstrmojo.AjaxCall.CACHELEVEL_LOCAL = 'local';
        
})();