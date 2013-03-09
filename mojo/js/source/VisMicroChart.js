(function() {

	mstrmojo.requiresCls(
						"mstrmojo.Vis",
						"mstrmojo.VisMicroChartLine",
						"mstrmojo.dom",
						"mstrmojo._TouchGestures",
						"mstrmojo._HasTouchScroller"
						);

	
	var models = [],
		widgets = [],
		titles = [],
		titlesAligns = [];
	var sparklineProps = {},
		barProps = {},
		bulletProps = {},
		otherProps = {};
	var order = [];
	var columnWidths = [];
	var ROW_HEIGHT = 27;
	var ID_NAME = {};
	var METRIC_INDEX = {};
	var METRICS = [];
	var ATTCOUNT;
	var headerCssClass;
	var valueCssClass; // this is used when inherit from grid formatting is enabled
	//combine the attr with diff form
	var GFL = 1;
	var isKPI = false;
	var showGauge = false;
	
	var textAlign = { // xiawang: we must use class for text-align, otherwise there is conflict between inherited format
		left: "microchart-table-text-L",
		center: "microchart-table-text-M",
		right: "microchart-table-text-R"
	};
	function init(w) {
		models = []; 
		titles = [];
		titlesAligns = [];
		METRIC_INDEX = {};
		order = w.order;
		ID_NAME = w.ID_NAME;
		widgets = [];
		sparklineProps = {};
		barProps = {};
		columnWidths = [];
		METRICS = [];
		ATTCOUNT = 0;
		GFL = 1;
		headerCssClass = "";
		valueCssClass = "";
		isKPI = false;
		showGauge = false;
	}
	
	// xiawang: used to convert decimal or hex strings into color strings like #0000FF
	function convertToColor(intString) {
		var colorString = parseInt(intString).toString(16);
		var len = colorString.length;
		for (var i = len; i < 6; i++) {
			colorString = "0" + colorString;
		}
		colorString = "#" + colorString;
		return colorString;
	}
	
	// xiawang: this is helper function to set border and background-color while maintain the width and height
	function setNodeCssText(node, cssText) {
		var height = node.style.height;
		var width = node.style.width;
		var textDecoration = node.style.textDecoration;
		var display = node.style.display;
		var fontSize = node.style.fontSize;
		node.style.cssText = cssText;
		node.style.height = height;
		node.style.width = width;
		node.style.textDecoration = textDecoration;
		if (display) {
			node.style.display = display;
		}
		if (fontSize) {
			node.style.fontSize = fontSize;
		}
	}
	
	function convertDataToModels() {
		init(this);

		var m = this.model,
			cols =  m.gts.col,				
			mtl = m.gts.col[0].es.length,	
			atl = m.gts.row.length,				
			rl = m.gvs.items.length,				
		    propValue = m.vp? m.vp : {};

	    var arow = m.gts.row;
		//reset for custom group
		for(var i = atl - 1; i >= 0; i --) {
			if(arow[i].otp == 1) {
				for(var j = arow.length - 1; j > i; j --) {
					arow[j + 1] = arow[j];
				}
				//use deep copy
				
				arow[i + 1] = mstrmojo.hash.clone(arow[i]);
				arow[i + 1].n = "";
				arow[i + 1].lm = [];
				arow[i + 1].fid = "Custom Group";
				for(var j = 0; j < arow[i].es.length; j ++) {
					var cgid = arow[i].es[j].id;
					if(cgid && cgid.length > 2 && (cgid.indexOf("BE") === 0 || cgid.indexOf("Z") === 0)) { // for device JSON, BE, for web JSON. Z
						continue;
					} else {
						arow[i + 1].es[j].n = "";
					}
				}
				arow[i + 1].otp = -1;
				arow[i].otp = -1;
			}
		}
			
		atl = arow.length;
		ATTCOUNT = atl;
		if(atl === 0 || mtl === 0 || cols.length > 1) {
			var errmsg = "The widget requires at least two attributes on row axis and one metrics in column axis OR exactly one attribute on row axis and at least one metric on column axis for KPI List mode.";
			m.err = mstrmojo.desc(8424, errmsg);
			return;
		}
		
		var rows = m.gts.row;
		var cols = m.gts.col;
		var len = rows.length;
		var gfid = rows[len - 1].id;
		len = len - 2;
		while(len >= 0) {
			if(gfid == rows[len].id) {
				GFL ++;
				len --;
			} else {
				break;
			}
		}
		if(atl <= GFL) {
			isKPI = true;
		}

		for (var i = 0; i < rows.length; i ++) {
			if(rows[i].fid === "Custom Group") {
				rows[i].n = " ";
				rows[i].id = rows[i].id + ":CG";
				rows[i].fid = "";
			}
			if(rows[i].fs && rows[i].fs.length > 0) {
				for(var q = 0; q < rows[i].fs.length; q ++) {
					//only the first one display the name
					if(q == 0) {
						ID_NAME[rows[i].id + ":" + rows[i].fs[q].id] = rows[i].n;
					} else {
						ID_NAME[rows[i].id + ":" + rows[i].fs[q].id] = " ";
					}
				}
			}
			if(rows[i].fid && rows[i].fid.length > 0) {
				ID_NAME[rows[i].id] = rows[i].dn? rows[i].dn: rows[i].n;
				ID_NAME[rows[i].id + ":" + rows[i].fid] = rows[i].dn? rows[i].dn: rows[i].n;
			} else {
				ID_NAME[rows[i].id] = rows[i].n;
			}
			
		}
		var mes = {};
		for(var i = 0; i < cols.length; i ++) {
			if(cols[i].n = "Metrics") {
				mes = cols[i].es;
				for(var j = 0; j < mes.length; j ++) {
					ID_NAME[mes[j].oid] = mes[j].n;
					METRIC_INDEX[mes[j].n] = j;
					METRIC_INDEX[mes[j].oid] = j; // xiawang: use both metric name and metric ID as index key for order
					METRICS[j] = mes[j].n;
				}
			} else {
				ID_NAME[cols[i].id] = cols[i].n;
			}
			
		}
		
		// xiawang: read the value string from JSON and convert them to corresponding value type indicated by following prefixes @2011 Dec 13
		// mb:bolean value
		// mw:string value with format like "#FF00CC". It is used to represent color and converted from decimal or hex string from JSON
		// mstr:string value
		// mf:float value
		// mn:int value
		// mp:array value
		
		sparklineProps.mbShow = true;
		sparklineProps.mbAllPoints = false;
		sparklineProps.mbEndPoints = true;
		sparklineProps.mbRefLine = true;
		sparklineProps.mbRefArea = true;
		sparklineProps.mbAssMetric = true;
		sparklineProps.mbShowTooltip = true;
		sparklineProps.mwSeriesLineCol = "#333333";
		sparklineProps.mwRefLineCol = "#0066FF";
		sparklineProps.mwRefAreaCol = "#DEDEDE";
		sparklineProps.mstrHeader = "[Sparkline]";
		sparklineProps.mstrAssMetric = "";
		
		barProps.mbShow = false;
		barProps.mbShowLegend = true;
		barProps.mbRefLine = true;
		barProps.mbShowTooltip = true;
		barProps.mwPosCol = "#66CC00";
		barProps.mwNegCol = "#FF0000";
		barProps.mwRefLineCol = "#0066FF";
		barProps.mstrHeader = "[Bar]";
		
		bulletProps.mbShow = true;
		bulletProps.mbRefLine = true;
		bulletProps.mbRefBands = true;
		bulletProps.mbShowLegend = true;
		bulletProps.mbAssMetric = true;
		bulletProps.mbInvertAxis = false;
		bulletProps.mbShowTooltip = true;
		bulletProps.mfMinValue = 0;
		bulletProps.mwPosCol = "#000066";
		bulletProps.mwNegCol = "#FF0000";
		bulletProps.mwRefLineCol = "#0066FF";
		bulletProps.mwBand1 = "#999999";
		bulletProps.mwBand2 = "#BBBBBB";
		bulletProps.mwBand3 = "#DEDEDE";
		bulletProps.mstrHeader = "[Bullet]";
		bulletProps.mstrAssMetric = "";
		bulletProps.mstrBand1 = "Low";
		bulletProps.mstrBand2 = "Medium";
		bulletProps.mstrBand3 = "High";
		
		otherProps.mfBkgOpacity = 1.0;
		otherProps.mnMetricsPerKPI = 1;
		otherProps.mbHideColHeaders = false;
		otherProps.mbHideTextColumns = false;
		otherProps.mbLockLayout = false;
		otherProps.mbShowForHiddenGraphs = true;
		otherProps.mbInheritFromGridGraph = false;
		otherProps.mbInSingleColumnMode = false;
		
		otherProps.mpColumnIDs = [];
		otherProps.mpColumnPositions = null;
		otherProps.mpColumnWidths = null;
		otherProps.mpSortKey = null;
		
		otherProps.mbSortDescend = true;
		otherProps.mRowHeight = 27;
		
		if(propValue.lsh) sparklineProps.mbShow = (propValue.lsh === "true");
		if(propValue.lap) sparklineProps.mbAllPoints = (propValue.lap === "true");
		if(propValue.lep) sparklineProps.mbEndPoints = (propValue.lep === "true");
		if(propValue.lrl) sparklineProps.mbRefLine = (propValue.lrl === "true");
		if(propValue.lra) sparklineProps.mbRefArea = (propValue.lra === "true");
		if(propValue.lmsh) sparklineProps.mbAssMetric = (propValue.lmsh === "true");
		if(propValue.let) sparklineProps.mbShowTooltip = (propValue.let === "true");
		if(propValue.llsc) sparklineProps.mwSeriesLineCol = convertToColor(propValue.llsc);
		if(propValue.lrlc) sparklineProps.mwRefLineCol = convertToColor(propValue.lrlc);
		if(propValue.lrac) sparklineProps.mwRefAreaCol = convertToColor(propValue.lrac);
		if(propValue.lh) sparklineProps.mstrHeader = propValue.lh;
		if(propValue.lam) sparklineProps.mstrAssMetric = propValue.lam;
		
		
		if(propValue.bsg) barProps.mbShow = (propValue.bsg === "true");
		if(propValue.bl) barProps.mbShowLegend = (propValue.bl === "true");
		if(propValue.brl) barProps.mbRefLine = (propValue.brl === "true");
		if(propValue.bet) barProps.mbShowTooltip = (propValue.bet === "true");
		if(propValue.bpv) barProps.mwPosCol = convertToColor(propValue.bpv);
		if(propValue.bnv) barProps.mwNegCol = convertToColor(propValue.bnv);
		if(propValue.brlc) barProps.mwRefLineCol = convertToColor(propValue.brlc);
		if(propValue.bh) barProps.mstrHeader = propValue.bh;
		
		
		if(propValue.gsh) bulletProps.mbShow = (propValue.gsh === "true");
		if(propValue.grl) bulletProps.mbRefLine = (propValue.grl === "true");
		if(propValue.gra) bulletProps.mbRefBands = (propValue.gra === "true");
		if(propValue.gl) bulletProps.mbShowLegend = (propValue.gl === "true");
		if(propValue.gmsh) bulletProps.mbAssMetric = (propValue.gmsh === "true");
		if(propValue.gia) bulletProps.mbInvertAxis = (propValue.gia === "true");
		if(propValue.get) bulletProps.mbShowTooltip = (propValue.get === "true");
		if(propValue.gmm) bulletProps.mfMinValue = parseFloat(propValue.gmm);
		
		if(propValue.ggc) bulletProps.mwPosCol = convertToColor(propValue.ggc);
		if(propValue.gnv) bulletProps.mwNegCol = convertToColor(propValue.gnv);
		if(propValue.grlc) bulletProps.mwRefLineCol = convertToColor(propValue.grlc);
		if(propValue.gpc) bulletProps.mwBand1 = convertToColor(propValue.gpc);
		if(propValue.grc) bulletProps.mwBand2 = convertToColor(propValue.grc);
		if(propValue.gsc) bulletProps.mwBand3 = convertToColor(propValue.gsc);
		if(propValue.gh) bulletProps.mstrHeader = propValue.gh;
		if(propValue.gtam) bulletProps.mstrAssMetric = propValue.gtam;
		if(propValue.glt) bulletProps.mstrBand1 = propValue.glt;
		if(propValue.gmt) bulletProps.mstrBand2 = propValue.gmt;
		if(propValue.ght) bulletProps.mstrBand3 = propValue.ght;
		
		// xiawang: the propValue.wa could be something like "83%" and after parseFloat it became 83 rather than 0.83. So we add code to detect the value format
		if (propValue.wa) {
			var value = parseFloat(propValue.wa);
			if (propValue.wa.indexOf("%")) {
				value /= 100; // for percent value, divided by 100
			}
			otherProps.mfBkgOpacity = value;
		}
		if (propValue.metkpi) otherProps.mnMetricsPerKPI = parseInt(propValue.metkpi);
		if (propValue.hch) otherProps.mbHideColHeaders = (propValue.hch === "true");
		if (propValue.htc) otherProps.mbHideTextColumns = (propValue.htc === "true");
		if (propValue.ll) otherProps.mbLockLayout = (propValue.ll === "true");
		if (propValue.gam) otherProps.mbShowForHiddenGraphs = (propValue.gam === "true");
		if (propValue.igf) otherProps.mbInheritFromGridGraph = (propValue.igf === "true");
		if (propValue.scm) otherProps.mbInSingleColumnMode = (propValue.scm === "true");
		if (propValue.cid) otherProps.mpColumnIDs  = propValue.cid.split(",");
		// xiawang: otherProps.mpColumnWidths = propValue.cw   we delay the process to see if the order is valid. If not valid, we will not use user settings for column width
		if (propValue.co) otherProps.mpColumnPositions  = propValue.co.split(",");
		if (propValue.sc) otherProps.mpSortKey = propValue.sc;
		if (propValue.so) otherProps.mbSortDescend = (propValue.so !== "false");
		if (propValue.rh) otherProps.mRowHeight  = parseFloat(propValue.rh);
		// ROW_HEIGHT is shortcut to otherProps.mRowHeight
		ROW_HEIGHT = otherProps.mRowHeight;
		ROW_HEIGHT = ROW_HEIGHT > 27? ROW_HEIGHT: 27;  // 27 is the minimum Row height. This logic is copied from Flash behavior
		
		// Set the background opacity TQMS 531313
		this.domNode.style.background = "rgba(255, 255, 255," + otherProps.mfBkgOpacity +")";
		
		if(otherProps.mpSortKey && otherProps.mpSortKey.length > 0) {
			var tempSortKey = "";
			for(var i = 0; i < otherProps.mpSortKey.length; i ++) {
				if(otherProps.mpSortKey[i] == '_') {
					break;
				}
				tempSortKey += otherProps.mpSortKey[i];
			}
			otherProps.mpSortKey = METRIC_INDEX[tempSortKey];
		} else {
			otherProps.mpSortKey = null;
		}

		// xiawang: Inherit from GridGraph. We should assign headerCssClass and valueCssClass
		if (otherProps.mbInheritFromGridGraph) {
			try {
				var headerIndex = m.headercni? m.headercni: 0;
				var valueIndex = m.valuecni? m.valuecni: (m.css.length - 1);
				headerCssClass = m.css[headerIndex].n;
				valueCssClass = m.css[valueIndex].n;
			} catch (err) {
				// do nothing if error happens
			}
		}
		
		// xiawang: The header of each chart and lengend should follow locale specific settings.
		var applyLocale = function (proOwner, proName, dftStr, hasBracket, descID) {
			var compareStr = dftStr;
			var returnStr;
			if (hasBracket) {
				compareStr = "[" + dftStr + "]";
			}
			
			if (proOwner[proName] === compareStr) {
				// need replacement
				returnStr = mstrmojo.desc(descID, dftStr);
				if (hasBracket) {
					returnStr = "[" + returnStr + "]";
				}
				proOwner[proName] = returnStr;
			}
		};
		
		// xiawang: theratically, we should also apply the local to "Sparkline", "BarChart" and "Bullet". However, they are currently 
		// not in the locale DBs. Need action item in the future
		//applyLocale(sparklineProps, "mstrHeader", "Sparkline", true, 8425);
		//applyLocale();
		//applyLocale();
		//applyLocale(bulletProps, "mstrBand1", "Low", false, 3056);
		//applyLocale(bulletProps, "mstrBand2", "Medium", false, 3057);
		//applyLocale(bulletProps, "mstrBand3", "High", false, 3058);
		
		var orderValid = true;
		if (!propValue.co) {
			orderValid = false;
		} else {
			this.order = propValue.co.split(",");
			order = this.order;
			orderValid = processAndCheckOrderValid();
		}
		
		if(!orderValid) {
			this.order = [];
			order = this.order;
			if(!isKPI) {
				createNonKPIDefaultCol(m);
			} else {
				createKPIDefaultCol(m);
			}
		}
		// console.log("order:" + JSON.stringify(order));
		// console.log("this.order:" + JSON.stringify(this.order));
		
		if (propValue.cw) {
			otherProps.mpColumnWidths  = propValue.cw.split(",");
			if (otherProps.mpColumnWidths.length == order.length) { // check column width validity
				columnWidths = otherProps.mpColumnWidths; // as shortcut
				var len = columnWidths.length;
				for (var i = 0; i < len; i++) {
					columnWidths[i] = parseFloat(columnWidths[i]);
				}
			}
		}
		
		for (var i = 0; i < order.length; i ++) {
			// xiawang: check if Gauge chart is shown. This will decide whether the order "2" act as associated metric or normal metric
			if (order[i] == "GaugeChart") {
				showGauge = true; 	
			}
		}
		
		for(var i = 0; i < order.length; i ++) {
			if(order[i] == "Metric") {
				titles[i] = mstrmojo.desc(1158,'Metric');
				titlesAligns[i] = textAlign.left;
			} else if (order[i] == "LineChart") {
				titles[i] = sparklineProps.mstrHeader;
				titlesAligns[i] = textAlign.center;
			} else if(order[i] == "BarChart") {
				titles[i] = barProps.mstrHeader;
				titlesAligns[i] = textAlign.center;
			} else if(order[i] == "GaugeChart") {
				titles[i] = bulletProps.mstrHeader;
				titlesAligns[i] = textAlign.center;
			} else {
				var index = parseInt(order[i]);
				if (index != order[i]) {// "3" == 3 is true  "3A" == 3 is false
					// then it is attribute
					titlesAligns[i] = textAlign.left; // default to left
					titles[i] = ID_NAME[order[i]];
					if (otherProps.mbInheritFromGridGraph) {
						for (var j = 0; j < rows.length; j++) {
							if (order[i].split(":")[0] == rows[j].id && rows[j].cni !== undefined && m.css.length > rows[i].cni) {
								// todo
								titlesAligns[i] = m.css[rows[i].cni].n;
								break;
							}
						}
					}
				} else {
					// then it is metric
					if (otherProps.mbInheritFromGridGraph && mes[index].cni !== undefined && m.css.length > mes[index].cni) {
						titlesAligns[i] = m.css[mes[index].cni].n;
					} else {
						titlesAligns[i] = textAlign.right; // default to right
					}
					if (order[i] == "0") {
						if (isKPI) {
							titles[i] = "";
						} else if (sparklineProps.mstrAssMetric) { // xiawang: add support for Ass Metric name for LineChart and Bar Chart
							titles[i] = sparklineProps.mstrAssMetric;
						} else {
							titles[i] = mes[index].n;
						}
					} else if (order[i] == "2") {
						if (isKPI && showGauge) {
							titles[i] = "";
						} else if (bulletProps.mstrAssMetric) {// xiawang: add support for Ass Metric name for Bullet Chart
							titles[i] = bulletProps.mstrAssMetric;
						} else {
							titles[i] = mes[index].n;
						}
					} else {
						titles[i] = mes[index].n;
					}
				}
			}
		}
		
				
		
		if(!isKPI) {
			convertAttributeDrivenData(this);
		} else {
			
			convert(this);
		}
		//if no data, display the error message
		var kpi = otherProps.mnMetricsPerKPI;
		var m = this.model;

		if(isKPI && mtl < kpi) {
			var errmsg = "Metric per KPI should be at least 1 or less than or equal to the total number of Metrics in the widget";
			m.err = errmsg;
			return;
		}

		if(models.length == 0) {
			var errmsg = "No data returned for this view, this might be because the applied filter excludes all data";
			m.err = errmsg;
			return;
		}
	}
	function processAndCheckOrderValid() { // xiawang: other than check the order valid, we may also convert the order into expected order
		if (isKPI && otherProps.mpColumnIDs.length <= 1) { // TQMS 538305 xiawang: For some old document, the cid length is less than 1. We then should not rely on .co property
			return false;
		}
		for(var i = 0; i < order.length; i ++) {
			if(order[i] == "LineChart" || order[i] == "BarChart" || order[i] == "GaugeChart" || order[i] == "Metric") { // xiawang: Metric is also a valid string
				continue;
			}
			if(order[i].length < 3) {
				return false;
			}
			var tstStr = order[i];
			var len = tstStr.length;
			
			if(tstStr[len - 2] == '|') {
				order[i] = tstStr = tstStr.substring(0, len - 2);
			}
			if(!ID_NAME[tstStr]) {
				return false;
			} else if (METRIC_INDEX[tstStr] !== undefined) {
				order[i] = METRIC_INDEX[tstStr] + ""; // xiawang: we should make sure that every order is string
			} else if (isKPI) {
				order[i] = "0";
			}
		}
		return true;
	}
	function createKPIDefaultCol(m) {
		var ind = 0;
		order[ind ++] = "Metric";
		var kpi = otherProps.mnMetricsPerKPI;
		if(isNaN(kpi)) kpi = 1;
		var firstChartShow = false;
		if(sparklineProps.mbShow) {
			firstChartShow = true;
			order[ind ++] = "LineChart";
		}
		if(barProps.mbShow) {
			firstChartShow = true;
			order[ind ++] = "BarChart";
		}
		if((!firstChartShow && otherProps.mbShowForHiddenGraphs) || (firstChartShow && sparklineProps.mbAssMetric)) {
			// xiawang: TQMS533526 the associated metric should only show if at least one of line chart and bar chart is shown
			order[ind ++] = "0";
		}
		
		if(kpi >= 7) {
			if(bulletProps.mbShow) {
				if(bulletProps.mbAssMetric) {
					order[ind ++] = "2";
				}
				order[ind ++] = "GaugeChart";
			} else if (otherProps.mbShowForHiddenGraphs) {
				for (var i = 3; i <= kpi && i <= 7; i++) {
					order[ind ++] = "" + (i - 1);
				}
			}
			for (var i = 8; i <= kpi; i ++) {
				order[ind ++] = "" + (i - 1);
			}
		} else {
			for (var i = 3; i <= kpi; i ++) {
				order[ind ++] = "" + (i - 1);
			}
		}
	}
	
	function createNonKPIDefaultCol(m) {
		var ind = 0;
		var rows = m.gts.row;
		var cols = m.gts.col;
		var mtrcNum = 0;
		for (var i = 0; i < rows.length - GFL; i ++) {
			if(rows[i].fs && rows[i].fs.length > 0) {
				for(var q = 0; q < rows[i].fs.length; q ++) {
					order[ind++] = rows[i].id + ":" + rows[i].fs[q].id;
				}
			} else {
				if(rows[i].fid && rows[i].fid.length > 0) {
					order[ind++] = rows[i].id + ":" + rows[i].fid;
				} else {
					order[ind++] = rows[i].id;
				}
			}
		}
		
		for(var i = 0; i < cols.length; i ++) {
			if(cols[i].n = "Metrics") {
				mtrcNum = cols[i].es.length;
			}
		}

		var firstChartShow = false;
		if(sparklineProps.mbShow) {
			firstChartShow = true;
			order[ind ++] = "LineChart";
		}
		if(barProps.mbShow) {
			firstChartShow = true;
			order[ind ++] = "BarChart";
		}
		if((!firstChartShow && otherProps.mbShowForHiddenGraphs) || (firstChartShow && sparklineProps.mbAssMetric)) {
			// xiawang: TQMS533526 the associated metric should only show if at least one of line chart and bar chart is shown
			order[ind ++] = "0";
		}
		
		if(mtrcNum >= 7) {
			if(bulletProps.mbShow) {
				if(bulletProps.mbAssMetric) {
					order[ind ++] = "2";
				}
				order[ind ++] = "GaugeChart";
			} else if (otherProps.mbShowForHiddenGraphs){
				for (var i = 3; i <= 7 && i <= mtrcNum; i ++) {
					order[ind ++] = "" + (i - 1);
				}
			}
			for (var i = 8; i <= mtrcNum; i ++) {
				order[ind ++] = "" + (i - 1);
			}
		} else {
			for (var i = 3; i <= mtrcNum; i ++) {
				order[ind ++] = "" + (i - 1);
			}
		}
	}

	function convertAttributeDrivenData(w) {
		var m = w.model,
			mt = m.gts.col[0].es,			
			att = m.gts.row,				
			rows = m.gvs.items,				
			rl = m.gvs.items.length,				
			rhs = m.ghs.rhs.items;			
											

		if(order.length == 0) {
			
			titles[0] = att[0].n;			
			
			for(var i = 1; i < att.length - GFL; i++) {
				titles[i] = att[i].n;
			}
		}
		
		var attLen = att.length;
		var lai = att.length - GFL;
		var slai = lai - 1;
		
		var idxPos = 0;
		var attrMapIdx = []; // xiawang: the attrMapIdx key is attr index. value is the starting idx position of that attr
		for(var q = 0; q < attLen; q ++) {
			attrMapIdx[q] = idxPos;
			if(!att[q].fs || att[q].fs.length == 0) {
				idxPos ++;
			} else {
				idxPos += att[q].fs.length;
			}
		}
		attrMapIdx[attLen] = idxPos; // this last is dummy one but it is helpful if we want to find the last idx pos of (attLen - 1)th attribute
		
		var attrName = att[lai].dn || att[lai].n;

		var fnCopyArray = function (src, isIdx) {
			var dest = [];
			for (var i = 0; i < src.length; i++) {
				dest[i] = src[i];
			}
			return dest;
		};
		
		/**
		 * xiawang: the ctlMatrix is instance level object and it use attribute ID as key for each controlInfo object
		 * the controlInfo object has following object
		 * 
		 * es: linked to attribute.es to store the attribute elements
		 * sc: linked to attribute.sc to store the control info
		 * map: this is an array to map from row column into corresponding idx
		 */
		w.ctlMatrix = {};
		for (var i = 0; i < lai; i++) {
			var attribute = att[i];
			if (!attribute.sc) {
				w.isAllAttrSelectable = false;
				continue;
			}
			w.ctlMatrix[attribute.id] = {
				es: attribute.es,
				sc: attribute.sc,
				map: [],
				selectedIdx: {"-1": true} // undefined or false as false, true as true. Default we set -1 as true which means all
			};
		}
		/* xiawang: process RHS into AttrIndexes array. The reason is to handle special case for un-merged row header grid
				{0, 0}, 
		    	   {1},  
				   {2}, 
		   		{1, 0},
		   		   {1},
		   		   {2} */
		var AttrIndexes = [];
		var i = 0, j = 0;
		var template = [];
		var tempLen = 0;
		for (i = 0; i < rhs.length; i++) {
			if (i === 0) {
				// For the first row, set up the template
				AttrIndexes[0] = [];
				for (j = 0; j < rhs[i].items.length; j++) {
					AttrIndexes[0][j] = rhs[0].items[j].idx;
					if (AttrIndexes[0][j] < 0) {
						AttrIndexes[0][j] = 0;
					}
					if (rhs[0].items[j].cet) {
						var id = rhs[0].items[j].cet;
						if (order[j] == id + ":CG") { // for custom group, we use seperate control matrix
							id += ":CG";
						}
						var controlMatrix = w.ctlMatrix[id];
						if (controlMatrix) {
							delete controlMatrix.selectedIdx[-1];
							controlMatrix.selectedIdx[AttrIndexes[0][j]] = true;
						}
					}
				}
				template = fnCopyArray(AttrIndexes[0]);
				tempLen = template.length;
				continue;
			}
			var rhsRow = rhs[i].items;
			var rhsRowLen = rhsRow.length;
			for (j = 1; j <= rhsRowLen; j++) {
				template[tempLen - j] = rhsRow[rhsRowLen - j].idx;
				if (template[tempLen - j] < 0) {
					template[tempLen - j] = 0;
				}
				if (rhsRow[rhsRowLen - j].cet) {
					var id = rhsRow[rhsRowLen - j].cet;
					if (order[rhsRowLen - j] == id + ":CG") { // for custom group, we use seperate control matrix
						id += ":CG";
					}
					var controlMatrix = w.ctlMatrix[id];
					if (controlMatrix) {
						delete controlMatrix.selectedIdx[-1];
						controlMatrix.selectedIdx[template[tempLen - j]] = true;
					}
				}
			}
			AttrIndexes[i] = fnCopyArray(template);
		}
		// console.log("This ID:" + JSON.stringify(w.ctlMatrix));
		
		var fnBEL = function(index){
			var elms = {};
			var ind = 0;
			for(var i = 0; i < att.length - GFL; i++) {
				var fL = att[i].fs.length;
				if(fL < 1) {
					fL = 1;
				}
				var attId = att[i].id;
				elms[attId] = att[i].es[AttrIndexes[index][ind]].n;

				var fidId = att[i].fid;
				if(fidId && fidId.length > 0) {
					elms[attId + ":" + fidId] = att[i].es[AttrIndexes[index][ind]].n;
				}
				for(var j = 0; j < fL; j ++) {
					var formId = "";
					if(att[i].fs && att[i].fs[j]) {
						formId = att[i].fs[j].id;
					}
					if(formId && formId.length > 0) {
						var afID = attId + ":" + formId;
						elms[afID] = att[i].es[AttrIndexes[index][ind]].n;
					}
					ind ++;
				}
			}
			
			return elms;
		};
		
		
		var s = {v:[], rv: [], hi:[0]};
		var referValue = [];
		var sortValue = 0;
		var ch = [{items:[{n:mt[0].n}]}];	
		var c = [],							
			baseRow = [],						
			j = 0,							
			si = 0,
			isTotal = false,
			compareResult = false;
		
		function indexChanged (baseRow, newRow) { // xiawang: we should compare all the idx from index 0 to idxPos - 1 to determine if row changed
			if (baseRow.length != newRow.length) {
				return true;
			}
			var endIndex = attrMapIdx[lai] - 1;
			if (endIndex >= baseRow.length) {
				endIndex = baseRow.length - 1;
			}
			for (var i = endIndex; i >= 0; i--) { // xiawang: There are more chances for the end to be different
				if (baseRow[i] != newRow[i]) {
					return true;
				}
			}
			return false;
		}
		for(var i = 0; i <= rl; i++) {
			if(i === 0) {
				baseRow = AttrIndexes[i];
			} else if((compareResult = (i === rl || indexChanged(baseRow, AttrIndexes[i])))
						|| isTotal) {
				if (isTotal && !compareResult) {
					// xiawang: we only post the changed one last data for the total case. so we skip if index not changed or not the last row
				} else {
					// xiawang: start to update the map of ctlMatrix
					for (var x = 0; x < lai; x++) {
						var controlMatrix = w.ctlMatrix[att[x].id];
						if (controlMatrix) {
							controlMatrix.map[si] = AttrIndexes[i - 1][x];
						}
					}
					models[si] = {
							sortV : sortValue,
							isTotal : isTotal,
							refv : referValue,
							elms : fnBEL(i - 1),
							tr : s.v[s.v.length - 1],
							model : {
								categories : {
									items : c,
									tn : attrName
								},
								mtrcs : {
									items : METRICS
								},
								colHeaders : ch,
								series : [ s ],
								rowHeaders : [ {
									n : att[lai].n
								} ]
							}
					};
					si++;
					if (i === rl) {
						break; // xiawang: i == rl is the ending signal
					}
				}
				s = {v:[], rv: [], hi:[0]}; 
				referValue = [];
				
				c = []; 
				
				baseRow = AttrIndexes[i];
				j = 0;
				isTotal = false;
			}
			
			// xiawang: TQMS 531618;When subtotal is enabled in the grid the value of reference line in sparkline and bar graph should be the total value of the second metric
			for(var p = 0; p < rows[i].items.length; p ++) {
				if(!referValue[p]) {
					referValue[p] = {};
				}
				referValue[p] = rows[i].items[p];
			}
			
			if(otherProps.mpSortKey != null) {
				sortValue = parseFloat(referValue[otherProps.mpSortKey].rv);
			}
			
			// xiawang: TQMS 531936: If the slai attribute is a subtotal value, we should not show charts for this graph
			var attrSlai = att[slai].es[AttrIndexes[i][attrMapIdx[slai]]];
			if ((attrSlai.id && attrSlai.id.substring(0, 1) === "D") || (attrSlai.id === undefined && attrSlai.n === "Total")) {
				// The second last attribute is a subtotal value
				isTotal = true;
				continue;
			}
			
			var attr = att[lai].es[AttrIndexes[i][attrMapIdx[lai]]];
			if ((attr.id && attr.id.substring(0, 1) === "D") || (attr.id === undefined && attr.n === "Total")) {
				// xiawang: TQMS 531573 The subtotal value should not be displayed in the sparkline and bar graph
				continue;
			}
			var attrElement = "";
			var attIdxPos = attrMapIdx[lai];
			var thisAtt = null;
			var thisAttFormLen = 1;
			try{
				for(var p = 0; p < GFL; p ++) {
					thisAtt = att[lai + p];
					if (thisAtt.fs) {
						thisAttFormLen = thisAtt.fs.length;
					} else {
						thisAttFormLen = 1;
					}
					for (var pp = 0; pp < thisAttFormLen; pp++) {
						attrElement += " " + thisAtt.es[AttrIndexes[i][attIdxPos]].n;
						attIdxPos ++;
					}
				}
			} catch (err) {
				// just to keep it working if error happens;
			}
			
			c[j] = attrElement; 
			
			s.v[j] = rows[i].items[0].v;
			s.rv[j] = rows[i].items[0].rv;
			
			j++;
		}
		//sort the models with the sort key
		if(otherProps.mpSortKey != null) {
			for(var i = 0; i < models.length; i ++) {
				for(var j = 0; j < models.length - 1; j ++) {
					if((otherProps.mbSortDescend && models[j].sortV < models[j + 1].sortV) || (!otherProps.mbSortDescend && models[j].sortV > models[j + 1].sortV)) {
						var temp = models[j];
						models[j] = models[j + 1];
						models[j + 1] = temp;
					}
				}
			}
		}
	}
	
	function convert(w) {
		var	m = w.model,
			cs = m.gts.row[0].es,	
			csl = m.ghs.rhs.items.length,			
			v = m.gvs.items,		
			cols = m.gts.col,		
			sn = m.gts.col[0].es,	
			att = m.gts.row,			
			ch = []; 			
				
		for(var i = 0; i < sn.length; i++) {
			if(!ch[0]) {
				ch[0] = {items: []};
			}
			ch[0].items[i] = [{n:sn[i].n}];
		}
		
		var vl = v[0].items.length;

		
		var series = []; 
		var c = [];
		var attrName = m.gts.row[0].dn || m.gts.row[0].n;

		var referValue = [];
		var kpi = otherProps.mnMetricsPerKPI;
		if(isNaN(kpi)) kpi = 1;
		var sNum = 0;
		for(var i = 0; i + kpi <= vl; i = i + kpi) {
			var fv = [];
			var rv = [];
			series[sNum] = {v:fv,rv:rv,hi:[0]}; 
			var refV = [];
			referValue[sNum] = {refv:refV};
			for (var j = 0; j < kpi; j ++) {
				referValue[sNum].refv[j] = v[csl-1].items[i + j];
			}
			sNum ++;
		}
		
		for(var i = 0; i < csl; i++) {
			c[i] = cs[i].n; 
			var ind = 0;
			for( var j = 0; j + kpi <= vl; j = j + kpi) { 
				series[ind].v[i] = v[i].items[j].v; 
				series[ind].rv[i] = v[i].items[j].rv;
				ind ++;
			}
		}

		var sl = series.length;
		for(var i = 0; i < sl; i++) {
			var elmsValue = {};
			elmsValue[m.gts.row[0].id] = ch[0].items[i * kpi][0].n;
			if(m.gts.row[0].fid) {
				elmsValue[m.gts.row[0].id + ":" + m.gts.row[0].fid] = ch[0].items[i * kpi][0].n;
			}
			elmsValue["Metric"] = ch[0].items[i * kpi][0].n;
			models[i] = {refv:referValue[i].refv, elms:elmsValue, tr:series[i].v[series[i].v.length - 1], model:{categories:{items:c, tn: attrName}, mtrcs:{items:METRICS}, series:[series[i]], colHeaders:[{items:ch[0].items[i]}], rowHeaders:[{n:att[0].n}]}};
		}
	}

	function reSetTableSize() {
		var ht = this.headerTable;
		var width = this.getWidth();
		
		var ct = this.chartTable;
		
		ht.parentNode.style.width = width + 'px';
		ht.style.width = width + 'px';
		ct.parentNode.style.width = width + 'px';
		ct.style.width = width + 'px';
		var tlen = titles.length;
		var chWidth = width/tlen;
		var refnSD = function(e, wdth) {
			if(!wdth) {
				e.style.width = chWidth + 'px';
			} else {
				e.style.width = wdth + 'px';
			}
		};
		
		var ths = ht.getElementsByTagName('th');
		
		var tbody = this.chartTable.getElementsByTagName('tbody')[0];
		var origTR = tbody.getElementsByTagName('tr')[0];
		var tds = origTR.getElementsByTagName('td');
		for( var i = 0; i < tlen; i++) {
			if(columnWidths.length > i) {
				refnSD(ths[i], columnWidths[i]);
				refnSD(tds[i], columnWidths[i]);
			} else {
				refnSD(ths[i]);
				refnSD(tds[i]);
			}
		}
		var origTRs = tbody.getElementsByTagName('tr');
		for(var j = 1; j < origTRs.length; j ++){
			origTR = origTRs[j];
			tds = origTR.getElementsByTagName('td');
			for( var i = 0; i < tlen; i++) {
				if(columnWidths.length > i) {
					refnSD(tds[i], columnWidths[i]);
				} else {
					refnSD(tds[i]);
				}
			}
		}
		if(this.lengedDis) {
			this.itemsContainerNode.style.height = ""; // remove height first
			if(this.itemsContainerNode.offsetHeight + this.lengendHeight + this.headerTable.offsetHeight >= this.getHeight()) {
				this.itemsContainerNode.style.height = this.getHeight() - this.headerTable.offsetHeight - this.lengendHeight + "px";
			}
			this.legend.style.width = this.width;
		}
	}

	function renderMicroCharts() {
		this.domNode.style.width = this.width;
		widgets = []; 
		var ht = this.headerTable,
			width = this.getWidth();
		this.lengedDis = false;
		ht.parentNode.style.width = width + 'px';
		ht.style.width = width + 'px';
		
		var tlen = titles.length;
		var chWidth = width/tlen;
		
		var fnSD = function(e, wdth) {
			if(!wdth) {
				e.style.width = chWidth + 'px';
			} else {
				e.style.width = wdth + 'px';
			}
			e.style.height =  ROW_HEIGHT + 'px';
		};
		
		
		var ths = ht.getElementsByTagName('th');
		
		
		var tbody = this.chartTable.getElementsByTagName('tbody')[0];
		
		var origTR = tbody.getElementsByTagName('tr')[0];
		
		var tds = origTR.getElementsByTagName('td');
		
		
		if(ths.length < tlen) {
			var htr = ht.getElementsByTagName('tr')[0];
			for(var i = ths.length; i < tlen; i++) {
				htr.insertBefore(ths[0].cloneNode(true), ths[1]);
				origTR.insertBefore(tds[0].cloneNode(true), tds[1]);
			}
		}
		
		for( var i = 0; i < tlen; i++) {
			if(columnWidths.length > i) {
				fnSD(ths[i], columnWidths[i]);
				fnSD(tds[i], columnWidths[i]);
			} else {
				fnSD(ths[i]);
				fnSD(tds[i]);
			}
			
			if (titlesAligns[i]) { // xiawang: TQMS 531506
				ths[i].className = "microchart-table-text " + titlesAligns[i];
				tds[i].className = "microchart-table-text " + titlesAligns[i];
			}
			
			if (order[i] == "Metric") { // Metric always to right. Chart always to center
				ths[i].style.textAlign = "left";
				tds[i].style.textAlign = "left";
			} else if (order[i] && order[i]["indexOf"] && order[i].indexOf("Chart") >= 0) { // Chart title always to center
				ths[i].style.textAlign = "center";
			}
			ths[i].innerHTML = titles[i] ? titles[i] : '';
			ths[i].className += " " + headerCssClass;
			//check if this is attribute
			if (ID_NAME[order[i]] || order[i] == "Metric") {
				// xiawang: Then it is a attribute
				tds[i].className += " " + valueCssClass;
				if (otherProps.mbHideTextColumns) {
					// xiawang: TQMS 532022;hide the text columns if user set it
					ths[i].style.display = "none";
					tds[i].style.display = "none";
				}
			}
			tds[i].setAttribute("mcol", i);
			ths[i].setAttribute("mcol", i);
			ths[i].setAttribute("mrow", -1);
		}
		
		var kpiOff = otherProps.mnMetricsPerKPI;
		if(!isKPI) {
			kpiOff = 0;
		}
		
		this.rowHeights = [];
		this.rowHeights[0] = ht.offsetHeight;
		this.widgetMatrix = [];
		for(var i = 0; i < models.length; i++) {
			var curM = models[i];
			
			var elms = curM.elms;

			var tr = origTR.cloneNode(true);
			
			tbody.appendChild(tr);
			this.widgetMatrix[i] = [];
			var tds = tr.getElementsByTagName('td');
			for(var j = 0; j < titles.length; j ++) {
				tds[j].setAttribute("mrow", i);
				//changed for attribute will be put in any column
				if (ID_NAME[order[j]] || order[j] == "Metric") {
					tds[j].innerHTML = elms[order[j]];
					continue;
				}
				if (order[j] == "LineChart") {
					if (curM.isTotal) {
						continue;
					}
					var placeholder = document.createElement("div");
					var props = {
							placeholder: placeholder,
				   			model: curM.model,
				   			refv: curM.refv,
				   			config:sparklineProps,
				   			widget:this,
				   			kpiOffset: kpiOff * i,
				   			width: ths[j].offsetWidth - 6, // xiawang: This is enhancment to automatically fit the table cell width for charts
				   			height:ROW_HEIGHT,
				   			toolTipMain: this.tooltip,
				   			mainOffsetTop: this.offsetTop,
				   			mainLeftPos: parseInt(this.domNode.style.left, 0) || 0,
				   			mainWidth: this.getWidth()
				   		};
					tds[j].appendChild(placeholder);
					placeholder.style.marginLeft = "3px";
					placeholder.style.marginRight = "3px";
					var w = new mstrmojo.VisMicroChartLine(props);
					w.render();
					w.parent = this;
					tds[j].removeAttribute("class");
					this.widgetMatrix[i][j] = w;
				} else if(order[j] == "BarChart") {
					if (curM.isTotal) {
						continue;
					}
					var placeholder = document.createElement("div");
					var props = {
							placeholder: placeholder,
				   			model: curM.model,
				   			refv: curM.refv,
				   			widget:this,
				   			kpiOffset: kpiOff * i,
				   			config:barProps,
				   			width: ths[j].offsetWidth - 6,
				   			height:ROW_HEIGHT,
				   			toolTipMain: this.tooltip,
				   			mainOffsetTop: this.offsetTop,
				   			mainLeftPos: parseInt(this.domNode.style.left, 0) || 0,
				   			mainWidth: this.getWidth()
				   		};
					
					tds[j].appendChild(placeholder);
					placeholder.style.marginLeft = "3px";
					placeholder.style.marginRight = "3px";
					var w = new mstrmojo.VisMicroChartBar(props);
					w.render();
					w.parent = this;
					tds[j].style.paddingLeft = "0px";
					tds[j].style.paddingRight = "0px";
					tds[j].className = valueCssClass;
					this.widgetMatrix[i][j] = w;
				} else if(order[j] == "GaugeChart") {
					/*if (curM.isTotal) {
						continue;
					}*/
					this.lengedDis = bulletProps.mbShowLegend;
					titles[j] = bulletProps.mstrHeader;
					var placeholder = document.createElement("div");
					var props = {
							placeholder: placeholder,
				   			model: curM.model,
				   			refv: curM.refv,
				   			widget:this,
				   			config:bulletProps,
				   			width: ths[j].offsetWidth - 6,
				   			height:ROW_HEIGHT,
				   			toolTipMain: this.tooltip,
				   			mainOffsetTop: this.offsetTop,
				   			mainLeftPos: parseInt(this.domNode.style.left, 0) || 0,
				   			mainWidth: this.getWidth()
				   		};
					tds[j].appendChild(placeholder);
					placeholder.style.marginLeft = "3px";
					placeholder.style.marginRight = "3px";
					var w = new mstrmojo.VisMicroChartBullet(props);
					w.render();
					w.parent = this;
					tds[j].removeAttribute("class");
					this.widgetMatrix[i][j] = w;
				} else {
					var ind = METRIC_INDEX[titles[j]];
					var kpi = otherProps.mnMetricsPerKPI;
					if(isNaN(ind)) {
						ind = parseInt(order[j]);
					} else {
						if(ATTCOUNT == 1 && kpi > 1) {
							ind = ind % kpi;
						}
					}
					var innerHTML = "";
					var cssClass = "";
					if (curM.refv[ind].ti === undefined) { // by defult, use regular value
						if (curM.refv[ind].ts === 4) { // xiawang: For web JSON, ts === 4 means image
							innerHTML = "<img src='" + curM.refv[ind].v + "'/>";
						} else {
							innerHTML = curM.refv[ind].v;
						}
					} else { // there is threshold
						try { // we will try to apply the threshold. But if it fails, we shouldn't just fail the document rendering. Instead, we show default value;
							var th = this.model.th;
							var ti = curM.refv[ind].ti;
							if (curM.refv[ind].ty === 4) { // xiawang: This is image type
								var path;
								if (th[ti] && th[ti].n) {
									path = th[ti].n;
								} else {
									path = curM.refv[ind].v;
								}
								if (path.indexOf(":") >= 0) { // xiawang: Then it is absolute image path like http://.... or ftp://...
									// do nothing
								} else { // xiawang: Then it is relative image path like "Images/Arr3_Up.png". We should append base url to the image path
									var baseURL;
									try {
										baseURL = mstrApp.getConfiguration().getHostUrlByProject(mstrApp.getCurrentProjectId());
									} catch (err) {
										baseURL = "";
									}
									path = baseURL + path;
								}
								innerHTML = "<img src='" + path + "'/>";
							} else {
								if (th[ti] && th[ti].n && th[ti].cni !== undefined) { // if the threshold text is there, use it
									innerHTML = th[ti].n;
								} else {
									innerHTML = curM.refv[ind].v;
								}
								tds[j].style.fontSize = "10pt"; // xiawang: We should keep consistent with Flash and iOS to NOT inherite font size from Threshold at this time
							}
							cssClass = this.model.css[th[ti].cni].n;
						} catch (err) {
							if (!innerHTML) { // xiawang: If innerHTML is not finalized yet.
								innerHTML = curM.refv[ind].v;
							}
						}
					}
					if (cssClass) {
						tds[j].className += " " + cssClass;
					} else {
						tds[j].className += " " + valueCssClass;
					}
					tds[j].innerHTML = innerHTML;
				}
			}
			this.rowHeights[i + 1] = tr.offsetHeight + this.rowHeights[i];
		}
		
		// xiawang: obsolete xiawang: after rendered. We should set the height of the first row as offset. The reason of minus 1 is because the cell border
		// origTR.style.height = this.headerTable.offsetHeight - 1 + "px";
		origTR.style.display = "none";
		// xiawang: hide the headerTable if user set it TQMS 532011
		if (otherProps.mbHideColHeaders) {
			this.headerTable.style.display = "none";
		}
		if(this.lengedDis) {
			this.legend.style.position = "relative";
			this.legend.className += " " + valueCssClass;
			if(this.itemsContainerNode.offsetHeight + this.lengendHeight + this.headerTable.offsetHeight >= this.getHeight()) {
				this.itemsContainerNode.style.height = this.getHeight() - this.headerTable.offsetHeight - this.lengendHeight + "px";
			}
			this.legend.style.display = "block";
			if(bulletProps.mstrBand1) {
				this.legendLowFont.innerHTML = bulletProps.mstrBand1;
			}
			if(bulletProps.mwBand1) {
				this.legendLow.style.backgroundColor = bulletProps.mwBand1;
			} else {
				this.legendLow.style.backgroundColor = "#999999";
			}
			this.legendLowFont.style = (this.getTextWidth(this.legendLowFont.innerHTML, 10, "Arial") + 2) + "px";
			if(bulletProps.mstrBand2) {
				this.legendMidFont.innerHTML = bulletProps.mstrBand2;
			}
			if(bulletProps.mwBand2) {
				this.legendMid.style.backgroundColor = bulletProps.mwBand2;
			} else {
				this.legendMid.style.backgroundColor = "#BBBBBB";
			}
			
			this.legendMidFont.style = (this.getTextWidth(this.legendMidFont.innerHTML, 10, "Arial") + 2) + "px";
			if(bulletProps.mstrBand3) {
				this.legendHighFont.innerHTML = bulletProps.mstrBand3;
			}
			if(bulletProps.mwBand3) {
				this.legendHigh.style.backgroundColor = bulletProps.mwBand3;
			} else {
				this.legendHigh.style.backgroundColor = "#DEDEDE";
			}
			
			this.legendHighFont.style = (this.getTextWidth(this.legendHighFont.innerHTML, 10, "Arial") + 2) + "px";
		}
		/* xiawang: since we changed the layout, comment out this part of code
		if(this.scrollPast) {
			var tr = origTR.cloneNode(true);
			tr.style.borderBottom = '0px';
			tr.style.display = "inline"; // this is default 
			tbody.appendChild(tr);
		}
		*/
	}
	
	function setScrollerPosition() {
		var tbody = this.chartTable.getElementsByTagName('tbody')[0];
		var hbody = this.headerTable.getElementsByTagName('tbody')[0];
		var legendHeight = this.legend.offsetHeight;
		//var origTR = tbody.getElementsByTagName('tr')[1];
		if(!tbody) return;
		if(!hbody) return;
		var scl = this._scroller,
			m = this.model,
			icn = this.chartTable,
			offsetEnd = Math.max( tbody.offsetHeight + hbody.offsetHeight - this.getHeight() + legendHeight + 2, 0);
		
		scl.origin = {
				x: 0,
				y: 0
		};

		scl.showScrollbars = true;
		scl.vScroll = (offsetEnd !== 0 && scl.noVScroll !== true) || this.scrollPast;

		if (scl.vScroll) {
			
			scl.offset = {
					y: {
				start: 0,
				end: offsetEnd
			},
			scrollPast: this.scrollPast
			};
		}
		
		this.utils.translateCSS(0,0,false,icn);
	}
	
	mstrmojo.VisMicroChart = mstrmojo.declare(
			
			mstrmojo.Vis,

			
			[ mstrmojo._TouchGestures, mstrmojo._HasTouchScroller],

			
			{
				
				scriptClass: 'mstrmojo.VisMicroChart',

				
				utils: mstrmojo.VisChartUtils,

				
				scrollerConfig: {
	                bounces: false,
	                showScrollbars: true,
	                useTranslate3d: true
	            },
	            
	            
	            scrollPast: false,
	            
	            
	            lengendHeight: 30,
	            
	            
	            selectedStyle: "background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #058CF5), color-stop(1, #015DE6));color:#FFFFFF;",
	            
	            
	            selectedClass: "",
	            
	            
	            isAllAttrSelectable: true,
	            
	            
	            prevSelectedRow: -2,  // -2 for default,   -1 for header total,    0, 1, 2 for concrete row  
	            
	            
	            markupString: '<div id="{@id}" class="mstrmojo-Chart {@cssClass}" style="width:{@width};height:{@height};position:absolute;background-color:rgba(255, 255, 255, 1.0);position:absolute;word-wrap:break-word;" ' +
				' mstrAttach:mousedown,mouseup,mousemove,click >' +
				
				'<div id="{@id}-header-bar" class="microchart-header-div" style="width:{@width};">' +
				'<table id="{@id}-header-table" style="width:{@width};table-layout:fixed">'+
				'<tr class="microchart-table-row">' +
				'<th class="microchart-table-text" style="border:none;text-decoration:none;"></th>' +
				'</tr>' +
				'</table>' +
				'</div>' +
				
				'<div id="{@id}-canvas-parent-div" class="microchart-canvas-div" style="overflow:hidden;width:{@width};">' +
				'<table id="{@id}-charts-table" style="width:{@width};table-layout:fixed">'+
				'<tr class="microchart-table-row">' +
				'<td style="border:none;background:transparent;text-decoration:none;"></td>' +
				'</tr>' +
				'</table>' + 
				'<canvas width="0px" height="0px"></canvas>' +
				'</div>' +
				
				'<div style="display:none;position:absolute;right:0;z-index:5;height:{@lengendHeight}px;width:{@width};border:none;background:transparent;text-decoration:none;font-size:10pt;" class="microchart-lengend-text">'+
				'<div style="position:absolute;right:0;bottom:0;margin-bottom:7px;">' +
				'<div style="float:left;margin-right:5px;">Low</div>' +
				'<div style="float:left;margin-right:15px;height:15px;width:10px;"></div>' +
				'<div style="float:left;margin-right:5px;">Mid</div>' +
				'<div style="float:left;margin-right:15px;height:15px;width:10px;"></div>' +
				'<div style="float:left;margin-right:5px;">High</div>' +
				'<div style="float:left;margin-right:5px;height:15px;width:10px;"></div>' +
				'</div></div>' +
				'<span id="textSpan" style="z-index:-10;visibility:hidden;"></span>' +
				'<div id="{@id}-tooltip" class="mstrmojo-MicroChart-tooltip" style="z-index:10;opacity: 0.9;"></div>' + 
				
				'</div>',
				
				
				markupSlots: {
					
					headerTable: function(){ return this.domNode.childNodes[0].firstChild; },

					
					itemsContainerNode: function() { return this.domNode.childNodes[1]; },
					
					
					canvas: function(){ return this.domNode.childNodes[1].lastChild; },
										
					
					chartTable: function() { return this.domNode.childNodes[1].firstChild; },
					
					
					tooltip: function() {return this.domNode.lastChild;},
					
					textSpan: function() {return this.domNode.childNodes[3];},
					
					legend: function(){return this.domNode.childNodes[2];},
					
					legendLow: function(){return this.domNode.childNodes[2].childNodes[0].childNodes[1];},
					
					legendMid: function(){return this.domNode.childNodes[2].childNodes[0].childNodes[3];},
					
					legendHigh: function(){return this.domNode.childNodes[2].childNodes[0].childNodes[5];},
					
					legendLowFont: function(){return this.domNode.childNodes[2].childNodes[0].childNodes[0];},
					
					legendMidFont: function(){return this.domNode.childNodes[2].childNodes[0].childNodes[2];},
					
					legendHighFont: function(){return this.domNode.childNodes[2].childNodes[0].childNodes[4];}
				},

				getTextWidth: function gtw(str, fontName, fontSize) {
					this.textSpan.style.fontFamily = fontName; 
					this.textSpan.style.fontSize = fontSize+"pt";
					this.textSpan.innerHTML = str;
					var ret = this.textSpan.offsetWidth;
					
					return ret;
				},
				

				refreshChart: function refreshChart() {
					renderMicroCharts.call(this);
					setScrollerPosition.call(this);
				},

				
				initScroller : function initScroller(scroller) {

					if(!scroller.offset && this.scrollPast) {
						scroller.offset = {scrollPast:this.scrollPast};
					}

					var me = this;
					
					if(me._super()) {
						me._super(scroller);
					}
					
					
					this._scroller.attachEventListener('scrollDone', me.id, function (evt) {
						
						var scl = me._scroller;
						
						var ty = parseInt(Math.round(scl.origin.y/(ROW_HEIGHT + 1)), 0 );  


						ty = Math.max(ty, -ty);
						
						var maxRows = Math.floor(me.getHeight() / (ROW_HEIGHT + 1)) - 1; 
						if(maxRows > models.length - ty) {
							ty--; 
						}

						var y = (ty * (ROW_HEIGHT + 1));
						
						var k = 1; 

						for(var i = ty; i < widgets.length; i++) {
							widgets[i].offsetTop = me.offsetTop + (ROW_HEIGHT * k) + k++;
						}

						/* Do not need to readjust according to the ios version.
						window.setTimeout(function() {
							mstrmojo.dom.translate(me.chartTable, 0, -(y), 0, "", true); 
							scl.origin.y = y; 
							}, 40);*/
					});
					
					
				},
				
				
				postBuildRendering: function postBR() {
					// xiawang: MicroChart may run on report or document, _Formattable only supports document. Hence we do the layout by ourself, not by _Formattable
					if (this.defn && this.defn.fmts) {
						var fmts = this.defn.fmts;
						if (fmts.height) {
							this.height = fmts.height;
							this.domNode.style.height = this.height;
						}
						if(!this.isFullScreenWidget) {
							if (fmts.width) {
								this.width = fmts.width;
								this.domNode.style.width = this.width;
							}
						}
						
						if (fmts.left) {
							this.domNode.style.left = fmts.left;
						}
						
						if (fmts.top) {
							this.domNode.style.top = fmts.top;
						}
						
						if (fmts["z-index"]) {
							this.domNode.style.zIndex = fmts["z-index"];
						}
					}
					
					
					this.prevSelectedRow = -2;
					this.order = [];
					this.ID_NAME = {};
					this.isAllAttrSelectable = true;
					this.isAllAttrSelectable = false; // xiawang: TQMS 538558. Can't support row selection currently due to this issue. Disable it for this release;
					browserSupportsHtml5 = this.canvas.getContext; 
					if (!browserSupportsHtml5) {
						this.renderErrorMessage(mstrmojo.desc(8126, 'Your browser does not support HTML5')); 
						return;
					}
	                if (!this.model) {
	                	this.renderErrorMessage(mstrmojo.desc(8426,'No model provided'));
	                }
					
					if (this.model.eg || this.model.err) {
						this.renderErrorMessage(this.model.eg);
						return;
					}
					
					convertDataToModels.call(this);
					
					if (otherProps.mbInheritFromGridGraph) {
						this.selectedClass = "sc_" + this.model.k; // xiawang: this css class name is fixed
					} else {
						this.selectedClass = "";
					}
					
					if(this.model.err) {
						this.renderErrorMessage(this.model.err);
						return;
					}
					
					
					this.scrollerConfig.scrollEl = this.chartTable;
					if(this.getHeight() < ((models.length + 1) * ROW_HEIGHT) + models.length) {
						this.scrollPast = true;
					}
	                
	                if(this._super) {
	                	this._super();
	                }
	                renderMicroCharts.call(this);
	                setScrollerPosition.call(this);
	                this.updateControlStyle();
	                this.domNode.ontouchstart = function() {
	                	var highLightCav = document.getElementById("highLightCav" + this.id);
	                	if(highLightCav) {
	                		var highlightCt = highLightCav.getContext('2d');
	                		highLightCav.id = "";
	                		highlightCt.clearRect(0, 0, 1000, 1000);
	                	}
	                	this.lastChild.style.display = "none";
	                };
				},
				
				reRender: function reRender() {
					this.render();
					
					//comment the following code for the chart is incorrect
					/*var height = this.getHeight();
					
					
					if(this.model.err) {
						return;
					}
					
					this.adjustWidgetOffsets(); 
					
					
					var tbody = this.chartTable.getElementsByTagName('tbody')[0];
					
					var trs = tbody.getElementsByTagName('tr');
					for(var i = trs.length - 1; i > 0 ; i--) {
						tbody.removeChild(trs[i]);
					}
					
					if(height < ((models.length + 1) * ROW_HEIGHT) + models.length) {
						this.scrollPast = true;
					}
					
					
					this.scrollPast = height < ((models.length + 1) * ROW_HEIGHT) + models.length;
					reSetTableSize.call(this);
					setScrollerPosition.call(this);*/
				},
				handleTouchEnd: function handleTouchEnd() {
				},
				
				touchSelectBegin: function touchSelectBegin(touch) {
					var td = mstrmojo.dom.findAncestorByAttr(touch.target, "mcol", true, this.chartTable);
					if (td && td.node) {
						var mrow = td.node.getAttribute("mrow");
						var mcol = td.node.getAttribute("mcol");
						if(this.widgetMatrix[mrow][mcol]) {
							this.widgetMatrix[mrow][mcol].showTooltip(touch.pageX, touch.pageY);
							this.toolTipShow = true;
						}
					}
				},
				
				touchSelectEnd: function touchSelectEnd(touch) {
					this.toolTipShow = false;
				},
				
				touchSelectMove: function touchSelectMove(touch) {
					if(!this.toolTipShow) {
						return;
					}
					
					var td = mstrmojo.dom.findAncestorByAttr(touch.target, "mcol", true, this.chartTable);
					
					var oft = mstrmojo.boxmodel.offset(td, this.domNode);
					var pos = mstrmojo.dom.position(td, true);
					var posWdt = mstrmojo.dom.position(this.domNode, true);

					var targetRow = -5;
					var hbody = this.headerTable.getElementsByTagName('tbody')[0];
					var topOff = (touch.pageY + pos.y - posWdt.y + this._scroller.origin.y);
					var headerTopOff = hbody.offsetHeight + this._scroller.origin.y;
					if(headerTopOff > topOff) {
						return;
					}
					for(var i = 0; i < this.rowHeights.length; i ++) {
						if(this.rowHeights[i] > topOff) {
							targetRow = i - 1;
							break;
						}
						if(i == this.rowHeights.length - 1) {
							targetRow = i - 1;
						}
					}

					
					if (td && td.node) {
						var mrow = td.node.getAttribute("mrow");
						var mcol = td.node.getAttribute("mcol");
						if(this.widgetMatrix[targetRow][mcol]) { // xiawang: we should universally use this target row for both bulletChart, lineChart and barChart
							this.widgetMatrix[targetRow][mcol].showTooltip(touch.pageX, touch.pageY);
						}
					}
				},
				
				updateControlStyle: function () {
					if (!this.ctlMatrix) {
						return; // do nothing if this.ctlMatrix is not set
					};
					var controlMatrix = null;
					var hTable = this.headerTable.childNodes[0];
					var cTable = this.chartTable.childNodes[0];
					var isAllSelected = false;
					if (this.isAllAttrSelectable) {
						var resultSet = null;
						for (var i = 0; i < this.order.length; i++) {
							var id = this.order[i];
							var trueId = id.split(":")[0];
							if (id != trueId + ":CG") {// for Custom Group, We should use CG control matrix, not default control matrix
								id = trueId;
							}
							controlMatrix = this.ctlMatrix[id];
							if (controlMatrix) {
								var hTd = hTable.childNodes[0].childNodes[i];
								// update header;
								if (controlMatrix.selectedIdx[-1]) {
									// add style
									isAllSelected = true;
									this.prevSelectedRow = -1;
									// add style
									setNodeCssText(hTd, "border:none;" + this.selectedStyle);
									hTd.className += " " + this.selectedClass;
								} else {
									// remove style
									setNodeCssText(hTd, "border:none;");
									hTd.className = hTd.className.replace(new RegExp(this.selectedClass, "gm"), "");
								}
								if (!isAllSelected) {
									if (!resultSet) { // for the first time, we need to set result set
										resultSet = {};
										for (var j = 0; j < controlMatrix.map.length; j++) {
											if (controlMatrix.selectedIdx[controlMatrix.map[j]]) {
												resultSet[j] = true;
											};
										};
									} else { // we remove result set from existing set
										for (var j in resultSet) {
											if (!controlMatrix.selectedIdx[controlMatrix.map[j]]) { // if not selected, remove that row
												delete resultSet[j];
											};
										};
									};
								};
							}
						}
						if (isAllSelected || !resultSet || Object.keys(resultSet).length !== 1) {
							// do nothing, will go to default mode
						} else {
							console.log("xiawang: The selected row is:" + JSON.stringify(resultSet));
							var selectedRow = parseInt(Object.keys(resultSet)[0]);
							this.prevSelectedRow = selectedRow;
							var cTds = cTable.childNodes[selectedRow + 1].childNodes;
							for (var i = 0; i < cTds.length; i++) {
								// add style
								setNodeCssText(cTds[i], "border:none;" + this.selectedStyle);
								cTds[i].className += " " + this.selectedClass;
							}
						}
						return;
					}
					
					var compareObjKeys = function(obj1, obj2) {
						if (!obj1 || !obj2) {
							return false;
						}
						var keys1 = Object.keys(obj1);
						var keys2 = Object.keys(obj2);
						if (keys1.length === 0) {
							return false;
						}
						if (keys1.length != keys2.length) {
							return false;
						}
						if (keys1[0] != keys2[0]) {
							return false;
						}
						return true;
					};
					
					// default style;
					for (var i = 0; i < this.order.length; i++) {
						var id = this.order[i];
						id = id.split(":")[0];
						
						ctlMatrix = this.ctlMatrix[id];
						ctlMatrixCG = this.ctlMatrix[id + ":CG"];
						controlMatrix = ctlMatrix;
						if (!controlMatrix) {
							continue;
						}
						if (ctlMatrixCG && !compareObjKeys(ctlMatrix.selectedIdx, ctlMatrixCG.selectedIdx)) {
							// For CG, if selected idx of original and CG attr is the same, we should follow original attr. else follow CG attr
							controlMatrix = ctlMatrixCG;
						}
						var hTd = hTable.childNodes[0].childNodes[i];
						if (controlMatrix.selectedIdx[-1]) {
							// add style
							setNodeCssText(hTd, "border:none;" + this.selectedStyle);
							hTd.className += " " + this.selectedClass;
						} else {
							// remove style
							setNodeCssText(hTd, "border:none;");
							hTd.className = hTd.className.replace(new RegExp(this.selectedClass, "gm"), "");
						}
						// now work for body
						for (var j = 0; j < controlMatrix.map.length; j++) {
							var cTd = cTable.childNodes[j + 1].childNodes[i];
							if (controlMatrix.selectedIdx[controlMatrix.map[j]]) {
								// add style
								setNodeCssText(cTd, "border:none;" + this.selectedStyle);
								cTd.className += " " + this.selectedClass;
							} else {
								// remove style
								setNodeCssText(cTd, "border:none;background:transparent;");
								cTd.className = cTd.className.replace(new RegExp(this.selectedClass, "gm"), "");
							}
						};
					}
					
				}, 
				
				touchTap: function (touch) {
					var td = mstrmojo.dom.findAncestorByAttr(touch.target, "mcol", true, this.domNode);
					if (td && td.node) {
						var mrow = parseInt(td.node.getAttribute("mrow"));
						var mcol = parseInt(td.node.getAttribute("mcol"));
						// console.log("You click on the cell with mcol:" + mcol + "  mrow:" + mrow);
						// console.log("order:" + this.order[mcol]);
						var id = this.order[mcol];
						
						// console.log("order Name:" + this.ID_NAME[id]);
						
						if (this.isAllAttrSelectable) {
							id = id.split(":")[0];
							// if every attribute is selectable, we should use row mode
							// first, decide whether we need to clean previous style
							if (mrow == this.prevSelectedRow) { // xiawang: if current click and previous click is on the same row
								if (mrow >=0) { // xiawang: if they are both on the normal row, do nothing
									return;
								}
							} else {// else, we need to clean previous row
								var tds = [];
								var cssText = "border:none;";
								if (this.prevSelectedRow == -1) {
									tds = this.headerTable.childNodes[0].childNodes[0].childNodes;
								} else if (this.prevSelectedRow >= 0){
									tds = this.chartTable.childNodes[0].childNodes[this.prevSelectedRow + 1].childNodes;
									cssText += "background: transparent";
								}
								for (var i = 0; i < tds.length; i++) {
									// remove style
									setNodeCssText(tds[i], cssText);
									tds[i].className = tds[i].className.replace(new RegExp(this.selectedClass, "gm"), "");
								}
							}
							
							// second, set the style and send the event
							if (mrow == -1) { // if click on the header, set all element for that attribute
								if (this.ctlMatrix && this.ctlMatrix[id]) {
									var obj = this.ctlMatrix[id];
									if (!obj.sc) {
										return;
									}
									var evt = {
											type: 521,
											src: this.model.k,
											ck: obj.sc.ck,
											tks: obj.sc.tks,
											eid: "OA:(All)",
											anchor: td.node,
											ctlKey: obj.sc.ckey,
											sliceId: 1,
											sid:1
									};
									if (this.xtabModel && this.xtabModel.docModel && this.xtabModel.docModel["slice"]) {
										this.xtabModel.docModel.slice(evt);
									}
									// add style
									setNodeCssText(td.node, "border:none;" + this.selectedStyle);
									td.node.className += " " + this.selectedClass;
								}
							} else {
								if (this.ctlMatrix) {
									var tds = this.chartTable.childNodes[0].childNodes[mrow + 1].childNodes;
									var evt = {};
									for (var key in this.ctlMatrix) {
										var obj = this.ctlMatrix[key];
										if (!obj.sc) { // just to next object
											continue;
										}
										var selectedIdx = obj.map[mrow];
										var elementId = obj.es[selectedIdx].id;
										if (!elementId || elementId.substring(0, 1) === "D") {
											// xiawang: jump for subtotal and empty ID;
											continue;
										};
										if (!evt[key]) {
											var eventId = key.split(":")[0]; // this is used to let ID:CG to overwrite ID
											evt[eventId] = {
													type: 521,
													src: this.model.k,
													ck: obj.sc.ck,
													tks: obj.sc.tks,
													eid: elementId,
													anchor: td.node,
													ctlKey: obj.sc.ckey,
													sliceId: 1,
													sid:1
											};
										}
									}
									var elementSeperator = "\u001E";
									var finalEvt = undefined;
									if (this.xtabModel && this.xtabModel.docModel && this.xtabModel.docModel["slice"]) {
										for (var key in evt) {
											/*
											if (!finalEvt) {
												finalEvt = evt[key];
											} else {
												finalEvt.ck += "," + evt[key].ck;
												finalEvt.ctlKey += "," + evt[key].ctlKey;
												finalEvt.eid += elementSeperator + evt[key].eid;
											}
											*/
											this.xtabModel.docModel.slice(evt[key]); // xiawang: it is still unknow how to do several slice at a time. thus do multiple slice at this time
										}
										/*
										if (finalEvt) {
											this.xtabModel.docModel.slice(finalEvt);
										}
										*/
									}
									
									for (var i = 0; i < tds.length; i++) {
										// add style
										setNodeCssText(tds[i], "border:none;" + this.selectedStyle);
										tds[i].className += " " + this.selectedClass;
									}
								}
							}
							this.prevSelectedRow = mrow;
							return;
						}
						
						var isCG = false;
						if (id.indexOf(":CG") === id.length - 3 && id.length >= 3) {
							isCG = true;
						} else {
							id = id.split(":")[0];
						}
						if (this.ctlMatrix && this.ctlMatrix[id]) {
							var obj = this.ctlMatrix[id];
							// xiawang: We also need to update CG ctl Matrix. This follows Flash behavior
							var anotherObj = undefined;
							if (isCG) {
								anotherObj = this.ctlMatrix[id.split(":")[0]];
							} else {
								anotherObj = this.ctlMatrix[id + ":CG"];
							}
							if (!obj.sc) {
								return;
							}
							if (anotherObj && !anotherObj.sc) {
								anotherObj = undefined;
							}
							var elementId = "";
							var isAll = false;
							if (mrow == -1) { // select all
								elementId = "OA:(All)"; // OA:(All)
								isAll = true;
								obj.selectedIdx = {};
								obj.selectedIdx[-1] = true;
								// also update selectedIdx for CG
								if (anotherObj) {
									anotherObj.selectedIdx = {};
									anotherObj.selectedIdx[-1] = true;
								}
							} else {
								var selectedIdx = obj.map[mrow];				
								elementId = obj.es[selectedIdx].id;
								if (!elementId || elementId.substring(0, 1) === "D") {
									// xiawang: jump for subtotal and empty ID;
									return;
								} else {
									obj.selectedIdx = {};
									obj.selectedIdx[selectedIdx] = true;
									if (anotherObj) {
										if (elementId.indexOf("BE") === 0 || elementId.indexOf("Z") === 0) {
											// if click on concrete element, do nothing
										} else {
											// if click on other element, copy idx
											anotherObj.selectedIdx = {};
											anotherObj.selectedIdx[selectedIdx] = true; 
										}
									}
								}
							}
							var evt = {
									type: 521,
									src: this.model.k,
									ck: obj.sc.ck,
									tks: obj.sc.tks,
									eid: elementId,
									anchor: td.node,
									ctlKey: obj.sc.ckey,
									sliceId: 1,
									sid:1
							};
							if (this.xtabModel && this.xtabModel.docModel && this.xtabModel.docModel["slice"]) {
								this.xtabModel.docModel.slice(evt);
							}
							
							this.updateControlStyle();  // use centralized method to set control style
							/*
							// xiawang: set header format
							var headerCssText = "border:none;";
							var node = this.headerTable.childNodes[0].childNodes[0].childNodes[mcol];
							if (isAll) {
								// add style
								node.className += " " + this.selectedClass;
								headerCssText += this.selectedStyle;
							} else {
								node.className = node.className.replace(new RegExp(this.selectedClass, "gm"), "");
								// remove style
								
							}
							setNodeCssText(node, headerCssText);
							
							for (var j = 0; j < obj.map.length; j++) {
								// xiawang: set value format
								var valueCssText = "border:none;";
								node = this.chartTable.childNodes[0].childNodes[j + 1].childNodes[mcol];
								if (!isAll && obj.map[j] === selectedIdx) {
									// add style
									node.className += " " + this.selectedClass;
									valueCssText += this.selectedStyle;
								} else {
									// remove style
									node.className = node.className.replace(new RegExp(this.selectedClass, "gm"), "");
									valueCssText += "background:transparent;";
								}
								setNodeCssText(node, valueCssText);
							}
							*/
						}
						
					} else {
						// console.log("You didn't click on the cell");
					}
				}
				
			
		}
	);

})();