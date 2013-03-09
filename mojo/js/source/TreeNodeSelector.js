(function(){

    mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.dom",
        "mstrmojo.ListSelector");
        
    var _D = mstrmojo.dom,
        _IE = _D.isIE;
            
    mstrmojo.TreeNodeSelector = mstrmojo.provide(
        "mstrmojo.TreeNodeSelector",
        mstrmojo.mixin(
            {
                /**
                 * <p>Extends the inherited method in order to notify the tree of a possibly change in selection.</p>
                 *
                 * <p>Also checks if event has already been handled by this tree, and if so, skips event processing.</p>
                 */
                premousedown: function pmd(w, p, evt){
                    var t = w && w.tree || w,
                        e = evt && evt.e;
                    if (!e) {
                        return false;
                    }
                    
                    // Has this event already been processed by this tree? If so, skip event processing.
                    var lmd = t.lastMouseDown;
                    if (lmd) {
                        // Hack: IE wont let us persist data on the event object across bubbling; so
                        // we need a way to determine if this event is the same one just handled by
                        // some other sub-node.  Therefore, we see how much time has elapsed. Hopefully
                        // humans cannot mousedown twice in less than 50ms!
                        if (
                            (lmd.e === e) ||
                            (_IE && ((new Date())-lmd.dt < 50) )
                            ) {
                            return false;
                        }
                    }
                        
                    //if (t && e.mstrmojoInf && e.mstrmojoInf.treeId === t.id) {
                    //    return false;
                    //}

                    // Call the inherited method in the node to process the event first.                        
                    this._super(w, p, evt);
                    
                    // Then notify the tree so it can process the event too.
                    if (t){
                        if (t.onnodemousedown) {
                            t.onnodemousedown(evt);
                        }
                        // Mark the event as processed by the tree for future reference.
                        t.lastMouseDown = {e: e, dt: new Date()};
                        //t.lastMouseDown.mstrmojoInf || {};
                        //inf.treeId = t.id;
                        //e.mstrmojoInf = inf;
                    }
                }
                
            },
            mstrmojo.hash.copy(mstrmojo.ListSelector)
        )
    );
        
})();