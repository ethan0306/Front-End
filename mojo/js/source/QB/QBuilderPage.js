(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Container",
        "mstrmojo._FillsBrowser",
        "mstrmojo._HasLayout",
        "mstrmojo._HasPopup",
        "mstrmojo.Box",
        "mstrmojo.Table",
        "mstrmojo.Button",
        "mstrmojo.QB.SplitPanel",
        "mstrmojo.QB.VSplitPanel",
        "mstrmojo.QB.QBuilderModel",
        "mstrmojo.QB.WHTablePanel",
        "mstrmojo.QB.QBPanel",
        "mstrmojo.QB.QBMappings"
         );
    
    mstrmojo.requiresDescs(218, 219, 221, 1154, 1442, 2211, 8116, 6189,1143,334,521,401,279,773,172, 9117,9118,9119,9111,9120,9121,9136,9112,9113,9116,9114,9115,8132); 

    var _C = mstrmojo.css;
    
    var _model = mstrmojo.all.QBuilderModel;
    if (!_model){
    	_model = new mstrmojo.QB.QBuilderModel({});
    };	
    
    function _getRedirectURL(rid){
    	var url = [];
    	url.push('mstrWeb?');
    	switch (mstrmojo.all.QBuilderModel.redirect) {
    	case 3: //create analysis
    		url.push('evt=3104&src=mstrWeb.3104&executionMode=1&rwDesignMode=0&objectType=3&objectID=');
    		url.push(rid);
    		url.push('&rwCreateFlags=16&rwViewMode=2048');
    		break;
    	case 2: //create document
    		url.push('evt=3104&src=mstrWeb.3104&executionMode=2&objectID=');
    		url.push(rid);
    		url.push('&objectType=3&rwDesignMode=1');
    		break;
    	case 1: //create report
    		url.push('iframe=true&evt=5005&src=mstrWeb.create.5005&selectedObjectID=');
    		url.push(rid);
    		url.push('&defaultevtlist=17004&evt=17004&src=mstrWeb.create.ObjectExplorer.17004');    		
    		break;
    	default:	
    		url.push('evt=3010');
    	}
    	
    	return url.join("");
    	
    };	
    
    function _saveTaskParams(me){
        var oi = me.oi,
            params = {
                taskId: 'qBuilder.SaveReportXDADefinition',
                messageid: mstrmojo.all.QBuilderModel.msgid,
                reportid: mstrmojo.all.QBuilderModel.riid,
                isCubeReport: mstrmojo.all.QBuilderModel.isCubeReport,
                sessionState: mstrApp.sessionState
            };
      
        return params;
    }
    
    
    function _saveAsCallback(me){
    	var scb = {
    	    success: function(res){
	    	 	var msgid = res.msgid;
	    		var rid = res.did;	
	    		var p = this.parent;
      
	    		mstrmojo.all.QBuilderModel.hideWaitPage();  //hide waiting dialog
	    		
	        	var message = mstrmojo.desc(7987,"The ## '###' has been saved successfully.").replace('##','Object').replace('\'###\'', '');
                if (p){
                    var desc = mstrmojo.all.QBuilderModel.isCubeReport? 'Cube' : 'Report';                    
                    message = mstrmojo.desc(7987,"The ## '###' has been saved successfully.").replace('##', desc).replace('###', p.name);
                }
                mstrmojo.confirm(message, [
                   mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, {  //Descriptor: OK
                       scriptClass: "mstrmojo.HTMLButton",
                       cssClass: 'mstrmojo-Editor-button',
                       cssText: 'width:72px;',
                       reportid: rid,
                       onclick: function(e) {  
                	       mstrmojo.all.QBuilderModel.showWaitPage(); 
    			           window.location=_getRedirectURL(this.reportid);                	
                       }
                })],mstrmojo.desc(7984,"Object Saved"));               
                 
                if(p){
                    p.close();
                }  
    	    },   
    		failure: function(res) {
    	    	mstrmojo.all.QBuilderModel.hideWaitPage();  //hide waiting dialog
    	    	var ec = parseInt(res.getResponseHeader('X-MSTR-TaskErrorCode'), 10) + 0x100000000,
                 p = this.parent;
                if (ec == 2147749923) {
                    mstrmojo.confirm(mstrmojo.desc(7986,"The ## '###' already exists. Do you want to replace the existing one?").replace('##',p.typeDesc || 'Object').replace('###', p.name),  
                    [mstrmojo.Button.newInteractiveButton(mstrmojo.desc(219), function(){p.saveAs(true);}, null, { //Descriptor: Yes
                        scriptClass: "mstrmojo.HTMLButton",
                        cssClass: 'mstrmojo-Editor-button',
                        cssText: 'width:72px;'
                    }), mstrmojo.Button.newInteractiveButton(mstrmojo.desc(218), null, null, { //Descriptor: No
                        scriptClass: "mstrmojo.HTMLButton",
                        cssClass: 'mstrmojo-Editor-button',
                        cssText: 'width:72px;'
                    })], mstrmojo.desc(3179)); //Descriptor: Confirm Overwrite
                } else {
                    mstrmojo.alert(mstrmojo.desc(7985,'Error while saving: ') + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                }
    	    }
    	};			
        return scb;
    }
    
    function _getReportName(model){
    	var tbns = model.tbns, name=[];
        for (var tbn in tbns) {
        	name.push(tbn);
        }	
    	name = name.join('_');
    	if (name=='') {
    		name = 'FFSQL';
    	}
    	return name.substring(0,252);
    }	
    
    
    var content = new mstrmojo.QB.SplitPanel({
		slot: 'layout',
		alias: 'main',		    
		children: [
		    new mstrmojo.QB.WHTablePanel({
           	    slot:"leftItem",
           	    _model:_model
            }),    
            new mstrmojo.QB.VSplitPanel({
             	slot:"rightItem" ,
             	cssText: "padding: 2px;border:2px solid #CCCCCC;background-color:#E5E5E5;border-radius:6px; -moz-border-radius:6px; -webkit-border-radius:6px;",
             	borderoffset: 2,
             	topP: 70, 
             	bottomItemVisible: false,
             	children: [ 
             	    {
     	 		        scriptClass: "mstrmojo.QB.QBPanel",
     	 		        slot: 'topItem'
     	 		    },
 	 		        {
      	 		        scriptClass: "mstrmojo.QB.QBMappings",
      	 		        slot: 'bottomItem'
      	 		    }     	 		       
 	 		    ],
     	 		layoutConfig: {
     	 	        w: {
     	 	            topItem: '100%',
     	 	            bottomItem: '100%'
     	 	        },
     	 	        h: {
     	 	           	topItem: '100%',
     	 	            bottomItem: '0%'
     	 	        }
     	 	    },     	 	
     	 	         
 	 	        onwidthChange: function(e){
 	 	        	 this.width = parseInt(e.value) - 8 + 'px';  //exclude padding 2px and border 2px
 	 	        	 if (this.domNode) {
 	 	        		this.domNode.style.width = this.width;
 	 	        	 } 	 
 	                 this.doLayout(); 
 	 	         }, 
 	 	         
     	 	    setDimensions: function(h,w){
     	 	    	 if (this.height !== h || this.width !== w) {
                         // Set new dimensions.
                         this.height = parseInt(h)-12+'px';
                         this.width = parseInt(w)-8 +'px';
                         
                         // Resize dom node.
                         var dn = this.domNode;
                         if (dn) {
                             dn.style.height = this.height;
                             dn.style.width = w;
                             
                             // Layout children.
                             this.doLayout();
                         }

                         return true;
                     }
                     
                     return false;
     	 	    },
 	 	         
 	 	         showDataPreview: function(e){
     	 	    	 if (this.domNode){
     	 	    	     this.width = this.domNode.style.width; 
     	 	    	 }	 
 	 	        	 this.set("bottomItemVisible", true);
 	 	        	 var toolbar = this.parent.parent.children[0]; 	 	        	
 	 	        	 _C.toggleClass(toolbar.children[2].domNode, "on", true);
 	 	         },	 
 	 	         
 	 	         postCreate: function(){
 	 	        	mstrmojo.all.QBuilderModel.attachEventListener("dataPreview",this.id, "showDataPreview"); 	 	           
 	 	         }	 
             })  
		]		                
	});   	
   
    var _rpItems=[  { 'did': '1', 'n': mstrmojo.desc(9117, "Replace existing data")},
                    { 'did': '4', 'n': mstrmojo.desc(9118, "Update existing data and add new data")},
                    { 'did': '2', 'n': mstrmojo.desc(9119, "Keep existing data and add new data")}];
    
    var ropt=new mstrmojo.Editor({
    	cssText:"background: white; width:270px;border: 10px solid rgba(0, 0, 0, 0.3); border-radius:5px; -moz-border-radius:5px;-webkit-border-radius:10px;",
     	showTitle: false,
     	zIndex:100,
     	onOpen:function(){
    	   var st= this.curtainNode.style
    	    st.background="black";
	        st.opacity=0.5; 
	        st.filter="alpha(opacity=50)"; //For Ie8
         },
        onClose:function(){
        	 mstrmojo.css.toggleClass(mstrmojo.all.QBuilderPage.children[0].children[4].domNode, "on", false);
         },
        children:[
                  {   
               	   scriptClass:"mstrmojo.Label",
               	   cssText:"padding:10px 10px 10px 20px;",
               	   text:mstrmojo.desc(9120, "Options - Data Refresh")
                  },
                  {   
               	   scriptClass:"mstrmojo.Label",
                 	cssText:"padding:0px 10px 20px 20px; color: blue;",
               	   text:mstrmojo.desc(9121, "Choose data refresh policy")
                  },
                  {
                      scriptClass:"mstrmojo.RadioList",
                      alias:"radiolist",
                      cssText:"padding-left:25px;",
                      itemCssClass: "mstrmojo-qb-radiolist-item",
                      items:_rpItems,
                      postBuildRendering: function(evt){
                	      this.singleSelectByField(mstrmojo.all.QBuilderModel.refresh_opt,'did');  
                      }
                  },
                  {// buttons
             	      scriptClass : 'mstrmojo.HBox',
             	      cssClass : 'mstrmojo-Editor-buttonBox',
             	      slot : 'buttonNode',
             	      children : [ 
             	           {//OK
             		        scriptClass : "mstrmojo.HTMLButton",
             		        cssClass : "mstrmojo-Editor-button",
             		        cssText:"width: 46px; float:right;",
             		        text : mstrmojo.desc(1442, "OK"),
             		        onclick : function(evt) {
             	        	    var e = this.parent.parent;
             	        	    mstrmojo.all.QBuilderModel.refresh_opt=e.radiolist.selectedItem.did;
             	        	   if (e.onOK) { e.onOK(); }
             	    			e.close();
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
                    ]
                     }
                  ] 
});
    
    
    mstrmojo.QB.QBuilderPage = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
 
        // mixins,
        [mstrmojo._FillsBrowser, mstrmojo._HasLayout, mstrmojo._HasPopup],
 
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.QB.QBuilderPage",
            
            markupString: '<div id="{@id}" class="mstrmojo-qb {@cssClass}" style="{@cssText}">' +
					            '<div class="mstrmojo-qb-toolbar"></div>' +
					            '<div></div>'+
					            '<div class="mstrmojo-qb-layout" style="width:100%;"></div>' +
					            '<div class="mstrmojo-qb-footer" style="width:100%;"></div>' +
					      '</div>',

			markupSlots: {
				toolbar: function(){ return this.domNode.firstChild; },
				layout: function(){ return this.domNode.children[2]; },
				conditionEditor: function(){ return this.domNode.secondChild;},
				footer: function(){ return this.domNode.lastChild; }
			},
			
			height: null,
			width: null,
			
	        id: 'QBuilderPage',   //fix ID for this mojo 
			
			reportID: null,
			msgID: '',
			
			onError: function(err) {
        		d = err.detail,
        		app = mstrmojo.App,
         		c = err.code;
        	
            },
            // ----------- This is general to all pages, if we have a page widget, we should move these logics there ----------//
            /**
             * Renders page loading error.
             */
            renderPageLoadError: function() {
            	var err = this.error;
            	// indivual page has a chance to update error object before being used to display;
            	this.onError(err);
            	
            	if (!err.btns || !err.btns.length) {
            		mstrmojo.alert(err.message, null, err.title);
            	} else {
            		mstrmojo.confirm(err.message, err.btns, err.title);
            	}
            },
            /**
             * Override render method to handle page loading error.
             */
            render: function() {
            	if (this.error) {
            		this.renderPageLoadError();
            	} else {
            		this._super();
            	}
            },
            
            saveasRef: {
                scriptClass:"mstrmojo.SaveAsEditor",
                typeDesc: "Report",
                browsableTypes: '3,8',  //report and folder
                onObjectSaved: function(o){
                    var p = this.opener,
                        oi = p && p.oi;
                    if(p && oi){
                        oi.did = o.did;
                        oi.n = o.name;
                        oi.desc = o.desc;
                        p.set('title', "QBReport: " + o.name);                       
                    }
                }
            },
            
			
            children: [
           			new mstrmojo.Table({
           				slot: 'toolbar',
           			    rows: 1,
	                    cols: 6,
	                    cssText: "width:100%",
	                    layout: [{cells: [{cssText: "left-padding:2px; width:28px;"}, {cssText: "width:28px;"},{cssText: "width:28px;"},{cssText: "width:28px"},{cssText: "width:28px"}, {cssText: "float:right;"}]}],
	                    children: [
		    	            {
		    			        scriptClass: "mstrmojo.Button",
 		    				    slot: "0,0",
		    				    active: true,
		    				    iconClass: "mstrmojo-QBToolbarIcon connectionview on",
		    				    title:mstrmojo.desc(9111,"Database View"),			   
		    				    onclick: function toggle(evt){
		    	            	    this.active = !this.active;
		    	            	    content.set("leftItemVisible", this.active);		    	            	
		    	            	    _C.toggleClass(this.domNode, "on", this.active);       		              
		    		            }						      
		    			    },  	 
		    			    {
	    					    scriptClass: "mstrmojo.Button",
	    					    slot: "0,1",	    					    
	    					    iconClass: "mstrmojo-QBToolbarIcon SQLview",
	    					    title: mstrmojo.desc(9112,"SQL View"),		   
	    					    onclick: function toggle(evt){
		    			    	    var SQL= content.children[1].children[0].SQL;
		    			    	    var v = !mstrmojo.all.QBuilderModel.autoRefreshSQL;
		    			    	    mstrmojo.all.QBuilderModel.set("autoRefreshSQL", v);
		    			    	    content.children[1].children[0].set("rightItemVisible", v);		    			    	    
		    	            	    _C.toggleClass(this.domNode, "on", v); 	
	    			            }						      
		    				},

		    				{
	    					    scriptClass: "mstrmojo.Button",
	    					    slot: "0,2",
	    					    iconClass: "mstrmojo-QBToolbarIcon viewtable",
	    					    title:mstrmojo.desc(9113,"Data Preview"),		   
	    					    onclick: function toggle(evt){
			    					var v = content.children[1].bottomItemVisible;
			    					if (!v) {
			    						mstrmojo.all.QBuilderModel.raiseEvent({name:"dataPreview"});  //this will trigger bottomPanel to show up
			    					}else {	
			    					    content.children[1].set("bottomItemVisible", false);  
			    					}
			    	 	        	_C.toggleClass(this.domNode, "on", !v); 
	    				        }
		    		        },
	                    	{
		        			    scriptClass: "mstrmojo.Button",
		        			    slot: "0,3",
		        				iconClass: "mstrmojo-QBToolbarIcon conditionview",
		        				title: mstrmojo.desc(6189,"Filter"),
		        				//prevstate: false,
		        				onclick: function(evt) {
		    		        	if(mstrmojo.all.QBuilderModel.dbtables.length===0) {
		    		        		 var $NIB = mstrmojo.Button.newInteractiveButton;
		    		        		 mstrmojo.confirm(mstrmojo.desc(9114,"Cannot add Filter without any Tables being added, please add some Tables first"), 
				                    	         [
				                    	             $NIB(mstrmojo.desc(1442,"OK"), function yes(){},null)
				                    	             ]);
                       		       return;
                       	       }
			    		        	mstrmojo.all.CE.show();
 		    		                _C.toggleClass(this.domNode, "on", true);                                                                       
 		        	            }  					      
		        			},	 
		        			{
		        			    scriptClass: "mstrmojo.Button",
		        			    slot: "0,4",
		        				iconClass: "mstrmojo-QBToolbarIcon refreshOption",
		        				title:mstrmojo.desc(9136,"Data Refresh Options"),
		        				onclick: function(evt) {
		        				    var o=mstrmojo.all.QBuilderModel.refresh_opt,
		        				        idx;
		        				    if(!o) o='1'; //default
		        				    if(o==='1') idx=0;
		        				    else if(o==='2') idx=1;
		        				    else idx=2;
		        				    ropt.radiolist.set('selectedIndex',idx); 
		        				    ropt.open();
		        				    _C.toggleClass(this.domNode, "on", true); 
 		        	            }  					      
		        			},
	                    	{
		    				    scriptClass: "mstrmojo.Button",
		    				    slot: "0,5",
		    				    iconClass: "mstrmojo-QBToolbarIcon help",		    				    
		    				    title: mstrmojo.desc(1143,"Help")		      
	                    	}
	                    ],
           			
           			
	           			enableFFSQL: function(e){
	           					var row=this.domNode.firstChild.firstChild;
	           					row.deleteCell(1);
	           					row.deleteCell(2);
	           			},	
	           			
	           			postCreate: function(){
	           				      mstrmojo.all.QBuilderModel.attachEventListener("isFFSQLChange",this.id, "enableFFSQL");
	           			}
	           		}),    //end toolbar
           			
                    content,
                    
                    new mstrmojo.Table({
                    	slot: 'footer',
           			    rows: 1,
	                    cols: 4,
	                    cssText: "width:100%;height:30px;background-color:#5D5E60;",
	                    layout: [{cells: [{cssText:""}, {cssText: "width:90px;padding-right:12px;"}, {cssText: "width:90px;padding-right:12px;"},{cssText: "width:30px;padding-right:20px;"}]}],
	                    children: [
                            {
   		    	            	scriptClass: "mstrmojo.Box", //dummy place holder for margin spacing
   		    	                slot: "0,0"
   		    	            },	                               
		    	            {
		    	            	scriptClass: "mstrmojo.Button",
                                cssClass : "mstrmojo-di-button cancel",
                                text:mstrmojo.desc(2140,"Cancel"),
                                slot: "0,1",                          
                          	    onclick: function (){
                              	   window.location='mstrWeb?evt=3010';
                              	     
		                        },
		                        onRender: function(){
		                        	if (mstrApp && mstrApp.isCloudPro) {
		                        	    _C.addClass(this.domNode, 'cloud');
		                        	    this.set('text', '');
		                        	}
		                        }           				
		    	            },
		    	            {
		    	            	scriptClass: "mstrmojo.Button",
                                cssClass : "mstrmojo-di-button publish",
                                text:mstrmojo.desc(172,"Publish"),
                                enabled: false,
                                slot: "0,2",                                
		                        onRender: function(){
			    	            	if (mstrApp && mstrApp.isCloudPro) {
		                        	    _C.addClass(this.domNode, 'cloud');
		                        	    this.set('text', '');
		                        	}
		                        }, 
                          	    onclick: function (){
			    	            	var me = this.parent.parent;
			    	            	var qb=mstrmojo.all.QBuilderModel;
			    	            	var cb2 = { 
			    	            	    success: function(){
			    	            		    if (qb.folderID) {  //if parentfolder specified, we save directly 
			    	            		    	var params = _saveTaskParams(me) || {};
			    	            		    	params.folderID = qb.folderID;
			    	            		    	params.name = _getReportName(qb);
			    	            		    	params.saveAsOverwrite = false;
			    	            		    	params.autoName = true;
			    	            		    	var cb = {
			    	            		    		success: function(res){
			    	            		    		    qb.showWaitPage(); 
			    	         			                window.location=_getRedirectURL(res.did); 
			    	            		    	    },
			    	            		    	    failure: function(res){
			    	            		    	    	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
			    	            		    	    }	
			    	            		    	}	
			                                        
			                                    qb.showWaitPage();  //show waiting dialog
			                                    mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
			    	            		    	return;
			    	            		    }	
		    	            	    	    //close current page and redirect to next page
			    	            	    	me.openPopup('saveasRef',{
			                                    zIndex: me.zIndex + 10, 
			                                    folderLinksContextId: 14,		                                   
			                                    name: mstrmojo.desc(9116,"New Report"),		                                    
			                                    saveParams: _saveTaskParams(me),
			                                    saveAsCallback:function(){ return _saveAsCallback(me);}, 
			                                    saveAs: function (overwrite) {
			                                        var panel = this.contPanel;
			                                        this.name = panel.name.value;
			                                        this.desc = panel.desc.value;                
		
			                                        if(!this.name){
			                                            mstrmojo.confirm( mstrmojo.desc(8114), [
			                                                              mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, { //Descriptor: OK
			                                                                  scriptClass: "mstrmojo.HTMLButton",
			                                                                  cssClass: 'mstrmojo-Editor-button',
			                                                                  cssText: 'width:72px;'
			                                                              })]);
			                                            return;
			                                        }			                                        
			                                        var params = this.saveParams || {};
			                                        params.folderID = this.ob.currentFolder.did;
			                                        params.description = this.desc || '';
			                                        params.name = this.name || '';
			                                        params.saveAsOverwrite = !! overwrite;
			                                        params.isCubeReport=qb.isCubeReport;
			                                        params.crb=qb.refresh_opt;
			                                        if (this.sId) {
			                                            params.sessionState = this.sId;
			                                        }
			                                        
			                                        var  cb = this.saveAsCallback();
			                                        cb.parent = this;
			                                        
			                                        qb.showWaitPage();  //show waiting dialog
			                                        mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
			                                    } 	
		                                    });
			    	            	    },
			    	            	    failure: function(){}
			    	            	}
			    	            	var cb3 = {
			    	            	    success: function(){
			    	            		    if (qb.isDirty){
			    	            		        qb.autoMap(cb2, true);
			    	            		    }else {
			    	            		    	cb2.success();
			    	            		    }	
			    	            	    },
			    	            	    failure: function(){}
			    	            	}			    	            	
			    	            	if (!qb.FFSQLMode) {
			    	            		if (qb.selectedClns.length === 0) {
								    	   	mstrmojo.alert(mstrmojo.desc(9131,'Please define at least one output mapping for this report.'));
			    	            		    return;
			    	            		}    
		    	            	        qb.saveTableLayout(cb3);			    	            		 
			    	            	}else {
			    	            		var tks= content.children[1].children[0].SQL.ffsql.ffbox.items;			    	            		
			    	            		if (tks && tks.length >0) {
			    	            			 var _getTokensAsString= function (its){
			    	            			        var sa = [],
			    	            			            i,j;
			    	            			        for(i=0,len = its.length;i<len;i++){
			    	            			        	if(its[i].v==='\n'||its[i].v==='\t')
			    	            			              sa[i] = ' ';
			    	            			        	else sa[i]=its[i].v;
			    	            			        }
			    	            			        return sa.join("");
			    	            			 }
			    	            			qb.editFFSQL(cb3, _getTokensAsString(tks));			    	            			
			    	            		}else {
			    	            			mstrmojo.alert(mstrmojo.desc(9131,'Please define at least one output mapping for this report.'));			    	            			
			    	            		}			    	            		 
			    	            	}	
		                        },
		                        enableButton: function(){                                     
		                        	this.set("enabled", mstrmojo.all.QBuilderModel.SelDBRoleID ? true: false);                                     
		                        },	
		                        postCreate: function(e){
		                        	mstrmojo.all.QBuilderModel.attachEventListener("dataPreview", this.id,"enableButton");
		                        }	
		    	            },
		    	            
		    	            {
	               	        	 scriptClass: "mstrmojo.MenuButton",
	               	        	 slot: "0,3",
	               	             iconClass: 'mstrmojo-ArchitectListIconBlock redirect',
	               	             postCreate: function(){
	               	        	     this.cm = [{ did: 3,	"n": mstrmojo.desc(8132,"Analysis")},
	               	        	                { did: 2,	"n": mstrmojo.desc(3345,"Document") },
	               	        	                { did: 1,	"n": mstrmojo.desc(1279,"Report")},
	               	        	                { did: 0,	"n": mstrmojo.desc(9115,"Exit") }
	               	        	               ];
	               	             },
	               	             dynamicUpdate:true,
	               	             queryChecked: function(item){
	               	            	 return (item.did == mstrmojo.all.QBuilderModel.redirect);
	               	             },		                    	             
	               	             executeCommand: function(item){
	               	            	 mstrmojo.all.QBuilderModel.redirect = item.did;
	               	             } 
               	            }        
           				],
           		   enableCloud: function(){
         				   this.children[3].set("visible", false);
         			 },
         		   postCreate: function(e){
         			   mstrmojo.all.QBuilderModel.attachEventListener("isCloudChange",this.id, "enableCloud");
                    }
                  })
           	],	
            
            layoutConfig: {
                h: {
                    toolbar: '30px',
                    layout: '100%',
                    footer: '30px'
                    
                },
                w: {
                    layout: '100%'
                }
            },

            initReportInst: function(rid, msgid, isff, isCloud, saveAsCube, folderID){         
            	_model.set("msgid",  msgid); 
            	_model.initReportInst(rid, isff, isCloud, saveAsCube, folderID, {success: function(){ content.children[0].load();}, failure: function(){} });
            },	
            
            browserResized: function browserResized(size) {
            	var nw = parseInt(size.w) - 15  + 'px';  //offset width 15px
            	var nh = parseInt(size.h) - 70 + 'px';  //offset height 70px
            	
            	if (this.height && nh !== this.height) {
            		this.set('height', nh);            		
            	}else {
            		this.height = nh;  //initialize
            	}	
            	
            	if (this.width && nw !== this.width) {
            		this.set('width', nw);
            	}else {
            		this.width = nw;  //initialize
            	}	
            	
            	return true;
            }
        }
    );
    
})();