(function(){

	mstrmojo.requiresCls("mstrmojo.ListBase", "mstrmojo._ListSelections");
	
	mstrmojo.ListBoxHoriz = mstrmojo.declare(
		// superclass
		mstrmojo.ListBoxBase,
		
		// mixins
		[mstrmojo._ListSelections],
		
        // instance members 
		{
			scriptClass: "mstrmojo.ListBoxHoriz",

			/**
			 * CSS class name and style text for the HTML table built at run-time.
			 */
			cssClass: "mstrmojo-ListBoxHoriz",
			tableCssClass: "mstrmojo-ListBox-table",
			tableCssText: "",
			rowCssClass: "",
			rowCssText: "",
			cellCssClass: "",
			cellCssText: "",
			cellSpacing: 0,
			cellPadding: 0,
			
			_markupPrefix: function() {
				var ir = this.itemRenderer;
				return (ir && ir.markupPrefix) ||
						('<table class="' 
							+ this.tableCssClass 
							+ '" style="' + this.tableCssText 
							+ '" cellspacing="' + this.cellSpacing + '" cellpadding="' + this.cellPadding + '"><tbody>'
							+ '<tr class="' + this.rowCssClass 
							+ '" style="' + this.rowCssText 
							+ '">');
			},
			_markupSuffix: function() {
				var ir = this.itemRenderer;
				return (ir && ir.markupSuffix) || '</tr></tbody></table>';
			},
			_itemPrefix: function() {
				var ir = this.itemRenderer;
				return (ir && ir.itemPrefix) ||
						('<td class="' 
								+ this.cellCssClass 
								+ '" style="' + this.cellCssText + '">');
			},
			_itemSuffix: function() {
				var ir = this.itemRenderer;
				return (ir && ir.itemSuffix) || '</td>';
			},
            _getItemNode: function(idx) {
                // ListBase recorded the table node as itemsNode
                var t = this.itemsNode,
                    r = t && t.rows[0];
                return r && r.cells[idx].firstChild;
            }
		}
	);
	
})();			
