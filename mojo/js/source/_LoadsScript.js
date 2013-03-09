/**
 * <p>Enables an object to load javascript methods at run-time.</p>
 *
 * @class
 * @public
 */

mstrmojo.LoadedExternalJSURLs = {};

function LoadScriptsExternalJSCallback()
{
	
    //since we processed this url, remove it from the array
    mstrmojo.LoadedExternalJSURLs[mstrmojo._LoadsScript.esScripts.splice(0, 1)[0].url] = true;
	//now load the remaining urls 
	mstrmojo._LoadsScript.requiresExternalScripts(mstrmojo._LoadsScript.esScripts,
                                                  mstrmojo._LoadsScript.callback,
												  mstrmojo._LoadsScript.esScritsContext
												  );
    
	mstrmojo._LoadsScript.ExternalJSCallbackIsBusy = false;
}

mstrmojo._LoadsScript = mstrmojo.provide(
"mstrmojo._LoadsScript",
/**
 * @lends mstrmojo._LoadsScript#
 */
{
    /**
     * @ignore
     */
    _meta_usesSuper: false,

	/**
	 * <p>Ensures that the script for a given method is loaded into this object.</p>
	 *
	 * <p>If this object's property with the given method name points to a function, we assume
	 * that function is the desired method.  Otherwise, we assume we must load a mixin that
	 * implements the method.  The FQCN from the mixin is a string that is assumed to be declared
	 * either:
	 * <ul>
	 * <li>under the method name; or</li>
	 * <li>under the "this.methods" hash, keyed by the method name; or</li>
	 * <li>under the "this.methods" hash, keyed by "*" (meaning, a default mixin for all methods).</li>
	 * </ul>
	 * </p>
     * 
     * @param {String} n The name of the method to be loaded.
     * @returns {Boolean} true if the method is now successfully loaded in this object.
	 */
	requiresMethod: function rqMth(/*String*/ n) {
		if (!n) {
            return;
        }
		
		// Do we have a function for this method?
		if (typeof(this[n]) === "function") {
            return true;
        } else {
			// Try to load the method. We need the FQCN of the mixin that impls the method.
			var fqcn = this[n] || (this.methods && (this.methods[n] || this.methods["*"]));
			if (typeof(fqcn) === "string") {
				this.requiresCls(fqcn);	
				return typeof(this[n]) === "function";
			}
			return false;					
		}
	},

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
			 * 
			 * Load the external java scripts synchronously
			 * 
			 */
             requiresExternalScripts : function requiresES(esScripts, callback, context)
			 {
			 	
			 	if(esScripts && esScripts instanceof Array)
				{
					   if (esScripts.length == 0) { //this could be case when user provided only one url and has a call back					   	   
						   
						   callback && callback.call(context);
						   
						   return;
					   } 		
				        
							   
					   //check if the next script to be loaded is in the loaded cache, then skip this one
					   if(esScripts[0].forceReload && esScripts[0].forceReload == false && mstrmojo.LoadedExternalJSURLs [esScripts[0].url])
					   {
					   	
					   	 esScripts.splice(0, 1); //remove this from the array and start loading the remaining urls
					   							 
					   	 return this.requiresExternalScripts(esScripts, callback, context);
					   }
				
					  	var script = document.createElement("script"), isIE = !!document.all;
					  						  	
					  	script.type = "text/javascript";
					  	script.src = esScripts[0].url;
						
						if (!esScripts[0].callbackParamName) {
							if (isIE) {
								//IE: handle <script> Tag state change event:
								script.onreadystatechange = function(){
									//when IE finishes loading/parsing current <script>, continue next
									
									if (script.readyState == "loaded" || script.readyState == "complete") {
										script.onreadystatechange = null; //avoid handling twice
										//load the next script if any here
										if (esScripts.length > 1) {
											//remove the first element which is processed
											
											mstrmojo.LoadedExternalJSURLs [esScripts.splice(0, 1)[0].url] = true;
											mstrmojo._LoadsScript.requiresExternalScripts(esScripts, callback);
										}
										else 
											if (esScripts.length == 1) {
												
											mstrmojo.LoadedExternalJSURLs [esScripts[0].url] = true;
												//call the callback function if any
												if (callback) {										
													callback.call(context);
												}
											}
									}
								}
							}
							else { // for FireFox, safari etc
								script.onload = function(){
								
									script.onload = null; //avoid handling twice
									//load the next script if any here
									if (esScripts.length > 1) {
										//remove the first element which is processed
										 
										mstrmojo.LoadedExternalJSURLs [esScripts.splice(0, 1)[0].url] = true;									
										mstrmojo._LoadsScript.requiresExternalScripts(esScripts, callback);
									}
									else 
										if (esScripts.length == 1) {
												mstrmojo.LoadedExternalJSURLs [esScripts[0].url] = true;
												//call the callback function if any
												if (callback) {										
													callback.call(context);
												}
											
										}
								}
							}
						} //end of if callback param check
						else{
							if(esScripts[0].callbackParamName.length != 0){ //if we have a callback request parameter name then use it
								//check if already someone else is using the global callback method. If yes, then we have to wait for sometime and check back
								if(mstrmojo._LoadsScript.ExternalJSCallbackIsBusy &&
								   mstrmojo._LoadsScript.ExternalJSCallbackIsBusy == true)
								{								
									   var that = this;
                                       window.setTimeout(function()
									                     {           
                                                            that.requiresExternalScripts(esScripts, callback, context);
                                                         }
                                                         ,500);
						               return;
								}
								//indicate the global flag that the callback function is busy
                                mstrmojo._LoadsScript.ExternalJSCallbackIsBusy = true;
								
								//remove the first element which is processed                                
                                script.src += "&" + esScripts[0].callbackParamName + "=LoadScriptsExternalJSCallback" ;
						        
						
								mstrmojo._LoadsScript.esScripts = esScripts;
								mstrmojo._LoadsScript.callback = callback;
								mstrmojo._LoadsScript.esScritsContext = context;
															 
                            }
						}
						
						document.getElementsByTagName("head")[0].appendChild(script);
				}
			 }

});