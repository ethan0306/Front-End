(function(){

	mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo.Table", "mstrmojo.VBox", "mstrmojo.CollapsiblePanel",
    		"mstrmojo.Label", "mstrmojo.TextBox", "mstrmojo.HBox", "mstrmojo.HTMLButton",    		
    		"mstrmojo.List", "mstrmojo.ListHoriz", "mstrmojo.ListBoxSelector", 
    		"mstrmojo.ListBase2", "mstrmojo.SelectBox", "mstrmojo.CheckBox", 
    		"mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", 
    		"mstrmojo.DataGrid","mstrmojo.IPA.IPAAddServerManually","mstrmojo.IPA.IPAAddServerManuallyWarning");
	
	mstrmojo.requiresDescs(8915,8916,8917,8918,8919,8920,8921,8922,8923,8924,8925,8926,8927,8928,8929,8930,8931,8932,8933,8940,8941,8881,2350,16,8884,96,765,766,8375,513,1088);	
    mstrmojo.IPA.IPABuildEnvironments = mstrmojo.insert({ 
    	id:"IPABuildEnvironments",
    	scriptClass:"mstrmojo.HBox",
    	//cssClass:"mstrmojo-IPABuildEnvironmentsVBox",
    	cssText : "width:700px;",
    	configModel:null,
    	mhaStatus : false,
    	// Child 1 : Build Environment
    	// Child 2 : Available List
    	
    	// Child 1
    	children:[
    	   {
    		  scriptClass:"mstrmojo.VBox",    		  
     		  id:"BuildEnvHBox",
     		  cssClass:"mstrmojo-EnvironmentPanel",     		 
     		  markupMethods: {
   				onvisibleChange: function() {
    		   				this.domNode.style.display = 'block';
     		   			}
   				},
   				children:[
   				          // Child 1: Environment Label and Name
     	    		     {     	    		    
     	    		    	 scriptClass:"mstrmojo.VBox",
     	    		    	 cssText:"height:80px",
     	    		    	 id:"ConfigEnvLabelBox",
     	    		    	 
     	    		    	 	children:[
     	    		    	 	          {
     	    		    	 	        	  scriptClass:"mstrmojo.HBox",
     	    		    	 	        	  children:[
     	    		    	 	        	            {
     	    		    	 	        	            	scriptClass: "mstrmojo.Label",
     	    		    	 	        	            	cssClass: "mstrmojo-buildenv-label",
     	    		    	 	        	            	cssText:"font-size:9pt",
     	    		    	 	        	            	text: mstrmojo.desc(8881,"Environment") + ":",
     	    		    	 	        	            },
     	    		    	 	        	            {
     	    		    	 	        	            	scriptClass: "mstrmojo.Label",
     	    		    	 	        	            	cssClass: "mstrmojo-buildenv-label",
     	    		    	 	        	            	cssText:"font-size:10pt;color:#1e9d08;min-width:150px;max-width:420px;overflow:hidden;",     	    		    	 	        	            		
     	    		    	 	        	            }]
     	    		    	 	          },
     	    		    	 	          {
     	    		    	 	        	  scriptClass: "mstrmojo.Label",
     	    		    	 	        	  cssClass:"mstrmojo-buildenv-informative-label",     	    		    	 	        	  
     	    		    	 	        	  text: mstrmojo.desc(8940,"This is the area in which you configure your Environment. " +
     	    		    	 	        	  "Here you can drag and drop servers from the Available Servers into the current Environment.")
     	    		    	 	          }      
     	    		    	 	          ]
     	    		     },
     	    		    // Child 2 : Workspace
     	    		    {
     	     	    	   	  scriptClass:"mstrmojo.VBox",
     	     	    	   	  bindings:{
	    			   					cssText : function()
	    			   						{	    			   							
	    		    	        				if(this.parent.parent.mhaStatus)
	    			   								return "margin-top:20px;";
	    		    	        				else
	    		    	        					return "margin-top:22px;";
	    			   						}
	    			   					
	    			   					},
     	     	    	   	  //cssText:"margin-top:18px;",
     	     	    	   	  markupMethods: {
     	     	    		  				onvisibleChange: function() { 
     	     	    		    		   			this.domNode.style.display = 'block';
     	     	    		    		   			}
     	     	    		  				 },
     	     	    		  id: "EnvironmentPanel" ,  
     	     	    		  visible: false,
     	     	    		  serverStatus: null,
     	    		    	  children:[  
     	    		    	            	// Workspace Label
     	     	    		    	        {
     	     	    		    	        	scriptClass:"mstrmojo.Label",
     	     	    		    	        	text:mstrmojo.desc(8915,"Workspace"),
     	     	    		    	        	cssClass: "mstrmojo-Label-mynewenv",	
     	     	    		    	        	//cssText:"text-align:center;font-size:9pt;width:333px;"
     	     	    		    	        	cssText:"font-weight:bold;margin-top:6px;width:330px;margin-left:6px;border:1px solid #B6B6B6;",
     	     	    		    	        },
     	     	    		    	        // I-Server Collapsible Panel
     	     	    		    	        {
     	     	    							scriptClass:"mstrmojo.CollapsiblePanel",
     	     	    							//cssClass:"mstrmojo-CurrentEnvCollapsiblePanel",     	     	    							
     	     	    							cssClass:"mstrmojo-Intelligent-Server",     	 
     	     	    							//cssText:"border:none;",
     	     	    							id:"CurrentEnvIServersCollapsiblePanel",
     	     	    							title:mstrmojo.desc(2350,"Intelligence Servers"),
     	     	    							successImg : "../images/1ptrans.gif", //blank image
     	     	    							//titleCssClass:"mstrmojo-CurrentEnvTitlePanel",
     	     	    							titleCssClass:"mstrmojo-I-Server-title",
     	     	    							expanded: true,
     	     	    							children:[
     	     	    							   {
     	     	    				                    // I-Server Grid
     	     	    								    colWidth:90,
     	     	    								    scriptClass: "mstrmojo.DataGrid",
     	     	    				                    cssClass: "mstrmojo-DataGrid-newenvserverlist",     	     	    				                    
     	     	    				                    bindings:{
     	     	     	    			   					cssText : function()
     	     	     	    			   						{
     	     	     	    			   							
     	     	     	    		    	        				if(this.parent.parent.parent.parent.mhaStatus)
     	     	     	    			   								return "border:none;width:337px;height:167px;min-height:70px;";
     	     	     	    		    	        				else
     	     	     	    		    	        					return "border:none;width:337px;height:80px;min-height:70px;";
     	     	     	    			   						}
     	     	     	    			   					
     	     	     	    			   					},
     	     	    				                    id: "IPANewEnvIServersGrid",
     	     	    				                    waiting: false,
     	     	    				                    makeObservable: true,
     	     	    				                    resizableColumns: false,
     	     	    				                    is:[],
     	     	    				                    markupMethods: {
     	     	     	     	    		  				onvisibleChange: function() {     	     	     	     	    		    		   			    	     	    								   				
     	     	     	     	    		    		   			this.domNode.firstChild.hidden=true;
     	     	     	     	    		    		   			this.domNode.firstChild.innerHTML=" ";
     	     	     	     	    		    		   			}
     	     	     	     	    		  				 },
     	     	    				                    columns: [
     	     	    				                              // Column 1 : I-Server Name
     	     	    				                              {    	    				                        
     	     	    				                            	  colWidth:115,     	     	    				                            	 
     	     	    				                            	  dataWidget: 
     	     	    				                            	  {
     	     	    				                            	  	scriptClass: "mstrmojo.HBox",
     	     	    				                            	  	children: 
     	     	    				                            	  		[{
     	     	    				                            	  			scriptClass: "mstrmojo.EditableLabel", 
     	     	    				                            	  			cssText:"overflow:hidden;",
     	     	    				                            	  			postApplyProperties: function(){
     	     	    				                            	  				this.set("text", this.parent.data.name);
     	     	    				                            	  				this.set("title",mstrmojo.desc(16,"Port") + " : " + this.parent.data.port);
     	     	    				                            	  			},     	 	    				                                
     	     	    				                            	  			onclick: function(){
     	     	    				                            	  			this.set('editable', false);
     	     	    				                            	  			}
     	     	    				                            	  		}]
     	     	    				                              	  }
     	     	    				                              },
     	     	    				                              // Column 2 : Manage Link
     	     	    				                              {    	    				                    	
     	     	    				                            	  colWidth:60,
     	     	    				                            	  dataWidget: 
     	     	    				                            	  {
     	     	    				                            	    scriptClass: "mstrmojo.EditableLabel",
     	     	    				                            	    postApplyProperties: function(){
     	     	    				                            	  		var url = "<a target = '_new' style ='color:blue' href='./mstrServerAdmin?evt=3060&src=mstrServerAdmin.3060&Server=" +this.parent.data.name+"'>"+mstrmojo.desc(8916,"Manage")+"</a>";
     	     	    				                            	  		this.set("text", url);
     	     	    				                            	  		this.set("title",mstrmojo.desc(8917,"Intelligence Server Administration Portal"));
     	     	    				                              		},
     	     	    				                              		//title:"Intelligence Server Managers.",	    				                            	
     	     	    				                              		//text: "<a href='./mstrServerAdmin'>Manage</a>",
     	     	    				                    
     	     	    				                              		onclick:function(){
     	     	    				                              			this.set('editable',false);
     	     	    				                              		}
     	     	    				                            	  }		   
     	     	    				                              }]// End of Columns
     	     	    							   }          
     	     	    							]// End of I-Server Data Grid
     	     	    		    	        },
     	     	    		    	        // Web Server Collapsible Panel
     	     	    		    	        {
     	     	       							scriptClass:"mstrmojo.CollapsiblePanel",
     	     	    							//cssClass:"mstrmojo-CurrentEnvCollapsiblePanel",
     	     	    							cssClass:"mstrmojo-Env-Server",
     	     	    							id:"CurrentEnvWebServersCollapsiblePanel",
     	     	    							title:mstrmojo.desc(8884,"Web Servers"),
     	     	    							successImg : "../images/1ptrans.gif", //blank image
     	     	    							titleCssClass:"mstrmojo-Env-Server-title",
     	     	    							expanded: true,
     	     	    							children:[
     	     	    							  {
     	     	    				                    // Web Server Data Grid
     	     	    								  	scriptClass: "mstrmojo.DataGrid",
     	     	    				                    cssClass: "mstrmojo-DataGrid-newenvserverlist",
     	     	    				                    cssText:"border:none;width:337px;height:92px;",
     	     	    				                    id: "IPANewEnvWebServersGrid",
     	     	    				                    waiting: false,
     	     	    				                    makeObservable: true,
     	     	    				                    resizableColumns: false,
     	     	    				                    dropZone:false,
     	     	    									draggable:true,
     	     	    				                    w:[],    
     	     	    				                    markupMethods: {
     	     	     	     	    		  				onvisibleChange: function() {								   				
     	     	     	     	    		    		   			this.domNode.firstChild.hidden=true;
     	     	     	     	    		    		   			this.domNode.firstChild.innerHTML=" ";
     	     	     	     	    		    		   			}
     	     	     	     	    		  				 },
     	     	    				                    // Drag Function for Removing Web Server out of Build Environment
     	     	    				                    dragFunction:function()
     	     	    				                    {    									  		
     	     	    								  		if(mstrmojo.all.IPANewEnvWebServersGrid.selectedItem == null)
     	     	    								  		{    									  			
     	            									  		mstrmojo.all.DragAndDropStatusLabel.set('text',mstrmojo.desc(96,"Error")+': '+mstrmojo.desc(8918,"Invalid type, only web server can be dropped into web servers panel")+' !!');
     	            									  		mstrmojo.all.DragAndDropStatusLabel.set('visible',true);
     	            									  		mstrmojo.all.IPANewEnvMobileServersGrid.set('selectedItem',null);
     	            									  		setTimeout("mstrmojo.all.DragAndDropStatusLabel.set('visible',false)", 5000);
     	        									  		}
     	        									  		else if(mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.type=="Web")
     	        									  		{
     	        									  			mstrmojo.all.DragAndDropStatusLabel.set('visible',false);
     	        									  			mstrmojo.all.IPAOverlayBox.set('visible', true);
     	        									  			
     	        									  			//if new env, it's not yet built. So no need to dissociate 
     	        									  			if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id == -1){
     	        									  				mstrmojo.all.IPAOverlayBox.set('visible', false);
     	        									  				mstrmojo.all.IPAConfigWebServersGrid.items.push(mstrmojo.all.IPANewEnvWebServersGrid.selectedItem);
     	        									  				mstrmojo.all.IPAConfigWebServersGrid.render();
     	        									  				
     	        									  	  			//remove from selectedServers list
     	            									  			var index = mstrmojo.all.environmentController.getArrayIndex(mstrmojo.all.environmentController.selectedServers,
     	            									  					mstrmojo.all.IPANewEnvWebServersGrid.selectedItem);
     	            									  			mstrmojo.all.environmentController.selectedServers.splice(index,1);
     	            									  			
     	        									  				mstrmojo.all.IPANewEnvWebServersGrid.items.splice(mstrmojo.all.IPANewEnvWebServersGrid.selectedIndex,1);
     	        									  				mstrmojo.all.IPANewEnvWebServersGrid.render();
     	        									  			} 
     	        									  			else { //dissociate    									  			
     	        									  			var env = {
     	        									  					n: "env",
     	        									  					name: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name,
     	        									  					i: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,
     	        									  					iServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers,
     	        									  					webServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers,
     	        									  					mobileServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers
     	        									  			};
     	     	                                	
     	     	                                				var server = {};
     	     	                                				mstrmojo.all.IPANewEnvWebServersGrid.selectedItem = mstrmojo.all.IPANewEnvWebServersGrid.items[mstrmojo.all.IPANewEnvWebServersGrid.selectedIndex];
     	                                    					server.n = "server";
     	                                						server.type = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.type;
     	                                						server.name =  mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.name;
     	                                						server.port = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.port;
     	                                    					if(mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.i==="e2") //this means it's a new webserver
     	                                    					{
     	                                    						server.i= mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.i;
     	                                    						server.application = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.application;
     	                                    					}
     	                                    					else{
     	                                    						server.i = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.id;
     	                                    						server.application = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.app;
     	                                    					}
     	                                    					
     	                                                     	var successCB = function(res){
     	                                                     		mstrmojo.all.IPAOverlayBox.set('visible', false);
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
     	     				                                		//location.reload(true);
     	     				                                	};
     	     				                                	
     	     				                                    var failureCB = function(res){
     	     				                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
     	     				               		                	 mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
     	     				               		             	};
     	     				               		             	
     	     				                                	mstrmojo.all.environmentController.disassociateServerFromEnvironment(server,env,successCB, failureCB);
     	        									  		  }
     	        									  		}
     	     	    				                    },
     	     	    				                    ondragleave:function(){
     	     	    				                    	this.dragFunction();
     	     	    				                    },
     	     	    									// Web Server Data Grid Columns
     	     	    				                    columns: [
     	     	    				                      {    	    				                        
     	     	    				                    	// Column 1 : Web Server Name
     	     	    				                    	colWidth:70,
     	     	    				                    	dataWidget: {
     	     	    				                            scriptClass: "mstrmojo.HBox",
     	     	    				                            dropZone:true,
     	     	    											draggable:true,
     	     	    				                            children: [{
     	     	    				                                scriptClass: "mstrmojo.EditableLabel",   
     	     	    				                                cssText:"cursor:move;overflow:hidden;width:120px;text-align:left;margin-left:10px;",
     	     	    				                                postApplyProperties: function(){
     	     	    				                                    this.set("text", this.parent.data.name);
     	     	    				                                    this.set("title",mstrmojo.desc(8919,"Web Server Path")+": " + this.parent.data.app + ", "+ mstrmojo.desc(16,"Port")+": " + this.parent.data.port);
     	 	    				                                	},
     	 	    				                                
     	 	    				                                	onclick: function(){
     	 	    				                                		this.set('editable', false);
     	 	    				                                	}
     	     	    				                            }]
     	     	    				                        }
     	     	    				                    },     	     	    				                   
     	     	    				                    {	
     	     	    				                    	// (Connect/Disconnect) Button
     	     	    				                    	colWidth:35,
     	     	    				                    	dataWidget: {
     	     	    				                    		scriptClass:"mstrmojo.Button",
     	     	    				                    		//text:"Disconnect",	    
     	 	    				                            	cssText:"text-decoration:underline;color:blue;width:auto;position:relative;left:40px;",   
     	 	    				                            	title : "",
     	 	    				                            	bindings : 
     	 	    				                            	 {		                    	   			
     	     	    				                    			text: function(){
     	     	    				                    				var status =mstrmojo.all.EnvironmentPanel.serverStatus;
     	     	    				                    				for(i = 0;i < status.length; i++)
     	     	    				                    				{
     	     	    				                    					if(status[i].key == this.parent.data.id)
     	     	    				                    						{
     	     	    				                    							if(status[i].value == "true")				                    									
     	     	    				                    									return mstrmojo.desc(765,"Disconnect");     	     	    				                    									
     	     	    				                    								//return "background:url(../javascript/mojo/css/images/IPA/disconnect_server.GIF) repeat-x scroll left 0px;";
     	     	    				                    							else
     	     	    				                    								return mstrmojo.desc(766,"Connect");     	     	    				                    								
     	     	    				                    								//return "background: #D5D6D8 url(../javascript/mojo/css/images/IPA/connect_server.GIF) repeat-x scroll left 0px;";
     	     	    				                    							
     	     	    				                    						}
     	     	    				                    				}    	    				                    				
     	 	    				                    	   			},
     	 	    				                    	   			title:function()
     	 	    				                    	   			{	
     	 	    				                    	   				var env = mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id;
     	 	    				                    	   				for(i=0;i<mstrmojo.all.environmentModel.model.environments.length;i++)
     	 	    				                    	   				{
     	 	    				                    	   					if(env==mstrmojo.all.environmentModel.model.environments[i].id)
     	 	    				                    	   						for(j=0;j<mstrmojo.all.environmentModel.model.environments[i].serverStatus.length;j++)
     	 	    				                    	   						{
     	 	    				                    	   							if(mstrmojo.all.environmentModel.model.environments[i].serverStatus[j].key==this.parent.data.id)
     	 	    				                    	   							{
     	 	    				                    	   								if(mstrmojo.all.environmentModel.model.environments[i].serverStatus[j].value=="true")
     	 	    				                    	   									return mstrmojo.desc(8920,"Disconnect Web Server");
     	 	    				                    	   								else
     	 	    				                    	   									return mstrmojo.desc(8921,"Connect Web Server");
     	 	    				                    	   							}
     	 	    				                    	   						}
     	 	    				                    	   				}
//     	 	    				                    	   				if(this.text =="Connect")     	 	    				                    	   				     	 	    				                    	   					
//     	 	    				                    	   					return "Disconnect Web Server";
//     	 	    				                    	   				else if(this.text =="Disconnect")     	 	    				                    	   				     	 	    				                    	   					
//     	 	    				                    	   					return "Connect Web Server";     	 	    				                    	   				
//     	 	    				                    	   				else
//     	 	    				                    	   					return "Disconnect Web Server";
     	 	    				                    	   			}
     	 	    				                    	   		 },	
     	 	    				                            	onclick:function()
     	 	    				                            	 {     	 	    				                    	   			
     	 	    				                    	   			mstrmojo.all.IPAOverlayBox.set('visible', true);
     	 	    				                    	   			var status = this;
     	 	    			    		        					var callback = {
     	 	    			    		        						success:function(res){
     	 	    			    		        							mstrmojo.all.IPAOverlayBox.set('visible', false);	    			    		        							
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
     	 	    		    		        							failure:function(res){
     	 	    	    				                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
     	 	    	    				               		                	mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));	    	    				               		             	
     	 	    		    		        							}
     	 	    			    		        					};
     	 	    			    		        					var webserverId = this.parent.data.id;
     	 	    			    		        					if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers.length > 0)
     	 	    			    		        						var iserverId = mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers[0].id;
     	 	    			    		        					var action = this.text;     	 	    			    		        					
     	 	    			    		        					mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, {
     	 	    			    		        						taskId: 'IPAServerAdminTask',
     	 	    			    		        						iserver_id: iserverId,
     	 	    			    		        						webserver_id:webserverId,
     	 	    			    		        						action:action
     	 	    			    		        					});
     	 	    				                            	}	    				                             
     	 	    				                            }		   
     	     	    				                    },
     	     	    				                    {     	    				                    	
     	     	    				                    	// Column 3 : Manage Button
     	     	    				                    	colWidth:45,
     	     	    				                    	dataWidget: {
     	     	    				                    		scriptClass: "mstrmojo.Button",
     	 	    				                            	text:mstrmojo.desc(8916,"Manage"),
     	 	    				                            	title:mstrmojo.desc(8922,"Apply Templates Page"),
     	 	    				                            	cssText:"text-decoration:underline;color:blue;width:auto;position:relative;left:40px;",
     	 	    				                            		
     	 	    				                            	onclick:function(){
     	 	    				                            		mstrmojo.all.IPAConfigContainer.set('selected',mstrmojo.all.ApplyTemplates);
     	 	    				                            		mstrmojo.IPA.IPABuildEnvironments.configModel.set("navTableSelectionIndex", 4);
     	 	    				                            	}	    				                             
     	 	    				                            }		   
     	     	    				                    },
     	     	    				                    {   	    				                    	
     	     	    				                    	// Column 4 : Drag Button
     	     	    				                    	colWidth:8,
     	     	    				                    	dataWidget:{
     	     	    				                    		scriptClass: "mstrmojo.Button",
     	     	    				                    		title:mstrmojo.desc(8923,"Dissociate web server from the environment"),
     	     	    				                    		cssClass:"drag-right-arrow-button",
     	     	    				                    		cssText:"width:10px;margin-left:70px;",
     	     	    				                    		onclick:function(){     	     				                            			
     	     	    				                    			mstrmojo.all.IPAOverlayBox.set('visible', true);
     	     	    				                    			var status = this;
     	     	    				                    			var callback = {
     	     	    				                    					success:function(res){
 	 	    			    		        									status.parent.dataGrid.dragFunction();
 	 	    		    		        									},
 	 	    		    		        									failure:function(res){
 	 	    		    		        										mstrmojo.all.IPAOverlayBox.set('visible', false);
 	 	    		    		        										mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));	    	    				               		             	
 	 	    		    		        									}
     	     	    				                    			};
     	     	    				                    			var webserverId = this.parent.data.id;
     	     	    				                    			if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers.length > 0)
     	     	    				                    				var iserverId = mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers[0].id;
     	     	    				                    			var action = "Disconnect";
     	     	    				                    			mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, {
     	     	    				                    				taskId: 'IPAServerAdminTask',
     	     	    				                    				iserver_id: iserverId,
     	     	    				                    				webserver_id:webserverId,
     	     	    				                    				action:action
     	     	    				                    			});
     	     	    				                    					
     	     				                            		}	 
     	     	    				                    	}
     	     	    				                    }] // End of DataGrid Columns
     	     	    							  }       
     	     	    							] // End of Web Server DataGrid
     	     	    		    	        },
     	     	    		    	        // Mobile Servers Collapsible Panel
     	     	    		    	        {
     	     	      							scriptClass:"mstrmojo.CollapsiblePanel",
     	     	    							//cssClass:"mstrmojo-CurrentEnvCollapsiblePanel",
     	     	    							cssClass:"mstrmojo-Env-Mobile-Server",     	     	    							
     	     	    							id:"CurrentEnvMobileServersCollapsiblePanel",
     	     	    							title:mstrmojo.desc(8375,"Mobile Servers"),
     	     	    							successImg : "../images/1ptrans.gif", //blank image
     	     	    							titleCssClass:"mstrmojo-Env-Server-title",
     	     	    							expanded: true,
     	     	    							children:[
     	     	    							  {
     	     	    				                    // Mobile Server Data Grid
     	     	    								  	scriptClass: "mstrmojo.DataGrid",     	     	    								  	
     	     	    				                    cssClass: "mstrmojo-DataGrid-newenvserverlist",
     	     	    				                    cssText:"border:none;width:337px;height:92px;border-bottom:1px solid #B6B6B6;",
     	     	    				                    id: "IPANewEnvMobileServersGrid",
     	     	    				                    waiting: false,
     	     	    				                    makeObservable: true,
     	     	    				                    resizableColumns: false,
     	     	    				                    dropZone:false,
     	     	    									draggable:true,
     	     	    				                    m:[],     
     	     	    				                    markupMethods: {
     	     	     	     	    		  				onvisibleChange: function() {								   				
     	     	     	     	    		    		   			this.domNode.firstChild.hidden=true;
     	     	     	     	    		    		   			this.domNode.firstChild.innerHTML=" ";
     	     	     	     	    		    		   			}
     	     	     	     	    		  				 },
     	     	    				                    // Mobile Server Drag Function
     	     	    				                    dragFunction:function()
     	     	    				                    {
     	     	    								  		if(mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem==null){    									  			
     	     	    								  			mstrmojo.all.DragAndDropStatusLabel.set('text',mstrmojo.desc(96,"Error")+': '+mstrmojo.desc(8924,"Invalid type, only mobile server can be dropped into mobile servers panel")+' !!');
     	     	    								  			mstrmojo.all.DragAndDropStatusLabel.set('visible',true);   
     	     	    								  			mstrmojo.all.IPANewEnvWebServersGrid.set('selectedItem',null); 
     	     	    								  			setTimeout("mstrmojo.all.DragAndDropStatusLabel.set('visible',false)", 5000);
     	     	    								  		}
     	     	    								  		else if(mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.type=="Mobile"){
     	      									  			mstrmojo.all.DragAndDropStatusLabel.set('visible',false);
     	      									  			mstrmojo.all.IPAOverlayBox.set('visible', true);
     	      									  			
     	      									  			//if new env, it's not yet built. So no need to dissociate 
     	      									  			if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id == -1){									  				
     	      										  			mstrmojo.all.IPAOverlayBox.set('visible', false);
     	          									  			mstrmojo.all.IPAConfigMobileServersGrid.items.push(mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem);
     	          									  			mstrmojo.all.IPAConfigMobileServersGrid.render();
     	          									  			
     	          									  			//remove from selectedServers list
     	          									  			var index = mstrmojo.all.environmentController.getArrayIndex(mstrmojo.all.environmentController.selectedServers,
     	          									  					mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem);
     	          									  			mstrmojo.all.environmentController.selectedServers.splice(index,1);
     	          									  			
     	          									  			//update new env grid
     	          									  			mstrmojo.all.IPANewEnvMobileServersGrid.items.splice(mstrmojo.all.IPANewEnvMobileServersGrid.selectedIndex,1);
     	          									  			mstrmojo.all.IPANewEnvMobileServersGrid.render();
     	          									  			
     	          									  			
     	      									  			} 
     	      									  			else { //dissociate									  			
     	      									  			var env = {
     	      									  					n: "env",
     	      									  					name: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name,
     	      									  					i: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,
     	      									  					iServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers,
     	      									  					webServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers,
     	      									  					mobileServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers
     	      									  			};
     	                                      	
     	                                      				var server = {};
     	                                      				mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem = mstrmojo.all.IPANewEnvMobileServersGrid.items[mstrmojo.all.IPANewEnvMobileServersGrid.selectedIndex];
     	                                  					server.n = "server";
     	                              						server.type = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.type;
     	                              						server.name =  mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.name;
     	                              						server.port = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.port;
     	                                  					if(mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.i==="e3") //this means it's a new webserver
     	                                  					{
     	                                  						server.i= mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.i;
     	                                  						server.application = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.application;
     	                                  					}
     	                                  					else{
     	                                  						server.i = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.id;
     	                                  						server.application = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.app;
     	                                  					}
     	                                  					
     	                                                   	var successCB = function(res){
     	                                                   		mstrmojo.all.IPAOverlayBox.set('visible', false);
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
     	 				                                		//location.reload(true);
     	      			                                	};
     	      			                                	
     	      			                                    var failureCB = function(res){
     	      			                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
     	      			               		                	 mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
     	      			               		             	};
     	      			               		             	
     	      			                                	mstrmojo.all.environmentController.disassociateServerFromEnvironment(server,env,successCB, failureCB);
     	      									  		  }
     	      									  		}
     	     	    							  	},
     	     	    							  	ondragleave:function(){
     	     	    							  		this.dragFunction();
     	    								  		},
     	    								  		// Mobile Server Grid Columns		
     	     	    				                columns: [     	     	    				                        
     	     	    				                        {    	    				                        
     	     	    				                        // Column 1 : Mobile Server Name
     	     	    				                        colWidth:70,
     	     	    				                    	dataWidget: {
     	     	    				                            scriptClass: "mstrmojo.HBox",
     	     	    						                    dropZone:false,
     	     	    	    									draggable:true,
     	     	    				                            children: [{
     	     	    				                                scriptClass: "mstrmojo.EditableLabel",
     	     	    				                                cssText:"cursor:move;overflow:hidden;width:120px;text-align:left;margin-left:10px;",
     	     	    				                                postApplyProperties: function(){
     	     	    				                                    this.set("text", this.parent.data.name);     	     	    				                                    
     	     	    				                                    this.set("title",mstrmojo.desc(8925,"Mobile Server Path")+": " + this.parent.data.app + ", "+mstrmojo.desc(16,"Port")+": " + this.parent.data.port);
     	     				                                		},     	     				                                
     	     				                                		onclick: function(){
     	     				                                			this.set('editable', false);
     	     				                                		}
     	     	    				                            	}]
     	     	    				                        	}
     	     	    				                    },     	     	    				                  
     	     	    				                    {	
     	     	    				                    // Column 2 : Connect/Disconnect Button
     	     	    				                    colWidth:35,
     	     	    				                    dataWidget: {
     	     	    				                    		scriptClass:"mstrmojo.Button",     	     	    				                    		
     	     	    				                    		//text:"Disconnect",	    	
     	 	    				                            	cssText:"text-decoration:underline;color:blue;width:auto;position:relative;left:40px;",
     	 	    				                            	 bindings : {		                    	   			
     	     	    				                    			text	 : function(){
     	     	    				                    				var status =mstrmojo.all.EnvironmentPanel.serverStatus;
     	     	    				                    				for(i = 0;i < status.length; i++)
     	     	    				                    				{
     	     	    				                    					if(status[i].key == this.parent.data.id)
     	     	    				                    						{
     	     	    				                    							if(status[i].value == "true")     	     	    				                    							     	     	    				                    								
     	     	    				                    								return  mstrmojo.desc(765,"Disconnect");     	     	    				                    							
     	     	    				                    							//return "background:url(../javascript/mojo/css/images/IPA/disconnect_server.GIF) repeat-x scroll left 0px;";
     	     	    				                    							else     	     	    				                    							
     	     	    				                    								return mstrmojo.desc(766,"Connect");     	     	    				                    							
     	     	    				                    							//return "background: #D5D6D8 url(../javascript/mojo/css/images/IPA/connect_server.GIF) repeat-x scroll left 0px;";     	     	    				                    							
     	     	    				                    						}
     	     	    				                    				}    	    				                    				
     	 	    				                    	   			},     	 	    				                    	   		
     	 	    				                    	   			title:function()
     	 	    				                    	   			{   
     	 	    				                    	   				var env = mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id;
     	 	    				                    	   				for(i=0;i<mstrmojo.all.environmentModel.model.environments.length;i++)
     	 	    				                    	   				{
 	 	    				                    	   					if(env==mstrmojo.all.environmentModel.model.environments[i].id)
 	 	    				                    	   						for(j=0;j<mstrmojo.all.environmentModel.model.environments[i].serverStatus.length;j++)
 	 	    				                    	   						{
 	 	    				                    	   							if(mstrmojo.all.environmentModel.model.environments[i].serverStatus[j].key==this.parent.data.id)
 	 	    				                    	   							{
 	 	    				                    	   								if(mstrmojo.all.environmentModel.model.environments[i].serverStatus[j].value=="true")
 	 	    				                    	   									return mstrmojo.desc(8926,"Disconnect Mobile Server");
 	 	    				                    	   								else
 	 	    				                    	   									return mstrmojo.desc(8927,"Connect Mobile Server");
 	 	    				                    	   							}
 	 	    				                    	   						}
     	 	    				                    	   				}
     	 	    				                    	   			}
     	 	    				                    	   		},	
     	 	    				                            	onclick:function(){     	 	    				                            		
     	 	    				                    	   			mstrmojo.all.IPAOverlayBox.set('visible', true);
     	 	    				                    	   			var status = this;
     	 	    			    		        					var callback = {
     	 	    			    		        						success:function(res){
     	 	    			    		        							//mstrmojo.all.IPAOverlayBox.set('visible', false);	    			    		        							
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
     	 	    		    		        							failure:function(res){
     	 	    	    				                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
     	 	    	    				               		                	mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));	    	    				               		             	
     	 	    		    		        							}
     	 	    			    		        					};
     	 	    			    		        					var mobileserverId = this.parent.data.id;
     	 	    			    		        					if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers.length > 0)
     	 	    			    		        						var iserverId = mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers[0].id;
     	 	    			    		        					var action = this.text;
     	 	    			    		        					mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, {
     	 	    			    		        						taskId: 'IPAServerAdminTask',
     	 	    			    		        						iserver_id: iserverId,
     	 	    			    		        						webserver_id:mobileserverId,
     	 	    			    		        						action:action
     	 	    			    		        					});
     	 	    				                            	}	    				                             
     	 	    				                            }		   
     	     	    				                    },
     	     	    				                    {     	    				                    	
     	     	    				                    	// Column 3 : Manage Button
     	     	    				                    	colWidth:45,
     	     	    				                    	dataWidget: {
     	     	    				                    	   	scriptClass: "mstrmojo.Button",
     	     	    				                    	   	text:mstrmojo.desc(8916,"Manage"),
     	     	    				                    	   	title:mstrmojo.desc(8922,"Apply Templates Page"),     	 	    				                            	
     	 	    				                            	cssText:"text-decoration:underline;color:blue;width:auto;position:relative;left:40px;",     	 	    				                            		
     	 	    				                            	onclick:function(){
     	 	    				                            		mstrmojo.all.IPAConfigContainer.set('selected',mstrmojo.all.ApplyTemplates);
     	 	    				                            		mstrmojo.IPA.IPABuildEnvironments.configModel.set("navTableSelectionIndex", 4);
     	 	    				                            	}	    				                             
     	 	    				                            }		   
     	     	    				                    },
     	     	    				                    {
     	     	    				                    	// Column 4 : Dissasociate Button
     	     	    				                    	colWidth:8,
     	     	    				                    	dataWidget:{
     	     	    				                    		scriptClass:"mstrmojo.Button",
     	     	    				                    		title:mstrmojo.desc(8928,"Dissociate mobile server from environment"),
     	     	    				                    		cssClass:"drag-right-arrow-button",
     	     	    				                    		csstext:"width:10px;margin-left:70px;",
     	     	    				                    		onclick:function(){
     	     	    				                    		var status = this;
     	     	    				                    		var callback = {
     	 	    			    		        						success:function(res){
     	     	    				                    					status.parent.dataGrid.dragFunction();
     	 	    		    		        							},
     	 	    		    		        							failure:function(res){
     	 	    	    				                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
     	 	    	    				               		                	mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));	    	    				               		             	
     	 	    		    		        							}
     	 	    			    		        					};
     	 	    			    		        					var mobileserverId = this.parent.data.id;
     	 	    			    		        					if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers.length > 0)
     	 	    			    		        						var iserverId = mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers[0].id;
     	 	    			    		        					var action = "Disconnect";
     	 	    			    		        					mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, {
     	 	    			    		        						taskId: 'IPAServerAdminTask',
     	 	    			    		        						iserver_id: iserverId,
     	 	    			    		        						webserver_id:mobileserverId,
     	 	    			    		        						action:action
     	 	    			    		        					});
     	     	    				                    		
     	     	    				                    				
     	     	    				                    		}
     	     	    				                    	}
     	     	    				                    }] // End of Mobile Server Grid Columns
     	     	    							  }      
     	     	    							]
     	     	    		    	        },    						        
     	     						        {
     	     						        	scriptClass:"mstrmojo.Label",
     	     						        	id:"DragAndDropStatusLabel",
     	     						        	cssClass:"mstrmojo-DragAndDropStatusLabel",
     	     						        	visible:false    						        	
     	     						        }		    	        
     	     	    		    	  ] // End of Environment Panel
     	     	    		     }] 
     	    		    	 	          
    	   },
    	   // End of Child 1 : Build Environments
    	   
