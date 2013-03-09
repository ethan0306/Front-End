(function(){

    mstrmojo.requiresCls(
            "mstrmojo.expr", 
            "mstrmojo._HasPopup", 
            "mstrmojo.css",
            "mstrmojo.Widget"
            );
    
    var _C = mstrmojo.css,
        _E = mstrmojo.expr,
        _F = _E.FN,
        _BTs = {};
    _BTs[_F.BETWEEN] = 1;
    _BTs[_F.NOT_BETWEEN] = 1;
    
    /**
     * <p>An attribute form qualification.</p>
     *
     * <p>FormQual represents a single attribute form condition node in an expression tree. Its
     * display consists of an attribute name, followed by a form name, followed by a function name, followed
     * by 0-2 constants (depending on the function).</p>
     *
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.FormQual = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        [mstrmojo._HasPopup],
        // instance members
        /**
         * @lends mstrmojo.FormQual.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.FormQual",
            
            /**
             * <p>Data representation of an attribute elements qualification node in an expression tree.<p>
             * <p>The data object should expose the following properties:</p>
             * <dl>
             *   <dt>a</dt>
             *   <dd>The attribute of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>fm</dt>
             *   <dd>The attribute form of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>fn</dt>
             *   <dd>The id of the function (operator).</dd>
             *   <dt>fnt</dt>
             *   <dd>The type of the function (1=default,2=rank,3=percent).</dd>
             *   <dt>cs</dt>
             *   <dd>Array of 0-2 constant objects. Each element object has properties: "v" (value), "dtp" (data type).</dd>
             * </dl>
             * @type Object
             */
            data: null,
            
            /**
             * The text to display between 2 constants in a "between" or "not between" qualification.
             * @type String
             */
            betweenText: "and",

            /**
             * @ignore
             */
            markupString: '<div class="mstrmojo-cond mstrmojo-FormQual">'
                + '<span class="mstrmojo-cond-text" mstrAttach:click>'
                    + '<span class="mstrmojo-text mstrmojo-attr"></span>'
                    + '<span class="mstrmojo-text mstrmojo-form"></span>'
                    + '<span class="mstrmojo-text mstrmojo-fn"></span>'
                    + '<span class="mstrmojo-text mstrmojo-c1"></span>'
                    + '<span class="mstrmojo-text mstrmojo-btwn">{@betweenText}</span>'
                    + '<span class="mstrmojo-text mstrmojo-c2"></span>'
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
                fmNode: function(){return this.domNode.firstChild.childNodes[1];},
                fnNode: function(){return this.domNode.firstChild.childNodes[2];},
                c1Node: function(){return this.domNode.firstChild.childNodes[3];},
                btwnNode: function(){return this.domNode.firstChild.childNodes[4];},
                c2Node: function(){return this.domNode.firstChild.lastChild;},
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

                    // Display the form name.
                    this.fmNode.innerHTML = (d && d.fm && d.fm.n != null) ? d.fm.n : "";

                    // Display the function.
                    this.fnNode.innerHTML = (d && d.fn != null) ? _E.fnName(d.et, d.fn, d.fnt, d.fm.dtp) : "";

                    // Display the constants.
                    var cc = _E.fnCstCount(d && d.fn, d && d.fnt);
                    for (var i=1; i<3; i++) {
                        var el = this['c'+i+'Node'],
                            b = i <= cc;
                        if (b) {
                            var v = d && d.cs && d.cs[i-1] && d.cs[i-1].v;
                            el.innerHTML = (v != null) ? v: "";
                        }
                        el.style.display = b ? 'inline' : 'none';
                    }

                    // Toggle the between text.
                    this.btwnNode.style.display = (d && (d.fn in _BTs)) ? 'inline': 'none';
                },
                onselectedChange: function(){
                    // Toggle highlighting to indicate a selected condition in a list.
                    _C.toggleClass(this.domNode, ['selected'], this.selected);
                }
            }
        });
})();
