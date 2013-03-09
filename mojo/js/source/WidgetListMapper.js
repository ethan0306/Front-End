(function(){

    mstrmojo.requiresCls("mstrmojo.ListMapper");
    
    var RENDERED = 1;
    
    mstrmojo._hasWidgetListMapper = {

            /**
             * <p>Enhances the inherited "buildItemWrappers" method in order to ignore the "first" and "last" params.</p>
             *
             * <p>This function is used in 2 separate classes, so we declare it once here privately for re-use.</p>
             *
             * <p>In WidgetLists, items are represented by individual widgets, not merely DOM nodes.
             * Therefore this method cannot simply construct their markup as a string.  Rather, this
             * method can only construct the DOM wrappers to contain those widgets' markup.  Then, after
             * these wrappers have been rendered in DOM, the WidgetList must ask the item widgets to
             * render themselves.</p>
             *
             * @private
             * @ignore
             */
            buildItemWrappers: function biws(items, builder, w, ctxt, first, last) {
                // Cache first and last in context for later use (see postBuildRendering).
                ctxt.first = first;
                ctxt.last = last;
                return this._super(items, builder, w, ctxt, 0, 0);
            },
            
            /**
             * <p>Enhances the inherited "postBuildRendering" method in order to process the "first" and "last" params
             * of the call to "buildItemWrappers" (which that method essentially ignores, after caching them).</p>
             *
             * <p>This function is used in 2 separate classes, so we declare it once here privately for re-use.</p>
             *
             * <p>After item wrappers have been rendered in DOM, the WidgetList must ask the item widgets to
             * render themselves. This method triggers that rendering for the first & last set of items.</p>
             *
             * @private
             * @ignore
             */
            postBuildRendering:function pbr(p, items, builder, w, ctxt) {
                var f = ctxt.first;
                if (f) {
                    this.fillItemWrappers(p, items, builder, w, ctxt, 0, f);
                }
                if (ctxt.last) {
                    var len = items && items.length || 0,
                        start = Math.max(Math.max(0, len-ctxt.last), f);
                    this.fillItemWrappers(p, items, builder, w, ctxt, start, len);
                }
                if (this._super) {
                    this._super(p, items, builder, w, ctxt);
                }
            },
            
            /**
             * <p>Overwrites the inherited method in order to ask item widgets to render themselves.</p>
             *
             * @ignore
             */
            fillItemWrappers: function fi(p, items, builder, w, ctxt, start, end, max){
                var len = (items && items.length) || 0,
                    ns = this.wrapperNodes(p),
                    st = ctxt.itemStatus;
            
                for (var i=start, stop=Math.min(end+1, len), k=0; i<stop; i++) {
                    if (st[i] !== RENDERED) {
                        var iw = builder.build(w, ctxt, items[i], i);
                        if (iw) {
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
            },
            
            /**
             * Removes the inherited method because the list builder will handle marking item widgets as selected.
             */
            onchange: null
        };
    
    /**
     * ListMapper class for a WidgetList in a vertical orientation.
     *
     * @class
     */
    mstrmojo.WidgetListMapper = mstrmojo.provide(
        "mstrmojo.WidgetListMapper",
        mstrmojo.mixin(
            /**
             * @lends mstrmojo.WidgetListMapper
             */
            mstrmojo._hasWidgetListMapper,
            mstrmojo.hash.copy(mstrmojo.ListMapper)
        )
    );
    
    // A public class constant. To be read by other classes.
    mstrmojo.WidgetListMapper.RENDERED = RENDERED;
    
    mstrmojo.requiresCls("mstrmojo.ListMapperHoriz");

    mstrmojo.WidgetListMapperHoriz = mstrmojo.provide(
        "mstrmojo.WidgetListMapperHoriz",
        mstrmojo.mixin(mstrmojo._hasWidgetListMapper,
            mstrmojo.hash.copy(mstrmojo.ListMapperHoriz)
        )
    );
            
})();