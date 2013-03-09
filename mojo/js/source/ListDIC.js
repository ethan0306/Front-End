(function() {
    mstrmojo.requiresCls("mstrmojo.DropDownList", "mstrmojo._IsInputControl");
    
    mstrmojo.ListDIC = mstrmojo.declare(
        mstrmojo.DropDownList,
        
        [mstrmojo._IsInputControl],
        
        {
            scriptClass: 'mstrmojo.ListDIC',
            
            cssDisplay: 'block',
            
            init: function(props){
                this._super(props);
                
                this._items = this.getItems();
            },
            
            getDisplayValue: function getDisplayValue() {
                return this.idx >= 0 ? this._items[this.idx].n : this.dv;
            },
            
            preBuildRendering: function(){
                
                var items = this._items,
                    value = this.value,
                    ust = this.dic.ust || '',
                    idx = mstrmojo.array.find(items, 'v', value);
                
                if (idx == -1){
                    // not found the value, add a unset option
                    items = [{n:ust, v:value}].concat(items);
                    // select the unset option
                    idx = 0;
                    this.unset = true;
                }
                
                this.options = items;
                
                this.idx = idx;
                
                this._super();
            },
            
            postBuildRendering: function(){
                this._super();
                
                if (this.showByDefault){
                    var sns = this.selectNode.style;
                    sns.height = (this.openerStyle.ih || 0) + 'px'; 
                    sns.width = (this.openerStyle.iw || 0) + 'px';
                }
            }
        }
    );
})();