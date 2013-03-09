(function(){

    mstrmojo.requiresCls("mstrmojo.Widget",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.array",
                         "mstrmojo.dom",
                         "mstrmojo.css");
    
    /*Private variables*/
    
    var $C = mstrmojo.css,
        $EF = mstrmojo.emptyFn,
        $D = mstrmojo.dom,
        $HANDLE_WIDTH = 32,
        $CSS = mstrmojo.css,
    
        types = { //Global types of sliders
            SINGLE : 1,
            INCLUDE : 2,
            EXCLUDE : 3
        },
        
        f = { //Flags to be used internally
            CONTINUOUS_STEPS : -1,
            UNSET : -4641
        },
        
        tmp = {}, //stores temp values used while dragging 
        
        /*
         * Returns and caches the width of the slider container
         * */
        getSliderWidth = function(t){
            if(!tmp[t.id + "cw"]){
                
                var width = parseInt($C.getComputedStyle(t.sliderContainer).width, 10);                
                if(isNaN(width)){
                    
                    width = parseInt($C.getComputedStyle(t.domNode.parentNode).width, 10); 
                }
                
                tmp[t.id + "cw"] = width;
            }
            return tmp[t.id + "cw"];
        },
        
        /*
         * Returns the step of the single handle or the left thumb of the range handle
         * based on the left position of it, for example a 0 (0px left) will return step 0
         * t : widget
         * left : optional, the left of the handle, if it is not provided the third
         *          parameter handle should be provided
         * handle : optional, if not provided, the second parameter left should be provided, 
         *          and should be the handle which the step will be returned, [singleHandle | rangeContainer]
         * */
        getSingleStep = function(t, left, handle){
            var range = t.type !== types.SINGLE,
                handleWidth = $HANDLE_WIDTH,
                l = !!left ? (left - (handleWidth/2)) :  parseInt(handle.style.left, 10),
                st = t.steps,
                contWidth = getSliderWidth(t) - handleWidth,
                gap = Math.round(contWidth / (st - (!range ? 1 : 0))), //number of gaps on the slider |----|----|----| (3) 
                maxStep = range ? t.rightStep : st -1;                          
                
            return Math.min(maxStep, Math.round(l / gap));
        },
        
        /*
         * returns the current right step based on the position (width of the 
         * rangeContainer + left position) of the right handle
         * t : widget
         * */
        getRightStep = function(t){
            var rcStyle = t.rangeContainer.style,
                width = parseInt(rcStyle.width, 10) - $HANDLE_WIDTH,
                left = parseInt(rcStyle.left, 10),
                st = t.steps, //Use one more step for range calculations, the rightStep is exclusive
                contWidth = getSliderWidth(t) - $HANDLE_WIDTH,
                gap = Math.round(contWidth / st);
            
            return Math.max(0, 
                            Math.min(Math.round((left + width) / gap), 
                                     st));
        },
        
        /*
         * Returns where the left handle should be based on the current step
         * t : widget
         * step : which step is currently being calculated
         * handle : the handle node, the width of this node is used calculate the correct left so the handle
         *          does not get out of the container
         * */
        getLeftForSingle = function(t, step){
            var st = t.steps,
                w = getSliderWidth(t),
                hs = $HANDLE_WIDTH;
            return Math.min(w - hs, Math.max(0,((w / (st -1) * step) - hs/2))) + "px";
        },
        
        /*
         * Gets the left position of the include handle based on the provided leftStep, the include and exclude handles have left and right step.
         * t : widget
         * leftStep : current left step
         * */
        getLeftForRange = function(t, leftStep){                  
            
            var st = t.steps,
            w = getSliderWidth(t) - $HANDLE_WIDTH;
            
            return ((w /st) * leftStep) + "px";
        },
        
        /*
         * Returns the width of the include handle based on provided left and right step
         * t : widget
         * leftStep : current left step
         * rigthStep: current right step
         * */
        getWidthForRange = function(t, leftStep, rightStep){
            var st = t.steps, //The last step on the range handle is exclusive, use one more step for calculations
                w = getSliderWidth(t) - $HANDLE_WIDTH,
                ch = rightStep - leftStep;                     
            
            return  ((ch * w) / st) + $HANDLE_WIDTH + "px";
        },
        
        /*
         * Once the correct steps are calculated, this method will position the single selector 
         * on the correct place. Basically converts steps to left position.
         * t : widget
         * step : step where the singleHandle will be positioned
         * */
        positionSingleStep = function(t, step){
            var singleHandle = t.singleHandle;
            if(singleHandle){
                singleHandle.style.left = getLeftForSingle(t, step);
            }
        },
        
        /*
         * Once the correct steps are calculated, this method will position the slider 
         * on the correct place, using the style properties. Basically translates from steps to
         * left and width of the range handle.
         * t : widget
         * leftStep : step where the left handle will be positioned
         * rightStep : step where the right handle will be positioned
         * */
        positionRangeStep = function(t, leftStep, rightStep){
            var ic = t.rangeContainer,
            sty;
            
            if(ic){
                sty = ic.style;
                sty.left = getLeftForRange(t, leftStep);
                sty.width = getWidthForRange(t, leftStep, rightStep);
            }
        },
        
        /*  After moving the single handle, snap it on the correct position based on the step number
         *  t : widget object
         *  l : optional left position of the single handle, if not present will take the left from the style, 
         *      this is useful when the left is calculated and the handle hasn't been moved yet, for example when tapping the container. 
         *  handle : the handle that will be snapped
         * */
        snapHandle = function(t, l, handle){
            var range = t.type !== types.SINGLE,
                step = getSingleStep(t, l, handle), //if the calculated step is out of bounds use the max step
                stepName = range ? "leftStep" : "singleStep",
                func;
                
            if(step !== t[stepName]){
                t.set(stepName, step);
                this.step = step;
            }else{
                func = range ? positionRangeStep : positionSingleStep;
                func(t, step, t.rightStep);
            }
        },
        
        /*
         * Once the drag is done, snap the range handle to the closest step and set the current step on the widget
         * t : widget
         * left : optional, the left of the handle, if it is not provided the third
         *        parameter handle should be provided
         * handle : optional, if not provided, the second parameter left should be provided, 
         *          and should be the handle which the snap will be performed, [singleHandle | rangeContainer]
         * */
        snapRangeHandles = function(t, left, handle){
            var rangeContainer = t.rangeContainer,
                step,
                leftStep = t.leftStep,
                grabDrag = handle === rangeContainer;
            
            if(handle === t.rangeRHandle || grabDrag){
                step = getRightStep(t);
                leftStep += grabDrag ? step - t.rightStep : 0; //only modify left step if the handle was the container
                
                positionRangeStep(t, leftStep, step);
                if(t.rightStep !== step){
                    t.set("rightStep", step);
                    if(grabDrag){
                        t.set("leftStep", leftStep);
                    }
                }
            }else if(handle === t.rangeLHandle){
                snapHandle(t, left, rangeContainer);
            }
        },
        
        /*
         * Depending on the type of slider will try to snap the handles on the correct position 
         * based on the number of steps
         * */
        snapHandles = function(t, target){
            switch(t.type){
                case types.SINGLE:
                    snapHandle(t, null, t.singleHandle);
                    break;
                case types.EXCLUDE:
                case types.INCLUDE:
                    snapRangeHandles(t, null, target);
                    break;
            }
        },
        
        
        /*
         * Moves the range handle when tapping on the slider container, it moves the
         * slider one step to the tap position side
         * t : widget
         * tapPosition : position in pixels where the tap was done horizontally
         * */
        jumpRangeHandle = function(t, tapPosition){
            var rangeContainer = t.rangeContainer,
                rcStyle = rangeContainer.style,
                width = parseInt(rcStyle.width, 10),
                left = parseInt(rcStyle.left, 10),
                leftStep = t.leftStep,
                rightStep = t.rightStep,
                nuRs = rightStep,
                nuLs = leftStep;
            
            if(tapPosition > 0 && tapPosition < left && leftStep > 0){
                nuRs--;
                nuLs--;
            }else if(tapPosition > (left + width) && tapPosition < getSliderWidth(t)){
                nuRs++;
                nuLs++;
            }
            positionRangeStep(t, nuLs, nuRs);
            t.set("leftStep", nuLs);
            t.set("rightStep", nuRs);
        },
        
        
        /*
         * Moves a handle based on a delta, tries to keep it in bounds, used while dragging.
         * t : widget
         * node : node to be moved, usually the same handle but not always
         * handle : handle dom node
         * originalPosition : position from where the delta is calculated
         * deltaX : delta movement on the x axis
         * */
        moveHandle = function(slider, node, handle, position, deltaX){
            
            // Get the width of the thumb from the style collection.
            var width = handle.style.width;
            
            // Is the width empty?
            if (width === '') {
                // Get the width of the thumb from the computed style.
                width = $C.getComputedStyle(handle).width;
            }
            
            // Calculate final thumb position to be the position (plus optional delta) with a minimum value of 0 and a maximum value of the slider width (minus thumb width).
            position = Math.min(Math.max(0, position + (deltaX || 0)), getSliderWidth(slider) - parseInt(width, 10));
            
            // Move the thumb.
            node.style.left = position + 'px';
            
            return position;                                    
        },
        
        /*
         * Moves the left handle based on a delta, tries to keep it in bounds, used while dragging.
         * t : widget
         * originalPosition : position from where the delta is calculated
         * originalWidth : original width of the range handle, before the move started.
         * deltaX : delta movement on the x axis
         * */        
        moveRangeLHandle = function(t, originalPosition, originalWidth, deltaX){
            var rangeContainer = t.rangeContainer,
                rangeLHandle = t.rangeLHandle,
                contWidth = getSliderWidth(t) - $HANDLE_WIDTH,
                gap = Math.round(contWidth / t.steps), //number of gaps on the slider |----|----|----| (3)
                newWidth = originalWidth - deltaX,
                handlePos;
            
            if (newWidth >= (gap + $HANDLE_WIDTH)) {
                handlePos = moveHandle(t, rangeContainer, rangeLHandle, originalPosition, deltaX);
                
                if((originalPosition + deltaX) > 0){
                    rangeContainer.style.width = newWidth + "px";                
                }
                return handlePos;
            }                     
        },
        
        
        moveRangeRHandle = function(t, originalPosition, originalWidth, deltaX){
            var rangeContainer = t.rangeContainer,
                max = getSliderWidth(t) - parseInt(rangeContainer.style.left, 10),
                newWidth = originalWidth + deltaX,
                contWidth = getSliderWidth(t) - $HANDLE_WIDTH,
                gap = Math.round(contWidth / t.steps), //number of gaps on the slider |----|----|----| (3)
                handlePos;
            
            if(newWidth >= (gap+ $HANDLE_WIDTH)){
                handlePos = Math.min(max, newWidth);
                rangeContainer.style.width = handlePos + "px";
                
                return handlePos;
            }            
        },
        
        /*
         * Calls the build summary method that should be implemented by the subclasses
         * with the correct arguments
         * t : widget
         * */
        prepareSummary = function(t){
            var singleStep, leftStep, rightStep, summary;
            switch(t.type){
                case types.SINGLE:
                    singleStep = this.step == f.UNSET ?  getSingleStep(t, null, t.singleHandle) : this.step;
                    summary = t.buildSummary(singleStep);
                    this.step = f.UNSET;
                    break;
                case types.EXCLUDE:
                case types.INCLUDE:
                    leftStep = getSingleStep(t, null, t.rangeContainer);
                    rightStep = getRightStep(t);
                    summary = t.buildSummary(null, leftStep, rightStep);
                    break;
            }
            
            return summary;
        };
    
    /**
     * Widget for displaying slider selector for the Android platform.
     * 
     * @class
     * @extends mstrmojo.Widget
     * @borrows mstrmojo._TouchGestures
     */
    mstrmojo.android.selectors.MobileSliderSelector = mstrmojo.declare(

        mstrmojo.Widget,

        [ mstrmojo._TouchGestures, mstrmojo._ListSelections ],
        
        /**
         * @lends mstrmojo.android.selectors.MobileSliderSelector.prototype
         */
        {
            
            /*Confifuration flags*/
            
            width: 0, //width of the selector
            
            type : f.UNSET, //Type of slider, include, exclude or single select
            
            value : f.UNSET, //The user input of the value, it will be parsed to populate the (private) values field.
            
            steps : f.UNSET, //Number of steps on the slider, use CONTINUOUS_STEPS if unlimited 
            
            include : f.UNSET,
            
            /*End of configuration flags*/
            
            /*Start abstract methods*/
            
            initState : $EF, //called just after the rendering was performed, should be used to initialize the slider
            
            buildSummary : $EF, //called when the summary needs to be updated, notice that the steps will be provided on the arguments, do not use this steps attributes.
            
            updateMinMaxLabels : $EF, //called when the min or max labels need to be updated
            
            flushSelections : $EF, //called when the steps have been modified
            
            /*End of abstract methods*/
            
            step: f.UNSET,  //Cached step of the single thumb, used later for building summary
            
            singleStep : f.UNSET, //Current step of the single thumb, used for single select slider
            
            leftStep : f.UNSET, //Current step of the left thumb, used for include/exclude slider
            
            rightStep : f.UNSET, //Current step of the right thumb, used for include/exclude slider
            
            cssDisplay: 'block',
            
            scriptClass: "mstrmojo.android.selectors.MobileSliderSelector",
            
            useRichTooltip: true,
            
            markupString : 
                '<div class="mstrmojo-sliderSel" id="{@id}">'+
                    '<div></div>' + //floating editor
                    '<div class="mstrmojo-sliderSelSummary">&nbsp;</div>' + //Summary
                    '<div class="mstrmojo-sliderSelScrollerContainer">'+ //Slider                        
                        '<div class="mstrmojo-sliderSelScrollerHandle" style="display:none;">'+ //include container, set  width and left
                            '<div class="mstrmojo-sliderSelScrollerHandle1 leftHandle"></div>' + //include left handle
                            '<div class="mstrmojo-sliderSelScrollerHandle1 rightHandle"></div>' + //include right handle
                        '</div>' +
                        '<div class="mstrmojo-sliderSelScrollerHandle2" style="display:none;"></div>' + //single handle, set left                                
                    '</div>' +
                    '<div class="mstrmojo-sliderSelLabels">' + //Min and max labels
                        '<label class="mstrmojo-sliderSelLL">&nbsp;</label>' +
                        '<label class="mstrmojo-sliderSelLR">&nbsp;</label>' +
                    '</div>' +
                '</div>',
            
            markupSlots : {
                editor: function() {return this.domNode.childNodes[0];},
                summary: function() {return this.domNode.childNodes[1];},
                sliderContainer: function() {return this.domNode.childNodes[2];},
                rangeContainer: function() {return this.domNode.childNodes[2].childNodes[0];},
                rangeLHandle: function() {return this.domNode.childNodes[2].childNodes[0].childNodes[0];},
                rangeRHandle: function() {return this.domNode.childNodes[2].childNodes[0].childNodes[1];},
                singleHandle: function() {return this.domNode.childNodes[2].childNodes[1];},
                minLabel: function() {return this.domNode.childNodes[3].childNodes[0];},
                maxLabel: function() {return this.domNode.childNodes[3].childNodes[1];}
            },
            
            markupMethods: {
                onvisibleChange: function() { this.domNode.style.display = (this.visible) ? this.cssDisplay : 'none'; },
                /*
                 * Updates the slider style based on the type, basically allowing switching between include or 
                 * exclude mode on runtime, not actually intended to change between single and include/exclude.
                 * */
                ontypeChange: function(){
                    var s,
                        i = "none",
                        scClassName = "mstrmojo-sliderSelScrollerContainer",
                        handleClassName = "Handle1";
                    
                    switch(this.type){
                        case types.SINGLE:
                            s = 'block';
                            break;
                        case types.EXCLUDE:
                            scClassName = "mstrmojo-sliderSelScrollerContainerExcl";
                            handleClassName = "Handle2";
                            i = 'block';
                            break;
                        case types.INCLUDE:
                            i = 'block';                            
                            break;
                    }
                    
                    this.rangeContainer.style.display = i;
                    this.sliderContainer.className = scClassName;
                    this.rangeLHandle.className = "mstrmojo-sliderSelScrollerHandleX leftHandle".replace("HandleX", handleClassName);
                    this.rangeRHandle.className = "mstrmojo-sliderSelScrollerHandleX rightHandle".replace("HandleX", handleClassName);
                    
                    this.singleHandle.style.display = s;
                },
                onconstantsChange: function(){
                    this.updateMinMaxLabels();
                },
                onvalueChange: function(){
                    prepareSummary(this);
                }
            },            
            
            postBuildRendering: function postBuildRendering() {
                var rtn = this._super();
                this.initState();
                
                var d = this.tooltipNode || this.domNode;
                
                $D.detachEvent(d, 'mouseover', this._ontooltipover);
                $D.detachEvent(d, 'mouseout', this._ontooltipout);                
                
                return rtn;
            },
            
            onsingleStepChange : function(){
                positionSingleStep(this, this.singleStep);
            },
            
            onleftStepChange : function(){
                positionRangeStep(this, this.leftStep, this.rightStep);
            },
            
            onrightStepChange : function(){
                positionRangeStep(this, this.leftStep, this.rightStep);
            },
            
            /**
             * Only starts sliding process if thumb has been pressed on.
             * store temp positions when slide starts. 
             */
            touchSwipeBegin: function(touch) {
                var target = touch.target;
                if (!target) {
                    return false;
                }
                
                this.touchTap(touch);
                $CSS.addClass(target, 'glow');
                
                var singleHandle = this.singleHandle,
                    rangeContainer = this.rangeContainer,
                    left,
                    style;
                
                switch (target) {
                    case singleHandle:
                        left = singleHandle.style.left;
                        //tml.shl has the handle original left position, when the move started.
                        tmp.shl = parseInt(!!left ? left : 0, 10);  
                        break;
                        
                    case rangeContainer:
                    case this.rangeLHandle:
                    case this.rangeRHandle:
                        style = rangeContainer.style;
                        left = style.left;
                        //tmp.icl has the handle original left position, when the move started.
                        tmp.icl = parseInt(!!left ? left : 0, 10);
                        //tmp.icw has the handle original width, when the move started.
                        tmp.icw = parseInt(style.width, 10);
                        break;
                    case this.sliderContainer:
                        $CSS.addClass(singleHandle, 'glow');
                        break;
                    default:                        
                        this.bubbleTouchEvent(touch);
                }
                
                this._initTooltip();
                
                if(this.type === types.SINGLE){                    
                    this.touchSelectMove(touch, true);
                }                                    
            },
            
            /**
             * Moves the thumb while the finger of the user is down moving the handle, 
             * it triggers the summary update. This method is called by the touchGestures mixin.
             */
            touchSwipeMove: function(touch, ignoreNodeWidth) {
                var target = touch.target;
                if (!target) {
                    return false;
                }
                
                var singleHandle = this.singleHandle,
                    rangeContainer = this.rangeContainer,
                    rangeLHandle = this.rangeLHandle,
                    rangeRHandle = this.rangeRHandle,
                    deltaX = touch.delta.x,
                    leftPos, summary,
                    nodeWidth;
                
                
                switch(target){
                    case singleHandle:
                        leftPos = moveHandle(this, singleHandle, singleHandle, tmp.shl, deltaX);
                        break;
                    case rangeRHandle:
                        leftPos = moveRangeRHandle(this, tmp.icl, tmp.icw, deltaX);
                        break;
                    case rangeLHandle:
                        leftPos = moveRangeLHandle(this, tmp.icl, tmp.icw, deltaX);
                        break;
                    case rangeContainer:
                        if(this.type === types.INCLUDE){
                            leftPos = moveHandle(this, rangeContainer, rangeContainer, tmp.icl, deltaX);
                        }
                        break;
                    case this.sliderContainer:
                        leftPos = moveHandle(this, singleHandle, singleHandle, touch.clientX - $D.position(this.sliderContainer, true).x);                        
                }                  
                
                this._updateTooltip(touch.evt, target, leftPos, ignoreNodeWidth);
            },
            
            /*
             * When the touch ends, this method tries to snap the handles on the
             * correct step, and then if changed it will flush the selections, flushSelections
             * should be implemented on the extended class. Called by the touchGestures mixin. 
             */
            touchSwipeEnd: function(touch) {
                
                var target = (touch.target == this.sliderContainer) ? this.singleHandle : touch.target,
                    l = this.leftStep, r = this.rightStep, s = this.singleStep;                                
                
                $CSS.removeClass(target, 'glow');
                
                /*Snap handles will position the handles on the correct place and update the
                  step value depending on the handle that was moved.*/
                snapHandles(this, target);
                
                if(l !== this.leftStep || r !== this.rightStep || s !== this.singleStep){
                    this.flushSelections();
                }
                
                this.hideTooltip(touch.evt, this);
            },
            
            /*
             * When a tap is performed on the slider, this is called by the touchGestures 
             * mixin, the tap can be done on the slider container, and will move the handle
             * to that position.
             * */
            touchTap: function(touch){
                var target = touch.target;
                if (!target){
                    return false;
                }
                
                var sliderContainer = this.sliderContainer,
                    clientX = touch.clientX,
                    containerTapped = (sliderContainer === target),
                    tapPosition = clientX - $D.position(sliderContainer, true).x,
                    l = this.leftStep, r = this.rightStep, s = this.singleStep;
                                
                switch(this.type){
                    case types.SINGLE:
                        if(containerTapped){
                            snapHandle(this, tapPosition , this.singleHandle);
                        }
                        break;
                    case types.INCLUDE:
                        if(containerTapped){
                            jumpRangeHandle(this, tapPosition);
                        }
                        break;
                    //Do nothing for exclude mode, for now.
                }
                                
                if(l !== this.leftStep || r !== this.rightStep || s !== this.singleStep){
                    prepareSummary(this);
                    this.flushSelections();
                }                
            },
            
            touchSelectBegin: function(touch) {
                this.touchSwipeBegin(touch);
            },
            touchSelectMove: function(touch) {
                this.touchSwipeMove(touch, true);
            },
            touchSelectEnd: function(touch) {
                this.touchSwipeEnd(touch);
            },
            
            touchEnd: function touchEnd(touch) {
                this.hideTooltip(touch.evt, this);
            },
            
            _initTooltip: function _initTooltip() {
             
                this.set('richTooltip', {refNode : this.domNode,
                                         posType: mstrmojo.tooltip.POS_BOTTOMCENTER,
                                         contentNodeCssClass: 'mstrmojo-sliderTip'});                                                   
            },             
            
            _updateTooltip: function _updateTooltip(event, target, leftPos, ignoreNodeWidth) {                                              
                
                this.showTooltip(event, this);
                var containerNode = $D.position(this.sliderContainer, false),
                    dposDomNode = $D.position(this.domNode, false),
                    boxContainer = mstrmojo.boxmodel.offset(this.sliderContainer),
                    breachedTopBoundary = (containerNode.y < 90),
                    ttN = this.richTooltip,
                    content = prepareSummary(this),
                    nodeWidth;
               
                if(ignoreNodeWidth){
                    
                    nodeWidth = ($HANDLE_WIDTH / 2);
                } else {        
                    
                    nodeWidth = target.style.width;
                    
                    if(nodeWidth === ""){
                        nodeWidth = $C.getComputedStyle(target).width;
                    }
                    nodeWidth = parseInt(nodeWidth, 10) / 2;
                }                                                    
                
                ttN.content = '<div class="mstrmojo-sliderTip-top">' + content + '</div>' +
                              '<div class="mstrmojo-sliderTip-bottom' + (breachedTopBoundary ? ' down' : '') + '">' + '</div>';
                
                ttN.top = dposDomNode.y - boxContainer.top - 20 + (breachedTopBoundary ? 100 : 0);
                ttN.left = leftPos + nodeWidth + (dposDomNode.x - boxContainer.left);            
                
                this.richTooltip = null;
                this.set('richTooltip', ttN);
            },           
            
            onselectionChange: function onselChg(evt) {
                // A hook for custom behavior
                if (this.onchange) {
                    this.onchange();
                }
            },
            
            //Utility method to be called via JS, used for debugging purposes.
            slideHosted : function(single, left, right){                                                
                
                if(single !== null && single !== undefined) {this.set("singleStep", single);}
                if(left !== null && left !== undefined) {this.set("leftStep", left);}
                if(right !== null && right !== undefined) {this.set("rightStep", right);}
                this.flushSelections();
                prepareSummary(this);                             
            }
            
        }
    );
    
    var $MSL = mstrmojo.android.selectors.MobileSliderSelector; 
    
    $MSL.TYPES = types;
    $MSL.FLAGS = f; 
    
}());   