(function () {
    
    var CLASS_NAME = 'mstrmojo._Can';
    
    /**
     * <p>A mixin with methods for executing a MicroStrategy object(Report, Graph or Document)and polling for execution status until complete.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._Can = mstrmojo.provide(
        'mstrmojo._Can',
        
        /**
         * @lends mstrmojo._Can
         */
        {
            _mixinName: 'mstrmojo._Can',
            
            
            
            can: function can(command) {
                return this[command];
            }
        }
    );
})();