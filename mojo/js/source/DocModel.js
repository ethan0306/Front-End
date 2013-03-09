(function () {

    mstrmojo.requiresCls("mstrmojo.func",
        "mstrmojo.Model",
        "mstrmojo.EnumRWUnitType",
        "mstrmojo.DocDataService",
        "mstrmojo.StringBuffer",
        "mstrmojo.EnumReadystate");

    var $RWTYPES = mstrmojo.EnumRWUnitType,
        $RS = mstrmojo.EnumReadystate,
        $HFE = mstrmojo.hash.forEach,
        $WRAP = mstrmojo.func.wrapMethods,
        $A = mstrmojo.array;

    /**
     * Helper object to convert definition nodes to {@link mstrmojo.Model}s.
     *
     * @private
     * @ignore
     */
    var observables = {
        isObservable: function (defn) {
            // Get the type of unit.
            var t = defn && defn.t;

            // Does this defn NOT have a type OR is it already observable (signified by the presence of a scriptClass).
            if (!t || !(t in this) || defn.scriptClass) {
                // Nothing more to do.
                return false;
            }
            
            // Details subsection don't need to be observable since they can't contain a portal.
            return (t !== $RWTYPES.SUBSECTION || !defn.dt);
        },

        makeObservable: function (defn) {
            // Tell it which properties should be audible. If a definition is forced to be made observable, make it an empty object.
            defn.audibles = this[defn.t] || {};

            // Does this definition have an audible readyState?
            if ('readyState' in defn.audibles) {
                // Set the initial ready state.
                defn.readyState = $RS.IDLE;
            }

            // Convert to an Model.
            return new mstrmojo.Model(defn);
        }
    };

    observables[$RWTYPES.PANELSTACK] = {
        '*': false,
        selKey: true,    // Selected panel key.
        readyState: true
    };

    observables[$RWTYPES.GRID] = {
        '*': false,
        readyState: true,
        ds: true    // Display state for portals.
    };

    observables[$RWTYPES.GRAPH] = {
        '*': false,
        readyState: true,
        ds: true    // Display state for portals.
    };

    observables[$RWTYPES.GRIDGRAPH] = {
        '*': false,
        qsm: true,
        ds: true    // Display state for portals.
    };

    observables[$RWTYPES.SUBSECTION] = {
        '*': false,
        resize: true,
        adjustSize: true
    };

    observables[$RWTYPES.VISUALIZATION] = {
        '*': false,
        ds: true    // Display state for portals.
    };

    observables[$RWTYPES.SELECTOR] = {
        '*': false,
            cek: true,    // current element key.
            ds: true
    };

    observables[$RWTYPES.MOJOVISUALIZATION] = {
        '*': false,
        ds: true    // Display state for portals.
    };


    /**
     * Returns the current layout node from the supplied definition.
     *
     * @param {Object} node The node (either definition or data) from which to extract the current layout.
     * @param {String} lytKey The current layout key.
     *
     * @private
     * @ignore
     */
    function getLayout(node, lytKey) {

        // Optimization: use a quick lookup hash, if available, to avoid for-loop.  NOTE: This only works for definition.  We don't want to cache
        // data layouts because they might change.
        var lyt = node.layoutMap && node.layoutMap[lytKey];
        if (lyt) {
            return lyt;
        }

        var lyts = node.layouts,
            cnt = (lyts && lyts.length) || 0,
            i = 0;

        for (i = 0; i < cnt; i++) {
            if (lyts[i].k == lytKey) {
                return lyts[i];
            }
        }

        return null;
    }

    /**
     * This method retrieves the definition of an object from the DocModel's "defn" tree.
     *
     * @param {Object} The definition node from the DocModel.
     * @param {String} key The key of the object whose definition is requested.
     *
     * @private
     * @ignore
     */
    function lookupDefn(defn, lytKey, key) {
        var lyt = getLayout(defn, lytKey);
        
        if (key == lytKey) {
            // Add the layout key to the definition.
            lyt._lkz = lytKey;

            return lyt;

        } else if (lyt) {
            // Retrieve the unit from the units collection.
            var unit = lyt.units[key];
            // Do we have a unit
            if (unit) {
                // Is it of type grid/graph?
                if (unit.t == $RWTYPES.GRIDGRAPH) {
                    // We need to insert defn items for the child grid and child graph.
                    // Have we NOT done it already?
                    if (!lyt.units[key + '_0']) {

                        // Create grid definition object.
                        lyt.units[key + '_0'] = {
                            ck: unit.ck,  // share current key
                            fmts: unit.fmts.gd,    // Sub node
                            txi: unit.txi, // the transaction info object (for Transaction)
                            t: $RWTYPES.GRID
                        };

                        // Create the graph definition object.
                        lyt.units[key + '_1'] = {
                            ck: unit.ck,  // share current key
                            fmts: unit.fmts.gp,    // Sub node
                            t: $RWTYPES.GRAPH
                        };
                    }
                }

                // Does this unit need to be observable?
                if (observables.isObservable(unit)) {
                    // Replace the unit in the collection (and in place) with an observable version.
                    var observableObject = observables.makeObservable(unit);
                    unit = lyt.units[key] = observableObject;
                    this.destroyObjects.push(observableObject);
                }

                // Add the layout key to the definition.
                unit._lkz = lytKey;
            }

        }

        return lyt && lyt.units[key];
    }
    /*
     * Returns filtered child sections.
     * @node the layout node
     * @param types the section types to include or exclude
     * @param include include specified types in returned array or exclude specified types in returned array.
     *
     * Currently filtering only happens for mobile device. For web application, when include = true, it will return empty array, when include = false, it will return all children.
     */
    function filterSectionsByTypes(node, isPartial, types, include) {
        var children = this.getChildren(node, isPartial, 0);
        // put false here to disable the dock page header/footer feature until MU beta 1 finishes.
        return ((false && mstrApp.onMobileDevice()) ? (mstrmojo.array.filter(children, function (sec) {
                                            var idx = types && types.indexOf(sec.defn.t);
                                            return include? idx > -1 : idx < 0;
                                        })) : (include ? [] : children));
    }

    /**
     * <p>Utility function for building unique ID from the supplied data node.<p>
     *
     * <p>The id is a combination of the layout key, the unit key, the optional widget ID and the models buildTime timestamp.
     *
     * @param {String} data.k The node key.
     * @param {String} [data.wid=""] The widget id for this node.
     * @param {String} lk The layout key.
     *
     * @private
     */
    var fnBuildId = function(data, lk) {
        var id = new mstrmojo.StringBuffer();

        // Do we have a layout key?
        if (lk) {
            // Add layout key.
            id.append('*l' + lk);
        }

        // Add key
        id.append('*k' + data.k);

        // Do we have a widget ID?
        if ('wid' in data) {
            // Add widget ID.
            id.append('*x' + data.wid);
        }

        // Add the build time to ensure uniqueness.
        id.append('*t' + this.buildTime);

        return id.toString();
    };

    /**
     * @param {Object} d The map objects that have the objects with transaction changes.
     * @returns {String} update string in xml
     * */
    function getTxUpdates(d) {
        var i, w,
        updates = [];

        if(!mstrmojo.hash.isEmpty(d)) {
            updates.push('<updates>');
            for(i in d) {
                if(d.hasOwnProperty(i)) {
                    w = d[i];
                    updates.push(w.getUpdates());
                }
            }
            updates.push('</updates>');
        }
        return updates.join('');
    }

    /**
     * Gets the definition objects for the given object keys.
     * 
     * @param {String} keys Delimited string of Object keys.
     * @param {String] [delim=\u001E] An optional delimiter to use when splitting the keys parameter.
     * 
     * @returns {Object[]} Array of definition objects.
     */
    function fnGetTargetDefn(keys, delim) {
        var defs;
        keys = keys.split(delim || '\u001E');
        for (var i = 0, cnt = keys.length; i < cnt; i++) {
            defs = defs || {};
            defs[keys[i]] = lookupDefn.call(this, this.defn, this.currlaykey, keys[i]);
        }

        return defs;
    }

    function unloadAffectedLayouts(me, data) {
        var ulkeys = data.ulkeys,
        //var ulkeys = ["K3", "K67"],
            contentView = me.controller.contentView;
        if ( contentView && contentView.unloadLayouts && ulkeys && ulkeys.length ) { 
            contentView.unloadLayouts(ulkeys);
        }
    }
    
    /**
     * Returns true if the supplied key corresponds to an info window panel stack.
     * 
     * @param {String} key The key of the unit to check.
     * @param {String} [layoutKey=currentLayoutKey] An optional layout key that will default to the current layout.
     * 
     * @private
     */
    function isInfoWindowPS(key, layoutKey) {
        var defn = this.getLayoutUnitDefn(key, layoutKey);
        return (defn && defn.t === $RWTYPES.PANELSTACK && defn.ifw);
    }
    
    function isCurrentSlice(node, sid){
        return !sid || (node.wid == sid);
    }

    mstrmojo.DocModel = mstrmojo.declare(
        // superclass
        mstrmojo.Model,

        // mixins
        null,

        /**
         * @lends mstrmojo.DocModel.prototype
         */
        {
            scriptClass: 'mstrmojo.DocModel',

            audibles: {
                '*': false,
                data: true
            },

            /**
             * An observable dictionary of feature settings.
             */
            features: null,

            /**
             * A cache of data nodes that have been changed since the original instantiation.
             *
             * @type Object
             */
            dataCache: null,

            /**
             * The controller for this document.
             *
             * @type mstrmojo.Obj
             */
            controller: null,

            /**
             * <p>This Class is the main model that contains all definition and data for all document layouts in a MicroStrategy Report Services document.</p>
             *
             * <p>This model is responsible for all interactivity and most communication with the web server.</p>
             *
             * @constructs
             * @extends mstrmojo.Model
             *
             * @param {Object} props A hash of properties/values to be applied to this instance.
             */
            init: function init(props) {
                this._super(props);

                //Initialize the array to destroy when the doc model is destroyed
                if(!this.destroyObjects) {
                    this.destroyObjects = [];
                }

                if (!this.features) {
                    this.features = new mstrmojo.Model();
                    this.destroyObjects.push(this.features);
                }
                this.ondefnChange();

                // Initialize the build time to be used as a unique identifier for this document.
                this.buildTime = mstrmojo.now();
            },

            /**
             * Allows the definition object to be made observable so that it can listen to events.
             *
             * @param defn The definition node.
             */
            makeObservable: function makeObservable(defn) {
                return observables.makeObservable(defn);
            },

            /**
             * Gets the definition objects for the given object keys
             * @param {String} keys Object keys
             * @returns {Object} definition objects
             */
            getTargetDefn: function(keys) {
                return fnGetTargetDefn.call(this,keys);
            },

            /**
             * Gets the definition objects for the given object keys
             * @param {String} keys Object keys
             * @returns {Object} definition objects
             */
            getUnitDefinitions: function(keys, delim) {
                return fnGetTargetDefn.call(this,keys, delim);
            },
			
            /**
             * Returns true if a given comma-delim list of features are all enabled.  The list
             * may include "!" symbols to require disabled features rather than enabled features.
             */
            hasFeatures: function rsFts(/*String*/ featList){
                var fs = this.features;
                if (!fs) {
                    return false;
                }

                var arr = featList.split(',');
                for (var i=0, len=arr.length; i<len; i++){
                    var s = arr[i],
                        neg = s.match(/^\!/);
                    if (neg) {
                        s = s.replace("!", "");
                    }
                    if (neg ? this.features[s] : !this.features[s]) {
                        return false;
                    }
                }
                return true;
            },

            /**
             * <p>This handler is triggered whenever this DocModel's "defn" property is changed.</p>
             *
             * <p>As a performance optimization, it creates a hashmap for quick lookup of current layout definition.</p>
             */
            ondefnChange: function ondefnChg(){
                var defn = this.defn,
                    lyts = defn && defn.layouts,
                    lytMap = {};
                if (defn) {
                defn.layoutMap = lytMap;

                for (var i = 0, cnt = lyts && lyts.length || 0; i < cnt; i++) {
                    var lyt = lyts[i];
                    lytMap[lyt.k] = lyt;
                }
                }
            },

            /**
             * Returns an object with a getFormat method that returns the formats for a given definition.
             *
             * @type Object
             */
            formatResolver: {

                /**
                 * Returns the resolved formats for the given definition node.
                 *
                 * @param {Object} defn The definition node for the widget.
                 * @param {String} thresholdId The ID of the threshold formatting to use for this instance.
                 *
                 * @returns {Object} The resolved format node for this object.
                 */
                getFormat: function getFormats(defn, thresholdId) {
                    // Get the base formatting.
                    var fmts = ((defn && defn.fmts) || null);

                    // Is there a threshold?
                    if (thresholdId) {
                        // Get the threshold formatting.
                        var ts = defn.thresholds,
                            tFmts = ts && ts[thresholdId];

                        // Did we find threshold formatting?
                        if (tFmts) {
                            // Create composite formatting of thresholds and base formatting.
                            var fx = {},
                                p;

                            // Get all formatting from base.
                            for (p in fmts) {
                                fx[p] = tFmts[p] || fmts[p];
                            }

                            // Overwrite with threshold formatting to get any values that are in the threshold but not in the base formatting.
                            for (p in tFmts) {
                                fx[p] = tFmts[p];
                            }

                            // Reset formats to composite format.
                            fmts = fx;
                        }
                    }

                    // Return resolved formatting.
                    return fmts;
                }
            },

            /**
             * Returns an object containing the collections of the grid keys and their styles in the string as the values for the
             * selected layout.
             *
             * @param {String} [k=this.currlaykey] The key of the requested layout grid styles.  If omitted, the current layout key will be used.
             *
             * @returns {Object} A JSon object with a map containing the grid keys and their styles
             */
            getSelectedXtabStyles: function getSelectedGridStyles(k)  {
                var sk = k || this.currlaykey;
                var ss = {};

                var lyts = this.data && this.data.layouts;
                for (var i in lyts) {
                    if (lyts[i].k === sk) {
                        ss = lyts[i].xtabStyles;
                        break;
                    }
                }

                return ss;
            },

            /**
             * <p>Retrieves the child nodes for a given data node.</p>
             *
             * <p>The data node is any node provided by a previous getChildren() call to this model, or null.  If null,
             * the model returns all the layout data nodes in this model.  If a layout data
             * node is given, the model returns all the section data child nodes for the
             * given layout node.</p>
             *
             * <p>If a section data node is given, the model returns all
             * the subsection data nodes for the given section node. If a subsection data node is
             * given, the model returns all the control data nodes for the given subsection node.</p>
             *
             * @todo Do we need support for asynchronous usage? Maybe caller should be required to pass in a callback?
             *
             * @param {Object} node The data node to get children from.
             * @param {Boolean} isPartial Whether this is a partial update or not.
             * @param {Integer} start
             * @param {Integer} count
             * @param {Boolean} includeTotal
             */
            getChildren: function getCh(node, isPartial, start, count, includeTotal) {
                // Default to current layout key.
                var layoutKey = this.currlaykey;
                
                // Do we have a node?
                if (node) {
                    // Layout key will be the _lkz property of the definition OR the actual key of the node (for layout case).
                    var defn = node.defn;
                    layoutKey = (defn && defn._lkz) || node.k; 
                }
                
                // If it's not a partial update and the dataCache exists then we need to check for data nodes in the dataCache. Partial updates will always
                // use the passed in node because they will replace the dataCache after building.
                var dc = this.getLayoutDataCache(layoutKey),
                    useCache = (!isPartial && !mstrmojo.hash.isEmpty(dc)),
                    lookin;

                // Do we not have a node?
                if (!node) {
                    // This is the current layout so lookin data.
                    lookin = this.data;
                } else {
                    // Get src from data (or node if no data).
                    var src = node.data || node;

                    // Are we using the cache?
                    if (useCache) {
                        // Reset lookin to data cachec.
                        lookin = dc[fnBuildId.call(this, src, layoutKey)];

                        // Reset lookin to data or lookin or src (in that order).
                        lookin = (lookin && lookin.data) || lookin || src;
                    } else {
                        // No cache so use src.
                        lookin = src;
                    }
                }

                // Extracting children from the supplied data node.
                var arr = lookin.sections || lookin.subsections || lookin.objects || lookin.panels || lookin.layouts || lookin.children,
                    ch = [];

                var len = (arr && arr.length) || 0;
                if (len) {
                    var defn = this.defn,
                        traversingLayouts = !node,
                        ck = node ? layoutKey : null,                                           // if !node, we are walking the layouts list, outside of any layout.
                        type = (node && ((node.defn) ? node.defn.t : lookupDefn.call(this, defn, ck, node.k).t));        // The type of unit.

                    // Is it a grid/graph?  Look for the type in the definition (or lookup the definition for partial updates).
                    var isGridGraph = (type === $RWTYPES.GRIDGRAPH),
                        isDetails = (type === $RWTYPES.DETAILS);

                    for (var i = start || 0, stop = (isNaN(count)) ? len : i + count; i < stop; i++) {
                        var item = arr[i];
                        if (isGridGraph) {
                            // Both children share same key and same widget id.
                            item.k = node.k;
                            item.wid = node.data.wid;
                        }
                        var key = item.k,
                            id = fnBuildId.call(this, item, ck),
                            df;

                        //If it is a Panel Stack used as Info Window, put it into the cache for future rendering.
                        //Info Window shall be instantiated and rendered when info window is needed.
                        //If we're traversing layouts, we dont need to check for info window PS.
                        if (!traversingLayouts && !isPartial && isInfoWindowPS.call(this, key, ck)) {
                            var unitDef = this.getLayoutUnitDefn(key),
                                unit = {
                                        data:item,
                                        defn: unitDef,
                                        id: id,
                                        k: key
                                    };
                            dc[id] = unit;
                            //Store infow window unit into separate collection so we can get it by name.
                            //We need this to handle URL API info window links.
                            var infoWindows = this.infoWindows = this.infoWindows || {};
                            infoWindows[unitDef.n] = unit;
                            continue;
                        }

                        // Is it a GridGraph object?
                        if (isGridGraph) {

                            // We need to modify the id (since the grid and graph children share the same key).
                            id += '_' + i;

                            // Append sub block to key.
                            df = lookupDefn.call(this, defn, ck, item.k + '_' + i);

                        } else {
                            df = lookupDefn.call(this, defn, ck || item.k, item.k);    // if !ck, item is a layout, item.k is the "current" layout key
                        }


                        // Is the parent a details section?
                        if (isDetails) {
                            // Set a flag so that we know later that this is a details subsection.  We use this to prevent details subsection
                            // definitions from being observable.
                            df.dt = true;
                        }

                        // Add the child to the array.
                        ch.push({
                            k: item.k,
                            id: id,
                            defn: df,
                            data: useCache ? (dc[id] && dc[id].data) || item : item
                        });
                    }
                }
                   // Did the caller ask for total count along with the nodes?
                return includeTotal ? { nodes: ch, total: len } : ch;
            },

            /**
             * Returns info windo unit.
             *
             * @param {String} name The info window name.
             */
            getInfoWindow: function getInfoWindow(name) {
                var infoWindows = this.infoWindows;
                return infoWindows && infoWindows[name];
            },

            /**
             * Returns fixed header sections.
             */
            getFixedHeaders: function(node, isPartial) {
                return filterSectionsByTypes.call(this, node, isPartial, [$RWTYPES.PAGEHEADER], true);
            },
            /**
             * Returns fixed footer sections.
             */
            getFixedFooters: function(node, isPartial) {
                return filterSectionsByTypes.call(this, node, isPartial, [$RWTYPES.PAGEFOOTER], true);
            },
            getNonFixedSections: function(node, isPartial) {
                return filterSectionsByTypes.call(this, node, isPartial, [$RWTYPES.PAGEHEADER, $RWTYPES.PAGEFOOTER], false);
            },
            /**
             * Returns the definition for the unit with the specified key.
             *
             * @param {String} key The key of the requested unit definition.
             * @param {String} [layoutKey] Optional layout key for the unit.  If ommited the current layout will be used.
             *
             * @type Object
             */
            getLayoutUnitDefn: function getLayoutUnitDefn(key, layoutKey) {
                return lookupDefn.call(this, this.defn, layoutKey || this.currlaykey, key);
            },

            getUnitInstance: function getUnitInstance(key, widgetID) {
                return mstrmojo.all[fnBuildId.call(this, {
                    k: key,
                    wid: widgetID
                }, this.currlaykey)];
            },
            /**
             * Returns the key of the current layout.
             *
             * @param {Object} node
             * @type String
             */
            getSelectedKey: function getSelK(/*Object?*/ node) {
                return (!node && this.currlaykey) || null;
            },

            getCurrentLayoutKey: function getCurrentLayoutKey() {
                return this.currlaykey;
            },

            getCurrentLayoutDef: function getCurrentLayoutDef() {
                var layouts = this.defn.layouts;
                return layouts[$A.find(layouts, 'k', this.currlaykey)];
            },

            /**
             * <p>Updates pertinent DocModel properties and data and defn nodes for the current layout after an xhr call.</p>
             *
             *  @param {Object} node The result of the xhr call.
             */
            replaceLayout: function replaceLayout(key, node) {
                var dc = this.dataCache;

                // Is there a cache for this layout?
                if (dc && dc[key]) {
                    // Clear the dataCache for the current layout since we are replacing current layout.
                    dc[key] = {};
                }

                // Find the index of the current layout.  Based on the request
                var lyts = (this.data && this.data.layouts) || (this.defn && this.defn.layouts);
                for (var i = (lyts && lyts.length - 1) || 0; i >= 0; i--) {
                    if (lyts[i].k === key) {
                        break;
                    }
                }

                // Update bean state.
                this.bs = node.bs;

                // Update zoom factor
                this.zf = node.zf;

                // Update the layout data.
                if (node.data) {
                    this.data.layouts[i] = node.data.layouts[i];
                    //TQMS 507388.
                    this.data.elems = node.data.elems;
                }

                // Update the layout definition.
                if (node.defn) {
                    this.defn.layouts[i] = node.defn.layouts[i];

                    // Update the defn layoutMap to include the new defn.
                    this.ondefnChange();
                }

            },

            /**
             * Accepts new layout JSON, replaces the current layout and raises the 'rebuildLayout' event.
             *
             * @param {Object} layoutJSON The JSON for the new layout.
             */
            loadLayout: function loadLayout(layoutJSON) {
                this.replaceLayout(layoutJSON.currlaykey, layoutJSON);

                this.raiseEvent({
                            name: 'rebuildLayout'
                        });
                    },

            /**
             * Gets the update string from the widgets which have content changed. (transaction code)
             * @returns String XML string for changes
             */
            getTransactionUpdates: function getTransactionUpdates() {
                return getTxUpdates(this.delta);
            },

            /**
             * Clears the delta map to remove the changes. (transaction code)
             */
            clearTransactionUpdates: function clearTransactionUpdates() {
                this.clearTxDeltaUpdate();
            },

            getDataService: function getDataService() {
                var dataService = this.dataService,
                    me = this;
                if (!dataService) {
                    dataService = this.dataService = new mstrApp.viewFactory.newDocDataService({
                        rwb: this.bs,
                        msgId: this.mid,
                        model: this
                    });
                    this.destroyObjects.push(dataService);
                }
                return dataService;
            },

            destroy: function destroy() {
                var destroyObjects = this.destroyObjects;
                if(destroyObjects) {
                    for(var i = 0; i < destroyObjects.length; i++) {
                        if(destroyObjects[i].destroy) {
                            destroyObjects[i].destroy();
                        }
                    }
                }
                this._super();
            },

            partialUpdate: function partialUpdate(data, targetDefinitions) {
                // Update the "dataCache" with a hash of all the partial update nodes which are either targets or descendants of targets.
                var updatedDataCache = this.updateDataCache(data, targetDefinitions);

                // Raise the 'partialUpdate' event so the document widgets will update themselves.
                this.raiseEvent({
                    name: 'partialUpdate',
                    tree: data,                 // Partial update tree.
                    ids: updatedDataCache
               });
            },

            /**
             * Partial updates from the Xhr's response. The function gets the keys from the response object, and updates the data cache.
             * @param {Object} res The xhr's response object
             * @returns {Object} An object with information about widgets that need to be updated.
             */
            transactionUpdate: function(res, evt){
                var me = this,
                    tgtDefs;

                // With new partial update mechanism
                if (evt && evt.tks) {
                    tgtDefs = fnGetTargetDefn.call(this, evt.tks);
                }
                // If the response has the partial update keys, overwrite the tgtDefs
                if(res.pukeys) {
                    tgtDefs = fnGetTargetDefn.call(this, res.pukeys);

                    // TQMS 449351: clear "cek" properties for selectors
                    var tgt;
                    for (tgt in tgtDefs) {
                        if (tgtDefs[tgt] && tgtDefs[tgt].cek) {
                            tgtDefs[tgt].cek = null;
                        }
                    }
                }

                // Update this DocModel's "dataCache" with a hash of all the
                // partial update nodes which are either targets or descendants of targets.  Return
                // is a hash of id's that were updated.
                var ids = this.updateDataCache(res.data, tgtDefs, evt && evt.sid),
                    ue = {
                            name: 'partialUpdate',
                            tree: res.data,   // Partial update tree.
                            ids: ids
                        };

                //if has info window, pass on the position.
                if(!mstrmojo.hash.isEmpty(ids.ifws)){
                    if (evt && evt.type === $RWTYPES.GRID) {
                        ue.anchor = evt.anchor;
                    } else {
                        //Info windows should only be targetted by grids and no other objects.
                        ids.ifws = {};
                    }
                }

                // Raise the 'partialUpdate' event so the doc widgets will hear it.
                this.raiseEvent(ue);

                return ids;
            },

            deltaUpdate: function dltUdt(w) {
                var d = this.delta;
                if(!d) {
                    d = this.delta = {};
                }
                d[w.id] = w;
            },

            clearTxDeltaUpdate: function clrDltUdt() {
                var d = this.delta,
                    i, w;
                for(i in d) {
                    if(d.hasOwnProperty(i)) {
                        w = d[i];
                        if(w.clear) {
                            w.clear();
                        }
                    }
                }
                this.delta = {};
            },

            /**
             * Sends transaction update to the web server
             * @param {String} ck Action selector control key
             * @param {Integer} at The action type
             * @param {Object} callbacks The callbacks functions that are defined to invoke when the transaction is invoked
             */
            sendTransactionActions: function sendTransactionActions(ck, at, callbacks) {

                var me = this;
                if(!callbacks) {
                    callbacks = {
                        success: function(res){
                            //partial update
                            me.transactionUpdate(res);
                        }
                    };
                }

                me.getDataService().sendTransactionActions({
                    keyContext: ck,
                    actions: at
                }, callbacks);
            },

            /**
            * Performs a slice operation or panel stack selector change.
            *
            * @param {mstrmojo.Event} evt The event object.
            * @param {Integer} evt.type The type of selector operation (1 = attribute element, 2 = metric and 3 = panel).
            * @param {String} evt.src The Key of the src selector.
            * @param {String} evt.ck The Control Key Context.
            * @param {String} evt.tks The Target Keys.
            * @param {String} evt.eid The Group by element ID.
            */
            slice: function slice(evt) {
                try {
                    // if no slicing target, return.
                    // TQMS#504779, andriod clients don't need tks while web needs.
                    if (!evt || (!mstrmojo.dom.isAndroid && !evt.tks && (evt.type === 3 || evt.type === $RWTYPES.GRAPH))) {
                        return;
                    }

                    var dataCacheUpdate = null,
                        me = this,
                        dataService = this.getDataService(),

                        // The collection of target definitions for this slice.
                        tgtDefs = evt.tks ? fnGetTargetDefn.call(this, evt.tks) : null,

                        // Copy of original target definitions.
                        orignalTargetDefs = tgtDefs, 

                        // Utility function for setting readyState.
                        fnSetReadyState = function (v) { 
                            // Iterate previous ready state definitions (if present) or the event target definitions.
                            $HFE(orignalTargetDefs, function (targetDef, key) {
                                // Is the target observable?
                                if (targetDef.set) {
                                    // Set the ready state.
                                    targetDef.set('readyState', v);
                                }
                            });
                        },

                        // Utility function for retrieving widgets from registry.
                        fnGetWidget = function (k, wid) {
                            return mstrmojo.all[fnBuildId.call(me, {
                                k: k,
                                wid: wid
                            }, me.currlaykey)];
                        },

                        // Default slice request callback.
                        callback = {
                            submission: function () {
                                // Set ready state to WAITING on target widget definitions.
                                fnSetReadyState($RS.WAITING);
                            },

                            success: function (res) {

                                if (evt.disablePU) {
                                    me.replaceCurrentLayout(res);
                                    me.raiseEvent({name:'rebuildLayout'});
                                    return;
                                }
                                // With new partial update mechanism
                                if (res.pukeys) {
                                    tgtDefs = fnGetTargetDefn.call(me, res.pukeys);
                                }
                                unloadAffectedLayouts(me, res);                

                                // Update this DocModel's "dataCache" with a hash of all the partial update nodes which are either targets or descendants of targets.
                                // Returned is an object with information about widgets that need to be updated as a result of this operation.
                                dataCacheUpdate = me.updateDataCache(res.data, tgtDefs,evt && evt.sid);
if (typeof(res) == 'object') {
                                // Update bean state and export options (if found in response).
                                mstrmojo.hash.copyProps(['bs', 'exopt', 'dty'], res, me);
}

                                var ue = {
                                        name: 'partialUpdate',
                                        tree: res.data,   // Partial update tree.
                                        ids: dataCacheUpdate
                                 };

                                 //if has info window, pass on the position.
                                if(!mstrmojo.hash.isEmpty(ue.ids.ifws)){
                                    if (evt && (evt.type === $RWTYPES.GRID || evt.type === $RWTYPES.GRAPH)) { // #4982622 add support for Graph
                                        ue.anchor = evt.anchor;
                                    } else {
                                        //Info windows should only be targetted by grids and no other objects.
                                        ue.ids.ifws = {};
                                    }
                                }

                                // Raise the 'partialUpdate' event so the doc widgets will hear it.
                                me.raiseEvent(ue);
                            },

                            complete: function () {
                                // Set ready state back to IDLE target widget definitions.
                                fnSetReadyState($RS.IDLE);
                            }
                        };


                    // Was the selector action from a panel selector?
                    if (evt.type == 3) {
                        if(!evt.tks) {
                            return;
                        }
                        // Get the key (element ID)...
                        var panelKey = evt.eid;

                        // and definition of the new panel.
                        var pnlDef = lookupDefn.call(this, this.defn, this.currlaykey, panelKey);

                        // Do we NOT have a panel definition?
                        if (!pnlDef) {
                            // This must be an on demand panel stack, so don't do anything.
                            return;
                        }

                        // Default dirty key is the panel key.
                        var dirtyKeys = panelKey,

                            // Utility to change active panel to new panel.
                            fnActivatePanel = function () {
                                tgtDefs[evt.tks].set('selKey', panelKey);
                            },

                            // State based success handler.
                            fnPanelState;

                        // Is the panel already loaded?
                        if (pnlDef.l) {

                            // Activate panel.
                            fnActivatePanel();

                            // Retrieve the collection of dirty children keys from the panel?
                            var dk = pnlDef.dirtyKeys;

                            // Were any dirty children found?  If so then the panel is already loaded, but has child widgets that are dirty so we
                            // need to request those widgets from the server.
                            if (!!dk) {

                                // Assemble dirty widget keys collection.
                                dirtyKeys = mstrmojo.hash.keyarray(dk).join(',');

                                // Reset the target definitions collection to the dirty children.
                                orignalTargetDefs = tgtDefs = fnGetTargetDefn.call(this, dirtyKeys, ',');

                                // Create the request success handler specific to dirty panels.
                                fnPanelState = function () {
                                    // Iterate updated widget keys and clear dirty status.
                                    $HFE(dataCacheUpdate.upd, function (v, updatedId) {
                                        // Try to get a widget for this definition.
                                        var updatedWidget = mstrmojo.all[updatedId];

                                        // If we find a widget then set its dirty flag to false.
                                        if (updatedWidget && updatedWidget.setDirty) {
                                            updatedWidget.setDirty(false);
                                        }
                                    });
                                };

                            } else {
                                // Panel is loaded and has no dirty children so all we need to do is silently update server with the newly visible panel key.
                                dataService.setCurrentPanel(panelKey, evt.tks, evt.ck);
                                return;
                            }

                        } else {
                            // Create the request success handler specific to newly requested panels.
                            fnPanelState = function () {
                                    // Set the currently selected key.
                                fnActivatePanel();

                                    // Mark the definition as loaded.
                                    pnlDef.l = true;
                            };
                                }

                        // Add extra "success" processing for Panel slicing operations.
                        var fnSuccess = callback.success;
                        callback.success = function (res) {

                                // Get the new units from the xhr definition node.
                            var lyt = getLayout(res.defn, me.currlaykey),
                                oldLyt = getLayout(me.defn, me.currlaykey),
                                fnAppendNewProps = function (oldObj, newObj) {
                                        for (var u in newObj) {
                                            // Insert the new definition into the old collection if it's not there already.  We don't want to override any definitions because
                                            // they may be currently observed or contain cached information that we don't want to lose.
                                            if (oldObj[u] === undefined) {
                                                oldObj[u] = newObj[u];
                                            }
                                        }
                                    },
                                    newUnits = lyt && lyt.units,
                                    oldUnits = oldLyt && oldLyt.units,
                                    newCGBMap = lyt && lyt.cgbMap,
                                    oldCGBMap = oldLyt && oldLyt.cgbMap;

                                // If we have new units we need to insert them into the existing definition units.
                                if (newUnits) {
                                fnAppendNewProps(oldUnits, newUnits);
                                }

                                //If we have new objects in the CGBMap, insert them into the existing definition map
                                if (newCGBMap) {
                                    fnAppendNewProps(oldCGBMap, newCGBMap);
                                    
                                    //Raise an event to all the listeners who want to know if the Control Group By Map has changed (Selectors, Grid/Graph as selector)
                                    me.raiseEvent({
                                        name: 'CGBMapChange',
                                        cgbMap: oldCGBMap
                                    });
                                }

                            // Call the default slice success function.
                            fnSuccess(res);

                            // Call the panel state success function.
                            fnPanelState();

                            // Notify the panel stack that the current panel isn't dirty.
                            var panelStack = fnGetWidget(evt.tks, 0);
                            if (panelStack) {
                                panelStack.clearDirtyChild(panelKey);
                            }
                        };

                        // Either the panel isn't loaded or it's got dirty children so make request for the panel.
                        dataService.requestNewPanel(panelKey, evt.tks, evt.ck, dirtyKeys, !evt.hasLoader, callback);

                    } else {

                        // Wrap default slice success handler with custom handler for non-panel operations.
                        callback = $WRAP(callback, {
                            success: function (res) {

                                // Iterate target definition keys.
                                $HFE(orignalTargetDefs, function (def, targetKey) {
                                    // Get the widget (default to slice id 1 because dirty state is stored in definition).
                                    var targetWidget = fnGetWidget(targetKey, 1);

                                    // Is there no widget for this definition?
                                    if (!targetWidget) {
                                        // Skip.
                                        return;
                                    }

                                    // Was the definition for this widget not updated?
                                    if (!(targetKey in dataCacheUpdate.def)) {

                                        // Notify the widget that it's dirty.
                                        targetWidget.setDirty(true);

                                    // Target widget was updated, but is this a panel stack?
                                    } else if (def.t == $RWTYPES.PANELSTACK) {

                                        // Tell the widget that it's hidden panels are dirty.
                                        targetWidget.setDirtyChildren();
                                    }
                                });
                            }
                        });

                        var args, methodName;

                        // Is the source of this slice a graph?
                        if (evt.type == $RWTYPES.GRAPH) {
                            // Apply graph selector.
                            methodName = 'applyGraphSelectorAction';
                            args = [ evt.ck, evt.cks, evt.sid, evt.x, evt.y, callback, me.zf];
                        } else {

                            // Apply normal selector.
                            // Create the task parameters to slice the targets.
                        if(evt.isMultipleEvents){
                        	methodName = 'RWEventsTask';
                            params = {
                                    messageID: this.mid,
                                    styleName: 'RWDocumentMojoStyle',
                                    events: evt.events
                            };
                            args = [params, callback];
                        } else if ('eid' in evt) { //element id is only used for setDocSelectorElements task
                                methodName = 'setDocSelectorElements';
                                args = [ evt.ck, evt.eid, evt.ctlKey, evt.include, callback , me.zf];
if (evt.disablePU) {
                                         args = args.concat([null, 0, 3]);
                                 }
                            } else {
                                if (evt.unset) {
                                    methodName = 'setDocUnsetSelector';
                                    args = [ evt.ck, evt.ckey, callback, me.zf];

                                } else if ('srct' in evt && evt.srct == 4) {//metric condition selector
                                    if (evt.onlyInclude){
                                        methodName = 'setDocSelectorInclude';
                                        args = [ evt.ckey, evt.include, callback, evt.srcid, evt.srct, me.zf];

                                    } else {
                                        methodName = 'setDocSelectorExpression';
                                        args = [ evt.ck, evt.ckey, evt.srcid, evt.srct, evt.f, evt.ft, evt.include, evt.cs, 5, callback, me.zf];

                                        if (!evt.cs) {
                                            args[7] = null;
                                            args[8] = null;

                                            if (evt.changeQual) {
                                                //Set the RWUnit properties
                                                dataService.setRWUnitProperties(evt.ckey, evt.ckey + '\u001F' + 'FormattingSelector' + '\u001F' + 'MetricConditionType' + '\u001F' +evt.qt, 1, false, null);

                                                args.push(evt.unset);
                                            }
                                        }

                                    }
                                } else {
                                    methodName = 'setDocSelectorInclude';
                                    args = [ evt.ckey, evt.include, callback ];

                                }
                            }
                        }

                        if (methodName) {
                            dataService[methodName].apply(dataService, args);
                        }
                    }

                } catch (ex) {
                    mstrmojo.err(ex);
                }
            },

            /**
             * Returns the data cache for the indicated layout node.
             *
             * @param {String} key The key of the requested layout data cache.
             *
             * @type Object
             */
            getLayoutDataCache: function getLayoutDataCache(key) {
                // Did we NOT get a valid key?
                if (!key) {
                    return null;
                }

                var dc = this.dataCache;
                // Is there no dataCache container?
                if (!dc) {
                    // Initialize it.
                    dc = this.dataCache = {};
                }

                // Is there no dataCache for the current layout?
                if (!dc[key]) {
                    // Initialize it.
                    dc[key] = {};
                }

                return dc[key];
            },

            /**
             * Update this DocModel's dataCache after a slice/drill update action with a flat lookup of
             * nodes in the result tree which are either targets or descendants of targets.
             *
             * @param {Object} tree The partial update tree.
             * @param {Object[]} tks The collection of update target definition nodes.
             *
             * @returns {Object} An object with information about widgets that need to be updated as a result
             *      of this operation.
             */
            updateDataCache: function updDC(tree, tks, sid) {

                var me = this,
                    dc = this.getLayoutDataCache(this.getCurrentLayoutKey()),
                    _result = {
                        ifws: {},    // Collection of panel stack IDs who shall be rendered as Info Window.
                        upd: {},    // Collection of widget IDs whose data needs to be updated (via update method).
                        tgts: {},   // Collection of widget IDs that where actually targeted in this operation (need to be refreshed).
                        def: {},    // Collection of widget IDs whose definitions may have been updated (so they are no longer dirty).
                        secs: {}    // Collection of Subsection widget IDs that contain targeted widgets as direct children (for updating CanGrow/CanShrink).
                    };

                /**
                 * <p>Utility search function to find data nodes in a tree that are either targets or descendants of targets</p>
                 *
                 * <p>The search results are stored in this DocModel's "dataCache" property as a hashtable, keyed by node id.</p>
                 *
                 * @param {Object} node The node whose descendants should be iterated.
                 * @param {Boolean} wasInst Whether the parent of the passed in node has been instantiated.
                 * @param {String} [activeKey] The key of the current target.
                 *
                 * @inner
                 */
                function findTgtDescendants(node, wasInst, activeKey) {

                    var isInst = false,   // Flag to indicate that the current node has been instantiated (assume false).
                        chnodes = me.getChildren(node, true), // Fetch the children of the current node.
                        w;              // Holds a reference to the instantiated parent widget.

                    // Do we have children?
                    if (!chnodes.length) {
                        // No children, so nothing to do.
                        return;
                    }

                    // Was the parent of this node instantiated?
                    if (wasInst) {
                        // Try to get the current instance of the widget for this node.
                        w = mstrmojo.all[node.id];

                        // Set the instantiation flag based on the existence of a widget for this node in the registry.  If
                        // we don't have an id that means it's the root layout node so assume it's instantiated already.
                        isInst = !node.id || !!w;
                    }

                    var nodeDefn = node.defn,
                        nodeData = node.data,
                        selectedPanelKey;
                
                    // Is the current node an on demand panel stack?
                    if (nodeDefn && nodeDefn.t === $RWTYPES.PANELSTACK && nodeDefn.od) {
                        // Cache the selected panel key.
                        selectedPanelKey = nodeData.selKey;
                    }
                    
                    // Iterate through the children of this node...
                    for (var cnt in chnodes) {
                        var ch = chnodes[cnt],
                            childKey = ch.k,
                            id = ch.id,
                            localActiveKey = null;

                        //Check if the child has been instantiated? Then set the is instantiated flag.
                        if (mstrmojo.all[id]) {
                            isInst = true;
                        }

                        // Are we at a target now?
                        if (childKey in tks) {

                            if (isInfoWindowPS.call(me, childKey) && isCurrentSlice(ch.data, sid)) {
                                // Add the new data node to the data cache.
                                dc[id] = ch;
                                _result.ifws[childKey] = id; //need the id later on
                                //continue;
                            }

                            // Update the active key.
                            localActiveKey = childKey;

                            // Was the parent instantiated?
                            if (isInst) {
                                // Add the id to the result so that we know which widgets to refresh.
                                _result.tgts[id] = true;

                                var secDef = w && w.defn,
                                    ty = secDef && secDef.t,
                                    ck = secDef && secDef.ck;

                                // Is the parent an instantiated Subsection and will this child possibly change it's dimensions?
                                if (ty === $RWTYPES.SUBSECTION && (ck && (childKey in ck))) {
                                    // Add the subsection id so that we know which subsection need to perform CanGrow/CanShink.
                                    _result.secs[w.id] = true;
                                }
                            }
                        }

                        // Are we at or below a target AND are we not within a panel stack OR is this the selected panel?
                        if ((activeKey || localActiveKey) && (!selectedPanelKey || selectedPanelKey === childKey)) {
                            // Add the new data node to the data cache.
                            dc[id] = ch;

                            // Add the key to the result so we know which widget definitions dirty status has changed.
                            _result.def[childKey] = true;

                            // Is the parent instantiated?
                            if (isInst) {
                                // Add the id to the result so that we know which widgets to update.
                                _result.upd[id] = true;
                            }
                        }

                        // Recursively walk the children of this node.
                        findTgtDescendants(ch, isInst, activeKey || localActiveKey);
                    }
                }

                // Kick off the search at the top of our result tree (if any).
                if (tree && tree.layouts && tks) {
                    // Find the tree for the current layout and build it.
                    findTgtDescendants(mstrmojo.array.filter(tree.layouts, function (l) {
                            return (l.loaded);
                        }, {
                            max: 1
                        })[0], true);
                }

                return _result;
            },
            /**
             * This method should return the control group bys - target keys map.
             */
            getCGBMap: function getCGBMap(){
                var lyt = getLayout(this.defn, this.currlaykey);

                return lyt && lyt.cgbMap;
            },

            executeLink: function executeLink(url, target, src) {
                this.controller.onLink(
                        this,
                        {
                    url: url,
                            target: target,
                            src: src || null
                        }
                 );
            },

            /**
             * Request new incremental fetch grid data from the server.
             *
             * @refactoring This method assumes the data will be in the first layout (tree.layouts[0]) which may not be correct now that we have multi-layout documents.  Also, it
             *         would make the interface much cleaner if we passed in nodeKey, rowPosition, maxRows, colPosition and maxCols as a single parameterized object.  The only place
             *         they are used in this method is to create a parameterized object for the xhr.
             */
            downloadGridData: function downloadGridData(params) {
                var me = this,
                    widgetID = params.xtabId,
                    memo = params.memo,
                    w = mstrmojo.all[widgetID],
                    dataService = this.getDataService();

                var callback = {
                        success: function (res) {
                            // function to recursively search for our widget node.
                            function findWidgetData(/*Object*/ node, /* String */ wID) {
                                // Fetch the given node's immediate children.
                                var chnodes = me.getChildren(node, true);

                                // For each child...
                                for (var cnt in chnodes) {
                                    var ch = chnodes[cnt];
                                    if(wID == ch.id) {
                                        return ch;
                                    }

                                    // Recursively walk the children of this node.
                                    var w = findWidgetData(ch, wID);
                                    // If we found one, end the searching; otherwise, loop to the next child
                                    if(w) {
                                        return w;
                                    }
                                }
                                return null;
                            }

                            // new tree.
                            var tree = res.data,
                                newGridData = null,
                                nodeDef, //node definition
                                lyt = tree && getLayout(tree, me.currlaykey);

                            // Kick off the search at the top of our result tree (if any).
                            if (lyt) {
                                newGridData = findWidgetData(lyt, widgetID);
                            }

                            if (newGridData && w) {
                                w.dataDownloaded(newGridData, memo);
                            }

                            if(lyt && lyt.xtabStyles) {
                                me.raiseEvent({
                                    name: 'updateStyles',
                                key: lyt.k,
                                    updatedStyles: lyt.xtabStyles
                                });
                            }

                            //update graph data if needed
                            nodeDef = lookupDefn.call(me, me.defn, me.currlaykey, params.nodeKey);
                            if(nodeDef && nodeDef.t === $RWTYPES.GRIDGRAPH && memo.recalculating) {
                                var gg = w.parent,
                                    gp = gg && gg.getGraphWidget();
                                if(gg && gp && gg.updateGraph) {
                                    gg.updateGraph(findWidgetData(lyt, gp.id));
                                }
                            }

                        },

                        failure: function() {
                            if(w.dataDownloadErr) {
                                w.dataDownloadErr();
                            }
                        }
                };

                dataService.downloadGridData(params, callback);
            },

            /**
             * Saves property changes to the web server.
             *
             * @param {String} the key for the node whose properties is saving.
             * @param {Object} props An key/value object where the key is the RWUnit key and the value is another object with property name/value pairs.
             * @param {Integer} [type=1] The type of formatting operation (1: Main; 2: Title).
             * @param {Boolean} loadData Whether saving should bring data back. When this param is false, this save process will just be one way action.
             * @param (Object) callback An key/value object where the call back functions are defined to be invoked when saveRWProperties task finishes.
             */
            saveRWProps: function saveRWProps(nodeKey, props, type, loadData, callback) {
                var data = [],
                    d = '\u001F';

                // Iterate keys...
                $HFE(props, function (o, key) {
                    // Iterate properties for eaach key...
                    $HFE(o, function (v, p) {
                        // Add item separated string to data.
                        data.push(key + d + p + d + v);
                    });
                });

                // Do we have NO data?
                if (!data.length) {
                    // Nothing to do.
                    return;
                }

                // Do we expect data to be returned?
                    if (loadData) {
                    // Get definition of node being saved.
                    var g = lookupDefn.call(this, this.defn, this.currlaykey, nodeKey),
                        fnReadyState = function (rs) {
                            g.set('readyState', rs);
                        };

                    // Wrap callback methods to change definition readyState to...
                    callback = $WRAP(callback, {
                        submission: function () {
                            // waiting...
                            fnReadyState($RS.WAITING);
                        },

                        complete: function () {
                            // idle...
                            fnReadyState($RS.IDLE);
                        }
                    });
                }

                // Use data provider to save property values.
                this.getDataService().setRWUnitProperties(nodeKey, data.join('\u001E'), type || 1, loadData, callback);
            },

            loadPartialData: function loadPartialData(data, nodeKey){
                // find the target that is being sorted upon
                var tgtDef =  {};
                tgtDef[nodeKey] = lookupDefn.call(this, this.defn, this.currlaykey, nodeKey);


                // Update this DocModel's "dataCache" with a hash of all the
                // partial update nodes which are either targets or descendants of targets.
                var ids = this.updateDataCache(data, tgtDef),
                    dc = this.getLayoutDataCache(this.getCurrentLayoutKey()),
                    me =  this;

                // Iterate layouts.
                mstrmojo.array.forEach(data.layouts, function (l) {
                    if(l && l.xtabStyles) {
                        me.raiseEvent({
                            name: 'updateStyles',
                            key: l.k,
                            updatedStyles: l.xtabStyles
                        });
                    }
                });

                // update the components
                $HFE(ids, function (col, meth) {
                    if (meth === 'upd') {
                        $HFE(col, function (v, id) {
                            // Get the widget.
                            var w = mstrmojo.all[id];
                            // Does the widget have this method?
                            if (w && w.update) {
                                w.update(dc[id]);
                            }
                        });
                    }
                });
            },

            /**
             * <p>Adds the id for units with 'Fit to Content' width mode to the internal auto width mode collection for the current layout.</p>
             *
             * <p>IDs should only be added after they are rendered</p>
             *
             * @param {String} id The id of the the
             */
            addAutoWidthID: function addAutoWidthID (id) {
                var aws = this.aws || {},
                    units = aws[this.currlaykey] || [];

                // Push the new id into the collection for this layout.
                units.push(id);

                // Set the collection back onto the auto width collection.
                aws[this.currlaykey] = units;

                // Set the auto width collection back onto the model.
                this.aws = aws;
            },

            /**
             * <p>Returns an array of IDs for rendered widgets in the current layout that have a 'Fit to Content' width mode.</p>
             *
             * <p>The IDs are removed from the collection after they are returned.</p>
             *
             *  @returns String[]
             */
            getAutoWidthIDs: function getAutoWidthIDs() {
                var aws = this.aws,
                    l = this.currlaykey;

                // Do we have a collection of id's for this layout?
                var ids = aws && aws[l];
                if (ids) {
                    // Delete the collection so it's not used later.
                    delete aws[l];
                }

                return ids;
            }
        }
    );
})();

