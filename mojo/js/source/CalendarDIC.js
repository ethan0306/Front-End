(function() {
    mstrmojo.requiresCls("mstrmojo.css", "mstrmojo.date", "mstrmojo.DateTextBox", "mstrmojo._IsInputControl");
    
    var $C = mstrmojo.css,  _DTP = mstrmojo.expr.DTP;
    
    mstrmojo.CalendarDIC = mstrmojo.declare(
        mstrmojo.DateTextBox,
        
        [mstrmojo._IsInputControl],
        
        {                  
            scriptClass: 'mstrmojo.CalendarDIC',
            
            autoFormat: false,
            
            constraints: {trigger:mstrmojo.validation.TRIGGER.ALL},
            
            onvalueChange: function() {
                if (!this.showByDefault){
                    var cal = this.calendar.cal,
                        _DT = mstrmojo.date,
                        min = this.dic.min,
                        max = this.dic.max;
                    
                    this.invalid = mstrmojo.string.trim(this.value || '').length === 0 || this.validationStatus.code > mstrmojo.validation.STATUSCODE.VALID;
                    
                    if(cal.value !== this.value) {
                        cal.set('value', this.value);
                    } else if(min && _DT.compareDateAndOrTime(min, cal.value) > 0) {
                        this.value = min;
                    } else if(max && _DT.compareDateAndOrTime(cal.value, max) > 0) {
                        this.value = max;
                    }
                }
            },
            
            getInputNode: function(){
                return this.inputNode;
            },
            
            init: function(props){
                this._super(props);
                
                this.dtp = this.dic.ict ? _DTP.TIMESTAMP: _DTP.DATE;
            },
            
            focus: function(){
                mstrmojo.dom.setCaret(this.inputNode, ((this.value && this.value.length) || 0));
                this.openPopup('calendar');
                this.adjustCalendarPopup();
            },
            
            adjustCalendarPopup: function(){
                //adjust 'left' of the child Popup to make the editor is fully visible in browser window
                var dm = this.domNode,
                    calDom = this.calendar.domNode,
                    w = calDom.scrollWidth,
                    offset = mstrmojo.boxmodel.offset(this.openerNode, document.body),
                    left = offset.left, top,
                    shift = (document.body.offsetWidth - left - w - parseInt($C.getStyleValue(dm, 'paddingLeft'), 10) - parseInt($C.getStyleValue(dm, 'paddingRight'), 10));

                //shift only when popup got cutoff on right end  
                if (shift < 0) {
                    calDom.style.left = shift + 'px';
                }
                
                //#478960 - do we need to show the Calendar above the inputbox?
                top = parseInt(offset.top, 10); //Date InputBox top position
                if (top + this.inputNode.offsetHeight + calDom.offsetHeight <= mstrmojo.dom.windowDim().h) {
                    calDom.style.top = this.inputNode.offsetHeight + 'px';  //show Calendar below Date InputBox (defualt)
                } else {
                    calDom.style.top = - calDom.offsetHeight + 'px';  //otherwise show Calendar above Date Inputbox
                }
            }
        }
    );
}());