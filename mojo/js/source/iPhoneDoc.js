(function(){

    mstrmojo.requiresCls("mstrmojo.Container",
                         "mstrmojo._IsRwDocument",
                         "mstrmojo._HasBuilder",
                         "mstrmojo.array");

    /**
     * The widget for a single MicroStrategy iPhone Report Services document.
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._IsRwDocument#updateXtabStyles as #updateXtabStyles
     * @borrows mstrmojo._IsRwDocument#buildChildren as #buildChildren
     * 
     * @borrows mstrmojo._HasBulder#buildChildren as #buildChildren
     */
    mstrmojo.iPhoneDoc = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        [ mstrmojo._HasBuilder, mstrmojo._IsRwDocument],
        
        /**
         * @lends mstrmojo.iPhoneDoc.prototype
         */
        {
            scriptClass: "mstrmojo.iPhoneDoc",

            markupString: '<div id="{@id}" class="mstrmojo-iPhoneDoc" style="{@cssText}"></div>',
            
            markupSlots: {
                containerNode: function(){ return this.domNode; }
            },
            
            buildChildren: function buildChildren(noAddChildren) {
                // Did we build children (pass false to add children automatically)?
                if (this._super(false)) {
                    // Select the current layout if any. Use set() so that stack can use a custom setter to show/hide its children.
                    var k = this.model.getSelectedKey(this.node),
                        i = (k !== null) ? mstrmojo.array.find(this.children, "k", k) : -1,
                        ch = (i > -1) ? this.children[i] : null;
                    
                    //Set the current child to be visible.
                    if (ch) {
                        ch.set("visible", true);
                    }
                        
                    return true;
                }
                
                return false;
            }
        }
    );
    
})();