//    		   //HBox 
//    		   //left side: current env grids
//    		   //right side: available servers grid
//    		  scriptClass:"mstrmojo.HBox",    		  
//    		  id:"BuildEnvHBox",
//    		  cssText:"height:500px",   	   	  
//    		  markupMethods: {
//  				onvisibleChange: function() { 
//    		   			this.domNode.style.display = 'block';
//    		   			}
//  				},
//    		   
//    		  children:[
//    	    		     {
//    	    		    	  scriptClass:"mstrmojo.VBox", 
//    	    		    	  cssClass:"mstrmojo-EnvironmentPanel",
//    	    		    	  cssText: "height:400px",
//    	    		    	  markupMethods: {
//    	    		  				onvisibleChange: function() { 
//    	    		    		   			this.domNode.style.display = 'block';
//    	    		    		   			}
//    	    		  			},
//    	    				  id: "EnvironmentPanel" ,  
//    	    				  visible: false,
//    	    				  serverStatus: null,
//
//    	    		    	  children:[  
//    	    		    	        {
//    	    		    	        	scriptClass:"mstrmojo.Label",
//    	    		    	        	text:"Workspace",
//    	    		    	        	cssClass: "mstrmojo-Label-mynewenv",	
//    	    		    	        	cssText:"text-align:center;"
//    	    		    	        },
//    	    		    	        {
//    	    							scriptClass:"mstrmojo.CollapsiblePanel",
//    	    							cssClass:"mstrmojo-CurrentEnvCollapsiblePanel",
//    	    							id:"CurrentEnvIServersCollapsiblePanel",
//    	    							title:"Intelligence Servers",
//    	    							titleCssClass:"mstrmojo-CurrentEnvTitlePanel",
//    	    							children:[
//    	    							   {
//    	    				                    colWidth:90,
//    	    								    scriptClass: "mstrmojo.DataGrid",
//    	    				                    cssClass: "mstrmojo-DataGrid-newenvserverlist",
//    	    				                    id: "IPANewEnvIServersGrid",
//    	    				                    waiting: false,
//    	    				                    makeObservable: true,
//    	    				                    resizableColumns: false,
//    	    				                    is:[],
//    	    				                    columns: [{    	    				                        
//    	    				                        colWidth:115,
//    	    				                    	dataWidget: {
//    	    				                            scriptClass: "mstrmojo.HBox",
//    	    				                            children: [{
//    	    				                                scriptClass: "mstrmojo.EditableLabel", 
//    	    				                                cssText:"overflow:hidden;",
//    	    				                                postApplyProperties: function(){
//    	    				                                    this.set("text", this.parent.data.name);
//    	    				                                    this.set("title","Port: " + this.parent.data.port);
//	    				                                	},
//	    				                                
//	    				                                	onclick: function(){
//	    				                                		this.set('editable', false);
//	    				                                	}
//    	    				                            }]
//    	    				                        }
//    	    				                    },
//    	    				                    {    	    				                    	
//    	    				                    	colWidth:60,
//    	    				                    	dataWidget: {
//	    				                               	scriptClass: "mstrmojo.EditableLabel",
//	    				                               	postApplyProperties: function(){
//    				                                    var url = "<a target = '_new' href='./mstrServerAdmin?evt=3060&src=mstrServerAdmin.3060&Server=" +this.parent.data.name+"'>Manage</a>";
//    	    				                    		this.set("text", url);
//    				                                    this.set("title","Intelligence Server Administration Portal");
//				                                		},
////	    				                             	title:"Intelligence Server Managers.",	    				                            	
////	    				                               	text: "<a href='./mstrServerAdmin'>Manage</a>",
//    	    				                    
//	    				                            	onclick:function(){
//    	    				                    			this.set('editable',false);
//    	    				                    		}
//	    				                            }		   
//    	    				                    }]
//    	    							   }        
//    	    							]
//    	    		    	        },
//    	    		    	        {
//    	       							scriptClass:"mstrmojo.CollapsiblePanel",
//    	    							cssClass:"mstrmojo-CurrentEnvCollapsiblePanel",
//    	    							id:"CurrentEnvWebServersCollapsiblePanel",
//    	    							title:"Web Servers",
//    	    							titleCssClass:"mstrmojo-CurrentEnvTitlePanel",
//    	    							children:[
//    	    							  {
//    	    				                    scriptClass: "mstrmojo.DataGrid",
//    	    				                    cssClass: "mstrmojo-DataGrid-newenvserverlist",
//    	    				                    id: "IPANewEnvWebServersGrid",
//    	    				                    waiting: false,
//    	    				                    makeObservable: true,
//    	    				                    resizableColumns: false,
//    	    				                    dropZone:false,
//    	    									draggable:true,
//    	    				                    w:[],    				                  
//    	    							  		
//    	    				            dragFunction:function(){    									  		
//    	    								  	if(mstrmojo.all.IPANewEnvWebServersGrid.selectedItem == null){    									  			
//           									  		mstrmojo.all.DragAndDropStatusLabel.set('text','Error: Invalid type, only web server can be dropped into web servers panel !!');
//           									  		mstrmojo.all.DragAndDropStatusLabel.set('visible',true);
//           									  		mstrmojo.all.IPANewEnvMobileServersGrid.set('selectedItem',null);
//           									  		setTimeout("mstrmojo.all.DragAndDropStatusLabel.set('visible',false)", 5000);
//       									  		}
//       									  		else if(mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.type=="Web"){
//       									  			mstrmojo.all.DragAndDropStatusLabel.set('visible',false);
//       									  			mstrmojo.all.IPAOverlayBox.set('visible', true);
//       									  			
//       									  			//if new env, it's not yet built. So no need to dissociate 
//       									  			if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id == -1){
//       									  				mstrmojo.all.IPAOverlayBox.set('visible', false);
//       									  				mstrmojo.all.IPAConfigWebServersGrid.items.push(mstrmojo.all.IPANewEnvWebServersGrid.selectedItem);
//       									  				mstrmojo.all.IPAConfigWebServersGrid.render();
//       									  				
//       									  	  			//remove from selectedServers list
//           									  			var index = mstrmojo.all.environmentController.getArrayIndex(mstrmojo.all.environmentController.selectedServers,
//           									  					mstrmojo.all.IPANewEnvWebServersGrid.selectedItem);
//           									  			mstrmojo.all.environmentController.selectedServers.splice(index,1);
//           									  			
//       									  				mstrmojo.all.IPANewEnvWebServersGrid.items.splice(mstrmojo.all.IPANewEnvWebServersGrid.selectedIndex,1);
//       									  				mstrmojo.all.IPANewEnvWebServersGrid.render();
//       									  			} 
//       									  			else { //dissociate    									  			
//       									  			var env = {
//       									  					n: "env",
//       									  					name: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name,
//       									  					i: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,
//       									  					iServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers,
//       									  					webServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers,
//       									  					mobileServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers
//       									  			};
//    	                                	
//    	                                				var server = {};
//    	                                			mstrmojo.all.IPANewEnvWebServersGrid.selectedItem = mstrmojo.all.IPANewEnvWebServersGrid.items[mstrmojo.all.IPANewEnvWebServersGrid.selectedIndex];
//                                   					server.n = "server";
//                               						server.type = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.type;
//                               						server.name =  mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.name;
//                               						server.port = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.port;
//                                   					if(mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.i==="e2") //this means it's a new webserver
//                                   					{
//                                   						server.i= mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.i;
//                                   						server.application = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.application;
//                                   					}
//                                   					else{
//                                   						server.i = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.id;
//                                   						server.application = mstrmojo.all.IPANewEnvWebServersGrid.selectedItem.app;
//                                   					}
//                                   					
//                                                    	var successCB = function(res){
//                                                    		mstrmojo.all.IPAOverlayBox.set('visible', false);
//                                                    		mstrmojo.all.environmentController.getEnvironmentList(
//                                									null,function()
//                                									     {
//                                											mstrmojo.all.environmentModel.configEnvGridSuccess();
//                                											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//                                									     },
//                                									     function()
//                                									     {
//                                									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
//                                									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//                                									     });
//    				                                		//location.reload(true);
//    				                                	};
//    				                                	
//    				                                    var failureCB = function(res){
//    				                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
//    				               		                	 mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
//    				               		             	};
//    				               		             	
//    				                                	mstrmojo.all.environmentController.disassociateServerFromEnvironment(server,env,successCB, failureCB);
//       									  		  }
//       									  		}
//    	    							 },
//         								ondragleave:function(){
//    	    								  this.dragFunction();
//   								  		},
//    	    									
//    	    				                    columns: [{    	    				                        
//    	    				                        colWidth:70,
//    	    				                    	dataWidget: {
//    	    				                            scriptClass: "mstrmojo.HBox",
//    	    				                            dropZone:true,
//    	    											draggable:true,
//    	    				                            children: [{
//    	    				                                scriptClass: "mstrmojo.EditableLabel",   
//    	    				                                cssText:"cursor:move;overflow:hidden;",
//    	    				                                postApplyProperties: function(){
//    	    				                                    this.set("text", this.parent.data.name);
//    	    				                                    this.set("title","Web Server Path: " + this.parent.data.app + ", Port: " + this.parent.data.port);
//	    				                                	},
//	    				                                
//	    				                                	onclick: function(){
//	    				                                		this.set('editable', false);
//	    				                                	}
//    	    				                            }]
//    	    				                        }
//    	    				                    },
//    	    				                    //Connect/Disconnect Button
//    	    				                    {	
//    	    				                    	colWidth:35,
//    	    				                    	dataWidget: {
//    	    				                    		scriptClass:"mstrmojo.Button",
//	    				                            	//text:"Disconnect",	    
//	    				                            	cssText:"text-decoration:underline;color:purple",
//	    				                            		
//	    				                            	 bindings : {		                    	   			
//    	    				                    			text	 : function(){		                    	   				
//	    				                    	   				debugger;
//    	    				                    				var status =mstrmojo.all.EnvironmentPanel.serverStatus;
//    	    				                    				for(i = 0;i < status.length; i++)
//    	    				                    				{
//    	    				                    					if(status[i].key == this.parent.data.id)
//    	    				                    						{
//    	    				                    							if(status[i].value == "true")
//    	    				                    								return "Disconnect";
//    	    				                    								//return "background:url(../javascript/mojo/css/images/IPA/disconnect_server.GIF) repeat-x scroll left 0px;";
//    	    				                    							else
//    	    				                    								return "Connect";
//    	    				                    								//return "background: #D5D6D8 url(../javascript/mojo/css/images/IPA/connect_server.GIF) repeat-x scroll left 0px;";
//    	    				                    							
//    	    				                    						}
//    	    				                    				}    	    				                    				
//	    				                    	   			}
//	    				                    	   		},	
//	    				                            	onclick:function(){
//	    				                            		debugger;
//	    				                    	   			mstrmojo.all.IPAOverlayBox.set('visible', true);
//	    				                    	   			var status = this;
//	    			    		        					var callback = {
//	    			    		        						success:function(res){	    			    		        							
//	    			    		        							debugger;
//	    			    		        							mstrmojo.all.IPAOverlayBox.set('visible', false);	    			    		        							
//	    			    		        							mstrmojo.all.environmentController.getEnvironmentList(
//	    			    		        									null,function()
//	    			    		        									     {
//	    			    		        											mstrmojo.all.environmentModel.configEnvGridSuccess();
//	    			    		        											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//	    			    		        									     },
//	    			    		        									     function()
//	    			    		        									     {
//	    			    		        									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
//	    			    		        									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//	    			    		        									     });
//	    		    		        							},
//	    		    		        							failure:function(res){
//	    	    				                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
//	    	    				               		                	mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));	    	    				               		             	
//	    		    		        							}
//	    			    		        					};
//	    			    		        					var webserverId = this.parent.data.id;
//	    			    		        					if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers.length > 0)
//	    			    		        						var iserverId = mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers[0].id;
//	    			    		        					var action = this.text;
//	    			    		        					mstrmojo.xhr.request('POST', '../servlet/taskProc', callback, {
//	    			    		        						taskId: 'IPAServerAdminTask',
//	    			    		        						iserver_id: iserverId,
//	    			    		        						webserver_id:webserverId,
//	    			    		        						action:action
//	    			    		        					});
//	    				                            	}	    				                             
//	    				                            }		   
//    	    				                    },
//    	    				                    {     	    				                    	
//    	    				                    	colWidth:45,
//    	    				                    	dataWidget: {
//    	    				                    		scriptClass: "mstrmojo.Button",
//	    				                            	text:"Manage",
//	    				                            	title:"Apply Templates Page.",
//	    				                            	cssText:"text-decoration:underline;color:purple",
//	    				                            		
//	    				                            	onclick:function(){
//	    				                            		mstrmojo.all.IPAConfigContainer.set('selected',mstrmojo.all.ApplyTemplates);
//	    				                            		mstrmojo.IPA.IPABuildEnvironments.configModel.set("navTableSelectionIndex", 4);
//	    				                            	}	    				                             
//	    				                            }		   
//    	    				                    },{   	    				                    	
//    	    				                    	colWidth:8,
//    	    				                    	dataWidget:{
//    	    				                    		scriptClass: "mstrmojo.Button",
//    	    				                    		title:"Click to dissociate web server from the environment.",
//    	    				                    		cssClass:"drag-right-arrow-button",
//    				                            		
//    	    				                    		onclick:function(){
//    				                            			this.parent.dataGrid.dragFunction();
//    				                            		}	 
//    	    				                    	}
//    	    				                    }]
//    	    							  }       
//    	    							]
//    	    		    	        },
//    	    		    	        {
//    	      							scriptClass:"mstrmojo.CollapsiblePanel",
//    	    							cssClass:"mstrmojo-CurrentEnvCollapsiblePanel",
//    	    							id:"CurrentEnvMobileServersCollapsiblePanel",
//    	    							title:"Mobile Servers",
//    	    							titleCssClass:"mstrmojo-CurrentEnvTitlePanel",
//    	    							children:[
//    	    							  {
//    	    				                    scriptClass: "mstrmojo.DataGrid",
//    	    				                    cssClass: "mstrmojo-DataGrid-newenvserverlist",
//    	    				                    id: "IPANewEnvMobileServersGrid",
//    	    				                    waiting: false,
//    	    				                    makeObservable: true,
//    	    				                    resizableColumns: false,
//    	    				                    dropZone:false,
//    	    									draggable:true,
//    	    				                    m:[],
//    	    				                    
//    	    				                dragFunction:function(){
//    	    								  if(mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem==null){    									  			
//         									  		mstrmojo.all.DragAndDropStatusLabel.set('text','Error: Invalid type, only mobile server can be dropped into mobile servers panel !!');
//         									  		mstrmojo.all.DragAndDropStatusLabel.set('visible',true);   
//         									  		mstrmojo.all.IPANewEnvWebServersGrid.set('selectedItem',null); 
//         									  		setTimeout("mstrmojo.all.DragAndDropStatusLabel.set('visible',false)", 5000);
//     									  		}
//     									  		else if(mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.type=="Mobile"){
//     									  			mstrmojo.all.DragAndDropStatusLabel.set('visible',false);
//     									  			mstrmojo.all.IPAOverlayBox.set('visible', true);
//     									  			
//     									  			//if new env, it's not yet built. So no need to dissociate 
//     									  			if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id == -1){									  				
//     										  			mstrmojo.all.IPAOverlayBox.set('visible', false);
//         									  			mstrmojo.all.IPAConfigMobileServersGrid.items.push(mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem);
//         									  			mstrmojo.all.IPAConfigMobileServersGrid.render();
//         									  			
//         									  			//remove from selectedServers list
//         									  			var index = mstrmojo.all.environmentController.getArrayIndex(mstrmojo.all.environmentController.selectedServers,
//         									  					mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem);
//         									  			mstrmojo.all.environmentController.selectedServers.splice(index,1);
//         									  			
//         									  			//update new env grid
//         									  			mstrmojo.all.IPANewEnvMobileServersGrid.items.splice(mstrmojo.all.IPANewEnvMobileServersGrid.selectedIndex,1);
//         									  			mstrmojo.all.IPANewEnvMobileServersGrid.render();
//         									  			
//         									  			
//     									  			} 
//     									  			else { //dissociate									  			
//     									  			var env = {
//     									  					n: "env",
//     									  					name: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name,
//     									  					i: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,
//     									  					iServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers,
//     									  					webServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers,
//     									  					mobileServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers
//     									  			};
//                                     	
//                                     				var server = {};
//                                     				mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem = mstrmojo.all.IPANewEnvMobileServersGrid.items[mstrmojo.all.IPANewEnvMobileServersGrid.selectedIndex];
//                                 					server.n = "server";
//                             						server.type = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.type;
//                             						server.name =  mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.name;
//                             						server.port = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.port;
//                                 					if(mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.i==="e3") //this means it's a new webserver
//                                 					{
//                                 						server.i= mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.i;
//                                 						server.application = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.application;
//                                 					}
//                                 					else{
//                                 						server.i = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.id;
//                                 						server.application = mstrmojo.all.IPANewEnvMobileServersGrid.selectedItem.app;
//                                 					}
//                                 					
//                                                  	var successCB = function(res){
//                                                  		mstrmojo.all.IPAOverlayBox.set('visible', false);
//                                                  		mstrmojo.all.environmentController.getEnvironmentList(
//                            									null,function()
//                            									     {
//                            											mstrmojo.all.environmentModel.configEnvGridSuccess();
//                            											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//                            									     },
//                            									     function()
//                            									     {
//                            									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
//                            									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//                            									     });
//				                                		//location.reload(true);
//     			                                	};
//     			                                	
//     			                                    var failureCB = function(res){
//     			                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
//     			               		                	 mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
//     			               		             	};
//     			               		             	
//     			                                	mstrmojo.all.environmentController.disassociateServerFromEnvironment(server,env,successCB, failureCB);
//     									  		  }
//     									  		}
//    	    							  	},
//    	    							  		
//         										ondragleave:function(){
//   									  				this.dragFunction();
//   								  				},
//
//    	    				                    columns: [{    	    				                        
//    	    				                        colWidth:70,
//    	    				                    	dataWidget: {
//    	    				                            scriptClass: "mstrmojo.HBox",
//    	    						                    dropZone:false,
//    	    	    									draggable:true,
//    	    				                            children: [{
//    	    				                                scriptClass: "mstrmojo.EditableLabel",
//    	    				                                cssText:"cursor:move;overflow:hidden;",
//    	    				                                postApplyProperties: function(){
//    	    				                                    this.set("text", this.parent.data.name);
//    	    				                                    this.set("title","Mobile Server Path: " + this.parent.data.app + ", Port: " + this.parent.data.port);
//    				                                		},
//    				                                
//    				                                		onclick: function(){
//    				                                			this.set('editable', false);
//    				                                		}
//    	    				                            }]
//    	    				                        }
//    	    				                    },
//    	    				                  //Connect/Disconnect Button
//    	    				                    {	
//    	    				                    	colWidth:35,
//    	    				                    	dataWidget: {
//    	    				                    		scriptClass:"mstrmojo.Button",
//	    				                            	//text:"Disconnect",	    	
//	    				                            	cssText:"text-decoration:underline;color:purple",
//	    				                            		
//	    				                            	 bindings : {		                    	   			
//    	    				                    			text	 : function(){		                    	   				
//	    				                    	   				debugger;
//    	    				                    				var status =mstrmojo.all.EnvironmentPanel.serverStatus;
//    	    				                    				for(i = 0;i < status.length; i++)
//    	    				                    				{
//    	    				                    					if(status[i].key == this.parent.data.id)
//    	    				                    						{
//    	    				                    							if(status[i].value == "true")
//    	    				                    								return "Disconnect";
//    	    				                    								//return "background:url(../javascript/mojo/css/images/IPA/disconnect_server.GIF) repeat-x scroll left 0px;";
//    	    				                    							else
//    	    				                    								return "Connect";
//    	    				                    								//return "background: #D5D6D8 url(../javascript/mojo/css/images/IPA/connect_server.GIF) repeat-x scroll left 0px;";
//    	    				                    							
//    	    				                    						}
//    	    				                    				}    	    				                    				
//	    				                    	   			}
//	    				                    	   		},	
//	    				                            	onclick:function(){
//	    				                            		debugger;
//	    				                    	   			mstrmojo.all.IPAOverlayBox.set('visible', true);
//	    				                    	   			var status = this;
//	    			    		        					var callback = {
//	    			    		        						success:function(res){	    			    		        							
//	    			    		        							debugger;
//	    			    		        							mstrmojo.all.IPAOverlayBox.set('visible', false);	    			    		        							
//	    			    		        							mstrmojo.all.environmentController.getEnvironmentList(
//	    			    		        									null,function()
//	    			    		        									     {
//	    			    		        											mstrmojo.all.environmentModel.configEnvGridSuccess();
//	    			    		        											mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//	    			    		        									     },
//	    			    		        									     function()
//	    			    		        									     {
//	    			    		        									    	 mstrmojo.all.environmentModel.configEnvGridFailure();
//	    			    		        									    	 mstrmojo.all.IPAConfigEnvironmentGrid.onchange();
//	    			    		        									     });
//	    		    		        							},
//	    		    		        							failure:function(res){
//	    	    				                                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
//	    	    				               		                	mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));	    	    				               		             	
//	    		    		        							}
//	    			    		        					};
//	    			    		        					var mobileserverId = this.parent.data.id;
//	    			    		        					if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers.length > 0)
//	    			    		        						var iserverId = mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers[0].id;
//	    			    		        					var action = this.text;
//	    			    		        					mstrmojo.xhr.request('POST', '../servlet/taskProc', callback, {
//	    			    		        						taskId: 'IPAServerAdminTask',
//	    			    		        						iserver_id: iserverId,
//	    			    		        						webserver_id:mobileserverId,
//	    			    		        						action:action
//	    			    		        					});
//	    				                            	}	    				                             
//	    				                            }		   
//    	    				                    },
//    	    				                    {     	    				                    	
//    	    				                    	colWidth:45,
//    	    				                    	dataWidget: {
//    	    				                    	   	scriptClass: "mstrmojo.Button",
//	    				                            	text:"Manage",
//	    				                            	title:"Apply Templates Page.",
//	    				                            	cssText:"text-decoration:underline;color:purple",
//	    				                            		
//	    				                            	onclick:function(){
//	    				                            		mstrmojo.all.IPAConfigContainer.set('selected',mstrmojo.all.ApplyTemplates);
//	    				                            		mstrmojo.IPA.IPABuildEnvironments.configModel.set("navTableSelectionIndex", 4);
//	    				                            	}	    				                             
//	    				                            }		   
//    	    				                    },{
//    	    				                    	colWidth:8,
//    	    				                    	dataWidget:{
//    	    				                    		scriptClass:"mstrmojo.Button",
//    	    				                    		title:"Click to dissociate mobile server from environment",
//    	    				                    		cssClass:"drag-right-arrow-button",
//    	    				                    		
//    	    				                    		onclick:function(){
//    	    				                    			this.parent.dataGrid.dragFunction();
//    	    				                    		}
//    	    				                    	}
//    	    				                    }]
//    	    							  }      
//    	    							]
//    	    		    	        },    						        
//    						        {
//    						        	scriptClass:"mstrmojo.Label",
//    						        	id:"DragAndDropStatusLabel",
//    						        	cssClass:"mstrmojo-DragAndDropStatusLabel",
//    						        	visible:false    						        	
//    						        }		    	        
//    	    		    	  ]
//    	    		     },//end current env grid    		            
//    		     {
//   					scriptClass:"mstrmojo.HBox",
//   					cssClass:"mstrmojo-envBufferHBox"
//    		     },
//    		     {
    	// Child 2 : Available List
    	   {
    		    	scriptClass:"mstrmojo.VBox",
    		    	cssClass:"mstrmojo-EnvironmentPanel",    		    	
     			    markupMethods: {
     	  				onvisibleChange: function() { 
     	    		   			this.domNode.style.display = 'block';
     	    		   			
     	    		   			}
     	  				},
     	  			children:[  
     	  			          {
     	  			          		scriptClass: "mstrmojo.Label",
     	  			          		cssClass:"mstrmojo-buildenv-informative-label",
     	  			          		cssText:"margin-top:5px;height:80px",    	  			          			
     	  			          		text: mstrmojo.desc(8941,"Here is your available list of Mobile and Web Servers."+
     	  			          		      " If the server you wish to add to an Environment is not present in the available list,"+
     	  			          		      "you can connect to this server by adding it manually in the Add Server Section."+
     	  			          		      " To edit any Web or Mobile Server, select the server from the list and and click edit to modify properties."),
     	  			          },
     	  			          {
       	    		    	 	scriptClass: "mstrmojo.Label",
       	    		    	 	//cssClass:"mstrmojo-buildenv-informative-label",
       	    		    	 	cssClass: "mstrmojo-Label-mynewenv",	
       	    		    	 	cssText:"font-weight:bold;margin-top:12px;width:327px;margin-left:8px;border:1px solid #B6B6B6;",
       	    		    	 	text: mstrmojo.desc(8929,"Available Server Pool")
     	  			          },
     	  			          mstrmojo.all.IPAAddServerManually,
     	  			          mstrmojo.all.IPAAddServerManuallyWarning,
     	  			          // Start of Available Web Server and Mobile Server Collapsible Panel
     	  			          {
     	  			        	  scriptClass: "mstrmojo.Table",     			    
     	  			        	  rows:2,
     	  			        	  cols:1, 
     	  			        	  children:[
//    				        {
//     								slot:"0,0",
//     								scriptClass:"mstrmojo.CollapsiblePanel",
//     								cssClass:"mstrmojo-EnvCollapsiblePanel",
//     								id:"AvailableIServersCollapsiblePanel",
//     								title:"Availbable Intelligent Servers",
//     								titleCssClass:"mstrmojo-EnvTitlePanel",
//     								children:[
//     								   {
//     							            scriptClass: "mstrmojo.DataGrid",
//     							            cssClass: "mstrmojo-DataGrid-envserverlist",
//     							            id: "IPAConfigServersGrid",
//     							            waiting: false,
//     							            makeObservable: true,
//     							            resizableColumns: false,
//     										visible: false,
//     							            columns: [{
//     							                headerWidget: {
//     							                    scriptClass: 'mstrmojo.Label',
//     							                    text: "Intelligence Servers"
//     							                },
//     							                dataWidget: {
//     							                    scriptClass: "mstrmojo.HBox",
//     							                    children: [{
//     							                        scriptClass: "mstrmojo.Label",
//     							                        postApplyProperties: function(){
//     							                            this.set("text", this.parent.data.name);
//     							                        }
//     							                    }, {
//     							                        scriptClass: "mstrmojo.CheckBox",
//     							                        
//     							                        onclick:function(){
//     							                    		if(this.checked){
//     							                    			mstrmojo.all.IPANewEnvIServersGrid.is.push(this.parent.data);
//     							                    			mstrmojo.all.IPANewEnvIServersGrid.set('visible',true);
//     							                    			mstrmojo.all.IPANewEnvWebServersGrid.set('visible',true);
//     							                    			mstrmojo.all.IPANewEnvMobileServersGrid.set('visible',true);
//     							                    			mstrmojo.all.environmentController.selectedServers.push(this.parent.data);
//     							                    			mstrmojo.all.buildbutton.set('visible', true);
//     							                    			mstrmojo.all.IPANewEnvIServersGrid.set('items',mstrmojo.all.IPANewEnvIServersGrid.is);
//     							                    			mstrmojo.all.EnvironmentPanel.children[0].set('text',mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name);
//     							                    			
//     				    					                    mstrmojo.all.CurrentEnvMobileServersCollapsiblePanel.set('expanded',true);
//     				    					                    mstrmojo.all.CurrentEnvIServersCollapsiblePanel.set('expanded',true);
//     				    					                    mstrmojo.all.CurrentEnvWebServersCollapsiblePanel.set('expanded',true);
//     							                    		}
//     							                    		else{
//     							                    			mstrmojo.all.buildbutton.set('visible', false);
//     							                    		}
//     							                    	}	                                
//     							                    }]		                
//     							                }
//     							            }]			   
//     								   }      
//     								]
//     					        },//end of i-server collapsible panel
								
     					        {
     								// Available Web Server Collapsible Panel
     					        	slot:"0,0",
     								scriptClass:"mstrmojo.CollapsiblePanel",     								
     								cssClass:"mstrmojo-Available-Server",     								
     								id:"AvailableWebServersCollapsiblePanel",
     								successImg : "../images/1ptrans.gif", //blank image
     								title:mstrmojo.desc(513,"Available" ) + " " + mstrmojo.desc(8884,"Web Servers"),
     								titleCssClass:"mstrmojo-Available-Server-title", 
     								expanded : true,
     								children:[
     								  {
     					    		    	// Web Server DataGrid
     									  	scriptClass: "mstrmojo.DataGrid",
     					                    cssClass: "mstrmojo-DataGrid-envserverlist",
     					                    cssText:"width:334px;border:none;height:92px;",
     					                    id: "IPAConfigWebServersGrid",
     					                    waiting: false,
     					                    makeObservable: true,
     					                    resizableColumns: false,
     										dropZone:false,
     										draggable:false,     										
     										markupMethods: {
  	     	     	    		  				onvisibleChange: function() {     									  			
     									  			this.domNode.firstChild.hidden=true; 
     									  			this.domNode.firstChild.innerHTML=" ";
  	     	     	    		    		   		},
//  	     	     	    		    		   		postApplyProperties:function()
//  	     	     	    		    		   		{
//  	     	     	    		    		   			this.domNode.firstChild.innerHTML=" ";	
//  	     	     	    		    		   		},
  	     	     	    		  				 },
     										editWebServer : function()
     										{     									  		
     									  		if(mstrmojo.all.IPAConfigWebServersGrid.selectedItem != null)
     									  		{
     									  			mstrmojo.all.IPAAddServerManuallyTitle.set('text',"Modify Web Server Manually");
     									  			mstrmojo.all.mobileServerRadioButton.set('checked',false);
     									  			mstrmojo.all.mobileServerRadioButton.set('enabled',false);
     									  			mstrmojo.all.webServerRadioButton.set('checked',true);     									  			
     									  			mstrmojo.all.webServerRadioButton.set('enabled',true);
     									  			mstrmojo.all.connectServerManuallyButton.set('visible',false);
     									  			mstrmojo.all.connectServerManuallyButton1.set('visible',false);
     									  			mstrmojo.all.HealthAgentAccessCodeTextBox.set('enabled',false);
     									  			mstrmojo.all.HeatthAgentPortNumberTextBox.set('enabled',false);
     									  			mstrmojo.all.saveServerManuallyButton.set('visible',true);
     									  			mstrmojo.all.cancelServerManuallyButton.set('visible',true);
     									  			mstrmojo.all.machineNameConnectManuallyBox.set('value',mstrmojo.all.IPAConfigWebServersGrid.selectedItem.name);
     									  			mstrmojo.all.machineNameConnectManuallyBox.set('enabled',false);
     									  			mstrmojo.all.webserverAppName.set('value',mstrmojo.all.IPAConfigWebServersGrid.selectedItem.app);
     									  			mstrmojo.all.webserverport.set('value',	mstrmojo.all.IPAConfigWebServersGrid.selectedItem.port);
     									  			mstrmojo.all.IPAConfigMobileServersGrid.set('selectedItem',null);
     									  		}
     									  		
//     									  	 mstrmojo.insert({
//     								            scriptClass: 'mstrmojo.Editor',     								            
//     								            cssClass:'mstrmojo-CustomACLEditor',
//     								            title: "Modify Web Server", //Descriptor: MicroStrategy Web
//     								            modal : true,
//     								             
//     								            onClose: function(){
//     									  		 this.destroy();
//     									  	 	},
//     								           // width: '475px',
//     								           // buttons: buttons,
//     								            children: [
//     								                      mstrmojo.all.IPAAddServerManually,
//     								                      {
//     								                         scriptClass:'mstrmojo.HBox',
//     								                         cssClass:'mstrmojo-Editor-buttonBox',
//     								                         slot:'buttonNode',
//     								                         children:[
//     								                                   {   
//     								                                       scriptClass:'mstrmojo.HTMLButton',
//     								                                       cssClass: "mstrmojo-Editor-button",
//     								                                       text: mstrmojo.desc(1442,"OK"),
//     								                                       onclick: function(evt){
//     								                                	   	this.parent.parent.close();
//     								                                       }
//     								                                   },{
//     								                                       scriptClass:'mstrmojo.HTMLButton',
//     								                                       cssClass: "mstrmojo-Editor-button",
//     								                                       text: mstrmojo.desc(221,"Cancel"),
//     								                                       onclick: function(evt){
//     								                                           this.parent.parent.close();
//     								                                       }  
//     								                                   }
//     								                                   ]
//     								                     }
//     								                ]
//     								        }).render();
							  					
     										},
     										dragFunction:function(){     									  		
     											if(mstrmojo.all.IPAConfigWebServersGrid.selectedItem == null){
     									  			mstrmojo.all.DragAndDropStatusLabel.set('text',mstrmojo.desc(96,"Error")+': '+mstrmojo.desc(8918,"Invalid type, only web server can be dropped into web servers panel")+' !!');
     									  			mstrmojo.all.DragAndDropStatusLabel.set('visible',true);
     									  			mstrmojo.all.IPAConfigMobileServersGrid.set('selectedItem',null);
     									  			setTimeout("mstrmojo.all.DragAndDropStatusLabel.set('visible',false)", 5000);
     									  		}
     									  		else {
     									  			if (mstrmojo.all.IPAConfigWebServersGrid.selectedItem.type == 'Web') {    	
     									  				mstrmojo.all.DragAndDropStatusLabel.set('visible',false);
     									  				mstrmojo.all.IPAOverlayBox.set('visible', true);
  											
     									  				// when creating new env
     									  				if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id == -1){
     									  					//newly added servers
     									  					if(mstrmojo.all.IPAConfigWebServersGrid.selectedItem.ts==null)
     									  					{    													  
     									  						mstrmojo.all.environmentController.selectedServers.push(mstrmojo.all.IPAConfigWebServersGrid.selectedItem);
     									  						mstrmojo.all.IPANewEnvWebServersGrid.w.push(mstrmojo.all.IPAConfigWebServersGrid.selectedItem);
     									  						mstrmojo.all.IPAConfigWebServersGrid.items.splice(mstrmojo.all.IPAConfigWebServersGrid.selectedIndex,1);
     									  						mstrmojo.all.IPAConfigWebServersGrid.render();
     									  					}
     									  					else{    													
     									  						var server = {};
     									  						server.n = "server";
     									  						server.i = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.id;
     									  						server.type = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.type;
     									  						server.name =  mstrmojo.all.IPAConfigWebServersGrid.selectedItem.name;
     									  						server.port = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.port;
     									  						server.application = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.app;
     									  						mstrmojo.all.environmentController.selectedServers.push(server);
     									  						mstrmojo.all.IPANewEnvWebServersGrid.w.push(server);
     									  						mstrmojo.all.IPAConfigWebServersGrid.items.splice(mstrmojo.all.IPAConfigWebServersGrid.selectedIndex,1);
     									  						mstrmojo.all.IPAConfigWebServersGrid.render();
     									  					}
     									  					mstrmojo.all.IPANewEnvWebServersGrid.set('items',mstrmojo.all.IPANewEnvWebServersGrid.w);
     									  					mstrmojo.all.IPANewEnvWebServersGrid.render();
     									  					mstrmojo.all.IPAConfigWebServersGrid.set('selectedItem',null);
     									  					mstrmojo.all.IPAOverlayBox.set('visible', false);
     									  				}
  											
     									  				else { // associating to existing env
  											//mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers.push(mstrmojo.all.IPAConfigWebServersGrid.selectedItem);
  											
  											
     									  					var env = {
     									  						n: "env",
     									  						name: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name,
     									  						i: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,
     									  						iServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers,
     									  						webServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers,
     									  						mobileServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers,
     									  						};
			                                	
			                                				mstrmojo.all.IPAConfigWebServersGrid.selectedItem = mstrmojo.all.IPAConfigWebServersGrid.items[mstrmojo.all.IPAConfigWebServersGrid.selectedIndex]; 
  															var server = {};			                                		
		                                					server.n = "server";
	                                						server.type = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.type;
	                                						server.name =  mstrmojo.all.IPAConfigWebServersGrid.selectedItem.name;
	                                						server.port = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.port;
		                                					if(mstrmojo.all.IPAConfigWebServersGrid.selectedItem.i==="e2") //this means it's a new webserver
		                                					{
		                                						server.i= mstrmojo.all.IPAConfigWebServersGrid.selectedItem.i;
		                                						server.application = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.application;
		                                					}
		                                					else{
		                                						server.i = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.id;
		                                						server.application = mstrmojo.all.IPAConfigWebServersGrid.selectedItem.app;
		                                					}		                                                	
		                                					
			                                	
		                                					var successCB = function(res){		                                							
		                                							mstrmojo.all.IPAOverlayBox.set('visible', false);
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
//		                                							mstrmojo.all.IPAConfigEnvironmentGrid.onchange();		                                							
//		                                							location.reload(true);														
		                                					};
				                                	
		                                					var failureCB = function(res){
		                                							mstrmojo.all.IPAOverlayBox.set('visible', false);
		                                							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
		                                					};
				               		             	
		                                					mstrmojo.all.environmentController.associateServerToEnvironment(server,env,successCB, failureCB);
  												}	
			                                	} else {
			                                		mstrmojo.all.DragAndDropStatusLabel.set('text',mstrmojo.desc(96,"Error")+': '+mstrmojo.desc(8918,"Invalid type, only web server can be dropped into web servers panel")+' !!');
	    									  		mstrmojo.all.DragAndDropStatusLabel.set('visible',true);
	    									  		setTimeout("mstrmojo.all.DragAndDropStatusLabel.set('visible',false)", 5000);
			                                	}
  							  				  }	
     								  		},
     								  		
     										ondragleave:function(event){     									  		
     								  			this.dragFunction();
     								  		},
     								  		// Web Server DataGrid Columns
     					                    columns: [
     					                      {
     					                    	// Column 1 : Associate Button  
     					                    	colWidth:5,     					                    	
     					                    	dataWidget:{
	    				                    		scriptClass:"mstrmojo.Button",	    				                    		
	    				                    		title:mstrmojo.desc(8930,"Associate web server to the selected environment"),
	    				                    		cssClass:"drag-left-arrow-button",
	    				                    		cssText:"text-align:left;width:10px;",	    				                    		
	    				                    		onclick:function(){
	    				                    			this.parent.dataGrid.dragFunction();
	    				                    		}
	    				                    	}
     					                      },
     					                      {     					                        
     					                        // Column 2 : Web Server Name
     					                    	colWidth:50,
     					                    	dataWidget: {
     					                            scriptClass: "mstrmojo.HBox",
     					                            draggable:true,
     												dropZone:false,     												
     					                            children: [{
     					                                scriptClass: "mstrmojo.EditableLabel",
     					                                cssText:"cursor:move;overflow:hidden;width:130px;text-align:left;position:relative;left:-30px;",
     					                                postApplyProperties: function(){		                            				                            		
     					                                    this.set("text", this.parent.data.name);
     					                                    if(this.parent.data.i === "e2")     					                                    	
     					                                    	this.set("title",mstrmojo.desc(8919,"Web Server Path")+": " + this.parent.data.application +", "+ mstrmojo.desc(16,"Port")+": " + this.parent.data.port);
     					                                    else
     					                                    	this.set("title",mstrmojo.desc(8919,"Web Server Path")+": " + this.parent.data.app + ", "+ mstrmojo.desc(16,"Port")+": "  + this.parent.data.port);
     					                            	},
				                                
     					                            	onclick: function(){
     					                            		this.set('editable', false);
     					                            	}
     					                            }]	 					  
     					                    	}
     					                      },
     					                      {
     					                    	// Column 3 : Edit Web Server Button
     					                    	colWidth:12,
     					                    	dataWidget:{
	    				                    		scriptClass:"mstrmojo.Button",
	    				                    		title:mstrmojo.desc(8931,"Edit Web Server"),
	    				                    		text:mstrmojo.desc(1088,"Edit"),
	    				                    		cssText:"text-decoration:underline;color:blue;width:auto;text-align:center;margin-left:20px;",
	    				                    	    //cssText:"background:url(../style/mstr/images/tbEditableViewMode.gif) repeat-x scroll left 0px;",
	    				                    		//background:url(../../../style/mstr/images/tbEditableViewMode.gif);
	    				                    		//cssText:"text-align:left;",
	    				                    		
	    				                    		onclick:function(){
	    				                    			this.parent.dataGrid.editWebServer();
	    				                    		}
	    				                    	}
     					                      },
     					                      {    	    				                    	
     					                    	// Column 4 : Manage Web Server Button
     					                    	colWidth:35,
     					                    	dataWidget: {
	    				                    	 	scriptClass: "mstrmojo.Button",
    				                            	text:mstrmojo.desc(8916,"Manage"),
    				                            	title:mstrmojo.desc(8922,"Apply Templates Page"),
    				                            	cssText:"text-decoration:underline;color:blue;width:auto;text-align:center;",
    				                            		
    				                            	onclick:function(){
    				                            		mstrmojo.all.IPAConfigContainer.set('selected',mstrmojo.all.ApplyTemplates);
    				                            		mstrmojo.IPA.IPABuildEnvironments.configModel.set("navTableSelectionIndex", 4);
    				                            	}
     					                    	}    				                        		   
	    				                    }] // End of WebServer Grid Columns
     								  }]
     					        },	//end of w-server collapsible panel
     					        
     					        {
        							// Available Mobile Server Collapsible Panel
     					        	slot:"1,0",
     								scriptClass:"mstrmojo.CollapsiblePanel",
     								//cssClass:"mstrmojo-EnvCollapsiblePanel",
     								cssClass:"mstrmojo-Available-Mobile-Server",
     								//cssText: " margin-bottom:10px;",
     								title:mstrmojo.desc(513,"Available" ) + " " + mstrmojo.desc(8375,"Mobile Servers"),
     								id:"AvailableMobileServersCollapsiblePanel",
     								successImg : "../images/1ptrans.gif", //blank image
     								//titleCssClass:"mstrmojo-EnvTitlePanel",
     								titleCssClass:"mstrmojo-Available-Server-title",
     								expanded : true,
     								children:[
     								    {
     					    		    	scriptClass: "mstrmojo.DataGrid",
     					                    cssClass: "mstrmojo-DataGrid-envserverlist",
     					                    cssText:"border:none;width:334px;height:92px;border-bottom:1px solid #B6B6B6;",
     					                    id: "IPAConfigMobileServersGrid",
     					                    waiting: false,
     					                    makeObservable: true,
     					                    resizableColumns: false,
     					                    dropZone:false,
     										draggable:true,     										
     										markupMethods: {
  	     	     	    		  				onvisibleChange: function() {								   				
  	     	     	    		    		   			this.domNode.firstChild.hidden=true;
  	     	     	    		    		   			this.domNode.firstChild.innerHTML=" ";
  	     	     	    		    		   			}
  	     	     	    		  				 },
     										editMobileServer : function()
     										{     									  		
     									  		if(mstrmojo.all.IPAConfigMobileServersGrid.selectedItem != null)
     									  		{
     									  			mstrmojo.all.IPAAddServerManuallyTitle.set('text',"Modify Mobile Server Manually");     									  			
     									  			mstrmojo.all.webServerRadioButton.set('checked',false);
     									  			mstrmojo.all.webServerRadioButton.set('enabled',false);
     									  			mstrmojo.all.mobileServerRadioButton.set('checked',true);
     									  			mstrmojo.all.mobileServerRadioButton.set('enabled',true);
     									  			mstrmojo.all.connectServerManuallyButton.set('visible',false);
     									  			mstrmojo.all.connectServerManuallyButton1.set('visible',false);
     									  			mstrmojo.all.HealthAgentAccessCodeTextBox.set('enabled',false);
     									  			mstrmojo.all.HeatthAgentPortNumberTextBox.set('enabled',false);
     									  			mstrmojo.all.saveServerManuallyButton.set('visible',true);
     									  			mstrmojo.all.cancelServerManuallyButton.set('visible',true);
     									  			mstrmojo.all.machineNameConnectManuallyBox.set('value',mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.name);
     									  			mstrmojo.all.machineNameConnectManuallyBox.set('enabled',false);
     									  			mstrmojo.all.mobileserverAppName.set('value',mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.app);
     									  			mstrmojo.all.mobileserverport.set('value',	mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.port);
     									  			mstrmojo.all.IPAConfigWebServersGrid.set('selectedItem',null);
     									  		}
     										},
     										
     										dragFunction:function(){     											
     											if(mstrmojo.all.IPAConfigMobileServersGrid.selectedItem == null){
			                                	mstrmojo.all.DragAndDropStatusLabel.set('text',mstrmojo.desc(96,"Error")+': '+mstrmojo.desc(8924,"Invalid type, only mobile server can be dropped into mobile servers panel")+' !!');
	  									  		mstrmojo.all.DragAndDropStatusLabel.set('visible',true);
	  									  		mstrmojo.all.IPAConfigWebServersGrid.set('selectedItem',null);
	  									  		setTimeout("mstrmojo.all.DragAndDropStatusLabel.set('visible',false)", 5000);
								  			} else {
											if (mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.type == 'Mobile') {
												mstrmojo.all.DragAndDropStatusLabel.set('visible',false);
												mstrmojo.all.IPAOverlayBox.set('visible', true);
												
												// when creating new env
												if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id == -1){
													   
													  // newly added servers
													   if(mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.ts==null)
													   {    													  
														   mstrmojo.all.environmentController.selectedServers.push(mstrmojo.all.IPAConfigMobileServersGrid.selectedItem);
														   mstrmojo.all.IPANewEnvMobileServersGrid.m.push(mstrmojo.all.IPAConfigMobileServersGrid.selectedItem);
														   mstrmojo.all.IPAConfigMobileServersGrid.items.splice(mstrmojo.all.IPAConfigMobileServersGrid.selectedIndex,1);
														   mstrmojo.all.IPAConfigMobileServersGrid.render();
													   }
													   else{    													
														   var server = {};
									                       server.n = "server";
									                       server.i = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.id;
									                       server.type = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.type;
									                       server.name =  mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.name;
									                       server.port = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.port;
									                       server.application = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.app;
									                       mstrmojo.all.environmentController.selectedServers.push(server);
									                       mstrmojo.all.IPANewEnvMobileServersGrid.m.push(server);
									                       mstrmojo.all.IPAConfigMobileServersGrid.items.splice(mstrmojo.all.IPAConfigMobileServersGrid.selectedIndex,1);
														   mstrmojo.all.IPAConfigMobileServersGrid.render();
													   }
													  mstrmojo.all.IPANewEnvMobileServersGrid.set('items',mstrmojo.all.IPANewEnvMobileServersGrid.m);
													  mstrmojo.all.IPANewEnvMobileServersGrid.render();
													  mstrmojo.all.IPAConfigMobileServersGrid.set('selectedItem',null);
													  mstrmojo.all.IPAOverlayBox.set('visible', false);
												}
												else { // associating to existing env
												//mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers.push(mstrmojo.all.IPAConfigMobileServersGrid.selectedItem);											
												
												var env = {
					              		        		  n: "env",
					              		                  name: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.name,
					              		                  i: mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.id,
					              		                  iServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.iServers,
					              		                  webServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.webServers,
					              		                  mobileServers : mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem.mobileServers,
					              		            };
			                                	
			                                				var server = {};	
			                                				mstrmojo.all.IPAConfigMobileServersGrid.selectedItem = mstrmojo.all.IPAConfigMobileServersGrid.items[mstrmojo.all.IPAConfigMobileServersGrid.selectedIndex];
		                                					server.n = "server";
	                              						server.type = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.type;
	                              						server.name =  mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.name;
	                              						server.port = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.port;
		                                					if(mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.i==="e3") //this means it's a new webserver
		                                					{
		                                						server.i= mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.i;
		                                						server.application = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.application;
		                                					}
		                                					else{
		                                						server.i = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.id;
		                                						server.application = mstrmojo.all.IPAConfigMobileServersGrid.selectedItem.app;
		                                					}		                                                	
		                                					
			                                	
		                                					var successCB = function(res){
		                                							mstrmojo.all.IPAOverlayBox.set('visible', false);
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
//		                                							mstrmojo.all.IPAConfigEnvironmentGrid.onchange();		                                							
//		                                							location.reload(true);														
		                                					};
				                                	
		                                					var failureCB = function(res){
		                                							mstrmojo.all.IPAOverlayBox.set('visible', false);
		                                							mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
		                                					};
				               		             	
		                                					mstrmojo.all.environmentController.associateServerToEnvironment(server,env,successCB, failureCB);
													}
			                                	}else {
			                                		mstrmojo.all.DragAndDropStatusLabel.set('text',mstrmojo.desc(96,"Error")+': '+mstrmojo.desc(8924,"Invalid type, only mobile server can be dropped into mobile servers panel")+' !!');
	    									  		mstrmojo.all.DragAndDropStatusLabel.set('visible',true);
	    									  		setTimeout("mstrmojo.all.DragAndDropStatusLabel.set('visible',false)", 5000);
			                                	}
								  			}
     								    	},
     								    	
	       									ondragleave:function(){     								    		
     								    		this.dragFunction();
     								    	},
     										// Mobile Server DataGrid Columns
     					                    columns: [
     					                       {
     					                    	   // Column 1: Associate Button
     					                    	   colWidth:5,
     					                    	   dataWidget:{
     					                    	   		scriptClass:"mstrmojo.Button",     					                    	   		
     					                    	   		title:mstrmojo.desc(8932,"Associate mobile server to the selected environment"),
     					                    	   		cssClass:"drag-left-arrow-button",
     					                    	   		cssText:"text-align:left;width:10px;",
		
     					                    	   		onclick:function(){
     					                    	   			this.parent.dataGrid.dragFunction();
     					                       			}
     					                       		}
     					                       },       
     					                       {     					                       
     					                         // Column 2 : Mobile Server name
     					                    	 colWidth:60,
     					                    	 dataWidget: {
     					                            scriptClass: "mstrmojo.HBox",
     					                            dropZone:false,
     	    										draggable:true,
     					                            children: [{
     					                                scriptClass: "mstrmojo.EditableLabel",
     					                                cssText:"cursor:move;overflow:hidden;width:130px;text-align:left;position:relative;left:-30px;",
     					                                postApplyProperties: function(){
     					                                    this.set("text", this.parent.data.name);
    					                                    if(this.parent.data.i === "e3")    					                                    	
    					                                    	this.set("title",mstrmojo.desc(8925,"Mobile Server Path")+": "+ this.parent.data.application + ", "+mstrmojo.desc(16,"Port")+": "+ this.parent.data.port);
     					                                    else
     					                                    	this.set("title",mstrmojo.desc(8925,"Mobile Server Path")+": "+ this.parent.data.app + ", "+mstrmojo.desc(16,"Port")+": " + this.parent.data.port);
     					                            	},
				                                
     					                            	onclick: function(){
     					                            		this.set('editable', false);
     					                            	}
     					                            	}]
     					                         	}
     					                       },
     					                       {
     					                    	// Column 3 : Edit Mobile Server Button
     					                    	colWidth:12,
     					                    	dataWidget:{
	    				                    		scriptClass:"mstrmojo.Button",
	    				                    		title:mstrmojo.desc(8933,"Edit Mobile Server"),
	    				                    		text:mstrmojo.desc(1088,"Edit"),	    				                    		
	    				                    		cssText:"text-decoration:underline;color:blue;width:auto;text-align:center;margin-left:20px;",
	    				                    		//cssText:"background:url(../style/mstr/images/tbEditableViewMode.gif) repeat-x scroll left 0px;",
	    				                    		//cssText:"background: #D5D6D8 url(../javascript/mojo/css/images/IPA/connect_server.GIF) repeat-x scroll left 0px;",
	    				                    		//cssText:"text-align:left;",
	    				                    		
	    				                    		onclick:function(){
	    				                    			this.parent.dataGrid.editMobileServer();
	    				                    		}
	    				                    	}
     					                      },
     					                      {    
     					                    	// Column 4 : Manage Mobile Server Button
     					                    	colWidth:35,
     					                    	dataWidget: {
	    				                    	  	scriptClass: "mstrmojo.Button",
	    				                    	  	text:mstrmojo.desc(8916,"Manage"),
    				                            	title:mstrmojo.desc(8922,"Apply Templates Page"),
    				                            	cssText:"text-decoration:underline;color:blue;width:auto;text-align:center;",
    				                            		
    				                            	onclick:function(){
    				                            		mstrmojo.all.IPAConfigContainer.set('selected',mstrmojo.all.ApplyTemplates);
    				                            		mstrmojo.IPA.IPABuildEnvironments.configModel.set("navTableSelectionIndex", 4);
    				                            	}
    				                            }		   
	    				                    }]			    	
     								    }
     								]
     					        }//end of m-server collapsible panel
     				     ]}// end servers grids
     				]
     			} 
    	   // End of Available List
     		   ]
//    	   } // end HBox for envs and current env details    	   
//    	]//end main VBox children
    	
    });
})();