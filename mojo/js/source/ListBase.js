(function(){

	mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo._ListSelections");
	
	/**
	 * ListBase is an "abstract" base class for list widgets that display a 1-D array of data items.
	 * It is called "abstract" in the sense that it does not implement the 4 methods "_markupPrefix", "_markupSuffix", "_itemPrefix" and "_itemSuffix".
	 * These methods are implemented by subclasses such as ListBox and ListBoxHoriz in order to render a table layout.
	 */
	mstrmojo.ListBase = mstrmojo.declare(
		// superclass
		mstrmojo.Widget,
		
		// mixins
		[mstrmojo._ListSelections],
		
        // instance members 
		{
			scriptClass: "mstrmojo.ListBase",
			
		
            selectionPolicy: null,
            
			/**
			 * Responsible for defining the HTML of each data item, and optionally for marking a rendered item as selected,
			 * unselected, hovered, or unhovered. The itemRenderer should have the following public members:
			 * {
			 *		render: function(item, index, widget),		// required
			 *		select: function(el, item, index, widget),	// optional
			 *		unselect: function(el, item, index, widget),	// optional
			 *		hover: function(el, item, index, widget),	// optional
			 *		unhover: function(el, item, index, widget),	// optional
			 *		colWidth: Integer	// optional
			 * }
			 */
			itemRenderer: null,
			
            /**
             * CSS text for the items container node.
             * 
             * @type String
             * @default ''
             */
            icnCssText: '',
            
            /**
             * CSS class name for the items container node.
             * 
             * @type String
             * @default
             */
            icnCss: '',
            
            markupString: '<div id="{@id}" class="mstrmojo-ListBase {@cssClass}" style="{@cssText}" mstrAttach:click>' + 
                              '<div class="{@icnCss}" style="{@icnCssText}">{@itemsHtml}</div>' + 
                          '</div>',
			
			markupSlots: {
                itemsContainerNode: function() { return this.domNode.firstChild; },
                scrollboxNode: function() { return this.domNode; }
			},
			
			markupMethods: {
                onvisibleChange: function() { this.domNode.style.display = this.visible ? this.cssDisplay : 'none'; },
                onheightChange: function() { if (this.height) this.domNode.style.height = this.height; },
                onwidthChange: function() { if (this.width) this.domNode.style.width = this.width; }
			},
									
			/**
			 * Extends the rendering by defining the "itemsHtml" property at run-time, thus rendering
			 * the data items.
			 */
			buildRendering: function bldRnd() {
				// Set the itemsHtml property to an HTML string for the first page of table cells.
				this.itemsHtml = '';
				var len = this.items && this.items.length;
				if (len) {
					this.itemsHtml = this._buildItemsMarkup(
										0, 
										len-1, 
										this._markupPrefix && this._markupPrefix(),
										this._markupSuffix && this._markupSuffix(),
										this._itemPrefix && this._itemPrefix(),
										this._itemSuffix && this._itemSuffix()).join('');
				}
				
				// This does the actual DOM construction, and attaches listener to our own scrollbox.
				// We assume the scrollbox is our own, not our parent's. 
				// TO DO: does this.connectScrollbox(this) cause 2 listeners to be attached?
				this._super();	
				
				delete this.itemsHtml;
				// Record pointer to the newly constructed table for future reference.
				this.addSlots({itemsNode: this.itemsContainerNode.firstChild});
			},
			
			_markupPrefix: null,
			_markupSuffix: null,
			_itemPrefix: null,
			_itemSuffix: null,
						
			/**
			 * Returns an HTML string for a <table> with a single <tbody> whose rows contain the data from the items
			 * of a given range of indices.
			 */
			_buildItemsMarkup: function(/*Integer*/ start, /*Integer*/ end, /*String?*/ markupPrefix, /*String?*/ markupSuffix, /*String?*/ itemPrefix, /*String?*/ itemSuffix) {
				// For performance, we generate the HTML as an array of small strings, which the caller can then join when needed.
				var markup = [],
					count = 0;
				markup[count++] = markupPrefix || '';

				// Do we have an item renderer with a render function?				
				var ir = this.itemRenderer,
					fn = ir && ir.render;
				if (fn && typeof(fn) == "function") {
					// Walk the items and generate a single table row of HTML for each.
					var PRE = itemPrefix || '',
						POST = itemSuffix || '',
						its = this.items,
						len = (its && its.length) || 0,
						me = this;
					for (var i=start, stop=Math.min(end+1, len); i<stop; i++) {
						markup[count++] = PRE;
						markup[count++] = fn(its[i], i, me);
						markup[count++] = POST;
					}
				}
								
				markup[count++] = markupSuffix || '';
				return markup;
			},
			
            /**
             *  Handler for selectionChange event, raised by _ListSelections mixin.
             */			
            onselectionChange: function onselChg(evt) {
                if (!evt) {
                    return;
                }
                
                var ir = this.itemRenderer;
                if (!ir) {
                    return;
                }
                
                var unsel = ir.unselect,
                    its = this.items || [],
                    rem = evt.removed,
                    ix, el;
                
                if (unsel && rem) {
	                // ask itemRenderer to unhighlight previous selections
	                for (var j=0, jLen=rem.length; j<jLen; j++) {
	                    ix = rem[j];
	                    el = this._getItemNode(ix);
	                    if (el) {
		                    unsel(el, its[ix], ix, this); 
	                    }
	                }
				}
                
                var sel = ir.select,
                    added = evt.added;

                if (sel && added) {
                    // ask itemRenderer to highlight selections
                    for (var i=0, len=added.length; i<len; i++) {
                        ix = added[i];
                        el = this._getItemNode(ix);
                        if (el) {
                            sel(el, its[ix], ix, this); 
                        }
                    }             
                }
                
                // A hook for custom behavior
                if (this.onchange) this.onchange();
            },
            
            /**
             * If true, this widget will set its "visible" property when we set its "items" property:
             * false if items is null or an empty array, true otherwise.
             */
            autoHide: false,
            
            /**
             * Extends the inherited method in order to implement the "autoHide" feature.
             */
            init: function init(/*Object?*/ props) {
            	this._super(props);
				if (this.autoHide) {
					this.visible = !!(this.items && this.items.length);
				}
            }, 
            
            _getItemNode: function(idx) {
                var itemsNode = this.itemsContainerNode;
                return (itemsNode && itemsNode.childNodes[idx]) || null;
            }, 
            
            /**
             * Custom setter for "items", implements the autoHide feature.
             */
			_set_items: function stitems(n, v) {
				if (this.autoHide) {
					this.set('visible', !!(v && v.length));
				}
				var was = this.items;
				this.items = v;
				if (was != v) {
					var hr = this.hasRendered;
					if (hr) {
						this.unrender();
					}
					// Setting items clears any prior selections.  Previously we only cleared
					// selections that are out of bounds, but this breaks lists in popups
					// that only have 1 item, yet need to have their selectedIndex reset to -1
					// every time they are opened.
					this.clearSelect();

                    if (hr) {
                        this.render();
                    }
					return true;
				} else {
					return false;
				}
				return was != v;
			}
		}
	);
})();			
