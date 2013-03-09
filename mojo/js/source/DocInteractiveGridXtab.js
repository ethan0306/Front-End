(function () {

	mstrmojo.requiresCls(
		"mstrmojo.AndroidXtab",
		"mstrmojo._IsInteractiveGrid",
		"mstrmojo.android._IsAndroidDocument",
		"mstrmojo._Formattable",
		"mstrmojo._IsDocXtab");

	/**
	 * Standalone class that displays an interactive grid on documents.
	 */
	mstrmojo.DocInteractiveGridXtab = mstrmojo.declare(
		/**
		 * Superclass
		 */
		mstrmojo.AndroidXtab,

		/**
		 * Mixins
		 */
		[ mstrmojo._IsInteractiveGrid, mstrmojo.android._IsAndroidDocument, mstrmojo._Formattable, mstrmojo._IsDocXtab],

		{
			scriptClass: 'mstrmojo.DocInteractiveGridXtab',
			
			/**
			 * Override the format handlers as we don't care about the background color on the viewport slot.
			 * 
			 * @see mstrmojo._Formattable
			 */
			formatHandlers: {
                domNode: [ 'RW', 'T', 'font'],
                msgNode: [ 'D' ],
                viewport: [ 'D', 'B', 'fx' ]
            }
		}
	);
}());
