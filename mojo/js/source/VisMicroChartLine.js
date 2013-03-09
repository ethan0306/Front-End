(function() {

	mstrmojo.requiresCls(
						"mstrmojo.VisChart"
						);
	
	
	mstrmojo.VisMicroChartLine = mstrmojo.declare(
			
			mstrmojo.VisChart,

			
			null,
			
			
			{
				 
				scriptClass: 'mstrmojo.VisMicroChartLine',

				
				isDrawAxis: false,

				
				margin:{t:3, r:0, b:1, l:0},

				
				showHighlightLine: false,

				
				themeColor: '#FFFFFF',
				
				
				noBackground: true, // There should be no background for microChart
				
				
				isAnimateLines: false,
				
				
				toolTipMain: null,
				
				
				mainWidth: 0,
				
				
				mainLeftPos: 0,
				
				
				otherPointColor: "#663300", // This is used to represent color settings for those points which are not start or end point. Value is fixed. Copied from Flash side code
				
				/**
				 * radius of the circle we draw on start and end points
				 */
				startEndPointRadius: 5,

				/**
				 * defines the color we want to display on the start point
				 * color should be in the '#ffffff' format
				 */
				startPointColor: "#000000", // this property is fixed. Copied from Flash settings.

				/**
				 * defines the color we want to display on the end point
				 * color should be in the '#ffffff' format
				 */
				endPointColor: "#FF0000" , // this property is fixed. Copied from Flash settings.

				drawChart: function drwchrt() {
					var lineProps = this.config;
					var context = this.context;
					var model = this.model;
					var values = model.series;
					var mvalues = model.mvalues;
					var margin = this.margin;
					var height = this.getHeight();
					var width = this.getWidth();
					var utils = this.utils;
					var maxVR = mvalues[mvalues.length - 1]; // this is the max value for values including reference value
					var minVR = mvalues[0]; // this is the min value for values including reference value
					
					// calculate reference line value
					if (this.refv && this.refv.length > 1 && lineProps.mbRefLine) {
						var refValue = this.refv[1].rv * 1.0;
						// xiawang;TQMS 531977;if the mvalues[] array has length 1, we can't just substitue it with maxVR or minVR;
						if(refValue > maxVR) {
							maxVR = refValue;
							if (mvalues.length === 1) {
								mvalues[1] = maxVR;
							} else {
								mvalues[mvalues.length - 1] = maxVR;
							}
						}
						if(refValue < minVR) {
							minVR = refValue;
							if (mvalues.length === 1) {
								mvalues[1] = mvalues[0];
								mvalues[0] = maxVR;
							} else {
								mvalues[0] = minVR;
							}
						}
					}
					this.themeColor = lineProps.mwRefAreaCol;
					this.isDrawStartEndPoints = lineProps.mbEndPoints;
					
					// set the begin, end, all point values. Please refer to VisChartUtils.js::drawStartEndPoints  for help
					this.isDrawStartEndPoints = lineProps.mbAllPoints? 7: (lineProps.mbEndPoints? 3: 0);
					this.startEndPointRadius = 2;
					if (this.isDrawStartEndPoints & 1) {
						this.margin.l = this.startEndPointRadius;
					}
					if (this.isDrawStartEndPoints & 2) {
						this.margin.r = this.startEndPointRadius - 1; // xiawang: there seems to be an offset when draw the chart. so we minus extra 1 for the right margin
					}
					
					var model = this.model;
					if(model.err) {
						return;
					}
					
					if (!values) return; 
					
					// xiawang: handle the case of divide by zero
					if (maxVR !== minVR) {
						this.RTY = (height - margin.t - margin.b - 2) / (maxVR - minVR);
					} else {
						this.RTY = 0;
					}
					if (this.windowSize !== 1) {
						this.RTX = (width - margin.l - margin.r - 1) / (this.windowSize - 1);
					} else {
						this.RTX = 0;
					}
					// calculate the lines and max/min Y values
					var lines = [];
					var k = 0;
					var maxYValue = undefined;
					var minYValue = undefined;
					for (var i = 0; i < this.windowSize; i++) {
						var val = values[0].rv[i];
						if(val.length === 0) continue;
						var x = (i * this.RTX) + margin.l;
						var y = utils.getYValue(this, val);
						lines[k] = {x:x, y:y};
						if (k === 0) {
							maxYValue = minYValue = y;
						}
						if (y < minYValue) {
							minYValue = y;
						} else if (y > maxYValue) {
							maxYValue = y;
						}
						k++;
					}
					if (maxYValue === undefined || minYValue === undefined) { // if either maxYValue or minYValue is unset, default to draw the whole chart
						maxYValue = width - margin.b;
						minYValue = margin.t;
					}
					// draw the background. According to spec and TQMS 531508, the background only between maxV and minV
					if (lineProps.mbRefArea) {
						context.fillStyle = this.themeColor;
						context.fillRect(0, minYValue, this.width, maxYValue - minYValue);
					}
					// draw the lines
					context.lineCap = 'round';
					context.lineWidth = 1;
					context.lineJoin = 'round';
					context.strokeStyle = lineProps.mwSeriesLineCol;
					
					utils.drawLineSet(this, lines, false, context);
					
					// draw the start and end points
					if(this.isDrawStartEndPoints ) {
						utils.drawStartEndPoints(this, lines, context, this.isDrawStartEndPoints);
					}
					
					// draw the reference line
					if(this.refv && this.refv.length > 1 && lineProps.mbRefLine) {
						var refValue = this.refv[1].rv * 1.0;
						var y = this.utils.getYValue(this, refValue);
						if(isNaN(y)) {
							y = height - 5;
						}
						if (context.lineWidth % 2 === 1) {
							y = Math.round(y + 0.5) - 0.5; // xiawang: To remove the alias effect when the line width is 1 pixel
						}
						context.beginPath();
						context.moveTo(0, y);
						context.lineTo(width, y);
						context.strokeStyle = lineProps.mwRefLineCol;
						context.stroke();
					}
				},
				
				/**
				 * Called to highlight a single data point
				 * @param {Integer} [x] the x axis point to highlight
				 */
				highlightPoint: function hghlghtpnt(x, touchY) {

					var me = this,
					ctx = me.highlightContext,
					height = me.getHeight(),
					width = me.getWidth(),
					margin = me.margin,
					model = me.model,
					utils = me.utils;
					
					
					ctx.clearRect(0, 0, width, height);

					if (x < 0) return;
					
					var xcoord = (x * me.RTX) + margin.l;

					ctx.globalAlpha = 1;
					
					ctx.strokeStyle = this.config.mwSeriesLineCol;
					ctx.fillStyle = ctx.strokeStyle;
					
					var y = utils.getYValue(me, model.series[0].rv[x]);

					if(xcoord < 5) {
						xcoord = 5;
					}
					if (xcoord > width - 5) {
						xcoord = width - 5;
					}
					if(y < 5) {
						y = 5;
					}
					if (y > height - 5) {
						y = height - 5;
					}
					ctx.strokeStyle = "FFFFFF";
					ctx.fillStyle = ctx.strokeStyle;
					ctx.globalAlpha = 0.8;
					utils.drawArc(this, xcoord, y, 5, 0, Math.PI * 2, true, true, ctx);
					
					ctx.strokeStyle = this.config.mwSeriesLineCol;
					ctx.fillStyle = ctx.strokeStyle;
					ctx.globalAlpha = 1.0;
					utils.drawArc(me, xcoord, y, 5, 0, Math.PI * 2, true, false, ctx);
					utils.drawArc(me, xcoord, y, 2.5, 0, Math.PI * 2, true, true, ctx);
					this.highlightCanvas.id = "highLightCav" + this.widget.domNode.id;
				},
				
				renderTooltip: function rndrttp(valIndex, touchX, touchY) {
					if (valIndex < 0) {
						this.toolTipMain.style.display = 'none';
						return;
					}

					var highLightCav = document.getElementById("highLightCav" + this.widget.domNode.id);
					if(highLightCav) {
						var highlightCt = highLightCav.getContext('2d');
                		highLightCav.id = "";
                		highlightCt.clearRect(0, 0, 1000, 1000);
					}

					var m = this.model, 
						s = m.series,
						utils = this.utils,
						l = s.length,
						si = this.seriesIndex,
						ch = m.colHeaders,
						rh = this.baseModel.rowHeaders,
						ttp = this.toolTipMain;

					var me = this,
					ctx = me.highlightContext,
					height = me.getHeight(),
					width = me.getWidth(),
					margin = me.margin,
					utils = me.utils;
					

					var metrics = m.mtrcs;
					metrics = metrics.items;
					if(isNaN(this.kpiOffset)) {
						this.kpiOffset = 0;
					}
					var sn = ''; 

					var ofht = 34;
					var line1 = m.categories.tn + ': '+ m.categories.items[valIndex];
					var line2 = metrics[this.kpiOffset] + ": " + s[0].v[valIndex];
					
					var relx = (valIndex * me.RTX) + margin.l;
					var rely = utils.getYValue(me, s[0].rv[valIndex]);

					var maxLength = this.widget.getTextWidth(line1, "Arial", 10);
					var leng2 = this.widget.getTextWidth(line2, "Arial", 10);
					if(leng2 > maxLength) {
						maxLength = leng2;
					}
					
					var domHtml = line1 + '<br/>' + line2;

					if(this.refv && this.refv.length > 1 && this.config.mbRefLine) {
						domHtml += "<br/>";
						var line3 = metrics[this.kpiOffset + 1] + ": " + this.refv[1].v;
						var leng3 = this.widget.getTextWidth(line3, "Arial", 10);
						if(leng3 > maxLength) {
							maxLength = leng3;
						}
						domHtml += line3;
						ofht += 17;
					}
					ttp.innerHTML = '<div style="margin-left:5px;margin-bottom:4px;margin-top:5px;">' + domHtml + "</div>";
					
					var oft = mstrmojo.boxmodel.offset(this.domNode, this.widget.domNode);
					var pos = mstrmojo.dom.position(this.domNode, true);
					var posWdt = mstrmojo.dom.position(this.widget.domNode, true);
					var maxWidth = maxLength + 10;
					ttp.style.display = 'block';
					ttp.style.borderColor = this.config.mwSeriesLineCol;
					ttp.style.width = maxWidth + "px";
					
					
					var topOff = (rely + pos.y - posWdt.y - ofht - 29);
					if(topOff < 0) {
						topOff = 0;
					}
					var leftOff = (oft.left + relx + maxWidth + 20);
					if(leftOff > this.widget.getWidth()) {
						leftOff = (relx + oft.left  - maxWidth - 20);
						if(leftOff < 0) {
							leftOff = 0;
						}
					} else {
						leftOff -= maxWidth;
					}

					ttp.style.top = topOff + "px";
					ttp.style.left = leftOff + "px";
					
					var yadjust = this.mainOffsetTop === 0 ? ttp.offsetHeight + 20 : (2 * ttp.offsetHeight) + 30; 
					var yPos = utils.getYValue(this, s[si].rv[valIndex]) -  yadjust + this.offsetTop;
					if(yPos < 0) {
						yPos = 0;
					}
					
					
					if(this.mainWidth > 0) {
						var xposr = touchX + ttp.offsetWidth + this.offsetLeft - this.mainLeftPos;
						if(xposr > this.mainWidth) {
							touchX -= (xposr - this.mainWidth);
						}
					}
					
				},
				
				showTooltip: function handleTouchMove(touchX, touchY) {
					if(!this.config.mbShowTooltip) {
						return;
					}
					var me = this,
					m = me.model;
				
					if (!browserSupportsHtml5) {
						return;
					}
	
					var pos = mstrmojo.dom.position(this.domNode, true);
					touchX = touchX - pos.x;
					touchY = touchY - pos.y;
	
					var margin = me.margin;
	
					
					if(touchX < margin.l || touchY < margin.t || touchY > me.canvas.height - margin.b) {
						return;
					}
	
					
					var touchVal = me.getTouchValue(touchX,touchY);
	
					
					if (touchVal !== null) {
	
	
						var x = (touchVal * me.RTX) + margin.l;
	
						
						var rns = (m.rne - m.rns > 1) ? m.rns : m.rns - 1;
	
						
						if(me.seriesIndex === -1 || me.switchSeriesOnTouch) {
							me.seriesIndex = me.utils.getSeriesIndexAndYValue(me, rns + touchVal, touchY).si;
						}
	
						
						if(m.series[me.seriesIndex].rv[rns + touchVal] === "") {
							return;
						}
						
						
						me.prevHighlight = me.currentHighlight;
	
						
						me.currentHighlight = touchVal;
	
						
						me.renderTooltip(touchVal, x, touchY);
						me.highlightPoint(touchVal, touchY);
					}
				}

			}
	);

})();