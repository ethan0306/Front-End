mstrmojo._CanLoadScript = {
			
			/**
			 * Loads the requested mixins (if not already loaded), mixes them into the
			 * prototype of this widget's constructor, and then fires given callback.
			 */
			requiresCls: function req(/*Array*/ mixins, /*Function?*/ callback) {
				// TO DO: implement this using async XHR.
				if (mixins) {
					if (typeof(mixins) == "string") {
						mixins = [mixins];
					}
					// XHR get any of the mixins that are not loaded in-memory yet.
					mstrmojo.requiresCls.apply(mstrmojo, mixins);
					// Mix these into the constructor's prototype. Record the mixins
					// we do in a class-level hash, so we don't redo them again later.
					var p = this.constructor.prototype,
						pm = p.mixins;
					if (!pm) {
						p.mixins = {};
						pm = p.mixins;
					}
					var mx = mstrmojo.mixin;
					for (var i=0, len=mixins.length; i<len; i++) {
						var fqcn = mixins[i];
						if (!pm[fqcn]) {
							var m = eval(mixins[i]);
							mx(m, p);
							pm[fqcn] = true;
							// After each mixin, call the mixin's __onmixin__ method (if any) on ourselves.
							if (m.__onmixin__) {
								m.__onmixin__.apply(this, []);
							}
						}
					}
					if (callback) {
						callback.apply(this, []);						
					}
				}
			},
			
			/**
			 * Loads the contributor object identified in the given property. If loaded successfully, 
			 * stores a reference to it in the given property and sets its parent to this widget; otherwise, 
			 * if not loaded successfully, replaces the property value with null.
			 */
			requiresContrib: function reqCb(/*String*/ propName, /*Boolean?*/ bForceStartup) {
				var fqcn = this[propName];
				if (fqcn) {
					var c,
						firstTime = false;
					if (typeof(fqcn) == 'string') {
						c = mstrmojo.registry.ref(fqcn);
						this[propName] = c;
						firstTime = true;
					} else {
						c = fqcn;	// Assume its the contributor object itself.
					}
					// Set the parent and call startup. We do this the first time we initialize
					// the contributor, and additionally if a flag tells us to do it subsequent times.
					if (c && (firstTime || bForceStartup)) {
						c.parent = this;
						if (c.startup) {
							c.startup();
						}
					}
					return c;
				}
				return null;
			},

			/**
			 * Ensures that the script for a given method is loaded into this object.
			 * If this object's property with the given method name points to a function, we assume
			 * that function is the desired method.  Otherwise, we assume we must load a mixin that
			 * implements the method.  The FQCN from the mixin is a string that is assumed to be declared
			 * either (a) under the method name, (b) under the this.methods hash, keyed by the method name, or
			 * (c) under the this.methods hash, keyed by "*" (meaning, a default mixin for all methods).
			 * Returns true if the method is implemented by this object.
			 */
			requiresMethod: function rqMth(/*String*/ n) {
				if (!n) return;
				
				// Do we have a function for this method?
				if (typeof(this[n]) != "function") {
					// Try to load the method. We need the FQCN of the mixin that impls the method.
					var fqcn = this[n] || (this.methods && (this.methods[n] || this.methods["*"]));
					if (typeof(fqcn) == "string") {
						this.requiresCls(fqcn);	
						return typeof(this[n]) === "function";
					}
					return false;					
				} else {
					return true;
				}
			}
		};
