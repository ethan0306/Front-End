(function() {
    mstrmojo.requiresCls("mstrmojo.ToggleDIC", "mstrmojo._TouchGestures");
    
    mstrmojo.android.inputControls.ToggleDIC = mstrmojo.declare(
        
        mstrmojo.ToggleDIC,
        
        [mstrmojo._TouchGestures],
        
        {                  
            scriptClass: 'mstrmojo.android.inputControls.ToggleDIC',
            
            useAnimation: false,
            
            touchTap: function(){
                this.onclick();
            },
            
            onclick: function(){
                this._super();
                this.applyChanges();
            },
            
            //override to force change applied upon each touch tap
            onblur: mstrmojo.emptyFn
        }
    );
}());