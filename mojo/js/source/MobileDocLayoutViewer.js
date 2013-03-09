(function () {

    mstrmojo.requiresCls("mstrmojo.DocLayoutViewer",
                         "mstrmojo._Formattable",
                         "mstrmojo._TouchGestures",
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo.android._IsAndroidDocument",
                         "mstrmojo.dom");

    /**
     * Returns a function for handling (by passing) touch event commands to the parent for scrolling.
     * 
     * @param {String} methodName The name of the method to call on the parent (passing the x delta from the touch event as the only parameter).
     * 
     * @private
     */
    function getScrollCmdFn(methodName) {
        return function (touch) {
            // Is the layout selector style set to swipe AND should we bubble the touch event?
            if (this.model.tss === 1 && this.shouldTouchBubble(touch)) {
                // Is this the end scroll method?
                if (methodName === 'endScroll') {
                    // Mark the event as handled so the touchEnd event used can be ignored by other components.
                    touch.evt.handled = true;
                }

                this.parent[methodName](touch);
                return;
            }

            // Not bubbling to pass to super.
            return this._super(touch);
        };
    }

    /**
     * The widget used to display a MicroStrategy Report Services Layout on a mobile device.
     * 
     * @class
     * @extends mstrmojo.DocLayoutViewer
     */
    mstrmojo.MobileDocLayoutViewer = mstrmojo.declare(
        // superclass
        mstrmojo.DocLayoutViewer,

        // mixins,
        [ mstrmojo._TouchGestures, mstrmojo._HasTouchScroller, mstrmojo.android._IsAndroidDocument ],

        /**
         * @lends mstrmojo.MobileDocLayoutViewer.prototype
         */
        {
            scriptClass: "mstrmojo.MobileDocLayoutViewer",

            layoutConfig: {
                h: {
                    groupBy: '0',
                    fixedHeaderNode: 'auto',
                    layout: '100%',
                    fixedFooterNode: 'auto',
                    incFetchNode: '0'
                },
                w: {
                    layout: '100%'
                }
            },

            formatHandlers: {
                domNode: [ 'background-color' ]
            },

            scrollerConfig: {
                vScroll: false,
                hScroll: false,
                bounces: false,
                showScrollbars: false
            },

            usesTouches: true,

            preBuildRendering: function preBuildRendering() {
                this._super();

                this._scrollCssText = 'overflow:' + ((!mstrmojo.dom.isWinPhone) ? 'hidden' : 'auto');

                // TQMS 490160 We need to update scroller after incremental rendering as real document size can change.
                if (!this.afterScrollSubscr) {
                    this.afterScrollSubscr = this.docLayout.attachEventListener('afterScroll', this.id, this.updateScroller);
                }
            },

            updateScrollerConfig: function updateScrollerConfig() {
                var cfg = this.scrollerConfig,
                    layoutNode = this.docLayout.containerNode;

                if (layoutNode) {
                    var docLayout = this.docLayout,
                        xOffset = {
                            start: 0,
                            end: Math.max(docLayout.getWidth() - this.scrollboxWidth, 0)
                        },
                        yOffset = {
                            start: 0,
                            end: Math.max(docLayout.getHeight() - this.scrollboxHeight, 0)
                        },
                        vScroll = (yOffset.start !== yOffset.end),
                        hScroll = (xOffset.start !== xOffset.end);

                    // Update the scroller config with new values.
                    mstrmojo.hash.copy({
                        scrollEl: this.scrollboxNode.firstChild,    // The DocLayout domNode.
                        offset: {
                            x: xOffset,
                            y: yOffset
                        },
                        vScroll: vScroll,
                        hScroll: hScroll,
                        showScrollbars: false
                    }, cfg);

                    // If we don't have an origin yet, then create one.
                    if (!cfg.origin) {
                        cfg.origin = this._origin = {
                            x: 0,
                            y: 0
                        };
                    }

                    //Add a scroll rendering buffer so that the scrolling experience isn't so choppy
                    docLayout.scrollBuffer = parseInt(mstrApp.rootView.getContentDimensions().h, 10);
                }

                return this._super();
            },

            /**
             * Overridden to attach an event listener to the scroller for scrollDone to notify scroll listeners.
             * 
             * @ignore
             */
            initScroller: function initScroller(scroller) {
                this._super(scroller);

                // Attach an event listener to hear when scrolling is done.
                scroller.attachEventListener('scrollDone', this.id, function (evt) {
                    // Update the origin.
                    this._origin = {
                        x: evt.x,
                        y: evt.y
                    };

                    // Notify listeners that we've scrolled.
                    this.notifyScrollListeners(evt);
                });
            },

            touchBegin: function touchBegin(touch) {
                var p = this.parent;
                // is our parent busy displaying another layout?
                if (p && p.isAnimating && p.isAnimating()) {

                    // YES - stop the touch from bubbling
                    touch.stop();

                    // and ignore all touches until done.
                    return false;
                }
                return this._super(touch);
            },

            touchSwipeBegin: getScrollCmdFn('beginScroll'),

            touchSwipeMove: getScrollCmdFn('scroll'),

            touchSwipeEnd: getScrollCmdFn('endScroll'),

            /**
             * Overridden to update scroller after children are rendered.
             * 
             * @ignore
             */
            renderChildren: function rnCh() {
                this._super();

                // We have to wait until the children are rendered before we can populate the scroller.
                this.updateScroller();
            },

            /**
             * @see mstrmojo._HasMarkup
             */
            unrender: function unrender() {
                //Delete any lingering references to the scroller origin to ensure that we scroll back to the top of the document.
                delete this.scrollerConfig.origin;
                var scroller = this._scroller;
                if (scroller) {
                    delete scroller.origin;
                }

                //Call super.
                this._super();
            }
        }
    );
}());