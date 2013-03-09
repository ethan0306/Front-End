( function() {

	mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo.Table", "mstrmojo.VBox",
			"mstrmojo.Label", "mstrmojo.TextBox", "mstrmojo.HBox",
			"mstrmojo.IPA.IPABuildEnvironments", "mstrmojo.IPA.ConfigModel");

	mstrmojo.requiresDescs(8638,8565,16,8639,766,8640,8641,7853,776,3124,2827,765);
	mstrmojo.IPA.IPAConnectMHA = mstrmojo
			.insert( {
				id : "IPAConnectMHA",
				scriptClass:"mstrmojo.CollapsibleContainer",
				cssClass:"mstrmojo-mha-panel",
		        titleBar:{
		            scriptClass: "mstrmojo.Box",
		            cssClass : "mstrmojo-mha-title",
		            cssText:"position:relative;", 
		            children:[
		                            			// Expand-Collapse Button
		                            			{
		                                            scriptClass: "mstrmojo.Button",
		                                            id:"MHAToggleButton",
		                                            cssText:"margin-left:-10px;margin-right:10px;margin-bottom:1px;height:25px;width:50px;",		                                            
		                                            postApplyProperties:function(){
		                                                            if(this.parent.parent.expanded){
		                                                                            this.iconClass = "mstrmojo-collapse-button";
		                                                            }else{
		                                                                            this.iconClass = "mstrmojo-expand-button";
		                                                            }
		                                            },
		                                            bindings :{
		                                        		iconClass : function()
		                                        		{ 
		                                            		if(this.parent.parent.expanded)
		                                            		{
		                                            			if(this.domNode)
		                                            			{	
	                                        						mstrmojo.css.toggleClass(this.domNode, "mstrmojo-expand-button", false);
		                                            				mstrmojo.css.toggleClass(this.domNode, "mstrmojo-collapse-button", true);
		                                            			}
		                                            			else
		                                            				return "mstrmojo-collapse-button";
		                                            		}
		                                            		else
		                                            		{
		                                            			if(this.domNode)
		                                            			{
		                                            				mstrmojo.css.toggleClass(this.domNode, "mstrmojo-collapse-button", false);
	                                        						mstrmojo.css.toggleClass(this.domNode, "mstrmojo-expand-button", true);
		                                            			}
		                                            			else
		                                            				return "mstrmojo-expand-button"; 
		                                            		}
		                                        		}
		                                            },
		                                            onclick: function (){		                                            				
		                                                            this.parent.parent.set("expanded", !this.parent.parent.expanded);		                                                            
		                                                            this.parent.parent.toggleExpandImg(this.domNode);
		                                                            }
		                                        },
		                                        
		                                        // Title Text
		                                        
		                                        {
		                                                            scriptClass: "mstrmojo.Label",		                                                           
		                                                            cssText : "font-weight: bold;font-family: Tahoma;color:#fefcfc;font-size: 1.2em;position:absolute;top:23px;left:45px;",		                                                            
		                                                            text:  mstrmojo.desc(8638,"Connect to Master Health Agent"),
                                                            	
		                                        },
		                                        
		                                        // Status Button
//		                                        {
//		                                        	scriptClass : "mstrmojo.Button",
//		                                        	cssText:"margin-left:2px;margin-right:10px;margin-top:1px;margin-bottom:1px;height:25px;position:absolute;top:150px;left:510px;width:50px;",		                                        	
//		                                        	postApplyProperties:function(){		                                        				
//                                                    			if(this.parent.parent.status){
//                                                                    this.iconClass = "mstrmojo-mhaConnect-button";                                                                    
//                                                    			}else{
//                                                                    this.iconClass = "mstrmojo-mhaDisconnect-button";
//                                                    			}
//		                                        	},
//		                                        	bindings :{
//		                                        		iconClass : function()
//		                                        		{	
//		                                        			if(this.parent.parent.status)
//		                                        				{
//		                                        					if(this.domNode)
//		                                        					{
//		                                        						mstrmojo.css.toggleClass(this.domNode, "mstrmojo-mhaDisconnect-button", false);
//		                                        						mstrmojo.css.toggleClass(this.domNode, "mstrmojo-mhaConnect-button", true);
//		                                        					}
//		                                        					else
//		                                        						return "mstrmojo-mhaConnect-button";
//		                                        					
////		                                        					if(mstrmojo.all.MHAToggleButton.domNode)
////		                                        					{
////		                                        						mstrmojo.css.toggleClass(mstrmojo.all.MHAToggleButton.domNode, "mstrmojo-collapse-button", false);
////		                                        						mstrmojo.css.toggleClass(mstrmojo.all.MHAToggleButton.domNode, "mstrmojo-expand-button", true);
////		                                        					}	
//		                                        				}
//		                                        			else
//		                                        				{
//		                                        					if(this.domNode)
//		                                        					{
//		                                        						mstrmojo.css.toggleClass(this.domNode, "mstrmojo-mhaConnect-button", false);
//		                                        						mstrmojo.css.toggleClass(this.domNode, "mstrmojo-mhaDisconnect-button", true);
//		                                        					}
//		                                        					else
//		                                        			 	return "mstrmojo-mhaDisconnect-button";
//		                                        				}                                        			
//
//		                                        		},		                                        		
//		                                        	}
//		                                        	
//		                                        },
		                                        {
		                                        	scriptClass: "mstrmojo.Label",		                                        	
                                                    bindings:
                                                    {
		                                        		text:function()
		                                        		{		                                        			
		                                        			if(this.parent.parent.status)	
		                                        				return mstrmojo.desc(776,"Connected") + " " + mstrmojo.desc(3124,"to") + " " + mstrmojo.all.machineNameTextBox.value;		                                        			
		                                        			else		                                        					
		                                        					return mstrmojo.desc(7853,"Not Connected");	                                        				
		                                        		},
		                                        		cssText : function()
		                                        		{
		                                        			if(this.parent.parent.status)		                                        						                                        			
		                                        				return "font-family: Tahoma;font-size:8.5pt;position:absolute;top:40px;left:50px;width:300px;color:#4af729;text-shadow:none";
		                                        			else		                                        				
																return "font-family: Tahoma;font-size:8.5pt;position:absolute;top:40px;left:50px;width:300px;color:#F74E4E;text-shadow:none";
		                                        		},
                                                    }
		                                        },
		                                        {
		                                            scriptClass: "mstrmojo.Button",
		                                            id:"MHAIconButton",
		                                            cssText:"position:absolute;left:620px;top:0px;",		                                            
		                                            postApplyProperties:function(){
		                                        					this.iconClass ="mstrmojo-mha-icon";		                                                            
		                                            },
		                                        }
		                                        
		            ]              
				},
				expanded: true,			
				status: false,
				configModel : null,
				children : [ {
					scriptClass : "mstrmojo.Table",
					id : "MHAInputTable",
					cssClass : "mstrmojo-mha-table",
					rows : 4,
					cols : 4,
					connect : function() {
						mstrmojo.all.IPAOverlayBox.set('visible', true);
						if (!mstrmojo.all.environmentController
								.isAValidPortNumber(mstrmojo.all.portTextBox.value)) {
							mstrmojo.all.portTextBox.focus();
							mstrmojo.all.IPAOverlayBox.set('visible', false);
							mstrmojo.all.MHAServerPortNotValidLabel.set(
									'visible', true);
							return;
						}

						configModel = this.parent.configModel;

						var successCB = function(res) {							
							// Set the text-box and buttons
							mstrmojo.all.machineNameTextBox.set('enabled',false);
							mstrmojo.all.portTextBox.set('enabled',false);
							mstrmojo.all.accessCodeTextBox.set('enabled',false);
							mstrmojo.all.connectMHAButton.set('visible',false);
							mstrmojo.all.clearMHAButton.set('visible',false);
							mstrmojo.all.disconnectMHAButton.set('visible',true);
							// Set other panels
							configModel.set("refreshMHAConnection", true);							
							mstrmojo.all.IPABuildEnvironments.set('visible',true);
							mstrmojo.all.MHAServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.IPAConnectMHA.set("status", true);
							mstrmojo.all.IPAAddEnvironmentManuallyTable.set("mhaStatus", true);
							mstrmojo.all.IPAAddServerManuallyTable.set("mhaStatus", true);
							mstrmojo.all.IPABuildEnvironments.set("mhaStatus", true);
							mstrmojo.all.NoEnvLabel.set('visible', false);
							mstrmojo.all.IPAConnectMHA.set("expanded", false);
							mstrmojo.all.IPAAddEnvironmentManually.set('visible', true);
							mstrmojo.all.IPAConfigEnvironmentGrid.set('visible',true);

							mstrmojo.all.environmentController.getEnvironmentList(
									null,function()
									     {											
											mstrmojo.all.environmentModel.configEnvGridSuccess();
											mstrmojo.all.IPAConfigEnvironmentGrid.sort("name",true);
											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();											
									     },
									     function()
									     {
									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
									    	 mstrmojo.all.IPAOverlayBox.set('visible', false);
									     });
					
						};

						var failureCB = function(res) {							
							mstrmojo.all.IPAOverlayBox.set('visible', false);
							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));							
							mstrmojo.all.IPAConnectMHA.set("status", false);
						};

						mstrmojo.all.environmentController.connectToMHA(
								mstrmojo.all.machineNameTextBox.value,
								mstrmojo.all.portTextBox.value,
								mstrmojo.all.accessCodeTextBox.value,
								successCB, failureCB);						
					},
					disconnect : function()
					{	
						mstrmojo.all.IPAOverlayBox.set('visible', true);
						var successCB = function(res) {
							// Set the text-box and buttons
							mstrmojo.all.machineNameTextBox.set('enabled',true);
							mstrmojo.all.portTextBox.set('enabled',true);
							mstrmojo.all.accessCodeTextBox.set('enabled',true);
							mstrmojo.all.connectMHAButton.set('visible',true);
							mstrmojo.all.clearMHAButton.set('visible',true);
							mstrmojo.all.disconnectMHAButton.set('visible',false);
							// Set other panels
							mstrmojo.all.IPABuildEnvironments.set('visible',true);
							mstrmojo.all.MHAServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.IPAConnectMHA.set("status", false);
							mstrmojo.all.IPAAddEnvironmentManuallyTable.set("mhaStatus", false);
							mstrmojo.all.IPAAddServerManuallyTable.set("mhaStatus", false);
							mstrmojo.all.IPABuildEnvironments.set("mhaStatus", false);
							mstrmojo.all.NoEnvLabel.set('visible', false);
							mstrmojo.all.IPAConnectMHA.set("expanded", true);
							mstrmojo.all.IPAAddEnvironmentManually.set('visible', true);
							mstrmojo.all.IPAConfigEnvironmentGrid.set('visible',true);
//							mstrmojo.all.machineNameTextBox.set('enabled',false);
//							mstrmojo.all.portTextBox.set('enabled',false);
//							mstrmojo.all.accessCodeTextBox.set('enabled',false);
//							mstrmojo.all.connectMHAButton.set('text',"Disconnect");
							mstrmojo.all.environmentController.getEnvironmentList(
									null,function()
									     {											
											mstrmojo.all.environmentModel.configEnvGridSuccess();
											mstrmojo.all.IPAConfigEnvironmentGrid.sort("name",true);
											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();											
									     },
									     function()
									     {
									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
									    	 mstrmojo.all.IPAOverlayBox.set('visible', false);
									     });
					
						};
						var failureCB = function(res) {							
							mstrmojo.all.IPAOverlayBox.set('visible', false);
							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));							
							mstrmojo.all.IPAConnectMHA.set("status", false);
						};
						mstrmojo.all.environmentController.disconnectFromMHA(								
								successCB, failureCB);
						
					},
					
					clear : function()
					{	
						mstrmojo.all.IPAOverlayBox.set('visible', true);
						var successCB = function(res) {								
							// Set the text-box and buttons
							mstrmojo.all.machineNameTextBox.set('enabled',true);
							mstrmojo.all.machineNameTextBox.set('value',"");
							mstrmojo.all.portTextBox.set('enabled',true);
							mstrmojo.all.portTextBox.set('value',44440);
							mstrmojo.all.accessCodeTextBox.set('enabled',true);
							mstrmojo.all.accessCodeTextBox.set('value',"");
							mstrmojo.all.connectMHAButton.set('visible',true);
							mstrmojo.all.clearMHAButton.set('visible',false);
							mstrmojo.all.disconnectMHAButton.set('visible',false);
							// Set other panels
							mstrmojo.all.IPABuildEnvironments.set('visible',true);
							mstrmojo.all.MHAServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.IPAConnectMHA.set("status", false);
							mstrmojo.all.IPAAddEnvironmentManuallyTable.set("mhaStatus", false);
							mstrmojo.all.IPAAddServerManuallyTable.set("mhaStatus", false);
							mstrmojo.all.IPABuildEnvironments.set("mhaStatus", false);
							mstrmojo.all.NoEnvLabel.set('visible', false);
							mstrmojo.all.IPAConnectMHA.set("expanded", false);
							mstrmojo.all.IPAAddEnvironmentManually.set('visible', true);
							mstrmojo.all.IPAConfigEnvironmentGrid.set('visible',true);
//							mstrmojo.all.machineNameTextBox.set('enabled',false);
//							mstrmojo.all.portTextBox.set('enabled',false);
//							mstrmojo.all.accessCodeTextBox.set('enabled',false);
//							mstrmojo.all.connectMHAButton.set('text',"Disconnect");
							mstrmojo.all.environmentController.getEnvironmentList(
									null,function()
									     {											
											mstrmojo.all.environmentModel.configEnvGridSuccess();
											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();											
									     },
									     function()
									     {
									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
									    	 mstrmojo.all.IPAOverlayBox.set('visible', false);
									     });
					
						};
						var failureCB = function(res) {							
							mstrmojo.all.IPAOverlayBox.set('visible', false);
							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));							
							mstrmojo.all.IPAConnectMHA.set("status", false);
						};
						mstrmojo.all.environmentController.clearMHA(								
								successCB, failureCB);
						
					},
					children : [ {
						slot : "0,0",
						scriptClass : "mstrmojo.Label",
						cssClass : "mstrmojo-mhatable-labels",
						text : mstrmojo.desc(8565,"Machine Name"),
					}, {
						slot : "0,1",
						scriptClass : "mstrmojo.TextBox",
						cssClass:"mstrmojo-configPage-textbox",
						size : 30,
						id : "machineNameTextBox",
						cssClass : "mstrmojo-textboxes",
						onEnter : function()
						{
							this.domNode.blur();							
							this.parent.connect();							
						}
					}, {
						slot : "1,0",
						scriptClass : "mstrmojo.Label",
						cssClass : "mstrmojo-mhatable-labels",
						text : mstrmojo.desc(16,"Port"),
					}, {
						slot : "1,1",
						scriptClass : "mstrmojo.TextBox",
						cssClass:"mstrmojo-configPage-textbox",
						id : "portTextBox",
						size : 5,
						maxLength : 5,
						value : 44440,
						onEnter : function()
						{								
							this.domNode.blur();
							this.parent.connect();							
						}
					}, {
						slot : "2,0",
						scriptClass : "mstrmojo.Label",
						cssClass : "mstrmojo-mhatable-labels",
						text : mstrmojo.desc(8639,"Access Code"),
					}, {
						slot : "2,1",
						scriptClass : "mstrmojo.TextBox",
						id : "accessCodeTextBox",
						size : 30,
						type : 'password',
						onEnter : function()
						{	
							this.domNode.blur();
							this.parent.connect();							
						}
					}, {
						slot : "2,2",
						scriptClass : "mstrmojo.HTMLButton",						
						cssClass : "mstrmojo-connect-button",
						cssText:"Width:auto;",
						title : mstrmojo.desc(8640,"Connect to MHA"),
						text : mstrmojo.desc(766,"Connect"),
						id : "connectMHAButton",
						// The HTML Button is rendered in input tag, which can not be greyed out(though it can be enabled/disabled)
//						enabled : false,

//						bindings : {
//							enabled : function() {
//								if (mstrmojo.all.machineNameTextBox.value) {
//									if (mstrmojo.all.portTextBox.value) {
//										return true;
//									}
//								}
//
//								return false;
//							}
//						},

						//By default tab ordering doesn't work in div tags. Button is rendered in div tag
						// set the tab index to get tab ordering.
//						postBuildRendering : function() {
//							this.textNode.tabIndex = 0;
//						},

						onclick : function() {
							this.parent.connect();
						}
					},
					{
						slot : "2,3",
						scriptClass : "mstrmojo.HTMLButton",						
						cssClass : "mstrmojo-connect-button",
						cssText:"text-align:center;",					
						title:"Clear MHA Configuration",						
						text : mstrmojo.desc(2827,"Clear"),
						id : "clearMHAButton",
						visible : false,
						onclick : function() {							
							this.parent.clear();
						}
					},
					{
						slot : "2,2",
						scriptClass : "mstrmojo.HTMLButton",						
						cssClass : "mstrmojo-connect-button",
						cssText:"width:80px;",
						//title : mstrmojo.desc(8640,"Connect to MHA"),						
						//text : mstrmojo.desc(766,"Connect"),
						title:"Diconnect from MHA",
						//text:"Disconnect",
						text : mstrmojo.desc(765,"Disconnect"),
						id : "disconnectMHAButton",
						visible:false,
						onclick : function() {
							this.parent.disconnect();
						}
					},
					{
						slot : "3,1",
						scriptClass : "mstrmojo.Label",
						cssClass : "mstrmojo-NoEnvLabel",
						id : "MHAServerPortNotValidLabel",
						text : mstrmojo.desc(8641,"MHA port value is not valid!") + "!",
						visible : false
					} ],
					// end mha table children
					postApplyProperties : function() {
						this.parent.getMHAStatus();
					}
				} ],

				getMHAStatus : function() {
					var callback = {
						success : function(res) {						
						//If Status if MHA is Connected, then show connected
							if (res.status != "CONNECTED") {
								// IF MHA is not connected, it might be configured
								mstrmojo.all.machineNameTextBox.set('enabled',true);
								mstrmojo.all.portTextBox.set('enabled',true);
								mstrmojo.all.accessCodeTextBox.set('enabled',true);
								mstrmojo.all.connectMHAButton.set('visible',true);
								mstrmojo.all.disconnectMHAButton.set('visible',false);
								if (res.status == "CONFIGURED") {
									mstrmojo.all.machineNameTextBox.set('value', res.name);
									mstrmojo.all.portTextBox.set('value',res.port);
									mstrmojo.all.IPABuildEnvironments.set('visible', true);
									mstrmojo.all.IPAConnectMHA.set("status",false);
									mstrmojo.all.IPAAddEnvironmentManuallyTable.set("mhaStatus", false);
									mstrmojo.all.IPAAddServerManuallyTable.set("mhaStatus", false);
									mstrmojo.all.IPABuildEnvironments.set("mhaStatus", false);
									mstrmojo.all.IPAConnectMHA.set("expanded",true);
									mstrmojo.all.IPAAddEnvironmentManually.set('visible', false);
									mstrmojo.all.clearMHAButton.set('visible',true);								
								}
								// mha not configured
								else {									
									mstrmojo.all.IPAConnectMHA.set("status",false);
									mstrmojo.all.IPAAddEnvironmentManuallyTable.set("mhaStatus", false);
									mstrmojo.all.IPAAddServerManuallyTable.set("mhaStatus", false);
									mstrmojo.all.IPABuildEnvironments.set("mhaStatus", false);
									mstrmojo.all.IPAConnectMHA.set("expanded",true);
									mstrmojo.all.IPAAddServerManually.set('visible', true);
									mstrmojo.all.IPAAddEnvironmentManually.set('expanded', true);
									mstrmojo.all.clearMHAButton.set('visible',false);									
								}
							} else {
								mstrmojo.all.machineNameTextBox.set('value',res.name);
								mstrmojo.all.portTextBox.set('value', res.port);
								mstrmojo.all.accessCodeTextBox.set('value',res.accesscode);								
								mstrmojo.all.IPAConnectMHA.set("status", true);
								mstrmojo.all.IPAAddEnvironmentManuallyTable.set("mhaStatus", true);
								mstrmojo.all.IPAAddServerManuallyTable.set("mhaStatus", true);
								mstrmojo.all.IPABuildEnvironments.set("mhaStatus", true);
								mstrmojo.all.IPAConnectMHA.set("expanded",false);
								mstrmojo.all.machineNameTextBox.set('enabled',false);
								mstrmojo.all.portTextBox.set('enabled',false);
								mstrmojo.all.accessCodeTextBox.set('enabled',false);
								mstrmojo.all.disconnectMHAButton.set('visible',true);
								mstrmojo.all.connectMHAButton.set('visible',false);
							}
						},
						failure : function(res) {
							if (res) {								
								mstrmojo
										.alert(res
												.getResponseHeader("X-MSTR-TaskFailureMsg"));
							}
						}
					};					
					mstrmojo.xhr.request('POST', mstrConfig.taskURL,
							callback, {
								taskId : 'getMHAStatusTask'
							});
				}
			} // end of parent VBox Children
			);

}());