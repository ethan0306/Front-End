(function(){

	mstrmojo.requiresCls("mstrmojo.dom");
	
    var _D = mstrmojo.dom;

    /**
     * Finds all the numeric hash keys which are greater than or equal to a given number.
     * @param {Object} h The hash whose keys are to be inspected.
     * @param {Number} min The minimum numeric value to be matched against the hash keys.
     * @return {Array} List of all hash keys, converted to numbers, sorted in ascending order.
     */
    function _findGtEq(h, min){
        var ret = [];
        if (h) {
            for (var k in h) {
                var i = Number(k);
                if (i >= min) {
                    ret.push(i);
                }
            }
        }
        ret.sort(mstrmojo.array.numSorter);
        return ret;
    }
    
    mstrmojo.ListSelector = mstrmojo.provide(
        "mstrmojo.ListSelector",
        {
            /**
             * <p>Handles a given event in a given list widget by modifying the widget's selections.</p>
             *
             * <p>This method asks the widget's listMapper for the item index that was targeted by the event.
             * Then it updates the selected indices depending upon certain widget properties & event properties.</p>
             * 
             * <p>This method assumes the given widget has a "listMapper" and implements the methods "singleSelect",
             * "toggleSelect" and "rangeSelect".</p>
             * 
             * @param {mstrmojo.Widget} w The widget in which the event occurred.
             * @param {DomNode} p The parent DOM node which contains all the item wrappers.
             * @param {Object} evt The manufactured object that represents an event.
             * @param {DomWindow} evt.hWin The window in which the event occurred.
             * @param {DomEvent} [evt.e] The DOM event (if any) provided by the browser.
             */
            premousedown: function pmd(w, p, evt){
                // Was the event target an item div (or a descendant thereof)?
                var hWin = evt.hWin,
                    e = evt.e,
                    el = _D.eventTarget(hWin, e),
                    idx = w.listMapper.findIndex(w, p, el);
                if (idx > -1) {
                    // Read some widget and event properties.
                    var m = w.multiSelect,
                        c = _D.ctrlKey(hWin, e),
                        s = _D.shiftKey(hWin, e);
                    if (c || s) {
                        _D.clearBrowserHighlights(hWin);
                    }

                    if (m && ( c || (w.selectionPolicy === "toggle") )) {
                        w.toggleSelect(idx);
                    } else if (m && s) {
                        w.rangeSelect(idx);
                    } else {
                        w.singleSelect(idx);
                    }
                }
            },

            /**            
             * @param {mstrmojo.Widget} w The widget in which the event occurred.
             * @param {DomNode} p The parent DOM node which contains all the item wrappers.
             * @param {Object} evt The manufactured object that represents an event.
             * @param {DomWindow} evt.hWin The window in which the event occurred.
             * @param {DomEvent} [evt.e] The DOM event (if any) provided by the browser.
             */
            premouseup: function pmu(w, p, evt){
                var hWin = evt.hWin,
                    e = evt.e,
                    c = _D.ctrlKey(hWin, e),
                    s = _D.shiftKey(hWin, e);
                if (c || s) {
                    _D.clearBrowserHighlights(hWin);
                }
            },
                        
            /**
             * <p>Handles a given "add" event in the items of a given list widget by modifying the widget's selectedIndices.</p>
             *
             * <p>This method inspects the event to determine at what index new items were inserted and how many items were inserted.
             * It then walks the selectedIndices and increments those which fall at or after the insertion index.  It also does
             * the same increment logic for the selectedIndex property.  This is done without raising any "change" event because
             * the selected item(s) have not actually changed.</p>
             *
             * @param {mstrmojo.Widget} w The widget in which the event occurred.
             * @param {Object} evt The manufactured object that represents an event.
             * @param {Array} [evt.value] List of items which were added.
             * @param {Integer} [evt.index] The index at which the items were inserted.
             */
            onadd: function oa(w, evt){
                var c = evt && evt.value && evt.value.length;
                if (c) {
                    var idx = evt.index,
                        sel = w.selectedIndices,
                        inc = _findGtEq(sel, idx);
                    for (var j=inc.length-1; j>-1; j--){
                        var at = inc[j];
                        sel[at + c] = true;
                        delete sel[at];
                    }
                    
                    if (w.selectedIndex >= idx){
                        w.selectedIndex += c;
                    }
                }
            },

            /**
             * <p>Handles a given "remove" event in the items of a given list widget by modifying the widget's selectedIndices.</p>
             *
             * <p>This method inspects the event to determine at what index items were removed and how many items were removed.
             * It then walks the selectedIndices and decrements those which fall after the removed items, plus removes those
             * which fall within the removed items.  It also does the same decrement/clear logic for the selectedIndex property.  
             * This is only raises a "change" event if selected items were removed; otherwise, 
             * the selected item(s) have not actually changed, just shifted.</p>
             *
             * @param {mstrmojo.Widget} w The widget in which the event occurred.
             * @param {Object} evt The manufactured object that represents an event.
             * @param {Array} [evt.value] List of items which were added.
             * @param {Integer} [evt.index] The index at which the items were inserted.
             */
            onremove: function oa(w, evt){
                var c = evt && evt.value && evt.value.length;
                if (c) {
                    var idx = evt.index,
                        idxLast = idx + c - 1,
                        h = w.selectedIndices,
                        si = w.selectedIndex,
                        dec = [],
                        rem = [],
                        b = false;
                    if (h) {
                        for (var k in h) {
                            var i = Number(k);
                            if (i > idxLast) {
                                dec.push(i);
                            } else if (i >= idx) {
                                rem.push(i);
                                b = true;
                            }
                        }
                    }
                    dec.sort(mstrmojo.array.numSorter);
                    for (var j=0, len=dec.length; j<len; j++){
                        var at = dec[j];
                        h[at - c] = true;
                        delete h[at];
                    }
                    if (si > idxLast) {
                        // Decrement selectedIndex silently, since these selections haven't actually changed, they just shifted position.
                        w.selectedIndex -= c;
                    }
                    
                    if (b) {
                        // Remove the deleted indices from our selections loudly, because selections have actually been lost.
                        w.removeSelect(rem);
                    }                  
                }
            }
        });
        
})();