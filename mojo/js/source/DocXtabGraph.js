/*global mstrmojo:false, window:false, document:false */

(function(){

    mstrmojo.requiresCls("mstrmojo.GraphBase",
		"mstrmojo._Formattable",
		"mstrmojo._HasWaitIcon",
                         "mstrmojo._IsSelectorTarget",
                         "mstrmojo.tooltip");

    var $D = mstrmojo.dom;
	/**
	 * Utility function to set the graph height to the height of the rwunit minus the height of the titlebar.
	 * 
	 * @param {mstrmojo.DocXtabGraph} w The graph widget.
	 */
	function adjustGraphHeight(w) {
		var f = w.getFormats();
		if (!f.width && 'gp' in f){
			f = f.gp;
		}
		w.resizeForDisplayState(parseInt(f.height, 10), parseInt(f.width, 10), false);
	}
	
	function _getEventPos(e) {
		var d = ('layerX' in e) ? 'layer' : 'offset';
		return {
			x: e[d + 'X'], 
			y: e[d + 'Y']
		};
	}
	
	/**
	 * <p>The widget for a single MicroStrategy Report Services Graph control.</p>
	 * 
	 * @class
     * @extends mstrmojo.GraphBase
	 * 
	 * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
	 * @borrows mstrmojo._Formattable#getFormats as #getFormats
	 * 
	 * @borrows mstrmojo._IsSelectorTarget#setDirty as #setDirty
	 */
	mstrmojo.DocXtabGraph = mstrmojo.declare(
		// superclass
        mstrmojo.GraphBase,
		
		// mixins,
		[mstrmojo._Formattable, mstrmojo._HasWaitIcon, mstrmojo._IsSelectorTarget],
		
		/** 
		 * @lends mstrmojo.DocXtabGraph.prototype
		 */
		{
			scriptClass: "mstrmojo.DocXtabGraph",
			
            cssClassPrefix: "mstrmojo-DocXtabGraph",
            
			areaMarkup: '<area shape="{@shape}" coords="{@coords}" ttl="{@tooltip}" aid="{@aid}" onmousedown="mstrmojo.all[\'{@id}\'].onClickArea(this, event);" onmousemove="mstrmojo.all[\'{@id}\']._updateTooltip(event, self);" {@extra}/>',
			
			_att: '',
			
			markupSlots: {
				imgNode: function(){ return this.domNode.childNodes[1]; },
				mapNode: function() {return this.domNode.childNodes.length > 2 ? this.domNode.childNodes[2] : null;},
				textNode: function() { return this.domNode.firstChild; }
			},
		
			formatHandlers: {
				domNode: [ 'RW', 'B', 'background-color', 'fx' ]
			},
			
			markupMethods: {
				onvisibleChange: function(){ this.domNode.style.display = (this.visible) ? 'block' : 'none'; }
			},  
			
			onClickArea: function onClickArea(elem, e) {
				e = e || window.event;

				var ep = _getEventPos(e),
					defn = this.defn;
				
				this.model.slice({
					type: parseInt(defn.t, 10) || mstrmojo.EnumRWUnitType.GRAPH,
					src: this.k,
					ck: defn.ck,
					gk: this.k, 
					tks: this.as[elem.getAttribute('aid')].tks,
					cks: this.as[elem.getAttribute('aid')].cks,
                    sid: this.node.data.sid,
					x: ep.x,
					y: ep.y
				});
			},
			showTooltip: function showTooltip(e, win) {
				this._updateTooltip(e, win);
				this._super(e, win);
			},
			
			/**
			 * Positions tooltip correctly according to current slider's position and style (horizontal/vertical).
			 * Updates tooltip content to current selection.
			 * 
			 * @private
			 */
			_updateTooltip: function _updateTooltip(evt, win) {
                this.updatingTooltipHelper($D.eventTarget(win, evt), _getEventPos(evt));
            },
            
			hideTooltip: function hideTooltip(e, win) {
                var elem = $D.eventTarget(win, e);
                if (elem.getAttribute('aid') === this.cAreaIdx) {
					// reset current focused area index to -1, since un-focus current area
                    this.cAreaIdx = -1;   
					
					// hide tooltip
					this._super(e, win);
				}
			},

			/**
			 * Updates the DocXtabGraph data that may change due to a selector action.
			 * 
			 * @param {Object} node The widget node.
			 * @ignore
			 */
			update: function update(node) {
			    this.node.data = node.data;
				// Grab the tooltip and selector areas.
				this.as = node.data.as;
				
                // Update target keys based on control group bys.
				var sep = '\u001E',
					m = this.model,
					cgbm = m.getCGBMap && m.getCGBMap(),
                    as = this.as || [],
                    i, j;
                
                for (i = 0; i < as.length; i ++) {
					var a = as[i],
						cgb = a && a.tgbs;
					if (cgb) {
						var cgbs = cgb.split(sep);
						var keys = {};
                        for (j = 0; j < cgbs.length; j ++) {
							var k = cgbm && cgbm[cgbs[j]];
							if (k) {	// control key
								keys[k] = true;
							} else {	// target key
								keys[cgbs[j]] = true; 
							}
						}
						a.tks = mstrmojo.hash.keyarray(keys).join(sep);
					}
				}
				
				// Grab the empty graph descriptor.
				this.eg = node.data.eg;
            },
            
            /**
             * Retrieves graph image source from server.
             * 
             * @param {Integer|String} h The height of the requested graph image.
             * @param {Integer|String} w The width of the requested graph image.
             */
            retrieveGraphSrc: function retrieveGraphSrc(h, w) {
                // Create graph source URL.
                var src = mstrConfig.taskURL + '?taskId=getRWGraphImage&taskEnv=xhr&__ts__=' + (new Date().getTime()) + '&messageID=' + this.model.mid + '&nodeKey=' + this.k + '&sliceID=' + parseInt(this.node.data.sid, 10) + '&imgType=4' + '&width=' + parseInt(w, 10) + '&height=' + parseInt(h, 10) + '&sessionState=' + mstrApp.sessionState,
                    imgNode = this.imgNode;
                
                // Is the src different from the original source?
                if (imgNode.src !== src) {
                    // Set new src.
                    imgNode.src = src;
                }
			},
			
			resize: function () {
				adjustGraphHeight(this);				
			},

			/**
             * Called when the graph dimensions change due to user interaction with the title bar.
			 * 
			 *  @param {Integer} h The height of the available image space.
             *  @param {Integer} w The width of the available image space.
			 *  @param {Boolean} [doDom] Indicates whether to resize/reposition the domNode as well as the imgNode.
			 */
			resizeForDisplayState: function resizeForDisplayState(h, w, doDom) {
                var f = this.getFormats(),
                    imgNode = this.imgNode;
                
				// Does the domNode position/size need to be adjusted?
				if (doDom) {
					var dns = this.domNode.style;
					
					// Size and reposition domNode.
					dns.top = f.top;
					dns.left = f.left;
					dns.height = f.height;
					dns.width = f.width;
				}
				
				// The height of the graph is fixed (due to the title bar) so we need to manually adjust it.
                if (imgNode) {
                    imgNode.style.height = h + 'px';
				}

                // Do we have a valid graph?
                if (!this.eg) {
                    // Load a newly sized image.
                    this.retrieveGraphSrc(h, w);
					if (h) {
                        this.refreshMap();
                    }
                }
            }
		}
	);
	
}());