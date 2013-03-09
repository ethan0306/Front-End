(function(){

    mstrmojo.requiresCls(
            "mstrmojo.expr",
            "mstrmojo.Widget"
            );
    
    var _E = mstrmojo.expr;
    
    /**
     * <p>An embedded object (filter or report) qualification.</p>
     *
     * <p>EmbedObjQual represents a single condition node in an expression tree. Its
     * display consists of an embedded object's name.</p>
     *
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.EmbedObjQual = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        null,
        // instance members
        /**
         * @lends mstrmojo.EmbedObjQual.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.EmbedObjQual",
            
            /**
             * <p>Data representation of an embedded object qualification node in an expression tree.<p>
             * <p>The data object should expose one of the following properties:</p>
             * <dl>
             *   <dt>r</dt>
             *   <dd>The embedded report of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>f</dt>
             *   <dd>The embedded filter of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             * </dl>
             * @type Object
             */
            data: null,

            /**
             * @ignore
             */
            markupString: '<div class="mstrmojo-cond mstrmojo-EmbedObjQual">'
                + '<span class="mstrmojo-cond-text">'
                    + '<span class="mstrmojo-text mstrmojo-embedobj"></span>'
                + '</span>'
                + '<span class="mstrmojo-onhover mstrmojo-topright mstrmojo-cond-tools">'
                    + '<img class="mstrmojo-del" src="../images/1ptrans.gif" />'
                + '</span>' 
                + '</div>',
                
            /**
             * @ignore
             */
            markupSlots: {
                objNode: function(){return this.domNode.firstChild.firstChild;}
            },
            
            markupMethods: {
                ondataChange: function(){
                    var d = this.data,
                        k = (d && d.et === _E.ET.R) ? 'r' : 'f';

                    // Display the embedded object's name.
                    this.objNode.innerHTML = (d && d[k] != null) ? d[k].n : "";
                }
            }
        });
})();
