(function () {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo._LoadsScript",
                         "mstrmojo.Binding",
                         "mstrmojo._HasBindings",
                         "mstrmojo._HasMarkup",
                         "mstrmojo._HasTooltip");

    /**
     * <p>Base UI widget class.</p>
     *
     * <p>A Widget is an enhanced Obj with the ability to:
     * <ul>
     * <li>load additional javascript methods at run-time,</li>
     * <li>use "bindings" to set its property values dynamically, and</li>
     * <li>render markup.</li>
     * </ul>
     * </p>
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.Widget = mstrmojo.declare(
        // superclass
        mstrmojo.Obj,

        // mixins
        [mstrmojo._LoadsScript, mstrmojo._HasBindings, mstrmojo._HasMarkup, mstrmojo._HasTooltip],

        /**
         * @lends mstrmojo.Widget.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.Widget",

            /**
             * Handle to the root DOM node of this widget's HTML, if rendered.
             * @type HTMLElement
             */
            domNode: null,

            /**
             * <p>Indicates whether this widget has been rendered.</p>
             * @type Boolean
             */
            hasRendered: false,

            /**
             * Specifies whether or not this widget's DOM node should be visible.
             * @type Boolean
             */
            visible: true,

            /**
             * Specifies whether or not this widget responds to events originating within its DOM.
             * @type Boolean
             */
            enabled: true,
            /**
             * <p>The tooltip for this widget.</p>
             *
             * @type String
             */
            tooltip: '',

            /**
             * Optional CSS class for the domNode. Used for customization.
             * @type String
             */
            cssClass: "",

            /**
             * Optional text to appear in the domNode "style" attribute. Used for customization.
             * @type String
             */
            cssText: "",

            /**
             * The display value to use when this widget is visible.
             *
             * @type String
             * @default block
             */
            cssDisplay: 'block',

            /**
             * <p>Extends the inherited method in order to do the following after initializing itself:
             * <ol>
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

                // If we are an orphan, init our bindings now (if any). Otherwise we have a parent,
                // and that parent is responsible for calling us later to init our bindings, after it
                // has finished constructing its children; exception: if our parent has already
                // init'd its bindings, we can do so now.
                // Note: even if we don't have a "bindings" property, we might have references to other
                // widgets (such as list items) which do have bindings, so we should still call initBindings.
                var p = this.parent;
                if (!p || p.hasInitBindings) {
                    this.initBindings();
                }
            },

            /**
             * <p>Extends the inherited method in order to unrender the widget and destroy its bindings before destroying the widget.</p>
             *
             * <p>Bindings are destroyed after the widget in unrendered in order to minimize DOM updates during the destruction of the bindings.</p>
             *
             * @param {Boolean} [skipCleanup] If true, this flag indicates that some parent/ancestor of this object
             * will handle some cleanup after this object is destroyed. Used as a performance optimization.
             */
            destroy: function dst(skipCleanup) {
                if (this.hasRendered) {
                    this.unrender(skipCleanup);
                }
                if (this.bindings) {
                    this.destroyBindings();
                }
                this._super();
            },

            /**
             * When this method is called it means that the widget is not being destroyed but it's data is no longer valid.
             *
             */
            invalidate: mstrmojo.emptyFn
        }
    );

}());
