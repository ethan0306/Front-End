(function(){

    mstrmojo.requiresCls("mstrmojo.array","mstrmojo.expr");
    
    var _A = mstrmojo.array,
        _E = mstrmojo.expr;
    
    /**
     * A mixin of commonly-used methods for widgets that represent nodes in a filter expression tree.
     * @class
     * @public
     */
    mstrmojo._IsExprNode = mstrmojo.provide(
        "mstrmojo._IsExprNode",
        {
            /**
             * Indents this expr in an expression tree.
             */
            ind: function ind(){
                var p = this.parent;
                if (p && p.indent) {               
                    var idx = this.childIndex();
                    idx = (idx > -1 && (idx > 0)) ? [idx, idx-1] : null; 
                    if(idx){
                        p.indent(idx);
                    }
                }
            },

            /**
             * Outdents this expr in an expression tree.
             */
            out: function out(){
                var p = this.parent;
                if (p && p.outdent) {
                    var idx = this.childIndex();
                    idx = (idx > -1 && (idx > 0)) ? [idx, idx-1] : null; 
                    if(idx){
                        p.outdent(idx);
                    }
                }
            },

            /**
             * Renders the "AND"/"OR" + "NOT" HTML that preceeds the HTML for a condition or branch qual's content.
             */            
            andOrTxt: function _parentAndOrTxt(){
                var p = this.parent,
                    pd = p && p.data,
                    t = '',
                    d = this.data;
                if (pd && (pd.et === _E.ET.ANDOR) && pd.fn) {
                    t = pd.fn + (d && d.not ? "_" + _E.FN.NOT  : '');
                    t = _E.BRANCH_FNS[t];
                }
                return '<span class="mstrmojo-text mstrmojo-andor">' + t + '</span>';
            },             
            
            /**
             * Returns the index of this condition's data node among the child nodes of its parent branch qual (if any).
             */
            childIndex: function idx(){
                var p = this.parent,
                    pd = p && p.data,
                    nds = pd && pd.nds,
                    d = this.data;
                if (nds && d) {
                    return _A.indexOf(nds, d);
                }
                return -1;
            }
        });

})();