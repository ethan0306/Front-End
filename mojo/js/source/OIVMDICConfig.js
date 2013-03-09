(function() {
    mstrmojo.requiresCls("mstrmojo.OIVMDICPopup",
                        "mstrmojo.SliderDIC", 
                        "mstrmojo.TextFieldDIC", 
                        "mstrmojo.CheckBoxDIC", 
                        "mstrmojo.ListDIC", 
                        "mstrmojo.CalendarDIC", 
                        "mstrmojo.TimePickerDIC", 
                        "mstrmojo.ToggleDIC", 
                        "mstrmojo.TextAreaDIC",
                        "mstrmojo.MarkRowDIC");

    var dicPopup = null,
        TEXTBOX = 1,
        SWITCH = 2,
        LIST = 3,
        SLIDER = 4,
        CALENDAR = 5,
        TIMEPICKER = 6,
        TOGGLE = 7,
        TEXTAREA = 8;
    
    mstrmojo.OIVMDICConfig = mstrmojo.provide(
            "mstrmojo.OIVMDICConfig",
            {
                DICList: {
                    1: mstrmojo.TextFieldDIC, //Textbox, popup
                    2: mstrmojo.CheckBoxDIC,//Checkbox, inline
                    3: mstrmojo.ListDIC, //DropDownList, popup/inline
                    4: mstrmojo.SliderDIC, //Slider, popup/inline
                    5: mstrmojo.CalendarDIC, //Calendar, popup
                    6: mstrmojo.TimePickerDIC,  //Time picker, popup 
                    7: mstrmojo.ToggleDIC,  //Image toggle, inline
                    8: mstrmojo.TextAreaDIC, //Text area, inline/popup
                    102: mstrmojo.MarkRowDIC //Subclass of CheckBoxDIC, inline
                },
                
                /**
                 * If true, we should render the input control as inline and replace the content of the editable cell or text field with it.
                 * @param dic {Object}
                 * @param openerType {Integer} 1=xtab, 2=field group
                 * @return {Boolean}
                 */
                showDICByDefault: function(dic, openerType) {
                    if (dic.sbd === undefined){
                        if (dic.t == TEXTAREA && dic.dm == 0 && dic.siwc){
                            dic.sbd = true; //TODO: this is a hack specifically for text area DIC. Remove it!
                        }else{
                            dic.sbd = dic.dm === 1;
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
                    //TODO: refactoring the text area dic upon this infrastructure 
                    if (dic.hpp === undefined) {
                        dic.hpp = false;
                    }
                    
                    return dic.hpp; 
                },
                
                DICPopup: {
                    getInstance: function(opener, dic) {
                        // the popup instance is shared by all input controls
                        if(!dicPopup) {
                            dicPopup = new mstrmojo.OIVMDICPopup();
                            dicPopup.render();
                        }
                        // open it and pass in the reference to the input control itselft
                        dicPopup.open(opener, {widget: dic});
                        return dicPopup;
                    }
                }
    });
    
    mstrmojo.DICConfig = mstrmojo.OIVMDICConfig;
    mstrmojo.DICList = mstrmojo.DICConfig.DICList;
    mstrmojo.DICPopup = mstrmojo.DICConfig.DICPopup;
})();