(function(){
    
    mstrmojo.requiresCls("mstrmojo.MobileCalendar", "mstrmojo.android._HasPreviewButton");
    
    mstrmojo.android.inputControls.CalendarDIC = mstrmojo.declare(
        mstrmojo.MobileCalendar,
        [mstrmojo._IsInputControl, mstrmojo.android._HasPreviewButton],
        {
            scriptClass: "mstrmojo.android.inputControls.CalendarDIC",
            
            //Will be invoked when the popup's dimension has been changed.
            onpopupResized: function onpopupResized(e) {
                var dn = this.domNode;
                if(dn) {
                    dn.style.zoom = parseInt((95 * e.width / dn.offsetWidth), 10) + '%';
                }
            },
        
            //for preview buttons
            toggleImagesCss: 'mstrmojo-Android-DatePreview',
            
            renderPreview: function renderPreview() {
                //call _HasPreviewButton minxin function to render the button
                this.renderPreviewButton(this.openerNode, this.value);
            }
        }
    );
}());