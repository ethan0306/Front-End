(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css", "mstrmojo.ListMapperTable", "mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", "mstrmojo.TabContainer", "mstrmojo.IPA.IPACounterController", "mstrmojo.IPA.IPACounterLabel", "mstrmojo.CheckBox"
	//,"mstrmojo.VisTreeMap"
	);

	mstrmojo.requiresDescs(8715,8682,8717,8683,8716,8756);

	var servername = _getParameter("server");

	mstrmojo.IPA.IPACacheChart = mstrmojo.declare(mstrmojo.HBox, null, {
		servername : null,
		cssClass : "mstrmojo-chart-panel",
		cssText : "margin:5px;width:945px",
		cellSpacing: '3',
		cellPadding: '3',
		selected : true,
		children : [
		{
					scriptClass: "mstrmojo.Table",
					cssText:"margin:5px;width:280px;height:300px;",
					cellSpacing: '2',
					cellPadding: '2',
					rows:8,
					cols:2,
					children:[
					{
						scriptClass : 'mstrmojo.Label',
						text : mstrmojo.desc(8715,"Report Cache Hits"),
						cssText : "font-size: 8pt;padding: 3px;",
						slot:'0,0'
					},{
						scriptClass : 'mstrmojo.Label',
						text : mstrmojo.desc(8682,"Document Cache Hits"),
						cssText : "font-size: 8pt;padding: 3px;",
						slot:'1,0'
					},{
						scriptClass : 'mstrmojo.Label',
						text : mstrmojo.desc(8717,"Report Caches in Memory"),
						cssText : "font-size: 8pt;padding: 3px;",
						slot:'2,0'
					},{
						scriptClass : 'mstrmojo.Label',
						text : mstrmojo.desc(8683,"Number of Document Caches In Memory"),
						cssText : "font-size: 8pt;padding: 3px;",
						slot:'3,0'
					},{
						scriptClass : 'mstrmojo.Label',
						text : mstrmojo.desc(8693,"Intelligent Cube Caches in Memory"),
						cssText : "font-size: 8pt;padding: 3px;",
						slot:'4,0'
					},{
						scriptClass : 'mstrmojo.Label',
						text : mstrmojo.desc(8716,"Report Cache Size"),
						cssText : "font-size: 8pt;padding: 3px;",
						slot:'5,0'
					},{
						scriptClass : 'mstrmojo.Label',
						text : "Intelligent Cube Cache Size",
						cssText : "font-size: 8pt;padding: 3px;",
						slot:'6,0'
					},{
						scriptClass : 'mstrmojo.Label',
						text : mstrmojo.desc(8756,"Size of Document Caches In Memory"),
						cssText : "font-size: 8pt;padding: 3px;",
						slot:'7,0'
					},					{
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssClass : "mstrmojo-chart-label",
						cssText : "font-size: 8pt;padding: 3px;",
						tdCssClass : 'mstrmojo-chart-td',
						category : "MicroStrategy Server Jobs",
						instance : "CastorServer",
						counter : "Total Report Cache Hits",
						appendSymbol : "",
						server : servername,
						controller : mstrmojo.all.countercontroller,
						slot:'0,1'
					}, {
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssClass : "mstrmojo-chart-label",
						cssText : "font-size: 8pt;padding: 3px;",
						tdCssClass : 'mstrmojo-chart-td',
						category : "MicroStrategy Server Jobs",
						instance : "CastorServer",
						counter : "Total Number of Document Cache Hit",
						appendSymbol : "",
						server : servername,
						controller : mstrmojo.all.countercontroller,
						slot:'1,1'
					}, {
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssClass : "mstrmojo-chart-label",
						tdCssClass : 'mstrmojo-chart-td',
						cssText : "font-size: 8pt;padding: 3px;",
						category : "MicroStrategy Server Jobs",
						instance : "CastorServer",
						counter : "Number Of Report Caches In Memory",
						appendSymbol : "",
						server : servername,
						controller : mstrmojo.all.countercontroller,
						slot:'2,1'
					}, {
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssClass : "mstrmojo-chart-label",
						tdCssClass : 'mstrmojo-chart-td',
						cssText : "font-size: 8pt;padding: 3px;",
						category : "MicroStrategy Server Jobs",
						instance : "CastorServer",
						counter : "Number of Document Caches In Memory",
						appendSymbol : "",
						server : servername,
						controller : mstrmojo.all.countercontroller,
						slot:'3,1'
					}, {
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssClass : "mstrmojo-chart-label",
						tdCssClass : 'mstrmojo-chart-td',
						cssText : "font-size: 8pt;padding: 3px;",
						category : "MicroStrategy Server Jobs",
						instance : "CastorServer",
						counter : "Number of Intelligent Cube Caches In Memory",
						appendSymbol : "",
						server : servername,
						controller : mstrmojo.all.countercontroller,
						slot:'4,1'
					}, {
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssClass : "mstrmojo-chart-label",
						tdCssClass : 'mstrmojo-chart-td',
						category : "MicroStrategy Server Jobs",
						cssText : "font-size: 8pt;padding: 3px;",
						instance : "CastorServer",
						counter : "Total Local Report Cache Size (MB)",
						appendSymbol : " MB",
						server : servername,
						controller : mstrmojo.all.countercontroller,
						slot:'5,1'
					}, {
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssClass : "mstrmojo-chart-label",
						tdCssClass : 'mstrmojo-chart-td',
						category : "MicroStrategy Server Jobs",
						cssText : "font-size: 8pt;padding: 3px;",
						instance : "CastorServer",
						counter : "Total Local Cube Cache Size (MB)",
						appendSymbol : " MB",
						server : servername,
						controller : mstrmojo.all.countercontroller,
						slot:'6,1'
					}, {
						scriptClass : "mstrmojo.IPA.IPACounterLabel",
						cssClass : "mstrmojo-chart-label",
						tdCssClass : 'mstrmojo-chart-td',
						category : "MicroStrategy Server Jobs",
						cssText : "font-size: 8pt;padding: 3px;",
						instance : "CastorServer",
						counter : "Total Local Document Cache Size (MB)",
						appendSymbol : " MB",
						server : servername,
						controller : mstrmojo.all.countercontroller,
						slot:'7,1'
					}]
				},
				{
					scriptClass : "mstrmojo.Box",
					cssText:"width:635px;height:362px;margin:5px;border-left:thin solid #cdcdc1;",
					children: [
					{
						id : "cachetreemap",
						cssText : "margin:5px;",
						scriptClass : "mstrmojo.VisTreeMap",
						treeMapData : [],
						onselectedRectIndexChange : function() {
							mstrmojo.all.cacheTable.set('selectedIndex', this.selectedRectIndex);
						},
						width : 625,
						height : 300,
					},{
						scriptClass : "mstrmojo.Box",
						id:"cachetreemaplegend",
						cssText:"position:relative;margin-left:10px;"
					}]
				}]
	});
})();
