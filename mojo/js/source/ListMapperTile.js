(function() {
    mstrmojo.requiresCls("mstrmojo.ListMapper", "mstrmojo.WidgetListMapper");
    var _A = mstrmojo.array,
        CSS = 'mstrmojo-itemwrap',
        _json = {
                markupSuffix : '<div class="mstrmojo-clearMe"></div>',
                /**
                 * <p>Maps a given DOM node to a list item index.</p>
                 * This override the default optimized method in ListMapper, which checking offsetTop to determine which item index.
                 * @param {mstrmojo.Widget} w The widget whose list items are to be searched.
                 * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
                 * @param {DomNode} node The DOM node.
                 * @returns {Integer} The index of the corresponding list item, if found; -1 otherwise.
                 */
                findIndex: function nd2idx(w, p, node) {
                    var iw = this._nd2iw(w, p, node);
                    return _A.indexOf(p.childNodes, iw);
                },
                getWrapperCss: function(w){
                    var l = w.layout;
                    return CSS + ' lyt_' + l.row + 'x' + l.col;
                }
                
            };
    
    mstrmojo.ListMapperTile = mstrmojo.provide(
            'mstrmojo.ListMapperTile',
            mstrmojo.mixin(_json, mstrmojo.hash.copy(mstrmojo.ListMapper))
    );  
    
    mstrmojo.WidgetListMapperTile = mstrmojo.provide(
            'mstrmojo.WidgetListMapperTile',
            mstrmojo.mixin(_json, mstrmojo.hash.copy(mstrmojo.WidgetListMapper))
    );  
})();