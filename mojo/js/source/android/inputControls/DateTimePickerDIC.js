(function(){
    
    mstrmojo.requiresCls("mstrmojo.ui.MobileDateTimePicker", "mstrmojo.android._HasPreviewButton");
    
    var $D = mstrmojo.date,
        $H = mstrmojo.hash,
        CALENDAR = 5,
        TIMEPICKER = 6,
        DTP = mstrmojo.expr.DTP;
    
    mstrmojo.android.inputControls.DateTimePickerDIC = mstrmojo.declare(
        mstrmojo.ui.MobileDateTimePicker,
        [mstrmojo._IsInputControl, mstrmojo.android._HasPreviewButton],
        {
            scriptClass: "mstrmojo.android.inputControls.DateTimePickerDIC",
            
            cssText: '',
            
            valueField: 'dtValue',
            
            /**
             * The title to be shown on the DIC popup
             */
            popupTitle: '',
            
            /**
             * css class for the preview button
             */
            toggleImagesCss: '',
            
            init: function init(props){
                var dic = props.dic;
                
                if (dic.min !== undefined){
                    props.min = $D.parseDateAndOrTime(dic.min);
                }
                if (dic.max !== undefined){
                    props.max = $D.parseDateAndOrTime(dic.max);
                }
                
                props[this.valueField] = $D.parseDateAndOrTime(props.value);
                
                // This input control corresponds to two control style: calendar and timepicker.
                if (dic.t === CALENDAR){
                    props.dtp = dic.ict ? DTP.TIMESTAMP : DTP.DATE;
                    props.popupTitle = dic.ict ? mstrmojo.desc(7656): mstrmojo.desc(2052); //'Date and Time' : 'Date'
                    props.toggleImagesCss = 'mstrmojo-Android-DatePreview';
                }else if (dic.t === TIMEPICKER){ 
                    props.dtp = DTP.TIME;
                    props.minuteInterval = props.dic.itv;
                    props.popupTitle = mstrmojo.desc(2170); //'Time'
                    props.toggleImagesCss = 'mstrmojo-Android-TimePreview';
                }
                
                this._super(props);
            },
            
            getCurValue: function getCurValue() {
                var oldDateTime = this[this.valueField] || {date:{year:1970, month:1, day:1}, time:{hour:0, min:0, sec:0}},
                    date = this.getDate() || oldDateTime.date,
                    time = this.getTime() || oldDateTime.time,
                    dt = this.dic.dt,
                    LD = mstrmojo.locales.datetime,
                    timeFormat = LD.TIMEOUTPUTFORMAT,
                    dateFormat = LD.DATEOUTPUTFORMAT;
                   
                if (dt == DTP.TIMESTAMP){
                    return $D.formatDateInfo(date, dateFormat) + ' ' + $D.formatTimeInfo(time, timeFormat);
                }else if (dt == DTP.TIME){
                    return $D.formatTimeInfo(time, timeFormat);
                }else {
                    return $D.formatDateInfo(date, dateFormat);
                }
            },
            
            //TQMS 503967: While rendering the datetime picker for the first time, we need to use the display value.
            renderPreview: function renderPreview(v) {
                //call _HasPreviewButton minxin function to render the button
                this.renderPreviewButton(this.openerNode, (v !== undefined) ? v : this.getCurValue());
            }
        }
    );
}());

