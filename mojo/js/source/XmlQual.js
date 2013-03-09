(function(){

    mstrmojo.requiresCls("mstrmojo.css");
    
    var _C = mstrmojo.css;
    
    /**
     * <p>An unknown qualification represented by an XML fragment.</p>
     *
     * <p>XmlQual represents a single condition node in an expression tree. Its
     * display consists of a single name.  Its definition is specified by an XML fragment, which
     * is treated as a read-only black box by this widget.</p>
     *
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.XmlQual = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        null,
        // instance members
        /**
         * @lends mstrmojo.XmlQual.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.XmlQual",
            
            /**
             * <p>Data representation of the qualification node in an expression tree.<p>
             * <p>The data object should expose the following properties:</p>
             * <dl>
             *   <dt>n</dt>
             *   <dd>The display name of this qualification.</dd>
             *   <dt>xml</dt>
             *   <dd>The xml string that defines this qualification.</dd>
             * </dl>
             * @type Object
             */
            data: null,
            
            /**
             * @ignore
             */
            markupString: '<div class="mstrmojo-cond mstrmojo-XmlQual">'
                + '<span class="mstrmojo-cond-text">'
                + '</span>'
                + '<span class="mstrmojo-onhover mstrmojo-topright mstrmojo-cond-tools">'
                    + '<img class="mstrmojo-del" src="../images/1ptrans.gif" />'
                + '</span>' 
                + '</div>',
                
            /**
             * @ignore
             */
            markupSlots: {
                textNode: function(){return this.domNode.firstChild;}
            },
            
            /**
             * @ignore
             */
            markupMethods: {
                ondataChange: function(){
                    var d = this.data;

                    // Display the attribute name.
                    this.textNode.innerHTML = d ? d.n || (d.xml && d.xml.replace(/\</gm, '&lt;').replace(/\>/gm, '&gt;')) || "" : "";

                },
                onselectedChange: function(){
                    // Toggle highlighting to indicate a selected condition in a list.
                    _C.toggleClass(this.domNode, ['selected'], this.selected);
                }
            }
        });
})();
