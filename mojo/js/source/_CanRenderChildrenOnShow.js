(function(){
    
    /**
     * <p>Enables Containers to render only the children whose "visible" property is true.</p>
     * 
     * <p>A child with "visible" false is not rendered until the child's
     * "visible" property changes back to true (if ever).  This rendering behavior for the container is
     * only enabled when the container's renderMode is set to "onshow"; otherwise, this mixin defaults to
     * the rendering behavior inherited from the container's class.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._CanRenderChildrenOnShow = mstrmojo.provide(
        "mstrmojo._CanRenderChildrenOnShow",
        /**
         * @lends mstrmojo._CanRenderChildrenOnShow#
         */
        {
            /**
             * <p>Cache of event listeners attached to hidden children.</p>
             *
             * <p>These listeners are called back if/when the child becomes visible, so that 
             * this mixin can trigger the child's render().</p>
             *
             * @private
             * @type Object
             */
            _subs_renderOnShow: null,
            
            /**
             * <p>Extends the inherited method in order to prevent children whose "visible" property is false from rendering.</p>
             *
             * <p>Any invisible child gets an event listener attached so that this Container can be notified of a change in the 
             * child's "visible" property later.</p>
             */
            childRenderCheck: function chRnCk(c) {
                if (this.renderMode !== "onshow") {
                    return this._super(c);
                } else if (c.visible) {
                    return this._super(c);
                } else {
                    // The child is hidden; don't render it, attach a listener and cache the subscription key. 
                    var sbs = this._subs_renderOnShow;
                    if (!sbs) {
                        sbs = {};
                        this._subs_renderOnShow = sbs;
                    }
                    // Only attach a listener if we haven't already done so.
                    if (!sbs[c.id]) {
                        sbs[c.id] = c.attachEventListener("visibleChange", this.id, "_on_child_visibleChange");
                    }
                    return false;       // Child is not ready to render.
                }
            },
            
            /**
             * <p>Triggers the rendering of a child that is newly visible.</p>
             *
             * <p>This handler responds to a change in the "visible" property in
             * any of this Container's child widgets by (possibly) telling the
             * child to render itself.  This handler is given as a callback only if this
             * Container's renderMode is "onshow".</p>
             *
             * @param {Object} evt The visibleChange event originating in a child of this Container.
             */
            _on_child_visibleChange: function chVisChg(evt) {
                if (this.hasRendered) {
                    var c = evt && evt.src;
                    if (c && this.childRenderCheck(c)) {
                        var sbs = this._subs_renderOnShow;
                        if (sbs) {
                            c.detachEventListener(sbs[c.id]);
                            delete sbs[c.id];
                        }
                        c.render();
                    }
                }
            }
        });
})();