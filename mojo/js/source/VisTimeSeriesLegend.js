(function () {

	mstrmojo.requiresCls( "mstrmojo.Vis", "mstrmojo._TouchGestures", "mstrmojo.TouchScroller", "mstrmojo._HasTouchScroller");

	function getTouchedElement(touch) {
        var item = mstrmojo.dom.findAncestorByAttr(touch.target, "clk", true, this.domNode);
        return item || null;
    }
    
    function setScrollerPosition() {
		var scl = this._scroller;
	        
	        var realHeight = this.h - this.legendBarSwitcher.height;
		
		var realOffSetHeight = this.legendListDiv.offsetHeight;
		if(realOffSetHeight > realHeight) {
			this.scrollPast = true;
		}
		var offsetEnd = realOffSetHeight > realHeight? realOffSetHeight - realHeight : 0;
	        scl.origin = {
				x: 0,
				y: 0
		};

		scl.showScrollbars = true;
		scl.noVScroll = false;
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
		var icn = this.legendListDiv;
		this.utils.translateCSS(0,0,false,icn);
	}
    
     /**
     * A Widget to display the Time Series visualization
     * @class
     * @extends mstrmojo.VisChartLine
     */
    mstrmojo.VisTimeSeriesLegend = mstrmojo.declare(

    // superclass
    mstrmojo.Vis,

    // mixins
    [mstrmojo._TouchGestures, mstrmojo._HasTouchScroller],

    {
        /**
         * @ignore
         */
        scriptClass: 'mstrmojo.VisTimeSeriesLegend',

        /**
         * This is to set the scroll properties
         */
        scrollerConfig: {
            bounces: false,
            showScrollbars: true,
            useTranslate3d: true
        },

        /**
         * property that determines if we want to allow scrolling past the actual data to produce the stretching
         * effect
         */
        scrollPast: false,
        /**
         * property that determines if we are running on Android Tablet
         */
        isAndroidTab: false,

		  /**
	         * property that determines the width of legend
	         */
		legendBarWidth : 30,
		
		  /**
	         * property that determines whether the legend  is opend
	         */
		isLegendBarOpen : false,
		
	      /**
	         * property that determines whether the legend item is selected
	         */
         isLegendSelected:false,
	        	 /**
	     	         * property that determines the legend item index which is selected
	     	         */
         legendSelectedIndex:-1,
         
         maxLegendAttrLength:0,
         /**
	         * property that point to the VisTimeSeries Widget
	         */
         widget:null,
        /**
         * @ignore
         */
        markupString: '<div id="{@id}-legend-bar" class="mstrmojo-timeseries-legend-bar" >' +	
				'<div id="{@id}-legend-switcher" class="mstrmojo-timeseries-legend-switcher" clk="C">'+
					'<div id="{@id}-legend-img-closed" class="mstrmojo-timeseries-legend-switcher-span mstrmojo-timeseries-legend-switcher-closed" ></div>' +
					'<div id="{@id}-legend-img-opend" class="mstrmojo-timeseries-legend-switcher-span mstrmojo-timeseries-legend-switcher-opened"></div>' +
				'</div>' +
				'<div style="overflow:hidden;">' +
					'<div id="{@id}-legend-List"></div>' +
				'</div>' +
				'<canvas style="z-index:-1;"></canvas>' + 
			'</div>' ,
			
        /**
         * @ignore
         */
        markupSlots: {
		// the element that holds the titlebar and attributes
		legendBarDiv: function(){return this.domNode;},
		
		// the element that holds the titlebar and attributes
		legendBarSwitcher: function(){return this.domNode.firstChild;},
		
		// list container
		legendListDivContainer: function(){return this.domNode.childNodes[1];},
		// the element that holds the titlebar and attributes
		legendListDiv: function(){return this.domNode.childNodes[1].firstChild;},
		
		// the element that holds the titlebar and attributes
		legendCanvas: function(){return this.domNode.childNodes[2];}
        },
	
	switchLegendBar : function switchLegendBar(){	    
	    this.isLegendBarOpen = !this.isLegendBarOpen;
	    
	    this.calculateAndSetLegendWidth();
	    
	    this.widget.reDrawChart();
	  
	    this.renderLegend();
	    
	     this.widget.arrangeLegendBar();
	     
	     setScrollerPosition.call(this);
	},
	
	 renderLegend: function albar() {
		var model = this.model,
			s = model.series,
			h = this.h,
			utils = this.utils,
			sl = s.length,
			ch = model.colHeaders,
			sc = this.legendBarSwitcher.childNodes[0],
			so = this.legendBarSwitcher.childNodes[1],
			scStyle = sc.style,
			soStyle = so.style,
			lc = this.legendCanvas.getContext('2d'),
			legendListDiv = this.legendListDiv,
			legendBarSwitcher = this.legendBarSwitcher;
		
		
		
		this.legendBarDiv.style.width = this.legendBarWidth + 'px';
		this.legendBarDiv.style.height = h + 'px';
		legendListDiv.style.width = this.legendBarWidth+ 'px';
		
		legendBarSwitcher.width = this.legendBarWidth;
		legendBarSwitcher.height = 40;
		legendBarSwitcher.style.height = "40px";
		legendBarSwitcher.style.width = this.legendBarWidth + 'px';
		
		this.legendCanvas.width = this.legendBarWidth;
		this.legendCanvas.height = h;
		
		 if(this.isLegendBarOpen){
			 if(this.isAndroidTab){
				 so.className = 'mstrmojo-timeseries-legend-switcher-span mstrmojo-timeseries-legend-switcher-opened-large';
			 }
			 soStyle.display = 'block';
			 soStyle.height = '15px';
			 soStyle.width = '15px';
			 scStyle.display = 'none';
			 legendListDiv.style.display = 'block';
			 if(legendListDiv.childNodes.length == 0){
				 for(var i = 0; i < sl; i++){
					 var legendAttr = document.createElement("div");
					 legendAttr.id = 'legendAttr';
					 legendAttr.className = 'timeseries-legendAttr';
					 legendAttr.innerHTML = this.widget.getLegendName(ch,s,i);
					 legendAttr.setAttribute("clk", "LA");
					 legendAttr.setAttribute("vIndex",i);
					 legendAttr.style.position = 'relative';					 					
					 ci = i % 6;
					  var  clr = this.chartLineColors[ci];
					 legendAttr.style.color = clr ;
					 
					 legendListDiv.appendChild(legendAttr);
				 }
			 }
			 this.legendListDivContainer.style.height = (this.h - legendBarSwitcher.height) + "px";
			 this.legendListDivContainer.style.weight = this.legendBarWidth +"px";
			 this._scroller.updateScrollBars();
			 if(this.isLegendSelected){
				this.legendListDiv.childNodes[this.legendSelectedIndex].className = 'timeseries-legendAttr legend-highlight';
			}
			 //draw the convas 
			this.legendCanvas.height = h ;
			this.legendCanvas.style.position = "absolute";
			this.legendCanvas.style.top = "0px";
			this.legendCanvas.style.left = "0px";
						
			this.drawLegendOutline(h, legendBarSwitcher.height, lc);				 
		 }
		 else{
			  if(this.isAndroidTab){
				 sc.className = 'mstrmojo-timeseries-legend-switcher-span mstrmojo-timeseries-legend-switcher-closed-large';
			 }
			legendListDiv.style.display = 'none';
			soStyle.display = 'none';
			scStyle.display = 'block';
			scStyle.height = '15px';
			scStyle.width = '15px';
			 
			  //draw the convas 
			this.legendCanvas.height = h ;
			this.legendCanvas.style.position = "absolute";
			this.legendCanvas.style.top = "0px";
			this.legendCanvas.style.left = "0px";
				
			this.drawLegendOutline(h, legendBarSwitcher.height, lc);
			lc.save();
			 var x = this.legendBarWidth/2;
			 var y = 25;
			 var y_axis_interval = 30;
			 var r = 5;
			 for(var i = 0; i < sl; i++){
					  
				ci = i % 6;
				var  clr = this.chartLineColors[ci];
				lc.fillStyle = clr;
				y +=y_axis_interval;
				utils.drawArc(this, x, y, r, 0, Math.PI * 2, true, true, lc);
			}
			lc.restore();
			
		 }
        },
        
        drawLegendOutline: function drawLegendOutline(totalH, switcherH, context){
        	var utils = this.utils;
        	context.save();
        	utils.fillBackground(this.widget, this.legendBarWidth, totalH, context);
        	context.strokeStyle = '#58595B';
        	context.lineWidth = 2;
			utils.drawHalfRoundedRectangle(this, 2, 2, this.legendBarWidth, totalH-4, 20, false, context);
			var gradient = context.createLinearGradient(0, 0, this.legendBarWidth, 0);
			gradient.addColorStop(0, '#58595B');
        	gradient.addColorStop(1, '#222222');
        	context.strokeStyle = gradient;
			  utils.drawLineSet(this, [{
				x: 2,
				y: switcherH
			}, {
				x: this.legendBarWidth,
				y: switcherH
			}], false, context);
			context.restore();
        },

		calculateMaxLegendAttrLength: function calculateMaxLegendAttrLength(){
			var model = this.model,
				s = model.series,
				sl = s.length,
				ch = model.colHeaders;
			for(var i = 0; i < sl; i++){
				 var tmpLegendLength = 0;
				 var legendName = this.widget.getLegendName(ch,s,i); 
				 tmpLegendLength = this.widget.getTextWidth(legendName,"Helvetica",10)+ 20;
				 this.maxLegendAttrLength = Math.max(this.maxLegendAttrLength,tmpLegendLength);
			 }
		},
		
		calculateAndSetLegendWidth: function cLegendWidth(){
			
			if(this.isLegendBarOpen){
				var maxLegendBarWidth = (this.widget.getWidth() - 50)*0.3+20;
				this.legendBarWidth = Math.min(maxLegendBarWidth, this.maxLegendAttrLength);
		    }
		    else{
		    	if(this.isAndroidTab){
		    		this.legendBarWidth = 40;
		    	}
		    	else{
		    		this.legendBarWidth = 30;
		    	}
		    }
			//this.widget.legendBarWidth = this.legendBarWidth;
			//this.widget.isLegendBarOpen = this.isLegendBarOpen;
			this.widget.setlegendStatus(this.isLegendBarOpen, this.legendBarWidth);
		},
	
		postBuildRendering: function postBR() {
			this.calculateMaxLegendAttrLength();
			
			this.calculateAndSetLegendWidth();
			
			this.scrollerConfig.scrollEl = this.legendListDiv;
		
			if (this._super) {
				this._super();
			}
			this.renderLegend();
		
		    setScrollerPosition.call(this);
		},
		
		 initScroller: function initScroller(scroller) {
			scroller.vScroll = true;

			this._super(scroller);
		},
		
	 touchTap: function touchBegin(touch) {
		    // check if we have touched on clickable element if yes call handle on click ignore otherwise
		    var item = getTouchedElement.call(this, touch);
		    if (item) {
				var value = item.value;
				if (value === 'C' ){
					this.switchLegendBar();
				} else if(value === 'LA'){
					var itemIndex = mstrmojo.dom.findAncestorByAttr(touch.target, "vIndex", true, this.domNode);
					if(itemIndex){
						this.handleLegendItemTap(parseInt(itemIndex.value, 10));
					}
				}
				else {
				    // Handle item click and return false so events cease.
				//    this.handleOnClick(item);
				    return false;
				}
	
				// Was a scrollable element NOT clicked?
		    } 
		},
		
		touchSelectBegin: function touchSelectBegin(touch) {
			var item = getTouchedElement.call(this, touch);
			if (item) {
				var value = item.value;
				if (value === 'LA' ){
					var itemIndex = mstrmojo.dom.findAncestorByAttr(touch.target, "vIndex", true, this.domNode);
					if(itemIndex){
						var fontSize = (parseInt(itemIndex.value, 10) == this.legendSelectedIndex )?14:10; 
						var tmpItemLength = this.widget.getTextWidth(item.node.innerHTML,"Helvetica",fontSize)+ 20;
						if(tmpItemLength > this.legendBarWidth){
						//	var tooltipY = touch.pageY - this.offsetTop-25;
							var tooltipY = item.node.offsetTop+ this.widget.margin.t -5;	
							this.widget.showLegendTooltip(item.node.innerHTML,tooltipY);
						}
					}
				}
			}
		},
		
		touchSelectEnd: function touchSelectEnd(touch) {
			var item = getTouchedElement.call(this, touch);
			if (item) {
				var value = item.value;
				if (value === 'LA' ){
					
							this.widget.hiddenLegendTooltip();
						
				}
			}
		},
				
		handleLegendItemTap:function handleLegendItemTap(vIndex){
			if(this.isLegendSelected){
				if( this.legendSelectedIndex === vIndex){
					this.isLegendSelected  =  false;
					this.legendListDiv.childNodes[vIndex].className = 'timeseries-legendAttr';
					this.legendSelectedIndex  = -1;
				}else{
					this.legendListDiv.childNodes[this.legendSelectedIndex].className= 'timeseries-legendAttr';
					//this.legendListDiv.childNodes[this.legendSelectedIndex].style.textShadow = '';
					this.legendSelectedIndex =  vIndex;
					this.legendListDiv.childNodes[vIndex].className = 'timeseries-legendAttr legend-highlight';
					//this.legendListDiv.childNodes[vIndex].style.textShadow = '0 0 20px #fff';
				}
			}else{
				this.isLegendSelected = true;
				this.legendSelectedIndex =  vIndex;
				this.legendListDiv.childNodes[vIndex].className = 'timeseries-legendAttr legend-highlight';
				//this.legendListDiv.childNodes[vIndex].style.textShadow = '0 0 20px #fff';
			}
			this.widget.setLegendSelected(this.isLegendSelected,this.legendSelectedIndex);
			this.widget.reDrawChart();
		}
    });

})();