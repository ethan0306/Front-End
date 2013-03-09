(function(){

    mstrmojo.requiresCls("mstrmojo.WidgetListMapper", "mstrmojo.hash", "mstrmojo.expr");

    var _E = mstrmojo.expr,
        RENDERED = mstrmojo.WidgetListMapper.RENDERED;
    
    /**
     * ListMapper class for an AndOrNode in a vertical orientation.
     *
     * @class
     */
    mstrmojo.AndOrNodeMapper = mstrmojo.provide(
        "mstrmojo.AndOrNodeMapper",
        mstrmojo.mixin(
            /**
             * @lends mstrmojo.AndOrNodeMapper
             */
            {
                /**
                 * <p>Extends the inherited method in render the AND/OR suffix before the item widget.</p>
                 *
                 * @ignore
                 */
                fillItemWrappers: function fi(p, items, builder, w, ctxt, start, end, max){
                    var len = (items && items.length) || 0,
                        ns = p.childNodes,
                        st = ctxt.itemStatus,
                        d = w.data,
                        t = _E.BRANCH_FNS[d && d.fn] || '',
                        // Minor hack: Put a special HTML attribute around the text for "AND"/"OR" so that
                        // mouse event handlers can determine what part of this widget was targeted.
                        PRE = '<div class="mstrmojo-AndOrNode-text '
                                + (w.editable ? 'editable' : '') 
                                + '"><span class="mstrmojo-text" mstrmojoInf="AndOrNode-text" >' + t + '</span></div>'
                                + '<div class="mstrmojo-AndOrNode-postText"></div>';
                
                    for (var i=start, stop=Math.min(end+1, len), k=0; i<stop; i++) {
                        if (st[i] !== RENDERED) {
                            var nd = ns[i];
                            nd.innerHTML = PRE;
                            var iw = builder.build(w, ctxt, items[i], i);
                            if (iw) {
                                iw.placeholder = nd.lastChild;
                                iw.render();
                            }
                            k++;
                            if (k === max) {
                                break;
                            }
                        }
                    }
                    return k;
                }
            },
            mstrmojo.hash.copy(mstrmojo.WidgetListMapper)
        )
    );
            
})();