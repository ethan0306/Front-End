(function(){
	
	mstrmojo.requiresCls("mstrmojo.ListBox",
						 "mstrmojo.ListBoxHoriz");

	/**
	 * <p>Renders a native HTMLInput (checkbox or radio) for each item.</p>
	 * 
	 * <p>Input name is this widget's htmlName; label text is read from the item's field set as this widget's "itemDisplayField";
	 * input value is set to the item's corresponding index.</p>
	 * 
	 * <p>Methods for selecting/unselecting inputs are deliberately omitted because clicking
	 * an input will automatically select/unselect it without javascript.</p>
	 * 
	 * @private
	 */
	var inputListItemRenderer = {
		/**
		 * @param {Object} item The item to render.
		 * @param {Integer} idx The index of the item to render.
		 * @param {mstrmojo.InputList} widget The mstrmojo.InputList to render.
		 */
		render: function(item, idx, widget) {
			var id = (widget.htmlName + idx),
				chk = widget.selectedIndices[idx] ? 'checked ' : '',
				selected = chk ? ' selected' : '',
				nAll = item.v != "u;" ? " nAll" : "";
			
			return '<div class="' + widget.itemCssClass + selected + nAll + '">' + 
						'<input type="' + widget.inputType + '"' + 
							' name="' + widget.htmlName + '"' +
							' id="' + id + '"' + 
							' value="' + idx + '" ' + chk + '/>' + 
						'<label for="' + id + '" style="' + widget.labelCssText + '">' + 
							item[widget.itemDisplayField || 'n'] + 
						'</label>' + 
					'</div>';
		},

        select: function(/*Element*/el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
        	var elI = el && el.firstChild;
        	if (elI && !elI.checked) {
        		elI.checked = true;
        	}
        	mstrmojo.css.toggleClass(el, 'selected', elI.checked);
		},
        
        unselect: function(/*Element*/el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
        	var elI = el && el.firstChild;
        	if (elI && elI.checked) {
        		elI.checked = false;
        	}
        	mstrmojo.css.toggleClass(el, 'selected', elI.checked);
        },
		
		rowHeight: 23
	};

	/**
	 * <p>Mixin for a ListBase subclass that renders data items as native HTMLInput controls (radio or checkboxes).</p>
	 * 
	 * <p>Provides some properties for configuring the HTML attributes, and an onclick
	 * handler for updating the selectedIndices when the radios are clicked.</p>
	 * 
	 * @refactoring Not sure this needs to be public.
	 * 
	 * @public
	 */
	mstrmojo._RendersInputItems = {
		/**
		 * String type of the native HTML <input>s to be generated for the data items.
		 * 
		 * @type String
		 */
		inputType: null,
		
		/**
		 * String name to be applied to each <input type=checkbox> for the data items.
		 * 
		 * @type String
		 */
		htmlName: null,
		
		/**
		 * Specifies the standard native HTML input renderer as the default renderer to use.
		 * 
		 * @type Object
		 * @ignore see {mstrmojo.ListBase}
		 */						
		itemRenderer: inputListItemRenderer,
		
		/**
		 * Extends inherited method in order to initialize "htmlName" property.
		 * 
		 * @ignore
		 */
		init: function(/*Object?*/ props) {
			this._super(props);

			if (!this.htmlName) {
				this.htmlName = this.id;
			}
		},
			
		/**
		 * <p>Updates selectedIndices after an input is clicked.</p>
		 * 
         * @param {Object} evt A manufactured object representing the event.
		 * @param {DomWindow} evt.hWin The window containing the clicked element.
		 * @param {DomEvent} evt.e The click event.
		 */
		preclick: function(evt){
			// Get the clicked element.
			var hWin = evt.hWin,
                e = evt.e,
                el = mstrmojo.dom.eventTarget(hWin, e);
			
			// Was it an input?
			if (el && el.nodeName.match(/input/i)) {
				// Get the input index.
				var idx = parseInt(el.value, 10);
				
				// Was it a radio?
				if (this.inputType && this.inputType.match(/radio/i)) {
					// Assume el.checked is now true, so it should be our only selected index.
					this.singleSelect(idx);
				} else {
					// Either call addSelect (if checked) or removeSelect (if not checked).
					var m = (el.checked) ? 'add' : 'remove';
					this[m + 'Select'](idx);
				}
			}
		}
	};
	
	/**
	 * <p>A vertical list of native HTML radio inputs that render on-demand.</p>
	 * 
	 * @class
	 * @extends mstrmojo.ListBox
	 * 
     * @borrows mstrmojo._RendersInputItems#htmlName as #htmlName
     * @borrows mstrmojo._RendersInputItems#onclick as #onclick
	 */
	mstrmojo._InputList = mstrmojo.declare(
		// superclass
		mstrmojo.ListBox,
		
		// mixins
		[ mstrmojo._RendersInputItems ],
		
		/**
		 * @lends mstrmojo.RadioList.prototype
		 */
		{
			scriptClass: "mstrmojo._InputList"
		}
	);
			
	/**
	 * <p>A horizontal list of native HTML radio inputs.</p>
	 * 
	 * @class
	 * @extends mstrmojo.ListBoxHoriz
	 * 
     * @borrows mstrmojo._RendersInputItems#htmlName as #htmlName
     * @borrows mstrmojo._RendersInputItems#onclick as #onclick
	 */
	mstrmojo._InputListHoriz = mstrmojo.declare(
		// superclass
		mstrmojo.ListBoxHoriz,
		
		// mixins
		[ mstrmojo._RendersInputItems ],
		
		/**
		 * @lends mstrmojo.RadioListHoriz.prototype
		 */
		 {
			scriptClass: "mstrmojo._InputListHoriz"
		 }
	 );

})();