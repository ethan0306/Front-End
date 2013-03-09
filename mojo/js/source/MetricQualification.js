(function(){
    mstrmojo.requiresCls(
            "mstrmojo.Table",
            "mstrmojo._CanValidate");

    /***
     * Metric Condition Selector Utility
     */
mstrmojo.MCSUtil = mstrmojo.provide(
        "mstrmojo.MCSUtil", 
        {
            // Function types
            _GENERIC: 1,
            _RANK: 2,
            _PERCENT: 3,
            
            //Operators ID
            OP: {
                _EQUALS: 0,
                _NOT_EQUALS: 1,
                _GREATER: 2,
                _GREATER_EQUAL: 3,
                _LESS: 4,
                _LESS_EQUAL: 5,
                _BETWEEN: 6,
                _NOT_BETWEEN: 7,
                _IN: 8,
                _NOT_IN: 9,
                _IS_NULL: 10,
                _IS_NOT_NULL: 11
            },
            
            //Qualify On ID
            Q: {
                _G: 0,//Generic
                _RT: 1,//Rank top
                _RB: 2, //Rank bottom
                _PT: 3,//Percent Top
                _PB: 4 // Percent Bottom
            },
            
            MRPFN : {
                    'TOP' :1,
                    'BOTTOM' :2,
                    'BETWEEN' :3,
                    'EXCLUDETOP' :4,
                    'EXCLUDEBOTTOM' :5,
                    'NOTBETWEEN' :6,
                    'EQUALS' :7,
                    'DIFFERENTFROM' :8,
                    
                    //Descending:
                    'EQUALSDESCENDING': 15,       
                    'NOTEQUALSDESCENDING': 16,  //MRPFunctionDifferentFromDescending
                    'GREATERTHANDESCENDING': 4,  //MRPFunctionExcludeTop
                    'GREATERTHANEQUALSDESCENDING': 18,  
                    'LESSTHANDESCENDING': 20,         
                    'LESSTHANEQUALSDESCENDING': 1,   //WebMRPFunctionTop
                    'BETWEENDESCENDING': 13,
                    'NOTBETWEENDESCENDING': 14,
                    'INDESCENDING': 22,
                    'NOTINDESCENDING': 24,
                    
                    //Ascending - these correspond to MRP Functions without 'Dscending' suffix:
                    'EQUALSASCENDING': 7,      //WebMRPFunctionEquals 
                    'NOTEQUALSASCENDING': 8,    //MRPFunctionDifferentFrom 
                    'GREATERTHANASCENDING': 5, //WebMRPFunctionExcludeBottom  
                    'GREATERTHANEQUALSASCENDING': 17,  
                    'LESSTHANASCENDING': 19, 
                    'LESSTHANEQUALSASCENDING': 2,  //WebMRPFunctionBottom
                    'BETWEENASCENDING': 3,      //WebMRPFunctionBetween
                    'NOTBETWEENASCENDING': 6,   //WebMRPFunctionNotBetween
                    'INASCENDING': 21,
                    'NOTINASCENDING': 23
            },
            
            FN : {
                    'EQUALS' :6,
                    'NOTEQUALS' :7,
                    'GREATERTHAN' :8,
                    'GREATERTHANEQUALS' :10,
                    'LESSTHAN' :9,
                    'LESSTHANEQUALS' :11,
                    'BETWEEN' :17,
                    'NOTBETWEEN' :44,
                    'ISNULL' :54,
                    'ISNOTNULL' :55,
                    'IN' :22,
                    'NOTIN' :57,
                    'CONTAINS' :76,
                    'NOTCONTAINS' :79,
                    'BEGINSWITH' :77,
                    'NOTBEGINSWITH' :80,
                    'ENDSWITH' :78,
                    'NOTENDSWITH' :81,
                    'LIKE' :18,
                    'NOTLIKE' :43,
                    'AND' :19,
                    'OR' :20,
                    'NOT' :21,
                    'RANK' :23,
                    'RANKPERCENT' :59,
                    'TUPLE' :1000
            },
            
            F: [
                [6, 7, 8, 10, 9, 11, 17, 44, 22, 57, 54, 55], //Generic function IDs;
                [15, 16, 4, 18, 20, 1, 13, 14, 22, 24], //highest
                [7, 8, 5, 17, 19, 2, 3, 6, 21, 23] //lowest
            ],
                  
            getQuaByFunc: function(f, ft) {
                var $F = this.F, 
                $Q = this.Q,
                $A = mstrmojo.array;
                
                var isTop = function(f) {
                    if ($A.indexOf($F[1], f) !== -1) {
                        return true;
                    } else { 
                        return false;
                    } 
                };
                
                if (ft === undefined || ft == this._GENERIC) { 
                    return $Q._G;
                    } else {
                    if (isTop(f)) {
                        return (ft == this._RANK)? $Q._RT : $Q._PT;
                    } else {
                        return (ft == this._RANK)? $Q._RB : $Q._PB;
                    }
                }
            },
            
            getFuncInfo: function(operator, qualify) {
                var ft, f;
                switch(qualify) {
                case  this.Q._G:
                    ft = this._GENERIC;
                    f = 0;
                    break;

                case this.Q._RT:
                    ft = this._RANK;
                    f = 1;
                    break;

                case this.Q._RB:
                    ft = this._RANK;
                    f = 2;
                    break;

                case this.Q._PT:
                    ft = this._PERCENT;
                    f = 1;
                    break;

                case this.Q._PB:
                    ft = this._PERCENT;
                    f = 2;
                    break;

                default:
                    return {};
                }
                        
                return {
                    ft: ft,
                    f: this.F[f][operator]
                };

            },
            
            /***
             * Get the operator ID by function ID.
             */
            getOpIdxByfunc: function(f, ft) {
                if (!f || !ft) { return -1; }//0 is reserved.
                
                var $F = this.F, 
                $Q = this.Q,
                $A = mstrmojo.array,
                r = -1;
                
                switch(ft) {
                case  this._GENERIC:
                    r = $A.indexOf($F[0], f);
                    break;
                    
                case this._RANK:
                case this._PERCENT:
                    r =  $A.indexOf($F[1], f);
                    if (r == -1) { 
                        r = $A.indexOf($F[2], f);
                    }
                    break;
                    
                }
                return r;
            },
            
            getIncludeByOp: function(op){
                var o = this.OP;
                switch(op){
                case o._EQUALS: 
                case o._GREATER_EQUAL:
                case o._LESS_EQUAL:
                case o._BETWEEN:
                case o._IN:
                    return true;
                }
                return false;
            },
            
            formatNumber: function(qlfy, num, numFmts) { //same as editable mode
                if (qlfy == $M.Q._G)  {
                    var $N = mstrmojo.num;
                    return (numFmts.fm)? $N.formatByMask(numFmts.fm, num) : $N.format(numFmts.cat, numFmts.dp, numFmts.curr, num);
                } else if(qlfy == $M.Q._RB || qlfy == $M.Q._RT) {
                    return parseInt(num);
                } else if (qlfy == $M.Q._PB || qlfy == $M.Q._PT ) {
                    return parseFloat(num) + '%';
                }
            }
        });

var $M = mstrmojo.MCSUtil,
$V = mstrmojo.validation,
$E = mstrmojo.expr,
$NM = mstrmojo.num,
allOprs =   [{n: mstrmojo.desc(2795, "Equals"), v:$M.OP._EQUALS},
          {n: mstrmojo.desc(2796, "Does not equals"), v: $M.OP._NOT_EQUALS},
          {n: mstrmojo.desc(521, "Greater than"), v: $M.OP._GREATER},
          {n: mstrmojo.desc(522, "Greater than or equal to"), v:$M.OP._GREATER_EQUAL},
          {n: mstrmojo.desc(523, "Less than"), v: $M.OP._LESS},
          {n: mstrmojo.desc(524, "Less than or equal to"), v: $M.OP._LESS_EQUAL},
          {n: mstrmojo.desc(519, "Between (enter value1;value2)"), v: $M.OP._BETWEEN},
          {n: mstrmojo.desc(614, "Not between (enter value1;value2)"), v: $M.OP._NOT_BETWEEN},
          {n: mstrmojo.desc(898, "In (enter value1;value2; ...;valueN)"), v: $M.OP._IN},
          {n: mstrmojo.desc(2394, "Not In (enter value1;value2; ...;valueN)"), v: $M.OP._NOT_IN},
          {n: mstrmojo.desc(2202, "Is null"), v: $M.OP._IS_NULL},
          {n: mstrmojo.desc(2203, "Is not null"), v: $M.OP._IS_NOT_NULL}],
oprs = allOprs.slice(0, 10),
cellCss = "padding:2px 2px 2px 2px",
oprsNull = allOprs.slice(10, 12);



/***
 * validate input value
 */
var checkRange = function(v, r, isPercent, unary, category) {
    if (category == 2) return r; // no validate for date category
    
    var vs = String(v).split(";"),
    invalid = $V.STATUSCODE.INVALID_VALIDATOR,
    valid = $V.STATUSCODE.VALID;
    
    if (unary && vs && vs.length >1) {
        r.code = invalid;
    } else {
        for (var i = 0; i < vs.length; i++) {
            var _v = parseFloat(vs[i], 10);
            if ( isNaN(_v) || 
                    (isPercent && (vs[i].match(/^\d+%$/) == null || _v < 0 || _v > 100) ) ||
                    (!isPercent && vs[i].match(/\d+$/) == null)) {
                r.code = invalid;
            }
            if (r.code != valid) break;
        }
    }
    
    if (r.code != valid) {
        r.msg = mstrmojo.desc(6103, "Please fix any invalid data");
    }
    return r;
};

var calcTxtWidth = function(fs){
    fs = parseFloat(fs);
    if(isNaN(fs)){
        return "54px";
    }else{
        return (fs * 72 / 16) + "pt;";
    }
},
txtFontChange = function(me){
    if (me.hasRendered) {
        var s = me.domNode.style;
        s.font = me.font;
        s.width = calcTxtWidth(s.fontSize);
    } else {
        var m = me.font.match(/[^\s]*?pt/) || [];
        me.cssText = me.cssText + " font:" + me.font + "; width:" + calcTxtWidth(m[0]);
    }
},
isNumericDT = function(dt){
    if((dt >= 8 && dt <= 16) || (dt >= 23 && dt <= 25) || dt == 30){
        return false;
    }
    return true;
};

 mstrmojo.MetricQualification = mstrmojo.declare(
         //superclass
         mstrmojo.Table, 
         //mixins
         null, 
         {
             scriptClass: "mstrmojo.MetricQualification",
             cssClass: "qs",
             cssText: "width:100%",
             markupMethods: {
                 onvisibleChange: function() { this.domNode.style.display = this.visible ? mstrmojo.css.DISPLAY_TABLE : 'none'; }
             },
             
             getClientHeight: function getClientHeight(){
                 return this.domNode.clientHeight + 2;//include border width.
             },
             
             rows: 1,
             cols: 4,
             layout: [{cells: [{cssText: "width:100%"}, {cssText: "width:56px"}, {cssText: "width:56px"}, {cssText: "width:18px"}]}], 
             init: function(props) {
                 if (this._super)
                     this._super(props);
                 
                 this._init();
             },
             
             _init: function(reset) {
                 switch(this.qua) {
                 case 0:
                     this.low = (this.da && this.da.low) || 0;
                     this.high = (this.da && this.da.high) || 0;
                     break;
                     
                 case 1:
                 case 2: 
                     this.low = 1;
                     this.high  = (this.da && this.da.cnt) || 0;
                     break;
                     
                 case 3:
                 case 4:
                     this.low = 0;
                     this.high = 100;
                     break;
                 }
                 
                 
                 if (reset) {
                     this.cs = [];
                     this.f = this.ft = null;
                 } 
                 var op=  $M.getOpIdxByfunc(this.f, this.ft),
                     opId;
                 if(this.qua == 0 || this.dt == 30){
                     opId = (op == $M.OP._IS_NOT_NULL || isNumericDT(this.dt)) ? (op == -1) ? $M.OP._GREATER_EQUAL : op : $M.OP._IS_NULL;
                 }else{
                     opId = (op == -1) ? $M.OP._GREATER_EQUAL : op;
                 }
                 
                 
                 this.set("opId", opId);
                 
                 var in_cs = (this.cs && this.cs.length > 0)? $NM.toLocaleString(this.cs[0].v) : "";
                 
                 if (this.opId ==  $M.OP._IN || this.opId ==  $M.OP._NOT_IN) {
                     for (var i = 1; i < this.cs.length; i++){
                         in_cs += ";" + $NM.toLocaleString(String(this.cs[i].v));
                     }
                 } else {
                     this.set("cs2", (this.cs && this.cs.length >1)? $NM.toLocaleString(this.cs[1].v) : "");
                 }
                 this.set("cs1", in_cs);
                 
                 this.vldTbL.validate();
                 this.vldTbH.validate();
                 
                 this.changeQual = false;
             },
             updateData: function udtDt(da, props){
                 this.da = da;
                 
                 //TQMS 467964: some properties moved from def block to data block.
                 // TODO: need to refactoring the object structure in the future.
                 this.updateExpr(props);                 
             },
             
             updateExpr: function udtEp(props) {
                 if (props) {
                     this.cs = props.cs;
                     this.f = props.f;
                     this.ft = props.ft;
                     this.qua = props.qua;
                 }
                 this._init();
             },
             
             onquaChange: function onqChg(evt){
                 this._init(true);
                 this.func.items = (this.qua!=0)? oprs : isNumericDT(this.parent.dt) ? allOprs : oprsNull;
                 this.func.refresh();
                 this.changeQual = true;
                 this.onchange();
             },
             
             children: [{
                 slot: "0,0",
                 alias:"func",
                 scriptClass: "mstrmojo.SelectBox",
                 cssText: "width:100%",
                 size:1,
                 bindings: {
                     sv: "this.parent.opId",
                     font: "this.parent.font"
                 },
                 
                 onfontChange:function(){
                     if (this.hasRendered) {
                         this.domNode.style.font = this.font; 
                     } else {
                         this.cssText = "width:100%;font:" + this.font;
                     }
                 },
                 onsvChange: function(){
                     if (this.sv !== null && this.sv !==undefined){
                         this.set('selectedItem', {v:this.sv});
                     }
                 },
                 postCreate: function(){
                     if (mstrmojo.dom.isIE) {
                         this.itemDisplayField = 'n';
                         this.showItemTooltip = true;
                     }
                     this.items = (this.parent.qua!=0)? oprs: isNumericDT(this.parent.dt) ? allOprs : oprsNull;
                 },
                 onchange: function() {
                     var p = this.parent,
                     itm = this.selectedItem;
                     if (itm && itm.v !== null && itm.v !== undefined) {
                         p.set("opId", itm.v);
                     }
                 }
                 
                 }, {
                 slot: "0,1",
                 alias: "vldTbL",
                 scriptClass : "mstrmojo.ValidationTextBox",
                 required: true,
                 dtp: $E.DTP.VARCHAR,
                 constraints: {
                     trigger: $V.TRIGGER.ALL,
                     validator: function(v){ 
                         var  r = {id: this.id, code: $V.STATUSCODE.VALID, msg: '' },
                         p = this.parent;
                         checkRange(v, r, (p.qua==3||p.qua==4),  (p.opId != 8 && p.opId !=9), p.numFmts.cat);
                         return r;
                     }
                 },
                 bindings: {
                     visible: "this.parent.opId!=10&&this.parent.opId!=11",
                     value: "this.parent.cs1",
                     font: "this.parent.font"
                 },
                 
                 onfontChange:function(){
                     txtFontChange(this);
                 },
                 
                 onValid: function() {
                     var p = this.parent,
                         box = this.domNode;
                     p.set("cs1", this.value);
                     
                     if(box && box.value.length > 6){
                         box.title = box.value;
                     }else if(box){
                         box.title = "";
                     }
                     
                 },
                 onvisibleChange: function() {
                     if(!this.visible){
                         this.parent.set("cs1", "");
                     }
                 },
                 onkeyup: function(evt){
                     var hWin = evt.hWin,
                         e = evt.e || hWin.event,
                         p = this.parent,
                         box = evt.src.domNode; 
                     if (e.keyCode === 13 && p.apply && p.apply.enabled){
                         p.apply.onclick();
                     }
                     
                 }
                 
             }, {
                 slot: "0,2",
                 alias: "vldTbH",
                 scriptClass : "mstrmojo.ValidationTextBox",
                 required: true,
                 dtp: $E.DTP.VARCHAR,
                 constraints: {
                     trigger: $V.TRIGGER.ALL,
                     validator: function(v){ 
                         var  r = {id: this.id, code: $V.STATUSCODE.VALID, msg: '' },
                         p = this.parent;
                         checkRange(v, r, (p.qua==3||p.qua==4),  (p.opId != 8 && p.opId !=9), p.numFmts.cat);
                         return r;
                     }
                 },
                 bindings : {
                     visible : "this.parent.opId ==7 ||this.parent.opId ==6", // 'Between' and 'Not Between'
                     value: "this.parent.cs2",
                     font: "this.parent.font"
                 },
                 
                 onfontChange:function(){
                     txtFontChange(this);
                 },
                 
                 onValid: function() {
                     this.parent.set("cs2", this.value);
                     
                     var box = this.domNode;
                     
                     if(box && box.value.length > 6){
                         box.title = box.value;
                     }else if(box){
                         box.title = "";
                     }
                 },
                 onvisibleChange: function() {
                     if(!this.visible){
                         this.parent.set("cs2", "");
                     }
                 },
                 onkeyup: function(evt){
                     var hWin = evt.hWin,
                         e = evt.e || hWin.event,
                         p = this.parent; 
                     if (e.keyCode === 13 && p.apply && p.apply.enabled){
                         p.apply.onclick();
                     }
                 }
                 
             },  {
                    slot: "0,3",
                    alias: "apply",
                    scriptClass : "mstrmojo.Button",
                    cssClass : 'icn apply',
                    bindings: {
                        enabled: "(!this.parent.vldTbL.visible ||!this.parent.vldTbL.validationStatus.code)"+
                        "&& (!this.parent.vldTbH.visible||!this.parent.vldTbH.validationStatus.code)"
                   },
                   
                    onclick: function(){
                        var p = this.parent,
                        isPercent = (p.qua == $M.Q._PT || p.qua == $M.Q._PB);
                        p.cs = [];
                        
                        var toPrcnt = function(v){
                            return v + ((isPercent && !String(v).match(/^\d+%$/))? '%' : '');
                        };
                        
                        var type = function(cat, qua){
                            return ((cat == 2 || cat == 3) && qua == 0)? 14 : 5;
                        };
                        
                        if (p.opId == $M.OP._IN || p.opId == $M.OP._NOT_IN){
                            var _cs = String(p.cs1).split(";");
                            for (var i = 0; i < _cs.length; i++) {
                                if(!mstrmojo.string.isEmpty(_cs[i])) p.cs.push({dtp:5, v: toPrcnt(_cs[i])});
                            }
                        }  else {
                            if (p.vldTbL.visible) p.cs.push({dtp: type(p.numFmts.cat, p.qua), v: toPrcnt(p.cs1)}); 
                            if (p.vldTbH.visible)  p.cs.push({dtp:  type(p.numFmts.cat, p.qua), v: toPrcnt(p.cs2)});
                        }
                        
                        if (p.onchange) {
                            p.onchange();
                        }
                    }
             }]
         });   
})();