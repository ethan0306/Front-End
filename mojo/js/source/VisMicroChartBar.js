(function() {

	mstrmojo.requiresCls(
						"mstrmojo.VisChart"
						);
	
	
	mstrmojo.VisMicroChartBar = mstrmojo.declare(
			
			mstrmojo.VisChart,

			
			null,
			
			
			{
				 
				scriptClass: 'mstrmojo.VisMicroChartBar',

				
				isDrawAxis: false,

				
				margin:{t:0, r:2, b:0, l:5},

				
				showHighlightLine: false,

				
				themeColor: '#FFFFFF',
				
				
				noBackground: true, // There should be no background for microChart
				
				
				isAnimateLines: false,
				
				
				toolTipMain: null,
				
				labelLen: 0,
				
				mainWidth: 0,
				
				
				mainLeftPos: 0,
				
				markupString: '<div id="{@id}" class="mstrmojo-Chart {@cssClass}" style="width:{@width};height:{@height};top:{@top};left:{@left};position:relative;" ' +
				' mstrAttach:mousedown,mouseup,mousemove,click ' +                             
				'><canvas width="{@width}" height="{@height}"></canvas>' + 
				'<canvas style="position:absolute;left:0;top:0" width="{@width}" height="{@height}"></canvas>' + 
				'<canvas style="position:absolute;left:0;top:0" width="{@width}" height="{@height}"></canvas>' +
				'<div style="position:absolute;left:0px;top:0px;padding-left:5px;padding-top:1px;text-align:left;"></div>' +
				'<div style="position:absolute;left:0px;bottom:0px;padding-left:5px;padding-bottom:1px;text-align:left;"></div>' +
				'</div>',

				/**
				 * @ignore
				 */
				markupSlots: {
					//the main canvas of the Chart
					canvas: function(){ return this.domNode.firstChild; },
					animationCanvas: function(){ return this.domNode.childNodes[1]; },
					highlightCanvas: function(){ return this.domNode.childNodes[2]; },
					minLabel: function(){ return this.domNode.childNodes[3];},
					maxLabel: function(){ return this.domNode.childNodes[4];}
				},
				
				postBuildRendering: function postBR() {
					if (this._super) {
						this._super();
					}
					//draw bar when size == 1, TQMS 531674
					this.windowSize = this.model.series[0].rv.length;
	                if(this.windowSize == 1) {
	                	this.plot();
	                }
	                
				},
				//since this is singleton, so comment this member
				//barProps: null, // xiawang: put bar properties to object top level for universal access

				
				showTooltip: function rndrttp(pageX, pageY) {
					if(!this.config.mbShowTooltip) {
						return;
					}
					
					var pos = mstrmojo.dom.position(this.domNode, true);
					var touchX = pageX - pos.x;
					var touchY = pageY - pos.y;
					var model = this.model;
					var barProps = this.config;
					series = model.series[0];
					categories = model.categories.items,
					
					width = this.getWidth();
					if (touchX <= this.labelLen + 1) {
						return;
					}
					if (touchX >= width - 1) {
						return;
					}
					var highLightCav = document.getElementById("highLightCav" + this.widget.domNode.id);
					if(highLightCav) {
						var highlightCt = highLightCav.getContext('2d');
                		highLightCav.id = "";
                		highlightCt.clearRect(0, 0, 1000, 1000);
					}
					var metrics = model.mtrcs;
					metrics = metrics.items;
					var ttp = this.toolTipMain;
					var ind = 0;
					for (var i = 0; i < series.v.length; i++) { // xiawang: use real bar position to decide show which bar
						if (touchX < this.hightLightPos[i].x) {
							if (i === 0) {
								ind = i;
							} else {
								ind = (this.hightLightPos[i].x + this.hightLightPos[i - 1].x)/2 > touchX? (i - 1): i;
							}
							break;
						}
					}
					if (i === series.v.length) {
						ind = i - 1;
					}
					var vl = series.rv[ind] * 1.0;
					var tColor = barProps.mwPosCol;
					if(vl < 0) {
						tColor = barProps.mwNegCol;
					}
					touchX = Math.round(this.hightLightPos[ind].x);
					touchY = Math.round(this.hightLightPos[ind].y);
					var ofht = 34;
					var line1 = model.categories.tn + ": " + categories[ind];
					if(isNaN(this.kpiOffset)) {
						this.kpiOffset = 0;
					}
					var line2 = metrics[this.kpiOffset] + ": " + series.v[ind];
					
					var maxLength = this.widget.getTextWidth(line1, "Arial", 10);
					var leng2 = this.widget.getTextWidth(line2, "Arial", 10);
					if(leng2 > maxLength) {
						maxLength = leng2;
					}
					var domHtml =  line1 + '<br/>' + line2;
	
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
					var posWdt = mstrmojo.dom.position(this.widget.domNode, true);

					var maxWidth = maxLength + 10;
					ttp.style.display = 'block';
					ttp.style.borderColor = tColor;
					ttp.style.width = maxWidth + "px";

					var topOff = (touchY + pos.y - posWdt.y - ofht - 29);
					if(topOff < 0) {
						topOff = 0;
					}
					var leftOff = (oft.left + touchX + maxWidth + 20);
					if(leftOff > this.widget.getWidth()) {
						leftOff = (touchX + oft.left  - maxWidth - 20);
						if(leftOff < 0) {
							leftOff = 0;
						}
					} else {
						leftOff -= maxWidth;
					}
					ttp.style.display = 'none';
					ttp.style.top = (topOff) + "px";
					ttp.style.left = (leftOff) + "px";
					ttp.style.display = 'block';
					var ctx = this.highlightContext,
					height = this.getHeight(),
					utils = this.utils;
					
					
					ctx.clearRect(0, 0, width, height);
					ctx.globalAlpha = 1;

					touchX = touchX > 5 ? touchX : 5;
					if(touchX > width - 5) {
						touchX = width - 5;
					}
					touchY = touchY > 5 ? touchY : 5;
					if(touchY > height - 5) {
						touchY = height - 5;
					}
					ctx.globalAlpha = 0.8;
					ctx.strokeStyle = "FFFFFF";
					ctx.fillStyle = ctx.strokeStyle;
					utils.drawArc(this, touchX, touchY, 5, 0, Math.PI * 2, true, true, ctx);

					ctx.strokeStyle = tColor;
					ctx.fillStyle = ctx.strokeStyle;

					ctx.globalAlpha = 1.0;
					utils.drawArc(this, touchX, touchY, 5, 0, Math.PI * 2, true, false, ctx);
					utils.drawArc(this, touchX, touchY, 2.5, 0, Math.PI * 2, true, true, ctx);
					this.highlightCanvas.id = "highLightCav" + this.widget.domNode.id;
				},
				
				textLen: function txtLn(str) {
					// xiawang: this method should be obsolted because we can use context.measureText() method to measure text which are more accurate
					var len = 0;     
				    for (var i = 0; i < str.length; i++) {     
				        if (str.charCodeAt(i) > 255 || str.charCodeAt(i<0)) len += 2; else len ++;     
				    }     
				    return len;  
				},
				
				handleTouchMove: function () {
					// xiawang: do nothing. Just disable parent class method.
				},
				
				drawChart: function drwchrt() {
					var model = this.model;
					var barProps = this.config;
					if(model.err) {
						return;
					}

					
					var context = this.context,
					values = model.series,
					height = this.getHeight(),
					width = this.getWidth(),
					me = this,
					utils = this.utils;
					var barOffset = 0;
					var barPadLeft = this.margin.l;
					var barPadRight = this.margin.r;
					
					var min = 0,
						max = 0,
						minLabel = maxLabel = "",
						series = model.series[0];
					
					for (var i = 0; i < series.v.length; i ++) {
						var vl = series.rv[i] * 1.0;
						if (i === 0) {// for the first element, set max and min
							max = min = vl;
							minLabel = maxLabel = series.v[i];
						} else if(vl > max) {
							max = vl;
							maxLabel = series.v[i];
						} else if(vl < min) {
							min = vl;
							minLabel = series.v[i];
						}
					}
					if (barProps.mbShowLegend) { // xiawang: do not show the legend if not told to
						var fontSize = Math.ceil(Math.min(12, (height / 2) * 0.7)) + "px";  // xiawang: original is 13px, change to match Flash behavior
						var mintxt = "Min:" + minLabel.replace(/[ ]/g, "");
						var maxtxt = "Max:" + maxLabel.replace(/[ ]/g, "");
						
						this.minLabel.innerHTML = mintxt;
						this.minLabel.style.fontSize = fontSize;
						this.maxLabel.innerHTML = maxtxt;
						this.maxLabel.style.fontSize = fontSize;
						
						var minTxtLen = this.minLabel.offsetWidth;
						var maxTxtLen = this.maxLabel.offsetWidth;
						var txtLen = minTxtLen > maxTxtLen? minTxtLen: maxTxtLen; // get the maximum text length
						barOffset = txtLen + barPadLeft;
					} else {
						barOffset = barPadLeft;
					}
					
					this.labelLen = barOffset;
					
					// xiawang: process the reference value. This might need result in adjust of min/max value
					if(this.refv && this.refv.length > 1 && barProps.mbRefLine) {
						var refValue = this.refv[1].rv * 1.0;
						if(refValue < min) {
							min = refValue;
						}
						if(refValue > max) {
							max = refValue;
						}
					}
					// xiawang: processs the base line
					var ts = max - min;
					var baseY = 0;
					var barPadTop = 5;
					var barPadBottom = 5;
					var rangeRatio = height - barPadTop - barPadBottom; // use rangeRatio to universally calculate the printed height
					if (ts == 0) { // xiawang: consider the case when max == min or any value is undefined
						if (min == 0) {
							baseY = height / 2;
							rangeRatio = 0;
						} else {
							rangeRatio /= Math.abs(max);
							if (max < 0) {
								baseY = barPadTop;
							} else {
								baseY = height - barPadBottom;
							}
						}
					} else if(max < 0) {
						baseY = barPadTop;
						rangeRatio /= Math.abs(min);
					} else if (min < 0) {
						baseY = max / ts * rangeRatio + barPadTop;
						rangeRatio /= ts; 
					} else { // both are larger than 0
						baseY = height - barPadBottom;
						rangeRatio /= max;
					}
					
					
					// xiawang: draw each value bar
					// xiawang: TQMS 532258, Change the bar size to smaller. We should also be more smart to decide position and size of each bar to make it looks symmetric
					var barTotalWidth = width - barOffset - barPadRight;
					var barCount = series.v.length;
					var barSpaceWidth = barTotalWidth * 0.4 / barCount; // allocate 40% for space
					barSpaceWidth = barSpaceWidth >= 1? barSpaceWidth: 1; // space at least 1
					var barWidth = barTotalWidth / barCount - barSpaceWidth;
					this.hightLightPos = [];
					for(var i = 0; i < barCount; i ++) {
						this.hightLightPos[i] = {};
						var vl = series.rv[i] * 1.0;
						var direct = true;
						if(vl < 0) {
							vl = 0 - vl;
							direct = false;
						}
						//console.log("data value: " + vl);
						var hgt = vl * rangeRatio;
						//console.log("data height: " + hgt);
						var cw = (width - barOffset) / series.v.length;
						this.drawBar(barOffset + (barWidth + barSpaceWidth) * i + barSpaceWidth / 2, baseY, barWidth, hgt, context, direct, this.hightLightPos[i]);
					}
					
					// xiawang: draw the base line
					context.lineWidth = 1;
					if (context.lineWidth % 2 === 1) {
						baseY = Math.round(baseY + 0.5) - 0.5; // xiawang: To remove the alias effect when the line width is 1 pixel
					}
					context.beginPath();
					context.moveTo(barOffset, baseY);
					context.lineTo(width - barPadRight, baseY);
					context.stroke();
					
					// xiawang: draw the reference line
					if(this.refv && this.refv.length > 1 && barProps.mbRefLine) {
						var refValue = this.refv[1].rv * 1.0;
						var refH = baseY - refValue * rangeRatio;
						//console.log("reference value: " + refValue);
						//console.log("reference height: " + refH);
						if (context.lineWidth % 2 === 1) {
							refH = Math.round(refH + 0.5) - 0.5; // xiawang: To remove the alias effect when the line width is 1 pixel
						}
						context.beginPath();
						context.moveTo(barOffset, refH);
						context.lineTo(width - barPadRight, refH);
						context.strokeStyle = barProps.mwRefLineCol;// TQMS 533746
						context.stroke();
					}
				},
				
				drawBar: function drwBr(x, y, width, height, context, direct, posStore) {
					/*
					 *  xiawang: TQMS 532210 As PM said, remove the gradient effect currently to match Flash behavior
					 *  
					var lingrad = context.createLinearGradient(x,y,x+width,y);
					lingrad.addColorStop(0, '#66CC00');
				    lingrad.addColorStop(0.5, '#CCFFFF');
				    lingrad.addColorStop(0.5, '#CCFFFF');
				    lingrad.addColorStop(1, '#66CC00');
				    context.fillStyle = lingrad;
				    */
					
					// xiawang: to remove anti-alias effect, we need to make sure the x, y, width and height are all integers.
					if (width >= 3) { // xiawang: only remove anti-alias effect if the width is larger than 3
						x = Math.round(x);
						y = Math.round(y);
						width = Math.round(width);
					}
					if (height != 0) {
						height = Math.round(height);
						if (height < 1) { // xiawang;TQMS 531982;draw the bar chart for at least 1 pixel even if the metric value is very small 
							height = 1;
						}
					}
					
				    if(direct) {
				    	context.fillStyle = this.config.mwPosCol;
				    	context.fillRect(x,y - height,width,height);
				    	posStore.x = x + Math.round(width / 2.0);
				    	posStore.y = y - height;
				    } else {
				    	context.fillStyle = this.config.mwNegCol;
				    	context.fillRect(x,y,width,height);
				    	posStore.x = x + Math.round(width / 2.0);
				    	posStore.y = y + height;
				    }
				}
			}
	);	

})();