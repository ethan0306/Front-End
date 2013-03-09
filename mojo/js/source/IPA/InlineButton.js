(function(){

    /**
     * <p>A button that can hold an image or text.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.IPA.InlineButton = mstrmojo.declare(
        // superclass
        mstrmojo.Button,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.Button.prototype
         */
        {
            scriptClass: 'mstrmojo.IPA.InlineButton',

            /**
             * @ignore
             */
            markupString: '<div id="{@id}" class="mstrmojo-Button {@cssClass} {@iconClass}" title="{@title}" style="{@cssText}" mstrAttach:click,mousedown,mouseup>' + 
                            '<div class="mstrmojo-Button-text"></div>' + 
                          '</div>',

            /**
             * @ignore
             */
            markupMethods: {
                onvisibleChange: function() {this.domNode.style.display = this.visible ? 'inline-block' : 'none'; },
                onenabledChange: function(){ 
                    mstrmojo.css[this.enabled ? 'removeClass' : 'addClass'](this.domNode, ['disabled']);
                },
                onselectedChange: function() {
                    mstrmojo.css[this.selected ? 'addClass' : 'removeClass'](this.domNode, ['selected']);
                },
                ontextChange: function() {
                    this.textNode.innerHTML = this.text;
                }
            }
        }
    );
    
 
        
})();
