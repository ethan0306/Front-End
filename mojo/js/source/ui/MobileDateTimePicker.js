(function () {

    mstrmojo.requiresCls("mstrmojo.DateTimePicker",
                         "mstrmojo.ui.MobileStepper",
                         "mstrmojo._TouchGestures");
    
    var dateTimeScriptClass = 'mstrmojo.ui.MobileStepper';
        
    /**
     * Widget for allowing the user to pick time using a stepper style.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.ui.MobileDateTimePicker = mstrmojo.declare(
        /**
         * Super Class
         */
        mstrmojo.DateTimePicker,
            
        /**
         * Mixins
         */
        [mstrmojo._TouchGestures],
            
        {

            scriptClass: "mstrmojo.ui.MobileDateTimePicker",
            
            stepperClass: 'mstrmojo.ui.MobileStepper',
            
            /**
             * Onclick event handler for non-touch enabled devices.
             */
            onclick: function(evt) {
                this.touchTap(evt.e);
            },
            
            /**
             * Event handler when the user taps on a touch enabled device
             * 
             * @see mstrmojo._TouchGestures
             */
            touchTap: function(touch) {
                if (touch.target === this.meridiemNode) {
                    //adjust the meridiem
                    this.set('meridiem', !this.meridiem);
                    this.updateTime();
                }
            },
            
            postBuildRendering: function(){
                this._super();
                
                this.meridiemNode.ontouchstart = function(e){
                    mstrmojo.css.addClass(e.target, 'glow');
                };
                this.meridiemNode.ontouchend = function(e){
                    mstrmojo.css.removeClass(e.target, 'glow');
                };
                
            }
            
        }
    );
}());