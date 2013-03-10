(function(){
   
	mstrmojo.requiresCls(
		"mstrmojo.Table",
		"mstrmojo.Pulldown"
        );
	
	function updateContents(setting){
		setting.tbl.lbl.set("text", setting.caption);
		
		setting.tbl.list.set("itemIdField", setting.itemIdField);
		setting.tbl.list.set("itemField", setting.itemField);

	}
	
    	/**
	* <p>
	* Widget that represents a db role combo setting
	* </p>
	* 
	* @class
	* @extends mstrmojo.Box
	*/
	mstrmojo.WH.DBRoleSettingPulldown = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins
    		null,
    		
    		{
    			/**
			* @Class name
			*/
    			scriptClass: "mstrmojo.WH.DBRoleSettingPulldown",
    			cssText: "width: 100%;",
    			
    			postBuildRendering: function(){
    				if(this._super) {this._super();} 
    				updateContents(this);
    			},
    			
    			caption: "",
    			contains: function(evt){
    				var idx = mstrmojo.array.find(this.items, this.itemIdField, evt);
    				return (idx > 0);
    			},
    			
    			itemIdField: "",
    			itemField: "n",
    			items: null,
    			onitemsChange: function(evt){this.tbl.list.set("items", this.items); },
    			selectedID:"",
    			onselectedIDChange: function(evt){ this.tbl.list.set("value", this.selectedID); },
    			selectedItem: null,

    			onChange: null,

    			children:[{	scriptClass: "mstrmojo.Table",
					rows: 1,
					cols: 2,
					alias: "tbl",
					cssText: "width:100%;",
					layout: [{cells: [{cssText: "width: 20%; text-align:right;"}, {cssText: "width:80%;"}]}],

					children:[
						  {	scriptClass: "mstrmojo.Label",
							alias: "lbl",
							text: "this.parent.caption",
							slot:"0,0"
						  },
						  {
							scriptClass: "mstrmojo.Pulldown",
							popupCssClass:"mstrmojo-qb-ScrollingPulldown",
							cssText: "width: 95%;",
							slot:"0,1",
						    alias: "list",
						    items: [{}],
						    onvalueChange : function(evt){
							  	this.parent.parent.set("selectedItem", this.selectedItem);
							  	if (this.parent.parent.onChange) { this.parent.parent.onChange(evt); }
							}
						  }]
    			}]
    		}
	);
})();