(function(){
    
    mstrmojo.requiresCls("mstrmojo.MobileDocBuilder");
        
    /**
     * <p>Builds the document object model based on the supplied {@link mstrmojo.DocModel} for iPhone devices.</p>
     * 
     * @class
     * @extends mstrmojo.MobileDocBuilder
     */
    mstrmojo.iPhoneDocBuilder = mstrmojo.declare(
            // superclass
            mstrmojo.MobileDocBuilder,
            
            // mixins,
            null,
            
            /**
             * @lends mstrmojo.iPhoneDocBuilder.prototype
             */
            {
                scriptClass: "mstrmojo.iPhoneDocBuilder",
 
                /**
                 * <p>Creates and returns a mstrmojo.DocLayout widget. It does not render the layout incrementally.</p>
                 * 
                 * @param {mstrmojo.DocModel} model The DocModel the child and container belong to.
                 * @param {Object} node The data node for the child widget.
                 */
                newLayout: function newLayout(model, node) {
                        // Resolve whether the layout should be vertical or horizontal layout.
                    var LayoutCls = mstrmojo['DocLayout' + ((node.defn.horiz) ? 'Horiz' : '')];
                    
                    return new LayoutCls({ 
                            slot: "containerNode",
                            id: node.k,
                            k: node.k,
                            minHeight: node.data.mh,
                            formatResolver: model.formatResolver,
                            rules: node.defn.rules,
                            builder: this,
                            node: node,
                            defn: node.defn,
                            model: model
                        });
                }
            }
    );
    
})();