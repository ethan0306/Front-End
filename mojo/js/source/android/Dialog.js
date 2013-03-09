(function () {

    mstrmojo.requiresCls("mstrmojo.android.Popup",
                         "mstrmojo.array",
                         "mstrmojo.android.TextArea",
                         "mstrmojo.dom",
                         "mstrmojo.css");
                         
	mstrmojo.requiresDescs(1442);
    
    var $CSS = mstrmojo.css,
        $ARR = mstrmojo.array;
    
    /**
     * A generic dialog for the Android mobile platform.
     * 
     * @class
     * @extends mstrmojo.android.Popup
     */
    mstrmojo.android.Dialog = mstrmojo.declare(

        mstrmojo.android.Popup,

        null,
        
        /**
         * @lends mstrmojo.android.Dialog.prototype
         */
        {
            scriptClass: "mstrmojo.android.Dialog",
            
            autoClose: false,
            
            init: function init(props) {
                this._super(props);
                
                var css = [ 'dialog' ];
                
                if (this.title) {
                    css.push('has-ttl');
                }
                
                $CSS.addWidgetCssClass(this, css);
            },
            
            /**
             * Add default click handler to all buttons to call close method.
             * 
             * @ignore
             */
            preBuildRendering: function preBuildRendering() {
                // Do we have buttons?
                if (this.buttons) {

                    // Create default click handler.
                    var ths = this,
                        id = this.id,
                        fn = function () {
                            // Does this button NOT close the editor itself?
                            if (!ths.manualClose) {
                                // Close the editor. 
                            	window.setTimeout(function() { //#528431
                            		mstrmojo.all[id].close();
                            	}, 50);
                            }
                        };
                    
                    // Iterate buttons.
                    $ARR.forEach(this.buttons, function (btn) {
                        // Store current click function in expando property.
                        btn.origFn = btn.onclick;
                        
                        // Set new click handler.
                        btn.onclick = function (event) {
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
                            //TQMS 513045 Prevent event propagating
                            event.e.stopPropagation();
                            event.e.cancelBubble = true;                        };
                    });
                }
                
                this._super();
            },
            
            resizeDialog: function resizeDialog() {
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
                    
                    // Is there only one button?
                    if (btns.length === 1) {
                        // Change button width to be 70% of available space.
                        buttonWidth = Math.round(availWidth * 0.7);
                        
                        // Change margin to be 15% of available space minus button offset.
                        margin = ((availWidth - buttonWidth) / 2) - btnOffset;
                    }
                    
                    // Iterate buttons...
                    $ARR.forEach(btns, function (btn, idx) {
                        // and assign width.
                        btn.set('width', buttonWidth + 'px');
                        
                        // Is this NOT the last button OR is there only one button?
                        if (idx < buttonCnt - 1 || idx === 0) {
                            // Add margin to right edge of button.
                            btn.domNode.style.marginRight = margin + 'px';
                        }
                    });
                }
            },
            
            createTitleBarButton: function createTitleBarButton(className, fn, title) {
                var bl = document.createElement('div');
                bl.className = className;
                bl.setAttribute('title', title || '');
                bl.onclick = fn;
                
                this.titleNode.appendChild(bl);
            }
        }
    );
    
    // Do we need to override config and alert with complex dialogs?
    if (window.mstrConfig && !window.mstrConfig.simpleDialog) {
        
        function getLabelChild(msg) {
            return [{
                scriptClass: 'mstrmojo.android.TextArea',
                text: msg,
                cssClass : 'mstrmojo-androidAlert',
                isElastic: true
            }];
        }
        
        /**
         * Overrides default {@link mstrmojo.config} method to use mstrmojo.Dialog for displaying a message to the user with a single 'Ok' button.
         * 
         * @param {String} msg The message to display.
         * @param {Function} [fn] An optional function to be executed after the 'Ok' button is clicked.
         * @param {String} [title="MicroStrategy Web"] An optional title for the dialog.
         * 
         * @memberOf mstrmojo
         * @overrides
         */
        mstrmojo.alert = function alrt(msg, fn, title) {
            mstrApp.showDialog({
                
                title: title || "MicroStrategy Mobile",
                buttons: [ mstrmojo.Button.newAndroidButton(mstrmojo.desc(1442, 'OK'), function () {       
                    if (fn) {
                        fn();
                    }
                })],
                children: getLabelChild(msg)
            });
            
        };
        
        /**
         * Overrides default {@link mstrmojo.config} method to use mstrmojo.Dialog for displaying a message to the user with configurable buttons.
         * 
         * @param {String} msg The message to display.
         * @param {Object[]|mstrmojo.Button[]} buttons An array of type {@link mstrmojo.Button} or an array of configuration objects that will become {@link mstrmojo.Button} when inserted.
         * @param {String} [title="MicroStrategy Web"] An optional title for the dialog.
         * 
         * @memberOf mstrmojo
         * @overrides
         */
        mstrmojo.confirm = function confirm(msg, buttons, title) {
            // Show the dialog.
            mstrApp.showDialog({
                title: title || 'MicroStrategy Mobile',
                buttons: buttons,
                children: getLabelChild(msg)
            });
        };
    }
}());