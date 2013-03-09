(function () { 

    var ROW_AXIS = 1;
    var COL_AXIS = 2;   
    
    var CP_ROW_HEADERS = 4;
    var CP_VALUES = 8;  
    
    /**
     * Returns whether the grid has more data to display.
     * 
     * @param gd The Grid's JSON data
     * @param isDox Whether the grid is within a document.
     */
    function _moreData(gd, isDoc) {
        var rw = gd.rw;
        
        //If the grid data does not have the result window, it does not have any more data. 
        if (!rw) {
            return false;
        }
        
        return isDoc ? (rw.row.bb + rw.row.bc < rw.row.tc) : (rw.wsr + rw.wmr < rw.tr);
    }    
    
    /**
     * <p>A mixin that implements the seamless incremental fetch.
     * 
     * @class
     * @public
     */
    mstrmojo._XtabSeamlessIncrementalFetch = mstrmojo.provide(
            
        "mstrmojo._XtabSeamlessIncrementalFetch",   
        /**
         * @lend mstrmojo._XtabSeamlessIncrementalFetch #
         */
        {
            /**
             * The mixin name.
             */
            _mixinName: 'mstrmojo._XtabSeamlessIncrementalFetch',
            
            /**
             * Allows the consumer to decide whether they want to use seamless incremental fetch.
             */
            useSeamlessIncFetch: true,
            
            preBuildRendering: function preBuildRendering() {
                var rtn = true;
                if (this._super) {
                    rtn = this._super();
                }
                
                if (this.useSeamlessIncFetch) {
                    //setup incremental fetch button
                    this.currentPageNum = 0;
                    this.currentPageNum = this.loadingPageNum = 0;
                    this.endFetching = !_moreData(this.gridData, this.isDocXtab);
                }
            },                
            
            /**
             * Aggregate content providers and re-initialize the zones
             * 
             *  @param cp Content provider
             *  @param rc CP_ROW_HEADERS or CP_VALUES
             *  @param zone The Xtab zone.
             */
            aggregateCP: function aggregateCP(cp, rc, zone) {
                
                var scp = (rc === CP_ROW_HEADERS) ? this.rhsCP : this.valuesCP;
                
                // Is the content provider an aggregated one?
                if (scp.scriptClass !== "mstrmojo.XtabVACP") { // yes, can only be vertical aggregated content provider
                    scp = mstrmojo.hash.clone(scp);
                    var tcp = new mstrmojo.XtabVACP();
                    tcp.cps = [scp, cp];
                    mstrmojo.hash.copy(tcp, (rc === CP_ROW_HEADERS) ? this.rhsCP : this.valuesCP);
                } else {
                    // incremental fetch. We need to wrap the CPs in side a VACP. 
                    scp.cps.push(cp);
                }
                
                // Re-initialize the content providers as we now get new data
                if (zone) {
                    zone.cp.initContent();
                }
            },
            
            onScrolledToLastRow: function onScrolledToLastRow() {
                if (this.useSeamlessIncFetch) {
                    var cp = this.currentPageNum,
                        lp = this.loadingPageNum;
                    
                    // Are we requiring some page that is in fetching?
                    if (lp <= cp && !this.endFetching) { // No, because the loading page number is not bigger than the current one
                        this.loadingPageNum = cp + 1;
                        this.download(1 + cp);            
                    }
                }
            },
            
            /**
             * Downloads new data from service
             * 
             * @param blockNum The block number of the grid data to be downloaded
             */
            download: function download(blockNum) {
                // get the result window.
                var rw = this.gridData.rw,
                    rwRow = rw.row,
                    rwCol = rw.col,
                    maxRows = rwRow.bc;
                
                // The download we are about to trigger will feed multiple areas (row headers and values). So, we mark both of them. That way we will avoid double data fetch. 
                this._isDownloading = this.rhsCP.isDownloading = this.valuesCP.isDownloading = true; 
                
                // if max rows is zero or undefined, nothing to download really. 
                if (maxRows) {
                    var memo = {
                            blockNum: blockNum
                        };
                    
                    // note the start row index is 1 (not 0).
                    this.controller.onDownloadGridData(this, this.model.getDownloadAction(blockNum * maxRows + 1, maxRows, rwCol.bb, rwCol.bc, this.id, memo));
                }
            },            
            
            /**
             * Initializes content providers and generates new HTML content to the bottom zones.
             * 
             * @param {Object} node The new json data node.
             * @param {Object} memo 
             */
            dataDownloaded: function dataDownloaded(node, memo) {
                // Are we decelerating?
                if (this._isDecelerating) {
                    // Cache this download and...
                    this._cachedDownload = {
                        node: node,
                        memo: memo
                    };
                    
                    // wait for scrollDone.
                    return;
                }
                
                // Do we already have a cached download waiting for rendering?
                var cachedDownload = this._cachedDownload;
                if (cachedDownload) {
                    // Was a new node passed in?
                    if (node) {
                        // FAIL: We missed a download.
                        alert('Missed download');
                    }
        
                    // Use cached values.
                    node = cachedDownload.node;
                    memo = cachedDownload.memo;
                    
                    // Clear the download.
                    delete this._cachedDownload;
                }
                
                var gd = node.data, 
                    z = this.zones;
                
                // Cache the firstRowHeight so we only have to measure once.
                this._firstRowHeight = this._firstRowHeight || this.contentNode.rows[0].offsetHeight;
                
                var rhsCP = this.initCP(gd, this.interactiveCellsArray, CP_ROW_HEADERS, gd.ghs.rhs, gd.gts.row, ROW_AXIS),
                    valuesCP = this.initCP(gd, this.interactiveCellsArray, CP_VALUES, gd.gvs);
                
                this.aggregateCP(rhsCP, CP_ROW_HEADERS, z._BL);
                this.aggregateCP(valuesCP, CP_VALUES, z._BR);
        
                // Calculate start and end row values.
                var start = rhsCP.startIndexInContainer,
                    end = start + rhsCP.rc - 1;
                
                var appGrid = function (zone) {
                    if (zone) {
                        // Set the start and end so that the block of new rows will be appended.
                        zone.start = start;
                        zone.end = end;
                        
                        // Append new grid content data instead of replacing whole table.
                        zone.renderGrid(true);                                                
                    }
                };
                
                // We need to put the rest in a timeout because for some reason setting innerHTML fails if the user scrolled out.
                var id = this.id;
                window.setTimeout(function () {
                    var w = mstrmojo.all[id];
                    
                    appGrid(z._BL);
                    appGrid(z._BR);
                    
                    // Do we not have anymore data to fetch?
                    if (!_moreData(gd, w.isDocXtab)) {
                        // Set flag.
                        w.endFetching = true;                    
                    }
        
                    //Tell the scrollers to update their offsets.
                    w.setOffsets();
                    w.currentPageNum++;
        
                    // Clear the downloading flag.
                    w._isDownloading = false;
                }, 0);
            }   
        }
    );
}());