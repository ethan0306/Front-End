(function () {

    mstrmojo.requiresCls("mstrmojo.MobileXtab",
                         "mstrmojo.array",
                         "mstrmojo.hash",
                         "mstrmojo.android._IsReport");

    /**
     * Removes the stylesheet associated with this xtab.
     *
     * @private
     */
    function removeStyleSheet() {
        var xtabStyleSheet = this.xtabStyleSheet,
            parentNode =  xtabStyleSheet && xtabStyleSheet.parentNode;

        //Delete the lingering CSS styles created for this Xtab.
        if (parentNode) {
            parentNode.removeChild(xtabStyleSheet);

            //delete the widget property
            delete this.xtabStyleSheet;
        }
    }

    /**
     * <p>A widget to display an Android specific MobileXtab.</p>
     *
     * @class
     * @extends mstrmojo.MobileXtab
     */
    mstrmojo.AndroidXtab = mstrmojo.declare(
        // superclass
        mstrmojo.MobileXtab,

        [ mstrmojo.android._IsReport ],

        /**
         * @lends mstrmojo.AndroidXtab.prototype
         */
        {
            scriptClass: "mstrmojo.AndroidXtab",

            /**
             * Overriding this property such that it tells the main view that the Android Settings View only supports the Home menu option.
             *
             * @see mstrmojo.AndroidMainView
             */
            supportedDefaultMenus: 1,

            getContentView: function getContentView() {
                return this;
            },

            /**
             * Overrides the default friction on the scroller
             *
             * @type Number
             * @default 0.0021
             */
            scrollerFriction: 0.0015,

            preBuildRendering: function preBuildRendering() {
                // Remove any lingering style sheets.
                removeStyleSheet.call(this);

                // Update style sheet with new data.
                this.updateXtabStyles(this.model.data.cssString);

                // Call super.
                this._super();
            },

            /**
             * Handles auto fit to window xtabs by adjusting the size of the scrollbox node so the Xtab renders correctly.
             */
            onwidthChange: function onwidthChange() {
                //Is the grid in auto fit to window mode?
                if (this.gridData.afw) {
                    var sbn = this.scrollboxNode,
                        width = this.width;

                    //Have we rendered already?
                    if (sbn) {
                        sbn.style.width = width;
                    } else {
                        this.scrollboxNodeCssText = 'width: ' + width;
                    }
                }

                // Call super
                if (this._super) {
                    this._super();
                }
            },

            /**
             * This function sets the grid's css onto the browser by appending it into a style node created (if it does not exist already) under the head node.
             *
             * @param css The css string to be appended to the style node.
             */
            updateXtabStyles: function updateXtabStyles(css) {
                // Add the grid css on the head of the page.
                if (!this.xtabStyleSheet) {
                    this.xtabStyleSheet = document.getElementsByTagName('head')[0].appendChild(document.createElement('style'));
                }

                // Append CSS to the style sheet.
                this.xtabStyleSheet.appendChild(document.createTextNode(css));
            },

            /**
             * Removes xtab associated style sheet.
             *
             * @ignore
             */
            unrender: function unrender(ignoreDom) {
                this._super(ignoreDom);

                // Remove any lingering style sheets.
                removeStyleSheet.call(this);
            },

            /**
             * Caches the actions in case the user requests to show the menu.
             *
             * @param {HTMLElement} cell The table cell that initiated this action.
             * @param {Object[]} actions An array of objects that describe each action.
             *
             * @returns boolean True if the cell should be selected.
             */
            updateActionMenu: function updateActionMenu(cell, actions) {
                // Cache the action in case the menu is requested later.
                this._selectionActions = actions;

                // Return true so that the cell gets selected.
                return true;
            },

            beforeViewHidden: function beforeViewHidden() {
                // Notify the root view that it needs to capture the screen.
                mstrApp.rootView.takeScreenShot(this.domNode, this.controller.did);
            },

            hasPageBy: function hasPageBy() {
                var gridHeaders = this.gridData.ghs;
                return !!(gridHeaders && gridHeaders.phs);
            },

            setModel: function setModel(model) {
                this._super(model);

                // Have we NOT already retrieved the page by tree for this xtab?
                if (!this.pageByData) {
                    // Make request for page by data.
                    this.controller.getPageByTree(this);
                }
            },

            deselectCell: function deselectCell() {
                this._super();

                // Kill the current actions.
                delete this._selectionActions;
            }
        }
    );
}());