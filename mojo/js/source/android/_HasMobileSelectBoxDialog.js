(function () {
    
    mstrmojo.requiresCls("mstrmojo.MobileSelectBoxList",
                         "mstrmojo.array");
    
    /**
     * A mixin to add the ability to display a dialog containing a collection of {@link mstrmojo.MobileSelectBoxList} controls.
     * 
     * @class
     * @public
     */
    mstrmojo.android._HasMobileSelectBoxDialog = mstrmojo.provide(
            
        "mstrmojo.android._HasMobileSelectBoxDialog",
        
        /**
         * @lends mstrmojo.android._HasMobileSelectBoxDialog.prototype
         */
        {
            _mixinName: 'mstrmojo.android._HasMobileSelectBoxDialog',
            
            showMobileSelectBoxDialog: function showMobileSelectBoxDialog(items, fnSelect, dialogConfig) {

                // Create dialog child (default to mobile select box list).
                var dialogChild = dialogConfig.children = [{
                    scriptClass: 'mstrmojo.MobileSelectBoxList',
                    isElastic: true,
                    items: items,
                    selectListChange: function (idx, item) {
                        // Call select function.
                        if (!fnSelect.call(this, idx, item)) {
                            // Close the dialog.
                            mstrApp.closeDialog();
                        }                            
                    }
                }][0];
                
                // Is there only one item?
                if (items.length === 1) {
                    var item = items[0];
                    items = item.items;
                    
                    // Override title with item name.
                    dialogConfig.title = item.n;
                    
                    // Change dialogChild for single item.
                    dialogChild.scriptClass = 'mstrmojo.ui.MobileCheckList';
                    dialogChild.items = items;
                    dialogChild.multiSelect = false;
                    dialogChild.selectedIndex = mstrmojo.array.find(items, 'on', true);
                    
                    // Add selection handler.
                    dialogChild.postselectionChange = function (evt) {
                        this.selectListChange(0, items[evt.added[0]]);
                    };
                }
                
                // Show dialog.
                mstrApp.showDialog(dialogConfig);   
            }
        }
    );
}());