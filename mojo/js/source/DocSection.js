(function(){

	mstrmojo.requiresCls(
		"mstrmojo.Container",
		"mstrmojo.HBox",
		"mstrmojo._HasBuilder",
		"mstrmojo._CanMeasureChildren");
	
	/**
	 * Private mixin to shared rendering code among the mstrmojo.DocSection and mstrmojo.DocSectionHoriz.
	 * 
	 * @private
	 */
	var _IsDocSection = {
        
		postBuildRendering: function postBldRndr() {
			return (this.renderMode != 'scroll') ? this._super() : true;
		},

		childRenderOnAddCheck: function(children) {
			return (this.renderMode != 'scroll') ? this._super(children) : false;
		},

		preserveChildDomOrder: false
	};

	/**
	 * Document Section.
	 * @class
	 * 
	 * @extends mstrmojo.Container
	 * 
     * @borrows mstrmojo._HasBuilder#postBuildRendering as #postBuildRendering
     * @borrows mstrmojo._HasBuilder#buildChildren as #buildChildren
     * 
     * @borrows mstrmojo._CanMeasureChildren#height as #height
     * @borrows mstrmojo._CanMeasureChildren#width as #width
	 */
	mstrmojo.DocSection = mstrmojo.declare(
		// superclass
		mstrmojo.Container,
		
		// mixins,
        [ mstrmojo._HasBuilder, _IsDocSection, mstrmojo._CanMeasureChildren ],
		
		/**
		 * @lends mstrmojo.DocSection.prototype
		 */
		{
			scriptClass: "mstrmojo.DocSection",
			
			markupString: '<div id="{@id}" class="mstrmojo-DocSection"></div>',

			markupSlots: {
				containerNode: function() { return this.domNode; }
			},
            
			/**
			 * Overrides borrowed width (from {@link mstrmojo._CanMeasureChildren}) so that we only measure the width of the first subsection.
			 * 
			 * @ignore
			 */
			width: function width(count) {
				return this._super(1);
			}
			
		}
	);
	
	
	/**
	 * A Document Section for horizontally repeating data.
	 * @class
	 * 
	 * @extends mstrmojo.HBox
	 * 
     * @borrows mstrmojo._HasBuilder#postBuildRendering as #postBuildRendering
     * @borrows mstrmojo._HasBuilder#buildChildren as #buildChildren
     * 
     * @borrows mstrmojo._CanMeasureChildren#height as #height
     * @borrows mstrmojo._CanMeasureChildren#width as #width
	 */
	mstrmojo.DocSectionHoriz = mstrmojo.declare(
		// superclass
		mstrmojo.HBox,
		
		// mixins,
		[ mstrmojo._HasBuilder, _IsDocSection, mstrmojo._CanMeasureChildren ],
		
		/**
		 * @lends mstrmojo.DocSectionHoriz.prototype
		 */
		{
			scriptClass: "mstrmojo.DocSectionHoriz",
			
			/**
			 * Overrides borrowed height (from {@link mstrmojo._CanMeasureChildren}) so that we only measure the height of the first subsection.
			 * 
			 * @ignore
			 */
			height: function height(count) {
				return this._super(1);
			}
		}
	);	
	
})();