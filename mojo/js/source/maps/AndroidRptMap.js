(function () {

    mstrmojo.requiresCls("mstrmojo.android._IsReport",
                         "mstrmojo.maps.AndroidMap");

    /**
     * <p>A widget to display a report based Google Map Widget on the Android platform.</p>
     */
    mstrmojo.maps.AndroidRptMap = mstrmojo.declare(
        /**
         * Superclass
         */
        mstrmojo.maps.AndroidMap,

        /**
         * Mixins
         */
        [ mstrmojo.android._IsReport ],

        {
            scriptClass: 'mstrmojo.maps.AndroidRptMap',
            
            beforeViewHidden: function beforeViewHidden() {
                // Notify the root view that it needs to capture the screen.
                mstrApp.rootView.takeScreenShot(this.domNode, this.controller.did);
            },
            
            hasPageBy: function hasPageBy() {
                var gridHeaders = this.gridData.ghs;
                return !!(gridHeaders && gridHeaders.phs);
            },

            setModel: function setModel(model) {
                this._super(model);

                // Have we NOT already retrieved the page by tree for this xtab?
                if (!this.pageByData) {
                    // Make request for page by data.
                    this.controller.getPageByTree(this);
                }
            }
        }
    );
}());