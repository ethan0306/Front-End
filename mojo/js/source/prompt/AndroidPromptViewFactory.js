/**
 * Singleton factory for creating prompt view in Android, based on prompt type and other prompt information.
 */

(function() {
    mstrmojo.requiresCls(
            "mstrmojo.hash",
            "mstrmojo.array",
            "mstrmojo.dom",
            "mstrmojo.GeoLocation",
            "mstrmojo.prompt.WebPrompts",
            "mstrmojo.HBox", 
            "mstrmojo.Label", 
            "mstrmojo.LabelWithEllipsis", 
            "mstrmojo.TextBox",
            "mstrmojo.CheckBox", 
            "mstrmojo.Box",
            "mstrmojo.VBox",
            "mstrmojo.MobileCalendar",
            "mstrmojo.ui.MobileDateTimePicker",
            "mstrmojo.ui.MobileStepper",
            "mstrmojo.android.AndroidElementsPicker",
            "mstrmojo.android.AndroidElementsSearchView");
            
	mstrmojo.requiresDescs(221,1442);            
    
    //Private Variables
    var $CP = mstrmojo.hash.copy,
        $H = mstrmojo.hash,
        $A = mstrmojo.array,
        $BTN = mstrmojo.Button.newAndroidButton,
        $PROMPT_TYPES = mstrmojo.prompt.PromptTypes,
        NumDT = {
            1: true, // public static final int DssXmlDataTypeInteger = 1;
            2: true, // public static final int DssXmlDataTypeUnsigned = 2;
            3: true, // public static final int DssXmlDataTypeNumeric = 3;
            4: true, // public static final int DssXmlDataTypeDecimal = 4;
            5: true, // public static final int DssXmlDataTypeReal = 5;
            6: true, // public static final int DssXmlDataTypeDouble = 6;
            7: true, //public static final int DssXmlDataTypeFloat = 7;
            30: true //public static final int DssXmlDataTypeBigDecimal = 30;
        };
    
//    function isGeo(p) {
//        return (p && p.prs && p.prs.DisplayStyle === 'GeoLocation') || false;
//    }

    //========================== Constant Prompt Calendar style =================================================
    //---------------------------- Summary view ----------------------------------------
    /**
     * Json for Cal location style
     */
    var cstCal = {
        scriptClass: 'mstrmojo.Box',
        cssClass: 'promptItem drop-down',
        prompt : null,
        onpromptChange : function() {
            this.titleField.text = this.prompt.title;
            this.descField.text = this.prompt.mn;
        },
        children: [
                   {
                       scriptClass : 'mstrmojo.LabelWithEllipsis',
                       alias : 'titleField',
                       cssClass: 'ttl'
                   },
                   {
                       scriptClass: 'mstrmojo.LabelWithEllipsis',
                       alias: 'descField',
                       cssClass: 'desc'
                   }
                   ]
    };
    //---------------------------- Editing view ----------------------------------------
    var newCstCalDialog = function(p) {
        var min = parseInt(p.min, 10),
            max = parseInt(p.max, 10);
        var cl = new mstrmojo.MobileCalendar({
            value: p.answer || "",
            min: isNaN(min) ? null : min,
            max: isNaN(max) ? null : max
         });

        var callbacks = {
                /**
                 * Callback for the OK button
                 */
                ok: function(){
                    // update answer
                    p.set('answer', cl.value);
                },
                
                /**
                 * Callback for the Cancel button.
                 */
                cancel: function(){
                    // do nothing, since we have not updated the 'answer'.
                }
            };
        return {
            title: 'Select Day',
            width: '99%',
            cssClass: 'mobile-calendar',
            buttons: [
                      $BTN(mstrmojo.desc(1442, 'OK'), function(){
                          // update answer
                          callbacks.ok();
                      }),
                      $BTN(mstrmojo.desc(221, 'Cancel'), function(){
                          callbacks.cancel();
                      })
                      ],
             children: [cl]
         };
        
    };
    //========================== Constant Prompt date time picker style =================================================
    //---------------------------- Summary view ----------------------------------------
    /**
     * Json for Date Time style
     * 
     * Just modify Date style's css class name
     */
    var cstCalTm = $CP({
                        cssClass: 'promptItem drop-down'
                        }, $CP(cstCal));
    //---------------------------- Editing view ----------------------------------------
    
    var newCstCalTimeDialog = function(p) {
        var cl = new mstrmojo.ui.MobileDateTimePicker({
            value: mstrmojo.date.parseDateAndOrTime(p.answer || ''), //(If set to null, defaults to current date)
            min: mstrmojo.date.parseDateAndOrTime(p.min || ''), //(Optional, If set to null, the stepper is infinite)
            max: mstrmojo.date.parseDateAndOrTime(p.max || '') //(Optional, If set to null, the stepper is infinite)
            //format: “XX/XX/XX”, //(Optional, The format in which the stepper should display the date, defaults to “MMM/DD/YYY”)
            //is24HourMode: Boolean //(Defaults to false. Optional)
        });

        var callbacks = {
                /**
                 * Callback for the OK button
                 */
                ok: function(){
                    var value = cl.getDateTime(),
                        dateInfo = value && value.date,
                        timeInfo = value && value.time,
                        formattedDate = dateInfo ? mstrmojo.date.formatDateInfo(dateInfo, mstrmojo.locales.datetime.DATEOUTPUTFORMAT) : '',
                        formattedTime = timeInfo ? mstrmojo.date.formatTimeInfo(timeInfo, mstrmojo.locales.datetime.TIMEOUTPUTFORMAT) : '';
                    // update answer
                    p.set('answer', formattedDate + ' ' + formattedTime);
                },
                
                /**
                 * Callback for the Cancel button.
                 */
                cancel: function(){
                    // do nothing, since we have not updated the 'answer'.
                }
            };
        return {
            title: 'Pick a date and time',
            width: '99%',
            cssClass: 'mobile-datetimepicker',
            buttons: [
                      $BTN(mstrmojo.desc(1442, 'OK'), function(){
                          // update answer
                          callbacks.ok();
                      }),
                      $BTN(mstrmojo.desc(221, 'Cancel'), function(){
                          callbacks.cancel();
                      })
                      ],
             children: [cl]
         };
        
    };
    //========================== Constant Prompt input box style ==================================
    /**
     * json for constant prompt text view
     * 
     */
    var cstTxt = {
        scriptClass : 'mstrmojo.VBox',
        cssClass : 'promptItem const-txt',
        prompt : null,
        onpromptChange : function() {
            var hbox = this.hbox,
                prompt = this.prompt;
            
            hbox.titleField.text = prompt.title + ':';
            if (NumDT[prompt.dataType]) {
                hbox.answerField.type = 'number';
            }
            hbox.answerField.value = prompt.answer;
            
            this.descField.text = prompt.mn;
        },
        children: [
                   {
                       scriptClass: 'mstrmojo.HBox',
                       alias: 'hbox',
                       children : [ {
                           scriptClass : 'mstrmojo.LabelWithEllipsis',
                           alias : 'titleField',
                           cssClass: 'ttl'
                               
                       }, {
                           scriptClass : 'mstrmojo.TextBox',
                           alias : 'answerField',
                           _searchTimer: null,
                           onkeyup : function(evt) {
                               // @TODO validation.....
                               this.parent.parent.prompt.answer = this.value;
                               
                           },
                           onEnter: function(evt) {
                               this.parent.parent.prompt.validate();
                           },
                           cssClass: 'ans'
                       }
                       ]
                   },
                   {
                       scriptClass: 'mstrmojo.LabelWithEllipsis',
                       alias: 'descField',
                       cssClass: 'desc'
                   }
                   ]
    };
    //========================== Constant Prompt Switch style ==================================
    /**
     * Json for constant prompt switch view
     */
    var cstSwitch = {
        scriptClass : 'mstrmojo.Box',
        cssClass : 'promptItem const-swtch',
        prompt : null,
        onpromptChange : function() {
            var p = this.prompt;
            this.titleField.text = p.title;
            this.mnField.text = p.mn;
            if (this.domNode) {
                mstrmojo.css.toggleClass(this.domNode, ['checked'], p.answer === p.onValue);
            } else if (p.answer === p.onValue){
                this.cssClass += ' checked';
            }
        },
        children : [ {
            scriptClass : 'mstrmojo.LabelWithEllipsis',
            cssClass: 'ttl',
            alias : 'titleField'
        }, {
            scriptClass : 'mstrmojo.LabelWithEllipsis',
            cssClass : 'desc',
            alias : 'mnField'
        } ]
    };
    
    var cstStepper = {
        scriptClass : 'mstrmojo.VBox',
        cssClass : 'promptItem const-txt',
        prompt : null,
        onpromptChange : function() {
            var p = this.prompt;
        
            //Set the title field from the prompt object
            this.hbox.titleField.text = p.title;
            
            //Set the description
            this.descField.text = p.mn;
            
            //Create a content provider for the stepper
            this.hbox.answerField.provider = new mstrmojo.NumStepperContentProvider({
                item: {
                    value: parseInt(p.answer, 10) || 0,
                    min: parseInt(p.min, 10) || null, 
                    max: parseInt(p.max, 10) || null, 
                    interval: p.interval
                },
                valField: "value"
            });
            
        },
        children: [{
                       scriptClass: 'mstrmojo.HBox',
                       alias: 'hbox',
                       children : [{
                           scriptClass : 'mstrmojo.LabelWithEllipsis',
                           alias : 'titleField',
                           cssClass: 'ttl'
                               
                       }, {
                           scriptClass : 'mstrmojo.ui.MobileStepper',
                           cssClass : 'ans',
                           alias: 'answerField',
                           orientation: 'horizontal',
                           prompt : null,
                           provider: null
                       }]
                   },
                   {
                       scriptClass: 'mstrmojo.LabelWithEllipsis',
                       alias: 'descField',
                       cssClass: 'desc'
                   }]
    };
    
    function onclickSwitch() {
        var p = this.prompt;
        
        //Set the answer
        p.answer = (p.answer === p.onValue) ? p.offValue : p.onValue;
        
        mstrmojo.css.toggleClass(this.domNode, ['checked'], p.answer === p.onValue);
    }
    
    //========================== Geo Prompt =================================================
    /**
     * Json for Geo location style
     */
    var cstGeo = {
        scriptClass: 'mstrmojo.Box',
        cssClass: 'promptItem drop-down geo',
        prompt: null,
        children: [
                      {
                       scriptClass: 'mstrmojo.Label',
                       text: 'Location',
                       cssClass: 'ttl'
                   },
                   {
                       scriptClass: 'mstrmojo.Label',
                       text: '&lt;Update Current Location&gt;',
                       alias: 'locMsg',
                       cssClass: 'desc'
                   }
                   ]
    };
    
    function onclickGeo() {
        var me = this;
        if (window.confirm('"MicroStrategy" Would Like to Use Your Current Location.')) {
            mstrmojo.GeoLocation.getCurrentLocation(
                {
                    success: function (la, lo, al) {
                        // update prompt
                        me.prompt.setLocation(la, lo);
                        // update message
                        me.locMsg.set('text', 'Current Location');
                    }, 
                    failure: function(err){
                        me.locMsg.set('text', 'Error while updating location: ' + err);
                    }
                }
            );
        }
    }
    //========================== Elements Prompt List Style=================================================
    
    //---------------------------- Summary view ------------------------------------------------
    var elemTxt = {
        scriptClass : 'mstrmojo.Box',
        cssClass : 'promptItem drop-down',
        prompt : null,
        onpromptChange : function() {
            var fnUpdatePrompt = function() {
                var p = this.prompt, 
                    ans = (p.answer && p.answer.items) || [], 
                    a = [],
                    ttl = '<strong>' + (p.title || '') + ':</strong>',
                    i;
                
                // Iterate answer text and store in array.
                for (i = 0; i < ans.length; i++) {
                    a[i] = ans[i].n;
                }
                
                // Set title and answer text.
                var ttlAndAns = this.ttlAndAns;
                ttl += (a.join(', ') || '--ALL--');
                
                if (ttlAndAns.set) {
                    ttlAndAns.set('text', ttl);
                }
                else {
                    ttlAndAns.text = ttl;
                }   
                
                return p;
            };
            
            var prompt = fnUpdatePrompt.call(this);

            // meaning
            this.mnField.text = prompt.mn;

            // register listeners for answer change (assume title and description would not change)
            prompt.answer.attachEventListener('itemsChange', this.id, fnUpdatePrompt);
        },
        children : [{
            scriptClass : 'mstrmojo.LabelWithEllipsis',
            cssClass : 'ttlAns',
            alias : 'ttlAndAns'
        }, {
            scriptClass : 'mstrmojo.LabelWithEllipsis',
            cssClass : 'desc',
            alias : 'mnField'
        }]
    };
    //------------------------- Editing view -----------------------------------------------------
    
    
    function newElementsPicker(ctrl, p) {
        var ans = p.answer,
        ansItems = ans.items || [],
        // The WebElements we are going to browse upon
        avail = p.getAvailable();
        //Mark _Fetchable to concatenate the blocks.
        avail.concat = true;

        // Create a new AndroidElementsPicker to display the elements.
        var cl = new mstrmojo.android.AndroidElementsPicker({
            // can be referenced directly
            alias: 'elementList',
            browseElements: avail,
            controller: ctrl
        });
    
        //TODO: We need to calculate the available height
        cl.set("height", "400px");


        // initial the first block
       avail.getItems(0, {
           /**
            * Callback for when the task returns successfully with the editor. We then open the 
            * editor.
            * 
            * @param retVal The result of the task call.
            */
           success: function(retVal){
                cl.set('items', avail.items);
                cl.addSelectedItems(ansItems);
           }});
       
       return cl;
    }
    //------------------------- Element Search View ----------------------------------------------
    var newElementSearchDialogConfig = function(ctrl, elements, props) {

        var cfg = {
            title: 'Search elements',
            cssClass: 'edtSearch',
            alignment: 'top',
            buttons: [
                      ],
            children:[mstrmojo.func.wrapMethods(props,
	              {
	            	  scriptClass: 'mstrmojo.android.AndroidElementsSearchView',
	            	  elements: elements
	              }
            	)
            ],
            controller: ctrl
        };
	    return cfg;
	};
    //========================== Elements Prompt Calendar Style=================================================
    //--------------------------- Summary view -----------------------------------------------------------
    /*
     * Json for EP Calendar style. 
     * 
     * Only difference from list style is the css class, we need to use calendar icon.
     */
    var elemCalTxt = $CP({
                            cssClass : 'promptItem elems cal'
                        }, $CP(elemTxt));
    //--------------------------- Editing view --------------------------------------------------------------
    var newEPCalDialog = function(p) {
//        var min = parseInt(p.min),
//            max = parseInt(p.max);
        var cl = new mstrmojo.MobileCalendar({
            value: p.answer || "",
            isMultiSelect: true
//            min: isNaN(min) ? null : min,
//            max: isNaN(max) ? null : max
         });

        var callbacks = {
                /**
                 * Callback for the OK button
                 */
                ok: function(){
                    var dates = cl.getSelectedDatesAsString();
                    // update answer
                    p.set('dateAnswer', dates);
                },
                
                /**
                 * Callback for the Cancel button.
                 */
                cancel: function(){
                    // do nothing, since we have not updated the 'answer'.
                }
            };
        return {
            title: 'Select Days',
            width: '99%',
            cssClass: 'mobile-calendar',
            buttons: [
                      $BTN(mstrmojo.desc(1442, 'OK'), function(){
                          // update answer
                          callbacks.ok();
                      }),
                      $BTN(mstrmojo.desc(221, 'Cancel'), function(){
                          callbacks.cancel();
                      })
                      ],
             children: [{
                             scriptClass: 'mstrmojo.Pulldown',
                             itemField: 'n',
                             items:[
                                    {
                                        n: 'Calendar'
                                    },
                                    {
                                        n: 'List'
                                    }
                                    ]
                         },
                        cl
                        ]
         };
        
    };
    
    //========================== Unsupported Type =======================================================
    /**
     * Json for unsupported prompt type view
     */
    var errMsg = {
            scriptClass : 'mstrmojo.HBox',
            cssClass : 'promptItem unsupport',
            prompt : null,
            onpromptChange : function() {
                this.titleField.text = this.prompt.title;
                this.answerField.text = "Unsupported type of prompt. Prompt type: " +
                                        this.prompt.promptType;
            },
            children : [ {
                scriptClass : 'mstrmojo.LabelWithEllipsis',
                alias : 'titleField',
                cssClass: 'ttl'
            }, {
                scriptClass : 'mstrmojo.LabelWithEllipsis',
                alias : 'answerField',
                cssClass: 'ans'
            } ]
        };
    //==========================  FACTORY ===================================================

    mstrmojo.prompt.AndroidPromptViewFactory = mstrmojo.provide(
            'mstrmojo.prompt.AndroidPromptViewFactory',
            {
                /**
                 * @param ctrl prompts view controller
                 * @param p WebPrompt object
                 * @param idx the index of current prompt in prompts collection
                 * @param w view widget which is the parent of the view to create
                 */
                newView: function(ctrl, p, idx, w) {
                    var viewCfg = errMsg,
                        type = p.promptType;
                    
                    if (type === $PROMPT_TYPES.CONSTANT_GEO_PROMPT) {
                        viewCfg = cstGeo;
                        
                    } else if (type === $PROMPT_TYPES.ELEMENTS_PROMPT) {
                        viewCfg = (p.prs.DislayStyle === 'Calendar') ? elemCalTxt : elemTxt;
                        
                    } else if (type === $PROMPT_TYPES.CONSTANT_PROMPT) {
                        
                        // is it a date?
                        if (p.dataType === 14) {
                            viewCfg = (p.prs.ShowTime !== "0") ? cstCalTm : cstCal;

                        } else {
                            var displayState = p.prs.DisplayStyle;
                            if (displayState === 'Switch') {
                                viewCfg = cstSwitch;
                                
                            } else if (displayState === 'Stepper') {
                                viewCfg = cstStepper;
                                
                            } else {
                                viewCfg = cstTxt;
                            }
                        }                        
                    }
                    
                    // Clone the config.
                    viewCfg = $CP(viewCfg, {
                        // every sub view still have the reference to the controller
                        controller: ctrl,
                        
                        parent: w
                    });
                    
                    var v = mstrmojo.registry.ref($CP(viewCfg));
                    if (v) {
                        // every sub view have the reference to the prompt object
                        v.set('prompt', p);
                        
                        // check whether view or the controller want to handle the click event.
                        // We will first check view. If current view does not want to handle it, then we would check controller
                        var func = this.getClickOnSummaryFunction(p) || ctrl.getClickOnSummaryFunction(p);
                        if (func) {
                            // Click on prompt summary event handling. 
                            // Hopefully we do not override any existing postBuildDom. TODO If exits, do the mixin.
                            v.postBuildDom = function(){    
                                var me = this;
                                mstrmojo.dom.attachEvent(this.domNode, mstrmojo.dom.TOUCHEND, function() {
                                    func.apply(me);
                                });
                            };
                        }
                    }
                    return v;
                },

                /**
                 * Sometime, the current prompt view would like to handle the click event...
                 */
                getClickOnSummaryFunction: function(p) {
                    var f = null;
                    switch (p.promptType) {
                    case $PROMPT_TYPES.CONSTANT_PROMPT:
                        switch (p.prs.DisplayStyle) {
                            case 'Switch':
                                f = onclickSwitch;
                                break;
                            }
                        break;
                    case $PROMPT_TYPES.CONSTANT_GEO_PROMPT: 
                        f = onclickGeo;
                        break;
                    case $PROMPT_TYPES.ELEMENTS_PROMPT:
                        break;
                    default:
                    }
                    return f;
                },
                /**
                 * Creates a dialog config for elements prompt editing view
                 */
                newElementsPicker: function(ctrl, p) {
                    return newElementsPicker(ctrl, p);
                },
                newDatePickerDialogConfig: function(ctrl, p) {
                    return newCstCalDialog(p);
                },
                newDateTimePickerDialogConfig: function(ctrl, p) {
                    return newCstCalTimeDialog(p);
                },
                
                newEPDatePickerDialogConfig: function(ctrl, p) {
                    return newEPCalDialog(p);
                },                /**
                 * @param callbacks if callbacks include function 
                 * 
                 * setResult: function(rs){ // rs is an array of items}, it will be used when user finish the selection from search view.
                 * 
                 */
                newElementSearchDialogConfig: function(ctrl, elems, props) {
                    return newElementSearchDialogConfig(ctrl, elems, props);
                }
            }
    );
}());
