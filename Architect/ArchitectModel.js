(function () {    
    mstrmojo.requiresCls(
        "mstrmojo.WH.WHModel");
/*   Structures   */ 
    var attr={
    	id:"",
    	name:"",
    	Relations:[],
    	IsNew:false,
    	IsDirty:false,
    	IsDeleted:false
    };
    
    var fact={
    	id:"",
    	name:"",
    	IsNew:false,
    	IsDirty:false,
    	IsDeleted:false
    };
    
    var form={
    		"FrmID":"fmrID",
    		"FrmName":"frmName",
       		"IsNew":false,
    		"IsDirty":false,
    		"IsDeleted":false
    };
    
    var column={
    		"ClnID":"clnID",
    		"ClnName":"clnName",
    		"ClnDataType": "clnDatatype",
    		"IsNew":false,
    		"IsDirty":false,
    		"IsDeleted":false
    };
    
    var relation={
    		"ParentID":"ParentID",
    		"ChildID":"ChildID",
    		"TblID":"tableID",
    		"IsNew":false,
    		"IsDirty":false,
    		"IsDeleted":false
    };
    
    var fctInfo={
    		"FctInfoID":"TblID+FctID",
    		"FctID":"fctID",
    		"TblID":"tblID",
    		"ClnID":"clnID",
    		"Expr": "Expression",
       		"IsNew":false,
    		"IsDirty":false,
    		"IsDeleted":false,
    		"Format":"Email"
    };
    
    var attInfo={
    		"id":"",
        	"AttID":"attID",
        	"FrmID":"frmID",
        	"TblID":"tblID",
        	"ClnID":"clnID",
        	"Expr": "Expression",
       		"IsNew":false,
    		"IsDirty":false,
    		"IsDeleted":false,
    		"Format":"Email"
    };
    
    var dbrole = {
    		"name": "name",
    		"did": "id",
    		"tp": "type",
    		"stp": "subtype",
    		"primary": "primary"
    };

    var _DEFAULT_LAYER_ID = "xDefaultx";
    var _DEFAULT_LAYER_NAME = "Default Layer";
    
    var func_cat=["Basic","Date and Time","Logical","Math","Internal","Null/Zero","String"];
    
	
   	var _waitBox = new mstrmojo.Editor({
		cssClass: "mstrmojo-Architect-WaitBox",
		draggable: false,
		showTitle: false,
		zIndex: 99999,
		count:0,
		children: [{
			scriptClass:"mstrmojo.Box",
		    cssClass: "mstrmojo-Architect-Wait",
			children: [{
				scriptClass:"mstrmojo.Box",
			    cssClass: "mstrmojo-Architect-WaitBox-Close",
				onRender: function (evt) {
				    var _close_menu = function(evt){
				        _waitBox.close();
					};
					if (this.domNode) {  
					    mstrmojo.dom.attachEvent(this.domNode, 'click', _close_menu);
					}    
				}
			}] 
		}],
		onRender: function (evt) {
   		    if (this.curtainNode) {
   		    	this.curtainNode.style.cursor = "progress";   //set cursor shape on the curtain	
   		    }	
   	    }
    });
    
    var dummyTable1=null;
    var dummyTable2=null;
    
    
    function _showWaitPage() {
    	if (_waitBox.count===0) {
    	    _waitBox.open();
    	} 
    	 _waitBox.count++;
    };
   
    function _hideWaitPage() {
    	_waitBox.count--;
    	if (_waitBox.count===0) {
    	    _waitBox.close();
    	}
    };
    
    
    function _sortFunctions(fcts){
        //sort the function categories and the functions under each category
        var fs = function(a, b){
                return mstrmojo.array.stringSorter(a.n, b.n);
            },
            i, len;
        fcts = fcts.sort(fs);
        for(i=0, len=fcts.length;i<len;i++){
            fcts[i].fns = fcts[i].fns.sort(fs);
        } 
        return fcts;
    }
    
    /**
     * get the number of element inside of a collection
     * @param {object} c.
     */
   	function _getElementCount(c) {
   	    var count=0;
   		for (var k in c) {
   		    count++;	
   		}
   		return count;
   	};	
	/**
     * return the function type constant 
     * @param  (fn) the function string name
     */
   	function getFunctionType(fn) {
    	switch (fn){
    	case "Sum":{
    		return "12";}
    	case "Count":{
    		return "13";}
    	case "Max":{
    		return "16";}
    	case "Min":{
    		return "15";}   
    	case "Variance": {
    		return "33";}    
    	case "Avg": {
    		return "14";}
   		}
   	};	
   	/**
     * return the xml format of the metric definition
     * @param {object} t.
     */
   	function _constructMetricXML(nm, fn, fct) {
   	    var fnType=getFunctionType(fn);
   	    var xml ="<schm smt='1'><oi tp='4'  n='"+ nm + "'><def><fun fnt='" + fnType + "'/><fc did='" + fct.id + "'/></def></oi></schm>";
   	    return xml;
   	};
    /**
     * return the xml format of the table definition
     * @param {object} t.
     */
   	function _constructTableXML(t) {
   	    var xml ='<ti ';
   	    var tbs = 'ps="' + t.ns+ '" tbn="' + t.tbn +'" sz="' + t.sz+'" tbid="'+ t.tbid+ '" prid="' + mstrApp.projectID + '" sta="' +t.sta+'"><clis>';
   	    xml+=tbs;
   	    for (var i=0;i<t.clis.length;i++){
   	    	var cl = t.clis[i];
   	        var cls = '<cli cln="'+cl.cln+'" cad="'+cl.cad+'" cmid="'+cl.cmid+'" sta="'+cl.sta+'">' + 
   	                  '<dt tp="'+cl.dt.tp+'" ps="' + cl.dt.ps +'" sc="' + cl.dt.sc +'"/></cli>';
   	        xml+=cls;
   	    }	
   	    xml+= '</clis></ti>';
   	    return xml;
   	};	
    
    /*******************************************************************************
     * Name:      showContextButton
     * Purpose:   show the data grid's context button on the correct location
     * Assumes:
     * Returns:   
     * History:   08/25/2011 JAGR Created
     ********************************************************************************/
    mstrmojo.Architect.ArchitectModel = mstrmojo.declare(
        // superclass
        mstrmojo.WH.WHModel,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.DocModel.prototype
         */
        {
            scriptClass: 'mstrmojo.Architect.ArchitectModel',
            id: 'ArchModel',
            attrs:new Object(),
            fcts:new Object(),
            frms:[],
            clns:[],
            rels:[],
            prjTbls:[],	
            factInfos:[],
            attrInfos:[],
            SelTableID:null,
            SelAttrID:null,
            SelTables:[],
            SchemaInstanceID:null,
            ProjectID:null,
            PrjTblDbr:null,
            ProjectDBRoles: new Object(),
            ProjectPrimaryDBRole: new Object(),
            attributes: new Object(),
            tblsToAdd: [],
            layers: new Object(),
            pts:{},
            relations:{},
            attrIdx: 1,
            fctIdx:1,
            currentlayerID: _DEFAULT_LAYER_ID,
            isMultiView: false,  //whether in multi table view or not
            IDFormID:"45C11FA478E745FEA08D781CEA190FE5",   // TODO We need to get the ID Form from the project
        
            /**
             * Raise an event whenever the the current layer ID is set
             */
         	_set_currentlayerID: function layerChange(n, v){
         	    var prev = this.currentlayerID;
         		if (prev != v) {
	        		this.currentlayerID = v;
	         		this.raiseEvent({name: 'layerChange', value: v});
                }
        	},
             /**
             * Show the wait page feedback
             */
         	showWaitPage: function(){
        		_showWaitPage();
        	},
            /**
             * Hide the wait page feedback
             */
         	hideWaitPage: function(){
        		_hideWaitPage();
        	},
        	
        	getLayer: function(id) {
        		return this.layers[id];
        	},	
        	
        	getCurrentRelationBlocks: function(){
        		//in the format of [ {data: [ [{n:'name', icon: 12, lvl: 0}],..},...]
        		return [       		        
        		       ];
        	},
        	
        	getFrmDescription:function getFrmDescription(frmID)
    	    {
    	    	for (lIterForm=0; lIterForm < this.frms.length;lIterForm++)	
    	   	 	{
    				var frm=this.frms[lIterForm];
    				if (frm.FrmID==frmID)
    	   		 		{
    	   			      return frm.FrmName;	 
    	   		 		};
    	    	 	}	 
    	    },
    	    
    	    populateFormCategories: function populateFormCategories()
    	    {
     	    	var mdl=this;
     	    	if (mdl.frms.length!=0) return;
     	    	mdl.frms[0]={
    	    			FrmID:"45C11FA478E745FEA08D781CEA190FE5",
    	        		FrmName:"ID"
    	    	};
    	    	mdl.frms[1]={
    	    			FrmID:"CCFBE2A5EADB4F50941FB879CCF1721C",
    	        		FrmName:"DESC"
    	    	};
    	    },
    	    
    	    getSelectedDBRoleTables: function (callbacks, usecache) {        		
        		//perform the task to retrieve DBTables for given dbrole
            	var mdl = this;
            	var dbr = mdl.SelDBRoleID, dbts = mdl.dbtbls;
            	if (!dbr) {
            		return;
            	}     
            	if(!mdl.pts[dbr]) mdl.pts[dbr]={};
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
            	var tables = this.tables;
            	var flags = this.DssCatalogFlags.DssCatalogGetTables+this.DssCatalogFlags.DssCatalogCompareWithMetadata;
            	flags = mdl.catalogRefresh? (flags|this.DssCatalogFlags.DssCatalogGetFresh): flags;
            	var tableparams = {taskId:'arch.catalogAction', dbrid: dbr, flags: flags};
            	var cb = {
            	       success: function(res){
	            		   //hide the wait page
	    	               _hideWaitPage();
	    	               var cas = res.xrc.cas[0];
	    	               var stamp = cas.timestamp.replace(/&apos;/, "");
	    	               mdl.raiseEvent({name: 'cacheStamped', value: stamp}); 
	    	               var cattables = cas.tis;
	        			   var length = cattables.length, n, count=0;
	        			   mdl.ds=[];
	        			   for (idx = 0; idx < length ; idx++){
	        			       var dbt = cattables[idx];
	        			       n = dbt.ns? dbt.ns + '.' + dbt.tbn : dbt.tbn;
	           				   tbls[n] = dbt;	           			
	           				   if (dbt){  //table exist in collection
	           					   if(parseInt(dbt.sta)===mdl.DSSCatalogStateFlags.DssCatalogStateFresh){
	           						   mdl.ds[count]={
		 			                            n: n, 
		 			                            id: dbt.prid, 
		 			                            did: n,
		 			                            st: 8405,
		 			                            tag: dbt,
		 			                            items: []};
		 			                        count++;
	           					   }
	           					   		
	           					}	
	         			   } 
	        			   mdl.set("tbls", tables);	        			  
            			   callbacks.success(mdl.ds);
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
    	    
    	    addProjectDBRole:function addProjectDBRole(dbrlid){
    	    	var mdl=this;  
    	    	mdl.ProjectDBRoles[dbrlid]=dbrlid;
    	    	var tableparams = {taskId:'arch.linkDBRToProject', projectid:mstrApp.projectID, dbrid:dbrlid };
    	    	var tablecb = {
            			success: function(res){
       	    						var dbrl=res.dbroles[res.dbroles.length-1];
    	    						mdl.ProjectDBRoles[dbrlid]=dbrl;
            		 				if (dbrl.primary=='true')	
            		 					mdl.ProjectPrimaryDBRole=dbrl;
           							},
            			failure: function(res){ 
           								mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           					}
            		};

        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb, tableparams);
    	    },
    	    
     	    getProjectDBRoles:function getProjectDBRoles(){
    	    	var mdl=this;   
    	    	var tableparams = {taskId:'arch.getProjectDBRoles', projectid:mstrApp.projectID };
    	    	var tablecb = {
            			success: function(res){
    	    				for (var lc=0; lc <res.dbroles.length; lc++)
    	    					{
    	    					var dbrl=res.dbroles[lc];
    	    					mdl.ProjectDBRoles[dbrl.did]=dbrl;
    	    					if (lc==0)	
    	    						mdl.ProjectPrimaryDBRole=dbrl;
    	    					}
           					},
            			failure: function(res){ 
           								mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           				}
            		};

        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb, tableparams);
    	    },
    	    
    	    addAttributeInfo:function addAttributeInfo(baseFormID, AttID, expr, cmid, tableIds, callback){
    	    	var mdl=this;   
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 7, objectid:AttID, baseformid:baseFormID, columnid:cmid,expression:expr, tableids:tableIds};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		var cb = {
        		    success: function(res){
        			    _hideWaitPage();
        			    //update model
        			   // mdl.updateLtbl()
        			    var attInfo={
				    		"id":AttID,
				        	"AttID":AttID,
				        	"FrmID":mdl.IDFormID,
				        	"TblID":tableIds,
				        	"ClnID": cmid,
				        	"Expr": expr,
				       		"IsNew":true,
				    		"IsDirty":false,
				    		"IsDeleted":false,
				    		"Format": "Text"
					    };
        			    var t = mdl.pts[mdl.PrjTblDbr][tableIds];
        			    t.AttrInfos[AttID]= attInfo;
        			    mdl.raiseEvent({name:"TableContentChange", did:tableIds});
        			    callback.success(attInfo);
        		    },
        		    failure: function(res) {
        		    	_hideWaitPage();
        		    	callback.failure(res);
        		    }        				
        		};
        		_showWaitPage();
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
    	    },
    	    removeAttributeInfo:function removeAttributeInfo(baseFormID, AttID,  tableIds, callback){
    	    	var mdl=this;   
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 8, objectid:AttID, baseformid:baseFormID,  tableids:tableIds};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		var cb = {
        		    success: function(res){
        			    _hideWaitPage();
        			    //update model 
        			    var t = mdl.pts[mdl.PrjTblDbr][tableIds];
        			    delete t.AttrInfos[AttID];
        			    //after we delete this attributeinfo, we also want to check if this is the last piece of attributeinfo this attribute has
        			    //if so, we may delete this attribute as well
        			    var found=false;
        			    for(var r in mdl.pts){
        			      if(found) break;
        			      var tbls=mdl.pts[r];
        			      for (var tid in tbls) {
        			         t = tbls[tid];
        			         if (t.AttrInfos[AttID]) {
        			        	 found= true;
        			        	 break;
        			         }	 
        			      }
        			    }
        			    if (!found) {
        			    	delete mdl.attrs[AttID];
        			    }
        			    mdl.raiseEvent({name:"TableContentChange", did:tableIds});
        			    callback.success(res);
        		    },
        		    failure: function(res) {
        		    	_hideWaitPage();
        		    	callback.failure(res);
        		    }        				
        		};
        		_showWaitPage();
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
    	    },
    	  
    	    convertAttributeToFact:function(baseFormID, attr, fct,callback){
    	    	var mdl=this,
    	    	    tid=mdl.SelTableID,
    	    	    objid2="",
    	    	    att=mdl.getAttribute(attr.did);
    	    	if(att.Forms.length>1){ mstrmojo.alert("Cannot convert to fact now!"); return;}
    	    	if (!mdl.SchemaInstanceID) return;
    	    	if(fct){
    	    		objid2=fct.id;
    	    	}
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype:30 , objectid:attr.did, objectid2:objid2,baseformid:baseFormID, 
    	    			           columnid:attr.cmid,  tableids:mdl.SelTableID,objectname: attr.AL,expression:attr.EXP};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		var cb = {
        		    success: function(res){
        			    _hideWaitPage();
        			    var aid=attr.did;
     			     if(!fct){
        			    fct=res.mi['in'].oi[0];
        			    var fact={
		   						"id":fct.did,
		   						"name":fct.n,
		   						"IsNew":true,
		   						"IsDirty":false,
		   						"IsDeleted":false,
		   						"Sum":true,
				            	"Count":false,
				            	"Max":false,
				            	"Min":false,
				            	"Variance":false,
				            	"Average":false
			   				};
						mdl.fcts[fct.did]=fact;
     			     }
        			    var factInfo={
    				    		id:fct.did,
    				        	FactID:fct.did,				        	
    				        	TblID:tid,
    				        	ClnID: attr.cmid,
    				        	Expr: attr.EXP,
    				       		IsNew:true,
    				    	    IsDirty:false,
    				    		IsDeleted:false,
    				    		Format: "Text",
    				    		tks:attr.tks,
    				    		tag: fct
    					    };
            			   var t = mdl.pts[mdl.PrjTblDbr][tid];
            			   t.FactInfos[fct.did]= factInfo;
            			  for(var r in mdl.pts){  //auto recognizing
        			    	  var tbls=mdl.pts[r];
        			           for (var ti in tbls) {
        			                  var t = tbls[ti];
        			                  if (t.AttrInfos[aid]) {
        			        	             delete t.AttrInfos[aid];
        			        	            /* if(!t.FactInfos[fct.did])
        			        	                t.FactInfos[fct.did]=factInfo;*/
        			          }	 
        			        }
        			      }
        			       delete mdl.attrs[aid];
            			    mdl.raiseEvent({name:"TableContentChange", did:tid});
            			    callback.success(factInfo);
        		    },
        		    failure: function(res) {
        		    	_hideWaitPage();
        		    	callback.failure(res);
        		    }        				
        		};
        		_showWaitPage();
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
    	    },
    	    
    	    
    	    addFactInfo:function addFactInfo(factID, expr, cmid, tableIds,callback){
    	    	var mdl=this;   
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 4, objectid:factID, columnid:cmid,expression:expr, tableids:tableIds};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		var cb = {
        		    success: function(res){
        			    _hideWaitPage();
        			    //update model
        			    var factInfo={
				    		id:factID,
				        	FactID:factID,				        	
				        	TblID:tableIds,
				        	ClnID: cmid,
				        	Expr: expr,
				       		IsNew:true,
				    	    IsDirty:false,
				    		IsDeleted:false,
				    		Format: "Text",
				    		tag: res
					    };
        			    var t = mdl.pts[mdl.PrjTblDbr][tableIds];
        			    t.FactInfos[factID]= factInfo;
        			    mdl.raiseEvent({name:"TableContentChange", did:tableIds});
        			    callback.success(factInfo);
        		    },
        		    failure: function(res) {
        		    	_hideWaitPage();
        		    	callback.failure(res);
        		    }        				
        		};
        		_showWaitPage();
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
    	    },
    	    
    	    removeFactInfo:function removeFactInfo(factID, tableIds,callback){
    	    	var mdl=this;   
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 5, objectid:factID, tableids:tableIds};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		var cb = {
        		    success: function(res){
        			    _hideWaitPage();
        			    //update model 
        			    var t = mdl.pts[mdl.PrjTblDbr][tableIds];
        			    delete t.FactInfos[factID];
        			    var found=false;
        			    for(var r in mdl.pts){
        			        if(found) break;
        			    	var tbls=mdl.pts[r];
        			        for (var tid in tbls) {
        			           var t = tbls[tid];
        			           if (t.FactInfos[factID]) {
        			        	 found= true;
        			        	 break;
        			         }	 
        			    }
        			    }
        			    if (!found) {        			    	
        			    	delete mdl.fcts[factID];
        			    }
        				mdl.raiseEvent({name:"TableContentChange", did:tableIds});
        			    callback.success(res);
        		    },
        		    failure: function(res) {
        		    	_hideWaitPage();
        		    	callback.failure(res);
        		    }        				
        		};
        		_showWaitPage();
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
    	    },
    	 
    	    convertFactToAttribute:function(fact, attr, fmt, isbf, istf, useName, callback){
    	    	var mdl=this, 
    	    	    tid=mdl.SelTableID,
    	    	    objid2="";
    	    	if (!mdl.SchemaInstanceID)
            		      return;
    	    	var frmID=mdl.frms[0].FrmID;
    	    	if (attr){
    	    	    objid2=attr.id;
    	    	}
    	        var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype:31, objectid:fact.did,objectid2:objid2, columnid:fact.cmid,  tableids:mdl.SelTableID,
 			            formcatid:frmID, expression: fact.EXP, objectname: fact.AL,isbrowseform:1,istemplateform:1,baseformtype:fmt, usename:useName};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		var cb = {
        		    success: function(res){
        			 _hideWaitPage();
        			 var fid=fact.did;
     			     if(!attr){
     			         var attr=res.mi[0]['in'].oi,
     			             att={
	   						  "id":attr.did,
	   						  "name":attr.n,
	   						  "Relations":[],
	   						  "Forms":[attr.def.fms],
	   						  "IsNew":true,
	   						  "IsDirty":false,
	   						  "IsDeleted":false,
	   				          }
     			         mdl.attrs[attr.did] = att;
     			   }
     			      var attInfo={
				    		"id":attr.did,
				        	"AttID":attr.did,
				        	"FrmID":mdl.IDFormID,
				        	"TblID":tid,
				        	"ClnID": fact.cmid,
				        	"Expr": fact.EXP,
				       		"IsNew":true,
				    		"IsDirty":false,
				    		"IsDeleted":false,
				    		"Format": "Text",
				    		"tks":fact.tks
					    };
     			    
				   for(var r in mdl.pts){
        				var tbls=mdl.pts[r];
     			        for (var ti in tbls) {
     			           var t = tbls[ti];
     			             if (t.FactInfos[fid]) {
     			        	       delete t.FactInfos[fact.did];
     			        	     /*  if(!t.AttrInfos[attInfo.id])
     			        	           t.AttrInfos[attInfo.id]=attInfo;*/
     			         }	 
     			     }
        			}
     			    delete mdl.fcts[fid];
       			    var t = mdl.pts[mdl.PrjTblDbr][tid];
       			    t.AttrInfos[attr.did]= attInfo;
     				mdl.raiseEvent({name:"TableContentChange", did:tid});
     				callback.success(attInfo);
        		    },
        		    failure: function(res) {
        		    	_hideWaitPage();
        		    	callback.failure(res);
        		    }        				
        		};
        		_showWaitPage();
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
    	    },
    	    
    	    updateFactInfo:function updateFactInfo(factID, expr, cmid,tableIds, callback){
    	    	var mdl=this;
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 6, objectid:factID, expression:expr,columnid:cmid, tableids :tableIds};
    	    		var cb = {
        		    success: function(res){
        			    _hideWaitPage();
        			    //update model
        			    var factInfo={
				    		id:factID,
				        	FactID:factID,				        	
				        	TblID:tableIds,
				        	ClnID: cmid,
				        	Expr: expr,
				       		IsNew:true,
				    	    IsDirty:false,
				    		IsDeleted:false,
				    		Format: "Text",
				    		tag: res
					    };
        			    var t = mdl.pts[mdl.PrjTblDbr][tableIds];
        			    t.FactInfos[factID]= factInfo;
        			    mdl.raiseEvent({name:"TableContentChange", did:tableIds});
        			    callback.success(factInfo);
        		    },
        		    failure: function(res) {
        		    	_hideWaitPage();
        		    	callback.failure(res);
        		    }        				
        		};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
    	    },
    	    
    	    updateAttributeInfo:function updateAttInfo(baseFormID,frmId,AttID, expr, cmid,tableIds, callback){
    	    	var mdl=this;  
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 7, objectid:AttID, baseformid:FormID,expression:expr, columnid:cmid,tableids :tableIds};
    	    			var cb = {
        		    success: function(res){
        			    _hideWaitPage();
        			    var attInfo={
				    		"id":AttID,
				        	"AttID":AttID,
				        	"FrmID":frmId,
				        	"TblID":tableIds,
				        	"ClnID": cmid,
				        	"Expr": expr,
				       		"IsNew":true,
				    		"IsDirty":false,
				    		"IsDeleted":false,
				    		"Format": "Text"
					    };
        			    var t = mdl.pts[mdl.PrjTblDbr][tableIds];
        			    t.AttrInfos[AttID]= attInfo;
        			    mdl.raiseEvent({name:"TableContentChange", did:tableIds});
        			    callback.success(attInfo);
        		    },
        		    failure: function(res) {
        		    	_hideWaitPage();
        		    	callback.failure(res);
        		    }        				
        		};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		_showWaitPage();
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
    	    },
    	   
    	    addAttributeForm:function addAttributeForm(objID, sFormCategID, columnId, expr ,tableIds, sort, browseSort, isMultilingual, baseformType, isbf, istf, useName, useDesc,callback){
     	    	var mdl=this;
       	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 12, objectid:objID, formcatid:sFormCategID, tableids:tableIds, columnid:columnId, expression:expr};
        	    if (typeof sort!="undefined")
        	    	tableparams.sorttype= sort;
    	    	if (typeof browseSort!="undefined")
    	    		tableparams.browsesorttype= browseSort;
    	    	if (typeof isMultilingual!="undefined")
    	    		tableparams.ismultilingual= isMultilingual;
    	    	if (typeof baseformType!="undefined")
    	     	    tableparams.baseformtype= baseformType;
    	    	else
    	    		tableparams.baseformtype=mdl.EnumDSSBaseFormType.DssBaseFormText; 
     	    	if (typeof useName!="undefined")
     	    		tableparams.usename= useName;
    	    	if (typeof useDesc!="undefined")
    	    		tableparams.usedesc= useDesc;
    	    	if (typeof isbf!="undefined")
    	    		tableparams.isbrowseform= isbf;
    	    	if (typeof istf!="undefined")
    	    		tableparams.istemplateform= istf;
    	    	
    	    	var localCallBack={
    	    			success: function(res){
    	    			_hideWaitPage();
    	    			var ob=res.mi["in"].oi;
    	    			var fr=ob.def.fms;
       					var attr=mdl.getAttribute(ob.did);
       					attr.Forms.push(fr);
       					res.expr = expr;  //pass back the expression
       					res.clnid = columnId;
    					callback.success(res);
    				},
    				failure: function(res){ 
    					callback.failure(res);
    				}
    	    		};
         		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
         		_showWaitPage();
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, localCallBack, tableparams);
    	    },
    	    removeAttributeForm:function removeAttributeForm(attID, sFormCategID,callback){
    	    	var mdl=this;   
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 13, objectid:attID, formcatid:sFormCategID};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, callback, tableparams);
    	    },
      	    updateAttributeForm:function updateAttributeForm(objID, sFormCategID, columnId, expr ,tableIds, sort, browseSort, isMultilingual, baseformType, isbf, istf,  useName, useDesc,callback){
    	    	var mdl=this;
       	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 12, objectid:objID, formcatid:sFormCategID, tableids:tableIds, columnid:columnId, expression:expr};
       	    	if (typeof tableIds!="undefined")
        	    	tableparams.tableids= tableIds;
       	    	if (typeof expr!="undefined")
        	    	tableparams.exp= expr;
       	    	if (typeof columnId!="undefined")
        	    	tableparams.columnid= columnId;
       	    	if (typeof sort!="undefined")
        	    	tableparams.sorttype= sort;
    	    	if (typeof browseSort!="undefined")
    	    		tableparams.browsesorttype= browseSort;
    	    	if (typeof isMultilingual!="undefined")
    	    		tableparams.ismultilingual= isMultilingual;
    	    	if (typeof baseformType!="undefined")
    	    		tableparams.baseformtype= baseformType;
     	    	if (typeof useName!="undefined")
     	    		tableparams.usename= useName;
    	    	if (typeof useDesc!="undefined")
    	    		tableparams.usedesc= useDesc;
    	    	if (typeof isbf!="undefined")
    	    		tableparams.isbrowseform= isbf;
    	    	if (typeof istf!="undefined")
    	    		tableparams.istemplateform= istf;
         		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, callback, tableparams);
    	    },

    	    setAsLookUp:function setAsLookUp(attID, baseFormID, tableIds, callback){
    	    	var mdl=this;   
    	    	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 11, objectid:attID, baseformid:baseFormID, tableids:tableIds};
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, callback, tableparams);
    	    },
    	    
    	    loadProjectTables: function(callback) {
    	    	var mdl=this;   
    	    	var params = {taskId:'arch.search', schemaid: this.SchemaInstanceID, objecttypes: 15 };
        		if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, callback, params);
    	    	
    	    },	
    	    
    	    addLayer: function (callback) {
    	    	var mdl=this;   
    	    	if (!mdl.SchemaInstanceID)
            		return;
    	    	//get a name for the new layer
    	    	var count= _getElementCount(mdl.layers);    	    
    	    	var n = "new layer " + count.toString();
    	    	while (mdl.layers[n]) {   //give unique name for each layer
    	    		n = n + "(1)";
    	    	}	
    	    	mdl.layers[n] = new Object();
    	    	mdl.layers[n].name = n;
    	    	mdl.layers[n].id = n;
    	    	mdl.layers[n].tables = new Object();
    	    	mdl.currentlayerID = n;
    	    	callback.success(mdl.layers[n]);    	     	     	
    	    },
    	    delLayer: function (id, callback) {
    	    	var mdl=this;   
    	    	if (!mdl.SchemaInstanceID) {
            		return;
    	    	}	
    	    	var layers = mdl.layers, prev = null;
    	    	if (id != _DEFAULT_LAYER_ID) {
	    	    	if (layers[id]) {
	    	    		//set the previous layer to be current selected one
	    	    		for (var key in layers) {
	    	    			if (key == id) {
	    	    			    break;	
	    	    			}	
	    	    			prev = key;
	    	    	    }	
	    	    	    var res = mdl.layers[id];
	    	    		delete mdl.layers[id];
	    	    		mdl.currentlayerID = prev;
	    	    		callback.success(res);
	    	    	}
    	    	}else {
    	    	    callback.failure("You cannot delete the default layer."); 	
    	    	}	
    	    		
    	    },
     	    addTablesToLayer: function (tlist,layerid, callback) {
    	    	var mdl=this;   
    	    	if (!mdl.SchemaInstanceID)
            		return;
    	    	var layer = mdl.layers[layerid];
    	    	for (var item in tlist) {
    	    	    if (!layer.tables[item]){
    	    	        layer.tables[item] = item; 	
    	    	    }	
    	    	}  	    	
    	    },
    	    
      	    createTable:function createTable(sObjectName, t,callback){
            	var mdl=this;   
               	if (!mdl.SchemaInstanceID)
            		return;
               
                var t3 =_constructTableXML(t);
            	
              	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 1, flag: (mdl.DssCatalogFlags.DssCatalogReuseAny),  objecttype: 15, objectname: sObjectName, objectdef:t3};
              
            	var tablecb = {
            		success: function(res){
            		 					callback.success({item: res});
           							},
            		failure: function(res){ 
           								mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
                };

        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb, tableparams);
            },
            
            autoRecog:function(tid,callback){
            	var mdl=this;   
               	if (!mdl.SchemaInstanceID)
            		return;
               	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 10,tableids:tid};
            	var cb = {
            		success: function(res){
            		 					callback.success({item: res});
           							},
            		failure: function(res){ 
           								mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
                };

        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
            },
             findObjectByName: function (n, tp, callback) {
            	var mdl=this;   
               	if (!mdl.SchemaInstanceID)
            		return;
                                       	
                var params = {taskId:'arch.search', schemaid: this.SchemaInstanceID, namepattern: n, objecttypes: tp };
                           
            	var cb = {
            		success: function(res){
            		    _hideWaitPage();
            		 	callback.success(res);
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
            findAttributeByName: function (n) {
                for (var did in this.attrs) {
                    if (n == this.attrs[did].name) {
                        return this.attrs[did];
                    }
                }	
            	return null;
            },	
            findFactByName:function (n){
            	 for (var did in this.fcts) {
                     if (n == this.fcts[did].name) {
                         return this.fcts[did];
                     }
                 }	
             	return null;
            },
                   
    	    getColumnsForDBAddedTable: function getColumnsForDBTable(t,callback){
            	//perform the task to retrieve DBColumns for a DBtable
            	var mdl = this;
            	var dbroleid = this.SelDBRoleID;
            	var dbtablename= t.n;
            	if (dbroleid){
            	   var flags = this.DssCatalogFlags.DssCatalogGetColumns; 
            	   var ctparams = {taskId:'arch.catalogAction', dbrid: dbroleid, dbtname: dbtablename, flags: flags};
            	   var cbc = {
            	       success: function(res){
             			   var t = res.xrc.cas[0].tis[0];
          				   callback.success({item: t});
 
             		   },
             		   
             		   failure: function(res){
             			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
             		   }
            	   };
            		
             	    if (mstrApp.sessionState !== undefined){ ctparams.sessionState = mstrApp.sessionState; }
            		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cbc, ctparams);
            	}
            },
    	    addTable: function(t, callback )
    	    {
               	var attinfos=[];
            	var mdl=this;
        		var cb1= {
        				success:function(res){
        					var cb2={
        						success:function(res){
        						    if (res.item.mi.schml.schm.length){
	       						    	var pos = res.item.mi.schml.schm.length - 1;
	       						    	var tbl = res.item.mi.schml.schm[pos].oi;
	       						    	var dbtbl = res.item.mi.schml.schm[pos].ti;
	       						    }else{
	       						    	var tbl = res.item.mi.schml.schm.oi;
	       						    	var dbtbl = res.item.mi.schml.schm.ti;
	       						    }
        							var newone={
    	           							name : tbl.n,
    	           							TblID : tbl.did,
    	           							tag : dbtbl,    	           							
    	           							isNew : true,           							
    	           							FactInfos : {},
    	           							AttrInfos : {}
    	        	    	    	}; 
        							var r=mdl.PrjTblDbr=mdl.SelDBRoleID;
        							mdl.pts[r][tbl.did] = newone;
        							var cb3={
        					    			success: function(res){
        						   			   var its=res.item.mi['in'].oi;
        						   			   for(var i=0, len=its.length; i<len; i++){
        						   				   var it=its[i];
        						   				   if(it.tp===12){
        						   					   var d=it.def;
        						   					  if(!mdl.attrs[it.did]){ 
        						           //these assigment reused several times in this model and need to be done in a function in the future.
        						   					     mdl.attrs[it.did]={
        						   								  "id":it.did,
        						   								  "name":it.n,
        						   								  "Relations":[],
        						   								  "Forms":[d.fms],
        						   								  "IsNew":true,
        						   								  "IsDirty":false,
        						   								  "IsDeleted":false
    						   				              };
        						   					  }
        						   						 newone.AttrInfos[it.did]={
        						   								  "id":it.did,
        						   								  "AttID":it.did,
        						   								  "FrmID":d.fms.fm_c.e.fm.did,
        						   								  "TblID":tbl.did,
        						   								  "ClnID": d.bfms.bf_c.e.c.did,
        						   								  "Expr": '['+it.n+']',
        						   								  "IsNew":true,
        						   								  "IsDirty":false,
        						   								  "IsDeleted":false,
        						   								  "Format": "Text" //temp
        						   						  	};
        						   				   }
        						   				  if(it.tp===13){
        						   					  if(!mdl.fcts[it.did]){
        						   					     mdl.fcts[it.did]={
        						   								  "id":it.did,
        						   								  "name":it.n,
        						   								  "IsNew":true,
        						   								  "IsDirty":false,
        						   								  "IsDeleted":false,
        						   								  "Sum":true,
        						   								  "Count":false,
        						   								  "Max":false,
        						   								  "Min":false,
        						   								  "Variance":false,
        						   								  "Average":false
    						   				              };
        						   					  }
        						   						 newone.FactInfos[it.did]={
        						   								 "id":it.did,
        						   								 "FactID":it.did,				        	
        						   								 "TblID":tbl.did,
        						   								 "ClnID":it.def.c.did,
        						   								 "Expr": '['+it.n+']',
        						   								 "IsNew":true,
        						   								 "IsDirty":false,
        						   								 "IsDeleted":false,
        						   								 "Format": "Text"
        						   						 };
        						   				   }
        						   			   }
        						   			   callback.success({item: newone});
        					    			},
        					    			failure: function(res){
        					    				mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
        					    			}
	        					    	};
        							mdl.autoRecog(tbl.did ,cb3);
         						},
        						failure: function(res){ 
        							mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                				}
        					};        				
        					mdl.createTable(res.item.tbn, res.item ,cb2);
        				},
        				failure: function(res){ 
        					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
        				}
        		};
        		mdl.getColumnsForDBAddedTable(t, cb1);

    	    },
    	    
    	    addTables: function(dbtables,tr){ 
    	    	var mdl=this, length = dbtables.length, newones=[], count=0, tcount, t;
    	    	var sdbr=mdl.SelDBRoleID;
    	    	var cb3={
               		success:function(res){
    	    		     mdl.pts[sdbr][res.item.TblID] = res.item;
	               		newones[count]=res.item;
	           			count++;
	           		    //get current dbtable list, and update the flag for those dbtables
           				var dbr = sdbr, dbts = mdl.dbtbls[dbr];
           			 	if (!mdl.ProjectDBRoles[sdbr]) {
           			     	mdl.addProjectDBRole(sdbr);
           			 	} 	
           				if (dbts) {
           				     var tbn = res.item.tag && res.item.tag.tbn;
           				     dbts[tbn].sta = mdl.DSSCatalogStateFlags.DssCatalogStateDefault;
           				}
           				//mstrmojo.array.remove(mdl.ds,dbtables);
	           			if (count==length) {
	           				_hideWaitPage();
	           				mdl.set("tblsToAdd", newones);
	           				if(tr.items)
	           				     tr.removeSelectedItems();
	           				mdl.raiseEvent({name:"tblsChange"});
	           			}else {
	           				t = dbtables[count];
        	    	    	mdl.addTable(t, cb3);	
	           			}               			
               		},
               		failure:function(res){
               			_hideWaitPage();
       					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
       					count++;
                		}
               	};
    	    	_showWaitPage();
             	t = dbtables[0];
	    	  	mdl.addTable(t, cb3);
	    	   
    	    },        	   	    
        	
         /*   getDbrIDForTbl:function(tid){
            	for(var r in this.pts)
            		var tbls=this.pts[r];
            	    for(var t in tbls){
            	    	if(t===tid) return r;
            	    }
            },*/
        	getTableSampleData:function getTableSampleData(tid, callbacks){
        		if(!tid) return;
        		var mdl = this,
        		    rid=mdl.PrjTblDbr;
        		var flags = this.DssCatalogFlags.DssCatalogGetTableContent;
            	var tableparams = {taskId:'arch.catalogAction',dbrid:rid, dbtname: mdl.pts[rid][tid].name,flags: flags, rowlimit: 25};
            	var cb = {
            	       success: function(res){
	            		   //hide the wait page
	    	               _hideWaitPage();
	    	               
	    	           	var table= res.xrc.cas[0].tis[0].cnt;
	                    callbacks.success(table);
             		   },
             		   
             		   failure: function(res){
             			  //hide the wait page
	    	               _hideWaitPage();
             			  callbacks.failure(res);
             		   }
            	   };
            	   //show the wait page
        	       _showWaitPage();	
             	   if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
            	   mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
        	},
        	
        	createAttrRelation:function(aid, c, p, callbacks){ //c:array of children, p:array of parents
        		var mdl = this, 
        		    clen=c.length,
        		    plen=p.length,
        			params = {taskId:'arch.schemaManipulation',schemaid: this.SchemaInstanceID, manipulationtype: 16,objectid:aid};
        		if(clen===0&&plen===0) return;
        		if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
        		var cb1 = {
            	       success: function(res){
	    	               _hideWaitPage();
	                       callbacks.success();
             		   },
             		   
             		   failure: function(res){
             			  //hide the wait page
	    	               _hideWaitPage();
             			  callbacks.failure(res);
             		   }
            	   };
        		if(clen===0){
        	       _showWaitPage();	
        	       params.objectid2=p.join(',');
        	       params.objecttype=2;
            	   mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb1, params);
        		}
        		else if(plen===0){
        	       _showWaitPage();	
        	       params.objectid2=c.join(',');
        	       params.objecttype=3;
            	   mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb1, params);
        		}
        		else{
        			_showWaitPage();
        			var cb2={
            	       success: function(res){
	    	               params.objectid2=c.join(',');
        	               params.objecttype=3;
	                       mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb1, params);
             		   },
             		   failure: function(res){
             			  callbacks.failure(res);
             		   }
            	   };
        		   params.objectid2=p.join(',');
        	       params.objecttype=2;
            	   mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb2, params);
        		}
        	   },
        	
        	getIDForm:  function getIDForm(){
            	return this.IDFormID;
            },
     	    createMetric:function createMetric(sObjectName, fn, fct, t3, callback){
            	var mdl=this;   
               	if (!mdl.SchemaInstanceID)
            		return;
               	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, manipulationtype: 1, objecttype: 4, objectname: sObjectName, objectdef:t3};
            	var tablecb = {
            		success: function(res){
            		 					callback.success({item: res});
           							},
            		failure: function(res){ 
           								callback.failure( res);
           							}
                };
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb, tableparams);
    	    },
            saveProject: function SaveProject(cb){
             	var mdl=this;
            	var tableparams = {taskId:'arch.schemaInstanceAction', schemaaction: '5', schemaid:mdl.SchemaInstanceID};
           		var tablecb14 = {
            			success: function(res){
           							_hideWaitPage();
           							if (cb && cb.success) {
           							   cb.success();
           							}else{	
           							  alert('Project Saved');
           							}
           						},
            			failure: function(res){ mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); 
           							 _hideWaitPage();
           							}
            		};
           		_showWaitPage();
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb14, tableparams);
             },
            saveAndUpdate: function(cb) {
            	 var mdl=this;
            	 var cb = {
         			success: function(res){
    			        params =  {taskId:'arch.refreshEngineSchema'}; //refresh project schema 
				        var uptcb = {
				    	    success: function(res){
					            _hideWaitPage();
					            if (cb && cb.success) {
        							   cb.success();
        							}
						        alert('Project saved and Schema updated');
					        },
					        failure: function(res){
					           _hideWaitPage();
					    	   alert('Schema update failed. ' + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
					        }	
 						};	               							
 						_showWaitPage();
 	            		if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
 	            		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, uptcb, params);               							
        			},
         			failure: function(res){ mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); 
        			    _hideWaitPage();
        			}
                };
            	this.persistSchemaInstance(cb);            	 
            },	 
            createNFMetrics: function createNewFactMetrics(){
             	var mdl=this;
             	var rets=0;
             	var MetricsXML=null;
             	for(var it in mdl.fcts)
					{
						var fct=mdl.fcts[it];
						nm=fct.name;
						if (fct.IsNew){
								fct.IsNew=false;
								if (fct.Count){
									if(MetricsXML!=null)
										MetricsXML = MetricsXML + _constructMetricXML( "Count of " + nm,"Count",fct);
									else
										MetricsXML =_constructMetricXML("Count of " + nm,"Count",fct);	
								}
								if (fct.Average){
									if(MetricsXML!=null)
										MetricsXML = MetricsXML + _constructMetricXML("Avg of "+ nm,"Avg",fct);
									else
										MetricsXML =  _constructMetricXML("Avg of " + nm,"Avg",fct);
								}
								if (fct.Variance){
									if(MetricsXML!=null)
									MetricsXML = MetricsXML + _constructMetricXML("Variance of " + nm,"Variance",fct);
									else
										MetricsXML = _constructMetricXML("Variance of " + nm,"Variance",fct);
								}
								if (fct.Min){
									if(MetricsXML!=null)
									MetricsXML = MetricsXML + _constructMetricXML("Min of "+ nm,"Min",fct);
									else
										MetricsXML =_constructMetricXML("Min of " + nm,"Min",fct);
								}
								if (fct.Max){
									if(MetricsXML!=null)
									MetricsXML = MetricsXML + _constructMetricXML("Max of "+ nm,"Max",fct);
									else
										MetricsXML =_constructMetricXML("Max of " + nm,"Max",fct);
								}
								if (fct.Sum){
									if(MetricsXML!=null)
									MetricsXML = MetricsXML + _constructMetricXML("Sum of " + nm,"Sum",fct);
									else
										MetricsXML = _constructMetricXML("Sum of " + nm,"Sum",fct);
								}
								
						}
					}
            	return MetricsXML;
            },
            persistSchemaInstance:function persistSchemaInstance(cb){
             	var mdl=this;
             	var MetricsXML=null;	
             	if (!mdl.SchemaInstanceID) return;
            	_showWaitPage();
            	MetricsXML=mdl.createNFMetrics();
            	var resut = {
            			success: function(res){
             				mdl.saveProject(cb);
						},
						failure: function(res){ 
	           				mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));	           				
	          			}};	
            	if (MetricsXML) {
             	   mdl.createMetric(null, "Multiple Metrics", null , MetricsXML,resut);
            	}else{
            	   mdl.saveProject(cb);  //no need to create metrics
            	}  	            	
             },
            createSchemaInstance:function createSchemaInstance(){
            	var mdl=this;   
            	var tableparams = {taskId:'arch.schemaInstanceAction', schemaaction: '1'};
           		var tablecb = {
            			success: function(res){
            				mdl.set("SchemaInstanceID", res.siid);
           				},
            			failure: function(res){ 
           					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
          				}			
            		};

           		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb, tableparams);
            },
            deleteObject:function deleteObject(tp, id, callback){
            	var mdl=this;   
            	if (!mdl.SchemaInstanceID)
            		return;
            	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, objecttype:tp, manipulationtype: 2, objectid:id };           		      		
            	var tablecb = {
            			success: function(res){
            		        _hideWaitPage(); 
            		        var trgt, objs=res['mi']['in'].oi;     
							switch (tp)
							{
							case  12:
								trgt=mdl.attrs;
								if (trgt[id]) {
									delete trgt[id];
								}
								for(var r in mdl.pts){
									var tbls=mdl.pts[r];
								  for(var i=0,len=objs.length;i<len;i++){
									if(objs[i].tp===15){
									   var obj=objs[i];
								       for(var t in tbls){
										  var tbl=tbls[t];
										  if(obj.did===tbl.TblID) delete tbl.AttrInfos[id];
										}
									}
								}
							  }
								mdl.raiseEvent({name:"FactNameChange", value:null, did:id});
							    break;
							case  13:
								trgt=mdl.fcts;
								if (trgt[id]) {
									delete trgt[id];
								}
							    for(var r in mdl.pts){
									var tbls=mdl.pts[r];
									for(var i=0,len=objs.length;i<len;i++){
									  if(objs[i].tp===15){
										 var obj=objs[i];
								         for(var t in tbls){
										    var tbl=tbls[t];
										    if(obj.did===tbl.TblID) delete tbl.FactInfos[id];
										 }
									}
								 }
							    }
							    mdl.raiseEvent({name:"AttrNameChange", value:null , did:id});
							    break;
							case  15:
								trgt=mdl.tables;								
								mdl.set("SelTableID", "");
								var tn = trgt[id].n, dbts = mdl.dbtbls[mdl.PrjTblDbr], tbn = trgt[id].tag.tbn ;
								//todo add the logic to check which DBRole this table is coming from.
								if (dbts[tbn]) {
									dbts[tbn].sta = mdl.DSSCatalogStateFlags.DssCatalogStateFresh; //reset the dbt state to fresh
								}
								if (trgt[id]) {
									delete trgt[id];
								}
								
							    break;	
							}
							callback.success(res);
							
            	       },
            			failure: function(res){
							_hideWaitPage();
							callback.failure(res);
           				}
            		};
            	_showWaitPage();	
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb, tableparams);
            },
            createObject:function createObject(tp, n, cln, callback){
            	var mdl=this;   
            	if (!mdl.SchemaInstanceID)
            		return;
            	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, objecttype: tp, manipulationtype: 1, objectname: n};
           		var trgt;
           		var ele;
            	var tablecb = {
            			success: function(res){
            				            _hideWaitPage();
           								switch (tp)
           								{
           								case 12:
           									ele=res.mi.schml.schm[res.mi.schml.schm.length-1].oi;
               								if (!ele) ele= res.mi.schml.schm.oi;
            								var attr={
    						   						"id":ele.did,
    						   						"name":ele.n,
    						   						"Relations":[],
    						   						"Forms":[],
    						   						"IsNew":true,
    						   						"IsDirty":false,
    						   						"IsDeleted":false
    						   				};
    						   				mdl.attrs[ele.did] = attr;
    						   				ele.clnid = cln;
    						   				ele.id = ele.did;
    						   				callback.success(ele);
    						   				return;
           								    break;
           								case 13:
           									ele=res.mi.schml.schm[res.mi.schml.schm.length-1].oi;
               								if (!ele) ele= res.mi.schml.schm.oi;
               								var fact={
						   						"id":ele.did,
						   						"name":ele.n,
						   						"IsNew":true,
						   						"IsDirty":false,
						   						"IsDeleted":false,
						   						"Sum":true,
								            	"Count":false,
								            	"Max":false,
								            	"Min":false,
								            	"Variance":false,
								            	"Average":false
    						   				};
               								mdl.fcts[ele.did]=fact;
               								callback.success(ele);
               								return;
           								    break;
           								case  15:
           									
           								break;	
           								}
           								ele=res.mi.schml.schm[res.mi.schml.schm.length-1].oi;
           								if (!ele) ele= res.mi.schml.schm.oi;
           								trgt[ele.did]=ele;
           								callback.success(ele);
           								
           							},
            			failure: function(res){
            				            _hideWaitPage();
           								callback.failure(res);
           							}
            		};
            	 _showWaitPage();	
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb, tableparams);
            },
            renameObject:function renameObject(id, tp, newName,evt,callback){
            	var mdl=this;   
            	if (!mdl.SchemaInstanceID)
            		return;
            	var tableparams = {taskId:'arch.schemaManipulation', schemaid: this.SchemaInstanceID, objectid:id, objecttype: tp, manipulationtype: 3, objectname: newName};           		
            	var tablecb = {
            			success: function(res){
            		        _hideWaitPage();	 
							switch (tp){
							case 12:
							    attres=res.mi["in"].oi;
							    var oldvalue = mdl.attrs[attres.did].name;
								mdl.attrs[attres.did].name=attres.n;
								if(evt)
								   mdl.raiseEvent({name:"AttrNameChange", value:attres.n, did:attres.did, oldvalue:oldvalue});
								if (callback && callback.success) {
								    callback.success(res);
								}
							    break;
							case  13:
								 var o=res.mi["in"].oi;
	                             mdl.fcts[o.did].name=o.n;
	                             if(evt)
	                                 mdl.raiseEvent({name:"FactNameChange", value:o.n, did:o.did});
	                             if (callback && callback.success) {
	                                    callback.success(res);
	                             }
	                             break;
							case  15:
								 var t=res.mi["in"].oi[0];
	                             mdl.pts[mdl.PrjTblDbr][id].name=newName;	        
	                             if (callback && callback.success) {
	                                 callback.success(res);
	                             }
	                             if(evt)
	                             mdl.raiseEvent({name:"TableNameChange", value:newName, did: id});
							    break;	
							}     
							return;
           				},
            			failure: function(res){
           					_hideWaitPage();	 
           					if (callback && callback.failure){			
           						callback.failure(res);
           					}
           				}	
           					
            		};
            	 _showWaitPage();	
        		if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, tablecb, tableparams);
            },           	
        
            getColumn:function getColumn(cID){
        		for (lIterator=0;lIterator <this.clns.length;lIterator++)
        			{
        			var cln=this.clns[lIterator];
        			if (cln.ClnID==cID)
        				{
        				return cln;
        				}
        			}
        	},
        	getTable:function getTable(tID){
        	    for(var r in this.pts){
        	    	var tbls=this.pts[r];
        	        for(var tid in tbls){
        	        	if(tid===tID)
        	        		return tbls[tid];
        	         }
        	        }
        	},
        	getFact:function getFact(fid){
        		return this.fcts[fid];            	
            },
            
            getJoinsForAttr:function(tbl,aid){
                 var items= [],
            		 rs = this.pts, 
            		 attrinfos; 
                 for (var r in rs) {
            		   var  idx=mstrmojo.array.find(this.dbrs,'did',r),
            		    	ts=rs[r];
            		   for(var tid in ts){
            			   if (tid != tbl.TblID) {
            		    		attrinfos = ts[tid].AttrInfos;
            		           if (attrinfos[aid]){
	            		    	    var table = '<table style="width:200px; border-collapse:collapse;border-spacing=0px;table-layout: fixed;"> <tr>'
		                              +'<td style="overflow:hidden;text-overflow:ellipsis;padding-right:2px;">'+ts[tid].name+'</td>'
		                              +'<td style="overflow:hidden;text-overflow:ellipsis;">' + attrinfos[aid].Expr + '</td></tr></table>';
	            		    	    items.push({ tp:15,tbn : ts[tid].name , exp : attrinfos[aid].Expr, n: table});
            		           }
            			   }
            		   }
                 }
                 return items;
            },
            getJoinsForTable: function(tbl, aid, callbacks) {
            	var mdl = this;
            	var cb = {
            		success: function (res) {
            			var attrs=mdl.attrs, items=[], idx=0;
            			  if(aid){
            				  items[0]={tp:12, n:attrs[aid].name, did:aid, items: mdl.getJoinsForAttr(tbl,aid)};
            			  }
            			  else{
            				        tgtinfos = tbl.AttrInfos;
	            		    	    for (var at in tgtinfos){
	            		    	    	var its=mdl.getJoinsForAttr(tbl,at);
	            		    	    	if(its.length>0)
	            		    	    	items[idx++]=({tp:12, n: attrs[at].name, items:its});
	            		    	    }
            		    		}
                        callbacks.success(items);
            	    },
            	    failure: function(res){ 
            	    	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
            	    }                    
            	};		
            	cb.success();
             }, 	
        
             getAttributesFactsInTable: function getAttributesFactsInTable(tbl, callbacks){
            	 var result=[],tid=tbl.did;
                 if (tid){
	                	 var table=this.getTable(tid);
	                	 if (table.isNew) {
		                	 var attrInfo, attribute,factInfo, fact;
		                	 for (var aid in table.AttrInfos) {
		                		 attribute=this.getAttribute(aid);
		                		 result.push( {n: attribute.name, id: attribute.id, t:12} );
		                	 }
		                	 for (var fid in table.FactInfos) {
		                		 fact=this.getFact(fid);
		                		 result.push( {n: fact.name, id: fact.id, t:13} );
		                	 }   
		                	 if(callbacks.success){
			            		   callbacks.success({items: result });   
			            	 }
	                	 }else{
	                		    var mdl=this,tn=tbl.n;
		                         // var params = {taskId:'arch.search', schemaid: this.SchemaInstanceID, objecttypes: '12,13', uses: tid  + ',15'};
		                		  var params = {taskId:'arch.search', schemaid: this.SchemaInstanceID, namepattern: tn, objecttypes: 15 };
		                          var cb = {
		                        		success: function(res){
		                        			var cb1={
		                        					success: function(res){
		                        						var pid=mdl.getTable(tid),
		                        						    attInfos=pid.AttrInfos,
		                        						    fctInfos=pid.FactInfos,
		                        						    cols=pid.tag.Columns,
		                        						    afs=res.oi;
	                        						  for(var i=0,len=afs.length; i<len;i++){
	                        								var af=afs[i];
	                        								result.push({n:af.n,id:af.did,t:af.tp});
	                        							   if(af.tp===12){
	                        								 var attInfo={
		                        						    		id:af.did,
		                        						        	AttID:af.did,
		                        						        	name:af.n,
		                        						        	FrmID:mdl.IDFormID,
		                        						        	TblID:pid,
		                        						        	//"ClnID": cmid,
		                        						        	//"Expr": expr,
		                        						       		IsNew:true,
		                        						    		IsDirty:false,
		                        						    		IsDeleted:false,
		                        						    		Format: "Text"
		                        							    };
	                        								 attInfos[af.did]= mdl.attrs[af.did]=attInfo;
	                        							
	                        							}
	                        							 if(af.tp===13){
	                        								    var factInfo={
	                        								    		id:af.did,
	                        								        	FactID:af.did,				        	
	                        								        	TblID:pid,
	                        								        	name:af.n,
	                        								        	//ClnID: cmid,
	                        								        	//Expr: expr,
	                        								       		IsNew:true,
	                        								    	    IsDirty:false,
	                        								    		IsDeleted:false,
	                        								    		Format: "Text"
	                        									    };
	                        								    mdl.fcts[af.did]=fctInfos[af.did]=factInfo;
		                        							}
	                        							 if(af.tp===26){
	                        								 cols.push(af);
		                        						}
	                        						}
		                        						if(callbacks&&callbacks.success){
		    		                        		 	    callbacks.success({items:result});
		                        						}
		                        					},
		                        					failure: function(res){
		    		                       				mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); 
		    		                       			}
		                        				};
		                        			 
		                                     var params = {taskId:'arch.search', schemaid: mdl.SchemaInstanceID, objecttypes: '12,13,26', uses: pid+ ',15' };
		                                     if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
		                                     mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb1, params);
		                       			},
		                        		failure: function(res){
		                       				mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); 
		                       			}
		                            };
                                     
		                    		if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
		                    		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
		                	 }
                }    		 
           },
            
            getAttribute:function getAttribute(id){
             	return this.attrs[id];   //TODO replace with call to search attributes by ID
            },
         /*   processTableChanges:function prcsChanges(atts,fcts){
            	for (var latt=0;latt<atts.length;latt++)
            	{
            		var att=atts[latt];
            		if (att.dirty==true)
            		{
             		}
            	}
            	for (var lfct=0;lfct<fcts.length;lfct++)
            	{
            		var fct=fcts[lfct];
            		if (fct.dirty==true)
            		{
             		}
            	}
            },*/
            
            createProject: function (pname,callback){
         		var createp_params = {taskId:'arch.createProject',name:pname};
        		var createpcb = {
        			success: function(res){
        			       if (callback){callback(); _hideWaitPage(); } },
        			failure: function(res){
        				 _hideWaitPage();
        				 mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
        		};
        	     _showWaitPage();
        		if (mstrApp.sessionState !== undefined){createp_params.sessionState = mstrApp.sessionState; }
        		
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, createpcb, createp_params);
         },


            deleteProject: function(pid,callback){
            	/*var $NIB = mstrmojo.Button.newInteractiveButton;
                mstrmojo.confirm("Are you sure?", 
                		[
                		 	$NIB(mstrmojo.desc(1442,"OK"), function yes()
        				        { */   
        				            	var dbrparams = {	taskId:'arch.deleteProject', 
        				            						projectid:pid
        				            					};
        				        		var dbrcb = {
        				        				success: function(res){ _hideWaitPage(); if (callback){callback();} },
        				        				failure: function(res){ _hideWaitPage(); mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
        				        		};
        				        		_showWaitPage();
        				        		if (mstrApp.sessionState !== undefined){
        				        			dbrparams.sessionState = mstrApp.sessionState;
        				        		}
        				        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, dbrcb, dbrparams);
        				    /*    }, null),
                           $NIB(mstrmojo.desc(221,"Cancel"), null, null )
                      ]);*/
            },
 
      
            renameProject: function( pid, oid, callback){
         	      var pn=new mstrmojo.Editor({ 
  	    		       title: "Rename Project",
  	    		       cssText:"width:250px;",
  	    		     children: [
  	    	         {//Name label
  	    	             scriptClass:"mstrmojo.Label",
  	    	             cssText: "font-weight:bold; width:100%; padding: 5px;",
  	    	             alias: "nameinfo",
  	    	             text: "New Project Name:"
  	    	         },

  	    	          {//	Project name
  	    	           scriptClass: "mstrmojo.TextBox",
  	    	           alias: "txtname",
  	    	           cssText: "width:200px;"
  	    	        	
  	    	          },

  	    	           { // buttons
  	    		       scriptClass : 'mstrmojo.HBox',
  	    		       cssClass : 'mstrmojo-Editor-buttonBox',
  	    		       slot : 'buttonNode',
  	    		       children : [ 
  	    		           {//OK
  	    			        scriptClass : "mstrmojo.HTMLButton",
  	    			        cssClass : "mstrmojo-Editor-button",
  	    			        cssText:"float:right;",
  	    			        text : mstrmojo.desc(1442, "OK"),
  	    			        onclick : function(evt) {
  	    				         var e = this.parent.parent;
  	    				         var ret = true;;
  	    				         if (e.onOK) { ret = e.onOK(); }
  	    				         if (ret) { e.close();}
  	    		
  	    				var renp_params = {taskId:'arch.renameObject', objectid:pid, objecttype: oid, objectname:e.children[1].value};
  	    				var renpcb = {
  	    		    				success: function(res){  _hideWaitPage();if (callback){callback();}},
  	    					        failure: function(res){
  	    		    					 _hideWaitPage();
  	    		    					 mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
  	    		    			};
  	    		    		
  	    		    			 _showWaitPage();
  	    		     			if (mstrApp.sessionState !== undefined){renp_params.sessionState = mstrApp.sessionState; }
  	    		     			
  	    		     			mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, renpcb, renp_params);
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
        	      pn.open();
  	   
         },
         
   	  validateExpr: function validateExpr(params, callbacks){
        	 var me=this;          
        	 var taskParams =  {
                  taskId:'arch.Parse',
                  schemaid: this.SchemaInstanceID,                 
                  exp:params.expr,
                  tbls:this.SelTableID,
                  sessionState: mstrApp.sessionState
               };
        	    if (params.vo==1) taskParams.vo=1;
        		var cb={
        				success:function(res){
        			    _hideWaitPage();
        			       if ( callbacks&&callbacks.success)
        			            callbacks.success(res);
        		                          }, 
        		          failure:function(res){
        		                _hideWaitPage();
        		           		  if ( callbacks&&callbacks.failure)
        		           			       callbacks.failure(res);
        		              mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));	  
        		                          }
        		        };
        		     _showWaitPage();
                  mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, taskParams);
         }, 
          
         exprEditor:function(obj) {
  	        var id = "ARExp", 
  	        fcts = null,
  	        openME = function(oi){
  	            var ae = mstrmojo.all[id];
  	            if(!ae){
  	               ae = new mstrmojo.Architect.ExpressionEditor({id:id, oi: oi});
  	            } else {
  	                ae.set('oi',oi);
  	            }
  	            _hideWaitPage();   
  	            ae.open();
  	        },
  	        failure = function(res){
  	        	_hideWaitPage();        
  	            mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
  	        },                
  	        fsuccess = function(res){
  	            try {
  	                if(obj){
  	                	if(obj.EXP){
  	                		  obj.n=obj.AL;
   	                          obj.tks={tkn:[{isNew: true, v:obj.EXP, oi:{cmid:obj.cmid, DT:obj.DT}}], vs: 0, vm: ''};
  	                	}
  	                	else{
  	                		  obj.n='New '+(obj.TP===12?'Attribute':'Metric')+' Expression';
  	                	      obj.tks={tkn: [], vs: 0, vm: ''};
  	                	}
  	                	openME(obj);
  	                } 
  	            } catch (ex) {}    // swallow.
  	        };
  	       _showWaitPage();
  	       this.getFunctions({success: fsuccess, failure: failure}); 
  	   },
  	   
       getFunctions: function getFunctions(callbacks){
           var me = this,
               fcts = this.functions || window.sessionStorage && window.sessionStorage.getItem('functions');
           
           if(fcts){
               fcts = _sortFunctions(eval('(' + fcts + ')').fncs);
               callbacks.success(fcts);
           } else {
               var cb = {failure: callbacks.failure, textResponse: true},
                   taskParams =  {
                       taskId:'getSystemFunctions',
                       includeFunctionDetails: false,
                       functionFlags: 2,
                       sessionState: mstrApp.sessionState
                   };
               
               cb.success = function(res){
                   //caching
                   if(window.sessionStorage){
                       window.sessionStorage.setItem('functions', res);
                   }      
                   me.functions = res; 
                   
                   fcts = _sortFunctions(eval('(' + res + ')').fncs);

                   callbacks.success(fcts);
               };
               mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, taskParams);
           }                    
       },
       getSuggestFunctions: function getSuggestFunctions(callbacks){
           var me = this,
               sf = this.suggestedFunctions;
           if(sf&&sf.length>0){
                callbacks.success(sf);
               return;
           } else {
           	 var cb={
           	    success: function(res){
                      var sf=new Array();
                      for(var k=0, len=res.length; k<len; k++){
                      	  for(var i=0, len2=func_cat.length; i<len2; i++)
                  	           if(res[k].n.indexOf(func_cat[i])>-1) {
                  	        	   sf=sf.concat(res[k].fns);
                  	               break;
                      	  }
                      }
                         me.suggestedFunctions=sf;
                         _hideWaitPage();
                         callbacks.success(sf);
           	   },
           	   failure: function(){mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));}
           	  };
           	_showWaitPage();
              this.getFunctions(cb);
           }
          },
  	   
       getFunctionCatList: function getFunctionCatList(){
           if(this._functionCatList){
               return this._functionCatList;
           }
           
           var fcts = this.functions || window.sessionStorage && window.sessionStorage.getItem('functions');
           
           if(!fcts){
               mstrmojo.alert("We shall not reach this point!");
           }
           
           fcts = _sortFunctions(eval('(' + fcts + ')').fncs);
           
        
           fcts = mstrmojo.hash.make(fcts,mstrmojo.Arr);
           
           this._functionCatList = fcts;
           
           return fcts;
       },
  	 
  	 
  	 
            postCreate: function (){
            	this.layers[_DEFAULT_LAYER_ID] = new Object();
            	this.layers[_DEFAULT_LAYER_ID].name = _DEFAULT_LAYER_NAME;
            	this.layers[_DEFAULT_LAYER_ID].id = _DEFAULT_LAYER_ID;
            	this.layers[_DEFAULT_LAYER_ID].tables = new Object();
            },	
            init: function init(props) {
                this._super(props);
                if (!this.features) {
                    this.features = new mstrmojo.Model();
                }
                this.ondefnChange();
            },
            ondefnChange: function ondefnChg(){},

        	/***********************************************************************************************
        	* 												Enumerations
        	***********************************************************************************************/

            DSSObjectType:
            	{
            		"DSSObjectTypeFact"       :13,
            		"DSSObjectTypeAttribute"  :12,
            		"DSSObjectTypeTable"      :15
            	},
           
            DSSSchemaUpdateFlag: {
                "Load"   :1,
        	    "Unload" :2,
                "Reload" :3
            }
        }
    );
})();