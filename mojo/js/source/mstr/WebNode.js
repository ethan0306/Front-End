/**
 * Node in MSTR expression.
 */
(function() {
	/* private */
	var $A = mstrmojo.array,
	    /**
	     * Checks the new Child and reference
	     * @private
	     */
		_check = function(newChild, refNode) {
			var pos = -1;
	    	if (newChild == null || refNode == null) {
	    		// log??
	    	} else {
	    		var chn = this.childNodes,
	    			pos = $A.indexOf(chn, refNode);
	    		if (pos < 0) {
	    			// log???
	    		} 
	    	}
	    	return pos;
		},
		/**
		 * Prepares new child. 
		 */
	    _prep = function(newChild) {
			if (newChild.parentNode != null) {
				newChild.parentNode.removeChild(newChild);
			}
			newChild.parentNode = this;
	    };
	
	mstrmojo.mstr.WebNode = mstrmojo.declare(
			// super class
			mstrmojo.Obj,
			// mixin
			null,
			// properties
			{
				scriptClass: 'mstrmojo.mstr.WebNode',
			    /**
			     The expression type of the node, from {@link EnumDSSXMLExpressionType}.
			     */
				exprType: 0, // EnumDSSXMLExpressionType.DssXmlExpressionReserved
			    /**
			     * The node type of the current node.  This is set upon creation
			     * of the node, and cannot be changed. The value is from {@link EnumDSSXMLNodeType}.
			     */
			    nodeType: 0,	// EnumDSSXMLNodeType.DssXmlNodeReserved
			    /**
			     * The datatype of the current node. A value from {@link EnumDSSXMLDataType}, which will be used as the datatype
			     * of the current node.
			     */
			    dataType: -1 , // EnumDSSXMLDataType.DssXmlDataTypeUnknown
			    /**
			     * The dimensionality type of the current node, from {@link EnumDSSXMLNodeDimty}.
			     */
			    dimType: 1, // EnumDSSXMLNodeDimty.DssXmlNodeDimtyNone;
			    /**
			     * Child nodes collection.
			     */
			    childNodes: null,
			    /**
			     * The parent of the current node, or null if this is the root node.
			     */
			    parentNode: null,
			    /**
			     * Returns the number of child nodes of the current node.
			     * @return The number of child nodes, or 0 if none exist.
			     */
			    getChildCount: function getChildCount(){
			    	return this.childNodes && this.childNodes.length || 0;
			    },
			    /**
			     * Adds the given node to the current node's list of child nodes immediately before the reference node.
			     * @param newChild The node to be appended.
			     * @param refNode The node before which the new node is to be inserted.
			     */
			    insertBefore: function insertBefore(newChild, refNode) {
		    		var chn = this.childNodes,
	    				pos = _check.call(this, newChild, refNode);
			    	if ( pos < 0) {
			    		_prep.call(this, newChild);
			    		$A.insert(chn, pos, newChild);
			    	}
			    },

			    /**
			     * Adds the given node to the current node's list of child nodes immediately after the reference node.
			     * @param newChild The node to be appended.
			     * @param refNode The node after which the new node is to be inserted.
			     */
			    insertAfter: function insertAfter(newChild, refNode) {
		    		var chn = this.childNodes,
    					pos = _check.call(this, newChild, refNode);
			    	if ( pos < 0) {
			    		_prep.call(this, newChild);
			    		$A.insert(chn, pos + 1, newChild);
			    	}
			    },

			    /**
			     * Replaces the old node with the given new node in the expression.
			     * @param newChild The node to be used as the replacement.
			     * @param oldChild The node to be replaced.
			     */
			    replaceChild: function replaceChild(newChild, oldChild) {
		    		var chn = this.childNodes,
    					pos = _check.call(this, newChild, refNode);
			    	if ( pos < 0) {
			    		_prep.call(this, newChild);
			    		oldChild.parentNode = null;
			    		chn[pos] = newChild;
		    		}
			    },

			    /**
			     * Removes the given node from the collection of child nodes.
			     * @param childNode The {@link WebNode} object to be removed from the child collection.
			     */
			    removeChild: function removeChild(childNode) {
			    	childNode.parentNode = null;
			    	$A.removeItem(this.childNodes, childNode);
			    },
			    /**
			     * Appends the given node to the end of the current node's list of child nodes.  The node to be
			     * appended must be from the same expression as the node it is being appended to.
			     * @param newChild The node to be appended.
			     */
			    appendChild: function appendChild(newChild) {
			    	if (newChild) {
			    		_prep.call(this, newChild);
			    		if (!this.childNodes){
			    			this.childNodes = [];
			    		}
			    		this.childNodes.push(newChild);
			    	}
			    	
			    },
			    buildShortXML: function buildShortXML(builder) {
			    	builder.addChild('nd')
			    			.addAttribute('et', this.exprType)
			    			.addAttribute('nt', this.nodeType)
			    			.addAttribute('dmt', this.dimType)
			    			.addAttribute('ddt', this.dataType);
			    	// TODO dimty object
			    	var ch = this.childNodes;
			    	if (ch && ch.length) {
			    		for (var i = 0; i < ch.length; i ++) {
			    			ch[i].buildShortXML(builder);
			    		}
			    	}
			    	this.buildTypeSpecificShortXML(builder);
			    	builder.closeElement();
			    },
			    buildTypeSpecificShortXML: function buildTypeSpecificShortXML(builder) {
			    	// default implementation does nothing
			    }
			}			
	);
})();