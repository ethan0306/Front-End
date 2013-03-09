(function () {

    mstrmojo.requiresCls("mstrmojo.android.selectors.MobileSliderSelector",
                         "mstrmojo.hash");
    
    var $M = mstrmojo.android.selectors.MobileSliderSelector,
        $F = $M.FLAGS,
        $T = $M.TYPES;
    
    /**
     * Widget for displaying slider items selector for the Android platform.
     * 
     * @class
     * @extends mstrmojo.android.selectors.MobileSliderSelector
     */
    mstrmojo.android.selectors.Slider = mstrmojo.declare(

        mstrmojo.android.selectors.MobileSliderSelector,

        null,
        
        /**
         * @lends mstrmojo.android.selectors.Slider
         */
        {
            scriptClass: "mstrmojo.android.selectors.Slider",
            
            items : $F.UNSET,
            
            initState: function initState() {
                if (!!this.items) {
                    //Clear cached values issue #497643
                    this.leftStep = this.rightStep = this.singleStep = null;
                    
                    this.set('type', (!this.multiSelect) ? $T.SINGLE : (this.include) ? $T.INCLUDE : $T.EXCLUDE);
                    this.set('steps', this.items.length);
                    this.value = null;
                    this.set('value', this.selectedIndices);
                }
            },
            
            /**
             * If the value changed, update the steps to trigger GUI update.
             */
            onvalueChange : function onvalueChange() {
                var values = this.value,
                    mn = mstrmojo.hash.any(values, true),
                    mx = mn;
                
                if (this.type === $T.SINGLE) {
                    this.set('singleStep', parseInt(mn) || 0);
                    
                } else {
                    var p;
                    
                    for (p in values) {
                        mn = Math.min(p, mn);
                        mx = Math.max(p, mx);
                    }
                    
                    // Default to zero.
                    mn = mn || '0';
                    if (mx === undefined || mx === null) {                        
                        mx = String(this.steps - 1);
                    }
                    
                    this.set('leftStep', parseInt(mn, 10));         // leftStep is inclusive
                    this.set('rightStep', parseInt(mx, 10) + 1);    // rightStep is exclusive
                }
            },
            
            /**
             * The steps just changed, select the values using the _ListSelections mixin
             */
            flushSelections: function flushSelections() {
                if (this.type === $T.SINGLE) {
                    this.select([ this.singleStep ]);
                    
                } else {
                    var s = [],
                        i = this.leftStep;
                    
                    for (; i < this.rightStep; i++) {
                        s.push(i);
                    }
                    
                    this.select(s);
                }
            },
            
            /**
             * Update the summary based on the steps
             * singleStep : optional, provided when in single mode
             * leftStep : optional, provided when in include/exclude mode
             * rightStep : optional, provided when in include/exclude mode
             */
            buildSummary: function buildSummary(singleStep, leftStep, rightStep) {
                var items = this.items,
                    s = (singleStep !== null) ? singleStep : leftStep;
                
                // Is selector unset?
                if (s === undefined || s === null || isNaN(s) || !items.length) {
                    // No summary to build so exit.
                    return;
                }
                
                var summary = (singleStep === null && leftStep !== rightStep - 1) ? items[leftStep].n + " - " + items[rightStep - 1].n : (items[s] && items[s].n) || '';
                
                this.summary.innerHTML = summary;
                
                return summary;
            }
            
        }
    );
    
}());