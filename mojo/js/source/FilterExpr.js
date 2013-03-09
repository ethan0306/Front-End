(function(){

    mstrmojo.requiresCls(
                "mstrmojo.WidgetTree",
                "mstrmojo.expr", 
                "mstrmojo.AndOrNode",
                "mstrmojo.ConditionNode");
    
    var _E = mstrmojo.expr,
        _ET = _E.ET,
        _ET2SC = {};
    _ET2SC[_ET.ANDOR] = mstrmojo.AndOrNode;
    _ET2SC["*"] = mstrmojo.ConditionNode;
         
    /**
     * <p>Method to determine when a drop is valid into AND/OR nodes, and into the root of the tree itself.</p>
     * <p>Used by mstrmojo.dnd controller.</p>
     * @private
     */            
    function _allowDrop(ctxt) {
                var s = ctxt && ctxt.src,
                    d = s && s.data,
                    t = d && d.et;
                return (t in _E.ETs);
            }
    
    /**
     * <p>Filter expression tree display.</p>
     * @class
     */
    mstrmojo.FilterExpr = mstrmojo.declare(
        // superclass
        mstrmojo.WidgetTree,
        // mixins
        null,
        // instance members
        /** 
         * @lends mstrmojo.FilterExpr.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.FilterExpr",
            
            /**
             * @ignore
             */            
            allowDrop: _allowDrop,
            
            /**
             * @ignore
             */
            renderOnScroll: false,

            /**
             * @ignore
             */
            itemIdField: null,
            
            
            /**
             * @ignore
             */            
            itemFunction: function (item, idx, widget){
                var andor = (item.et === _ET.ANDOR),
                    t = widget.tree || widget,
                    cfg = {
                        data: item,
                        tree: t,
                        parent: widget,
                        itemFunction: andor ? widget.itemFunction : null,
                        draggable: andor ? t.draggable : false,
                        dropZone: andor ? t.dropZone : false,
                        allowDrop: andor && t.dropZone ? t.allowDrop : null,
                        allowCopy: andor? t.allowCopy : false,
                        editable: t.isEditable ? t.isEditable(item) : t.editable,
                        makeObservable: andor && widget.makeObservable, 
                        onclick: t.onnodeclick,
                        onadd: t.onnodeadd,
                        onremove: t.onnoderemove
                    },
                    Sc = _ET2SC[item.et] || _ET2SC["*"];
                return Sc && (new Sc(cfg));
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
             * Inserts a new condition item and adds it to this expression tree at the current selection point, if any;
             * if no nodes selected, appends condition at the root level. Also automatically opens the editor for
             * the new condition, if desired.
             * If no condition item is given, one is created.
             * @param {Object} [c] The data object representing a condition (e.g., a metric/form qualification).
             * @return {Object} An object with two properties: "widget" = the widget in whose items list the new condition
             * was added; and "index" = the index at which the condition was inserted in the items list.
             */
            newCondition: function nc(c){
                // Make new condition object if none given.
                c = c || {et: _ET.AQ};   // Use some default expression type rather than hard-code.
                
                // Determine where to insert it (either in the current selection's parent node, or here) and insert.
                var p = this.selectionParentNode || this,
                    idx;
                if (p !== this) {
                    // We have a current selection in a sub-node.
                    // Insert it there and record the index where the insertion occured.
                    idx = p.add([c]);
                } else {
                    // Either there is no current selection, or it is one of our items directly.
                    // So we'll handle this addition ourselves.
                    var where = this.addCondition([c], null, true);
                    idx = where.index;
                    p = where.widget;
                }

                // Return information about where and what was inserted.
                var ret = {widget: p, index: idx, data: c};
                
                // Customization hook.
                if (this.onNew) {
                    this.onNew(ret);
                }
                return ret;
           },    
            
            /**
             * A smarter alternative to the add method, which maintains at most one item -- either a condition node,
             * or a single AND/OR node to act as a parent for multiple conditions.
             * @param {Array} arr The array of node data items to be added.
             * @param {Integer} index The index at which to add them.
             * @return {Object} An object with two properties: "widget" = the widget whose "items" property the nodes
             * were added to (either this FilterExpr or a tree node sub-widget thereof); "index" = the index at which
             * the nodes were inserted in that widget's "items" property.
             * @ignore
             */
            addCondition: function addCond(arr, index){
                var its = this.items,
                    len = its && its.length,
                    alen = arr && arr.length;
                if (!alen) {
                    return null;
                }

                var w,
                    idx;
                if (len && its[0].et === _ET.ANDOR) {
                    // We have an existing AND/OR as our item, pass them to that item's widget.
                    // WARNING: this assumes the itemWidget has already been rendered; therefore we
                    // must have renderOnScroll set to false.
                    w = this.ctxtBuilder.itemWidgets[0];
                    idx = w.add(arr, null);
                } else if (!len && (alen === 1)) {
                    // We have no existing items.
                    // We're just adding one, so add the item as usual.
                    w = this;
                    idx = 0;
                    this.add(arr, 0);
                } else {
                    // Either we are adding multiple items, or we have
                    // an existing condition already as our first item.  In either case, we need
                    // to group multiple items under a single AND/OR item.
                    if (len) {
                        // We have an existing condition item that needs to be moved.
                        var cond = its[0];
                        this.remove(cond);
                        arr.unshift(cond);
                    }
                    // Create & insert a new AND/OR node to parent these new items.
                    this.add([{et: _ET.ANDOR, fn: _E.FN.AND, nds: arr}], 0);    // TO DO: use some default fn rather than hard-code.
                    w = this.ctxtBuilder.itemWidgets[0];
                    idx = len ? 1: 0;
                }
                return {widget: w, index: idx};
            },
            
            ondrop: function(c) {
                if(this._super) {
                    this._super(c);
                }
                var its = this.items,
                    len = its && its.length,
                    ir = its.concat();
                if(len > 1){
                    this.set('items', null); 
                    this.add([{et: _ET.ANDOR, fn: _E.FN.AND, nds: ir}], 0); 
                }
            }             
        });
})();
