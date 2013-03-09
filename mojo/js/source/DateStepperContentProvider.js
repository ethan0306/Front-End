(function(){

    mstrmojo.requiresCls("mstrmojo.NumStepperContentProvider", "mstrmojo.date");
    
    var $D = mstrmojo.date;
    
    mstrmojo.DateStepperContentProvider = mstrmojo.declare(
        // superclass
        mstrmojo.StepperContentProvider,
        
        // mixins
        null,
        
        // instance members 
        {
            scriptClass: "mstrmojo.DateStepperContentProvider",
            
            curVal: null,
            
            init: function(props){
                this._super(props);
                
                //Set the instance variables
                var item = this.item,
                    intVal = item[this.intField],
                    val = item[this.valField],
                    minF = this.minField,
                    maxF = this.maxField,
                    min = item[minF],
                    max = item[maxF];
                
                //Get the min, max and the interval values from the steppers data item.
                this.min = min && $D.getDateFromDateInfo(min);
                this.max = max && $D.getDateFromDateInfo(max);
                
                //Do we have an initial value? If not, do we have a min? If not, reset the value to the current date.
                this.curVal = val ? $D.getDateFromDateInfo(val) : (this.min ? new Date(this.min) : new Date());
                
                //Create stepper content providers for month, day, year fields.
                this.createChildProviders();
            },
            
            /**
             * The following interfaces are not applicable.
             * Use the ones from the child content providers instead. 
             * 
             * next: mstrmojo.emptyFn,
             * prev: mstrmojo.emptyFn,
             * hasPrev: mstrmojo.emptyFn,
             * hasNext: mstrmojo.emptyFn,
             * renderItemAt: mstrmojo.emptyFn
             */
            
            
            /**
             * Create individual number stepper content providers for the year, month and day stepper.
             */
            createChildProviders: function(){
                var me = this;
                
                mstrmojo.array.forEach(['year', 'month', 'day'], function(n){
                    me[n + 'CP'] = new mstrmojo.NumStepperContentProvider({
                                        item: { interval:1 },
                                        canLoop: true,
                                        updateConfig: function(v, max, min){
                                            this.curVal = v;
                                            this.max = max;
                                            this.min = min;
                                        },
                                        onTraverse: function(){
                                            //notify the dateProvider to traverse
                                            me.traverse(n, this.curVal);
                                        }
                                    });
                });
                
                this.updateChildProviders();
            },
            
            /**
             * Update the year, month and day stepper provider with the new value, max and min.
             */
            updateChildProviders: function(){
                var max = this.max,
                    min = this.min,
                    year = this.curVal.getFullYear(),
                    month = this.curVal.getMonth(),
                    day = this.curVal.getDate(),
                    // Is it on the year boundary?
                    atMaxYear = max && (year === max.getFullYear()),
                    atMinYear = min && (year === min.getFullYear()),
                    // Is it on the month boundary?
                    atMaxMonth = atMaxYear && (month === max.getMonth()),
                    atMinMonth = atMinYear && (month === min.getMonth());
                
                // Directly use the max/min year from the config
                this.yearCP.updateConfig(year, max ? max.getFullYear() : null, min ? min.getFullYear() : null);
                // Read the max/min month from the config if we are on the year boundary,
                // Otherwise, use [1-12] instead
                this.monthCP.updateConfig(month + 1, atMaxYear ? max.getMonth() + 1 : 12, atMinYear ? min.getMonth() + 1 : 1);
                // Use the max/min day from the config if we are on the month boundary,
                // Otherwise, calculate it based on the year and month value.
                this.dayCP.updateConfig(day, atMaxMonth ? max.getDate() : mstrmojo.date.getDaysOfMonth(year, month + 1), atMinMonth ? min.getDate() : 1);
            },
            
            /**
             * Allow child providers to update the date value
             * 
             * @param field {String} 'year', 'month' or 'day'
             * @param value {Number} the current value of year, month or day
             */
            traverse: function(field, value){
            //update the underlying date value to let it fit into the range
                var v = this.curVal,
                    y = (field === 'year') ? value : this.curVal.getFullYear(),
                    m = (field === 'month') ? value : this.curVal.getMonth() + 1, //the value of 'm' is 1-based
                    d = (field === 'day') ? value : this.curVal.getDate();
                
                //when year or month changes, the current day value may be invalid;
                d = Math.min(mstrmojo.date.getDaysOfMonth(y, m), d);
                
                //update the date with the valid year, month, day
                v.setFullYear(y, m - 1, d);
                
                //Check whether the current date is out of bounds.
                if (this.max){
                    v = Math.min(this.max, v); // This will convert the date type to integer
                }
                if (this.min){
                    v = Math.max(this.min, v); // This will convert the date type to integer
                }
                
                this.curVal = new Date(v);
                
                this.updateChildProviders(); //update sub providers with the new max/min limits
                
                if (this.onTraverse){
                    this.onTraverse();
                }
            }
        }
    );
}());           
