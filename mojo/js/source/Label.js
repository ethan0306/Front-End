(function(){

    mstrmojo.requiresCls("mstrmojo.Widget");
    
    mstrmojo.Label = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.Label",
            
            /**
             * The text (or HTML) to be displayed in the label.
             */
            text: null,

            markupString: '<div id="{@id}" class="mstrmojo-Label {@cssClass}" style="{@cssText}" mstrAttach:click>' + 
                          '</div>',
            
            /**
             * css display property value used when widget is visible
             * @type String
             */            
            cssDisplay: 'block',
                          
            markupMethods: {
                ontextChange: function(){ this.domNode.innerHTML = (this.text != null) ? this.text : ''; },
                oncssTextChange: function() { this.domNode.style.cssText = (this.cssText != null) ? this.cssText : ''; },
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? this.cssDisplay : 'none'; }
            },
            
            // There are no markupSlots, so we can omit that property.

            /**
             * If true, this widget will update its visible property when we set its "text" property:
             * false, if text is null or empty; true otherwise.
             */
            autoHide: false,            
            
            /**
             * Custom setter for text, implements the autoHide feature.
             */
            _set_text: function sttxt(n, v) {
                if (this.autoHide) {
                    this.set('visible', (v!=null) && (v!=="")); // must use !=="" because value 0 should not be hidden
                }
                var was = this.text;
                this.text = v;
                return was != v;
            }
        }
    );
    
})();