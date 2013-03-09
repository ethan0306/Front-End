(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css");
	
	mstrmojo.requiresDescs(8678,8665,8736,8698);

	function getEnvironmentNameFromServerId(id, e) {
		for(var i = 0; i < e.length; i++) {
			var s = e[i].iServers;
			for(var j = 0; j < s.length; j++) {
				if(id == s[j].id) {
					return e[i];
				}
			}
		}
	}

	function getIServerNameFromId(id, e) {

		for(var i = 0; i < e.length; i++) {
			var s = e[i].iServers;
			for(var j = 0; j < s.length; j++) {
				if(id == s[j].id) {
					return s[j];
				}
			}
		}
	}

	function getNumberOfAlerts(svr, alerts) {
		var alNum = 0;
		for(var j = 0; j < alerts.length; j++) {
			machine = alerts[j].m;
				if(svr.name == machine)
					alNum++;
		}
		return alNum;
	}

	function pickMonitors(w, m) {

		var monitortable = [];
		var monitorchart = [];

		switch(m) {	
			case "jm":
				document.title = "Job Monitor";
				mstrmojo.requiresCls("mstrmojo.IPA.projectJobTable", "mstrmojo.IPA.IPAMonitorsChart");
				monitortable = mstrmojo.insert({
					scriptClass : "mstrmojo.IPA.projectJobTable",
					id : "projectJobTable"
				});
				monitorchart = mstrmojo.insert({
					scriptClass : "mstrmojo.IPA.IPAMonitorsChart",
					id : "jobmonitorchart"
				});
				break;
			case "cm":
				document.title = "Cache Monitor";
				mstrmojo.requiresCls("mstrmojo.IPA.projectCacheTable", "mstrmojo.IPA.IPACacheChart");
				monitortable = mstrmojo.insert({
					scriptClass : "mstrmojo.IPA.projectCacheTable",
					id : "projectCacheTable"
				});
				monitorchart = mstrmojo.insert({
					scriptClass : "mstrmojo.IPA.IPACacheChart",
					id : "cachemonitorschart"
				});

				break;
			case "um":
				document.title = "User Monitor";
				mstrmojo.requiresCls("mstrmojo.IPA.IPAUserMonitorsChart", "mstrmojo.IPA.IPAUserConnectionTable");
				monitorchart = mstrmojo.insert({
					scriptClass : "mstrmojo.IPA.IPAUserMonitorsChart",
					id : "usermonitorschart"
				});
				monitortable = mstrmojo.insert({
					scriptClass : "mstrmojo.IPA.IPAUserConnectionTable",
					id : "IPAUserConnectionTable"
				});
				break;
			case "dm":
				document.title = "Database Monitor";
				mstrmojo.requiresCls("mstrmojo.IPA.IPADBConnectionTable");
				monitortable = mstrmojo.insert({
					scriptClass : "mstrmojo.IPA.IPADBConnectionTable",
					id : "IPADBConnectionTable"
				});
				monitorchart = null;
				break;
			default:
				monitortable = null;
				break;
		}
		w.addChildren(monitorchart);
		w.addChildren(monitortable);

	}

	mstrmojo.IPA.MonitorsView = mstrmojo.declare(mstrmojo.Box,null,{
		cssClass : "mstrmojo-enviroment-panel",
		cssText : "padding-bottom:20px;width:960px;",
		slot : "Monitors",
		title : "",
		serverid : "",
		server : "",

		displayContent : function(animate) {

			this.monitorsPanel.render();

			if(animate) {
				new mstrmojo.fx.FadeIn({
				duration : 1000,
				interval : 1000 / 30,
				target : this.monitorsPanel.domNode
				}).play();

			}
		},
		cleanUp : function() {
			mstrmojo.all.countercontroller.removeCounters();
			this.monitorsPanel.destroyChildren();
			this.set("visible", false);

		},
		showMonitor : function(id, m) {

			this.serverid = id;
			var e = getEnvironmentNameFromServerId(id, mstrmojo.all.environmentModel.model.environments);
			if (e.enable == "false") return;
			var s = getIServerNameFromId(id, mstrmojo.all.environmentModel.model.environments);
			
			var navButtons = this.navigationButtons.children[0];
			for(var i = 0; i < navButtons.children.length; i++) {
						navButtons.children[i].set('selected', false);
			}
				navButtons[m].set('selected', true);

			mstrmojo.all.countercontroller.removeCounters();
			this.monitorsPanel.destroyChildren();

			mstrmojo.all.CloudOMMainNavigationLinks.resetToHome();
			//find server name from server id in model:

			//construct the link
			pickMonitors(this.monitorsPanel, m);			
			this.set('title', s.name);
			this.set('server', s);
			mstrmojo.all.CloudOMMainNavigationLinks.addLink(e.name, "#?id=" + e.id, true);
			mstrmojo.all.CloudOMMainNavigationLinks.addLink(s.name, "#?id=" + e.id, true);
			mstrmojo.all.CloudOMMainNavigationLinks.addLink(document.title, window.location.hash);

			mstrmojo.all.countercontroller.flushAddCounters();
			mstrmojo.all.countercontroller.processNewValues();

			this.displayContent(true);

		},
		children : [{
			scriptClass : "mstrmojo.Box",
			cssText : "padding:6px;position:relative",
			alias : "navigationButtons",
			children : [{
				scriptClass : "mstrmojo.HBox",
				cssText : "position:relative;margin-left:3px;margin-top:2px;margin-bottom:4px",
				children : [
				//back button

				//environment name
				{
					scriptClass : "mstrmojo.Label",
					cssText : "font: bold 10pt Tahoma, Arial, Verdana;max-width:200px;padding-right:9px",
					text : "",
					bindings : {
						text : "this.parent.parent.parent.title"
					}
				},
				//alerts label
				{
					scriptClass : "mstrmojo.Label",
					cssClass : "mstrmojo-Alerts-badge",
					text : "",
					bindings : {
						text : function() {
							if (!mstrmojo.all.alertModel) return 0;
							var alNum  = getNumberOfAlerts(this.parent.parent.parent.server, mstrmojo.all.alertModel.alerts);
							if(alNum == 0) {
								this.set("cssText", "background:green");
								return '&#x2713'; //tick mark								
							}else {
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
				}, {
					scriptClass : "mstrmojo.Button",
					alias : "jm",
					cssClass : "IPA-popupButton ",
					text : mstrmojo.desc(8698,"Job Monitor"),
					cssText : "height:20px;width:75px;text-align:left;margin-left:10px;margin-bottom:4px",
					onclick : function() {
						window.location.hash = "#?server=" + this.parent.parent.parent.serverid + "&monitor=jm";

					}
				}, {
					scriptClass : "mstrmojo.Button",
					cssClass : "IPA-popupButton ",
					text : mstrmojo.desc(8736,"User Monitor"),
					alias : "um",
					cssText : "height:20px;width:80px;text-align:left;margin-left:10px;margin-bottom:4px",
					onclick : function() {
						window.location.hash = "#?server=" + this.parent.parent.parent.serverid + "&monitor=um";

					}
				}, {
					scriptClass : "mstrmojo.Button",
					cssClass : "IPA-popupButton ",
					text : mstrmojo.desc(8665,"Cache Monitor"),
					alias : "cm",
					cssText : "height:20px;width:80px;text-align:left;margin-left:10px;margin-bottom:4px",
					onclick : function() {
						window.location.hash = "#?server=" + this.parent.parent.parent.serverid + "&monitor=cm";

					}
				}, {
					scriptClass : "mstrmojo.Button",
					cssClass : "IPA-popupButton ",
					text : mstrmojo.desc(8678,"Database Monitor"),
					alias : "dm",
					cssText : "height:20px;width:100px;text-align:left;margin-left:10px;margin-bottom:4px",
					onclick : function() {
						window.location.hash = "#?server=" + this.parent.parent.parent.serverid + "&monitor=dm";

					}
				}]
			},{
						scriptClass : "mstrmojo.Button",
						cssText : "position: absolute;right: 2px;top: 3px;width: 26px;height:19px;background:#FFF;border-radius:4px;border:1px solid #BBB",						
						text : "Expand View",
						bindings: {
							text: function(){
								if (mstrmojo.all.alertModel.expandAlertView == true)
								return "▲";else return "▼"; 
							}
							
						},
						onclick : function() {
							mstrmojo.all.alertModel.set("expandAlertView", !mstrmojo.all.alertModel.expandAlertView);

						}
				}],

		}, {
			scriptClass : "mstrmojo.Box",
			alias : "monitorsPanel",
			children : []
		}]

	});
})();
