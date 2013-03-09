(function(){

	mstrmojo.requiresCls(
		"mstrmojo.Widget",
        "mstrmojo._Formattable");
	
	/**
	 * <p>An IFrame type of HTMLContainer.  HTML text HTMLContainer are handled by the {@link mstrmojo.DocTextfield}.</p>
	 *
	 * @class
	 * @extends mstrmojo.Widget
	 * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
     * @borrows mstrmojo._Formattable#getFormats as #getFormats
	 */
	mstrmojo.DocHTMLContainer = mstrmojo.declare(
		// superclass
		mstrmojo.Widget,
		
		// mixins,
        [mstrmojo._Formattable],
		
        /** 
         * @lends mstrmojo.DocHTMLContainer.prototype
         */
		{
			scriptClass: "mstrmojo.DocHTMLContainer",
			
			scrolling: "auto",
			
	        markupString: '<iframe id="{@id}" class="mstrmojo-DocHTMLContainer" title="{@tooltip}" style="{@domNodeCssText}" src="{@v}" scrolling="{@scrolling}"></iframe>',

            formatHandlers: {
                domNode: [ 'RW', 'B', 'F', 'background-color', 'text-align', 'white-space', 'fx' ]
            },
            
            /**
             * Updates the src of the IFrame that may change due to a selector action.
             * 
             * @param {Object} node The widget node.
             */
            update: function update(node) {
                this.v = node.data.v;
                
                //check if it is android or not, if yes set scrolling property to no
                if(mstrApp && mstrApp.isTouchApp()) {
                	this.scrolling = "no";
                }
                
                // if there is a threshold, kill the format
                if(this.thresholdId || node.data.tid) {
                    delete this.fmts;
                }                
                
                this.thresholdId = node.data.tid;
                
            }
		}
	);
	
})();