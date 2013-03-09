/**
  * _CanvasGraph.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>Mixin that provides all the code to support HTML5 canvas graphs.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */
(function () {
    mstrmojo.requiresCls("mstrmojo.graph._MobileGraphAreaHelper",
                         "mstrmojo.GraphBase");

    /**
     * Animation Constants
     */
    var ANIMATION_DURATION = 0,
        INITIAL_TIME = 0,
        //Enumeration for the different instruction types...
        InsUndefined = 0,
        InsSaveState = 1,
        InsRestoreState = 2,
        InsClip = 11,
        InsScale = 12,
        InsRotate = 13,
        InsNewPath = 101,
        InsClosePath = 102,
        InsMoveTo = 111,
        InsLineTo = 112,
        InsBezierCurveTo = 113,
        InsAddRect = 121,
        InsAddArc = 122,
        InsAddNeedle = 131,
        InsAddGaugeMarker = 132,
        InsAddString = 201,
        InsSetLineDash = 301,
        InsSetLineWidth = 302,
        InsSetLineJoin = 303,
        InsSetFontSize = 311,
        InsSetRGBAFillColor = 321,
        InsSetRGBAStrokeColor = 322,
        InsFillPath = 401,
        InsStrokePath = 402,
        InsFillSimple = 501,
        InsFillPattern = 502,
        InsFillGradient = 503,
        InsFillEdgeType = 511,
        InsFillDonutOrSphere= 512,
        InsFillRadientGradient = 513,
        InsFillDonut2Rect= 514,
        InsFillBorderMetallic = 515,
        InsMakeDarker = 521,
        InsRestoreColor = 522,
        InsApplyLineFormat = 601,
        InsAddFormatedText = 701,
        InsApplyBeveledFrameToRectangle = 801;
    var GradientReserved = 0,
        GradientCircular = 9,
        GradientRectangular = 10,
        GradientLinear = 14;
    var FillBevelNone = 0,
        FillBevelSmoothEdge = 1,
        FillBevelChiselEdge = 2,
        FillBevelDonut = 3,
        FillBevelSphere = 4;
    var RGPieSlice = 0,
        RGRing = 1,
        RG_BORDERRING = 2;
    var BSS_METALLIC_OUTER_RING = 2,
        BSS_METALLIC_MIDDLE_RING = 3;
    var FillSimple = 0,
        FillWash = 3,
        FillPicture = 4,
        FillUserPicture = 6,
        FillBrush = 13,
        FillAdvancedWash = 14,
        FillPattern = 101;
    var LineJoinMiter = 0,
        LineJoinBevel = 1,
        LineJoinRound = 2;
    var PI = 3.14159265;
    var startPoint,endPoint;
    var MS_Rectangle = 0,
        MS_XShape = 1,
        MS_PlusSymbolthin = 2,
        MS_PlusSymbolthick = 3,
        MS_Circle = 4,
        MS_Diamond = 5,
        MS_Triangle = 6,
        MS_Square = 7,
        MS_Star = 8,
        MS_Area = 9;
    var gLocalMarkerSize = 100;
    var gMarkerShapes = [
        [-100, -100, 100, -100, 100, 100, -100, 100],
        [-80, -100, 0, -20, 80, -100, 100, -80, 20, 0, 100, 80, 80, 100, 0, 20, -80, 100, -100, 80, -20, 0, -100, -80],
        [-33, -100, 33, -100, 33, -33, 100, -33, 100, 33, 33, 33, 33, 100, -33, 100, -33, 33, -100, 33, -100, -33, -33, -33],
        [-50, -100, 50, -100, 50, -50, 100, -50, 100, 50, 50, 50, 50, 100, -50, 100, -50, 50, -100, 50, -100, -50, -50, -50],
        [],
        [0, -100, 100, 0, 0, 100, -100, 0],
        [0, -100, 100, 100, -100, 100],
        [-100, -100, 100, -100, 100, 100, -100, 100],
        [0, -100, 23, -31, 95, -31, 36, 12, 59, 81, 0, 38, -59, 81, -36, 12, -95, -31, -23, -31],
        [0, -60, 100, -100, 100, 100, -100, 100, -100, -100, 0, -60, 0, 100]
    ];

    function drawWithContext(context, progress, unit, formatList){
        var insList = unit.InstructionList,
            insCount = insList.length,
            ins, j, x, y, h, w, format, color, formatIndex,
            gradient, startColor, endColor,
            rect, finalGradient, bevel, isCircularShape, darker;

        for (j = 0; j < insCount; j++)
        {
            //Get the current instruction...
            ins = insList[j];

            //Do we not have an instruction...
            if (typeof(ins) === 'undefined') {
                //alert(j + " " + insCount);
                continue;
            }

            //Switch case to draw on the canvas based on the instruction
            switch (ins.Ins) {
                case InsUndefined:
                    //alert('Instruction Undefined');
                    break;
                case InsSaveState:
                    context.save();
                    break;
                case InsRestoreState:
                    context.restore();
                    break;
                case InsClip:
                    context.clip();
                    break;
                case InsScale:
                    context.scale(ins.X, ins.Y);
                    break;
                case InsRotate:
                    if (ins.Radian !== 0) {
                        context.translate(ins.Anchor.X, ins.Anchor.Y);
                        context.rotate(ins.Radian);
                        context.translate(-ins.Anchor.X, -ins.Anchor.Y);
                    }
                    break;
                case InsNewPath:
                    context.beginPath();
                    break;
                case InsClosePath:
                    context.closePath();
                    break;
                case InsMoveTo:
                    if (unit.IsAnimated === 0) {
                        context.moveTo(ins.X, ins.Y);
                    } else {
                        if (ins.CA[0] == 0) {
                            x = ins.X[0] * (1 - progress) + ins.X[1] * progress;
                            y = ins.Y[0] * (1 - progress) + ins.Y[1] * progress;
                            context.moveTo(x, y);
                        } else {
                            var r1 = Math.sqrt((ins.X[0]-ins.BPX[0])*(ins.X[0]-ins.BPX[0]) + (ins.Y[0]-ins.BPY[0])*(ins.Y[0]-ins.BPY[0]));
                            var r2 = Math.sqrt((ins.X[1]-ins.BPX[0])*(ins.X[1]-ins.BPX[0]) + (ins.Y[1]-ins.BPY[0])*(ins.Y[1]-ins.BPY[0]));
                            var d = Math.sqrt((ins.X[0]-ins.X[1])*(ins.X[0]-ins.X[1]) + (ins.Y[0]-ins.Y[1])*(ins.Y[0]-ins.Y[1]));
                            var de = Math.acos((r1*r1+r2*r2-d*d)/(2*r1*r2));

                            // 497580, clark, handle the case when rotating angle is >= 180 degrees
                            var lDest = (ins.X[0]-ins.BPX[0]) * Math.cos(de) - (ins.Y[0]-ins.BPY[0]) * Math.sin(de) + ins.BPX[0] - ins.X[1];
                            if (lDest < -0.01 || lDest > 0.01)
                                de = 2*PI - de;

                            x = (ins.X[0]-ins.BPX[0]) * Math.cos(progress*de) - (ins.Y[0]-ins.BPY[0]) * Math.sin(progress*de) + ins.BPX[0];
                            y = (ins.Y[0]-ins.BPY[0]) * Math.cos(progress*de) + (ins.X[0]-ins.BPX[0]) * Math.sin(progress*de) + ins.BPY[0];
                            context.moveTo(x, y);
                        }
                    }
                    break;
                case InsLineTo:
                    if (unit.IsAnimated === 0) {
                        context.lineTo(ins.X, ins.Y);
                    } else {
                        if (ins.CA[0] == 0) {
                            x = ins.X[0] * (1 - progress) + ins.X[1] * progress;
                            y = ins.Y[0] * (1 - progress) + ins.Y[1] * progress;
                            context.lineTo(x, y);
                        } else {
                            var r1 = Math.sqrt((ins.X[0]-ins.BPX[0])*(ins.X[0]-ins.BPX[0]) + (ins.Y[0]-ins.BPY[0])*(ins.Y[0]-ins.BPY[0]));
                            var r2 = Math.sqrt((ins.X[1]-ins.BPX[0])*(ins.X[1]-ins.BPX[0]) + (ins.Y[1]-ins.BPY[0])*(ins.Y[1]-ins.BPY[0]));
                            var d = Math.sqrt((ins.X[0]-ins.X[1])*(ins.X[0]-ins.X[1]) + (ins.Y[0]-ins.Y[1])*(ins.Y[0]-ins.Y[1]));
                            var de = Math.acos((r1*r1+r2*r2-d*d)/(2*r1*r2));

                            // 497580, clark, handle the case when rotating angle is >= 180 degrees
                            var lDest = (ins.X[0]-ins.BPX[0]) * Math.cos(de) - (ins.Y[0]-ins.BPY[0]) * Math.sin(de) + ins.BPX[0] - ins.X[1];
                            if (lDest < -0.01 || lDest > 0.01)
                                de = 2*PI - de;

                            x = (ins.X[0]-ins.BPX[0]) * Math.cos(progress*de) - (ins.Y[0]-ins.BPY[0]) * Math.sin(progress*de) + ins.BPX[0];
                            y = (ins.Y[0]-ins.BPY[0]) * Math.cos(progress*de) + (ins.X[0]-ins.BPX[0]) * Math.sin(progress*de) + ins.BPY[0];
                            context.lineTo(x, y);
                        }
                    }
                    break;
                case InsBezierCurveTo:
                    if (unit.IsAnimated === 0) {
                        context.bezierCurveTo(ins.CP1X, ins.CP1Y, ins.CP2X, ins.CP2Y, ins.X, ins.Y);
                    } else {
                        cp1x = ins.CP1X[0] * (1 - progress) + ins.CP1X[1] * progress;
                        cp1y = ins.CP1Y[0] * (1 - progress) + ins.CP1Y[1] * progress;
                        cp2x = ins.CP2X[0] * (1 - progress) + ins.CP2X[1] * progress;
                        cp2y = ins.CP2Y[0] * (1 - progress) + ins.CP2Y[1] * progress;
                        x = ins.X[0] * (1 - progress) + ins.X[1] * progress;
                        y = ins.Y[0] * (1 - progress) + ins.Y[1] * progress;
                        context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
                    }
                    break;
                case InsAddRect:
                    if (unit.IsAnimated === 0) {
                        context.rect(ins.X, ins.Y, ins.W, ins.H);
                    } else {
                        x = ins.X[0] * (1 - progress) + ins.X[1] * progress;
                        y = ins.Y[0] * (1 - progress) + ins.Y[1] * progress;
                        w = ins.W[0] * (1 - progress) + ins.W[1] * progress;
                        h = ins.H[0] * (1 - progress) + ins.H[1] * progress;
                        context.rect(x, y, w, h);
                    }
                    break;
                case InsAddArc:
                    if (unit.IsAnimated === 0) {
                        if (ins.EndAngle == 6.283) // 497606, clark, more precise
                         ins.EndAngle = 2*PI;
                        context.arc(ins.X, ins.Y, ins.Radius, ins.StartAngle, ins.EndAngle, ins.AntiClockwise);
                    } else {
                        if (ins.EndAngle[0] == 6.283) // 497606, clark, more precise
                         ins.EndAngle[0] = 2*PI;
                        if (ins.EndAngle[1] == 6.283) // 497606, clark, more precise
                         ins.EndAngle[1] = 2*PI;

                        context.arc(ins.X[0] * (1 - progress) + ins.X[1] * progress,
                                    ins.Y[0] * (1 - progress) + ins.Y[1] * progress,
                                    ins.Radius[0] * (1 - progress) + ins.Radius[1] * progress,
                                    ins.StartAngle[0] * (1 - progress) + ins.StartAngle[1] * progress,
                                    ins.EndAngle[0] * (1 - progress) + ins.EndAngle[1] * progress,
                                    ins.AntiClockwise[0]);
                    }
                    break;
                case InsAddGaugeMarker:
                    if (unit.IsAnimated == 1)
                    {
                        var angle = ins.Angle[0] * (1 - progress) + ins.Angle[1] * progress;
                        var lSize = ins.NeedleSize[0];
                        var bPX = ins.BPX[0];
                        var bPY = ins.BPY[0];
                        var markerSize = ins.MarkSize[0];
                        var markerShape = ins.MarkShape[0];

                        var lMarkerPostion = {X:lSize*Math.cos(angle)+bPX, Y:lSize*Math.sin(angle)*-1+bPY};
                        var lPolygon = hGetClockwisePolygon(markerShape, lMarkerPostion, markerSize);
                        hDrawPolygon(context, lPolygon, false, false);
                        //var mark
                    }
                    break;
                case InsAddString:
                case InsSetLineDash:
                    // To do
                    break;

                case InsSetLineWidth:
                    context.lineWidth = ins.LineWidth;
                    break;

                case InsSetLineJoin:
                    switch(ins.Type)
                    {
                    case LineJoinMiter:
                        context.lineJoin = 'miter';
                        break;
                    case LineJoinBevel:
                        context.lineJoin = 'bevel';
                        break;
                    case LineJoinRound:
                        context.lineJoin = 'round';
                        break;
                    }
                    break;
                case InsSetFontSize:
                case InsSetRGBAFillColor:
                case InsSetRGBAStrokeColor:
                    // To do
                    break;

                case InsFillPath:
                    context.fill();
                    break;

                case InsStrokePath:
                    context.stroke();
                    break;

                case InsFillSimple:
                    formatIndex = ins.Format;
                    format = formatList[formatIndex];
                    if(ins.HEP == 1)
                      color = ins.FC;
                    else
                        color = format.SimpleColor;
                    context.fillStyle = "RGBA(" + Math.round(color.R * ins.DarkerFactor) + ", " + Math.round(color.G * ins.DarkerFactor) + ", " + Math.round(color.B * ins.DarkerFactor) + ", " + format.Alpha / 255.0 + ");";
                    context.fill();
                    break;

                case InsFillPattern:
                    break;
                case InsFillGradient:
                    if (unit.IsAnimated === 0) {
                        rect = ins.BoundingRect;
                        darker = ins.DarkerFactor;
                    }
                    else {
                        rect = ins.BoundingRect[0];
                        darker = ins.DarkerFactor[0];
                        var rect2 = ins.BoundingRect[1];
                        rect.X = rect.X * (1-progress) + rect2.X * progress;
                        rect.Y = rect.Y * (1-progress) + rect2.Y * progress;
                        rect.Width = rect.Width * (1-progress) + rect2.Width * progress;
                        rect.Height = rect.Height * (1-progress) + rect2.Height * progress;
                    }
                    if (rect.Width < 1 || rect.Height < 1)
                        continue;

                    rect.Width = Math.floor(rect.Width);
                    rect.Height = Math.floor(rect.Height);

                    var format = formatList[ins.Format];
                    // The logic in "else" is time consuming. To make the animation smooth, use the logic in
                    // "if" when progress < 1.
                    if (format.Bevel.FillBevelType != FillBevelSphere || progress < 1)
                    {
                        fillGradient(context, format, rect, darker);
                    }
                    else
                    {
                        // Combine gradient with bevel sphere.
                        addCompensativeLayer(context, format);
                        //alert(rect.X+','+ rect.Y+','+ rect.Width+','+ rect.Height)
                        //var lImageData1 = context.getImageData(rect.X, rect.Y, rect.Width, rect.Height);
                        //context.clearRect(rect.X, rect.Y, rect.Width, rect.Height);
                        fillGradient(context, format, rect, darker);
                        /*var lImageData2 = context.getImageData(rect.X, rect.Y, rect.Width, rect.Height);

                        var lCenterPoint = {x : rect.Width / 2.0, y : rect.Height / 2.0};
                        var lpData = lImageData2.data;
                        var lHorizontalStep = 256 /lCenterPoint.x;
                        var lVerticalStep = 256 /lCenterPoint.y;
                        var lVerticalDistance = 0;
                        var lMidPointX = parseInt(lCenterPoint.x);
                        var lMidPointY = parseInt(lCenterPoint.y);
                        var lMidPointDistanceX = (rect.Width - lMidPointX - 1) * lHorizontalStep;
                        var lMidPointDistanceY = (rect.Height - lMidPointY - 1) * lVerticalStep;
                        var lIndex = 0;
                        for (var col = 0; col < lMidPointY; ++col)
                        {
                            var lHorizontalDistance = 0;
                            for (var row = 0; row < lMidPointX; ++row)
                            {
                                var lAlpha = hGetRadialAlpha(lVerticalDistance, lHorizontalDistance);
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lHorizontalDistance += lHorizontalStep;
                            }
                            lHorizontalDistance = lMidPointDistanceX;
                            for (var row = lMidPointX; row < rect.Width; ++row)
                            {
                                var lAlpha = hGetRadialAlpha(lVerticalDistance, lHorizontalDistance);
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lHorizontalDistance -= lHorizontalStep;
                            }
                            lVerticalDistance += lVerticalStep;
                        }
                        lVerticalDistance = lMidPointDistanceY;
                        for (var col = lMidPointY; col < rect.Height; ++col)
                        {
                            var lHorizontalDistance = 0;
                            for (var row = 0; row < lMidPointX; ++row)
                            {
                                var lAlpha = hGetRadialAlpha(lVerticalDistance, lHorizontalDistance);
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lHorizontalDistance += lHorizontalStep;
                            }
                            lHorizontalDistance = lMidPointDistanceX;
                            for (var row = lMidPointX; row < rect.Width; ++row)
                            {
                                var lAlpha = hGetRadialAlpha(lVerticalDistance, lHorizontalDistance);
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lpData[lIndex] = lIndex[lIndex] * lAlpha + lImageData1.data[lIndex] * (1 - lAlpha);
                                lIndex++;
                                lHorizontalDistance -= lHorizontalStep;
                            }
                            lVerticalDistance -= lVerticalStep;
                        }
                        context.putImageData(lImageData2, rect.X, rect.Y);*/
                    }

                    break;
                case InsFillEdgeType:
                    // clark, add fill edge type support
                    format = formatList[ins.Format];
                    bevel = format.Bevel;

                    lPolygon = hRemoveZeroEdgeInPolygon(ins.Polygon);

                    var lInitialPolygonSize = lPolygon.length;
                    var lInitialPolygon = [];
                    for (var i = 0; i < lInitialPolygonSize; i++)
                        lInitialPolygon.push(lPolygon[i]);

                    while(true)
                    {
                        lInitialPolygonSize = lInitialPolygon.length;
                        if (lInitialPolygonSize < 3)
                            break;

                        var lFirstPolygon = [];
                        var lSecondPolygon = [];
                        var lDivided = false;
                        if(lInitialPolygonSize > 3)
                        {
                            var lIntersectionPoint = { X:0, Y:0 };

                            for(var i = 0; ((i < (lInitialPolygonSize - 2)) && (!lDivided)); ++i)
                            {
                                for(var k = i + 2; k < (lInitialPolygonSize - 1); ++k)
                                {
                                    var rt = hLineInterSection(lInitialPolygon[i], lInitialPolygon[i+1], lInitialPolygon[k], lInitialPolygon[k+1], lIntersectionPoint, false);
                                    lIntersectionPoint = rt.interSection;
                                    if(rt.val == 1)
                                    {
                                        lDivided = true;
                                        //first part
                                        for(m = 0; m <= i; ++m)
                                        {
                                            if (!hIsFPointsEqual(lInitialPolygon[m], lIntersectionPoint))
                                                lFirstPolygon.push(lInitialPolygon[m]);
                                        }
                                        lFirstPolygon.push(lIntersectionPoint);
                                        for(m = k + 1; m < lInitialPolygonSize; ++m)
                                        {
                                            if (!hIsFPointsEqual(lInitialPolygon[m], lIntersectionPoint))
                                                lFirstPolygon.push(lInitialPolygon[m]);
                                        }
                                        //second part
                                        lSecondPolygon.push(lIntersectionPoint);
                                        for(m = k; m > i; --m)
                                        {
                                            if (!hIsFPointsEqual(lInitialPolygon[m], lIntersectionPoint))
                                                lSecondPolygon.push(lInitialPolygon[m]);
                                        }
                                        break;
                                    }
                                }

                                //deal with last edge
                                if((i != 0) && (!lDivided))
                                {
                                    var rt = hLineInterSection(lInitialPolygon[i], lInitialPolygon[i+1], lInitialPolygon[0], lInitialPolygon[lInitialPolygonSize-1], lIntersectionPoint, false);
                                    lIntersectionPoint = rt.interSection;
                                    if(rt.val == 1)
                                    {
                                        for(m = 0; m <= i; ++m)
                                            lFirstPolygon.push(lInitialPolygon[m]);
                                        lFirstPolygon.push(lIntersectionPoint);
                                        //second part
                                        lSecondPolygon.push(lIntersectionPoint);
                                        for(m = lInitialPolygonSize - 1; m > i; --m)
                                            lSecondPolygon.push(lInitialPolygon[m]);
                                        lDivided = true;
                                    }
                                }
                            }
                        }

                        if(!lDivided)
                            lFirstPolygon = lInitialPolygon;

                        //get the depth
                        var lDepth = 0.0;
                        var lRt = hGetAreaDepth(lFirstPolygon, lDepth);
                        lDepth = lRt.depth;
                        if (!lRt.mark)
                            break;
                        lDepth *= bevel.Depth * 0.01;
                        //get the normal line point
                        var lNormalStart = [];//it should be the inner area point
                        var lNormalEnd = [];
                        var lFirstPolygonSize = lFirstPolygon.length;
                        for(var i = 0; i < lFirstPolygonSize; ++i)
                        {
                            var lPointStart;
                            var lPointEnd;
                            var lRt = hGetAngularBisectorIntersectionPoint(lFirstPolygon[(i+lFirstPolygonSize-1) % lFirstPolygonSize], lFirstPolygon[i],
                                        lFirstPolygon[(i+1) % lFirstPolygonSize], lDepth);
                            lPointStart = lRt.start;
                            lPointEnd = lRt.end;

                            lNormalStart.push(lPointStart);
                            lNormalEnd.push(lPointEnd);
                        }//end of for loop

                        //now we have all the normal line point and the inner point
                        //we will compute the lightness of the surfaces and draw then
                        for(var i = 0; i < lFirstPolygonSize; ++i)
                        {
                            var lVectorNormalLine = {X:lNormalEnd[i].X - lNormalStart[i].X, Y:lNormalEnd[i].Y - lNormalStart[i].Y};
                            var lLengthNormalLine = Math.sqrt(hLengthSquared(lVectorNormalLine));
                            var lVectorUnitNormalLine = {X:lVectorNormalLine.X / lLengthNormalLine, Y:lVectorNormalLine.Y / lLengthNormalLine};
                            //opposite direction
                            var lAngleReflectedLight = degreeToRadian((540 - bevel.LightAngle) % 360);
                            var lVectorUnitLight = {X:Math.cos(lAngleReflectedLight), Y:Math.sin(lAngleReflectedLight)};
                            var lTemp = hInnerProduct(lVectorUnitNormalLine, lVectorUnitLight);

                            var lColorRGB = 0.0;
                            var lTransparency = 0.0;
                            //factor could be adjust
                            var lFactor = 0.1;
                            var lTransparencyFactor = 0.2;
                            if(lTemp < -0.01)//dark
                            {
                                lColorRGB = (1.0 + lTemp) * lFactor;
                                lTransparency = (1.0 + Math.abs(lTemp)) * lTransparencyFactor * bevel.Intensity * 0.01;
                            }
                            else
                            {
                                lColorRGB = (1.0 - lFactor) + lTemp * lFactor;
                                lTransparency = ((1.0 - lTransparencyFactor) + lTemp * lTransparencyFactor) * bevel.Intensity * 0.01;
                            }
                            var lNext = i + 1;
                            if(lNext == lFirstPolygonSize)
                                lNext -= lFirstPolygonSize;

                            context.beginPath();
                            context.moveTo(lFirstPolygon[i].X, lFirstPolygon[i].Y);
                            context.lineTo(lFirstPolygon[lNext].X, lFirstPolygon[lNext].Y);
                            context.lineTo(lNormalStart[lNext].X, lNormalStart[lNext].Y);
                            context.lineTo(lNormalStart[i].X, lNormalStart[i].Y);
                            context.closePath();

                            var R = Math.round(lColorRGB*255);
                            if (isNaN(R))  // 507686, clark, check whether this is a number. if not, then continue
                                continue;

                            if(bevel.FillBevelType == FillBevelSmoothEdge)
                            {
                                context.save();
                                context.clip();
                                var lLinearGrad = context.createLinearGradient(lNormalEnd[i].X, lNormalEnd[i].Y, lNormalStart[i].X, lNormalStart[i].Y);


                                lLinearGrad.addColorStop(0, 'rgba(' + R + ',' + R +',' + R +',' + lTransparency + ')');
                                lLinearGrad.addColorStop(1, 'rgba(' + R + ',' + R +',' + R +',' + 0 + ')');

                                 context.fillStyle = lLinearGrad;
                                 context.fill();
                                 context.restore();
                            }
                            else
                            {
                                context.fillStyle = "RGBA(" + R + ", " + R + ", " + R + ", " + lTransparency + ");";
                                context.fill();
                            }


                        }
                        if(lDivided)
                        {
                            lInitialPolygon = lSecondPolygon;
                        }
                        else
                            break;
                    }

                    // clark, restore path if the current path is not empty
                    if (lPolygon.length != 0)
                    {
                        context.beginPath();
                        context.moveTo(lPolygon[0].X, lPolygon[0].Y);
                        for (var i = 1; i < lPolygon.length; ++i)
                        {
                            context.lineTo(lPolygon[i].X, lPolygon[i].Y);
                        }
                        context.closePath();
                    }
                    break;
                case InsFillDonutOrSphere:
                    format = formatList[ins.Format];
                    bevel = format.Bevel;
                    if (unit.IsAnimated === 0) {
                        rect = ins.BoundingRect;
                        isCircularShape = ins.IsCircularShape;
                    }
                    else {
                        rect = ins.BoundingRect[0];
                        var rect2 = ins.BoundingRect[1];
                        rect.X = rect.X * (1-progress) + rect2.X * progress;
                        rect.Y = rect.Y * (1-progress) + rect2.Y * progress;
                        rect.Width = rect.Width * (1-progress) + rect2.Width * progress;
                        rect.Height = rect.Height * (1-progress) + rect2.Height * progress;
                        isCircularShape = ins.IsCircularShape[0];
                    }

                    if (bevel.FillBevelType === FillBevelDonut)
                    {
                        var factor = 0.2;
                        var lAlpha = bevel.Intensity * 0.01 * format.Alpha / 255.0;
                        var lStop = 1.0 - bevel.Depth * 0.01;

                        finalGradient = context.createLinearGradient(rect.X, rect.Y, rect.X + rect.Width, rect.Y);

                        startColor = 'RGBA(0,0,0,' + lAlpha + ');';
                        endColor = 'RGBA(255,255,255,' + lAlpha + ');';
                        finalGradient.addColorStop(0, startColor);
                        finalGradient.addColorStop(lStop * factor, startColor);
                        finalGradient.addColorStop(lStop, endColor);
                        finalGradient.addColorStop(1, startColor);
                    }
                    else
                    {
                        startColor = format.SimpleColor;
                        var lCenterPoint = {x: rect.X + rect.Width / 2, y : rect.Y + rect.Height / 2};

                        startPoint = {x : 0, y : 0};
                        endPoint = {x : 0, y : 0};
                        hRatioInRectangle(rect, bevel.LightAngle, lCenterPoint); // Calculate startPoint and endPoint.

                        var lFillAlpha = format.Alpha / 255.0;
                        var lNewAlpha = lFillAlpha;
                        if (format.FillType != FillSimple)
                        {
                            lFillAlpha *= 0.8;
                            lNewAlpha *= 0.5;
                            startColor = {R : 128, G : 128, B : 128};
                        }

                        var lLinearGrad = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                        lLinearGrad.addColorStop(0, 'rgba(255,255,255,' + lFillAlpha + ')');
                        lLinearGrad.addColorStop(0.05 + bevel.Intensity * 0.001, 'rgba(255,255,255,' + 9 * lFillAlpha / (10 - lFillAlpha) + ')');
                        lLinearGrad.addColorStop(0.5, 'rgba(' + startColor.R + ',' + startColor.G +',' + startColor.B +',' + lNewAlpha + ')');
                        lLinearGrad.addColorStop(0.85 + (1.0 - bevel.Intensity * 0.01) * 0.05, 'rgba(0,0,0,' + 9 * lFillAlpha / (10 - lFillAlpha) + ')');
                        lLinearGrad.addColorStop(1, 'rgba(0,0,0,' + lFillAlpha + ')');

                        context.fillStyle = lLinearGrad;
                        context.fill();

                        if (format.FillType != FillSimple)
                            continue;

                        var lRadius = Math.max(rect.Width, rect.Height) * 0.5 * (2.0 - bevel.Intensity * 0.01);
                        lRadius *= isCircularShape ? 0.75 : 2;

                        // clark, 488169, we should use the radial gradient here
                        finalGradient = context.createRadialGradient(lCenterPoint.x, lCenterPoint.y, 0, lCenterPoint.x, lCenterPoint.y, lRadius);

                        finalGradient.addColorStop(0, 'rgba(' + startColor.R + ',' + startColor.G +',' + startColor.B +',' + lFillAlpha + ')');
                        finalGradient.addColorStop(0.5, 'rgba(' + startColor.R + ',' + startColor.G +',' + startColor.B +',' + lFillAlpha / 2 + ')');
                        finalGradient.addColorStop(0.8, 'rgba(' + startColor.R + ',' + startColor.G +',' + startColor.B +',' + lFillAlpha / 10 + ')');
                        finalGradient.addColorStop(1, 'rgba(' + startColor.R + ',' + startColor.G +',' + startColor.B +',0)');
                    }
                    context.fillStyle = finalGradient;
                    context.fill();

                    break;
                case InsFillBorderMetallic:
                    format = formatList[ins.Format];
                    bevel = format.Bevel;

                    var CX = ins.CX;
                    var CY = ins.CY;
                    var mRadius = ins.Radius;
                    var lRadius;
                    var lAlpha;

                    switch(ins.BorderUse)
                    {
                        case BSS_METALLIC_OUTER_RING:
                            lAlpha = 0.4;
                            startPoint = {x : CX + mRadius * Math.cos(PI * 1.25), y : CY + mRadius * Math.sin(PI * 1.25)};
                            endPoint = {x : CX + mRadius * Math.cos(PI * 0.25), y : CY + mRadius * Math.sin(PI * 0.25)};

                            context.save();
                            context.clip();
                            var lLinearGrad = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                            lLinearGrad.addColorStop(0, 'rgba(0,0,0,' + lAlpha + ')');
                            lLinearGrad.addColorStop(1, 'rgba(255,255,255,' + lAlpha + ')');

                            context.fillStyle = lLinearGrad;
                            context.fill();
                            context.restore();

                            lAlpha = 0.4;
                            lRadius = mRadius * 0.3;
                            color = format.SimpleColor;
                            startPoint = {x : CX + lRadius * Math.cos(PI * 0.75), y : CY + lRadius * Math.sin(PI * 0.75)};
                            endPoint = {x : CX + lRadius * Math.cos(PI * 1.75), y : CY + lRadius * Math.sin(PI * 1.75)};

                            context.save();
                            context.clip();
                            var lLinearGrad = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                            lLinearGrad.addColorStop(0, 'rgba(' + color.R + ',' + color.G +',' + color.B +',' + 0.0 + ')');
                            lLinearGrad.addColorStop(0.2, 'rgba(' + color.R + ',' + color.G +',' + color.B +',' + 1.0 + ')');
                            lLinearGrad.addColorStop(0.8, 'rgba(' + color.R + ',' + color.G +',' + color.B +',' + 1.0 + ')');
                            lLinearGrad.addColorStop(1, 'rgba(' + color.R + ',' + color.G +',' + color.B +',' + 0.0 + ')');

                            context.fillStyle = lLinearGrad;
                            context.fill();
                            context.restore();
                            break;
                        case BSS_METALLIC_MIDDLE_RING:
                            lAlpha = 0.6;
                            lRadius = mRadius* 0.2;
                            var lStop = 0.3;
                            startPoint = {x : CX + lRadius * Math.cos(PI * 1.25), y : CY + lRadius * Math.sin(PI * 1.25)};
                            endPoint = {x : CX + mRadius * Math.cos(PI * 0.25), y : CY + mRadius * Math.sin(PI * 0.25)};

                            context.save();
                            context.clip();
                            var lLinearGrad = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                            lLinearGrad.addColorStop(0, 'rgba(255,255,255,' + lAlpha + ')');
                            lLinearGrad.addColorStop(lStop, 'rgba(0,0,0,' + lAlpha + ')');
                            lLinearGrad.addColorStop(1, 'rgba(255,255,255,' + lAlpha + ')');

                            context.fillStyle = lLinearGrad;
                            context.fill();
                            context.restore();
                            break;
                        default:
                            lAlpha = 0.4;
                            lRadius = mRadius- ins.Thickness;
                            startPoint = {x : CX + lRadius * Math.cos(PI * 1.25), y : CY + lRadius * Math.sin(PI * 1.25)};
                            endPoint = {x : CX + lRadius * Math.cos(PI * 0.25), y : CY + lRadius * Math.sin(PI * 0.25)};

                            context.save();
                            context.clip();
                            var lLinearGrad = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                            lLinearGrad.addColorStop(0, 'rgba(0,0,0,' + lAlpha + ')');
                            lLinearGrad.addColorStop(1, 'rgba(255,255,255,' + lAlpha + ')');

                            context.fillStyle = lLinearGrad;
                            context.fill();
                            context.restore();
                            break;
                    }
                    break;
                case InsFillRadientGradient:
                    format = formatList[ins.Format];
                    bevel = format.Bevel;

                    var lAlpha;
                    var lStop;
                    var CX;
                    var CY;
                    var innerRadius;
                    var outerRadius;
                    var lUsage;
                    var lExtraPara;
                    var lExtraDepth;
                    var lExtraIntensity;

                    if (unit.IsAnimated === 0) {
                        CX = ins.CX;
                        CY = ins.CY;
                        innerRadius = ins.InnerRadius;
                        outerRadius = ins.OuterRadius;
                        lUsage = ins.RGUsage;
                        lExtraPara = ins.HEP;
                        if (lExtraPara == 1)
                        {
                            lExtraDepth = ins.ExtraDepth;
                            lExtraIntensity = ins.ExtraIntensity;
                        }
                    } else {
                        CX = ins.CX[0] * (1 - progress) + ins.CX[1] * progress;
                        CY = ins.CY[0] * (1 - progress) + ins.CY[1] * progress;
                        innerRadius = ins.InnerRadius[0];
                        outerRadius = ins.OuterRadius[0];
                        lUsage = ins.RGUsage[0];
                        lExtraPara = ins.HEP[0];
                        if (lExtraPara == 1)
                        {
                            lExtraDepth = ins.ExtraDepth[0];
                            lExtraIntensity = ins.ExtraIntensity[0];
                        }
                    }

                    switch(lUsage)
                    {
                        case RGPieSlice:
                            lAlpha = bevel.Intensity * 0.01 * format.Alpha / 255.0;
                            lStop = 1.0 - bevel.Depth * 0.01;
                            finalGradient = context.createRadialGradient(CX, CY, innerRadius, CX, CY, outerRadius);
                            startColor = 'RGBA(0,0,0,' + lAlpha + ');';
                            endColor = 'RGBA(255,255,255,' + lAlpha + ');';
                            finalGradient.addColorStop(0, startColor);
                            finalGradient.addColorStop(lStop, endColor);
                            finalGradient.addColorStop(1, startColor);

                            context.fillStyle = finalGradient;
                            context.fill();
                            break;
                        case RGRing:
                            lAlpha = bevel.Intensity * 0.01 * format.Alpha / 255.0;
                            finalGradient = context.createRadialGradient(CX, CY, innerRadius, CX, CY, outerRadius);
                            startColor = 'RGBA(0,0,0,' + lAlpha + ');';
                            endColor = 'RGBA(255,255,255,' + lAlpha + ');';
                            finalGradient.addColorStop(0, startColor);
                            finalGradient.addColorStop(1, endColor);

                            context.fillStyle = finalGradient;
                            context.fill();
                            break;
                        case RG_BORDERRING:
                            if (lExtraPara == 0)
                            {
                                lAlpha = bevel.Intensity * 0.01 * format.Alpha / 255.0;
                                lStop = bevel.Depth * 0.01;
                            }
                            else
                            {
                                lAlpha = lExtraIntensity * 0.01 * format.Alpha / 255.0;
                                lStop = lExtraDepth * 0.01;
                            }
                            finalGradient = context.createRadialGradient(CX, CY, innerRadius, CX, CY, outerRadius);
                            startColor = 'RGBA(0,0,0,' + lAlpha + ');';
                            endColor = 'RGBA(255,255,255,' + lAlpha + ');';
                            finalGradient.addColorStop(0, startColor);
                            finalGradient.addColorStop(lStop, endColor);
                            finalGradient.addColorStop(1, startColor);

                            context.fillStyle = finalGradient;
                            context.fill();
                            break;
                    }
                    break;
                case InsFillDonut2Rect:
                    format = formatList[ins.Format];
                    bevel = format.Bevel;
                    lAlpha = bevel.Intensity * 0.01 * format.Alpha / 255.0;
                    lStop = 1.0 - bevel.Depth * 0.01;

                    startColor = 'RGBA(0,0,0,' + lAlpha + ');';
                    endColor = 'RGBA(255,255,255,' + lAlpha + ');';
                    finalGradient = context.createLinearGradient(ins.StartPoint.X, ins.StartPoint.Y, ins.EndPoint.X, ins.EndPoint.Y);
                    finalGradient.addColorStop(0, startColor);
                    finalGradient.addColorStop(lStop, endColor);
                    finalGradient.addColorStop(1, startColor);

                    context.save();
                    context.clip();
                    context.fillStyle = finalGradient;
                    context.fill();
                    context.restore();
                    break;
                case InsMakeDarker:
                case InsRestoreColor:
                    // To do
                    break;

                case InsApplyLineFormat:
                    formatIndex = ins.Format;
                    format = formatList[formatIndex];
                    color = format.Color;
                    context.strokeStyle = "RGBA(" + color.R + ", " + color.G + ", " + color.B + ", " + format.Alpha / 255.0 + ");";
                    context.stroke();
                    break;
                case InsAddFormatedText:
                    formatIndex = ins.Format;
                    format = formatList[formatIndex];
                    color = format.Color;
                    // The font size should be in "px" instead of "pt". 96 pixels = 72 pt.
                    context.font = format.Size + "px " + format.Name;
                    if (format.Style & 0x02)    // Italic
                    {
                        context.font = "italic " + context.font;
                    }
                    if (format.Style & 0x01)    // Bold
                    {
                        context.font = "bold " + context.font;
                    }
                    context.fillStyle = "RGBA(" + color.R + ", " + color.G + ", " + color.B + ", " + format.Alpha / 255.0 + ");";
                    context.fillText(ins.Text, ins.StartPoint.X, ins.StartPoint.Y);
                    if (format.Style & 0x0C) // Underline and/or StrikeThrough
                    {
                        context.beginPath();
                        var textSize = context.measureText(ins.Text);
                        if(format.Style & 0x04) // Underline
                        {
                            context.moveTo(Math.round(ins.StartPoint.X), Math.round(ins.StartPoint.Y));
                            context.lineTo(Math.round(ins.StartPoint.X + textSize.width), Math.round(ins.StartPoint.Y));
                        }
                        if(format.Style & 0x08) // StrikeThrough
                        {
                            context.moveTo(Math.round(ins.StartPoint.X), Math.round(ins.StartPoint.Y - format.Size * 0.5));
                            context.lineTo(Math.round(ins.StartPoint.X + textSize.width), Math.round(ins.StartPoint.Y - format.Size * 0.5));
                        }
                        context.strokeStyle = "RGBA(" + color.R + ", " + color.G + ", " + color.B + ", " + format.Alpha / 255.0 + ");";
                        context.lineWidth = Math.round(Math.max(1, format.Size * 3 / 40));
                        context.stroke();
                    }
                    break;

                case InsApplyBeveledFrameToRectangle: // clark, 488730, support bevel effect for legend text

                    var lRect;
                    if (unit.IsAnimated === 0) {
                        lRect = ins.Rect;
                    }
                    else {
                        lRect = ins.Rect[0];
                        var rect2 = ins.Rect[1];
                        lRect.X = lRect.X * (1-progress) + rect2.X * progress;
                        lRect.Y = lRect.Y * (1-progress) + rect2.Y * progress;
                        lRect.Width = lRect.Width * (1-progress) + rect2.Width * progress;
                        lRect.Height = lRect.Height * (1-progress) + rect2.Height * progress;
                    }

                    var lRotationAngle = ins.RotationAngle;
                    var llBevelDepth = ins.BevelDepth;
                    var lrLTColor = ins.LTColor;
                    var lLTAlpha = ins.LTAlpha;
                    var lrRBColor = ins.RBColor;
                    var lRBAlpha = ins.RBAlpha;
                    var lDeviceAnchor ={X:lRect.X + lRect.Width / 2, Y:lRect.Y + lRect.Height / 2};
                    var lInnerRect = {X:0, Y:0, Width:0, Height:0};
                    lInnerRect.X =  lRect.X;
                    lInnerRect.Y = lRect.Y;
                    lInnerRect.Width = lRect.Width;
                    lInnerRect.Height = lRect.Height;
                    hImplode(lInnerRect, llBevelDepth, llBevelDepth);

                    var lOutterPolygon = [];

                    lOutterPolygon.push(hRotateAndClone({X:lRect.X, Y:lRect.Y}, lDeviceAnchor, lRotationAngle));
                    lOutterPolygon.push(hRotateAndClone({X:lRect.X + lRect.Width, Y:lRect.Y}, lDeviceAnchor, lRotationAngle));
                    lOutterPolygon.push(hRotateAndClone({X:lRect.X + lRect.Width, Y:lRect.Y + lRect.Height}, lDeviceAnchor, lRotationAngle));
                    lOutterPolygon.push(hRotateAndClone({X:lRect.X, Y:lRect.Y + lRect.Height},lDeviceAnchor, lRotationAngle));

                    var lInnterPolygon = [];
                    lInnterPolygon.push(hRotateAndClone({X:lInnerRect.X, Y:lInnerRect.Y}, lDeviceAnchor, lRotationAngle));
                    lInnterPolygon.push(hRotateAndClone({X:lInnerRect.X + lInnerRect.Width, Y:lInnerRect.Y}, lDeviceAnchor, lRotationAngle));
                    lInnterPolygon.push(hRotateAndClone({X:lInnerRect.X + lInnerRect.Width, Y:lInnerRect.Y + lInnerRect.Height}, lDeviceAnchor, lRotationAngle));
                    lInnterPolygon.push(hRotateAndClone({X:lInnerRect.X, Y:lInnerRect.Y + lInnerRect.Height}, lDeviceAnchor, lRotationAngle));

                    //    Left top area
                    var lLeftTop = [];
                    lLeftTop.push(hRotateAndClone({X:lRect.X, Y:lRect.Y + lRect.Height}, lDeviceAnchor, lRotationAngle));
                    lLeftTop.push(hRotateAndClone({X:lInnerRect.X, Y:lInnerRect.Y + lInnerRect.Height}, lDeviceAnchor, lRotationAngle));
                    lLeftTop.push(hRotateAndClone({X:lInnerRect.X, Y:lInnerRect.Y}, lDeviceAnchor, lRotationAngle));
                    lLeftTop.push(hRotateAndClone({X:lInnerRect.X + lInnerRect.Width, Y:lInnerRect.Y}, lDeviceAnchor, lRotationAngle));
                    lLeftTop.push(hRotateAndClone({X:lRect.X + lRect.Width, Y:lRect.Y}, lDeviceAnchor, lRotationAngle));
                    lLeftTop.push(hRotateAndClone({X:lRect.X, Y:lRect.Y}, lDeviceAnchor, lRotationAngle));
                    hDrawPolygon(context, lLeftTop, false, false);
                    context.fillStyle = "RGBA(" + lrLTColor.R + ", " + lrLTColor.G + ", " + lrLTColor.B + ", " + lLTAlpha / 255.0 + ");";
                    context.fill();

                    //    Right bottom area
                    var lRightBottom = [];
                    lRightBottom.push(hRotateAndClone({X:lRect.X, Y:lRect.Y + lRect.Height}, lDeviceAnchor, lRotationAngle));
                    lRightBottom.push(hRotateAndClone({X:lInnerRect.X, Y:lInnerRect.Y + lInnerRect.Height}, lDeviceAnchor, lRotationAngle));
                    lRightBottom.push(hRotateAndClone({X:lInnerRect.X + lInnerRect.Width, Y:lInnerRect.Y + lInnerRect.Height}, lDeviceAnchor, lRotationAngle));
                    lRightBottom.push(hRotateAndClone({X:lInnerRect.X + lInnerRect.Width, Y:lInnerRect.Y}, lDeviceAnchor, lRotationAngle));
                    lRightBottom.push(hRotateAndClone({X:lRect.X + lRect.Width, Y:lRect.Y}, lDeviceAnchor, lRotationAngle));
                    lRightBottom.push(hRotateAndClone({X:lRect.X + lRect.Width,Y:lRect.Y + lRect.Height}, lDeviceAnchor, lRotationAngle));
                    hDrawPolygon(context, lRightBottom, false, false);
                    context.fillStyle = "RGBA(" + lrRBColor.R + ", " + lrRBColor.G + ", " + lrRBColor.B + ", " + lRBAlpha / 255.0 + ");";
                    context.fill();

                    context.strokeStyle = "RGBA(230, 230, 230, " + lLTAlpha*0.5 / 255.0 + ");";
                    context.lineWidth = 1;
                    hDrawPolygon(context, lOutterPolygon, true, true);
                    context.stroke();
                    hDrawPolygon(context, lInnterPolygon, true, true);
                    context.stroke();
                    break;
            }
        }
    }

    function hGetRadialAlpha(rr, cc)
    {
        return 1 - ( Math.sqrt((cc - 256) * (cc -  256) + (rr -  256) * (rr -  256)) / (1.5 * 256) );
    }

    function hMoveTo(context, iX, iY, iIsLinePath, iIsLineWidthOdd)
    {
        var lOffset = (iIsLinePath && iIsLineWidthOdd) ? 0.5 : 0.0;
        context.moveTo(iX + lOffset, iY + lOffset);
    }

    function hLineTo(context, iX, iY, iIsLinePath, iIsLineWidthOdd)
    {
        var lOffset = (iIsLinePath && iIsLineWidthOdd) ? 0.5 : 0.0;
        context.lineTo(iX + lOffset, iY + lOffset);
    }

    function hDrawPolyLine(context, irPoints, iIsLinePath, iIsLineWidthOdd)
    {
        var lNumberOfPoints = irPoints.length;
        if(lNumberOfPoints<=0)
            return;
        context.beginPath();
        hMoveTo(context, irPoints[0].X, irPoints[0].Y, iIsLinePath, iIsLineWidthOdd);
        var lPreviousIndex = 0;
        for(i = 1; i < lNumberOfPoints; ++i)
        {
            // If the current point is not the last point and is on a vertical or horizontal segement formed by the prevous and the next point,
            // do not put it into the path.
            //if ((i + 1 == lNumberOfPoints) || irPoints[i].IsOnVerOrHorSegment(irPoints[lPreviousIndex], irPoints[i + 1]) == false)
            //{
                hLineTo(context, irPoints[i].X, irPoints[i].Y, iIsLinePath, iIsLineWidthOdd);
                lPreviousIndex = i;
            //}
        }
    }

    function hGetMarkerShape(iMarkerShape)
    {
        var opPoints = gMarkerShapes[iMarkerShape];
        var opPointNumber = opPoints.length/2;

        return {number:opPointNumber, points:opPoints};
    }


    function hGetClockwisePolygon(iMarkerShape, mpos, iMarkerSize)
    {
        var mPolygon = [];

        if (iMarkerShape == MS_Circle)
        {
            mPolygon.push({X:mpos.X - iMarkerSize, Y:mpos.Y - iMarkerSize});
            mPolygon.push({X:mpos.X + iMarkerSize, Y:mpos.Y - iMarkerSize});
            mPolygon.push({X:mpos.X + iMarkerSize, Y:mpos.Y + iMarkerSize});
            mPolygon.push({X:mpos.X - iMarkerSize, Y:mpos.Y + iMarkerSize});
            return mPolygon;
        }

        var lPointNumber;
        var lPoints;

        var rt = hGetMarkerShape(iMarkerShape);
        lPointNumber = rt.number;
        lPoints = rt.points;

        for (var i = 0; i < lPointNumber; i++)
        {
            var lx = (lPoints[2 * i]) * iMarkerSize / gLocalMarkerSize + mpos.X;
            var ly = (lPoints[2 * i + 1]) * iMarkerSize / gLocalMarkerSize + mpos.Y;
            mPolygon.push({X:lx, Y:ly});
        }

        return mPolygon;
    }

    function hDrawPolygon(context, irPoints, iIsLinePath, iIsLineWidthOdd)
    {
        var lNumberOfPoints = irPoints.length;
        if(lNumberOfPoints < 3)
            return;

        context.beginPath();
        if (iIsLinePath && iIsLineWidthOdd)
        {
            var lAdjustedPoints = [];
            for(var i = 0; i < lNumberOfPoints; ++i)
            {
                lAdjustedPoints.push(irPoints[i]);
            }

            var lPreviousIndex = lNumberOfPoints - 1;
            for(var i = 0; i < lNumberOfPoints; ++i)
            {
                lNextIndex = (i + 1 == lNumberOfPoints) ? 0 : i + 1;
                if (irPoints[i].X == irPoints[lPreviousIndex].X || irPoints[i].X == irPoints[lNextIndex].X)
                {
                    lAdjustedPoints[i].X += 0.5;
                }
                if (irPoints[i].Y == irPoints[lPreviousIndex].Y || irPoints[i].Y == irPoints[lNextIndex].Y)
                {
                    lAdjustedPoints[i].Y += 0.5;
                }
                lPreviousIndex = i;
            }
            hDrawPolyLine(context, lAdjustedPoints, false, iIsLineWidthOdd);
        }
        else
        {
            hDrawPolyLine(context, irPoints, false, iIsLineWidthOdd);
        }
        context.closePath();
    }

    function hRotate(point, irAnchor, iRadian)
    {
        var lXDist = point.X - irAnchor.X;
        var lYDist = point.Y - irAnchor.Y;

        point.X = irAnchor.X + Math.cos(iRadian) * lXDist - Math.sin(iRadian) * lYDist;
        point.Y = irAnchor.Y + Math.sin(iRadian) * lXDist + Math.cos(iRadian) * lYDist;
        return point;
    }

    function hRotateAndClone(point, irAnchor, iRadian)
    {
        return hRotate(point, irAnchor, iRadian);
    }

    function hImplode(rect, iXOffset, iYOffset)
    {
        if (iXOffset * 2 > rect.Width)
        {
            iXOffset = rect.Width / 2;
        }
        if (iYOffset * 2 > rect.Height)
        {
            iYOffset = rect.Height / 2;
        }

        return hExplode(rect, -iXOffset, -iYOffset);
    }

    function hExplode(rect, iXOffset, iYOffset)
    {
        rect.X -= iXOffset;
        rect.Y -= iYOffset;
        rect.Width += (iXOffset*2);
        rect.Height += (iYOffset*2);
        return rect;
    }

    function hGetTriangleAreaDouble(vectorA, vectorB, vectorC)
    {
        return hCrossProduct(vectorA,vectorB) + hCrossProduct(vectorB, vectorC) + hCrossProduct(vectorC, vectorA);
    }

    function hDistance(vectorA, vectorB)
    {
        return Math.sqrt((vectorA.X - vectorB.X) * (vectorA.X - vectorB.X)
            + (vectorA.Y - vectorB.Y) * (vectorA.Y - vectorB.Y));
    }

    //iCurrent angle is greater than 180 degree
    function hGetNewPolygon(polygon, iCurrent, oPolygon)
    {
        var rtPolygon = oPolygon;

        var lSize = polygon.length;
        var i = iCurrent;
        var lPointA = polygon[(i + lSize - 1) % lSize];
        var lPointC = polygon[(i + 1) % lSize];
        //AB
        var lIndexAB = 0;
        var lIntersectionAB = {X:0, Y:0};
        var lVectorAB = {X: polygon[iCurrent].X - polygon[(iCurrent + lSize - 1) % lSize].X,
            Y:polygon[iCurrent].Y - polygon[(iCurrent + lSize - 1) % lSize].Y};

        for(var k = (i+2) % lSize; k != i; k = (k + 1) % lSize)
        {
            var j = k - 1;
            if(j < 0)
                j += lSize;
            var lVectorBJ = {X:polygon[j].X - polygon[i].X, Y:polygon[j].Y - polygon[i].Y};
            var lVectorBK = {X:polygon[k].X - polygon[i].X, Y:polygon[k].Y - polygon[i].Y};
            if(hCrossProduct(lVectorAB, lVectorBJ) < 0.01 && hCrossProduct(lVectorAB, lVectorBK) > 0.01)
            {
                // cross(AB, BJ) <= 0, cross(AB, BK) > 0.
                var rt = hLineInterSection(lPointA, polygon[i], polygon[j], polygon[k], lIntersectionAB, false);
                lIntersectionAB = rt.interSection;
                lIndexAB = k;
                break;
            }
        }

        //CB
        var lIndexCB = 0;
        var lIntersectionCB = {X:0, Y:0};
        var lVectorCB = { X:polygon[iCurrent].X - polygon[(iCurrent + 1) % lSize].X, Y:polygon[iCurrent].Y - polygon[(iCurrent+1) % lSize].Y };
        for(var k = (i + lSize - 2) % lSize; k != i; k = (k - 1 + lSize) % lSize)
        {
            var j = k + 1;
            if(j >= lSize)
                j -= lSize;
            var lVectorBJ = {X:polygon[j].X - polygon[i].X, Y:polygon[j].Y - polygon[i].Y};
            var lVectorBK = {X:polygon[k].X - polygon[i].X, Y:polygon[k].Y - polygon[i].Y};
            if(hCrossProduct(lVectorCB, lVectorBJ) > -0.01 && hCrossProduct(lVectorCB, lVectorBK) < -0.01)
            {
                // cross(CB, BJ) >= 0, cross(CB, BK) < 0.
                var rt = hLineInterSection(lPointC, polygon[i], polygon[j], polygon[k], lIntersectionCB, false);
                lIntersectionCB = rt.interSection;
                lIndexCB = k;
                break;
            }
        }
        rtPolygon.push(polygon[i]);
        rtPolygon.push(lIntersectionAB);
        for(m = lIndexAB; ; m = (m + 1) % lSize)
        {
            rtPolygon.push(polygon[m]);
            if (m == lIndexCB)
                break;
        }
        rtPolygon.push(lIntersectionCB);

        return rtPolygon;
    }

    //polygon[0] is the current point
    function hGetNewAreaDepth(polygon, orMaxDepth)
    {
        var lSize = polygon.length;
        if(lSize == 3)
        {
            var lRt = hGetAreaDepth(polygon, orMaxDepth);
            return lRt;
        }
        else
        {
            //A---irPolygon.size()-1
            //B---0
            //C---1
            var lPointA = polygon[lSize - 1];
            var lVectorBC = {X:polygon[1].X - polygon[0].X, Y:polygon[1].Y - polygon[0].Y};
            var lVectorCB = {X:-lVectorBC.X, Y:-lVectorBC.Y};
            var lVectorBA = {X:lPointA.X - polygon[0].X, Y:lPointA.Y - polygon[0].Y};
            var lVectorAB = {X:-lVectorBA.X, Y:-lVectorBA.Y};

            var lIsValid = false;
            var lDepth = 1e10; // initialize to a very big value
            //next we will get all depth of <ABC
            for(var i = 2; i < lSize; ++i)
            {
                var j = i - 1;
                var lVectorJI = {X:polygon[i].X - polygon[j].X, Y:polygon[i].Y - polygon[j].Y};
                if (hCrossProduct(lVectorCB, lVectorJI) < -0.01)
                {
                    // Direction of JI is compatible with CB
                    var lPoint = {X:0, Y:0};
                    //get intersection point of BC and ji
                    var rt = hLineInterSection(polygon[0], polygon[1], polygon[j], polygon[i], lPoint, false);
                    lPoint = rt.interSection;
                    if(rt.val > 0)
                    {
                        var lVectorBIntersection = {X:lPoint.X - polygon[0].X, Y:lPoint.Y - polygon[0].Y};
                        //see if (B,C) is the same direction with (B,intersectionPoint)
                        if(hInnerProduct(lVectorBC, lVectorBIntersection) > 0.01)
                        {
                            // same direction
                            var lTempPoint = {X:lPoint.X + lVectorJI.X, Y:lPoint.Y + lVectorJI.Y};
                            var lBisectorPoint = {X:0, Y:0};
                            var lTemp;

                            var lRt = hGetBisectorPointAndDepth(lPointA, polygon[0], lPoint, lTempPoint, lBisectorPoint, lTemp);
                            lBisectorPoint = lRt.point;
                            lTemp = lRt.val;
                            if (lRt.mark)
                            {
                                lIsValid = true;
                                if((lTemp < lDepth) && hPointInRange(lBisectorPoint, polygon[j-1], polygon[j], polygon[i], polygon[(i+1)%lSize]))
                                {
                                    lDepth = lTemp;
                                }
                            }
                        }
                    }
                }
                else if(hCrossProduct(lVectorAB, lVectorJI) < -0.01)
                {
                    // Direction of JI is compatible with AB
                    var lPoint = {X:0, Y:0};
                    //get intersection point of AB and ji
                    var rt = hLineInterSection(polygon[0], lPointA, polygon[j], polygon[i], lPoint, false);
                    lPoint = rt.interSection;
                    if(rt.val > 0)
                    {
                        var lVectorBIntersection = {X:lPoint.X - polygon[0].X, Y:lPoint.Y - polygon[0].Y};
                        //see if (B,A) is the same direction with (B,intersectionPoint)
                        if(hInnerProduct(lVectorBA, lVectorBIntersection) > 0.01)
                        {
                            //same direction
                            var lTempPoint = {X:lPoint.x - lVectorJI.x, Y:lPoint.y - lVectorJI.y};
                            var lBisectorPoint = {X:0, Y:0};
                            var lTemp;

                            var lRt = hGetBisectorPointAndDepth(lTempPoint, lPoint, polygon[0], polygon[1], lBisectorPoint, lTemp);
                            lBisectorPoint = lRt.point;
                            lTemp = lRt.val;
                            if (lRt.mark)
                            {
                                lIsValid = true;
                                if((lTemp < lDepth) && hPointInRange(lBisectorPoint, polygon[j-1], polygon[j], polygon[i], polygon[(i+1)%lSize]))
                                {
                                    lDepth = lTemp;
                                } // end if
                            }
                        } // end if
                    } // end if
                } // end else if
            } // end for
            return {mark:lIsValid, depth:lDepth};
        } // end else
    }

    function hLengthSquared(vectorA)
    {
        return vectorA.X * vectorA.X + vectorA.Y * vectorA.Y;
    }

    function hGetAngularBisectorIntersectionPoint(vectorA, vectorB, vectorC, depth)
    {
        var lVectorBA = {X:vectorA.X - vectorB.X, Y:vectorA.Y - vectorB.Y};
        var lVectorBC = {X:vectorC.X - vectorB.X, Y:vectorC.Y - vectorB.Y};
        var lLengthBA = Math.sqrt(hLengthSquared(lVectorBA));
        var lLengthBC = Math.sqrt(hLengthSquared(lVectorBC));
        var lVectorUnitBA = {X: lVectorBA.X / lLengthBA, Y:lVectorBA.Y / lLengthBA};
        var lVectorUnitBC = {X:lVectorBC.X / lLengthBC, Y:lVectorBC.Y / lLengthBC};
        var lLength = 0.0;
        if(Math.abs(lVectorUnitBA.X - lVectorUnitBC.X) < 0.01)//X equals
        {
            lLength = depth * (lVectorUnitBC.X + lVectorUnitBA.X) / (lVectorUnitBA.Y - lVectorUnitBC.Y);
        }
        else//X diffs
        {
            lLength = depth * (lVectorUnitBC.Y + lVectorUnitBA.Y) / (lVectorUnitBC.X - lVectorUnitBA.X);
        }
        var oPointEnd = { X:0, Y:0 };
        var oPointStart = { X:0, Y:0 };
        oPointEnd.X = vectorB.X + lLength * lVectorUnitBC.X;
        oPointEnd.Y = vectorB.Y + lLength * lVectorUnitBC.Y;
        oPointStart.X = oPointEnd.X + depth * (-lVectorUnitBC.Y);
        oPointStart.Y = oPointEnd.Y + depth * lVectorUnitBC.X;

        return {start:oPointStart, end:oPointEnd};
    }

    function hIncludedAngle(vectorA, vectorB)
    {
        var lTemp = hInnerProduct(vectorA, vectorB) / (Math.sqrt(hLengthSquared(vectorA) * hLengthSquared(vectorB)));
        lTemp = (lTemp > 1.0) ? 1.0 : lTemp;
        lTemp = (lTemp < -1.0) ? -1.0 : lTemp;
        return Math.acos(lTemp);
    }

    function hPointInRange(irPoint, vectorA, vectorB, vectorC, vectorD)
    {
        //whether in range of <ABC
        var lVectorBA = {X:vectorA.X - vectorB.X, Y:vectorA.Y - vectorB.Y};
        var lVectorBC = {X:vectorC.X - vectorB.X, Y:vectorC.Y - vectorB.Y};
        var lAngleABC = radianToDegree(hIncludedAngle(lVectorBA, lVectorBC));
        if(hCrossProduct(lVectorBC, lVectorBA) < -0.01)
            lAngleABC = 360 - lAngleABC;
        var lVectorBPoint = {X:irPoint.X - vectorB.X, Y:irPoint.Y - vectorB.Y};
        var lAnglePointBC = radianToDegree(hIncludedAngle(lVectorBPoint,lVectorBC));
        if(hCrossProduct(lVectorBC, lVectorBPoint) < -0.01)
            lAnglePointBC = 360 - lAnglePointBC;
        if(2 * lAnglePointBC > lAngleABC)
            return false;

        //whether in range of <BCD
        var lVectorCB = {X:-lVectorBC.X, Y:-lVectorBC.Y};
        var lVectorCD = {X:vectorD.X - vectorC.X, Y:vectorD.Y - vectorC.Y};
        var lAngleBCD = radianToDegree(hIncludedAngle(lVectorCB, lVectorCD));
        if(hCrossProduct(lVectorCD, lVectorCB) < -0.01)
            lAngleBCD = 360 - lAngleBCD;
        var lVectorCPoint = {X:irPoint.X - vectorC.X, Y:irPoint.Y - vectorC.Y};
        var lAngleBCPoint = radianToDegree(hIncludedAngle(lVectorCB, lVectorCPoint));
        if(hCrossProduct(lVectorCPoint, lVectorCB) < -0.01)
            lAngleBCPoint = 360 - lAngleBCPoint;
        if(2 * lAngleBCPoint > lAngleBCD)
            return false;
        //in both range, ok
        return true;
    }

    function hLength(vectorA)
    {
        return Math.sqrt(hLengthSquared(vectorA));
    }

    function hGetBisectorPointAndDepth(vectorA, vectorB, vectorC, vectorD, orBisectorPoint, orDistance)
    {
        var val;
        var mark;

        var lVectorAB = {X:vectorB.X - vectorA.X, Y:vectorB.Y - vectorA.Y};
        var lVectorCD = {X:vectorD.X - vectorC.X, Y:vectorD.Y - vectorC.Y};
        var lVectorBC = {X:vectorC.X - vectorB.X, Y:vectorC.Y - vectorB.Y};
        var lLengthBC = Math.sqrt(hLengthSquared(lVectorBC));
        var lABCrossCD =  hCrossProduct(lVectorAB, lVectorCD);
        if (lABCrossCD > 0.01 || lABCrossCD < -0.01)
        {
            // In this case, ABC + BCD != 180
            // E: Intersection point of AB and CD
            var lE = {X:0, Y:0};
            var rt = hLineInterSection(vectorA, vectorB, vectorC, vectorD, lE, false);
            lE = rt.interSection;
            var lLengthBE = hDistance(vectorB, lE);
            var lLengthCE = hDistance(vectorC, lE);
            if (lABCrossCD < -0.01)
            {
                // In this case, ABC + BCD < 180
                var lP = lLengthBC + lLengthBE + lLengthCE;
                orBisectorPoint.X = (lLengthCE * vectorB.X + lLengthBE * vectorC.X + lLengthBC * lE.X) / lP;
                orBisectorPoint.Y = (lLengthCE * vectorB.Y + lLengthBE * vectorC.Y + lLengthBC * lE.Y) / lP;
                val = hGetTriangleAreaDouble(vectorB, vectorC, lE) / lP;
                mark = true;
            }
            else // lABCrossCD > gModuleMainPtr->mTolerance
            {
                // In this case, ABC + BCD > 180
                var lP = lLengthBE + lLengthCE - lLengthBC;
                if(lP < 0.01)//==0.0, one of them is 180
                {
                    var lDepth = 0.0;
                    if(Math.abs(hCrossProduct(lVectorAB, lVectorBC)) < 0.01)// <ABC = 180
                    {
                        var lVectorCBUnit = {X:-lVectorBC.X / lLengthBC, Y:-lVectorBC.Y / lLengthBC};
                        var lLengthCD = Math.sqrt(hLengthSquared(lVectorCD));
                        var lVectorCDUnit = {X:lVectorCD.X / lLengthCD, Y:lVectorCD.Y / lLengthCD};
                        lDepth = (lVectorCBUnit.Y - lVectorCDUnit.Y) * lLengthBC / (lVectorCBUnit.X + lVectorCDUnit.X);
                        orBisectorPoint.X = vectorB.X + lDepth * lVectorCBUnit.Y;
                        orBisectorPoint.Y = vectorB.Y + lDepth * (-lVectorCBUnit.X);
                    }
                    else// <BCD = 180
                    {
                        var lVectorBCUnit = {X:lVectorBC.X / lLengthBC, Y:lVectorBC.Y / lLengthBC};
                        var lLengthAB = hLength(lVectorAB);
                        var lVectorBAUnit = {X:-lVectorAB.X / lLengthAB, Y:-lVectorAB.Y / lLengthAB};
                        lDepth = (lVectorBAUnit.Y - lVectorBCUnit.Y) * lLengthBC / (lVectorBAUnit.X + lVectorBCUnit.X);
                        orBisectorPoint.X = vectorC.X + lDepth * (-lVectorBCUnit.Y);
                        orBisectorPoint.Y = vectorC.Y + lDepth * lVectorBCUnit.X;
                    }
                    val = lDepth;
                    mark = true;
                    return {val:val, mark:mark, point:orBisectorPoint};
                }
                orBisectorPoint.X = (lLengthCE * vectorB.X + lLengthBE * vectorC.X - lLengthBC * lE.X) / lP;
                orBisectorPoint.Y = (lLengthCE * vectorB.Y + lLengthBE * vectorC.Y - lLengthBC * lE.Y) / lP;
                val = hGetTriangleAreaDouble(vectorB, lE, vectorC) / lP;
                mark = true;
            }
        }
        else
        {
            // In this case, ABC + BCD = k * 180, k = 1, 2.

            //A, B, C, D are in the same line.
            if(Math.abs(hCrossProduct(lVectorAB, lVectorBC)) < 0.01)
            {
                mark = false;
                return {val:val, mark:mark, point:orBisectorPoint};
            }
            var lLengthAB = Math.sqrt(hLengthSquared(lVectorAB));
            var lUnitVectorBA = {X:-lVectorAB.X / lLengthAB, Y:-lVectorAB.Y / lLengthAB };
            orBisectorPoint.X = (vectorB.X + vectorC.X + lLengthBC * lUnitVectorBA.X) / 2;
            orBisectorPoint.Y = (vectorB.Y + vectorC.Y + lLengthBC * lUnitVectorBA.Y) / 2;
            val = hCrossProduct(lVectorBC, lUnitVectorBA) / 2;
            mark = true;
        }

        return {val:val, mark:mark, point:orBisectorPoint};
    }


    function hGetAreaDepth(polygon, orMaxDepth)
    {
        var val = false;

        var lPolygonSize = polygon.length;
        if(lPolygonSize == 3)
        {
            //triangle
            var lLengthA = hDistance(polygon[0], polygon[1]);
            var lLengthB = hDistance(polygon[1], polygon[2]);
            var lLengthC = hDistance(polygon[2], polygon[0]);
            var lP = lLengthA + lLengthB + lLengthC;
            orMaxDepth = hGetTriangleAreaDouble(polygon[0], polygon[1], polygon[2]) / lP;
            val = true;
        }
        else
        {
            var lIsValid = false;
            var lDepth = 1e10; // initialize to a very big value
            for(var i = 0; i < lPolygonSize; ++i)
            {
                var lPointB = polygon[i];
                //get the former and latter point
                var lPointA = polygon[(i + lPolygonSize - 1) % lPolygonSize];
                var lPointC = polygon[(i + 1) % lPolygonSize];
                var lPointD = polygon[(i + 2) % lPolygonSize];


                var lVectorBA = {X:lPointA.X - lPointB.X, Y:lPointA.Y - lPointB.Y};
                var lVectorBC = {X:lPointC.X - lPointB.X, Y:lPointC.Y - lPointB.Y};
                var lVectorCB = {X:-lVectorBC.X, Y:-lVectorBC.Y};
                var lVectorCD = {X: lPointD.X - lPointC.X, Y:lPointD.Y - lPointC.Y};
                var lBACrossBC = hCrossProduct(lVectorBA, lVectorBC);
                if(lBACrossBC < 0.01) //current angle is less than or equal to 180 degree
                {
                    if(hCrossProduct(lVectorCB, lVectorCD) < 0.01)//the next angle is less than 180 degree
                    {
                        var lTempPoint = {X:0, Y:0};
                        var lTemp = 0.0;

                        var lRt = hGetBisectorPointAndDepth(lPointA, lPointB, lPointC, lPointD, lTempPoint, lTemp);
                        lTempPoint = lRt.point;
                        lTemp = lRt.val;
                        if (lRt.mark)
                        {
                            lIsValid = true;
                            lDepth = (lDepth > lTemp) ? lTemp : lDepth;
                        }
                    }
                    // Do nothing if the next angle is greater 180 degree.
                }
                else if(lBACrossBC > 0.01)//current angle is greater than 180 degree
                {
                    var lPolygon = [];
                    lPolygon = hGetNewPolygon(polygon, i, lPolygon);

                    var lRt = hGetNewAreaDepth(lPolygon, lTemp);
                    var lTemp = lRt.depth;
                    if (lRt.mark)
                    {
                        lIsValid = true;
                        lDepth = (lDepth > lTemp) ? lTemp : lDepth;
                    }
                }
                // Do nothing if current angle is equal to 180 degree.
            }//end of for loop
            orMaxDepth = lDepth;
            val = lIsValid;
        }//end of else

        return {mark:val, depth:orMaxDepth};
    }//end of function

    function hIsFPointsEqual(vectorA, vectorB)
    {
        return (Math.abs(vectorA.X - vectorB.X) < 0.01 && Math.abs(vectorA.Y - vectorB.Y) < 0.01);
    }

    function hRemoveZeroEdgeInPolygon(polygon)
    {
        var lPolygon = [];
        lPolygon.push(polygon[0]);

        pcount = polygon.length;
        for(var i = 1; i < pcount; i++)
        {
            if (polygon[i-1].X == polygon[i].X && polygon[i-1].Y == polygon[i].Y)
                continue;
            lPolygon.push(polygon[i]);
        }

        var lFinalPolygon = new Array();
        pcount = lPolygon.length;
        for(var i = 0; i < pcount; i++)
        {
            if (i === pcount - 1)
            {
                if (lPolygon[i].X == lPolygon[0].X && lPolygon[i].Y == lPolygon[0].Y)
                    continue;
            }
            lFinalPolygon.push(lPolygon[i]);
        }

        return lFinalPolygon;
    }

    function hIsOnSegment(vectorA, vectorB, vectorC, bExclude)
    {
        var lTolerance = 0.01;
        if (bExclude === false)
            lTolerance = -0.01;

        if (Math.abs(vectorB.X - vectorC.X) < 0.01)
        {
            if (vectorA.Y - vectorB.Y > lTolerance && vectorC.Y - vectorA.Y > lTolerance)
                return true;
            if (vectorA.Y - vectorC.Y > lTolerance && vectorB.Y - vectorA.Y > lTolerance)
                return true;
        }
        else
        {
            if (vectorA.X - vectorB.X > lTolerance && vectorC.X - vectorA.X > lTolerance)
                return true;
            if (vectorA.X - vectorC.X > lTolerance && vectorB.X - vectorA.X > lTolerance)
                return true;
        }

        return false;
    }


    function hLineInterSection(vectorA, vectorB, vectorC, vectorD, vectorSection, bExclude)
    {
        var vectorAB = {X : vectorB.X - vectorA.X, Y : vectorB.Y - vectorA.Y};
        var vectorCD = {X : vectorD.X - vectorC.X, Y : vectorD.Y - vectorC.Y};

        if (Math.abs(hCrossProduct(vectorAB, vectorCD)) < 0.01)
        {
            var vectorAC = {X : vectorC.X - vectorA.X, Y : vectorC.Y - vectorA.Y};
            if (Math.abs(hCrossProduct(vectorAB, vectorAC)) < 0.01)
               return { val:-1, interSection:vectorSection };
            else
               return { val:0, interSection:vectorSection };
        }
        else
        {
            var vectorCA = {X : vectorA.X - vectorC.X, Y : vectorA.Y - vectorC.Y};
            var lS = hCrossProduct(vectorCD, vectorCA)/hCrossProduct(vectorAB, vectorCD);
            vectorSection.X = vectorA.X + lS*vectorAB.X;
            vectorSection.Y = vectorA.Y + lS*vectorAB.Y;
            if (hIsOnSegment(vectorSection, vectorA, vectorB, bExclude)
                    && hIsOnSegment(vectorSection, vectorC, vectorD, bExclude))
                return { val:1, interSection:vectorSection };
            else
                return { val:2, interSection:vectorSection };
        }
    }

    function hRatioInRectangle(rect, angle, anchor)
    {
        var lAngle = angle;
        while (lAngle < 0)
        {
            lAngle += 360;
        }
        while (lAngle >= 360)
        {
            lAngle -= 360;
        }

        var lEdgeRight = rect.X + rect.Width - anchor.x;
        var lEdgeUp = anchor.y - rect.Y;
        var lEdgeLeft = anchor.x - rect.X;
        var lEdgeDown = rect.Y + rect.Height - anchor.y;
        var lRadianAngle = degreeToRadian(lAngle);

        // Flip y-coordinate to make angle increase counterclockwise.
        var lUnitVectorAngle = {x : Math.cos(lRadianAngle), y : -Math.sin(lRadianAngle)};

        // A: Upper left corner
        // B: Upper right corner
        // C: Lower right corner
        // D: Lower left corner
        // E: Start Point
        // F: End Point
        // O: Anchor point
        var lLengthOF;
        var lNegLengthOE;
        if (lAngle >= 0 && lAngle < 90)
        {
            var lVectorOB = {x : lEdgeRight, y : -lEdgeUp};
            var lVectorOD = {x : -lEdgeLeft, y : lEdgeDown};
            lLengthOF = innerProduct(lVectorOB, lUnitVectorAngle);
            lNegLengthOE = innerProduct(lVectorOD, lUnitVectorAngle);
        }
        else if (lAngle >= 90 && lAngle < 180)
        {
            var lVectorOA = {x : -lEdgeLeft, y : -lEdgeUp};
            var lVectorOC = {x : lEdgeRight, y : lEdgeDown};
            lLengthOF = innerProduct(lVectorOA, lUnitVectorAngle);
            lNegLengthOE = innerProduct(lVectorOC, lUnitVectorAngle);
        }
        else if (lAngle >= 180 && lAngle < 270)
        {
            var lVectorOB = {x : lEdgeRight, y : -lEdgeUp};
            var lVectorOD = {x : -lEdgeLeft, y : lEdgeDown};
            lLengthOF = innerProduct(lVectorOD, lUnitVectorAngle);
            lNegLengthOE = innerProduct(lVectorOB, lUnitVectorAngle);
        }
        else // (iAngle >= 270 && iAngle < 360)
        {
            var lVectorOA = {x : -lEdgeLeft, y : -lEdgeUp};
            var lVectorOC = {x : lEdgeRight, y : lEdgeDown};
            lLengthOF = innerProduct(lVectorOC, lUnitVectorAngle);
            lNegLengthOE = innerProduct(lVectorOA, lUnitVectorAngle);
        }

        endPoint.x = anchor.x + lLengthOF * lUnitVectorAngle.x;
        endPoint.y = anchor.y + lLengthOF * lUnitVectorAngle.y;
        startPoint.x = anchor.x + lNegLengthOE * lUnitVectorAngle.x;
        startPoint.y = anchor.y + lNegLengthOE * lUnitVectorAngle.y;
        var lAnchorPercent = -lNegLengthOE / (lLengthOF - lNegLengthOE);
        if (lAnchorPercent < 0)
        {
            lAnchorPercent = 0;
        }
        else if (lAnchorPercent > 1)
        {
            lAnchorPercent = 1;
        }
        return lAnchorPercent;
    }

    function degreeToRadian(degree)
    {
        return degree * PI / 180;
    }

    function radianToDegree(radian)
    {
        return radian * 180 / PI;
    }

    function innerProduct(vector1, vector2)
    {
        return (vector1.x * vector2.x + vector1.y * vector2.y);
    }

    function hInnerProduct(vector1, vector2)
    {
        return (vector1.X * vector2.X + vector1.Y * vector2.Y);
    }

    function hCrossProduct(vector1, vector2)
    {
        return (vector1.X * vector2.Y - vector1.Y * vector2.X);
    }

    function fillGradient(context, format, rect, darkerFactor)
    {
        var gradient = format.Gradient;

        var startColor = "RGBA(" + Math.round(darkerFactor * gradient.StartGraphColor.R) + ", " + Math.round(darkerFactor * gradient.StartGraphColor.G) + ", " + Math.round(darkerFactor * gradient.StartGraphColor.B) + ", " + format.Alpha / 255.0 + ");";
        var endColor = "RGBA(" + Math.round(darkerFactor * gradient.EndGraphColor.R) + ", " + Math.round(darkerFactor * gradient.EndGraphColor.G) + ", " + Math.round(darkerFactor * gradient.EndGraphColor.B) + ", " + gradient.EndAlpha / 255.0 + ");";
        var finalGradient;

        switch (gradient.GradientType)
        {
        case GradientLinear:
            {
                var lHOffset = gradient.HorizontalOffset;
                if ((gradient.Angle > 90 && gradient.Angle < 180) || gradient.Angle > 270)
                {
                    // #370782, for backward compatibility.
                    lHOffset = 100 - lHOffset;
                }

                var lAnchorPoint = {x : rect.X + rect.Width * lHOffset / 100,
                        y : rect.Y + rect.Height * gradient.VerticalOffset / 100};
                startPoint = {x : 0, y : 0};
                endPoint = {x : 0, y : 0};
                var lAnchorPercent = hRatioInRectangle(rect, gradient.Angle, lAnchorPoint);

                finalGradient = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                finalGradient.addColorStop(0, endColor);
                finalGradient.addColorStop(lAnchorPercent, startColor);
                finalGradient.addColorStop(1, endColor);

                context.fillStyle = finalGradient;
                context.fill();
            }
            break;

        case GradientCircular:
            {
                var lAnchorPoint = {x : rect.X + rect.Width * gradient.HorizontalOffset / 100,
                        y : rect.Y + rect.Height * gradient.VerticalOffset / 100};
                var lScale = rect.Width * 1.0 / rect.Height;
                lAnchorPoint.y *= lScale;

                finalGradient = context.createRadialGradient(lAnchorPoint.x, lAnchorPoint.y, 0, lAnchorPoint.x, lAnchorPoint.y, rect.Width * 2);
                finalGradient.addColorStop(0, startColor);
                finalGradient.addColorStop(0.5, endColor);
                finalGradient.addColorStop(1, endColor);
                context.fillStyle = finalGradient;

                context.save();
                context.scale(1.0, 1 / lScale);
                context.fill();
                context.restore();
            }
            break;

        case GradientRectangular:
            {
                var lAnchorPoint = {x : rect.X + rect.Width * gradient.HorizontalOffset / 100,
                        y : rect.Y + rect.Height * gradient.VerticalOffset / 100};
                var lAngle = gradient.Angle % 90;
                var lRectAngle = radianToDegree(Math.atan(rect.Height / rect.Width));
                var lTempAngle = 2 * lAngle - lRectAngle * lAngle / 45 + 90 + lRectAngle;

                startPoint = {x : 0, y : 0};
                endPoint = {x : 0, y : 0};
                var lAnchorPercent = hRatioInRectangle(rect, lTempAngle, lAnchorPoint);

                var lGradient = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                startColor = "RGBA(" + Math.round(darkerFactor * gradient.StartGraphColor.R) + ", " + Math.round(darkerFactor * gradient.StartGraphColor.G) + ", " + Math.round(darkerFactor * gradient.StartGraphColor.B) + ", " + format.Alpha / (255.0 * 2 - format.Alpha) + ");";
                endColor = "RGBA(" + Math.round(darkerFactor * gradient.EndGraphColor.R) + ", " + Math.round(darkerFactor * gradient.EndGraphColor.G) + ", " + Math.round(darkerFactor * gradient.EndGraphColor.B) + ", " + gradient.EndAlpha / (255.0 * 2 - gradient.EndAlpha) + ");";
                lGradient.addColorStop(0, endColor);
                lGradient.addColorStop(lAnchorPercent, startColor);
                lGradient.addColorStop(1, endColor);
                context.fillStyle = lGradient;
                context.fill();

                lTempAngle = lRectAngle * lAngle / 45 + 90 - lRectAngle;
                lAnchorPercent = hRatioInRectangle(rect, lTempAngle, lAnchorPoint);

                finalGradient = context.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                startColor = "RGBA(" + Math.round(darkerFactor * gradient.StartGraphColor.R) + ", " + Math.round(darkerFactor * gradient.StartGraphColor.G) + ", " + Math.round(darkerFactor * gradient.StartGraphColor.B) + ", " + format.Alpha / (255.0 * 2) + ");";
                endColor = "RGBA(" + Math.round(darkerFactor * gradient.EndGraphColor.R) + ", " + Math.round(darkerFactor * gradient.EndGraphColor.G) + ", " + Math.round(darkerFactor * gradient.EndGraphColor.B) + ", " + gradient.EndAlpha / (255.0 * 2) + ");";
                finalGradient.addColorStop(0, endColor);
                finalGradient.addColorStop(lAnchorPercent, startColor);
                finalGradient.addColorStop(1, endColor);
                context.fillStyle = finalGradient;
                context.fill();
            }
            break;
        }
    }

    function addCompensativeLayer(context, format)
    {
        // Add this layer to make sure that the combine alpha value of non-simple layer and bevel-sphere layer is at least mAlpha.
        // The alpha value of 3 layers are a/(2-a), 0<=b<=1, and a/2.
        // The combine alpha is 1-(1-a/2)*(1-b)*(1-a/(2-a))=1-(1-b)*(1-a)>=1-(1-a)=a.
        var lFillAlpha = format.Alpha / 255.0;
        context.fillStyle = 'rgba(255,255,255,' + format.Alpha / 255.0 + ')';
        context.fill();
    }


    /**
     * This method clears the rectangle covering the entire context on the canvas.
     *
     * @param context The HTML5 Canvas' context object
     */
    function clearCanvas(context) {
        //Grab the canvas object from the context
        var canvas = context.canvas;

        //Clear the rectangle convering the entire canvas.
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function draw(widget) {
        INITIAL_TIME = (new Date()).getTime();
        drawEx(widget);// 479089 Use a helper method to support animation.
    }

    function drawEx(widget) {
        var data = widget.graphData,
            unitList = data.UnitList,
            unitCount = unitList.length,
            formatList = data.FormatList,
            cn = widget.graphNode,
            context = cn.getContext('2d');

        //Before we start, clear the canvas completely
        clearCanvas(context);

        // Use normalized time (eset the time to the max if we get the last animation cycle past the animation duration).
        var t = Math.min(((new Date()).getTime() - INITIAL_TIME) / ANIMATION_DURATION, 1),
            x = (1 - t),
            i;

        /**
         * Use Bezier curve function for progress to achieve ease in and out effect.
         * Reference: http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/Animation_Types_Timing/Articles/Timing.html
         * Control points for ease in and out:[(0, 0), (0,25, 0.1), (0.75, 0.9), (1, 1)].
         * progress = (1-t)^3 * 0 + 3 * (1-t)^2 * t * 0.1 + 3 * (1-t) * t^2 * 0.9 + t * t * t * 1
         */
        var progress = 0.3 * t * x * x + 2.7 * x * t * t + t * t * t;

        var isAnimated = 0;
        for (i = 0; i < unitCount; i++) {
            drawWithContext(context, progress, unitList[i], formatList);
            if (unitList[i].IsAnimated !== 0)
            {
                isAnimated = 1;
            }
        }

        //If we haven't reached our animation threshold...
        if (t < 1.0 && isAnimated === 1) {
            // Call draw again after 20 milliseconds.
            setTimeout(function() {
                drawEx(widget);
            }, 20);
        }
    }

    /**
     * A mixin to add canvas graph rendering abilities to normal image graph widgets.
     *
     * @class
     * @public
     */
    mstrmojo.graph._CanvasGraph = mstrmojo.provide(
        "mstrmojo.graph._CanvasGraph",

        /**
         * @lends mstrmojo.graph._CanvasGraph
         */
        {
            markupString: '<div class="{@cssClassPrefix} {@cssClass}" title="{@tooltip}" style="{@domNodeCssText};">' +
                              '<div class="{@cssClassPrefix}-txt"></div>' +
                              '<canvas id="{@id}" height="{@height}" width="{@width}">' +
                                  '{@unsupportedError}' +
                              '</canvas>' +
                              '{@map}' +
                              '<canvas id="{@id}-highlight" class="' + mstrmojo.GraphBase.canvasCLS + '" height="{@height}" width="{@width}" style="position:relative;top:0;left:0">' +
                              '</canvas>' +
                          '</div>',

            unsupportedError: "This text is displayed if your browser does not support HTML5 Canvas element.",

            markupSlots: {
                graphNode: function () { return this.domNode.childNodes[1]; },
                imgNode: function () { return this.domNode.childNodes[1]; },        // Non-canvas graphs need this slot.
                mapNode: function () { return null; },                              // Canvas case should not have a map node
                textNode: function () { return this.domNode.firstChild; },
                highlightNode: function () { return this.domNode.lastChild; }
            },

            /**
             * The data for this graph (must be supplied by the consumer of this mixin).
             *
             * @type Object
             */
            graphData: null,

            retrieveGraphSrc: function retrieveGraphSrc(h, w) {
                var graphNode = this.graphNode,
                    highlightNode = this.highlightNode;
                    graphData = this.graphData,
                    data = (graphData && graphData.data);

                if(data && data.eg) {
                    var tn = this.textNode,
                        img = this.imgNode;

                    // Hide the graph image.
                    img.style.display = 'none';
                    highlightNode.style.display = 'none';

                    // Display the message (or empty string).
                    tn.innerHTML = data.eg || '';

                    // Make sure the text node is visible.
                    tn.style.display = 'block';
                    // set the class name to set the background properly
                    tn.className = 'mstrmojo-message';
                } else {
                    // Set the size of the canvas.
                    var height = graphData.GH ||  parseInt(h, 10),
                        width = graphData.GW || parseInt(w, 10);

                    graphNode.setAttribute('height', height);
                    graphNode.setAttribute('width', width);

                    highlightNode.style.display = 'block';
                    highlightNode.setAttribute('height', height);
                    highlightNode.setAttribute('width', width);

                    highlightNode.style.top = -height + 'px';

                    // hide the tooltips in case of refresh
                    this.displayTooltips([], 0, 0);

                    // Draw the graph.
                    draw(this);

                    if (graphData.Selected) {
                        this.highlightAreaInInit(highlightNode, graphData.Selected);
                    }
                }

            },

            invalidate: function invalidate() {
                //TQMS #555940: Clear the canvas when the graph is invalidated.
                clearCanvas(this.graphNode.getContext('2d'));
            }
        }
    );

}());