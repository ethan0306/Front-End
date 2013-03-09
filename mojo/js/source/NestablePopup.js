(function() {

	mstrmojo.requiresCls("mstrmojo.Popup", "mstrmojo._HasPopup");

	/**
	 * NestablePopup is a Container that is also a popup and can autoHide and have more popups.
	 */
	mstrmojo.NestablePopup = mstrmojo.declare(
		// superclass
		mstrmojo.Popup,
		// mixins
		[mstrmojo._HasPopup],
		// instance members
		{}
	);
		
})();