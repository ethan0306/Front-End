(function(){

    mstrmojo.requiresCls(
        "mstrmojo._FillsBrowser",
        "mstrmojo._HasPopup",
        "mstrmojo.Box",
        "mstrmojo.Table",
        "mstrmojo.Button",
        "mstrmojo.QB.SplitPanel",
        "mstrmojo.QB.VSplitPanel",
        "mstrmojo.Architect.ArchitectModel",
        "mstrmojo.Architect.WHTablePanel",
        "mstrmojo.TabContainer",
        "mstrmojo.Architect.LogicalTableSelector",
        "mstrmojo.Architect.SingleTableView",
        "mstrmojo.Architect.TablePreview",
        "mstrmojo.Architect.MultiTableView",
        "mstrmojo.Architect.ExpressionEditor"
         );
    
    mstrmojo.requiresDescs(218, 219, 221, 1154, 1442, 2211, 8116, 6189,1143,334,521,401,279,773,172, 9117,9118,9119,9111,9120,9121,9136,9112,9113,9116,9114,9115,8132); 

    var _C = mstrmojo.css;
    
    var _model = mstrmojo.all.ArchModel;
    if (!_model){
    	_model = new mstrmojo.Architect.ArchitectModel({});
    };	
    
    var content = new mstrmojo.QB.SplitPanel({
		slot: 'layout',
		alias: 'main',
		children: [
		    new mstrmojo.Architect.WHTablePanel({
           	    slot:"leftItem",
           	    _model:_model
            }),    
            new mstrmojo.QB.SplitPanel({
             	slot:"rightItem" ,
             	cssText: "padding: 2px;border:2px solid #CCCCCC;background-color:#E5E5E5;border-radius:6px; -moz-border-radius:6px; -webkit-border-radius:6px;",
             	borderoffset: 2,
             	children: [ 
             	    {
     	 		        scriptClass: "mstrmojo.Architect.LogicalTableSelector",
     	 		        slot: 'leftItem'
     	 		    },
 	 		        {
      	 		        scriptClass: "mstrmojo.Box",
      	 		        slot: 'rightItem',
      	 		        children:[
      	 			         {       
		 		                scriptClass: "mstrmojo.Table",
		 		                alias: "header",
		 		                rows: 1,
		 		                cols: 4,
		 		                sIdx:0,
		 		                layout: [{cells: [{cssText: "padding-left:2px; width:20px;"},{cssText:"padding-left:2px;width:20px;"},{cssText: "padding-left:2px;width:20px;"},{cssText: "margin:auto;"}]}],	 		        	
		 		                cssClass: "mstrmojo-Architect-Panel-header subheader",
		 		                children: [
		 		                     {
		 		                    	 scriptClass: "mstrmojo.Button",
		 		                    	 slot: "0,0",
		 		                    	 iconClass: "mstrmojo-ArchitectToolbarIcon full on",
		 		                    	 title:mstrmojo.desc(9111,"Database View"),			   
		 		                    	 onclick: function toggle(evt){
		 		                    		 var p=this.parent;
		 		                    	     if(p.sIdx===0) return;
		    	            		 	    mstrmojo.all.ArchModel.raiseEvent({name:'ToggleDBtable', tp: 0});	    	            	
		    	            		 	    _C.toggleClass(this.domNode, "on", true);  
		    	            		 	    _C.toggleClass(p.children[p.sIdx].domNode, "on", false);
		    	            		 	    p.sIdx =0;
		 		                    	 }						      
		 		                     },
		 		                     {
		 		                    	 scriptClass: "mstrmojo.Button",
		 		                    	 slot: "0,1",
		 		                    	 iconClass: "mstrmojo-ArchitectToolbarIcon grid",
		 		                    	 title:mstrmojo.desc(9111,"Database View"),			   
		 		                         onclick: function toggle(evt){
		 		                        	 var p=this.parent;
		 		                    	     if(p.sIdx===1) return;
		    	            		 	     mstrmojo.all.ArchModel.raiseEvent({name:'ToggleDBtable', tp:1});	    	            	
		    	            		 	    _C.toggleClass(this.domNode, "on", true);  
		    	            		 	    _C.toggleClass(p.children[p.sIdx].domNode, "on", false);
		    	            		 	    p.sIdx=1;
		 		                    	 }						      
		 		                     },
		 		                     {
		 		                    	 scriptClass: "mstrmojo.Button",
		 		                    	 slot: "0,2",
		 		                    	 iconClass: "mstrmojo-ArchitectToolbarIcon show",
		 		                    	 title:mstrmojo.desc(9111,"Database View"),			   
		 		                    	 onclick: function toggle(evt){
		 		                        	 var p=this.parent;
		 		                    	     if(p.sIdx===2) return;
		    	            		 	     mstrmojo.all.ArchModel.raiseEvent({name:'ToggleDBtable',tp:2});	    	            	
		    	            		 	    _C.toggleClass(this.domNode, "on", true);  
		    	            		 	    _C.toggleClass(p.children[p.sIdx].domNode, "on", false);
		    	            		 	    p.sIdx=2;
		 		                    	 }						      
		 		                     },
		 		                     {
		 		                    	 scriptClass: "mstrmojo.Label",
		 		                    	 cssText:"text-align: center;",
		 		                    	 slot: "0,3",
		 		                    	 alias:"title",
		 		                    	 onclick:function(evt){
		 		                    		 var mdl=mstrmojo.all.ArchModel;
		 		                    		     mdl.SelAttrID=null;
		 		                    		     mstrmojo.all.aflist.set('selectedIndex',-1);
		 		                    	 }
		 		                     }
		 		                ]
		 		             },
      	 					 {
      	                         scriptClass: "mstrmojo.Box",
      	                         alias:'content',
      	                         children: [
      	                                    {
      	                                       scriptClass: "mstrmojo.Architect.SingleTableView",
      	                                       alias:"tbl",
      	                                       id:"SingleTableView"
      	                                	 },
      	                                	 {
      	                	 		            scriptClass: "mstrmojo.Architect.TablePreview",
      	                	 		            alias:"data",
      	                	 				    id:"ARTablePreview"
      	                	 			     }
      	                	 							/*	{
      	                	 									scriptClass: "mstrmojo.Architect.MultiTableView",
      	                	 									id:"ARsysDim"
      	                	 								}*/], 
      	                	     preBuildRendering: function preBR(){ 
     			 	                        mstrmojo.all.ArchModel.attachEventListener("ToggleDBtable",this.id, "toggleDBtable");
 	                             },
 	                             toggleDBtable:function(evt){
 	                            	   if(evt.tp===2){
  	            			                   this.data.domNode.style.display='block';
  	            		                       this.tbl.domNode.style.display='none';
  	            		                   }
 	                            	   else{
 	                            		    var t=this.tbl,
 	                            	 	    st=t.domNode.style;
  	            		            	   	st.display='block';
  	            		            	   	this.data.domNode.display='none';
  	            		               	        
  	            		                     var c=mstrmojo.all.tableEditor.Content,
  	            		                      st1=c.dbtbl.domNode.style,
  	            		                      st2=c.arrow.domNode.style;
				 		                   if(evt.tp===1){
				 		       	                    st1.display=st2.display='none';
				 		       	                         }
				 		                   else{
				 		       	                    st1.display=st2.display='block';
				 		                        }
      	 					             }
 	                             }
      	 					 }
      	 			       ],
      	 	         onwidthChange: function(e){
      	 	    	   var w=this.width = parseInt(e.value),
      	 	    	       c=this.content;
 	 	        	   if (this.domNode) {
 	 	        		               this.domNode.style.width = this.header.domNode.style.width=c.data.domNode.style.width=w+'px';
 	 	        		               c.tbl.set('width',w-10+'px');
 	 	        	    }
 	 	        	   else
 	 	        		   c.tbl.width=w-10+'px';
 	 	        		   
 	 	            },  
 	 	         onheightChange: function(e){
 	 	        	    var h=this.height,
 	 	        		    c=this.content;
 	 	        	 if (this.domNode) {
 	 	        		 this.domNode.style.height=c.data.domNode.style.height=h;
 	 	        		 c.tbl.set('height',h);
 	 	        	 } 	
 	 	        	 else
 	 	        		 c.tbl.height=this.height;
 	 	            }
 	 	       	 }
 	 		   ]
 	 	 
          })  
		]		                
	});   	
   
    mstrmojo.Architect.ArchitectPage = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
 
        // mixins,
        [mstrmojo._FillsBrowser, mstrmojo._HasLayout, mstrmojo._HasPopup],
 
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.Architect.ArchitectPage",
            
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
			
	        id: 'ArchPage',   //fix ID for this mojo 
			
			//reportID: null,
			//msgID: '',
			
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
            
          /*  saveasRef: {
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
            },*/
            
            children: [
           			new mstrmojo.Table({
           				slot: 'toolbar',
           			    rows: 1,
	                    cols: 6,
	                    cssText: "width:100%",
	                    layout: [{cells: [{cssText: "left-padding:2px; width:28px;"}, {cssText: "width:28px;"},{cssText: "width:28px;"},{cssText: "padding-left:50px; width:28px"},{cssText: "width:28px"},{cssText: "float:right;"}]}],
	                    children: [
		    	            {
		    			        scriptClass: "mstrmojo.Button",
 		    				    slot: "0,0",
		    				    active: true,
		    				    iconClass: "mstrmojo-ArchitectToolbarIcon databaseview on",
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
	    					    active: true,
	    					    iconClass: "mstrmojo-ArchitectToolbarIcon ptableview on",
	    					    title: "Project Table View",		   
	    					    onclick: function toggle(evt){
		    			    	    this.active = !this.active;
		    			    	    content.children[1].set("leftItemVisible", this.active);
		    	            	    _C.toggleClass(this.domNode, "on", this.active); 	
	    			            }						      
		    				},

	                    	{
		        			    scriptClass: "mstrmojo.Button",
		        			    slot: "0,2",
		        				iconClass: "mstrmojo-ArchitectToolbarIcon jointview",
		        				title:"Joint View",
		        				active: false,
		        				onclick: function(evt) {
		    		        	    this.active = !this.active;
		    		                mstrmojo.all.SingleTableView.toggleJoins(this.active);
 		    		                _C.toggleClass(this.domNode, "on", this.active);                                                                       
 		        	            } 
		    		        
		        			},
		        			{
		        			    scriptClass: "mstrmojo.Button",
		        			    slot: "0,3",
		        				iconClass: "mstrmojo-ArchitectToolbarIcon update",
		        				title:"Save and Update Schema",
		        				onclick: function(evt) {
		        					_C.toggleClass(this.domNode, "on", true); 
		        					var me=this;
		        					var cb={
		        							success:function(){
		        								_C.toggleClass(me.domNode, "on", false);
		        								alert('Project saved and Schema updated');
		        							}
		        					}
		        				      mstrmojo.all.ArchModel.saveAndUpdate(cb);
 		        	            }  					      
		        			},
		        			{
		        			    scriptClass: "mstrmojo.Button",
		        			    slot: "0,4",
		        				iconClass: "mstrmojo-ArchitectToolbarIcon save",
		        				title:"Save Schema",
		        				active: false,
		        				onclick: function(evt) {
		        					_C.toggleClass(this.domNode, "on", true); 
		        					var me=this;
		        					var cb={
		        							success:function(){
		        								_C.toggleClass(me.domNode, "on", false);
		        								alert('Project saved and Schema updated');
		        							}
		        					}
		        				     mstrmojo.all.ArchModel.saveProject(cb);
		        				    
 		        	            }  					      
		        			},
	                    	{
		    				    scriptClass: "mstrmojo.Button",
		    				    slot: "0,5",
		    				    iconClass: "mstrmojo-ArchitectToolbarIcon help",		    				    
		    				    title: mstrmojo.desc(1143,"Help")		      
	                    	}
	                    ],
           			
	           		}),   
           			
                    content
                    
                  
           	],	
            
            layoutConfig: {
                h: {
                    toolbar: '30px',
                    layout: '100%'                    
                },
                w: {
                    layout: '100%'
                }
            },

            loadDbrs: function(){
            	        content.children[0].load();
            	        _model.createSchemaInstance();
            	        content.children[1].children[0].ProjTableTree.load();
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