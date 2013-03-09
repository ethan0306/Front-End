(function () { 

    mstrmojo.requiresCls("mstrmojo.array");
    
    var $ARR = mstrmojo.array,
        $HASH = mstrmojo.hash;
    
    /*
        Adds the given indices to the selectedIndices of the given widget.  Raises no events. Returns an array of the
        indices that were actually added (possibly empty).
     */ 
    function _add(/*Widget*/ me, /*Array*/ idxs) {
        
        // do we have any indexes to add?
        if ( !idxs ) {
            return;
        }
        
        var added = [],
            sel = me.selectedIndices,
            allIdx = me.allIdx,
            noneIdx = me.noneIdx,
            inc = me.parent && me.parent.include;

        // if we selecting nothing
        if(me.multiSelect && (noneIdx > -1) && ($ARR.indexOf(idxs, noneIdx) > -1)) {
            return added;
        }
        
        // add ALL
        var i, len,
            items = me.items,
            idf = me.itemIdField,
            selectedItems = me.selectedItems,
            item;
        //If we selecting all
        if (me.multiSelect && (allIdx > -1) && ($ARR.indexOf(idxs, me.allIdx) > -1)) {
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
                    item = me.selectedItem = items[idx];
                    if ( selectedItems ) {
                        selectedItems[item[idf]] = item;
                    }
                }
            }
        }
        return added;
    }
        
    /*
        Removes all selectedIndices from given widget.  Raises no events. Returns an array of the
        indices that were actually removed (possibly empty).
     */ 
    function _rmvAll(/*Widget*/ me) {
        var rmv = [],
            sel = me.selectedIndices,
            selectedItems = me.selectedItems;
        for (var i in sel) {
            delete sel[i];
            rmv.push(parseInt(i, 10));    // convert string keys to integers
        }
        me.selectedIndex = -1;
        me.selectedItem = null;
        if ( selectedItems ) {
            me.selectedItems = {};
        }
        return rmv;
    }
    
    /*
        Removes the given indices from the selectedIndices of the given widget.  Raises no events. Returns an array of the
        indices that were actually removed (possibly empty).
     */ 
    function _rmv(/*Widget*/ me, /*Array*/ idxs) {
        // do we have any indexes to remove?
        if ( !idxs ) {
            return;
        }
        
        var removed = [],
            sel = me.selectedIndices,
            arrIdx = $ARR.indexOf,
            allIdx = me.allIdx,
            noneIdx = me.noneIdx,
            idf = me.itemIdField,
            selectedItems = me.selectedItems;
                
        // remove ALL
        if (me.multiSelect && (((allIdx > -1) && (arrIdx(idxs, allIdx) > -1)) || ((noneIdx > -1) && (arrIdx(idxs, noneIdx) > -1)))) {
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
                if ( selectedItems ) {
                    delete selectedItems[me.items[idx][idf]];
                }
                if (me.selectedIndex == idx) {
                    me.selectedIndex = -1;
                    me.selectedItem = null;
                }
            }
        }
        return removed;
    }
    
    /* Utility method: raises an event after the selectedIndices hash has been modified. */
    function _raise(/*Widget*/ me, /*Array?*/ added, /*Array?*/ removed) {
        if (me.raiseEvent && 
            ((added && added.length) || (removed && removed.length)) ) {
                try {
                    me.raiseEvent({
                        name: 'selectionChange',
                        added: added,
                        removed: removed
                    });
                } catch (ex) {
                    //There's been an error, undo previous action
                    _rmv(me, added);
                    _add(me, removed);
                    
                    throw ex;
                }
        }
    }

    
    function indexOf(me, item) {
        if ( item == null ) {
            return -1;
        }
        var isObject = typeof(item) == 'object',
            idf = me.itemIdField;
        if (isObject && idf != null) {
            return $ARR.find(me.items, idf, item[idf]);
        } else  {
            return $ARR.indexOf(me.items, item);
        }
    } 
    
    /**
     *  _ListSelections is a mixin to mix into Model or its subclass. 
     *  It keeps the collection of selected indices among actions.
     */    
    mstrmojo._ListSelections = {

            multiSelect: false,
            
            allIdx : -1,
            /**
             * Array of data items to be displayed. We assume the array's contents are static; to modify the displayed list,
             * the entire widget must be re-rendered.
             */
            items: null,
            /**
             * Hashtable of selected indices, possibly empty.  Key = a selected index, value[key] = true if index selected.
             */
            selectedIndices: null,
            
            /**
             * The last index that was added to the selectedIndices. If none, -1.
             */
            selectedIndex: -1,

            /**
             * Metadata for "selectedIndices" property. Identifies the event which is raised when the property value is changed.
             */
            selectedIndices_bindEvents: "selectionChange",
            selectedIndex_bindEvents: "selectionChange",
            
            /**
             * The the item at the current selectedIndex.
             */
            selectedItem: null,
            /**
             * Metadata for "selectedItem" property. Identifies the event which is raised when the property value is changed.
             */
            selectedItem_bindEvts: "selectionChange",
            

            /**
             * Indicates that the list allows adding selected items that are not currently present in the items collection.
             */
            allowUnlistedValues: true,
            
            /**
             * A collection of selected items. 
             * We need to maintain a separate collection of selected items only if the list supports incremental fetch.
             * We can support a separate collection of selected items only if items have ID field.
             */
            selectedItems: null,

            /**
             * Whether the list support incremental fetch.
             * 
             * @type Boolean
             * @default false
             */
            supportsIncFetch: false,
            
            /**
             * Extends inherited init method in order to initialize the selectedIndices collection.
             */
            init: function(/*Object?*/ props) {
                this._super(props);
                //We need to maintain a separate collection of selected items only if the list supports incremental fetch.
                //We can support a separate collection of selected items only if items have IF field.
                if ( this.supportsIncFetch && this.itemIdField ) {
                    this.selectedItems = {};
                }
                if ( ! this.items ) {
                    this.items = [];
                }
                if (!this.selectedIndices) {
                    this.selectedIndices = {};
                    if (this.selectedIndex>-1) {
                        this._set_selectedIndex("selectedIndex", this.selectedIndex, true);
                    } else if (this.selectedItem) {
                        this._set_selectedItem("selectedItem", this.selectedItem, true);
                    }
                }
            },
            
            /**
             * Adds new items to the list.
             * @param {any} items an array of items or a single item
             */
            addItems: function addItems(newItems) {
                if ( ! newItems  ) {
                    return;
                }
                if (newItems.constructor != Array) {
                    newItems = [newItems];
                }
                var items = this.items,
                    start = this.items.length,
                    selectedItems = this.selectedItems,
                    newSelected = [], // whether any newly added item should already be selected
                    end; 
                
                items = this.items = items.concat(newItems); // concat returns a new array
                end = items.length;

                //If any of added items are already selected we need to add them
                //to slectedIndexes
                if ( selectedItems ) {
                    var selectedIndices = this.selectedIndices,
                        idf = this.itemIdField,
                        i, item;
                    for ( i = start; i < items.length; i++ ) {
                        item = items[i];
                        if ( selectedItems[item[idf]] ) {
                            newSelected.push(i);
                        } 
                    }
                }
                
                if (newSelected && newSelected.length) { // selectedIndexes got update needs to notify any listener
                    _add(this, newSelected); // update selectedIndices and raise event
                }
                //Rerender
                if ( end > start) {
                    this.itemsContainerNode.innerHTML += this._buildItemsMarkup(start, end - 1).join('');
                }
            },
            
            /**
             * Adds new selected items.
             * @param {any} items an array of items or a single item
             */
            addSelectedItems: function addSelectedItems(newSelections) {
                this.selectItems(newSelections, false);
            },
            /**
             * Sets new selected items (clearing old selected items).
             * @param {any} items an array of items or a single item
             */
            setSelectedItems: function setSelectedItems(newSelections) {
                this.selectItems(newSelections, true);
            },
            
            /**
             * Selects list items.
             * @param {any} items an array of items or a single item
             * @param {boolean} clearPrevSelections if this flag is true previous selections will be
             *                                      cleared before setting new ones
             */
            selectItems: function selectItems(newSelections, clearPrevSelections) {
                if ( ! newSelections ) {
                    return;
                }
                if (newSelections.constructor != Array) {
                    newSelections = [newSelections];
                }

                var me = this;
                
                //Reset selected items
                if ( clearPrevSelections && me.selectedItems ) {
                    me.selectedItems = {};
                }
                
                var selectedItems = me.selectedItems,
                    idf = me.itemIdField,
                    item, idx, i,
                    addedItems = [], //A collection of items that must be added to the items collection
                    addedIdx = me.items.length, //An index of the last added item
                    newSelectedIndices = [], //A collection of new selected indexes
                    allowUnlistedValues = me.allowUnlistedValues;
                
                for ( i = 0; i < newSelections.length; i++ ) {
                    item = newSelections[i];
                    idx = indexOf(this, item);
                    
                    //If the item is not present in the list
                    if (idx === -1 ) {
                        //and we don't maintain a separate collection of selected items
                        if ( selectedItems === null ) {
                            //and we are allowed to add missing items to the list
                            if ( allowUnlistedValues) {
                                //Remember that we need to add this item to the list
                                addedItems.push(v);
                                idx = addedIdx++;
                            }
                        } else {
                            //If we maintain a separate list of selected items then we just
                            //add the item to it
                            selectedItems[item[idf]] = item;
                        }
                    } 
                    //If selected item is present in the items list
                    //remember it's index
                    if ( idx !== -1) {
                        newSelectedIndices.push(idx);
                    }
                }
                
                //Add items to the list if any
                if ( addedItems.length > 0 ) {
                    me.addItems(addedItems);
                }
                
                //Modify selectedIndexes
                if ( newSelectedIndices.length > 0 ) {
                    if ( clearPrevSelections ) {
                        me.select(newSelectedIndices);
                    } else {
                        me.addSelect(newSelectedIndices);
                    }
                }
            },

            unselectItems: function selectItems(items) {
                if ( ! items ) {
                    return;
                }
                if (items.constructor != Array) {
                    items = [items];
                }

                var me = this,
                    selectedItems = me.selectedItems,
                    unselectedIndices = [],
                    idf = me.itemIdField,
                    item, idx, i;
                if ( selectedItems === null ) {
                    return;
                }
                for ( i = 0; i < items.length; i++ ) {
                    item = items[i];
                    //TQMS 522453. We need to delete it from selected items here because the item
                    //may be missing from the elements list due to incremental fetch.
                    if ( selectedItems ) {
                        delete selectedItems[item[idf]];
                    }

                    idx = indexOf(this, item);
                    
                    if ( idx !== -1) {
                        unselectedIndices.push(idx);
                    }
                }
                //Modify selectedIndexes
                if ( unselectedIndices.length > 0 ) {
                    me.removeSelect(unselectedIndices);
                }
            },
            
            /**
             * Returns an array of selected items
             */
            getSelectedItems: function getSelectedItems() {
                //If we maintain a list of selected items then use it.
                //Otherwise use the selected indices
                if ( this.selectedItems != null ) {
                    return $HASH.valarray(this.selectedItems);
                } else {
                    return $ARR.get(this.items, $HASH.keyarray(this.selectedIndices, true));
                }
            },
            
            /**
             * Selects the item at the given index.
             * 
             * @param {Integer} idx The index of the item to select.
             * @param {Boolean} suppressEvt Whether to silently update the selections or not.
             * 
             */
            singleSelect: function(idx, suppressEvt){
                this.select([idx], suppressEvt);
            },
            
            /**
             * Select the item with the given value.
             * 
             * @param {String|Number} value The value to select.
             * @param {String} fieldName The name of the item field to match with the given value.
             * @param {Boolean} suppressEvt Whether to silently update the selections or not.
             */
            singleSelectByField: function singleSelectByField(value, fieldName, suppressEvt) {
                this.singleSelect($ARR.find(this.items, fieldName, value), suppressEvt);
            },
            
            /**
             * Used for CTRL+click. If the given index is selected, unselects it; otherwise, selects it.
             * Raises "selectionChange" event.
             */
            toggleSelect: function(/*Integer*/ idx) {
                var add, rmv;
                if (this.selectedIndices[idx]) { 
                    rmv = _rmv(this, [idx]);
                } else {
                    add = _add(this, [idx]);
                }
                _raise(this, add, rmv);
            },
            // shift+click
            rangeSelect: function(idx) {
                 // to do later
            },
            
            select: function (idxs, /*Boolean?*/ bSuppressEvt){
                if (idxs == null) return;
                if (idxs.constructor != Array) {
                    idxs = [idxs];
                }

                var rmv = _rmvAll(this),
                    add = _add(this, idxs),
                    i = rmv.length - 1;

                // Do we not allow reselection?
                if (this.selectionPolicy !== 'reselect') {
                    // Iterate removed.
                    for (; i >= 0 ; i--) {
                        // Is the added element in the remove collection?
                        var ind = $ARR.indexOf(add, rmv[i]);
                        if (ind > -1){ 
                            // Remove from both.
                            rmv.splice(i, 1);
                            add.splice(ind, 1);
                        }
                    }
                }
                
                // Should we NOT suppress this event?
                if (!bSuppressEvt) {
                    // Raise the event.
                    _raise(this, add, rmv);
                }
            },
            /**
             * Removes all indices from the selectedIndices collection (if any). Raises "selectionChange"
             * event if collection was modified.
             */
            clearSelect: function(/*Boolean?*/ bSuppressEvt){
                var ret = _rmvAll(this);
                if (bSuppressEvt !== true) {
                    _raise(this, null, ret);
                }
            }, 
            /**
             * Adds the given indices to the selectedIndices collection (if not already there).  Raises "selectionChange"
             * event if collection was modified.
             */
            addSelect: function(/*Array|Integer*/ idxs, /*Boolean?*/ bSuppressEvt) {
                if (idxs == null) {
                    return;
                }
                if (idxs.constructor != Array) {
                    idxs = [idxs];
                }
                var ret = _add(this, idxs);
                
                var rmv = null,
                    noneIdx = this.noneIdx;
                // check if the not select all selector is selected,  if true than remove all idxs
                if(this.multiSelect && (noneIdx > -1 && $ARR.indexOf(idxs, noneIdx) > -1)) {
                    rmv = _rmv(this,idxs);
                }
                
                if (bSuppressEvt !== true) {
                    _raise(this, ret, rmv);
                }
            },
            /**
             * Removes the given indices from the selectedIndices collection (if already there). Raises "selectionChange"
             * event if collection was modified.
             */
            removeSelect: function(/*Array|Integer*/ idxs) {
                if (idxs == null) {
                    return;
                }
                if (idxs.constructor != Array) {
                    idxs = [idxs];
                }
                 _raise(this, null, _rmv(this, idxs));
            },
            
            /**
             * Custom setter for selectedIndices. Avoids resetting the object reference, and instead updates the existing
             * hashtable and raises an event.
             */
            _set_selectedIndices: function(n, v, /*Boolean? */ bSuppressEvt) {
                var me = this, 
                    sel = me.selectedIndices;
                
                //Reset selected items collection.
                if ( me.selectedItems ) {
                    me.selectedItems = {};
                }
                var sel = me.selectedIndices;
                if (sel == v) {
                    return false;
                }

                if (!sel) {
                    sel = {};
                    me.selectedIndices = sel;
                }
                
                if (!v) {
                    v = {};
                }
                
                // Remove the current selections which are not in the new selections.
                var sidx = me.selectedIndex,
                    rmv = [],
                    idx;
                for (idx in sel) {
                    if (!v[idx]) {
                        idx = parseInt(idx,10);
                        delete sel[idx];
                        rmv.push(idx);
                        if (sidx == idx) {
                            me.selectedIndex = -1;
                            me.selectedItem = null;
                        }
                    }
                }
                // Add the new selections which are not already in the current selections.
                var add = [],
                    itms = me.items,
                    idf = me.itemIdField,
                    item;
                for (idx in v) {
                    if (!sel[idx]) {
                        idx = parseInt(idx,10);
                        sel[idx] = true;
                        add.push(idx);
                        me.selectedIndex = idx;
                        item = me.selectedItem = itms[idx];
                        if ( me.selectedItems ) {
                            me.selectedItems[item[idf]] = item;
                        }
                    }
                }
                // Raise event if collection as modified.
                if (bSuppressEvt !== true) {
                    _raise(me, add, rmv);
                }

                return (add.length || rmv.length);    // True if selections modified; false otherwise.
            },
            
            /**
             * Custom setter for selectedIndex. Leverages setter for selectedIndices to keep that property synchronized.
             */
            _set_selectedIndex: function(n, v, /*Boolean?*/ bSuppressEvt){
                var idxs = {};
                if (v >-1) {
                    idxs[v] = true;
                }
                return this._set_selectedIndices("selectedIndices", idxs, bSuppressEvt);
            },
            
            /**
             * Custom setter for selectedItem. Leverages setter for selectedIndex to keep that property synchronized.
             * Supports values which are either objects or scalars. If an object is given, and itemIdField is defined, then
             * the given item's itemIdField property is compared to the itemIdField properties
             * of the list's items. If no match is found, the selected index is set to -1 UNLESS the "allowUnlistedValues" property is true.
             * If allowUnlistedValues is true and no match is found, the given item is appended to the items list and selected.
             */
            _set_selectedItem: function(n, v, /*Boolean?*/ bSuppressEvt){
                
                // Find the index corresponding to the given item.
                var idx = indexOf(this, v);
                if ((idx === -1) && (v != null) && this.allowUnlistedValues && this.items) {
                    // We couldn't find the given item in items, but we are allowed to add it.
                    // Note: we reset the "items" array by reference, rather than appending to the
                    // existing array, because we want to raise a "itemsChange" event that will repaint the list.
                    this.set('items', this.items.concat(v));
                    idx = this.items.length - 1;
                }
                return this._set_selectedIndex("selectedIndex", idx, bSuppressEvt);
            }
            
        };
})();

