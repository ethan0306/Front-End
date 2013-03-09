(function(){


    mstrmojo.requiresCls("mstrmojo._HasBuilder",
                         "mstrmojo._HasLayout",
                         "mstrmojo.Container");

    var DARK_BORDER_WIDTH = 1;

    mstrmojo.maps.AndroidDocMapInfoWindow = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [ mstrmojo._HasBuilder, mstrmojo._HasLayout ],
        
        // instance props+methods
        {
            scriptClass: "mstrmojo.AndroidDocMapInfoWindow",
            
            markupString: '<div class="mstrmojo-DocInfoWindow-wrapper">' +
                              '<div id="{@id}" class="mstrmojo-DocInfoWindow"></div>' +
                          '</div>',

            markupSlots: {
                infoNode: function() { return this.domNode.firstChild; },
                containerNode: function() { return this.domNode.firstChild; }
            },
                        
            getChildren: function getChildren(){
                
                var m = this.model,
                    c = m.getLayoutDataCache(m.getCurrentLayoutKey())[this.psId],
                    f = c.defn.fmts;
                
                // Override positioning format of child.
                f.left = DARK_BORDER_WIDTH + 'px';
                f.top = DARK_BORDER_WIDTH + 'px';
                
                return [c];
            }
        });

}());