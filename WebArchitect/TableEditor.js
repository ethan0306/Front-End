(function(){
    mstrmojo.requiresCls(
    		"mstrmojo.Editor",
    		"mstrmojo.Label", 
    		"mstrmojo._HasContextMenu",
    		"mstrmojo.MenuButton",
    		"mstrmojo.WidgetListMapper"
    		);

    var $D=mstrmojo.dom,
        mdl=mstrmojo.all.ArchModel,
        idFrm="",
        TableEditorActions=
	    	{
	        NoAction : 0,
	        ConvertAttributeToFact : 1,
	        ConvertAttributeToForm: 2,
	        ConvertFactToAttribute : 3,
	        RemoveAttribute: 4,
	        RemoveFact: 5,
	        SetAsLookUp: 6,
	        RenameAttribute: 7,
	        RenameFact:8,
	        AddAttribute: 9,
	        RemoveAttributeInfo: 10,
	        AddFact: 11,
	        RemoveFactInfo: 12,
	        UpdateFormat:13
	    	},
       _formats=[
	                  {n: "Text", did: "tp"},
	                  {n: "Number", did: "tp"},
	                  {n: "Date", did: "tp"},
	                  {n: "Time", did: "tp"},
	                  {n: "DateTime", did: "tp"},
	                  {n: "URL", did: "tp"},
	                  {n: "Email", did: "tp"},
	                  {n: "HTML Tag", did: "tp"},
	                  {n: "Symbol", did: "tp"},
	                  {n: "Big Decimal", did: "tp"},
	                  {n: "Phone Number", did: "tp"}
                  ];
    /***********************************************************************************************
     * 												Functions
     ***********************************************************************************************/
    /*******************************************************************************
     * Name:      getFormName
     * Purpose:   Calculate the form name
     * Assumes:
     * Returns:   
     * History:   08/25/2011 JAGR Created
     ********************************************************************************/
    function getFormName(FRMNo, CN){
    	switch (FRMNo){
    	case 0: return "ID";
    	break;
    	case 1: return "DESC";
    	break;
    	default:
    		return CN;
    	break;
    	}
    }
    
   function getGUIRow(o1,o2,tp){
    	switch (tp){
    	case 12: 
    		 var FrmNo=0;
		     if(o1.Forms) 
		        FrmNo=getAttributeFormNo(o2.FrmID, o1);
    		return {
		   				 did: o2.id,
	      				 inUse:true,
	     				 TP:12,
	     				 OID:o2.id,
	     				 dirty:true,
	        	         EXP: o2.Expr,
	        	         AL: o1.name,
	        	         ORAL:o1.name,
	        	         FRM: o2.FrmID,
	        	         FRMNo: FrmNo,
	        	         DT: o2.Format,
	        	         LKUP:false,
	        	         cmid: o2.ClnID
		   			};
    	case 13: 
    		return {
        				TP: 13,        			
        				did: o2.id,
        				dirty: true,
	            	    EXP: o2.Expr,
	            	    AL: o1.name,
	            	    ORAL:o1.name,	            	     
	            	    DT: o2.Format,
	            	    Sum:o1.Sum,
	            	    Count:o1.Count,
	            	    Max:o1.Max,
	            	    Min:o1.Min,
	            	    Variance:o1.Variance,
	            	    Average:o1.Average,
	            	    cmid: o2.ClnID
	   			};
    }
   }
    
    /*******************************************************************************
     * Name:      getDataTypeValue
     * Purpose:   REturn the correct data type enum value
     * Assumes:
     * Returns:   
     * History:   08/25/2011 JAGR Created
     *******************************************************************************/
    function getDataTypeValue(dt){
    	switch(dt){
	     case "Text":return 3;
	     break;
	     case "Number": return 2;
	     break;
	     case "Date": return 8;
	     break;
	     case "Time": return 9;
	     break;
	     case "DateTime": return 1;
	     break;
	     case "URL": return 5;
	     break;
	     case "Email": return 6;
	     break;
	     case "HTML Tag": return 7;
	     break;
	     case "Symbol": return 10;
	     break;
	     case "Big Decimal": return 11;
	     break;
	     case "Phone Number": return 12;
	     break;
    	}
    }

    
    /*******************************************************************************
     * Name:      hideContextButtons
     * Purpose:   Hide both (facts and attribute data grid) context buttons
     * Assumes:
     * Returns:   
     * History:   08/25/2011 JAGR Created
     ********************************************************************************/
    function hideContextButtons(){
    		var st=mstrmojo.all.CtxMnuBtn.domNode.style;
    		if(st.visibility==='visible') { st.top='0px';st.visibility='hidden';}
    }
    
     
    /*******************************************************************************
     * Name:      showContextButton
     * Purpose:   show the data grid's context button on the correct location
     * Assumes:
     * Returns:   
     * History:   08/25/2011 JAGR Created
     ********************************************************************************/
    function showContextButton(evt, src)
    {
    	    var elem = $D.eventTarget(window, evt.e),
     		    cmb=mstrmojo.all.CtxMnuBtn,
     		    st=cmb.domNode.style;
     		if(elem.innerText==="Object Name"){
				     var p=$D.position(elem),
				         p2=$D.position(src.domNode),
				         tp=p.y-p2.y,
				         lf=p.x-p2.x+elem.clientWidth-25;
				         cmb.data={ttl:true};
     			         st.left=lf+'px';
				         st.top=tp+'px';
				         st.visibility='visible';
     		}
     		else{
     		     var node=elem.childNodes?elem.childNodes[0]:elem;
     		       w=$D.findWidget(node);
			       if(w&&w.slot==='slot1')
			      {  
				         cmb.data=w.data;
				         src.tIdx=w.idx;
				         var n=w.domNode,
				         p=$D.position(n),
				         p2=$D.position(src.domNode),
				         tp=p.y-p2.y,
				         lf=p.x-p2.x+n.clientWidth-25;
				         st.left=lf+'px';
				         st.top=tp+'px';
				         st.visibility='visible';
			     }
			else
				{
				    hideContextButtons();   
				}
     		}
	}
  

    /*******************************************************************************
     * Name:      addNextAvailableForm
     * Purpose:   add the next available form to be mapped
     * Assumes:
     * Returns:   
     * History:   08/25/2011 JAGR Created
     ********************************************************************************/
    function addNextAvailableForm(att, ele, callBack)
    {
    	var localCount=att.Forms.length,
         	mdl=mstrmojo.all.ArchModel,
    		retVal={
    				success: function(res){    					
    					callBack.success(localCount);
					},
					failure: function(res){ 
						mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
					}
    		};
    		var frmID=mdl.frms[localCount].FrmID;
    		var fmt=getDataTypeValue(ele.DT);
    		var frmname = getFormName(localCount,ele.AL);  //get form name
    		//todo the column id is null
    		mdl.addAttributeForm(att.id, frmID, ele.cmid, ele.EXP ,mdl.SelTableID, null, null, null,fmt , 1, 1, frmname, null ,retVal);
		//}
    }
    
    /*******************************************************************************
     * Name:      getAttributeFormNo
     * Purpose:   given attributeformid and attribute, return form index
     * Assumes:
     * Returns:   
     * History:    
     ********************************************************************************/
    function getAttributeFormNo(sID, attr){  
    	
     	 for (var lv=0; lv<attr.Forms.length;lv++){
    		  var fms=attr.Forms[lv];
    		 var form = fms.fm_c.e[lv]? fms.fm_c.e[lv] :fms.fm_c.e;
     		 if (form.fm.did==sID)
    		 {
    			 return lv;
    		 }
    	 }
     	 return 0;
     }
    
    /*******************************************************************************
     * Name:      processAction
     * Purpose:   perform all the actions in the model
     * Assumes:
     * Returns:   
     * History:   08/25/2011 JAGR Created
     ********************************************************************************/
    function processAction(evt)
    {  
    	var mdl=mstrmojo.all.ArchModel;
     	if (!mdl.SchemaInstanceID)
    	             return;
     	var src=mstrmojo.all.aflist,
     	    ele =src.items[src.tIdx],
     	    dbtbl=mstrmojo.all.dbtable,
     	    col=dbtbl.selectedItem,
     	    tid=mdl.SelTableID;
    	var mnret={
    			success: function(res){
      				performGUIAction(evt,src,ele,res);
    			},
    			failure: function(res){ 
    				mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
    			}
    	};
     	switch (evt)
	    {  
	    	case TableEditorActions.NoAction:
	    	break;
	    	case TableEditorActions.UpdateFormat:
	    		var fmt=getDataTypeValue(ele.DT);
	    		var frmNm=getFormName(ele.FRMNo, ele.AL);
	    	    mdl.updateAttributeForm(ele.did, ele.FRM, ele.cmid, ele.EXP ,tid, null, null, null, fmt, 1, 1, frmNm, null ,mnret);
	    	break;
	    	case TableEditorActions.ConvertAttributeToFact:
	    		//if (ele.TP ==12 && ele.CH) var isAtt=true;
	    		var fact = mdl.findFactByName(ele.AL);
	    		mdl.convertAttributeToFact(ele.FRMNo, ele, fact, mnret);
	    	    break;
	    	case TableEditorActions.ConvertAttributeToForm:
	    		var deret={
	    				success: function(res){
	    			        ele.did = "";
	    			        var aid=ele.att.AttID,
	    					    att=mdl.getAttribute(aid);
	    					deret2={
	    		    				success: function(res){
		    							ele.FRMNo=res;
		    							ele.did = aid;
	    								mdl.addAttributeInfo(res, aid, ele.EXP, ele.cmid, tid, mnret);
	    							},
	    							failure: function(res){ 
	    								mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	    							}
	    		    		};
	    					addNextAvailableForm(att, ele, deret2);
	    				},
	    				failure: function(res){
	    					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	    				}
	    		};
	    		mdl.removeAttributeInfo(ele.FRMNo, ele.did, tid, deret);
	    	break;
	    	case TableEditorActions.ConvertFactToAttribute:
	    		var attr = mdl.findAttributeByName(ele.AL);
	    		var fmt=getDataTypeValue(ele.DT);
	    		var frmname = getFormName(0, ele.cmid); 
	    		mdl.convertFactToAttribute(ele, attr, fmt , 1, 1, frmname, mnret);
	    		 
	    	break;
	    	case TableEditorActions.RemoveAttribute:
	    		mdl.deleteObject(ele.TP, ele.did, mnret);
	    	break;
	    	case TableEditorActions.RemoveFact:
	    		mdl.deleteObject(ele.TP, ele.did, mnret);
	    	break;
	    	case TableEditorActions.SetAsLookUp:
	    		mdl.setAsLookUp(ele.did, ele.FRMNo,tid, mnret);
	       	break;
	    	case TableEditorActions.RenameFact:
		    	  var cb ={
					        	 success: function(res){
					        		     rn.close();
				    			    	 mnret.success();	
					        			},
					        			failure: function(res){ 
				        					rn.error.set('text',res.getResponseHeader('X-MSTR-TaskFailureMsg'));
					        			}
					        		};		    		
	    		   mdl.renameObject(ele.did,13,ele.nn,true, cb);
		       	break;	
	    	case TableEditorActions.RenameAttribute:
	    		var cb ={
					        	 success: function(res){
					        		     rn.close();
				    			    	 mnret.success();	
					        			},
					        			failure: function(res){ 
				        					rn.error.set('text',res.getResponseHeader('X-MSTR-TaskFailureMsg'));
					        			}
					        		};		    		
	    		   mdl.renameObject(ele.did,12,ele.nn,true, cb);
	       	    break;	
	    	
	    	case TableEditorActions.AddAttribute:
		    			   var cbattr ={
					        			success: function(res){
				    			    		var aid = res.did;
				    			    		mdl.aIdx=1;
		    			    		        var formcb = {
		    			    		            success: function(res){			    			    		        	
								    			    	mdl.addAttributeInfo(0, aid, '['+col.cln+']',col.did, tid, mnret);  
		    			    		            },
		    			    		            failure: function(res){
		    			    		            	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); 
		    			    		            }		
		    			    		        };
		    			    	        	mdl.addAttributeForm(aid, mdl.IDFormID, col.did, '['+col.cln+']' ,tid, null, null, null, mdl.EnumDSSBaseFormType.DssBaseFormText, 1, 1, "ID", null ,formcb);  //hardcode ID form name 
		    			    			
					        			},
					        			failure: function(res){ 
				        					if(res.getResponseHeader('X-MSTR-TaskFailureMsg').indexOf("The schema already contains a Attribute object with name")>0){
				        						 mdl.createObject(12, col.cln+'('+mdl.aIdx+')', col.did, cbattr);
				        						 mdl.aIdx++;
				        					}
				        					else mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
					        			}
					        		};
		    			        mdl.aIdx=1;
		    			    	mdl.createObject(12, col.cln, col.did, cbattr);
	    		break;
	    	case TableEditorActions.RemoveAttributeInfo:
	    		if (ele.FRMNo === 0){    		
	    		    mdl.removeAttributeInfo(ele.FRMNo, ele.did,tid, mnret);
	    		}else {
	    			var frmcat = mdl.frms[ele.FRMNo].FrmID;
	    			mdl.removeAttributeForm(ele.did, frmcat, mnret);
	    		}	
	    		break;
	    		
	    	case TableEditorActions.AddFact:
		    			    	var cbfact ={
					        			success: function(res){
				    			    		var fid = res.did;
				    			    		mdl.fIdx=1;
				 		    			    mdl.addFactInfo(fid,'['+col.cln+']',col.did, tid, mnret); 
					        			},
					        			failure: function(res){ 
					        			 if(res.getResponseHeader('X-MSTR-TaskFailureMsg').indexOf("The schema already contains a Fact object with name")>0){
				        						 mdl.createObject(13, col.cln+'('+mdl.fIdx+')', col.did, cbfact);
				        						 mdl.fIdx++;
					        			 }
					        			 else mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); 	
					        			}
					        		};
		    			        mdl.fIdx=1;
		    			    	mdl.createObject(13, col.cln, col.did, cbfact);
	    		break;
	    		
	    	case TableEditorActions.RemoveFactInfo:
	    		mdl.removeFactInfo(ele.did, tid, mnret);	    		
	    		break;		
	    }
     }
    
     /*******************************************************************************
     * Name:      performGUIAction
     * Purpose:   perform the gui action
     * Assumes:
     * Returns:   
     * History:   08/25/2011 JAGR Created
     ********************************************************************************/
    function performGUIAction(evt,grid,ele,res)//grid is the datagrid
    {    	
        var  mdl=mstrmojo.all.ArchModel,
    	    tbl=mdl.getTable(mdl.SelTableID);
     	switch (evt){
   		case TableEditorActions.ConvertAttributeToFact:
   	    case TableEditorActions.AddFact:
   			{
	   			var fact = mdl.getFact(res.id),
	   				row =getGUIRow(fact,res,13),
	   				idx=grid.tIdx;
	   		     if(evt===TableEditorActions.ConvertAttributeToFact){
	   				grid.removeSelectedItems();
	   			    grid.add([row],idx);}
	   		     else  grid.add([row]);
	    	    break;
   			}
   		case TableEditorActions.ConvertFactToAttribute:
   		case TableEditorActions.AddAttribute:
   			{
		   			var aid = res.id,
		   			    attr = mdl.getAttribute(aid),
		   			    row =  getGUIRow(attr,res,12),
		   			    idx=grid.tIdx;
		   	   if(evt===TableEditorActions.ConvertFactToAttribute){
	   				grid.removeSelectedItems();
	   		        grid.add([row],idx);
		   	   }
		   	   else grid.add([row]);
		      break;
   			}
   		case TableEditorActions.SetAsLookUp: 
   			{
   			   ele.dirty=true;
			   ele.LKUP=true;
			   grid.render();
			break;
   			}
   		case TableEditorActions.ConvertAttributeToForm:
   			{
 			ele.AL=ele.att.n + "@desc";
			ele.ORAL=ele.att.n;
			ele.dirty=true;
			ele.LKUP=false;
			var idx=ele.att.idx,
			    att=grid.items[idx];
			att.AL=att.AL+"@ID";
			grid.removeSelectedItems();
	   	    grid.add([ele],idx+1);
			break;
   			}
   	
   		case TableEditorActions.RemoveAttribute:
   		case TableEditorActions.RemoveAttributeInfo:
   		case TableEditorActions.RemoveFact:
   		case TableEditorActions.RemoveFactInfo:
   			{
   			  grid.removeSelectedItems();
   			  break;
   			}
   		case TableEditorActions.RenameAttribute:
   		case TableEditorActions.RenameFact:{
   			 ele.AL=ele.nn;
   			 delete ele.nn;
   			 grid.render();
   		}
   		}
     } 
 

    
    /**
    * Menu Items for the fact context menu
    * 
    */
    var _menuItems=[
                          {
	    					"did": "NewAttr",
		      				"n": "New Attribute"	
	                       },
                    
                          {
	    					"did": "NewFct",
		      				"n": "New Metric"	
	                       },
                          {
	    					"did": "Edit",
		      				"n": "Edit"	
	                       },
	                       {
	    					"did": "Delete",
		      				"n": "Delete"	
	                       },
	                       {
	    					"did": "RmvInfo",
		      				"n": "Remove from Table"	
	                       },
	                       {
	    					"did": "Rename",
		      				"n": "Rename"	
	                       },
	                       {
	                    	 "did": "ToAttr",
		      				 "n": "ToAttribute"	
	                       },
	                        {
	                    	 "did": "ToMetric",
		      				  "n": "ToMetric"	
	                       },
	                       {
	       					"did": -1,
	   	      				"n": "-"	
	                         },
	                       {
	       					"did": "LookUp",
	   	      				"n": "Set as LookUp"	
	                       },
	                       {
	       					"did": "Form",
	   	      				"n": "Set as Form ",
	   	      				"fns":[{did:'1', n: '1'}],
	                    	onContextMenuOpen: function(){
	               			   var va=[],
	               			   	   lCounter=0,
	               			       IDFormID=mstrmojo.all.ArchModel.IDFormID,
	               			       grid=mstrmojo.all.aflist,
	                 			   its=grid.items,
	                 			   ele =its[grid.tIdx];
	                			for (var lc=0,len=its.length; lc < len ; lc++){
 	               				   var o=its[lc];
	                 				if (o.TP===12&&o.did!=ele.OID&&IDFormID===o.FRM)
	               				{
	               				     va[lCounter++]=
	                					{
	                					  "did": "Form",
	                      			      "n": o.AL	,
	                      			      "AttID":o.OID,
	                      			      "idx":lc
	                      		 		};
	               				}
	                      	 	}
	                			if(this._subMenu){
	                				var sm = this._subMenu;
	                				sm.set('items', va);
	                				
	                			} 
	                        }
	                       },
	                       {
	       					"did": "Agg",
	   	      				"n": "Aggregation",
	   	      				"fns":[{"did": "Sum","n": "Sum"},{"did": "Count","n": "Count"},{"did": "Max","n": "Max"},{"did": "Min","n": "Min"},
	                               {"did": "Variance","n": "Variance"},{"did": "Average","n": "Avg"}]
	                        },
	                       {"did":"Dtp",
	                        "n":"Data Type",
	                        "fns": _formats}
	                  ];      
    

    
 var rn=new mstrmojo.Editor({ 
	 cssText: "width:250px;",
	 children: [
                          {//Name label
                        	  scriptClass:"mstrmojo.Label",
                        	  cssText: "font-weight:bold; width:100%; padding: 5px;",
                        	  alias: "nameinfo",
                        	  text: "New Name: "
                          },
                          {//	Project name
                        	  scriptClass: "mstrmojo.TextBox",
                        	  alias: "txtname",
                        	  cssText:"width:200px;"
                          },
                          
                          {//Error label
                        	  scriptClass:"mstrmojo.Label",
                        	  cssText: "width:100%; padding: 5px;",
                        	  alias: "error",
                        	  text: ""
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
                        	            		  if (e.onOK) { ret = e.onOK(); }
                        	            		 var aflst= mstrmojo.all.aflist;
                        	            		  aflst.items[aflst.tIdx].nn=e.txtname.value;
                        	            		  processAction(e.evt);
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
                          ],
              onOpen:function(){
            	  this.txtname.set('value',this.n);
            	  this.set('title',(this.tp===12?'Attribute: ':'Fact: ')+this.n);
            	  this.evt=(this.tp===12?TableEditorActions.RenameAttribute:TableEditorActions.RenameFact);
              }
 		});
    /**
    * Attributes context menu button
    */
    var MnuBtn={ 
  			scriptClass: "mstrmojo.MenuButton",
  			cssClass: "mstrmojo-Editor-button function",
     		id: "CtxMnuBtn",
          	cssText: "position:absolute;z-index:40; height:20px; width:15px; left:370px;visibility:hidden; border:0px solid; background-color:#FFFFFF",
           	iconClass: "mstrmojo-ArchitectToolbarIcon link",
    		itemIdField: 'did',
  			itemField: 'n',
         	text:"",
         	data:null,
  			itemChildrenField: 'fns',
  			searchItemAdded: true,
  			dynamicUpdate:true,
    		queryVisible: function(item){
        	    var d = this.data;
        	    switch (item.did) {
        	    	case 'ToMetric': 
        	    	case 'LookUp':
        	    	case 'Form':
        	    	case 'Dtp':
    		            return d.TP===12;
    		        case 'ToAttr': 
        	    	case 'Agg':
        	    	    return d.TP===13;
        	    	case 'NewAttr':
        	    	case 'NewFct':
        	    		return d.ttl;
        	    	case 'Edit':
        	    	case 'Delete':
        	    	case 'RmvInfo':
        	    	case 'Rename':
        	    		return d.TP;
    		      default: 
    			   return true;
        	   } 
            },
           queryChecked: function queryChecked(item){
    			    return this.data[item.did]||(this.data.DT===item.n);
    		}, 
   			executeCommand: function(item){
    		   var  mdl=mstrmojo.all.ArchModel,
    		        aflst=mstrmojo.all.aflist,
    			    idx=aflst.tIdx;
    			    if(!aflst.selectedIndices[idx])
    			         aflst.set("selectedIndex",idx);
    			switch(item.did)
				{   case "NewAttr":
					       if(!mdl.SelTableID){
				 		       	   alert("You have to select one project table first!");
				 		       	   return;
				 		       	    }
		 		          mdl.exprEditor({TP:12});
		 		          break;
		 		    case "NewFct":
					       if(!mdl.SelTableID){
				 		       	   alert("You have to select one project table first!");
				 		       	   return;
				 		       	    }
		 		          mdl.exprEditor({TP:13});
		 		          break;
      				case "Edit":
					{
						    var obj=this.data;
						    obj.idx=idx;
		        	        mdl.exprEditor(obj);
						    break;
					}
      				case "Delete":
      				{   var tp;
      					if(this.data.TP===12) tp=TableEditorActions.RemoveAttribute;
      				    else tp=TableEditorActions.RemoveFact;
      				    	processAction(tp);
      				    break;
      				}
      				case "RmvInfo":
      					{
      					var tp;
      					if(this.data.TP===12) tp=TableEditorActions.RemoveAttributeInfo;
      				    else tp=TableEditorActions.RemoveFactInfo;
      				    	processAction(tp);
      				    break;
      					}
      					
      				case "Rename":
      					{
      					rn.tp=this.data.TP;
      					rn.n=this.data.AL;
      					rn.open();
      				    break;
      					}
      					
      				case "ToAttr":
      					{
      					processAction(TableEditorActions.ConvertFactToAttribute);
      					break;
      					}
      				case "ToMetric":
      					{
      					   processAction(TableEditorActions.ConvertAttributeToFact);
      					   break;
      					}
      				case "LookUp":
					{
		    			processAction(TableEditorActions.SetAsLookUp);
		    			break;
					}
					
					case "Form":
					 {
						aflst.items[idx].att=item;
 		    		    processAction(TableEditorActions.ConvertAttributeToForm);
 		    		    break;
					}
					 case "tp":
					 {
						aflst.items[idx].DT=item.n;
 		    		    processAction(TableEditorActions.UpdateFormat);
 		    		    break;
					}
      				default:
					{
 		    			var ele=aflst.items[idx];
						var fct=mdl.getFact(this.data.did);
							if (ele[item.did]){
								ele[item.did]=false;
								fct[item.did]=false;
							}
							else{
								ele[item.did]=true;
								fct[item.did]=true;
							}
							break;
					}
				}
   			},
  			postCreate: function(){
  			  var me = this.parent.parent;
  			  this.cm = _menuItems;
  			}
		};

    /**

    */
    var DataGrid=
    			{ 
	          	scriptClass: "mstrmojo.DataGrid",
		        id: "aflist",
		        cssClass: 'mstrmojo-Architect-ColumnMapping-Headline',            
		        cssText: "background-color:white; border:5px solid #C6C6C6; height:370px;width:700px;cursor:pointer;",
		        alias:"aflist",
                itemDisplayField: 50,
                multiSelect:true,
              //  dropZone: true,
                draggable:true,
                items:6,
                markupString: '<div id="{@id}" class="mstrmojo-DataGrid {@cssClass}" style="{@cssText}" mstrAttach:mousedown,mouseup,mousemove>'
                              + '<div class="mstrmojo-DataGrid-headerContainer">{@headerHtml}</div>'
                              + '<div class="mstrmojo-DataGrid-itemsScrollBox" style="position:relative;" >'
                              + '<div class="mstrmojo-DataGrid-itemsContainer" style="{@itemsContainerCssText}" >{@itemsHtml}</div>'
                              + '<div class="mstrmojo-ListBase2-dropCue"><div class="mstrmojo-ListBase2-dropCue-inner" mstrAttach:mouseover></div></div>'                        
                              + '</div>'
                              + '</div>',
		       onmousemove: function (evt){
    					    	showContextButton(evt, this);
    					    },          
			    itemFunction: function(item, idx, w){
	                var c = new mstrmojo.DataRow({
	                    columns: w.columns,
	                    data: item,
	                    idx: idx,
	                    dataGrid: w,
	                    draggable: true,
	                    cssClass:'mstrmojo-di-datapreview-DataRow-text',
	          	        postCreate:function(){
			          	      var css=(item.TP===12?" Attribute":" Metric");
			          	      this.cssClass+=css;
	          	        },	 				   
	                    ondragstart: function(ctxt) {
	    			    	var w = ctxt.src.widget;
	    			    	if (w && w.data&&w.data.TP===12){	    			    	   
	    			    	        return true
	    			    	}
	    			    	return false;
	                    },
	                    getDragData: function getDragData(ctxt){
	                    	var w = ctxt.src.widget;
	                    	if (w && w.data&&w.data.TP===12){
	                            w.data.html ='<span class="mstrmojo-ArchitectJoinList t'+12+ '" style="width:150px;background-color:white;padding:2px 0px 0px 20px;">'+w.data.AL+'</span>'; 
	    			    		return w.data;
	                    }
	                  }
	                });
	                return c;
	            },
    			    					    
		        columns:[
	          	         {
          	         		dataWidget:{ 
			          	        	 	scriptClass: "mstrmojo.Label",
			          	        	    cssText:'font-weight:bold;',
			          	         		postCreate:function(){
			          	         			var d=this.data;
						          	           if (d.LKUP)
						          	         		this.cssText='font-weight:bold;';
						          	           else
						          	         		this.cssText='font-weight:normal;';	
						          	           this.set('text', d.EXP);
			          	         					}
			          	         		},
          	         	    dataField:'EXP', 
          	         	    headerText: 'Expression', 
          	         	    colCss: 'uidCol',
          	         	    colWidth: '300'
 	          	         	},
	          	         	{
	          	         	dataWidget:{
	          	         				scriptClass:"mstrmojo.Label",
	          	         				cssClass:"mstrmojo-Architect-Objname",
	          	         				postCreate:function(){
	          	         					      var d=this.data,
			          	         		              css=(d.TP===12?" Attribute":" Metric");
			          	         		          this.cssClass+=css;
							          	         		if (d.LKUP)
						          	         				this.cssText='font-weight:bold;';
						          	         			else
						          	         				this.cssText='font-weight:normal;';	
						          	         			if (!d.FRM||d.FRM===idFrm)
							          	         			this.set('text',d.AL);
							          	         		else
							          	         			{	
								          	         				if (d.AL.indexOf("@")===-1)
							          	         					{
								          	         					var dsc=mstrmojo.all.ArchModel.getFrmDescription(this.data.FRM);
							          	         						d.AL=d.AL + "@" + dsc;
							          	         						this.set('text',d.AL);
							          	         					}
								          	         			
							          	         			} 	          	         		                   
						          	       }
	          	         		         },
	          	         	headerText: 'Object Name', 
	          	         	colCss: 'uidCol',
	          	         	colWidth: '220'
	          	         	}
 	          	         	
		          	  ],
		     onchange: function (evt){
  		  	        	  if (this._super) {
  		  	        		  this._super();
  		  	        	  }
  		  	        	  var mdl = mstrmojo.all.ArchModel,
  		  	        	      it=this.items[this.selectedIndex];
  		  	        	  if(!it) mdl.set("SelAttrID", null);
  		  	        	  else if(it.TP===12)
  		  	        	      mdl.set("SelAttrID", it.did);
  		  	          }
  		  	          
    	        };
    var DBTable={ 
          	scriptClass: "mstrmojo.List",
          	id: "dbtable",
          	cssClass: 'mstrmojo-Architect-ColumnMapping-Headline',            
	        cssText: "background-color:white; border:5px solid #C6C6C6; height:350px;width:190px;cursor:pointer;",
    		multiSelect:true,
    		itemMarkupFunction: function(evt, data, info){
    			var name = evt.n,
    			    css=(data%2===0?'':'background-color: #C6C6C6;');
    			var s = '<div class="mstrmojo-DBRoleSelector-bullet" style="'+css+'" di=' + data + '>' +
    						'<span class="mstrmojo-ArchitectListIconBlock t' + evt.tp + ' st' + evt.stp + '"></span>' + 
    						name +
    					'</div>';
    			
    			return s;
    		}
    };
 
    /*
	 * <p>
	 * Widget that represents a DB Table
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Editor
	 */
    mstrmojo.Architect.TableEditor = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
     		// mixins
    		[ mstrmojo._HasContextMenu ],
    		{
    			scriptClass: "mstrmojo.Architect.TableEditor",
    			showDbt: true,
	   	        children: [
				    {
				 		          	scriptClass: "mstrmojo.HBox",
				 		          	cssText: "position:relative;height:95%; width:95%;margin-left:3px;",
				 		          	alias: "Content",
				 		          	children:[
				 		          	           {
								 		          	scriptClass: "mstrmojo.Box", 
								 		          	alias:"dbtbl",
								 		          	cssText: "position:relative;", 
								 		          	children:[
								 		          	        { 
																scriptClass : "mstrmojo.Label",
																cssText:"background-color:#C6C6C6; width:200px; font-weight:bold;line-height:20px;",
																text:"All Columns",
								 		         	        },
								 		          	 		DBTable,
								 		          	]          
				 		          	           },
				 		          	           {
								 		          	scriptClass: "mstrmojo.VBox",  
								 		          	alias:"arrow",
								 		          	cssText: "position:relative;margin-left:10px;margin-right:10px;", 
								 		          	children:[
											 		          	        	{ 
															 		          	scriptClass: "mstrmojo.Button",
															 		          	id: "btnAddAtt",
															 		          	cssText: "height:25px;margin-bottom:20px; text-align:center;vertical-align:center;",
															 		          	iconClass: "mstrmojo-ArchitectListIconBlock rightarrow",
															 		          	onclick: function(){
														 		          	        		processAction(TableEditorActions.AddAttribute);															 		          			
												 		          	        		}
														 		          	},
														 		          	{ 
															 		          	scriptClass: "mstrmojo.Button",
															 		          	id: "btnAddFct",
															 		          	cssText: "height:25px; text-align:center;vertical-align:center;",
															 		          	iconClass: "mstrmojo-ArchitectListIconBlock rightarrow",
															 		          	onclick: function(){																	 		          	
															 		          		processAction(TableEditorActions.AddFact);
															 		          		}
														 		          	}
											 		            ]         
								 		          	     
				 		          	           },
					 		          	       {
								 		          	scriptClass: "mstrmojo.VBox",     //VboxRight
								 		          	alias:"ltbl",
								 		            cssText: "position:relative;", 
								 		          	children:[
								 		          	         DataGrid,
								 		          	         MnuBtn
								 		          	]          
					 		          	       } 	          	            
				 		          	    ]
			 		         }   		    
		 		 ],
		
	             /**
				  * @populate the editor
				 */
	             populateEditor: function(){
 	                 var mdl=mstrmojo.all.ArchModel;
  	            	 idFrm=mdl.IDFormID;
  	            	 mdl.populateFormCategories();
  	            	 this.tbl=mdl.getTable(mdl.SelTableID);
  	            	 if (!this.tbl){  	     //make sure previous selections are wiped out        		
  	            	     mstrmojo.all.aflist.set("items", []);
  	            		 return;
  	            	 }
  	            	mstrmojo.all.SingleTableView.parent.parent.header.title.set("text",this.tbl.name);
  	            	 //we shall always reload the table since attribute and fact could be renamed etc
  	            	_usedColumns={};
  	            	this.populateAF(mdl);
	                this.populateColumns(mdl);
  	            	 
	             },
	             /**
				  * @populate the attributes section
				 */
	             populateAF: function (mdl){
	            	 var afs=[], attInfos,factInfos, idx = 0;
	            	 if (!this.tbl.AttrInfos&&!this.tbl.FactInfos) {
	            		 return;
	            	 }	            	 
	            	 attInfos=this.tbl.AttrInfos;
	            	 factInfos=this.tbl.FactInfos;
	            	 for (var id in attInfos) {
	            		 var attInfo= attInfos[id];
		            	 var att=mdl.getAttribute(attInfo.AttID);
		            	 afs[idx++]= getGUIRow(att,attInfo,12);
         	         }
	               	 for (var id in factInfos) {
	            		 var factInfo= factInfos[id];
		            	 var fct=mdl.getFact(factInfo.FactID);
		            	 afs[idx++]= getGUIRow(fct,factInfo, 13);
	            	 }	 
	            	 mstrmojo.all.aflist.set("items", afs);
	     	    	// mstrmojo.all.aflist.set("selectedIndex", 0);
	             },
	    
	             populateColumns: function(mdl) {	            
	            	 var cols = this.tbl.tag && this.tbl.tag.clis && this.tbl.tag.clis.cli, items=[];
	            	 if (cols) {
	            		 for (var i=0, len = cols.length; i<len; i++) {
	            			   var col=cols[i];
			                   items[i]={'did':col.cmid, 'cln': col.cln,  'n': col.cln+mdl.getColumnDataTypeString(col.dt), 'tp':26};
	            		 }
	            		 mstrmojo.all.dbtable.set('items',items);
	            	 }	 
	             },
	            preBuildRendering: function preBR(){ 
     			 	       mstrmojo.all.ArchModel.attachEventListener("SelTableIDChange",this.id, "populateEditor");
 	                         }
	           
	      
   		}
	    
	    );
})();