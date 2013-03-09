(function() {

    mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo.css", "mstrmojo.TextBox");
    
    /**
     * A text box with a label next to it.
     * 
     * @class
     * @extends mstrmojo.TextBox
     */
    mstrmojo.TextBoxWithLabel = mstrmojo.declare(
        // superclass
        mstrmojo.TextBox,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.TextBoxWithLabel.prototype
         */
        {
            scriptClass: 'mstrmojo.TextBoxWithLabel',
                        
            /**
             * The string to appear before the textbox.
             * 
             * @type String
             */
            label: '',
            
            /**
             * The string to appear after the textbox.
             * 
             * @type String
             */
            rightLabel: '',
            
            cssDisplay: 'inline',
            
            type: "text",
                 
            markupString: '<div class="mstrmojo-TextBoxWithLabel {@cssClass}" style="{@cssText}">' +
                            '<span class="mstrmojo-TextBox-label">{@label}</span>' +
                            '<input id="{@id}" class="mstrmojo-TextBox {@inputNodeCssClass}"  style="{@inputNodeCssText}" '
                                + 'title="{@tooltip}" type="{@type}" '
                                + 'value="{@value}" size="{@size}" maxlength="{@maxLength}" index="{@tabIndex}"' +
                                ' mstrAttach:focus,keyup,blur ' +                              
                              '/>' +
                              '<span class="mstrmojo-TextBox-label-right">{@rightLabel}</span>' +
                          '</div>',
                          
            markupSlots: {
                inputNode: function(){return this.domNode.firstChild.nextSibling;}
            },
            
            preBuildRendering: function() {
                this.markupMethods = mstrmojo.hash.copy({
                                          onvisibleChange: function(){ this.domNode.style.display = this.visible ? this.cssDisplay : 'none'; },
                                          oncssClassChange: function(){this.domNode.className = "mstrmojo-TextBoxWithLabel " + (this.cssClass||'');}
                                     },
                                     mstrmojo.hash.copy(this.markupMethods));
            }
        }
    );
})();