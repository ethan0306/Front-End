(function(){
    
    var ESC = '*';
    var D = '.';
    var B = '-';
    var K = '_';
    var L = '<';
    
    var regEx = new RegExp('[' + '\\' + ESC + '\\' + D + '\\' + B + '\\' + K + '\\' + L + ']', 'g');
    var repText = ESC + '$&';
    
    /**
     * Static class for serializing data.
     * 
     * @class
     */
    mstrmojo.Serializer = {
        scriptClass: 'mstrmojo.Serializer',
            
        /**
         * <p>Returns a String of serialized group values.</p>
         * 
         * @param {String[][]} av A multi-dimensional array of strings to be serialized.
         * @type String
         */
        serializeValueGroup: function(av) {
            mstrmojo.array.forEach(av, function (v, i) {
                av[i] = mstrmojo.Serializer.serializeValues(v);
            });
            return B + this.serializeValues(av) + K;
        },
    
        /**
         * Returns a String of serialized values.
         * 
         * @param {String[]} av A single-dimensional array of strings to be serialized.
         * @type String
         */
        serializeValues: function (av) {
            var t = [];
            mstrmojo.array.forEach(av, function(v) {
                if (typeof(v) === 'Boolean') {
                    v = (v) ? '1' : '0';
                }
                
                t.push(String(v).replace(regEx, repText));
            });
            
            return t.join(D);
        }
        
    };    

})();