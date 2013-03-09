(function () {

    mstrmojo.requiresCls("mstrmojo.Stepper",
                         "mstrmojo._TouchGestures");
      
    /**
     * Touch enabled widget to allow the user to step through various lists of items. Items can be either numeric or text. Each stepper needs a 
     * data provider. (See mstrmojo.StepperContentProvider).
     * 
     * @class
     * @extends mstrmojo.Stepper
     */
    mstrmojo.ui.MobileStepper = mstrmojo.declare(
        //superclass
        mstrmojo.Stepper,
            
        //mixins
        [ mstrmojo._TouchGestures ],
            
        {

            scriptClass: "mstrmojo.ui.MobileStepper",
            
            /**
             * On click event listener.
             */
            onclick: function onclick(evt) {
                //Debugging code, we do not want it executing in the mobile app.
                if (!mstrApp.isTouchApp()) {
                    this._super(evt);
                }
                return false;
            },

            /**
             * onmousedown event listener.
             */
            onmousedown: function onmousedown(evt) {
                //Debugging code, we do not want it executing in the mobile app.
                if (!mstrApp.isTouchApp()) {
                    this._super(evt);
                }
                return false;
            },
            
            /**
             * onmouseup event listener.
             */
            onmouseup: function onmouseup(evt) {
                //Debugging code, we do not want it executing in the mobile app.
                if (!mstrApp.isTouchApp()) {
                    this._super(evt);
                }
                return false;
            },
            
            /**
             * @see mstrmojo._TouchGestures
             */
            touchSelectBegin: function touchSelectBegin(touch) {
                //Start an interval to update the stepper periodically.
                this.startStepperInterval(touch, 'touchTap');
            },
            
            /**
             * @see mstrmojo._TouchGestures
             */
            touchSelectEnd: function touchSelectEnd(touch) {
                //The user has lifted his/her finger - stop the interval.
                this.stopStepperInterval();
            },
            
            /**
             * @see mstrmojo._TouchGestures
             */
            touchTap: function touchTap(touch) {
                this.processEvent(touch.target);
            },
            
            postBuildRendering: function(){
                this._super();
                
                this.nextNode.ontouchstart = this.prevNode.ontouchstart = function(e){
                    mstrmojo.css.addClass(e.target, 'glow');
                };
                
                this.nextNode.ontouchend = this.prevNode.ontouchend = function(e){
                    mstrmojo.css.removeClass(e.target, 'glow');
                };
            }
        }
    );
    
    //The mobile device triggers a copy text and then in turn does not trigger onmouseup. Do in do not want to attach mousedown and mouseup events. 
    //(Is there a better way to do this?)
    mstrmojo.ui.MobileStepper.prototype.markupString = mstrmojo.ui.MobileStepper.prototype.markupString.replace(',mousedown,mouseup', '');
}());