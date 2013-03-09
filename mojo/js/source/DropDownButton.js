(function(){

    mstrmojo.requiresCls("mstrmojo.func", "mstrmojo.Container", "mstrmojo._HasPopup");
    
    /**
     * Utility function for positioning the popup.
     * 
     * @private
     * @memberOf mstrmojo.DropDownButton
     */
    var fnPositionPopup = function() {
        var ddb = this.opener;
        
        // Should the popup appear above the DropDownButton?
        if (ddb.direction.toLowerCase() === 'up') {
            this.domNode.style.top = -ddb.domNode.offsetHeight + 'px';
        }
    };

    /**
     * <p>A button with an icon (or text) on the left and an arrow on the right.  When the arrow is clicked a popup will be displayed</p>
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._HasPopup#openPopup as #openPopup
     * @borrows mstrmojo._HasPopup#closePopup as #closePopup
     */
    mstrmojo.DropDownButton = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins
        [mstrmojo._HasPopup],
        
        /**
         * @lends mstrmojo.DropDown.prototype
         */
        {
            scriptClass: "mstrmojo.DropDownButton",
                        
            /**
             * The height (in pixels) of the button.
             * 
             * @type String
             */
            height: '19px',
            
            /**
             * <p>Optional text to appear next to the drop down arrow.</p>
             * 
             *  @type String
             */
            text: '',
            
            /**
             * <p>Dictates the direction of the arrow and popup.  Possible values are 'down' and 'up'.</p>
             * 
             * @type String
             */
            direction: 'down',
            
            enabled: true,
            
            title : '',
            
            markupString: '<div id="{@id}" class="mstrmojo-DropDownButton {@cssClass} {@direction}" style="{@cssText}">' +
                            '<div class="mstrmojo-DropDownButton-boxNode {@cssClass}-boxNode" title="{@title}" mstrAttach:mousedown>' +
                                '<div class="mstrmojo-DropDownButton-iconNode {@cssClass}-iconNode">{@text}</div>' +
                            '</div>' +
                            '<div class="mstrmojo-DropDownButton-popupNode {@cssClass}-popupNode"></div>' +
                        '</div>',
            
            markupSlots: {
                boxNode: function() { return this.domNode.firstChild; },
                iconNode: function() { return this.domNode.firstChild.firstChild;},
                popupNode: function() { return this.domNode.lastChild; }
            },

            markupMethods: {
                onheightChange: function() { this.boxNode.style.height = this.height || ''; },
                ontextChange: function() { this.iconNode.innerHTML = this.text;},   
                ontitleChange: function(){ this.boxNode.title = this.title;},
                onenabledChange: function(){ 
                    mstrmojo.css[this.enabled ? 'removeClass' : 'addClass'](this.domNode, ['disabled']);
                },
                onvisibleChange: function(){
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
            
            /**
             * Composites the nudge method of the popupRef to correctly position the popup.
             * 
             * @ignore
             */
            preBuildRendering: function preBuildRendering() {
                if (this._super) {
                    this._super();
                }
                
                // Is there a popupRef and does it have an onOpen method?
                var pr = this.popupRef;
                if (pr) {
                    // Is there already an 'onOpen' method?
                    if (pr.nudge) {
                        // Yes, then wrap the onOpen method with our own method.
                        pr.nudge = mstrmojo.func.composite([ pr.nudge, fnPositionPopup ]);
                    } else if (this.direction.toLowerCase() !== 'down') {
                        // No, then use our own method.
                        pr.nudge = fnPositionPopup;
                    }
                }
            },
            
            /**
             * The popup child in JSON form (not instantiated).
             * 
             * @type Object
             */
            popupRef: null,
            
            
            /**
             * An object that is passed to the openPopup method.
             * 
             * @type Object
             * @refactoring This property doesn't appear to be used.
             */
            popupOpenConfig: null,
            
            /**
             * Need to destroy the popupRef if this is destroyed. 
             * @param {Boolean} skipCleanup whether to skip cleanup of rendering. 
             */
            destroy: function destroy(skipCleanup){
                var pr = this.popupRef;
                if(pr && pr.hasRendered){
                    pr.destroy(false);
                }                   
                if(this._super){
                    this._super(skipCleanup);
                }             
            },
           
            /**
             * <p>Responds to mousedown on the arrow by toggling the popup.</p>
             * 
             * @param {Object} evt A manufactured object representing the event.
             * @param {DomWindow} evt.hWin The window containing the clicked element.
             * @param {DomEvent} evt.e The click event.
             * @private
             */
            premousedown: function premousedown(evt) {
                var p = this._lastOpened;
                if (p && p.visible) {
                    this.closePopup();
                } else {
                    // Use a property-name reference in order to leverage caching.
                    this.openPopup("popupRef", this.popupOpenConfig);
                }
            }
        }
    );

})();