(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css", "mstrmojo.ListMapperTable", "mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", "mstrmojo.TabContainer", "mstrmojo.IPA.IPACounterController", "mstrmojo.IPA.IPACounterLabel", "mstrmojo.IPA.IPAPieChart", "mstrmojo.CheckBox");
	
	mstrmojo.requiresDescs(8709,8703);

	function _getServer(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if(results == null)
			return "";
		else
			return results[1];
	}

	var servername = _getServer("server");

	//get the server configuration first to get the total available sessions.
	function _getServerConfiguration() {
		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
			success : function(res) {
				if(res == null)
					return;
				mstrmojo.all.monitoringchart.pieChartData.push(res[0].MaxClientConnections);
				mstrmojo.all.monitoringchart.Labels.push("Max Client Connections");
				mstrmojo.all.maxconnectionsLabel.set('text', res[0].MaxClientConnections);
			},
			failure : function(res) {
				//      alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
			},
			complete : function() {
				debugger;
				//FIXME: This is hack
				if(mstrmojo.all.monitoringchart.pieChartData.length == 1){
					mstrmojo.all.monitoringchart.pieChartData.push(320);
					mstrmojo.all.monitoringchart.Labels.push("Max Client Connections");
					mstrmojo.all.maxconnectionsLabel.set('text', 320);	
				}
			}
		}, {
			taskId : 'CRCommandExecutionTask',
			command : 'LIST ALL PROPERTIES FOR SERVER CONFIGURATION;',
			serverId : servername
		});
	}

	mstrmojo.IPA.IPAUserMonitorsChart = mstrmojo.declare(mstrmojo.HBox, null, {
		
		cssText:"border-top:thin solid #cdcdc1;border-bottom:thin solid #cdcdc1;width:945px;margin:5px",
		children : [
		{
			scriptClass : "mstrmojo.HBox",
			children : [
			{
				scriptClass : "mstrmojo.IPA.IPAPieChart",
				id : "monitoringchart",
				clearData : function() {
					this.pieChartData = [];
					this.Labels = [];
					this.data = [];
				},
				pieChartData : [],
				Labels : [],
				colors : ['#01c7fa', '#f7be4d'],
				data : [],
				width : 140,
				height : 120,
				server : servername,
				counters : [{
					category : "MicroStrategy Server Users",
					instance : "CastorServer",
					counter : "Open Sessions",
					controller : mstrmojo.all.countercontroller
				}],
				postCreate : function() {
					this.clearData();
					_getServerConfiguration();
				}
			},{
				scriptClass : "mstrmojo.Table",
				cssText:"border:1px solid #cdcdc1;border-radius:5px",
				cellSpacing: '3',
				cellPadding: '3',
				rows:2,
				cols:3,
				children : [
				{
					scriptClass : 'mstrmojo.Label',
					cssClass : "mstrmojo-square",
					cssText : "background-color: #0099FF",
					slot:'0,0'
				}, {
					scriptClass : 'mstrmojo.Label',
					text : mstrmojo.desc(8709,"Open Sessions"),
					cssText : "font-size: 8pt;padding: 4px;width:140px;",
					slot:'0,1'
				}, {
					scriptClass : "mstrmojo.IPA.IPACounterLabel",
					cssClass : "mstrmojo-chart-label",
					cssText : "font-size: 8pt;padding: 3px;",
					tdCssClass : 'mstrmojo-chart-td',
					category : "MicroStrategy Server Users",
					instance : "CastorServer",
					counter : "Open Sessions",
					appendSymbol : "",
					server : servername,
					controller : mstrmojo.all.countercontroller,
					slot:'0,2'
				}, {
					scriptClass : 'mstrmojo.Label',
					cssClass : "mstrmojo-square",
					cssText : "background-color: #FFB03C",
					slot:'1,0'
				}, {
					scriptClass : 'mstrmojo.Label',
					text : mstrmojo.desc(8703,"Max Client Connections"),
					cssText : "font-size: 8pt;padding: 4px;width:140px;",
					slot:'1,1'
				}, {
					scriptClass : 'mstrmojo.Label',
					id : "maxconnectionsLabel",
					cssClass : "mstrmojo-chart-label",
					text : "320",
					cssText : "font-size: 8pt;padding: 3px;",
					slot:'1,2'
				}]
			}]
		},{
			scriptClass : "mstrmojo.HBox",
			cssText:"border-left:thin solid #cdcdc1;margin:10px;",
				postCreate : function() {
					this.set("selected", mstrmojo.all.distributionbyclientbox);
				},
				children : [
				{
					scriptClass : "mstrmojo.VBox",
					id : "distributionbyclientbox",
					cssText : "height: 160px;position:relative;",
					selected : true,
					title : "Distribution By",
					children : [
					{
						scriptClass : "mstrmojo.WaitIcon",
						id : "graphwaiticon",
						visible : true,
						cssText : "position: relative; left: 50%;height:130px",
					}, {
						scriptClass : "mstrmojo.HBox",
						visible : false,
						children : [{
							scriptClass : "mstrmojo.VisPieChart",
							id : "monitoringchartbytype",
							colors : ['#2d4a5c', '#be513a', '#6b7459', '#aea288', '#443226', '#888BF4', '#BBBBBB', '#FE2F68'],
							data : [],
							width : 140,
							height : 120,
							pieChartData : [],
							Labels : [],
							postApplyProperties : function() {
								this.clearData();

							},
							clearData : function() {
								this.Labels = [];
								this.pieChartData = [];
								this.data = [];
							},
							addLabel : function(l) { 
								if(this.parent.legendbox.legend[l])
									return;
								this.parent.legendbox.set('visible', true);
								this.parent.legendbox.addLegend(this.colors[this.Labels.length % this.colors.length], l);
								this.Labels.push(l);
								this.pieChartData.push(0);
								this.parent.legendbox.legend[l].setLegendValue(0);
							},
							setValueForLabel : function(l, v) {
								this.addLabel(l);
								for(var i = 0; i < this.Labels.length; i++) {
									if(this.Labels[i] == l) {
										this.pieChartData[i] = v;
										this.parent.legendbox.legend[l].setLegendValue(v);
									}
								}
								this.drawChart();
							},
							setValues : function(c) {
								this.counts = {};
								this.counts = c;
							},
							refreshValues : function() {
								if(this.counts) {
									for(var label in this.counts) {
										this.setValueForLabel(label, this.counts[label]);
									}
								}

							},
						}, {
							scriptClass : "mstrmojo.VBox",
							cssClass : "mstrmojo-labelBox",
							alias : "legendbox",
							children : [],
							legend : {},
							visible : false,
							postApplyProperties : function() {
								this.removeLegends();
								this.addChildren({
									scriptClass:"mstrmojo.Label",
									cssText:"margin:10px;font-weight:bold;",
									text:"Client Type"
								});

							},
							removeLegends : function() {
								this.legend = {};
								this.destroyChildren();
							},
							addLegend : function(color, title) { 
								this.addChildren({
									scriptClass : "mstrmojo.HBox",
									setLegendValue : function(v) {
										this.valuelabel.set('text', v);
									},
									children : [{
										scriptClass : 'mstrmojo.Label',
										cssClass : "mstrmojo-square",
										cssText : "background-color: " + color
									}, {
										scriptClass : 'mstrmojo.Label',
										text : title,
										cssText : "font-size: 8pt;padding: 4px;width:140px;"
									}, {
										scriptClass : 'mstrmojo.Label',
										alias : "valuelabel",
										cssClass : "mstrmojo-chart-label",
										cssText : "font-size: 8pt;padding: 3px;"
									}]
								});
								this.legend[title] = this.children[this.children.length - 1];
								this.legend[title].render();
							}
						}]
					}]
			}//
			]
		}]
	});
})();
