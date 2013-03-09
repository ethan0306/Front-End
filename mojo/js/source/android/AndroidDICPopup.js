(function(){
    mstrmojo.requiresCls("mstrmojo.android.Dialog", "mstrmojo.Button");
    
    mstrmojo.android.AndroidDICPopup = mstrmojo.declare(
            mstrmojo.android.Dialog,
            
            null,
            
            {
                scriptClass: 'mstrmojo.AndroidDICPopup',

                cssClass: 'mstrmojo-AndroidDICPopup',

                autoClose: false,
                
                fadeOnClose: true,
                
                init: function init(props) {
                    this._super(props);
                    
                    this.addChildren([this.widget]);
                },
                
                close: function close(){
                    // Unrender it so that it could be re-rendered while opened in the popup again. 
                    // Input controls rely this process to update itself.
                    if (this.widget.hasRendered){
                        this.widget.unrender();
                    }
                    // remove the input control widget from the children collection
                    this.removeChildren(this.widget);
                    
                    this._super();
                },
                
                resizeDialog: function() {
                    this._super();
                    
                    // If the popup is anchored (which means we are in a tablet), let the popup auto adjust its width.
                    if (this.anchor){
                        this.set('width', 'auto');
                    }
                },
                
                onpopupResized: function onpopupResized(e) {
                    if(this.widget.onpopupResized) {
                        this.widget.onpopupResized(e);
                    }
                },
                
                onkeyup: function onkeyup(evt) {
                    var hWin = evt.hWin,
                        e = evt.e || hWin.event;
                    //on enter key
                    if(this.widget.applyOnEnter && e.keyCode === 13) {
                        // Call the on blur method.
                        this.onApply();
                    } else if(e.keyCode === 27) {//on escape key   
                        this.onCancel();
                    }               
                },   
                              
                onApply: function() {
                    return this.widget.applyChanges();
                },
                
                onCancel: function() {
                    this.widget.cancelChanges();
                },
                
                enableApply: mstrmojo.emptyFn
            }
    );
}());