/**
 * General setting for BlackBerry
 */
(function(){

    mstrmojo.requiresCls(
            'mstrmojo.mobileConfigUtil',
            "mstrmojo.Table",
            "mstrmojo.ValidationTextBox",
            "mstrmojo.SelectBox",
            "mstrmojo.CheckBox",
            "mstrmojo.FieldSet");
    
    //Util
    var util = mstrmojo.mobileConfigUtil,       
        _H = mstrmojo.hash,
        _TR = mstrmojo.validation.TRIGGER,
        _DTP = mstrmojo.expr.DTP,
        _SC = mstrmojo.validation.STATUSCODE;
    
    var label = function(name, props){
        return _H.copy(props, {
            scriptClass: 'mstrmojo.Label',
            text: name,
            cssClass: 'blackberry-category'
        });
    },
    pulldown = function(items, prNm, props, bindings){
        var bind = _H.copy(bindings, {
            selectedItem: '{v:mstrmojo.all.BlackBerry_tab.model.data.gnl.' + prNm + '.v}'
        });
        
        return _H.copy(props, {
            scriptClass: 'mstrmojo.SelectBox',
            showItemTooltip: true,
            size: 1,
            items: items,
            bindings: bind,
            onchange: function() {
                if(mstrmojo.all.BlackBerry_tab.model){
                    mstrmojo.all.BlackBerry_tab.model.data.gnl[prNm].v = this.selectedItem.v;
                }
            }
        });
    },
    validationTextBox = function(prNm, bindings, constraints,  props){
        var bind = _H.copy(bindings, {
            value: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.' + prNm + '.v'
        }),
        cons = _H.copy(constraints, {
            trigger: _TR.ALL
        });
        
        return _H.copy(props, {
            scriptClass: 'mstrmojo.ValidationTextBox',
            required: true,
            dtp: _DTP.INTEGER,
            constraints: cons,
            bindings: bind,
            onValid: function() {
                var model = mstrmojo.all.BlackBerry_tab.model;
                if(model){
                    util.setValidValue(model.data.gnl[prNm], 'v', this.getRealModelValue? this.getRealModelValue(this.value) : this.value);
                    model.validate();
                }
                if(this.validHook) {this.validHook();}
            },
            onInvalid: function(){
                var model = mstrmojo.all.BlackBerry_tab.model;
                if (model) {
                  delete model.data.gnl[prNm].v;
                  model.validate();
                }
                if(this.InvalidHook) {this.InvalidHook();}
            }
        });
    },
    checkbox = function(prNm, label, bindings, props){
        var bind = _H.copy(bindings, {
            checked: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.' + prNm + '.v'
        });
        
        return _H.copy(props,{
            scriptClass: 'mstrmojo.CheckBox',
            label: label,
            bindings: bind,
            cssDisplay: 'block',
            onclick: function(){
                util.setValidValue(mstrmojo.all.BlackBerry_tab.model.data.gnl[prNm], "v", this.checked);
            }
        });

    },
    onLimitCheckBox = function(prNm, name, props, noLimitValue){
        var nlv = noLimitValue != null? noLimitValue : -1; 
        return _H.copy(props, {
            scriptClass: 'mstrmojo.CheckBox',
            label: mstrmojo.desc(8794),//'No Limit'
            bindings: {
                checked: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.' + prNm +'.v==' + nlv
            },
            onclick: function(){
                var vtb = this.parent[name];
                if(this.checked){
                    vtb.set('value', nlv);
                }
                vtb.set('enabled', !this.checked);
            }
        });
    };
    
    var deviceMinFreeMem = [{n: '1%', v: 1},
                            {n: '5%', v: 5},
                            {n: '10%', v: 10},
                            {n: '15%', v: 15},
                            {n: '25%', v: 25},
                            {n: '30%', v: 30}],
    tcpModes = [{n: mstrmojo.desc(959), v: 1},// 'Default'
                {n: mstrmojo.desc(8772), v: 2},//'MDS Proxy'
                {n: mstrmojo.desc(8773), v: 3}],//'Direct'
    tlsModes =  [{n: mstrmojo.desc(959), v: 1},// 'Default'
                 {n: mstrmojo.desc(8774), v: 2},//'End-to-End TLS Desired'
                 {n: mstrmojo.desc(8775), v: 3}];//'End-to-End TLS Required'
    
    //UI
    mstrmojo.BlackBerry_tab = mstrmojo.insert({
        scriptClass: "mstrmojo.Table",
        cssText: "width:600px",
        cssClass: 'BlackBerry-general',
        
        n: mstrmojo.desc(8766),//"BlackBerry Settings",
        id: "BlackBerry_tab",
        
        model: null,
        layout: [{cells: [{cssText:'width:150px'}, {colSpan:2}]}, 
                 {cells: [{cssText:'width:150px'}, {colSpan:2}]}, 
                  {cells: [{cssText:'width:150px'}, {cssText:'width:180px'}, {cssText: 'width:270px'}]},
                  {cells: [{cssText:'width:150px'}, {colSpan:2}]},
                  {cells: [{colSpan: 3}]},
                  {cells: [{colSpan: 3}]}], 
        
        children: [
                   label(mstrmojo.desc(295), {slot: '0,0'}),//'General'
                   checkbox('ums', mstrmojo.desc(8767), null, {slot: '0,1'}),//'Allow user to modify settings from device'
                   checkbox('rtu', mstrmojo.desc(8768), null,{slot: '1,1'}),// 'Allow user to configure Real-Time Updates'
                   
                   label(mstrmojo.desc(8769), {slot: '2,0'}),//'Report Storage'
                   label(mstrmojo.desc(8770), {slot: '2,1', cssClass: 'propName'}),//'Device Minimun Free Memory' 
                   pulldown(deviceMinFreeMem, 'mff', {slot: '2,2'}),
                   label(mstrmojo.desc(8771), {slot: '3,1', cssClass: ''}),//'Application will not save a given report if it causes device memory to go below this percentage.'
                   
                   {
                       scriptClass: 'mstrmojo.Panel',
                       slot: '4,0',
                       title: mstrmojo.desc(8776),//'Show Advanced Settings'
                       showTitlebar: true,
                       state: 0,
                       onstateChange: function(){
                           this.set('title', (this.state === 0)? mstrmojo.desc(8776) : mstrmojo.desc(8777));//'Show Advanced Settings''Hide Advanced Settings'
                       },
                       children: [{
                           scriptClass: 'mstrmojo.VBox',
                           children: [
                                      /**----------------------Network Parameters----------------------**/
                                      {
                                          scriptClass: 'mstrmojo.Table',
                                          cssClass:'categoryTable',
                                          layout: [{cells: [{cssText:'width:25%'}, {cssText:'width:30%'}, {cssText:'width:30%'}, {cssText:'width:15%'}]},
                                                   {cells: [{}, {}, {}, {}]},
                                                   {cells: [{}, {}, {}, {}]},
                                                   {cells: [{}, {}, {}, {}]},
                                                   {cells: [{},{colSpan: 3}]}],
                                          children: [
                                                     label(mstrmojo.desc(8778), {slot: '0,0'}),//'Network Parameters'
                                                     label(mstrmojo.desc(8779), {slot: '0,1', cssClass: 'propName'}),//'TCP Connection Mode'
                                                     pulldown(tcpModes, 'tcp', {slot: '0,2'}),
                                                     
                                                     label(mstrmojo.desc(8780), {slot:'1,1', cssClass: 'propName'}),//'TLS Connection Mode'
                                                     pulldown(tlsModes, 'tls', {slot: '1,2'}),
                                                     
                                                     label(mstrmojo.desc(8781), {slot: '2,1', cssClass: 'propName'}),//'Request Timeout'
                                                     validationTextBox('nrt', {
                                                         value: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.nrt.v/1000'
                                                     }, {
                                                         validator: function(v) {
                                                             v = parseInt(v);
                                                             return  ((v > 0 && v <= 9999) || v == -1)? 
                                                                     {id: this.id, code : _SC.VALID, msg: ''} :  
                                                                     {
                                                                 code: _SC.INVALID_VALIDATOR, 
                                                                 msg: mstrmojo.desc(8782, "Please enter a number between ## and ###").replace(/###/, 9999).replace(/##/, 1) + 
                                                                         mstrmojo.desc(8783, "# means use the device default value").replace(/#/, -1)};
                                                         }
                                                     },  {slot: '2,2',
                                                         getRealModelValue: function(v){
                                                             return v*1000;//From seconds to milliseconds.
                                                         }
                                                     }),
                                                     label(mstrmojo.desc(7773), {slot: '2,2', cssClass: 'unit', cssDisplay: 'inline'}),//seconds
                                                     
                                                     label(mstrmojo.desc(8784), {slot: '3,1', cssClass: 'propName'}),//'Push Listen Port'
                                                     validationTextBox('plp', null, {min: 0, max:65535},  {slot: '3,2'}),
                                                     label( mstrmojo.desc(8785), {slot: '4,1', cssClass: ''}),//'Please make sure to use a port that is not already taken by the system usage or another application.'
                                                     ]
                                      },
                                      
                                      /**----------------------Authentication----------------------**/
                                      {
                                          scriptClass: 'mstrmojo.Table',
                                          layout: [{cells: [{cssText:'width:25%'}, {colSpan:3}]},
                                                   {cells: [{}, {colSpan:3}]}],
                                          rows: 2,
                                          cols: 4,
                                          cssClass:'categoryTable',
                                          children: [
                                                     label(mstrmojo.desc(8786), {slot: '0,0'}),//'Authentication'
                                                     checkbox('wsc', mstrmojo.desc(8787) +' <span style="font-weight:bold">' + mstrmojo.desc(8788)  + '</span>', // 'Submit Web Server Credentials' ' Only When Challenged'
                                                             { checked:  'mstrmojo.all.BlackBerry_tab.model.data.gnl.wsc.v=="1"'}, 
                                                             {scriptClass: 'mstrmojo.RadioButton', slot: '0,1', name: 'wsc',
                                                                 onclick: function(){
                                                                 util.setValidValue(mstrmojo.all.BlackBerry_tab.model.data.gnl.wsc, "v",  this.checked? '1' : '2');
                                                             }}),
                                                     checkbox('wsc', mstrmojo.desc(8787) +' <span style="font-weight:bold">' + mstrmojo.desc(8789)+ '</span>', //'On Every Request'
                                                             { checked:  'mstrmojo.all.BlackBerry_tab.model.data.gnl.wsc.v=="2"'}, 
                                                             {scriptClass: 'mstrmojo.RadioButton', slot: '1,1', name: 'wsc',
                                                                 onclick: function(){
                                                                 util.setValidValue(mstrmojo.all.BlackBerry_tab.model.data.gnl.wsc, "v", this.checked? '2' : '1');
                                                             }})
                                           ]
                                      },
                                      
                                      /**----------------------Memory Management----------------------**/
                                      {
                                          scriptClass: 'mstrmojo.Table',
                                          cssClass:'categoryTable',
                                          layout: [{cells: [{cssText:'width:25%'}, {cssText:'width:30%'}, {cssText:'width:30%'}, {cssText:'width:15%'}]},
                                                {cells: [{},{colSpan: 3}]},
                                                {cells: [{},{colSpan: 3}]},
                                                {cells: [{}, {}, {}, {}]},
                                                {cells: [{}, {}, {}, {}]},
                                                {cells: [{}, {}, {}, {}]},
                                                {cells: [{}, {}, {}, {}]}],
                                          children: [
                                                     label(mstrmojo.desc(8790), {slot: '0,0'}),//'Memory Management'
                                                     label(mstrmojo.desc(8791), {slot: '0,1', cssClass: 'propName'}),//'Maximum Report Size'
                                                     validationTextBox('rsl', { enabled: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.rsl.v!=0'}, {
                                                         validator: function(v) {
                                                             v = parseInt(v);
                                                             return  ((v >= 0 && v <= 100000))? 
                                                                     {id: this.id, code : _SC.VALID, msg: ''} :  
                                                                     {code: _SC.INVALID_VALIDATOR, msg: mstrmojo.desc(8782, "Please enter a number between ## and ###").replace(/###/, 100000).replace(/##/, 0) + 
                                                                 mstrmojo.desc(8792).replace(/#/, 0)};//# means no limit
                                                         }
                                                     }, {slot: '0,2', alias: 'rsl'}),
                                                     label(mstrmojo.desc(8793), {slot: '0,2', cssClass: 'unit', cssDisplay: 'inline'}),
                                                     onLimitCheckBox('rsl', 'rsl', {slot: '0,3'}, 0),
                                                     
                                                     checkbox('slm',  mstrmojo.desc(8795), null, {slot: '1,1'}),//'Stop on Low Memory Notification'
                                                     label(mstrmojo.desc(8796), {slot: '2,1', cssClass: ''}),//'Check this to abort report loading when the application receives a low memory notification from the system.'
                                                     
                                                     label(mstrmojo.desc(8797), {slot: '3,1', cssClass: 'propName'}),//'Rows per page'
                                                     validationTextBox('rpc', { enabled: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.rpc.v!=-1'}, {
                                                         validator: function(v) {
                                                             var max = 1000,
                                                             mrl = this.parent.mrl,
                                                             model = mstrmojo.all.BlackBerry_tab.model;
                                                             if(mrl && !isNaN(parseInt(mrl.value))){
                                                                 max = parseInt(mrl.value);
                                                             } else if(model && model.data.gnl.mrl.v){
                                                                 max = model.data.gnl.mrl.v;
                                                             }
                                                             max = Math.min(1000, max);
                                                              v = parseInt(v);
                                                              
                                                              var status =  {id: this.id, code : _SC.VALID, msg: ''};
                                                              if((v < 2 || v > max ) &&  v != -1){
                                                                  status.code = _SC.INVALID_VALIDATOR;
                                                                  if(max > 2){
                                                                      status.msg = mstrmojo.desc(8782, "Please enter a number between ## and ###").replace(/###/, max).replace(/##/, 2) + mstrmojo.desc(8792).replace(/#/, -1);
                                                                  } else {
                                                                      status.msg = mstrmojo.desc(8798).replace(/#/, mstrmojo.desc(8801)) + mstrmojo.desc(8800).replace(/#/, 2) + mstrmojo.desc(8792).replace(/#/, -1);
                                                                  }
                                                              }
                                                              return status;
                                                         }
                                                     }, {slot: '3,2', alias: 'rpc',
                                                         validHook: function(){    
                                                             var mrl = this.parent.mrl;
                                                             if(mrl && mrl.validationStatus.code !=_SC.VALID && mrl.value != null) {mrl.validate();}
                                                         }    
                                                     }),
                                                     onLimitCheckBox('rpc', 'rpc', {slot: '3,3'}),
                                                     
                                                     label(mstrmojo.desc(8801), {slot: '4,1', cssClass: 'propName'}),//'Maximum Rows in Memory'
                                                     validationTextBox('mrl', null, {
                                                         validator: function(v) {
                                                             var min = 1,
                                                             rpc = this.parent.rpc,
                                                             model = mstrmojo.all.BlackBerry_tab.model;
                                                             if(rpc && !isNaN(parseInt(rpc.value))){
                                                                 min = parseInt(rpc.value);
                                                             } else if(model && model.data.gnl.rpc.v){
                                                                 min = model.data.gnl.rpc.v;
                                                             }
                                                             if(min == -1) {min = 1;}
                                                             
                                                              v = parseInt(v);
                                                              
                                                              var status =  {id: this.id, code : _SC.VALID, msg: ''};
                                                              if(v < min || v > 1000000 ){
                                                                  status.code = _SC.INVALID_VALIDATOR;
                                                                  if(min <= 1000000){
                                                                      status.msg = mstrmojo.desc(8782, "Please enter a number between ## and ###").replace(/###/, 1000000).replace(/##/, min);
                                                                  } else {
                                                                      status.msg = mstrmojo.desc(8799).replace(/#/, mstrmojo.desc(8797)) + mstrmojo.desc(8802).replace(/#/, 1000000);//"The upper limit is 1000000."
                                                                  }
                                                              }
                                                              return status;
                                                         }
                                                     },  {slot: '4,2', alias: 'mrl',
                                                         validHook: function(){    
                                                             var rpc = this.parent.rpc;
                                                             if(rpc && rpc.validationStatus.code !=_SC.VALID && rpc.value != null ) {rpc.validate();}
                                                         }
                                                     }),
                                                     
                                                     label(mstrmojo.desc(8803), {slot: '5,1', cssClass: 'propName'}),//'Status History'
                                                     validationTextBox('ctk', { enabled: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.ctk.v!=-1'}, {
                                                         validator: function(v) {
                                                             v = parseInt(v);
                                                             return  (v >= -1 && v <= 1000)? 
                                                                     {id: this.id, code : _SC.VALID, msg: ''} :  
                                                                     {code: _SC.INVALID_VALIDATOR, msg: mstrmojo.desc(8782, "Please enter a number between ## and ###").replace(/###/, 1000).replace(/##/, -1) + 
                                                                     mstrmojo.desc(8804).replace(/#/, 0) + mstrmojo.desc(8792).replace(/#/, -1)}// -1 means no limit.  0 means none.;
                                                              }
                                                     }, {slot: '5,2',alias: 'ctk'}),
                                                     onLimitCheckBox('ctk', 'ctk', {slot: '5,3'}),
                                                     
                                                     label(mstrmojo.desc(8805), {slot: '6,1', cssClass: 'propName'}),//'Task Queue Size'
                                                     validationTextBox('tqs', { enabled: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.tqs.v!=-1'}, {
                                                         validator: function(v) {
                                                             v = parseInt(v);
                                                             return  ( (v >=1 && v <= 1000) || v == -1)? 
                                                                     {id: this.id, code : _SC.VALID, msg: ''} :  
                                                                     {code: _SC.INVALID_VALIDATOR, msg: mstrmojo.desc(8782, "Please enter a number between ## and ###").replace(/###/, 1000).replace(/##/, 1) + mstrmojo.desc(8792).replace(/#/, -1)};
                                                         }
                                                     }, {slot: '6,2',alias: 'tqs'}),
                                                     onLimitCheckBox('tqs', 'tqs', {slot: '6,3'})
                                                     ]
                                          
                                      },
                                      
                                      /**----------------------Data Retrieval----------------------**/
                                      {
                                          scriptClass: 'mstrmojo.Table',
                                          cssClass:'categoryTable',
                                          layout: [{cells: [{cssText:'width:25%'}, {cssText:'width:30%'}, {cssText:'width:30%'}, {cssText:'width:15%'}]},
                                                {cells: [{}, {}, {}, {}]},
                                                {cells: [{}, {}, {}, {}]},
                                                {cells: [{}, {}, {}, {}]},
                                                {cells: [{}, {}, {}, {}]},
                                                {cells: [{}, {}, {}, {}]},
                                                {cells: [{},{colSpan: 3}]}],
                                          children: [
                                                     label(mstrmojo.desc(8806), {slot: '0,0'}),//'Data Retrieval'
                                                     label(mstrmojo.desc(8807), {slot: '0,1', cssClass: 'propName'}),//'Segment Size'
                                                     validationTextBox('chs', {
                                                         value: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.chs.v/1024'
                                                     }, {
                                                         validator: function(v) {
                                                             var max = 1024,
                                                             mds = this.parent.mds,
                                                             model = mstrmojo.all.BlackBerry_tab.model;
                                                             if(mds && !isNaN(parseInt(mds.value))){
                                                                 max = parseInt(mds.value);
                                                             } else if(model && model.data.gnl.mds.v){
                                                                 max = model.data.gnl.mds.v/1024;
                                                             }
                                                             max = Math.min(1024, max);
                                                              v = parseInt(v);
                                                              
                                                              var status =  {id: this.id, code : _SC.VALID, msg: ''};
                                                              if(v < 1 || v > max ){
                                                                  status.code = _SC.INVALID_VALIDATOR;
                                                                  if(max > 1){
                                                                      status.msg = mstrmojo.desc(8782, "Please enter a number between ## and ###").replace(/###/, max).replace(/##/, 1);
                                                                  } else {
                                                                      status.msg = mstrmojo.desc(8798).replace(/#/, mstrmojo.desc(8808)) + mstrmojo.desc(8800).replace(/#/, 1);
                                                                  }
                                                              }
                                                              return status;
                                                         }
                                                     },  {slot: '0,2', alias: 'chs',
                                                         getRealModelValue: function(v){
                                                             return v*1024;//From seconds to milliseconds.
                                                         },
                                                         validHook: function(){   
                                                             var mds = this.parent.mds;
                                                             if(mds && mds.validationStatus.code !=_SC.VALID && mds.value != null ) {mds.validate();}
                                                         }   
                                                     }),
                                                     label(mstrmojo.desc(8793), {slot: '0,2', cssClass: 'unit', cssDisplay: 'inline'}),
                                                     
                                                     label(mstrmojo.desc(8808), {slot: '1,1', cssClass: 'propName'}),//'Maximum Request Size'
                                                     validationTextBox('mds',  {
                                                         value: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.mds.v/1024'
                                                     }, {
                                                         validator: function(v) {
                                                             var min = 1,
                                                             chs = this.parent.chs,
                                                             model = mstrmojo.all.BlackBerry_tab.model;
                                                             if(chs && !isNaN(parseInt(chs.value))){
                                                                 min = parseInt(chs.value);
                                                             } else if(model && model.data.gnl.chs.v){
                                                                 min = model.data.gnl.chs.v/1024;
                                                             }
                                                              v = parseInt(v);
                                                              
                                                              var status =  {id: this.id, code : _SC.VALID, msg: ''};
                                                              if(v < min || v > 102400){
                                                                  status.code = _SC.INVALID_VALIDATOR;
                                                                  if(min <= 102400){
                                                                      status.msg = mstrmojo.desc(8782, "Please enter a number between ## and ###").replace(/###/, 102400).replace(/##/, min);
                                                                  } else {
                                                                      status.msg = mstrmojo.desc(8799).replace(/#/, mstrmojo.desc(8807)) + mstrmojo.desc(8802).replace(/#/, 102400);//"The upper limit is 102400."
                                                                  }
                                                              }
                                                              return status;
                                                              
                                                         }
                                                     },  {slot: '1,2',alias: 'mds',
                                                         getRealModelValue: function(v){
                                                             return v*1024;//From seconds to milliseconds.
                                                         },
                                                         validHook: function(){     
                                                             var chs = this.parent.chs;
                                                             if(chs && chs.validationStatus.code !=_SC.VALID && chs.value != null ) {chs.validate();}
                                                         }  
                                                     }),
                                                     label(mstrmojo.desc(8793), {slot: '1,2', cssClass: 'unit', cssDisplay: 'inline'}),
                                                     
                                                     label(mstrmojo.desc(8809), {slot: '2,1', cssClass: 'propName'}),//'Request Target Time'
                                                     validationTextBox('tgt', {
                                                         value: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.tgt.v/1000'
                                                     }, {min: 1, max:9999},  {slot: '2,2',
                                                         getRealModelValue: function(v){
                                                             return v*1000;//From seconds to milliseconds.
                                                         }
                                                     }),
                                                     label(mstrmojo.desc(7773), {slot: '2,2', cssClass: 'unit', cssDisplay: 'inline'}),//seconds
                                                     
                                                     label(mstrmojo.desc(8810), {slot: '3,1', cssClass: 'propName'}),//'Data Rate Smoothing Coefficient'
                                                     validationTextBox('scf', null, {min: 0, max: 1},  {slot: '3,2', dtp: _DTP.DOUBLE}),
                                                     
                                                     label(mstrmojo.desc(8811), {slot: '4,1', cssClass: 'propName'}),//'Server Polling Frequency'
                                                     validationTextBox('apf', {
                                                         value: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.apf.v/1000'
                                                     }, {min: 0, max: 9999},  {slot: '4,2',
                                                         getRealModelValue: function(v){
                                                             return v*1000;//From seconds to milliseconds.
                                                         }
                                                     }),
                                                     label(mstrmojo.desc(7773), {slot: '4,2',cssClass: 'unit', cssDisplay: 'inline'}),//seconds
                                                     
                                                     label(mstrmojo.desc(8812), {slot: '5,1', cssClass: 'propName'}),//'Result Set Execution Limit'
                                                     validationTextBox('rsel', null, {min: 1, max: 100},  {slot: '5,2'}),
                                                     
                                                     checkbox('svc', mstrmojo.desc(8813), {//'Disable Server Version Check'
                                                         checked: '!mstrmojo.all.BlackBerry_tab.model.data.gnl.svc.v'
                                                     }, {slot: '6,1',
                                                         onclick: function(){
                                                         util.setValidValue(mstrmojo.all.BlackBerry_tab.model.data.gnl.svc, "v", !this.checked);
                                                     }})
                                                     ]
                                      },
                                      
                                      /**----------------------Conservative Mode----------------------**/
                                      {
                                          scriptClass: 'mstrmojo.Table',
                                          cssClass:'categoryTable',
                                          layout: [{cells: [{cssText:'width:25%'}, {cssText:'width:30%'}, {cssText:'width:30%'}, {cssText:'width:15%'}]},
                                                   {cells: [{}, {}, {}, {}]},
                                                   {cells: [{}, {}, {}, {}]}],
                                          children: [
                                                     label(mstrmojo.desc(8814), {slot: '0,0'}),//'Conservative Mode'
                                                     label(mstrmojo.desc(8815), {slot: '0,1', cssClass: 'propName'}),//'Request Target Time'
                                                     validationTextBox('cmt', {
                                                         value: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.cmt.v/1000'
                                                     }, {min: 1, max: 9999},  {slot: '0,2',
                                                         getRealModelValue: function(v){
                                                             return v*1000;//From seconds to milliseconds.
                                                         }
                                                     }),
                                                     label(mstrmojo.desc(7773), {slot: '0,2', cssClass: 'unit', cssDisplay: 'inline'}),//seconds
                                                     
                                                     label(mstrmojo.desc(8816), {slot: '1,1', cssClass: 'propName'}),//'Wait Between Requests'
                                                     validationTextBox('cmw',  {
                                                         value: 'mstrmojo.all.BlackBerry_tab.model.data.gnl.cmw.v/1000'
                                                     }, {min: 0, max: 9999},  {slot: '1,2',
                                                         getRealModelValue: function(v){
                                                             return v*1000;//From seconds to milliseconds.
                                                         }
                                                     }),
                                                     label(mstrmojo.desc(7773), {slot: '1,2', cssClass: 'unit', cssDisplay: 'inline'}),//seconds
                                                     
                                                     label(mstrmojo.desc(8817), {slot: '2,1', cssClass: 'propName'}),//'Device Idle Time Limit'
                                                     validationTextBox('cmi', null, {min: 0, max: 9999},  {slot: '2,2'}),
                                                     label(mstrmojo.desc(7773), {slot: '2,2', cssClass: 'unit', cssDisplay: 'inline'})//seconds
                                                     ]
                                      }
                                      ]
                       }]
                   }
                   ]
        
    });
    
})();
