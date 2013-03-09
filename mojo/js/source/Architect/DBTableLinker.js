(function() {

    mstrmojo.requiresCls("mstrmojo.Vis","mstrmojo.color");

   
    
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
       
    }

   

    /**
     * A Vis Map widget
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.DBLinker = mstrmojo.declare(
		// superclass
		mstrmojo.Vis,
		
		// mixins
		null,
        
        /**
         * @lends mstrmojo.DBLinker.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: 'mstrmojo.DBLinker',
            
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
			
			links: [],
            
            /**
             * @ignore
             */
			markupString: '<div id="{@id}" class="mstrmojo-Chart {@cssClass}" style="width:{@width}px;height:{@height}px;position:relative;{@cssText};overflow:auto;" ' +
					            ' mstrAttach:mouseover,mousemove ' +                             
					            '><canvas width="{@width}px" height="{@height}px"></canvas>' + 
					            '<canvas style="position:absolute;left:0;top:0" width="{@width}px" height="{@height}px"></canvas>' +
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
            		this.renderErrorMessage(mstrmojo.desc(8126)); // Descriptor: Your browser does not support HTML5 
            		return;
            	}

            	//cache the different canvas' context objects in the Widget
            	this.context = this.canvas.getContext('2d');
            	this.highlightContext = this.highlightCanvas.getContext('2d');
            	this.animationContext = this.highlightCanvas.getContext('2d');
            	this.drawLinks();
            },
            
             /**
             * Draw Links
             */
            	drawLinks: function drawLinks() {
            	this.clearCanvas();
             	for (i=0; i< this.links.length; i++)
             	{
              		relationship=this.links[i];
             		srcID=relationship[1];
             		trgID=relationship[2];
             		src=mstrmojo.all[srcID];
             		trg=mstrmojo.all[trgID];
             		srcAnchor=parseInt(src.leftAnchor());
             		dstAnchor=parseInt(trg.leftAnchor());
             		if (srcAnchor< dstAnchor)
             			{
             			srcAnchor=parseInt(src.rightAnchor());
             			}
             		else
             			{
             			dstAnchor=parseInt(trg.rightAnchor());
             			}
 					this.drawLine(srcAnchor,parseInt(src.topAnchor()), dstAnchor ,parseInt(trg.topAnchor()) );
             	}
             	this.context.stroke();
             },
             
            /**
             * Add Links
             */
            	addLinks: function addLinks(src , trg) {
              	relationship= new Array(2);
             	relationship[1]=src.id;
             	relationship[2]=trg.id;
				this.links.push(relationship);
				//this.drawLinks();
             },
            
            
            /**
             * Observable Moved
             */
            	
            	ObsMoved: function ObsMoved(obs) {
             	this.drawLinks();
             },
            
            
            /**
             * Clear the canvas
             */
            clearCanvas: function clearCanvas() {
             	this.context.clearRect(0,0,this.width, this.height);
            	this.context.beginPath();
             },
            
            
            /**
             * Draw  a  Line
             */
            drawLine: function drwLine(x1, y1, x2, y2) {
            	 var offset = 12;
            	 
              	 if(x2 > x1)
            	 {
            		 x2p=x2-offset;
            		 x1p=x1+offset;
            	 } 
            	 else 
            	 {
            		 x2p=x2+offset;
            		 x1p=x1-offset;
            	 }
            	this.context.moveTo (x1,y1);
            	this.context.lineTo(x1p,y1);
            	this.context.lineTo (x2p,y2);
            	this.context.lineTo (x2,y2);
            	
            },
            
           
			
			/**
			 * Returns the selected value (null if nothing is selected)
			 * @param x the x position of the click event
			 * @param y the y position of the click event
			 * @return the selected value (null if nothing is selected)
			 */
			getTouchValue: function gtvlindx(x,y) {
				//find clicked area
				if(!this.model) return null;
				
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
				if (touchX + this.tooltip.offsetWidth > this.width) { // exceeds the width
					touchX = touchX - this.tooltip.offsetWidth;
				}
				
            	this.tooltip.style.webkitTransform = 'translate3d(' + touchX + 'px, ' + touchY + 'px, 0)';
            	this.tooltip.style.MozTransform = 'translate(' + touchX + 'px, ' + touchY + 'px)';

        		//Fade the tooltip in
        		if (this.tooltip.className.indexOf("fadeIn") < 0) {
        			this.tooltip.className = this.tooltip.className + " fadeIn";
        		} 
			},

            /**
             * @ignore
             */
            onmouseover: function(evt) {
                handleTouchBegin(this, evt.e.pageX, evt.e.pageY);
            },
            
            /**
             * @ignore
             */
			onmousemove: function(evt) {
            	handleTouchBegin(this, evt.e.pageX, evt.e.pageY);
      		}
        }
    );
        
})();