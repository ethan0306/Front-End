(function(){

    mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.registry",
        "mstrmojo.ListBuilder");
    
    var _H = mstrmojo.hash,
        _R = mstrmojo.registry,
        RENDERED = 1;
    
    mstrmojo.WidgetListBuilder = mstrmojo.provide(
        "mstrmojo.WidgetListBuilder",
        mstrmojo.mixin(
            {
                /**
                 * @ignore
                 */
                newContext: function bc(w){
                    var fn = w.itemFunction;
                    if (!fn) {
                        // Widget doesn't have an itemFunction, so create one from its itemConfig.
                        var cfg = w.itemConfig;
                        fn = cfg ?
                                function(item, index, widget){
                                    var c = _H.clone(cfg);
                                    c.data = item;
                                    c.parent = widget;
                                    return _R.ref(c);
                                } 
                                : null;
                    }
                    return {
                            itemStatus: [],
                            itemWidgets: [],
                            itemFunc: fn
                    };
                },
                        
                /**
                 * <p>Builds the markup for a given item.</p>
                 *
                 * @param {Widget} w The widget whose items are to be rendered.
                 * @param {Object} ctxt The context object for the given widget; provided by the "buildContext" call.
                 * @param {Integer} idx The index of the item to render.
                 * @returns {String} The item's markup string.
                 */
                build: function b(w, ctxt, item, idx){
                    var iw = ctxt.itemFunc(item, idx, w);
                    if (iw) {
                        ctxt.itemStatus[idx] = RENDERED;
                        ctxt.itemWidgets[idx] = iw;
                        // If this index is selected, mark the widget as selected.
                        if (iw.set) {
                            var s = w.selectedIndices;
                            if (s && s[idx]) {
                                iw.set("selected", true);
                            }
                        }
                    }
                    return iw;
                },

                /**
                 * Extends the inherited method in order to update the context's itemWidgets list.
                 */
                onadd: function oa(w, ctxt, evt){
                    if (ctxt) {
                        mstrmojo.array.insert(
                            ctxt.itemWidgets, 
                            evt.index, 
                            new Array(evt.value.length));
                    }
                    this._super(w, ctxt, evt);
                },
                
                /**
                 * Extends the inherited method in order to update the context's itemWidgets list.
                 */
                onremove: function orm(w, ctxt, evt){
                    if (ctxt) {
                        var ids = ctxt.itemWidgets.splice(evt.index, evt.value.length);
                        for (var i=0, len=ids.length; i<len; i++){
                            var iw = ids[i];
                            if (iw && iw.destroy) {
                                delete iw.parent;
                                // TO DO: unrender the widget? destroy the widget? For now, let's assume we should.
                                iw.destroy();
                            }
                        }
                    }
                    this._super(w, ctxt, evt);
                },
                
                /**
                 * Responds to changes in selections by updating the item widgets' "selected" property.
                 */
                onchange: function ocg(w, p, ctxt, evt) {
                    if (evt) {
                        var iws = ctxt.itemWidgets,
                            iw;
                        for (var i=0, r = evt.removed, rlen = r&&r.length; i<rlen; i++) {
                            iw = iws[r[i]];
                            if (iw && iw.set) {
                                iw.set("selected", false);
                            }
                        }
                        for (var j=0, a = evt.added, alen = a&&a.length; j<alen; j++) {
                            iw = iws[a[j]];
                            if (iw && iw.set) {
                                iw.set("selected", true);
                            }
                        }
                    }
                }
            },
            mstrmojo.hash.copy(mstrmojo.ListBuilder)
        )
    );

})();
