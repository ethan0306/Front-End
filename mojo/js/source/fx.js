(function(){

    mstrmojo.requiresCls("mstrmojo.dom");

	mstrmojo.fx = {enabled: true};
	
	var $DOM = mstrmojo.dom;	

	
	/**
	 * _Effect is an abstract base class for all visual effects.  It implements the machinery for a generic effect,
	 * but omits the "exec()" method which actually applies a change to the GUI.  That method is expected to be implemented
	 * by subclasses of _Effect.
	 */
	mstrmojo.fx._Effect = mstrmojo.declare(
		// superclass
		null,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.fx._Effect",
			
			/**
			 * Length (in millisec) of the entire effect.
			 */
			duration: 500,
			
			/**
			 * Length (in millisec) of pause in between steps of this effect's animation.
			 */
			interval: 50,
			
			/**
			 * Optional delay (in millisec) before effect is started once play() is called.
			 */
			delay: null,
			
			/**
			 * The object to which this effect is applied.
			 */
			target: null,
			
			/**
			 * Optional getter function for "target" property.  If specified, called at start-time (before "preStart").
			 */
			getTarget: null,
			
			/**
			 * Optional handle to the widget whose DOM will be targeted. An alternative to using "target" or "getTarget".
			 * If those 2 properties are omitted and "widget" is provided, the target will be set to a slot in the widget.
			 */
			widget: null,
			
			/**
			 * If "widget" is provided, the name of the widget's slot which will be targeted ("domNode" by default).
			 */
			slot: null,
			
			/**
			 * Optional handler, called before effect is started. For customization.
			 */
			preStart: null,

			/**
			 * Optional handler, called before effect is started. For customization.
			 */
			postStart: null,

			/**
			 * Optional handler, called before effect is started. For customization.
			 */
			onCancel: null,

			/**
			 * Optional handler, called after effect is successfully completed. For customization.
			 */
			onEnd: null,

			/**
			 * If true and the effect is cancelled while playing, the start value of the effect
			 * will be reapplied to the target.
			 */
			revertOnCancel: true,
			
			/**
			 * This boolean gets set to true when play() is called, and to false when
			 * either pause() or cancel() are called, or when the animation's steps are completed.
			 */
			isPlaying: false,
			
			/**
			 * This boolean gets set to true after both (1) play() is called and (2) the start delay
			 * (if any) is over. Gets reset to false after effect ends or is cancelled.
			 */
			started: false,
			
			/**
			 * Applies the given properties to this instance.
			 */
			init: function init(/*Object?*/ props) {
				mstrmojo.hash.copy(props, this);
			},
									
			/**
			 * Plays this effect, beginning with the effect's delay (if any).
			 */
			play: function ply() {
				this.isPlaying = true;
				this.started = false;
				if (this.delay) {
					var me = this;
					this.delayTimer = window.setTimeout(
						function() {
							me._start();
							me = null;
						},  
						this.delay
					);
				} else {
					this._start();
				}
			},
			/**
			 * Prevents the effect from continuing to play any further.
			 */
			pause: function pause() {
				if (this.delayTimer) {
					window.clearTimeout(this.delayTimer);
					delete this.delayTimer;
				}
				if (this.timer) {
					window.clearInterval(this.timer);
					delete this.timer;
				}
				this.isPlaying = false;
			},

			/**
			 * Prevents the effect from continuing to play, optionally re-applies the start value, and
			 * fires the onCancel callback, if any.
			 */
			cancel: function cnl() {
				this.pause();
				if (this.started) {
					if (this.revertOnCancel) {
						this.counter = 0;
						this.exec();
					}
					if (this.onCancel) {
						this.onCancel();
					}
					this.started = false;
				}
			},
						
			/**
			 * Kicks off the application of this effect, possibly after a delay.
			 */
			_start: function start() {
				this.started = true;

				// Call the target getter method, if given.
				this._doTarget();

				// Calculate the # of animation steps required.
				// If duration = 0, do animation in 1 step.
				this.steps = Math.max(
								Math.ceil(this.duration/this.interval), 
								1);
				
				// Validate the ease property; could be a Function or String.
				var ea = this.ease;
				if (typeof(ea) == "string") {
					this.ease = mstrmojo.registry.ref(ea);
				}
				
				// Call any pre-start method from the animation's config.
				if(this._doPreStart() === false) {
				    this.started = false;
				    this.isPlaying = false;
				    return;
				}

				// Start the animation immediately.
				this.counter = 0;
				this.exec();
				this.counter++;

				// Call postStart, if any.
				this._doPostStart();
				
				// Do any steps remain?
				if (this.counter >= this.steps) {
					// No, cleanup.
					this._end();
				} else {
					// Yes, continue animation in a repeating interval.
					var me = this;
					if (this.timer) {
						window.clearInterval(this.timer);
					}
					this.timer = window.setInterval(
							function fxIntvl(){
							    if (me) {
							        me.exec();
							        me.counter++;
							        if (me.counter >= me.steps) {
							            me._end();
							            me = null;
							        }
							    }
							},
							this.interval);
				}
			},

			/**
			 * The method which applies a single step of a given effect.  Intentionally omitted for this
			 * abstract base class; expected to be implemented by subclasses.
			 */			
			exec: null,
			
			/**
			 * Called internally for cleanup after an animation executes all of its steps.
			 */
			_end: function end(){
				// Clear the interval.
				this.pause();
				this.started = false;
				if (this.onEnd) {
					this.onEnd();
				}
			},

            _doTarget: function tgt() {
                // Do we have a target getter?
                if (this.getTarget) {
                    // Assume the getter will return a DOM node.
                    this.target = this.getTarget.apply(this, []);
                } else if (this.widget) {
                    // If we have a widget, target the widget's given slot ("domNode", by default).
                    // Refresh this every time we start, because the slot pointer may have changed (e.g., after a re-render).
                    this.target = this.widget[this.slot || "domNode"];
                } else if (this.target) {
                    // If we do have a target, check if its a widget or DOM node.
                    var t = this.target;
                    if (t && this.slot && t.scriptClass) {
                        var node = t[this.slot];
                        if (node) {
                            this.widget = t;
                            this.target = node;
                        }
                    }
                }
				// Finally, if we don't have a target, just assume it is the domNode of our widget ancestor.
				// Typically, that would be our parent. However, if this effect is used as a child of a Parallel effect,
				// then our parent would be the Parallel effect.  So we want to walk our ancestors until we reach an
				// ancestor with a domNode.
				if (!this.target) {
					var w = this;
					while (w = w.parent) {	// Note: this is an assignment ("="), not a comparison ("==")!
						if (!w || w.domNode){
						  break;
                        }
					}
					if (w) {
						this.widget = w;
						this.target = w[this.slot || "domNode"];
					}
				}
			},

			_doPreStart: function pre(){
				if (this.preStart) {
					 return this.preStart();
				}
			},
			_doPostStart: function post(){
				if (this.postStart) {
					this.postStart();
				}
			}			
		}
	);		

	/**
	 * Utility function used by mstrmojo.fx.Parallel to call methods in all of its children.
	 */
	function _callChildren(me, fName) {
		var arr = me.children;
		for (var i=0, len=(arr&&arr.length) || 0; i<len; i++) {
			arr[i][fName]();
		}
	}
	
	/**
	 * Parallel is essentially a list ("children") of effects which are all played simultaneously when Parallel is played.
	 * Each "child" effect supports its own individual properties, such as "duration", "delay", "preStart", "onEnd", etc.  
	 * Note that "duration" of the Parallel itself is ignored.
	 * Additionally, the Parallel itself supports a "delay" which is applied before any of the children are played.
	 */
	mstrmojo.fx.Parallel = mstrmojo.declare(
		// superclass
		mstrmojo.fx._Effect,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.fx.Parallel",
			
			init: function init(/*Object?*/ props) {
				this._super(props);
				// Inspect our children.  If they are native javascript Objects, try replacing them
				// with newly instantiated javascript classes.
				var ch = this.children;
				mstrmojo.registry.refArray(ch);
				// Set the children's parent pointer.
				for (var i=0, len=(ch&&ch.length)||0; i<len; i++) {
					ch[i].parent = this;
				}
			},
			
			/**
			 * Fires the preStart callback if any, triggers the playing of all the effects in its "children" 
			 * array, and then fires the postStart callback if any.  
			 */
			_start: function start() {
				this.started = true;

				if (this.preStart) {
					this.preStart();
				}

				_callChildren(this, "play");
				
				if (this.postStart) {
					this.postStart();
				}
			},

			/**
			 * Triggers the pause of all the effects in its "children" array.
			 */
			pause: function pause() {
				_callChildren(this, "pause");
			},

			/**
			 * Triggers the cancel of all the effects in its "children" array.
			 */
			cancel: function cnl() {
				_callChildren(this, "cancel");
			}
		}
	);
	
    /**
     * Animates a given property of a given target DOM Node.
     */
    mstrmojo.fx.AnimateProp = mstrmojo.declare(
		// superclass
		mstrmojo.fx._Effect,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.fx.AnimateProp",
			
			/**
			 * Hashtable of style properties animated by this effect.
			 * Keyed by name of the property; value is an object with the following
			 * properties: {start: .., stop: .., suffix: .., ease: ..}.
			 */
			props: null,

			/**
			 * Extends the inherited method in order to validate "ease" property of each
			 * individual property to be animated.
			 */
			_start: function st() {
				// Validate the ease function for each given property. Could be a String that
				// needs to be eval'd into a function.  Do this before calling the inherited method,
				// because that method will perform the first animation step, which will need the ease function.
				var ps = this.props;
				for (var n in ps) {
					var p = ps[n],
						ea = p.ease;
					if (typeof(ea) == "string") {
					    p.ease = mstrmojo.registry.ref(ea, {dontInst: true});
					}
				}
				// Call the inherited method to truly start the animation.
				this._super();

			},
									
			exec: function exec() {
				var ps = this.props;
				for (var n in ps) {
					var p = ps[n],
						v = (p.ease || mstrmojo.ease.sin)(this.counter, p.start, p.stop-p.start, this.steps-1);
					if(p.fn){
					    v = p.fn(v);
					}
					if (p.suffix){
					   v += p.suffix;
                    }
                    var o = p.isStyle === false ? this.target : this.target.style;
                    o[n] = v;
				}
			}
		}
	);
	
	mstrmojo.fx.Typewriter = mstrmojo.declare(
		// superclass
		mstrmojo.fx._Effect,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.fx.Typewriter",
			
			charGroupSize: 1,
			
			/**
			 * This property is used to set the effect's "stop" value if none is provided.
			 * The srcProp is the name of the targeted widget's property from which to read the typewriter text.
			 */
			srcProp: "text",
			
			/**
			 * Extends the inherited method in order to do some additional initialization, and to
			 * support the targetField property.
			 */
			_doPreStart: function () {
				// First call the inherited method to do standard setup.
				this._super();
				
				// Now validate the "stop" property. 
				this._dynStop = false;
				// If it's null, try setting it with the help of the srcProp.
				if (this.stop == null) {    // if null or undefined
					var sp = this.srcProp,
                        st;
					if (sp) {
						var w = this.widget || this.parent;
						st = w && w[sp];
						if ((st != null) && (typeof(st) !== 'string')) {  // if not null and not undefined
							st = String(st);
						}
					}
					this.stop = st;
					this._dynStop = true;
				}
				// If it's still null, use empty string.
				if (this.stop == null) {
					this.stop = "";
				}

				// Prepare the target's innerHTML.				
				var t = this.target,
					ttn = null,
					cgs = 1;

				if (t) {
					t.innerHTML = '';
					ttn = document.createTextNode('');
					t.appendChild(ttn);
					cgs = Math.max(
							Math.floor(this.stop.length / this.steps),
							1);
				}
				this.targetTextNode = ttn;
				this.charGroupSize = cgs;
			},
			
			exec: function() {
				var ttn = this.targetTextNode;
				if (!ttn) {
				    return;
			    }
				
				var v;
				if (this.counter >= this.steps-1) {
					v = this.stop;
				} else if (this.counter === 0) {
					v = '';
				} else {
					v = this.stop.substring(0, this.charGroupSize * this.counter) + '_';
				}
				ttn.nodeValue = v;
			},
			
			_end: function end() {
				this._super();
				if (this._dynStop) {
					this.stop = null;
					delete this._dynStop;
				}
			},
			
			cancel: function cnl() {
				if (this._dynStop) {
					this.stop = null;
					delete this._dynStop;
				}
			}
		}
	);
	
	mstrmojo.requiresCls("mstrmojo.dom");
		
	/**
	 * Animates the opacity of a DOM node.  The target may be specified as either a sDOM node
	 */
	mstrmojo.fx.Fade = mstrmojo.declare(
		// superclass
		mstrmojo.fx._Effect,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.fx.Fade",
			
			/**
			 * "start" and "stop" define a range of values over which this effect will be applied.
			 */
			start: null,
			stop: null,
			
			/**
			 * Optional easing function used to compute in-between values for animation.
			 */
			ease: null,

			/**
			 * Optional suffix to be appended to property values applied by this effect.
			 */
			suffix: null,

			exec: function exec(v) {
				if (v == null) {    // if null or undefined
					v = (this.ease || mstrmojo.ease.sin)(this.counter, this.start, this.stop-this.start, this.steps-1);
				}
				if ($DOM.isIE && !$DOM.isWinPhone) {
					// TO DO: implement opacity via filter
					this.target.style.filter = 'alpha(opacity=' + parseInt(v*100,10) + ')';
					
				} else {
					this.target.style.opacity = v;
				}
			}
		}
	);
	
	/**
	 * A subclass of Fade which fades opacity from 1 to 0, and (optionally) then sets the style.display of target.
	 */
	mstrmojo.fx.FadeOut = mstrmojo.declare(
		// superclass
		mstrmojo.fx.Fade,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.fx.FadeOut",
			
			start: 1,
			stop: 0,
			revertOnCancel: true,
			
			/**
			 * If not null, when the animation is completed the target's style.display will be set to "hidden";
			 * when it is cancelled, if revertOnCancel is true the target's style.display will be set to the cssDisplay value.
			 */
			cssDisplay: 'block',
			
			/**
			 * Extends the inherited method in order to implement the "cssDisplay" feature.
			 */
			_end: function end(){
				if (this.cssDisplay) {
					this.target.style.display = 'none';
					this.exec(this.start);
				}
				this._super();
			},
			
			/**
			 * Extends the inherited method in order to implement the "cssDisplay" feature.
			 */
			cancel: function cnl() {
				if (this.started && this.cssDisplay) {
					this.target.style.display = this.cssDisplay;
				}
				this._super();
			}
		}
	);

	/**
	 * A subclass of Fade which fades opacity from 1 to 0, and (optionally) then sets the style.display of target.
	 */
	mstrmojo.fx.FadeIn = mstrmojo.declare(
		// superclass
		mstrmojo.fx.Fade,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.fx.FadeIn",
			
			start: 0,
			stop: 1,
			revertOnCancel: true,
			
			/**
			 * If not null, when the animation is completed the target's style.display will be set to "hidden";
			 * when it is cancelled, if revertOnCancel is true the target's style.display will be set to the cssDisplay value.
			 */
			cssDisplay: 'block',
			
			/**
			 * Extends the inherited method in order to implement the "cssDisplay" feature.
			 */
			_doPostStart: function postS(){
				if (this.cssDisplay) {
					this.target.style.display = this.cssDisplay;
				}
				this._super();
			},
			
			/**
			 * Extends the inherited method in order to implement the "cssDisplay" feature.
			 */
			cancel: function() {
				if (this.started && this.revertOnCancel && this.cssDisplay) {
					this.target.style.display = 'none';
				}
				this._super();
			}
		}
	);


	function fraction(num, dem, digits) {
		var x = Math.pow(10, digits || 2);
		if (dem) {
			return parseInt(x * num / dem, 10) / x;
		} else {
			return parseInt(x * num,10) / x;
		}
	}
	
	/**
	 * Collection of easing functions, ready to be used with mstrmojo.fx effects.
	 */
	mstrmojo.ease = {
		linear: function ln(t, b, c, d) {
			if (t === d){
				return b+c;
			}else if (t === 0){
				return b;
			}else {
				return b + c * fraction(t, d);
            }
		},
		
		sin: function sin(t, b, c, d) {
			return b + c * Math.sin((Math.PI / 2) * t / d);
		},
		
		cos: function cos(t, b, c, d) {
			return b + c * Math.cos((Math.PI / 2) * (1 - t / d));
		},
		
		sincos: function sincos(t, b, c, d) {
			if (t > d / 2) {
				return b + c * Math.cos((Math.PI / 2) * (1 - t / d));
			} else {
				return b + c * Math.sin((Math.PI / 2) * t / d);
            }
		},
		
		cossin: function cossin(t, b, c, d) {
			if (t > d / 2) {
				return b + c * Math.sin((Math.PI / 2) * t / d);
			} else {
				return b + c * Math.cos((Math.PI / 2) * (1 - t / d));
            }
		},
		
		bounce: function bounce(t, b, c, d) {
			if ((t /= d) < (1 / 2.75)) {
			      return c * (7.5625 * t * t) + b;
			}
			else if (t < (2 / 2.75)) {
			      return c * (7.5625 * (t-=(1.5/2.75)) * t + 0.75) + b;
			}
			else if (t < (2.5 / 2.75)) {
			      return c * (7.5625 * (t-=(2.25/2.75)) * t + 0.9375) + b;
			}
			else {
			      return c * (7.5625 * (t-=(2.625/2.75)) * t + 0.984375) + b;
			}
		},
		
		shake: function shake(t, b, c, d) {
			if (t < d/2) {
				return b + c * fraction(Math.sin(2 * Math.PI * t/8), null, 2) * 2 * t/d;
			} else {
				return b + c * fraction(Math.sin(2 * Math.PI * t/8), null, 2) * 2 *(1-t/d);
//				return b + c * fraction(Math.sin(6 * Math.PI * t/d), null, 2) * 2 *(1-t/d);
			}
		}

	};
	
})();

