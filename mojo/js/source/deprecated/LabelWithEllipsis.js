/**
 * The Label will show ellipsis when the text is longer than the label area could accommodate.
 * 
 * This widget will use the 'width', 'height', 'max-width' and 'max-height' in the style to determine when to show the ellipsis.
 * 
 * @todo support tooltip????
 */
(function() {
    
    mstrmojo.requiresCls("mstrmojo.Label",
                         "mstrmojo._SupportsEllipsisText",
                         "mstrmojo.css");
    
    /**
     * A label with ellipsis in the middle if the text is too long to fit within the label.
     *  
     * @class
     */
    mstrmojo.LabelWithEllipsis = mstrmojo.declare(
        // Superclass.
        mstrmojo.Label, 
        
        // Mixins.
        [ mstrmojo._SupportsEllipsisText ],

        /**
         * @lends mstrmojo.LabelWithEllipsis.prototype
         */
        {
            ellipsisPosition: 'end',
            
            postBuildRendering: function() {
                if (this._super) {
                    this._super();
                }
                
                // Cache whether this label supports multiple lines.
                this._multiLine = (mstrmojo.css.getComputedStyle(this.domNode).whiteSpace !== 'nowrap');
                
                // Ellipsize text.
                this.markupMethods.ontextChange.apply(this);
            }
        }
    );
    
    // Add markup method to inherited markup methods.
    var proto = mstrmojo.LabelWithEllipsis.prototype,
        markupMethods = proto.markupMethods = mstrmojo.hash.copy(proto.markupMethods),
        fnTextUpdate = markupMethods.ontextChange;
    
    markupMethods.ontextChange = function () {
        var dn = this.domNode;
        if (dn) {
            fnTextUpdate.call(this);
            var multiLine = this._multiLine;
            if (multiLine !== undefined) {
                this.ellipsize('dn', dn, multiLine);
            }
        }
    };
    
}());