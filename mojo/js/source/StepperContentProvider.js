(function(){

    mstrmojo.requiresCls("mstrmojo.Obj");
    
    mstrmojo.StepperContentProvider = mstrmojo.declare(
        // superclass
        mstrmojo.Obj,
        
        // mixins
        null,
        
        {
            scriptClass: "mstrmojo.StepperContentProvider",
            
            /**
             * The object that actually holds the stepping data.
             * 
             * @type mstrmojo.Obj
             */
            item: null,
            
            /**
             * This property could be set to a renderer object. If not, the value of the stepper will be displayed by default.
             * 
             * @type Object,
             * @default null
             */
            renderer: null,
            
            /**
             * Denotes the min value supported by the stepper. If null, it defaults to an infinite stepper
             * 
             * @default null
             */
            min: null,
            
            /**
             * Denotes the max value supported by the stepper. If null, it defaults to an infinite stepper.
             * 
             * @default null
             */
            max: null,
            
            /**
             * Denotes the step size. 
             * 
             * @type Integer
             * @default 1
             */
            interval: 1,

            /**
             * This property can be set to the name of the property of the stepper widget that holds the min value. 
             * 
             * @default 'min'
             */
            minField: "min",
            
            /**
             * This property can be set to the name of the property of the stepper widget that holds the max value. 
             * 
             * @default 'max'
             */
            maxField: "max",
            
            /**
             * This property can be set to the name of the property of the stepper widget that holds the min value. 
             * 
             * @default 'value'
             */
            valField: "value",
            
            /**
             * This property can be set to the name of the property of the stepper widget that holds the interval value. 
             * 
             * @default 'interval'
             */
            intField: "interval",
            
            /**
             * Property determines whether the stepper should loop. This will only work if there is a min and max set.
             * 
             * @default false
             */
            canLoop: false,
            
            /**
             * This function gets invoked when the user presses the next button on the stepper. This method performs the calculations
             * and does not render.
             */
            next: mstrmojo.emptyFn,
            
            /**
             * This function gets invoked when the user presses the prev button on the stepper. This method performs the calculations
             * and does not render.
             */
            prev: mstrmojo.emptyFn,
            
            /**
             * This function gets invoked when the user presses the prev button on the stepper. This method tells the stepper if the 
             * data provider has a previous value for it.
             */
            hasPrev: mstrmojo.emptyFn,
            
            /**
             * This function gets invoked when the user presses the next button on the stepper. This method tells the stepper if the 
             * data provider has a next value for it.
             */
            hasNext: mstrmojo.emptyFn,
            
            /**
             * This method renders the item using the renderer at the given location.
             * 
             * @param {Number} stepDelta The number of intervals of delta for which the item should be rendered.
             * If no delta is provided, it defaults to the current value. 
             */
            renderItemAt: mstrmojo.emptyFn
        }
    );
}());           
