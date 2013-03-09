(function() {
    mstrmojo.requiresCls("mstrmojo.css", "mstrmojo.ImageToggle", "mstrmojo._IsInputControl");
    
    //inline only
    mstrmojo.ToggleDIC = mstrmojo.declare(
        mstrmojo.ImageToggle,
        
        [mstrmojo._IsInputControl],
        
        {                  
            scriptClass: 'mstrmojo.ToggleDIC',
            
            init: function(props){
                this._super(props);
                
                this.unset = this.dic.ust;
            },
            
            onvalueChange: function(){
                //override to do nothing so that changes will be applied when the toggle loses focus 
            },
            
            onblur: function(e){
                var evt = e.e || e,
                    dom = this.domNode,
                    ofst = mstrmojo.boxmodel.offset(dom, document.body);
                if(evt.clientX > ofst.left && evt.clientX < ofst.left + dom.offsetWidth && evt.clientY > ofst.top && evt.clientY < ofst.top + dom.offsetHeight) {
                    this.domNode.focus();    
                } else {
                    this.applyChanges();
                }
            },
            
            postBuildRendering: function(){
                if (this._super){
                    this._super();
                }
                
                if (this.showByDefault){
                    var ops = this.openerStyle;
                    
                    this.width = ops.iw;
                    this.height = ops.ih;
                    this.set('imageList', this.dic.vls);
                }
            }
        }
    );
}());