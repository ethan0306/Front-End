(function(){

	/**
	 * Renders an HTML div for each item. The div's display text is read from the item's field 
	 * set as this widget's "itemDisplayField".
	 * Methods for selecting/unselecting items manipulate the div's CSS class names, which are
	 * configured from the widget's properties.
	 */
	mstrmojo.DivItemRenderer = {
		render: function(/*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
			return '<div mstridx="' + idx + '" class="' 
						+ widget.itemCssClass 
						+ (widget.selectedIndices[idx] ? ' ' + widget.itemSelectedCssClass : '')
						+ '" style="' + widget.itemCssText + '">' 
							+ (widget.getItemName ?
								widget.getItemName(item, idx) :
								(widget.itemDisplayField && item[widget.itemDisplayField]) )
						 + '</div>';
		},
		select: function(/*DomNode*/ el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
			el.className += ' selected';
		},
		unselect: function(/*DomNode*/ el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
			el.className = el.className.replace(/selected/g, '');
		}, 
		rowHeight: 21
	};	
	
	/**
	 * Mixin for a ListBase subclass that renders data items as HTML divs.
	 * Provides some properties for configuring the HTML attributes, and an onclick
	 * handler for updating the selectedIndices when the divs are clicked.
	 */
	mstrmojo._RendersItemDivs = {
		/**
		 * CSS class name and style text for the HTML table built at run-time.
		 */
		tableCssClass: "mstrmojo-ListBox-table",
		tableCssText: "",
		rowCssClass: "",
		rowCssText: "",
		cellCssClass: "mstrmojo-ListBox-cell",
		cellCssText: "",

		/**
		 * CSS class names for unselected and selected items' divs.
		 */
		itemCssClass: "mstrmojo-ListBox-item",
		itemSelectedCssClass: "selected",
		
		/**
		 * Name of field from which to read each item's display name.
		 */
		itemDisplayField: 'n',

		/**
		 * Specifies the standard div renderer as the default renderer to use.
		 */						
		itemRenderer: mstrmojo.DivItemRenderer,
        _findMatch: function(/*DomWindow*/ hWin, /*DomEvent*/ e) {
            // Was the target an item div (or a descendant thereof)?
            return mstrmojo.dom.findAncestorByAttr(
                        mstrmojo.dom.eventTarget(hWin, e),
                        'mstridx',
                        true,
                        this.itemsNode);
        },
		/**
		 * Updates selectedIndices after an item div is clicked.
         * @param {Object} evt A manufactured object representing the event.
         * @param {DomWindow} evt.hWin The window containing the clicked element.
         * @param {DomEvent} evt.e The click event.
		 */
		preclick: function preclk(evt) {
			// Was the click target an item div (or a descendant thereof)?
			var hWin = evt.hWin,
                e = evt.e,
                match = this._findMatch(hWin, e);
			if (match) {
				// Read the corresponding item index from the div.
				// Assumes: itemRenderer set the div's mstrIdx to the index!!
				var el = match.node,
					idx = parseInt(match.value),
					d = mstrmojo.dom,
					ctrl = d.ctrlKey(hWin, e),
					shift = d.shiftKey(hWin, e);
				if (ctrl || shift) {
					d.clearBrowserHighlights(hWin);
				}

				if (this.multiSelect && (this.selectionPolicy == "toggle" || ctrl)) {
					this.toggleSelect(idx);
				} else if (this.multiSelect && shift) {
					this.singleSelect(idx);	// TO DO: should be rangeSelect(idx), but that's not impl yet!
				} else {
					this.singleSelect(idx);
				}
			}
		}
	};
	
	mstrmojo.requiresCls("mstrmojo.ListBase", "mstrmojo._RendersItemDivs");
	/**
	 * ListBox renders data items as HTML <div>s in a 1-column table layout.
	 */
	mstrmojo.ListBoxBase = mstrmojo.declare(
		// superclass
		mstrmojo.ListBase,
		
		// mixins
		[mstrmojo._RendersItemDivs],
		
        // instance members 
		{
			scriptClass: "mstrmojo.ListBoxBase",
			
			cssClass: "mstrmojo-ListBox",
			itemCssClass: "mstrmojo-ListBox-item",
			
			_markupPrefix: function() {
				var ir = this.itemRenderer;
				return (ir && ir.markupPrefix) ||
						(	'<table class="' 
							+ this.tableCssClass 
							+ '" style="' + this.tableCssText 
							+ '" cellspacing="0" cellpadding="0"><tbody>');
			},
			_markupSuffix: function() {
				var ir = this.itemRenderer;
				return (ir && ir.markupSuffix) || '</tbody></table>';
			},
			_itemPrefix: function() {
				var ir = this.itemRenderer;
				return (ir && ir.itemPrefix) ||
						('<tr class="' + this.rowCssClass 
							+ '" style="' + this.rowCssText 
							+ '"><td class="' + this.cellCssClass 
							+ '" style="' + this.cellCssText + '">');
			},
			_itemSuffix: function() {
				var ir = this.itemRenderer;
				return (ir && ir.itemSuffix) || '</td></tr>';
			},
            _getItemNode: function(idx) {
                // ListBase recorded the table node as itemsNode
                var t = this.itemsNode,
                	rs = t && t.rows,
                	r = rs && rs[idx];
            	return r && r.cells[0].firstChild;
            }
		}
	);

/*
 * We should get rid of the ListBoxHoriz definition here, since we already have a stand alone definition in ListBoxHoriz.js 
 */ 
//	mstrmojo.requiresCls("mstrmojo.ListBase");
//	/**
//	 * ListBoxHoriz renders data items as HTML <div>s in a 1-row table layout.
//	 */
//	mstrmojo.ListBoxHoriz = mstrmojo.declare(
//		// superclass
//		mstrmojo.ListBase,
//		
//		// mixins
//		[mstrmojo._RendersItemDivs],
//		
//        // instance members 
//		{
//			scriptClass: "mstrmojo.ListBoxHoriz",
//
//			cssClass: "mstrmojo-ListBoxHoriz",
//			itemCssClass: "mstrmojo-ListBoxHoriz-item",
//			
//			_markupPrefix: function() {
//				var ir = this.itemRenderer;
//				return (ir && ir.markupPrefix) ||
//						('<table class="' 
//							+ this.tableCssClass 
//							+ '" style="' + this.tableCssText 
//							+ '" cellspacing="0" cellpadding="0"><tbody><tr class="' 
//							+ this.rowCssClass 
//							+ '" style="' + this.rowCssText 
//							+ '">');
//			},
//			_markupSuffix: function() {
//				var ir = this.itemRenderer;
//				return (ir && ir.markupSuffix) || '</tr></tbody></table>';
//			},
//			_itemPrefix: function() {
//				var ir = this.itemRenderer;
//				return (ir && ir.itemPrefix) ||
//						('<td class="' 
//								+ this.cellCssClass 
//								+ '" style="' + this.cellCssText + '">');
//			},
//			_itemSuffix: function() {
//				var ir = this.itemRenderer;
//				return (ir && ir.itemSuffix) || '</td>';
//			},
//            _getItemNode: function(idx) {
//                // ListBase recorded the table node as itemsNode
//                var t = this.itemsNode,
//                	r = t.rows[0];
//                return r && r.cells[idx].firstChild;
//			}
//            
//		}
//	);

})();			
