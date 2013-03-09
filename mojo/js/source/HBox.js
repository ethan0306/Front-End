(function(){

	mstrmojo.requiresCls("mstrmojo.Container");
	
	
	/**
	 * The prefix to use when designating new slots.
	 * 
	 * @const
	 * @private
	 * @ignore
	 */
	var PREFIX = "slot";
	
	/**
	 * A container for laying children out in a single horizontal row.
	 * @class
	 * 
	 * @extends mstrmojo.Container
	 */
	mstrmojo.HBox = mstrmojo.declare(
		// superclass
		mstrmojo.Container,
		
		// mixins,
		null,
		
		/**
		 * @lends mstrmojo.HBox.prototype
		 */
		{
			scriptClass: "mstrmojo.HBox",
			
			cellCssClass: "",
			
			cellSpacing: 0,
			
			cellPadding: 0,
						
			markupString: '<table id="{@id}" class="mstrmojo-HBox {@cssClass}" style="{@cssText}" cellspacing="{@cellSpacing}" cellpadding="{@cellPadding}">{@colHTML}<tr>{@tableHtml}</tr></table>',
			
			colHTML: '',

			markupSlots: {
				containerNode: function() { return this.domNode.rows[0]; }
			},
			
			markupMethods: {
				onvisibleChange: function() { this.domNode.style.display = this.visible ? mstrmojo.css.DISPLAY_TABLE : 'none'; }
			},

			/** 
			 * Extends the rendering cycle by populating the tableHtml property with an HTML markup
			 * string that contains a table cell for each child present at render-time.  Each child is
			 * assigned a table cell as its slot.
			 */ 
			buildRendering: function bldRn() {
				// Build the tableHtml string property.
				this.tableHtml = '';
				var t = [],
					ch = this.children,
					len = (ch && ch.length) || 0,
					i;
				
				if (len) {
					var counter = 0,
						css = this.cellCssClass ?
								' class="mstrmojo-HBox-cell ' + this.cellCssClass + '" ' :
								'',
						tdHtml = '<td ' + css + '></td>';
					for (i=0; i<len; i++) {
						t[counter++] = tdHtml;
						ch[i].slot = PREFIX+i;
					}
					this.tableHtml = t.join('');
				}				

				// Call the inherited method to do the DOM construction.				
				this._super();				
				
				// Add the newly generated cells as slots.  This must be done
				// before renderChildren() is called in postBuildRendering, so that
				// the slots are ready to receive the children's DOM nodes.
				if (len) {
					var slots = {},
						tds = this.containerNode.cells;
					for (i=0; i<len; i++) {
						slots["slot"+i] = tds[i];
					}
					this.addSlots(slots);
				}
			},
			
			addChildren: function addChild(widget, idx, silent) {
				if (!widget) {
					return widget;
				}
				
				// Calculate the index (if not supplied).
				if (idx === undefined || isNaN(idx) || idx < 0) {
				    var ch = this.children;
					idx = (ch && ch.length) || 0;
				}
				
				var i = 0,
				    cnt;
				
				// If an array of children we need to iterate...
				if (widget.constructor === Array) {
					for (i = 0, cnt = widget.length; i < cnt; i++) {
						widget[i].slot = PREFIX + (idx + i);
					}
				} else {
					// Otherwise, just do it once.
					widget[i].slot = PREFIX + idx;
				}
				
				// Add the child widget(s).
				return this._super(widget, idx, silent);
			},
			
			/**
			 * Overwrites the inherited childRenderCheck from Container to support
			 * rendering children whose slot = "slot<#>" even if no such slot is defined yet.
			 * For such children, the slot will be created dynamically on-demand.
			 */
			childRenderCheck: function childRndrChk(/*Object*/ child) {
				if (child && !child.hasRendered) {
					var slotName = child.slot || this.defaultChildSlot;
					return !!this[slotName] || slotName.match(/^slot[\d]+$/);
				}
				return false;
			},
			
			onchildRenderingChange: function chRnChg(/*Event|Widget*/ obj) {
				var child = (obj && obj.src) || obj,
					d = child && child.domNode;
				
				if (d) {
					// What is the slot name of the child?
					var s = child.slot;
					// Do we have a slot node to match that name?
					if (!this[s]) {
						// No. We may need to build it on-the-fly.
						// Does the slot name have this syntax: "slot<#>"?
						var match = s && s.match(/^slot([\d]+)$/);
						if (match) {
							// The # is an index for a cell. Build the cell as a new slot (which
							// in turn requires building cells/slots for all preceeding indices too).
							var idx = parseInt(match[1], 10),
								cn = this.containerNode,
								cells = cn.cells,
								cLen = (cells&&cells.length) || 0,
								slots = {};
							for (var i = cLen; i <= idx; i++) {
								var td = cn.insertCell(i);
								slots["slot"+i] = td;
								if (this.cellCssClass) {
									td.className = this.cellCssClass;
								}
							}
							this.addSlots(slots);
						}
					}
				}
				
				// Call the inherited method to actually insert the child DOM into slot.
				this._super(obj);
			}			
		
		}
	);
	
})();