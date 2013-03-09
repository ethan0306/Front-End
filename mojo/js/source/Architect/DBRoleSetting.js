(function(){
   
	mstrmojo.requiresCls(
			"mstrmojo.Table",
			"mstrmojo.Pulldown",
            "mstrmojo.Box"
            );
	
	function addContents(setting){
		
		var tbl = new mstrmojo.Table({
			rows: 1,
	        cols: 2,
	        alias: "tbl",
	        cssText: "width:100%;",
	        layout: [{cells: [{cssText: "width: 20%; text-align:right;"}, {cssText: "width:80%;"}]}]
			});
		
		var l = new mstrmojo.Label({
			text: setting.caption,
			slot:"0,0"
		});
		
		var c;
		switch (setting.settingtype){
			case "combo":
				c = new mstrmojo.Pulldown({
					cssClass: "mstrmojo-ScrollingPulldown mstrmojo-Pulldown",
	        	   	cssText: "width: 95%;",
	        	   	slot:"0,1",
	        	    alias: "list",
	        	    itemIdField: setting.itemIdField,
	        	    itemField: setting.itemField,
	        	    items: null,
	        	    onvalueChange : function(evt){
						if (setting.onChange) { setting.onChange(evt); } 
						}
				});
				break;
				
			case "text": 
				c = new mstrmojo.TextBox({
					text: setting.caption,
					alias: "txt",
					cssText: "margin-left:5px; width: 90%;",
					onvalueChange: function(evt){setting.text = evt.value;},
					slot:"0,1"
				});
			
				if (setting.isPassword) { c.type = "password";}
				break;
				
			case "number": 
				c = new mstrmojo.TextBox({
					text: setting.caption,
					alias: "nmbr",
					cssText: "margin-left:5px; width: 90%;",
					onvalueChange: function(evt){setting.text = evt.value;},
					slot:"0,1"
				});
			
				if (setting.isPassword) { c.type = "password";}
				break;
				
			case "bool":
				l.set("text", "");
				
				c = new mstrmojo.CheckBox({
					label: setting.caption,
					slot:"0,1"
				});
				break;
		}
		
		tbl.addChildren([l, c]);
		
		if (!setting.tbl) { setting.addChildren([tbl]); }
		           
	}
	
    /**
	 * <p>
	 * Widget that represents a db role setting
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Box
	 */
    mstrmojo.DBRoleSetting = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins
    		null,
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.DBRoleSetting",
    			cssText: "width: 100%;",
    			
    			settingtype: "text",
    			
    			caption: "",
    			
    			content: null,
    		
    			//for text type
				text: "",
				ontextChange: function(evt){
    				this.update();
    				if (this.settingtype == "text") {
    					this.tbl.txt.set("value", this.text);
    				}
    				else {
    					this.tbl.nmbr.set("value", this.text);
    				}
    			},
    			
    			changedText: function() {
    				if (this.settingtype == "text") {
    					return this.tbl.txt.value;
    				}
    				else {
    					return this.tbl.nmbr.value;
    				}
    			},
				
    			isPassword: false,
    			
				//for combo type
				itemIdField: "",
				itemField: "n",
				items: null,
    			onitemsChange: function(evt){this.update(); this.tbl.list.set("items", this.items); },
				selectedID:"",
				onselectedIDChange: function(evt){ this.tbl.list.set("value", this.selectedID); },
				selectedItem: function(){ return this.tbl.list.selectedItem;},
				
				onChange: null,
				
				children:[],
				
				update: function() {addContents(this);}
				          
    		}
	    );
})();