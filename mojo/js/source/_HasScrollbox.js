(function(){

	mstrmojo.requiresCls("mstrmojo.dom");

	/**
	 * Function to validate a listener parameter.
	 * 
	 * @private
	 * @ignore
	 */
	function validateListener(l) {
		return (l && l.id);
	}
	
    /**
     * <p>A mixin for widgets that contain a scrollbox.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._HasScrollbox = 
        /**
         * @lends mstrmojo._HasScrollbox#
         */
        {
            /**
             * Mixin Name
             */
            _mixinName: "mstrmojo._HasScrollbox",
            
            
			/**
			 * A hash of listeners for the scrollbox scroll event.
			 * @type Object
			 */
			scrollListeners: null,   // Warning: do not set to {} here; that will make it class-wide, not instance-wide.
			
			/**
			 * The number of listeners currently listening for the scrollbox scroll event.
			 * @type Integer
			 */
			scrollListenerCount: 0,
			
			/**
			 * Adds the given object as a listener to "scroll" events from the scrollboxNode
			 * of this widget.  The callback is assumed to be the listener's "onscroll" method,
			 * with only a single argument: a handle to this widget instance.
			 */
			connectScrollbox: function cnnScll(/*Object*/ listener) {
				if (!validateListener(listener)) {
					return;
				}
				
				// Add listener to list of previous listeners.
				// Initialize the list if null. 
				var hash = this.scrollListeners,
				    lid = listener.id;
				if (!hash) {
				    hash = {};
				    this.scrollListeners = hash;
				}
				if (!hash[lid]) {
    				hash[lid] = listener;
	       			this.scrollListenerCount++;
    				// If we had no previous listeners, attach a DOM listener to the scrollbox now.
    				if (this.scrollListenerCount == 1) {
    					this._attachScrollDom();
    				}
				}
			},

			disconnectScrollbox: function discnnScll(/*Object*/ listener) {
				if (!validateListener(listener)) {
					return;
				}
				
				// Remove listener from list of listeners.
				var hash = this.scrollListeners,
				    lid = listener.id;
                if (hash != null && lid in hash) {
				    delete this.scrollListeners[lid];
    				this.scrollListenerCount--;
    				// If we have no more listeners, detach DOM listener from the scrollbox for now.
    				if (!this.scrollListenerCount) {
    				    this._detachScrollDom();
    				}
                }
			},
            
			// TO DO: enhancement; if listener doesn't care about horiz-only
			// scrolling, don't notify them of it.
			notifyScrollListeners: function ntfSclls(evt) {
                // Remeasure (and recache) the current scroll position.
                // If it didn't change vertically, don't notify anyone.
			    var p = evt || this.getScrollPos(),
			        top = p.y,
			        left = p.x;
			    
			    this.scrollboxTop = top;
                this.scrollboxLeft = left;
				this.scrollboxRight = left + this.scrollboxWidth;
				this.scrollboxBottom = top + this.scrollboxHeight;
				
				// Notify all listeners via their "onscroll" method.
				var ls = this.scrollListeners;
				for (var id in ls) {
					ls[id].onscroll(this);
				}
			},
			
			getScrollPos: function getScrollPos() {
			    var node = this.scrollboxNode; 
			    return {
			        x: node.scrollLeft,
                    y:  node.scrollTop
			    };
			},
						
			scrollInterval: 50,

			_attachScrollDom: function attSbxDom() {
				// Do we have a DOM node to attach to?
				var sbn = this.scrollboxNode;
				if (sbn) {
                    // Does browser support touch?
				    var useTouch = this.usesTouches;
				    if (!useTouch) {
	                    // Initialize (or re-use) a callback to ourselves.
	                    if (!this.scrollCallback) {
	                        var id = this.id;
	                        this.scrollCallback = function(){
	                            mstrmojo.all[id].notifyScrollListeners();
	                        };
	                    }

	                    // Attach dom listener on the scroll box.
	                    mstrmojo.dom.attachBufferedEvent(sbn, "scroll", this.scrollCallback, this.scrollInterval);
					}
					    
					
					// Measure and cache the current scroll position.
					// Optimization: the Container using this mixin can skip the
					// measuring step by writing to the cache directly before making this
					// call.  If we support touch then use the value in the pos object.
					if (this.scrollboxTop === null) {
						this.scrollboxTop = (useTouch) ? 0 : sbn.scrollTop;
					}
					if (this.scrollboxLeft === null) {
						this.scrollboxLeft = (useTouch) ? 0 : sbn.scrollLeft;
					}
					
					var fnD = function (d) {
						var css = d.toLowerCase();
						// For performance, try reading the height from style before measuring it.
						// Assumes style is in "px". TO DO: support inches.
						var x = sbn.style[css];
						return (!isNaN(x) && x.charAt(x.length - 1) !== '%') ? parseInt(x, 10) : sbn['client' + d]; 
					};
					
					if (this.scrollboxHeight === null) {
						this.scrollboxHeight = fnD('Height');
					}
					if (this.scrollboxWidth === null) {
						this.scrollboxWidth = fnD('Width');
					}
					
					this.scrollboxBottom = this.scrollboxTop + this.scrollboxHeight;
					this.scrollboxRight = this.scrollboxLeft + this.scrollboxWidth;
					
					this._attachedScrollbox = sbn;
				}
			},
			
            _detachScrollDom: function dtchSbxDm() {
                var as = this._attachedScrollbox;
                if (as && this.scrollCallback) {
                    mstrmojo.dom.detachBufferedEvent(
                        as,
                        "scroll",
                        this.scrollCallback,
                        this.scrollInterval);
                }
                delete this._attachedScrollbox;
            },

            /**
			 * Local caches for the scrollTop and scroll bottom coordinates of the scrollbox which drives this
			 * rendering.  These caches are required by the implementation, but this implementation does not set
			 * the caches, it only reads from them.  The implementation assumes that the writing to caches is done
			 * outside of this mixin.
			 */
			scrollboxTop: null,
			scrollboxLeft: null,
			scrollboxHeight: null,
			scrollboxBottom: null,

			/**
			 * Extends the buildRendering method to add some post-processing for 
			 * pre-existing listeners to this scrollbox.  If the rendering has
			 * caused the scrollboxNode to change reference, then we must detach
			 * all pre-existing listeners from previous scrollbox node to current scrollbox node.
			 */
			buildRendering: function bldRndr() {
				// Do we have a scrollbox attached? If so, detach it because it will be replaced
                // by a new rendering.
				this._detachScrollDom();
				
				// Call the inherited method to render our dom...
				this._super();
				
				// Do we have any pre-existing listeners? If so attach the new scrollbox dom listener.
				if (this.scrollListenerCount) {
					this._attachScrollDom();
				}
			}		
			
			// TO DO: call detachBufferedEvent from a destroy() method.					
	};
	
})();