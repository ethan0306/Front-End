/**
 * _FillsBrowser.js
 * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 *
 * @version 1.0
 * @fileoverview <p>A mixin for adding the ability to monitor the browser size and change the widget dimensions when browser size changes.</p>
 * <p>Note: There should only ever be one widget instantiated that mixes in this class.</p>
*/

(function () {

    mstrmojo.requiresCls("mstrmojo.dom");

    var $D = mstrmojo.dom,
        _switchDimensions = false;

    /**
     * <p>A mixin for adding the ability to monitor the browser size and change the widget dimensions when browser size changes.</p>
     *
     * @class
     * @public
     */
    mstrmojo._FillsBrowser = mstrmojo.provide(

        "mstrmojo._FillsBrowser",

        /**
         * @lends mstrmojo._FillsBrowser.prototype
         */
        {
            _mixinName: 'mstrmojo._FillsBrowser',

            getBrowserDimensions: function () {
                var body = document.body,
                    browserOffset = ($D.isFF || $D.isWK) ? 0 : 2;    // TODO: Not sure why, but all browsers other than FF need to subtract 2 from height.

                var w = body.clientWidth,
                    h = body.clientHeight;

                if (_switchDimensions) {
                    var t = h;
                    h = w;
                    w = t;
                }

                return {
                    w: Math.max(w, 0) + 'px',
                    h: Math.max(h - browserOffset, 0) + 'px'
                };
            },

            /**
             * Simulates an orientation change by calling our monitorWindow().  Each call toggles a flag which
             * causes getBrowserDimensions() to switch the browser's body dimensions or not.
             */

            simulateOrientationChange: function simulateOrientationChange() {
                _switchDimensions = !_switchDimensions;
                this.monitorWindow();
            },

            /**
             * Sets initial size of component to match browser size and then attaches an event listener to hear when the size changes.
             *
             * @return Boolean
             * @ignore
             */
            preBuildRendering: function preBuildRendering() {
                var rtn = true;
                if (this._super) {
                    rtn = this._super();
                }

                var d = this.getBrowserDimensions();

                // Set initial values (or allow consumer to do it via browserResized method.
                if (!('browserResized' in this) || this.browserResized(d) !== true) {
                    this.height = d.h;
                    this.width = d.w;
                }

                // Have we created the window resize event listener yet?
                if (!this._listenerProc) {
                    // Establish this instance as the window monitor.
                    window._monitor = this;

                    // Create listener with closure so it has access to our object and Id
                    var id = this.id,
                        fn = this._listenerProc = function (e) {
                            var evt = e || window.event;
                            mstrmojo.all[id].monitorWindow(evt);
                        };

                    // Set an event listener to hear when the browser window resizes.
                    $D.attachEvent(window, 'resize', fn);
                }
                return rtn;
            },

            /**
             * Removes the event handler created in preBuildRendering.
             *
             * @see {mstrmojo.Widget}
             * @ignore
             */
            destroy: function destroy(ignoreDom) {
                // Have we already created our window monitor method?
                if (this._listenerProc) {
                    // Detach the DOM event handler.  Note you must use the same function you passed to attachEvent
                    $D.detachEvent(window, 'resize', this._listenerProc);
                }
                this._super(ignoreDom);
            },

            /**
             * <p>Resizes the component whenever the window resizes.</p>
             * <p>Note that this method assumes that 'this' refers to the object that mixes in _FillsBrowser
             *    and not to the event or someother object.</p>
             */
            monitorWindow: function (evt) {
                // Get browser dimensions from resize event
                var currentTarget = evt.currentTarget,
                    size = {
                        w: currentTarget.innerWidth + 'px',
                        h: currentTarget.innerHeight + 'px'
                    };

                // Did the dimensions NOT change?
                if (size.h === this.height && size.w === this.width) {
                    // Nothing to do.
                    return;
                }

                // Call the widgets handler (if there is one) and if it return true, no need to continue.  Otherwise, change
                // the widgets dimensions.
                if (!('browserResized' in this) || this.browserResized(size) !== true) {
                    if (size.h !== this.height) {
                        this.set('height', size.h);
                    }

                    if (size.w !== this.width) {
                        this.set('width', size.w);
                    }
                }
            }
        }
    );
}());