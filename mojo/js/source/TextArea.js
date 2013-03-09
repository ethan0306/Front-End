(function() {

    mstrmojo.requiresCls("mstrmojo.TextBox");

    /**
     * A multiline text box.  Represents a native HTML &lt;textarea&gt;.
     * 
     * @class
     * @extends mstrmojo.TextBox
     */
    mstrmojo.TextArea = mstrmojo.declare(
        // superclass
        mstrmojo.TextBox,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.TextArea.prototype
         */
        {
            /**
             * @ignore 
             */
            scriptClass: 'mstrmojo.TextArea',
                                                
            markupString: '<textarea id="{@id}" class="mstrmojo-TextArea {@cssClass}"  style="{@cssText}" '
                                + 'title="{@tooltip}" '
                                + 'rows="{@rows}" cols="{@cols}" maxlength="{@maxLength}" index="{@tabIndex}"' +
                                ' mstrAttach:focus,keydown,keyup,blur ' +                              
                              '></textarea>',
                          
            /**
             * <p>Maximum number of characters allowed in the &lt;TextArea&gt; </p>
             * @param {Integer}
             * @default 256
             */
            maxLength: 256,
            
            markupSlots: {
                inputNode: function(){ return this.domNode; }
            },
            
            postCreate: function() {
                this.markupMethods = mstrmojo.hash.copy(this.markupMethods);
                this.markupMethods.oncssClassChange = function() { 
                    this.domNode.className = "mstrmojo-TextArea " + (this.cssClass||'');
                    };
            },
            
            onkeydown: function(e) {
                var strLen = (this.value && this.value.length) || 0;

                if (this.maxLength <= strLen) {
                    //BackSpace, Delete, or Arrow keys
                    this.isDeleteKeys = e.e.keyCode === 8 || e.e.keyCode === 46;
                    this.isArrowKeys = e.e.keyCode === 37 || e.e.keyCode === 38 || e.e.keyCode === 39 || e.e.keyCode === 40;
                    
                    //flag to indicate whether there is selection in the <textArea> 
                    var hasSelection = this.domNode.selectionEnd ? (this.domNode.selectionEnd - this.domNode.selectionStart) > 0 :
                                       document.selection.createRange().text.length > 0;

                    if (!this.isDeleteKeys && !this.isArrowKeys && !hasSelection) {

                        //IE7 and 8 to stop adding input to the <textAre>
                        if (mstrmojo.dom.isIE7 || mstrmojo.dom.isIE8) {
                            var dn = this.domNode;
                            dn.blur();

                            window.setTimeout(function(){dn.focus();}, 1);
                        }

                        mstrmojo.dom.preventDefault(window, e.e);
                        return false;
                    }
                 }
             }
        }
      );
        
})();