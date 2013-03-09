(function () {

    mstrmojo.requiresCls("mstrmojo.DocSelectorViewFactory",
                         "mstrmojo.android.DropDownList",
                         "mstrmojo.android.selectors.CheckList",
                         "mstrmojo.android.selectors.ListBox",
                         "mstrmojo.android.selectors.LinkBar",
                         "mstrmojo.android.selectors.ButtonBar",
                         "mstrmojo.android.selectors.Slider",
                         "mstrmojo.array");

    var $STYLES = mstrmojo.DocSelectorViewFactory.STYLES;

    /**
     * JavaScript widget class names for different selector types.
     *
     * @const
     * @private
     */
    var widgetMap = {};
    widgetMap[$STYLES.RADIO] = 'CheckList';
    widgetMap[$STYLES.CHECKBOX] = 'CheckList';
    widgetMap[$STYLES.LIST] = 'ListBox';
    widgetMap[$STYLES.LINK] = 'LinkBar';
    widgetMap[$STYLES.BUTTON] = 'ButtonBar';
    widgetMap[$STYLES.SCROLLER] = 'Slider';

    /**
     * <p>A factory for creating Report Services Document selector controls for the Android platform.</p>
     *
     * @class
     * @extends mstrmojo.android.DocSelectorViewFactory
     */
    mstrmojo.android.DocSelectorViewFactory = mstrmojo.declare(

        mstrmojo.DocSelectorViewFactory,

        null,

        /**
         * @lends mstrmojo.android.DocSelectorViewFactory.prototype
         */
        {
            scriptClass: 'mstrmojo.android.DocSelectorViewFactory',

            isSelectorSupported: function isSelectorSupported(selectorContainer) {
                // Retrieve the selector definition.
                var defn = selectorContainer.node.defn;

                // Is this a panel stack?
                if (defn.ct === "3") {
                    // Do we have target AND is this panel selector docked to the panel?
                    var targetKey = selectorContainer.tks;
                    if (targetKey && selectorContainer.defn.dk) {
                        // Notify panel stack that it should have a docked selector.
                        selectorContainer.model.getLayoutUnitDefn(targetKey, defn._lkz).dk = true;

                        // Return false to indicate that we don't need a selector.
                        return false;
                    }
                }

                // Return true to indicate that the selector is supported.
                return true;
            },

            /**
             * Creates, initializes and adds a pulldown style selector to the selectorContainer.
             *
             * @param {mstrmojo.DocSelector} selectorContainer The selector container to which the pulldown will be added.
             *
             * @returns mstrmojo.Widget
             */
            newPulldown: function newPulldown(selectorContainer) {
                return new mstrmojo.android.DropDownList({
                    postvalueChange: function () {
                        // Is the selector NOT synchronizing?
                        if (!selectorContainer._inSyncPhase) {
                            // Tell the selector we've changed the value.
                            selectorContainer.selectorControlChange(this);
                        }
                    }
                });
            },

            updateControlStyles: function updateControlStyles(selectorContainer) {
                var fmts = selectorContainer.getFormats(),
                    selectorStyle = selectorContainer.style,
                    ctrl = selectorContainer.children && selectorContainer.children[0];

                if (!ctrl) {
                    return;
                }

                // Do we have formats?
                if (fmts) {

                    // Get height and width from formats.
                    var height = fmts.height,
                        width = fmts.width;

                    // Do we have a fixed height?
                    if (height !== undefined) {
                        // Pass to control.
                        ctrl.height = height;
                    }

                    // Do we have a fixed width?
                    if (width !== undefined) {
                        // Pass to control?
                        ctrl.width = width;
                    }

                    // Is this a link bar?
                    if (selectorStyle === $STYLES.LINK) {
                        // Do we already have a selected color?
                        var selectedColor = selectorContainer.defn.ssc;
                        if (selectedColor) {
                            // Pass the selected color to the control.
                            ctrl.selColor = selectedColor;
                        }
                    }
                }

                this._super(selectorContainer);
            },

            attachTargetListeners: function attachTargetListeners(selectorContainer) {
                this._super(selectorContainer);

                // Is this a supported panel selector?
                if (selectorContainer.defn.ct === '3' && this.isSelectorSupported(selectorContainer)) {
                    // Do we NOT already have a listener?
                    if (!selectorContainer._panelEvtListener) {
                        // Get panel stack instance.
                        var panelStack = selectorContainer.model.getUnitInstance(selectorContainer.tks, 1);
                        if (panelStack) {
                            // Attach event listener to panel stack.
                            selectorContainer._panelEvtListener = panelStack.attachEventListener('panelSelected', selectorContainer.id, function (evt) {
                                // Set synchronization phase flag so we don't send update.
                                this._inSyncPhase = true;

                                // Update selector.
                                this.content.singleSelectByField(evt.key, 'v');

                                // Clear synchronization phase flag.
                                this._inSyncPhase = false;
                            });
                        }
                    }
                }
            },

            getSelectorClass: function getSelectorClass(selectorStyle, isHoriz) {
                // Return the script class name (if found in map) or result of call to super.
                var cls = widgetMap[selectorStyle];
                return (cls && 'android.selectors.' + cls) || this._super(selectorStyle, isHoriz);
            }
        }
    );

}());