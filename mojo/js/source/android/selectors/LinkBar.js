(function () {

    mstrmojo.requiresCls("mstrmojo.ListBase",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.android._IsList",
                         "mstrmojo.android.selectors._SupportsHoriz",
                         "mstrmojo.color",
                         "mstrmojo.css");

    /**
     * Utility function for overriding item renderer select and unselect methods.
     *
     * @param {Boolean} isSelected True if the select method is requested, false if not.
     *
     * @returns Function
     * @private
     */
    function getItemRenderMethod(isSelected) {
        return function (el, item, idx, widget) {
            // Create default items style and class name values.
            var style = el.style,
                clsMethod = 'remove',
                bgColor = 'transparent',
                color = 'inherit';

            // Is the item selected?
            if (isSelected) {
                // Change to selected item style and class name.
                clsMethod = 'add';
                bgColor = widget.selColor;
                color = widget._txtColor;
            }

            // Set item style properties.
            style.backgroundColor = bgColor;
            style.color = color;

            // Add (or remove) selected class.
            mstrmojo.css[clsMethod + 'Class'](el, mstrmojo.android._IsList.SELECTED_CLS);
        };
    }

    /**
     * An Android specific selector link bar.
     *
     * @class
     * @extends mstrmojo.ListBase
     */
    mstrmojo.android.selectors.LinkBar = mstrmojo.declare(

        mstrmojo.ListBase,

        [ mstrmojo._TouchGestures, mstrmojo.android._IsList, mstrmojo.android.selectors._SupportsHoriz ],

        /**
         * @lends mstrmojo.android.selectors.LinkBar.prototype
         */
        {
            scriptClass: "mstrmojo.android.selectors.LinkBar",

            /**
             * The background color of selected links.
             *
             * @type String
             * @default #60b1f6
             */
            selColor: '#60b1f6',

            getItemMarkup: function (item) {
                var itemMarkup = this._itemMarkup;
                if (!itemMarkup) {
                    // Add separator and use font color from formats (defaults to black) for separator background color.
                    this._itemMarkup = itemMarkup = this._super(item).replace('{@n}', '<div>{@n}<div style="background-color:' + (this.parent.getFormats().color || '#000') + ';"></div></div>');
                }

                return itemMarkup;
            },

            getItemProps: function getItemProps(item, idx) {
                // Get default props.
                var props = this._super(item, idx);

                // Is the item selected?
                if (props.sel) {
                    // Add selected state colors in the style property.
                    props.style += 'color:' + this._txtColor + ';background-color:' + this.selColor + ';';
                }

                return props;
            },

            preBuildRendering: function preBuildRendering() {
                // Add specific css class.
                this.cssClass += ' selector-linkbar';

                // Calculate a contrasting color for text of selected elements.
                this._txtColor = mstrmojo.color.getContrastingColor(this.selColor, ['#ffffff', '#000000']);

                return this._super();
            }
        }
    );

    var linkBar = mstrmojo.android.selectors.LinkBar.prototype,
        itemRenderer = linkBar.itemRenderer;

    // Override default item render methods.
    linkBar.itemRenderer = {
        render: itemRenderer.render,
        select: getItemRenderMethod(true),
        unselect: getItemRenderMethod(false)
    };

}());