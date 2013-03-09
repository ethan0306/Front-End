(function(){

    mstrmojo.requiresCls(
        "mstrmojo.ListBox",
        "mstrmojo.hash"
    );
    
    var _H = mstrmojo.hash;
    
    mstrmojo.ListSelectorItemRenderer = _H.clone(mstrmojo.DivItemRenderer);
    
    mstrmojo.ListSelectorItemRenderer.render = function(/*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
        var nAll = item.v != "u;" ? " nAll" : "";
        return '<div mstridx="' + idx + '" class="' 
                    + widget.itemCssClass 
                    + (widget.selectedIndices[idx] ? ' ' + widget.itemSelectedCssClass : '')
                    + nAll
                    + '" style="' + widget.itemCssText + '">' 
                        + (widget.getItemName ?
                            widget.getItemName(item, idx) :
                            (widget.itemDisplayField && item[widget.itemDisplayField]) )
                     + '</div>';
    };
    
    mstrmojo.ListBoxSelector = mstrmojo.declare(
        // superclass
        mstrmojo.ListBox,
        // mixins
        null,
        // instance members 
        {
            itemRenderer: mstrmojo.ListSelectorItemRenderer
        }   
    );
    
})();