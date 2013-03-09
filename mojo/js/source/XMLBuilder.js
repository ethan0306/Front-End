(function() {
	mstrmojo.requiresCls("mstrmojo.hash","mstrmojo.string", "mstrmojo.StringBuffer");

	/**
	 * Only for internal use in this class
	 */
	mstrmojo._XMLNode = mstrmojo.declare(null, null ,
		{
			nodeName: null,
			init: function init(props) {
		        // Apply the given properties to this instance.
				mstrmojo.hash.copy(props, this);    // Optimization: use copy rather than mixin, unless truly needed.
			},
			addChild: function addChild(nodeName)
			{
				var child = new mstrmojo._XMLNode({nodeName: nodeName});
				return this.appendNode(child);
			},

			appendNode: function appendNode(node)
			{
				if (node)
				{
					if (!this.children)
					{
						this.children = [];
					};
					this.children.push(node);
					node.parent = this; // backward link
				};
				return node;
			},
			
			addAttribute: function addAttribute(name, value)
			{
				if (name != null)
				{
					if (!this.attributes)
					{
						this.attributes = {};
					};
					this.attributes[name] = value;
				};
				return this;
			},
			
			addText: function addText(text)
			{
				this._addToStringMember('text', text);
				return this;
			},

			addRawXML: function addRawXML(xml)
			{
				this._addToStringMember('rawXML', xml);
				return this;
			},
			getXMLString: function getXMLString() {
				var buf = new mstrmojo.StringBuffer();
				this.buildXMLString(buf);
				return buf.toString();
			},
			buildXMLString: function buildXMLString(buf)
			{
				buf = buf || new mstrmojo.StringBuffer();
				buf.append('<')
					.append(this.nodeName )
					.append(' ');
					this._buildAttributesXMLString(buf)
					.append('>')
						.append(((this.text != null) ? this._escapeString(this.text) : ''))
						.append(((this.rawXML != null) ? this.rawXML : ''));
						this._buildChildrenXMLString(buf)
					.append('</')
					.append(this.nodeName) 
					.append('>');
						
				return buf;
			},

			/* Helper methods. */
			
			_buildAttributesXMLString: function buildAttributesXMLString(arr)
			{
				var attrs = this.attributes;
				if (attrs)
				{
					for (var id in attrs)
					{
						if (attrs[id] != null)
						{
							var v = String(attrs[id]);
							switch(id) {
							case 'et':
							case 'nt':
							case 'dmt':
							case 'ddt':
							case 'fnt':
							case 'tp':
							case 'stp':
								break;
							default:
								v = this._escapeString(v);
							}
							arr.append(id + '="' + v + '" ');
						};
					};
				};
				return arr;
			},
			
			_escapeString: function escapeString(v) {
				return mstrmojo.string.escape4HTMLText(v);
			},
			
			_buildChildrenXMLString: function buildChildrenXMLString(arr)
			{
				var c = this.children;
				var len = c && c.length;
				if (len)
				{
					for (var i = 0; i < len; i++)
					{
						if (c[i] && c[i].buildXMLString) {
							c[i].buildXMLString(arr);
						}
					};
				};
				return arr;
			},
			
			_addToStringMember: function addToStringMember(memberName, str)
			{
				var val = this[memberName];
				if (val == null)
				{
					this[memberName] = str;
				}
				else
				{
					this[memberName] = val + str;
				};
			}
	});
	mstrmojo.XMLBuilder = mstrmojo.declare(null, null, {
		/**
		 * Root node.
		 */
		root: null,
		/**
		 * Current node.
		 */
		curNode: null,
		/**
		 * Adds a new child node with given name.
		 * After adding, the new child node becomes the current node of this builder.
		 * If there is not root node before adding, then newly added child node becomes the root node.
		 * 
		 * @param nodeName The new child node name.
		 */
		addChild: function addChild(nodeName)
		{
			if (!this.root){
				this.currentNode = this.root = new mstrmojo._XMLNode({nodeName: nodeName});
				
			} else {
				this.currentNode = this.currentNode.addChild(nodeName);
				
			}
			return this;
		},
		/**
		 * Appends a node as child of current node. If there is no root node yet, this node becomes the root node.
		 * After appending, the incoming node becomes the current node in this builder.
		 * 
		 * @param node  The node to be appended.
		 */
		appendNode: function appendNode(node)
		{
			if (!this.root){
				this.currentNode = this.root = node;
				
			} else {
				this.currentNode = this.currentNode.appendNode(node);
			}
			return this;
		},
		/**
		 * Adds attribute for current node.
		 * 
		 * @param name The name for the attribute.
		 * @param value The value for the attribute.
		 */
		addAttribute: function addAttribute(name, value)
		{
			if (this.currentNode){
				this.currentNode.addAttribute(name, value);
			} else {
				alert('no root node');
			}
			return this;
		},
		/**
		 * Adds a new text node to current node.
		 * 
		 * @param text The text string to be added as a text node.
		 */
		addText: function addText(text)
		{
			if (this.currentNode){
				this.currentNode.addText(text);
			} else {
				alert('no root node');
			}
			return this;
		},
		/**
		 * Adds a string as raw xml.
		 * 
		 * @param xml The string to be added as raw xml.
		 */
		addRawXML: function addRawXML(xml)
		{
			if (this.currentNode){
				this.currentNode.addRawXML(xml);
			} else {
				alert('no root node');
			}
			return this;
		},
		/**
		 * Closes current node. Current node will be replaced by current node's parent node. 
		 * If root node reached, then current node will be null.
		 */
		closeElement: function closeElement() {
			this.currentNode = this.currentNode.parent;
		},
		/**
		 * Returns the XML string representation of current builder.
		 * 
		 * If no root node, an empty string will be returned.
		 */
		toString: function toString() {
			if (this.root) {
				return this.root.getXMLString();
			} else {
				return '';
			}
		}
			
	}
	);
})();