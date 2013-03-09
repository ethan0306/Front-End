(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css", "mstrmojo.ListMapperTable", "mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", "mstrmojo.DataGrid", "mstrmojo.IPA.EnvironmentBox", "mstrmojo.IPA.EnvironmentDetailBox");
	mstrmojo.requiresDescs(8894,8895,8897,8896);
	
	function layoutThumbNailView(w, envs) {

		//add the 3 ColumnLayout layout
		w.addChildren({
			scriptClass : "mstrmojo.Box",
			cssText : "position:relative;height:100%;width:100%;overflow:hidden",
			alias : "threeColumnLayout",
			children : [{
				scriptClass : "mstrmojo.Box",
				cssText : "position:relative;height:100%;width:33%;float:left",
			}, {
				scriptClass : "mstrmojo.Box",
				cssText : "position:relative;height:100%;width:33%;float:left",
			}, {
				scriptClass : "mstrmojo.Box",
				cssText : "position:relative;height:100%;width:33%;float:left",
			}]

		});

		var envBoxes = [];
		envBoxes[0] = [];
		envBoxes[1] = [];
		envBoxes[2] = [];

		//add the envBoxes
		var envCounter = 0;
		for(var i = 0; i < envs.length; i++) {

			if(envs[i].enable == "false")
				continue;

			//skip if it is not connected
			if(envs[i].isLogin == "false") {
				w.showUnConnectedServers = true
				continue;
			}

			//push the IPAEnvironments Box
			envBoxes[envCounter % 3].push(mstrmojo.insert({
				scriptClass : "mstrmojo.IPA.EnvironmentBox",
				environmentObject : envs[i]
			}));
			envCounter++;

		}

		//now move to column1, 2 or 3 in the layout
		w.children[0].children[0].set('children', envBoxes[0]);
		w.children[0].children[1].set('children', envBoxes[1]);
		w.children[0].children[2].set('children', envBoxes[2]);

		mstrmojo.all.countercontroller.flushAddCounters();
		mstrmojo.all.countercontroller.processNewValues();

	}

	function layoutGridView() {

	}

	function addUnConnectedServersView(w, envs) {		
		w.addChildren({
			scriptClass : "mstrmojo.CollapsiblePanel",
			title : mstrmojo.desc(8895,"Unconnected Environments"),
			cssClass : "mstrmojo-webserver-titlebar",
			successImg : "../images/1ptrans.gif", //blank image,
			cssText : "margin: 10px 0 0 0",

			children : [{
				scriptClass : "mstrmojo.Box",
				cssText : "background:white;min-height:50px;",
				children : []
			}]
		});

		for(var i = 0; i < envs.length; i++) {

			if(envs[i].isLogin == "false") {
				w.children[1].children[0].addChildren({
					scriptClass : "mstrmojo.HBox",
					cssText : "margin-left:40px;margin-top:5px;",
					children : [{
						scriptClass : "mstrmojo.Label",
						cssText : "font:  8pt Tahoma, Arial, Verdana;padding:10px;max-width:150px;min-width:150px;overflow:hidden;",
						text : envs[i].name
					}, {
						scriptClass : "mstrmojo.Button",
						cssClass : "IPA-popupButton ",
						text : "Connect",
						cssText : "width:65px;text-align:left",
						envname : envs[i].name,
						envid : envs[i].id,
						vlogin : "",
						login : function()
						{	
							mstrmojo.all.loginPopUpWaitIcon.set('visible',true);
							var uid = mstrmojo.all.loginPopup.children[0].uid.value;
							if (uid == ""){
								mstrmojo.all.loginPopUpWaitIcon.set('visible',false);
								mstrmojo.all.loginPopup.set('errormessage', mstrmojo.desc(8896,"Invalid User name"));
							}
							else{
								mstrmojo.xhr.request('POST', mstrConfig.taskURL, 
								{
									success : function(res) 
									{										
										mstrmojo.all.loginPopUpWaitIcon.set('visible',false);
										mstrmojo.all.loginPopup.close();
										environmentController.getEnvironmentList(null, function() {
											mstrmojo.all.environmentlist.set("items", mstrmojo.all.environmentModel.model.environments);
											mstrmojo.all.countercontroller.flushAddCounters();
											mstrmojo.all.countercontroller.processNewValues();
											});
										window.location.reload();
									},
									failure : function(res) 
									{
										mstrmojo.all.loginPopUpWaitIcon.set('visible',false);
										mstrmojo.all.loginPopup.set('errormessage', res.getResponseHeader('X-MSTR-TaskFailureMsg'));
									}
								},
								{
									taskId : 'IPALoginTask',
									uid : mstrmojo.all.loginPopup.children[0].uid.value,
									pwd : mstrmojo.all.loginPopup.children[0].password.value,
									envid : envid
								});
							}
						},
						onclick : function() {						
							mstrmojo.all.loginPopup.set('title', "Environment: ");
							mstrmojo.all.loginPopup.set('servername', this.envname);
							envid = this.envid;
							vlogin = this.login;
							mstrmojo.all.loginPopup.children[0].loginButton.onclick = function() {								
								vlogin();
							}
							mstrmojo.all.loginPopup.children[0].uid.onEnter = function() {								
								vlogin();
							}
							mstrmojo.all.loginPopup.children[0].password.onEnter = function() {								
								vlogin();
							}
							mstrmojo.all.loginPopup.open();
						}
					}]

				});

			}

		}
	}


	mstrmojo.IPA.EnvironmentList = mstrmojo.declare(mstrmojo.Box, null, {
		//cssClass : "mstrmojo-EnvironmentList",
		cssText:"min-width:960px;width:82em;",
		items : [],
		slot : "Environments",
		alias : "panel",
		title : mstrmojo.desc(8897,"Environments"),
		displayType : "THUMBNAIL",
		hideTitlePanel : function() {
			mstrmojo.css.toggleClass(this.domNode, ['mstrmojo-EnvironmentList'], false);
			this.envTitleBar.set('visible', false);

		},
		showTitlePanel : function() {
			mstrmojo.css.toggleClass(this.domNode, ['mstrmojo-EnvironmentList'], true);

			this.envTitleBar.set('visible', true);

		},
		displayContent : function(animate) {			
			this.envPanelContent.render();

			if(animate) {
				new mstrmojo.fx.FadeIn({
					duration : 1000,
					interval : 1000 / 30,
					target : this.envPanelContent.domNode
				}).play();

			}
		},
		showDetailedViewForEnvironment : function(id) {
			this.hideTitlePanel();			
			var env;
			for(var i = 0; i < this.items.length; i++) {
				if(id == this.items[i].id) {
					env = this.items[i];
					break;
				}
			}
			if(!env || env.enable == "false")
				return;

			mstrmojo.all.countercontroller.removeCounters();

			this.envPanelContent.destroyChildren();

			this.envPanelContent.addChildren({
				scriptClass : "mstrmojo.IPA.EnvironmentDetailBox",
				environmentObject : env
			});
			mstrmojo.all.countercontroller.flushAddCounters();
			mstrmojo.all.countercontroller.processNewValues();

			this.displayContent(true);

		},
		onitemsChange : function() {
		},
		showListView : function() {			
			this.showTitlePanel();
			mstrmojo.all.countercontroller.removeCounters();
			this.envPanelContent.destroyChildren();

			this.envPanelContent.showUnConnectedServers = false;

			if(this.displayType == "THUMBNAIL") {
				layoutThumbNailView(this.envPanelContent, this.items);
			}
			if(this.displayType == "GRID") {
				layoutGridlView();
			}

			//now display the unconnected envs
			if(this.envPanelContent.showUnConnectedServers) {
				addUnConnectedServersView(this.envPanelContent, this.items);
			}

			//render the view
			this.displayContent(true);

		},
		//change the display
		ondisplayTypeChange : function() {		
			this.showListView();

		},
		children : [{
			scriptClass : "mstrmojo.Box",
			cssClass : "mstrmojo-webserver-titlebar",
			cssText : "position:relative",
			alias : "envTitleBar",
			children : [{
				scriptClass : "mstrmojo.Label",
				cssText : "font: bold 10pt Tahoma, Arial, Verdana;",
				bindings : {
					text : "this.parent.parent.title"
				}
			}, {
				scriptClass : "mstrmojo.Button",
				cssText : "position: absolute;right: 3px;top: 2px;width: 26px;height:19px;border-radius:4px;border:1px solid #AAA",
				text : mstrmojo.desc(8894,"Expand View"),
				bindings : {
					text : function() {						
						if(mstrmojo.all.alertModel.expandAlertView){													
							return "▲";
						}
						else{							
							return "▼";
						}
					}
				},
				onclick : function() {					
					mstrmojo.all.alertModel.set("expandAlertView", !mstrmojo.all.alertModel.expandAlertView);
				}
			}]
		}, {
			// this is the main container for the Environment Content.Its children will
			//be dynamic based on the view selected (list or thumbnail)
			scriptClass : "mstrmojo.Box",
			id:"expandButtonBox",			
			alias : "envPanelContent",
			cssText:"max-height:100%;overflow-y:auto;overflow-x:hidden;",
			children : [],
			
//			markupMethods: {
//		  		onvisibleChange: function() { 
//					if(mstrmojo.all.alertModel.expandAlertView)
//						this.domNode.style.cssText= "max-height:100%;overflow-y:auto;overflow-x:hidden;";
//					else
//						this.domNode.style.cssText= "max-height:100%;overflow-y:auto;overflow-x:hidden;";
//		    	}
//		  	},
//		  	
//			bindings:{				
//				cssText:function(){					
//					if(!mstrmojo.all.alertModel.expandAlertView){						
//						this.domNode.style.cssText = "max-height:100%;overflow-y:auto;overflow-x:hidden;";
//						//return "max-height:100%;overflow-y:auto;overflow-x:hidden;";
//					}
//					else {		
//						debugger;
//						this.domNode.style.cssText = "max-height:100%;overflow-y:auto;overflow-x:hidden;";
//						//return "max-height:310px;overflow-y:auto;overflow-x:hidden;";
//					}
//				}
//			}
		}]

	});
})();
