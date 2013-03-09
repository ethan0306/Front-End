(function(){

    mstrmojo.requiresCls("mstrmojo.hash");
    
    /**
     * This mixin provides methods for opening and closing a popup widget.
     * 
     * @class
     * @public
     */
    mstrmojo._HasPopup =
    /**
     * @lends mstrmojo._HasPopup#
     */
    {
        
        /**
         * <p>Opens a popup, applying a given (optional) config hashtable of properties.</p>
         * 
         * <p>A reference to the popup is provided, which may be either the ID of a widget, a config for a widget, or a handle to a widget.
         * The widget is assumed to implement the _IsPopup API.</p>
         * 
         * @param {String|Object|Widget} ref
         * @param {Object} [config]
         */
        openPopup: function opP(/*String|Object|Widget*/ ref, /*Object?*/ config) {
            // If the given ref is a string with no periods, it is a property name which
            // holds the popup config.
            var isProp = !!ref && (typeof(ref) === "string") && !ref.match(/\./) && !!this[ref],
                // Resolve the reference to the popup.
                p = mstrmojo.registry.ref(isProp ? this[ref] : ref, true);

            // Did the ref resolve to an object with an open method?
            if (p && p.open) {
                // Dont cache popup handle in this._popup because this widget might support
                // multiple popups.  If we want caching, we have to supply a property name for the ref.
                // The resolve reference to the popup will be cached there.
                if (isProp) {
                    this[ref] = p;
                }
                
                // If the popup has a slot, insert the child into the slot.
                var s = p.slot && this[p.slot];
                if (s) {
                    if (p.parent !== this) {
                        // The popup is not our child already.
                        if (this.addChildren) {
                            // We are a container, so add the popup as our child.
                            // That will ensure that its DOM gets inserted into our slot.
                            this.addChildren(p);
                        } else {
                            // We are not a container, so instead just manually insert the popup's
                            // domNode into our slot.  If the popup has no domNode yet, create a placeholder
                            // node for it in our slot.
                            // Warning: Don't call appendChild if the domNode is already in this slot; it
                            // causes repaint issues, such as resetting scrollTop = 0.
                            var skipCheck = false,
                                el = p.domNode || p.placeholder;
                            if (el && typeof(el) === 'string') {
                                el = document.getElementById(el);
                            }
                            if (!el) {
                                skipCheck = true;
                                el = document.createElement('span');
                                p.placeholder = el;                                
                            }
                            if (skipCheck || (el.parentNode !== s)) {
                                s.appendChild(el);
                            }
                        }
                    }
                }
                p.open(this, config);
                this._lastOpened = p;
            }
        },
        
        /**
         * Closes the currently open popup, if any.
         */
        closePopup: function clP() {
            var p = this._lastOpened;
            if (p && p.visible && p.close) {
                p.close();
                delete this._lastOpened;
            }
        }
    };

})();