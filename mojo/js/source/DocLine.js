(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Widget",
        "mstrmojo._Formattable");

    /**
     * <p>The widget for a single MicroStrategy Report Services line control.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
     * @borrows mstrmojo._Formattable#getFormats as #getFormats
     */
    mstrmojo.DocLine = mstrmojo.declare(
        mstrmojo.Widget,
        
        [mstrmojo._Formattable],

        /**
         * @lends mstrmojo.DocLine.prototype
         */
        {
            scriptClass: "mstrmojo.DocLine",

            markupString: '<div id="{@id}" class="mstrmojo-DocLine" title="{@tooltip}" style="{@domNodeCssText}"></div>', 
            
            formatHandlers: {
                domNode: [ 'RW', 'border-top', 'border-left', 'fx' ]
            },
            
            update: function update(node) {
                // if there is a threshold, kill the format
                if(this.thresholdId || node.data.tid) {
                    delete this.fmts;
                }
                
                this.thresholdId = node.data.tid;

                if (this._super) {
                    this._super(node);
                }
            },
            
            getFormats : function getFormats(){
                var fmts = this._super();
                if(fmts && parseInt(fmts.height, 10) === 0) { // 487725 only set the height if it equals 0
                    fmts.height = "1px";//481296; when height is 0 phone does not render.
                }
                return fmts;
            }
        }
    );
    
})();