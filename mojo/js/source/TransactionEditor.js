(function(){
    mstrmojo.requiresCls(
            'mstrmojo._CanValidate', 
            'mstrmojo.Arr', 
            'mstrmojo.Model', 
            'mstrmojo.Editor', 
            'mstrmojo.CheckBox', 
            'mstrmojo.HBox', 
            'mstrmojo.Label', 
            'mstrmojo.TextBox', 
            'mstrmojo.DropDownButton', 
            'mstrmojo.Popup', 
            'mstrmojo.ObjectBrowser', 
            'mstrmojo.ListBox', 
            'mstrmojo.Container', 
            'mstrmojo.ValidationTextBox', 
            'mstrmojo.TristateCheckBox', 
            'mstrmojo.Table', 
            'mstrmojo.WidgetList', 
            'mstrmojo.Button', 
            'mstrmojo.Pulldown', 
            'mstrmojo.DateTextBox', 
            'mstrmojo.FieldSet', 
            'mstrmojo.HTMLButton', 
            'mstrmojo.Box',
            'mstrmojo.Dialog');
    
    var _H = mstrmojo.hash,
        _V = mstrmojo.validation,
        _TR = _V.TRIGGER,
        _SC = _V.STATUSCODE,
        _DTP = mstrmojo.expr.DTP,
        _N = mstrmojo.num,
        _S = mstrmojo.string,
        _P = mstrmojo.date,
        // For date string normalization.
        STD_DATE_FORMAT = 'M/d/yyyy',
        STD_TIME_FORMAT = 'H:mm:ss',
        // Control types
        CTRL_TEXTFIELD = 1,
        CTRL_SWITCH = 2,
        CTRL_LIST = 3,
        CTRL_SLIDER = 4,
        CTRL_CALENDAR = 5,
        CTRL_TIMEPICKER = 6,
        CTRL_TOGGLE = 7,
        CTRL_TEXTAREA = 8,
        // Control names
        CONTROL_NAMES = {1 : mstrmojo.desc(3575), //'Text Field' 
                         2 : mstrmojo.desc(7660), //'Switch' 
                         3 : mstrmojo.desc(5292), //'List' 
                         4 : mstrmojo.desc(7658), //'Slider' 
                         5 : mstrmojo.desc(5443), //'Calendar' 
                         6 : mstrmojo.desc(8249), //'Time Picker' 
                         7 : mstrmojo.desc(8248), //'Toggle'
                         8 : mstrmojo.desc(8274)},//'Text Area';
        CHANGE_TYPE_DEFAULT = 1,
        CHANGE_TYPE_MARK_SELECTION = 2,
        INPUT_VALUES_CALCULATED = 0,
        INPUT_VALUES_MANUAL = 1,
        INPUT_VALUES_DATASET = 2,
        RW_UNIT_FIELDGROUP = 51,
        RW_UNIT_GRIDGRAPH = 52,
        DSSXML_ATTRIBUTE = 12,
        INPUT_TYPES1 = [{n: mstrmojo.desc(8261), v:INPUT_VALUES_CALCULATED}, //'Calculated' 
                        {n: mstrmojo.desc(8262), v:INPUT_VALUES_MANUAL}], //'Manual'
        INPUT_TYPES2 = INPUT_TYPES1.concat({n: mstrmojo.desc(8502), v:INPUT_VALUES_DATASET}), //'Dataset'
        NO_VALIDATION = 0,
        PHONE_NO = 1,
        EMAIL_ADDRESS = 2,
        ZIP_CODE = 3,
        SOCIAL_SECURITY_NO = 4,
        REG_EXP = 5,
        VALIDATION_METHODS_OTHER = [{n: mstrmojo.desc(1549), v: NO_VALIDATION},//'No Validation'
                                    {n: mstrmojo.desc(8983), v: REG_EXP}], //'Regular Expression'
        VALIDATION_METHODS_NUM = [{n: mstrmojo.desc(1549), v: NO_VALIDATION},//'No Validation'
                                  {n: mstrmojo.desc(8984), v: PHONE_NO}, //'Phone Number'
                                  {n: mstrmojo.desc(8985), v: ZIP_CODE}, //'US Zip Code'
                                  {n: mstrmojo.desc(8986), v: SOCIAL_SECURITY_NO}, //'Social Security Number'
                                  {n: mstrmojo.desc(8983), v: REG_EXP}], //'Regular Expression'
        VALIDATION_METHODS_STR = [{n: mstrmojo.desc(1549), v: NO_VALIDATION},//'No Validation'
                                  {n: mstrmojo.desc(8984), v: PHONE_NO}, //'Phone Number'
                                  {n: mstrmojo.desc(8987), v: EMAIL_ADDRESS}, //'Email Address'
                                  {n: mstrmojo.desc(8985), v: ZIP_CODE}, //'US Zip Code'
                                  {n: mstrmojo.desc(8986), v: SOCIAL_SECURITY_NO}, //'Social Security Number'
                                  {n: mstrmojo.desc(8983), v: REG_EXP}], //'Regular Expression' 
        isStringType = function(dtp) { 
            return _V.isString(dtp);
        },
        isNumericType = function(dtp){ 
            return _V.isNumeric(dtp) || _V.isInt(dtp);
        };
    
    function _toLocaleUnits(v){
        return _N.convertToLocalUnits(v).replace(/0{1,}$/, '').replace(/\.$/, '.0').replace(/,$/, ',0');
    }
    
    function _toUSUnits(v){
        return _N.toString(_N.convertToUSUnits(v), true);
    }
    
    function _toUSDateString(v){
        if (v != null){
            var dt = _P.parseDateAndOrTime(v);
            
            if (dt != null){
                return (dt.date?_P.formatDateInfo(dt.date, STD_DATE_FORMAT):'') 
                        + (dt.date && dt.time ? ' ':'')
                        + (dt.time?_P.formatTimeInfo(dt.time, STD_TIME_FORMAT):'');
            }
        }
        return ''; 
    }
    
    function _toLocaleDateString(v){
        if (v != null){
            var dt = _P.parseDateAndOrTime(v, STD_DATE_FORMAT, STD_TIME_FORMAT);
            if (dt != null){
                return (dt.date?_P.formatDateInfo(dt.date, mstrmojo.locales.datetime.DATEOUTPUTFORMAT):'') 
                        + (dt.date && dt.time ? ' ':'')
                        + (dt.time?_P.formatTimeInfo(dt.time, mstrmojo.locales.datetime.TIMEOUTPUTFORMAT):'');
            }
        }
        return '';
    }
    
    function slideProp(show, target, prop, start, stop, onEnd, ease, extraProps) {
        // set animation properties
        var props = {
                target : target,
                onEnd : function() {
                    if (onEnd) {
                        onEnd();
                    }
                },
                props: {}
            };
        
        props.props[prop] = {
                ease : ease || mstrmojo.ease.sin,
                start : parseInt(start, 10),
                stop : parseInt(stop, 10),
                suffix : 'px'
            };//targetProps;
    
        // copy in other widget specific animation properties
        props = mstrmojo.hash.copy(extraProps, props);
    
        // Animation instance
        var fx = new mstrmojo.fx.AnimateProp(props);
    
        fx.play();
    }
    
    var _reportSelectorJson = {
        scriptClass: 'mstrmojo.Table',
        rows: 1,
        cols: 4,
        children:[
            {
                slot: '0,0',
                scriptClass: 'mstrmojo.Label',
                text: mstrmojo.desc(8241)+':' //"Transaction Report:"
            }, {
                slot: '0,1',
                scriptClass: 'mstrmojo.TextBox',
                cssText: 'width: 270px; margin: 0 0 0 10px;',
                readOnly: true,
                bindings: {
                    value: 'mstrmojo.all.teModel.txRpt.nm'
                }
            }, {
                slot: '0,2',
                scriptClass: 'mstrmojo.DropDownButton',
                cssClass: 'mstrmojo-TransactionEditor-DropDownButton',
                text: '...',
                title: mstrmojo.desc(1825, 'Browse'),
                popupRef: {
                    scriptClass: 'mstrmojo.Popup',
                    cssClass: 'mstrmojo-TransactionEditor-ObjectBrowserPopup',
                    slot: 'popupNode',
                    locksHover: true,
                    onOpen: function(){
                        this.objectBrowser.browse({
                            browsableTypes: '778,8',
                            onSelectCB : [this, 'onSelect'],
                            onCloseCB : [this, 'close']
                        });
                        this.objectBrowser.obSearchBox.objectTypes = '778,8';
                        this.objectBrowser.set('visible', true);
                    },
                    onSelect: function(item){
                        if (item.did){
                            mstrmojo.all.teModel.setTxReport(item.did, item.n, true);
                        }
                    },
                    children:[
                        {
                            alias: 'objectBrowser',
                            cssText: 'width: 200px',
                            scriptClass : 'mstrmojo.ObjectBrowser', 
                            folderLinksContextId : 14,
                            closeOnSelect: true,
                            useAnimate: true,
                            closeable: true,
                            showCompletePath: false
                        }
                    ]
                }
            }, {
                slot: '0,3',
                scriptClass: 'mstrmojo.Button',
                cssClass: 'mstrmojo-TransactionEditor-RemoveAscBtn',
                title: mstrmojo.desc(8282),
                text: 'x',
                onclick: function(){
                    mstrmojo.all.teModel.set('txRpt', null);
                }
            }
        ]
    };
    
    function _createPanel(ps){
        return _H.copy(
                ps, 
                {
                    scriptClass: 'mstrmojo.Container',
                    markupString: '<div id="{@id}" class="{@cssClass}" style="{@cssText}"></div>',
                    cssClass: 'mstrmojo-TransactionEditor-Panel',
                    markupSlots: {
                        containerNode: function(){ return this.domNode; }
                    },
                    markupMethods:{
                        onvisibleChange: function(){
                            this.domNode.style.display = this.visible ? 'block' : 'none'; 
                        }
                    }
                });
    }
    
    function _onValChg(){
        var m = mstrmojo.all.teModel,
            cu = m && m.currentTxInput;
        
        if (cu && this.isActive()){
            this.updateModel(this.isValid() ? this.value : null);
        }else{
            if (this.inputNode){
                this.clearValidation();
            }
        }
    }
    
    function _textInput(ps, n){
        return _H.copy(ps, {
            scriptClass: 'mstrmojo.ValidationTextBox',
            cssClass: 'mstrmojo-TransactionEditor-TextBox',
            required: true,
            constraints:{
                trigger: _TR.ALL,
                max: ps.max,
                min: ps.min
            },
            bindings:{
                value: function(){
                    return mstrmojo.all.teModel.currentTxInput.ctl.pr[n];
                }
            },
            onValid: _onValChg,
            onInvalid: _onValChg,
            isActive: null, //Indicate whether this control is active on the UI(can update the model)
            updateModel: function(v){ //Method to update the model value
                mstrmojo.all.teModel.currentTxInput.ctl.pr[n] = v;
            }
        });
    }
    
    function _checkBox(ps, n, v){
        var v = v || [true, false];
        return _H.copy(ps, {
            scriptClass: 'mstrmojo.TristateCheckBox',
            cssClass: 'tristate mstrmojo-TransactionEditor-CheckBox',
            grayed: false,
            bindings:{
                checked: function(){
                    var value = mstrmojo.all.teModel.currentTxInput.ctl.pr[n];
                    //if value is null, it means that property "n" is not existed, so no value change event should be triggered
                    return value == null ? undefined : value == v[0];
                }
            },
            oncheckedChange: function(){
                if (this.checked != null){
                    mstrmojo.all.teModel.currentTxInput.ctl.pr[n] = this.checked? v[0] : v[1];
                }
            }
        });
    }
    
    function _label(ps, n){
        return _H.copy(ps,{
            scriptClass: 'mstrmojo.Label',
            cssClass: 'mstrmojo-TransactionEditor-Label',
            text: n
        })
    }
    
    var _textFieldPropertiesPanel = _createPanel({
        alias: 'textField',
        children:[
            {
                scriptClass: 'mstrmojo.Table',
                layout:[{cells: [{},{},{}]},
                        {cells: [{},{},{}]},
                        {cells: [{},{colSpan: 2}]},
                        {cells: [{},{colSpan: 2}]},
                        {cells: [{},{colSpan: 2}]},
                        {cells: [{},{colSpan: 2}]},
                        {cells: [{colSpan: 3}]}],
                children:[
                    _label({
                        slot: '0,0',
                        bindings:{
                            visible: function(){
                                return isStringType(mstrmojo.all.teModel.currentTxInput.dtp);
                            }
                        }
                    }, mstrmojo.desc(8252) + ':'), // 'Maximum length:'
                    _textInput({
                        slot:'0,1',
                        size: 7,
                        dtp: _DTP.INTEGER,
                        min: 1,
                        max: 999999,
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TEXTFIELD;
                        },
                        bindings: {
                            visible: function(){
                                return isStringType(mstrmojo.all.teModel.currentTxInput.dtp);
                            },
                            value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.ml'
                        }
                    }, 'ml'),
                    _label({
                        slot: '0,2',
                        bindings:{
                            visible: function(){
                                return isStringType(mstrmojo.all.teModel.currentTxInput.dtp);
                            }
                        }
                    }, mstrmojo.desc(8259)), //'characters'
                    _label({
                        slot: '1,0',
                        bindings:{
                            visible: function(){
                                return isStringType(mstrmojo.all.teModel.currentTxInput.dtp);
                            }
                        }
                    }, mstrmojo.desc(8988)+':'), // 'Minimum length:'
                    _textInput({
                        slot: '1,1',
                        size: 7,
                        dtp: _DTP.INTEGER,
                        min: 0,
                        max: 999999,
                        bindings: {
                            visible: function(){
                                return isStringType(mstrmojo.all.teModel.currentTxInput.dtp);
                            },
                            value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.mnl'
                        },
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TEXTFIELD;
                        }
                    }, 'mnl'),
                    _label({
                        slot: '1,2',
                        bindings:{
                            visible: function(){
                                return isStringType(mstrmojo.all.teModel.currentTxInput.dtp);
                            }
                        }
                    }, mstrmojo.desc(8259)), //'characters'
                    _checkBox({
                        slot: '2,0',
                        text: mstrmojo.desc(2100), //'Minimum Value:'
                        bindings: {
                            visible: function(){
                                return isNumericType(mstrmojo.all.teModel.currentTxInput.dtp);
                            },
                            checked: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.emin'
                        },
                        oncheckedChange: function(){
                            if (this.checked != null){
                                mstrmojo.all.teModel.currentTxInput.ctl.pr.set('emin', this.checked);
                            }
                        }
                    }, 'emin'),
                    _textInput({
                        slot: '2,1',
                        size: 7,
                        dtp: _DTP.DOUBLE,
                        bindings: {
                            visible: function(){
                                return isNumericType(mstrmojo.all.teModel.currentTxInput.dtp);
                            },
                            value: function(){
                                return _N.toLocaleString(mstrmojo.all.teModel.currentTxInput.ctl.pr.min);
                            },
                            enabled: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.emin'
                        },
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TEXTFIELD;
                        },
                        updateModel: function(v){
                            mstrmojo.all.teModel.currentTxInput.ctl.pr.min = (v == null ? v : _N.toString(v, true));
                        }
                    }, 'min'),
                    _checkBox({
                        slot: '3,0',
                        text: mstrmojo.desc(2099), //'Maximum Value:'
                        bindings: {
                            visible: function(){
                                return isNumericType(mstrmojo.all.teModel.currentTxInput.dtp);
                            },
                            checked: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.emax'
                        },
                        oncheckedChange: function(){
                            if (this.checked != null){
                                mstrmojo.all.teModel.currentTxInput.ctl.pr.set('emax', this.checked);
                            }
                        }
                    }, 'emax'),
                    _textInput({
                        slot: '3,1',
                        size: 7,
                        dtp: _DTP.DOUBLE,
                        bindings: {
                            visible: function(){
                                return isNumericType(mstrmojo.all.teModel.currentTxInput.dtp);
                            },
                            value: function(){
                                return _N.toLocaleString(mstrmojo.all.teModel.currentTxInput.ctl.pr.max);
                            },
                            enabled: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.emax'
                        },
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TEXTFIELD;
                        },
                        updateModel: function(v){
                            mstrmojo.all.teModel.currentTxInput.ctl.pr.max = (v == null ? v : _N.toString(v, true));
                        }
                    }, 'max'),
                    _label({slot: '4,0'}, 'Validation: '),
                    {
                        slot: '4,1',
                        scriptClass: 'mstrmojo.Pulldown',
                        cssText: 'white-space: nowrap',
                        popupToBody: true,
                        popupZIndex: 112,
                        itemIdField: 'v',
                        defaultText: ' ',
                        defaultSelection: 0,
                        bindings:{
                            items: function(){
                                var dtp = mstrmojo.all.teModel.currentTxInput.dtp;
                                return isNumericType(dtp) ? VALIDATION_METHODS_NUM : (isStringType(dtp) ? VALIDATION_METHODS_STR : VALIDATION_METHODS_OTHER);
                            },
                            value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.vm'
                        },
                        onvalueChange: function(){
                            if (this.value != null){
                                mstrmojo.all.teModel.currentTxInput.ctl.pr.set('vm', this.value);
                            }
                        }
                    },
                    _label({
                        slot:'5,0',
                        bindings: {
                            visible: function(){
                                return mstrmojo.all.teModel.currentTxInput.ctl.pr.vm == REG_EXP;
                            }
                        }
                    }, mstrmojo.desc(4449)+':'),
                    _textInput({
                        slot: '5,1',
                        dtp: _DTP.VARCHAR,
                        constraints: {
                            trigger: _TR.ALL,
                            validator: function(v){
                                try {
                                    new RegExp(v);
                                    return {code : _SC.VALID};
                                }catch(e){
                                    return {code : _SC.INVALID, msg: mstrmojo.desc(8998)}; //'Please enter a valid regular expression.'
                                }
                            }
                        },
                        bindings: {
                            visible: function(){
                                return mstrmojo.all.teModel.currentTxInput.ctl.pr.vm == REG_EXP;
                            },
                            value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.rgx'
                        },
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TEXTFIELD;
                        }
                    }, 'rgx'),
                    _checkBox({
                        slot: '6,0', 
                        text:mstrmojo.desc(8330),
                        bindings: {
                            visible: function(){
                                return mstrmojo.all.teModel.rwTxs.tp == RW_UNIT_FIELDGROUP;
                            },
                            checked: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.psw'
                        }
                    }, 'psw'), //'Mask text (password)'
                ]
            }
        ]
    });
    
    var _switchPropertiesPanel = _createPanel({
        alias: 'switch1',
        children:[
            {
                scriptClass: 'mstrmojo.Table',
                rows: 2,
                cols: 2,
                children:[
                    _label({slot: '0,0'}, mstrmojo.desc(7579)), //'Off value:'
                    _textInput({
                        slot: '0,1',
                        size: 7,
                        bindings: {
                            dtp: 'mstrmojo.all.teModel.currentTxInput.dtp', 
                            value: function(){
                                return _N.toLocaleString(mstrmojo.all.teModel.currentTxInput.ctl.pr.vls[0].v);
                            }
                        },
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_SWITCH;
                        },
                        updateModel: function(v){
                            var vl = mstrmojo.all.teModel.currentTxInput.ctl.pr.vls[0];
                            vl.invalidFlag = (v==null)?1:0;
                            vl.v = _N.toString(v, true);
                        }
                    }),
                    _label({slot: '1,0'}, mstrmojo.desc(7578)),//'On value:'
                    _textInput({
                        slot: '1,1',
                        size: 7,
                        bindings:{
                            dtp: 'mstrmojo.all.teModel.currentTxInput.dtp', 
                            value: function(){
                                return _N.toLocaleString(mstrmojo.all.teModel.currentTxInput.ctl.pr.vls[1].v);
                            }
                        },
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_SWITCH;  
                        },
                        updateModel: function(v){
                            var vl = mstrmojo.all.teModel.currentTxInput.ctl.pr.vls[1];
                            vl.invalidFlag = (v==null)?1:0;
                            vl.v = _N.toString(v, true);
                        }
                    })
                ]
            }
        ]
    });
    
    function _createCalculatedPanel(cfg){
        var ctlIdx = cfg.ctlIdx;
        return _createPanel({
            alias: 'calculated',
            cssText: 'margin: 5px 0 0',
            children:[
                {
                    scriptClass: 'mstrmojo.Table',
                    rows: 3,
                    cols: 2,
                    children:[
                        _label({slot: '0,0'}, mstrmojo.desc(2100)), //'Minimum value:'
                        _textInput({
                            slot: '0,1',
                            size: 7,
                            dtp: _DTP.DOUBLE,
                            bindings: {
                                value: function(){
                                    return _N.toLocaleString(mstrmojo.all.teModel.currentTxInput.ctl.pr.min);
                                }
                            },
                            isActive: function(){
                                var pr = mstrmojo.all.teModel.currentTxInput.ctl.pr;
                                return pr.t == ctlIdx && pr.ipt == INPUT_VALUES_CALCULATED;
                            },
                            updateModel: function(v){
                                mstrmojo.all.teModel.currentTxInput.ctl.pr.min = _N.toString(v, true);
                            }
                        }, 'min'),
                        _label({slot: '1,0'}, mstrmojo.desc(2099)), //'Maximum value:'
                        _textInput({
                            slot: '1,1',
                            size: 7,
                            dtp: _DTP.DOUBLE,
                            bindings: {
                                value: function(){
                                    return _N.toLocaleString(mstrmojo.all.teModel.currentTxInput.ctl.pr.max);
                                }
                            },
                            isActive: function(){
                                var pr = mstrmojo.all.teModel.currentTxInput.ctl.pr;
                                return pr.t == ctlIdx && pr.ipt == INPUT_VALUES_CALCULATED;
                            },
                            updateModel: function(v){
                                mstrmojo.all.teModel.currentTxInput.ctl.pr.max = _N.toString(v, true);
                            }
                        }, 'max'),
                        _label({slot: '2,0'}, mstrmojo.desc(7580)),//'Interval:'
                        _textInput({
                            slot: '2,1',
                            size: 7,
                            dtp: _DTP.DOUBLE, 
                            min: 0,
                            bindings: {
                                value: function(){
                                    return _N.toLocaleString(mstrmojo.all.teModel.currentTxInput.ctl.pr.itv);
                                }
                            },
                            isActive: function(){
                                var pr = mstrmojo.all.teModel.currentTxInput.ctl.pr;
                                return pr.t == ctlIdx && pr.ipt == INPUT_VALUES_CALCULATED;
                            },
                            updateModel: function(v){
                                mstrmojo.all.teModel.currentTxInput.ctl.pr.itv = _N.toString(v, true);
                            }
                        }, 'itv')
                    ]
                }
            ]
        });
    }
    
    function _createManualPanel(cfg){
        var showRowHeader = (cfg.rowHeaders != null),
            vt = showRowHeader ? cfg.rowHeaders[0] : '',
            nt = showRowHeader ? cfg.rowHeaders[1] : '',
            ct = cfg.colHeader || '',
            ctlIdx = cfg.ctlIdx;
            
        return _createPanel({
            alias: 'manual',
            cssText: 'margin: 5px 0 0 5px',
            children:[
                {
                    scriptClass: 'mstrmojo.Table',
                    layout:[{cells:[{},{}]},
                            {cells:[{cssText: 'vertical-align:top'},{}]}
                    ],
                    children:[
                        {
                            slot: '0,1',
                            scriptClass: 'mstrmojo.HBox',
                            visible: showRowHeader,
                            children: [
                                {
                                    scriptClass: 'mstrmojo.Label',
                                    cssText: 'width:125px;',
                                    text: vt
                                }, {
                                    scriptClass: 'mstrmojo.Label',
                                    cssText: 'margin-left:10px;width:125px;',
                                    text: nt
                                }
                            ]
                        },
                        _label({slot: '1,0', cssText:'margin-right:10px;'}, ct),
                        {
                            slot: '1,1',
                            scriptClass: 'mstrmojo.WidgetList',
                            renderOnScroll:false,
                            maxID: 1,
                            itemIdField: 'idx',
                            makeObservable: true,
                            bindings: {
                                items: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.vls'
                            },
                            onitemsChange: function(){
                                var cti = mstrmojo.all.teModel.currentTxInput,
                                    pr = cti && cti.ctl.pr;
                                if (pr && pr.t == ctlIdx){
                                    var vls = pr.vls;
                                    
                                    //Insert two empty slots if empty
                                    if (vls.length == 0){
                                        this.add([{}, {}], 0);
                                    }

                                    //For List/Toggle, we need to configure the unset state.
                                    if (ctlIdx == CTRL_TOGGLE || ctlIdx == CTRL_LIST){
                                        if (!vls[0].unset){
                                            this.add([{n: pr.ust, unset: 1}], 0);
                                        }
                                    }
                                }
                            },
                            itemFunction: function(item, idx, w){
                                item.idx = w.maxID++;
                                var dtp = mstrmojo.all.teModel.currentTxInput.dtp,
                                    inputWidget;
                                
//                                if (dtp == 14 || dtp == 15 || dtp == 16){
//                                    inputWidget = {
//                                        scriptClass: 'mstrmojo.DateTextBox',
//                                        cssClass: 'mstrmojo-TransactionEditor-DateTextBox',
//                                        width: 125,
//                                        dtp: dtp,
//                                        required: false,
//                                        constraints: { trigger: _TR.ALL },
//                                        calendarToBody: true,
//                                        calendarZIndex: 112
//                                    };
//                                } else {
                                    
//                                }
                                if (item.unset){
                                    inputWidget = {
                                        scriptClass: 'mstrmojo.TextBox',
                                        cssText: 'width:120px;',
                                        enabled: false,
                                        value: mstrmojo.desc(8329) //'Unset'
                                    };
                                }else{
                                    inputWidget = {
                                        scriptClass: 'mstrmojo.ValidationTextBox',
                                        cssText: 'width:120px',
                                        maxLength: 256,
                                        dtp: dtp,
                                        constraints: { trigger: _TR.ONKEYUP },
                                        value: _N.toLocaleString(item.v || ''),
                                        onValid: function(){
                                            this.parent.data.v = _N.toString(this.value || '', true);
                                            this.parent.data.invalidFlag = 0;
                                        },
                                        onInvalid: function(){
                                            this.parent.data.invalidFlag = 1;
                                        }
                                    };
                                }
                                
                                return new mstrmojo.HBox({
                                    data: item,
                                    children:[
                                        inputWidget,
                                        {
                                            scriptClass: 'mstrmojo.ValidationTextBox',
                                            cssClass: 'mstrmojo-TransactionEditor-TextBox',
                                            cssText: 'width:120px',
                                            dtp: _DTP.VARCHAR,
                                            maxLength: 256,
                                            value: item.n,
                                            constraints:{
                                                trigger: _TR.ONKEYUP
                                            },
                                            onValid: function(){
                                                var data = this.parent.data;
                                                if (data.unset){
                                                    mstrmojo.all.teModel.currentTxInput.ctl.pr.ust = this.value;
                                                }else{
                                                    data.n = this.value;
                                                }
                                            },
                                            visible: !!nt //name title is visible
                                        },{
                                            scriptClass: 'mstrmojo.Button',
                                            text:'',
                                            cssClass: 'mstrmojo-TransactionEditor-ManualList-AddButton',
                                            onclick: function(){
                                                w.add([{}], w.itemIndex(this.parent.data) + 1);
                                            }
                                        },{
                                            scriptClass: 'mstrmojo.Button',
                                            text:'',
                                            cssClass: 'mstrmojo-TransactionEditor-ManualList-RemoveButton',
                                            visible: idx > 0, 
                                            onclick: function(){
                                                w.remove(this.parent.data);
                                            }
                                        }
                                    ]
                                });
                            }
                        }]
                }]
        });
    }
    
    function _createDatasetPanel(cfg){
        var ctlIdx = cfg.ctlIdx;
        
        return _createPanel({
            alias: 'dataset',
            cssText: 'margin: 0px;white-space:nowrap;',
            onvisibleChange: function(){
                var m = mstrmojo.all.teModel;
                if (this.visible){
                    m.updateDDICSetting(m.currentTxInput);
                }else{
                    m.currentTxInput.ctl.ddic = null;
                }
            },
            children:[
                {
                    scriptClass: 'mstrmojo.Table',
                    rows: 3,
                    cols: 2,
                    children: [
                        _label({slot: '0,0'}, mstrmojo.desc(4190)), //"Source:"
                        {
                            slot: '0,1',
                            alias: 'dstPicker',
                            scriptClass: 'mstrmojo.Pulldown',
                            popupToBody: true,
                            popupZIndex: 112,
                            itemIdField: 'dsid',
                            defaultText: ' ',
                            defaultSelection: -1,
                            bindings:{
                                items: 'mstrmojo.all.teModel.rwTxs.ds',
                                value: 'mstrmojo.all.teModel.currentTxInput.ctl.ddic.dsid'
                            },
                            onvalueChange: function(){
                                if (this.value){
                                    var ddic = mstrmojo.all.teModel.currentTxInput.ctl.ddic;

                                    this.parent.attPicker.set('items', this.selectedItem.attrs);
                                    
                                    // if this was not triggered from data binding
                                    if (ddic.dsid != this.value){
                                        ddic.dsid = this.value;
                                        ddic.dst = this.selectedItem.dst;
                                        ddic.set('csid', null);
                                        ddic.cst = null;
                                        ddic.set('wfid', null);
                                    }
                                }
                            }
                        },
                        _label({slot: '1,0'}, mstrmojo.desc(2149)), //"Attribute:"
                        {
                            slot: '1,1',
                            alias: 'attPicker',
                            scriptClass: 'mstrmojo.Pulldown',
                            popupToBody: true,
                            popupZIndex: 112,
                            itemIdField: 'did',
                            defaultText: ' ',
                            defaultSelection: -1,
                            items: [],
                            bindings:{
                                value: 'mstrmojo.all.teModel.currentTxInput.ctl.ddic.csid'
                            },
                            onvalueChange: function(){
                                if (this.value){
                                    var ddic = mstrmojo.all.teModel.currentTxInput.ctl.ddic;
                                    
                                    this.parent.frmPicker.set('items', this.selectedItem.frms);
                                    
                                    // if this was not triggered from data binding
                                    if (ddic.csid != this.value){
                                        ddic.csid = this.value;
                                        ddic.cst = this.selectedItem.tp;
                                        ddic.set('wfid', null);
                                    }
                                }
                            }
                        }, 
                        _label({slot: '2,0'}, mstrmojo.desc(8501)), //"Writeback form:"
                        {
                            slot: '2,1',
                            alias: 'frmPicker',
                            scriptClass: 'mstrmojo.Pulldown',
                            popupToBody: true,
                            popupZIndex: 112,
                            itemIdField: 'fid',
                            defaultText: ' ',
                            defaultSelection: -1,
                            items: [],
                            bindings:{
                                value: 'mstrmojo.all.teModel.currentTxInput.ctl.ddic.wfid' 
                            },
                            onvalueChange: function(){
                                if (this.value){
                                    mstrmojo.all.teModel.currentTxInput.ctl.ddic.wfid = this.value;
                                }
                            }
                        }
                    ]
                }]
        });
    }
    
    function _createValuesPropsPanel(cfg){
        var ctlIdx = cfg.ctlIdx;
        
        return _createPanel({
            alias: cfg.alias,
            switchPanel: function(v){
                this.calculated.set('visible', v == INPUT_VALUES_CALCULATED);
                this.manual.set('visible', v == INPUT_VALUES_MANUAL);
                this.dataset.set('visible', v == INPUT_VALUES_DATASET);
            },
            children: [
                {
                    scriptClass: 'mstrmojo.Table',
                    layout:[
                            {cells:[ {colSpan: 3} ]},
                            {cells:[ {}, {}, {} ]},
                            {cells:[ {}, {}, {} ]},
                            {cells:[ {}, {colSpan: 2} ]}
                    ],
                    children:[
                        _checkBox({
                            slot: '0,0', 
                            text: mstrmojo.desc(8260),
                            oncheckedChange: function(){
                                if (this.checked != null){
                                    var pr = mstrmojo.all.teModel.currentTxInput.ctl.pr;
                                    if (pr.t == ctlIdx){
                                        pr.set('dm', this.checked?1:0);
                                        // if control is shown by default, its width mode should be inherit(0).
                                        pr.set('wm', this.checked?0:1);
                                    }
                                }
                            }
                        }, 'dm', [1,0]), //'Show by default'
                        _label({slot: '1,0'}, mstrmojo.desc(272)), //'Width:'
                        _textInput({
                            slot:'1,1',
                            dtp: _DTP.DOUBLE,
                            size: 7,
                            min: 0,
                            bindings: {
                                value: function(){
                                    return _toLocaleUnits(mstrmojo.all.teModel.currentTxInput.ctl.pr.w);
                                },
                                enabled: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.wm == 1'
                            },
                            isActive: function(){
                                return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == ctlIdx;
                            },
                            updateModel: function(v){
                                mstrmojo.all.teModel.currentTxInput.ctl.pr.w = v ? _toUSUnits(v) : null;
                            }
                        }, 'w'),
                        _label({slot: '1,2'}, mstrApp.unitsLabel),
                        _label({slot: '2,0', visible: ctlIdx == CTRL_SLIDER}, mstrmojo.desc(8331)+':'),//Label width
                        _textInput({
                            slot: '2,1',
                            dtp: _DTP.INTEGER,
                            size: 7,
                            min: 0,
                            max: 50,
                            visible: ctlIdx == CTRL_SLIDER,
                            bindings:{
                                value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.ldw',
                                enabled: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.dm == 1'
                            },
                            isActive: function(){
                                return this.enabled && mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_SLIDER;
                            }
                        }, 'ldw'),
                        _label({slot: '2,2', visible: ctlIdx == CTRL_SLIDER}, mstrmojo.desc(8332)), //'% of control width'
                        _label({slot: '3,0'}, mstrmojo.desc(8254) + ':'), // 'Input type:'
                        {
                            slot: '3,1',
                            scriptClass: 'mstrmojo.Pulldown',
                            cssText: 'margin: 2px 0 2px 10px; width: 80px;',
                            itemIdField: 'v',
                            defaultText: ' ',
                            defaultSelection: -1,
                            bindings:{
                                items: function(){
                                    return (mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_LIST) ? INPUT_TYPES2 : INPUT_TYPES1;
                                },
                                value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.ipt'
                            },
                            onvalueChange: function (){
                                if (this.value != null){
                                    mstrmojo.all.teModel.currentTxInput.ctl.pr.ipt = this.value;
                                    this.parent.parent.switchPanel(this.value);
                                }
                            }
                        }
                    ]
                },
                _createCalculatedPanel(cfg),
                _createManualPanel(cfg),
                _createDatasetPanel(cfg)
            ]
        });
    }
    
    var _sliderPropertiesPanel = _createValuesPropsPanel({ctlIdx: CTRL_SLIDER, alias: 'slider', colHeader: mstrmojo.desc(2175) + ':'}); //'Values:'
    
    var _listPropertiesPanel = _createValuesPropsPanel({ctlIdx: CTRL_LIST, alias: 'list', rowHeaders: [mstrmojo.desc(527), mstrmojo.desc(8263)]}); //'Value', 'Label'
    
    var _togglePropertiesPanel = _createPanel({
        alias: 'toggle',
        children:[
            _createManualPanel({ctlIdx: CTRL_TOGGLE, rowHeaders: [mstrmojo.desc(527), mstrmojo.desc(3877)], colHeader: mstrmojo.desc(8255)+':'}) //'Value', 'Image Source', 'Icons:'
        ]
    });
        
    var _calendarPropertiesPanel = _createPanel({
        alias: 'calendar',
        children:[
            {
                scriptClass: 'mstrmojo.Table',
                rows: 3,
                cols: 3,
                children: [
                    _label({slot: '0,0'},  mstrmojo.desc(2100)), //'Minimum value:'
                    {
                        slot: '0,1',
                        scriptClass: 'mstrmojo.DateTextBox',
                        cssClass: 'mstrmojo-TransactionEditor-DateTextBox',
                        width: 120,
                        autoFormat: false,
                        bindings:{
                            dtp: 'mstrmojo.all.teModel.currentTxInput.dtp',
                            value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.min'
                        },
                        required: false,
                        constraints: { trigger:_TR.ALL },
                        onValid: _onValChg,
                        onInvalid: _onValChg,
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_CALENDAR;
                        },
                        updateModel: function(v){
                            mstrmojo.all.teModel.currentTxInput.ctl.pr.min = v;
                        },
                        calendarToBody: true,
                        calendarZIndex: 112
                    }, 
                    _label({ slot: '1,0'}, mstrmojo.desc(2099)), //'Maximum value:'
                    {
                        slot: '1,1',
                        scriptClass: "mstrmojo.DateTextBox",
                        cssClass: 'mstrmojo-TransactionEditor-DateTextBox',
                        width: 120,
                        autoFormat: false,
                        bindings:{
                            dtp: 'mstrmojo.all.teModel.currentTxInput.dtp',
                            value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.max'
                        },
                        required: false,
                        constraints: {trigger: _TR.ALL},                               
                        onValid: _onValChg,
                        onInvalid: _onValChg,
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_CALENDAR;
                        },
                        updateModel: function(v){
                            mstrmojo.all.teModel.currentTxInput.ctl.pr.max = v; 
                        },
                        calendarToBody: true,
                        calendarZIndex: 112
                    },
                    _checkBox({slot: '2,0', text:mstrmojo.desc(8253)}, 'ict') //Include time
                ]
            }
        ]
    });
    
    var _timePickerPropertiesPanel = _createPanel({
        alias: 'timePicker',
        children:[
            {
                scriptClass: 'mstrmojo.Table',
                rows: 1,
                cols: 3,
                children: [
                    _label({slot: '0,0'}, mstrmojo.desc(7580)), //'Interval:'
                    _textInput({
                        slot: '0,1',
                        size: 7,
                        dtp: _DTP.INTEGER,
                        constraints: {
                            trigger: _TR.ALL,
                            validator: function(v){
                                if (60 % v != 0){
                                    return {code : _SC.INVALID, msg: mstrmojo.desc(8277)}; //Interval must be a factor of 60.
                                }
                                return {code: _SC.VALID};
                            }
                        },
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TIMEPICKER;
                        }
                    }, 'itv'), 
                    _label({slot: '0,2'}, mstrmojo.desc(2699)) //'minutes'
                ]
            }
        ]
    });
    
    var _textAreaPropertiesPanel = _createPanel({
        alias: 'textArea',
        children:[
            {
                scriptClass: 'mstrmojo.Table',
                layout: [
                    {cells: [{colSpan: 3}]},
                    {cells: [{colSpan: 3}]},
                    {cells: [{}, {}, {}]},
                    {cells: [{}, {}, {}]},
                    {cells: [{}, {}, {}]},
                    {cells: [{}, {}, {}]}
                ],
                children:[
                    _checkBox({
                        slot: '0,0', 
                        text: mstrmojo.desc(8260),
                        bindings:{
                            visible: function(){
                                return mstrmojo.all.teModel.rwTxs.tp == RW_UNIT_FIELDGROUP;
                            },
                            checked: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.dm == 1'
                        },
                        oncheckedChange: function(){ //override to call set method to notify the binding listeners.
                            if (this.checked != null){
                                var pr = mstrmojo.all.teModel.currentTxInput.ctl.pr; 
                                if (pr.t == CTRL_TEXTAREA){
                                    pr.set('dm', this.checked?1:0);
                                    pr.set('wm', this.checked?0:1);
                                    if (this.checked){
                                        pr.set('siwc', false);
                                    }
                                }
                            }
                        }
                    }, 'dm', [1,0]), //'Show by default'
                    _checkBox({
                        slot: '1,0', 
                        text: mstrmojo.desc(8251),
                        bindings: {
                            enabled: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.dm === 0',
                            checked: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.siwc'
                        },
                        oncheckedChange: function(){
                            if (this.checked != null){
                                var pr = mstrmojo.all.teModel.currentTxInput.ctl.pr;
                                pr.set('siwc', this.checked);
                                if (!this.checked){
                                    pr.set('sp', false);
                                }
                            }
                        }
                    }, 'siwc'), //'Show icon when collapsed'
                    _checkBox({
                        slot: '2,0', 
                        text: mstrmojo.desc(3389), 
                        cssText:'margin-left:15px;',
                        bindings: {
                            enabled: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.siwc',
                            checked: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.sp'
                        },
                        oncheckedChange: function(){
                            if (this.checked != null){
                                mstrmojo.all.teModel.currentTxInput.ctl.pr.set('sp', this.checked);
                            }
                        }
                    }, 'sp'), //'Preview'
                    _textInput({
                        slot: '2,1',
                        size: 7,
                        dtp: _DTP.INTEGER,
                        min: 1,
                        max: 999999,
                        bindings: {
                            enabled: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.sp',
                            value: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.pl'
                        },
                        isActive: function(){
                            return this.enabled && (mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TEXTAREA);
                        }
                    }, 'pl'),
                    _label({slot: '2,2'}, mstrmojo.desc(8259)), //'characters'
                    _label({slot: '3,0'}, mstrmojo.desc(272)), //'Width:'
                    _textInput({
                        slot:'3,1',
                        size: 7,
                        dtp: _DTP.DOUBLE,
                        min: 0,
                        max: 999999,
                        bindings: {
                            value: function(){
                                return _toLocaleUnits(mstrmojo.all.teModel.currentTxInput.ctl.pr.w);
                            },
                            enabled: 'mstrmojo.all.teModel.currentTxInput.ctl.pr.wm == 1'
                        },
                        isActive: function(){
                            return this.enabled && (mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TEXTAREA);
                        },
                        updateModel: function(v){
                            mstrmojo.all.teModel.currentTxInput.ctl.pr.w = v ? _toUSUnits(v) : null;
                        }
                    }),
                    _label({slot: '3,2'}, mstrApp.unitsLabel),
                    _label({slot: '4,0'}, mstrmojo.desc(8252) + ':'), // 'Maximum length:'
                    _textInput({
                        slot:'4,1',
                        size: 7,
                        dtp: _DTP.INTEGER,
                        min: 1,
                        max: 999999,
                        isActive: function(){
                            return mstrmojo.all.teModel.currentTxInput.ctl.pr.t == CTRL_TEXTAREA;
                        }
                    }, 'ml'),
                    _label({slot: '4,2'}, mstrmojo.desc(8259)) //'characters'
                ]
            }
        ]
    })
    
    var _fieldsMapTableJson = (function() {
        var getLayout = function getLyt(inputs) {
                var lyt = [], i, len,
                    rw = {cssText: 'height:24px', cells: [{}, {}, {}, {}, {}]},
                    rs = {cells:[ {colSpan: 5, cssText: 'vertical-align:top'} ]},
                    rc = inputs.length;
                
                lyt.push({cssText: 'height:24px', cells:[{cssText:'width:130px'},{cssText:'width:140px'},{cssText:'width:60px'},{cssText:'width:120px'},{}]}); //title row
                for(i = 0, len = rc; i < len; i++) {
                    lyt.push(rw);
                    lyt.push(rs);
                }
                return lyt.concat(rs);
            },
            
            getChildren = function getChld(inputs) {
                var as = [], i, j, len, rc = inputs.length, tix, panel = mstrmojo.all.ctrlPropPanel;
                
                // Table headers
                as.push({
                        slot: '0,0',
                        scriptClass: 'mstrmojo.Label',
                        text: mstrmojo.desc(8244) // 'Transacton Input'
                    },{
                        slot: '0,1',
                        scriptClass: 'mstrmojo.Label',
                        text: (mstrmojo.all.teModel.rwTxs.tp == RW_UNIT_FIELDGROUP)? mstrmojo.desc(8246) : mstrmojo.desc(8245) // 'Field', 'Grid Object'
                    },{
                        slot: '0,2',
                        scriptClass: 'mstrmojo.Label',
                        text: mstrmojo.desc(4694) // 'Editable'
                    },{
                        slot: '0,3',
                        scriptClass: 'mstrmojo.Label',
                        text: mstrmojo.desc(8247) // 'Control Style'
                    },{
                        slot: '0,4',
                        scriptClass: 'mstrmojo.Label'
                    });
                
                //Table contents
                for(i = 0, len = rc; i < len; i++) {
                    j = i*2 + 1;
                    tix = inputs[i].tix;
                    as.push(
                        {// Transaction Input
                            slot: j + ',0',
                            scriptClass: 'mstrmojo.Label',
                            cssClass: 'mstrmojo-TransactionEditor-TransactionInput',
                            cssText: 'margin: 0px 10px 0 0',
                            text: inputs[i].n
                        },{// Grid object/Field
                            slot: j + ',1',
                            txInput: inputs[i],
                            scriptClass: 'mstrmojo.Pulldown',
                            cssClass: 'mstrmojo-Pulldown',
                            cssText: 'margin: 0px 15px 0 0; white-space: nowrap',
                            popupToBody: true,
                            popupZIndex: 112,
                            itemIdField: 'idx',
                            itemField: 'n',
                            items: mstrmojo.all.teModel.rwTxs.tscObjs,
                            itemCssClass: 'Transactable-Object',
                            value: inputs[i].toi,
                            bindings:{
                                value: 'this.txInput.toi'
                            },
                            defaultText: ' ',
                            defaultSelection: -1,
                            onvalueChange: function(evt){
                                mstrmojo.all.teModel.updateTxMapping(this.txInput, this.value);
                                
                                // Update the dropdown list in the Pulldown.
                                if (this.value == null){
                                    this.set('selectedIndex', -1);
                                }
                                
                                if (this.txInput.editing){
                                    panel.set('show', false);
                                }
                            },
                            postCreate: function(){
                                this.popupRef.children[0].itemMarkupFunction = function(item,idx,w){
                                    var opener = w.parent.opener;
                                    return '<div class="mstrmojo-Pulldown-listItem' + (opener.itemCssClass?' '+opener.itemCssClass:'') + (item.mapped?' mapped':'') +'">' + 
                                                '<div class="mstrmojo-text">' + item.n + '</div>' + 
                                            '</div>';
                                };
                            }
                        },{ // Editable
                            slot: j + ',2',
                            txInput: inputs[i],
                            scriptClass: 'mstrmojo.TristateCheckBox',
                            cssText: 'width: 20px; height: 15px; margin: 0 10px;',
                            grayed: false,
                            checked: inputs[i].edt == 1,
                            bindings:{
                                enabled: function(){
                                    var toi = this.txInput.toi;
                                    return (toi >= 0) && !mstrmojo.all.teModel.rwTxs.tscObjs[toi].mo;
                                },
                                checked: 'this.enabled && this.txInput.edt == 1'
                            },
                            oncheckedChange: function(){
                                if (this.txInput.editing){
                                    panel.set('show', false);
                                }
//                                this.txInput.set('ctl', this.checked ? new mstrmojo.Obj():null);
                                this.txInput.set('edt', this.checked ? 1:0);
                            }
                        },{ // Control styles
                            slot: j + ',3',
                            txInput: inputs[i],
                            scriptClass: 'mstrmojo.Pulldown',
                            cssText: 'margin: 0px 10px 0 0; white-space:nowrap',
                            popupToBody: true,
                            popupZIndex: 112, 
                            itemIdField: 't',
                            items: mstrmojo.all.teModel.getControls(inputs[i].dtp),
                            defaultText: ' ',
                            defaultSelection: -1,
                            enabled: inputs[i].toi != null && inputs[i].edt == 1,
                            value: inputs[i].ctl && inputs[i].ctl.pr.t,
                            bindings: {
                                enabled: 'this.txInput.edt == 1',
                                value: 'this.txInput.ctl.pr.t'
                            },
                            onenabledChange: function(){
                                this.set('value', this.enabled ? this.items[0].t : null);
                            },
                            onvalueChange: function(){
                                if (this.value){
                                    // populate with default values
                                    var idx = mstrmojo.array.find(this.items, 't', this.value);
                                        pr = _H.make(_H.clone(this.items[idx]), mstrmojo.Obj),
                                        ctl = _H.make({pr: pr, dirty: -1}, mstrmojo.Obj); //set dirty flag
                                    pr.dtp = this.txInput.dtp;
                                    this.txInput.set('ctl', ctl);
                                }else{
                                    this.txInput.ctl = null; //performance optimization
                                }
                                if (this.txInput.editing){
                                    panel.set('panelIdx', this.value);
                                }
                            }
                        },
                        {
                            slot: j + ',4',
                            row: j,
                            tix: tix,
                            txInput: inputs[i],
                            scriptClass: 'mstrmojo.Button',
                            cssClass: 'mstrmojo-TransactionEditor-ExpandButton',
                            title: mstrmojo.desc(8250),
                            bindings:{
                                enabled: 'this.txInput.edt == 1'
                            },
                            onclick: function() {
                                var model = mstrmojo.all.teModel,
                                    me = this,
                                    show = !this.txInput.editing;
                                
                                if (model.isPropertiesValid()){
                                    if (panel.show && !this.txInput.editing){ //Close the panel under other Transaction Input
                                        model.currentTxInput.editing = false;
                                        panel.show = false;
                                        panel.playEffect('close', function(){
                                            me.onclick();
                                        });
                                    }else{
                                        if (show){
                                            model.set('currentTxInput', this.txInput);
                                            panel.set('panelIdx', this.txInput.ctl.pr.t);
                                            panel.targetDOM = this.parent[this.row + 1 + ',0'];
                                        }
                                        panel.set('show', show);
                                    }
                                }
                            }
                        });
                }
                return as;
            };
            
        return {
            scriptClass: 'mstrmojo.FieldSet',
            cssClass: 'mstrmojo-TransactionEditor-InputPropertiesField',
            legend: mstrmojo.desc(8243), // 'Input Properties'
            bindings:{
                visible: 'mstrmojo.all.teModel.txRpt != null'
            },
            children: [
                _createPanel({
                    cssClass: 'mstrmojo-TransactionEditor-scrollableInputPanel',
                    children:[
                        {       
                            scriptClass: 'mstrmojo.Table',
                            cellPadding: 1,
                            bindings:{
                                items: 'mstrmojo.all.teModel.txRpt.inputs'
                            },
                            onitemsChange: function(){
                                this.destroyChildren();
                                var items = this.items;
                                if (items && items.length > 0){
                                    this.layout = getLayout(items);
                                    this.set('children', getChildren(items));
                                    this.refresh();
                                    
                                    // center the editor dom node again when all the UI have been rendered
                                    mstrmojo.dom.center(mstrmojo.all.mstrTE.editorNode);
                                }
                            }
                        }
                    ]
                })
            ]
        };
    }());       
    
    var _controlPropsPanelJson = {
        id: 'ctrlPropPanel',
        scriptClass: 'mstrmojo.Box',
        targetDOM: null,
        panelIdx: 0,
        cssText: 'overflow:hidden;position:relative;',
        playEffect: function(type, callback){
            if (type == 'open'){
                this.targetDOM.appendChild(this.containerNode);
            }
        
            var start, end, me = this;
            
            switch (type){
            case 'open': start = 0; end = this.containerNode.childNodes[0].clientHeight; break;
            case 'close': start = this.containerNode.clientHeight; end = 0; break;
            }
            
            slideProp(true, this.containerNode, 'height', start, end, 
                function(){
                    if (type == 'open'){
                        me.containerNode.style.height = 'auto';
                    }else if (type == 'close'){
                        me.targetDOM.removeChild(me.containerNode);
                    }
                    callback && callback();
                }, null);
        },
        onshowChange: function(){
            mstrmojo.all.teModel.currentTxInput.editing = this.show;
            this.playEffect(this.show? 'open':'close');
        },
        onpanelIdxChange: function(){
            this.ctrlProps.display(this.panelIdx);
        },
        children:[
            {
                scriptClass: 'mstrmojo.FieldSet',
                alias: 'ctrlProps',
                legend: mstrmojo.desc(8250), // 'Control Properties'
                cssClass: 'mstrmojo-TransactionEditor-CtrlPropsPanel',
                display: function(t) {
                    var w = {
                            1: this.textField,
                            2: this.switch1,
                            3: this.list,
                            4: this.slider,
                            5: this.calendar,
                            6: this.timePicker,
                            7: this.toggle,
                            8: this.textArea
                    }[t];
                    for (var i = 0, len = this.children.length; i < len; i++){
                        this.children[i].set('visible', false);
                    }
                    if (w){
                        w.set('visible', true);
                    }
                },
                children: [
                   _textFieldPropertiesPanel, 
                   _switchPropertiesPanel,
                   _calendarPropertiesPanel, 
                   _timePickerPropertiesPanel,
                   _sliderPropertiesPanel,
                   _listPropertiesPanel,
                   _togglePropertiesPanel,
                   _textAreaPropertiesPanel
                ],
                postCreate: function(){
                    for (var i = 0, len = this.children.length; i < len; i++){
                        this.children[i].visible = false;
                    }
                }
            }
        ]
    };

    function pollSavingStatus(callback){
        mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
                success: function(res){
                    if (!res || res.status == 2 || res.status == 3){ // error status or have prompt
                        mstrmojo.alert(mstrmojo.desc(8256));
                        mstrmojo.all.teModel.set('saving', false);
                    }else if (res.status == 1 || res.status == 21){ // result is ready
                        if (callback){
                            callback();
                        }
                        mstrmojo.all.teModel.set('saving', false);
                    }else{
                        pollSavingStatus(callback); // continue polling status
                    }
                },
                failure: function(res){
                    mstrmojo.alert(mstrmojo.desc(8256));
                    mstrmojo.all.teModel.set('saving', false);
                }
            },
            {
                taskId: 'pollStatus',
                msgID: mstrmojo.all.teModel.messageID
            }
        );
    }
    
    function saveData(callback){
        mstrmojo.all.teModel.set('saving', true);
        mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
            success: function(res){
                if (callback){
                    callback();
                }
                mstrmojo.all.teModel.set('saving', false);
            },
            failure: function(res){
                // According to the task description, we have to check the error message to figure out whether we need to poll the status.
                if (res.getResponseHeader('X-MSTR-TaskFailureMsg').indexOf('Task exceeded the maximum wait time') > -1){
                    pollSavingStatus(callback); // 
                }else{
                    mstrmojo.alert(mstrmojo.desc(8256)); // 'Transaction configuration was not able to be saved.'
                    mstrmojo.all.teModel.set('saving', false);
                }
            }
        },
        {
            taskId: 'saveRWTransactions',
            msgID: mstrmojo.all.teModel.messageID,
            rwTransactionInfoXML: mstrmojo.all.teModel.getXML(),
            isEditExistingTXProperty: !mstrmojo.all.teModel.isNew
        });
    }
    
    var _advancedSettingsJson = {
        scriptClass: 'mstrmojo.FieldSet',
        cssClass: 'mstrmojo-TransactionEditor-AdvancedField',
        legend: mstrmojo.desc(702), //'Advanced',
        bindings: {
            visible: 'mstrmojo.all.teModel.txRpt != null'
        },
        children: [
            {
                scriptClass: 'mstrmojo.TristateCheckBox',
                grayed: false,
                text: mstrmojo.desc(8280), //'Auto-recalculate subtotals and derived metrics'
                bindings: {
                    checked: 'mstrmojo.all.teModel.rwTxs.arc',
                    visible: function(){
                        return mstrmojo.all.teModel.rwTxs.tp == RW_UNIT_GRIDGRAPH;
                    }
                },
                oncheckedChange: function(){
                    if (this.checked != null){
                        mstrmojo.all.teModel.rwTxs.arc = this.checked;
                    }
                }
            },
            {
                scriptClass: 'mstrmojo.TristateCheckBox',
                grayed: false,
                text: mstrmojo.desc(8281), //'Mark rows for selection'
                bindings: {
                    checked: function(){
                        return mstrmojo.all.teModel.rwTxs.ctp == CHANGE_TYPE_MARK_SELECTION;
                    },
                    visible: function(){
                        return mstrmojo.all.teModel.rwTxs.tp == RW_UNIT_GRIDGRAPH;
                    }
                },
                oncheckedChange: function(){
                    if (this.checked != null){
                        mstrmojo.all.teModel.rwTxs.ctp = this.checked? CHANGE_TYPE_MARK_SELECTION : CHANGE_TYPE_DEFAULT;
                    }
                }
            },
            {
                scriptClass: 'mstrmojo.TristateCheckBox',
                grayed: false,
                bindings: {
                    text: function(){ //Flag cells/fields with modified data
                        return (mstrmojo.all.teModel.rwTxs.tp == RW_UNIT_GRIDGRAPH) ? mstrmojo.desc(8309) : mstrmojo.desc(8308);
                    },
                    checked: 'mstrmojo.all.teModel.rwTxs.sci'
                },
                oncheckedChange: function(){
                    if (this.checked != null) {
                        mstrmojo.all.teModel.rwTxs.sci = this.checked;
                    }
                }
            }
        ]
    };
    
    var _buttonsBarJson = {
        scriptClass: 'mstrmojo.HBox',
        cssClass:'mstrmojo-Editor-buttonBox',
        cssText: mstrmojo.dom.isIE7 ? 'float:none':'',
        slot:'buttonNode',
        children: [
            {
                scriptClass: 'mstrmojo.HTMLButton',
                cssClass: 'mstrmojo-Editor-button',
                cssText: 'height:22px',
                text: mstrmojo.desc(1442), //'OK'
                bindings:{
                    text: 'mstrmojo.all.teModel.saving? mstrmojo.desc(8298) + "..." : mstrmojo.desc(1442)'
                },
                onclick: function(evt){
                    var model = mstrmojo.all.teModel;
                    if (!model.saving && (model.txRpt == null || (model.isPropertiesValid() && model.isAllInputsMapped()))){
                        var me = this;
                        saveData(function(){
                            me.parent.parent.close();
                        });
                    }
                }
            },
            {
                scriptClass: 'mstrmojo.HTMLButton',
                cssClass: 'mstrmojo-Editor-button',
                cssText: 'height:22px',
                text: mstrmojo.desc(221,'Cancel'),
                onclick: function(evt){
                    if (!mstrmojo.all.teModel.saving){    
                        this.parent.parent.close();
                    }
                }
            }
        ]
    };
    
    var _disableCurtainJson = {
        scriptClass: 'mstrmojo.Label',
        slot: 'editorNode',
        cssClass: 'mstrmojo-TransactionEditor-disableCurtain',
        bindings: {
            visible: 'mstrmojo.all.teModel.saving'
        }
    };
    
    mstrmojo.txEditorModel = {
        id:'teModel',

        scriptClass: 'mstrmojo.Model',
        
        /**
         * Due to the fact that we are using txRpt as the model for the mapping, the 'rwTxs' is not updated when we
         * make change on the editor. So this method is meant to mark the transactable objects that have been mapped to transaction inputs.
         * This information would be useful when we render the pulldown for transactable objects.
         */
        markMappedObjects: function(){
            var tscObjs = this.rwTxs.tscObjs,
                txInputs = this.txRpt.inputs;
            for (var i = 0, len = tscObjs.length; i < len; i++){
                tscObjs[i].mapped = 0;
            }
            for (var i = 0, len = txInputs.length; i < len; i++){
                var toi = txInputs[i].toi;
                if (toi != null){
                    tscObjs[toi].mapped = 1;
                }
            }
        },
        
        /**
         * To load the definition of a transaction report.
         * newFlag param indicates whether this is a new mapping between the grid/field group and tx report.
         * 
         */
        setTxReport: function(txRptId, txRptName, newFlag){
            var me = this;    
            this.isNew = newFlag;
            this.rwTxs.txRptId = txRptId;
            
            if (this.rwTxs.ctp == null){
                this.rwTxs.ctp = CHANGE_TYPE_DEFAULT;
            }
            
            mstrmojo.xhr.request('GET', mstrConfig.taskURL, {
                success: function(res){
                    if (res){
                        res.nm = txRptName; 
                        mstrmojo.all.teModel.set('txRpt', res);
                        mstrmojo.all.teModel.markMappedObjects();
                    }
                },
                failure: function(res){
                    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                }
            },
            {
                taskId: 'getTransactionReportDefinition',
                transactionReportId: txRptId
            });
        },
        
        _set_rwTxs: function(n, v){ //get called by docCommands.js
            var ls = v.tscObjs, len = ls.length, i;

            // give each transactable an unique index
            for (i = 0; i < len; i++){
                ls[i].idx = i;
            }
            this.rwTxs = v;
            
            // Already associated with a transaction report
            if (this.rwTxs.txRptId){
                this.setTxReport(this.rwTxs.txRptId, this.rwTxs.txRptName, false);
            }
            
            return true;
        },
        
        // We will use mstrmojo.all.teModel.txRpt as the model where all the editor actions are performed on.
        _set_txRpt: function(n, v){
            if (v){
                for (var i = 0, l = v.inputs.length; i < l; i++){
                    var ti = v.inputs[i];
                    _H.make(ti, mstrmojo.Obj);
                    
                    ti.edt = 0;
                    ti.ctl = null;
                    
                    for (var j = 0, ll = this.rwTxs.tscObjs.length; j < ll; j++){
                        var tso = this.rwTxs.tscObjs[j];
                        
                        //Need to reset/copy 'edt', 'pr' properties to mstrmojo.all.teModel.txRpt 
                        //which is the place that all the editor actions are performed on. 
                        if (this.isNew){ // We are associating a new transaction report with the grid/FG 
                            // Make a guess based on whether transactable object and transaction input have the same GUID
                            if (tso.did === ti.did && tso.fid === ti.fid){
                                ti.toi = tso.idx;
                                break;
                            }
                        }else{ // Association already defined, find the existed one
                            if (tso.tix === ti.tix){
                                ti.toi = tso.idx;
                                ti.edt = tso.edt || 0;
                                ti.ctl = tso.ctl || null;
                                
                                if (ti.ctl != null) {
                                    var dfvs = this.rwTxs.dfvs,
                                        pr = ti.ctl.pr;
                                    
                                    //The date string passed from the server is in the US Locale('M/d/yyyy H:mm:ss')
                                    //We need to localize it.
                                    if (ti.dtp === 14 || ti.dtp === 15 || ti.dtp === 16){
                                        if (pr.t == CTRL_CALENDAR){
                                            pr.max = _toLocaleDateString(pr.max);
                                            pr.min = _toLocaleDateString(pr.min);
                                        }else if (pr.vls != null){
                                            var vls = pr.vls;
                                            for (var a = 0, lll = vls.length; a < lll; a++){
                                                var vl = vls[a];
                                                vl.v = _toLocaleDateString(vl.v);
                                            }
                                        }
                                    }
                                    
                                    //Data type of the mapped transaction input column
                                    pr.dtp = ti.dtp;
                                    
                                    //Merge the default values with the user-configured ones
                                    for (var k = 0, lll = dfvs.length; k < lll; k++){
                                        if (dfvs[k].t === pr.t){
                                            ti.ctl.pr = _H.copy(pr, _H.clone(dfvs[k]));
                                            break;
                                        }
                                    }
                                    
                                    //If ddic setting is invalid, this property is not presented in the json.
                                    //To avoid js errors, need to assign it a value.
                                    if (pr.t === CTRL_LIST && pr.ipt === INPUT_VALUES_DATASET && !ti.ctl.ddic){
                                        ti.ctl.ddic = {};
                                    }
                                    
                                    
                                    _H.make(ti.ctl, mstrmojo.Obj);
                                    _H.make(ti.ctl.pr, mstrmojo.Obj);
                                    _H.make(ti.ctl.ddic, mstrmojo.Obj);
                                }
                                
                                //Ideally, an editable transaction input should have a default control.
                                //But we still add a check here in case the data is incorrect.
                                if (ti.edt == 1 && ti.ctl == null){
                                    ti.edt = 0;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            this.txRpt = v;
            return true;
        },
        
        _set_currentTxInput: function(n, v){
            // mark that the control properties have been changed
            if (v && v.ctl){
                v.ctl.dirty = -1;
            }
            this.currentTxInput = v;
            return true;
        },
        
        /**
         * Map the transaction input to a new grid object/field. 
         */
        updateTxMapping: function(txInput, idx){
            if (idx != null){
                var tscObjs = this.rwTxs.tscObjs,
                    inputs = this.txRpt.inputs;
                
                if (txInput.toi != null){
                    tscObjs[txInput.toi].mapped = 0;
                }
                tscObjs[idx].mapped = 1;
                
                for (var i = 0, len = inputs.length; i < len; i++){
                    // Disconnect the previous transaction input with this grid object
                    if (inputs[i].toi === idx){
                        inputs[i].set('toi', null); 
                        inputs[i].set('edt', 0);
                        inputs[i].set('ctl', null);
                        break;
                    }
                }
                
                txInput.set('toi', idx);
                
//                if (txInput.ctl && txInput.ctl.pr.ipt === INPUT_VALUES_DATASET){
//                    this.updateDDICSetting(txInput);
//                }
            }
        },
        
        /**
         * populate the default ddic settings if not configured yet
         */
        updateDDICSetting: function(txInput){
            if (!txInput.ctl.ddic){
                var ddic = new mstrmojo.Obj(),
                    rwTxs = mstrmojo.all.teModel.rwTxs,
                    ds = rwTxs.ds,
                    idx = mstrmojo.array.find(rwTxs.tscObjs, 'idx', txInput.toi),
                    to = rwTxs.tscObjs[idx];
            
                //If the grid object is an attribute
                if (to.tp == DSSXML_ATTRIBUTE){
                    //Use this attribute as the data source 
                    for (var i = 0, len = ds.length; i < len; i++){
                        if (mstrmojo.array.find(ds[i].attrs, 'did', to.did) > -1){
                            ddic.dsid = ds[i].dsid;
                            ddic.dst = ds[i].dst;
                            break;
                        }
                    }
                    ddic.cst = to.tp;
                    ddic.csid = to.did;
                    ddic.wfid = to.fid;
                }
                
                txInput.ctl.set('ddic', ddic);
            }
        },
        
        /**
         * Given the data type of the transaction input, return a list of suitable control styles.
         * The first item would be the default style.
         */
        getControls: function(dtp){
            var ctrls;
            
            if (isNumericType(dtp)){ //number
                ctrls = [CTRL_SLIDER, CTRL_TEXTFIELD, CTRL_TEXTAREA, CTRL_SWITCH, CTRL_LIST, CTRL_TOGGLE];
            }else if (isStringType(dtp)){ //text
                ctrls = [CTRL_TEXTFIELD, CTRL_TEXTAREA, CTRL_SWITCH, CTRL_LIST, CTRL_TOGGLE];
            }else if (dtp == 14){ //Date
                ctrls = [CTRL_CALENDAR, CTRL_TEXTFIELD, CTRL_TEXTAREA, CTRL_LIST];
            }else if (dtp == 15 || dtp == 16){ //DateTime
                ctrls = [CTRL_CALENDAR, CTRL_TIMEPICKER, CTRL_TEXTFIELD, CTRL_TEXTAREA, CTRL_LIST];
            }else {
                ctrls = [CTRL_TEXTFIELD, CTRL_TEXTAREA, CTRL_SWITCH, CTRL_LIST, CTRL_SLIDER, CTRL_CALENDAR, CTRL_TIMEPICKER, CTRL_TOGGLE];
            }
            
            for (var i = 0; i < ctrls.length; i++){
                ctrls[i] = this.rwTxs.dfvs[mstrmojo.array.find(this.rwTxs.dfvs, 't', ctrls[i])];
                ctrls[i].n = CONTROL_NAMES[ctrls[i].t]; //give them a name;
            }
            return ctrls;
        },
        
        /**
         * Called upon clicking OK. Check whether all the transaction inputs have been mapped
         */
        isAllInputsMapped: function(){
            var txInputs = mstrmojo.all.teModel.txRpt.inputs;
            for (var i = 0, len = txInputs.length; i < len; i++){
                if (txInputs[i].toi == null){
                    mstrmojo.alert(mstrmojo.desc(8257)); // 'Please map all transaction inputs before continuing.'
                    return false;
                }
            }
            return true;
        },
        
        /**
         * Validate the control properties. 
         */
        isPropertiesValid: function(){
            var cti = this.currentTxInput,
                pr = cti && cti.editing && cti.ctl.pr,
                errMsg = '';
            if (pr){
                //Check invalid properties
                for (var i in pr){
                    if (i == 'vls'){
                        for (var j = 0; j < pr.vls.length; j++){
                            var vl = pr.vls[j];
                            if (vl.invalidFlag == 1){
                                //You have one or more invalid entries in the control properties. Please correct this before continuing.
                                errMsg = mstrmojo.desc(8258);
                                break;
                            }
                        }
                    }else if (pr[i] == null){//invalid entry
                        if (pr.ipt !== undefined && pr.ipt != INPUT_VALUES_CALCULATED && (i == 'min' || i == 'max' || i == 'itv')){
                            //skip the case if input type(slider or list) is not calculated.
                        }else if (pr.t == CTRL_TEXTFIELD){
                            if ((isNumericType(cti.dtp) && ((i == 'min' && pr.emin) ||  (i == 'max' && pr.emax))) || 
                                    (isStringType(cti.dtp) && (i == 'ml' || i == 'mnl')) ||
                                    (pr.vm == REG_EXP && i == 'rgx')) {
                                //You have one or more invalid entries in the control properties. Please correct this before continuing.
                                errMsg = mstrmojo.desc(8258);
                            }
                        }else {
                            //You have one or more invalid entries in the control properties. Please correct this before continuing.
                            errMsg = mstrmojo.desc(8258);
                        }
                    }
                    
                    if (errMsg){
                        break;
                    }
                }
                //Run validation rules(e.g. max-min-itv, non-empty manual list)
                if (!errMsg){
                    switch(pr.t){
                    case CTRL_TEXTFIELD:
                        if (isNumericType(cti.dtp)){
                            if (pr.emin && pr.emax){
                                if (parseFloat(pr.min) > parseFloat(pr.max)){
                                    errMsg = mstrmojo.desc(8283); //The minimum value must be less than the maximum.
                                }
                            }
                        }else if (isStringType(cti.dtp)){
                            if (parseInt(pr.mnl) > parseInt(pr.ml)){
                                errMsg = mstrmojo.desc(8999); //'The minimum length must be less than the maximum.'
                            }
                        }
                        break;
                    case CTRL_CALENDAR:
                        if (pr.min && pr.max && _P.compareDateAndOrTime(pr.min, pr.max) > 0){
                            //The minimum date must be less than the maximum.
                            errMsg = mstrmojo.desc(8278);
                        }
                        break;
                    case CTRL_SLIDER:
                    case CTRL_LIST: 
                        if(pr.ipt == INPUT_VALUES_CALCULATED){ //calculated
                            var min = parseFloat(pr.min),
                                max = parseFloat(pr.max),
                                range = max - min;
                                itv = parseFloat(pr.itv);
                            if (range <= 0){
                                errMsg = mstrmojo.desc(8283); //The minimum value must be less than the maximum.
                            }else if (itv > range || !_N.isInt(range/itv)){
                                errMsg = mstrmojo.desc(8284); //The interval does not conform to the min and max values.
                            }
                            break;
                        }else if (pr.ipt == INPUT_VALUES_DATASET){
                            var ddic = cti.ctl.ddic;
                            if (!ddic.dsid || !ddic.csid || !ddic.wfid){
                                //You have one or more invalid entries in the control properties. Please correct this before continuing.
                                errMsg = mstrmojo.desc(8258);
                            }
                            break;
                        }
                        //manual input type: fall through
                    case CTRL_TOGGLE:
                        var isListEmpty = true;
                        for (var i = 0; i < pr.vls.length; i++){
                            var vl = pr.vls[i];
                            if (!_S.isEmpty(vl.n) || !_S.isEmpty(vl.v)){
                                isListEmpty = false;
                                break;
                            }
                        }
                        if (isListEmpty){
                            errMsg = mstrmojo.desc(8279);//The manual list cannot be empty.
                        }
                    }
                }
            }
            if (errMsg){
                mstrmojo.alert(errMsg);
                return false;
            }
            
            return true;
        },
        
        /**
         *  Generate the saving xml for transaction configuration. 
         */
        getXML: function(){
            if (this.txRpt == null){
            // This is the case that we are going to remove the association
                return _S.json2xml('rwTxs', {keyCtx: this.rwTxs.keyCtx}, 
                                        {isSerializable: function(){return true;}});
            }

            var inputs = this.txRpt.inputs,
                tscObjs = this.rwTxs.tscObjs,
                dirtyTscObjs = [], ctlKey;

            //We will transform the mstrmojo.all.teModel.rwTxs object to xml. 
            //Before that, we need to copy mapping related information from mstrmojo.all.teModel.txRpt
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i],
                    tscObj = tscObjs[input.toi];

                // If this is a new association, or mapping has been changed, or editable is checked/unchecked, 
                // or control properties have been updated, we will mark this transactable object as "dirty". 
                if (this.isNew || tscObj.tix != input.tix || tscObj.edt != input.edt || (input.ctl && input.ctl.dirty)){
                    dirtyTscObjs.push(tscObj);
                }

                tscObj.tix = input.tix;
                tscObj.edt = input.edt;
                
                // remember the old control key if possible
                ctlKey = tscObj.ctl && tscObj.ctl.ctlKey;
                
                tscObj.ctl = input.ctl;
                
                // Assign a new control key if it doesn't have one
                if (tscObj.ctl != null){
                    tscObj.ctl.ctlKey = ctlKey || mstrmojo.all.teModel.getNewCtlKey();
                }
                
                tscObj.mark = -1;
            }

            for (var i = 0; i < tscObjs.length; i++){
                var tscObj = tscObjs[i];
                // For those transactable object which has existed mapping with txInput, we need to mark them as "dirty" as well.
                if (!tscObj.mark && tscObj.tix != null){
                    tscObj.edt = 0;
                    tscObj.ctl = null;
                    tscObj.tix = -1;
                    dirtyTscObjs.push(tscObj);
                }
                
                tscObj.mark = 0; // clear the mark flag;
            }
            
            var cfg = {
                    isSerializable: function(nodeName, jsons, idx){
                        switch(nodeName){
                        case 'keyCtx':
                        case 'txRptId':
                        case 'tp':
                        case 'ctp':
                        case 'arc':
                        case 'sci':
                        case 'tscObjs':
                        case 'did':
                        case 'fid':
                        case 'key':
                        case 'edt':
                        case 'tix':
                        case 'ctl':
                        case 'ctlKey':
                        case 'ddic':
                        case 'dsid':
                        case 'dst':
                        case 'csid':
                        case 'cst':
                        case 'wfid':
                        case 'pr':
                        case 'ml':
                        case 'mnl':
                        case 'emax':
                        case 'emin':
                        case 'vm':
                        case 'rgx':
                        case 'siwc':
                        case 'sp':
                        case 'pl':
                        case 'w':
                        case 'wm':
                        case 'ict':
                        case 'ipt':
                        case 'itv':
                        case 'dm':
                        case 't':
                        case 'ust':
                        case 'psw':
                        case 'ldw':
                            return true;
                        case 'min':
                        case 'max':
                            var pr = jsons[idx],
                                t = pr.t,
                                v = pr[nodeName];
                            if (t == CTRL_CALENDAR){
                                return {att: nodeName + '="' + _S.encodeXMLAttribute(_toUSDateString(v)) + '"'};
                            }else{
                                return true;
                            }
                        case 'vls':
                            var pr = jsons[idx],
                                t = pr.t,
                                vls = pr.vls,
                                dtp = pr.dtp,
                                regExp = /(\^|\||\\)/g,
                                as = [],
                                ESC = function(n){
                                    if (n == null){
                                        n = '';
                                    }
                                    return (typeof n == 'string') ? n.replace(regExp, '\\$1') : n;
                                };
                            
                            //Optimization: Send empty "vls" if it's not manual list or slider.
                            if ((t === CTRL_LIST || t === CTRL_SLIDER) && pr.ipt !== INPUT_VALUES_MANUAL){
                                return {att: 'vls=""'};
                            }
                            
                            for (var j = 0;j < vls.length;j++){
                                var vl = vls[j], s = '';
                                if (vl.unset){
                                    continue;
                                }
                                
                                if (t == CTRL_TOGGLE || t == CTRL_LIST){
                                    s += ESC(vl.n) + '^';
                                }
                                if (vl.v != null){
                                    if (dtp == 14 || dtp == 15 || dtp == 16){
                                        s += ESC(_toUSDateString(vl.v));
                                    }else{
                                        s += ESC(vl.v);
                                    }
                                }
                                if (s){
                                    as.push(s);
                                }
                            }
                            return {att: 'vls="' + _S.encodeXMLAttribute(as.join('|'))+'"'};
                        }
                        return false;
                    },
                    getArrItemName: function(n, v, i){
                        if(n == 'tscObjs'){
                            return 'tscObj';
                        }
                    },
                    skipNull: true
            };
            
            var temp = this.rwTxs.tscObjs;

            //replace with dirty objects only.
            this.rwTxs.tscObjs = dirtyTscObjs;
            var xml = _S.json2xml('rwTxs', this.rwTxs, cfg);
            
            this.rwTxs.tscObjs = temp;
            
            return xml;
        }
    };
        
    
    mstrmojo.TransactionEditor = {
        id: 'mstrTE',
        
        scriptClass: 'mstrmojo.Editor',
        
        title: mstrmojo.desc(8297), //'Configure Transaction' 
        
        zIndex: 112,
        
        cssClass: 'mstrmojo-TransactionEditor',
        
        help: 'configure_transactions_dialog_box.htm',
        
        model: mstrmojo.txEditorModel, 
        
        /* Is it trying to associate with a transaction report? */
        isNew: false,
        
        txRptSelector: {
            scriptClass: 'mstrmojo.Editor',
            title: mstrmojo.desc(8264), // 'Select Transactions'
            cssClass: 'mstrmojo-TranasactionPicker',
            cssText: 'width: 210px',
            help: 'Select_Transaction_dialog_box.htm',
            model: null,
            zIndex: 112,
            teEditor: null, // reference to the transaction editor
            onOpen: function(){
                this.objectBrowser.browse({
                    browsableTypes: '778,8',
                    onSelectCB : [this, 'onSelect']
                });
                this.objectBrowser.obSearchBox.objectTypes = '778,8';
                this.objectBrowser.set('visible', true);
            },
            onClose: function(isOK){
                if (isOK && this.txRpt){
                    this.opener.model.setTxReport(this.txRpt.did, this.txRpt.n, true);
                    this.opener.open();
                }
                this.txRpt = null;
            },
            onSelect: function(item){
                if (item.did){
                    this.set('txRpt', item);
                }
            },
            children:[
                {
                    alias: 'objectBrowser',
                    scriptClass : 'mstrmojo.ObjectBrowser', 
                    showCompletePath: false, 
                    folderLinksContextId : 14,
                    closeOnSelect: false,
                    useAnimate: true,
                    closeable: false
                },{
                    scriptClass: 'mstrmojo.HBox',
                    cssClass:'mstrmojo-Editor-buttonBox',
                    slot:'buttonNode',
                    children: [
                        {//buttons
                            scriptClass: 'mstrmojo.HTMLButton',
                            cssClass: 'mstrmojo-Editor-button',
                            text: mstrmojo.desc(1442), //'OK'
                            bindings:{
                                enabled:'this.parent.parent.txRpt != null'
                            },
                            onclick: function(evt){
                                this.parent.parent.close(true);
                            }
                        },                                
                        {//buttons
                            scriptClass: 'mstrmojo.HTMLButton',
                            cssClass: 'mstrmojo-Editor-button',
                            text: mstrmojo.desc(221), //'Cancel'
                            onclick: function(evt){
                                this.parent.parent.close();
                            }
                        }
                    ]
                }
            ]
        },
        
        open: function(){
            var m = this.model;
            
            if (m.rwTxs.txRptId == null){ // No transaction report associated, need to let user choose one
                if (!this.txRptSelector.domNode){
                    this.txRptSelector = mstrmojo.insert(this.txRptSelector);
                }
                // Let user choose a transaction report first before showing the transaction editor
                this.txRptSelector.open(this);
            }else{
                mstrmojo.Editor.prototype.open.apply(this);
            }
        },
        
        onClose: function(){
            //clean up
            this.model.rwTxs = null;
            this.model.currentTxInput = null
            mstrmojo.all.ctrlPropPanel.show = false;
            this.model.set('txRpt', null);
        },
        
        postCreate: function(props){
            this.model = mstrmojo.insert(this.model);
            mstrmojo.insert(_controlPropsPanelJson).render(); //render it first so that when user expands the panel, the UI won't freeze.
        },
        
        children:[ _reportSelectorJson, _fieldsMapTableJson, _buttonsBarJson, _advancedSettingsJson, _disableCurtainJson]
    };
})();