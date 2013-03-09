(function(){

    mstrmojo.requiresCls(
            "mstrmojo.expr", 
            "mstrmojo.css", 
            "mstrmojo.array", 
            "mstrmojo.hash",
            "mstrmojo._HasPopup",             
            "mstrmojo.Widget"
            );
    
    var _C = mstrmojo.css,
        _E = mstrmojo.expr;
    
    /**
     * <p>An attribute elements list qualification.</p>
     *
     * <p>ElemsQual represents a single elements condition node in an expression tree. Its
     * display consists of an attribute name followed by an (optional) function name, followed
     * by a list of elements. The function name is omitted if it is "In List".</p>
     *
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.ElemsQual = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        [mstrmojo._HasPopup],
        // instance members
        /**
         * @lends mstrmojo.ElemsQual.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.ElemsQual",
            
            /**
             * <p>Data representation of an attribute elements qualification node in an expression tree.<p>
             * <p>The data object should expose the following properties:</p>
             * <dl>
             *   <dt>a</dt>
             *   <dd>The attribute of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>fn</dt>
             *   <dd>The id of the function (operator); either In List or Not In List.</dd>
             *   <dt>fnt</dt>
             *   <dd>The type of the function (1=default,2=rank,3=percent; should be 1).</dd>
             *   <dt>es</dt>
             *   <dd>Array of element objects. Each element object has properties: "did" (identifier), "n" (name).</dd>
             * </dl>
             * @type Object
             */
            data: null,
            
            /**
             * @ignore
             */
            markupString: '<div class="mstrmojo-cond mstrmojo-ElemsQual">'
                + '<span class="mstrmojo-cond-text" mstrAttach:click>'
                    + '<span class="mstrmojo-text mstrmojo-attr"></span>'
                    + '<span class="mstrmojo-text mstrmojo-fn"></span>'
                    + '<span class="mstrmojo-text mstrmojo-elems"></span>'
                + '</span>'
                + '<span class="mstrmojo-cond-popupNode"></span>'
                + '<span class="mstrmojo-onhover mstrmojo-topright mstrmojo-cond-tools">'
                    + '<img class="mstrmojo-del" src="../images/1ptrans.gif" />'
                + '</span>' 
                + '</div>',
                
            /**
             * @ignore
             */
            markupSlots: {
                attrNode: function(){return this.domNode.firstChild.firstChild;},
                fnNode: function(){return this.domNode.firstChild.childNodes[1];},
                elemsNode: function(){return this.domNode.firstChild.lastChild;},
                popupNode: function(){return this.domNode.childNodes[1];}
            },
            
            /**
             * @ignore
             */
            markupMethods: {
                ondataChange: function(){
                    var d = this.data;

                    // Display the attribute name.
                    this.attrNode.innerHTML = (d && d.a && d.a.n != null) ? d.a.n : "";

                    // Display the function if it is not "In List".
                    var f = this.fnNode;
                    if (d.fn !== _E.FN.IN_LIST) {
                        f.style.display = 'inline';
                        f.innerHTML = _E.fnName(d.et, d.fn, d.fnt);
                    } else {
                        f.style.display = 'none';
                    }

                    // Display the element names.
                    var s = [],
                        es = d.es,
                        l = es && es.length || 0,
                        k = 0;
                    for (var e=0; e<l; e++) {
                        s[k++] = '<span class="mstrmojo-elem">';
                        s[k++] = es[e].n;
                        s[k++] = '</span>';
                    }
                    this.elemsNode.innerHTML = s.join('');
                },
                onselectedChange: function(){
                    // Toggle highlighting to indicate a selected condition in a list.
                    _C.toggleClass(this.domNode, ['selected'], this.selected);
                },
                onallowingDropChange: function(){
                    // Toggle highlighting to indicate a valid drop zone.
                    _C.toggleClass(this.domNode, ['allowingDrop'], this.allowingDrop);
                }
            },
            
            /**
             * <p>If true, enables dragging of this widget.</p>
             * @type Boolean
             */
            draggable: false,

            /**
             * <p>If true, enables dropping on this widget.</p>
             * @type Boolean
             */            
            dropZone: false
        });
})();
