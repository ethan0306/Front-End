(function(){

    mstrmojo.requiresCls(
        "mstrmojo.string",
        "mstrmojo.hash",
        "mstrmojo.ListBuilder");
    
    var _S = mstrmojo.string,
        RENDERED = 1,
        CSS = 'mstrmojo-multicolitem';

    /**
     * <p>Builds the markup string for the HTML table and colgroup that wraps each item's markup.</p>
     *
     * <p>The colgroup contains one col element for each column in the widget's "cols" property.</p>
     *
     * @param {Widget} w The widet for whom the markup is being built.
     * @private
     */
    function _tablePrefix(w){
        var out = ['<table class="' + CSS + '-table" cellspacing="0" cellpadding="0"><colgroup>'],
            cs = w.cols,
            k = 1;
        for (var i=0, clen=(cs&& cs.length)||0; i<clen; i++) {
            var c = cs[i];
            out[k++] = '<col style="width:' + c.width;
            if (c.visible === false) {
                out[k++] = '; display: none';
            }
            out[k++] = '" />';
        }
        out[k++] = '</colgroup><tbody><tr class="' + CSS + '-tr">';
        return out.join('');
    }

    /**
     * <p>Builds an itemMarkupFunction for a column from either (a) the column's itemMarkup or (b) itemField.</p>
     *
     * @param {String} [im] The column's itemMarkup.
     * @param {String} [ifd] The column's itemField.
     * @private
     */
    function _makeFunc(im, ifd){
        var s = im || 
                (ifd && '<div class="mstrmojo-text">{@' + ifd + '}</div>');
        return s ? function(item, index, widget){
                        return _S.apply(s, item);
                    }
                    : null;
    }
    
    mstrmojo.MultiColListBuilder = mstrmojo.provide(
        "mstrmojo.MultiColListBuilder",
        mstrmojo.hash.copy(
            {
                /**
                 * @ignore
                 */
                newContext: function bc(w){
                    // Make an itemBuilder function for each column.
                    var ifs = [],
                        cs = w.cols;
                    for (var i=0, clen=(cs&&cs.length)||0; i<clen; i++) {
                        var c = cs[i];
                        ifs[i] = c.markupFunction || _makeFunc(c.markup, c.field);
                    }
    
                    return {
                            itemStatus: [], 
                            tablePrefix: _tablePrefix(w),
                            tableSuffix: '</tr></tbody></table>',
                            itemFuncs: ifs,
                            cs: (ifs && ifs.length)||0
                    };
                },
                
                /**
                 * @ignore
                 */
                build: function b(w, ctxt, item, idx){
                    ctxt.itemStatus[idx] = RENDERED;
                    
                    var PRE = '<td class="' + CSS + '-td">',
                        POST = '</td>',
                        ifs = ctxt.itemFuncs,
                        cs = ctxt.cs,
                        out = [ctxt.tablePrefix],
                        k = 1;
                    for (var i=0; i<cs; i++){
                        out[k++] = PRE;
                        out[k++] = ifs[i](item, idx, w);
                        out[k++] = POST;
                    }
                    out[k++] = ctxt.tableSuffix;
                    return out.join('');
                }
            },
            mstrmojo.hash.copy(mstrmojo.ListBuilder)
        )
    );

})();
