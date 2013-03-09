/**
 * Model for Time node in MSTR expression
 */
(function() {
	mstrmojo.requiresCls(
			"mstrmojo.mstr.EnumDataType",
			"mstrmojo.mstr.EnumNodeType",
			"mstrmojo.mstr.WebNode"
			);
	var $N_T = mstrmojo.mstr.EnumNodeType,
		$D_T = mstrmojo.mstr.EnumDataType;
	mstrmojo.mstr.WebConstantNode = mstrmojo.declare(
			// super class
			mstrmojo.mstr.WebNode,
			// mixin
			null,
			// properties
			{
				scriptClass: 'mstrmojo.mstr.WebTimeNode',
				nodeType: $N_T.NodeConstant,
				value: '',
				type: $D_T.DataTypeUnknown,
			    buildTypeSpecificShortXML: function buildTypeSpecificShortXML(builder) {
			        builder.addChild("cst")
			        		.addAttribute("ddt", this.type)
			        		.addText(this.value)
			        		.closeElement();
			    }
			}
			);
})();