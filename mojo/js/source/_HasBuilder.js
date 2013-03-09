(function(){

	mstrmojo.requiresCls("mstrmojo.array");
	
    /**
     * <p>A mixin for a {@link mstrmojo.Container} that has a builder property.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._HasBuilder = 
        /**
         * @lends mstrmojo._HasBuilder#
         */
        {
            /**
             * Calls the builder to build children before calling renderChildren method.
             * 
             * @returns {Boolean} True
             */
            postBuildRendering: function postBldRndr() {
                if (!this.builtChildren) {
                    this.buildChildren();
                }
                return this._super();
            },

            getChildren: function getChildren(){
                return this.model.getChildren(this.node, false);
            },
            
            /**
             * Asks the model (if any) for a set of nodes that represent this widget's children; then asks
             * the builder (if any) to build widgets corresponding to those nodes; then adds those nodes
             * as children to this widget. Will exit if either builder or model are undefined.
             * @returns {Boolean} true if builder is called; false otherwise.
             */            
            buildChildren: function bldChdn(noAddChildren) {
                if (!this.builder || !this.model) {
                    return false;
                }

                // Clear pre-existing children, if any. Use set() so that Container's
                // custom setter will call removeChild and do cleanup if needed.
                if (this.children && this.children.length) {
                    this.set("children", []);
                }
                
                // Build children widgets.
                var m = this.model,
                    children = this.builder.build(
                        this.getChildren(),
                        m,
                        this.buildConfig
                );
                
                // Should we add the children?
                if (!noAddChildren) {
                    // Do it.
                    this.addChildren(children);
                }
                
                // Record that we've built already, for future reference so a re-render doesn't rebuild needlessly.
                this.builtChildren = true;
                
                // Return the children if we didn't add then already.
                return (noAddChildren) ? children : true;
            }            
    };
    
})();