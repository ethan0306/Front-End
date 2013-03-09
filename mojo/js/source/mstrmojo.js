/*!global self: false, window: false, console: false, ActiveXObject: false */

/**
 * @namespace The global namespace for all project mojo objects and classes.
 */
var mstrmojo = {

    
    /**
     * <p>Descriptor store. </p>
     * 
     * <p>This is a hash map keyed by descriptor key, and value is the localized string for the descriptor.</p>
     */
    descriptors: {},

    /**
     * <p>Information about MSTR metadata.</p>
     * @type Object
     */
    meta: {
        TP: "t",     // the key for a web object's type
        STP: "st"    // the key for a web object's sub-type
    },
    
    emptyFn: function() {},

    /**
     * <p>Get tick count in milliseconds</p>
     * @returns number of milliseconds since beginning of epoch
     * @type Integer
     */
    now: function now() {
        return new Date().getTime();
    },
            
    /**
     * <p>If true, indicates that the mstrmojo namespace spans multiple frames/windows.</p>
     *
     * @type Boolean
     */
    usesFrames: false
};

//packages declarations
mstrmojo.gmaps = {};

(function(){
    var $mojo = mstrmojo;

    /**
     * <p>Reference to the global context object, typically same as "window" in browsers, may be different
     * in other environments like Adobe AIR.</p>
     * @fieldOf mstrmojo
     * @type Object
     */
    $mojo.global = (function(){
        var f = function(){return this;};
        return f.call(null);
    })();

    /**
     * <p>Stubs to be overridden by debug.js augmentation.
     */
    $mojo.dbg = $mojo.emptyFn;
    $mojo.dbg_stack = $mojo.emptyFn;
    $mojo.dbg_xhr = $mojo.emptyFn;
    $mojo.dbg_profile = $mojo.emptyFn;


    /**
     * sub packages.
     */
    $mojo.prompt = {};
    $mojo.settings = {};
    $mojo.ui = {};
    $mojo.ACL = {};
    $mojo.storage = {};
    $mojo.utils = {};
    $mojo.maps = {};
    $mojo.graph = {};
    $mojo.IPA = {};
    $mojo.ME = {};
    $mojo.plugins = {};
    $mojo.gmaps = {};
    $mojo.DI = {};
    $mojo.QB = {};
    $mojo.WH = {};
    $mojo.Architect = {};

    // Android specific libraries.
    $mojo.android = {
        large: {},
        medium: {},
        selectors: {},
        inputControls: {}
    };
    
    // iPhone specific libraries.
    $mojo.iphone = {};
    
    // Windows Phone specific libraries.
    $mojo.winphone = {};    

    // MSTRWeb JUILS based code.
    $mojo.mstr = {};

    
    /**
     * <p>Alerts an error message to the user when errors are encountered.</p>
     * 
     * @param {HTMLError} e The error object.
     */
    $mojo.err = function err(e) {
        // Default message
        var s = e.name + ': "' + e.message + '"';
        
        if ($mojo.debug) {
            if ('fileName' in e) {
                s += ' at\n    ' + e.fileName;
            }
            if ('lineNumber' in e) {
                s += ': ' + e.lineNumber;
            } else if ('line' in e && 'sourceURL' in e) { //for webkit
                var a = e.sourceURL.split('/');
                s += '(' + a[a.length > 1 ? a.length - 1 : 0] + ':' + e.line + ')';
            }
        }

        // If console is available then output there as well.
        this.dbg(s);
 //   	this.dbg_stack();

        // Display to user.
        if ($mojo.Dialog) {
            $mojo.alert(e.message, null, e.name);
        } else {
        	window.alert(s);
        }
    };
    
    /**
     * Displays a simple confirm message using the window.confirm method.
     * 
     * @param {String} msg The message to display.
     * 
     * @returns True is use pressed Ok button.
     */
    $mojo.confirm = function confirm(msg) {
        return window.confirm(msg);
    };
    
    /**
     * Displays a simple message to the user with a single 'Ok' button.
     * 
     * @param {String} msg The message to display.
     */
    $mojo.alert = function alrt(msg, fn, title) {
        window.alert(msg);
    };

    /**
     * <p>Used to determine if the current browser can parse a function's body text.</p>
     * 
     * @private
     */
    var canParseFuncs = !!(/return true/.test(function(){
        return true;
    }));

    /**
     * <p>Similar to {@link mstrmojo.hash.copy} in that it copies all of the members of a given source hash to another given destination hash, except that
     * it does NOT overwrite existing Functions in the destination.</p>
     * 
     * <p>When there is a name collision between 2 functions, the destination receives a newly created wrapper function which
     * allows the overwriting function to call the pre-existing function with the reserved call "this._super()".</p>
     * 
     * @param {Object} src The source object whose properties/values should be copied.
     * @param {Object} [dest] An optional hash to receive the copied properties/values.  If this parameter is undefined, an empty hash will be used. 
     * 
     * @returns {Object} The modified destination hash.
     */
    $mojo.mixin = function mixin(src, dest) {
        if (src) {
            dest = dest || {};
            var funcCallsSuper = /this\.\_super/;
            
            var fnWrapMethod = function(/*Function*/ overwriting, /*Function*/ inher) {
                return function superwrap() {
                    var tmp = this._super;
                    this._super = inher;
                    var ret = overwriting.apply(this, arguments || []);
                    this._super = tmp;
                    return ret;
                };
            };
            
            // Optimization: temporarily remove the optional reserved "__onmixin__" property.
            var fnOnMixin = src.__onmixin__;
            if (fnOnMixin) {
                    delete src.__onmixin__;
            }
            
            for (var n in src) {
                // Are we overwriting a function with a function? And if so, does the
                // overwriting function call "this._super"?
                if ( (typeof(src[n]) == 'function') && (!canParseFuncs || funcCallsSuper.test(src[n])) ) {
                        // Yes, we are subclassing a method with a new method that uses the
                        // "this._super" reserved keyword call to invoke the inherited method.  To support
                        // the reserved keyword, create a wrapper function which encapsulates both the
                        // overwriting method and the inherited method.
                        // Do this even if there is no this._super defined, because the wrapper is
                        // needed to reset this._super back to null; otherwise this._super would get
                        // stuck pointing at the bottom of the inheritance chain, causing an infinite loop there.
                        // For example, suppose the mixin has a method M that checks: 
                        // "if (this._super) this._super()"
                        // If the base has no such method M, this._super is null.  So far so good. But now
                        // suppose second mixin is applied on top of the first, and the second mixin does
                        // have an overwriting method named M too, which calls "this._super()".
                        // A wrapper is made around the second M, setting this._super to the first M.
                        // Now after the first M is called, we must reset this._super to null, otherwise,
                        // the "if (this._super)" check in first M [see above] will return true, triggering
                        // an infinite loop!  So who will reset this._super to null when first M is called?
                        // Answer: the wrapper to the first M method, which we create here because even though
                        // first M has no super, its code still references this._super, and that's what matters.
                        dest[n] = fnWrapMethod(src[n], dest[n]);
                } else {
                        // We are not subclassing a method; just do a simple overwrite.
                        dest[n] = src[n];
                }
            }
            
            // Cleanup optimization.
            if (fnOnMixin) {
                src.__onmixin__ = fnOnMixin;
            }
        }
        return dest;
    };
})();

