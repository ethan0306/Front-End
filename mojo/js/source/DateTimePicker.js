(function () {

    mstrmojo.requiresCls("mstrmojo.Container",
                         "mstrmojo.hash",
                         "mstrmojo.array",
                         "mstrmojo.date",
                         "mstrmojo.Stepper",
                         "mstrmojo.DateStepperContentProvider",
                         "mstrmojo.NumStepperContentProvider");
        
    var $A = mstrmojo.array,
        $D = mstrmojo.date,
        $H = mstrmojo.hash,
        DTP = mstrmojo.expr.DTP,
        DT = {
            interval: 1
        },
        H = {
            min: 1, 
            max: 12, 
            interval: 1,
            value: 12
        },
        H24 = {
            min: 0,
            max: 23,
            interval: 1,
            value: 0
        },
        M = {
            min: 0, 
            max: 59, 
            interval: 1
        };

    function createChildren(){
        var dtp = this.dtp,
            sc = this.stepperClass,
            value = this[this.valueField],
            children = [], dateText, timeText;
        
        if (this._hasDate){
            children.push({
                scriptClass: sc,
                slot:  'monthNode',
                alias: 'monthStepper',
                title: mstrmojo.desc(871), //'month'
                provider: this.dateProvider.monthCP
            }, {
                scriptClass: sc,
                slot:  'dayNode',
                alias: 'dayStepper',
                title: mstrmojo.desc(872), //'day'
                provider: this.dateProvider.dayCP
            }, {
                scriptClass: sc,
                slot:  'yearNode',
                alias: 'yearStepper',
                title: mstrmojo.desc(873), //'year',
                provider: this.dateProvider.yearCP
            });
        }
            
        if (this._hasTime){
            children.push({
                scriptClass: sc,
                slot:  'hourNode',
                alias: 'hourStepper',
                provider: this.hourProvider
            }, {
                scriptClass: sc,
                slot:  'minNode',
                alias: 'minStepper',
                provider: this.minProvider
            });
        }
        
        if (dtp !== DTP.TIME){
            dateText = (value && value.date) ? $D.formatDateInfo(value.date, mstrmojo.locales.datetime.DATEOUTPUTFORMAT) : mstrmojo.desc(2052); //'Date'
            children.push(mstrmojo.Button.newAndroidButton(dateText, function(){this.parent.toDateView();}, {alias: 'dateToggle', slot: 'switcherNode', cssClass:'', selected: true}));
        }
        
        if (dtp !== DTP.DATE){
            timeText = (value && value.time) ? $D.formatTimeInfo(value.time, mstrmojo.locales.datetime.TIMEOUTPUTFORMAT) : mstrmojo.desc(2170); //'Time'
            children.push(mstrmojo.Button.newAndroidButton(timeText, function(){this.parent.toTimeView();}, {alias: 'timeToggle', slot: 'switcherNode', cssClass:'', selected: dtp==DTP.TIME}));
        }
        
        if (this._hasDate){
            this.viewCssClass = 'dateView';
        }else if (this._hasTime){
            this.viewCssClass = 'timeView';
        }
        
        this.addChildren(children);
    }
    
    function createProviders(){
        var propNames = [this.valueField, 'min', 'max'],
            dateItem = $H.copy(DT),
            hourItem = this.is24HourMode ? $H.copy(H24) : $H.copy(H),
            minItem = $H.copy(M),
            value = this[this.valueField],
            timeValue = value && value.time,
            me = this;
        
        //Set the date properties from the init props
        $A.forEach(propNames, function (p) {
            dateItem[p] = $H.copy(me[p]);
        });
        
        if (this._hasDate){
            this.dateProvider = new mstrmojo.DateStepperContentProvider({
                item: dateItem,
                valField: this.valueField,
                canLoop: true,
                onTraverse: function(){
                    //refresh 
                    me.updateDate();
                }
            });
        }
        
        if (this._hasTime){
            //Do we have a custom minuteInterval set-up?
            if (this.minuteInterval !== undefined) {
                minItem.interval = this.minuteInterval;
            }
            
            //Delete the JSON minuteInterval property as we don't want to copy it.
            delete this.minuteInterval;
            
            if (timeValue) {
                //Set the initial time
                if (!this.is24HourMode){
                    hourItem.value = timeValue.hour % 12 || 12;
                    //Set the meridiem property
                    this.set('meridiem', (timeValue.hour < 12));
                }else{
                    hourItem.value = timeValue.hour;
                }
                minItem.value = timeValue.min;
            }
            
            //Set the hour stepper's content provider.
            this.hourProvider = new mstrmojo.NumStepperContentProvider({
                item: hourItem,
                valField: 'value',
                canLoop: true,
                onTraverse: function(){
                    me.updateTime();
                }
            });
            
            //Set the minute stepper's content provider...
            this.minProvider = new mstrmojo.NumStepperContentProvider({
                item: minItem,
                valField: 'value',
                canLoop: true,
                renderer: {
                    render: function(v, w){
                        return String(v).length == 1 ? ('0' + v) : v;
                    }
                },
                onTraverse: function(){
                    me.updateTime();
                }
            });
        }
    }
    
    /**
     * Widget for allowing the user to pick date or time using a stepper style.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.DateTimePicker = mstrmojo.declare(
        /**
         * Super Class
         */
        mstrmojo.Container,
            
        /**
         * Mixins
         */
        null,
            
        {

            scriptClass: "mstrmojo.DateTimePicker",
            
            /**
             * This property is set by the user to set and retrieve the time on the time picker. This object is of type
             * date info (@see mstrmojo.date#parseDateAndOrTime)
             * 
             * @type Object
             */
            value: null,
            
            /**
             * The minimum date/time supported by the date time picker. The object is of type date info 
             * @see mstrmojo.date#parseDateAndOrTime
             * 
             * @type Object
             */
            min: null,
            
            /**
             * The maximum date/time supported by the date time picker. The object is of type date info 
             * @see mstrmojo.date#parseDateAndOrTime
             * 
             * @type Object
             */
            max: null,
            
            /**
             * The boolean denotes whether the True - AM, False - PM
             * 
             * @type Boolean
             * @default true
             */
            meridiem: true,
            
            /**
             * This property denotes whether the date time picker needs to support an interval other than 1. We only support intervals
             * in minutes based on the Web GUI and hence only the minute stepper will support the interval property
             */
            minuteInterval: null,
            
            /**
             * This property denotes whether the date picker is displayed in 24 hour mode or not.
             * 
             * @type Boolean
             * @default false
             */
            is24HourMode: false,
            
            /**
             * Date type, used to decide whether to show date or time picker. 
             */
            dtp: mstrmojo.expr.DTP.TIMESTAMP,
            
            /**
             * applied on the viewNode.
             * @private
             */
            viewCssClass: '',
            
            /**
             * the name of the property which holds the date JSON object 
             */
            valueField: 'value',
            
            /**
             * ScriptClass of the child widgets which are responsible for changing the date value
             */
            stepperClass: 'mstrmojo.Stepper',
            
            markupString: "<div id='{@id}' class='mstrmojo-DateTimePicker' style='{@cssText}'>" +
                              "<div class='switcher'></div>" +
                              "<div class='{@viewCssClass}'>" +
                                  "<span class='stepNode month'></span>" +
                                  "<span class='stepNode day'></span>" +
                                  "<span class='stepNode year'></span>" +
                                  "<span class='stepNode hour'></span>" +
                                  "<span class='stepNode min'></span>" +
                                  "<span class='meridiem' mstrAttach:click></div>" +
                              "</div>" +
                          "</div>",
                          
            markupSlots:{
                switcherNode: function(){ return this.domNode.firstChild;},
                viewNode: function(){ return this.domNode.children[1];},
                monthNode: function(){ return this.domNode.children[1].children[0];},
                dayNode: function(){ return this.domNode.children[1].children[1];},
                yearNode: function(){ return this.domNode.children[1].children[2];},
                hourNode: function(){ return this.domNode.children[1].children[3];},
                minNode: function(){ return this.domNode.children[1].children[4];},
                meridiemNode: function() { return this.domNode.children[1].children[5];}
            },
            
            markupMethods: {
                onmeridiemChange: function(){
                    // Do not show the meridiem part in 24 hour mode.
                    if (this.is24HourMode){
                        this.meridiemNode.display = 'none'; 
                    }else{
                        this.meridiemNode.innerHTML = this.meridiem ? mstrmojo.locales.datetime.AM_NAME : mstrmojo.locales.datetime.PM_NAME;
                    }
                },
                onviewCssClassChange: function(){
                    this.viewNode.className = this.viewCssClass;
                }
            },
            
            /**
             * @see mstrmojo.Obj
             */
            init: function init(props) {
                //Call super
                this._super(props);
                
                var dtp = this.dtp;
                
                this._hasDate = (dtp === DTP.DATE || dtp === DTP.TIMESTAMP);
                this._hasTime = (dtp === DTP.TIME || dtp === DTP.TIMESTAMP);
                
                //Create data providers for the steppers
                createProviders.call(this);

                //Dynamically populate its children
                createChildren.call(this);
            },
            
            /**
             * @return datetime JSON object
             */
            getDateTime: function getDateTime() {
                return {
                    date: this.getDate(),
                    time: this.getTime()
                };
            },

            /**
             * 
             * @return date JSON object
             */
            getDate: function getDate() {
                if (this._hasDate){
                    var dateInfo = this.dateProvider.curVal;
                    
                    return {
                        year: dateInfo.getFullYear(),
                        month: dateInfo.getMonth() + 1,
                        day: dateInfo.getDate()
                    };
                }
                
                return null;
            },
            
            /**
             * @return time JSON object
             */
            getTime: function getTime() {
                if (this._hasTime){
                    return {
                        hour: !this.is24HourMode ? $D.capitalHour(this.hourProvider.curVal, this.meridiem?' AM':' PM') : this.hourProvider.curVal,
                        min: this.minProvider.curVal
                    };
                }
                return null;
            },
            
            /**
             * @return the string representation of the current date time
             */
            getDateTimeString: function getDateTimeString(){
                var str = '';
                if (this._hasDate){
                    str += $D.formatDateInfo(this.getDate(), mstrmojo.locales.datetime.DATEOUTPUTFORMAT);
                }
                if (this._hasDate && this._hasTime){
                    str += ' ';
                }
                if (this._hasTime){
                    str += $D.formatTimeInfo(this.getTime(), mstrmojo.locales.datetime.TIMEOUTPUTFORMAT);
                }
                return str;
            },
            
            /**
             * Will be invoked when the date value is changed
             */
            updateDate: function updateDate(){
                if (this.hasRendered){
                    //update the year, month, day steppers' display value
                    var me = this;
                    $A.forEach(['year', 'month', 'day'], function(n){
                        me[n + 'Stepper'].updateDisplayText();
                    });
                }
                
                if (this.dateToggle){ 
                    //update the display text of the date toggle button.
                    this.dateToggle.set('text', $D.formatDateInfo(this.getDate(), mstrmojo.locales.datetime.DATEOUTPUTFORMAT));
                }
            },
            
            /**
             * Will be invoked when the time value is changed
             */
            updateTime: function updateTime(){
               if (this.timeToggle){
                   //update the display text of the time toggle button.
                   this.timeToggle.set('text', $D.formatTimeInfo(this.getTime(), mstrmojo.locales.datetime.TIMEOUTPUTFORMAT));
               }
            },
            
            /**
             * Switch to the Month-Day-Year picker view
             */
            toDateView: function toDateView(){
                this.set('viewCssClass', 'dateView');
                this.dateToggle.set('selected', true);
                this.timeToggle && this.timeToggle.set('selected', false);
            },
            
            /**
             * Switch to the Hour-Minute-Meridiem picker view
             */
            toTimeView: function toTimeView(){
                this.set('viewCssClass', 'timeView');
                this.dateToggle && this.dateToggle.set('selected', false);
                this.timeToggle.set('selected', true);
            }
        }
    );
}());