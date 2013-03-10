(function () {
    mstrmojo.requiresCls(  
	    "mstrmojo.Box",
        "mstrmojo.WH.DBRoleSelector"
	);
    var  $C = mstrmojo.css,
         _useCache = true;
    var STR = mstrmojo.desc(9143, 'Available tables cache was created at ##. Click Refresh to get the latest tables and update the cache.');
    //override this if want to change DBtabletree.
 
    /************************Private methods*********************************/

    mstrmojo.WH.WHPanel = mstrmojo.declare(
        // superclass
        mstrmojo.QB.VSplitPanel,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.WH.WHPanel",            
        	
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
            //Model, which can be override.
            _model:null,
            //DBtable tree widget, which can be override.
            dbt:null,
            
            marginSpan: 10,
            children: [ 
                       new mstrmojo.WH.DBRoleSelector({    	     	 		        
   	     	 		        slot: 'topItem'
   	     	 		   }),
   	     	 		     
	     	     	   new mstrmojo.Box ({
         	 		         slot: 'bottomItem',
         	 		         cssClass: "mstrmojo-qb-WarehouseTableSection", 
	         	 		     children: [   
								 {   scriptClass:"mstrmojo.Table",
									rows: 1,
									cols: 2,
									cssClass: "mstrmojo-qb-DBRoleSelector-header",
									layout: [{cells: [{cssText: "padding-left: 5px; padding-right: 5px;"}, {cssText: "height: 20px; padding-right: 3px;"}]}],
								    children:[{
								    	           scriptClass: "mstrmojo.Label",
												   slot: "0,0",
								 		           cssClass: "mstrmojo-qb-DBRoleSelector-header",
												   text: mstrmojo.desc(9142, "Available Tables")
											   },
										       {	
										        	scriptClass: "mstrmojo.Button",
										        	slot:"0,1",
										        	title: mstrmojo.desc(773,"Refresh"),
										        	iconClass:"mstrmojo-ArchitectListIcon refresh",
										        	cssText: "float:right;",										        	
										          	onclick: function(evt) { 
			    	 					                   //clear the searchbox
										          		var p=this.parent.parent;
													        p.SearchBox.clearSearch(); 
															_useCache = false;
															var mdl=p.parent._model;
															if (mdl) {
																mdl.catalogRefresh = true;
															}
			    	 					                    this.parent.parent.DBTableTree.dbroleChange();
			    	 					                    if (mdl) {
																mdl.catalogRefresh = false;
															}
			    	 					                    _useCache = true;
												        },
											        cacheStamped: function(evt) {
											            if (evt.value) {
											            	this.title = STR.replace(/##/, evt.value);											        	  
											        	    this.tooltip = this.domNode.title;
											        	    this.render();
											            }
											        }
										       } 
											]
								 },       
	         	 			     {
	         	 			                alias: 'SearchBox',
	         	 			                scriptClass: "mstrmojo.Widget",
	         	 			                markupString: '<table id={@id} cellspacing=0 cellpadding=0 class="mstrmojo-Architect-SearchBox {@cssClass}" style="{@cssText};">' +
					   	 						                '<tr><td>' +
					   	 						                    '<div class="mstrmojo-SearchBox" mstrAttach:click >' + 
					   	 						                        '<input class="mstrmojo-SearchBox-input" type="text" style="width:{@width};"' + 
					   	 						                            ' mstrAttach:keyup,blur' +      
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
	         	 					                    
	         	 					                    case 'sbClear':
	         	 					                    	this.clearSearch();
	         	 					                    	break;
	         	 				                    }
	         	 				                },
	         	 				               	                
	         	 				                clearSearch: function(){
	         	 				                    this.inputNode.value = '';
	         	 				                    //hide icon
	         	 				                    $C.removeClass(this.clearNode, ['show']);                   
	         	 				                    this._onsearch(true);
	         	 				                  
	         	 				                },
	         	 				                
	         	 				              onkeyup: function onkeyup(evt) {
	         	 				                    var hWin = evt.hWin,
	         	 				                        e = evt.e || hWin.event;
	         	 				             
	         	 				                    //get user input by trimming off leading/trailing spaces
	         	 				                    var input = mstrmojo.string.trim(this.inputNode.value);
	         	 				                    
	         	 				                    //show 'clear' icon
	         	 				                    if (this.clearNode) {
	         	 				                    	$C.toggleClass(this.clearNode, ['show'], input.length > 0);
	         	 				                    }	                   
	         	 				              		
	         	 				                    if (this._searchTimer){
	         	 				                        self.clearTimeout(this._searchTimer);
	         	 				                    } 
	         	 				                    me = this;
	         	 		                            this._searchTimer = self.setTimeout(function () {
	         	 		                                                    me._onsearch();
	         	 		                                                }, 500);
	         	 				                  
	         	 				                },
	         	 				              			                
	         	 				                _onsearch:function(toRoot){
	         	 				                	var mdl=this.parent.parent._model, me=this;	
	         	 				                	var callbacks = {
	         	 					            	    success: function (res) {
	         	 				                		    me.parent.DBTableTree.clearSelect();
	         	 					                        me.parent.DBTableTree.set("items",[]);
	         	 						                	var input = mstrmojo.string.trim(me.inputNode.value).toUpperCase();  //case insensitive
	         	 						                	if (input.length >0 ){
	         	 							                	var filtered = [];
	         	 							                	var index=0;
	         	 							                	for (var i=0, len=res.length; i<len; i++)
	         	 							                	{
	         	 							                		if (res[i].n.toUpperCase().indexOf(input)>-1)
	         	 							                		{
	         	 							                 			filtered[index++] = res[i] ;
	         	 							                		}
	         	 							                	}
	         	 						                	}else
	         	 						                	{
	         	 						                		filtered=res;
	         	 						                	}
	         	 						                	me.parent.DBTableTree.set("items",filtered);
	         	 						                	
	         	 					            	    },
	         	 					            		failure: function (res) {
	         	 					            	    	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	         	 					            	    }
	         	 						           	}
	         	 				                	if(mdl)
	         	 								        mdl.getSelectedDBRoleTables(callbacks, _useCache);		                     
	         	 				                },
	         	 				              	         	 			                            
	         	 			                    enableMatchCase: false,
	         	 			                    
	         	 			                    onwidthChange: function(e) {
	         	 				                	if (this.domNode) {
	         	 				                		this.inputNode.style.width = parseInt(this.width) - 71 + 'px'; // exclude the margin
	         	 				                	}	
	         	 				                }, 
	         	 				                
	         	 				                onRender: function(){
	         	 				              	    this.inputNode.style.width = parseInt(this.width)- 71 + 'px';
	         	 				                }
	         	 			            }
	         	 			            ],
	         	 			  
	         	 			      onheightChange: function(e){
	     	     		   			 this.DBTableTree.set("height", parseInt(e.value) - 68 + 'px' );  //top section plus padding is 66px
	     	     	   			  },
	     	     	              
	     	     	              onwidthChange: function(e){
	     	     		              this.SearchBox.set("width", parseInt(e.value) + 'px' );  //exclude the margin
	     	     	              }
         	 		     })
        	],
           postCreate: function(){
        	        if(this.dbt)
	            	  this.children[1].addChildren(this.dbt);
	              },
        	load: function(){
            	var mdl = this._model;
            	if(!mdl){
            		    mstrmojo.alert("You need to define a model!"); 
            		    return;
               }
             	this.children[0].initModel(mdl);
             	this.children[1].DBTableTree.initModel(mdl);
             	mdl.attachEventListener("dbrsChange", this.children[0].id , "load");             	
             	mdl.loadDBRoles();
            	//load the tables
             	var treeid = this.children[1].DBTableTree.id
             	mdl.attachEventListener("dbroleChange", treeid , "dbroleChange");
             	var btnid = this.children[1].children[0].children[1].id
             	mdl.attachEventListener("cacheStamped", btnid, "cacheStamped");
           	}
    });

    
})();