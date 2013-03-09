(function(){

	mstrmojo.requiresCls("mstrmojo.Table", "mstrmojo.VBox","mstrmojo.Label", "mstrmojo.TextBox", 
			"mstrmojo.HBox","mstrmojo.RadioButton");
	
	mstrmojo.requiresDescs(8934,8935,8565,8936,5943,8883,8937,8938,8939,531,8914,16,662,8639,118,221);
	mstrmojo.IPA.IPAAddServerManually = mstrmojo.insert({
		scriptClass:"mstrmojo.CollapsibleContainer",	
		cssClass:"mstrmojo-add-server-manually-panel",		
		id:"IPAAddServerManually",
        titleBar:{
            scriptClass: "mstrmojo.HBox",
            cssClass:"mstrmojo-add-server-manually-title",	
            cssText:"height:18px;",
            markupMethods: {
	  				onvisibleChange: function() { 
	    		   			this.domNode.style.display = 'block';
	    		   			}
	  				 },
            children:[
                            			{
                                            scriptClass: "mstrmojo.Button",
                                            cssText:"margin-left:2px;margin-top:-3px;margin-bottom:1px;height:25px;width:45px;",
                                            postApplyProperties:function(){
                                                            if(this.parent.parent.expanded){
                                                                            this.iconClass = "mstrmojo-collapse-button";
                                                            }else{
                                                                            this.iconClass = "mstrmojo-expand-button";
                                                            }
                                            },
                                            onclick: function (){
                                                            this.parent.parent.set("expanded", !this.parent.parent.expanded);
                                                            this.parent.parent.toggleExpandImg(this.domNode);
                                                            }
                                        },
                                        {
                                                            scriptClass: "mstrmojo.Label",
                                                            id : "IPAAddServerManuallyTitle",
                                                            cssText : "font-family: Tahoma;font-size: 1.0em;font-weight: bold;margin-top:-3px;",
                                                            text:mstrmojo.desc(8934, "Add a Web or Mobile Server Manually"),                                                            	
                                        }
            ]              
		},
		expanded: "true",
		cssText : "margin:10px;",
		children:[{
        scriptClass: "mstrmojo.Table",
       // cssClass: "mstrmojo-IPAAddServerManually",       
       // cssText:"padding-left:7px;",
        id:"IPAAddServerManuallyTable",
        mhaStatus:null,
        rows: 7,
        cols: 3, 
        bindings:{
			cssText : function()
				{						
					debugger;					
					if(this.mhaStatus)
					{
						if(this.domNode)
							this.domNode.style.cssText="padding-left:7px;height:175px;";
						return "padding-left:7px;height:175px;";
					}
					else 
					{
						if(this.domNode)
							this.domNode.style.cssText="padding-left:7px;height:90px;";
						return "padding-left:7px;height:90px;";
					}
				}
			
			},
      //  unconnectedWebServers : [],
      //  unconnectedMobileServers : [],
                checkDuplicate : function (server)
	    		{	    			
					var array;
	    			if(mstrmojo.all.webServerRadioButton.checked)
	    			  array = mstrmojo.all.environmentModel.model.webServers;
	    			else
	    			  array = mstrmojo.all.environmentModel.model.mobileServers;
	    			
	    			if (array) {
	                    for (var i = 0; i < array.length; i++) {		                        
	                            if (
	                            	(array[i].name == server.name)&& 
	                            	(array[i].port == server.port) && 
	                            	((array[i].application == server.application) || (array[i].app == server.application))
	                               )
	                            			return true;		                        
	                    }
	                }
	                return false;
	    		},
	    		
	    		addServerToPanel:function(){
	    			// Servers are validated now
	    			// Create Servers in Topology now
	    			mstrmojo.all.ServerPortNotValidLabel.set('visible',false);
	    			var server= {};
	    			// Check if Web Server is not Duplicate
	    			 if(mstrmojo.all.webServerRadioButton.checked)
	                    {
	                    	server.n = "server";
	                    	server.i = "e2";
	                    	server.type = "Web";
	                    	server.name =  mstrmojo.all.machineNameConnectManuallyBox.value.toUpperCase();
	                    	server.port = mstrmojo.all.webserverport.value;
	                    	server.application = mstrmojo.all.webserverAppName.value;
	                    	if(this.checkDuplicate(server))
	                    	{
	                    			mstrmojo.all.IPAOverlayBox.set('visible', false);
	                    			mstrmojo.all.DuplicateServerLabel.set('visible',true);                    		
	                    			setTimeout("mstrmojo.all.DuplicateServerLabel.set('visible',false)",5000);
	                    			return;
	                    	}	                    	
	                    }	    			
		    			//Check if Mobile Server is not Duplicate
	    			 if(mstrmojo.all.mobileServerRadioButton.checked)
	    			 {
	    				 server.n = "server";
	    				 server.i = "e3";
	    				 server.type = "Mobile";
	    				 server.name =  mstrmojo.all.machineNameConnectManuallyBox.value.toUpperCase();
	    				 server.port = mstrmojo.all.mobileserverport.value;
	    				 server.application = mstrmojo.all.mobileserverAppName.value;
	    				 if(this.checkDuplicate(server))
	    				 {                   		
	    					 mstrmojo.all.IPAOverlayBox.set('visible', false);
	    					 mstrmojo.all.DuplicateServerLabel.set('visible',true);
	    					 setTimeout("mstrmojo.all.DuplicateServerLabel.set('visible',false)",5000);
	    					 return;
	    				 }
	    			 }
	    			 mstrmojo.all.DuplicateServerLabel.set('visible',false);
	    			 var successCB = function(res){
	    				 if(mstrmojo.all.IPAConnectMHA.status)
							{								
								if(mstrmojo.all.HeatthAgentPortNumberTextBox.value!="")
									mstrmojo.all.IPAAddServerManuallyTable.addHCToToplogy();
								else
								{
									 mstrmojo.all.IPAAddServerManuallyTable.setComponents();
			    					 mstrmojo.all.IPAAddServerManuallyTable.refreshModel();
								}
							}
	    				 else
	    				 {
	    					 mstrmojo.all.IPAAddServerManuallyTable.setComponents();
	    					 mstrmojo.all.IPAAddServerManuallyTable.refreshModel();
	    				 }
					};
     	
					var failureCB = function(res){
							mstrmojo.all.IPAOverlayBox.set('visible', false);
							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
					};
					mstrmojo.all.environmentController.createServers(server,successCB, failureCB);
					
	    		},
	    		setComponents : function()
	    		{
	    			mstrmojo.all.machineNameConnectManuallyBox.set('value','');
	    			mstrmojo.all.HeatthAgentPortNumberTextBox.set('value','');
					mstrmojo.all.HealthAgentAccessCodeTextBox.set('value','');
					if (mstrmojo.all.webServerRadioButton.checked) 
					{
						mstrmojo.all.webserverAppName.set('value','MicroStrategy');
						mstrmojo.all.webserverport.set('value','80');
					}
					else
					{
						mstrmojo.all.mobileserverAppName.set('value','MicroStrategyMobile');
						mstrmojo.all.mobileserverport.set('value','80');
					}
					mstrmojo.all.machineNameConnectManuallyBox.focus();
	    		},
	    		addHCToToplogy : function()
				{												
					
					var successCB = function(res)
					{	
						mstrmojo.all.IPAAddServerManuallyTable.setComponents();						
						mstrmojo.all.IPAAddServerManuallyTable.refreshModel();
					};
					var failureCB = function(res)
					{
						
						//mstrmojo.all.IPAOverlayBox.set('visible', false);						
						mstrmojo.all.IPAAddServerManuallyTable.setComponents();						
						mstrmojo.all.IPAAddServerManuallyTable.refreshModel();
						mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));														
					};
					
					mstrmojo.all.environmentController.addHCAgentToMHA(
							mstrmojo.all.machineNameConnectManuallyBox.value,
							mstrmojo.all.HeatthAgentPortNumberTextBox.value,
							mstrmojo.all.HealthAgentAccessCodeTextBox.value,
							successCB,failureCB);
				},
	    		cancelEdit : function()
	    		{
	    				mstrmojo.all.IPAAddServerManuallyTitle.set('text',mstrmojo.desc(8934, "Add a Web or Mobile Server Manually"));
			  			mstrmojo.all.mobileServerRadioButton.set('checked',false);
			  			mstrmojo.all.mobileServerRadioButton.set('enabled',true);
			  			mstrmojo.all.webServerRadioButton.set('enabled',true);
			  			mstrmojo.all.webServerRadioButton.set('checked',true);     									  			
			  			if(this.mhaStatus)			  				
			  				mstrmojo.all.connectServerManuallyButton1.set('visible',true);
			  			else
			  				mstrmojo.all.connectServerManuallyButton.set('visible',true);
			  			mstrmojo.all.HealthAgentAccessCodeTextBox.set('enabled',true);
				  		mstrmojo.all.HeatthAgentPortNumberTextBox.set('enabled',true);
			  			mstrmojo.all.saveServerManuallyButton.set('visible',false);
			  			mstrmojo.all.cancelServerManuallyButton.set('visible',false);
			  			mstrmojo.all.machineNameConnectManuallyBox.set('value',"");
			  			mstrmojo.all.machineNameConnectManuallyBox.set('enabled',true);
			  			mstrmojo.all.webserverAppName.set('value',"MicroStrategy");
			  			mstrmojo.all.webserverport.set('value',	"80");
			  			mstrmojo.all.mobileserverAppName.set('value',"MicroStrategyMobile");
			  			mstrmojo.all.mobileserverport.set('value',"80");
			  			mstrmojo.all.IPAConfigWebServersGrid.set('selectedItem',null);
			  			mstrmojo.all.IPAConfigMobileServersGrid.set('selectedItem',null);
	    		},
                login : function()                
                {	
	    			if(mstrmojo.all.saveServerManuallyButton.visible==false)	
	    				this.validateServer("add");
	    			else
	    				this.validateServer("edit");
                },
                edit : function()
                {  	
                	this.validateServer("edit");
                },
                // Flag : Validate Server for Editing or Adding
                validateServer : function(flag)
                {                	
                	var checkWhiteSpace = new RegExp(/^\s+$/);		
	    			mstrmojo.all.IPAOverlayBox.set('visible', true);
	    			// Check White Spaces and Empty Values
		    		if(checkWhiteSpace.test(mstrmojo.all.machineNameConnectManuallyBox.value)||
		    				mstrmojo.all.machineNameConnectManuallyBox.value=="")
		    		{
            			mstrmojo.all.machineNameConnectManuallyBox.focus();            			
            			mstrmojo.all.BlankAddNamesValidLabel.set('visible',true);
            			mstrmojo.all.IPAOverlayBox.set('visible', false);
            			setTimeout("mstrmojo.all.BlankAddNamesValidLabel.set('visible',false);",5000);
            			return;
            		}
		    		// Validating Web Server
		    		if(mstrmojo.all.webServerRadioButton.checked){		    		           		
	            		var callback = {
			   	                 success: function (res) {	
	            						
			    	    				if(flag=="edit")
			    	    					mstrmojo.all.IPAAddServerManuallyTable.modifyServer();
			    	    				else if(flag=="add")
			    	    					mstrmojo.all.IPAAddServerManuallyTable.addServerToPanel();
			   	 				  },
			   	 				  failure: function (res) {
			   	                   if (res) {
			   	                	   mstrmojo.all.IPAOverlayBox.set('visible', false);
			   	                       mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
			   	                       return;
			   	                   }
			   	               }
			   	 			};
	            		mstrmojo.all.environmentController.validateServer(mstrmojo.all.machineNameConnectManuallyBox.value,mstrmojo.all.webserverport.value,mstrmojo.all.webserverAppName.value,callback);
		    		}
		    		// Validate Mobile Server
		    		if(mstrmojo.all.mobileServerRadioButton.checked){
		    			var callback = {
			   	                 success: function (res) {			    	    				
		    							if(flag=="edit")
		    								mstrmojo.all.IPAAddServerManuallyTable.modifyServer();
		    							else if(flag=="add")
		    								mstrmojo.all.IPAAddServerManuallyTable.addServerToPanel();
			   	 				  },
			   	 				  failure: function (res) {
			   	                   if (res) {
			   	                	   mstrmojo.all.IPAOverlayBox.set('visible', false);
			   	                       mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
			   	                       return;
			   	                   }
			   	               }
			   	 			};
	            		mstrmojo.all.environmentController.validateServer(mstrmojo.all.machineNameConnectManuallyBox.value,mstrmojo.all.mobileserverport.value,mstrmojo.all.mobileserverAppName.value,callback);
		    		}		    	
                	
                },
                
                // Modifying Web/Mobile Server
                // 1) Modify its entry in Topology
                
                modifyServer : function()
                {
                	
                	var newServer = {};                	
                	var i,j;
					newServer.n = "server";					
					// Success Call
					var successCB = function(res){	
						// Change Server Bindings
						mstrmojo.all.IPAAddServerManuallyTable.detachServer(newServer);																				
					};
					// Failure Call
					var failureCB = function(res){
						mstrmojo.all.IPAOverlayBox.set('visible', false);
						mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
					};
					// If modifying a Web Server
					if(mstrmojo.all.webServerRadioButton.checked)
					{	
						newServer.i = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.id;
						newServer.port = mstrmojo.all.webserverport.value;
                		newServer.application = mstrmojo.all.webserverAppName.value;
                		newServer.type = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.type;
                		newServer.name =  mstrmojo.all.IPAConfigWebServersGrid.selectedItem.name;                		
                		// Check duplicate Server
                		if(this.checkDuplicate(newServer))
                    	{
                    			mstrmojo.all.IPAOverlayBox.set('visible', false);
                    			mstrmojo.all.DuplicateServerLabel.set('visible',true);                    		
                    			setTimeout("mstrmojo.all.DuplicateServerLabel.set('visible',false)",5000);
                    			return;
                    	}
                		// 1) Change Web Server Entry in the Topology
                		for (i = 0; i < mstrmojo.all.environmentModel.model.webServers.length; i++) {                    		
                    		 if(newServer.i == mstrmojo.all.environmentModel.model.webServers[i].id)
                    		 {
                    			 // Check which parameter is being modified
                    			 // If port is changed
                    			 if(newServer.port != mstrmojo.all.environmentModel.model.webServers[i].port)                    			 
                    				 mstrmojo.all.environmentController.setServerPortAttribute(newServer.i,newServer.port,successCB,failureCB);
                    			 // If application path is changed
                    			 else if(newServer.application!=mstrmojo.all.environmentModel.model.webServers[i].app)                    			 
                    				 mstrmojo.all.environmentController.setServerApplicationAttribute(newServer.i,newServer.application,successCB,failureCB);
                    		 }
    						}                		
                    }
					else if(mstrmojo.all.mobileServerRadioButton.checked)
					{
						newServer.i = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.id;
						newServer.port = mstrmojo.all.mobileserverport.value;
						newServer.application = mstrmojo.all.mobileserverAppName.value;
						newServer.type = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.type;
						newServer.name =  mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.name;						
                		// Check duplicate Server
                		if(this.checkDuplicate(newServer))
                    	{
                    			mstrmojo.all.IPAOverlayBox.set('visible', false);
                    			mstrmojo.all.DuplicateServerLabel.set('visible',true);                    		
                    			setTimeout("mstrmojo.all.DuplicateServerLabel.set('visible',false)",5000);
                    			return;
                    	}
                		// 1) Change Mobile Server Entry in the Topology
                		for (i = 0; i < mstrmojo.all.environmentModel.model.mobileServers.length; i++) {                    		
                    		 if(newServer.i == mstrmojo.all.environmentModel.model.mobileServers[i].id)
                    		 {
                    			 // Check which parameter is being modified
                    			 // If port is changed
                    			 if(newServer.port != mstrmojo.all.environmentModel.model.mobileServers[i].port)                    			 
                    				 mstrmojo.all.environmentController.setServerPortAttribute(newServer.i,newServer.port,successCB,failureCB);
                    			 // If application path is changed
                    			 else if(newServer.application!=mstrmojo.all.environmentModel.model.mobileServers[i].app)                    			 
                    				 mstrmojo.all.environmentController.setServerApplicationAttribute(newServer.i,newServer.application,successCB,failureCB);
                    		 }
    						}
					}                
                },
                
                //Dissasociate Web/Mobile Server
                detachServer : function(newServer)
                {
                	
                	var detachFlag=false;
                	var oldServer = {};
                	oldServer.n = "server";					
					var env = {
		  					n: "env",
		  					name: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name,
		  					i: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,
		  					iServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers,
		  					webServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers,
		  					mobileServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers
		  			};
					// Success Call
					var successCB = function(res){						
						mstrmojo.all.IPAAddServerManuallyTable.attachServer(newServer,env);																			
					};
					// Failure Call
					var failureCB = function(res){
						mstrmojo.all.IPAOverlayBox.set('visible', false);
						mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
					};
					if(mstrmojo.all.webServerRadioButton.checked)
					{
						oldServer.i = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.id;
						oldServer.port = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.port;
                		oldServer.application = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.app;
                		oldServer.type = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.type;
                		oldServer.name =  mstrmojo.all.IPAConfigWebServersGrid.selectedItem.name;
                		// 1) Disassociate changed Web Server from the environments and attach back
                		
                		for (i = 0; i < mstrmojo.all.environmentModel.model.environments.length; i++) {
                			for(j =0; j< mstrmojo.all.environmentModel.model.environments[i].webServers.length;j++)
                			{
                				if(newServer.i == mstrmojo.all.environmentModel.model.environments[i].webServers[j].id)                				
                				{
                						mstrmojo.all.environmentController.disassociateServerFromEnvironment(oldServer,env,successCB, failureCB);
                						detachFlag=true;
                				}
                			}
   						}
					}
					else if(mstrmojo.all.mobileServerRadioButton.checked)
					{
						oldServer.i = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.id;
						oldServer.port = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.port;
                		oldServer.application = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.app;
                		oldServer.type = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.type;
                		oldServer.name =  mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.name;
                		// 1) Disassociate changed Mobile Server from the environments and attach back
                		for (i = 0; i < mstrmojo.all.environmentModel.model.environments.length; i++) {
                			for(j =0; j< mstrmojo.all.environmentModel.model.environments[i].mobileServers.length;j++)
                			{
                				if(newServer.i == mstrmojo.all.environmentModel.model.environments[i].mobileServers[j].id) 
                				{
                						mstrmojo.all.environmentController.disassociateServerFromEnvironment(oldServer,env,successCB, failureCB);
                						detachFlag=true;
                				}
                			}
   						}
					}
					if(detachFlag==false)
					{
						mstrmojo.all.IPAOverlayBox.set('visible', false);
						this.cancelEdit();
						this.refreshModel();
						this.updateMessage();
					}
                },
                
                // Associate new Server back
                attachServer : function(newServer,env)
                {
                	
                	//Success Call
                	var successCB = function(res){		                                							
						mstrmojo.all.IPAOverlayBox.set('visible', false);						
						mstrmojo.all.IPAAddServerManuallyTable.refreshModel();	
						mstrmojo.all.IPAAddServerManuallyTable.cancelEdit();
						mstrmojo.all.IPAAddServerManuallyTable.updateMessage();
					};
					// Failure Call
					var failureCB = function(res){
						mstrmojo.all.IPAOverlayBox.set('visible', false);
						mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
					};
                	mstrmojo.all.environmentController.associateServerToEnvironment(newServer,env,successCB, failureCB);
                },
                
               // Successful Update Message
                updateMessage : function()
                {
                	mstrmojo.all.ServerUpdated.set('visible',true);        			
        			setTimeout("mstrmojo.all.ServerUpdated.set('visible',false);",5000);
                },
                
                // Refresh the Model from the topology
                refreshModel : function()
                {
                	
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
							     });	
                },   
            
                children: [{
                    slot: "0,0",
                    scriptClass: "mstrmojo.Label",                    
                    text: mstrmojo.desc(8935,"Server Type")
                },
                {
                    slot: "1,0",
                    scriptClass: "mstrmojo.Label",
                    cssClass: "mstrmojo-mhatable-labels",
                    text: mstrmojo.desc(8565,"Machine Name")
                },
                {
                    slot: "1,1",
                    scriptClass: "mstrmojo.TextBox",
                    cssClass:"mstrmojo-configPage-textbox",
                    cssText:"width:90px;",
                    id:"machineNameConnectManuallyBox",                    
                    size: 20,
                    onEnter : function()
                    {
                		this.domNode.blur();
                		this.parent.login();
                    }
                },  
                {
                    slot: "0,1",
                    scriptClass: "mstrmojo.RadioButton",
                    id:"webServerRadioButton",
                    cssClass: 'mstrmojo-connect-manually-RadioButton',
                    cssText:"position:relative;left:-20px;",
                    label: mstrmojo.desc(8936,"Web"),                    
                    checked:true,                   
                    onclick:function(){
                		if(this.checked){
                			mstrmojo.all.mobileServerRadioButton.set('checked',false);
                			mstrmojo.all.machineNameConnectManuallyBox.set('value','');
                		}
            		}
                }, {
                    slot: "0,2",
                    scriptClass: "mstrmojo.RadioButton",
                    id:"mobileServerRadioButton",
                    cssClass: 'mstrmojo-connect-manually-RadioButton',
                    cssText:"position:relative;left:-45px;",
                    label: mstrmojo.desc(5943,"Mobile"),
                    onclick:function(){
            			if(this.checked){
            				mstrmojo.all.webServerRadioButton.set('checked',false);
            				mstrmojo.all.machineNameConnectManuallyBox.set('value','');
            			}
        			}
                },
				{
			    	slot:"2,0",
			    	visible:"false",
			    	scriptClass:"mstrmojo.Label",
			    	cssClass:"mstrmojo-AddWebServerPortRow",
					text:mstrmojo.desc(8883,"Virtual Directory"),
					
						bindings:{
				    		visible:function(){
				    			if (mstrmojo.all.webServerRadioButton.checked) {
									return true;
								}
								else {
									return false;
								}
				    		}
				    	}
			    },
			    {
			    	slot:"2,1",
			    	visible:"false",
			    	id:"webserverAppName",
			    	scriptClass:"mstrmojo.TextBox",
			    	cssClass:"mstrmojo-configPage-textbox",
			    	cssText:"width:90px;",
			    	value:'MicroStrategy',
	            	size:20,    	   					    	
			    	
			    	  bindings:{
				    		visible:function(){
				    			if (mstrmojo.all.webServerRadioButton.checked) {
									return true;
								}
								else {
									//mstrmojo.all.webserverAppName.set('value', "");
									return false;
								}
				    		}
				    	},				    	
	                    onEnter : function()
	                    {
				    		this.domNode.blur();
				    		this.parent.login();
	                    }
			    },
				{
			    	slot:"3,0",
			    	visible:"false",			    	
			    	scriptClass:"mstrmojo.Label",
					cssClass:"mstrmojo-AddWebServerPortRow",
					text:mstrmojo.desc(8937,"Web Server Port"),
					
					bindings:{
			    		visible:function(){
			    			if (mstrmojo.all.webServerRadioButton.checked) {
								return true;
							}
							else {
								//mstrmojo.all.webserverport.set('value', "");
								return false;
							}
			    		}
			    	}
				},
			    {
					slot:"3,1",
			        id:"webserverport",
				   	scriptClass:"mstrmojo.TextBox",
				   	cssClass:"mstrmojo-configPage-textbox",
				   	cssText:"width:45px;",
		    	   	size:5,  
		    	   	value:'80',
		    	   	maxLength:5,
		    	   	
		    	   	bindings:{
			    		visible:function(){
			    			if (mstrmojo.all.webServerRadioButton.checked) {
								return true;
							}
							else {
								//mstrmojo.all.webserverport.set('value', "");
								return false;
							}
			    		}
			    	},
                    onEnter : function()
                    {
			    		this.domNode.blur();
			    		this.parent.login();
                    }
			    },
			    {
			    	slot:"2,0",
			    	visible:"false",
			    	scriptClass:"mstrmojo.Label",
			    	cssClass:"mstrmojo-AddMobileServerPortRow",
			    	text:mstrmojo.desc(8883,"Virtual Directory"),
				
					bindings:{
			    		visible:function(){
			    			if (mstrmojo.all.mobileServerRadioButton.checked) {
								return true;
							}
							else {
								return false;
							}
			    		}
			    	}
			    },
			    {
			    	slot:"2,1",
			    	visible:"false",
			    	id:"mobileserverAppName",
			    	scriptClass:"mstrmojo.TextBox",
			    	cssClass:"mstrmojo-configPage-textbox",
			    	cssText:"width:90px;",
			    	value:'MicroStrategyMobile',
			    	size:20,    	   					    	
		    	
			    	bindings:{
			    		visible:function(){
			    			if (mstrmojo.all.mobileServerRadioButton.checked){
								return true;
							}
							else {
								//mstrmojo.all.mobileserverAppName.set('value', "");
								return false;
							}
			    			
			    		}
			    	},
                    onEnter : function()
                    {
			    		this.domNode.blur();
			    		this.parent.login();
                    }
			    },

			    {
			    	slot:"3,0",
			    	scriptClass:"mstrmojo.Label",
		    	    cssClass:"mstrmojo-AddMobileServerPortRow",
					text:mstrmojo.desc(8938,"Mobile Server Port"),
					bindings:{
			    		visible:function(){
			    			if (mstrmojo.all.mobileServerRadioButton.checked) {
								return true;
							}
							else {
								//mstrmojo.all.mobileserverport.set('value', "");
								return false;
							}
			    		}
			    	}
		    	},
		    	{
		    	    slot:"3,1",
		    		id:"mobileserverport",
					scriptClass:"mstrmojo.TextBox",
					cssClass:"mstrmojo-configPage-textbox",
					cssText:"width:45px;",
					value:'80',
					size:5,
	    		    maxLength:5,
					bindings:{
			    		visible:function(){
			    			if (mstrmojo.all.mobileServerRadioButton.checked) {
								return true;
							}
							else {
								//mstrmojo.all.mobileserverport.set('value', "");
								return false;
							}
			    		}
			    	},
                    onEnter : function()
                    {
			    		this.domNode.blur();
			    		this.parent.login();
                    }
		    	},
                {
                    slot: "3,2",
                    scriptClass: "mstrmojo.HTMLButton",
                    cssClass: "mstrmojo-addServer-button",   
                    cssText:"width:auto;",
                    title: mstrmojo.desc(8939,"Connect to Server"),
                    id:"connectServerManuallyButton",
                    text: mstrmojo.desc(531,"Add") + "...",
//                   enabled:"false",
                    //The HTML Button is rendered in input tag, which can not be greyed out(though it can be enabled/disabled)
                    // By default tab ordering doesn't work in div tags. Button is rendered in div tag
                    // set the tab index to get tab ordering.
//                    postBuildRendering:function(){
//                		this.textNode.tabIndex=0;
//                	},
                	
//                    bindings:{
//			    		enabled : function(){
//			    			var ret_val=false;			    			
//			    			
//			    			if(mstrmojo.all.webServerRadioButton.checked){
//			    				if (mstrmojo.all.webserverport.value && mstrmojo.all.webserverAppName.value && mstrmojo.all.machineNameConnectManuallyBox.value) {
//									ret_val = true;
//								}
//			    			}
//			    			
//			    			if(mstrmojo.all.mobileServerRadioButton.checked){
//			    				if (mstrmojo.all.mobileserverport.value && mstrmojo.all.mobileserverAppName.value && mstrmojo.all.machineNameConnectManuallyBox.value) {
//									ret_val = true;
//								}
//			    			}
//			    			
//			    			return ret_val;
//			    		}
//			    	},
		    		bindings:{
    		    		visible:function()
    		    			{
    		    			
    						if (this.parent.mhaStatus)
    							return false;									
    						else 										
    							return true;
    		    			}
    		    		},	
                  onclick : function()
                  {                    	
                    	this.parent.login();
                  }
                },                 

			    {
			    	slot:"4,0",
			    	scriptClass:"mstrmojo.Label",
		    	    //cssClass:"mstrmojo-AddMobileServerPortRow",
		    	    id:"HealthAgentPortNumberLabel",
					text:mstrmojo.desc(8914,"Health Agent") + " " + mstrmojo.desc(16,"Port") + " (" + mstrmojo.desc(662,"Optional") + ")",
					cssText:"width:185px;",					
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
		    	    slot:"4,1",
		    	    id : "HeatthAgentPortNumberTextBox",
					scriptClass:"mstrmojo.TextBox",
					cssClass:"mstrmojo-configPage-textbox",
					cssText:"width:45px;",
					size:5,
	    		    maxLength:5,
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
			    	slot:"5,0",
			    	scriptClass:"mstrmojo.Label",
			    	id:"HealthAgentAccessCodeLabel",
		    	    //cssClass:"mstrmojo-AddMobileServerPortRow",
					text:mstrmojo.desc(8914,"Health Agent") + " " + mstrmojo.desc(8639,"Access Code") + " (" + mstrmojo.desc(662,"Optional") + ")",
					cssText:"width:225px;",
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
		    	    slot:"5,1",
		    	    id : "HealthAgentAccessCodeTextBox",
					scriptClass:"mstrmojo.TextBox",			
					cssText:"width:45px;",
					size:5,
	    		    maxLength:5,
	    		    type : 'password',
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
                    slot: "6,2",
                    scriptClass: "mstrmojo.HTMLButton",
                    cssClass: "mstrmojo-addServer-button",
                    cssText:"position:relative;left:-98px;width:auto;",
                    title:  mstrmojo.desc(8939,"Connect to Server"),
                    id:"connectServerManuallyButton1",
                    text: mstrmojo.desc(531,"Add") + "...",
                    bindings:{
			    		visible:function()
			    			{
							
							if (this.parent.mhaStatus)
								return true;									
							else 										
								return false;
			    			}
			    		},
                    onclick : function()
                    {                    	
                    	this.parent.login();
                    }
                }, 
                {
                	slot:"6,1",
                	scriptClass:"mstrmojo.HTMLButton",
                	cssClass:"mstrmojo-addServer-button",
                	cssText:"width:auto;position:relative;left:-85px;",
                	id:"saveServerManuallyButton",
                	text: mstrmojo.desc(118,"Save") + "...",
                	visible:false,
//                	 bindings:{
//			    		cssText:function()
//			    			{
//                			if (this.parent.mhaStatus)
//								return "width:auto;position:relative;left:-85px;";									
//							else 										
//								return "width:auto;";
//			    			}
//			    		},
                	onclick : function()
                    {                    	
                      	this.parent.edit();
                    }
                },
                {
                	slot:"6,2",
                	scriptClass:"mstrmojo.HTMLButton",
                	cssClass:"mstrmojo-addServer-button",
                	cssText:"width:auto;position:relative;left:-85px;",
                	id:"cancelServerManuallyButton",
                	text: mstrmojo.desc(221,"Cancel") + "...",
                	visible:false,
//                	 bindings:{
//			    		cssText:function()
//			    			{							
//							if (this.parent.mhaStatus)
//								return "width:auto;position:relative;left:-85px;";								
//							else 										
//								return "width:auto;";
//			    			}
//			    		},
                	onclick : function()
                    {                    	
                      	this.parent.cancelEdit();
                    }
                }]                
			}]
            
	});
})();
