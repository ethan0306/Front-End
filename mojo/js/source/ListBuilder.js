(function(){

    mstrmojo.requiresCls("mstrmojo.string");
    
    var _S = mstrmojo.string,
        RENDERED = 1;
    
    mstrmojo.ListBuilder = mstrmojo.provide(
        "mstrmojo.ListBuilder",
        {
            /**
             * <p>Returns a new context object which the calling widget should pass into subsequent renderer calls.</p>
             *
             * <p>The context object is used to convey any necessary state information for the rendering cycle. A new
             * context object is typically required for each new rendering, so this method should be called once at the start
             * of the calling widget's render cycle.</p>
             *
             * @param {Widget} w The widget whose items' markup is to be rendered.
             * @returns {Object} The context object.
             */
            newContext: function bc(w){
                var fn = w.itemMarkupFunction;
                if (!fn) {
                    // Widget doesn't have an itemMarkupFunction, so create one from either its itemMarkup or itemField.
                    var s = w.itemMarkup || 
                            (w.itemField && '<div class="mstrmojo-text">{@' + w.itemField + '}</div>');
                    fn = s ?
                            function(item, index, widget){
                                return _S.apply(s, item);
                            } 
                            : null;
                }
                return {
                        itemStatus: [],
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
                ctxt.itemStatus[idx] = RENDERED;
                return ctxt.itemFunc(item, idx, w);
            },
            
            onadd: function oa(w, ctxt, evt){
                if (ctxt) {
                    mstrmojo.array.insert(
                        ctxt.itemStatus, 
                        evt.index, 
                        new Array(evt.value.length));
                }
            },
            
            onremove: function orm(w, ctxt, evt){
                if (ctxt) {
                    ctxt.itemStatus.splice(evt.index, evt.value.length);
                }
            }
        });
})();
