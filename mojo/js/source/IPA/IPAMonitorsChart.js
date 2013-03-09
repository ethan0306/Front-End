(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css", "mstrmojo.ListMapperTable", "mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", "mstrmojo.TabContainer", "mstrmojo.IPA.IPACounterController", "mstrmojo.IPA.IPACounterLabel", "mstrmojo.IPA.IPAChartLine", "mstrmojo.CheckBox");

	mstrmojo.requiresDescs(8719,8720,8732,8731,8686);

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

	mstrmojo.IPA.IPAMonitorsChart = mstrmojo.declare(mstrmojo.HBox, null, {
		cssText : "margin:5px;width:945px;border-top:thin solid #cdcdc1;border-bottom:thin solid #cdcdc1;",
		children : [
		{
			scriptClass: "mstrmojo.Table",
			cssText:"margin:5px;width:300px;height:180px",
			cellSpacing: '2',
			cellPadding: '2',
			rows:5,
			cols:3,
			children:[
			{
				scriptClass : 'mstrmojo.Label',
				cssClass : "mstrmojo-square",
				cssText : "background-color: #00009F",
				slot:'0,0'
			}, {
				scriptClass : 'mstrmojo.Label',
				text : mstrmojo.desc(8686,"Executing Reports "),
				cssText : "font-size: 8pt;padding: 3px;",
				slot:'0,1'
			}, {
				scriptClass : 'mstrmojo.Label',
				cssClass : "mstrmojo-square",
				cssText : "background-color: #FFB03C",
				slot:'1,0'
			}, {
				scriptClass : 'mstrmojo.Label',
				text : mstrmojo.desc(8731,"Total Completed Reports "),
				cssText : "font-size: 8pt;padding: 3px;",
				slot:'1,1'
			}, {
				scriptClass : 'mstrmojo.Label',
				cssClass : "mstrmojo-square",
				cssText : "background-color: #9F0000",
				slot:'2,0'
			}, {
				scriptClass : 'mstrmojo.Label',
				text : mstrmojo.desc(8732,"Total Report Requests "),
				cssText : "font-size: 8pt;padding: 3px;",
				slot:'2,1'
			}, {
				scriptClass : 'mstrmojo.Label',
				cssClass : "mstrmojo-square",
				cssText : "",
				slot:'3,0'
			}, {
				scriptClass : 'mstrmojo.Label',
				text : mstrmojo.desc(8720,"Reports Completion Rate "),
				cssText : "font-size: 8pt;padding: 3px;",
				slot:'3,1'
			}, {
				scriptClass : 'mstrmojo.Label',
				cssClass : "mstrmojo-square",
				cssText : "",
				slot:'4,0'
			}, {
				scriptClass : 'mstrmojo.Label',
				text : mstrmojo.desc(8719,"Report Submission Rate"),
				cssText : "font-size: 8pt;padding: 3px;",
				slot:'4,1'
			}, {
				scriptClass : "mstrmojo.IPA.IPACounterLabel",
				cssClass : "mstrmojo-chart-label",
				cssText : "font-size: 8pt;padding: 3px;",
				tdCssClass : 'mstrmojo-chart-td',
				category : "MicroStrategy Server Jobs",
				instance : "CastorServer",
				counter : "Executing Reports",
				appendSymbol : "",
				server : servername,
				controller : mstrmojo.all.countercontroller,
				slot:'0,2'
			}, {
				scriptClass : "mstrmojo.IPA.IPACounterLabel",
				cssClass : "mstrmojo-chart-label",
				tdCssClass : 'mstrmojo-chart-td',
				cssText : "font-size: 8pt;padding: 3px;",
				category : "MicroStrategy Server Jobs",
				instance : "CastorServer",
				counter : "Total Completed Reports",
				appendSymbol : "",
				server : servername,
				controller : mstrmojo.all.countercontroller,
				slot:'1,2'
			}, {
				scriptClass : "mstrmojo.IPA.IPACounterLabel",
				cssClass : "mstrmojo-chart-label",
				tdCssClass : 'mstrmojo-chart-td',
				category : "MicroStrategy Server Jobs",
				cssText : "font-size: 8pt;padding: 3px;",
				instance : "CastorServer",
				counter : "Total Report Requests",
				appendSymbol : "",
				server : servername,
				controller : mstrmojo.all.countercontroller,
				slot:'2,2'
			}, {
				scriptClass : "mstrmojo.IPA.IPACounterLabel",
				cssClass : "mstrmojo-chart-label",
				tdCssClass : 'mstrmojo-chart-td',
				category : "MicroStrategy Server Jobs",
				cssText : "font-size: 8pt;padding: 3px;",
				instance : "CastorServer",
				counter : "Reports Completion Rate/min",
				appendSymbol : " /min",
				server : servername,
				controller : mstrmojo.all.countercontroller,
				slot:'3,2'
			}, {
				scriptClass : "mstrmojo.IPA.IPACounterLabel",
				cssClass : "mstrmojo-chart-label",
				tdCssClass : 'mstrmojo-chart-td',
				category : "MicroStrategy Server Jobs",
				cssText : "font-size: 8pt;padding: 3px;",
				instance : "CastorServer",
				counter : "Report Submission Rate/min",
				appendSymbol : " /min",
				server : servername,
				controller : mstrmojo.all.countercontroller,
				slot:'4,2'
			}]
		},{
			scriptClass : "mstrmojo.IPA.IPAChartLine",
			cssText:"margin:5px",
			id : "monitoringchart",
			chartLineColors : ['#00009F', '#FFB03C', '#9F0000', '#888BF4', '#93CA20', '#FE2F68'],
			model : {
				'categories' : {
					'items' : []
				},
				'vp' : {},
				'series' : [],
				'colHeaders' : [{
					'items' : []
				}]
			},
			themeColor : '#ededed',
			isDrawLabels : true,
			isAnimateLines : false,
			isLinearChart : true,
			multiLine : true,
			lineWidth : 2,
			margin : {
				t : 10,
				r : 10,
				b : 30,
				l : 30
			},
			width : 615,
			height : 200,
			server : servername,
			counters : [{
				category : "MicroStrategy Server Jobs",
				instance : "CastorServer",
				counter : "Executing Reports",
				controller : mstrmojo.all.countercontroller
			}, {
				category : "MicroStrategy Server Jobs",
				instance : "CastorServer",
				counter : "Total Completed Reports",
				controller : mstrmojo.all.countercontroller
			}, {
				category : "MicroStrategy Server Jobs",
				instance : "CastorServer",
				counter : "Total Report Requests",
				controller : mstrmojo.all.countercontroller
			}]
		}]
	});

})();
