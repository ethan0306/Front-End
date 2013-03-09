(function(){

    mstrmojo.requiresCls(
            "mstrmojo.HTMLButton",
            "mstrmojo._HasContextMenu",
            "mstrmojo.ContextMenu"       
            );
    
    /**
     * A simple button widget that shows a context menu when clicked. 
     */
    mstrmojo.MenuButton = mstrmojo.declare(
        // superclass
        mstrmojo.Button,
        
        // mixins
        [mstrmojo._HasContextMenu],
        
        {
            preclick: function preclick(evt){
                this.showContextMenu();
            }
        });
})();
        