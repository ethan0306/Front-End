(function(){

    mstrmojo.requiresCls("mstrmojo.Widget");
    
    /**
     * <p>The widget for drawing a single MicroStrategy Graph control on a HTML5 Canvas element.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.CanvasGraph = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins,
        [ mstrmojo.graph._CanvasGraph ],
        
        /** 
         * @lends mstrmojo.CanvasGraph.prototype
         */
        {
            scriptClass: "mstrmojo.CanvasGraph",
                    
            setModel: function setModel(model) {
                //Set the model
                this.model = model;
//            },
        
            // BUG:  At this point we have no access to the INITIAL_TIME created in the inner scope of the _CanvasGraph mixin.  Furthermore, what will happen for a document with
            // multiple graphs?
//            postBuildRendering: function postBuildRendering() {
//                //Set the time when the animation begun, for future use
//                INITIAL_TIME = (new Date()).getTime();
            }
        }
    );
    
}());