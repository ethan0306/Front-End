(function(){

    mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.WidgetListBuilder");
    
    /**
     * <p>A list builder for a tree of widgets.</p>
     *
     * <p>Extends the WidgetListBuilder in order to assign each tree node widget a handle ("tree") to the tree widget.</p>
     *
     * @class
     */
    mstrmojo.WidgetTreeBuilder = mstrmojo.provide(
        "mstrmojo.WidgetTreeBuilder",
        mstrmojo.mixin(
            {
                /**
                 * @ignore
                 */
                newContext: function bc(w){
                    var c = this._super(w);
                    // Did the inherited method manufacture an item function?
                    if (!w.itemFunction && c.itemFunc) {
                        // Extend that function to set a "tree" handle.
                        var ifn = c.itemFunc;
                        c.itemFunc = function(item, index, widget){
                            var iw = ifn(item, index, widget);
                            if (iw) {
                                iw.tree = widget.tree || widget;
                            }
                            return iw;
                        };
                    }
                    return c;
                }
            },
            mstrmojo.hash.copy(mstrmojo.WidgetListBuilder)
        )
    );

})();
