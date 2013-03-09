(function(){

	mstrmojo.requiresCls("mstrmojo.css", "mstrmojo._HasBuilder");
	
	mstrmojo.ToolBar = mstrmojo.declare(
		// superclass
		mstrmojo.HBox,
		// mixins
		[mstrmojo._HasBuilder],
		// instance members
		{
			scriptClass: "mstrmojo.ToolBar",
			
			cellCssClass: "mstrmojo-ToolBar-cell",

			markupString: '<table id="{@id}" class="mstrmojo-ToolBar {@cssClass}" style="{@cssText}" cellspacing="0" cellpadding="0"><tr><td class="mstrmojo-ToolBar-outercell">' +
						      '<table class="mstrmojo-ToolBar-innertable" cellspacing="0" cellpadding="0"><tr>{@tableHtml}</tr></table>' +
						  '</td></tr></table>',
									
			markupSlots: {
				containerNode: function(){ return this.domNode.rows[0].cells[0].firstChild.rows[0]; }
			},
			
			markupMethods: {
				onvisibleChange: function(){ this.domNode.style.display = this.visible ? mstrmojo.css.DISPLAY_TABLE : 'none'; }
			},
			
			/**
			 * Extends the inherited method in order to initialize the "buildConfig" property,
			 * which is used by the _HasBuilder mixin.
			 */
			buildChildren: function bldChd(){
				var cfg = this.buildConfig;
				if (!cfg) {
					this.buildConfig = {};
					cfg = this.buildConfig;
				}
				cfg.target = this.target;
				
				return this._super();
			}
		}
	);

})();