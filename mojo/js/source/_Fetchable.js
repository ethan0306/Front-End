(function() {
	mstrmojo._Fetchable = mstrmojo.provide(
			'mstrmojo._Fetchable',
			{
				_mixinName: 'mstrmojo._Fetchable',
				/**
				 * Block begin. When just finished retrieving data, this is the block of current item. Before retrieving data, set this to next blocks begin.
				 */
				blockBegin: 1,
				/**
				 * Block count. How many items to retrieve.
				 */
				blockCount: -1,
				/**
				 * Whether to concatenating all blocks. Default to false.
				 */
				concat: false,
				/**
				 * Items of current block when 'concat' to false. Items of all retrieved items, if 'concat' is true.
				 */
				items: null,
				/**
				 * Returns the size of the current list
				 */
				size: function size() {
					return this.items == null ? 0 : this.items.length;
				},
				/**
				 * Returns the size of the whole list.
				 */
				totalSize: function totalSize() {
					return this.totalSize;
				},
				/**
				 * Retrieve the next block of items.
				 * @param callbacks The callbacks will be invoked when this method finishes getting elements.
				 * 
				 * callbacks is expected in this structure:
				 * {
				 *  // me is a reference back to this _Fetchable object
				 * 	success: function(me) {...}
				 *  failure: function(res) {...}
				 * }
				 */
				next: function(callbacks) {
					// @TODO should we check hasNext(), if not, what to do?
					if (this.hasNext()) {
						this.getItems(this.blockBegin + this.blockCount, callbacks);
					}
					// else {} ??????
				},
				/**
				 * Retrieve the previous block of items.
				 * @param callbacks The callbacks will be invoked when this method finishes getting elements.
				 * 
				 * callbacks is expected in this structure:
				 * {
				 *  // me is a reference back to this _Fetchable object
				 * 	success: function(me) {...}
				 *  failure: function(res) {...}
				 * }
				 */
				previous: function(callbacks) {
					// @TODO should we check hasPrevious(), if not, what to do?
					if (this.hasPrevious()) {
						var bb = this.blockBegin - this.blockCount;
						bb = bb < 0 ? 0 : bb;
						this.getItems(bb, callbacks);
					}
					// else {}??????????
				},
				/**
				 * Returns items start from the blockbegin (parameter 'bb'), and when items retrieved,
				 * callbacks will be invoked.
				 * 
				 * @param callbacks The callbacks will be invoked when this method finishes getting elements.
				 * callbacks is expected in this structure:
				 * {
				 *  // me is a reference back to this _Fetchable object
				 * 	success: function(me) {...}
				 *  failure: function(res) {...}
				 * }
				 */
				getItems: function(bb, callbacks){
                    callbacks = callbacks || {};
					var me = this,
					    fnEmpty = mstrmojo.emptyFn,
					    fnSuccess = callbacks.success || fnEmpty,
					    fnFail = callbacks.failure || fnEmpty;
					
					this._retrieveItems(bb, {
						// res has 'items'
						success: function(res){
							me.blockBegin = bb;
							// using setter, so any registered listener would be notified
							me.set('items', (me.concat? (me.items || []).concat(res.items) : res.items));
							if (res.totalSize) {
								me.totalSize = res.totalSize;
							}
							fnSuccess(me, res.items);
						},
						failure: function(res){
						    fnFail(res);
						}
					});
				},
				/**
				 * Any object which would mixin this mixin should implement this method to 
				 * perform action to retrieve the content.
				 */
				_retrieveItems: function() {
					alert("Object which mixes in this mixin has not implemented this method - _retrieveItems().");
				},
				/** 
				 * Returns whether there is next item to browse.
				 */
				hasNext: function() {
					return (((this.concat? 1 : this.blockBegin) + (this.items && this.items.length || 0)) < (this.totalSize + 1));
				},
				/**
				 * Returns whether there is previous item to browse.
				 */
				hasPrevious: function() {
					return this.blockBegin > 1;
				}
			}
	);
})();