(function(){

    mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.array",
        "mstrmojo.registry",
        "mstrmojo.publisher",
        "mstrmojo._Provider");
        
    var _H = mstrmojo.hash,
        _A = mstrmojo.array,
        _R = mstrmojo.registry,
        _P = mstrmojo.publisher;

    
    /**
     * <p>Base observable array class.</p>
     * @class
     */
    mstrmojo.Arr = mstrmojo.declare(
        // superclass
        null,

        // mixins
        [mstrmojo._Provider],
                
        /**
         * @lends mstrmojo.Arr.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.Arr",

            /**
             * <p>Optional handler called during initialization.</p>
             *
             * <p>This handler is supported as a customization hook within the instance creation process.
             * If specified, the handler will be called from constructor after properties are applied to this object,
             * but before the object is registered in the "mstrmojo.all" collection.</p>
             *
             * @type Function
             */
            postApplyProperties: null,
            
            /**
             * <p>Optional handler called after initialization.</p>
             *
             * <p>This handler is supported as a customization hook at the end of the instance creation process.
             * If specified, the handler will be called from constructor after the instance properties are finished
             * processing and the instance has been registered in the "mstrmojo.all" collection.</p>
             *
             * @type Function
             */
            postCreate: null,
            
            /**
             * Metadata for "length" property. Identifies the event which is raised when the property value is changed.
             */
            length_bindEvents : ['add', 'remove'],
            
            /**
             * <p>Base observable array class.</p>
             * @constructs
             * @param {Object|Array} [props] Hash of property values to be applied to this instance.
             */
            init: function init(props) {
                // Retrieve an array; either it is props.data, or props, or create a new one.
                var arr;
                if (props && props.data) {
                    arr = props.data;
                    delete props.data;
                } else if (props) {
                    arr = props;
                    props = null;
                }
                if (!arr || arr.constructor !== Array) {
                    arr = [];
                }

                // Apply the instance methods to the array.
                _H.copy(mstrmojo.Arr.prototype, arr);
                
                // Apply the given properties (if any) to the array.
                if (props) {
                    _H.copy(props, arr);
                }
                
                // Hook for customizations before getting registered.
                if (arr.postApplyProperties) {
                    arr.postApplyProperties();
                }
        
                // Add the array to the mstrmojo.all collection so it can participate in event publishing/listening.
                _R.add(arr);
                                
                // Hook for customizations after getting registered.
                if (arr.postCreate) {
                    arr.postCreate();        
                }
                // Return the array; do NOT return this.
                return arr;
            },
            
            /**
             * Removes this instance from the mstrmojo.all collection and from any event subscriptions.
             */
            destroy: function dst(){
                // Clear all subscription to or from this object.
                _P.clearSubscriptions(this.id);

                // Remove this instance from event publishing/listening.
                _R.remove(this);
            },
            
            /**
             * Inserts items into this array and raises an event if appropriate.
             * @param {Integer} [idx] The index at which to insert the items. If missing, the items are appended.
             * @param {Array} items The items to be inserted.
             * @param {Boolean} [silent] If true, suppresses the raising of an event.
             */
            add: function add(items, idx, silent){
                var c = items && items.length;
                if (c) {
                    if (idx == null) {  // idx is null or undefined
                        idx = this.length;
                    }
                    _A.insert(this, idx, items);

                    // Raise an event, only if someone is listening for it (including this object itself).
                    if (!silent && 
                        (this.onadd || _P.hasSubs(this.id, "add")) ) {
                            this.raiseEvent({
                                name: "add", 
                                value: items, 
                                index: idx
                            });
                    }
                }
            },

            /**
             * Removes items from this array and raises an event if appropriate.
             * @param {Integer} idx The index at which to remove the items.
             * @param {Integer} [count=1] The count of items to be removed.
             * @param {Boolean} [silent] If true, suppresses the raising of an event.
             */
            remove: function rmv(idx, count, silent){
                if (count == null) {    // count is null or undefined
                    count = 1;
                }
                if ((idx != null) && count) {   // idx is not null and not undefined
                    var rem = this.splice(idx, count);
                    
                    // Raise an event, only if someone is listening for it (including this object itself).
                    if (!silent && 
                        (this.onremove || _P.hasSubs(this.id, "remove")) ) {
                            this.raiseEvent({
                                name: "remove", 
                                value: rem, 
                                index: idx
                            });
                    }
                }
            }
        
        });

    /**
     * <p>Converts a given array into an observable array, i.e. an instance of mstrmojo.Arr.</p>
     *
     * <p>This class method is provided as an alternative way to make a native javascript Array observable.
     * Unlike the mstrmojo.Arr constructor, this calling signature makes it clear that the call does not
     * create a new object, but rather, enhances the given array.</p>
     *
     * @param {Array} arr The array to be made observable.
     * @param {Object} [props] Hash of properties to apply to the given array.
     * @returns {mstrMojo.Arr} The same array passed in.
     * @static
     */
    mstrmojo.Arr.makeObservable = function mk(arr, props) {
        if (!arr) {
            return;
        }
        if (!props) {
            props = {};
        }
        props.data = arr;
        return this.prototype.init(props);        
    };
    
})();