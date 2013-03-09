/**
 * Model for Time node in MSTR expression
 */
(function() {
	mstrmojo.requiresCls(
			"mstrmojo.mstr.EnumNodeType",
			"mstrmojo.mstr.WebNode"
			);
	var $N_T = mstrmojo.mstr.EnumNodeType;
	mstrmojo.mstr.WebTimeNode = mstrmojo.declare(
			// super class
			mstrmojo.mstr.WebNode,
			// mixin
			null,
			// properties
			{
				scriptClass: 'mstrmojo.mstr.WebTimeNode',
				nodeType: $N_T.NodeTime,
				value: '',
			    /**
			     * The time value, which will be the node value of a time node.
			     */
				time: null,
			    buildTypeSpecificShortXML: function buildTypeSpecificShortXML(builder) {
			    	// TODO dynamic date
			        builder.addText(this.value);
			    }
				
			}
			);
})();