/**
 * DebugUtils.js 
 * Copyright 2010-2011 MicroStrategy Incorporated. All rights reserved.
 *
 * @fileoverview <p>Collection of functions to aid debugging of Mojo applications.</p>
 * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
 * @version 1.0
 *
 * Note: This file must be included after mstrmojo.js so it can augment it.
 */

(function () {

    /** 
     * wliao 05/26/2001:  Use var instead of const as IE does not support const.
     * We should put it back after IE supports const keyword.
     */
    /*
    const MAX_DEPTH = 14;
    const SPACES = "                              ";
    const NL="\n";
    */
    var MAX_DEPTH = 14;
    var SPACES = "                              ";
    var NL="\n";
    
    /**
     * Private function that determines whether supplied parameter references an array or not
     * @private
     * @param {Mixed} obj reference to test
     * @returns TRUE if reference is an Array object
     * @type Boolean
     */
    
    function _isArray( obj ) { return toString.call(obj) === "[object Array]"; }

    /**
     * converts an Array to string.  Items in the array that are complex types are expanded.
     * @private
     * @param {Array} a Array object to convert
     * @param {int} depth integer specifying the indentation depth for output
     * @returns JSON representation of the Array and its contents.
     * @type String
     */
    
    function _ArrayToString(a,depth,params,nl) {
        var d = depth || 1;
        var spc = SPACES.substr(0,d);
        var output = ["undefined"];

        nl = nl || NL;
        if ( a ) {
            output = ["["];
            for( var i=0; i < a.length; i++) {
                if (i != 0) {
                    output.push("," + nl);
                } else {
                    output.push(nl);
                }
                output.push(spc + _objToString(a[i], d+1,params));
            }
            output.push(spc + spc + nl + "]");
        }            
        return output.join('');
    }

    /**
     * Converts a JavaScript object/hash to a string with each properties value expanded [as deep as params.maxDepth]
     * @private
     * @param {Object} h hash to convert
     * @returns JSON-like representation of the hash
     * @type String
     */
    
     function _HashToString(h,depth,params,nl) {
         var    d = depth || 1,
                spc = SPACES.substr(0,d),
                i = 0,
                output = ["undefined"],
                ik = params.ignoreKeys;
                
         nl = nl || NL;

         if ( h ) {
             output = ["{"+nl];

             for (var key in h) {                        
                 
                 // if we are ignoring functions, then move to the next key
                 if ( params.ignoreFuncs && typeof h[key]==="function") {
                     continue;
                     
                 // if key is in the list of keys to ignore then do so
                 } else if ( ik && ik[key] ) {
                     continue;
                 }

                 if ( i == 0) {
                     output.push(nl);
                 } else {
                     output.push(","+nl);
                 }
                 
                 output.push(spc + "\"" + key + "\"" + ": ");

                // avoid dumping common global objects to avoid loops and excessive output
                 if ( key=="window"||key=="document"||key=="mstrmojo"||key=="global") {
                     if ( h[key]=="null") {
                         output.push( "null");
                     } else {
                         output.push("[" + key + "]");
                     }
                 } else if ( /.*Sibling*/.test(key)) {
                     if ( h[key]=="null") {
                         output.push( "null");
                     } else {
                         output.push("[" + typeof h[key] + "]");
                     }
                 } else if ( key=="target") {
                     if ( h[key]=="null") {
                         output.push( "null");
                     } else {
                         output.push("[id="+h[key].id+"]");
                     }
                 } else {
                     output.push(_objToString(h[key],d+1,params));                
                 }                
                 i++;
             }
             output.push(spc + spc + nl + "}");
         }
         return output.join('');
     }

    /**
     * Converts TouchList object to string
     * @private
     * @param {TouchList} touchList object containing list of Touch objects, usually from one of the Touch DOM events
     * @returns JSON-like representation of list
     * @type String
     */
    
    function _TouchListToString(touchList,depth,params,nl) {
        var numTouches = touchList.length;
        var d = depth || 1;
        var spc = SPACES.substr(0,d);
        var output = ["["];
        nl = nl || NL;

        for( var k = 0; k < numTouches;k++) {
            if ( k==0)
                output.push(" ");
            else
                output.push(", ");

            output.push(_objToString(touchList[k], d+1, params, " " ));
        } 
        output.push("]");
        return output.join('');
    }    
    
    /**
     * Converts TouchEvent to string
     * @private
     * @param {TouchEvent} evt TouchEvent to convert
     * @returns JSON-like representation of event
     * @type String
     */
    
    function _touchEventToString(evt,depth,params,nl) {
        var d = depth || 1;
        var spc = SPACES.substr(0,d);
        var output = [];
        
        nl = nl || NL;
        output.push(spc + "{" + nl);
        output.push(spc + "changedTouches: ");
        output.push(_TouchListToString(evt.changedTouches,d+1,params) + "," + nl);
        output.push(spc + "touches: ");
        output.push(_TouchListToString(evt.touches,d+1,params) + "," + nl);
        output.push(spc + "targetTouches: ");
        output.push(_TouchListToString(evt.targetTouches,d+1,params) + nl);
        output.push(spc + "}" + nl);
        return output.join('');
    };

    /**
     * Converts supplied 'object' to a string. Arrays and objects are expanded up to MAX_DEPTH iterations.  Functions, undefined, and null are also handled.
     * To prevent output overload, all HTMLElements are not expanded.  'window' and 'document' are likewise not expanded.
     * @param {Mixed} o 'object' to convert to string
     * @returns JSON-like representation of the object
     * @type String|Object|Array|Boolean|Number
     */
    
     function _objToString( o, depth, params, nl ) {
        var d = depth || 1;
        var spc = (nl==" ") ? "" : SPACES.substr(0,d);
        var i = 0;
        var output = [];
        nl = nl || NL;

        if ( o === null ) {
            output.push("null");
        } else if ( typeof o === "undefined" ) {
            output.push("undefined");
        } else if ( _isArray(o)) { 
            output.push(_ArrayToString(o,d+1,params));
        } else if ( typeof o === "function" ) {
            output.push("function");
        } else if ( o instanceof HTMLElement ) {
            output.push("[HTMLElement, id="+o.id+"]");
        } else if ( o instanceof TouchEvent ) {
            output.push(_touchEventToString(o,d+1,params));
        } else {
            if ( o==window || o==document ) {
                output.push(o.toString());
            } else if ( typeof o === "object" ) {            
                if (d <= params.maxDepth ) {
                    output.push(_HashToString(o, d+1,params,nl ));
                } else {
                    // we've gone too deep so just output the object's type
                    output.push("["+(typeof o)+"]");
                }
            } else if (typeof o === "string") {
                // if the object is a String, escape it and enclose in quotes
                output.push("\"" + o.replace(/"/g,"\\\"" ) + "\"");
            } else {
                output.push(o.toString());
            }
        }                       
        return output.join('');
    };


	mstrmojo.debug.utils = {

        /**
         * Converts supplied 'object' to a string. Arrays and objects are expanded.  Functions, undefined, and null are also handled.
         * To prevent output overload, all HTMLElements are not expanded.  'window' and 'document' are likewise not expanded.
         * @param {Mixed} o 'object' to convert to string
         * @returns JSON-like representation of the object
         * @type String
         */

         objectToString: function objectToString( o, params ) {
             var depth=0;
             return _objToString(o,depth,params);
         },

	    /**
	     * Converts TouchEvent to string
	     * @param {Object} evt TouchEvent
	     * @returns JSON-like representation of event
         * @type String
	     */
	    touchEventToString: function touchEventToString(evt) {
	        var depth=0;
	        return _objToString(evt,depth); 
	    }	    
	};
	
	/**
	 * outputs JSON-like representation of specified object.  Unlike JSON.stringify(), this method attempts to avoid 
	 * excessive output and loops by abbreviating common global variables like document, window, mstrmojo, etc.
	 * 
	 * User may pass in parameters to control the output including:
	 *
	 * maxDepth:    controls how far into nested objects the output will go.  Default is 14 levels.
	 * ignoreFuncs: when TRUE, the debug output will not contain any functions. Default is FALSE
	 * ignoreKeys:  a hash containing a list of object properties to ignore (at all nesting levels).  E.g. to ignore
	 *              properties named "controller" you would pass  { ignoreKeys: { "controller" : true } } as the
	 *              params. 
	 *
	 * Note that user supplied parameters are applied over top of the defaults.
	 */
	 
    mstrmojo.dbg_obj = function dbg_obj(obj,userParams) {
        var params = { 
            ignoreFuncs: false,
            
            // hash of keys to ignore, value is ignored
            ignoreKeys: {},
            maxDepth: MAX_DEPTH
        };
        userParams = userParams || {};
        for (var n in userParams) {
            params[n] = userParams[n];
        }
        mstrmojo.dbg(mstrmojo.debug.utils.objectToString(obj, params ));
    };

    mstrmojo.dbg_touchEvent = function dbg_touchEvent(obj) {
        mstrmojo.dbg(mstrmojo.debug.utils.touchEventToString(obj));
    };
    
})();

