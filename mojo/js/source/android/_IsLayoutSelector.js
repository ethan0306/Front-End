(function () {

    mstrmojo.requiresCls("mstrmojo.fx",
                         "mstrmojo.dom");

    /**
     * Positions the selector node.
     *
     * @param {Boolean} visible Whether the selector should be visible or not.
     * @param {Boolean} animate Whether to use animation for hiding/showing the selector.
     *
     * @private
     */
    function positionSelector(visible, animate) {
        var domNode = this.domNode,
            domNodeStyle = domNode && domNode.style;

        // Do we have a domNode?
        if (domNodeStyle) {
            // Calculate default position assuming the selector is visible.
            var isBottom = (this.position === 'bottom'),
                styleProperty = (isBottom) ? 'bottom' : 'top',
                y = (isBottom) ? 0 : this.parent.titleNode.offsetHeight;

            // Is the selector hidden?
            if (!visible) {
                // Reduce position by height of selector.
                y -= domNode.offsetHeight;
            }

            // Is this a windows phone device?
            if (mstrmojo.dom.isWinPhone) {
                // Should we animate?
                if (animate) {
                    var anim = {
                        props: {},
                        duration: 400,
                        target: domNode
                    };

                    anim.props[styleProperty] = {
                        isStyle: true,
                        start: parseInt(domNodeStyle[styleProperty], 10),
                        stop: y,
                        suffix: 'px',
                        ease: mstrmojo.ease.linear
                    };

                    // Use fx package to animate.
                    (new mstrmojo.fx.AnimateProp(anim)).play();

                    // Quit and let the animation do it's work.
                    return;
                }
            } else {
                // Set transition property to animate (or not).
                domNodeStyle.webkitTransitionProperty = (animate) ? styleProperty : 'none';
            }

            // Apply position.
            domNodeStyle[styleProperty] = y + 'px';
        }
    }

    /**
     * A mixin to add Report Services Document Layout switching to Android widgets.
     *
     * @class
     * @public
     */
    mstrmojo.android._IsLayoutSelector = {

        _mixinName: 'mstrmojo.android._IsLayoutSelector',

        markupMethods: {
            onwidthChange: function () { this.domNode.style.width = this.width || 'auto'; }
        },

        /**
         * The position of the layout selector (can be 'top' or 'bottom').
         *
         * @type String
         * @default bottom
         */
        position: 'bottom',

        /**
         * The instance of {@link mstrmojo.MobileDoc} this layout selector is targeting.
         *
         * @type mstrmojo.MobileDoc
         */
        target: null,

        /**
         * Attaches a listener to the target {@link mstrmojo.MobileDoc} to hear when the layout selector status changes.
         *
         * @param {Object} evt The layoutStatusChange event.
         *
         * @ignore
         */
        ontargetChange: function ontargetChange() {
            // Do we have a target?
            var target = this.target;
            if (target) {
                // Attach a listener to hear when layout changes.
                target.attachEventListener('layoutStatusChange', this.id, function (evt) {
                    // Get full screen status from event.
                    var isFullScreen = evt.fullScreen;

                    // Set positioning delay to true if in full screen mode AND the selector hasn't rendered (initial state) OR the selector isn't visible (which means we switched from
                    // another layout while in full screen).
                    this._delayPositioning = (isFullScreen && (!this.hasRendered || !this.visible));

                    // Does the event contain layout information?
                    var currentLayout = evt.current;
                    if (currentLayout) {
                        // Repaint.
                        this.renderSelector(evt.layouts, currentLayout);
                    }

                    // Set visibility based on full screen mode.
                    this.set('visible', !isFullScreen);
                });
            }
        },

        postCreate: function () {
            // TQMS #497876: Attach event listener to rootView to hear when orientation changes so we can reposition the selector.
            mstrApp.rootView.attachEventListener('orientationChange', this.id, function () {
                positionSelector.call(this, this.visible, false);
            });
        },

        /**
         * <p>Builds the layout selector portion of this widget. Although the rendering logic is done within the individual widget classes.</p>
         * 
         * <p>The super class returns a boolean value depending on whether there are layouts to display.</p>
         *
         * @param {mstrmojo.MobileDocLayoutViewer[]} layouts The collection of layouts that can be displayed.
         * @param {mstrmojo.MobileDocLayoutViewer} currentLayout The currently displayed layout.
         */
        renderSelector: function renderSelector(layouts, currentLayout) {
            // Return whether we have more than one layout.
            return (layouts.length > 1);
        },

        /**
         * Toggle's the display of the layout selector.
         *
         * @param show Whether to show or hide the layout selector.
         * @param slot The markupSlot. Typically the domNode.
         */
        toggleSelectorDisplay: function toggleSelectorDisplay(show, slot) {
            var display = (show) ? this.cssDisplay : 'none';

            //If no slot is provided, defaults to the domNode.
            slot = slot || this.domNode;

            //Has the widget been rendered?
            if (slot) {
                slot.style.display = display;
            } else {
                this.cssText = 'display:' + display + ';';
            }
        },

        /**
         * Overridden to set initial visibility/position of selector.
         *
         * @ignore
         */
        postBuildRendering: function postBuildRendering() {
            // Always start out visible using no animation.
            positionSelector.call(this, true, false);

            return this._super();
        },

        /**
         * Always displays selector after initial render and then slides it off the screen if initial state of document is full screen.
         *
         * @ignore
         */
        onRender: function onRender() {
            // Should we delay the positioning of the selector?
            if (this._delayPositioning) {
                var id = this.id;

                // Set a 1 second delay.
                window.setTimeout(function () {
                    // Get instance.
                    var selector = mstrmojo.all[id];

                    // Make sure we have the selector and that it's still rendered.
                    if (selector && selector.hasRendered) {
                        // Clear delay flag.
                        selector._delayPositioning = false;

                        // Simulate a visibility change to hide selector.
                        selector.onvisibleChange({
                            value: false
                        });
                    }

                }, 1000);
            }

            if (this._super) {
                this._super();
            }
        },

        /**
         * Positions the selector based on visibility.
         *
         * @param {Boolean} evt.value True if the selector should be visible (NOT full screen mode).
         *
         * @ignore
         */
        onvisibleChange: function onvisibleChange(evt) {
            // Should we NOT delay the positioning?
            if (!this._delayPositioning) {
                // Position the selector based on the event value using animation.
                positionSelector.call(this, evt.value, true);
            }
        }
    };
}());