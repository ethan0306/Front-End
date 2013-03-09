(function(){

    mstrmojo.requiresCls("mstrmojo.StepperContentProvider");
    
    /**
     * Has previous and has next helper method.
     * 
     * @param {mstrmojo.NumStepperContentProvider} cp The content provider 
     * @param {String} direction The direction for which the next or previous value exists needs to be checked (true - next, false - previous)
     * 
     * @return {Boolean} Whether the user has access to go next or previous.
     */
    function has(cp, direction) {
        //Initialize to arbitrary variables
        var boundary = direction ? cp.max : cp.min,
            altBoundary = direction ? cp.min : cp.max,
            newVal = cp.getVal(direction ? 1 : -1);
        
        return (//Is it Infinite?
                boundary === null ||
                //Is it within the provided range?
                (direction ? (newVal <= boundary) : (newVal >= boundary)) ||
                //Can the stepper loop?
                (altBoundary !== null && cp.canLoop));
    }
    
    /**
     * Helper method to provide the value to the stepper when it moves next or previous.
     * 
     * @param {mstrmojo.NumStepperContentProvider} cp The content provider 
     * @param {String} direction The direction for which the next or previous value exists needs to be checked (true - next, false - previous)
     */
    function traverse(cp, direction) {
        var min = cp.min,
            max = cp.max,
            multiplier = direction ? 1 : -1,
            newVal = cp.getVal(multiplier),
            loop = cp.canLoop,
            isOutOfBounds = direction ? (max !== null && newVal > max) : (min !== null && (newVal < min));
        
        //Would we be out of bounds if we adjusted the current value?
        if(isOutOfBounds) {
            //Yes, its out bounds. Can we loop?
            if (loop) {
                newVal = ((newVal - min) % (max - min + 1)) + min;
                newVal = (newVal >= min) ? newVal : newVal + (max - min + 1); // when decrease the modulo may be negative, bring it into the range. 
            } else {
                return;
            }
        }
        
        //Adjust the curval by the interval.
        cp.curVal = newVal;
        
        //Set the value field
        cp.item[cp.valField] = cp.curVal;
        
        //Customized hook up
        if (cp.onTraverse){
            cp.onTraverse();
        }
    }
    
    /**
     * This widget acts as a numeric content provider for the MicroStrategy Mojo widget mstrmojo.Stepper.
     * 
     * @class
     * @extends mstrmojo.StepperContentProvider
     */
    mstrmojo.NumStepperContentProvider = mstrmojo.declare(
        // superclass
        mstrmojo.StepperContentProvider,
        
        // mixins
        null,
        
        // instance members 
        {
            scriptClass: "mstrmojo.NumStepperContentProvider",
            
            curVal: null,
            
            /**
             * @see mstrmojo.Obj
             */
            init: function(props){
                //Call super.
                this._super(props);
                
                //Initialize the properties.
                this.initProps(props);
            },
            
            /**
             * Initializes the properties for the stepper's content provider. This method reads the values from the value field and makes copies 
             * of the current value, min and max.
             */
            initProps: function initProps() {
                var minVal = this.isInfinite(this.minField)?  null:this.item[this.minField],
                    maxVal = this.isInfinite(this.maxField)?  null:this.item[this.maxField];
                    intVal = this.item[this.intField];
                
                if(minVal !== null && typeof minVal !== undefined) {
                    this.min = minVal;
                }

                if(maxVal !== null && typeof maxVal !== undefined) {
                    this.max = maxVal;
                }
                    
                if(intVal !== null && typeof intVal !== undefined) {
                   this.interval = intVal;
                }
                
                this.curVal = this.item[this.valField];
                if( this.curVal === null || typeof this.curVal === 'undefined') {
                    //Initialize the current value.
                    this.curVal = (this.min !== null) ? this.min : 0;
                }
            },
            
            /**
             * Returns whether the stepper is an infinite stepper. The stepper can be infinite in one direction. It can be acheived by not setting
             * the min and max values for the stepper.
             * 
             * @return Boolean Whether the stepper is infinte.
             */
            isInfinite: function isInfinite(fieldName){
                return (typeof fieldName === 'undefined' || fieldName === null || this.item[fieldName] === null || typeof this.item[fieldName] === 'undefined');
            },
            
            /**
             * @see mstrmojo.StepperContentProvider
             */
            next: function(){
                traverse(this, true);
            },
            
            /**
             * @see mstrmojo.StepperContentProvider
             */
            prev: function(){
                traverse(this, false);
            },
            
            /**
             * @see mstrmojo.StepperContentProvider
             */
            hasPrev: function(){
                return has(this, false);
            },
            
            /**
             * @see mstrmojo.StepperContentProvider
             */
            hasNext: function(){
                return has(this, true);
            },
            
            /**
             * @see mstrmojo.StepperContentProvider
             */
            renderItemAt: function(delta){
                //Get the value at the given delta
               var val = this.getVal(delta);
               
               //Do we have a renderer? Use that or simply render the item.
               return (this.renderer)? this.renderer.render(val, this) : val;
            },
            
            /**
             * @see mstrmojo.StepperContentProvider
             */
            getVal: function(delta){
                //If no delta is provided, reset to 0
               delta = (delta)? delta: 0;
               
               //Return the adjusted value... 
               return this.curVal + this.interval * delta;
            }
        }
    );
}());           
