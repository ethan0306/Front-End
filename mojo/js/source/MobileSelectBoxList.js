(function () {

    mstrmojo.requiresCls("mstrmojo.android.SimpleList",
                         "mstrmojo.array",
                         "mstrmojo.ui.MobileCheckList");
    
    /**
     * Displays a list of mobile style select boxes.
     * 
     * @class
     * @extends mstrmojo.android.SimpleList
     */
    mstrmojo.MobileSelectBoxList = mstrmojo.declare(
        mstrmojo.android.SimpleList,

        null,
        
        /**
         * @lends mstrmojo.MobileSelectBoxList.prototype
         */
        {
            scriptClass: 'mstrmojo.MobileSelectBoxList',
            
            selectionPolicy: 'reselect',
            
            getItemMarkup: function (item) {
                return '<div class="mstrmojo-SelectBoxList-item" idx="{@idx}">' + 
                           '<label><em>{@cnt}. {@n}: </em> {@v}</label>' + 
                       '</div>';
            },
            
            getItemProps: function getItemProps(item, idx) {
                var props = this._super(item, idx);
                
                // Add count and value.
                props.cnt = idx + 1;
                props.v = item.v;
                
                return props;
            },
            
            /**
             * Overridden to display element picker list when a select box is clicked.
             * 
             * @ignore
             */
            postselectionChange: function postselectionChange(evt) {
                var added = evt.added;
                if (!added) {
                    return;
                }
                
                // Get the selected item.
                var idx = added[0],
                    item = this.items[idx],
                    items = item.items,
                    id = this.id;
                
                mstrApp.showDialog({
                    title: item.n,
                    children: [{
                        scriptClass: 'mstrmojo.ui.MobileCheckList',
                        items: items,
                        multiSelect: false,
                        isElastic: true,
                        selectedIndex: mstrmojo.array.find(items, 'on', true),
                        postselectionChange: function (evt) {
                            // Close the dialog.
                            mstrApp.closeDialog();

                            // Call selection hook.
                            mstrmojo.all[id].selectListChange(idx, this.items[evt.added[0]]);
                        }
                    }]
                });
            },
            
            /**
             * Handler for when a selection has been made.
             * 
             * @param {Integer} idx The index of the select box list whose selection has changed.
             * @param {Object} item The newly selected item.
             */
            selectListChange: mstrmojo.emptyFn
        }
    );
    
}());