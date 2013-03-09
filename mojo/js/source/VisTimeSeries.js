(function() {

	mstrmojo.requiresCls(
						 "mstrmojo.VisChartLine",
						 "mstrmojo.dom",
						 "mstrmojo._TouchGestures",
						 "mstrmojo.TouchScroller",
						 "mstrmojo._HasTouchScroller");

	mstrmojo.requiresDescs(5674, 8475, 8626);                         

	/**
	 * private variables
	 */
	var	tooltipShown = false,
		itemClicked = false,
		isDataSetChanged = false,
		usingCustomInterval = false,
		chartSizeChanged = false,
		SLXP = 0,					// Scroller Left X Position
		SRXP = 0,					// Scroller Right X Position
		originalTouchPosition = 0,
		scrollerClicked = null,
		originalSelection = null,
		origRNS = 0,
		origRNE = 0,
		sliderTooltipYPosition = 0,
		rangeToSeriesMaxRatio = 25,
		firstLineColor = '#0099FF';
	
	var SISW = 20;  //SCROLLER IMAGE SPAN WIDTH. This is also the added size of masterMargin.l and r
	var masterMargin = {t:5, r:SISW/2, b:10, l:SISW/2}; // l and r should be the same size and both added togather should be the size of SISW
	
	//PADDING variables are used when drawing the highlight
	var	PADDING = 10,
		TOP_PADDING = 8;
		
	var	$_DT = mstrmojo.locales.datetime;
	
	/**
	 * private function
	 */
	function resetLocalVars() {
		tooltipShown = false;
		itemClicked = false;
		isDataSetChanged = false;
		usingCustomInterval = false;
		chartSizeChanged = false;
		SLXP = 0;
		SRXP = 0;
		originalTouchPosition = 0;
		scrollerClicked = null;
		origRNS = 0;
		origRNE = 0;
		sliderTooltipYPosition = 0;
	}
	
	/**
	 * private function
	 */
	function isScrollableElementTouched(touch) {
		var m = this.margin,
		    scrollerOffsets = mstrmojo.TouchScroller.getScrollPositionTotals(this),
		    x = touch.pageX - this.offsetLeft + scrollerOffsets.x,
		    y = touch.pageY - this.offsetTop + scrollerOffsets.y;
		
		if (x < m.l || y < m.t || y > this.canvas.height - m.b) {
			return false;
		}

		return true;
	}

	function getTouchedElement(touch) {
		var item = mstrmojo.dom.findAncestorByAttr(touch.target, "clk", true, this.domNode);
		return item || null;
	}

	function resetBaseAndDerivedData(tsl) {
		var obm = this.baseModel;
		this.baseModel = this.getModel(tsl.ds) || this.baseModel;
		var bm = this.baseModel,
			bms = bm.series,
			m = this.model,
			cs = m.series,
			sl = cs.length,
			s = new Array();

		for(var j = 0; j < sl; j++) {
			// now compute the series currently selected and select the same from the new base Model
			s[j] = bms[cs[j].i];
			s[j].i = cs[j].i;
		}
		this.model = {categories:bm.categories, series:s, colHeaders:bm.colHeaders, rne:m.rne, rns:m.rns};
		this.windowSize = this.model.series[0].rv.length;
		if(!bm.vp || !bm.vp.rl) {
			bm.vp = obm.vp;
		}
		isDataSetChanged = true;
	}
	
	function localUpdateScrollerConfig() {
		var scl = this._scroller,
			m = this.model,
			icn = this.itemsContainerNode,
			offsetEnd = Math.max(icn.firstChild.offsetWidth - this.getWidth(), 0);

		var rns = (m.rns !== 0 && m.rns + 1 === m.rne) ? m.rns -1 : m.rns; // to adjust if diff is only one point and rns is at the end
		
		// Initialize origin to the current start of selection point
		scl.origin = {
				x: parseInt((rns * this.RTX),10),
				y: 0
		};

		// Should we be able to horizontally scroll?
		scl.hScroll = (offsetEnd !== 0 && scl.noHScroll !== true) || this.scrollPast;

		if (scl.hScroll) {
			// Add the computed offset.
			scl.offset = {
					x: {
						start: 0,
						end: offsetEnd
					   },
					scrollPast: this.scrollPast
			};
		}

		//Move the scroller to the correct position
		mstrmojo.dom.translate(icn, -(scl.origin.x), scl.origin.y, 0, "", true);
	}
	
	function getCurrencySymbolForMetric(/*model*/m) {
		var s = m.series,
			ch = m.colHeaders,
			chl = ch[0].items.length;

		//Get the currency symbol or percent symbol present in format
		var hi0 = s[0].hi,
			fInfo = ch[ch.length - 1].items[hi0[hi0.length - 1]],
			f = fInfo.f;
		var cs = (fInfo && f && f.indexOf(fInfo.cs) >= 0) ? "," + fInfo.cs : "";

		if(cs === "" && f) {
			cs = f.indexOf("%") >= 0 ? ",%" : ""; 
		}

		if(cs === "" && f) {
			var q = null;
			if(f.indexOf('\'') >= 0 ) {
				q = '\'';
			} else if(f.indexOf("\"") >= 0) {
				q = "\"";
			}
			if(q) {
				var temp = f.substring(f.indexOf(q) + 1);
				cs = "," + temp.substring(0,temp.indexOf(q));
			}
		}

		return cs;
	}
	function hideMasterTooltip() {
		var ms = this.masterSlider,
			stt = this.sliderTooltip,
			fc = ms.firstChild,
			lc = ms.lastChild;
		
		//For now just replace all occurrances since testing in browser
		fc.className = fc.className.replace(/ mstrmojo-timeseries-span-shadow/g, '');
		lc.className = lc.className.replace(/ mstrmojo-timeseries-span-shadow/g, '');
		
		//Also remove the scroller tooltip
		stt.innerHTML = '';
		stt.style.display = 'none';
		stt.className = stt.className.replace(/ timeseries-tooltip/g, '');
	}

	function handleTouchSwipeEnd() {
		var me = this;
		
		//unselect the orig chart's interval if any and redraw orig chart according to the custom interval
		if(usingCustomInterval && me.currSelection) {
			me.currSelection.className = me.currSelection.className.replace(' interval-selected', '');
		}
		if(chartSizeChanged && scrollerClicked !== 'MS') {
			me.showMessage(); // need to redraw so display loading message
			window.setTimeout(function() {me.reDrawChart();}, 10);
		} else {
			scrollerClicked = null;
		}
		
		// hide the master tooltip
		hideMasterTooltip.call(this);

	}
	
	function getFormattedDateForSliderTooltip(sliderTooltipXPosition) {
		var	me = this,
			cat = me.model.categories,
			tp = cat.tp;
		
		var pos = Math.round((sliderTooltipXPosition - masterMargin.l) / me.MRTX),
			rVal = cat.items[pos]; 
	
		
		if(tp.toString() === me.DSS_XML_BASE_FORM_DATE) {
			rVal = me.getFormattedDateForTooltip(rVal, true);
		}
		
		return rVal;
	}
	
	/**
	 * This function should check the ratio between interval range and total number of points if total ration is bigger than 
	 * set the range according to max ratio allowed so that the canvas size would not get bigger than certain size to break. 
	 */
	function checkTotalPointsToRangeRatio() {
		var me = this,
			model = me.model,
			rne = model.rne,
			rns = model.rns,
			range = rne - rns,
			seriesLength = model.series[0].rv.length,
			currentRatio = Math.round(seriesLength/range);
		
		if(currentRatio > rangeToSeriesMaxRatio) {
			// save the original values
			origRNE = rne;
			origRNS = rns;
			// Now unset the selector if it was selected and mark as custom
			usingCustomInterval = true;
			
			range = Math.ceil(seriesLength / rangeToSeriesMaxRatio); // make sure we have an int value.
			
			//If we were in middle of selector selection than make sure mid point is preserved.  
			// If we are rendering for the first time than left side only should be adjusted.
			if(itemClicked) {
				//When changing the interval change according to the mid point
				var mid = rne - Math.round((rne - rns)/2), // this is the mid point of current screen
					hr = Math.round(range/2);
				
				if( mid - hr >= 0 && mid + hr <= seriesLength) {
					rns = mid - hr;
					rne = mid + hr - range % 2; // mod it by 2 so if range is not rounded we don't delete 1
				} else if(mid - hr >= 0) {
					rne = seriesLength;
					rns = seriesLength - range > 0 ? seriesLength - range : 0;
				} else {
					rns = 0;
					rne = range < seriesLength ? range : seriesLength;
				}
				
				model.rne = rne;
				model.rns = rns;

				//unselect the current selection
				/*TQMS 518604 add check in case there was no current selection*/
				if(me.currSelection) {
					me.currSelection.className = me.currSelection.className.replace(' interval-selected', '');
					me.currSelection = null;
				}
			} else {
				model.rns = rne - range; // case when adjusting only the left side.
			}

		}
		
	}
	
	/**
	 * A Widget to display the Time Series visualization
	 * @class
	 * @extends mstrmojo.VisChartLine
	 */
	mstrmojo.VisTimeSeries = mstrmojo.declare(

		// superclass
		mstrmojo.VisChartLine,

		// mixins
		[ mstrmojo._TouchGestures, mstrmojo._HasTouchScroller ],
		
		{
			/**
             * @ignore
             */
            scriptClass: 'mstrmojo.VisTimeSeries',

        	// overwrite this property of super class for time series we always have linear chart
        	isLinearChart: true,
        	
        	//set the highlight color to white
			highlightColor: '#ffffff',
			
			// overwrite make this property set to false always in time series
			switchSeriesOnTouch: false,
					
        	/**
			 * An object representing the margins the Chart will have. It contains the following Objects: t (top), r (right), b (bottom), l (left).
			 * @type Object
			 */
			margin: {t:98, r:5, b:30, l:5},
			
			/**
			 * just to make sure that the data we want to create is for time series vs chartline
			 */
			isTimeSeries: true,
			
			/**
			 * overwrite max number of x axis labels to be shown on the screen
			 */
			maxXLabels: 5,
			
			/**
			 * This is to set the scroll properties
			 */
			scrollerConfig: {
                bounces: false,
                showScrollbars: false,
                useTranslate3d: true
            },

			/**
             * property that determines if we want to allow scrolling past the actual data to produce the stretching
             * effect
             */
            scrollPast: true,
            
            /**
             * property that determines if we are running on Android Tablet
             */
            isAndroidTab: false,
            
            /**
             * context to draw the master timeseries in case of Android Tablet
             */
            masterContext: null,

			/**
			 * @ignore
			 */
			markupString: '<div id="{@id}" class="mstrmojo-Chart {@cssClass}" style="width:{@width};height:{@height};top:{@top};left:{@left};position:relative;" ' +
			' mstrAttach:mousedown,mouseup,mousemove,click ' +                             
			'><canvas width="{@width}" height="{@height}"></canvas>' + 
			'<div id="{@id}-animation-canvas-div" class="mstrmojo-timeseries-animation-canvas" style="position:absolute;left:0;top:0;width:{@width};height={@height}">' +
			'<canvas style="position:absolute;left:0;top:0" width="{@width}" height="{@height}"></canvas>' +
			'</div>' +
			'<canvas style="position:absolute;left:0;top:0;z-index:100;" width="{@width}" height="{@height}"></canvas>' +
			'<div id="{@id}-tooltip" class="mstrmojo-Chart-tooltip"></div>' +
			'<div id="{@id}-legend-bar" class="mstrmojo-timeseries-legend-bar" style="width:{@width}">' +		
			'<span id="{@id}-legend-span" class="mstrmojo-timeseries-legend-span metric-span" clk="M" >' +
			'<div class="mstrmojo-timeseries-legend-span-txt">dummy</div>' +
			'<span id="img-span-div" class="img-span-div" style="display:none"></span></span>' +
			'<span id="{@id}-legend-span" class="mstrmojo-timeseries-legend-span" style="display:none" clk="A" value="1" >' +
			'<div class="mstrmojo-timeseries-legend-span-txt">dummy</div>' +
			'<div id="{@id}-legend-span-div" class="mstrmojo-timeseries-legend-span-div"></div>' +
			'<span id="img-span-div" class="img-span-div" style="display:none"></span></span>' +
			'<span id="{@id}-legend-span" class="mstrmojo-timeseries-legend-span" style="display:none" clk="A" value="0" >' +
			'<div class="mstrmojo-timeseries-legend-span-txt">dummy</div>' +
			'<div id="{@id}-legend-span-div" class="mstrmojo-timeseries-legend-span-div"></div>' +
			'<span id="img-span-div" class="img-span-div" style="display:none"></span></span>' +
			'<span id="{@id}-hihglight-title" class="mstrmojo-timeseries-legend-span" style="display:none"></span></div>' +
			'<div id="{@id}-loading-msg" class="mstrmojo-loading-msg" style="display:none"></div>' +
			'<canvas style="position:absolute;left:0;top:0;" width="{@width}" height="{@height}"></canvas>' +
			'<div id="{@id}-master-div" class="mstrmojo-master-parent-div" width="{@width}" style="display:none">' +
			'<span id="{@id}-master-cover-span" class="mstrmojo-master-cover-span ts-span-L"></span>' +
			'<div id="{@id}-master-slider" class="mstrmojo-master-slider-div" clk="MS">' +
			'<span id="{@id}-master-img-L" class="mstrmojo-timeseries-master-span mstrmojo-timeseries-master-span-left" clk="L" ></span>' +
			'<span id="{@id}-master-img-R" class="mstrmojo-timeseries-master-span mstrmojo-timeseries-master-span-right" clk="R" ></span>' +
			'</div>' +
			'<span id="{@id}-master-cover-span" class="mstrmojo-master-cover-span ts-span-R"></span>' +
			'<span id="{@id}-master-slider" class="mstrmojo-master-slider-div-top"></span>' +
			'</div>' +
			'<div id="{@id}-slider-tooltip" class="mstrmojo-Chart-tooltip" style="z-index:150"></div>' +
			'</div>',

			/**
			 * @ignore
			 */
			markupSlots: {
				//the main canvas of the Chart
				canvas: function(){ return this.domNode.firstChild; },

				//the base canvas for animation @TODO: each animation should create independent canvas objects
				animationCanvas: function(){ return this.domNode.childNodes[1].firstChild; },
				
				// this is the scrollable div that contains canvas and x axis labels
				itemsContainerNode: function() { return this.domNode.childNodes[1]; },

				//the canvas used for highlighting points
				highlightCanvas: function(){ return this.domNode.childNodes[2]; },
				
				//the tooltip display when highlighting points
				tooltip: function(){ return this.domNode.childNodes[3]; },
				
				// the element that holds the titlebar and attributes
				legendBarDiv: function(){return this.domNode.childNodes[4];},
				
				//the element where the highlighted point's display text is rendered
				titleBarMetric: function(){ return this.domNode.childNodes[4].firstChild; },
				
				// the metric span on the title bar
				titleBarAtt2: function() { return this.domNode.childNodes[4].childNodes[1]; },
				
				// Attribute #1 span on the title bar
				titleBarAtt1: function() { return this.domNode.childNodes[4].childNodes[2]; },
				
				// Attribute #2 span on the title bar
				tooltipTitle: function() { return this.domNode.childNodes[4].lastChild; },
				
				loadingMsg: function() { return this.domNode.childNodes[5]; },
				
				masterCanvas: function() { return this.domNode.childNodes[6]; },
				
				masterSlider: function() {return this.domNode.childNodes[7].childNodes[1]; },

				sliderTooltip: function() {return this.domNode.childNodes[8];}
			},
			
			drawAxis: function drwAxs() {
				var utils = this.utils,
				m = this.margin,
				w = this.getWidth(),
				h = this.canvas.height,
				c = this.context;

				c.save();
				
				//set the style of the axes lines    
				c.strokeStyle = '#ffffff';
				c.lineWidth = 1;
				c.globalAlpha = 0.3;
				
				// draw the line separator for legend div, where 48 is the height of legend bar div
				var y = this.legendBarDiv.offsetHeight;
				utils.drawLineSet(this, [{x:0,y:y},{x:w,y:y}], false, c);
				
				//draw the rectangle
				utils.drawRectangle(this, m.l, m.t, w - m.l - m.r, h - m.t - m.b, false, c);
				
				if(this.isAndroidTab) {
					this.setMasterChart();
					this.setMasterSlider();
				}
				c.restore();
			},
			
			setMasterChart: function setMasterChart() {
				var mc = this.masterContext,
					mch = this.masterCanvas.height,
					utils = this.utils,
					w = this.getWidth(),
					h = this.canvas.height;

				mc.save();
				//set the style of the axes lines    
				mc.strokeStyle = '#ffffff';
				mc.lineWidth = 1;
				utils.drawLineSet(this, [{x:0,y:masterMargin.t},{x:w,y:masterMargin.t}], false, mc);
				utils.drawLineSet(this, [{x:0,y:mch - masterMargin.b},{x:w,y:mch - masterMargin.b}], false, mc);
				mc.restore();
				
				// move canvas to it's location
				utils.translateCSS(0,h, false, this.masterCanvas);
				
				//Also set the y position of slider tooltip.
				sliderTooltipYPosition = this.canvas.height - this.margin.t + 5;
			},
			/**
			 * set the master charts div
			 */
			setMasterSlider: function setMasterSlider() {
				var width = this.getWidth(),
					utils = this.utils,
					msl = this.masterSlider,
					msStyle = msl.style,
					mslp = msl.parentNode,
					lcStyle = mslp.firstChild.style, //left cover style
					rcStyle = mslp.childNodes[2].style,  // right cover style
					td = mslp.lastChild,
					tdStyle = td.style,		//top div showing border only to make look nice
					m = this.model,
					mrtx = this.MRTX,
					h = this.masterCanvas.height - masterMargin.t - masterMargin.b;

				SLXP = masterMargin.l + (mrtx * m.rns);
				SRXP = masterMargin.l + (mrtx * (m.rne - 1));
				if(SLXP === SRXP) { // if it is one point or no point difference than set the SLXP to be subtracted
					if(scrollerClicked) {
						if(scrollerClicked === 'L') {
							SLXP -= mrtx;
						} else {
							SRXP += mrtx;
						}
					} else if(m.rns > 0) {
						SLXP -= mrtx;
					} else {
						SRXP += mrtx;
					}
				}
				mslp.style.display = 'block';
				mslp.style.height = h + 'px';
				mslp.style.width = width + 'px';
				utils.translateCSS(0, masterMargin.t, false, mslp);
				
				var slWidth = (SRXP - SLXP);
				
				// avoid the two spans to overlap
				if(slWidth < SISW) {
					slWidth = SISW;
					if(SRXP + SISW/2 === width) {
						SLXP =  SRXP - SISW;
					} else {
						SRXP = SLXP + SISW;
					}
				}
				
				msStyle.width = (slWidth + SISW) + 'px';				
				msStyle.height = (h - (h * 2/9) - 2)+ 'px';

				//translate to left position
				utils.translateCSS(SLXP - SISW/2 , 0, false, msl);
				
				lcStyle.width = (SLXP) + 'px';
				rcStyle.width = (width - SRXP) + 'px';
				lcStyle.height = h + 'px';
				rcStyle.height = h + 'px';
				msl.firstChild.style.height = h * 5/9 + 'px'; //these are proportions to define how big our spans are
				msl.lastChild.style.height = h * 5/9 + 'px';
				msStyle.paddingTop = h * 2/9 + 'px';
				msl.firstChild.style.width = (SISW - 2) + 'px'; // -2 adjust for border
				msl.lastChild.style.width = (SISW - 2) + 'px';
				
				//put position div to top
				tdStyle.width = slWidth + 'px';
				tdStyle.height = (h - 2) + 'px';
				utils.translateCSS(SLXP, 0, false, td);
			},
			
			/**
             * Overridden to attach an event listener to the scroller for adjusting scroller when 
             * scroll event is done.
             * @ignore
             */
			initScroller : function initScroller(scroller) {
				
				if(!scroller.offset && this.scrollPast) {
					scroller.offset = {scrollPast:this.scrollPast};
				}
				
				this._super(scroller);

				var me = this;

				// Attach event listeners.  Call back to listen when scroll is done
				this._scroller.attachEventListener('scrollDone', me.id, function (evt) {
					//Now set the rns and rne accordingly since the scrolling is now finished
					var m = me.model,
						r = m.rne - m.rns,
						rns = parseInt(me._scroller.origin.x / me.RTX, 10);
						if(r === 1) { // adjust rns if difference is only one
							rns++;
						}

						var rne = rns + r;
					
					// if and else conditions are to set for the strech effect when streching beyond limits
					if(rns < 0) {
						m.rns = 0;
						m.rne = m.rns + r;
					} else if(rne > m.series[0].rv.length) {
						m.rne = m.series[0].rv.length;
						m.rns = m.rne - r;
					} else {
						m.rns = rns;
						m.rne = rne;
					}
					//we need to shift our chart a little bit to adjust for the points
					localUpdateScrollerConfig.call(me);
				});
				
				if(this.isAndroidTab) {
					// Attach event listeners.  Call back to listen when scroll is moved
					this._scroller.attachEventListener('scrollMoved', me.id, function (evt) {
						//compute rns and rne for master scroller
						var m = me.model,
							width = me.getWidth(),
							sl = m.series[0].rv.length,
							msl = me.masterSlider,
							msp = me.masterSlider.parentNode,
							mrtx = me.MRTX;
							r = m.rne - m.rns,
							rns = parseInt(evt.x / me.RTX, 10),
							rne = (rns + r > sl) ? sl : (rns + r);
	                	
						if(rns < 0) {
							rns = 0;
						}

						SLXP = (mrtx * rns) + masterMargin.l;
						if(SLXP < masterMargin.l) {
							SLXP = masterMargin.l; // make sure left position is never going below left margin
						}
						
	                	SRXP = (mrtx * (rne - 1)) + masterMargin.l;
	                	if(SRXP > width - masterMargin.r) {
	                		SRXP = width - masterMargin.r; // make sure right position is never going after right margin
						}
	                	
	                	if(SLXP === SRXP) {
	                		if(SRXP + mrtx <= width - masterMargin.r ) {
	                			SRXP += mrtx;
	                		} else {
	                			SLXP -= mrtx;
	                		}
	                	}
	                	
	    				var mw = SRXP - SLXP + SISW;
	    				
	    				if(SRXP - SLXP < SISW) {
	    					mw = 2 * SISW;
	    					if(SLXP ===  masterMargin.l) { // when scrolled to the left most end
	    						SRXP = SLXP + SISW;
	    					} else { // when scrolled to the right most end
	    						SLXP = SRXP - SISW;
	    					}
	    				}
	    				
	    				msl.style.width = mw + 'px';
	    				
	    				msp.firstChild.style.width = SLXP + 'px';
	    				msp.childNodes[2].style.width = (width - SRXP) + 'px';
	    				msp.lastChild.style.width = (SRXP - SLXP) + 'px';
	    				
	    				me.utils.translateCSS(SLXP - SISW/2, 0, false, msl);
	    				me.utils.translateCSS(SLXP, 0, false, msp.lastChild);
	    				
					});
				}
			},
			
			/**
             * @ignore
             */ 
			postBuildRendering: function postBR() {
				var model = this.model,
					colHeaders = model.colHeaders,
					categories = model.categories;
				
				var generalSettings = mstrApp.getConfiguration().getGeneralSettings();
				rangeToSeriesMaxRatio = generalSettings['mcs'] || rangeToSeriesMaxRatio;
				
				if (colHeaders && colHeaders.length > 2) {
					this.model.err = mstrmojo.desc( 8626, "The Time Series widget requires at least one attribute on the row axis and at least one metric on the column axis; optionally, one attribute can be placed above the metrics.");
				}
				
				if (categories && categories.items.length < 2) {
					this.model.err = mstrmojo.desc(8475, 'There is not enough data to plot the graph.');
				}
				
				//If error message received just return.
				var err = model.err || model.eg;
				
				// TQMS 518532 add the prompts to the model in case the document contain prompts
				var xtabModel = this.xtabModel,
				docModel = (xtabModel && xtabModel.docModel);
				
				if (err) {
					// In case of error still need to set the docModel if there are prompts
					if(docModel && docModel.prompts) {
						this.model.docModel = docModel;
					}
					this.renderErrorMessage(err);
					return;
				}

				// report is cached if we run the report again, reset local variables
				resetLocalVars();
				
				// if baseModel is set and Model is derived model than reset the derived model with model
				// TODO fix XML mode which does not send us correct model hence missing vp so nothing change instead of giving an error
				var baseModel = this.baseModel;
				if (baseModel && !model.vp) {
					//make sure layout level is defined or else it's template level
					if(this.layoutModel) { // #540281 when different layouts are present
						var tsl = baseModel.vp && baseModel.vp.rl && baseModel.vp.rl.length > 0 ? baseModel.vp.rl[0] : null;
						if (tsl && baseModel.k && baseModel.k !== tsl.ds) { 
							resetBaseAndDerivedData.call(this,tsl);
						}
					}
					
					this.model = this.baseModel;
				}
				
				this.currSelection = null; //If in postbuild rendering set the current selection to null
				
				// Set the scrolling element.
                this.scrollerConfig.scrollEl = this.itemsContainerNode;
                
            	// check if device type is Tablet Universal
                this.isAndroidTab = !!mstrApp.isTablet(); //determines if setting is android tablet
            	
                if(this.isAndroidTab) {
					this.masterContext = this.masterCanvas.getContext('2d');
				}
                
				if (this._super) {
					this._super();
				}

				// we have now rendered so update the scroller configuration
				localUpdateScrollerConfig.call(this);

				if(this.tooltip.className.indexOf('timeseries-tooltip') === -1) {
					this.tooltip.className += " timeseries-tooltip";
				}

				//set the highlight color to white
				this.highlightColor = '#ffffff';
				
				//now setup the labels for attributes and metric
				this.arrangeLegendBar();
				
				// TQMS 518532 add the prompts to the model in case the document contain prompts
				if(docModel && docModel.prompts) {
					this.model.docModel = docModel;
				}
				
        	},
        	
        	arrangeLegendBar: function albar() {
        		var tbm = this.titleBarMetric,
        			tbmChild = tbm.firstChild,
        			tba1 = this.titleBarAtt1,
        			tba1Child = tba1.firstChild,
        			tba2 = this.titleBarAtt2,
        			tba2Child = tba2.firstChild,
        			width = this.getWidth();
        		
        		//Set the div width to same as the width of current widget.  This has to be done for document rendering
        		this.legendBarDiv.style.width = width + 'px';

        		//now setup the labels for attributes and metric
				var m = this.model,
					s = m.series,
					ch = m.colHeaders,
					chl = ch[0].items.length;
				
				//Get the currency symbol or percent symbol present in format
				var cs = getCurrencySymbolForMetric(m);
				
				//when only one col header row is present we have only metrics hence don't show anything
				// on the legend bar except the metric
				if(ch.length === 1) {
					tbmChild.firstChild.nodeValue = ch[0].items[s[0].hi[0]].n + cs;
					// else if there is only one metric make it non clickable 
					if(chl > 1) {
						tbm.lastChild.style.display = 'block';
						tbm.setAttribute("clk", "M");
					} else {
						tbm.removeAttribute("clk");
					}
					return;
				}
				
				tbmChild.firstChild.nodeValue = ch[1].items[s[0].hi[1]].n + cs;
				if(ch[ch.length -1].items.length > 1) {
					tbm.lastChild.style.display = 'block';
					tbm.setAttribute("clk", "M");
				} else {
					tbm.removeAttribute("clk");
				}
				
				tba1Child.firstChild.nodeValue = ch[0].items[s[0].hi[0]].n;
				tba1.style.display = 'block';
				var h = tba1.offsetHeight / 2 - 18; //18 value is padding top of the span element which need to adjusted if padding is changed  
				tba1.childNodes[1].style.bottom = h + 'px';

				var childrenWidth = ((width /2) - 50) + 'px';
				
				if(chl > 1) {
					tba2Child.firstChild.nodeValue = ch[0].items[s[1].hi[0]].n;
					tba2.style.display = 'block';
					tba2.childNodes[1].style.bottom = h + 'px';
					
					childrenWidth = ((width/3) - 50) + 'px';
				}

				// we must have more than 2 attributes repeating to show the clickable
				if(chl > 2) {
					tba1.lastChild.style.display = 'block';
					tba2.lastChild.style.display = 'block';
					//In case of refresh called and data was sliced need to re-set the clickable functionality
					tba1.setAttribute("clk", "A");
					tba2.setAttribute("clk", "A");
				} else {
					tba1.removeAttribute("clk");
					tba2.removeAttribute("clk");
					tba1.lastChild.style.display = 'none';
					tba2.style.display = 'none';
				}
				
				tbmChild.style.maxWidth = childrenWidth;
				tba1Child.style.maxWidth = childrenWidth;
				tba2Child.style.maxWidth = childrenWidth;
				
        	},
        	/**
        	 * overwite the draw chart behavior of chartLine
        	 */
        	drawChart: function drwchrt() {

				var model = this.model;
				if(model.err) {
					return;
				}
				
				// Make sure that the range we are going to select does not exceed the Ration limit
				checkTotalPointsToRangeRatio.call(this);
				
				//local objects
				var me = this,
					context = me.animationContext,
					mvalues = model.mvalues,
					width = me.getWidth(),
					utils = me.utils,
					values = model.series,
					margin = me.margin,
					lines = [],
					linesFrom = [],
					mlines = [],
					windowSize = me.windowSize;
				
				var mch = me.isAndroidTab ? me.getHeight()/6 : 0;
				
				var height = me.getHeight() - mch;
								
				if (!values) return;

				var vl = values.length;

				if(me.isDrawAxis && me.drawYAxisLabels) {
					margin.l = utils.getLabelWidthForMargin(me,model.mls);
				}
				
				if(me.isTimeSeries) {
					var v0l = values[0].rv.length,
						diff = model.rne - model.rns;
					//adjust since we have the start and end point both lying on the border
					if(diff < v0l) {
						if(diff > 1) {
							diff--;
						}
						v0l--;
					}
					
					if(me.isAndroidTab) {
						me.canvas.height = me.animationCanvas.height = me.highlightCanvas.height = height;

						// since size of canvas is changed need to fill the background color on canvas again
						utils.fillBackground(me);
						
						me.masterCanvas.height = mch;
						me.masterCanvas.width = width;
						
						// fill the background color of master canvas
						utils.fillBackground(me, width, mch, me.masterContext);
						
						me.MRTY = (mch - masterMargin.t - masterMargin.b) / (mvalues[mvalues.length - 1] - mvalues[0]);
						me.MRTX = (width - masterMargin.l - masterMargin.r) / (windowSize - 1);
					}
					
					width = me.animationCanvas.width = ((v0l/diff) * (me.getWidth() - margin.l - margin.r)) + (margin.l + margin.r);
				}
				
				
				//cache x & y ratios
				me.RTY = (height - margin.t - margin.b - 5) / (mvalues[mvalues.length - 1] - mvalues[0]);
				me.RTX = (width - margin.l - margin.r - 1) / (windowSize - 1);
				
				var mn = (mvalues[0] + mvalues[mvalues.length - 1]) / 2;

				//create the lines array used to create the chart's line
				for(var j = 0; j < vl; j++) {
					lines = [];
					mlines = [];
					var k = 0;
					for (var i = 0; i < windowSize; i++) {
						var val = values[j].rv[i];
						if(val.length === 0) {
							lines[k++] = null;
							continue;
						}
						lines[k] = {x:(i * me.RTX) + margin.l, y:utils.getYValue(me, val)};
						
						if(me.isAndroidTab) {
							mlines[k] = {x:(i * me.MRTX) + masterMargin.l, y:utils.getMasterYValue(me, val, masterMargin)};
						}

						k++;
					}

					me.drawChartLine(lines, linesFrom, vl, j, context);

					if(me.isAndroidTab) {
						me.drawChartLine(mlines, linesFrom, vl, j, me.masterContext, 1);
					}
					
					if(!me.multiLine) break; // break out of outer loop
				}

			},
			
			reDrawChart: function reDrawChart() {
				//first compute how much interval is selected i.e based on master slider positions
				// resize the animationCanvas to redraw.  Compute new RTX since interval changed.
				var me = this,
					model = me.model,
					values = model.series,
					context = me.animationContext,
					m = me.margin,
					utils = me.utils,
					lines = [],
					width = me.canvas.width, // initially width of the background main canvas
					h = me.canvas.height,    // height of the background main canvas
					vl = values.length,
					windowSize = me.windowSize;

				me.context.clearRect(0, 0, width, h);
				
				// refill the background
				utils.fillBackground(me);
				
				//re-draw the axix rectangle
				
				var cntx = this.context;
				
				cntx.save();
				//set the style of the axes lines    
				cntx.strokeStyle =  utils.getColor(this);
				cntx.lineWidth = 2;
				cntx.globalAlpha = 0.3;
				utils.drawRectangle(this, m.l, m.t, width - m.l - m.r, h - m.t - m.b, false, cntx);
				cntx.restore();
				
				var rne = Math.round((SRXP - masterMargin.l)/me.MRTX) + 1; // add 1 extra since last point is on border
				var v0l = values[0].rv.length;
				rne = Math.min(rne, v0l); // make sure rne is not greater than the series length

				var rns = Math.round((SLXP - masterMargin.l)/ me.MRTX);

				var diff = rne - rns,
					currentRatio = Math.round(v0l/( (diff - 1) || 1));
				
				if(currentRatio > rangeToSeriesMaxRatio) {
					diff = Math.ceil(v0l / rangeToSeriesMaxRatio);
					// since we are ceiling it might still be a diff of 2 because of ceil e,g, 23/12
					if(v0l > rangeToSeriesMaxRatio) {
						if(diff == 1) {
							diff +=2; // since the ratio of points is high min ratio should be three points to show on screen
						} else if(diff == 2) {
							diff += 1;
						}
					}
					if(scrollerClicked === 'L') {
						rns = rne - diff; // adjust the min point accordingly
					} else {
						rne = rns + diff; // adjust the min point accordingly
					}
				}
				
				//adjust since we have the start and end point both lying on the border
				if(diff < v0l) {
					if(diff > 1) {
						diff--;
					}
					v0l--;
				}

				width = me.animationCanvas.width = ((v0l/diff) * (me.getWidth() - m.l - m.r)) + (m.l + m.r);

				//cache x ratio since the animation canvas width is now changed
				me.RTX = (width - m.l - m.r - 1) / (windowSize - 1);

				for(var j = 0; j < vl; j++) {
					lines = [];
					var k = 0;
					for (var i = 0; i < windowSize; i++) {
						var val = values[j].rv[i];
						if(val.length === 0) {
							lines[k++] = null;
							continue;
						}
						lines[k] = {x:(i * me.RTX) + m.l, y:utils.getYValue(me, val)};
						k++;
					}

					this.drawChartLine(lines, null, vl, j, context);
				}

				// record original rns and rne positions when cutom interval is not used
				if(me.currSelection) {
					originalSelection = me.currSelection;
					me.currSelection = null;
					origRNS = model.rns;
					origRNE = model.rne;
				}

				model.rns = rns;
				model.rne = rne;
				// must need the new rns and rne set to model to apply this
				localUpdateScrollerConfig.call(me);

				// remove labels
				me.removeLabels();
				itemClicked = true;
				me.drawLabels();
				
				if(this.isAndroidTab) {
					this.setMasterSlider();
				}
				scrollerClicked = null;
				chartSizeChanged = false;
				itemClicked = false;
				me.hideMessage();
			},
			
        	/**
        	 * overwite the draw chart line behavior of chartLine
        	 */
        	drawChartLine: function drwcl(lines, linesFrom, vl, si, context, lw) {
				
				var me = this,
					m = me.model,
					s = m.series[si],
					utils = this.utils;
				
				context.save();
				context.lineCap = 'round';
				context.lineWidth = lw || 3;
				context.lineJoin = 'round';
				
				//color of line depends on what color is the attribute here
				var ci = null,
				clr = null;
				if(s.hi && s.hi.length > 0) {
					ci = s.hi[0] % 6;
				} else {
					ci = si % 6;
				}
				
				clr = this.chartLineColors[ci];

				
				//Set the same color for the first attribute
				if(si % 2 === 0) { 
					this.titleBarAtt1.style.color = clr;
					firstLineColor = clr;
				} else {
					// 504783 if first color is same as previous one change the color
					if(firstLineColor === clr) {
						clr = this.chartLineColors[ (ci + 1) % 6];
					}
					this.titleBarAtt2.style.color = clr;
				}

				context.strokeStyle = clr;

				//just draw the lines no animation
				utils.drawLineSet(me, lines, false, context);

				//TODO don't fill area for now since in slicing the area is not filled properly
				/*if(!this.multiLine || this.model.series.length === 1) {
					this.fillinColor = context.strokeStyle;
					utils.fillLinesArea(me,lines.slice(0));
				}*/
								
				context.restore();

			},
			
			drawLabels: function drwlbls() {
				if (this._super) {
					this._super();
				}
				
				if(!itemClicked) {
					this.drawTimeSelectorLabels();
				}
				
			},

			drawTimeSelectorLabels: function drwtslbls() {
				var tsl = this.baseModel.vp.rl;
				
				if(tsl) {
					var me = this,
						mg = me.margin,
						utils = me.utils,
						width = me.getWidth();
					

					//calculate the interval for each timeseries label at x axis
					var d = tsl.length;

					var x = (width - mg.l - mg.r) / (d + 1),
						endX = width - mg.r;
					
					// #497988.  70 is the min-width(60px) for the interval div defined in css + 10px for space between each
					// this is the case when we have lot of labels that cannot be placed on the screen.
					//TODO for new TimeSeries version it should be a scrollable object
					if(x < 70) {
						x = 70;
					}
					
					var id = me.id,
						translateX = 0;
						lastTranslateXEnd = 0,
						offsetWidth = 0,
						domNode = me.domNode;
						
					//for now keep the max time series selectors to be shown to six i.e defined in iphone specs.
					for(var i = 0; i < d; i++) {
						var lbl = document.createElement("div");
							lbl.id = 'timeseries-intervals';
							lbl.className = 'timeseries-intervals';
						
						lbl.innerHTML = tsl[i].n;
						lbl.setAttribute("clk", "S");
						lbl.setAttribute("value", i);
						//highlight the first visprop and make it as selected
						if(i === 0 && !me.currSelection && !usingCustomInterval) {
							lbl.className = lbl.className + ' interval-selected';
							me.currSelection = lbl;
						} else if(!usingCustomInterval && me.currSelection && me.currSelection.innerHTML === tsl[i].n){
							lbl.className = lbl.className + ' interval-selected';
							me.currSelection = lbl;
						}
						domNode.appendChild(lbl);
						
						// get the current label width
						offsetWidth = lbl.offsetWidth;
						
						// where it should be placed
						translateX = mg.l + (x * i + x) - (offsetWidth / 2);
						
						// if overlapping on previous label shift it.
						if( i > 0 && translateX <= lastTranslateXEnd ) {
							translateX = lastTranslateXEnd + 10;
						}
						
						if(translateX > width - mg.r) {
							// label is not going to fit on the screen remove it and stop adding the labels.
							domNode.removeChild(lbl);
							break;
						}
						//record the end x position
						lastTranslateXEnd = translateX + (offsetWidth);
						
						utils.translateCSS(translateX, 0, false, lbl);
					}
				}
			},

			drawSelector: function drwsl(lbl, rl, intervalChanged) {
				var m = this.model,
					sl = m.series[0].rv.length,
					rng = sl,
					rns = m.rns,
					rne = m.rne,
					bm = this.baseModel,
					row = bm.rowHeaders;
				
				if(intervalChanged) {
					
					//Compute the slice we need to draw
					var rs = parseInt(rl.rs,10);
					var sr = rl.sr;

					for(var i = 0; i < row.length; i++) {
						// Now match which row is it to get the range
						if(row[i].id === sr) {
							rng = row[i].l * rs;
							break;
						}
					}

					//now compute the current mid point and accordingly set the next start and end points for the series
					var mid = rne - Math.round((rne - rns)/2), // this is the mid point of current screen
					hr = Math.round(rng/2);

					if( mid - hr >= 0 && mid + hr <= sl) {
						m.rns = mid - hr;
						m.rne = mid + hr - rng % 2; // mod it by 2 so if range is not rounded we don't delete 1
					} else if(mid - hr >= 0) {
						m.rne = sl;
						m.rns = sl - rng > 0 ? sl - rng : 0;
					} else {
						m.rns = 0;
						m.rne = rng < sl ? rng : sl;
					}
				}
				this.refreshChart(true, isDataSetChanged);

				itemClicked = false;
				this.enableOnClickItems();
				this.hideMessage();
			},
			
        	/**
             * Called to highlight a single data point
             * @param {Integer} [x] the x axis point to highlight
             */
			highlightPoint: function hghlghtpnt(x, touchY) {

				//local vars
				var me = this,
					ctx = me.highlightContext,
					height = me.highlightCanvas.height,
					mg = me.margin,
					m = me.model,
					utils = me.utils,
					si = me.seriesIndex;

				// clear around the previous highlight
				var xcoord = (x * me.RTX) + mg.l;
				if (me.prevHighlight >= 0) {
					var prevx = (me.prevHighlight * me.RTX) + mg.l;
					var y = mg.t - TOP_PADDING > 0 ?  mg.t - TOP_PADDING : 0; // fix for no margin on top
					ctx.clearRect(prevx - PADDING, y , prevx + PADDING, height - mg.b);					
				}		

				if (x < 0) return;

				var xcoord = (x * me.RTX) + mg.l;
				
				ctx.shadowColor = me.highlightColor;
				ctx.globalAlpha = 1;

				// set colors
				ctx.strokeStyle = me.highlightColor;
				ctx.fillStyle = me.highlightColor;
				ctx.lineWidth = 2;
				ctx.lineCap = "round";				

				//draw the highlight
				utils.drawLineSet(me, 
						[ {x:xcoord, y:mg.t - 2},
						  {x:xcoord, y:height - mg.b}
						], false, ctx);


				//get the series which we want to draw
				var s = m.series,
					l = s.length,
					rns = (m.rns === 0 || m.rne - m.rns > 1) ? m.rns : m.rns - 1,
					y = utils.getYValue(me, s[si].rv[rns + x]); //This is to select the current point based on the start point currently shown

				//position the highlight image
				ctx.strokeStyle = me.chartLineColors[s[si].hi[0] % 6];
				ctx.fillStyle = ctx.strokeStyle;
				utils.drawArc(me, xcoord, y, 5, 0, Math.PI * 2, true, true, ctx);
				
			},
        	
			hideTimeSelectorLabels: function htsl() {
				var lbls = this.domNode.getElementsByClassName('timeseries-intervals');
				for(var i = 0; i < lbls.length; i++) {
					lbls[i].style.display = 'none';
				}
			},
			
			showTimeSelectorLabels: function stsl() {
				var lbls = this.domNode.getElementsByClassName('timeseries-intervals');
				for(var i = 0; i < lbls.length; i++) {
					lbls[i].style.display = 'block';
				}
			},
					
			/**
			 * 
			 */
			getFormattedDateForTooltip: function getFormattedDateForTooltip(/*date string in milliseconds*/ val, isLongFormat) {
				if(isNaN(val)) {
					return val;
				}
				var fVal = val;
				try {
					val = this.utils.convertRawValueToMilliseconds(val);
					var dt = new Date(Number(val)),
						$_DT = mstrmojo.locales.datetime;
					var mn = isLongFormat ? $_DT.MONTHNAME_FULL[dt.getMonth()] : $_DT.MONTHNAME_SHORT[dt.getMonth()];
					var yr = dt.getFullYear().toString().substring(2);
					if(isLongFormat) {
						fVal = mn + " " + dt.getDate() + ", " + yr;
					} else {
						fVal = mn + "-" + dt.getDate() + "-" + yr;
					}
				} catch (e) {
					// in case of any exception do nothing and will return the actual value that was passed
				}
				return fVal;
			},
			
			renderTooltip: function rndrttp(valIndex, touchX, touchY) {
				if (valIndex < 0) {
					this.tooltip.style.display = 'none';
					return;
				}
								
				var me = this,
					m = me.model,
					mg = me.margin,
					s = m.series,
					cat = m.categories,
					tp = cat.tp,
					l = s.length,
					si = me.seriesIndex,
					rns = (m.rns === 0 || m.rne - m.rns > 1) ? m.rns : m.rns - 1,
					ttp = me.tooltip,
					colH = m.colHeaders,
					ttpt = me.tooltipTitle;

				//get the row/attribute values
				var rVal = cat.items[rns + valIndex];
				
				// check if categories is of format time only than call function
				if(tp.toString() === me.DSS_XML_BASE_FORM_DATE) {
					rVal = me.getFormattedDateForTooltip(rVal);
				}
				ttpt.innerHTML = rVal;
				
				//Also if needed modify the contents of attribute 1
				if(!tooltipShown) {
					if(si === 1) {
						if(me.titleBarAtt1.style.display === 'block') {
							me.titleBarAtt1.style.display = 'none';
						}
					} else {
						me.titleBarAtt2.style.display = 'none';
					}
					
					me.hideTimeSelectorLabels();
					me.disableOnClickItems();
					tooltipShown = true;
				}
				
				ttpt.style.display = "block";
				
				//Set the tooltip text 
				ttp.innerHTML = s[si].v[rns + valIndex];
				
				ttp.style.display = 'block';
				
				//Calculate the position of the highlight tooltip and adjust if necesary
				
				//get the width of the tooltip div
				var ttw = ttp.offsetWidth,
					x = touchX - ttw /2;

				if (x < mg.l) {
					x = mg.l;
				} else if (x > me.getWidth() - mg.r - ttw) {
					x = me.getWidth() - mg.r - ttw;
				}

				me.utils.translateCSS(x, 0, false, ttp);
			},
			
			showMessage: function shmsg(text) {
				var msg = this.loadingMsg,
				mns = msg.style;

				// Add message text.
                msg.innerHTML = text || mstrmojo.desc(5674, 'Loading...');
                mns.display = 'block';
                mns.opacity = 1;
                
                // Display message centered within the widget.
                var x = Math.round(this.getWidth() / 2 - msg.offsetWidth / 2);
                var y = Math.round(this.getHeight() / 2 - msg.offsetHeight / 2);
                
                this.utils.translateCSS(x, y, false, msg);

			},
			
			hideMessage: function hmsg() {
				this.loadingMsg.style.opacity = 0;
			},
			
			drawNextMetric: function dnmt() {
				var me = this,
					m = me.model,
					os = m.series,
					hi = os[0].hi,
					bm = me.baseModel,
					bms = bm.series,
					bmsl = bms.length,
					chi = hi.length - 1,
					ch = bm.colHeaders,
					chl = ch[chi].items.length,
					nmi = (hi[chi] + 1) % chl;

				if(chl === 1) {
					return; // since we have only one series
				}

				var hi1 = null;
				if(os.length === 2) {
					hi1 = os[1].hi;				
				}

				var s = new Array(),
				nsi = 0;
				// mod the series index by the total length of series in base model
				// this apply in case of metric only chart
				nsi = (( hi[0] * chl ) + nmi) % bmsl; 
				s[0] = bms[nsi];
				s[0].i = nsi;

				if(hi1) {
					nsi = (( hi1[0] * chl ) + nmi) % bmsl;
					s[1] = bms[nsi];
					s[1].i = nsi;
				}

				m.series = s;
				me.titleBarMetric.firstChild.firstChild.nodeValue = ch[chi].items[s[0].hi[chi]].n + getCurrencySymbolForMetric(m);
				me.refreshChart(true, true);
				itemClicked = false;
				me.enableOnClickItems();
				me.hideMessage();
			},
			
			drawNextAttribute: function dnat(attn) {
				var me = this,
					s = me.model.series,
					bm = me.baseModel,
					bms = bm.series,
					ch = bm.colHeaders,
					chl = ch[0].items.length,
					chl1 = ch[1].items.length,
					nsi = 0;

				if(bms.length <= 2) {
					return; // we only have two attributes
				}
				// first compute which is the next metric that we want to pick other than the two displayed already
				// we must exclude the one that is not clicked and the one that is clicked
				var hi = s[0].hi,
				hi1 = s[1].hi,
				si = hi[0] * chl1 + hi[1],
				si1 = hi1[0] * chl1 + hi[1];

				var attn1 = attn === 0 ? 1 : 0;

				var nchi = (s[attn].hi[0] + 1) % chl;

				while(nchi === s[attn].hi[0] || nchi === s[attn1].hi[0]) {
					nchi = (nchi + 1) % chl;
				}

				nsi = (nchi * chl1 + s[attn].hi[1]) % (chl * chl1); 

				s[attn] = bms[nsi];
				s[attn].i = nsi;

				if(attn === 0) {
					me.titleBarAtt1.firstChild.firstChild.nodeValue = ch[0].items[nchi].n;
				} else {
					me.titleBarAtt2.firstChild.firstChild.nodeValue = ch[0].items[nchi].n;
				}
				// now refresh the chart with updated model
				me.refreshChart(true, true);
				itemClicked = false;
				me.enableOnClickItems();
				me.hideMessage();
			},
			

			reRender: function reRender() {
				//If error message received just return.
				if(this.model.err || this.model.eg) {
					// #500786 should not render the error message again just do nothing.
					return;
				}
				
				// remove the timeseries intervals if any
				var todel = this.domNode.getElementsByClassName('timeseries-intervals');
				for (var i = todel.length - 1; todel && i >= 0; i--) {
					todel[i].parentElement.removeChild(todel[i]);
				}

				//Now resize the other elements on the markup
				this.canvas.width = this.animationCanvas.width = this.highlightCanvas.width = this.getWidth();
				this.canvas.height = this.animationCanvas.height = this.highlightCanvas.height = this.getHeight();

				this.legendBarDiv.style.width = this.getWidth() + 'px';

				this.refreshChart(true, false);

			},
			
			// #507755  refresh is called on slice operation
			refresh: function refresh() {
				var me = this,
					domNode = me.domNode,
					elems = domNode.getElementsByClassName('timeseries-intervals'),
					length = (elems && elems.length) || 0;
				
				// remove the interval labels
				for(var i = length - 1; i >= 0; i-- ) {
					domNode.removeChild(elems[i]);
				}
				
				// remove all other labels
				me.removeLabels();
				
				me.postBuildRendering();
			},
			
			refreshChart: function refcht(isMetric, pld) {
				var me = this,
					wd = me.getWidth(),
					ht = me.getHeight();
				if(me.model.err) {
					return;
				}
				//clear animation and highlite canvas
				me.highlightContext.clearRect(0, 0, wd, ht);
				me.animationContext.clearRect(0, 0, me.animationCanvas.width, ht);
				if(isMetric) {
					me.context.clearRect(0, 0, wd, ht);

					// remove labels
					me.removeLabels();

					if(pld) {
						me.data.processLinearData(me);
					}

					//fill the Chart's background with the theme color
					me.utils.fillBackground(me);
				}
				// re-draw chart
				me.drawChart();
				
				me.drawLabels();

				//update the scroller config
				localUpdateScrollerConfig.call(me);
				
				if(isMetric) {
					me.drawAxis();
				}
			},
			
			disableOnClickItems: function doci() {
				this.titleBarMetric.lastChild.style.display = 'none';
				this.titleBarAtt1.lastChild.style.display = 'none';
				this.titleBarAtt2.lastChild.style.display = 'none';
			},
			
			enableOnClickItems: function eoci() {
				var ch = this.model.colHeaders,
				chl = ch[ch.length - 1].items.length;
				//make sure to enable only if more than one metric
				if(chl > 1) {
					this.titleBarMetric.lastChild.style.display = 'block';
				}
				// make sure to enable if multiple attributes
				if(ch[0].items.length > 2) {
					this.titleBarAtt1.lastChild.style.display = 'block';
					this.titleBarAtt2.lastChild.style.display = 'block';
				}
			},
			
			enableTitleBarItems: function etb() {
				var me = this,
					chl = me.model.colHeaders.length,
					ttp = me.tooltipTitle;
				
				// hide the title bar
				ttp.innerHTML = '';
				ttp.style.display = "none";
				
				//this is conditional if there is only metrics or only one attribute we don't want to display 2nd attribute
				if(chl > 1 && me.model.colHeaders[0].items.length > 1) {
					me.titleBarAtt2.style.display = 'block';
				}
				// set back the properties of attribute 1 only if the tooltip was shown
				// i.e, user have not clicked on any metric or attribute
				if(tooltipShown) {
					//this condition is to check if there is only metrics we don't want to display
					if(chl > 1) {
						me.titleBarAtt1.style.display = 'block';
					}

					tooltipShown = false;
				}
			},
			
			handleOnClick : function hoc(item) {

				if(!itemClicked) {
					itemClicked = true;

					var me = this,
						v = item.value,
						node = item.node,
						intervalChanged = true;

					// check if we are clicking on already selected selector in that case just return
					if(node === me.currSelection && !usingCustomInterval) {
						itemClicked = false;
						return;
					}
					
					// set the custominterval to false if custom interval was used
					if(v === 'S' && usingCustomInterval) {
						usingCustomInterval = false;
						me.model.rne = origRNE;
						me.model.rns = origRNS;
						if(node === originalSelection) {
							me.currSelection = originalSelection;
							originalSelection = null;
						}
					}

					me.disableOnClickItems();

					me.showMessage();

					if(v === "M") {
						window.setTimeout(function() {me.drawNextMetric();}, 10);
					} else if(v === "A") {
						window.setTimeout(function() {me.drawNextAttribute(parseInt(node.getAttribute("value"), 10));}, 10);
					} else {
						if(me.currSelection) {
							me.currSelection.className = me.currSelection.className.replace(' interval-selected', '');
						}
						node.className = node.className + ' interval-selected';
						
						var bm = me.baseModel,
							tsl = bm.vp.rl[parseInt(node.getAttribute("value"))];
						// if the data if from different templates
						if((bm.k && bm.k !== tsl.ds) && me.layoutModel) { //#506004 make sure layout level is defined or else it's template level 
							resetBaseAndDerivedData.call(this,tsl);
						} else {
							isDataSetChanged = false;
						}
						intervalChanged = node !== me.currSelection;
						originalSelection = me.currSelection;
						me.currSelection = node;
						window.setTimeout(function() {me.drawSelector(node, tsl, intervalChanged);}, 10);
					}
				}
			},

			moveMasterSlider: function moveMasterSlider(x /*current mouse position*/) {
				var me = this,
					m = me.model,
					width = me.getWidth(),
					delta = x - originalTouchPosition;
				
				if(delta === 0 || delta + SLXP - masterMargin.l < 0 || delta + SRXP + SISW/2 > width) {
					if(SLXP + delta - masterMargin.l > -1 && SLXP + delta - masterMargin.l < 0)  {
						delta -= SLXP + delta - masterMargin.l; // adjust to get zero position sigh margin
					} else if(delta + SRXP + SISW/2 < width + 1 && delta + SRXP + SISW/2 > width) {
						delta -= SRXP + delta + SISW/2 - width; // adjust to get last position
					} else {
						return;
					}
				}
				
				//Now calculate if we scroll left or right and based on that update local scroller config
				// add delta to left and right positions
				SLXP += delta;
				SRXP += delta;
				
				//move the scroller div
				me.utils.translateCSS(SLXP - SISW/2, 0, false, me.masterSlider);
				
				// Now move the dummy div but the translate need to be calculated since it is the last child
				me.utils.translateCSS(SLXP, 0, false, me.masterSlider.parentNode.lastChild);
				
				me.masterSlider.parentNode.firstChild.style.width = SLXP + 'px';

				me.masterSlider.parentNode.childNodes[2].style.width = (width - SRXP) + 'px';
				
				var rng = m.rne - m.rns;
				
				if(SRXP + SISW/2 === width) {
					m.rne = m.series[0].rv.length;
					m.rns = m.rne - rng;
				} else if(SLXP === SISW/2) {
					m.rns = 0;
					m.rne = rng;
				} else {
					m.rns =  Math.round((SLXP - masterMargin.l) / me.MRTX);
					if(rng === 1) {
						m.rns += 1;
					}
					m.rne = m.rns + rng;
				}
				
				localUpdateScrollerConfig.call(me);
			},
			
			renderSliderTooltip: function renderSliderTooltip(sliderTooltipXPosition) {
				var me = this,
					stt = me.sliderTooltip,
					width = me.getWidth();
				
				stt.innerHTML = getFormattedDateForSliderTooltip.call(this, sliderTooltipXPosition);
				
				var stWidth = stt.clientWidth,
					stHalfWidth = stWidth/2;
				
				if(sliderTooltipXPosition !== SLXP) {
					var dtw = parseInt(me.masterSlider.parentNode.lastChild.style.width, 10); // width of dummy top div
					sliderTooltipXPosition = SLXP + dtw - stHalfWidth;
				} else {
					sliderTooltipXPosition -= stHalfWidth;
					
				}

				if(sliderTooltipXPosition < 0 ) {
					sliderTooltipXPosition = 0;
				} else if( sliderTooltipXPosition + stWidth > width) {
					sliderTooltipXPosition = width - stWidth;
				}
				
				me.utils.translateCSS(sliderTooltipXPosition, sliderTooltipYPosition, false, stt);
			},

			resizeMasterSlider: function resizeMasterSlider(x /*current mouse position*/) {
				var me = this,
					width = me.getWidth(),
					msl = me.masterSlider,
					msls = msl.style,
					lcs = msl.parentNode.firstChild.style, // left cover span
					rcs = msl.parentNode.childNodes[2].style, // right cover span
					dt = msl.parentNode.lastChild; // dummy cover node
				
				var curw = parseInt(msls.width);

				var delta = originalTouchPosition - x;
				if(delta === 0) {
					return;
				}
				
				if(delta < 0) {
					if(scrollerClicked === 'L') {
						// when delta is negative i.e shrinking div to right
						if( curw + delta < (2 * SISW) ) {
							return;
						}
					} else { // R span is clicked delta is negative expand div
						if(SRXP - delta + SISW/2 > width) {
							if(SRXP - delta + SISW/2 < width + 1) { // adjust for very last points
								delta += (SRXP - delta + SISW/2) - width;
							} else {
								return;
							}
						}
					}
					
				} else {
					if(scrollerClicked === 'L') { // L span is clicked delta is positive i.e expanding div to left so subtract left position
						if( SLXP - delta < SISW/2 ) {
							if(SLXP - delta > SISW/2 - 1 ) {
								delta = SLXP - SISW/2; // adjust for very startup points.
							} else {
								return;
							}
						}
					} else { // R span is clicked delta is positive shrinking div to left
						if( curw - delta < (2 * SISW) ) {
							return;
						}
					}
				}
				
				var dtw = parseInt(dt.style.width, 10); // width of dummy top div
				
				if(scrollerClicked === 'L') {
					SLXP -= delta; // set the new position by alway subtracting the delta from left position
					me.utils.translateCSS(SLXP  - SISW/2, 0, false, msl);
					// Now move the dummy div but the translate need to be calculated since it is the last child
					me.utils.translateCSS(SLXP, 0, false, dt);
					msls.width = (curw + delta) + 'px';
					curw = parseInt(lcs.width);
					lcs.width = (curw - delta) + 'px';
					dt.style.width = (dtw + delta) + 'px';
					// set the position of slider tooltip
					me.renderSliderTooltip(SLXP);
				} else {
					SRXP -= delta;
					msls.width = (curw - delta) + 'px';
					curw = parseInt(rcs.width);
					rcs.width = (curw + delta) + 'px';
					dt.style.width = (dtw - delta) + 'px';
					// set the position of slider tooltip
					me.renderSliderTooltip(SRXP);
				}

				usingCustomInterval = true;
				chartSizeChanged = true;
			},
			
			shouldTouchBubble: function shouldTouchBubble(touch) {
			    // We will handle all touch with no bubbling.
			    return false;
			},

			touchSelectBegin: function touchSelectBegin(touch) {
				var item = getTouchedElement.call(this, touch);
				if (item) {
					if(item.value === 'L' || item.value === 'R' || item.value === 'MS') {
						//touched the strechable div in master
						scrollerClicked = item.value;
						originalTouchPosition = touch.pageX; // record the touch position so that the mouse move can be computed
					}
				} else {
					this.handleTouchBegin(touch.pageX, touch.pageY);
				}
			},
			
			touchSelectEnd: function touchSelectEnd(touch) {
				if(scrollerClicked) {
					handleTouchSwipeEnd.call(this);
					return false;
				}
				this.handleTouchEnd();

				if(tooltipShown) {
					this.enableTitleBarItems();
					this.enableOnClickItems();
					this.showTimeSelectorLabels();
				}
			},

			touchSelectMove: function touchSelectMove(touch) {
				if(scrollerClicked) {
					if(scrollerClicked === 'MS') {
						//if click was made inside the master scroller div than move the master scroller and orig chart accordingly
						this.moveMasterSlider(touch.pageX);
					} else {
						this.resizeMasterSlider(touch.pageX);
					}
					originalTouchPosition = touch.pageX;  // new original touch position after move occurred
					return false;
            	}
				this.handleTouchMove(touch.pageX, touch.pageY);
			},
			
            touchBegin : function touchBegin(touch) {
                // check if we have touched on clickable element if yes call handle on click ignore otherwise
                var item = getTouchedElement.call(this, touch);
                if (item) {
                    var value = item.value;
                    if (value === 'L' || value === 'R' || value === 'MS') {
                        // touched the strechable div in master
                        scrollerClicked = item.value;
                        originalTouchPosition = touch.pageX; // record the touch position so that the move can be computed
                        if (item.value !== 'MS') {
                            item.node.className = item.node.className + ' mstrmojo-timeseries-span-shadow';
							
                            //show tooltip here with date only on top of left or right slider bar
							var stt = this.sliderTooltip;
							stt.className = stt.className + ' timeseries-tooltip';
							stt.style.display = 'block';
							// show the tooltip 
							this.renderSliderTooltip(item.value === 'L' ? SLXP : SRXP);
                        }
                        
                    } else {
                        // Handle item click and return false so events cease.
                        this.handleOnClick(item);
                        return false;
                    }

                // Was a scrollable element NOT clicked?
                } else if (!isScrollableElementTouched.call(this, touch)) {
                    // Bubble the touch event because we won't handle it.
                    return this.bubbleTouchEvent(touch);
                }
            },

			touchSwipeMove: function touchSwipeMove(touch) {
				//First check if scrollable element is selected if yes call the super to scroll
                if (isScrollableElementTouched.call(this, touch) && this._super) {
                	this._super(touch);                	
                } else {
                	if(scrollerClicked) {
						if(scrollerClicked === 'MS') {
							//if click was made inside the master scroller div than move the master scroller and orig chart accordingly
							this.moveMasterSlider(touch.pageX);
						} else {
							this.resizeMasterSlider(touch.pageX);
						}
						originalTouchPosition = touch.pageX;  // new original touch position after move occurred
                	}
                }
			},
			
			touchSwipeEnd: function touchSwipeEnd(touch) {
				if(scrollerClicked) {
					handleTouchSwipeEnd.call(this);
					return false;
				} else if (this._super) {
					this._super(touch);
				}
			},
			
			touchSelectCancel: function touchSelectCancel(touch) {
				this.touchCancel(touch);
			},
			
			touchCancel: function touchCancel(touch) {
				this.touchSelectEnd(touch);
			},
			
			touchEnd: function touchEnd(touch) {
				if(scrollerClicked && !chartSizeChanged) {
					hideMasterTooltip.call(this);
					scrollerClicked = null;
				}
				return false;
			}
			
		}
	);

})();