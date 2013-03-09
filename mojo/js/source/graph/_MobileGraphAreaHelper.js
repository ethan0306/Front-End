/**
 * _MobileGraphAreaHelper.js
 * @author Jamshed Ghazi
 * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
 *
 * @fileoverview <p>Mixin that provides all the code to find areas with respect to current points.</p>
 * @version 1.0
 */
(function(){

    var MAX_TOOLTIPS = 10, //For now support maximum of 10 tooltips.
        TOOLTIP_PADDING = 20,
        tooltipPositionChanged = false,
        rightTooltipPositionChanged = false,
        maxAreasToShow = MAX_TOOLTIPS,
        tooltipsToPosition = [],
        $ARR = mstrmojo.array;


    /**
     * Area Shape enumerations.
     */
    var AreaShapePolygon = 6,
        AreaShapeRectangle = 7,
        AreaShapeCircle = 100,
        AreaShapeRingSector = 101,
        AreaShapeNormalSector = 102;

    function drawPoly(ctx, pointsArray, clr) {
        // init start values need to close polygon at this point most probably ????
        var startX = pointsArray[0];
        var startY = pointsArray[1];

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        for (var j = 2; j < pointsArray.length-1; j = j+2) {
            ctx.lineTo(pointsArray[j], pointsArray[j+1]);
        }
        ctx.lineTo(startX, startY); // close the poly

        // set the fill color
        ctx.fillStyle = clr;

        ctx.stroke();

        ctx.fill();
    }

    function drawRectangle(ctx, pointsArray, clr) {
        var x = pointsArray[0],
            y = pointsArray[1],
            width = pointsArray[2] - x,
            height = pointsArray[3] - y;

        ctx.fillStyle = clr;

        ctx.strokeRect(x, y, width, height);
        ctx.fillRect(x, y, width, height);
    }

    function drawRingSector(ctx, pointsArray, clr) {
        var centerX = pointsArray[0],
            centerY = pointsArray[1],
            innerRadius = pointsArray[2],
            outerRadius = pointsArray[3],
            startAngle = pointsArray[4],
            endAngle = pointsArray[5];

        ctx.beginPath();
        //mpCanvas->AddArc(irCenter.x, irCenter.y, iOutRadius, iStartAngle, iEndAngle, false);
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle, false);
        //LineTo(irCenter.x + iInRadius * std::cos(iEndAngle), irCenter.y + iInRadius * std::sin(iEndAngle));
        ctx.lineTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
        //mpCanvas->AddArc(irCenter.x, irCenter.y, iInRadius, iEndAngle, iStartAngle, true);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        
        ctx.closePath();
        
        // set the fill color
        ctx.fillStyle = clr;
        ctx.stroke();
        ctx.fill();
        
    }
    
	function drawNormalSector(ctx, pointsArray, clr) {
        var centerX = pointsArray[0],
            centerY = pointsArray[1],
            radius = pointsArray[2],
            startAngle = pointsArray[3],
            endAngle = pointsArray[4];
		
        ctx.beginPath();
		ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
		ctx.lineTo(centerX, centerY);
        ctx.arc(centerX, centerY, 0, endAngle, startAngle, true);
        
        ctx.closePath();
        
        // set the fill color
        ctx.fillStyle = clr;
        ctx.stroke();
        ctx.fill();
    }
	
	
    function drawCircle(ctx, pointsArray, clr) {
        // set the fill color
        ctx.fillStyle = clr;
        ctx.beginPath();
        ctx.arc(pointsArray[0], pointsArray[1], pointsArray[2], 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.fill();
    }

    function sortAreaElements(a, b) {
        return a.Point.X - b.Point.X;
    }

    function setTooltipInfo(area, ep, tooltipPosition) {
        var tooltip = this.tooltipArr[tooltipPosition];
        	ttl = area.Text,
        	borderColor = area.SC,
            style = tooltip.style,
            zoom = (this.model.zf || 1) + 'em';

        // update tooltip content
        var cssText = 'font-size:' + zoom + ';';

        // update font-size for zoom if area has color property set the border color of tooltip to be the same
        if(borderColor) { // #502810
            cssText += 'border-color:#' + borderColor;
        }

        tooltip.innerHTML = ttl;
        style.cssText = cssText;

        style.display = 'block';

        //display the tooltip   
        var top = 0,
        left = 0;

        var offsetHeight = tooltip.offsetHeight,
        	offsetWidth = tooltip.offsetWidth;

        // adjust 6 to show on side
        top = ep.y - offsetHeight - 6;
        left = ep.x - offsetWidth - 6; // always set the postion to show at left

        tooltipsToPosition.push( {
        	x: area.Point.X,
        	y: area.Point.Y,
            clr: borderColor || '#000000',
            top: top,
            left: left,
            width: offsetWidth,
            height: offsetHeight
        });
    }

    function setSingleTooltipPosition(graph, tooltip, posElement) {
        // Only one tooltip only adjust for left or right if tooltip goes out of area
        var left = posElement.left,
            top = posElement.top,
            width = posElement.width,
            style = tooltip.style,
            newLeft = left + width + 12;

        // make sure that tooltip can display properly on right side
        if(newLeft + width <= screen.width) {
            left = newLeft;
        }
        
        // if only portion of tooltip is visible than push it down to show all.
        if(top < 0 && top + posElement.height > 0) {
            top = 0;
        }

        style.left = left + 'px';
        style.top = top + 'px';
        
        graph.showAreaMarker(posElement.x, posElement.y, posElement.clr);
    }

    function positionLeftColumnTooltip(graph, position) {
        var posElement = tooltipsToPosition[position],
            tooltipArr = graph.tooltipArr,
            style = tooltipArr[position].style,
            left = posElement.left,
            top = posElement.top,
            width = posElement.width,
            height = posElement.height;
        
        if(position > 0) {
            // push all the previous tooltips down with the current tooltip height + padding
            var prevPosElem = tooltipsToPosition[position - 1],
                prevTop = prevPosElem.top,
                prevLeft = prevPosElem.left,
                prevRight = prevLeft + prevPosElem.width,
                currRight = prevLeft + width; 

            left = prevLeft;
            //check if it is not right aligned align right
            if(currRight > prevRight) {
                left -= (currRight - prevRight);
            } else if( currRight < prevRight) {
                left += (prevRight - currRight);
            }

            if(left < 0) {
            	tooltipPositionChanged = true;
            }

            // first check if we have enough space to put the new tooltip on top without moving the others down
            top = prevTop - TOOLTIP_PADDING - height; 
            
            // if top tooltip is out of the screen than start pushing all previous tooltips
            if(top < 0) {
                
                var prevTooltip,
                    pushHeight = Math.abs(top) + TOOLTIP_PADDING;

                for(var i = 0; i < position; i++) {
                    prevTooltip = tooltipArr[i];
                    prevPosElem = tooltipsToPosition[i];
                    prevTop = prevPosElem.top + pushHeight;
                    
                    // record the new top position and set it on tooltip
                    prevPosElem.top = prevTop;
                    prevTooltip.style.top = prevTop + 'px';
                }
                top += pushHeight;
            }
        } else {
            if(left < 0) {
            	// since left is less than 0 need to reposition the left side tooltips
                tooltipPositionChanged = true;
            }
            //if tooltip will show partially show it full instead
            if(top < 0 && top + height > 0) {
                top = 0;
            }
        } 

        // only set the new position if position is not changed
        if(!tooltipPositionChanged) {
        	style.left = left + 'px';
        	// reset the pos element left to the new ones
        	posElement.left = left;
        }

        style.top = top + 'px';

        // reset the pos element top to the new ones
        posElement.top = top;
        
        graph.showAreaMarker(posElement.x, posElement.y, posElement.clr);
    }

    function positionRightColumnTooltip(graph, position, adjustCount, left) {
    	var style = graph.tooltipArr[position].style,
    		posElement = tooltipsToPosition[position],
    		top = tooltipsToPosition[position - adjustCount].top,
    		width = posElement.width;

    	if(left + width > screen.width) {
    		rightTooltipPositionChanged = true;
    		style.display = 'none'; //  hide the tooltip this might not show up
    		return;
    	}

    	style.left = left + 'px';
    	style.top = top + 'px';

    	graph.showAreaMarker(posElement.x, posElement.y, posElement.clr);
    }

    function setMultiTooltipPositions(graph) {
    	var tooltipsSize = tooltipsToPosition.length,
    	tooltipArr = graph.tooltipArr,
    	halfTooltipsSize = Math.ceil(tooltipsSize/2),
    	i = 0,
    	adjustCount = 1,
    	maxColTooltipSize = Math.min(tooltipsSize, MAX_TOOLTIPS/2);

    	// stack half tooltips to the left column
    	for( ; i < halfTooltipsSize; i++) {
    		positionLeftColumnTooltip(graph, i);
    	}

    	// if one of the tooltip does not fit on the left side move all the tooltips to the right.
    	if(tooltipPositionChanged) {
    		//First put any more tooltips on the left side if we can
    		for( ; i < maxColTooltipSize; i++) {
    			positionLeftColumnTooltip(graph, i);
    		}

    		var j = i - 1,
    		posElement = tooltipsToPosition[j],
    		left = posElement.left + posElement.width + 12;

    		for(; j >= 0; j--) {
    			tooltipArr[j].style.left = left + 'px';
    		}
    	} else {
    		// stack remaining tooltips to the right column
    		var posElement = tooltipsToPosition[tooltipsSize - 1],
    			left = posElement.left + posElement.width + 12;  // Right most position for right side tooltips

    		for( ; i < tooltipsSize; i++) {
    			positionRightColumnTooltip(graph, i, adjustCount, left);
    			adjustCount += 2; // increment adjust count by 2
    			if(rightTooltipPositionChanged) {
    				break;
    			}
    		}

    		// If right tooltip position is changed and we still have space on the left col put them on left column top
    		if(rightTooltipPositionChanged && i <= maxColTooltipSize ) {
    			for(i = halfTooltipsSize; i < tooltipsSize; i++) {
    				positionLeftColumnTooltip(graph, i);
    				tooltipArr[i].style.display = 'block';
    			}
    		}
    	}
    }

    function setTooltipPositions() {
        var me = this,
            numTooltips = tooltipsToPosition.length;
        
        if(numTooltips === 0) {
            return; // nothing to position
        }
        
        if(numTooltips === 1) {
            setSingleTooltipPosition(me, me.tooltipArr[0], tooltipsToPosition[0]);
        } else {
            setMultiTooltipPositions(me);
        }

    }

    function drawShape(shapeType, ctx, coords, color) {
    	 switch (shapeType) {

         case AreaShapeRectangle:
             drawRectangle(ctx, coords, color);
             break;

         case AreaShapeCircle:
             drawCircle(ctx, coords, color);
             break;
         case AreaShapeRingSector:
             drawRingSector(ctx, coords, color);
             break;
		 case AreaShapeNormalSector:
			 drawNormalSector(ctx, coords, color);
             break;
         default:
             drawPoly(ctx, coords, color);
         }
    }
    
    function drawHighlightedAreas(ctx) {
    	var highlightedAreas = this.highlightedAreas,
    		color = 'rgba(255, 255, 255, 0.5)',
    		ctx = this.highlightNode.getContext('2d');
    	
    	$ARR.forEach(highlightedAreas, function (area) {
    		drawShape(area.Shape, ctx, area.Coords, color);
    	});
    }

    /*** A mixin to add canvas graph rendering abilities to normal image graph widgets.
     *
     * @class
     * @public
     */
    mstrmojo.graph._MobileGraphAreaHelper = mstrmojo.provide(
            "mstrmojo.graph._MobileGraphAreaHelper",

            /**
             * @lends mstrmojo.graph._MobileGraphAreaHelper
             */
            {

                highlightArea: function highlightArea(animationCanvas, areas) {
                    var me = this,
                    	ctx = animationCanvas.getContext('2d'),
                    	numAreas = areas.length,
                    	color = 'rgba(255, 255, 255, 0.5)';

                    me.highlightedAreas = []; // make the previous highlighted area to be empty.
                    
                    // clear canvas
                    ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);

                    // re-render area with white border and half transparency
                    ctx.strokeStyle = "#FFFFFF";

                    $ARR.forEach(areas, function (area) {
                    	me.highlightedAreas.push(area);  // save this area as highlighted area
                    	drawShape(area.Shape, ctx, area.Coords, color);
                	});
                    
                },

                highlightAreaInInit: function highlightAreaInInit(animationCanvas, selected) {
                    var ctx = animationCanvas.getContext('2d'),
                        allAreas = this.graphData.Areas,
                        color = 'rgba(255, 255, 255, 0.5)';

                    this.highlightedAreas = []; // make the previous highlighted area to be empty.

                    // clear canvas
                    ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);

                    // re-render area with white border and half transparency
                    ctx.strokeStyle = "#FFFFFF";

                    var numAreas = allAreas.length,
                    	DssGraphRiser = 286,
                        DssGraphDataMarker = 259,
                        DssGraphPieSlice = 341;

                    var numOfSelected = selected.length / 2;
                    for(var i = 0; i < numAreas; i++) {
                        area = allAreas[i];
                        if (area.OID != DssGraphRiser &&
                                area.OID != DssGraphDataMarker &&
                                area.OID != DssGraphPieSlice)
                            continue;
                        if (area.SID < 0 || area.GID < 0)
                            continue;
                        for (var j = 0; j < numOfSelected; j++)
                        {
                            if(area.SID != selected[2 * j] || 
                                area.GID != selected[2 * j + 1])
                                continue;
                            
                            this.highlightedAreas.push(area);  // save this area as highlighted area

                            drawShape(area.Shape, ctx, area.Coords, color);
                        }

                    }
                },

                clearHighlightArea: function clearHighlightArea(animationCanvas) {
                    if (animationCanvas) {
                        ctx = animationCanvas.getContext('2d');
                        ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
                    }
                },
                
                showAreaMarker: function showAreaMarker( x , y, clr) {                   
                 if(x >= 0 && y >= 0) {
                     
                     var ctx = this.highlightNode.getContext('2d');
                     
                     ctx.save();
                     ctx.fillStyle = '#FFFFFF'; // white background for outer circle
                     ctx.strokeStyle = clr || '#000000';
                     ctx.lineWidth = 2;
                     
                     // draw the outer circle
                     ctx.beginPath();
                     ctx.arc(x, y, 5, 0, Math.PI * 2, true);
                     ctx.stroke();
                     ctx.fill();
                     
                     // draw the inner circle
                     ctx.fillStyle = clr || '#000000';
                     ctx.beginPath();
                     ctx.arc(x, y, 2, 0, Math.PI * 2, true);
                     ctx.stroke();
                     ctx.fill();
                     
                     
                     ctx.restore();
                 }
                 
               },
               
               displayTooltips: function displayTooltips(areas, adjustX, adjustY) {
                
            	   // sort the areas so that areas are from left to right in order
                areas.sort(sortAreaElements);
                
                var tooltipArr = this.tooltipArr;
                
                tooltipPositionChanged = false;
                rightTooltipPositionChanged = false;
                tooltipsToPosition = [];
                this.clearHighlightArea(this.highlightNode);
                
                if(this.highlightedAreas) {
                	drawHighlightedAreas.call(this);
                }
                //For now we will have 10 tooltips later we can change that behavior.
                if(!tooltipArr) {
                    tooltipArr = [];
                    for(var i = 0; i < MAX_TOOLTIPS; i++) {
                        var divEl = document.createElement('div');

                        divEl.id = 'mstrmojo-mobileGraph-tooltip';
                        divEl.className = mstrmojo.GraphBase.tooltipCLS;
                        divEl.style.position = 'absolute';
                        document.body.appendChild(divEl);
                        tooltipArr[i] = divEl;
                    }
                    this.tooltipArr = tooltipArr;
                }
                
                maxAreasToShow = Math.min(areas.length, MAX_TOOLTIPS);
                
                var touchManager = mstrmojo.touchManager;
                
                if(maxAreasToShow === 0 && this._touchListener) {
                    //detachEventListener
                    touchManager.detachEventListener(this._touchListener);
                    delete this._touchListener;
                } else if(maxAreasToShow > 0 && !this._touchListener) {
                    this._touchListener = touchManager.attachEventListener('touchesBegin', this.id, function(evt) {
                        this.displayTooltips( [], 0, 0);   // hide the tooltips
                    });
                }

                var i = 0,
                    area = null,
                    ep = {},
                    style;
                    
                    // make sure all tooltips are hidden
                    for(; i < MAX_TOOLTIPS; i++) {
                        style = tooltipArr[i].style; 
                        style.left = -9999; // just to make sure it will not display until we set the left and top property
                        style.display = 'none';
                    }
                    
                for( i = 0; i < maxAreasToShow; i++) {
                    // if tooltip position is changed from left to right or right to left show only 1/2 tooltips
                    if(tooltipPositionChanged && i >= (MAX_TOOLTIPS /2) ) {
                        break;
                    }
                    
                    area = areas[i];
                    ep.x = area.Point.X + adjustX;
                    ep.y = area.Point.Y + adjustY;
                    //set tooltip information
                    setTooltipInfo.call(this, area, ep, i);
                }
                
                //position the tooltips
                setTooltipPositions.call(this);
                
                // # 515196 in ics devices tooltips do not show in first touch force repaint is required
                window.setTimeout(function() {
                	mstrMobileApp.forceRepaint();
                }, 0);

               },
               
               destroy: function dst(skipCleanup) {
                   //Destroy any mobile tooltips
                   var tooltipArr = this.tooltipArr;
                   $ARR.forEach(tooltipArr && tooltipArr, function (tooltip) {
                       document.body.removeChild(tooltip);
                   });

                   delete this.tooltipArr;

                   if(this._super) {
                       this._super(skipCleanup);
                   }
               }

            }
    );

}());