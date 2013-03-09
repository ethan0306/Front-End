(function(){

    mstrmojo.requiresCls(
            "mstrmojo.WidgetList",
            "mstrmojo.WidgetTreeBuilder", 
            "mstrmojo.TreeNodeSelector");
    
    var _loaded = false;
    
    /**
     * <p>A tree of widgets. The tree may have any number of "root" nodes.</p>
     *
     * <p>Since WidgetTree is a WidgetList, it supports an "items" array, and each item in "items" serves essentially as a "root node".
     * Thus WidgetTree can display multiple root nodes.</p>
     *
     * <p>As with WidgetList, WidgetTree renders each item in its "items" property as a new widget.  
     * This item widget can be configured by either the WidgetTree's "itemConfig" or "itemFunction" properties. By default, 
     * each item is rendered as an instance of mstrmojo.TreeNode.</p>
     *
     * @class
     */
    mstrmojo.WidgetTree = mstrmojo.declare(
        // superclass
        mstrmojo.WidgetList,
        // mixins
        null,
        /**
         * @lends mstrmojo.WidgetTree.prototype
         */
        {   // instance members

            /** 
             * @ignore
             */            
            scriptClass: "mstrmojo.WidgetTree",

            /**
             * @ignore
             */
            listBuilder: mstrmojo.WidgetTreeBuilder,
            
            /**
             * @ignore
             */
            listSelector: mstrmojo.TreeNodeSelector,
            
            /**
             * @ignore
             */
            renderOnScroll: true,

            /**
             * <p>Optional name of the field whose value is a unique identifier for each item.</p>
             *
             * <p>Used to generate search for an item.</p>
             *
             * @type String|Number
             */
            itemIdField: "dssid",

            /**
             * <p>Optional name of the field whose value is to be displayed for each item.</p>
             *
             * <p>Used to generate item markup if neither "itemMarkup" nor "itemMarkupFunction" properties are defined.
             * If either of those two properties is specified, itemField is ignored.</p>
             *
             * @type String|Number
             */
            itemDisplayField: "n",

            /**
             * <p>Optional name of the field whose value is used to display an icon for each item.</p>
             *
             * @type String|Number
             */
            itemIconField: "tp",
            
            /**
             * <p>Optional name of the field whose value holds the list of subitems for each item.</p>
             *
             * @type String|Number
             */
            itemChildrenField: "items",
            
            /**
             * <p>The default function for generating a widget for a node of this tree.</p>
             *
             * <p>This function generates an instance of mstrmojo.TreeNode and sets its properties
             * ("text", "textCssClass", and "items") according to the WidgetTree's corresponding properties 
             * ("itemDisplayField", "itemIconField", and "itemChildrenField" respectively).  It also
             * assigns the TreeNode a handle to the item ("data") and a handle to the WidgetTree itself ("tree").
             * It then sets the TreeNode's "itemFunction" to this WidgetTree's "itemFunction", thereby setting
             * up recursive logic for generating the TreeNode's subwidgets.</p>
             *
             * @param {Object} item The item for which to generate a widget.
             * @param {Integer} idx The index of the item, relative to its siblings.
             * @param {mstrmojo.Widget} The parent widget of the widget to be generated.
             * @returns {mstrmojo.Widget} The newly generated widget.
             * @ignore
             */
            itemFunction: function ifn(item, idx, w){
                // First time only: ensure the TreeNode class code is loaded.
                if (!_loaded) {
                    mstrmojo.requiresCls("mstrmojo.TreeNode");
                    _loaded = true;
                }
                var tree = w.tree || w,
                    iw = new mstrmojo.TreeNode({
                        data: item,
                        state: 0,
                        parent: w,
                        tree: tree,
                        multiSelect: w.multiSelect,
                        text: item[w.itemDisplayField],
                        textCssClass: tree.item2textCss(item),
                        items: item[w.itemChildrenField],
                        itemIdField: w.itemIdField,
                        itemDisplayField: w.itemDisplayField,
                        itemIconField: w.itemIconField,
                        itemChildrenField: w.itemChildrenField,
                        itemFunction: w.itemFunction,
                        listSelector: w.listSelector
                });
                return iw;
            },
            
            item2textCss: function item2textCss(item){
                return item[this.itemIconField];
            },
            
            /**
             * <p>Reference to the parent of the currently selected node(s), if any. If no selections are currently made, points
             * to either the last selection's parent; if no previous selections, point to this same tree by default.</p>
             *
             * <p>The indices of the currently selected nodes will therefore be stored in selectionParentNode.selectedIndices.</p>
             *
             * @type mstrmojo.Widget
             */
            selectionParentNode: null,
             
            /**
             * <p>Extends the inherited method in order to initialize the "selectionParentNode" property.</p>
             * @ignore
             */
            init: function init(props) {
                this._super(props);
                this.selectionParentNode = this;
                this.tree = this;
            },
            
            clearTreeSelect: function clearTreeSelect(){ 
                (this.selectionParentNode || this).clearSelect();
            },
            
            /**
             * <p>Extends the inherited method in order to update the "selectionParentNode" property.</p>
             * @ignore
             */
            prechange: function pchg(evt) {
                var ret = this._super(evt);
                
                this.onnodechange(evt);  //this.selectionParentNode = this;
  
                return ret;
            },
            
            /**
             * <p>Responds to a selection change in tree nodes.  Responsible for coordinating selections
             * across nodes.</p>
             * @ignore
             */
            onnodechange: function ndchg(evt) {
                if (!evt) {
                    return;
                }
                var H = mstrmojo.hash,
                    nodeWas = this.selectionParentNode,
                    node = evt.src;
                if (node === nodeWas) {
                    // Our current selections come from the same parent node.
                    // If the selectionParentNode no longer has any selections,
                    // reset selectionParentNode back to the default (this tree).
                    if (H.isEmpty(node.selectedIndices)){
                        node = this;
                        this.selectionParentNode = this;
                    }
                    this.raiseEvent({
                        name: "selectionChange",
                        parentNode: node,
                        parentNodeWas: nodeWas,
                        added: evt.added,
                        removed: evt.removed
                    });
                } else if (evt.added && evt.added.length) {
                    // Some other node got new selections added.
                    var rmv = [];
                    if (!H.isEmpty(nodeWas.selectedIndices)) {
                        // Our current selections are not empty and need to be cleared.
                        rmv = mstrmojo.hash.keyarray(nodeWas.selectedIndices, true);
                        nodeWas.clearSelect();
                    }
                    this.selectionParentNode = node;
                    this.raiseEvent({
                        name: "selectionChange",
                        parentNode: node,
                        parentNodeWas: nodeWas,
                        added: evt.added,
                        removed: rmv
                    });
                } else {
                    // Some other node got selections removed (possibly by our own clearSelect call
                    // above.  Ignore it.
                }
            }
        });
})();
