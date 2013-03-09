(function() {
    
    mstrmojo.requiresCls("mstrmojo.hash",
                         "mstrmojo.func",
                         "mstrmojo.Obj");

    var $HASH = mstrmojo.hash;
    
    /**
     * Counter for ensuring unique request submission IDs.
     *
     * @type Integer
     * @static
     * @private
     */
    var cnt = 0;
    
    /**
     * Queue for requests.
     *
     * @type Object[]
     * @static
     * @private
     */
    var requestQueue = [];

    /**
     * Collection of currently processing graph request keys.
     *
             * @type Object
     * @static
     */
    var graphRequests = {};

    /**
     * Flag to indicate that all requests should be held until graphs have processed.
     *
     * @type boolean
     * @default false
     * @static
     */
    var holdForGraphs = false;

    /**
     * Method for submitting requests.
     *
     * @param {Object} request The request to submit.
     *
     * @private
     */
    function handleSubmission(request) {
        var callback = request.callback;

        // Do we have a submission handler?
        if (callback.submission) {
            // Call it.
            callback.submission();
        }

        // Submit the request.
        this.submitRequest(request);
    }

    /**
     * Checks queue for requests and submits next request (if found).
     *
     * @private
     */
    function submitNextInQueue() {
        // Are there any requests in the queue?
    	// #532349. Do not submit the request if we're still processing graph requests.
    	// the last added graph will submit the holding request.
        if (requestQueue.length && !holdForGraphs) {
            // Shift the first request out of the queue and submit.
            handleSubmission.call(this, requestQueue.shift());
        }
    }

    /**
     * Proxy object to handle server requests.
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.ServerProxy = mstrmojo.declare(
        mstrmojo.Obj,

        null,

        /**
         * @lends mstrmojo.ServerProxy.prototype
         */
        {
            scriptClass: 'mstrmojo.ServerProxy',

            /**
             * The server transport mechanism.
             *
             * @type mstrmojo.Obj
             */
            transport: null,

            cnt: 0, 

            /**
             * Assembles the request and submits it to the server transport mechanism.
             * 
             * @param {Object} callback An object containing functions to be called as the request process proceeds.
             * @param {Function} callback.submission A function called as the server request is initiated.
             * @param {Function} callback.success A function called when the server request completes successfully.
             * @param {Function} callback.failure A function called if the server request fails for any reason.
             * @param {Function} callback.complete A function called when the server request is completed, regardless of status.
             * @param {Object} params An object containing the task parameters for this request.
             * @param {Boolean} [override=false] TRUE if all preceding server requests should be canceled in favor of this one.
             * @param {Object} [config] An optional object containing configuration parameters for the server transport. 
             */
            request: function request(callback, params, override, config) {
                // If override is true then kill any outstanding requests.
                if (override) {
                    this.cancelRequests();
                }
            
                var proxyId = this.id,
                    transport = this.transport,
                    requestId = mstrmojo.now() + params.taskId + cnt++;
                                        
                // Wrap callback methods.
                callback = mstrmojo.func.wrapMethods(callback, {
                    // Add default canceled handler.
                    canceled: function (id) {
                        // Call complete, passing TRUE to indicate that the request was canceled.
                        callback.complete(true);
                        
                        // Cancel server request.
                        return transport.cancelRequest(id);
                    }, 
                    
                    complete: function(id) {
                        // Delete request.
                        mstrmojo.all[proxyId].deleteRequest(id);
                    }
                });
                
                // Determine holding status and then create new request object.
                // DJH: don't hold the request if it is a login task. On Android we automatically issue
                //      login tasks if the user is not currently logged into the project.
                var existingRequests = !$HASH.isEmpty(this._requests),
                    newRequest = this.createRequest(requestId, callback, params, config),
                    holdRequests = (holdForGraphs || existingRequests) && !newRequest.isLogin;

                // Should we hold requests?
                if (holdRequests) {
                    // YES, add this request to the queue.
                    requestQueue.push(newRequest);
                } else {
                    // NO, submit this request.
                    handleSubmission.call(this, newRequest);
                }
            },
            
            /**
             * <p>Creates a request and stores it in the _requests collection.</p>
             * 
             * <p>Subclasses should override this method to add custom data to the request object.
             * 
             * @param {String} requestId The id for the new request.
             * @param {Object} callback The callback object as submitted in {@link mstrmojo.ServerProxy.request}.
             * @param {Object} params An object containing the task parameters for this request.
             * 
             * @returns Object Newly created request object. 
             */
            createRequest: function createRequest(requestId, callback, params, config) {
                var reqsCollection = this._requests;
                
                // Is this the first request?
                if (!reqsCollection) {
                    // Initial the requests collection.
                    reqsCollection = this._requests = {};
                }
                
                // Store request.
                var request = reqsCollection[requestId] = {
                    id: requestId,
                    callback: callback,
                    params: params,
                    config: config
                };
                
                // Return request.
                return request;
            },
            
            /**
             * <p>Submits the request via the transport mechanism indicated in {@link mstrmojo.ServerProxy.transport}.</p>
             * 
             * <p>Subclasses will override this method to add any custom transport handling.</p>
             * 
             * @param {Object} request The request object as created in {@link mstrmojo.ServerProxy.createRequest}.
             */
            submitRequest: function submitRequest(request) {
                this.transport.serverRequest(this.id, request.id, request);                
            },
            
            /**
             * Cancels all outstanding requests.
             * 
             */
            cancelRequests: function cancelRequests() {
                var didCancel = false;
                
                // Iterate current requests and call their complete callback handler.
                $HASH.forEach(this._requests, function (request) {
                    // Has the request NOT already gotten a response?
                	if ( typeof request.gotResponse === "undefined" ) {
                        // Cancel the request, caching the returned cancel status.
                        didCancel |= request.callback.canceled(request.id);
            	    }
                });

                // Reset requests collection.
                this._requests = {};
                
                // Reset request queue.
                requestQueue = [];

                // Return cancel status.
                return didCancel;
            },
            
            /**
             * Receives the results from making the server request.
             * 
             * @param {String} requestId The id of the request results being returned.
             * @param {Boolean} status True if the request succeeded.
             * @param {Object} res The response from the server.
             */
            response: function response(requestId, status, res) {

                // Cease profiling the server request.
                $MAPF(false, "AndroidServerTransport", 'transportRequest');

                // Do we have a request for this ID?
                var request = this.getRequest(requestId);
                if (request) {
                    // Mark the response as handled.  This will prevent the response being cancelled if
                    // our success or failure callback attempts to fire off another request that has the override property set TRUE
                    request.gotResponse = true;

                    // Retrieve the callback from the request object and determine whether to call 'success' or 'failure' (based on status and presence of "mstrerr" property).
                    var callback = request.callback,
                        methodName = (status && !res.mstrerr) ? 'success' : 'failure';  // mstrerr means the request completed, but with an error on the server.

                    try {
                        // Does the callback have a handler for the result?  If not we ignore assuming the callback doesn't care about result.
                        if (callback[methodName]) {
                            // Call it.
                            callback[methodName](res);
                        }
                    } catch( e ) {
                        throw e;
                    } finally {
                        // Always call the 'complete' handler.
                        callback.complete(requestId);
                    }
                }

                // Submit next request in queue.
                submitNextInQueue.call(this);
            },

            /**
             * Deletes a request from the request collection.
             *
             * @param {String} requestId The ID of the request to be cancelled.
             */
            deleteRequest: function deleteRequest(requestId) {
                var requestCollection = this._requests;
                delete requestCollection[requestId];
            },
            
            /**
             * Returns a request from the request collection.
             * 
             * @param {String} requestId The ID of the request to be returned.
             */
            getRequest: function getRequest(requestId) {
                var requestCollection = this._requests;
                return requestCollection && requestCollection[requestId];
            },

            /**
             * Adds the graph key to the graph requests collection and holds all requests until collection is empty.
             *
             * @param {String} key The key of the graph currently processing.
             */
            addLoadingGraph: function addLoadingGraph(key) {
                // Store key in collection.
                graphRequests[key] = true;

                // Hold all requests.
                holdForGraphs = true;
            },

            /**
             * Adds the graph key from the graph requests collection and submits queued requests (if any).
             *
             * @param {String} key The key of the graph that is done processing.
             */
            removeLoadingGraph: function removeLoadingGraph(key) {
                // Remove key from collection.
                delete graphRequests[key];

                // Is collection empty?
                if ($HASH.isEmpty(graphRequests)) {
                    // Clear hold status.
                    holdForGraphs = false;

                    // Submit next request in queue.
                    submitNextInQueue.call(this);
                }
            }
        }
    );
}());