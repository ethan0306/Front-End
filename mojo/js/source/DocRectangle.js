(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Widget",
        "mstrmojo._Formattable");
    
    /**
     * <p>The widget for a single MicroStrategy Report Services rectangle control.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
     * @borrows mstrmojo._Formattable#getFormats as #getFormats
     */
    mstrmojo.DocRectangle = mstrmojo.declare(
        mstrmojo.Widget,
        
        [mstrmojo._Formattable],

        /**
         * @lends mstrmojo.DocRectangle.prototype
         */
        {
            scriptClass: "mstrmojo.DocRectangle",

            markupString: '<div id="{@id}" class="mstrmojo-DocRectangle" title="{@tooltip}" style="{@domNodeCssText}"></div>', 

            markupMethods: {
                onheightChange: function(){
                    if (this.height) {
                        this.domNode.style.height = this.height + 'px';
                    }
                },
                onwidthChange: function(){
                    if (this.width) {
                        this.domNode.style.width = this.width + 'px';
                    }
                }
            },
            
            formatHandlers: {
                domNode: ['RW', 'B', 'background-color', 'fx']
            },
            
            /**
             * Adds css for rounded rectangles (if required and supported).
             * 
             * @ignore
             */
            preBuildRendering: function preBuildRendering() {
            	var rtn = this._super(),
            		defn = this.defn;
            	
            	// Is this actually a rounded rectangle?
            	if (defn.r) {
            		// Add the css for border-radius.
               		this.domNodeCssText += mstrmojo.css.buildRoundCorners(defn.r, defn.topc);
            	}
            	
            	return rtn;
            },
            
            /**
             * <P>Compute rectangle width/height when it is set at 100% with border in order to display border property</p>
             * @ignore
             */
            postBuildRendering: function() {
                var rtn = this._super();
                   
                //#392459 - rectangles 100% width/height with border:
                var fmts = this.fmts;
                if (fmts) {
                    var b = fmts.border || fmts['border-width'],
                        bw = b && (parseInt(b, 10) / 72 * this.model.dpi ); //convert pt to px
                        
                    if (bw) {
                        if (fmts.height == '100%') {
                            this.set('height', this.domNode.clientHeight - 2 * bw);
                        }
                        if (fmts.width == '100%') {
                            this.set('width', this.domNode.clientWidth - 2 * bw);
                        }
                    }
                }
                return rtn;
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
            }
        }
    );
    
})();