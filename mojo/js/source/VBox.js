(function(){

	mstrmojo.requiresCls("mstrmojo.Container");
	
	/**
	 * A container for laying children out in a single horizontal row.
	 * @class
	 * 
	 * @extends mstrmojo.Container
	 */
	mstrmojo.VBox = mstrmojo.declare(
		// superclass
		mstrmojo.Container,
		
		// mixins,
		null,
		
		/**
		 * @lends mstrmojo.VBox.prototype
		 */
		{
			scriptClass: "mstrmojo.VBox",
			
			markupString: '<table id="{@id}" class="mstrmojo-VBox {@cssClass}" style="{@cssText}" cellspacing="0" cellpadding="0"><tr><td></td></tr></table>',

			markupSlots: {
				containerNode: function() { return this.domNode.rows[0].cells[0]; }
			},
			
			markupMethods: {
				onvisibleChange: function() { this.domNode.style.display = this.visible ? mstrmojo.css.DISPLAY_TABLE : 'none'; }
			}
		}			
	);
	
})();