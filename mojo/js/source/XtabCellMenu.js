/*global mstrmojo:false */
(function(){

    var $ID = "mstrXtabCellMenu",
        $SD = "mstrmojo.all['" + $ID + "'].selectedData",
        $XT = "mstrmojo.all['" + $ID + "'].xtab",
        $IB = "mstrmojo-InteractiveButton",
        $BOX = "mstrmojo.Box",
        $BOXC = "mstrmojo-Menu-Box",
        $MN = "mstrmojo.MenuItem";
    
    /**
     * Helper function to submit requests from cell menu interaction.
     * 
     * @param {String} mth The name of the method to call on the XTab.
     * @param {String[]|Boolean[]} [args=[]] An array of optional arguments to be submitted to the method call, excluding selectedData which will be added automatically.
     * 
     * @private
     */
    function fnClick(mth, args) {
        // Cache xtab and selected data because they will disappear when the popup closes.
        var p = mstrmojo.all[$ID],
            xtab = p.xtab,
            newArgs = [ p.selectedData ].concat(args || []);
        
        // Close the popup.
        p.close();
        
        // Call the appropriate method on the xtab model.
        xtab[mth].apply(xtab, newArgs);
    }
    
    /**
     * Helper function. The handler for all Link menu items.
     * 
     * @private
     */
    function fnClickLinkMenuItem(){
        fnClick('link', [this.index]);
    }
    
    /**
     * Helper function to create menu buttons.
     * 
     * @param {String} t The text to display in the button.
     * @param {String} c The css class used to display the button image.
     * @param {Function} fn The function to execute when the button is clicked.
     * @param {Object} [b] An optional collection of bindings for this button.
     * 
     * @returns Object The menu button config.
     * @private
     */
    function createMenuButton(t, c, fn, b) {
        // Create the button config.
        var btn = {
            scriptClass: $MN,
            text: t,
            iconClass: 'mstrmojo-oivmSprite ' + c,
            cssClass: $IB,
            onclick: fn
        };
        
        // Are there bindings?
        if (b) {
            // Add the bindings.
            btn.bindings = b;
        }
        
        return btn;
    }
    
    /**
     * Helper function to create pivot buttons.
     * 
     * @param {String} t The text to display in the button.
     * @param {String} c The css class suffix which will be added "tbPivot" and used to display the button image.
     * @param {String} id The id of the button
     * 
     * @returns Object The pivot button config.
     * @private
     */
    function createPivotButton(t, c, id) {
        var b = createMenuButton(t, 'tbPivot' + c, function() {
            fnClick('pivot', [ id ]);
//        }, {
//            visible: $XT + ".isPvtButtonVisible(" + $SD + ", '" + id + "');"
        });
        
        b.bid = id;
        return b;
    }
    
    /**
     * Helper function to create sort buttons.
     * 
     * @param {String} t The text to display in the button.
     * @param {String} c The css class suffix which will be added "tbSort" and used to display the button image.
     * @param {String} b The String value to compare with the current sort order (true or false).
     * 
     * @returns Object The menu button config.
     */
    function createSortButton(t, c, b) {
        return createMenuButton(t, 'tbSort' + c, function() {
            fnClick('sort', [ (b === 'true') ]);
        }, {
            selected: "mstrmojo.all['" + $ID + "Sort'].so === " + b
        });
    }

    function createDrillButton(visible, xtab, data) {
        
        if (!visible) {
            return null;
        }
        var item = xtab.model.getCellDrillsInfo(data);
        if (!item || !item.k) {
            return null;
        }
        return createMenuButton(mstrmojo.desc(183, 'Drill to') + ' ' + (item.n || ''), 'tbDrill', function() {fnClick('drill');});
    }
    
    /**
     * The popup config for the {@link mstrmojo.Xtab}.
     * 
     * @type mstrmojo.Popup
     */
    mstrmojo.XtabCellMenu = mstrmojo.registry.ref({
        id: $ID,
        slot: "popupNode",
        scriptClass: "mstrmojo.Popup",
        cssClass: "mstrmojo-Menu",
        shadowNodeCssClass: mstrmojo.dom.isIE ? "mstrmojo-Menu-shadow" : '', //non-IE browser would apply css shadow on content node.
        contentNodeCssClass: "mstrmojo-Menu-content",
        autoCloses: false,
        locksHover: true,
        
        updatePopupConfig: function(cfg) {
            cfg = cfg || {};
            
            // Retrieve popup properties from config.
            this.xtab = cfg.xtab;
            this.selectedNode = cfg.td;
            var data = this.selectedData = cfg.xtab && cfg.td && cfg.xtab.getCellForNode(cfg.td);
            
            //Sort Options visibility:
            var w = this.sortOptions;
            w.set('visible', ((data && data.at) || 0) & 8);   // 8 = SORT_ACTION
            w.set('so', data && data.so);                     // Undefined - no sorting, true - ascending, false - descending.
            
            //Pivot Options visibility:
            w = this.pivotOptions;
            // Should Pivot Section be visible?
            var pVis = ((data && data.at) || 0) & 16;        // 16 = PIVOT_ACTION
            if (pVis) {
                // Iterate pivot buttons.
                for (var i = 0; i < 6; i++) {
                    var c = w.children[i];
                    // Set visibility of buttons.
                    c.set('visible', this.xtab.model.isPvtButtonVisible(data, c.bid));
                }
            }
            w.set('visible', pVis);
            
            
            // Links Options visibility:
            w = this.linkOptions;
            w.set('visible', ((data && data.at) || 0) & 4);    // 4 = HYPERLINK_ACTION
            
            // Drill Options visibility
            w = this.drillOptions;
            var v = ((data && data.at) || 0) & 1;
            w.set('visible', v);    // 1 = DRILLING_ACTION
            w.set('children', [createDrillButton(v, this.xtab, data)] );
            
            // Position this popup below the given button.            
            var el = cfg.btn && cfg.btn.domNode,
                op = cfg.opener,
                diff = mstrmojo.boxmodel.offset(el, op && op[this.slot]),
                x = diff.left,
                y = diff.top + ((el && el.offsetHeight) || 0);
           
            this.set('left', x + 'px');
            this.set('top', y + 'px');
        },
        
        children: [{
            id: $ID + 'Links',
            alias: "linkOptions",
            scriptClass: $BOX,
            cssClass: $BOXC,
            visible: false,
            children: [{
                // ListBox for hyperlinks.
                scriptClass: "mstrmojo.WidgetList",
                autoHide: true,    
                itemFunction: function(item, idx){
                    if (idx === 0) {
                        mstrmojo.requiresCls($MN);
                    }
                    return new mstrmojo.MenuItem({
                        text: item.n || item.url || (item.target && (item.target.n ||item.target.did)),
                        cssClass: $IB,
                        cssText: (idx === this.itemsInfo && this.itemsInfo.di) ? "font-weight: bold" : "",
                        index: idx,
                        onclick: fnClickLinkMenuItem
                    });
                },
                bindings: {
                    itemsInfo: "this.parent.parent.visible ? " + $XT + ".model.getCellLinksInfo(" + $SD + ") : null",
                    items: "this.itemsInfo.links"
                }
            }]
        }, // End of Links Section
        {
            id: $ID + 'Drill',
            alias : "drillOptions",
            scriptClass: $BOX,
            cssClass: $BOXC,
            visible: false
        }, // End of Drill Section
        {
            id: $ID + 'Sort',
            alias: "sortOptions",
            scriptClass: $BOX,
            cssClass: $BOXC,
            children: [ 
                createSortButton(mstrmojo.desc(7974, 'Sort Ascending'), 'Asc', 'true'), 
                createSortButton(mstrmojo.desc(7975, 'Sort Descending'), 'Desc', 'false') 
            ] 
        },
        {
            id: $ID + 'Pivot',
            alias: "pivotOptions",
            scriptClass: $BOX,
            cssClass: $BOXC,
            children: [ 
                createPivotButton(mstrmojo.desc(5362, 'Move Left'), 'Left', 'l'), 
                createPivotButton(mstrmojo.desc(5363, 'Move Right'), 'Right', 'r'), 
                createPivotButton(mstrmojo.desc(7978, 'Move Up'), 'Up', 'u'), 
                createPivotButton(mstrmojo.desc(7979, 'Move Down'), 'Down', 'd'),
                createPivotButton(mstrmojo.desc(7976, 'Move to Columns'), 'Cols', '2'), 
                createPivotButton(mstrmojo.desc(7977, 'Move to Rows'), 'Rows', '1')
            ]
        }
        ] //End of menu
    });

})();