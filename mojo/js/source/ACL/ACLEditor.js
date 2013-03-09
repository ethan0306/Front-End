(function () {
           
    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.HTMLButton",
            "mstrmojo.HBox",        
            "mstrmojo.List",
            "mstrmojo.Label",
            "mstrmojo.ListMapperHoriz",
            "mstrmojo.WidgetList",
            "mstrmojo.WidgetListMapper",
            "mstrmojo.TristateCheckBox",
            "mstrmojo.Pulldown",
            "mstrmojo.ACL.UserTreeBrowser",
            "mstrmojo.DataGrid",           
            "mstrmojo.DropDownButton",
            "mstrmojo.ListBox",
            "mstrmojo.DivItemRenderer",
            "mstrmojo.VBox",   
            "mstrmojo.ACL.UserInputBox",
            "mstrmojo.Editor",
            "mstrmojo.ACL.UserDataService");
    
    var Enum_RIGHT_FLAGS = [1, 4, 8, 16, 32, 64, 128],
        Enum_RIGHT_DESC = [mstrmojo.desc(1825,'Browse'),
                           mstrmojo.desc(8078,'Read'),
                           mstrmojo.desc(8079,'Write'),
                           mstrmojo.desc(629,'Delete'), 
                           mstrmojo.desc(8080,'Control'), 
                           mstrmojo.desc(8081,'Use'), 
                           mstrmojo.desc(8082,'Execute')],
        Enum_RIGHT_DESC_SHORT = ['B','R','W','D', 'C','U', 'E'];
    
    function _getACLHint(r){
        var h = [], 
            d = Math.floor(r/1000),
            g = r%1000,
            rf = Enum_RIGHT_FLAGS,
            rd = Enum_RIGHT_DESC,
            len = rf.length,
            s;
        for(var i=0;i<len;i++){
            h.push(rd[i]);
            h.push(' ');
            if((g&rf[i])>0){
                h.push(mstrmojo.desc(8083,'Granted'));
            } else if((d&rf[i])>0){
                h.push(mstrmojo.desc(8084,'Denied'));
            } else {
                h.push(mstrmojo.desc(959,'Default'));
            }
            h.push(',');
        }
        s = h.join('');
        return s.substring(s, s.length-1);
    }
    
    function _getACLLabel(r){
        var h = [], 
            g = r%1000,
            rf = Enum_RIGHT_FLAGS,
            rd = Enum_RIGHT_DESC_SHORT,
            len = rf.length,
            s;
        for(var i=0;i<len;i++){
            if((g&rf[i])>0){
                h.push(rd[i]);
                h.push(',');                
            }
        }
        s = h.join('');
        return s.substring(s, s.length-1);
    }
    
    function _fixACL(v){
        return {'253000': 255000, '253': 255, '221':223, '197': 199, '69': 71}[v] || v;
    }
    
    function _fixACLTwoStates(v){
        return {'253000': 255000, '253': 255, '32221': 223, '56197': 199}[v] || v;
    }
    
    function _updatePulldown(w, v){
        var its = w.items,
            idx = mstrmojo.array.find(its, w.itemIdField, v),
            iWas = w.customItem,
            iIdx = its.length - 2;
        if(idx == -1) {//if not found
            var iNew = {n:_getACLLabel(v), rgt: v};
            if(iWas){
                its.splice(iIdx, 1);
            } 
            iIdx = its.length - 1;
            its.splice(iIdx, 0, iNew);
            
            w.customItem = iNew;
        } else {
            if(iWas && idx != iIdx){
                its.splice(iIdx, 1);
                w.customItem = null;
            }
        }
        w.set('title', _getACLHint(v));
        w.value = v;
    }
    
    /**
     * For Cubes:
        Consume: BRU: if a user shares a cube with BRU, then other users can use create/execute reports on top of it.
        Add:BRUE: above plus other users can execute i.e Republish/Refresh the cube to change the data.
        Collaborate:BRUEWD: above plus modify the cube.
        Full Control:BRUEWDC: above plus Control.
        Deny All
        
        For all other object types:
        View (BRUE)
        Modify (BRUEWD)
        Full Control:BRUEWDC: above plus Control.
     */
    function _getCategoriesByType(t){
        return {'776': [               
                    {n:mstrmojo.desc(8085,'Consume'), rgt:71},
                    {n:mstrmojo.desc(531,'Add'), rgt:199},
                    {n:mstrmojo.desc(8086,'Collaborate'), rgt:223},
                    {n:mstrmojo.desc(8087,'Full Control'), rgt:255},
                    {n:mstrmojo.desc(8088,'Denied All'), rgt:255000},
                    {n:mstrmojo.desc(8089,'Custom ...'), rgt:-1}                       
                ]}[t] || [               
                          {n:mstrmojo.desc(8090,'View'), rgt:199},
                          {n:mstrmojo.desc(767,'Modify'), rgt:223},
                          {n:mstrmojo.desc(8087,'Full Control'), rgt:255},
                          {n:mstrmojo.desc(8088,'Denied All'), rgt:255000},
                          {n:mstrmojo.desc(8089,'Custom ...'), rgt:-1}                    
                      ];  
    }
    
    function _saveACL(e, isToClose){
        var oi = e && e.oi,
            xml;
        
        if(oi){//serialize this oi into xml and make task call to persist it.

            oi = _postProcessACLs(oi);
            
            xml = _getSaveXML(oi);

            var params = {
                    taskId: 'saveObjectACL',
                    objectXML: xml,
                    sessionState: mstrApp.sessionState,
                    objectType: oi.t,
                    objectID: oi.did 
            };
            mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
                success: function(res) {
                    //mstrmojo.alert(mstrmojo.desc(3336,'## has been saved successfully.').replace("##", res.n)) ;
                    if(isToClose) {
                        e.close();
                    }
                },
                failure: function(res) {
                    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                    if(isToClose) {
                        e.close();
                    }                    
                }
            }, params);
        }
    }
    
    function _isFolder(oi){
        return (oi && oi.t == 8);
    }
    
    function _preProcessACLs(oi){
        var acls = oi.acls,
            len = acls && acls.length,
            isF = _isFolder(oi), 
            aclMap = {},
            acl, r, inhs;
    
        if(isF){ 
           inhs = {};
           oi.inhs = inhs;
        }
        
        //merge(deny and grant) and separate(inherited or not) acls                
        for(var i=0;i<len;i++){
            acl = acls[i];
            if(isF && acl.inh){//separate
                inhs[acl.n] = mstrmojo.hash.copy(acl);
                continue;
            }
            
            r = aclMap[acl.n];
            if(!r){
                r = mstrmojo.hash.copy(acl);
                r.rgt = 0;
                delete r.den;
                aclMap[acl.n] = r;                        
            }                    
            r.rgt += acl.den ? acl.rgt*1000 : acl.rgt;
        }
        
        acls = mstrmojo.hash.valarray(aclMap); 
        
        oi.acls = acls;
                        
        return oi;
        
    }
    
    function _postProcessACLs(oi){
        var acls = oi.acls,
            inhs = oi.inhs,
            exAcls = [], acl, g, rgt;
        
        //concatenate
        if(_isFolder(oi)){
            acls = acls.concat(mstrmojo.hash.valarray(inhs));
        }
        
        //expand based on rgt value
        for(var i=0,len=acls.length;i<len;i++){
            acl = acls[i];
            rgt = acl.rgt;
            if(rgt>1000){//deny
                g = mstrmojo.hash.copy(acl);
                g.den = true;
                g.rgt = Math.floor(rgt/1000); 
                exAcls.push(g);
            }
            
            if((rgt % 1000)>0){
                g = mstrmojo.hash.copy(acl);
                g.den = false;
                g.rgt = rgt % 1000;
                exAcls.push(g);
            }
        }
        
        oi.acls = exAcls;
        
        return oi;
    }
    
    function _getSaveXML(oi){
        var cfg = {
                isSerializable: function(nodeName, jsons, idx){
                    switch(nodeName){
                    case 'did':
                    case 'rgt':
                    case 'n':
                    case 'acls':
                    case 't':
                    case 'st':
                    case 'inh':
                    case 'den':
                        return true;
                    }
                    return false;
                },
                getArrItemName: function(n, v, i){
                    if(n == 'acls'){
                        return 'acl';
                    }
                },
                convertBoolean: true                                               
        };
        
        return mstrmojo.string.json2xml('oi', oi, cfg);
    }
    
    mstrmojo.ACL.ACLEditor = mstrmojo.declare(
        // superclass
        mstrmojo.Editor,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.ACL.ACLEditor",
            
            cssClass: "mstrmojo-ACLEditor",
            
            zIndex: 10, 
            
            help: 'sharing_dialog_box.htm',
            
            userSelector: {
                scriptClass: 'mstrmojo.Editor',
                title: mstrmojo.desc(8091,'User/User Group Browser'),
                cssClass:'mstrmojo-UserEditor',
                help: 'user_group_browser.htm',
                onClose: function(){
                    this.userBrowser.clearTreeSelect();
                },
                children: [
                     {
                            scriptClass: 'mstrmojo.ACL.UserTreeBrowser',
                            alias: 'userBrowser',
                            selectionAcrossBranch: true,
                            multiSelect: true
                     },{
                         scriptClass:'mstrmojo.HBox',
                         cssClass:'mstrmojo-Editor-buttonBox',
                         slot:'buttonNode',
                         children:[
                                   {   
                                       scriptClass:'mstrmojo.HTMLButton',
                                       cssClass: "mstrmojo-Editor-button",
                                       text: mstrmojo.desc(1442,"OK"),
                                       onclick: function(evt){
                                           var ue = this.parent.parent,
                                               e = ue.opener,
                                               ci = e.objectInputer,
                                               ub = ue.userBrowser,
                                               sls = ub.getTotalSelections();
                                           if(sls && sls.length > 0){
                                               ci.add(sls, ci.items.length - 1);
                                           }
                                           ue.close();
                                       }
                                   },{
                                       scriptClass:'mstrmojo.HTMLButton',
                                       cssClass: "mstrmojo-Editor-button",
                                       text: mstrmojo.desc(221,"Cancel"),
                                       onclick: function(evt){
                                           this.parent.parent.close();
                                       }  
                                   }
                                   ]
                     }
                ]
            },
               
            customACL: {
                scriptClass: 'mstrmojo.Editor',
                title: mstrmojo.desc(8092,'Custom Permission Level'),
                cssClass:'mstrmojo-CustomACLEditor',
                help:'Custom_Permission_Level_dialog_box.htm',
                onOpen: function(){
                    var rgt = this.rgt,
                        d = Math.floor(rgt/1000),
                        g = rgt%1000,
                        chs = this.children, ch, r;
                    for(var i=0, len=chs.length;i<len;i++){
                        ch = chs[i];
                        r = ch.right;
                        if(this.twoStates){
                            ch.set('grayed', false);
                            ch.set('checked', false);
                        } else {
                            ch.set('grayed', true);
                            ch.set('checked', true);
                        }
                        if((d&r) > 0){
                            ch.set('checked', false);
                            ch.set('grayed', false);
                        }
                        if((g&r) > 0){
                            ch.set('checked', true);
                            ch.set('grayed', false);
                        }
                    }
                },
                getACLValue: function(){
                   var g=0,d=0,
                       chs = this.children,
                       ch;
                   for(var i=0,len=chs.length;i<len;i++){
                       ch = chs[i];
                       if(ch.grayed || !ch.right){
                           continue;
                       }
                       if(ch.checked){
                           g += ch.right;
                       } else {
                           d += ch.right;
                       }
                   }
                   return d*1000 + g;
                }, 
                children: [
                           {
                               scriptClass:'mstrmojo.TristateCheckBox',
                               alias: 'browse',
                               right: 1,
                               text: mstrmojo.desc(1825,'Browse') 
                           },
                           {
                               scriptClass:'mstrmojo.TristateCheckBox',
                               alias: 'read',
                               right: 4,
                               text: mstrmojo.desc(8078,'Read') 
                           },
                           {
                               scriptClass:'mstrmojo.TristateCheckBox',
                               alias: 'write',
                               right: 8,
                               text: mstrmojo.desc(8079,'Write') 
                           },
                           {
                               scriptClass:'mstrmojo.TristateCheckBox',
                               alias: 'delete',
                               right: 16,
                               text: mstrmojo.desc(629,'Delete') 
                           },
                           {
                               scriptClass:'mstrmojo.TristateCheckBox',
                               alias: 'control',
                               right: 32, 
                               text: mstrmojo.desc(8080,'Control') 
                           },
                           {
                               scriptClass:'mstrmojo.TristateCheckBox',
                               alias: 'use',
                               right: 64, 
                               text: mstrmojo.desc(8081,'Use') 
                           },                           
                           {
                               scriptClass:'mstrmojo.TristateCheckBox',
                               alias: 'execute',
                               right: 128,
                               text: mstrmojo.desc(8082,'Execute') 
                           },
                           {
                               scriptClass: 'mstrmojo.HBox',
                               cssClass:'mstrmojo-Editor-buttonBox',
                               slot:'buttonNode',
                               children: [
                                          {//buttons
                                              scriptClass: "mstrmojo.HTMLButton",
                                              cssClass: "mstrmojo-Editor-button",
                                              text: mstrmojo.desc(1442,"OK"),
                                              onclick: function(evt){
                                                  var e = this.parent.parent;
                                                  if(e.onOK){
                                                      e.onOK();
                                                  }
                                                  e.close();
                                              }
                                          },                                
                                           {//buttons
                                               scriptClass: "mstrmojo.HTMLButton",
                                               cssClass: "mstrmojo-Editor-button",
                                               text: mstrmojo.desc(221,"Cancel"),
                                               onclick: function(evt){
                                                  var e = this.parent.parent;
                                                  if(e.onCancel){
                                                      e.onCancel();
                                                  }
                                                  e.close();
                                               }
                                           }
                                          ]
                           }        
                           ]
            },
            
            
            _set_oi: function(n, v){
                this.oi = _preProcessACLs(v);
                return true;
            },
            
            postCreate: function(){
                //TQMS 449358: process ACL for the first editor opening
                this.oi = _preProcessACLs(this.oi);
            },
            
            
            onOpen: function(){
                
                this.set('title', mstrmojo.desc(8093, "Share: ##").replace('##', mstrmojo.string.encodeHtmlString(this.oi.n)));
                
                var pd = this.rightPulldown;
                
                pd.set('items', _getCategoriesByType(this.oi.st));
                pd.set('value', 223);
 
                var ci = this.objectInputer,
                    us = this.userSelector,
                    ub = us && us.userBrowser;
                
                if(ub && ub.hasRendered){
                    ub.set('items', []);
                    ub.getContent(ub);
                }
                
                var DS = mstrmojo.ACL.UserDataService, 
                    INITIAL_USERS_COUNT = 200, 
                    success = function(candidates){
                        ci.set('candidates', candidates);
                    },
                    failure = function(res){
                        mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                    },                
                    callbacks = {success: success, failure: failure};
                
                DS.getUserCandidates(INITIAL_USERS_COUNT, callbacks);
            },
            
            onClose: function(){
                var ci = this.objectInputer;
                ci.set('items', []);
                this.aclList.clearSelect();//need to clear the selection;otherwise, then it would be wrong when reopening the editor and add new ones sometimes. 
            },
            
            children:[
                      {
                          scriptClass:"mstrmojo.DataGrid",
                          cssClass: 'mstrmojo-ACLEditor-ACLList',
                          alias:"aclList",
                          renderOnScroll: false,
                          makeObservable: true,
                          itemDisplayField: 'n',
                          dropZone: true,
                          bindings:{
                              items: "this.parent.oi.acls"
                          },
                          onremove: function(evt){
                              var oi = this.parent.oi;
                              if(!_isFolder(oi)){
                                  return;
                              }
                              var inhs = oi.inhs,
                                  its = evt.value,
                                  len = its && its.length,
                                  n;
                              for(var i=0;i<len;i++){
                                  n = its[i].n;
                                  delete inhs[n];
                              }
                          },
                          onadd: function(evt){
                              var oi = this.parent.oi;
                              if(!_isFolder(oi)){
                                  return;
                              }
                              var inhs = oi.inhs,
                                  its = evt.value,
                                  len = its && its.length,
                                  n;
                              for(var i=0;i<len;i++){
                                  n = its[i].n;
                                  inhs[n] = mstrmojo.hash.copy(its[i]);
                                  inhs[n].inh = true;
                              }
                          },
                          onACLChanged: function(d){
                              var oi = this.parent.oi;
                              if(!_isFolder(oi)){
                                  return;
                              }
                              oi.inhs[d.n] = mstrmojo.hash.copy(d);
                              oi.inhs[d.n].inh = true;
                          }, 
                          columns:[
                               {
                                   dataFunction:function(item, idx, w){
                                       return '<div class="mstrmojo-ACLEditor-user ' + (item.st == 8705 ? 'ug' : 'u') + '">' + item.n + '</div>';
                                   }, 
                                   headerText: mstrmojo.desc(8094, "User/User Group"),
                                   colCss: 'userCol'
                               },
                              
                              //{dataField:'did', headerText: 'UID', colCss: 'uidCol'},
                              
                              {
                                  dataWidget:{
                                      scriptClass: 'mstrmojo.Pulldown',
                                      itemIdField: 'rgt',  
                                      popupToBody: true,
                                      selectionPolicy:'reselect',
                                      defaultSelection: 0,
                                      postCreate: function() {
                                          this.markupMethods = mstrmojo.hash.copy(
                                                  {
                                                      ondataChange: function(){
                                                          var d = this.data;
                                                          this.set('value', d[this.itemIdField]);
                                                      }    
                                                  },
                                                  mstrmojo.hash.copy(this.markupMethods)
                                               );
                                          this.items = _getCategoriesByType(mstrmojo.all.mstrACL.oi.st);
                                      },
                                      _set_value: function(n, v){
                                          var vWas = this.value,
                                          bChanged = (vWas !== v);
                                          if(bChanged){
                                              if(v === -1){//Custom, do not change the value, instead, poping up editor to customize rgts
                                                  var e = this.dataGrid.parent,
                                                  me = this;
                                                  e.openPopup('customACL',{
                                                      zIndex:e.zIndex + 10, 
                                                      rgt: vWas,
                                                      twoStates: !!this.data.newItem,
                                                      onOK: function(){
                                                          me.set('value', this.getACLValue());
                                                      },
                                                      onCancel: function(){
                                                          me.set('value', vWas);
                                                      }
                                                  });
                                                  return false;
                                              } else {
                                                  v = _fixACL(v);
                                                  _updatePulldown(this, v);
                                                  this.data[this.itemIdField] = v; 
                                                  if(vWas !== null) {
                                                      this.dataGrid.onACLChanged(this.data);
                                                  }
                                              }
                                              return true;
                                          }
                                          return true;                                          
                                      }
                                  },
                                  headerText: mstrmojo.desc(8095, 'Permission Level'),
                                  colCss: 'rgtCol'
                              },
                              
                              {
                                  dataWidget:{                
                                      scriptClass: "mstrmojo.Button",
                                      cssClass: "mstrmojo-ACLEditor-delete",
                                      text: "&nbsp",
                                      title: mstrmojo.desc(629,'Delete'),
                                      onclick: function(evt){
                                          this.dataGrid.remove(this.data);
                                      }
                                  },
                                  headerText: '&nbsp',
                                  colCss: 'actionsCol'
                              }
                              ]
                      },
                      {
                          scriptClass: "mstrmojo.Box",
                          cssClass:'mstrmojo-ACLEditor-MorePanel',
                          children: [
                                      {
                                          scriptClass: "mstrmojo.HBox",
                                          children: [                         
                                              {
                                                  scriptClass: "mstrmojo.Label",
                                                  text: mstrmojo.desc(8096, "Add Users/User Groups:"),
                                                  cssClass:'mstrmojo-ACLEditor-addLabel'
                                              } ,
                                              {
                                                  scriptClass: "mstrmojo.Label",
                                                  text: mstrmojo.desc(8097, "Choose Users/User Groups"),
                                                  cssClass:'mstrmojo-ACLEditor-chooseLabel',
                                                  onclick: function(evt){
                                                      var e = this.parent.parent.parent;
                                                      e.openPopup('userSelector',{zIndex:e.zIndex + 10});
                                                  }
                                              }                             
                                              ]  
                                      },
                                      {
                                          scriptClass: "mstrmojo.ACL.UserInputBox",
                                          emptyText:mstrmojo.desc(8098, 'Type users or user groups here.'),
                                          cssClass:'mstrmojo-ObjectInputBox mstrmojo-ACLEditor-inputBox',
                                          onRender: function(){
                                              var e = this.parent.parent;
                                              if(e){
                                                  e.objectInputer = this;
                                              }
                                          }
                                      },                      
                                      {
                                          scriptClass: "mstrmojo.HBox",
                                          cssClass:'mstrmojo-ACLEditor-CPSection',
                                          children: [                         
                                              {
                                                  scriptClass: "mstrmojo.Label",
                                                  cssClass: 'mstrmojo-ACLEditor-CPLLabel', 
                                                  text: mstrmojo.desc(8099, "Choose a permission level")
                                              },
                                              {
                                                  scriptClass: 'mstrmojo.Pulldown',
                                                  itemIdField: 'rgt',
                                                  value: -1,
                                                  defaultSelection: 0,
                                                  selectionPolicy:'reselect',
                                                  onRender: function(){
                                                      var e = this.parent.parent.parent;
                                                      if(e){
                                                          e.rightPulldown = this;
                                                      }
                                                  },      
                                                  postCreate: function() {
                                                      this.items = _getCategoriesByType(mstrmojo.all.mstrACL.oi.st);
                                                  },                                  
                                                  _set_value: function(n, v){
                                                      
                                                      var vWas = this.value,
                                                          bChanged = (vWas !== v);
                                                      if(bChanged){
                                                          if(v === -1){//Custom, do not change the value, instead, poping up editor to customize rgts
                                                              var e = this.parent.parent.parent,
                                                                  me = this;
                                                              e.openPopup('customACL',{
                                                                  zIndex:e.zIndex + 10, 
                                                                  rgt: vWas,
                                                                  twoStates: true,
                                                                  onOK: function(){
                                                                      me.set('value', this.getACLValue());
                                                                  },
                                                                  onCancel: function(){
                                                                      me.set('value', vWas);
                                                                  }
                                                              });
                                                              return false;
                                                          } else {
                                                              v = _fixACLTwoStates(v);
                                                              _updatePulldown(this,v);
                                                          }
                                                          return true;
                                                      }
                                                      return true;
                                                  }                                                  
                                              },
                                              {
                                                  scriptClass: "mstrmojo.HTMLButton",
                                                  cssClass: "mstrmojo-Editor-button mstrmojo-ACLEditor-addButton",
                                                  text: mstrmojo.desc(2156,"Add"),
                                                  onclick: function(evt){
                                                      var e = this.parent.parent.parent,
                                                          acl = e.aclList,
                                                          ci = e.objectInputer,
                                                          pd = e.rightPulldown,
                                                          its = ci.getSelectedObjects(),
                                                          len = its.length,
                                                          added = [],it, rgt = pd.value;
                
                                                      if(!ci.isValid()){//TQMS 449365: validation before adding ACL entry
                                                          mstrmojo.alert(mstrmojo.desc(8100, "Please fix invalid users/user groups before procceeding."));
                                                          return;
                                                      }
                                                      
                                                      for(var i=0;i<len;i++){
                                                          it = its[i];
                                                          added.push({n:it.n, did: it.did, st: it.st, rgt: rgt, newItem:true});
                                                      }
                                                      if(len>0){
                                                          var ret = mstrmojo.array.findMulti(acl.items, 'did', added);
                                                          if (ret.count) {
                                                              var idxs = ret.indices.concat().sort(mstrmojo.array.numSorter).slice(0, ret.count);
                                                              for (var i=idxs.length-1; i>-1; i--) {
                                                                  acl.remove(idxs[i]);
                                                              }
                                                          }
                                                          acl.add(added);
                                                      }
                                                      
                                                      ci.set('items', []);
                                                  }
                                              }
                                              ]  
                                      }
                      ]},                      
                {
                    scriptClass: "mstrmojo.HBox",
                    cssClass: "mstrmojo-Editor-buttonBox",
                    slot:"buttonNode",
                    children: [     
                               /*
                               {//buttons
                                   scriptClass: "mstrmojo.HTMLButton",
                                   cssClass: "mstrmojo-Editor-button",
                                   text: "Apply",
                                   onclick: function(evt){
                                       var e = this.parent.parent;
                                       _saveACL(e, false);
                                   }
                               },     */
                               {//buttons
                                   scriptClass: "mstrmojo.HTMLButton",
                                   cssClass: "mstrmojo-Editor-button",
                                   text: mstrmojo.desc(1442,"OK"),
                                   bindings: {
                                       enabled: function (){
                                           //TQMS 449403: check privilege for enabling save button
                                           var oi = this.parent.parent.oi;
                                           return (oi.acg & 32) > 0;
                                       }
                                   },
                                   onclick: function(evt){
                                       var e = this.parent.parent;
                                       _saveACL(e, true);
                                   }
                               },                                
                                {//buttons
                                    scriptClass: "mstrmojo.HTMLButton",
                                    cssClass: "mstrmojo-Editor-button",
                                    text: mstrmojo.desc(221,"Cancel"),
                                    onclick: function(evt){
                                        this.parent.parent.close();
                                    }
                                }
                        ]
                }
            ]
        });
    
})();