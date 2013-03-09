(function () {

    mstrmojo.requiresCls("mstrmojo.Container",
                         "mstrmojo._Formattable",
                         "mstrmojo._IsPanelStack",
                         "mstrmojo._IsSelectorTarget",
                         "mstrmojo._HasBuilder",
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.TouchScroller",
                         "mstrmojo.css");

    var $CSS = mstrmojo.css,
        $DOM = mstrmojo.dom,
        $M = Math,
//        debug = false,
        SWITCH_DURATION = 700;

    function clearAnimationTimeout() {
        // Do we already have an animation handle?
        var handle = this._animHandle;
        if (handle) {
            // Clear timeout and delete handle.
            window.clearTimeout(handle);
            delete this._animHandle;
        }
    }

    function clearAnimationFlag() {
        // Delete timeout handle and...
        delete this._animHandle;

        // Clear animating flag.
        this._isAnimating = false;
    }

    /**
     * Applies the duration and transform value to the supplied node.
     *
     * @param {Integer} duration The duration of the transition (in milliseconds).
     * @param {Integer} value The value of the x position.
     * @param {Boolean} [force=false] True if we should apply the new position, even if it's the same as the last position.
     * @param {Boolean} [simulateEvt=false] True if we should set a timeout to make sure the animation state is cleared.
     *
     * @private
     */
    function applyTransform(duration, value, force, simulateEvt) {
        // Is this value different from the last value?
        var lastValue = this._translateX;
        if (force || value !== lastValue) {
//            if (debug) {
//                console.log(this.k + ' will move to ' + (value - (lastValue || 0)) + ' over ' + duration);
//            }

            // Store the new values on the instance.
            this._translateX = value;

            // Make sure any previous animation timers are cleared.
            clearAnimationTimeout.call(this);

            // Is there a duration?
            if (duration) {
                // Set animation flag.
                this._isAnimating = true;
            }

            // Move the node.
            var nodeStyle = this.containerNode.style;
            nodeStyle.webkitTransitionDuration = duration + 'ms';
            nodeStyle.webkitTransform = $DOM.createTranslateString(-value);
            // Should we set a timer to simulate the webkitEndTransistion event?
            if (simulateEvt) {
                var id = this.id;
                this._animHandle = window.setTimeout(function () {
                    // Get widget reference.
                    var w = mstrmojo.all[id];

                    // Is widget still animating?
                    if (mstrmojo.all[id]._isAnimating) {
                        
                        // Clear animating flag.
                        clearAnimationFlag.call(w);
                    }
                }, duration * 3);
            }
        }
    }

    /**
     * Renders the docked selector buttons.
     *
     * @private
     */
    function renderSelector() {
        // Do we NOT have a docked selector?
        if (!this.defn.dk) {
            return;
        }
        var panels = this.children,
            i = 0,
            cnt = panels.length,
            selectedIdx = this.selectedIdx,
            btnMarkup = [];

        // Iterate panels.
        for (i = 0; i < cnt; i++) {
            // Start single button markup.
            btnMarkup.push('<div idx="' + i + '" class="');

            // Is this the selected panel?
            if (i === selectedIdx) {
                btnMarkup.push('on');
            }

            // Finish single button markup.
            btnMarkup.push('"><div></div></div>');
        }

        // Size selector btns node...
        var selectorBtnsNode = this.selectorBtns,
            dpi = mstrMobileApp.getDeviceDPI(),
            btnWidth = 38;

        // Is this NOT a tablet?
        if (!mstrApp.isTablet()) {
        // Is this a low-dpi device?
        if (dpi === 120) {
            btnWidth = 26;

            // Is this a high-dpi device?
        } else if (dpi === 320) {
            btnWidth = 57;

            }
        }

        selectorBtnsNode.style.width = (cnt * btnWidth) + 'px';

        // add button markup...
        selectorBtnsNode.innerHTML = btnMarkup.join('');

        // and make selector visible.
        this.selector.style.display = 'block';
    }

    /**
     * A widget to display a panel stack within a Report Services document on the Android platform.
     *
     * @class
     * @extends mstrmojo.Container
     *
     * @borrows mstrmojo._Formattable
     * @borrows mstrmojo._IsSelectorTarget
     * @borrows mstrmojo._HasBuilder
     * @borrows mstrmojo._HasTouchScroller
     * @borrows mstrmojo._IsPanelStack
     * @borrows mstrmojo._TouchGestures
     */
    mstrmojo.android.DocPanelStack = mstrmojo.declare(

        mstrmojo.Container,

        [ mstrmojo._Formattable, mstrmojo._IsSelectorTarget, mstrmojo._HasBuilder, mstrmojo._HasTouchScroller, mstrmojo._IsPanelStack, mstrmojo._TouchGestures ],

        /**
         * @lends mstrmojo.android.DocPanelStack.prototype
         *
         */
        {
            scriptClass: "mstrmojo.android.DocPanelStack",

            btnMarkup: '',

            markupString: '<div id="{@id}" title="{@tooltip}" class="mstrmojo-DocPanelStack {@cssClass}" style="{@domNodeCssText}">' +
                            '<div></div>' +
                            '<div class="mstrmojo-PanelSelector">' +
                                '<div class="mstrmojo-SelectorBtns"></div>' +
                            '</div>' +
                          '</div>',

            markupSlots: {
                containerNode: function () { return this.domNode.firstChild; },
                selector: function () { return this.domNode.lastChild; },
                selectorBtns: function () { return this.domNode.lastChild.firstChild; }
            },

            formatHandlers: {
                domNode: [ 'RW', 'B' ]
            },

            scrollerConfig: {
                bounces: false,
                showScrollbars: false,
                vScroll: false,
                hScroll: true
            },

            /**
             * Panels are hidden by default so we need to set the visibility of the current panel to true.
             *
             * @see mstrmojo.Container
             */
            addChildren: function addChildren(panels, idx, silent) {

                this._super(panels, idx, silent);

                var containerNodeStyle = this.containerNode.style,
                    formats = this.getFormats(),
                    width = this._pnlWidth = parseInt(formats.width, 10),
                    height = parseInt(formats.height, 10),
                    selectedIdx = this.selectedIdx;

                // Set the width of the container node to the sum width of all panels.
                var newPosition = this.selectedIdx * width;

                // Set width of container node to the width of a panel times the number of panels.
                containerNodeStyle.width = (width * panels.length) + 'px';

                // Make sure the panel slider is in the correct position.
                if (!$DOM.isWinPhone) {
                    applyTransform.call(this, 0, newPosition);
                } else {
                    containerNodeStyle.msTransform = newPosition;
                }

                // Iterate panels.
                var i = 0,
                    cnt = panels.length;

                for (i = 0; i < cnt; i++) {
                    var panel = panels[i];

                    // All panels should be visible.
                    panel.visible = true;

                    // Only the current panel is selected.
                    panel.selected = (i === selectedIdx);

                    // Update panel dimensions so that they render end to end.
                    panel.updatePanelDimensions(i * width, height, width);
                }

                // Render the docked panel selector.
                renderSelector.call(this);

                // Update the scroller now that we have children.
                this.updateScroller();

                return true;
            },

            postBuildRendering: function postBuildRendering() {
                this._super();

                // Render the docked panel selector.
                renderSelector.call(this);

                // Attach transition end event to hear when panel is done animating.
                var id = this.id;
                mstrmojo.dom.attachEvent(this.containerNode, 'webkitTransitionEnd', function (evt) {
                    var widget = mstrmojo.all[id];
                    if (evt.target !== widget.containerNode) {
                        return true;
                    }

//                    if (debug) {
//                        console.log(widget.k + ' STOPPED animating.');
//                    }

                    // Make sure any previous animation timers are cleared.
                    clearAnimationTimeout.call(widget);

                    // Stop propagation so ancestor elements don't hear the event as well.
                    evt.stopPropagation();

                    // Clear animating flag.
                    clearAnimationFlag.call(widget);

                    return false;
                });

                return true;
            },

            /**
             * Sets the dimensions on the panel stack and it the containing panels. It also repositions
             * the panels correctly based on the new dimensions.
             *
             * @param {Object} d Object containing the new dimensions of the panel stack.
             */
            setInfoWindowDimensions: function setInfoWindowDimensions(d) {
                // Is the parent of the panel stack a portlet?
                var parent = this.parent;
                if (parent.scriptClass === 'mstrmojo.DocPortlet') {
                    // Pass dimensions to the portlet so it can resize and adjust dimensions for portlet chrome.
                    parent.setInfoWindowDimensions(d);
                }

                var h = d.h,
                    w = d.w,
                    domNodeStyle = this.domNode.style,
                    panels = this.children,
                    len = panels.length,
                    i;

                // Update the dimensions of the panel stack DOM Node.
                domNodeStyle.height = h + 'px';
                domNodeStyle.width = w + 'px';

                // Update the cached panel width.
                this._pnlWidth = w;

                // Update the translateX field.
                this._translateX = (this.selectedIdx || 0) * w;

                // Iterate panels.
                for (i = 0; i < len; i++) {
                    // Update panel dimensions.
                    panels[i].updatePanelDimensions(i * w, h, w);
                }

                // Update the scroller for the new size.
                this.updateScroller();
            },

            getTitle: function getTitle() {
                // We should get the title from the title property as it accounts for both the cases of 'Custom Title' and 'Show Panel Title'.
                return this.title;
            },

            /**
             * Attach an event listener to update _translateX when scroll actions are complete.
             *
             * @param {mstrmojo.TouchScroller} scroller The scroller widget.
             *
             * @see mstrmojo._HasTouchScroller
             * @ignore
             */
            initScroller: function initScroller(scroller) {
                // Attach an event listener to hear when scrolls are done.
                scroller.attachEventListener('scrollDone', this.id, function (evt) {
                    // Update the translateX value after each scroll.
                    this._translateX = evt.x;
                });
            },

            /**
             * Update the scroller config with current offset, origin and transform value.
             *
             * @see mstrmojo._HasTouchScroller
             * @ignore
             */
            updateScrollerConfig: function updateScrollerConfig() {
                var children = this.children,
                    length = children && children.length;

                // Do we have any children?
                if (length) {
                    var position = this._translateX || 0,
                        width = this._pnlWidth,
                        offset;

                    // Create X axis offset and cache for later use.
                    offset = {
                        start: $M.max(position - width, 0),                                      // Beginning of previous panel, or 0, whichever is greater.
                        end: $M.min(position + width, length * width - width)                    // End of current panel, or position of current panel if this is the last panel.
                    };

                    // Overwrite offset, origin and transform values on the scroller configuration.
                    mstrmojo.hash.copy({
                        scrollEl: this.containerNode,

                        offset: {
                            x: offset,
                            scrollPast: false
                        },

                        origin: {
                            x: position,
                            y: 0
                        }
                    }, this.scrollerConfig);
                }

                return this._super();
            },

            onselectedIdxChange: function onselectedIdxChange(evt) {
                var selector = this.selectorBtns,
                    buttons = selector && selector.childNodes;

                // Do we have buttons to update?
                if (buttons) {
                    // Update classes on buttons.
                    $CSS.addClass(buttons[evt.value], 'on');
                    $CSS.removeClass(buttons[evt.valueWas], 'on');
                }
            },

            /**
             * Changes the visibility of the child panels based on the selected key.
             *
             * @param {String} evt.value The key of the newly selected panel.
             */
            onselectedKeyChange: function onselKeyChg(evt) {

                this._super(evt);

                // Calculate the new position for the panels.
                var width = this._pnlWidth,
                    position = this.selectedIdx * width;

                // Is this a windows phone?
                if ($DOM.isWinPhone) {
                    // Change container node position to relative.
                    var containerNode = this.containerNode;
                    containerNode.style.position = 'relative';

                    // Animate transition.
                    (new mstrmojo.fx.AnimateProp({
                        props: {
                            left: {
                                isStyle: true,
                                start: position,
                                stop: this.prevSelectIdx * width,
                                suffix: 'px',
                                ease: mstrmojo.ease.linear
                            }
                        },
                        duration: 0,
                        target: containerNode
                    })).play();

                } else {
                    // Apply the transform with no duration (for performance).
                    applyTransform.call(this, 0, position);
                }

                // Update the scroller so the origin is synchronized (passing true so we don't scroll to the origin again).
                this.updateScroller(true);
            },

            touchBegin: function touchBegin(touch) {
                // Are we animating?
                if (this._isAnimating) {
                    // Stop the touch event...
                    touch.stop();

//                    if (debug) {
//                        console.log(this.k + ' IS animating - touch ' + touch.id + ' stopped');
//                    }

                    // and ignore all touches until done.
                    return false;
                }

//                if (debug) {
//                    console.log(this.k + ' IS NOT animating - touch ' + touch.id + ' proceeds');
//                }

                return this._super(touch);
            },

            touchTap: function touchTap(touch) {
                var target = touch.target,
                    domNode = this.domNode;

                // Did the tap occur within the selector node?
                if ($DOM.contains(this.selector, target, true, domNode)) {
                    var selectorBtnsNode = this.selectorBtns,
                        panelIdx = -1;

                    // Did the tap occur with the selector button node?
                    if ($DOM.contains(selectorBtnsNode, target, true, domNode)) {
                        // Use the target idx attribute value to find panel.
                        panelIdx = $DOM.findAncestorByAttr(target, 'idx', true, selectorBtnsNode).value;
                    } else {
                        // Calculate target panel index by position clicked on the selector.
                        panelIdx = this.selectedIdx + ((touch.clientX - domNode.offsetLeft < (this._pnlWidth / 2)) ? -1 : 1);
                    }

                    // Did we find a panel index?
                    if (panelIdx > -1) {
                        // Is there a panel at that index (may not be if the user didn't click a button and there are no more panels in that direction).
                        var panel = this.children[panelIdx];
                        if (panel) {
                            // Select the target panel.
                            this.selectPanel(panel.k);
                        }
                    }
                }
            },

            touchSwipeBegin: function touchSwipeBegin(touch) {
//                if (debug) {
//                    console.log(this.k + ': Swipe Begin id ' + touch.id);
//                }

                // Does the panel stack NOT support swipe changes (without selector) and is the selector not the target of the touch?
                if (!this.defn.sw && !$DOM.contains(this.selector, touch.target, true, this.domNode)) {
                    // Bubble the event and return (since we won't handle it).
                    return this.bubbleTouchEvent(touch);
                }

                return this._super(touch);
            },

            touchSwipeEnd: function touchSwipeEnd(touch) {
                // Mark the event as handled so the touchEnd event used can be ignored by other components.
                touch.evt.handled = true;

                var x = this._translateX || 0,
                    width = this._pnlWidth,
                    offset = this._scroller.offset.x,                                           // Cached in touchSwipeBegin so we know the limits of the swipe.
                    position = $M.max($M.min(x - touch.delta.x, offset.end), offset.start),     // Calculate the new position (limited by offsets).
                    delta = x - position,                                                       // Distance of the swipe (could be negative).
                    absDelta = $M.abs(delta),                                                   // Absolute distance of swipe.
                    duration = SWITCH_DURATION,
                    isRevertAction = (absDelta < width * 0.2);

                // Did the swipe move less than 20% of the width?
                if (isRevertAction) {
                    // Reset to old position.
                    position = x;
                    duration *= absDelta / width;
                } else {
                    // Calculate new position based on direction of swipe.
                    position = x + ((delta < 0) ? width : -width);
                    duration *= (width - absDelta) / width;
                }

//                if (debug) {
//                    console.log(this.k + ': Swipe End at position ' + position + ' id ' + touch.id);
//                }

                // Move the panels manually because we want it faster than it happens by default.
                applyTransform.call(this, $M.round(duration), position, true, isRevertAction);

                // Select the new panel.
                this.selectPanel(this.children[position / width].k, true);
            }
        }
    );

}());