(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.fx",
            "mstrmojo.Box",
            "mstrmojo.Editor", 
            "mstrmojo.Button",
            "mstrmojo._FormatDefinition",
            "mstrmojo.TabListContainer",
            "mstrmojo.TabNameList",
            "mstrmojo.StackContainer",
            "mstrmojo.FontFormatter",
            "mstrmojo.NumberFormatter",
            "mstrmojo.AlignmentFormatter",
            "mstrmojo.PaddingFormatter",
            "mstrmojo.FillFormatter",
            "mstrmojo.BorderFormatter");
    //Utils
    var _A = mstrmojo.array,
    _H = mstrmojo.hash, 
    _FD = mstrmojo._FormatDefinition,
    _B = mstrmojo.Button,
    MAP = _FD.MetricFormatTarget;
    
    //Constants
    var btnClr = '#999',
    btnCls = 'mstrmojo-Editor-button',
    DEF_FORMAT = _H.clone(_FD.DefaultFormat); //TBD, for chart formatting
    DEF_FORMAT.FormattingPatternsChart = {
            'FillColor': '16777215',
            'FillStyle': '0',
            'GradientColor': '16777215',
            'GradientAngle': '0',
            'GradientXOffset': '0',
            'GradientYOffset': '0'
    };
    DEF_FORMAT.FormattingPatterns = _H.clone(DEF_FORMAT.FormattingPatternsChart);
   
    //Widgets
    
    // Number panel
    var nmPnl = mstrmojo.insert({
        n: mstrmojo.desc(3434),//Descriptor: Number
        scriptClass : 'mstrmojo.NumberFormatter',
        pr: 'FormattingNumber'
    }),
    
    //Alignment panel
    algnPnl = mstrmojo.insert({
        n: mstrmojo.desc(3435),//Descriptor: Alignment
        scriptClass: 'mstrmojo.Box',
        pr: ['FormattingAlignment',  'FormattingPadding'],
        cssClass: 'alignmentPanel',
        children: [{
            scriptClass : 'mstrmojo.AlignmentFormatter',
            bindings: {
                model: 'this.parent.FormattingAlignment'
            }
            }, {
            scriptClass : 'mstrmojo.PaddingFormatter',
            bindings: {
                model: 'this.parent.FormattingPadding'
            }
        }]
    }),
    
    // Font panel
    fntPnl = mstrmojo.insert({
        n: mstrmojo.desc(3433),//Descriptor: Font
        scriptClass : 'mstrmojo.FontFormatter',
        pr: 'FormattingFont',
        cssClass: 'mstrmojo-FormatEditor-fontTable',
        cellPadding: 5
    }),
    
    //Border panel
    brdrPnl = mstrmojo.insert({
        n: mstrmojo.desc(2886),//Descriptor: Borders
        scriptClass : 'mstrmojo.BorderFormatter',
        pr: 'FormattingBorder'
    }),
    
    //Background panel
    bgPnl = mstrmojo.insert({
        n: mstrmojo.desc(3905),//Descriptor: Background
        scriptClass : 'mstrmojo.FillFormatter',
        pr: 'FormattingPatterns'
    }),
    
    //Chart panel
    chtPnl = mstrmojo.insert({
        n: 'Graph',
        scriptClass : 'mstrmojo.FillFormatter',
        pr: 'FormattingPatternsChart'
    });
    
    
    /**
     * <p>Format editor for metric editor</p>
     *
     * @class
     * @extends mstrmojo.Editor
     */
    mstrmojo.ME.MetricFormatEditor = mstrmojo.declare(
    
            //superclass
            mstrmojo.Editor,
            
            //mixins
            null,
            
            /**
             * @lends mstrmojo.FormatEditor.prototype
             */
            {
                scriptClass: 'mstrmojo.ME.MetricFormatEditor',
                
                cssClass: 'mstrmojo-FormatEditor',
                
                title: mstrmojo.desc(2116),//Descriptor: Format
                
                /**
                 * <p>This is object containing level 0 items array and related formatting properties</p>
                 * <pre>
                 *     model: {
                 *                     n: ....
                 *                     header_format: {...}
                 *                     grid_format: {...}
                 *             ...
                 *             }
                 * </pre>
                 */   
                model: null,
                
                /**
                 * <p> The observable model </p>
                 */
                obModel: null,
           
               _initModel: function() {
                    if(!this.model){
                        this.model = {};
                        for(var i = 0; i< MAP.length; i++){
                            this.model[MAP[i].p] = {};
                        }
                    }
                
                   if (!this.obModel) {
                        //create observable model
                         this.obModel = new mstrmojo.Model({
                             //
                             onlevelNameChange: function(evt) {
                                 // save changes 'model' first:
                                 var was = evt.valueWas;
                                 if (was) {
                                     this._updateModel(was);
                                 }
                                 this._setCurrentFormat();
                             },
                             onmodelChange: function() {
                                 return this.model? this._setCurrentFormat() : false;
                             },
                             //When switch level, save currentFormat to corresponding model item's format property
                             _updateModel: function(ln) {
                                 var cf = _H.copy(this.currentFormat),
                                 ln = ln || this.levelName,
                                 mf = this.model[ln];
                                 if(!mf){
                                     mf = this.model[ln] = {};
                                 }
                                 
                                 _FD.extractModel(cf, mf, DEF_FORMAT);
                                 this.model.set(ln, mf);
                             },
                             //For a currently selected level item, prepare its currentFormat
                             _setCurrentFormat: function() {
                                 var cf = this.model? _H.copy(this.model[this.levelName|| MAP[0].p]) : {};
                                 cf = _FD.getStandardFormat(cf, DEF_FORMAT);
                                 this.set('currentFormat', cf);
                             }
                         });
                     }
               },
               
               init: function(props) {
                   this._initModel();
                   this._super(props);
               },
               
               onmodelChange: function() {
                   this._initModel();
                   
                   //setup model
                   var fem = this.obModel,
                   tm = _H.clone(this.model) || {};
                   //Fro Graph chart tab
                   if(tm){
                       var cht = {};
                      
                      if(tm && tm[MAP[0].p]) {
                          var ptns = tm[MAP[0].p].FormattingPatterns;
                          if(ptns){
                              for(pr in ptns){
                                  if(pr.match(/^Series\w+/gi)){
                                      cht[pr.substring(6, pr.length)] = ptns[pr];
                                  }
                              }
                          }
                          tm[MAP[0].p].FormattingPatternsChart = cht;//{} for empty.
                      }
                    }
                   
                   if(tm&& !tm.attachEventListener){
                       _H.make(tm, mstrmojo.Obj)
                   }
                   fem.set('model', tm);
                   
                   //set level name if provided in model
                   fem.set('levelName', fem.levelName || MAP[0].p);
               },
               
               onClearFormat: function() {
                   //clear current format and obModel
                   var obm = this.obModel;
                   
                   for (var i = 0; i < MAP.length; i ++ ) {
                       delete obm.model[MAP[i].p];                   
                   }
                   obm._setCurrentFormat();
               },
               
               onOK: function() {
                   var obm = this.obModel;
                   //save current model to obm.model
                   obm._updateModel();
                   
                   //Chart format is saved in pattern format, due to backend design.
                   var hfmt = obm.model[MAP[0].p];
                   if(hfmt){
                       var ptn = hfmt.FormattingPatterns,
                       cht = hfmt.FormattingPatternsChart;
                       if(cht){
                           for(pr in DEF_FORMAT.FormattingPatternsChart){
                               if(cht[pr] != null){
                                   ptn['Series' + pr] = cht[pr];
                               }
                           }
                           delete cht;
                       }
                   }
                   _FD.saveFormatModel(obm.model, this.model,  [MAP[0].p, MAP[1].p], _FD.DefaultFormat);
               },
                
                children: [{
                    scriptClass: "mstrmojo.VBox",
                    children:[{
                                  scriptClass: "mstrmojo.HBox",
                                  alias: 'btns',
                                  children: [{
                                      scriptClass:'mstrmojo.Pulldown',
                                      alias: 'which',
                                      items:  MAP,
                                      itemIdField: 'v',
                                      bindings: {
                                          value: function(){
                                              var idx = _A.find(this.items, 'p', this.parent.parent.parent.obModel.levelName);
                                              return this.items[idx != -1? idx : 0][this.itemIdField];
                                          }
                                      },
                                      cssClass: ' mstrmojo-FormatEditor-DropDownButton',
                                      popupToBody: true,
                                      popupZIndex: 100,
                                      value: MAP[0].v,
                                      onvalueChange: function(){//Set right StackContainer children
                                          var editor = this.parent.parent.parent,
                                          fp = this.parent.parent.formatPanels,
                                          stck = fp && fp.stck,
                                          it = this.selectedItem;
                                          
                                          if(editor && editor.obModel && stck){
                                               editor.obModel.set('levelName',  it ? it.p : MAP[0].p);
                                               if(it ==null || it.p == MAP[0].p){
                                                   if(_A.find(stck.children, 'id', chtPnl.id) == -1){
                                                       stck.addChildren(chtPnl);
                                                       stck.onchildRenderingChange(chtPnl);
                                                   }
                                               } else {
                                                   stck.removeChildren(chtPnl);
                                               }
                                          } 
                                      }
                                  },
                                 //Clear button
                                 new _B.newInteractiveButton (
                                         mstrmojo.desc(5976), //Descriptor: Clear Format, 
                                         function(evt) {
                                             var editor = this.parent.parent.parent;
                                              editor.onClearFormat && editor.onClearFormat();
                                         }, 
                                         btnClr, 
                                         {alias: 'btnClear', cssClass: btnCls + ' clear'}
                                 )]
                              },
                              //format panels
                              {
                                  scriptClass: 'mstrmojo.TabListContainer',
                                  alias: 'formatPanels',
                                  listCssClass: 'mstrmojo-FormatEditor-leftPanel',
                                  bindings: {
                                      currentModel: 'this.parent.parent.obModel.currentFormat'
                                  },
                                  oncurrentModelChange: function(){
                                      this.parent.btns.which.onvalueChange();
                                      //initialize right selected tab
                                      var lst = this.lst;
                                      if(lst.selectedIndex == 0){
                                          lst.onchange();
                                      } else {
                                          lst.set('selectedIndex', 0);
                                      }
                                  },
                                  children: [{
                                                     scriptClass: 'mstrmojo.TabNameList',
                                                     alias: 'lst',
                                                     slot: 'top',
                                                     cssClass: 'mstrmojo-FormatEditor-formatList',
                                                     itemMarkup:  '<div class="mstrmojo-FormatEditor-bullet">' + 
                                                                     '<div class="mstrmojo-text">{@n}</div>' + 
                                                                     '</div>',
                                                      onchange: function(){
                                                          var pnls = this.parent,
                                                          sidx = this.selectedIndex;
                                                          if(pnls.stck&& sidx != null && sidx != -1){
                                                              var it = this.items[sidx],
                                                              w = it && it.target;
                                                              //Bind model
                                                              var pr = w && w.pr;
                                                              if(pr){
                                                                  if(pr.constructor === Array){
                                                                      for(var i = 0; i < pr.length; i++){
                                                                          w.set(pr[i], pnls.currentModel[pr[i]]);
                                                                      }
                                                                  } else {
                                                                      w.set('model', pnls.currentModel[pr]);
                                                                  }
                                                              }
                                                          }
                                                      }
                                                 },
                                                 {
                                                     scriptClass: 'mstrmojo.StackContainer',
                                                     cssClass: 'mstrmojo-FormatEditor-rightPanel-container mstrmojo-FormatEditor-rightPanel',
                                                     alias: 'stck',
                                                     slot: 'stack',
                                                     children: [nmPnl, algnPnl, fntPnl, brdrPnl, bgPnl, chtPnl]
                                                 }
                                             ]
                              } //end Metric Headers panel
                             ]
                },{//ButtonBar
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
                 }
                ]
            }
    );
    
})();