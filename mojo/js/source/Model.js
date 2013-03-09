(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Obj",
        "mstrmojo._LoadsScript",
        "mstrmojo._HasChildren",
        "mstrmojo.Binding",
        "mstrmojo._HasBindings");
    
    /**
     * <p>Base data model class.</p>
     *
     * <p>A Model is an enhanced Obj with the ability to:
     * <ul>
     * <li>load additional javascript methods at run-time,</li>
     * <li>contain "child" objects (such as instances of Obj, Model), and </li>
     * <li>use "bindings" to set its property values dynamically.</li>
     * </ul>
     * </p>
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.Model = mstrmojo.declare(
        // superclass
        mstrmojo.Obj,

        // mixins
        [mstrmojo._LoadsScript, mstrmojo._HasChildren, mstrmojo._HasBindings],
                
        /**
         * @lends mstrmojo.Model.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.Model",


            /**
             * <p>Base data model class.</p>
             *
             * <p>Enhances the inherited constructor {@link mstrmojo.Obj#init} in order to do the following after initializing itself:
             * <ol>
             * <li>initialize this object's child objects (if any),</li>
             * <li>call the "postCreateChildren" handler (if any),</li>
             * <li>initialize this object's bindings (if any), and</li>
             * <li>call the "postCreateBindings" handler (if any).</li>
             * </ol>
             * </p>
             * 
             * @constructs
             * @extends mstrmojo.Obj
             */
            init: function init(props) {            
                this._super(props);

                // If we have a "children" config, initialize our children.
                if (this.children) {
                    this.initChildren();
                }
                
                // If we are an orphan, init our bindings now (if any). Otherwise we have a parent,
                // and that parent is responsible for calling us later to init our bindings, after it
                // has finished constructing its children. 
                if (!this.parent){
                    this.initBindings();
                }
            },
            
            /**
             * <p>Extends the inherited method in order to call destroy on its child objects and its bindings before
             * destroying itself.</p>
             *
             * <p>This method destroys this object's children first before destroying this object's bindings.
             * Typically, children with bindings are bound to properties in their ancestors. Therefore, we wait
             * until after our children are destroyed to destroy our own bindings, thereby reducing the number of
             * binding events raised by our own destruction.</p>
             *
             * @param {Boolean} [skipCleanup] If true, this flag indicates that some parent/ancestor of this object
             * will handle some cleanup after this object is destroyed. Used as a performance optimization.
             */
            destroy: function dst(skipCleanup) {
                if (this.children) {
                    this.destroyChildren(true);
                }
                if (this.bindings) {
                    this.destroyBindings();
                }
                this._super(skipCleanup);
            }
        }
    );
    
})();
