(function () {

	mstrmojo.requiresCls("mstrmojo.android._IsAndroidDocument",
		                 "mstrmojo.VisTimeSeries");

	/**
	 * Standalone class that displays the VisTimeSeries full screen on documents.
	 */
	mstrmojo.DocVisTimeSeries = mstrmojo.declare(
		/**
		 * Superclass
		 */
		mstrmojo.VisTimeSeries,

		/**
		 * Mixins
		 */
		[ mstrmojo.android._IsAndroidDocument ],

		{
			scriptClass: 'mstrmojo.DocVisTimeSeries'
		}
	);
}());
