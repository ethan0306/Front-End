(function() {
    
    mstrmojo.requiresCls("mstrmojo.StringBuffer",
                         "mstrmojo.hash");
    
    var CLASS_NAME = 'AndroidServerTransport';
    
    /**
     * The Android server transport.
     * 
     * @type Object
     */
    mstrmojo.android.AndroidServerTransport = {
            
        /**
         * Makes a request to the Android Java shell.
         * 
         * @param {String} id The id of the {@link mstrmojo.ServerProxy} making the request.
         * @param {Object} request An object with properties defining this XHR request.
         * @param {Object} request.params An object with task parameters for this XHR request.
         * @param {String} request.taskURL The URL for accessing the server task servlet.
         */
        serverRequest: function serverRequest(id, requestId, request) {
            // Convert parameters hash to URL string.
            var url = new mstrmojo.StringBuffer(),
                urlStr, rqst;
            mstrmojo.hash.forEach(request.params, function (v, n) {
                url.append(n + '=' + encodeURIComponent(v));
            });
            urlStr = request.taskURL + '?' + url.toString('&');
            request.params.hostUrl = request.taskURL;
            if ( mstrApp.useBinaryFormat) {
                rqst = JSON.stringify({
                    params: request.params,
                    url: urlStr
                });
            } else {
                rqst = urlStr;
            }
            
            $MAPF(true, CLASS_NAME, 'transportRequest');
            
            // Submit request to Android java class bound into the JavaScript scope.
            mstrMobileTransport.serverRequest(id, requestId, rqst, 'response', 'progress');
        },
        
        /**
         * Cancels a request.
         * 
         * @param {String} requestId The id of the request to cancel.
         * 
         * @returns Boolean True if the request was successfully canceled.
         */
        cancelRequest: function cancelRequest(requestId) {
            $MAPF(false, CLASS_NAME, 'transportRequest');
            
            return mstrMobileTransport.cancelRequest(requestId);
        }
    };
    
})();