(function () { 

    mstrmojo.requiresCls("mstrmojo.array", "mstrmojo.hash");
    
    var _A = mstrmojo.array,
        _H = mstrmojo.hash;
    
    /**
     * Adds the given indices to the selectedIndices of the given widget.  Raises no events. Returns an array of the
     * indices that were actually added (possibly empty).
     * @private
     */ 
    function _add(/*Widget*/ me, /*Array*/ idxs) {
        var added = [],
            sel = me.selectedIndices,
            allIdx = me.allIdx;

        // add ALL
        var i, len,
            items = me.items;
        if (me.multiSelect && (allIdx > -1) && (_A.indexOf(idxs, me.allIdx) > -1)) {
            for (i = 0, len=items.length; i < len; i++) {
                if (!sel[i]){
                    added.push(i);
                    sel[i] = true;
                    me.selectedIndex = i;
                    me.selectedItem = items[i];
                }
            }
        } else {
            for (i=0, len=idxs.length; i<len; i++) {
                var idx = idxs[i];
                if (!sel[idx]){
                    sel[idx] = true;
                    added.push(idx);
                    me.selectedIndex = idx;
                    me.selectedItem = items[idx];
                }
            }
        }
        return added;
    }

    /**
     * Removes all selectedIndices from given widget.  Raises no events. Returns an array of the
     * indices that were actually removed (possibly empty).
     * @private
     */ 
    function _rmvAll(/*Widget*/ me) {
        var rmv = [],
            sel = me.selectedIndices;
        for (var i in sel) {
            delete sel[i];
            rmv.push(parseInt(i,10));  // convert string keys to integers
        }
        me.selectedIndex = -1;
        me.selectedItem = null;
        return rmv;
    }
        
    /**
     * Removes the given indices from the selectedIndices of the given widget.  Raises no events. Returns an array of the
     * indices that were actually removed (possibly empty).
     * @private
     */ 
    function _rmv(/*Widget*/ me, /*Array*/ idxs) {
        var removed = [],
            sel = me.selectedIndices,
            arrIdx = _A.indexOf,
            allIdx = me.allIdx;
                
        // remove ALL
        if (me.multiSelect && (allIdx > -1) && (arrIdx(idxs, allIdx) > -1)) {
            return _rmvAll(me);
        }
        // remove non-ALL
        // if ALL is currently selected, we need to remove it when any other one removed
        if (idxs.length > 0 && sel[allIdx]) {
            if (arrIdx(idxs, allIdx) < 0) {
                idxs.push(allIdx);
            }
        }
        for (var i=0, len=idxs.length; i<len; i++) {
            var idx = idxs[i];
            if (sel[idx]){
                delete sel[idx];
                removed.push(idx);
                if (me.selectedIndex == idx) {
                    me.selectedIndex = -1;
                    me.selectedItem = null;
                }
            }
        }
        return removed;
    }
        
    /**
     * Given widget and a hash of selected indices, removes all widget selections which are not
     * in the hash, and adds all hash entries which are not in the widget selections. 
     * Raises no events.  Returns object with an array of added indices & array of removed indices.
     */
    function _apply(/*Widget*/ me, h) {
        var sel = me.selectedIndices;
        if (!sel) {
            sel = {};
            me.selectedIndices = sel;
        }
        
        if (!h) {
            h = {};
        }
        
        // Remove the current selections which are not in the new selections.
        var sidx = me.selectedIndex,
            rmv = [],
            idx;
        for (var i in sel) {
            if (!h[i]) {
                idx = parseInt(i,10);
                delete sel[i];
                rmv.push(idx);
                if (sidx == idx) {
                    me.selectedIndex = -1;
                    me.selectedItem = null;
                }
            }
        }
        // Add the new selections which are not already in the current selections.
        var add = [],
            itms = me.items;
        for (i in h) {
            if (!sel[i]) {
                idx = parseInt(i,10);
                sel[i] = true;
                add.push(idx);
                me.selectedIndex = idx;
                me.selectedItem = itms && itms[idx];
            }
        }
        return {add: add, rmv: rmv};
    }
    
    /**
     * Utility method: raises an event after the selectedIndices hash has been modified. 
     * @private
     */
    function _raise(/*Widget*/ me, /*Array?*/ added, /*Array?*/ removed) {
        if (me.raiseEvent && 
            ((added && added.length) || (removed && removed.length)) ) {
                me.raiseEvent({
                    name: 'change',
                    added: added,
                    removed: removed
                });
        }
    }
    
    /**
     * <p>_ListBase2Selections manages a collection of selected indices for a list widget.</p>
     *
     * <p>This mixin maintains a set of properties ("selectedIndices", "selectedIndex", "selectedItem")
     * which define which items in a list widget are currently selected. Additionally the mixin exposes 
     * API methods for modifying the current selection.</p>
     *
     * @class
     * @public
     */    
    mstrmojo._ListBase2Selections = mstrmojo.provide(
        "mstrmojo._ListBase2Selections",
        /**
         * @lends mstrmojo._ListBase2Selections#
         */
        {
            /**
             * <p>If true, this widget supports more than one selected index at a time.
             * @type Boolean
             */
            multiSelect: false,
            
            /**
             * Hashtable of selected indices, possibly empty.  Key = a selected index, value[key] = true if index selected.
             * @type Object
             */
            selectedIndices: null,
            
            /**
             * The last index that was added to the selectedIndices. If none, selectedIndex is -1.
             */
            selectedIndex: -1,

            /**
             * The the item at the current selectedIndex.
             */
            selectedItem: null,

            /**
             * Metadata for "selectedXXX" properties. Identifies the event which is raised when the property value is changed.
             */
            selectedIndices_bindEvents: "change",
            selectedIndex_bindEvents: "change",
            selectedItem_bindEvents: "change",

            /**
             * If true, when selectedItem is set to an item not in the items array, the selectedItem is automatically added to items.
             * Otherwise, the list's selectedIndex is unchanged.
             * @type Boolean
             */
            allowUnlistedValues: true,

            /**
             * If allowUnlistedValues is true, the index at which to insert unlisted values. If null or negative, values are appended.
             * @type Integer
             */
            insertUnlistedValuesAt: -1,

            /**
             * <p>The index of the list item which represents "all". If -1 then no such list item exists.</p>
             *
             * <p>The "all" item plays a special role, in that selecting it is equivalent to selecting all items.</p>
             * 
             * @type Integer
             */
            allIdx : -1,
            
            /**
             * <p>Clears the current selection and selects the given index and raises a "change" event if any of the following
             * conditions is met:
             * <ol><li>the given index is not already selected; or</li>
             * <li>the widget's selectionPolicy is "reselect"; or
             * <li>the ALL item is currently selected.</li>
             * </ol>
             * </p>
             * <p>Typically used in response to an item click without any SHIFT or CTRL key.</p>
             *
             * @param {Integer} idx The index of the item to select.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "selectionChange" event, which specifies which selections (if any) were removed and/or added.         
             */
            singleSelect: function ss(idx, silent){
                // if current has not been selected or ALL has been selected
                // or selectionPolicy is "reselect"
                if (!this.selectedIndices[idx] || (this.selectionPolicy === 'reselect') || (idx !== this.allIdx && this.selectedIndices[this.allIdx])) {    
                    var rmv = _rmvAll(this),
                        add = _add(this, [idx]);
                    if (silent !== true) {
                        _raise(this, add, rmv);
                    }
                }    
            },
            
            /**
             * <p>If the given index is selected, unselects it; otherwise, selects it. Raises a "selectionChange" event.</p>
             *
             * <p>Typically used in response to a CTRL+click on an item.</p>
             *
             * @param {Integer} idx The index of the item to select.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "selectionChange" event, which specifies which selections (if any) were removed and/or added.         
             */
            toggleSelect: function ts(idx, silent) {
                var add, rmv;
                if (this.selectedIndices[idx]) { 
                    rmv = _rmv(this, [idx]);
                } else {
                    add = _add(this, [idx]);
                }
                if (silent !== true) {
                    _raise(this, add, rmv);
                }
            },

            /**
             * <p>Selects a range of items from the current anchor index to the given index. Raises a "selectionChange" event.</p>
             *
             * <p>Typically used in response to a SHIFT+click on an item.</p>
             *
             * @param {Integer} idx The ending index of the range of items to select.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "selectionChange" event, which specifies which selections (if any) were removed and/or added.         
             */
            rangeSelect: function rs(idx, silent) {
                 // to do later
                 this.singleSelect(idx, silent);
            },
            
            /**
             * <p>Removes all the current selections (if any). Raises a "selectionChange" event.</p>
             * 
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "selectionChange" event, which specifies which selections (if any) were removed and/or added.         
             */
            clearSelect: function cs(silent){
                var ret = _rmvAll(this);
                if (silent !== true) {
                    _raise(this, null, ret);
                }
            }, 

            /**
             * <p>Clears the current selection(s), and selects a given index or array of indices.</p>
             *
             * @param {Integer|Array} idxs The index or array of indices to select.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "selectionChange" event, which specifies which selections (if any) were removed and/or added.         
             */
            select: function sel(idxs, silent){
                // TO DO: can we optimize this method so we don't have to convert the array to a hash?
                var ret = _apply(this, _A.hash(idxs));
                if ((silent !== true) && (ret.add.length || ret.rmv.length)) {
                    _raise(this, ret.add, ret.rmv);
                }
            },
            
            /**
             * Adds the given indices to the selectedIndices collection (if not already there).  Raises "selectionChange"
             * event if collection was modified.
             *
             * @param {Integer|Array} idxs The index or array of indices to select.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "selectionChange" event, which specifies which selections (if any) were removed and/or added.         
             * @return {Array} Array of indices which were added to the selectedIndices; possibly empty.
             */
            addSelect: function add(idxs, silent) {
                if (idxs == null){    // if null or undefined
                    return;
                }
                if (idxs.constructor !== Array) {
                    idxs = [idxs];
                }
                var ret = _add(this, idxs);
                if (silent !== true) {
                    _raise(this, ret, null);
                }
                return ret;
            },
            
            /**
             * Removes the given indices from the selectedIndices collection (if already there). Raises "selectionChange"
             * event if collection was modified.
             *
             * @param {Integer|Array} idxs The index or array of indices to select.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "selectionChange" event, which specifies which selections (if any) were removed and/or added.         
             * @return {Array} Array of indices which were removed from the selectedIndices; possibly empty.
             */
            removeSelect: function rmv(idxs, silent) {
                if (idxs == null) {   // if idx is null or undefined
                    return;
                }
                if (idxs.constructor != Array) {
                    idxs = [idxs];
                }
                var ret = _rmv(this, idxs);
                if (silent !== true) {
                     _raise(this, null, ret);
                }
                return ret;
            },
            
            /**
             * Custom setter for selectedIndices. Avoids resetting the object reference, and instead updates the existing
             * hashtable and raises an event.
             *
             * @param {String} n Name of the property to be set.
             * @param {Object} [v] Hash of selections; keyed by index (hash values are all true).
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "change" event, which specifies which selections (if any) were removed and/or added.         
             * @private
             */
            _set_selectedIndices: function(n, v, silent) {
                if (this.selectedIndices === v){
                    return false;
                }
                var ret = _apply(this, v);

                // Raise event if collection as modified.
                if (ret.add.length || ret.rmv.length) {
                    if (silent !== true) {
                        _raise(this, ret.add, ret.rmv);
                    }
                }
                // Return false so that object doesn't raise an additional "selectionChange" event.
                return false;
            },
            
            /**
             * <p>Custom setter for selectedIndex.</p> 
             *
             * <p>Leverages setter for selectedIndices to keep that property synchronized.</p>
             *
             * @param {String} n Name of the property to be set.
             * @param {Integer} v The index to be selected.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "change" event, which specifies which selections (if any) were removed and/or added.         
             * @private
             */
            _set_selectedIndex: function(n, v, silent){
                var idxs = {};
                if (v >-1) {
                    idxs[v] = true;
                }
                return this._set_selectedIndices(null, idxs, silent);
            },
                        
            /**
             * <p>Custom setter for selectedItem.</p> 
             *
             * <p>Leverages setter for selectedIndex to keep that property synchronized.</p>
             *
             * <p>Supports values which are either objects or scalars.</p>
             * <ul>
             * <li>If a scalar is given, this method searches for the scalar in the items list.</li>
             * <li>If an object is given, and the widget has no itemIdField defined, then the method
             * searches for the object in the items list.</li>
             * <li>If  an object is given and the widget has an itemIdField defined, then the method
             * compares the given object's property value at the itemIdField with the corresponding
             * values of the list items.
             * </ul>
             * <p>If a match is found, the selected index is set to the index of the first matching item.
             * If no match is found, the selected index is set to -1 UNLESS the "allowUnlistedValues" property is true.
             * If allowUnlistedValues is true and no match is found, the given item is appended to the items list and selected.</p>
             *
             * @param {String} n Name of the property to be set.
             * @param {Object} v The item to be selected.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "change" event, which specifies which selections (if any) were removed and/or added.         
             * @private
             */
            _set_selectedItem: function(n, v, silent){
                // Find the index corresponding to the given item.
                var isObject = v && (typeof(v) == 'object'),
                    idf = this.itemIdField,
                    idx = -1,
                    its = this.items;
                if (isObject && idf != null) {  // idf is not null and not undefined
                    // We are setting selectedItem to an object, and we have
                    // an itemIdField.  Try to match its itemIdField value to the existing items.
                    idx = _A.find(its, idf, v[idf]);
                } else if (v != null) {  // v is not null and not undefined
                    // We are either: (1) setting selectedItem to a scalar, or (2) setting
                    // selectedItem to an object, but we don't have an itemIdField.
                    // So try to match the item without using itemIdField.
                    idx = _A.indexOf(its, v);
                }
                if ((idx === -1) && (v != null) && this.allowUnlistedValues) {   // v is not null and not undefined
                    // We couldn't find the given item in items, but we are allowed to add it.
                    // Compute the index at which to insert.
                    var at = this.insertUnlistedValuesAt;
                    if (at == null || at < 0) {
                        at = (its && its.length) || 0;
                    }
                    idx = at;
                    this.add([v], idx);
                }
                return this._set_selectedIndex(null, idx, silent);
            },

            /**
             * <p>Sets the current selections to a given set of indices, or index, or item.</p>
             * 
             * <p>This method is typically called during the widget initialization, at which time it is useful to
             * use the "silent" param to avoid raising events.</p>
             *
             * @param {Object} [hash] Hash of selections for a multi-selection; keyed by index (hash values are all true).
             * @param {Object} [arr] Array of selected indices for a multi-selection.
             * @param {Integer} [idx] Index for a single selection.
             * @param {Object} [item] Item for a single selection.
             * @param {Boolean} [silent] If true, this method will not raise an event; otherwise, if the selection is modified, the
             * method raises a "change" event, which specifies which selections (if any) were removed and/or added.         
             */
            initSelections: function ints(hash, arr, idx, item, silent) {
                // Create the selections hash, if necessary.
                if (!this.selectedIndices) {
                    this.selectedIndices = {};
                    this.selectedIndex = -1;
                }
                if (hash) {
                    // Apply the given hash, if any.
                    this._set_selectedIndices(null, hash, silent);
                } else if (arr) {
                    // If no hash, apply the array, if any.
                    this.select(arr, silent);
                } else if (item) {
                    // If no index, apply the item, if any.
                    this._set_selectedItem(null, item, silent);                    
                } else if (idx != null) {   // idx is not null and not undefined
                    // If no array, apply the index, if any.
                    this._set_selectedIndex(null, idx, silent);
                }
            },
            
            sortSelectedIndices: function(){
                return _H.keyarray(
                                    this.selectedIndices, 
                                    true
                                ).sort(_A.numSorter);
            },
            
            /**
             * Removes the items at the current selected indices (if any) from this list's
             * "items" array. 
             */
            removeSelectedItems: function(){
                var idxs = this.sortSelectedIndices(),
                    len = idxs.length,
                    last = idxs[len-1],
                    ret = this.remove(idxs);
                last = Math.min(last + 1 - len, this.items.length -1);
                if (last >= 0) {
                    this.singleSelect(last);
                }
                return ret;
            },
            
            /**
             * Returns an array of the selected items, sorted (ascending) by index; possibly empty.
             */
            getSelectedItems: function(){
                return _A.get(this.items, this.sortSelectedIndices()) || [];
            },
            
            /**
             * Attempts to select a given set of items. Items which are not found may be inserted according to
             * the "allowUnlistedValues" property.  Previous selections are left selected.
             * @param {Array} arr The set of items to be selected.
             * @param {Boolean} [dontClear=false] If true, this flag indicates that prior selections should not be cleared.
             */
            setSelectedItems: function(arr, dontClear) {
                if (!arr || !arr.length) {
                    return;
                }
                var its = this.items || [],
                    ret = this.itemIdField != null ?
                            _A.findMulti(its, this.itemIdField, arr) :
                            _A.indexOfMulti(its, arr),
                    arrLen = arr.length,
                    missed = arrLen - ret.count,
                    alw = this.allowUnlistedValues,
                    at = this.insertUnlistedValuesAt,
                    offset = (alw && (at > -1)) ?
                                missed : 0;
                if (at<0) {
                    at = its.length;
                }
                var appIts = [],  // An array of items to be appended + selected.
                    appIdxs = [],   // An array of indices of items to be appended + selected,
                    m = ret.map;
                if (missed && alw) {
                    // Build an array of all items not found.
                    var c = 0;
                    for (var n=0; n<arrLen; n++){
                        if (m[n] == null) { // null or undefined (but not zero)
                            appIts.push(arr[n]);
                            appIdxs.push(at + c++);
                        }
                    }
                    // Insert these items into the list.                    
                    this.add(appIts, at);
                }
                var addIdxs = [];   // An array of indices of existing items to be selected.
                for (var k in m) {
                    var i = m[k];
                    if (i >= at) {
                        i += offset;
                    }
                    addIdxs.push(i);
                }
                var toAdd = addIdxs.concat(appIdxs),
                    added = this.addSelect(toAdd, !dontClear);
                if (!dontClear){
                    // We need to remove any selectedIndices which are not among the selected items above.
                    // Make a hash of all the indices we selected above...
                    var ha = _A.hash(added),
                        sel = this.selectedIndices,
                        toRem = [];
                    // For each selected index not in the hash...
                    for (var j in sel){
                        if (!ha[j]) {
                            // ...record it as targeted for termination.
                            toRem.push(parseInt(j,10));
                        }
                    }
                    // Remove the unwanted indices, and raise a single event for
                    // the added & removed together.
                    var rmd = this.removeSelect(toRem, true);
                    _raise(this, added, rmd);
                }
                
            }
        });
})();

