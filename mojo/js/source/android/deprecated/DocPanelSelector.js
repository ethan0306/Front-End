(function () {

    mstrmojo.requiresCls("mstrmojo.ListBase",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.android._IsList",
                         "mstrmojo.css");

    var itemMarkup;

    /**
     * <p>A touch enabled widget for displaying panel selectors on Mobile devices.</p>
     *
     * @class
     * @extends mstrmojo.ListBase
     */
    mstrmojo.android.DocPanelSelector = mstrmojo.declare(

        mstrmojo.ListBase,

        [ mstrmojo._TouchGestures, mstrmojo.android._IsList ],

        /**
         * @lends mstrmojo.android.DocPanelSelector.prototype
         */
        {
            scriptClass: 'mstrmojo-DocPanelSelector',

            multiSelect: false,

            icnCss: 'mstrmojo-SelectorBtns',

            height: '22px',

            init: function init(props) {
                this._super(props);

                this.cssText += 'height:' + this.height + ';';

                mstrmojo.css.addWidgetCssClass(this, 'mstrmojo-DocPanelSelector');
            },

            getItemMarkup: function getItemMarkup(item) {
                if (!itemMarkup) {
                    itemMarkup = this._super(item).replace('{@n}', '<div></div>');
                }

                return itemMarkup;
            },

            postBuildRendering: function postBuildRendering() {
                // Set explicit width for items container node so it will center itself (with auto margin).
                this.itemsContainerNode.style.width = (this.items.length * this._getItemNode(0).clientWidth) + 'px';

                // Cache reference to target.
                var selectorContainer = this.parent;
                this._target = selectorContainer.model.getUnitInstance(selectorContainer.tks, 1);

                return this._super();
            },

            postselectionChange: function postselectionChange(evt) {
                // Tell panel stack to select new panel.
                this._target.selectPanel(this.items[evt.added[0]].v, this.parent);
            }
        }
    );
}());