(function () {

    mstrmojo.requiresCls("mstrmojo.string",
                         "mstrmojo.dom",
                         "mstrmojo.css");

    var $DOM = mstrmojo.dom,
        $CSS = mstrmojo.css,
        clsSelected = 'selected';

    function delegateSelect(mthName, el, item, idx, widget) {
        // If the widget has a custom hook than call it and check return value.
        var hook = widget.listHooks[mthName];
        if (hook && hook.call(widget, el, item, idx)) {
            // Hook returned true so exit.
            return;
        }

        // Hook returned false so use default selection behavior.
        $CSS[((mthName === 'select') ? 'add' : 'remove') + 'Class'](el, clsSelected);
    }

    function addToCollection(propertyName, delimiter, values) {
        // Retrieve delimited string of existing values (or empty array if none).
        var existing = this[propertyName],
            arr = (existing) ? existing.split(delimiter) : [];

        // Add new values.
        arr = arr.concat(values.split(delimiter));

        // Store values back on instance.
        this[propertyName] = arr.join(delimiter);

        // Return the index of the last added value.
        return arr.length - 1;

    }

    /**
     * <p>A mixin for adding Android specific behavior to subclasses of {@link mstrmojo.ListBase}.</p>
     *
     * @class
     * @public
     */
    mstrmojo.android._IsList = mstrmojo.provide(

        "mstrmojo.android._IsList",

        /**
         * @lends mstrmojo.android._IsList.prototype
         */
        {
            _mixinName: 'mstrmojo.android._IsList',

            /**
             * Collection of item renderer hooks that can be implemented by consumers of this mixin (for custom selection code).
             */
            listHooks: {},

            /**
             * Method for generating markup for each item.
             *
             * @param {Object} item The item that will use the markup.
             *
             * @returns The markup string for the given item containing tokens for dynamic data replacement.
             */
            getItemMarkup: function (item) {
                return '<{@tag} class="item {@cls}" idx="{@idx}" style="{@style}">{@n}</{@tag}>';
            },

            /**
             * Returns an object with markup string token replacement values for the given item.
             *
             * @param {Object} item The item to render.
             * @param {Integer} idx The index of the item.
             *
             * @returns Object
             */
            getItemProps: function getItemProps(item, idx) {
                var isSelected = !!this.selectedIndices[idx];
                return {
                    tag: 'div',                                                 // Markup root tag name.
                    sel: isSelected,                                            // True if the item is selected.
                    cls: (isSelected) ? clsSelected : '',                       // Item CSS class name.
                    n: item.n,                                                  // Item text.
                    style: '',                                                  // Item CSS text.
                    idx: idx,
                    addCls: function (cls) {
                        addToCollection.call(this, 'cls', ' ', cls);
                    },
                    addStyle: function (s) {
                        addToCollection.call(this, 'style', ';', s);
                    }
                };
            },

            itemRenderer: {
                render: function (item, idx, widget) {
                    // Add render index to item.
                    item._renderIdx = idx;

                    // Create and return markup.
                    return mstrmojo.string.apply(widget.getItemMarkup(item), widget.getItemProps(item, idx));
                },

                select: function (el, item, idx, widget) {
                    delegateSelect('select', el, item, idx, widget);
                },

                unselect: function (el, item, idx, widget) {
                    delegateSelect('unselect', el, item, idx, widget);
                }
            },
            
            touchTap: function touchTap(touch) {
                try {
                    // Select the element.
                    var item = $DOM.findAncestorByAttr(touch.target, 'idx', true, this.domNode),
                        idx = item && parseInt(item.value, 10);

                    if (idx !== null && !isNaN(idx)) {
                        // Is this a radio list?
                        if (!this.multiSelect) {
                            // Single select.
                            this.singleSelect(idx);
                        } else {
                            // Grab the selected indices and figure out whether we need to perform an add or remove.
                            var m = (this.selectedIndices[idx]) ? 'remove' : 'add';

                            // Trigger the addSelect or removeSelect method.
                            this[m + 'Select'](idx);
                        }
                    }
                } catch (ex) {
                    // This is a top level exception handler so we display the error to the user
                    // and do not re-throw the exception.
                    mstrApp.onerror(ex);
                }
            },

            /**
             * Call the touchTap method.
             *
             * @private
             */
            onclick: mstrmojo.emptyFn,

            /**
             * Overridden to call touchTap.
             *
             * @ignore
             */
            touchSelectEnd: function touchSelectEnd(touch) {
                // Call touch tap.
                this.touchTap(touch);
            }
        }
    );

    /**
     * The class name added to selected items.
     *
     * @type String
     * @static
     */
    mstrmojo.android._IsList.SELECTED_CLS = clsSelected;

}());