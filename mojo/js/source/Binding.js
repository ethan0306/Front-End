(function(){
	mstrmojo.requiresCls("mstrmojo.hash");
	
    var reCHAIN_THIS = /this\.([\w\.\[\]\'\"\-]+)/m,
        reCHAIN_THIS_TEST = /this\./m,
        reCHAIN_ALL_BRACKET = /mstrmojo\.all\[[\'\"]([\w]+)[\'\"]\]\.([\w\.\[\]\'\"\-]+)/m,
        reCHAIN_ALL_BRACKET_TEST = /mstrmojo\.all\[/m,
        reCHAIN_ALL_DOT = /mstrmojo\.all\.([\w]+)\.([\w\.\[\]\'\"\-]+)/m,
        reCHAIN_ALL_DOT_TEST = /mstrmojo\.all\./m,
        reCvtIdxs = /\[(\d+)\]/g,
        reCvtSingleQts = /\[\'([\w\-]+)\'\]/g,
        reCvtDblQts = /\[\"([\w\-]+)\"\]/g,
        reTruncBrkts = /([\[\]].*)/;

    mstrmojo.Binding = mstrmojo.declare(
        // superclass
        null,
        // mixins
        null,
        // instance members
        {
			scriptClass: "mstrmojo.Binding",
			
            /**
             * Reference to the context object whose property is the destination of this Binding.
             */
            parent: null,
            
            /**
             * String|Function. Javascript to be evaluated to determine a value for this Binding's destination.
             * The script will be evaluated in the context of the Binding's parent.
             */
            source: null,
            
            /**
             * String. Name of the property whose value will be determined by this Binding.
             */
            destination: null,

            /**
             * Records whether or not the binding is attached.
             */
            enabled: false,
            
            /**
             * Optional config for a setter function to set the destination's value. If null, no setter is used; the
             * destination is set directly (e.g., parent[destination] = value). If String, specifies the name of a method
             * of the parent object, which will serve as the setter. If Function, specifies a setter function which will be
             * applied in the parent's context to set the destination.
             */
            setter: "set",
            
            /**
             * <p>Indicates whether or not this binding is currently updating the bound destination.</p>
             *
             * <p>This flag is set to a positive integer while this binding is executing; otherwise it is zero.
             * The specific number is the total count
             * of calls to this.exec() which are currently executing; this count can be > 1 if the binding is designed to
             * cause its own trigger, either directly or indirectly, in a cyclical manner.</p>
             * @type Integer
             */
            executing: 0,
                        
            init: function init(/*Object?*/ props) {
                // Apply the given properties to this instance.
                mstrmojo.hash.copy(props, this);
                
                // Then add ourselves to the registry, so we can be called back by events later.
                mstrmojo.registry.add(this);
            },

            destroy: function dest(){
                // Remove any event communication involving this object (faster than calling disable).
                mstrmojo.publisher.clearSubscriptions(this.id);
                // Remove ourselves from registry.                
                mstrmojo.registry.remove(this);
            },
                        
            /**
             * Executes the source script and stores the resulting value in the destination.
             */
            exec: function exec(){
                this.executing++;
                // Retrieve the source script as a Function object (cache it for later re-use).
                var fn = this._sourceFn;
                if (!fn) {
                    var s = this.source;
                    if (s != null) {
                        if (typeof(s) == "string") {
                            // TO DO: add a "return " at the beginning of the string if all conditions are met:
                            // [1] it has no "return ", and
                            // [2] if there is a semicolon, it is not followed by any chars except possibly blankspace chars.
                            if (!(s.match("return ")) && !(s.match(/\;\s*\S/))) {
                                s = "return " + s;
                            }
                            fn = new Function(s);
                        } else if (typeof(s) == "function") {
                            fn = s;
                        }
                        this._sourceFn = fn;
                    }
                }
                
                // If we have a source script Function, call it to calculate a value. 
                var v, p = this.parent;
                if (fn) {
                    try {
                        v = fn.apply(p, []);
                    } catch(ex) {
                        // Bad binding script. Result value will be undefined.
                    }
                }        
                
                // Update the destination with the new value.
                var st = this.setter,
                    d = this.destination;
                if (st == null) {
                    p[d] = v;
                } else if (typeof(st) == "string") {
                    p[st](d, v);
                } else if (typeof(st) == "function") {
                    st.apply(p, [d,v]);
                }
                this.executing--;
            },
                        
            /**
             * Starts up the binding by executing the source script, updating the destination's value,
             * and attach event listeners for changes in the source's result value.
             */
            enable: function en() {
                if (!this.enabled) {        
                    // Update the destination's value.
                    this.exec();        
                    // Parse the source script, if we haven't already.
                    var chs = this._chains;
                    if (!chs) {
                        this._parseChains();
                        chs = this._chains;
                    }
                    // Attach event listeners to expressions within the source script.
                    for (var k in chs) {
                        this._attachChain(chs[k]);
                    }
                    this.enabled = true;
                }
            },
            
            /**
             * Stops the binding by detaching event listeners for changes in the source's result value.
             */
            disable: function dis() {
                if (this.enabled) {
                    // Detach event listeners, if any.
                    var chs = this._chains;
                    if (chs) {
                        for (var k in chs) {
                            this._detachChain(chs[k]);
                        }                
                    }        
                    this.enabled = false;        
                }
            },

            /**
             * Internal cache of results from parsing the source script.
             */
            _chains: null,

            /**
             * Parses the source script, searching for "chains" of objects that we should attach event listeners to.
             * Examples of a chain:  "this.foo.bar", "mstrmojo.all['foo'].bar.get(..)".
             */
            _parseChains: function() {
                // Init cache.
                this._chains = {};
                var chains = this._chains;

                // Fetch source script as a string.
                var s = this.source;
                if (s && (typeof(s) == "function")) {
                    s = s.toString && s.toString();
                }
                if (!s) {
                    return;
                }
                
                // Helper method for using regular expression to find matches and storing results in cache.
                function _findMatches(/*String*/ str, /*RegExp*/ re, /*Integer*/ hostIdx, /*Integer*/ partsIdx) {
                    var sTemp = str,
                        match;
                
                    while (match = sTemp.match(re)) {    // Note: this is an assignment ("=") and null-check, NOT an equals test ("==")
                        // Found a match.
                        var key = match[0],
                            len = key.length,
                            add = true;
                        
                        // Replace "[##]" with ".#", ['XX'] with .XX, ["XX"] with .XX
                        // Then truncate any remaining bracketed substring.
                        key = key.replace(reCvtIdxs, ".$1"
                                    ).replace(reCvtSingleQts, ".$1"
                                    ).replace(reCvtDblQts, ".$1"
                                    ).replace(reTruncBrkts, '');
                        
                        // Is this match redundant?
                        for (var k in chains) {
                            if (k.substr(0, len) === key) {
                                // The match is a subset of a previous match; skip it.
                                add = false;
                                break;
                            } else if (key.indexOf(k) === 0) {
                                // The match is a superset of a previous match; drop the previous match.
                                delete chains[k];
                            }
                        }
                        if (add) {
                            chains[key] = {
                                host: (hostIdx == null) ? null : match[hostIdx],
                                parts: match[partsIdx].replace(reCvtIdxs, ".$1"
                                        ).replace(reCvtSingleQts, ".$1"
                                        ).replace(reCvtDblQts, ".$1"
                                        ).replace(reTruncBrkts, '').split('.')
                            };
                        }
                        sTemp = sTemp.substr(match.index + len);
                    }
                }                
                
                /*
                We only recognize chains with specific syntax:
                    a) "this.<parts>"
                        where <parts> has only periods and word chars (alphanumerics+underscore). So, not allowed: "(" ,")",":", commas, blanks, etc.
                        Note: We don't check for double-periods ("this.foo..bar"), but of course that will result in a run-time err when exec() is called anyway.
                        Note: We DO allow <parts> to have square brackets ONLY like this "[##]", to support arrays, or like this ['..'] and [".."] to support hyphenated property names.
                */
                if (reCHAIN_THIS_TEST.test(s)) {
                    _findMatches(s, reCHAIN_THIS, null, 1);
                }
                
                /*
                Or in the following syntax:
                    b) "mstrmojo.all['<host>'].<parts>", or
                    c) "mstrmojo.all["<host>"].<parts>"
                        where <host> has only word chars (alphanumerics+underscore).
                */
                if (reCHAIN_ALL_BRACKET_TEST.test(s)) {
                    _findMatches(s, reCHAIN_ALL_BRACKET, 1, 2);
                }
                /* Or in the following syntax:
                	d) "mstrmojo.all.<host>.<parts>"
                		where <host> has only word chars.
                */
                if (reCHAIN_ALL_DOT_TEST.test(s)) {
                    _findMatches(s, reCHAIN_ALL_DOT, 1, 2);
                }
            },

            /**
             * Attaches event listeners to the objects along a given "chain".  The "chain" is an object in this._chains
             * hashtable, which was generated by _parseChains. Optional start index can be given; if missing, 0 is assumed.
             */
             _attachChain: function attCh(/*Object*/ ch, /*Integer?*/ start) {
    
                // Init lookups, if needed.
                 if (!ch.evt2idx) {
                     ch.evt2idx = {};
                 }
                 if (!ch.idx2evt) {
                     ch.idx2evt = [];
                 }
                 var evt2idx = ch.evt2idx,
                     idx2evt = ch.idx2evt,
                     parts = ch.parts;
    
                 // Init starting index, context and property.
                 var idx = (start >= 0) ? start : 0,
                     bId = this.id,
                     reg = mstrmojo.all,
                     ctxt = (start > 0) ?
                                 reg[idx2evt[idx-1].context][parts[idx-1]] :
                                 (ch.host ? reg[ch.host] : this.parent), 
                     prop = parts[idx];
                     
                // Walk the chain...
                var A = mstrmojo.array;                 
                 while (ctxt && prop) {
                     if (ctxt.attachEventListener) {
                         // What events should we listen for?
                         var evts = ctxt[prop+"_bindEvents"] || (prop+"Change");
                         if (typeof(evts) == "string") {
                             evts = [evts];
                         }
                         var subs = [];
                         for (var i = 0, iLen = evts.length; i< iLen; i++) {                           
                             subs[i] = ctxt.attachEventListener(evts[i], bId, "_callback");
                         }
                         
                         // Update the map from event to index.
                         for (var i=0; i<evts.length; i++) {
                             evt2idx[ ctxt.id+"_"+evts[i] ] = idx;
                         }
                         
                         // Update the map from index to event.
                         idx2evt[idx] = {context: ctxt.id, evts: evts, subs: subs};
                     }
                     // Continue to the next item on the chain...
                     ctxt = ctxt[prop];
                     prop = ch.parts[++idx];
                 }
             },
             
            /**
             * Detaches event listeners from the objects along a given "chain".  The "chain" is an object in this._chains
             * hashtable, which was generated by _parseChains. Optional start index can be given; if missing, 0 is assumed.
             */
            _detachChain: function detCh(/*Object*/ ch, /*Integer?*/ start) {

                 var reg = mstrmojo.all,
                     idx2evt = ch.idx2evt,
                     evt2idx = ch.evt2idx,
                     bId = this.id;
    
                 var i = (start > -1) ? start : 0,
                     len = idx2evt.length;
                 if (i < len) {
                     for (; i<len; i++) {
                          
                         var atts = idx2evt[i];
                         if (!atts) {
                             break;
                         }
                         var ctxtid = atts.context,
                             ctxt = reg[ctxtid],
                             evts = atts.evts;
                             
                         // Stop listening for events in this outdated context.
                         if (ctxt && ctxt.detachEventListener) {
                             var s = atts.subs;                                
                             for(var t = 0, tLen = s.length; t < tLen; t++) {                                
                                 ctxt.detachEventListener(s[t]);
                             }
                         }
                         // Update the map from index to event.
                         idx2evt[i] = null;
                         // Update the map from event to index.
                         for (var j=0, jLen=evts.length; j<jLen; j++) {
                             delete evt2idx[ctxtid+"_"+evts[j]];
                         }
                     }
                 }
            },
            
            /**
             * Notifies the Binding that the destination's value needs to be refreshed.  Also responsible for determining
             * whether or not event listeners need to be detached and re-attached.
             */
            _callback: function clbk(/*Event*/ evt) {
                
                // Update the destination's value.
                this.exec();
                
                /*
                // For debugging only:
                var n = evt && evt.name, 
                    cbs = window.cbs;
                if (!cbs) cbs = window.cbs = {};
                
                if (cbs[n]) {
                    cbs[n]++;
                } else {
                    cbs[n] = 1;
                }
                */
                    
                if (!evt || !evt.name || !evt.src) {
                    return;
                }
                
                // Do we have any chains that require updating when this event is heard?
                var k = evt.src.id+"_"+evt.name,
                    chains = this._chains;
                // For each chain...
                for (var c in chains) {
                    // Does this event.src+evt.name combination map to an index in this chain?
                    var ch = chains[c],
                        idx = ch.evt2idx[k];
                    if (idx != null) {
                        // Yes, this chain needs to be detached & re-attached.
                        this._detachChain(ch, idx+1);
                        this._attachChain(ch, idx+1);
                    }
                }

            }
                                    
        }
    );

})();