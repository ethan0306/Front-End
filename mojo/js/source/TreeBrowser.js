(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.css",
            "mstrmojo.array",
            "mstrmojo.WidgetTree",
            "mstrmojo.TreeBrowserNode",
            "mstrmojo.TreeBrowserSelector"
    );
    
    mstrmojo.TreeBrowserEnum = {};
    var treeEnum = mstrmojo.TreeBrowserEnum;
    treeEnum.BRANCH_POLICY_TOGGLE = 'toggle';
    treeEnum.BRANCH_POLICY_SELECT = 'select';    
    
    /**
     * TreeBrowser is a widget allowing to browse into the tree hierarchy of objects. 
     * Working with TreeBrowserNode, it supports on-demand content request and incremental fetch/rendering. It is noted that unlike 
     * its parent class, this class supports selections across different branches. It allows selections across different branches of the tree. 
     * The behavior can be reverted by setting selectionAcrossBranch to be false. You can turn off the checkBoxNode in TreeBrowserNode by setting
     * the noCheckBox to be true for this class. 
     */
    mstrmojo.TreeBrowser = mstrmojo.declare(
        // superclass
        mstrmojo.WidgetTree,
        // mixins
        null,
        {   
            scriptClass:'mstrmojo.TreeBrowser',
            
            cssClass:'mstrmojo-TreeBrowser',
  
            /**
             * The number of children retrieved in one incremental fetch block. 
             */
            blockCount: 30, 
            
            /**
             * Indicates whether to show checkbox before each tree node. 
             */
            noCheckBox: false,
            
            /**
             * Indicates whether allows selection across different branches.
             */
            selectionAcrossBranch: true,
            
            /**
             * Specifies the action when clicking on the branch text node, either as toggle the branch state(expand/collapse) or select the branch. 
             */
            branchClickPolicy: treeEnum.BRANCH_POLICY_TOGGLE,
            
            /**
             * An internal flag indicating whether the content of the tree is retrieved.
             */
            contentRetrieved: false, 
            
            
            listSelector: mstrmojo.TreeBrowserSelector, //We need to use ListSelector for non-toggleSelect behavior 
                                                        //(but not TreeNodeSelector, otherwise the branch node would not be selected).
            
            /**
             * Customization hook when a node is clicked.
             */
            handleNodeClicked: function(data){
                
            },

            /**
             * This method shall be overrode for each implementation to make a task call to retrieve the content of a tree node.
             * For example, for folder, this task is to retrieve object residing in that particular folder, while for user group, 
             * this task shall retrieve the members of this user group. See UserTreeSelector for an example of implementation.
             */
            getContentThroughTaskCall: function getContentThroughTaskCall(params, callbacks){

            }, 
            
            /**
             * This method decides whether a node is a branch node or a leaf node, based on the data. For example, we can decide that
             * if the data.tp equals 8 (see EnumDSSXMLObjectType), it is a branch node. Or we can decide it is a branch node if it is 
             * a user group (when data.isGroup == true).
             */
            isBranch: function isBranch(data){

            },
            
            
            /**
             * This method shall be overrode to provide a css class for the text node of the tree node. 
             */
            item2textCss: function item2textCss(data){
                return {
                    '-1': 'failed',
                    '-2': 'loading',
                    '-3': 'next',
                    '-4': 'prev'
                }[data.st];
            },
            
            failItemCreaterFunc: function(){
                return {n:'Loading Failed!',did:'-1',tp:'-1',st:'-1'};
            }, 
            
            loadingItemCreaterFunc: function(){
                return {
                    n:mstrmojo.desc(5674, "Loading..."),
                    did:'-2',
                    tp:'-2',
                    st:'-2'
                };                 
            }, 
            
            nextItemCreaterFunc: function(){
                return {
                    n: mstrmojo.desc(4507, 'Next ##  item(s)...').replace('##', this.blockCount),
                    did: '-3',
                    tp: '-3',
                    st: '-3'
                };                     
            },
            
            prevItemCreaterFunc: function(){
                return {
                    n: mstrmojo.desc(4508, 'Previous ##  item(s)...').replace('##', this.blockCount),
                    did: '-4',
                    tp: '-4',
                    st: '-4'
                };                     
            },
            
            updateTreeContent: function(w, res){
                w.contentRetrieved = true;
                var items = res[w.itemChildrenField],
                    tree = w.tree || w,
                    bc = res.bc,
                    sz = res.sz,
                    bb = res.bb;
                if(bc !== -1){
                    if(bb + bc < sz){//has next block
                        items.push(tree.nextItemCreaterFunc());
                    }
                    if((bb - bc) > -1){//has pre block
                        items.unshift(tree.prevItemCreaterFunc());
                    }
                }
                w.blockBegin = bb;
                tree.initializing = true;
                w.clearSelect(false);
                w.set('items', items);
                
                //update tree selections
                w.setSelectedItems(tree.getTotalSelections(), true);
                
                tree.initializing = false;
            },
            
            getContent: function(w, blockBegin){
                var isRoot = (w === this),
                    tree = this,
                    success = function(res){
                        if(isRoot){
                            mstrmojo.css.removeClass(tree.domNode, ["loading"]);   
                        }
                        tree.updateTreeContent(w, res);
                    },
                    failure = function(res){                      
                        w.set('items',[tree.failItemCreaterFunc()]); 
                    },
                    callbacks = {success: success, failure: failure};
                
                if(isRoot){
                    mstrmojo.css.addClass(tree.domNode, ["loading"]);
                }
                
                this.getContentThroughTaskCall({
                        isRoot: isRoot,
                        data: w.data,
                        blockBegin: isRoot ? 0 : (blockBegin || w.blockBegin),
                        blockCount: tree.blockCount
                    }, callbacks);
            },
            
            postBuildRendering: function postBuildRendering(){
                this._super();
                if(!this.contentRetrieved){
                    this.getContent(this);
                }
            },

            
            itemFunction: function ifn(item, idx, w){
                var tree = w.tree || w,
                    iw = new mstrmojo.TreeBrowserNode({
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
            
            /**
             * This method overrides its parent implementation to provide selections across different branches inside a tree.
             * It clear all selections of the tree.
             */
            clearTreeSelect: function clearTreeSelect(){ 
                if(!this.selectionAcrossBranch){
                    this._super();
                } else {
                    var sp = this._selectionParentNode,
                        len = sp && sp.length,
                        i;
                    
                    for(i = 0; i < len; i++){
                        sp[i].clearSelect();
                    }
                    this._selectionParentNode = null;
                    this._totalSelections = null;
                }
            },
            
            /**
             * This method overrides its parent implementation to provide selections across different branches inside a tree.
             * It is called to add/remove selection and its parent node. 
             */
            onnodechange: function onnodechange(evt){
                if(this.initializing) {
                    return;
                }
                
                if(!this.selectionAcrossBranch){
                    this._super(evt);
                } else {
                    this._totalSelections = this._totalSelections || [];
                    this._selectionParentNode = this._selectionParentNode || [];
                    
                    var ts = this._totalSelections,
                        sp = this._selectionParentNode,
                        added = evt.added,
                        removed = evt.removed,
                        ais = [],
                        ris = [],
                        node = evt.src,
                        i, j, len, lenj;
                    
                    //save the parent node
                    sp.push(node);
                    
                    //remove all shall be removed
                    for(i = 0, len = removed && removed.length;i<len;i++){
                        ris.push(node.items[removed[i]]);
                    }                
                    mstrmojo.array.removeItems(ts, 'did', ris);
                    
                    //add all newly added
                    for(j = 0, lenj = added && added.length;j<lenj;j++){
                        ais.push(node.items[added[j]]);
                    }
                    this._totalSelections = ts.concat(ais);
                }
            },
            
            /**
             * This method overrides its parent implementation to provide selections across different branches inside a tree.
             * It is called to return the selections of the tree.
             */
            getTotalSelections: function getTotalSelections(){
                if(this.selectionAcrossBranch){
                    return this._totalSelections || [];
                } else {
                    var sn = this.selectionParentNode;
                    return sn && sn.getSelectedItems();
                }
            }
   });
   
 
}());