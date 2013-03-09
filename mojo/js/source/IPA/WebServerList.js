(function(){

    mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", 
    "mstrmojo.css", "mstrmojo.ListMapperTable", "mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", 
    "mstrmojo.ListMapperTable", "mstrmojo.IPA.IPACounterController", "mstrmojo.CollapsiblePanel", 
    "mstrmojo.DataGrid", "mstrmojo.IPA.IPACounterController", "mstrmojo.IPA.IPACounterLabel", 
    "mstrmojo.IPA.IPAChartLine");
    
    mstrmojo.IPA.WebServerList = mstrmojo.insert({
        scriptClass: "mstrmojo.WidgetList",
        id: "webserverlist",
        slot: "WebServers",
        model: null,
        bindings: {
            items: 'this.model.webServersList'
        },
        itemFunction: function(svr, svr_idx, widget){
            var mystatus = false;
            if (svr_idx === 0) {
                mystatus = true;
            }
            var svrItem = new mstrmojo.CollapsiblePanel({
            
                id: "webserver" + svr_idx,
                numericAlertsCssClass: "mstrmojo-Alerts-badge",
                bindings: {
                    numberOfAlerts: function(){
                        return !svr_idx ? mstrmojo.all.alertModel.alerts.length : null;
                    }
                },
                expanded: true,
                status: mystatus,
                titleCssClass: 'mstrmojo-webserver-titlebar',
                cssClass: 'mstrmojo-webserver-panel',
                postApplyProperties: function(){
                    if (svr_idx == 1) {
                        this.title = "Environment: iPad Production"
                    }
                    else {
                        this.numberOfAlerts = 0;
                        this.title = "Environment: Amazon Cloud"
                    }
                },
                children: [{
                
                    scriptClass: "mstrmojo.WidgetList",
                    id: "environmentlist" + svr_idx,
                    bindings: {
                        items: "mstrmojo.all.webserverlist.model.webServersList[" + svr_idx + "].environmentsList"
                    },
                    itemFunction: function(svr, env_idx, widget){
                        var envItem = new mstrmojo.CollapsiblePanel({
                            id: "webserver" + svr_idx + "_environment" + env_idx,
                            numericAlertsCssClass: "mstrmojo-Alerts-badge",
                            bindings: {
                                numberOfAlerts: function(){
                                    var alnum = 0;
                                    var al = mstrmojo.all.alertModel.alerts;
                                    var elist = mstrmojo.all.webserverlist.model.webServersList[svr_idx].environmentsList;
                                    for (var i = 0; i < elist.length; i++) {
                                        for (var j = 0; j < elist[i].serversList.length; j++) {
                                            for (var k = 0; k < al.length; k++) {
                                                if (al[k].m == elist[i].serversList[j].name) {
                                                    alnum++;
                                                }
                                            }
                                            
                                        }
                                    }
                                    return alnum;
                                }
                            },
                            expanded: true,
                            status: false,
                            titleCssClass: 'mstrmojo-environment-titlebar',
                            cssClass: "mstrmojo-enviroment-panel",
                            postApplyProperties: function(){
                                this.title = "MicroStrategy Intelligence Servers"
                            },
                            children: [{
                                scriptClass: "mstrmojo.DataGrid",
                                cssClass: "mstrmojo-iserver-table",
                                // cssText: "width:90%;position:relative",
                                renderOnScroll: false,
                                makeObservable: true,
                                // multiSelect: true,
                                resizable: false,
                                bindings: {
                                    items: "mstrmojo.all.webserverlist.model.webServersList[" + svr_idx + "].environmentsList[" +
                                    env_idx +
                                    "].serversList"
                                },
                                columns: [{
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
													this.text = this.parent.parent.data.name;
												}
											}, {
												scriptClass: "mstrmojo.Label",
												cssClass: "mstrmojo-Alerts-badge-Small",
												autoHide: true,
												bindings: {
													text: function(){
														var alnum = 0;
														var al = mstrmojo.all.alertModel.alerts;
														for (var k = 0; k < al.length; k++) {
															if (al[k].m == this.parent.parent.data.name) {
																alnum++;
															}
														}
														return (alnum) ? alnum : null;
														
													}
												}
											}]
										}, {
                                            scriptClass: "mstrmojo.HBox",
                                            cssText: "width: 130px;margin-left:auto;margin-right:auto;",
                                            children: [{
                                                scriptClass: "mstrmojo.Widget",
                                                markupString: '<a href="{@urlLink}" ><img class="{@cssClass}" src="{@imgSrc}"></img></a>',
                                                cssClass: "mstrmojo-monitor-button",
                                                tooltip: "Job Monitor",
                                                urlLink: "mstrIPA?evt=3165&server=",
                                                imgSrc: "../images/jobmonitor.gif",
                                                useRichTooltip: true,
                                                postApplyProperties: function(){
                                                    this.urlLink += this.parent.parent.data.name;
                                                    this.urlLink += "&monitor=jm";
                                                }
                                            }, {
                                                scriptClass: "mstrmojo.Widget",
                                                markupString: '<a href="{@urlLink}"><img class="{@cssClass}" src="{@imgSrc}"></img></a>',
                                                cssClass: "mstrmojo-monitor-button",
                                                tooltip: "User Monitor",
                                                urlLink: "mstrIPA?evt=3165&server=",
                                                imgSrc: "../images/usemonitor.gif",
                                                useRichTooltip: true,
                                                postApplyProperties: function(){
                                                    this.urlLink += this.parent.parent.data.name;
                                                    this.urlLink += "&monitor=um";
                                                }
                                            }, {
                                                scriptClass: "mstrmojo.Widget",
                                                markupString: '<a href="{@urlLink}" ><img class="{@cssClass}" src="{@imgSrc}"></img></a>',
                                                cssClass: "mstrmojo-monitor-button",
                                                tooltip: "Cache Monitor",
                                                urlLink: "mstrIPA?evt=3165&server=",
                                                imgSrc: "../images/cachmonitor.gif",
                                                useRichTooltip: true,
                                                postApplyProperties: function(){
                                                    this.urlLink += this.parent.parent.data.name;
                                                    this.urlLink += "&monitor=cm";
                                                }
                                            }, {
                                                scriptClass: "mstrmojo.Widget",
                                                markupString: '<a href="{@urlLink}" ><img class="{@cssClass}" src="{@imgSrc}"></img></a>',
                                                cssClass: "mstrmojo-monitor-button",
                                                tooltip: "Database Monitor",
                                                urlLink: "mstrIPA?evt=3165&server=",
                                                imgSrc: "../images/databasemonitor.gif",
                                                useRichTooltip: true,
                                                postApplyProperties: function(){
                                                    this.urlLink += this.parent.parent.data.name;
                                                    this.urlLink += "&monitor=dm";
                                                }
                                            }]
                                        }]
                                    }
                                }, {
                                    headerText: "Throughput",
                                    colCss: 'mstrmojo-chart-title',
                                    dataWidget: {
                                        scriptClass: "mstrmojo.CustomizedHBox",
                                        children: [{
                                        
                                            scriptClass: "mstrmojo.IPA.IPAChartLine",
                                            model: {
                                                categories: { items: []},vp : {},
                                                colHeaders : [],
                                                series: []
                                                
                                            },
                                            themeColor: '#b0b0b0',
                                            drawXAxisLabels: false,
                                            drawYAxisLabels: true,
                                            isLinearChart: true,
                                            isDrawLabels: true,
                                            multiLine: true,
                                            isDrawAxis: true,
                                            minValue: 0,
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
                                                this.server = this.parent.data.name;
//                                                var temp = {n:this.server + "1",f:''};    
//                                                this.model.colHeaders[0].items.push(temp);
//                                                temp = {n:this.server + "2",f:''};
//                                                this.model.colHeaders[0].items.push(temp);
                                            },
                                            counters: [{
                                                category: "MicroStrategy Server Jobs",
                                                instance: "CastorServer",
                                                counter: "Total Completed Reports",
                                                controller: countercontroller
                                            }, {
                                                category: "MicroStrategy Server Jobs",
                                                instance: "CastorServer",
                                                counter: "Total Report Requests",
                                                controller: countercontroller
                                            }]
                                        }]
                                    }
                                }, {
                                    headerText: "CPU Usage",
                                    colCss: 'mstrmojo-chart-title',
                                    dataWidget: {
                                        scriptClass: "mstrmojo.CustomizedHBox",
                                        children: [{
                                        
                                            scriptClass: "mstrmojo.IPA.IPAChartLine",
                                            model: {
                                                categories: { items: []},vp : {},
                                                series: [],colHeaders : [ { items : [] } ]
                                            },
                                            themeColor: '#b0b0b0',
                                            drawXAxisLabels: false,
                                            drawYAxisLabels: true,
                                            isFixedChart: true,
                                            isDrawLabels: true,
                                            isDrawAxis: true,
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
                                                this.server = this.parent.data.name;
                                            },
                                            counters: [{
                                                category: "Configuration",
                                                instance: "",
                                                counter: "Total_CPU_Usage",
                                                controller: countercontroller
                                            }]
                                        }, {
                                            scriptClass: "mstrmojo.IPA.IPACounterLabel",
                                            cssClass: "mstrmojo-chart-label",
                                            tdCssClass: 'mstrmojo-chart-td',
                                            category: "Configuration",
                                            instance: "",
                                            counter: "Total_CPU_Usage",
                                            appendSymbol: "%",
                                            postApplyProperties: function(){
                                                this.server = this.parent.data.name;
                                            },
                                            controller: countercontroller
                                        },
										{
											scriptClass: "mstrmojo.Label"
										}]
                                    }
                                }, {
                                    headerText: "Memory Usage",
                                    colCss: 'mstrmojo-chart-title',
                                    dataWidget: {
                                        scriptClass: "mstrmojo.CustomizedHBox",
                                        children: [{
                                            scriptClass: "mstrmojo.IPA.IPAChartLine",
                                            model: {
                                                categories: { items: []},vp : {},
                                                series: [],colHeaders : [ { items : [] } ]
                                            },
                                            themeColor: '#b0b0b0',
                                            drawXAxisLabels: false,
                                            drawYAxisLabels: true,
                                            isDrawLabels: true,
                                            isFixedChart: true,
                                            isDrawAxis: true,
                                            isAnimateLines: false,
                                            maxValue: 4000,
                                            margin: {
                                                t: 5,
                                                r: 5,
                                                b: 5,
                                                l: 5
                                            },
                                            width: 170,
                                            height: 60,
                                            postApplyProperties: function(){
                                                this.server = this.parent.data.name;
                                            },
                                            counters: [{
                                                category: "Configuration",
                                                instance: "",
                                                counter: "Used_Memory",
                                                controller: countercontroller
                                            }]
                                        }, {
                                            scriptClass: "mstrmojo.IPA.IPACounterLabel",
                                            cssClass: "mstrmojo-chart-label",
                                            tdCssClass: 'mstrmojo-chart-td',
                                            category: "Configuration",
                                            instance: "",
                                            appendSymbol: "MB",
                                            counter: "Used_Memory",
                                            postApplyProperties: function(){
                                                this.server = this.parent.data.name;
                                            },
                                            controller: countercontroller
                                        },
										{
											scriptClass: "mstrmojo.Label"
										}]
                                    }
                                }]
                            }]
                        });
                        
                        return envItem;
                    }
                }, {
                
                    scriptClass: "mstrmojo.WidgetList",
                    bindings: {
                    
                        items: "mstrmojo.all.webserverlist.model.webServersList.slice(" + svr_idx + "," + svr_idx + 1 + ")"
                    },
                    itemFunction: function(svr, env_idx, widget){
                        var envItem = new mstrmojo.CollapsiblePanel({
                            numericAlertsCssClass: "mstrmojo-Alerts-badge",
                            bindings: {
                                numberOfAlerts: function(){
                                    var sname = mstrmojo.all.webserverlist.model.webServersList[svr_idx].name;
                                    var alnum = 0;
                                    var al = mstrmojo.all.alertModel.alerts;
                                    for (var k = 0; k < al.length; k++) {
                                        if (al[k].m == sname) {
                                            alnum++;
                                        }
                                    }
                                    return alnum;
                                }
                            },
                            expanded: true,
                            status: false,
                            titleCssClass: 'mstrmojo-environment-titlebar',
                            cssClass: "mstrmojo-enviroment-panel",
                            postApplyProperties: function(){
                                this.title = "MicroStrategy Web Servers";
                            },
                            children: [{
                                scriptClass: "mstrmojo.DataGrid",
                                cssClass: "mstrmojo-iserver-table",
                                // cssText: "width:90%;position:relative",
                                renderOnScroll: false,
                                makeObservable: true,
                                // multiSelect: true,
                                resizable: false,
                                bindings: {
                                    items: "mstrmojo.all.webserverlist.model.webServersList.slice(" + svr_idx + "," + svr_idx + 1 + ")"
                                },
                                columns: [{
                                    headerText: "Web Server",
                                    dataWidget: {
                                        scriptClass: "mstrmojo.HBox",
                                        children: [{
                                            scriptClass: "mstrmojo.Label"
                                        },{
                                            scriptClass: "mstrmojo.Label",
                                            cssClass: "mstrmojo-iserver-name-label",
                                            postApplyProperties: function(){
                                                this.text = this.parent.data.name;
                                            }
                                        },{
												scriptClass: "mstrmojo.Label",
												cssClass: "mstrmojo-Alerts-badge-Small",
												autoHide: true,
												bindings: {
													text: function(){
														var alnum = 0;
														var al = mstrmojo.all.alertModel.alerts;
														for (var k = 0; k < al.length; k++) {
															if (al[k].m == this.parent.data.name) {
																alnum++;
															}
														}
														return (alnum) ? alnum : null;
														
													}
												}
											}]
                                    }
                                }, {
                                    headerText: "",
                                    dataWidget: {
                                        scriptClass: "mstrmojo.VBox"
                                    }
                                }, {
                                    headerText: "CPU Usage",
                                    colCss: 'mstrmojo-chart-title',
                                    dataWidget: {
                                        scriptClass: "mstrmojo.CustomizedHBox",
                                        children: [{
                                        
                                            scriptClass: "mstrmojo.IPA.IPAChartLine",
                                            model: {
                                                categories: { items: []},vp : {},
                                                series: [],colHeaders : [ { items : [] } ]
                                            },
                                            themeColor: '#b0b0b0',
                                            drawXAxisLabels: false,
                                            drawYAxisLabels: true,
                                            isFixedChart: true,
                                            isDrawLabels: true,
                                            isDrawAxis: true,
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
                                                this.server = this.parent.data.name;
                                            },
                                            counters: [{
                                                category: "Configuration",
                                                instance: "",
                                                counter: "Total_CPU_Usage",
                                                controller: countercontroller
                                            }]
                                        }, {
                                            scriptClass: "mstrmojo.IPA.IPACounterLabel",
                                            cssClass: "mstrmojo-chart-label",
                                            tdCssClass: 'mstrmojo-chart-td',
                                            category: "Configuration",
                                            instance: "",
                                            counter: "Total_CPU_Usage",
                                            appendSymbol: "%",
                                            postApplyProperties: function(){
                                                this.server = this.parent.data.name;
                                            },
                                            controller: countercontroller
                                        },
										{
											scriptClass: "mstrmojo.Label"
										}]
                                    }
                                }, {
                                    headerText: "Memory Usage",
                                    colCss: 'mstrmojo-chart-title',
                                    dataWidget: {
                                        scriptClass: "mstrmojo.CustomizedHBox",
                                        children: [{
                                            scriptClass: "mstrmojo.IPA.IPAChartLine",
                                            model: {
                                                categories: { items: []},vp : {},
                                                series: [],colHeaders : [ { items : [] } ]
                                            },
                                            themeColor: '#b0b0b0',
                                            drawXAxisLabels: false,
                                            drawYAxisLabels: true,
                                            isDrawLabels: true,
                                            isFixedChart: true,
                                            isDrawAxis: true,
                                            isAnimateLines: false,
                                            maxValue: 4000,
                                            margin: {
                                                t: 5,
                                                r: 5,
                                                b: 5,
                                                l: 5
                                            },
                                            width: 170,
                                            height: 60,
                                            postApplyProperties: function(){
                                                this.server = this.parent.data.name;
                                            },
                                            counters: [{
                                                category: "Configuration",
                                                instance: "",
                                                counter: "Used_Memory",
                                                controller: countercontroller
                                            }]
                                        }, {
                                            scriptClass: "mstrmojo.IPA.IPACounterLabel",
                                            cssClass: "mstrmojo-chart-label",
                                            tdCssClass: 'mstrmojo-chart-td',
                                            category: "Configuration",
                                            instance: "",
                                            appendSymbol: "MB",
                                            counter: "Used_Memory",
                                            postApplyProperties: function(){
                                                this.server = this.parent.data.name;
                                            },
                                            controller: countercontroller
                                        },
										{
											scriptClass: "mstrmojo.Label"
										}]
                                    }
                                }]
                            }]
                        });
                        
                        return envItem;
                    }
                }]
            
            });
            
            return svrItem;
        }
    });
    
    
})();
