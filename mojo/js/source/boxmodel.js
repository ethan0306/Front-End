(function(){

    /**
     * A utility class to hold common box model operations.
     * 
     * @class
     */
    mstrmojo.boxmodel =
        /**
         * @lends mstrmojo.boxmodel
         */
        {
            /**
             * Do the ranges intersect?
             * 
             */
    		rangeIntersect:	function rangeInt(/*Integer*/ top1, /*Integer*/ bot1, /*Integer*/ top2, /*Integer*/ bot2) {
    	            if (top1 < top2) {
    	            	return top2 <= bot1;
    	            } else if (top1 > top2) {
    	            	return top1 <= bot2;
    	            } else {
    	            	return true;
    	            }
    		},
    		
    		/**
    		 * Converts pixel units to inches.
    		 * 
    		 * @param {mstrmojo.DocModel} di A mstrmojo.DocModel which has properties for zoom factor (zf) and DPI (dpi).
    		 * @param {String|Integer} v The pixel value. 
    		 */
    		px2Inches: function px2Inches(di, v) {
    			// Convert to an integer.
    			v = parseInt(v, 10);
    			
    			// Divide by zoom and dpi (limit to 4 decimals).
    			return parseFloat((v / di.zf / di.dpi).toFixed(4), 10);
    		},
    		
            /**
             * Measures the offsetLeft and offsetTop of one DOM node relative to another.
             */
    		offset: function offst(/*DomNode*/ el, /*DomNode?*/ elLimit) {
    		    var org = el,
    		    	x = 0,
                    y = 0;
                while (el) {
                    x += el.offsetLeft;
                    y += el.offsetTop;
                    el = el.offsetParent;
                    if (el === elLimit) break;
                }
                // Now loop through the ancestors of the element, looking for any that have scrollTop/Left set.
                // Subtract these scrolling values from the total offset. However, we must be sure to stop the loop
                // before we reach document.body, or we'll take document scrolling into account 
                // and end up converting our offset ot winodw coordinates.
                for (e = org.parentNode; e && e != elLimit; e = e.parentNode){
                	if (e.scrollTop) y -= e.scrollTop;
                	if (e.scrollLeft) x -= e.scrollLeft;
                }
                return {left: x, top: y};
    		}
    	};
})();