(function(){

    mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", 
    "mstrmojo.css", "mstrmojo.ListMapperTable", "mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", 
    "mstrmojo.ListMapperTable", "mstrmojo.IPA.IPACounterController", "mstrmojo.CollapsiblePanel", 
    "mstrmojo.DataGrid", "mstrmojo.IPA.IPACounterController", "mstrmojo.IPA.IPACounterLabel", 
    "mstrmojo.IPA.IPAChartLine","mstrmojo.IPA.IPAPieChart");	
	
	var _IPACOUNTERS = {
			TOTAL_COMPLETED_REPORTS : {
					category: "MicroStrategy Server Jobs",
					instance: "CastorServer",
					counter: "Total Completed Reports"
			}, 
			TOTAL_REPORT_REQUESTS: {
					category: "MicroStrategy Server Jobs",
					instance: "CastorServer",
					counter: "Total Report Requests"
			},
			CPU_USAGE : {
					category: "Configuration",
					instance: "",
					counter: "Total_CPU_Usage"
			},
			MEMORY_USAGE : {
					category: "Configuration",
					instance: "",
					counter: "Used_Memory"
			},
			MEMORY_AVAILABILITY : {
					category: "Configuration",
					instance: "",
					counter: "Available_Memory"
			}
		}
	
	function buildMonitorButtons(s,tt,m,img){
		return new mstrmojo.Widget({
		markupString: '<a href="{@urlLink}" class="{@cssClass}"></a>',
		cssClass: "mstrmojo-monitor-button "+m,
		tooltip: tt,
		urlLink: "mstrIPA?evt=3165&server=",
		useRichTooltip: true,
		postApplyProperties: function(){
			this.urlLink += s;
			this.urlLink += "&monitor=" + m;
		}
		});
	}
	
	function buildCounterLabel(sname,c,symbol){
		return new mstrmojo.IPA.IPACounterLabel({
			cssClass: "mstrmojo-chart-label",
			tdCssClass: 'mstrmojo-chart-td',
			category: c.category,
			showTrendIndicators: true,
			instance: c.instance,
			counter: c.counter,
			appendSymbol: symbol,
			postApplyProperties: function(){
				this.server = sname;
			},
			controller: c.controller
		});
	}
	
	function buildChart(sname,c,isFixed,min,max){
		return new mstrmojo.IPA.IPAChartLine({
			model: {
				categories: { items:[]},vp : {},
				colHeaders : [],
				series: []	
			},
			themeColor: '#ededed',
			drawXAxisLabels: false,
			drawYAxisLabels: true,
			isLinearChart: true,
			isDrawLabels: true,
			multiLine: true,
			isFixedChart: isFixed,
			isDrawAxis: true,
			minValue: min,
			maxValue: max,
			isAnimateLines: false,
			margin: {
				t: 5,
				r: 5,
				b: 5,
				l: 5
			},
			width: 170,
			height: 60,
			postApplyProperties: function(){
				this.server = sname;
			},
			counters: c
			});
	}
	
	function buildPieChart(sname,c){
		return new mstrmojo.IPA.IPAPieChart({
			counters: c,
			width: 60,
			height: 60,
			margin: "0px 0px 0px 45%",
			pieChartData: [],
			data: [],
			postApplyProperties: function(){
				this.server = sname;
			}
			});
	}
	
	
	function buildIServerColumns(cc,svr){
		var builtcolumns  = [];
		builtcolumns.push({
			headerText: "Intelligence Server",
			dataWidget: {
				scriptClass: "mstrmojo.VBox",
				children: [{
					scriptClass: "mstrmojo.HBox",
					cssText: "margin-left:auto;margin-right:auto;",
					children: [{
						scriptClass: "mstrmojo.Label"
					},{ 
						scriptClass: "mstrmojo.Label",
						cssClass: "mstrmojo-iserver-name-label",
						postApplyProperties: function(){
							this.text = svr.name;
						}
					}, 
					{
						scriptClass: "mstrmojo.Label"
					}]
				}, {
					scriptClass: "mstrmojo.HBox",
					cssText: "width: 150px;margin-left:auto;margin-right:auto;",
					postApplyProperties: function(){
						var mb = [];
						mb.push(buildMonitorButtons(svr.id,"Job Monitor",'jm'));
						mb.push(buildMonitorButtons(svr.id,"User Monitor",'um'));
						mb.push(buildMonitorButtons(svr.id,"Cache Monitor",'cm'));
						mb.push(buildMonitorButtons(svr.id,"Database Monitor",'dm'));
						this.set('children',mb);
					}
				}]
			}
		}, {
			headerText: "Throughput",
			colCss: 'mstrmojo-chart-title',
			dataWidget: {
				scriptClass: "mstrmojo.CustomizedHBox",
				postApplyProperties: function(){
					var cb = [];
					var c = [];
					//set the controller
					c.push(_IPACOUNTERS.TOTAL_COMPLETED_REPORTS);
					c[0].controller = cc;
					c.push(_IPACOUNTERS.TOTAL_REPORT_REQUESTS);
					c[1].controller = cc;
					cb.push(buildChart(svr.id,c,false,0,0));
					this.set('children',cb);
				}
			}
		}, {
			headerText: "CPU Usage",
			colCss: 'mstrmojo-chart-title',
			dataWidget: {
				scriptClass: "mstrmojo.CustomizedHBox",
				postApplyProperties: function(){
					var c = [],cb = [];
					c.push(_IPACOUNTERS.CPU_USAGE);
					c[0].controller = cc;
					cb.push(buildChart(svr.id,c,true,0,100));
					cb.push(buildCounterLabel(svr.id,c[0],"%"));
					cb.push(new mstrmojo.Label());
					this.set('children',cb);
				}
			}
		}, {
			headerText: "Memory Usage",
			colCss: 'mstrmojo-chart-title',
			dataWidget: {
				scriptClass: "mstrmojo.CustomizedHBox",
				postApplyProperties: function(){
					var c = [],cb = [];
					c.push(_IPACOUNTERS.MEMORY_USAGE);
					c.push(_IPACOUNTERS.MEMORY_AVAILABILITY);
					c[0].controller = cc;
					c[1].controller = cc;
					cb.push(buildPieChart(svr.id,c));
					cb.push(buildCounterLabel(svr.id,c[0],"MB"));
					cb.push(new mstrmojo.Label());
					this.set('children',cb);
				}
			}
		});
		
		return builtcolumns;
	}
	
	function buildWebServerColumns(cc,svr){
		var builtcolumns  = [];
		builtcolumns.push({
			headerText: "Server",
			dataWidget: {
				scriptClass: "mstrmojo.VBox",
				children: [{
					scriptClass: "mstrmojo.HBox",
					children: [{
						scriptClass: "mstrmojo.Label"
					},{ 
						scriptClass: "mstrmojo.Label",
						cssClass: "mstrmojo-iserver-name-label",
						postApplyProperties: function(){
							this.text = svr.name;
						}
					}, 
					{
						scriptClass: "mstrmojo.Label"
					}
					]
				}]
			}
		},{
			headerText: "",
			dataWidget: {
				scriptClass: "mstrmojo.VBox"
			}
		},{
			headerText: "CPU Usage",
			colCss: 'mstrmojo-chart-title',
			dataWidget: {
				scriptClass: "mstrmojo.CustomizedHBox",
				postApplyProperties: function(){
					var c = [],cb = [];
					c.push(_IPACOUNTERS.CPU_USAGE);
					c[0].controller = cc;
					cb.push(buildChart(svr.id,c,true,0,100));
					cb.push(buildCounterLabel(svr.id,c[0],"%"));
					cb.push(new mstrmojo.Label());
					this.set('children',cb);
				}
			}
		}, {
			headerText: "Memory Usage",
			colCss: 'mstrmojo-chart-title',
			dataWidget: {
				scriptClass: "mstrmojo.CustomizedHBox",
				postApplyProperties: function(){
					var c = [],cb = [];
					c.push(_IPACOUNTERS.MEMORY_USAGE);
					c.push(_IPACOUNTERS.MEMORY_AVAILABILITY);
					c[0].controller = cc;
					c[1].controller = cc;
					cb.push(buildPieChart(svr.id,c));
					cb.push(buildCounterLabel(svr.id,c[0],"MB"));
					cb.push(new mstrmojo.Label());
					this.set('children',cb);
				}
			}
		});
		
		return builtcolumns;
	}
	
	//0 - I Server
	//1 - Web
	//2 - Mobile
	function buildGrid(serv,type){
		var chld = [];
		chld.push({
		scriptClass: "mstrmojo.DataGrid",
		cssClass: "mstrmojo-iserver-table",
		renderOnScroll: false,
		makeObservable: true,
		resizable: false,
		bindings: {
			items: function(){
			return serv;
			}
		},
		onitemsChange: function(){
			//just initially to set the headers
			if (!this.columns){
			var bt;
			if (type == 0) bt = buildIServerColumns(countercontroller,this.items[0]);
			if (type == 1) bt = buildWebServerColumns(countercontroller,this.items[0]);
			if (type == 2) bt = buildWebServerColumns(countercontroller,this.items[0]);
			this.set('columns',bt);
			}
		},
		columns: null,
		itemFunction: function(item, idx, w){
		var bt;
		if (type == 0) bt = buildIServerColumns(countercontroller,item);
		if (type == 1) bt = buildWebServerColumns(countercontroller,item);
		if (type == 2) bt = buildWebServerColumns(countercontroller,item);
		w.set('columns',bt);
		var c = new mstrmojo.DataRow({
			columns: w.columns,
			data: item,
			idx: idx,
			dataGrid: w
		});
		return c;
		}
	});
	
	return chld;
	
	}
	
	 mstrmojo.IPA.EnvironmentListBuilder = {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.IPA.EnvironmentListBuilder",

            getIServersGrid: function getisvrsgrd(node) {
			return buildGrid(node,0);
            },
			getWebServersGrid: function getwebsvrsgrd(node) {
			return buildGrid(node,1);
            },
			getMobileServersGrid: function getmblsvrsgrd(node) {
			return buildGrid(node,2);
            }
		}
		

	
})();