(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.MenuButton",
            "mstrmojo.QB.DBRoleEditor"
            );
	mstrmojo.requiresDescs(1462,8510,629,1088,8515, 637,9104,219,8676);	
	 
	var $hidden = "position:absolute; visibility:hidden;";
	var $visible = "position:absolute; visibility:visible;";
	var _ti = 0;
	var _model;

	function moveButtons(targetIndex, left, top){
		var l = left - 18;
		editButton.targetIndex = targetIndex;
		deleteButton.targetIndex = targetIndex;
		editButton.cssText = $visible + "height:20px; width:20px; left:" + left + "px; top:" + top + "px; border:0px; background-color:transparent;";
		deleteButton.cssText = $visible + "height:20px; width:20px; left:" + l + "px; top:" + top + "px; border:0px; background-color:transparent;";
	}
	
	function hideButtons(evt){
 	    var ln=dblist.domNode;
 	   if (!evt||((evt.clientX>(ln.clientWidth+ln.offsetLeft-2)||evt.clientY>(ln.clientHeight+ln.offsetTop-2)||evt.clientX<40)))  {
       		deleteButton.cssText = $hidden;
    		editButton.cssText = $hidden;
   		    deleteButton.render();
   		    editButton.render();
        	}
 	}

	var dblist =  new mstrmojo.List({

		alias: "dbrlist",
		cssClass: "mstrmojo-FormatEditor-formatList",
	    cssText: " overflow-x:hidden; overflow-y:auto; margin:0px 5px 5px 5px; width:100%; padding-top:5px; background:white; ",  //
		itemMarkupFunction: function(evt, data, info){
			var name = evt.n;
			
			//if (evt.primary) name = "<b>" + name + "</b>"  //do not mark primary DBRole as bold
		
			var s = '<div class="mstrmojo-DBRoleSelector-bullet" di=' + data + '>' +
						'<span class="mstrmojo-ArchitectListIconBlock t' + evt.tp + ' st' + evt.stp + '" di=' + data + '></span>' + 
						name +
					'</div>';
			
			return s;
		},
		
		onitemsChange: function ich(evt){
			//the list needs to reflec the change in contents and select the corresponding row
			if (dblist.selectedIndex >= 0){
				for (var i = 0; i < dblist.items.length; i++){
					var item = dblist.items[i];
					
					if (item.did == dblist.selectedItem.did){
						dblist.set("selectedIndex", i);
						break;
					}
				}
				selectRow();
			}
		},
		
		onRender: function onR(){
			
			var me = this;
		   _menu_popup = function (evt){
           		var left, top;
           		
           		deleteButton.cssText = $hidden;
           		editButton.cssText = $hidden;
           		
   	        	//if on list row, show the menu
   	        	var target = mstrmojo.dom.eventTarget(window, evt);
   	        	if (target) {
   	        		if (target.attributes["di"]) ti = parseInt(target.attributes["di"].nodeValue);
   	        		top = target.offsetTop + me.domNode.offsetTop - me.domNode.scrollTop + 3;  //take into account of the scrollbar
   	        		
   	        		if (top <= me.domNode.offsetTop){
   	        			//nothing, we are out of bounds to the top 
   	        			
   	        		}
   	        	
   	        		else if (top + target.clientHeight > me.domNode.offsetHeight + me.domNode.offsetTop){
   	        			//nothing, we are out of bounds to the bottom
   	        			
   	        		}
   	        	
   	        		else if (target.className.indexOf("mstrmojo-DBRoleSelector-bullet")>=0) {
   	        			left = target.offsetLeft + target.offsetWidth - 25;
   	        			moveButtons(ti, left, top);
   	        		}
   	        		else if (target.className.indexOf("t29")>=0) {
   	        			left = target.parentNode.offsetLeft + target.parentNode.offsetWidth - 25 ;
   	        			moveButtons(ti, left, top);
   	        		}
   	        	
   	        	}
   	        	
   	        	deleteButton.render();
	        	editButton.render();
       	    };
            if (this.domNode){ 
            	var st = this.domNode.style;
            	st.height= parseInt(this.height) - 9 + 'px';
            	st.width=  parseInt(this.width) - 6 + 'px';
  	           	mstrmojo.dom.attachEvent(this.domNode, 'mousemove', _menu_popup);
  	            mstrmojo.dom.attachEvent(this.domNode, 'mouseout',  hideButtons);
 	        }        	
        },
		onmouseup: function(){selectRow();},
		onheightChange: function(){
			 if (this.domNode) {
			     this.domNode.style.height= parseInt(this.height) - 9 + 'px';
			 }
			 hideButtons();
		},
		onwidthChange: function(e){			
			if (this.domNode) {
			     this.domNode.style.width= parseInt(this.width) - 6 + 'px';
			}
			hideButtons();
		}
		});
	
	//this section updates the definition of the dbrole to be edited================================================
	function editUpdatedDBRole(selectedIndex){
		var dbr = _model.dbrs[selectedIndex];
		
		var dbrparams = {taskId:'arch.getDBRoles', objectID:dbr.did};
		
		var dbrcb = {
				success: function(res){
					dbr = res.dbrs.dbr;
					performeditDBRole(dbr);
				},
			
				failure: function(res){ mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
		};
			
		if (this.mstrApp.sessionState !== undefined){ dbrparams.sessionState = this.mstrApp.sessionState; }
		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, dbrcb, dbrparams);
	}

	function performeditDBRole(dbr){
		var dbe = mstrmojo.all[dbr.did];
    	
        if(!dbe){
            
            var cb = {
        			success: function(res){ _model.loadDBRoles(); populateDBRoleList(); },
        			cancel: function(res){ }//do nothing, 
        			};

            dbe = new mstrmojo.QB.DBRoleEditor(
            		{	id:dbr.did,
            			title: mstrmojo.desc(8676,"Database Instance"),
            			dbrole: dbr,
            			sessionState: this.mstrApp.sessionState,
            			callback:cb
            			});       
            }
        else{
        	dbe.dbrole = dbr;
        };
		
        dbe.open();
    }

    function newDBRole(){
		var dbr = {n: mstrmojo.desc(8515, "new connection #").replace('#', 1), did:"", tp:"29", stp:"7424"};
		performeditDBRole(dbr);
    }
    
    function editDBRole(){
    	editUpdatedDBRole(_ti);
    }
    
    //edit a db role================================================

	//delete a db role================================================
    function deleteDBRole(){

    	var dbr = _model.dbrs[_ti];
    	    	
        var $NIB = mstrmojo.Button.newInteractiveButton;   
        
        mstrmojo.confirm(mstrmojo.desc(637, "are you sure you want to delete this object?"), 
        		[
        		 	$NIB(mstrmojo.desc(219,"Yes"), function yes()
				        {
        		 			if(dbr){
				            	var dbrparams = {	taskId:'arch.deleteObject', 
				            						objectid: dbr.did,
				            						objecttype: dbr.tp
				            					};
				            	
				        		var dbrcb = {
				        				success: function(res){ _model.loadDBRoles(); populateDBRoleList(); },
				        				failure: function(res){ mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
				        		};
				        			
				        		if (mstrApp.sessionState !== undefined){
				        			dbrparams.sessionState = mstrApp.sessionState;
				        		}
				        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, dbrcb, dbrparams);
				        	}
				        }, null),
                   $NIB("No", null, null )
              ]);
    }
    //delete a db role================================================

    function selectRow(){
    	var mdl = _model;
		if (dblist.selectedIndex!=-1){
	    	var did = mdl.dbrs[dblist.selectedIndex].did;
	    	if (!(mdl.SelDBRoleID == did)){
	    		if (mdl.dbtables.length > 0) {
		      		var txt = mstrmojo.desc(9104, "This query will be executed against the newly selected DB Instance. All tables in the query must exist in the new DBInstance for the query to succeed.");	      		
		      	    mstrmojo.confirm(txt, [
		      	                             mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, { //Descriptor: OK
			                                     scriptClass: "mstrmojo.Button",
			                                     cssClass: 'mstrmojo-Editor-button',			                                    
			                                     onclick: function(){
				      	                           	 mdl.set("SelDBRoleID", did);
				      	                         },
				      	                         onRender: function(){
				      	                        	 if (mdl.isCloud) {
				      	                        	     mstrmojo.css.addClass(this.domNode, 'cloud');
				      	                        	 }
				      	                         }
		                                     })]);
	      		}else{
	      			mdl.set("SelDBRoleID", did);
	      		}	
	    	}	
	      		
    	}
    }
    
	//this section populates the dbroles to display in the list================================================
	function populateDBRoleList(){
		//dblist.set("items", null);
		dblist.set("items", _model.dbrs);
		if (_model.SelDBRoleID) {
			var idx = mstrmojo.array.find(_model.dbrs, 'did', _model.SelDBRoleID); 
			dblist.set("selectedIndex", idx);
		}	
	}
    //end dbroles ==========================================================================================

	//Menu buttons
	var addButton = new mstrmojo.Button(
        {	slot:"0,1",

        	title: mstrmojo.desc(8510, "new db instance"),
        	iconClass:"mstrmojo-ArchitectListIcon addbtn",
        	cssText: "float:right;",
            onclick: function(evt) { _model.loadDBObjects(newDBRole);}
        });

	var deleteButton = new mstrmojo.MenuButton(
		{	title: mstrmojo.desc(629, "Delete"),

        	cssClass: "mstrmojo-Editor-button function",      	
            cssText: $hidden + "height:20px; width:20px; border:0px solid; background-color:transparent;",
            iconClass: "mstrmojo-ArchitectListIcon delbtn", 
            text: "", 
            targetIndex: 0,
        	onclick:function(evt){
				_ti = this.targetIndex;
				deleteDBRole();
				hideButtons();
			},
			onRender: function(){
				mstrmojo.dom.attachEvent(this.domNode, 'mouseout',  hideButtons);
			}
		});
		
	var editButton = new mstrmojo.MenuButton(
		{	title: mstrmojo.desc(1088, "Edit"),

        	cssClass: "mstrmojo-Editor-button function",      	
            cssText: $hidden + "height:20px; width:20px; border:0px solid; background-color:transparent;",
            iconClass: "mstrmojo-ArchitectListIcon edtbtn", 
            text: "", 
            targetIndex: 0,
            
        	//make sure the objects are loaded and when they are, then open the editor
			onclick: function(evt) { 
				_ti = this.targetIndex; 
				_model.loadDBObjects(editDBRole);
				hideButtons();
			},
			onRender: function(){
				mstrmojo.dom.attachEvent(this.domNode, 'mouseout',  hideButtons);
			}
		});

    /**
	 * <p>
	 * Widget that allows selection of db roles
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Box
	 */
    mstrmojo.QB.DBRoleSelector = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins    	
    		null,
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.QB.DBRoleSelector",
    			
    			markupString: 	'<div id="{@id}" class="mstrmojo-qb-DBRoleSelector {@cssClass}" style="{@cssText}" >' +
    							'</div>',
                
    			load: function( ){
    			          populateDBRoleList();
    			      },
    			
    			children: [ {   scriptClass:"mstrmojo.Table",
								rows: 1,
					        	cols: 2,
					        	cssClass: "mstrmojo-qb-DBRoleSelector-header",
					        	layout: [{cells: [{cssText: "padding-left: 5px; padding-right: 5px;"}, {cssText: "height: 20px; padding-right:3px;"}]}],		        	
					 		   
						        children: [ {	scriptClass: "mstrmojo.Label",
												slot: "0,0",
							 		        	cssClass: "mstrmojo-qb-DBRoleSelector-header",
												text: mstrmojo.desc(1462, "Database Connections")
											},
											addButton
										]
							},
							
							dblist,
							deleteButton,
							editButton							
						],

                initModel: function(model){    			    
    			    _model = model;    			
    			},
    			
    			onheightChange: function(e){
    				this.children[1].set("height", parseInt(e.value) - 23 + 'px' );    			
    			},
    			
    			onwidthChange: function(e){
    				this.children[1].set("width", parseInt(e.value) - 6 + 'px');
    			}
    		}	    
	    );
})();