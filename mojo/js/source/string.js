(function(){

    /**
     * Internal regular expression used to match dynamic tokens in a string template. 
     * @private
     */     
    var _reTOKENS = /\{\@([^\}]+)\}/gm,
        _reLT = /\</gm,
        _reGT = /\>/gm,
        _reNEm = /\S/,
        _regSpecials = ['$','^','=','!',':',
                    '/', '.', '*', '+', '?', '|',
                    '(', ')', '[', ']', '{', '}', '\\'
                  ],
        _reRegEsc = new RegExp(
                '(\\' + _regSpecials.join('|\\') + ')', 'g'
        ),
        _xmlRep = {
                    '&': { k: '&(?!#?\\w+;)', v: '&amp;'},
                    '<'            : '&lt;',
                    '>'            : '&gt;',
                    'u0009'        : '&#x09;',  // tab
                    '\n'           : '&#x0A;',  // line feed
                    '\r'           : '&#x0D;',  // carriage return
                    '"'            : '&quot;'
                    },
       _htmlRep = {
                    '&': { k: '&(?!#?\\w+;)', v: '&amp;'},
                    '<'            : '&lt;',
                    '>'            : '&gt;', 
                    ' '            : '&nbsp;',
                    '\n'           : '<br/>',  // line feed
                    '\r'           : '&nbsp;&nbsp;&nbsp;&nbsp;',  // carriage return  
                    '\''           : '&#039;',
                    '"'            : '&quot;'                    
                    };

    /**
     * Internal method to determine the object type.
     * It will return primitive type as of built-in typeof returns.
     * It will return "array" for built-in JavaScript Array and mstrmojo.Arr.
     * It will return "object" for other
     */
    var _typeOf = function (v) {
        if (v == null) {
            return 'null';
        }
        var t = typeof(v);
        if (t != 'object') {
            return t;
        } else {
            if (v.length === undefined) {
                return 'object';
            } else {
                return 'array';
            }
        }
    };
    
    var parseUriOptions = {
        strictMode: false,
        
        key: [ 'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor' ],
        
        q: {
            name: 'queryKey',
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };        
    
	/**
	 * A static utility class for string operations.
	 * 
	 * @class
	 */
	mstrmojo.string = mstrmojo.provide(
	        
	   "mstrmojo.string",
	   
	   /**
	    * @lends mstrmojo.string
	    */
	   {

		/**
		 * Performs multiple replacement operations on a single string.
		 * 
		 * @param {String} s The string whose values should be replaced.
		 * @param {Object} hash A hash whose property names represent the strings that should be replaced and values represent the strings that should replace them.
		 * 
		 * @returns String
		 */
		multiReplace: function multiReplace(s, hash) {
			if (!s) {
				return '';
			}
			
			var keys = [];
			for (var k in hash) {
			    keys.push(k.k || k); // if has a key defined explicitly, using it
			}
			
			return s.replace(new RegExp(keys.join('|'), 'g'), function ($0) {
				var v = hash[$0];
                return v.v || v;           // return value, if it is defined explicitly
			});
		},
			
		/**
		 * Removes white space from beginning & end of a given string.
		 */		
		trim: function trim(/*String*/ s) {
			return (s && s.replace)? s.replace(/^\s+/, "").replace(/\s+$/, ""):s;
		},

        /**
         * Check whether a string is empty
         */
        isEmpty: function isEmpty(v){
            return (v == null) || !(_reNEm.test(v)); // Boolean
        }, 

        regEscape : function regEscape(text){
            return text.replace(_reRegEsc, '\\$1');
        },
        
		/**
		 * Creates an encoded attribute string for an XML element for the value passed.
		 * 
		 * @param {String} v The value of the attribute.
		 * 
		 * @returns {String} The encoded string that can be used as XML attribute.
		 */
		encodeXMLAttribute : function(v) {
			return mstrmojo.string.multiReplace(v, _xmlRep);
		},
		
		encodeHtmlString: function(v) {
	        return mstrmojo.string.multiReplace(v, _htmlRep);
		},
		
		/**
		 * <p>Replace angles brackets in a given string with the HTML equivalents "&lt;" and "&gt;".</p>
         *
		 * <p>Used as a faster substitute for multiReplace.</p>
		 * @param {String} s String to be encoded.
		 * @return {String} The encoded result; if null was provided, null is returned.
		 */
		htmlAngles: function(s){
		  if (s != null) {    // if is not null and not undefined
		      return s.replace(_reLT, '&lt;').replace(_reGT, '&gt;');
		  }
		  return s;
		  
		},
		
        /**
         * <p>Applies a given template string to a given object.</p>
         *
         * <p>This method replaces tokens in the given template with actual property values values from the given 
         * object. The token syntax is assumed to be "{@<prop>}" where <prop> is the name of a property. If the
         * property value is null, the token is replaced by an empty string.</p>
         *
         * @param {String} tmpl The template to be applied.
         * @param {Object} obj The object to which the template is applied.
         *
         * @returns {String} The new string without tokens.
         */
        apply: function apl(tmpl, obj) {
            if (!tmpl) {
                return "";
            }
            return tmpl.replace(
                                _reTOKENS,
                                function tokenRepl(token, prop) {
                                        return (prop in obj && obj[prop] !== null) ? obj[prop] : "";
                                }
                    );
        },
        /**
         * Converts JSON object into its XML representation.
         * 
         * Primitive type of data will be serialized as attribute of the xml node;
         * Object type of data will be serialized as a child node of the current node, with node name the same as the property name;
         * Array type of data will be serialized as a child node of the current node, with the node name the same as the property name,
         * and each item in the array will be serialzied as a child node of the array node, with the node name determined by config.getArrItemName. 
         * 
         * @param (String) nodeName the name of the root node of the XML string
         * @param (Array|Object) jsons An array of JSON objects or a single JSON object. 
         *          When it is an array, the properties of each JSON object will be serialized as root node's attribute or child node.
         * @param (Object) config A config object to help customizing serializing. It can have following properties:
         *          getArrItemName(n,v,i): when an array is encountered, each item in the array will be serialized into a child node. 
         *                                  But what to be used as child node name will be determined by the return value of this function.
         *                                  parameter 'n' is the name of the array property; parameter 'v' is the array; parameter 'i' is the index of the current item.
         *          isSerializable(nodeName, jsons): before json2xml serialize for any property of current node, it will refer to this method to 
         *                                  check whether serialization in json2xml should be performed. If this method returns boolean "true", the regular 
         *                                  serialization will keep going. If this method return boolean 'false', then serialization of this property will be skipped.
         *                                  If an object is returned, then the string value of its 'att' property will be put in as xml attribute for current node,  
         *                                  and the string value of its 'child' property will be put as child node of current node.
         *                                  So, by using this method, caller can customize json2xml to skip serialization of certain nodes, or customize certain node's serialization result.  
         *          convertBoolean: when serialzing boolean properties whether to convert them to integers (-1/0) or not. Default to true
         */
        json2xml: function(/*String*/nodeName, /*Array|Object*/jsons, /*Object*/config){
            if (!(jsons instanceof Array)){
                jsons = [jsons];
            }
           
            var serial = config && config.isSerializable,
                convertBoolean = (config.convertBoolean === false)? false:true;
            
            // serialize jsons
            var att= [],    // array of all attributes for this xml node
                ch = [],    // array of all child nodes for this xml node
                n,          // name of the property
                v,          // value of the property
                t;          // type of the property value
            // loop through all json objects
            for (var ji = 0, jlen = jsons.length; ji < jlen; ji ++) {
                var json = jsons[ji];
                // loop through each property
                for (n in json){
                    // config may have customized serialization for certain node
                    if (serial) {
                        var ret = serial(n, jsons, ji);
                        if (ret !== true){
                            if (ret === false) {    // returned boolean 'false'
                                continue; // skip current property.
                            } else {
                                if (ret.att){       // returned object contains attribute xml
                                    att.push(ret.att);
                                }
                                if (ret.child){     // returned object contains child xml
                                    ch.push(ret.child);
                                }
                                continue;
                            }
                        }
                        // returned true, then keep going with regular serialization
                    }                
                    v = json[n];
                    t = _typeOf(v);
                    switch(t) {
                        case 'array':
                            ch.push('<' + n + '>');     // node for array
                            // loop through each array item
                            for (var i = 0, len = v.length; i < len; i ++){
                                var cn = config.getArrItemName(n,v,i) || i; // child name
                                ch.push(this.json2xml(cn, v[i], config));   // node for each array item
                            }
                            ch.push('</' + n + '>'); // close the array node
                            break;
                        case 'object':
                            ch.push(this.json2xml(n, v, config));
                            break;
                        case 'string':
                            att.push(n + '="' + mstrmojo.string.encodeXMLAttribute(v) + '"'); 
                            break;
                        case 'boolean':
                            att.push(n + '="' + ((convertBoolean)? (v ? '-1': '0'):v) + '"'); 
                            break;
                        case 'null': 
                            if (!config.skipNull) {
                                att.push(n + '="' + config.nullValue + '"');
                            }
                            break;
                        default:
                            att.push(n + '="' + v + '"'); 
                            break;
                    }
                } // end of looping through each property
            } // end of looping through each json objects
            return '<' + nodeName + ' ' + att.join(' ') + '>' + ch.join('') + '</' + nodeName + '>';
        },
        
        escape4HTMLText: function escape4HTMLText(v) {
            if (!v || !v.replace) {
                return v;
            }
            var QUOTE = /\"/gm;
            var QUOTE_ENCODED = '&quot;';
            var AMP = /\&/gm;
            var AMP_ENCODED = '&amp;';
            var LESSTHAN = /\</gm;
            var LESSTHAN_ENCODED = '&lt;';
            var GREATERTHAN = /\>/gm;
            var GREATERTHAN_ENCODED = '&gt;';
            return v.replace(AMP, AMP_ENCODED
                                ).replace(QUOTE, QUOTE_ENCODED
                                ).replace(LESSTHAN, LESSTHAN_ENCODED
                                ).replace(GREATERTHAN, GREATERTHAN_ENCODED);
        },
        
        /**
         * <p>Parses a URI into an object containing it's component parts.</p>
         * 
         * <p>Ported from Steven Levithan's parseURI 1.2.2</p>
         * 
         * <ul>
         *  <li>parseUri 1.2.2</li>
         *  <li>(c) Steven Levithan &lt;stevenlevithan.com&gt;</li>
         *  <li>MIT License</li>
         * </ul>
         * 
         * @param {String} uri The URI to parse.
         * @param {Object} [options] Optional parsing options (will default to standard options).
         * 
         * @returns Object
         * 
         */
        parseUri: function (str, options) {
            options = options || parseUriOptions;
            
            var m = options.parser[((options.strictMode) ? 'strict' : 'loose')].exec(str),
                uri = {},
                i = 14;
            
            while (i--) {
                uri[options.key[i]] = m[i] || '';
            }
            
            uri[options.q.name] = {};
            uri[options.key[12]].replace(options.q.parser, function ($0, $1, $2) {
                if ($1) {
                    uri[options.q.name][$1] = $2;
                }
            });
            
            return uri;
        }

	});
	
})();