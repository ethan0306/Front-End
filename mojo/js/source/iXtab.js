(function(){

    mstrmojo.requiresCls(         
        "mstrmojo.MobileXtab", /*, mstrmojo._XtabSeamlessIncrementalFetch */
        "mstrmojo._HasMagnifier"
       );
    
    /**
     * Overflow constants
     */
    var OVERFLOW_A = "overflow:auto";
    var OVERFLOW_H = "overflow:hidden";
    
    /**
     * Utility function called whenever the height or width changes.
     * 
     * @param {mstrmojo.iXtab} xtab The current iXtab instance.
     * @param {String} dimension Either 'Height' or 'Width'.
     * 
     * @returns Boolean true if the change was performed, false otherwise.
     * 
     * @private
     */
    function dimensionChange(xtab, dimension) {
        // Do we have a dom?
        var dn = xtab.domNode;
        if (!dn) {
            // NO, then nothing to do.
            return false;
        }
        
        var lcDimension = dimension.toLowerCase(),
            x = xtab[lcDimension],
            intValue = parseInt(x, 10),
            isWidth = (dimension === 'Width');
        
        dn.style[((isWidth) ? 'left' : 'top')] = 0;
        dn.style[lcDimension] = x;
        xtab.contentNode.parentNode.style[lcDimension] = x;
        xtab['scrollbox' + dimension] = intValue;
        
        return true;
    }
    
    /**
     * Create magnifier content based on a given row object
     * @param {Object} row An object contains the information of a give row 
     *   
     * @returns String return a markup string
     * 
     * @private
     */
    function _createMagnifierContent(row) {
        
        var mks = [];
        mks.push('<table style="border-spacing:0px 0px;background:white;border-collapse:collapse;table-layout:auto">');
        
        var addRow = function(l, r, selected) {
            
            var addCell = function(c, cs, s) {          
                if(c && c.ts === 4) { // BASEFORM_PICTURE                        
                    mks.push('<td ' + ' class="' + (c.css || '') + (s ? ' xtab-selected-cell': '') + '" ><img src="' + (c.n || c.v) + '"/></td>');
                } else {
                    mks.push('<td ' + ' class="' + (c.css || '') + (s ? ' xtab-selected-cell': '') + '" style="white-space:nowrap;' + cs + '">' + (c.n || c.v || '&nbsp;') + '</td>');
                }
            };

            mks.push('<tr>');
            addCell(l, 'text-decoration:none;text-align:right !important');
            addCell(r, 'text-decoration:none;text-align:left !important', selected);
            mks.push('</tr>');
        };
        
        var si = row.si, //selected index
        hds = false,
        rc = row.th.length;
    
        for(var i = 0, len = row.rh[0].length; i < len; i++) {
            var rt = row.th[0][i]; 
            if(rc > 1 && i === len -1) { //the last row header
                rt = row.th[rc - 1][0];
            }            
            if(i == si) {
                addRow(rt , row.rh[0][i], true);
                hds = true;
                break;
            }
            addRow(rt, row.rh[0][i]);
        }
        
        var metrics = null;
        if(!hds) {
            for(var j = 0, jLen = row.ch.length; j < jLen; j++) {
                var m = i;
                for(var k = 0, kLen = row.ch[j].length; k < kLen; k++) {
                    var c = row.ch[j][k],
                        cs = (c && c.cs) || 1;
                    
                    if((si >= m) && (si < m + cs)) {
                        if(c.mix !== undefined) { //metrics
                            metrics = c;
                        } else {
                            addRow(j == 0 ? row.th[0][i-1] : row.th[j][0] , c);
                        }
                        break;
                    }
                    m += cs;
                }
            }
            addRow(c, row.vs[0][si-i], true);
        }
        
        mks.push('</table>');
        return mks.join('');        
    }
    
    function findTD (event) {
        var td = event.target;
        while(td && td.tagName != 'TD') {
            td = td.parentElement;
        } 
        return td;
    }
    
    /**
     * iXtab is a crosstabbed data grid display for iPhone.  
     *
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
     * 
     */
    mstrmojo.iXtab = mstrmojo.declare(
        // superclass
        mstrmojo.MobileXtab,
        
        [ mstrmojo._FillsBrowser, mstrmojo._HasMagnifier /*, mstrmojo._XtabSeamlessIncrementalFetch */],
        
        /** 
         * @lends mstrmojo.iXtab.prototype
         */
        {            
            scriptClass: "mstrmojo.iXtab",

            scrollboxHeightFixed: false,
            
            //allows enabling Menus and other interactivity on the iXtab
            enableXtabInteractivity: false,
            
            // for adjust the row number for the value content provider 
            rowAdjust: 0,
            
            /**
             * Sets the renderMode of the "BOTTOMRIGHT" and "BOTTOMLEFT" XtabZones. This property value
             * is simply passed down to the child widgets; it does not affect the rendering of the 
             * Xtab widget itself.
             */
            preBuildRendering: function preBuildRendering() {
        		// for iphone, we want to make sure that the rpp of the Grid is the same as what the content provider has. hence the setting below. 
        		this.numRowFixed = true;
        		
                //Set the overflow to hidden by default
                this.scrollboxNodeOverflow = OVERFLOW_H;                                
                                                
        		//Do we want interactivity? Create an instance of toolbar manager
        		if (this.enableXtabInteractivity) {
                    mstrmojo.requiresCls("mstrmojo._iToolbarMgr");                  
        			this.toolbarMgr = "mstrmojo._iToolbarMgr";
                }
                                
                // trigger the parent's prebuild rendering. 
                return this._super();
            },
            
            postBuildRendering: function postBuildRendering() {
                // trigger the parent's prebuild rendering. 
                var rtn = this._super();
                
                // Setup the mask.
                var msgNode = this.msgNode,
                    maskNode = this.maskNode,
                    evtName = 'webkitTransitionEnd',
                    $DAE = mstrmojo.dom.attachEvent,
                    $PAF = mstrmojo.css.parkAfterFade;

                // Hijack the message node for displaying the loading message.
                msgNode.style.height = 'auto';
                msgNode.style.width = 'auto';
                    
                // Attach an event for when the mask opacity is done animating.
                $DAE(maskNode, evtName, $PAF);
                
                // Attach an event for when the message is done animating.
                $DAE(msgNode, evtName, $PAF);

                // Set a timeout to fade the mask.
                var me = this;
                window.setTimeout(function() {
                    maskNode.style.opacity = 0;
                    me.clearTransitionCurtain();
                    
                    // request for image caching
                    var ic = me.imgCacheMap;
                    if(ic && ic.unCachedImg && ic.unCachedImg.length > 0) {
                        if(me.model && me.model.cacheImages) {
                            me.model.cacheImages(ic.unCachedImg.join(',,,'));
                        }
                    }
                    
                }, 400);
                
                if (this.enableXtabInteractivity) {
                //create toolbar manager object
                this.requiresContrib("toolbarMgr", true);
                }
                
                if(this.lockHeadersCase == LOCK_OFF || this.lockHeadersCase == LOCK_ROW) {
                    this.rowAdjust = this.chsCP.rc || 0;
                }                
                
                return rtn;                                
            },
            
            setTransitionCurtain: function setTransCurtn(/*DOMNode*/domNode) {
                if(domNode) {
                    domNode.style.zIndex = 20;
                    this.transitionCurtain = domNode;                    
                }
            },
            
            clearTransitionCurtain: function clrTransCurtn() {
                var curtain = this.transitionCurtain;
                if(curtain) {
                    var curtainStyle = curtain.style;
                    
                    //when transition curtain fades out, we set the 
                    window.setTimeout(function() {
                        curtainStyle.zIndex = -1;                        
                        curtain.innerHTML = "";
                    }, 10);
                    curtainStyle.opacity = 0;               
                }
            },
            
            performAction: function performAction(touch) {
                // Deselect any lingering cell.
                this.deselectCell();
                
                // Find the cell that was clicked on
                var td = mstrmojo.dom.findAncestorByAttr(touch.target, 'ei', true, this.domNode);
                
                // Did we NOT find a td, or is the value NOT present.
                if (!td || !td.value) {
                    //todo0: need a good way to handle view specific actions rather than let model to handle it
                    if(this.controller.touchTap) {
                        this.controller.touchTap();
                    }
                    return;
                }
                
                var node = td.node;
                this.defaultAction(node);
            },            
            
            /**
             * Display the floating menu if the activity is enabled.
             * 
             * @param {HTMLElement} cell The table cell that initiated this action.
             * @param {Object[]} actions An array of objects that describe each action.
             * 
             * @returns boolean True if the cell should be selected.
             */
            updateActionMenu: function updateActionMenu(cell, actions) {
                if(this.enableXtabInteractivity && this.toolbarMgr) {
                    this.toolbarMgr.showToolbar(cell, actions, this);
                    
                    // Return true so that the cell gets selected.
                    return true;
                } else {
                    //unselect cell
                    return false;
                }
            },
            
            /**
             * Custom handler to improve resize performance.
             * 
             * @see mstrmojo._FillsBrowser
             * 
             * @param {Object} size An object with height ('h') and width ('w') values.
             * @return Boolean true if we don't want the default behavior to occur.
             */
            browserResized: function browserResized(size) {
                if (this.height !== size.h || this.width !== size.w) {
                    // Silently set height and width.
                    this.height = size.h;
                    this.width = size.w;
                    
                    // Call handlers for each.
                    var w = dimensionChange(this, 'Width'),
                        h = dimensionChange(this, 'Height');
                    
                    // Did either handler succeed?
                    if (w || h) {
                        // YES, did height succeed and are column headers locked?
                        //if (h && this.lockHeadersCase === LOCK_COL) { 
                            // Reduce the height of SCROLLAREA.y by the height of the locked headers.
                            //TODO: Use _HasLayout to calculate the height of the scrollable area instead.
                            //SCROLLAREA.y -= 24;
                        //}
                        
                        // Set offsets since height and width changed.
                        this.setOffsets();
                    }
                    
                    return true;
                }
                
                return false;
            },
            
            scrolledOut: function scrolledOut(e) {
                var abs = Math.abs,
                    off = {
                        x: 0,
                        y: 0
                    },
                    axis = e.axis,
                    limit = (0.20 * parseInt(axis === 'x' ? this.width : this.height, 10)),
                    max = abs(this._TMAX[axis]),
                    min = this._TMIN[axis],
                    value = e.value;
                
                //If we use seamless incremental fetch, we do not want to send a swipe for incremental
                //fetch.
                if (axis == 'y' && this.useSeamlessIncFetch) {
                    return;
                }
                
                //Check have we scrolled out of bounds.    
                if ((value > (limit + max)) || (value < (min - limit)) ) {
                    off[axis] = value;
                    
                    //Tell the model that a valid swipe gesture has been made.
                    //todo0: need a good way to handle view specific actions rather than let model to handle it
                    this.controller.swipe({
                        cmd: e.direction,
                        offX: off.x,
                        offY: off.y
                    });
                }
            },
            
            createZone: function createZone(cfg) {
                cfg = cfg || {};
                cfg.tbodyStyle = "background-color:white;";
                
                return this._super(cfg);
            }
        }
    );
})();