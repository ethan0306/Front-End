(function(){
    /**
     * Renders a native HTML button for each item.
     * It duplicated all the methods and properties from mstrmojo.DivItemRenderer,
     * which currently contained and used by ListBox.
     * Then it will just override the implementation of render.
     */
    mstrmojo.ButtonItemRenderer =  mstrmojo.hash.copy(mstrmojo.DivItemRenderer);
    mstrmojo.ButtonItemRenderer.render = 
        function (/*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
                var nAll = item.v != "u;" ? " nAll" : "";
                return '<input mstridx="' + idx + '" class="' 
                            + widget.itemCssClass 
                            + (widget.selectedIndices[idx] ? ' ' + widget.itemSelectedCssClass : '')
                            + nAll
                            + '" style="' + widget.itemCssText + '" type="button" '
                            + ' value="' + item[widget.itemDisplayField] + '" '
                            + '/>';

        };
    /**
     *  Mixin for a ButtonList.
     *  It duplicates all properties and methods from _RendersItemDivs. 
     *  It only overrides the original itemRenderer to ButtonItemRenderer
     */
    mstrmojo._RendersItemButtons = mstrmojo.hash.copy(mstrmojo._RendersItemDivs);
    mstrmojo._RendersItemButtons.itemRenderer = mstrmojo.ButtonItemRenderer;


    mstrmojo.requiresCls("mstrmojo.ListBox");
    /**
     *  A vertical list of native HTML buttons, which are rendering on-demand
     */
    mstrmojo.ButtonList = mstrmojo.declare(
        // super class
        mstrmojo.ListBox,
        // mixins
        [mstrmojo._RendersItemButtons],
        // properties
        {
            scriptClass: "mstrmojo.ButtonList",
            cssClass: "mstrmojo-ButtonList",
            itemCssClass: "mstrmojo-ButtonItem",
            selectionPolicy: "toggle"
        }
    );    

    mstrmojo.requiresCls("mstrmojo.ListBoxHoriz");
    /**
     *  A vertical list of native HTML buttons, which are rendering on-demand
     */
    mstrmojo.ButtonListHoriz = mstrmojo.declare(
        // super class
        mstrmojo.ListBoxHoriz,
        // mixins
        [mstrmojo._RendersItemButtons],
        // properties
        {
            scriptClass: "mstrmojo.ButtonListHoriz",
            cssClass: "mstrmojo-ButtonListHoriz",
            itemCssClass: "mstrmojo-ButtonItem",
            selectionPolicy: "toggle"
            
        }
    );    

})();