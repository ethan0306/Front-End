/**
  * MobileXtabCanvasGraph.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>The widget for a single HTML5 Canvas-basedv MicroStrategy Report Services Graph control on a mobile device.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */
(function () {

    mstrmojo.requiresCls("mstrmojo.MobileGraph", 
                         "mstrmojo.graph._CanvasGraph");
    
    /**
     * @class
     * @extends mstrmojo.MobileGraph
     */
    mstrmojo.graph.MobileXtabCanvasGraph = mstrmojo.declare(
        mstrmojo.MobileGraph,
        
        [ mstrmojo.graph._CanvasGraph ],
        
        /** 
         * @lends mstrmojo.graph.MobileXtabCanvasGraph.prototype
         */
        {
            scriptClass: "mstrmojo.graph.MobileXtabCanvasGraph"
        }
    );
    
}());



        
