(function(){
   
	mstrmojo.requiresCls(
		"mstrmojo.Table",
		"mstrmojo.CheckBox"
	);

	function updateContents(setting){

		var c = {
			    scriptClass:"mstrmojo.CheckBox",
				label: setting.caption,
				alias: 'check',
				oncheckedChange : function(evt){setting.set("checked",evt.value);},
				slot:"0,1"
			};
		
		setting.tbl.addChildren([c]);
	}
	
	/**
	 * <p>
	 * Widget that represents a db role checkbox setting
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Box
	 */
	mstrmojo.WH.DBRoleSettingCheckbox = mstrmojo.declare(
		// superclass
		mstrmojo.Box,

		// mixins
		null,

		{
			/**
			* @Class name
			*/
			scriptClass: "mstrmojo.WH.DBRoleSettingCheckbox",
			cssText: "width: 100%;",

			postBuildRendering: function(){
				if(this._super) {this._super();} 
				updateContents(this);
			},
			caption: "",
			checked: false,
			oncheckedChange: function(evt){this.tbl.check.set("checked", evt.value); },

			children:[{	scriptClass: "mstrmojo.Table",
					rows: 1,
					cols: 2,
					alias: "tbl",
					cssText: "width:100%;",
					layout: [{cells: [{cssText: "width: 20%; text-align:right;"}, {cssText: "width:80%;"}]}],

					children:[
						  {	scriptClass: "mstrmojo.Label",
							alias: "lbl",
							text: "",
							slot:"0,0"
						  }]
			}]
		}
	);
})();