(function () {

    mstrmojo.requiresCls("mstrmojo.Container", 
                         "mstrmojo.func",
                         "mstrmojo.array",
                         "mstrmojo.Button",
                         "mstrmojo.HBox",
                         "mstrmojo.dom");
    
    var $FNC = mstrmojo.func.composite,
        $D = mstrmojo.dom;
    
    
    /**
     * Function to resize the curtain when the editor is attached to body. 
     * 
     * @param {HTMLElement} w the dialog widget.
     * 
     * @private
     */
    function resizeCurtain(w) {
        var curtainNode = w.curtainNode,
        	body = document.body,
            docElement = document.documentElement,
            windowDimensions = $D.windowDim(),
            cs = curtainNode.style;
        
        // Set width and height.
        cs.width = Math.max(windowDimensions.w, Math.max(body.clientWidth, docElement.scrollWidth)) + 'px';
        cs.height = Math.max(windowDimensions.h, Math.max(body.clientHeight, docElement.scrollHeight)) + 'px';  
        w.raiseEvent({name: 'resizeCurtain'});
    }
    
    /**
     * Dialog is a modal dialog that has title bar, a collection of buttons and can contain other controls within it.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.Dialog = mstrmojo.declare(

        mstrmojo.Container,

        null,
        
        /**
         * @lends mstrmojo.Dialog.prototype
         */
        {
            scriptClass: "mstrmojo.Dialog",
            
            /**
             * An optional title for the dialog.
             * 
             * @type String
             */
            title: '',
            
            /**
             * An optional array of {@link mstrmojo.Button} configuration objects.
             * 
             * @type Object[]
             */
            buttons: null,
            
            /**
             * Alignment of the dialog. Default to center. can also be 'top', 'left', 'right', 'bottom'
             */
            alignment: 'center',
            
            /**
             * <p>The alignment of the buttons.</p>
             * 
             * <p>Possible values are "left" (default) or "right".</p>
             * 
             * @type String
             */
            btnAlignment: 'right',
            
            /**
             * The zIndex used by this popup. 
             * In general, if this is a modal popup, the curtain used by this popup would be 1 less than zIndex here.
             */
            zIndex: 10,   
            
            /**
             * Indicate whether the editor is modal or modalless.
             */
            modal: true,

            markupString: '<div id="{@id}" class="mstrmojo-Dialog {@cssClass}" tabindex="0" mstrAttach:click>' +
                              '<div class="win mstrmojo-Editor" style="{@cssText}">' +
                                  '<div class="mstrmojo-Editor-titlebar"><div class="mstrmojo-Editor-title">{@title}</div></div>' +
                                  '<div class="mstrmojo-Editor-content"></div>' + 
                                  '<div class="mstrmojo-Editor-buttons"></div>' +
                              '</div>' +
                              '<div class="mstrmojo-Editor-curtain"></div>' + 
                              '<div class="mstrmojo-Editor-tip"></div>' +
                          '</div>',
            
            markupSlots: {
                editorNode: function () { return this.domNode.firstChild; },
                curtainNode: function () { return this.domNode.childNodes[1]; },
                titleNode: function () { return this.domNode.firstChild.firstChild; },
                containerNode: function () { return this.domNode.firstChild.childNodes[1]; },
                buttonNode: function () { return this.domNode.firstChild.lastChild; },
                tipNode: function () { return this.domNode.lastChild; }
            },
            
            markupMethods: {
                onzIndexChange: function () {
                    this.editorNode.style.zIndex = this.zIndex;
                    this.curtainNode.style.zIndex = this.zIndex - 1;
                },
                onwidthChange: function () { 
                    this.editorNode.style.width = this.width || 'auto'; 
                },
                onvisibleChange: function (init) {
                    if (init) {
                        return;
                    }
                    
                    var v = this.visible,
                        d = (v) ? 'block' : 'none';
                    
                    this.editorNode.style.display = d;
                    
                    if (this.modal) {
                        this.curtainNode.style.display = d;   
                    }
                },
                onleftChange: function () { this.editorNode.style.left = this.left || ''; },
                ontopChange: function () { this.editorNode.style.top = this.top || ''; }
            },
            
            preBuildRendering: function preBuildRendering() {
                var b;
                
                // Do we have buttons?
                if (this.buttons) {
                    
                    //Add needed base cssclass
                    for (b in this.buttons) {
                        this.buttons[b].cssClass = 'mstrmojo-Editor-button';
                    }

                    // An an HBox with the buttons as children.
                    this.addChildren([{
                        scriptClass: 'mstrmojo.HBox',
                        cssText: 'float:' + this.btnAlignment,
                        slot: 'buttonNode',
                        alias: 'btnHbox',
                        children: this.buttons
                    }, {
                        scriptClass: 'mstrmojo.Label',
                        cssClass: 'mstrmojo-clearMe',
                        slot: 'buttonNode'
                    }]);
                }
                
                // Is this a modal editor?
                if (this.modal) {
                    // Add 'modal' css class.
                    this.cssClass += ' modal';
                }
                
                // Call the super.
                return this._super();
            },
            
            buildRendering: function buildRendering() {
                // Get a reference to the placeholder (since it will be blown away in the _super).
                var ph = this.placeholder;
                
                // Call super.
                if (this._super()) {
                    // Do we not have a parent and did we not have a placeholder?
                    if (!this.parent && !ph) {
                        // Insert the domNode as a child of the body tag.
                        document.body.appendChild(this.domNode);
                    }
                    return true;
                }
                
                return false;
            },
            
            postBuildRendering: function postBuildRendering() {
                this._super();
                
                // Is the dialog model?
                if (this.modal && this.visible) {
                    // Change curtainNode style to block.
                    this.curtainNode.style.display = 'block';
                }
                
                // Do we NOT have a resize handler yet?
                if (!this._resizeHandler) {
                    // Create handler function.
                    var id = this.id,
                        fn = this._resizeHandler = function () {
                            // Resize and position dialog.
                            var dialog = mstrmojo.all[id];
                            dialog.resizeDialog();
                            dialog.positionDialog();
                        };
                    
                    // Attach event listener to window object to hear when window size changes.
                    $D.attachEvent(window, 'resize', fn);
                }
                
                // Call the resize handler to resize and position dialog.
                this._resizeHandler();
                
                //#576707 - take focus to avoid key event being received by document
                this.domNode.focus();
                
                return true;
            },
            
            /**
             * Called during rendering (and after window resizing) to adjust the size of the dialog.
             * 
             */
            resizeDialog: function resizeDialog() {
                // Is the dialog modal?
                if (this.modal) {
                    // Resize the curtain.
                    resizeCurtain(this);
                }
            },
            
            /**
             * Called during rendering (and after window resizing) to position the dialog.
             * 
             */
            positionDialog: function positionDialog() {
                // Is the editor not positioned?
                if (!this.left || !this.top) {
                    var editor = this.editorNode;
                    
                    // Center the editor node within browser.
                    $D.center(editor);
                    
                    // Should the editor be aligned with the top?
                    if (this.alignment === 'top') {
                        // Move editor node to top.
                        editor.style.top = '10px';
                    }
                }
            },
            
            destroy: function (ignoreDom) {
                // Do we have a window resize handler?
                var fn = this._resizeHandler; 
                if (fn) {
                    // Detach the handler.
                    $D.detachEvent(window, 'resize', fn);
                } 
                
                this._super(ignoreDom);
            }
        }
    );

    // Do we need to override config and alert with complex dialogs?
    if (window.mstrConfig && !window.mstrConfig.simpleDialog) {
        
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
            var id = 'mojoConfirmx9',
                fnDestroy = function () {
                    mstrmojo.all[id].destroy();
                };
                
            // Add code to each button to destroy the dialog.
            mstrmojo.array.forEach(buttons, function (btn) {
                var fn = btn.onclick;
                btn.onclick = (fn) ? $FNC([ fnDestroy, fn ]) : fnDestroy;
            });
            
            // Show the dialog.
            mstrmojo.insert({
                scriptClass: 'mstrmojo.Dialog',
                id: id,
                title: title || mstrmojo.desc(3610),
                width: '475px',
                buttons: buttons,
                children: [{
                    scriptClass: 'mstrmojo.Label',
                    text: msg
                }]
            }).render();
        };
        
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
            
            var id = 'mojoAlertx9';
            
            try {
                // There are some scenarios where the alert is being rendered twice 
                // and causing an error on id duplication, try to destroy it first.
                mstrmojo.all[id].destroy();
            } catch (e) { }
            
            mstrmojo.insert({
                scriptClass: 'mstrmojo.Dialog',
                id: id,
                title: title || mstrmojo.desc(3610),     // MicroStrategy Web
                width: '475px',
                buttons: [ mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), function () {       // OK
                    mstrmojo.all.mojoAlertx9.destroy();
                    if (fn) {
                        fn();
                    }
                }, '#666666')],
                children: [{
                    scriptClass: 'mstrmojo.Label',
                    text: msg
                }]
            }).render();
        };
    }
        
}());