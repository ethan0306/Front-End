(function() {

	mstrmojo.requiresCls("mstrmojo.Vis", "mstrmojo.VisChartUtils", "mstrmojo.VisTreeMapData", "mstrmojo.boxmodel");
	
	mstrmojo.requiresDescs(8691,7559,2178);

	function HexToR(h) {
		return parseInt((cutHex(h)).substring(0, 2), 16)
	}

	function HexToG(h) {
		return parseInt((cutHex(h)).substring(2, 4), 16)
	}

	function HexToB(h) {
		return parseInt((cutHex(h)).substring(4, 6), 16)
	}

	function cutHex(h) {
		return (h.charAt(0) == "#") ? h.substring(1, 7) : h
	}

	function createGradient(sc, ec, steps) {
		var start = {};
		start.r = HexToR(sc);
		start.g = HexToG(sc);
		start.b = HexToB(sc);

		var end = {};
		end.r = HexToR(ec);
		end.g = HexToG(ec);
		end.b = HexToB(ec);

		var colors = [];
		var range = steps - 1;
		for(var i = 0; i < steps; i++) {
			var j = range - i;
			var c = {};
			c.r = Math.round(((start.r * j) + (end.r * i)) / range);
			c.g = Math.round(((start.g * j) + (end.g * i)) / range);
			c.b = Math.round(((start.b * j) + (end.b * i)) / range);
			colors[i] = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
		}

		return colors;

	}

	function getTooltipName(ch, s) {
		var nm = "", l = ch.length;

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
	mstrmojo.VisTreeMap = mstrmojo.declare(
	// superclass
	mstrmojo.Vis,
	// mixins
	null,
	/**
	 * @lends mstrmojo.VisTreeMap.prototype
	 */
	{
		/**
		 * @ignore
		 */
		scriptClass : 'mstrmojo.VisTreeMap',

		colorStart : '#7cc5d9',

		colorEnd : '#790000',

		/**
		 * @ignore
		 */
		utils : mstrmojo.VisChartUtils,

		/**
		 *
		 * @ignore
		 */
		data : mstrmojo.VisTreeMapData,

		/**
		 * The list of items to display.
		 *
		 * @type Array
		 */
		treeMapData : [],

		legendWidget : null,

		selectedRectIndex : null,

		/**
		 * The width of the Chart Widget
		 * @type Integer
		 */
		width : 800,

		/**
		 * The height of the Chart Widget
		 * @type Integer
		 */
		height : 350,

		/**
		 * @ignore
		 */
		context : null,

		/**
		 * The color used as the background of the Chart. It is also used to determine the color of the lines.
		 * @type String
		 */
		themeColor : '#000000',

		tooltipOn : false,

		isHighlightOnTouch : true,

		/**
		 * Widget offset in pixels
		 */
		offsetLeft : null,
		browserSupportsHtml5 : true,

		/**
		 * @ignore
		 */
		markupString : '<div id="{@id}" class="mstrmojo-TreeMap {@cssClass}"'
				+ 'style="width:{@width}px;height:{@height}px;position:relative;{@cssText}" ' 
				+ ' mstrAttach:mousedown,mouseup,mousemove,click >' 
				+ '<canvas style="position:absolute;left:0;top:10px" width="{@width}px" height="{@height}px"></canvas>' 
				+ '<canvas style="position:absolute;left:0;top:10px" width="{@width}px" height="{@height}px"></canvas>' 
				+ '<div id="{@id}-tooltip" class="mstrmojo-Chart-tooltip"></div>' 
				+ '<div id="{@id}-legend" class="mstrmojo-TreeMap-legend">'
				+'</div>' 
				+ '</div>',

		/**
		 * @ignore
		 */
		markupSlots : {
			//the main canvas of the Chart
			canvas : function() {
				return this.domNode.firstChild;
			},
			highlightContext : function() {
				return this.domNode.childNodes[1];
			},
			//the tooltip display when highlighting points
			tooltip : function() {
				return this.domNode.childNodes[2];
			},
			legend : function() {
				return this.domNode.childNodes[3];
			}
		},

		/**
		 * @ignore
		 */
		postBuildRendering : function postBR() {
			if(this._super) {
				this._super();
			}
			browserSupportsHtml5 = this.canvas.getContext;
			if(!browserSupportsHtml5) {
				alert('This browser does not support HTML5');
				return;
			}

			//cache the different canvas' context objects in the Widget
			this.context = this.canvas.getContext('2d');
			this.highlightContext = this.highlightContext.getContext('2d');
			this.highlightContext.lineWidth = 3;

			//trigger the Chart's plot method
			this.drawChart();

		},
		update : function update(node) {
			if(this._super) {
				this._super();
			}

			if(this.treeMapData) {
				this.data.process(this);
			}

		},
		/**
		 * draw the actual chart lines/bars
		 */
		drawChart : function drwchrt() {

			this.highlightContext.clearRect(0, 0, this.width, this.height);
			this.context.clearRect(0, 0, this.width, this.height);

			this.getColorBands();

			var colorsToUse = [];

			for(var i = 0; i < this.treeMapData.length; i++) {
				for(var j = 0; j < this.colorBands.length; j++) {
					if(this.treeMapData[i].count <= Math.round(this.colorBands[j].size)) {
						colorsToUse[i] = this.colorBands[j].color;
						break;
					}
				}

			}

			for(var i = 0; i < this.data.rectangles.length; i++) {
				var rect = this.data.rectangles[i];
				this.context.fillStyle = colorsToUse[i];
				this.context.fillRect(rect.x, rect.y, rect.w, rect.h);
				this.context.strokeStyle  = "rgb(246,237,224)";
				this.context.strokeRect(rect.x, rect.y, rect.w, rect.h);
			}
		},
		colorBands : [],
		getColorBands : function() {
			var hitcount = [];
			for(var i = 0; i < this.treeMapData.length; i++) {
				hitcount[i] = this.treeMapData[i].count;
			}

			var steps = 50;
			var colorsToPick = createGradient(this.colorStart, this.colorEnd, steps);
			var minCount = Math.min.apply(null, hitcount), maxCount = Math.max.apply(null, hitcount);
			var increment = (maxCount - minCount) / steps;

			var bands = [];
			bands[0] = {};
			bands[0].size = minCount + increment;
			bands[0].color = colorsToPick[0];
			for(var i = 1; i < steps; i++) {
				bands[i] = {};
				bands[i].color = colorsToPick[i];
				bands[i].size = bands[i - 1].size + increment;
			}

			this.colorBands = bands;

		},
		drawLegend : function(w) {			
			if(!w)
				return;			
			w.removeChildren();
			w.addChildren(mstrmojo.insert({
				scriptClass : "mstrmojo.Box"
			}));
			w.addChildren(mstrmojo.insert({
				scriptClass : "mstrmojo.Box"
			}));
			w.addChildren(mstrmojo.insert({
				scriptClass : "mstrmojo.Box"
			}));
			var boxwidth = 0;
			var textwidth = 0;
			var prevSize = 0;	
			
			if(isNaN(this.colorBands[this.colorBands.length - 1].size)){
				w.children[0].addChildren(mstrmojo.insert({
					scriptClass:"mstrmojo.Label",
					text: "No caches data input",
					postApplyProperties : function() {							
						var cssTextString = "";
						cssTextString = "position: absolute;left: 45%;top:5px;font-weight:bold;";
						this.set('cssText', cssTextString);
					}							 
				}));
			}else{	
				w.children[0].addChildren(mstrmojo.insert({
					scriptClass:"mstrmojo.Label",
					text: mstrmojo.desc(8691,"Hit Count"),
					postApplyProperties : function() {							
						var cssTextString = "";
						cssTextString = "position: absolute;left: 45%;top:5px;font-weight:bold;";
						this.set('cssText', cssTextString);
					}							 
				}));
				
				var bw = Math.round(this.width / this.colorBands.length);
				var totwidth = this.width;
				w.children[1].addChildren(mstrmojo.insert({
						scriptClass : "mstrmojo.Box",
						cssText:"color:#790000;position:absolute;top:20px;left:-5px;width:"+totwidth+"px;height:10px;background: -webkit-gradient(linear, left top, right top, from(#7cc5d9), to(#790000), color-stop(0.7, #790000)); background: -moz-linear-gradient(left top, #7cc5d9, #790000 70%);"
						}));
				var txt = '0';
				w.children[2].addChildren(mstrmojo.insert({
							scriptClass : "mstrmojo.Label",
							cssText:'position: absolute;top:35px;left:' + textwidth + 'px;width:15px;height:10px',
							text:txt,
				}));
				textwidth = Math.round(this.width / 2);
				txt = '' + Math.round(this.colorBands[this.colorBands.length - 1].size / 2);
				w.children[2].addChildren(mstrmojo.insert({
					scriptClass: "mstrmojo.Label",
					cssText: 'position: absolute;top:35px;left:' + textwidth + 'px;width:15px;height:10px',
					text: txt,
				}));
				textwidth = this.width - 15;
				txt = '' + Math.round(this.colorBands[this.colorBands.length - 1].size);
				w.children[2].addChildren(mstrmojo.insert({
					scriptClass: "mstrmojo.Label",
					cssText: 'position: absolute;top:30px;left:' + textwidth + 'px;width:15px;height:10px',
					text: txt,
				}));
			}

			w.render();

		},
		/**
		 * Called to render the Chart data labels. By default this method renders labels for the max and min values of a single axis Chart
		 */
		drawLabels : function drwlbls() {
		},
		renderTooltip : function rndrttp(touchX, touchY) {
			//Set the tooltip text
			rects = this.data.rectangles;
			for(var i = 0; i < rects.length; i++) {
				var rect = rects[i];
				if(touchX >= rect.x && touchX <= (rect.x + rect.w) && touchY >= rect.y && touchY <= (rect.y + rect.h)) {
					// The click was inside the rectange

					this.highlightContext.clearRect(0, 0, this.width, this.height);
					this.highlightContext.strokeStyle = "rgb(175,249,87)";
					this.highlightContext.strokeRect(rect.x, rect.y, rect.w, rect.h);

					this.tooltip.innerHTML = '<p align="left"> <b>' + mstrmojo.desc(7559, 'Name')+': </b>' + this.treeMapData[i].name;
					this.tooltip.innerHTML += '<p align="left"><b>'+mstrmojo.desc(2178, 'Size')+': </b>' + this.treeMapData[i].size + ' KB';
					this.tooltip.innerHTML += '<p align="left"><b>'+mstrmojo.desc(8691,'Hit Count')+': </b>' + this.treeMapData[i].count;
					this.set('selectedRectIndex', i);
					break;
				}
			}

			this.tooltip.style.webkitTransform = 'translate(' + touchX + 'px,' + touchY + 'px)';
			this.tooltip.style.MozTransform = 'translate(' + touchX + 'px,' + touchY + 'px)';
			this.tooltip.style.msTransform = 'translate(' + touchX + 'px,' + touchY + 'px)';

			//Fade the tooltip in
			if(this.tooltip.className.indexOf("fadeIn") < 0) {
				this.tooltip.className = this.tooltip.className + " fadeIn";
				if(this.isAndroid) {
					this.tooltip.style.visibility = 'visible';
				}
			}

		},
		/**
		 * Returns the selected value (null if nothing is selected)
		 * @param x the x position of the click event
		 * @param y the y position of the click event
		 * @return the selected value (null if nothing is selected)
		 */
		getTouchValue : function gtvlindx(x, y) {
			var md = this.model, m = this.margin;

			var sz = md.rne - md.rns > 0 ? md.rne - md.rns : this.windowSize;
			var touchVal = Math.round(((x - m.l) * (sz - 1)) / (this.width - m.l - m.r - 1));
			return (touchVal < sz) ? touchVal : null;
		},
		/**
		 * Handles the touch begin event.
		 * @private
		 */
		handleTouchBegin : function handleTouchBegin(touchX, touchY) {
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
		handleTouchMove : function handleTouchMove(touchX, touchY) {
			var me = this;

			if(!me.tooltipOn || !me.isHighlightOnTouch) {
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
		handleTouchEnd : function handleTouchEnd() {
			var me = this;

			me.tooltipOn = false;

			//erase the highlight context.
			me.highlightContext.clearRect(0, 0, me.width, me.height);

			//fadeout the tooltip
			me.tooltip.className = me.tooltip.className.replace(" fadeIn", "");
			if(this.isAndroid) {
				me.tooltip.style.visibility = 'hidden';
			}
		},
		/**
		 * @ignore
		 */
		onmousedown : function(evt) {
			if(!this.isAndroid) {
				this.handleTouchBegin(evt.e.pageX, evt.e.pageY);
			}
		},
		/**
		 * @ignore
		 */
		onmouseup : function(evt) {
			if(!this.isAndroid) {
				this.handleTouchEnd();
			}
		},
		/**
		 * @ignore
		 */
		onmousemove : function(evt) {
			if(!this.isAndroid) {
				this.handleTouchMove(evt.e.pageX, evt.e.pageY);
			}
		}
	});

})();
