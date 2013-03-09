(function () {

    mstrmojo.requiresCls("mstrmojo.ListBase",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.android._IsList",
                         "mstrmojo.android.selectors._SupportsHoriz");

    var itemMarkup,
        LINE_REG_EXP = /line-height:(\d*)px/;

    /**
     * An Android specific selector Button bar.
     *
     * @class
     * @extends mstrmojo.ListBase
     *
     * @borrows mstrmojo._TouchGestures
     * @borrows mstrmojo.android._IsList
     * @borrows mstrmojo.android.selectors._SupportsHoriz
     */
    mstrmojo.android.selectors.ButtonBar = mstrmojo.declare(

        mstrmojo.ListBase,

        [ mstrmojo._TouchGestures, mstrmojo.android._IsList, mstrmojo.android.selectors._SupportsHoriz ],

        /**
         * @lends mstrmojo.android.selectors.ButtonBar.prototype
         */
        {
            scriptClass: "mstrmojo.android.selectors.ButtonBar",

            cssClass: 'selector-btnbar',

            getItemMarkup: function getItemMarkup(item) {
                if (!itemMarkup) {
                    itemMarkup = this._super(item).replace('{@n}', '<div>{@n}</div>');
                }

                return itemMarkup;
            },

            getItemProps: function getItemProps(item, idx) {
                // Get default props and extract line-height.
                var props = this._super(item, idx),
                    style = props.style,
                        lineHeight = style.match(LINE_REG_EXP);

                // Do we have a specific item line-height?
                    if (lineHeight) {
                        // Reduce the line height by 2 pixels to account for borders.
                        props.style = style.replace(LINE_REG_EXP, 'line-height:' + (parseInt(lineHeight[1], 10) - 2) + 'px');
                }

                return props;
            }
        }
    );
}());