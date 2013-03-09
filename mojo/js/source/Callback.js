(function(){

	mstrmojo.requiresCls("mstrmojo.registry");

	mstrmojo.Callback = mstrmojo.declare(
		// superclass
		null,
		
		// mixins
		null,

        /** 
         * @lends mstrmojo.Callback.prototype
         */
		{
			scriptClass: "mstrmojo.Callback",
			
		    /**
		     * <p>A Callback instance represents a function or object method to be called later.</p>
		     * 
		     * <p>The Callback instance can be defined without providing direct handles to the function
		     * and/or object, thereby avoiding any memory leak problems due to faulty garbage collection.</p>
		     * 
		     * @constructs
		     * 
		     * @param {Object|String} [context] context An optional context for the callback function.  The context can either be an
             * object or the id of an object in the registry.
             * @param {Function|String} func The callback function to be fired when data is published to the given topic.  If no
             * listener context is provided, "func" must be a function; otherwise, "func" may be a String identifying
             * a method on the context object.
             * 
             * @refactoring The optional parameter in this method should be last.
		     */
			init: function init_Callback(/*Object|String?*/ context, /*Function|String*/ func) {
				this.context = context;
				this.func = func;
			},
			
			/**
			 * Calls the callback function specified by the properties of this instance,
			 * passing along whatever arguments are passed into this method (if any).
			 * 
			 * @return The return value of the callback function, if any; otherwise undefined.
			 */
			fire: function fire(){
				
				// First resolve the context's current state.
				var c = this.context,
					f = this.func,
					obj;
				if (!c) {
					// No context given, use global context.
					obj = mstrmojo.global;
				} else if (typeof(c) == 'object') {
					obj = c;
				} else {	// typeof(c) == string or number
					obj = mstrmojo.all[c];
				}
				if (!obj) return undefined;
				
				// Then call the callback function on that context.
				if (typeof(f) == 'function') {
					return f.apply(obj, arguments || []);
				} else {	// callback is a named method
					return obj[f].apply(obj, arguments || []);
				}
			}
		}
	);

})();