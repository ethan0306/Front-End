(function () {

    mstrmojo.requiresCls("mstrmojo.css");

    /**
     * <p>A mixin for adding horizontal selector rendering support.</p>
     *
     * @class
     * @public
     */
    mstrmojo.android.selectors._SupportsHoriz = mstrmojo.provide(

        "mstrmojo.android.selectors._SupportsHoriz",

        /**
         * @lends mstrmojo.android.selectors._SupportsHoriz.prototype
         */
        {
            _mixinName: 'mstrmojo.android.selectors._SupportsHoriz',

            getItemProps: function getItemProps(item, idx) {
                // Get default props.
                var props = this._super(item, idx),
                    h = this.height,
                    itemCnt = this.items.length,
                    lineHeight;

                // Change tag to label.
                props.tag = 'label';

                // Is the selector horizontal?
                if (this.isHoriz) {
                    // Do we have a specified height?
                    if (h) {
                        // Set line-height to height of control so that the cell is the same height as the row.
                        lineHeight = h;
                    }

                    // Should all items be the same width?
                    if (this.itemWidthMode === 0) {
                        // Add width to item style.
                        props.style += 'width:' + Math.floor(100 / itemCnt) + '%;';
                    }
                    
                } else {
                    // Do we have a specified height?
                    if (h) {
                        // Calculate line-height for single item.
                        lineHeight = Math.round(parseInt(h, 10) / itemCnt) + 'px';
                    }
                    
                }

                // Do we have a calculated line height?
                if (lineHeight) {
                    // Apply to item style.
                    props.style += 'line-height:' + lineHeight + ';';
                }

                return props;
            },

            init: function init(props) {
                this._super(props);

                // Is this horizontal orientation?
                if (this.isHoriz) {
                    // Change display from default (block) to table.
                    this.cssDisplay = 'table';

                    // Add horizontal class.
                    var cls = [ 'horiz' ];

                    // Should all items be the same width?
                    if (this.itemWidthMode === 0) {
                        // Add fixedItems class.
                        cls.push('fixedWidth');
                    }

                    // Add collection of css classes.
                    mstrmojo.css.addWidgetCssClass(this, cls);
                }

            }
        }
    );
}());