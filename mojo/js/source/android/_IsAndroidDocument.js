(function () {

    mstrmojo.requiresCls("mstrmojo.dom",
                         "mstrmojo.android.EnumMenuOptions",
                         "mstrmojo.android._HasMobileSelectBoxDialog",
                         "mstrmojo.array",
                         "mstrmojo.hash");

    mstrmojo.requiresDescs(1917, 2941);

    /**
     * Action constants
     *
     * @type Integer
     * @private
     */
    var MENUS = mstrmojo.android.EnumMenuOptions,
        GROUP_BY = MENUS.GROUP_BY,
        REPROMPT = MENUS.REPROMPT;

    var $HASH = mstrmojo.hash;

    /**
     * Displays the group by selection dialog.
     *
     * @private
     */
    function handleGroupBy() {
        var androidDocument = this,
            gpby = this.gb,
            title = gpby.title,
            grpBys = [];

        // Remove the colon from title and convert from caps to initial cap.
        title = title.charAt(0) + title.substr(1, title.length - 2).toLowerCase();

        // Iterate group by units.
        mstrmojo.array.forEach(gpby.groupbys, function (gb) {
            var unit = gb.unit,
                options = unit.elms,
                items = [];

            // Create items collection.
            mstrmojo.array.forEach(options, function (opt, idx) {
                items.push($HASH.copy(opt, {
                    k: gb.k,
                    on: (idx === unit.idx)
                }));
            });

            // Add this group by unit.
            grpBys.push({
                n: unit.target.n,
                v: options[unit.idx].n,
                items: items
            });
        });

        // Request the select dialog.
        this.showMobileSelectBoxDialog(grpBys, function (idx, item) {
            // Call group by on controller.
            androidDocument.controller.onGroupBy(androidDocument, {
                groupbyKey: item.k,
                elementId: item.v
            });
        }, {
            title: title,
            cssClass: 'grouping-editor'
        });
    }

    /**
     * A mixin to add Mobile Report Services Document functionality to widgets.
     *
     * @class
     * @public
     *
     * @extends mstrmojo.android._HasMobileSelectBoxDialog
     */
    mstrmojo.android._IsAndroidDocument = mstrmojo.provide(

        'mstrmojo.android._IsAndroidDocument',

        /**
         * @lends mstrmojo.android._IsAndroidDocument#
         */
        $HASH.copy(mstrmojo.android._HasMobileSelectBoxDialog, {

            _mixinName: 'mstrmojo.android._IsAndroidDocument',

            /**
             * Populates the supplied menu configuration with the appropriate menu items based on the state of the Document.
             *
             * @param Object config The menu configuration object (see {@link mstrmojo.AndroidView}).
             *
             * @returns The updated menu configuration object.
             */
            populateActionMenu: function populateActionMenu(config) {
                // TQMS #500631: Suspend menu access while checking cache because report may be changed so that those menu items don't apply anymore.
                if (this.parent.suspendMenu) {
                    return;
                }

                // Does the document have group by?
                if (this.gb && this.defn.dpb) {
                    // Add grouping menu item.
                    config.addItem(GROUP_BY, mstrmojo.desc(2941, 'Grouping'), GROUP_BY, true, 2);
                }

                // Is the document prompted?
                var model = this.model,
                    docModel = model.docModel || model,
                    prompts = docModel.prompts,
                    //TQMS 489156
                    dri = (docModel.getCurrentLayoutDef && docModel.getCurrentLayoutDef().dri);
                
                if (prompts && prompts.hasSupported() && (typeof(dri) == 'undefined' || dri)) {
                    // Add reprompt menu item.
                    config.addItem(REPROMPT, mstrmojo.desc(1917, 'Reprompt'), REPROMPT, true, 3);
                }
            },

            /**
             * Handles user interactions with the menu, but only if the buttons was added to the menu by this view.
             *
             * @param {String} cmdId The command ID attached to the button.
             */
            handleMenuItem: function handleMenuItem(group, command) {
                // #513647 hide the toolbars in case of graph documents
                mstrmojo.GraphBase.hideTooltips();

                switch (group) {
                case GROUP_BY:
                    handleGroupBy.call(this);
                    break;

                case REPROMPT:
                    this.reprompt();
                    break;

                }
            },

            /**
             * Reprompts the document.
             */
            reprompt: function reprompt() {
                this.controller.reprompt();
            }
        })
    );
}());