(function(){

    mstrmojo.requiresCls("mstrmojo.ListMapperHoriz");

    var RENDERED = 1;
    
    mstrmojo.WidgetListMapperHoriz = mstrmojo.provide(
        "mstrmojo.WidgetListMapperHoriz",
        mstrmojo.mixin(
            /**
             * @lends mstrmojo.WidgetListMapperHoriz
             */
            {
                /**
                 * <p>Enhances the inherited method in order to ignore the "first" and "last" params.</p>
                 *
                 * <p>In WidgetLists, items are represented by individual widgets, not merely DOM nodes.
                 * Therefore this method cannot simply construct their markup as a string.  Rather, this
                 * method can only construct the DOM wrappers to contain those widgets' markup.  Then, after
                 * these wrappers have been rendered in DOM, the WidgetList must ask the item widgets to
                 * render themselves.</p>
                 *
                 * @ignore
                 */
                buildItemWrappers: function biws(items, builder, w, ctxt, first, last) {
                    // Cache first and last in context for later use (see postBuildRendering).
                    ctxt.first = first;
                    ctxt.last = last;
                    return this._super(items, builder, w, ctxt, 0, 0);
                },
                
                postBuildRendering: function pbr(p, items, builder, w, ctxt) {
                    var f = ctxt.first;
                    if (f) {
                        this.fillItemWrappers(p, items, builder, w, ctxt, 0, f);
                    }
                    if (ctxt.last) {
                        var len = items && items.length || 0,
                            start = Math.max(Math.max(0, len-ctxt.last), f);
                        this.fillItemWrappers(p, items, builder, w, ctxt, start, len);
                    }
                },

                /**
                 * <p>Overwrites the inherited method in order to ask item widgets to render themselves.</p>
                 *
                 * @ignore
                 */
                fillItemWrappers: function fi(p, items, builder, w, ctxt, start, end, max){
                    var len = (items && items.length) || 0,
                        ns = p.firstChild.rows[0].cells,
                        st = ctxt.itemStatus;
                
                    for (var i=start, stop=Math.min(end+1, len), k=0; i<stop; i++) {
                        if (st[i] !== RENDERED) {
                            var iw = builder.build(w, ctxt, items[i], i);
                            if (iw) {
                                iw.parent = w;
                                iw.placeholder = ns[i].firstChild;
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
            mstrmojo.hash.copy(mstrmojo.ListMapperHoriz)
        )
    );
            
})();