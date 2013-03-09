(function(){

    /**
     * Mixin to make any Widget a popup that can be opened or closed.
     * 
     * @class
     * @public
     */    
    mstrmojo._IsPopup = {
    
        /**
         * Is set to true at run-time when open() is called; reset to false when close() is called.
         * 
         * @type Boolean
         */
        visible: false,
        
        /**
         * Handle back to the widget that called this popup's open(). Set at run-time in open(). Reset to null when close() is called.
         * 
         * @type mstrmojo.Widget
         */
        opener: null,
        
        /**
         * Customizable event handlers, called when open() is called.
         * 
         * @type Function
         */
        onOpen: null,

        /**
         * Customizable event handlers, called when close() is called.
         * 
         * @type Function
         */
        onClose: null,
        
        /**
         * <p>Opens this popup, meaning makes it visible, calling its render() method if not already rendered.</p>
         * 
         * <p>The given opener is set as the popup's current "opener" property.  An optional set of properties
         * can be passed in the optional "config" argument; if given, these properties are set on the popup before
         * it is made visible.</p>
         * 
         * @param {mstrmojo.Widget} opener The widget that opened this popup.
         * @param {Object} config
         */
        open: function open(/*Widget*/ opener, /*Object?*/ config) {
            // Apply config props, if any. This will be done with a custom method, if the popup defines one;
            // otherwise, it is done by just setting properties.
            if (this.updatePopupConfig) {
                this.updatePopupConfig(config, opener);
            } else     if (config) {
                for (var k in config) {
                    this.set(k, config[k]);
                }
            }
            // Update the opener. Do this before rendering, because setting the opener may cause
            // the contents to update themselves, and it's more efficient to avoid re-rendering DOM updates.
            this.set('opener', opener);
            if (!this.hasRendered) {
                this.render();
            }
            
            // Customization hook.
            if (this.nudge) {
                this.domNode.style.top = '-10000px';
            }
            
            // Ready to show to the end-user.
            this.set('visible', true);
            
            // Customization hook for positioning the popup.
            if (this.nudge) {
                this.nudge();
            }
            
            // Customization hook.
            if (this.onOpen) {
                this.onOpen();
            }
        },
        
        /**
         * <p>Closes this popup, making it invisible.</p>
         * 
         * <p>The "opener" property is reset to null.</p>
         * @param {Object} config Optional configuration settings that will be passed along to the onClose handler (if any).
         */
        close: function cls(config) {
            // Customization hook; execute it before we lose the handle to opener.
            if (this.onClose) {
                this.onClose(config);
            }

            this.set('visible', false);
            this.set('opener', null);
        }
    };
    
})();