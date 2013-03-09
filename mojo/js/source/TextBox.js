(function() {

    mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo.css");
    
    var _C = mstrmojo.css;

    /**
     * Applies emptyText and emptyClass properties to a given widget.
     * Typically called whenever the widget receives focus or gets its "value" property updated to a non-empty value.
     * @private
     */
    function _hideEmpty(me){
        var el = me.inputNode;
        
        var v = (me.value != null) ? String(me.value) : '';
        
        if (v !== el.value){
            el.value = v;
        }
        if (el.mstrmojoEmpty) {
            _C.removeClass(el, [me.emptyClass]);
            el.mstrmojoEmpty = null;
        }
    }

    /**
     * Applies emptyText and emptyClass properties to a given widget.
     * Typically called whenever the widget loses focus or gets its "value" property updated to a non-empty value.
     * @private
     */
    function _showEmpty(me){
        var el = me.inputNode;
        el.value = me.emptyText || '';
        _C.addClass(el, [me.emptyClass]);
        el.mstrmojoEmpty = true;
    }

    /**
     * Sets the value of the given TextBox widget to match the current value in its inputNode.
     * Typically called from DOM after end-user types into inputNode.
     * @param {mstrmojo.TextBox} me The TextBox widget.
     * @private
     */
    function _dom2value(me) {
        me.readingDom = true; // Lets event handlers know that this event was triggered by DOM.
        me.set("value", me.inputNode.value);
        me.readingDom = false;
    }
    
    var _KEYCODENAME = {
        9: 'Tab',
        13: 'Enter',
            27: 'Esc',
            38: 'ArrowUp',
            40: 'ArrowDown'        
    };

    /**
     * A simple text box control.
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.TextBox = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.TextBox.prototype
         */
        {
            scriptClass: 'mstrmojo.TextBox',
                        
            /**
             * The value to appear in the text box.
             * 
             * @type String
             */
            value: '',
            
            /**
             * The type of the input tag.
             *
             * @type String
             */
            type: 'text',
            
            /**
             * Specifies whether the input is readonly or not.
             *
             * @type Boolean
             */
            readOnly: false,
            
            /**
             * The length of the text box input in characters.
             * 
             * @type Integer
             */
            size: '',
            
            /**
             * The maximum allowed number of characters.
             * 
             * @type Integer
             */
            maxLength: '',
            
            cssDisplay: 'inline',
            
            /**
             * The position of the text box input in tabbing order.
             * 
             * @type Integer
             */
            tabIndex: '',
                        
            // attributes available on INPUT elements in some browsers (e.g. WebKit)
            autoComplete: true,
            autoCorrect: true,
            autoCapitalize: true,

            cssDisplay: 'inline', //'inline' or 'block'

            markupString: '<input id="{@id}" class="mstrmojo-TextBox {@cssClass}"  style="{@cssText}" ' +
                                 'title="{@tooltip}" type="{@type}" ' +
                                 'value="{@value}" size="{@size}" maxlength="{@maxLength}" index="{@tabIndex}"' +
                                 'min="{@min}" max="{@max}"' +
                                 ' mstrAttach:focus,keyup,blur,paste,cut,input ' +                              
                              '/>',
                          
            markupSlots: {
                inputNode: function(){ return this.domNode; }
            },
            
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? this.cssDisplay : 'none'; },
                oncssClassChange: function(){ this.inputNode.className = "mstrmojo-TextBox " + (this.cssClass||'');},
                onenabledChange: function(){ 
                    this.inputNode.disabled = !this.enabled;
                    mstrmojo.css.toggleClass(this.inputNode, 'disabled', !this.enabled);
                },
                onvalueChange: function(){
                    // Update the DOM value.
                    var v = this.value,
                        em = (v === null) || (v === "");
                    
                    // Toggle the empty styling as needed.
                    if (em) {
                        // If the inputNode has focus currently, dont show the empty value yet.
                        // Wait for the blur handler to do it.
                        if (!this.hasFocus) {
                            _showEmpty(this);
                        } else {
                            this.inputNode.value = "";
                        }
                    } else {
                        _hideEmpty(this);
                    }
                },
                ontooltipChange: function(){
                    this.domNode.title = this.tooltip;
                },
                onreadOnlyChange: function() { this.inputNode.readOnly = this.readOnly; }
            },
                        
            /**
             * <p>Optional text to display when TextBox's value is empty string or null.</p>
             *
             * <p>The text disappears (temporarily) when the end-user gives the TextBox focus, and
             * then reappears when the end-user leaves the TextBox if the TextBox is empty.</p>
             */
            emptyText: '',     
            
            /**
             * Optional CSS class name to be temporarily appended to TextBox's inputNode whenever
             * emptyText is displayed.
             */
            emptyClass: 'mstrmojo-empty',

            postBuildRendering: function() {
                if ( this._super ) { 
                    this._super();
                }
                
                // set auto correction, etc. attributes on the input element
                var e = this.inputNode;                
                e.setAttribute("autocomplete", this.autoComplete ? "on" : "off" );
                e.setAttribute("autocorrect", this.autoCorrect ? "on" : "off" );
                e.setAttribute("autocapitalize", this.autoCapitalize ? "on" : "off" );
            },

            focus: function fc(){
                this.inputNode.focus();
            },
            
            /**
             * Responds to inputNode getting focus by clearing emptyText, if shown.
             */
            prefocus: function pf(evt){
                this.hasFocus = true;
                // Remove the empty styling, if any.
                _hideEmpty(this);
            },

            /**
             * Handler blur events by updating the widget's "value" property to the DOM's input,
             * and then applying emptyText if the widget's "value" property is empty.
             */
            preblur: function pb(evt){
            	window.setTimeout(function() {
            		// do nothing just a hack for issue #528431
            	}, 200);
                this.hasFocus = false;
                _dom2value(this);
                var v = this.value;
                if ((v === null || v === "") && this.emptyText){
                    // Apply the empty styling.
                    _showEmpty(this);
                }
            },
            
            /**
             * Handles key up events for the inputNode. 
             * @private
             */
            prekeyup: function pku(evt) {
                // Do we have an onenter method and did the user hit the enter key?
                var hWin = evt.hWin,
                    e = evt.e || hWin.event;
                
                _dom2value(this); // set value to match the domNode.value
                var n = _KEYCODENAME[e.keyCode];
                if (this['on'+n]) {
                    this['on'+n](evt);
                }
            },
            
            /**
             * Handles paste events for the inputNode. 
             * @private
             */
            prepaste: function ppst(evt) {
                this.delaySetValue(this);
            },
            
            /**
             * Handles precut events for the inputNode. 
             * @private
             */
            precut: function pct(evt) {
                this.delaySetValue(this);
            },
            
            /**
             * Delay for a time to sets the value of the given TextBox to match the current value in its inputNode.
             * @private
             */
            delaySetValue: function dgiv(tgt) {
                window.setTimeout(function(){_dom2value(tgt);}, 100);//100ms
            },
            
            /**
             * Puts the TextBox into an error state due to a validation failure.
             * 
             * @param {String} [msg] The error message to display.
             */
            setInvalidState: function setInvalidState(msg) {
                // Add the error class to the dom node.
                mstrmojo.css.addClass(this.inputNode, ['err']);
                
                // Is there a message to display?
                if (msg) {
                    // Put it in the tooltip.
                    this.domNode.setAttribute('title', msg);
                }
            },
            
            /**
             * Cleans up the text box inputs value and validation status.
             */
            cleanUp: function cleanUp() {
                // Clear the value.
                this.inputNode.value = '';
                
                // Make sure the error class is not on the domNode.
                mstrmojo.css.removeClass(this.domNode, ['err']);
                
                // Reset the tooltip.
                this.domNode.setAttribute('title', this.tooltip);
            }
        }
    );
        
})();