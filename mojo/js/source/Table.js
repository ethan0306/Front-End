(function(){
	mstrmojo.requiresCls('mstrmojo.Container', 'mstrmojo.css');
	
	/**
	 * The prefix to use when designating new slots.
	 * 
	 * @const
	 * @private
	 * @ignore
	 */
	var C_PREFIX = '',	/* TODO check with GB, should we have some prefix for cell slot id? */
        R_PREFIX = 'row-',
        TABLE = mstrmojo.css.DISPLAY_TABLE;

	mstrmojo.Table = mstrmojo.declare(
		// super class
		mstrmojo.Container,
		// mixin
		null,
		// instance method
		{
			scriptClass: 'mstrmojo.Table',
			cellCssClass: '',
			/**
			 * Setting for number of rows
			 */
			rows: -1,
			/**
			 * Setting for number of columns
			 */
			cols: -1,
			/**
			 * Total rows in the table
			 */
			_trows: -1,
			
			cellPadding: 0,
			cellSpacing: 0,
			
			/**
			 * Setting for table layout. 
			 */
			layout: null,
			markupString: '<table id="{@id}" class="mstrmojo-Table {@cssClass}" style="{@cssText}" cellpadding="{@cellPadding}" cellspacing="{@cellSpacing}">{@tableHtml}</table>',
			markupSlots: {
				containerNode: function() { return this.domNode; }
			},
            markupMethods: {
                onvisibleChange: function() { this.domNode.style.display = this.visible ? TABLE : 'none'; }
            },
			preBuildRendering: function preBR () {
				// if layout defined, we need to construct table
				var rs = [],
					ccc = this.cellCssClass;
				if (this.layout){
					var rlen = this._trows = this.layout.length;
					// populate each row
					for (var i = 0; i < rlen; i ++ ){
						var r = this.layout[i],
							cells = r.cells,
							clen = cells.length,
							cs =[];
						// populate each cell
						for (var j = 0; j < clen; j ++) {
							var c = cells[j], 
								att = '';
							att += ((c.cssClass || ccc)? ' class="' + (c.cssClass || ccc) + '"' : '');
							att += (c.cssText? ' style="' + c.cssText + '"' : '');
							att += (c.rowSpan? ' rowspan="' + c.rowSpan + '"' : '');
							att += (c.colSpan? ' colspan="' + c.colSpan + '"' : '');
							cs[j] = '<td' + att + '></td>';
						} // end of looping through cells
						var rAtt = '';
						rAtt += (r.cssClass? ' class="' + r.cssClass + '"' : '');
						rAtt += (r.cssText? ' style="' + r.cssText + '"' : '');
						rs[i] = '<tr' + rAtt + '>' + cs.join('') + '</tr>';
					} // end of looping through rows
				} else{
					this._trows = this.rows;
					var att = (ccc? ' class="' + ccc + '"' : ''),
						cs = [];
					// populate each row
					for (var i = 0; i < this.rows; i ++) {
						for (var j = 0; j < this.cols; j ++) {
							cs[j] = '<td' + att + '></td>';
						}
						rs[i] = '<tr>' + cs.join('') + '</tr>';
					}
				}
				this.tableHtml = rs.join('');
				// calling super
				if (this._super) {
				    this._super();
			    }
			},
			/**
			 * After rendering, we need to record the slots for every row 
			 * (TODO check with GB, is the slot for row neccessary. I need it before I may add empty rows before a row with cells...)
			 * and every cell,
			 * so later, we can insert child widget to the correct location.
			 */
			postBuildRendering: function postBuildRendering() {
				// Do we have rows in table?
				if (this._trows){
					var slots = {},
						trs = this.containerNode.rows,
						rlen = trs.length;
					// loop through rows
					for (var i = 0; i < rlen; i ++) {
						var cells = trs[i].cells,
							clen = cells.length;
						slots[R_PREFIX + i] = trs[i];
						// loop through cells
						for (var j = 0; j < clen; j ++) {
							slots[C_PREFIX + i + ',' + j] = cells[j];
						}						
					}
					// add slots
					this.addSlots(slots);
				}
				// calling super
				this._super();
			},
			/**
			 * Overwrites the inherited childRenderCheck from Container to support
			 * rendering children whose slot = "<rowIndex>,<cellIndex>" even if no such slot is defined yet.
			 * For such children, the slot will be created dynamically on-demand.
			 */
			childRenderCheck: function childRndrChk(/*Object*/ child) {
				if (child && !child.hasRendered) {
					var slotName = child.slot || this.defaultChildSlot;  // TODO check with GB, what is the defaultChildSlot?
					return !!this[slotName] || slotName.match(/^([\d]+),([\d]+)$/);
				}
				return false;
			},
			/**
			 * When a child widget finishes rendering itself, we need to insert it into the correct cell.
			 * If we have not built the cell, we need to built the cell before rendering.
			 * If we even have not built the row, then we need to 
			 */
			on_child_change_rendering: function onChldChngRndr(/*Event|Widget*/ obj) {
				var child = (obj && obj.src) || obj,
				d = child && child.domNode;
				if (d) {
					// What is the slot name of the child?
					var s = child.slot;
					// Do we have a slot node to match that name?
					if (!this[s]) {
						// No. We may need to build it on-the-fly.
						// Does the slot name have this syntax: "<rowIndex>,<cellIndex"?
						var match = s && s.match(/^([\d]+),([\d]+)$/);
						if (match) {
							// The # is an index for a cell. Build the cell as a new slot (which
							// in turn requires building cells/slots for all preceeding indices too).
							var ri = parseInt(match[1], 10), // row index
								ci = parseInt(match[2], 10), // cell index
								cn = this.containerNode,	 // table node
								rslot = this[(R_PREFIX + ri)],	// row slot
								slots = [];
							// if we do not have the row built yet, we need to build all the rows missing
							if (!rslot) {
								var rs = cn.rows,
								rlen = rs && rs.length || 0;
								// insert rows
								for (var i = rlen; i <= ri; i ++) {
									slots[R_PREFIX + i] = cn.insertRow(); // TODO check with GB about usage of insertRow
								}
								// get the row slot for the target row
								rslot = slots[R_PREFIX + ri];
							}
							// now we have the row slot, we need to insert the cell
							var cLen = rslot.cells && rslot.cells.length || 0;
							for (var i = cLen; i <= ci; i++) {
								var td = rslot.insertCell(i);
								slots[C_PREFIX + ri + ',' + i] = td;
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