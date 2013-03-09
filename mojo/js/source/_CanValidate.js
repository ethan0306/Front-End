(function(){
    
    mstrmojo.requiresCls("mstrmojo.locales", "mstrmojo.expr", "mstrmojo.date","mstrmojo.num", "mstrmojo.string");
    
    mstrmojo.validation = {
            STATUSCODE: {
                    UNKNOWN: -1,
                    VALID : 0,
                    INVALID: 1,
                    INVALID_EMPTY: 2,
                    INVALID_CHAR: 3,
                    INVALID_OUTOFRANGE:4,
                    INVALID_REGEX:5,
                    INVALID_VALIDATOR:6,
                    INVALID_BAD_NUMERICFORMAT:7,
                    INVALID_BAD_DATESTRING:8            
            },        
            TRIGGER:{
                    NONE: 0,
                    ONBLUR: 1,
                    ONKEYUP: 2,
                    VALUESET: 4,
                    ALL: 7        
            },            
            REGEXP:{
                    US_ZIP: /^\d{5}([- ]?\d{4})?$/, 
                    EMAIL_ADDRESS: /^([a-zA-Z0-9\_\.\-])+@(([a-zA-Z0-9\-])+[\.])+([a-zA-Z0-9]{2,4})+$/,
                    SOCIAL_SECURITY_NUMBER: /^((?!000)(?!666)([0-6]\d{2}|7[0-2][0-9]|73[0-3]|7[5-6][0-9]|77[0-1]))(\s|\-)?((?!00)\d{2})(\s|\-)?((?!0000)\d{4})$/,
                    PHONE_NUMBER: /^[\d\-\(\)\.\+]+$/,
                    FILE_NAME:new RegExp("^[^:*?\"<>|/\\\\()]+$"),
                    FOLDER_PATH_WIN:new RegExp("^([a-zA-Z]:|\\\\\\\\[^:*?\"<>|/\\\\]+|[^:*?\"<>|/\\\\]*)(\\\\[^:*?\"<>|/\\\\]+)*(\\\\){0,1}$"),        
                    FOLDER_PATH_UNIX:new RegExp("^(/){0,1}([^:*?\"<>|/\\\\]+/)*([^:*?\"<>|/\\\\]+){0,1}$"),
                    PRINTER_PATH_SINGLE: new RegExp("^[^$%:*?\"<>|/\\\\]*$"),
                    PRINTER_PATH_MULTIPLE:new RegExp("^((/|\\\\\\\\)[^$%:*?\"<>|/\\\\]+)((/|\\\\)[^$%:*?\"<>|/\\\\]+)*(/|\\\\){0,1}$")
            },
            VALIDATOR:{
                    DEMO:function customValidator(v){
                           var parsed = parseInt(v,10),
                               SC = mstrmojo.validation.STATUSCODE;
                           if(parsed === 0 || parsed === 1 || parsed > 10) {
                               return {code:SC.VALID};
                           }
                           /*For a validator function, it needs to return a code field stating whether the validation is valid or not;
                            * and another optional variable stating the reason of being invalid. 
                            */
                           return {code:SC.INVALID, msg:'This field must be either 0, 1 or greater than 10'};
                        },
                    VALIDATE_PHONENO: function validatePhoneNo(v){
                        var dt = this.dtp, phoneNum;
                        if (_V.isInt(dt) || _V.isNumeric(dt)){
                            phoneNo = String(v).replace(/[^\d]/g, '');
                            if (phoneNo.length < 10){
                                return {code:_SC.INVALID, msg: mstrmojo.desc(9000).replace(/#/, 10)}; //'Your telephone number must contain at least 10 digits.'
                            }
                        }
                        if (!_V.REGEXP.PHONE_NUMBER.test(v)){
                            return {code:_SC.INVALID, msg: mstrmojo.desc(9001)}; //'Your telephone number contains invalid characters.'
                        }
                        return {code:_SC.VALID};
                    },
                    VALIDATE_ZIPCODE: function validateZipCode(v){
                        var msg = '', dt = this.dtp;
                        if (!_V.REGEXP.US_ZIP.test(v)){
                            if (_V.isNumeric(dt) || _V.isInt(dt))
                                msg = mstrmojo.desc(9003); //'Your zip code must be 5 digits or 5+4 digits.'
                            else if (_V.isString(dt)){
                                msg = mstrmojo.desc(9005); //'Your zip code is invalid.'
                            }
                            return {code:_SC.INVALID, msg: msg};
                        }
                        return {code:_SC.VALID};
                    },
                    VALIDATE_EMAIL: function validateEmail(v){
                        return _V.REGEXP.EMAIL_ADDRESS.test(v) ? {code:_SC.VALID} : {code:_SC.INVALID, msg:mstrmojo.desc(9002)}; //'Your email address is invalid.'
                    },
                    VALIDATE_SSN: function validateSSN(v){
                        var dt = this.dtp, ssnNo;
                        if (_V.isNumeric(dt) || _V.isInt(dt)){
                            ssnNo = String(v).replace(/[^\d]/g, '');
                            if (ssnNo.length != 9){
                                return {code:_SC.INVALID, msg: mstrmojo.desc(9006)}; //'Your Social Security Number must be 9 digits.'
                            }
                        }
                        if (!_V.REGEXP.SOCIAL_SECURITY_NUMBER.test(v)){
                            return {code:_SC.INVALID, msg: mstrmojo.desc(9008)}; //'Your Social Security Number is invalid.'
                        }
                        return {code:_SC.VALID};
                    }
            },
            isInt: function(dtp){
                return DTP2TYPE[dtp] == 1;
            },
            isNumeric: function(dtp){
                return DTP2TYPE[dtp] == 2 || DTP2TYPE[dtp] == 5;
            },
            isString: function(dtp){
                return DTP2TYPE[dtp] == 3;
            }
    };

    
    var _G = window.mstrConfig,
    listSep = _G.listSep,
    _E = mstrmojo.expr,
    DTP = _E.DTP,
    _V = mstrmojo.validation,
    _TR = _V.TRIGGER,
    _SC = _V.STATUSCODE,    
    _C = mstrmojo.css,
    _N = mstrmojo.num,
    _S = mstrmojo.string, 
    _DP = mstrmojo.date,
    DTP2TYPE = {/*1: integer 2: numeric 3:string 4:binary 5: big decimal 6:date*/
        '-1':-1,
        1:1,
        2:1,
        3:2,
        4:2,
        5:2,
        6:2,
        7:2,
        8:3,
        9:3,
        10:3,
        11:4,
        12:4,
        13:4,
        14:6,
        15:6,
        16:6,
        21:2,
        22:2,
        23:3,
        24:4,
        25:3,
        30:5
    };
   
    
    /**
     * Check whether value contains invalid characters based on its data type.
     * @param {String} v The value to validate against.
     */
    function _containsInvalidChar(me, v){
        var dtp = me.dtp,
            c = me.constraints,
            allows = c.allowedFormatChars ? c.allowedFormatChars : '',
            isInt = (DTP2TYPE[dtp] == 1),                        
            isNumeric = (DTP2TYPE[dtp] == 2),                        
            isDT = (DTP2TYPE[dtp] == 6),
            thousand = mstrmojo.locales.number.THOUSANDSEPARATOR,
            decimal = mstrmojo.locales.number.DECIMALSEPARATOR,
            regExp;
                          
        if(isInt){
            if(!me._intRegExp){
                allows += '0-9-' + (me.isList ? listSep : '') + thousand;
                me._intRegExp = new RegExp('[^' + allows + ']');
            }
            regExp = me._intRegExp;
        }
        
        if(isNumeric){
            if(!me._numericRegExp){
                allows += '0-9-' + (me.isList ? listSep : '') + decimal + thousand;
                me._numericRegExp = new RegExp('[^' + allows + ']');
            }
            regExp = me._numericRegExp;                      
        }
            
        if(isDT){//TO-DO: add support for dates:need to extract all formatting characters used for date/time formatting
            
        }
        
        return !!regExp && regExp.test(v);
    }
    
    /**
     * Check whether a value is lower than minimum or higher than maximum based on its data type. 
     * It requires parsing a string into its corresponding data type first and then compare its range.
     * @param {String} v The value to validate against.
     */
    function _valueOutOfRange(me, v){
        var dtp = me.dtp,
        c = me.constraints,
        isInt = (DTP2TYPE[dtp] == 1),                        
        isNumeric = (DTP2TYPE[dtp] == 2),                        
        isDT = (DTP2TYPE[dtp] == 6),
        min = c.min,
        max = c.max,
        parsed;
        
        //no range defined, return
        if(min == undefined && max == undefined) {
            return false;
        }
        
        //check numeric
        if(isInt || isNumeric){
            return _N.inNumericRange(v, min, max) !== 0;
        }
        
        //check date
        if(isDT){
            return _DP.inDateTimeRange(v, min, max) !== 0;
        }
            
        return false;                        
    }
    
    /**
     * Check against any bad format of numeric values.
     * For now, only make sure there is no more than 1 decimal separator
     * 
     * @param {String} v The value to validate against.
     */
    function _badNumericFormat(me, v){                 
        return !_N.isNumeric(v) ;
    }

    /**
     * Check against any component of date is not in valid range. 
     * For example, 32 for day, or 13 for month. 
     */
    function _badDTString(me, v){
        var isD = (me.dtp === DTP.DATE),
            isT = (me.dtp === DTP.TIME);
        return (isD ? !_DP.isDate(v) : (isT ? !_DP.isTime(v) :!_DP.isDateAndOrTime(v)));
    }
    
    /**
     * <p>mstrmojo._CanValidate is a mixin any widget that requires validation shall extend from.</p>
     * 
     * <p>To configure the validation,
     * users can pass in a parameter called "constraints", which contains multiple variables that are useful when deciding
     * when to validate('trigger' variable), range to check against ('min/max' variable), etc. You can also configure callback
     * functions (onValid/onInvalid) so that when validation happens, customized actions can be taken (like to disable/enable a button of an editor).</p>
     * 
     * @class
     * @public
     */
    mstrmojo._CanValidate = mstrmojo.provide(
            "mstrmojo._CanValidate",
            {
                /**
                 * min:minmum value for integer/numeric/date, minimum length for string
                 * max:maximum value for integer/numeric/date, maximum length for string
                 * allowedFormatChars: allowed characters for formatting purpose
                 * regExp: regular expression to check against
                 * validator: custom validation functions
                 * trigger: when to start validation process
                 * invalidCssClass: the css class to used if not valid
                 */
                constraints:null,
                
                /** 
                 * Whether or not this field is required. 
                 */
                required:false,
                
                /**
                 * The data type of this input. 
                 */
                dtp: DTP.INTEGER,
                
                /**
                 * Whether or not this field may contain a list of values of the same data type, separated by the list seperator
                 */
                isList: false,
                
                /**
                 * Whether to format the value into standard output format defined by specific locale.
                 */
                autoFormat: false,
                
                
                /*onValid:null,//onValid: the handler to call if validation returns valid*/
                
                /*onInvalid:null,//onInvalid: the handler to call if validation returns invalid*/
                
                /**
                 * Store the current validation status. Check its 'code' to see the validation status(valid/invalid),
                 * and optional 'msg' field for reason of being invalidated. 
                 */
                validationStatus:null,
                
                init: function init(props){
                    this._super(props);
                    if(!this.constraints) {
                        this.constraints = {};
                    }
                    var c = this.constraints;                    
                    if(!('trigger' in c)) {
                        c.trigger = _TR.NONE;    
                    }
                },
                
             
                
                /**
                 * Override to fire validation if configured. 
                 * @param {String} n The name of property.
                 * @param {String} v The value of property. 
                 */
                _set_value: function(n,v){
                    var vWas = this.value,
                        bChanged = (vWas !== v);
                    if(bChanged){
                        this.value = v;
                        var t = this.constraints.trigger,
                            cv = (t & _TR.VALUESET) > 0;
                        if(cv) {
                            this.validate(v);
                        }
                    }
                    return bChanged;
                },

                /**
                 * If invisible, we shall clear the validation result
                 */
                /*  No need for this support for now
                previsibleChange: function previsibleChange(evt){
                    this.clearValidation();
                },*/
                
                /**
                 * If disabled, we shall clear the validation result
                 */   
                /* No need for this support for now
                preenabledChange: function previsibleChange(evt){
                    this.clearValidation();                  
                }, */               
                
                /**
                 * The main entry method to call in order to start validation process.
                 * It calls doValidation to validate and based on the return value, change textbox appearance and call callback handlers. 
                 */
                validate: function validate(){
                    
                    var v = (this.value !== null && this.value !== undefined)? this.value : '',
                        vl = this.isList ? v.split(listSep) : [v],
                        r, isInvalid, method;
                    
                    for(var i=0, len = vl.length;i<len;i++){
                        r = this.doValidation(vl[i]);
                        isInvalid = (r.code > _SC.VALID);
                        if(isInvalid) {
                            if(len>1){
                                r.msg = mstrmojo.locales.validation.invalidValueInListError.replace("#", vl[i] ? vl[i] : ' ');
                            }
                            break;
                        }
                    }
                    
                    method = isInvalid ? 'onInvalid' : 'onValid';
                    
                    if(!isInvalid && this.autoFormat) {
                        this.format();
                    }
                    
                    //store the result
                    this.set('validationStatus',r);
                    
                    //call backs
                    if (this[method]) {
                        this[method](r);
                    }
                },
                
                /**
                 * Convert the value into standard output format defined by specific locale.
                 * We only do it for date/time for now. May need do it for numbers too. 
                 */
                format: function format(){
                    var dtp = this.dtp,
                        isDT = (DTP2TYPE[dtp] == 6);
                    if(!isDT) return;
                    
                    var listSep = mstrConfig.listSep,
                        v = this.value || '',
                        vl = this.isList ? v.split(listSep) : [v],                                   
                        isD = dtp === 14,
                        va=[], 
                        dt,
                        _DT = mstrmojo.locales.datetime;
                        
                    for(var i =0,len=vl.length;i<len;i++){
                        v = vl[i];
                        dt = _DP.parseDateAndOrTime(v);
                        if(dt){
                            if(isD && dt.date){
                                va.push(_DP.formatDateInfo(dt.date, _DT.DATEOUTPUTFORMAT));
                            } else {
                                va.push((dt.date ? _DP.formatDateInfo(dt.date, _DT.DATEOUTPUTFORMAT):'') + ' ' +
                                        (dt.time ? _DP.formatTimeInfo(dt.time, _DT.TIMEOUTPUTFORMAT) : ''));
                            }
                        }
                    }
                    this.set('value', va.join(listSep));
                },
                
                /**
                 * Whether current validation status is valid. 
                 */
                isValid: function isValid(){
                    var s = this.validationStatus;
                    if(!s) this.validate();
                    return this.validationStatus.code === _SC.VALID;
                },
                
                /**
                 * Provide this method to clear validation status/appearance. 
                 */
                clearValidation: function clearValidation(){
                    this.set('validationStatus', {code:_SC.VALID});
                    if(this.onClearValidation) {
                        this.onClearValidation();  
                    }                    
                },
                
                /**
                 * Method to validate against checking rules. 
                 * Return an object indicating validation result with 3 fields. The first field 'id' is the id of this source widget; 
                 * The second field 'code' indicate the result of validation, either valid or invalid. 
                 * If invalid, it can also be other value (as defined in mstrmojo.validation.STATUSCODE), depending on the reason of invalid. 
                 * The third field 'msg' is optional, when invalid, it is the msg indicating invalid reason. 
                 * @param {String} v The value to validate against.
                 */
                doValidation: function doValidation(v){
                    var c = this.constraints,
                        regExp = c.regExp,
                        validator = c.validator, 
                        r = {id: this.id,code:_SC.VALID,msg:''},
                        dtp = this.dtp,
                        isInt = (DTP2TYPE[dtp] == 1),
                        isNumeric = (DTP2TYPE[dtp] == 2 || DTP2TYPE[dtp] == 5),
                        isString = (DTP2TYPE[dtp] == 3),
                        isDT = (DTP2TYPE[dtp] == 6),
                        isEmpty = _S.isEmpty(v),
                        vLen = String(v).length;
                        err = '',
                        _VAL = mstrmojo.locales.validation;
                    
                    //check against empty values
                    if(this.required && isEmpty) {
                        r.code = _SC.INVALID_EMPTY;
                        r.msg = _VAL.requiredFieldError;
                        return r;
                    }
                    
                    v = _S.trim(v);
                    
                    //check against invalid characters
                    if(!isEmpty && _containsInvalidChar(this,v)){
                        if(isInt) {
                            err = _VAL.integerDataType;
                        }
                        if(isNumeric) {
                            err = _VAL.numericDataType;
                        }
                        if(isDT) {
                            err = _VAL.dateDataType;
                        }
                        r.code = _SC.INVALID_CHAR;
                        r.msg = _VAL.invalidCharError.replace('#',err);
                        return r;
                    }
                    
                    //check against date bad formatting
                    if(!isEmpty && isDT && _badDTString(this,v)){
                        r.code = _SC.INVALID_BAD_DATESTRING;
                        r.msg = _VAL.invalidDateStringError;
                        return r;
                    }
                    
                    //check against numeric bad formatting
                    if(!isEmpty && (isNumeric || isInt) && _badNumericFormat(this,v)){
                        r.code = _SC.INVALID_BAD_NUMERICFORMAT;
                        r.msg = _VAL.invalidNumericFormatError; 
                        return r;
                    }
                    
                    //check range for integer/numeric and dates
                    if(!isEmpty && (isInt || isNumeric || isDT) && _valueOutOfRange(this,v)){
                        r.code = _SC.INVALID_OUTOFRANGE;
                        if(c.min != null && c.max != null){
                            err = _VAL.outofRangeError.replace('#', '').replace('##', c.min).replace('###', c.max);
                        } else if(c.min != null){
                            err = _VAL.noLessMinError.replace('##', c.min).replace('#', '');  
                        } else if(c.max != null){
                            err = _VAL.noGreaterMaxError.replace('###', c.max).replace('#', ''); 
                        }
                        r.msg = err;
                        return r;
                    }
                    
                    //check the length of string value
                    if (isString && c.minLen != null && c.maxLen != null){
                        if (vLen < c.minLen || vLen > c.maxLen){
                            r.code = _SC.INVALID;
                            r.msg = mstrmojo.desc(9014).replace(/#/, c.minLen).replace(/##/, c.maxLen);
                            return r;
                        }
                    }
                    
                    //test regular expression
                    if(regExp && !regExp.test(v)){
                        r.code = _SC.INVALID_REGEX;
                        r.msg = mstrmojo.desc(9009); //'Your input is invalid.'
                        return r;
                    }
                    
                    //custom validator
                    var _t = validator && validator.apply(this,[v]);
                    
                    if(_t){
                        r.code = _t.code;
                        r.msg = _t.msg;
                        return r;
                    }
                    
                    //no more checkings, return valid result
                    
                    return r;
                    
                }
                

            });
    
})();