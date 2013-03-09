(function() {

    mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo.hash", "mstrmojo.css");
    /**
     * <p>Builds JSON for both checkbox and radio button.</p>
     * 
     * @param css the default css name for the widget
     * @param config The config properties to merge in.
     * 
     * @private
     */
    function _json(css, config){
        return mstrmojo.hash.copy(config, {
            // General input type HTML  properties
            /**
             * The text to appear in the label.
             * 
             * @type String
             */
            label: '',
            
            
            /**
             * The position of the check box input in tabbing order.
             * 
             * @type Integer
             */
            tabIndex: '',
            
            /**
             * The value for css 'display' property. Default value is 'inline'.
             * @type String
             */
            cssDisplay: 'inline',
            
            /**
             * the string to be used in input 'name' attribute
             */
            name: null,
            
            markupString: '<span id="{@id}" class="' + css + ' {@cssClass}" style="{@cssText}" title="{@tooltip}">' +
                            '<input id="{@id}_input"  type="{@type}" name="{@name}" value="{@value}" tabIndex="{@tabIndex}" mstrAttach:click />' + 
                            '<label for="{@id}_input">{@label}</label>' +
                          '</span>',
            markupSlots: {
                inputNode: function(){ return this.domNode.firstChild; }
            },
            
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = (this.visible) ? this.cssDisplay : 'none'; },
                onenabledChange: function(){ 
                    this.inputNode.disabled = !this.enabled;
                    mstrmojo.css[this.enabled? 'removeClass' :  'addClass'](this.domNode, 'disabled');
                },
                oncheckedChange:  function() { this.inputNode.checked = this.checked; } // checkbox/radio specific method
            },
            // checkbox/radio specific properties
            /**
             * <p>Whether the checkbox/radio should appear as checked.</p>
             * 
             * @type Boolean
             */
            checked: false,
            /**
             * <p>Sets checked property according to DOM node.</p>
             * @private
             */
            preclick: function(){
                this.set("checked", this.inputNode.checked);
            },
            /**
             * <p>Whether the current checkbox/radio button is checked.</p>
             * Since Radio button may not update its 'checked' property correctly, this method will returns the real status of the radio button.
             */
            isChecked: function() {
                return this.inputNode.checked;
            }
        });
    }
    

    /**
     * <p>A simple HTML check box control.
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.CheckBox = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.CheckBox.prototype
         */
        _json('mstrmojo-CheckBox', {
                                    scriptClass: 'mstrmojo.CheckBox',
                                    type: 'checkbox'
                                
                                })
    );
    
    /**
     * <p>A IMAGE INPUT control. The Behavior is same as CheckBox but with customized icons as 'checkbox'.</p> 
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.ImageCheckBox = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.CheckBox.prototype
         */
        _json('mstrmojo-CheckBox mstrmojo-ImageCheckBox', {
                                    scriptClass: 'mstrmojo.CheckBox',
                                    type: 'image',
                                    cssDisplay: 'block',
                                    preclick: function(){
                                        this.set("checked", !this.checked);
                                    },
                                    postCreate: function() {
                                        //override the 'oncheckedChange' method:
                                        this.markupMethods = mstrmojo.hash.copy(this.markupMethods);
                                        this.markupMethods.oncheckedChange = function() {
                                            mstrmojo.css.toggleClass(this.inputNode, ['checked'], this.checked);
                                        };
                                    },
                                    postBuildRendering: function() {
                                        this.inputNode.src = this.src || '../images/1ptrans.gif';
                                        if (this._super) {
                                            return this._super();
                                        }  
                                        return true;
                                    }
                                })
    );
    
    
    /**
     * <p>A simple HTML radio button control.
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.RadioButton = mstrmojo.declare(
            // superclass
            mstrmojo.Widget,
            
            // mixins
            null,
            
            /**
             * @lends mstrmojo.RadioButton.prototype
             */
            _json('mstrmojo-RadioButton', {
                                        scriptClass: 'mstrmojo.RadioButton',
                                        type: 'radio',
                                        postBuildRendering: function(){
							            	// In IE, the radio button's checked property must be set AFTER inserting the input into the page.
							                // Otherwise, it will be dropped when the insertion happens.
							            	if (mstrmojo.dom.isIE){ 
							                    this.inputNode.checked = this.checked;
							                }
							            }
                                    })
    );
        
})();