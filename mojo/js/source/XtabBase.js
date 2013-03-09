(function(){

    mstrmojo.requiresCls("mstrmojo.Container",
                         "mstrmojo._HasScrollbox",
                         "mstrmojo.XtabZone",
                         "mstrmojo.dom");

    var ROW_AXIS = 1;
    var COL_AXIS = 2;
    var LOCK_OFF = 0;
    var LOCK_ROW = 1;
    var LOCK_COL = 2;
    var LOCK_BOTH = 3;

    /**
     * Bitwise enumerations for Content Provider Types. 
     * @private
     * @ignore
     */
    var CP_TITLE = 1;
    var CP_COL_HEADERS = 2;
    var CP_ROW_HEADERS = 4;
    var CP_VALUES = 8;    
    
    var $D = mstrmojo.dom,
        UNSET;
    
    function onDemandCPAgg(cpList) {
        var vCP = null;
        if(cpList && cpList.length > 1) {
            // incremental fetch. We need to wrap the CPs in side a VACP. 
            vCP = new mstrmojo.XtabVACP();
            vCP.cps = cpList;
        }
        return vCP;
    }
    
    function repaint(node) {
        var img = document.createElement('img');
        node.appendChild(img);
        node.removeChild(img);
    }    
        
    /**
     * Creates OnDemand CPs for row header CP list and values CP list using the result window size
     */
    function addOnDemandCPs(/* JSON ResultWindow */ rw) {
        if(!rw || this._onDemandCP) {
            return;
        }
        
        // have we fetched lesser rows than the total number of rows ? 
        var blockCount = rw.bc,
                totalRows = rw.tc,
                rowsRemaining = totalRows - blockCount,
                numCPs = Math.ceil(rowsRemaining/blockCount),
                rhsCPList = [],
                valuesCPList = [],
                i;

        // we assume that grid is sent initially by iserver with the first block always, as against say starting from 100th row. 
        
        for(i=0;i<numCPs;++i) {
            // what would be the row count for the new content provider. 
            var rc = Math.min(rowsRemaining, blockCount);
            
            // create the content providers. 
            // AND push our onDemand content providers in the corresponding kust for reference during download. 
            rhsCPList.push(this.createOnDemandCP(i+1, rc, CP_ROW_HEADERS));
            valuesCPList.push(this.createOnDemandCP(i+1, rc, CP_VALUES));
            
            // update the rows remaining. 
            rowsRemaining -= blockCount;
        }
        
        this._onDemandCP = {rhs: rhsCPList, vls: valuesCPList};
        return this._onDemandCP;
    }            
    
    
    /**
     * Xtab is a crosstabbed data grid display.  
     */
    /**
     * <p>The widget for a single MicroStrategy Report Services Crosstabbed data grid display.</p>
     * 
     * <p>Or at least, that's how it appears.  It is actually a container with up to 4 child widgets, each of which is a XtabZone instance.  The HTML of
     * the Xtab is typically a 2x2 HTML table, whose cells contain the HTML of each XtabZone.  The 2x2 HTML table of the Xtab is wrapped in a 
     * non-scrolling div, called the "viewport" of the Xtab.  The viewport node does not scroll; however, the bottom-right cell of the 2x2
     * table does have a scrolling div (called the "scrollboxNode" of the Xtab), which contains the HTML of the bottom-right XtabZone width.  
     * This HTML arrangement allows us to produce a "locked headers" effect.</p>
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.XtabBase = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins
        [mstrmojo._HasScrollbox],
        
        /** 
         * @lends mstrmojo.Xtab.prototype
         */
        {            
            scriptClass: "mstrmojo.XtabBase",

            /**
             * Sets the renderMode of the "BOTTOMRIGHT" and "BOTTOMLEFT" XtabZones. This property value
             * is simply passed down to the child widgets; it does not affect the rendering of the 
             * Xtab widget itself.
             */
            dataRenderMode: "vscroll",
                                                
            /**
             * True to listen for click events on interative cells.
             * 
             * @type boolean
             * @default true
             */
            handleClicks: function() {
                return true;
            },
                                                
            markupString: '<div id="{@id}" class="mstrmojo-Xtab {@cssClass}" title="{@tooltip}" style="{@domNodeCssText}">' +
                            '<div style="display: none;{@msgNodeCssText}"><div>&nbsp;</div></div>' +    // Need this dummy div or IE won't see the style tag.
                            '<div class="mstrmojo-Xtab-overlay"></div>' +
                            '<div class="mstrmojo-Xtab-content {@cssDefault}" title="{@tooltip}" style="{@viewportCssText}" mstrAttach:click,selectstart>' +
                                '<table cellspacing="0" cellpadding="0">' +
                                    '<tr>' +
                                        '<td style="vertical-align:top;padding:0px"></td>' +    // These 2x2 cells shouldn't inherit metadata formatting from the table.
                                        '<td style="vertical-align:top;padding:0px"></td>' +
                                    '</tr><tr>' +
                                        '<td style="vertical-align:top;padding:0px"></td>' +
                                        '<td style="vertical-align:top;padding:0px">' +
                                            '<div class="mstrmojo-progress" style="display:none">' +
                                                '<div class="mstrmojo-progress-barbg">' +
                                                    '<div class="mstrmojo-progress-bar"></div>' +
                                                '</div>' +
                                                '<div class="mstrmojo-progress-text"></div>' +
                                                '</div>' +
                                            // The scrollboxNode needs an id so we can use mstrmojo.dom.attachBufferedEvent on it
                                            // overflow macro to account for Grid Clip setting. We could have folded this macro into scrollboxNodeCssText too, but since this one is programmatically 
                                            // controlled (also is the most core style setting for this div) we have it listed separately.  
                                            '<div id="{@id}_scrollbox" style="position:relative;{@scrollboxNodeCssText};{@scrollboxNodeOverflow}"></div>' +
                                        '</td>' +
                                    '</tr>' + 
                                '</table>' +
                            '</div>' +
                        '</div>',

            markupSlots: {
                overlayNode: function() { return this.domNode;},
                msgNode: function() {return this.domNode.firstChild;},
                maskNode: function() { return this.domNode.childNodes[1];},
                viewport: function(){ return this.domNode.lastChild; },
                contentNode: function() { return this.domNode.lastChild.firstChild; },
                scrollboxNode: function() { return this.domNode.lastChild.firstChild.rows[1].cells[1].lastChild; },
                
                // ZONES, 
                _TL: function() { return this.domNode.lastChild.firstChild.rows[0].cells[0]; },                                                    // TOP LEFT
                _TR: function() { return this.domNode.lastChild.firstChild.rows[0].cells[1]; },                                     // TOP RIGHT
                _BL: function() { return this.domNode.lastChild.firstChild.rows[1].cells[0]; },                                 // BOTTOM LEFT
                _BR: function() { return this.domNode.lastChild.firstChild.rows[1].cells[1].lastChild; },                          // BOTTOM RIGHT
                
                // areas used towards resizing/aligning headers 
                _T_ROW: function() { return this.domNode.lastChild.firstChild.rows[0]; },                              // TOP ROW
                _B_ROW: function() { return this.domNode.lastChild.firstChild.rows[1]; },                              // BOTTOM ROW
                _BR_CELL: function() { return this.domNode.lastChild.firstChild.rows[1].cells[1]; },                // BOTTOM ROW CELL
                
                // slots for progress bar
                // ToDo - figure a way to reuse the markup string since DocLayoutViewer has this too.  
                _STATUS: function(){ return this.domNode.lastChild.firstChild.rows[1].cells[1].firstChild;  },
                _STATUS_TXT: function(){ return this.domNode.lastChild.firstChild.rows[1].cells[1].firstChild.lastChild; },
                _STATUS_BAR: function(){ return this.domNode.lastChild.firstChild.rows[1].cells[1].firstChild.firstChild.firstChild; }
            },
            
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = (this.visible) ? 'block' : 'none'; }
            },            
            
            /**
             * Hashtable of child widgets (XtabZone instances), keyed by slot name.  This is a convenient lookup
             * alternative to searching for a XtabZone within the "children" property.
             */
            zones: null,
            
            /**
             * Specifies lock header setting. 
             */
            lockHeadersCase: LOCK_BOTH,
            
            /**
             * Represents a (array) list of all interactive cells that we are rendering.  
             */
            interactiveCellsArray: null,
            
            /**
             * Titles content provider.
             */
            titlesCP: null,
            
            /**
             * Column headers content provider.
             */
            chsCP: null,
            
            /**
             * Row headers content provider. 
             */
            rhsCP: null, 
            
            /**
             * Value content provider.
             */
            valuesCP: null,

            /**
             * Whether the ondemand incremental fetch in enabled.
             * 
             * @type boolean
             * @default true
             */
            onDemandIF: true,
            
            /**
             * When the incremental fetch is on and the grid height is set to fit to content, we use the first page of the grid 
             * to set the xtab height. The boolean value is used to indicate the case.
             */
            numRowFixed: false,
                       
            /**
             * Use the variable to limit the height of the visible area of xtab.
             */
            heightLimit: 0,
            
            /**
             * The xtab viewport height
             */
            height: 0,
            
            /**
             * Use this variable to limit the width of the visible area of the xtab. If the widthLimit is 0, that means
             * the grid width is fit to content. With new pages of the grid is rendered, the width can grow.
             */
            widthLimit: 0,
            
            /**
             * The xtab viewport width
             */
            width: 0,
            
            useTouchScrolling: false,
            
            /**
             * The "_HasScrollbox" mixin allows Xtab to be notified of scroll events in its scrollboxNode.
             * This notification allows Xtab to keep its locked headers (if any) aligned with the data as
             * the data scrolls.  
             * The mixin allows the widget to specify a delay before the notification by setting a "scrollInterval"
             * property. A long delay may look wrong to the end-user who does not suspect that the headers & values
             * are actually stored in separate HTML <tables>.
             */
            scrollInterval:0,

            /**
             * Data structure that stores the selected table cell DOM node. It is a two-level hashmap.
             * On the first level, the key is cell title ID which is built by XtabBase#getCellTitleId. And the value  
             * is the second level map whose key is unit index of the cell built by XtabBase#getCellUnitIndex. 
             * And its value is an DOM node array as each unit may have multiple attribute forms.
             * It can be illustrated as following:
             * TitleId    Unit Index    Array of DOMNodes
             *  1A2   --->    2    ---> [td, td]
             *        --->    3    ---> [td, td]
             *        --->    4    ---> [td, td]
             *  2A3   --->   10    ---> [td]
             *        --->   11    ---> [td]
             */
            selections: null,
            
            /**
             * The return value will be used as the second-level key of the XtabBase.selections.
             * For a header value, return its ordinal value, and for a metric value, return its unique index of the interactive array.
             */
            getCellUnitIndex: function getCellUnitIndex(/*Object*/ cell){
    			return (cell.o !== undefined) ? cell.o : cell._ei;
    		},
    		
    		
    		/**
    		 * The return value will used as the first-level key of the XtabBase.selections.
    		 * For header values, it's built by axis and ui property, and for metric values, it's built by mix property.
    		 */
            getCellTitleId: function getCellTitleId(/*Object*/ cell) {
            	if (cell.axis && cell.ui !== undefined){
            		return cell.axis + 'A' + (cell.ui+1);
                    
            	}else if (cell.mix !== undefined){
            		return '0A'+cell.mix;
                    
                } else {
                    return '';
                }
            },
            
            /**
             * Updates the XTab data that may change due to a selector action.
             * 
             * @param {Object} node The widget node.
             */
            update: function update(node) {
                if (this._super) {
                    this._super(node);
                }
                
                this.set('gridData', node.data[0] || node.data); // interactive grid visualization contain a collection of grids so we use the first one

                var defn = this.defn || node.defn;
                this.sid = this.gridData.sid;
                this.treeType = (defn && defn.tt) || 1;
                this.interactiveCellsArray = [];
            },
            
            /**
             *  Factory method to get content providers initialized with necessary properties. If a non-null content provider (CP) is passed this method would initialize it,
             *  otherwise it would create a new one.   
             * @private
             * @ignore
             */
            initCP: function initCP(/* GridJSON */ gd, /* Array */ interactiveCellsArray, /* Integer */ tp, /* JSONNode */ base, /* JSONNode */ lkpBase, /* Integer */ ax, /* ContentProvider */ cp) {     
                var props = {
                            gridData:gd,
                            type:tp,
                            interactiveCellsArray:interactiveCellsArray
                    };
                
                props.base = base || props.base;
                props.lookupBase = lkpBase || props.lookupBase;
                props.axis = ax || props.axis;
                
                if(!cp) {
                    if(tp === CP_TITLE) {
                        cp = new mstrmojo.XtabTitlesCP(props);
                    } else {
                        cp = new mstrmojo.XtabCP(props);
                    }
                } else {
                    mstrmojo.hash.copy(props, cp);
                }       
                return cp;
            },
            

            preBuildRendering: function preBuildRendering() {
                var gd = this.gridData;
                
                // lock headers setting 
                this.lockHeadersCase = parseInt(gd.lhv, 10);
                this.selections = {};
                
                this.cssDefault = (this.lockHeadersCase === LOCK_OFF || !this.k) ? "" : "r-cssDefault" + (this.k ? "_" + this.k : "");                
                
                // If the grid is in auto fit to content mode and the incremental fetch is on, the xtab will be rendered with fixed numbers of rows 
                // on the first page and use this page height as the xtab height. The remaining rows will be ondemand and can be fetched when user scrolls the scrollbar. 
                // The numRowFixed is used as the flag to record this special auto fit to content case when we need a scrollbar.  The flag is true only when there are rows needs to be downloaded on demand,
                // that is, the total row count larger than the incremental fetch block size  
                this.numRowFixed = !!(!this.height && gd.rw && gd.rw.row && (gd.rw.row.bc < gd.rw.row.tc));
                this.rw = gd.rw;
                this._onDemandCP = null;
                
                //if the width is assigned, set the widthLimit to the same value. Same for the height.
                if(this.width) {
                    this.widthLimit = parseInt(this.width, 10);
                }
                if(this.height) {
                    this.heightLimit = parseInt(this.height, 10);
                }
                
                // trigger the parent's prebuild rendering. 
                return (this._super) ? this._super() : true;
            }, 

            /**
             * The function renders the empty grid. XtabBase will render the empty grid message and hide the viewport.
             */
            renderEmptyGrid: function() {
                var gd = this.gridData,
                    msgNode = this.msgNode,
                    viewport = this.viewport;

                // render empty grid/template message
                msgNode.firstChild.innerHTML = gd.eg;
                msgNode.style.display = "block";
                msgNode.style.overflow = "hidden";
                msgNode.className = 'mstrmojo-message';
                viewport.style.display = "none";
                
                return (this._super) ? this._super() : true;
            }, 
            
            /**
             * This method extends the rendering life-cycle inherited from Container in order to 
             * trigger the intialization of the child widgets (GridBase or XtabZones) and their content providers
             * BEFORE the rendering of children is started, and
             * This extended processing is done only after a rendering has produced a BOTTOMRIGHT slot; presumably, 
             * a rendering that omits that slot doesn't want to show data. 
             */
            postBuildRendering: function postBldRndr() {
                // Need XtabZones for this rendering?
                var gd = this.gridData,
                    bInitZones = !!this._BR && gd,
                    msgNode = this.msgNode,
                    viewport = this.viewport,
                    rtn;
                
                if(gd.eg === undefined) {
                    // render grid normally
                    if (msgNode.style.display === "block") {
                        msgNode.style.display = "none";
                        viewport.style.display = "block";
                    }
                } else {
                    return this.renderEmptyGrid();
                }

                // clear the interactive cells collection. 
                if (!this.interactiveCellsArray) {
                    this.interactiveCellsArray = [];
                }

                if (bInitZones) {
                    this._setupZones(gd);
                    this._setupCPs(gd);
                    // Add the newly created XtabZones as children of this widget now that they have their content providers. Attaches event listeners, sets child.parent, etc.
                    // Check if we've already done this before. If this is a re-render, we don't need to repeat this; the zones are already our children.
                    var zs = this.zones,
                        n;
                    
                    for (n in zs) {
                        var z = zs[n];
                        if (z.parent !== this) {
                            this.addChildren(this.zones[n]);
                        }
                    }
                    
                    // Pre-processing to setup the scrollbox and zones before calling renderChildren().
                    if (this.scrollboxNode) {
                        // Performance optimization: cache a boolean flag to let our zones
                        // know whether or not this scrollbox node has a fixed height.
                        var h = this.heightLimit;
                        this.scrollboxHeightFixed = !isNaN(h) && (h > 0);
                        if (this.scrollboxHeightFixed) {
                            this.scrollboxHeight = h; // Assumes pixels. TO DO: support inches.
                        }
                        this.scrollboxLeft = this.scrollboxTop = 0; // WARNING: what if browser tries to autoscroll to previous position?
    
                        // If we have any locked headers, wire the scrollboxNode to our onscroll handler.
                        if (this.lockHeadersCase) {
                            this.connectScrollbox(this);
                        }
                    }
                }

                this.renderChildren();
                rtn = this._super();
                
                //Special Case: This is the case where we have fit to contents and we default to the first page size as the viewport size. (for IF)
                if(this.numRowFixed) {
                    //Do we not have a height property fixed?
                    if (!this.height) {
                        //Calculate the viewport size from the zone's page height.
                        this.heightLimit = this.zones._BR.getPageHeight(0) + (this._TR ? this._TR.offsetHeight : 0);
                        
                        //Update the height property
                        this.height = this.heightLimit + 'px';
                        
                    } else {
                        //Do we have a height, that must be our viewport size.
                        this.heightLimit = parseInt(this.height, 10);
                    }
                }
                
                // Once the zones are rendered, we need to adjust the scrollbox height in two cases:
                // 1. In lock header case, the scrollbox height should be the xtab height - title height
                // 2. In number of row fixed case, we need to reset the scrollbox size from an estimated value to the proper value 
                if ((this.lockHeadersCase && bInitZones && this.scrollboxNode) || this.numRowFixed) {
                    // Post-processing to initialize scrollboxNode's size.  The size will be set to fit within the available viewport space leftover by the header
                    // zones.  Therefore, this call needs to happen AFTER the child widgets have rendered.
                    // We don't need to resize the scrollbox because the Xtab's markup string & format handler initial set the size of the scrollboxNode to match the size of Xtab's viewport.
                    this.resizeScrollBox($D.isIE);
                }

                //update width value after rendering
                this.onGridWidthChanged(true);
                
                //#481842 - adjust scrollbox min-height when there is horizontal scrollbar
                if ($D.isIE7 && this.scrollboxNode && this.scrollboxNode.scrollWidth > this.scrollboxNode.offsetWidth) {
                    this.scrollboxNode.style.height = this.scrollboxNode.offsetHeight + 17 + 'px';
                }
                
                return rtn;                
            },

            onclick: function onclick(e, hWin) {
                // Do we have NO interactive cells?
                if (!this.interactiveCellsArray.length) {
                    return;
                }

                // Find the targeted table cell, if any.
                var $D = mstrmojo.dom,
                	e = e.e || e,
                    target = $D.eventTarget(hWin, e),
                    clickedCell = target && $D.findAncestorByName(target, 'td', true, this.viewport);

                // Did we find a clicked TD cell?
                if (clickedCell) {
                    // Find the span that contains the cell.
                    var a = $D.findAncestorByName(target, 'span', true, clickedCell);
                    
                    if (a && !$D.shiftKey(hWin,e) && !$D.ctrlKey(hWin,e)) {
                        // Check if we should fire an action in response to this click.
                        // TO DO: move action handler into a delegate object, which can be loaded on-demand.
                        this.defaultAction(clickedCell);
                        
                    } else {
                        this.doSelection(e, hWin, clickedCell);
                        $D.clearBrowserHighlights();
                    }
                }
            },
            
            ontouchend: function ontouchend(e, hWin) {
                this.onclick(e, hWin);
            },
            
            onselectstart: function onselectstart() {
                // Cancel select of text in viewport.
                return false;
            },
            
            /**
             * This handler is the callback that is notified whenever the end-user scrolls the Xtab's scrollboxNode.
             * [The event listening is setup by the _HasScrollbox mixin.]  It calls a method that align our zones if headers are locked.
             */
            onscroll: function() {
                this._alignHeaders();
            },            
            
            /**
             * This method responds to changes in height/width of the viewport by computing a new size for the scrollboxNode (if any).  After this is done, the scrollboxNode may have unwittingly
             * changed its scroll position, so we also manually perform a scroll syncronization as well. The size of the scrollboxNode will be set to fit within the Xtab's viewport, taking up
             * whatever space is left available by the header zones.  If lock headers is OFF, then the scrollboxNode will be resized to occupy the entire viewport's new size.
             * @param {Boolean} bForceRepaint IE has a quirk whereby the rendering gets positioned incorrectly the very first time we do the resize.  As a workaround, we must
             * force IE to do a repaint (even if not needed) the first time we do the resize.  Thus we pass in a flag indicating whether or not the workaround is required.
             */
            resizeScrollBox: function rszScllBx(/*Boolean?*/ bForceRepaint){

                // Do we have a scrollboxNode and a viewport? If not, exit.
                var sb = this.scrollboxNode,
                    ss = sb && sb.style,
                    br = this._B_ROW,
                    brc = this._BR_CELL;
                if (!ss || !br || !brc) {
                    return;
                }
                
                // Now resize the scrollbox to fit within the div. We need the size of the grid div for this calculation.
                // Read our current height & width properties. Assume that values are in pixels; null or non-numeric values are considered "auto".
                // TO DO: enhance to support percents or other units.
                var width = this.widthLimit,
                    // If numRowFixed is true, the first page of the _BR zone is rendered. We need the value to reset the scrolbar height because it was an estimated value.  
                    height = this.heightLimit;
                // If the height or width was just set to auto, then we'll need to measure it.
                if (!width || !height) {
                    // But before we measure it, we must remove any fixed size from our scrollbox so it can expand and the grid div can also expand to accomodate it.
                    if (!width) {
                        ss.width = 'auto';
                    }
                    if (!height) {
                        ss.height = 'auto';
                        this.scrollboxHeightFixed = false;
                    }
                }
                
                if(height) {
                    // Optimization: If the TOP RIGHT  zone has no data rows, don't bother measuring its height.
                    var top = (this.zones._TR && this.zones._TR.cp.rc) ? br.offsetTop : 0,
                        newHeight = height - top;
                    if (newHeight > 0) {
                        ss.height = newHeight + 'px';
                        this.scrollboxHeight = newHeight;
                        this.scrollboxHeightFixed = true;
                        
                        // When numRowFixed is true, the xtab does not have a fixed height value. The table can grow based on the height of its content 
                        // Because lock header case the row header zone can be longer than the scrollbar height, that will cause the xtab to have a big
                        // margin under the grid. We need to set the xtab size as big as the scrollbox height + title rows height to avoid the blank space.
                        if((this.lockHeadersCase !== LOCK_OFF) && this.numRowFixed) {
                            this.viewport.style.height = this.overlayNode.style.height = (newHeight + top) + 'px';
                        }
                    }
                }
                
                if(!this.useTouchScrolling) {
                    //#465070 - always set fixed width on scrollBox node to avoid unnecessary horizontal scrollbar :
                    // If 'width' is not defined in 'formats', then find it from the container cell. :
                    // Moved down this code block after 'height' setting so to get the scrollbox's v-scrollbar info correctly.
                    
                    // How much room is left for the scrollbox? We assume the scrollbox's parentNode <td> has no padding, so the
                    // origin of the scrollbox and that <td> parentNode are the same. If the headers take up all the room in the scrollbox, do nothing in order to avoid incurring performance overhead.
                    // Optimization: If the BOTTOM LEFT zone has no data rows, don't bother measuring its width.
                    var left = (this.zones._BL && this.zones._BL.cp.rc) ? brc.offsetLeft : 0;
    
                    //Get real width in pixel:
                    var newWidth = (this.widthLimit && (this.widthLimit - left)) || (mstrmojo.dom.isIE7 ? brc.scrollWidth + 1: (brc.scrollWidth + (sb.offsetWidth - sb.clientWidth))); //#467211 - add IE7 case.
                    if(newWidth && (newWidth > 0)) {
                        ss.width = newWidth + 'px';                    
                    }
                    
                    // Resizing the scrollboxNode may have caused it scroll position to change, due to a browser quirk.  So we must align the headers with the latest scroll position.
                    this._alignHeaders(bForceRepaint);
                }
            },

            _resizeScrollBoxWidth: function() {
                // Do we have a scrollboxNode and a viewport? If not, exit.
                var sb = this.scrollboxNode,
                    ss = sb && sb.style,
                    br = this._B_ROW,
                    brc = this._BR_CELL;
                if (this.useTouchScrolling || !ss || !br || !brc) {
                    return;
                }
                
                // Now resize the scrollbox to fit within the div. We need the size of the grid div for this calculation.
                // Read our current height & width properties. Assume that values are in pixels; null or non-numeric values are considered "auto".
                // TO DO: enhance to support percents or other units.
                var width = this.widthLimit;
                // If the height or width was just set to auto, then we'll need to measure it.
                if (!width) {
                    ss.width = 'auto';
                } 

                //Get real width in pixel:
                var newWidth = (mstrmojo.dom.isIE7 ? brc.scrollWidth + 1: (brc.scrollWidth + (sb.offsetWidth - sb.clientWidth))); //#467211 - add IE7 case.
                //#475879 only if the inner table width is larger than or equal to the scrollbox node width, we need to adjust the width so that scrollbar can display properly
                //AND we should not allow the adjusted width exceed the format width
                if ((newWidth && (newWidth > 0)) && (!width || (width && (newWidth < width))) && (sb.firstChild.firstChild.offsetWidth >= sb.clientWidth)) {
                    if (mstrmojo.dom.isIE7) {
                        window.setTimeout(function(){ ss.width = newWidth + 'px';}, 1);
                    }
                    else {
                        ss.width = newWidth + 'px';
                    }
                }
            },        
                        
            /**
             * The function responses the width change of the xtab. The boolean value indicates whether the scroll box needs to be updated.
             * If the boolean is not set, we need to resize the scroll box width. 
             */
            onGridWidthChanged: function onGridWidthChange(/*Boolean*/noScrollBoxChange) {
                
                //#475923 update scrollbox width only when lock is off
                if(this.lockHeadersCase === LOCK_OFF && !noScrollBoxChange) {
                    this._resizeScrollBoxWidth();
                }
                
                //once grid width is changed and if the grid width is fit to content, we need to reset the width
                //we set an unset value here in order to delay setting the value. The value is set when we need to read it
                if(!this.widthLimit) {
                    this.width = UNSET;
                }
            },            
            
            /**
             * Get the current Grid dimension. To avoid performance impact, we set the value when we need to read it.
             * We don't need the similar function for grid height because once the grid height is set, it stays.
             * 
             * @param An enumeration which refers to the number 1 as height and 2 as width.
             */
            getGridDimension: function getGridDimension(dimension) {
                var DIM_HEIGHT = 1, /* DIM_WIDTH = 2 */
                    dim = dimension === DIM_HEIGHT ? 'Height' : 'Width',
                    dimLC = dim.toLowerCase(),
                    limit = this[dimLC + 'Limit'];
                
                if(!limit && (this[dimLC] === UNSET || this[dimLC] === 0)) {
                    limit = this.viewport['offset' + dim];
                    this[dimLC] = limit + 'px';
                    return limit;
                } else {
                    return limit || parseInt(this[dimLC], 10);
                }
            },             
            
            /**
             * Implements the illusion of "locked" headers for rows and/or columns by aligning the header XtabZone children (if any) with our scrollbox's
             * current scroll position.
             */
            _alignHeaders: function syncHeaders(/*Boolean?*/ bForceRepaint) {
                // For lock headers OFF case, we shouldn't need this.
                // and if we are using touch scrolling, we should not change scrollbox values to align the zones.
                if(this.lockHeadersCase === LOCK_OFF || this.useTouchScrolling) {
                    return;
                }

                // Assume the current scroll coordinates have been cached to local properties on this widget (thanks to the _HasScrollbox mixin).
                var left = this.scrollboxLeft,
                    top = this.scrollboxTop,
                    zs = this.zones,
                    trz = zs._TR,
                    blz = zs._BL;

                // Now adjust the position of the header zones to align properly.
                // This method will be used to apply a style property to each zone's domNode.
                function set(/*XtabZone*/ zone, /*String*/ prop, /*Integer*/ v) {
                    var el = zone && zone.domNode,
                        s = el && el.style;
                    if (!s) {
                        return;
                    }
                    s[prop] = -v + "px";
                }
                
                // Sync the topRight slot. 
                if (trz && trz.rc) {
                    set(trz, 'left', left);
                }
                // Sync the bottomLeft slot. 
                if (blz && blz.rc) {
                    set(blz, 'top', top);
                }
                
                // TQMS 393836. IE has some problem rendering the grid when the container has overflow:hidden and the inner div has position:relative.
                // Force to repaint to enable the grid to be displayed. We removed some force repaint code which used to re-adjust the position. 
                // If the following force repaint code cannot solve the browser quirk problem for IE, we might rollback our changes.
                if(bForceRepaint) {
                    repaint(this._BL);
                }                   
            },            
            
            /**
             * Performs the default action (if any) on the given cell. In the event that the cell is not provided, it will 
             * get the cell from the td {HTMLTableCell} element.
             * 
             * @param {HTMLTableCell} td The table cell used to trigger the default action.
             * @param {HTMLTableCell} tCell The actual cell node from the JSON.
             * 
             * @returns Boolean True if an action was performed, False if not.
             */        
            defaultAction: function defaultAction(td, tCell) {
                // Retrieve the action from the model.
                var cell = tCell || this.getCellForNode(td),
                    action = this.model.getAction(this.getActionCells(cell)),
                    handler = action && action.h;

                // Do we have a handler and does our controller support this handler?
                if (handler && this.controller[handler]) {
                    // Call the handler (passing in the action).
                    this.controller[handler](this, action.a);
                    return true;
                }
                
                // Return false to indicate that an action was not performed.
                return false;
            },
            
            createZone: function createZone (cfg) {
                return new mstrmojo.XtabZone(cfg || {});
            },
            
            /**
             * This method is called from postRender to initialize the Xtab's children and prepare
             * them for rendering.  The children are assumed to be 4 XtabZones.
             * TO DO: support for re-render; we'll probably need to destroy or re-use existing children.
             */
            _setupZones:function _setupZones(gd) {
                // Initialize a new "zones" lookup hash.
                // We'll populate it with the newly instantiated XtabZone children.
                var oldsz = this.zones;
                
                // reset zones now. 
                this.zones = {};

                // shared variable for closure function below. 
                var zs = this.zones,
                    l = this.lockHeadersCase,
                    zIndex = 'z-index:';
    
                var me = this;
                // This function will be used to instantiate the new child widgets.
                function newz(/*Integer*/ rm, /*String*/ style, /*String*/ slot, oldsz) {
                    var zone = (oldsz && oldsz[slot]) || me.createZone ({
                        renderMode:rm,
                        cssText :style,
                        slot:slot
                    });

                    zs[slot] = zone;                    
                    // pass the row height. 
                    zone.rh = gd.rh;
                }
                                
                // if lock headers is OFF, pass on the CSS class to the zones also so that the inner table (bottom right) would have it to. 
                // todo2 - what about lock header cases ? would we need to split the border settings among different tables ? 
                    
                // Create the zones; only the ones needed, depending upon lock headers setting.
                newz(this.dataRenderMode, zIndex + '1;', "_BR", oldsz);
                if (l & LOCK_ROW) {
                    newz(this.dataRenderMode, zIndex + '3;', "_BL", oldsz);
                }
                if (l & LOCK_COL) {
                    newz(null, zIndex + '3;', "_TR", oldsz);
                }
                if (l === LOCK_BOTH) {
                    newz(null, zIndex + '4;', "_TL", oldsz);
                }

                // For lock headers OFF, set up the autoFitToWindow.
                if (l === LOCK_OFF) {
                    this.zones._BR.autoFitWindow = !!gd.afw;
                    this.zones._BR.tableCssClass = "r-cssDefault" + (this.k ? "_" + this.k : ''); 
                }
                
                //#491704,#501565 - gab between textbox and grid
                if (mstrmojo.dom.isIE7) {
                    if (l & LOCK_ROW || l & LOCK_COL || l == LOCK_BOTH) {
                        this._T_ROW.style.display = 'block';
                    }
                    else if (l == LOCK_OFF) {
                        this._T_ROW.style.display = 'none';
                    }
                }

                var bz = zs._BL || zs._BR;
                if(bz) { // set numColumnCanMerge for the grid
                    bz.numColumnCanMerge = gd.gts.cws.length - 1;
                }
            },

            getHACP: function() {
                return (this._super && this._super()) || new mstrmojo.XtabHACP();
            },

            /**
             * Instantiates content providers for each zone, and assigns them to the corresponding zone.
             * Assumes zones have already been instantiated.
             */
            _setupCPs:function _setupCPs(/* GridJSON */ gd) {
                // Create the four non-aggregate content providers, one per zone.
                var titlesCP = this.titlesCP = this.getTitleCP(gd),
                    chsCP = this.chsCP = this.getColumnHeadersCP(gd), 
                    rhsCP = this.rhsCP = this.getRowHeadersCP(gd),
                    valuesCP = this.valuesCP = this.getValuesCP(gd);
                
                // forceAutoHeight for titles and colHeader sections, if there is a fixed row height. 
                titlesCP.forceAutoRowHeight = chsCP.forceAutoRowHeight = gd.rh;
                
                // Now create any aggregate content providers, if needed, to support locked headers.
                // Then assign a content provider to each zone.
                var zs = this.zones;
                
                switch(this.lockHeadersCase) {
                    case LOCK_OFF : 
                        // create two horizontal aggregated content providers. And an aggregated vertical provider on top of them.
                        var vacp = new mstrmojo.XtabVACP();
        
                        // titles and col headers for first one.
                        var hacpTop = this.getHACP();
                        hacpTop.cps = [titlesCP, chsCP];
                        vacp.cps = [hacpTop];
                        
                        var hacpBottom = this.getHACP();
                        hacpBottom.cps = [rhsCP, valuesCP];
                        vacp.cps.push(hacpBottom);

                        // associate aggregate content provider with the values zone. 
                        zs._BR.cp = vacp;
                    break;
                    
                    case LOCK_ROW : 
                        // create two vertical aggregated content providers. 
                        var acpLeft = new mstrmojo.XtabVACP();
                        var acpRight = new mstrmojo.XtabVACP();
        
                        // titles and row headers for first one.
                        acpLeft.cps = [titlesCP, rhsCP];
        
                        // col headers and values on the other one.
                        acpRight.cps = [chsCP, valuesCP];
                        
                        // associate aggregate content provider with the values zone. 
                        zs._BL.cp = acpLeft;
                        zs._BR.cp = acpRight;
                    break;

                    case LOCK_COL : 
                        // create two horizontal aggregated content providers. 
                        var acpTop = this.getHACP();
                        var acpBottom = this.getHACP();
        
                        // titles and col headers for first one.
                        acpTop.cps = [titlesCP, chsCP];
        
                        // row headers and values on the other one.
                        acpBottom.cps = [rhsCP, valuesCP];
                        
                        // associate aggregate content provider with the values zone. 
                        zs._TR.cp = acpTop;
                        zs._BR.cp = acpBottom;
                    break;

                    case LOCK_BOTH : 
                        zs._TL.cp = titlesCP;
                        zs._TR.cp = chsCP;

                        zs._BL.cp = rhsCP;
                        zs._BR.cp = valuesCP;
                    break;
                    
                }
            },

            ongridDataChange: function ongridDataChange() {
                // Do we have a model?
                var m = this.model;
                if (m) {
                    // Cascade the data to the model.
                    m.set('data', this.gridData);
                } 
            },
            
            gridPagesRendered: mstrmojo.emptyFn,

            /**
             * Get the title content provider
             */
            getTitleCP: function(gd) {
                return this.initCP(gd, this.interactiveCellsArray, CP_TITLE);
            },
            
            /**
             * Get the column headers content provider
             */
            getColumnHeadersCP: function(gd) {
                return this.initCP(gd, this.interactiveCellsArray, CP_COL_HEADERS, gd.ghs.chs, gd.gts.col, COL_AXIS);
            },

            /**
             * Get the row headers content provider
             */
            getRowHeadersCP: function(gd) {
                var rhsCP = this.initCP(gd, this.interactiveCellsArray, CP_ROW_HEADERS, gd.ghs.rhs, gd.gts.row, ROW_AXIS);
                
                // If we allow incremental fetch and result window is not empty
                if(this.onDemandIF && this.rw) {
                    if(!this._onDemandCP) {
                        addOnDemandCPs.call(this, this.rw && this.rw.row); // the function will prepare both rhsCPList and valuesCPList
                    }
                    this.rhsCPList = [rhsCP].concat(this._onDemandCP.rhs);
                    return onDemandCPAgg(this.rhsCPList) || rhsCP;
                } else {
                    return rhsCP;
                }
            },
            
            /**
             * Get the metric value content provider
             */            
            getValuesCP: function(gd) {
                var valuesCP = this.initCP(gd, this.interactiveCellsArray, CP_VALUES, gd.gvs);
                
                // if we allow incremental fetch, then we need to set up ondemand content providers
                if(this.onDemandIF && this.rw) {
                    // If we have incremental fetch and content provider list is empty
                    if(!this._onDemandCP) {
                        addOnDemandCPs.call(this, this.rw && this.rw.row);
                    }
                    this.valuesCPList = [valuesCP].concat(this._onDemandCP.vls);
                    
                    return onDemandCPAgg(this.valuesCPList) || valuesCP;
                } else {
                    return valuesCP;
                }
            },
            
            /**
             * Creates on demand content provider
             * @param {Integer} blockNum block number
             * @param {Integer} rc row count
             * @param {Integer} zone CP_ROW_HEADERS or CP_VALUES
             * @returns {Object} OnDemandCP
             */
            createOnDemandCP: function createOnDemandCP (blockNum, rc, zone) {
                var cp =  new mstrmojo.XtabOnDemandCP();
                cp.dataSource = this;
                cp.blockNum = blockNum;
                cp.rc = rc;
                return cp;
            },
            
            dataDownloaded:function dataDownloaded(/* RWJSONDataNode */ node, /* Object */ memo) {
                // find our on demand content providers. 
                var idx = memo.blockNum,
                        rhsCP = this.rhsCPList[idx],
                        valuesCP = this.valuesCPList[idx],
                        gd = node.data;
                
                if(!rhsCP || !valuesCP) {
                    return;
                }
                // initialize the CP with the necessary grid data nodes and properties. 
                this.initCP(gd, this.interactiveCellsArray, CP_ROW_HEADERS, gd.ghs.rhs, gd.gts.row, ROW_AXIS, rhsCP);
                this.initCP(gd, this.interactiveCellsArray, CP_VALUES, gd.gvs, null, null, valuesCP);
                
                // trigger initContent on the CP (this will ensure that properties like rowCount, colWidths are initialized on the CP using the newly downloaded data). 
                rhsCP.initContent();
                valuesCP.initContent();
                
                // update the status bar, if visible. 
                this.numRowsDownloaded += parseInt(rhsCP.rc, 10);
                this.updateStatus(mstrmojo.desc(8301, "Retrieving Data ..."), this.numRowsDownloaded*100/this.numRowsToDownload);
                
                var zs = this.zones,
                        bl = zs && zs._BL,
                        br = zs && zs._BR;
                
                // our bottom left and bottom right are the only downloadable zones. So, we just ask the ones present (non null or undefined) to handle the download. 
                if(bl) {
                    bl.dataDownloaded();
                }
                if(br) {
                    br.dataDownloaded();
                }
            },
            
            // todo1 - status bar code needs to be cleaned !!!! 
            showDownloadStatus: function shwRndrSts(/* Integer */ numRowsToDownload) {
                // if numRowsToDownload is 0, we should not do anything
                if(!numRowsToDownload) {
                    return;
                }
                
                // if already showing status, it means there are new rows to download. 
                if(this.showingStatus) {
                    this.numRowsToDownload += numRowsToDownload;
                } else {
                    // otherwise this is a fresh set of rows to download. 
                    this.numRowsToDownload = numRowsToDownload;
                    
                    // initialize the variable indicating number of downloaded rows.
                    this.numRowsDownloaded = 0;
                }
                
                if(this.showStatus) {
                    this.showStatus(true, mstrmojo.desc(8301,"Retrieving Data ..."), this.numRowsDownloaded*100/this.numRowsToDownload);
                }
            },    
    
            closeDownloadStatus: function closeSts() {
                this.numRowsToDownload = 0;
                if(this.showStatus) {
                    this.showStatus(false);
                }
            },    
    
            download:function download(/* Integer */ blockNum) {
                // get the result window.
                var rw = this.gridData.rw,
                        rwRow = rw.row,
                        rwCol = rw.col,
                        maxRows = rwRow.bc;
                
                // The download we are about to trigger will feed multiple areas (row headers and values). So, we mark both of them. That way we will avoid double data fetch. 
                this.rhsCPList[blockNum].isDownloading = this.valuesCPList[blockNum].isDownloading = true; 
                
                // if max rows is zero or undefined, nothing to download really. 
                if(maxRows) {
                    var memo = {
                            blockNum:blockNum
                    };
                    // note the start row index is 1 (not 0).
                    this.controller.onDownloadGridData(this, this.model.getDownloadAction(blockNum * maxRows + 1, maxRows, rwCol.bb, rwCol.bc, this.id, memo));
                }
            },            
            
            unrender: function unrender(ignoreDom) {
                //Reset the height, width properties
                this.width = this.widthLimit = this.height = this.heightLimit = 0;
                
                // detach listeners to scrollboxNode, if any; that allows us
                // to reattach to a new scrollboxNode after a re-render later.
                this.disconnectScrollbox(this);
                this._super(ignoreDom);
            },
            
            /**
             * Returns the interactivity data (if any) for a given HTML table cell DOM node.
             *  
             * @param {HTMLElement} td The table cell in question.
             * 
             * @returns {Object} An interactive cells object containing information about the cell. 
             */
            getCellForNode: function(td) {
                var idx = td && td.getAttribute('ei');
                if(isNaN(idx)) {
                    return null;
                }
                var t = this.interactiveCellsArray[parseInt(idx, 10)];
                if(t){
                    t.domNode = td;
                }
                return t;
            },
            
            /**
             * Returns an array of selected cells.
             * 
             * @param {object} cell The interactive cell that initiated the action
             * @returns {Array} An array of selected cells.
             */
            getActionCells: function(cell){
                var cells = [],
                    selections = this.selections;
                
                var titleId = cell.axis + 'A' + (cell.ui+1),
                    selTitle = selections[titleId],
                    i;
                    
                if (selTitle && selTitle[cell.o]){
                    for (i in selTitle){
                        var sc = this.getCellForNode(selTitle[i][0]); //In multiple form case, we only need to add it once
                        cells.push(sc);
                    }
                }else{
                    cells.push(cell);
                }
                return cells;
            },            
            
            setModel: function setModel(model) {
                this.model = model;
                if ( model.data) {
                    this.set('gridData', model.data);
                }
            },
            
            destroy: function destroy() {
            	var model = this.model;
            	if(model && model.destroy) {
            		model.destroy();
            	}
            	this._super();
            }
            
        }
    );
}());