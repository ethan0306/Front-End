(function() {
    
    mstrmojo.requiresCls("mstrmojo.Container",
                         "mstrmojo.prompt.MobilePromptSummary",
                         "mstrmojo._HasLayout",
                         "mstrmojo.css");
                         
	mstrmojo.requiresDescs(3649,3650);                         
    
    var $100 = '100%',
        $CSS = mstrmojo.css;

    /**
     * Prompt summary screen for the Android Application.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    var $APV = mstrmojo.prompt.AndroidPromptsView = mstrmojo.declare(
        // super class
        mstrmojo.Container,
        
        // mixin
        [ mstrmojo._HasLayout ],
    
        /**
         * @lends mstrmojo.prompt.AndroidPromptsView.prototype
         */
        {
            scriptClass: 'mstrmojo.prompt.AndroidPromptsView',
            
            markupString: '<div id="{@id}" class="mstrmojo-Prompts {@cssClass}" style="{@cssText}">' +
                              '<div class="summary"></div>' +
                              '<div class="command"></div>' +
                          '</div>',
                          
            markupSlots: {
                summaryNode: function () { return this.domNode.firstChild; }, 
                cmdNode: function () { return this.domNode.lastChild; } 
            },
            
            layoutConfig: {
                h: {
                    summaryNode: $100,
                    cmdNode: '80px'
                },
                w: {
                    summaryNode: $100,
                    cmdNode: $100
                }
            },
            
            /**
             * Overriding this property such that it tells the main view that the Android Settings View only supports the Home menu option.
             * 
             * @see mstrmojo.AndroidMainView
             */
            supportedDefaultMenus: 1,
    
            children : [{
                scriptClass : 'mstrmojo.prompt.MobilePromptSummary',
                slot: 'summaryNode',
                alias : 'promptList'
            }, {
                scriptClass : 'mstrmojo.Button',
                slot: 'cmdNode',
                alias : 'OKButton',
                ignoreLayout: true,
                onclick : function() {
                    this.parent.controller.answerPrompts();
                },
                ontouchstart : function(evt) {
                    $CSS.addClass(this.domNode, "glow");
                },
                ontouchend : function(evt){
                    $CSS.removeClass(this.domNode, "glow");
                    this.onclick(evt);
                }
            }],
            
            /**
             * Overidden to initialize prompts.
             * 
             * @ignore
             */
            init: function init (props) {
                this._super(props);
                
                // Do we have prompts?
                var prompts = this.prompts,
                    supportedPrompts = this.supportedPrompts;
                if (prompts && supportedPrompts) {
                    // Set button text based on host sub type.
                    this.OKButton.set('text', (prompts.host.st === 14081) ? mstrmojo.desc(3650, 'Run Document') : mstrmojo.desc(3649, 'Run Report'));
                    
                    // Add items to the prompt list widget.
                    this.promptList.set('items', supportedPrompts);
                }
            }
        }
    );
    
    // Register this class to have the height of the cmdNode layout changed for DPI.
    mstrmojo.DPIManager.registerClass($APV, 'h', 'cmdNode', 50, 120);
}());