(function(){

    mstrmojo.requiresCls( "mstrmojo.Model" );    
    
    // TO DO: Don't duplicate these constants from XtabModel. Instead, declare them as a public enumeration.
    var DRILLING_ACTION = 1,
        SELECTOR_ACTION = 2,    // Not used?
        HYPERLINK_ACTION = 4,
        SORT_ACTION = 8,
        PIVOT_ACTION = 16;
    function _toolTipText(xtab, td) {
        
        /* If the LMC action is Selector, we show no tooltip.
         * If it's Link, we show the exact name of the Link.
         * If it's Drill, we show “Drill to” + the name of the drill path.
         */
        var cell = xtab.getCellForNode(td),
            at = cell && cell.at,
            defAction = 0;
        if (at) {
            defAction = (at & SELECTOR_ACTION) || (at & HYPERLINK_ACTION) || (at & DRILLING_ACTION) ;
        }
        if (defAction === HYPERLINK_ACTION) {
            
            var lInf = xtab.model.getCellLinksInfo(cell);
            if (isNaN(lInf.di)) {
            	return '';
            }
            var item = lInf.links[lInf.di];
            return item.n;
        }
        if (defAction === DRILLING_ACTION) {
            return (mstrmojo.desc(183, 'Drill to') + ' ' + xtab.model.getCellDrillsInfo(cell).n);
        }
        
        // Get description of the element as the tooltip if it is passed down
        if (cell) {
            // with mix existing, means current cell is a metric, the real data is in the "_e" property
            var e = ('mix' in cell) ? cell._e : cell;
            if (e && e.desc) {
                return e.desc;
            }
        }
        return xtab.tooltip || '';
    }
    
    function _shouldShowPopupInner(xtab,  td) {
        // The context menu is only shown when it includes something other than whatever the default LMC action is on the cell.
        
        // Get cell and action type.
        var cell = xtab.getCellForNode(td),
            at = cell && cell.at;

        // Is sort, or pivot or drilling supported?
        if (at & SORT_ACTION || at & PIVOT_ACTION)  {
            return true;
        }
        var actCount = 0;
        if (at & DRILLING_ACTION) {
            actCount ++;
        }
        if (at & HYPERLINK_ACTION) {
            actCount ++;
        }
        if (at & SELECTOR_ACTION) {
            actCount ++;
        }
        if (actCount > 1) {
            return true;
        }
        if (at & HYPERLINK_ACTION) {
            // Is there any non-default link?
            var lInf = xtab.model.getCellLinksInfo(cell),
                links = lInf && lInf.links;
            var len = (links && links.length) || 0 ;
            if (lInf && !isNaN(lInf.di)) {
                len--;
            }
            if (len > 0) {
                return true;
            }
        }
        else {
            return false;
        }
    }
    
    /**
     * <p>Determines is the XTab popup menu should be available from a given cell.</p>
     * 
     * <p>Returns true if the given xtab cell supports sorting, pivoting, or if it supports more than
     * one action (excluding drill), or if it supports more than one hyperlink. The result of this logic is 
     * cached as an expando property of the given cell for future re-use.</p>
     * 
     * @param {mstrmojo.Xtab} xtab The cross-tab control.
     * @param {HTMLElement} td The &lt;TD&gt; element to evaluate.
     * 
     * @type Boolean
     * @private
     */
    function _shouldShowPopup(xtab,  td) {
        var b = td.mstrShowPopup;
        if (b !== undefined) {
            return b;
        }
        
        b = _shouldShowPopupInner(xtab,  td);
                
        td.mstrShowPopup = b;
        
        return b;
    }
    
    /**
     * Returns the HTML table cell (if any) that contains/is the target of the given event.
     */
    function _targetTd(/*DomEvent?*/ e, /*DomWindow?*/ hWin, /*Widget*/ xtab, /*DomNode?*/ target) {
        var d = mstrmojo.dom,
            t = target || d.eventTarget(hWin, e);
        return t && d.findAncestorByName(t, 'td', true, xtab.viewport);
    }

    /**
     * Returns the page limit of the xtab. The value of it is: the xtab's width subtract the scrollbox width if any
     */
    function _getPageLimit(xtab) {
        return xtab.lockHeadersCase < 2 ? //lock off or lock rows, the scrollbox will be on the xtab, in other cases the scrollbox will be on the _BR zone
                xtab.viewport.clientWidth - (xtab.scrollboxNode.offsetWidth - xtab.scrollboxNode.clientWidth) :   //popup position limit from scrollboxNode when no-lockheader or lock col-headers 
                (parseInt(xtab.getFormats().width, 10) || xtab.viewport.clientWidth); //popup position limit from formats or viewport when row-/both header locked        
    }

    
    mstrmojo._XtabCellHoverMgr = mstrmojo.declare(
        // superclass
        mstrmojo.Model,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo._XtabCellHoverMgr",
            
            /**
             * Handle to the Xtab instance whose selections this object represents.
             */
            parent: null,
            
            /**
             * Reference to the last HTML table cell DOM node for which we showed the cell context popup.
             */
            td: null,
                        
            /**
             * This object does not raise any events; however, we make it a subclass of Model so that
             * it is auto-registered in mstrmojo.registry with an auto-generated ID.
             */
            audibles: {"*": false},
                        
            startup: function startup() {
                // Do we have a xtab parent that supports the interactivity API?
                var xtab = this.parent;
                if (xtab && xtab.getCellForNode) {
                    // Listen for mouseover & mouseout events so we can show stuff when end-user hovers over cells.
                    // Attach listeners to table nodes of the xtab's zones. Don't use xtab viewport, because padding may 
                    // cause a gap outside of viewport, which we don't care to listen for.
                    var id = this.id,
                        d = mstrmojo.dom,
                        fOver = this.fOver = function(e){ mstrmojo.all[id].onhover(e, self); },
                        fOut = this.fOut = function(e){ mstrmojo.all[id].onunhover(e, self); },
                        zs = xtab.zones,
                        z;
                    for (z in zs) {
                        var el = zs[z].tableNode;
                        if (el) {    
                            // TO DO: attach these event handlers below to the <tr>s for the titles/col-headers only??
                            d.attachEvent(el, "mouseover", fOver);
                            d.attachEvent(el, "mouseout", fOut);
                        }
                    }
                    // Attach listener for the xtab's "ignoreHover" property.
                    if (!this._sub_ihc) {
                        this._sub_ihc = xtab.attachEventListener(
                                "ignoreHoverChange",
                                this.id,
                                "onChangeIgnoreHover"
                            );
                    }
                    
                    //427257 - need to update '_pl' each time after xtab is re-rendered to get correct grid width.
                    //#394141 - Get the right limit for the cell hover popup poisition
                    window.setTimeout(function(){
                        xtab._pl = _getPageLimit(xtab); 
                        }, 0);
                    }
            },
            
            /**
             * Cleans up whenever Xtab is unrendered.
             * Detaches any DOM attachments made by this object's startup.
             */
            shutdown: function shtdwn(){
                var d = mstrmojo.dom,
                    zs = this.parent && this.parent.zones,
                    z;
                for (z in zs){
                    var el = zs[z].tableNode;
                    if (el) {
                        d.detachEvent(el, "mouseover", this.fOver);
                        d.detachEvent(el, "mouseout", this.fOut);
                    }
                }
            },
            
            /**
             * When the mgr's xtab changes its width, we should reset the page limit value
             */
            onXtabWidthChanged: function() {
                var xtab = this.parent;
                xtab._pl = _getPageLimit(xtab);
            },
            
            /**
             * When this mgr's xtab changes its "ignoreHover" property from true to false, this handler
             * simulates the mouseover for the last previously ignored cell (if any).
             */
            onChangeIgnoreHover: function(){
                var xtab = this.parent;
                if (!xtab.ignoreHover && this._ignored) {
                    this.onhover(null, null, this._ignored);
                }
            },
            
            /**
             * Handles mouseover on xtab's cell nodes by either opening or closing the cell hover popup.
             */
            onhover: function hvr(/*DomEvent?*/ e, /*DomWindow?*/ hWin, /*DomNode?*/ target) {
                if (this.parent.ignoreHover) {
                    this._ignored = mstrmojo.dom.eventTarget(hWin, e);
                    return;
                }
                
                // Was a table cell targeted?
                var xtab = this.parent,
                    td = _targetTd(e, hWin, xtab, target);
                
                if (td && xtab){
                    td.title = _toolTipText(xtab, td);
                }
                // Should we show something upon hover for this table cell?
                if (td && _shouldShowPopup(xtab, td)) {
                    // Cache reference to this cell DOM node.
                    this.td = td;
                    // Load the code to launch a popup into our parent, if needed.
                    if (!xtab.openPopup) {
                        xtab.requiresCls(["mstrmojo._HasPopup"]);
                    }
                    
                    //Issue: 454707
                    //In the event that we perform group by and simultaneously invoke hover on the xtab cell, the xtab object
                    //might not have the page limits set
                    if (!xtab._pl) {
                        xtab._pl = _getPageLimit(xtab);
                    }
                    
                    // Tell our parent to launch its popup specified by its "cellHoverPopupRef".
                    xtab.openPopup("cellHoverPopupRef", {xtab: xtab, td: td});
                } else {
                    // Notify the popup that the mouse is out.
                    this.onunhover(e, hWin, target);
                }                
            },
            
            /**
             * Handles mouseout from xtab's cell nodes by notifying popup (if open) of the event, so that it
             * may close itself, possibly after a timeout.  
             */
            onunhover: function unhvr(/*DomEvent?*/ e, /*DomWindow?*/ hWin, /*DomNode?*/ target) {
                if (this.parent.ignoreHover) {
                    // delete this._ignored;
                    return;
                }
                
                var xtab = this.parent,
                    p = xtab._lastOpened;
                if (!p) {
                    return;
                }
                
                if (p.autoCloses) {
                    p.autoClose();
                } else {
                    xtab.closePopup();
                }
            }            
        }
    );    
}());