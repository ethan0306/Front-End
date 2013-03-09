(function(){

    mstrmojo.requiresCls("mstrmojo.Widget",
                         "mstrmojo.fx",
                         "mstrmojo.locales",
                         "mstrmojo.expr",
                         "mstrmojo.date",
                         "mstrmojo.css");
    
    var _DT = function(){ return mstrmojo.locales.datetime; },
        $D = mstrmojo.dom,
        $E = mstrmojo.expr,
        DTP = $E.DTP,
        $P = mstrmojo.date,
        $H = mstrmojo.hash,
        $A = mstrmojo.array,
        $RMV = $A.removeIndices,
        $C = mstrmojo.css;
    
    var _pre_table = '<table border="0" cellpadding="0" cellspacing="0">',
        _post_table = '</table>';
    
    function _getLeadingBlanks(y,m,fdw){
        var fd = $P.getFirstDateOfMonth(y,m);
        return (fd.getDay() - fdw + 8) % 7;
    }
    
    /**
     * This method takes a date value provided as String and parses it into JSON Object notation
     * 
     *  @param {String} value The date which needs to be parsed 
     *  @return {Object}
     */
    function parseDateAndTimeToJSON(value) {
        //Parse the string containing the date.
        var dt = $P.parseDateAndOrTime(value),
            d, t, r;
        
        //Do we have an object returned?
        if(dt){
            //Yes, the date provided is valid.
            r = {};
            d = dt.date;
            t = dt.time;
            if(d) {
                $H.copy(d, r);
            }
            if(t) {
                $H.copy(t, r);
            }
        }
        
        //Return the result.
        return r;
    }
    
    /**
     * Returns whether the date is out of the min and max date bounds. If no min and max are provided,
     * this method returns false.
     * 
     * @param {Object} date The date provided in the object notification as returned by #parseDateAndTime
     * @param {String} min The min date the calendar can support.
     * @param {String} max The max date the calendar can support.
     * @return Boolean
     */
    function isDateDisabled(day, month, year, min, max) {
        var d = $P.formatDateInfo({day: day, month: month, year: year}, _DT().DATEOUTPUTFORMAT);
        
        //Check if the date is within time range...
        return ($P.inDateTimeRange(d, min, max) !== 0);
    }
    
    /**
     * This function checks if the widget should display it's increase and decrease traversal buttons based on the next and previous dates
     * 
     * @param {mstrmojo.Calendar} widget The Calendar widget.
     * @param {Object} prev, next The next and previous date objects which contain the day, month and year properties.
     */
    function updateTraversalIcons(widget, prev, next) {
        var db = widget.decreaseButton,
            ib = widget.increaseButton,
            cssPrefix = 'mstrmojo-Calendar',
            updateCSS = function (node, className, date) {
                //Adjust the class name
                node.className = (cssPrefix + className) + ((isDateDisabled(date.d, date.m, date.y, widget.min, widget.max)) ? ' disabled' : '');
            };

        //Update the Css..
        updateCSS(db, '-decrease', prev);
        updateCSS(ib, '-increase', next);
    }
    
    /**
     * Function returns the index of the date selected. If it isn't selected, it returns -1.
     * 
     * @param {Array} An array with all the selected dates.
     * @param {Integer} The day that needs to be found
     * @param {Integer} The month that needs to be found
     * @param {Integer} The year that needs to be found
     * @return {Integer}
     */
    function isDateSelected(selectedDates, day, month, year) {
        var i = 0,
            len = selectedDates.length,
            sd;
    
        for (i = 0; i < len; i++) {
            //Get the current iterated object
            sd = selectedDates[i];
            
            //Is the date same as the selected object?
            if (sd && sd.day === day && sd.month === month && sd.year === year) {
                return i;
            }
        }
        
        return -1;
    }
    
    /**
     * This method removes the selection for a given index on the selectionDates array
     * 
     * @param {mstrmojo.Calendar} widget The Calendar widget
     */
    function removeSelection(widget, index) {
        var divs = widget.dayView.getElementsByTagName('div'),
            sd = widget.selectedDates,
            date = sd[index],
            lb = _getLeadingBlanks(date.year, date.month, widget.firstDayOfWeek);
        
        //Remove the CSS selected class...
        $C.removeClass(divs[lb + date.day -1],['selected']);
        
        //Remove the selected date from the selections list.
        $RMV(sd, index, 1);
    }
    
    /**
     * Returns the last selected date from the selections array
     * 
     * @param {mstrmojo.Calendar} widget The Calendar widget
     * @return {Object} An object with the date information.
     */
    function getLastSelectedDate(w) {
        var sds = w.selectedDates,
            length = sds.length;
        
        return (length === 0) ? null : sds[length - 1];
    }
    
    /**
     * <p>Calendar is a widget that allows to pick a date/time. </p>
     * 
     * <p> It has 6 views that can be used to change the corresponding date/time part of this widget: day, month, year, hour, minute and second. 
     * Each view can be accessed by clicking on the label on Calendar interface (hour, minute and second views are only available 
     * when the "dtp" is set to "TIMESTAMP/TIME".</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.Calendar = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        null,
        
        /**
         * @lends mstrmojo.Calendar.prototype
         */
        {
            scriptClass: "mstrmojo.Calendar",
            
            /**
             * A class name prefixed to the domNode.
             * @default ''
             */
            cssPrefix: '',
            
            /**
             * The current browsing month. 
             * 
             * @type Integer
             */
            browseMonth: null,
            
            /**
             * The current browsing year. 
             * 
             * @type Integer
             */            
            browseYear: null,
            
            /**
             * The starting point of year view. 
             * 
             * @type Integer
             */            
            yearRangStart: null,
            
            /**
             * The object holds the current selected date.
             * 
             *  @type Array
             *  @default null
             */
            selectedDates: null,
            
            /**
             * Denotes whether the calendar supports multi-select
             * 
             * @type Boolean
             * @default false
             */
            isMultiSelect: false,
            
            /**
             * The current displayed view. 
             * 
             *  @type String
             */
            currentView: 'day',
            
            /**
             * The duration of the effect used when switching between different views. 
             * 
             * @type Integer
             */
            duration:600,
            
            /**
             * The delimiter used to seperate different time parts: hour, minute and second. 
             */
            timeDelimiter:':',
            
            /**
             * Value from mstrmojo.expr.DTP. data type: we use this value to decide whether or not to show the time part.
             */
            dtp:DTP.DATE,
            
            /**
             * The value to decide which date/time is currently selected. It is synchronized with selectedDates. 
             */
            value: '',
            
            /**
             * default is 1, which means that the week starts with Sunday.
             * if set to 2, it means that the week starts with Monday
             */
            firstDayOfWeek: 1, 
            
            /**
             * Whether only update value property when OK button is hit. Also used to decide whether the OK/Cancel button would be shown or not.
             */
            changeValueOnOK: false,
            
            /**
             * Label to be used for ok button.
             */
            okLabel: mstrmojo.desc(1442,'OK'),
            
            /**
             *  This property controls how the month names are displayed on the calendar
             */
            monthNames: function(i){return _DT().MONTHNAME_SHORT[i];},
            
            /**
             * This property controls how the day names are displayed on the calendar.
             */
            dayNames: function(i){return _DT().dayShortNames[i];},
            
            /**
             * The minimum date supported by the Calendar View
             * 
             * @type String
             * @default null
             */
            min: null,
            
            /**
             * The maximum date supported by the Calendar View
             * 
             * @type String
             * @default null
             */
            max: null,
            
            /**
             * Configurable property allows the user to determine which view modes should be supported by
             * the Calendar widget.
             */
            supportedViews: {
                day: true,
                month: true,
                year: true,
                hour: true,
                minute: true,
                second: true
            },
            
            /**
             * The matrix used to config what direction to used when sliding/switching between different views. 
             */
            sDirMatrix:{
                day:{'month':'down','year':'down','hour':'up','minute':'up','second':'up'},
                month:{'day':'up','year':'left','hour':'up','minute':'up','second':'up'},
                year:{'day':'up','month':'right','hour':'up','minute':'up','second':'up'},
                hour:{'day':'down','month':'down','year':'down','minute':'left','second':'left'},
                minute:{'day':'down','month':'down','year':'down','hour':'right','second':'left'},  
                second:{'day':'down','month':'down','year':'down','hour':'right','minute':'right'} 
            },
            
            markupString:'<div id="{@id}" class="{@cssPrefix} mstrmojo-Calendar {@cssClass}" style="{@cssText}" mstrAttach:mousedown>' + 
                            '<div class="mstrmojo-Calendar-header">' +
                                '<div class="mstrmojo-Calendar-decrease"></div>' +
                                '<div class="mstrmojo-Calendar-increase"></div>' +
                                '<div class="mstrmojo-Calendar-title">' +
                                  '<span class="mstrmojo-Calendar-monthLabel">{@browseMonth}</span>' +
                                  '<span class="mstrmojo-Calendar-comma">,</span>' +
                                  '<span class="mstrmojo-Calendar-yearLabel">{@browseYear}</span>' +        
                                '</div>' +                             
                            '</div>' +
                            '<div class="mstrmojo-Calendar-body">' +
                                '<div class="mstrmojo-Calendar-dayView"></div>' +    
                            '</div>' +
                            '<div class="mstrmojo-Calendar-timePart">' +
                                '<span class="mstrmojo-Calendar-hourLabel">00</span>' +
                                '<span class="mstrmojo-Calendar-timeDelimiter">{@timeDelimiter}</span>' +                                
                                '<span class="mstrmojo-Calendar-minuteLabel">00</span>' +    
                                '<span class="mstrmojo-Calendar-timeDelimiter">{@timeDelimiter}</span>' +    
                                '<span class="mstrmojo-Calendar-secondLabel">00</span>' +    
                            '</div>' +
                            '<div class="mstrmojo-Calendar-tools">' +
                                '<div class="mstrmojo-Calendar-ok"> {@okLabel} </div>' + 
                            '</div>' +                            
                         '</div>',
            
            markupMethods: {
                onvisibleChange: function(){this.domNode.style.display = this.visible ? 'block' : 'none';},                
                onbrowseMonthChange:function(){this.monthLabel.innerHTML = this.monthNames(this.browseMonth - 1);},
                onbrowseYearChange:function(){this.yearLabel.innerHTML = this.browseYear;},
                ondtpChange:function(){this.timePart.style.display = (this.dtp === DTP.TIMESTAMP || this.dtp === DTP.TIME) ? "block" : "none";},
                onvalueChange:function(){
                    if(this.lastValue === undefined || this.value !== this.lastValue){
                            this.updateSelectedDate();
                        }
                },
                onchangeValueOnOKChange:function(){this.tools.style.display = (this.changeValueOnOK ? "block" : "none");}
            },
            
            markupSlots: {
                monthLabel: function(){return this.domNode.firstChild.lastChild.firstChild;},
                yearLabel: function(){return this.domNode.firstChild.lastChild.lastChild;},
                decreaseButton:function(){return this.domNode.firstChild.firstChild;},
                increaseButton:function(){return this.domNode.firstChild.childNodes[1];},                
                bodyContainer: function(){return this.domNode.childNodes[1];},
                dayView:function(){return this.domNode.childNodes[1].firstChild;},
                monthView:function(){return this.domNode.childNodes[1].childNodes[1];},
                yearView:function(){return this.domNode.childNodes[1].lastChild;},
                timePart:function(){return this.domNode.childNodes[2];},
                hourLabel:function(){return this.domNode.childNodes[2].firstChild;},
                minuteLabel:function(){return this.domNode.childNodes[2].childNodes[2];},
                secondLabel:function(){return this.domNode.childNodes[2].childNodes[4];},
                tools:function(){return this.domNode.childNodes[3];},
                okButton: function(){return this.domNode.childNodes[3].firstChild;}
            },
            
            init:function init(props){
                if(this._super) {
                    this._super(props);
                }
                if(this.duration<1) {
                    this.duration = 1;  
                }
                
                //Initialize the selectedDates property to an empty array
                if (!this.selectedDates) {
                    this.selectedDates = [];
                }
                
                this.timeVal = { hour: 0, min: 0, sec: 0 };
            },
            
            /**
             * This method returns an array of selected dates as a string formatted by an output format.
             * 
             * @param {String} format The format in which the date needs to be outputted.
             */
            getSelectedDatesAsString: function getSelectedDatesAsString(format) {
                var result = [];
                
                // Create an object with information about actual position and number of forms.
                $A.forEach(this.selectedDates, function (sd) {
                    result.push($P.formatDateInfo(sd, format || _DT().DATEOUTPUTFORMAT));
                });
                
                return result;
            },
            
            /**
             * Method to be called when the value property is changed. 
             * 
             * @private
             */
            updateSelectedDate: function updateSelectedDate(){
                var v = this.value,
                    tv = this.timeVal,
                    sds = this.selectedDates,
                    r;  
                
                //Has the calendar been initialized using the selectedDates property?
                if (sds.length === 0) {
                    //No, Do we have a value property set?
                    if(v){
                        //Parse it into our JSON notification.
                        r = parseDateAndTimeToJSON(v);
                        
                        if (r && r.hour !== undefined){
                            tv.hour = r.hour;
                            tv.min = r.min;
                            tv.sec = r.sec;
                        }
                    }
                    
                    //Did we succesfuly create an object from the date string?
                if(!r){
                        //No, default to the current date.
                    r = $P.getDateJson(new Date());
                }
                    
                    //Is the date being selected valid?
                    if (isDateDisabled(r.day, r.month, r.year, this.min, this.max)) {
                    	// spec: Today if inside [Min, Max]. If Min is after today, use Min. If Max is before today, use Max.
                    	if (this.min && $P.compareDate(r, this.min) < 0) {
                            r = parseDateAndTimeToJSON(this.min);
                    	} else if (this.max && $P.compareDate(r, this.max) > 0) {
                    		r = parseDateAndTimeToJSON(this.max);
                    	}
                    }
                    
                    //Add the date to the selectedDates array.
                    sds.push(r);
                } else {
                    //Pick the first date in the array to show as the browse year.
                    r = sds[0];
                }
                
                this.set('browseYear',r.year);
                this.set('browseMonth',r.month);
                this.updateTimePart();
                this.updateView(this.currentView);                 
            },
            
            /**
             * Method to be called to synchronize the value with the last selected date on property selectedDates. 
             * 
             * @private
             */
            updateValue: function updateValue(){
                var sd = getLastSelectedDate(this),
                    v = '';
                
                if (sd) {
                    v = $P.formatDateInfo(sd,_DT().DATEOUTPUTFORMAT);
                    if (this.dtp !== DTP.DATE) {
                        v += ' ' + $P.formatTimeInfo(this.timeVal, _DT().TIMEOUTPUTFORMAT);
                    } 
                }
                
                this.lastValue = v;                
                this.set('value', v);                
                
                if(this.onValueUpdate) {//call value change always
                    this.onValueUpdate();
                }                
            },   
            
            /**
             * Method to be called to update the time part labels. 
             * @private
             */
            updateTimePart:function updateTimePart(){
                var time = this.timeVal,
                    hh = time.hour || 0,
                    twelve = (hh % 12 === 0) ? 12 : (hh % 12);
                this.hourLabel.innerHTML = hh < 12 ? twelve + _DT().AM_NAME : twelve + _DT().PM_NAME;
                this.minuteLabel.innerHTML = $P.formatInteger(time.min || 0, 2);
                this.secondLabel.innerHTML = $P.formatInteger(time.sec || 0, 2);
            },                  
            
            /**
             * Event handler to handle mouse down event. 
             * @param {Object} event object raised when mouse down event is fired. 
             * 
             * @private
             */
            premousedown: function(evt){
                var e = evt.e,
                    t = $D.eventTarget(evt.hWin,e);
                
                //Process the event with the target element.
                return this.processEvent(t);
            },
                
            /**
             * Helper method process the events on the Calendar based on which element is being targeted
             * 
             * @param {HTMLElement} t Target HTML element.
             */    
            processEvent: function(t) {
                var cv = this.currentView,
                    sds = this.selectedDates,
                    sd = getLastSelectedDate(this),
                    y, m, d, ma, v; 
                    
                if(t === this.decreaseButton){
                    this.decrease();
                    return true;
                }
                
                if(t === this.increaseButton){
                    this.increase();
                    return true;
                }
                
                if(t === this.okButton && this.changeValueOnOK){
                    this.updateValue();
                }
                
                if(t === this.monthLabel){
                    if(cv !== 'month') {
                        this.switchViewTo('month');
                    }
                    return true;
                }
                
                if(t === this.yearLabel){
                    this.yearRangStart = this.browseYear - 10 - this.browseYear%5;                    
                    this.switchViewTo('year');
                    return true;
                }
                
                if(t === this.hourLabel){                  
                    if(cv !== 'hour') {
                        this.switchViewTo('hour');
                    }
                    return true;
                }                
                
                if(t === this.minuteLabel){                  
                    if(cv !== 'minute') {
                        this.switchViewTo('minute');
                    }
                    return true;
                }
                
                if(t === this.secondLabel){
                    if(cv !== 'second') {
                        this.switchViewTo('second');
                    }
                    return true;
                }    
                
                if($D.contains(this.hourView, t, false,this.domNode)){
                    var ha = t.getAttribute('h');
                    
                    v = parseInt(t.innerHTML, 10);
                    
                    if(!isNaN(ha) && !isNaN(v)){
                        ha = parseInt(ha,10);
                        this.timeVal.hour = v%12 + ha * 12;
                        this.updateTimePart();  
                        this.switchViewTo('day');
                        if(!this.changeValueOnOK){
                            this.updateValue(); 
                        }                       
                    }
                    return true;                     
                }
                
                if($D.contains(this.minuteView, t, false,this.domNode)){
                    v = parseInt(t.innerHTML, 10);
                    if(!isNaN(v)){
                        this.timeVal.min = v;
                        this.updateTimePart();
                        this.switchViewTo('day');
                        if(!this.changeValueOnOK){
                            this.updateValue();        
                        }
                    }
                    return true;                    
                }  
                
                if($D.contains(this.secondView, t, false,this.domNode)){
                    v = parseInt(t.innerHTML, 10);
                    if(!isNaN(v)){
                        this.timeVal.sec = v;
                        this.updateTimePart();
                        this.switchViewTo('day');
                        if(!this.changeValueOnOK){
                            this.updateValue(); 
                        }
                    }
                    return true;                    
                }                  
                
                if($D.contains(this.dayView, t, false,this.domNode)){
                    //update class name to reflect the new selected
                    var by = this.browseYear,
                        bm = this.browseMonth,
                        pnm;
                    
                    d = parseInt(t.innerHTML,10);
                    ma = parseInt(t.getAttribute("m"),10);
                    
                    if(!isNaN(d) && !isNaN(ma)){
                        pnm = (ma === 0) ? {y: by, m: bm} : (ma === 1 ? $P.getNextMonth(by,bm) : $P.getPreMonth(by,bm));  
                        
                        //Check if the clicked date is disabled, if yes, return.
                        if(isDateDisabled(d, pnm.m, pnm.y, this.min, this.max)) {
                            return true;
                        }
                        
                        var selIndex = isDateSelected(sds, d, bm, by); 
                        
                        //If the object is not selected.
                        if(selIndex === -1) {
                            //Set the appropriate CSS
                            $C.addClass(t,['selected']);
   
                            //Push the selected date into our selection list.
                            sds.push({
                                day: d, 
                                month: pnm.m, 
                                year: pnm.y
                            });
                            
                            //If it's single select, we need to remove the other selection.
                            if (!this.isMultiSelect && sds.length > 1) {
                                //Remove the first selection as there should only be one selection supported.
                                removeSelection(this, 0);
                            }
                        } else {
                            removeSelection(this, selIndex);
                        }
                        
                        if(ma === 1) {
                            this.increase();
                        } else if(ma === -1) {                       
                            this.decrease();
                        }  
                        
                        if(!this.changeValueOnOK){
                            this.updateValue();
                        }
                    }
                    return true;
                }
                
                if($D.contains(this.monthView, t, false,this.domNode)){
                    m = parseInt(t.getAttribute('m'),10);
                    if(!isNaN(m)){
                        this.set("browseMonth", m + 1);
                        this.switchViewTo('day');
                    }
                    return true;
                }

                if($D.contains(this.yearView, t, false,this.domNode)){
                    y = parseInt(t.innerHTML,10);
                    if(!isNaN(y)){
                        this.set("browseYear", y);
                        this.switchViewTo('day');
                    }
                    return true;
                }
                
                return true;
            },             
            
            /**
             * Method to be called when decrease button is clicked. 
             */
            decrease: function(){
                var v = this.currentView,
                    newView = v,
                    y = this.browseYear,
                    m = this.browseMonth,
                    yrs = this.yearRangStart,
                    pre;
                
                switch(v){
                case 'day':
                    pre = $P.getPreMonth(y, m);
                    this.set('browseMonth', pre.m);
                    this.set('browseYear', pre.y);
                    break;
                case 'month':
                    this.set('browseYear', y - 1);
                    break;
                case 'year':
                    this.yearRangStart = yrs -25;
                    break;
                case 'hour':
                        newView = 'second';
                    break;
                case 'minute':
                        newView = 'hour';
                    break;
                case 'second':
                        newView = 'minute';
                    break;
                }

                //Switch to the new view...
                this.switchViewTo(newView,'right');
            },
            
            /**
             * Method to be called when increase button is clicked. 
             */            
            increase: function(){
                var v = this.currentView,
                    newView = v,
                y = this.browseYear,
                m = this.browseMonth,
                yrs = this.yearRangStart,
                next;
                
                switch(v){
                case 'day':
                    next = $P.getNextMonth(y, m);
                    this.set('browseMonth', next.m);
                    this.set('browseYear', next.y);
                    break;
                case 'month':
                    this.set('browseYear', y + 1);
                    break;
                case 'year':
                    this.yearRangStart = yrs + 25;
                    break;
                case 'hour':
                        newView = 'minute'; 
                    break;
                case 'minute':
                        newView = 'second'; 
                    break;
                case 'second':
                        newView = 'hour';
                    break;                    
                }                
                
                //Switch to the new view...
                this.switchViewTo(newView,'left');
            },         
            
            /**
             * Update the current view. 
             * @param {String} v The view to be updated. 
             */
            updateView: function(v){
                var html = this[v + 'ViewHTML']();
                this[v + 'View'].innerHTML = html;
            },
            
            /**
             * Method to switch from one view to another. 
             * @param {String} v The view to switch to.
             * @param {String} dr The direction to be used by the Sliding effect. 
             * 
             */
            switchViewTo: function(v,dr){
                var cn = 'mstrmojo-Calendar-' + v + 'View', 
                    div = document.createElement('div'),
                    cv = this[this.currentView + 'View'],
                    hn = v + 'ViewHTML',
                    plb = this[this.currentView + 'Label'],
                    nlb = this[v + 'Label'];
                
                //Is the view supported?
                if (!this.supportedViews[v]) {
                    return;
                }
                
                
                if(!dr) {
                    dr = this.sDirMatrix[this.currentView][v];
                }
                
                div.className = cn;
                div.innerHTML = this[hn]();

                this.currentView = v;
                
                //update the corresponding label
                if(plb){
                    mstrmojo.css.removeClass(plb, ['highlight']);
                }
                if(nlb){
                    mstrmojo.css.addClass(nlb, ['highlight']);
                }
                
                this[v + 'View'] = div;
                
                this._slideIntoView(cv,div,dr);
            },  

            /**
             * Method to slide a view into body part
             * @param {DOMNode} c The div to be moved out.
             * @param {DOMNode} t The div to be moved into body.
             * @param {String} d Direction to be used for sliding effect. 
             */
            _slideIntoView: function(c, t, d){
                var p = this.bodyContainer,
                    v = (d === 'left' || d === 'right') ? c.offsetWidth : c.offsetHeight,
                    pn = (d === 'left' || d === 'right') ? 'left' : 'top',
                    pv = (d === 'left' || d === 'up') ? v : -v, 
                    e1 = new mstrmojo.fx.AnimateProp({
                        props: {},
                        duration:this.duration,
                        interval:this.duration/10,
                        target:c,
                        onEnd:function(){
                            p.removeChild(c);
                        }
                    }),      
                    e2 = new mstrmojo.fx.AnimateProp({
                        props: {},
                        duration:this.duration,
                        interval:this.duration/10,                        
                        target:t
                    }); 
                                    
                t.style[pn] = pv + 'px';
    
                p.appendChild(t);
    
                e1.props[pn] = {start:0,stop:-pv, suffix:'px'};
                e2.props[pn] = {start:pv, stop:0, suffix:'px'};
    
                e1.play();
                e2.play();

            },
            
            /**
             * Method to generate html for day view. 
             * 
             */
            dayViewHTML: function(){
                var y = this.browseYear,
                    m = this.browseMonth,
                    dm = $P.getDaysOfMonth(y,m),
                    pm = $P.getPreMonth(y,m),
                    dpm = $P.getDaysOfMonth(pm.y, pm.m),
                    nm = $P.getNextMonth(y,m),
                    lb = _getLeadingBlanks(y,m,this.firstDayOfWeek),
                    html = [],
                    c = 0,
                    sd = this.selectedDates,
                    min = this.min,
                    max = this.max,
                    date, status, i, j;
                
                //Update the increase and decrease buttons on the calendar.
                updateTraversalIcons(this, {d: dpm, m: pm.m, y: pm.y}, {d: 1, m: nm.m, y: nm.y});
                
                html.push(_pre_table);
                html.push(this._dayViewTHead());
                //first row
                html.push('<tr>');
                for(i=0;i<lb;i++){
                    //Calculate the day
                    date = dpm-lb+i+1;
                    
                    //Initialize the status to empty.
                    status = (isDateDisabled(date, pm.m, pm.y, min, max)) ? 'disabled' : '';
                    
                    html.push('<td><div class="mstrmojo-Calendar-day-pre ' + status + '" m="-1">');
                    html.push(date);
                    html.push('</div></td>');
                    c++;
                }
                for(i=0;i<dm;i++){
                    //Calculate the day
                    date = i+1;
                    
                    //Initialize the status to empty.
                    status = (isDateDisabled(date, m, y, min, max)) ? ' disabled' : '';
                    
                    html.push('<td><div class="mstrmojo-Calendar-day-cur' + ((isDateSelected(sd, date, m, y) !== -1) ? ' selected' : '') + status + '" m="0">');
                    html.push(i+1);
                    html.push('</div></td>');
                    if((++c)%7 === 0) {
                        html.push("</tr><tr>");
                    }
                }
                for(j=c;j<42;j++){
                    //Calculate the next day
                    date = c-dm-lb+1;
                    
                    //Initialize the status to empty.
                    status = (isDateDisabled(date, nm.m, nm.y, min, max)) ? 'disabled' : '';
                    
                    html.push('<td><div class="mstrmojo-Calendar-day-next ' + status + '" m="1">');
                    html.push(date);
                    html.push('</div></td>');   
                    if((++c)%7 === 0) {
                        html.push("</tr><tr>");   
                    }
                }
                html.push('</tr>');
                html.push(_post_table);
                return html.join('');
            },
            
            /**
             * Method to generate html for day view table head. 
             * 
             */            
            _dayViewTHead: function(){
                var html = [],
                    pre = '<thead><tr class="mstrmojo-Calendar-thead">',
                    post = '</tr></thead>',
                    fd = this.firstDayOfWeek === 1 ? 0 : 1,
                    dayNames = this.dayNames,
                    i;
                
                html.push(pre);
                for(i = fd; i < 7; i++){
                   html.push('<td>');
                   html.push(dayNames(i));
                   html.push('</td>');
                }
                if(fd === 1) {
                    html.push(dayNames(0));
                }
                html.push(post);
                return html.join('');
            },
            
            /**
             * Method to generate html for month view. 
             * 
             */            
            monthViewHTML: function(){
                var html = [],
                    bm = this.browseMonth - 1,
                    i;
                html.push(_pre_table);
                html.push('<tr>');
                for(i=0;i<12;i++){
                    html.push('<td><div class="mstrmojo-Calendar-month' + ((i === bm) ? ' selected' : '') + '" m="');
                    html.push(String(i));
                    html.push('">');                        
                    html.push(this.monthNames(i));
                    html.push('</div></td>');
                    if(i%3 === 2) {
                        html.push("</tr><tr>");
                    }
                }
                html.pop();
                html.push("</tr>");
                html.push(_post_table);
                return html.join('');
            },
            
            /**
             * Method to generate html for year view. 
             * 
             */            
            yearViewHTML: function(){
                var start = this.yearRangStart,
                    html = [],
                    by = this.browseYear,
                    y, i;

                html.push(_pre_table);
                html.push('<tr>');
                for(i=0;i<25;i++){
                    y = start + i;
                    html.push('<td><div class="mstrmojo-Calendar-year' +  ((by===y) ? ' selected' : '') + '">');
                    html.push(y);
                    html.push('</div></td>');
                    if(i%5 === 4) {
                        html.push("</tr><tr>");     
                    }
                }
                html.pop();
                html.push("</tr>");
                html.push(_post_table);
                return html.join('');
            },
            
            /**
             * Method to generate html for hour view. 
             * 
             */            
            hourViewHTML: function(){
                var html = [],
                    hh = this.timeVal.hour,
                    i;
                html.push(_pre_table);
                html.push('<tr><td colspan="6"><div class="mstrmojo-Calendar-hourTitle">');
                html.push(_DT().AM_NAME);
                html.push('</div></td></tr>');
                for(i=0;i<12;i++){
                    html.push('<td><div class="mstrmojo-Calendar-hour' +  ((i === hh)? ' selected' : '') + '" h="0">');
                    html.push((i === 0) ? 12 : i);
                    html.push('</div></td>');
                    if(i === 5) {
                        html.push("</tr><tr>");
                    }
                }
                html.push('</tr><tr><td colspan="6"><div class="mstrmojo-Calendar-hourTitle">');
                html.push(_DT().PM_NAME);
                html.push('</div></td></tr>');                
                for(i=0;i<12;i++){
                    html.push('<td><div class="mstrmojo-Calendar-hour' + (((12 + i) === hh) ? ' selected' : '') + '" h="1">');
                    html.push((i === 0) ? 12 : i);
                    html.push('</div></td>');
                    if(i === 5) {
                        html.push("</tr><tr>");
                    }
                }
                html.push("</tr>");
                html.push(_post_table);
                return html.join('');
            },
            
            /**
             * Method to generate html for minute view. 
             * 
             */            
            minuteViewHTML: function(){
                return this._minuteSecondViewHTML(this.timeVal.min, "mstrmojo-Calendar-minute");
            },
            
            /**
             * Method to generate html for second view. 
             * 
             */            
            secondViewHTML: function(){
                return this._minuteSecondViewHTML(this.timeVal.sec, "mstrmojo-Calendar-second");
            },
            
            /**
             * Method to generate html for day/second view. 
             * @private
             */            
            _minuteSecondViewHTML: function(s,c){
                var html = [],
                    i;
                
                html.push(_pre_table);
                html.push('<tr>');
                for(i=0;i<60;i++){
                    html.push('<td><div class="');
                    html.push(c);
                    html.push((i === s) ? ' selected">' : '">');
                    html.push(i);
                    html.push('</div></td>');
                    if(i%10 === 9) {
                        html.push("</tr><tr>");
                    }
                }
                html.pop();
                html.push("</tr>");
                html.push(_post_table);
                return html.join('');                
            },
            
            unrender: function unrender(ignoreDom) {
                // need to clean up the lastValue so that the calendar could display correctly when rendered again.
                delete this.lastValue;
                this._super(ignoreDom);
            }
        }
    );
    
}());