(function(){

	/**
	 * Responsible for parsing a widget markup string.
	 */
	mstrmojo.markup = {
			
		/**
		 * Computes the HTML that results from applying a given markup string to a given object.
		 * The method works by first extracting the HTML section from the markup string, and then
		 * replacing the tokens for dynamic values with actual values from the given object.
		 */
		apply: function apply(/*String*/ markup, /*Object*/ obj) {
			// Optimization: Dont call dhtml before a quick string check.
			var s = (/mstrmarkup\:markup/).test(markup) ?
						this.dhtml(markup) :
						markup;
			return s.replace(
								this._REG_EXP_TOKENS,
								function tokenRepl(/*String*/ token, /*String*/ prop) {
										return (prop in obj && obj[prop] !== null) ? obj[prop] : "";
								}
							);
		},
		
		/**
		 * Extracts the HTML section of the markup string.  This method works by removing the root 
		 * <mstrmarkup:markup> tags (if any). Tokens for dynamic values are left unchanged.
		 */
		dhtml: function dhtml(/*String*/ markup) {
			return (markup || ""
							).replace(/^<mstrmarkup:markup[^\>]*?\>/, ""
							).replace(/<\/mstrmarkup:markup\>/, "");
		},

		/**
		 * Searches the given DOM node and its descendants for the attribute mstrSlot="<name>".
		 * Returns a hashtable of such found nodes; the hash is keyed by the slot <name>, and the
		 * value of the key is the corresponding DOM node.  
		 */
		slots: function slots(/*DomNode*/ node) {

			var hash = {};
			
			// This method will check if a given dom node is marked as a slot,
			// and if so, return an array of slot names in the node's mstrSlot attribute.
			// Note that each node can be assigned to multiple slot names by using a 
			// comma-delim list.
			function getSlotNames(/*DomNode*/ node) { 
				var names = node.getAttribute("mstrSlot");
				if (names) {
					var arr = names.split(/\s*,\s*/);
					for (var i=0, len=arr.length; i<len; i++) {
						hash[arr[i]] = node;
					}
				}
			}

			
			// Check if the domNode itself is a slot.
			getSlotNames(node);

			// Check if any of the descendants of the domNode are slots.
			var nodes = node.getElementsByTagName("*");
			for (var j=0, jLen=nodes&&nodes.length||0; j<jLen; j++) {
				getSlotNames(nodes[j]);
			}
			
			return hash;
		},
		
		/**
		 * Internal regular expression used to match dynamic tokens in markup. 
		 */		
		_REG_EXP_TOKENS: /\{\@([^\}]+)\}/gm,

		/**
		 * Indicates whether or not to cache parsing results locally.				
		 * Performance optimization: don't use the cache OOTB. We'll use JSON collections
		 * of markup methods out of the box, so our cache will always be empty, and searching
		 * for the cache is using up function calls needlessly.
		 */
		useCache: false,
		
	    /**
	     * Build a collection of custom methods found in a given markup XML string.
	     * These methods are the attributes of the optional <mstrmarkup:markup> root node.
	     * Assumes that root node, if present, contains no ">" char in its attributes.
	     * @return Hash with 2 properties: (1) "lookup" - a hashtable of functions,
	     * keyed by the attribute name; (2) "sequence" - an ordered array of the function names.
	     */
		methods: function meths(/*String*/ markup) {
		
			var c = this.useCache && this._findCache(markup);
			if (c) return c;

			// Parse results not found in cache, so continue with parse.			
        	var methods = {lookup: {}, sequence: []};
        		
			// Parse out the XML of the root node <mstrmarkup:markup>.
			var root = markup && markup.match(/<mstrmarkup\:markup(.*?)\>/);
			if (!root) return methods;
			
			// Find all the attributes of the root node.
			var s = root[1],
				matches;        
	        while ((matches = s.match(/([^\s=]+)=\"([^\"]+)\"/m))) {
    	        // We found an attribute of format <name>="<value>".
    	        var n = matches[1];
    	        methods.lookup[n] = new Function(matches[2]);
    	        methods.sequence.push(n);
            
	            // Continue parsing the XML for next handler...
    	        s = s.substr(matches.index + matches[0].length);
	        }

			// Store results in cache for later re-use.
        	if (this.useCache) this._writeCache(markup, methods);

	        return methods;				
		},
		
		/**
		 * Internal cache of parsed results; to avoid repeat parsings of the same markup.
		 */
		_cache: [],

		_writeCache: function(/*String*/ markup, /*Any*/ data) {
			this._cache.push({markup: markup, data: data});
		},
		
		_findCache: function(/*String*/ markup) {
			var c = this._cache,
				match;
			for (var i=0,len=c.length; i<len; i++) {
				if (c[i].markup == markup) {
					match = c[i];
					break;
				}
			}
			return match && match.data;
		}
	};
	
})();