(function () {
    mstrmojo.requiresCls("mstrmojo.android.SimpleList",
                         "mstrmojo.css");

    var $CSS = mstrmojo.css,
        clsGlow = 'glow',
        itemMarkup;

    /**
     * Applies a temporary "glow" effect to the passed element.
     *
     * @param {HTMLElement} el The element that should glow.
     *
     * @private
     */
    function doGlow(el) {
        var style = el.style;

        // Apply glow effect.
        style.webkitTransitionDuration = 0;
        $CSS.addClass(el, clsGlow);

        // Set timeout and...
        window.setTimeout(function () {
            // Remove glow effect.
            style.webkitTransitionDuration = '300ms';
            $CSS.removeClass(el, clsGlow);
        }, 100);
    }

    /**
     * Widget for displaying a list of checkbox (or radio) items that are Mobile "Touch" enabled to support selection and scrolling.
     *
     * @class
     * @extends mstrmojo.android.SimpleList
     */
    mstrmojo.ui.MobileCheckList = mstrmojo.declare(

        mstrmojo.android.SimpleList,

        null,

        /**
         * @lends mstrmojo.ui.MobileCheckList.prototype
         */
        {
            scriptClass: "mstrmojo.ui.MobileCheckList",

            /**
             * Override to default to multi-select.
             *
             * @ignore
             * @see mstrmojo._ListSelections
             */
            multiSelect: true,

            /**
             * @ignore
             * @see mstrmojo.android.SimpleList
             */
            hasEvenRows: true,

            /**
             * Whether item glows when user touches it.
             *
             * @type boolean
             * @default false
             */
            glow: true,

            listHooks: {
                select: function (el, item, idx) {
                    // Should item glows and should we NOT skip this event?
                    if (this.glow && !this.skipEvent) {
                        // Apply glow to selected element.
                        doGlow.call(this, el);
                    }
                },

                unselect: function (el, item, idx) {
                    // Should item glows, does the list support multi select and should we NOT skip this event?
                    if (this.glow && this.multiSelect && !this.skipEvent) {
                        // Apply glow to unselected element.
                        doGlow.call(this, el);
                    }
                }
            },

            getItemMarkup: function (item) {
                // Have we NOT generated the markup?
                if (!itemMarkup) {
                    // Get the markup from the super and add extra elements.
                    itemMarkup = this._super(item).replace('{@n}', '<div><h3>{@n}</h3></div>');
                }

                // Return cached markup.
                return itemMarkup;
            },

            /**
             * Override to add necessary CSS classes to cssClass property.
             *
             * @ignore
             */
            init: function init(props) {
                this._super(props);

                // Update css class property.
                var cls = [ 'mobile-checklist' ];

                // Do we support multi-select?
                if (this.multiSelect) {
                    // Add multi class.
                    cls.push('multi');
                }

                // Reset cssClass.
                mstrmojo.css.addWidgetCssClass(this, cls);
            }


        }
    );

}());
