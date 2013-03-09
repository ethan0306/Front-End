(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.MenuButton",
            "mstrmojo.WH.DBRoleEditor",
            "mstrmojo.android.SimpleList"
            );
	
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
		if (evt&&(evt.x>(ln.clientWidth+ln.offsetLeft-2)||evt.y>(ln.clientHeight+ln.offsetTop-2)||evt.x<40)) {
       		deleteButton.cssText = $hidden;
    		editButton.cssText = $hidden;
   		    deleteButton.render();
   		    editButton.render();
        	}
 	}

	var dblist =  new mstrmojo.android.SimpleList({
		alias: "dbrlist",
		cssClass: "mstrmojo-FormatEditor-formatList",
	    cssText: "overflow:hidden; margin:0px 2px; width:100%; padding-top:5px; background:white; ",  
	    highlightOnSelect: true,
	    getItemMarkup:function (item) {
            return '<div class="mstrmojo-DBRoleSelector-bullet" idx="'+item._renderIdx+'"><span class="mstrmojo-ArchitectListIconBlock t' + item.tp + ' st' + item.stp +'" style="padding-left: 22px;" >{@n}</span></div>';
        },
		
		onselectionChange: function ich(evt){
			if (dblist.selectedIndex >= 0){
				selectRow();
			}
		},

		onheightChange: function(){
			 if (this.domNode) {
			     this.domNode.style.height= parseInt(this.height) - 9 + 'px';
			 }
		},
		onwidthChange: function(e){			
			if (this.domNode) {
			     this.domNode.style.width= parseInt(this.width) - 6 + 'px';
			}
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

            dbe = new mstrmojo.WH.DBRoleEditor(
            		{	id:dbr.did,
            			title: "Database Instance Editor",
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
        		 	$NIB("Yes", function yes()
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
		
    	var did = mdl.dbrs[dblist.selectedIndex].did;
    	if (!(mdl.SelDBRoleID == did)){
    		mdl.set("SelDBRoleID", did);
    	}
    }
    
	//this section populates the dbroles to display in the list================================================
	function populateDBRoleList(){
		//dblist.set("items", null);
		dblist.set("items", _model.dbrs);		
	}
    //end dbroles ==========================================================================================

	//Menu buttons
	var addButton = new mstrmojo.Button(
        {	slot:"0,1",
        	title: mstrmojo.desc(8510, "new db instance"),
        	iconClass:"mstrmojo-ArchitectListIcon addbtn",
        	cssText: "float:right;",
        	onclick: function(evt) { 
            	_model.loadDBObjects(newDBRole);}
        });

	var deleteButton = new mstrmojo.MenuButton(
		{	title: "delete db instance",
        	cssClass: "mstrmojo-Editor-button function",      	
            cssText: $hidden + "height:20px; width:20px; border:0px solid; background-color:transparent;",
            iconClass: "mstrmojo-ArchitectListIcon delbtn", 
            text: "", 
            targetIndex: 0,
            onclick:function(evt){
				_ti = this.targetIndex;
				deleteDBRole();
				hideButtons();
			}
		});
		
	var editButton = new mstrmojo.MenuButton(
		{	title: "edit db instance",
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
    mstrmojo.WH.DBRoleSelectorMobile = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins    	
    		null,
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.WH.DBRoleSelectorMobile",
    			
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
