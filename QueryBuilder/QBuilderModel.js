(function(){

    mstrmojo.requiresCls(
    	"mstrmojo.WH.WHModel"
    );
    
    var _S = mstrmojo.string,
        _H = mstrmojo.hash,
        _A = mstrmojo.array;
   
    
    var _DEFAULT_TEMPLATE_ID ='904DFFFA4205D42857A0F981ACA92D80';
    
	 var _twipPerPixel = 15;

	var _waitBox = new mstrmojo.Editor({
		cssClass: "mstrmojo-Architect-WaitBox",
		draggable: false,
		showTitle: false,
		zIndex: 99999,
		// We use this var to control the close of waitpage. If there is still other proccess waiting, _hideWaitPage will not close the waitpage.
		counter:0,
		children: [{
			scriptClass:"mstrmojo.Box",
			width:"300px",
			height:"60px",
		    cssClass: "mstrmojo-Architect-Wait"
		       }],
		onRender: function (evt) {
		  if (this.curtainNode) {
 		        var st= this.curtainNode.style;
	                st.background="black";
	                st.opacity=0.5; 
	                st.filter="alpha(opacity=50)"; //for IE 8
 		    	    st.cursor = "progress";   //set cursor shape on the curtain	
 		    }		
   	    }
    });
    
  
    function _showWaitPage() {
    	if (!_waitBox.visible) {
    	    _waitBox.open();
    	}    
    	_waitBox.counter++;
    };
    
    function _hideWaitPage() {
    	_waitBox.counter--;
    	if (_waitBox.counter===0&&_waitBox.visible) {
    	    _waitBox.close();
    	}
    };
    
	
    function _sortFunctions(fcts){
        //sort the function categories and the functions under each category
        var fs = function(a, b){
                return mstrmojo.array.stringSorter(a.n, b.n);
            },
            i, len;
        
        fcts = fcts.sort(fs);
        
        for(i=0, len=fcts.length;i<len;i++){
            fcts[i].fns = fcts[i].fns.sort(fs);
        } 
        return fcts;
    };
    
    function _removeConds(w, r){
 		if(!w.ctxtBuilder&&w.data){
			var i=w.data.wid.indexOf(r.id);
			if(i>-1) {
				mstrmojo.array.removeIndices(w.data.wid,i,1);
				w.del();
				return true
			}
			else return false;
		}
		else{
		  var ws=w.ctxtBuilder.itemWidgets;
		  if(ws.length==0) return false;
		  for(var k=0, len=ws.length;k<len;k++)
			{
			   w=_removeConds(ws[k],r);
		       if(w) return w;}
		  return false;
		}

	};
	
	   function _updatefilterws(w, fws){
	 		if(!w.ctxtBuilder&&w.data){
				var ws=w.data.wid,
				    len=ws?ws.length:0;
				if(ws&&len>0) {
					for(var i=0; i<len; i++){
						if(!fws[ws[i]])
							fws[ws[i]]=true;
					}
				}
				return null;
			}
			else{
			  var ws=w.ctxtBuilder.itemWidgets;
			  if(ws.length==0) return false;
			  for(var k=0, len=ws.length;k<len;k++)
				{
				   w=_updatefilterws(ws[k],fws);
			      }
			}

		};

	function _rmescp(s){
		return s.replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;apos;/g,'"').replace(/&apos;/g,"'").replace(/^\n+|\n+$/g, '').replace(/\t/g, ' ');
	}
	
    var _typeOf = function (v) {
        if (v == null) {
            return 'null';
        }
        var t = typeof(v);
        if (t != 'object') {
            return t;
        } else {
            if (v.length === undefined) {
                return 'object';
            } else {
                return 'array';
            }
        }
    };

    var _formats=[
	      {n: 'Text', v: '3'},
	      {n: 'Number', v: '2'},
	      {n: 'Date', v: '8'},
	      {n: 'Time', v: '9'},
	      {n: 'DateTime', v: '1'},
	      {n: 'URL', v: '5'},
	      {n: 'Email', v: '6'},
	      {n: 'HTML Tag', v: '7'},
	      {n: 'Symbol', v: '10'},
	      {n: 'Big Decimal', v: '11'},
	      {n: 'Phone Number', v: '12'}
     ];
    
    var _sqlc=[
              {n: 'select', sta: 100, t:100},
      	      {n: 'distinct', sta: 100, t:100},
      	      {n: 'from', sta: 100, t:100},
      	      {n: 'where',sta: 100, t:100},
      	      {n: 'having',sta: 100, t:100},
      	      {n: 'in', sta: 100, t:100},
      	      {n: 'not in',sta: 100, t:100},
      	      {n: 'and', sta: 100, t:100},
      	      {n: 'group by', sta: 100, t:100},
      	      {n: 'order by', sta: 100, t:100},
      	      {n: 'create table',sta: 100, t:100},
      	      {n: 'as', sta: 100, t:100},
      	      {n: 'rownum',sta: 100, t:100}
           ];
    
    /**
     * construct the raw definition of the dbtable
     * 
     * @param {t}  the table.
     * @param {cls} columns array.
     * 
     * @private
     */
    function _getTableRawDef(t, cls) {
        var def ='', coldef ='', col;
        for (var i=0, len = cls.length; i<len; i++) {
    	    col = cls[i]
        	coldef = '<cli cln="' + col.cln + '"><dt ps="' + col.dtps + '" sc="' + 
        	             col.dtsc + '" tp="' + col.dttp + '"/></cli>';          
        	def += coldef;
        }
        def = '<clis>' + def + '</clis>';
        def = '<ti tbn="' + t.tbn + '" ns="' + t.ns + '">' + def + '</ti>';
        return def;
    };
    
    function _getTokensAsString(its){
        var sa = [], i;
        for(i=0,len = its.length;i<len;i++){
            sa[i] = its[i].v;
        }
        return sa.join(" ").replace(/<\s/g,"<").replace(/>\s/g,">");
    };
    
    function _getTokenStreamXML(expr) {
    	var newItems = [], xml =[];
    	var props = {
                mi: true,
                cn: true,
                v: true,
                tp: true,
                lv: true,               
                sta: true,
                tkn: true
        };
    	newItems.push({'lv':3,'sta':1,'tp':64,'v':''});
    	newItems.push({'lv':1,'sta':1,'tp':2,'v': expr});
    	newItems.push({'lv':2,'sta':1,'tp':-1,'v':''}); 
    	var config = {
        		getArrItemName: function(n, v, i){
                    return 'tkn';
    	        },
    	        isSerializable: function(nodeName, jsons, index){
    	            return (props[nodeName]) ? true: false;
    	        }	
        			
        	};
    	
    	xml.push('<mi cn="3">');
    	xml.push(_S.json2xml('tkn',newItems[0],config));
    	xml.push(_S.json2xml('tkn',newItems[1],config));
    	xml.push(_S.json2xml('tkn',newItems[2],config));
    	xml.push('</mi>');
    	    			
    	return xml.join('');
    };	
    
    var func_cat=["Basic","Date and Time","Logical","Math","Internal","Null/Zero","String"];

    /**
     * return widget row ids associated with given columns
     * 
     * @param {model}  our data model
     * @param {cols}   columns array 
     * 
     * @private
     */
    function _getcolwids(model, cols) {
    	var ids=[];
    	for (var i=0, len=cols.length; i<len; i++) {
		    var col = cols[i];
		    var tid =model.dbts[col.tid];
		    if (tid){
		       var wid = model.uiids[tid + col.cid ];
		       ids.push(wid);
		    }	
		}
    	return ids;    	
    };	
    
    /**
     * populate condition array for the condition editor
     * 
     * @param {model}  our data model
     * @param {roo} condition node
     * @param {arr} holding the result array
     * @param {whe} condition's expression node
     * 
     * @private
     */ 
    function _loadConditions(model, roo, arr, whe) {
    	
    	if (!roo.ftype) {  //this is a filter condition node
    		var cols = _findSelectedColumns(whe, []);
    		//update row widget icons
    		var wids = _getcolwids(model,cols);
    		for (var i=0, len = wids.length; i<len; i++) {
    		    if (mstrmojo.all[wids[i]] && mstrmojo.all[wids[i]].updateState){
    		    	mstrmojo.all[wids[i]].updateState(2); //mark filter icon
    		    }	
    		}	
    		return  arr.push({et: '*', n: roo.exp, expr:[{v:roo.exp}], wid: wids});    		 
    	}	        	
    	
    	switch (roo.ftype) {
    	case 19:  //and   
    	case 20:  //or	
    	case 21: //not
    		var tmp = [];
     	    for (var i=0, len=roo.children.length; i<len; i++) {
         	    var opnd = roo.children[i];
         	    _loadConditions(model, opnd, tmp, whe.chn[i]);        	  
         	} 
     	    arr.push({et: 14 , fn: roo.ftype, nds: tmp, not: (roo.ftype == 21)});
     	    break;
    	default:    	   
    		break;
    	}
    };
    
    /**
     * find columns used in an expression
     * 
     * @param {roo}  expression node
     * @param {cols} columns array, holding the result 
     * 
     * @private
     */    
    function _findSelectedColumns(roo, cols){
    	var chn = roo.chn;
    	if (!chn) {
    	    if (roo.col && roo.stbid) {
    	    	cols.push({cid: roo.col , tid: roo.stbid});    	    
    	    }
    	    return cols;
    	}    	
    	for (var i=0, len=chn.length; i<len; i++) {
    	    cols = _findSelectedColumns(chn[i], cols);    		
    	}
    	return cols;
    };
    
    /**
     * load existing FFSQL report definition
     * 
     * @param {t}  the table.
     * @param {cls} columns array.
     * 
     * @private
     */
    function _loadFFSQLReport(arr, maps, model){
    	//the last item is the embedded DBTable    	
    	var sql = arr[arr.length -1].oi.def.csl.roo.chn[0].va.vv ; //the sql statement 
    	
    	sql = sql? _rmescp(sql) : "";
	    model.raiseEvent({name:'FFSQLLoaded', value:sql, items: []});
	    
	    model.populateFFSQLMapping(maps);
	    
	    model.raiseEvent({name:'dataPreview'});
	    
    	
    };	
    
    /**
     * load existing QBReport/Cube definition
     * 
     * @param {t}  the table.
     * @param {cls} columns array.
     * 
     * @private
     */
    function _loadExistingReport(res, model) {    	
    	
    	if (!res || !res.btb) {
    		return; 
    	}     	
    	
    	var arr = res.btb;
    	var maps = res.datap.maps;
    		
    	
    	//check if this is FFSQL or QBreport 
    	if( arr[0].oi["ext_type"] ===3) 
    		    model.set('isFFSQL',true);
    	
    	model.refresh_opt = arr[0].oi.def.crpt;
    	
    	var xda=null;
    	if (model.isFFSQL) {
    	    xda = arr[1].oi.def.xdas.did;    	
    	    model.getXDADBRole(xda);
    	    _loadFFSQLReport(arr, maps, model);       
   		    return ;     
    	}
    	    	
    	//load binding tables and selected columns   	  
	    var tables=[], clns={}, rpt, obj;
	    for (var i=0,len=arr.length; i<len;i++ ){
	         obj = arr[i].oi;
	    	 switch (obj.tp) {
	    	 case 53: //DBTable
	    	     tables.push({
    		    	     cs :  obj.def.cs.cs,
    		    	     tbn : obj.def.tbn,
    		    	     did : obj.did
	    	     });
	    		 break;
	    	 case 26: //Column	    		 
	    		 clns[obj.did]={
	    			did: obj.did,
	    			cln: obj.def.cln,
	    			dttp: obj.def.dt.tp,
	    		    dtps: obj.def.dt.ps,
	    		    dtsc: obj.def.dt.sc
	    		 };
	    	 	 break;
	    	 case 3: //report 
	    		 rpt = obj.efd;
	    		 break;
	    	 default:
	    		 break;
	    	 }
	   }
	    		   
	   //selected columns and joins in the definition
	   //first find the embedded DBTable
	   var def = null, oi =null;
	   for (var i=0,len=rpt.length;i<len;i++){
		    oi = rpt[i].oi;	
		    switch (oi.tp) {
		    case 53: 
		    	def = oi.def.sqs["c_c"][0];
		        break;
		    case 15:
		    	xda = oi.def.xdas.did;
		    	break;
		    default:
		    	break;
		    }
	   }	   
	  
	   if (xda != null){
		   model.getXDADBRole(xda); 
	   }
	   
	   if (def === null) {
		   return;   
	   }
	   
	   var selected = def.sqcs["c_c"];
	   var joins = def.sjs["c_c"];
	   var ts = def.stbs["c_c"];
	   var whe = def.whe; //where condition
	   var cds = def["w_cond"];
	   var he = def.he;  //having condition
	   var hds = def["h_cond"];
	   
	   var dbts={}, pos ={}, t, dbtid, tf;  //hashtable for mappings:dbtable<->table, and their positions
	   for (var i=0,len=ts.length;i<len;i++){
		   t = ts[i];
		   dbtid = t.dbt.did;
		   dbts[t.id] = dbtid;
		   tf = t.sqltf;
		   if (tf && tf.length) {
		      pos[dbtid] = {w: tf[0].pdv/_twipPerPixel, h: tf[1].pdv/_twipPerPixel, t: tf[2].pdv/_twipPerPixel, l: tf[3].pdv/_twipPerPixel };
		   }
	   }	   
	  
	   var selclns = model.selectedClns;
	   var mps ={};
	   for (var i=0, len=selected.length; i<len ;i++) {
		   var cols = _findSelectedColumns(selected[i].exp.roo, []);
		   var exp = selected[i].exp.exp;
		   selclns.push({wid:[], expr: [{v:exp}]});
		   for (var j=0;j<cols.length;j++) {
			   var col = cols[j];
			   var cid = col.cid;
			   var exp = selected[i].exp.exp;
			   dbtid = dbts[col.tid];				
			   mps[dbtid] = mps[dbtid] || {};
			   mps[dbtid][cid] =  mps[dbtid][cid] || {};
			   mps[dbtid][cid].state = 1; //state 1
			   mps[dbtid][cid].count = !mps[dbtid][cid].count? 1 : mps[dbtid][cid].count+1;
			   selclns[i].wid.push(dbtid + cid);
		   }		    
	   }
	   
	   model.populateMappings(maps);
	   	   
	  //all binding DBTables and their columns along with the datatypes
	   for (var i=0,len=tables.length; i<len;i++ ){
		    var cs = tables[i].cs, ncs = [], tid = tables[i].did ;		  
		    for (var j=0,cnt=cs.length; j<cnt; j++ ){
		    	var cid= cs[j].did;  
		    	ncs.push(_H.copy(clns[cs[j].did]));  //we have to make a copy of the column object
		    	if (mps[tid] && mps[tid][cid]) {   			    		
		    		ncs[j].state = 1;
		    		ncs[j].count = mps[tid][cid].count;
		    	}	
		    }	
		    tables[i].cs = ncs;
		    tables[i].pos = pos[tid]? pos[tid]: null;
	   }	   
	   model.raiseEvent({name:'BindingTableLoaded', value:tables});
		
	   //after all table widgets have rendered, we update the selected column indices	  
	   for (var i=0, len = selclns.length; i<len ; i++) {
		   var wids = selclns[i].wid;
		   for (var j=0, cnt=wids.length; j<cnt;j++ ) {
			    wids[j] = model.uiids[wids[j]];   //update selected columns collection using the widget row id   
		   }
	   }	   
	   
	  
	   
	   //joins //todo multiple expression in a single join
	   for (var i=0,len=joins.length;i<len;i++) {
		   var join = joins[i];
		   var ltid = dbts[join.ltid], rtid = dbts[join.rtid], jt = join.jt, idx = join.ix;   		
		   var root = join.cdn.roo;
		   var func = root.fun.did, lcid = root.chn[0].col, rcid = root.chn[1].col, exp = join.cdn.exp;
   		   var jid = model.uiids[ltid] + model.uiids[rtid];
		   model.joins.push(jid);		   
		   model.joinsInfo[jid] = new Object();
		   model.joinsInfo[jid].jt = jt;
		   model.joinsInfo[jid].exp = exp;		 
		   model.joinsInfo[jid].srctID = model.uiids[ltid];
		   model.joinsInfo[jid].tgttID = model.uiids[rtid];
		   if (!model.joinsInfo[jid].links){
		      model.joinsInfo[jid].links = new Object();
		   }
		   
		   if (model.tables[model.uiids[ltid]].njoins) {
			   model.tables[model.uiids[ltid]].njoins++ ;
		   }else {
			   model.tables[model.uiids[ltid]].njoins =1;
		   }	   
		   
		   if (model.tables[model.uiids[rtid]].njoins) {
			   model.tables[model.uiids[rtid]].njoins++ ;
		   }else {
			   model.tables[model.uiids[rtid]].njoins =1;
		   }
		   
		   if (model.joinsInfo[jid].nlinks) {
			   model.joinsInfo[jid].nlinks++;
		   } else {
			   model.joinsInfo[jid].nlinks = 1;   
		   }
		   
		   var srcwid = model.uiids[ltid + lcid], tgtwid = model.uiids[rtid + rcid];
		   model.joinsInfo[jid].links[srcwid + tgtwid] = {
			   srcw : mstrmojo.all[srcwid],
			   tgtw : mstrmojo.all[tgtwid],
			   coords: [],
			   exp:  exp,
			   jid: jid	   
		   } 
	    }
	    model.raiseEvent({name:'JoinsLoaded'});
   	   	
	   //cache the dbtable and logical table mapping info
	    model.dbts = dbts;
	    
	    var cel=mstrmojo.all.CE.CEl;
	    //where clause conditions 	    
	    if (whe.exp != "") {
	    	cel.data.hasWhere=true;
		    var arr = [];	    
		    _loadConditions(model, cds, arr, whe.roo);
		    model.raiseEvent({name:'condLoad', value: arr});
	    }
	    
	    //having clause conditions 	    
	    if (he.exp != "") {
	    	cel.data.hasHaving=true;
		    var arr = [];	    
		    _loadConditions(model, hds, arr, he.roo);
		    model.raiseEvent({name:'aggcondLoad', value: arr});
	    }
	    
    }	
    
   
    mstrmojo.QB.QBuilderModel = mstrmojo.declare(
        // superclass
        mstrmojo.WH.WHModel,

        // mixins
        null,
               
        {
        	
            scriptClass: "mstrmojo.QB.QBuilderModel",
            
            id: 'QBuilderModel',
            
            tables: new Object(),
            
            selLink: null,
            
            dbtbls: {},
            uiids:{},   //this is the hash of mapping between object ids between widget ids
        
            riid: '', 
            
            folderID: '',
            
            redirect: 3,  //redirect mode: { 1:create report, 2:create document, 3:create analysis }
            
            msgid: '',
           
            selectedClns: [],  //selected column indices
            joins: [],  //joins indices      
            joinsInfo: new Object(),
      
            bindingT: [],  //bindingDBTables for this report 
            
            tbns:{},  //this is the hash for the table alias
          
            isDI: false,  //whether this is for DI 
            
            FFSQLMode:false,   //whether it's FFSQL mode (true) or QueryBuilder mode (false)
            
            isFFSQL: false, //whether it's ffsql report
            
            isCloud: false,

            isCubeReport: true,  //wether the current report is a cube report or not
            autoRefreshSQL: false, //if refresh SQL automatically iff SQL panel is visible
            
            isDirty: false,  //flag indicating whether we need to do the automap
            
            SQLstmt: '',  //the FFSQL statement
            
            refresh_opt: '1',  //default Cube Republish Behavior
            
            mappings: [],            
            cloneMappings: [],
            dataset: [],
            cacheMP: [],    //cached mappings for 
            cacheDS: [],
            
            conditions:new Object(),

            cnum:0,
         
            datatypes: _formats,
                
            addLink : function addLink(srcw, tgtw, jid, callbacks) {
				 var mdl=this,
				    key = srcw.id + tgtw.id, 
				    links = mdl.joinsInfo[jid].links;

				 // push the key into the
				var jIndex = this.getjIndex(jid),
				    lexp= _getTokensAsString(srcw.expr) + '='+ _getTokensAsString(tgtw.expr),
				    jexp='';
				if(mdl.joinsInfo[jid].exp){
				        jexp = mdl.joinsInfo[jid].exp+' AND '+ lexp;
				      }
				   else {
					   jexp=lexp;
				        }
	            
				var cbexpr = {
						   success : function(res) {
				              mdl.joinsInfo[jid].exp=jexp;
					          links[key] = new Object();
					          links[key].srcw = srcw;
					          links[key].tgtw = tgtw;					        
					          links[key].coords = [];
					          links[key].exp=lexp;
					          links[key].jid = jid;
					          mdl.joinsInfo[jid].exp=jexp;
					          if (mdl.autoRefreshSQL) {
							       mdl.updateSQL(callbacks);
					          }
							  else {
								if (callbacks&& callbacks.success) {
									callbacks.success();
								}
							}
						},
						failure : function(res) {}
					};
					mdl.setExpression(false, 1, null,jIndex, 3, jexp, null, cbexpr);
				},
			
		 removeLink : function removeLink(linkid, jid, callbacks) {
				var mdl=this,
				    links = mdl.joinsInfo[jid].links,
                    jIndex = this.getjIndex(jid),
				    jexp='';
			    for(var k in links){
					if(k!==linkid){
						if(jexp) jexp+=' AND '+links[k].exp;
						else  jexp=links[k].exp;
					}
				}
			    if(!jexp) mdl.removeJoin(jid,callbacks);
				else{
				    var cbexpr = {
						success : function(res) {
			                mdl.joinsInfo[jid].exp=jexp;
				            delete links[linkid];
					
							if (mdl.autoRefreshSQL) {								
								mdl.updateSQL(callbacks);
							} else {
								if (callbacks
										&& callbacks.success) {
									callbacks.success();
								}
							}
						},
						failure : function(res) {

						}
					};
					mdl.setExpression(false, 1, null,jIndex, 3, jexp, null, cbexpr);
				}
			},

			getTouchValue : function getTouchValue(x, y) {				
                for (var j in this.joinsInfo) {
                    var links=this.joinsInfo[j].links;
				    for ( var elem in links) {
					    var coordsArray = links[elem].coords;
					    if (this.inPoly(coordsArray, x, y)) {
						   return [j,elem];
					    }
				    }	
                }
				return null;
			},

		   inPoly: function inPoly(poly, px, py) {
				var npoints = poly.length; // number of points in polygon
				var xnew,ynew,xold,yold,x1,y1,x2,y2,i;
				var inside=false;

				if (npoints/2 < 3) { // points don't describe a polygon
					return false;
				}
				xold=poly[npoints-2];
				yold=poly[npoints-1];

				for (i=0 ; i < npoints ; i=i+2) {
					xnew=poly[i];
					ynew=poly[i+1];
					if (xnew > xold) {
						x1=xold;
						x2=xnew;
						y1=yold;
						y2=ynew;
					} else {
						x1=xnew;
						x2=xold;
						y1=ynew;
						y2=yold;
					}
					if ((xnew < px) == (px <= xold) && ((py-y1)*(x2-x1) < (y2-y1)*(px-x1))) {
						inside=!inside;
					}
					xold=xnew;
					yold=ynew;
				}
				return inside;
			},
			
		     json2xml: function(/*String*/nodeName, /*Array|Object*/jsons, /*Object*/config){
	            if (!(jsons instanceof Array)){
	                jsons = [jsons];
	            }
	            var serial = config && config.isSerializable,
	                convertBoolean = (config.convertBoolean === false)? false:true;
	            var att= [],    
	                ch = [],   
	                n,          
	                v,          
	                t;          
	           for (var ji = 0, jlen = jsons.length; ji < jlen; ji ++) {
	                var json = jsons[ji];
	               
	                for (n in json){
	                   
	                    if (serial) {
	                        var ret = serial(n, jsons, ji);
	                        if (ret !== true){
	                            if (ret === false) {   
	                                continue;
	                            } else {
	                                if (ret.att){      
	                                    att.push(ret.att);
	                                }
	                                if (ret.child){    
	                                    ch.push(ret.child);
	                                }
	                                continue;
	                            }
	                        }
	                       
	                    }                
	                    v = json[n];
	                    t = _typeOf(v);
	                    switch(t) {
	                        case 'array':
	                        	if(n!=='omit'){
	                            ch.push('<' + n + '>');     // node for array
	                           
	                            for (var i = 0, len = v.length; i < len; i ++){
	                                var cn = config.getArrItemName(n,v,i) || i;
	                                ch.push(this.json2xml(cn, v[i], config));  
	                            }
	                            ch.push('</' + n + '>');
	                        	}
	                        	else{
	                        		 for (var i = 0, len = v.length; i < len; i ++){
	                                     var cn = config.getArrItemName(n,v,i) || i; 
	                                     ch.push(this.json2xml(cn, v[i], config));  
	                                 }
	                        	}
	                            break;
	                        case 'object':
	                            ch.push(this.json2xml(n, v, config));
	                            break;
	                        case 'string':
	                            att.push(n + '="' + mstrmojo.string.encodeXMLAttribute(v) + '"'); 
	                            break;
	                        case 'boolean':
	                            att.push(n + '="' + ((convertBoolean)? (v ? '-1': '0'):v) + '"'); 
	                            break;
	                        case 'null': 
	                            if (!config.skipNull) {
	                                att.push(n + '="' + config.nullValue + '"');
	                            }
	                            break;
	                        default:
	                            att.push(n + '="' + v + '"'); 
	                            break;
	                    }
	                } 
	            } 
	            return '<' + nodeName + ' ' + att.join(' ') + '>' + ch.join('') + '</' + nodeName + '>';
	        },
			

			exprEditor:function(w, type, widget, cIndex) {
	  	        var id = "mstrQB", 
	  	        fcts = null,
	  	        openME = function(oi){
	  	        var ae = mstrmojo.all[id];
	  	            if(!ae){
	  	               ae = new mstrmojo.QB.ExpressionEditor({id:id, oi: oi, functions: fcts});
	  	            } else {
	  	                ae.set('oi',oi);
	  	            }
	  	           ae.open();
	  	         _hideWaitPage();    
	  	        },
	  	        failure = function(res){
	  	        	_hideWaitPage();        
	  	            mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	  	        },                
	  	        fsuccess = function(res){
	  	            try {
	  	                fcts = res;
	  	                
	  	                if(!w){  //New Condition Editor
	  	                	openME({ n: 'New Condition Expression',  type: type, w:widget, tks:{tkn: [], vs: 0, vm: ''}, mhfts:{}, mvfts:{}});
	  	                }
	  	                else if(type==3){
	  	                	openME({did:'editsc', n:'Edit Column '+cIndex,  type: type, w:w, cIndex:cIndex, tks:{tkn:w.expr , vs: 0, vm: ''}, mhfts:{}, mvfts:{}});
	  	                }
	  	                else if(w.id&&!w.length) { 
	  	                	 var rowID=w.id;
	  	                        openME({did:rowID, n: mstrmojo.all[rowID].oriexpr, w:w, type: type, cIndex:cIndex, tks:{tkn:mstrmojo.all[rowID].expr , vs: 0, vm: ''}, mhfts:{}, mvfts:{}});
	  	                      }
	  	                 else {
	  	                    openME({did:'mod', n: 'Modify Condition Expression',  type: type, w:widget, tks:{tkn: w , vs: 0, vm: ''}, mhfts:{}, mvfts:{}});
	  	                }
	  	            } catch (ex) {}    // swallow.
	  	        };
	  	        
	  	       _showWaitPage();
	  	       this.getFunctions({success: fsuccess, failure: failure}); 
	  	 },
	  	 
	  	  validateExpr: function validateExpr(params, callbacks){
           	 var me=this;          
           	 var taskParams =  {
                     taskId:'qBuilder.Parse',
                     messageid:me.msgid, //params.messageid,
                     qindex:1,
                     cindex:params.cIndex,
                     qbrex:params.qbrex,                     
                     exp:params.expr,
                     
                     sessionState: mstrApp.sessionState
                  };
           	    if (params.tKnStrm) {
           	    	taskParams.tokenStrm = params.tKnStrm;
           	    }	
           	    
           	    if (params.vo==1) taskParams.vo=1;
                           
           		var cb={
           				success:function(res){
           			    _hideWaitPage();
           			       if ( callbacks&&callbacks.success)
           			            callbacks.success(res);
           		                          }, 
           		          failure:function(res){
           		                _hideWaitPage();
           		           		  if ( callbacks&&callbacks.failure)
           		           			       callbacks.failure(res);
           		              mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));	  
           		                          }
           		        };
           		     _showWaitPage();
                     mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, taskParams);
            }, 
	  	 
            getFunctions: function getFunctions(callbacks){
                var me = this,
                    fcts = this.functions || window.sessionStorage && window.sessionStorage.getItem('functions');
                
                if(fcts){
                    fcts = _sortFunctions(eval('(' + fcts + ')').fncs);
                    callbacks.success(fcts);
                } else {
                    var cb = {failure: callbacks.failure, textResponse: true},
                        taskParams =  {
                            taskId:'getSystemFunctions',
                            includeFunctionDetails: false,
                            functionFlags: 2,
                            sessionState: mstrApp.sessionState
                        };
                    
                    cb.success = function(res){
                        //caching
                        if(window.sessionStorage){
                            window.sessionStorage.setItem('functions', res);
                        }      
                        me.functions = res; 
                        
                        fcts = _sortFunctions(eval('(' + res + ')').fncs);

                        callbacks.success(fcts);
                    };
                    mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, taskParams);
                }                    
            },
      
         
         getSuggestFunctions: function getSuggestFunctions(callbacks){
             var me = this,
                 sf = this.suggestedFunctions;
             if(sf&&sf.length>0){
                  callbacks.success(sf);
                 return;
             } else {
             	 var cb={
             	    success: function(res){
                        var sf=new Array();
                        for(var k=0, len=res.length; k<len; k++){
                        	  for(var i=0, len2=func_cat.length; i<len2; i++)
                    	           if(res[k].n.indexOf(func_cat[i])>-1) {
                    	        	   sf=sf.concat(res[k].fns);
                    	               break;
                        	  }
                        }
                           me.suggestedFunctions=sf;
                           _hideWaitPage();
                           callbacks.success(sf);
             	   },
             	   failure: function(){mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));}
             	  };
             	_showWaitPage();
                this.getFunctions(cb);
             }
            },

         
         getFFsqlComponents: function getFFsqlComponents(callbacks){
             var success = function(res){
            	  if(callbacks&&callbacks.success){
            		 var qdl=mstrmojo.all.QBuilderModel,
            		     tbls=qdl.dbtbls[qdl.SelDBRoleID],
            		     tItems=new Array(), num=0;
            		 for(var k in tbls)
            			 tItems[num++]={n:k, sta:2, t:15}
            		 res=_sqlc.concat(tItems).concat(res);
            		 qdl.FFsqlComp=res;
            	    callbacks.success(res);
            	    _hideWaitPage();
                  }
             },
             failure = function(res){
                 mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
             };                
             _showWaitPage();
            this.getSuggestFunctions({success: success, failure: failure}); 
            },
         
         createReportInstance: function createReportInstance(rid, callback){
        	 var mdl = this;
             var taskParams =  {
                 taskId:'arch.getReportInstance',
                 rid: rid,
                 sessionState: mstrApp.sessionState
             };
             var cb = {
    			 success: function(res){
            	     mdl.msgid = res.gi;
            	     if (callback && callback.success){
            	    	 callback.success();
            	     }
   				 },
    			 failure: function(res){ 
   					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
  				 }			
    		 };
             mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, taskParams);
         },
        
         
        _set_autoRefreshSQL: function (n, v){
       		var mdl =this;
        	this.autoRefreshSQL = v;       		
       		if (v && !this.FFSQLMode) {  //we don't need to get SQL preview in FFSQL
       			this.updateSQL();       			
       		}	       		
        },
        
        updateSQL: function(callbacks){ 
        	var mdl =this;   
        	if (!mdl.SelDBRoleID && mdl.riid == _DEFAULT_TEMPLATE_ID) { //if dbrole not set for new report
	      		  var v='';
	      		  mdl.raiseEvent({name: 'updateSQL', value: v}); 
					    if (callbacks && callbacks.success){
					    	callbacks.success();
					    }
	      	}else {
	        	var cb = {
	       			    success: function (res){
	        		      var s=res.sqls[res.sqls.length-1],
				              v = s?_rmescp(s):"";   
	       				    mdl.raiseEvent({name: 'updateSQL', value: v}); 
	       				    if (callbacks && callbacks.success){
	       				    	callbacks.success(res);
	       				    }	
	       			    },
	       			    failure: function(res){
	       			    	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));       			    	
	       			    }		
	       		}	
       		    mdl.loadReport(2, 0, null, null, cb);
      	    }	
        },	
        
         _set_SelDBRoleID: function(n, v){
      		this.SelDBRoleID = v;
      		this.raiseEvent({name: 'dbroleChange', value: v});  
      		this.setDBRole(v);      		
         },
         
         getSelectedDBRoleTables: function (callbacks, usecache) {        		
     		//perform the task to retrieve DBTables for given dbrole
         	var model = this;
         	var dbr = model.SelDBRoleID, dbts = model.dbtbls;
         	if (!dbr) {
         		return;
         	}        		
     		var tbls = dbts[dbr], idx = 0, _ispopulated = false, tables = [],n;
         	if ( usecache && dbts[dbr]) {
         		for (var tbn in tbls) {
         			_ispopulated = true;
	                dbt = tbls[tbn];	                
	                n = dbt.ns? dbt.ns + '.' + dbt.tbn : dbt.tbn;
                    tables[idx]={
                        n: n, 
                        id: dbt.tbid, 
                        did: n,
                        st: 8405,
                        tag: dbt,
                        items: []
                    };
		            idx++;	                     
	            }
         		if (_ispopulated) {
         		    callbacks.success(tables);
         		    return ;
         		}
     		}
         	
         	dbts[dbr]= new Object();
         	tbls = dbts[dbr];         	
         	var flags = this.DssCatalogFlags.DssCatalogGetTables | this.DssCatalogFlags.DssCatalogAllNamespaces;
         	var tableparams = {taskId:'arch.catalogAction', dbrid: dbr, flags: flags};
         	var cb = {
         	    success: function(res){
        		   //hide the wait page
	               _hideWaitPage();
	               var cas = res.xrc.cas[0];
	               var stamp = cas.timestamp.replace(/&apos;/, "");
	               model.raiseEvent({name: 'cacheStamped', value: stamp}); 
	               var cattables = cas.tis;
    			   var length = cattables.length, n, ds=[], count=0;
    			   for (idx = 0; idx < length ; idx++){
    			       var dbt = cattables[idx];
       				   dbt = cattables[idx];       				   
       				   n = dbt.ns? dbt.ns + '.' + dbt.tbn : dbt.tbn;
       				   if (tbls[n]) {  //if we have duplicate, skip
       					   continue;
       				   }
       				   tbls[n] = dbt;	       				   
       				   if (dbt){ 
						   ds[idx]={
	                           n: n, 
	                           id: dbt.tbid, 
	                           did: n,
	                           st: 8405,
	                           tag: dbt,
	                           items: []
	                       };    					   		
       				    }	
     			    }
		 		    callbacks.success(ds);
		  		},
          		   
          		failure: function(res){
          			   //hide the wait page
	    	           _hideWaitPage();
          			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
          		   }
         	   };
         	   //show the wait page
     	       _showWaitPage();	
          	   if (mstrApp.sessionState !== undefined){ tableparams.sessionState = mstrApp.sessionState; }
         	   mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, tableparams);
     	},	
  
        autoMap: function(callbacks, silent){
        	   var mdl = this;        	
         	   var cb2 = {
            	    success: function(res){
         		        mdl.isDirty = false;
         		        if (!silent) {
	            		    var datap = res.datap, maps = datap.maps, dataset = datap.data;
	            		    if (mdl.FFSQLMode||mdl.isFFSQL){
	            		    	var indices =[];
	            		    	mdl.populateFFSQLMapping(maps);
	            		    	mdl.populateDataset(dataset);
	            		    }else {	
	            		        mdl.populatePreview(maps, dataset);
	            		    }
	            		    mdl.raiseEvent({name:"dataPreview"});
         		        }
            		    if (callbacks && callbacks.success){
            	            callbacks.success(res); 
            	        }
            	    },
            	    failure: function(res){
            	        if (callbacks && callback.failure){
            	            callbacks.failure(res); 
            	        }
            	    }	
            	}
        
         	   mdl.loadReport(6, 15, 3, 1, cb2);
         	   
            },
            
            convertToQueryBuilder: function (callbacks){
            	var mdl = this;
            	var ctparams = {
             			taskId : 'qBuilder.ConvertToQueryBuilder',
    					param_messageid : this.msgid
            			} 
          	   	var cb = {
      	   			success: function(res){
      		       		_hideWaitPage();
      		       	    mdl.msgid = res.msgid;          		       	  
      		       	    mdl.isDirty = true;
      		       	    mdl.mappings = mdl.cacheMP;
		                mdl.dataset = mdl.cacheDS;           		                
         		        mdl.raiseEvent({name:"dataPreview"}); 		            		   
	       	            callbacks.success(res);
       		   		},
           		   
           		   	failure: function(res){
           		   		_hideWaitPage();
           		   		mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           		    }
          	   	};            	 
          		_showWaitPage();
           	    if (mstrApp.sessionState !== undefined){ ctparams.sessionState = mstrApp.sessionState; }
          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, ctparams);
            	 
             },
             
            convertToFFSQL: function (stmt, callbacks){
            	 var mdl = this;
            	 var ctparams = {
             			taskId : 'qBuilder.ConvertToFreeFormSQL',
    					msgid : this.msgid,
    					exp: stmt.replace(/[>]/g,"&gt;").replace(/[<]/g,"&lt;")
            			}
          	   	var cb = {
          	   			success: function(res){
          		       		_hideWaitPage();
          		       	    mdl.msgid = res.msgid;          		       	   
          		       	    mdl.isDirty = true;
          		            mdl.cacheMP = mdl.mappings;
   		                    mdl.cacheDS = mdl.dataset;
          		       	    mdl.dataset = [];
          		       	    mdl.mappings = [];
          		          	mdl.raiseEvent({name:"dataPreview"});  //clear the preview
          		       		callbacks.success(res);
           		   		},           		   
           		   		failure: function(res){
           		   			_hideWaitPage();
           		   			mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           		   		}
          	   		};
            	 
	          	_showWaitPage();
	           	if (mstrApp.sessionState !== undefined){ ctparams.sessionState = mstrApp.sessionState; }
	          	mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, ctparams);
            	 
             },

            
            editFFSQL: function(callbacks, exprDef){
            	var mdl = this;
            	if (this.SQLstmt == exprDef){   
            	    if (callbacks && callbacks.success){
            	        callbacks.success();
            	    	return;
            	    }	
            	};
            	
            	this.SQLstmt = exprDef;
            	
            	var ctparams = {
             			taskId : 'qBuilder.EditFreeFormSQL',
    					param_messageid : this.msgid,
    					param_expressiondef: exprDef.replace(/[>]/g,"&gt;").replace(/[<]/g,"&lt;") }; //escape '>' and '<' to avoid backend error
          	   	var cb3 = {
          	   			success: function(res){
          		       		_hideWaitPage();
          		       	    mdl.msgid = res.msgid;  
          		       		callbacks.success(res);
          		       	},           		   
           		   		failure: function(res){
           		   			_hideWaitPage();
           		   			mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           		   		}
          	   		};
          	   
	          	_showWaitPage();
	           	if (mstrApp.sessionState !== undefined){ ctparams.sessionState = mstrApp.sessionState; }
	          	mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb3, ctparams);
          	     			
          		
             },
             
            mapAttribute: function(did, aid, fid, callbacks) {
            	 var mpcs = [];           
                 mpcs.push({did:did, aid: aid, fid: fid});
            	 var params = {taskId:'qBuilder.RemapObject', msgid: this.msgid, mpcs: JSON.stringify(mpcs) };	               
                 var cb = {
             	        success: function(res){            		
             		       _hideWaitPage();
             		       if (callbacks && callbacks.success) {
             		    	   callbacks.success(res);   
             		       } 
              		    },
              		   
              		    failure: function(res){
              			   _hideWaitPage();
              			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
              		    }
             	};
               
	           	_showWaitPage();
	           	if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
	           	mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
              
            	 
            	 
            },
            
            
            remap: function(did, alias, bft, ot, callbacks){
                var mpcs = [], mpc = {did: did};           
                if (alias) {
                	mpc.alias = alias;
                }
                if (bft){
        			mpc.bft = bft;
        		};	
        	    if (ot) {
            	   mpc.ot = ot;
            	};
            	mpcs.push(mpc);
                var params = {taskId:'qBuilder.RemapObject', msgid: this.msgid, mpcs: JSON.stringify(mpcs) };	               
                var cb = {
            	        success: function(res){            		
            		       _hideWaitPage();
            		       if (callbacks && callbacks.success) {
            		    	   callbacks.success(res);   
            		       } 
             		    },
             		   
             		    failure: function(res){
             			   _hideWaitPage();
             			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
             		    }
            	};
              
	           	_showWaitPage();
	           	if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
	           	mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
                
            	 
            },	 
             
            commitMapping: function(callbacks){
                var mdl = this;                
                var clone = this.cloneMappings, maps = this.mappings; 
            	var mpc, mpcs = [], dirty, m, nm;
             
            	for (var i=0, len = clone.length; i<len; i++) {
                  	m = clone[i];
                  	nm = maps[i];
                  	mpc = {};
                  	dirty = false;
                  	if (!nm.selected){  //if user deselects the mapping
                  		mpcs.push({did: nm.did, cmf: 0});                  	
                  	}else {
                  	  	if (nm.alias != m.alias) {
                  	  		mpc.alias = nm.alias;
                  	  		dirty = true;
                      	};
                  	 	if (nm.dtp != m.dtp){
                  	 		mpc.bft = nm.dtp;
                  	 		dirty = true;
                  		};	
                  	    if (nm.tp != m.tp) {
                  	    	mpc.ot = nm.tp;
                  	    	dirty = true;
                      	};
                      	if (dirty) {
                      		mpc.did = nm.did;
                      		mpcs.push(mpc);
                      	}  
                  	}                  		
                };	
            	
            	
                if (mpcs.length > 0) {                
	                var params = {taskId:'qBuilder.RemapObject', msgid: this.msgid, mpcs: JSON.stringify(mpcs)};	               
	                var cb = {
	            	        success: function(res){            		
	            		       _hideWaitPage();
	            		       if (callbacks && callbacks.success) {
	            		    	   callbacks.success(res);   
	            		       } 
	             		    },
	             		   
	             		    failure: function(res){
	             			   _hideWaitPage();
	             			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	             		    }
	            	};
	            	_showWaitPage();
	             	if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
	            	mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
                }else {
                	//use default mapping, there's no change from user
                    if (callbacks && callbacks.success) {
      		            callbacks.success();   
      		        }              	
                }
                 
            },	
               
            setDBRole: function setDBRole(dbrid, callbacks) {
            	var mdl = this;
	            if (this.msgid == '') {
	                    return;	
	            }
                
                var params = {taskId:'qBuilder.SetDBRole', param_messageid: this.msgid, dbrid: dbrid};
            	var cb = {
        	        success: function(res){            		
        		       _hideWaitPage();
        		       //set msgid 
        		       mdl.msgid = res.msgid;
        		       
         		    },
         		   
         		    failure: function(res){
         			   _hideWaitPage();
         			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
         		    }
        	    };
        		_showWaitPage();
         	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
            	
            },	

            setExpression: function setExpression(validate, qindex, cindex, jindex, type, exp, tokenstrm, callbacks) {
            	var mdl = this;
	            if (this.msgid == '') {
	                    return;	
	            }
                
                var params = {taskId:'qBuilder.Parse', messageid: this.msgid, qbrex: type };
                if (qindex) {
                	params.qindex = qindex;
                }
                if (cindex) {
                    params.cindex = cindex;	
                }	
                if (jindex) {
                	params.jindex = jindex;
                }	
                if (exp){
                	params.exp = exp;
                }
                if (tokenstrm){
                	params.tokenStrm = tokenstrm;
                }	
            	var cb = {
        	        success: function(res){
        		        _hideWaitPage();
        		            		     
        		        if (callbacks && callbacks.success) {
       				        callbacks.success();
        		        }
         		    },
         		   
         		    failure: function(res){
         			    _hideWaitPage();
         			    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
         		    }
        	    };
        		_showWaitPage();
         	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
        		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
            	
            },	
            
            addTable : function addTable(t, cls, callbacks) {
				var mdl = this;
				if (this.msgid == '') {
					return;
				}				

				var alias = t.tbn, tbns = mdl.tbns;
				while (tbns[alias]){
				    alias = alias + "_1"	//create new unique alias
				}
				tbns[alias] = alias;				
				var params = {
					taskId : 'qBuilder.AddTable',					
					def : _getTableRawDef(t, cls),
					alias: alias
				};
				var cb = {
					cls: cls,
					callbacks: callbacks,
					success : function(res) {
					    mdl.isDirty = true;
						// set msgid
						mdl.msgid = res.msgid;
						// push new table into our dbtables array and associated with an index
						// since we store the index, we have to update it when removing an element in the array
						var idx = mdl.dbtables.length + 1;
						// since we don't have table widget id yet, we will ask the GUI to push the table widget it when it becomes available
						// mdl.dbtables.push({n: t.tbn, index: idx, clis: cls} );
						var cbload = {
							success : function(res) {
								_hideWaitPage();
								var c = this.cb;
								if (c && c.success) {
									c.success(this.tValue);
								}
							},
							failure : function(res) {
								_hideWaitPage();
							}
						};
						cbload.tValue = {items: this.cls, index: idx, alias: alias};
						cbload.cb = this.callbacks;
					    if (mdl.autoRefreshSQL) {
					    	mdl.updateSQL(cbload);
						} else {							
							cbload.success();
					    }
					},
					 failure: function(res){
	         			   _hideWaitPage();
	         			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	         		    }
	             };
				 			
				 _showWaitPage();
				 if (mstrApp.sessionState !== undefined) {
				 	 params.sessionState = mstrApp.sessionState;
				 }
				 params['msgid']= mdl.msgid; //msgid is changed after setting dbrole
				 mstrmojo.xhr.request('POST', mstrmojo.App.taskURL,cb, params);					    
				 
			 
			},
            
         
            /*  Remove a table from Report Instance 
             *  @param (w)         : table widget to be removed   
             *  @param (callbacks) : callback function	        	  
             */            
			removeTable : function(w, callbacks) {
				var mdl = this,
				    tIndex = this.gettIndex(w.id),
				    rows= w.Rows.children,
				    cel=mstrmojo.all.CE.CEl;
				var params = {
					taskId : 'qBuilder.RemoveTable',
					msgid : this.msgid,
					tindex : tIndex
				};
 				var cb = {
					widget: w,	
					success : function(res) {
						_hideWaitPage();
						mdl.msgid = res.msgid; //update msg id
 						var wid = this.widget.id;
 						var tbns = mdl.tbns, tbn = mdl.tables[wid].tbn;
						if (tbns[tbn]) {   //update table name hash
							delete tbns[tbn];
						}	
						// Remove related joins 
	               	    for (var k in mdl.joinsInfo) {  
	           		        var srctID=mdl.joinsInfo[k].srctID,
	           		            tgttID=mdl.joinsInfo[k].tgttID;
	           		        if (wid == srctID || wid == tgttID) {
		           		        delete mdl.joinsInfo[k];
	           		        	mstrmojo.array.removeItem(mdl.joins, k);
	           		            mdl.tables[srctID].njoins--;	           		        	 
	           		        	mdl.tables[tgttID].njoins--;	           		        	 
	           		        }
	           		        if (mdl.selLink&&mdl.selLink[0].indexOf(wid)>-1){
	           		        	  mdl.selLink=null;
	           		        }  
	               	    }					
	               		//remove the table
	                    delete mdl.tables[wid];
						mstrmojo.array.removeItem(mdl.dbtables,wid);
						//find selected columns and conditions in deleted table
 						 var   scl= mdl.selectedClns,
						    cIndices=new Array();
	                	for (var i=0,len=rows.length;i<len;i++){
	                		   var row=rows[i];
  	                		 for(var k=0; k<scl.length; k++){
  	                			var idx=mstrmojo.array.indexOf(scl[k].wid,row.id);
	                			   if(idx>-1){
 	                				 mstrmojo.array.removeItem(scl[k].wid,row.id);
	                				 if(cIndices.indexOf(k+1)==-1)
	                				      cIndices.push(k+1);
	                			   }
	                			 }
 	                	}
	                	//remove selected columns
	                	 cIndices.sort(mstrmojo.array.numSorter);
	                	 for(var j=cIndices.length-1; j>-1; j--){
	                		mdl.removeExpression(cIndices[j]);
	                	 }
	                  
					   if (mdl.autoRefreshSQL) {
							mdl.updateSQL(callbacks);
						}
					   else{
						   if (callbacks && callbacks.success) {
							   callbacks.success();
						   }
						}
					},
 					failure: function(res){
	         			   _hideWaitPage();
	         			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	         		    }
				};
 				 
				_showWaitPage();
				if (mstrApp.sessionState !== undefined) {
					params.sessionState = mstrApp.sessionState;
				}
				//remove selected conditions in widget tree and update conditions
				for (var i=0,len=rows.length;i<len;i++){
         		    var row=rows[i];
                    while(_removeConds(cel.filterExpr,row));
                    while(_removeConds(cel.aggfilterExpr,row));
				}
 			    mstrmojo.xhr.request('POST', mstrmojo.App.taskURL,cb, params);
 				 
						
			},
            
			/*  add an expression for displaying in the datapreview panel
			 *    
             *  @param (cIndex)   : the selected query column index, 1-based  
             *  @param         	  
             */ 
			addExpression: function addExpression(cIndex) {
				var exp = _getTokensAsString(this.selectedClns[cIndex-1].expr);				
			    var item = {
	    		    did: cIndex + exp,
	    		    alias: exp,
	    		    n: exp, 
	    		    selected: false,
	    		    isNew: true,
	    		    isQB: !this.FFSQLMode,
	    		    expr: this.selectedClns[cIndex-1].expr,
	    		    dtp: 1,
	    		    ix: this.mappings.length,
	    		    tp: 0  //not mapped
	    	    };	    	   
	        	this.mappings.push(item);
	        	
	        	var count = this.dataset.length;
	        	if (count>0) {
	        	    for (var i=0;i<count;i++ ){
	        	        var row = this.dataset[i];
	        	        row.push(""); 
	        	    }
	        	} 
	        	
	        	this.raiseEvent({name:"dataPreview"});
			
			},	
			
			/*  remove an expression from the datapreview panel
			 *    
             *  @param (cIndex)  : the selected query column index, 1-based  
             *  @param  */           
			 removeExpression: function removeExpression(cIndex) {
	              var sel = this.selectedClns[cIndex-1],
                      wids = sel.wid;
	              for (var i=0, len=wids.length;i<len;i++ ) {
		              var row = mstrmojo.all[wids[i]];   //obtain the row widget
		              row.count--;
		              row.updateState(0);  //update row state and icons                          
	              }       
	              //remove cIndex 
	              mstrmojo.array.removeIndices(this.selectedClns,cIndex-1,1);
	              //find the right mapping with ix equals to the selected index
	              //we also need to update the selected index stored in the mapping
	              var idx = 0;	             
	              for (var i=0, len =this.mappings.length; i<len;i++) {
	            	   var mp = this.mappings[i];
	            	   var ix = mp.ix;
	            	   if (ix != null){
	            		   if (ix == cIndex-1){
	            			   idx = i;
	            		   } else if (ix >= cIndex){
	            			   mp.ix = ix -1;   
	            		   }
	            	   }	
	              }	 
	              mstrmojo.array.removeIndices(this.mappings, idx, 1);
	              var count = this.dataset.length;
	              if (count>0) {
	                  for (var i=0;i<count;i++ ){
	                      var row = this.dataset[i];
	                      mstrmojo.array.removeIndices(row, idx, 1);
	                  }
	              }                                   
	              this.raiseEvent({name:"dataPreview"});
	              if (this.autoRefreshSQL){
	                  this.updateSQL();                                
                  }
              },  
			
			/*  launch the expression editor for a selected query column's expression
			 *    
             *  @param (cIndex)  : the selected query column index, 1-based  
             *  @param         	  
             */ 
			editExpression: function (cIndex){
            	var scl=this.selectedClns[cIndex-1],
            	    ws=scl.wid;        	
        	    this.exprEditor(scl,3,null,cIndex);
            },
            
            /*  callback function after modifying the selected column's expression, this will update UI
			 *    
             *  @param (cIndex)  : the selected query column index, 1-based  
             *  @param         	  
             */ 
            updateExpression: function updateExpression(cIndex) {            	
				var exp = _getTokensAsString(this.selectedClns[cIndex-1].expr);
				var item = this.mappings[cIndex-1];
				item.did = cIndex + exp;
				item.alias = exp;
				item.n = exp;
				item.expr =  this.selectedClns[cIndex-1].expr,
				item.selected = false;
				item.isNew = true;
				item.tp = 0; //not mapped
			 	        	
	        	var count = this.dataset.length;
	        	if (count>0) {
	        	    for (var i=0;i<count;i++ ){
	        	        var row = this.dataset[i];
	        	        row[cIndex-1]="";
	        	    }
	        	}	
 	        	this.raiseEvent({name:"dataPreview"});
			
			},
			
			addSelectedColumns: function addSelectedColumns(selRows, tbIdx ,funIndex, callbacks){
            	var mdl =this;
            	if (this.msgid == '') {
                    return;	
                }
            	var colArray=new Array();
            	for (i=0;i<selRows.length;i++){
            		var colrow=selRows[i];            	
            		if (funIndex!=null){
            			var coldef={dt: colrow.dt.tp, ps:colrow.dt.ps, sc:colrow.dt.sc, clix:colrow.rIndex+1, tblIdx:tbIdx, findex:funIndex};
            		}
            		else{
            			var coldef={dt: colrow.dt.tp, ps:colrow.dt.ps, sc:colrow.dt.sc, clix:colrow.rIndex+1, tblIdx:tbIdx};
            		}
            		colArray.push(coldef);
            	}
             	var strObj=JSON.stringify(colArray);
            	var params = {taskId:'qBuilder.AddMultiSelectedColumns', msgid: this.msgid, colArray:strObj}; 
             	var cb = {
          	        success: function(res){
              		    _hideWaitPage();
              		    mdl.isDirty = true;
		     		    mdl.msgid = res.msgid;
               		    var cbsql = {
        	       			    success: function (res){
               		    	    var s=res.sqls[res.sqls.length-1],
  			                        v = s?_rmescp(s):"";
        	       				    mdl.raiseEvent({name: 'updateSQL', value: v});
        	       				    if (callbacks && callbacks.success) {
        	  	     			         callbacks.success();
        	  	      		        }  
        	       			    },
        	       			    failure: function(res){
        	       			     if (callbacks && callbacks.failure) {
    	  	     			         callbacks.failure();
    	  	      		          } 
        	       			    	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));       			    	
        	       			    }		
        	       		};                    		    
            		    if (mdl.autoRefreshSQL) {  //reload SQL
            		    	cbsql.colrow = colrow;
        	       			mdl.loadReport(2, 0, null, null, cbsql);
            		    }else{
            		    	if (callbacks && callbacks.success) {
  	     			            callbacks.success(colrow);
  	      		            }
            		    }	
           		    },
           		    failure: function(res){ 
           		    	_hideWaitPage();
           			    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	           			if (callbacks && callbacks.failure) {
	     			        callbacks.failure(colrow);
	      		        } 
           		    }
          	    };
              
              	_showWaitPage();
           	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
              
            },	

			
			
            addSelectedColumn: function addSelectedColumn(colrow, useDefaultExpr, callbacks){
            	var mdl =this;
            	if (this.msgid == '') {
                    return;	
                }
            	//we use current column row's datatype to set selected column's datatype            	
            	var params = {taskId:'qBuilder.AddSelectedColumn', msgid: this.msgid, dt: colrow.dt.tp, ps:colrow.dt.ps, sc:colrow.dt.sc}; 
              	var cb = {
          	        success: function(res){
              		    _hideWaitPage();
              		    mdl.isDirty = true;
		                //set msgid 
		     		    mdl.msgid = res.msgid;
		     		    var scl=mdl.selectedClns;
		     		    scl.push({wid:[colrow.id],expr:null});
                		if (!useDefaultExpr){
              		        if (callbacks && callbacks.success) {
            				    callbacks.success(colrow);            				 
             		        }
              		    }else{
	              			var cbExpr = {
	                    		success: function(res){
  	                    		    var cbsql = {
	            	       			    success: function (res){
	            	       				    var v = res.sqls[res.sqls.length-1].replace(/&gt;/g,">").replace(/&lt;/g,"<");
	            	       				    mdl.raiseEvent({name: 'updateSQL', value: v});
	            	       				    if (callbacks && callbacks.success) {
	            	  	     			         callbacks.success();
	            	  	      		        }  
	            	       			    },
	            	       			    failure: function(res){
	            	       			     if (callbacks && callbacks.failure) {
            	  	     			         callbacks.failure();
            	  	      		          } 
	            	       			    	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));       			    	
	            	       			    }		
	            	       			}                    		    
	                    		    if (mdl.autoRefreshSQL) {  //reload SQL
	                    		    	cbsql.colrow = colrow;
	                	       			mdl.loadReport(2, 0, null, null, cbsql);
	                    		    }else{
	                    		    	if (callbacks && callbacks.success) {
	       	  	     			            callbacks.success(colrow);
	       	  	      		            }
	                    		    }	
	                    	    },
	                    	    failure: function(res){
	                    	        mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	                    	    }	
	                        };  
	              		    //set it's expression              		   
	              		    cbExpr.colrow = colrow;
	              		    mdl.setExpression(false, 1, mdl.selectedClns.length, null, 1, null,_getTokenStreamXML(colrow.oriexpr) , cbExpr)
              		    }
           		    },
           		   
           		    failure: function(res){ 
           		    	_hideWaitPage();
           			    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	           			if (callbacks && callbacks.failure) {
	     			        callbacks.failure(colrow);
	      		        } 
           		    }
          	    };
              	 
              	_showWaitPage();
           	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
              	 
            },	
         
            removeSelectedColumn: function(cIndex, callbacks,ng) {
            	var mdl = this;
            
            	var params = {taskId:'qBuilder.RemoveSelectedColumn', msgid: this.msgid, cindex: cIndex};
             	var cb = {
              	        success: function(res){
            		        _hideWaitPage();
            		        mdl.msgid = res.msgid;
            		        if(!ng) mdl.removeExpression(cIndex);
            		        else  mstrmojo.array.removeIndices(mdl.selectedClns,cIndex-1,1);
         		        	if (callbacks && callbacks.success) {
         		        		callbacks.success();
         		        	}	
               		    },
                		    failure: function(res){     
               		    	_hideWaitPage();	
               			    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
               		    }
              	    };  
              
            	_showWaitPage();
            	if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; };
           		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
             	 
            },	
            
            editExpr: function (cIndex){
            	var scl=this.selectedClns[cIndex-1];
            	  
            	    this.exprEditor(scl,3,null,cIndex);
            },
            /*  edit selected column's alias, datatype etc
             *  @param (wid): row widget id
             *           	  
             */
            editSelectedColumn: function(cIndex, alias, datatype, precision, scale, callbacks) {
            	var mdl = this;
            	//var cIndex = this.getcIndex({wid:wid, expr:wid.);
            /*	if (cIndex < 1) {  //selected column index not found
            	    return ;	
            	}	*/
            	var params = {taskId:'qBuilder.EditSelectedColumn', msgid: this.msgid, cindex: cIndex};
            	if (alias != null) {
            	    params.alias = alias;
            	}
            	if (datatype !=null) {
            	    params.datatype = datatype;	
            	}	
            	if (precision != null){
            	    params.ps = precision;	
            	}
            	if (scale != null) {
            	    params.sc = scale;	
            	}
            	
            	var cb = {
              	        success: function(res){
            		        _hideWaitPage();
            		        mdl.msgid = res.msgid;
            		        //update cindices
            		        mstrmojo.array.removeItem(mdl.selectedClns, wid);
            		        if (mdl.autoRefreshSQL){
            		            mdl.updateSQL(callbacks);            		        	
            		        }else{
            		        	if (callbacks && callbacks.success) {
        	     			        callbacks.success();
        	      		        } 
            		        }	
               		    },
               		   
               		    failure: function(res){     
               		    	_hideWaitPage();	
               			    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
               		    }
              	    }; 
            	 
            	_showWaitPage();
            	if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; };
           		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
            	 
            },	
            
            
            /*
             *  @param (tIndex): table index 
             *  @param (flag) : DssSQLAutoJoinUsePkFk: 1,
					        	DssSQLAutoJoinUseNameAndType: 2,
					        	DssSQLAutoJoinUsePkFkIndirect: 4 
			 *  @param (qIndex): query index , default output query, 1		        	  
             */
            autoJoin: function(tIndex, flag, qIndex,callbacks) {
            	var mdl =this;
            	if (this.msgid == '') {
                    return;	
                }  
            	
            	qIndex = (qIndex==null)? 1: qIndex;
            	
            	var params = {taskId:'qBuilder.GenerateJoins', param_messageid: this.msgid, 
            			      param_tableindex: tIndex, param_joinflags: flag, param_index: qIndex };
              	var cb = {
          	        success: function(res){  
              		   
              		    //we have to get the report defn again and retrieve the joins
	              		//mdl.addLinks(src.id, tgt.id);
	  	            	//mdl.tables[src.srcID].links++;	            
	  	            	//mdl.tables[tgt.srcID].links++;
	          		    if (callbacks && callbacks.success) {
	     			        callbacks.success();
	      		        }  
           		    },
           		   
           		    failure: function(res){           			
           			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           		    }
          	    };          		
           	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
            },
            
           
            
            /*  Remove a join from Report Instance 
             *  @param (linkid)         : the link id   
             *  @param (callbacks) : callback function	        	  
             */            
            addJoin : function addJoin(srcw, tgtw, jt, exp, callbacks) {
				var mdl = this;
				if (this.msgid == '') {
					return;
				}
                var src_tIndex=mdl.gettIndex(srcw.srcID),
                    tgt_tIndex=mdl.gettIndex(tgtw.srcID);
				var params = {
					taskId : 'qBuilder.AddJoin',
					param_messageid : this.msgid,
					param_src_table : src_tIndex,
					param_dst_table : tgt_tIndex,
					param_join_type : jt
				};
				var cbjoin = {
					success : function(res) {
					    _hideWaitPage();
					    mdl.isDirty = true;
						mdl.msgid = res.msgid;
						var jid=srcw.srcID+tgtw.srcID;
						mdl.joins.push(jid);
						mdl.joinsInfo[jid]=new Object();
						mdl.joinsInfo[jid].jt=0;
						mdl.joinsInfo[jid].exp='';
						// mdl.joinsInfo[jid].nlinks=0;
						mdl.joinsInfo[jid].srctID=srcw.srcID;
						mdl.joinsInfo[jid].tgttID=tgtw.srcID;
						mdl.joinsInfo[jid].links=new Object();
						mdl.tables[srcw.srcID].njoins++;
						mdl.tables[tgtw.srcID].njoins++;
						cb = {
							success : function(res) {
							     mdl.joinsInfo[jid].nlinks++;
								 if (mdl.autoRefreshSQL) {
									mdl.updateSQL(callbacks);
								 } else {
									if (callbacks&& callbacks.success) {
									    callbacks.success();
									  }
								 }
							 },
							failure : function(res) {}

						};
						
						mdl.addLink(srcw, tgtw, jid, cb);
					 },

					failure : function(res) {
						_hideWaitPage();
						mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
					}
				};
				 
				_showWaitPage();
				if (mstrApp.sessionState !== undefined) {
					params.sessionState = mstrApp.sessionState;
				}
				mstrmojo.xhr.request('POST', mstrmojo.App.taskURL,cbjoin, params);
				 
			},

			/*
			 * Remove a join from Report Instance @param (linkid) :
			 * the link id @param (callbacks) : callback function
			 */
			removeJoin : function(jid, callbacks) {
				var mdl = this;
				var jIndex = this.getjIndex(jid),
				    srctID=mdl.joinsInfo[jid].srctID,
		            tgttID=mdl.joinsInfo[jid].tgttID;
				var params = {
					taskId : 'qBuilder.RemoveSelectedJoin',
					msgid : this.msgid,
					jindex : jIndex
				};
               var cb = {
					success : function(res) {
						_hideWaitPage();
						mdl.msgid = res.msgid;
				        mstrmojo.array.removeItem(mdl.joins, jid);
						delete mdl.joinsInfo[jid];
						 mdl.tables[srctID].njoins--;
					     mdl.tables[tgttID].njoins--;
					 	if (mdl.autoRefreshSQL) {								
							mdl.updateSQL(callbacks);
						} else {
							if (callbacks
									&& callbacks.success) {
								callbacks.success();
							}
						}
			         },

					failure : function(res) {
						_hideWaitPage();
						mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
			     	}
				};	
                
			    _showWaitPage();
				if (mstrApp.sessionState !== undefined) {
					params.sessionState = mstrApp.sessionState;
				}
		        mstrmojo.xhr.request('POST', mstrmojo.App.taskURL,cb, params);
               						
			},

			/*
			 * Edit a join in Report Instance @param (linkid) : the
			 * link id @param (jointype) : EnumDSSQBJoinType:
			 * Inner:0, LeftOuter:1, RightOuter:2, FullOuter:3
			 * @param (callbacks) : callback function
			 */
			editJoin : function(jid, linkid, jointype, callbacks, lexp) {
				var mdl = this,
				    jIndex = this.getjIndex(jid);
				var params = {
					taskId : 'qBuilder.EditJoin',
					msgid : this.msgid,
					jindex : jIndex,
					jtype : jointype
				};
				
				var cb = {
					success : function(res) {
						_hideWaitPage();
						mdl.msgid = res.msgid;
						mdl.joinsInfo[jid].jt=jointype;
						links = mdl.joinsInfo[jid].links;
				      if (lexp) {
				         var pexp=links[linkid].exp,
						    jexp='';
						links[linkid].exp=lexp;
						for(var k in links)
						   { 
							    if(jexp) jexp+=' AND '+links[k].exp;
							    else  jexp=links[k].exp;
						   }
					   var cbexpr = {
									 success : function(res) {
							              mdl.joinsInfo[jid].exp=jexp;
								           if (mdl.autoRefreshSQL) {
								        	   mdl.updateSQL(callbacks);
										     } else {
											if (callbacks	&& callbacks.success) {
												callbacks.success();
											}
										}
									},
									failure : function(res) {
										links[linkid].exp=pexp;
									}
								};
								mdl.setExpression(false, 1, null,jIndex, 3, jexp, null, cbexpr);
									
						} else if (mdl.autoRefreshSQL) {
							mdl.updateSQL(callbacks);
						} else {
							if (callbacks && callbacks.success) {
								callbacks.success();
							}
						}
					},

					failure : function(res) {
						_hideWaitPage();
						mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
					}
				};
			 
				_showWaitPage();
				if (mstrApp.sessionState !== undefined) {
					params.sessionState = mstrApp.sessionState;
				}
				mstrmojo.xhr.request('POST', mstrmojo.App.taskURL,cb, params);
				 
			},
            
			
			renameTable: function renameTable(tid, old, current) {
				var index = this.gettIndex(tid), mdl = this;
				var cb = {
				    success: function(){
					    delete mdl.tbns[old];
					    mdl.tbns[current] = current;
					    if (mdl.autoRefreshSQL) {
							mdl.updateSQL();
						}
				    },
				    failure: function(){
				    	
				    }	
				}		
				this.editTable(index, current, cb);
			},	
            
            editTable: function editTable(index, alias, callbacks){
            	var mdl =this;
            	if (this.msgid == '') {
                    return;	
                }
            	var table = [{alias: alias, tindex: index}];
            	var def = JSON.stringify(table);
            	var params = {taskId:'qBuilder.EditTable', msgid: this.msgid, 
            			      tables: def};
              	var cb = {
          	        success: function(res){
          		        _hideWaitPage();
          		        mdl.msgid = res.msgid;
	          		    if (callbacks && callbacks.success) {
	     			        callbacks.success();
	      		        }  
           		    },
           		   
           		    failure: function(res){
           			   _hideWaitPage();
           			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           		    }
          	    };
              
          		_showWaitPage();
           	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
               
      
            },	
            
        	/*
			 * Remove where / having clause condition
			 * @param (isWhere) : true if this is for the where clause condition
			 * @param (callbacks) : callback function
			 */
            removeCondition: function removeCondition(isWhere, callbacks) {
            	var mdl =this;
            	if (this.msgid == '') {
                    return;	
                }            	
            	var clause = isWhere? 'where' : 'having';
            	var params = {taskId:'qBuilder.EditCondition', msgid: this.msgid, 
            			      clause: clause, exp: ''};
              	var cb = {
          	        success: function(res){
          		        _hideWaitPage();
          		        mdl.msgid = res.msgid;
	          		    if (callbacks && callbacks.success) {
	     			        callbacks.success();
	      		        }  
           		    },
           		   
           		    failure: function(res){
           			   _hideWaitPage();
           			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           		    }
          	    };
              	 
          		_showWaitPage();
           	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
               
            	
            },	
            
            updateFilterLabel: function(cel){
            	var fe=cel.filterExpr,
            	    afe=cel.aggfilterExpr,
            	    fws=new Object();
            	if(fe){
            		_updatefilterws(fe,fws);
            	}
            	if(afe){
            		_updatefilterws(afe,fws);
            	}
            	 var tbls=this.tables;     	        
	     	        for (var k in tbls){
		        			var rows=tbls[k].rows;
		        			for (var j in rows){
		        				var w=rows[j];
		        			    if(fws[j]&&(w.state===0||w.state===1))
		        			    {
		        			    	w.state=w.state+2;
                                    w.images[1]=w.img[w.state];
                        	        w.render();
		        			    }
		        			    else if(!fws[j]&&(w.state===2||w.state===3)){
		        			    	w.state=w.state-2;
                                    w.images[1]=w.img[w.state];
                        	        w.render();
		        			    }
		        		}
	     	        }
            },
            
            saveTableLayout: function saveTableLayout(callbacks){
            	var mdl =this;
            	if (this.msgid == '') {
                    return;	
                }
            	var tables = [];
            	for (var wid in this.tables){
            	     var w = mstrmojo.all[wid];  //obtain the table widget
            	     if (w && w.editorNode){	            	    
	            	     tables.push({tindex: this.gettIndex(wid),  t: parseInt(w.top,10)*_twipPerPixel, l:parseInt(w.left,10)*_twipPerPixel, w: w.editorNode.clientWidth*_twipPerPixel, h:w.editorNode.clientHeight*_twipPerPixel});
            	     }
            	}            	
            	var def = JSON.stringify(tables);
            	var params = {taskId:'qBuilder.EditTable', msgid: this.msgid, 
            			      tables: def};
              	var cb = {
          	        success: function(res){  
              		    _hideWaitPage();
              		    mdl.msgid = res.msgid;
	          		    if (callbacks && callbacks.success) {
	     			        callbacks.success();
	      		        }  
           		    },
           		   
           		    failure: function(res){
           			   _hideWaitPage();
           			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           		    }
          	    };
              	 
          		_showWaitPage();
           	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
               
      
            },
            
            
            /*
             * @param {browseTyp} The parts of the report instance that you want to browse: (BindingTable == 1; SQLPreview == 2; DATAPrevibrowserew == 4)
             * @param {bindingFlag} the object types that you are looking for from 
                             the binding table. (AllTypes=0<default>; TableAndDBTable=1; Report=2; Template=4; Column=8)
               @param {previewFlag} the data information that you are looking for from 
                             the data preview. (MappingInfo=1; DataInfo=2<default>; SourceInfo=8; SheetsInfo=16)
               @param {automap} whether to trigger the automap 
                             (Do_Not_trigger=0<default>; Do_trigger=1)
         
             */
            loadReport: function loadReport(browseType, bindingFlag, previewFlag, automap, callbacks){
            	var mdl =this;
            	if (this.msgid == '') {
                    return;	
                }            	
            	bindingFlag = (bindingFlag==null)? 0: bindingFlag;
            	            	
            	var params = {taskId:'qBuilder.GetReportXDADefinition', messageid: this.msgid, 
            			       browsetype: browseType, bindingflag: bindingFlag};
            	if (previewFlag) {
            		params.previewflag = previewFlag;
            	}
            	if (automap) {
            		params.automap = automap;
            	} 	
              	var cb = {
          	        success: function(res){
          		        _hideWaitPage();
          		        if (browseType & 1) {  //if requesting the binding table info
          		        	if (res.btb){
          		                mdl.bindingT = res.btb.slice(0);;  //update binding tables
          		        	}
          		        }
	          		    if (callbacks && callbacks.success) {
	     			        callbacks.success(res);
	      		        }  
           		    },
           		   
           		    failure: function(res){
           			   _hideWaitPage();
           			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           		    }
          	    };
              
          		_showWaitPage();
           	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
               
      
            },
            
            /* Get the selected column index 
             * 
             * @param {wid} the widget row id
             * 
             */            
            getcIndex: function getcIndex(wid) {
            	return mstrmojo.array.indexOf(this.selectedClns, wid) + 1; // cIndex in COM is 1 based instead of 0, so offset by 1            	
            },	
            /* Get the column widget from expression items
             * 
             * @param {tn} table name
             * @param {rn} row name
             */ 
            getRowWidget: function getRowWidget(tn, rn) {
     	        var tbls=this.tables;     	        
     	        rn = rn.toLowerCase();
     	        if(!tn){
     	        	 for (var k in tbls){
     	        			var rows=tbls[k].rows;
     	        			for (var j in rows)
     	        			    if(rows[j].text.toLowerCase()===rn) return mstrmojo.all[j];
     	            }
     	        }
     	        else {
     	        	tn = tn.toLowerCase();
	     	        for (var k in tbls){
		        		if (tbls[k].tbn.toLowerCase()===tn){
		        			var rows=tbls[k].rows;
		        			for (var j in rows)
		        			    if(rows[j].text.toLowerCase()===rn) return mstrmojo.all[j];
		        		}
		            }
     	        }
	        },
            
            /* Update the selected column index 
             * 
             * @param {wid} the widget row id
             * @param (idx) the index 
             */            
            uptcIndex: function uptcIndex(wid, idx) {            	 
            	while (idx > this.selectedClns.length) {  //when we are loading, selected columns may not be loaded in sequence
            		this.selectedClns.push("");	
            	}	
            	this.selectedClns[idx] = wid;
            },
            
            
            /* Get the join index 
             * 
             * @param {lid} the link id
             * 
             */            
            getjIndex: function getjIndex(lid) {
            	return mstrmojo.array.indexOf(this.joins, lid) + 1; // jIndex in COM is 1 based instead of 0, so offset by 1            	
            },
            
            /* Get the table index 
             * 
             * @param {tid} the table widget id
             * 
             */            
            gettIndex: function gettIndex(tid) {
            	return mstrmojo.array.indexOf(this.dbtables, tid) + 1; // tIndex in COM is 1 based instead of 0, so offset by 1            	
            },
            
            
            getSQLfromTbl: function getSQLfromTbl(param, cb){
                var tks=[],
                    ff=mstrmojo.all.FFsql
                tks.push({isNew:true,v:"Select", oi:{n: 'select', sta: 100, t:100}, did:ff.itemCount++});
            	 var cb2={
						    success: function(res){ 
						          var its=res.items;
						          for(var i=0,len=its.length;i<len; i++){
						    	   var col=its[i];
						    	   tks.push({isNew:true,v:'"'+col.cln+'"', did:ff.itemCount++});
						    	   if(i<len-1)
		                         	   tks.push({isNew:true,v: ',',isDelimiter:true, did:ff.itemCount++},
		                         			    {isNew:true,v: '\n',isDelimiter:true, did:ff.itemCount++},
		                         			   {isNew:true,v: ' ',isDelimiter:true, did:ff.itemCount++});
						    	   else 
						    		   tks.push({isNew:true,v: '\n',isDelimiter:true, did:ff.itemCount++},
		                         			   {isNew:true,v: ' ',isDelimiter:true, did:ff.itemCount++});
						       }
						  tks.push({isNew:true,v:"From", oi:{n: 'select', sta: 100, t:100}, did:ff.itemCount++},
								   {isNew:true,v: ' ',isDelimiter:true, did:ff.itemCount++},
						           {isNew:true,v:param.data.n, did:ff.itemCount++});
						  if(cb.success){
							     cb.success({items:tks});
						  }
						 },
				         failure:function(){}
				 };
				this.getColumnsForDBTable(param,cb2);
            },
            
            
            /* Save the report or publish the cube
             * 
             * @param {cb}
             * 
             */
            save: function(rid, name, callback){
            	var mdl =this;
            	if (this.msgid == '') {
                    return;	
                }     
            	//before saving, we have to set the table GUI layout
            	var cb2 = {
            	    success: function(){		            
		             	var params = {taskId:'qBuilder.SaveReportXDADefinition', param_messageid: mdl.msgid, 
		            			   param_reportid: rid, param_name: name, isCubeReport:mdl.isCubeReport };
		              	var cb = {
		          	        success: function(res){
		          		        _hideWaitPage();
			          		    if (callback && callback.success) {
			     			        callback.success();
			      		        }  
		           		    },
		           		   
		           		    failure: function(res){
		           			   _hideWaitPage();
		           			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
		           		    }
		          	    };
		          		_showWaitPage();
		           	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
		          		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
            	    },
            	    failure: function(){}
            	};
            	this.saveTableLayout(cb2);
            	
            },	
            
            populatePreview: function populatePreview(maps, data){            	 
                this.populateMappings(maps);                
                this.populateDataset(data);
            }, 
            
            getBFDType: function getBFDType(tp) {
                return _getBaseFormDisplayType();
            },
            
            populateMappings: function populateMappings(maps) {
                var attrs = maps.amps, metrs = maps.mtmps;
                var hash ={};
                this.mappings = [];
                this.cloneMappings = [];     
                var j,attr,aimp,afmps,sqc,cnt=0;
                for (var i = 0, len = attrs.length; i < len; i++) {
                     attr = attrs[i];
                     aimp = attr.aimp;
                     afmps = attr.afmps;                    
                     for (j=0, aflen=afmps.length; j<aflen; j++){
                    	 sqc = afmps[j].sqc;
	                     var item = {
	                                 did:sqc.id,
	                                 alias: aimp.atnm,
	                                 n: attr.afmps[j].cln, 
	                                 selected: (sqc.se == 1),
	                                 isNew: false,
	                                 isDI: this.isDI,
	                                 isQB: !(this.FFSQLMode||this.isFFSQL),
	                                 dtp: _getBaseFormDisplayType(sqc.dt.tp),
	                                 ix: sqc.ix,   //this is 0-based
	                                 tp: 12  //attribute
	                     };                                  
	                     hash[item.ix] = item ; 
	                     cnt++;
                     }
                }
                for (var i = 0, len = metrs.length; i < len; i++) {
                     var metr = metrs[i], sqc = metr.sqc;        
                     var item = {
                                 did:sqc.id,
                                 alias: metr.mtn,
                                 n: metr.cln, 
                                 selected: (sqc.se == 1), 
                                 isNew: false,
                                 isDI: this.isDI,
                                 isQB: !(this.FFSQLMode||this.isFFSQL),
                                 dtp: _getBaseFormDisplayType(sqc.dt.tp),
                                 ix: sqc.ix,  //this is 0-based
                                 tp: 4   //metric
                     };
                     hash[item.ix] = item ;                  
                }
                
                //we sort the mapping according to their selected index
                for (var i =0, len = cnt + metrs.length; i< len; i++ ) {
                     var item = hash[i];
                     this.mappings.push(item);
                     this.cloneMappings.push(_H.copy(item));                	
                }	
                
            },
            
            populateDataset: function populateDataset(data) {
                var len = data.length;
                var rows = 0;
                this.dataset = [];     
                if (!len) {
                    return;
                }   
                for (var key in data[0].dvs){
                    var row = [];
                    for (var i = 0; i < len; i++ ){                    	
                        row.push(data[i].dvs[key]);     
                    }
                    this.dataset.push(row);
                }    
            	
            },	
            
            
            populateFFSQLMapping: function populateFFSQLMapping(maps){
        	    var attrs = maps.amps, metrs = maps.mtmps;
        	    var hash ={};
                this.mappings = [];
                this.cloneMappings = [];   
                var j, attr, aimp, c, cnt=0, aflen, afmps;
                for (var i = 0, len = attrs.length; i < len; i++) {
                    attr = attrs[i];
                    aimp = attr.aimp;
                    afmps = attr.afmps;
                    for (j=0, aflen=afmps.length; j<aflen; j++){ 
	                    c = afmps[j].col.oi;      
	                    var item = {
	                                did:c.did,
	                                alias: aimp.atnm,
	                                n: c.def.cln, 
	                                selected: true,
	                                isNew: false,
	                                dtp: _getBaseFormDisplayType(c.def.dt.tp),
	                                ix: c.def.cscl.slix - 1, //this is 1-based
	                                tp: 12  //attribute
	                    };
	                    hash[item.ix]=item;  
	                    cnt++;
                    }
                }
                var idx = attrs.length;
                for (var i = 0, len = metrs.length; i < len; i++) {
                    var metr = metrs[i], c = metr.col.oi;        
                    var item = {
                                did:c.did,
                                alias: metr.mtn,
                                n: c.def.cln, 
                                selected: true, 
                                dtp: _getBaseFormDisplayType(c.def.dt.tp),
                                ix: c.def.cscl.slix - 1, //this is 1-based
                                tp: 4   //metric
                    };
                    hash[item.ix] = item;
                }
                
                //we sort the mapping according to their selected index
                for (var i =0, len = cnt + metrs.length; i< len; i++ ) {
                     var item = hash[i];
                     this.mappings.push(item);
                     this.cloneMappings.push(_H.copy(item));                	
                }	
                
            },	
            
            
            showWaitPage: function(){
            	_showWaitPage();
            },
            
            hideWaitPage: function(){
            	_hideWaitPage();
            },  
          
        
        EnumDSSSQLAutoJoinFlags: {
        	DssSQLAutoJoinUsePkFk: 1,
        	DssSQLAutoJoinUseNameAndType: 2,
        	DssSQLAutoJoinUsePkFkIndirect: 4        	
        },
        
        initReportInst: function(v, isff, isCloud,saveAsCube, folderID, callbacks){
        	var mdl =this;        	
        	mdl.riid = v? v : _DEFAULT_TEMPLATE_ID;
        	mdl.folderID = folderID;
            //we have to instantiate a report instance to use
            var params = {taskId:'qBuilder.CreateQBReportInstance', reportid: mdl.riid};
          	var cb = {
      	        success: function(res){
      		       _hideWaitPage();
      		       mdl.msgid = res.msgid;
      		       if (mdl.riid != _DEFAULT_TEMPLATE_ID){  //for existing cube/report, we have to load its definition
      		    	   var cbload= {
      		    	       success: function(res){
      		    		       _loadExistingReport(res, mdl);
      		    		       if (callbacks && callbacks.success){
            		    		   callbacks.success();
            		    	   }
      		    	       },
      		    	       failure: function(res){
      		    	    	   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
      		    	       }	   
      		    	   }		   
      		    	   mdl.loadReport(5,15,1,null, cbload);
      		       } else {
      		    	    if(isff==='true'){
      		    	    	   mdl.set('isFFSQL',true);
      		    	    	   mdl.raiseEvent({name:'FFSQLLoaded', value:'', items: []});
      		    	    }
      		    	   if (callbacks && callbacks.success){
      		    		   callbacks.success();
      		    	   }	
      		       } 	
  		    	   mdl.set('isCloud',isCloud);
	    	       mdl.set('isCubeReport',saveAsCube!=2);
       		   },
       		   
       		   failure: function(res){
       			   _hideWaitPage();
       			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
       		   }
      	    };
      	    _showWaitPage();
       	    if (mstrApp.sessionState !== undefined){ params.sessionState = mstrApp.sessionState; }
      	    mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);        	
        }    
            
            
        });
})();
        
        