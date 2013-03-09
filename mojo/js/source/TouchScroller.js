(function () {

    mstrmojo.requiresCls("mstrmojo.Obj", 
                         "mstrmojo.hash",
                         "mstrmojo.dom");
    
    var $M = Math,
        $HS = mstrmojo.publisher.hasSubs,
        $forEachHash = mstrmojo.hash.forEach,
        $D = mstrmojo.dom;
    
    var VELOCITY_THRESHOLD = 0.15;      // Minimum velocity (pixels / ms) for deceleration.

    
    /**
     * Restricts a given point value to be within the supplied offsets.
     * 
     * @param {Number} value The position to constrain.
     * @param {Object} offset An object with 'start' and 'end' properties that define the limits of scrolling in a given direction.
     * 
     * @private
     */
    function constrainPoint(value, offset) {
        return (offset) ? $M.max($M.min($M.round(value), offset.end), offset.start) : value;
    }
    
    function raiseScrollerEvent(scroller, evtName, evtObj) {
        // Add name and identifier.
        evtObj.name = evtName;
        evtObj.id = scroller.identifier;
        
        // Raise event.
        scroller.raiseEvent(evtObj);
    }
    
    /**
     * Positions the scroller.scrollEl at the new position.
     * 
     * @param {mstrmojo.TouchScroller} The scroller.
     * @param {Object} position An object with 'x' and 'y' properties that indicate the current position of the scroll element.
     * @param {Integer} [duration=0] Number of milliseconds the position change should take.
     * @private
     */
    function applyPosition(scroller, position, duration) {
    	var scrollEl = scroller.scrollEl.style,
            positions = {
                x: position.x || 0,
                y: position.y || 0
            };
        
        // Iterate the scrollbars.
        $forEachHash(scroller._scrollBarEls, function (bar, axis) {
            var isX = (axis === 'x'),
                position = positions[axis],
                length = bar.length,
                ratio = bar.ratio,
                viewportSize = bar.viewportSize,
                minScale = 6 / length,
                minPosition = bar['base' + ((isX) ? 'Left' : 'Top')],
                maxPosition = minPosition + viewportSize - length,
                newPosition = $M.round(minPosition + (ratio * position));
            
            // Adjust position and bar length for scroll out cases.
            if (newPosition < minPosition) {
                newPosition = minPosition - position;
                length += position;
            } else if (newPosition > maxPosition) {
                var delta = (position - scroller.offset[axis].end) * ratio;
                newPosition = $M.min(maxPosition + delta, viewportSize + minPosition - 6) - 1;
                length -= delta;
            }
            
            // Move and size the bar.  Use webkitTransform for better performance.
            var v = 0,
                translate = [v, v, v],
                scale = [1, 1, 1],
                idx = (isX) ? 0 : 1;
            
            translate[idx] = (newPosition - minPosition);
            scale[idx] = $M.min($M.max(length / bar.length, minScale), 1);
            
            $D.translate(bar, translate[0], translate[1], translate[2], ' scale3d(' + scale.join(',') + ')');
        });
        
        if (duration) {
            duration += 'ms';
        }
        
        scrollEl.webkitTransitionDuration = duration || '0';    // Scroll is always instantaneous.
        $D.translate(scroller.scrollEl, -positions.x, -positions.y, 0, scroller.transform, scroller.useTranslate3d);
        
        // Is anybody listening for the "scrollMoved" event?
        if ($HS(scroller.id, 'scrollMoved')) {
            // Raise.
            raiseScrollerEvent(scroller, 'scrollMoved', {
                x: position.x,
                y: position.y
            });
        }
    }
    
    /**
     * Calculates the anticipated total time of deceleration required for the scroller's initial velocity to reduce to the final velocity 
     * given the constant friction parameter.
     * 
     * @param {Number} initialVelocity The velocity of the scroller at the start of the deceleration.
     * @param {Number} finalVelocity The velocity of the scroller at the end of the deceleration.
     * @param {Number} friction The friction that will constantly reduce the initial velocity till it reaches the final velocity
     * 
     * @return {Number}
     * 
     * @private
     */
    function fnGetTime(finalVelocity, initialVelocity, friction) {
        return $M.ceil(1 + $M.log(finalVelocity / $M.abs(initialVelocity)) / $M.log(1 - friction));
    }
    
    /**
     * Calculates the anticipated total distance the scroller would move (based on it's velocity) from it's current position 
     * for the given time interval. 
     * given the constant friction parameter.
     * 
     * @param {Number} position The initial position of the scroller.
     * @param {Number} directionMultipler +/-1 based on which direction the scroller is moving
     * @param {Number} initialVelocity The velocity of the scroller at the time when the distance moved needs to be calculated
     * @param {Number} timeInterval The time interval for which the scroller would move
     * @param {Number} friction The friction that will constantly reduce the initial velocity.
     * 
     * @return {Number}
     * 
     * @private
     */
    function fnGetPosition(position, directionMultiplier, initialVelocity, timeInterval, friction) {
        return position + (directionMultiplier * (initialVelocity * (1 - $M.pow(1 - friction, timeInterval)) / friction));
    }
    
    /**
     * <p>Calculates and returns the position of the given scroller on the given axis at a particular interval in time.</p>
     * 
     * <p>This method will calculate position and bounce state for each interval, as well as any events that
     *    need to be raised during that iteration. </p>
     *  
     * @param {mstrmojo.TouchScroller} The instance of {@link mstrmojo.TouchScroller} that has finished scrolling. 
     * @param (Number) The position of the scroller at the moment the user ends the swipe for the particular axis
     * @param {String} axis The axis that is decelerating ('x' or 'y').
     * @param {Boolean} direction The direction the user swiped in this axis (True for up or left, False for down or right).
     * @param {Number} velocity The starting velocity for this axis.
     * @param (Number) delta The time elapsed since the user ends the swipe
     * @param (Number) totalTime The total anticipated time to complete the deceleration
     * 
     * @returns Number
     * 
     * @private
     */
    function calculateAxisPosition(scroller, position, axis, direction, velocity, delta, totalTime) {
        var offset = scroller.offset[axis];     // Offsets object (for limits and options).
    
        // Is there no offset for this direction?
        if (!offset) {
            // Can't scroll in this direction so return a single frame with the current origin value.
            return position;
        }
        
        var outOfBounds = scroller._outOfBounds,                // TRUE if the user purposely scrolled outside the offsets. 
            incFetch = offset.incFetch,                         // Whether we support incremental fetch.
            friction = scroller.friction,
            start = offset.start,
            end = offset.end,
            limit = (direction) ? end : start;                  // The direction is true if the swipe was up or left, false if down or right.
        
        // Only work with positive values.
        velocity = $M.abs(velocity);
        
        // Is the start position out of bounds?
        if (outOfBounds) {
            // Make sure the direction and limit are correct.
            direction = (position < start);
            limit = (direction) ? start : end;
        }
        
        var directionMultiplier = (direction) ? 1 : -1;
        
        // Is the current position outside the start or is it outside the end AND incremental fetch is not supported?
        if (outOfBounds && (direction || !incFetch)) {
            // The user has scrolled outside the boundaries and needs to bounce back.
            // Calculate the initial velocity so that when we scroll back, we will end up with a final velocity of
            // three times the velocity threshold.
            var finalVelocity = VELOCITY_THRESHOLD * 3,
                a = 1 / (1 - friction),
                initialVelocity = finalVelocity / $M.pow((1 - friction), ($M.log(1 - $M.abs(position - limit) * (1 - a) / finalVelocity) / $M.log(a)) - 1);
            
            // Calculate the current position of the scroller
            var calculatedPosition = $M.round(fnGetPosition(position, directionMultiplier, initialVelocity, delta, friction));
            
            //Have we reached our destination?
            if (direction ? (calculatedPosition >= limit) : (calculatedPosition <= limit)) {
                //We're done scrolling out and have reached the limit, so stop deceleration 
                scroller.stopDeceleration();
                
                //Return the limit.
                return limit;
            }
            
            //We're still scrolling back from the scrolled out location.
            return calculatedPosition;
            
        } else {
            
            // The size of an incremental fetch page.
            var pageSize = offset.pageSize;
            
            // Get the new position.
            var newPosition = fnGetPosition(position, directionMultiplier, velocity, delta, friction),
                bStart = (newPosition <= start),
                bEnd = (newPosition >= end);
            
            // Is the new position outside the offset limits?
            if (bStart || bEnd) {
                
                // Should we do incremental fetch?
                if (bEnd && incFetch) {
                    // Have we scrolled to the end of the page?
                    if (newPosition - end >= pageSize) {
                        // Stop at the end of the new page.
                        newPosition = end + pageSize;
                        
                        // Reset limit to newPosition so we'll finish the iteration.
                        limit = newPosition;
                    }
                    
                    if (!scroller.STATUS_INC_FETCH) {
                        //We've moved past the end, fire off the incremental fetch event so the widget can handle it.
                        raiseScrollerEvent(scroller, 'incFetch', {});
                        
                        //Set the status
                        scroller.STATUS_INC_FETCH = true;
                    }
              
                } else {
                    
                    // Does the scroller bounce?
                    if (scroller.bounces) {
                        
                        //adjust the bounce friction
                        var bounceFriction = friction * 2,
                            bVelocity = scroller.bounceVelocity,
                            bTime = scroller.bounceTime,
                            bDistance = scroller.bounceDistance;
                        
                        //Has the scroller entered the bouncing state for the first time? Then cache the following properties 
                        if (!scroller.hasBounced) {
                            //The speed when the bounce occured.
                            bVelocity[axis] = $M.abs(VELOCITY_THRESHOLD / $M.pow(1 - friction, totalTime - delta - 1));
                            
                            //The total time to bounce...
                            bTime[axis] = fnGetTime(VELOCITY_THRESHOLD, bVelocity[axis], bounceFriction);
                            
                            //The total distance to bounce...
                            bDistance[axis] = $M.abs(fnGetPosition(newPosition, directionMultiplier, bVelocity[axis], bTime[axis], bounceFriction) - newPosition);
                            
                            // Raise the 'bounceOut' event so it will notify the listener that the scroller has entered it's bounced state.
                            scroller.raiseEvent({
                                name: 'bounceOut',
                                id: scroller.identifier,
                                axis: axis,
                                direction: direction,
                                value: $M.round(newPosition)
                            });

                            //The scroller is now in the bounced state.
                            scroller.hasBounced = true;
                        }
                        
                        var bounceLimit = Math.floor(bDistance[axis] / 2);
                        
                        // At what position are we and how far have we traveled into the bounce?
                        var bouncePosition = fnGetPosition(limit, directionMultiplier, bVelocity[axis], delta, bounceFriction),
                            travelDistance = $M.abs(bouncePosition - limit);
                        
                        //Have we reached the bounceLimit?
                        if ($M.abs(travelDistance) < bounceLimit) {
                            //If not, keep going.
                            return bouncePosition;
                        
                        //Have we completed the entire bounce and are moving past the destination?
                        } else if ($M.abs(travelDistance) >= bDistance[axis]) {
                            //We're done! Stop deceleration and return to the limit.
                            scroller.stopDeceleration();
                            return limit;
                        } else {
                            //We've reached the bounce limit and are going back to the edge.
                            var limitDistance = bounceLimit - (travelDistance - bounceLimit);
                            return $M.round(limit - ((direction) ? -limitDistance : limitDistance));  // Negative for swipes up and left.
                        }
                    }
                    
                    // Set newPosition to limit to make sure we end up at the limit, and to exit the iteration.
                    newPosition = limit;
                }
            }
            
            //Return the updated position..
            return $M.round(newPosition);
        }
    }
    
    /**
     * <p>This component is used to scroll an element via touch events.</p>
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.TouchScroller = mstrmojo.declare(
        mstrmojo.Obj,
        
        null,

        /**
         * @lends mstrmojo.TouchScroller.prototype
         */
        {
            scriptClass: "mstrmojo.TouchScroller",
            
            /**
             * The element to scroll.
             * 
             * @type HTMLElement
             */
            scrollEl: null,
            
            /**
             * Can be set by consumers to uniquely identify this mstrmojo.TouchScroller instance and will be passed out in the 'scrollDone' event.
             */
            identifier: '',
            
            /**
             * Whether the element scrolls horizontally.
             * 
             * @type Boolean
             * @default false
             */
            hScroll: false,
            
            /**
             * Whether the element scrolls vertically.
             * 
             * @type Boolean
             * @default false
             */
            vScroll: false,
            
            /**
             * An object with 'x' and 'y' properties that have 'start' and 'end' properties to indicate the scroll boundaries.  This object can optionally contain
             * a 'scrollPast' property that will be true if the user is allowed to scroll past the offset limits, but the element will bounce back to the limit when 
             * the scroll is completed.
             * 
             * @type Object
             */
            offset: null,
            
            /**
             * An object with 'x' and 'y' properties that contain the current 'x' and 'y' positions of the scroll element.
             * 
             * @type Object
             */
            origin: null,
            
            /**
             * An optional String containing extra properties to be set with each transformation (such a scale).
             * 
             * @type String
             */
            transform: '',
            
            /**
             * The friction that should be applied during deceleration.
             * 
             * @type Number
             * @default 0.0015
             */
            friction: 0.0015,
            
            /**
             * The number of animation frames per second.
             * 
             * @type Number
             * @default 60
             */
            frameRate: 60,
            
            /**
             * Indicates whether the scroll element should bounce when it reaches it's offset limits.
             * 
             * @type Boolean
             * @default true
             */
            bounces: true,
            
            /**
             * Indicates whether the scroller is currently in the bounced state.
             * 
             * @type Boolean
             * @default false
             */
            hasBounced: false,
            
            /**
             * Indicates the distance the scroller has to travel upon bouncing. It includes to properties, 
             * x and y indicating the values for each axes.
             * 
             * @type Object
             */
            bounceDistance: {},
            
            /**
             * Indicates the time needed for the scroller to complete the bounce. It includes two properties, 
             * x and y indicating the values for each axes.
             * 
             *  @type Object
             */
            bounceTime: {},
            
            /**
             * Indicates the velocity of the scroller the the moment the scroller enters the bounced state. It
             * includes two properties, x and y indicating the values for each axes.
             * 
             * @type Object
             */
            bounceVelocity: {},
            
            /**
             * Indicates whether scroll bars should appear as the scrollEl is scrolled.
             * 
             * @type Boolean
             * @default false
             */
            showScrollbars: false,
            
            /**
             * Do we want to update the default device behavior into using translate3d
             * 
             * @type Boolean
             * @default true
             */
            useTranslate3d: true,
            
            /**
             * This property stores whether the scroller has triggered an incremental fetch call on the widget
             * and is waiting for data. It is turned back to false once the widget retrieves it's data.
             * 
             * @type Boolean
             * @default false
             */
            STATUS_INC_FETCH: false,
            
            /**
             * <p>Return true if this scroller is configured to scroll (based on vScroll and hScroll).</p>
             * 
             * @returns Boolean True if this scroller can scroll.
             */
            canScroll: function canScroll() {
                return this.vScroll || this.hScroll;
            },
            
            /**
             * <p>Updates scroll bar position and size.</p>
             * 
             * <p>This method will also initialize the scrollbars if we haven't already and the showScrollbars property is true.</p>
             * 
             * @param {Object} [viewportCoords] An optional object with top, right, bottom and left positions of the viewport relative to 
             *                                  the scrollBarContainerElement.  If undefined the left and top will be assumed to be zero and
             *                                  the right and bottom will be the width and height of the scrollEl parentNode.
             * @param {HTMLElement} [scrollBarContainerElement] Optional container element for the scroll bars.  If omitted, the parentNode 
             *                                  of the scrollEl property will be used.  
             */
            updateScrollBars: function updateScrollBars(viewportCoords, scrollBarContainerElement) {
                var scrollEl = this.scrollEl;
                
                // Are we not showing scrollbars, or do we not have a scroll element yet?
                if (!this.showScrollbars || !scrollEl) {
                    // Nothing to do here.
                    return;
                }
                
                var bars = this._scrollBarEls;
                
                // Have we NOT created the scroll bar DOM elements yet?
                if (!bars) {
                    var me = this;
                    bars = this._scrollBarEls = {
                        x: 'hScroll',
                        y: 'vScroll'
                    };
                    
                    // Iterate the axes...
                    $forEachHash(bars, function (scroll, axis) {
                        // Do we support scrolling for this axis?
                        if (me[scroll]) {
                            // YES, then create the scroll bar element...
                            var bar = document.createElement('div');
                            bar.className = 'mstrmojo-touch-scrollBar ' + axis + 'Axis';
                            
                            // and insert into DOM and scrollBars collection.
                            (scrollBarContainerElement || scrollEl.parentNode).appendChild(bar);
                            bars[axis] = bar;
                        } else {
                            // NO, so remove this axis from the collection of bars.
                            delete bars[axis];
                        }
                    });
                }

                // Did the consumer not supply viewportCoords?
                if (!viewportCoords) {
                    // Create viewportCoords based on the scoll elements parent node.
                    var parentNode = this.scrollEl.parentNode;
                    viewportCoords = {
                        top: 0,
                        right: parentNode.offsetWidth,
                        bottom: parentNode.offsetHeight,
                        left: 0
                    };
                }
                
                // Convert the viewportCoords into position (and length) coordinates for the scrollbars.
                var offset = 9,
                    scrollBarCoords = {
                        x: {
                            left: viewportCoords.left,
                            top: viewportCoords.bottom - offset,
                            x: viewportCoords.right - viewportCoords.left,
                            d: 'Width'
                        }, 
                        y: {
                            left: viewportCoords.right - offset,
                            top: viewportCoords.top,
                            x: viewportCoords.bottom - viewportCoords.top,
                            d: 'Height'
                        }
                    };
            
                // Size the scrollbars.
                $forEachHash(bars, function (bar, axis) {
                    var barStyle = bar.style,
                        coords = scrollBarCoords[axis],
                        dimension = coords.d,
                        parentNode = bar.parentNode,
                        x = coords.x;
                    
                    // Calculate position...
                    var left = (coords.left - parentNode.offsetLeft),
                        top = (coords.top - parentNode.offsetTop),
                        ratio = x / scrollEl['offset' + dimension],
                        length = Math.min(Math.round(x * ratio), x);
                    
                    // cache on bar for scrolling...
                    bar.baseLeft = left;
                    bar.baseTop = top;
                    bar.ratio = ratio;
                    bar.viewportSize = x;
                    bar.length = length;

                    // position and size bar.
                    barStyle.left = left + 'px';
                    barStyle.top = top + 'px';
                    barStyle[dimension.toLowerCase()] = length + 'px';
                });
            },
            
            /**
             * Displays (or hides) the scrollbars based on the visible parameter.
             * 
             * @param {Boolean} visible Indicates whether the scrollbars should be visible or not.
             */
            toggleScrollBars: function toggleScrollBars(visible) {
                $forEachHash(this._scrollBarEls, function (bar) {
                    bar.style.opacity = (visible) ? 1 : 0;
                });
            },
            
            /**
             * <p>Scrolls to the given position (without animation).</p>
             * 
             * <p>The position will be constrained to the current offset values.</p>
             * 
             * @param {Integer} x The coordinate along the x axis.
             * @param {Integer} y The coordinate along the y axis.
             * @param {Integer} [duration=0] Number of milliseconds scroll should take.             
             */
            scrollTo: function (x, y, duration) {
                var offset = this.offset,
                    origin = this.origin,
                    position = {
                        x: (this.hScroll) ? constrainPoint(x, offset.x) : 0,
                        y: (this.vScroll) ? constrainPoint(y, offset.y) : 0
                    };
                
                // Apply the new scroll position.
                applyPosition(this, position, duration);
                
                // Update the origin.
                origin.x = position.x;
                origin.y = position.y;
            },
                        
            /**
             * Scrolls the element based on the touch event parameter.
             * 
             * @param {Object} touch The touch event associated with this scroll operation.
             */
            scroll: function scroll(touch) {
                if (!this.canScroll()) {
                    return;
                }

                var origin = this.origin,
                    offset = this.offset,
                    position = {
                        x: (this.hScroll) ? origin.x - touch.delta.x : 0,
                        y: (this.vScroll) ? origin.y - touch.delta.y : 0
                    },
                    constrainedX = constrainPoint(position.x, offset.x),
                    constrainedY = constrainPoint(position.y, offset.y);
                
                // Is the user not allowed to scroll past the offsets?
                if (!offset.scrollPast) {
                    // Constrain the position.
                    position.x = constrainedX;
                    position.y = constrainedY;
                    
                } else {
                    // The user is allowed to scroll past the offsets so have they?
                    var outOfBounds = (constrainedX !== position.x || constrainedY !== position.y),
                        evtName = '';
                    
                    // Did the user previously scroll past the offsets?
                    if (this._outOfBounds) {
                        // Has the current scroll moved them back within the offsets?
                        if (!outOfBounds) {
                            // May need to raise the "scrollIn" event.
                            evtName = 'scrollIn';
                        }
                        
                    // Has the current scroll moved past the boundaries?
                    } else if (outOfBounds) {
                        // May need to raise the "scrollOut" event.
                        evtName = 'scrollOut';
                    }
                    
                    // Has the scrollOut status changed?
                    if (evtName) {
                        // Is anybody listening for this event?
                        if ($HS(this.id, evtName)) {
                            // Raise the event with the new current position and direction.
                            var direction = touch.direction;
                            raiseScrollerEvent(this, evtName, {
                                x: {
                                    position: position.x,
                                    direction: direction.x
                                },
                                y: {
                                    position: position.y,
                                    direction: direction.y
                                }
                            });
                        }
                        
                        // Set a flag to indicate the outOfBounds status.
                        this._outOfBounds = outOfBounds;
                    }
                }
                
                // Apply the new position.
                applyPosition(this, position);
            },

            /**
             * Ends a scroll operation.
             * 
             * @param {Object} touch The touch event associated with this scroll end operation.
             */
            scrollEnd: function scrollEnd(touch) {
                //If the scroller can't scroll in either direction, don't do anything
                if (!this.canScroll()) {
                    return;
                }
                
                var id = this.id,
                    friction = this.friction,
                    a = 1 / (1 - friction),
                    initialPosition = this.origin,
                    initialVelocity = touch.velocity,
                    direction = touch.direction,
                    startTime = new Date(),
                    outOfBounds = this._outOfBounds,
                    offset = this.offset,
                    canScrollAxis = {
                        x: this.hScroll,
                        y: this.vScroll
                    },
                    velocity = {}, 
                    position = {}, 
                    directionMultiplier = {}, 
                    totalTime = {}, 
                    totalDistance = {}, 
                    finalVelocity = {}, 
                    start = {}, 
                    end = {}, 
                    limit = {},
                    initializeVars = function (axis) {
                        //Set the expected velocity of the scroller as the threshold 
                        finalVelocity[axis] = VELOCITY_THRESHOLD;
                        
                        //Has the offset been assigned along this axis?
                        if (offset[axis]) {
                            //Cache the start and end of the offsets.
                            start[axis] = offset[axis].start;
                            end[axis] = offset[axis].end;
                            
                            //Is the scroller out of bounds
                            if (outOfBounds) {
                                // Make sure the direction and limit are correct.
                                direction[axis] = (position[axis] < start[axis]);
                                limit[axis] = (direction[axis]) ? start[axis] : end[axis];
                            }
                            
                            // Is the current position outside the start or is it outside the end AND incremental fetch is not supported?
                            if (outOfBounds && (direction[axis] || !offset[axis].incFetch)) {
                                // The user has scrolled outside the boundaries and needs to bounce back.
                                // Calculate the initial velocity so that when we scroll back, we will end up with a final velocity of
                                // three times the velocity threshold.
                                finalVelocity[axis] = VELOCITY_THRESHOLD * 3;
                                initialVelocity[axis] = finalVelocity[axis] / $M.pow((1 - friction), ($M.log(1 - $M.abs(position[axis] - limit[axis]) * (1 - a) / finalVelocity[axis]) / $M.log(a)) - 1);
                            }
                        }
                        
                        //Calculate the initial velocity and position of the scroller
                        velocity[axis] = (canScrollAxis[axis]) ? $M.abs(initialVelocity[axis]) : 0;
                        position[axis] = (canScrollAxis[axis]) ? initialPosition[axis] - touch.delta[axis] : initialPosition[axis];
                        
                        directionMultiplier[axis] = (direction[axis] || false) ? 1 : -1;
                        
                        //Finally calculate the totalTime required to complete the deceleration and the total distance required for the DOM to move.
                        totalTime[axis] = fnGetTime(finalVelocity[axis], velocity[axis], friction); 
                        totalDistance[axis] = fnGetPosition(position[axis], directionMultiplier[axis], velocity[axis], totalTime[axis], friction);
                    };
                
                //Initialize all the properties along both the axes.
                initializeVars('x');
                initializeVars('y');
                
                //Initialize all the bounce properties of the scroller
                this.hasBounced = false;
                this.bounceDistance = {};
                this.bounceTime = {};
                this.bounceVelocity = {};
        
                // Flag that deceleration is taking place.
                this.decelerating = true;
                
                var expectedInterval = Math.round(1000 / this.frameRate),           //Calculate the best anticipated interval for our deceleration
                    prevTime = startTime,                                           //Store the time at start of the deceleration.
                    actualInterval;                                                 //This variable will store the actual time it takes to perform the interval.
        
                // Set up an interval loop to perform the animation.
                this.decelerationTimer = window.setTimeout(function () {
                    var scroller = mstrmojo.all[id],
                        origin = scroller.origin,
                        curTime = new Date(),
                        delta = (curTime - startTime);

                    // TQMS 497890
                    if(scroller._halt) {
                    	scroller.stopDeceleration();
                    	return;
                    }
                    
                    // Calculate actual time it took to fire this timeout since the next.
                    actualInterval = curTime - prevTime;
                    prevTime = curTime;
                    
                    if (actualInterval > (expectedInterval + 5)) {
                        expectedInterval = expectedInterval + $M.round((actualInterval - expectedInterval) / 2);
                    }
                    
                    // #493132  calculateAxisPosition returns a NaN value.  save origin actual values and restore if NaN
                    var ox = origin.x,
                    	oy = origin.y;
                    
                    // Update the current position property of the scroller.
                    origin.x = calculateAxisPosition(scroller, position.x, 'x', direction.x, velocity.x, delta, totalTime.x);
                    origin.y = calculateAxisPosition(scroller, position.y, 'y', direction.y, velocity.y, delta, totalTime.y);
                    
                    // #493132: calculateAxisPosition returns a NaN value.  save origin actual values and restore if NaN
                    if (isNaN(origin.x) || isNaN(origin.y)) {
                    	origin.x = ox;
                    	origin.y = oy;
                    }                    
                                                            
                    // Position the scroll element at the new position.
                    applyPosition(scroller, origin);

                    // Have we not reached the total time expected for deceleration and does the scroller NOT bounce?
                    var stopDecel = (delta > totalTime.x && delta > totalTime.y);
                    if (!stopDecel && !scroller.bounces) {
                        
                        // Assume we will stop.
                        stopDecel = true;
                        
                        // Iterate offset axes.
                        mstrmojo.hash.forEach(offset, function (axis, key) {
                            // Get current origin for this axis.
                            var v = origin[key];
                            
                            // Is the current origin for this axis NOT at the start or end position? 
                            if (v !== axis.end && v !== axis.start) {
                                // No need to stop.
                                stopDecel = false;
                                
                                // Return false to halt iteration.
                                return false;
                            }
                        });
                    }
        
                    // Should we stop deceleration?
                    if (stopDecel) {
                        scroller.stopDeceleration();
                        
                    } else if (scroller.decelerating) {
                        // Continue deceleration.
                        this.decelerationTimer = window.setTimeout(arguments.callee, expectedInterval);
                        
                    }
                    
                }, expectedInterval);  
                
            },
            
            /**
             * Stops active deceleration operation and will raise the 'scrollDone' event.
             * 
             */
            stopDeceleration: function stopDeceleration(supressEvt) {
                // Are we decelerating?
                var isDecelerating = !!this.decelerating;
                if (isDecelerating) {
                    // Do we have a deceleration interval?
                    if (this.decelerationTimer) {
                        // Clear the interval.
                        window.clearTimeout(this.decelerationTimer);                
                        delete this.decelerationTimer;
                    }
                    
                    // Clear the flag...
                    delete this.decelerating;
                    
                    // Hide the scrollbars.
                    this.toggleScrollBars(false);
                    
                    // Tell the consumer that we have scrolled.
                    // Cache the direction for scroll done.
                    var evtName = 'scrollDone',
                        origin = this.origin;
                    if ($HS(this.id, evtName) && (supressEvt !== true)) {
                        raiseScrollerEvent(this, evtName, {
                            x: origin.x,
                            y: origin.y
                        });
                    }
                    
                    // delete scroll instance properties.
                    delete this._outOfBounds;
                    delete this.hasBounced;
                    delete this.bounceDistance;
                    delete this.bounceTime;
                    delete this.bounceVelocity;
                    delete this._halt;
                }
                
                return isDecelerating;
            },

            haltScroller: function haltScroller() {
            	this._halt = !!this.decelerating;
            },
            
            /**
             * cleans up the TouchScroller and all it's events
             */
            destroy: function destroy() {
                if (this._scroller) {
                    this.stopDeceleration(true);
                }
                this._super();
            }
            
            
        }
    );
    
    /**
     * Calculates the total scroller offset values for a given widget, through all ancestors.
     * 
     * @param {Widget} widget The widget whose offsets should be calculated.
     * 
     * @returns {Object} An object with x and y values representing the total amount scrolled for the widget and all it's ancestors.
     * 
     * @static
     */
    mstrmojo.TouchScroller.getScrollPositionTotals = function getScrollPositionTotals(widget) {
        var parent = widget.parent,
            scroller = widget._scroller,
            origin = mstrmojo.hash.copy((scroller && scroller.origin) || {      // Use scroller origin, or 0,0 if missing.
                x: 0,
                y: 0
            });
        
        // Do we have a parent?
        if (parent) {
            // Call recursively and add result.
            var parentOrigin = mstrmojo.TouchScroller.getScrollPositionTotals(parent);
            origin.x += parentOrigin.x;
            origin.y += parentOrigin.y;
        }
        
        return origin;
    };
    
}());