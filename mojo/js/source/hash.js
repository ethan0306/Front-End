(function(){
    
    /**
     * <p>Static class with helper methods for using hash objects.</p>
     * 
     * @class
     */
    mstrmojo.hash = mstrmojo.provide(
    "mstrmojo.hash",
    {
        /**
         * <p>Copies all of the members of a given source hash to another given destination hash.</p>
         * 
         * <p>Any existing members in the destination whose names conflict will be overwritten.</p>
         * 
         * @param {Object} src The source object whose properties/values should be copied.
         * @param {Object} [dest] An optional hash to receive the copied properties/values.  If this parameter is undefined, an empty hash will be used. 
         * 
         * @returns {Object} The modified destination hash.
         */
        copy: function copy(src, dest) {
            if (src) {
                dest = dest || {};

                for (var n in src) {
                    dest[n] = src[n];
                }
            }
            return dest;
        },

        /**
         * <p>Copies an enumerated list of members of a given source hash to another given destination hash.</p>
         *
         * <p>Any existing members in the destination whose names conflict will be overwritten.  Only overwrites the value if the property is present in the source hash.</p>
         * 
         * @param {String[]} ns An array of property names to be copied.
         * @param {Object} src The hash from which the property values should be copied.
         * @param {Objecct} [dest={}] An optional hash to which the property values should be copied.  If this parameter is undefined, an empty hash will be used. 
         * 
         * @returns Object The modified destination hash.
         */
        copyProps: function copyProps(ns, src, dest) {
            // If dest is not there create one.
            dest = dest || {};
            
            if (src) {
                // Iterate properties.
                for (var i = 0, len = (ns && ns.length) || 0; i < len; i++) {
                    var n = ns[i];
                    // Does the property exist in the source hash?
                    if (n in src) {
                        // Overwrite the property value in the destination hash.
                        dest[n] = src[n];
                    }
                }
            }
            return dest;
        },
        
        /**
         * <p>Iterates the supplied hash and calls the supplied function once for each item in the hash.</p>
         * 
         * <p>The function is passed three parameters:</p>
         * 
         * <ol>
         *  <li>The member value</li>
         *  <li>The member key</li>
         *  <li>The hash itself</li>
         * </ol>

         * @param {Object} hash The hash to be iterated.
         * @param {Function} f The function to be run for each iteration.
         * @param {Object} [scope=f] An optional scope for the passed function.
         */
        forEach: function forEach(hash, f, scope) {
            if (hash) {
                for (var key in hash) {
                    if (scope) {
                        if (f.call(scope, hash[key], key, hash) === false) {
                            break;
                        }
                    } else {
                        if (f(hash[key], key, hash) === false) {
                            break;
                        }
                    }
                }
            }
        },
        
        /**
         * <p>Walks a given path of property names, starting with a context object.  If no context is given, the global context is assumed.</p>
         * 
         * @param {String} path The path to be walked.
         * @param {Object} context The object to be walked.
         * 
         * @returns {Object} The resolved path within the supplied context.
         */
        walk: function walk(path, context) {
            if (!context) {
                context = mstrmojo.global;
            }
            var parts = path.split('.');
            if (parts.length == 1) {
                return context[path];
            }
            for (var i=0, len=parts && parts.length || 0; i<len; i++) {
                context = context[parts[i]];
                if (!context) {
                    break;
                }
            }
            return context;
        },
        
        /**
         * <p>Returns true if a given hash either:</p>
         * 
         *  <ol>
         *      <li>is null or</li>
         *      <li>has no non-null property values.</li>
         *  </ol>
         *  
         *  @param {Object} hash The hash object to evaluate.
         *  
         *  @return {Boolean}
         */
        isEmpty: function(/*Object?*/ hash) {
            if (!hash) {
                return true;
            }
            for (var k in hash) {
                if (hash[k] != null) {  // is not null and not undefined
                    return false;
                }
            }
            return true;
        },
        
        /**
         * <p>Removes all the properties of a given hashtable.</p>
         * @param {Object} h The hashtable.
         * @return {Object} The given hashtable.
         */
        clear: function clr(h){
            if (h) {
                for (var k in h){
                    delete h[k];
                }
            }
            return h;
        },
        
        /**
         * <p>Returns any (the first) property value encountered in a given hash if any; <i>undefined</i> otherwise.</p>
         *  
         * <p>Similar in concept to reading the first item in an array, however no order is guaranteed for a hash's properties.</p>
         * 
         * @param {Object} hash The hash to examine.
         * @param {Boolean} keyOrValue Whether to look for the key (true) or the value (undefined|false).
         * 
         * @returns {String|Integer|Object} Either the key, the value or <i>undefined</i>.
         */
        any: function(/*Object?*/ hash, /*Boolean?*/ keyOrValue) {
            if (hash) {
                for (var k in hash) {
                    return keyOrValue ? k : hash[k];
                }
            }
            return undefined;
        },

        /**
         * <p>Creates a deep clone of a given hash (or array), meaning that any contained hash object (or arrays) are also cloned.</p>
         * 
         * @param {Object|Array} obj The object (or array) to be cloned.
         * 
         * @returns {Object|Array} The cloned object (or array).
         */
        clone: function cln(obj) {
            if (!obj) {
                return null;
            }
            
            var c;
            if (obj.constructor === Array) {
                // An array can be duplicated by concat, but that's only a shallow clone.
                c = obj.concat();
                // Check if we need to clone the array items too.
                var first = c[0];
                if (first && typeof(first) === 'object') {
                    for (var i=0, len=c.length; i<len; i++){
                        c[i] = this.clone(obj[i]);
                    }
                }
            } else {
                // Assume its a hash.
                c = {};
                for (var k in obj) {
                    var v = obj[k];
                    // Check if we have a subobject/subarray to clone.
                    if (v && typeof(v) == 'object') {
                        // Nested object/array, clone recursively.
                        c[k] = this.clone(v);
                    } else {
                        // Scalar, just copy by value.
                        c[k] = v;
                    }
                }
            }
            return c;
        },
        
        /**
         * <p>Clones an array.</p>
         * 
         * @param {Array} The array to clone.
         * 
         * @returns {Array} The cloned array.
         */
        cloneArray: function clnArr(/*Array*/ arr) {
            var arr2 = [];
            for (var i=0, len=(arr&&arr.length)||0; i<len; i++) {
                arr2[i] = this.clone(arr[i]);
            }
            return arr2;
        },

        /**
         * Generates an array of the keys in a given hash.
         * @param {Object} h The hash whose keys are to be inspected.
         * @param {Boolean} [nums] If true, the values are treated as numbers for comparison.
         * @returns {Array} The array of hash keys.
         */
        keyarray: function kyarr(h, nums) {
            var arr = [];
            if (h) {
                for (var k in h) {
                    arr.push(nums ? Number(k) : k);
                }
            }
            return arr;
        },
        
        /**
         * Generates an array of the values in a given hash.
         * @param {Object} h The hash whose values are to be inspected.
         * @returns {Array} The array of hash values.
         */
        valarray: function varr(h){
            var arr = [];
            if (h) {
                for (var k in h) {
                    arr.push(h[k]);
                }
            }
            return arr;
        },
        /**
         * Returns whether the two hashes are the same.
         */
        equals: function eq(h1, h2) {
            // check null, equals when either both not null or both null
            var _H = mstrmojo.hash,
                _rslt = h1 && h2 || (!h1 && !h2 && (h1 === h2));
            // for not null
            if (_rslt && h1) {
                // check constructor
                _rslt = (h1.constructor === h2.constructor);
                if (_rslt) {
                    // array type
                    if (h1.constructor === Array) {
                        var len = h1.length;
                        // check length
                        _rslt = (len === h2.length);
                        // for same length and has items
                        if (_rslt && len){
                            // check each individual item
                            for (var i = 0; i < len; i ++) {
                                _rslt = _rslt && _H.equals(h1[i], h2[i]);
                            }
                        }
                    // object type
                    } else if (typeof (h1) === 'object'){
                        // check keys
                        var h1k = _H.keyarray(h1),
                            h2k = _H.keyarray(h2);
                        _rslt = h1k.length === h2k.length;
                        if (_rslt){
                            for (var p in h1){
                                _rslt = _rslt && (_H.equals(h1[p], h2[p]));
                            }
                        }
                    // primitive type    
                    } else {
                        _rslt = (h1 === h2);
                    }
                }
            }
            return _rslt;
        },
        /**
         * Traverse a json object and transform any of its Object property into an array
         * if it has a boolean property called "isArray" with value = true. It also assumes that this 
         * Object property has another property called "length" indicating the length of the array. 
         * @param {Object} o The hash to be transformed.
         * @return {Object} The object after being transformed. 
         */
        obj2array: function(o){
           for(var n in o){
              var p = o[n];
              if(p && typeof(p) == 'object'){
                  o[n] = this.obj2array(p);
              } 
           }
           if('isArray' in o && (o.isArray === true)){
               var r = [];
               for(var i=0,len=o.length;i<len;i++){
                   r.push(o[i]);   
               }
               return r;
           } else {
               return o;   
           }
        },
        
        
        /**
         * Returns the smallest value in a given hash.
         * @param {Object} h The hash to be inspected.
         * @param {Boolean} [vals] If true, the hash values are inspected; otherwise, the hash keys are.
         * @param {Boolean} [nums] If true, hash entries are treated as numbers for comparison.
         */
        min: function min(h, vals, nums){
            var m;
            if (h) {
                for (var k in h){
                    var v = vals ? h[k] : k;
                    if (nums) {
                        v = Number(v);
                    }
                    if ((m == null)||(v < m)){
                        m = v;
                    }
                }
            }
            return m;
        },
        
        /**
         * <p>Converts a given hash into an instance of a given javascript class.</p>
         *
         * <p>This method is typically used to make a native javascript Object into an observable object.
         * Unlike using a class constructor, this call enhances the given object rather than creating a new object.</p>
         *
         * @param {Object} h The object (hash) to be converted.
         * @param {Object} c The constructor for the class to which the given object will be converted.
         * @param {Object} [props] Hash of properties to apply to the resulting class instance. Only used if the instance has an "init" method,
         * in which case the hash is passed in as a single argument to that method.
         * @returns {Object} The same object passed in.
         * @static
         */
        make: function mk(h, c, props) {
            if (!h || !c) {
                return null;
            }
            if (h.attachEventListener) {
                // Object is already observable. Don't try to re-register it.
                return h;
            }
            if (c.makeObservable) {
                h = c.makeObservable(h, props) || h;
            } else {
                this.copy(c.prototype, h);
                if (h.init) {
                    h = h.init(props) || h;
                }
            }
            return h;
        }
    });
    
})();