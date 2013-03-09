(function(){

	mstrmojo.requiresCls("mstrmojo._InputList", "mstrmojo._InputListHoriz", "mstrmojo.hash");


	/**
	 * A vertical list of native HTML checkboxes, which are rendering on-demand.
	 */		
	mstrmojo.CheckList = mstrmojo.declare(
		// superclass
		mstrmojo._InputList,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.CheckList",
			inputType: "checkbox",
			cssClass: "mstrmojo-CheckList",
            itemCssClass: "mstrmojo-CheckList-item"
		}
	);	

	mstrmojo.requiresCls("mstrmojo._InputListHoriz");
	/**
	 * A horizontal list of native HTML checkboxes.
	 */		
	mstrmojo.CheckListHoriz = mstrmojo.declare(
		// superclass
		mstrmojo._InputListHoriz,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.CheckListHoriz",
			inputType: "checkbox",
			cssClass: "mstrmojo-CheckListHoriz",
            itemCssClass: "mstrmojo-CheckListHoriz-item"
		}
	);	
})();