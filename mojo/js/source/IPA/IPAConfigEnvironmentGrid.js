(function(){
	
	mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo.Table", "mstrmojo.VBox", "mstrmojo.CollapsiblePanel",
    		"mstrmojo.Label", "mstrmojo.TextBox", "mstrmojo.HBox", "mstrmojo.HTMLButton",    		
    		"mstrmojo.List", "mstrmojo.ListHoriz", "mstrmojo.ListBoxSelector", 
    		"mstrmojo.ListBase2", "mstrmojo.SelectBox", "mstrmojo.CheckBox", 
    		"mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", 
    		"mstrmojo.DataGrid","mstrmojo.IPA.CustomHeader");
	mstrmojo.requiresDescs(8645,8651,8652,8653,1468,8654,3610,1442,221,8655);
	
	var _sortAsc = {
			sortAsc : new mstrmojo.Obj({
				name : true,
				ts : true,				
			})
		};
	
	mstrmojo.IPA.IPAConfigEnvironmentGrid = mstrmojo.insert({
		scriptClass: "mstrmojo.DataGrid",
        cssClass: "mstrmojo-DataGrid-envlist",
        cssText:"cursor:move;",
        id: "IPAConfigEnvironmentGrid",
        waiting: false,
        makeObservable: true,
        resizableColumns: false,
        //dropZone: true, 
        numSelected: 0,
        bindings: {
            items: "mstrmojo.all.environmentModel.model.environments"
        },
       // Sort Function for sorting the grid based on environment name
        sort : function(prop, asc) {
        	var sortFunc = function mySort(p, s) {
				return function(a, b) {
					var aProp = eval("a." + p), bProp = eval("b." + p);
					var e = aProp == bProp;
					var r = aProp > bProp;
					/* wxu use EMCA standard return value */
					if(s) {
						if(e) {
							return 0;
						} else if(r) {
							return 1;
						} else {
							return -1;
						}
					} else {
						if(e) {
							return 0;
						} else if(r) {
							return -1;
						} else {
							return 1;
						}
					}
				};
			};			
			if(this.items) {				
				this.items.sort(sortFunc(prop, asc));
				var num = this.numSelected;
				this.render();
				this.set("numSelected", num);
				this.set("selectedIndex",0);				
				mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem = mstrmojo.all.IPAConfigEnvironmentGrid.items[mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex];				
				this.onchange();				
			}
		},
//        ondrop:function(){        	
//			debugger;
//			mstrmojo.all.IPAOverlayBox.set('visible', true);
//			var id = this.selectedItem.id;		            	
//        	var drop_index = this.dropCuePos.idx;
//        	var current_index = this.selectedIndex;
//        	var index;
//        	
//        	if(drop_index==current_index)
//        		{
//        			mstrmojo.all.IPAOverlayBox.set('visible', false);
//        			location.reload(true);
//        			return;
//        		}
//        	if(drop_index > current_index)
//        		index = drop_index-1;
//        	else
//        		index = drop_index;
//        	
//        	
//        	var successCB = function(res){
//        		location.reload(true);
//    		};
//    	
//        	var failureCB = function(res){
//                	alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));                	
//            	};            	
//        	mstrmojo.all.environmentController.reorderEnvironments(id,index,successCB,failureCB);
//        },
//        checkConnected : function (array,server)
//		{	
//			if (array) {
//                for (var i = 0; i < array.length; i++) {		                        
//                        if (
//                        	(array[i].name == server.name)&& 
//                        	(array[i].port == server.port) && 
//                        	((array[i].application == server.application) || (array[i].app == server.application))
//                           )
//                        			return true;		                        
//                }
//            }
//            return false;
//		},
		setAvailableList : function()
		{	
			var w = [];
	         var m = [];
	         w =  mstrmojo.all.environmentModel.model.webServers;
	         m =  mstrmojo.all.environmentModel.model.mobileServers;
	         // Set Available Web Server List
	         mstrmojo.all.IPAConfigWebServersGrid.set('items', w);
            // mstrmojo.all.IPAConfigWebServersGrid.render();
             mstrmojo.all.IPAConfigWebServersGrid.set('visible', true);
           //  if(w.length > 0){
             //	mstrmojo.all.AvailableWebServersCollapsiblePanel.set('expanded',true);                	
//             }
//             else{                	
//             	mstrmojo.all.AvailableWebServersCollapsiblePanel.set('expanded',false);
//             }
             // Set Available Mobile Server List
             mstrmojo.all.IPAConfigMobileServersGrid.set('items', m);
             //mstrmojo.all.IPAConfigMobileServersGrid.render();
             mstrmojo.all.IPAConfigMobileServersGrid.set('visible', true);
//             if(m.length > 0){                	
             	//mstrmojo.all.AvailableMobileServersCollapsiblePanel.set('expanded',true);
//             }
//             else{                
//             	mstrmojo.all.AvailableMobileServersCollapsiblePanel.set('expanded',false);
//             }
		},
        onchange: function(){
			//on the onchange event we detect what the item id is, and get its dependent to show
//            var s = [];
//            var w = [];
//            var m = [];
//			var i;
            if(mstrmojo.all.environmentController.selectedServers)
            	mstrmojo.all.environmentController.selectedServers.length=0;
            
            if (this.items.length>0) {
//           	s = [];
//                w = [];
//                m = [];				
                // Set the Grids to Visible
				mstrmojo.all.IPANewEnvWebServersGrid.set('visible', true);
				mstrmojo.all.IPANewEnvIServersGrid.set('visible', true); 
				mstrmojo.all.IPANewEnvMobileServersGrid.set('visible', true);
				
				//following 3 lines are required else the iserver, webserver and mobile server
				//grids don't get updated on env selection		                   	                    
//				mstrmojo.all.IPAConfigWebServersGrid.set('items', w);
//                mstrmojo.all.IPAConfigMobileServersGrid.set('items', m);
                
                // Set the env panel[I-servers,Web Servers and Mobile Servers], these are the workspace items
                mstrmojo.all.IPANewEnvIServersGrid.set('items', mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers);
            	mstrmojo.all.IPANewEnvWebServersGrid.set('items', mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers);
            	mstrmojo.all.IPANewEnvMobileServersGrid.set('items', mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers);
            	mstrmojo.all.EnvironmentPanel.set('serverStatus',mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.serverStatus);
            	// Set Panels to expanded
//                mstrmojo.all.CurrentEnvMobileServersCollapsiblePanel.set('expanded',true);
//                mstrmojo.all.CurrentEnvIServersCollapsiblePanel.set('expanded',true);
//                mstrmojo.all.CurrentEnvWebServersCollapsiblePanel.set('expanded',true); 
                // Set Environment name in Build Section
            var l = mstrmojo.all.ConfigEnvLabelBox.children[0].children[1];            
            var name = this.selectedItem.name;
            if(this.selectedItem.name.length>20)
            	name = this.selectedItem.name.substring(0,22) + '...';
            l.set('text',name);
           }else{
        	   mstrmojo.all.IPAConfigNavigationTable.children[6].set('enabled',false);        	   
           }
            this.setAvailableList();
        }, 
        
           columns: [     
			            {
			            	colWidth:120,
			                headerWidget: {
			            			scriptClass : 'mstrmojo.IPA.CustomHeader',	
			            			//cssText : "margin-left:auto;margin-right:auto;width:7em",
			            			cssText : "margin-left:130px;",
			            			text :  mstrmojo.desc(8645,"Environment Name"),			            			
			            			dataField : "name",
			            			postCreate : function() {
									this.set("model", _sortAsc);
								}
//			            		scriptClass: 'mstrmojo.Label',
//			                    text: "Environment Name"
			                },
			                dataWidget: {
			                	scriptClass: "mstrmojo.EditableLabel",
			                    cssText:"overflow:hidden",	
			                    ontextChange: function()
			                    {			                		
			                		if (this.parent.data.id == -1) 
									{									
										this.parent.data.name = this.text;
									} 
									else if (this.data.name != this.text) 
									{										
										mstrmojo.all.IPAOverlayBox.set('visible', true);
										var successCB = function(res)
										{											
											//											
											// Reload the changed values from the Model
											mstrmojo.all.environmentController.getEnvironmentList(
                									null,function()
                									     {                											
                											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
                											mstrmojo.all.IPAOverlayBox.set('visible', false);
                									     },
                									     function()
                									     {                									    	
                									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
                									    	 mstrmojo.all.IPAOverlayBox.set('visible', false);
                									     });																				
	                            		};
	                            	
	                                	var failureCB = function(res)
	                                	{	   
	                                		mstrmojo.all.IPAOverlayBox.set('visible', false);
	        	   		                 	alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
	        	   		                 	mstrmojo.all.IPAConfigEnvironmentGrid.render();
			       		             	};										
			       		             	// Formatting Env Name
			       		             	// Special cases for Chrome			       		             	
			       		             	var envName = this.text.replace(/<div><br><\/div>/,""); //for chrome
			       		             	//replace leading and trailing space
			       		             	envName = envName.replace(/(&nbsp;)/,' ');
			       		             	envName = envName.replace(/\s+$/, '');
			       		             	envName = envName.replace(/^\s+/, '');
			       		             	envName = envName.replace(/<br>/,""); //for chrome
			       		             	envName = envName.replace(/<br><br>/,""); //for FF
			       		             	this.set("title",envName);
										mstrmojo.all.environmentController.setEnvNameAttribute(this.data.id,envName,successCB, failureCB);
										mstrmojo.all.ConfigEnvLabelBox.children[0].children[1].set('text',this.text);										
										mstrmojo.all.IPAConfigEnvironmentGrid.items[mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex].set('name',envName);
										this.render();
									}									
			                	},			                	
			                	postApplyProperties: function(){			                        
			                		this.set("text", this.data.name);
			                        this.set("title",this.data.name);			                        
			                        if (this.data.id == -1) {
										this.set("cssText", "font-weight:bold");
									}			                        
			                    }
			                }
			            },
			            {
			            	colWidth:60,
			                headerWidget: {
		                		scriptClass : 'mstrmojo.IPA.CustomHeader',	
		                		cssText : "margin-left:25px;margin-right:auto;",
			                    text: mstrmojo.desc(8651,"Modification Time"),
			                    dataField : "ts",
			                    postCreate : function() {
									this.set("model", _sortAsc);
								}
			                },
			                dataWidget: {
			                    scriptClass: "mstrmojo.Label",	
			                    
			                    postApplyProperties: function(){
			                        this.set("text", this.data.ts);
			                        this.set("title",this.data.ts);			                        
			                        if (this.data.id == -1) {
										this.set("cssText", "font-weight:bold");
									}
			                	}
			                    
			                }
			            },
			            
			            {
			            	colWidth:40,
			                headerWidget: {
			                    scriptClass: 'mstrmojo.Label',
			                    text:  mstrmojo.desc(8652,"Monitor"),
			                },
			                colCss: "monitorsizeCol",			                
			                dataWidget: {
			                    scriptClass: "mstrmojo.HBox",			                    
			                    children:[
			                       {
			                    	   scriptClass:"mstrmojo.Button",
			                    	   cssText:"text-decoration:underline;color:blue;font-size:10pt;text-align:left;margin-left:25px;width:auto;position:relative;left:-10px;",
//			                    	   text:"Enable",
			                    	
			                    	   onclick:function(){			                    	   		
			                    	   		mstrmojo.all.IPAOverlayBox.set('visible', true);			                    	   		
			                    	   		var envEnable = this;
		                    	    		var successCB = function(res){		                    	    			
		                    	    			mstrmojo.all.IPAOverlayBox.set('visible', false);
		                    	    			mstrmojo.all.environmentController.getEnvironmentList(
	                									null,function()
	                									     {	                											
	                											if(envEnable.text==mstrmojo.desc(8653,"Enable"))
	                											{
	                												envEnable.set('text',mstrmojo.desc(1468,"Disable"));
	                												mstrmojo.all.IPAConfigEnvironmentGrid.items[mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex].set('enable',"true");
	                											}
	                											else
	                											{
	                												envEnable.set('text',mstrmojo.desc(8653,"Enable"));
	                												mstrmojo.all.IPAConfigEnvironmentGrid.items[mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex].set('enable',"false");
	                											}	                											
	                											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
	                									     },
	                									     function()
	                									     {
	                									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
	                									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
	                									     });
		                    	    			//location.reload();
		                    	    		};
                           	
		                    	    		var failureCB = function(res){
		                    	    			mstrmojo.all.IPAOverlayBox.set('visible', false);
		                    	    			alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
		                    	    		};
		                    	    		if(this.text==mstrmojo.desc(8653,"Enable"))		                    	    			
		                    	    			mstrmojo.all.environmentController.setEnableAttribute(this.parent.data.id,"true",successCB,failureCB);
		                    	    		else		                    	    		
		                    	    			mstrmojo.all.environmentController.setEnableAttribute(this.parent.data.id,"false",successCB,failureCB);		                    	    		
		                    	    		
		                    	   		},
		                    	   	  bindings : {		                    	   			
		                    	   			text : function(){		                    	   				
		                    	   				if(this.parent.data.enable=="true")
		                    	   					return mstrmojo.desc(1468,"Disable");
		                    	   				else
		                    	   					return mstrmojo.desc(8653,"Enable");
		                    	   			}
		                    	   		}	
			                       	
			                       }],
//			                       {
//			                    	   scriptClass:"mstrmojo.Button",
//			                    	   text:"Disable",
//			                    	   
//			                    	   onclick:function(){			                    	   		
//			                    	   		mstrmojo.all.IPAOverlayBox.set('visible', true);
//			                    	    	var successCB = function(res){
//			                    	    		mstrmojo.all.IPAOverlayBox.set('visible', false);
//			                    	    		location.reload();
//			                    	    	};
//	                            	
//			                    	    	var failureCB = function(res){
//			                    	    		mstrmojo.all.IPAOverlayBox.set('visible', false);
//			                    	    		alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
//			                    	    	};
//
//			                    	    	mstrmojo.all.environmentController.setEnableAttribute(this.parent.data.id,"false",successCB,failureCB);
//			                    	   }
//			                       }],
			                       	postApplyProperties: function(){
			                        	if (this.data.id == -1) {
			                            	this.set("visible", false);
			                            	return;
			                        	}			                        	
//			                        	if (this.data.enable==="true") {																
//											this.children[0].enabled = false;
//											this.children[1].enabled = true;
//										}else{
//											this.children[0].enabled = true;
//											this.children[1].enabled = false;
//										}
											
			                    	}
			                     }
			            },
			            {
				            //deleting an env 
				            colWidth:25,
			                dataWidget: {
			                    scriptClass: "mstrmojo.Button",
			                   // cssText:"background:url(images/delete.gif) no-repeat center right;padding-left: 35px;",
			                    iconClass:"envgrid-delete-env-button-icon",
			                    title: mstrmojo.desc(8654,"Delete Environment"),
			                    
			                    		                    
			                    postApplyProperties: function(){
			                         if (this.data.id == -1) {
									 	this.set("visible", false);
									 }
	                    		},
	                    		
	                    		onclick:function(event){	                    			                    			
	                    			
	                    			// Insert a Warning Dialog Box 
	                    			var msg = mstrmojo.desc(8655,"Are you sure you want to delete the environment") + ", " + mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name.bold() + "?" + 
    		                		"<br>" ;
    		                		var msg1 = "Deleting this Environment will suppress this item from view. It may or may not be restored when reconnecting the Master Health Agent or refreshing the topology";
	                    			mstrmojo.insert({
	                    		            scriptClass: 'mstrmojo.WarningDialog',
	                    		            id: "DeleteEnvDialog",
	                    		            title: mstrmojo.desc(3610,"MicroStrategy Web"), //Descriptor: MicroStrategy Web
	                    		            width: '600px',	                    		           
	                    		            buttons: 
	                    		            	[
	                    		            	 // Construct the OK Button and its functionality
	 	                    					mstrmojo.Button.newInteractiveButton(
	 	                    					mstrmojo.desc(1442,"OK"), 
	 	                    					function()
	 	                    					{
	 	                    						mstrmojo.all.IPAOverlayBox.set('visible', true);	                    						
	 	                    						var successCB = function(res)
	 	                    						{	                
	 	                    							
	 	                    							//mstrmojo.all.IPAOverlayBox.set('visible', false);	                    							
	 	                    							mstrmojo.all.environmentController.getEnvironmentList(
	 	                    									null,function()
	 	                    									     {	                    											
	 	                    											if(mstrmojo.all.IPAConfigEnvironmentGrid.items.length>1)
	 	                    											{
	 	                    												if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex>0)
	 	                    													mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex-1);
	 	                    												mstrmojo.all.environmentModel.configEnvGridSuccess();
	 	                    												mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
	 	                    											}
	 	                    											else
	 	                    												location.reload(true);
	 	                    									     },
	 	                    									     function()
	 	                    									     {
	 	                    									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
	 	                    									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
	 	                    									     });
	 	                    							//location.reload(true);
	 	                    							mstrmojo.all.DeleteEnvDialog.destroy();
	 	                    						};
	 		                            	
	 	                    						var failureCB = function(res)
	 	                    						{		                    					
	 	                    							
	 	                    							mstrmojo.all.IPAOverlayBox.set('visible', false);	                    					
	 	                    							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
	 	                    							mstrmojo.all.DeleteEnvDialog.destroy();
	 		           		             			};
	 		           		             			
	 		           		             			mstrmojo.all.environmentController.deleteEnvironment(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,successCB, failureCB);
	 		           		             		},		           		             		
	 		           		             		null, 
	 		           		             		{   //Descriptor: Yes
	 	                                            scriptClass: "mstrmojo.HTMLButton",
	 	                                            cssClass: 'mstrmojo-Editor-button',
	 	                                            //text: "OK",
	 	                                            cssText: 'width:72px;'
	 	                                        }),
	 	                                        // Construct the Cancel Button 
	 	                                        mstrmojo.Button.newInteractiveButton(mstrmojo.desc(221,"Cancel"), 
	 	                                        function()
	 	                                        {
	 	                                        	mstrmojo.all.DeleteEnvDialog.destroy();
	 	                                        },
	 	                                        null, 
	 	                                        { //Descriptor: No
	 	                                            scriptClass: "mstrmojo.HTMLButton",
	 	                                            //cssClass: 'mstrmojo-Editor-button',
	 	                                            //text: "Cancel",
	 	                                            cssText: 'width:72px;'
	 	                                        })
	 	                                        ],
	                    		            children: [{
	                    		            		scriptClass:"mstrmojo.HBox",
	     	    		    	 	        	  	children:[
	     	    		    	 	        	  	          {
	     	    		    	 	        	  	        	  scriptClass: 'mstrmojo.Label',
	     	    		    	 	        	  	        	  cssText : 'position:absolute;left:80px;top:40px;',
	     	    		    	 	        	  	        	  text: msg,
//	                    		                		mstrmojo.desc(8655,"Are you sure you want to delete the environment") + ", " + mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name.bold() + "?\n" + 
//	                    		                		"\r\n" +
//	                    		                		"\r\nDeleting this Environment will suppress this item from view. It may or may not be restored when reconnecting the Master Health Agent or refreshing the topology",
	     	    		    	 	        	  	          },
	     	    		    	 	        	  	          {
	     	    		    	 	        	  	        	  scriptClass: 'mstrmojo.Label',
	     	    		    	 	        	  	        	  cssText : 'position:relative;left:75px;top:10px;width:500px;',
	     	    		    	 	        	  	        	  text: msg1,
	     	    		    	 	        	  	          }
	     	    		    	 	        	  	          ]
	                    		                   
	                    		            }],	                    		           
	                    		        }).render();
	                    			 
	                    			 
//	                    			mstrmojo.confirm("Are you sure you want to delete the environment, " + mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name.bold() + "?",
//	                    					[
//	                    					// Construct the OK Button and its functionality
//	                    					mstrmojo.Button.newInteractiveButton(mstrmojo.desc(219), 
//	                    					function()
//	                    					{
//	                    						mstrmojo.all.IPAOverlayBox.set('visible', true);	                    						
//	                    						var successCB = function(res)
//	                    						{	                
//	                    							mstrmojo.all.IPAOverlayBox.set('visible', false);	                    							
//	                    							mstrmojo.all.environmentController.getEnvironmentList(
//	                    									null,function()
//	                    									     {	                    											
//	                    											if(mstrmojo.all.IPAConfigEnvironmentGrid.items.length>1)
//	                    											{
//	                    												if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex>0)
//	                    													mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex-1);
//	                    												mstrmojo.all.environmentModel.configEnvGridSuccess();
//	                    												mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//	                    											}
//	                    											else
//	                    												location.reload(true);
//	                    									     },
//	                    									     function()
//	                    									     {
//	                    									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
//	                    									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//	                    									     });
//	                    							//location.reload(true);
//	                    						};
//		                            	
//	                    						var failureCB = function(res)
//	                    						{		                    					
//	                    							mstrmojo.all.IPAOverlayBox.set('visible', false);	                    					
//	                    							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
//		           		             			};
//		           		             	
//		           		             			mstrmojo.all.environmentController.deleteEnvironment(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,successCB, failureCB);
//		           		             		},		           		             		
//		           		             		null, 
//		           		             		{   //Descriptor: Yes
//	                                            scriptClass: "mstrmojo.HTMLButton",
//	                                            cssClass: 'mstrmojo-Editor-button',
//	                                            text: "OK",
//	                                            cssText: 'width:72px;'
//	                                        }),
//	                                        // Construct the Cancel Button 
//	                                        mstrmojo.Button.newInteractiveButton(mstrmojo.desc(218), null, null, 
//	                                        { //Descriptor: No
//	                                            scriptClass: "mstrmojo.HTMLButton",
//	                                            cssClass: 'mstrmojo-Editor-button',
//	                                            text: "Cancel",
//	                                            cssText: 'width:72px;'
//	                                        })
//	                                        ],mstrmojo.desc(3610));
	                    		}
	                    	}
			                	                
			            }]//End of columns			                
	});

})();