(function(){

    /** 
     * <p>The XMLHTTPRequest object used to load files. Instantiated on-demand.</p>
     * @private
     */
    var _xhr;
    
    /**
     * <p>Hash of FQCNs that are requested to load but fail.</p>
     *
     * <p>The hash is keyed by FQCN strings; each has value is a Boolean (true).</p>  
     */
    var _missing = {};
    
    var _G = mstrmojo.global,
        _app = _G.mstrApp || {},
        _jsRoot = _app.jsRoot || "../javascript/",
        _jsMojoRoot = _app.jsMojoRoot || "../javascript/mojo/js/source/",
        _isIE = !!document.all;     // Don't use mstrmojo.dom here. Avoid dependencies on utilities.

    /**
     * <p>Computes the relative path of the JavaScript file for the given FQCN.</p>
     *
     * <p>Examples:</p>
     * <ol>
     * <li>"Class1" is mapped to "<mstrApp.jsRoot>Class1.js"</li>
     * <li>"pkg.Class1" is mapped to "<mstrApp.jsRoot>pkg/Class1.js"</li>
     * <li>"mstrmojo.Class1" is mapped to "<mstrApp.jsMojoRoot>Class1.js"</li>
     * <li>"mstrmojo.pkg.Class1" is mapped to "<mstrApp.jsMojoRoot>pkg/Class1.js"</li>
     * </ol>
     * 
     * <p>If "mstrApp" is undefined, then the default roots are used:</p>
     * <ol>
     * <li>jsRoot = "../javascript/"</li>
     * <li>jsMojoRoot = "../javascript/mojo/js/source/"</li>
     * </ol>
     *
     * @param {String} fqcn The name of the class to be mapped to a file.
     * @returns {String} The file relative path + name.
     */
    function _fqcn2File(fqcn){
    	if (fqcn.match(/^mstrmojo\.plugins\./)) {
    		var pluginName = fqcn.substring(17, fqcn.indexOf(".", 17));
    		fqcn = '../plugins/' + pluginName + '/javascript/' + _jsMojoRoot + fqcn.replace("mstrmojo.plugins." + pluginName + '.', "").replace(/\./gm, '/');
    	} else if (fqcn.match(/^mstrmojo\./)) {
            fqcn = _jsMojoRoot + fqcn.replace("mstrmojo.", "").replace(/\./gm, '/');
        } else {
            fqcn = _jsRoot + fqcn.replace(/\./gm, '/');
        }
        return fqcn + '.js';
    }
    
    function _getXHR () {
            // Instantiate XMLHTTPRequest using browser-specific techniques.
            // For IE, use new ActiveXObject(); for Mozilla, new XMLHttpRequest().
            _xhr = self.XMLHttpRequest ? new XMLHttpRequest() : (self.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : null);
    }
    /**
     * <p>Loads contents of given file into a string using synchronous 
     * XMLHTTPRequest GET call.</p>
     *
     * @param {String} file The path + name of the file to load.
     * @returns {String} The file contents as a string, if successful; null otherwise.
     */
    function _syncGet(file) {
        var result = null;
        
        if (!_xhr) {
        	_getXHR();
        }
        if (_xhr) {
            try {
                // Do a synchronous GET call to fetch the file.
                _xhr.open("GET", file, false);
                _xhr.send(null);             
                // Retrieve responseText. If successful, status will be 200 (HTTP) or 0 (file://).
                result = _xhr.responseText || null;
            }
            catch(localerr) {}

            // Minor hack: For Mozilla, do an abort() afterwards to avoid errors.
            // TO DO: investigate why without abort() we get errors on subsequent calls here.
            if (!_isIE && _xhr.abort){
                _xhr.abort();
            }
        
        }
        return result; 
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

    function _syncXHR(method, baseUrl, params) {
        var result = null;
            
        // Make sure it's uppercase for comparisons.
        method = method.toUpperCase();
        if (!_xhr) {
        	_getXHR();
        }
        if (_xhr) {
        	try {
        		var config = mstrConfig,
                m = null;

        		if (typeof(microstrategy)!='undefined' && microstrategy) {
        			m = microstrategy;
        		}

	            // Set default values.
	            params.taskContentType = params.taskContentType || 'json';
	            params.taskEnv = 'xhr';
                params.xts = mstrmojo.now();
                
                if(mstrmojo){
	                var validateRandNum = mstrmojo.getValidateRandNum();
	                if(validateRandNum){
	                	params.validateRandNum = validateRandNum;
	                }
                }
	            
                //persisted task params
                var ptp = config && config.persistTaskParams || m && m.persistParams;
                if (ptp) {
                    mstrmojo.requiresCls("mstrmojo.hash");
                    mstrmojo.hash.copy(ptp, params); 
                }

                _xhr.open(method, appendUrlParams(method, baseUrl, params), false);

	            if (method !== 'POST') {
	                params = null;
	            } else {
	                params = encodeParams(params);
	                _xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	            }
	            
	            _xhr.send(params);
	            // Retrieve responseText. If successful, status will be 200 (HTTP) or 0 (file://).
	            result = _xhr.responseText || null;
            }
            catch(localerr) {
            	window.console.log(localerr);
            }
        }
        return result;
    }
    /**
     * <p>Loads a given javascript file path synchronously via XmlHttpRequest, then tests if load succeeded by
     * performing a null-check on a given expression.</p>
     * 
     * @param {String} file Path + name of the file to load (example: "/javascript/foo.js").
     * @param {String} [nullCheck] JavaScript expression for null-check after the file is loaded.
     * @returns {Boolean} true if the given file is loaded successfully and, optionally, if the given   
     * expression does not evaluate to null after the file is loaded; false otherwise.
     */
    function _jsGet(file, nullCheck){
        var js = _syncGet(file);
        if (js) {
            try {
                eval(js);

                return nullCheck ?
                        !!eval(nullCheck) :
                        true;
            }
            catch(localerr) {
                alert('JavaScript compile error:\n\nFile: ' + file + '\n\nError: ' + localerr.message);
            }
        }
        return false;
    }

    /**
     * <p>Loads script files for javascript objects.</p>
     * 
     * @class
     * @static
     */
    mstrmojo.loader =
    /**
     * @lends mstrmojo.loader#
     */
    {
        /**
         * <p>Hash of FQCNs that are successfully loaded.</p>
         *
         * <p>The hash is keyed by FQCN strings; each has value is a Boolean (true).</p>  
         */
        loaded: {
            mstrmojo: true, 
            "mstrmojo.loader": true
        },
        
        /**
         * <p>Determines if a given JavaScript class is currently loaded.</p>
         * 
         * <p>This method tries to evaluate the FQCN into an object. If the evaluation results
         * in a non-null object, the class is considered loaded.  If this method determines that the given FQCN is loaded, 
         * it will ensure that the FQCN is recorded in a local hash of loaded classes for future reference.</p>
         *
         * @param {String} fqcn The fully qualified class name of the JavaScript class.
         * @returns {Boolean} true if the given FQCN evaluates to a non-null result; false otherwise.
         */
        isLoaded: function isLd(fqcn) {
            var o;
            try { 
                o = eval(fqcn); 
            }
            catch(localerr) {}
            if (o) {
                this.loaded[fqcn] = true;
            }
            return !!o;
        },

        /**
         * Attempts to load a named JavaScript class, if not loaded already.
         */
        load: function ld(fqcn){
            // Have we tried and failed before?
            if (_missing[fqcn]) {
                return false;
            }
            // Have we succeeded before? Or perhaps it's already loaded?
            if (this.loaded[fqcn] || this.isLoaded(fqcn)) {
                return true;
            }            
            // No luck so far. Try to load it for the first time.
            if (_jsGet(_fqcn2File(fqcn), fqcn)) {
                this.loaded[fqcn] = true;
                return true;
            }
            else {
                _missing[fqcn] = true;
                return false;
            }
        }
    };

    var _L = mstrmojo.loader,
        _LL = _L.loaded;

    /**
     * <p>Cache of arguments passed into loader.requires method. Used to avoid duplicate loads.</p>
     * @private
     */
    var _reqCache = {};
    
    /**
     * <p>Ensures that the given fully qualified class names are loaded, as well as the
     * package prefixes of those names. Attempts to load any which are not already loaded, in the given order.</p>
     * 
     * <p>This method takes a variable number of input parameters. Each parameter is assumed to be a
     * fully qualified class name (String).</p>
     *
     * @returns {Boolean} true, so that calls can be AND'ed with subsequent operations, for example: "mstrmojo.requiresCls('X') && X.foo()"
     */
    mstrmojo.requiresCls = function reqCls() {
        // Create an array of input strings.
        var as = arguments,
            ns = [];
    
        // Walk the given FQCN strings...
        for (var i = 0, len = as.length; i < len; i++) {

            // Optimization: Have we received this argument before? or preloaded it? If so, skip it.
            var n = as[i];
            if (!n || _LL[n] || _reqCache[n] || _missing[n]) {
                continue;
            }
            
            if (!n.match(/^mstrmojo\.plugins\./)) {
            // If the argument has package prefixes, first add packages to array of inputs.
            var ps = n.split('.');
            for (var k = 1, klen = ps.length; k < klen; k++) {
                var s = ps.slice(0, k).join('.');
                if (!_reqCache[s]) {
                    ns.push(s);
                    _reqCache[s] = true;
                }
            }
            }
            // After package prefixes (if any), add the FQCN to array of inputs.
            ns.push(n);
            _reqCache[n] = true;
        }
        // Now load all the inputs.
        for (var j = 0, jlen = ns.length; j < jlen; j++) {
            if (!_L.load(ns[j])) {
                alert('Warning: Javascript class not found:\n' + ns[j]);
                break;
            }
        }
        return true;
    };

    // =============================== loading descriptors =============================
    var _D = mstrmojo.descriptors,
    	_dPrefix = 'mstrWeb.';

    /**
     * Merge the descriptors information from input into descriptor store.
     * 
     * @param ds {Object} This object contains the descriptor information retrieved from task call. 
     * @private
     */
	function populateDescriptors(ds) {
		if (ds) {
			for (var di = 0, dlen = ds.length; di < dlen; di ++) {
				var d = ds[di];
				_D[d.key] = d.v;
			}
		}
	}

	mstrmojo.populateDescriptors = populateDescriptors;

	// When this file is loaded, try to merge the pre-loaded descriptor information into descriptor store
	if ( typeof _app != 'undefined' ) {
	    populateDescriptors(_app.mstrDescs && _app.mstrDescs.descriptors);

	// Remove the descriptors loaded into the page...
	    _app.mstrDescs = null;
    }

	/**
	 * helper method.
	 * @private
	 */
	var _reqDesc = function(prefix, ids){
        // Create an array of input strings.
        var as = ids,
        	ns = [];
        for (var i = 0, len = as.length; i < len; i ++) {
        	var k = as[i];
        	if (k && !((prefix + k) in _D)){
        		ns.push(k);
        	}
        }
        if (ns.length > 0) {
        	var response = _syncXHR('POST', (window.mstrConfig && mstrConfig.taskURL) || 'taskProc', {
                taskId: 'getDescriptors',
                keys: ns.join(','),
                prefix: prefix
        	});
        	
        	if (response) {
        		var r = eval('(' + response + ')');
        		populateDescriptors(r && r.descriptors);
        	}
        }
	};
	
	/**
	 * Ensure the required descriptors exist in descriptor store. If any descriptor is missing from the store, 
	 * this method will make XHR call to load it before returning. 
	 * 
     * <p>This method takes a variable number of input parameters. 
     * The first parameter is for the prefix for every key. Each parameter, except the first one, is assumed to be a
     * descriptor id (number).</p>
	 */
    mstrmojo.requiresDescsWPrefix = function reqDescP(prefix){
    	var p = prefix;
    	arguments[0] = null;
    	_reqDesc(p, arguments);
    };
    
	/**
	 * <p>Ensure the required descriptors exist in descriptor store.</p>
	 * If any descriptor is missing from the store, this method will make XHR call to load it before return.
	 * 
     * <p>This method takes a variable number of input parameters. Each parameter is assumed to be a
     * descriptor id (number). This method assumes that 'mstrWeb.' is the prefix for each key.</p>
	 */
    mstrmojo.requiresDescs = function reqDesc() {
        // if we are not on a mobile device, then request the descriptors via XHR.  
        // On a mobile device, it is assumed that the descriptors have been preloaded.
        if (typeof mstrConfig != 'undefined' && !mstrConfig.onMobileDevice) {
    	_reqDesc(_dPrefix, arguments);
        }
    };
    
    /**
     * <p>Returns the localized string for the descriptor key.</p>
     * This method assume the 'mstrWeb.' as the prefix. So, it will look up the descriptor by key 'mstrWeb.' + key.
     * 
     * @param descID {Number} the key for the descriptor. It assumes the prefix for the key is 'mstrWeb.'.
     * @param defText {String} The text to use for the descriptor if it cannot be loaded.
     */
    mstrmojo.desc = function desc(descID, defText) {
        // Is the descID parameter a non-null value?
        if (descID !== null && descID !== undefined) {
    	// Load the descriptor remotely if it is not found in the local store...
    	mstrmojo.requiresDescs(descID);
    	
    	// Was it found?
    	if ((_dPrefix + descID) in _D) {
    		return _D[_dPrefix + descID];
    	}

    	// Give a meaningful string if omitted...
            defText = defText || "No string descriptor found for descID=" + descID;
        }
    	
    	// "Decorate" the default text...
    	var decDefText = "[" + defText + "]";
    	
    	// Put the replacement text in the array so it doesn't get continually loaded from the Web Server...
    	_D[_dPrefix + descID] = decDefText;
    	
    	return decDefText;
    };
    
    /**
     * <p>Returns the localized string for the descriptor key.</p>
     * This method will lookup the descriptor whose key prefix + key.
     * 
     * @param prefix {String} the prefix for the key.
     * @param descID {Number} the key for the descriptor. It assumes the prefix for the key is 'mstrWeb.'.
     * @param defText {String} The text to use for the descriptor if it cannot be loaded.
     */
    mstrmojo.descP = function descP(prefix, descID, defText) {
    	// Load the descriptor remotely if it is not found in the local store...
    	mstrmojo.requiresDescsWPrefix(prefix, descID);
    	
    	// Was it found?
    	if ((prefix + descID) in _D) {
    		return _D[prefix + descID];
    	}

    	// Give a meaningful string if omitted...
        defText = defText || "No string descriptor found for descID=" + descID;
    	
    	// "Decorate" the default text...
    	var decDefText = "*" + defText + "*";
    	
    	// Put the replacement text in the array so it doesn't get continually loaded from the Web Server...
    	_D[prefix + descID] = decDefText;
    	
    	return decDefText;
    };
    
    // =================== End of descriptors ============================ 

    /**
     * Records a given static class as loaded under a given fully qualified class name.
     *
     * @param {String} fqcn The fully qualified class name.
     * @param {Object} cls The static class object.
     * @returns {Object} The same static class object.
     */
    mstrmojo.provide = function prv(fqcn, cls) {
       _LL[fqcn] = !!cls;
       return cls;
    };
    
	   //TQMS : 536567
    /**
     * This method will mark the given fqcn to reload again when the mstrmojo.requiresCls used 
     * the normal behaviour of mstrmojo.requireCls is to not load the class if it is reloaded
     * to force reload a class, the user can call this method passing the fully qualified class name
     * 
     * @param (String) fqcn fully qualified class name that should be reloaded during its next call to mstrmojo.requiresCls
     * @param (Boolean) reload flag that tells whether to reload. 
     *                  true means reload
     *                  false means do not reload which is the default behaviour of mstrmojo.requiresCls
     */
    mstrmojo.invalidateCls = function  rel(fqcn) {
        _reqCache[fqcn] = false;
        _LL[fqcn] = false;
        
         eval(fqcn +" = null");
        
    } ;
	
    var mx = mstrmojo.mixin;
    
    /**
     * Creates a javascript custom class with the given superclass, mixins, and instance properties/methods.
     * 
     * @param {Function} SuperCls The constructor of the superclass for the class to be declared. If missing, Object is implied.
     * @param {Object[]} mixins An optional array of "mixins" to be applied to the new custom class. A "mixin" is a hashtable of
     * properties and/or methods; if given, these will be applied to the constructor's prototype.
     * @param {Object} config A hashtable of functions, keyed by name. The functions are assumed to be instance methods; 
     * they are applied to the constructor's prototype.
     * 
     * @returns The class constructor.
     */
    mstrmojo.declare = function dcl(SuperCls, mixins, config) {
        // Create a constructor for our custom class.  The constructor doesn't do much itself, it just calls
        // the class's instance method "init" (if any).  The one other job of the constructor is to check if the
        // input param tells it to skip the "init" call; this is useful when defining a subclass, because in
        // that scenario we want to skip the init call.
        function constr(/*Object?*/ props) {
            if ((!props || !props.dontInit) && this.init) {
                this.init(props);
            }
        }

        // If superclass is given, set the constructor's prototype to an instance of it.  This allows
        // every instance of our constructor to inherit all the superclass' instance methods/props.  However, 
        // this also means that all instances of our constructor will inherit the "constructor" property
        // from that superclass instance; the superclass instance's "constructor" property is the superclass constructor.
        // That's not right for us; we want all instances of our constructor to have their "constructor" property
        // point back to our constructor (of course).  To fix that, simply manually reset the constructor's prototype's 
        // "constructor" back to our constructor.
        if (SuperCls) {
            constr.prototype = new SuperCls({dontInit: true});
            constr.prototype.constructor = constr;
        }
        
        var proto = constr.prototype;
        
        // Apply all the mixin methods to the constructor's prototype.
        for (var i = 0, cnt = mixins && mixins.length || 0; i < cnt; i++) {
            mx(mixins[i], proto);
        }
        
        // Apply all the instance methods to the constructor's prototype.
        if (config) {
            mx(config, proto);
            if (config.scriptClass) {
                _LL[config.scriptClass] = true;
            }
        }
        
        return constr;
    };
    
    /**
     * get validate random number if there is any
     * @type String
     * @return The validate random number. 
     */
    mstrmojo.getValidateRandNum = function getVRN(){
        var validateRandNum;
        
        if(typeof(microstrategy)!='undefined' && microstrategy && microstrategy.validateRandNum != null && microstrategy.validateRandNum.length > 0){
            validateRandNum = microstrategy.validateRandNum;
        }
        if(!validateRandNum && mstrApp && mstrApp.validateRandNum && mstrApp.validateRandNum.length > 0 ){
            validateRandNum = mstrApp.validateRandNum;
        }
        if(!validateRandNum && window.mstrConfig && mstrConfig.validateRandNum && mstrConfig.validateRandNum.length > 0 ){
        	validateRandNum = mstrConfig.validateRandNum;
        }
        
        return validateRandNum;
    };
        
})();
