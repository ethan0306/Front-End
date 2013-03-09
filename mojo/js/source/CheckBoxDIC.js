(function() {
    mstrmojo.requiresCls("mstrmojo.TristateCheckBox", "mstrmojo._IsInputControl");
    
    /** 
     * Inline only
     */
    mstrmojo.CheckBoxDIC = mstrmojo.declare(
        mstrmojo.TristateCheckBox,
        
        [mstrmojo._IsInputControl],
        
        {
            scriptClass: 'mstrmojo.CheckBoxDIC',
            
            cssText: 'width: 0; margin:0 auto; max-height: 18px; cursor: pointer;',
            
            onclick: function() {
                //if the status changed from unset to set, we immediately check the checkbox, to set the checked to be true 
                //because initial value was false, so oncheckedChange will get triggered.
                if (this.grayed) {
                    this.set('grayed', !this.grayed);
                    this.set('checked', true);
                } else {
                    this.set('checked', !this.checked);
                }
            },                        
            
            oncheckedChange: function(e) {
                this.set('value', this[this.checked ? 'onValue' : 'offValue']); 
            },
            
            preBuildRendering: function(){
                this._super();
                
                var vls = this.dic.vls;
                this.offValue = vls[0].v;
                this.onValue = vls[1].v;
                
                this.grayed = (this.onValue !== this.value) && (this.offValue !== this.value);
                this.checked = (this.onValue === this.value);
            },
            
            postBuildRendering: function(){
                this._super();
                
                this.domNode.style.height = this.openerStyle.ih + 'px';
            }
        }
    );
})();
