/*
 * @author:akarandikar
 */

(function() {

	mstrmojo.requiresCls("mstrmojo.Label", "mstrmojo.css","mstrmojo.IPA.EnvironmentTreeBrowser",
			"mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", 
    		"mstrmojo.DataGrid","mstrmojo.IPA.TrustRelationshipPopup","mstrmojo.IPA.DeleteTrustRelationshipPopup");
	
	mstrmojo.requiresDescs(8907,8903,8904,8902,8905,8906,8907,8908,8909,8910,8911,5082,189,8733,913,5191,
			7904,779,2031,8912,8913,16,8883,5777);
	
	//this is the apply templates widget for IPA

	mstrmojo.IPA.ApplyTemplates = mstrmojo.declare(
	// superclass
	mstrmojo.Box,
	null,{
		scriptClass : "mstrmojo.IPA.ApplyTemplates",
		configModel: null,
		cssText: "position:relative;",	
		
		
		children: [
		 {
			 scriptClass : "mstrmojo.Label",
			 text : mstrmojo.desc(8903,"Apply Templates to MicroStrategy Servers"),
			 cssClass: "mstrmojo-rightcolumn-label"
		 },
		 {
				scriptClass : "mstrmojo.Label",
				cssClass: "mstrmojo-informative-label",
				text : mstrmojo.desc(8904,"Here you can apply different configuration templates to apply to MicroStrategy Web Servers, MicroStrategy Mobile Servers and Individual Intelligence Servers associated with these web or mobile servers.")
		 },
		 {
			 scriptClass:"mstrmojo.HBox",
			 cssText: "margin:15px;border-top:ridge;border-width:1px;border-color:grey;",
		 	
			 children:[
			    {
			    	scriptClass:"mstrmojo.VBox",			    	
			    	children:[
//			    	   {
//			    		   scriptClass:"mstrmojo.Label",
//			    		   text:'Environments',
//			    		   cssText : "padding-top:10px;font-weight: bolder;color:black"
//			    	   },			    	   
			    	   {
					    	scriptClass:"mstrmojo.IPA.EnvironmentTreeBrowser",
					    	id:"EnvironmentTreeBrowser",
					    	cssText:"margin-top:15px;width:200px;height:450px;overflow:auto;" + 
					    	"border:0px;border-top: 1px solid #CCC;background-color: #ffffff;" + 
					    	"-webkit-box-shadow: inset 1px 1px 1px 1px #ffffff;" + 
					    	"-moz-box-shadow: inset 1px 1px 1px 1px #ffffff;"	,
					    	multiSelect: false,
					        noCheckBox: true,
					        selectionAcrossBranch: false,
					        listSelector: mstrmojo.TreeNodeSelector,
					        itemDisplayField:"name",
					        itemIdField:"id",					        
					        selectedGridItems:[],	
					        branchClickPolicy:'toggle',					        
					        blockCount:1,
					        expand:true,
					        w:[],
					       
					         /*
					         * overwrite handlenodechange() method of TreeBrowser to do custom processing 
					         */
					    	handlenodechange:function handlenodechange (evt){
								mstrmojo.all.ApplyTemplateButton.set("visible",true);
					    		mstrmojo.all.NoServersLabel.set('visible',false);
					    		
					    		//evt generated from tree browser selection change have name as 'change'
					    		//the one that fakes this event comes from applytemplates onclick callback
					    		if(evt.name === 'change' || evt.name === 'fakeChange'){
					    			if(evt.src.selectedItem == null && this.selectionParentNode.selectedItem!=null){
					    				evt.src.selectedItem = this.selectionParentNode.selectedItem;
					    				 this.selectionParentNode.set('selected',false);
					    			}
					    			
					    			// fill the grids
					    			if(evt.src.selectedItem != null){
					    			var envArr = mstrmojo.all.environmentModel.model.environments;
					    			for(var i=0; i < envArr.length;i ++){
					    				if(envArr[i].id === evt.src.selectedItem.envID){
					    					mstrmojo.all.IPAAllWebServersGrid.set('items',envArr[i].webServers);
			    							mstrmojo.all.IPAAllMobileServersGrid.set('items',envArr[i].mobileServers);
			    							
			    							var items = [];
			    							var webServers = envArr[i].webServers;
			    							for(var j = 0; j < webServers.length; j++){
			    								items.push(webServers[j]);
			    							}
			    							
			    							var mobileServers = envArr[i].mobileServers;
			    							for(j = 0; j < mobileServers.length; j++){
			    								items.push(mobileServers[j]);
			    							}
			    							mstrmojo.all.IPAAllServersGrid.set('items',items);
			    							break;
					    				}
					    			}
					    			}
					    		}
					    		
					    		//this should ideally never happen
					    		if(this.selectionParentNode.selectedIndex == -1){					    			
					    			this.selectionParentNode.set('items',this.selectionParentNode.w);
					    			mstrmojo.all.ApplyTemplateButton.set("visible",false);
					    			mstrmojo.all.serverTierLabel.set('visible',false);
					    			mstrmojo.all.serverDetails.set('visible',false);
					    			mstrmojo.all.serverTemplateLabel.set('visible',false);
					    			mstrmojo.all.serverTierLabel.set('visible',false);
					    			//mstrmojo.all.ApplyTemplatesPullDown.set('items',mstrmojo.all.TemplateNamePullDown.items);
					    			mstrmojo.all.browseTreeLabel.set('visible',true);
					    			mstrmojo.all.TemplateLabelPullDownHBox.set('visible',false);
					    			//mstrmojo.all.IPAAllServersGrid.set('visible',true);
					    			//this.set('selectedGridItems',mstrmojo.all.IPAAllServersGrid.items);
				    				mstrmojo.all.IPAAllWebServersGrid.set('visible',false);			    				
				    				mstrmojo.all.IPAAllMobileServersGrid.set('visible',false);	
				    				mstrmojo.all.IndividualServersVBox.set('visible',false);
					    		}
					    		else {	
					    			if(evt.src.selectedItem != null){
					    				mstrmojo.all.serverTierLabel.set("text",evt.src.selectedItem.name);
					    				mstrmojo.all.serverTierLabel.set('visible',true);
					    				mstrmojo.all.serverDetails.set('visible',false);
					    				mstrmojo.all.serverTemplateLabel.set('visible',true);						    			
						    			mstrmojo.all.ApplyTemplatesPullDown.set('visible',true);
					    				mstrmojo.all.browseTreeLabel.set('visible',false);
					    				mstrmojo.all.TemplateLabelPullDownHBox.set('visible',true);
					    				mstrmojo.all.ApplyTemplateButton.domNode.style.cssText='margin-top:15px;margin-left:440px;display:block;';
					    				if(evt.src.selectedItem.type === "AllWeb" || evt.src.selectedItem.type ==='WebServers'){			    				
					    					mstrmojo.all.serverTemplateLabel.set("text",mstrmojo.desc(8912,"Select a Web or Universal Server Configuration Template to apply") + " ");
					    					mstrmojo.all.IPAAllServersGrid.set('visible',false);
					    					mstrmojo.all.IPAAllWebServersGrid.set('visible',true);
					    					this.set('selectedGridItems',mstrmojo.all.IPAAllWebServersGrid.items);
					    					mstrmojo.all.ApplyTemplatesPullDown.set('items',mstrmojo.all.TemplateNamePullDown.items);					    					
					    					this.setDropDownTemplateItems(evt.src.selectedItem.type,null);
					    					mstrmojo.all.IPAAllMobileServersGrid.set('visible',false);
					    					mstrmojo.all.IndividualServersVBox.set('visible',false);
					    				}
					    				else if(evt.src.selectedItem.type === "AllMobile" || evt.src.selectedItem.type ==='MobileServers'){			    				
					    					mstrmojo.all.serverTemplateLabel.set("text",mstrmojo.desc(8913,"Select a Mobile or Universal Server Configuration Template to apply") + " ");
					    					mstrmojo.all.serverTierLabel.set('visible',true);
					    					mstrmojo.all.ApplyTemplatesPullDown.set('items',mstrmojo.all.TemplateNamePullDown.items);
					    					this.setDropDownTemplateItems(evt.src.selectedItem.type,null);
					    					mstrmojo.all.IPAAllServersGrid.set('visible',false);
					    					mstrmojo.all.IPAAllWebServersGrid.set('visible',false);			    				
					    					mstrmojo.all.IPAAllMobileServersGrid.set('visible',true);
					    					this.set('selectedGridItems',mstrmojo.all.IPAAllMobileServersGrid.items);
					    					mstrmojo.all.IndividualServersVBox.set('visible',false);
					    				}else if(evt.src.selectedItem.type === "Web" || evt.src.selectedItem.type === "Mobile"){
					    					var currTemplate;
					    					mstrmojo.all.serverDetails.set('visible',true);
					    					if(evt.src.selectedItem.type === "Web"){
					    						mstrmojo.all.serverTemplateLabel.set("text",mstrmojo.desc(8912,"Select a Web or Universal Server Configuration Template to apply") + " ");
					    						for(i =0; i < mstrmojo.all.environmentModel.model.webServers.length;i++){
					    							if(evt.src.selectedItem.id === mstrmojo.all.environmentModel.model.webServers[i].id){
					    								currTemplate = mstrmojo.all.environmentModel.model.webServers[i].tn;
					    								break;
					    							}
					    						}
					    					}else {
					    						mstrmojo.all.serverTemplateLabel.set("text",mstrmojo.desc(8913,"Select a Mobile or Universal Server Configuration Template to apply") + " ");
					    						for(i =0; i < mstrmojo.all.environmentModel.model.mobileServers.length;i++){
					    							if(evt.src.selectedItem.id === mstrmojo.all.environmentModel.model.mobileServers[i].id){
					    								currTemplate = mstrmojo.all.environmentModel.model.mobileServers[i].tn;
					    								break;
					    							}
					    						}
					    					}					    					
					    					mstrmojo.all.IPAAllServersGrid.set('visible',false);
					    					mstrmojo.all.IPAAllWebServersGrid.set('visible',false);			    				
					    					mstrmojo.all.IPAAllMobileServersGrid.set('visible',false);					    					
					    					this.buildItems(evt.src.selectedItem);					    					
					    					this.setDropDownTemplateItems(evt.src.selectedItem.type,currTemplate);
					    					mstrmojo.all.IndividualServersVBox.set('visible',true);
					    					this.set('selectedGridItems',mstrmojo.all.IPAIndividualServersConnectedGrid.items);
					    				}else{
					    					mstrmojo.all.serverTierLabel.set("text",evt.src.selectedItem.name);
					    					mstrmojo.all.serverTemplateLabel.set("text",mstrmojo.desc(8907,"Select a Universal Server Configuration Template to apply "));
					    					mstrmojo.all.serverTierLabel.set('visible',true);
					    					mstrmojo.all.ApplyTemplateButton.domNode.style.cssText='margin-top:15px;margin-left:410px;display:block;';
					    					mstrmojo.all.ApplyTemplatesPullDown.set('items',mstrmojo.all.TemplateNamePullDown.items);
					    					this.setDropDownTemplateItems(evt.src.selectedItem.type,null);
					    					mstrmojo.all.IPAAllServersGrid.set('visible',true);
					    					this.set('selectedGridItems',mstrmojo.all.IPAAllServersGrid.items);
					    					mstrmojo.all.IPAAllWebServersGrid.set('visible',false);			    				
					    					mstrmojo.all.IPAAllMobileServersGrid.set('visible',false);
					    					mstrmojo.all.IndividualServersVBox.set('visible',false);
					    					mstrmojo.all.serverDetails.set('visible',false);
					    				}
					    			}
					    		}			    		
					    	},
						 	
					    	 /* 
					    	 * gets all the iservers connected to this web/mobile server
					    	 * selectedItem: server selected in the tree
					    	 */
					    	buildItems:function(selectedItem){
					    		var connectedItems = [];			  
					    		var envID = mstrmojo.all.EnvironmentTreeBrowser.selectionParentNode.data.envID;
					    		var rowItem = {};
					    		
					    		for(var i = 0; i < mstrmojo.all.environmentModel.model.environments.length;i++){
					    			if(envID === mstrmojo.all.environmentModel.model.environments[i].id){
					    			 for(var k=0; k < mstrmojo.all.environmentModel.model.environments[i].iServers.length;k++){
					    				rowItem = {};
					    				rowItem.envName = mstrmojo.all.environmentModel.model.environments[i].name;
					    				rowItem.iServerName = mstrmojo.all.environmentModel.model.environments[i].iServers[k].name;
					    				rowItem.tn = mstrmojo.all.environmentModel.model.environments[i].iServers[k].tn;
					    				rowItem.id = mstrmojo.all.environmentModel.model.environments[i].iServers[k].id;
					    				rowItem.connected = mstrmojo.all.environmentModel.model.environments[i].iServers[k].connected;
					    				rowItem.type = mstrmojo.all.environmentModel.model.environments[i].iServers[k].type;
					    				rowItem.port = mstrmojo.all.environmentModel.model.environments[i].iServers[k].port;
					    				connectedItems.push(rowItem);					    				
					    			 }
					    			 break;
					    		   }					    		  
					    		}
					    					    		
					    		if(connectedItems.length > 0){			    			
					    			this.setDropDownForIServerTemplateItems('IServer');
					    			mstrmojo.all.IPAIndividualServersConnectedGrid.set('items',connectedItems);					    			
					    			
					    			var grid = mstrmojo.all.IPAIndividualServersConnectedGrid;
					    			//to set current template names for each iserver
					    			for(var i = 0; i < grid.items.length;i++){					    				
					    				this.setCurrentTemplateName(grid.items[i].tn,grid.ctxtBuilder.itemWidgets[i].children[2].items,grid.ctxtBuilder.itemWidgets[i].children[2]);				    	
					    			}
					    			mstrmojo.all.IPAIndividualServersConnectedGrid.set('visible',true);
					    			mstrmojo.all.ApplyTemplateButton.domNode.style.cssText='margin-top:15px;margin-left:440px;display:block;';
					    			mstrmojo.all.NoIserverConnectedLabel.set('visible',false);					    			
					    		}else{
					    			mstrmojo.all.IPAIndividualServersConnectedGrid.set('visible',false);
					    			mstrmojo.all.NoIserverConnectedLabel.set('visible',true);			    		
					    		}
					    	},
					    	
					    	 /*
					    	 * sets the items in IServer's template drop down
					    	 * Also sets the template name to current template when individual web/mobile servers are selected
					    	 * type: type of server, here it's always 'IServer'   
					    	 */
					    	 setDropDownForIServerTemplateItems:function(type){					    		
					    		mstrmojo.all.IPAIndividualServersConnectedGrid.itemsForSelectBox = [];
					    		for(var i=0; i<mstrmojo.all.TemplateNamePullDown.items.length;i++){
					    			if(mstrmojo.all.TemplateNamePullDown.items[i].type === 'Intelligence Server' || 
					    					mstrmojo.all.TemplateNamePullDown.items[i].type === 'Universal' ||
				    						mstrmojo.all.TemplateNamePullDown.items[i].type === 'UNIVERSAL'){
					    					mstrmojo.all.IPAIndividualServersConnectedGrid.itemsForSelectBox.push(mstrmojo.all.TemplateNamePullDown.items[i]);
					    				}
					    		}					    		
					    	},
					    	
					    	/*
					    	 * sets the selectbox to current template
					    	 */
					    	setCurrentTemplateName:function(templateName,items,pullDown){
					    		for(var i = 0; i < items.length; i++){					    	
					    			if(templateName == items[i].name){
					    				pullDown.set('selectedIndex',i);
					    				pullDown.set('selectedItem',pullDown.items[i]);
					    				pullDown.set('value',pullDown.items[i].name);
					    				break;
					    			}else if(templateName == 'sys_defaults'){
					    				var itemLength = pullDown.items.length;
					    				pullDown.set('selectedIndex',itemLength-2);
					    				pullDown.set('selectedItem',pullDown.items[itemLength-1]);
					    				pullDown.set('value',pullDown.items[itemLength-1].name);
					    				break;
					    			}
					    		}
					    	},
					    	
					    	 /*
					    	 * sets the items in template drop down to according to the tree element selected
					    	 * Also sets the template name to current template when individual web/mobile servers are selected
					    	 * type: type of tree element that is selected
					    	 * templateName: current template that's applied to the individual web/mobile server
					    	 *               null in case of All Server, All Web Servers and All Mobile Servers    
					    	 */
					    	setDropDownTemplateItems:function(type,templateName){
					    		var list = [];					    		
					    		for(var i=0; i<mstrmojo.all.TemplateNamePullDown.items.length;i++){
					    			if(type === 'AllWeb'|| type === 'Web'){
					    				if(mstrmojo.all.TemplateNamePullDown.items[i].type === 'Web Server'||
					    						mstrmojo.all.TemplateNamePullDown.items[i].type === 'Universal' ||
					    						mstrmojo.all.TemplateNamePullDown.items[i].type === 'UNIVERSAL'){
					    					list.push(mstrmojo.all.TemplateNamePullDown.items[i]);
		    					
					    				}
					    			}
					    			if(type === 'AllMobile'|| type === 'Mobile'){
					    				if(mstrmojo.all.TemplateNamePullDown.items[i].type === 'Mobile Server'||
					    						mstrmojo.all.TemplateNamePullDown.items[i].type === 'Universal' ||
					    						mstrmojo.all.TemplateNamePullDown.items[i].type === 'UNIVERSAL'){
					    					list.push(mstrmojo.all.TemplateNamePullDown.items[i]);
					    				}
					    			}
					    			if(type === 'AllServers'){
					    				if(mstrmojo.all.TemplateNamePullDown.items[i].type === 'Universal' ||
					    						mstrmojo.all.TemplateNamePullDown.items[i].type === 'UNIVERSAL'){
					    					list.push(mstrmojo.all.TemplateNamePullDown.items[i]);
					    				}
					    			}					    			
					    		}
					    		
					    		 //list.push({name:"Create New..."});
					    		mstrmojo.all.ApplyTemplatesPullDown.set('items',list);
					    		if(templateName!=null){
					    			this.setCurrentTemplateName(templateName,mstrmojo.all.ApplyTemplatesPullDown.items,mstrmojo.all.ApplyTemplatesPullDown);					    			
					    		}					    			
					    	}
					    }
			    	]
			    },			    
			    {
			    	scriptClass:"mstrmojo.Box",
			    	id:"vbox1",
			    	cssText: "margin:15px;height:450px;margin-top:10px",			    	  
		    		markupMethods: {
		  				onvisibleChange: function() { 
		    		   			this.domNode.style.display = 'block';
		    		   	}
		  			},
		  			
			    	children:[
			    	   {
			    		   scriptClass:"mstrmojo.Label",
			    		   text:mstrmojo.desc(5082,"Results:"),
			    		   id:"Results",
			    		   cssText:"font-weight: bold;margin-bottom:10px;margin-top:0px",			    		   
			    		   visible:false
			    	   },
			    	   {			    		  
			    		   scriptClass:"mstrmojo.Label",			    		   
			    		   id:"ApplyTemplatesResultLabel",			    		   
			    		   cssText:"color:grey;border:ridge;border-color:grey;border-width:1px;overflow:auto;height:100px;width:450px;font-size:8pt;font-weight:bold;;margin-bottom:10px;",			    		   
			    		   visible:false			    		
			    	   },			    	   
			    	  {
			    		  scriptClass:"mstrmojo.Label",
			    		  id:"browseTreeLabel",
			    		  text:mstrmojo.desc(8905,"Browse the environment tree to view or apply templates."),
			    		  cssText : "font-weight: bold;"			    		 
			    	  },
			    	  {
			    		  scriptClass:"mstrmojo.Label",
			    		  id:"NoServersLabel",
			    		  text:mstrmojo.desc(8906,"The selected environment has no web or mobile servers."),
			    		  cssText : "font-size:10pt;font-weight:bold;color:red;margin-top:20px;"			    		 
			    	  },
			    	  {
			    		  scriptClass:"mstrmojo.HBox",
			    		  children:[{
			    			  scriptClass:"mstrmojo.Label",
			    			  id:"serverTierLabel",
			    			  text:"All Servers",
			    			  cssText : "font-weight: bold;font-size:9pt;",
			    			  visible:false
			    		  	},{
			    		  		scriptClass:"mstrmojo.Button",
			    		  		id:"serverDetails",
			    		  		text:mstrmojo.desc(189,"Details"),
			    		  		cssText:"padding-bottom:10px;font-size:.8em;color:blue",
			    		  		visible:false,
			    		  		
			    		  		onvisibleChange:function(){
			    		  			if(this.visible == false){
			    		  				this.parent.detailsPopUp.close();
			    		  			}
			    		  		},
			    		  		
			    		  		onclick: function(evt) {
	                              this.parent.detailsPopUp.open();
	                          	} 
			    		  	},{
			    		  		//popup to show server details
			    		  		scriptClass:"mstrmojo.Popup",
			    		  		alias:"detailsPopUp",
			    		  		cssText:"margin-bottom:10px;",
			    		  		width:0,
			    		  		
			    		  		//get server info on open
			    		  		onOpen:function(){
			    		  			if(mstrmojo.all.EnvironmentTreeBrowser.selectionParentNode.selectedIndex != -1){			    		  				
			    		  				var node = mstrmojo.all.EnvironmentTreeBrowser.selectionParentNode.selectedItem;			    		  					
			    		  				var text = "<b> " + mstrmojo.desc(8883,"Virtual Directory") + ": </b>" + node.app + ",";
			    		  						    		  				
			    		  				text += "<b> " + mstrmojo.desc(16,"Port") + ": </b>" + node.port;		    		  				
			    		  				this.children[0].set('text',text);
			    		  				
			    		  				var cssText = "top:17%;left:45%;min-height:20px;margin-left: 2px;background-color: #F5F5F2;display: block;" +
					    		  		"border: 1px solid #AAA;-moz-border-radius: 6px;-webkit-border-radius: 6px;border-radius: 6px;"
			    		  				
			    		  				//determine pop-up width dynamically
			    		  				var widthInPixels = this.children[0].domNode.clientWidth + 30;
			    		  				if(this.width == 0){
			    		  					this.width = widthInPixels;
			    		  				}
			    		  				else if(widthInPixels > this.width){
			    		  					widthInPixels = this.width;
			    		  				}
			    		  				
			    		  				this.domNode.style.cssText = cssText + "width:" + widthInPixels + "px;";			    		  				
			    		  				this.children[1].domNode.style.cssText = this.children[1].domNode.style.cssText + "left:" + (widthInPixels-11) + "px;";			    		  				
			    		  			}
			    		  		},
			    		  		
			    		  		children:[{
			    		  				scriptClass:"mstrmojo.Label",
			    		  				cssText:"font-size:8pt;margin-top:3px;margin-left:5px;",
			    		  				text:""			    		  				
			    		  			},{
			    		  				scriptClass:"mstrmojo.Button",			    		  				
			    		  				cssText: "height: 8px;width: 8px;top: 6px;position: absolute;background-image:url(../javascript/mojo/css/images/IPA/Remove.png);",
			    		  				
			    		  				onclick:function(){
			    		  					this.parent.close();
			    		  				}
			    		  			}]
			    		  	}]
			    	  },			    	  
			    	  {
			    		  	scriptClass:"mstrmojo.HBox",
			    		  	visible:false,
			    		  	id:"TemplateLabelPullDownHBox",
			    		  	cssText:'margin-top:35px;margin-bottom:10px',
			    		  	children:[
			    		  	   {
			    		  		   scriptClass : "mstrmojo.Label",
			    		  		   id:"serverTemplateLabel",
			    		  		   text : mstrmojo.desc(8907,"Select a Universal Server Configuration Template to apply")
			    		  	   },		    	  
			    		  	   {
			    		  		   scriptClass : 'mstrmojo.SelectBox',
			    		  		   id:"ApplyTemplatesPullDown",
			    		  		   itemDisplayField : "name",
			    		  		   itemIdField : 'name',
			    		  		   size:1,
			    		  		   cssText : 'width:150px;margin-left:10px',
			    		  		   items : [{
			    						name : "select a template ..."
			    					}
			    		  		   ],
			    		  		   
			    		  	   }]
			    	  },
			    	  {
			    		  scriptClass:"mstrmojo.VBox",
			    		  children:[
			    		        {
			    		        	scriptClass: "mstrmojo.DataGrid",
			    		        	cssClass: "mstrmojo-DataGrid-ApplyTemplatesDataGrid",
			    		        	id: "IPAAllServersGrid",
			    		        	waiting: false,
			    		        	makeObservable: true,
			    		        	resizableColumns: false,
			    		        	visible:false,
			    		        	
			    		        	columns:[{
			    		        		colWidth:50,
			    		        		headerWidget: {
			    		        			scriptClass: 'mstrmojo.Label',
			    		        			cssText:"margin-left:5px;text-align:left;",
			    		        			text: mstrmojo.desc(5191,"Server")	
					                	},
					                	dataWidget: {
					                		scriptClass:"mstrmojo.Label",	
					                		cssText:"margin-left:5px;overflow:hidden;text-align:left;",
					                		postApplyProperties: function(){
			                                    this.set("text", this.parent.data.name);
					                		}					                		
					                	}					                	
			    		        	},{
			    		        		colWidth:20,
			    		        		headerWidget: {
			    		        			scriptClass: 'mstrmojo.Label',
			    		        			cssText:"margin-left:5px;text-align:left;",
			    		        			text: mstrmojo.desc(8733,"Type")
				                	  },
				                	  	dataWidget: {
				                		  scriptClass:"mstrmojo.Label",
				                		  cssText:"margin-left:5px;overflow:hidden;text-align:left;",
					                		postApplyProperties: function(){
			                                    this.set("text", this.parent.data.type);
					                		}	
				                	  }
			    		        	},{
			    		        		colWidth:100,
			    		        		headerWidget: {
			    		        			scriptClass: 'mstrmojo.Label',
			    		        			cssText:"margin-left:5px;text-align:left;",
			    		        			text: mstrmojo.desc(8908,"Current Template")
				                	  	},
				                		dataWidget: {
				                	  		scriptClass:"mstrmojo.EditableLabel",
				                	  		cssText:"margin-left:5px;overflow:hidden;text-align:left;",
					                		postApplyProperties: function(){
				                	  			var name = this.parent.data.tn;
				                	  			if(name == 'sys_defaults'){
				                	  				name = '[Defaults]';
				                	  			}
				                	  			if(name.length > 45){
				                	  				name = this.parent.data.tn.substring(0, 45) + '...';
				                	  			}
				                	  			this.set("text", name);
				                	  			this.set("title", this.parent.data.tn);
					                		},	
				                	  		onclick:function(){
					                			this.set('editable',false);
					                		}
				                	  	}				                		
				                	}]
			    		        },
			    		        {
			    		        	scriptClass: "mstrmojo.DataGrid",
			    		        	cssClass: "mstrmojo-DataGrid-ApplyTemplatesDataGrid",
			    		        	id: "IPAAllWebServersGrid",
			    		        	cssText:"width:485px;",
			    		        	waiting: false,
			    		        	makeObservable: true,
			    		        	resizableColumns: false,
			    		        	visible:false,
			    		        	
			    		        	columns:[{
			    		        		colWidth:50,
			    		        		headerWidget: {
			    		        			scriptClass: 'mstrmojo.Label',
			    		        			cssText:"margin-left:5px;text-align:left;",
			    		        			text: mstrmojo.desc(913,"Web Server")	
					                	},
					                	dataWidget: {
					                		scriptClass:"mstrmojo.Label",
					                		cssText:"margin-left:5px;overflow:hidden;text-align:left;",
					                		postApplyProperties: function(){
			                                    this.set("text", this.parent.data.name);
					                		}					                		
					                	}					                	
			    		        	},{
			    		        		colWidth:100,
			    		        		headerWidget: {
			    		        			scriptClass: 'mstrmojo.Label',
			    		        			cssText:"text-align:left;margin-left:8px;",
			    		        			text: mstrmojo.desc(8908,"Current Template")
				                	  	},
				                		dataWidget: {
				                	  		scriptClass:"mstrmojo.EditableLabel",
				                	  		cssText:"margin-left:8px;overflow:hidden;text-align:left;",
					                		postApplyProperties: function(){
				                	  			var name = this.parent.data.tn;
				                	  			if(name == 'sys_defaults'){
				                	  				name = '[Defaults]';
				                	  			}
				                	  			if(name.length > 45){
				                	  				name = this.parent.data.tn.substring(0, 45) + '...';
				                	  			}
			                	  				this.set("text", name);
			                                    this.set("title", this.parent.data.tn);
					                		},	
				                	  		onclick:function(){
					                			this.set('editable',false);
					                		}	
				                	  	}				                		
				                	}]
			    		        },
			    		        {
			    		        	scriptClass: "mstrmojo.DataGrid",
			    		        	cssClass: "mstrmojo-DataGrid-ApplyTemplatesDataGrid",
			    		        	id: "IPAAllMobileServersGrid",
			    		        	cssText:"width:490px;",
			    		        	waiting: false,
			    		        	makeObservable: true,
			    		        	resizableColumns: false,
			    		        	visible:false,			    		        	
			    		        	
			    		        	columns:[{
			    		        		colWidth:50,
			    		        		headerWidget: {
			    		        			scriptClass: 'mstrmojo.Label',
			    		        			cssText:"margin-left:5px;text-align:left;",
			    		        			text: mstrmojo.desc(7904,"Mobile Server")	
					                	},
					                	dataWidget: {
					                		scriptClass:"mstrmojo.Label",	
					                		cssText:"margin-left:5px;overflow:hidden;text-align:left;",
					                		postApplyProperties: function(){
			                                    this.set("text", this.parent.data.name);
					                		}					                		
					                	}					                	
			    		        	},{
			    		        		colWidth:100,
			    		        		headerWidget: {
			    		        			scriptClass: 'mstrmojo.Label',
			    		        			cssText:"text-align:left;margin-left:8px;",
			    		        			text: mstrmojo.desc(8908,"Current Template")
				                	  	},
				                	  	dataWidget: {
				                	  		scriptClass:"mstrmojo.EditableLabel",
				                	  		cssText:"margin-left:8px;overflow:hidden;text-align:left;",
					                		postApplyProperties: function(){
				                	  			var name = this.parent.data.tn;
				                	  			if(name == 'sys_defaults'){
				                	  				name = '[Defaults]';
				                	  			}
				                	  			if(name.length > 45){
				                	  				name = this.parent.data.tn.substring(0, 45) + '...';
				                	  			}
			                	  				this.set("text", name);
			                                    this.set("title", this.parent.data.tn);
					                		},	
				                	  		onclick:function(){
					                			this.set('editable',false);
					                		}	
				                	  	}				                		
				                	}]
			    		        },
			    		        {	
			    		        	scriptClass:"mstrmojo.VBox",
			    		        	id:"IndividualServersVBox",
			    		        	visible:false,
			    		        	children:[
									{
			    		        		scriptClass:"mstrmojo.Label",
			    		        		text:mstrmojo.desc(779,"No Intelligence Servers are currently connected."),
			    		        		id:"NoIserverConnectedLabel",
			    		        		cssText:"font-size:8pt;color:red;font-weight:bold;margin-left:25px;margin-top:5px",
			    		        		visible:false
			    		        	},
			    		        	
			    		        	//connected grid
			    		        	{
			    		        		scriptClass: "mstrmojo.DataGrid",
			    		        		cssClass: "mstrmojo-DataGrid-ApplyTemplatesDataGrid",
			    		        		cssText:"width:485px;",
			    		        		id: "IPAIndividualServersConnectedGrid",
			    		        		waiting: false,
			    		        		makeObservable: true,
			    		        		resizableColumns: false,
			    		        		itemsForSelectBox:[],
			    		        	
			    		        		columns:[			    		        		
			    		        		{
			    		        			colWidth:80,
			    		        			headerWidget: {
			    		        				scriptClass: 'mstrmojo.Label',
			    		        				cssText:"margin-left:10px;text-align:left;",
			    		        				text: mstrmojo.desc(5777,"Intelligence Server")
				                	  		},
				                	  		dataWidget: {
				                	  			scriptClass:"mstrmojo.Label",
				                	  			cssText:"margin-left:10px;overflow:hidden;text-align:left;",
				                	  			postApplyProperties: function(){
				                	  				this.set("text", this.parent.data.iServerName);
				                	  			}	
				                	  		}				                		
			    		        		},{
			    		        			colWidth:60,
			    		        			headerWidget: {
			    		        				scriptClass: 'mstrmojo.Label',
			    		        				cssText:"margin-left:10px;text-align:left;",
			    		        				text: mstrmojo.desc(8908,"Current Template")
				                	  		},
				                	  		dataWidget: {
				                	  			scriptClass:"mstrmojo.EditableLabel",
				                	  			cssText:"margin-left:10px;overflow:hidden;text-align:left;",
				                	  			postApplyProperties: function(){
				                	  				var name = this.parent.data.tn;
				                	  				if(name == 'sys_defaults'){
					                	  				name = '[Defaults]';
					                	  			}
				                	  				if(name.length > 22){
				                	  					name = this.parent.data.tn.substring(0, 22) + '...';
				                	  				}
			                	  					this.set("text", name);
			                	  					this.set("title", this.parent.data.tn);
				                	  			},	
				                	  			onclick:function(){
				                	  				this.set('editable',false);
				                	  			}	
				                	  		}				                		
			    		        		},{
			    		        			colWidth:100,
			    		        			headerWidget: {
			    		        				scriptClass: 'mstrmojo.Label',
			    		        				cssText:"margin-left:10px;text-align:left;",
			    		        				text: mstrmojo.desc(8909,"Select Another Template")
				                	  		},
				                	  		dataWidget: {
				                	  			scriptClass : 'mstrmojo.SelectBox',							    		  		   
							    		  		   itemDisplayField : "name",
							    		  		   itemIdField : 'name',
							    		  		   size:1,
							    		  		   cssText : 'width:150px;',

													bindings:{
				                	  					items:'mstrmojo.all.IPAIndividualServersConnectedGrid.itemsForSelectBox'	
													}
				                	  		}				                		
			    		        		},{
			    		        			colWidth:80,
			    		        			headerWidget: {
			    		        				scriptClass: 'mstrmojo.Label',
			    		        				cssText:"margin-left:10px;text-align:left;",
			    		        				text: "Trust Relationship"
				                	  		},
				                	  		dataWidget: {
				                	  			scriptClass : 'mstrmojo.Button',
				                	  			title:"Setup trust relationship",
				                	  			text:"Setup",	
												
				                	  			onclick:function(){
				                	  				//more logic to go here
				                	  				mstrmojo.all.TrustRelationshipPopup.render();
				                	  				//mstrmojo.all.DeleteTrustRelationshipPopup.render();
				                	  			}
				                	  		}
			    		        		}]
			    		        	}
			    		        ]}
			    		  ]
			    	  }, //end VBox that contains all datagrids
			    	  {
			    		  scriptClass:"mstrmojo.Button",
			    		  text:mstrmojo.desc(2031,"Apply"),
			    		  visible:false,
			    		  id:'ApplyTemplateButton',
			    		  cssClass:"mstrmojo-applyTemplate-button",
			    		  cssText:"margin-top:15px;margin-left:410px;",
			    		  
			    		  onclick:function(){
			    		 	if(mstrmojo.all.ApplyTemplatesPullDown.selectedItem == null){
			    		 		var templateSelected = mstrmojo.all.ApplyTemplatesPullDown.items[0];
			    		 	}
			    		 	else{
			    		 		templateSelected = mstrmojo.all.ApplyTemplatesPullDown.selectedItem;
			    		 	}
			    		 				    		 	    
			    		 	
			    		  	var callback = {
			   	                 success: function (res) {			    		  				
			    	    				mstrmojo.all.IPAOverlayBox.set('visible', false);
			    	    				//to update the grids fake the event object. This is further be used in handlenodechange function
			    	    				var event = {};
			    	    				event.src = {};			    	    				
			    	    				event.name = "fakeChange";
			    	    				event.src.selectedItem = mstrmojo.all.EnvironmentTreeBrowser.selectionParentNode.selectedItem;			    	    				
			    	    				mstrmojo.all.EnvironmentTreeBrowser.onnodechange(event);
			    	    				
			    	    				var responseMsg = res.responses;
			    	    				var text="";
			    	    				
			    	    				for(var i=0; i < responseMsg.length; i++){			    	    					
			    	    					text = text + responseMsg[i].serverId + ": ";
			    	    					//no http error and taskcode=200
			    	    					if(responseMsg[i].HttpURLConnError==='' && responseMsg[i].taskStatusCode==='200'){
			    	    						var contents = responseMsg[i].contents;
			    	    						for(var j=0; j < contents.length ; j++){
			    	    							text = text + contents[j].value + "<br>";
			    	    						}
			    	    						if(contents.length == 0){
			    	    							text += mstrmojo.desc(8910,"The template was applied successfully.");
			    	    						}
			    	    					}			    	    					
			    	    					else if(responseMsg[i].HttpURLConnError==='' && responseMsg[i].taskStatusCode!='200'){
			    	    						text = text + responseMsg[i].taskErrorMsg + "<br>";
			    	    					}
			    	    					//some http errors
			    	    					else {
			    	    						text = text + responseMsg[i].HttpURLConnError + "<br>";
			    	    					}
			    	    					
			    	    					//separator
			    	    					if(i != responseMsg.length-1){
			    	    						text = text + "<br>" + "--------------------------------------------" + "<br>";
			    	    					}
			    	    				}
			    	    				
			    	    				mstrmojo.all.ApplyTemplatesResultLabel.set("text",text);
			    	    				mstrmojo.all.Results.set('visible',true);
			    	    				mstrmojo.all.ApplyTemplatesResultLabel.set('visible',true);			    	    				
			   	 				  },
			   	 				  failure: function (res) {
			   	                   if (res) {			   	                	   
			   	                	   mstrmojo.all.IPAOverlayBox.set('visible', false);
			   	                       mstrmojo.alert(mstrmojo.desc(8911,"Apply templates error.")+ " " + res.getResponseHeader("X-MSTR-TaskFailureMsg"));
			   	                   }
			   	               }
			   	 			};			    		  	
			    		  	
			    		  	mstrmojo.all.templatesController.applyTemplates(templateSelected,
			    		  			mstrmojo.all.EnvironmentTreeBrowser.selectionParentNode.selectedItem,
			    		  			mstrmojo.all.EnvironmentTreeBrowser.selectedGridItems,
			    		  			mstrmojo.all.IPAIndividualServersConnectedGrid.ctxtBuilder,mstrmojo.all.serverTierLabel.text,callback);			    		  	
			    	  	  }
			    	  }
			    	]
			    }//end of VBox for 4-tier apply templates 
			 ]
		 }// end of HBOX
		]
	});
})();