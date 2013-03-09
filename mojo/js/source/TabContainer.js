(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Container",
        "mstrmojo._HasLayout",
        "mstrmojo.TabStrip",
        "mstrmojo.TabNameList",
        "mstrmojo.StackContainer");

    /**
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._HasLayout#height as #height
     * @borrows mstrmojo._HasLayout#width as #width
     * @borrows mstrmojo._HasLayout#layoutConfig as #layoutConfig
     * @borrows mstrmojo._HasLayout#onwidthChange as #onwidthChange
     * @borrows mstrmojo._HasLayout#onheightChange as #onheightChange
     * @borrows mstrmojo._HasLayout#setSlotDimension as #setSlotDimension
     */
    mstrmojo.TabContainer = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [ mstrmojo._HasLayout ],
        
        /**
         * @lends mstrmojo.TabContainer.prototype
         */
        {
            scriptClass: "mstrmojo.TabContainer",

            markupString: '<div id="{@id}" class="mstrmojo-tabcontainer {@cssClass}">' +
                              '<div class="mstrmojo-tabcontainer-tabs"></div>' +
                              '<div class="mstrmojo-tabcontainer-stack"></div>' +
                              '<div></div>' +
                          '</div>',

            markupMethods: {
                onborderChange: function(){ if (this.border) this.domNode.style.border = this.border; },
                onbackgroundChange: function(){ this.domNode.style.background = this.background || ''; }
            },
            
            markupSlots: {
                top: function(){ return this.domNode.childNodes[0]; },
                stack: function(){ return this.domNode.childNodes[1]; },
                containerNode: function() { return this.domNode.childNodes[1]; },
                bottom: function(){ return this.domNode.childNodes[2]; }
            },
            
            /**
             * Sets the target of the tab strip child equal to the stack child.
             * 
             * @ignore
             */                            
            addChildren: function ac(children, idx, silent) {
                // Call the superclass method.
                var ret = this._super(children, idx, silent);
                
                // Do we have 2 (or more) children?
                var ch = this.children;
                if (ch.length >= 2) {
                    // Look for a tabstrip child (i.e., a child whose slot is non-null and not "stack"),
                    // and a stack child (i.e., a child whose slot is "stack").
                    var tabstrip,
                        stack;
                    for (var i=0, len=ch.length; i<len; i++) {
                        var c = ch[i],
                            slot = c && c.slot;
                        if (c instanceof mstrmojo.TabStrip || c instanceof mstrmojo.TabNameList) {
                            if (!tabstrip) {
                                tabstrip = c;
                            }
                        } else if (!slot || slot === "stack") {
                            if (!stack) {
                                stack = c;
                            }
                        }
                        
                        if (tabstrip && stack) {
                            break;
                        }
                    }
                    
                    // Did we find both a tabstrip and a stack?
                    if (tabstrip && stack) {
                        // Set the target of the tabstrip to the stack.
                        tabstrip.set("target", stack);
                    }
                }
                
                return ret;
            }
        }
    );
    
})();