(function () {

    mstrmojo.requiresCls("mstrmojo.android.SimpleList");

    /**
     * An Android specific list box selector.
     *
     * @class
     * @extends mstrmojo.SimpleList
     */
    mstrmojo.android.selectors.ListBox = mstrmojo.declare(

        mstrmojo.android.SimpleList,

        null,

        /**
         * @lends mstrmojo.android.selectors.ListBox.prototype
         */
        {
            scriptClass: "mstrmojo.android.selectors.ListBox",

            init: function init(props) {
                this._super(props);

                // Reset cssClass.
                mstrmojo.css.addWidgetCssClass(this, [ 'selector-listbox' ]);
            },

            postBuildRendering: function postBuildRendering() {
                // Does the list have a fixed height?
                var h = parseInt(this.height, 10);
                if (h) {
                    var itemsContainerNode = this.itemsContainerNode,
                        listHeight = itemsContainerNode.offsetHeight;

                    // Is the height of the items container less than the fixed list height?
                    if (listHeight < h) {
                        // Calculate line-height for each item.
                        var cnt = this.items.length,
                            lineHeight = Math.round(h / this.items.length) + 'px',
                            i = 0;

                        // Iterate items.
                        for (i = 0; i < cnt; i++) {
                            // Set line-height to calculated value so that items will fill entire selector height.
                            itemsContainerNode.childNodes[i].style.lineHeight = lineHeight;
                        }
                    }
                }

                return this._super();
            }

        }
    );
}());