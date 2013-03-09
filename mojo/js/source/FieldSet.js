(function(){

	mstrmojo.requiresCls("mstrmojo.Container");
	
	/**
	 * FieldSet is a Container which can render a box around its children that can display a legend.
	 */
	mstrmojo.FieldSet = mstrmojo.declare(
		// superclass
		mstrmojo.Container,
		// mixins
		null,
		// instance members 
		{
			scriptClass: "mstrmojo.FieldSet",
			
			markupString: '<fieldset id="{@id}" class="mstrmojo-FieldSet {@cssClass}" style="{@cssText}">'
							+ '<legend class="{@cssClass}-legend">{@legend}</legend>'
							+ '</fieldset>',
							
			markupSlots: {
				legend: function(){ return this.domNode.firstChild; },
				containerNode: function() { return this.domNode; }
			},
			
			markupMethods: {
				onvisibleChange: function() { this.domNode.style.display = this.visible ? 'block' : 'none'; }
			}
		}
	);
	
})();