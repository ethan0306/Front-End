(function () {

    mstrmojo.requiresCls("mstrmojo.TouchScroller",
                         "mstrmojo.hash");

    var $HASH = mstrmojo.hash;

    /**
     * <p>A mixin that equips a {@link mstrmojo.Widget} with default methods for creating and scrolling using a {@link mstrmojo.TouchScroller}.</p>
     *
     * <p>Any properties that the consuming {@link mstrmojo.Widget} would like passed to the {@link mstrmojo.TouchScroller} should be set in the scrollerConfig.</p>
     *
     * <p>Any dynamic scrollerConfig properties can be computed in the updateScrollerConfig method.</p>
     *
     * @class
     * @public
     */
    mstrmojo._HasTouchScroller = mstrmojo.provide(

        "mstrmojo._HasTouchScroller",

        /**
         * @lends mstrmojo._HasTouchScroller#
         */
        {
            _meta_usesSuper: true,

            /**
             * <p>A configuration object that can be used to pass properties to the {@link mstrmojo.TouchScroller}.</p>
             */
            scrollerConfig: {},

            init: function init(props) {
                this._super(props);

                // Convert scroller config to a clone so that all instances don't share the same config.
                this.scrollerConfig = $HASH.clone(this.scrollerConfig);
            },

            /**
             * Hook for updating the scrollerConfig object with dynamic values.
             *
             * @returns {Object} The updated scroller config.
             */
            updateScrollerConfig: function updateScrollerConfig() {
                return this.scrollerConfig;
            },

            /**
             * Calls updateScrollerConfig and applies new scroller config properties to existing scroller instance (if present).
             *
             * @param {Boolean} [noScrollToOrigin=false] True if you do not want the scroller to synchronize with the origin.
             *
             */
            updateScroller: function updateScroller(noScrollToOrigin) {
                var scroller = this._scroller;

                //TQMS 493892. Under certain circumstances this method is called by the Publisher within Global scope
                if (scroller) {
                    // Update the configuration.
                    var cfg = this.updateScrollerConfig();

                    // Copy current config onto scroller instance.
                    $HASH.copy(cfg, scroller);

                    // Should we synchronize the scroller with the origin?
                    if (!noScrollToOrigin) {
                        // Do we have an origin?
                        var origin = cfg.origin;
                        if (origin) {
                            // Make sure the scroller is positioned at the origin.
                            scroller.scrollTo(origin.x, origin.y);
                        }
                    }

                    // Update scroll bars.
                    scroller.updateScrollBars();
                }
            },

            /**
             * A custom hook called immediately after the scroller is created.
             *
             * @param {mstrmojo.TouchScroller} scroller The instance of {@link mstrmojo.TouchScroller} to be initialized.
             *
             */
            initScroller: mstrmojo.emptyFn,

            /**
             * If true, the scroller will be scrolled for touchSelectMove as well as touchSwipeMove.
             *
             * @type Boolean
             * @default false
             */
            useSelectScroll: false,

            /**
             * Instantiates a {@link mstrmojo.TouchScroller} and stores it in the "_scroller" property.
             */
            postBuildRendering: function postBuildRendering() {
                var scroller = this._scroller;

                // Do we NOT already have a scroller?
                if (!scroller) {
                    // Initialize scroller without config.
                    scroller = this._scroller = new mstrmojo.TouchScroller();

                    // Call the custom hook for scroller initialization.
                    this.initScroller(scroller);
                } else {  // TQMS 497890
                    scroller.haltScroller();
                }

                // Do we NOT have _HasLayout mixed in?
                if (!this.layoutConfig) {
                    // Need to manually call updateScroller (instead of relying on afterLayout of _HasLayout).
                    this.updateScroller();
                }

                // Call super.
                if (this._super) {
                    this._super();
                }
            },

            /**
             * Calls updateScroller to calculate new dynamic scroller properties and apply them to the scroller instance.
             *
             * @ignore
             */
            afterLayout: function afterLayout() {
                this._super();

                // Update scroller.
                this.updateScroller();
            },

            getScrollPos: function getScrollPos() {
                return $HASH.copy(this._scroller.origin || {
                    x: 0,
                    y: 0
                }, {});
            },

            /**
             * Returns true if the touch event should be bubbled based on scroller configuration and position.
             *
             * @type Boolean
             */
            shouldTouchBubble: function shouldTouchBubble(touch) {
                // Default to horizontal.
                var scroller = this._scroller,
                    isVertical = touch.isVertical,
                    axis = (isVertical) ? 'y' : 'x';

                // Does the scroller not scroll in this orientation OR is the scroller at the end in this orientation?
                return (!scroller[((isVertical) ? 'v' : 'h') + 'Scroll'] || scroller.offset[axis][touch.direction[axis] ? 'end' : 'start'] === scroller.origin[axis]);
            },

            /**
             * Stops the deceleration of the private {@link mstrmojo.TouchScroller} instance if it's currently decelerating.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchBegin: function touchBegin(touch) {
                // Stop deceleration.
                this._scroller.stopDeceleration();

                return (this._super && this._super(touch)) || true;
            },

            /**
             * Shows the scrollbars.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSwipeBegin: function touchSwipeBegin(touch) {
                // Should we bubble the touch event?
                if (this.shouldTouchBubble(touch)) {
                    // Try to bubble the event.  Did it return false, meaning that it won't be handled by anybody else?
                    if (this.bubbleTouchEvent(touch) === false) {
                        // We still need to handle the event to potentially mark the swipe end event as handled, so locally mark this touch as canceled.
                        this._touchCanceled = true;
                    }

                    // Were done, so return.
                    return;
                }

                // Do we have a super?
                if (this._super) {
                    // Call it.
                    this._super(touch);
                }

                // Show scrollbars.
                this._scroller.toggleScrollBars(true);
            },

            /**
             * Calls touchSwipeBegin if useSelectScroll is true.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSelectBegin: function touchSelectBegin(touch) {
                // Do we have a super?
                if (this._super) {
                    // Call it.
                    this._super(touch);
                }

                // Is select scroll enabled?
                if (this.useSelectScroll) {
                    // Simulate a touch swipe.
                    this.touchSwipeBegin(touch);
                }
            },

            /**
             * Calls the scroll method of the private {@link mstrmojo.TouchScroller} instance.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSwipeMove: function touchSwipeMove(touch) {
                // Was the touch canceled?
                if (this._touchCanceled) {
                    // Nothing to do.
                    return;
                }

                // Do we have a super?
                if (this._super) {
                    // Call it.
                    this._super(touch);
                }

                // Scroll the scroller.
                this._scroller.scroll(touch);
            },

            /**
             * Calls touchSwipeMove if useSelectScroll is true.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSelectMove: function touchSelectMove(touch) {
                // Was the touch canceled?
                if (this._touchCanceled) {
                    // Nothing to do.
                    return;
                }

                // Do we have a super?
                if (this._super) {
                    // Call it.
                    this._super(touch);
                }

                // Is select scroll enabled?
                if (this.useSelectScroll) {
                    // Simulate a touch swipe move.
                    this.touchSwipeMove(touch);
                }
            },

            /**
             * Calls the scrollEnd method of the private {@link mstrmojo.TouchScroller} instance.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSwipeEnd: function touchSwipeEnd(touch) {
                // Mark the event as handled so the touchEnd event used to stop the scrolling can be ignored by other components.
                touch.evt.handled = true;

                // Was the touch canceled?
                if (this._touchCanceled) {
                    return;
                }

                // Do we have a super?
                if (this._super) {
                    // Call it.
                    this._super(touch);
                }

                // Tell the scroller to end.
                this._scroller.scrollEnd(touch);
            },

            /**
             * Calls touchSwipeEnd if useSelectScroll is true.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSelectEnd: function touchSelectEnd(touch) {
                // Was the touch canceled?
                if (this._touchCanceled) {
                    // Nothing to do.
                    return;
                }

                // Do we have a super?
                if (this._super) {
                    // Call it.
                    this._super(touch);
                }

                // Is select scroll enabled?
                if (this.useSelectScroll) {
                    // Simulate a touch swipe end.
                    this.touchSwipeEnd(touch);
                }
            },

            touchEnd: function touchEnd(touch) {
                // Was the touch canceled?
                if (this._touchCanceled) {
                    // Delete the canceled flag and return.
                    delete this._touchCanceled;
                    return;
                }

                if (this._super) {
                    this._super(touch);
                }
            },

            /**
             * Overridden to destroy the TouchScroller reference.
             *
             * @ignore
             */
            destroy: function destroy() {
                // Do we have a scroller?
                if (this._scroller) {
                    // Destory it and delete the reference.
                    this._scroller.destroy();
                    delete this._scroller;
                }

                // Do we have a super?
                if (this._super) {
                    // Call it.
                    this._super();
                }
            }

        }
    );

}());