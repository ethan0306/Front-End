(function () {
    mstrmojo.requiresCls("mstrmojo.registry",
                         "mstrmojo.array",
                         "mstrmojo.publisher");

    var _R = mstrmojo.registry,
        _A = mstrmojo.array,
        _P = mstrmojo.publisher;

    /**
     * <p>Pre-processing for a new child. Converts a given JSON object into a script class instance,
     * and sets its parent.</p>
     *
     * @param {Object} p The parent to which a child is about to be added.
     * @param {Object} c The child which is about to be added.
     *
     * @private
     */
    function _preAdd(p, c) {
        if (c) {
            c.parent = p;
            return _R.ref(c);
        }
        return null;
    }

    /**
     * <p>Post processing for a new child. Sets an alias reference on the parent to the child.</p>
     *
     * @param {Object} p The parent to which a child has been added.
     * @param {Object} c The child which has been added.
     *
     * @private
     */
    function _postAdd(p, c) {
        if (c && c.alias != null) { // if alias is not null AND not undefined
            p[c.alias] = c;
        }
    }

    /**
     * <p>Post processing for a newly removed child. Clears the alias reference on the parent and
     * the parent reference on the child.</p>
     *
     * @param {Object} p The parent to which a child has been added.
     * @param {Object} c The child which has been added.
     *
     * @private
     */
    function _postRmv(p, c) {
        var a = c.alias;
        if (c.parent === p) {
            delete c.parent;
        }
        if ((a != null) && (p[a] === c)) {  // if alias is not null AND not undefined
            delete p[a];
        }
    }

    /**
     * <p>Converts an array of child references to a new array of child objects.</p>
     *
     * <p>Each array member that is a child reference will be replaced by the evaluation of that reference; the evaluation
     * is done via the mstrmojo.registry.ref method. If the evaluation results in null, the array member is removed.
     * Each array member that is already a child object will remain intact.</p>
     *
     * <p>Each array member will have its parent set, and the parent will have alias references set to the children
     * (for each child that specifies an alias).</p>
     *
     * @param {Object} p The parent to which children will be added.
     * @param {Object[]} refs An array of either child references or child objects.
     * @returns {Object[]} An array of child objects, if successful; otherwise, an empty array or null.
     * @private
     */
    function makeCh(p, refs) {
        var len = refs && refs.length,
            ch,
            i;

        if (len) {
            ch = [];
            for (i = 0; i < len; i++) {
                var c = _preAdd(p, refs[i]);
                if (!c) {
                    continue;
                }
                ch.push(c);
                _postAdd(p, c);
            }
        }
        return ch;
    }

    /**
     * <p>A mixin that equips an observable object with methods for managing an array of children.</p>
     *
     * <p> The children list is maintained in a "children" property (type: Array of Objects). Additions and removals
     * of children in the list raise events that can be handled by this or other objects.</p>
     *
     * @class
     * @public
     */
    mstrmojo._HasChildren = mstrmojo.provide(

        "mstrmojo._HasChildren",

        /**
         * @lends mstrmojo._HasChildren#
         */
        {
            /**
             * @ignore
             */
            _meta_usesSuper: false,

            /**
             * Array of child objects contained by this object.
             *
             * @type Object[]
             */
            //children: null,

            /**
             * <p>Optional handler called after initialization of children.</p>
             *
             * <p>This handler is supported as a customization hook during the initialization process.
             * If specified, the handler will be called after the instance's initial children have been created.
             * If the instance has no initial children, the handler is not called.</p>
             *
             * @type Function
             */
            //postCreateChildren: null,

            /**
             * <p>Constructs child objects from this object's "children" property value.</p>
             * <p>This method is intended to be used during initialization and therefore operates silently;
             * meaning it does not raise "addChild" events for the initial set of children.</p>
             */
            initChildren: function initChildren() {
                var C = "children",
                    c = this[C];

                if (!c) {
                    return;
                }

                // Important: delete this[C] won't work if this[C] is defined on the prototype. Must use this[C] = null!
                this[C] = null;
                this._set_children(C, c, true);

                // Hook for customizations.
                if (this.postCreateChildren) {
                    this.postCreateChildren();
                }
            },

            /**
             * <p>Custom setter for the "children" property value.</p>
             *
             * <p>This method will add a given array of children to this object's
             * "children" property. Any children previously in the "children" property
             * are removed first.</p>
             *
             * @param {String} [n="children"] The property whose value is being set.
             * @param {Object[]} [v] An array of either child objects or references to child objects. If
             * references are specified, they are resolved to actual child objects using the mstrmojo.registry.ref method.
             * @param {Boolean} [silent] If true, suppresses raising of event.
             * @returns {Boolean} false, in order to avoid raising a "childrenChange" event when called from mstrmojo.Obj's "set" method.
             * Instead, calling this method should raise "removeChild" and/or "addChild" events (unless suppressed by the "silent" argument).
             */
            _set_children: function setCh(n, v, silent) {
                var ch = this.children;
                if (v !== ch) {
                    if (ch) {
                        // Call removeChildren with null to clear all children; it doesn't accept arrays.
                        this.removeChildren(null, silent);
                    }
                    this.addChildren(v, 0, silent);
                }
                return false;
            },

            /**
             * <p>Destroys the children of this object, if any.</p>
             *
             * <p>This method calls the destroy method of any objects in the "this.children" array, and removes the objects as children of
             * this parent object.  This is done in reverse order, in case any destroy call causes a child to be removed from this.children.
             * It is also done silently, meaning that no "removeChild" events are raised.</p>
             *
             * <p>This method can be called either separately or from this object's own "destroy" method.  When called from this object's own
             * method, it should be called with a true argument.  This allows the method to pass a flag into the children's "destroy" calls,
             * letting them know whether or not the cleanup is being coordinated by a parent/ancestor object.  The flag is used
             * as a performance optimization for a cascading destruction.</p>
             *
             * @param {Boolean} [meDestroying] This param should be set to true when this method is called from this object's
             * own "destory" method.  If true, this method skips removing the children's "parent" handle from the children,
             * removing the "alias" handle to child from this parent object, and skips clearing the children array.</p>
             */
            destroyChildren: function dstCh(meDestroying) {
                var ch = this.children,
                    len = (ch && ch.length) || 0,
                    i;
                if (len) {
                    for (i = len - 1; i > -1; i--) {
                        var c = ch[i];
                        if (c && c.destroy) {
                            c.destroy(meDestroying);
                            if (!meDestroying) {
                                _postRmv(this, c);
                            }
                        }
                    }
                    if (!meDestroying) {
                        ch.length = 0;
                    }
                }
            },

            invalidateChildren: function invalidateChildren() {
                mstrmojo.array.forEach(this.children, function (child) {
                    child.invalidate();
                });
            },

            invalidate: function invalidate() {
                this.invalidateChildren();
            },

            /**
             * <p>Adds a given child or array of children to this object's "children" array. Notifies event
             * listeners by raising an "addChild" event.</p>
             *
             * <p>Each "child" will have a "parent" property whose value is a handle to this object.
             * Additionally, for each child with an "alias" property, a handle to that child will be
             * stored in a property of this object; the property's name will be the child's "alias" value.</p>
             *
             * <p>
             * @param {Object|Object[]} c A child or array of children to be added.
             * @param {Integer} [idx] Index at which the given child(ren) should be inserted. If missing, they are appended.
             * @param {Boolean} [silent] If true, suppresses raising of event.
             * @returns {Object|Object[]} The child or array of children newly added (possibly empty or null).
             */
            addChildren: function addCh(c, idx, silent) {
                if (!c) {
                    return c;
                }
                // Convert the given children references to an array of proper children.
                var isArr = c.constructor === Array,
                    arr = makeCh(this, isArr ? c : [c]);

                if (arr && arr.length) {
                    // Insert the new kids into our "children" property.
                    var ch = this.children || [];
                    if (idx == null) {  // if idx is null OR undefined
                        idx = ch.length;
                    }
                    this.children = _A.insert(ch, idx, arr);

                    // Raise an event, only if someone is listening for it (including this object itself).
                    if (!silent && (this.onaddChild || _P.hasSubs(this.id, "addChild"))) {
                        this.raiseEvent({
                            name: "addChild",
                            value: arr,
                            index: idx
                        });
                    }
                }
                return isArr ? arr : (arr && arr[0]);
            },

            /**
             * <p>Removes a given child or all children from this object's "children" array. Notifies event
             * listeners by raising an "removeChild" event.</p>
             *
             * <p>Each removed child's parent property is cleared.  Additionally, if a child has an "alias" property,
             * this object's alias handle to that child will be cleared.</p>
             *
             * @param {Object} [c] The child to be removed. If missing, all children are removed.
             * @param {Boolean} [silent] If true, suppresses raising of event.
             * @returns {Integer} The index at which the child was removed, if successful; -1 otherwise.
             */
            removeChildren: function rmCh(c, silent) {
                var ch = this.children,
                    c2r = c ? [c] : (this.children || []).concat(),
                    len = c2r.length,
                    idx = -1,
                    i;

                if (len) {
                    for (i = len - 1; i > -1; i--) {
                        _postRmv(this, c2r[i]);
                    }

                    if (c) {
                        idx = _A.removeItem(ch, c);
                    } else if (ch) {
                        ch.length = 0;
                        idx = 0;
                    }

                    // Raise an event, only if someone is listening for it (including this object itself).
                    if (!silent && (this.onremoveChild || _P.hasSubs(this.id, "removeChild"))) {
                        this.raiseEvent({
                            name: "removeChild",
                            value: c2r,
                            index: idx
                        });
                    }
                }
                return idx;
            }
        }
    );
}());