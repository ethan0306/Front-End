/**
 * Model for MSTR filter.
 */
(function() {
    mstrmojo.requiresCls(
            "mstrmojo.mstr.WebOI"
    );
	mstrmojo.mstr.WebFilter = mstrmojo.declare(
			// super class
			mstrmojo.mstr.WebOI,
			// mixin
			null,
			// properties
			{
				scriptClass: 'mstrmojo.mstr.WebFilter',
				t: 1,
				/**
				 * Expression of this filer. 
				 * {@type} mstrmojo.mstr.WebExpression
				 */
				expression: null,
				buildTypeSpecificShortXML: function buildTypeSpecificShortXML(builder) {
					if (this.expression) {
						this.expression.buildShortXML(builder);
					}
				}
			}
		);
	
})();