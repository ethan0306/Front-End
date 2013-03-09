(function() {

	mstrmojo.requiresCls(
						"mstrmojo.VisChart",
						"mstrmojo.locales"
						);

	// to rotate do the div 150 pixels wide x and y point adjustments
	//This will also depend on what margins we are allocating in bottom for y axis.
	// here is what we currently have in char.js margin: {t:50, r:60, b:25, l:0},
	var ROTATE_X_ADJUST = 20;
	var ROTATE_Y_ADJUST = -20;

	//just the y point adjustment in case of no rotation based on 30 pixels margin at bottom
	var PLAIN_Y_ADJUST = 25;

	var $H = mstrmojo.hash;
	
	var prevDate = null;

	/**
	 * A line chart control
	 * @class
	 * @extends mstrmojo.VisChart
	 */
	mstrmojo.VisChartLine = mstrmojo.declare(
			// superclass
			mstrmojo.VisChart,

			// mixins
			null,

			/**
			 * @lends mstrmojo.VisChartLine.prototype
			 */
			{
				/**
				 * @ignore
				 */ 
				scriptClass: 'mstrmojo.VisChartLine',

				/**
				 * The filling color for the area under the lines 
				 * color should be in the '#ffffff' format
				 */
				fillinColor: null,

				/**
				 * Whether to rotate the X labels 45 degrees
				 */
				rotateXLabels: false,

				/**
				 * Whether to fill the area under the lines
				 */
				isFillLinesArea: null,

				/**
				 * Whether to animate the lines drawn on chart
				 */
				isAnimateLines: true,

				/**
				 * draw the points on start and end points.
				 * 0 - No points
				 * 1 - start point only
				 * 2 - end point only
				 * 3 - start and end points both
				 */
				isDrawStartEndPoints: 0,

				/**
				 * radius of the circle we draw on start and end points
				 */
				startEndPointRadius: 5,

				/**
				 * defines the color we want to display on the start point
				 * color should be in the '#ffffff' format
				 */
				startPointColor: null,

				/**
				 * defines the color we want to display on the end point
				 * color should be in the '#ffffff' format
				 */
				endPointColor: null,

				/**
				 * The previous set of lines so we can animate between the last and the new lines when the data changes
				 */
				prevLines: null,

				/**
				 * set of default series colors to draw chart lines
				 * If there are more than six series, we can repeat this set of colors
				 */
				chartLineColors: ['#0099FF', '#FFB03C', '#F26AE1', '#888BF4', '#93CA20', '#FE2F68'],

				/**
				 * max number of x axis labels to be shown on the screen
				 */
				maxXLabels: 6,
				
				/**
				 * This is the enumeration used for the forms to determine if the category is of type date
				 */
				DSS_XML_BASE_FORM_DATE : "8",
				
				/**
				 * Called to render the Chart elements
				 */            
				drawChart: function drwchrt() {

					var model = this.model;
					if(model.err) {
						return;
					}

					//local objects
					var context = this.animationContext,
					mvalues = model.mvalues,
					values = model.series,
					margin = this.margin,lines = [],linesFrom = [],
					height = this.getHeight(),
					width = this.getWidth(),
					me = this,
					utils = this.utils;

					if (!values) return; 

					var vl = values.length;

					if(this.isDrawAxis && this.drawYAxisLabels) {
						margin.l = utils.getLabelWidthForMargin(this,model.mls);
					}

					//cache x & y ratios
					me.RTY = (height - margin.t - margin.b - 5) / (mvalues[mvalues.length - 1] - mvalues[0]);
					me.RTX = (width - margin.l - margin.r - 1) / (me.windowSize - 1);

					var mn = (mvalues[0] + mvalues[mvalues.length - 1]) / 2;
					var mnY = utils.getYValue(me, mn); // mean y value to start animation
					//create the lines array used to create the chart's line
					for(var j = 0; j < vl; j++) {
						lines = [];
						var k = 0;
						for (var i = 0; i < me.windowSize; i++) {
							var val = values[j].rv[i];
							if(val.length === 0) continue;

							lines[k] = {x:(i * me.RTX) + margin.l, y:utils.getYValue(me, val)};

							if (!this.prevLines) {
								//the from array is used to animate the line, the line will animate from the mean 
								linesFrom[k] = {x:lines[k].x, y:mnY};
							}
							k++;
						}

						this.drawChartLine(lines, linesFrom, vl, j, context);

						if(!this.multiLine) break; // break out of outer loop
					}

					this.prevLines = lines;

			},

			drawChartLine: function drwcl(lines, linesFrom, vl, si, context, lw/*line width*/) {

				var me = this, 
					height = me.getHeight(),
					utils = me.utils;

				//config object used in the line animation method
				var cfg = {
						rate: 6
				};

				context.strokeStyle = utils.getColor(me);
				context.lineCap = 'round';
				context.lineWidth = lw || 2;
				context.lineJoin = 'round';

				if(me.isAnimateLines && (!me.multiLine || vl === 1 )) {
					if (me.prevLines) {
						linesFrom = me.prevLines;
						// match array lengths if the from is smaller
						if (linesFrom.length < lines.length) {
							for (var i = linesFrom.length; i < lines.length; i++) {
								linesFrom.push(lines[linesFrom.length-1]);
							}
						}
					}

					//animate the line
					utils.animateLineSet(me, me.prevLines || linesFrom, lines, cfg);
				} else {

					if(me.multiLine && vl > 1) {
						context.strokeStyle = me.chartLineColors[si % 6];
					}

					//just draw the lines no animation
					utils.drawLineSet(me, lines, false, context);

					if(me.isFillLinesArea) {
						utils.fillLinesArea(me,lines.slice(0));
					}

					if(me.isDrawStartEndPoints ) {
						utils.drawStartEndPoints(me, lines, context, me.isDrawStartEndPoints);
					}
				}

			},

			/**
			 * this function will set some properties by default to micro-chart mode
			 */
			setMicroChartProperties: function setMicroChartProperties() {
				this.isDrawAxis = false;
				this.margin = {t:0, r:5, b:0, l:5};
				this.showHighlightLine = false;
				this.isDrawStartEndPoints = 3;
			},
			
			initFromVisProps: function initFromVisProps(vp) {
				if(!vp) return;
				
				if(vp.thc) {
					this.themeColor = "#" + vp.thc;
				}
				
				if(vp.shl === "0") {
					this.showHighlightLine = false;
				}
				
				if(vp.mc === "1") {
					this.setMicroChartProperties();
				}
			},
			
			/**
			 * @ignore
			 */ 
			postCreate: function pstCrt() {
				if (this._super) {
					this._super();
				}

				if (this.rotateXLabels) {
					this.margin.b = 75;
				}

				// initialize the isFillLinesArea if it is not defined by the user and chart is single line chart
				if(typeof(this.isFillLinesArea) === 'undefined' && !this.multiLine) {
					this.isFillLinesArea = true;
				}
			},

			/**
			 * Called to render the Chart data labels. By default this method renders labels for the max and min values of a single axis Chart
			 */
			drawLabels: function drwlbls() {
					
				//No axis no labels
				if (!this.isDrawAxis) return;            	

				if (this._super) {
					this._super();
				}

				if(!this.drawXAxisLabels) return;
				
				//local vars
				var me = this,
					cat = me.model.categories,
					labels = cat.items,
					tp = cat.tp,
					utils = me.utils,
					mg = me.margin,
					l = labels.length,
					li = null,
					x = null,
					y = 0,
					lbl = null,
					ts = me.isTimeSeries,
					ctx = me.animationContext,
					dgl = me.drawGridLines;

				//reset previous lable settings
				var pxl = me.prevXLabel;
				pxl.x = 0;
				pxl.y = 0;
				pxl.w = 0;

				ctx.save();
				//set the context settings 
				ctx.strokeStyle = utils.getColor(me);
				ctx.lineWidth = 1;
				ctx.lineCap = 'round';
				ctx.globalAlpha = 0.5;

				//should draw only limited number of x labels for better performance currently using 6 max
				var totalLabels = l > me.maxXLabels ? me.maxXLabels : l;
				
				var xlblDiv = null;
				
				if(ts) {
					xlblDiv = document.createElement("div");
					me.xdiv = xlblDiv;

					totalLabels *= (me.animationCanvas.width/(me.getWidth() - mg.l - mg.r));
				} 
				
				if(me.rotateXLabels) {
					y = me.canvas.height + ROTATE_Y_ADJUST;
				} else {
					y =  me.canvas.height - PLAIN_Y_ADJUST;
				}
				
				var labInterval = Math.round(l / totalLabels);
				// interval can be zero in case of timeseries when diff btw rne and rns is less than maxXLabels
				if(labInterval === 0) {
					labInterval = 1;
				}
				
				var lw = Math.round(labInterval * me.RTX) - me.xLabelPadding;
					
				prevDate = null;
				var curPrevDate = {mn:0,dt:0,yr:0};
				
				for(var i = 0; i < l; i+=labInterval) {
					x = (i * me.RTX) + mg.l;
					var dtlbl = labels[i];
					if(ts && (tp.toString() === me.DSS_XML_BASE_FORM_DATE)) {
						dtlbl = me.getFormattedDateLabel(dtlbl, curPrevDate);
					}
					
					if (me.rotateXLabels) {
						lbl = utils.addLabel(me, dtlbl, x - ROTATE_X_ADJUST, y, null, true, pxl);
					} else {
						lbl = utils.addLabel(me, dtlbl, x, y, lw, false, pxl);
					}
					//only draw the line if Draw Vertical lines is true and label is added
					if(lbl) {
						if(dgl & me.drawVerticalGridLines) {
							prevDate = $H.clone(curPrevDate);
							utils.drawLineSet(me,[{x:x,y:me.canvas.height - mg.b},{x:x, y:mg.t}], false, ctx);
						}
					}
				}
				
				//TODO this code can be activated only if we want to draw vertical lines at the beginning and end
				/*if(me.isTimeSeries && me.scrollPast && (dgl & me.drawVerticalGridLines)) {
					//draw vertical lines at start at end
					for(var i = 0; i < l; i+= l -1) {
						x = (i * me.RTX) + mg.l;
						utils.drawLineSet(me,[{x:x,y:me.canvas.height - mg.b},{x:x, y:mg.t}], false, ctx);
					}
				}*/
				
				if(xlblDiv) {
					var tc = me.animationCanvas;
					me.itemsContainerNode.innerHTML = xlblDiv.innerHTML;
					me.itemsContainerNode.insertBefore(tc, me.itemsContainerNode.firstChild);
					me.xdiv = null;
				}
				
				ctx.restore();
			},

			/**
			 * This function will return the formatted date value.  If raw value is not date it returns
			 * the raw value
			 */
			getFormattedDateLabel: function getFormattedDateLabel(/*date string in milliseconds*/ val, /* object holding current date info*/cpv) {
				if(isNaN(val)) {
					return val;
				}
				
				var fVal = val;
				try {
					val = this.utils.convertRawValueToMilliseconds(val);
					var dt = new Date(Number(val));
					var mn = cpv.mn = mstrmojo.locales.datetime.MONTHNAME_SHORT[dt.getMonth()];
					var yr = cpv.yr = dt.getFullYear().toString().substring(2);
					cpv.dt = dt.getDate();
					
					if(!prevDate || (mn !== prevDate.mn && yr !== prevDate.yr)) {
						fVal = mn + " " + cpv.dt + " " + yr;
					} else if(mn !== prevDate.mn) {
						fVal = mn + " " + cpv.dt;
					} else {
						fVal = cpv.dt;
					}
				} catch(e) {
				}
				return fVal;
			},

			removeLabels: function rmvlbls() {
				if(this.isTimeSeries) {
					var tc = this.animationCanvas;
					this.itemsContainerNode.innerHTML = '';
					this.itemsContainerNode.appendChild(tc);
					this.domNode.getElementsByClassName('mstrmojo-chart-ylbl-div')[0].innerHTML = '';
				} else {
					if (this.domNode){
					var todel = this.domNode.getElementsByClassName('mstrmojo-Chart-lbl');
					for (var i = todel.length - 1; todel && i >= 0; i--) {
						todel[i].parentNode.removeChild(todel[i]);
					}
					}
				}
			},

			/**
			 * Called to highlight a single data point
			 * @param {Integer} [x] the x axis point to highlight
			 */
			highlightPoint: function hghlghtpnt(x, touchY) {

				//local vars
				var me = this,
				ctx = me.highlightContext,
				height = me.getHeight(),
				margin = me.margin,
				model = me.model,
				utils = me.utils,
				si = me.seriesIndex;

				// clear around the previous highlight
				var xcoord = (x * me.RTX) + margin.l;
				if (this.prevHighlight >= 0) {
					var prevXCoord = (this.prevHighlight * me.RTX) + margin.l;
					var PADDING = 10;
					var TOP_PADDING = 8;
					var y = margin.t-TOP_PADDING > 0 ?  margin.t-TOP_PADDING : 0; // fix for no margin on top
					ctx.clearRect(prevXCoord-PADDING, y , prevXCoord + PADDING, height - margin.b);					
				}		

				if (x < 0) return;

				var xcoord = (x * me.RTX) + margin.l;

				ctx.shadowBlur    = 5;
				ctx.shadowColor   = '#000';
				ctx.globalAlpha = 1;

				if(me.showHighlightLine) {
					// set colors
					ctx.strokeStyle = this.highlightColor;
					ctx.fillStyle = this.highlightColor;
					ctx.lineWidth = 2;
					ctx.lineCap = "round";				

					//draw the highlight
					utils.drawLineSet(me, 
							[ {x:xcoord, y:margin.t},
							  {x:xcoord, y:height - margin.b}
							], false, ctx);
				} else {
					ctx.strokeStyle = utils.getColor(me);
					ctx.fillStyle = ctx.strokeStyle;
				}

				var s = model.series,
				l = s.length,
				y = utils.getYValue(me, s[si].rv[x]);

				//position the highlight image
				if(!me.multiLine) {
					utils.drawArc(me, xcoord, y, 5, 0, Math.PI * 2, true, true, ctx);
				} else {
					if(me.showHighlightLine) {
						if(l > 1) {
							ctx.strokeStyle = this.chartLineColors[0];
							ctx.fillStyle = ctx.strokeStyle;
						}
						for(var i = 0; i < l; i++) {
							ctx.strokeStyle = this.chartLineColors[i % 6];
							if(i > 0) {
								ctx.fillStyle = ctx.strokeStyle;
							}
							y = utils.getYValue(me, s[i].rv[x]);
							utils.drawArc(me, xcoord, y, 5, 0, Math.PI * 2, true, true, ctx);
						}
					} else {
						if(l > 1) {
							ctx.strokeStyle = this.chartLineColors[si];
							ctx.fillStyle = ctx.strokeStyle;
						}
						utils.drawArc(me, xcoord, utils.getYValue(me, s[si].rv[x]), 5, 0, Math.PI * 2, true, true, ctx);
					}
				}
			},

			refreshChart: function refreshChart() {
				//clear animation and highlite canvas
				var height = this.getHeight(),
					width = this.getWidth();
				this.highlightContext.clearRect(0, 0, width, height);    
				this.animationContext.clearRect(0, 0, width, height);

				// remove labels
				this.removeLabels();

				// re-draw chart
				this.drawChart();

				// re-draw labels
				this.drawLabels();
			}
		}
	);

})();