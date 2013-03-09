(function() {

    mstrmojo.requiresCls("mstrmojo.Vis",
                         "mstrmojo.color",
                         "mstrmojo._TouchGestures"
    					 );
    
    /**
     * Handles the touch begin event.
     * @private
     */
    function handleTouchBegin(widget, touchX, touchY) {
        widget.tooltipOn = true;
        if (!browserSupportsHtml5) {
        	return;
        }
        
        handleTouchMove(widget, touchX, touchY);
    }
    
    /**
     * Handles the touch move event. The method positions the tooltip and calls highlightPoint()
     * @private
     */
    function handleTouchMove(widget, touchX, touchY) {
        if (!widget.tooltipOn || !browserSupportsHtml5) {
            return;
        }

    	touchX = touchX - widget.offsetLeft;
    	touchY = touchY - widget.offsetTop;

        //Get the index of the values array that matched the x coordinate where the event happened.
        var touchVal = widget.getTouchValue(touchX,touchY);   
        
		// for the current area find its index in mojo data
        var hdrIndex = widget.getHeaderIndex(touchVal);
        
        if (!touchVal || !widget.model.gvs.items[hdrIndex]) {//The points does not fall within a valid area
        	// hide tooltip
        	handleTouchEnd(widget);
        } else if (touchVal != widget.currentHighlight) { 
        	//cache the highlight
        	widget.currentHighlight = touchVal;

        	//Call the method that will highlight the current point 
        	widget.highlightPoint(touchVal);
        	
        	//render the tooltip
        	widget.renderTooltip(touchVal, touchX, touchY, hdrIndex);
        }
    }

    /**
     * Handles the touch end event.
     * @private
     */
    function handleTouchEnd(widget) {
        widget.tooltipOn = false;
        
        //erase the highlight context.
        widget.highlightContext.clearRect(0, 0, widget.getWidth(), widget.getHeight());
        
        //fadeout the tooltip
        widget.tooltip.className = widget.tooltip.className.replace(" fadeIn", "");
        
        widget.currentHighlight = null;
    }

    /**
     * A Vis Map widget
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.VisMap = mstrmojo.declare(
		// superclass
		mstrmojo.Vis,

		// mixins
		[ mstrmojo._TouchGestures ],
        
        /**
         * @lends mstrmojo.VisMap.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: 'mstrmojo.VisMap',
            
            /**
             * The list of items to display.
             * 
             * @type Array
             */
            model: null,
            
            /**
             * The width of the Map Widget
             * @type Integer
             */
            width: 700,
            
            /**
             * The height of the Map Widget
             * @type Integer
             */
            height: 500,
            
            /**
             * @ignore
             */
            context: null,
            
			browserSupportsHtml5: true,
            
            /**
             * @ignore
             */
            markupString: '<div id="{@id}" class="mstrmojo-Chart {@cssClass}" style="width:{@width};height:{@height};top:{@top};left:{@left};position:relative;{@cssText};overflow:auto;" ' +
                              ' mstrAttach:mouseover,mousemove ' +                             
                              '><canvas width="{@width}" height="{@height}"></canvas>' + 
                              '<canvas style="position:absolute;left:0;top:0" width="{@width}" height="{@height}"></canvas>' + 
                              '<canvas style="position:absolute;left:0;top:0" width="{@width}" height="{@height}"></canvas>' +
                              '<div id="{@id}-tooltip" class="mstrmojo-Map-tooltip"></div>' +
                        '</div>',
                        
            /**
             * @ignore
             */
            markupSlots: {
                //the main canvas of the Chart
                canvas: function(){ return this.domNode.firstChild; },
                
                //the canvas used for hihglighting points
                highlightCanvas: function(){ return this.domNode.childNodes[1]; },
                
                //the base canvas for animation @TODO: each animation should create independent canvas objects
                animationCanvas: function(){ return this.domNode.childNodes[2]; },
                
                //the tooltip display when highlighting points
				tooltip: function(){ return this.domNode.childNodes[3]; }
            },
            
            
            /**
             * @ignore
             */
            postBuildRendering: function postBR(){            
            	if (this._super) {
            		this._super();
            	}

            	browserSupportsHtml5 = this.canvas.getContext; 
            	if (!browserSupportsHtml5) {
            		this.renderErrorMessage(mstrmojo.desc(8126,'Your browser does not support HTML5')); 
            		return;
            	}

            	//cache the different canvas' context objects in the Widget
            	this.context = this.canvas.getContext('2d');
            	this.highlightContext = this.highlightCanvas.getContext('2d');
            	this.animationContext = this.highlightCanvas.getContext('2d');


            	if (!this.model.coords) { // android binary
            		if(typeof(mstrApp) != 'undefined' && mstrApp.serverRequest) {
                    	//make the xhr call get the map coords data using task and add it to the model before
                    	// calling the drawMap function.
                    	var me = this;
                    	var xhrCfg = {
                                success: function(res) {
                            		if (!res) {
                            			return;
                            		}
                            		me.model.coords = res.coords;
                            		
                            		//trigger the Chart's plot method
                            		me.drawMap();
                                },
                                
                                failure: function(res) {
                                	me.renderErrorMessage(mstrmojo.desc(8428,'Error loading coordinates file') + ': ' + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                }
                                                        
                            };
                    	
                    	params = {
                    			taskId: 'getMapCoordinates'
                    	};
                    	var vp = this.model.vp;
                    	if (vp && vp.mf) {
                    		params.coordinatesFile = vp.mf; 
                    	}
            			mstrApp.serverRequest(params,xhrCfg,{src:"postBuildRendering"});
            		}
            	} else { // regular DHTML
            		this.drawMap();
            	}
            },
            
            /**
             * Called to render the Map elements
             */
            drawMap: function drwmp() {

            	this.context.lineWidth = 2;
            	this.context.strokeStyle = '#AAAAAA';
            	var m = this.model,
            		coords = m.coords;

				// add ligher versions of the thresholds color to the model
				if (m && m.th) {
					for (var i in m.th) {
						m.th[i].l = this.getLighterColor(m.th[i].n);
					}
				}
				
				// scale map
				var maxX = 0;
				var maxY = 0;
				for (var i in coords) {
					var rgn = coords[i];
					for (var j in rgn) {
						var c = rgn[j];
						for (var k=0; k < c.length; k++) {
							if (c[k] > maxX) {
								maxX = c[k];
							}
							k++;
							if (c[k] > maxY) {
								maxY = c[k];
							}
						}
					}					
				}
				
				var xRatio = maxX/this.getWidth(),
					yRatio = maxY/this.getHeight();
				
				if (xRatio > 1 || yRatio > 1 || xRatio < 0.8 || yRatio < 0.8) { //scale 
					var ratio = Math.max(yRatio, xRatio)*1.05; // add some padding
					for (var i in coords) {
						var rgn = coords[i];
						for (var j in rgn) {
							var c = rgn[j];
							for (var k=0; k < c.length; k++) {
								c[k] = parseInt(c[k]/ratio);
							}
						}					
					}
				}
             	
            	var defClr = '#AAAAAA'; // default lighter color
            	if (m.vp && m.vp.npc) { // read default color from vis props
            		defClr = '#' + m.vp.npc;
            	}
            	var deflClr = this.getLighterColor(defClr); // default lighter color 
             	
            	// loop through all areas on the coords 
            	for (var elem in coords) {
            		// for the current area find its index in mojo data
					var hdrIndex = this.getHeaderIndex(elem);
					
					// start with default color
					var clr = defClr; 
					var lclr = deflClr;
					
					if (hdrIndex >= 0) { //find threshold color
						var mv = m.gvs.items[hdrIndex].items[0];
						if (mv && mv.ty == 2) {
							var ti = mv.ti;
							if (typeof(ti) != 'undefined') {
								var thld = m.th[ti]; // threshold object
								clr = thld.n;
								lclr = thld.l;
							}
						}
					}
					this.drawPoly(this.context, coords[elem], clr, lclr);
				}				
			},
			
			getHeaderIndex: function gthdrindx(headerName) {
				var hdrIndex = -1;
				var hdrs = this.model.gts.row[0].es;
				for (var i=0; i<hdrs.length;i++) {
					if (hdrs[i].n && headerName && (hdrs[i].n.toLowerCase() == headerName.toLowerCase())) {
						hdrIndex = i;
						break;
					}
				}
				return hdrIndex;
			},
			
			drawPoly: function drwply(ctx, coordsArray, clr, lclr) {
				try {
					for( var i = 0; i < coordsArray.length; i++ ) {
						var pointsArray = coordsArray[i];
						// init min/max values
						var minX = pointsArray[0];
						var minY = pointsArray[1];
						var maxY = pointsArray[1];

						ctx.beginPath();
						ctx.moveTo(pointsArray[0], pointsArray[1]);
						for (var j = 2; j < pointsArray.length-1; j = j+2) {
							var x = pointsArray[j];
							var y = pointsArray[j+1];

							ctx.lineTo(x, y);

							// init min/max values
							if (y > maxY) maxY = y;
							if (x < minX) minX = x;
							if (y < minY) minY = y;					
						}

						// build gradiend with threshold color
						if (lclr) {
							var grd = ctx.createLinearGradient(minX, minY, minX, maxY);
							grd.addColorStop(0, clr);
							grd.addColorStop(0.5, lclr);

							ctx.fillStyle = grd;
						} else {
							ctx.fillStyle = clr;
						}
						ctx.stroke();
						ctx.fill();
					}
				} catch (e) {
					//ignore
				}
			},
			
            /**
             * Called to highlight a single data point. Implemetation left empty for Map Widgets. 
             * @param {Integer} [x] the x axis point to highlight
             */
			highlightPoint: function hghlghtpnt(x) {
				var ctx = this.animationContext;
				// clear canvas
				ctx.clearRect(0,0,this.getWidth(),this.getHeight());
				
				// re-render polygon with white border and half transparency
				ctx.strokeStyle = "#FFFFFF";
				this.drawPoly(ctx, this.model.coords[x], 'rgba(255, 255, 255, 0.5)');
			},
			
			/**
			 * Returns the selected value (null if nothing is selected)
			 * @param x the x position of the click event
			 * @param y the y position of the click event
			 * @return the selected value (null if nothing is selected)
			 */
			getTouchValue: function gtvlindx(x,y) {
				//find clicked area
				for (var elem in this.model.coords) {
					var coordsArray = this.model.coords[elem],
						l = coordsArray.length;
					for(var i = 0; i < l; i++ ) {
						if (this.inPoly(coordsArray[i], x, y)) {
							return elem;
						}
					}
            	}
				return null;
		    },
		    		    			
			renderTooltip: function rndrttp(touchVal, touchX, touchY, hdrIndex) {
        		//Set the tooltip text
        		// Build the points display text 
				var gts = this.model.gts;
				if (hdrIndex >=0) {
					var html = gts.row[0].n + ': ' + touchVal;
					var i;
					for (i = 0; gts && gts.col && i < gts.col[0].es.length; i++) {
						var mv = this.model.gvs.items[hdrIndex].items[i]; 
						var v = mv.v;
						if (mv.ty == 4) { // image threshold
							v = '<img src="' + v + '" >';
						}
						html += '<br>' + gts.col[0].es[i].n + ': ' + v;						
					}					 
					this.tooltip.innerHTML = html;
				}

            	//Set the tooltip position
				if (touchX + this.tooltip.offsetWidth > this.getWidth()) { // exceeds the width
					touchX = touchX - this.tooltip.offsetWidth;
				}
				
            	this.tooltip.style.webkitTransform = 'translate3d(' + touchX + 'px, ' + touchY + 'px, 0)';
            	this.tooltip.style.MozTransform = 'translate(' + touchX + 'px, ' + touchY + 'px)';
            	this.tooltip.style.msTransform = 'translate(' + touchX + 'px, ' + touchY + 'px)';

        		//Fade the tooltip in
        		if (this.tooltip.className.indexOf("fadeIn") < 0) {
        			this.tooltip.className = this.tooltip.className + " fadeIn";
        		} 
			},

			inPoly: function inPoly(poly, px, py) {
				var npoints = poly.length; // number of points in polygon
				var xnew,ynew,xold,yold,x1,y1,x2,y2,i;
				var inside=false;

				if (npoints/2 < 3) { // points don't describe a polygon
					return false;
				}
				xold=poly[npoints-2];
				yold=poly[npoints-1];

				for (i=0 ; i < npoints ; i=i+2) {
					xnew=poly[i];
					ynew=poly[i+1];
					if (xnew > xold) {
						x1=xold;
						x2=xnew;
						y1=yold;
						y2=ynew;
					} else {
						x1=xnew;
						x2=xold;
						y1=ynew;
						y2=yold;
					}
					if ((xnew < px) == (px <= xold) && ((py-y1)*(x2-x1) < (y2-y1)*(px-x1))) {
						inside=!inside;
					}
					xold=xnew;
					yold=ynew;
				}
				return inside;
			},

			getLighterColor : function getLighterColor(c) {
				var rgb = mstrmojo.color.hex2rgb(c);
				var lighterRgb = [Math.floor(rgb[0]*.75), Math.floor(rgb[1]*.75), Math.floor(rgb[2]*.75)];
				return 'rgb(' + lighterRgb[0] + ',' + lighterRgb[1] + ',' + lighterRgb[2] + ')';
			},
		    
            /**
             * @ignore
             */
            onmouseover: function(evt) {
				if(!this.isAndroid) {
					handleTouchBegin(this, evt.e.pageX, evt.e.pageY);
				}
            },
            
            /**
             * @ignore
             */
			onmousemove: function(evt) {
            	if(!this.isAndroid) {
            		handleTouchBegin(this, evt.e.pageX, evt.e.pageY);
            	}
      		},
            
            touchBegin: function touchBegin(touch) {
      			handleTouchBegin(this, touch.pageX, touch.pageY);
			},
			
			touchSwipeMove: function touchSwipeBegin(touch) {
				handleTouchBegin(this, touch.pageX, touch.pageY);
			},
			
			touchEnd: function touchEnd(touch) {
				 handleTouchEnd(this);
			 }

        }
    );
        
})();