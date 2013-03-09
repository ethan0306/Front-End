(function () {

    mstrmojo.requiresCls("mstrmojo.Widget",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.array",
                         "mstrmojo.dom",
                         "mstrmojo.css");

    var $CSS = mstrmojo.css;

    /**
     * Widget for displaying drop down lists on the Android platform.
     *
     * @class
     * @extends mstrmojo.Widget
     * @borrows mstrmojo._TouchGestures
     */
    mstrmojo.android.DropDownList = mstrmojo.declare(

        mstrmojo.Widget,

        [ mstrmojo._TouchGestures ],

        /**
         * @lends mstrmojo.android.DropDownList.prototype
         */
        {
            scriptClass: "mstrmojo.android.DropDownList",

            cssDisplay: 'block',

            markupString: '<div id="{@id}" class="mstrmojo-AndroidDropDownList {@cssClass}" mstrAttach:click>{@value}</div>',

            markupMethods: {
                onvisibleChange: function () { this.domNode.style.display = (this.visible) ? this.cssDisplay : 'none'; },
                onvalueChange: function () {
                    var value = this.value,
                        options = this.options;

                    // Do we have options?
                    if (options) {
                        var idx = mstrmojo.array.find(options, 'v', value),
                            item = options[idx];

                        // Update DOM.
                        this.domNode.innerHTML = item.n;

                        // Do we have an "unset" option?
                        if (value !== "-1" && options[0].v === "-1") {
                            // Remove it.
                            options.shift();

                            // TQMS 496922.
                            idx--;
                        }

                        // Update idx silently so we don't loop.
                        this.idx = idx;
                    }
                }
            },

            /**
             * An array of items to be displayed when drop down is clicked.
             *
             * @type Object[]
             * @default null
             */
            options: null,

            /**
             * The currently selected string value.
             *
             * @type String
             * @default ''
             */
            value: '',

            /**
             * The index of the currently selected option.
             *
             * @default 0
             */
            idx: 0,

            singleSelectByField: function singleSelectByField(value) {
                this.set('value', value);
            },

            /**
             * Displays a {@link mstrmojo.ui.MobileCheckList} dialog for the user to make a selection.
             *
             */
            touchTap: function touchTap() {
                // Show a mobile checklist dialog.
                var id = this.id,
                    domNode = this.domNode,
                    app = mstrApp,
                    isTablet = app.isTablet(); 

                app.showPopup({
                    autoClose: isTablet,
                    fadeOnClose: false,
                    cssClass: (isTablet) ? 'tabletList' : '',
                    onClose: function () {
                        $CSS.removeClass(domNode, 'down');
                    },
                    children: [{
                        scriptClass: 'mstrmojo.ui.MobileCheckList',
                        items: this.options,
                        multiSelect: false,
                        isElastic: true,
                        selectedIndex: this.idx,
                        postselectionChange: function (evt) {
                            // Close the dialog.
                            // TQMS #507789: Need to close dialog before setting index to avoid random browser repaint issues.
                            mstrApp.closeDialog();

                            // Set the idx on the DropDownList.
                            mstrmojo.all[id].set('idx', evt.added[0]);
                        }
                    }]
                });

                $CSS.addClass(domNode, 'down');
            },

            touchSelect: function touchSelect() {
                this.touchTap();
            },

            onidxChange: function onidxChange() {
                // Do we have options?
                var options = this.options;
                if (options) {
                    // Update value using set so the DOM changes.
                    this.set('value', options[this.idx].v);
                }
            },

            preBuildRendering: function preBuildRendering() {
                this._super();

                // Do we have options?
                var options = this.options;
                if (options) {
                    // We need to update the value silently so we don't trigger the task call.
                    this.value = options[this.idx].v;
                }
            }
        }
    );

}());