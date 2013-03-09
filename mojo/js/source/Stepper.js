(function () {

    mstrmojo.requiresCls(
        "mstrmojo.Widget"
    );
    
    var HOLD_INTERVAL = 50,
        HOLD_THRESHOLD = 500;
    
    /**
     * Widget to allow the user to step through various lists of items. Items can be either numeric or text. Each stepper needs a 
     * data provider. (See mstrmojo.StepperContentProvider).
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.Stepper = mstrmojo.declare(
        //superclass
        mstrmojo.Widget,
            
        //mixins
        null,
            
        {

            scriptClass: "mstrmojo.Stepper",
            
            /**
             * Denotes the orientation of the stepper.
             * Supported modes are 'horizontal' and 'vertical' 
             * 
             * @type String
             * @default 'vertical'
             */
            orientation: 'vertical',
            
            /**
             * Content provided which feeds the data to the stepper. The stepper will not function without one. 
             */
            provider: null,
            
            /**
             * Stepper title text
             */
            title: '',
            
            markupString:   '<div id="{@id}" class="mstrmojo-Stepper {@orientation} {@cssClass}" mstrAttach:click,mousedown,mouseup,selectstart>' +
                                '<div class="title">{@title}</div>' +
                                '<div class="next">+</div>' +
                                '<div class="text">{@itemHtml}</div>' +
                                '<div class="prev">-</div>' +
                            '</div>',
                            
            markupSlots: {
                titleNode: function() { return this.domNode.firstChild; },
                nextNode: function () { return this.domNode.children[1]; },
                textNode: function () { return this.domNode.children[2]; },
                prevNode: function () { return this.domNode.lastChild; }
            },
            
            /**
             * @see mstrmojo._HasMarkup
             */
            preBuildRendering: function preBuildRendering() {
                //Generate the item's HTML.
                this.itemHtml = this.provider.renderItemAt();
                
                //Call super
                this._super();
            },
            
            /**
             * Handles the click and tap events on the stepper to identify the user action.
             * 
             * @param {mstrmojo.Stepper} stepper The stepper widget
             * @param (HTMLElement} target The targeted dom element from the click or touch event handlers.
             */
            processEvent: function processEvent(target) {
                //Is the targetted node a text node?
                if (target === this.textNode || target === this.titleNode) {
                    //TODO: We need to make the stepper's text node an input node.
                    return;
                }
                
                var provider = this.provider,
                    mthd = ((target === this.nextNode) ? 'Next' : 'Prev');

                //Check if the stepper's data provider has a next or previous value for it ?
                if (provider['has' + mthd]()) {
                    //Ask the provider for the next or previous value.
                    provider[mthd.toLowerCase()]();
                    
                    //Update the text node to reflect the new value.
                    this.updateDisplayText();
                }
            },
            
            /**
             * Update the display text of the Stepper
             */
            updateDisplayText: function updateDisplayText(){
                this.textNode.innerHTML = this.provider.renderItemAt();
            },
            
            /**
             * Starts an interval so that the stepper can keep updating itself infinitely (until the timer is cancelled)
             * 
             * @param fn The function to call each time hte interval is fired.
             * @param evt The event handler's event object.
             */
            startStepperInterval: function startStepperInterval(evt, fn) {
                var me = this;
                //Start an interval to keep updating the stepper while holding
                this._holdTimer = setInterval(function () {
                    //Call the respective function on the stepper. 
                    me[fn](evt);
                }, HOLD_INTERVAL);
            },
            
            /**
             * Stops the interval so as to stop updating the stepper.
             */
            stopStepperInterval: function stopStepperInterval() {
                //Is the hold interval already firing? Then we need to clear the interval.
                if (this._holdTimer) {
                    clearInterval(this._holdTimer);
                    delete this._holdTimer;
                }
            },
            
            /**
             * Event listener for mouse onclick events.
             */
            onclick: function onclick(evt) {
                this.processEvent(evt.e.target);
            },
    
            /**
             * starts a timer to call onclick periodically until onmouseup
             */
            onmousedown: function onmousedown(evt) {
                //Are we already in hold status? (This should not happen - the user should not already be in hold status and click again)
                if (!this._holdTimer && !this._startHoldTimer) {
                    var me = this;
                    
                    this._startHoldTimer = setTimeout(function () {
                        //Delete any lingering timeout ids.
                        delete me._startHoldTimer; 
                        
                        //Start the stepper interval.
                        me.startStepperInterval(evt, 'onclick');
                        
                    }, HOLD_THRESHOLD);
                }
            },
            
            /**
             * On mouse up event listener.
             */
            onmouseup: function onmouseup() {
                //Have we created a hold calculation timer? Then we need to clear the timeout.
                if (this._startHoldTimer) {
                    clearTimeout(this._startHoldTimer);
                    delete this._startHoldTimer;
                }
                
                //Stop the stepper interval.
                this.stopStepperInterval(this);
            },
            
            /**
             * On select start event listener. We don't want the user to be able to select.
             */
            onselectstart: function onselectstart() {
                return false;
            }
        }
    );
}());