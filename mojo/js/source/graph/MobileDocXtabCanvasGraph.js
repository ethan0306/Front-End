/**
  * MobileDocXtabCanvasGraph.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>The widget for a single HTML5 Canvas-basedv MicroStrategy Report Services Graph control on a mobile device.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */
(function () {

    mstrmojo.requiresCls("mstrmojo.MobileDocXtabGraph", 
                         "mstrmojo.graph._CanvasGraph");
    
    /**
     * @class
     * @extends mstrmojo.DocXtabGraph
     */
    mstrmojo.graph.MobileDocXtabCanvasGraph = mstrmojo.declare(
        mstrmojo.MobileDocXtabGraph,
        
        [ mstrmojo.graph._CanvasGraph ],
        
        /** 
         * @lends mstrmojo.graph.MobileDocXtabCanvasGraph.prototype
         */
        {
            
            scriptClass: "mstrmojo.graph.MobileDocXtabCanvasGraph",
            update: function update(node) {
                delete this.graphData;
                
                this._super(node);
            },
            
            setModel: function setModel(model) {
                // _CanvasGraph assumes there will be a graph data node so retrieve it from the model now.
                this.graphData = model.data;
            },

            retrieveGraphSrc: function retrieveGraphSrc(h, w) {
                if (!this.graphData) {
                    var id = this.id,
                        parentMethod = this._super;
                                    
                    this.model.getDataService().getRWGraphImage({
                        w: w, 
                        h: h, 
                        k: this.k, 
                        sid: this.node.data.sid
                    }, {
                        success: function (res) {
                            var graph = mstrmojo.all[id];
    
                            // Set the model.
                            graph.setModel({
                                data: res
                            });
                            
                            // Call the _super to render graph.
                            parentMethod.call(graph, h, w);
                        }
                    });
                } else {
                    this._super(h, w);
                }
            }
        }
    );
    
}());



        
