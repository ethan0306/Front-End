(function() {

	mstrmojo.requiresCls("mstrmojo.VisChartLine", "mstrmojo.IPA.IPAChartCounter", "mstrmojo.IPA.IPAChartData");

	
	function getTooltipName(ch, s) {
		var nm = "",
			l = ch.length;
		
		if(l != s.hi.length) {
			//something wrong these two must be the same
			return ch[0].items[s.hi[0]].n;
		}
		
		for(var i = 0; i < l; i++) {
			nm += (i > 0 ? " " : "") + ch[i].items[s.hi[i]].n;
		}

		return nm;
	}
	
	/**
	 * 
	 */
	function getNormalizedTooltipValue(val) {
		if(val.toString().indexOf(".") >= 0) {
			//parseInt call for #499497
			return parseInt(Number(val).toFixed(2));
		}
		return val;
	}
	 
	mstrmojo.IPA.IPAChartLine = mstrmojo.declare(
	// superclass
	mstrmojo.VisChartLine,
	// mixins
	null, {

		scriptClass : 'mstrmojo.IPA.IPAChartLine',

		counters : null,

		isFixedChart : false,

		maxValue : 100,

		minValue : 0,

		lineWidth : 2,
		
		appendSymbol : '',

		data : mstrmojo.IPA.IPAChartData,

		chartLineColors : ['#0099FF', '#FFB03C', '#F26AE1', '#888BF4', '#93CA20', '#FE2F68'],

		realtimeLines : [],

		postCreate : function pstCrt() {
			if(!this.counters) {
				return;
			}
			//initialize chartline:
			this.model.series = [];
			for(var i = 0; i < 100; i++) {
				this.model.categories.items[i] = "";
			}

			this.model.colHeaders[0] = {
				items : []
			};

			//            this.model.colHeaders[0].items = [];
			for(var i = 0; i < this.counters.length; i++) {
				this.realtimeLines.push(new mstrmojo.IPA.IPAChartCounter({
					server : this.server,
					instance : this.counters[i].instance,
					counter : this.counters[i].counter,
					category : this.counters[i].category,
					controller : this.counters[i].controller,
					chart : this
				}));
			}

			this.update();

			if(this._super) {
				this._super();
			}

		},
		update : function update(node) {
			//original update had a call to setPropertiesFromModel which we dont need
			if(this.model) {
				if(this.isLinearChart) {
					this.data.processLinearData(this);
				} else {
					this.data.process(this);
				}
				//cache the values length property
				this.windowSize = this.model.series[0].v.length;
			}

		},
		drawChart : function drwchrt() {

			//local objects
			var context = this.animationContext, 
			model = this.model, mvalues = model.mvalues,
			 values = model.series, margin = this.margin, 
			 lines = [], linesFrom = [], height = this.height, 
			 width = this.width, me = this, 
			 utils = this.utils;

			if(!values)
				return;

			var vl = values.length;

			if(this.isDrawAxis && this.drawYAxisLabels) {
				margin.l = utils.getLabelWidthForMargin(this, model.mls);
			}			
			
			var a = "background: #DEF5FA; background: -moz-linear-gradient(top, #DEF5FA 25%, #17D8FF 75%);" +
			"			background: -webkit-gradient(linear, left top, left bottom, color-stop(25%,#DEF5FA), color-stop(75%,#17D8FF)); /* Chrome,Safari4+ */" +
	"background: -webkit-linear-gradient(top, #DEF5FA 25%,#17D8FF 75%); /* Chrome10+,Safari5.1+ */" + 
	"background: -o-linear-gradient(top, #DEF5FA 25%,#17D8FF 75%); /* Opera11.10+ */" + 
	"background: -ms-linear-gradient(top, #DEF5FA 25%,#17D8FF 75%); /* IE10+ */" +
	"filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#DEF5FA', endColorstr='#17D8FF',GradientType=0 ); /* IE6-9 */"+
	"background: linear-gradient(top, #DEF5FA 25%,#17D8FF 75%); /* W3C */";
	this.highlightContext.canvas.style.cssText = this.highlightContext.canvas.style.cssText + a + 'opacity:0.35;';
	

			//cache x & y ratios
			me.RTY = ( height - margin.t - margin.b - 5) / (mvalues[mvalues.length - 1] - mvalues[0]);
			me.RTX = ( width - margin.l - margin.r - 1) / (me.windowSize - 1);

			var mn = (mvalues[0] + mvalues[mvalues.length - 1]) / 2;
			var mnY = utils.getYValue(me, mn);
			// mean y value to start animation
			//create the lines array used to create the chart's line
			for(var j = 0; j < vl; j++) {
				lines = [];
				var k = 0;
				for(var i = 0; i < me.windowSize; i++) {
					var val = values[j].v[i];
					if(val.length == 0)
						continue;
					if(val < 0)
						continue;

					lines[k] = {
						x : (i * me.RTX) + margin.l,
						y : utils.getYValue(me, val)
					};

					if(!this.prevLines) {
						linesFrom[k] = {
							x : lines[k].x,
							y : mnY
						};
					}
					k++;
				}

				if(k > 0) {
					this.drawChartLine(lines, linesFrom, vl, j, context);
				}
				
				if(!this.multiLine)
					break;
				// break out of outer loop
			}

			this.prevLines = lines;

		},
		drawChartLine : function drwcl(lines, linesFrom, vl, si, context) {

			var height = this.height, me = this, utils = this.utils;

			context.strokeStyle = utils.getColor(me);
			context.lineCap = 'round';
			context.lineWidth = this.lineWidth;
			context.lineJoin = 'round';
			context.strokeStyle = this.chartLineColors[si % 6];

			utils.drawLineSet(me, lines, false, context);

		},
		refresh : function refresh() {
			//clear animation and highlite canvas
			this.highlightContext.clearRect(0, 0, this.width, this.height);
			this.animationContext.clearRect(0, 0, this.width, this.height);
			this.context.clearRect(0, 0, this.width, this.height);

			this.utils.fillBackground(this);

			// remove labels
			this.removeLabels();
			// re-draw chart
			this.drawChart();
			// re-draw chart
			this.drawAxis();
			// re-draw labels
			this.drawLabels();
		},
		handleTouchBegin : function handleTouchBegin(touchX, touchY) {
			var dn = this.domNode, offset = mstrmojo.boxmodel.offset(dn);
			this.offsetTop = offset.top;
			this.offsetLeft = offset.left;
			if(this._super) {
				this._super();
			}
		},
		
		renderTooltip: function rndrttp(valIndex, touchX, touchY) {			
			if (valIndex < 0) {
				this.tooltip.className = this.tooltip.className.replace(" fadeIn", "");
				if(this.isAndroid) {
					this.tooltip.style.visibility = 'hidden';
				}
				return;
			}

			var m = this.model, 
				s = m.series,
				utils = this.utils,
				l = s.length,
				si = this.seriesIndex,
				ch = m.colHeaders;

			// also put the series name
			var sn = '';
			//if not multiline get the value of series to be drawn
			if(!this.multiLine) {				
				sn = getTooltipName(ch,s[0]) + ': ' + getNormalizedTooltipValue(s[0].v[valIndex]) + this.appendSymbol;
			} else {
				//Now if we are drawing multiLines get all the values of highlight line
				// have to be shown
				if(this.showHighlightLine) {
					for(var i = 0; i < l; i++) {
						//for the -2 that shows in CPU charts #497197		
						if (s[i].v[valIndex] < 0) {						
							this.tooltip.className = this.tooltip.className.replace(" fadeIn", "");
							if(this.isAndroid) {
								this.tooltip.style.visibility = 'hidden';
							}
							return;
						}
						sn += (i == 0 ? '' : '<br/>') + getTooltipName(ch,s[i]) + ': ' + getNormalizedTooltipValue(s[i].v[valIndex]) + this.appendSymbol;
					}
				} else {
					//else draw the index based on the series selected					
					sn = getTooltipName(ch,s[si]) + ': ' + getNormalizedTooltipValue(s[si].v[valIndex]) + this.appendSymbol;
				}

			}

			//Cached the row/attribute values
			var rVal = this.model.categories.items[valIndex];

			//Set the tooltip text 
			this.tooltip.innerHTML = rVal + '<br/>' + sn;

			//Calculate the position of the highlight tooltip and adjust if necesary

			//get the width of the tooltip div
			var tooltipWidth = this.tooltip.offsetWidth;

			var toolx = touchX - tooltipWidth /2;
			var margin = this.margin;

			if (toolx < margin.l) {
				toolx = margin.l;
			} else if (toolx > this.width - margin.r - tooltipWidth) {
				toolx = this.width - margin.r - tooltipWidth;
			}

			//Set the tooltip position
			if(this.showHighlightLine) {
				utils.translateCSS(toolx, 0, false, this.tooltip);
			} else {
				//series should actually be picked up either for one that is drawn or which is the closest to the touch
				// get the ypos to show the tooltip and make sure it fits inside the window.
				var yPos = utils.getYValue(this, s[si].v[valIndex]) - this.tooltip.offsetHeight - 20;
				if(yPos < 0 ) {
					yPos = utils.getYValue(this, s[si].v[valIndex]);
				}
				utils.translateCSS(toolx, yPos, false, this.tooltip);
			}

			//Fade the tooltip in
			if (this.tooltip.className.indexOf("fadeIn") < 0) {
				this.tooltip.className = this.tooltip.className + " fadeIn";
				if (this.isAndroid) {
					this.tooltip.style.visibility = 'visible';
				}
			} 

		}

	});

})();
