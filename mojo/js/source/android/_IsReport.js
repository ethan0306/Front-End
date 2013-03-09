(function () {

    mstrmojo.requiresCls("mstrmojo.array",
                         "mstrmojo.hash",
                         "mstrmojo.Button",
                         "mstrmojo.android.EnumMenuOptions",
                         "mstrmojo.android._HasMobileSelectBoxDialog");

    mstrmojo.requiresDescs(221, 1442, 5136);

    /**
     * Action constants.
     *
     * @private
     */
    var MENUS = mstrmojo.android.EnumMenuOptions,
        PAGE_BY = MENUS.PAGE_BY,
        REPROMPT = MENUS.REPROMPT;

    var $ARR = mstrmojo.array,
        $BTN = mstrmojo.Button.newAndroidButton,
        $HASH = mstrmojo.hash,
        $DESC = mstrmojo.desc;

    /**
     * <p>Constructs the contents of the change page by dialog and passes it to the {@link mstrmojo.MobileApp} for display.  After the user
     * interacts with the dialog, this method will also submit the changes to the server.</p>
     *
     * @private
     */
    function showPageByDialog() {
        var pageByData = $HASH.clone(this.pageByData),       // Clone page by data so in place edits won't take effect until the user hits the OK button.
            pageElements = pageByData.es,
            dialogCfg = {
                title: $DESC(5136, 'Page By'),
                cssClass: 'paging-editor'
            },
            base = this,
            pageCnt = 0,
            depth,
            pageBys,
            selections,
            selectedIndices,
            fnClearPageBy,
            fnPageHeader,
            fnGetPages,
            fnIterateSelections,
            fnSubmit;

        /**
         * Utility function for clearing previously selected elements in the page by data.
         *
         * @param {Object} node The node that contains the page header definition within it's "ph" property.
         *
         * @private
         * @inner
         */
        fnClearPageBy = function (node) {
            // Get page by header using selectedIndices.
            var idx = selectedIndices.shift(),
                item = node.ph.h[idx];

            // Remove cet attribute.
            delete item.cet;

            // Does this header have a child header?
            if (item.ph) {
                // Clear recursively.
                fnClearPageBy(item);
            }
        };

        /**
         * Utility function for generating the label and select box for each page by header.
         *
         * @param {Object} node The node that contains the page header definition within it's "ph" property.
         *
         * @private
         * @inner
         */
        fnPageHeader = function (node) {
            // Get the page header node.
            var page = node.ph;

            // Does this node NOT have any child page headers?
            if (!page) {
                // Recursion is complete so return.
                return;
            }

            var items = [],
                selectedPageHeader;

            // Iterate headers and extract elements.
            $ARR.forEach(page.h, function (v, idx) {
                var ix = v.ix,
                    cet = v.cet || 0;

                var el = pageElements[ix];
                items[idx] = {
                    n: el.en,
                    v: ix,          // Page element index.
                    on: cet
                };

                // Is this the selected item?
                if (cet) {
                    // Store selected item in selections cache.
                    selections[depth] = items[idx];

                    // Store index of selected page header.
                    selectedIndices[depth] = idx;

                    // Set selectedPageHeader
                    selectedPageHeader = v.ph;
                }
            });

            // Get selected element.
            var selected = selections[depth];

            // Add Page By element.
            pageBys.push({
                n: page.n,
                items: items,
                v: selected.n
            });

            // Increment depth counter.
            depth++;

            // Call recursively.
            fnPageHeader($HASH.copy(selected, {
                ph: selectedPageHeader
            }));
        };

        /**
         * Utility function to populate collections used for displaying dialog.
         *
         * @private
         * @inner
         */
        fnGetPages = function () {
            // Reset collections.
            depth = 0;
            pageBys = [];
            selections = [];
            selectedIndices = [];

            // Start page header iteration.
            fnPageHeader(pageByData);

            // Cache number of page by units.
            pageCnt = pageBys.length;
        };

        /**
         * Utility function to iterate selections, find the selected header (or first header if none found) and then call the passed in modifier function.
         *
         * @param {Function} fnModifier A function to make callee required modifications.  The function will be passed the selected header and the page header.
         *
         * @private
         * @inner
         */
        fnIterateSelections = function (fnModifier) {
            var pageHeader = pageByData.ph;
            $ARR.forEach(selections, function (v) {
                // Get selected header.
                var headers = pageHeader.h,
                    selectedHeader = headers[Math.max($ARR.find(headers, 'ix', v.v), 0)];

                // Call modifier function.
                fnModifier(selectedHeader, pageHeader);

                // Reset pageHeader to "ph" child of the selected header.
                pageHeader = selectedHeader.ph;
            });
        };

        /**
         * Utility function to submit current page by selections to server.
         *
         * @private
         * @inner
         */
        fnSubmit = function () {
            // Initialize page by keys array.
            var pageByKeys = [];

            // Iterate selection to set selected header as selected.
            fnIterateSelections(function (selectedHeader, pageHeader) {
                // Add key for this page by.
                pageByKeys.push({
                    id: pageHeader.id || 'm',               // If ID is missing (metrics) pass 'm' so server side tokenizer doesn't skip this token.
                    tp: pageHeader.tp,
                    v: pageElements[selectedHeader.ix].ei
                });
            });

            // Update instance page by data.
            base.pageByData = pageByData;

            // Pass to controller.
            base.controller.onPageBy(base, pageByKeys);
        };

        // Build page by collections.
        fnGetPages();

        // Do we have more than one page by unit?
        if (pageCnt > 1) {
            // Add buttons to dialog configuration.
            dialogCfg.buttons = [ $BTN($DESC(1442, 'OK'), function () {
                fnSubmit();
            }), $BTN($DESC(221, 'Cancel')) ];
        }

        // Request the select dialog.
        this.showMobileSelectBoxDialog(pageBys, function (idx, item) {
            // Clear old selections in pageByData.
            fnClearPageBy(pageByData);

            // Store newly selected item in selections collection.
            selections[idx] = item;

            // Iterate selection to set selected header as selected.
            fnIterateSelections(function (selectedHeader) {
                // Mark this header as selected.
                selectedHeader.cet = 1;
            });

            // Rebuild collections.
            fnGetPages();

            // Do we have more than one page by unit?
            if (pageCnt > 1) {
                // Set page by items into list so the list repaints.
                this.set('items', pageBys);

            } else {
                // There is only one page by unit so submit changes.
                fnSubmit();

            }

            // Return true if there is more than one page by unit so the dialog will not close.
            return (pageCnt > 1);

        }, dialogCfg);

    }

    /**
     * @class
     * @public
     *
     * @extends mstrmojo.android._HasMobileSelectBoxDialog
     */
    mstrmojo.android._IsReport = mstrmojo.provide(

        'mstrmojo.android._IsReport',

        /**
         * @lends mstrmojo.android._IsReport#
         */
        $HASH.copy(mstrmojo.android._HasMobileSelectBoxDialog, {

            _mixinName: 'mstrmojo.android._IsReport',
            
            hasPageBy: mstrmojo.emptyFn,

            reprompt: function reprompt() {
                this.controller.reprompt();
            },

            /**
             * Populates the supplied menu configuration with the appropriate menu items based on the state of the report result set.
             *
             * @param Object config The menu configuration object.
             *
             * @see {@link mstrmojo.AndroidMainView}
             * @ignore
             */
            populateActionMenu: function populateActionMenu(config) {
                // TQMS #500631: Suspend menu access while checking cache because report may be changed so that those menu items don't apply anymore.
                if (this.suspendMenu) {
                    return;
                }

                // Do we have page by data?
                if (this.hasPageBy()) {
                    // Add page by menu item
                    config.addItem(PAGE_BY, $DESC(5136, 'Page By'), PAGE_BY, true, 1);
                }

                // Do we have supported prompts?
                var prompts = this.model.prompts;
                if (prompts && prompts.hasSupported()) {
                    // Add page by menu item
                    config.addItem(REPROMPT, $DESC(1917, 'Reprompt'), REPROMPT, true, 3);
                }
            },

            /**
             * Handles menu user interaction.
             *
             * @param String group The menu item group the selected item belongs to.
             * @param String [command=''] An optional command associated with the menu item.
             *
             * @see {@link mstrmojo.AndroidMainView}
             * @ignore
             */
            handleMenuItem: function handleMenuItem(group, command) {

                // What was the action?
                switch (group) {
                case PAGE_BY:
                    showPageByDialog.call(this);
                    break;

                case REPROMPT:
                    this.reprompt();
                    break;

                default:
                    if (this._super) {
                        this._super(group, command);
                    }
                }
            }
        })
    );
}());
