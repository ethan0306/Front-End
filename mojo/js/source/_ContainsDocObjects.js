(function () {
    
    /**
     * <p>Returns the value of the requested dimension (in pixels).</p>
     * 
     * <p>For performance, attempts to avoid measuring DOM and instead attempts to use formatting properties; only 
     * measures DOM if no dimension formatting property found.  Supports only formatting properties that are in pixels.</p>
     * 
     * @param {String} d The dimension to measure in initial capital form (Height or Width).
     * @param {mstrmojo.DocSubsection} w The instance of {@link mstrmojo.Widget} to measure.
     * 
     * @returns {Integer} The outer dimension (height or width) of this subsection (in pixels).
     * 
     * TODO: support for other units (inches, percent, auto).
     */
    function measureDimension(d, w) {
        // If no domNode (hasn't rendered) return 0.
        if (!w.domNode) {
            return 0;
        }
        
        // Create a variable to hold the cache name for this dimension.
        var cn = '_fixed' + d;
        
        // If the value is already cached, then return the cache.
        if (w[cn]) {
            return w[cn];
        }
        
        // Get the formatting properties.
        var f = w.getFormats();
        
        // Get the property name for this dimension.
        var p = d.toLowerCase();
        
        // Is the property in the formats?
        if (f && p in f) {
            // Get the value.
            var v = f[p];
            
            // Is it not a %?
            if (v.charAt(v.length - 1) !== '%') {
                // Parse it.
                var px = parseInt(v, 10);
                
                // Is it a number?
                if (!isNaN(px)) {
                    w[cn] = px;
                    return px;
                }
            }
        }
        
        // Measure the value (but don't set cache).
        return (w.domNode['client' + d] || 0);
    }    

    /**
     * <p>A mixin for {@link mstrmojo.Widget}s that can contain Report Services objects (text field, image, line, cross-tab) within them.</p>
     * 
     * <p>This mixin decorates the existing component with extra functionality to return it's height and width.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._ContainsDocObjects =
    /**
     * @lends mstrmojo._ContainsDocObjects#
     */
    {
        /**
         * <p>Returns the inner height of this widgets domNode (in pixels).</p>
         *  
         * @returns Integer 
         */
        height: function height() {
            return measureDimension('Height', this);
        },
        
        /**
         * <p>Returns the inner width of this widgets domNode (in pixels).</p>
         * 
         * @returns Integer 
         */
        width: function width() {
            return measureDimension('Width', this);
        },
        
        /**
         * Calculates the max z-index value from all mstrmojo.DocSubsection children.
         * 
         * @returns Integer
         */
        getMaxZIndex: function getMaxZIndex() {
            var mx = 0;
            mstrmojo.array.forEach(this.children, function (c) {
                mx = Math.max(mx, c.getFormats()['z-index']);
            });
            
            return mx;
        }
    };
})();