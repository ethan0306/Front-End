(function () {

    mstrmojo.requiresCls("mstrmojo.android.selectors.MobileSliderSelector");
    
    
    var $M = mstrmojo.android.selectors.MobileSliderSelector,
        f = $M.FLAGS,
        FLAG_UNSET = f.UNSET;
    
    /**
     * Widget for displaying slider expression selector for the Android platform.
     * 
     * @class
     * @extends mstrmojo.android.MobileSliderSelector
     */
    mstrmojo.android.selectors.MetricSlider = mstrmojo.declare(

        mstrmojo.android.selectors.MobileSliderSelector,

        null,
        
        /**
         * @lends mstrmojo.android.selectors.MetricSlider.prototype
         */
        {
            scriptClass: "mstrmojo.android.selectors.MetricSlider",
            
            constants: { //Initial range of the slider
                min : FLAG_UNSET, //If min and max are specified then the slider will have unlimited number of steps
                max : FLAG_UNSET
            },
            
            updateMinMaxLabels: function updateMinMaxLabels() {
                var t = this,
//                    c = t.constants,
//                    cMin = c.min,
//                    cMax = c.max,
                    mn = "&nbsp;",
                    mx = mn;
                
//                if (cMin !== FLAG_UNSET && cMax !== FLAG_UNSET) {
//                    mn = getDisp(cMin);
//                    mx = getDisp(cMax);
//                }
                
                t.minLabel.innerHTML = mn;
                t.maxLabel.innerHTML = mx;
            },
        
            buildSummary: function buildSummary(t) {
                this._super();
            }
        
        }
    );
    
}());