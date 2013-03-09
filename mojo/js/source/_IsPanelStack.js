(function () {

    mstrmojo.requiresCls("mstrmojo.array");

    var $ARR = mstrmojo.array,
        TTL_SRC_PANEL = 0;

    /**
     * <p>A mixin for adding panel stack behaviors.</p>
     *
     * @class
     * @public
     */
    mstrmojo._IsPanelStack = mstrmojo.provide(

        "mstrmojo._IsPanelStack",

        /**
         * @lends mstrmojo._IsPanelStack.prototype
         */
        {
            _mixinName: 'mstrmojo._IsPanelStack',

            init: function init(props) {
                this._super(props);

                // Get defnition.
                var defn = this.defn;

                // Do we not have a defn node yet?
                if (!defn) {
                    // Set definition.
                    defn = this.defn = this.node && this.node.defn;

                    // Set title src.
                    this.titleSrc = this.titleSrc || defn.ttlSrc;
                }

                // Set the currently selected panel key (add to definition so all instances of panel stack will be able to listen for changes).
                var key = this.selectedKey = this.defn.selKey = this.node.data.selKey;

                // Initialize selectedIdx to update panel switching toolbar button status.
                this.set('selectedIdx', $ARR.find(this.node.data.panels, 'k', key));

                // Attach an event listener to hear when the selKey property changes.
                defn.attachEventListener('selKeyChange', this.id, function (evt) {
                    this.set('selectedKey', evt.value);
                });
            },

            /**
             * Overridden to extract selected panel key from data.
             *
             * @ignore
             */
            update: function update(node) {
                // Cache the key for the panel that will be visible.
                this._dataKey = node.data.selKey;
            },

            /**
             * Add overflow to panel formats if present in panel stack formats.
             *
             * @ignore
             */
            addChildren: function addChildren(panels, idx, silent) {
                var fmts = this.getFormats(),
                    overflow = fmts && fmts.overflow;

                if (overflow) {
                    $ARR.forEach(panels, function (panel) {
                        var pnlFmts = panel.getFormats();
                        if (pnlFmts) {
                            pnlFmts.overflow = overflow;
                        }
                    });
                }

                return this._super(panels, idx, silent);
            },

            /**
             * Manually calls refresh on all panels within this panel stack.
             * @see mstrmojo.Widget
             */
            refresh: function refresh() {
                var me = this;
                // Have we already rendered?
                if (me.hasRendered) {
                    // Iterate panels.
                    $ARR.forEach(me.children, function (child) {
                        // Set delayed refresh status.
                        child._delayRefresh = (child.k !== me._dataKey);

                        // Should we NOT delay the refresh?
                        if (!child._delayRefresh) {
                            // Refresh.
                            child.refresh();
                        }
                    });
                }
            },

            /**
             * Changes visible panel in panel stack (and updates server).
             *
             * @param {String} key The key of the newly visible panel.
             * @param {Boolean} [hasLoader=false] An optional boolean that is true when the panel has it's own loading message.
             */
            selectPanel: function selectPanel(key, hasLoader) {
                // Is the newly selected panel key different then the currently selected panel?
                if (key !== this.selectedKey) {
                    // Set key change on definition (so all instances here the change).
                    this.defn.set('selKeyChange', key);

                    // Notify the server that the current panel changed.
                    this.model.slice({
                        type: 3,
                        tks: this.k,
                        eid: key,
                        sid: this.node.data.wid,
                        ck: this.k,
                        hasLoader: hasLoader
                    });
                }
            },

            /**
             * Changes the visibility of the child panels based on the selected key.
             *
             * @param {String} evt.value The key of the newly selected panel.
             */
            onselectedKeyChange: function onselKeyChg(evt) {
                var off, on, selectedIdx;

                // Iterate the children
                $ARR.forEach(this.children, function (panel, idx) {
                    var panelKey = panel.k;

                    // Is this the visible panel?
                    if (evt.value === panelKey) {
                        // Cache the on panel and selected index.
                        on = panel;
                        selectedIdx = idx;

                        // Notify the panel that it is now selected.
                        panel.set('selected', true);

                    // Is this the formerly visible panel?
                    } else if (evt.valueWas === panelKey) {
                        // Cache the off panel.
                        off = panel;

                        // Notify the panel that it is no longer selected.
                        panel.set('selected', false);
                    }

                    // Have we found both the "on" and "off" panels?
                    if (on && off) {
                        // Return false to halt interation.
                        return false;
                    }
                });

                // If the panel stack title bar is set to show the current panel, and have a previous title, we need to propagate the panel name to the PanelStack.
                if (this.titleSrc === TTL_SRC_PANEL && this.title) {
                    this.set('title', on.title);

                    // We need to update the definition's ttl property because if we want to reopen  the info window - this value will be incorrect.
                    this.defn.ttl = on.title;
                }

                // Update the selected index.
                this.prevSelectIdx = this.selectedIdx;
                this.set('selectedIdx', selectedIdx);

                // Raise an event that the panel is changing.
                this.raiseEvent({
                    name: 'panelSelected',
                    key: on.k
                });

                // Return index and panel instance for both the "on" and "off" panels.
                return {
                    on: on,
                    off: off
                };
            },

            /**
             * Overridden to mark all panels as dirty when the panel stack is dirty.
             *
             * @ignore
             */
            setDirty: function setDirty(isDirty) {
                // Is the panel stack dirty?
                if (isDirty) {
                    // Mark all panels as dirty.
                    this.setDirtyChildren(true);
                }

                this._super(isDirty);
            },

            /**
             * Since the PanelStack was sliced we need to notify any non-visible panels that they are dirty.
             *
             * @param Boolean [includeAll=false] If not true, only hidden children will be marked as dirty.
             *
             */
            setDirtyChildren: function setDirtyChildren(includeAll) {
                // Cache the selected panel key.
                var selectedKey = this.selectedKey;

                // Iterate panels.
                $ARR.forEach(this.children, function (child) {
                    // Remove the dirty key from the selected panel and add the key as dirty to any unselected panel.
                    var key = child.k;
                    child[((includeAll || key !== selectedKey) ? 'add' : 'remove') + 'DirtyKey'](key);
                });
            },

            /**
             * Sets the panel with the supplied key's dirty state to false.
             *
             * @param {String} key The key of the newly clean panel.
             */
            clearDirtyChild: function clearDirtyChild(key) {
                var panels = this.children,
                    panel = panels[$ARR.find(panels, 'k', key)];

                if (panel) {
                    panel.removeDirtyKey(panel.k);
                }
            }
        }
    );
}());