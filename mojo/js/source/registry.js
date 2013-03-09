(function(){

    /**
     * Public lookup of registered objects, keyed by id.
     * @type Object
     * @static
     */
    mstrmojo.all = {};
    
    var _A = mstrmojo.all;
    
    /**
     * <p>A counter used for auto-generated ids (see _freeId private function).</p>
     * @type Integer
     * @private
     */
    var _freeIdCounter = 0;

    /**
     * <p>Returns an auto-generated id that is currently unused in the mstrmojo.all collection.</p>
     *
     * <p>The id will following the syntax "mstr#" where "#" is an integer.</p>
     *
     * @returns {String} The auto-generated id.
     * @private
     */
    function _freeId() {
        for (;_freeIdCounter++;) {
            if (!_A["mstr" + _freeIdCounter]) {
                break;
            }
        }
        return "mstr" + _freeIdCounter;
    }
    
    /**
     * <p>Manages a lookup of objects.</p>
     *
     * @class
     */
    mstrmojo.registry = mstrmojo.provide(
    "mstrmojo.registry",
    /**
     * @lends mstrmojo.registry
     */
    {
        /**
         * <p>Adds an object to the lookup.</p>
         *
         * <p>The object must have a non-null "id" property, and that id must not already be used in the lookup; 
         * otherwise, throws an error.</p>
         * 
         * @param {Object} obj The object to be added to the lookup.
         */
        add: function add(obj) {
            if (!obj) {
                return;
            }
            // If we don't have an id (null|undefined), get an auto-generated one, so we can be looked up by id later.
            var id = obj.id;
            if (id == null) {   // if id is null OR undefined
                id = _freeId();
                obj.id = id;
            } else if (_A[id]) {
                throw new Error("Tried to register 2 objects with same id: " + id);
            }
            _A[id] = obj;
        },
        
        /**
         * <p>Removes a given object from the lookup.</p>
         *
         * @param {Object} obj The object to be removed from the lookup.
         */
        remove: function rmv(obj) {
            if (obj && obj.id != null) {    // if id is not null and not undefined
                delete _A[obj.id];
            }
        },

        /**
         * Dumps the ID and, if possible, scriptClass properties of all objects in mstrmojo.all to console
         */
                
        dumpAll: function() {
            for(var o in _A ) {
                if ( _A[o].id != null ) {
                    mstrmojo.dbg(_A[o].id + "(" + (_A[o].scriptClass || "[unknown class]") + ")");
                } 
            }
        },
                        
        /**
         * <p>Attempts to convert a given object reference into an instance of a javascript class.</p>
         *
         * <p>The object reference may be either of the following:</p>
         * <ol>
         * <li>a fully qualified class name (String); or</li>
         * <li>a hashtable of properties, which includes a "scriptClass" property; or</li>
         * <li>an instance of a javascript class.</li>
         * </ol>
         *
         * <p>In case #1, the FQCN is loaded (if needed) and evaluated. If the evaluated result
         * is a Function, it is assumed to be a constructor and then used to instantiate a
         * return value. Otherwise if the evaluated result is an object, then the object is
         * used for either cases #2 (for a native object) or #3 (for an instance of a javascript class).</p>
         *
         * <p>In case (2), the hashtable's scriptClass property determines what constructor
         * is called to instantiate a javascript class.  The hashtable is passed into the
         * constructor call. If no scriptClass property is defined, the hashtable is returned.</p> 
         *
         * <p>In case (3), the given instance is returned.</p>
         *
         * @param {String|Object} config The object reference to be evaluated. 
         * @param {Object} [flags] Hashtable of flags to customize this function call's behavior.
         * @param {Boolean} flags.skipLoadChecks=false If true, this method will skip calling mstrmojo.requiresCls before evaluating an FQCN string.
         * @param {Boolean} flags.dontInst=false If true, when this method evaluates a reference as a Function, it will return that Function; 
         * otherwise, this method assumes the Function is a constructor and calls the Function to create a new object instance.
         * @param {Boolean} flags.clone=false If true, when this method evaluates a reference as a hashtable of properties, it will pass in
         * a clone of the hashtable, rather than the hashtable itself, to a class constructor.
         *
         * @returns {Object} The object to which the reference evaluates to, if successful; null otherwise.
         */
        ref: function ref(config, flags){
            if (!config) {
                return null;
            }
            if (!flags) {
                flags = {};
            }
            var C = config;
            while(C) {
                switch(typeof(C)) {
                    case "string":
                        // An FQCN. Load and evaluate it.
                        if (flags.skipLoadChecks !== true) {
                            mstrmojo.requiresCls(config);
                        }
                        C = eval(C);
                        break;
                    case "function":                        
                        // A constructor. Call it, unless explicitly asked not to.
                        return (flags.dontInst !== true) ? new C() : C;
                    case "object":
                        if (C.constructor === Object) {
                            // A hashtable of properties; try to convert to script class instance.
                            var sc = C.scriptClass;
                            if (sc) {
                                // Script class FQCN is specified; load and evaluate it.
                                if (flags.skipLoadChecks !== true) {
                                    mstrmojo.requiresCls(sc);
                                }
                                var cls = eval(sc);
                                if (cls) {
                                    // Got the constructor; call it.
                                    return new cls((flags.clone === true) ? 
                                                    mstrmojo.hash.clone(C) : 
                                                    C);
                                }
                                // Couldn't load the constructor; failed.
                                return null;
                            } else {
                                // Script class FQCN not specified; return the hashtable.
                                return C;
                            }
                        } else {
                            // A javascript custom class instance.                        
                            return C;
                        }
                        break;
                    default:
                        return null;
                }
            }
        }
    });

    /**
     * <p>Shortcut to mstrmojo.registry.ref method, for convenience.</p>
     * @type Function
     */
    mstrmojo.insert = mstrmojo.registry.ref;
    
})();