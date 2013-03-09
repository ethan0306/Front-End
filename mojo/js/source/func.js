(function(){
    /**
     * <p>Static class with helper methods for using Function objects.</p>
     * 
     * @class
     */
    mstrmojo.func = mstrmojo.provide(
            
        "mstrmojo.func",
       
        {
            /**
             * <p>Utility function for combining multiple function calls.</p>
             * 
             * @param {Function[]} fn An array of functions to call.
             * 
             * @returns {Function} The wrapper function that will call each of the supplied functions in the order they appear in the <strong>fn</strong> parameter.
             */
            composite: function c(fn) {
                // Is the 'fn' parameter invalid?
                if (!fn || !fn.length) {
                    // Return an empty function
                    return function(){};
                }
        
                return function() {
                    for (var i = 0, len = fn.length; i < len; i++) {
                        fn[i].apply(this, arguments);
                    }
                };
           },
           
           /**
            * @param Object source
            * @param Object [destination]
            * 
            * @returns A new composite object of the source and destination.
            */
           wrapMethods: function wrapMethods(source, destination) {
               // Initialze callback (in case it was null).
               destination = destination || {};

               // Iterate the source object and wrap existing methods (if present in destination) or
               // add source method if not present in destination.
               mstrmojo.hash.forEach(source, function(fn, fnName) {
                   destination[fnName] = (fnName in destination && typeof(fn) == 'function') ? mstrmojo.func.composite( [ fn, destination[fnName] ]) : fn;
               });
               
               return destination;
           }, 
           
           addMethods: function addMethods(source, destination) {
               // Initialze callback (in case it was null).
               destination = destination || {};

               // Iterate the source object and wrap existing methods (if present in destination) or
               // add source method if not present in destination.
               mstrmojo.hash.forEach(source, function(fn, fnName) {
                   if ( ! (fnName in destination) && typeof(fn) == 'function') {
                       destination[fnName] = fn;
                   }
               });
               
               return destination;
           }           
           
        });
})();
