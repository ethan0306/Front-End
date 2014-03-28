(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.QB.DBRoleDSNConnection"
            );
	
	function trim(str) {
	    if (!str) return "";
	    
	    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
	
	function updateContents(setting){
		
	}
	
    /**
	 * <p>
	 * Widget that represents the general info of a db role
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Box
	 */
    mstrmojo.QB.DBRoleGeneralTab = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins
    		null,
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.QB.DBRoleGeneralTab",
    			
    			markupString: 	'<div id="{@id}" class="mstrmojo-Box {@cssClass}" style="{@cssText}" mstrAttach:click>' +
    							'</div>',
	        	
				postBuildRendering: function(){
					if(this._super) {this._super();} 
					updateContents(this);
				},
				
				children: [{	scriptClass: "mstrmojo.Table",
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
							}]
		          }], 
				    			
           		///**
				// * populate the info
				// */
	     		populate: function p(dbr){
    			    				
    			},
    			
    			validate: function v(){
    				if (trim(this.txtname.text) == ""){
    					mstrmojo.alert("name can't be empty");
    					return false;
    				}
    				
    				if (trim(this.txtlogin.text) == ""){
    					mstrmojo.alert("login can't be empty");
    					return false;
    				}
    				
    				//still here? we are good to go
    				return true;
    			},
    			
    			apply: function a(dbr){
    				
    				var dbms = this.dbmslist.selectedItem();
			    	
			    	//populate the dbr object, and all its properties will become part of the xml
			    	dbr.n = this.txtname.changedText();
			    	//dbrole id should be either empty or already populated
			    	//"did=" 
			    	dbr.dbms = dbms.did;
			    	
			    	dbr.owned = "1";
			    	dbr.writable= "1";
			    	dbr.shared= "1";
			    	
			    	dbr.db_type = this.dsninfo.dbtype();
			    	dbr.connstr = this.dsninfo.connstr();
			    	
			    	dbr.ln = this.txtlogin.changedText();
			    	dbr.password = this.txtpwd.changedText();
			    	
			    	switch (dbr.db_ver){
			    		case this.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ112:
			    		case this.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ12:
			    		case this.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ127:
			    		case this.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ15:
			    		case this.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ151:
			    		case this.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ152:
			    			dbr.cefu = "0";
			    			break
			    		default:
			    			dbr.cefu = "1";
			    			break;
			    	}
			    	
			    	if (dbr.db_type == this.dsninfo.DatabaseTypes.DatabaseTypeHive){dbr.odbcv="20";}
    			}
    		}	    
	    );
})();