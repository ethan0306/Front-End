(function(){

    mstrmojo.requiresCls("mstrmojo.Button");
    
    /**
     * <p>A button that can hold and image or text.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.MenuItem = mstrmojo.declare(
        // superclass
        mstrmojo.Button,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.Button.prototype
         */
        {
            scriptClass: 'mstrmojo.MenuItem',
            
            markupString: '<div id="{@id}" class="mstrmojo-MenuItem {@cssClass} {@iconClass}" title="{@title}" style="{@cssText}" mstrAttach:click>' + 
                              '<div class="mstrmojo-MenuItem-text"></div>' + 
                          '</div>',

            markupSlots: {
                textNode: function(){ return this.domNode.firstChild; }
            }
        }
    );
        
})();
