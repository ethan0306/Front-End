(function(){

    mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.registry",
        "mstrmojo.publisher",
        "mstrmojo._Provider");
        
    var _H = mstrmojo.hash,
        _R = mstrmojo.registry,
        _P = mstrmojo.publisher;
                         
    /**
     * <p>Base class for an observable object.</p>
     *
     * <p>When an instance of Obj is constructed, it is automatically added to the "mstrmojo.all" collection, keyed by its
     * "id" property (if missing, an id will be auto-generated).  Hence the instance can be used with the "publisher" system
     * (mstrmojo.publisher) for raising and listening to "events". When the instance's "destroy" method is called, it is 
     * removed from the "all" collection and from the publisher system.</p>
     *
     * <p>Each Obj instance can have any arbitrary set of properties and valies.  The instance has a "set" method for updating 
     * its property values.  The "set" method is capable of raising an "event" which can then be heard by other objects who wish 
     * to be notified of a change in the Obj's state. Those objects can sign up as "listeners" for events by calling the Obj's 
     * "attachEventListener" and "removeEventListener" methods.</p>
     * 
     * @class
     */
    mstrmojo.Obj = mstrmojo.declare(
        // superclass
        null,

        // mixins
        [mstrmojo._Provider],
                
        /**
         * @lends mstrmojo.Obj.prototype
         */
        {
            /**
             * The FQCN for this object.
             * 
             * @type String
             */
            scriptClass: "mstrmojo.Obj",

            /**
             * <p>Optional handler called during initialization.</p>
             *
             * <p>This handler is supported as a customization hook within the instance creation process.
             * If specified, the handler will be called from constructor after properties are applied to this object,
             * but before the object is registered in the "mstrmojo.all" collection.</p>
             *
             * @type Function
             */
            //postApplyProperties: null,
            
            /**
             * <p>Optional handler called after initialization.</p>
             *
             * <p>This handler is supported as a customization hook at the end of the instance creation process.
             * If specified, the handler will be called from constructor after the instance properties are finished
             * processing and the instance has been registered in the "mstrmojo.all" collection.</p>
             *
             * @type Function
             */
            //postCreate: null,

            /**
             * <p>Base class for an observable object.</p>
             *
             * <p>Constructs a new instance by doing the following:</p>
             * <ol>
             * <li>applying all the property values in a given hashtable to the new instance,</li>
             * <li>calls the "postApplyProperties" handler, if any,</li>
             * <li>auto-assigns an "id" property value to the instance (if needed),</li>
             * <li>adds the instance to the "mstrmojo.all" collection,</li>
             * <li>calls the "postCreate" handler, if any.</li>
             * </ol>
             *
             * @constructs
             * @param {Object} [props] Hash of property values to be applied to this instance.
             */
            init: function init(props) {
            
                // Apply the given properties to this instance.
                _H.copy(props, this);    // Optimization: use copy rather than mixin, unless truly needed.
                
                // Hook for customizations before getting registered.
                if (this.postApplyProperties) {
                    this.postApplyProperties();
                }

                // Add this instance to the mstrmojo.all collection so it can participate in event publishing/listening.
                _R.add(this);
                                
                // Hook for customizations after getting registered.
                if (this.postCreate) {
                    this.postCreate();        
                }
            },
            
            /**
             * Removes this instance from the mstrmojo.all collection and from any event subscriptions.
             */
            destroy: function dst(){
                // Clear all subscription to or from this object.
                _P.clearSubscriptions(this.id);

                // Remove this instance from event publishing/listening.
                _R.remove(this);
            }
        }
    );

    // static convenience function for destroying and deleting an Obj object;
    // if you are disposing of lots of objects, recommendation is to define a local variable = mstrmojo.Obj.free and
    // use it to call this function.
    // 
    // You may pass null and undefined variables to this function.
    //
    mstrmojo.Obj.free = function free(o) {
        if ( o instanceof mstrmojo.Obj ) {
            o.destroy();
            delete o;
        }
    };
    
        
})();
