(function () {

    mstrmojo.requiresCls("mstrmojo.XtabBase",
                         "mstrmojo.XtabZone",
                         "mstrmojo._TouchGestures",
                         "mstrmojo._HasXtabTouchScroll",
                         "mstrmojo._XtabSelections",
                         "mstrmojo.dom",
                         "mstrmojo.hash",
                         "mstrmojo._HasMagnifier",
                         "mstrmojo.XtabMagnifierHelper");

    /**
     * Lock headers constants.
     *
     * @private
     * @refactoring Need to share these instead of copying to each class.
     */
    var LOCK_OFF = 0;
    var LOCK_ROW = 1;
    var LOCK_COL = 2;
    var LOCK_BOTH = 3;

//    /**
//     * Default configuration for pivot buttons.
//     *
//     * @private
//     */
//    var pivotButtonsConfig = {
//        2: 'To Columns',
//        1: 'To Rows',
//        l: 'Left',
//        r: 'Right',
//        u: 'Up',
//        d: 'Down'
//    };

    /**
     * <p>The widget used to display a single touch enabled MicroStrategy Crosstabbed data grid display for a Mobile device.</p>
     *
     * @class
     * @extends mstrmojo.XtabBase
     */
    mstrmojo.MobileXtab = mstrmojo.declare(
        // superclass
        mstrmojo.XtabBase,

        [ mstrmojo._TouchGestures, mstrmojo._HasXtabTouchScroll, mstrmojo._XtabSelections, mstrmojo._HasMagnifier ],

        /**
         * @lends mstrmojo.MobileXtab.prototype
         */
        {
            scriptClass: "mstrmojo.MobileXtab",

            /**
             * The number of animations per second when decelerating a scroll operation.
             *
             * @type Number
             * @default 30
             */
            frameRate: 30,
            
            /**
             * Whether to show magnifier when touch events get fired.
             * @type Boolean
             * @default true
             */
            enableMagnifier: true,

            useSeamlessIncFetch: false,

            markupMethods: {
                onvisibleChange: function () { this.domNode.style.display = (this.visible) ? 'block' : 'none'; },
                onheightChange: function () { this.domNode.style.height = this.height || ''; },
                onwidthChange: function () { this.domNode.style.width = this.width || ''; }
            },

            init: function(props){
                this._super(props);
                this.magnifierHelper = mstrmojo.XtabMagnifierHelper.newInstance(this);
            },
            
            getDataService: function getDataService(options) {
                return this.model.getDataService();
            },

            setData: function setData(data) {
                this.set('gridData', data);
            },

            createZone: function createZone(cfg) {
                cfg = cfg || {};
                var ds = this.getDataService();
                cfg.imgCacheMap = (ds && ds.imgCache) || this.imgCacheMap;
                cfg.unCachedMap = {};

                return new mstrmojo.XtabZone(cfg);
            },

            showDownloadStatus: function showDownloadStatus() {
                // todo
            },

            onclick: mstrmojo.emptyFn,

            /**
             * Setup the touch scroll nodes depending on the lock header case.
             */
            setupTNs: function setupTNs() {

                // Cache the containing table.
                var node = this.contentNode,
                    scrollBox = node.rows[1].cells[1].lastChild,
                    zIndex = 0;

                // Setup touch nodes.
                switch (this.lockHeadersCase) {
                case LOCK_OFF:
                    this._TSN.x = [ scrollBox.lastChild.lastChild ];
                    this._TSN.y = [ scrollBox.firstChild ];
                    break;

                case LOCK_COL:
                    this._TSN.x = [ node ];
                    this._TSN.y = [ scrollBox.firstChild ];
                    break;

                case LOCK_ROW:
                    this._TSN.x = [ scrollBox ];
                    this._TSN.y = [ node ];
                    zIndex = -1;
                    break;

                case LOCK_BOTH:
                    this._TSN.x = [
                        node.rows[0].cells[1].lastChild,    // Header
                        scrollBox.firstChild                // Contents
                    ];
                    this._TSN.y = [ node.rows[1] ];
                    zIndex = 2;
                    break;
                }

                // Do we need to change the zIndex of the first X scroll node?
                if (zIndex) {
                    this._TSN.x[0].style.zIndex = zIndex;
                }

                // Set offsets
                this.setOffsets();

                // Attach an event listener to hear when scrolling is done.
                this.attachEventListener('scrolledOut', this.id, this.scrolledOut);
            },

            /**
             * For xtabs that have locked headers, we always have fixed rows heights and column widths. So we optimize to
             * not use the dom to calculate the offsets.
             */
            useDomToCalculateOffsets: function useDomToCalculateOffsets() {
                return (this.lockHeadersCase === LOCK_OFF || (this._super && this._super()));
            },

            setOffsets: function setOffsets() {
                var TW = 0,                                 // Total width.
                    TH = 0;                                 // Total height.

                // Calculate the offsets.
                var lockHeadersCase = this.lockHeadersCase;

                //For Lock off case, we do not have fixed row heights and hence we calculate the dom dimensions.
                //Although Interactive Grids are Locked Col Headers by definition, we calculate the dom because of
                //possible grouping sections.
                if (this.useDomToCalculateOffsets()) {
                    var touchNodes = this._TSN,
                        xScroll = touchNodes.x[0],
                        yScroll = touchNodes.y[0];

                    // Use DOM calculations since we don't have column widths or row heights.
                    TW = xScroll.offsetLeft + xScroll.offsetWidth + (!!(lockHeadersCase & LOCK_ROW) ? this._BL.offsetWidth : 0);
                    TH = yScroll.offsetTop + yScroll.offsetHeight + (!!(lockHeadersCase & LOCK_COL) ? this._TR.offsetHeight : 0);
                } else {
                    var zones = this.zones,
                        rh = parseInt(this.gridData.rh, 10),           // Row height.
                        cntTopRight = zones._TR ? zones._TR.cp.rc : 0,                 // Top right zone row count.
                        cntBottomRight = zones._BR.cp.rc,              // Bottom right zone row count.
                        widthBottomLeft = zones._BL ? zones._BL.totalColWidth : 0,     // Bottom left zone total column width.
                        widthBottomRight = zones._BR.totalColWidth;    // Bottom right zone total column width.

                    TH = ((lockHeadersCase === LOCK_ROW) ? cntBottomRight : cntTopRight + cntBottomRight) * rh;
                    TW = (lockHeadersCase === LOCK_COL) ? widthBottomRight :  widthBottomLeft + widthBottomRight;
                }

                //For Mobile Xtabs in Documents, we want to check if we have the scrolling dimensions in the formatting properties.
                var HEIGHT = 1,
                    WIDTH = 2,
                    scrollWidth = this.getGridDimension(WIDTH) || 0,
                    scrollHeight = this.getGridDimension(HEIGHT) || 0;

                // We calculate the offsets by subtracting the total width from the available scroll area.  For reports smaller than
                // the scroll area, set the max and offset to 0.
                this._TMAX = {
                    x: Math.min(scrollWidth - TW, 0),
                    y: Math.min(scrollHeight - TH, 0)
                };

                if (this._super) {
                    this._super();
                }
            },

            touchTap: function touchTap(touch) {
                if (this._super) {
                    this._super();
                }

                this.performAction(touch);
            },

            performAction: function performAction(touch) {
                // Deselect any lingering cell.
                this.deselectCell();

                // Find the cell that was clicked on
                var td = mstrmojo.dom.findAncestorByAttr(touch.target, 'ei', true, this.domNode);

                // Did we NOT find a td, or is the value NOT present.
                if (!td || !td.value) {
                    // Nothing to do.
                    return;
                }

                var node = td.node,
                    cell = this.getCellForNode(node),
                    actionType = cell.at;

                if (this._super && this._super(touch)) {
                    //nothing more to do
                    return;
                }

                // Does this cell NOT have an action type?
                if (!actionType) {
                    // Nothing to do.
                    return;
                }
                this.defaultAction(node);
            },


            /**
             * Changes the appearance of the passed cell to indicate a "selected" status.
             *
             *  @param {HTMLElement} cell The cell to select.
             */
            selectCell: function selectCell(cell) {
                // Add an overlay highlight.
                var highlight = document.createElement('div'),
                    highlightStyle = highlight.style;

                highlight.className = 'overlay';
                highlightStyle.top = cell.offsetTop + 'px';
                highlightStyle.left = (cell.offsetLeft + 1) + 'px';
                highlightStyle.height = (cell.clientHeight - 2) + 'px';
                highlightStyle.width = (cell.clientWidth - 1) + 'px';

                cell.appendChild(highlight);
            },

            /**
             * Removes the "selected" status from the currently selected cell.
             */
            deselectCell: function deselectCell() {
                // Do we have a selected cell?
                var cell = this._selectedCell;
                if (cell) {
                    // Remove overlay.
                    cell.removeChild(cell.lastChild);

                    delete this._selectedCell;
                }
            },
            
            touchSelectBegin: function touchSelectBegin(touch) {
                if (this.enableMagnifier){
                    var helper = this.magnifierHelper,
                        touchObj = helper.resolveTouchEvent(touch);
                    
                    if (touchObj){
                        this.displayMagnifier(helper.createContent(touchObj), touchObj.cell, touchObj.pos);
                    }
                }
            },

            touchSelectMove: function touchSelectMove(touch) {
                if (this.enableMagnifier){
                    var me = this;
                    this.latestTouch = touch;
                    if (!this._moveMagnifierTimer){
                        //Performance optimization: Put the function in a timeout to avoid too many touch events being raised because user cares more about 
                        //the most recently tapped cell than those cells that the finger has moved across.
                        this._moveMagnifierTimer = setTimeout(function(){
                            var helper = me.magnifierHelper,
                                touchObj = helper.resolveTouchEvent(me.latestTouch);
                            
                            if (touchObj){
                                if (touchObj.cell != me.magnifiedNode){
                                    me.displayMagnifier(helper.createContent(touchObj), touchObj.cell, touchObj.pos);
                                }else{
                                    me.moveMagnifier(touchObj.pos);
                                }
                            }
                            me._moveMagnifierTimer = null;
                        }, 50);
                    }
                }
            },
            
            touchSelectEnd: function touchSelectEnd(touch){
                if (this.magnifier){
                    //reset the style to allow the magnifier pointer events.
                    this.magnifier.domNode.style.pointerEvents = 'auto';
                }
            }
        }
    );
}());