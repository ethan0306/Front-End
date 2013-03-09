(function() {
    /**
     * A class to simulate Java StringBuffer class.
     * 
     * @class
     */
    mstrmojo.StringBuffer = mstrmojo.declare(
        null, 
        null,
        /**
         * @lends mstrmojo.StringBuffer.prototype
         */
        {
            scriptClass: 'mstrmojo.StringBuffer',
            
            /**
             * Appends new string into buffer.
             * 
             * @param txt The string to be appended.
             * @return current StringBuffer, so append() can be chained in usage. For example, sb.append('text:').append('3');
             */
            append: function append(txt) {
                if (!this.buf) {
                    this.reset();
                }
                this.buf[++this.len] = txt;
                return this; 
            },
            
            /**
             * Resets current string buffer, which will lose all previous content.
             */
            reset: function reset() {
                this.buf = [];
                this.len = -1;
            }
        }
    );

    /**
     * Returns the string representation of this string buffer.
     */    
    mstrmojo.StringBuffer.prototype.toString = function(sep) {
        var buf = this.buf;
        return (buf && buf.join(sep || '')) || '';         
    }
})();
