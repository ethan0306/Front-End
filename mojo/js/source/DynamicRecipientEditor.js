(function(){
    mstrmojo.requiresCls(
            "mstrmojo.hash",
            "mstrmojo.expr",
            "mstrmojo.string",
            "mstrmojo.WaitIcon",
            "mstrmojo.Button",
            "mstrmojo.ValidationTextBox"
            );
    
    var _H = mstrmojo.hash,
    _E = mstrmojo.expr,
    _S = mstrmojo.string,
    _B = mstrmojo.Button,
    _DS = mstrmojo.DynamicRecipientListDataService,
    _ONGRID = 3,
    _INPAGEBY = 4;
    
  //Constants
    var btnClr = '#999',
    btnCls = 'mstrmojo-Editor-button';
    
    var getCategoryName= function(text, config){
        return _H.copy(config, {
            scriptClass: 'mstrmojo.Label',
            text: text,
            cssClass: 'drl-ctgry'
        });
    },
    getAttrFormListItems = function(attrs){
        var itms = [],
        idx = 0;
        
        if(!attrs || attrs.length ==0){
            itms =  [{fid: -1, fn: _S.encodeHtmlString('<No Attriubte Forms>')}];
        } else {
            for(var i = 0; attrs && i < attrs.length; i++){
                var attr = attrs[i],
                fl = attr.fms;//attribute form list
                for(var j = 0; fl && j < fl.length; j++){
                    var f=fl[j],
                    it = {
                            fid:  attr.did + '_' + f.did, 
                            fn: attr.n + '(' + f.n + ')',
                            attr_id: attr.did, 
                            attr_n: attr.n,
                            form_id: f.did,
                            form_n: f.n
                    };
                    itms.push(it);
                }
            }
        }
        return itms;
    },
    getPropsPulldown = function(propName, config, optional){
        var edtrStr = 'this.parent.parent.parent'
        return _H.copy(config, {
              scriptClass: 'mstrmojo.Pulldown',
              propName: propName,
              optional: !!optional,
              bindings: {
                  model: edtrStr + ".model",
                  _items: edtrStr + '.attrList',
                  enabled: '!' + edtrStr + '.wait'
              },
              itemIdField: 'fid',
              itemField: 'fn', 
              _set__items: function(n, v){
                  var items = v? v.concat() :  getAttrFormListItems(),
                          m = null,
                          noForms = items && items.length ==1 && items[0].fid == -1;
                  
                  if(this.model && this.propName && this.model.dmf){
                      m = this.model.dmf[this.propName];
                  }
                  
                  if(this.optional && v){
                      items = mstrmojo.array.insert( items, 0, [{fid: -1, fn: '--no selected--'}]);
                  } 
                  
                  this._items = items;
                  this.set('items', items);
                  this.set('value', noForms? -1 : (m? m.attr_id + '_' + m.form_id : (this.optional? 0 : items[0].fid)));
                  return true;
              },
              _set_value: function(n, v){
                  this.value = v;
                  
                  var m = this.model,
                  prn= this.propName,
                  itms = this.items;
                  
                  if(m && prn && itms && v){
                      m.dmf = m.dmf || {};
                      if(v.constructor === String){
                          var va = v.split('_');
                          m.dmf[prn] = {attr_id: va[0], form_id: va[1]};
                      } else {
                          delete m.dmf[prn];
                      }
                  }
                  return true;
              }
          });
    },
    makeHashable = function(jsonObj, properties){
        if (jsonObj === null){
            return;
        }else if(properties === undefined){
            _H.make(jsonObj, mstrmojo.Obj);
        }else{
            for (var i=0, len=properties.length; i<len; i++){
                var p = properties[i];
                if (p in jsonObj){
                    _H.make(jsonObj[p], mstrmojo.Obj);
                }
            }
        }
    };
    
    mstrmojo.DynamicRecipientEditor = mstrmojo.declare(
            //superclass
            mstrmojo.Editor, 
            //mixin
            null, 
            {
                scriptClass: 'mstrmojo.DynamicRecipientEditor',
                
                cssClass: 'mstrmojo-DRLEditor',
                
                title: 'Create a New Dynamic Recipient List',
                
                openEffect: mstrmojo.Editor.openEffect_fadeIn,
                
                closeEffect:  mstrmojo.Editor.closeEffect_fadeOut,
                
                _set_model: function(n, v){
                    this.set('attrList', null);
                    this.set('statusText', '');
                    if(v && v.cntid){
                        //Get attribute forms list
                        this.set('wait', true);
                        var me = this;
                        _DS.browseAttributeForms({cntid: v.cntid}, {
                            success: function(res){
                                me.set('attrList', getAttrFormListItems(res && res.attrs));
                                me.set('wait', false);
                            },
                            failure: function(res){
                                res && me.set('statusText', res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                me.set('wait', false);
                            }
                        });
                    } else {
                        v = {n: 'New Dynamic Recipient List'};//empty model
                    }
                    
                    if(!v.attachEventListener){
                        makeHashable(v);
                    }
                    
                    this.model = v;
                    return true;
                },
                
                onOK: function(btn){
                    var m = this.model,
                    me = this;
                    
                    var params = {
                            did: m && m.did,
                            n: m && m.n,
                            drlXml: _DS.obj2Xml(m, "drl")
                    },
                    callbacks = {
                            success: function(res){
                                btn.set('enabled', true);
                                me.close();
                                mstrmojo.all.prefDRL.refreshData();
                            },
                            failure: function(res){
                                res && me.set('statusText', res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                btn.set('enabled', true);
                            }
                    };
                    
                    _DS.saveDynamicRecipientList(params, callbacks);
                },
                
                children: [{
                    scriptClass: 'mstrmojo.Table', 
                    cssClass: 'drl-content',
                    layout: [{cells: [{cssText: 'width:30%;height:40px'},{}]},
                              {cells: [{cssText: 'height:30px'},{}]},
                              {cells: [{cssText: 'height:30px'},{}]},
                              {cells: [{cssText: 'height:225px'},{}]},
                              {cells: [{colSpan: 2}]}],
                    children: [
                        getCategoryName('Dynamic Address List Name:', {slot: '0,0', cssText: 'margin-top:10px'}), 
                        {
                            scriptClass: 'mstrmojo.ValidationTextBox',
                            slot: '0,1',
                            cssText: 'margin-top:10px;width:300px',
                            required: true,
                            bindings: {
                                value: 'this.parent.parent.model.n'
                            },
                            dtp: mstrmojo.expr.DTP.CHAR,
                            constraints: {
                                trigger: mstrmojo.validation.TRIGGER.ALL
                            },
                            onValid: function() {
                                var m = this.parent.parent.model;
                                if(m){
                                    m.n = this.value;
                                }
                            },
                            onInvalid: function() {
                                var m = this.parent.parent.model;
                                if(m){
                                    delete m.n;
                                }
                            }
                        }, 
                        getCategoryName('Project:', {slot: '1,0'}), 
                        {
                            scriptClass: 'mstrmojo.Label',
                            slot: '1,1',
                            bindings: {
                                text:  function(){
                                    var m = this.parent.parent.model;
                                    if(m != null && m.pn != null){
                                        return m.pn;
                                    } 
                                    return mstrApp.projectName;
                                }
                            }
                        },
                        getCategoryName('Report: ', {slot: '2,0'}), 
                        {
                            scriptClass: 'mstrmojo.HBox',
                            slot: '2,1',
                            children: [{
                                scriptClass: 'mstrmojo.Label',
                                alias: 'rptIcon'
                            }, {
                                scriptClass: 'mstrmojo.Label',
                                bindings: {
                                    text: function() {
                            			return mstrmojo.string.htmlAngles(this.parent.parent.parent.model.cntn);
                            }},
                                ontextChange: function(){
                                    var icon = this.parent.rptIcon;
                                    if(icon && icon.hasRendered){
                                        mstrmojo.css[this.text ? 'addClass' : 'removeClass'](icon.domNode, ['mstrmojo-ListIcon', 't3']);
                                    } else {
                                        icon.set('cssClass', this.text? 'mstrmojo-ListIcon t3' : '');
                                    }
                                }
                            }, {
                                scriptClass: 'mstrmojo.Button',
                                text: 'Select...',
                                cssText: 'text-decoration:underline;margin-left:20px',
                                onclick: function(){
                                    var me = this.parent.parent.parent;
                                    me.openPopup('selectReportRef', {zIndex: me.zIndex + 10, model: me.model});
                                    
                                    var ob = me.selectReportRef.browser;
                                    ob.browse({
                                        folderLinksContextId : 14,      
                                        onSelectCB: [me.selectReportRef, 'onReportSelect'],
                                        browsableTypes: [_E.TP.FOLDER, _E.TP.REPORT].join(',')
                                    });
                                }
                            }]
                        },
                        getCategoryName('Subscription Mappings: ', {slot: '3,0'}),
                        {
                            scriptClass: 'mstrmojo.Table',
                            cssClass:'drl-subs',
                            slot: '3,1',
                            layout: [{cells: [{cssText: 'width:40%',cssClass: 'subs-title'},{cssClass: 'subs-title'}]},
                                     {cells: [{colSpan:2, cssClass: 'subs-bar'}]},
                                     {cells: [{},{}]},
                                     {cells: [{},{}]},
                                     {cells: [{},{}]},
                                     {cells: [{colSpan:2, cssClass: 'subs-bar'}]},
                                     {cells: [{},{}]},
                                     {cells: [{},{}]},
                                     {cells: [{},{}]},
                                     {cells: [{},{}]}],
                           children: [
                                      getCategoryName('Property', {slot: '0,0', cssClass: 'drl-title'}), 
                                      getCategoryName('Value', {slot: '0,1', cssClass: 'drl-title'}), 
                                      
                                      getCategoryName('Required Property', {slot: '1,0', cssClass: 'drl-title'}), 
                                      
                                      getCategoryName('Physical Address', {slot: '2,0', cssClass: 'drl-cat'}), 
                                      getPropsPulldown('phyaddr', {slot: '2,1'}),
                                      
                                      getCategoryName('Linked User ID', {slot: '3,0', cssClass:  'drl-cat'}), 
                                      getPropsPulldown('uid', {slot: '3,1'}),
                                      
                                      getCategoryName('Device', {slot: '4,0', cssClass:  'drl-cat'}), 
                                      getPropsPulldown('dev', {slot: '4,1'}),
                                      
                                      getCategoryName('Optional Property', {slot: '5,0', cssClass: 'drl-title'}), 
                                      
                                      getCategoryName('Recipient Name', {slot: '6,0', cssClass:  'drl-cat'}), 
                                      getPropsPulldown('rn', {slot: '6,1'}, true),
                                      
                                      getCategoryName('Notification Address', {slot: '7,0', cssClass:  'drl-cat'}), 
                                      getPropsPulldown( 'na', {slot: '7,1'}, true),
                                      
                                      getCategoryName('Notification Device', {slot: '8,0', cssClass: 'drl-cat'}), 
                                      getPropsPulldown('nd', {slot: '8,1'}, true),
                                      
                                      getCategoryName('Personalization', {slot: '9,0', cssClass:  'drl-cat'}),
                                      getPropsPulldown('pa', {slot: '9,1'}, true)
                                      ]
                        }, {
                            scriptClass: 'mstrmojo.Box',
                            slot: '4,0',
                            cssClass: 'drl-status',
                            bindings: {
                                visible: "!!this.parent.parent.statusText"
                            },
                            children: [{
                                scriptClass: 'mstrmojo.Label',
                                cssText: 'margin:0px 10px;float:right',
                                bindings: {
                                    text: 'this.parent.parent.parent.statusText'
                                }
                            }]
                        }
                    ]
                    
                }, {
                    //ButtonBar
                    scriptClass: "mstrmojo.HBox",
                    cssClass: "mstrmojo-Editor-buttonBar",
                    slot:'buttonNode',
                    children: [new _B.newInteractiveButton ( mstrmojo.desc(118), //Descriptor: Save 
                                           function() {
                                               this.set('enabled', false);
                                               this.parent.parent.onOK(this); 
                                           }, 
                                           btnClr, {alias: 'btnOk', cssClass: btnCls}),
                                   new _B.newInteractiveButton ( mstrmojo.desc(2399), //Descriptor: Cancel 
                                           function() {this.parent.parent.close(); }, 
                                           btnClr, { alias: 'btnCancel',cssClass: btnCls})
                              ]
                }],
                
                //Select Report
                selectReportRef: {
                    scriptClass: "mstrmojo.Editor",
                    cssClass: 'SREditor',
                    cssText: "width:310px",
                    title: 'Select Report',
                    locksHover: true,
                    bindings: {
                        selectedReport: function(){
                            var m = this.model;
                            return {
                                cntid: m.cntid,
                                cntn: m.cntn,
                                pn: m.pn,
                                pid: m.pid
                            };
                        }
                    },
                    onReportSelect: function(item){
                        this.set('selectedReport', {
                            cntid: item.did,
                            cntn: item.n,
                            pn: mstrApp.projectName,
                            pid: mstrApp.projectID
                        });
                    }, 
                    
                    contentType: _ONGRID,
                    
                    onOK: function(){
                        //set model
                        var p = this.model,
                        sr = this.selectedReport;
                        if(p && sr){
                            p.set('cntn', sr.cntn);
                            _H.copy(sr, p);
                        }
                        
                        var me = this,
                        drlEditor = this.opener;
                        _DS.browseAttributeForms({cntid: sr.cntid, contentType: this.contentType}, {
                            success: function(res){
                                me.close();
                                if(res){
                                    drlEditor.set('attrList',  getAttrFormListItems(res.attrs));
                                }
                            },
                            failure: function(res){
                                res && me.set('statusText', res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                            }
                        });
                    },
                    children: [{
                        scriptClass : "mstrmojo.ObjectBrowser", 
                        alias: "browser", 
                        fishEyeVisible: false,
                        closeable: false,   
                        closeOnSelect: false
                    }, {
                        scriptClass: 'mstrmojo.HBox',
                        children: [
                                   getCategoryName('All Subscription Information is stored:'), 
                                   {
                                       scriptClass: 'mstrmojo.Pulldown',
                                       items: [{n:'on the Grid', dssid: _ONGRID},
                                               {n:'in the Page By', dssid: _INPAGEBY}],
                                       onvalueChange: function(){
                                           this.parent.parent.contentType = this.value;
                                       }
                                   }
                                   ]
                    }, {
                        scriptClass: "mstrmojo.HBox",
                        cssClass: "mstrmojo-Editor-buttonBar",
                        slot:'buttonNode',
                        children: [//OK button
                                       new _B.newInteractiveButton ( mstrmojo.desc(1442),
                                               function() {  
                                                   this.parent.parent.onOK(); 
                                               }, 
                                               btnClr,{alias: 'btnOk', cssClass: btnCls}),
                                       //Cancel button
                                       new _B.newInteractiveButton ( mstrmojo.desc(2399), 
                                               function(){ this.parent.parent.close(); }, 
                                               btnClr, { alias: 'btnCancel',cssClass: btnCls})
                                  ]
                    }]
                }
            });
})();