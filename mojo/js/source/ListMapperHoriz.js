(function(){
    
    mstrmojo.requiresCls(
    "mstrmojo.ListMapper");
    
    var RENDERED = 1,
        CSS = 'mstrmojo-itemwrap';
    
    mstrmojo.ListMapperHoriz = mstrmojo.provide(
        "mstrmojo.ListMapperHoriz",
        
        mstrmojo.hash.copy(
        /**
         * @lends mstrmojo.ListMapperHoriz
         */
        {
            markupPrefix: '<table class="mstrmojo-itemwrap-table" cellspacing="0" cellpadding="0"><tbody><tr>',
            
            markupSuffix: '</tr></tbody></table>',
            
            itemWrapperPrefix: function(w){
                return '<td class="' + this.getWrapperCss(w) + '">';
            }, 
            
            getWrapperCss: function(w) {
                return "mstrmojo-itemwrap-td";
            },
            
            itemWrapperPrefill: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
            
            itemWrapperSuffix:  '</td>',
            
            wrapperNodes: function wrapperNodes(p){
                return this.wrapperParentNode(p).cells;
            },
            
            wrapperParentNode: function wrapperParentNode(p){
                return p.firstChild.rows[0];
            },
        
            createWrapperNode: function createWrapperNode(p){
                var d = p.ownerDocument,
                    n = d.createElement('td');
                return n;
            },
            
            /**
             * <p>Returns the indices of the first and last items currently visible within the scrollboxNode.</p>
             *
             * <p>This function only computes an estimate, which may be slightly too large a range.  That is sufficient for our purposes; we can afford to render 
             * a few extra items outside the viewport; at worst, that will cause us to render too much, which slows performance but won't break anything.
             * We can't afford to not render enough items; that would leave empty space within the viewport and appear "broken".</p>
             *
             * @param {DomNode} p The parent DOM node of the DOM nodes to be inspected.
             * @param {Integer} count The number of child DOM nodes.
             * @param {Integer} top The scrollTop coordinate of the scrollbox node.
             * @param {Integer} h The height of the scrollbox node.
             * @param {Integer} left The scrollTop coordinate of the scrollbox node.
             * @param {Integer} w The height of the scrollbox node.
             * @returns {Object} An object whose "start" and "end" properties are the first and last indices within the given vertical range.
             * @private
             */
            findScrollRange: function y2idx(p, count, top, h, left, w, offX, offY) {
                var ch = this.wrapperNodes(p),
                    idx = parseInt(count/2, 10),
                    loops = parseInt(Math.log(count)/Math.log(2),10),
                    start = 0,
                    end = count-1,
                    r = left + w,
                    xFirst = ch[0].offsetLeft,
                    x;
                for (var i=1; i<=loops; i++){
                    x = ch[idx].offsetLeft - xFirst + offX;
                    if (x <= left) {
                        start = idx;
                    } else if (x >= r){
                        end = idx;
                    }
                    
                    var inc = Math.round(count/Math.pow(2,i+1));
                    idx += (x > left) ? -inc: inc;
                    idx = Math.min(
                            Math.max(0, idx),
                            count-1);
                }
                return {start: start, end: end};        
            },

            /**
             * <p>Maps a given DOM node to a list item index.</p>
             *
             * @param {mstrmojo.Widget} w The widget whose list items are to be searched.
             * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
             * @param {DomNode} node The DOM node.
             * @returns {Integer} The index of the corresponding list item, if found; -1 otherwise.
             */
            findIndex: function nd2idx(w, p, node) {
                if (p && node) {
                    var dn = w.domNode,
                        tr = this.wrapperParentNode(p),
                        pn = node.parentNode;
                    while (pn) {
                        if (pn === tr) {
                            // We found an item wrapper.
                            return mstrmojo.array.findBin(this.wrapperNodes(p), node, 'offsetLeft', w.items && w.items.length);
                        } else if (pn === dn) {
                            // Stop, we reached the widget's DOM root.
                            break;
                        }
                        node = pn;
                        pn = node.parentNode;
                    }
                }
                return -1;
            }
        },mstrmojo.hash.copy(mstrmojo.ListMapper)));

})();