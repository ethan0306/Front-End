(function(){

	mstrmojo.ToolBarModel = mstrmojo.declare(
		// superclass
		mstrmojo.Model,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.ToolBarModel",
			
			getChildren: function getCh(/*Object?*/ node, /*Any?*/ config) {
				return (node || this.n || this).items;
			}
		}
	);
	
})();
