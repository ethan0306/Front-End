(function() {
    mstrmojo.requiresCls("mstrmojo.android.inputControls.CheckBoxDIC");
    
    mstrmojo.android.inputControls.MarkRowDIC = mstrmojo.declare(
            
            mstrmojo.android.inputControls.CheckBoxDIC,
            
            null,
            
            {
                scriptClass: 'mstrmojo.android.inputControls.MarkRowDIC',
                
                oncheckedChange: function() {
                    if(this.markAll) {
                        var wm = this.group && this.group.widgetsMap, i;
                        for (i in wm){
                            if(wm.hasOwnProperty(i)) {
                                if  (wm[i].checked !== this.checked) {
                                    wm[i].set('checked', this.checked);
                                }
                            }
                        }
                    } else {
                        this._super();
                    }
                },
                
                postBuildRendering: function(){
                    this._super();
                    
                    // Need to adjust its height so that it could be shown properly
                    this.domNode.style.height = '30px';
                }
            }
    );
}());