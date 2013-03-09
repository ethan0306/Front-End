
(function () {

    mstrmojo.requiresCls("mstrmojo.Widget",
            "mstrmojo.color",
            "mstrmojo.css",
            "mstrmojo.GridBase");

    var $C = mstrmojo.css,
        $CLR = mstrmojo.color;
    
    /**
     * <p>The method goes thought the ancestors of the given widget to return first matched widget object that contains the given function name.</p>
     * 
     * <p>The search stops whenever the ancestor is a panel stack object.</p>
     * 
     * @param {Widget} w The starting widget object. 
     * @param {String} func The function name.
     * 
     * @returns A widget object if the method is found. Otherwise, returns null.
     */
    function findContainerByMethodName(w, func) {
        var anc = w && w.parent;
        while (anc && anc.scriptClass.indexOf('DocPanelStack') === -1) {
            if(func in anc) {
                return anc;
            }
            anc = anc.parent;
        }
        return null;
    };
    
    function repaint(node) {
        var img = document.createElement('img');
        node.appendChild(img);
        node.removeChild(img);
    };
    
    function getTableRowCells(ri, grid) {
        var page = Math.floor(ri/grid.rowsPerPage),
            row = ri % grid.rowsPerPage,
            tbl = grid.tableNode.tBodies[page];
            r = tbl.rows[row].cells;

        return r;
    }
    
    /**
     * Cleans up after page rendering.
     * 
     * @private
     */
    function renderingCleanUp() {
        // Do we have a rendering interval?
        var timer = this._renderTimer;
        if (timer) {
            // Cancel interval.
            self.clearInterval(timer);
            
            // Delete interval handle.
            delete this._renderTimer;
            
            // Clear rendering rows flag.
            this.renderingRows = false;
        }
    }
    
    mstrmojo.Grid = mstrmojo.declare(
        // superclass
        mstrmojo.GridBase,
        
        // mixins.
        null,
        //[mstrmojo.FillViewport],
        //[mstrmojo.FillScrolled],
        
        // instance methods
        {
            scriptClass: "mstrmojo.Grid",

            /**
             * On Demand Grid rendering happens through pages. Each page is approximately the size of our viewport (scrollbox). RowsPerPage represents the (computed) rows of table
             * that each page would hold  
             */
            rowsPerPage: 0,
            
            /**
             * This represents the actual height that a cell occupies - including padding and border. Used for precise calculations towards rendering grid pages.   
             */
            effectiveRh: 0,

            /**
             * Count of pages which have been rendered (either filled with cells or not; both are counted).
             */
            numPagesRendered: 0,
            
            /**
             * Count of total pages of rows, rendered or not.
             */
            totalPages: 0,
            
            /**
             * Array (0-based) of objects with rendering info for each rendered page: {filled: true|false, height: ### (pixels)}.
             */
            pageStatus: null,
            
            /**
             * Effective row height times number of rows per page. This is the height of the place holder pages (tbodies) in pixels.
             */
            _defaultPageHeight: 0,
            
            /**
             * Render Pause between rendering pages. This can be overriden by strategies. Note - value of 0 breaks IE8. 
             */
            renderPause: 10,

            /**
             * Minimum Row Height (used to calculation when row height is not fixed). 
             */
            rhMin: 15,
            
            /** 
             * default rows per page to use, when there's no scrollbox height.
             */
            defaultRowsPerPage: 100,
            
            /**
             * Minimum rows per page to use. This configuration is important to avoid frequent innerHTML replacements as we are scrolling. Rendering too small pages while scrolling  may increase number of innerHTML replacements
             * and slow down the rendering. 
             */
            minRowsPerPage: 50,
                        
            /**
             * Called from constructor.
             */
            init: function init_Grid(/*Object?*/ props) {
                // Apply the superclass constructor first.
                this._super(props);
                
                // we don't want to force fixed sizes in this rendering mode. 
                this.forceFixedSizes = true;

            },

            /*
            preBuildRendering: function preBuildRendering(res) {
                // we want to make sure that scrollbox is connected to the new DOM. That will happen only after all its current listeners are removed. SCrollbox itself attaches to the DOM only the first time.
                if(this.connectedScrollbox) {
                    this.parent.disconnectScrollbox(this);
                    this.connectedScrollbox = false;
                }                
                this._super();
            },
            */
            
            /**
             * Before rendering a (OnDemand) Grid we need to compute how many pages will represent the Grid and what will be the rows per page. This helper does that.
             * It also initializes the numPagesRendered list to indicate that none of the pages have been rendered.   
             */
            initPageSettings: function intiPageSettings() {
                
                var p = this.parent,
                        rpp = this.defaultRowsPerPage;

                // do we have a fixed row height ? If not, we need to base our row height calculations using an approximate row height (rhMin). 
                this.effectiveRh = this.rh || this.rhMin || 1;

                if(p && p.numRowFixed) {
                    // When numRowFixed flag is true, that means we need to render all the available rows in the first page, and let the 
                    // remaining data to be fetched when user scrolls the scrollbar.
                    // In this case, rpp is the number of the available rows. 
                    rpp = this.cp.getAvailableRowsCount();
                } else if (p && p.scrollboxHeightFixed) {
                    // does the does our container (xtab scrollbox) have a fixed height ?  
                
                    // Nice, we have a fixed scrollbox. We now think of our viewPort (scrollbox height) as 1 page. So, essentially, number of rows rpp page (rpp) is equal to the number of rows that would fit in the viewPort/.
                    rpp = Math.ceil(p.scrollboxHeight/this.effectiveRh);
                    
                    // Enforce the min rows per page setting, 
                    rpp = Math.max(rpp, this.minRowsPerPage);
                }

                this.pageStatus = [];
                
                // update the final rowsPerPage we have derived. 
                this.rowsPerPage = rpp;

                this.initPageStatus(this.pageStatus);
                
                this._defaultPageHeight = this.rowsPerPage * this.effectiveRh;
            },            
            
            // initialize the size of the array of pages filled (the size is important, because we need
            // to walk the entire array length to determine if all pages are filled)
            initPageStatus: function initPageStatus(/* Array */ pageStatus) {
                var rpp = this.rowsPerPage;
                
                this.totalPages = rpp && Math.ceil(this.cp.rc/rpp) || 0;
                pageStatus = pageStatus || this.pageStatus;

                // we may not have all pages ready (incremental fetch). 
                for(var i=0;i< this.totalPages ;++i) {
                    // Mark the page status to convey that data needs to be loaded on demand.
                    var startIndex = i*rpp,
                    endIndex = startIndex + rpp - 1,
                    dataAvailable = this.cp.isDataAvailable(startIndex, endIndex);

                    // create the page status object, if not there. 
                    if(!pageStatus[i]) {
                        pageStatus[i] = {};
                    }
                    
                    // update the OnDemand property on the page Status. 
                    pageStatus[i].onDemand = !dataAvailable;
                }
            },

            /**
             * Overwrites  buildRendering so that before delegating the actual grid rendering to its parent, 
             * we compute the page sizes and ensure that the rows are stitched before rendering the first page.  
             */
            buildRendering: function buildRendering(/* DomNode */ tcn) {
                if (this.renderMode == "vscroll") {
                    // calculate the page sizes. 
                    this.initPageSettings();

                    // is our very first page on demand ? Ifyes, we need to trigger onscroll to download the page.
                    var ps0 = this.pageStatus[0],
                            isOnDemand = ps0 && ps0.onDemand;
                    
                    this.start = 0;
                    this.end = -1;
                    
                    if(!isOnDemand) {
                        // now that we know the rows per page, we can go to the Content provider and ask it to stitch its rows using our rows per page. 
    
                        // Determine how many rows to build in the first block.
                        // update the start, end row index.
                        this.end = Math.min(this.cp.rc, this.rowsPerPage) - 1;
                    }
                        
                    // extension points. Before calling the parent's build rendering that will trigger the rendering of the first page, we fire events for pre processing (e.g. container style - top setting in case of fixed size on demand rendering).
                    // Note, we typically render more than one pages at a time. That way we can keep the frequency of some DOM operations under control. So, we expose extension points for both renderPages and renderPage.
                    this.preRenderPages();
                    // super::buildRendering has rendered the first tbody. We didn't end up rendering any rows if it is the OnDemand case. That is quite equivalent to rendering a page with filled=false. Hence trigger pre and post with <filled> flag
                    // based on <onDemand>. 
                    this.preRenderPage(0, !isOnDemand);
                }

                // this will build the first page. 
                this._super();
                
                if (this.renderMode == "vscroll") {
                	var p = this.parent,
                	    me = this,
                    	setMinHeight = function() {
                            me.gridContainerNode.style[mstrmojo.css.MINHEIGHT] = (me.cp.rc * me.effectiveRh) + 'px';
                        };
                    // One-time setup operations:
                    // Set the estimate table height once, then remove the guess when rendering is complete.
                	if (mstrmojo.dom.isIE7) {
                	    //TQMS 544894: set "minHeight" to '1px' to force the "hasLayout" property set to true.
                	    this.gridContainerNode.style.minHeight = '1px';
                    	window.setTimeout(setMinHeight,0);
                	} else {
                	    setMinHeight();
                	}
                	
                    // Set up the scrollbox connection once, then disconnect when rendering is complete.
                    if (!this.connectedScrollbox) {
                        if (p && p.connectScrollbox) {
                            p.connectScrollbox(this);
                            this.connectedScrollbox = true;
                        }
                    }
                    
                    // since we have rendered the first page, we just continue with corresponding post operations.
                    this.postRenderPage(0, !isOnDemand);
                    this.postRenderPages();                    

                    // check whether the table is fit to content. If it is fit to content (scrollbox height is not fixed), and we have 
                    // more pages needs to be rendered, call onscroll to render the remaining data
                    var afc = p && !p.scrollboxHeightFixed && !p.numRowFixed;
                    if(afc && this.numPagesRendered >= this.totalPages && !isOnDemand) {
                        // fit to content, and we have finish rendering all the pages, call postRenderingCleanup.
                        this.postRenderingCleanup();
                    } else if(isOnDemand || afc) {
                        this.onscroll();
                    }
                } else {
                    this.configureActions();
                }
                
            },

            /**
             * Joinpoint for preprocessing before rendering the current block of pages (typically as part of scrolling). 
             */
            preRenderPages: function prePages() {
                // do nothing. 
            },

            /**
             * Joinpoint for postprocessing after rendering the current block of pages. We use these joinpoints to update our DOM dimensions and perform height calculations - for scrollbar synchup.  
             */
            postRenderPages: function postPages() {
                this.configureActions();
            },
            
            configureActions: function configureActions() {
                // check for interactivity ? Maybe, we rendered cells that need interactivity now. 
                var p = this.parent;
                if(p && p.configureActions) {
                    p.configureActions();
                }
            },
                        
            /**
             * Joinpoint for preprocessing before rendering a page. 
             */
            preRenderPage: function prePage(/* int */ idx, /*Boolean*/ bFillCells) {
                // debuggin
                this.pageNum = idx;
            },

            /**
             * Joinpoint for postprocessing after rendering a page. 
             */
            postRenderPage: function postPage(/* int */ idx, /*Boolean*/ bFillCells, /*DomNode?*/ el) {
                // mark the current page as rendered. 
                if (idx+1 > this.numPagesRendered) {
                	this.numPagesRendered = idx+1;
                }
                // update the page's status: did we fill the cells? if so, what is the actual height of the page?
                var arr = this.pageStatus,
                    status = arr[idx];
                if (!status) {
                    // the page has rendered (but possibly not filled), so add a record for it
                    status = arr[idx] = {};
                }
                if (bFillCells) {
                    // update the filled record for the page; if it was previously filled, dont ever reset back to un-filled.
                    status.filled = true;
                }
                
                // In some case when the estimated row height is bigger than the real row height, the min-height of the container
                // will be larger than it should be. So when scrolling to the last page, there will be a blank space under the grid.
                // So we unset the min-height if the last page is rendered.
                var cnStyle = this.gridContainerNode.style;
                if(idx == this.totalPages - 1 && cnStyle) {
                    cnStyle[mstrmojo.css.MINHEIGHT]= '';    
                }
                
            },            
            
            /**
             * Set all the pages to be invalid status.
             */
            invalidAllPages: function() {
                for(var i=0;i< this.totalPages ;++i) {
                    var ps = this.pageStatus[i];
                    ps.onDemand = true;
                    ps.filled = false;
                    ps.isDownloading = false;
                }
                this.thPosMap = [];
                this.posMap = [];
            },
            
            /**
             * Routine to render a block of pages requested through scrolling (or filling up viewport empty space after rendering the first page).   
             */
            _startPageRenderThread: function startRndrThd() {
                var id = this.id;
                
                // Set rendering flag.
                this.renderingRows = true;
                
                // Set render interval.
                this._renderTimer = self.setInterval(function() {
                    try {
                        // We render a block of pages during a given iteration. Implementations can easily implement the API to render one page at a time instead.  
                        var grid = mstrmojo.all[id];
                        
                        if (!grid) return;
                        
                        var pages = grid.getPagesToRender();
                        
                        // if there are pages to render, trigger preProcessing followed by their rendering and post processing extension. 
                        if (pages.length > 0) {
                            grid.preRenderPages();
                            grid.renderPages(pages);
                            grid.postRenderPages();
                            grid._postPagesClearup = true;  
                            
                        } else {
                            if (grid._postPagesClearup) {
                                grid.postRenderPagesCleanup();
                                grid._postPagesClearup = false;                                                    
                            }
                            
                            // No more pages to render so clean up.
                            renderingCleanUp.call(grid);
                            
                            if (grid.isRenderingComplete()) {
                                grid.postRenderingCleanup();
                            }
                        }
                        
                    } catch (ex) {
                        // Clean up after rendering.
                        renderingCleanUp.call(mstrmojo.all[id]);
                        
                        // Throw exception so it will be handled further up the chain.
                        throw ex;
                    }
                        
                }, this.renderPause);
            },
            
            /**
             * Scrollbox Listener. Triggers the rendering routine if its not active already.
             * @param {Boolean} setMask Boolean value decide whether we should set a mask on parent maskNode 
             */
            onscroll: function onscroll(setMask) {
                // if we are rendering currently, don't do anything. The page rendering thread will take care of ensuring that the most recent viewport (scrollbox) is filled up. 
                if (!this.renderingRows) {
                    //sometimes the first parameter is passed as an object, we need to only consider the case when passed in a boolean value
                    if(setMask === true) {
                        var p = this.parent;
                        if(p && p.maskNode) {
                            $C.addClass(p.maskNode, 'wait');
                        }
                    }
                    this._startPageRenderThread();
                }
            },

            /**
             * Checks whether all pages have been rendered. 
             */
            isRenderingComplete: function isRdrComplete() {
                // first make sure we've rendered all pages
                if (this.end >= this.cp.rc - 1) {
                    // all pages are rendered, now make sure all pages have their cells filled in.
                    // this assumes that the length of the array _pagesFilled was initialized to the # of pages.
                    for (var arr=this.pageStatus, i = this.totalPages-1; i >-1; i--) {
                        if (!arr[i] || !arr[i].filled) {
                        	return false;
                        }
                    }
                    return true;
                }
                return false;
            }, 
            
            /**
             * Renders the pages with index passed (as an array)
             */
            renderPages: function renderPages(/* Array[Object] */ pages) {
                for(var i=0,len=pages.length;i<len;++i) {
                    this.renderPage(pages[i].idx, pages[i].fill);
                }
            },
            
            /**
             * Renders a page at the given index. 
             */
            renderPage: function renderPage(/* int */ idx, /*Boolean*/ bFillCells) {
                // Has the requested page already been rendered?
                var arrStatus = this.pageStatus,
                    alreadyRendered = (this.numPagesRendered >= idx+1);
                if (alreadyRendered) {
                    // Yes it has been rendered. If we're not asked to fill its cells, or if it's cells are already filled,
                    // then we don't need to do anything, so exit.
                    if (!bFillCells || (arrStatus[idx] && arrStatus[idx].filled)) {
                    	return;
                    }
                }

                var rpp = this.rowsPerPage,
                    dn = this.domNode;
                
                // update the start, end indexes. 
                this.start = idx * rpp;
                this.end = Math.min(this.start + rpp, this.cp.rc) - 1; 

                // pre processing extension. 
                this.preRenderPage(idx, bFillCells);
                
                // in this mode, we will render each page as a tbody and after rendering, we will move the tbody to the actual Grid table. 
                // create the tbody inside a temp div, which is cached for re-use with subsequent pages.
                var tempTable = this.tempTable;
                if (!tempTable) {
                    tempTable = this.tempTable = dn.ownerDocument.createElement('div');
                }
                
                /*
                var tempTD = '<td style="height:' + (this.effectiveRh * (this.end-this.start+1))+ 'px">&nbsp;</td>';
                
                var tdStr = "";
                
                for(var i=0;i<this.cws.length;++i) {
                    tdStr += tempTD;
                }
                
                var tInnerHTML = bFillCells ?
                                    this.buildTableRowsMarkup(this.start, this.end, '<table><tbody n="' + this.pageNum + '">', '</tbody></table>').join('') :
                                    '<table><tbody class="xtab-empty-page" n="' + this.pageNum + '"><tr>' + tdStr + '</tr></tbody></table>';
                tempTable.innerHTML = tInnerHTML; 
                */
                
                var tInnerHTML = bFillCells ?
                        this.buildTableRowsMarkup(this.start, this.end, '<table><tbody n="' + this.pageNum + '">', '</tbody></table>').join('') :
                            '<table><tbody n="' + this.pageNum + '"><tr><td style="height:' + (this.effectiveRh * (this.end-this.start+1))+ 'px">&nbsp;</td></tr></tbody></table>';
                        tempTable.innerHTML = tInnerHTML; 

                // get the first tbody from our temp table. 
                var tbody = tempTable.firstChild.tBodies[0],
                    tn = this.tableNode;
                
                // move the tbody we just built to the actualy Grid Table. 
                // if the page has not been rendered yet, simply append.
                if (!alreadyRendered) {
                    tn.appendChild(tbody);
                } else {
                    // otherwise, it has been rendered, so we need to swap the old tbody for the new tbody
                    tn.replaceChild(tbody, tn.tBodies[idx]);
                }
                                
                // post processing extension. 
                this.postRenderPage(idx, bFillCells, tbody);
            },
            
            /**
             * Returns the indices of the pages to be rendered. We compute the pages corresponding to the top and bottom of the scrollbox and return them alongwith (index of) pages in between, if any. 
             */
            getPagesToRender: function getPagesToRender() {
                var pages = [],
                    p = this.parent,
                    // what is our page size ? 
                    pageSize  = this._defaultPageHeight,
                    tBodies = null,
                    stats = this.pageStatus,
                    me = this;
                    
                // util function for obtaining the height of a page.
                function pageHeight(idx) {
                    // is the page filled?
                    var stat = stats[idx];
                    if (stat && stat.filled) {
                        // page is filled: use cached page measurement (if cache missing, measure now & cache)
                        if (!stat.height) {
                            if (!tBodies) {
                            	tBodies = me.tableNode.tBodies;
                            }
                            stat.height = tBodies[idx].offsetHeight;
                        }
                        return stat.height;
                    } else {
                        // page is not filled: use the default page height
                        return pageSize;
                    }
                }

                // get indices of the top and bottom page adjacent to the scrolled region.
                // first, for the top, walk the page heights until you reach the scrollboxTop.
                var y = 0,
                    topPageIdx = null,
                    bottomPageIdx = null,
                    scrollTop = p.scrollboxTop;
                for (var i=0, len=this.totalPages, arr = this.pageStatus; i<len; i++) {
                    y += pageHeight(i);
                    if (y >= scrollTop) {
                        topPageIdx = i;
                        break;
                    }
                }
                // did we find a top page? 
                if (topPageIdx === null) {
                    // no, assume its the last page
                    topPageIdx = bottomPageIdx = len-1;
                } else {
                    // yes, so now find the bottom page index by continuing walk of page heights
                    var scrollBottom = p.scrollboxBottom;
                    
                    //TODO: scrollboxBottom can be NaN if grid height is fit to content, 
                    //For transaction, we will render all the pages if one page data is changed.
                    //The better way to fix it is go to _HasScrollBox to set the proper scrollboxBottom value
                    if(isNaN(scrollBottom) && p.numRowFixed) {
                        scrollBottom = scrollTop;
                    }
                    
                    for (var j=topPageIdx+1; j<len; j++) {
                        // Important - make sure our check for bottom ensures that the rendered page overflows the scrollbottom (> check instead of >=). Consider the case where someone jumps to the bottom after opening the grid. That would mean that based
                        // on the original approximation we would likely render some of the last few pages as against the actual last page (since our initial min-height was an approximation). So, now the scroller would jump a little and show
                        // more available rows. If the user tries to scroll to the end again, the problem is that the current rendered page heights would total the scrollBottom so the last set of pages would not render. 
                        if (y > scrollBottom) {
                            bottomPageIdx = j-1;
                            break;
                        }
                        y += pageHeight(j);
                    }
                }
                // if we didn't find a bottom page, assume it was the last page
                if (bottomPageIdx === null) {
                    bottomPageIdx = len-1;
                }
                
                // add to our list any pages which are above the viewport and have not been rendered at all;
                // these do not need to have their cells filled.
                for(var n=this.numPagesRendered;n<topPageIdx;++n) {
                    pages.push({idx: n, fill: false});
                }                   
                
                // add to our list any pages which are WITHIN the viewport and have not had their cells filled.
                // these need to have their cells filled.
                var arrStats = this.pageStatus,
                        numRowsToDownload = 0,
                        rpp = this.rowsPerPage,
                        showStatus = false;
                
                for (var m=topPageIdx;m<=bottomPageIdx;++m) {
                    var stat = stats[m];
                    if (!stat || !stat.filled) {
                        // is the data available ? If not, instead of rendering we need to trigger the download of these pages. 
                        if(stat && stat.onDemand) {
                            showStatus = true;
                            // if we're not already downloading this page, trigger its download, but ONLY if we're not already
                            // downloading some other page.  if we ARE downloading something, don't pile on any more downloads.
                            // wait for the current download to finish; its callback will eventually cause us to return here.
                            if(!stat.isDownloading && !this.isDownloading){ // was: !this.cp.isDownloading
                                numRowsToDownload += rpp; 
                                stat.isDownloading = true;
                                this.isDownloading = true;
                                var startIndex = m*rpp,
                                        endIndex = startIndex + rpp - 1;
                                
                                // trigger the download. 
                                this.cp.download(startIndex, endIndex);
                                //console.log("page " + m + " needs to be downloaded !!!!");
                            }
                            // While awaiting data download, render a placeholder. This fixes the issue that occurs when later pages
                            // download first, and so we render them first, and the order of our page tBodies gets messed up.
                            pages.push({idx: m, fill: false});
                        } else {
                            pages.push({idx: m, fill: true});
                        }
                    }
                }

                // todo1 - status bar code needs to be cleaned !!!! 
                if(showStatus) {
                	this.parent.showDownloadStatus(numRowsToDownload);
                } else {
                    if (this.parent.closeDownloadStatus) this.parent.closeDownloadStatus();
                }
                
                return pages;
            },            

            /**
             * Add the highlight position to the cell
             */
            addHilitePosition: function(key, row, cell) {
                var hm = this.hiliteCellsMap[key];
                if(!hm) {
                    this.hiliteCellsMap[key] = {pos: [], nodes: []};
                }
                var r = row - (this.pageNum || 0) * this.rowsPerPage;
                this.hiliteCellsMap[key].pos.push({row: r, cell: cell, page: this.pageNum});                
            },
            
            /**
             * Go through the position to highlights cells
             */
            setHilites: function(key, node) {
                var ei = node.getAttribute('ei'),
                    pos = this.eiMap[ei],
                    arr = this.getNodesByPositions(pos);
                
                if(!arr.length) {
                    this._super(key, node);
                    return ;
                }
                
                for(var i = 0, iLens = arr.length; i < iLens; i++) {
                    this._super(key, arr[i]);
                }
            },
            
            addExtraInfoMap: function(ei, row, cell) {
                if(!this.eiMap[ei]) {
                    this.eiMap[ei] = [];
                }
                
                this.eiMap[ei].push(this.getPosObj(row, cell));
            },            
            
            addPositionMap: function(ei, row, cell){
                //only remember the first cell that has the same _ei
                if(!this.posMap[ei]) {
                    this.posMap[ei] = this.getPosObj(row, cell);
                }
            },
            
            addTitleHeaderPositionMap: function(row, cell, o){
                var pos = this.getPosObj(row, cell);
                pos.obj = o;
                this.thPosMap.push(pos);
            },

            getPosObj: function(r, c){
                return {row: r - this.pageNum * this.rowsPerPage, cell: c, page: this.pageNum};
            },
            
            getNodeByPosition: function(pos) {
                return this.tableNode.tBodies[pos.page].rows[pos.row].cells[pos.cell];
            },            
            
            /**
             * Get the cell dom node by using the row, column, and page
             * @param {Object} pos A json object contains the row, column, and page information about the cell location.  
             */            
            getNodesByPositions: function(/*JSON*/pos) {
                var arr = [];
                
                for(var i in pos) {
                    var v = pos[i],
                        p = (v && v.page) || 0,
                        r = v && v.row,
                        c = v && v.cell;
                    
                    arr.push(this.tableNode.tBodies[p].rows[r].cells[c]);
                }
                
                return arr;
            },
            
            /**
             * Gets the height of the given page. If the page is not rendered or not exist, returns 0.
             * @param {Integer} idx The index number of the page
             * @return the height of the given page
             */
            getPageHeight: function getPageHeight(idx) {
                var tbd = this.tableNode.tBodies;
                return (tbd && tbd[idx] && tbd[idx].offsetHeight) || 0;
            },
            
            /**
             * Gets the target cell that contains the given coordinate. The function will go through rows from the beginning of the table 
             * to find the cell that is located at the coordinate.
             * @param {Integer} x X axis value
             * @param {Integer} y Y axis value
             */
            getTargetCell: function(x, y) {
                var h = 0, 
                    i = 0;
                
                // find the right tbody
                for(var len = this.totalPages; i < len; i++) {
                    h += this.getPageHeight(i);
                    if(y <= h) {
                        break;
                    }
                }
                var tbody = this.tableNode.tBodies[i];

                if (tbody){
                    // for each row
                    for(var i = 0, len = tbody.rows.length; i < len; i++) {
                        var row = tbody.rows[i];
                        // for each cell in the row
                        for(var j = 0, jLen = row.cells.length; j < jLen; j++) {
                            var cell = row.cells[j];
                            // if y <= the cell bottom
                            if(cell.offsetTop + cell.offsetHeight >= y) {
                                // if x is inside the cell, then we find the cell
                                if(x >= cell.offsetLeft && x <= cell.offsetLeft + cell.offsetWidth) {
                                    return cell;
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
            },
            
            postRenderPagesCleanup: function _postRenderPagesCleanup() {
                var p = this.parent;
                
                if(p && p.gridData && p.gridData.afc) {
                    var tb = this.tableNode;
                    //TQMS 434357 when grid width changed, need to call xtab's onGridWidthChanged function 
                    if(tb && (this.lastWidth != tb.offsetWidth)) {
                        if(p.onGridWidthChanged) {
                            p.onGridWidthChanged();
                        }
                        mstrmojo.array.forEach(this.pageStatus, function(s) {
                            delete s.height;
                        });
                        this.lastWidth = tb.offsetWidth;
                    }
                    var w = findContainerByMethodName(p, 'adjustAutoWidth');
                    if(w) {
                        w.adjustAutoWidth(p);
                    }
                }
                
                if(p.gridPagesRendered) {
                    p.gridPagesRendered();
                }                
                
                //TQMS 433545, IE7 sometimes cannot render newly appended tbody
                if(mstrmojo.dom.isIE && !mstrmojo.dom.isIE8) {
                    repaint(this.domNode);
                }
                
                //finish downloading and rendering, clear the mask if any
                if(p && p.maskNode) {
                    $C.removeClass(p.maskNode, 'wait');
                }
                //high light goes here
                this.hightLightChangedCells();
            },
            
            hightLightChangedCells: function hightLightChangedCells() {
                var ucs = this.cp.getUpdatedRows(),
                    me = this, cells,
                    r, rcells, ci, i, c, ri, doms = [];
                if(ucs) {
                    //get rows, get table, hightlight
                    mstrmojo.hash.forEach(ucs, function(v, k) {
                        ri = parseInt(k, 10);
                        cells = me.cp.getRowCells(ri);
                        r = getTableRowCells(ri, me);
                        rcells = r.length;
                        ci = cells.length - 1;
                        
                        if(ci >= 0) {
                            for(i = rcells - 1; i >= 0; i--) {
                                c = r[i];
                                if(ci<0) {
                                    break;
                                }
                                if(cells[i]._d) {
                                    var bgColor = c.style.backgroundColor,
                                        ftColor = c.style.color;
                                    doms.push({dom: c, bgcolor: bgColor, ftcolor: ftColor});
                                    c.style.backgroundColor = $CLR.getHighlightColor($CLR.rgbStr2rgb(mstrmojo.css.getStyleValue(c, 'backgroundColor'), true));
                                    c.style.color = $CLR.getContrastingColor($CLR.rgbStr2hex(mstrmojo.css.getStyleValue(c, 'backgroundColor')), ['#ffffff', '#000000']);
                                    delete cells[i]._d;
                                }
                                ci--;
                            }
                        }
                    });
                    
                    if(doms.length > 0) {
                        window.setTimeout(function() {
                            mstrmojo.array.forEach(doms, function(domCell) {
                                //mstrmojo.css.removeClass(dom, 'mstrmojo-data-modified');
                                domCell.dom.style.backgroundColor = domCell.bgcolor;
                                domCell.dom.style.color = domCell.ftcolor;
                            });
                        }, 300);
                    }
                }
            },
            
            /**
             * The following method is provides information specific to the row at a given position. 
             * 
             * @param {Integer} y The location at which the caller wants the grid information
             */
            getRowInfoByPosition: function (y) {
                return this.cp.getRowCellInfo(y);
            },
            
            /**
             * Post Rendering Cleanup after all pages have been rendered, 
             */
            postRenderingCleanup: function _postRenderingCleanup() {
                var p = this.parent;
                // detach scroll event listener
                if (p && this.connectedScrollbox) {
                	p.disconnectScrollbox(this);
                }
                this.connectedScrollbox = false;  
                
                // ask the subsection object to resize
                if (p && !p.scrollboxHeightFixed) {
                   var c = findContainerByMethodName(p, 'performCanGrowCanShrink');
                   if (c) {
                	   c.performCanGrowCanShrink([p], true);
                   }
                }             
            },
            
            unrender: function unrender(ignoreDom) {
                // Clean up rendering (just in case).
                renderingCleanUp.call(this);
                
                // Detach scroll event listener.
                if (this.connectedScrollbox) {
                    this.parent.disconnectScrollbox(this);
                    this.connectedScrollbox = false;
                }
                
                this.numPagesRendered = 0;
                this.lastWidth = 0;
                
                this._super(ignoreDom);
            },
            
            dataDownloaded: function dataDownloaded() {
                this.isDownloading = false;
                this.initPageStatus();
                this.onscroll();
            }
        }
    );
})();