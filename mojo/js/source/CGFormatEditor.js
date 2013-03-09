(function(){
    
    mstrmojo.requiresCls("mstrmojo.hash",
            "mstrmojo.Editor", 
            "mstrmojo._FormatDefinition",
            "mstrmojo.FontFormatter",
            "mstrmojo.NumberFormatter",
            "mstrmojo.AlignmentFormatter",
            "mstrmojo.PaddingFormatter",
            "mstrmojo.FillFormatter",
            "mstrmojo.BorderFormatter");
    
    var _H = mstrmojo.hash, 
    _FD = mstrmojo._FormatDefinition;
    
    var MAP = ['header_format', 'grid_format', 'child_header_format', 'child_grid_format'];
    
    mstrmojo.CGFormatEditor = mstrmojo.declare(
    
            //superclass
            mstrmojo.Editor,
            
            //mixins
            null,
            
            /**
             * @lends mstrmojo.FormatEditor.prototype
             */
            {
                scriptClass: 'mstrmojo.CGFormatEditor',
                
                cssClass: 'mstrmojo-FormatEditor',
                
                title: mstrmojo.desc(2116), //Descriptor: Format
                
                /**
                 * <p>This is object containing level 0 items array and related formatting properties</p>
                 * <pre>
                 *     model: {
                 *             items : [
                 *                 [//item 0
                 *                     n: ....
                 *                     header_format: {...}
                 *                     grid_format: {...}
                 *                     child_header_format: {...}
                 *                     child_grid_format: {...}
                 *                 ],
                 *                 //item 1....
                 *             ]
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
                   if (!this.obModel) {
                       //setup model
                         var me = this;
                         this.obModel = new mstrmojo.Model(
                         {
                             level1Index: MAP[0],
                             onlevel0IndexChange: function(evt) {
                                 // save changes 'model' first:
                                 if (evt.valueWas > -1) {
                                     this._updateModel(evt.valueWas, this.level1Index);
                                 }
                                 this._setCurrentFormat();
                             },
                             onlevel1IndexChange: function(evt) {
                                 // save changes 'model' first:
                                 if (evt.valueWas != undefined) {
                                     this._updateModel(this.level0Index, evt.valueWas);
                                 }
                                 this._setCurrentFormat();
                             },
                             onmodelChange: function() {
                                 return this.model.items.length > 0? this._setCurrentFormat() : false;
                             },
                             
                             //When switch level0/1 items, save currentFormat to corresponding model item's format property
                             _updateModel: function(level0Index, level1Index) {
                                 level0Index = (typeof level0Index != 'undefined') ? level0Index : this.level0Index;
                                 level1Index = level1Index || this.level1Index;
                                 
                                 var cf = mstrmojo.hash.copy(this.currentFormat);
                                 var modelf = this.model.items[level0Index][level1Index] || {};
                                 _FD.extractModel(cf, modelf);
                                 this.model.items[level0Index].set(level1Index, modelf);
                             },
                             
                             //For a currently selected level0/1 item, prepare its currentFormat
                             _setCurrentFormat: function() {
                                 //make some property sets observable
                                 var cf = mstrmojo.hash.copy(this.model.items[this.level0Index||0][this.level1Index]);
                                 cf = _FD.getStandardFormat(cf);
                                 //raise event
                                 this.set('currentFormat', cf);
                             }
                         }
                         );
                     }
               },
               
               init: function(props) {
                   this._initModel();
                   this._super(props);
               },
               
               //editor data model should be set when creating editor instance 
               onmodelChange: function() {
                   this._initModel();
                   
                   //setup model
                   var fem = this.obModel;
                   fem.level0Index = fem.level0Index || 0; //reset to point to first item if not set yet
                   fem.set('model', mstrmojo.hash.clone(this.model));

                   //set level0 index if provided in model
                   var idx = (fem.level0Index != null)? fem.level0Index : fem.model.selectedIndex;
                   fem.set('level0Index', (idx==-1 ? 0 : idx));
               },
               
               onClearFormat: function() {
                   var fmts = this.obModel.currentFormat;
                   for (var ps in fmts) { //each level0
                       delete fmts[ps];
                   }

                   for (var i = 0; i < MAP.length; i ++ ) {
                       var fem = this.obModel;
                       delete fem.model.items[fem.level0Index][MAP[i]];                   
                   }
                   this.obModel._setCurrentFormat();
               },
               
               onOK: function() {
                   this.obModel._updateModel();
                   
                   var feModel = this.obModel.model;
                   for (var i = 0; i < feModel.items.length; i ++) {
                       _FD.saveFormatModel(feModel.items[i], this.model.items[i],  MAP);
                   }
               },
                
                postBuildRendering: function(){
                    if (this._super) {
                        this._super();
                    }
                    
                    //set level0 index if provided in model
                    var idx = this.obModel.model.selectedIndex;
                    this.obModel.set('level0Index', (idx==-1 ? 0: idx));
                },
                
                children: [{
                    scriptClass: "mstrmojo.VBox",
                    children:[{
                                  scriptClass: "mstrmojo.HBox",
                                  alias: 'btns',
                                  children: [{
                                      scriptClass:'mstrmojo.Pulldown',
                                      itemIdField:'did',
                                      bindings: {
                                          items: function() {
                                              return this.parent.parent.parent.obModel.model.items ||[];
                                          },
                                          value: function(){
                                              var idx =  this.parent.parent.parent.obModel.level0Index;
                                              idx = (idx == -1 ? 0: idx);
                                              return this.items[idx][this.itemIdField];
                                          }
                                      },
                                      cssClass: ' mstrmojo-FormatEditor-DropDownButton',
                                      popupToBody: true,
                                      popupZIndex: 100,
                                      value: 1,//Initial target
                                      onvalueChange: function(){
                                          var editor = this.parent.parent.parent;
                                          if(editor && editor.obModel){
                                              editor.obModel.set('level0Index',  this.selectedIndex);
                                          }
                                      }
                                  },{
                                      scriptClass:'mstrmojo.Pulldown',
                                      alias: 'targetSelector',
                                      itemIdField: 'v',
                                      cssClass: ' mstrmojo-FormatEditor-DropDownButton',
                                      popupToBody: true,
                                      popupZIndex: 100,
                                      value: 1,//Initial target
                                      items:  _FD.FormatTarget,
                                      onvalueChange: function(){
                                          var editor = this.parent.parent.parent;
                                          if(editor && editor.obModel){
                                              editor.obModel.set('level1Index',  this.selectedItem.p);
                                          }
                                      }
                                  },
                                 //Clear button
                                 new mstrmojo.Button.newInteractiveButton (
                                         mstrmojo.desc(5976), //Descriptor: Clear Format, 
                                         function(evt) {
                                             var editor = this.parent.parent.parent;
                                             if (editor.onClearFormat) {
                                                 editor.onClearFormat();
                                             }
                                         }, 
                                         '#999', 
                                         {alias: 'btnClear', cssClass: 'mstrmojo-Editor-button clear'}
                                 )]
                              },
                              //format panels
                              {
                                  scriptClass: 'mstrmojo.HBox',
                                  alias: 'formatPanels',
                                  cssClass: 'mstrmojo-FormatEditor-box',
                                  bindings: {
                                      currentModel: 'this.parent.parent.obModel.currentFormat'
                                  },
                                  children: [{//Left Panel
                                                     scriptClass: 'mstrmojo.VBox',
                                                     alias: 'formatList',
                                                     cssClass: 'mstrmojo-FormatEditor-leftPanel',
                                                     children: [
                                                                 {//Formats List
                                                                     scriptClass: "mstrmojo.List",
                                                                     alias: "feFMTList",
                                                                     cssClass: "mstrmojo-FormatEditor-formatList",
                                                                     items: _FD.Formats,
                                                                     selectedIndex: 0,
                                                                     //selectionPolicy: 'reselect',
                                                                     itemMarkup: '<div class="mstrmojo-FormatEditor-bullet">' + 
                                                                                         '<div class="mstrmojo-text">{@n}</div>' + 
                                                                                  '</div>',
                                                                     /**
                                                                      * <p>Normal widget height</p>
                                                                      * <p>This property is required to support animation</p>
                                                                      * @type {String}
                                                                      */
                                                                     height: '200px'
                                                                 }
                                                 ]},
                                                 { //Right Panel container
                                                     scriptClass: 'mstrmojo.Container',
                                                     alias: 'rightPanelContainer',
                                                     cssClass: 'mstrmojo-FormatEditor-rightPanel-container mstrmojo-FormatEditor-rightPanel',
                                                     markupString: '<div id={@id} class="{@cssClass}">' + 
                                                                   '</div>',
                                                     
                                                     markupSlots: {
                                                         containerNode: function() { return this.domNode; }
                                                     },
                                                     
                                                     children : [
                                                     // Font panel
                                                     {
                                                         scriptClass : 'mstrmojo.FontFormatter',
                                                         cssClass: 'mstrmojo-FormatEditor-fontTable',
                                                         cellPadding: 5,
                                                         bindings: {
                                                             visible: 'this.parent.parent.formatList.feFMTList.selectedIndex==0',
                                                             model: 'this.parent.parent.currentModel.FormattingFont'
                                                         }
                                                     },
                                                     // Number panel
                                                    {
                                                        scriptClass : 'mstrmojo.NumberFormatter',
                                                        bindings: {
                                                            visible: 'this.parent.parent.formatList.feFMTList.selectedIndex==1',
                                                            model: 'this.parent.parent.currentModel.FormattingNumber'
                                                        }
                                                    },
                                                    // Alignment panel
                                                    {
                                                        scriptClass : 'mstrmojo.AlignmentFormatter',
                                                        bindings: {
                                                            visible: 'this.parent.parent.formatList.feFMTList.selectedIndex==2',
                                                            model: 'this.parent.parent.currentModel.FormattingAlignment'
                                                        }
                                                    },
                                                    // Alignment panel
                                                    {
                                                        scriptClass : 'mstrmojo.PaddingFormatter',
                                                        bindings: {
                                                            visible: 'this.parent.parent.formatList.feFMTList.selectedIndex==2',
                                                            model: 'this.parent.parent.currentModel.FormattingPadding'
                                                        }
                                                    },
                                                    //Background panel
                                                    {
                                                        scriptClass : 'mstrmojo.FillFormatter',
                                                        bindings: {
                                                            visible: 'this.parent.parent.formatList.feFMTList.selectedIndex==3',
                                                            model: 'this.parent.parent.currentModel.FormattingPatterns'
                                                        }
                                                    },
                                                    //Border panel
                                                    {
                                                        scriptClass : 'mstrmojo.BorderFormatter',
                                                        bindings: {
                                                            visible: 'this.parent.parent.formatList.feFMTList.selectedIndex==3',
                                                            model: 'this.parent.parent.currentModel.FormattingBorder'
                                                        }
                                                    }]
                                                     }
                                             ]
                                  
                              } //end Metric Headers panel
                             ]
                },{//ButtonBar
                    scriptClass: "mstrmojo.HBox",
                    cssClass: "mstrmojo-Editor-buttonBar",
                    slot: "buttonNode",
                    children: [
                                   new mstrmojo.Button.newInteractiveButton (
                                           mstrmojo.desc(2397), //Descriptor: OK 
                                           function() {
                                               var editor = this.parent.parent;
                                               editor.close();
                                               
                                               if (editor.onOK) {
                                                   editor.onOK();
                                               }
                                           }, 
                                           '#999', 
                                           {alias: 'btnOk', cssClass: 'mstrmojo-Editor-button'}
                                   ),
                                   new mstrmojo.Button.newInteractiveButton (
                                           mstrmojo.desc(2399), //Descriptor: Cancel 
                                           function(){
                                               var editor = this.parent.parent;
                                               editor.close();
                                           }, 
                                           '#999', 
                                           { alias: 'btnCancel',cssClass: 'mstrmojo-Editor-button'}
                                   )
                              ]
                 }
                ]
            }
    );
    
})();