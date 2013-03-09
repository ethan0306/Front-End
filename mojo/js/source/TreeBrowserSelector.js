(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.ListSelector"
    );
    
    /**
     * Override the ListSelector so that every click is to toggle its selection. 
     */
    mstrmojo.TreeBrowserSelector = mstrmojo.provide(
            "mstrmojo.TreeBrowserSelector",
            mstrmojo.hash.copy(
                    {
                        premousedown: function pmd(w, p, evt){
                            var hWin = evt.hWin,
                                e = evt.e,
                                el = mstrmojo.dom.eventTarget(hWin, e),
                                idx = w.listMapper.findIndex(w, p, el);
                            if (idx > -1) {
                                w.toggleSelect(idx);
                            }
                        }
                    },
            mstrmojo.hash.copy(mstrmojo.ListSelector)
        )
    );
    
})();