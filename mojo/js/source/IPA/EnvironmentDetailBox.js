(function() {

	mstrmojo.requiresCls("mstrmojo.Box", "mstrmojo.HBox", "mstrmojo.Table", "mstrmojo.Button", "mstrmojo.Label", "mstrmojo.css", "mstrmojo.fx", "mstrmojo.IPA.IPAPieChart");
	mstrmojo.requiresDescs(8889,5777,8887,8890,8891,8892,16,8883,7904,913,8698,8736,8665,8678,2350,8884,8375,8894);

	//the original counter list
	var _IPACOUNTERS = {
		TOTAL_COMPLETED_REPORTS : {
			category : "MicroStrategy Server Jobs",
			instance : "CastorServer",
			counter : "Total Completed Reports"
		},
		TOTAL_REPORT_REQUESTS : {
			category : "MicroStrategy Server Jobs",
			instance : "CastorServer",
			counter : "Total Report Requests"
		},
		CPU_USAGE : {
			category : "Configuration",
			instance : "",
			counter : "Total CPU Usage"
		},
		KERNEL_CPU_USAGE : {
			category : "Configuration",
			instance : "",
			counter : "Kernel CPU Usage"
		},
		USER_CPU_USAGE : {
			category : "Configuration",
			instance : "",
			counter : "User CPU Usage"
		},
		MEMORY_USAGE : {
			category : "Configuration",
			instance : "",
			counter : "Used Memory"
		},
		MEMORY_AVAILABILITY : {
			category : "Configuration",
			instance : "",
			counter : "Available Memory"
		},
		NETWORK_IN : {
			category : "Configuration",
			instance : "",
			counter : "Network In"
		},
		NETWORK_OUT : {
			category : "Configuration",
			instance : "",
			counter : "Network Out"
		}
	};

	/* here we can add additional counters for IServer, Web and Mobile to be displayed
	 * in the additional counters view
	 * in the future this list will come from the backened perhaps through a task call
	 * getAdditionalCountersTask which will populate the json object
	 */
	var ADDITIONAL_ISERVER_COUNTERS = [];
	var ADDITIONAL_WEBSERVER_COUNTERS = [];

	//sample list for iservers counters

	ADDITIONAL_ISERVER_COUNTERS = [{
			category : "Configuration",
			instance : "",
			counter : "Logical Disk Free Space",
			label : "Logical Disk Free Space",
			symbol : " %"
		}, {
			category : "Configuration",
			instance : "",
			counter : "Logical Disk IO Per Second",
			label : "Logical Disk IO",
			symbol : " disk transfers/s"
		},{
			category : "Configuration",
			instance : "",
			counter : "Memory Pages IO Per Second",
			label : "Memory Pages IO",
			symbol : " disk transfers/s"
		}, {
			category : "Configuration",
			instance : "",
			counter : "Page File Usage",
			label : "Page File Usage",
			symbol : " %"
		},{
			category : "MicroStrategy Server Users",
			instance : "CastorServer",
			counter : "Open Sessions",
			label : "Connected Users",
			symbol : ""
			}];

	//sample list for web and mobile server counters
	ADDITIONAL_WEBSERVER_COUNTERS = [{
		category : "Configuration",
		instance : "",
		counter : "Logical Disk Free Space",
		label : "Logical Disk Free Space",
		symbol : " %"
	}, {
		category : "Configuration",
		instance : "",
		counter : "Logical Disk IO Per Second",
		label : "Logical Disk IO",
		symbol : " disk transfers/s"
	}, {
		category : "Configuration",
		instance : "",
		counter : "Memory Pages IO Per Second",
		label : "Memory Pages IO",
		symbol : " disk transfers/s"
	}, {
		category : "Configuration",
		instance : "",
		counter : "Page File Usage",
		label : "Page File Usage",
		symbol : " %"
	}];

	function getNumberOfAlerts(env, alerts) {
		var alNum = 0;
		for(var j = 0; j < alerts.length; j++) {
			var machine = alerts[j].m;
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

	function buildMonitorButtons(s, tt, m) {
		return new mstrmojo.Button({
			cssClass : "mstrmojo-monitor-button " + m,
			tooltip : tt,
			useRichTooltip : true,
			onclick : function() {
				mstrmojo.tooltip.close();
				window.location.hash = "?server=" + s + "&monitor=" + m
			}
		});
	}

	function buildCounterLabel(sname, c, symbol, width) {
		return new mstrmojo.IPA.IPACounterLabel({
			cssClass : "mstrmojo-chart-label",
			cssText : "width:" + width + "px;padding:0px",
			tdCssClass : 'mstrmojo-chart-td',
			text : "....",
			category : c.category,
			showTrendIndicators : true,
			instance : c.instance,
			counter : c.counter,
			appendSymbol : symbol,
			postApplyProperties : function() {
				this.server = sname;
			},
			controller : c.controller
		});
	}

	function buildChart(sname, c, isFixed, min, max, symbol) {
		return new mstrmojo.IPA.IPAChartLine({
			model : {
				categories : {
					items : []
				},
				vp : {},
				colHeaders : [],
				series : []
			},
			themeColor : '#ededed',
			drawXAxisLabels : false,
			drawYAxisLabels : true,
			isLinearChart : true,
			isDrawLabels : true,
			multiLine : true,
			isFixedChart : isFixed,
			isDrawAxis : true,
			minValue : min,
			maxValue : max,
			appendSymbol: symbol,
			isAnimateLines : false,
			margin : {
				t : 5,
				r : 5,
				b : 5,
				l : 5
			},
			width : 150,
			height : 70,			
			postApplyProperties : function() {
				this.server = sname;				
			},
			counters : c
		});
	}

	function buildPieChart(sname, c,symbol) {
		return new mstrmojo.IPA.IPAPieChart({
			counters : c,
			width : 70,
			height : 60,
			pieChartData : [],
			data : [],
			appendSymbol: symbol,
			postApplyProperties : function() {
				this.server = sname;
			}
		});
	}

	function generateHeader(w, servertype, col1, col2, col3,col4) {
		w.addChildren({
			scriptClass : "mstrmojo.HBox",
			cssText : "margin: 0 0 5px 5px;height:10px;text-align:center;padding-bottom:7px;" +
					"background-color:#f0f0f0;	border: 0px solid #494949;box-shadow: none;" +
					"min-width:890px;width:82em;",
			markupMethods: {
		  		onvisibleChange: function() { 
		    		this.domNode.style.display = 'block';
		    	}
		  	},
			children : [{
				scriptClass : "mstrmojo.Label",
				text : servertype,
				cssText : "width:180px;font-weight: bold;margin-left:0px;color:#6d6d6d;"
			}, {
				scriptClass : "mstrmojo.Label",
				text : col1,
				cssText : "width:180px;font-weight: bold;color:#6d6d6d;"

			}, {
				scriptClass : "mstrmojo.Label",
				text : col2,
				cssText : "width:160px;font-weight: bold;color:#6d6d6d;"
			}, {
				scriptClass : "mstrmojo.Label",
				text : col3,
				cssText : "width:160px;font-weight: bold;color:#6d6d6d;"
			},{
				scriptClass : "mstrmojo.Label",
				text : col4,
				cssText : "width:220px;font-weight: bold;color:#6d6d6d;"
			}]

		});

	}

	function addAdditionalCounters(w, c, s) {
		//add the 3 ColumnLayout layout
		w.addChildren({
			scriptClass : "mstrmojo.Box",
			cssText : "position:relative;height:100%;min-width:960px;width:82em;%;overflow:hidden",
			alias : "threeColumnLayout",
			children : [{
				scriptClass : "mstrmojo.Box",
				cssText : "position:relative;height:100%;width:33%;float:left"
			}, {
				scriptClass : "mstrmojo.Box",
				cssText : "position:relative;height:100%;width:33%;float:left"
			}, {
				scriptClass : "mstrmojo.Box",
				cssText : "position:relative;height:100%;width:33%;float:left"
			}]

		});

		var counterWidget = [];
		counterWidget[0] = [], counterWidget[1] = [], counterWidget[2] = [];
		//add the counterWidget
		for(var i = 0; i < c.length; i++) {
			counterWidget[i % 3].push(mstrmojo.insert({
				scriptClass : "mstrmojo.Box",
				cssText : "height:30px; border-radius:3px;background-color:#EAEAEA;margin:4px;width:230px;",
				children : [{
					scriptClass : "mstrmojo.HBox",
					cssText : "width:98%;",
					children : [{
						scriptClass : "mstrmojo.Label",
						cssText : "padding:3px;width:130px",
						text : c[i].label
					}, {
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssText : "text-align:right;font-weight: bold;",
						text : "....",
						category : c[i].category,
						showTrendIndicators : false,
						appendSymbol : c[i].symbol,
						instance : c[i].instance,
						counter : c[i].counter,
						postApplyProperties : function() {
							this.server = s;
						},
						controller : mstrmojo.all.countercontroller
					}]
				}]
			}));
		}
		//now move to column1, 2 or 3 in the layout
		w.children[0].children[0].set('children', counterWidget[0]);
		w.children[0].children[1].set('children', counterWidget[1]);
		w.children[0].children[2].set('children', counterWidget[2]);

		mstrmojo.all.countercontroller.flushAddCounters();
		mstrmojo.all.countercontroller.processNewValues();
	}

	function buildAdditionalCounters(w, s, type) {
		//return if there are no additional counters
		var c = [];
		if(type == "IServer")
			c = ADDITIONAL_ISERVER_COUNTERS;
		if(type == "WebServer" || type == "MobileServer")
			c = ADDITIONAL_WEBSERVER_COUNTERS;
		if(c.length == 0)
			return;

		//add the additional counters segment
		w.addChildren({
			scriptClass : "mstrmojo.Box",
			cssText : "border-radius:5px;background-color:#E1E1E1;margin:10px;margin-left:0px;padding:2px;min-width:900px;width:82em;",
			children : [{
				scriptClass : "mstrmojo.Button",
				text : "► " + mstrmojo.desc(8889,"Additional Counters"),
				isShown : false,
				cssText : "font-weight:bold;font-size:9pt;margin-bottom:4px;color:#008EAE",
				onclick : function() {
					this.set('isShown',!this.isShown);
				},
				onisShownChange : function() {
					var headerLabel =  mstrmojo.desc(8889,"Additional Counters");
					if(this.isShown) {
						this.set('text',"▼ " + headerLabel);						
						this.parent.additionalcountersbox.set('visible', true);
					} else {
						this.set('text',"► " + headerLabel);
						this.parent.additionalcountersbox.set('visible', false);
					}

				}
			}, {
				scriptClass : "mstrmojo.HBox",
				alias : "additionalcountersbox",
				visible:false,
				children : [{
					scriptClass : "mstrmojo.Box",
					cssText : "width:5px;"
				}, {
					scriptClass : "mstrmojo.Box",
					cssText : "width:790px;",
					postApplyProperties : function() {
						addAdditionalCounters(this, c, s.id);
					}
				}]
			}]
		});

	}

	function buildServerView(w, s, type) {
		//first add the table info
		if(type == "IServer") {
			generateHeader(w, mstrmojo.desc(5777,"Intelligence Server"), mstrmojo.desc(8890,"CPU Usage"), mstrmojo.desc(8891,"Memory Usage"),mstrmojo.desc(8892,"Network"),mstrmojo.desc(8887,"Throughput"));
		} else if(type == "WebServer") {
			generateHeader(w, mstrmojo.desc(913,"Web Server"), mstrmojo.desc(8890,"CPU Usage"), mstrmojo.desc(8891,"Memory Usage"), mstrmojo.desc(8892,"Network"),"");

		} else if(type == "MobileServer") {
			generateHeader(w, mstrmojo.desc(7904,"Mobile Server"), mstrmojo.desc(8890,"CPU Usage"), mstrmojo.desc(8891,"Memory Usage"), mstrmojo.desc(8892,"Network"),"");

		}

		//now iterate on the server list to add the data
		for(var i = 0; i < s.length; i++) {
			var svr = s[i];
			w.addChildren({
				scriptClass : "mstrmojo.Box",
				cssText : "border-radius:5px;background-color:#EEE;margin-bottom:5px;padding-bottom:1px;"+
					"min-width:890px;width:82em;",
				postApplyProperties : function() {
					buildAdditionalCounters(this, svr, type);
				},
				children : [{
					scriptClass : "mstrmojo.HBox",
					cssText : "margin-bottom:5px;height:90px;padding: 5px 7px 4px 7px;min-width:890px;width:82em;" +
							"background-color:#e4e4e4;box-shadow: inset 1px 1px 1px 1px #888;",
							markupMethods: {
						  		onvisibleChange: function() { 
						    		this.domNode.style.display = 'block';
						    	}
						  	},
					children : [{
						scriptClass : "mstrmojo.Box",
						cssText:"width:150px;margin-top:10px;margin-lleft:2px;margin-right:17px;",
						children : [{
							scriptClass : "mstrmojo.EditableLabel",
							text : svr.name,
							cssText : "width:180px;font-weight: bold;color:#a15709;margin-left:5px",
								postApplyProperties:function(){									
									var title = "";
									if(svr.type === 'IServer'){
										title = mstrmojo.desc(16,"Port") + ": " + svr.port;
									}else if(svr.type === 'Web'){
										title = mstrmojo.desc(8883,"Virtual Directory") + ": " + svr.app + ", " + mstrmojo.desc(16,"Port") + ": " + svr.port;
									}else if (svr.type === 'Mobile'){
										title = mstrmojo.desc(8883,"Virtual Directory") + ": " + svr.app + ", " + mstrmojo.desc(16,"Port") + ": " + svr.port;
									}
									this.set('title',title);
								},
								onclick: function(){
                            		this.set('editable', false);
                            	}

						}, {
							scriptClass : "mstrmojo.HBox",
							cssText : "width: 100px;margin-left:5px; margin-top:5px;",
							postApplyProperties : function() {
								if(type == "IServer") {
									var mb = [];
									mb.push(buildMonitorButtons(svr.id, mstrmojo.desc(8698,"Job Monitor"), 'jm'));
									mb.push(buildMonitorButtons(svr.id, mstrmojo.desc(8736,"User Monitor"), 'um'));
									mb.push(buildMonitorButtons(svr.id, mstrmojo.desc(8665,"Cache Monitor"), 'cm'));
									mb.push(buildMonitorButtons(svr.id, mstrmojo.desc(8678,"Database Monitor"), 'dm'));
									this.set('children', mb);
								}
							}
						}]
					}, {
						scriptClass : "mstrmojo.HBox",
						cssText : "width: 180px;margin-top:10px;font-size:14pt;",
						postApplyProperties : function() {
							var c = [];
							var cb = [];

							c.push(_IPACOUNTERS.CPU_USAGE);
							c.push(_IPACOUNTERS.KERNEL_CPU_USAGE);
							c.push(_IPACOUNTERS.USER_CPU_USAGE);
							c[0].controller = mstrmojo.all.countercontroller;
							c[1].controller = mstrmojo.all.countercontroller;
							c[2].controller = mstrmojo.all.countercontroller;
							cb.push(buildCounterLabel(svr.id, c[0], "%", 30));
							cb.push(buildChart(svr.id, c, true, 0, 100,"%"));							
							this.set('children', cb);
						}
					}, {
						scriptClass : "mstrmojo.HBox",
						cssText : "width: 150px;margin-top:10px;margin-left:15px;",
						postApplyProperties : function() {

							var c = [], cb = [];
							c.push(_IPACOUNTERS.MEMORY_USAGE);
							c.push(_IPACOUNTERS.MEMORY_AVAILABILITY);
							c[0].controller = mstrmojo.all.countercontroller;
							c[1].controller = mstrmojo.all.countercontroller;
							cb.push(buildCounterLabel(svr.id, c[0], "MB", 50));
							cb.push(buildPieChart(svr.id, c,"MB"));
							this.set('children', cb);
						}
					}, {
						scriptClass : "mstrmojo.HBox",
						cssText : "width: 180px;margin-left:10px;",
						postApplyProperties : function() {							
								var c = [], cb = [];
								c.push(_IPACOUNTERS.NETWORK_IN);
								c[0].controller = mstrmojo.all.countercontroller;
								c.push(_IPACOUNTERS.NETWORK_OUT);
								c[1].controller = mstrmojo.all.countercontroller;
								cb.push(buildChart(svr.id, c, false, 0, 0," bytes"));
								this.set('children', cb);
						}
					},{
						scriptClass : "mstrmojo.HBox",
						cssText : "width: 180px;margin-left:10px;",
						postApplyProperties : function() {
							if(type == "IServer") {
								var c = [], cb = [];
								c.push(_IPACOUNTERS.TOTAL_COMPLETED_REPORTS);
								c[0].controller = mstrmojo.all.countercontroller;
								c.push(_IPACOUNTERS.TOTAL_REPORT_REQUESTS);
								c[1].controller = mstrmojo.all.countercontroller;
								cb.push(buildChart(svr.id, c, false, 0, 0,""));
								this.set('children', cb);
							}
						}
					}]
				}]

			});

		}

	}

	//this is the Environment Box Widget for IPA

	mstrmojo.IPA.EnvironmentDetailBox = mstrmojo.declare(
	// superclass
	mstrmojo.Box, null, {
		//cssClass : "mstrmojo-enviromentdetail-box",
		cssText : "position:relative;min-width:945px;width:82em;",
		name : "UnNamed Environment",
		environmentObject : {},
		postCreate : function() {
			mstrmojo.all.CloudOMMainNavigationLinks.resetToHome();
			mstrmojo.all.CloudOMMainNavigationLinks.addLink(this.environmentObject.name, "#?id=" + this.environmentObject.id)
		},
		children : [{
			scriptClass : "mstrmojo.HBox",			
			cssText : "position:relative;min-width:960px;width:82em;;display:block",
			children : [{
				scriptClass : "mstrmojo.Box",
				cssText : "height: 100%;padding: 3px 3px 3px 7px;overflow-x:hidden;position:relative;min-width:960px;width:82em;display:block;",
				children : [{
					//back button,title for Environment, add label and alerts
					scriptClass : "mstrmojo.HBox",
					cssText : "position:relative;margin-left:3px;margin-top:2px;margin-bottom:4px;border-bottom: 1px solid #CCC",					
					children : [
					//back button

					//environment name
					{
						scriptClass : "mstrmojo.EditableLabel",
						cssText : "font: bold 10pt Tahoma, Arial, Verdana;max-width:180px;padding-right:9px;overflow:hidden",
						text : "",
						bindings : {
							text : function() {
								if(this.parent.parent.parent.parent.environmentObject.name.length > 20) {
									var name = this.parent.parent.parent.parent.environmentObject.name.substring(0, 20) + '...';
									return name;
								} else {
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
								if(alNum == 0) {
									this.set("cssText", "background:green");
									return '&#x2713;'; //tick mark									
								} else {
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
						cssClass : "IPA-popupButton ",
						text : mstrmojo.desc(8893,"View All Servers"),
						cssText : "height:20px;width:90px;text-align:left;margin-left:30px;margin-bottom:4px;font-size:.99em;",
						selected : true,
						onclick : function() {
							for(var i = 0; i < this.parent.children.length; i++) {
								this.parent.children[i].set('selected', false);
							}
							this.set('selected', true);
							w = this.parent.parent.children[2];
							w.IServerView.set('visible', true);
							if(this.parent.parent.parent.parent.environmentObject.webServers.length > 0)
								w.WebServerView.set('visible', true);
							if(this.parent.parent.parent.parent.environmentObject.mobileServers.length > 0)
								w.MobileServerView.set('visible', true);
						}
					}, {
						scriptClass : "mstrmojo.Button",
						cssClass : "IPA-popupButton ",
						text : mstrmojo.desc(2350,"Intelligence Servers"),
						cssText : "width:110px;height:20px;text-align:left;margin-bottom:4px;font-size:.99em;",
						onclick : function() {
							for(var i = 0; i < this.parent.children.length; i++) {
								this.parent.children[i].set('selected', false);
							}
							this.set('selected', true);
							w = this.parent.parent.children[2];
							w.IServerView.set('visible', true);
							w.WebServerView.set('visible', false);
							w.MobileServerView.set('visible', false);
						}
					}, {
						scriptClass : "mstrmojo.Button",
						cssClass : "IPA-popupButton ",
						text : mstrmojo.desc(8884,"Web Servers"),
						cssText : "height:20px;width:80px;text-align:left;margin-bottom:4px;font-size:.99em;",
						postApplyProperties : function() {
							if(this.parent.parent.parent.parent.environmentObject.webServers.length == 0) {
								this.set('visible', false);
							}
						},
						onclick : function() {
							for(var i = 0; i < this.parent.children.length; i++) {
								this.parent.children[i].set('selected', false);
							}
							this.set('selected', true);
							w = this.parent.parent.children[2];
							w.IServerView.set('visible', false);
							w.WebServerView.set('visible', true);
							w.MobileServerView.set('visible', false);
						}
					}, {
						scriptClass : "mstrmojo.Button",
						cssClass : "IPA-popupButton ",
						text : mstrmojo.desc(8375,"Mobile Servers"),
						cssText : "height:20px;width:80px;text-align:left;margin-bottom:4px;font-size:.99em;",
						postApplyProperties : function() {
							if(this.parent.parent.parent.parent.environmentObject.mobileServers.length == 0) {
								this.set('visible', false);
							}
						},
						onclick : function() {
							for(var i = 0; i < this.parent.children.length; i++) {
								this.parent.children[i].set('selected', false);
							}
							this.set('selected', true);
							w = this.parent.parent.children[2];
							w.IServerView.set('visible', false);
							w.WebServerView.set('visible', false);
							w.MobileServerView.set('visible', true);
						}
					}]

				}, {
					scriptClass : "mstrmojo.Button",
					cssText : "position: absolute;right:12px;top: 2px;width: 26px;height:19px;background:#FFF;border-radius:4px;border:1px solid #AAA",
					text : mstrmojo.desc(8894,"Expand View"),
					bindings : {
						text : function() {							
							if(mstrmojo.all.alertModel.expandAlertView == true){
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
				},
				//detailed view here
				{
					scriptClass : "mstrmojo.Box",
					cssClass:"mstrmojo-environment-box-innergrid",
					children : [
					//IServer View
					{
						scriptClass : "mstrmojo.Box",
						cssText : "padding-top:10px;border-bottom: 1px solid #CCC;min-width:890px;width:82em;",
						cssClass:'mstrmojo-environment-box-innergrid',
						alias : "IServerView",
						postApplyProperties : function() {
							var s = this.parent.parent.parent.parent.environmentObject.iServers;
							buildServerView(this, s, "IServer");
						}
					},
					//Web Server View
					{
						scriptClass : "mstrmojo.Box",
						cssText : "padding-top:16px;padding-bottom:16px;border-bottom: 1px solid #CCC;min-width:920px;width:72em;",
						alias : "WebServerView",
						postApplyProperties : function() {
							var s = this.parent.parent.parent.parent.environmentObject.webServers;
							if(s.length == 0) {
								this.set('visible', false);
								return;
							}
							buildServerView(this, s, "WebServer");
						}
					},
					//Mobile Server View
					{
						scriptClass : "mstrmojo.Box",
						cssText : "padding-top:16px;padding-bottom:16px;border-bottom: 1px solid #CCC;min-width:920px;width:72em;",
						alias : "MobileServerView",
						postApplyProperties : function() {
							var s = this.parent.parent.parent.parent.environmentObject.mobileServers;
							if(s.length == 0) {
								this.set('visible', false);
								return;
							}
							buildServerView(this, s, "MobileServer");
						}
					}]

				}]
			}]
		}]

	});

})();
