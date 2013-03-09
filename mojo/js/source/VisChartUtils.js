(function(){

	var TEXTMARGIN = 5; //This is to put sapce from left side of chart when drawing label
	/**
     * Variable to control drawing start point arc
     */
	var D_S_P = 1;
	/**
     * Variable to control drawing end point arc
     */
	var D_E_P = 2;
	/**
	 * xiawang: This is used by MicroChart
	 * Variable to control drawing other point art
	 */
	var D_O_P = 4;
	
	var T_Z_A = 0;
	
	var needAdjust = true;
	
	/**
	 * Variable that contains total milliseconds in day
	 */
	var millisOnDay = 86400000;
	
	mstrmojo.VisChartUtils = mstrmojo.provide(
        "mstrmojo.VisChartUtils",
        /**
         * @lends mstrmojo.VisChartUtils
         */
        {
            /**
             *fills the canvas' base context with the theme color, adds a gloss gradient
             * @param {mstrmojo.VisChart} [widget] a reference to the Chart Widget
             */
            fillBackground: function fllBckgrnd(widget, width, height, context) {
            
                //local vars
                var cntx = context || widget.context,
                    wd = width || widget.canvas.width,
                    ht = height || widget.canvas.height,
                    themeColor = widget.themeColor,
                    gradient = cntx.createLinearGradient(0, 0, 0, ht / 2);
                
                cntx.save();
                
                if (widget.noBackground) {
                	// xiawang: if the widget says no background, do nothing
                } else if(!widget.isAndroid && !widget.isTimeSeries) {
                	//set context settings
                	cntx.fillStyle = themeColor;
                	cntx.fillRect(0, 0, wd, ht);

                	//add gloss

                	cntx.globalAlpha = 0.4;

                	gradient.addColorStop(0, '#fff');
                	gradient.addColorStop(0.1, '#fff');
                	gradient.addColorStop(1, themeColor);

                	cntx.fillStyle = gradient;
                	cntx.rect(0, 0, wd, ht / 2);
                	cntx.fill(); 


                	cntx.globalAlpha = 0.1;
                	cntx.fillStyle = '#fff';
                	cntx.fillRect(0, 0, wd, ht / 2);
                } else {
                	cntx.fillStyle = themeColor || '#000000'; // if theme color was not defined than use black as default
                	cntx.fillRect(0, 0, wd, ht);
                }
                
                cntx.restore();
                
            },

            /**
             * Draws a line given a privided array of points
             * @param {mstrmojo.VisChart} [widget] a reference to the Chart Widget
             * @param {Array} [lines] an array of points for the line to draw
             * @param {Boolean} [fill] indicates whether the line will be a closed polygon
             * @param {CanvasContext2D} [context] the context object to use 
             */
			drawLineSet: function drwlnst(widget, lines, fill, context) {
            
                //local vars
				var cntx = null,
					l = lines.length,
					li = null;

                //local context
                if (context) {
                    cntx = context;
                } else {
                    cntx = widget.context;
                }
            
                //begin the line, position the first point
				cntx.beginPath();
				var i = 0;
				while(i < l) {
					if(lines[i]) {
						cntx.moveTo(lines[i].x, lines[i].y);
						i++;
						break;
					}
					
					i++;
					
				}
				//#494324 If null points are sent do not lineTo next point but move to next point so that line is cut off and
				// not drawn between the points which contains null data in between.
				var skip = false;
				for(;i<l;i++) {
					li = lines[i];
					if(li) { // skip the points that are null
						if(!skip) {
							cntx.lineTo(li.x, li.y);
						} else {
							cntx.moveTo(li.x, li.y);
							skip = false;
						}
					} else {
						skip = true;
					}
				}
                
                //close polygon or open line
				if (fill) {
					cntx.closePath();
					cntx.fill();
				} else {
					cntx.stroke();
				}
			},
			
			/**
			 * Draws a rectangle given the given parameters
			 * @param  {mstrmojo.VisChart} [widget] a reference to the Chart Widget 
			 * @param x point on x axes
			 * @param y point on y axes
			 * @param w width of the rectangle
			 * @param h height of the rectangle
			 * @param {Boolean} [fill] indicates whether to just draw empty or filled rectangle.
			 * @param {CanvasContext2D} [context] the context object to use
			 */
			drawRectangle: function drwRect(widget, x, y, w, h, fill, context) {
				var cntx = null;

				//local context
				if (context) {
					cntx = context;
				} else {
					cntx = widget.context;
				}

				if(fill) {
					cntx.fillRect(x,y,w,h);
				} else {
					cntx.strokeRect(x,y,w,h);
				}
			},
			/**
			 * Draws an arc on the given context.  If context is not provided will draw on the base context
			 * @param {mstrmojo.VisChart} [widget] a reference to the Chart Widget
			 * @param x point on x axes
			 * @param y point on y axes
			 * @param radius radius of the arc we want to draw
			 * @param startAngle define the end point of the arc in radians
			 * @param endAngle define the end point of the arc in radians
			 * @param {Boolean} [anticlockwise] whether to draw arc anticlockwise or clockwise
			 * @param {Boolean} [fill] indicates whether to just draw empty or filled arc.
			 * @param {CanvasContext2D} [context] the context object to use
			 */
			drawArc: function drwArc(widget, x, y, radius, startAngle, endAngle, anticlockwise, fill, context) {
				var cntx = null;

				//local context
				if (context) {
					cntx = context;
				} else {
					cntx = widget.context;
				}
				
				cntx.beginPath();
				
				cntx.arc(x,y,radius,startAngle,endAngle,anticlockwise);
				
				if(fill) {
					cntx.fill();
				} else {
					cntx.stroke();
				}
				
			},
			
			/**
			 * computes if user wants to draw start or end point or both and draw accordingly.
			 * @param {mstrmojo.VisChart} [widget] a reference to the Chart Widget
			 * @param lines - array containing the x and y points for all the points 
			 * @param {CanvasContext2D} [context] the context object to use
			 * @param dp highlight start and end points.
             * 0 - No points
             * 1 - start point only
             * 2 - end point only
             * 3 - start and end points both {default}
             * 4 - draw other points only. other point means non-start and non-end points. added by xiawang
             * 7 - draw all point. added by xiawang
			 */
			drawStartEndPoints: function dsep(widget, lines, context, dp) {
				var l = lines.length;

				var cntx = null,
				r = widget.startEndPointRadius;

				//local context
				if (context) {
					cntx = context;
				} else {
					cntx = widget.context;
				}

				cntx.save();
				
				var spc = '#f0f43e',
					epc = '#f0f43e',
					opc = '#663300';
				
				if(widget.startPointColor) {
					spc = widget.startPointColor;
				}
				
				if(widget.endPointColor) {
					epc = widget.endPointColor;
				} else {
					// if end point is greater green color red otherwise based on y value of line so
					// higher the y smaller the value of y greater the point value.
					var	s = lines[0].y,
					h = lines[l -1].y;
					if( s > h) {
						epc = '#008000';
					} else if( s < h) {
						epc = '#8d1616';
					} else {
						epc = spc;
					}
				}

				if (widget.otherPointColor) {
					opc = widget.otherPointColor;
				}

				if(dp & D_S_P) {
					cntx.strokeStyle = spc;
					cntx.fillStyle = spc;
					// draw only the start point
					this.drawArc(this, lines[0].x, lines[0].y, r, 0, Math.PI * 2, true, true, cntx);
				}

				if(dp & D_E_P) {
					cntx.strokeStyle = epc;
					cntx.fillStyle = epc;
					this.drawArc(this, lines[l - 1].x, lines[l - 1].y, r, 0, Math.PI * 2, true, true, cntx);
				}
				
				if(dp & D_O_P) {
					cntx.strokeStyle = opc;
					cntx.fillStyle = opc;
					// xiawang: draw other point
					for (var i = 1; i < l -1; i ++) {
						this.drawArc(this, lines[i].x, lines[i].y, r, 0, Math.PI * 2, true, true, cntx);
					}
				}
				
				cntx.restore();
			},
			
            /**
             * returns the color used to draw lines and text. #000 or #fff depending on the theme color
             * @param {mstrmojo.VisChart} [widget] a reference to the Chart Widget
             */
			getColor: function gtclr(w) {
				return (parseInt(w.themeColor.substr(1), 16) > 0x7fffff) ? '#000000' : '#ffffff';
			},
			
            /**
             * draws an horizontal dotted line across the chart
             * @param {mstrmojo.VisChart} [widget] a reference to the Chart Widget
             * @param {Integer} [y] the y axis coordinate where the line will be drawn 
             */
            drawHighlightLine: function drwHghlghtln(w, y) {
				var ctx = w.context,
                    margin = w.margin,
					x1 = margin.l,
					x2 = w.getWidth() - margin.r;
				
				ctx.save();
                //set the context settings 
				ctx.strokeStyle = this.getColor(w);
				ctx.lineWidth = 1;
				ctx.lineCap = 'round';
				ctx.globalAlpha = 0.5;
				
                //create a dotted line by creating  separate paths
				while (x1 < x2) {
					ctx.beginPath();
					ctx.moveTo(x1, y);
					ctx.lineTo(++x1, y);
					ctx.stroke();
					x1 += 3;
				}

				ctx.restore();
			},

			
            /**
             * adds a data label to the chart on its y axis
             * @param {mstrmojo.VisChart} [widget] a reference to the Chart Widget
             * @param {String} [text] the label's text
             * @param {Integer} [x] the x axis coordinate
             * @param {Integer} [y] the y axis coordinate
             */            
			addLabel: function adDtLbl(w, text, x, y, width, rotate, prevLabel) {
                
				if (!w.domNode) return;
				//create an html div node
                var lbl = document.createElement("div");
                lbl.className = 'mstrmojo-Chart-lbl';
                lbl.innerHTML = text;
				
                if (width) {
                    lbl.style.width = width + 'px';
                }
                var node = null;
                var aWidth = 0;
                if(w.isTimeSeries) {
                	if(prevLabel.w >= 0) {
                		node = w.xdiv;
                		aWidth = w.animationCanvas.width;
                	} else {
                		node = w.domNode.getElementsByClassName('mstrmojo-chart-ylbl-div')[0];
                		if(!node) {
                			node = document.createElement("div");
                			node.id = 'mstrmojo-chart-ylbl-div';
                			node.className = 'mstrmojo-chart-ylbl-div';
                			node.style.backgroundColor = '#000000';
                			node.style.position = 'absolute';
                			w.domNode.appendChild(node);
                		}
                		node.style.width = w.margin.l - 1 + 'px';
                	}
                } else {
                	node = w.domNode;
                	aWidth = w.getWidth();
                }
                
                //append it to the Chart Widget's dom node
                //w.domNode.appendChild(lbl);
                node.appendChild(lbl);
                
                //TODO in case of rotate labels we need to calculate the x axis differently
                                
                //check for labels overlapping for X and Y axis depending of which one is being drawn
                var ht = lbl.offsetHeight || 22; // #498285 make the default height of label a little bigger
                
                var wd = width || lbl.offsetWidth || 100;
                
                var X_PAD = w.xLabelPadding/2;
                var Y_PAD = w.yLabelPadding/2;
                
                
                if(prevLabel.w >= 0) {
                	x = x - wd /2;
                }

                //overlap on Y axis
                if(prevLabel.h >= 0 && ((y >= prevLabel.y - Y_PAD && y <= prevLabel.y + prevLabel.h) ||
                		(y + ht >= prevLabel.y - Y_PAD && y + ht <= prevLabel.y + prevLabel.h) ||
                		(y + ht >= w.canvas.height - w.margin.b) )) {
                	node.removeChild(lbl);
                	return null;
                }

                //overlap on X axis
                if(prevLabel.w >= 0 && (((x >= prevLabel.x && x < prevLabel.x + prevLabel.w + X_PAD)) || x < prevLabel.x || x < w.margin.l || x + wd > aWidth)) {
                	node.removeChild(lbl);
                	return null;
                }
                
                //Now show the label at the correct position
                if(w.isTimeSeries && prevLabel.h >= 0) {
                	node.style.top = w.margin.t - ht/2 + 'px';
                	node.style.height = w.canvas.height - w.margin.t + ht/2 + 'px'; // #493113 do not subtract margin.b to extend the div height to the bottom to hide x-label divs underneath
                	this.translateCSS(x, (y - w.margin.t) + ht/2, rotate, lbl);
                } else {
                	this.translateCSS(x, y, rotate, lbl);
                	lbl.style.maxHeight = ht + 'px'; //#493077 temp fix for label to not show in two lines
                }
                
                //save the last label drawn positions
                prevLabel.x = x;
                prevLabel.y = y;
                if(prevLabel.h >= 0) {
                	prevLabel.h = ht;
                }
                if(prevLabel.w >= 0){
                	prevLabel.w = wd;
                	lbl.style.textAlign = 'center';
                }
                
                return lbl;                
			},
			
            /**
             * adds a data label to the chart on its y axis
             * @param {mstrmojo.VisChart} [widget] a reference to the Chart Widget
             * @param {String} [text] the label's text
             * @param {Integer} [y] the y axis coordinate
             */            
			addDataLabel: function adDtLbl(w, text, y, prevLabel) {
				var xText = (w.margin.l > w.margin.r) ? TEXTMARGIN : w.getWidth() - w.margin.r + TEXTMARGIN,
                    spaceAvailable = (w.margin.l > w.margin.r) ? w.margin.l : w.margin.r;
                //TODO y - 10 this is used to move the y label up to display
                return this.addLabel(w, text, xText, y - 10, spaceAvailable, false, prevLabel);
			},
            
			/**
			 * adds translate property to the given div element
			 * @param x point on x-axis
			 * @param y point on y-axis
			 * @param rotate  boolean to simply rotate by 45 degree or no rotation of div
			 * @param lbl  element that need be translated
			 */

			translateCSS: function trnlt(x, y, rotate, lbl) {
				if(rotate) {
                	lbl.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px) rotate(45deg)';
                	lbl.style.MozTransform = 'translate(' + x + 'px,' + y + 'px) rotate(45deg)';
                	lbl.style.msTransform = 'translate(' + x + 'px,' + y + 'px) rotate(45deg)';	
                } else {
                	lbl.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
                	lbl.style.MozTransform = 'translate(' + x + 'px,' + y + 'px)';
                	lbl.style.msTransform = 'translate(' + x + 'px,' + y + 'px)';
                }
			},
			
			//return the y value in the canvas given an x point
		    getYValue: function gyval(widget, point) {
		        var height = widget.canvas.height,
		            margin = widget.margin,
		            mvalues = widget.model.mvalues;
		        return height - margin.b - 2 - ((parseFloat(point) - mvalues[0]) * widget.RTY);
		    },
		    
		  //return the y value in the canvas given an x point
		    getMasterYValue: function getMasterYValue(widget, point, mm /*masterMargin*/) {
		        var height = widget.masterCanvas.height,
		            mvalues = widget.model.mvalues;
		        return height - mm.b - 2 - ((parseFloat(point) - mvalues[0]) * widget.MRTY);
		    },
		    
		    // returns the value of closest y point in the series
		    getSeriesIndexAndYValue: function gsiyv(w, x, touchY) {
		    	var s = w.model.series,
		    	l = s.length,
		    	si = 0;
				y = this.getYValue(w, s[si].rv[x]) || 0;
		    	var cp = touchY - y < 0 ? - (touchY - y) : touchY - y,
		    			pp = cp;
		    	for(var i = 1; i < l; i++) {
		    		var cy = this.getYValue(w, s[i].rv[x]) || 0;
		    		cp = touchY - cy < 0 ? - (touchY - cy) : touchY - cy;
		    		if(cp < pp) {
		    			y = cy;
		    			pp = cp;
		    			si = i;
		    		}
		    	}
		    	
		    	return {y:y, si:si};
		    },
            
		    getLabelWidthForMargin: function tsip(w, text) {
		    	var lbl = document.createElement("div");
                lbl.className = 'mstrmojo-Chart-lbl';
                lbl.innerHTML = text;
                                                
                //append it to the Chart Widget's dom node
                if (!w.domNode) return;
                w.domNode.appendChild(lbl);
                var wd = lbl.offsetWidth || 60;
                w.domNode.removeChild(lbl);
                return wd + TEXTMARGIN * 2;
		    },
		    
			animateLineSet: function anmtHLnSt(w, fromLines, toLines, cfg) {
                var lines = [],
                    x = w.animationContext,
                    l = toLines.length;
                 
                x.clearRect(0, 0, w.getWidth(), w.canvas.height);

                if (!cfg.index) {
                    cfg.index = 0;
                } else if (cfg.index >= cfg.rate) { // last time
                    this.drawLineSet(w, toLines, false, x);
                    w.drawLabels();
                    if(w.isFillLinesArea) {
                    	//fill the Lines area
                    	this.fillLinesArea(w,toLines.slice(0));
                    }
                    if(w.isDrawStartEndPoints) {
                    	this.drawStartEndPoints(w, toLines, x, w.isDrawStartEndPoints);
                    }
                    return;
                }
                    
                for (var i = 0; i < l; i++) {
                    var tli = toLines[i],
                        fli = fromLines[i];
                    lines[i] = {x:(cfg.index * (tli.x - fli.x) / cfg.rate) + fli.x, y:(cfg.index * (tli.y - fli.y) / cfg.rate) + fli.y};
                }

                this.drawLineSet(w, lines, false,  x);

                var me = this;
                cfg.index++;
                window.setTimeout(function() {
                    me.animateLineSet(w, fromLines, toLines,  cfg);
                }, 40);
                
			},
						
			//fill in the area below the lines
            fillLinesArea: function flA(w,area) {
				var hgt = w.canvas.height;

				area.push({x:w.getWidth() - w.margin.r, y:hgt - w.margin.b});
				area.push({x:w.margin.l, y:hgt - w.margin.b});
                
                var fillColor = new Array();
                if(w.fillinColor) {
                	mstrmojo.requiresCls("mstrmojo.color");
                	var g = mstrmojo.color.hex2rgb(w.fillinColor).join(',');
                	fillColor[0] = 'rgba(' +  g + ', 0.8)';
                	fillColor[1] = 'rgba(' +  g + ', 0.2)';
                } else {
                	fillColor = ['rgba(255,128,0,0.8)', 'rgba(255,128,0,0.2)'];
                }

                var ctx = w.animationContext;
                var g = ctx.createLinearGradient(0, 0, 0, hgt);

                g.addColorStop(0, fillColor[0]);
                g.addColorStop(0.75, fillColor[1]);
            
                ctx.fillStyle = g;
                this.drawLineSet(w, area, true, ctx);
            },
            
            convertRawValueToMilliseconds: function convertRawValueToMilliseconds(/*String*/val) {
            	if(needAdjust) {
            		var d = new Date().getTimezoneOffset() / 60;
            		if(d < 0) {
            			T_Z_A = 1;
            		}
            		needAdjust = false;
            	}
            	var daysSinceJan1st1900 = Number(val);
        		var realVal = daysSinceJan1st1900 - 25568 - T_Z_A;
        		var dt = new Date(realVal * millisOnDay);
        		return dt.getTime();
        	}
			
        });
        
})();