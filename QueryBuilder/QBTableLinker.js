(function() {

	mstrmojo.requiresCls("mstrmojo.Vis", "mstrmojo.color");

	/**
	 * Handles the touch begin event.
	 * 
	 * @private
	 */
	    var _C = mstrmojo.css;
	    var $D = mstrmojo.dom;
	    
	function handleTouchBegin(widget, touchX, touchY) {
		widget.tooltipOn = true;
		if (!browserSupportsHtml5) {
			return;
		}

		handleTouchMove(widget, touchX, touchY);
	}

	/**
	 * Handles the touch move event. The method positions the tooltip and calls
	 * highlightPoint()
	 * 
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
	mstrmojo.QB.QBTableLinker = mstrmojo
			.declare(
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
						scriptClass : 'mstrmojo.QB.QBTableLinker',


						/**
						 * The width of the Map Widget
						 * 
						 * @type Integer
						 */
						width : null,

						/**
						 * The height of the Map Widget
						 * 
						 * @type Integer
						 */
						height : 0,
						
						

						context :0,
						
						

						browserSupportsHtml5 : true,

						
						
	                    markupString : '<div id="{@id}" class="mstrmojo-Chart {@cssClass}" style="position:absolute;left:0px;top:0px;width:{@width}px;height:{@height}px;overflow:hidden;" '
								+ ' mstrAttach:mouseover,mousemove,click '
								+ '><canvas width="{@width}px" height="{@height}px"></canvas>'
								+ '<canvas style="position:absolute;left:0;top:0" width="{@width}px" height="{@height}px"></canvas>'
								+ '<div id="{@id}-tooltip" class="mstrmojo-Map-tooltip"></div>'
								+ '</div>',

						markupSlots : {
							// the main canvas of the Chart
							canvas : function() {
								return this.domNode.firstChild;
							},

							// the canvas used for hihglighting points
							highlightCanvas : function() {
								return this.domNode.childNodes[1];
							},

							// the tooltip display when highlighting points
							tooltip : function() {
								return this.domNode.childNodes[2];
							}
						},

						postBuildRendering : function postBR() {
							if (this._super) {
								this._super();
							}

							browserSupportsHtml5 = this.canvas.getContext('2d');
							if (!browserSupportsHtml5){
									this.renderErrorMessage(mstrmojo.desc(8126)); // Descriptor:
																				// Your
																				// browser
																				// does
																				// not
																				// support
																				// HTML5
									return;
							}

							// cache the different canvas' context objects in
							// the Widget
							if (browserSupportsHtml5){
								this.context = this.canvas.getContext('2d');
								this.highlight=this.highlightCanvas.getContext('2d');
							}
							else{
								this.createVMLCanvas();
								
							}
							
								
							this.model=mstrmojo.all.QBuilderModel;

						},

						/**
						 * GetPosition
						 */
						getCordValue : function getCordValue(strCord) {
							// remove the px from the string
							// CordValue=strCord.substr(0,(strCord.length-2));
							return CordValue;
						},

						/**
						 * Draw Links
						 */
						drawLinks : function drawLinks() {
							this.clearCanvas();
							var qdl=mstrmojo.all.QBuilderModel;
							if(qdl.linkerNeedRender){
								this.render();
								qdl.linkerNeedRender=false;
							}
							var joins=this.model.joinsInfo;
							for (var jid in joins) {
								   var join=joins[jid],
								       links=join.links;
								for( linkid in links ){
						           var srcw =links[linkid].srcw,
								       tgtw= links[linkid].tgtw,
								       srct = srcw.parent.parent,
								       tgtt=  tgtw.parent.parent,
								       srctLeft = parseInt(srct.leftAnchor()),
								       srctRight= parseInt(srct.rightAnchor()),
								       tgttLeft=parseInt(tgtt.leftAnchor()),
								       tgttRight=parseInt(tgtt.rightAnchor()),
								       srctWidth=srct.containerNode.clientWidth,
								//tgttWidth=tgtt.domNode.clientHeight,
							          spos = $D.position(srcw.domNode),
							          tpos=$D.position(tgtw.domNode),
							          canvas_pos=$D.position(this.domNode),
							          srcw_container_pos=$D.position(srct.containerNode),
							          tgtw_container_pos=$D.position(tgtt.containerNode);
						     //Calculate the y value for source and target
							    if(spos.y>srcw_container_pos.y && spos.y+0.5*spos.h<srcw_container_pos.y+srcw_container_pos.h)
							     srcwy =spos.y-canvas_pos.y+0.5*srcw.domNode.clientHeight;
							    else
								 srcwy=srcw_container_pos.y-canvas_pos.y-0.5*srct.titleNode.clientHeight;
							    if(tpos.y>tgtw_container_pos.y&&tpos.y+0.5*tpos.h<tgtw_container_pos.y+tgtw_container_pos.h)
							     tgtwy =tpos.y-canvas_pos.y+0.5*tgtw.domNode.clientHeight;
							    else
								 tgtwy=tgtw_container_pos.y-canvas_pos.y-0.5*tgtt.titleNode.clientHeight; 
							    //Draw lines and calculate poly based on three different positions 
							    if (tgttLeft>srctLeft+0.5*srctWidth) {
									srcwx=srctRight;
									srcwx1=srcwx+20;
									tgtwx=tgttLeft;
									tgtwx1=tgtwx-20;
								    }
								
							    else if(tgttLeft>srctLeft && tgttLeft<srctLeft+0.5*srctWidth) {
							    	srcwx=srctRight;
									srcwx1=srcwx+20;
									tgtwx=tgttRight;
									tgtwx1=tgtwx+20;
							    }
							    
							    else if(tgttLeft<srctLeft&&tgttRight>srctLeft+0.5*srctWidth){
							    	srcwx=srctLeft;
									srcwx1=srcwx-20;
									tgtwx=tgttLeft;
									tgtwx1=tgtwx-20;
							    }
							    
							    else{
							    	srcwx=srctLeft;
									srcwx1=srcwx-20;
									tgtwx=tgttRight;
									tgtwx1=tgtwx+20;
							    }
							    
							    links[linkid].marker=[{x:srcwx,y:srcwy},{x:srcwx1,y:srcwy},{x:tgtwx1,y:tgtwy},{x:tgtwx,y:tgtwy}];
						        links[linkid].coords=[ srcwx, srcwy + 5, srcwx,
											srcwy - 5, srcwx1, srcwy - 5,
											tgtwx1, tgtwy - 5, tgtwx,
											tgtwy - 5, tgtwx, tgtwy + 5,
											tgtwx1, tgtwy + 5, srcwx1,
											srcwy + 5 ];
								this.drawLine(srcwx, srcwy, srcwx1, srcwy);
								this.drawLine(srcwx1, srcwy, tgtwx1,
											tgtwy);
								this.drawLine(tgtwx1, tgtwy, tgtwx, tgtwy);
								switch(join.jt){
								case '3': //Full Outer Join
								   {
									this.drawLine(srcwx,srcwy, 0.5*(srcwx+srcwx1),srcwy+5);
									this.drawLine(srcwx,srcwy, 0.5*(srcwx+srcwx1),srcwy-5);
									this.drawLine(tgtwx,tgtwy, 0.5*(tgtwx+tgtwx1),tgtwy-5);
									this.drawLine(tgtwx,tgtwy, 0.5*(tgtwx+tgtwx1),tgtwy+5);
									break;
								   }
								case '1': //Left Outer Join
								   {
									  this.drawLine(srcwx,srcwy, 0.5*(srcwx+srcwx1),srcwy+5);
									  this.drawLine(srcwx,srcwy, 0.5*(srcwx+srcwx1),srcwy-5);
									break;
									
								   }
								case '2': //Right Outer Join
								   {
									   this.drawLine(tgtwx,tgtwy, 0.5*(tgtwx+tgtwx1),tgtwy-5);
									   this.drawLine(tgtwx,tgtwy, 0.5*(tgtwx+tgtwx1),tgtwy+5);
										
									break;
								   }

			   				    default: {	// 0	Inner Join		 
			   				        break;
			   			        }
								
								}
						   }
						}
							if (browserSupportsHtml5){
								this.context.stroke();
							}
							this.drawMarker();
						},

						
                 
					
						/**
						 * Clear the canvas
						 */
						clearCanvas : function clearCanvas() {
							if (browserSupportsHtml5){
							this.context.clearRect(0, 0, this.width,
									this.height);
							this.context.beginPath();
							}
							else{
								var canvas = document.getElementById("vmlCanvas");
								if ( canvas.hasChildNodes() )
								{
								    while ( canvas.childNodes.length >= 1 )
								    {
								    	canvas.removeChild( canvas.firstChild );  
								    } 
								    this.createVMLCanvasFrame();
								}
	
							}
						},
						
						clearHighLightCanvas: function(){
							if (browserSupportsHtml5){
							this.highlight.clearRect(0, 0, this.width,
									this.height);
							this.highlight.beginPath();
							}
						},
						
						drawMarker: function(){
							if (browserSupportsHtml5){
							this.clearHighLightCanvas();
							if(!this.model.selLink)return;
							var mdl=this.model;
							var ele=mdl.joinsInfo[mdl.selLink[0]].links[mdl.selLink[1]].marker,
				                ctx=this.highlight;
							for(var i=0, len=ele.length; i<len; i++)
							{
						    ctx.strokeStyle = "blue";
							ctx.beginPath();
							ctx.arc(ele[i].x, ele[i].y, 3, 0, Math.PI*2, true); 
							ctx.closePath();
							ctx.stroke();
							}}
						},

						/**
						 * Draw a Line
						 */
						drawLine : function drwLine(x1, y1, x2, y2) {
							if (browserSupportsHtml5){
								this.context = this.canvas.getContext('2d');
								this.context.moveTo(x1, y1);
								this.context.lineTo(x2, y2);
							}
							else{
								var line = document.createElement("v:line");
								line.setAttribute("from", x1 + " " + y1 );
								line.setAttribute("to", x2 + " "+ y2  );
								document.getElementById("vmlCanvas").appendChild(line);		
							}
						},
						
						createVMLCanvasFrame: function cVMLCF(){
							var rect = document.createElement("v:rect");
						    rect.setAttribute("id", "vmlFrame");
						    rect.setAttribute("stroke","true");
						    rect.setAttribute("strokecolor","red");
						    rect.style.width =this.width ;
						    rect.style.height = this.height;
						    rect.style.zindex="-1";
						    document.getElementById("vmlCanvas").appendChild(rect);
						},
						

						/**
						 * Create the VML Canvas
						 */
						createVMLCanvas: function cVMLC(){
							var pixelWidth=parseInt(this.width);
							var pixelHeight=parseInt(this.height);
							var vml = document.createElement("v:group");
						    vml.setAttribute("id", "vmlCanvas");
						    vml.style.width = this.width;
						    vml.style.height = this.height;
						    vml.setAttribute("coordorigin", "0, 0");
						    vml.setAttribute("coordsize", pixelWidth + ", " + pixelHeight);
						    this.domNode.appendChild(vml);	
						    this.createVMLCanvasFrame();
						    return;
						},

						
						

						renderTooltip : function rndrttp(touchVal, touchX,
								touchY, hdrIndex) {
							// Set the tooltip text
							// Build the points display text
							var gts = this.model.gts;
							if (hdrIndex >= 0) {
								var html = gts.row[0].n + ': ' + touchVal;
								var i;
								for (i = 0,len=gts.col[0].es.length; gts && gts.col
										&& i <len ; i++) {
									var mv = this.model.gvs.items[hdrIndex].items[i];
									var v = mv.v;
									if (mv.ty == 4) { // image threshold
										v = '<img src="' + v + '" >';
									}
									html += '<br>' + gts.col[0].es[i].n + ': '
											+ v;
								}
								this.tooltip.innerHTML = html;
							}

							// Set the tooltip position
							if (touchX + this.tooltip.offsetWidth > this.width) { // exceeds
																					// the
																					// width
								touchX = touchX - this.tooltip.offsetWidth;
							}

							this.tooltip.style.webkitTransform = 'translate3d('
									+ touchX + 'px, ' + touchY + 'px, 0)';
							this.tooltip.style.MozTransform = 'translate('
									+ touchX + 'px, ' + touchY + 'px)';

							// Fade the tooltip in
							if (this.tooltip.className.indexOf("fadeIn") < 0) {
								this.tooltip.className = this.tooltip.className
										+ " fadeIn";
							}
						},

						/**
						 * @ignore
						 */
						onmouseover : function(evt) {
							handleTouchBegin(this, evt.e.pageX, evt.e.pageY);
						},

						/**
						 * @ignore
						 */
						onmousemove : function(evt) {
							handleTouchBegin(this, evt.e.pageX, evt.e.pageY);
						}
					});

})();