(function () {

    mstrmojo.requiresCls("mstrmojo.EnumReadystate");

    var $READYSTATE = mstrmojo.EnumReadystate;

    /**
     * The number of milliseconds to delay the wait icon.
     *
     * @private
     * @ignore
     */
    var DELAY = 1200;

    /**
     * Hides or Shows the wait icon.
     *
     * @param {Boolean} v True to display wait icon, False to hide it.
     * @param {HTMLElement} [w] The element to hide/show.  If undefined, the function will exit.
     *
     * @private
     * @ignore
     */
    var fnToggle = function (v, w) {
        if (w) {
            w.style.display = (v) ? 'block' : 'none';
        }
    };

    /**
     * <p>A mixin for {@link mstrmojo.Container}s that wish to contain a progress/wait icon.</p>
     *
     * @class
     * @public
     */
    mstrmojo._HasWaitIcon =
        /**
         * @lends mstrmojo._HasWaitIcon#
         */
        {
            /**
             * Holds a handle to the wait icon timeout.
             *
             * @private
             */
            waitHandle: null,

            /**
             * Extends the postBuildRendering method so that, after rendering, this widget will listens for
             * readyState changes and displays/hides the wait icon as needed.
             *
             * @see mstrmojo.Model
             * @ignore
             */
            postBuildRendering: function pstBldRndr() {
                // Attach an event listener to hear when the readyState of the definition node changes.
                if (!this._rsl) {
                    var id = this.id;
                    this._rsl = this.defn.attachEventListener('readyStateChange', id, function (evt) {
                        // Has the widget NOT been rendered?
                        if (!this.hasRendered) {
                            // TQMS #541318: Exit, since we don't need to show any state
                            return;
                        }

                        switch (evt.value) {
                        case $READYSTATE.WAITING:
                            // Do we not already have a wait icon?
                            if (!this.waitIcon) {
                                // Create the element.
                                var icon = document.createElement('div');
                                icon.className = 'mojo-overlay-wait'; // use 'mojo-inline-wait for single icon at 15.15 with no overlay.

                                // Add divs to hold overlay and centered icon.
                                icon.innerHTML = '<div class="overlay"></div><div class="icon"></div>';

                                // Append to widget DOM node.
                                this.domNode.appendChild(icon);

                                // Stick it in a slot so it will be cleaned up later.
                                this.addSlots({
                                    waitIcon: icon
                                });
                            }

                            // Cache the wait icon.
                            var wi = this.waitIcon;

                            // Should we delay the appearance of the wait icon?
                            if (DELAY) {
                                // Set handle to timeout function.
                                this.waitHandle = window.setTimeout(function () {
                                    // Clear the timeout handle.
                                    mstrmojo.all[id].waitHandle = null;

                                    // Display the wait icon.
                                    fnToggle(true, wi);
                                }, DELAY);

                            } else {
                                // Display the wait icon immediately.
                                fnToggle(true, wi);

                            }
                            break;

                        case $READYSTATE.IDLE:
                            // Do we have a handle to a timeout used to display the delayed wait icon?
                            if (this.waitHandle) {
                                // Clear timeout and handle.
                                window.clearTimeout(this.waitHandle);
                                this.waitHandle = null;
                            }

                            // Hide the wait icon.
                            fnToggle(false, this.waitIcon);
                            break;
                        }
                    });
                }

                return this._super();
            }
        };
}());