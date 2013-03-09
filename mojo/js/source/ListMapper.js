(function(){

    mstrmojo.requiresCls(
        "mstrmojo.array",
        "mstrmojo.dom",
        "mstrmojo.css");
        
    var RENDERED = 1,
        CSS = 'mstrmojo-itemwrap',
        INNER = '&nbsp;',
        _A = mstrmojo.array;

    /**
     * Returns the item wrapper DOM node (if any) which contains a given node.
     * @param {mstrmojo.Widget} w The widget whose list items are to be searched.
     * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
     * @param {DomNode} node The DOM node.
     * @returns {DomNode} The corresponding item wrapper DOM node, if found; null otherwise.
     * @private
     */
    function _nd2iw(w, p, node){
        p = this.wrapperParentNode(p);
        if (p && node && p !== node) {
            var dn = w.domNode,
                pn = node.parentNode;
            while (pn) {
                if (pn === p) {
                    // We found an item wrapper.
                    return node;
                } else if (pn === dn) {
                    // Stop, we reached the widget's DOM root.
                    break;
                }
                node = pn;
                pn = node.parentNode;
            }
        }
        return null;
    }

    /**
     * <p>Maps a given item wrapper DOM node to a list item index.</p>
     * <p>This could be done by walking all the item wrappers in DOM until we find a match,
     * but that is painfully slow in IE. So instead we do a binary search to match the offsetTop.</p>
     * @param {mstrmojo.Widget} w The widget whose list items are to be searched.
     * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
     * @param {DomNode} node The item wrapper DOM node.
     * @returns {DomNode} The corresponding item index, if found; -1 otherwise.
     * @private
     */
    function _iw2idx(w, p, node) {
        var len =  w.items && w.items.length,
            wns = this.wrapperNodes(p),
            idx = _A.findBin(wns, node, 'offsetTop', len);
        for (var i = idx; i < len; i ++) {
            if(wns[i].offsetHeight) {  // not hidden
                return i;
            }
        }
        return -1;
    }
    
    function _pageSize (w) {
        // dynamically guess page size, once we have the page size, it should be the same from then on
        if (!w.pageSize || w.pageSize <= 0) {
            // guess
            var c = w.scrollboxNode;
            w.pageSize = c && c.clientHeight || 0;
        } 
        return w.pageSize;
    }
    /**
     * When first time loaded or item(s) got added/removed, we need to recalculate the total pages count,
     * and re-insert padding at the bottom of the itemsContainerNode.
     */
     function _initPages (w, me){
         if (w.usePaging) {
             // calculate total pages
             w.totalPages = 1;
             var c = w.itemsContainerNode, 
                 ph = _pageSize(w);
             if (w.usePaging && c && ph) {
                 // we will make itemsContainerNode always a little bit longer than the page requires, 
                 // so the scroll can work for the last page
                 w.totalPages = Math.ceil((c.clientHeight - parseInt(c.style && c.style.paddingBottom || 0, 10)) / ph);
             } 
             
            // ensure page has enough padding.
            // if the itemsContainerNode does not have enough space for the last page, when we scroll to the last page,
            // it would not show the whole page, instead it would show part of the previous page.
            if (c) {
    //            var padding = (_pageSize(w) * w.totalPages    // total height required for all pages 
    //                            - (c.clientHeight - parseInt(c.style && c.style.paddingBottom || 0)) // height of current elements
    //                            + 5)  // safety
    //                            + 'px';
                w.itemsContainerNode.style.paddingBottom = ph + 'px';
            }
         }
    }
    mstrmojo.ListMapper = mstrmojo.provide(
        "mstrmojo.ListMapper",
        /**
         * @lends mstrmojo.ListMapper
         */
        {
            /**
             * The markup inserted before items's markup string.
             * @type String
             */
            markupPrefix: '',
            /**
             * The markup inserted after items's markup string.
             * @type String
             */
            markupSuffix: '',
            
            
            itemWrapperPrefix: function(w){
                return '<div class="' + this.getWrapperCss(w) + '">';
            }, 
            
            itemWrapperSuffix:  '</div>',
                
            itemWrapperPrefill: '&nbsp',
            
            wrapperNodes: function wrapperNodes(p){
                return p.childNodes;
            },
            
            wrapperParentNode: function wrapperParentNode(p){
                return p;
            },
        
            createWrapperNode: function createWrapperNode(p){
                var d = p.ownerDocument,
                    n = d.createElement('div');
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
             * @returns {Object} An object whose "start" and "end" properties are the first and last indices within the given vertical range.
             * @private
             */
            findScrollRange: function y2idx(p, count, top, h, left, w, offX, offY) {
                if (!count) {
                    return {start: 0, end: 0};
                }
                var ch = this.wrapperNodes(p),
                    idx = parseInt(count/2, 10),
                    loops = parseInt(Math.log(count)/Math.log(2),10),
                    start = 0,
                    end = count-1,
                    bot = top + h,
                    yFirst = ch[0].offsetTop,
                    y;
                for (var i=1; i<=loops; i++){
                    y = ch[idx].offsetTop - yFirst + offY;
                    if (y < top) {
                        start = idx;
                    } else if (y > bot){
                        end = idx;
                    }
                    
                    var inc = Math.round(count/Math.pow(2,i+1));
                    idx += (y > top) ? -inc: inc;
                    idx = Math.min(
                            Math.max(0, idx),
                            count-1);
                }
                return {start: start, end: end};        
            },

            /**
             * Returns a handle to the item wrapper DOM node for a given item index.
             * @param {DomNode} p The parent DOM node which contains item wrapper DOM nodes for each item.
             * @param {Integer} idx The item index.
             */            
            findWrapper: function fdwp(p, idx) {
                var ch = this.wrapperNodes(p);
                return ch && ch[idx];
            },
            
            /**
             * <p>Maps a given DOM node to a list item index.</p>
             * @param {mstrmojo.Widget} w The widget whose list items are to be searched.
             * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
             * @param {DomNode} node The DOM node.
             * @returns {Integer} The index of the corresponding list item, if found; -1 otherwise.
             */
            findIndex: function nd2idx(w, p, node) {
                var iw = this._nd2iw(w, p, node);
                return iw ? this._iw2idx(w, p, iw) : -1;
            },
            
            /**
             * Computes the vertical offset between the top of a given item wrapper and the top of the
             * first item wrapper.  (In IE, simply using the item wrapper's offsetTop doesn't work, even if
             * there is no padding/spacing above the first item wrapper.)
             * @param {mstrmojo.Widget} w The widget whose list items are to be searched.
             * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
             * @param {Integer} [idx] The index of the item to be measured. If omitted, the "node" argument must be specified.
             * @param {DomNode} [node] The item wrapper DOM node. Provided as an alternative to the "idx" argument.
             */
            itemOffsetTop: function iofft(w, p, idx, node){
                if (!node) {
                    var ch = this.wrapperNodes(p);
                    node = ch && ch[idx];
                    if (!node) {
                        return 0;
                    }
                }
                var f = p.firstChild;
                if (!f || (f === node)) {
                    return 0;
                } else {
                    return node.offsetTop - f.offsetTop;
                }
            },

            /**
             * Computes the index at which an item would be inserted if dropped at a given position
             * over a given DOM target.
             * @param {mstrmojo.Widget} w The widget whose is being dragged over.
             * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
             * @param {DomNode} node The DOM target node.
             * @param {Object} pos The current mouse position.
             * @param {Integer} pos.left The position pageX.
             * @param {Integer} pos.top The position pageY.
             * @param {Object} off The current position of the parent DOM node (p) on the page.
             * @param {Integer} off.left The position pageX.
             * @param {Integer} off.top The position pageY.
             * @param {Integer} off.width The width of the DOM node's scroll viewport.
             * @param {Integer} off.height The height of the DOM node's scroll viewport.
             */
            whereDrop: function whdp(w, p, node, pos, off){
                // What item wrapper are we over?
                var iw = this._nd2iw(w, p, node),
                    idx, idxActual, t;
                if (iw) {
                    // Map the wrapper to an index.
                    idxActual = this._iw2idx(w, p, iw);
                    idx = idxActual;
                    
                    // Which half of that item wrapper's DOM are we over?
                    //t = iw.offsetTop;
                    //t = iw.offsetTop + iw.offsetParent.offsetTop;
                    t = this.itemOffsetTop(w, p, null, iw); //was: + iw.offsetParent.offsetTop; dont need that if we assume dropCue & itemsContainerNode share the same offset
                    
                    var h = iw.offsetHeight;
                    if (pos.y > off.top + t + h/2) {
                        // We're in the bottom half, so target the next item index.
                        idx++;
                        t += h;
                    }               
                } else {
                    // We're not over any item wrapper. We might over whitespace inside
                    // the list but above/below/beside the items.  If we have a dropCuePos,
                    // leave it unchanged.; otherwise, treat this scenario as "insert at top" by default.
                    // Hack: this method shouldnt have to know the name of the dropCuePos property.
//                    if (w.dropCuePos) {
                        return w.dropCuePos;
//                    }
//                    idx = 0;
//                    t = 0;
                }
                return {left: 0, top: t, idx: idx, idxActual: idxActual};
            },
            getWrapperCss: function(w) {
                return CSS;
            },
            postBuildRendering: function(p, items, builder, w, ctxt) {
                _initPages(w, this);
            },
            /**
             * <p>Generates the markup for a widget's item wrappers, and optionally, the markup for a specified number of items.</p>
             *
             * <p>The markup is built as an array of HTML strings.  The markup string contains an "item wrapper" DOM node for each item. 
             * By default, the wrapper nodes are not filled in with markup. However, the caller can request that items at the start and/or
             * end of the list be rendered by specifying (1) an item builder, (2) a builder context object, and (3) counts of items to
             * render at the start and end of the list.</p>
             *
             * @param {Array} items The list of items for which wrappers will be generated.
             * @param {Object} [builder] The builder with which to fill item wrappers with item markup.
             * @param {Widget} [w] The widget for which the item markup is to be built.
             * @param {Object} [ctxt] The context object to call the builder with.
             * @param {Integer} [first=0] The count of items to render at the start of the list.
             * @param {Integer} [last=0] The count of items to render at the end of the list.
             * @returns {String[]} The HTML strings array.
             */
            buildItemWrappers: function biws(items, builder, w, ctxt, first, last) {
                var PRE = this.itemWrapperPrefix(w),
                    POST = this.itemWrapperSuffix,
                    S = PRE + this.itemWrapperPrefill + POST,  // &nbsp; reserves one line of blank space for better scrollbar experience
                    out = [this.markupPrefix],
                    k = 1,
                    sel = w.selectedIndices || {},
                    fill = function fll(a,b){
                        for (var i=a; i<b; i++) {
                            out[k++] = PRE;
                            var s = builder.build(w, ctxt, items[i], i);
                            // If item is selected, append a select CSS class name.
                            // TO DO: make sure you add it to the root node, not just any node.
                            if (sel[i]) {
                                s = s.replace(/class\=\"([^\"]*)\"/, 'class="$1 selected"');
                            }
                            out[k++] = s;
                            out[k++] = POST;
                        }
                    };
        
                // Build a filled top section.
                var len = (items && items.length) || 0;
                first = first && builder ? Math.min(first, len) : 0;
                if (first) {
                    fill(0, first);
                }
        
                // Build an empty middle section.
                last = last && builder ? Math.min(last, len-first) : 0;
                var stop = len-last;
                for (var j=first; j<stop; j++) {
                    out[k++] = S;
                }
                
                // Build a filled bottom section
                if (last) {
                    fill(stop, len);
                }
        
                out.push(this.markupSuffix);
                
                return out;
            },
            
            /**
             * <p>Ensures that a given range of items is rendered.</p>
             *
             * <p>Walks the array of items, starting at the given index, and renders any
             * item who status is either (a) not yet rendered, or (b) dirty. If the count of items rendered
             * in this invokation reaches the given max, the method call stops rendering.</p>
             *
             * @param {DomNode} p The parent DOM node which contains item wrapper DOM nodes for each item.
             * @param {Array} items The items list.
             * @param {Array} builder The item builder with which to generate item markup.
             * @param {Widget} w The widget for which the item markup is to be built.
             * @param {Object} ctxt The context object to pass into the item builder.
             * @param {Integer} start The index of the first item to render.
             * @param {Integer} end The index of the last item to render.
             * @param {Integer} [max] The maximum number of items allowed to be rendered by this method call.
             * @returns {Integer} The count of items rendered, possibly 0.
             */
            fillItemWrappers: function fi(p, items, builder, w, ctxt, start, end, max){
                var len = (items && items.length) || 0,
                    ns = this.wrapperNodes(p),
                    st = ctxt.itemStatus,
                    C = mstrmojo.css,
                    sel = w.selectedIndices || {};
            
                for (var i=start, stop=Math.min(end+1, len), k=0; i<stop; i++) {
                    if (st[i] !== RENDERED) {
                        ns[i].innerHTML = builder.build(w, ctxt, items[i], i);
                        // If the item is selected, mark its DOM as selected.
                        if (sel[i]) {
                            var el = ns[i].firstChild;
                            if (el) {
                                C.addClass(el, ['selected']);
                            }
                        }
                        k++;
                        if (k === max) {
                            break;
                        }
                    }
                }
                return k;
            },

            /**
             * <p>Responds to an "add" event in this widget's items list.</p>
             *
             * <p>This callback allows the list mapper to add item wrappers for the newly added items.</p>
             *
             * @param {Widget} w The widget whose items were added to.
             * @param {DomNode} p The items container DOM node which is the parent of the item wrapper nodes.
             * @param {Object} evt The event object.
             * @param {Array} evt.value The newly added items.
             * @param {Integer} evt.index The index at which the new items were inserted.
             */
            onadd: function oa(w, p, ctxt, evt){
                if (p && evt) {
                    // Insert item wrappers for the newly added items.
                    var c = evt.value.length,
                        ns = this.wrapperNodes(p),
                        bef = ns[evt.index],
                        css = this.getWrapperCss(w);

                    for (var i=0; i<c; i++){
                        var el = this.createWrapperNode(p);
                        el.className = css;
                        el.innerHTML = INNER;
                        if (bef) {
                            this.wrapperParentNode(p).insertBefore(el, bef);
                        } else {
                            this.wrapperParentNode(p).appendChild(el);
                        }
                    }
                    
                    // for paging
                    _initPages(w, this);
                }
            },
            
            onremove: function orm(w, p, ctxt, evt){
                if (p && evt) {
                    // Remove item wrappers for the newly removed items.
                    var ns = this.wrapperNodes(p);
                    if (ns) {
                        var c = evt.value.length;
                        for (var i=evt.index+c-1, end=evt.index; i>=end; i--){
                            this.wrapperParentNode(p).removeChild(ns[i]);
                        }
                    }
                    // for paging
                    _initPages(w, this);
                }
            },
            
            onchange: function ocg(w, p, ctxt, evt){
                if (p && evt){
                    var ns = this.wrapperNodes(p);
                    if (ns) {
                        var C = mstrmojo.css,
                            st = ctxt.itemStatus,
                            idx;
                        for (var i=0, r = evt.removed, rlen = r&&r.length; i<rlen; i++) {
                            idx = r[i];
                            if (st[idx]) {
                                C.removeClass(ns[idx].firstChild, ["selected"]);
                            }
                        }
                        for (var j=0, a = evt.added, alen = a&&a.length; j<alen; j++) {
                            idx = a[j];
                            if (st[idx]) {
                                C.addClass(ns[idx].firstChild, ["selected"]);
                            }
                        }
                    }
                }
            },
            /**
             * Returns the item wrapper DOM node (if any) which contains a given node.
             * @param {mstrmojo.Widget} w The widget whose list items are to be searched.
             * @param {DomNode} p The parent DOM node of the item wrapper DOM nodes.
             * @param {DomNode} node The DOM node.
             * @returns {DomNode} The corresponding item wrapper DOM node, if found; null otherwise.
             * @private
             */
            _nd2iw : _nd2iw,
            
            _iw2idx: _iw2idx,
            
            // ======================== for paging ==========================
            /**
             * <p>Scrolls to a certain page.</p>
             * 
             * When paging is not used, this method will do nothing.
             */
            toPage: function(w, pg) {
                var scl = w.scrollboxNode;
                if (w.usePaging && scl) {
                    scl.scrollTop = pg * _pageSize(w);
                } else {
                    mstrmojo.alert("paging is not setup, can not perform paging.");
                }
            },
            /**
             * <p>Returns which page current list is shown.</p>
             */
            whichPage: function(w){
                var scl = w.scrollboxNode,
                    ph = _pageSize(w);
                return Math.round((scl && ph && scl.scrollTop/ph) || 0); 
            },
            /**
             * <p> Scrolls to show the item. </p>
             * 
             * @param idx The index of the item to show
             */
            toItem: function (w, idx){
                var c = w && w.itemsContainerNode,
                    s = w.scrollboxNode,
                    off = this.itemOffsetTop(w, c, idx),
                    ih = this.wrapperNodes(c)[idx].clientHeight,
                    sh = s.clientHeight,
                    st = s.scrollTop,
                    to = st;
                
                if (off < st) { // up above view?
                    // scroll to top
                    to = off;
                } else if (st + sh - ih < off) { // down below the view
                    // scroll to bottom
                    to = Math.min(off, off - sh + ih); 
                }
                s.scrollTop = to;
            }

        });
})();