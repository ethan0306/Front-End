(function() {

    mstrmojo.requiresCls("mstrmojo.AndroidResultSetController");
    
    /**
     * The Graph view controller for the Android application.
     * 
     * @class
     * @extends mstrmojo.AndroidResultSetController
     */
    mstrmojo.AndroidGraphController = mstrmojo.declare(
            
        mstrmojo.AndroidResultSetController,
        
        null,

        /**
         * @lends mstrmojo.AndroidGraphController.prototype
         */
        {
            scriptClass: "mstrmojo.AndroidGraphController",
            
            modelName: "Graph",
            
            /**
             * Creates a view.
             * 
             * @param {Object} The execution parameters.
             *  
             */
            createView: function createView(res, params) {
                var me = this,
                    frame = me.contentFrame = me.newView('Graph', params);
                    
                    // Update the title.
                    frame.updateTitle(res.gd.ri.n);
                    
                    // Get the xtab and set the model.
                var graph = me.contentView = frame.getContentView();
                graph.setModel(me.model);
                return frame;
            },
            
            answerPrompts: function answerPrompts(callback) {
                var me = this,
                    contentView = me.contentView;
                if ( me.repromptFlag ) {
                    me.model.answerPrompts({
                        success: function(res) {
                            me.repromptFlag = false;
                            //TQMS 496463 We need to load page by when prompt answers changed
                            contentView.setGraphData(res);
                            callback.success(me.contentFrame);
                        },
                        failure: callback.failure,
                        prompts: callback.prompts
                    });
                } else {
                    this._super(callback);
                }
            },
            
            
            onPageBy: function onPageBy(view, pageByKeys) {
                var controller = this,
                    graph = this.contentView;
                this.model.pageBy(pageByKeys, 
                {
                    success: function (res) {
                        graph.refresh();
                    },
                    failure: function (res) {
                        mstrApp.onerror(res);
                    }
                });
            },
            
            setData: function setData(res) {
            	this.model.setData(res);
            	this.contentView.refresh();
            }
            
        });
})();