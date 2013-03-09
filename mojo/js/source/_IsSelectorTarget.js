(function() {
    
    /**
     * <p>A mixin for widgets that contain a widget with a scrollbox.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._IsSelectorTarget = 
        /**
         * @lends mstrmojo._IsSelectorTarget#
         */
        {
            _mixinName: 'mstrmojo._IsSelectorTarget', 
            
            /**
             * Notifies the parent widget that this widget is dirty (or clean) due to a slice operation.
             * 
             * @param {Boolean} isDirty Indicates whether this widget is dirty (true) or clean (false).
             */
            setDirty: function setDirty(isDirty) {
                // If isDirty then add this key to the parents collection of dirty keys, otherwise, remove it.
                var mth = ((isDirty) ? 'add' : 'remove') + 'DirtyKey';
                if (this.parent && this.parent[mth]) {
                    this.parent[mth](this.k);
                }
            }
                
        };
    
})();