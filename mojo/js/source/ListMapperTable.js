(function(){

    mstrmojo.requiresCls(
    "mstrmojo.ListMapper");
    
    mstrmojo.ListMapperTable = mstrmojo.provide(
        "mstrmojo.ListMapperTable",
        mstrmojo.hash.copy(
        /**
         * @lends mstrmojo.ListMapperTable
         */
        {
            markupPrefix: '<table class="mstrmojo-itemwrap-table" cellspacing="0" cellpadding="0">',
            
            markupSuffix: '</table>',
            
            itemWrapperPrefix: function(w){
                return '<tbody class="' + this.getWrapperCss(w) + '">';
            }, 
            
            itemWrapperPrefill: '<tr><td>&nbsp;</td></tr>',
            
            itemWrapperSuffix:  '</tbody>',
            
            wrapperNodes: function wrapperNodes(p){
                return this.wrapperParentNode(p).tBodies;
            },
            
            wrapperParentNode: function wrapperParentNode(p){
                return p.getElementsByTagName('table')[0];
            },

            createWrapperNode: function createWrapperNode(p){
                var d = p.ownerDocument,
                n = d.createElement('tbody');
                return n;
            },
            
            /**
             * <p>Maps a given DOM node to a list item index.</p>
             *
             * @param {mstrmojo.Widget} w The widget whose list items are to be searched.
             * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
             * @param {DomNode} node The DOM node.
             * @returns {Integer} The index of the corresponding list item, if found; -1 otherwise.
             */
            findIndex: function nd2idx(w, p, node) {
                if (p && node) {
                    var dn = w.domNode,
                        tb = this.wrapperParentNode(p), 
                        pn = node.parentNode;
                    while (pn) {
                        if (pn === tb) {
                            // We found an item wrapper.
                            return mstrmojo.array.findBin(this.wrapperNodes(p), node, 'offsetTop', w.items && w.items.length);
                        } else if (pn === dn) {
                            // Stop, we reached the widget's DOM root.
                            break;
                        }
                        node = pn;
                        pn = node.parentNode;
                    }
                }
                return -1;
            }
        }, mstrmojo.hash.copy(mstrmojo.ListMapper)));

        
    mstrmojo.requiresCls(
    "mstrmojo.WidgetListMapper");
    
    mstrmojo.WidgetListMapperTable = mstrmojo.provide(
            "mstrmojo.WidgetListMapperTable",
            mstrmojo.mixin(
                /**
                 * @lends mstrmojo.WidgetListMapperTable
                 */
                mstrmojo._hasWidgetListMapper,
                mstrmojo.hash.copy(mstrmojo.ListMapperTable)
            )
    );
    
})();