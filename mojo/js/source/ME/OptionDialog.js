(function(){
mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.Editor",
        "mstrmojo.TabListContainer",
        "mstrmojo.TabNameList",
        "mstrmojo.StackContainer",
        "mstrmojo.DataGrid");

var _H = mstrmojo.hash,
_A = mstrmojo.array,
_B = mstrmojo.Button;

//Constants
var btnClr = '#999',
btnCls = 'mstrmojo-Editor-button',

//True and False 
TandF = [{n: mstrmojo.desc(4114), v: '-1'}, {n: mstrmojo.desc(4115), v: '0'}],

//EnumDSSXMLDataType
DT= {
    'Unknown' : -1,
    'Reserved' : 0,
    'Integer' : 1,
    'Unsigned' : 2,
    'Numeric' : 3,
    'Decimal' : 4,
    'Real' : 5,
    'Double' : 6,
    'Float' : 7,
    'Char' : 8,
    'VarChar' : 9,
    'LongVarChar' : 10,
    'Binary' : 11,
    'VarBin' : 12,
    'LongVarBin' : 13,
    'Date' : 14,
    'Time' : 15,
    'TimeStamp' : 16,
    'NChar': 17,
    'NVarChar': 18,
    'Short' : 21,
    'Long' : 22,
    'MBChar' : 23,
    'Bool' : 24,
    'Pattern' : 25,
    'BigDecimal' : 30
},

DataTypes = [{n: mstrmojo.desc(2171), v: DT.Reserved}, //Descriptor: Default
             {n: mstrmojo.desc(5471), v: DT.BigDecimal},//Descriptor: Big decimal
             {n: 'Binary', v: DT.Binary},//Descriptor: Binary
             {n: 'Char', v: DT.Char},//Descriptor: Char
             {n: mstrmojo.desc(2052), v: DT.Date},//Descriptor: Date
             {n: 'Decimal', v: DT.Decimal},//Descriptor: Decimal
             {n: mstrmojo.desc(2265), v: DT.Double},//Descriptor: Double
             {n: mstrmojo.desc(8002), v: DT.Float},//Descriptor: Float
             {n: 'Integer', v: DT.Integer},//Descriptor: Integer
             {n: 'Long VarBin', v: DT.LongVarBin},//Descriptor: Long VarBin
             {n: 'Long VarChar', v: DT.LongVarChar},//Descriptor: Long VarChar
             {n: 'NChar', v: DT.NChar},//Descriptor: NChar
             {n: 'NVarChar', v: DT.NVarChar},//Descriptor: NVarChar
             {n: mstrmojo.desc(1395), v: DT.Numeric},//Descriptor: Numeric
             {n: 'Real', v: DT.Real},//Descriptor: Real
             {n: mstrmojo.desc(2170), v: DT.Time},//Descriptor: Time
             {n: 'TimeStamp', v: DT.TimeStamp},//Descriptor: TimeStamp
             {n: 'Unsigned', v: DT.Unsigned},//Descriptor: Unsigned
             {n: 'VarBin', v: DT.VarBin},//Descriptor: VarBin
             {n: 'VarChar', v: DT.VarChar}//Descriptor: VarChar
],

//MetricPropertyDefaults.properties
PrsDID = {
        'AnalyticalEngineProperties': 'E3796B516F8611D3858D00C04F685B39',
        'DatamartProperties': '1DB1A6268E9B11D485E900C04F685B52',
        'VLDBSelect': 'A2185AB0DD7C11D29FE500C04F8E7129',
        'VLDBFunction': 'A2185AB6DD7C11D29FE500C04F8E7129',
        'VLDBReport': 'A2185AB1DD7C11D29FE500C04F8E7129'
}, 

/*
 *  NOTICE: The property names are not compatible with i-server, which contains spaces. 
 * Client can only uses pri (property id, not name) in saving xml. Definition in MetricPropertyDefaults.properties
 * For example:
 * Not support: <pr n='xxx' v=''>
 * Support: <pr pri='3' v=''>
 */
PrIDs = {
        'NullCheckingForAnalyticalEngine': 3,
        'SubtotalDimensionalityAware': 7,
        'DatamartTableColumnAlias': 9,
        'IntegerConstantInMetric': 38,
        'TransformableAggMetric': 84,
        'NoNullsInMetricForCubeReuse': 72,
        'MetricJoinType': 9,
        'NullCheck': 2,
        'ZeroCheck': 4,
        'CountDistinctwithPartitions': 24
},
/*
 * Reserved system function ID: Aggregation and Total.
 */
RsrvSysFunc = {
        agg: "F225147A4CA0BB97368A5689D9675E73",
        total: "96C487AF4D12472A910C1ACACFB56EFB"
},
/**
 * Model Properties name list for Option dialog 
 */
OptionProps =  ['sbs', 'prss', 'mps', 'datp'];

//Private methods
var _createRightPanel = function(ps) {
   return _H.copy(
           ps,
          {
               scriptClass: 'mstrmojo.Container',
               markupString: '<div id={@id} class="{@cssClass}" style="{@cssText}"></div>',
               cssClass: 'mstrmojo-FormatEditor-rightPanel',
               markupSlots: {
                   containerNode: function() { return this.domNode; }
               },
               markupMethods: {
                   onvisibleChange: function() { 
                        this.domNode.style.display = this.visible ? 'block' : 'none'; 
                   }
               },
               useAnimate: true,
               width: '420px',
               ease: "mstrmojo.ease.sin"
           });
},
_createTitle = function(n, ps){   
    return _H.copy(ps, _createLabel(n, {
        cssClass: 'mstrmojo-OptionEditor-Title'
    }));
},
_createLabel = function(n, ps){   
    return _H.copy(ps, {
             scriptClass: 'mstrmojo.Label',
             cssClass: 'mstrmojo-OptionEditor-Label',
             text: n
         });
},
_createPulldown = function(items, ps){   
    return _H.copy(ps, {
        scriptClass: 'mstrmojo.Pulldown',
        cssClass: 'mstrmojo-FormatEditor-DropDownButton',
        items: items
    });
},
_createCheckbox = function(n, ps){   
    return _H.copy(ps, {
        scriptClass: 'mstrmojo.ImageCheckBox',
        cssClass: 'mstrmojo-OptionEditor-Checkbox mstrmojo-ImageCheckBox',
        label: n
    });
},
_createRadioButton = function(n, ps){   
    return _H.copy(ps, {
        scriptClass: 'mstrmojo.RadioButton',
        cssClass: 'mstrmojo-OptionEditor-RadioButton',
        label: n
    });
},
_createRadioButtonWithImage = function(n, containerPs,  ps, imagePs){
    return _H.copy(containerPs, {
        scriptClass: 'mstrmojo.HBox',
        cssText: 'width: 100%',
        children: [_createRadioButton(n, ps),  
                   _H.copy(imagePs, { scriptClass: 'mstrmojo.Label'})]});
},
_createShortTextBox = function(ps){   
    return _H.copy(ps, {
        scriptClass: 'mstrmojo.TextBox',
        cssClass: 'mstrmojo-OptionEditor-shortTextBox'
    });
},
setPr = function(model, prss, prs, pr, n, v){
    model = model || {};
    model[prss] = model[prss] || {};
    model[prss][prs] = model[prss][prs] || {did: PrsDID[prs] || ''};
    model[prss][prs][pr] = model[prss][prs][pr] || {};
    model[prss][prs][pr][n] = v;
    model[prss][prs][pr].pri = model[prss][prs][pr].pri || PrIDs[pr] || 0;//Make sure pri is saved for pr.
},
setPulldownValue = function(model, prss, prs, pr, v){
    if(model){
        var isDefault = v == '-2',
        prl = [{n: 'pru', v: isDefault? '1' : '0'}];
        
        if(!isDefault) {
            prl.push({n: 'v', v: v});
        }
        for(var i = 0; i< prl.length; i++){
            setPr(model, prss, prs, pr, prl[i].n, prl[i].v);
        }
    }
};

//Panels
var generalTab = mstrmojo.insert(_createRightPanel({
    n: mstrmojo.desc(295),
    children: [_createTitle(mstrmojo.desc(295)),{
        scriptClass: 'mstrmojo.HBox',
        children: [
                   _createLabel('Dynamic aggregation function:'),
                   _createPulldown(null, {
                       cssText: 'width:180px',
                       bindings: {
                           items: 'this.parent.parent.model.funcPd',
                           value: function(){
                               var m = this.parent.parent.model;
                               if(!m || !m.sbs) { return RsrvSysFunc.agg;}
                               if(!m.sbs.agg || !m.sbs.agg.did) { return -1; }
                               
                               var did = this.parent.parent.model.sbs.agg.did;
                               return did || RsrvSysFunc.agg;
                           }
                       },
                       onvalueChange: function(){
                           var m = this.parent.parent.model,
                           si = this.selectedItem;
                           if(m && si){
                               m.sbs = m.sbs || {};
                               m.sbs.agg = m.sbs.agg || {};
                               var agg = m.sbs.agg;
                               if(this.value == -1){
                                   delete m.sbs.agg;
                               } else {
                                   agg.did = si.dssid;
                                   agg.t = si.tp;
                                   agg.st = si.stp;
                               }
                           }
                       },
                       onitemsChange: function(){
                           if(this.items && this.items.length >0){
                               this.refresh();
                           }
                       }
                   })]
    }, 
    _createCheckbox( 'Allow smart metric', {
        bindings: {
            checked: function(){
                var m = this.parent.model,
                mps = m && this.parent.model.mps,
                stl = mps && this.parent.model.mps.stl;
                return !m || !mps || stl == null || stl ==3;
            },
            enabled: '!this.parent.model.mps||this.parent.model.mps.cbs==true||this.parent.model.isValidExpr==1'
        },
        onclick: function(){
            if(this.parent.model){
                var m = this.parent.model;
                m.mps = m.mps || {};
                m.mps.stl = this.checked? 3 : 2;
            }
        }
    })]
})),

subtotalTab = mstrmojo.insert(_createRightPanel({
    n: mstrmojo.desc(1912),
    children: [_createTitle(mstrmojo.desc(1912)), {
        scriptClass: 'mstrmojo.HBox',
        children: [_createLabel('Default function for report subtotals:'), 
                   _createPulldown(null, {
                       cssText: 'width:180px',
                       bindings: {
                           items: 'this.parent.parent.model.funcPd',
                           value:  function(){
                               var m = this.parent.parent.model;
                               if(!m || !m.sbs) { return RsrvSysFunc.total;}//new metric
                               if(!m.sbs.tot || !m.sbs.tot.did) { return -1; }//None
                               
                               var did = this.parent.parent.model.sbs.tot.did;
                               return did || RsrvSysFunc.total;
                           }
                       },
                       onvalueChange: function(){
                           var m = this.parent.parent.model,
                           si = this.selectedItem;
                           if(m && si){
                               m.sbs = m.sbs || {};
                               m.sbs.tot = m.sbs.tot || {};
                               var tot = m.sbs.tot;
                               if(this.value == -1){
                                   delete m.sbs.tot;
                               } else {
                                   tot.did = si.dssid;
                                   tot.t = si.tp;
                                   tot.st = si.stp;
                               }
                           }
                       },
                       onitemsChange: function(){
                           if(this.items && this.items.length >0){
                               this.refresh();
                           }
                       }
                   })]
        }, {
            scriptClass: 'mstrmojo.DataGrid',
            cssClass: 'mstrmojo-OptionEditor-subtotal-func-grid',
            resizableColumns: false,
            columns:[{
                         dataWidget: { 
                             scriptClass: 'mstrmojo.ImageCheckBox',
                             cssClass: 'cb-grid',
                             bindings: {
                                 checked: function(){
                                     var avs = this.dataGrid.parent.model.sbs.avs,
                                     dssid = this.data.dssid
                                     return _A.find(avs, 'did', dssid) != -1;
                                 }
                             },
                             onclick: function(){
                                 var m = this.dataGrid.parent.model,
                                 sbs = m.sbs = m.sbs || [],
                                 avs = m.sbs.avs = m.sbs.avs || [],
                                 data = this.data,
                                 dssid = data.dssid,
                                 t = data.tp,
                                 st = data.stp;
                                 if(this.checked){
                                     _A.insert(avs, null, [{did: dssid, t: t, st: st}]);
                                 } else {
                                     var idx = _A.find(avs, 'did', dssid);
                                     if (idx != -1) { _A.removeIndices(avs, idx, 1);}
                                 }
                                 m.sbs.avs = avs;
                             }
                         },
                         colCss:'cb'
                      },
                     {headerText:'Subtotal', dataField: 'n',colCss:'funcName'},
                     {headerText:'Description', dataField: 'desc',colCss:'expr'}
                     ],
           bindings: {
                items: 'this.parent.model.funcsDg'
           }
        }]
})),

vldbTab = mstrmojo.insert(_createRightPanel({
    n: 'VLDB Properties', //Descriptor: XXX
    id: 'VLDBProps',
    children: [{
        scriptClass: 'mstrmojo.Table',
        alias:'content',
        rows: 9,
        cols: 2,
        children: [_createLabel('Null checking for Analytical Engine:', {slot: '0,0'}), 
                   _createPulldown([{n: 'Inherit - true', v: '-2'}].concat(TandF), {
                       slot: '0,1', 
                       itemIdField: 'v',
                       bindings: {
                           value: function(){
                               var m = this.parent.parent.model.prss.AnalyticalEngineProperties.NullCheckingForAnalyticalEngine,
                               v = m.v,
                               pru = m.pru;
                               return pru=='1'? '-2' : v;
                           }
                       },
                       onvalueChange: function(){
                           setPulldownValue(this.parent.parent.model,  'prss', 'AnalyticalEngineProperties', 'NullCheckingForAnalyticalEngine', this.value);
                       }
                   }),
                   
                   _createLabel('Subtotal Dimensionality Aware:', {slot: '1,0'}), 
                   _createPulldown([{n: 'Inherit - true', v: '-2'}].concat(TandF), {
                       slot: '1,1',
                       itemIdField: 'v',
                       bindings: {
                           value: function(){
                               var m = this.parent.parent.model.prss.AnalyticalEngineProperties.SubtotalDimensionalityAware,
                               v = m.v,
                               pru = m.pru;
                               return pru=='1'? '-2' : v;
                           }
                       },
                       onvalueChange: function(){
                           setPulldownValue(this.parent.parent.model,  'prss', 'AnalyticalEngineProperties', 'SubtotalDimensionalityAware', this.value);
                       }}),
                       
                   _createLabel('Metric Validation:', {slot: '2,0'}), 
                   _createPulldown([{n: 'Inherit - Enable dynamic sourcing for metric', v: '-2'}, 
                                    {n: 'Enable dynamic sourcing for metric', v: '0'}, 
                                    {n: 'Disable dynamic sourcing for metric', v: '1'}], {
                       slot: '2,1',
                       itemIdField: 'v',
                       bindings: {
                           value: function(){
                               var m = this.parent.parent.model.prss.VLDBSelect.NoNullsInMetricForCubeReuse,
                               v = m.v,
                               pru = m.pru;
                               return pru=='1'? '-2' : v;
                           }
                       },
                       onvalueChange: function(){
                           setPulldownValue(this.parent.parent.model,  'prss', 'VLDBSelect', 'NoNullsInMetricForCubeReuse', this.value);
                       }}),
                  
                   _createLabel('Integer Constants in Metric:', {slot: '3,0'}), 
                   _createPulldown([{n: 'Inherit - Add \'.0\' to integer constants in metric expressions', v: '-2'}, 
                                    {n: 'Add \'.0\' to integer constants in metric expressions', v: '0'}, 
                                    {n: 'Do not add \'.0\' to integer constants in metric expressions', v: '1'}], {
                       slot: '3,1',                        
                       itemIdField: 'v',
                       bindings: {
                           value: function(){
                               var m = this.parent.parent.model.prss.VLDBSelect.IntegerConstantInMetric,
                               v = m.v,
                               pru = m.pru;
                               return pru=='1'? '-2' : v;
                           }
                       },
                       onvalueChange: function(){
                           setPulldownValue(this.parent.parent.model,  'prss', 'VLDBSelect', 'IntegerConstantInMetric', this.value);
                       }}),
                   
                   _createLabel('Metric Join type:', {slot: '4,0'}), 
                   _createPulldown([{n: 'Inherit - Inner Join', v: '-2'}, 
                                    {n: 'Inner Join', v: '0'}, 
                                    {n: 'Outer Join', v: '1'}], {  
                       slot: '4,1',
                       alias: "MetricJoinType",
                       itemIdField: 'v',
                       bindings: {
                           value: function(){
                               var m = this.parent.parent.model.prss.VLDBSelect.MetricJoinType,
                               v = m.v,
                               pru = m.pru;
                               return pru=='1'? '-2' : v;
                           }
                       },
                       onvalueChange: function(){
                           setPulldownValue(this.parent.parent.model,  'prss', 'VLDBSelect', 'MetricJoinType', this.value);
                       }}),
                   
                   _createLabel('Null check:', {slot: '5,0'}), 
                   _createPulldown([{n: 'Inherit - Check for NULL in all queries', v: '-2'}, 
                                     {n: 'Check for NULL in all queries', v: '0'}, 
                                     {n: 'Check for NULL in temp table join only', v: '1'}], 
                           {slot: '5,1', 
                           itemIdField: 'v',
                           bindings: {
                               value: function(){
                                   var m = this.parent.parent.model.prss.VLDBFunction.NullCheck,
                                   v = m.v,
                                   pru = m.pru;
                                   return pru=='1'? '-2' : v;
                               }
                           },
                           onvalueChange: function(){
                               setPulldownValue(this.parent.parent.model,  'prss', 'VLDBFunction', 'NullCheck', this.value);
                           }}),
                   
                   _createLabel('Transformable Agg Metric:', {slot: '6,0'}), 
                   _createPulldown([{n: 'Inherit - true', v: '-2'}].concat(TandF), 
                           {slot: '6,1',
                           itemIdField: 'v',
                           bindings: {
                               value: function(){
                                   var m = this.parent.parent.model.prss.VLDBSelect.TransformableAggMetric,
                                   v = m.v,
                                   pru = m.pru;
                                   return pru=='1'? '-2' : v;
                               }
                           },
                           onvalueChange: function(){
                               setPulldownValue(this.parent.parent.model,  'prss', 'VLDBSelect', 'TransformableAggMetric', this.value);
                           }}),
                   
                   _createLabel('Zero Check:', {slot: '7,0'}), 
                   _createPulldown([{n: 'Inherit - Check for zero', v: '-2'}, 
                                     {n: 'Do nothing', v: '0'}, 
                                     {n: 'Check for zero in all queries', v: '1'},
                                     {n: 'Check for zero in temp table join only', v: '2'}], 
                           {slot: '7,1',
                           itemIdField: 'v',
                           bindings: {
                               value: function(){
                                   var m = this.parent.parent.model.prss.VLDBFunction.ZeroCheck,
                                   v = m.v,
                                   pru = m.pru;
                                   return pru=='1'? '-2' : v;
                               }
                           },
                           onvalueChange: function(){
                               setPulldownValue(this.parent.parent.model,  'prss', 'VLDBFunction', 'ZeroCheck', this.value);
                           }}),
                   
                   _createLabel('Count Distinct :', {slot: '8,0'}), 
                   _createPulldown([{n: 'Inherit - Do not select distinct elements from each partition', v: '-2'}, 
                                    {n: 'Do not select distinct elements from each partition', v: '0'}, 
                                    {n: 'Select distinct elements from each partition', v: '1'}], 
                           {slot: '8,1',                            
                           itemIdField: 'v',
                           bindings: {
                               value: function(){
                                   var m = this.parent.parent.model.prss.VLDBReport.CountDistinctwithPartitions,
                                   v = m.v,
                                   pru = m.pru;
                                   return pru=='1'? '-2' : v;
                               }
                           },
                           onvalueChange: function(){
                               setPulldownValue(this.parent.parent.model,  'prss', 'VLDBReport', 'CountDistinctwithPartitions', this.value);
                           }})]
    }]
})),

columnTab = mstrmojo.insert(_createRightPanel({
    n: 'Colunm Options', //Descriptor: XXX
    children: [{
        scriptClass: 'mstrmojo.Table',
        rows: 5,
        cols: 1,
        children: [_createLabel('Column name used in SQL table creation:', {slot: '0,0'}), {
            slot: '1,0',
            scriptClass: 'mstrmojo.TextBox',
            bindings: {
                value: 'this.parent.parent.model.prss.DatamartProperties.DatamartTableColumnAlias.v'
            },
            onvalueChange: function(){
                if(this.parent.parent.model){
                    setPr(this.parent.parent.model, 'prss', 'DatamartProperties', 'DatamartTableColumnAlias', 'v', this.value || '');
                }
            }
        }, 
        _createLabel('Data Type:', {slot: '2,0'}), 
        _createPulldown(DataTypes, {slot: '3,0', alias: 'dt', itemIdField: 'v', 
            bindings: {
            value: "this.parent.parent.model.datp.ddt"
        },
        onvalueChange: function(){
            var m = this.parent.parent.model;
            if(m){
                m.datp = m.datp || {};
                m.datp.ddt = this.value;
            }
        }
        }), 
        {
            scriptClass: 'mstrmojo.Table',
            slot: '4,0', 
            rows: 2,
            cols: 2,
            children: [{
                scriptClass: 'mstrmojo.Label',
                slot: '0,0',
                alias: 'prec',
                cssClass: 'mstrmojo-OptionEditor-shortLabel',
                bindings: {
                    text: function(){
                        var dt = this.parent.parent.dt.value;
                        switch(dt){
                            case DT.BigDecimal: 
                            case DT.Decimal: 
                            case DT.Numeric: 
                                return 'Precision:';
                            case DT.Binary:
                            case DT.Integer:
                            case DT.LongVarBin:
                            case DT.LongVarChar:
                            case DT.NChar:
                            case DT.NVarChar:
                            case DT.Unsigned:
                            case DT.VarBin:
                            case DT.VarChar:
                                return 'Byte length:';
                            case DT.Time:
                            case DT.TimeStamp:
                                return 'Time Scale:';
                            default:
                                return '';
                        }
                    },
                    visible: '!!this.text'
                }
            },
           _createShortTextBox({
               slot: '0,1', 
               bindings: {
                   visible: 'this.parent.prec.visible',
                   value: 'this.parent.parent.parent.model.datp.prec'
               },
               onvalueChange: function(){
                   var m = this.parent.parent.parent.model;
                   if(m){
                       m.datp = m.datp || {};
                       m.datp.prec = this.value;
                   }
               }
           }),
           {
               scriptClass: 'mstrmojo.Label',
               slot: '1,0',
               alias: 'scl',
               cssClass: 'mstrmojo-OptionEditor-shortLabel',
               bindings: {
                   text: function(){
                       var dt = this.parent.parent.dt.value;
                       switch(dt){
                           case DT.BigDecimal: 
                           case DT.Decimal: 
                           case DT.Numeric: 
                               return 'Scale:';
                           default:
                               return '';
                       }
                   },
                   visible: '!!this.text'
               }
           },
           _createShortTextBox({
               slot: '1,1',
               bindings: {
                   visible: 'this.parent.scl.visible',
                   value: 'this.parent.parent.parent.model.datp.scl'
               },
               onvalueChange: function(){
                   var m = this.parent.parent.parent.model;
                   if(m){
                       m.datp = m.datp || {};
                       m.datp.scl = this.value;
                   }
               }
           })]
        }]
    }]
})),

joinTab = mstrmojo.insert(_createRightPanel({
    n: 'Joins',//Descriptor: XXX
    children: [{
        scriptClass: 'mstrmojo.Table',
        rows: 8,
        cols: 1,
        bindings: {
            mjt: "mstrmojo.all.VLDBProps.content.MetricJoinType.value",
            acj: "this.parent.model.mps.acj"
        },
        setMjt: function(v){
            mstrmojo.all.VLDBProps&&mstrmojo.all.VLDBProps.content.MetricJoinType.set('value', v);
        },
        setAcj: function(v){
            if(this.parent.model){
                var m = this.parent.model;
                m = m || {};
                m.mps = m.mps || {};
                m.mps.acj = v;
            }
        },
        children: [
                   //Metric Join
                   _createLabel('Metric Join', {slot: '0,0', cssClass:'boldLabel'}),
                   _createRadioButton('Default inherit value', 
                           { 
                               slot: '1,0',  
                               name: 'metricJoin', 
                               alias: 'mjDefault', 
                               bindings: {
                                   checked: '!this.parent.mjt||this.parent.mjt=="-2"'
                               }, 
                               onclick: function(){ 
                                   this.parent.setMjt('-2');
                                   }
                               }),
                   _createRadioButtonWithImage('Inner Join - use information common to all elements', 
                           {slot: '2,0', alias: 'mjInner'}, 
                           { 
                               name: 'metricJoin', 
                               alias: 'rb', 
                               bindings: {
                                   checked: 'this.parent.parent.mjt=="0"'
                               }, 
                               onclick: function(){ 
                               this.parent.parent.setMjt('0');
                               }
                           },  
                           {cssClass: 'innerJoin'}),
                   _createRadioButtonWithImage('Outer Join - use all information to all elements', 
                           {slot: '3,0', alias: 'mjOuter'}, 
                           {
                               name: 'metricJoin', 
                               alias: 'rb', 
                               bindings: {
                                   checked: 'this.parent.parent.mjt=="1"'
                               }, 
                               onclick: function(){ 
                               this.parent.parent.setMjt('1'); 
                               }
                           }, 
                           {cssClass: 'outerJoin'}),
                       
                   //Metric Formula Join
                   _createLabel('Metric Formula Join', {slot: '4,0', cssClass:'boldLabel'}),
                   _createRadioButton('Default inherit value', 
                           {
                               slot: '5,0', 
                               name: 'metricFormalaJoin', 
                               bindings: { 
                                   checked: '!this.parent.acj||this.parent.acj==1' 
                               }, 
                               onclick: function(){ 
                                   this.parent.setAcj(1);
                                }
                           }),
                   _createRadioButtonWithImage('Inner Join - use information common to all elements', 
                           {slot: '6,0'},  
                           {
                               name: 'metricFormalaJoin',  
                               bindings: { 
                                   checked: 'this.parent.parent.acj==2' 
                               }, 
                               onclick: function(){ 
                                   this.parent.parent.setAcj(2);
                               }
                           }, 
                           {cssClass: 'innerJoin'}),
                   _createRadioButtonWithImage('Outer Join - use all information to all elements', 
                           {slot: '7,0'}, 
                           {
                               name: 'metricFormalaJoin', 
                               bindings: { 
                                   checked: 'this.parent.parent.acj==3' 
                               }, 
                               onclick: function(){
                                   this.parent.parent.setAcj(3);
                               }
                           }, 
                           {cssClass: 'outerJoin'})]
    }]
}));

        mstrmojo.ME.OptionDialog = mstrmojo.declare(
                //superclass
                mstrmojo.Editor,
                //mixins
                null,
                {
                    scriptClass: 'mstrmojo.ME.OptionDialog',
                    cssClass: 'mstrmojo-OptionEditor mstrmojo-FormatEditor',
                    onOpen: function(){
                            if(!this.model) { this.model = {}; }
                            
                            //copy model
                            this.cloneModel = this.cloneModel || {};
                            _H.make(this.cloneModel, mstrmojo.Obj);
                            var cm = this.cloneModel, 
                            m = this.model;
                            for(var i = 0; i< OptionProps.length; i++){
                                cm.set(OptionProps[i], _H.clone(m[OptionProps[i]]));
                            }
                            
                            //notify each tab
                            var ch = this.tabCtr.ctr.children;
                            for(var i = 0; i < ch.length; i++){
                                ch[i].set('model', this.cloneModel);
                            }
                            
                            //Get expression valid status
                            this.cloneModel.set('isValidExpr', this.opener.metricEditBox.vStatus);
                            
                            //Function List
                            var fs = this.funcs,
                            funcsDg = this.funcsDg || _A.filter(fs, function(item){
                                return item.dssid != RsrvSysFunc.agg && item.dssid != RsrvSysFunc.total
                                });
                            funcPd = this.funcPd || _A.insert(
                                    _H.clone(_A.filter(fs, function(item) { 
                                        return parseInt(item.stp) == 1026; 
                                        })), 
                                    0, 
                                    [{n: mstrmojo.desc(2057), dssid: -1}]);//Add Descriptor: None
                            
                            cm.set('funcsDg', funcsDg);
                            cm.set('funcPd', funcPd);
                            
                            //create new metric
                            if(!this.model.did){
                                for(var i = 0; i< OptionProps.length; i++){
                                    delete cm[OptionProps[i]];
                                }
                                
                                //Create default sbs model
                                if(fs && fs.length >0){
                                    var avs = [];
                                    for(var i = 0; i< fs.length; i++){
                                        var itm=fs[i];
                                        if(itm.dssid != RsrvSysFunc.agg && itm.dssid != RsrvSysFunc.total && parseInt(itm.stp) == 1026){
                                            avs.push({did: itm.dssid, t: itm.tp, st: itm.stp});
                                        }
                                    }
                                    
                                    this.cloneModel.set('sbs', {//dm structure is static and required by SDK.
                                        tot: {
                                            did: RsrvSysFunc.total, 
                                            dm: { did: RsrvSysFunc.total, t: 4, st: 1026}
                                        },
                                        agg: {
                                            did: RsrvSysFunc.agg,
                                            dm: { did: RsrvSysFunc.agg, t: 4, st: 1026 }
                                        },
                                        avs: avs});
                                }
                            }
                    },
                    onOK: function(){ //Save optionDialog model to metricEditor
                        var m = this.model,
                        cm = this.cloneModel;
                        m.prss = cm.prss;
                        m.mps = cm.mps;
                        m.sbs = cm.sbs;
                        m.datp = cm.datp;
                    },
                    children: [{
                        scriptClass: 'mstrmojo.TabListContainer',
                        alias: 'tabCtr',
                        listCssClass: 'mstrmojo-FormatEditor-leftPanel',
                        children: [{
                            scriptClass: 'mstrmojo.TabNameList',
                            cssClass: 'mstrmojo-FormatEditor-formatList',
                            itemMarkup:  '<div class="mstrmojo-FormatEditor-bullet">' + 
                                            '<div class="mstrmojo-text">{@n}</div>' + 
                                            '</div>',
                            slot: 'top',
                            _ontargetChange: function(){
                                this.set('selectedIndex', 0);
                            }
                        }, {
                            scriptClass: 'mstrmojo.StackContainer',
                            alias: 'ctr',
                            cssClass: 'mstrmojo-FormatEditor-rightPanel-container',
                            children: [generalTab, subtotalTab, vldbTab, columnTab, joinTab],
                            slot: 'stack'
                        }]
                    },{
                      //ButtonBar
                        scriptClass: "mstrmojo.HBox",
                        cssClass: "mstrmojo-Editor-buttonBar",
                        children: [
                                       new _B.newInteractiveButton (
                                               mstrmojo.desc(2397), //Descriptor: OK 
                                               function() {
                                                   var editor = this.parent.parent;
                                                   editor.close();
                                                   editor.onOK && editor.onOK();
                                               }, 
                                               btnClr, 
                                               {alias: 'btnOk', cssClass: btnCls}
                                       ),
                                       new _B.newInteractiveButton (
                                               mstrmojo.desc(2399), //Descriptor: Cancel 
                                               function(){
                                                   var editor = this.parent.parent;
                                                   editor.close();
                                               }, 
                                               btnClr, 
                                               { alias: 'btnCancel',cssClass: btnCls}
                                       )
                                  ]
                    }]
                });

})();