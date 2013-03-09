(function() {

    mstrmojo.requiresCls("mstrmojo.Dialog",
                         "mstrmojo.array",
                         "mstrmojo.func",
                         "mstrmojo.dom",
                         "mstrmojo.css");
    
    var $CSS = mstrmojo.css;
    
    /**
     * MobileDialog is an extension of {@link mstrmojo.Dialog} designed for the Mobile platform.

     * 
     * @class
     * @extends mstrmojo.Dialog
     */
    mstrmojo.MobileDialog = mstrmojo.declare(

        mstrmojo.Dialog,

        null,
        
        /**
         * @lends mstrmojo.MobileDialog.prototype
         */
        {
            scriptClass: "mstrmojo.MobileDialog",
            
            /**
             * Overridden to calculate width and max-height based on screen dimensions. 
             * 
             * @ignore
             */
            init: function init(props) {
                var app = mstrApp,
                    dimensions = app.getScreenDimensions(),
                    cssText = props.cssText || '';
                
                // Calculate width and max-height and add to passed in props.
                props.width = (dimensions.w - 30) + 'px';
                props.cssText = cssText + 'max-height:' + Math.round(dimensions.h * 0.9) + 'px;';

                // Call super to initialize.
                this._super(props);
            },

            /**
             * Add default click handler to all buttons to call close method.
             * 
             * @ignore
             */
            preBuildRendering: function preBuildRendering() {
                // Do we not have a title?
                if (!this.title) {
                    $CSS.addWidgetCssClass(this, 'no-ttl');
                }
                
                // Do we have buttons?
                if (this.buttons) {

                    // Create default click handler.
                    var id = this.id,
                        fn = function () {
                            // Does this button NOT close the editor itself?
                            if (!this.manualClose) {
                                // Close the editor.
                                mstrmojo.all[id].close();
                            }
                        };
                    
                    // Iterate buttons.
                    for (var b in this.buttons) {
                        // Store current click function in expando property.
                        var btn = this.buttons[b];
                        btn.origFn = btn.onclick;
                        
                        // Set new click handler.
                        btn.onclick = function() {
                            // Does this button have an original click handler?
                            if (this.origFn) {
                                // Call it, and test the result.  Does it return EXACTLY false?
                                if (this.origFn() === false) {
                                    // Exit without closing dialog.
                                    return;
                                }
                            }
                            
                            // Call common close function.
                            fn();
                        };
                    }
                }
                
                this._super();
            },
            
            postBuildRendering: function postBuildRendering() {
                // Call super to make sure editor and buttons are rendered first.
                this._super();
                
                // Do we have buttons?
                var buttonCnt = this.buttons && this.buttons.length;
                if (buttonCnt) {
                    // Get computed styles for both slot and first button.
                    var buttonNode = this.buttonNode,
                        btns = this.btnHbox.children,
                        $CS = $CSS.getComputedStyle,
                        slotStyle = $CS(buttonNode),
                        btnStyle = $CS(btns[0].domNode),
                        margin = 10;
                    
                    // Calculate available width for buttons, amount of button devoted to padding and border, and final button width.
                    var availWidth = buttonNode.clientWidth - parseInt(slotStyle.paddingLeft, 10) - parseInt(slotStyle.paddingRight, 10),
                        btnOffset = parseInt(btnStyle.paddingLeft, 10) + parseInt(btnStyle.paddingRight, 10) + parseInt(btnStyle.borderLeftWidth, 10) + parseInt(btnStyle.borderRightWidth, 10),
                        buttonWidth = Math.floor((availWidth - (buttonCnt * btnOffset) - ((buttonCnt - 1) * margin)) / buttonCnt);
                    
                    // Iterate buttons...
                    mstrmojo.array.forEach(btns, function (btn, idx) {
                        // and assign width.
                        btn.set('width', buttonWidth + 'px');
                        
                        // Is this NOT the last button?
                        if (idx < buttonCnt - 1) {
                            // Add margin to right edge of button.
                            btn.domNode.style.marginRight = margin + 'px';
                        }
                    });
                }
                
                // Calculate the max available space for the editor content (editor node inner size minus title node outer size and button node outer size).
                var availableContentSpace = this.editorNode.clientHeight - this.titleNode.offsetHeight - this.buttonNode.offsetHeight;
                
                // Is the container node height greater than the available content height?
                if (this.containerNode.offsetHeight > availableContentSpace) {
                    // Iterate children...
                    mstrmojo.array.forEach(this.children, function (child) {
                        // Grab the slot.
                        var slot = child.slot;
                        
                        // Is this child in teh containerNode?
                        if (!slot || slot === 'containerNode') {
                            // Set height of child to available content height.
                            child.set('height', availableContentSpace + 'px');
                        }
                    });
                }
                
            },
            
            close: function close() {
                // Do we have a custom close handler?
                if (this.onClose) {
                    // Call the custom hook.
                    this.onClose();
                }
                
                // Attach one time event to destroy dialog after it closes - only if we are still rendered
                var domNode = this.domNode;
                if (domNode) {
                    var id = this.id;
                    mstrmojo.dom.attachOneTimeEvent(domNode, 'webkitTransitionEnd', function() { 
                        mstrmojo.all[id].destroy();
                    });
                        
                    // Fade the dialog.
                    domNode.style.opacity = 0;
                }
            }
        }
    );
})();