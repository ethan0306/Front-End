(function () {

    mstrmojo.requiresCls("mstrmojo.GraphBase",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.android._IsReport",
                         "mstrmojo.graph._MobileGraphAreaHelper");

    /**
     * Synchronizes the tooltips with the supplied touch event.
     * 
     *  @param {Object} touch The current touch event.
     *  
     *  @private
     */
    function syncTooltips(x, y) {
        // Adjust x and y for position.
        var me = this,
        	pos = mstrmojo.dom.position(me.domNode, true);
        
        // subtract the position of the graph from the actual co-ordinates
        x -= pos.x;
        y -= pos.y;
        me.model.getDataService().handleUserSingleTap(-1, "", x, y, false, {
        	success: function (res) {
				me.displayTooltips(res.Areas, pos.x, pos.y);
			}
        }); // there is no node object in the report case pass -1 for sliceid and "" for nodekey
    }

    /**
     * <p>The widget for a single MicroStrategy Mobile Graph viewer.</p>
     * 
     * @class
     * @extends mstrmojo.GraphBase
     * 
     */
    mstrmojo.MobileGraph = mstrmojo.declare(

        mstrmojo.GraphBase,

        [ mstrmojo._TouchGestures, mstrmojo.android._IsReport, mstrmojo.graph._MobileGraphAreaHelper ],

        /** 
         * @lends mstrmojo.MobileGraph.prototype
         */
        {
            scriptClass: "mstrmojo.MobileGraph",

            supportedDefaultMenus: 1,

            /**
             * This string denotes the markup of each area dom node in the image map.
             * 
             * @type String
             */
            areaMarkup: '<area shape="{@shape}" coords="{@coords}" ttl="{@tooltip}" aid="{@aid}" {@extra}/>',

            cssImageClass: "mstrmojo-ReportGraph",

            setDimensions: function setDimensions(h, w) {
                this.height = h;
                this.width = w;

                // Have we rendered already?
                if (this.hasRendered) {
                    // Refresh the controller so the graph image will resize.
                    this.controller.refresh(this);
                }
            },

            preBuildRendering: function preBuildRendering() {
                // Set the areas property for future use
                var graphData = this.graphData.gd.g;
                this.as = graphData && graphData.as;

                // Call super.
                return this._super ? this._super() : true;
            },

            refresh: function refresh() {
                // Update the graph data from the model.
                this.graphData = this.model.data;

                // Call super to finish refresh.
                this._super();
            },

            /**
             * Since the graph image is retreived as a part of the graph data for standalone graphs
             * this method sets the source of the image node to the Base64 encoded image string.
             * 
             * @param {Integer|String} h The height of the requested graph image.
             * @param {Integer|String} w The width of the requested graph image.
             */
            retrieveGraphSrc: function retrieveGraphSrc(h, w) {
                var src = "data:image/png;base64," + this.graphData.ib.eb,
                    imgNode = this.imgNode;

                if (imgNode.src !== src) {
                    imgNode.src = src;
                }
            },

            /**
             * This method fakes a formats object (@see mstrmojo._Formattable) so as to provide
             * the dimensions and location of the Graph object.
             * 
             * @return Object A fake (mstrmojo._Formattable) object.
             */
            getFormats: function getFormats() {
                return {
                    height: this.height,
                    width: this.width,
                    top: 0,
                    left: 0
                };
            },

            touchTap: function touchTap(touch) {
                // hide the tooltips on touch tap event
                this.displayTooltips([], 0, 0);
            },

            touchSelectBegin: function touchSelectBegin(touch) {
                syncTooltips.call(this, touch.pageX, touch.pageY);
            },

            touchSelectMove: function touchSelectMove(touch) {
                syncTooltips.call(this, touch.pageX, touch.pageY);
            },

            beforeViewHidden: function beforeViewHidden() {
                // hide the tooltips
                mstrmojo.GraphBase.hideTooltips();

                // Notify the root view that it needs to capture the screen.
                mstrApp.rootView.takeScreenShot(this.domNode.parentNode, this.controller.did);
            },

            setModel: function setModel(model) {
                this._super(model);

                this.setGraphData(model.data);
            },

            setGraphData: function setGraphData(graphData) {
                // Cache the graph data.
                this.graphData = graphData;

                // Do have page by headers?
                if (this.hasPageBy()) {
                    // Make request for page by data.
                    this.controller.getPageByTree(this);
                }
            },

            hasPageBy: function hasPageBy() {
                return !!this.graphData.gd.pb;
            },

            handleMenuItem: function handleMenuItem(group, command) {
                // 513647, clark, hide the tooltips when touch on the menu
                syncTooltips.call(this, 0, 0);

                this._super(group, command);
            }
        }
    );

}());