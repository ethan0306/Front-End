(function(){

	mstrmojo.requiresCls("mstrmojo._InputList", "mstrmojo._InputListHoriz");
	
	mstrmojo.RadioList = mstrmojo.declare(
		// superclass
		mstrmojo._InputList,
		
		// mixins
		null,
		
		/**
		 * @lends mstrmojo.RadioList.prototype
		 */
		{
			scriptClass: "mstrmojo.RadioList",
			inputType: "radio",
			cssClass: "mstrmojo-RadioList",
            itemCssClass: "mstrmojo-RadioList-item"
		}
	);	

	 
	mstrmojo.RadioListHoriz = mstrmojo.declare(
		// superclass
		mstrmojo._InputListHoriz,
		
		// mixins
		null,
		
		/**
		 * @lends mstrmojo.RadioList.prototype
		 */
		{
			scriptClass: "mstrmojo.RadioListHoriz",
			inputType: "radio",
			cssClass: "mstrmojo-RadioListHoriz",
            itemCssClass: "mstrmojo-RadioListHoriz-item"
		}
	);	

})();