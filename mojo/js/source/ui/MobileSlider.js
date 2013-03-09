/**
 * Widget for slider on mobile device
 * only horizontal now, need to think 
 */
(function () {
    mstrmojo.requiresCls("mstrmojo.Widget",
                         "mstrmojo.css",
                         "mstrmojo.dom",
                         "mstrmojo.num",
                         "mstrmojo._TouchGestures");
    
    var $D = mstrmojo.dom,
        $MIN = Math.min,
        $MAX = Math.max,
        $RND = Math.round,
        $NUM = mstrmojo.num,
        $CD = $NUM.countOfDecimals;
    
    /**
     *          _________________________________________________________________________
     *          |                         ______                                        |
     *          |   _____________________|__  __|____________________________________   |
     *          |  |                     | |  | |                                    |  |
     *          |  |                     | |  | |                                    |  |
     *          |  |                     | |  | |                                    |  |
     *          |  |---------------------|-|  |-|------------------------------------|  |
     *          |                        |------|                                       |
     *          |-----------------------------------------------------------------------|
     *          
     * To consider the border/padding margins, we calculate the positioning of the individual parts of slider as:
     * 1. effective length used for representing the units are: the whole width of the container node - the offset width of the thumb
     * 2. the left position of thumb is current value * the unit length of each unit. 
     *    So, for the first unit, the thumb's left would be at the border of the container node (covering the border/padding of the left node).
     *    For the last unit, the thumb's right would be at right border of the container node (covering the border/padding of the right node).
     * 3. the width of the left node is current value * the unit length of each unit + 1/2 of the thumb width - left/right side extra space (border/padding/margin). margin?????
     * 4. the width of hte right node is current value * the unit length of each unit + 1/2 of hte thumb width - left/right side extra space (border/padding/margin). margin?????
     */

    /**
     * Initial positioning and caching some dimensions for later use.
     * we need to cache these dimensions:
     * - thumb width (_thumbLen)
     * - left node's extra width (_lnExt)
     * - right node's extra width (_rnExt)
     */
    function initCal() {
        var cs = document.defaultView.getComputedStyle,
            ns = [this.leftNode, this.rightNode],
            ps = [ 'border-left-width', 'padding-left', 'margin-left', 'border-right-width', 'padding-right', 'margin-right' ],
            ds = [0, 0],
            i, 
            j;
        
        // dimensions for all nodes involved in calculation. domNode, left node, right node...
        for (i = 0; i < ns.length; i++) {
            var styl = cs(ns[i]);
            for (j = 0; j < ps.length; j++) {
                ds[i] += parseInt(styl.getPropertyValue(ps[j]), 10) || 0;
            }
        }
        
        this._lnExt = ds[0];
        this._rnExt = ds[1];
        
        // calculate thumb length
        if (!this._thumbLen) {
            this._thumbLen = parseInt(this.thumbNode.offsetWidth, 10);
        }

        // the length can be used for representing units is 
        // outer div's length - left/right nodes' 1) margin left/right, 2) border left/right, 3) padding left/right - thumb width
        this._length = this.domNode.clientWidth;
        this._effLen = $RND(this._length - this._thumbLen);
        this._unitLen = this._effLen / (this.max - this.min);
        ////console.log("length: " + this._length + " effLen:" + this._effLen  + "unitLen: " + this._unitLen);
    }

    /**
     * Position left node, thumb node and right node according to current slider value.
     */
    function position(v) {
        // current length = current value / max value (0-based) * effective length
        var min = this.min,
            unitLength = this._unitLen,
            thumbLength = this._thumbLen / 2,
            lLen = $RND((v - min) * unitLength);
        
        // left node's width = current length + 1/2 thumb width - extra space 
        this.leftNode.style.width = (lLen + thumbLength - this._lnExt) + 'px';
        
        // right node's width = current length + 1/2 thumb width - extra space
        this.rightNode.style.width = (this._effLen - lLen + thumbLength - this._rnExt) + 'px';
        
        // thumb node's left = current length
        //this.thumbNode.style.left = $MAX($MIN(lLen , (this.max - min) * unitLength),0) + 'px';
        //this.thumbNode.style.webkitTransform = "translateX(" + $MAX($MIN(lLen , (this.max - min) * unitLength),0) + 'px' + ")";
        $D.translate(this.thumbNode, $MAX($MIN(lLen, (this.max - min) * unitLength), 0), 0);
    }

    /**
     * Calculates slider value based on the delta change on GUI
     */
    function calValueWDelta(v, delta) {
        var interval = this.interval;
        return $MIN($MAX(this.min, parseFloat(v, 10) + $RND(delta / this._unitLen / interval) * interval), this.max).toFixed(this._intervalDecimals); //add calling toFixed() to solve the JavaScript floating point problem 
    }
    
    /**
     * Calculates slider value based on the position on GUI
     */
    function calValueWX(x) {
        return calValueWDelta.call(this, this.min, x - $D.position(this.domNode, true).x - this._thumbLen / 2);
    }
    
    function getTouchRedirectFn(methodName) {
        return function (touch) {
            return this['touchSelect' + methodName](touch);
        };
    }
    /**
     * MobileSlider class
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.ui.MobileSlider = mstrmojo.declare(
        mstrmojo.Widget,

        [ mstrmojo._TouchGestures ],
        
        /**
         * @lends mstrmojo.ui.MobileSlider.prototype
         */
        {
            markupString: '<div class="mstrmojo-MobileSlider" style="visibility:hidden;" mstrAttach:click>' + 
                              '<div class="v"></div>' +        // left highlighted bar, inline
                              '<div class="bk"></div>' +        // right unselected bar, inline
                              '<div class="th"></div>' +        // middle thumb, absolute position
                              '<div class="min">{@minText}' + '</div>' +     // little marker for min value, inline float left
                              '<div class="max">{@maxText}</div>' + // little marker for max value, inline float right
                          '</div>',
                          
            markupSlots: {
                leftNode: function () { return this.domNode.childNodes[0]; },
                rightNode: function () { return this.domNode.childNodes[1]; },
                thumbNode: function () { return this.domNode.childNodes[2]; },
                minNode: function () { return this.domNode.childNodes[3]; },
                maxNode: function () { return this.domNode.childNodes[4]; }
            },
            
            markupMethods: {
                onvalueChange: function () {
                    if (this.hasRendered) {
                        // check the current value and position the nodes
                        position.apply(this, [this.value]);
                    }
                    
                    if (this.slidingValue !== this.value) {
                        this.set('slidingValue', this.value);
                    }
                },
                onslidingValueChange: function () {
                    if (this.hasRendered) {
                        position.apply(this, [this.slidingValue]);
                    }
                }
                
            },     
            /**
             * Current value of the slider.
             */
            value: 0,
            
            /**
             * The value set by slider during sliding.
             */
            slidingValue: 0,
            
            /**
             * Max value of the slider
             */
            max: 10,
            
            /**
             * Min value of the slider
             */
            min: 0,
            
            /**
             * Interval between acceptable values.
             */
            interval: 1,
            
            /**
             * User internally to save the number of decimal digits. It is used to overcome the inaccuracy in JavaScript Math calculation.
             * For example, 6*0.05 = 3.0000000000000004. We can avoid this by calling toFixed() with the decimal digits desired. For this example,
             * calling (6*0.05).toFixed(2) = "3.00".
             */
            _intervalDecimals: 0,
            
            /**
             * Override
             */
            init: function init(props) {            
                this._super(props);
                this._intervalDecimals = $CD(this.interval, '.'); //interval decimal is not localized
            },
            
            onintervalChange: function onintervalChange(n, v) {
                this._intervalDecimals = $CD(v, '.'); //interval decimal is not localized
            },
            
            preBuildRendering: function preBuildRendering() {
                //set localized min and max string
                this.minText = $NUM.toLocaleString(this.min);
                this.maxText = $NUM.toLocaleString(this.max);
                
                this._super();
            },
            
            /**
             * Override
             * 
             * @ignore
             */
            postBuildRendering: function postBuildRendering() {
                this._super();
                
                // calculate the real length can be used for representation and real unit length
                initCal.call(this);
                
                // position the left/right/thumb correctly
                position.call(this, this.value);
                
                // now set it visible
                this.domNode.style.visibility = 'visible';
            },
            
            resize: function resize() {
                // Calculate the real length can be used for representation and real unit length.
                initCal.call(this);
                
                // Position the left/right/thumb correctly.
                position.call(this, this.value);
            },
            // ------------------------------ Touch support --------------------------------------------
            
            /**
             * <p>Cancels the touch event.</p>
             * 
             * <p>If we later decide that we don't want to handle this touch we will bubble it.</p>
             *
             * @param {Object} touch The touch event as raised from {@link mstrmojo._TouchGestures}.
             * 
             * @ignore
             */
            touchBegin: function touchBegin(touch) {
                touch.stop();
            },
            
            /**
             * Begins sliding process if thumb was pressed, otherwise, bubbles touch event to parent.
             *
             * @param {Object} touch The touch event as raised from {@link mstrmojo._TouchGestures}.
             * 
             * @ignore
             */
            touchSelectBegin: function touchSelectBegin(touch) {
                // Is the target not a thumb?
                var target = touch.target;
                if (!target || target !== this.thumbNode) {
                    // Bubble the touch.
                    return this.bubbleTouchEvent(touch);
                }
                
                // Store the sliding value.
                this.slidingValue = this.value;
            },
            
            /**
             * Updates the 'slidingValue' during sliding.
             * 
             * @param {Object} touch The touch event as raised from {@link mstrmojo._TouchGestures}.
             * 
             * @ignore
             */
            touchSelectMove: function touchSelectMove(touch) {
                this.set('slidingValue', calValueWDelta.apply(this, [ this.value, touch.delta.x || 0 ]));
            },
            
            /**
             * Updates the 'slidingValue' && 'value' when sliding ends.
             * 
             * @param {Object} touch The touch event as raised from {@link mstrmojo._TouchGestures}.
             * 
             * @ignore
             */
            touchSelectEnd: function touchSelectEnd(touch) {
                this.set('slidingValue', calValueWDelta.apply(this, [this.value, touch.delta.x || 0 ]));
                this.set('value', this.slidingValue);
            },
            
            touchSwipeBegin: getTouchRedirectFn('Begin'),

            touchSwipeMove: getTouchRedirectFn('Move'),
            
            touchSwipeEnd: getTouchRedirectFn('End'),

            //----------------------------- click support ------------------------------------------------
            /**
             * Updates the 'value' when the slider got clicked on.
             * @param DomEvent evt
             * @param DomWindow hWin
             */
            onclick: function onclick(evt, hWin) {
                this.touchTap({
                    clientX: $D.getMousePosition(evt.e, hWin).x
                });
            },                
            
            // ------------------------------ Tap support ------------------------------------------------
            /**
             * Updates the 'value' when the slider got tapped on.
             */
            touchTap: function touchTap(touch) {
                this.set('value', calValueWX.call(this, touch.clientX));
            }
        }
    );
}());