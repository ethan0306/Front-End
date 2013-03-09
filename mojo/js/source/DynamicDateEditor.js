(function () {
    mstrmojo.requiresCls("mstrmojo.Editor",
        "mstrmojo.locales",
        "mstrmojo.array",
        "mstrmojo.hash",
        "mstrmojo.date",
        "mstrmojo.Label",
        "mstrmojo.Box",
        "mstrmojo.HBox",
        "mstrmojo.CheckBox",
        "mstrmojo.SelectBox",
        "mstrmojo.Table",
        "mstrmojo.ValidationTextBox",
        "mstrmojo.RadioList",
        "mstrmojo.RadioListHoriz",
        "mstrmojo.HTMLButton",
        "mstrmojo.FieldSet");


    var $A = mstrmojo.array,
        $H = mstrmojo.hash,
        $D = mstrmojo.date,
        $LDT = mstrmojo.locales.datetime,
        $DESC = mstrmojo.desc,
        $ABS = Math.abs,
        /** UI Arrays **/
        OFFSETS = ['First', 'Second', 'Third', 'Fourth', 'Fifth'],
        ADJUSTMENTS = ['Weekly', 'Monthly', 'Yearly'],
        DIRECTIONS = ['Plus', 'Minus'],
        /** Constants **/
        ENUMDSSXMLDATATYPES = {
            DATE: 14,
            TIME: 15,
            DATETIME: 16
        },
        DDE_TYPE = {},
        DYT = {
            NONE: 0,
            WEEKLY: 1,
            MONTHLY: 2,
            YEARLY: 3
        },
        MTP = {
            DAY: 0,
            THE: 1,
            REVERSE: 2
        },
        YTP = {
            ON: 0,
            THE: 1
        };

    DDE_TYPE[ENUMDSSXMLDATATYPES.DATE] =  3;
    DDE_TYPE[ENUMDSSXMLDATATYPES.TIME] =  194;
    DDE_TYPE[ENUMDSSXMLDATATYPES.DATETIME] = 195;


    /**
     * Creates a validation text box with a label beside it.
     *
     * @param {Object} props The properties required to create a validation text box
     * @param {String} label The label aligned to the right of the text box.
     * @param {boolean} position Displays the label to the left if true and right otherwise.
     */
    function createValidationTextBoxWithLabel(props, label, position) {
        return $H.copy({
            markupString: '<div class="mstrmojo-TextBoxWithLabel {@cssClass}" style="{@cssText}">' +
                              (position ? '<span class="mstrmojo-TextBox-label">' + label + '</span>' : '') +
                              '<input id="{@id}" class="mstrmojo-TextBox {@inputNodeCssClass}"  style="{@inputNodeCssText}" ' +
                                  'title="{@tooltip}" type="{@type}" ' +
                                  'value="{@value}" size="{@size}" maxlength="{@maxLength}" index="{@tabIndex}"' +
                                  ' mstrAttach:focus,keyup,blur ' +
                              '/>' +
                              (!position ? '<span class="mstrmojo-TextBox-label-right">' + label + '</span>' : '') +
                          '</div>',
            markupSlots: {
                inputNode: function () { return position ? this.domNode.lastChild : this.domNode.firstChild; }
            }
        }, props);
    }

    /**
     * Accepts a type list widget and returns the value associated with the item at the selected index.
     *
     * @param widget The type list widget
     */
    function getListControlValue(widget) {
        return widget.items[widget.selectedIndex].v;
    }

    /**
     * Get Nth day in given month and given year.
     * For example: Second Wednesday of the December 2011
     *
     * @param year
     * @param month - month 0-based
     * @param n - 0-based number
     * @param day - Sunday 0, Monday 1, ..., Saturday 6.
     */
    function getNthDayOfMonth(year, month, n, day) {
        var temp = new Date(year, month, 1),
            tempDay = temp.getDay();

        // Return the Nth day of the month.
        return 1 + (day - tempDay) + (day >= tempDay ? 0 : 7) + (7 * n);

    }

    /**
     * Validates the controls that have text validation so as to disable the OK Button on the editor and to show the error message
     */
    function validateInputs() {
        var dde = mstrmojo.all.mstrDDE,
            t = dde.controls,
            validationControls = ['ddo', 'dmo', 'mdd', 'mrdd', 'mrdm', 'yodd', 'dh', 'dmi', 'st'],
            valid = true,
            txt = '';

        $A.forEach(validationControls, function (c) {
            var vs = t[c].validationStatus;

            if (vs && vs.code !== 0) {
                // Show error message
                txt = vs.msg;
                // Disable ok button.
                valid = false;
            }
        });

        // Show Error message
        dde.errorText.set('text', txt);
        dde.errorText.set('visible', !valid);
        // Enable or disable ok button based on validity.
        dde.buttonHBox.okButton.set('enabled', valid);
    }

    /**
     * Calculates the resolved date based on the input from the user on the Dynamic Date Editor.
     *
     */
    function resolveDate() {
        var dde = mstrmojo.all.mstrDDE,
            t = dde.controls,
            tp = dde.type,
            data = dde.data = {
                'do': 0,
                dyt: DDE_TYPE[tp],
                dmo: 0,
                dm: 0,
                dd: 0,
                dw: 0,
                dow: 0,
                dh: 0,
                dmi: 0,
                dr: ''
            },
            dyt = getListControlValue(t.dyt),
            checked = t.adj.checked;

        if (tp !== ENUMDSSXMLDATATYPES.TIME) {
            var res = t.res,
                curr = t.curr.val,
                offsetProps = {
                    d: (checked ? 'do'  : 'dd'),
                    m: (checked ? 'dmo' : 'dm')
                },
                result = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate(), curr.getHours(), curr.getMinutes(), curr.getSeconds()),
                ddo_dir = t.ddo_dir.selectedIndex === 0 ? 1 : -1,
                ddo = parseInt(t.ddo.value, 10) || 0,
                dmo_dir = t.dmo_dir.selectedIndex === 0 ? 1 : -1,
                dmo = parseInt(t.dmo.value, 10) || 0,
                wdow = getListControlValue(t.wdow),
                mdd = parseInt(t.mdd.value, 10) || 0,
                mtoff = getListControlValue(t.mtoff),
                mtdow = getListControlValue(t.mtdow),
                mrdm = parseInt(t.mrdm.value, 10) || 0,
                mrdd = parseInt(t.mrdd.value, 10) || 0,
                yodm = getListControlValue(t.yodm),
                yodd = parseInt(t.yodd.value, 10) || 0,
                ytoff = getListControlValue(t.ytoff),
                ytdm = getListControlValue(t.ytdm),
                ytdow = getListControlValue(t.ytdow);

            // Add the date and month offset first.
            result.setDate(result.getDate() + (ddo_dir * ddo));
            result.setMonth(result.getMonth() + (dmo_dir * dmo));

            // Update the data model
            data[offsetProps.d] = (ddo_dir * ddo);
            data[offsetProps.m] = (dmo_dir * dmo);
            data.dyt += (checked ? dyt : DYT.NONE);

            //Do we have adjustments?
            if (t.adj.checked) {
                switch (dyt) {

                case DYT.WEEKLY:
                    result.setDate(result.getDate() + wdow - result.getDay());

                    // Update the data model
                    data.dow = wdow;
                    break;

                case DYT.MONTHLY:
                    switch (getListControlValue(t.mtp)) {

                    case MTP.DAY:
                        // Set the date.
                        result.setDate(Math.min(mdd, $D.getDaysOfMonth(result.getFullYear(), result.getMonth() + 1)));

                        // Update the data model
                        data.dd = mdd;
                        break;

                    case MTP.THE:
                        // Set the result to the Nth day of the month.
                        result.setDate(getNthDayOfMonth(result.getFullYear(), result.getMonth(), mtoff, mtdow));

                        // Update the data model
                        data.dw = mtoff + 1;
                        data.dow = mtdow;
                        break;

                    case MTP.REVERSE:
                        result.setMonth(result.getMonth() - mrdm + 1);
                        result.setDate(1 - mrdd);

                        // Update the data model
                        data.dd = -mrdd;
                        data.dm = -mrdm;
                        break;
                    }
                    break;

                case DYT.YEARLY:
                    switch (getListControlValue(t.ytp)) {

                    case YTP.ON:
                        // Set the Date and month based on the user input.
                        result.setMonth(yodm);
                        result.setDate(yodd);

                        // Update the data model
                        data.dd = yodd;
                        data.dm = yodm + 1;
                        break;

                    case YTP.THE:
                        // Set the month on the result as per the editor value chosen.
                        result.setMonth(ytdm);

                        // Calculate the Nth day of that month.
                        result.setDate(getNthDayOfMonth(result.getFullYear(), result.getMonth(), ytoff, ytdow));

                        // Update the data model
                        data.dw = ytoff + 1;
                        data.dow = ytdow;
                        data.dm = ytdm + 1;
                        break;
                    }
                    break;
                }
            }

            // Set the calculated value on Editor for preview.
            res.set('text', result.toLocaleDateString());
            res.val = result;
            data.dr = $D.formatDateInfo($D.getDateJson(result), $LDT.DATEOUTPUTFORMAT);
        }

        if (tp !== ENUMDSSXMLDATATYPES.DATE) {
            var time = t.st.value;

            if (t.isDynTime.checked) {
                var currTime = t.currTime.val,
                    resultTime = new Date(currTime.getFullYear(), currTime.getMonth(), currTime.getDate(), currTime.getHours(), currTime.getMinutes(), currTime.getSeconds()),
                    dh_dir = t.dh_dir.selectedIndex === 0 ? 1 : -1,
                    dh = parseInt(t.dh.value, 10) || 0,
                    dmi_dir = t.dmi_dir.selectedIndex === 0 ? 1 : -1,
                    dmi = parseInt(t.dmi.value, 10) || 0;

                // Set the hour and minute offsets on the result.
                resultTime.setHours(resultTime.getHours() + (dh * dh_dir));
                resultTime.setMinutes(resultTime.getMinutes() + (dmi * dmi_dir));

                // Update the data model
                data.dh = (dh * dh_dir);
                data.dmi = (dmi * dmi_dir);

                // Calculate the time string.
                time = $D.formatTimeInfo($D.getDateJson(resultTime), $LDT.TIMEINPUTFORMATS[0]);
            } else {
                // We're using static time - so adjust the dyt property accordingly
                data.dyt = DDE_TYPE[ENUMDSSXMLDATATYPES.DATE] + (checked ? dyt : DYT.NONE);

                var resTime = $D.parseTime(time);
                data.dh = resTime.hour;
                data.dmi = resTime.min;
            }

            t.resTime.set('text', time);
            data.dr += ' ' + time;
        }

        // Validate Input
        validateInputs();
    }

    /**
     * Sets the values for text boxes and selectboxes which are associated with each other based on whether the value is
     * negative or positive.
     *
     *  @param controls A collection of all the input controls that can be filled in by the user
     *  @param propName The name of the property that needs to update the corresponding controls
     *  @param value The value of the property.
     */
    function setPlusMinusControls(controls, propName, value) {
        // Account for negative numbers
        controls[propName + '_dir'].set('selectedIndex', value >= 0 ? 0 : 1);

        // Set the offset values from the data.
        controls[propName].set('value', $ABS(value));
    }

    /**
     * Helper method that takes an array of mstrmojo.Widget and sets the visible property.
     *
     * @param (Array) children An array of mstrmojo.Widget objects.
     * @param (boolean) show Boolean flag controlling the visible property.
     */
    function setChildrenVisibility(children, show) {
        // Show the controls required.
        $A.forEach(children, function (c) {
            c.set('visible', show);
        });
    }

    /**
     * Sets up the editor based on the type of the selected attribute.
     *
     * @return
     */
    function setupEditor() {
        var ddeData = this.ddeData,
            tp = this.type = ddeData.tp,
            display = tp === ENUMDSSXMLDATATYPES.DATETIME,
            show = [],
            hide = [this.layoutsContainer];

        // Set all the children and previews to hidden.
        setChildrenVisibility(this.children.concat(this.preview.children[0].children), display);

        if (!display) {
            switch (tp) {
            case ENUMDSSXMLDATATYPES.DATE:
                // Show the required controls
                show = show.concat(this.children[0],
                            this.mainOffsets,
                            this.adj,
                            this.preview,
                            this.staticPicker,
                            this.buttonHBox,
                            $A.get(this.preview.children[0].children, [0, 1, 2, 3]));
                break;

            case ENUMDSSXMLDATATYPES.TIME:
                // Show the required controls
                show = show.concat(this.timeLayoutsContainer,
                            this.timeLayoutsContainer.dynamicTimeLayout,
                            this.preview,
                            this.staticPicker,
                            this.buttonHBox,
                            $A.get(this.preview.children[0].children, [4, 5, 6, 7]));

                hide = hide.concat(this.timeLayoutsContainer.useDynamicTime, this.timeLayoutsContainer.staticTimeLayout);

                break;
            }

            // Hide and show the respective controls
            setChildrenVisibility(show, true);
            setChildrenVisibility(hide, false);
        }
    }

    /**
     * Initializes the controls based on the data model values and then resolves the data to be displayed on the preview section.
     */
    function initControls() {
        var ddeData = this.ddeData,
            tp = this.type = ddeData.tp,
            controls = this.controls;

        // Do we already have data to populate the editor?
        if (tp !== ENUMDSSXMLDATATYPES.TIME) {
            var dyt = (ddeData.dyt - DDE_TYPE[tp]) || DYT.NONE,
                dow = ddeData.dow || 0,
                dd = ddeData.dd || 0,
                dm = ddeData.dm || 0,
                dw = ddeData.dw || 0,
                dateOffset = (dyt === DYT.NONE ? dd : ddeData['do']) || 0,
                monthOffset = (dyt === DYT.NONE ? dm : ddeData.dmo) || 0;

            switch (dyt) {

            case DYT.WEEKLY:
                // Set the current day of week.
                controls.wdow.set('selectedIndex', dow);
                break;

            case DYT.MONTHLY:
                // Determine which monthly adjustment type data we're getting.
                var mtp = (dw > 0) ? MTP.THE : (dd > 0 ? MTP.DAY : MTP.REVERSE);

                // Set the type value
                controls.mtp.set('selectedIndex', mtp);

                switch (mtp) {
                case MTP.DAY:
                    controls.mdd.set('value', dd);
                    break;

                case MTP.THE:
                    controls.mtoff.set('selectedIndex', dw - 1);
                    controls.mtdow.set('selectedIndex', dow);
                    break;

                case MTP.REVERSE:
                    controls.mrdd.set('value', $ABS(dd));
                    controls.mrdm.set('value', $ABS(dm));
                    break;
                }
                break;

            case DYT.YEARLY:
                // Determine which case it is (we assume date cannot be zero for on case, or we could use the dw property)
                var ytp = dd === 0 ? 1 : 0;

                // Set the type value
                controls.ytp.set('selectedIndex', ytp);

                switch (ytp) {
                case YTP.ON:
                    controls.yodm.set('selectedIndex', dm - 1);
                    controls.yodd.set('value', dd);
                    break;

                case YTP.THE:
                    controls.ytdm.set('selectedIndex', dm - 1);
                    controls.ytoff.set('selectedIndex', dw - 1);
                    controls.ytdow.set('selectedIndex', dow);
                    break;
                }
                break;
            }

            // Set all the plus minus controls for day and month offsets
            setPlusMinusControls(controls, 'ddo', dateOffset);
            setPlusMinusControls(controls, 'dmo', monthOffset);

            // Set the adjustment type if the user has set any..
            controls.adj.set('checked', dyt !== DYT.NONE);

            // Set the current selected adjustment tab if there are adjustments.
            if (dyt > 0) {
                controls.dyt.set('selectedIndex', dyt - 1);
            }
        }

        // Set the visiblity of the dynamic time controls
        if (tp !== ENUMDSSXMLDATATYPES.DATE) {
            var isStaticTime = (tp === ENUMDSSXMLDATATYPES.DATETIME && ddeData.dyt !== DDE_TYPE[tp]),
                dh = ddeData.dh || 0,
                dmi = ddeData.dmi || 0;

            controls.isDynTime.set('checked', !isStaticTime);

            // Check if there's a dynamic date and static time defined
            if (isStaticTime) {
                var resultTime = new Date();
                resultTime.setHours(dh);
                resultTime.setMinutes(dmi);
                controls.st.set('value', $D.formatTimeInfo($D.getDateJson(resultTime), $LDT.TIMEINPUTFORMATS[0]));
            } else {
                // Set the plus minus controls for hour and minute offsets.
                setPlusMinusControls(controls, 'dh', dh);
                setPlusMinusControls(controls, 'dmi', dmi);
            }
        }

        // Resolve Date
        resolveDate();

        // Show the correct editor UI
        setupEditor.call(this);
    }

    /**
     * Creates an array of objects with a name value pair using a starting index.
     *
     * @param values An array of Strings that would account for the name property of the new array.
     * @param startIndex The index at which the name value pairs should start.
     * @return An array of objects having a 'n' and 'v' property.
     */
    function createNameValueObject(values, startIndex) {
        var arr = [];

        $A.forEach(values, function (value) {
            arr.push({
                n: value,
                v: startIndex++
            });
        });

        return arr;
    }

    /**
     * <p>Dynamic Date Editor</p>
     *
     * @class
     */
    mstrmojo.DynamicDateEditor = mstrmojo.declare(

        /**
         * Superclass
         */
        mstrmojo.Editor,

        /**
         * Mixins
         */
        null,

        /**
         * @lends mstrmojo.DynamicDateEditor.prototype
         */
        {
            scriptClass: "mstrmojo.DynamicDateEditor",

            cssClass: "mstrmojo-DynamicDateEditor",

            /**
             * The Editor title
             *
             * @see mstrmojo.Editor
             */
            title: 'Dynamic Date',

            /**
             * Determines the type of attribute determined by the Dynamic Date Editor.
             *
             *  @type Integer
             */
            type: ENUMDSSXMLDATATYPES.DATE,

            /**
             * We don't need to be able to make the Editor draggable.
             *
             * @type boolean
             */
            draggable: false,

            /**
             * @see mstrmojo.Obj
             */
            init: function (props) {
                this._super(props);

                //Set up target UI components
                var mainOffsets = this.mainOffsets,
                    do_ctr = mainOffsets.do_ctr,
                    dmo_ctr = mainOffsets.dmo_ctr,
                    layoutsContainer = this.layoutsContainer,
                    layouts = layoutsContainer.layouts,
                    monthly = layouts.children[1].monthly,
                    yearly = layouts.children[2].yearly,
                    timeLayoutsContainer = this.timeLayoutsContainer,
                    time = timeLayoutsContainer.dynamicTimeLayout.children[0],
                    preview = this.preview.children[0];

                this.controls = {
                    ddo_dir: do_ctr.ddo_dir,
                    ddo: do_ctr.ddo,
                    dmo_dir: dmo_ctr.dmo_dir,
                    dmo: dmo_ctr.dmo,
                    adj: this.adj,
                    dyt: layoutsContainer.dyt,
                    wdow: layouts.weekly.wdow,
                    mtp: layouts.children[1].mtp,
                    mdd: monthly.mdd,
                    mtoff: monthly.mtoff,
                    mtdow: monthly.mtdow,
                    mrdd: monthly.mrdd,
                    mrdm: monthly.mrdm,
                    ytp: layouts.children[2].ytp,
                    yodm: yearly.yodm,
                    yodd: yearly.yodd,
                    ytoff: yearly.ytoff,
                    ytdow: yearly.ytdow,
                    ytdm: yearly.ytdm,
                    dh_dir: time.dh_dir,
                    dh: time.dh,
                    dmi_dir: time.dmi_dir,
                    dmi: time.dmi,
                    isDynTime: timeLayoutsContainer.useDynamicTime,
                    st: timeLayoutsContainer.staticTimeLayout.staticTime,
                    curr: preview.currDate,
                    res: preview.resolvedDate,
                    currTime: preview.currTime,
                    resTime: preview.resolvedTime
                };
            },

            postBuildRendering: function postBuildRendering() {
                if (this._super) {
                    this._super();
                }

                // Initialize controls.
                initControls.call(this);
            },

            onddeDataChange: function onddeDataChange() {
                initControls.call(this);
            },

            /**
             * Returns a delimited string containing the different values of the the resolved date from the editor.
             *
             * @return {Object} The different properties associated with the data.
             */
            getResolvedDate: function getResolvedDate() {
                var data = this.data;

                return $H.copy(data, {
                    str: ['isDyn', data.dyt, data['do'], data.dmo, data.dm, data.dd, data.dw, data.dow, data.dr, data.dh, data.dmi].join('::')
                });
            },

            /**
             * @see mstrmojo.Container
             */
            children: [{
                scriptClass: 'mstrmojo.Label',
                text: "Define a dynamic date",
                cssText: 'margin:3px'
            }, {
                scriptClass: 'mstrmojo.HBox',
                cssClass: 'mainOffsets',
                alias: 'mainOffsets',
                cellPadding: 5,
                children: [{
                    scriptClass: 'mstrmojo.Label',
                    text: 'Today'
                }, {
                    scriptClass: 'mstrmojo.HBox',
                    alias: 'do_ctr',
                    cellPadding: 2,
                    children: [{
                        scriptClass: 'mstrmojo.SelectBox',
                        selectedIndex: 0,
                        alias: 'ddo_dir',
                        size: 1,
                        items: createNameValueObject(DIRECTIONS, 1),
                        onchange: resolveDate
                    },  createValidationTextBoxWithLabel({
                        scriptClass: 'mstrmojo.ValidationTextBox',
                        alias: 'ddo',
                        constraints: {
                            trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                            min: 0
                        },
                        onValid: resolveDate,
                        onInvalid: validateInputs,
                        size: 1,
                        value: '0'
                    }, 'Days')]
                }, {
                    scriptClass: 'mstrmojo.HBox',
                    alias: 'dmo_ctr',
                    cellPadding: 2,
                    children: [{
                        scriptClass: 'mstrmojo.SelectBox',
                        selectedIndex: 0,
                        alias: 'dmo_dir',
                        size: 1,
                        items: createNameValueObject(DIRECTIONS, 1),
                        onchange: resolveDate
                    }, createValidationTextBoxWithLabel({
                        scriptClass: 'mstrmojo.ValidationTextBox',
                        alias: 'dmo',
                        constraints: {
                            trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                            min: 0
                        },
                        onValid: resolveDate,
                        onInvalid: validateInputs,
                        size: 1,
                        value: '0'
                    }, 'Months')]
                }]
            }, {
                scriptClass: 'mstrmojo.CheckBox',
                alias: 'adj',
                label: 'Apply additional adjustments',
                oncheckedChange: function () {
                    resolveDate();

                    // Toggle the visibility of the layouts container.
                    this.parent.layoutsContainer.set('visible', this.checked);
                }
            }, {
                scriptClass: 'mstrmojo.Box',
                alias: 'layoutsContainer',
                visible: false,
                cssClass: 'mstrmojo-DynamicDateEditor-layoutsContainer',
                children: [{
                    scriptClass: 'mstrmojo.SelectBox',
                    alias: 'dyt',
                    cssClass: 'dyt',
                    size: 1,
                    selectedIndex: 0,
                    items: createNameValueObject(ADJUSTMENTS, 1),
                    onchange: function (evt) {
                        // Resolve the date and select the appropriate container to see.
                        resolveDate();

                        var idx = this.selectedIndex,
                            l = this.parent.layouts,
                            layouts = l.children;

                        // Update the legend
                        l.legend.innerHTML = this.items[idx].n;

                        $A.forEach(layouts, function (layout) {
                            layout.set('visible', false);
                        });

                        // Show the selected layout.
                        layouts[idx].set('visible', true);
                    }
                }, {
                    //dynamic layouts
                    scriptClass: 'mstrmojo.FieldSet',
                    legend: 'Weekly',
                    alias: 'layouts',
                    cssClass: 'mstrmojo-DynamicDateEditor-layouts',
                    children: [{
                        scriptClass: 'mstrmojo.Box',
                        cssClass: 'weekly',
                        alias: 'weekly',
                        children: [{//Weekly layout
                            scriptClass: 'mstrmojo.Label',
                            cssText: 'margin:0px 6px;',
                            text: $DESC(870, 'Select a day:')
                        }, {
                            scriptClass: 'mstrmojo.SelectBox',
                            size: 1,
                            selectedIndex: 0,
                            alias: 'wdow',
                            items: createNameValueObject($LDT.dayNames_FULL, 0),
                            onchange: resolveDate
                        }]
                    }, {
                        scriptClass: 'mstrmojo.HBox',
                        visible: false,
                        cssClass: 'monthly',
                        children: [{
                            scriptClass: 'mstrmojo.RadioList',
                            alias: 'mtp',
                            selectedIndex: 0,
                            items: createNameValueObject(['Day', 'The', 'Reverse count'], 0),
                            onchange: resolveDate
                        }, {
                            scriptClass: 'mstrmojo.Table',
                            alias: 'monthly',
                            cellSpacing: 5,
                            rows: 3,
                            cols: 2,
                            children: [{
                                scriptClass: 'mstrmojo.ValidationTextBox',
                                alias: 'mdd',
                                constraints: {
                                    trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                                    min: 1,
                                    max: 31
                                },
                                onValid: resolveDate,
                                onInvalid: validateInputs,
                                size: 1,
                                value: '1',
                                slot: '0,0'
                            }, {
                                scriptClass: 'mstrmojo.Label',
                                text: '',
                                slot: '0,1'
                            }, {
                                scriptClass: 'mstrmojo.SelectBox',
                                selectedIndex: 0,
                                alias: 'mtoff',
                                size: 1,
                                onchange: resolveDate,
                                items: createNameValueObject(OFFSETS, 0),
                                slot: '1,0'
                            }, {
                                scriptClass: 'mstrmojo.SelectBox',
                                selectedIndex: 0,
                                alias: 'mtdow',
                                size: 1,
                                onchange: resolveDate,
                                items: createNameValueObject($LDT.dayNames_FULL, 0),
                                slot: '1,0'
                            }, {
                                scriptClass: 'mstrmojo.Label',
                                text: 'of the month',
                                slot: '1,1'
                            }, createValidationTextBoxWithLabel({
                                scriptClass: 'mstrmojo.ValidationTextBox',
                                alias: 'mrdd',
                                constraints: {
                                    trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                                    min: 0,
                                    max: 31
                                },
                                onValid: resolveDate,
                                onInvalid: validateInputs,
                                size: 1,
                                value: '1',
                                slot: '2,0'
                            }, 'Days'),
                                createValidationTextBoxWithLabel({
                                    scriptClass: 'mstrmojo.ValidationTextBox',
                                    alias: 'mrdm',
                                    constraints: {
                                        trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                                        min: 0
                                    },
                                    onValid: resolveDate,
                                    onInvalid: validateInputs,
                                    size: 1,
                                    value: '0',
                                    slot: '2,1'
                                }, 'Months')]
                        }]
                    }, {
                        scriptClass: 'mstrmojo.HBox',
                        visible: false,
                        cssClass: 'yearly',
                        children: [{
                            scriptClass: 'mstrmojo.RadioList',
                            alias: 'ytp',
                            selectedIndex: 0,
                            items: createNameValueObject(['On', 'The'], 0),
                            onchange: resolveDate
                        }, {//Yearly layout
                            scriptClass: 'mstrmojo.Table',
                            alias: 'yearly',
                            rows: 3,
                            cols: 1,
                            cellSpacing: 5,
                            children: [{
                                scriptClass: 'mstrmojo.SelectBox',
                                slot: '0,0',
                                selectedIndex: 0,
                                alias: 'yodm',
                                size: 1,
                                items: createNameValueObject($LDT.MONTHNAME_FULL, 0),
                                onchange: function () {
                                    var dde = mstrmojo.all.mstrDDE,
                                        controls = dde.controls,
                                        yodd = controls.yodd,
                                        res = controls.res.val;

                                    // Update the constraints based on the month of day and validate.
                                    yodd.constraints.max = $D.getDaysOfMonth(res.getFullYear(), parseInt(this.selectedIndex, 10) + 1);
                                    yodd.validate();
                                    validateInputs();
                                }
                            }, {
                                scriptClass: 'mstrmojo.ValidationTextBox',
                                constraints: {
                                    trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                                    min: 1,
                                    max: 31
                                },
                                slot: '0,0',
                                alias: 'yodd',
                                size: 1,
                                value: '1',
                                onValid: resolveDate
                            }, {
                                scriptClass: 'mstrmojo.SelectBox',
                                slot: '1,0',
                                selectedIndex: 0,
                                alias: 'ytoff',
                                size: 1,
                                items: createNameValueObject(OFFSETS, 0),
                                onchange: resolveDate
                            }, {
                                scriptClass: 'mstrmojo.SelectBox',
                                slot: '1,0',
                                selectedIndex: 0,
                                alias: 'ytdow',
                                size: 1,
                                items: createNameValueObject($LDT.dayNames_FULL, 0),
                                onchange: resolveDate
                            }, {
                                scriptClass: 'mstrmojo.Label',
                                slot: '1,0',
                                cssText: 'margin: 4px;',
                                text: 'of'
                            }, {
                                scriptClass: 'mstrmojo.SelectBox',
                                slot: '1,0',
                                selectedIndex: 0,
                                alias: 'ytdm',
                                size: 1,
                                items: createNameValueObject($LDT.MONTHNAME_FULL, 0),
                                onchange: resolveDate
                            }]
                        }]
                    }]
                }]
            }, {
                scriptClass: 'mstrmojo.Box',
                alias: 'timeLayoutsContainer',
                visible: false,
                children: [{
                    scriptClass: 'mstrmojo.CheckBox',
                    alias: 'useDynamicTime',
                    label: 'Use Dynamic Time',
                    oncheckedChange: function () {
                        resolveDate();

                        // Toggle the visibility of the layouts container.
                        this.parent.staticTimeLayout.set('visible', !this.checked);
                        this.parent.dynamicTimeLayout.set('visible', this.checked);
                    }
                }, {
                    scriptClass: 'mstrmojo.FieldSet',
                    legend: 'Static Time',
                    alias: 'staticTimeLayout',
                    children: [createValidationTextBoxWithLabel({
                        scriptClass: 'mstrmojo.ValidationTextBox',
                        alias: 'staticTime',
                        dtp: 15,
                        constraints: {
                            trigger: mstrmojo.validation.TRIGGER.ONKEYUP
                        },
                        onValid: resolveDate,
                        onInvalid: validateInputs,
                        size: 8,
                        value: '12:00 AM'
                    }, 'Time: ', true)]
                }, {
                    scriptClass: 'mstrmojo.FieldSet',
                    visible: false,
                    legend: 'Dynamic Time',
                    alias: 'dynamicTimeLayout',
                    children: [{
                        scriptClass: 'mstrmojo.Table',
                        rows: 2,
                        cols: 4,
                        alias: 'dh_ctr',
                        cellPadding: 2,
                        children: [{
                            scriptClass: 'mstrmojo.Label',
                            slot: '0,0',
                            text: 'This hour'
                        }, {
                            scriptClass: 'mstrmojo.SelectBox',
                            slot: '0,1',
                            selectedIndex: 0,
                            alias: 'dh_dir',
                            size: 1,
                            items: createNameValueObject(DIRECTIONS, 1),
                            onchange: resolveDate
                        },  createValidationTextBoxWithLabel({
                            scriptClass: 'mstrmojo.ValidationTextBox',
                            slot: '0,2',
                            alias: 'dh',
                            constraints: {
                                trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                                min: 0
                            },
                            onValid: resolveDate,
                            onInvalid: validateInputs,
                            size: 1,
                            value: '0'
                        }, 'hours'), {
                            scriptClass: 'mstrmojo.Label',
                            slot: '1,0',
                            text: 'This minute'
                        }, {
                            scriptClass: 'mstrmojo.SelectBox',
                            slot: '1,1',
                            selectedIndex: 0,
                            alias: 'dmi_dir',
                            size: 1,
                            items: createNameValueObject(DIRECTIONS, 1),
                            onchange: resolveDate
                        }, createValidationTextBoxWithLabel({
                            scriptClass: 'mstrmojo.ValidationTextBox',
                            slot: '1,2',
                            alias: 'dmi',
                            constraints: {
                                trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                                min: 0
                            },
                            onValid: resolveDate,
                            onInvalid: validateInputs,
                            size: 1,
                            value: '0'
                        }, 'minutes')]
                    }]
                }]
            }, {
                scriptClass: 'mstrmojo.FieldSet',
                legend: 'Preview',
                alias: 'preview',
                children: [{
                    scriptClass: 'mstrmojo.Table',
                    rows: 4,
                    cols: 2,
                    cellSpacing: 5,
                    children: [{
                        scriptClass: 'mstrmojo.Label',
                        text: 'If today\'s date is:',
                        slot: '0,0'
                    }, {
                        scriptClass: 'mstrmojo.Label',
                        alias: 'currDate',
                        cssClass: 'resultLabel',
                        postBuildRendering: function postBuildRendering() {
                            this.val = new Date();
                            this.set('text', this.val.toLocaleDateString());
                        },
                        slot: '0,1'
                    }, {
                        scriptClass: 'mstrmojo.Label',
                        text: 'The date would be resolved to:',
                        slot: '1,0'
                    }, {
                        scriptClass: 'mstrmojo.Label',
                        alias: 'resolvedDate',
                        cssClass: 'resultLabel',
                        text: '',
                        slot: '1,1'
                    }, {
                        scriptClass: 'mstrmojo.Label',
                        visible: false,
                        text: 'If the current time is:',
                        slot: '2,0'
                    }, {
                        scriptClass: 'mstrmojo.Label',
                        visible: false,
                        alias: 'currTime',
                        enabled: false,
                        cssClass: 'resultLabel',
                        postBuildRendering: function postBuildRendering() {
                            this.val = new Date();
                            this.set('text', $D.formatTimeInfo($D.getDateJson(this.val), $LDT.TIMEINPUTFORMATS[0]));
                        },
                        slot: '2,1'
                    }, {
                        scriptClass: 'mstrmojo.Label',
                        visible: false,
                        text: 'The time would be resolved to:',
                        slot: '3,0'
                    }, {
                        scriptClass: 'mstrmojo.Label',
                        visible: false,
                        alias: 'resolvedTime',
                        cssClass: 'resultLabel',
                        text: '',
                        slot: '3,1'
                    }]
                }]
            }, {
                scriptClass: 'mstrmojo.Label',
                alias: 'errorText',
                cssClass: 'errorText',
                visible: false,
                text: ''
            }, {
                scriptClass: 'mstrmojo.HBox',
                alias: 'buttonHBox',
                cssClass: 'buttonHBox',
                children: [{
                    scriptClass: "mstrmojo.HTMLButton",
                    alias: 'okButton',
                    cssClass: "mstrmojo-Editor-button dde",
                    cssText: 'right: 46px;',
                    text: mstrmojo.desc(1442, "OK"),
                    onclick: function (evt) {
                        var dde = this.parent.parent;

                        // Custom hook to handle what to do with the date resolved by the Dynamic Date Editor.
                        dde.okCallback(dde.getResolvedDate());

                        dde.close();
                    }
                }, {
                    scriptClass: "mstrmojo.HTMLButton",
                    cssClass: "mstrmojo-Editor-button dde",
                    text: mstrmojo.desc(221, "Cancel"),
                    onclick: function (evt) {
                        this.parent.parent.close();
                    }
                }]
            }, {
                scriptClass: 'mstrmojo.Label',
                text: "Switch to static date",
                alias: 'staticPicker',
                cssClass: 'staticPicker',
                onclick: function onclick(evt) {
                    this.parent.switchToStaticDatePicker();
                }
            }]
        }
    );
}());