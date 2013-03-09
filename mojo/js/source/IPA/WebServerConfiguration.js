(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css", "mstrmojo.TabContainer", 
	"mstrmojo.IPA.IServerDefaults",
	"mstrmojo.IPA.DiagnosticsConfiguration",
	"mstrmojo.IPA.SecurityConfiguration",
	"mstrmojo.IPA.OfficeConfiguration",
	"mstrmojo.IPA.WidgetDeploymentConfiguration", "mstrmojo.IPA.IPATemplatesController");
	
	mstrmojo.requiresDescs(2400,2399,3167,8835,8836,8837,8902,8839,460,459);
	
    /*
 	 * sorts template names in ascending order
 	 */
 	function _sortFunc(a,b){    	
    	if(a.name!='[Defaults]' &&  b.name!='[Defaults]'){
    		var e = a.name == b.name;
			var r = a.name > b.name;
			if(e) { return 0;} 
			else if(r) { return 1;} 
			else {return -1;} 
    	}    		
    }
 	
	var templatesController = mstrmojo.insert({
	  	id: "templatesController",
	  	scriptClass: "mstrmojo.IPA.IPATemplatesController"	  	
	 });
	
	// GUI Part: this is the web server Configuration widget for IPA
	mstrmojo.IPA.WebServerConfiguration = mstrmojo.declare(
	//superclass
	mstrmojo.Box,	
	null, {
		scriptClass : "mstrmojo.IPA.WebServerConfiguration",
		configModel:null,
		cssText: "position:relative;",		
		
		postCreate:function(){
			templatesController._getTemplateList();
		},		
		
		children: [
		{
		scriptClass : "mstrmojo.Label",
		text : mstrmojo.desc(8835,"MicroStrategy Server Configuration Template"),
		cssClass: "mstrmojo-rightcolumn-label"
		},
		{
		scriptClass : "mstrmojo.Label",
		cssClass: "mstrmojo-informative-label",
		text : mstrmojo.desc(8836,"Here you can add save and modify different configuration templates to apply to MicroStrategy Web Servers and Individual Intelligence Servers associated with these web servers")
		},
		{
		scriptClass : "mstrmojo.HBox",
		cssText: "margin:15px",
		
		children : [ 
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8837,"Template Name:") + " "
			}, 
			{
				scriptClass : 'mstrmojo.Pulldown',
				id:'TemplateNamePullDown',
				itemField : "name",
				itemIdField : 'name',
				cssText : 'width:150px;height:auto;',
				items : [{
					name : mstrmojo.desc(8902,"Select a Template") + " ..."
				}],				
				
				onitemsChange : function() {				
					if(this.items && this.items.length > 0) {						
							this.set("value", this.items[0].name);						
					}
				},
				onvalueChange : function() {					
					var newTemplate = "Create New...";
					
					mstrmojo.all.TemplateTypePullDown.onvalueChange(this.selectedIndex);
					
					//remove red color that was caused by template value validation checks
					var objIDHash = mstrmojo.all.templatesController.fieldToObjectIDHash;
	    			for(var obj in objIDHash){	    				
	    				if(objIDHash[obj]!="" && typeof objIDHash[obj].inputNode!='undefined'){
	    					if(objIDHash[obj].visible)
	    						objIDHash[obj].inputNode.style.cssText= "display:inline;";	    					
	    					
	    					//don't change the widths
   							if(obj.search('widgetSrcFolderPath|officeLocation') != -1)
  	    							objIDHash[obj].inputNode.style.cssText += "width:300px;";
   							if(obj.search('desktopPath|ncsPath|officePath') != -1)
  	    							objIDHash[obj].inputNode.style.cssText += "width:340px;";
	    				}
	    			}
	    			
	    			//strip the brackets
	    			var templateName = this.value.replace(/\[/,"").replace(/\]/,"");
	    			
					if(this.selectedIndex != this.items.length-1){ 
					    //load selected templates values					    
					    mstrmojo.all.TemplateTypePullDown.set('enabled',false);
					    if(templateName == 'Defaults')
					    	templateName = 'sys_defaults';
						templatesController._getTemplateData(templateName,mstrmojo.all.templatesController.propertyHashValues,mstrmojo.all.templatesController.fieldToObjectIDHash);						
					}else{ 
 					    //else load default values
 					    mstrmojo.all.TemplateTypePullDown.set('enabled',true);
					    templatesController._getTemplateData('sys_defaults',mstrmojo.all.templatesController.propertyHashValues,mstrmojo.all.templatesController.fieldToObjectIDHash);
					}
					
					mstrmojo.all.SaveResultBox.set('visible',false); 
					setTimeout("mstrmojo.all.SaveResultSuccessBox.set('visible',false);",10000);					
					
					if(templateName == "sys_defaults"){
						mstrmojo.all.TemplateSaveButton.set('enabled',false);
					}else{
						mstrmojo.all.TemplateSaveButton.set('enabled',true);
					}
 					
				}				
			},{
				scriptClass : "mstrmojo.Box",
				cssText : 'width:10px;'
			},{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8839,"Template Type:") + " "
			}, 	{
				scriptClass : 'mstrmojo.Pulldown', 
				id:"TemplateTypePullDown",
				itemField : "type",
				itemIdField : 'type',
				cssText : 'width:147px;height:auto;',
				items:[{	
							type:"Universal"
						},{	
							type:"Web Server"
						},{	
							type:"Mobile Server"
						},{	
							type:"Intelligence Server"
						}
				       ],
				
				onitemsChange : function() {

				},
				
				onvalueChange : function(index) {
					var selectedName = mstrmojo.all.TemplateNamePullDown.selectedItem;
					
					mstrmojo.all.templatesController.showConfigurationTabs(mstrmojo.all.TemplateTypePullDown.selectedIndex);
					if(selectedName){
						if(selectedName.type === "UNIVERSAL" || selectedName.type === "Universal"){
							this.set('value',this.items[0].type);							
						}
						if(selectedName.type === "Web Server")
							this.set('value',this.items[1].type);
						if(selectedName.type === "Mobile Server"){
							this.set('value',this.items[2].type);	
						}
						if(selectedName.type === "Intelligence Server")
							this.set('value',this.items[3].type);
					}
				}
			}]
		},
		{
			scriptClass:"mstrmojo.VBox",
			cssText:"margin:15px;width:97%;border:ridge;border-width:1px;border-color:green;",
			id:"SaveResultSuccessBox",
			visible:false,
			children:[			 
			 {
				 scriptClass:"mstrmojo.Label",
				 cssText:"padding:10px;color:green;font-weight:bold;",
				 text: '&#x2713' +  " " + mstrmojo.desc(8840,"Template saved successfully.")
			 }
			]						
		},
		{
			scriptClass:"mstrmojo.VBox",
			cssText:"margin:15px;width:97%;border:ridge;border-width:1px;border-color:red;",
			id:"SaveResultBox",
			visible:false,
			children:[
			 {
				scriptClass:"mstrmojo.Label",
				text:mstrmojo.desc(459,"Invalid Information"),
				cssText:"color:red;font-size: 12pt;font-weight: bold;padding:10px;"
			 },
			 {
				 scriptClass:"mstrmojo.Label",
				 cssText:"padding:10px;",
				 text:mstrmojo.desc(460,"Please correct the marked fields and try again.")
			 }
			]						
		},
		{
		scriptClass : "mstrmojo.TabContainer",		
		visible : false,
		onvisibleChange : function() {
			for(var i = 0; i < this.children.length; i++) {
				this.children[i].set('visible', this.visible);
			}
			this.tabstack.selected.set('visible', this.visible);
			if(this.visible)
				this.tabstack.set('border', '1px solid #AAAAAA');
			else
				this.tabstack.set('border', '');

		},
		children : [{
			scriptClass : "mstrmojo.TabStrip",
			autoHide : true,
			alias : "tabstrip",
			target : this.parent.tabstack
		}, {
			scriptClass : "mstrmojo.StackContainer",
			id:"tabStackID",
			slot : "stack",
			alias : "tabstack",			
			border : "1px solid #AAAAAA",
			postCreate : function() {
				this.set("selected", this.children[0]);				
			},
			children : [
			            mstrmojo.IPA.IServerDefaults
			]
		}]}, 
		{
		scriptClass : "mstrmojo.HBox",
		cssText: "position:absolute;right:0px",
		children : [ 
		{
			scriptClass : "mstrmojo.Button",
			cssClass : "mstrmojo-add-button",
			id:"TemplateSaveButton",
			text:mstrmojo.desc(2400,"Save"),
			
			/*
			 * add newly created template to dropdown list
			 */
			addTemplateToDropDownList:function(newTemplateFromSaveAs){
				mstrmojo.all.SaveResultSuccessBox.set('visible',true);	
				if(newTemplateFromSaveAs.method=="saveas"){
					var exists;
					for(var i=0; i < mstrmojo.all.TemplateNamePullDown.items.length;i++){
						if(newTemplateFromSaveAs.name === mstrmojo.all.TemplateNamePullDown.items[i].name){
							exists = 1;
							break;
						}
						else{exists = 0;}
					}
					if(exists == 0){
						//point to the newly added template name 
						var callback = {
		      	                 success: function (res) {
		      	 						mstrmojo.all.IPAOverlayBox.set('visible', false);
		      	 						var templates = res;
		    	 						if(res == null){
		    	 							return;
		    	 						}
		    	 						var templateNamePullDown = mstrmojo.all.TemplateNamePullDown;
		    	 						var selectedItem = mstrmojo.all.TemplateNamePullDown.selectedItem;
		    	 						templateNamePullDown.items.length=0;
		    	 						var newTemplate = {name:"[Create New...]"};
		    	 						if(templateNamePullDown) {
		    	 							templateNamePullDown.set("items", res.templateList);
		    	 							templateNamePullDown.set('items',templateNamePullDown.items.sort(_sortFunc));		    	 						
		    	 							for(var i = 0; i < templateNamePullDown.items.length;i++){
		    	 								if(templateNamePullDown.items[i].name == 'sys_defaults'){  
		    	 									templateNamePullDown.items.splice(i,1);
		    	 									templateNamePullDown.items.push({name:"[Defaults]",type:"Universal"});
		    	 									break;
		    	 								}		    	 								
		    	 							}
		    	 							
		    	 							for(var i = 0; i < templateNamePullDown.items.length;i++){	
		    	 								if(templateNamePullDown.items[i].name == newTemplateFromSaveAs.name){  
		    	 									templateNamePullDown.set('selectedItem',templateNamePullDown.items[i]);
		    	 									templateNamePullDown.set('selectedIndex',i);
		    	 									templateNamePullDown.set('value',templateNamePullDown.items[i].name);
		    	 								}
		    	 							}
		    	 							
		    	 							mstrmojo.all.ApplyTemplatesPullDown.set("items",res.templateList);    	 						
		    	 						}    	 						
		    	 						templateNamePullDown.items.push(newTemplate);		    	 						
		    	 						
		        				 },
		        				 failure:function(res){
		        					 mstrmojo.alert("failure in fetching the template list");
		        				 }
			    			};
			    			mstrmojo.xhr.request('POST', mstrConfig.taskURL , callback, {
			    				taskId: 'getIPATemplateFilesTask'
			    			});
					}
				}else{
					mstrmojo.all.TemplateNamePullDown.set('value',mstrmojo.all.TemplateNamePullDown.selectedItem.name);
				}
			},
			
			onclick:function(newTemplateFromSaveAs){		
				mstrmojo.all.SaveResultBox.set('visible',false);
				mstrmojo.all.SaveResultSuccessBox.set('visible',false);
				var objIDHash = mstrmojo.all.templatesController.fieldToObjectIDHash;
				
				var callback = {
  	                 success: function (res) {
   	    				mstrmojo.all.IPAOverlayBox.set('visible', false);   	    				
   	    				
   	    				//remove red color
   	    				for(var obj in objIDHash){
   	    					if(objIDHash[obj]!="" && typeof objIDHash[obj].inputNode!='undefined'){ 
   	    						if(objIDHash[obj].visible)
   	    							objIDHash[obj].inputNode.style.cssText= "display:inline;";   	    						
   	    						
   	    						//don't change the widths
   	    						if(obj.search('widgetSrcFolderPath|officeLocation') != -1)
   	    							objIDHash[obj].inputNode.style.cssText += "width:300px;";
   	    						
   	    						if(obj.search('desktopPath|ncsPath|officePath') != -1)
	   	    							objIDHash[obj].inputNode.style.cssText += "width:340px;";
   	    					}
   	    				}
   	    				
   	    				if(res != null && typeof(res.responses)!='undefined'){
   	    					for(var j =0; j < res.responses.length;j++){
   	    						var invalidProps = res.responses[j].invalidatePropertyList;   	    					
   	    						//set erroneous fields to red
   	    						if(typeof(invalidProps)!='undefined'){
   	    						for(var i = 0; i < invalidProps.length; i++){   	    						
   	    							if(objIDHash[invalidProps[i].name]!="" && typeof objIDHash[invalidProps[i].name].inputNode!='undefined'){
   	    								objIDHash[invalidProps[i].name].inputNode.style.cssText= "border-color:red;color: red;font-weight: bold;display:inline;";
   	    							
   	    								//don't change the widths
   	    								if(invalidProps[i].name.search('widgetSrcFolderPath|officeLocation') != -1)
   	    									objIDHash[invalidProps[i].name].inputNode.style.cssText += "width:300px;";
   	    								if(invalidProps[i].name.search('desktopPath|ncsPath|officePath') != -1)
   	    									objIDHash[invalidProps[i].name].inputNode.style.cssText += "width:340px;";
   	    							}
   	    						}
   	    						
   	    						if(invalidProps.length > 0){
   	    							mstrmojo.all.SaveResultBox.set('visible',true);
   	    						}
   	    						else{   	
   	    							templatesController._getTemplateList();   	    							
   	    							mstrmojo.all.TemplateSaveButton.addTemplateToDropDownList(newTemplateFromSaveAs);
   	    						}}
   	    					} 
   	    					if(res.responses.length == 0){
   	    						mstrmojo.all.TemplateSaveButton.addTemplateToDropDownList(newTemplateFromSaveAs);
   	    					}
   	    				}else{ 
   	    					 //if res is null then saving task had no invalid params
   							mstrmojo.all.TemplateSaveButton.addTemplateToDropDownList(newTemplateFromSaveAs);
   	    				}
  	 				  },
  	 				  failure: function (res) {
  	                   if (res) {
  	                	   mstrmojo.all.IPAOverlayBox.set('visible', false);
  	                       mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
  	                   }
  	               }
  	 			};				
				var newTemplateName = "[Create New...]";
				//last chk in if block is to see if template name itself is 'Create New...' or really a create new operation from user
				if((mstrmojo.all.TemplateNamePullDown.selectedItem.name == newTemplateName) && newTemplateFromSaveAs.name=="click" &&
						mstrmojo.all.TemplateNamePullDown.selectedIndex == mstrmojo.all.TemplateNamePullDown.items.length-1){
					mstrmojo.all.TemplateSaveAsButton.onclick();
				}else if(newTemplateFromSaveAs.method=="saveas"){
					 //saveAs					
					templatesController.saveTemplate(newTemplateFromSaveAs,callback);
				}else{ 
					//save
					templatesController.saveTemplate(mstrmojo.all.TemplateNamePullDown.selectedItem,callback);					
				}
			}			
		},{
			scriptClass : "mstrmojo.Button",
			cssClass : "mstrmojo-add-button",
			id:"TemplateSaveAsButton",
			text:mstrmojo.desc(3167,"Save As"),
			
			onclick:function(){
			
				// Show the dialog.
		        mstrmojo.insert({
		            scriptClass: 'mstrmojo.Dialog',
		            id: "SaveAsDialog",
		            title: "Cloud Operations Manager",		            
		            
		            saveAction:function(){
		    			mstrmojo.all.TemplateAlreadyExistsLabel.set("visible",false);
		    			mstrmojo.all.TemplateNameInvalidLabel.set("visible",false);		            	        		
	        		
		    			if(mstrmojo.all.SaveAsDialogTextBox.value===""){		            	        			
		    				return;
		    			}
	        		
		    			var newTemplate = {name:mstrmojo.all.SaveAsDialogTextBox.value,type:mstrmojo.all.TemplateTypePullDown.selectedItem.type,method:"saveas"};
	        		
		    			// check if the template name-type already exists OR if it is a forbidden name like 'Create New...' or 'sys_defaults' 
		    			//if NO only then call the save action.		            	        		
		    			var callback = {
	      	                 success: function (res) {
	      	 						mstrmojo.all.IPAOverlayBox.set('visible', false);
	      	 						if(templatesController.checkForValidName(newTemplate.name)){
	      	 							if(templatesController.checkIfTemplateNameTypeUnique(res.templateList,newTemplate)){		            	      	 									            	        		
	      	 								mstrmojo.all.SaveAsDialog.destroy();
	      	 								//call the save action       
	      	 								mstrmojo.all.TemplateSaveButton.onclick(newTemplate);	      	 								
	      	 							}else{
	      	 								mstrmojo.all.TemplateAlreadyExistsLabel.set("visible",true);
	      	 								return;
	      	 							}
	      	 						}else{
	      	 							mstrmojo.all.TemplateNameInvalidLabel.set("visible",true);	
	      	 							return;
	      	 						}
	        				 },
	        				 failure:function(res){
	        					 mstrmojo.alert("failure in fetching the template list");
	        				 }
		    			};
		    			mstrmojo.xhr.request('POST', mstrConfig.taskURL , callback, {
		    				taskId: 'getIPATemplateFilesTask'
		    			});
		        	},
		            
		            children: [
		               {
		            	   scriptClass:"mstrmojo.HBox",
		            	   children:[
		            	          {
		            	        	  scriptClass: 'mstrmojo.Label',
		            	        	  text: "Enter a name:"
		            	          },{
		            	        	  scriptClass: 'mstrmojo.TextBox',
		            	        	  id:"SaveAsDialogTextBox",	
		            	        	  value:"New Template",
		            	        	  size:40,
		            	        	  
		            	        	  postBuildRendering:function(){
		            	        	  	this.inputNode.focus();		            	        	  	
		            	          	  },
		            	          	  
		            	        	  onfocus:function(){
		            	        	  	mstrmojo.all.TemplateAlreadyExistsLabel.set("visible",false);
		            	        		mstrmojo.all.TemplateNameInvalidLabel.set("visible",false);
		            	          	  },
		            	          	  
		            	          	  onEnter:function(){
		            	          		this.parent.parent.saveAction();
		            	          	  }
		            	          }
		            	   ]            	   
		               },
		               {
		            	   scriptClass:"mstrmojo.HBox",
		            	   cssText:"margin-left:242px;",
		            	   children:[
		            	        {
		            	        	scriptClass:"mstrmojo.HTMLButton",
		            	        	cssClass:"mstrmojo-add-button",		            	        	
		            	        	text:mstrmojo.desc(2400,"Save"),
		            	        	
		            	        	onclick:function(){
		            	        		this.parent.parent.saveAction();		            	        		
		            	        	}
		            	        },
		            	        {
		            	        	scriptClass:"mstrmojo.HTMLButton",
		            	        	cssClass:"mstrmojo-add-button",
		            	        	text:mstrmojo.desc(2399,"Cancel"),
		            	        	
		            	        	onclick:function(){
		            	        		mstrmojo.all.SaveAsDialog.destroy();
		            	        	}
		            	        	
		            	        }
		            	   ]
		               },{
		            	   scriptClass:"mstrmojo.Label",
		            	   id:"TemplateAlreadyExistsLabel",
		            	   cssText:"color:red",
		            	   text: mstrmojo.desc(8842,"Template with this name exists. Please re-enter a different name."),
		            	   visible:false
		               },{
		            	   scriptClass:"mstrmojo.Label",
		            	   id:"TemplateNameInvalidLabel",
			               cssText:"color:red",
			               text:mstrmojo.desc(8843,"A template name cannot include any of the following characters:") + '<br> \\ / : * ? " < > | [ ] ^ ~ . ; = , % &',
			               visible:false			               
		               }
		            ]
		        }).render();
				}	
		},{
			scriptClass : "mstrmojo.Button",			
			cssClass : "mstrmojo-add-button",
			text : "Save and Apply to All Servers",
			visible:false,
			
			onclick:function(){
				//call the save action
				var callback = {
	  	                 success: function (res) {
	   	    				mstrmojo.all.IPAOverlayBox.set('visible', false);
	   	    				//go to apply templates page
	   	    				mstrmojo.all.IPAConfigContainer.set('selected',mstrmojo.all.ApplyTemplates);
	   	    				mstrmojo.all.WebServerConfig.configModel.set("navTableSelectionIndex", 4);
	  	 				  },
	  	 				  failure: function (res) {
	  	                   if (res) {
	  	                	   mstrmojo.all.IPAOverlayBox.set('visible', false);
	  	                       mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
	  	                   }
	  	               }
	  	 		};			
				var newTemplate = {name:mstrmojo.all.TemplateNamePullDown.selectedItem.name,type:mstrmojo.all.TemplateTypePullDown.selectedItem.value,method:"save"};
				//if its create new popup the save as Dialog
				if(mstrmojo.all.TemplateNamePullDown.selectedIndex == mstrmojo.all.TemplateNamePullDown.items.length-1)
				{
					// Show the dialog.
			        mstrmojo.insert({
			            scriptClass: 'mstrmojo.Dialog',
			            title: "Cloud Operations Manager",
			            id:'SaveAsDialogForSaveAndApply',
			            width: '375px',		            
			            
			            children: [
			               {
			            	   scriptClass:"mstrmojo.HBox",
			            	   children:[
			            	          {
			            	        	  scriptClass: 'mstrmojo.Label',
			            	        	  text: "Enter a name:"
			            	          },{
			            	        	  scriptClass: 'mstrmojo.TextBox',
			            	        	  id:"SaveAsDialogTextBoxForSaveAndApply",
			            	        	  size:40
			            	          }
			            	   ]	   
			               },
			               {
			            	   scriptClass:"mstrmojo.HBox",
			            	   cssText:"margin-left:242px;",
			            	   children:[
			            	        {
			            	        	scriptClass:"mstrmojo.HTMLButton",
			            	        	cssClass:"mstrmojo-add-button",		            	        	
			            	        	text:mstrmojo.desc(2400,"Save"),
			            	        	
			            	        	onclick:function(){		            	        		     	        	
			            	        		var newTemplate = {name:mstrmojo.all.SaveAsDialogTextBoxForSaveAndApply.value,type:mstrmojo.all.TemplateTypePullDown.selectedItem.type};		            	        		
			            	        		mstrmojo.all.SaveAsDialogForSaveAndApply.destroy();
			            	        		//call the save and apply action       
			            	        		templatesController.saveAndApplyTemplate(newTemplate,callback);
			            	        	}
			            	        },
			            	        {
			            	        	scriptClass:"mstrmojo.HTMLButton",
			            	        	cssClass:"mstrmojo-add-button",
			            	        	text:mstrmojo.desc(2399,"Cancel"),
			            	        	
			            	        	onclick:function(){
			            	        		mstrmojo.all.SaveAsDialogForSaveAndApply.destroy();
			            	        	}
			            	        	
			            	        }
			            	   ]
			               }
			            ]
			        }).render();
				}
				else{
					templatesController.saveAndApplyTemplate(newTemplate,callback);
				}
			}
		}]//end of save,saveas hBox
		}]
	});

})();
