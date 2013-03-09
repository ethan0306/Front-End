(function(){

    mstrmojo.requiresCls(
        "mstrmojo.dom",
        "mstrmojo.hash");
    
    var _D = mstrmojo.dom,
        _H = mstrmojo.hash;
    
    /**
     * Number of milliseconds between each animation "frame".
     * 
     * @private
     * @type Integer
     */        
    var MS_PER_FRAME = 100;
    
    /**
     * Amplification factor for velocity. Increase for faster "flick" scrolling.
     * 
     * @private
     * @type Number
     */
    var SPEED_AMP = _D.supportsTouches ? 0.5 : 1;

    /**
     * The minimum velocity needed to start "flick" scrolling; in pixels per frame.
     * 
     * @private
     * @type Integer
     */
    var MIN_VELOCITY = 1;
    
    
    /**
     * The amount of time between movements at which point we will reset he starting position to the current position.
     * 
     * @private
     * @type Integer
     */
    var DRAG_TIME_LIMIT = 100;

    /**
     * <p>A collection of cross-browser markup methods to be applied to the scrolling widget in order to render the scrolling.</p>
     *
     * <p>If the widget's "usesTouches" property is true, this mixin's touch event handlers will maintain the widget's properties
     * "vscrollVisible" and "hscrollVisible" (type: Boolean).  When these properties are toggled, these markup methods will
     * respond by setting the display (and position) of "vscroll" and "hscroll" slot nodes. If the widget does not define such
     * slots, the markup methods below will do nothing.</p>
     *
     * @type Object
     * @private
     */
    var commonMarkupMethods = {
            onvscrollVisibleChange: function(){
                var v = this.vscrollNode,
                    s = v && v.style;
                if (!s) {
                    return;
                }
                
                if (this.vscrollVisible) {
                    var max = this.maxPos,
                        cz = this.clientSize;
                    s.height = Math.round(cz.y * cz.y / max.y) + 'px';
                    s.left = (cz.x - 5)+'px';
                    s.display = 'block';
                    s.opacity = 0.5;
                } else {
                    s.opacity = 0;
                }
            },
            onhscrollVisibleChange: function(){
                var h = this.hscrollNode,
                    s = h && h.style;
                if (!s) {
                    return;
                }
                
                if (this.hscrollVisible) {
                    var max = this.maxPos,
                        cz = this.clientSize;
                    s.width = Math.round(cz.x * cz.x / max.x) + 'px';
                    s.top = (cz.y - 5)+'px';
                    s.display = 'block';
                    s.opacity = 0.5;
                } else {
                    s.opacity = 0;
                }
            }
    };
        
    /**
     * <p>A collection of webkit-specific markup methods to be applied to the scrolling widget in order to render the scrolling.</p>
     * 
     * <p>If the widget's "usesTouches" property is true, the widget will be assigned a "pos" property at run-time, which
     * keeps track of its current scroll x and y coordinates.  This mixin's touch handlers will respond to touches by
     * modifying that "pos" property.  These markup methods respond to that property's changes by
     * rendering the current scroll position in DOM via webkit css techniques which render much faster & smoother in Safari
     * than standard DOM techniques like "node.scrollTop" and "node.scrollLeft" (especially on iPhone/iTouch, where the difference
     * is even greater).</p>
     *
     * @private
     * @type Object
     */
    var webkitMarkupMethods = _H.copy(
        {
            onposChange: function(){
                var cz = this.clientSize,
                    max = this.maxPos,
                    x = 0,
                    y = 0;
                if (this.scrollsVert) {
                    y = this.pos.y;
                    if (this.vscrollVisible) {
                        this.vscrollNode.style.webkitTransform = 'translateY(' + Math.round((cz.y - (cz.y*cz.y/max.y)) * this.pos.y / max.y) + 'px)';
                    }
                }
                if (this.scrollsHoriz) {
                    x = this.pos.x;
                    if (this.hscrollVisible) {
                        this.hscrollNode.style.webkitTransform = 'translateX(' + Math.round((cz.x - (cz.y*cz.x/max.x)) * this.pos.x / max.x) + 'px)';
                    }
                }
                this.scrollChild.style.webkitTransform = 'translate3d(-' + parseInt(x,10) + 'px, -'+ parseInt(y,10) + 'px, 0px)';
            },
            ondeceleratingChange: function(){
                this.scrollChild.style.webkitTransition = this.decelerating ? "-webkit-transform 0.2s linear" : "";
            }
        },
        _H.copy(commonMarkupMethods)
    );
    
    /**
     * <p>A collection of non-webkit alternatives to the webkit-specific markup methods to be applied to the scrolling widget in order to render the scrolling.</p>
     * 
     * <p>If the widget's "usesTouches" property is true, the widget will be assigned a "pos" property at run-time, which
     * keeps track of its current scroll x and y coordinates.  This mixin's touch handlers will respond to touches by
     * modifying that "pos" property.  This markup method responds to that property's changes by
     * rendering the current scroll position in DOM using standard DOM techniques like "node.scrollTop" and "node.scrollLeft",
     * which work in all browsers but don't render as smoothly & quickly in webkit.</p>
     *
     * @private
     * @type Object
     */
    var nonwebkitMarkupMethods = _H.copy(
        {
            onposChange: function(){
                var cz = this.clientSize,
                    max = this.maxPos,
                    x = 0,
                    y = 0,
                    sb = this.scrollboxNode;
                if (this.scrollsVert) {
                    y = this.pos.y;
                    if (this.vscrollVisible) {
                        this.vscrollNode.style.top = Math.round((cz.y - (cz.y*cz.y/max.y)) * this.pos.y / max.y) + 'px';
                    }
                    sb.scrollTop = parseInt(y,10);
                }
                if (this.scrollsHoriz) {
                    x = this.pos.x;
                    if (this.hscrollVisible) {
                        this.hscrollNode.style.left = Math.round((cz.x - (cz.y*cz.x/max.x)) * this.pos.x / max.x) + 'px';
                    }
                    sb.scrollLeft = parseInt(x,10);
                }
            }
        },
        _H.copy(commonMarkupMethods)
    );
    
    /**
     * <p>Enables "touch scrolling", i.e., the ability to pan a scrollable HTML element by either (1) dragging a
     * mouse in computer or (2) dragging your finger in a touch device, like iPhone.</p>
     * @class
     * @public
     */
    mstrmojo._TouchScrolling = mstrmojo.provide(
        "mstrmojo._TouchScrolling",
        /**
         * @lends mstrmojo._TouchScrolling#
         */
        {
            /**
             * <p>Deceleration rate, applied when you fling the scrolling with a sudden gesture.</p>
             *
             * <p>Should be between 0 and 1, exclusive. A value of 1 would cause no decrease in velocity.
             * A value of 0 would cause an immediate stop in velocity. Intermediate values specify the
             * rate at which velocity decreases per frame of animation.  For example, if velocity is initially
             * 100px per frame, then at the 2nd frame of animation, velocity will go down to 85px per frame.</p>
             *
             * @type Number
             */
            FRICTION: 0.65,
            
            /**
             * The deceleration rate applied when scrolling encounters a boundary and this.bounces is true.
             * 
             * @type Number
             */
            BOUNCEFRICTION: 0.50,
                        
            /**
             * If true, scrolling by drag of a mouse/touch is enabled; otherwise, scrolling is handled
             * by traditional scrollbars/scrollwheel.
             * 
             * @type Boolean
             */
            usesTouches: false,
            
            /**
             * If true, decelerating scrolling will "bounce" in the opposite direction when it reaches a boundary.
             * Otherwise, deceleration stops abruptly at a boundary.
             * 
             * @type Boolean
             */
            bounces: true,

            /**
             * If true, horizontal scrolling is enabled.
             * 
             * @type Boolean
             */
            scrollsHoriz: true,

            /**
             * If true, vertical scrolling is enabled.
             * 
             * @type Boolean
             */
            scrollsVert: true,
                    
            /**
             * <p>The current scroll position; an object with "x" and "y" numeric properties.</p>
             * 
             * <p>If "usesTouches" is true, setting this property causes the scrollboxNode of this object to scroll
             * to the specified x and y coordinates.  If "usesTouches" is not ture, this property is ignored.</p>
             * 
             * @type Object
             */
            pos: null,
            
            /**
             * Extends the inherited method in order to initialize the "pos" property for tracking the scroll position.
             * 
             * @ignore
             */
            preBuildRendering: function prbr() {
                // Will we support touches?
                this.usesTouches = (mstrmojo.dom.supportsTouches && this.usesTouches && (this.scrollsHoriz || this.scrollsVert));

                // Create the initial position.
                if (this.usesTouches) {
                    this.pos = {
                        x: 0, 
                        y: 0
                    };
                }
                
                if (this._super) {
                    this._super();
                }
            },

            /**
             * Extends the inherited method in order to attach event listeners for touches after rendering and
             * add markup methods for rendering scrolling.
             * 
             * @ignore
             */
            postBuildRendering: function psbr() {
                if (this._super) {
                    this._super();
                }
                
                if (this.usesTouches) {
                    // Get the scrollboxNode and scrollChild.
                    var sbn = this.scrollboxNode,
                        sch = this.itemsContainerNode || sbn.firstChild;    // itemsContainer is for ListBox.

                    // Do we have a scrollBox and and scrollChild (and they are not the same)?
                    if (sbn && sbn !== sch) {
                        // All requirements are met, we can do touch scrolling.
                        // Store the scrollable child.
                        this.scrollChild = sch;
                        
                        // Reset scrollbox dom element to no longer scroll.
                        var ss = sbn.style;
                        ss.position = 'relative';
                        ss.overflow = 'hidden';
                        
                        // Change first child of scrollbox node to be absolute.
                        var cs = sch.style;
                        cs.position = 'absolute';
                        cs.left = 0;
                        cs.top = 0;

                        // Enhance the markup methods.
                        this.markupMethods = _H.copy(
                            _D.isSafari ? webkitMarkupMethods: nonwebkitMarkupMethods,
                            _H.copy(this.markupMethods)
                        );

                        // Attach touch event listener.
                        this.attachTouchEvents();
                    }
                }
            },
            
            /**
             * Extends the inherited method in order to detach event listeners for touches before unrendering.
             * 
             * @ignore
             */
            unrender: function(ignoreDom) {
                // Do we support touch events?
                if (this.usesTouches) {
                    this.detachTouchEvents();
                }
                
                this._super(ignoreDom);
            },
            
            /**
             * Attaches initial event listener for the start of a touch, which may trigger scrolling.
             */
            attachTouchEvents: function(){
                var n = this.touchNode || this.scrollboxNode;
                if (n) {
                    if (!this._tsCallback) {
                        var me = this;
                        this._tsCallback = function(e){
                            me.touchesBegin(self, e);
                        };
                        this._tmCallback = function(e){
                            me.touchesMoved(self, e);
                        };
                        this._teCallback = function(e){
                            me.touchesEnd(self, e);
                        };
                    }
                    
                    _D.attachEvent(n, _D.TOUCHSTART, this._tsCallback);
                    this._tsNode = n;
                }
            },
            
            /**
             * Detaches initial event listener for the start of a touch, which was set up by attachTouchEvents.
             */
            detachTouchEvents: function(){
                var n = this._tsNode;
                if (n) {
                    _D.detachEvent(n, _D.TOUCHSTART, this._tsCallback);
                    delete this._tsNode;
                }                
            },

            /**
             * <p>Handler for touchstart event that targets this widget.</p>
             *
             * <p>Stores some state info in preparation for scrolling, and attaches listeners for touchmove and touchend events.</p>
             * @param {DomEvent} e The native DOM event object provided by the browser.
             */
            touchesBegin: function tb(hWin, e) {
                // Did this touch begin on an interactive element?
                var tagName = e.target && e.target.tagName;
                if (tagName && (tagName === 'SELECT' || tagName === 'INPUT')) {
                    return;
                }
                
                _D.preventDefault(hWin, e);
                this.stopDeceleration();
                this.startTime = new Date();
                this.startTimePos = {
                    x: this.pos.x, 
                    y: this.pos.y
                };
                this.startTouchPos = _D.getMousePosition(_D.firstTouch(hWin, e), hWin);
                this.dragging = false;
                _D.attachEvent(window, _D.TOUCHMOVE, this._tmCallback);
                _D.attachEvent(window, _D.TOUCHEND, this._teCallback);
            },
            
            /**
             * <p>Handler for touchmove events in the window following a touchstart that targeted this widget.</p>
             *
             * <p>Determines whether or not a drag has started, and if so, repositions the scrolling as well
             * as shows the scroll indicator bar(s).</p>
             * @param {DomEvent} e The native DOM event object provided by the browser.
             */
            touchesMoved: function touchesMoved(hWin, e) {
                var evtPosition = _D.getMousePosition(_D.firstTouch(hWin, e), hWin);
                _D.preventDefault(hWin, e);

                // If we haven't started a drag yet... 
                if (!this.dragging) {
                    // If we've moved enough since the touch started, start a drag now.
                    var MIN_DRAG_DELTA = 5,
                        abs = Math.abs;
                    
                    if ((this.scrollsHoriz && abs(evtPosition.x - this.pos.x) > MIN_DRAG_DELTA)  || (this.scrollsVert && abs(evtPosition.y - this.pos.y) > MIN_DRAG_DELTA)) {
                        // Record state info at the time the drag started.
                        this.dragging = true;
                        this.dragStartTime = new Date();
                        this.startTouchPos = evtPosition;
                        var sbn = this.scrollboxNode,
                            cz = {
                                x: sbn.clientWidth,
                                y: sbn.clientHeight
                            },
                            sz = {
                                x: sbn.scrollWidth,
                                y: sbn.scrollHeight
                            };
                        
                        this.clientSize = cz;
                        this.scrollSize = sz;
                        
                        this.maxPos = {
                            x: Math.max(sz.x - cz.x, 0),
                            y: Math.max(sz.y - cz.y, 0)
                        };
                        
                        // Show the scroll bar indicators.
                        this.showScroll();
                    }
                }
                
                // Are we dragging now?
                if (this.dragging) {
                    _D.stopPropogation(hWin, e);    
                    var startTimePos = this.startTimePos,
                        startTouchPos = this.startTouchPos,
                        maxPosition = this.maxPos;
                    
                    // Compute a new scroll position.
                    var newPosition = {
                        x: this.scrollsHoriz ? Math.max(Math.min(startTimePos.x - (evtPosition.x - startTouchPos.x), maxPosition.x), 0) : 0,
                        y: this.scrollsVert ? Math.max(Math.min(startTimePos.y - (evtPosition.y - startTouchPos.y), maxPosition.y), 0) : 0
                    };
                    
                    // Apply the new scroll position to the GUI.
                    this.set("pos", newPosition);
                    
                    // Record some state info about this repositioning.
                    this.nextLastDragPos = this.lastDragPos;
                    this.lastDragPos = evtPosition;
                    
                    var now = new Date(),
                        last = this.lastDragTime;
                    
                    this.nextLastDragTime = last;
                    this.lastDragTime = now;
                    
                    // If it's been a while since the last repositioning (e.g., the user
                    // kept the mouse/touch down but didnt move it for a while), reset this
                    // event as the new "start" of the drag, for the purpose of computing
                    // a velocity when the user eventually ends the drag later.
                    if ((now - last) > DRAG_TIME_LIMIT) {
                        this.startTime = this.lastDragTime;
                        this.dragStartTime = this.startTime;
                        this.startTimePos = {
                            x: newPosition.x, 
                            y: newPosition.y
                        };
                        this.startTouchPos = evtPosition;
                    }
                }    
            },
            
            /**
             * <p>Handler for touchend event in the window that followed a touchstart that targeted this widget.</p>
             *
             * <p>Detaches event listeners for touchmove & touchend set up at touchstart time, determines whether
             * or not deceleration may be needed, and if not, hides scroll indicators.</p>
             * @param {DomEvent} e The native DOM event object provided by the browser.
             */
            touchesEnd: function te(hWin, e) {
                _D.preventDefault(hWin, e);
                
                _D.detachEvent(window, _D.TOUCHMOVE, this._tmCallback);
                _D.detachEvent(window, _D.TOUCHEND, this._teCallback);
                
                // Were we dragging?
                if (this.dragging) {
                    // Stop dragging.
                    this.dragging = false;
                    
                    _D.stopPropogation(hWin, e);
                    
                    // If the last drag move was recent, assume the user was flicking his mouse/hand as
                    // he ended the gesture, in which case we should show some animated decelerating scrolling;
                    // otherwise just let scrolling stop abruptly.
                    if ((new Date()) - this.lastDragTime <= DRAG_TIME_LIMIT) {
                        this.startDeceleration(hWin, e);
                    } else {
                        this.hideScroll();
                    }
                }               
            },

            /**
             * <p>Starts decelerated scrolling, if there is sufficient starting velocity.</p>
             *
             * <p>First computes a 
             * starting velocity, and if it's sufficient, continues scrolling at a decelerating rate using
             * a javascript interval (timer); otherwise, if starting velocity is too small, lets scrolling end immediately.</p>
             * @param {DomEvent} e The native DOM event object provided by the browser.
             */
            startDeceleration: function stad(hWin, e){
                var epos = _D.getMousePosition(_D.firstChangedTouch(hWin, e), hWin),
                    // How far have we travelled since our last pause in this drag?
                    lastPos = ((mstrmojo.dom.supportsTouches===null) ? this.lastDragPos : this.nextLastDragPos) || epos,
                    dist = {
                        x: epos.x - lastPos.x,
                        y: epos.y - lastPos.y
                    },
                    // How much time has elapsed since our last pause in this drag?
                    lastTime = ((mstrmojo.dom.supportsTouches===null) ? this.lastDragTime : this.nextLastDragTime),
                    tm = lastTime ? (new Date()) - lastTime : 0,
                   // How many pixels is that per frame of animation?
                    velocity = {
                        x: tm ? Number(dist.x * MS_PER_FRAME * SPEED_AMP / tm).toFixed(2) : 0,
                        y: tm ? Number(dist.y * MS_PER_FRAME * SPEED_AMP / tm).toFixed(2) : 0
                    };
                // Do we have sufficient velocity to warrant decelerating animation?
                var me = this,              
                    fnFastEnough = function(vel){
                        return (me.scrollsHoriz && Math.abs(vel.x) >= MIN_VELOCITY) ||
                                (me.scrollsVert && Math.abs(vel.y) >= MIN_VELOCITY);
                    };
                if (fnFastEnough(velocity)) {
                    // We have sufficient velocity. 
                    // Do one frame of deceleration animation immediately.
                    this.velocity = velocity;
                    this.friction = {x: this.FRICTION, y: this.FRICTION};
                    this.set("decelerating", true);
                    var fnDecel = function(){
                            me.decelerate();
                            if (!fnFastEnough(me.velocity)) {
                                me.stopDeceleration();
                                me = null;
                            }
                        };
                    fnDecel();
                    // If the deceleration didn't stop after the first frame...
                    if (this.decelerating) {
                        // Set up an interval loop to continue the animation.
                        this.decelerationTimer = window.setInterval(fnDecel, MS_PER_FRAME);
                    }
                } else {
                    // We don't have sufficient velocity to start animation.
                    // Hide scroll indicators, we're done scrolling.
                    this.hideScroll();
                }
            },
            
            /**
             * Stops any deceleration animation that may currently be in progress, and hides scroll indicators.
             */
            stopDeceleration: function stopDeceleration(){
                this.set("decelerating", false);
                delete this.velocity;
                
                if (this.decelerationTimer) {
                    window.clearTimeout(this.decelerationTimer);                
                    delete this.decelerationTimer;
                }
                
                this.hideScroll();
            },
            
            /**
             * Adjusts the scroll position by the current velocity vector, and then adjusts the
             * vector by some friction coefficient.
             */
            decelerate: function decelerate() {
                var position = this.pos,
                    velocity = this.velocity,
                    friction = this.friction,
                    max = this.maxPos,
                    newpos = {
                        x: position.x - velocity.x,
                        y: position.y - velocity.y
                    },
                    bounces = this.bounces,
                    bounceFriction = this.BOUNCEFRICTION;
                    
                // Adjust x.
                var x = newpos.x;
                if (x < 0 || x > max.x) {
                    newpos.x = (x < 0) ? 0 : max.x;
                    velocity.x *= (bounces) ? -bounceFriction : 0;
                    friction.x = bounceFriction;
                }
                
                // Adjust y.
                var y = newpos.y;
                if (y < 0 || y > max.y) {
                    newpos.y = (y < 0) ? 0 : max.y;
                    velocity.y *= (bounces) ? -bounceFriction : 0;
                    friction.y = bounceFriction;
                }
                
                // Store new position.
                this.set("pos", newpos);
                
                // Store new velocity.
                this.velocity = {
                    x: friction.x * velocity.x,
                    y: friction.y * velocity.y
                };
            },
            
            /**
             * <p>Hides scroll indicators if visible.</p>
             * 
             * <p>Called after a scroll drag ends.</p>
             */
            hideScroll: function hideScroll(){
                this.set("vscrollVisible", false);
                this.set("hscrollVisible", false);
            },
            
            /**
             * <p>Makes scroll indicators visible, depending on scrollsVert and scrollsHoriz settings.</p>
             * 
             * <p>Called when a scroll drag starts.</p>
             */
            showScroll: function showScroll(){
                var max = this.maxPos;
                if (this.scrollsVert && max.y && this.vscrollNode) {
                    this.set("vscrollVisible", true);
                }
                if (this.scrollsHoriz && max.x && this.hscrollNode) {
                    this.set("hscrollVisible", true);
                }
            }
        });

})();