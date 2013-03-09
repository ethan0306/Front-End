(function () {
           
    mstrmojo.requiresCls(
            "mstrmojo.HTMLButton",
            "mstrmojo.HBox",        
            "mstrmojo.Label",
            "mstrmojo.Table",
            "mstrmojo.Editor",
            "mstrmojo.QB.DBRoleSetting",
            "mstrmojo.QB.DBRoleDSNConnection",
            "mstrmojo.QB.DBRoleSettingPulldown"
            );

    mstrmojo.requiresDescs(221, 1162, 1442, 1834, 8512, 8513, 8514); 
    
    
	function trim(st) {
	    var str=new String("");
	    str=st.toString();	
		if (!str) return "";
	    
	    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
	
    function validate(dbe){
    	
    	if (trim(dbe.txtname.text) == ""){
			mstrmojo.alert("name can't be empty");
			return false;
		}
		
		if (trim(dbe.txtlogin.text) == ""){
			mstrmojo.alert("login can't be empty");
			return false;
		}
		
		if  (dbe.dsninfo.selectlist.selectedID===0) {  //we use existing dsn
			var sdsn=dbe.dsninfo.tbl.contents.dsnlist.selectedItem;  //variable declared here because only in this case dsnlist exists
			if (!sdsn) { 
				mstrmojo.alert("Please select a dsn first");
				return false;
			}	
			if (sdsn.des=="0") { 
				mstrmojo.alert("Please select a dsn first");
				return false;
			}	
		}	
		
		//still here? we are good to go
		return true;
	};
	
    function addContents(dbe){
		var mdl = mstrmojo.all.QBuilderModel;
		dbe.dbmslist.set("items", mdl.dbms);
	};
	
	function RestrictDBType(dbe, dbtype){
		var mdl = mstrmojo.all.QBuilderModel;
		var alldbms = mdl.dbms;
		var sdb = dbe.dsninfo.SupportedDBTypes;
		
		dbe.dbmslist.set("items", null);
		
		if (dbtype == sdb.SupportedDBTypesUndefined){
			var mdbms=new Array();
			for(var i=0,j=0; i<alldbms.length; i++) {
		        if(alldbms[i].did != "F10446E31B03410E912FB029F19B3799") {//remove hive thrift
		        	mdbms[j]=alldbms[i];
		        	j++;
		        }
		    }
			dbe.dbmslist.set("items", mdbms);
			dbe.dbmslist.set("selectedID", mdbms[0].did);
		}
		
		else {
			var dbmsbytype = new Array();
			var index = 0;
			var dbv = dbe.dsninfo.DatabaseVersions;
						
			for (var i = 0; i < alldbms.length; i++){
				var dbms = alldbms[i];
				switch(dbtype){
                    case sdb.SupportedDBTypesDB2iSeries:
                        switch(dbms.db_ver)
                        {
                            case dbv.DatabaseVersionDBIBMDB2400V5R1:
                            case dbv.DatabaseVersionDBIBMDB2400V5R2:
                            case dbv.DatabaseVersionDBIBMDB2400V5R4:
                            case dbv.DatabaseVersionDBIBMDB2400V6R1:
                            case 134:
                            	dbmsbytype[index++] = dbms;
                        }
                        break;
                    case sdb.SupportedDBTypesDB2Wire:
                        switch(dbms.db_ver)
                        {
                            case dbv.DatabaseVersionDBIBMUDB7:
                            case dbv.DatabaseVersionDBIBMUDB8:
                            case dbv.DatabaseVersionDBIBMUDB91:
                            case dbv.DatabaseVersionDBIBMUDB95:
                            case dbv.DatabaseVersionDBIBMUDB97:
                                dbmsbytype[index++] = dbms;
                        }
                        break;
                    case sdb.SupportedDBTypesDB2ZOS:
                        switch(dbms.db_ver)
                        {
                            case dbv.DatabaseVersionDBIBMDB2OS3907:
                            case dbv.DatabaseVersionDBIBMDB2OS3908:
                            case dbv.DatabaseVersionDBIBMUDB91zOS:                            
                                dbmsbytype[index++] = dbms;
                        }
                        break;
                    case sdb.SupportedDBTypesPostgreSQL:
                        switch(dbms.db_ver)
                        {
                            case dbv.DatabaseVersionDBPostgreSQL81:   
                            case dbv.DatabaseVersionDBPostgreSQL82:
                            case dbv.DatabaseVersionDBPostgreSQL83:
                            case dbv.DatabaseVersionDBPostgreSQL84:
                                dbmsbytype[index++] = dbms;
                        }
                       break;
                    case sdb.SupportedDBTypesGreenPlum:
                        switch(dbms.db_ver)
                        {
                            case dbv.DatabaseVersionDBGreenplum3x:
                            case 141:
                                dbmsbytype[index++] = dbms;
                        }
                        break;
                    case sdb.SupportedDBTypesMySQL:
                        switch(dbms.db_ver)
                            {
                                case dbv.DatabaseVersionDBMySQL50:
                                case dbv.DatabaseVersionDBMySQL51:
                                    dbmsbytype[index++] = dbms;
                            }
                        break;
                    case sdb.SupportedDBTypesSybaseASE:
                        switch(dbms.db_ver)
                            {
                                case dbv.DatabaseVersionDBSybaseASE15:
                                case dbv.DatabaseVersionDBSybaseAdaptive115:
                                case dbv.DatabaseVersionDBSybaseAdaptive12:
                                case dbv.DatabaseVersionDBSybaseAdaptive125:
                                    dbmsbytype[index++] = dbms;
                            }
                           break;
                    case sdb.SupportedDBTypesSybaseIQ:
                        switch(dbms.db_ver)
                            {
                                case dbv.DatabaseVersionDBSybaseIQ112:
                                case dbv.DatabaseVersionDBSybaseIQ12:
                                case dbv.DatabaseVersionDBSybaseIQ127:
                                case dbv.DatabaseVersionDBSybaseIQ15:
                                case dbv.DatabaseVersionDBSybaseIQ151:
                                case dbv.DatabaseVersionDBSybaseIQ152:
                                    dbmsbytype[index++] = dbms;
                            }
                         break;
                    case sdb.SupportedDBTypesInformixWire:
                        switch(dbms.db_ver)
                            {
                                case dbv.DatabaseVersionDBInformix10:
                                case dbv.DatabaseVersionDBInformixIDS10:
                                case dbv.DatabaseVersionDBInformixIDS11:
                                case dbv.DatabaseVersionDBInformixIDS115:
                                case dbv.DatabaseVersionDBInformixIDS93:
                                case dbv.DatabaseVersionDBInformixIDS94:
                                case dbv.DatabaseVersionDBInformixODS724UC1:
                                case dbv.DatabaseVersionDBInformixODS731:
                                case dbv.DatabaseVersionDBInformixUDO92:
                                    dbmsbytype[index++] = dbms;
                            }
                         break;
                    case sdb.SupportedDBTypesInformixXPS:
                        switch(dbms.db_ver)
                            {  
                                case dbv.DatabaseVersionDBInformixXPS82:
                                case dbv.DatabaseVersionDBInformixXPS83:
                                    dbmsbytype[index++] = dbms;
                            }
                         break;
                    case sdb.SupportedDBTypesSQLServer:
                        switch(dbms.db_ver)
                            {  
                                case dbv.DatabaseVersionDBSQLServer2000:
                                case dbv.DatabaseVersionDBSQLServer2005:
                                case dbv.DatabaseVersionDBSQLServer2008:
                                case dbv.DatabaseVersionDBSQLServer65:
                                case dbv.DatabaseVersionDBSQLServer70:
                                    dbmsbytype[index++] = dbms;
                            }
                         break;
                    case sdb.SupportedDBTypesXQuery:
                        switch(dbms.db_ver)
                            {  
                                case dbv.DatabaseVersionDBXQuery:
                                    dbmsbytype[index++] = dbms;
                            }
                         break;
                    case sdb.SupportedDBTypesHive:
                        switch(dbms.db_ver)
                        {
                            case dbv.DatabaseVersionDBHive05:
                            case dbv.DatabaseVersionDBHive06:
                            case dbv.DatabaseVersionDBHive07:
                            	 dbmsbytype[index++] = dbms;
                            	 break;
                            case dbv.DatabaseVersionDBHiveThrift:
                            	 if (!(dbe.dsninfo.selectlist.selectedID===0)){
                            	 dbmsbytype[index++] = dbms;
                            	 break;
                            	 }
                        }
                        break;
                    default:
                    	if (dbms.db_type == dbe.dsninfo.supportedToType(dbtype)){
                    		dbmsbytype[index++] = dbms;
                    	}
                        break;
                }
				
			}
			dbe.dbmslist.set("items", dbmsbytype);
			dbe.dbmslist.set("selectedID", dbmsbytype[0].did);
		}		
	}
	
	function populate(dbe){
		var dbr = dbe.dbrole;
		
		dbe.dbmslist.set("selectedID", dbr.dbms);
		
		//get the info and fill the boxes
		dbe.txtlogin.set("text", dbr.ln);
		dbe.txtpwd.set("text", dbr.password);
		dbe.txtname.set("text", dbr.n);
		
		//dsn info
		dbe.dsninfo.set("info", dbr);
		dbe.dbmslist.set("selectedID", dbr.dbms);

	}
	
	function getDBInfo(dbe, dbr){
		
		var dbms = dbe.dbmslist.selectedItem;
    	
    	//populate the dbr object, and all its properties will become part of the xml
    	dbr.n = dbe.txtname.text;
    	dbr.dbms = dbms.did;
    	
    	dbr.owned = "1";
    	dbr.writable= "1";
    	dbr.shared= "1";
    	
    	dbr.db_type = dbe.dsninfo.dbtype();
    	dbr.connstr = dbe.dsninfo.connstr();
    	
    	dbr.ln = dbe.txtlogin.text;
    	dbr.password = dbe.txtpwd.text;
    	
    	switch (dbr.db_ver){
    		case dbe.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ112:
    		case dbe.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ12:
    		case dbe.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ127:
    		case dbe.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ15:
    		case dbe.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ151:
    		case dbe.dsninfo.DatabaseVersions.DatabaseVersionDBSybaseIQ152:
    			dbr.cefu = "0";
    			break
    		default:
    			dbr.cefu = "1";
    			break;
    	}
    	
    	if (dbr.db_type == dbe.dsninfo.DatabaseTypes.DatabaseTypeHive){dbr.odbcv="20";}
	}

	
    function apply(dbe){

    	var dbr = dbe.dbrole;

    	getDBInfo(dbe, dbr);

    	var params = {
                    taskId: 'arch.saveDBRole',
                    sessionState: dbe.sessionState,
                    dbroleinfo: JSON.stringify(dbr)
            		 };
    	
        mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, {
        	success: function(res) {
                //mstrmojo.alert(mstrmojo.desc(3336,'## has been saved successfully.').replace("##", res.n)) ;
        		dbe.close();
	        },
            failure: function(res) {
                mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                dbe.close();                    
            }
        }, params);
    }
    
    mstrmojo.QB.DBRoleEditor = mstrmojo.declare(
        // superclass
        mstrmojo.Editor,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.QB.DBRoleEditor",
            
            zIndex: 100,
            
            id: "",
            
            dbrole: null,
            
            sessionState: null,
            
            callback: null,
            
            postBuildRendering: function() {
        		if(this._super) {this._super();}
        		addContents(this);
        	},
        	ondragend: function ondragmove(ctxt){
        		var w =parseInt(mstrmojo.all.QBuilderPage.width) - parseInt(ctxt.src.node.clientWidth);
        		var y= parseInt(mstrmojo.all.QBuilderPage.height) - parseInt(ctxt.src.node.clientHeight);
        		var wy=ctxt.tgt.pos.y;
        		var wx=ctxt.tgt.pos.x;
        		if (wy<1) {this.editorNode.style.top="1px";}
        		if (wx<1) {this.editorNode.style.left="1px";}
        		if (wy>y ) {this.editorNode.style.top=y + "px";}
        		if (wx>w ) {this.editorNode.style.left=w + "px";}
        		},
        	onOpen: function(){populate(this);},
        	
        	onOK: function() {
            	if (validate(this)) {
            		apply(this);
        		
            		this.callback.success(this.id);
            		return true;
            	}
            	else{
            		return false;
            	}
            		
        	},
        	
        	onCancel: function() {
        		this.callback.cancel(null);
        	},
        	
        	children: [ {//Connection Label
							scriptClass:"mstrmojo.Label",
							cssText: "font-weight:bold; width:100%; padding: 5px;",
							alias: "conninfo",
							text: mstrmojo.desc(1834, "connection information")
						},
						
						{//widget that decodes and displays the dsn info
							scriptClass:"mstrmojo.QB.DBRoleDSNConnection",
							onDSNChange: function(evt){ RestrictDBType(this.parent, evt); },
							onConnectionChange: function(evt){RestrictDBType(this.parent, evt); },
							alias: "dsninfo"								
						},
						
						{//dbms list	
							scriptClass: "mstrmojo.QB.DBRoleSettingPulldown",
				        	alias: "dbmslist",
				        	itemIdField: 'did',
			        	    caption: mstrmojo.desc(8512, "dbms:")
						},
						
						{//login	
							scriptClass: "mstrmojo.QB.DBRoleSetting",
				        	   	alias: "txtlogin",
				        	   	caption: mstrmojo.desc(8513, "login:")
						},
						
						{//pwd	
							scriptClass: "mstrmojo.QB.Password",
				        	   	alias: "txtpwd",
				        	   	caption: mstrmojo.desc(1162, "password:"),
				        	   	isPassword: true
						},
						
						{//Name label
							scriptClass:"mstrmojo.Label",
							cssText: "font-weight:bold; width:100%; padding: 5px;",
							alias: "nameinfo",
							text: mstrmojo.desc(8514, "name the connection")
						},
						
						{//	DB role name
							scriptClass: "mstrmojo.QB.DBRoleSetting",
				        	   	alias: "txtname",
				        	   	caption: ""
						},
			                
							{ // buttons
								scriptClass : 'mstrmojo.HBox',
								cssClass : 'mstrmojo-Editor-buttonBox',
								slot : 'buttonNode',
								children : [ 
								{//OK
									scriptClass : "mstrmojo.HTMLButton",
									cssClass : "mstrmojo-Editor-button rightfloat",//force the float right css asit seems new behavior defaults to left
									text : mstrmojo.desc(1442, "OK"),
									onclick : function(evt) {
										var e = this.parent.parent;
										var ret = true;;
										
										if (e.onOK) { ret = e.onOK(); }
										if (ret) { e.close();}
									}
								}, 
								{// cancel
									scriptClass : "mstrmojo.HTMLButton",
									cssClass : "mstrmojo-Editor-button",
									text : mstrmojo.desc(221, "Cancel"),
									onclick : function(evt) {
										var e = this.parent.parent;
										if (e.onCancel) { e.onCancel(); }
										e.close();
									}
								}
							]}
			]
        });
})();