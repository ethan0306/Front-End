(function(){

    mstrmojo.requiresCls(
        "mstrmojo.dom",
        "mstrmojo._TouchGestures");
    
    var $D = mstrmojo.dom;

	/**
	 * Translates an HTML element for a certain duration using the given timing function
	 * for a given duration.
	 *
	 * @param (Array)   node A collection of HTMLElement that needs to translated.
	 * @param (Array)   c Coordinates across which the node has to be translated ([x,y,z])
	 * @param (Integer) d Duration of the translation animation (in ms).
	 * @param (String)  f The timing function supported by -webkit-transition-duration (ease, linear, ease-out, ease-in)
	 *
	 */
	function translate(node, c, d, f) {
		for (var i in node) {
			node[i].style.webkitTransitionDuration = (d + 'ms');
			node[i].style.webkitTransitionTimingFunction = f;					
		    node[i].style.webkitTransform = 'translate3d(' + c[0] + 'px, ' + c[1] + 'px, ' + c[2] + 'px)';
		}
	}
	
	/**
	 * Function takes the current position and resets it to either the min or the max, if out of
	 * bounds. 
     * If you want to be able to move the node beyond it's min and max, send null (Usage: to 
     * acheive bounce animation on touch end.) 
     *
     * @param (Integer) pos The current position of the object.
     * @param (Integer) min The minimum boundary beyond which the node shouldn't move.
     * @param (Integer) max The maximum boundary beyond which the node shouldn't move.
     * 
     * @return (Object) which gives the position (Integer) and whether the positon has been reset (boolean)
     */
	function adjustPos(pos, min, max, reset) {
		//Reset flag notifies if we have reset the value
		var r = false;
    	if (reset && pos >= min) {
    		pos = min;
    		r = true;
    	} else if (reset && pos <= max) {
    		pos = max > 0 ? min : max;
    		r = true;
    	}
    	return {pos: pos,
    			reset: r
    	};
	}
	
	/**
	 * Helps preventing noise on the wrong axis while scrolling. 
	 *
	 * @param t The HTMLTouchEvent
	 * 
	 * @return (Object) with boolean values for both x and y axes.
	 */
	function preventMove(t) {
		var x = y = false;
		var abs = Math.abs;
				
		x = !(abs(t.accelDelta.x) >= abs(t.accelDelta.y));
		y = !(abs(t.accelDelta.y) >= abs(t.accelDelta.x));

		return { x: x,
				 y: y
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
    function raiseScrollDoneEvent(scroller, position) {
        scroller.raiseEvent({
            name: 'scrollDone',
            x: position.x,
            y: position.y
        });
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
    mstrmojo._TouchScroll = mstrmojo.provide(
        "mstrmojo._TouchScroll",
        /**
         * @lends mstrmojo._TouchScroll#
         */
        {
        	/**
	         * Touch specific nodes. These nodes are Array objects to support multiple nodes for scrolling.
	         * These nodes get assigned in _setupTNs in postBuildRendering.
	         * Each of them is an array of HTMLElement.
	         */
            _TSN_X: [],		//Touch Scroll Node along the X axis
            _TSN_Y: [],		//Touch scroll node along the Y axis
            
            /**
             * Optional Node to scroll in the event that the scroll nodes are childs of
             * the scrolled container. The Container Scroller will only scroll when 
             */
            _TSC: null,		//Touch Scroll Container
            
        	//The following properties are defined in _TouchGestures and made be implemented.
            //singleNode: false,
            //multiTouch: false,
            //touchNode: null,
            
            /**
             * Stores the position of the nodes with every touch movement
             * 
             * @type Object of Integer
             * @default 0
             */
            tPos: {x: 0,
            	  y: 0},
            	  
            /**
             * Stores the minimum limit for movement of the touch nodes along the x and y axis.
             * 
             * @type Object of Integer
             * @default 0
             */
            _TMIN: {x:0,
            		y:0},
            
            //buffer = 24
            /**
             * Stores the maximum limit for movment of the touch nodes along the x and y axis
             * The default values are set for the iPhone screen.
             * 
             * @type Object
             * @default 320,415
             */
            _TMAX: {x: 320,
            		y: 415},/*480 - 20(status) - 44(toolbar) - 1(border)*/
            
            /** Constants to slow down the speed of the flick while scrolling
             * Reduce to increase speed and increase to reduce speed.
             * 
             */		
            friction: {
            	x: 3,
            	y: 3
            },
            
            /**
             * Stores the distance 
             * 
             * @type Object of Integers
             * @default 0
             */
            distance: {x:0,y:0},
            
            /**
             * Stores whether we want to restrict the scrolling along one axis.
             * 
             * @type Object of boolean
             * @default false
             */
            PREVENT_MOVEMENT: {
            	x: false,
            	y: false
            },
            
            bounces: {
            	x: true,
            	y: true
            },
            
            /** 
             * Setup the touch scroll nodes depending which nodes have to scroll across the x
             * and y axis.
             * By default they get assigned to the domNode.
             */
            _setupTNs: function _setupTNs() {
            	//Default the scroll nodes to the domNode.
            	this._TSN_X = this._TSN_Y = [this.domNode];
            },
                        
            /**
             * Handler called by the {@link _TouchGestures} mixin when a touch event is initiated.
             * 
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSwipeBegin: function touchSwipeBegin(touch) {            
				 function resetNode(node) {
                	for (var i in node) {
		                node[i].style.webkitTransitionDuration = '0ms';
						node[i].style.webkitTransitionTimingFunction = 'ease';
					}
				}
				
				resetNode(this._TSN_Y);
				resetNode(this._TSN_X);
            },
            
            /**
             * Handler called by the {@link _TouchGestures} mixin when a touch event move occurs.
             * 
             * @param {Object} touch An object containing information about the native HTMLTouchEvent.
             * @ignore
             */
            touchSwipeMove: function touchSwipeMove(touch) {
            	
            	var newX = (this.tPos.x + touch.delta.x),
            		newY = (this.tPos.y + touch.delta.y);
            
            	//Method returns whether we should restrict movement on either axis.
            	this.PREVENT_MOVEMENT = preventMove(touch);
            
            	if (!this.PREVENT_MOVEMENT.x) {
	            	//X Axis transformation
	            	var x = adjustPos( newX,
	            					this._TMIN.x,
	            					this._TMAX.x,
	            					false);
					translate(this._TSN_X, [x.pos,0,0], 0, 'ease');
				}
				
				if (!this.PREVENT_MOVEMENT.y) {
					//Y Axis Transformation		
	            	var y = adjustPos( newY,
	            					this._TMIN.y,
	            					this._TMAX.y,
	            					false);	            	
	            	translate(this._TSN_Y, [0,y.pos,0], '0ms', 'ease');
				}
            },
            
            touchSwipeEnd: function touchSwipeEnd(touch) {
            
            	// Tell the consumer that we have scrolled.
                raiseScrollDoneEvent(this, {x:this.tPos.x + touch.delta.x, y: this.tPos.y + touch.delta.y}); 
            
            	//Calculate the distance to which the nodes should move based on the velocity of the flick.
            	this.distance = {
            		x: Math.round(touch.velocity.x * Math.abs(touch.delta.x)/this.friction.x),
            		y: Math.round(touch.velocity.y * Math.abs(touch.delta.y)/this.friction.y)
            	};
            	
         	            	
            	//X axis position re-sync
        		var nodeX = this._TSN_X;
            	var x = adjustPos((this.tPos.x + touch.delta.x + this.distance.x),
		            					this._TMIN.x,
        		    					this._TMAX.x,
        		    					true);
	        	if (!this.PREVENT_MOVEMENT.x || x.reset) {
	        		translate(nodeX, [x.pos,0,0], 400, 'ease-out');
	        		
	        		//Remember the position we transformed at touch end for future touches
	        		this.tPos.x = x.pos;
        		}
           	
            	//Y axis position re-sync
            	var nodeY = this._TSN_Y;
            	var y = adjustPos( (this.tPos.y + touch.delta.y +  this.distance.y),
            					this._TMIN.y,
            					this._TMAX.y,
            					true);
            	if (!this.PREVENT_MOVEMENT.y || y.reset) {
	             	translate(nodeY, [0,y.pos,0], 400, 'ease-out');
	             	
	             	//Remember the position we transformed at touch end for future touches
	            	this.tPos.y = y.pos;
            	}
            },
            
            postBuildRendering: function postBuildRendering() {
                if (this._super) {
                    this._super();
                }
                
                //Setup the Touch scroll nodes after everything is done.
                this.setupTNs();
                
                //There is a flickering issue when we scroll the report for the very first time. Not sure why but it only happens when
                //we call the webkit translate3d method for the very first time. Hence adding it when we setup the touch nodes.
                translate(this._TSN_X, [0,0,0], 0, 'ease');
                translate(this._TSN_Y, [0,0,0], 0, 'ease');
            }
            
        });

})();