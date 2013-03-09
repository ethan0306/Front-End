(function() {
    
    /**
     * <p>A mixin for Report Services with url properties on Mobile devices..</p>
     * 
     * @class
     * @public
     */
    mstrmojo._HasRelativeUrls = 
        /**
         * @lends mstrmojo._HasRelativeUrls#
         */
        {
            _mixinName: 'mstrmojo._HasRelativeUrls', 
            
            /**
             * An array of property names whose values contain URLs.
             * 
             * @type String[]
             */
            relativeUrls: [], 
            
            /**
             * Override to add host URL to the properties in the relativeUrls collection.
             * 
             *  @ignore
             */
            update: function update(node) {
                this._super(node);
                
                var me = this,
                    doc = me.builder.parent,
                    hostUrl = mstrApp.getConfiguration().getHostUrlByProject(mstrApp.getCurrentProjectId());

                // Iterate the collection of URLs to change.
                mstrmojo.array.forEach(this.relativeUrls, function (p) {
                    // Grab the value of this URL property.
                    var url = me[p];
                    
                    // Do we have a URL and does it NOT contain a protocol?
                    if (url && (url.indexOf('://') === -1 && url.indexOf('data:') !== 0)) {
                        // Add the hostUrl value.
                        me[p] = hostUrl + url;
                    }
                });
            }
                
        };
    
})();