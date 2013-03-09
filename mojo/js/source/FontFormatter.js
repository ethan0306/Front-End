(function(){
    mstrmojo.requiresCls("mstrmojo.hash", 
            "mstrmojo._FormatDefinition",
            "mstrmojo.Table",
            "mstrmojo._HasLayout",
            "mstrmojo.color",
            "mstrmojo.ColorPicker");
    
    
    var _H = mstrmojo.hash,
    _A = mstrmojo.array,
    _FD = mstrmojo._FormatDefinition,
    _C = mstrmojo.color;
    
    
    var getList = function(config){
        var _list = {
                scriptClass: 'mstrmojo.List',
                cssClass: 'mstrmojo-FormatEditor-fontFamily',
                itemCssClass: 'mstrmojo-FormatEditor-bullet',
                selectedIndex: 0,
                itemIdField: 'v',
                itemMarkup: '<div class="mstrmojo-FormatEditor-bullet">' + 
                                    '<div class="mstrmojo-text">{@n}</div>' + 
                                    '</div>'
        };
        
        return _H.copy(config, _list);
    };
    
    /**
     * Get triStateCheckbox
     * 
     * @param {Object} ps Extra properties to this widget instance
     * @param {String} ps.modelBinding Required, set model binding.
     */
    var getTriStateCheckBox = function(ps) {
        var alias = ps.alias,
            label = ps.label,
            pr = ps.pr;
        
        return {
            alias : alias,
            scriptClass:'mstrmojo.TristateCheckBox',
            text: label,
            checked: false,
            grayed: false,              
            bindings: {
                m: ps.modelBinding,
                checked: function() {
                    return  this.m[pr] == -1;
                },
                grayed: function() {
                    return (typeof this.m[pr] == 'undefined') || this.m[pr] == 'pru';
                }
            },
            oncheckedChange: function(evt) {
                if(this.m){
                    this.m.set(pr, this.checked ? -1 : 0);
                }
            }
        };
     };
    
    mstrmojo.FontFormatter = mstrmojo.declare (
            
            //superclass
            mstrmojo.Container,  
             
            //mixins
            null,
            
           /**
            * @lends mstrmojo.FontFormatTab.prototype
            */
           {
               scriptClass: "mstrmojo.FontFormatter",
                         
               cssClass: 'mstrmojo-FontFormatter',
                
               /**
                * <pre>
                *     { 
                *             Name: 'Arial',
                *             Bold: '0',
                *             Italic: '0',
                *             Size: '10',
                *             Strikeout: '0',
                *             Underline: '0',
                *             Color: '0',
                *             Script: '0'
                *             
                * }// FormattingFont</pre>
                * 
                * @type Object
                */
//               model: null,
               
               markupString: '<div id={@id} class="{@cssClass}" style="{@cssText}"></div>',
               
               markupSlots: {
                   containerNode: function() { return this.domNode; }
               },
               
               markupMethods: {
                   onvisibleChange: function() { this.domNode.style.display = this.visible ? 'block' : 'none'; }
               },
               
               /**
                * Make FormattingFont model hashable
                */
               postCreate: function(){
                    this.onmodelChange();
                },
                
                onmodelChange: function(){
                    if(this.model && !this.model.scriptClass){
                        _H.make(this.model, mstrmojo.Obj);
                   }
                },
               
               children: [{
                   scriptClass: 'mstrmojo.Table',
                   layout :  [{cells: [{}, {}, {}]}, {cells: [{}, {colSpan: 2}]}], 
                   children: [{
                       scriptClass: 'mstrmojo.Label',
                       text: mstrmojo.desc(2172), //Descriptor: Font:
                       slot: '0,0'
                       },
                       getList({
                           items: _FD.Families,
                           itemMarkup: '<div class="mstrmojo-FormatEditor-bullet">' 
                               + '<div class="mstrmojo-text" style="font-family:{@n}">{@n}</div>' 
                               + '</div>',
                           pr: 'Name',
                           bindings: {
                               selectedIndex: function(){
                                   var mdl = this.parent.parent.model;
                                   if(mdl){
                                       var id = mdl['Name'],
                                       idx = _A.find(this.items, this.itemIdField, id);
                                       return idx == -1 ? 0 : idx;
                                   }
                               }
                           },
                           onchange: function(){
                               var mdl = this.parent.parent.model;
                               if(mdl){
                                   mdl.set('Name', this.selectedItem.v);
                               }
                           },
                           slot: '0,0'
                       }), {
                           scriptClass: 'mstrmojo.Label',
                           text: mstrmojo.desc(3059), //Style
                           slot: '0,1'
                           },
                           getList({
                               items: _FD.Styles,
                               cssClass: 'mstrmojo-FormatEditor-fontStyle',
                               bindings: {
                                   selectedIndex: function(){
                                       var mdl = this.parent.parent.model;
                                       if (mdl){
                                           //-1 = yes; 0 = no
                                           var bold = mdl.Bold || '',
                                               italic =  mdl.Italic || '',
                                           
                                               //if both 'bold' and 'italic' are default, select 'default'
                                               //if both are 0 (NO), select regular
                                               //if one is -1 (Yes), the other can be 0 or default, eg., the possible value is '-1,' and '-1,0'. both give the same selectedIndex                                                
                                               style = bold=='' && italic=='' ? '': bold + ',' + italic,
                                               idx = mstrmojo.array.find(this.items, this.itemIdField, style);
                                           
                                               //if style not found, check 'v2'
                                               idx = idx == -1 ?  mstrmojo.array.find(this.items, 'v2', style) : idx;
                                           
                                           return (idx == -1 ? 0 : idx);
                                       }
                                   }
                               },
                               onchange: function(){
                                   var mdl = this.parent.parent.model;
                                   if(mdl && this.selectedItem){
                                       var stls = this.selectedItem.v.split(','),
                                       bold = italic= 'pru';
                                       
                                       if(stls[0] != 'pru'){
                                           bold = stls[0] == '-1'? '-1' : '0';
                                           italic = stls[1] == '-1'? '-1' : '0';
                                       }
                                       mdl.set('Bold', bold);
                                       mdl.set('Italic', italic);
                                   }
                               },
                               slot: '0,1'
                           }), {
                               scriptClass: 'mstrmojo.Label',
                               text: mstrmojo.desc(2178),  //Descriptor: Size
                               slot: '0,2'
                               },
                               getList({
                                   items: _FD.Sizes,
                                   cssClass: 'mstrmojo-FormatEditor-fontSize',
                                   bindings: {
                                       selectedIndex: function(){
                                           var mdl = this.parent.parent.model;
                                           if(mdl){
                                               var id = mdl['Size'],
                                               idx = _A.find(this.items, this.itemIdField, id);
                                               return idx == -1 ? 0 : idx;
                                           }
                                       }
                                   },
                                   onchange: function(){
                                       var mdl = this.parent.parent.model;
                                       if(mdl){
                                           mdl.set('Size', this.selectedItem.v);
                                       }
                                   },
                                   slot: '0,2'
                               }), {
                                   scriptClass: 'mstrmojo.Label',
                                   text: mstrmojo.desc(3060), //Descriptor: Effect
                                   slot: '1,0'
                               }, {
                                   scriptClass: 'mstrmojo.VBox',
                                   cssClass: 'mstrmojo-FormatEditor-fontEffect',
                                   postCreate: function(){
                                       this.addChildren(getTriStateCheckBox({alias: 'Underline', label: mstrmojo.desc(3061),  pr: 'Underline', modelBinding: 'this.parent.parent.parent.model'}));
                                       this.addChildren(getTriStateCheckBox({alias: 'Strikeout', label: mstrmojo.desc(3062),  pr: 'Strikeout', modelBinding: 'this.parent.parent.parent.model'}));
                                   },
                                   slot: '1,0'
                               },{
                                   scriptClass: 'mstrmojo.Label',
                                   text: mstrmojo.desc(3063), //Descriptor: Color
                                   slot: '1,1'
                               },
                               mstrmojo.ColorPicker.createDropDown({
                                   pr: 'Color',
                                   bindings: {
                                       fillColor: function() {
                                           var m = this.parent.parent.model;
                                           if (m){
                                               var color = m[this.pr];
                                               if (typeof (color) != 'undefined' && /^\d{1,8}$/.test(color)) {
                                                   return _C.decodeColor(color);
                                                   }
                                               }
                                           return 'transparent';
                                        }
                                   },
                                   onfillColorChange: function() {
                                       if(this.parent.parent.model){
                                           this.parent.parent.model.set(this.pr, this.fillColor == 'transparent' ? 'pru': _C.encodeColor(this.fillColor));
                                       }
                                   },
                                   slot: '1,1'
                               }), {
                                   scriptClass: 'mstrmojo.Label',
                                   text: mstrmojo.desc(2036), //Descriptor: Sample
                                   slot: '1,1'
                               },{
                                   scriptClass: 'mstrmojo.Label',
                                   cssClass: 'mstrmojo-FormatEditor-fontPreview',
                                   text: mstrmojo.desc(2037), //Descriptor: ABCabc
                                   bindings: {
                                       m: 'this.parent.parent.model',
                                       cssText: function() {
                                           
                                           var color = this.m.Color,
                                               size = this.m.Size,
                                               family = this.m.Name,
                                               bold = this.m.Bold,
                                               italic = this.m.Italic,
                                               underline = this.m.Underline,
                                               strikeout = this.m.Strikeout;
                                           
                                           color = /^\d{1,8}$/.test(color) ? _C.decodeColor(color) : _C.decodeColor(_FD.DefaultFormat.FormattingFont.Color); //'#000';
                                           size  = size || _FD.DefaultFormat.FormattingFont.Size;    //10pt
                                           family = family ||  _FD.DefaultFormat.FormattingFont.Name;  //'Arial';
                                           bold = bold == '-1'? 'bold' : 'normal';
                                           italic = italic == '-1'? 'italic' : 'normal';
                                           underline = parseInt(underline) == -1;
                                           strikeout = parseInt(strikeout) == -1;
                                           
                                           return ';font-family:'+ family +
                                                  ';font-style:' + italic +
                                                  ';font-weight:' + bold +
                                                  ';font-size:' + size + 'pt' +
                                                  ';color:' + color + 
                                                  ';text-decoration:' + (underline? ' underline ' : '') + 
                                                                        (strikeout ? ' line-through ' : '');
                                       }
                                   },
                                   slot: '1,1'
                               }]
               }]
           }
       ); //end declare()
})();