(function () {
    mstrmojo.requiresCls("mstrmojo.prompt.WebPrompt", 
                         "mstrmojo.locales",
                         "mstrmojo.num", 
                         "mstrmojo.date",
                         "mstrmojo.mstr.EnumDataType");
                         
	mstrmojo.requiresDescs(8398,8399,8400,8401,8402,8403,8404,8405,8406);
    
    var promptStyles = mstrmojo.prompt.WebPrompt.STYLES,
        _DT = function(){return mstrmojo.locales.datetime;},
        $DT = mstrmojo.mstr.EnumDataType,
        $NUM = mstrmojo.num,
        $DATE = mstrmojo.date,
        $M = Math;
    
    /**
     * <p>Returns whether the value 'v' is in the range of the min and the max defined in this prompt.</p>
     * 
     * @param {String} v The value to be validated.
     * @return -1 for smaller than the lower limit, 1 for bigger than the upper limit, 0 for in the range.
     * @private
     */
    function inRange(v) {
        var min = parseFloat(this.min, 10),
            max = parseFloat(this.max, 10),
            hasMin = !isNaN(min),
            hasMax = !isNaN(max);
        if (hasMin && v < min) {
            return -1;
        } else if (hasMax && v > max) {
            return 1;
        } else {
            return 0;
        }
    }
    
    /** validation functions for different data types **/
    var validateFns = {};
    
    validateFns[$DT.DataTypeBool] = function (ans) {
        if ("0" !== ans || "1" !== ans) {
            throw new Error(mstrmojo.desc(8398, 'Invalid answer: #. Boolean values required.').replace('#', ans));
        }
    };
    
    validateFns[$DT.DataTypeBigDecimal] = 
        validateFns[$DT.DataTypeLong] =
        validateFns[$DT.DataTypeDouble] = 
        validateFns[$DT.DataTypeDecimal] =
        validateFns[$DT.DataTypeReal] =
        validateFns[$DT.DataTypeInteger] = 
        validateFns[$DT.DataTypeFloat] =
        validateFns[$DT.DataTypeNumeric] = function (ans) {
            // @TODO locale based number parsing....
    	    //TQMS 483605. We shall check the string before parsing it to make suer that entire string represents a number. 
            if (!isNaN(ans)) {
                var num = parseFloat(ans, 10);
                switch (inRange.call(this, num)) {
                case -1: // too small
                    throw new Error(mstrmojo.desc(8399, 'Invalid answer: #. Answer is smaller than the minimum limit: ##.').replace('##', this.min).replace('#', $NUM.toLocaleString(ans)));
                //case: 0:  // in range
                case 1:  // too big
                    throw new Error(mstrmojo.desc(8400, 'Invalid answer: #. Answer is bigger than the maximum limit: ##.').replace('##', this.max).replace('#', $NUM.toLocaleString(ans)));
                }
            } else if (ans) { // if this is an empty answer, it will still be a valid answer if this prompt is optional
                throw new Error(mstrmojo.desc(8401, 'Not a number'));
            }
        };

    validateFns[$DT.DataTypeChar] = function (ans) {
        //TQMS 497775. Empty answer is OK regardless of min and max. (We check for the required flag separately)
        if ( ans ) {
            switch (inRange.call(this, (ans && ans.length) || 0)) {
            case -1: // too small
                throw new Error(mstrmojo.desc(8402, 'Invalid answer: #. The length of the answer is smaller than the minimum limit: ##.').replace('##', this.min).replace('#', ans));
            //case: 0:  // in range
            case 1:  // too big
                throw new Error(mstrmojo.desc(8403, 'Invalid answer: #. The length of the answer is bigger than the maximum limit: ##.').replace('##', this.max).replace('#', ans));
            }
        }
    };
    
    validateFns[$DT.DataTypeDate] = function (ans) {
        switch (mstrmojo.date.inDateTimeRange(ans, this.min, this.max)) {
        case -1: // too early
            throw new Error(mstrmojo.desc(8404, 'Invalid answer: #. The date/time is earlier than the earliest limit: ##.').replace('##', this.min).replace('#', ans));
        //case: 0:  // in range
        case 1:  // too late
            throw new Error(mstrmojo.desc(8405, 'Invalid answer: #. The date/time is later than the latest limit: ##.').replace('##', this.max).replace('#', ans));
        }
    };
    
    
    function getNumberOfDecimals(myNumber){

        myNumber = String(myNumber);
        var pointIndex = myNumber.indexOf('.');

        return (pointIndex == -1) ? 0 : myNumber.length - pointIndex - 1;
    }    
    
    /**
     * Calculates and validates a proposed step.
     * 
     * @param {Boolean} isUp Whether to step up or down.

     * @returns An object with a "v" property holding the final value and an "s" property indicating whether the value is valid or not.
     * @private
     */
    function canStep(isUp) {
        // Calculate interval.
        var interval = this.prs.Interval || 1;
        
        if (!isUp) {
            interval = -interval;
        }
        
        var displayValue = parseFloat(this.getDisplayValue(true, true),10),
            intervalValue = parseFloat(interval, 10),
            multFactor = $M.pow(10, $M.max(getNumberOfDecimals(displayValue), getNumberOfDecimals(intervalValue)));
        
        // Apply interval to get new value. Numbers can be float so account for that. Also JS has trouble subtracting floating point numbers so we will
        // multiply by 100 and then divide by hundred to ensure accuracy for display.
        var v = parseInt(($M.round(displayValue*multFactor) + $M.round(intervalValue*multFactor)), 10) / multFactor,
            status = {
                v: v,
                s: true         // Assume new value is valid.
            };
        
        // Validate new value.
        try {
            this.validate(v);
        } catch (ex) {
            // Set validation status to failed.
            // TODO: Check error code to make sure it failed during validation.
            status.s = false;
        }
        
        return status;
    }
    
    /**
     * Steps a numeric stepper.
     * 
     * @param {Boolean} isUp Whether to step up or down.
     * @private
     */
    function step(isUp) {
        // Try to step.
        var status = canStep.call(this, isUp);
        
        // Did step succeed?
        if (status.s) {
            // Save the answer.
            this.answer = String(status.v);
        }
    }
    
    /**
     * Model for a constant prompt.
     * 
     * @class
     * @extends mstrmojo.prompt.WebPrompt
     */
    mstrmojo.prompt.WebConstantPrompt = mstrmojo.declare(
        mstrmojo.prompt.WebPrompt,
        
        null,
        
        /**
         * @lends mstrmojo.prompt.WebConstantPrompt.prototype
         */
        {
            scriptClass: 'mstrmojo.prompt.WebConstantPrompt',
            
            /**
             * Current Prompt answer.
             */
            answer: '',
            
            /**
             * Previous prompt answer.
             */
            preAnswer: '',
            
            /**
             * Default prompt answer
             */
            defAnswer: '',
            
            /**
             * Returns the prompts data type. The possible values are
             * the following supbset from the {@link EnumDSSXMLDataType}:
             * 
             * <code>DssXmlDataTypeChar, DssXmlDataTypeBool, DssXmlDataTypeLong,
             * DssXmlDataTypeDouble, DssXmlDataTypeDate</code>.
             */
            dataType: 8, // DssXmlDataTypeChar
            
            /**
             * <p>Returns whether the value 'v' has a numeric dataType.</p>
             * 
             * @param {String} v The value to be validated.
             * @return true if the dataType of v is numeric, false if not.
             */
            isNumericDataType: function isNumericDataType() {
            	switch(this.dataType) {
            	case $DT.DataTypeInteger:
            		return true;
            	case $DT.DataTypeUnsigned:
            		return true;
            	case $DT.DataTypeNumeric:
            		return true;
            	case $DT.DataTypeDecimal:
            		return true;
            	case $DT.DataTypeReal:
            		return true;
            	case $DT.DataTypeDouble:
            		return true;
            	case $DT.DataTypeFloat:
            		return true;
            	case $DT.DataTypeShort:
            		return true;
            	case $DT.DataTypeLong:
            		return true;
            	default:
            		return false;
            	}
            },
            
            getStyle: function getStyle() {
                
                // Do we NOT have a style already?
                var style = this._style;
                if (!this._style) {
                    // What is the display style?
                    var promptProperties = this.prs;
                    switch (promptProperties.DisplayStyle) {
                    case 'Stepper':
                        style = promptStyles.STEPPER;
                        break;
                        
                    case 'Switch':
                        style = promptStyles.SWITCH;
                        break;
                        
                    case 'Slider':
                        style = promptStyles.SLIDER;
                        break;
                        
                    case 'Text box':
                        // Is this a date?
                        if (this.dataType === 14) {
                            // Either time picker or date picker.
                            style = promptStyles[(promptProperties.ShowTime === "-1") ? 'TIME' : 'CALENDAR'];
                            break;
                        }
                        
                        // Default to text.
                        style = promptStyles.TEXT;
                        break;
                        
                    case 'Barcode':
                        style = promptStyles.BARCODE;
                        break;
                    }

                    // Did we not find a style?
                    if (!style) {
                        throw new Error(mstrmojo.desc(8406, 'WebConstantPrompt::getStyle - Unknown prompt style.'));
                    }
                    
                    // Cache for later use.
                    this._style = style;
                }
                
                return style;
                
            },
            /**
             * Get a display value for the answer. When there is no answer available, this piece of code may generate some meaningful string according to specification.
             * 
             * @param {Boolean} calculateDefault If this parameter is true calculated default values will be returned in place of empty answers.
             * @param {Boolean} replaceAnswerWithDefault If this parameter is true empty answer will be replaced with calculated default answers.
             * 
             * @returns {String} The display value for this prompt.
             */
            getDisplayValue: function getDisplayValue(calculateDefault, replaceAnswerWithDefault) {
                // Use explicit answer or default answer.
                var displayValue = this.answer || this.defAnswer,
                    isEmpty = (displayValue === undefined || displayValue === null),
                    style = this.getStyle();
                
                switch (style) {
                case promptStyles.STEPPER:
                    // Should we calculate a default value for empty answers?
                    if (calculateDefault && (isEmpty || (this.dataType === 6 && isNaN(parseFloat(displayValue, 10))))) {
                        // Parse min and max.
                        var min = parseFloat(this.min, 10),
                            max = parseFloat(this.max, 10);
                            
                        if (isNaN(min) || isNaN(max)) {
                            displayValue = 0;
                        } else {
                            // Is zero between the min and max?
                            if (0 > min && max > 0) {
                                // Use zero as the answer.
                                displayValue = 0;
                                
                            } else {
                                // Use either min or max, whichever is closer to zero.
                                displayValue = (Math.abs(min - 0) > Math.abs(max - 0)) ? max : min;
                                
                            }
                        }
                        
                        // Should we replace the answer with the newly calculated default?
                        if (replaceAnswerWithDefault) {
                            // Set answer value. 
                            this.setAnswerValue(String(displayValue));
                        }
                    }

                    break;
                    
                case promptStyles.SWITCH:
                    var prs = this.prs,
                        onValue = prs.OnValue,
                        offValue = prs.OffValue;
                    
                    // Should we calculate a default value for empty answers?
                    if (calculateDefault && (displayValue !== onValue && displayValue !== offValue)) {
                        // Use OFF as the default answer.
                        displayValue = offValue;

                        // Should we replace the answer with the newly calculated default?
                        if (replaceAnswerWithDefault) {
                            // Set answer value. 
                            //TQMS 503231. We shall not validate prompt here.
                            this.answer = offValue;
                        }
                    }
                    
                    // Change display value to a boolean indicating whether the display answer matches the ON answer.
                    displayValue = (displayValue === onValue);
                    break;
                    
                case promptStyles.SLIDER:
                    // Should we calculate a default value for empty answers?
                    if (calculateDefault && (isEmpty || displayValue === '')) {
                        // Use min value as the default answer.
                        displayValue = this.min;
                        
                        // Should we replace the answer with the newly calculated default?
                        if (replaceAnswerWithDefault) {
                            // Set answer value. 
                            this.setAnswerValue(String(displayValue));
                        }
                    }
                    break;
                }
                
                return (style == promptStyles.SWITCH) ? displayValue : 
                                                        this.isNumericDataType()? mstrmojo.num.toLocaleString(String(displayValue)) : displayValue;            
            },                
            
            /**
             * For specified data type {@link #getDataType}, validates whether prompt answer
             * is in correct format and within minimun and maximum limits.
             * An exception is thrown if one of the conditions fails - check the error code
             * to see which test failed.
             *
             */
            validate: function validate(v) {
                v = (v === undefined || v === null) ? this.answer : v;
                this._super(v);
                this._validateFn(v);
            },
            
            /**
             * Returns true if the current prompt answer is null or the
             * answer collection is empty (For example, in Elements collection is empty 
             * in case of an element prompt).
             * @return true or false.
             */
            isAnswerEmpty: function isAnswerEmpty(v) {                
                v = (v === undefined || v === null) ? this.answer : v; 
                return (v === undefined || v === null || v === '');
            },

            /**
             * Populate current prompt base on serialized prompt information.
             */
            populate: function populate(props) {
                this.answer = props && props.ans && props.ans.text;
                this.dataType = props && props.datatp;
                // set up validation function based on datatype
                this._validateFn = validateFns[this.dataType];
                // call super, which will populate the properties
                this._super(props);

                var prs = this.prs;
                
                
                // for now 'wheel' style is the same as 'stepper'
                if (prs.DisplayStyle === 'Wheel') {
                    prs.DisplayStyle = 'Stepper';
                }
                // check switch and stepper styles
                switch (prs.DisplayStyle) {
                case 'Switch':
                	// default on/off values
                	if (prs.OnValue === undefined || prs.OnValue === null) {
                		prs.OnValue = '1';
                	}
                	if (prs.OffValue === undefined || prs.OffValue === null) {
                		prs.OffValue = '0';
                	}
                	break;
                case 'Slider':
                case 'Stepper':
                    this.interval = parseFloat(this.prs.Interval) || 1;
                    this.min = $NUM.parseNumeric(this.min);
                    this.max = $NUM.parseNumeric(this.max);  // Spec: The max is required for the stepper style to work. How about Wheel? Slider?
                    
                    if (!this.min) {
                        this.min = 0; // Spec: If min is not specified 0 is the smallest value 
                    }
                    // TQMS 487076 If the default answer out of range, put the min/max as answer. copy the logic from iOs.
                    if (this.answer === undefined || this.answer === null || this.answer < this.min) { // TMQS 497694, if no answer, set answer to minimum
                    	this.answer = this.min;
                    }
                    if (this.answer > this.max) {
                    	this.answer = this.max;
                    }
                    break;
                case 'Text box':
                    // Is this a datetime?
                    if (this.dataType === 14 && prs.ShowTime === "-1") {
                        this.interval = parseFloat(this.prs.Interval) || 1; // interval for minutes
                        
                        var answer = $DATE.parseDateAndOrTime((this.answer || ''));
                        var min = $DATE.parseDateAndOrTime((this.min || ''));
                        var max = $DATE.parseDateAndOrTime((this.max || ''));
                        
                        defaultTimeInfo = {
                                match: "12:00:00 AM",
                                hour: 0,
                                min: 0,
                                sec: 0
                            };
                        
                        var defaultTime = $DATE.formatTimeInfo(defaultTimeInfo, _DT().TIMEOUTPUTFORMAT);
                        if(answer && !answer.time) {
                            this.answer = this.answer + ' ' + defaultTime;
                        }
                        
                        if(min && !min.time) {
                            this.min = this.min + ' ' + defaultTime;
                        }
                         
                        if(max && !max.time) {
                            this.max = this.max + ' ' + defaultTime;
                        }
                    }
                    break;
                }

            },
            
            populateAnswer: function populateAnswer(answer) {
            	// TQMS 515666 We should not set answer when the answer passed in is undefined.
            	if (answer && answer.text) {
            		this.answer = answer.text;
            	}                
            },
            
            buildAnswerObject: function buildAnswerObject() {
                var ob = this._super();
                ob.ans = {
                    text: this.answer
                };
                
                return ob;
            },
            
            setAnswerValue: function setAnswerValue(v) {
            	if(this.isNumericDataType()) {
            		v = mstrmojo.num.toString(v, false);
            	}
            	
                this.validate(v);
                this.answer = v;
            },
            
            /**
             * Returns the XML representation of prompt answer in the format used by the
             * Narrowcast server. This XML can be persisted in the Narrowcast server repository
             * and used later to populate answer of prompt object received from I-Server.
             *
             * @return the XML representation of prompt answer in the format used by the
             *         Narrowcast server.
             */
            getAnswerXML: function getAnswerXML() {
                return this.answer;
            },
            
            /**
             * Builds the short answer xml for this prompt's current answer.
             */
            buildShortAnswerXML: function buildShortAnswerXML(builder) {
            builder.addText(this.isNumericDataType()?mstrmojo.num.toLocaleString(this.answer || ""): (this.answer || "")); // TQMS 523828 -- when this.answer is undefinied, we need to send empty string as answer
            },
            
            /**
             * Used by Stepper style prompts to step up one value.
             * 
             */
            stepUp: function stepUp() {
                if (this.getStyle() === promptStyles.STEPPER) {
                    step.call(this, true);
                }
            },
            
            /**
             * Used by Stepper style prompts to check if a step up is valid.
             * 
             * @type Boolean
             */
            canStepUp: function canStepUp() {
                return (this.getStyle() === promptStyles.STEPPER && canStep.call(this, true).s);
            },
            
            /**
             * Used by Stepper style prompts to step down one value.
             * 
             */
            stepDown: function stepDown() {
                if (this.getStyle() === promptStyles.STEPPER) {
                    step.call(this, false);
                }
            },

            /**
             * Used by Stepper style prompts to check if a step down is valid.
             * 
             * @type Boolean
             */
            canStepDown: function canStepDown() {
                return (this.getStyle() === promptStyles.STEPPER && canStep.call(this, false).s);
            },
            
            /**
             * Used by Switch style prompts to switch prompt value.
             * 
             */
            toggleSwitch: function toggleSwitch() {
                if (this.getStyle() === promptStyles.SWITCH) {
                    // Calculate binary value.
                    var promptProperties = this.prs,
                        answer = (this.getDisplayValue(true, false)) ? promptProperties.OffValue : promptProperties.OnValue;
        
                    // Set new answer.
                    this.set('answer', answer);
                }
            }
        }
    );
}());