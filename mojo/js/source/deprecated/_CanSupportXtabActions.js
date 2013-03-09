/*global mstrmojo:false, window:false */

(function(){

    mstrmojo.requiresCls(
        "mstrmojo.form",
        "mstrmojo.hash",
        "mstrmojo.string",
        "mstrmojo.array");

    var ROW_AXIS = 1;
    var COL_AXIS = 2;
    var DRILLING_ACTION = 1;
    var SELECTOR_ACTION = 2;
    var HYPERLINK_ACTION = 4;
    var SORT_ACTION = 8;
    var KEY_ALL = "OA:(All)";
    
    var ATTRIBUTE_SORT = 2;
    var COLUMN_SORT = 4;

    var SORT_ELEM_SEP = "\u001E";
    var DRILL_ELEM_SEP = ",";
    
    // Hyperlink Drill Constants
    var SAME_PROMPT = 1;
    var DO_NOT_ANSWER = 2;
    var CLOSE = 3;
    var DYNAMIC = 4;
    var STATIC = 5;
    var CURRENT_UNIT = 6;
    var ALL_VALID_UNITS = 7;
    var USE_DEFAULT_ANSWER = 8;
    
    var MX = 'Metrics';
    
    var CONSTANT_PROMPT_TYPE = 1;
    var ATTRIBUTE_TYPE = 12;
    
    /**
     * Helper function to retrieve the axis from the grid titles collection.
     * 
     * @param {Object} gts The grid titles collection.
     * @param {Integer} ax The axis to retrieve (1 = rows, 2 = columns).
     * 
     * @returns Object[]
     */
    function getTitlesAxis(gts, ax) {
        return gts[((ax === ROW_AXIS) ? 'row' : 'col')];
    }

    function _cellLinksContainer(/* GridData#Cell */ cell, /* GridData#Title */ title) {
        var linkMap = title.lm;
        // if the cell has a metric index (for metric values), we need to look at the linksContainer at the corresponding index under the title. 
        return linkMap && linkMap[cell.mix || 0];
    }
    
    function _cellDrillsContainer(/* GridData#Cell */ cell, /* GridData#Title */ title) {
        var drillList = title.dp;
        return drillList && drillList[cell.mix || 0];
    }
    
    function _execUrlLink(/* DocModel */ model, /* GridData#GridTitles */ gts, /* LinksContainerJSON */ linksContainer, /* LinkJSON */ linkInfo,  /* GridData#Title */ title, /* GridData#Cell */cell) {
        // Needs to do it as a form, it might have too many parameters to send...
        var oForm = null, 
                url = linkInfo.url;
        if (url.indexOf("&CurrentElement")>-1 && cell && title) {
            var eid = cell._e.id;
            url = linkInfo.url.replace("&CurrentElement", eid);
        }
        oForm = mstrmojo.form.createDynamicForm(url);
        if (linksContainer.onw) {
            oForm.target = "_blank";
        }
        oForm.submit();
    }
    
    function _submitLinkXml(/*LinkInfoJSON*/ linkInfo, /*String?*/ answerXml, /*Boolean*/ newWin, /* DocModel */ model) {
        var target = linkInfo.target,
            tp = target && target.t,
            params,
            oid = target.did;
        
        switch (parseInt(tp,10))
        {
            case 55:    // DSSTYPE_DOC_DEFINITION
                // Execute a doc.
                if (parseInt(target.st,10) === 14081){ //  DSSSUB_TYPE_RW
                    // Execute an RW document
                    params = {
                        evt: 2048001,   // RUN_RW_DOCUMENT
                        objectID: oid
                    };
                } else {
                    // Execute an HTML document.
                    params = {
                        evt: 32001, // RUN_DOCUMENT
                        documentID: oid
                    };
                }
                break;
                
            case 3: // DSSTYPE_RPT_DEFINITION
                // Execute a report.
                params = {
                    evt: 4001,  // RUN_REPORT
                    reportID: oid,
                    // subtype 301 (EnumDssXmlObjectSubTypes) => Graph view mode (EnumWebViewModes) otherwise Grid mode.  
                    reportViewMode: target.st == 0x301 ? 2 : 1
                };
        }
        
        if (params) {
            if (answerXml) {
                params.linkAnswers = answerXml;
            }
            model.linkDrill(params, linkInfo, newWin);  
        }
    }

    function _buildLinkXml(/* DocModel */ model, /* GridData#GridTitles */ gts, /* LinksContainerJSON */ linksContainer, /* LinkJSON */ linkInfo,  /* GridData#Cell */cell, /*Widget*/ w) {
        //add xml attribute
          var axa = function(name, value) { 
              return " " + name + '="' + value + '"';
          };
          var axae = function(name, value) {
              return axa(name, mstrmojo.string.encodeXMLAttribute(value));
          };

          // start the link XML. 
          var xml = "<hl" + axa("mid", model.mid) + axa("srct", 2) + axa("aopam", linkInfo.daMode) + ">";    // SourceType -> 2 -> RWD Execution.
          
          // get the answers info. 
          var answers = linkInfo.ans,
              i, cnt;
          
          if (answers) {
              // prompts. 
              xml += "<prms>";
      
              for (i = 0, cnt = answers.length; i < cnt; i++){
                  var answer = answers[i];
                  // prompt ID, answermode, prompt type.
                  var pid = answer.pid,
                      am = answer.m,
                      pt = answer.pt,
                        bfid = answer.bfid;
                  // add the prompt info to the xml. 
                  xml += "<prm" + axa("id", pid) + axa("am", am);
                  
                  // is the prompt origin passed. If yes, add that to the XML too. 
                  if ( answer.po ) {
                      xml += axa("orid", answer.po.did) + axa("ortp", answer.po.t);
                    //for value prompts
                      if(am === DYNAMIC && pt === CONSTANT_PROMPT_TYPE &&answer.po.t === ATTRIBUTE_TYPE && bfid){
                          xml += axa("pt", pt) + axa("bfid",bfid);
                      }
                  }
                  
                  
                  xml +=">";
      
                  // Switch case based on answer mode value...
                  switch (am) {
                      case DO_NOT_ANSWER:
                      case CLOSE:
                      case USE_DEFAULT_ANSWER:
                      case SAME_PROMPT:
                          break;
                      case STATIC:
                          var statElems = answer.es,
                                  len = statElems && statElems.length || 0;

                          xml += "<pa ia='1'><es>";
                          for(i = len - 1; i >= 0; --i) {
                              var statElem = statElems[i];
                              xml+= "<e" + axa("ei", statElem.id) + axa("disp_n", statElem.n) + axa("emt", "1")  + "/>";
                          }
                          xml += "</es></pa>";
                          break;
                      case DYNAMIC:
                      case ALL_VALID_UNITS:
                      case CURRENT_UNIT:
                          //Sample xmls
                          //1-Answer Element Prompt Dynamically
                          //paxml_arr[0] = '<pa ia="1">'
                          //paxml_arr[1] = '<es dispForms="">'
                          //paxml_arr[2] = '<e ei="h1;8D679D3711D3E4981000E787EC6DE8A4;Books" emt="1" disp_n="Books"/>'
                          //              +'<e ei="h2;8D679D3711D3E4981000E787EC6DE8A4;Electronics" emt="1" disp_n="Electronics"/>'
                          //              +'<e ...
                          //paxml_arr[3] = '</es>'
                          //paxml_arr[4] = '</pa>'
                          
                          //2-Answer a Value Prompt Dynamically
                          //paxml_arr[0] = '<pa ia ='1'>'
                          //paxml_arr[1] = 'encoded form value'
                          //paxml_arr[2] = paxml_arr[3] = '';
                          //paxml_arr[4] = </pa>
                          
                          
                          //3-Answer Hierarchy Prompt Using Current Unit
                          //paxml_arr[0] = '<pa ia="1">'
                          //paxml_arr[1] = '<a id="8D679D5111D3E4981000E787EC6DE8A4" n="Year"><es dispForms="">'
                          //paxml_arr[2] = '<e ei="h2007;8D679D5111D3E4981000E787EC6DE8A4;1/1/2007" emt="1" disp_n="1/1/2007"/>
                          //              +'<e ei="h2008;8D679D5111D3E4981000E787EC6DE8A4;1/1/2008" emt="1" disp_n="1/1/2008"/>'
                          //              +'<e ...
                          //paxml_arr[3] = '</es></a>'
                          //paxml_arr[4] = '</pa>'
                          
                          //4-Answer Hierarchy Prompt Using All Valid Units
                          //paxml_arr[0] = '<pa ia="1"><attGroups>'
                          //paxml_arr[1] = ''
                          //paxml_arr[2] = '<attGroup>'
                          //                  + '<a id="8D679D5111D3E4981000E787EC6DE8A4" n="Year"><es dispForms="">'
                          //                    + '<e ei="h2007;8D679D5111D3E4981000E787EC6DE8A4;1/1/2007" emt="1" disp_n="1/1/2007"/>'
                          //                + '</es></a>'
                          //                + '<a id="8D679D4B11D3E4981000E787EC6DE8A4" n="Region ID"><es dispForms="">'
                          //                    + '<e ei="h4;8D679D4B11D3E4981000E787EC6DE8A4;4" emt="1" disp_n="4"/>'
                          //                + '</es></a>'
                          //              +'</attGroup>'
                          //              + <attGroup ...
                          //paxml_arr[3] = ''
                          //paxml_arr[4] = '</attGroups></pa>'
                          var dynUnits = answer.dunits;       // dynamic units.
                          // for all valid units case, we need to consider selected cells under other titles as well
                              
                          var cells = (pt===CONSTANT_PROMPT_TYPE) ? [cell] : _getActionTargetCells(cell, am!=ALL_VALID_UNITS, w);
                          
                          if (dynUnits && dynUnits.length && cells) {
                              // use a string array to build up the xml
                              var paxml_arr = [];
                              paxml_arr[0] = "<pa ia='1'>";
                              if (am==ALL_VALID_UNITS){
                                  paxml_arr[0] += "<attGroups>";
                              }
                              for (var j=0, len=cells.length;j<len;j++){
                                  var cell = cells[j];
                                  // we want to traverse the current cell and its parent to pick up the dynamic ancestors of dynamic units configured.
                                  var pCell = cell,
                                     // is the link originated from a metric value ? If it is, it would have a metric index (metric headers would have that too !) AND it would have left and top parents. 
                                     isMetricValue = (cell.mix !== undefined) && (cell._lp || cell._tp);
                                  
                                  // for metric value, we will first start looking at the parent row headers, then the col headers. 
                                  if(isMetricValue) {
                                      // start with the row headers (leftParent), then the row headers. 
                                      // if there's no left parent, we start with the top parent itself.  
                                      pCell = cell._lp || cell._tp;
                                  }
                                  
                                  var axis = pCell.axis;
                                  
                                  paxml_arr[2] = paxml_arr[2] || "";
                                  paxml_arr[2] += (am==ALL_VALID_UNITS)?"<attGroup>":"";
                                          
                                  while(pCell) {
                                      //update parent title.
                                      var pTitle = getTitlesAxis(gts, axis)[pCell.tui];
                                      if(am === DYNAMIC && pt === CONSTANT_PROMPT_TYPE && answer.po && answer.po.did && bfid){
                                          var tfid = pTitle && pTitle.fs && pTitle.fs[pCell.fi] && pTitle.fs[pCell.fi].id;
                                          if(pTitle && pTitle.id === answer.po.did &&  tfid=== bfid){
                                              paxml_arr[1] = mstrmojo.string.encodeXMLAttribute((pCell._e && pCell._e.n) || pCell.v);
                                              paxml_arr[2] = '';
                                              paxml_arr[3] = '';
                                              paxml_arr[4] = '</pa>';
                                              break;
                                          }
                                      }
                                      
                                      // is the title in the dynamic units collection.
                                      if(pTitle && mstrmojo.array.find(dynUnits, 'id', pTitle.id) >= 0) {                                     
                                          // ID of the current cell.  
                                          var eid = pCell._e.id,
                                              dsn = pCell._e.n, // display name
                                              dfi = pTitle.dfi;
                                              axml1 = (am != DYNAMIC)?"<a" + axa("id", pTitle.id) + axae("n", pTitle.n) + ">":"";
                                              axml2 = (am != DYNAMIC)?"</a>":"";
                                              esxml1 = "<es" + axa("dispForms", dfi >=0 ? dfi : "") + ">";
                                              esxml2 = "</es>";
                                              exml = "<e" + axae("ei", eid) + axa("emt", "1") + (dsn ? axa("disp_n", dsn) : "") + "/>";
                                          
                                          if (paxml_arr[1] === undefined){
                                              if (am != ALL_VALID_UNITS){
                                                  paxml_arr[1] = axml1 + esxml1;
                                                  paxml_arr[3] = esxml2 + axml2;
                                              }else{
                                                  paxml_arr[1] = paxml_arr[3] = "";
                                              }
                                          }
                                          if (am == ALL_VALID_UNITS){
                                              paxml_arr[2] += axml1 + esxml1 + exml + esxml2 + axml2;
                                          }else{
                                              paxml_arr[2] += exml;
                                          }
                                          
                                          if ( am ==CURRENT_UNIT ) {
                                              break;
                                          }
                                      }
                                      // next parent. cell/
                                      // todo2 - how about having _lp and _tp on each header also instead of _p for header and _lp, _tp for metric values ? 
                                      pCell = pCell._p;
                                      
                                      // for metrics, if we don't find a parent cell in the row headers, we should switch over to the col headers.  
                                      if(isMetricValue && !pCell && axis == ROW_AXIS) {
                                          // update the axis. 
                                          axis = COL_AXIS;
                                          
                                          // first top parent of the metric value. note - We find that using the original cell NOT pCell. 
                                          pCell = cell._tp;
                                      }
                                  }
                                  paxml_arr[2] += (am==ALL_VALID_UNITS)?"</attGroup>":"";
                              }
                              paxml_arr[4] = (am==ALL_VALID_UNITS)?"</attGroups>":"";
                              paxml_arr[4] += "</pa>";
                              xml += paxml_arr.join("");
                          }
                          break;
                  }
                  xml += "</prm>";
              }
              xml += "</prms>";
          }
          xml += "</hl>";
          return xml;
    }    

    function _execDynamicLink(/* GridData#GridTitles */ gts, /* LinksContainerJSON */ linksContainer, /* LinkJSON */ linkInfo,  /*GridData#Cells*/cell, /* DocModel */ model, /*Widget*/ w) {
        _submitLinkXml(
            linkInfo, 
            _buildLinkXml(model, gts, linksContainer, linkInfo, cell, w), 
            linksContainer.onw,
            model);
    }
    
    function _handleLink(/* DocModel */ model, /* GridData#GridTitles */ gts, /* GridData#Title */ title, /*GridData#Cell */ cell, /*Integer?*/ idx, /*Widget*/ w) {
        // assume attribute links for now (no metric links). 
        var linksContainer = _cellLinksContainer(cell, title),
                linkArray = linksContainer && linksContainer.links;
        // If link idx was not given, use the default link index, or if none, the first link.
        if (idx === null || idx === undefined) {
            idx = (linksContainer && linksContainer.di);    // di => default (link) index.
        }
        var linkInfo = linkArray && linkArray[idx];           
    
        if (!linkInfo) {
            return;
        }

        (!!linkInfo.url ? _execUrlLink :_execDynamicLink)(gts, linksContainer, linkInfo, cell, model, w);
    }

    function _handleSort(/* DocModel */ model, /* Integer */ treeType, /* String */ nodeKey, /* GridData#GridTitles */ gts, /* GridData#Title */ title, /* GridData#Cell */cell, /* Boolean */isSrcTitle, /* Integer */ subPos, /*Boolean?*/ asc) {
        // Create sort config object.
        var cfg = {
            axis: title.axis,
            treeType: treeType,
            isAsc: (asc === null || asc === undefined) ? !(cell && cell.so) : asc,  // if not specified, toggle the current sort order
            subTotalsPos: subPos
        };
        
        // Is this a title cell?
        if (isSrcTitle) {    // ATTRIBUTE SORTING.........................................
            // Modify sort config for attribute sort.
            mstrmojo.hash.copy({
                sortType: ATTRIBUTE_SORT,
                unitID: title.id,
                unitType: title.otp,
                formID: title.fid
            }, cfg);
            
        } else { // COLUMN SORTING.........................................
            // note col sorting can be initiated from attribute headers too -> e.g. Rows(Region), Cols(Metrics, Country) - in this case Country should
            // show the column sort option (OOTB does it that way!). The end result is still a sort on the metric though. So, first thing is to find the 
            // metric.
            
            // Metric header uses objectID instead of elementID. We use that to find the metric header element.
            var mID = "", 
                elems = [];
            
            // if the current element is an attribute header, we need to start building the elements collection from this element itself.
            do {
                // get the element from the current cell. 
                var e = cell._e;
                
                // have we found a metric ? If yes, we cache the metric ID. 
                if(e.oid) {
                    mID = e.oid; 
                } else {
                    // else add the current cell's element to our sort filter.   
                    elems.push(e.id);
                }                
                
                // next parent.  
                cell = cell._p;
            } while(cell);

            // Modify sort config for metric sort.
            mstrmojo.hash.copy({
                // sorting on metrics should effect the Row Axis. Hence force a value of 1 TODO0 - .->  Inferred this by observing manipulations. Need to confirm !  
                axis: ROW_AXIS,
                sortType: COLUMN_SORT,
                unitID: mID,
                unitType: 4,
                elementList: elems.join(SORT_ELEM_SEP)
            }, cfg);
        }
        
        // Ready to Sort !
        model.sort(nodeKey, cfg);
    }

    function _handleSelector(/* DocModel */ model, /* GridData#Title */ title, /* GridData#Cell */cell, /* Boolean */isSrcTitle, /* Map */scm, sid) {
        var id = title && title.id;
        var sc = id ? scm[id] : scm[MX],
            ps = mstrmojo.dom.position(cell.domNode, true);

        if (sc) {
            // Ready to Slice !
            model.slice({
                type: mstrmojo.EnumRWUnitType.GRID,
                sPos: ps,
                ck: sc.ck,
                ctlKey: sc.ckey,
                tks: sc.tks,
                sid: sid,
                eid: (isSrcTitle) ? KEY_ALL : cell._e.id
            });
        }        
    }
    
    function _handleDrill(/* DocModel */ model, /* String */ nodeKey, /* GridData#Title */ title, /* Array of GridData#Cell */cells, /* Boolean */isSrcTitle, /* Integer */ slc, /*Widget*/src) {
        // do we have drilling information setup up on the title ? 
          var dp = title && title.dp[(cells && cells[0] && cells[0].mix) || 0],
          k = dp && dp.k,
          isWithin = dp && dp.within,
          elems = "";
          
          var addCell = function(/* Array */ ar, /* CellJSON */ cell) {
              if (cell) {
                  ar.push(cell.axis + 'A' + (cell.ui + 1)  + 'A' + cell.o);
              }
          };
          
          // if src is a title, we have the elems collection built fine. 
          if(!isSrcTitle) {
              var elemCells = [];
              
              for (var i=0, len=cells.length;i<len;i++){
                  var cell = cells[i];
                  var isMetricValue = (cell.mix !== undefined) && (cell._lp || cell._tp);
                  
                  // if the src is a metric cell, we need to compute the closest row and col headers. 
                  if(isMetricValue) {
                      addCell(elemCells, cell._lp);
                      addCell(elemCells, cell._tp);
                  } else {
                      addCell(elemCells, cell);
                  }
              }
              // generate the final user filter string. 
              elems = elemCells.join(DRILL_ELEM_SEP);
          } 

          // Ready to Drill !
          model.drill(nodeKey, k, isWithin, elems, slc, src);
    }

    function _nodeCheck(/*Widget*/ w, /*DomNode|Object*/ node) {
        return (node && node.constructor == Object) ? node : node && w.getCellForNode(node);
    }
    
    // Returns an array that contains the cells which the action would be performed on.
    // sameTitleOnly: whether only return cells that belong to the same title
    function _getActionTargetCells(/*Object*/ cell, /*Boolean*/ sameTitleOnly, /*Widget*/ w){
                var cells = [];  
        
        var titleId = w.getCellTitleId(cell),
            idx = w.getCellUnitIndex(cell),
            selTitle = w.selections[titleId];
        //If the cell is selected, we need to add other selected cells
        if (selTitle && selTitle[idx]){
            if (sameTitleOnly){
	                for (var i in selTitle){
                    var sc = _nodeCheck(w, selTitle[i][0]); //In multiple form case, we only need to add it once
		                cells.push(sc);
	                }
	            }else{
                for (var id in w.selections){
                    for (var i in w.selections[id]){
                        cells.push(_nodeCheck(w, w.selections[id][i][0]));
                    }
                }
            }
        }else{
	            	cells.push(cell);
	            }
                return cells;
    };
    
    /**
     * This mixin is intended to be inherited by Xtab Widget. Its purpose is to mix in interactivity to the Widget. 
     */
    mstrmojo._CanSupportXtabActions = 
    {
        /**
         * Performs a drill action on the given cell. The cell may be either an HTML table cell,
         * or the cell JSON data that corresponds to an HTML table cell.
         */
        drill: function drill(/*DomNode|Object*/ node) {
            return this._doAction(node, DRILLING_ACTION);    
        },
        
        /**
         * Selector control map is a map uses element id as the key and the selector control object as its value
         */
        scm: null,
        
        /**
         * Title ID for the column that contains the selected cell   
         */
        sti: null,
        
        /**
         * Performs a hyperlink action on the given cell. The cell may be either an HTML table cell,
         * or the cell JSON data that corresponds to an HTML table cell. The index of the hyperlink
         * can be specified if multiple hyperlinks are configured for the cell.
         */
        link: function link(/*DomNode|Object*/ node, /*Integer?*/ idx) {
            return this._doAction(node, HYPERLINK_ACTION, {
                idx: idx
            });
        },
        
        /**
         * Performs a sort action on the given cell. The cell may be either an HTML table cell,
         * or the cell JSON data that corresponds to an HTML table cell. The order of the sort
         * is specified as a boolean (true = ascending, false = descending).
         */
        sort: function sort(/*DomNode|Object*/ node, /*Boolean*/ so) {
            return this._doAction(node, SORT_ACTION, {
                so: so
            });
        },

        /**
         * Performs the default action (if any) on the given cell.     The cell may be either an HTML table cell,
         * or the cell JSON data that corresponds to an HTML table cell.
         */        
        defaultAction: function defAct(/*DomNodeObject*/ node) {
            // What actions (if any) are defined for this cell?
            var cell = _nodeCheck(this, node),
                at = cell && cell.at;
            if (at) {
                // Choose a default action.
                // Click rule - selector followed by link followed by drilling followed by sort.
                var defAction = (at & SELECTOR_ACTION) ||
                (at & HYPERLINK_ACTION) ||
                (at & DRILLING_ACTION) || 0;
                // TQMS: 394305 disable the default sort actions on the titles
                //(at & SORT_ACTION) || 0;

                this._doAction(cell, defAction);
            }
        },
        
        _doAction: function doAct(/*DomNode*/ node, /*Integer*/ action, /*Object?*/ config) {
            if (!action) {
                return;
            }

            var cell = _nodeCheck(this, node);

            if (cell) {
                var m = this.model,
                    tInf = this.getCellTitleInfo(cell),
                    t = tInf && tInf.title,
                    gts = this.gridData.gts;

                switch(action) {
                    case SELECTOR_ACTION:
                        //set selected title id for hilighting cells
                        this.sti = (t && t.id) || MX;
                        return _handleSelector(m, t, cell, tInf.isSrcTitle, this.scm, this.gridData.wid);
                    case HYPERLINK_ACTION:
                        return _handleLink(m, gts, t, cell, config && config.idx, this);
                    case DRILLING_ACTION:
                        return _handleDrill(m, this.k, t, _getActionTargetCells(cell, true, this), tInf.isSrcTitle, this.gridData.sid, this);
                    case SORT_ACTION:
                        return _handleSort(m, this.treeType, this.k, gts, t, cell, tInf.isSrcTitle, gts[((cell.axis === ROW_AXIS) ? 'row' : 'col') + 'SubPos'], config && config.so);
                }
            }
            return null;
        },
        
        /**
         * Returns the interactivity data (if any) for a given HTML table cell DOM node. 
         */
        getCellForNode: function cll4Node(/*TableCellDomNode*/ td) {
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
         * Retrieves title information for a given data cell.
         */
        getCellTitleInfo: function cllTtlInf(/*Object*/ cell) {
            var gd = cell._gd || this.gridData,
                gts = gd.gts;
            
            // no ordinal => Title cell.   
            // @todo - for now its a reasonable assumption that if cell doesn't have an ordinal, its Title. Eventually, when we put support for metrics, we may need a cell type to help classify. Would be best
            // if we can avoid adding extra properties though and infer type using the existing cell properties. 
            var isSrcTitle = (cell.o === undefined),
                    title = null;
            
            // is the cell a metric value cell ? inferred using property -> mix (metricIndex). If not, we can use the (axis, ui) on the cell to reach the title.    
            if (cell.mix === undefined) {
                title = getTitlesAxis(gts, cell.axis)[cell.tui || cell.ui];
            } else {
                // we will need to find the Metric title. Object type is -1 for Metrics Title. 
                var findMetricTitle = function(titles) {
                    var len = titles && titles.length || 0;
                    for(var i=len-1;i>=0;--i) {
                        if(titles[i].otp == -1) {
                            return titles[i];
                        }
                    }
                    return null;
                };
                
                // search for the metrics title in column axis followed by the row axis. 
                title = findMetricTitle(gts.col) || findMetricTitle(gts.row); 
            }
            return {isSrcTitle: isSrcTitle, title: title};            
        },
        
        /**
         * Retrieves links information for a given data cell.  The title data can be passed in as
         * an optional argument as a performance optimization; if missing, it is looked up in the xtab data.
         */
        getCellLinksInfo: function cllLnksInf(/*Object*/ cell, /*Object?*/ title) {
        
            if (!title) {
                var tinf = this.getCellTitleInfo(cell);
                title = tinf && tinf.title;
            }
            return _cellLinksContainer(cell, title);
        },

        /**
         * Retrieves drills information for a given data cell.  The title data can be passed in as
         * an optional argument as a performance optimization; if missing, it is looked up in the xtab data.
         */
        getCellDrillsInfo: function cllDrlsInf(/*Object*/ cell, /*Object?*/ title) {
        
            if (!title) {
                var tinf = this.getCellTitleInfo(cell);
                title = tinf && tinf.title;
            }
            return _cellDrillsContainer(cell, title);
        },
        
        
        /**
         * Determines if a given pivot button should be visible based on the selected cell.
         * @param {Object} c The selected cell.
         * @param {String} btn The ID of the button.
         * 
         * @type Boolean
         */
        isPvtButtonVisible: function isPvtButonVisible(c, btn) {
            var ax = c.axis,                                             // Axis value.
                axis = getTitlesAxis(this.gridData.gts, ax),             // Unit axis.
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
         * Pivots (or removes) a single unit on the template.
         * 
         * @param {Object} src The title or metric header that is being pivoted.
         * @param {String} btn The ID of the pivot button that was clicked.
         */
        pivot: function pivot (src, btn) {
            var isForm = false,                               // Assume it's not an attribute form.
                isMetric = ('mix' in src),                    // Is this a metric?
                ax = (isMetric) ? null : src.axis,            // Target axis
                pos = ((isMetric) ? src.mix : src.ui) + 1,    // Target depth (one based).
                isMT = (src.otp === -1);                      // Is this the metric title?
            
            // Is this a cross axis button (to columns or to rows).
            if (!isNaN(btn)) {
                ax = btn;           // The key of the button is the id of the target axis.
                pos = 1;            // Move to first position of target axis.
                
                // Is the src a metric header?
                if (isMetric) {
                    isMetric = false;   // Since it's cross axis we are not pivoting a metric...
                    isMT = true;        // we are pivoting the metric title.
                }
                
            } else {
                // Is the operation a decrement (button was 'up' or 'left')?
                var dec = (btn === 'u' || btn == 'l');

                // Is this NOT a metric?
                if (!isMetric) {
                    
                    var axis = getTitlesAxis(this.gridData.gts, ax),    // Source axis for this pivot.
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
                            if (u.id === src.id) {
                                // Set the flag to indicate that we've found the unit.
                                bCur = true;
                            } else if (bCur) {
                                // We have moved beyond the pivoted unit so there is no reason to continue.  Return FALSE to stop the iteration.
                                return false;
                            }
                        }
                        
                    });
                    
                    // Reset position to the calculated position.
                    pos = info[src.id].pos;

                    // Check for an attribute form index.
                    var fix = src.fix;
                    if (fix) {
                        
                        // Is the action NOT a decremental pivot or is this form NOT the first one for the attribute?
                        if (!dec || fix > 1) {
                            // Is the action a decremental pivot or is this NOT the last form for the attribute?
                            if (dec || fix !== info[src.id].frm) {
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
            
            // Create the xhr parameters.
            var p = {
                taskId: (isForm) ? 'docPivotForm' : 'docPivot',
                key: this.k,    // Unit key
                pos: pos        // Target axis depth
            };
            
            // Is this a form?
            if (isForm) {
                // Add the attribute form ID.
                p.formID = src.fid;

            } else if (!isMetric) {
                // Add the axis for non metric and non attribute form units.
                p.axis = ax;
            }
            
            // Is this not the metric title?
            if (!isMT) {
                // Reset the source to the element if this is a metric.
                var mSrc = (isMetric) ? src._e : src;
                
                // Add the object type for non forms.
                if (!isForm) {
                    p.objectType = mSrc.otp;
                }
                
                // Add the object ID.
                p.objectId = (isMetric) ? mSrc.oid : src.id;
            }
            
            // Ask the model to perform pivot.
            this.model.pivot(this.k, p);
        }

    };
})();
