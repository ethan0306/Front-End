(function () {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.Container",
                         "mstrmojo._HasLayout",
                         "mstrmojo.array",
                         "mstrmojo.dom");

    var CLASS_NAME = 'MobileBooklet',
        COMMAND_SHOW = 1,
        COMMAND_BACK = 2,
        ANIMATION_FORWARD = 1,
        ANIMATION_BACK = 2,
        $D = mstrmojo.dom,
        $MATH = Math,
        $FREE = mstrmojo.Obj.free;

    /**
     * Removes views from the private views collection.
     *
     * @param {mstrmojo.Widget[]} The views collection.
     * @param {mstrmojo.Widget} [stopAtView] If this parameter is passed, all widget after this one will be removed from the collection.  If undefined, only the last view will be removed.
     *
     * @private
     */
    function popViews(views, stopAtView) {
        if (stopAtView) {
            var lim = views.length - 1,
                i = 0;

            for (i = lim; i >= 1 && views[i] !== stopAtView; i -= 1) {
                var vw = views.pop();
                if (i !== lim) {
                    //Destroy all popped invisible views. The visible one will be destroyed
                    //after animation completes
                    vw.destroy();
                }
            }
        } else {
            views.pop();
        }
    }

    /**
     * Adds a view as a child of the MobileBooklet.
     *
     * @param {mstrmojo.Widget} view The view to add.
     * @param {Boolean} [delayAdd=false] An optional boolean indicating if the add child operation should be slightly delayed (used to avoid some touch event bugs).
     *
     * @private
     */
    function addChild(view, delayAdd) {
        // Set the dimensions of the new child to match booklet dimensions.
        view.height = this.height;
        view.width = this.width;

        // Make sure child is visible.
        view.visible = true;

        var id = this.id,
            fnAdd = function () {
                // Add the view as a child.
                mstrmojo.all[id].addChildren([ view ]);
            };

        // Should we delay the add child call?
        if (delayAdd) {
            // TQMS #490649: Add view in a timeout to prevent premature touch end events.
            window.setTimeout(function () {
                fnAdd();
            }, 0);
        } else {
            // Add the child immediately.
            fnAdd();
        }
    }

    /**
     * Inserts and positions a new view into the MobileBooklet markup.
     *
     * @param {mstrmojo.Widget} view The view to insert and position.
     * @param {Boolean} isForward Whether the view should be inserted to the right of the current view (TRUE) or the left (FALSE).
     * @param {Boolean} [delayInsert=false] An optional boolean indicating if the insert should have a slight delay (used to avoid some touch event bugs).
     *
     * @returns An object with an isMulti boolean property (true if there is more than one view) and a next property with the next visible page element.
     *
     * @private
     */
    function insertView(view, isForward, delayInsert) {
        // Switch pointers to new page and keep a reference to the page that we are changing.
        var pages = this.getPages(),
            curVisPage = pages.current,
            nextVisSlot = pages.slot,
            nextVisPage = pages.next,
            sliderPosition = 0;

        // Clear current page HTML.
        this.cleanCurrentPage(nextVisPage);

        // Set the slot on the new child.
        view.slot = nextVisSlot;

        // Add the child.
        try {
            addChild.call(this, view, delayInsert);

            // Are there both last and next pages?
            if (nextVisPage && curVisPage) {
                // Calculate new slider position.
                var w = parseInt(this.width, 10);
                sliderPosition = (this._sliderStepPos || 0) + ((isForward) ? w : -w);

                this.moveNextView(nextVisPage, sliderPosition);

                // If not turning backward, then update the z-index to make sure the next page will be on top of
                // the previous.
                if (isForward) {
                    nextVisPage.style.zIndex = 2;
                    curVisPage.style.zIndex = 1;
                }

            }
        } catch (e) {
            // failed to create child view so destroy it before passing on the error
            $FREE(view);
            throw e;
        }

        return {
            position: sliderPosition,
            isMulti: !!(curVisPage && nextVisPage),     // Indicates if there are more than two visible pages.
            next: nextVisPage,                          // The next visible page element.
            view: view,
            isForward: isForward
        };
    }


    function positionSliderNode(newPosition, oldPosition, useAnimation, velocity) {
        var sliderNode = this.sliderNode,
            methodName = 'translateSliderNode',
            fnPosition = function () {
                $MAPF(true, CLASS_NAME, methodName);
                $D.translate(sliderNode, -newPosition, 0, 0, '', true);
                $MAPF(false, CLASS_NAME, methodName);
            };

        // Should we use animation?
        if (useAnimation) {
            // Calculate the distance to travel and how long it should take.
            var delta = $MATH.abs((newPosition || 0) - (oldPosition || 0)),
                duration = $MATH.round(delta / parseInt(this.width, 10) * this.duration),
                easing = ' ease';                                                                   // Default to ease animation when there is no velocity.

            // Do we have a touch velocity?
            if (velocity) {
                // Duration should be the minimum of the original calculated duration or how long it would take to travel the delta distance at current velocity.
                duration = $MATH.min(duration, $MATH.round(delta / velocity));

                // The node is already moving so no reason to ease in.
                easing += '-out';
            }

            // Enable transition with calculated duration.
            sliderNode.style.webkitTransition = '-webkit-transform ' + duration + 'ms' + easing;

            // Fire animation within a timeout.
            window.setTimeout(fnPosition, 20);

        } else {
            // No animation so fire immediately.
            fnPosition();

            // NOTE: Commenting out call to finishTurn because the scrolling uses this method without animation and we don't want to finishTurn in that case.
            // This call was added for windows phone so we will need to come up with a different way to signify that the finishTurn needs to be called on that platform.
//            this.finishTurn();
        }
    }

    /**
     * <p>Turns the booklet in the direction provided, displaying the provided widget.</p>
     *
     * <p>If turning backward, the last visible widget will be destroyed, because it's assumed that we won't need it again.</p>
     *
     * @param {Object} command A command object with properties about this particular page turn.
     * @param {Integer} command.an One of the defined animation constants indicating whether the animation should be forward or backward.
     * @param {Integer} command.code Indicates whether we are showing a new view, or hiding the current view (turning backward).
     * @param {mstrmojo.Widget} [command.vw] An optional widget to display.
     * @param {mstrmojo.Widget} [command.after] An optional widget that the new view should appear after.
     *
     * @private
     */
    function turnPage(command) {
        $MAPF(true, CLASS_NAME);

        // Switch pointers to new page and keep a reference to the page that we are changing.
        var views = this.views,
            cmdCode = command.code,
            info = command.info,
            viewToHide = this.getCurrentView(),
            viewToShow;

        // Adjust collection of views.
        if (cmdCode === COMMAND_SHOW) {
            viewToShow = command.vw;

            var afterView = command.after;
            if (afterView) {
                popViews(views, afterView);
            }

            views.push(viewToShow);

        } else { // COMMAND_BACK
            popViews(views, command.vw);
            mstrmojo.tooltip.close();

            viewToShow = this.getCurrentView();

            // are we in BINARY mode and with a valid current project [TQMS#496469]
            if (mstrApp.useBinaryFormat && mstrApp.getCurrentProjectId()) {
                // If we go back to a folder, a report or a document, then tell backend side
                // For tablet version, it doesn't have "st" property for folders, so we rely on its id to be "rootController" for this case
                var vc = viewToShow.controller;

                if (vc && vc.st) {
                    var mid = '',
                        model = vc.model,
                        emptyFn = mstrmojo.emptyFn;

                    if (model && model.dataService) {
                        mid = model.dataService.msgId || '';
                    }

                    mstrApp.serverRequest({
                        taskId: "setCurrentView",
                        st: vc.st,
                        did: vc.did || '',
                        mid: mid
                    }, {
                        success: emptyFn,
                        failure: emptyFn
                    }, {
                        silent: true
                    });
                }
            }
        }

        // Does the old view have a before view hidden handler?
        if (viewToHide && viewToHide.beforeViewHidden) {
            viewToHide.beforeViewHidden(cmdCode);
        }

        // Does the new view have a before view visible handler?
        if (viewToShow.beforeViewVisible) {
            // Call the handler.
            viewToShow.beforeViewVisible(cmdCode);
        }

        // Use the info (if present in command) or insert view to get new info.
        info = info || insertView.call(this, viewToShow, (command.an === ANIMATION_FORWARD));

        // Is there more than one visible page now?
        if (info.isMulti) {
            // Cache the last command code and hidden view.
            this._lastCmd = cmdCode;
            this._hiddenView = viewToHide;

            this.turnPageAnimation(info.position, command);

            // Cache the new slider position.
            this._sliderStepPos = this._sliderPosition = info.position;
        } else {

            this.afterTurn(viewToShow);
        }

        // Cache the currently visible page.
        this._curVisiblePage = info.next;

        $MAPF(false, CLASS_NAME);
    }

    /**
     * Private layout configuration to shorten code size.
     *
     * @private
     */
    var $layoutCfg = {
        containerNode: '100%',
        sliderNode: '100%',
        p1Node: '100%',
        p2Node: '100%'
    };

    /**
     * Modifies the dom node dimension.
     *
     * @param {mstrmojo.MobileBooklet} me The booklet to modify.
     * @param {String} dimension The dimension ('height' or 'width') to change.
     *
     * @private
     */
    function dimensionChange(me, dimension) {
        var v = me[dimension];
        me.domNode.style[dimension] = v || 'auto';
    }

    /**
     * <p>Simple widget to scroll other widgets into view (either left or right).
     *
     * @class
     * @extends mstrmojo.Container
     * @borrows mstrmojo._HasLayout
     */
    mstrmojo.MobileBooklet = mstrmojo.declare(

        mstrmojo.Container,

        [ mstrmojo._HasLayout ],

        /*
         * @lends mstrmojo.MobileBooklet.prototype
         */
        {
            scriptClass: "mstrmojo.MobileBooklet",

            markupString: '<div id="{@id}" class="mstrmojo-MobileBooklet {@cssClass}" style="{@cssText}">' +
                              '<div class="mstrmojo-Mobilebooklet-slider">' +
                                  '<div id="{@id}_p1" class="mstrmojo-MobileBookletPage"></div>' +
                                  '<div id="{@id}_p2" class="mstrmojo-MobileBookletPage"></div>' +
                              '</div>' +
                          '</div>',

            markupSlots: {
                containerNode: function () { return this.domNode; },
                sliderNode: function () { return this.domNode.firstChild; },
                p1Node: function () { return this.domNode.firstChild.firstChild; },
                p2Node: function () { return this.domNode.firstChild.lastChild; }
            },

            markupMethods: {
                onheightChange: function () { dimensionChange(this, 'height'); },
                onwidthChange: function () { dimensionChange(this, 'width'); }
            },

            layoutConfig: {
                w: $layoutCfg,
                h: $layoutCfg
            },

            /**
             * How long (in milliseconds) the page animation should take.
             *
             * @type Integer
             * @default 400
             */
            duration: 500,

            /**
             * Whether we should perform animation or not
             *
             * @type Boolean
             */
            animate: true,

            /**
             * Animation constants.
             */
            ANIMATION_FORWARD: ANIMATION_FORWARD,
            ANIMATION_BACK: ANIMATION_BACK,

            init: function init(props) {
                this._super(props);

                // Initialize progress counter and view collection.
                this.views = [];

                //We will not animate for tablets in order to improve performance
                this.animate = !mstrApp.isTablet();
            },

            postBuildRendering: function postBuildRendering() {

                var sliderNode = this.sliderNode;

                // Attach an event to hear when the slider animation is done.
                var id = this.id;
                $D.attachEvent(sliderNode, 'webkitTransitionEnd', function (evt) {
                    var $this = mstrmojo.all[id];

                    // TQMS #499908: We shall handle this event only of its target is the slider.
                    // If the webkit event was fired so late that it was handled by the timeout - return out.
                    if (evt.target !== sliderNode || !$this.isAnimating()) {
                        return true;
                    }

                    // We've fired the webkit transition event - clear the fallback timeout
                    window.clearTimeout($this.webkitEventFallbackId);
                    delete $this.webkitEventFallbackId;

                    // Stop propagation so ancestor booklets don't hear the event as well.
                    evt.stopPropagation();

                    // Remove transition property.
                    sliderNode.style.webkitTransitionProperty = 'none';

                    // Call finish turn on booklet instance.
                    $this.finishTurn();

                    return false;
                });

                // Do we have a current view already?
                var view = this.getCurrentView();
                if (view) {
                    // The booklet was rendered with a view already in it so set the _curVisiblePage based on view slot.
                    this._curVisiblePage = this[view.slot];
                }

                return this._super();
            },

            /**
             * Returns the current display view (if any).
             *
             * @type mstrmojo.Widget
             */
            getCurrentView: function getCurrentView() {
                var views = this.views;
                return (views.length && views[views.length - 1]) || null;
            },

            beforeViewHidden: function beforeViewHidden() {
                // Get the current view.
                var view = this.getCurrentView(),
                    fn = view && view.beforeViewHidden;

                // Does the current view have a beforeViewHidden handler?
                if (fn) {
                    // YES, so call it.
                    fn.apply(view);
                }
            },

            /**
             * Returns the view at the supplied index.
             *
             * @param {Integer} index The index of the requested view (negative numbers will be treated as distance from end of collection).
             *
             * @type mstrmojo.Widget
             */
            getView: function getView(index) {
                var views = this.views;
                if (index < 0) {
                    index = $MATH.max(views.length + index - 1, 0);
                }

                return views[index];
            },

            /**
             * Called after a turn (with or without animation) is complete.
             *
             * @param {mstrmojo.Widget} newView The newly visible view.
             */
            afterTurn: function afterTurn(newView) {
                // Does the new view have an after view visible handler?
                if (newView.afterViewVisible) {
                    // Call the handler.
                    newView.afterViewVisible();
                }

                // Do we have any afterPageTurn subscribers?
                var evtName = 'afterPageTurn';
                if (mstrmojo.publisher.hasSubs(this.id, evtName)) {
                    // Raise afterPageTurn event.
                    this.raiseEvent({
                        name: evtName,
                        view: newView
                    });
                }
            },

            /**
             * Cleans up the widget that was just hidden.
             *
             * @param {Boolean} destroy We will destroy the widget (for a back operation) or unrender the widget (for forward operation) if this parameter is True.
             *
             * @returns {mstrmojo.Widget} The instance of the hidden widget.
             */
            cleanUpLastWidget: function cleanUpLastWidget(destroy) {
                // Grab the hidden widget.
                var widget = this._hiddenView;

                // Do we have a widget, and should we destroy it?
                if (widget) {

                    // Do we want to destroy the last widget AND Was the last command to go back?
                    if (destroy && this._lastCmd === COMMAND_BACK) {
                        // Destroy widget.
                        widget.destroy();
                    }

                    // Unrender widget.
                    widget.unrender();

                    // Remove the widget from the booklet children collection.
                    this.removeChildren(widget, true);
                }

                // Make sure the current page is always on top.
                var pages = this.getPages();
                pages.next.style.zIndex = 1;
                pages.current.style.zIndex = 2;

                // Clean up.
                delete this._hiddenView;
                delete this._lastCmd;

                return widget;
            },

            addView: function addView(view, afterView, animation) {
                // Do we have an after view?
                if (afterView) {
                    // Scroll the new view forward but position it after that afterView (which may not be the actual last view in the booklet).
                    this.show(view, afterView, animation || this.ANIMATION_FORWARD);

                } else {
                    // This is the first view to be displayed in this booklet so detroy any lingering views.
                    this.destroyViews();

                    // Turn forward to this view.
                    this.turnForward(view);
                }
            },

            /**
             * <p>Replaces the current view with the view passed in (no animation).</p>
             *
             * <p>Current view will be unrendered and destroyed.</p>
             *
             * @param {mstrmojo.Widget} view The new view to display.
             * @param {mstrmojo.Widget} targetView The view to replace.
             * @param {Boolean} [noDestroy=false] Whether to omit widget destruction.  Only pass true if the consumer will commit to maintaining and destroying the widget itself.
             */
            replaceView: function replaceView(view, targetView, noDestroy) {
                var idx = mstrmojo.array.indexOf(this.children, targetView);

                // Was the target view not found within the booklet?
                if (idx === -1) {
                    // It's likely that the user swiped past the target view already so exit.
                    return;
                }

                // Cache the current slot;
                var currentSlot = targetView.slot;

                // Iterate target and new view.
                mstrmojo.array.forEach([ view, targetView ], function (v) {
                    // Is this view a child of this booklet?
                    if (v.parent === this) {
                        // Remove and unrender.
                        this.removeChildren(v, true);
                        v.unrender();
                    }
                }, this);

                // Should we destroy the target view?
                if (!noDestroy) {
                    targetView.destroy();
                }

                // Set slot on replacement view.
                view.slot = currentSlot;

                // Add the replacement view.
                addChild.call(this, view);

                // Update the views collection.
                var views = this.views;
                idx = mstrmojo.array.indexOf(views, targetView);
                if (idx !== -1) {
                    views[idx] = view;
                }

                return view;
            },

            /**
             * Pops out of booklet all views up to the afterView then display the view.
             *
             * @param {mstrmojo.Widget} view The view to show.
             * @param {mstrmojo.Widget} afterView The booklet child view after which to show this view.
             * @param {int} animation The type of animation to use while displaying the view.
             *
             */
            show: function show(view, afterView, animation) {
                turnPage.call(this, {
                    code: COMMAND_SHOW,
                    vw: view,
                    after: afterView,
                    an: animation,
                    useAnim: this.animate
                });
            },

            /**
             * Turns the booklet forward with the supplied widget as the new page.
             *
             * @param {mstrmojo.Widget} The widget to display.
             */
            turnForward: function turnForward(view) {
                // Turn forward.
                turnPage.call(this, {
                    code: COMMAND_SHOW,
                    vw: view,
                    an: ANIMATION_FORWARD,
                    useAnim: this.animate
                });
            },

            /**
             * Pops out of booklet all views up to the toView then display the toView.
             *
             * @param {mstrmojo.Widget} toView The booklet child view that must become a current view.
             * @param {int} animation The type of animation to use while displaying the toView.
             *
             */
            goBack: function goBack(toView, animation) {
                // Turn backwards.
                turnPage.call(this, {
                    code: COMMAND_BACK,
                    vw: toView,
                    an: animation,
                    useAnim: this.animate
                });
            },

            unrender: function unrender(ignoreDom) {
                this._super(ignoreDom);

                // Delete the current page.
                delete this._curVisiblePage;

                // Do we have a current view?
                var currentView = this.getCurrentView();
                if (currentView) {
                    // Make sure the slot of the currentView is 'p1Node' so that if we render again it will display in the correct position.
                    currentView.slot = 'p1Node';
                }

                // Reset slider position fields.
                this._sliderStepPos = this._sliderPosition = 0;
            },

            /**
             * Destroys views from the end of the collection up to the target view.
             *
             * @param {mstrmojo.Widget} [targetView] The last view to be destroyed.  All views will be destroyed if this parameter is undefined.
             */
            destroyViews: function destroyViews(targetView) {
                var views = this.views;
                if (!targetView || views.indexOf(targetView) >= 0) {
                    // Start with the view at the top of the stack
                    var vw = views.pop();
                    while (vw) {

                        // Is this view in the current page slot?
                        if (this._curVisiblePage && (vw.domNode.parentNode === this._curVisiblePage)) {
                            // Kill the current visible page reference.
                            delete this._curVisiblePage;
                        }

                        // Destroy the view.
                        vw.destroy();

                        // Is this the target view?
                        if (vw === targetView) {
                            // We are done.
                            break;
                        }

                        // Get the next view.
                        vw = views.pop();
                    }
                }
            },

            /**
             * Turns the booklet backward, showing the previous view.
             *
             * @returns {Boolean} True if a page was turned back, False if there is no view to turn back to.
             */
            turnBack: function turnBack() {
                // Do we have only one view?
                if (this.views.length <= 1) {
                    // Return false so the consumer knows we didn't turn back.
                    return false;
                }

                // Turn backwards.
                turnPage.call(this, {
                    code: COMMAND_BACK,
                    an: ANIMATION_BACK,
                    useAnim: this.animate
                });

                return true;
            },

            isAnimating: function isAnimating() {
                return !!this._animating;
            },

            /**
             * Initializes a scroll operation from one the current view to the supplied view.
             *
             * @param {Object} touch The touch object as generated by {@link mstrmojo._HasTouchGestures}.
             * @param {mstrmojo.Widget} view The widget to scroll to.
             */
            beginScroll: function (touch, view) {
                // Are we already animating?
                if (this.isAnimating()) {
                    // Return false to halt this event.
                    return false;
                }

                // Insert the view into the new position (passing true to delay the add child).
                this._scrollInfo = insertView.call(this, view, (touch.delta.x < 0), true);

                // Set initial position.
                this.scroll(touch);
            },

            /**
             * Scrolls the booklet if a scroll has already been started.
             *
             * @param {Object} touch The touch object as generated by {@link mstrmojo._HasTouchGestures}.
             */
            scroll: function scroll(touch) {
                // Are we scrolling?
                if (this._scrollInfo) {
                    var oldPosition = (this._sliderStepPos || 0),
                        newPosition = this._sliderPosition = oldPosition - touch.delta.x;

                    // Scroll the slider node (with no animation).
                    positionSliderNode.call(this, newPosition, oldPosition, false, 0);
                }
            },

            /**
             * Completes a scroll operation, either snapping back if the user didn't scroll far enough to switch pages, or snapping to the new page.
             *
             * @param {Object} touch The touch object as generated by {@link mstrmojo._HasTouchGestures}.
             */
            endScroll: function endScroll(touch) {
                // Are we NOT scrolling?
                var info = this._scrollInfo;
                if (!info) {
                    // Nothing to do.
                    return;
                }

                var delta = touch.delta.x,                                          // The distance the scroll traveled.
                    originalPosition = this._sliderStepPos || 0,                    // The position the slider was at before the scroll was initiated.
                    position = this._sliderPosition = originalPosition - delta;     // Update local and instance position fields to current scrolled position.

                // Should we complete the scroll?
                if ($MATH.abs(delta) / parseInt(this.width, 10) > 0.25) {
                    // Turn the page to the new view.
                    turnPage.call(this, {
                        code: COMMAND_SHOW,
                        vw: info.view,
                        an: (delta >= 0) ? ANIMATION_FORWARD : ANIMATION_BACK,
                        info: info,
                        useAnim: true,
                        veloc: touch.velocity.x
                    });

                } else {
                    // Set hidden view for destruction after animation.
                    this._hiddenView = info.view;

                    // Call scroll canceled handler.
                    this.scrollCanceled(info.view.id);

                    // Animate back page turn.
                    positionSliderNode.call(this, originalPosition, position, true, 0);
                }

                // Clear the flag.
                delete this._scrollInfo;
            },

            /**
             * <p>Cleans a page node</p>
             *
             * @param {Object} page Page node that will be cleaned
             */
            cleanCurrentPage: function cleanCurrentPage(page) {
                page.innerHTML = '';
            },

            /**
             * <p>Positions the next view in the right location before doing animation</p>
             *
             * @param {Object} nextVisPage Node to be positioned
             * @param {Integer} sliderPosition Position where node will be moved
             */
            moveNextView: function moveNextView(nextVisPage, position) {
                $D.translate(nextVisPage, position, 0, 0, '', true);
            },

            /**
             * <p>Animates page turning.</p>
             *
             * @param {Integer} position Slider node position.
             * @param {Object} command A command object with properties about this particular page turn.
             *
             */
            turnPageAnimation: function turnPageAnimation(position, command) {
                // Should we use animation to show page?
                var useAnimation = command.useAnim,
                    id = this.id;

                if (useAnimation) {
                    // TQMS #484627: We need to ignore back buttons while we are animating.
                    mstrApp.animating = true;

                    // Indicate that we are currently animating.
                    this._animating = true;
                }

                // Position the slider.
                positionSliderNode.call(this, position, this._sliderPosition, useAnimation, command.veloc);

                if (useAnimation) {
                    // Add a fail safe in case the webkit transition end does not get fired
                    this.webkitEventFallbackId = window.setTimeout(function () {
                        var $this = mstrmojo.all[id];

                        // It's been too long for the webkit transition event to not have fired - so we'll handle it now
                        if ($this.isAnimating()) {
                            // Call finish turn so that all lingering views are destroyed.
                            $this.finishTurn();
                        }
                    }, 1000);
                }

                // Did we NOT animate?
                if (!useAnimation) {
                    // Call finish turn.
                    this.finishTurn();
                }
            },

            /**
             * <p>Get current and next pages</p>
             */
            getPages: function getPages() {
                var curVisPage = this._curVisiblePage,
                    nextVisSlot = (curVisPage === this.p1Node) ? 'p2Node' : 'p1Node';

                return {
                    current: curVisPage,
                    slot: nextVisSlot,
                    next: this[nextVisSlot]
                };
            },

            /**
             * jugomez May/11/2011
             * This function will perform the last steps of TurnPage event
             */
            finishTurn: function finishTurn() {
                // Ask the booklet to cleanup the recently hidden widget (true parameter means we should destroy or unrender the widget).
                this.cleanUpLastWidget(true);

                // Call custom hook for after turn.
                this.afterTurn(this.getCurrentView());

                // TQMS #484627: We need to ignore back buttons while we are animating.
                mstrApp.animating = false;

                // Clear animating flag.
                this._animating = false;
            },

            /**
             * Custom hook that can be implemented by subclasses to hear when a scroll operation was cancelled.
             *
             */
            scrollCanceled: mstrmojo.emptyFn,

            /**
             * <p>Overridden to apply page slot dimensions to both pages.</p>
             *
             * <p>This is because this method is only called for slots that have children in them, and this Widget
             * usually only has one page slot full at a time.</p>
             *
             * @ignore
             */
            setSlotDimensions: function setSlotDimensions(slot, h, w) {
                // Are we adjusting one of the page slots?
                if (slot.charAt(0) === 'p') {
                    // Set the other page slot dimensions as well.
                    this._super('p' + ([ 0, 2, 1 ][slot.charAt(1)]) + 'Node', h, w);
                }

                // Set original slot dimensions.
                this._super(slot, h, w);
            }
        }
    );

}());
