(function () {

	mstrmojo.requiresCls("mstrmojo.Container",
	                     "mstrmojo._Formattable",
		                 "mstrmojo._HasBuilder",
		                 "mstrmojo._CanMeasureChildren",
		                 "mstrmojo._CanRenderDocOnScroll");
	
	/**
	 * The widget for a single MicroStrategy Report Services document layout.
	 * 
	 * @class
	 * @extends mstrmojo.Container
	 * 
	 * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
	 * @borrows mstrmojo._Formattable#getFormats as #getFormats
	 * 
	 * @borrows mstrmojo._HasBuilder#postBuildRendering as #postBuildRendering
	 * @borrows mstrmojo._HasBuilder#buildChildren as #buildChildren
	 * 
	 * @borrows mstrmojo._CanMeasureChildren#height as #height
	 * @borrows mstrmojo._CanMeasureChildren#width as #width
	 * 
	 * @borrows mstrmojo._CanRenderDocOnScroll#renderBlockSize as #renderBlockSize
	 * @borrows mstrmojo._CanRenderDocOnScroll#renderMode as #renderMode
	 * @borrows mstrmojo._CanRenderDocOnScroll#renderChildren as #renderChildren
	 * @borrows mstrmojo._CanRenderDocOnScroll#onscroll as #onscroll
	 * @borrows mstrmojo._CanRenderDocOnScroll#showRenderStatus as #showRenderStatus
	 * @borrows mstrmojo._CanRenderDocOnScroll#_startScrollThread as #_startScrollThread
	 * @borrows mstrmojo._CanRenderDocOnScroll#_renderSubsectionsToScroll as #_renderSubsectionsToScroll
	 */
	mstrmojo.DocLayout = mstrmojo.declare(
		// superclass
		mstrmojo.Container,
		
		// mixins,
		[mstrmojo._Formattable, mstrmojo._HasBuilder, mstrmojo._CanMeasureChildren, mstrmojo._CanRenderDocOnScroll],
		
		/**
		 * @lends mstrmojo.DocLayout.prototype
		 */
		{
			scriptClass: "mstrmojo.DocLayout",

			markupString: '<div id="{@id}">' +
							  '<div class="mstrmojo-DocLayout {@cssClass}" style="{@domNodeCssText}"></div>' +
						  '</div>',
							
			markupSlots: {
				containerNode: function () { return this.domNode.firstChild; },
				popupNode: function () { return this.domNode.firstChild; }
			},
			
			formatHandlers: {
				domNode: [ 'B', 'background-color', 'D', 'min-height', 'width' ]
			},

			alias: 'docLayout',
			markupMethods: {
				onminHeightChange: function () {
					var mh = this.minHeight;
					if (!mh) {
						var fmts = this.getFormats();
						mh = fmts && fmts['min-height'];
					}
					if (mh) {
						this.containerNode.style[mstrmojo.css.MINHEIGHT] = mh;
					}
				}
			},
			
			getHeight: function getHeight() {
			    var h = 0;

			    // Iterate children (sections) to get the sum of their heights.
			    mstrmojo.array.forEach(this.children, function (child) {
			        h += child.height();
			    });

			    // Last resort, measure.
			    return h || this.containerNode.offsetHeight;
			},

			getWidth: function getWidth() {
				// #497635, #501685, #502227
				var children = this.children;
				return (children && children.length) ? children[0].width() : this.containerNode.offsetWidth;
			},			

			preBuildRendering: function preBuildRendering() {
				var f = this.getFormats();
				
				// Is the document in auto-width mode?
				if (f && f['min-width'] !== undefined) {
					// Is so we need to copy the min-width value to the width property so the initial width will be correct.
					f.width = f['min-width'];
				}
				
				this._super();
			},

			/**
			 * Adjust the width of the containerNode to account for any 'Fit to Content' objects.
			 * 
			 * @ignore
			 * @see mstrmojo.Container
			 */
			renderChildren: function renderChildren() {
				this._super();
				
				this.resizeOrReposition();
			},
			
			/**
			 * Resizes the layout to fit it's contents.
			 * 
			 * @ignore
			 */
			resizeOrReposition: function resizeOrReposition() {
			    var containerNode = this.containerNode;
			    
				// Does this layout support auto width?
				if (!!this.defn.aw) {
					// Get collection of autu width (fit to content) widgets.
					var aws = this.model.getAutoWidthIDs(),
						len = (aws && aws.length) || 0,
						mx = 0,			 // Right most position.
						all = mstrmojo.all,
						i;
					
					// Are there zero auto width (fit to content) widgets?
					if (!len) {
						// Nothing to do.
						return;
					}

					// Iterate fit to content widgets.
					for (i = 0; i < len; i++) {
						// Calculate the right most posotion for this widget. 
						var w = all[aws[i]];
						mx = Math.max(parseInt(w.getFormats().left, 10) + w.domNode.offsetWidth, mx);
					}
					
					// Adjust calculated maximum value for layout minimum value.
					mx = Math.max(this.getLayoutMinWidth(), mx);
	
					// Is the right most position of fit the fit to content widgets greater than the current width?
					if (mx > parseInt(this.getFormats().width, 10)) {
						// Set right most position as the width.
						containerNode.style.width = mx + 'px';
					}
				}
				
				// Are we on a mobile device and is zoom set to fit to width (1) OR fit to page (2)?
				var zoomToFit = this.model.zt;
				if (mstrApp.isMobile && zoomToFit) {
				    
				    // Does the parent have a domNode?
					var viewerNode = this.parent.domNode;
					if (viewerNode) {
					    
					    // Calculate margins.
					    var vh = this.parent.getHeight(),
					        vw = this.parent.getWidth(),
					        lh = this.getHeight(),
					        lw = this.getWidth(),
					        mv = (zoomToFit === 1) ? 0 : Math.round((vh > lh) ? (vh - lh) / 2 : 0) + 'px', // fit to page should be vertically centered.
					        mh = Math.round((vw > lw) ? (vw - lw) / 2 : 0) + 'px';                         // horizontally center.
	                    
	                    // Apply calculated margins.					    
	                    containerNode.style.margin = mv + ' ' + mh;
					}
				}
			},
			
			/**
			 * Returns the minimum layout width (in pixels).
			 * 
			 * @type Integer
			 */
			getLayoutMinWidth: function getLayoutMinWidth() {
				return 0;
			},			
			
			/**
			 * Adjust the width of the containerNode to account for any 'Fit to Content' objects.
			 * 
			 * @ignore
			 * @see mstrmojo._CanRenderDocOnScroll
			 */
			renderCtrlsInViewport: function renderCtrlsInViewport() {
				this._super();

				this.resizeOrReposition();
			},
			
			/**
			 * Adjust mstrmojoDocLayout containerNode once the given widget width get changed
			 * @param {Widget} w the 'Fit to Content' widget object
			 */
			adjustAutoWidth: function adjustAutoWidth(w) {
				// Does the layout NOT support auto widths?
				if (!this.defn.aw || !w) {
					// Nothing to do.
					return;
				}
				
				// Calculate the right most position for this widget.
				var mx = parseInt(w.getFormats().left, 10) + w.domNode.offsetWidth,
					cs = this.containerNode.style,
					wd = parseInt(cs.width, 10) || 0;	   // Current width of the layout.

				// Is the right most position of the widget greater than the current width of the layout?
				if (mx > wd) {
					// Apply right most position as the width of the layout.
					cs.width = mx + 'px';
				}
				
			},
			// override _getModelChildNodes in _CanRenderDocOnScroll to skip fixed header and footer
			_getModelChildNodes: function _getModelChildNodes(node, isPartial, start, count, includeTotal) {
				// cache ?????????????
				// first get all children
				var nds = this.model.getNonFixedSections(node, isPartial);
				
				// now process start, count, includeTotal parameters
				var len = nds.length;
				
				count = isNaN(count) ? len : count; 
				start = start || 0;
				
				if (start > 0 || count < len) {
					nds = nds.slice(start, start + count);
				}
				
				return includeTotal ? {
				    nodes: nds, 
				    total: len
				} : nds;
			},
			// override getChildren in _HasBuilder to omit skip header and footer
			getChildren: function getChildren(node, isPartial, start, count, includeTotal) {
				return this._getModelChildNodes(node || this.node, isPartial || false, start, count, includeTotal);
			},
			preserveChildDomOrder: false
			
		}
	);
	
}());