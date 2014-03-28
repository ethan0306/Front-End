(function(){
   
	mstrmojo.requiresCls(
			"mstrmojo.Table",
			"mstrmojo.Label",
			"mstrmojo.TextBox",
            "mstrmojo.Box"
            );
	
	function updateContents(setting){
		setting.tbl.lbl.set("text", setting.caption);
		
		if (setting.isPassword) { setting.tbl.txt.type = "password";}
	}
	
    /**
	 * <p>
	 * Widget that represents a db role setting
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Box
	 */
	mstrmojo.QB.DBRoleSetting = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins
    		null,
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.QB.DBRoleSetting",
    			cssText: "width: 100%;",
    			
    			settingtype: "text",
    			postBuildRendering: function(){
    				if(this._super) {this._super();} 
    				updateContents(this);
    			},
    			caption: "",
    			
    			//for text type
				text: "",
				ontextChange: function(evt){this.tbl.txt.set("value", this.text);},
    			
    			isPassword: false,
    			isNumeric: false,
    			
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
				        	          { scriptClass: "mstrmojo.TextBox",
				      					alias: "txt",
				      					cssText: "margin-left:5px; width: 90%;",
				      					onvalueChange: function(evt){
				        	        	  this.parent.parent.text = evt.value;
				        	        	  },
				      					slot:"0,1"
				        	          }]
						}]
    		}
	    );
})();