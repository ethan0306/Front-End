(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Widget"
    );
    
    mstrmojo.WaitIcon = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins,
        null,
        
        // instance props+methods
        {
            scriptClass: "mstrmojo.WaitIcon",
                                    
            /**
             * Whether to float the icon or not.
             */
            cssFloat: 'left',

            /**
             * The icon is hidden by default.
             */
            visible: false,
            

            markupString: '<div id="{@id}" class="mstrmojo-WaitIcon {@cssClass}" style="float:{@cssFloat};{@cssText};"></div>',
            
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block': 'none'; }
            },
            
            markupSlots: {}
        
        }
    );
    
})();