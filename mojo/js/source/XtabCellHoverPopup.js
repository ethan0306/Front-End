mstrmojo.requiresCls("mstrmojo.Popup");

(function(){

    // Helper method walks the ancestors of the given xtab, searching for an ancestor that
    // supports an "openXtabCellMenu" method.
    function getPopupDelegate(/*Widget*/ xtab) {
        var w = xtab;
        while (w) {
            if (w.openXtabCellMenu) {
                return w;
            }
            w = w.parent;
        }
        return null;
    }
    
    

    /**
     * XtabCellHoverPopup is the widget that the mstrmojo.Xtab opens when an active cell is hovered upon.  
     * It is NOT a class, but rather a config object for a single widget.  This widget can be re-used by all Xtab instances.
     */
    mstrmojo.XtabCellHoverPopup = {
        cssClass: "mstrXtabCellHoverPopup",
        scriptClass: 'mstrmojo.Popup',
        slot: "overlayNode",
        autoCloses: true,
        children: [
            {
                scriptClass: "mstrmojo.Button",
                alias: "btn",
                onclick: function(){
                    this.openPopup();
                },
                openPopup: function(){
                    var dl = getPopupDelegate(this.xtab);
                    if (dl) {
                        dl.openXtabCellMenu({
                                xtab: this.xtab, 
                                td: this.td, 
                                btn: this
                        });
                    }
                },
                closePopup: function(){
                    var dl = getPopupDelegate (this.xtab);
                    if (dl) {
                        dl.closeXtabCellMenu();
                    }
                }
            }
        ],
        // updatePopupConfig assumes config is a JSON object with property "td" [HTML DOM node].
        // It moves the popup to be positioned over the targeted cell.
        updatePopupConfig: function updPopCfg(/*Object?*/config) {
            var td = config && config.td,
                xtab = config && config.xtab,
                btn = this.btn;
                
            // If we have changed to a different cell from our previous config,
            // make sure our dropdown is not left open. If it is the same cell,
            // we don't want to close the dropdown, because we may just be mousing over
            // from the dropdown back to the cell.
            var lastTd = this._lastTd;
            if (lastTd != td) {
                btn.closePopup();
                this._lastTd = td;
            }
            btn.xtab = xtab;
            btn.td = td;
            if (!td ||!xtab) {
                return;
            }
            
            // What slot (zone) does the given <td> belong to?
            var tbl = mstrmojo.dom.findAncestorByName(
                        td.parentNode,
                        'table',
                        false,
                        xtab.viewport),
                zs = xtab.zones,
                slot = "";
            if (tbl) {
                for (var n in zs) {
                    var z = zs[n];
                    if (z && z.tableNode == tbl) {
                        slot = z.slot;
                        break;
                    }
                }
            }
            // Compute the offset of the td relative to the xtab's overlay slot.
            var diff = mstrmojo.boxmodel.offset(td, xtab.overlayNode);
/*
            // First measure the distance from the zone to the viewport.
            var y = slot.match(/B/) ? xtab._B_ROW.offsetTop : 0,
                x = slot.match(/R/) ? xtab._BR_CELL.offsetLeft : 0;
            if (slot == "_BR") {
                y -= xtab.scrollboxTop || 0;
                x -= xtab.scrollboxLeft || 0;
            }
            // Then add any padding on the viewport (we assume this can be cached for re-use).
            if (xtab._paddingX == null) {
                var px = 0,
                    py = 0;
                var dn = xtab.domNode,
                    el = xtab.viewport;
                while (el && (el != dn)) {
                    px += el.offsetLeft;
                    py += el.offsetTop;
                    el = el.parentNode;                            
                }
                xtab._paddingX = px;
                xtab._paddingY = py;
            }
            x += xtab._paddingX;
            y += xtab._paddingY;
            // Then add the actual offset of the td relative to its zone's table.
            x += td.offsetLeft;
            y += td.parentNode.offsetTop;
*/            
            // Now position all the markup pieces using these calculated coordinates.
            this.set('location', {
                left: 0,
                top: diff.top,
                width:  Math.min(td.offsetWidth + diff.left,  xtab._pl),
                height: td.offsetHeight
            });
         },
        markupMethods: {
            onvisibleChange: function(){
                // Show and hide it as needed.
                this.domNode.style.display = this.visible ? 'block' : 'none'; 
            },
            onlocationChange: function() {
                // Move the arrow to (location.left+location.width-arrow width, location.top).
                var l = this.location;
                if (!l) {
                    return;
                }
                var ds = this.domNode.style;
                ds.left = (l.left+Math.max(l.width-16, 0)) + 'px';    // Minor cheat: Assumes child has 14px width + 1px borders. 
                ds.top = l.top + 'px';
//                // Stretch the child's height according to location.width. 
//                // Minor cheat: Assume child has 1px border, so subtract 2px;
//                // and assume the popupNode is 1px tall so subtract 1px for it.
//                var c = this.children[0];
//                if (c && c.domNode) {
//                    c.domNode.style.height = (l.height-3) + 'px';
//                }
            }
        }
    };
    
})();