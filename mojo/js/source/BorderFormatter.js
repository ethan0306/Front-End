(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.Container",
            "mstrmojo.FieldSet",
            "mstrmojo._FormatDefinition",
            "mstrmojo.Label",
            "mstrmojo.Pulldown",
            "mstrmojo.ColorPicker");
    
    var _H = mstrmojo.hash,
    _C = mstrmojo.color,
    _FD = mstrmojo._FormatDefinition;
    
    var  _updateBorder = function(model, n, v) {
        var labels = ['Left', 'Right', 'Top', 'Bottom'];

        //update all four borderStyle
        for (var i = 0; i < 3; i ++) {
            model[labels[i] + n] = v;
        }
        //only raise event when update last border
        model.set(labels[3] + n, v);
    };
   
    
 mstrmojo.BorderFormatter = mstrmojo.declare(
            
            //superclass
            mstrmojo.Container,  
             
            //mixins
            null,
            
           {
               scriptClass: "mstrmojo.BorderFormatter",
                         
               cssClass: 'mstrmojo-BorderFormatter',
               
               markupString: '<div id={@id} class="{@cssClass}" style="{@cssText}"></div>',
               
               markupSlots: {
                   containerNode: function() { return this.domNode; }
               },
               
               markupMethods: {
                   onvisibleChange: function() { this.domNode.style.display = this.visible ? 'block' : 'none'; }
               },
               
               postCreate: function(){
                   this.onmodelChange();
               },
               
               onmodelChange: function(){
                   if(this.model && !this.model.scriptClass){
                       _H.make(this.model, mstrmojo.Obj);
                  }
               },
               children: [{ //Borders
                           scriptClass: 'mstrmojo.FieldSet',
                           alias: 'borders',
                           cssClass: 'mstrmojo-FormatEditor-border',
                           legend: mstrmojo.desc(2886), //Descriptor: Borders
                           children: [{
                                          scriptClass: 'mstrmojo.Table',
                                          alias: 'borderTable',
                                          cssText: 'width:100%;',
                                          rows: 1,
                                          cols: 2,
                                          children : [{//Border types List
                                                          scriptClass: 'mstrmojo.List',
                                                          alias: 'borderTypes',
                                                          selectedIndex: 0, //this panel index
                                                          cssClass: 'borderTypes',
                                                          items: [
                                                                  {n: '<img border="0" align="absmiddle" src="../images/borders_none.gif" alt=""> ' + mstrmojo.desc(2057), v: 1},  //Descriptor: None
                                                                  {n: '<img border="0" align="absmiddle" src="../images/borders_all.gif" alt=""> ' + mstrmojo.desc(2058), v: 2},       //Descriptor: All
                                                                  {n: '<img border="0" align="absmiddle" src="../images/borders_custom.gif" alt=""> ' + mstrmojo.desc(2056), v: 3}  //Descriptor: Custom
                                                           ],
                                                           slot: '0,0',
                                                           bindings: {
                                                               m: 'this.parent.parent.parent.model',
                                                               selectedIndex: function() {
                                                                       var bs = this.m;
                                                                       if (_H.isEmpty(bs)) {
                                                                           return 0; //default
                                                                       }
                                                                       if (bs.LeftStyle == 0 && bs.TopStyle == 0 && bs.RightStyle == 0 && bs.BottomStyle == 0) { //No Border
                                                                           return 0;
                                                                       }
                                                                       else if (bs.LeftStyle == bs.TopStyle && bs.LeftStyle == bs.RightStyle && bs.LeftStyle == bs.BottomStyle) {
                                                                           //All Borders have same style
                                                                           return 1;
                                                                       }
                                                                       return 2; //Custom Border Style
                                                                   }
                                                           },
                                                           onchange: function(evt) {
                                                               if(this.m){
                                                                  var widget = this.parent.borderAndColor;
                                                                  if (!widget) {
                                                                      return;
                                                                  }
                                                                  //save
                                                                  if (this.selectedIndex === 0) {
                                                                      //change borders to none
                                                                      var labels = ['Left', 'Right', 'Top', 'Bottom'];
                                                                      for (var i = 0; i < 4; i ++) {
                                                                          this.m.set(labels[i] + 'Style', '0');
                                                                          this.m.set(labels[i] + 'Color', '0');
                                                                      }
                                                                  } 
                                                               }
                                                            }
                                                      },
                                                      { //Borders style container
                                                          scriptClass: 'mstrmojo.Container',
                                                          alias: 'borderAndColor',
                                                          markupString: '<div class="borderStyles"></div>',
                                                          markupSlots: {
                                                              containerNode: function(){return this.domNode;}
                                                          },
                                                          markupMethods: {
                                                              onvisibleChange: function() {
                                                                  this.domNode.style.display = this.visible ? 'block' : 'none'; 
                                                              }
                                                          },
                                                          children: [
                                                                { //allBorders container
                                                                    scriptClass: 'mstrmojo.Container',
                                                                    alias: 'allBordersContainer',
                                                                    markupString: '<div class="mstrmojo-FormatEditor-ColorLine-borders"></div>',
                                                                    markupSlots: {
                                                                        containerNode: function(){return this.domNode;}
                                                                    },
                                                                    markupMethods: {
                                                                        onvisibleChange: function() {
                                                                            this.domNode.style.display = this.visible ? 'block' : 'none'; 
                                                                        }
                                                                    },
                                                                    bindings: {
                                                                        visible: 'this.parent.parent.borderTypes.selectedIndex==1'
                                                                    },
                                                                    children:[
                                                                     {
                                                                         scriptClass:'mstrmojo.Table',
                                                                         alias: 'allBorders',
                                                                         rows: 1,
                                                                         cols: 3,
                                                                         onshowChange: function(){
                                                                             if (this.show) {
                                                                                 _updateBorder(this.m, 'Style', this.styles.value);
                                                                                 _updateBorder(this.m, 'Color', _C.encodeColor(this.colors.fillColor));
                                                                             }
                                                                         },
                                                                         bindings: {
                                                                             m: 'this.parent.parent.parent.parent.parent.model'
                                                                         },
                                                                         postCreate: function() {
                                                                             var labels = ['Left', 'Right', 'Top', 'Bottom'];
                                                                             var children = [
                                                                                             //All Style
                                                                                             {
                                                                                                 scriptClass: 'mstrmojo.Pulldown',
                                                                                                 alias: 'styles',
                                                                                                 items: _FD.BorderStyles,
                                                                                                 itemIdField: 'v',
                                                                                                 bindings: {
                                                                                                     m: 'this.parent.m',
                                                                                                     value: function() {
                                                                                                         //var idx = this.getSelectedIndex && this.getSelectedIndex() || 0;
                                                                                                         var l = this.m.LeftStyle,
                                                                                                         r = this.m.RightStyle,
                                                                                                         t = this.m.TopStyle,
                                                                                                         b = this.m.BottomStyle;
                                                                                                         var idx = 0;
                                                                                                         if (l == r && r == b && b == t ) {
                                                                                                             idx = mstrmojo.array.find(_FD.BorderStyles, 'v', l);
                                                                                                         }
                                                                                                         idx = idx==-1 ? 0: idx;
                                                                                                         
                                                                                                         return this.items[idx][this.itemIdField];
                                                                                                     }
                                                                                                 },
                                                                                                 
                                                                                                 onvalueChange: function() {
                                                                                                     if (this.parent.parent.visible) {
                                                                                                         _updateBorder(this.m, 'Style', this.value);
                                                                                                     }
                                                                                                 },
                                                                                                 slot: '0,1'
                                                                                             },
    
                                                                                             mstrmojo.ColorPicker.createDropDown({
                                                                                                         alias: 'colors',
                                                                                                         bindings: {
                                                                                                             m: 'this.parent.m',
                                                                                                             fillColor: function() {
                                                                                                                 var l = this.m.LeftColor,
                                                                                                                 r = this.m.RightColor,
                                                                                                                 t = this.m.TopColor,
                                                                                                                 b = this.m.BottomColor;
            
                                                                                                                 //var color = 0;
                                                                                                                 if (l == r && r == b && b == t ) {
                                                                                                                     var color = l;
                                                                                                                 }
                                                                                                                 
                                                                                                                 if (typeof (color) != 'undefined' && /^\d{1,8}$/.test(color)) {
                                                                                                                     return _C.decodeColor(color);
                                                                                                                 }
                                                                                                                 return 'transparent';
                                                                                                         }
                                                                                                     },
                                                                                                     onfillColorChange: function() {
                                                                                                         if (this.parent.parent.visible) {
                                                                                                             _updateBorder(this.m, 'Color', this.fillColor == 'transparent' ? 'pru' : _C.encodeColor(this.fillColor));
                                                                                                         }
                                                                                                     },
                                                                                                     slot: '0,2'
                                                                                                     }
                                                                                                     )
                                                                                                  ];
                                                                                               
                                                                             this.addChildren(children);
                                                                         }
                                                                     }
                                                                 ]
                                                                }, //end allBordersContainer
                                                                
                                                                { //customBorders container
                                                                    scriptClass: 'mstrmojo.Container',
                                                                    alias: 'customBordersContainer',
                                                                    markupString: '<div class="mstrmojo-FormatEditor-ColorLine-borders"></div>',
                                                                    markupSlots: {
                                                                        containerNode: function(){return this.domNode;}
                                                                    },
                                                                    markupMethods: {
                                                                        onvisibleChange: function() { 
                                                                            this.domNode.style.display = this.visible ? 'block' : 'none'; 
                                                                        }
                                                                    },
                                                                    bindings: {
                                                                        visible: 'this.parent.parent.borderTypes.selectedIndex==2'
                                                                    },
                                                                    children:[
                                                                     {//custom borders
                                                                         scriptClass:'mstrmojo.Table',
                                                                         alias: 'customBorders',
                                                                         rows: 1,
                                                                         cols: 3,
                                                                         bindings: {
                                                                             m: 'this.parent.parent.parent.parent.parent.model'
                                                                         },
                                                                         postCreate: function() {
                                                                                 var labels = ['Left', 'Right', 'Top', 'Bottom'];
                                                                                 var children = [];
            
                                                                                 for (var i = 0; i < labels.length; i++) {
                                                                                     var label = labels[i]; 
                                                                                     children.push(
                                                                                             {
                                                                                                 scriptClass: 'mstrmojo.Label',
                                                                                                 text: mstrmojo.desc({Left: 3528, Right: 3529, Top:3526, Bottom:3527}[label]),
                                                                                                 alias: label,
                                                                                                 slot: '0,0'
                                                                                             },
                                                                                             {
                                                                                                 scriptClass:'mstrmojo.Pulldown',
                                                                                                 items: _FD.BorderStyles,
                                                                                                 itemIdField:'v', 
                                                                                                 pr: label + 'Style',
                                                                                                 bindings: {
                                                                                                         m: 'this.parent.m',
                                                                                                         value: function() {
                                                                                                             var l = this.m.LeftStyle,
                                                                                                                 r = this.m.RightStyle,
                                                                                                                 t = this.m.TopStyle,
                                                                                                                 b = this.m.BottomStyle;
        
                                                                                                             var idx = mstrmojo.array.find(_FD.BorderStyles, 'v', 
                                                                                                                     this.m[this.pr]);
                                                                                                             idx = idx == -1 ? 0: idx;
                                                                                                             
                                                                                                             return this.items[idx][this.itemIdField];
                                                                                                         }
                                                                                                     },
                                                                                                     onvalueChange: function() {
                                                                                                         if (this.parent.parent.visible) {
                                                                                                             this.m.set(this.pr, this.value);
                                                                                                         }
                                                                                                     },
                                                                                                     slot: '0,1'
                                                                                             },
                                                                                                                 
                                                                                             mstrmojo.ColorPicker.createDropDown(
                                                                                                         {
                                                                                                             cssClassx: 'mstrmojo-FormatEditor-colorPicker',
                                                                                                             alias: label + 'Color',
                                                                                                             pr: label + 'Color',
                                                                                                             bindings: {
                                                                                                                 m: 'this.parent.m',
                                                                                                                 fillColor: function() {
                                                                                                                         var l = this.m.LeftColor,
                                                                                                                             r = this.m.RightColor,
                                                                                                                             t = this.m.TopColor,
                                                                                                                             b = this.m.BottomColor;
                                                                                                                         
                                                                                                                         var color = this.m[this.pr];
                                                                                                                         if (typeof (color) != 'undefined' && /^\d{1,8}$/.test(color)) {
                                                                                                                             return _C.decodeColor(color);
                                                                                                                         }
                                                                                                                         return 'transparent';
                                                                                                                     }
                                                                                                             },
                                                                                                             onfillColorChange: function() {
                                                                                                                 if (this.parent.parent.visible) {
                                                                                                                     this.m.set(this.pr, this.fillColor == 'transparent' ? 'pru' : _C.encodeColor(this.fillColor));
                                                                                                                 }
                                                                                                             },
                                                                                                             slot: '0,2'
                                                                                                         }
                                                                                                 )
                                                                                          );
                                                                                 }
                                                                                 this.addChildren(children);
                                                                         }
                                                                     }
                                                                 ]} //end customBordersContainer
                                                                 ],
                                                                 slot: '0,1'
                                                      }
                                                      ]
                                                   },                                                   
                                                   //Border Preview
                                                   {
                                                       scriptClass: 'mstrmojo.Label',
                                                       cssClass: 'borderPreview',
                                                       text: mstrmojo.desc(7941), //Descripotr: Border preview
                                                       bindings: {
                                                           m: 'this.parent.parent.model',
                                                           cssText: function() {
                                                                   //The FormatDefintion's Style List mixes border style and size together.
                                                                   //The following splits them out. 
                                                                   var borderStyles = {
                                                                                       0:"None", 
                                                                                       3:"Dashed", 
                                                                                       4:"Dotted", 
                                                                                       6:"Double", 
                                                                                       7:"Solid"  //7:"Hair" 
                                                                                      },
                                                                        borderSizes = {
                                                                                       //pru: 'Thin', //Default size
                                                                                       1:"Thin", 
                                                                                       5:"Thick",
                                                                                       6:"medium" 
                                                                                      }; 
                                                                   
                                                                   //This is only to ensure to be notified when borderType List selection changes
                                                                   var bordertype = this.parent.borderTable.borderTypes.selectedIndex;
                                                                   
                                                                   return ';border-left-style: ' + (borderStyles[this.m.LeftStyle] || 'solid') + 
                                                                          ';border-right-style: ' + (borderStyles[this.m.RightStyle] || 'solid') +
                                                                          ';border-top-style: ' + (borderStyles[this.m.TopStyle] || 'solid') +
                                                                          ';border-bottom-style: ' + (borderStyles[this.m.BottomStyle] || 'solid') +
                                                                          ';border-left-color: ' + _C.decodeColor(this.m.LeftColor || '0') +
                                                                          ';border-right-color: ' + _C.decodeColor(this.m.RightColor || '0') + 
                                                                          ';border-top-color: ' + _C.decodeColor(this.m.TopColor || '0') + 
                                                                          ';border-bottom-color: ' + _C.decodeColor(this.m.BottomColor || '0') + 
                                                                          ';border-left-width: ' + (borderSizes[this.m.LeftStyle] || 'thin') + 
                                                                          ';border-right-width: ' + (borderSizes[this.m.RightStyle] || 'thin') +
                                                                          ';border-top-width: ' + (borderSizes[this.m.TopStyle] || 'thin') +
                                                                          ';border-bottom-width: ' + (borderSizes[this.m.BottomStyle] || 'thin');
                                                       }
                                                   }
                                               }]//end fieldset children
                                    } ]
           }
       ); //end declare()
})();