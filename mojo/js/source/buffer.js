(function(){

	mstrmojo.requiresCls(
		"mstrmojo.registry"
	);

    /**
     * Not sure what this does.
     * 
     * @class
     */
    mstrmojo.buffer =
        /**
         * @lends mstrmojo.buffer
         */
        {
    		/**
    		 * Hashtable of calls that we are currently buffering.
    		 * @type Object
    		 */
    		_calls: {},
    	
    		/**
    		 * <p>Requests that a given function name be called after a certain amount of time.</p>
    		 * 
    		 * <p>If the given "context"
    		 * argument is null, then the function named is assumed to be global.  Otherwise, if the "context" is
    		 * non-null, the function is assumed to be a method on that context.  In that case, either the 
    		 * context object or its id string must be supplied.  If the object is given, it must have an id property; 
    		 * if the string is given, the object must be in mstrmojo.registry.</p>
    		 */
    		call: function buffercall(/*Object|String?*/ context, /*String*/ method, /*Integer*/ bufferSize) {
    			var hash = this._calls,
    				id = context ?
    					((typeof(context) == 'object') ? context.id : context) :
    					"__global__",
    				key = id+"-"+method;
    			if (!hash[key]) {
    				var info = hash[key] = {context: context, method: method};
    				info.timer = self.setTimeout(function(){ mstrmojo.buffer.callback(key); }, bufferSize);
    			}
    		},
    		
    		/**
    		 * 
    		 */
    		_callback: function callback(/*String*/ key) {
    			var hash = this._calls,
    				info = hash[key],
    				context = info && info.context,
    				obj = (typeof(context) == 'object') ? context : mstrmojo.all[context];
    			delete hash[key];
    			if (obj && obj[info.method]) obj[info.method]();
    		}
    	};
    		
})();