(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Widget",
        "mstrmojo._Formattable");
    
    /**
     * <p>The widget for a single MicroStrategy Report Services rounded rectangle control.  NOTE: This is only 
     * for use in IE as all other browsers natively support round rectangles using {@link mstrmojo.DocRectangle}.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
     * @borrows mstrmojo._Formattable#getFormats as #getFormats
     * @borrows mstrmojo._Formattable#formatGradient as #formatGradient
     */
    mstrmojo.DocRoundRectangle = mstrmojo.declare(
        mstrmojo.Widget,
        
        [mstrmojo._Formattable],

        /**
         * @lends mstrmojo.DocRoundRectangle.prototype
         */
        {
            scriptClass: "mstrmojo.DocRoundRectangle",
            
            markupString: '<div id="{@id}" class="mstrmojo-DocRoundRectangle" title="{@tooltip}" style="{@domNodeCssText}">' +
                            '<div class="mstrmojo-DocRoundRectangle-l1" style="{@tCornersCssText}{@tCornersCssGradText}"></div>' +
                            '<div class="mstrmojo-DocRoundRectangle-l2" style="{@tCornersCssText}{@tCornersCssGradText}"></div>' +
                            '<div class="mstrmojo-DocRoundRectangle-l3" style="{@tCornersCssText}{@tCornersCssGradText}"></div>' +
                            '<div style="{@rectNodeCssText}{@rectNodeGradCssText}"></div>' +
                            '<div class="mstrmojo-DocRoundRectangle-l3" style="{@bCornersCssText}{@bCornersCssGradText}"></div>' +
                            '<div class="mstrmojo-DocRoundRectangle-l2" style="{@bCornersCssText}{@bCornersCssGradText}"></div>' +
                            '<div class="mstrmojo-DocRoundRectangle-l1" style="{@bCornersCssText}{@bCornersCssGradText}"></div>' +
                        '</div>', 
                        
            markupSlots: {
            	rectNode: function(){ return this.domNode.childNodes[3]; }
            },
                    
            formatHandlers: {
                domNode: [ 'top', 'left', 'width', 'z-index', 'fx' ],
                rectNode: [ 'height', 'background-color' ],
                tCorners: [ 'background-color' ],
                bCorners: [ 'background-color' ]
            },
            
            update: function update(node) {
                // if there is a threshold, kill the format
                if(this.thresholdId || node.data.tid) {
                    delete this.fmts;
                }
                
                this.thresholdId = node.data.tid;
            },
            
            /**
             * Adjusts the height of the rounded rectangle to account for the 8 extra pixels in the corners.
             * 
             * @ignore
             */
            preBuildRendering: function preBuildRendering() {
            	var rtn = this._super();

            	var f = this.getFormats(),
            		topOnly = !!this.defn.topc,							// Indicates only the top corners are rounded.
            		delta = (topOnly) ? 4 : 8,							// Delta is 8 if showing all four rounded corners, or 4 if only top two are rounded.
            		$2 = '(\\d*px)',									// Any numbers followed by 'px'
            		h = Math.max(parseInt(f.height, 10) - delta, 0);	// Reduce specified height by delta to account for corners.
            	
            	// Is the height of the rectangle 100%?
            	if (f.height === '100%') {
            		// Exactly '100%'.
            		$2 = '(100%)';
            		// Use the height of the parent, minus delta to account for corners.
            		h = this.parent.height() - delta;
            	}
            	
            	// Replace the current height with the new one.
            	this.rectNodeCssText = this.rectNodeCssText.replace(new RegExp('(.*height:)' + $2 + '(.*)'), '$1' + h + 'px$3');
            	
            	// Is it top corners only?
            	if (topOnly) {
            		// Then hide the bottom corners.
            		this.bCornersCssText = 'display:none;';
            	}
            	
            	return rtn;
            },
            
            /**
             * Builds the browser specific css for gradients for the corner elements.
             * 
             * @ignore
             */
            formatGradient: function formatGradient(gp, flt) {
            	// Get the browser specific gradient info.
            	var gd = mstrmojo.css.buildGradient(gp.t, gp.sc, gp.ec);
            	
            	// Does this browser support gradients?
            	if (!gd) {
            		// No, so return.
            		return;
            	}
            	
            	var gdt = gd.n + ':' + gd.v + ';',
            		bc = 'background-color:';
            	
            	// Add the gradient value to the rectNode css text.
            	this.rectNodeGradCssText = gdt;
            	
            	// Is it a vertical gradient?
            	if (gp.t === 0) {
            		// Set the background colors of the top and bottom corners to the start and end color.
            		this.tCornersCssGradText = bc + gp.sc + ';';
            		this.bCornersCssGradText = bc + gp.ec + ';';
            	} else {
            		// Apply the same horizontal gradient to both the top and bottom corners.
            		this.tCornersCssGradText = this.bCornersCssGradText = gdt;
            	}
            }
            
        }
    );
    
})();