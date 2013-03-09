(function(){
	mstrmojo.requiresCls("mstrmojo.VisChartUtils");

	function normalizeValue(val, interval, isFloor) {

		var ceilOrFloor = function(val, isFloor) {
			return isFloor ? Math.floor(val) : Math.ceil(val); 
		};
		
		var lab = ceilOrFloor(val/interval, isFloor) * interval;

		if(lab.toString().indexOf(".") >= 0 && interval < 1) {
			lab = parseFloat(lab.toFixed(2));
		}

		if(lab > 0 && lab < 1) {
			lab = parseInt(ceilOrFloor(lab.toFixed(2) * 100, isFloor)) / 100;
		}
		return lab;
	}
	
	mstrmojo.IPA.IPAChartData = mstrmojo.provide(
			"mstrmojo.IPA.IPAChartData",
			/**
			 * @lends mstrmojo.IPAChartData
			 */

			{
				process: function prcss(w) {

				//TODO conversion is for now only later we will remove it.  If chartData is passed we will use it as model.
				// later we will pass down only the new model which we call as chartData for now.
				/*if(w.chartData){
					w.baseModel = w.chartData;
					w.model = w.chartData;
				} else*/ 
				if((!w.baseModel && w.model) || w.model.vp) {
					this.setDerivedModel(w);
				}

				// this is to stop at this point for debugging in androidApp page
				//local variables
				var	model = w.model;
				var	values = model.series,
				l = values.length;
				
				if (l <= 0) {
					return;
				}

				//make sure this is non linear chart and we are going to draw labels
				var nlc = !w.isLinearChart && w.isDrawAxis && w.drawYAxisLabels,
				ms = "";

				//return the values of all the points on Y axis sorted ascending
				var v = new Array(); 
				if (values && values[0] && values[0].v.length) {
					for(var j = 0; j < l; j++) {
						var s = values[j].v,
							sl = s.length,
							k = v.length;	
						for(var i = 0; i < sl; i++ ) {
							var val = s[i];
							// if value is not defined skip it
							if(!val || val.length == 0) {
								continue;
							}
							v[k] = parseInt(val * 100)/ 100;
							if(nlc && v[k].toString().length > ms.length) {
								ms = v[k].toString();
							}
							k++;
						}
					}
					v = v.sort(function sortArray(a,b){return a - b;});
				}
				model.mvalues = v;
				if(nlc) {
					//model.mls is the max label size
					model.mls = ms;
					model.ylbls = v;
				}
			},

			setDerivedModel: function sdm(w) {
				var m = w.model,
					s = m.series,
					sl = s.length,
					rl = m.vp.rl,
					row = m.rowHeaders,
					cols = m.colHeaders; // number of columns present we support one attribute and multiple metrics on columns.
				w.baseModel = m;
				
				//If we have custom properties compute the range of first element
				//Compute the slice we need to draw
				var rne = s[0].v.length,
					rns = 0;
				if(rl && w.isTimeSeries) {
					var rs = parseInt(rl[0].rs),
					 	sr = rl[0].sr;
					for(var i = 0; i < row.length; i++) {
						// Now match which row is it to get the start point of the range
						if(row[i].id == sr) {
							rns = rne - (row[i].l * rs) >= 0 ? rne - (row[i].l * rs) : 0;
							break;
						}
					}
				}
				
				if(w.isTimeSeries && sl > 1) {
					//Now build the starting Model based on 1st metric and first two series that
					// will be displayed for now
					var cntr = 0;
					var ds = new Array();
					
					var metricL = cols[cols.length - 1].items.length;
					for(var i = 0; i < sl && cntr < 2; i += metricL, cntr++) {
						ds[cntr] = s[i];
						ds[cntr].i = i; // this is the index of the series will help when we are going for cross series
					}
					s = ds;
				} else if(sl > 1 && !w.multiLine) {
					s = [s[0]];
				}

				w.model = { categories:m.categories, series:s, colHeaders:cols, rne:rne, rns:rns};
				
			},
			
			processLinearData: function pld(w) {

				this.process(w);
				var model = w.model;
				if (w.isFixedChart){
					
					model.mvalues = [];
					model.mvalues[0] = w.minValue;
					model.mvalues[4] = w.maxValue;
					var ratio = (w.maxValue/4);
					for (var i = 1; i < 4; i++)
					{
						model.mvalues[i] = model.mvalues[i-1] + ratio;
					}
				}
				var vals = model.mvalues,
				_max = vals[vals.length - 1],
				_min = vals[0];
				
				var interval = this.calInterval(model);
				var da = w.isDrawAxis && w.drawYAxisLabels,
					ms = "";
				
				var labelMax = normalizeValue(_max, interval, false);
				
				var labelMin = normalizeValue(_min, interval, true);
				
				_lbs = new Array();
				if( interval < ((labelMax - labelMin) / 30)){
					//too small intervals, show only two ticks
					_lbs.push(labelMin);
					_lbs.push(labelMax);
				}else{
					var currentValue = labelMin;
					
					while(currentValue <= labelMax){
						_lbs.push(currentValue);
						if(currentValue == labelMin){
							currentValue  = Math.ceil((labelMin + interval/100)/interval)*interval;
						}else{
							currentValue = Math.round((currentValue + interval) * 1000) / 1000;
						}
					}
					if(_lbs[_lbs.length - 1] < labelMax){
						_lbs.push(labelMax);
					}
				}
				
				
				model.mvalues = _lbs;

				if(da) {
					var ll = _lbs.length;
					var _lbstr = new Array();
					var k = 1,
					s = '',
					series = model.series,
					// check if the series are percent (%) values
					percent = model.colHeaders[model.colHeaders.length - 1].items[series[0].hi[series[0].hi.length - 1]].f.indexOf("%") >= 0 ? 100 : 1;
					
					for(var i = 0; i < ll; i++) {
						//if greater than 1000 and less than million put K symbol else if greator than 1 million put
						// M symbol else leave it as it is
						if(_lbs[i]/1000 >= 1 && _lbs[i]/1000000 < 1) {
							k = 1000;
							s = 'K';
						} else if(_lbs[i]/1000000 >= 1) {
							k = 1000000;
							s = 'M';
						} else {
							k = 1;
							s = '';
						}

						_lbstr[i] = (_lbs[i]/k * percent) + s;
						if(s == '') {
							if(_lbstr[i].indexOf(".") >= 0) {
								_lbstr[i] = parseFloat(_lbstr[i]).toFixed(2);
								if(_lbstr[i].indexOf(".00") > 0) {
									_lbstr[i] = parseInt(_lbstr[i]);
								}
							} else {
								_lbstr[i] = Math.round(_lbstr[i]);
							}
						}
						
						if(_lbstr[i].toString().length > ms.length) {
							ms = _lbstr[i].toString();
						}
					}
					
					model.mls = ms;
					model.ylbls = _lbstr;
				}

			},

			calInterval: function cInt(model) {
				var interval,
				vals = model.mvalues,
				_max = vals[vals.length - 1],
				_min = model.mvalues[0],
				diff = (_max - _min);
				if(diff == 0) {
					if(_max == 0) {
						_max = 1;
						_min = -1;
					} else {
						_max = _max * 2;
						_min = _min / 2;
					}
					diff = _max - _min;
				}
				
				interval = 1;
				if(diff < 1){
					while(diff < 1){
						diff *= 10;
						interval /= 10;
					}
				} else if(diff >= 10){
					while(diff >= 10){
						diff /= 10;
						interval *= 10;
					}
				}

				if(diff < 1.8){
					interval *= 0.2;
				} else if(diff < 3.1){
					interval *= 0.4;
				} else if(diff < 4.6){
					interval *= 0.5;
				} else{
					interval *= 2;
				}

				if((interval > 0 && interval < 1) && (parseInt(interval.toFixed(2) * 100) / 100) > 0) {
					interval = parseInt(interval.toFixed(2) * 100) / 100;
				}
				return interval;
			}
			});

})();