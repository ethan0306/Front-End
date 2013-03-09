(function(){
    mstrmojo.requiresCls(
            "mstrmojo.base64",
            "mstrmojo.func",
            "mstrmojo.hash"
        );
    
    /**
     * <p> Decode the Base64-encoded response header whose value are in the following format: "=?UTF-8?B?EncodedText?=" </p>
     * 
     * @param {String} value The value of a response header.
     * @returns {String} The decoded response header.
     * 
     * @private
     */
    function decodeHeader(value){
        var rEncoded = /\=\?UTF-8\?B\?(.+?)\?\=/g;
        if (value && value.indexOf("=?UTF-8?B?") === 0){
            var decMsg = "", result;
            while ((result = rEncoded.exec(value)) !== null){
                decMsg += mstrmojo.base64.decode(result[1]);
            }
            return decMsg;
        }
        return value;
    }
    
    /**
     * <p>Encodes parameters for XHR transport.</p>
     * 
     * @param {Object} params A hash containing parameter names and values.
     * @returns {String} The encoded parameter string.
     * 
     * @type String
     * @returns A URL of encoded parameters.
     * 
     * @private
     */
    function encodeParams(params) {
        var x = -1;
        var url = [];
        if (params) {
            for (var p in params) {
                url[++x] = p + '=' + encodeURIComponent(params[p]);
            }
        }
        
        return url.join('&');
    }
    
    /**
     * <p>Builds up the url with parameters is method == 'GET'.</p>
     * 
     * @param {String} method The method for the xhr ('GET' or 'POST').
     * @param {String} baseUrl The url used for both GET and POST (excludes parameters in GET case).
     * @param {Object} [params] The parameters for this request. 
     * 
     * @type String
     * @returns The url built from the baseUrl and params.
     * 
     * @private 
     * 
     */
    function appendUrlParams(method, baseUrl, params) {
        if (method !== 'GET' || !params) {
            return baseUrl;
        }
    
        return baseUrl + '?' + encodeParams(params);
    }
    
    /**
     * <p>Opens and sends the xhr.</p>
     * 
     * @param {XmlHttpRequest} xhr The xhr to use for this request.
     * @param {String} method The method for the xhr ('GET' or 'POST').
     * @param {String} baseUrl The url used for both GET and POST (excludes parameters in GET case).
     * @param {Object} params The parameters for this request.
     * @param {Boolean} [isTask=false] If true, MSTR Task-specific default params will be automatically included in the request.
     * @private
     */
    function sendXhr(xhr, method, baseUrl, params ) {
        // Make sure it's uppercase for comparisons.
        method = method.toUpperCase();
        var app = mstrApp;
        	m = null;
        
    	if (typeof(microstrategy)!='undefined' && microstrategy){
    		m = microstrategy;
    	}
    	
    	if(mstrmojo){
    		var validateRandNum = mstrmojo.getValidateRandNum();
            if(validateRandNum){
            	params.validateRandNum = mstrmojo.getValidateRandNum();
            }
    	}
        	
                // Set default values.
        if (this.isTask) {                
            params.taskContentType = params.taskContentType || 'json';
            params.taskEnv = params.taskEnv || 'xhr';
            params.xts = new Date().getTime();
            baseUrl = baseUrl || mstrConfig.taskURL;
        }            
        // check sessionState
        if (params && !params.sessionState && app && app.sessionState){
            params.sessionState = app.sessionState;
        }
        //persisted task params
        var ptp = app.persistTaskParams || m&&m.persistParams; 
        if ( ptp) {
            mstrmojo.requiresCls("mstrmojo.hash");
            mstrmojo.hash.copy(ptp, params); 
        }
        
        xhr.open(method, appendUrlParams(method, baseUrl, params), this.async );
        if (method !== 'POST') {
        	params = null;
        } else {
            params = encodeParams(params);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }
        
        xhr.send(params);
        
        if ( this.async === false ) {
            xhr.onreadystatechange();
        }   
    }
    
    /**
     * <p>Creates an XHR object.</p>
     * 
     * @type XMLHttpRequest
     * @returns An instance of the XMHttpRequest object.
     * 
     * @private
     */
    function createXhr() {
        var methods = [
            function() { return new XMLHttpRequest(); },
            function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
            function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
        ];
        
        for (var i = 0, cnt = methods.length; i < cnt; i++) {
            var xhr;
            try {
                xhr = methods[i]();
            }
            catch (e) {
                continue;
            }

            // Success, replace this method with appropriate method.
            createXhr = methods[i];
            return xhr;
        }
        
        // Failed, throw error.
        throw new Error('mstrmojo.SimpleXHR: Could not create an XHR object.');
    }
    
    /**
     * Evals the XHR response, swallowing any errors that occur.
     * 
     * @param {Object} rt The XHR.responseText.
     * 
     * @private
     */
    function evalResponse(rt) {
        var _rtn = null;
        
        try {
            _rtn = eval('(' + rt + ')');
        } catch (ex) { 
            _rtn = rt && mstrmojo.string.trim(rt);
        }   
        
        return _rtn;
    }
    /**
     * Error codes for disconnected session.
     * 
     * @private
     * @ignore
     */
    var MSI_SERVER_NAME_NOT_INITIALIZED = 0x800438F3,  // Server Name Not initialized
        MSI_INVALID_SESSION_ID = 0x800438F4,           // Session ID invalid
        E_MSI_USERMGR_USER_NOTFOUND = 0x800430A5,      // UserLogin expired
        E_MSI_CONNECT_FAILED = 0x80043705;
        
    /**
     * Check response code to see whether the xhr error because of disconnected session.
     * 
     * @private
     * @ignore
     */
    function isSessionExpiredError(res){
        var c = res && res.getResponseHeader('X-MSTR-TaskErrorCode');
            c = (c < 0) ? (0x100000000 + parseInt(c, 10)) : c;    // c from task is a negative number, we need to recover it into positive number
            switch (c){
            case MSI_SERVER_NAME_NOT_INITIALIZED:
            case MSI_INVALID_SESSION_ID:
            case E_MSI_USERMGR_USER_NOTFOUND:
            case E_MSI_CONNECT_FAILED:
                    return true;
            }
            return false;
    }
    
    function xhrSupportsProgress(xhr) {
        return !! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
    }
    
    
    /**
     * A simple XHR.
     * 
     * @class
     */
    mstrmojo.SimpleXHR = mstrmojo.declare(
        // superclass
        null,

        // mixins
        null,
                
        /**
         * @lends mstrmojo.SimpleXHR.prototype
         */
        {
            scriptClass: "mstrmojo.SimpleXHR",
                
            /**
             * If true, this object's requests are treated as requests to a MicroStrategy Web Task, and
             * therefore Task-specific default parameters are automatically included in each request.
             *
             * @type Boolean
             */
            isTask: true,

            /**
             * If true, the XHR will be sent asynchronously
             *
             * @type Boolean
             */
            async: true,
            
            init: function init(props) {            
                // Apply the given properties to this instance.
                mstrmojo.hash.copy(props, this);
            },            

            onreadystatechange: function onreadystatechange(xhr,callback) {
                // ignore all state changes until we see a 4
                if (xhr.readyState !== 4) {
                    return;
                }
                // we expect the callback parameter to be a hash of callback functions for success, failure, etc.                    
                if (typeof callback !== "object" ) {
                    return;                    
                }

                try {
                    // djh 2010/06/30 added check for 304 error code to handle cached files that have not changed.
                    if ((xhr.status === 200) || (xhr.status === 304)) {
                        
                        // evaluate the response from the server in the hopes that it returned us JSON.  However, it may not.
                        // We can receive text, HTML, XML, or <empty string> here as well.
                        this.response = callback.textResponse ? xhr.responseText : evalResponse(xhr.responseText);
            
                        // if we got a response then pass it back to the success() callback.  It is this function's responsibility to
                        // determine if the repsonse data received is value for the request made of the server.
                        if (typeof callback.success === "function") {
                            // got data back from the server that evaluated w/o errors; call the success callback
                            callback.success(this.response);
                                        
                        }
                    } else {
            
                        if (xhr.status == 0) {
                            // user or page unload canceled the request
                        } else {
                            // need to check session expiration error
                            var app = mstrApp,
                            sessionExp = app && app.onSessionExpired;
            
                            if (sessionExp && isSessionExpiredError(xhr)) {
                                sessionExp();
                            } else {
                                var _orig = xhr.getResponseHeader;
                                xhr.getResponseHeader = function(name) {
                                    return decodeHeader(_orig.apply ? _orig.apply(xhr, [name]) : _orig(name));
                                };
            
                                // since we failed to get the data, call the failure callback
                                if (typeof callback.failure == "function") {
                                    callback.failure(xhr);
                                }
                            }
                        }
                    }
                } catch(ex) {
                    mstrmojo.err(ex);
                } finally {
                    // no matter what, call the complete callback
                    if (typeof callback.complete === "function") {
                        callback.complete();
                    }
                }

            },

            /**
             * <p>Aborts an XHR request in progress.</p>
             * @returns TRUE if xhr request was canceled
             */
            cancel: function(){
                var didCancel = false;
                    var xhr = this.xhr;
                    if (xhr) {
                        delete xhr.onreadystatechange;
                        // assign it to null would cause type mismatch error in IE.
                        // xhr.onreadystatechange = null;
                        xhr.isAborted = true;//for some browsers, the onreadystatechange is still called, so we need to use this workaround.
                        
                        if ( xhr.readyState < 4 ) {
                            xhr.abort();
                            didCancel = true;
                        }
                        this.xhr = null;
                    }
                return didCancel;
            },

            /**
             * <p>Initiates an XHR request.</p>
             * 
             * @param {String} method The method to use, i.e. 'GET' or 'POST'.
             * @param {String} baseUrl The base URL of the web server page to hit with the XHR request.
             * @param {Object} callback The callback interface
             * @param {Function} callback.success The Function to call when the XHR request succeeds.
             * @param {Function} callback.failure The Function to call when the XHR request fails.
             * @param {Object} params A hash of parameter names/values.
             * @param {String} webSvrUrl  Webserver url if the call is targeted to another web server other than the one hosting the app.
             * @param {Boolean} useResFeed if use resourceFeed to access webSrvUrl
             * @param {Object} webSrvParams Params for webSvrUrl
             */
            request: function request(method, baseUrl, callback, params, webSvrUrl, useResFeed, webSrvParams) {
                // If webSvrUrl is presented, it means this is a cross web server request.
                // Then it will be delegated to mstrmojo.jsonp.request.
                if (webSvrUrl) {
                    if(useResFeed === true){
                        if(!params) { params = {};}
                        params.srcURL = appendUrlParams('GET', webSvrUrl, webSrvParams);
                        this.request(method, baseUrl, callback, params);
                    } else {
                        mstrmojo.jsonp.request(webSvrUrl, params, callback);
                    }
                }else{
                    var xhr = createXhr();
                    xhr.onreadystatechange = function(me,x,c) {
                        return function() {
                            me.onreadystatechange.call(me,x,c);
                        };
                    }(this,xhr,callback);
                
                    // if the xhr supports it, hook up the progress callback if we have one
                    if (xhrSupportsProgress(xhr) && callback.progress ) {
                        xhr.onprogress = function(me,x,c) {
                            return function(evt){
                                c.progress.call(me,evt);
                            };
                        }(this,xhr,callback);
                    }
                    this.xhr = xhr;
                                                            
                    sendXhr.call( this, xhr, method, baseUrl, params );
                }
            }
        }
    );
    
    /**
     * An XHR that queues requests.
     * 
     * @class
     * @extends mstrmojo.SimpleXHR
     */
    mstrmojo.QueuedXHR = mstrmojo.declare(
        // superclass
        mstrmojo.SimpleXHR,
        
        // mixins,
        null,

        /**
         * @lends mstrmojo.QueuedXHR.prototype
         */
        {
            scriptClass: "mstrmojo.QueuedXHR",
            
            /**
             * The request queue.
             * 
             * @type Object[]
             * @private
             */
            queue: null,
            
            /**
             * Indicates whether a request is currently in progress.
             * 
             * @type Boolean
             * @private
             */
            requestInProgress: false,
            
            /**
             * The number of seconds to delay between requests.
             * 
             * @type Integer
             * @private
             */
            retryDelay: 1,
            
            /**
             * The request cache, the task with same parameters can hit this cache
             * 
             * @type Object[]
             * @private
             */
            lookup: null,
            
            /**
             * <p>Override of super that aborts an XHR request in progress and purges queue of any outstanding requests</p>
             */
            cancel: function(){
                        // cancel any request that's actually processing ASAP so it doesn't complete and fire off any queued requests
                        var didCancel = this._super();

                        // now empty the queue of any requests we haven't processed yet firing the complete() callback for each one
                    while( this.queue.length) {
                        var x = this.queue.pop();
                        var cb = x.callback;
                    if (cb && cb.complete) {
                        cb.complete();
                    }
                    }
                        this.queue = [];
                        
                        // reset our busy flag
                this.requestInProgress--;
                
                return didCancel;
            },

            /**
             * Constructor. Initializes the queue to an empty array.
             */
            init: function init(){
                this.queue = [];
                this.lookup = [];
            },
            
            /**
             * <p>Initiates an XHR request.</p>
             * 
             * @param {String} method The method to use, i.e. 'GET' or 'POST'.
             * @param {String} baseUrl The base URL of the web server page to hit with the XHR request.
             * @param {Object} [callback] An optional callback interface
             * @param {Function} [callback.success] An optional Function to call when the XHR request succeeds.
             * @param {Function} [callback.failure] An optional Function to call when the XHR request fails.
             * @param {Function} [callback.complete] An optional Function to call when the XHR request is complete (regardless of status).
             * @param {Object} params A hash of parameter names/values.
             * @param {Boolean} override Indicates that any in progress requests should be cancelled.
             * @param {String} webSvrUrl  Webserver url if the call is targeted to another web server other than the one hosting the app.
             * @param {Boolean} useResFeed if use resourceFeed to access webSrvUrl
             * @param {Object} webSrvParams Params for webSvrUrl
             * @param (Boolean) indicate whether to cache the response of the request into local memory
            
             */
            request: function request(method, baseUrl, callback, params, override, webSvrUrl, useResFeed, webSrvParams, useCache) {
                // If webSvrUrl is presented, it means this is a cross web server request.
                // Then it will be delegated to mstrmojo.jsonp.request.
                if (webSvrUrl){
                    if(useResFeed === true){
                        if(!params) { params = {};}
                        params.srcURL = appendUrlParams('GET', webSvrUrl, webSrvParams);
                        this.request(method, baseUrl, callback, params);
                    } else {
                        mstrmojo.jsonp.request(webSvrUrl, params, callback);
                    }
                }else{
                    // if there's already a request processing and we're not to preempt it then queue the new request
                    if (this.requestInProgress && !override) {
                        this.queue.push({
                            method: method,
                            baseUrl: baseUrl,
                            callback: callback,
                            params: params
                        });
                    } else {
                        // either nothing is going on or we want to preempt any running/queued requests
                        
                        // if there is a request in progress then kill it any empty the queue
                        if (this.requestInProgress) {
                            this.cancel();
                        }
                    
                        this.requestInProgress++;

      
                        var lu = null, 
                            oriParams = null;
                        if (useCache) {
                            lu = this._searchForCacheRequest(params);
                            oriParams = mstrmojo.hash.copy(params); // because it may add some more parameters in later sendXHR method
                        }
                        
                        if (lu) {
                            // If find the cache, directly call the success callback with cached response data
                            try {
                                if (callback.success) {
                                    window.setTimeout(
                                        function(){
                                            callback.success(lu.res);
                                        },
                                        10
                                    );
                                    //callback.success(lu.res);
                                }
                            } catch (ex) {
                                mstrmojo.err(ex);
                            } finally {
                                if (callback.complete) {
                                    callback.complete();
                                }
                                this.advanceQueue();    
                            }
                        } else {
                        var xhr = this.xhr = createXhr();
                        
                        // wrap the complete callback with our own that will advance the queue
                        callback = mstrmojo.func.wrapMethods(callback, {
                            complete: function(ths){
                                        return function() {
                                                ths.advanceQueue.call(ths);
                                        };
                                }(this),
success: function(ths){
                                        return function() {


                                            // Cache the request with parameters and response into the lookup
                                            if (useCache) {
                                                ths.lookup.push({
                                                    params: oriParams,
                                                    res: ths.response
                                                });
                                            }
                                        };
                                }(this)
                        });
                                
                        xhr.onreadystatechange = function(me,x,c) { return function() { me.onreadystatechange.call(me,x,c); }; }(this,xhr,callback);
                            
                        // if the xhr supports it, hook up the progress callback if we have one
                        if (xhrSupportsProgress(xhr) && callback.progress ) {
                            xhr.onprogress = function(me,x,c) { return function(evt){ c.progress.call(me,evt); }; }(this,xhr,callback);
                        }
                                
                        sendXhr.call( this, xhr, method, baseUrl, params );
                    }
                }
                }
            }, 
            
            /**
             * Moves to the next request in the queue.
             * 
             * @private
             */
            advanceQueue: function advanceQueue() {
                    // nothing is processing right now
                this.requestInProgress--;                
                if (this.queue.length === 0) {
                    return;
                }
                var req = this.queue.shift();
                this.request(req.method, req.baseUrl, req.callback, req.params, true);
            },
            
            /**
             * Search from lookup table, see if there is a cahced request has the same parameters.
             * @param params
             * @private
             */
            _searchForCacheRequest: function _searchForCacheRequest(params) {
                for (var i in this.lookup) {
                    if (mstrmojo.hash.equals(params, this.lookup[i]['params'])) {
                        return this.lookup[i];
                    }
                }
                return null;
            }
            
        }
    );

    mstrmojo.xhr = new mstrmojo.QueuedXHR();
    
    /**
     * A Singleton class which is able to send HTTP requests to web server on the different domain.
     * The basic idea is dynamic script insertion. The content of the script is a piece of code that invokes
     * mstrmojo.jsonp.onsuccess or mstrmojo.jsonp.onfailure on the JSON data.
     * 
     * Usage: Previously, we used ResourceFeedController as the solution for cross web server request. And we
     * did this by calling mstrmojo.xhr.request with the parameter "webSvrUrl" that indicates the remote web server url.
     * Now, we are trying to introduce JSONP without changing this interface. So in the mstrmojo.xhr.request, we
     * check the existence of "webSvrUrl", if presented, it will delegate to mstrmojo.jsonp.request method.
     * 
     * TODO: We are not queueing the JSONP request now. Please be careful when dealing with multiple JSONP requests as it may cause racing conditions. 
     */
    mstrmojo.jsonp = {
            jsc: new Date().getTime(),

            /**
             * milli seconds to wait after the request is sent out.
             * @type Integer 
             */
            timeToWait: 20000,
            
            /**
             * <p>Send out a jsonp request</p> 
             * @param {String} url The target web server address
             * @param {Object} params A hash of parameter names/values
             * @param {Object} callback Object that contains three callback methods: success, failure, timeout(optional)
             */
            request: function(url, params, callback){
                var head = document.getElementsByTagName("head")[0] || document.documentElement,
                    jsonp = 'jsonp' + (this.jsc++), 
                    script = document.createElement("script");
                		
                params.jsonp = jsonp+"(@R@);"; //@R@ is the placeholder for the JSON object
                params.taskContentType = 'jsonp';
                params.taskEnv = 'jsonp';
                params.xts = new Date().getTime();
                
                //This function will be executed automatically when the script is loaded.
                window[jsonp] = function(response){
                	if (!response){ // request timeout
                		if (callback.timeout){
                			callback.timeout();
                		}
                	}else if (response.status === 200){ //request succeeded
                		callback.success(response.content);
                	}else{ //request failed
                		//As we reuse mstrmojo.xhr.request to send a JSONP request, we use getResponseHeader quite often
                        //in the xhr failure callback. It's better to have this method as well so that we don't need to 
                        //change the existing app code.
                		var res = {
                            	status: response.status,
                            	getResponseHeader: function(name){
            	                	switch (name){
            	                    case 'X-MSTR-TaskFailureMsg': return response.errorMsg;
            	                    case 'X-MSTR-TaskErrorCode': return response.errorCode;
            	                    }
                            	}
                            };
                        if (mstrApp.onSessionExpired && isSessionExpiredError(res)) {
                            mstrApp.onSessionExpired();
                        }else{
                        	callback.failure(res);
                        }
                	}
                	
                   	// Do some cleanup
                	if (window[jsonp]){
                		if (callback.complete){
                			callback.complete();
                		}
                		//delete the global variable
                		window[jsonp] = undefined;
                		try {
                			delete window[jsonp];
                		} catch(e) {}
                		
                		//remove the script node
                		head.removeChild(script);
                	}
                };
                
                head.insertBefore(script, head.firstChild);
                script.src = appendUrlParams("GET", url, params); // This will trigger a HTTP GET request to the target web server
                
                //If the script is not loaded or evaluated successfully, it will fail silently.
                //We need to handle this case by waiting for a reasonable amount of time(10s).
                setTimeout(function(){
                	window[jsonp] && window[jsonp]();
                }, this.timeToWait);
            }
        };
})();