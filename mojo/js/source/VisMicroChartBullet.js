(function() {

	mstrmojo.requiresCls(
						"mstrmojo.VisChart"
						);
	
	
	mstrmojo.VisMicroChartBullet = mstrmojo.declare(
			
			mstrmojo.Vis,

			
			null,
			
			
			{
				 
				scriptClass: 'mstrmojo.VisMicroChartBullet',

				
				isDrawAxis: false,

				
				margin:{t:0, r:5, b:0, l:5},

				
				showHighlightLine: false,

				
				themeColor: '#FFFFFF',
				
				
				noBackground: true, 
				
				
				isAnimateLines: false,
				
				
				toolTipMain: null,
				
				
				mainWidth: 0,
				
				
				mainLeftPos: 0,

				markupString: '<div id="{@id}" class="mstrmojo-Chart {@cssClass}" style="width:{@width};height:{@height};top:{@top};left:{@left};position:relative;" ' +
				' mstrAttach:mousedown,mouseup,mousemove,click ' +                             
				'><canvas width="{@width}" height="{@height}"></canvas>' + 
				'<canvas style="position:absolute;left:0;top:0" width="{@width}" height="{@height}"></canvas>' + 
				'<canvas style="position:absolute;left:0;top:0" width="{@width}" height="{@height}"></canvas>' +
				'<div style="position:absolute;left:0px;bottom:0px;display:none;font:10px Arial;text-align:left;line-height:10px;"></div>' + 
				'</div>',

				
				markupSlots: {
					
					canvas: function(){ return this.domNode.firstChild; },

					
					animationCanvas: function(){ return this.domNode.childNodes[1]; },

					
					highlightCanvas: function(){ return this.domNode.childNodes[2]; },

					
					minLabel: function(){ return this.domNode.childNodes[3]; }
				},
				postBuildRendering: function postBR() {
					if (this._super) {
						this._super();
					}
					this.browserSupportsHtml5 = this.canvas.getContext; 
	                if (!this.browserSupportsHtml5) {
	                	this.renderErrorMessage(mstrmojo.desc(8126,'Your browser does not support HTML5')); 
	                	return;
	                }
	                if (!this.model) {
	                	this.renderErrorMessage(mstrmojo.desc(8426,'No model provided'));
	                	return; 
	                }
	                
	                if(this.model.err || this.model.eg) {
						this.renderErrorMessage(this.model.err  || this.model.eg);
						return;
					}
	                
	                this.context = this.canvas.getContext('2d');
					this.highlightContext = this.highlightCanvas.getContext('2d');
					this.animationContext = this.animationCanvas.getContext('2d');
									
					this.drawChart();
				},
				showTooltip: function shwttp(touchX, touchY) {
					if(!this.config.mbShowTooltip) {
						return;
					}
					
					var highLightCav = document.getElementById("highLightCav" + this.widget.domNode.id);
					if(highLightCav) {
						var highlightCt = highLightCav.getContext('2d');
                		highLightCav.id = "";
                		highlightCt.clearRect(0, 0, 1000, 1000);
					}

					var model = this.model;
					var metrics = model.mtrcs.items;
					var refV = this.refv;
					var ttp = this.toolTipMain;
					var bulletProps = this.config;

					var ofht = 17;
					var line1 = metrics[2] + ": " + refV[2].v;
					var maxWidth = line1.length;
					if(bulletProps.mbRefLine) {
						line1 = '<div style="margin-left:5px;margin-top:5px;"><div style="float:left;margin-right:5px;margin-top:2px;width:12px;height:10px;background-color:' + this.targetColor + ';"></div><div style="float:left;text-align:top;">' + line1 + "</div></div>";
					} else {
						line1 = '<div style="margin-left:5px;margin-top:5px;margin-bottom:5px;"><div style="float:left;margin-right:5px;margin-top:2px;width:12px;height:10px;background-color:' + this.targetColor + ';"></div><div style="float:left;text-align:top;">' + line1 + "</div></div>";
					}
					
					if(bulletProps.mbRefLine) {
						ofht += 17;
						var line2 = metrics[6] + ": " + refV[6].v;
						if(line2.length > maxWidth) {
							maxWidth = line2.length;
						}
						line2 = '<div style="margin-left:5px;margin-bottom:5px;"><div style="float:left;margin-left:5px;margin-top:2px;margin-right:10px;width:2px;height:10px;background-color:' + this.referLineColor + ';"></div><div style="float:left;">' + line2 + "</div></div>";
						line1 += "<br/>" + line2;
					}
					ofht += 10;
					ttp.innerHTML = line1;

					var oft = mstrmojo.boxmodel.offset(this.domNode, this.widget.domNode);
					var pos = mstrmojo.dom.position(this.domNode, true);
					var posWdt = mstrmojo.dom.position(this.widget.domNode, true);
					maxWidth = Math.round(maxWidth * 8 + 20);
					ttp.style.display = 'block';
					ttp.style.borderColor = this.targetColor;
					ttp.style.width = maxWidth + "px";
					var tpof = 0;
					if((this.height - ofht) % 2 == 0) {
						tpof = (pos.y - posWdt.y + (this.height - ofht) / 2);
					} else {
						tpof = (pos.y - posWdt.y + (this.height - ofht - 1) / 2);
					}
					if(tpof < 0) {
						tpof = 0;
					}
					if(tpof + ofht> this.widget.getHeight()) {
						tpof = this.widget.getHeight() - ofht - 5;
					}
					ttp.style.top = tpof + "px";
					ttp.style.left = (oft.left - maxWidth - 10) + "px";
				},
				
				/*handleTouchEnd: function handleTouchEnd() {
				},
				
				touchSelectBegin: function touchSelectBegin(touch) {
					this.showTooltip(touch.pageX, touch.pageY);
				},
				
				touchSelectEnd: function touchSelectEnd(touch) {
				},
				
				touchSelectMove: function touchSelectMove(touch) {
					this.showTooltip(touch.pageX, touch.pageY);
				},*/
				
				drawChart: function drwchrt() {
					var bulletProps = this.config;
					var minValue = bulletProps.mfMinValue;
					var refV = this.refv;
					var mc3,mc4,mc5,mc6,mc7;
					var mMc3,mMc4,mMc5,mMc6,mMc7;
					mMc3 = refV[2].rv;
					mMc4 = refV[3].rv;
					mMc5 = refV[4].rv;
					mMc6 = refV[5].rv;
					mMc7 = refV[6].rv;
					mc3 = mMc3 - minValue;
					mc4 = mMc4 - minValue;
					mc5 = mMc5 - minValue;
					mc6 = mMc6 - minValue;
					mc7 = mMc7 - minValue;
					var posiColorMc3,colorMc4,colorMc5,colorMc6,posiColorMc7;
					var negColorMc3,negColorMc7;
					
					posiColorMc3 = bulletProps.mwPosCol;
					colorMc5 = bulletProps.mwBand1;
					colorMc6 = bulletProps.mwBand2;
					colorMc4 = bulletProps.mwBand3;
					
					negColorMc3 = bulletProps.mwNegCol;
					posiColorMc7 = bulletProps.mwRefLineCol;
					negColorMc7 = bulletProps.mwRefLineCol;

					var isInverted = bulletProps.mbInvertAxis;
					var hasRefLine = bulletProps.mbRefLine;
					var hasRefBands = bulletProps.mbRefBands;
					var mShowTooltip= bulletProps.mbShowTooltip;
					var ctx = this.context;
					var ratioBetweenMetricViewWidth;
					var bulletHeight;
					
					var minLabelHeight=8,minLabelWidth;
					var xPadding=0,yPadding=1;
					if (mc4<=0) {
						return; 
					}
					
					var xOri;
					
					if (mc3<0) {
						ratioBetweenMetricViewWidth=(this.getWidth()-2*xPadding)/(mc4-mc3);
						xOri=xPadding-mc3*ratioBetweenMetricViewWidth;
						bulletHeight=this.getHeight()-minLabelHeight-2*yPadding;
					}
					else {
						yPadding=4;
						
						ratioBetweenMetricViewWidth=(this.getWidth()-2*xPadding)/mc4;
						xOri=xPadding;
						bulletHeight=this.getHeight()-2*yPadding;
					}
					
					var redComp,greenComp,blueComp;
					var mcOriX,mcOriY;
					var mcHeight,mcWidth;
					
					if (hasRefBands) {
						mcHeight=bulletHeight;
						mcWidth=this.getWidth()-2*xPadding;
						
						mcOriX=xPadding;
						mcOriY=(bulletHeight)/2-mcHeight/2+yPadding;
						
						ctx.fillStyle = colorMc4;
						this.drawRect(ctx, mcOriX, mcOriY, mcWidth, mcHeight);
					}
					
					
					if (hasRefBands && mc6>0) {
						
						mcHeight=bulletHeight;
						mcWidth=mc6*ratioBetweenMetricViewWidth;
						
						mcOriX=xOri;
						mcOriY=(bulletHeight)/2-mcHeight/2+yPadding;
								
						if (mc3<0) {
							mcOriX=xPadding;
							mcWidth=xOri+mcWidth-xPadding;
						}
						
						
						if (isInverted) {
							mcOriX=this.getWidth()-mcOriX-mcWidth;
						}
						
						ctx.fillStyle = colorMc6;
						this.drawRect(ctx, mcOriX, mcOriY, mcWidth, mcHeight);
						
					}
					
					if (hasRefBands && mc5>0) 
					{
						
						mcHeight=bulletHeight;
						mcWidth=mc5*ratioBetweenMetricViewWidth;
						
						
						mcOriX=xOri;
						mcOriY=(bulletHeight)/2-mcHeight/2+yPadding;
								
						if (mc3<0) {
							mcOriX=xPadding;
							mcWidth=xOri+mcWidth-xPadding;
						}
						if (isInverted) {
							mcOriX=this.getWidth()-mcOriX-mcWidth;
						}
						
						ctx.fillStyle = colorMc5;
						this.drawRect(ctx, mcOriX, mcOriY, mcWidth, mcHeight);
					}
					
					mcHeight=bulletHeight/2.0;
					
					mcWidth=(mc3>0?mc3:-mc3)*ratioBetweenMetricViewWidth;
					
					if(mc3>=0){
						mcOriX=xOri;
						mcOriY=(bulletHeight)/2-mcHeight/2+yPadding;
						
					}
					else {
						mcOriX=xPadding;
						mcOriY=(bulletHeight)/2-mcHeight/2+yPadding;
					}

					if (mMc3>=0) {
						ctx.fillStyle = posiColorMc3;
						this.targetColor = posiColorMc3;
					}
					else {
						ctx.fillStyle = negColorMc3;
						this.targetColor = negColorMc3;
					}
					
					
					if (isInverted) {
						mcOriX=this.getWidth()-mcOriX-mcWidth;
					}
					
					this.drawRect(ctx, mcOriX, mcOriY, mcWidth, mcHeight);
					
					if (hasRefLine) {
						mcHeight=bulletHeight;
						mcWidth=2;
						if (mc7>=0) {
							mcOriX=xOri+mc7*ratioBetweenMetricViewWidth;
							mcOriY=(bulletHeight)/2-mcHeight/2+yPadding;
						}
						else {
							mcOriX=xOri-(-mc7)*ratioBetweenMetricViewWidth;
							mcOriY=(bulletHeight)/2-mcHeight/2+yPadding;
						}
						
						if (mMc3>0) {
							ctx.fillStyle = posiColorMc7;
							this.referLineColor = posiColorMc7;
						}
						else{
							ctx.fillStyle = negColorMc7;
							this.referLineColor = negColorMc7;
						}
						
						if (isInverted) {
							mcOriX=this.getWidth()-mcOriX-mcWidth;
						}
						this.drawRect(ctx, mcOriX, mcOriY, mcWidth, mcHeight);
					}

					
					if (mc3<0)
					{
						mcHeight=bulletHeight;
						mcWidth=2;
						mcOriX=xOri;
						mcOriY=yPadding;
						redComp=0;
						greenComp=0;
						blueComp=0;
						
						if (isInverted) {
							mcOriX=this.getWidth()-mcOriX-mcWidth;
						}
						ctx.fillStyle = "#000000";
						this.drawRect(ctx, mcOriX, mcOriY, mcWidth, mcHeight);
						
					}

					///////////the black line if necessary///////////////
					if (mc3<0)
					{
						mcHeight=bulletHeight;
						mcWidth=2;
						mcOriX=xOri;
						mcOriY=yPadding;
						redComp=0;
						greenComp=0;
						blueComp=0;
						
						if (isInverted) {
							mcOriX=this.getWidth()-mcOriX-mcWidth;
						}
						
						ctx.fillStyle = "#000000";
						this.drawRect(ctx, mcOriX, mcOriY, mcWidth, mcHeight);
						
						//here, show the label
						minValue = minValue + "";
						var disPlayValue = "$";
						var mlen = 0;
						for(var i = 0; i < minValue.length; i ++) {
							if(minValue[i] == '.') {
								break;
							}
							mlen ++;
						}
						for(var i = 0; i < minValue.length; i ++) {
							disPlayValue += minValue[i];
							mlen --;
							if(mlen % 3 == 0 && mlen > 0) {
								disPlayValue += ",";
							}
						}
						minValue = disPlayValue;
						var textWidth = this.widget.getTextWidth(minValue, "Arial", 10);
						
						minLabelWidth=textWidth+1;
						
						mcOriX=xOri;
						
						if (isInverted) {
							mcOriX=this.getWidth()-mcOriX-mcWidth;
						}
						
						if(mcOriX+minLabelWidth<=this.getWidth()-xPadding){
							this.minLabel.style.paddingLeft = Math.round(mcOriX) + "px";
						}
						else {
							this.minLabel.style.paddingLeft = Math.round((this.getWidth()-xPadding-minLabelWidth)) + "px";
						}

						this.minLabel.style.fontColor = "#333333";
						this.minLabel.innerHTML = minValue;
						this.minLabel.style.display = "block";
						
					}

				},
				
				convertColor: function convrtClr(ngv) {
					var ret = "#";
					var base = parseInt("0xff");
					var blueComp = ngv & base;
					base = parseInt("0xff00");
					var greenComp = ((ngv & base)>>8);
					base = parseInt("0xff0000");
					var redComp = ((ngv & base)>>16);
					var redP = redComp.toString(16);
					if(redP.length < 2) {
						redP = "0" + redP;
					}
					
					var greenP = greenComp.toString(16);
					if(greenP.length < 2) {
						greenP = "0" + greenP;
					}
					
					var blueP = blueComp.toString(16);
					if(blueP.length < 2) {
						blueP = "0" + blueP;
					}
					ret += redP;
					ret += greenP;
					ret += blueP;
					return ret;
				},
				
				drawRect: function (ctx, x, y, width, height) {
					// xiawang: remove the anti-aliasing effect by rounding to integer
					x = Math.round(x);
					y = Math.round(y);
					width = Math.round(width);
					height = Math.round(height);
					ctx.fillRect(x, y, width, height);
				}
			}
	);	

})();