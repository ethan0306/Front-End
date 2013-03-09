(function() {
    mstrmojo.requiresCls("mstrmojo.ValidationTextBox", "mstrmojo._IsInputControl", "mstrmojo.dom", "mstrmojo.num");
    
    var _VAL = mstrmojo.validation,
        SC = _VAL.STATUSCODE,
        _VALIDATOR = _VAL.VALIDATOR,
        _DTP = mstrmojo.expr.DTP,
        NO_VALIDATION = 0,
        PHONE_NO = 1,
        EMAIL_ADDRESS = 2,
        ZIP_CODE = 3,
        SOCIAL_SECURITY_NO = 4,
        REG_EXP = 5;
    
    /**
     * Popup only
     */
    mstrmojo.TextFieldDIC = mstrmojo.declare(
            
        mstrmojo.ValidationTextBox,
        
        [mstrmojo._IsInputControl],
        
        {
            scriptClass: 'mstrmojo.TextFieldDIC',
            
            dtp: _DTP.VARCHAR,
            
            getInputNode: function(){
                return this.inputNode;
            },
            
            constraints: {
                trigger: mstrmojo.validation.TRIGGER.ONKEYUP
            },
            
            focus: function() {
                this.validate();
                mstrmojo.dom.setCaret(this.domNode, (this.value && this.value.length || 0));
            },
            
            init: function(props) {
                if (this._super){
                    this._super(props);
                }
                
                var di = props.dic, c = this.constraints, dt = di.dt;
                
                if(di.ml) {
                    this.maxLength = di.ml;
                }
                
                //Mask text (password)
                if(di.psw) {
                    this.type = 'password';
                    //reset the value to show nothing in the text field DIC
                    this.value = this.lv = '';
                    this.owner.applyPasswordMask && this.owner.applyPasswordMask();
                }
                
                // We only validate for the integer, numeric or string data type.
                if (_VAL.isNumeric(dt) || _VAL.isInt(dt) || _VAL.isString(dt)){
                    this.dtp = dt;
                }
                
                switch (di.vm){//Validation method
                case PHONE_NO: 
                        c.validator = _VALIDATOR.VALIDATE_PHONENO;
                        break;
                case EMAIL_ADDRESS: 
                        c.validator = _VALIDATOR.VALIDATE_EMAIL;
                        break;
                case ZIP_CODE:
                        c.validator = _VALIDATOR.VALIDATE_ZIPCODE;
                        break;
                case SOCIAL_SECURITY_NO: 
                        c.validator = _VALIDATOR.VALIDATE_SSN;
                        break;
                case REG_EXP: 
                        c.regExp = new RegExp('^'+di.rgx+'$');
                        break;
                }
                
                c.min = di.emin ? di.min : null;
                c.max = di.emax ? di.max : null;
                
                c.maxLen = (di.ml !== undefined) ? di.ml : null;
                c.minLen = (di.mnl !== undefined) ? di.mnl : null;
            },
            
            /**
             * @override mstrmojo._IsInputControl.applyChanges
             */
            applyChanges: function(){
                this.validate();
                
                if(this.isValid()){
                    this._super();
                }else{
                    this.handleInvalid();
                    return false;
                }
            },
            
            handleInvalid: function(){
                //revert to the old value
                this.set('value', this.lv);
            }
        });
})();