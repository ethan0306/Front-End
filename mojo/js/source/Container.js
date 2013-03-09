(function(){

    mstrmojo.requiresCls(
        "mstrmojo.publisher",
        "mstrmojo.Widget",
        "mstrmojo._HasChildren",
        "mstrmojo._ShowsStatus");
    
    var _P = mstrmojo.publisher;
    
    /**
     * <p>Base widget container class.</p>
     * 
     * <p>Container is a widget that contains other "child" widgets. Typically used to arrange other widgets
     * visually in a GUI.</p>
     *
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.Container = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins
        [mstrmojo._HasChildren, mstrmojo._ShowsStatus],
        
        /** 
         * @lends mstrmojo.Container.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.Container",

            /**
             * <p>The default slot name under which children should be placed.</p>
             *
             * <p>Typically each child has a "slot" (String) property which indicates which "slot node" that child's DOM should
             * be appended to. If the chid's "slot" property is undefined, we assume this default instead.</p>
             */
            defaultChildSlot: "containerNode",
            
            /**
             * <p>Base widget container class.</p>
             *
             * <p>Overwrites the inherited constructor {@link mstrmojo.Widget#init} in order to initialize child widgets (if any)
             * before initializing this object's bindings.</p>
             *
             * @constructs
             * @param {Object} [props] Hash of property values to be applied to this instance.
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
                // Note: If we have no bindings, our children still might, so dont skip initBindings call.
                var p = this.parent;
                if (!p || p.hasInitBindings){
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
             * <p>This method passes a flag along to its children's "destroy" call which lets the children know
             * that they can skip the DOM cleanup, because it will be handled by this container.</p>
             */
            destroy: function dst(skipCleanup) {
                if (this.children) {
                    this.destroyChildren(true);
                }
                if (this.bindings) {
                    this.destroyBindings();
                }
                this._super(skipCleanup);
            },
            
            /**
             * <p>Extends the inherited method to unrender all children before unrendering this container.</p>
             *
             * <p>This container calls the children's "unrender" before performing its own unrender, because
             * the children might assume that their domNode is still in the document when their unrender is called.</p>
             *
             * <p>This method also passes a flag along to its children's "unrender" call which lets the children know
             * that they can skip the DOM cleanup, because it will be handled by a container. This is intended as
             * a performance optimization, so that the children's DOM can be removed from the document in a single batch operation.</p>
             *             
             * @param {Boolean} ignoreDom If true we don't need to clear the DOM (meaning it'll be handled by a parent/ancestor).
             */
            unrender: function unrn(ignoreDom) {
                var c = this.children,
                    len = (c && c.length) || 0;
                for (var i=len-1; i > -1; i--) {
                    c[i].unrender(true);
                }
                this._super(ignoreDom);
                
            },
                        
            /**
             * 
             * <p>Extends the rendering cycle to trigger the rendering of child widgets, if any.</p>
             *
             * <p>This method triggers the rendering of this container's children after the container's domNode
             * has been rendered but BEFORE the container's "hasRendered" property is set to true.</p>
             */
            postBuildRendering: function pstBR() {
                var ret = this._super ? this._super() : undefined;
                if (ret !== false) {
                    this.renderChildren();
                    // Override the return value to show that we rendered.
                    ret = true;
                }
                return ret;
            },            

            /**
             * <p>Asks all children who are ready for rendering to render now.</p>
             *
             * <p>Container's implementation of renderChildren renders
             * all the children immediately who pass the "childRenderCheck" filter.
             * Subclasses of Container can enhance/overwrite this behavior to support alternative rendering modes.
             */
            renderChildren: function rnCh() {
                var ch = this.children;
                for (var i=0,len=ch&&ch.length||0; i<len; i++) {
                    var c = ch[i];
                    if (this.childRenderCheck(c)) {
                        c.render(null);
                    }
                }
            },

            /**
             * <p>Returns true if a given child is ready to be rendered.</p>
             *
             * <p>A child is considered ready if:</p>
             * <ol>
             * <li>the child has not rendered yet, and</li>
             * <li>the child's "slot" property corresponds to a non-null slot in this Container.</li>
             * </ol>
             *
             * <p>The slot check was important because a container may choose to
             * deliberately omit a slot so that certain children won't render.</p>
             *
             * @param {mstrmojo.Widget} child The child widget to be checked.
             * @returns {Boolean} true if the child is ready to be rendered; false otherwise.
             */
            childRenderCheck: function chRnCk(c) {
                if (c && !c.hasRendered) {
                    var s = c.slot || this.defaultChildSlot;
                    return !!this[s];
                }
                return false;
            },

            /**
             * <p>Extends the inherited method to trigger the rendering of newly added children.</p>
             */
            addChildren: function addCh(c, idx, silent) {
                var arr = this._super(c, idx, silent);
                if (arr) {
                    this.childRenderOnAddCheck(arr);
                }
                return arr;
            },
            
            /**
             * <p>Extends the inherited method to remove the children's DOM.</p>
             */
            removeChildren: function rmCh(c, silent) {
                var c2r = c ? [c] : (this.children || []),
                    len = c2r.length;

                // Remove domNode(s) from slot(s).
                for (var i=len-1; i>-1; i--) {
                    var w = c2r[i],
                        dn = w && w.domNode;
                    if (dn) {
                        var s = this[(w.slot || this.defaultChildSlot)];
                        if (dn.parentNode === s) {
                            s.removeChild(dn);
                        }
                    }
                }
                
                // Call the inherited method to remove children from this.children.
                return this._super(c, silent);
            },

            /**
             * <p>Checks if newly added child should be rendered.</p>
             
             * <p>Called when children are newly added.  Checks if each child should be rendered, and if so,
             * calls the child's render() method. If the child has already been rendered, attempts to include
             * its rendering within this container's rendering.</p>
             *
             * <p>If this container has not been rendered, this method does nothing.</p>
             *
             * @param {mstrmojo.Widget[]} ch The newly added child widgets to be checked.
             */
            childRenderOnAddCheck: function childRndrOnAddChk(ch) {
                if (this.hasRendered && ch) {
                    for (var i=0, len=ch.length; i<len; i++) {
                        var c = ch[i];
                        if (this.childRenderCheck(c)) {
                            c.render();
                        } else if (c && c.hasRendered) {
                            this.onchildRenderingChange(c);
                        }
                    }
                }
            },
            
            /**
             * <p>If true, the domNodes of the Container's children will be inserted into their
             * corresponding slot nodes in the same order in which the children are listed in the "children" array
             * property.</p>
             *
             * <p>Otherwise, the domNodes are appended to their corresponding slot nodes in whatever
             * order they happen to be rendered; by default, that order is the same sequence as the "children" array,
             * but in general, other subclasses can modify that order if desired (for example, an "on-demand" rendering mixin).</p>
             *
             * @type Boolean
             */
            preserveChildDomOrder: true,

            /**
             * <p>Inserts a given child widget's DOM into a slot of this container. Once all children are
             * rendered, raises a "childrenRendered" event.</p>
             *             
             * <p>The target slot name is determined by the child's "slot" property (if missing,
             * this container's "defaultChildSlot" property value is assumed).</p>
             *
             * <p>If the targeted slot is not defined in the current rendering, the child widget's domNode is 
             * simply removed from DOM until future use.
             * If the targeted slot is defined, the child's domNode will be appended to
             * the slot node, unless this Container's "preserveChildDomOrder" property is
             * true; if so, the child's domNode will be inserted at the child index corresponding
             * to the child's order in this container's "children" array.</p>
             * 
             * @param {mstrmojo.Widget} child The child whose rendering is to be inserted.
             */
            onchildRenderingChange: function onChldChngRndr(child) {
                var d = child && child.domNode;
                if (!d) {
                    return;
                }
                
                // Compare the domNode's parentNode to the slot node it belongs under.
                var sdef = this.defaultChildSlot,
                    s = child.slot || sdef,
                    n = this[s],
                    ch = this.children;
                
                if (!n) {
                    // No slot found. Remove child domNode from DOM.
                    if (d.parentNode) {
                        d.parentNode.removeChild(d);
                    }
                } else {
                    // We have a slot. Is the domNode already inserted into the slotNode?
                    // TO DO: Do we really need this parentNode check? What happens if you try to call node.parentNode.appendChild(node)?
                    if (d.parentNode == n) {
                        return;
                    }
                    // Insert the domNode; compute the insertion index.
                    if (!this.preserveChildDomOrder) {
                        // Append the domNode, insertion index is irrelevant.
                        n.appendChild(d);
                    } else {
                        // Compute an insertion position. Find the domNode of the last preceeding child in the same slot (if any).
                        var sib;
                        for (var i = ch.length - 1; i >= 0; i--) {
                            var c = ch[i];
                            
                            // Is this the rendered child?
                            if (c === child) {
                                // We've found the child so the last sib value is it's sib.
                                break;
                            }
                            
                            // Is this child in the same slot as the rendered child?
                            if (s === (c.slot || sdef)) {
                                // Does it have a domNode?
                                var cNode = c.domNode;
                                
                                // Does the parent of the domNode match the slotNode?
                                if (cNode && cNode.parentNode == n) {
                                    // This is the node of the child that should appear after the rendered child.
                                    sib = cNode;
                                }
                            }
                        }
                        
                        // Do we have a child that should appear after the rendered child?
                        if (sib) {
                            // Yes, then insert the child before that node.
                            n.insertBefore(d, sib);
                        } else {
                            // No, then append the child to the slot node.
                            n.appendChild(d);
                        }
                    }
                }
                
                // Raise a "childrenRendered" if all children are now rendered.
                if (_P.hasSubs(this.id, "childrenRendered")) {
                    // Iterate my children 
                    for (var k = 0, klen = ch.length; k < klen; k++) {
                        // Does the domNode NOT exist?  We check for the existence of the domNode rather than the isRendered flag because at this point, the 
                        // isRendered flag has not been set yet.
                        if (!ch[k].domNode) {
                            // No, then no reason to raise event.
                            return;
                        }
                    }
                    
                    // All children are rendered so raise the event.
                    this.raiseEvent({
                        name: "childrenRendered"
                    });
                }
            }
        }
    );
    
})();