(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.hash", 
            "mstrmojo.Container", 
            "mstrmojo._FormatDefinition",
            "mstrmojo.TristateCheckBox",
            "mstrmojo.FieldSet",
            "mstrmojo.Table");
    
    var _H = mstrmojo.hash,
    _FD = mstrmojo._FormatDefinition;
    
 mstrmojo.AlignmentFormatter = mstrmojo.declare(
            
            //superclass
            mstrmojo.Container,  
             
            //mixins
            null,
            
           {
               scriptClass: "mstrmojo.AlignmentFormatter",
                         
               cssClass: 'mstrmojo-AlignmentFormatter',
               
               markupString: '<div id={@id} class="{@cssClass}" style="{@cssText}"></div>',
               
               markupSlots: {
                   containerNode: function() { return this.domNode; }
               },
               
               markupMethods: {
                   onvisibleChange: function() { this.domNode.style.display = this.visible ? 'block' : 'none'; }
               },
               
               postCreate: function() {
                   this.onmodelChange();
               },
               
               onmodelChange: function() {
                   if(this.model && !this.model.scriptClass){
                       _H.make(this.model, mstrmojo.Obj);
                  }
               },
               
               children: [{ //Text Alignment
                   scriptClass: 'mstrmojo.FieldSet',
                   alias: 'textAlignment',
                   cssClass: 'mstrmojo-FormatEditor-textAlignment',
                   legend: mstrmojo.desc(2065), //Descriptor: Text Alignment
                   children: [{
                                   scriptClass: 'mstrmojo.Table',
                                   rows: 2,
                                   cols: 2,
                                   children: [{
                                                  scriptClass: 'mstrmojo.Label',
                                                  text: mstrmojo.desc(3691), //Descriptor: Horizontal
                                                  slot: '0,0'
                                              },
                                              //Horizontal
                                              {
                                                  scriptClass:'mstrmojo.Pulldown',
                                                  itemIdField: 'v',
                                                  items: _FD.Horizontal,
                                                  bindings: {
                                                      m: 'this.parent.parent.parent.model',
                                                      value: 'this.m.Horizontal'
                                                  },
                                                  onvalueChange: function() {
                                                      if(this.m && this.value != null){
                                                         this.m.Horizontal = this.value;
                                                      }
                                                  },
                                                  slot: '0,1'
                                              },
                                              {
                                                  scriptClass: 'mstrmojo.Label',
                                                  text: mstrmojo.desc(3692), //Descriptor: Vertical
                                                  slot: '1,0'
                                              },
                                              //Vertical
                                              {
                                                  scriptClass:'mstrmojo.Pulldown',
                                                  itemIdField: 'v',
                                                  items: _FD.Vertical,
                                                  bindings: {
                                                      m: 'this.parent.parent.parent.model',
                                                      value: 'this.m.Vertical'
                                                  },
                                                  onvalueChange: function() {
                                                      if(this.m && this.value != null){
                                                         this.m.Vertical = this.value;
                                                      }
                                                  },
                                                  slot: '1,1'
                                              }
                                     ]
                               }
                            ]
                },
                
                { //Text Control
                    scriptClass: 'mstrmojo.FieldSet',
                    alias: 'textControl',
                    cssClass: 'mstrmojo-FormatEditor-textControl',
                    legend: mstrmojo.desc(2884), //Descriptor: Text Control
                    children: [
                               //Text Wrap
                                {
                                       alias: 'TextWrap',
                                       scriptClass:'mstrmojo.TristateCheckBox',
                                       text: mstrmojo.desc(2070), //Descriptor: Wrap Text
                                       checked: false,
                                       grayed: false,    
                                       pr: 'TextWrap',
                                       bindings: {
                                           m:  'this.parent.parent.model',
                                           checked: function() {
                                               return  this.m[this.pr] == -1;
                                           },
                                           grayed: function() {
                                               return (typeof this.m[this.pr] == 'undefined') || this.m[this.pr] == 'pru';
                                           }
                                       },
                                       oncheckedChange: function(evt) {
                                           if(this.m){
                                               this.m.set(this.pr, this.checked ? -1 : 0);
                                           }
                                       }
                                },
                               //Text Direction
                               {
                                   scriptClass: 'mstrmojo.HBox',
                                   children: [{
                                                  scriptClass: 'mstrmojo.Label',
                                                  text: mstrmojo.desc(5159) //Descriptor: Text Direction:
                                              },
                                              //Text Direction
                                              {
                                                  scriptClass:'mstrmojo.Pulldown',
                                                  itemIdField: 'v',
                                                  items: _FD.TextDirection,
                                                  bindings: {
                                                      m: 'this.parent.parent.parent.model',
                                                      value:'this.m.TextDirection'
                                                  },
                                                  onvalueChange: function() {
                                                      if(this.m && this.value != null){
                                                         this.m.TextDirection = this.value;
                                                      }
                                                  },
                                                  slot: '1,1'
                                              }
                                              ]
                               }
                    ]
                }]
           }
       ); //end declare()
})();