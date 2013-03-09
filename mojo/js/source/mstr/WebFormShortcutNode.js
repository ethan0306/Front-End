/**
 * Model for Form Shortcut node in MSTR expression
 */
(function() {
	mstrmojo.requiresCls(
			"mstrmojo.mstr.EnumNodeType",
			"mstrmojo.mstr.WebNode"
			);
	var $N_T = mstrmojo.mstr.EnumNodeType;
	mstrmojo.mstr.WebFormShortcutNode = mstrmojo.declare(
			// super class
			mstrmojo.mstr.WebNode,
			// mixin
			null,
			// properties
			{
				scriptClass: 'mstrmojo.mstr.WebFormShortcutNode',
				nodeType: $N_T.NodeFormShortcut,
			    /**
			     * The attribute which the shortcut refers to.
			     */
			    attribute: null,
	
			    /**
			     * The attribute form which the shortcut refers to.
			     */
			    form: null,
			    buildTypeSpecificShortXML: function buildTypeSpecificShortXML(builder) {
			    	if (this.attribute) {
			    		this.attribute.buildShortObjectElt(builder);
			    	}
			    	if (this.form) {
			    		this.form.buildShortObjectElt(builder);
			    	}
			    }
			    
			}
		);
})();