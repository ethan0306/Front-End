(function(){

	mstrmojo.requiresCls("mstrmojo.array");

    /**
     * Not sure what this does.
     * @class
     */
	mstrmojo.CallbackList = mstrmojo.declare(
		// superclass
		null,
		
		// mixins
		null,
		
        /** 
         * @lends mstrmojo.CallbackList.prototype
         */
		{
			scriptClass: "mstrmojo.CallbackList",
			
			/**
			 * Internal array of mstrmojo.Callback instances to be called by this CallbackList's call() method.
			 */
			_calls: null,
						
			/**
			 * Appends an mstrmojo.Callback instance to this list.
			 * 
			 * @param {mstrmojo.Callback} callback The {@link mstrmojo.Callback} to add.
			 */
			add: function add(/*Object*/ callback) {
				if (!callback) return;
				if (!this._calls) this._calls = [];
				this._calls.push(callback);
			},
			
			/**
			 * Removes an mstrmojo.Callback instance from this list.
			 * 
             * @param {mstrmojo.Callback} callback The {@link mstrmojo.Callback} to remove.
			 */
			remove: function remove(/*Object*/ callback) {
				if (this._calls) {
					mstrmojo.array.removeItem(this._calls, callback);
				}
			},
			
			/**
			 * This method will fire the fire() method of every {@link mstrmojo.Callback}
			 * instance in this CallbackList.  The arguments passed in to this
			 * method (if any) will be passed along to the {@link mstrmojo.Callback}s.
			 */
			fire: function fire() {
				var arr = this._calls,
					args = arguments || [];
				
				for (var i = 0, cnt = arr && arr.length || 0; i < cnt; i++) {
				    var cb = this._calls[i];
				    cb.fire.apply(cb, args);
				}
			}
		}
	);
	
})();