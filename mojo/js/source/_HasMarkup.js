(function(){

    mstrmojo.requiresCls(
        "mstrmojo.string",
        "mstrmojo.dom");
        
    var _S = mstrmojo.string,
        _D = mstrmojo.dom;

    /**
     * An orphaned DOM element used for creating other elements.
     * @private
     * @static
     * @todo Need to add code to set _elCreate to null when window unloads.
     */
    var _elCreate = mstrmojo.useFrames ? null : document.createElement('span');
    
    /**
     * An orphaned DOM element used for destroying other elements.
     * @private
     * @static
     * @todo Need to add code to set _elDestroy to null when window unloads.
     */
    var _elDestroy = null; 
    
    var _REG_EXP_EVTS = /\mstrAttach\:([\w\,]+)/g;
    
    /**
     * <p>Used to determine if mouse event handlers should be rendered and if click event handlers should be replaced with touch start event handlers.</p>
     * 
     * @default undefined If undefined at run time this value will be calculated (and then cached for performance).
     * @private
     */
    var isTouchEnabled;
    
    /**
     * Replaces tokens for event handlers in a given markupString with actual
     * event handler markup.
     *
     * @param {String} The HTML template string with event handler tokens.
     * @returns {String} The HTML string with replaced event handler tokens.
     * @private
     */
    function _replEvts(s){
        // Have we NOT calculated the isTouchEnabled flag? 
        if (isTouchEnabled === undefined) {
            // Ask the Application if it is touch enabled (default to false if no application is found).
            isTouchEnabled = (typeof(mstrApp) !== 'undefined' && mstrApp.isTouchApp && mstrApp.isTouchApp()) || false;
        }
        
        return s.replace( _REG_EXP_EVTS, function hRepl(token, es) {
                        var arr = es.split(","),
                            out = [];
                        for (var i=0, len=arr.length; i<len; i++){
                            var e = arr[i];
                            if (e) {
                    // Is touch enabled for the application.
                    if (isTouchEnabled) {
                        // Is this a mouse event?
                        if (e.indexOf('mouse') > -1) {
                            // Ignore this event because touch has no equivalent.
                            continue;
                            
                        // Is this a click event?
                        } else if (e === 'click') {
                            // Replace click with touchstart.
                            e = 'touchend';
                        }
                    }
                    
                    // Add event handling markup.
                    out.push('on' + e + '="mstrmojo.dom.captureDomEvent(\'{@id}\',\'' + e + '\', self, event)"');
                            }
                        }
                        return out.join(" ");
                    });
    }

    var PRE = 'preBuildRendering',
        BUILD = 'buildRendering',
        POST = 'postBuildRendering';
    
    /**
     * <p>Creates a DOM node (and its descendants) for a given widget from its "markupString" property.</p>
     * 
     * <p>The method accomplishes this by creating a (temporary) &lt;span&gt; container, setting its innerHTML,
     * then removing the resulting firstChild from the &lt;span&gt; container.  The innerHTML is set to the
     * Widget's markup string after some modifications (tokens representing dynamic values in HTML are replaced 
     * with actual values).</p>
     * 
     * @param {Object} widget The widget whose DOM will be built.
     * @returns {HTMLElement} The newly created HTMLElement. 
     * @private
     */
    function _build(widget) {
    	
        var s = widget.markupString;
        // Does the markupString template have abbreviated event handler tokens ("mstrAttach")?
        if (s.match(/mstrAttach:/)) {
            // Yes, replace those tokens with unabbreviated markup.
            s = _replEvts(s);
            // Optimization: If the template is used for all class instances...
            if (widget.markupString === widget.constructor.prototype.markupString) {
                // ...update the template for all instances.
                widget.constructor.prototype.markupString = s;
            }
        }
        var html = _S.apply(s, widget);
        if (html) {
            if (mstrmojo.useFrames) {    
                // Optimization: only do doc-check if our app is using frames.
                // Otherwise, assume there is only one global doc object for this code's lifespan.
                var doc = (widget.domNode && widget.domNode.ownerDocument) || 
                            self.document;
                if (!_elCreate || _elCreate.ownerDocument != doc) {
                    _elCreate = doc.createElement('span');
                }
            }
            _elCreate.innerHTML = html;
            var d = _elCreate.firstChild;
            // Drag-drop manager assumes ever widget.domNode has an mstrmojoId expando property.
            d.mstrmojoId = widget.id;
            return d;
        }
        return null;
    }

    /**
     * Calls the given widget's "markupSlots" methods to retrieve the slot nodes for that widget.
     * @returns A hash (Object) of slot nodes, keyed by slot name.
     * @private
     */
    function _callSlots(widget) {
        // Walk the collection of slot setter functions.
        var ms = widget.markupSlots,
            nodes;
        if (ms) {
            nodes = {};
            for (var n in ms) {
                nodes[n] = ms[n].apply(widget, []);
            }
        }
        return nodes;
    };
    
    /**
     * A mixin for classes that will be represented with markup in the page.
     * @class
     * @public
     */
    mstrmojo._HasMarkup = mstrmojo.provide(
        "mstrmojo._HasMarkup",
        /**
         * @lends mstrmojo._HasMarkup#
         */
        {
            /**
             * String template that specifies the HTML for this Widget's GUI.
             * @type String
             */
            //markupString: null,
            
            /**
             * <p>Optional hash of methods that will be fired in response to specific events in this widget.</p>
             * 
             * <p>This hash is used for reflecting the widget's state in its markup.  The hash is keyed by the events
             * to be monitored (e.g., "on&lt;eventName&gt;"). The hash values are each a Function that will be executed 
             * when that event occurs.</p>
             *
             * <p>When a widget is first rendered, all of its markupMethods are called immediately, to initialize its DOM.</p>
             *
             * <p>One exception is the reserved key "sequence". That optional key's value is an array of key names.
             * This array lists the order in which these markupMethods should be fired. If missing, the order is arbitrary.</p>
             * 
             * @type Object
             */
            //markupMethods: null,
            
            /**
             * <p>A hash of named references to nodes in this widget's markup.</p>
             * 
             * @type Object
             */
            //markupSlots: null,
            
            /**
             * <p>Manages the rendering of this widget's domNode.</p>
             *
             * <p>The method calls "buildRendering", as well as calls to optional "preBuildRendering" and "postBuildRendering" hooks 
             * for customization. If any method returns exactly false, aborts the rendering.</p>
             *
             * @return {Boolean} True if the rendering changed.
             */ 
            render: function rnd() {
                if ((this[PRE] && this[PRE]() === false) ||
                    (this[BUILD]() === false) ||
                    (this[POST] && this[POST]() === false) ) {
                        return false;
                }
                this.hasRendered = !!this.domNode;
                if(this.onRender) {
                    this.onRender();
                }
                return true;
            },
                
            
            buildDom: function buildDom(){
                return _build(this);
            },
            
            preBuildRendering: mstrmojo.emptyFn,
            
            /**
             * <p>Builds and sets this.domNode.</p>
             * 
             * <p>This method will build this.domNode by applying the HTML markup string in this
             * instance's "markupString" property.</p>
             * 
             * @return {Boolean} True.
             */
            buildRendering: function bldRnd() {
    
                // Build a new DOM node according to this Widget's markupString.
                var dnWas = this.domNode,
                    dn = this.buildDom();
    
                this.domNode = dn;
                    
                // Hook for customizations immediately after markup generation.
                if (this.postBuildDom) { 
                    this.postBuildDom(); 
                }

                // Clear any old slots from previous renderings.
                if (this.slotNames) {
                    this.removeSlots(this.slotNames);
                }
                // Call all the "markupSlots" getters and record the slots found.
                this.addSlots(_callSlots(this));
                                                
                // Call all the "markupMethods", to initial state of this Widget's DOM.
                this.paint();
                
                // Now that the DOM is ready, we can place it in the HTML page.
                if (dn) {
                    // Our placeholder is either the previous "domNode"...
                    var ph = dnWas;
                    if (!ph) {
                        // ..or if we don't have a previous "domNode", use the "placeholder" property.
                        ph = this.placeholder;
                        if (ph) {
                            // If its a string, assume its a node's id.
                            if (typeof(ph) === 'string') {
                                ph = document.getElementById(ph);
                            }
                            // Clear the placeholder property after it's been used one time.
                            delete this.placeholder;
                        }
                    }
                    if (ph) {
                        _D.replace(ph, dn);
                    }
                }

                // Optimization: Notify your parent (if any) directly that your domNode has
                // changed.  This used to be done indirectly by having the Container parent
                // listen for the "domNodeChange" event but that leads to thousands of events
                // being raised on page load.
                var fn = "onchildRenderingChange",
                    p = this.parent;
                if (p && p[fn]) {
                    p[fn](this);
                }

                return true;
            },
                
            postBuildRendering: mstrmojo.emptyFn,
                
            /**
             * <p>Removes this widget's domNode from the document, resets the widget's "domNode" property to null, 
             * clears all of its slots (if any), and resets its "hasRendered" to false.</p>
             *
             * <p>If this widget's hasRendered is false, this method does nothing.</p>
             * 
             * @param {Boolean} ignoreDom If true we don't need to remove the domNode from the document (meaning, it's being handled
             * by a parent or ancestor).
             */
            unrender: function unrn(ignoreDom) {
                // If the element is in the DOM then we need to remove it.
                if (this.hasRendered) {
                    if (!ignoreDom) {
                        try {
                            var dn = this.domNode;
                            // if the node has a parent then remove it
                            if ( dn.parentNode ) {
                                dn.parentNode.removeChild(dn);
                            }
                            // if we are running in IE, wipe out the outerHTML to force IE to release memory
                            if (mstrmojo.dom.isIE && dn.outerHTML !== "undefined") {
                                dn.outerHTML = "";
                            }
                        } 
                        catch (ex) {
                          //swallow
                        }
                    }
                    this.domNode = null;
                    this.removeSlots(this.slotNames);
                    this.hasRendered = false;
                }
            },

            /**
             * <p>Executes all the given widget's markupMethods to initialize state of the widget's DOM.</p>
             * 
             * <p>Typically the markupMethods are called in batch only once per rendering, immediately after the widget's domNode 
             * is built. Subsequently, markupMethods are called individually in response to events as they occur.  To allow the
             * methods to distinguish between the first (batch) call and subsequent individual calls, a single optional Boolean param is
             * passed into the methods. This param is set to true only during the initial batch call.</p>
             */
            paint: function pnt() {
                var ms = this.markupMethods;
                if (!ms) {
                    return;
                }
                var me = this,
                    callM = function(n){
                        var f = ms[n];
                        if (f) {
                            try {
                                f.apply(me, [true]);
                            } catch(localerr) {
                                throw new Error([
                                                "Error in markup method.",
                                                "Widget id: " + me.id,
                                                "Method name: " + n,
                                                "Err: " + localerr.message
                                                ].join('\n\n')
                                            );
                            }
                        }
                    };
                var s = ms.sequence;
                if (s) {
                    for (var i=0, len=s.length||0; i<len; i++) {
                        callM(s[i]);
                    }
                } else {
                    for (var n in ms) {
                        callM(n);
                    }
                }
            },    

            /**
             * <p>Forces a re-render of this widget.</p>
             *
             * <p>If this widget is already rendered, this method unrenders and then re renders it;
             * otherwise, does nothing.</p>
             *
             * <p>When refreshing an orphan, this method temporarily sets the previous domNode as the placeholder 
             * for the next domNode, and asks the unrender not to remove that placeholder from the document.  
             * This not done for children as they rely on slots rather placeholders.</p>
             *
             * @param {Function} [postUnrender] Callback to be notified after the unrender (if any) but before the re-render.
             */
            refresh: function refresh(postUnrender) {
                if (this.hasRendered) {
                    // Cache handle to the domNode even if we are a child of a container; otherwise
                    // we may lose our place within our siblings that share the same slot.
                    var ph = this.domNode;
                    // When unrendering, dont try to remove domNode from HTML; we need it to
                    // stay put so we can replace it with the new domNode after re-rendering.
                    this.unrender(true);
                    this.placeholder = ph;
                    if (postUnrender) {
                        postUnrender();
                    }
                    this.render();
                }
            },
            
            /**
             * <p>Extends the set() method from _Observable so that it calls the corresponding markup method for the property, thus updating the DOM.</p>
             * 
             * <p>This is done regardless of whether or not an event is published corresponding to the change in property value.</p> 
             *
             * <p>If a property named "<n>" is changed, the corresponding markupMethod to call is assumed to be named "on<n>Changed".</p>
             * 
             * @param {String} n The name of the property whose value is to be set.
             * @param {Number|String|Object} v The new value.
             * 
             * @returns {Object} this
             */
            set: function set(n, v) {
                // We must call the super method first to update the property value,
                // because the markup method will assume the property value has been updated.
                this._super(n, v);
                
                if (this.domNode) {  //was: this.hasRendered, changed it in order to fire this code in mid-rendering cycle
                    // If an event is published, ideally the markup method should be 
                    // done before publishing the event to external listeners so that the DOM
                    // response is immediate, but for now that can't be done, because the
                    // superclass method already took care of the publishing.
                    var ms = this.markupMethods,
                        f = ms && ms["on" + n + "Change"];
                    if (f) {
                        f.apply(this);
                    }
                }
                return this;
            },

            
            /**
             * <p>A hash of names used for DOM node slots.</p>
             * 
             * <p>A "slot" is a DOM node in a Widget's rendering which has some special significance. Such a node would be labeled with a special attribute in the Widget's markup string.
             * This mixin will store a reference to each such dom node as a property of this Widget; the property's name is designed by the "mstrSlot"
             * attribute of the DOM node.  This allows javascript convenient access to meaningful nodes in the DOM rendering beyond just the root "domNode".</p>
             * 
             * <p>All slot label names that are found in this Widget's DOM are recorded in an internal hash so the references to those nodes can be destroyed 
             * later for garbage collection.<p>
             * 
             * @type Object
              */
            slotNames: null,

            /**
             * <p>Given a hash of DOM nodes, keyed by slot name, this method sets properties on this widget that point to the DOM nodes.</p>
             * 
             * <p>Each property is named after the slot name.  Additionally, each property name is stored in the widget's internal "this.slotNames" hash for future reference.</p>
             * 
             * @param {Object} slots A has of slot names to add.
             */
            addSlots: function addSlots(slots) {
                // Initialize internal hashtable of slot names.
                var ns = this.slotNames;
                if (!ns) {
                    ns = {};
                    this.slotNames = ns;
                }
                // Add each given slot to our hashtables.    
                for (var n in slots) {
                    this[n] = slots[n];
                    ns[n] = true;
                }
            },
                            
            /**
             * <p>Given a hashtable of slot names, removes each slot-named property value from this widget.</p>
             *
             * <p>This method also removes the given slot names from the internal hash of used slot names
             * for this widget (this.slotNames).</p>
             * 
             * @param {Object} A hash of slot names to remove, keyed by slot name.
             */
            removeSlots: function rmvSlts(slots) {
                if (slots) {
                    var sns = this.slotNames;
                    for (var n in slots) {
                        delete this[n];
                        if (sns) {
                            delete sns[n];
                        }
                    }
                }
            },
                                    
            /**
             * <p>Generic method to wire up DOM events to widget's handlers.</p>
             *
             * <p>This generic method can be called from any DOM handler in the markup.  It acts as a bridge between the
             * markup's native DOM handler and the widget's handler method for that event. This method synthesizes
             * an object representing the event, and raises that event. If DOM provides an event object, that DOM event object is 
             * enclosed in the synthesized object, along with an optional config hash of params.</p>
             *
             * <p>Typical usage: a Widget subclass typically implements the preXXX & postXXX methods, but leaves the
             * onXXX method empty, to be specified by the app developer in the config of the Widget instance.</p>
             *
             * <p>Example:</p>
             * <pre>var myButton = new mstrmojo.Button( {onclick: function(){alert("Hello world!")} );</pre>
             *
             * @param {String} type The name of the DOM event.
             * @param {DOMWindow} hWin The DOM window in which the event originated.
             * @param {DOMEvent} [e] The DOM event object, if provided by the browser.
             * @param {Object} [config] Hash of configuration settings to be passed along to the widget handler.
             */ 
            captureDomEvent: function cap(type, hWin, e, config){
                if (this.enabled !== false) {
                    this.raiseEvent({             
                        name: type, 
                        hWin: hWin, 
                        e: e || hWin.event, 
                        config: config
                    });
                }
            },
            
            /**
             * <p> Method to play an effect expressed by a json object on this widget. </p>
             * TO-DO: where would be the best place to locate this? 
             */
            playEffect: function(n){
                var fx = this[n];
                if (fx && fx.constructor === Object) {
                    fx = mstrmojo.insert(mstrmojo.hash.clone(fx)); //TO-DO: do we really need to make a copy of fx first? 
                    fx.widget = this;
                    this[n] = fx;
                }
                fx && fx.play();
            }            
        });
})();