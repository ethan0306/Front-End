(function(){

    mstrmojo.requiresCls("mstrmojo.Button");
    
    /**
     * <p>Represents a native HTML button (&lt;input type="button" /&gt;).</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.HTMLButton = mstrmojo.declare(
        // superclass
        mstrmojo.Button,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.HTMLButton.prototype
         */
        {
            scriptClass: 'mstrmojo.HTMLButton',
                        
            markupString: '<input id="{@id}" type="button" class="mstrmojo-text mstrmojo-HTMLButton {@cssClass} {@iconClass}" '
                            + 'title="{@title}" style="{@cssText}" ' 
                            + 'mstrAttach:click />',

            markupSlots: {
                inputNode: function(){ return this.domNode; }
        	},

            markupMethods: {
                onvisibleChange: function() {this.domNode.style.display = this.visible ? 'inline' : 'none'; },
                onenabledChange: function(){ 
                    //this.domNode.disabled = !this.enabled;  //#427606 
                    mstrmojo.css[this.enabled ? 'removeClass' : 'addClass'](this.domNode, ['disabled']);
                },
                onselectedChange: function() {
                    mstrmojo.css[this.selected ? 'addClass' : 'removeClass'](this.domNode, ['selected']);
                },
                ontextChange: function() {
                	this.inputNode.value = this.text != null ? this.text : '';
                },
                oniconClassChange: function(){
                    this.domNode.className = "mstrmojo-text mstrmojo-HTMLButton " + this.cssClass + " " + this.iconClass + (this.enabled? '' : ' disabled'); 
                }
            }
        }
    );
        
})();
