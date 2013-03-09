(function () {

    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.expr",
            "mstrmojo._HasPopup",
            "mstrmojo.Label",
            "mstrmojo.HTMLButton",
            "mstrmojo.ObjectBrowser",
            "mstrmojo.DataGrid",
            "mstrmojo.Editor"
            );

    var _H = mstrmojo.hash,
        E = mstrmojo.expr,
        _brackets = mstrmojo.ME.MetricToken.brackets,
        _DTPBuilder = function(d){
        var w = null;
        
        if(d.isParam){//function parameters
            w = {
                    scriptClass: 'mstrmojo.Table',
                    cssClass: 'funcParam',
                    layout: [{cells: [{cssText: 'width: 338px'}, {}]}],  
                    children: [{                    
                        scriptClass: 'mstrmojo.ObjectInputBox',
                        alias: 'paramInput',
                        slot: '0,0',
                        item2textCss: function item2textCss(data){
                            return (this._super && this._super(data)) || 
                            {
                                4: 'm',
                                13: 'fc',                            
                                '-99': 'br'    //browse....
                            }[data.t] || '';//default is report level
                        },
                        hideEditButton: function(d){
                            return d.state === mstrmojo.Enum_OIB_States.VALID;
                        },
                        browsableTypes: [E.TP.FOLDER, E.TP.FACT, E.TP.METRIC].join(','),
                        browseItemVisible: true,
                        folderLinksContextId : 17,                         
                        dynamicVerify: false,
                        emptyText: 'Type here to input a fact or metric ...',
                        getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                            mstrmojo.ME.MetricDataService.getMetrics(params, callbacks);
                        },
                        postCreate: function(refresh){
                            var grid = this.parent.dataGrid,
                                fw = grid && grid.parent;
                            this.candidates = fw.getCandidates(function(item){
                                return item.t === 4 || item.t === 13;
                            });
                            if(!refresh){
                                grid.candidatesListener.push(this);
                            }
                        }
                    },{
                        scriptClass: "mstrmojo.ToolBar",
                        slot: '0,1',
                        cssClass: 'mstrmojo-oivmSprite grouped', 
                        children:[{
                            scriptClass: "mstrmojo.Button",
                            title: "Browse",
                            iconClass: "tbBrowse",
                            bindings:{
                                enabled: "!this.parent.parent.paramInput.isFull"
                            },                            
                            onclick : function(){
                                    var editor = this.parent.parent.dataGrid.parent;
                                    editor.openPopup('ob', {zIndex: editor.zIndex + 10});
                                    
                                    var ob = editor.ob.browser;
                                    ob.browse({
                                        folderLinksContextId : 17,      
                                        onSelectCB: [this.parent.parent, 'onParamAdded'],
                                        browsableTypes: [E.TP.FACT, E.TP.METRIC, E.TP.FOLDER].join(',') 
                                    });
                                }
                            }]
                    }],
                    onParamAdded: function(oi){
                        var editor = this.dataGrid.parent,
                            input = this.paramInput;
                        
                        editor.closePopup();
                        
                        oi.state = 0;
                        input.add([oi], input.items.length -1);
                    },
                    getTokens: function(){
                        var its = this.paramInput.getSelectedObjects(),
                            len = its.length, 
                            i, tks=[], t;
                        if(len>0){
                            for(i=0;i<len;i++){
                                if(its[i].state === mstrmojo.Enum_OIB_States.VALID){
                                    t = {v:_brackets(its[i].n)};
                                    t.oi = its[i];
                                } else {
                                    t = {v:its[i].n};
                                }
                                tks.push(t);
                                tks.push({v:',', isDelimiter: true});
                            }
                            tks.pop();
                        }
                        
                        return tks;
                    }     
            };
            var piw = w.children[0];
            if(!d.isRepeated){
                piw.cssClass = 'mstrmojo-ObjectInputBox singleObject noVerify';
                piw.maxObjectCount = 1;
            } else {
                piw.cssClass = 'mstrmojo-ObjectInputBox noVerify';
            }
        } else {//function properties
        switch(d && d.dtp){
        case 11://boolean
            w = {
                    scriptClass: 'mstrmojo.Pulldown',
                        cssClass: 'mstrmojo-functionArgs-pulldown mstrmojo-Pulldown',
                    items: [{n:'False', did: "0"}, {n:'True', did: "-1"}],
                        popupToBody: true,
                    itemIdField: 'did',
                    postCreate: function(props){
                        this.value = this.data.dfv || 0 ;
                    },
                    getTokens: function(){
                        var d = this.data;
                        if(this.value !== d.dfv){
                            return [{v:d.n},{v:'=',isDelimiter: true},{v:this.value == "-1" ? "True" : "False"}];
                        } else {
                            return [];
                        }
                    }
            };
            break;
        case -2: //break by
            w = {
                        scriptClass: 'mstrmojo.Table',
                        cssClass: 'breakBy',
                        layout: [{cells: [{cssText: 'width: 338px'}, {}]}],    
                        children: [{
                            scriptClass: 'mstrmojo.ObjectInputBox',
                            slot: '0,0',
                            alias: 'breakByInput',
                    item2textCss: function item2textCss(data){
                        return (this._super && this._super(data)) || 
                        {
                            12: 'a',
                            '-99': 'br'    //browse....
                        }[data.t] || '';//default is report level
                    },
                    emptyText: 'Type here to input breakby attributes...',
                    noEditButton: true,
                    browseItemVisible: true,
                            folderLinksContextId : 16,                     
                    browsableTypes: [E.TP.FOLDER, E.TP.ATTR].join(','),
                    getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                        mstrmojo.ME.MetricDataService.getAttributes(params, callbacks);
                    },
                    postCreate: function(refresh){
                                var grid = this.parent.dataGrid,
                            fw = grid && grid.parent;
                        this.candidates = fw.getCandidates(function(item){
                            return item.t === 12;
                        });
                        if(!refresh){
                            grid.candidatesListener.push(this);
                        }
                            }
                        },{
                            scriptClass: "mstrmojo.ToolBar",
                            slot: '0,1',
                            cssClass: 'mstrmojo-oivmSprite grouped', 
                            children:[{
                                scriptClass: "mstrmojo.Button",
                                title: "Browse",
                                iconClass: "tbBrowse",
                                onclick : function(){
                                        var editor = this.parent.parent.dataGrid.parent;
                                        editor.openPopup('ob', {zIndex: editor.zIndex + 10});
                                        
                                        var ob = editor.ob.browser;
                                        ob.browse({
                                            folderLinksContextId : 16,      
                                            onSelectCB: [this.parent.parent, 'onBreakByAdded'],
                                            browsableTypes: [E.TP.ATTR, E.TP.FOLDER].join(',') 
                                        });
                                    }
                                }]
                        }],
                        
                        onBreakByAdded: function(oi){
                            var editor = this.dataGrid.parent,
                                input = this.breakByInput;
                            
                            editor.closePopup();
                            
                            input.add([oi], input.items.length -1);
                        },
                        
                        getTokens: function(){
                            var its = this.breakByInput.getSelectedObjects(),
                            len = its.length, 
                            i, tks=[];
                        
                        if(len>0){
                            tks.push({v:'BreakBy'});
                            tks.push({v:'=',isDelimiter: true});
                            tks.push({v:'{', isDelimiter: true});
                            for(i=0;i<len;i++){
                                tks.push({v:_brackets(its[i].n), oi:its[i]});
                                if(i !== (len-1)){
                                    tks.push({v:',', isDelimiter: true});
                                }
                            }
                            tks.push({v:'}', isDelimiter: true});
                        }
                        return tks;
                    }
            };
            break;
        case -1: //sort by
            w =  {
                    scriptClass: 'mstrmojo.Table',
                    cssClass: 'sortBy',
                        layout: [{cells: [{cssText: 'width: 330px'}, {}]}],
                    getTokens: function(){
                      var its = this.sortByGrid.items,
                          len = its.length, 
                          i, tks=[];
                      
                      if(len>0){
                          tks.push({v:'SortBy'});
                          tks.push({v:'=',isDelimiter: true});
                          tks.push({v:'(', isDelimiter: true});
                          for(i=0;i<len;i++){
                              var it = its[i],
                              sit = it.selFrm || (it.dssforms && it.dssforms[0]),
                              tk = {v:_brackets(it.n), oi: it};
                              
                              if(sit && it.t == 12){
                                  _H.copy({ v: _brackets(it.n) + '@' + _brackets(sit.n),
                                      exv: sit.dssid,
                                      extp: 8}, tk);
                              }
                              
                              tks.push(tk);
                              if(i !== (len-1)){
                                  tks.push({v:',', isDelimiter: true});
                              }
                          }
                          tks.push({v:')', isDelimiter: true});
                      }
                      return tks;                    
                    },
                    children: [{
                        scriptClass: 'mstrmojo.DataGrid',
                        slot: '0,0',
                            cssClass: 'mstrmojo-functionArgs-sort',
                        alias: 'sortByGrid',
                        renderOnScroll: false,
                            resizableColumns: true,
                            makeObservable: true,
                        itemDisplayField: 'n',
                        columns:[
                                 {headerText:'Name', dataField: 'n', colCss:'nmCol'},
                                     {  
                                         headerText:'Field', dataField: 'field', colCss:'spcCol',
                                         dataWidget:{                
                                             scriptClass: "mstrmojo.Pulldown",
                                             bindings: {
                                                 items: 'this.data.dssforms'
                                             },
                                             popupToBody: true,
                                             popupZIndex: 100,
                                             onvalueChange: function(){
                                                 this.data.selFrm = this.selectedItem;
                                             }
                                         }
                                     },
                                 {  
                                     headerText:'Field', dataField: 'field', colCss:'spcCol',
                                     dataWidget:{                
                                         scriptClass: "mstrmojo.Pulldown",
                                         bindings: {
                                             items: 'this.data.dssforms'
                                         },
                                         popupToBody: true,
                                         popupZIndex: 100,
                                         onvalueChange: function(){
                                             this.data.selFrm = this.selectedItem;
                                         }
                                     }
                                 }, {
                                     headerText:'Order', dataField: 'order', colCss:'ordCol',
                                     dataWidget:{                
                                         scriptClass: "mstrmojo.Pulldown",
                                             items: [{n: 'Ascending', v: 0}, {n: 'Descending', v: 1}],
                                         itemIdField: 'v',
                                         popupToBody: true,
                                         popupZIndex: 100,
                                         onvalueChange: function(){
                                             this.data.asc = this.value;
                                         }
                                     }
                                 }, {  
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
                    }, {
                            scriptClass: "mstrmojo.ToolBar",
                        slot: '0,1',
                            cssClass: 'mstrmojo-oivmSprite grouped', 
                            children:[{
                                scriptClass: "mstrmojo.Button",
                                title: "Browse",
                                iconClass: "tbBrowse",
                                onclick : function(){
                                        var editor = this.parent.parent.dataGrid.parent;
                                        editor.openPopup('ob', {zIndex: editor.zIndex + 10});
                                        
                                        var ob = editor.ob.browser;
                                        ob.browse({
                                            folderLinksContextId : 16,      
                                            onSelectCB: [this.parent.parent, 'onSortByAdded'],
                                            browsableTypes: [E.TP.ATTR, E.TP.METRIC, E.TP.FOLDER].join(',') 
                                        });
                                    }
                                }]
                    }],
                    onSortByAdded: function(oi){
                      var editor = this.dataGrid.parent,
                      sbg = this.sortByGrid;
                      
                      editor.closePopup();
                      if(oi){
                          switch(oi.t){
                          case 12:
                              var success = function(res){
                                  if(res){
                                      var ctr = res.container;
                                      if(ctr && ctr.dssforms){
                                          oi.dssforms = ctr.dssforms;
                                          sbg.add([oi]);
                                      }
                                  }
                              },
                              failure = function(res){
                                  mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                              };
                                  mstrmojo.ME.MetricDataService.getAttributeForms({attributeID: oi.did,displayedForms:0}, {success: success, failure: failure});
                              break;
                          case 4:
                              oi.dssforms = [{n: 'Value'}];
                          default:
                              sbg.add([oi]); 
                          }
                      }
                  }
            };
            break;
        default:
            w = {
                scriptClass: 'mstrmojo.TextBox',
                    cssClass: 'mstrmojo-functionArgs-textInput',
                postCreate: function(props){
                    var d = this.data;
                    this.value = (d.dfv || d.dfv === 0) ? d.dfv : '';
                },
                getTokens: function(){
                    var d = this.data;
                    if(this.value !== d.dfv){
                            return [{v:d.n},{v:'=',isDelimiter: true},{v:this.value}];
                        }
                        return [];
                    }
                };
                break;
            }
        }
        
        w.alias = "inputWidget";
        
        return w;
    },
    _PROPFunction = function(d, idx, dataGrid){
        return '<div class="mstrmojo-DataRow-text"'+ 'title="' + (d.desc || '') + '">' + d.n + (d.isParam ? '*' : '') + ':</div>';
    };
    
    mstrmojo.ME.FunctionWizard = mstrmojo.declare(
            mstrmojo.Editor,
            null,
            {
                scriptClass: "mstrmojo.ME.FunctionWizard",

                cssClass: "mstrmojo-FunctionWidzard",   
                
                title: 'Function Arguments',
                
                fctOi: null,

                fctArgs: null,
                
                fctSyntax: '',
                
                bindings: {
                    candidates: "this.opener.candidates"
                },
                
                getCandidates: function getCandidates(f){
                    var cs = this.candidates,
                        its;
                    if(cs){
                        its = mstrmojo.array.filter(cs.items, f);
                        return {items: its, isComplete: cs.isComplete};
                    }
                    return null;
                },
                
                _set_candidates: function(n, v){
                    this.candidates = v;
                    if(this.hasRendered && this.visible){
                        var grid = this.argsGrid,
                            listeners = grid.candidatesListener,
                            len = listeners.length,
                            i;
                        for(i =0;i<len;i++){
                            listeners.postCreate(true);
                        }
                    }
                    return true;
                },
                
                onOpen: function(){
                    var me = this,
                        success = function(res){
                            if(res){
                                me.set('fctOi', res);
                                
                                //generate input for function properties and parameters
                                var ps = [], i, len, p, syntax = [];
                                syntax.push(res.n);
                                syntax.push('(');
                                len = res.pars && res.pars.length || 0;
                                for(i=0;i<len;i++){
                                    p = _H.copy(res.pars[i]);
                                    p.isParam = true;
                                    ps.push(p);
                                    syntax.push(res.pars[i].n);
                                    if(i != (len-1)){
                                        syntax.push(', ');
                                    }
                                }
                                syntax.push(')');
                                
                                if(res.rpc > 0){
                                    p.isRepeated = true;
                                }
                                
                                len = res.pros && res.pros.length || 0;
                                for(i=0;i<len;i++){
                                    ps.push(_H.copy(res.pros[i]));
                                }
                                if(res.ios){//order significant
                                    ps.push({n:'Sort By',dtp:-1,desc:'Sort By is a parameter representing the sort by levels for this function.'});
                                }
                                if(res.sqt === 5){//DssXmlFunctionSQLTypeRelative = 5;
                                    ps.push({n:'Break By',dtp:-2, desc:'Break By is a parameter representing the break by levels for this function.'});
                                }
                                me.set('fctArgs', ps);
                                me.set('fctSyntax', syntax.join(''));
                                
                            }
                            mstrmojo.css.removeClass(me.argsGrid.domNode, ['loading']);
                        },
                        failure = function(res){
                            mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                            mstrmojo.css.removeClass(this.argsGrid.domNode, ['loading']);
                        };
                    
                    this.argsGrid.set('items', []);
                    
                    mstrmojo.css.addClass(this.argsGrid.domNode, ['loading']);
                    
                    this.set('fctSyntax', '');
                    
                    this.set("title", "Function arguments for: " + this.fctOi.n);
                    
                    mstrmojo.ME.MetricDataService.getFunctionDetails(this.fctOi, {success: success, failure: failure});
                    
                },
                
                getTokens: function getTokens(){
                     var rs = this.argsGrid.ctxtBuilder.itemWidgets,
                         len = rs.length,
                         i, 
                         w, 
                         props = [], 
                         params = [], 
                         tks = [],
                         a,j,l,anyProp, 
                         oi = this.fctOi;
                     for(i=0;i<len;i++){
                         w = rs[i].inputWidget;
                         if(w.data.isParam){
                             params.push(w.getTokens());
                         } else {
                             props.push(w.getTokens());
                         }
                     }
                     tks.push({v:oi.n,oi:oi});

                     //properties
                     len = props.length;
                     if(len>0){
                         anyProp = false;
                         tks.push({v:'<', isDelimiter: true});
                         for(i=0;i<len;i++){
                             a = props[i];
                             l = a.length;
                             if(l === 0){
                                 continue;
                             }
                             anyProp = true;
                             for(j=0;j<l;j++){
                                 tks.push(a[j]);
                             }
                             tks.push({v:',', isDelimiter: true});   
                         }

                         tks.pop();
                         
                         if(anyProp){
                             tks.push({v:'>', isDelimiter: true});
                         }
                     }
                     
                     //parameters
                     len = params.length;
                     tks.push({v:'(', isDelimiter: true});
                     anyProp = false;
                     for(i=0;i<len;i++){
                         a = params[i];
                         l = a.length;
                         if(l === 0){
                             continue;
                         }
                         anyProp = true;
                         for(j=0;j<l;j++){
                             tks.push(a[j]);
                         }
                         
                         tks.push({v:',', isDelimiter: true});   
                     }
                     if(anyProp){
                         tks.pop();
                     }
                     tks.push({v:')', isDelimiter: true});
                     
                     for(i=0,len=tks.length;i<len;i++){
                         tks[i].isNew = true;
                     }
                     
                     return tks;
                },
                
                ob: {
                    scriptClass: "mstrmojo.Editor",
                    title: mstrmojo.desc(5298,"Select an Object"),
                    help: "Select_Objects_dialog_box_.htm",
                    children: [{
                        scriptClass : "mstrmojo.ObjectBrowser", 
                        alias: "browser", 
                        cssText: "width:200px",
                        fishEyeVisible: false,
                        closeable: false,   
                        closeOnSelect: false
                    }]
                },
                children: [ 
                           {
                               scriptClass: "mstrmojo.DataGrid",
                               alias: 'argsGrid',
                               cssClass: "functionArgs",
                               banding: false,
                               columns:[
                                        {headerText:'Property Name', dataFunction:_PROPFunction,colCss:'name'},
                                        {headerText:'Property Type', dataWidgetBuilder: _DTPBuilder,colCss:'dtp'}
                                        ],
                               postCreate: function(){
                                   this.candidatesListener = [];
                               },
                               bindings: {
                                   items: "this.parent.fctArgs"
                               }
                           },
                           {
                               scriptClass: "mstrmojo.Label",
                               cssClass: 'mstrmojo-FW-syntaxLabel',
                               text: '',
                               bindings: {
                                   text: function(){return this.parent.fctSyntax;}
                               }
                           },                               
                           {
                               scriptClass: "mstrmojo.Label",
                               cssClass: 'mstrmojo-FW-descLabel',
                               text: '',
                               bindings: {
                                   text: function(){return this.parent.fctOi.desc;}
                               }
                           },                             
                           {
                               scriptClass: 'mstrmojo.HBox',
                               slot:"buttonNode",
                               cssClass: 'mstrmojo-FW-buttonBox',
                               children:[
                                         {
                                             scriptClass: "mstrmojo.HTMLButton",
                                             cssClass: "mstrmojo-Editor-button",
                                             text: "OK",
                                             onclick : function(){
                                                 var e = this.parent.parent;
                                                 if(e.insertOnFinish){
                                                     e.insertOnFinish(e.getTokens());
                                                 }
                                                 e.close();
                                             }
                                         },
                                         {
                                             scriptClass: "mstrmojo.HTMLButton",
                                             cssClass: "mstrmojo-Editor-button",
                                             text: mstrmojo.desc(221,"Cancel"),
                                             onclick: function(){
                                                 var e = this.parent.parent;
                                                 e.close();
                                             }
                                         }
                                         ]
                           }                           
                           ]
                           
            }
     );
})();