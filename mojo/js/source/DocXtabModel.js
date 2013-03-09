(function(){

    mstrmojo.requiresCls("mstrmojo.XtabModel",
                         "mstrmojo.array",
                         "mstrmojo.func");
    
    var MX = 'Metrics',
        SELECTOR_ACTION = 2;
    
    /**
    * Resolves any control group by (if any) to the target keys property (tks) in the selector control map.
    * 
    *  @param {Object} The control group by mapping of all the control group bys and their respective target keys in a 
    *  given layout.
    */
   function _resolveCGBToTKS(cgbMap) {
       //Return if we don't have new values
       if (!cgbMap) return;
       
       var scm = this.scm,
           delim = '\u001E',
           i = 0,
           id = null,
           curSelector = null,
           cgb = null,
           cgbKey = null,
           targetKey = null,
           updatedTks = false;
       
       for (id in scm) {
           curSelector = scm[id];
           cgb = curSelector.cgb;
           
           //Loop through the control group by that the selector targets and see if we have 
           //the respective target keys.
           for (i in cgb) {
               cgKey = cgb[i];
               targetKey = cgbMap[cgKey];
               
               //We append the target key only if it doesn't exist
               if (targetKey) {
                   if (!curSelector.tks){
                       curSelector.tks = targetKey;
                       updatedTks = true;
                   } else if (curSelector.tks && (curSelector.tks.indexOf(targetKey) < 0)) {
                       curSelector.tks += delim + targetKey;
                       updatedTks = true;
                   }
               }
           }
       }
       
       return updatedTks;
   }
    
    function createSelectorMap () {
        var data = this.data,
            gridTitles = data.gts;
        
        // Do we NOT have any grid titles?
        if (!gridTitles) {
            // Nothing to do.
            return;
        }
        
        var map;
        
        // Iterate grid titles axis.
        mstrmojo.array.forEach([ gridTitles.row, gridTitles.col ], function (axis) {
            // Iterate units on this axis.
            for (var i = 0, cnt = axis.length; i < cnt; i++) {
                // Is this unit a selector?
                var unit = axis[i];
                if (unit.sc) {
                    // Initialize map.
                    map = map || {};
                    
                    // Store the selector in the map.
                    map[unit.id || MX] = unit.sc;
                }
            }
        });
        
        this.scm = map;
        
        _resolveCGBToTKS.call(this, this.docModel.getCGBMap());
    }
    
    function submitToDataService(methodName, args) {
        var dataService = this.getDataService();
        dataService[methodName].apply(dataService, args);
    }

    /**
     * <p>A model for handling Document Xtab interactivity.</p>
     * 
     * @class
     * @extends mstrmojo.XtabModel
     */
    mstrmojo.DocXtabModel = mstrmojo.declare(
        mstrmojo.XtabModel,
        
        null,
        
        /** 
         * @lends mstrmojo.DocXtabModel.prototype
         */
        {            
            scriptClass: "mstrmojo.DocXtabModel",
            
            docModel: null,
            
            init: function init(props) {
                this._super(props);
                
                this.docModel.attachEventListener('CGBMapChange', this.id, function(evt) {
                    // TODO: add onCGMapChange code here
                });                
            },
            
            ondataChange: function ondataChange(evt) {
                createSelectorMap.call(this);
            },
            
            getMessageId: function getMessageId() {
                return this.docModel.mid;
            },
            
            getDataService: function getDataService() {
                return this.docModel.getDataService();
            },            
            
            getAction: function getAction(cells) {
                var cell = cells[0],
                    actionType = cell && cell.at;

                var action;
                // Resolve what the action should be.
                if (actionType) {
                    // Is this a selector action?
                    if (actionType & SELECTOR_ACTION) {
                        
                        var titleInfo = this.getCellTitleInfo(cell),
                            title = titleInfo && titleInfo.title,
                            titleId = title && title.id,
                            selectorControlMap = this.scm;
                    
                        // Cache selected title id for highlighting cells.
                        this.sti = titleId || MX;
                        
                        // Retrieve the selector from the selector map.
                        var sc = (titleId && selectorControlMap[titleId]) || selectorControlMap[MX];
                        
                        // Do we have a selector?
                        if (sc) {
                            // Return the selector action.
                            action = {
                                h: 'onGridSelector',
                                a: {
                                    type: mstrmojo.EnumRWUnitType.GRID,
                                    anchor: cell.domNode,
                                    ck: sc.ck,
                                    tks: sc.tks,
                                    eid: (titleInfo.isSrcTitle) ? 'OA:(All)' : cell._e.id,
                                    ctlKey: sc.ckey,
                                    sliceId: this.xtab.sid
                                }
                            };
                        }        
                    }
                }
                
                // Delegate to super because we couldn't handle it.
                if ( ! action ) {
                    var action = this._super(cells);
                }
                //TQMS 496126 We need to pass the slice ID to the server
                if ( action && action.a ) {
                    action.a.sliceId = this.xtab.sid;
                }
                return action;

            },
            
            getDownloadAction: function getDownloadAction(/* Integer */ rowPosition, /* Integer */ maxRows,  /* Integer */ colPosition, /* Integer */ maxCols, /* String */ widgetID, /* Object */ memo) {
                //TQMS:506089, 505174 add slice Id as the task parameter
                var action = this._super(rowPosition, maxRows, colPosition, maxCols, widgetID, memo);
                action.sliceId = this.xtab.sid;
                return action;
            },
            
            /**
             * Gets drill information for the Drills from the template unit supplied.
             * 
             * @param {Object} cells The interactive cells. The first cell is the html table cell that initiated the drill.
             */
            getDrillAction: function getDrillAction(cells) {
                var action = this._super(cells);                
                action.srcMsgId = this.docModel.mid;
                
                return action;
            },    
            
            sort: function sort (params, callback) {
                // Submit to data service.
                submitToDataService.call(this, 'sort', arguments);
            },
            
            pivot: function pivot (params, callback) {
                // Submit to data service.
                submitToDataService.call(this, 'pivot', arguments);
            },
            
            drillGrid: function drillGrid (params, callback) {
                submitToDataService.call(this, 'drillGrid', arguments);
            },
            
            downloadGridData: function downloadGridData (params, callback) {
                submitToDataService.call(this, 'downloadGridData', arguments);
            },
            
            loadLayout: function loadLayout(res) {
                // This is actually a document model operation so pass the response to the doc model.
                this.docModel.loadLayout(res);
            }
        }
    );
})();