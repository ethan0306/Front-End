(function(){

    mstrmojo.requiresCls("mstrmojo.WidgetListBuilder");
    
    /**
     * AndOrNodeBuilder is a content builder for AndOrNode instances. Its purpose is to supervise a rendering
     * cycle that generates a widget for each item in the AndOrNode's "item" array, and inserts those widgets
     * into the WidgetList's DOM. ANDOR extends AndOrNodeBuilder by inserting a DOM node after each items widget's DOM.
     */
	mstrmojo.AndOrNodeBuilder = mstrmojo.declare(
        // superclass
		mstrmojo.WidgetListBuilder,
		// mixins
		null,
		{   // instance members
			scriptClass: "mstrmojo.AndOrNodeBuilder",
			
            /**
             * Overwrites the inherited method in order to remove the AND/OR <div>s that follows each itemWidget about to be removed.
             */
            _removeItemAt: function rmvAt(/*Integer*/ idx, /*DomNode*/ node){
               var w = this.itemWidgets[idx];
                if (w && w.domNode) {
                    node.removeChild(w.domNode.nextSibling);
                    node.removeChild(w.domNode);
                }
		    },
						
            /**
             * Overwrites the inherited method in order to insert an AND/OR <div> after each itemWidget that is rendered. 
             */
            _insertItem: function insrt(/*Widget*/ w, /*Integer*/ idx, /*DomNode*/ node){
                // It's safe to assume all previous sibling items have been rendered (by design).
                if (w && w.domNode) {
                    var andOrNode = document.createElement("div");
                    andOrNode.className = "mstrmojo-AndOrNode-text";
                    andOrNode.innerHTML = this.parent.text;
                    var bef = node.childNodes[idx*2];
                    if (bef) {
                        node.insertBefore(w.domNode, bef);
                        node.insertBefore(andOrNode, bef);
                    } else {
                        node.appendChild(w.domNode);
                        node.appendChild(andOrNode);
                    }
                }
            }
		});
			
})();
