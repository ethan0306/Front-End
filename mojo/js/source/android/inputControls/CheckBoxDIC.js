(function(){
    
    mstrmojo.requiresCls("mstrmojo.CheckBoxDIC", "mstrmojo._TouchGestures");
    
    mstrmojo.android.inputControls.CheckBoxDIC = mstrmojo.declare(
        mstrmojo.CheckBoxDIC,
        [mstrmojo._TouchGestures],
        {
            scriptClass: "mstrmojo.android.inputControls.CheckBoxDIC",
            cssClass: 'Android-tristate',
            cssText: 'width: 30px; max-height: 30px; cursor: pointer;',
            cssDisplay: 'inline-block',
            touchTap: function touchTap() {
                this.onclick();
            }
        }
    );
}());