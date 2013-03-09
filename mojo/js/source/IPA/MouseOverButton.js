(function(){

    /**
     * <p>A button that accepts mouseover action</p>
     * 
     * @class
     * @extends mstrmojo.Button
     */
    mstrmojo.IPA.MouseOverButton = mstrmojo.declare(
        // superclass
        mstrmojo.Button,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.MouseOverButton.prototype
         */
        {
            scriptClass: 'mstrmojo.MouseOverButton',
            markupString: '<div id="{@id}" class="mstrmojo-Button {@cssClass} {@iconClass}" title="{@title}" style="{@cssText}" mstrAttach:click,mousedown,mouseup,mouseover,mouseout>' + 
                            '<div class="mstrmojo-Button-text"></div>' + 
                          '</div>'
        }
    );        
})();
