(function () {

    mstrmojo.requiresCls("mstrmojo.android.SimpleList",
                         "mstrmojo._HasLayout",
                         "mstrmojo._SupportsEllipsisText",
                         "mstrmojo.date",
                         "mstrmojo.string",
                         "mstrmojo.num",
                         "mstrmojo.hash",
                         "mstrmojo.array",
                         "mstrmojo.StringBuffer",
                         "mstrmojo.GeoLocation",
                         "mstrmojo.Button",
                         "mstrmojo.TextBox",
                         "mstrmojo.ui.MobileSlider",
                         "mstrmojo.MobileCalendar",
                         "mstrmojo.android.AndroidElementsPicker",
                         "mstrmojo.android._HasLingeringListSelections",
                         "mstrmojo.locales.datetime",
                         "mstrmojo.prompt.WebPrompt",
                         "mstrmojo.ui.MobileDateTimePicker",
                         "mstrmojo.BarcodeReader");

    mstrmojo.requiresDescs(221, 1442, 6149, 8382, 8383, 8384, 8397, 8761);

    var $STYLES = mstrmojo.prompt.WebPrompt.STYLES,
        $TYPES = mstrmojo.prompt.WebPrompt.TYPES,
        $NUM = mstrmojo.num,
        $BTN = mstrmojo.Button.newAndroidButton,
        $ARR = mstrmojo.array;

    /**
    * Cache to hold prompt style markup.
    *
    * @private
    */
    var itemMarkupCache = {};

    /**
    * Inline event handling for stepper prompt style.
    */
    var stepperDown = ' onclick="mstrmojo.all.{@wid}.clickStepper(arguments[0], {@idx}, false);"',
        stepperUp = stepperDown.replace('false', 'true');

    /**
    * Ellipsizes the H3 and H4 child elements of the given node.
    *
    * @param {HTMLElement} node The node whose elements should be ellipsized.
    */
    function ellipsizeItem(node, idx) {

        var childNodes = node.firstChild.childNodes,
            firstChild = childNodes[0],
            item = this.items[idx],
            ellipsized = this.ellipsize('h3', firstChild, true);

        if (ellipsized && parseInt(item.promptType, 10) === mstrmojo.prompt.PromptTypes.ELEMENTS_PROMPT && item.answer) {

            var nodeHTML = firstChild.innerHTML,
                answersCount = String(item.getAnswersCount());

            nodeHTML = nodeHTML.substr(0, nodeHTML.length - answersCount.length - 5);
            firstChild.innerHTML = nodeHTML + '...(' + answersCount + ')';
        }

        this.ellipsize('h4', childNodes[1], true);
    }

    /**
    * Helper method for setting answer on prompt
    */
    function setAnswer(item, idx, vals) {
        try {
            //item.setAnswerValue(vals);
            item.setAnswerValue.apply(item, vals);
        } catch (e) {
            mstrmojo.alert(e.message || e);
            return false;
        }

        // Update the item HTML element.
        this.updateItem(idx);
        return true;
    }


    /**
    * Widget for displaying the prompt summary list on a Mobile device.
    *
    * @class
    * @extends mstrmojo.android.SimpleList
    */
    mstrmojo.prompt.MobilePromptSummary = mstrmojo.declare(

        mstrmojo.android.SimpleList,

        [mstrmojo._SupportsEllipsisText, mstrmojo.android._HasLingeringListSelections],

    /**
    * @lends mstrmojo.prompt.MobilePromptSummary.prototype
    */
        {
            scriptClass: "mstrmojo.prompt.MobilePromptSummary",

            listHooks: {
                select: function (el, item, idx) {
                    // Change transition duratio to zero so it highlights immediately.
                    el.style.webkitTransitionDuration = 0;

                    // Set the clear handler to clear selections after 200 milliseconds.
                    this.setClearHandler(200);
                },
                unselect: function (el, item, idx) {
                    // Set duration to non-zero value so the background color will fade out.
                    el.style.webkitTransitionDuration = '300ms';
                }
            },

            getItemMarkup: function (item) {
                // Get the prompt style and markup from the cache.
                var style = item.getStyle(),
                    req = item.req,
                    cacheKey = style + String(req),
                    markup = itemMarkupCache[cacheKey];

                // Do we NOT already have markup?
                if (!markup) {
                    // Create buffer and populate with generic markup.
                    var sb = new mstrmojo.StringBuffer(),
                        itemReqClass = ' class="prompt-item-required"';

                    sb.append('<div class="prompt-item {@cls}" idx="{@idx}"><div><h3>');

                    if (req) {
                        sb.append('<span' + itemReqClass + '>*</span>');
                    }

                    sb.append('<strong>{@ttl}</strong>{@ans}</h3><h4>{@desc}</h4>');

                    // Is this a stepper prompt?
                    if (style === $STYLES.STEPPER) {
                        // Add stepper control markup.
                        sb.append('<div><div' + stepperDown + '></div><div>{@v}</div><div' + stepperUp + '></div></div>');
                    }

                    if (req) {
                        sb.append('<h4><div' + itemReqClass + '>' + mstrmojo.desc(475, 'This prompt is required and must be answered.') + '</div></h4>');
                    }

                    // Add new markup in cache.
                    markup = itemMarkupCache[cacheKey] = sb.toString() + '</div></div>';
                }

                // Return markup.
                return markup;
            },

            getItemProps: function getItemProps(item, idx) {
                // Get the prompt style and display value and initialize the return object with generic prompt properties.
                var style = item.getStyle(),
                    props = this._super(item, idx),
                    isStepperOrSwitch = (style === $STYLES.STEPPER || style === $STYLES.SWITCH),
                    displayValue = item.getDisplayValue(isStepperOrSwitch, isStepperOrSwitch); // Calculate default and replace only for stepper and switch.

                // Set common property values.
                props.wid = this.id;
                props.ttl = item.title;
                props.desc = item.mn;
                props.ans = '';                 // Need at least an empty string so undefined doesn't get output in the markup.

                // What style prompt is this?
                switch (style) {
                case $STYLES.STEPPER:
                    // Add default stepper class.
                    props.addCls('stepper');

                    // Can we not step up?
                    if (!item.canStepUp()) {
                        props.addCls('max');
                    }

                    // Can we not step down?
                    if (!item.canStepDown()) {
                        props.addCls('min');
                    }

                    // Add actual value.
                    props.v = displayValue;
                    break;

                case $STYLES.SWITCH:
                    props.addCls('switch');

                    if (displayValue) {
                        props.addCls('on');
                    }
                    break;

                case $STYLES.GEO:
                    props.addCls('geo drop-down');
                    if (!item.displayLoc) {
                        item.getDisplayLocation(this, displayValue);
                    }
                    break;

                default:
                    props.addCls('drop-down');
                    break;
                }

                // Is this NOT a stepper and NOT a switch?
                if (!isStepperOrSwitch) {
                    // Do we have display value?
                    if (displayValue) {
                        // Add the display value as the answer.
                        props.ans = ((props.ttl) ? ': ' : '') + displayValue;
                    }
                }

                // Return properties object.
                return props;
            },

            updateItem: function updateItem(idx) {
                // Ellipsize item.
                ellipsizeItem.call(this, this._super(idx), idx);
            },

            /**
            * Overridden to ellipsize the title and description fields.
            *
            * @ignore
            */
            onRender: function onRender() {
                if (this._super) {
                    this._super();
                }

                var items = this.itemsContainerNode.childNodes,
                    cnt = items.length,
                    i;

                // Iterate each item.
                for (i = 0; i < cnt; i++) {
                    // Ellipsize item.
                    ellipsizeItem.call(this, items[i], i);
                }
            },

            /**
            * Click handler for the handles of a Stepper prompt style.
            *
            * @param {HTMLEvent} evt The HTML Event associated with the click event.
            * @param {Integer} idx The index of the Stepper prompt.
            * @param {Boolean} isUp True if the up stepper handle was clicked, false if the down stepper handle was clicked.
            *
            */
            clickStepper: function clickStepper(evt, idx, isUp) {
                // Ask prompt to step
                this.items[idx]['step' + ((isUp) ? 'Up' : 'Down')]();

                // Update prompt.
                this.updateItem(idx);
            },

            /**
            * Overridden to show prompt popups or switch.
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
                    item = this.items[idx],
                    answer = item.answer,
                    min = item.min,
                    max = item.max,
                    me = this;

                // Initialize dialog fields.
                var dialogConfig = {
                        title: item.title
                    },
                    dialogChildren = [],
                    fnOk,
                    dialog,
                    fnShowDialog = function () {
                        // Add children.
                        dialogConfig.children = dialogChildren;

                        // Do we have an ok function?
                        if (fnOk) {
                            // Add Ok and Cancel buttons.
                            dialogConfig.buttons = [$BTN(mstrmojo.desc(1442, 'OK'), fnOk), $BTN(mstrmojo.desc(221, 'Cancel'))];
                        }

                        // Show dialog, caching dialog in local variable.
                        dialog = mstrApp.showDialog(dialogConfig);
                        // Return dialog for client manipulation.
                        return dialog;
                    };

                // What is the style of the prompt?
                switch (item.getStyle()) {
                case $STYLES.BARCODE:
                    // Launch barcode reader.
                    mstrmojo.BarcodeReader.readBarcodes(null, {
                        success: function (val) {
                            //TQMS 497960. For big decimal we add a decimal point
                            if (item.promptType === mstrmojo.prompt.PromptTypes.CONSTANT_PROMPT && item.dataType === mstrmojo.mstr.EnumDataType.DataTypeBigDecimal) {
                                var li = mstrApp.getLocaleInfo(),
                                    decimalSeparator = (li && li.number.DECIMALSEPARATOR) || '.';
                                val = val.substr(0, 1) + decimalSeparator + val.substr(1);
                            }
                            if (!setAnswer.call(me, item, idx, [val])) {
                                return false;
                            }
                        },

                        failure: function (ex) {
                            item.setError(ex);

                            // Update the item HTML element.
                            me.updateItem(idx);
                        }
                    });
                    break;
                case $STYLES.TEXT:
                    // Add custom class to dialog.
                    dialogConfig.cssClass = 'edtTextInput';

                    // Add text box child.
                    dialogChildren.push({
                        scriptClass: 'mstrmojo.TextBox',
                        value: item.getDisplayValue(false, false) || '',
                        onEnter: function () {
                            // Set answer on prompt.
                            if (!setAnswer.call(me, item, idx, [this.value])) {
                                return; // skip closing dialog
                            }

                            // Close dialog.
                            dialog.close();
                        },
                        onRender: function () {
                            // Set focus to input element.
                            this.focus();
                        }
                    });

                    fnOk = function () {
                        if (!setAnswer.call(me, item, idx, [dialog.children[0].value])) {
                            return false; // skip closing dialog
                        }
                    };

                    // Show dialog.
                    fnShowDialog();
                    break;

                case $STYLES.LIST:
                    var answerItems = answer.items || [],
                        availableAnswers = item.getAvailable(),     // The WebElements to browse.
                        searchRequired = item.prs.SearchRequired;

                    // Mark as _Fetchable to concatenate the blocks.
                    availableAnswers.concat = true;
                    //TQMS 486877. If search is requierd then we shall show the Search dialog instead of Elements Picker.
                    if (typeof (searchRequired) !== 'undefined' && searchRequired !== '0') {
                        var isMultiSelect = (max === "" || parseInt(item.max, 10) > 1);

                        // Show the search dialog (cache the reference so we can hide the dialog when selection changes).
                        dialogConfig.title = mstrmojo.desc(8761, 'Search Elements');
                        dialogConfig.cssClass = 'edtSearch';
                        dialogConfig.alignment = 'top';       // Make sure dialog appear at top so it is not obscured when the soft keyboard opens.
                        dialogChildren.push({
                            alias: 'searchView',
                            scriptClass: 'mstrmojo.android.AndroidElementsSearchView',
                            elements: availableAnswers,
                            multiSelect: isMultiSelect,
                            targetList: {
                                addSelectedItems: function addSelectedItems(newItems) {
                                    // Search to find items that are already in the answer items.
                                    var search = $ARR.findMulti(answerItems, 'v', newItems);

                                    // Iterate new items.
                                    $ARR.forEach(newItems, function (item, idx) {
                                        // Is this item NOT already in the answer items?
                                        if (!search.map[idx]) {
                                            answerItems.push(item);
                                        }
                                    });
                                },
                                unselectItems: function unselectItems(items) {
                                    // Remove the unselected items from the answer items.
                                    $ARR.removeItems(answerItems, 'v', items);
                                },
                                getSelectedItems: function getSelectedItems() {
                                    return answerItems;
                                },
                                clearSelect: function clearSelect() {
                                    answerItems = [];
                                }

                            }
                        });

                        dialogConfig.buttons = [$BTN(mstrmojo.desc(8473, 'Done'), function () {
                            return setAnswer.call(me, item, idx, [answerItems]);
                        })];

                        dialog = fnShowDialog();

                        // TQMS 513637 We will set whether the search view is multi-select based on prompt setting.
                        var sv = dialog.children[0];
                        if (sv && isMultiSelect && sv.setMultiSelect) {
                            sv.setMultiSelect();
                        }
                    } else {
                        // Change title.
                        dialogConfig.title = mstrmojo.desc(6149, 'Select Elements');

                        // Create AndroidElementsPicker.

                        // Create Elements picker as dialog child.
                        var picker = new mstrmojo.android.AndroidElementsPicker({
                            controller: this.controller,
                            isElastic: true,
                            multiSelect: (max === "" || parseInt(item.max, 10) > 1),              // Use radio buttons (multiSelect:false) if the user can only pick 1 item.
                            itemIdField: 'v',
                            //TQMS 497753 We shall not allow search if prompts has predefined list of elements
                            canSearch: item.canSearch()
                        });

                        dialogConfig.useMenu = item.canSearch();

                        // Is this a barcode item?
                        if (item.prs.DisplayStyle === 'Barcode') {
                            // Add useMenu flag to dialog config to identify that this dialog will interact with the menu button.
                            dialogConfig.useMenu = true;

                            picker.useBarcodeReader = true;
                            picker.searchForms = item.prs.LookupForm;
                        }

                        // Add picker to dialog dialogChildren.
                        dialogChildren.push(picker);

                        // Add click handler to Ok button.
                        fnOk = function () {
                            return setAnswer.call(me, item, idx, [picker.getSelectedItems()]);
                        };


                        // Utility function to set picker and show dialog.
                        var fnSetPickerAndShowDialog = function () {
                            // We want to set the browse elements in order to ensure that we trigger the on change event handler.
                            picker.set('browseElements', availableAnswers);

                            // Add selected items.
                            picker.addSelectedItems(answerItems);

                            // Show the dialog.
                            fnShowDialog();

                            // Did we show a dialog?
                            if (dialog) {
                                var titleBarBtnClass = 'mstrmojo-Editor-titlebar-button ',
                                    fnOpenSearchDialog = function (result) {
                                        picker.openSearchDialog(result);
                                    };

                                // Should we show the geo location button?
                                if (item.prs.DisplayStyle === 'GeoLocation') {
                                    // Create title bar button for geolocation.
                                    dialog.createTitleBarButton(titleBarBtnClass + 'btnGeo', function () {
                                        // Search elements
                                        item.getGeoTargetValue({
                                            success: fnOpenSearchDialog // Open search dialog.
                                        });
                                    });

                                } else {
                                    // Default to right most bar code button position.
                                    var barCodePosition = '';

                                    // Should we show the Search button?
                                    if (picker.canSearch) {
                                        // Change bar code button position to left of search button.
                                        barCodePosition = ' btnLeft';

                                        // Create title bar button for search elements              TQMS 545404. There should be no any paramdeter here
                                        dialog.createTitleBarButton(titleBarBtnClass + 'btnSearch', function() {picker.openSearchDialog();});

                                    }

                                    // Should we show the Bar Code scanner button?
                                    if (picker.useBarcodeReader) {
                                        // Create title bar button for barcode scanner.
                                        dialog.createTitleBarButton(titleBarBtnClass + 'btnBarcode' + barCodePosition, function () {
                                            // Read barcode
                                            picker.handleMenuItem('2048');
                                        });

                                    }
                                }
                            }
                        };

                        // If answer is search base, browsable (for suggested answer, it is not browsable)
                        if (availableAnswers.browseConfig) {
                            // Request initial block.
                            availableAnswers.getItems(1, {
                                success: function () {
                                    fnSetPickerAndShowDialog();
                                }
                            });
                        } else {
                            fnSetPickerAndShowDialog();
                        }
                    }
                    break;

                case $STYLES.SLIDER:
                    // Add custom css class for slider dialog.
                    dialogConfig.cssClass = 'edtSlider';

                    // Get display value and create value label.
                    var v = item.getDisplayValue(true, false), // Need to replace empty value with default value, but do not save at this point.
                        valueField = new mstrmojo.Label({
                            text: v,
                            cssClass: 'value'
                        });

                    // Add value label to dialog.
                    dialogChildren.push(valueField);

                    // Add description label to dialog.
                    dialogChildren.push(new mstrmojo.Label({
                        text: item.mn,
                        cssClass: 'title'
                    }));

                    // Add a slider to the dialog children.
                    var slider = new mstrmojo.ui.MobileSlider({
                        value: $NUM.parseNumeric(v),
                        max: item.max,
                        min: item.min,
                        interval: item.interval,
                        // sync description with slider value
                        onvalueChange: function () {
                            valueField.set('text', $NUM.toLocaleString(this.value));
                        },
                        // during sliding, sync temporary value with the description
                        onslidingValueChange: function () {
                            valueField.set('text', $NUM.toLocaleString(this.slidingValue));
                        },
                        onRender: function () {
                            this.parent.attachEventListener('resizeCurtain', this.id, this.resize);
                        }
                    });
                    dialogChildren.push(slider);

                    fnOk = function () {
                        if (!setAnswer.call(me, item, idx, [String(slider.value)])) {
                            return false;
                        }
                    };

                    // Show the dialog.
                    fnShowDialog();

                    break;

                case $STYLES.CALENDAR:
                    // Create Calendar.
                    var calendar = new mstrmojo.MobileCalendar({});

                    /**
                    * The following function gets called when the popup gets resized - this happens when the device's orientation changes
                    */
                    dialogConfig.onpopupResized = function (evt) {
                        var dn = calendar.domNode,
                            dimension = evt.maxheight > evt.width ? 'Width' : 'Height',
                            dimensionLC = dimension.toLowerCase(),
                            zoom = parseInt((100 * evt[dimensionLC] / dn['offset' + dimension]), 10);

                        //Set the zoom to fit the screen.
                        dn.style.zoom = zoom + '%';

                        //Center the Calendar =  ([Width of the dialog (and account for the zoom)] - [Width of the Calendar]) / 2
                        dn.style.marginLeft = (((evt.width * (100 / zoom)) - dn.offsetWidth) / 2) + 'px';
                    };

                    switch (item.promptType) {
                    case $TYPES.CONSTANT_PROMPT:
                        // Change title.
                        dialogConfig.title = mstrmojo.desc(8382, 'Select Date');

                        // Create Calendar.
                        calendar.min = min || null;
                        calendar.max = max || null;

                        //value
                        calendar.value = answer;

                        // Add click handler to Ok button.
                        fnOk = function () {
                            if (!setAnswer.call(me, item, idx, [calendar.value])) {
                                return false;
                            }
                        };
                        break;

                    case $TYPES.ELEMENTS_PROMPT:
                        // Change title.
                        dialogConfig.title = mstrmojo.desc(8383, 'Select Dates');

                        // Create Calendar.
                        calendar.min = item.prs.LocalizedMinDate || null;
                        calendar.max = item.prs.LocalizedMaxDate || null;

                        calendar.isMultiSelect = true;

                        //value
                        calendar.set('selectedDates', item.getAnswerAsDateArray());

                        // Add click handler to Ok button.
                        fnOk = function () {
                            try {
                                //item.setAnswerValue(vals);
                                item.setAnswerValue.apply(item, [calendar.getSelectedDatesAsString()]);
                            } catch (e) {
                                mstrmojo.alert(e.message || e);
                                return false;
                            }
                            //TQMS 511438. We need to verify that selected dates are present in the warehouse
                            item.syncDateAnswer({
                                success: function () {
                                    //Now we can close this dialog
                                    mstrApp.closeDialog();
                                    me.updateItem(idx);
                                },
                                failure: function (msg) {
                                    //Display the error message after call stack winds out.
                                    window.setTimeout(function () {
                                        mstrmojo.alert(msg);
                                    }, 0);
                                }
                            });
                            //Don't close dialog until we verify that selected dates are present in warehous.
                            return false;
                        };
                        break;

                    default:
                        throw new Error(mstrmojo.desc(8397, 'MobilePromptSummary: Unknown prompt type.'));
                    }

                    // Add calendar to dialog dialogChildren.
                    dialogChildren.push(calendar);

                    // Show the dialog.
                    fnShowDialog();
                    break;

                case $STYLES.TIME:
                    // Create the time picker.
                    var dateUtil = mstrmojo.date,
                        timePicker = new mstrmojo.ui.MobileDateTimePicker({
                            value: dateUtil.parseDateAndOrTime(answer || ''),    // If set to null, defaults to current date.
                            min: dateUtil.parseDateAndOrTime(min || ''),         // Optional, If set to null, the stepper is infinite.
                            max: dateUtil.parseDateAndOrTime(max || ''),         // Optional, If set to null, the stepper is infinite.
                            minuteInterval: item.interval                                       // Optional, If set to null, the stepper will default to 1
                            //format: “XX/XX/XX”,                                // Optional, The format in which the stepper should display the date, defaults to “MMM/DD/YYY”.
                            //is24HourMode: Boolean                              // Optional, defaults to false.
                        });

                    // Add the time picker as a child of the dialog.
                    dialogChildren.push(timePicker);

                    // Crate the ok button handler.
                    fnOk = function () {
                        var v = timePicker.getDateTime(),
                            dateInfo = v && v.date,
                            timeInfo = v && v.time,
                            date = (dateInfo && dateUtil.formatDateInfo(dateInfo, mstrmojo.locales.datetime.DATEOUTPUTFORMAT)) || '',
                            time = (timeInfo && dateUtil.formatTimeInfo(timeInfo, mstrmojo.locales.datetime.TIMEOUTPUTFORMAT)) || '';
                        if (!setAnswer.call(me, item, idx, [date + ' ' + time])) {
                            return false;
                        }
                    };

                    // Show the time picker.
                    fnShowDialog();
                    break;

                case $STYLES.GEO:
                    if (window.confirm(mstrmojo.desc(8384, '"MicroStrategy" Would Like to use Your Current Location.'))) {
                        mstrmojo.GeoLocation.getCurrentLocation({
                            success: function (la, lo, al) {
                                if (!setAnswer.call(me, item, idx, [la, lo])) {
                                    return false;
                                }
                            },

                            failure: function (ex) {
                                item.setError(ex);

                                // Update the item HTML element.
                                me.updateItem(idx);
                            }
                        });
                    }
                    break;

                case $STYLES.SWITCH:
                    // Toggle the switch.
                    item.toggleSwitch();

                    // Update the item HTML element.
                    this.updateItem(idx);
                    break;
                }
            }
        }
    );
}());