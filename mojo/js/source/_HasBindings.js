(function(){

    mstrmojo.requiresCls("mstrmojo.registry", "mstrmojo.hash");
    
    var _loadedCls = false,
        _FQCN = "mstrmojo.Binding",
        _B = "bindings",
        _R = mstrmojo.registry;
    
    /**
     * Disables a given collection of binding objects.
     * @param {Object} bs Hash of binding objects.
     * @private
     */
    function _shutdown(bs) {
        for (var d in bs) {
            var b = bs[d];
            if (b && b.disable) {
                b.destroy();
            }
        }
    }
    
    /**
     * Enables a given collection of either binding objects or references to binding objects.
     * @param {Object} bs Hash of binding objects or references.
     * @param {Object} p The parent object to which these bindings belong.
     * @private
     */
    function _startup(bs, p) {
        // Load the Binding class (one-time only).
        if (!_loadedCls) {
            mstrmojo.requiresCls(_FQCN);
            _loadedCls = true;
        }
        // For each binding config...
        for (var d in bs) {
            var b = bs[d];
            if (b == null) {    // if b is null or undefined
                continue;
            }
            var t = typeof(b);
            // Strings values are shorthand for binding "source" properties;
            // otherwise assume we have an object value. 
            if (t === "string" || t === "function") {
                b = {
                        destination: d,
                        source: b,
                        scriptClass: _FQCN
                    };
            }
            // Before creating the binding, set its parent handle (in case it uses it).
            b.parent = p;
            // Evaluate the binding reference into a binding object and start it up.
            // Optimization: skip class loaded check, because we assume we've already loaded the one binding class above.
            b = _R.ref(b, {skipLoadChecks: true});
            bs[d] = b;
            b.enable();
        }
    }
    
    /**
     * <p>Enables the use of bindings to determine property values on a given object.</p>
     *
     * <p>The object is expected to have a "bindings" property whose value is a hashtable, which is keyed by destination name; 
     * the hash values are configs for instances of Binding objects.</p>
     *
     * @class
     * @public
     */
    mstrmojo._HasBindings = mstrmojo.provide(
    "mstrmojo._HasBindings",
    /**
     * @lends mstrmojo._HasBindings#
     */
    {
        _meta_usesSuper: false,

        /**
         * <p>Hash of bindings defined for this object.</p>
         * 
         * @type {Object}
         */
        //bindings: null,
        
        /**
         * <p>Optional handler called after initialization of bindings.</p>
         *
         * <p>This handler is supported as a customization hook at the end of the binding creation process.
         * If specified, the handler will be called after the instance's bindings have been initialized.
         * If the instance has no bindings, the handler will not be called.</p>
         *
         * @type Function
         */
        //postCreateBindings: null,

        /**
         * <p>Initializes the bindings for properties in this object and its children (if any).</p>
         *
         * <p>This method first inspects this object's "bindings" property. If given, this method creates
         * bindings from that property value. Then this method calls the "initBindings" method of this object's children
         * (if any) regardless of whether or not this object has any bindings.</p>
         */
        initBindings: function inB() {
            this.hasInitBindings = true;

            var bs = mstrmojo.hash.copy(this[_B]);
                
            if (bs) { 
                delete this[_B];
                this._set_bindings(_B, bs, true);
                // Hook for customizations after creating bindings.
                if (this.postCreateBindings) {
                    this.postCreateBindings();        
                }
            }
            
            var ch = this.children;
            if (ch) {
                for (var i=0, len=ch.length; i<len; i++) {
                    var c = ch[i];
                    if (c && c.initBindings) {
                        c.initBindings();
                    }        
                }
            }
        },
        
        destroyBindings: function destB(){
            var bs = this.bindings;
            if (bs) {
                _shutdown(bs);
                delete this.bindings;
            }
        },
        
        /**
         * <p>Custom setter for the "bindings" property value.</p>
         *
         * <p>This method will apply a given hash of bindings to this object.
         * It initializes the values of the bound properties in this object.
         * Any bindings previously in the "bindings" property are removed first.</p>
         *
         * <p>This method inspects the given bindings hash. Each hash key is the
         * name of a bound property; each hash value is either an instance of a Binding object,
         * or a reference to a Binding. A "reference" is either a String (which serves as the
         * source script for a new Binding) or a hashtable of properties for a new Binding, which
         * is resolved via the mstrmojo.registry.ref method.</p>
         *
         * @param {String} [n="bindings"] The property whose value is being set.
         * @param {Object} [v] Hash of either binding objects or references to binding objects.
         * @returns {Boolean} true if the "bindings" hash object was reset; false otherwise.
         */
        _set_bindings: function setB(n, v) {
            var bs = this[_B];
            if (v !== bs){
                if (bs) {
                    _shutdown(bs);
                }
                this[_B] = v;
                if (v) {
                    _startup(v, this);
                }
                return true;
            }
            return false;
        }
    });

})();