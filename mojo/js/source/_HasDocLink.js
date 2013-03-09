(function () {
	mstrmojo.requiresCls("mstrmojo.string",
	                     "mstrmojo.css");

    /**
     * <p>A mixin for {@link mstrmojo.DocTextfield}s and {@link mstrmojo.DocImage}s
     * that have hyperlinks.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._HasDocLink = mstrmojo.provide(
        'mstrmojo._HasDocLink',
        
        /**
         * @lends _HasDocLink
         */
        {
            _mixinName: 'mstrmojo._HasDocLink',
            
            url: '',
        
            target: '',
        
            /**
             * Capture the url and target properties from the element.
             * 
             * @ignore
             */
            update: function update(node) {
                var d = node.defn;
                    
                // Cache the URL.
                this.url = node.data.url || d.url;
                
                // Do we have a target?
                if (d.target) {
                    // Cache it.
                    this.target = d.target;
                }
                    
                this._super(node);
            },

            postBuildRendering: function postBuildRendering() {
                // Does this component have a URL?
                if (this.url) {
                    // Add class to dom node so cursor will change to pointer.
                    mstrmojo.css.addClass(this.domNode, 'hasLink');
                }
                
                return this._super();
            },            
            
            onclick: function () {
                this.model.executeLink(this.url, this.target, this);
            },
            
            ontouchend: function (evt) {
                // Has this event NOT been handles by some other component?
                if (!evt.e.handled) {
                    // Simulate a click.
                    this.onclick();
                }
            }
        }
    );
}());