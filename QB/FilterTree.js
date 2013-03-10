(function(){

mstrmojo.requiresCls(
 	        "mstrmojo.FilterExpr"
         );

var _E = mstrmojo.expr,
    _ET = _E.ET,
    _ET2SC = {},
    _H = mstrmojo.hash,
    _D = mstrmojo.dom;
   

_ET2SC[_ET.ANDOR] = mstrmojo.AndOrNode;
_ET2SC["*"] = mstrmojo.ConditionNode;

function _openCond(data, widget, type){
	 var p=widget.parent.parent,
         off = _D.delta(widget.domNode, p.domNode);
     if(type==='andor'&& p.alias === 'aggfilterExpr')
            off.y += parseInt(p.parent.filterExpr.domNode.offsetHeight, 10);
      var cfg = {
            condition: widget,
            zIndex: widget.zIndex + 10,
            left: off.x+30 + 'px',
            top: off.y+50+ 'px'
        },
        n;
     switch(type){
        case 'andor':
            n = "andOrPopupRef";
            mstrmojo.all.CE.openPopup(n,cfg);
            break;
        case 'condition':
         	var qdl=mstrmojo.all.QBuilderModel;
               qdl.exprEditor(data.expr,2,widget);
             break;
     }
 }

function _getTokensAsString(its){
    var sa = [],
        i;
    for(i=0,len = its.length;i<len;i++){
    	
        sa[i] = its[i].v;
    }
    return sa.join(" ").replace(/<\s/g ,"<").replace(/>\s/g , ">");
}


function _CountBC(arr){
    if (arr.constructor !== Array) {
        arr = [arr];
    }
    
    var item, r = {b:0,c:0}, nds, sr, b;
    for(var j=0,len=arr.length;j<len;j++){
        item = arr[j];
        if(!(item && item.et)) continue;
        nds = item.nds;            
        if(nds) {
            sr = _CountBC(nds);
            r.b += sr.b;
            r.c += sr.c;
        } else {
            b = (item.et === _ET.B); 
            r[b ? 'b' : 'c'] ++;
        }
    }
    
    return r;
}

function _syncParentExpr(f){
    // Writes back to our parent's data whenever end-user modifies our items.
    var d = f.parent.data;
    if (d){
        var its = f.items;
        if(f.alias==="filterExpr")
        d.expr = its && its[0];
        else  d.aggexpr = its && its[0];
    }
}

/**
 * Update the number of banding and condition qualification in a filter tree.
*/
function _UpdateBCAdd(evt){
    var ct = _CountBC(evt.value), 
        t = this.tree;
    t.set('bandingCount', t.bandingCount + ct.b);
    t.set('conditionCount', t.conditionCount + ct.c);  
}

/**
 * Update the number of banding and condition qualification in a filter tree.
 */
function _UpdateBCRemove(evt){
    var ct = _CountBC(evt.value), 
        t = this.tree;
    t.set('bandingCount', t.bandingCount - ct.b);
    t.set('conditionCount', t.conditionCount - ct.c);    
}

                    

mstrmojo.QB.FilterTree=mstrmojo.declare(
		mstrmojo.FilterExpr,
		null,
		 {
            scriptClass: "mstrmojo.QB.FilterTree",
            draggable: true,
            dropZone: true,
            allowCopy: false,       
            makeObservable: true,
            bandingCount: 0,
            conditionCount: 0,                                             
            onadd: function(evt){
                _syncParentExpr(this);
                _UpdateBCAdd.apply(this, [evt]);
            },
            onremove: function(evt){
                _syncParentExpr(this);
                _UpdateBCRemove.apply(this, [evt]);
            },
            
            editable: true,
            onRender: function(){
                var c = _CountBC(this.items),
                    t = this.tree;
                t.set('bandingCount', c.b);
                t.set('conditionCount', c.c);  
            },
            
            itemFunction: function (item, idx, widget){
                var andor = (item.et === _ET.ANDOR),
                    t = widget.tree || widget,
                    cfg = {
                        data: item,
                        tree: t,
                        parent: widget,
                        itemFunction: andor ? widget.itemFunction : null,
                        draggable: andor ? t.draggable : false,
                        dropZone: andor ? t.dropZone : false,
                        allowDrop: andor && t.dropZone ? t.allowDrop : null,
                        allowCopy: andor? t.allowCopy : false,
                        editable: t.isEditable ? t.isEditable(item) : t.editable,
                        makeObservable: andor && widget.makeObservable, 
                        onclick: t.onnodeclick,
                        onadd: t.onnodeadd,
                        onremove: t.onnoderemove
                    },
                    Sc = _ET2SC[item.et] || _ET2SC["*"];
                return Sc && (new Sc(cfg));
            },
            
            isEditable: function isedt(item){
                if (!this.editable) {
                    return false;
                }
                var _result = false;
                // Determines whether a given tree node data is editable or not.
                //TO-DO: the switch can probably be replaced by item && (item.et != _ET.XML || !item.xml)?
                
                switch(item && item.et){
                    case _ET.AQ:
                    case _ET.ANDOR:  
                    case '*':
                    _result = true; 
                        break;
                 }
            

                return _result;
            },
            onnodeclick: function ndclk(evt){
                if (!this.editable) {
                    return;
                }
               
                _openCond(this.data, this, evt && evt.part);
            },
            onnodeadd: _UpdateBCAdd,
            onnoderemove: _UpdateBCRemove,
            allowDrop: function allowDrop(ctxt){
                var s = ctxt && ctxt.src,
                    d = s && s.data,
                    et = d && d.et,
                    banding = (et === _ET.B),
                    t = this.tree;

                return et && ((banding && (t.conditionCount === 0)) || (!banding && (t.bandingCount === 0)));   
            },                               
            onNew: function _onNew(inf){
              if(this.evt&&this.evt.wid.length>0){
            	 var qdl=mstrmojo.all.QBuilderModel,
            	     e=this.evt,
            	     c=qdl.conditions
            	     ex=c.expr,
            	     aex=c.aggexpr;
                 if(!aex&&e.sqltp===1) aex=new Object();
                	 var conds=e.sqltp===1?aex:ex;
              	 if(!conds.nds){
            		  conds.n=_getTokensAsString(e.expr);
            		  conds.expr=e.expr;
                      conds.et='*';
                      conds.wid=e.wid;
                      }
                   var cond=new Object();
                      cond.et='*';
     		          cond.n=_getTokensAsString(e.expr);
     		          cond.expr=e.expr;
     		          cond.wid=e.wid;
     		          cond.sqltp=e.sqltp;
     		         var w=inf.widget.ctxtBuilder.itemWidgets[inf.index];
      		          _H.copy(cond,_H.clear(w.data));
                      w.paint();
            		  this.evt=null;
            		 }
            else{
                 _openCond(inf.data,
                    inf.widget.ctxtBuilder.itemWidgets[inf.index],
                    "condition"
                ); 
              }
            },
           updateCond: function(evt){
            	this.evt=evt;
                this.newCondition(null, true);
                if(evt.tp)
                this.parent.update(evt.tp);
             },
             
            loadCond: function(evt){                        	                        	 
            	 this.add(evt.value, 0);                     
            },	 
             
            postCreate:function(){
            	if (!mstrmojo.all.QBuilderModel) {
         			var qdl= new mstrmojo.QB.QBuilderModel({});
         		}
            	else
            		var qdl=mstrmojo.all.QBuilderModel;
               
         
            }
            
  
		 });
  })();