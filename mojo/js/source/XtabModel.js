(function(){

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.array",
                         "mstrmojo.StringBuffer",
                         "mstrmojo.ResSetLink");
    
    var ROW_AXIS = 1,
        COL_AXIS = 2;
    
    var ATTRIBUTE_SORT = 2,
        COLUMN_SORT = 4;
    
    var DRILLING_ACTION = 1,
        HYPERLINK_ACTION = 4;
    
    
    /**
     * Utility function to retrieve the axis from the grid titles collection.
     * 
     * @param {Object} gts The grid titles collection.
     * @param {Integer} ax The axis to retrieve (1 = rows, 2 = columns).
     * 
     * @private
     * @returns Object[]
     */
    function getTitlesAxis(gts, ax) {
        return gts[((ax === ROW_AXIS) ? 'row' : 'col')];
    }
    
    function getCellLinksContainer(cell, title) {
        var linkMap = title.lm;
        
        // If the cell has a metric index (for metric values), we need to look at the linksContainer at the corresponding index under the title. 
        return linkMap && linkMap[cell.mix || 0];
    }
    
    function getCellDrillsContainer(cell, title) {
        var drillList = title.dp;
        
        return drillList && drillList[cell.mix || 0];
    }
    
    
    function buildLink(linksContainer, linkInfo, cell) {
        var gts = this.data.gts;
        

        var link = new mstrmojo.ResSetLink({
            mid: this.getMessageId(),
            srct: 2,
            aopam: linkInfo.daMode
        });          
        // Get the answers info. 
        var answers = linkInfo.ans,
            answerCnt = answers && answers.length;
          
        if (answerCnt) {
            
            // Add prompts node. 
            var prms = link.prms = [];
            
            for (var i = 0; i < answerCnt; i++) {
                var answer = answers[i];
                  
                // Prompt ID, answermode, prompt type.
                var pid = answer.pid,
                    am = answer.m,
                    prm = {
                        id: pid,
                        am: am
                    };
                prms.push(prm); 
                if (answer.po) {
                    prm.orid = answer.po.did;
                    prm.ortp = answer.po.t;
                }
                  
      
                // How should we answer the prompts?
                switch (am) {
                    case link.DO_NOT_ANSWER:
                    case link.CLOSE:
                    case link.USE_DEFAULT_ANSWER:
                    case link.SAME_PROMPT:
                        break;
                          
                    case link.STATIC:
                        var statElems = answer.es,
                            staticLen = statElems && statElems.length || 0;

                        prm.pa = {
                            es:[]        
                        };
                        for (var z = staticLen - 1; z >= 0; --z) {
                            var statElem = statElems[z];
                            prm.pa.es.push({
                                ei: statElem.id,
                                disp_n: statElem.n,
                                emt: 1
                            });
                        }
                          
                        break;
                          
                    case link.DYNAMIC:
                    case link.ALL_VALID_UNITS:
                    case link.CURRENT_UNIT:
                        var dynUnits = answer.dunits;       // Dynamic units.
                        if (dynUnits && dynUnits.length && cell) {
                            var pa = prm.pa = {};

                            // We want to traverse the current cell and its parent to pick up the dynamic ancestors of dynamic units configured.
                            var pCell = cell,
                                // Has the link originated from a metric value ? If so, it would have a metric index (metric headers would have that too !) AND it would have left and top parents. 
                                isMetricValue = (cell.mix !== undefined) && (cell._lp || cell._tp);
                                  
                                // For metric value, we will first start looking at the parent row headers, then the col headers. 
                                if (isMetricValue) {
                                    // Start with the row headers (leftParent), then the row headers. 
                                    // If there's no left parent, we start with the top parent itself.  
                                    pCell = cell._lp || cell._tp;
                                }
                                  
                                var axis = pCell.axis;
                                while (pCell) {
                                    // Update parent title.
                                    var pTitle = getTitlesAxis(gts, axis)[pCell.tui];

                                    // Is the title in the dynamic units collection. 
                                    if (pTitle && mstrmojo.array.find(dynUnits, 'id', pTitle.id) >= 0) {
                                        if (am != link.DYNAMIC) {
                                            pa.a = {
                                                id: pTitle.id,
                                                n: pTitle.n,
                                                dispForms: pTitle.dfi
                                            };
                                        }
                                          
                                        // ID of the current cell.  
                                        var eid = pCell._e.id,
                                            dsn = pCell._e.n; // display name
                                        
                                        pa.es = [];
                                        pa.es.push({
                                            ei: eid,
                                            emt: 1,
                                            disp_n: dsn 
                                        });
                                        
                                        if (am == link.CURRENT_UNIT) {
                                            break;
                                        }
                                    }

                                    // next parent. cell/
                                    // todo2 - how about having _lp and _tp on each header also instead of _p for header and _lp, _tp for metric values ? 
                                    pCell = pCell._p;
                                    
                                    // For metrics, if we don't find a parent cell in the row headers, we should switch over to the col headers.  
                                    if (isMetricValue && !pCell && axis == ROW_AXIS) {
                                        // Update the axis. 
                                        axis = COL_AXIS;
                                          
                                        // First top parent of the metric value. note - We find that using the original cell NOT pCell. 
                                        pCell = cell._tp;
                                    }
                                }
                        }
                        break;
                }
            }
        }
        return link;
    }
        
    /**
     * Returns a comma delimited string of drill elements.
     * 
     * @param {Object} cells The interactive cells for the html table cell that initiated the drill.
     * 
     * @private
     */
    function getDrillElements(cells) {
        var titleInfo = this.getCellTitleInfo(cells[0]),
            elements = [],
            fnAddCell= function (cell) {
                if (cell) {
                    if ( mstrApp.useBinaryFormat ) {
                        elements.push(cell.axis + 'A' + (cell.ui + 1) + 'A' + cell._e.id);
                        fnAddCell(cell._p);
                    }
                    else {
                        elements.push(cell.axis + 'A' + (cell.ui + 1) + 'A' + cell.o);
                    }
                }
            };
        
        if (!titleInfo.isSrcTitle) {            
            for (var i=0, len=cells.length;i<len;i++){
                var c = cells[i];            
                // Is this a metric value?
                if (c.mix !== undefined && (c._lp || c._tp)) {
                    fnAddCell(c._lp);
                    fnAddCell(c._tp);
                } else {
                    fnAddCell(c);
                }
            }
        }
        if ( mstrApp.useBinaryFormat ) {
            return elements;
        }
        else {
            return elements.join(',');
        }
    }
    
    /**
     * <p>A model for handling Xtab interactivity.</p>
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.XtabModel = mstrmojo.declare(
        mstrmojo.Obj,
        
        null,
        
        /** 
         * @lends mstrmojo.XtabModel.prototype
         */
        {            
            scriptClass: "mstrmojo.XtabModel",
            
            getMessageId: function getMessageId() {
                return this.data.mid;
            },
            
            /**
             * Retrieves title information for a given cell node.
             * 
             * @param {Object} cell The interactive cell.
             * 
             * @returns {Object} An object with the title and a boolean (isSrcTitle) indicating if this is the src title.
             */
            getCellTitleInfo: function getCellTitleInfo(cell) {
                var gts = this.data.gts;
                
                // No ordinal => Title cell.   
                // TODO: For now its a reasonable assumption that if cell doesn't have an ordinal, its Title. Eventually, when we put support for 
                // metrics, we may need a cell type to help classify. Would be best if we can avoid adding extra properties though and infer type 
                // using the existing cell properties. 
                var title = null;
                
                // Is the cell a metric value cell? (inferred using property -> mix [metricIndex]). If not, we can use the (axis, ui) on the cell to reach the title.    
                if (cell.mix === undefined) {
                    title = getTitlesAxis(gts, cell.axis)[cell.tui || cell.ui];
                    
                } else {
                    
                    // We will need to find the Metric title. Object type is -1 for Metrics Title. 
                    var findMetricTitle = function(titles) {
                        var len = titles && titles.length || 0;
                        for (var i = len-1; i >= 0; --i) {
                            if (titles[i].otp == -1) {
                                // Found.
                                return titles[i];
                            }
                        }
                        
                        // Not found.
                        return null;
                    };
                    
                    // Search for the metrics title in column axis followed by the row axis. 
                    title = findMetricTitle(gts.col) || findMetricTitle(gts.row); 
                }
                
                return {
                    isSrcTitle: (cell.o === undefined), 
                    title: title
                };            
            },
            
            /**
             * Retrieves links information for a given data cell.  The title data can be passed in as
             * an optional argument as a performance optimization; if missing, it is looked up in the xtab data.
             */
            getCellLinksInfo: function getCellLinksInfo(cell, title) {
                if (!title) {
                    var titleInfo = this.getCellTitleInfo(cell);
                    title = titleInfo && titleInfo.title;
                }
                
                return getCellLinksContainer(cell, title);
            },

            /**
             * Retrieves drills information for a given data cell.  The title data can be passed in as
             * an optional argument as a performance optimization; if missing, it is looked up in the xtab data.
             * 
             */
            getCellDrillsInfo: function getCellDrillsInfo(cell, title) {
                if (!title) {
                    var titleInfo = this.getCellTitleInfo(cell);
                    title = titleInfo && titleInfo.title;
                }
                return getCellDrillsContainer(cell, title);
            },
			
            getLinkDrillAction: function getLinkDrillAction(cells) {
			    return this.getActionObject(cells); 	
			},
			
			getAction: function getAction(cells) {
			    return this.getActionObject(cells);
			},
            getActionObject: function getActionObject(cells) {
                var actionType = cells[0] && cells[0].at;

                // Resolve what the action should be.
                if (actionType) {
                    // Is this a hyperlink action?
                    if (actionType & HYPERLINK_ACTION) {
                        return {
                            h: 'onLink',
                            a: this.getLinkAction(cells[0])
                        };
                        
                    // Is this a drilling action?
                    } else if (actionType & DRILLING_ACTION) {
                        return {
                            h: 'onDrill',
                            a: this.getDrillAction(cells)
                        };
                    }
                }
                
                return null;
            },
            
            /**
             * Returns an object containing sorting information for the supplied cell.
             * 
             * @param {Object} cell The interactive cell for the title or metric header that is being sorted.
             * @param {Boolean} isAsc TRUE if the sort should be ascending.
             * 
             * @returns Object An object containing the action values.
             */
            getSortAction: function getSortAction(cell, isAsc) {
                var titleInfo = this.getCellTitleInfo(cell),
                    title = titleInfo.title,
                    subTotalsPos = this.data.gts[((cell.axis === ROW_AXIS) ? 'row' : 'col') + 'SubPos'],
                    elems = [],
                    unitAxis = title.axis,
                    sortType, unitID, unitType, formId;
                
                // If isAsc is not specified, toggle the current sort order.
                isAsc = (isAsc === null || isAsc === undefined) ? !(cell && cell.so) : isAsc;
                
                // Is this a title?
                if (titleInfo.isSrcTitle) {
                    sortType = ATTRIBUTE_SORT;
                    unitID = title.id;
                    unitType = title.otp;
                    formId = title.fid;
                    
                } else {
                    // Must be a metric header.
                    sortType = COLUMN_SORT;
                    unitType = 4;
                    unitAxis = ROW_AXIS;
                    
                    // Metric header uses objectID instead of elementID. We use that to find the metric header element.
                    // If the current element is an attribute header, we need to start building the elements collection from this element itself.
                    do {
                        // Get the element from the current cell. 
                        var e = cell._e;
                        
                        // Have we found a metric ? If yes, the unitID is the metric Id. 
                        if (e.oid) {
                            unitID = e.oid;
                            
                        } else {
                            // Add the current cell's element to our sort filter.
                            elems.push(e.id);
                            
                        }                
                        
                        // Next parent.  
                        cell = cell._p;
                        
                    } while (cell);
                }
                
                // Create action.
                var action = {
                    sortType: sortType,
                    axis: unitAxis, 
                    isAsc: isAsc, 
                    unitID: unitID, 
                    unitType: unitType, 
                    elementList: elems.join('\u001E'), 
                    subTotalsPos: subTotalsPos
                };
                
                // Do we have a unit ID?
                if (unitID) {
                    // Add it to action.
                    action.unitID = unitID;
                }

                // Do we have a form ID?
                if (formId) {
                    // Add it to action.
                    action.formId = formId;
                }
                
                // Build the sort key.
                var sortKey;
                if (sortType === COLUMN_SORT) {
                    sortKey = [ '', '', ((action.elementList) ? action.elementList : ''), action.axis ];
                } else {
                    sortKey = [ action.formId, '21' ];
                }
                sortKey = [ action.unitType, action.unitID ].concat(sortKey);
                action.sortKey = sortKey.join('!');
                
                // Return action.
                return action;

            },
            
            /**
             * Returns an object containing sorting information for the supplied cell.
             * 
             * @param {Object} cell The interactive cell for the title or metric header that is being pivoted.
             * @param {String} btn The ID of the pivot button that was clicked.
             * 
             * @returns Object An object containing the action values.
             */
            getPivotAction: function getPivotAction(cell, btn) {
                var isForm = false,                                // Assume it's not an attribute form.
                    isMetric = ('mix' in cell),                    // Is this a metric?
                    ax = (isMetric) ? null : cell.axis,            // Target axis
                    pos = ((isMetric) ? cell.mix : cell.ui) + 1,   // Target depth (one based).
                    isMT = (cell.otp === -1);                      // Is this the metric title?
                
                // Is this a cross axis button (to columns or to rows).
                if (!isNaN(btn)) {
                    ax = btn;           // The key of the button is the id of the target axis.
                    pos = 1;            // Move to first position of target axis.
                    
                    // Is the cell a metric header?
                    if (isMetric) {
                        isMetric = false;   // Since it's cross axis we are not pivoting a metric...
                        isMT = true;        // we are pivoting the metric title.
                    }
                    
                } else {
                    // Is the operation a decrement (button was 'up' or 'left')?
                    var dec = (btn === 'u' || btn == 'l');
    
                    // Is this NOT a metric?
                    if (!isMetric) {
                        
                        var axis = getTitlesAxis(this.data.gts, ax),        // Source axis for this pivot.
                            cnt = 0,                                        // Unit counter.
                            info = {},                                      // Info object to hold information about the contents of this axis.
                            bCur = false;                                   // Flag to indicate that we've found the current unit on the axis.
                        
                        // Create an object with information about actual position and number of forms.
                        mstrmojo.array.forEach(axis, function (u) {
                            // Have we encountered this unit yet?
                            if (u.id in info) {
                                // Yes, then update the form count.
                                info[u.id].frm++;
                                
                            } else {
                                // No, then increment the unit counter...
                                cnt++;
                                
                                // and add to the info.
                                info[u.id] = {
                                    pos: cnt,
                                    frm: 1
                                };
                                
                                // Is this the pivoted unit?
                                if (u.id === cell.id) {
                                    // Set the flag to indicate that we've found the unit.
                                    bCur = true;
                                } else if (bCur) {
                                    // We have moved beyond the pivoted unit so there is no reason to continue.  Return FALSE to stop the iteration.
                                    return false;
                                }
                            }
                            
                        });
                        
                        // Reset position to the calculated position.
                        pos = info[cell.id].pos;
    
                        // Check for an attribute form index.
                        var fix = cell.fix;
                        if (fix) {
                            
                            // Is the action NOT a decremental pivot or is this form NOT the first one for the attribute?
                            if (!dec || fix > 1) {
                                // Is the action a decremental pivot or is this NOT the last form for the attribute?
                                if (dec || fix !== info[cell.id].frm) {
                                    // Reset the position to the attribute form index.
                                    pos = fix;
                                    
                                    // Set the isForm flag to indicate that we are pivoting within the attribute.
                                    isForm = true;
                                }
                            }
                        }
                    }
                    
                    // Calculate the new position.
                    pos = pos + ((dec) ? -1 : 1);
                }
                
                // Create the action object.
                var action = {
                    pos: pos        // Target axis depth
                };
                
                // Is this a form?
                if (isForm) {
                    // Add the attribute form ID.
                    action.formID = cell.fid;
    
                } else if (!isMetric) {
                    // Add the axis for non metric and non attribute form units.
                    action.axis = ax;
                }
                
                // Is this not the metric title?
                if (!isMT) {
                    // Reset the source to the element if this is a metric.
                    var mSrc = (isMetric) ? cell._e : cell;
                    
                    // Add the object type for non forms.
                    if (!isForm) {
                        action.objectType = mSrc.otp;
                    }
                    
                    // Add the object ID.
                    action.objectId = (isMetric) ? mSrc.oid : cell.id;
                }
                
                return action;
            },
            
            /**
             * Determines if a given pivot button should be visible based on the selected cell.
             * @param {Object} c The selected cell.
             * @param {String} btn The ID of the button.
             * 
             * @type Boolean
             */
            isPvtButtonVisible: function isPvtButonVisible(c, btn) {
                var ax = c.axis,                                         // Axis value.
                    axis = getTitlesAxis(this.data.gts, ax),             // Unit axis.
                    isMetric = ('mix' in c);
                
                // Is this a cross axis button (to columns or to rows).
                if (!isNaN(btn)) {
                    // Is the target axis the same as the current axis?
                    if (parseInt(btn, 10) === ax) {
                        return false;
                    }
                    
                    // Is this a metric header?
                    if (isMetric) {
                        // True if the metrics template unit is hidden.
                        return !!axis[c.ui]._hid;
                    }
                    
                    // Must be visible.
                    return true;
                }
    
                var es = axis[c.ui].es,                           // Element collection
                    pos = c.ui,                                   // Unit depth.
                    len = (isMetric) ? es.length : axis.length;   // Length of unit axis.                        
                    
                // Is there only one unit on this axis?
                if (len === 1) {
                    // Don't need any within axis pivot buttons if there is only one unit.
                    return false;
                }
                        
                // Are cells on this axis laid out horizontally?
                if (ax === ((isMetric) ? COL_AXIS : ROW_AXIS)) {
                    // Eliminate 'up' and 'down' buttons.
                    if (btn === 'u' || btn === 'd') {
                        return false;
                    }
                } else {
                    // Otherwise, eliminate 'left' and 'right' buttons.
                    if (btn === 'l' || btn === 'r') {
                        return false;
                    }
                }
                
                // Is this the first unit on the axis?
                if (isMetric ? c._e === es[0] : pos === 0)  {
                    // Eliminate left and up buttons.
                    if (btn === 'l' || btn === 'u') {
                        return false;
                    }
                }
                    
                // Is this the last unit on the axis?
                if (isMetric ? c._e === es[len - 1] : pos === len - 1) {
                    // Eliminate right and down buttons.
                    if (btn === 'r' || btn === 'd') {
                        return false;
                    }
                }
                
                // Passed all tests so it must be visible.
                return true;
            },
            
            /**
             * Gets drill information for the Drills from the template unit supplied.
             * 
             * @param {Array} cells The interactive cells for the html table cell that initiated the drill.
             */
            getDrillAction: function getDrillAction(cells) {
                var titleInfo = this.getCellTitleInfo(cells[0]),
                    title = titleInfo.title,
                    drillPath = title.dp[cells[0].mix || 0];
                
                return {
                    srcMsgId: this.data.mid,
                    isWithin: drillPath.within,
                    drillPathKey: drillPath.k,
                    drillPathIndex: drillPath.dpi,
                    drillElements: getDrillElements.call(this, cells)
                };
            },
            
            /**
             * Returns an action object describing the link action.
             * 
             * @param {Object} cell The interactive cell for the html table cell that initiated the link.
             * @param {Integer} [idx] The index of the selected link (if omitted we will use the defined default link).
             * 
             */
            getLinkAction: function getLinkAction(cell, idx) {
                var titleInfo = this.getCellTitleInfo(cell),
                    title = titleInfo.title,
                    linksContainer = getCellLinksContainer(cell, title),    // Assume attribute links for now (no metric links).
                    linkArray = linksContainer && linksContainer.links,
                    linkTarget = (linksContainer.onw) ? '_blank' : '';
                
                // If link idx was not given, use the default link index, or if none, the first link.
                if (idx === null || idx === undefined) {
                    idx = (linksContainer && linksContainer.di);    // di => default (link) index.
                }
                
                // Do we have a link info?
                var linkInfo = linkArray && linkArray[idx];           
                if (!linkInfo) {
                    // None, so return null action object.
                    return null;
                }
                
                // Create action.
                var action = {
                    linkInfo: linkInfo,
                    linkTarget: linkTarget
                };
                
                // Does the link info contain a url?
                var url = linkInfo.url;
                if (url) {
                    // Replace current element with the element id for the cell that was selected.
                    var currentElement = '&CurrentElement';
                    if (cell && title && url.indexOf(currentElement) > -1) {
                        url = url.replace(currentElement, cell._e.id);
                    }

                    // Add url.
                    action.url = url;

                } else {
                    
                    var target = linkInfo.target,
                        evt, idField;
                    
                    // What type is the target?
                    switch (parseInt(target && target.t, 10)) {
                        case 55:                // DSSTYPE_DOC_DEFINITION
                            // Execute a doc.
                            if (parseInt(target.st, 10) === 14081) { //  DSSSUB_TYPE_RW
                                // Execute an RW document
                                evt = 2048001;   // RUN_RW_DOCUMENT
                                idField = 'objectID';

                            } else {
                                // Execute an HTML document.
                                evt = 32001;   // RUN_DOCUMENT
                                idField = 'documentID';
                            }
                            break;
                            
                        case 3:                 // DSSTYPE_RPT_DEFINITION
                            // Execute a report.
                            evt = 4001;         // RUN_REPORT
                            idField = 'reportID';
                            
                            // subtype 301 (EnumDssXmlObjectSubTypes) => Graph view mode (EnumWebViewModes) otherwise Grid mode.  
                            action.reportViewMode = ((target.st == 0x301) ? 2 : 1);
                            break;
                            
                        default: 
                            // Unhandled.
                            return null;
                    }
                    
                    // Update action.
                    action.evt = evt;
                    action[idField] = target.did;
                    action.srcMsgId = this.getMessageId();
                    
                    // Add answers xml.
                    var link = buildLink.call(this, linksContainer, linkInfo, cell);
                    if (link) {
                        action.link = link;
                    }
                    //var answerXML = buildLinkXml.call(this, linksContainer, linkInfo, cell);
                    //if (answerXML) {
                    //    action.linkAnswers = answerXML;
                    //}
                    
                    return action;
                }
            },
            
            getDownloadAction: function getDownloadAction(/* Integer */ rowPosition, /* Integer */ maxRows,  /* Integer */ colPosition, /* Integer */ maxCols, /* String */ widgetID, /* Object */ memo) {
                return {
                    xtabId: widgetID,
                    rowPosition: rowPosition,
                    maxRows: maxRows,
                    colPosition: colPosition,
                    maxColumns: maxCols,
                    memo: memo
                };
            }
        }
    );
})();
