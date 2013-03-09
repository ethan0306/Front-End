(function() {
    mstrmojo.requiresCls("mstrmojo.ui.MobileCheckList", "mstrmojo._IsInputControl", "mstrmojo.android._HasPreviewButton");
    
    mstrmojo.android.inputControls.ListDIC = mstrmojo.declare(
        mstrmojo.ui.MobileCheckList,
        
        [mstrmojo._IsInputControl, mstrmojo.android._HasPreviewButton],
        
        {
            scriptClass: 'mstrmojo.android.inputControls.ListDIC',
            
            multiSelect: false,
            
            isElastic: true,
            
            postselectionChange: function (evt) {
                var idx = evt.added[0], value = this.items[idx].v;
                this.set('value', value);
            },
        
            init: function init(props){
                this._super(props);
                
                this._items = this.getItems();
            },
            
            preBuildRendering: function preBuildRendering(){
                this._super();
                
                var items = this._items,
                    value = this.value,
                    ust = this.dic.ust || '',
                    idx = mstrmojo.array.find(items, 'v', value);
                
                if (idx === -1){
                    items = [{n:ust, v:value}].concat(items);
                    idx = 0;
                }
            
                this.items = items;
                this.set('selectedIndex', idx);
            },
            
            //for preview buttons
            toggleImagesCss: 'mstrmojo-Android-ListPreview',
            
            /**
             * Render the preview button for the list dic
             */
            renderPreview: function renderPreview() {
                //call _HasPreviewButton minxin function to render the button
                var idx = mstrmojo.array.find(this._items, 'v', this.value),
                    label = (idx >= 0) ? this._items[idx].n : (this.dic.ust || '');

                this.renderPreviewButton(this.openerNode, label);
            }
        }
    );
}());