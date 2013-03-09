(function(){

    mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.array");
        
    /**
     * <p>Hashtable of subscriptions with callbacks to method names, keyed by publisher ID.</p>
     * 
     * <p>The "subs" hashtable maps a publisher ID to the event names for which that publisher has subscriptions.
     * The event names are stored in a hashtable, which is keyed by event name.  That event hashtable, in turn,
     * maps an event name to the listener IDs for that event.  Each listener ID represents an object which wishes to
     * be notified when that given event name is published by the given publisher ID.  The list of listener IDs is
     * a hashtable as well, keyed by listener ID, where key value is a list of callbacks to that listener.  Generally,
     * a listener maybe ask for multiple callbacks, each of which may be either a method name or a Function object.
     * This hashtable stores these callbacks in an object with properties "methods" and "functions".
     * Note that an empty listener ID ("") is used to store callbacks to global methods.</p>
     * 
     * <p>In summary, the hashtable's internal structures look like this:</p>
     * <pre>
     * subs[publisherId][evtName][listenerId] = {
     *  methods: {
     *    "methodName1": true,
     *    "methodName2": true,
     *    ..
     *  },
     *  functions: [
     *    Function1,
     *    Function2,
     *    ..
     *  ]
     * }
     * </pre>
     *
     * @type Object
     * @private
     * @static
     */
    var _subs = {};
        
    /**
     * A map of listeners so that we can release subscriptions when a listening instance is destroyed.
     * 
     * @type Object
     * @private
     * @static
     */
    var _listenerMap = {};

    /**
     * <p>A publish-and-subscribe system for broadcasting events to observable objects in a mojo application.</p>
     * 
     * @class
     */
    mstrmojo.publisher = mstrmojo.provide(
    "mstrmojo.publisher",
    /**
     * @lends mstrmojo.publisher#
     */
    {        
        /**
         * <p>Notifies subscribers of an event occurrence.</p>
         * 
         * <p>All subscribers to that object's event will receive the data via whatever callback they used to subscribe.</p>
         * 
         * @param {String} id The ID of the object that is publishing this event.
         * @param {String} type The name of the event to publish.
         * @param {Object} data The event occurrence information.
         */
        publish: function pub(id, type, data) {
            // Retrieve the hash of listener ids for this publisher + event combo.
            var ls = _subs[id] && _subs[id][type];
            if (!ls) {
                return;
            }

            // Notify the listeners.
            for (var lid in ls) {
                // Get a handle to the listener, if any.
                var l = null;
                if (lid ) {
                	l = mstrmojo.all[lid];
                	//A safty check for the case when the same listener was added several times.
                	//The optimization in the clearSubscriptions - using the listener to source map
                	//doesn't remove a listener if it was added more then once. This code will clean
                	//such orphan subscriptions.
                	if (! l ) {
                		delete ls[lid];
                		continue;
                	}
                }
                // Call the methods subscribed on that listener.
                var ns = ls[lid].methods;
                if (ns) {
                    // If we have a listener object, call its method.
                    // Without a listener, use the global context.
                    var ctxt = l || mstrmojo.global;
                    for (var n in ns) {
                        if (ctxt[n]) {
                            ctxt[n](data);
                        }
                    }
                }
                // Call the Functions subscribed on that listener.
                // Notify them in reverse order in case some callback deletes a callback.
                // Also do a null check on ls[lid] because method callbacks above may have
                // removed it from the listener hash.
                var fs = ls[lid] && ls[lid].functions,
                    flen = fs && fs.length || 0;
                if (flen) {
                    var i;
                    if (l) {
                        // If we have a listener object, apply the Function to it.
                        for (i=flen-1; i>-1; i--) {
                            if (fs[i]) {
                                fs[i].apply(l, [data]);                        
                            }
                        }
                    } else {
                        // Without a listener object, just call the Function directly.
                        // We avoid using apply() here for performance.
                        for (i=flen-1; i>-1; i--) {
                            if (fs[i]) {
                                fs[i](data);
                            }
                        }
                    }
                }
                
            }
        },
        
        /**
         * <p>Requests that an object be notified of a future event in another object.</p>
         * 
         * @param {String} id The ID of the object that will do the publishing.
         * @param {String} type The type of the event that will be listened for.
         * @param {Function|String} callback Either a Function, or the name of a listener method, to call when the event is published. 
         * @param {String} [listener] ID of the listener to be notified when the given event is published. If missing, the global context is assumed to be the listener.
         * 
         * @returns {Object} A newly generated identifier (Object) for this subscription, which can then be used to call unsubscribe() later.
         */
        subscribe: function sub(id, type, callback, listener) {
            
            // Validate publisher's hash.
            var s = _subs[id];
            if (!s) {
                s = {};
                _subs[id] = s;
            }
            
            // Validate publisher's event's hash.
            var e = s[type];
            if (!e) {
                e = {};
                s[type] = e;
            }
            
            // Validate publisher's event's listener's hash.
            var l = e[listener || ""];
            if (!l) {
                l = {};
                e[listener || ""] = l;
            }
            
            // Record the callback under either "methods" or "functions", depending on type.
            if (typeof(callback) === "function") {
                var fs = l.functions;
                if (!fs) {
                    fs = [];
                    l.functions = fs;
                }
                fs.push(callback);
            } else {
                // Assume callback is a String; a method name.
                var ms = l.methods;
                if (!ms) {
                    ms = {};
                    l.methods = ms;
                }
                ms[callback] = true;
            }
            
            // Performance optimization: To enable a reverse lookup, record a map from listener to publisher.
            var lmap = _listenerMap,
                pmap = lmap[listener || ""];
            if (!pmap) {
                pmap = {};
                lmap[listener || ""] = pmap;
            }
            var emap = pmap[id];
            if (!emap) {
                emap = {};
                pmap[id] = emap;
            }
            emap[type] = true;
            
            // Return a handle to this subscription to use for unsubscribing later.
            return {id: id, type: type, callback: callback, listener: listener};
        },
        
        /**
         * <p>Cancels a subscription created by calling the subscribe() method.</p>
         * 
         * @param {Object} sub The subscription object provided by the subscribe() call.
         */
        unsubscribe: function unsub(sub) {
            var s = _subs[sub.id],
                e = s && s[sub.type],
                l = e && e[sub.listener || ""];
            if (!l) {
                return;
            }

            var A = mstrmojo.array,
                H = mstrmojo.hash,
                tp = typeof(sub.callback),
                cleanupListener = false;
            if (tp === "function") {
                // Remove the callback from the functions array.
                var fs = l.functions;
                if (fs) {
                    A.removeItem(fs, sub.callback);
                    if (!fs.length) {
                        // If array now empty, remove it.
                        delete l.functions;
                        // If no callbacks remain, remove listener id.
                        if (H.isEmpty(l.methods)) {
                            cleanupListener = true;
                        }
                    }
                }
            } else {
                // Remove the callback from the methods hash.
                var ms = l.methods;
                if (ms) {
                    delete ms[sub.callback];
                    if (H.isEmpty(ms)) {
                        // If the hash is now empty, remove it.
                        delete l.methods;
                        // If no callbacks remain, remove listener id.
                        if (!l.functions || !l.functions.length) {
                            cleanupListener = true;
                        }
                    }
                }
            }
            // Did we remove the final callback from the listener?
            if (cleanupListener) {
                // Yes, now remove the listener id from the listeners hash.
                delete e[sub.listener || ""];
                // And if there are no more listeners for this event...
                if (H.isEmpty(e)) {
                    // Remove the listeners hash entirely for this event.
                    delete s[sub.type];
                }
            }
        },
        
        /**
         * <p>Determines if a specified object hasany listeners subscribed for a given event.</p>
         * 
         * @param {String} id The ID of the publishing object.
         * @param {String} type The name of the event.
         * 
         * @returns {Boolean} true if the object has at least one listener; false otherwise.
         */
        hasSubs: function hasSubs(id, type) {
            var s = _subs[id],
                evt = s && s[type];
            
            return !!evt;
        },
        
        /**
         * Clear all subscriptions for listeners of the component as well as any subscriptions the component has for other objects.
         * 
         * @param {String} listener The id of the component whose subscriptions should be cleared.
         */
        clearSubscriptions: function clr(listener) {
            if (!listener) {
                listener = "";
            }
            var sbs = _subs,
                _H = mstrmojo.hash;
            
            // Do we have anybody listening to this object?
            if (sbs[listener]) {
                // Delete the subscriptions to this object.
                delete sbs[listener];
            }
            
            // Is this object listening to anybody else?
            var pmap = _listenerMap[listener];
            if (pmap) {
                // Walk the event providers...
                for (var id in pmap) {
                    var es = sbs[id],
                        emap = pmap[id];
                    if (!es) {
                        continue;
                    }
                    // Walk the event names...
                    for (var e in emap) {
                        // Remove this listener from that event.
                        var ls = es[e];
                        if (!ls) {
                            continue;
                        }
                        delete ls[listener];
                        // If there are no remaining listeners for that event...
                        if (_H.isEmpty(ls)) {
                            // ...remove the listeners hash for that event entirely.
                            delete es[e];
                        }
                    }
                }
            }            
        }
    });
    mstrmojo.publisher.NO_SRC = "NO_SRC";
    mstrmojo.publisher.CONNECTIVITY_CHANGED_EVENT = "CONNECTIVITY_CHANGED";
    mstrmojo.publisher.RECONCILE_END_EVENT = "RECONCILE_END";
    
})();