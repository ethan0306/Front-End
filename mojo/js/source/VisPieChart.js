
(function() {

	mstrmojo.requiresCls("mstrmojo.Vis",
						 "mstrmojo.VisChartUtils",
						 "mstrmojo.boxmodel"
						 );

	function HexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
	function HexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
	function HexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
	
	var timeoutID = null;
	var isDone = false;

	function createGradient(sc,ec,steps){
		var start = {};
		start.r = HexToR (sc);   
		start.g = HexToG (sc);  
		start.b = HexToB (sc);  
		
		var end = {};
		end.r = HexToR (ec);    
		end.g = HexToG (ec);  
		end.b = HexToB (ec);  

		var colors = [];
		var range = steps -1;
		for (var i = 0; i < steps; i++) {
			var j = range - i;
			var c = {};
		    c.r = Math.round(((start.r * j)+ (end.r * i)) / range);
		    c.g = Math.round(((start.g * j) + (end.g * i)) / range);
		    c.b = Math.round(((start.b * j) + (end.b * i)) / range);
		    colors[i] = 'rgb('+ c.r + ','+ c.g + ','+c.b+')';
		}
		
		return colors;
		
	}
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
			return Number(val).toFixed(2);
		}
		return val;
	}
	
	/**
	 * A Chart widget
	 * 
	 * @class
	 * @extends mstrmojo.Widget
	 */
	mstrmojo.VisPieChart = mstrmojo.declare(
			// superclass
			mstrmojo.Vis,
			// mixins
			null,
					/**
					 * @lends mstrmojo.VisPieChart.prototype
					 */
			{
				/**
				 * @ignore
				 */
				scriptClass: 'mstrmojo.VisPieChart',
				
				colors: [],
				
				animate: false,
				
				margin: "0px 0px 0px 0px",

				/**
				 * @ignore
				 */
				utils: mstrmojo.VisChartUtils,                        
	
				/**
				 * The list of items to display.
				 * 
				 * @type Array
				 */
				pieChartData: [],
				
				data: [],
				
				prevdata: [],
				
				Labels : [],
				
				selectedRectIndex: null,

				/**
				 * To remember the previous Y label co-ordinates to make sure it does not overlap
				 */
				prevYLabel: {x:0, y:0, h:0},

				/**
				 * To remember the previous X label co-ordinates to make sure it does not overlap
				 */
				prevXLabel: {x:0, y:0, w:0},

				/**
				 * The width of the Chart Widget
				 * @type Integer
				 */
				width: 800,

				/**
				 * The height of the Chart Widget
				 * @type Integer
				 */
				height: 350,

				/**
				 * @ignore
				 */
				context: null,

				/**
				 * The color used as the background of the Chart. It is also used to determine the color of the lines.
				 * @type String
				 */
				themeColor: '#000000',
				
				tooltipOn: false,
				isHighlightOnTouch: true,

				/**
				 * Widget offset in pixels
				 */
				offsetLeft: null,
				browserSupportsHtml5: true,
				
				/**
				 * @ignore
				 */
				markupString: '<div id="{@id}" class="mstrmojo-PieChart {@cssClass}" style="width:{@width}px;height:{@height}px;position:relative;{@cssText};margin:{@margin}" ' +
				' mstrAttach:mousedown,mouseup,mousemove,click ' +                             
				'><canvas style="position:absolute;left:0;top:0" width="{@width}px" height="{@height}px"></canvas>' + 
				'<canvas style="position:absolute;left:0;top:0" width="{@width}px" height="{@height}px"></canvas>' + 
				'<div id="{@id}-tooltip" class="mstrmojo-Chart-tooltip"></div>' + 
				'<div id="{@id}-legend" class="mstrmojo-PieChart-legend"></div>' + 
				'</div>',

				/**
				 * @ignore
				 */
				markupSlots: {
					//the main canvas of the Chart
					canvas: function(){ return this.domNode.firstChild; },
					highlightContext: function(){ return this.domNode.childNodes[1]; },
					//the tooltip display when highlighting points
					tooltip: function(){ return this.domNode.childNodes[2];},
					legend: function(){ return this.domNode.childNodes[3];}
				},

				/**
				 * @ignore
				 */
				postBuildRendering: function postBR() {
					if (this._super) {
						this._super();
					}
					browserSupportsHtml5 = this.canvas.getContext; 
	                if (!browserSupportsHtml5) {
	                	alert('This browser does not support HTML5');
	                	return;
	                }
	                
					//cache the different canvas' context objects in the Widget
					this.context = this.canvas.getContext('2d');	
					this.highlightContext = this.highlightContext.getContext('2d');
					this.highlightContext.lineWidth = 2;
					
					if (this.colors.length == 0){
						for (var i = 0; i < this.pieChartData.length; i++) {
							this.colors.push('#'+Math.floor(Math.random()*16777215).toString(16));
						}
					}
					
					//trigger the Chart's plot method
					this.drawChart();
				},
				
				update: function update(node) {
					if (this._super) {
						this._super();
					}
					
				},

				/**
				 * draw the actual chart lines/bars
				 */
				drawChart: function drwchrt() {
					function deepCopy(obj) {
						if (Object.prototype.toString.call(obj) === '[object Array]') {
							var out = [], i = 0, len = obj.length;
							for ( ; i < len; i++ ) {
								out[i] = arguments.callee(obj[i]);
							}
							return out;
						}
						if (typeof obj === 'object') {
							var out = {}, i;
							for ( i in obj ) {
								out[i] = arguments.callee(obj[i]);
							}
							return out;
						}
						return obj;
					}
			
					function getTotal(d) { 
						var t = 0;
						for (var j = 0; j < d.length; j++) 
						{ 
							t += (typeof d[j] == 'number') ? d[j] : 0; 
						} 
						return t; 
					}
					
					ctx = this.context;
					centerX = this.width/2
					centerY = this.height/2
					radius = Math.min(centerX,centerY);
					
					var t = getTotal(this.pieChartData);  
					
					var lastend = 0;

					for (var i = 0; i < this.pieChartData.length; i++) 
					{ 
						this.data[i] = {};
						this.data[i].v = this.pieChartData[i];
						this.data[i].arc1 = lastend;
						this.data[i].arc2 = lastend+(Math.PI*2*(this.pieChartData[i]/t));
						lastend += Math.PI*2*(this.pieChartData[i]/t); 
					} 	
					this.highlightContext.clearRect(0,0,this.width,this.height);
					ctx.clearRect(0,0,this.width,this.height);
					var me = this;
					if (this.prevdata.length == 0) {
					for (var i = 0; i < this.data.length; i++) 
						{ 
							this.prevdata[i] = {};
							this.prevdata[i].arc1 = 0;
							this.prevdata[i].arc2 = 0;
						} 	
					}
					
					if (!this.animate){
						for (var i = 0; i < this.data.length; i++) 
						{
							ctx.fillStyle = this.colors[i%this.colors.length]; 
							ctx.beginPath(); 
							ctx.moveTo(centerX,centerY); 
							ctx.arc(centerX,centerY,radius,this.data[i].arc1,this.data[i].arc2,false);
							ctx.lineTo(centerX,centerY); 
							ctx.fill(); 

						} 	
					}else{

					//if we have previous data, draw the old one and animate to new one.
					if (this.prevdata.length != 0) {
						for (var i = 0; i < this.data.length; i++) 
						{ 
							if (this.prevdata[i].arc1Increment === undefined){
								this.prevdata[i].arc1Increment = (this.data[i].arc1 - this.prevdata[i].arc1)/20;
								this.prevdata[i].arc2Increment = (this.data[i].arc2 - this.prevdata[i].arc2)/20;
							}
						
							ctx.fillStyle = this.colors[i%this.colors.length]; 
							ctx.beginPath(); 
							ctx.moveTo(centerX,centerY); 
							this.prevdata[i].arc1 = this.prevdata[i].arc1 + this.prevdata[i].arc1Increment;
							this.prevdata[i].arc2 = this.prevdata[i].arc2 + this.prevdata[i].arc2Increment;
							ctx.arc(centerX,centerY,radius,this.prevdata[i].arc1,this.prevdata[i].arc2,false);
							ctx.lineTo(centerX,centerY); 
							ctx.fill(); 

						} 	
						
						for (var i = 0; i < this.data.length; i++) 
						{ 
							isDone = (this.prevdata[i].arc1.toFixed(4) == this.data[i].arc1.toFixed(4) && this.prevdata[i].arc2.toFixed(4) == this.data[i].arc2.toFixed(4));
							if (isDone == false) break;
						}
						if (isDone){
						window.clearTimeout(timeoutID);
						this.prevdata = deepCopy(this.data);
						}else{
							timeoutID = window.setTimeout(function(){me.drawChart();},20);
						}
					
					}
					}
					
				},
				/**
				 * Called to render the Chart data labels. By default this method renders labels for the max and min values of a single axis Chart
				 */
				drawLabels: function drwlbls() {
				},

				renderTooltip: function rndrttp(touchX, touchY) {
				
 						//set the tooltip text 	
					centerX = this.width/2
					centerY = this.height/2
					radius = Math.min(centerX,centerY);
					var hyp = Math.sqrt( Math.pow((touchX-centerX),2) + Math.pow((touchY-centerY),2))						
					if (hyp < radius) 
					{
						//   the click was inside the pie chart area
							var angle = Math.atan2(touchY - centerY,touchX - centerX);
							(angle < 0)? angle = (2 * Math.PI) + angle: null;
							for (var i = 0; i < this.data.length; i++){
								if (angle > this.data[i].arc1 && angle < this.data[i].arc2){
								 this.tooltip.innerHTML = '<b>' + this.Labels[i]+ ': </b>' + this.pieChartData[i];
								 this.highlightContext.clearRect(0,0,this.width,this.height);
								 this.highlightContext.beginPath(); 
								 this.highlightContext.moveTo(centerX,centerY); 
								 this.highlightContext.arc(centerX,centerY,radius,this.data[i].arc1,this.data[i].arc2,false);
								 this.highlightContext.lineTo(centerX,centerY); 
								 this.highlightContext.strokeStyle = "#FFFFFF";
								 this.highlightContext.lineWidth = 2;
								 this.highlightContext.stroke();
							break;
								
								}
							
							}

					
					    //	this.set('selectedrectindex',i);

					
					this.tooltip.style.webkitTransform = 'translate(' + centerX - 60 + 'px,' + centerY - 60 + 'px)';
					this.tooltip.style.MozTransform = 'translate(' + centerX - 60 + 'px,' + centerY + 'px)';
					this.tooltip.style.msTransform = 'translate(' + centerX + 'px,' + centerY + 'px)';

					//Fade the tooltip in
					if (this.tooltip.className.indexOf("fadeIn") < 0) {
						this.tooltip.className = this.tooltip.className + " fadeIn";
						if (this.isAndroid) {
							this.tooltip.style.visibility = 'visible';
						}
					}
					}					

				},

				/**
				 * Returns the selected value (null if nothing is selected)
				 * @param x the x position of the click event
				 * @param y the y position of the click event
				 * @return the selected value (null if nothing is selected)
				 */
				getTouchValue: function gtvlindx(x,y) {
					var md = this.model,
						m = this.margin;

					var sz = md.rne - md.rns > 0 ? md.rne - md.rns : this.windowSize;
					var touchVal = Math.round(((x - m.l) * (sz - 1))/(this.width - m.l - m.r - 1));
					return (touchVal < sz) ? touchVal: null;
				},
				/**
				 * Handles the touch begin event.
				 * @private
				 */
				handleTouchBegin: function handleTouchBegin(touchX, touchY) {
									var dn = this.domNode,
					offset = mstrmojo.boxmodel.offset(dn);		
					this.offsetTop = offset.top;
					this.offsetLeft = offset.left;
					if(!this.isHighlightOnTouch) {
						return;
					}
					this.tooltipOn = true;
					this.handleTouchMove(touchX, touchY);
				},
				
				

				/**
				 * Handles the touch move event. The method positions the Chart tooltip and calls highlightPoint()
				 * @private
				 */
				handleTouchMove: function handleTouchMove(touchX, touchY) {
					var me = this;
					
					if (!me.tooltipOn || !me.isHighlightOnTouch) {
						return;
					}
					touchX = touchX - me.offsetLeft;
					touchY = touchY - me.offsetTop;
					me.renderTooltip(touchX, touchY);
				},
				/**
				 * Handles the touch end event.
				 * @private
				 */
				handleTouchEnd: function handleTouchEnd() {
					var me = this;
					
					me.tooltipOn = false;

					//erase the highlight context.
					me.highlightContext.clearRect(0, 0, me.width, me.height);
				

					//fadeout the tooltip
					me.tooltip.className = me.tooltip.className.replace(" fadeIn", "");
					if (this.isAndroid) {
						me.tooltip.style.visibility = 'hidden';
					}
				},
				
				/**
				 * @ignore
				 */
				onmousedown: function(evt) {
					if(!this.isAndroid) {
						this.handleTouchBegin(evt.e.pageX, evt.e.pageY);
					}
				},

				/**
				 * @ignore
				 */
				onmouseup: function(evt) {
					if(!this.isAndroid) {
						this.handleTouchEnd();
					}
				},

				/**
				 * @ignore
				 */
				onmousemove: function(evt) {
					if (!this.isAndroid) {
						this.handleTouchMove(evt.e.pageX, evt.e.pageY);
					}
				}				
			}
	);

})();