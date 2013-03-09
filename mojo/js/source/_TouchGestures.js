(function () {
    mstrmojo.requiresCls("mstrmojo.dom",
                         "mstrmojo.hash");

    mstrmojo.touchManager = new mstrmojo.Obj({
        notify: function (touch) {
            this.raiseEvent({
                name: 'touchesBegin',
                touch: touch
            });
        }
    });

    var $D = mstrmojo.dom,
        $DAE = $D.attachEvent,
        $DDE = $D.detachEvent,
        $MATH = Math,
        $C = window.mstrConfig,
        debug = false,                                                  // Set to 'true' to display logging statements in the js console.
        activeWinListener = null,                                       // Holds a reference to the widget that is currently listening to window touch events.
        defaultTouchConfiguration = $C && $C.allowDefaultTouches;

    /**
     * Constants for gesture timing.
     *
     * @type Integer
     * @private
     */
    var SWIPE_THRESHOLD = 10,
        TAP_TIMEOUT = 250,
        SELECT_DURATION = 400;

    /**
     * Constants to describe gesture event names.
     *
     * @type Integer
     * @private
     */
    var EVT_BEGIN = 'Begin',
        EVT_END = 'End',
        EVT_MOVE = 'Move',
        EVT_CANCEL = 'Cancel';

    /**
     * Constants to describe gesture actions.
     *
     * @type Integer
     * @private
     */
    var ACTION_SELECT = 1,
        ACTION_SWIPE = 2,
        ACTION_MULTI = 3,
        ACTION_TAP = 4;

    var actionMethodMap = {};
    actionMethodMap[ACTION_SELECT] = 'Select';
    actionMethodMap[ACTION_SWIPE] = 'Swipe';
    actionMethodMap[ACTION_MULTI] = 'Multi';
    actionMethodMap[ACTION_TAP] = 'Tap';

    // We need to disable the default action from the document so that the browser doesn't do it's own scroll out.
    // Attach the touch start event.
    $DAE(document.body, $D.TOUCHMOVE, function (evt) {
        //Has the environment been configured to prevent default?
        if (!$C || !$C.allowDefaultTouches) {
            if (evt.preventDefault) {
                evt.preventDefault();
                return false;
            }
        }

        return true;
    });

    /**
     * Returns the event identifier from the touch event or 1 for mouse events in the hosted application.
     *
     * @param {Event} evt The native touch or mouse event.
     *
     * @private
     */
    function getEvtIdentifier(evt) {
        var id = evt.identifier;
        return (id === undefined) ? 1 : id;
    }

    function debugLog(cmd, msg, widget, evt) {
        // Are we in "debug" mode?
        if (debug) {
            // Log the message to the JS console.
            var touchId = (evt) ? getEvtIdentifier(evt) + ' ' : '';
            window.console.log(cmd + ':' + ((widget) ? ' ' + widget.scriptClass + ' ' + widget.id : '') + ' ' + touchId + (msg || ''));
        }
    }

    /**
     * Returns a boolean indicating if the supplied widget is actively listening for window touch events.
     *
     * @param {mstrmojo.Widget} widget The widget to test.
     *
     * @private
     * @type Boolean
     */
    function isActive(widget) {
        return (activeWinListener === widget);
    }

    /**
     * Detaches touchMove, touchEnd and touchCancel event listeners from the window object.
     *
     * @param {mstrmojo.Widget} widget The widget that is tracking touch events.
     *
     * @private
     */
    function detachWinEvts(widget) {
        // Is this not the active widget?
        if (!isActive(widget)) {
            // Nothing to do.
            return;
        }

        debugLog('detachWinEvts', '', widget);

        // Attach events using Capture phase so the _TouchGestures hears these events before any other component.
        $DDE(window, $D.TOUCHMOVE, widget._tmCallback, true);
        $DDE(window, $D.TOUCHEND, widget._teCallback, true);
        $DDE(window, $D.TOUCHCANCEL, widget._teCallback, true);

        // Clear the active widget.
        activeWinListener = null;
    }

    /**
     * Attaches touchMove, touchEnd and touchCancel event listeners to the window object.
     *
     * @param {mstrmojo.Widget} widget The widget that will be tracking touch events.
     *
     * @private
     */
    function attachWinEvts(widget) {
        // Is this widget already active?
        if (isActive(widget)) {
            // Nothing to do.
            return;
        }

        // Do we have an active widget?
        var activeWidget = activeWinListener;
        if (activeWidget) {
            debugLog('forced deactivation', '', activeWidget);

            // This is a bug so de-activate it.
            detachWinEvts(activeWidget);
        }

        debugLog('attachWinEvts', '', widget);

        // Attach events for touch move, end and cancel.
        $DAE(window, $D.TOUCHMOVE, widget._tmCallback, true);
        $DAE(window, $D.TOUCHEND, widget._teCallback, true);
        $DAE(window, $D.TOUCHCANCEL, widget._teCallback, true);

        // Set this widget as the active widget.
        activeWinListener = widget;
    }

    function getWidgetHandlerMethodName(evtName, action) {
        return 'touch' + ((action && actionMethodMap[action]) || '') + (evtName || '');
    }

    /**
     * Creates the appropriate method name to handle this event.
     *
     *  @param {mstrmojo.Widget} widget The widget to handle this event.
     *  @param {String} [evtName=''] An optional name for the event to be handled.
     *  @param {Integer} [action] An optional action (corresponds to the actionMethodMap constants).
     *
     *  @private
     *  @type String
     *  @returns Either the name of the method to handle this event, or empty string if the widget doesn't handle this event.
     */
    function getWidgetHandler(widget, evtName, action) {
        // Create the method name.
        var methodName = getWidgetHandlerMethodName(evtName, action);

        // Return either the name of the method (if the widget can handle it) or an emtpy string.
        return (widget[methodName] !== undefined) ? methodName : '';
    }

    /**
     * Fires the appropriate widget method to handle this event.
     *
     * @param {mstrmojo.Widget} widget The widget to handle this event.
     * @param {String} [evtName=''] An optional name for the event to be handled.
     * @param {*[]} touch The touch object that gets passed as an argument to the widget's event handler.
     * @param {Integer} [action] An optional action matching one of the ACTION constants.
     * @param {Object} [gesture] An optional gesture object in the event that the touch object does not have it.
     *
     * @private
     * @returns Boolean Either the result of the method call or true if no call was made.
     */
    function fireWidgetHandler(widget, evtName, touch, action, gesture) {
        //Have we been supplied a gesture object or do we have to grab it from the touch?
        gesture = gesture || widget.gestures[touch.id];

        var target = (gesture && gesture.bubbleTarget) || widget,
            methodName = getWidgetHandler(target, evtName, action);

        if (methodName) {
            debugLog('fire', methodName, target);

            touch.methodName = methodName;

            return target[methodName].apply(target, [touch]);
        } else {
            debugLog('no handler', getWidgetHandlerMethodName(evtName, action), target);
        }

        return true;
    }

    /**
     * Creates an event object used to describe the properties of the touch event.
     *
     *
     * @param (HTMLEvent} e The original HTMLTouchEvent.
     * @param {Object} startTouch The gesture event object describing the initial touch gesture.
     * @param {HTMLTouchEvent} changedTouch The native touch event object.
     * @param {Object) [lastTouch] The last touch event to be used for calculating velocity, direction, etc.
     *
     * @type Object
     * @private
     *
     * @refactoring Should this use screenX.
     */
    function createTouchObject(e, startTouch, changedTouch, lastTouch) {
        var pageX = changedTouch.pageX,
            pageY = changedTouch.pageY,
            timeStamp = e.timeStamp,
            id = getEvtIdentifier(changedTouch),
            delta = {
                x: $MATH.round(pageX - startTouch.pageX),
                y: $MATH.round(pageY - startTouch.pageY)
            };

        var evt = {
            id: id,
            evt: e,
            pageX: pageX,
            pageY: pageY,
            clientX: changedTouch.clientX,
            clientY: changedTouch.clientY,
            target: changedTouch.target,
            delta: delta,
            date: timeStamp,
            stop: function () {
                debugLog('event stopped', id);

                // Stop event propagation.
                e.stopPropagation();
                e.cancelBubble = true;
            }
        };

        if (lastTouch) {
            // Calculate the differences between this touch event and the last touch event.
            var timeDelta = timeStamp - lastTouch.date,
                lastDelta = lastTouch.delta,
                accelDelta = {
                    x: $MATH.abs(delta.x - lastDelta.x),
                    y: $MATH.abs(delta.y - lastDelta.y)
                };

            // Add the velocity since the last touch event.
            evt.velocity = {
                x: accelDelta.x / timeDelta,
                y: accelDelta.y / timeDelta
            };

            // Add an is vertical flag indicating the general orientation of the swipe.
            evt.isVertical = (accelDelta.y > accelDelta.x);

            // Add the delta since the last touch event.
            evt.accelDelta = accelDelta;

            // Add the swipe direction since the last touch event.
            var direction = evt.direction = {};

            // Calculate direction.
            if (pageX !== lastTouch.pageX) {
                direction.x = (pageX < lastTouch.pageX);
            } else if (pageX !== startTouch.pageX) {
                direction.x = (pageX < startTouch.pageX);
            }

            if (pageY !== lastTouch.pageY) {
                direction.y = (pageY < lastTouch.pageY);
            } else if (pageX !== startTouch.pageX) {
                direction.y = (pageY < startTouch.pageY);
            }
        }

        return evt;
    }

    /**
     * Creates an object that encapsulates information about the current gesture.
     *
     * @param {Object} touch An encapsulating object for the current HTMLTouchEvent.
     * @param {Object} previousOneTouch An encapsulating object for the previous HTMLTouchEvent.
     * @param {Object} beginningTouch An encapsulating object for the HTMLTouchEvent that occurred before the previous HTMLTouchEvent.
     * @param {TouchEvent} evt The current touch event.
     *
     * @returns {Object} An object containing information about the current gesture.
     * @private
     */
    function createGestureObject(touch, previousOneTouch, previousTwoTouch, evt) {
        return {
            s: touch,
            p1: previousOneTouch,
            p2: previousTwoTouch,
            evt: evt,
            target: evt.target
        };
    }

    /**
     * Removes the gesture from the bubble target.
     *
     * @param {Widget} target The bubble target.
     * @param {String} touchId The id of the touch gesture to remove.
     */
    function deleteBubbleTargetGesture(target, touchId) {
        if (target) {
            target.gestures[touchId] = null;
        }
    }

    /**
     * Detaches touchMove and touchEnd events and calls the touchEnd method in the widget (if implemented);
     *
     * @param {mstrmojo.Widget} widget The widget that is tracking touch events.
     * @param {Object} touchObject The last touchObject.
     *
     * @private
     */
    function cancelTouch(widget, touchObject) {
        detachWinEvts(widget);

        fireWidgetHandler(widget, EVT_END, touchObject);
    }

    /**
     * Clears the touchSelect timeout handle.
     *
     * @private
     */
    function cancelSelect(widget) {
        if (widget._selectHandle) {
            // Clear select action.
            window.clearTimeout(widget._selectHandle);

            delete widget._selectHandle;

            debugLog('cancelSelect', '', widget);
        }
    }

    /**
     * Event handler for the initial touchStart event.
     *
     * @param {mstrmojo.Widget} widget The widget that is tracking touch events.
     * @param {HTMLEvent} e The native HTMLTouchEvent.
     *
     * @private
     */
    function touchesBegin(widget, e) {
        // Is this a right click mouse event?
        var which = e.which;
        if (which && which === 3) {
            debugLog('ignore', 'right mouse click', widget);

            // Ignore.
            return;
        }

        // Get initial touch event.
        var gestures = widget.gestures,
            touches = e.touches || [ e ],
            changedTouch = (e.changedTouches && e.changedTouches[0]) || e,
            isWidgetActive = isActive(widget),
            touchObject = createTouchObject(e, changedTouch, changedTouch),          // Pass the current touch as both the start and current because this is touchBegin.
            gesture = createGestureObject(touchObject, touchObject, touchObject, e);

        debugLog('touchBegin', '', widget, changedTouch);

        // Is this a multi-touch gesture?
        if (touches.length > 1) {
            // Is this widget NOT already active?
            if (!isWidgetActive) {
                // This is a case where we have a multi touch but the two touches are not on the same touch element so we need to stop the event...
                touchObject.stop();

                debugLog('ignore', 'cross widget multitouch', widget, changedTouch);

                // and ignore.
                return false;
            }
        } else {
            // Is this widget already active?
            if (isWidgetActive) {
                debugLog('forced deactivation', '', widget, changedTouch);

                // This is a bug where the detach events was never called so we need to detach them now.
                detachWinEvts(widget);

                // Clear isWidgetActive flag.
                isWidgetActive = false;
            }
        }

        // Should touches be restricted to the touchNode only?
        if (widget.singleNode && changedTouch.target !== widget._tn) {
            debugLog('ignore', 'target is not touch node', widget, changedTouch);

            return;
        }

        // Notify the touch manager that touches have begun.
        mstrmojo.touchManager.notify(touchObject);

        // Is this the first touch?
        if (!isWidgetActive) {
            // Get the target tag name.
            var tagName = touchObject.target.tagName;
            tagName = tagName && tagName.toLowerCase();

            // Is the target a select box or input field?
            if (tagName === 'select' || tagName === 'input') {
                debugLog('ignore', 'target is input or select', widget, changedTouch);

                // Return so we don't cancel interaction.
                return;
            }
        }

        // Store the beginning gesture.
        gestures[touchObject.id] = gesture;

        // Is this a multi-touch gesture?
        if (isWidgetActive) {

            // Does the widget NOT support multi-touch?
            if (!widget.multiTouch) {
                // Cancel the select to prevent the touchSelectBegin call in the timeout.
                cancelSelect(widget);

                // Fire touch cancel event.
                var prevTouch = touches[touches.length - 2],
                    prevGesture = gestures[getEvtIdentifier(prevTouch)];

                fireWidgetHandler(widget, EVT_CANCEL, prevTouch, prevGesture.action, prevGesture);
            } else {
                // Change action to multi-touch.
                gesture.action = ACTION_MULTI;

                // Is this the second touch?
                if (widget._singleTouch) {
                    // Cancel any lingering select actions.
                    cancelSelect(widget);

                    // Make sure single touch action is changed to 'Multi'.
                    widget._singleTouch.action = ACTION_MULTI;

                    // Delete the reference to single touch.
                    delete widget._singleTouch;

                    // Fire touchMultiBegin.
                    fireWidgetHandler(widget, EVT_BEGIN, touchObject, ACTION_MULTI);
                }
            }

            // Stop the event from bubbling so multiple touch enabled objects won't hear them.
            touchObject.stop();

            // Nothing more to do.
            return;
        }

        // If it's a single touch we need to make sure it started within the touchNode of the widget.
        if (!$D.contains(widget._tn, e.target, true, widget.domNode)) {
            // Remove the gesture.
            delete gestures[touchObject.id];

            // exit.
            return;
        }

        // Store the single gesture.
        widget._singleTouch = gesture;

        // Call touchBegin (if supported).
        if (fireWidgetHandler(widget, EVT_BEGIN, touchObject) === false) {
            // 'touchBegin' returned exactly false so cancel this operation before it begins.
            return;
        }

        // Stop the event from bubbling so multiple touch enabled objects won't hear them.
        touchObject.stop();

        // Does the widget support touch select operations?
        if (getWidgetHandler(widget, EVT_BEGIN, ACTION_SELECT)) {
            // Set a timeout to initiate a select after the select duration has passed.
            widget._selectHandle = window.setTimeout(function () {
                // Record that the current gesture is part of a 'select' operation.
                gesture.action = ACTION_SELECT;

                // Call touchSelectBegin, and if it returns EXACTLY false...
                if (fireWidgetHandler(widget, EVT_BEGIN, touchObject, ACTION_SELECT) === false) {
                    // the operation is not supported on this widget/element so cancel.
                    cancelTouch(widget, touchObject);
                }

                // Clear the timeout handle.
                delete widget._selectHandle;
            }, SELECT_DURATION);
        }

        // Attach events for touch move, end and cancel.
        attachWinEvts(widget);
    }

    /**
     * Event handler for the touchMove event.
     *
     * @param {mstrmojo.Widget} widget The widget that is tracking touch events.
     * @param {HTMLEvent} e The native HTMLTouchEvent.
     *
     * @private
     */
    function touchesMoved(widget, e) {
        var changedTouch = (e.changedTouches && e.changedTouches[0]) || e,
            gesture = widget.gestures[getEvtIdentifier(changedTouch)];

        // Did we not find a gesture?
        if (!gesture) {
            // This is likely due to an ignored multi touch event so ignore.
            return;
        }

        var touchObject = createTouchObject(e, gesture.s, changedTouch, gesture.p2),
            action = gesture.action;

        // Update stored previous gesture events.
        gesture.p2 = gesture.p1;
        gesture.p1 = touchObject;

        // Are we not already in the middle of an action AND has the touch moved more than the swipe threshold?
        if (!action && ($MATH.abs(touchObject.delta.x) > SWIPE_THRESHOLD || $MATH.abs(touchObject.delta.y) > SWIPE_THRESHOLD)) {
            // This must be a swipe so record the action.
            action = gesture.action = ACTION_SWIPE;

            // Cancel the select timeout.
            cancelSelect(widget);

            // Does the widget NOT support either the begin or move for the current action?
            if (!getWidgetHandler(widget, EVT_BEGIN, action) && !getWidgetHandler(widget, EVT_MOVE, action)) {
                // Add the method name to the touchObject.
                touchObject.methodName = getWidgetHandlerMethodName(EVT_BEGIN, action);

                // Bubble the event in case an ancestor does.
                return widget.bubbleTouchEvent(touchObject);
            }

            // Fire the touchSwipeBegin event handler.
            if (fireWidgetHandler(widget, EVT_BEGIN, touchObject, action) === false) {
                // The event handler explicitly returned false so the operation is not supported on this widget/element.
                cancelTouch(widget, touchObject);
                return;
            }
        }

        // Have we initiated an action?
        if (action) {
            fireWidgetHandler(widget, EVT_MOVE, touchObject, action);
        }
    }

    /**
     * Event handler for the touchEnd event.
     *
     * @param {mstrmojo.Widget} widget The widget that is tracking touch events.
     * @param {HTMLEvent} e The native HTMLTouchEvent.
     *
     * @private
     */
    function touchesEnd(widget, e) {
        var changedTouch = (e.changedTouches && e.changedTouches[0]) || e,
            touchCount = (e.touches && e.touches.length) || 0,          // If no touches collection then this is single touch environment.
            gestures = widget.gestures,
            touchId = getEvtIdentifier(changedTouch),
            gesture = gestures[touchId];

        // Did we not find a gesture?
        if (!gesture) {
            debugLog('No gesture', touchId, widget, changedTouch);

            // This is likely due to an ignored multi-touch so return and wait for the next one.
            return;
        }

        var action = gesture.action,
            touchObject = createTouchObject(e, gesture.s, changedTouch, gesture.p2);

        // Was no action initiated?
        if (!action) {
            // NO, then we need to cancel the select timeout.
            cancelSelect(widget);

            // If this isn't the last touch from a multi-touch operation than default to a tap operation.
            if (!gesture.wasMulti) {
                action = ACTION_TAP;
            }
        }

        // Are there no more touches in progress?
        if (touchCount === 0) {
            // All touches are over so detach the touch events...
            detachWinEvts(widget);

            // and clear gestures.
            widget.gestures = [];

            debugLog('gestures', 'clear all', widget, changedTouch);
        } else {
            // Remove the single gesture that has just ended.
            gestures[touchId] = null;

            debugLog('gestures', 'clear single', widget, changedTouch);
        }

        // Delete the gesture bubble target.
        deleteBubbleTargetGesture(gesture.bubbleTarget, touchId);

        // What type of action was completed?
        switch (action) {
        case ACTION_SWIPE:
        case ACTION_SELECT:
            fireWidgetHandler(widget, EVT_END, touchObject, action, gesture);
            break;

        case ACTION_MULTI:
            // Is the touch count now less than 2 (1 or 0)?
            if (touchCount < 2) {
                // Multi event is over so call 'touchMultiEnd'.
                fireWidgetHandler(widget, EVT_END, touchObject, action, gesture);

                // Is there one touch left?
                if (touchCount === 1) {
                    // This should now become a touchBegin so re-base the remaining touch event at it's current position.
                    var remainingTouch = e.touches[0],
                        rebasedTouch = createTouchObject(e, remainingTouch, remainingTouch),
                        newGesture = createGestureObject(rebasedTouch, rebasedTouch, rebasedTouch, e);

                    // Set a flag so that we don't initiate a 'tap' operation when the user releases the last touch.
                    newGesture.wasMulti = true;

                    // Store new gesture in place of the original.
                    gestures[getEvtIdentifier(remainingTouch)] = newGesture;

                    // Flag as single touch.
                    widget._singleTouch = newGesture;
                }
            }

            // Do we have any touches left?
            if (touchCount > 0) {
                // Return so 'touchEnd' is not called.
                return;
            }
            break;

        case ACTION_TAP:
            // Does the widget NOT care about taps?
            if (!getWidgetHandler(widget, null, action)) {
                // Nothing to do.
                break;
            }

            // Do we already have a tap timeout handler?
            var tapHandler = widget._tapHandler;
            if (tapHandler) {
                // YES, then clear the timeout that hasn't fired yet.
                window.clearTimeout(tapHandler.h);
            }

            // The user didn't swipe or select, but was it a quick tap operation?
            if (touchObject.date - gesture.s.date < SELECT_DURATION) {
                // Call touchTapBefore
                if (fireWidgetHandler(widget, 'Before', touchObject, action, gesture) === false) {
                    // touchTapBefore returned false so there is nothing to do.
                    break;
                }

                if (!widget.multiTap) {
                    // Add the count to the touch event.
                    touchObject.count = 1;

                    // Notify the widget.
                    fireWidgetHandler(widget, null, touchObject, action, gesture);

                } else {
                    // Do we already have a timeout for taps?
                    if (tapHandler) {
                        // YES, then increment the tap counter.
                        tapHandler.count++;
                    } else {
                        // NO, then create a new tap handler and store it on the instance.
                        tapHandler = widget._tapHandler = {
                            count: 1
                        };
                    }

                    // Set a time out to raise the tap event.  We need to do this to support multiple taps -- we don't want to fire the event
                    // until they have finished tapping.
                    tapHandler.h = window.setTimeout(function () {
                        // Add the count to the touch event.
                        touchObject.count = tapHandler.count;

                        // Notify the widget.
                        fireWidgetHandler(widget, null, touchObject, action, gesture);

                        // Clear the tapHandler.
                        delete widget._tapHandler;
                    }, TAP_TIMEOUT);
                }

            } else {
                // Kill the tapHandler.
                delete widget._tapHandler;
            }
            break;
        }

        // Fire the touchEnd event handler.
        fireWidgetHandler(widget, EVT_END, touchObject, undefined, gesture);
    }

    /**
     * Creates touch callbacks and attaches the initial event listener for the start of a touch.
     *
     * @param {mstrmojo.Widget} widget The widget whose touch node should track touches.
     *
     * @private
     */
    function attachTouchEvents(widget) {

        // Do we have a touch node?
        var touchNode = widget._tn;
        if (!touchNode) {
            // Nothing to do here, so exit.
            return;
        }

        // Have we not yet created the touch events callback?
        if (!widget._tmCallback) {
            // Create all callbacks.  We need to store all call backs so that we can release them later.
            widget._tsCallback = function (e) {
                touchesBegin(widget, e);
            };
            widget._tmCallback = function (e) {
                touchesMoved(widget, e);
            };
            widget._teCallback = function (e) {
                touchesEnd(widget, e);
            };
        }

        // Attach the touch start event.
        $DAE(touchNode, $D.TOUCHSTART, widget._tsCallback);
    }

    /**
     * <p>Tracks "touch gestures".</p>
     *
     * @class
     * @public
     */
    mstrmojo._TouchGestures = mstrmojo.provide(
        "mstrmojo._TouchGestures",
        /**
         * @lends mstrmojo._TouchGestures#
         */
        {
            /**
             * Indicates whether the touch events should be restricted to the touchNode, or include it's children.
             *
             * @type Boolean
             * @default false
             */
            singleNode: false,

            /**
             * Indicates whether we support multi-touch.
             *
             * @type Boolean
             * @default false
             */
            multiTouch: false,

            /**
             * The slot that should support touch gestures (will default to domNode).
             *
             * @type HTMLElement
             */
            touchNode: null,

            /**
             * Indicates whether to support multiple taps.  If false each tap will fire an individual tap event.
             *
             * @type Boolean
             * @default false
             */
            multiTap: false,

            /**
             * Caches a reference to the touch node, creates the gestures collection container and attaches touch events.
             *
             * @ignore
             */
            postBuildRendering: function postBuildRendering() {
                if (this._super) {
                    this._super();
                }

                // Get a handle to the touch node.
                this._tn = this.touchNode || this.domNode;

                // Local collection for gestures.
                this.gestures = [];

                // Attach touch events.
                attachTouchEvents(this);
            },

            /**
             * This function bubbles the touch to the widget's parent widget.
             *
             * @param touch The native touch event object.
             */
            bubbleTouchEvent: function bubbleTouchEvent(touch) {
                var evtName = touch.methodName,
                    touchId = touch.id,
                    gesture = this.gestures[touchId],
                    p = this.parent;

                // Loop till we get to a parent that cares about this particular event.
                while (p) {
                    // Get the current event method as well as the touch begin from the parent.
                    var targetMethod = p[evtName],
                        touchBegin = p.touchBegin;

                    // Does the parent support the current event method AND does it either NOT have a touchBegin OR does touchBegin NOT return false?
                    if (targetMethod && (!touchBegin || fireWidgetHandler(p, EVT_BEGIN, touch) !== false)) {
                        // Reset the touch method name (since it was changed in fireWidgetHandler).
                        touch.methodName = evtName;

                        // Delete the gesture bubble target.
                        deleteBubbleTargetGesture(gesture.bubbleTarget, touchId);

                        // Set the bubble target so all future events for this gesture can be delegated efficiently.
                        gesture.bubbleTarget = p;

                        // Add the gestures to the parent.
                        p.gestures[touchId] = gesture;

                        // Log bubble.
                        debugLog('bubble', ((this.k) ? ' ' + this.k : '') + '] bubbled ' + evtName + ' to [' + p.scriptClass + ((p.k) ? ' ' + p.k : '') + ']', this, touch);

                        // Call the event on the parent and return value.
                        return targetMethod.call(p, touch);
                    } else {
                        // We still haven't found a valid parent, keep looping through the ancestors.
                        p = p.parent;
                    }
                }

                return false;
            },

            /**
             * Detaches the touch events.
             *
             * @ignore
             */
            unrender: function unrender(ignoreDom) {
                // Is this widget currently listening to the window events?
                if (isActive(this)) {
                    // Detach the window event listeners.
                    detachWinEvts(this);
                }

                // Do we have a touch node?
                var touchNode = this._tn;
                if (touchNode) {
                    // Detach the touch start event.
                    $D.detachEvent(touchNode, $D.TOUCHSTART, this._tsCallback);
                }

                this._super(ignoreDom);
            },

            /**
             * Resets the configuration to allow or prevent the default touches.
             *
             * @param resetFlag Whether we would like to restore the default environment touch behavior (when true) or override it (when false).
             */
            restoreDefaultTouches: function restoreDefaultTouches(resetFlag) {
                if ($C) {
                    //adjust the flag...
                    $C.allowDefaultTouches = resetFlag && defaultTouchConfiguration;
                }
            }
        }
    );

}());