(function(){

    mstrmojo.requiresCls(
        "mstrmojo.TreeNode",
        "mstrmojo._IsExprNode",
        "mstrmojo.array",
        "mstrmojo.dom",
        "mstrmojo.css",
        "mstrmojo.expr");
        
    var _A = mstrmojo.array,
        _E = mstrmojo.expr,
        _D = mstrmojo.dom,
        _C = mstrmojo.css;
        
    /**
     * Helper function that builds an array of nodes to indent/outdent.
     * @param {mstrmojo.Widget} me The AndOrNode whose child nodes are to be moved.
     * @param {Array} [idxs] Array of indices of child nodes to be moved; if null, the AndOrNode's selected indices are assumed.
     * @private
     */
    function _ndsToMove(me, idxs){
        var d = me.data,
            nds = d && d.nds;
        if (!nds) {
            return null;
        }
        if (idxs) {
            // Indices given, sort them in ascending order.
            idxs.sort(_A.numSorter);
        } else {
            // No indices given, so use selected indices.
            idxs = me.sortSelectedIndices();
        }
        if (!idxs.length) {
            return null;
        }
        // Build an array of nodes to indent.
        return {idxs: idxs, nds: _A.get(nds, idxs)};
    }
    
    function _noNot(me){
        var ct = me.ctxtBuilder,
            iws = ct && ct.itemWidgets,
            w = iws && iws[0],
            d = w && w.data;
        if(d && d.not && (iws.length > 1)){
            d.not = false;
            w.paint();
        }
    }
    
    /**
     * <p>An AND or OR node in a filter expression.</p>
     *
     * <p>Displays a set of condition/branch-qual nodes grouped into a single bracket.  The bracket is hidden by
     * CSS rules if this AndOrNode is not inside another AndOrNode.  The "AND/OR" + "NOT" text before each of the child nodes
     * is not rendered by this widget iself; rather it is rendered by the widgets of the child nodes.</p>
     *
     * @class
     * @extends mstrmojo.TreeNode     
     */
    mstrmojo.AndOrNode = mstrmojo.declare(
        // superclass
        mstrmojo.TreeNode,
        // mixins
        [mstrmojo._IsExprNode],
        /**
         * @lends mstrmojo.AndOrNode.prototype
         */
        {   // instance members
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.AndOrNode",
            
            /**
             * <p>Data representation of a branch qual (AND/OR) node in an expression tree.<p>
             * <p>The data object should expose the following properties:</p>
             * <dl>
             *   <dt>fn</dt>
             *   <dd>The id of the function (19=AND, 20=OR).</dd>
             *   <dt>n</dt>
             *   <dd>The display name of the function.</dd>
             *   <dt>ch</dt>
             *   <dd>Array of child nodes. Each child node is either another branch qual node or a condition node.</dd>
             * </dl>
             * @type Object
             */
            data: null,

            /**
             * @ignore
             */
            markupString: '<div id="{@id}" class="mstrmojo-andor mstrmojo-AndOrNode {@cssClass}"  style="position:relative;{@cssText}" mstrAttach:mousedown>'
                                + '<div class="mstrmojo-onhoverparent mstrmojo-andor-prefix" mstrAttach:click>'
                                    + '<span class="mstrmojo-textset mstrmojo-andor-prefix-text"></span>'
                                    + '<span class="mstrmojo-onhover-in mstrmojo-andor-tools {@cssClass}">'
                                        + '<img class="mstrmojo-outdent disable" src="../images/1ptrans.gif" title="Ungroup Conditions" />'                                    
                                        + '<img class="mstrmojo-outdent" src="../images/1ptrans.gif" title="Ungroup Conditions" '
                                            + 'onclick="mstrmojo.all[\'{@id}\'].out()" />'
                                        + '<img class="mstrmojo-indent disable" src="../images/1ptrans.gif" title="Group Conditions" />'                                              
                                        + '<img class="mstrmojo-indent" src="../images/1ptrans.gif" title="Group Conditions" '
                                            + 'onclick="mstrmojo.all[\'{@id}\'].ind()" />'   
                                    + '</span>'                                       
                                + '</div>'
                                + '<div class="mstrmojo-andor-top"></div>'
                                + '<div class="mstrmojo-andor-contentsWrapper" style="position:relative">'  /* ensures dropCue and itemsContainerNode share the same offsetParent */
                                    + '<div class="mstrmojo-andor-contents" style="position:relative;{@itemsContainerCssText}">{@itemsHtml}</div>'
                                    + '<div class="mstrmojo-ListBase2-dropCue mstrmojo-AndOrNode-dropCue {@cssClass}"><div class="mstrmojo-ListBase2-dropCue-inner mstrmojo-AndOrNode-dropCue-inner"></div></div>'
                                + '</div>'
                                + '<div class="mstrmojo-andor-bottom"></div>'
                        + '</div>',

            /**
             * @ignore
             */
            markupSlots: {
                prefixNode: function(){return this.domNode.firstChild.firstChild;},
                itemsContainerPrefix: function(){return this.domNode.childNodes[1];},
                itemsContainerNode: function(){return this.domNode.childNodes[2].firstChild;},
                dropCueNode: function(){return this.domNode.childNodes[2].lastChild;},
                itemsContainerSuffix: function(){return this.domNode.lastChild;},
                scrollboxNode: function(){return this.domNode;}
            },

            /**
             * @ignore
             */
            markupMethods: {
                onitemCntChange: function(){
                    _C.toggleClass(this.itemsContainerNode, ['multi'], this.itemCnt > 2);
                },
                oneditableChange: function(){
                    _C.toggleClass(this.prefixNode, ['editable'], this.editable);
                },                
                ondataChange: function(){
                    // We don't display our AND/OR function as text; that is handled by our child widgets.
                    // However, we do display the text of AND/OR function of our parent branch qual (if any).
                    // We generate the text here, so that calling paint() can update that text if it were
                    // to change.
                    this.prefixNode.innerHTML = this.andOrTxt();
                },
                // TO DO: devise a mechanism for inheriting markupMethods from superclass
                ondropCuePosChange: mstrmojo.TreeNode.prototype.markupMethods.ondropCuePosChange
            },
            
            /**
             * @ignore
             */
            multiSelect: true,

            /**
             * @ignore
             */
            itemIdField: null,
            
            /**
             * Extends the inherited method in order to initialize the "text" and "items" properties.
             * @ignore
             */
            init: function(props) {
                this._super(props);
                var d = this.data;
                if (d) {
                    delete this.data;
                    this._set_data(null, d);
                }
            },

            /**
             * Number of item/child conditions in this AndOrNode. 
             */
            itemCnt: 0, 
            
            /**
             * Override to keep track of itemCnt. 
             */
            postBuildRendering: function() {
                var ret; 
                this.set('itemCnt', this.items.length);
                
                if (this._super) {
                    ret = this._super();
                }
                
                _noNot(this);
                
                return ret;
            }, 
            
            /**
             * Override to keep track of itemCnt. 
             */            
            preadd: function pa(evt){
                if (this._super) {
                    this._super(evt);
                }
                this.set('itemCnt', this.items.length);
                _noNot(this);                
            },
            
            /**
             * Override to keep track of itemCnt. 
             */            
            preremove: function prm(evt){            
                if (this._super) {
                    this._super(evt);
                }
                this.set('itemCnt', this.items.length);
                _noNot(this);                
            },      
            
            /**
             * Customer setter that sets "items" property from the "data" property.
             * @ignore
             */
            _set_data: function(n, v){
                var vWas = this.data,
                    chg = (vWas !== v);
                if (chg) {
                    this.data = v;
                    // Ensure that our data has an "nds" array so that this widget has a place
                    // to add new items should the end-user choose to do so.  Otherwise, this widget
                    // could create a new items array for itself, but it would be disconnected from this.data.nds.
                    if (v && !v.nds) {
                        v.nds = [];
                    }
                    // Update the "items" to point to the data's child nodes.
                    this.set("items", v && v.nds);
                }
                return chg;
            },
            
            /**
             * Extends the inherited method in order to construct display html for condition.
             * @ignore
             */
            getDragData: function(ctxt){
                var d = this._super(ctxt);
                if (d && !d.html) {
                    var k = d.et && _E.ET2TGT[d.et];
                    // If data is empty, use an empty string to indicate a blank, rather
                    // than null, which means "no change" to the dnd controller.
                    d.html = k ? d[k] && d[k].n || "" : d.n || "";
                }
                return d;
            },
            
            /**
             * Extends the inherited method in order to consolidate nodes.  Specifically, if and AND/OR node has only one
             * child, it should be removed and "replaced" by its single child.
             * @param {Object} items The data items to be removed from the "items" array.
             * @param {Boolean} [dontConsolidate] If true, this node will not be consolidated after the removal.
             * @ignore
             */
            remove: function rmv(items, dontConsolidate) {
                var idx = this._super(items);
                if (idx >-1) {
                    var skip = (dontConsolidate === true) || 
                                ((dontConsolidate == null) && this.suppressConsolidation);
                    if (!skip) {
                        this.consolidate(false);
                    }
                }
                return idx;
            },

            /**
             * Overwrites the inherited method in order to suppress consolidation of this node until after
             * the move is completed. Otherwise the node might get deleted if we temporarily remove all but 1
             * of its child nodes while doing the move.
             * @ignore
             */
            move: function(arr, idx){
                this.suppressConsolidation = true;
                var ret;
                if (this._super) {
                    ret = this._super(arr, idx);
                }
                this.suppressConsolidation = false;
                return ret;
            },
            
            /**
             * Checks if this node has 2 or more child nodes. If not, this node is removed, and its single child node (if any)
             * is moved up into this node's former place.
             */            
            consolidate: function con(){
                // TO DO: implement a "recursive" (type = Boolean) param.
                var p = this.parent;
                if (!p || !p.remove) {
                    return;
                }
                var its = this.items,
                    len = its && its.length;
                if (len < 2) {
                    // Cache a handle to my only child (if any) and my current index.
                    var it = len ? its[0] : null,
                        idx = this.childIndex();
                    // Add my child (if any) to my parent at my index (meaning, before me).
                    // We do this before removing myself, because when I remove myself nodes
                    // may consolidate, which could cause my parent to be removed, thereby preventing
                    // us from re-inserting my child afterwards.
                    if (it) {
                        p.add([it], idx);
                    }
                    // Remove myself.
                    p.remove(this.data);
                }
            },
            
            /**
             * Indents the child nodes at the given indices.
             * @param {Array} [idxs] An array of 1 or more child node indices to be indented. If null,
             * assumes all selected indices should be indented.
             * @param {Object} [cfg] Optional config settings for the indentation operation.
             * @param {Integer} [cfg.fn] The id of the branch qual function (AND/OR) to be applied as
             * @param {Boolean} [cfg.not] The id of the branch qual function (AND/OR) to be applied as
             * the new parent of the indented nodes.  If missing, the function is set to the opposite of
             * this AndOrNode's current function. 
             */
            indent: function ind(idxs, cfg){
                // Build an array of nodes to indent.
                var toIn = _ndsToMove(this, idxs);
                if (!toIn) {
                    return;
                }
                // Remove those nodes from this parent but don't consolidate yet.
                this.remove(toIn.idxs, true);
                // Create a new branch qual node to parent the nodes to be indented.
                var bq = {et: _E.ET.ANDOR, nds: toIn.nds};                
                // Determine which function (AND/OR) to use for the new branch qual node.
                var fn = cfg && cfg.fn;
                if (!fn) {
                    fn = this.data && this.data.fn === _E.FN.AND ? 
                            _E.FN.OR : _E.FN.AND;
                }
                bq.fn = fn;
                // Add the new branch qual where the first removal occurred.
                this.add([bq], toIn.idxs[0]);
                // Now consolidate this node (but not its descendants).
                this.consolidate(false);
            },
            
            /**
             * Outdents the child nodes at the given indices.
             * @param {Array} [idxs] An array of 1 or more child node indices to be outdented. If null,
             * assumes all selected indices should be outdented.
             */
            outdent: function oud(idxs){
                // If our parent is not a branch qual, abort.
                var p = this.parent,
                    pd = p && p.data;
                if (!pd || pd.et !== _E.ET.ANDOR) {
                    return;
                }
                // Build an array of nodes to outdent.
                var toOut = _ndsToMove(this, idxs);
                if (!toOut) {
                    return;
                }
                // Remove those nodes from this node but don't consolidate yet.
                this.remove(toOut.idxs, true);
                // Add those nodes to our parent immediately before this node.
                p.add(toOut.nds, this.childIndex());
                // Consolidate this node (but not its descendants).
                this.consolidate(false);
            },
            
            /**
             * Edits the branch qual function that preceeds a given child node of this branch qual.
             * @param {mstrmojo.Widget} c A child widget.
             * @param {Integer} fn The branch qual function (19=AND, 20=OR) to be applied before the given child.
             * @param {Boolean} not The new "NOT" value to be applied before the given child.
             */
            edit: function edt(c, fn, not){
                if (!c) {
                    return;
                }
                var d = this.data,
                    fnWas = d && d.fn,
                    cd = c.data,
                    notWas = cd && cd.not;
                if (!cd) {
                    cd = {};
                    c.data = cd;
                }
                
                cd.not = !!not;
                
                if (fnWas !== fn){
                    // Our current function doesn't match the new function to be applied.
                    // We need to indent if we have more than 2 children.
                    var nds = d.nds;
                    if (nds && nds.length > 2){
                        // Indent the condition and its previous sibling under a new branch qual node.
                        // Also update the condition's not before indenting it (updating after will then
                        // require an additional repaint, which we'd rather skip for efficiency).
                        var idx = c.childIndex();
                        if (idx > 0) {
                            this.indent([idx-1, idx], {fn: fn});
                        }
                    } else {
                        // The condition has only 0 or 1 sibling, so we don't indent, we just change this
                        // branch qual's function.
                        d.fn = fn;
                        // Now we must ask all the children to repaint because they render the "AND"/"OR" text
                        // corresponding to our function.
                        var ct = this.ctxtBuilder,
                            iws = ct && ct.itemWidgets;
                        for (var i=0, len=(iws && iws.length)||0; i<len; i++){
                            var w = iws[i];
                            if (w) {
                                w.paint();
                            }
                        }
                    }
                } else {
                    // The AND/OR function didnt change, just the NOT, so repaint the condition without doing any indentation.
                    c.paint();
                }
            },

            /**                        
             * Extends the inherited method in order to record the "part" property of the event, which
             * lets event listeners know which part of this widget's DOM was targeted by the click; either
             * "andor" (if the "AND"/"OR" text was clicked) or elsewhere (null).
             */
            preclick: function pc(evt){
                var p = null,
                    t = _D.eventTarget(evt.hWin, evt.e);
                if (t === this.prefixNode) {
                    // Clicking on the branch qual div but not the text doesn't count.
                } else if (_D.contains(this.prefixNode, t, true)) {
                    // Clicking on the branch qual text counts.
                    p = 'andor';
                }
                evt.part = p;
            }
        });
})();
