(function(){

    mstrmojo.requiresCls(
        "mstrmojo.css",
        "mstrmojo.Widget"
    );

    var _C = mstrmojo.css;
    
    /**
     * A TabButton for a TabStrip.
     * 
     * @class
     * @extends mstrmojo.Widget.
     */
    mstrmojo.TabButton = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins,
        null,

        /**
         * @lends mstrmojo.TabButton.prototype
         */
        {
            scriptClass: "mstrmojo.TabButton",
            
            markupString: '<span id="{@id}" class="mstrmojo-TabButton {@cssClass}" style="{@cssText}" mstrAttach:click>' +
                          '</span>',

            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'inline' : 'none'; },
                ontitleChange: function(){ this.domNode.innerHTML = this.title || ''; },
                onbackgroundColorChange: function(){ this.domNode.style.backgroundColor = this.backgroundColor || ''; },
                onselectedChange: function() { _C.toggleClass(this.domNode, ['selected'], !!this.selected); }
            }
        }
    );
    
})();
