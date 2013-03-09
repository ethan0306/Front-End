(function () {
    
    /**
     * A pool of xhr's used for supporting multiple, simultaneous requests.
     *
     * @private
     */
    var xhrPool = {};
    
    var CLASS_NAME = 'XHRServerTransport';
    
    /**
     * An XHR based server transport.
     * 
     * @type Object
     */
    mstrmojo.XHRServerTransport = {
            
        /**
         * Makes a request to the server via XHR.
         * 
         * @param {String} id The id of the {@link mstrmojo.Obj} making the request.
         * @param {Object} request An object with properties defining this XHR request.
         * @param {Object} request.params An object with task parameters for this XHR request.
         */
        serverRequest: function serverRequest(id, requestId, request) {
            // Get reference to proxy and create new XHR.
            var proxy = mstrmojo.all[id],
                xhr = xhrPool[requestId] = new mstrmojo.SimpleXHR(); 
            
            $MAPF(true, CLASS_NAME, 'transportRequest');
            
            // Make request to XHR.
            xhr.request(request.config.method || 'POST', mstrConfig.taskURL, {
                success: function (res) {
                    // Respond with a "true" status and the response from the XHR.
                    proxy.response(requestId, true, res);
                },
                
                failure: function (res) {
                    // Respond with a "false" status and an object containing the error code and message.
                    proxy.response(requestId, false, {
                        code: res.getResponseHeader('X-MSTR-TaskErrorCode'),
                        message: res.getResponseHeader('X-MSTR-TaskFailureMsg')
                    });
                },
                
                complete: function () {
                    // Remove this xhr from the pool.
                    delete xhrPool[requestId];
                }
            }, request.params);            
        },
        
        /**
         * Cancels a request.
         * 
         * @param {String} requestId The id of the request to cancel.
         * 
         * @returns Boolean True if the request was successfully canceled.
         */
        cancelRequest: function cancelRequest(requestId) {
            var xhr = xhrPool[requestId],
                didCancel = false;
            
            if (xhr) {
                didCancel = xhr.cancel();
                delete xhrPool[requestId];
            }
            
            //Close the transport request log.
            $MAPF(false, CLASS_NAME, 'transportRequest');
            
            return didCancel;
        }
    };
    
}());