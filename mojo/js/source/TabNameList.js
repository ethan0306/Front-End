(function(){

    mstrmojo.requiresCls(
        "mstrmojo.array",
        "mstrmojo._BindTargetChildren",
        "mstrmojo.List"
    );

    /**
     * A TabNameList widget.
     * 
     * @class
     */
    mstrmojo.TabNameList = mstrmojo.declare(
        // superclass
        mstrmojo.List,
        
        // mixins,
        [mstrmojo._BindTargetChildren],
        
        /**
         * @lends mstrmojo.TabNameList.prototype
         */
        {
            scriptClass: "mstrmojo.TabNameList",
            
            /**
             * <p>A hashtable that define the names for properties in the target, which can be used to create name list.</p>
             * 
             * @type Object
             */
             targetProps: {
                names: 'items'
            },
             
             /***
              * Do Not overwrite this property in instance, it is inherited from mstrmojo.List, 
              * but should be created dynamically according to target.
              */
//             items: null,
             
             /**
              * Inherited from mstrmojo.List, If this is set to be false, the Name list will not dynamically render new added children in target.
              */
             makeObservable: true,
             
             /**
              * Notify StackContainer to show the selected.
              */
             postchange: function(){
                var sidx = this.selectedIndex;
                if(sidx != null && sidx != -1){
                    this.target && this.target.set('selected', this.target.children[sidx]);
                }
             },
                  
             /**
             * <p>Instantiates new list item for each model.</p> 
             * 
             * @param {mstrmojo.Model[]} models The models for the buttons, which is target's children.
             * @param {Integer} index The index at which to start adding the buttons.
              */
             addTabButtons: function(models, index) {
                 var tps = this.targetProps || {},
                     t = tps.childTitle || 'n',
                     id = this.itemIdField || 'v',
                     name = this.itemField || 'n',
                     itms = [],
                     cnt = (this.items)? this.items.length : 0;
                 
                 for (var i = 0, len = (models&&models.length)||0; i < len; i++, cnt++) {
                     var b = models[i],  
                         ttl = b[t];    
                     
                     if (ttl) {
                         // Create new item.
                         var itm = { target: b};
                         itm[name] = ttl;
                         itm[id] = cnt;
                         itms.push(itm);
                     }
                 }
                 
                 if (itms.length) {
                     this.add(itms, index);
                 }
             },
             
             /**
             * <p>Removes the list item that corresponds to a given target.</p>
             * 
             * @param {Object} tgt The target of the button to remove.
              */
             removeTabButton: function(tgt) {
                 var itms = mstrmojo.array.filter(this.items, function (itm) { return (itm.target === tgt); }, { max: 1 });
                 if (itms && itms[0]) {
                     this.remove(itms[0]);
                 }
             },
             
             /**
              * Clear all the list items
              */
             clearButtons: function(){
                 this.remove(this.items);
             }
         }
    );
    
})();