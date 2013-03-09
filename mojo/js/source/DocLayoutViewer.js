(function(){

	mstrmojo.requiresCls("mstrmojo.Container",
						 "mstrmojo._HasScrollbox",
						 "mstrmojo._HasLayout",
						 "mstrmojo._ShowsStatus");
	

	function getDimension(dimension) {
	    var domNode = this.domNode,
	    x = parseInt(this[dimension.toLowerCase()], 10);

	    return (isNaN(x)) ? domNode['offset' + dimension] : x;
	}	
	
	/**
	 * The widget for the MicroStrategy Report Services Layout Viewer.
	 * 
	 * @class
	 * @extends mstrmojo.Container
	 * 
	 * @borrows mstrmojo._HasScrollbox#scrollListeners as #scrollListeners
	 * @borrows mstrmojo._HasScrollbox#scrollListenerCount as #scrollListenerCount
	 * @borrows mstrmojo._HasScrollbox#connectScrollbox as #connectScrollbox
	 * @borrows mstrmojo._HasScrollbox#disconnectScrollbox as #disconnectScrollbox
	 * @borrows mstrmojo._HasScrollbox#notifyScrollListeners as #notifyScrollListeners
	 * @borrows mstrmojo._HasScrollbox#scrollInterval as #scrollInterval
	 * @borrows mstrmojo._HasScrollbox#scrollboxTop as #scrollboxTop
	 * @borrows mstrmojo._HasScrollbox#scrollboxLeft as #scrollboxLeft
	 * @borrows mstrmojo._HasScrollbox#scrollboxHeight as #scrollboxHeight
	 * @borrows mstrmojo._HasScrollbox#scrollboxBottom as #scrollboxBottom
	 *
	 * @borrows mstrmojo._HasLayout#height as #height
	 * @borrows mstrmojo._HasLayout#width as #width
	 * @borrows mstrmojo._HasLayout#layoutConfig as #layoutConfig
	 * @borrows mstrmojo._HasLayout#onwidthChange as #onwidthChange
	 * @borrows mstrmojo._HasLayout#onheightChange as #onheightChange
	 * @borrows mstrmojo._HasLayout#setSlotDimension as #setSlotDimension
	 */
	mstrmojo.DocLayoutViewer = mstrmojo.declare(
		// superclass
		mstrmojo.Container,
		
		// mixins,
		[mstrmojo._Formattable, mstrmojo._HasScrollbox, mstrmojo._HasLayout, mstrmojo._ShowsStatus],
		
		/**
		 * @lends mstrmojo.DocLayoutViewer.prototype
		 */
		{
			scriptClass: "mstrmojo.DocLayoutViewer",
			
			markupString: '<div id="{@id}" class="mstrmojo-DocLayoutViewer {@cssClass}" style="{@domNodeCssText}">' +
							'<div></div>' +
							'<div>' +
								'<div class="mstrmojo-progress" style="display:none">' +
									'<div class="mstrmojo-progress-barbg">' +
										'<div class="mstrmojo-progress-bar"></div>' +
									'</div>' +
									'<div class="mstrmojo-progress-text"></div>' +
								'</div>' +
								'<div id="{@id}_fh"></div>' + // fixed header
								'<div id="{@id}_scrollboxNode" class="mstrmojo-DocLayoutViewer-layout" style="{@_scrollCssText}"></div>' +
								'<div id="{@id}_ff"></div>' + // fixed footer
							'</div>' +
							'<div></div>' +
						  '</div>',
						
			markupMethods: {
				onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block' : 'none'; },
				onborderChange: function(){ if (this.border) { this.domNode.style.border = this.border; }}
			},
			
			markupSlots: {
				groupBy: function(){ return this.domNode.firstChild; },
				layout: function() { return this.domNode.childNodes[1].childNodes[2]; },
				scrollboxNode: function() { return this.domNode.childNodes[1].childNodes[2]; },
				containerNode: function() { return this.domNode.childNodes[1].childNodes[2]; },
				incFetchNode: function() { return this.domNode.lastChild; },
				fixedHeaderNode: function() {return this.domNode.childNodes[1].childNodes[1]; },
				fixedFooterNode: function() {return this.domNode.childNodes[1].childNodes[3]; },
				
				_STATUS: function(){ return this.domNode.childNodes[1].firstChild; },
				_STATUS_TXT: function(){ return this.domNode.childNodes[1].firstChild.lastChild; },
				_STATUS_BAR: function(){ return this.domNode.childNodes[1].firstChild.firstChild.firstChild; }
			},
			
			layoutConfig: {
				h: {
					groupBy: 'auto',
					fixedHeaderNode: 'auto',
					layout: '100%',
					fixedFooterNode: 'auto',
					incFetchNode: 'auto'
				},
				w: {
					layout: '100%'
				}
			},

			// These values are always fixed.
			scrollboxHeightFixed: true,
			scrollboxWidthFixed: true,
			
			//We are trying to retrieve a cached value in order to improve performance
			getHeight: function getHeight() {
			    return getDimension.call(this, 'Height');
			},

			//We are trying to retrieve a cached value in order to improve performance
			getWidth: function getWidth() {
			    return getDimension.call(this, 'Width');
			},   
            
			/**
			 * Custom handler to incrementally render after a layout has taken place.
			 * 
			 * @ignore
			 */
			afterLayout: function afterLayout() {
				this._super();

				// Notify the scroll listeners to start rendering.
				this.notifyScrollListeners();
			},
			
			preBuildRendering: function preBuildRendering() {
				// We need to manually extract the height and width from the parent slot because the DocLayoutViewer is added to the Doc after 
				// the Doc has rendered so _HasLayout did not get a chance to do this for us.
				// Check for parent to handle cases where we are rendering a layout outside of the document (e.g. map info windows)
				if ( this.parent ) {
					var p = this.parent[this.slot].style,
						h = this.height,
						w = this.width;
					
					this.height = (h !== 'auto') ? h : p.height;
					this.width = (w !== 'auto') ? w : p.width;
				}
				
				// set Zoom factor
				this.zf = this.model.zf;
				this.bs = this.model.bs;
				
				// adjust height and min-height on DocLayout, since we pulled fixed headers and footers out, we need to adjust DocLayout's height to deduct those heights
//				var ch = this.children,
//					i,
//					layout = null,
//					fixSecHeight = 0;
//				for (i = 0; i < ch.length; i ++) {
//					var c = ch[i];
//					if (c.slot === 'fixedHeaderNode' || c.slot === 'fixedFooterNode') {
//						fixSecHeight += (c.height && c.height()) || 0;
//					} else if (c.slot === 'layout') {
//						layout = c; // cache for later to adjust its heights
//					}
//				}
//				// we need to adjust heights
//				if (fixSecHeight && layout) {
//					var fmts = layout.defn.fmts;
//					if (fmts.height && !fmts.orgHeight) {
//						fmts.orgHeight = fmts.height;
//						fmts.height = Math.max(parseInt(fmts.height, 10) - fixSecHeight, 0) + 'px;';
//					}
//					if (fmts['min-height'] && !fmts.orgMinHeight) {
//						fmts.orgMinHeight = fmts['min-height'];
//						fmts['min-height'] = Math.max(parseInt(fmts['min-height'], 10) - fixSecHeight, 0) + 'px;';
//					}
//					if (layout.minHeight && layout.orgMinHeight){
//						layout.node.data.orgMh = layout.node.data.mh;
//						layout.orgMinHeight = layout.minHeight;
//						layout.minHeight = layout.node.data.mh = Math.max(node.data.mh - fixSecHeight, 0);
//					}
//				}

				
				return this._super ? this._super() : true;
			},
			setSlotDimensions: function setSlotDimensions(slot, h, w) {
				// Is this the layout slot?
				if (slot === 'layout') {
					// Cache the height and width for use by the _CanRenderDocOnScroll mixin.
					// NOTE: theoretically, h or w could be undefined, but in the case of a doc layout viewer that should never happen,
					// so we don't need to test for undefined.
					this.scrollboxHeight = parseInt(h, 10);
					this.scrollboxWidth = parseInt(w, 10);
				}
				
				this._super(slot, h, w);
			}			
		}
	);
	
}());