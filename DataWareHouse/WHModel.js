(function(){

    mstrmojo.requiresCls(
        "mstrmojo.func",
        "mstrmojo.string"
    );
    
	var _waitBox = new mstrmojo.Editor({
		cssClass: "mstrmojo-Architect-WaitBox",
		draggable: false,
		showTitle: false,
		zIndex: 99999,
		// We use this var to control the close of waitpage. If there is still other proccess waiting, _hideWaitPage will not close the waitpage.
		counter:0,
		children: [{
			scriptClass:"mstrmojo.Box",
			width:"300px",
			height:"60px",
		    cssClass: "mstrmojo-Architect-Wait"
		       }],
		onRender: function (evt) {
		  if (this.curtainNode) {
 		        var st= this.curtainNode.style;
	                st.background="black";
	                st.opacity=0.5; 
	                st.filter="alpha(opacity=50)"; //for IE 8
 		    	    st.cursor = "progress";   //set cursor shape on the curtain	
 		    }		
   	    }
    });
    
  
    function _showWaitPage() {
    	if (!_waitBox.visible) {
    	    _waitBox.open();
    	}    
    	_waitBox.counter++;
    };
    
    function _hideWaitPage() {
    	_waitBox.counter--;
    	if (_waitBox.counter===0&&_waitBox.visible) {
    	    _waitBox.close();
    	}
    };
    
	function loadDSNs(mdl, callback){
		if (mdl.dsns.length == 0){
    		//populate the dsns
			var dsnparams = {taskId:'arch.getODBCDSNs'};
			
			var dsncb = {
				success: function(res){ 
					_hideWaitPage();
					
					//add an entry to select the existing one
					var a = new Array(res.dsns.dsn.length + 1); 
					a[0] = {n:'select a dsn', des:0};
					
					//copy all the supported ones
					for (var i=0, len=res.dsns.dsn.length; i<len; i++)
	        		{
	        			a[i+1]= res.dsns.dsn[i];
	        		}
					
					mdl.set("dsns", a); 
					if (callback){callback();}
				},
				failure: function(res){ _hideWaitPage(); mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
			};
			
			_showWaitPage();
			if (mstrApp.sessionState !== undefined){ dsnparams.sessionState = mstrApp.sessionState; }
			mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, dsncb, dsnparams);
   		}
		else{
			if (callback){callback();}
		}
	};

	function loadSuppDBs(mdl, callback){
   		if (mdl.suppdbs.length == 0){
			//populate the supported dbs
			var suppdbparams = {taskId:'arch.readFileContents', fileNumber:'1'};
			
			var suppdbcb = {
				success: function(res){				
				    _hideWaitPage();
					//add an entry to select the existing one
					var a = new Array(res.DBS.DB.length + 1); 
					a[0] = {n:'existing dsn', captionIDS:'1', id:0};
				
					//copy all the supported ones
					for (var i=0, len=res.DBS.DB.length; i<len ; i++)
	        		{
	        			a[i+1]= res.DBS.DB[i];
	        		}
					
					mdl.set("suppdbs", a); 
					
					loadDrivers(mdl, callback);
				},
				failure: function(res){ _hideWaitPage(); mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
			};		
			_showWaitPage();
			mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, suppdbcb, suppdbparams);
   		}
   		else{
   			loadDrivers(mdl, callback);
   		}
	};
			
	function loadDrivers(mdl, callback){
   		if (mdl.drivers.length == 0){ 
       		//populate the dbms
			var driversparams = {taskId:'arch.getODBCDrivers'};
			
			var driverscb = {
				success: function(res){ _hideWaitPage(); mdl.set("drivers", res.odns.name); loadDSNs(mdl, callback);},
				failure: function(res){ _hideWaitPage(); mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
			};
			
			_showWaitPage();
			if (mstrApp.sessionState !== undefined){ driversparams.sessionState = mstrApp.sessionState; }
			mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, driverscb, driversparams);
   		}
   		else{
   			loadDSNs(mdl, callback);
   		}
   	};
   	
   	function loadDBMSObjects(mdl, callback){
   		if (mdl.dbms.length == 0){ 
       		//populate the dbms
			var dbmsparams = {taskId:'arch.getDBMSObjects'};
			
			var dbmscb = {
				success: function(res){ _hideWaitPage(); mdl.set("dbms", res.dbmss.dbms); loadSuppDBs(mdl, callback);},
				failure: function(res){ _hideWaitPage(); mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
			};
			
			_showWaitPage();
			if (mstrApp.sessionState !== undefined){ dbmsparams.sessionState = mstrApp.sessionState; }
			mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, dbmscb, dbmsparams);
   		}
   		else{
   			loadSuppDBs(mdl, callback);
   		}
   	};

    var EnumDSSBaseFormType = {
    	DssBaseFormDateTime    : 1,
    	DssBaseFormNumber      : 2,
    	DssBaseFormText        : 3,
    	DssBaseFormPicture     : 4,
    	DssBaseFormUrl         : 5,
    	DssBaseFormEmail       : 6,
    	DssBaseFormHTMLTag     : 7,
    	DssBaseFormDate        : 8,
    	DssBaseFormTime        : 9,
    	DssBaseFormSymbol      : 10,
    	DssBaseFormBigDecimal  : 11,
    	DssBaseFormPhoneNumber : 12        
    };
    
    var EnumDssDataType = {
    	DssDataTypeReserved :  0,  //unknown     
    	DssDataTypeInteger  :  1,  //signed integer  
    	DssDataTypeUnsigned :  2,  //unsigned integer  
    	DssDataTypeNumeric  :  3,  //number with exact precision and scale  
    	DssDataTypeDecimal  :  4,  //similar to DssDataTypeNumeric , actual precision may be larger  
    	DssDataTypeReal     :  5,  //single precision real number, 4 bytes  
    	DssDataTypeDouble   :  6,  //double precision real number, 8 bytes  
    	DssDataTypeFloat    :  7,  //floating point number with precision  
    	DssDataTypeChar     :  8,  //fixed length character string  
    	DssDataTypeVarChar  :  9,  //variable length character string  
    	DssDataTypeLongVarChar:10, //variable length char data up to 2GB  
    	DssDataTypeBinary   :  11, //fixed length binary data  
    	DssDataTypeVarBin   :  12, //variable length binary data  
    	DssDataTypeLongVarBin: 13, //variable length binary data, up to 2GB  
    	DssDataTypeDate     :  14, //date: containing year, month and day  
    	DssDataTypeTime     :  15, //time: hour, minute, second and fraction of second  
    	DssDataTypeTimeStamp:  16, //include both data and time. 
    	DssDataTypeNChar    :  17,
    	DssDataTypeNVarChar :  18,
    	DssDataTypeBigDecimal: 30,
    	DssDataTypeCellFormatData: 31,
    	DssDataTypeUTF8Char :  33    	
    };
    
    
    function _getBaseFormDisplayType(datatype) {    
    	switch(datatype) {
    	case EnumDssDataType.DssDataTypeDecimal:
    	case EnumDssDataType.DssDataTypeDouble:
    	case EnumDssDataType.DssDataTypeFloat:
    	case EnumDssDataType.DssDataTypeInteger:
    	case EnumDssDataType.DssDataTypeLong:
    	case EnumDssDataType.DssDataTypeNumeric:
    	case EnumDssDataType.DssDataTypeReal:
    	case EnumDssDataType.DssDataTypeShort:
    	case EnumDssDataType.DssDataTypeUnsigned:
    	     return EnumDSSBaseFormType.DssBaseFormNumber
    	     break;
    	case EnumDssDataType.DssDataTypeChar:
    	case EnumDssDataType.DssDataTypeLongVarChar:
    	case EnumDssDataType.DssDataTypeMBChar:
    	case EnumDssDataType.DssDataTypeVarChar:
    	case EnumDssDataType.DssDataTypeNVarChar:
    	case EnumDssDataType.DssDataTypeNChar:
    	     return EnumDSSBaseFormType.DssBaseFormText
    	     break;
    	case EnumDssDataType.DssDataTypeTimeStamp:
    	     return EnumDSSBaseFormType.DssBaseFormDateTime
    	     break;
    	case EnumDssDataType.DssDataTypeDate:
    	     return EnumDSSBaseFormType.DssBaseFormDate
    	     break;
    	case EnumDssDataType.DssDataTypeTime:
    	     return EnumDSSBaseFormType.DssBaseFormTime
    	     break;
    	case EnumDssDataType.DssDataTypeBinary:
    	case EnumDssDataType.DssDataTypeLongVarBin:
    	case EnumDssDataType.DssDataTypeVarBin:
    	case EnumDssDataType.DssDataTypeReserved:
    	case EnumDssDataType.DssDataTypeUnknown:
    	     return EnumDSSBaseFormType.DssBaseFormNumber
    	     break;
    	case EnumDssDataType.DssDataTypeBigDecimal:
    	     return EnumDSSBaseFormType.DssBaseFormBigDecimal
    	     break;
    	default:
    		 return EnumDSSBaseFormType.DssBaseFormNumber
    	}
    	
    };

    
    mstrmojo.WH.WHModel = mstrmojo.declare(
        // superclass
        mstrmojo.Obj,

        // mixins
        null,
               
        {
        	
            scriptClass: "mstrmojo.WH.WHModel",
            
            dbtbls: {},
          
            dbtables: [],  //embedded dbtables
            
            dbrs: [],
            
            dsns:[],
            
            drivers:[],
            
            dbms:[],
            
            suppdbs:[],
            
            SelDBRoleID: null,
                       
      	loadDBRoles:function (){
        	var mdl=this;
        	
     		var dbrparams = {taskId:'arch.getDBRoles'};
     		
     		var dbrcb = {
     			success: function(res){
     				_hideWaitPage();
     				var dbr = res.dbrs.dbr;
     				dbr = dbr.length ?  dbr: [dbr];  //if only one dbrole returned, we have to put it in an array
     				mdl.set("dbrs", dbr);
     			},
     			failure: function(res){ _hideWaitPage(); mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
     		 };
     		 //show the wait page
             _showWaitPage();	
     	     if (mstrApp.sessionState !== undefined){ dbrparams.sessionState = mstrApp.sessionState; }
     	     mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, dbrcb, dbrparams);
    	 },

         loadDBObjects:function (callback){
    	     loadDBMSObjects(this, callback);
         },
         
         _set_SelDBRoleID: function(n, v){
      		this.SelDBRoleID = v;
      		this.raiseEvent({name: 'dbroleChange', value: v});  
         },
         
         getSelectedDBRoleTables: function (callbacks, usecache) {        		
     		//perform the task to retrieve DBTables for given dbrole
         	var model = this;
         	var dbr = model.SelDBRoleID, dbts = model.dbtbls;
         	if (!dbr) {
         		return;
         	}        		
     		var tbls = dbts[dbr], idx = 0, _ispopulated = false, tables = [],n;
         	if ( usecache && dbts[dbr]) {
         		for (var tbn in tbls) {
         			_ispopulated = true;
	                dbt = tbls[tbn];	                
	                n = dbt.ns? dbt.ns + '.' + dbt.tbn : dbt.tbn;
                    tables[idx]={
                        n: n, 
                        id: dbt.tbid, 
                        did: n,
                        st: 8405,
                        tag: dbt,
                        items: []
                    };
		            idx++;	                     
	            }
         		if (_ispopulated) {
         		    callbacks.success(tables);
         		    return ;
         		}
     		}
         	dbts[dbr]= new Object();
         	tbls = dbts[dbr];         	
         	var flags = this.DssCatalogFlags.DssCatalogGetTables | this.DssCatalogFlags.DssCatalogAllNamespaces;
         	var tableparams = {taskId:'arch.catalogAction', dbrid: dbr, flags: flags};
         	var cb = {
         	    success: function(res){
        		   //hide the wait page
	               _hideWaitPage();
	               var cas = res.xrc.cas[0];
	               var stamp = cas.timestamp.replace(/&apos;/, "");
	               model.raiseEvent({name: 'cacheStamped', value: stamp}); 
	               var cattables = cas.tis;
    			   var length = cattables.length, n, ds=[], count=0;
    			   for (idx = 0; idx < length ; idx++){
    			       var dbt = cattables[idx];
       				   dbt = cattables[idx];       				   
       				   n = dbt.ns? dbt.ns + '.' + dbt.tbn : dbt.tbn;
       				   if (tbls[n]) {  //if we have duplicate, skip
       					   continue;
       				   }
       				   tbls[n] = dbt;	       				   
       				   if (dbt){ 
						   ds[idx]={
	                           n: n, 
	                           id: dbt.tbid, 
	                           did: n,
	                           st: 8405,
	                           tag: dbt,
	                           items: []
	                       };    					   		
       				    }	
     			    }
		 		    callbacks.success(ds);
		  		},
          		   
          		failure: function(res){
          			   //hide the wait page
	    	           _hideWaitPage();
          			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
          		   }
         	   };
         	   //show the wait page
     	       _showWaitPage();	
          	   if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
         	   mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
         	  
     	},	
     	
     	getColumnsForDBTable: function getColumnsForDBTable(params, callbacks){
        	//perform the task to retrieve DBColumns for a DBtable
        	var mdl = this;
        	var dbroleid = this.SelDBRoleID;        	
        	var dbtablename= params.data.n, ns=null;
        	var index = dbtablename.indexOf(".");
        	if (index>0) {
        		ns = dbtablename.substring(0,index);
        		dbtablename= dbtablename.substring(index+1);        		
        	}	
        	if (dbroleid){
        	   var items=mdl.dbtbls[dbroleid][params.data.n].columns;
        	   if(items){
        		   callbacks.success({items: items});
        		   return;
        	   }
        	   var flags = this.DssCatalogFlags.DssCatalogGetColumns;
        	   var ctparams = {taskId:'arch.catalogAction', dbrid: dbroleid, dbtname: dbtablename, flags: flags};
        	   if (ns) {
        		   ctparams.ns = ns;
        	   }	   
        	   var cb = {
        	       success: function(res){
        		       _hideWaitPage();
         			   var t = res.xrc.cas[0].tis[0];
        			   var clns = t.clis;
         			   var length = clns.length;
         			   var items = [], col, dt;
        			   for (index = 0; index < length ; index++) {
        				   col = clns[index];
        				   dt = col.dt;
         				   items[index]={
        				        n: col.cln + " " + mdl.getColumnDataTypeString(dt), 
	                            id: col.cmid,
	                            cln: col.cln,
	                            did: col.cln,
	                            dtps: dt.ps,
         				        dtsc: dt.scl,
         				        dttp: dt.tp,
	                            t: 26
         			       };          
         		       } 
        			   mdl.dbtbls[dbroleid][params.data.n].columns=items;
       				   callbacks.success({items: items});

         		   },
         		   
         		   failure: function(res){
         			   _hideWaitPage();
         			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
         		   }
        	   };
        		_showWaitPage();
         	    if (mstrApp.sessionState !== undefined){ ctparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, ctparams);
        	}
        },
        
        getColumnDataTypeString: function getdi(di){
        	var datatype='unknown';
        	if (di.tp){
                switch (parseInt(di.tp)) {
                    case EnumDssDataType.DssDataTypeInteger  :
                    	datatype='Signed Integer';
                    	break;
                    case EnumDssDataType.DssDataTypeUnsigned  :
                    	datatype='Unsigned Integer';
                    	break;
                    case EnumDssDataType.DssDataTypeNumeric  :
                    	datatype='Number';
                    	break;	
                    case EnumDssDataType.DssDataTypeDecimal  :
                    	datatype='Decimal';
                    	break;	
                    case EnumDssDataType.DssDataTypeReal  :
                    	datatype='Real';
                    	break;	   	 
                    case EnumDssDataType.DssDataTypeDouble  :
	                   	datatype='Double';
	                   	break;
                    case EnumDssDataType.DssDataTypeFloat  :
	                   	datatype='Float';
	                   	break;  
                    case EnumDssDataType.DssDataTypeChar  :
	                   	datatype='Char';
	                   	break;
                    case EnumDssDataType.DssDataTypeVarChar  :
	                   	datatype='VarChar';
	                   	break;
                    case EnumDssDataType.DssDataTypeLongVarChar  :
	                   	datatype='LongVarChar';
	                   	break;
                    case EnumDssDataType.DssDataTypeBinary  :
	                   	datatype='Binary';
	                   	break;
                    case EnumDssDataType.DssDataTypeVarBin  :
	                   	datatype='VarBin';
	                   	break;
                    case EnumDssDataType.DssDataTypeLongVarBin  :
	                   	datatype='LongVarBin';
	                   	break;
                    case EnumDssDataType.DssDataTypeDate  :
	                   	datatype='Date';
	                   	break;
                    case EnumDssDataType.DssDataTypeTime  :
	                   	datatype='Time';
	                   	break;
                    case EnumDssDataType.DssDataTypeTimeStamp  :
	                   	datatype='TimeStamp';
	                   	break;
                    case EnumDssDataType.DssDataTypeNChar  :
	                   	datatype='NChar';
	                   	break;
                    case EnumDssDataType.DssDataTypeNVarChar  :
	                   	datatype='NVarChar';
	                   	break; 
                    case EnumDssDataType.DssDataTypeBigDecimal  :
	                   	datatype='BigDecimal';
	                   	break; 
                    case EnumDssDataType.DssDataTypeCellFormatData  :
	                   	datatype='CellFormatData';
	                   	break; 
                    case EnumDssDataType.DssDataTypeUTF8Char  :
	                   	datatype='UTF8Char';
	                   	break; 		                   	
                }
            }    
        	return '[' + datatype + ']';
        },
  
            
            getXDADBRole: function(xdaid) {
            	var mdl = this;
	            if (this.msgid == '') {
	                    return;	
	            }
                
                var params = {taskId:'qBuilder.GetXDASchemaDBRole', xdaid: xdaid};
            	var cb = {
        	        success: function(res){
            		    _hideWaitPage();         
	            	    mdl.SelDBRoleID = res.dbr;
	              		mdl.raiseEvent({name: 'dbrsChange'});
	              		mdl.raiseEvent({name: 'dbroleChange', value: res.dbr});
         		    },
         		   
         		    failure: function(res){
         			   _hideWaitPage();
         			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
         		    }
        	    };
        		_showWaitPage();
         	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
            	
            	
            },	
            EnumDSSBaseFormType:EnumDSSBaseFormType,
            
            
            EnumDssDataType:EnumDssDataType,
            
            DSSCatalogStateFlags:
            {
                "DssCatalogStateDefault" : 0,
                "DssCatalogStateSelected" : 1,
                "DssCatalogStateFresh" : 2,
                "DssCatalogStateMissing" : 4,
                "DssCatalogStateUnexpected" : 8,
                "DssCatalogStateCompatibleSmaller" : 16,
                "DssCatalogStateCompatibleLarger" : 32,
                "DssCatalogStateCompatible" : 64,
                "DssCatalogStateIncompatible" : 128,
                "DssCatalogStateCompatibilityMask" : 240,
                "DssCatalogStateFreshTables" : 256,
                "DssCatalogStateMissingTables" : 512,
                "DssCatalogStateFreshColumns" :1024,
                "DssCatalogStateMissingColumns" : 2048,
                "DssCatalogStatePartitionMappingTable" : 65536,
                "DssCatalogStateDummyPartitionMappingTable" : 131072,
                "DssCatalogStateDummyPartitionSliceTable" : 262144
            },
        DssCatalogFlags: 
        	{
				"DssCatalogDefault": 0x0,
	        	"DssCatalogGetTables": 0x1,
	        	"DssCatalogGetColumns": 0x2,
	        	"DssCatalogGetTablePrimaryKeys": 0x4,
	        	"DssCatalogGetTableForeignKeys": 0x8,
	        	"DssCatalogGetTableKeys": 0xC,
	        	"DssCatalogGetTableSize": 0x10,
	        	"DssCatalogGetTableContent": 0x20,
	        	"DssCatalogGetColumnCardinality": 0x40,
	        	"DssCatalogGetColumnContent": 0x80,
	        	"DssCatalogGetFullCatalog": 0xFF,
	        	"DssCatalogSelectedOnly": 0x100,
	        	"DssCatalogApplyConnectionMapping": 0x200,
	        	"DssCatalogAllNamespaces": 0x400,
	        	"DssCatalogIgnoreNamespace": 0x2000,
	        	"DssCatalogIgnoreCase": 0x4000,
	        	"DssCatalogIgnoreInvalidNames": 0x8000,
	        	"DssCatalogReuseMatching": 0x10000,
	        	"DssCatalogReuseCompatible": 0x20000,
	        	"DssCatalogReuseAny": 0x40000,
	        	"DssCatalogAugmentExisting": 0x80000,
	        	"DssCatalogSortDescending": 0x100000,
	        	"DssCatalogSortTableNameFirst": 0x200000,
	        	"DssCatalogCompareWithMetadata": 0x08000000
        	}
        });
})();
        
        