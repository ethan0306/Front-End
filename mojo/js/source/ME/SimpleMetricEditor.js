(function () {

    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.expr",
            "mstrmojo.Table",
            "mstrmojo.CheckBox",
            "mstrmojo.ME.TokenInputBox",
            "mstrmojo.ME.LevelInputBox",
            "mstrmojo.ME.ConditionInputBox",
            "mstrmojo.ME.TransformInputBox",
            "mstrmojo.ME.MetricDataService",
            "mstrmojo.DataGrid",
            "mstrmojo.Button",            
            "mstrmojo.ToolBar",            
            "mstrmojo.ObjectBrowser",
            "mstrmojo.Editor"
            );

    var simpleMetricContent1 = [
                                
                                //aggregation function
                                {
                                    scriptClass:'mstrmojo.Label',
                                    text: 'Aggregation Function: ',
                                    slot: '0,0'
                                },
                                {   
                                    scriptClass:'mstrmojo.Pulldown',
                                    itemIdField: 'did',
                                    itemField: 'n',
                                    cssText: 'width:250px;margin:0px;',
                                    alias: 'fctPulldown', 
                                    slot: '0,1'
                                },
                                {
                                    scriptClass: "mstrmojo.HTMLButton",
                                    cssClass: "mstrmojo-Editor-button optsFunc",
                                    text: "",
                                    title: "Function Properties",
                                    onclick : function(){

                                    },
                                    slot: '0,2'
                                },
                                
                                //Expression
                                {
                                    scriptClass:'mstrmojo.Label',
                                    text: 'Expression: ',
                                    slot: '1,0'
                                },
                                {
                                    scriptClass:'mstrmojo.ME.TokenInputBox',
                                    alias: 'exprInput', 
                                    cssClass: 'expr',
                                    cssText: 'width: 250px;',
                                    slot: '1,1'
                                },  
                                {
                                    scriptClass: "mstrmojo.ToolBar",
                                    slot: '1,2',
                                    cssClass: 'mstrmojo-oivmSprite grouped',
                                    cssText: 'margin-right: 42px;',                                    
                                    children:[                                
                                        {
                                            scriptClass: "mstrmojo.Button",
                                            title: "Browse",
                                            iconClass: "tbBrowse",
                                            onclick : function(){
                                                var me = this.parent.parent.parent;
                                                browseObject(me, 'expression');
                                            }
                                        }]
                                    }
                                ],
                                
     simpleMetricContent2 = [
                                
                                //Level
                                {
                                    scriptClass:'mstrmojo.Label',
                                    text: 'Level: ',
                                    slot: '0,0'
                                },
                                {
                                    scriptClass:'mstrmojo.ME.LevelInputBox',
                                    emptyText: 'Type your level here...',
                                    alias: 'levelInput',
                                    reportLevelAdded: true,
                                    onadd: function(evt){
                                        var sos = this.getSelectedObjects();
                                        this.set('reportLevelAdded', mstrmojo.array.find(sos, 'did', -1)>-1);
                                    },
                                    onremove: function(evt){
                                        var sos = this.getSelectedObjects();
                                        this.set('reportLevelAdded', mstrmojo.array.find(sos, 'did', -1)>-1);
                                    },
                                    slot: '0,1'
                                }, 
                                {
                                    scriptClass: "mstrmojo.ToolBar",
                                    slot: '0,2',
                                    cssClass: 'mstrmojo-oivmSprite grouped',
                                    children:[
                                              {
                                                   scriptClass: "mstrmojo.Button",
                                                   title: "Browse",
                                                   iconClass: "tbBrowse",
                                                   onclick : function(){
                                                       var me = this.parent.parent.parent;
                                                       browseObject(me, 'level');
                                                   }
                                               },                                              
                                                {
                                                    scriptClass: "mstrmojo.Button",
                                                    iconClass: "tbOptions",
                                                    title: 'Level Advanced Options',
                                                    onclick : function(){
                                                       var me = this.parent.parent.parent;
                                                       me.openPopup('levelAdvRef', {
                                                               saveLevelOptions: function(cc,fr){
                                                                   me.levelCanContinue = cc;
                                                                   me.levelFilterRest = fr;
                                                               },
                                                               zIndex: me.zIndex + 10
                                                           });
                                                    }
                                                },
                                                {
                                                    scriptClass: "mstrmojo.Button",
                                                    title: "Add Report Level",
                                                    iconClass: "tbReport",
                                                    bindings: {
                                                        enabled: "!this.parent.parent.levelInput.reportLevelAdded"
                                                    },
                                                    onclick : function(){
                                                        var li = this.parent.parent.levelInput;
                                                        li.add([{n:"Report Level", did: -1, t: -1, state:0}], li.items.length-1);
                                                    }
                                                }
                                        ]
                                },
                                
                                //Condition
                                {
                                    scriptClass:'mstrmojo.Label',
                                    text: 'Condition: ',
                                    slot: '1,0'
                                },
                                {
                                    scriptClass:'mstrmojo.ME.ConditionInputBox',
                                    cssClass:'mstrmojo-ObjectInputBox singleObject',
                                    cssText: 'width:252px;',
                                    emptyText: 'Type your condition here...',
                                    alias:'conditionInput',
                                    slot: '1,1'
                                }, 
                                {
                                    scriptClass: "mstrmojo.ToolBar",
                                    slot: '1,2',
                                    cssClass: 'mstrmojo-oivmSprite grouped',
                                    children: [
                                               {
                                                   scriptClass: "mstrmojo.Button",
                                                   title: "Browse",
                                                   iconClass: "tbBrowse",
                                                   bindings:{
                                                       enabled: "!this.parent.parent.conditionInput.isFull"
                                                   },
                                                   onclick : function(){
                                                       var me = this.parent.parent.parent;
                                                       browseObject(me, 'condition');
                                                   }
                                               },                                              
                                                {
                                                    scriptClass: "mstrmojo.Button",
                                                    iconClass: "tbOptions",
                                                    title: "Condition Advanced Options",
                                                    onclick : function(){
                                                       var me = this.parent.parent.parent;
                                                       me.openPopup('conditionAdvRef', {
                                                               saveConditionOptions: function(em,ife){
                                                                   me.conditionEmbedMethod = em;
                                                                   me.conditionIgnoreFilterElem = ife;
                                                               },
                                                               zIndex: me.zIndex + 10
                                                           });                
                                                    }
                                                }
                                        ]
                                },    
                                
                                //Transformation
                                {
                                    scriptClass:'mstrmojo.Label',
                                    text: 'Transformation: ',
                                    slot: '2,0'
                                },
                                {
                                    scriptClass: 'mstrmojo.DataGrid',
                                    cssClass: 'transfromGrid',
                                    cssText: 'width:100%',
                                    alias: 'transformationGrid',
                                    makeObservable: true,
                                    renderOnScroll: false,
                                    resizableColumns: true, 
                                    itemDisplayField: 'n',
                                    slot: '2,1',
                                    columns:[
                                             {headerText:'Name', dataField: 'n', colCss:'nmCol'},
                                             {headerText:'Description', dataField: 'ds', colCss:'dscCol'},
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
                                scriptClass: "mstrmojo.ToolBar",
                                slot: '2,2',
                                cssClass: 'mstrmojo-oivmSprite grouped',
                                children: [
                                        {
                                            scriptClass: "mstrmojo.Button",
                                            title: "Browse",
                                            iconClass: "tbBrowse",
                                            onclick : function(){
                                                var me = this.parent.parent.parent;
                                                browseObject(me, 'transform');
                                            }
                                        },
                                        {
                                            scriptClass: "mstrmojo.Button",
                                            title: "Move Up",
                                            iconClass: "tbMoveUp",
                                            onclick : function(){                                                
                                                var grid = this.parent.parent.transformationGrid,
                                                    si = grid && grid.selectedIndex,
                                                    len = grid && grid.items.length,
                                                    insert, select;
                                                if(si>-1){//has selection
                                                    insert = (si === 0) ? len : si - 1;
                                                    grid.move(si, insert);
                                                    select = (si === 0) ? len -1 : si - 1;
                                                    grid.singleSelect(select);
                                                }
                                            }
                                        },
                                        {
                                            scriptClass: "mstrmojo.Button",
                                            title: "Move Down",
                                            iconClass: "tbMoveDown",
                                            onclick : function(){
                                                var grid = this.parent.parent.transformationGrid,
                                                    si = grid && grid.selectedIndex,
                                                    len = grid && grid.items.length,
                                                    insert, select;
                                                if(si>-1){//has selection
                                                    insert = (si === (len-1)) ? 0 : si + 2;
                                                    grid.move(si, insert);
                                                    select = (si === (len-1)) ? 0 : si + 1;
                                                    grid.singleSelect(select);
                                                }
                                            }
                                        }                                         
                                ]}
     ], 
    E = mstrmojo.expr,
    ARR = mstrmojo.array,
    browseObject = function(me, t){
      var tps, cb;
      switch(t){
      case 'level':
          tps = [E.TP.ATTR, E.TP.DIM];
          cb = 'onLevelAdded';
          fctxt = 16;
          break;
      case 'transform':
          tps = [E.TP.ROLE];//need to add the subtype
          cb = 'onTransformAdded';          
          fctxt = 26; 
          break;
      case 'condition':
          tps = [E.TP.FILTER, E.STP.PROMPT_OBJECTS];
          cb = 'onConditionAdded';          
          fctxt = 10;
          break;
      case 'expression':
          tps = [E.TP.FACT, E.TP.ATTR, E.TP.FUNCTION, E.TP.METRIC];
          cb = 'onExpressionAdded';          
          fctxt = 25; //new context
          break;          
      default: 
      }
      
      //Add the folder as a browseable type
      tps[tps.length] = E.TP.FOLDER;
        
      me.openPopup('ob',{zIndex: me.zIndex + 10});
      
      var ob = me.ob.browser;
      
      ob.browse({
          folderLinksContextId : fctxt,      
          onSelectCB: [me, cb],
          browsableTypes: tps.join(',')
      });
    },
    FILTERINGS = {1: '+', 2: '%', 3: '*', 4: ''},
    GROUPINGS = {1: '', 2: '!', 3: '<', 4: '>', 5: '<|', 6: '>|'},
    _brackets = mstrmojo.ME.MetricToken.brackets;
    
    
    mstrmojo.ME.SimpleMetricEditor = mstrmojo.declare(
            // superclass
            mstrmojo.Editor,
            // mixins
            null,
            // instance members
            {
                scriptClass: "mstrmojo.ME.SimpleMetricEditor",

                cssClass: "mstrmojo-SimpleMetricEditor",
                
                title: "Simple Metric",
                
                bindings: {
                    candidates: "this.opener.candidates"
                },
                
                getMetricDefAsTokens: function getMetricDefAsTokens(){
                    var fct = this.metricContent1.fctPulldown.selectedItem, //function
                        expr =  this.metricContent1.exprInput.items,
                        levels = this.metricContent2.levelInput.getSelectedObjects(),
                        fltr =  this.metricContent2.conditionInput.getSelectedObjects(),
                        trfms = this.metricContent2.transformationGrid.items,
                        tokens = [], i, len;
                    
                    //function
                    tokens.push({v: fct.n, oi: fct});
                    
                    //expr
                    tokens.push({v:'(',isDelimiter: true});
                    for(i=0,len=expr.length;i<len;i++){
                        tokens.push(expr[i]);
                    }
                    tokens.push({v:')',isDelimiter: true});
                    
                    //levels
                    tokens.push({v:'{',isDelimiter: true});
                    var lvl = null;
                    for(i=0,len=levels.length;i<len;i++){
                        lvl = levels[i];
                        //grouping 
                        tokens.push({v:GROUPINGS[lvl.grouping], isDelimiter: true});                        
                        tokens.push((lvl.did === -1) ? {v:'~',isDelimiter: true} : {v: _brackets(lvl.n), oi:lvl});
                        //filtering
                        tokens.push({v:FILTERINGS[lvl.filtering], isDelimiter: true});   
                        if(i<(len-1)){
                            tokens.push({v:',', isDelimiter: true}); 
                        }
                    }
                    if(!this.levelFilterRest){
                        tokens.push({v:';', isDelimiter: true});
                        tokens.push({v:'-', isDelimiter: true}); 
                    }
                    if(!this.levelCanContinue){
                        tokens.push({v:';', isDelimiter: true});
                        tokens.push({v:'/', isDelimiter: true});
                    }
                    tokens.push({v:'}',isDelimiter: true});
                    
                    //filter
                    if(fltr.length>0){
                        tokens.push({v:'<', isDelimiter: true});
                        //tokens.push({v:'[', isDelimiter: true});
                        tokens.push({v:_brackets(fltr[0].n), oi: fltr[0]});
                        //tokens.push({v:']', isDelimiter: true});  
                        tokens.push({v:';', isDelimiter: true}); 
                        tokens.push({v:'@', isDelimiter: true});        
                        tokens.push({v:this.conditionEmbedMethod});
                        tokens.push({v:';', isDelimiter: true}); 
                        tokens.push({v:this.conditionIgnoreFilterElem ? '-' : '+', isDelimiter: true});                         
                        tokens.push({v:'>', isDelimiter: true});     
                     }
                    
                    //transformations
                    len=trfms.length;
                    if(len>0){
                        tokens.push({v:'|',isDelimiter: true});
                        var tr = null;
                        for(i=0;i<len;i++){
                            tr = trfms[i];
                            tokens.push({v: _brackets(tr.n), oi:tr});   
                            if(i<(len-1)){
                                tokens.push({v:',', isDelimiter: true}); 
                            }
                        }
                        tokens.push({v:'|',isDelimiter: true});
                    }
                    
                    //init its properties
                    for(i = 0, len = tokens.length;i<len;i++){
                        tokens[i].isNew = true;
                    }
                    
                    return tokens;
                },
                
                levelCanContinue: true,
                
                levelFilterRest: true,
                
                conditionEmbedMethod: 2, 
                
                conditionIgnoreFilterElem: true,
                
                insertMode: false, 
                
                _set_candidates: function(n, v){
                    this.candidates = v;
                    if(this.hasRendered && this.visible){
                        var ei = this.metricContent1.exprInput,
                            li = this.metricContent2.levelInput;
                        ei.candidates = this.candidates;
                        li.candidates = this.getCandidates(12);
                    }
                    return true;
                },
                
                getCandidates: function getCandidates(t){
                    var cs = this.candidates,
                        its;
                    if(cs){
                        its = ARR.filter(cs.items, function(it){return it.t === t;});
                        return {items: its, isComplete: cs.isComplete};
                    }
                    return null;
                },
                
                onOpen: function onOpen(){
                    //decide between save or insert
                    var sb = this.buttonPanel.saveokButton,
                        ei = this.metricContent1.exprInput,
                        li = this.metricContent2.levelInput;
                    
                    if(this.insertMode){
                        sb.set('text', 'Insert');                        
                    } else {
                        sb.set('text', 'Save');
                    }
                    
                    
                    var fcts = mstrmojo.ME.MetricDataService.getAggFunctions(),
                        fp = this.metricContent1.fctPulldown;
                    if(fcts && fp){
                        fp.set('items', fcts);
                        fp.set('value', '8107C31BDD9911D3B98100C04F2233EA');//Sum 
                    }

                    //candidates for expression, levels input
                    ei.candidates = this.candidates;
                    ei.set('items', []);
                    
                    li.candidates = this.getCandidates(12);
                    li.set('items', [{n:"Report Level", did: -1, t: -1, state:0}]);
                    
                    //candidates for filter input
                    var fb = this.metricContent2.conditionInput;
                    if(!fb.candidates){
                        var success = function(res){
                                if(res){
                                    var cds = {items: res.items, isComplete: (res.bc === -1 || (res.bb + res.bc > res.sz))};
                                    fb.set('candidates', cds);
                                }
                            },
                            failure = function(res){
                                mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                            };
                       mstrmojo.ME.MetricDataService.getFilters({pattern:'*', blockBegin:1, blockCount:-1}, {success: success, failure: failure});
                    }
                    fb.set('items', []);
                    
                    //clear transformation
                    var tg = this.metricContent2.transformationGrid;
                    tg.set('items', []);
                },
                
                ob: {
                    scriptClass: "mstrmojo.Editor",
                    title: mstrmojo.desc(5298,"Select an Object"),
                    help: "Select_Objects_dialog_box_.htm",
                    children: [{
                        scriptClass : "mstrmojo.ObjectBrowser", 
                        alias: "browser", 
                        cssText: "width:200px;",
                        fishEyeVisible: false,
                        closeable: false,   
                        closeOnSelect: false
                    }]
                },
                
                levelAdvRef: {
                    scriptClass: "mstrmojo.Editor",
                    title: "Level Advanced Options",
                    cssText: "width: 386px;",
                    onOpen: function(){
                        var o = this.opener;
                        this.contentTable.ccCheckBox.set('checked', o.levelCanContinue);
                        this.contentTable.frCheckBox.set('checked', o.levelFilterRest);
                    },
                    children: [{
                        scriptClass: "mstrmojo.Table",
                        alias: 'contentTable',
                        rows: 3,
                        cols: 1,
                        children: [{
                            scriptClass : "mstrmojo.CheckBox", 
                            alias: 'ccCheckBox',
                            slot:'0,0',
                            label:"Allow other users to add extra units to this definition"
                        },{
                            scriptClass : "mstrmojo.CheckBox", 
                            alias: 'frCheckBox',
                            slot:'1,0',
                            label:"Include filter attributes which are not in report or level in metric calculation"
                        }]
                    },{
                        scriptClass: 'mstrmojo.HBox',
                        slot:"buttonNode",
                        cssText: "float:right;margin: 5px 0px;",
                        children:[
                                  {
                                      scriptClass: "mstrmojo.HTMLButton",
                                      cssClass: "mstrmojo-Editor-button",
                                      text: "OK",
                                      onclick : function(){
                                          var e = this.parent.parent;
                                          e.saveLevelOptions(e.contentTable.ccCheckBox.checked, e.contentTable.frCheckBox.checked);
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
                    }]
                },
                
                conditionAdvRef: {
                    scriptClass: "mstrmojo.Editor",
                    title: "Condition Advanced Options",
                    cssText: "width: 286px;",
                    onOpen: function(){
                        var o = this.opener;
                        this.contentTable.emPulldown.set('value', o.conditionEmbedMethod);
                        this.contentTable.irfeCheckBox.set('checked', o.conditionIgnoreFilterElem);
                    },
                    children: [{
                        scriptClass: "mstrmojo.Table",
                        alias: 'contentTable',
                        rows: 3,
                        cols: 1,
                        children: [{
                            scriptClass : "mstrmojo.Label", 
                            slot:'0,0',
                            text:"Interaction between metric filter and report filter:"
                        },{
                            scriptClass : "mstrmojo.Pulldown", 
                            alias: 'emPulldown',
                            itemField: 'n',
                            itemIdField: 'did', 
                            slot:'1,0',
                            value: 2, 
                            items: [
                                    {n: 'Merge into new', did: 1},
                                    {n: 'Merge report filter into metric', did: 2},
                                    {n: 'Merge metric condition into report', did: 3}
                            ]
                        },{
                            scriptClass : "mstrmojo.CheckBox", 
                            alias: 'irfeCheckBox', 
                            slot:'2,0',
                            label:"Ignore related report filter elements"
                        }]
                    },{
                        scriptClass: 'mstrmojo.HBox',
                        slot:"buttonNode",
                        cssText: "float:right;margin: 5px 0px;",
                        children:[
                                  {
                                      scriptClass: "mstrmojo.HTMLButton",
                                      cssClass: "mstrmojo-Editor-button",
                                      text: "OK",
                                      onclick : function(){
                                          var e = this.parent.parent;
                                          e.saveConditionOptions(e.contentTable.emPulldown.value, e.contentTable.irfeCheckBox.checked);
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
                    }]
                },
                
                onLevelAdded: function(oi){
                    var lib = this.metricContent2.levelInput;
                    oi.state = 0; 
                    lib.add([oi],lib.items.length - 1);
                    this.closePopup();
                },
                
                onConditionAdded: function(oi){
                    var fb = this.metricContent2.conditionInput;
                    //fb.set('value',oi.n);
                    oi.state = 0;
                    fb.add([oi],fb.items.length - 1);
                    //this.filter = oi;
                    this.closePopup();
                },
                
                onExpressionAdded: function(oi){
                    var eib = this.metricContent1.exprInput;
                    eib.add([{v:oi.n, oi:oi, isNew: true}]);
                    this.closePopup();
                },
                
                onTransformAdded: function(oi){
                    oi.state = 0;
                    var tib = this.metricContent2.transformationGrid;
                    tib.add([oi], tib.items.length);
                    this.closePopup();
                },
                
                
                children: [
                           {
                               scriptClass: 'mstrmojo.Table',
                               cssClass: 'mstrmojo-SME-content1',
                               alias: 'metricContent1',
                               //rows: 2,
                               //cols: 3,  
                               layout: [
                                        //First row
                                        {
                                            cells: [{}, {},{}]
                                        },
                                        //Second row
                                        {
                                            cells: [{}, {cssText: 'width:252px;padding-right:6px;'},{cssText: 'width:77px;'}]
                                        }
                               ],                               
                               cellPadding: 3,
                               children: simpleMetricContent1
                           },
                           {
                               scriptClass:'mstrmojo.HBox',
                               children:[
                               {
                                   scriptClass: 'mstrmojo.Button',
                                   cssClass: 'mstrmojo-SME-toggleAdvance',
                                   text: 'Level, Condition and Transformation',
                                   onclick: function(evt){
                                       var me = this.parent.parent, 
                                           ex = !!!me.expanded; 
                                       me.set('expanded', ex);
                                       this.set('selected', ex);
                                   }
                               }]
                           },
                           {
                               scriptClass: 'mstrmojo.Table',
                               cssClass: 'mstrmojo-SME-content2',
                               alias: 'metricContent2',
                               layout: [
                                        //First row
                                        {
                                            cells: [{}, {},{}]
                                        },
                                        //Second row
                                        {
                                            cells: [{}, {},{}]
                                        },
                                        //Third row
                                        {
                                            cells: [{}, {cssText: 'width:252px;padding-right:6px;'},{cssText: 'width:77px;'}]
                                        }
                               ],
                               //rows: 3,
                               //cols: 3,  
                               cellPadding: 3,
                               bindings: {
                                   visible: 'this.parent.expanded'
                               },
                               children: simpleMetricContent2
                           },
                           
                           {
                               scriptClass: 'mstrmojo.HBox',
                               alias:"buttonPanel",
                               slot:"buttonNode",
                               cssClass: 'mstrmojo-SME-buttonsHBox',
                               children:[
                                         {
                                         scriptClass: 'mstrmojo.HBox',
                                         cssText:"width:10px;",
                                         bindings: {
                                             visible: "!this.parent.parent.insertMode"
                                         },                                         
                                         children:[
                                                 {
                                                     scriptClass: "mstrmojo.HTMLButton",
                                                     cssClass: "mstrmojo-Editor-button",
                                                     alias: 'editButton',
                                                     text: "Formatting...",
                                                     onclick : function(){
                                                        
                                                     }
                                                 },  
                                                 {
                                                     scriptClass: "mstrmojo.HTMLButton",
                                                     cssClass: "mstrmojo-Editor-button",
                                                     alias: 'optButton',
                                                     text: "Options...",
                                                     onclick : function(){
                                                      
                                                     }
                                                 }
                                             ]
                                         },                                            
                                         {
                                             scriptClass: "mstrmojo.HTMLButton",
                                             cssClass: "mstrmojo-Editor-button",
                                             alias: 'saveokButton',
                                             text: "OK",
                                             onclick : function(){
                                                 var e = this.parent.parent;
                                                 if(e.insertMode){
                                                     e.insertOnFinish(e.getMetricDefAsTokens());
                                                 } else {
                                                    
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
            });
    
})();