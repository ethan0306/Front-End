(function() {
    mstrmojo.requiresCls("mstrmojo.css", "mstrmojo.CheckBoxDIC");
    
    var $C = mstrmojo.css, $D = mstrmojo.dom;
    
    mstrmojo.MarkRowDIC = mstrmojo.declare(
            
            mstrmojo.CheckBoxDIC,
            
            null,
            
            {
                scriptClass: 'mstrmojo.MarkRowDIC',
                
                oncheckedChange: function() {
                    if(this.markAll) {
                        var wm = this.group && this.group.widgetsMap;
                        for (var i in wm){
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
                
                postBuildRendering: function() {
                    if (this._super){
                        this._super();
                    }
                    
                    var p = this.openerNode;
                    
                    if (!this.markAll){
                        $D.attachEvent(this.domNode, 'mouseover', function(evt){
                            $C.addClass(p.parentNode, 'markSelection');
                        });
                        $D.attachEvent(this.domNode, 'mouseout', function(evt){
                            $C.removeClass(p.parentNode, 'markSelection');
                        });
                    }
                }
            }
    )
})();
        