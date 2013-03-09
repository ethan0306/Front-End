(function(){

    mstrmojo.requiresCls("mstrmojo.expr", "mstrmojo._HasPopup", "mstrmojo.css");
    
    var _C = mstrmojo.css,
        _E = mstrmojo.expr,
        _F = _E.FN;
    
    /**
     * <p>A metric qualification.</p>
     *
     * <p>MetricQual represents a single metric condition node in an expression tree. Its
     * display consists of a metric name followed by a function name, followed
     * by 0-2 constants (depending on the function).</p>
     *
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.MetricQual = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        [mstrmojo._HasPopup],
        // instance members
        /**
         * @lends mstrmojo.MetricQual.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.MetricQual",
            
            /**
             * <p>Data representation of a metric qualification node in an expression tree.<p>
             * <p>The data object should expose the following properties:</p>
             * <dl>
             *   <dt>m</dt>
             *   <dd>The metric of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
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
            markupString: '<div class="mstrmojo-cond mstrmojo-MetricQual">'
                + '<span class="mstrmojo-cond-text" mstrAttach:click>'
                    + '<span class="mstrmojo-text mstrmojo-metric"></span>'
                    + '<span class="mstrmojo-text mstrmojo-fn"></span>'
                    + '<span class="mstrmojo-text mstrmojo-m2"></span>'
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
                metricNode: function(){return this.domNode.firstChild.firstChild;},
                fnNode: function(){return this.domNode.firstChild.childNodes[1];},
                m2Node: function(){return this.domNode.firstChild.childNodes[2];},
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

                    // Display the metric name.
                    this.metricNode.innerHTML = (d && d.m && d.m.n != null) ? d.m.n : "";

                    // Display the function.
                    // TO DO: use the default metric data type, rather than hard-coding it to REAL
                    this.fnNode.innerHTML = (d && d.fn != null) ? _E.fnName(d.et, d.fn, d.fnt, _E.DTP.REAL) : "";

                    // Display the constants.
                    var mc = (d.et === _E.ET.MC),
                        cc = mc ? 0 : _E.fnCstCount(d && d.fn, d && d.fnt);
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
                    this.btwnNode.style.display = (cc > 1) ? 'inline': 'none';

                    // Display the comparison metric name.
                    if (mc) {
                      this.m2Node.innerHTML = (d && d.m2 && d.m2.n != null) ? d.m2.n : "";
                    }
                    this.m2Node.style.display = mc ? 'inline' : 'none';

                },
                onselectedChange: function(){
                    // Toggle highlighting to indicate a selected condition in a list.
                    _C.toggleClass(this.domNode, ['selected'], this.selected);
                }
            }
        });
})();
