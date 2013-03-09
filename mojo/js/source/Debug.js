/**
 * Debug.js 
 * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 *
 * @fileoverview <p>Collection of functions to aid debugging of Mojo applications.</p>
 * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
 * @version 1.0
 *
 * Note: This file must be included after mstrmojo.js so it can augment it.
 */
(function () {

	mstrmojo.debug = {
        /**
         * TRUE to disable caching of mobile data such as folder contents.
         * 
         * @type Boolean
         * @default false
         */
	    nocache: true,
	    
	    /**
	     * Returns the String representation of the stack trace.
	     */
	    getStackTrace: window.printStackTrace || undefined,
	    
	    /**
	     * Output debugging information from XHR request. Designed to be called from one or more of the 
	     * XHR callback functions: success(), failure(), or complete().
	     *
	     * @param {Integer} xhrStartTime The time (in milliseconds) that the XHR was started.
	     * @param {Object} xhrParams The parameters object that was used to configure the XHR.
	     * @param {Object} xhrResponse The response object that contains the XHR results.
	     */
	    debug_xhr: function debug_xhr (xhrStartTime, xhrParams, xhrResponse) {
	        xhrParams = xhrParams || {};
	        xhrResponse = xhrResponse || {};
	        
	        var details = [];
	        
	        // If a task is defined then output it's ID and any other relevant details
	        if (xhrParams.taskId) {
	            details.push('taskID=' + xhrParams.taskId);
	            switch(xhrParams.taskId) {
	                case 'iPhoneGetReportResults':
	                    details.push('msgId=' + xhrParams.messageID);
	                    break;
	                    
	                case 'reportExecute':
	                    details.push('reportID=' + xhrParams.reportID);
	                    if (xhrResponse.id) {
	                        details.push('msgID=' + xhrResponse.id);
	                    }
	                    break;
	            }
	        }
	
	        // output the debug msg    
	        mstrmojo.dbg_profile('xhr completed', xhrStartTime, details.join('\t'));
	    },

        /**
	     * Loads firebug lite debugger by injecting a <SCRIPT> element into the document (head or body)
	     */
	    	    
	    load_firebug: function( uri ) {
	        if ( typeof Firebug === "undefined" ) {
	            // bail if we don't have the URL need to load the debugger
                if ( (typeof uri === "undefined") || document.getElementById('FirebugLite')) return;
                // create a <SCRIPT> element to load firebug and add to the document
                e = document['createElement']('script');
                e.setAttribute('id', 'FirebugLite');
                e.setAttribute('src', uri + 'firebug-lite.js#startOpened');
                e.setAttribute('FirebugLite', '4');
                (document['getElementsByTagName']('head')[0] || document['getElementsByTagName']('body')[0]).appendChild(e);
	        } else {
	            // FireBug is already loaded, force it open
                Firebug.chrome.toggle(true /*forceOpen */);
            }
	    } 
	};
	
    mstrmojo.dbg = function dbg(s) {
        if (window.console) { 
            window.console.log(s);
        }
    };
    
    mstrmojo.dbg_profile = function dbg_profile(title, time, msg) {
        mstrmojo.dbg(title + new Array(Math.max(0, 25 - title.length)).join(' ') + 'time=' + (mstrmojo.now() - time) + 'ms\t' + (msg || ''));
    }; 
  
    mstrmojo.dbg_stack = function dbg_stack() { 
        mstrmojo.dbg(mstrmojo.debug.getStackTrace());
    };
  
    mstrmojo.dbg_xhr = function dbg_xhr(st,p,r) {
        mstrmojo.debug.debug_xhr(st,p,r);
    };
})();

