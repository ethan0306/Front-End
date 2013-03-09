(function(){
    mstrmojo.requiresCls("mstrmojo.dom", "mstrmojo.css", "mstrmojo.array");
    
    var ROW_AXIS = 1, COL_AXIS = 2;
    
    // Only apply to header values
    function _isOfSameUnit(/*Object*/c1, /*Object*/c2){
        return _isOfSameTitle(c1, c2) && c1.o === c2.o;
    }
    
    // Apply to both header values and metric values
    function _isOfSameTitle(/*Object*/c1, /*Object*/c2){
        return c1 && c2 && c1.ui === c2.ui && c1.axis === c2.axis && c1.mix === c2.mix;
    }
    
    function _addToSelection(/*domNode*/td, /*Object*/cell, /*Widget*/ w){
        var ttlId = w.getCellTitleId(cell),
            idx = w.getCellUnitIndex(cell);
        w.selections[ttlId] = w.selections[ttlId] || {};
        w.selections[ttlId][idx] = w.selections[ttlId][idx] || [];
        w.selections[ttlId][idx].push(td);
        _hilite(td);
    }
    
    function _clearSelection(/*Widget*/ w){
        var sel = w.selections;
        for (var i in sel){
            for (var j in sel[i]){
                for (var k=0, len=sel[i][j].length;k<len;k++){
                    _unHilite(sel[i][j][k]);
                }
            }
        }
        w.selections = {};
    }
    
    function _hilite(/*domNode*/td){
        mstrmojo.css.setOpacity(td, 50);
    }
    
    function _unHilite(/*domNode*/td){
        mstrmojo.css.setOpacity(td, 100);
    }
    
    // how many forms this cell title has?
    function _getFormCount(/*Object*/cell, /*Widget*/w){
        // If the cell is not a metric value
        if (cell.mix === undefined){
            var titles = w.gridData.gts[cell.axis === ROW_AXIS?'row':'col'],
                ttl = titles[cell.tui || cell.ui],
                count = 0;
            for (var i=0, len=titles.length;i<len;i++){
                // The forms belong to the same attribute has the same "id" property value
                if (titles[i].id === ttl.id){
                    count++;
                }
            }
            return count;
        }
        return 0;
    }
    
    mstrmojo._XtabSelections = 
        {
            /**
             * The previously table cell selected while SHIFT key is not pressed.  
             * It will be used as an end point during the range selection.
             */
            lastSelectedTD: null,
            
            /**
             * Select/Unselect a single table cell. If the cell has multiple forms, they should be selected as well.  
             * @param td HTMLElement  
             * @param toggle boolean whether to unselect the cell if it's already selected 
             */
            singleSelect: function singleSelect(td, toggle){
                var data = this.getCellForNode(td),
                    row = td.parentNode;
                
                // In toggle mode(when the ctrl key is down), unselect the cell if it's already selected.
                if (toggle){
                    var ttlId =  this.getCellTitleId(data), 
                        idx = this.getCellUnitIndex(data);
                        selectedTitle = this.selections[ttlId];
                        selectedUnit = selectedTitle && selectedTitle[idx];
                    if (selectedUnit){
                        //A 'unit' may contain multiple form cells. We need un-highlight all of them.
                        for (var i = 0, len = selectedUnit.length; i < len; i++){
                            _unHilite(selectedUnit[i]);
                        }
                        delete selectedTitle[idx];// remove from the selections
                        return;
                    }
                }
                
                //number of forms that we are going to find
                var totalForms = _getFormCount(data, this);

                if (data.axis === ROW_AXIS) {
                    // Check the current row
                    for (var i = 0, formFound = 0, len = row.cells.length; i < len && formFound < totalForms; i++){
                        var tc = row.cells[i], tcData = this.getCellForNode(tc);
                        if (_isOfSameUnit(tcData, data)){
                            _addToSelection(tc, tcData, this);
                            formFound++;
                        }
                    }
                } else if (data.axis === COL_AXIS) {
                    var table = mstrmojo.dom.findAncestorByName(td, 'table', false),
                    rows = table.rows;
                    //Iterate through rows until all the forms are found
                    for (var i = 0, formFound = 0, len = rows.length; i < len && formFound < totalForms; i++){
                        var cells = rows[i].cells;
                        //At most one form can be found on one row.
                        for (var j = 0, len2 = cells.length; j < len2; j++){
                            var tc = cells[j], tcData = this.getCellForNode(tc);
                            if (_isOfSameUnit(tcData, data)){
                                _addToSelection(tc, tcData, this);
                                formFound++;
                                break;
                            }
                        }
                    }
                } else { // metric value
                    _addToSelection(td, data, this);
                }
                
            },
            
             
            /**
             * Select a sequence of consecutive table cells
             */            
            rangeSelect: function rangeSelect(fromTD, toTD){
                var fromCell = this.getCellForNode(fromTD), 
                    toCell = this.getCellForNode(toTD);
                
                if (_isOfSameTitle(fromCell, toCell)){
                    // make sure fromCell is at the leftside / topside
                    if (fromCell.o > toCell.o || fromCell._ei > toCell._ei){
                        var tmp = fromTD;
                        fromTD = toTD; fromCell = this.getCellForNode(fromTD);
                        toTD = tmp; toCell = this.getCellForNode(toTD);
                    }
                    
                    var totalForms = _getFormCount(fromCell, this),
                        axis = fromCell.axis,
                        table = mstrmojo.dom.findAncestorByName(fromTD, 'table', false),
                        rows = table.rows,
                        fromRow = fromTD.parentNode,
                        fromRowIdx = fromRow.rowIndex,
                        fromRowCells = fromRow.cells,
                        toRowIdx = toTD.parentNode.rowIndex;
                    
                    if (axis === ROW_AXIS) {
                        for (var i = fromRowIdx; i <= toRowIdx; i++){//The range is determined by fromCell and toCell
                            var cells = rows[i].cells, found1 = false;
                            
                            // find all the forms
                            for (var j = 0, len = cells.length, formFound = 0; j < len && formFound < totalForms; j++){ 
                                var tc = cells[j], tcData = this.getCellForNode(tc);
                                if (_isOfSameTitle(tcData, fromCell)){
                                    _addToSelection(tc, tcData, this);
                                    formFound++;
                                }
                            }
                        }
                    }else if (axis === COL_AXIS){
                        for (var i = 0, len = rows.length, formsFound = 0; i < len && formsFound < totalForms; i++){
                            var cells = rows[i].cells, shouldSelect = false;
                            for (var j = 0, len2 = cells.length; j < len2; j++){ 
                                var tc = cells[j], tcData = this.getCellForNode(tc);
                                if (_isOfSameUnit(tcData, fromCell)){ 
                                    //Found the start position, we should add the cell to the selection from now on until we reach the end position
                                    shouldSelect = true;
                                }
                                if (shouldSelect){
                                    _addToSelection(tc, tcData, this);
                                }
                                if (_isOfSameUnit(tcData, toCell)){ 
                                    //Reach the last cell, no more cells need to be selected.
                                    break;
                                }
                            }
                            if (shouldSelect){
                                formsFound++;
                            }
                        }
                    }else{ // metric value
                        if (fromRowIdx == toRowIdx){
                            // The cells to select are on the same row.
                            for (var i = fromTD.cellIndex, len = toTD.cellIndex; i <= len; i++){
                                var tc = fromRowCells[i], tcData = this.getCellForNode(tc);
                                _addToSelection(tc, tcData, this);
                            }
                        }else{
                            //The cells to select are on the same column.
                            for (var i = fromRowIdx, len = toRowIdx; i <= len; i++){
                                var cells = rows[i].cells;
                                for (var j = 0, len2 = cells.length; j < len2; j++){
                                    var tc = cells[j], tcData = this.getCellForNode(tc);
                                    if (_isOfSameTitle(tcData, fromCell)){
                                        _addToSelection(tc, tcData, this);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            
            /**
             * This event is called from the onclick handler of the XtabBase.
             * Given info about a click event (such as the target), updates this selection's properties according to the targeted cell.
             * With Ctrl/Shift key down, user can select multiple cells.
             * Currently, only interactive cells can be added to the selection.  
             */
            doSelection: function(/*DomEvent?*/ e, /*DomWindow?*/ hWin, /*Object*/ td) {
                var d = mstrmojo.dom,
                    ctrl = d.ctrlKey(hWin, e),
                    shift = d.shiftKey(hWin, e);
                    
                if (!ctrl){
                    _clearSelection(this);
                }
                
                var data = this.getCellForNode(td);
                var isHeaderValue = data && (data.mix === undefined && data.o !== undefined),
                    isMetricValue = data && (data.mix !== undefined && (data._lp || data._tp));
                
                if (isHeaderValue || isMetricValue) { //It's an interactive cell and not on the grid title.
                    if (shift) {
                        this.rangeSelect(this.lastSelectedTD, td);
                    } else {
                        this.singleSelect(td, ctrl);
                        this.lastSelectedTD = td; 
                    }
                }
            }
        };
})();