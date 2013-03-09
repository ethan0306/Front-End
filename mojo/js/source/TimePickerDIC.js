(function() {
    mstrmojo.requiresCls("mstrmojo.TimePicker", "mstrmojo._IsInputControl");

    var MINUTE_FIELD = 2;

    mstrmojo.TimePickerDIC = mstrmojo.declare(
        mstrmojo.TimePicker,
        
        [mstrmojo._IsInputControl],
        
        {
            scriptClass: 'mstrmojo.TimePickerDIC',
            
            popupStyle: 2, //POPUP_BELOW
            
            init: function(props){
                if (this._super){
                    this._super(props);
                }
                
                this.set('interval', this.dic.itv);
                this.set('active', MINUTE_FIELD); //set active field to be minutes
            }
        }
    );
}());