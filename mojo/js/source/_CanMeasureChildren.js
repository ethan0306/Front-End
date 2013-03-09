(function () {
    
    /**
     * Returns the sum of the supplied dimension for all children.
     * 
     *  @param {HTMLElement} node The dom node for this widget.
     *  @param {String} dim The name of the method to call on the child for this dimension.
     *  @param {mstrmojo.Widget[]} ch The array of child widgets.
     *  
     *  @return Integer
     *  @private
     */
    
    function measureDimension(node, dim, ch) {
        var x = 0,
            i = 0,
            len = (ch && ch.length) || 0;
        
        // If there is no dom node then return 0.
        if (!node || !ch) {
            return x;
        }
        
        // Step through the children and ask each for it's dimension value.
        for (; i < len; i++) {
            x += ch[i][dim]();
        }
        
        // Return the sum.
        return x;
    }
    
    /**
     * @private
     */
    function resolveChildrenToMeasure(ch, count) {
        if (count === undefined || isNaN(count)) {
            return ch;
        }
        
        // TQMS #501685: Guard against undefined children.
        return (ch && [ ch[count - 1] ]);
    }

    /**
     * <p>A mixin for measuring the dimensions of child components.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._CanMeasureChildren = 
        /**
         * @lends mstrmojo._CanMeasureChildren#
         */
        {
            
            /**
             * Returns the sum of the heights of the children of this widget.
             * @param Integer [count=all] An optional number of children to include in the sum.  If omitted, all children will be included.
             * 
             * @returns Integer
             */
            height: function height(count) {
                return measureDimension(this.domNode, 'height', resolveChildrenToMeasure(this.children, count));
            },
            
            /**
             * Returns the sum of the widths of the children of this widget.
             * @param Integer [count=all] An optional number of children to include in the sum.  If omitted, all children will be included.
             * 
             * @returns Integer
             */
            width: function width(count) {
                return measureDimension(this.domNode, 'width', resolveChildrenToMeasure(this.children, count));
            }
            
        };
    
}());