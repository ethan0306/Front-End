(function () {

    mstrmojo.requiresCls("mstrmojo.dom",
                         "mstrmojo.array",
                         "mstrmojo.hash",
                         "mstrmojo.StringBuffer");

    var $D = mstrmojo.dom,
        $H = mstrmojo.hash,
        $A = mstrmojo.array;

    /**
     * Destroys any infoWindows associated with this document.
     *
     * @private
     */
    function destroyInfoWindows() {
        // Iterate infoWindow map and destroy each.
        $H.forEach(this.ifwMap, function (infoWindow) {
            infoWindow.destroy();
        });

        // Reset infoWindow map.
        this.ifwMap = {};
    }

    /**
     * A mixin to add Report Services Document functionality to widgets.
     */
    mstrmojo._IsRwDocument = {

        _mixinName: 'mstrmojo._IsRwDocument',

        /**
         * <p>Updates the style section in the header with the new styles string.</p>
         *
         * <p>If the items in the newStyles objects already exist, the cached xtabStyle replaces the items with the new
         * values in newStyle object. Otherwise, it will append the new style strings in the end.</p>
         *
         * @param {Object} newStyles A JSON object with grid name as the keys and style string as the values.
         */
        updateXtabStyles: function updateXtabStyles(layoutKey, newStyles) {
            var styleSheet = this.xtabStyleSheet,
                styleList = this.styleList || {},    // Map object which keeps the style maps for each layout.
                fnAddStyles = function (tgt, src) {  // Helper function to add the style string into map.
                    var srcKey;

                    // Iterate keys in source styles object.
                    for (srcKey in src) {
                        // Retrieve the new css.
                        var newCss = src[srcKey].css || '';

                        // Is the app flag on?
                        if (src[srcKey].app) {
                            // Append the new css.
                            newCss = (tgt[srcKey] || '') + newCss;
                        }

                        // Set combined (or replaced) css on target.
                        tgt[srcKey] = newCss;
                    }

                    return tgt;
                },
                doc = document;

            // Do we not already have existing styles for the current layout?
            if (!styleList[layoutKey]) {
                // Initialize with existing xtab styles.
                styleList[layoutKey] = fnAddStyles({}, this.model.getSelectedXtabStyles(layoutKey));
            }

            // Add new styles to the current styles.
            fnAddStyles(styleList[layoutKey], newStyles);

            // Does the stylesheet element NOT already exist?
            if (!styleSheet) {
                // Append new style element to head.
                styleSheet = this.xtabStyleSheet = doc.getElementsByTagName('head')[0].appendChild(doc.createElement("style"));
            }

            // Build css text.
            var cssText = new mstrmojo.StringBuffer(),
                tgt,
                css;
            for (tgt in styleList) {
                for (css in styleList[tgt]) {
                    cssText.append(styleList[tgt][css]);
                }
                cssText.append('\n');
            }

            // Convert to string.
            cssText = cssText.toString();

            // Do we have a style sheet and new css text?
            if (styleSheet && cssText) {
                // In some browsers (IE), we need to manipulate the <style>'s "styleSheet" child object;
                // in others, we just manipulate the <style> directly.
                styleSheet = styleSheet.styleSheet || styleSheet;

                // Is this a webkit browser?
                if ($D.isWK) {
                    // Does the stylesheet already have a first child?
                    var firstChild = styleSheet.firstChild;
                    if (firstChild) {
                        // Replace node value with new css.
                        firstChild.nodeValue = cssText;
                    } else {
                        // Append new css as text node.
                        styleSheet.appendChild(doc.createTextNode(cssText));
                    }

                } else {
                    // For IE we use cssText, for others we replace innerHTML.
                    styleSheet[$D.isIE ? "cssText" : "innerHTML"] = cssText;

                }
            }

            // Store the style list back on the instance.
            this.styleList = styleList;
        },

        /**
         * Overridden to set event listeners on the model to hear when the document model has been updated.
         *
         * @ignore
         */
        buildChildren: function buildChildren(noAddChildren) {
            var rtn;

            try {
                var m = this.model;
                if (m) {
                    var subs = this.buildSubs || {},
                        s = m.id + '-partialUpdate',
                        r = m.id + '-rebuildLayout',
                        u = m.id + '-updateStyles',
                        id = this.id;

                    // Create subscriptions.
                    if (subs[s] === undefined) {

                        /**
                         * <p>Asks the model for a set of nodes that represent changes in descendant widgets resulting from
                         * some update operation, like a slice.</p>
                         *
                         * <p>This method is responsible for overseeing the update of the descendant widgets; it asks each appropriate
                         * widget to update its changed data and to refresh.</p>
                         *
                         * @param {mstrmojo.Event} evt The partialUpdate event.
                         * @inner
                         */
                        var fnUpdate = function updateDescendants(evt) {
                            var m = this.model,
                                dataCache = m && m.getLayoutDataCache(m.getCurrentLayoutKey()),
                                ids = evt && evt.ids;

                            // Do we have an empty data cache OR do we not have an ids object?
                            if ($H.isEmpty(dataCache) || !ids) {
                                // No, then there is nothing to do.
                                return;
                            }

                            // Iterate layouts.
                            $A.forEach(evt.tree.layouts, function (l) {
                                // Is this the current layout?
                                if (l.k === m.currlaykey) {
                                    // Update xtab styles.
                                    this.updateXtabStyles(l.k, l.xtabStyles);

                                    // Return false so iteration will cease.
                                    return false;
                                }
                            }, this);

                            var $FE = $H.forEach,
                                shouldNotifyScrollListeners = false,
                                ups = {
                                    update: ids.upd,
                                    refresh: ids.tgts,
                                    adjustSectionSize: ids.secs
                                };

                            // For every info window, instantiate and render it.
                            $FE(ids.ifws, function (psId, psKey) {
                                // TQMS #555940: Invalidate the existing info window so that children can revert there state (to avoid lingering graph images, etc). 
                                this.showInfoWindow(psId, psKey, evt.anchor, true);
                            }, this);

                            // Iterate collection of ids/methods to be called on widgets.
                            $FE(ups, function (col, meth) {
                                // Iterate ids in this collection.
                                $FE(col, function (v, id) {
                                    // Get the widget.
                                    var w = mstrmojo.all[id],
                                        rtn;

                                    // Does the widget have this method?
                                    if (w && w[meth] !== undefined) {
                                        // Call the method, passing in the node from the dataCache.
                                        // XZ: only update needs the cached data as the parameter.
                                        rtn = w[meth](meth === 'update' ? dataCache[id] : null);

                                        //Calculate whether we need to notify the scroll listeners
                                        if (meth === 'adjustSectionSize' && rtn) {
                                            //TQMS 479853/436050:  Need to render the objects that are originally not in the viewport.
                                            shouldNotifyScrollListeners = shouldNotifyScrollListeners || (!!rtn.heightReduced);
                                        }
                                    }
                                }, this);
                            }, this);

                            var selectedLayout = this.getSelectedLayoutWidget();

                            //Notify scroll listeners that they may now be in view and need to be rendered.
                            if (shouldNotifyScrollListeners) {
                                selectedLayout.notifyScrollListeners();
                            }

                            // Auto width units may have rerendered so we call resizeOrReposition to make sure
                            // width of layout is correct.
                            var docLayout = selectedLayout.docLayout;
                            if (docLayout) {
                                docLayout.resizeOrReposition();
                            }

                        };

                        subs[s] = m.attachEventListener('partialUpdate', id, fnUpdate);
                    }

                    // Attach an event listener to hear when the document layout should be rebuilt.
                    subs[r] = subs[r] || m.attachEventListener('rebuildLayout', id, function (evt) {
                        //TQMS 518043. The OIVM and Mobile documents us different layouts collections.
                        this.onLayoutRebuilt(this.rebuildLayout(evt.src.currlaykey, this.getLayouts()));
                    });

                    // Attach an event listener to hear when the document style is changed.
                    subs[u] = subs[u] || m.attachEventListener('updateStyles', id, function (evt) {
                        this.updateXtabStyles(evt.key, evt.updatedStyles);
                    });

                    this.updateXtabStyles(m.getCurrentLayoutKey());

                    //attache refresh event listener
                    m.attachEventListener('refresh', this.id, function () {
                        this.refresh();
                    });
                }

                rtn = this._super(noAddChildren);


            } catch (ex) {
                mstrmojo.err(ex);
            }

            return rtn;
        },

        /**
         * Displays an info window.
         * 
         * @param {String} psId The id of the panel stack.
         * @param {String} psKey The RW unit key of the panel stack.
         * @param {HTMLElement} anchor The HTML Element to which the info window should be anchored.
         * @param {Boolean} [invalidateChildren=false] Whether to invalidate the children before opening the info window.
         * 
         */
        showInfoWindow: function showInfoWindow(psId, psKey, anchor, invalidate) {
            var id = psId + "_ifw",
                infoWindow = mstrmojo.all[id],
                domNode = this.domNode;

            // Do we already have an info window widget?
            if (infoWindow) {
                // Should we invalidate the info window?
                if (invalidate) {
                    // Invalidate it.
                    infoWindow.invalidate();
                }

                // Open info window.
                infoWindow.open(this, {
                    anchor: anchor,
                    boundary: domNode
                });

            } else {
                var builder = this.builder;

                // Create new info window.
                infoWindow = builder.newInfoWindow({
                    anchor: anchor,
                    boundary: domNode,
                    parent: this,
                    builder: builder,
                    model: this.model,
                    psKey: psKey,
                    psId: psId,
                    id: id
                });

                // Render info window.
                this.renderInfoWindow(infoWindow);

                // Get info window map (or create if missing) and store new info window in map.
                var infoMap = this.ifwMap = (this.ifwMap || {});
                infoMap[psId] = infoWindow;
            }
        },

        /**
         * This method renders a info window for the RW Document.
         */
        renderInfoWindow: function renderInfoWindow(infoWindow) {
            infoWindow.render();
        },

        /**
         * Overridden to destroy info windows.
         *
         * @ignore
         */
        unrender: function unrender(ignoreDom) {
            // Make sure info windows have been destroyed.
            destroyInfoWindows.call(this);

            this._super(ignoreDom);
        },

        getLayouts: function getLayouts() {
            return this._layouts;
        },

        /**
         * Returns the layout with specified key. If the key is not specified
         * it will return the current layout. 
         */
        getLayout: function getLayout(key) {
        	key = key || this.model.getCurrentLayoutKey();
        	var layouts = this.getLayouts();
        	return layouts[$A.find(layouts, 'k', key)]
        },
        
        getNewLayout: function getNewLayout(params, layouts, isSelected, callback) {
            var me = this,
                model = me.model,
                dataService = model.getDataService(),
                key = params.layoutKey,
                layout = layouts[$A.find(layouts, 'k', key)];  // existing layout

            // Has the newly selected layout NOT been loaded yet or do we want to reload on purpose?
            if (layout.defn && (params.reload || layout.defn.loaded === false)) {
                // Replace callback success method.
                var fnSuccess = callback.success;
                callback.success = function (res) {

                    // Replace the data for this new layout.
                    model.replaceLayout(key, res);

                    // Since we just requested this layout from the server the server now thinks it's the current layout so we should update
                    // the current layout key on the model.
                    model.currlaykey = key;

                    // Will the new layout be selected?
                    if (isSelected) {
                        // TQMS 496226: Set the zoom factor value first
                        layout.zf = res.zf;

                        // Select the layout (passing false so the server is not updated).
                        me.selectLayout(layout, false);
                    }

                    // Pass the newly created layout viewer back to the callback.
                    fnSuccess(me.rebuildLayout(key, layouts));
                };

                // Ask data service to retrieve layout from server.
                dataService.loadDocLayout(params, callback);

            } else {
                // Pass the original layout back to the callback.
                callback.success(layout);

                // Should the new layout be selected?
                if (isSelected) {
                    // Update the server if the new layout is different than the current layout.
                    this.selectLayout(layout, true, {
                        success: function (res) {
                            $H.copyProps(['bs'], res, model);
                        }
                    });
                }
            }
        },

        selectLayout: function selectLayout(layout, updateServer, callback) {
            // Pull the key out of the layout and figure out if it's different then the models current layout key.
            var model = this.model,
                key = layout.k,
                isNewKey = (key !== model.currlaykey);

            // Replace current layout key on the model.
            model.currlaykey = key;

            // Restore the layout state.
            this.restoreLayoutState(layout);

            // Was a server update requested AND did the layout key actually change?
            if (updateServer && isNewKey) {
                // Update the server.
                model.getDataService().setCurrentDocLayout(key, callback);

            // No server update, but do we have a callback complete handler?
            } else if (callback && callback.complete) {
                // Call the callback complete.
                callback.complete();
            }

            // Return the layout.
            return layout;
        },

        /**
         * Destroys the current mstrmojo.DocLayoutViewer and then builds a mstrmojo.DocLayoutViewer for the supplied key.
         *
         *  @param {String} k The key of the layout to create.
         *
         *  @type mstrmojo.DocLayoutViewer
         *  @returns The newly created {@link mstrmojo.DocLayoutViewer} widget.
         *
         *  @private
         */
        rebuildLayout: function rebuildLayout(k, layouts) {
            var model = this.model,
                findLayout = $A.find,
                oldLayout = layouts[findLayout(layouts, "k", k)],
                nodes = model.getChildren(this.node, false);

            var newLayout = nodes[findLayout(nodes, 'k', k)];

            // Replace the old child with newly built children nodes.
            var c = this.replaceLayout(oldLayout, newLayout);

            // Update Xtab styles for new layout.
            this.updateXtabStyles(k, model.getSelectedXtabStyles(k));

            // Remove all existing info windows.
            destroyInfoWindows.call(this);

            // Return new DoclayoutViewer.
            return c;
        },

        /**
         * @see mstrmojo.Widget
         */
        destroy: function destroy() {

            // Destroy any info windows when the document is destroyed [TQMS#494881]
            destroyInfoWindows.call(this);

            //Call super to destroy the RW document.
            if (this._super) {
                this._super();
            }

            // Delete the lingering CSS styles.
            var xtabSheet = this.xtabStyleSheet,
                parentNode = xtabSheet && xtabSheet.parentNode;

            if (parentNode) {
                parentNode.removeChild(xtabSheet);
            }
        },

        /**
         * <p>Abstract method to replace one layout with another.</p>
         *
         * <p>Consumers of this mixin will implement this method to decide how they want to replace layout.</p>
         *
         * @param {mstrmojo.DocLayoutViewer} oldLayout The old layout viewer to replace.
         * @param {Object} newLayoutNode The node for creating the new layout viewer.
         *
         * @returns{mstrmojo.DocLayoutViewer} The newly created DocLayoutViewer.
         */
        replaceLayout: mstrmojo.emptyFn,

        /**
         * <p>Abstract method to perform any custom layout state restoration in consumers of this mixin.</p>
         *
         * @param
         */
        restoreLayoutState: mstrmojo.emptyFn,

        /**
         * Called after the model has requested that the current layout be rebuilt.
         *
         * @param {mstrmojo.DocLayoutViewer} layout The newly rebuild layout viewer.
         */
        onLayoutRebuilt: mstrmojo.emptyFn,
        
        /**
         * Unloads non-current layouts with the same group by as specified
         */
        unloadGbLayuts: function unloadGbLayuts(groupbyKey) {
    	    var layouts = this.getLayouts(),
    		    curLayoutKey = this.model.getCurrentLayoutKey(),
    		    layout, i, gb, groupbys, k, 
    		    gbDssId;
    	
    		//First find the changed group by DSS ID
    		layout = this.getLayout();
    		groupbys = layout.gb && layout.gb.groupbys;
    		for ( k = 0; k < groupbys.length; k++ ) {
    			gb = groupbys[k];
    			if ( gb.k === groupbyKey) {
    				gbDssId = gb.unit.target.did;
    				break;
    			}
    		} 
    		
    		//Now unload layouts containing group bys with the same DSS ID as changed group by.
    		for ( i = 0; i < layouts.length; i++ ) {
    			layout = layouts[i];
    			if ( layout.k === curLayoutKey) {
    				continue;
    			}
    			groupbys = layout.gb && layout.gb.groupbys;
    			if ( groupbys && groupbys.length ) {
    				for ( k = 0; k < groupbys.length; k++ ) {
    					gb = groupbys[k];
    					if ( gb.unit.target.did === gbDssId) {
    	    				//Instead of physically unloading the layout we simply mark is as not-loaded.
    	    				//Next time we switch to this layout it will be loaded.
    	    				layout.defn.loaded = false;
    						break;
    					}
    				} 
    			}
    		}
        }    
        

    };
}());