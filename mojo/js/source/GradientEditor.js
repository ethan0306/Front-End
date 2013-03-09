(function(){
    
    mstrmojo.requiresCls("mstrmojo.Editor","mstrmojo.ColorPicker","mstrmojo.List", "mstrmojo.Label", "mstrmojo.css");

    
    /**
     * <p>Tooltip to be shown on each preview box </p>
     * 
     * <p>tooltips: {GradientAngle: [ variantIndex:.., ...]}</p>
     * <LI>GradientAngle - 0, 90</LI>
     * <LI>variantIndex - 0, 1, 2</LI>
     * @type {Object}
     */
    var tooltips = {
            '0': [ //Horizontal
                      mstrmojo.desc(4883,'Transition Type:') + mstrmojo.desc(4888, 'Linear') + ';' + mstrmojo.desc(4884, 'Angle:') + '0;' + mstrmojo.desc(4885, 'X Offset:') + '0;' + mstrmojo.desc(4886,'Y Offset:') + '0',
                      mstrmojo.desc(4883,'Transition Type:') + mstrmojo.desc(4888, 'Linear') + ';' + mstrmojo.desc(4884, 'Angle:') + '0;' + mstrmojo.desc(4885, 'X Offset:') + '0;' + mstrmojo.desc(4886,'Y Offset:') + '100',
                      mstrmojo.desc(4883,'Transition Type:') + mstrmojo.desc(4888, 'Linear') + ';' + mstrmojo.desc(4884, 'Angle:') + '0;' + mstrmojo.desc(4885, 'X Offset:') + '50;' + mstrmojo.desc(4886,'Y Offset:') + '50;' + mstrmojo.desc(4875, '(Flash Only)')
                  ],
                  
            '90': [ //Vertical
                    mstrmojo.desc(4883,'Transition Type:') + mstrmojo.desc(4888, 'Linear') + ';' + mstrmojo.desc(4884, 'Angle:') + '90;' + mstrmojo.desc(4885, 'X Offset:') + '0;' + mstrmojo.desc(4886,'Y Offset:') + '0',
                    mstrmojo.desc(4883,'Transition Type:') + mstrmojo.desc(4888, 'Linear') + ';' + mstrmojo.desc(4884, 'Angle:') + '90;' + mstrmojo.desc(4885, 'X Offset:') + '100;' + mstrmojo.desc(4886,'Y Offset:') + '0',
                    mstrmojo.desc(4883,'Transition Type:') + mstrmojo.desc(4888, 'Linear') + ';' + mstrmojo.desc(4884, 'Angle:') + '90;' + mstrmojo.desc(4885, 'X Offset:') + '50;' + mstrmojo.desc(4886,'Y Offset:') + '50;' + mstrmojo.desc(4875, '(Flash Only)')
                   ]
    };


    /**
     * <p>Gradient Offsets constants</p>
     * 
     * <p>First index is GraidentAngle, second index is index of gradient variant</p>
     * <p>At each angle, there are three variants</p>
     * @type {Object}
     */
    var offsets = {
                    '0' : //Horizontal
                        [
                         {x: 0, y:0},
                         {x: 100, y: 0},
                         {x: 50, y: 0}
                         ],
                         
                    '90': //Vertical
                        [
                         {x: 0, y: 0},
                         {x: 0, y: 100},
                         {x: 0, y: 50}
                         ]
    };
    
    


    /**
     * <p>Create DropDown Button to show Color Picker</p>
     * <p>The first color Dropdown is for GradientProperty 'FillColor'; Second one is 'GradientColor'</p>
     * 
     * @param {Object} ps Properties to be set into DropDownButton instance
     * @param {Integer} which Index of the DropDownButton
     */
    function createColorDropDown (ps, which){
        
        return  mstrmojo.ColorPicker.createDropDown(
                mstrmojo.hash.copy(
                    ps,
                    {
                      onfillColorChange: function() {
                          if (this.boxNode) {
                              this.boxNode.style.backgroundColor = this.fillColor;
                          }
                          
                          this.parent.parent.parent.geModel.set((which === 0 ? 'FillColor' : 'GradientColor'), this.fillColor);
                      },
                      bindings: {
                          fillColor: function () {
                              return this.parent.parent.parent.geModel[['FillColor', 'GradientColor'][which]];
                          }
                      }
                    }
            )
        );
    } 
    
    
    
    /**
     * <p>Create a preview box</p>
     * <p>Each preview box is a mstrmojo.Label. The gradient is set as its inline style</p>
     * 
     * @param {Integer} index 0-based index of the preview boxes
     * @param {Object} ps Properties to set to create Label object
     * @return {mstrmojo.Label}
     */
    function createPreview (index, ps) {
        
        //This cssClass is for the third preview box which consists of two half-width boxes.
        //First half box has index 2, second half box has index 3.
        //This object has index in format '{@halfbox index}{@angle index}
        //For example, '20' means it is for First half box at gradient orientation 0 (vertical, 1 - horizontal)
        var cssClsses = {
                '20': ' half t',
                '21': ' half l',
                '30': ' half b',
                '31': ' half r'
                
        };
        
        //Gradient Variant index - 0, 1, 2
        var variantIndex = index == 3 ? index - 1: index;
        
        return mstrmojo.hash.copy(
                ps,
                {
                    scriptClass: 'mstrmojo.Label',
                    cssClass: 'mstrmojo-GradientEditor-preview p' + index,
                    alias: 'p' + index,
                    bindings: {
                        cssText: function() {
                            //- when any of the Colors, Angle is changed, Preview Box need to be updated
                            //- when variantIndex is changed (selecting a different preview box), the Border need to be moved to the currently selected preview box 
                            var gemodel = this.parent.parent.parent.geModel;
                            if (gemodel) {
                                var color1 = this.parent.parent.parent.geModel.FillColor, //must use full path
                                    color2 = this.parent.parent.parent.geModel.GradientColor,
                                    angle = this.parent.parent.parent.geModel.GradientAngle,
                                    type = angle == 90 ? 0 : 1, // gradient type: 1 - horizontal 0 - vertical,
                                    gradient = (index==1 || index==2) ? mstrmojo.css.buildGradient(type, color2, color1): mstrmojo.css.buildGradient(type, color1, color2);
                                    
                                //if it is one of the two half-width preview box, add additional css class:
                                if (index >= 2) {
                                    this.domNode.className = this.cssClass + cssClsses[index + '' + type];
                                }
                            
                                //update tooltip info for this preview box
                                this.domNode.title = tooltips[angle][variantIndex];
                                
                                //save to model
                                gemodel.css = gradient.n + ':' + gradient.v;
                                
                                return gemodel.css;
                            }
                        }
                    },
                    onclick: function() {
                        //Selecting a different gradient variant, need to update corresponding X-Y-Offset
                        
                        var geModel = this.parent.parent.parent.geModel,
                            offset = offsets[geModel.GradientAngle][variantIndex];
                        
                        //update X-Y-offset
                        geModel.set('GradientXOffset', offset.x);
                        geModel.set('GradientYOffset', offset.y);
                    }
                }
        );
    }
    
    /**
     * <p>Save local gemodel data into provided 'model' </p>
     */
    var saveModel = function(widget) {
        //set Gradient css string for the calling widget to apply.
        var vi = widget.shade.preview.preview_bg.variantIndex;
        //widget.geModel.set('css', widget.shade['p'+  (vi == 2 ? 0 : vi)].cssText);
        
        //raise event for calling widget to get all gradient info.
        var pr = ['FillStyle', 'FillColor', 'GradientColor', 'GradientXOffset', 'GradientYOffset', 'GradientAngle'],
            gm = widget.geModel,
            gradient = {};
        for (var p in pr) {
            if (typeof (gm[pr[p]]) != 'undefined') {
                gradient[pr[p]] = gm[pr[p]];
            }
        }
        
        //save 'css' string for display
        gradient.css = widget.shade.preview['p'+  (vi == 2 ? 0 : vi)].cssText;
        widget.set('gradient', gradient);
    };
    
    
    var _defaultGradientInfo = { //default data
                            //FillStyle: 2,
                            GradientXOffset: 0,
                            GradientYOffset: 0,
                            GradientAngle: 0,
                            FillColor: '#FFFFFF',
                            GradientColor: '#000000'
                          };
    
    
    
    /**
     * <p>Gradient Editor</p>
     * 
     * @class
     * @extends mstrmojo.Editor
     */
    mstrmojo.GradientEditor = mstrmojo.declare(
         
         //superclass
         mstrmojo.Editor,  
          
         //mixins
         null,
         
        /**
         * @lends mstrmojo.GradientEditor.prototype
         */
        {
            scriptClass: "mstrmojo.GradientEditor",
    
            
            /**
             * <p>Apply build-in shadow cssClass</P>
             * @type Boolean
             * @default true 
             */
            useShadow: true,
            
            /**
             * <p>Editor Title</p>
             * @type {String}
             */
            title: mstrmojo.desc(7971, 'Gradient Editor'),
            
            /**
             * <p>A data model that should be provided by callling widget</p>
             * <p>This model should be updated each time GradientEditor is set visible</p>
             * 
             * <pre>This model should have properties as below:
             * {  
             *     GradientXOffset: 0,
             *     GradientYOffset: 0,
             *     GradientAngle: 0,
             *     FillColor: '#FF0000',
             *     GradientColor: '#0000FF',
             *     FillStyle: 2
             *  }
             * </pre>
             * 
             * <p>Note: This model won't get updated till OK is clicked</p>
             * 
             * @type {Object} 
             */
            model: null,
            
            /**
             * <p>Callback for OK button</p>
             *
             * <p>This default implementation will update calling widget's model with current Graident data</P>
             * <p>The calling widget should override to implement its own behavior</p>
             * @type Function
             */
            onOK: null,
            
            /**
             * <p>Callback for Cancel button</p>
             * @type Function
             */
            onCancel: null,
                
            /**
             * <p>The widget that opens this editor should update the model. When model changes, raise event to notify each editor component.</p>
             */
            onmodelChange: function() {
                this.set('geModel', mstrmojo.hash.make(this.model || _defaultGradientInfo, mstrmojo.Obj));
            },
            
            init: function(props) {
                this._super(props);
              
                //combine user-defined cssclass 
                this.shadowCssClass = this.useShadow ? 'shadow' : '';
                this.cssClass = 'mstrmojo-GradientEditor ' + this.cssClass;
                
                //if no model is provided at initialization, set up a default one
//                if (!this.model) {
//                    this.model =  _defaultGradientInfo;
//                }
             },
             
            postBuildRendering: function() {
                 if (this._super) {
                     this._super();
                 }
                 
                 //Setup a local copy to cache user changes. 
                 //This local model will be synchronized with 'model' when OK is clicked
                 //If Cancel is clicked, do nothing to 'model'
                 //this.set('geModel', mstrmojo.hash.make(this.model, mstrmojo.Obj));
                 this.set('geModel', mstrmojo.hash.make(_defaultGradientInfo, mstrmojo.Obj));
            },
            
            children: [
                    {//Colors 
                        scriptClass: 'mstrmojo.FieldSet',
                        alias: 'color',
                        cssClass: 'color',
                        legend: mstrmojo.desc(4880, 'Colors'),
                        children:[
                                  {
                                      scriptClass: 'mstrmojo.Table',
                                      rows:2,
                                      cols:2,
                                      children: [
                                                 {
                                                     scriptClass: 'mstrmojo.Label',
                                                     text: mstrmojo.desc(4881, 'Color 1'),
                                                     slot: '0,0'
                                                 },
                                                 
                                                 //fillColor dropdown
                                                 createColorDropDown({slot: '0,1'}, 0),
                                                 
                                                 {
                                                     scriptClass: 'mstrmojo.Label',
                                                     text: mstrmojo.desc(4882, 'Color 2'),
                                                     slot: '1,0'
                                                 },
                                                 
                                                 //gradientColor dropdown 
                                                 createColorDropDown({slot: '1,1'}, 1)
                                                 ]
                                  }
                                  ]
                    },
                    {//Shading && Preview
                        scriptClass: 'mstrmojo.FieldSet',
                        alias: 'shade',
                        cssClass: 'shade',
                        legend: mstrmojo.desc(4948, 'Shading Styles'),
                        children:[
                                  { //Angle list
                                      scriptClass: 'mstrmojo.List',
                                      cssClass: 'orientation mstrmojo-radio-list',
                                      alias: 'angle',
                                      items: [
                                              {n: mstrmojo.desc(4957, 'Horizontal'), v: 0},
                                              {n: mstrmojo.desc(4949, 'Vertical'), v: 90}
                                              ],
                                      onchange: function(evt) {
                                          var geModel = this.parent.parent.geModel,
                                              variantIndex = this.parent.preview.preview_bg.variantIndex;
                                          if (geModel && typeof(variantIndex)!='undefined' && variantIndex != -1) {
                                              var angle = this.selectedItem.v,
                                                  offset = offsets[angle][variantIndex]; //keep current selection, but update X-Y-Offset with angle change
                                                  
                                              //update gradient info
                                              geModel.set('GradientAngle', angle);
                                              geModel.set('GradientXOffset', offset.x);
                                              geModel.set('GradientYOffset', offset.y);
                                          }
                                      },
                                      bindings: {
                                          variantIndex: function() {
                                              return this.parent.preview.preview_bg.variantIndex;
                                          },
                                          selectedIndex: function() { //To initialize the selection
                                                  var geModel = this.parent.parent.geModel;
                                                  if (geModel) {
                                                      var angle = geModel && geModel.GradientAngle || 0;
                                                      return angle == 90 ? 1 : 0;
                                                  }
                                                  return -1;
                                              }
                                      }
                                  },
                                  
                                  {
                                      scriptClass: 'mstrmojo.Container',
                                      alias: 'preview',
                                      cssClass: 'mstrmojo-GradientEditor-previewbox',
                                      markupString: '<div class="{@cssClass}"></div>',
                                      markupSlots: {
                                          containerNode: function() {return this.domNode;}
                                      },
                                      children: [
                                                 
                                  
                                  createPreview(0), //Preview 0
                                  createPreview(1), //Preveiw 1
                                  createPreview(2), //Preveiw 2 first half
                                  createPreview(3), //Preview 2 second half

                                  {//label on selected preview box
                                      scriptClass: 'mstrmojo.Label',
                                      text: mstrmojo.desc(4875, '(Flash Only)'),
                                      cssClass: 'mstrmojo-GradientEditor-preview p2 label'
                                  },

                                  {//border on selected preview box
                                      scriptClass: 'mstrmojo.Label',
                                      alias: 'preview_bg',
                                      cssClass: 'mstrmojo-GradientEditor-preview bg',
                                      onvariantIndexChange: function() {
                                          //selected, now move the border on the selected preview box
                                          var phNode = this.domNode;
                                          if (phNode) {
                                              phNode.className = this.cssClass + ' show p' + this.variantIndex;
                                          }
                                      },
                                      bindings: {
                                          variantIndex: function() {
                                              //Find out selectedIndex based on X-Y-Offset
                                              var geModel = this.parent.parent.parent.geModel;
                                              if (geModel) {
                                                  var offset = this.parent.parent.parent.geModel.GradientAngle == 90 ?
                                                                  this.parent.parent.parent.geModel.GradientYOffset:   //Horizontal - each variant has different Y-offset
                                                                  this.parent.parent.parent.geModel.GradientXOffset;  //Vertical - each variant has different X-offset
        
                                                  return {'0': 0, '100': 1, '50': 2}[offset];
                                              }
                                              return -1;
                                          }
                                      }
                                  }
                                  
                                  ]
                                  }
                        ]
                    },
                    
                    {//ButtonBar
                        scriptClass: "mstrmojo.HBox",
                        cssClass: "mstrmojo-Editor-buttonBar",
                        slot: "buttonNode",
                        children: [
                                       new mstrmojo.Button.newInteractiveButton (
                                               mstrmojo.desc(1442, 'OK'), 
                                               function() {
                                                   var editor = this.parent.parent;
                                                   editor.close();
                                                   saveModel(editor);
                                                   
                                                   if (editor.onOK) {
                                                       editor.onOK();
                                                   }
                                               }, 
                                               '#999', 
                                               {alias: 'ok', cssClass: 'mstrmojo-Editor-button'}
                                       ),
                                       new mstrmojo.Button.newInteractiveButton (
                                               mstrmojo.desc(2140, 'Cancel'), 
                                               function(){
                                                   var editor = this.parent.parent;
                                                   editor.close();
                                                   if (editor.onCancel) {
                                                       editor.onCancel();
                                                   }
                                               }, 
                                               '#999', 
                                               { alias: 'cancel', cssClass: 'mstrmojo-Editor-button'}
                                       )
                                  ]
                     }
            ]
            
        }); //end mstrmojo.GradientEditor{}
         
})();

