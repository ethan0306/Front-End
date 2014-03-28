(function () {
    mstrmojo.requiresCls(
        "mstrmojo.Button",
        "mstrmojo.HBox",
        "mstrmojo.Box",       
        //"mstrmojo.Architect.TreeBrowserMobile"
        "mstrmojo.Architect.ProjectTableTree"
     );
    
    var $C = mstrmojo.css,
        $D = mstrmojo.dom,
        $H=mstrmojo.hash;
    
    var _tables = [];
    
   // var _cachedRow = null;
    
    var _menuItems = [ 
                      { 'did': 'Delete', 'n': 'Delete'},
                      { 'did': 'Rename', 'n': 'Rename'}, 
                      { 'did': 'UpStruct', 'n': 'Update Structure'}, 
                      { 'did': '-1', 'n': '-'}, 
                      { 'did': 'CreateAL', 'n': 'Create Alias'}, 
                      { 'did': 'UpSource', 'n': 'Update Source',
                    	  		"fns":[{did:'1', n: '1'}],
	                    onContextMenuOpen: function(){
	               			     var dbrs=mstrmojo.all.ArchModel.dbrs;
	                			if(this._subMenu){
	                				var sm = this._subMenu;
	                				sm.set('items', dbrs);
	                				
	                			} 
	                        }
                      }
                     ];
    var _find=function find(/*Array*/ arr, /*String*/ n, /*Any*/ v) {
    	var i;
        for (i=0, len=arr && arr.length || 0; i < len; i++) {
            var obj = arr[i];
            if (obj && obj['data'][n] == v) {
                return arr[i];
            }
        }
        return i;
    };
    
 
    

    /************************Private methods*********************************/

    mstrmojo.Architect.LogicalTableSelector = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.Architect.LogicalTableSelector",
            cssText: "width:100%;overflow:hidden;overflow:auto;",
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
            children: [
                {
                	scriptClass: "mstrmojo.HBox",
                	alias: "header",
                	cssText: "width:100%",
                	children: [                	  	
                	    {
                	        scriptClass: "mstrmojo.Label",
                	        cssClass: "mstrmojo-Architect-Panel-header",
          				    text: "Project Tables"                	    	
                	    }	
                	]	
		        },
                {
  		            scriptClass: "mstrmojo.Table",
  		            alias: 'Toolbox',
  		            rows: 1,
	        	    cols: 3,
	        	    layout: [{cells: [{cssText: "margin-left:5px;width:20px;height:20px;"}, {cssText: "width:15px;"}, {cssText: "height: 20px;"}]}],	 		        	
  		            children: [
  		                {  
  		                   scriptClass: 'mstrmojo.Box',
  		                   slot: "0,0",
  		                   cssClass: 'mstrmojo-ArchitectListIconBlock t15'
  		                },       
  		                {
  		                   scriptClass: 'mstrmojo.DropDownButton',
  		                   //scriptClass: 'mstrmojo.Pulldown',
  		                   title: "filter type",
  		                   slot: "0,1",
  		                   text: "",
  		                   cssClass: 'mstrmojo-Architect-DropDownButton',
  		               
  		                   popupRef: {
  		                       scriptClass: 'mstrmojo.Popup',
  		                       cssClass: "mstrmojo-Menu",
  		                     //  shadowNodeCssClass: "mstrmojo-Menu-shadow",
  		                       contentNodeCssClass: "mstrmojo-Menu-content",
  		                       slot: 'popupNode',
  		                       locksHover: true,
  		                       children: [{
  		                           alias: "Buttons",
  		                           scriptClass: 'mstrmojo.List',
  		                           itemMarkupFunction:  function (item, index, widget) {
		        			    	    //var s = '<div style="n: 5px 0px; padding:3px 0px 3px 3px;border-style:solid; border-width:1px; border-color:gray;-webkit-border-radius:6px;-moz-border-radius:6px;border-radius:6px;">' 
		        			    	    //	    +  '<div style="font-size:8pt;font-weight:bold;">' + item.tbn + '</div>';
		        			    	   var s = '<div class="mstrmojo-Architect-DropDownMenu" ><span class = "mstrmojo-ArchitectListIconBlock t' + item.tp + ' sub" ></span>' +  item.n + '</div>'; 
		                              //  s += '</div>';
		                                return s;
		        			        },
		        			        postCreate: function () {
		        			        	items =[ {tp:15, n: 'by table'},
		        			        	         {tp:12, n: 'by attribute'},
		        			        	         {tp:13, n: 'by fact'}];
		        			            this.set("items", items);	
		        			        },
                                    onchange: function (evt){
		        			        	if (this._super) {
		        			        	    this._super(evt);	
		        			        	}		        			        	
                                        this.parent.opener.closePopup();
                                        switch (evt.added[0]) {
                                        case 0: 
                                        	this.parent.parent.parent.children[0].cssClass =  'mstrmojo-ArchitectListIconBlock t15';
                                        	this.parent.parent.parent.children[0].render();
                                            break;
                                        case 1:
                                        	this.parent.parent.parent.children[0].cssClass =  'mstrmojo-ArchitectListIconBlock t12';
                                        	this.parent.parent.parent.children[0].render();
                                        	break;
                                        case 2:
                                        	this.parent.parent.parent.children[0].cssClass =  'mstrmojo-ArchitectListIconBlock t13';
                                        	this.parent.parent.parent.children[0].render();
                                        	break;
                                        
                                        }
                                    }
  		                        }] 
  		                      }
  		                },
  		                {
  		                    //Search Box  		                              
  		                    scriptClass: "mstrmojo.Widget",  
  		                    slot: "0,2",
  		                    cssText: "-webkit-border-radius:10px;-moz-border-radius:10px;border-radius:10px;",
                            markupString: '<table id={@id} cellspacing=0 cellpadding=0 class="mstrmojo-SearchBox-Wrapper {@cssClass}" style="{@cssText};">' +
								               '<tr><td >' +
								                    '<div class="mstrmojo-SearchBox" mstrAttach:click >' + 
								                        '<input class="mstrmojo-SearchBox-input" type="text" style="width:{@width};"' + 
								                            ' mstrAttach:keyup,blur ' +      
								                        '/>' +
								                    '</div>' + 
										       '</td><td>' +  												       		
							                       '<div class="mstrmojo-SearchBox-bg">' +
							                            '<div class="mstrmojo-Architect-SearchBox-search" id="{@id}sbClear" mstrAttach:click ></div>' +
							                       '</div>' +  									                 
								                '</td></tr>'+
						                     '</table>',
			                  markupSlots: {
		                         inputNode: function(){return this.domNode.rows[0].cells[0].firstChild.firstChild;},
		                         clearNode: function(){return this.domNode.rows[0].cells[1].firstChild.firstChild;}
			                },
			                
			                cssClass: "mstrmojo-charcoalbox mstrmojo-dxsprite",
		                    cssText: "margin: 5px 0; ",
		                    enableMatchCase: false,
			                
			                /**
			                 * <p>Handle click on each Toolbox component</p>
			                 * 
			                 * @param {DOMEvent} evt
			                 * @private
			                 */
			                onclick: function(evt) {
			                    var hWin = evt.hWin,
			                        e = evt.e || hWin.event,
			                        tgt = e.target || e.srcElement,
			                        id = tgt && tgt.id;
			                    
			                    switch (id.replace(this.id, '')) {
			                	                        
			                    case 'sbSearch': //search icon
			                        if (this.onEnter && e.keyCode === 13) {
			                            this.onEnter();
			                        }
			                    	                        
			                        this._onsearch();
			                        break;                        
			                        
			                    case 'sbClear': //clear icon
			                        this.clearSearch();
			                        break;
			                 
			                    }
			                    
			                },
			               	                
			                clearSearch: function(){
			                    this.inputNode.value = '';
			                    $C.removeClass(this.clearNode, ['show']);                   
			                    this._onsearch(true);
			                  
			                },
			                
			                
			                /**
			                 * <p>Handle keyup events</P> 
			                 * 
			                 * @param {DOMEvent} evt
			                 * @private
			                 */
			                onkeyup: function onkeyup(evt) {
				                var hWin = evt.hWin,
 			                           e = evt.e || hWin.event;
	             
	                            //get user input by trimming off leading/trailing spaces
	                            var input = mstrmojo.string.trim(this.inputNode.value);
	                    
	                            //show 'clear' icon
	                            if (this.clearNode) {
	                    	       $C.toggleClass(this.clearNode, ['show'], input.length > 0);
	                            }	                   
	              			                    
	                            this._onsearch();
			                },
			                
			            
			                
			                _onsearch:function(toRoot){
				               	var mdl=mstrmojo.all.ArchModel;
			                    var ptr=this.parent.parent.ProjTableTree, r=[], ps=mdl.pt_items, idx=0,idx2=0,its,pj;	
			                    var input = mstrmojo.string.trim(this.inputNode.value).toUpperCase();
			                    if (input.length >0 ){
		                        for (var j=0, len1=ps.length;j<len1; j++){
		                        	  pj=ps[j];
		                        	  r[idx]={n:pj.n, st:pj.st, t:pj.t, items:[]};
		                        	  its=pj.items;
		                        	  for (var k=0, len2=its.length;k<len2; k++){
		                        		  if(its[k].n.toUpperCase().indexOf(input)>-1){
		                        			  r[idx].items[idx2++]=$H.clone(its[k]);
		                        			}
		                        	  }
		                        	  if(idx2>0) {idx2=0; idx++;}
		                        }
		                        if(r[idx].items.length===0) r.pop();
			                  }
 			                  else {
 			                	     r=ps;
 			                	  }
			                    this.parent.parent.ProjTableTree.set("items", r);
 			                  }
  			           }],
  			           onvisibleChange: function () {
  		                    this.domNode.style.display = this.visible ? 'block' : 'none';
  		                    //need to adjust the table list height  		                   
	                    	var h = parseInt(this.parent.ProjTableTree.height), _H = 31;
	                    	if (h > 0) {
	                    		h = this.visible ? h - _H : h + _H;
	                    		this.parent.ProjTableTree.set("height", h+'px');
	                    	}  
  		               }
  		        },
				//Table section
		        {
				    alias: "ProjTableTree",					                			                
					scriptClass: "mstrmojo.Architect.ProjectTableTree",
		            cssClass: "mstrmojo-TreeBrowser mstrmojo-Architect-LogicalTablesTree",
					//items: _tables ,
					
					 tableChange:function tableChange(evt){
					      var tables=[],
					          mdl=mstrmojo.all.ArchModel, 
					          dbrid=mdl.SelDBRoleID;
				          var tbls=mdl.pts[dbrid], index=0, t;
				          for (var n in tbls){	  			                        
	  			              t = tbls[n];
	  			              tables[index]={
				                  n: t.name, 
				                  did: t.TblID, 
				                  st: 8405,
				                  t: 15,
				                  tag: t.tag,
				                  AttrInfos:t.AttrInfos,
				                  FactInfos:t.FactInfos,
				                  items: []};
				              index++;	  			                        
				          }
				          var w=_find(this.ctxtBuilder.itemWidgets,'did',dbrid);
				          if(typeof w==='number'){
				        	  var idx=mstrmojo.array.find(mdl.dbrs, 'did', dbrid),
				        	      n=mdl.dbrs[idx].n;
				        	  var d={
	         		                  n:n,
	         		                  did: dbrid, 
	         		                  st: 7424,
	         		                  t: 29,
	         		                  items:tables
				                   };
				        	  this.add([d]);
				        }
				          else{
				            w.data.items=tables;
				            w.set('items',tables);
				            w.paint();
				            w.set("selectedIndex", 0, false);
				           }
				            mdl.set("SelTableID", tables[0].did);
				            mdl.pt_items=$H.clone(this.items);
				      },  
				                    
				    /* tableToAdd: function(evt) {
				          var v = evt.value,
				              l = v.length,
				              tables = [];
				          for (var index=0 ; index < l; index++){	  			                        
		  			          t = v[index];
		  			          tables[index]={
					              n: t.name , 
					              did: t.TblID, 
					              st: 8405,
					              t: 15,
					              tag: t,
					              items: []};					                        	 	                        
					      }
				          this.add(tables, -1); //append to the list				          
				          this.set("selectedIndex", this.items.length -1, false);  //set the newly added item to be selected
				          mstrmojo.all.ArchModel.set("SelTableID", tables[l-1].did);			              
				          
				      },*/
				 
				      attrNameChange: function(evt){
				    	  var n = evt.value, id = evt.did, toRefresh=false;
				    	  for (var i=0, len = this.items.length; i<len; i++) {
				    		  var t = this.items[i].items;
				    		  //check if contain this particular attribute, if so, update its name
				    		  for (var j=0, len1=t.length; j<len1; j++) {
			    				  var tbls = t[j].items;
			    				  for(var k=0,len2=tbls.length; k<len2; k++){
			    					  var obj=tbls[k];
			    				  if (obj.t === 12 && obj.id === id) {
			    					  if(n===null) delete tbls.items[k];
			    					  tbls.items[k].name = n;
			    					  tbls.items[k].n = n;
			    					  toRefresh =true;
			    				  }	 			    				   
				    		  if (toRefresh) {
		    					  toRefresh =false;
		    					  var w = this.ctxtBuilder.itemWidgets[i].ctxtBuilder.itemWidgets[j];  //get table node
		    						  w.set("items",[]);
		    						  w.set("items", t.items);
		    					  break;
		    				  }	
				    	  }
				        }
				       }
				     },
				      
				      factNameChange: function(evt){
				    	  var n = evt.value, id = evt.did, toRefresh=false;
				    	  for (var i=0, len = this.items.length; i<len; i++) {
				    		  var t = this.items[i].items;
				    		  //check if contain this particular attribute, if so, update its name
				    		  for (var j=0, len1=t.length; j<len1; j++) {
			    				  var tbls = t[j].items;
			    				  for(var k=0,len2=tbls.length; k<len2; k++){
			    					  var obj=tbls[k];
			    				  if (obj.t === 13 && obj.id === id) {
			    					  if(n===null) delete tbls.items[k];
			    					  tbls.items[k].name = n;
			    					  tbls.items[k].n = n;
			    					  toRefresh =true;
			    				  }	 			    				   
				    		  if (toRefresh) {
		    					  toRefresh =false;
		    					  var w = this.ctxtBuilder.itemWidgets[i].ctxtBuilder.itemWidgets[j];  //get table node
		    						  w.set("items",[]);
		    						  w.set("items", t.items);
		    					  break;
		    				  }	
				    	  }
				        }
				       }
				     },
				      
				      tableNameChange: function(evt){
				    	  var n = evt.value, tid = evt.did, toRefresh=false;
				    	  for (var i=0, len = this.items.length; i<len; i++) {
				    		  var ts = this.items[i].items;
				    		  for(var j=0,len1=ts.length;j<len1;j++){
				    			  var t=ts[j];
				    		      if (tid === t.did) {
				    		    	   if(n===null) {
				    		    		   delete ts[j];
				    		    		   this.ctxtBuilder.itemWidgets[i].set("items", ts);
				    		    	   }
				    		     else{
		    					      t.n = n;				    			  
		    					      var w = this.ctxtBuilder.itemWidgets[i].ctxtBuilder.itemWidgets[j];  //get table node
			    			    	        w.set("text",n);					    	
						    	  }
				    		    }
				    		  }	  
				    	  }
				      },
				      refreshTable: function(evt){
				    	  var me=this, tid=evt.did;
				    	  for (var i=0, len = this.items.length; i<len; i++) {
				    		  var ts = this.items[i].items;
				    		  for(var j=0,len1=ts.length;j<len1;j++){
				    			  var t=ts[j];
				    		      if (tid === t.did) {
				    			  var cb = {
								    	    success: function(res){
							    				var w =me.ctxtBuilder.itemWidgets[i].ctxtBuilder.itemWidgets[j];  //get table node
						    						  t.items=res.items;
						    						  w.set("items",[]);
						    						  w.set("items", res.items);								    	
				    			            },  
								    		failure: function(res) {
								    			//failure
								            }
								  }		
				    			  mstrmojo.all.ArchModel.getAttributesFactsInTable(evt, cb);
				    		  }	 
				    	  }
				      }	  
				    }
		        },
		        {
		       	    scriptClass: "mstrmojo.MenuButton",
		       	    cssClass: "mstrmojo-Editor-button function",
		            cssText: "position:absolute; height:20px; width:20px;visibility:hidden; border:0px solid; background-color:transparent;",
		            iconClass: "mstrmojo-ArchitectListIcon div", 
		            alias: "cxtmenu",
		            itemChildrenField: 'fns',
		            itemIdField: 'did',
		         	itemField: 'n',
		            text:"",		         
		            searchItemAdded: true,
		            executeCommand: function(item){
		            	    var tlist = [],item, tr=this.parent.ProjTableTree, h=tr.selectedIndices,
		            	        mdl=mstrmojo.all.ArchModel, row=$D.findWidget(tr._cachedRow);
		   		        switch (item.did) {
		   				    case "Delete": {				        	   
			        	    		    mdl.deleteObject(15,tid, cb);
		   			    	    break;
		   				    }
		   			        
		   				    case "Rename": {
	                            var _tnEditor = new mstrmojo.Editor({
	                                title: "Table Rename",
	                                cssText: "width:300px;",	                               
	                                onOpen: function(){
	                                    if (this.txtbox.domNode) {
	                                        this.txtbox.value= row.text;   
	                                        this.txtbox.domNode.focus();
	                                        this.txtbox.domNode.select();
	                                    }
	                                },	                               
	                                onOK: function(){
		                               	var n =mstrmojo.string.trim(this.txtbox.value), me=this,
		                               	    tid=row.data.did;
		                               	if (n===row.text) {
		                               		this.close();
		                               	    return; //simply return if there's no change.	
		                               	}
		                               	var cb = {
			                               	    success: function(res){
			                               		    row.data.n=n;
			                               		    row.set('text',n);
			                               		    if(tid===mdl.SelTableID) 
			                               		    	mstrmojo.all.tableEditor.header.title.set("text",n);
			                               		    me.close();
			                               	    },
			                               	    failure: function(res){
			                               	    	me.error.set('text',res.getResponseHeader('X-MSTR-TaskFailureMsg'))
			                               	    }	
			                               	};	
		                                mdl.renameObject(tid, 15, n,false, cb);
	                                },    
	                                children:[
	                                    {
	                                         scriptClass: "mstrmojo.Label",
	                                         text: "Please enter the table name:",
	                                         cssText: "margin-top:5px;"    
	                                    },
	                                    {   
	                                   	    scriptClass: "mstrmojo.TextBox",
	                                   	    alias: 'txtbox',
                          				    cssText: "margin-top:10px;width: 96%;",
                          				    onkeyup: function(evt){
                          	   				    switch  (evt.e.keyCode) {
                          	   				    case 13: //'enter' pressed
	                       	   	   					var ret = true;  
	                       	               	        if (this.parent.onOK) { this.parent.onOK(); }                       							
	                       							break;
                          	   				    case 27: 	//'escape' pressed	
                          	   					    this.parent.close();
                          	   				    	break;
                                                default:
                                                    break;
                          	   				    }
                          				    }
	                                    },
	                                    {
	                                         scriptClass: "mstrmojo.Label",
	                                         alias:"error",
	                                         cssText: "width: 95%;",
	                                         text: ""
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
	                       							var ret = true;	                       							
	                       							if (e.onOK) {e.onOK();}
	                       							
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
	                            _tnEditor.open();   
		       			        break;
		   			        }
		   				    default: {				 
		   				        break;
		   			        }
		   		        }
		   		    },
		   		
		   		    postCreate: function(){		  
		   		        this.cm = _menuItems;
		   		    },
		   
		            onRender: function(){
		              var _cachedRow=this.parent.children[0]._cachedRow;
		           	    var mouseover_handle = function (evt) {		                	               		
		           		    if (_cachedRow) {  //in the case when mouse over the context menu, we still show the background for current row
		           			    $C.toggleClass(_cachedRow, "architect-highlight", true);  
		           		    }	 
		           	    },  mouseout_handle = function (evt) {
		           		    if (_cachedRow) {  //in the case when mouse out of the context menu, we restore the background for current row
		               		    $C.toggleClass(_cachedRow, "architect-highlight", false);  
		               	    }	 
		              	}; 	
		           	    $D.attachEvent(this.domNode, 'mousemove', mouseover_handle);
		           	    $D.attachEvent(this.domNode, 'mouseout', mouseout_handle);
		            }	       		
		        }		       
		   ],
		   onheightChange: function changeheight(evt){
            	var tn=this.ProjTableTree.domNode;
            	this.ProjTableTree.height=parseInt(evt.value,10)-68+'px';
            	if(tn){
            	    tn.style.height=parseInt(evt.value,10)-68+'px';
            	}
            },
           postBuildRendering: function postBR(){
 	           if (this._super){
	               this._super();
 	           }
	           if (this.Toolbox){ 
 	           	  // this.Toolbox.set("visible", false);
	           }
	           var mdl= mstrmojo.all.ArchModel,
	               id=this.ProjTableTree.id;
	           mdl.attachEventListener("tblsChange", id, "tableChange");
	           mdl.attachEventListener("TableContentChange",id, "refreshTable");
	           mdl.attachEventListener("AttrNameChange", id, "attrNameChange");
	           mdl.attachEventListener("FactNameChange", id, "factNameChange");
	          // mdl.attachEventListener("TableNameChange", id, "tableNameChange");
 	       }
        });

})();