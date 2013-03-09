(function(){

	/**
	 * <p>A mixin that enables Containers to render their children in "blocks" at a time, with a pause (interval) in between blocks.</p>
	 * 
	 * <p>This mixin simulates the experience of "backgound" rendering.  This mixin's functionality is enabled when the Container's "renderMode" 
	 * property is set to "background".  If the renderMode is not "background", this mixin defaults to the rendering mechanism inherited from the Container.</p>
	 * 
	 * @class
	 * @public
	 */
	mstrmojo._CanRenderChildrenInBground = 
	    /**
	     * @lends mstrmojo._CanRenderChildrenInBground#
	     */
    	{
    		/**
    		 * The length (in milliseconds) of pausing intervals in between each block of
    		 * background child rendering.
    		 */
    		renderPause: 100,
    
    		/**
    		 * Boolean is true while background rendering is still in progress.
    		 */
    		renderingChildren: false,
    		
    		/**
    		 * Internal handle to the javascript timer that is executing this "thread" of
    		 * background rendering.  If the background rendering has not started yet, or has finished,
    		 * _renderTimer will be null.  Otherwise, _renderTimer will be non-null while the
    		 * background rendering is in progress.  The background rendering can be stopped by calling
    		 * this.clearInterval(this._renderTimer).
    		 */
    		_renderTimer: null,
    
    		/**
    		 * Limit on the number of children which are rendered at a time. If zero, no limit is applied.
    		 * If the number of children to render exceeds the limit, a timeout is used to pause execution
    		 * and then resume the rendering of children.  This creates the illusion of "background" rendering,
    		 * because during timeout the browser is not locked up and the end-user can interact with it.
    		 */
    		renderBlockSize: 4,
    		
    		/**
    		 * Renders a block of child widgets at once.  The actual rendering
    		 * is delegated to another method ("_renderNextChildrenInBground"). This method is responsible
    		 * for calling that method and then possibly setting up a timeout to call that
    		 * method again, if that method does not finish processing all children.
    		 */
    		renderChildren: function rndrChBg() {
    			if (this.renderMode == "background") {
    				var bFinished = this._renderBackgroundBlock();
    				if (!bFinished) {
    					this.renderingChildren = true;
    					var me = this;
    					this._renderTimer = self.setInterval(
    											function(){
    												if (me._renderBackgroundBlock()) {
    													me.renderingChildren = false;
    													self.clearInterval(me._renderTimer);
    													delete me._renderTimer;
    													me = null;
    												}
    											},
    											this.renderPause
    										);
    				}
    			} else {
    				this._super();
    			}
    		},
    
    		/**
    		 * Walks the children of this widget, asking unrendered ones to render.
    		 * The "renderBlockSize" property is applied to limit the # of children
    		 * that we'll ask to render in a single walk.  If no children remain unrendered,
    		 * returns true; otherwise returns false.
    		 */
    		_renderBackgroundBlock: function rndrBgBlock() {
    			// Build 2 lists of all children ready to be rendered, visible & hidden.
    			var ch = this.children,
    				vis = [],
    				hidden = [];
    			for (var i=0,len=ch&&ch.length||0; i<len; i++) {
    				var c = ch[i];
    				if (this._childReadyCheck_Bg(c)) {
    					if (c.visible) {
    						vis.push(c)
    					} else {
    						hidden.push(c);
    					}
    				}
    			}			
    			// Now join the lists together, with visible children going first before hidden children,
    			// so that they get higher rendering priority, and ask all list members to render.
    			// Limit the # of render calls according to renderBlockSize property.
    			var arr = vis.concat(hidden),
    				count = arr.length,
    				max = this.renderBlockSize || 0,
    				stop = max ? Math.min(max,count) : count;
    			for (var j=0; j<stop; j++) {
    				arr[j].render(null);
    			}
    			// Did we render every child that was ready?
    			return !count || (count <= max);
    		},
    
    		/**
    		 * Overwrites the method inherited from Container in order to avoid rendering
    		 * newly added children if this.renderingChildren.  If we are in the middle of background rendering,
    		 * we don't need to call children's render() because the background thread will do it eventually.
    		 */
    		childRenderOnAddCheck: function childRndrOnAddChk(/*Array*/ children) {
    			if ((this.renderMode == "background") && this.renderingChildren) {
    				return;
    			}
    			this._super(children);
    		}
    		
    	};
})();