(function() {
    mstrmojo.requiresCls("mstrmojo.android.AndroidDICPopup",
            "mstrmojo.android.inputControls.SliderDIC", 
            "mstrmojo.android.inputControls.TextFieldDIC", 
            "mstrmojo.android.inputControls.CheckBoxDIC", 
            "mstrmojo.android.inputControls.ListDIC", 
            "mstrmojo.android.inputControls.CalendarDIC", 
            "mstrmojo.android.inputControls.DateTimePickerDIC", 
            "mstrmojo.android.inputControls.TextAreaDIC",
            "mstrmojo.android.inputControls.MarkRowDIC",
            "mstrmojo.android.inputControls.ToggleDIC");
            
	mstrmojo.requiresDescs(221,1442);            

    var $BTN = mstrmojo.Button.newAndroidButton,
        TEXTFIELD = 1,
        SWITCH = 2,
        LIST = 3,
        SLIDER = 4,
        CALENDAR = 5,
        TIMEPICKER = 6,
        TOGGLE = 7,
        TEXTAREA = 8,
        MARKROW = 102,
        //input control owner type
        XTAB = 1,
        FIELDGROUP = 2;
    
    
    mstrmojo.android.AndroidDICConfig = mstrmojo.provide(
            "mstrmojo.android.AndroidDICConfig", 
            {
                DICList: {
                    1: mstrmojo.android.inputControls.TextFieldDIC, 
                    2: mstrmojo.android.inputControls.CheckBoxDIC,
                    3: mstrmojo.android.inputControls.ListDIC,
                    4: mstrmojo.android.inputControls.SliderDIC,
                    5: mstrmojo.android.inputControls.DateTimePickerDIC,
                    6: mstrmojo.android.inputControls.DateTimePickerDIC,
                    7: mstrmojo.android.inputControls.ToggleDIC,
                    8: mstrmojo.android.inputControls.TextAreaDIC,
                    102: mstrmojo.android.inputControls.MarkRowDIC
                },
                
                DICPopup: {
                    getInstance: function(opener, dic) {
                        //TQMS 513675: DDIC List has not been implemented on Android yet.
                        if (dic.dic.t == LIST && dic.dic.ipt == 2){
                            mstrmojo.alert(mstrmojo.desc(8637)); // "Dataset list controls are not supported on Android."
                            return;
                        }
                    
                        // on the tablet, we will show the anchor if it's not textfield or textarea input control.
                        var anchor = (mstrApp.isTablet() && dic.dic.t != TEXTFIELD && dic.dic.t != TEXTAREA) ? dic.openerNode : null,
                            // let mstrApp create the popup for us
                            popup = mstrApp.showPopup({
                                                            scriptClass: 'mstrmojo.android.AndroidDICPopup',
                                                            widget: dic,
                                                            buttons:[
                                                                     $BTN(mstrmojo.desc(1442, 'OK'), function(){
                                                                         return this.parent.parent.onApply();
                                                                     }), 
                                                                     $BTN(mstrmojo.desc(221, 'Cancel'), function(){
                                                                         this.parent.parent.onCancel();
                                                                     })
                                                            ],
                                                            title: dic.popupTitle
                                                       }, anchor);
                        return popup;
                    }
                },
                
                /**
                 * If true, we should render the input control as inline and replace the content of the editable cell or text field with it.
                 * @param dic {Object}
                 * @param openerType {Integer} 1=xtab, 2=field group
                 * @return {Boolean}
                 */
                showDICByDefault: function(dic, openerType) {
                    if (dic.sbd === undefined){
                        switch (dic.t) {
                            case LIST:
                            case CALENDAR:
                            case TIMEPICKER:
                            case TEXTFIELD: dic.sbd = false; break; //popup only
                            case TOGGLE:
                            case SWITCH:
                            case MARKROW: dic.sbd = true; break;
                            default: dic.sbd = dic.dm === 1; //slider, textarea
                        }
                    }
                    
                    return dic.sbd;
                },
                
                /**
                 * It tells whether a popup dic has the preview to be rendered inside the grid cell or textfield.
                 *  
                 * @param dic {Object}
                 * @param openerType {Integer} 1=xtab, 2=field group
                 * @return {Boolean}
                 */
                hasDICPreview: function(dic, openerType) {
                    if (dic.hpp === undefined) {
                        switch (dic.t) {
                            //TQMS:501250 for ListDIC in Grid, we need to show the list value, therefore, we enable the preview button for listDIC
                            //only when show by default is set to true
                            case LIST: dic.hpp = dic.dm; break;
                            case CALENDAR:
                            case TIMEPICKER: dic.hpp = (openerType === FIELDGROUP); break; //show preview in Field group
                            case TEXTAREA: dic.hpp = dic.siwc; break;
                            default: dic.hpp = false;
                        }
                    }
                    
                    return dic.hpp; 
                }
    });
    
    mstrmojo.DICConfig = mstrmojo.android.AndroidDICConfig;
    mstrmojo.DICList = mstrmojo.android.AndroidDICConfig.DICList;
    mstrmojo.DICPopup = mstrmojo.android.AndroidDICConfig.DICPopup;
}());