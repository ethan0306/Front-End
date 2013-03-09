(function () {

    mstrmojo.requiresCls(
        "mstrmojo.dom",
        "mstrmojo._TouchGestures",
        "mstrmojo.TouchScroller"
    );

    var $forEachArray = mstrmojo.array.forEach,
        $forEachHash = mstrmojo.hash.forEach,
        $D = mstrmojo.dom;

    /**
     * Translates an HTML element. It in turn calls the translate method on mstrmojo.dom
     *
     * @param (Array)   node A collection of HTMLElement that needs to translated.
     * @param (Array)   c Coordinates across which the node has to be translated ([x,y,z])
     *
     */
    function translate(node, c) {
        var i;
        for (i in node) {
            $D.translate(node[i], c[0], c[1], c[2]);
        }
    }

    /**
     * Helps preventing noise on the wrong axis while scrolling.
     *
     * @param t The HTMLTouchEvent
     *
     * @return (Object) with boolean values for both x and y axes.
     */
    function preventMove(t) {
        var abs = Math.abs;
        return {
            x: (abs(t.accelDelta.x) < abs(t.accelDelta.y)),
            y: (abs(t.accelDelta.y) < abs(t.accelDelta.x))
        };
    }

    /**
     * Raises an event with the new origin positions.
     *
     * @param {mstrmojo._TouchScroll} The scroller.
     * @param {Object} position An object with 'x' and 'y' properties that indicate the current position of the scroll element.
     *
     * @private
     */
    function raiseScrolledOutEvent(scroller, e) {
        scroller.raiseEvent({
            name: 'scrolledOut',
            value: e.value,
            axis: e.axis,
            direction: e.direction
        });
    }

    /**
     * Creates an instance of type {@link mstrmojo.TouchScroller} and sets up the scroll element,
     * offsets, and the direction in which it scrolls.
     *
     * @param {HTMLElement} el The scroll Element.
     * @param offset (Object) The Boundaries beyond which the scroller cannot scroll
     * @param v (Boolean) Whether the scroller scrolls along the Y - axis
     * @param h (Boolean) Whether the scroller scrolls along the X - axis
     * @param {Number} frameRate The number of animations per second when decelerating the scroller.
     * @param {Boolean} showBar Whether the scroller should show scrollbars.
     */
    function setupScroller(el, offset, v, h, frameRate, showBar, friction) {
        var scroller = new mstrmojo.TouchScroller({
            scrollEl: el,
            vScroll: v,
            hScroll: h,
            frameRate: frameRate,
            showScrollbars: showBar,
            offset: offset,
            origin: {
                x: 0,
                y: 0
            },
            bounces: false,    //TODO: don't bounce as for lock headers it has to adjust the container.
            useTranslate3d: true
        });

        //Do we have a friction value provided? Then we want to override the default friction on the TouchScroller.
        if (friction) {
            scroller.friction = friction;
        }

        return scroller;
    }

    /**
     * Takes a scroller and calls stop deceleration on it.
     *
     * @param: s Scroller element {@link mstrmojo.TouchScroller}
     */
    function stopDeceleration(scroller) {
        var i;
        //Loop through all the scrollers in the array
        for (i in scroller) {
            // Stop any deceleration.
            if (scroller[i].decelerating) {
                scroller[i].stopDeceleration();
            }
        }
    }

    /**
     * Stores whether we want to restrict the scrolling along one axis.
     *
     * @type Object of boolean
     * @default false
     */
    var PREVENT_MOVEMENT = {
        x: false,
        y: false
    };

    /**
     * Returns the current axis of movement.
     *
     * @return {String} 'x' or 'y' depending on the axis. Null if neither.
     */
    function getAxis() {
        var prevent = PREVENT_MOVEMENT;

        //Since we restrict movement only to one axes, only one of the properties will be false.
        if (!prevent.x) {
            return 'x';
        }
        if (!prevent.y) {
            return 'y';
        }
        //Although unlikely, this returns the axis as null when nothing has happened.
        return null;
    }

    /**
     * Stores a boolean whether we have swapped the container node as the scroll element.
     *
     * @type Boolean
     * @default false
     */
    var isContainerScrollElement = {
        x: false,
        y: false
    };

    /**
     * Changes the scroll element dynamically in lock header cases to account for iphone incremental
     * fetch and page by gestures.
     *
     * @param {mstrmojo._HasXtabTouchScroll} widget The Xtab Touch Scroller mixin widget.
     * @param {Object} d The object which contains the new X and Y positions.
     */
    function syncScrollEl(xtab, d) {
        //Get the current axis of movement on the widget.
        var currentAxis = getAxis(),
            scrollPast = xtab.scrollerConfig.scrollPast;

        //Do we have an axis of movement or is the Xtab not going to scrollPast?
        if (!currentAxis || !scrollPast) {
            //No Axis? Exit out. OR If the Xtab can't scrollPast, then let scrolling continue
            return !!currentAxis && !scrollPast;
        }

        function syncHelper(axis) {
            var container = xtab.viewport,
                node = xtab._TSN[axis],
                scroller = xtab._scroller[axis],
                curPosition = xtab.tPos[axis],
                newPosition = d[axis],
                isCntrScrllEl = isContainerScrollElement[axis],
                otherAxis = (axis === 'x') ? 'y' : 'x',
                otherScroller = xtab._scroller[otherAxis],
                isContainerOnOtherAxis = isContainerScrollElement[otherAxis],
                i;

            //In the event that we're done scrolling, and the other axis still has the container node and isn't
            //decelerating, we want to reset it back to the scroll nodes.
            if (!otherScroller[0].decelerating && isContainerOnOtherAxis) {
                //Special case when we have to sync the scroller on the other axis. However, we don't
                //care about the result hence we don't use the return value.
                syncHelper(otherAxis);
            }

            //Has the user scrolled out of the top or left ?
            if (curPosition <= 0 && newPosition > 0) {

                if (!isCntrScrllEl) {
                    if (isContainerOnOtherAxis) {
                        //Exit out as we cannot have two scrollers updating the same dom node. Causes flashing
                        return false;
                    }

                    //TODO: this should take into account the other axis.
                    translate(node, [0, 0, 0]);

                      //Change the scroll elements to the container node.
                    for (i in scroller) {
                        scroller[i].scrollEl = container;
                    }

                    //The scroll element is now the container
                    isContainerScrollElement[axis] = true;
                }
            } else {

                if (isCntrScrllEl) {
                    //TODO: this should take into account the other axis.
                    translate([container], [0, 0, 0]);

                    //Normal scroll, set the scroll elements back to the original scroll nodes.
                    for (i in scroller) {
                        scroller[i].scrollEl = node[i];
                    }

                    //The scroll element is no longer the container
                    isContainerScrollElement[axis] = false;
                }
            }

            //The function executed successfully. Return true.
            return true;
        }

        //Perform the sync on the current axis of movement.
        return syncHelper(currentAxis);
    }

    function handleScrollEvents(xtab, evt) {
        var axis = evt.axis,
            incRender = xtab.scrollboxHeightFixed,
            evtName = evt.name;

        if (xtab.ss) {
            //Get the row info based on the position from the zone...
            var rowInfo = xtab.zones._BR.getRowInfoByPosition(evt[axis]);

            //Add the current position to the info object.
            rowInfo.position = evt[axis];

            //Trigger the on move on the sticky sections.
            xtab.ss.onMove(rowInfo);
        }

        //Set the new position.
        //TODO: In some cases, evt.x or evt.y are objects and this tPos should NOT be assigned to that object.
        xtab.tPos[axis] = evt[axis];

        if (evtName === 'scrollDone') {
            // Hide all scrollbars.
            $forEachHash(xtab._scroller, function (scrollers) {
                $forEachArray(scrollers, function (scroller) {
                    scroller.toggleScrollBars(false);
                });
            });

            //Checks if we have to sync the scroll element in the event if we're at the limits.
            if (!syncScrollEl(xtab, evt)) {
                return true;
            }
        }

        // Is this the Y axis
        if (axis === 'y') {

            // Utility function for calling onScrolledToLastRow.
            var fnEnd = function (newPosition) {
                // Is the xtab not already downloading and is the new position at or beyond the bottom row of available data?
                if (!xtab._isDownloading && (-newPosition <= xtab._TMAX[axis])) {
                    //Do we need to do something if we have reached the bottom?
                    if (xtab.onScrolledToLastRow) {
                        xtab.onScrolledToLastRow();
                    }
                }
            };

            // Is this the scrollDone event?
            if (evtName === 'scrollDone') {
                // Clear decelerating flag.
                delete xtab._isDecelerating;

                // Do we have a cached download?
                if (xtab._cachedDownload) {
                    // Tell the xtab to render the cachedDownload.
                    xtab.dataDownloaded();
                } else {
                    // Has the user scrolled to the end of the available content?
                    fnEnd(evt.y);
                }

                //Do we support Incremental Render?
                if (incRender) {
                    // Scroll is done so tell the grid to render another "Page" in the direction of the scroll.
                    var newPosition = evt.y;

                    xtab.notifyScrollListeners({
                        x: evt.x,
                        y: Math.max(newPosition, 0)
                    });
                }

            } else if (evtName === 'scrollDecel') {
                // Store flag to indicate that we are decelerating.
                xtab._isDecelerating = true;

                // Will the position be at the end of the available content after download?
                fnEnd(evt.fY);

                //Do we support Incremental Render
                if (incRender) {
                    // Grid is about to decelerate so render the page at the final resting position.
                    xtab.notifyScrollListeners({
                        x: evt.fX,
                        y: evt.fY
                    });
                }
            } else if (evtName === 'scrollOut') {
                // Store flag to indicate that we are decelerating.
                xtab._isDecelerating = true;

                // Has the user scrolled to the end of the available content?
                fnEnd(evt.y.position);
            }
        }
    }

    function getScrollerOffsets(widget, axis) {
        var abs = Math.abs,
            offset = {};

        //create the offset object
        var axisOffset = offset[axis] = {
            start: widget._TMIN[axis],
            end: abs(widget._TMAX[axis])
        };

        //Set the scroll past property as defined by the scroller config.
        offset.scrollPast = widget.scrollerConfig.scrollPast;

        // Is this the y axis?
        if (axis === 'y') {
            //Do we want to use seamless incremental fetch? Set the incFetch flag on the scroller.
            if (widget.useSeamlessIncFetch) {
                // Add the incFetch flag to indicate whether the scroller will be performing incremental fetch in this direction.
                axisOffset.incFetch = !widget.endFetching;

                // Page Size should be scrollbox height minus four rows. If we don't have fixed row height, we'll set it to scrollbox height minus 100px (magic number)
                axisOffset.pageSize = widget.scrollboxHeight - ((parseInt(widget.gridData.rh, 10) || 25) * 4);
            }
        }

        return offset;
    }

    function createScrollers(widget) {
        // Create the helper scrollers.
        widget._scroller = {
            x: [],
            y: []
        };

        var viewportCoords = widget._viewportCoords;

        // Iterate touch nodes to create scrollers.
        $forEachHash(widget._TSN, function (nodes, axis) {
            var offset = getScrollerOffsets(widget, axis),
                isY = (axis === 'y'),
                isX = (axis === 'x'),
                len = nodes.length;

            // Iterate each node on this axis...
            $forEachArray(nodes, function (node, idx) {
                // and setup the scroller.  Note that we only show scrollbars for the last scroller on the current axis. (if the Xtab is setup to show scrollbars)
                var scroller = setupScroller(node, offset, isY, isX, widget.frameRate, (idx === len - 1) && widget.scrollerConfig.showScrollbars, widget.scrollerFriction);
                scroller.updateScrollBars(viewportCoords, widget.domNode);

                widget._scroller[axis][idx] = scroller;
            });

            // Attach an event listener to the first scroller in each axis to hear scrollDone and scrollMoved.
            // TODO: We may be able to remove scrollMoved and use scrollDecel instead.
            var zeroScroller = widget._scroller[axis][0],
                evts = [ 'scrollDone', 'scrollMoved' ];

            if (zeroScroller) {
                // Is this a "y" axis scroller?
                if (isY) {
                    // Add scrollDecel and scrollOut event listeners too.
                    evts = evts.concat([ 'scrollDecel', 'scrollOut' ]);
                }

                // Iterate complete list of events for this axis.
                $forEachArray(evts, function (evtName) {
                    // Attach event listeners.
                    zeroScroller.attachEventListener(evtName, widget.id, function (evt) {
                        // Add axis and call handler.
                        evt.axis = axis;
                        handleScrollEvents(widget, evt);
                    });
                });
            }
        });
    }

    /**
     * Whenever the Xtab's dimension changes, we need to update the offsets such that the user can scroll properly to either end.
     *
     * @param {String} dimension Whether we need to update the dimension properties along the height or width.
     */
    function updateOffsets(dimension) {
        // Has the Xtab already rendered?
        if (this.hasRendered) {
            //Update the dimensions.
            this[dimension + 'Limit'] = parseInt(this[dimension], 10);

            // Do we support scrolling (TQMS: #509604)?
            if (this.zones) {
                //Set offsets.
                this.setOffsets();
            }
        }
    }

    /**
     * <p>A mixin that enables scrolling for the widget.
     * It supports scrolling different nodes across different axes within the touchNode (defaults to domNode).
     *
     * </p>
     *
     * @implements mstrmojo._TouchGestures hence requires the widget to include the mixin.
     * @class
     * @public
     */
    mstrmojo._HasXtabTouchScroll = mstrmojo.provide(
        "mstrmojo._HasXtabTouchScroll",
        /**
         * @lends mstrmojo._HasXtabTouchScroll#
         */
        {
            /**
             * Flag to disable scroller initialization during postBuildRendering.
             *
             * @type Boolean
             * @default false
             */
            noScrolling: false,

            /**
             * Flag to identify whether we are using touch scroller for the scrolling.
             *
             * @type Boolean
             * @default true
             */
            useTouchScrolling: true,

            /**
             * <p>A configuration object that can be used to pass properties to the {@link mstrmojo.TouchScroller}.</p>
             */
            scrollerConfig: {
                showScrollbars: false,
                scrollPast: true
            },

            /**
             * Touch specific nodes. These nodes are Array objects to support multiple nodes for scrolling.
             * These nodes get assigned in setupTNs in postBuildRendering.
             * Each of them is an array of HTMLElement.
             */
            _TSN: null,

            /**
             * Stores the position of the nodes with every touch movement
             *
             * @type Object of Integer
             * @default 0
             */
            tPos: {
                x: 0,
                y: 0
            },

            /**
             * Stores the minimum limit for movement of the touch nodes along the x and y axis.
             *
             * @type Object of Integer
             * @default 0
             */
            _TMIN: {
                x: 0,
                y: 0
            },

            /**
             * Setup the touch scroll nodes depending which nodes have to scroll across the x
             * and y axis.
             * By default they get assigned to the domNode.
             */
            setupTNs: function setupTNs() {
                //Default the scroll nodes to the domNode.
                this._TSN.x = this._TSN.y = [this.domNode];
            },

            /**
             * Handler called by the {@link mstrmojo._TouchGestures} mixin when the user touches the screen
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchBegin: function touchBegin(touch) {
                // Do we support scrolling for this instance?
                if (!this.noScrolling) {
                    // We want to all touch events within this component so cancel the native event.
                    touch.stop();

                    if (!this._isDownloading) {
                        if (this.toolbarMgr) {
                            this.toolbarMgr.closeToolbar();
                        }

                        var scrollers = this._scroller,
                            min = this._TMIN,
                            max = this._TMAX;

                        //Stops deceleration if  the scroller is within bounds.
                        $forEachHash(this.tPos, function (position, axis) {
                            // Cancel deceleration only if the scroller is within bounds. If out of bounds,
                            // let it decelerate to initial position.
                            if (position >= min[axis] && position <= Math.abs(max[axis])) {
                                //Stop deceleration for all scrollers along the axis.
                                stopDeceleration(scrollers[axis]);
                            }
                        });
                    }

                    // Due to the chunk of data being moved, the 2 scrollers on the x axis get misaligned.
                    // Reset the x values on both the scrollers origin.
                    var xScrollers = this._scroller.x;
                    $forEachHash(xScrollers, function (scroller) {
                        scroller.origin.x = xScrollers[0].origin.x;
                    });
                }

                // Return true so the tap is fired.
                return true;
            },

            /**
             * Handler called by the {@link mstrmojo._TouchGestures} mixin when a touch event is initiated.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSwipeBegin: function touchSwipeBegin(touch) {
                // Do we not support scrolling for this instance?
                if (this.noScrolling) {
                    // Bubble the event.
                    return this.bubbleTouchEvent(touch);
                }

                // Are we downloading new data?
                if (this._isDownloading) {
                    // Return false to cancel touch event.
                    return false;
                }

                PREVENT_MOVEMENT = preventMove(touch);

                // Check if we need to bubble this event to the parent and set the flag so we know that we're in bubble mode.
                var axis = PREVENT_MOVEMENT.y ? 'x' : 'y',
                    scroller = this._scroller[axis][0],
                    offset = scroller.offset,
                    offsetVal = offset[axis][touch.direction[axis] ? 'end' : 'start'];

                //Are we currently scrolling past the offset? Then we want to bubble the event to the parent
                if (!offset.scrollPast && offsetVal === scroller.origin[axis]) {
                    return this.bubbleTouchEvent(touch);
                }

                //Stop deceleration along the x and y axis.
                var s = this._scroller;

                //Syncs the scroll element when at the limits.
                if (!syncScrollEl(this, touch.delta)) {
                    return true;
                }

                //Stop deceleration only if the user scroller scrolls on the same axis.
                //In other cases let the deceleration complete.
                if (!PREVENT_MOVEMENT.x) {
                    stopDeceleration(s.x);
                }
                if (!PREVENT_MOVEMENT.y) {
                    stopDeceleration(s.y);
                }

                // Display the scrollbars.
                $forEachHash(this._scroller, function (scrollers, axis) {
                    // Are we moving along this axis?
                    if (!PREVENT_MOVEMENT[axis]) {
                        // Show the scroll bar for this axis.
                        $forEachArray(scrollers, function (scroller) {
                            scroller.toggleScrollBars(true);
                        });
                    }
                });

                return true;
            },

            /**
             * Handler called by the {@link mstrmojo._TouchGestures} mixin when a touch event move occurs.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSwipeMove: function touchSwipeMove(touch) {
                //Syncs the scroll element when at the limits.
                //TODO: may not be the best idea to do this in touchSwipeMove. Needs better fix.
                if (!syncScrollEl(this, touch.delta)) {
                    return true;
                }

                var scrollers = this._scroller;

                $forEachArray([ 'x', 'y' ], function (axis) {
                    if (!PREVENT_MOVEMENT[axis]) {
                        $forEachHash(scrollers[axis], function (scroller) {
                            scroller.scroll(touch);
                        });
                    }
                });
            },

            /**
             * Handler called by the {@link mstrmojo._TouchGestures} mixin when a touch event has ended.
             *
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSwipeEnd: function touchSwipeEnd(touch) {
                var prevent = PREVENT_MOVEMENT,
                    axis = null,
                    delta = touch.delta,
                    direction = touch.direction;

                if (!prevent.x && delta.x !== 0) {
                    axis = 'x';
                    direction = direction.x ? 'left' : 'right';
                }
                if (!prevent.y && delta.y !== 0) {
                    axis = 'y';
                    direction = direction.y ? 'up' : 'down';
                }

                if (axis) {
                // Tell the consumer that we have scrolled.
                    raiseScrolledOutEvent(this, {
                        axis: axis,
                        value: this.tPos[axis],
                        direction: direction
                    });

                    //Perform scrollend deceleration animation on the particular axis.
                    var scroller = this._scroller[axis],
                        i;
                    if (!prevent[axis]) {
                        for (i in scroller) {
                            scroller[i].scrollEnd(touch);
                        }
                    }
                }

            },

            /**
             * Callback by the individual containing grids of the Xtab notifying the Xtab that they have finished rendering.
             *
             * Once they have finished rendering, we measure them again to calculate the right offsets.
             */
            gridPagesRendered: function gridPagesRendered() {
                if (this._super) {
                    this._super();
                }

                this.setOffsets();
            },

            /**
             * Override the empty grid rendering method to set the noScrolling flag to be true
             */
            renderEmptyGrid: function renderEmptyGrid() {
                if (this._super) {
                    this._super();
                }

                this.noScrolling = true;
            },

            postBuildRendering: function postBuildRendering() {

                if (this._super) {
                    this._super();
                }

                // Do we support scrolling and do we have zones?
                if (this.zones) {
                    var me = this;

                    //Set up the scrollers in a timeout so as to speed up browser rendering performance. The setting up the scroller a little later doesn't affect
                    //scrolling.
                    window.setTimeout(function () {
                    	// #551347 make sure that the widget is rendered.  When rotating device widget might have been unrendered
                    	if(me.hasRendered) { 
                        me._TSN = {
                            x: [],        //Touch Scroll Node along the X axis
                            y: []         //Touch scroll node along the Y axis
                        };

                        // Setup the Touch scroll nodes after everything is done.
                        me.setupTNs();

                        // Set the no scrolling flag if the user can't scroll in either direction and scroll past is off.
                        var noScrolling = me.noScrolling = (!me.scrollerConfig.scrollPast && me._TMAX.x === 0 && me._TMAX.y === 0);

                        // Now that we have determined that the grid can scroll, let's set up the scrollers.
                        if (!noScrolling) {
                            //Set boolean since onload, the container is not a scroll element.
                            isContainerScrollElement = {
                                x: false,
                                y: false
                            };

                            //There is a flickering issue when we scroll the report for the very first time. Not sure why but it only happens when
                            //we call the webkit translate method for the very first time. Hence adding it when we setup the touch nodes.
                            translate(me._TSN.x, [0, 0, 0]);
                            translate(me._TSN.y, [0, 0, 0]);

                            //Associate scrollers with the touch scroll nodes.
                            createScrollers(me);
                    		}
                        }
                    }, 0);
                }
            },

            /**
             * @see mstrmojo.MobileXtab
             */
            setOffsets: function setOffsets() {
                var me = this,
                    domNode = this.domNode,
                    zones = this.zones,
                    TR = zones._TR,
                    BL = zones._BL,
                    isDocNotFullScreen = (!this.isFullScreenWidget && this.isDocXtab),
                    viewportCoords = this._viewportCoords = {
                        top: (TR) ? TR.cp.rc * parseInt(this.gridData.rh, 10) : 0,
                        //For grids in documents displayed at template level, we want to retreive the width from the formats. - Applies to Xtabs and Interactive Grids
                        right: (isDocNotFullScreen) ? this.widthLimit : parseInt(this.width, 10),
                        bottom: (isDocNotFullScreen) ? this.heightLimit : parseInt(this.height, 10),
                        left: (BL) ? BL.totalColWidth : 0
                    };

                // If we're already created the scrollers, iterate them
                $forEachHash(this._scroller, function (scrollers, axis) {
                    // Iterate the scroll bars for this axis.
                    $forEachArray(scrollers, function (scroller) {
                        // Update the offsets.
                        scroller.offset = getScrollerOffsets(me, axis);

                        // Update the scrollbar sizes and positions.
                        scroller.updateScrollBars(viewportCoords, domNode);

                        //If we already have an origin - check its validity after the offsets have changed
                        var origin = scroller.origin;
                        if (origin) {
                            //Scroll to that position. If the origin is at an invalid position, it will constrain it to the offsets.
                            scroller.scrollTo(origin.x, origin.y);
                        }
                    });
                });
            },

            /**
             * Callback when the viewport's height changes. Typically gets called on Xtab's rendered as full screen and if the
             * device orientation changes.
             */
            onwidthChange: function onwidthChange() {
                updateOffsets.call(this, 'width');

                // Call super.
                if (this._super) {
                    this._super();
                }
            },

            /**
             * Callback when the viewport's height changes. Typically gets called on Xtab's rendered as full screen and if the
             * device orientation changes.
             */
            onheightChange: function onheightChange() {
                updateOffsets.call(this, 'height');

                // Call super
                if (this._super) {
                    this._super();
                }
            },

            /**
             * @see mstrmojo._HasMarkup
             */
            unrender: function unrender(ignoreDom) {
                 // Iterate the scroller axes.
                $forEachHash(this._scroller, function (scrollers) {
                    // Iterate the individual scrollers for this axis.
                    $forEachArray(scrollers, function (scroller) {
                        //Destroy the scrollers.
                        scroller.destroy();
                    });
                });

                if (this._super) {
                    this._super(ignoreDom);
                }
            }
        }
    );
}());