(function() {
    
    mstrmojo.requiresCls("mstrmojo.Box", "mstrmojo._HasLayout");
    
    /** 
     * Overlay widget is used as the container to build to build layout info window
     */
    mstrmojo.Overlay = mstrmojo.declare(
        mstrmojo.Box,
        [mstrmojo._HasLayout],
        {
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible? 'block' : 'none'; },
                onheightChange: function() { this.domNode.style.height = this.height ? this.height : ''; },
                onwidthChange: function() { this.domNode.style.width = this.width ? this.width: ''; }
            },
            
            layoutConfig: {
                h: {
                    containerNode: '100%'
                },
                w: {
                    containerNode: '100%'
                }
            },
            
            scriptClass: "mstrmojo.Overlay"
        }
    );
    
})();