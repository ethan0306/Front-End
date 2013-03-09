/**
 * Model for MSTR Attribute.
 * 
 * It extends from WebOI. It contains some specific information only relates to MSTR Attribute: 
 * form information and elements information.
 */
(function() {
    mstrmojo.requiresCls(
            "mstrmojo.mstr.WebOI",
            "mstrmojo.mstr.WebElements"
    );

	mstrmojo.mstr.WebAttribute = mstrmojo.declare(
			mstrmojo.mstr.WebOI,
			null,
			{
				scriptClass: 'mstrmojo.mstr.WebAttribute',
				t: 12,
				/**
				 * Total size of the elements for this attribute.
				 */
				elemTotalSize: 0,
				/**
				 * The config settings relate to element browsing.
				 * 
				 * It includes these properties:
				 * - blockBegin
				 * - blockCount
				 * - filter
				 * - dataSources
				 * - searchPattern
				 * - searchForm
				 * - matchCase
				 * - searchTarget
				 */
				browseConfig: null,
				init: function(props) {
					// parse fetchable properties
					var bc = this.browseConfig = {};
					if (props) {
						if(props.bb) {
							bc.blockBegin = props.bb;
							delete props.bb;
						}
						if (props.bc) {
							bc.blockCount = props.bc
							delete props.bc;
						}
						// ????
						if (props.sz) {
							this.totalSize = props.sz;
							delete props.sz;
						}
					}
					// init browseConfig
					this.browseConfig = {};
					
					// super
					if (this._super) {
						this._super(props);
					}
				},
				/**
				 * Returns the WebElements and configure it according to parameter config and the browseConfig on this object. 
				 * The input parameter config will be merged with browseConfig property of 
				 * this object before applying on browsing. But it will not affect
				 * browseConfig property. So, it only affects this one time browsing.
				 * 
				 * If you want to change browsing behavior for several browsing activities,
				 * it would be better to change the 'browseConfig' property on this object.
				 * 
				 * This function will return a WebElements already configured according to requirement.
				 * User can browse through all the elements through WebElements object.
				 * 
				 * Each time calling this method, this method will internally create one new instance of 
				 * WebElements and configure its browsing behavior.

				 * @param config The same information as browseConfig property.
				 */
				getElements: function(config){
					config = mstrmojo.hash.copy((this.browseConfig ||{}), (config || {}));
					
					return new mstrmojo.mstr.WebElements({
                    	source: this, 
                    	totalSize: this.totalSize || 0,
                    	browseConfig: config
                    });
				}
			}
			);
})();