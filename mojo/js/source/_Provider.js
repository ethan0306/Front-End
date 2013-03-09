(function(){

    mstrmojo.requiresCls(
        "mstrmojo.publisher");

    var _P = mstrmojo.publisher;
    
    /**
     * <p>Enables an object to raise events that can be heard by listeners.</p>
     *
     * <p>This mixin provides a generic "set" method for updating an object's property value. The set method is capable of
     * raising an "event" when a property value changes by leveraging mstrmojo.publisher. This event can then be heard
     * by other objects who wish to be notified of the change.  Those objects can sign up as "listeners" by calling the
     * object's "attachEventListener" and "detachEventListener" methods.</p>
     *
     * @class
     * @public
     */
    mstrmojo._Provider = mstrmojo.provide(
    "mstrmojo._Provider",
    /**
     * @lends mstrmojo._Provider#
     */
    {
        /**
         * @ignore
         */
        _meta_usesSuper: false,
        
        /**
         * <p>Specifies which properties (if any) should raise an event when
         * their value is changed via a call to the "set()" method.<p>
         * 
         * <p>For example, if changes to the property "foo" should raise an event that can be listened for by event
         * listeners, then we should set audibles to:</p>
         * 
         *   <pre>audibles: {"foo": true}</pre>
         *   
         * <p>Alternatively, if the changes to "foo" should NOT raise an event, we can declare:</p>
         * 
         *   <pre>audibles: {"foo": false}</pre>
         *   
         * <p>To specify default behavior for properties in general, we can use the "*" shortcut:</p>
         * 
         *   <pre>audibles: {"*": true}</pre>
         *   
         * <p>If no default is specified, we assume the default to be audible.
         * Note that changes to property values which are NOT audible will not generate an internal event
         * which this instance can respond to.</p>
         * 
         * @type Object
         */
        audibles: {"*": true},
        
        /**
         * <p>Sets the value of a given property of this object.</p>
         * 
         * <p>This method checks this instance for a custom setter; if not found, the property value is updated directly.
         * If the value of the property was indeed changed, an event named "{propertyname}Change" is raised, but only
         * if both the following conditions are met:</p>
         * <ol>
         * <li>the property is audible; and</li>
         * <li>either this object has a handler for the event, or the global publisher has subscriptions for this event.</li>.
         * </ol>
         * 
         * <p>If the custom setter is used and returns truthy, the event is automatically published.</p>
         * 
         * @param {String} n The name of the property to change.
         * @param {Number|String|Object} [v] The new value.
         * 
         * @returns {Boolean} true if the property value was changed; false otherwise.
         */
        set: function set(n, v) {
            // Do we have a custom setter with the name "_set_XXX"?
            var bChanged = false,
                f = this["_set_" + n],
                vWas = this[n];    // Old value.
            
            if (f) {
                // We have a custom setter, so call it with our arguments.
                bChanged = f.apply(this, arguments);
            } else {
                // We don't have a custom setter, just update our property directly.
                this[n] = v;
                bChanged = (vWas !== v);
            }
            
            // Did the property value actually change?
            if (bChanged) {
                // Performance optimization: Raise event only if it's audible and someone is
                // listening for it (including this observable itself).
                var evtName = n + "Change",
                    aud = this.audibles || {},
                    isAudible =  (aud[n] === true) || ( (aud[n] !== false) && (aud["*"] !== false) ) ;
                
                if (isAudible && (this['pre' + evtName] || this['on' + evtName] || this['post' + evtName] || _P.hasSubs(this.id, evtName) )) {
                    // Raise an event corresponding to this property value change,
                    // so listeners can be notified.
                    this.raiseEvent({
                        name: evtName,
                        prop: n,
                        value: v,
                        valueWas: vWas
                    });
                }
            }
            return this;
        },
        
        /**
         * <p>Publishes an event that can be handled by this and other objects.</p>
         *
         * <p>Given an object which represents an event that originated within this object, this method will call 
         * this object's handler for that event (if any) with the given event object. Additionally, this method will
         * ask the mstrmojo.publisher to publish the event so other objects can be notified of the event.</p> 
         * 
         * @param {Object} evt An object representing an event; must have a "name" property representing the event's name.
         * @returns {Boolean} False if any event handler return false; true otherwise.
         */
        raiseEvent: function rse(evt) {
            var n = evt && evt.name;
            if (!n) {
                return null;
            }
            // Set the event source.
            evt.src = this;
            
            // Hook for customization.    
            if (this.preHandleEvent) {
                this.preHandleEvent(evt);
            }
            
            // First let this object respond to the event with its own custom handler, if any.
            var ns = ['pre', 'on', 'post'],
                abort = false;
            for (var i=0, len=ns.length; i<len; i++) {
                var fn = ns[i]+n;
                if (this[fn]) {
                    if (this[fn](evt) === false) {
                        abort = true;
                        break;
                    };
                }
            }

            // If no event handler has "aborted" this event...        
            if (!abort) {
                // Hook for customization.    
                if (this.postHandleEvent) {
                    this.postHandleEvent(evt);
                }
                // Then publish the event for other listeners to be notified.
                _P.publish(this.id, n, evt);                
            }
        
            return evt;
        },
        
        /**
         * <p>Optional handler called before event handling is executed.</p>
         *
         * <p>This handler is supported as a customization hook within the event handling process.
         * If specified, the handler will be called from raiseEvent before the object's handler for the event.
         * A single argument will be passed into the call: the event object.</p>
         *
         * @type Function
         */
        //preHandleEvent: null,
        
        /**
         * <p>Optional handler called after event handling is executed.</p>
         *
         * <p>This handler is supported as a customization hook within the event handling process.
         * If specified, the handler will be called from raiseEvent after the object's handler for the event.
         * A single argument will be passed into the call: the event object.</p>
         *
         * @type Function
         */
        //postHandleEvent: null, 
                           
        /**
         * <p>A shortcut for subscribing to events from this observable object.</p>
         *
         * <p>Although mstrmojo.publisher can be called to attach an event listener to an observable object, 
         * this method is provided as a convenience for attaching listeners for events that originate within this object.</p>
         * 
         * @param {String} name The name of the event we wish to subcribe to.
         * @param {Function|String} callback A function, or name of a method, to be called in response to the event.
         * @param {String} [listener] ID of object which hosts the callback. If omitted, the global context is assumed.
         * @returns {Object} An object representing the attached subscription.  This object can be used subsequently as the argument to 
         * detachEventListener to cancel the subscription. 
         */
        attachEventListener: function att(name, listener, callback) {
            return _P.subscribe(this.id, name, callback, listener);
        },
        
        /**
         * <p>A shortcut for unsubscribing from events from this observable object.</p>
         *
         * <p>Although mstrmojo.publisher can be called to detach an event listener to an observable object, 
         * this method is provided as a convenience for detaching listeners for events that originate within this object.
         * This method is a complement to the attachEventListener method, and can be used to cancel a subscription created by attachEventListener.</p>
         * 
         * @param {Object} sub A single object identifier for the subscription, or an array of object identifiers.
         */            
        detachEventListener: function det(sub) {
            _P.unsubscribe(sub);
        }        
    });
    
})();