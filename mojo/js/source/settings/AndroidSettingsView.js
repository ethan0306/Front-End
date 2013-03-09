(function () {

    mstrmojo.requiresCls("mstrmojo.android.SimpleList",
                         "mstrmojo.settings.AndroidSettingsController",
                         "mstrmojo.android._HasLingeringListSelections",
                         "mstrmojo.Button",
                         "mstrmojo.ui.MobileCheckList",
                         "mstrmojo.TextBox",
                         "mstrmojo.ValidationTextBox",
                         "mstrmojo.string",
                         "mstrmojo.css",
                         "mstrmojo.expr",
                         "mstrmojo.dom",
                         "mstrmojo.hash",
                         "mstrmojo.array");

    mstrmojo.requiresDescs(221, 1442, 7883);

    var $STYLES = mstrmojo.settings.AndroidSettingsController.STYLES,
        $BTN = mstrmojo.Button.newAndroidButton,
        $ARR = mstrmojo.array,
        $HASH = mstrmojo.hash,
        $VAL = mstrmojo.validation,
        $TRIG = $VAL.TRIGGER,
        $SC = $VAL.STATUSCODE,
        $DTP = mstrmojo.expr.DTP,
        itemMarkup = {};

    /**
     * Widget for displaying the prompt summary list on a Mobile device.
     *
     * @class
     * @extends mstrmojo.android.SimpleList
     */
    mstrmojo.settings.AndroidSettingsView = mstrmojo.declare(

        mstrmojo.android.SimpleList,

        [ mstrmojo.android._HasLingeringListSelections ],

        /**
         * @lends mstrmojo.settings.AndroidSettingsView.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidSettingsView",

            cssClass: 'mstrmojo-AndroidSettings',

            listHooks: {
                select: function (el, item, idx) {
                    // Change transition duration to zero so it highlights immediately.
                    el.style.webkitTransitionDuration = 0;

                    // Is the item disabled?
                    if (item.disabled) {
                        // Yes, return TRUE to inhibit selection.
                        return true;
                    }

                    // Is the item not a button that opens other views?
                    if (item.style !== $STYLES.VIEW_BUTTON) {
                        // Set the clear handler to clear selections after 200 milliseconds.
                        this.setClearHandler(200);
                    }
                },
                unselect: function (el, item, idx) {
                    // Set duration to non-zero value so the background color will fade out.
                    el.style.webkitTransitionDuration = '300ms';
                }
            },

            /**
             * Overriding this property such that it tells the main view that the Android Settings View only supports the Home menu option.
             *
             * @see mstrmojo.AndroidMainView
             */
            supportedDefaultMenus: 5,

            getItemMarkup: function (item) {
                var s = item.style;
                // Have we NOT generated the markup for this item's style?
                if (!itemMarkup[s]) {
                    // Default to H3-H4 markup.
                    var newMarkup = '<div><h3>{@ttl}</h3><h4>{@value}</h4></div>';

                    // Is the item a text area?
                    if (s === $STYLES.TEXT_AREA) {
                        // Use readonly DIV containing title.
                        newMarkup = '<div readonly="readonly">{@ttl}</div>';

                    // Is the item an image?
                    } else if (s === $STYLES.IMAGE) {
                        // Use simple H3.
                        newMarkup = '<h3></h3>';
                    }

                    // User supert to generate markup, replace with new markup and store result in the cache.
                    itemMarkup[s] = this._super(item).replace('{@n}', newMarkup);
                }

                return itemMarkup[s];
            },

            getItemProps: function getItemProps(item, idx) {
                var value = item.v,
                    props = this._super(item, idx);

                // Add title and value.
                props.ttl = item.nm;
                props.value = value || '';

                // What is the style of the item.
                switch (item.style) {

                case $STYLES.BUTTON:
                case $STYLES.VIEW_BUTTON:
                    // Add any additional CSS classes.
                    if (item.textStyle) {
                        props.addCls(item.textStyle);
                    }
                    break;

                case $STYLES.TEXT_AREA:
                    props.addCls('textarea');
                    break;

                case $STYLES.HEADER:
                    // Add header css class.
                    props.addCls('header');
                    break;

                case $STYLES.IMAGE:
                    // Add header css class.
                    props.addCls('image');
                    if (item.imgCls) {
                        props.addCls(item.imgCls);
                    }
                    break;

                case $STYLES.NUMBER:
                case $STYLES.TEXT:
                    // Add drop down css class.
                    props.addCls('drop-down');

                    // Support for passwords where need to show asterisk instead of the actual name.
                    if (item.pwd) {
                        props.value = '********';
                    }
                    break;

                case $STYLES.LIST:
                    // Add drop down css class.
                    props.addCls('drop-down');

                    // Value will be the 'n' property of the selected item.
                    var items = item.items;
                    props.value = items[$ARR.find(items, 'v', value)].n;
                    break;

                case $STYLES.CHECK:
                    // Add checkbox css class.
                    props.addCls('check');

                    // Is the item currently checked?
                    if (value === item.on) {
                        // Add the checked css class.
                        props.addCls('on');
                    }

                    // Clear the value because we don't want to display the value for checkboxes.
                    props.value = '';
                    break;
                }

                // Do we have a value?
                if (props.value) {
                    // Add item class for description.
                    props.addCls('with-desc');
                }

                // It the item hidden?
                if (item.hidden) {
                    // Add item class to hide.
                    props.addCls('hidden');
                }

                return props;
            },

            populateActionMenu: function populateActionMenu(config) {
                // Delegate the request to the controller to populate the menu.
                this.controller.populateMenu(config);
            },

            handleMenuItem: function handleMenuItem(group, command) {
                // Delegate the request to the controller to handle the menu item.
                this.controller.handleMenuItem(group, command);
            },

            /**
             * Calls fnPress for clicked item (if present).
             *
             * @param {Event} touch
             * @ignore
             */
            touchSelectBegin: function touchSelectBegin(touch) {
                // Search for the element that was selected.
                var info = mstrmojo.dom.findAncestorByAttr(touch.target, 'idx', true, this.domNode);
                if (info) {
                    // Get the item for the clicked element.
                    var item = this.items[info.value],
                        fnPress = item.fnPress;

                    // Does the item have a press function?
                    if (fnPress) {
                        // Call the press function.
                        fnPress.call(this.controller, item);

                        // Return false to cancel normal touch events.
                        return false;
                    }
                }

                // Return true so the touch event will proceed as normal.
                return true;
            },

            /**
             * Overridden to execute action.
             *
             *  @param {Event} evt The associated event.
             *  @ignore
             */
            postselectionChange: function postselectionChange(evt) {
                var added = evt.added;
                if (!added) {
                    return;
                }

                // Get the information about the prompt.
                var idx = added[0],
                    item = this.items[idx];

                // Initialize dialog fields.
                var me = this,
                    dialogConfig = {
                        title: item.nm
                    },
                    dialogChildren = [],
                    fnOk,
                    dialog,
                    fnUpdateValue = function (item, value) {
                        // Notify controller of change.
                        item.fn(value);

                        // Update the item HTML element.
                        me.updateItem(idx);
                    };

                // What is the style of the prompt?
                switch (item.style) {
                case $STYLES.BUTTON:
                case $STYLES.VIEW_BUTTON:
                    // Does the item have an item function?
                    if (item.fn) {
                        // Pass control to item function.
                        item.fn();
                    }
                    break;

                case $STYLES.NUMBER:
                case $STYLES.TEXT:
                    var isNum = (item.style === $STYLES.NUMBER),
                        type = isNum ? "number" : ((item.pwd) ? 'password' : 'text'),
                        sc = "mstrmojo." + (isNum ? "ValidationTextBox" : "TextBox");

                    // Add custom class to dialog.
                    dialogConfig.cssClass = 'edtTextInput';

                    var tb = {
                            scriptClass: sc,
                            value: item.v,
                            type: type,
                            onEnter: function () {
                                var eb = dialog.children[0],
                                    isValid = (eb.isValid && eb.isValid()) || (!eb.isValid);

                                if (isValid) {
                                    // Update items.
                                    fnUpdateValue(item, this.value);

                                    // Close dialog.
                                    dialog.close();
                                }
                            },
                            onRender: function () {
                                // Set focus to input element.
                                this.focus();
                            }
                        };

                    // is this a NUMBER input element?
                    if (isNum) {
                        // add the properties required for validation of the text box
                        tb = $HASH.copy(tb, {
                            dtp: $DTP.UNSIGNED,
                            min: item.limits.min,
                            max: item.limits.max,
                            constraints: {
                                trigger: $TRIG.ONKEYUP,
                                validator: function (v) {
                                    v = parseInt(v, 10);

                                    var min = this.min,
                                        max = this.max,
                                        msg = (v >= min && v <= max) ? '' : mstrmojo.desc(7883).replace('##', min).replace('###', max);

                                    return {
                                        code: (msg) ? $SC.INVALID : $SC.VALID,
                                        msg: msg
                                    };
                                }
                            }
                        });
                    }

                    // Add text box child.
                    dialogChildren.push(tb);

                    //Set up the Ok button for the dialog
                    fnOk =  function () {
                        var eb = dialog.children[0];

                        // do we have a validate function?
                        if (eb.validate) {
                            // yes, call it.
                            eb.validate();

                            // are the edit contents valid?
                            if (eb.isValid()) {

                                // yes
                                fnUpdateValue(item, eb.value);
                                return true;
                            }

                            // no
                            return false;
                        } else {
                            // no validate function so just update
                            fnUpdateValue(item, eb.value);
                            return true;
                        }
                    };

                    break;

                case $STYLES.LIST:
                    var items = item.items;

                    // Add text box child.
                    var optionList = new mstrmojo.ui.MobileCheckList({
                        items: items,
                        multiSelect: false,
                        isElastic: true,
                        selectedIndex: $ARR.find(items, 'v', item.v)
                    });

                    // Add option list as child.
                    dialogChildren.push(optionList);

                    // Add click handler to Ok button.
                    fnOk = function () {
                        // Update item value.
                        fnUpdateValue(item, items[optionList.selectedIndex].v);
                    };
                    break;

                case $STYLES.CHECK:
                    // Update the item.
                    fnUpdateValue(item, (item.v === item.on) ? item.off : item.on);
                    break;
                }

                // Do we have a child for the dialog?
                if (dialogChildren.length) {
                    // Add children collection.
                    dialogConfig.children = dialogChildren;

                    // Do we have an ok function?
                    if (fnOk) {
                        // Add Ok and Cancel buttons.
                        dialogConfig.buttons = [ $BTN(mstrmojo.desc(1442, 'OK'), fnOk), $BTN(mstrmojo.desc(221, 'Cancel')) ];
                    }

                    // Show dialog, caching dialog in local variable.
                    dialog = mstrApp.showDialog(dialogConfig);
                }
            }
        }
    );
}());