(function() {

	mstrmojo.requiresCls("mstrmojo.Box", "mstrmojo.HBox", "mstrmojo.Table", "mstrmojo.Button", "mstrmojo.Label", "mstrmojo.css", "mstrmojo.fx",
			"mstrmojo.IPA.MouseOverButton");
			
	mstrmojo.requiresDescs(8888,8887,8886,8885,8375,8884,2350);

	function getNumberOfAlerts(env, alerts) {
		var alNum = 0;
		for(var j = 0; j < alerts.length; j++) {
			machine = alerts[j].m;
			for(var s in env.iServers) {
				if(env.iServers[s].name == machine)
					alNum++;
			}
			for(var s in env.webServers) {
				if(env.webServers[s].name == machine)
					alNum++;
			}
			for(var s in env.mobileServers) {
				if(env.mobileServers[s].name == machine)
					alNum++;
			}
		}
		return alNum;
	}

	//this is the Environment Box Widget for IPA

	mstrmojo.IPA.EnvironmentBox = mstrmojo.declare(
	// superclass
	mstrmojo.Box, null, {
		name : "UnNamed Environment",
		environmentObject : {},
		children : [{
			scriptClass : "mstrmojo.HBox",
			cssClass : "mstrmojo-enviroment-panel",
			cssText:"box-shadow:inset 1px 0px 1px 1px #AAA,1px 2px 1px 1px #AAA;",
			children : [{
				scriptClass : "mstrmojo.Box",
				cssText : "height: 136px;width:270px;padding: 3px 3px 3px 7px;",
				children : [{
					//title for Environment, add label and alerts
					scriptClass : "mstrmojo.HBox",
					cssText : "position:relative;margin-left:3px;margin-top:2px;margin-bottom:4px",
					children : [
					//environment name
					{
						scriptClass : "mstrmojo.EditableLabel",
						cssText : "font: bold 9pt Tahoma, Arial, Verdana;max-width:180px;padding-right:9px;overflow:hidden;",
						text : "",						
						bindings : {							
							text : function(){
								if(this.parent.parent.parent.parent.environmentObject.name.length > 20){
									var name = this.parent.parent.parent.parent.environmentObject.name.substring(0,20) + '...';
									return name;
								}
								else {
									return this.parent.parent.parent.parent.environmentObject.name;
								}
							}
						},
						
						postApplyProperties: function(){						
							this.set("title", this.parent.parent.parent.parent.environmentObject.name);
						},
						
						onclick:function(){
					        this.set('editable',false);
					    }
					},
					//alerts label
					{
						scriptClass : "mstrmojo.Label",
						cssClass : "mstrmojo-Alerts-badge",
						text : "",
						bindings : {
							text : function() {
								alNum = mstrmojo.all.alertModel.getNumberOfAlertsForEnv(this.parent.parent.parent.parent.environmentObject);
								if(alNum == 0){
									this.set("cssText","background:green");
									return "&#x2713;";  //tick mark
								}else{
									if(this.text == "") {
										return alNum
									}
									//fade it in
									if(this.text != alNum) {
										new mstrmojo.fx.FadeIn({
											duration : 600,
											interval : 600 / 10,
											target : this.domNode,
										}).play();
									}
									
									return alNum
								}
							}
						}
					}]
				},
				//now the counters to show for each environment. display in a VBox
				{
					scriptClass : "mstrmojo.Box",
					cssText : "height:110px;width:250px;padding: 0 0 0 4px;overflow-y:auto;overflow-x:hidden;",
					children : [{
						scriptClass : "mstrmojo.Table",
						rows : 6,
						cols : 2,
						cssText : "height:100%;max-width:215px;text-align:right",
						controller:mstrmojo.all.countercontroller,

						children : [{
							slot : "0,0",
							scriptClass : "mstrmojo.Label",
							cssText : "padding-right:10px",
							text : mstrmojo.desc(2350,"Intelligence Servers")

						}, {
							slot : "0,1",
							scriptClass : "mstrmojo.Label",
							text : "0",
							cssText : "font-weight: bold;text-align:left;",
							bindings : {
								text : "this.parent.parent.parent.parent.parent.environmentObject.iServers.length"
							}

						}, {
							slot : "1,0",
							scriptClass : "mstrmojo.Label",
							text : mstrmojo.desc(8884,"Web Servers"),
							cssText : "padding-right:10px",

						}, {
							slot : "1,1",
							scriptClass : "mstrmojo.Label",
							text : "0",
							cssText : "font-weight: bold;text-align:left;",
							bindings : {
								text : "this.parent.parent.parent.parent.parent.environmentObject.webServers.length"
							}

						},{
							slot : "2,0",
							scriptClass : "mstrmojo.Label",
							text :  mstrmojo.desc(8375,"Mobile Servers"),
							cssText : "padding-right:10px",

						}, {
							slot : "2,1",
							scriptClass : "mstrmojo.Label",
							text : "0",
							cssText : "font-weight: bold;text-align:left;",
							bindings : {
								text : "this.parent.parent.parent.parent.parent.environmentObject.mobileServers.length"
							}

						}, {
							slot : "3,0",
							scriptClass : "mstrmojo.Label",
							cssText : "padding-right:10px",
							text :  mstrmojo.desc(8885,"Connected Users"),
						}, {
							slot : "3,1",
							scriptClass : "mstrmojo.IPA.IPACounterAggLabel",
							showTrendIndicators : true,
							text : "0",				
							controller:	mstrmojo.all.countercontroller,		
							category : "MicroStrategy Server Users",
							instance : "CastorServer",
							counter : "Open Sessions",
							cssText : "font-weight: bold;text-align:left;",
							postApplyProperties : function() {								
								this.set('controller',mstrmojo.all.countercontroller);								
								var env = this.parent.parent.parent.parent.parent.environmentObject;
								var isvrs = env.iServers;
								var newArr = [];
								for(var i = 0; i < isvrs.length; i++) {
									newArr.push(isvrs[i].id);
								}
								this.serverArr = newArr;
								this.set("text", this.headerText);
							}
						}, {
							slot : "4,0",
							scriptClass : "mstrmojo.Label",
							cssText : "padding-right:10px",
							text :  mstrmojo.desc(8886,"Executing Jobs")

						}, {
							slot : "4,1",
							scriptClass : "mstrmojo.IPA.IPACounterAggLabel",
							showTrendIndicators : true,
							text : "0",
							category : "MicroStrategy Server Jobs",
							instance : "CastorServer",
							counter : "Executing Reports",							
							cssText : "font-weight: bold;text-align:left;",
							postApplyProperties : function() {			
								this.set('controller',mstrmojo.all.countercontroller);						
								var env = this.parent.parent.parent.parent.parent.environmentObject;
								var isvrs = env.iServers;
								var newArr = [];
								for(var i = 0; i < isvrs.length; i++) {
									newArr.push(isvrs[i].id);
								}
								this.serverArr = newArr;
								this.set("text", this.headerText);
							}
						}, {
							slot : "5,0",
							scriptClass : "mstrmojo.Label",
							cssText : "padding-right:10px",
							text :  mstrmojo.desc(8887,"Throughput")

						}, {
							slot : "5,1",
							scriptClass : "mstrmojo.IPA.IPACounterAggDivLabel",
							category : "MicroStrategy Server Jobs",
							showTrendIndicators : true,
							instance : "CastorServer",
							topCounter : "Total Completed Reports",
							bottomCounter : "Total Report Requests",
							cssText : "font-weight: bold;text-align:left;",
							postApplyProperties : function() {
								this.set('controller',mstrmojo.all.countercontroller);
								var env = this.parent.parent.parent.parent.parent.environmentObject;
								var isvrs = env.iServers;
								var newArr = [];
								for(var i = 0; i < isvrs.length; i++) {
									newArr.push(isvrs[i].id);
								}
								this.serverArr = newArr;
								this.set("text", this.headerText);
							}
						}]
					}]
				}]
			},
			//button for detail view
			{
				scriptClass : "mstrmojo.Box",
				cssText : "height:140px;width:22px;background:lightblue;border-radius: 0 4px 4px 0;position:relative",
				
				children : [{
					scriptClass : "mstrmojo.IPA.MouseOverButton",
					cssText : "font: bold 10pt;position:absolute;bottom:45%;font-size: 12pt",
					text : "►",
					title: mstrmojo.desc(8888,"Click to go to details view"),
					onclick : function() {
						//this is where we expand the view and show the detailed view of the server.
						//we want to hide the other environments. and expand this one to fit the with of the environment content panel
						//show expanded view for this environment
						mstrmojo.all.CloudOMMainNavigationLinks.resetToHome();
						window.location.hash = "#?id="+this.parent.parent.parent.environmentObject.id;
					},
					
					onmouseover:function(){						
						this.parent.parent.domNode.style.background = 'lightblue';
						this.parent.domNode.style.background = 'white';
					},
					
					onmouseout:function(){					
						this.parent.parent.domNode.style.background= 'white';
						this.parent.domNode.style.background = 'lightblue';
					}
				}]
			}]
		}]

	});

})();
