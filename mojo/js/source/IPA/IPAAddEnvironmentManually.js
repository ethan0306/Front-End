( function() {

	mstrmojo.requiresCls("mstrmojo.Table", "mstrmojo.VBox", "mstrmojo.Label",
			"mstrmojo.TextBox", "mstrmojo.HBox", "mstrmojo.CollapsiblePanel","mstrmojo.Panel");
	mstrmojo.requiresDescs(8642,8643,8644,8645,531,8646,8647,8648,8649,8650,8639,8914,16,662);
	
	mstrmojo.IPA.IPAAddEnvironmentManually = mstrmojo
			.insert( {
//				scriptClass : "mstrmojo.CollapsiblePanel",
//				//cssClass : "mstrmojo-collapsiblepanel-rightside",
//				cssClass : "mstrmojo-Add-Environment-Manually",
//				id : "IPAAddEnvironmentManually",
//				status : "false",
//				title : mstrmojo.desc(8642,"Add an Environment Manually"),
//				//titleCssClass : "mstrmojo-collapsiblepanel-rightside-title",
//				titleCssClass : "mstrmojo-Add-Environment-Manually-title",
//				successImg : "../images/1ptrans.gif", //blank image
				
				id : "IPAAddEnvironmentManually",
				scriptClass:"mstrmojo.CollapsibleContainer",
				cssClass:"mstrmojo-Add-Environment-Manually",
		        titleBar:{
		            scriptClass: "mstrmojo.Box",
		            cssClass : "mstrmojo-Add-Environment-Manually-title",
		            cssText:"position:relative;", 
		            children:[
		                            			// Expand-Collapse Button
		                            			{
		                                            scriptClass: "mstrmojo.Button",
		                                            id:"IPAddEnvToggleButton",
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
		                                                            cssText : "font-weight: bold;font-family: Tahoma;color:#6e6d6d;font-size: 1.2em;position:absolute;top:23px;left:45px;",		                                                            
		                                                            text:  mstrmojo.desc(8642,"Add an Environment Manually"),
                                                            	
		                                        },		                                        
		                                      
		                                        {
		                                            scriptClass: "mstrmojo.Button",
		                                            id:"AddEnvIconButton",
		                                            cssText:"position:absolute;left:620px;top:0px;",		                                            
		                                            postApplyProperties:function(){
		                                        					this.iconClass ="mstrmojo-AddEnv-icon";		                                                            
		                                            },
		                                        },
//		                                        {
//		                                            scriptClass: "mstrmojo.Button",
//		                                            //id:"AddEnvIconButton",
//		                                            cssText:"position:relative;top:15px;left:330px;",
//		                                            //visible:true,
//		                                            postApplyProperties:function(){
//		                                        					debugger;
//		                                        					this.iconClass ="mstrmojo-Drag-icon";
//		                                            },
//		                                            bindings:{
//		                                            	visible:function()
//		                                            	{
//		                                            		if(this.parent.parent.expanded)
//		                                            			return false;
//		                                            		else
//		                                            			return true;		                                            			
//		                                            	}
//		                                            },
//		                                        },
		                                        
		            ]              
				},
				expanded: true,
				children : [ {
					scriptClass : "mstrmojo.Table",
					cssClass : "mstrmojo-IPAAddEnvironmentManually",
					id : "IPAAddEnvironmentManuallyTable",
					mhaStatus : false,
					rows : 6,
					cols : 3,
					//**** Login function  ****/
					login : function() {						
						mstrmojo.all.IServerPortNotValidLabel.set('visible', false);
						mstrmojo.all.BlankEnvironmentNameLabel.set('visible',false);
						mstrmojo.all.BlankIServerNameLabel.set('visible',false);
						mstrmojo.all.BlankNamesValidLabel.set('visible',false);
						// Check Port Number
						if (!mstrmojo.all.environmentController
								.isAValidPortNumber(mstrmojo.all.IServerPortBox.value)) {
							mstrmojo.all.IServerPortBox.focus();
							mstrmojo.all.IServerPortNotValidLabel.set('visible', true);
							return;
						}
						// Check White Spaces(not allowed in the name)
						var checkWhiteSpace = new RegExp(/^\s+$/);
						if (checkWhiteSpace.test(mstrmojo.all.IServerMachineNameBox.value)) {
							mstrmojo.all.IServerMachineNameBox.focus();
							mstrmojo.all.IServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.BlankEnvironmentNameLabel.set('visible',false);
							mstrmojo.all.BlankIServerNameLabel.set('visible',false);
							mstrmojo.all.BlankNamesValidLabel.set('visible',true);
							setTimeout("mstrmojo.all.BlankNamesValidLabel.set('visible',false);",5000);
							return;
						}

						if (checkWhiteSpace.test(mstrmojo.all.EnvNameTextBox.value)) {
							mstrmojo.all.EnvNameTextBox.focus();
							mstrmojo.all.IServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.BlankEnvironmentNameLabel.set('visible',false);
							mstrmojo.all.BlankIServerNameLabel.set('visible',false);
							mstrmojo.all.BlankNamesValidLabel.set('visible',true);
							setTimeout("mstrmojo.all.BlankNamesValidLabel.set('visible',false);",5000);
							return;
						}
						// Check for Blank values in Environment Name and I-Server Name
						if (!mstrmojo.all.EnvNameTextBox.value)
						{
							mstrmojo.all.EnvNameTextBox.focus();
							mstrmojo.all.IServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.BlankIServerNameLabel.set('visible',false);
							mstrmojo.all.BlankNamesValidLabel.set('visible',false);
							mstrmojo.all.BlankEnvironmentNameLabel.set('visible',true);
							setTimeout("mstrmojo.all.BlankEnvironmentNameLabel.set('visible',false);",5000);
							return;
						}
						else if(!mstrmojo.all.IServerMachineNameBox.value)
						{
							mstrmojo.all.IServerMachineNameBox.focus();
							mstrmojo.all.IServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.BlankNamesValidLabel.set('visible',false);
							mstrmojo.all.BlankEnvironmentNameLabel.set('visible',false);
							mstrmojo.all.BlankIServerNameLabel.set('visible',true);
							setTimeout("mstrmojo.all.BlankIServerNameLabel.set('visible',false);",5000);
							return;
						}
						// Add Environment 
						mstrmojo.all.IPAOverlayBox.set('visible', true);
						var server = {};
						server.n = "server";
						server.i = "e1";
						server.type = "IServer";
						server.name = mstrmojo.all.IServerMachineNameBox.value;
						server.port = mstrmojo.all.IServerPortBox.value;
						// mstrmojo.all.environmentController.unconnectedServers.push(server);
						mstrmojo.all.environmentController.selectedServers
								.push(server);

						var env = {
							n : "env",
							name : mstrmojo.all.EnvNameTextBox.value,
							i : "newe0",
							enable : "true"
						};

						var successCB = function(res) {
							if(mstrmojo.all.IPAConnectMHA.status)
							{								
								if(mstrmojo.all.AddAgentPortNumberTextBox.value!="")
									mstrmojo.all.IPAAddEnvironmentManuallyTable.addHCToToplogy();
								else
									mstrmojo.all.IPAAddEnvironmentManuallyTable.setComponents();
							}
							else
								mstrmojo.all.IPAAddEnvironmentManuallyTable.setComponents();
						};

						var failureCB = function(res) {
							mstrmojo.all.IPAOverlayBox.set('visible', false);														
							mstrmojo.all.IServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.BlankNamesValidLabel.set('visible',false);
							mstrmojo.all.NoEnvLabel.set('visible',false);														
							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
						};

						mstrmojo.all.environmentController
								.createEnvironmentwithServers(env, successCB,
										failureCB);
					},
					addHCToToplogy : function()
					{												
						
						var successCB = function(res)
						{							
							mstrmojo.all.IPAAddEnvironmentManuallyTable.setComponents();
						};
						var failureCB = function(res)
						{
							
							//mstrmojo.all.IPAOverlayBox.set('visible', false);														
							mstrmojo.all.IServerPortNotValidLabel.set('visible', false);
							mstrmojo.all.BlankNamesValidLabel.set('visible',false);
							mstrmojo.all.NoEnvLabel.set('visible',false);
							mstrmojo.all.IPAAddEnvironmentManuallyTable.setComponents();
							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));														
						};
						
						mstrmojo.all.environmentController.addHCAgentToMHA(
								mstrmojo.all.IServerMachineNameBox.value,
								mstrmojo.all.AddAgentPortNumberTextBox.value,
								mstrmojo.all.AddAgentAccessCodeTextBox.value,
								successCB,failureCB);
					},
					setComponents : function()
					{
						
						mstrmojo.all.NoEnvLabel.set('visible',false);
						// Set components to true, if they are not
						mstrmojo.all.IPAConfigEnvironmentGrid.set('visible', true);
						mstrmojo.all.IPABuildEnvironments.set('visible',true);
						// Load values from the Model
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
								     });
						//location.reload(true);
						mstrmojo.all.EnvironmentPanel.set('visible', true);
						mstrmojo.all.IServerMachineNameBox.set('value','');
						mstrmojo.all.EnvNameTextBox.set('value','New Environment');
						mstrmojo.all.IServerPortBox.set('value','34952');
						mstrmojo.all.AddAgentPortNumberTextBox.set('value','');
						mstrmojo.all.AddAgentAccessCodeTextBox.set('value','');
						mstrmojo.all.IServerMachineNameBox.focus();
					},
					children : [
							{
								slot : "0,0",
								scriptClass : "mstrmojo.Label",
								cssClass : "mstrmojo-mhatable-labels",
								text : mstrmojo.desc(8643,"Intelligence Server Name"),
							},
							{
								slot : "0,1",
								scriptClass : "mstrmojo.TextBox",
								cssClass:"mstrmojo-configPage-textbox",
								id : "IServerMachineNameBox",
								size : 30,
								onEnter : function() {
									this.domNode.blur();
									this.parent.login();
								}
							},
							{
								slot : "1,0",
								scriptClass : "mstrmojo.Label",
								visible : "false",
								text : mstrmojo.desc(8644,"Intelligence Server Port"),
							},
							{
								slot : "1,1",
								id : "IServerPortBox",
								scriptClass : "mstrmojo.TextBox",
								cssClass:"mstrmojo-configPage-textbox",
								size : 5,
								maxLength : 5,
								value:'34952',
								onEnter : function() {
									this.domNode.blur();
									this.parent.login();
								}
							},
							{
								slot : "2,0",
								scriptClass : "mstrmojo.Label",
								cssClass : "mstrmojo-mhatable-labels",
								text : mstrmojo.desc(8645,"Environment Name"),
							},
							{
								slot : "2,1",
								scriptClass : "mstrmojo.TextBox",
								cssClass:"mstrmojo-configPage-textbox",
								id : "EnvNameTextBox",
								size : 30,
								value:'New Environment',
								onEnter : function() {
									this.domNode.blur();
									this.parent.login();
								}
							},
							{
								slot : "2,2",
								scriptClass : "mstrmojo.HTMLButton",
								cssClass : "mstrmojo-addEnv-button",	
								cssText:"width:auto;",
								title : mstrmojo.desc(8646,"Add environment with the I-Server you have entered.") + ".",
								id : "AddEnvironmentManuallyButton",
								text : mstrmojo.desc(531,"Add...") + "...",
								// The HTML Button is rendered in input tag, which can not be greyed out(though it can be enabled/disabled)
								//            	enabled:false,

								// By default tab ordering doesn't work in div tags. Button is rendered in div tag
								// set the tab index to get tab ordering.
								// postBuildRendering:function(){
								// this.textNode.tabIndex=0;
								// },

								// bindings:{
								// enabled : function(){
								// if (mstrmojo.all.IServerMachineNameBox.value)
								// {
								// if (mstrmojo.all.IServerPortBox.value){
								// if (mstrmojo.all.EnvNameTextBox.value) {
								// return true;
								// }
								// }
								// }
								// return false;
								// }
								// },
								bindings:{
						    		visible:function()
						    			{
						    													
											if (this.parent.mhaStatus)
												return false;									
											else 										
												return true;										
						    			}
						    		},
								onclick : function() {
									this.parent.login();
								}
							},
							{
								slot : "3,0",
								scriptClass : "mstrmojo.Label",																
								id : "AddAgentPortNumberLabel",
								//text : mstrmojo.desc(8639,"Access Code"),
								text: mstrmojo.desc(8914,"Health Agent") + " " + mstrmojo.desc(16,"Port") + " (" + mstrmojo.desc(662,"Optional") + ")",
								//visible : false,
								bindings:{
					    		visible:function()
					    			{
					    			
									if (this.parent.mhaStatus)
										return true;									
									else 										
										return false;
					    			}
					    		},
							},
							{
								slot : "3,1",
								scriptClass : "mstrmojo.TextBox",
								cssClass:"mstrmojo-configPage-textbox",
								size : 5,
								maxLength : 5,															
								id : "AddAgentPortNumberTextBox",
								//visible : false,
								bindings:{
						    		visible:function()
						    			{
										
										if (this.parent.mhaStatus)
											return true;									
										else 										
											return false;
						    			}
						    		},
								onEnter : function()
								{
						    		this.domNode.blur();
						    		this.parent.login();
								}
								
							},
							{
								slot : "4,0",
								scriptClass : "mstrmojo.Label",
								cssClass : "mstrmojo-mhatable-labels",								
								id : "AddAgentAccessCodeLabel",
								//text : mstrmojo.desc(8639,"Access Code"),
								text : mstrmojo.desc(8914,"Health Agent") + " " + mstrmojo.desc(8639,"Access Code") + " (" + mstrmojo.desc(662,"Optional") + ")",
								bindings:{
					    		visible:function()
					    			{
									
									if (this.parent.mhaStatus)
										return true;									
									else 										
										return false;
					    			}
					    		},
								
							},
							{
								slot : "4,1",
								scriptClass : "mstrmojo.TextBox",
								id : "AddAgentAccessCodeTextBox",
								size : 30,
								type : 'password',
								//visible : false,
								bindings:{
						    		visible:function()
						    			{
										
										if (this.parent.mhaStatus)
											return true;									
										else 										
											return false;
						    			}
						    		},
								onEnter : function()
								{
						    		this.domNode.blur();
						    		this.parent.login();
								}
							},	
							{
								slot : "4,2",
								scriptClass : "mstrmojo.HTMLButton",
								cssClass : "mstrmojo-addEnv-button",	
								cssText:"width:auto;",
								title : mstrmojo.desc(8646,"Add environment with the I-Server you have entered.") + ".",
								id : "AddEnvironmentManuallyButton1",
								text : mstrmojo.desc(531,"Add...") + "...",
								bindings:{
						    		visible:function()
						    			{										
										if (this.parent.mhaStatus)
											return true;									
										else 										
											return false;
						    			}
						    		},
								onclick : function() {
									this.parent.login();
								}
							},
							{
								slot : "5,1",
								scriptClass : "mstrmojo.Label",
								cssClass : "mstrmojo-NoEnvLabel",
								cssText : "width:200px;",
								id : "IServerPortNotValidLabel",
								text : mstrmojo.desc(8647,"I-server port value is not valid!") + "!",
								visible : false
							}, {
								slot : "5,1",
								scriptClass : "mstrmojo.Label",
								cssClass : "mstrmojo-NoEnvLabel",
								cssText : "width:200px;",
								id : "BlankNamesValidLabel",
								text : mstrmojo.desc(8648,"Blank names are not allowed!") + "!",
								visible : false
							}, {
								slot : "5,1",
								scriptClass : "mstrmojo.Label",
								cssClass : "mstrmojo-NoEnvLabel",
								cssText : "width:200px;",
								id : "BlankEnvironmentNameLabel",
								text : mstrmojo.desc(8649,"Environment name can not be empty!") + "!",
								visible : false
							}, {
								slot : "5,1",
								scriptClass : "mstrmojo.Label",
								cssClass : "mstrmojo-NoEnvLabel",
								cssText : "width:200px;",
								id : "BlankIServerNameLabel",
								text : mstrmojo.desc(8650,"Intelligent Server name can not be empty!") + "!",
								visible : false
							} ]
				},

				
				]
			});
})();