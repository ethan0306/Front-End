(function(){

    mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.array",
        "mstrmojo.registry",
        "mstrmojo.css",
        "mstrmojo.Arr",
        "mstrmojo.expr",
        "mstrmojo.Label",
        "mstrmojo.AjaxCall",
        "mstrmojo.HTMLButton", 
        "mstrmojo.Container",
        "mstrmojo._HasPopup",
        "mstrmojo.HBox",        
        "mstrmojo.Dial",
        "mstrmojo.WidgetDial",
        "mstrmojo.ValidationTextBox",
        "mstrmojo.Calendar",
        "mstrmojo.DateTextBox",
        "mstrmojo.Editor",
        "mstrmojo.ObjectBrowser",
        "mstrmojo.ElementsBrowser",
        "mstrmojo.ConditionModel"
    );
    
    var C = mstrmojo.css,
        R = mstrmojo.registry,
        H = mstrmojo.hash,
        A = mstrmojo.array,
        ARR = mstrmojo.Arr,
        E = mstrmojo.expr,
        ET = E.ET,
        DTP = E.DTP,
        D2FD = E.DTP2FN_DTP,
        ET2TGT = E.ET2TGT,
        ET2TP = E.ET2TP,
        MTP = mstrmojo.meta.TP,
        STP = mstrmojo.meta.STP,
        ENC = mstrmojo.string.encodeXMLAttribute;


    /**
     * <p>Maps expression type to walk steps that may be shown.</p>
     * @private
     */
    var ET2STEPS = {};
    ET2STEPS[ET.AQ] = {target: 1, fm: 1, fn: 1, c0: 1, c1: 1};
    ET2STEPS[ET.AL] = {target: 1, fm: 1, fn: 1, c0: 1};    
    ET2STEPS[ET.AE] = {target: 1, fm: 1, es: 1};
    ET2STEPS[ET.AC] = {target: 1, fm: 1, fm2: 1, fm3: 1, fn: 1, c0: 1, c1: 1};
    ET2STEPS[ET.MQ] = {target: 1, fn: 1, c0: 1, c1: 1, dmy: 1};
    // TO DO: for metric comparison, should we use a different set of walk steps?
    ET2STEPS[ET.MC] = ET2STEPS[ET.MQ];
    // For others (e.g., embedded object), show only target.
    ET2STEPS['*'] = {target: 1};

    /**
     * <p>Maps expression type to a ConditionWalk property that enumerates the allowed functions.</p>
     * @private
     */
    var ET2FNS = {};
    ET2FNS[ET.MQ] = {key: 'metricFns', def: E.METRIC_FNS};
    ET2FNS[ET.MC] = {key: 'metricFns', def: E.METRIC_FNS};
    ET2FNS[ET.AQ] = {key: 'formFns', def: E.FORM_FNS};
    ET2FNS[ET.AL] = {key: 'formFns', def: E.FORM_FNS};    
    ET2FNS[ET.AC] = {key: 'formFns', def: E.FORM_FNS};
    ET2FNS[ET.AE] = {key: 'elemFns', def: E.ELEM_FNS};

    var BrwsTxt = {};
    BrwsTxt[ET.AQ] = mstrmojo.desc(7925,'Select Attribute...');
    BrwsTxt[ET.AL] = mstrmojo.desc(7926,'Browse...');
    BrwsTxt[ET.MQ] = mstrmojo.desc(7927,'Select Metric...');
    BrwsTxt[ET.MC] = mstrmojo.desc(7927,'Select Metric...');
    BrwsTxt[ET.AC] = mstrmojo.desc(7925,'Select Attribute...');
    /**
     * <p>Toggles the display of the slot node containing a given walk step.</p>
     * @param {mstrmojo.ConditionWalk} w The ConditionWalk widget.
     * @param {String} s Name of slot in the ConditionWalk.
     * @param {Boolean} show If true, the widget's slot node is shown; otherwise it is hidden.
     * @private
     */
    function _toggleSlot(w, s, show){
        //C.toggleClass(w[s], ['hidden'], !show);
        var sty = w[s].style;
        if (mstrmojo.dom.isFF) {
             // Hack: In Firefox, using style.display causes big ugly flashing. Don't know why. As a workaround for FF,
             // we keep the display always shown, but toggle the width and visibility of the wrapper div (via CSS). This
             // trick works but requires that the overflow be set to 'hidden' at all times.
            sty.overflow = 'hidden';
            sty.width = show ? 'auto' : '0px';
            sty.visibility = show ? 'inherit': 'hidden';
        } else {
            sty.display = show ? 'block' : 'none';        
        }
    }

    /**
     * Loops thru the walk's children which have isStep == true, and asks determines whether each
     * such child might be displayed for the current expression type.  If not, the child's slot is
     * hidden; otherwise, its slot is shown and the child's update() method is called.  Skips over
     * children for whom isStep is not true.
     * @param {mstrmojo.ConditionWalk} me The walk whose children are to be inspected.
     */
    function _initSteps(me){
        var m = me.model,
            et = m && m.et,
            steps = ET2STEPS[et] || ET2STEPS['*'],
            ch = me.children;

        // Initialize each walk step's display.
        for (var i=0, len=ch.length; i<len; ++i){
            var c = ch[i];
            if (!c.isStep) {
                continue;
            }
            var a = c.alias,
                shw = steps[a];
            //me[a+'Node'].style.display = shw ? C.DISPLAY_CELL : 'none';
            _toggleSlot(me, c.slot, shw);
            if (shw && c && c.update) {
                c.update();
            }
        }
        // Minor hack: Also hide the between text node if we hide the 2nd constant, which is
        // not a child, just a slot node.  If we didn't hide the 2nd constant above, the btwnNode show/hide 
        // will be handled in that constant widget's update call.
        if (!steps.c1) {
            _toggleSlot(me, 'btwnNode', false);
        }
        // Minor hack: Also hide the at text node if we hide the metric dimensionality, which is
        // not a child, just a slot node.  If we didn't hide the metric dmy above, the atNode show/hide 
        // will be handled in that dmy widget's update call.
        if (!steps.dmy) {
            _toggleSlot(me, 'atNode', false);
        }
        
        // update OK button
        _updateOkBtn(me);
    }
    
    /**
     * <p>postCreate function used by Walk's children.</p>
     * <p>Used by Walk's children to copy Walk's height.  The children Dials
     * use a center() method that relies on the height being specified in a Dial property,
     * rather than a CSS rule.</p>
     * @private
     */
    function _pc(){
        // Copy height from walk. The Dial's center method
        // will work if it can read the height from a widget property, not CSS rules.
        var p = this.parent,
            h = ((p && p.cssText)||'').match(/height:\s*(\d*)px/);
        this.cssText = h && h[0];  
    }
    
    /**
     * An artificial list item which represents a "Browse" GUI option that the end-user can select in order
     * to do object browsing (e.g., for choosing a target attribute/metric).  We assign all of these a dummy "tp"
     * value so they can be detected later.
     */
    var _dummyTp = "dummy",
        _browseItem = {did: "idBrowse", v: "idBrowse", n: mstrmojo.desc(6571,"Browse..."), t: _dummyTp, css: "unselectable link"},  // renamed "tp" to "t"; assumes mstrmojo.meta.TP is "tp"
        _errItem = {did: "idErr", v: "idErr", n: mstrmojo.desc(7929,"Error loading data."), t: _dummyTp, css: "unselectable"},
        _waitItem = {did: "idWait", v: "idWait", n: mstrmojo.desc(2901,"Loading..."), t: _dummyTp, css: "unselectable"};
    
    /**
     * <p>onchange handler used by Walk's children.</p>
     * <p>Note: in this handler, "this" is assumed to the walk child!</p>
     * <p>Asks the walk to update its model according to the new selection in a Dial.  If
     * the new selection is the "Browse..." item, it is handled differently: the model is
     * not updated, and instead a browse GUI is shown.</p>
     * @param {Object} evt The onchange event object.
     * @private
     */
    function _onchg(evt){
        if (this.updating) {
            return;
        }
        // Was a dummy item selected?
        var ms = this.multiSelect,
            it = this.selectedItem;
        if (it && it[MTP] === _dummyTp) {      // renamed "tp" to "t"
            // Dummy items are not selectable.  Undo this change.
            this.updating = true;
            if (ms) {
                this.removeSelect([this.selectedIndex]);
            } else {
                var idx = evt && evt.removed && Number(evt.removed[0]);
                idx = (idx == null) ? -1: idx;
                this.set("selectedIndex", idx);
            }
            this.updating = false;
            // Now respond with some action if appropriate.
            if (it === _browseItem) {
                // Launch the browse GUI.
                this.parent.browse(this);
            }
        } else {
            // Valid item was selected. Update the model.
            var m = this.parent.model;
            if (ms) {
                var its = this.items;
                m.edit(this.alias,
                    {
                        added: evt.added && A.get(its, evt.added),
                        removed: evt.removed && A.get(its, evt.removed),
                        itemIdField: this.itemIdField
                    });
            } else {
                m.edit(this.alias, it);
            }
        }        
    }

    /**
     * Replaces a given item in a given list widget with an array of items.  If the array is omitted,
     * removes the item.  Typically used to replace a "Loading..." item with ajax results.
     * @param {mstrmojo.Widget} w The widget whose items are to be changed.
     * @param {Array} [arr] An array of items to be inserted (possibly null or empty).
     */
    function _replaceItem(w, item, arr){
        var its = w.items,
            idx = A.indexOf(its, item);
        
        if ((idx === 0) && (its.length === 1)) {
            // If the items array was formerly empty (just a wait item), reset the items
            // entirely rather than append to the list. This has 3 benefits: (1) it triggers
            // the itemsEffect animation (if any); (2) it renders faster; and (3) it re-centers a Dial widget.
            // Use an observable copy of the ajax result.
            arr = mstrmojo.Arr.makeObservable(
                    (arr && arr.length) ? arr.concat() : []
                );
            w.set("items", arr);
        } else {
            // Append the results to the existing list.
            if (idx >-1) {
                its.remove(idx, 1);
            }
            if (arr && arr.length) {
                its.add(arr, (idx>-1)? idx: null);    
            }
        }
    }
    
    /**
     * Helper function generates JSON for walk's step children (typically, Dial instances).
     * @param {Object} ps Hash of non-default property values.
     * @private
     */    
    function _chJson(ps){
        return H.copy(
                    ps, 
                    {
                        scriptClass: "mstrmojo.Dial",
                        slot: ps.alias+"Node",
                        isStep: true,
                        cssClass: "mstrmojo-walkstep mstrmojo-" + ps.alias,
                        itemIdField: "did",
                        itemMarkupFunction: function(item, idx, widget) {
                    var n = ENC(item.n);
                    return '<div class="dial-item ' + item.css + '" title="' + n + '">' + n + '</div>';
                    },
                        allowUnlistedValues: true,
                        insertUnlistedValuesAt: 0,
                        onchange: _onchg,
                        postCreate: _pc
                    });
    }

    /**
     * <p>itemFunction used by Walk's children.</p>
     * <p>Used by Walk's WidgetDial children to generate generic item widgets.
     * Assumes the item has a "cfg" property set to JSON that defines a Mojo widget.
     * For example, used in WidgetDial for constants to generate textbox item widgets.</p>
     * @param {Object} item The list item for which we are creating a widget.
     * @param {Integer} idx The list item index.
     * @param {mstrmojo.Widget} The list widget.
     * @returns {mstrmojo.Widget} A widget instance specified by the item's "cfg" property.
     * @private
     */
    function _widgetItemFn(item, idx, widget) {
        var c = item.cfg;
        if (c) {
            c.data = item;
            c.parent = widget;
            return R.ref(c);
        } else {    // a regular item
            c = new mstrmojo.Label({text: item.n, cssClass: 'dial-item'});
            c.markupMethods.onselectedChange = function() {
                mstrmojo.css.toggleClass(this.domNode, ['selected'], this.selected);
            };
            c.data = item;
            c.parent = widget;
            return c;
        }
    }

    /**
     * Utility to create a function (operator) list item from a given function id and type.
     * @private
     */
    function fnItem(fn, fnt) {
        var d = fnt + E.FN_SEP + fn;
        return (fn != null) ?    // fn is not null and not undefined
                {did: d, n: d} 
                : null;
    }
    
    /**
     * Attach listener to a model.
     * If model is not observable, it is made observable.
     * @param {mstrmojo.ConditionWalk} me The walk.
     * @param {mstrmojo.ConditionModel} m The model.
     * @private
     */
    function _attachModel(me, m){
        if (m) {
            if (!m.attachEventListener) {
                mstrmojo.requiresCls("mstrmojo.ConditionModel");
                mstrmojo.hash.make(m, mstrmojo.ConditionModel, {});
            }
            m.attachEventListener("edit", me.id, "onmodeledit");
        }
    }

    /**
     * Builds a list of available dimensionality options for metric quals/comparisons.
     * Finds all the attribute objects from the walk's targets array.
     * @private
     */
    function _initDmys(me){
        var AT = E.TP.ATTR,
            atts = me.targets ?
                        A.filter(
                            me.targets,  
                            function(item){ return item[MTP] === AT; } // renamed "tp" to "t"
                        ) :
                        [];
                        
        return atts; // E.DIMTYLEVELS.concat(atts); For CG, default dimty levels are not applicable.
    }

    /**
     * Detach listener from a previous model.
     * Used when switching models.
     * @param {mstrmojo.ConditionWalk} me The walk.
     * @param {mstrmojo.ConditionModel} m The model.
     * @private
     */
    function _detachModel(me, m) {
        if (m && m.detachEventListener) {
            m.detachEventListener("edit", me.id, "onmodeledit");
        }
    }
    
    /**
     * Updates the visibility, items and selection of a given walk child list.
     * @param {mstrmojo.Widget} w The list widget to be updated.
     * @param {Boolean} show If true, the widget is shown and its items + selection are updated;
     * otherwise, the widget's corresponding slot node is hidden.
     * @param {Array} items A new set of items to be set on the widget. If null,
     * the widget's items are left unchanged. (To clear items, use an empty array.)
     * @param {Object} sel The item to set as the current selection.
     */
    function _updateList(w, show, items, sel) {
        w.updating = true;

        _toggleSlot(w.parent, w.slot, show);

        if (show) {
            if (items != null) {
                /*
                // Performance optimization: if we're going to reset the items anyway,
                // do it first before clearing selections, to reduce # of DOM repaints.
                w.set("items", []);
                */
                w.clearSelect();
                w.set("items", items);
            }
            var f = w.itemIdField,
                vWas = w.selectedItem;
            if ((vWas && vWas[f]) != (sel && sel[f])) {
                w.set("selectedItem", sel);
            } else {
                // Force a re-center because sometimes browser quirks cause
                // unexpected scrolling when toggling a widget back to visible.
                w.center();
            }
        }

        w.updating = false;
    }

    /**
     * Updates the items and selection of a given multi-select walk child list.
     * @param {mstrmojo.Widget} w The list widget to be updated.
     * @param {Array} items A new set of items to be set on the widget. If null,
     * the widget's items are left unchanged. (To clear items, use an empty array.)
     * @param {Array} [sel] The items to set as the current selection. If missing, the idxs param is used.
     * @param {Array} [idxs] The indices to set as the current selection. If missing, the selections are cleared.
     */
    function _updateListMultiData(w, items, sel, idxs) {
        w.updating = true;
        
        if (items != null) {
            /*
            // Performance optimization: if we're going to reset the items anyway,
            // do it first before clearing selections, to reduce # of DOM repaints.
            w.set("items", []);
            */
        }
        // Clear the selections.
        w.clearSelect();
        // Reset the items (unless items is null, which means leave them unchanged).
        if (items) {
            w.set("items", items);
        }
        // Set the new selections (if any).
        if (sel && sel.length) {
            w.setSelectedItems(sel);
        } else if (idxs && idxs.length) {
            w.select(idxs);
        } else {
            // Force a re-center because sometimes browser quirks cause
            // unexpected scrolling when toggling a widget back to visible.
            w.center();
        }
        
        w.updating = false;
    }
    
    /**
     * Updates the visibility, items and selection of a given multi-select walk child list.
     * @param {mstrmojo.Widget} w The list widget to be updated.
     * @param {Boolean} show If true, the widget is shown and its items + selection are updated;
     * otherwise, the widget's corresponding slot node is hidden.
     * @param {Array} items A new set of items to be set on the widget. If null,
     * the widget's items are left unchanged. (To clear items, use an empty array.)
     * @param {Array} [sel] The items to set as the current selection. If missing, the idxs param is used.
     * @param {Array} [idxs] The indices to set as the current selection. If missing, the selections are cleared.
     */
    function _updateListMulti(w, show, items, sel, idxs) {
        _toggleSlot(w.parent, w.slot, show);
        if (show) {        
            _updateListMultiData(w, items, sel, idxs);
        }
    }

    /**
     * Determines whether a given constant step should be shown.
     * @param {mstrmojo.ConditionWalk} w The walk.
     * @param {Integer} idx The index of the constant (0 or 1).
     * @private
     */    
    function _shouldShowCst(w, idx) {
        var m = w.model || {},
            fn = m.fn;
        return  (fn != null)        // fn is not null and not undefined
        && ((m.et === ET.MQ) || (m.et === ET.MC) || (m.et === ET.AQ) || (m.et === ET.AL) || (m.et === ET.AC)) // metric qual/comp or form qual, TO DO: add form comparison
        && (E.fnCstCount(fn, m.fnt) > idx);       // fn requires this many constants
    }
    
    /**
     * Collection of DTP values which are considered "date" types for our calendar widget.
     * @private
     */
    var isDATE = {};
    isDATE[DTP.DATE] = 1;
    isDATE[DTP.TIME] = 1;
    isDATE[DTP.TIMESTAMP] = 1;
    var $f = mstrmojo.array.find;
    function _missed(arr1, arr2, p) {
        var m = [], len = arr1.length;
        for (var i = 0; i < len; i ++) {
            if ($f(arr2, p, arr1[i][p]) < 0) {
                m.push(arr1[i]);
            }
        }
        return m;
    }
    function _updateCstList(me, p, show){
        // update list by adding/removing items
        // For items: the options are derived from the walk's targets list. 
        // Check to see when our parent's targets list was last modified.
        var lim = me.targetsLastMod,
            plim = p.targetsLastMod,
            m = p.model,
            ltid = me._lastTargetId,
            idf = p.target.itemIdField,
            tid = m && m[ET2TGT[m.et]] && m[ET2TGT[m.et]][idf],
            tfm = m && m.fm, // target form
            dtp = tfm && tfm.dtp, // if form datatype changed, need to re-filter the prompts
            fnc = E.fn_AC_MC(m && m.fn),
            dirty = false;
        // if target list has been changed or target has been changed
        if (!lim || !plim || (lim != plim) || ltid !== tid) {
            // Our list is out-of-date; update it now.
            me.targetsLastMod = p.targetsLastMod;
            dirty = true;
        } else if (this.lastFmDtp !== dtp){ // if form data type has been changed, we need to update the list
            this.lastFmDtp = dtp;
            dirty = true;
        } else if (this.lastFnTp !== fnc){
            this.lastFnTp = fnc;
            dirty = true;
        }
        
        if (dirty) { 
            if(!fnc){//if function not for AC and MC comparison, remove all attributes/metrics
                me.clearSelect();
                me.set("items", me.items.slice(0,me.preLen));
            } else {
                var ok = _okCstTypes(m);
                var fil = p.targets ?
                        A.filter(
                                p.targets,  
                                function(item){
                                    return ok[item[MTP]] || ok[item[STP]]; } 
                            ) :
                            []; 
                var slice = me.items.slice(me.preLen),
                    f = me.itemIdField,
                    removed = _missed(slice, fil, f),
                    added = _missed(fil, slice, f);
                for (var i = 0, len = removed && removed.length || 0 ; i < len; i ++) {
                      me.remove(removed[i]);
                }
                if (added && added.length > 0) {
                    me.add(added, -1);
                }
            }
            
            me._lastTargetId = tid;
        }        
    }
    /**
     * Updates the visibility, items and selection of a constant step.
     * @param {mstrmojo.Widget} me The step widget.
     * @param {Integer} idx The index of the corresponding constant (0 or 1).
     */
    function _updateCst(me, idx){
        me.updating = true;
        
        // Visibility:
        var p = me.parent,
            show = _shouldShowCst(p, idx),
            sel;

        _toggleSlot(me.parent, me.slot, show);

        if (show) {
            // Read the current const (if any) from the model. 
            var m = p.model || {},
                cs = m.cs,
                c = cs && cs[idx],
                v = c && c.v,
                dtp;

            _updateCstList(me, p, show);
            
            
            // Determine what data type we should allow for input.  Ignore the data type of the model's
            // current const node, and instead use the data type of the target metric or form.
            switch(m.et){
                case ET.MQ:
                case ET.MC:
                    // Use the default metric data type for all metrics.
                    dtp = E.METRIC_DTP;
                    break;
                case ET.AQ:                  
                case ET.AC:
                case ET.AE:
                    dtp = m.fm && m.fm.dtp;
                    break;
                case ET.AL:  
                    dtp = m.fm && m.fm.dtp; 
                    v = [];                    
                    for(var i=0,len=cs&&cs.length;i<len;i++){
                        v.push(cs[i].v);
                    }
                    v = v.join(mstrConfig.listSep);                    
                    break;
            }
            // If dtp could not be determined, use a default (string, because that allows free input).
            dtp = dtp || DTP.CHAR;
            
            // Items: leave them unchanged.
            // Selection: Mark the calendar item as selected if we are qualifying a date type and not a list
            // of values; otherwise mark the textbox item as selected.
            var isLF = E.fn_List(m.fn,m.fnt),
                isD = isDATE[dtp],
                isC = isD && !isLF;
        
            // Before updating the dial's selected index, update the textbox and calendar inside the dial.
            // For performance, dont just reset its items; that will destroy & re-create the
            // widgets representing those items.  Instead, just find the items and update them.
            var cx = me.ctxtBuilder,
                iws = cx && cx.itemWidgets,
                si = isD ? (isC ? me.calIndex : me.dtxtIndex) : me.txtIndex,
                ib = iws && iws[me.bwIndex],
                iw;
                  
           
            for(var i =0, len = me.preLen -1;i<len;i++){
                iw = iws[i];
                if(i == si){                   
                    iw.set("dtp", dtp);
                    iw.set("isList", isLF);                
                    iw.set("value", v);
                    iw.set('visible',true); 
                    try {
                        iw.focus && iw.focus(); //TQMS 421234: IE would not fire onkeyup if not focused first. 
                    } catch(x) {}
                    
                    //clear validation status so that there is no annoying validation error                     
                    if(iw.clearValidation) {
                        iw.clearValidation(); 
                    }                     
                } else {
                    iw.set('visible',false);
                }
                
                if(isLF){
                    iw.set('tooltip', mstrmojo.desc(8191, 'value1## value2## ...## valueN').replace(/##/g,mstrApp.listSep));
                } else {
                    iw.set('tooltip', '');
                }
            }
            
            // toggle "Browse..." label
            if (ib) {
                ib.set('text', BrwsTxt[m.et]);
                ib.set('visible', E.fn_AC_MC(m && m.fn));
            }
            switch(m.et){
            case ET.AQ:
            case ET.AL:                
            case ET.MQ:
                if (c && c.p) {
                    me.set("selectedItem", c.p);
                } else {
                    me.set('selectedIndex', si);
                }
                break;
            case ET.MC:
            case ET.AC:
                me.set("selectedItem", m[ET2TGT[m.et] + (2 + idx)]);
                break;
            }
        }
        
        // Also toggle the between text node.
        _toggleSlot(p, 'btwnNode', show);
        
        me.refreshScroll();
        
        me.updating = false;
    }
    
    /**
     * Helper function used as the onvalueChange handler for textbox and calendar.
     * @private
     */
    function _onCstChg(evt){
        var d = this.parent, 
            w = d.parent, 
            v = (this.isValid && this.isValid()) || (!this.isValid && !mstrmojo.string.isEmpty(this.value)), //calendar can not have null value
            m = w.model;
        
        w['invalid' + d.cstIndex] = !v; 
        
        //TO-DO: why do we need this.updating
        if (!this.updating && v) {
            this.updating = true;
            if(m){
                m.edit(d.alias, {v: this.value, dtp: this.dtp});
            }
            this.updating = false;
        }
        
        //always refresh the button no matter it is valid or invalid
        _updateOkBtn(w);
    }
    
    /**
     * Helper function to decide whether to enable/disable OK button. 
     */
    function _updateOkBtn(me){
        var valid = true,
            m = me.model;
        if(!m) return;
        switch(m.et){
            case ET.AQ:
            case ET.AL:                
            case ET.MQ:  
              for(var i=0,ct=E.fnCstCount(m.fn, m.fnt);i<ct;i++){
              valid = valid && !me['invalid' + i];
              }
              break;
        }
        valid = valid && !!m.completed;
        me.okBtn.set('enabled', valid);
        return;    
    }
    
    function _clearInvalid(){
        var d = this.parent, 
        w = d.parent;
        w['invalid' + d.cstIndex] = false; 
    }
    
    /**
     * Helper function generates JSON for walk's WidgetDial children.
     * @param {Object} ps Hash of non-default property values.
     * @private
     */    
    function _cstJson(ps){
        return _chJson(
            H.copy(ps,{
                    scriptClass: "mstrmojo.WidgetDial",
                    makeObservable: true,
                    itemFunction: _widgetItemFn,       
                    selectionPolicy: 'reselect',
                    items: [
                        {did: 0, cfg: {
                            scriptClass: "mstrmojo.ValidationTextBox", 
                            required:true,
                            constraints: {trigger:mstrmojo.validation.TRIGGER.ALL}, //need to validate when a value is set.
                            onValid: _onCstChg,
                            onInvalid: _onCstChg, 
                            onClearValidation: _clearInvalid,
                            size: 6, 
                            cssText: 'text-align:right',                            
                            visible: false  // to avoid a flash during initial display of date editing
                        }},
                        {did: 1, cfg: {
                            scriptClass: "mstrmojo.Calendar",
                            onvalueChange: _onCstChg, 
                            visible: false  // to avoid a flash during initial display of non-date editing
                        }},
                        {did: 2, cfg: {
                            scriptClass: "mstrmojo.DateTextBox",
                            required:true,
                            constraints: {trigger:mstrmojo.validation.TRIGGER.ALL}, //need to validate when a value is set.                               
                            onValid:_onCstChg, 
                            onInvalid: _onCstChg,  
                            onClearValidation: _clearInvalid,
                            calendarToBody: true,
                            calConfig: {
                                onmousedown: function(evt){                                  
                                    mstrmojo.dom.stopPropogation(evt.hWin,evt.e);  //stop event bubbling, so that editor would not close itself
                                }
                            },
                            visible: false  // to avoid a flash during initial display of non-date editing
                        }},                        
                        {did: 3, t: _dummyTp, cfg: {
                            scriptClass: "mstrmojo.Label",
                            cssClass: 'dial-item link',
                            text: 'Browse...',
                            onclick: function() {
                                this.parent.parent.browse(this.parent);
                            }, 
                            visible: false
                        }}
                    ],
                    txtIndex: 0,    // Record the index of the textbox for future reference when updating it.
                    calIndex: 1,
                    dtxtIndex: 2,
                    bwIndex: 3,
                    preLen: 4,
                    insertUnlistedValuesAt: -1,   // Append at bottom.
                    update: function(){
                        _updateCst(this, this.cstIndex);
                    }
                })
        );
    }
    function _fmJson(ps) {
        return _chJson(
                H.copy(ps, {
                insertUnlistedValuesAt: -1,
                postCreate: function(){
                    _pc.apply(this, []);
                    this.ajx = mstrmojo.insert({
                                parent: this,
                                scriptClass: "mstrmojo.AjaxCall",
                                isTask: true,
                                readCache: true,
                                writeCache: true,
                                params: {
                                    taskId: "getAttributeForms",
                                    attributeId: null,
                                    displayedForms: "0",    // all forms
                                    styleName: "MojoAttributeStyle"
                                },
                                onsuccess: function(){
                                    var p = this.parent,
                                        m = p && p.parent && p.parent.model,
                                        rs = this.response;
                                    // Validate that response matches request. Response maybe an outdated 
                                    // request that wasn't cancelled; if so, ignore it.
                                    if ((rs && rs.did) !== p.lastAttrId) {
                                        return;
                                    }
                                    
                                    // Make a copy of the response, and remove the current selection (if any)
                                    // from it so it doesn't appear twice in the list.
                                    var fms = rs.fms || [],
                                        sel = p.selectedItem;
                                    
                                    //filter out compound forms
                                    fms = A.filter(fms, function(item){
                                        return (!item.icf);
                                    });
                                    
                                    if (sel) {
                                        var idx = A.find(fms, p.itemIdField, sel[p.itemIdField]);
                                        if (idx>-1){
                                            fms = fms.concat();
                                            fms.splice(idx, 1);
                                        }
                                    }
                                    _replaceItem(p, _waitItem, fms);
                                    
                                    var its = p.items,
                                        len = its.length;
                                    if(len === 1){//preselect it if only one item
                                        p.singleSelect(0);
                                    }
                                },
                                onerr: function(){
                                    _replaceItem(this.parent, _waitItem, [_errItem]);
                                }
                            });
                },
                update: function(){
                    // Updates the visibility, items and selection.
                    // For visibility: only show if we have a target attribute.
                    var pstf = this.fmPost,
                        p = this.parent,
                        m = p.model,
                        t = m && m['a' + pstf],
                        show = !!t,
                        fms,
                        fm,
                        tfm = m && m.tfm, // target form
                        dtp = tfm && tfm.dtp, // dtp need to match for 'fm2', 'fm3'
                        ajx;
                    if (show) {
                        // For selection: read the current form or elem function.
                        switch(m.et) {
                            case ET.AQ:
                            case ET.AL:                                
                                fm = m.fm;
                                break;
                            case ET.AC:
                                fm = m['fm' + pstf];
                                break;
                            case ET.AE:
                                fm = fnItem(m.fn, 1);
                                break;
                        }
                        // For items: Dont update the items if the attribute hasn't
                        // changed since our last update.
                        // but for form2 and form3, since we are going to do filtering, we need to get the full list again
                        // ajax call should hit the cache
                        if (this.lastAttrId !== t.did) {
                            this.lastAttrId = t.did;
                            fms = [];
                            if (m.et !== ET.AC) {
                                // If elem lists are allowed, add elem functions.
                                if (!t.ilk && (!p.ets || p.ets[ET.AE])) {
                                    // Elem lists are allowed.
                                    var lookin = ET2FNS[ET.AE],
                                        key = lookin && lookin.key;
                                    fms = fms.concat((key && p[key]) || lookin.def || []);
                                }
                            }
                            
                            // Append the current form selected in the model. If the current selection
                            // is one of the elem fns above, don't insert the fn again.
                            if (fm && (m.et !== ET.AE)){
                                fms.push(fm);
                            }
                            // Append the current attr target's forms.
                            // Use ajax to fetch these, and show a loading item in the meanwhile.
                            ajx = this.ajx;
                            ajx.params.attributeId = t.did;
                            fms.push(_waitItem);
                            // Make the items array observable so we can add forms when they're ready.
                            ARR.makeObservable(fms);
                        }
                    }                        
                    // Update the GUI.                            
                    _updateList(this, show, fms, fm);
                    // Fire the task call if needed.
                    if (show && ajx) {
                        // Use a delay to allow the itemsEffect & scrollEffect to render smoothly first.
                        // Otherwise, the ajax dispatch & response handling slows down the animation.
                        if (ajx._delayId) {
                            // If a previous ajax call is still pending, cancel it.
                            window.clearTimeout(ajx._delayId);
                            delete ajx._delayId;
                        }
                        ajx._delayId = window.setTimeout(
                            function(){
                                delete ajx._delayId;
                                ajx.send();
                            },
                            500
                        );
                    }
                }
                
            }));
    }
    var TGT_PPT_STP = [E.STP.PROMPT, E.STP.PROMPT_OBJECTS, E.STP.PROMPT_ELEMENTS, E.STP.PROMPT_EXPRESSION, E.STP.PROMPT_EXPRESSION_DRAFT];
    /**
     * <p>Helper function that returns a hash of all allowed object types for condition targets.</p>
     * @param {Array} [ets] Array of allowed expression types. If missing, all expression types are assumed.
     * @return {Object} Hashtable keyed by object type (hash values are all true).
     * @private
     */
    function _okTargetTps(ets){
        var l = ets && ets.length;
        if (l){
            // certain non-value prompt types are also valid target
            var ok = A.hash(TGT_PPT_STP);
            for (var i=0; i<l; i++) {
                ok[ET2TP[ets[i]]] = true;
            }
            return ok;
        }
        return null;
    }
    function _okCstTypes(m){
        var tp = m && ET2TP[m.et],
            dtp = m && m.fm && m.fm.dtp,
            stp = dtp && E.DTP2PROMPT_STP[dtp],
            ok = {};
        // type same the target
        ok[tp] = true;  
        // prompt whose data type is the same as current form data type
        if(stp) {
            ok[stp] = true;
        }
        return ok;
        
    }
    
   /**
     * Helper function for launching the elements browser from a given walk step.
     * @param {mstrmojo.ConditionWalk} me The walk widget.
     * @param {mstrmojo.Widget} ch The walk step widget from which the elements browser was launched.
     * @private
     */            
    function _browseEs(me, ch, p){
        me.openPopup('eb',{zIndex: me.parent.zIndex + 10, left: Math.round(p.x) + "px", top: Math.round(p.y) + "px"});        
        var eb = me.eb.browser,
            m = me.model,
            aid = m && m.a && m.a.did;
        if (!aid){  
            return; 
        }
        eb.set("attributeID", aid);
        eb.set("selectedItems", m.es ? H.clone(m.es) : []);
        eb.initBrowser();
    }

    /**
     * Helper function for launching the object browser from a given walk step.
     * @param {mstrmojo.ConditionWalk} me The walk widget.
     * @param {mstrmojo.Widget} ch The walk step widget from which the obj browser was launched.
     * @private
     */            
    function _browseObjs(me, ch, p){
        
        me.openPopup('ob',{zIndex: me.parent.zIndex + 10, left: Math.round(p.x) + "px", top: Math.round(p.y) + "px"});
 
        var ob = me.ob.browser;

        // Record a handle back to the walk step on the ob (for callback use).
        ob.target = ch;
        
        // Tell the obj browser to start browsing: what folder and what object types.
        var tps;
        switch (ch.alias) {
        case 'dmy':
            // When browsing metric dimensionality, only dimensions and attributes are acceptable.
            tps = [E.TP.ATTR, E.TP.DIM];
            break;
        case 'c0':
        case 'c1':
            // which kind of prompt can be browsed?
            var m = me.model,
                et = m && m.et,
                fm = m && m.fm,
                dtp = fm && fm.dtp || (m.m? E.DTP.DECIMAL : E.DTP.UNKNOWN);
            tps = (et === ET.MQ || et === ET.MC)? [E.TP.METRIC, E.DTP2PROMPT_STP[dtp]]: [E.TP.ATTR, E.DTP2PROMPT_STP[dtp]] ;
            break;
        default:
            // For browsing targets, limit the objects according to the walk's list of available expression types.
            // If the expressions types list is empty, assume a default set of objects.
            tps = _okTargetTps(me.ets);
            tps = tps ? H.keyarray(tps, true) : [E.TP.ATTR, E.TP.METRIC, E.STP.REPORT_GRID, E.STP.REPORT_GRAPH, E.STP.REPORT_ENGINE, E.STP.REPORT_TEXT, E.STP.REPORT_DATAMART, E.STP.REPORT_BASE, E.STP.REPORT_GRIDGRAPH, E.STP.REPORT_NONINTERACTIVE, E.STP.FILTER].concat(TGT_PPT_STP);
        }
        
        //Add the folder as a browseable type
        tps[tps.length] = E.TP.FOLDER;
        
        ob.browse({
            folderLinksContextId : m && (m.et === ET.MQ || m.et === ET.MC) ? 27 : 23,      // check folderLinks.xml for more info about this objBrowser context
            onSelectCB: [me, 'onOBSelect'],
            browsableTypes: tps.join(',')
        });
    }
            
    mstrmojo.ConditionWalk = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        // mixins
        [mstrmojo._HasPopup],
        /**
         * @lends mstrmojo.ConditionWalk.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.ConditionWalk",
            
            
            /**
             * @ignore
             */
            markupString: '<table id="{@id}" class="mstrmojo-walk mstrmojo-ConditionWalk {@cssClass}" style="{@cssText}" cellspacing="0" cellpadding="0" mstrAttach:click>'
                + '<tr>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-notNode"><div class="mstrmojo-walkstep-wrapper"></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-targetNode"><div class="mstrmojo-walkstep-wrapper"><div class="mstrmojo-walkstep-browse">' + mstrmojo.desc(7926,'Browse...') + '</div></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-fmNode"><div class="mstrmojo-walkstep-wrapper"></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-esNode"><div class="mstrmojo-walkstep-wrapper"><div class="mstrmojo-walkstep-browse">' +  mstrmojo.desc(7928,'Browse elements...') + '</div></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-fnNode"><div class="mstrmojo-walkstep-wrapper"></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-c0Node"><div class="mstrmojo-walkstep-wrapper"></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-fm2Node"><div class="mstrmojo-walkstep-wrapper"></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-btwnNode"><div class="mstrmojo-walkstep-wrapper">{@betweenText}</div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-c1Node"><div class="mstrmojo-walkstep-wrapper"></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-fm3Node"><div class="mstrmojo-walkstep-wrapper"></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-atNode"><div class="mstrmojo-walkstep-wrapper">{@atText}</div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-dmyNode"><div class="mstrmojo-walkstep-wrapper"><div class="mstrmojo-walkstep-browse">' + mstrmojo.desc(7925,'Select Attribute...') + '</div></div></td>'
                    + '<td class="mstrmojo-walkcell mstrmojo-ConditionWalk-okNode"><div class="mstrmojo-walkstep-wrapper"><div></div></td>'
                + '</tr>'
                + '</table>',
            
            /**
             * @ignore
             */
            markupSlots: {
                notNode: function(){return this.domNode.rows[0].cells[0].firstChild;},
                targetNode: function(){return this.domNode.rows[0].cells[1].firstChild;},
                fmNode: function(){return this.domNode.rows[0].cells[2].firstChild;},
                esNode: function(){return this.domNode.rows[0].cells[3].firstChild;},
                fnNode: function(){return this.domNode.rows[0].cells[4].firstChild;},
                c0Node: function(){return this.domNode.rows[0].cells[5].firstChild;},
                fm2Node: function(){return this.domNode.rows[0].cells[6].firstChild;},
                btwnNode: function(){return this.domNode.rows[0].cells[7].firstChild;},
                c1Node: function(){return this.domNode.rows[0].cells[8].firstChild;},
                fm3Node: function(){return this.domNode.rows[0].cells[9].firstChild;},
                atNode: function(){return this.domNode.rows[0].cells[10].firstChild;},
                dmyNode: function(){return this.domNode.rows[0].cells[11].firstChild;},
                okNode: function(){return this.domNode.rows[0].cells[12].firstChild;}
            },

            /**
             * @ignore
             */
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? C.DISPLAY_TABLE : 'none';}
            },

            children: [
                /*//No need for Not node any more. 
                _chJson({
                    alias: "not",
                    allowUnlistedValues: false,
                    items: [
                        {did: 0, n: "Include", css: "no-hilite"},
                        {did: E.FN.NOT, n: "NOT"}
                    ],
                    itemMarkup: '<div class="dial-item {@css}">{@n}</div>',
                    update: function(){
                        // Updates the selection. Visibility is always true, items is fixed (two items).
                        // For current selection, inspect the model's "not" property.
                        var p = this.parent,
                            m = p.model,
                            idx = m && m.not ? 1 : 0;
                        _updateList(this, true, null, this.items[idx]);
                    }
                }),   
                */                  
                _chJson({
                    alias: "target",
                    insertUnlistedValuesAt: 0,  // Insert browse items directly under "Browse..." item at top of list.
                    makeObservable: true,
                    hideIfEmpty: true,
                    update: function(){
                        // Updates the visibility, items and selection.
                        // For visibility: always true.
                        // For items: Only compute if there has been a change in model object?
                        var p = this.parent,
                            m = p.model;

                        if (this.lastModel !== m){
                            this.lastModel = m;
                            // Compute a list of available targets. Start with the master list from the walk. Then
                            // possibly filter out certain target types from the master list, if expression types are restricted.
                            var tgs = p.targets,
                                ets = p.ets;
                            if (ets && tgs && tgs.length) {
                                // Expression types are restricted, so we must filter our available targets list. 
                                // For each allowed expr type, allow the object type it accepts.
                                var ok = _okTargetTps(p.ets);
                                tgs = A.filter(
                                            tgs,
                                            function(item){
                                                return ok[item[MTP]];  // renamed "tp" to "t"
                                            }
                                        );
                            } else {
                                // Use a clone, dont modify the original.
                                tgs = tgs ? tgs.concat() : [];
                            }
                            // For selection: lookup the currently selected target, if any.
                            var et = m && m.et,
                                t = m && m[ET2TGT[et]];
                            // Update GUI.
                            _updateList(this, true, tgs, t);
                        }
                    }
                }),
                _fmJson({
                    alias: "fm",
                    fmPost: '',
                    filter: false
                }),
                _chJson({
                    alias: "es",
                    itemIdField: "v",       // webserver switched from "did" to "v"
                    insertUnlistedValuesAt: 0,
                    makeObservable: true,                    
                    itemMarkupFunction: function(item, idx, widget) {
                var n = ENC(item.n);
                return '<div class="dial-checkitem ' + item.css + '" title="' + n + '">' + n + '</div>';
                },
                    multiSelect: true,
                    selectionPolicy: "toggle",
                    postCreate: function pces(){
                        _pc.apply(this, []);
                        this.ajx = mstrmojo.insert({
                                    parent: this,
                                    scriptClass: "mstrmojo.AjaxCall",
                                    isTask: true,
                                    params: {
                                        taskId: "browseElements",
                                        attributeId: null,
                                        styleName: "MojoAttributeStyle",
                                        blockBegin: 1,
                                        blockCount: mstrApp.elementsBlockCount || 30
                                    },
                                    onsuccess: function(){
                                        var p = this.parent,
                                            rs = this.response;
                                        // Validate that response matches request. Response maybe an outdated 
                                        // request that wasn't cancelled; if so, ignore it.
                                        if ((rs && rs.did) !== p.lastAttrId) {
                                            return;
                                        }
                                        // Set the new items to the task response, plus a "Browse.." item above.
                                        // Make sure to clone the list from the task, so we dont modify the original.
                                        var its = (rs && rs.es) ? rs.es.concat() : [];
                                        _updateListMultiData(p, its, p.parent.model && p.parent.model.es, null);
                                    },
                                    onerr: function(){
                                        _replaceItem(this.parent, _waitItem, [_errItem]);
                                    }
                                });
                    },
                    //onchange: _onchgMulti,
                    update: function udes(){
                        // Update visibility, items and selection.
                        // For visibility: only show if we have a target attribute.
                        var p = this.parent,
                            m = p.model,
                            a = m && m.a,
                            show = !!a && !a.ilk,
                            es,
                            sel,
                            idxs,
                            ajx;
                        if (show) {
                            // For items: dont bother updating if target hasn't changed.
                            if (this.lastAttrId !== a.did) {
                                this.lastAttrId = a.did;
                                es = m.es;
                                // Load the list via ajax.  For now, set items to all the model's elems, 
                                // and a "Loading..." item after.
                                // Make sure to clone the list from the model, so we dont write to the model.
                                var len = es && es.length;
                                es = len ? es.concat() : [];
                                es.push(_waitItem);
                                // Select every item index except the "Loading..." item.
                                if (len) {
                                    idxs = [];
                                    for (var i=1; i<=len; i++){
                                        idxs[i] = i;
                                    }
                                }
                                ajx = this.ajx;
                                ajx.params.attributeId = a.did;
                            } else {
                                // We're just updating selected items, not the items themselves.
                                sel = m.es;
                            }
                        }
                        // Update the GUI.                            
                        _updateListMulti(this, show, es, sel, idxs);
                        // Fire the task call.
                        if (show && ajx) {
                            ajx.send();
                        }
                    }
                }),
                _chJson({
                    alias: "fn",
                    allowUnlistedValues: false,
                    update: function(){
                        // Update visibility, items and selection.
                        // For visibility: only show if we have a target (and form, if AQ).
                        var p = this.parent,
                            m = p.model || {},
                            et = m.et,
                            dtp,
                            show = false,
                            fns,
                            sel;
                        switch(et) {
                            case ET.AE:
                                // If we have an attribute for the elems, show the fns.
                                show = !!m.a;
                                break;
                            case ET.AQ:
                            case ET.AC:
                            case ET.AL:                                
                                // If we have a form for a qual, show the fns. Record the data type.
                                show = !!(m.fm && m.fm.did);
                                dtp = show ? m.fm.dtp : null;
                                break;
                            case ET.MQ:
                            case ET.MC:
                                // If we have a metric for a qual, show the fns.
                                show = !!m.m;
                                dtp = show ? E.METRIC_DTP : null;  // use the default metric data type, if any
                                break;
                        }
                        if (show) {
                            // For items: Dont bother updating if et and data type haven't changed
                            // list last updated.
                            var fndtp = D2FD[dtp];
                            if ((this.lastEt !== et) || (this.lastFnDtp !== fndtp)) {
                                this.lastEt = et;
                                this.lastFnDtp = fndtp;
                                
                                //Get the list of functions for expr type from the walk.
                                var lookin = et ? ET2FNS[et] : null,
                                    k = lookin && lookin.key;
                                fns = (k && p[k]) || lookin.def || [];
                            
                                // If the list is a hash, assume it is keyed by data type.
                                if (typeof(fns) === 'object') {
                                    fns = fns[fndtp] || fns['*']; 
                                }
                            }
                            // For selection: create a list item for the current function,
                            // so we can match it to the items list via itemIdField ("did").
                            sel = fnItem(m.fn, m.fnt || 1); // if fnt missing (e.g. AQ) assume it is 1
                        }
                        _updateList(this, show, fns, sel);
                    }
                }),
                _cstJson({
                    alias: "c0",
                    cstIndex: 0
                }),
                _fmJson({
                    alias: "fm2",
                    fmPost: '2'
                }),
                _cstJson({
                    alias: "c1",
                    cstIndex: 1
                }),
                _fmJson({
                    alias: "fm3",
                    fmPost: '3'
                }),
                _chJson({
                    alias: "dmy",
                    itemIdField: "did",
                    hideIfEmpty: true,
                    itemMarkupFunction: function(item, idx, widget) {
                var n = ENC(item.n);
                return '<div class="dial-checkitem ' + item.css + '" title="' + n + '">' + n + '</div>';
                },
                    multiSelect: true,
                    selectionPolicy: "toggle",
                    insertUnlistedValuesAt: 0,  // Insert browse items directly under "Browse..." item at top of list.
                    //onchange: _onchgMulti,
                    makeObservable: true,                    
                    postCreate: function(){
                        _pc.apply(this, []);
                        this.set("items", _initDmys(this.parent));
                    },
                    update: function uddmy(){
                        // Update visibility, items and selection.
                        // For visibility: only show if we have a metric qual/comparison with a metric and a function.
                        var p = this.parent,
                            m = p.model,
                            et = m.et,
                            t = m && m.m,
                            show = !!t && (m.fn !== null) && ((et === ET.MQ) || (et === ET.MC)),
                            its,
                            sel;
                        if (show) {
                            // For items: the options are derived from the walk's targets list. 
                            // Check to see when our parent's targets list was last modified.
                            var lim = this.targetsLastMod,
                                plim = p.targetsLastMod;
                            if (!lim || !plim || (lim != plim)) {
                                // Our list is out-of-date; update it now.
                                this.targetsLastMod = p.targetsLastMod;
                                its = _initDmys(p);
                            }
                            // For selections: build a list of the current dimensionality objects. For custom level
                            // objects, the actual object is nested in the "utgt" property, so for our list's sake we normalize
                            // such objects -- we just include the nested object, not the containing object.  That way we won't
                            // see 2 objects with the same name: the custom dmy object + the attribute from the object browser.
                            sel = [];
                            var uts = m.dmy && m.dmy.uts;
                            for (var u=0, uLen=(uts && uts.length)||0; u<uLen; u++){
                                var ut = uts[u];
                                sel.push(ut.utgt ? ut.utgt : ut);
                            }
                        }
                        // Update the GUI.                            
                        _updateListMulti(this, show, its, sel);
                        // Also toggle the "at" text node.
                        _toggleSlot(p, 'atNode', show);
                    }
                }),
                {
                    alias: "okBtn",
                    slot: "okNode",
                    scriptClass: "mstrmojo.HTMLButton",
                    cssClass:"mstrmojo-Editor-button",
                    text: mstrmojo.desc(1442,"OK"),
                    cssText:"width:66px;min-width:58px;",                    
                    onclick: function(){
                        var p = this.parent;
                        if (p.onOK) {
                            p.onOK();
                        }
                    }
                },
                {
                    alias: "cancelBtn",
                    slot: "okNode",
                    scriptClass: "mstrmojo.HTMLButton",
                    cssClass:"mstrmojo-Editor-button",
                    cssText:"width:66px;min-width:58px;",
                    text: mstrmojo.desc(221,"Cancel"),
                    onclick: function(){
                        var p = this.parent.parent;
                        if(p && p.close){
                            p.close();
                        }
                    }
                }
            ],

            eb: {
                scriptClass: "mstrmojo.Editor",
                cssClass: mstr.utils.ISIE7 ? "mstrmojo-ElementsEditorIE7" : "mstrmojo-ElementsEditor",
                title: mstrmojo.desc(6149,"Select Elements"), 
                help: "element_browser_dialog_box.htm",
                children: [{
                    scriptClass: "mstrmojo.ElementsBrowser",
                    alias: "browser"
                },
                {
                    scriptClass: 'mstrmojo.HBox',
                    cssClass: 'mstrmojo-Editor-buttonBox',
                    slot:"buttonNode",
                    children: [
                                    {
                                        scriptClass: "mstrmojo.HTMLButton",
                                        alias: 'ok',
                                        text: mstrmojo.desc(1442,'OK'),
                                        cssClass: 'mstrmojo-Editor-button',
                                        cssText: 'width:72px;margin-right:2px;',
                                        onclick: function () {
                                            var editor = this.parent.parent,
                                                o = editor && editor.opener;
                                            if(o){
                                                o.onEBSelect();
                                                o.closePopup();
                                            }
                                        }
                                    }]                               
                }]
            },
            
            ob: {
                scriptClass: "mstrmojo.Editor",
                title: mstrmojo.desc(5298,"Select an Object"),
                help: "Select_Objects_dialog_box_.htm",
                children: [{
                    scriptClass : "mstrmojo.ObjectBrowser", 
                    alias: "browser", 
                    cssText: "width:200px;",
                    fishEyeVisible: false,
                    closeable: false,   
                    closeOnSelect: false, 
                    browsableTypes: '3,4,8,10,12,256'
                }]
            },
            
            /**
             * The text to display between 2 constants in a "between" or "not between" qualification.
             * @type String
             */
            betweenText: mstrmojo.desc(308,"and"),

            /**
             * The text to display before metric dimensionality.
             * @type String
             */
            atText: mstrmojo.desc(5923,"at"),

            /**
             * <p>The data representation for a single condition in a filter expression.</p>
             *
             * <p>The ConditionWalk will display and edit this model visually./p>
             * 
             * @type Object
             */
            model: null,

            /**
             * <p>Optional list of available attributes and/or metrics which can be used as targets in the condition model.</p>
             *
             * @type Array
             */
            targets: null,
            
            /**
             * <p>Optional hashtable of allowed expression types. If unspecified, all expression types are allowed.</p>
             *
             * <p>The hashtable is keyed by expression type. The hash values are booleans; if true, then the expression type
             * corresponding to that hash key is allowed.</p>
             *
             * @type Object
             */
            ets: null,
            
            /**
             * <p>Optional default expression type to be used when editing a new/empty condition.</p>
             *
             * @type Number
             */
            defaultEt: null,
            
            /**
             * <p>Optional default expression type to be used for attribute targets. If unspecified, the end-user chooses.</p> 
             *
             * @type Number
             */
            defaultAttrEt: null,
            
            /**
             * <p>List of available functions for metric qualifications.</p>
             *
             * <p>If an Object is specified, it is assumed to be a hashtable keyed by metric data type. Each hash key is assumed
             * to be an array of functions available for that data type. The hash key "*" can be used to specify a default
             * function list for any data type.</p>
             *
             * <p>Alternatively, if an Array is specified, it is assumed to be list of functions for all metric data types.</p>
             *
             * @type Object|Array
             */
            metricFns: null,
            
            /**
             * <p>List of available functions for attribute form qualifications.</p>
             *
             * <p>If an Object is specified, it is assumed to be a hashtable keyed by form data type. Each hash key is assumed
             * to be an array of functions available for that data type. The hash key "*" can be used to specify a default
             * function list for any data type.</p>
             *
             * <p>Alternatively, if an Array is specified, it is assumed to be list of functions for all form data types.</p>
             *
             * @type Object|Array
             */
            formFns: null,
            
            /**
             * <p>List of available functions for attribute element lists.</p>
             *
             * @type Array
             */
            elemFns: null,
            
            /**
             * <p>List of available levels for metric qualifications.</p>
             *
             * @type Array
             */
            metricLevels: null,

            /**
             * <p>Optional id of the default metric level for metric qualifications.</p>
             *
             * @type String
             */
            defaultMetricLevel: null,
            
            /**
             * <p>Extends the rendering cycle to attach a listener to the model and
             * initialize children ("walk steps") before rendering them.</p>
             * @ignore
             */
            postBuildRendering: function pstBR(){
                // Initialize the model.
                _attachModel(this, this.model);
                
                // Initialize the walk steps.
                _initSteps(this);
                            
                // Let the inherited method trigger the rendering of children.
                return this._super();
            },

            /**
             * <p>Custom setter for "model" property.</p>
             *
             * <p>If the given model is a non-observable object, makes the object observable.
             * Then attaches event listeners to the new model (if any). Plus, if the walk is
             * rendered, triggers the re-initialization of walk steps according to the new model.</p>
             * @ignore
             */
            _set_model: function setm(n, v){
                var vWas = this.model,
                    chg = (v !== vWas);
                if (chg) {
                    _detachModel(this, vWas);

                    // Initialize the new model.
                    this.model = v;
                    _attachModel(this, v);

                    // Initialize the walk steps.
                    if (this.hasRendered) {
                        _initSteps(this);
                    }
                }
                return chg;
            },
            
            /**
             * <p>Handler for "edit" events in this walk's model.
             * Responds to events by updating the walk's children.</p>
             * @ignore
             */
            onmodeledit: function(evt){
                switch(evt && evt.prop) {
                    case 'es':
                    case 'dmy':
                        // we still needs to update OK button for the new state
                        // Performance optimization: no need to update the walk every time user
                        // changes these steps; they dont require any refreshing of other steps.                        
                        _updateOkBtn(this);
                        return;
                }
                _initSteps(this);
            },
            
            /**
             * <p>Asks the walk to launch a browse GUI from one of the walk steps.</p>
             *
             * <p>This method is called by a walk step (child widget) from its onchange handler. The step passes in a handle
             * to itself.</p>
             *
             * @param {mstrmojo.Widget} ch The child widget from which the browse request originated.
             */
            browse: function bws(ch) {
                var prn = this.parent.editorNode,
                    pos =  function(el, pr){
                        var pl = mstrmojo.dom.position(el,true),
                            pt = mstrmojo.dom.position(pr, true);
                        return {x: pl.x + pl.w, y: pt.y};
                    };
                switch(ch && ch.alias){
                    case "target":
                    case "dmy":
                        // For browsing targets, metric dimensionality, use object browser.
                        _browseObjs(this, ch, pos(ch.alias == "target" ? this.targetNode : this.dmyNode, prn));
                        break;
                    case "c0": 
                    case "c1":
                        _browseObjs(this, ch, pos(ch.alias == "c0" ? this.c0Node : this.c1Node, prn));
                        break;
                    case "es":
                        // For browsing elements, use element browser.
                        _browseEs(this, ch, pos(this.esNode, prn));
                        break;
                }
            },
            onOBSelect : function(item){
                var ob = this.ob.browser,
                    op = ob.target;
  
                this.closePopup();
                
                // Is the new item not already in our master list of targets? If not, add it.
                // Do this before adding & selecting it in the walk step, because the selecting process will
                // trigger an update in the walk, and the master list of targets will be needed for that.
                var f = op.itemIdField,
                    ts = this.targets || [],
                    idx = A.find(this.targets, f, item[f]);
                if (idx === -1) {
                    // Not found.  Append it and update the last modified date for any walk steps that read this list.
                    ts.push(item);
                    this.targets = ts;
                    this.targetsLastMod = new Date();
                }
                
                // Select (add first, if need be) the new item in the walk step which launched the browser.
                // For a multiSelect list, we dont want to clear prior selections.
                op.setSelectedItems([item], op.multiSelect);
                op.refreshScroll();
            },
            
            onEBSelect: function(){
                var eb = this.eb.browser;
                
                
                //update display
                var es = this.es;
                es.set('selectedIndices', {});      //clear current selections first
                es.setSelectedItems(eb.selectedItems, false);  //apply new selections
            },
            
            onclick: function onclick(evt){
                var t = mstrmojo.dom.eventTarget(evt.hWin, evt.e);
                if(t == this.targetNode.firstChild){
                    this.browse(this.target);
                }else if(t == this.esNode.firstChild){
                    this.browse(this.es);
                }else if(t == this.dmyNode.firstChild){
                    this.browse(this.dmy);
                }
            }
        });

})();