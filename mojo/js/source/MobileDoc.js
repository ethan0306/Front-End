(function () {

    mstrmojo.requiresCls("mstrmojo.MobileBooklet",
                         "mstrmojo._HasBuilder",
                         "mstrmojo._IsRwDocument",
                         "mstrmojo.android.EnumMenuOptions",
                         "mstrmojo.hash",
                         "mstrmojo.array",
                         "mstrmojo.DocModel");

    mstrmojo.requiresDescs(4174, 8429, 8430);

    var $A = mstrmojo.array,
        $AFE = $A.forEach,
        OR_PORTRAIT = 1,
        OR_LANDSCAPE = 2,
        MENUS = mstrmojo.android.EnumMenuOptions,
        MNU_LAYOUTS = MENUS.DOC_LAYOUTS,
        MNU_FULLSCREEN = MENUS.FULL_SCREEN;

    /**
     * Returns TRUE if layout is for use as info window
     * @private
     */

    function isInfoWindowLayout(l) {
        return (typeof l.defn.iw !== "undefined" && l.defn.iw);
    }

    /**
     * Returns the current device screen orientation.
     *
     * @param {Boolean} [verify=false] If true we will ignore the cached orientation value and check with device.
     *
     * @type Integer
     * @private
     */
    function getDeviceOrientation(verify) {
        if (verify || this._isLandscape === undefined) {
            this._isLandscape = (mstrMobileApp.getOrientation() === OR_LANDSCAPE);
        }

        return (this._isLandscape) ? OR_LANDSCAPE : OR_PORTRAIT;
    }

    /**
     * Returns the current orientation according to the _ignoreOrientation flag as well as the indicated orientation from mstrApp.
     *
     * @private
     */
    function getOrientationValue() {
        // Default to all.
        var or = OR_PORTRAIT + OR_LANDSCAPE;

        // Is the device NOT a tablet and are we NOT ignoring orientation right now?
        if (!mstrApp.isTablet() && !this._ignoreOrientation) {
            // Set orientation based on the device orientation as determined in the mstrApp.
            or = getDeviceOrientation.call(this);
        }

        // Return orientation.
        return or;
    }

    /**
     * Creates and returns a label configured as the layout loading place holder.
     *
     * @param {mstrmojo.Widget} view The view that the place holder should be based on (placeholder will contain same "n" and "k" properties).
     *
     * @private
     * @returns {mstrmojo.Label}
     */
    function getLoadingPlaceholder(view) {
        return new mstrmojo.Label({
            cssClass: 'pre-loader',
            n: view.n,
            k: view.k,
            isPreloader: true
        });
    }

    /**
     * Returns the current layout from the _layouts collection based on the current layout key of the model.
     *
     * @type Object
     * @private
     */
    function getCurrentLayout() {
        var layouts = this._layouts;
        return layouts[$A.find(layouts, 'k', this.model.getCurrentLayoutKey())];
    }

    /**
     * <p>Finds the next layout in the supplied direction that supports the current orientation.</p>
     *
     * <p>NOTE: This method will wrap to the beginning (or end if reverse direction) of layouts collection.</p>
     *
     * @param {Integer} index The index (within the _layouts collection) at which to start looking.
     * @param {Boolean} direction TRUE if we should look forward in the collection, FALSE to look backward.
     *
     * @private
     * @returns Null if no layout was found, or an object with a layout property (matching the found layout) and a wrap property indicating that we had to
     *          wrap to the beginning (or end) to find the layout.
     *
     */
    function findNextLayout(index, direction) {
        var allLayouts = this._layouts,
            orientation = getOrientationValue.call(this),
            wrapIdx = allLayouts.length - 1 - index,        // The index as which we will know that we wrapped around layouts (default to direction forward).
            hasWrapped = false,
            layout;

        // Pull out all layouts after the current layout (as indicated by index).
        var layouts = allLayouts.slice(index + 1);

        // Is this not the first layout?
        if (index) {
            // Add the layouts before the current layout.
            layouts = layouts.concat(allLayouts.slice(0, index));
        }

        // Is this a back operation?
        if (!direction) {
            // Reverse order of layouts.
            layouts.reverse();

            // Reset wrap index to the supplied index.
            wrapIdx = index;
        }

        // Iterate layouts.
        $AFE(layouts, function (l, idx) {

            // Is this the wrap index?
            // We didn't find a layout in the indicated direction so we've wrapped to the beginning (or end if !direction).
            hasWrapped = (idx >= wrapIdx);

            // Does this layout support the current orientation AND is not an info window layout?
            if (((l.defn.or & orientation) > 0) && !isInfoWindowLayout(l)) {
                // Cache layout.
                layout = l;

                // Return false to halt iteration.
                return false;
            }
        });

        // Did we NOT find a new layout?
        if (!layout) {
            // No layout found, return null.
            return null;
        }

        // Return new layout and wrapped flag.
        return {
            wrap: hasWrapped,
            layout: layout
        };
    }

    function scrollToLayout(key, wrap) {
        var me = this;

        // Call getNewLayout to load the layout.
        this.getNewLayout({ layoutKey: key }, this._layouts, true, {
            submission: function () {
                mstrApp.showMessage();
            },

            success: function (newLayout) {
                // Did we wrap to find the new layout?
                if (wrap) {
                    // Turn back to new layout.
                    me.show(newLayout, null, 2);

                } else {
                    // Turn new layout forward.
                    me.turnForward(newLayout);

                }
            },

            complete: function () {
                mstrApp.hideMessage();
            }
        });
    }

    /**
     * Returns an object containing the current layout, whether it supported in the current device orientation, and the new layout if the current layout is not supported.
     *
     * @param {String} key The key of the current layout.
     *
     * @type Object
     * @private
     */
    function checkLayoutOrientation(key) {
        // Grab layouts and orientation info object.
        var layouts = this._layouts,
            orientationInfo = this._orientationInfo;

        // Do we NOT have an orientation info?
        if (!orientationInfo) {
            // Initialize orientation info and cache on instance.
            orientationInfo = this._orientationInfo = {};
            orientationInfo[OR_PORTRAIT] = {
                lyts: []
            };
            orientationInfo[OR_LANDSCAPE] = {
                lyts: []
            };

            // Iterate layouts.
            $A.forEach(layouts, function (layout) {
                // Get layout orientation and matching info collection.
                var or = layout.defn.or,
                    info = orientationInfo[or];

                // Is the layout NOT an info window AND did we find an info collection for this orientation?
                if (!isInfoWindowLayout(layout) && info !== undefined) {
                    // Add the key of this layout to the collection.
                    info.lyts.push(layout.k);
                }
            });
        }

        var selectedLayout = layouts[$A.find(layouts, 'k', key)],   // The currently selected layout.
            selectedOrientation = selectedLayout.defn.or,           // The orientation of the current layout.
            selectedOrInfo = orientationInfo[selectedOrientation],  // The orientation info for the current orientation.
            deviceOrientation = getOrientationValue.call(this),     // Current device orientation.
            rtn = {
                isSupported: true,                                  // Assume the currently selected layout is supported for the device orientation.
                currentLayout: selectedLayout
            };

        // Is the selected layout an info window layout or does the selected layout NOT support the device orientation?
        if (isInfoWindowLayout(selectedLayout) || ((selectedOrientation & deviceOrientation) === 0)) {
            // The currently selected layout IS NOT supported for the device orientation so set supported flag to false.
            rtn.isSupported = false;

            // Get the info for the device orientation.
            var deviceOrInfo = orientationInfo[deviceOrientation];

            // Do we have a matching layout from the device orientation collection?
            var targetLayoutKey = deviceOrInfo.lyts[$A.indexOf(selectedOrInfo.lyts, key)];
            if (targetLayoutKey) {
                // Use the matching layout.
                rtn.newLayout = layouts[$A.find(layouts, 'k', targetLayoutKey)];

            } else {
                // Do we know which layout was last visible for this orientation?
                var lastLayout = deviceOrInfo.last;
                if (lastLayout) {
                    // Use the last visible layout.
                    rtn.newLayout = lastLayout;

                } else {
                    // Iterate layouts.
                    $A.forEach(layouts, function (layout) {
                        // Is this layout NOT an info window AND does it support the device orientation?
                        if (!isInfoWindowLayout(layout) && (layout.defn.or & deviceOrientation) > 0) {
                            // Use this layout.
                            rtn.newLayout = layout;

                            // Return false to halt iteration.
                            return false;
                        }
                    });
                }
            }

            // Cache the currently selected layout as the last layout for the old orientation.
            selectedOrInfo.last = selectedLayout;

            // Did we NOT find a new layout?
            if (!rtn.newLayout) {
                // TQMS #538035: Orientation has changed for a spawned document, but we haven't shown the document yet, so allow the current layout to be supported.
                rtn.isStale = true;
            }
        }

        return rtn;
    }

    /**
     * Returns an array of layouts that support the current device orientation.
     *
     * @type mstrmojo.MobileDocLayoutViewer[]
     * @private
     */
    function getSupportedLayouts() {
        // Create collection of layouts that support the current orientation.
        var layouts = [],
            orientation = getOrientationValue.call(this);

        // Iterate layouts.
        $AFE(this._layouts, function (l) {
            // Is the orientation of this layout supported currently?
            if (((l.defn.or & orientation) > 0) && (!isInfoWindowLayout(l))) {
                // Add the layout to the local collection.
                layouts.push(l);
            }
        });

        return layouts;
    }

    /**
     * Raises the "layoutStatusChange" event.
     *
     * @param {mstrmojo.MobileDocLayoutViewer|mstrmojo.Label} currentLayout The current layout (or placeholder label).
     * @param {Boolean} [isFullScreenOnly=false] True if the only change was the full screen status.
     *
     * @private
     */
    function raiseLayoutSelectorEvt(currentLayout, isFullScreenOnly) {
        // Create default event.
        var evt = {
            name: 'layoutStatusChange',
            fullScreen: this.isFullScreen
        };

        // Is this NOT only a full screen status change?
        if (!isFullScreenOnly) {
            // Add layout info.
            evt.layouts = getSupportedLayouts.call(this);
            evt.current = currentLayout;
        }

        // Raise event so selector hears about it.
        this.raiseEvent(evt);
    }

    function insertWatermark(wm) {
        // create img node width default width/height
        var img = document.createElement('img'),
            style = img.style;
        //absolutely positioned at top left corner
        style.position = "absolute";
        style.top = 0;
        style.left = 0;
        // set it invisible before resizing
        style.visibility = 'hidden';

        // onload method on image to resize image after image got loaded
        var me = this;
        img.onload = function () {
            var iw = img.width,
                ih = img.height;
            // calculate the scale ratio
            if (wm.imgScale <= 0) { // fit to page
                var dn = me.domNode;

                img.width = dn.clientWidth;
                img.height = dn.clientHeight;

            } else { // percentage
                var r = wm.imgScale / 100;
                // resize
                img.width = iw * r;
                img.height = ih * r;

            }

//            img.style.webkitTransform = 'scale(' + r + ')';
            // make it visible
            img.style.visibility = 'visible';
        };

        // insert to DOM
        this.domNode.insertBefore(img, this.domNode.firstChild);

        // set 'src' after insert, to make sure when img.onload can be called correctly in IE (some problem with getting image from cache)
        img.src = wm && wm.imgSrc;
    }
    /**
     * The widget for a single MicroStrategy Report Services document displayed on a MobileDevice.
     *
     * @class
     * @extends mstrmojo.MobileBooklet
     */
    mstrmojo.MobileDoc = mstrmojo.declare(
        // superclass
        mstrmojo.MobileBooklet,

        [ mstrmojo._HasBuilder, mstrmojo._IsRwDocument ],

        /**
         * @lends mstrmojo.MobileDoc.prototype
         */
        {
            scriptClass: "mstrmojo.MobileDoc",

            cssClass: 'mstrmojo-Doc',

            /**
             * Overriding this property such that it tells the main view that the Android Settings View only supports the Home menu option.
             *
             * @see mstrmojo.AndroidMainView
             */
            supportedDefaultMenus: 1,

            getContentView: function getContentView() {
                return this;
            },

            postBuildRendering: function postBuildRendering() {
                if (this._super) {
                    this._super();
                }
                // water mark?
                var m = this.model,
                    wm = m && m.wm,
                    t = wm && wm.tp,
                    src = wm && wm.imgSrc;

                if (t === 3 && src) { // water mark type image
                    insertWatermark.apply(this, [wm]);
                }

            },

            buildChildren: function buildChildren(noAddChildren) {
                // Mask the noAddChildren parameter to always return the children (rather than add them as children) and then
                // cache the children.
                this._layouts = this._super(true);
            },

            beforeViewHidden: function beforeViewHidden(cmd) {
                // Is the view being rolled backward?
                if (cmd === 2) {
                    // In case of document with graphs hide the tooltips
                    mstrmojo.GraphBase.hideTooltips();

                    // Notify the root view that it needs to capture the screen.
                    mstrApp.rootView.takeScreenShot(this.domNode, this.model.oid);

                    // TQMS #516472: Set this view as stale because it's about to be destroyed.
                    this._stale = true;

                    // TQMS #523362: Reset the orientation before returning to the previous view in case it doesn't support the current orientation.
                    this.controller.resetOrientation();
                }
            },

            setDimensions: function setDimensions(h, w) {
                // Is this view stale?
                if (this._stale) {
                    // View will be discarded so don't bother resizing.
                    return;
                }

                var hasRendered = this.hasRendered,
                    viewResized = false,
                    id = this.id,
                    view;

                // Have we already rendered?
                if (hasRendered) {
                    // Get current view
                    view = this.getCurrentView();

                    // Cache whether the new dimensions are different from the current view (not document) dimensions.
                    viewResized = (view.height !== h || view.width !== w);
                }

                // Call super to resize self and children.
                this._super(h, w);

                // Have we already rendered?
                if (hasRendered) {
                    // Is this the preLoader label?
                    if (view.isPreloader) {
                        // Nothing to do.
                        return;
                    }

                    // Cache old and new landscape values.
                    var wasLandscape = this._isLandscape,
                        isLandscape = this._isLandscape = (mstrMobileApp.getOrientation() === OR_LANDSCAPE);

                    // Did orientation change?
                    if (wasLandscape !== isLandscape) {
                        // Get layout info.
                        var layoutInfo = checkLayoutOrientation.call(this, view.k),
                            layout = layoutInfo.newLayout;

                        // Is the layout stale?
                        if (layoutInfo.isStale) {
                            // Layout is stale (likely contained in a view that is about to be hidden) so nothing to do.
                            return;
                        }

                        // Is the layout NOT supported AND did we find a new layout?
                        if (!layoutInfo.isSupported && layout) {
                            // Create and show loading place holder.
                            layout = this.replaceView(getLoadingPlaceholder(layout), view, true);

                            // Need to make sure there are no lingering dialogs.
                            mstrApp.closeAllDialogs();

                            var params = {
                                layoutKey: layout.k
                            };

                            // Request the new layout (in case it's not loaded).
                            this.getNewLayout(params, this._layouts, true, {
                                success: function (newLayout) {
                                    // Replace placeholder view with new layout view.
                                    mstrmojo.all[id].replaceView(newLayout, layout);
                                }
                            });
                        } else {
                            // Notify layout selector (even if layout didn't change the available layouts may have changed due to an orientation change).
                            raiseLayoutSelectorEvt.call(this, layout || getCurrentLayout.call(this));

                            // Is the document fit to width AND does the view height or width NOT match the new height or width?
                            if (this.model.zt && viewResized && !view.isFullScreenWidget) {

                                // Call getNewLayout to request the layout again.
                                this.getNewLayout({
                                    layoutKey: view.k,
                                    reload: true
                                }, this._layouts, true, {
                                    submission: function () {
                                        mstrApp.showMessage();
                                    },

                                    success: function (newLayout) {
                                        mstrmojo.all[id].replaceView(newLayout, view, false);
                                    },

                                    complete: function () {
                                        mstrApp.hideMessage();
                                    }
                                });
                            }
                        }


                        // Ask the parent to rebuild the menus.
                        this.parent.updateActionMenu();
                    }
                }
            },

            /**
             * Iterates layouts to determine if we should support landscape mode.
             *
             * @ignore
             */
            isLandscapeSupported: function isLandscapeSupported() {
                // Are we in landscape now (or are we ignoring orientation)?
                if ((getOrientationValue.call(this) & OR_LANDSCAPE) > 0) {
                    return true;
                }

                // Assume we DO NOT support landscape.
                var rtn = false;

                // Iterate layouts.
                $AFE(this._layouts, function (lyt) {
                    // Does this layout support landscape?
                    if ((lyt.defn.or & OR_LANDSCAPE) > 0) {
                        // We DO support landscape.
                        rtn = true;

                        // Return false to stop iteration.
                        return false;
                    }
                });

                return rtn;
            },

            onRender: function onRender() {
                // Set isLandscape flag from device.
                getDeviceOrientation.call(this, true);

                // Check the current layout.
                var layoutInfo = checkLayoutOrientation.call(this, this.model.getCurrentLayoutKey()),
                    currentLayout = layoutInfo.currentLayout,
                    me = this,
                    fnShow = function (lyt) {
                        // Has the layout not been rendered yet?
                        if (lyt && !lyt.domNode) {
                            // Turn it forward.
                            me.turnForward(lyt);
                        }

                        return lyt;
                    };

                // Does the current layout support the current device orientation?
                if (layoutInfo.isSupported) {
                    // Show the current layout.
                    fnShow(currentLayout);

                    // TQMS #522439: Need to raise the layout selector event in case showing this layout didn't go through the turn code.
                    raiseLayoutSelectorEvt.call(this, currentLayout);

                } else {
                    // Did we find a layout that does support the current orientation?
                    var layout = layoutInfo.newLayout;
                    if (layout) {
                        // Designate the current layout (with unsupported orientation) as not loaded so it will be regenerated with the correct screen width.
                        currentLayout.defn.loaded = false;

                        // Select the layout (without updating server since we are going to request the layout) and then show placeholder.
                        layout = fnShow(this.selectLayout(getLoadingPlaceholder(layout), false));

                        // Request the layout (in case it's not loaded).
                        this.getNewLayout({ layoutKey: layout.k }, this._layouts, true, {
                            success: function (newLayout) {
                                // Replace placeholder view with new layout view.
                                me.replaceView(newLayout, layout);
                            }
                        });

                    } else {
                        // We found no layouts that support this orientation so ignore orientation for this document.
                        this._ignoreOrientation = true;

                        // Show the originally selected layout.
                        fnShow(currentLayout);
                    }
                }
            },

            /**
             * Overridden to mask the destroy parameter (to false) for better performance.
             *
             * @ignore
             */
            cleanUpLastWidget: function cleanUpLastWidget(destroy) {
                this._super(false);

                // Reset the views collection to only the last view.
                this.views = [ this.views.pop() ];
            },

            /**
             * Finds and displays the next layout in the forward direction.
             *
             */
            showNextLayout: function showNextLayout() {
                // Are we still animating from a previous layout change?
                if (this.isAnimating()) {
                    // Exit.
                    return;
                }

                // Get next layout.
                var layoutInfo = findNextLayout.call(this, $A.find(this._layouts, 'k', this.model.getCurrentLayoutKey()), true);

                // Did we not find a layout?
                if (!layoutInfo) {
                    // Nothing to do.
                    return;
                }

                // Scroll to layout.
                scrollToLayout.call(this, layoutInfo.layout.k, layoutInfo.wrap);
            },

            /**
             * Scrolls to the indicated layout.
             *
             * @param {mstrmojo.MobileDocLayoutViewer} layout The layout to select.
             *
             * @returns Boolean True if the layout was changed.
             */
            showLayout: function showLayout(layout) {
                // Get new key and old key.
                var key = layout.k,
                    oldKey = this.model.getCurrentLayoutKey();

                // Is the new layout not the currently selected layout?
                if (key !== oldKey) {
                    var layouts = this._layouts,
                        find = $A.find;

                    // Scroll to layout.
                    scrollToLayout.call(this, layout.k, (find(layouts, 'k', oldKey) > find(layouts, 'k', key)));

                    // Return true to indicate that we scrolled to a new layout.
                    return true;
                }

                // Return false to indicate that nothing changed.
                return false;
            },

            /**
             * Overridden to raise the layoutStatusChange event.
             *
             * @ignore
             */
            selectLayout: function selectLayout(layout, updateServer, callback) {
                this._super(layout, updateServer, callback);

                // Notify layout selector if not info window layout.
                if (!layout.defn || !layout.defn.iw) {
                    raiseLayoutSelectorEvt.call(this, layout);
                }

                return layout;
            },

            /**
             * Overridden to make sure the current layout is the selected layout.
             *
             * @ignore
             */
            afterTurn: function afterTurn(layout) {
                // Make sure the current layout is selected (it may not be if the layout came from a swipe).
                this.selectLayout(layout, (layout.k !== this.model.getCurrentLayoutKey()));

                // Call super.
                this._super(layout);
            },

            replaceLayout: function replaceLayout(oldLayout, newLayoutNode) {
                // Get index of old DocLayoutViewer.
                var layouts = this._layouts || [],
                    idx = $A.find(layouts, 'k', oldLayout.k);

                // Destroy old DocLayoutViewer.
                if (idx >= 0) {
                    oldLayout.unrender();
                    oldLayout.destroy();
                }

                // Create the new DocLayoutViewer.
                var c = this.builder.build([ newLayoutNode ], this.model)[0];

                // Replace old DocLayoutViewer in our cached layouts collection.

                // if the old layout was previously loaded, we expect it to be in the _layouts collection at position IDX
                if (idx >= 0) {
                    layouts[idx] = c;
                } else {
                    layouts.push(c);
                }

                // copy back the layouts array in case we just created it.
                this._layouts = layouts;

                // Return newly created DocLayoutViewer.
                return c;
            },

            onLayoutRebuilt: function onLayoutRebuilt(layout) {
                // Replace current layout with new one.
                this.replaceView(layout, this.getCurrentView(), true);
            },

            /**
             * <p>Overridden to request next layout in the scroll direction.</p>
             *
             * <p>If the next layout is not already downloaded this method will insert a waiting placeholder.</p>
             *
             * @ignore
             */
            beginScroll: function beginScroll(touch, view) {
                // Are we still animating from a previous layout change?
                if (this.isAnimating()) {
                    // Exit.
                    return false;
                }

                // Make sure there is no lingering scroll info.
                delete this._scrollInfo;

                // Do we NOT already have a view to scroll to?
                if (!view) {
                    // Find the next layout in the indicated direction.
                    var layouts = this._layouts,
                        nextLayoutInfo = findNextLayout.call(this, $A.find(layouts, 'k', this.model.getCurrentLayoutKey()), (touch.delta.x < 0)),
                        id = this.id;

                    // Do we NOT have a target layout or did we have to wrap to find the next layout?
                    if (!nextLayoutInfo || nextLayoutInfo.wrap) {
                        // Nothing to do.
                        return;
                    }

                    // Reset the view to the next layout.
                    view = nextLayoutInfo.layout;

                    // Is the layout NOT loaded?
                    if (!view.defn.loaded) {
                        // Create a loading place holder for next.
                        view = getLoadingPlaceholder(view);

                        // Request new layout.
                        this.getNewLayout({
                            layoutKey: view.k
                        }, layouts, false, {
                            success: function (newLayout) {
                                // Do we have a scroll info?
                                var me = mstrmojo.all[id],
                                    scrollInfo = me._scrollInfo;

                                if (scrollInfo) {
                                    // Replace the view to show.
                                    scrollInfo.view = newLayout;
                                }

                                // Replace place holder view with new layout view.
                                me.replaceView(newLayout, view);
                            }
                        });
                    }
                }

                // Do we have a view to scroll to?
                if (view) {
                // Call super to initiate scroll.
                    this._super(touch, view);
                }
            },

            scroll: function scroll(touch) {
                this._super(touch);

                // Are we scrolling?
                var scrollInfo = this._scrollInfo;
                if (scrollInfo) {
                    // Has the direction of scroll changed?
                    if (scrollInfo.isForward !== (touch.delta.x < 0)) {
                        // Reposition the slider at the original position by passing a simulated touch object with a delta of 0 for the x axis.
                        this._super({
                            delta: {
                                x: 0
                            }
                        });

                        // Restart scroll.
                        this.beginScroll(touch);
                    }
                }
            },

            /**
             * Overridden to notify server of correct selected layout.
             *
             * @ignore
             */
            scrollCanceled: function scrollCanceled(viewId) {
                this._super(viewId);

                // Reselect the old layout.
                this.model.getDataService().setCurrentDocLayout(this.model.getCurrentLayoutKey());
            },

            /**
             * @see mstrmojo._IsRWDocument
             */
            renderInfoWindow: function renderInfoWindow(infoWindow) {
                //We want to render info windows as full screen on phones.
                if (!mstrApp.isTablet()) {
                    var parentView = this.parent,
                        oldTitle = parentView.getTitle(),
                        fnUpdateTitle = function (title) {
                            parentView.updateTitle(title);
                        },
                        shouldReleaseOrientation = false;

                    //Create the dialog.
                    mstrApp.showDialog({
                        cssClass: 'FSInfoWindow',

                        children: infoWindow,

                        /**
                         * Override the resize dialog method from mstrmojo.android.Dialog to ensure that we resize the info window
                         * and the enclosing panel stack to fit to screen.
                         */
                        resizeDialog: function resizeDialog() {
                            var rootView = mstrApp.rootView,
                                availableSpace = rootView.getContentDimensions(),
                                ens = this.editorNode && this.editorNode.style,
                                infoWindow = this.children[0],
                                iwn = infoWindow && infoWindow.infoNode;

                            //Set the editor node to always display right under the title bar.
                            if (ens) {
                                //Calculate the title height (if any) to place the info window correctly.
                                ens.top = (parseInt(rootView.getBrowserDimensions().h, 10) - availableSpace.h + 3) + 'px';
                                ens.left = '5px';
                            }


                            //Set the info window node's dimensions.
                            if (iwn) {
                                var iwns = iwn.style;

                                iwns.height = availableSpace.h + 'px';
                                iwns.width = availableSpace.w + 'px';

                                //Resize the panel stack.
                                mstrmojo.all[infoWindow.psId].setInfoWindowDimensions(availableSpace);
                            }
                        },

                        onClose: function onClose() {
                            fnUpdateTitle(oldTitle);

                            if (shouldReleaseOrientation) {
                                // Release the orientation
                                mstrMobileApp.releaseOrientation();
                            }
                        },

                        /**
                         * We don't want to position the dialog.
                         */
                        positionDialog: mstrmojo.emptyFn
                    });

                    // Grab the panel stack and set the parent views title from the current panel.
                    var panelStack = infoWindow.children[0];
                    fnUpdateTitle(panelStack.getTitle());

                    // Check if the orientation was not locked previously
                    if (mstrMobileApp.getLockedOrientation() === 0) {
                        // Lock it to the current device orientation
                        mstrMobileApp.lockOrientation(mstrMobileApp.getOrientation());

                        //We've locked the orientation and we should lock it.
                        shouldReleaseOrientation = true;
                    }

                    // Attach an event listener on the panel stack to hear when the title changes.
                    panelStack.attachEventListener('titleChange', this.id, function (evt) {
                        // Update the parent view.
                        fnUpdateTitle(evt.value);
                    });

                } else {
                    this._super(infoWindow);
                }
            },

            /**
             * <p>Overridden to destroy layouts.</p>
             *
             * <p>Normally all children are destroyed by the parent, but in this case the non visible layouts
             * aren't actually children so we do it manually.</p>
             *
             * @ignore
             */
            destroy: function destroy(ignoreDom) {
                // Iterate layouts.
                $AFE(this._layouts, function (lyt) {
                    // Destroy each layout.
                    lyt.destroy(ignoreDom);
                });

                // Destroy the builder.
                this.builder.destroy();

                // Call super.
                this._super(ignoreDom);
            },

            /**
             * Populates the supplied menu configuration with the appropriate menu items based on the state of the Doc.
             *
             * @param Object config The menu configuration object (see {@link mstrmojo.AndroidView}).
             *
             * @ignore
             */
            populateActionMenu: function populateActionMenu(config) {
                // Do we have more than one layout?
                var layouts = getSupportedLayouts.call(this);
                if (layouts.length > 1) {
                    // Add full screen toggle button (default to enter).
                    var lbl = mstrmojo.desc(8430, 'Enter Fullscreen'),
                        icon = 11;

                    // Are we already in full screen mode?
                    if (this.isFullScreen) {
                        // Change to exit.
                        lbl = mstrmojo.desc(8429, 'Exit Fullscreen');
                        icon = 10;
                    }

                    // Add button.
                    config.addItem(MNU_FULLSCREEN, lbl, MNU_FULLSCREEN, false, icon);

                    // Are we not running on a tablet?
                    // WLIAO TQMS 506577: PM decided that we will show layout menu button on tablet as well.
                    // if (!mstrApp.isTablet()) {
                        // Add layout menu button
                    config.addItem(MNU_LAYOUTS, mstrmojo.desc(4174, 'Layouts'), MNU_LAYOUTS, false, 8);
                    // }
                }

                // Get current view.
                var view = this.getCurrentView();
                if (view && view.populateActionMenu) {
                    // Pass to current layout viewer.
                    view.populateActionMenu(config);
                }

            },

            getLayouts: function () {
                return this._layouts;
            },

            handleMenuItem: function handleMenuItem(group, command) {
                switch (group) {
                case MNU_FULLSCREEN:
                    // Change full screen status on instance.
                    this.isFullScreen = !this.isFullScreen;

                    // Raise event so layout selector will hear.
                    raiseLayoutSelectorEvt.call(this, this.getSelectedLayoutWidget(), true);

                    // Return true to indicate that the menu needs to be regenerated.
                    return true;

                case MNU_LAYOUTS:
                    var id = this.id,
                        fnLayouts = function () {
                            var instance = mstrmojo.all[id],
                                layouts = getSupportedLayouts.call(instance);

                            // Return collection of layouts and index of selected layouts.
                            return {
                                l: layouts,
                                idx: mstrmojo.array.indexOf(layouts, getCurrentLayout.call(instance))
                            };
                        },
                        info = fnLayouts();

                    // Show checklist dialog.
                    mstrApp.showDialog({
                        title: mstrmojo.desc(4174, 'Layouts'),
                        children: [{
                            scriptClass: 'mstrmojo.ui.MobileCheckList',
                            isElastic: true,
                            multiSelect: false,
                            items: info.l,
                            selectedIndex: info.idx,
                            postselectionChange: function (evt) {
                                // Was a new layout selected?
                                var added = evt.added;
                                if (added) {
                                    // Show the layout.
                                    if (mstrmojo.all[id].showLayout(this.items[added[0]])) {
                                        // Close the dialog.
                                        mstrApp.closeDialog();
                                    }
                                }
                            },
                            postCreate: function () {
                                // Attach event listener to rootView to hear when orientation changes.
                                mstrApp.rootView.attachEventListener('orientationChange', this.id, function () {
                                    // Get collection of layouts.
                                    var info = fnLayouts();

                                    // Set collection of layouts and select current layout.
                                    this.set('items', info.l);
                                    this.select(info.idx);

                                    // Resize the dialog in case the list size changed.
                                    this.parent.resizeDialog();
                                });
                            }
                        }]
                    });

                    // Return false to indicate tht the menu does not need to be regenerated.
                    return false;

                default:
                    // Does the current view have a handleMenuItem method?
                    var currentView = this.getCurrentView(),
                        viewMethod = currentView.handleMenuItem;

                    if (viewMethod) {
                        // Call it.
                        // TQMS#507341 return the result so that we rebuild the menu if necessary
                        return viewMethod.call(currentView, group, command);
                    }

                    return false;
                }
            },

            /**
             * Returns the currently selected layout.
             *
             * @return mstrmojo.DocLayoutViewer
             */
            getSelectedLayoutWidget: function getSelectedLayout() {
                return this.getCurrentView();
            },

            /**
             * Overridden to pass desired group by elements in request and to update action menu after completion.
             *
             * @ignore
             */
            getNewLayout: function getNewLayout(params, layouts, isSelected, callback) {

                // TQMS #506058: We need to pass desired elements to data service.
                var controller = this.controller,
                    me = this,
                    desired;

                if (controller && controller.getDesiredElements) {
                    desired = controller.getDesiredElements();
                    if (desired) {
                        params.desiredElements = desired;
                    }
                }

                // Create a wrapper around the callback's success function. Note: the following order ensures that we call updateActionMenu after the callback's success.
                callback.success = mstrmojo.func.composite([ callback.success, function () {
                    // Update the action menu to reflect the new layout's menu options.
                    me.parent.updateActionMenu();
                }]);

                // Call super to get the new layout.
                return this._super(params, layouts, isSelected, callback);
            },

            //This method is called when we need to unload all layoouts but current.
            //If the gbFlag is true then we unload only layouts with group bys. This
            //needs to be done when group bys changed, because we pass
            //desired elements when we switch to a new layout.
            unloadLayouts: function unloadLayouts(keys, gbFlag) {

                var layouts = this._layouts,
                    curKey = this.model.getCurrentLayoutKey(),
                    i,
                    cnt = (layouts && layouts.length) || 0,
                    lyt,
                    gbys,
                    defn,
                    iKey;

                for (i = 0; i < cnt; i++) {
                    lyt = layouts[i];
                    defn = lyt.defn;
                    if (lyt.k !== curKey && defn && defn.loaded) {
                        if (gbFlag) {
                            gbys = (lyt.gb && lyt.gb.groupbys);
                            if (gbys && gbys.length) {
                                defn.loaded = false;
                            }
                        } else if (keys) {
                            for (iKey = 0; iKey < keys.length; iKey++) {
                                if (lyt.k === keys[iKey]) {
                                    defn.loaded = false;
                                    break;
                                }
                            }
                        } else {
                            defn.loaded = false;
                        }
                    }
                }
            }

        }
    );

}());