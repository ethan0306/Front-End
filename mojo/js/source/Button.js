(function(){

    mstrmojo.requiresCls("mstrmojo.Widget",
                         "mstrmojo.dom",
                         "mstrmojo.css");
    
    var $DOM = mstrmojo.dom,
        $CSS = mstrmojo.css;

    /**
     * <p>A button that can hold an image or text.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.Button = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.Button.prototype
         */
        {
            scriptClass: 'mstrmojo.Button',
            
            /**
             * An optional second CSS class that will be added to the domNode "class" attribute.
             * Typically used for setting an icon for the Button.
             * 
             * @type String
             */
            iconClass: '',
            
            /**
             * The tooltip for this button.
             * 
             * @type String
             */
            title: '',
            
            /**
             * An optional text to appear in the button.
             * 
             * @type String
             */
            text: '&nbsp;',
            
            /**
             * Whether the button is enabled.
             * 
             * @type Boolean
             */
            enabled: true,
            
            /**
             * Whether the button is selected.
             * 
             * @type Boolean
             */
            selected: false,
            
            /**
             * css display property value used when widget is visible
             * @type String
             */            
            cssDisplay: 'block',
            
            /**
             * @ignore
             */
            markupString: '<div id="{@id}" class="mstrmojo-Button {@cssClass} {@iconClass}" title="{@title}" style="{@cssText}" mstrAttach:touchstart,click,mousedown,mouseup>' + 
                            '<div class="mstrmojo-Button-text"></div>' + 
                          '</div>',

            /**
             * @ignore
             */
            markupSlots: {
                textNode: function(){ return this.domNode.firstChild; }
            },

            /**
             * @ignore
             */
            markupMethods: {
                onvisibleChange: function() { this.domNode.style.display = this.visible ? this.cssDisplay : 'none'; },
                onenabledChange: function() { 
                    $CSS[this.enabled ? 'removeClass' : 'addClass'](this.domNode, ['disabled']);
                },
                onselectedChange: function() {
                    $CSS[this.selected ? 'addClass' : 'removeClass'](this.domNode, ['selected']);
                },
                ontextChange: function() {
                    this.textNode.innerHTML = this.text;
                },
                onwidthChange: function() { var w = this.width; if (w) { this.domNode.style.width = w; }}
            },
            
            /**
             * Called when the button is clicked.
             */
            onclick: mstrmojo.emptyFn,
            
            ontouchend: function ontouchend(evt) {
                this.onclick(evt);
            }
        }
    );
    
    /**
     * Helper function to create icon button configuration objects.
     * 
     * @param {String} t The tooltip text to display in the button.
     * @param {String} c The css class(es) used to display the button image.
     * @param {Function} fn The function to execute when the button is clicked.
     * @param {Object} [b] An optional collection of bindings for this button.
     * @param {Object} [ps] An option collection of properties to be added to the button config.
     * 
     * @returns {Object} The button config.
     * 
     * @static
     */
    mstrmojo.Button.newIconButton = function (t, c, fn, b, ps) {
        // Create the button config.
        var btn = {
            scriptClass: 'mstrmojo.Button',
            title: t,
            cssClass: c,
            text: '',
            onclick: fn
        };
        
        // Are there bindings?
        if (b) {
            // Add the bindings.
            btn.bindings = b;
        }
        
        // copy extra properties
        mstrmojo.hash.copy(ps, btn);
        
        return btn;
    };
    
    /**
     * Helper function to create an interactive text button.
     * 
     * @param {String} t The text to appear in the button.
     * @param {Function} [fn] An optional function to execute when the button is clicked.
     * @param {String} [haloColor] The color to use a the active halo
     * @param {Object} [ps] An optional collection of properties to add to the button.
     * 
     * @return {Object} The button configuration object.
     */
    mstrmojo.Button.newInteractiveButton = function (t, fn, haloColor, ps) {
        // Create base button config.
        var btn = {
            scriptClass: 'mstrmojo.Button',
            cssClass: 'mstrmojo-InteractiveButton',
            text: t
        };
        
        // Do we have an onclick function?
        if (fn) {
            btn.onclick = fn;
        }
        
        // Should the buttons use halo?
        if (haloColor && ($DOM.isFF || $DOM.isWK)) {
            // Add the mousedown and mouseup to apply halo.
            mstrmojo.hash.copy({
                onmousedown: function () {
                    $CSS.applyShadow(this.domNode, 0, 0, 10, haloColor);
                },
                onmouseup: function() {
                    $CSS.removeShadow(this.domNode);
                }
            }, btn);
        }
        
        // Copy extra properties.
        mstrmojo.hash.copy(ps, btn);
        
        return btn;
    };
    
    /**
     * Creates an interactive button that will glow when on mouse down 
     * @param {String} t The text to appear in the button.
     * @param {Function} [fn] An optional function to execute when the button is clicked.
     * @param {Object} [ps] An optional collection of properties to add to the button.
     * 
     * @return {Object} The button configuration object.
     * */
    mstrmojo.Button.newAndroidButton = function(t,fn,ps){
        
        var _c = mstrmojo.func.composite,
            ts = function(evt) {
                    $CSS.addClass(this.domNode, "glow");
                },
            te = function(evt){
                    $CSS.removeClass(this.domNode, "glow");
                    this.onclick(evt);
                };
        
        ps = ps || {};
        ps.ontouchstart = _c([(ps.ontouchstart || mstrmojo.emptyFn), ts]); 
        ps.ontouchend = _c([(ps.ontouchend || mstrmojo.emptyFn), te]); 
        
        return mstrmojo.Button.newInteractiveButton(t,fn, null, ps);
    };
        
}());
