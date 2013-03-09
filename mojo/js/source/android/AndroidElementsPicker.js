/**
 * Elements Picker for Android.
 * 
 * Android Element Picker's search ability is not exposed through any button in this view.
 * Instead, it registers for listening to the Search button on device.
 * 
 * It will try to register to listen for Search button when this view is rendered, and unregister when it is unrendered.
 */
(function () {
    mstrmojo.requiresCls("mstrmojo.ui.MobileCheckList",
                         "mstrmojo.android.AndroidElementsSearchView",
                         "mstrmojo.android._IsIncFetchList",
                         "mstrmojo.android.EnumMenuOptions",
                         "mstrmojo._HasSysMenu");
    
    mstrmojo.requiresDescs(221,1442,8761);
    
    var $BTN = mstrmojo.Button.newInteractiveButton,
        MENU_ITEMS = mstrmojo.android.EnumMenuOptions;
    
    /**
     * Elements picker for the Android platform.
     * 
     * @class
     * @extends mstrmojo.ui.MobileCheckList
     * @borrows mstrmojo.android._IsIncFetchList
     */
    mstrmojo.android.AndroidElementsPicker = mstrmojo.declare(
            
        mstrmojo.ui.MobileCheckList,
        
        [ mstrmojo._HasSysMenu, mstrmojo.android._IsIncFetchList ],
        
        /**
         * @lends mstrmojo.android.AndroidElementsPicker.prototype
         */
        {
            scriptClass: 'mstrmojo.android.AndroidElementsPicker',
            
            /**
             * WebElements object for browsing.
             * 
             * @type Object
             */
            browseElements: null,
            
            canSearch: true,
            
            glow: true,
            
            /**
             * Handler for when the browseElement change.
             * 
             * @ignore
             */
            onbrowseElementsChange: function () {
                // Do we have browseElements?
                var bElems = this.browseElements;
                if (bElems) {
                    // Make sure the items are an array.
                    var items = bElems.items = (bElems.items || []);
                    
                    // Synchronize list items with the items from browseElements.
                    this.set('items', items);
                    
                    //Have we fetched all the items?
                    if (items.length < bElems.totalSize) {
                        // Set incremental fetch data helper.
                        this.ifDataHelper = bElems;
                    } else {
                        //Since the items cannot be more the total size, we assume that they're equal. Hence we have all items and don't need incremental fetch.
                        this.supportsIncFetch = false;
                    }
                }
            },
            handleMenuItem: function handleMenuItem(cmdId) {
                var splitCmd = cmdId.split('|'),
                    group = parseInt(splitCmd[0], 10),
                    me = this;

                //Check if a default menu option has been selected.
                switch (group) {
                
                case MENU_ITEMS.SCAN:
                    mstrmojo.BarcodeReader.readBarcodes(
                        {   // params
                            'attributeID': this.browseElements.source.did,
                            'searchForms': this.searchForms,
                            'multiSelect': this.multiSelect
                            //'searchPattern': config.searchPattern || '',
                            //'matchCase' : !!config.matchCase,
                            //'dataSourcesXML': config.dataSource || '',
                            //'targetAttributeID':config.searchTarget && config.searchTarget.did || '',
                        },
                        {   // callback
                            success: function (val) {
                                //alert("Success " + val);
                                var res = JSON.parse(val),
                                    items = me.browseElements.convertElems(res.items);
                                me.selectItems(items, !me.multiSelect);
                            },
                            
                            failure: function (ex) {
                                //TODO: Do we not want to notify the user?
                            }
                        }
                    );
                    return;
                case MENU_ITEMS.SEARCH:
                    this.openSearchDialog();
                    return;
                }
            },            
            
            openSearchDialog: function openSearchDialog(pattern) {
                var me = this;
                
                //TQMS 497259 We don't want to open more then one dialog
                if ( me._searchDialog) {
                    return;
                }
                
                // Show the search dialog (cache the reference so we can hide the dialog when selection changes).
                me._searchDialog = mstrApp.showDialog({
                    title: mstrmojo.desc(8761, 'Search Elements'),
                    cssClass: 'edtSearch',
                    alignment: 'top',       // Make sure dialog appear at top so it is not obscured when the soft keyboard opens.
                    children: [{
                        alias: 'searchView',
                        scriptClass: 'mstrmojo.android.AndroidElementsSearchView',
                        elements: this.browseElements,
                        targetList: this
                    }],
                    // TQMS 515598 Replace 'Ok' and 'Cancel' with 'Done' because the selection changes made on search
                    // view is reflected on the parent picker in real-time.
                    buttons: [$BTN(mstrmojo.desc(8473, 'Done'))],
                    onClose: function () {
                        // Delete the search dialog reference.
                        delete me._searchDialog;
                    }
                });
                // TQMS 513637 We will set whether the search view is multi-select based on its parent picker.
                var sv = me._searchDialog.children[0];
                if (sv && me.multiSelect && sv.setMultiSelect)
                {
                    sv.setMultiSelect();
                }
                if ( pattern) {
                    sv.setPattern(pattern);
                }
            },
                 
            /**
             * Overridden to attach listener for search functionality.
             * 
             * @ignore
             */
            postBuildRendering: function postBuildRendering() {
                this._super();
                
                //Set system menu
                var cfg = this.newMenuConfig(),
                    MENU_ITEMS = mstrmojo.android.EnumMenuOptions;

                //TQMS 497753 We shall not allow search if prompts has predefined list of elements
                if ( this.canSearch ) {           //TQMS 499908     
                    if (!mstrApp.onMobileDevice()) {
                        // TQMS 513367 WLIAO: We will hide search menu option on all mobile devices
                        // to be consistant with iOS behavior.
                        cfg.addItem(MENU_ITEMS.SEARCH, 'Search', MENU_ITEMS.SEARCH, true, 17);
                    } else {
                        //For phones we use hardware search button
                        mstrApp.registerListener('search', this, this.openSearchDialog);
                    }
                }

                /* TQMS 513043 WLIAO: Option to 'Scan' and 'Search' should not be exposed 
                via menu option for a prompt with display style set to 'Barcode Reader'
                
                if (this.useBarcodeReader) {
                cfg.addItem(MENU_ITEMS.SCAN, 'Scan', MENU_ITEMS.SCAN, true, 7);
                }
                */
                
                this.pushSysMenu(this.id, cfg);
                
                //Wrap close method to pop system menu
                var dialog = this.parent,
                    f = this.parent.onClose,
                    me = this;
                
                dialog.onClose = function () {
                    if (f) {
                        f.call(this);
                    }
                    me.popSysMenu();
                };
            },
            
            /**
             * Overidden to detach search listener.
             * 
             * @ignore
             */
            unrender: function unrender(ignoreDom) {
                this._super(ignoreDom);

                // Do we have a listener for the search operation?
                if (mstrApp.getListener('search', this)) {
                    // Unregister it.
                    mstrApp.unregisterListener('search', this);
                }
            }
        }
    );
}());