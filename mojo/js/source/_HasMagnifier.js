(function() {
    
    mstrmojo.requiresCls("mstrmojo.Magnifier");
    
    var SELECTED_CELL_CSS = 'xtab-selected-cell';

    /**
     * _HasMagnifier mixin
     */
    mstrmojo._HasMagnifier = {
            
        scriptClass: 'mstrmojo._HasMagnifier',
        
        magnifiedNode: null,
        
        magnifier: null,

        displayMagnifier: function dspMgnf(content, anchor, anchorPos) {
            if (content){
                if (this.magnifiedNode){
                    mstrmojo.css.removeClass(this.magnifiedNode, SELECTED_CELL_CSS);
                }
                
                mstrmojo.css.addClass(anchor, SELECTED_CELL_CSS);
                
                this.magnifiedNode = anchor;
                
                if (!this.magnifier){
                    var me = this;
                    this.magnifier = mstrApp.showPopup({
                        scriptClass: 'mstrmojo.Magnifier', 
                        title: mstrmojo.desc(8994), //'Info Viewer'
                        onClose: function(){
                            mstrmojo.css.removeClass(this.anchor, SELECTED_CELL_CSS);
                            me.magnifier = null;
                            me.magnifiedNode = null;
                        },
                        anchorPosition: anchorPos
                    }, anchor);
                }
                
                this.magnifier.updateContent(content, anchor, anchorPos);
            }
        },
        
        moveMagnifier: function moveMgnf(anchorPos){
            this.magnifier.anchorPosition = anchorPos;
            this.magnifier.positionDialog();
        }
    };
})();