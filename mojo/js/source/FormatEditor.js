(function(){
    
    mstrmojo.requiresCls(
        "mstrmojo.color",
        "mstrmojo.hash",
        "mstrmojo.Label",
        "mstrmojo.TextBox",
        "mstrmojo.CheckBox",
        "mstrmojo.DropDownButton",        
        "mstrmojo.Pulldown",
        "mstrmojo.TristateCheckBox",
        "mstrmojo.Container",
        "mstrmojo.Table",
        "mstrmojo.VBox",
        "mstrmojo.HBox",
        "mstrmojo.FieldSet",
        "mstrmojo.Popup",
        "mstrmojo.List",
        "mstrmojo.Editor",
        "mstrmojo._FormatDefinition",
        "mstrmojo.ColorPicker");
    
    //shortcut to color helper class
    var _C = mstrmojo.color,
        _H = mstrmojo.hash,
        _FD = mstrmojo._FormatDefinition,
        _N = mstrmojo.num;
    
    
    //These Property Set should be made observable
    var _observableSets = {
            FormattingNumber: true,
            FormattingBorder: true
    };
    
    //Animation duration
    var _Duration = 350;
    
    /**
     * <p>
     * Animation effect of sliding in/out of a widget
     * </p>
     * 
     * @param {Boolean}
     *            show Boolean to indecate show or hide
     * @param {Object}
     *            widget Mojo Widget Instance
     */
    function slideProp(show, target, prop, start, stop, onEnd, ease, extraProps) {

        // set animation properties
        var props = {
                duration: _Duration,
                target : target,
                onEnd : function() {
                    if (onEnd) {
                        onEnd();
                    }
                },
                props: {}
            };
        
        props.props[prop] = {
                ease : ease || mstrmojo.ease.sin,
                start : parseInt(start, 10),
                stop : parseInt(stop, 10),
                suffix : 'px'
            };//targetProps;

        // copy in other widget specific animation properties
        props = mstrmojo.hash.copy(extraProps, props);

        // Animation instance
        var fx = new mstrmojo.fx.AnimateProp(props);

        fx.play();
    }
   
    
    function _saveModel(w) {
        var cgeModel = w.model,
            feModel = mstrmojo.all.feModel.model,
            df = _FD.DefaultFormat;

            for (var i = 0; i < feModel.items.length; i ++) {
                for (var j =0 ; j < 4; j++ )
                {
                    var which = ['header_format', 'grid_format', 'child_header_format', 'child_grid_format'][j];
                    var cgef = cgeModel.items[i][which]||null;
                    var fef = feModel.items[i][which];

                    //if feModel does not have xxx_format, just delete it (if any) from cgeModel
                    if (fef === undefined) {
                        delete cgeModel.items[i][which];
                        continue;
                    }
                    
                    for (var ps in df) {
                        var PS = df[ps];
                        
                        //if neither CGE nor FE model has this property set, go to next set 
                        if (!cgef && !fef || cgef && !cgef[ps] && !fef[ps]) {
                            continue;
                        }
                        
                        for (var p in PS) {
                            var P = PS[p];

                            //if editor model does not have this property or have '' as value which means 'default'
                            if (typeof fef[ps]=== 'undefined' || fef[ps]==='') {
                                //delete it from cgemodel if any
                                if (cgef && cgef[ps]) {
                                    delete cgef[ps];
                                }
                            }
                            //if this is same as in default
                            else if (fef[ps][p] === 'pru' || (fef[ps][p] == undefined && cgef && cgef[ps] && cgef[ps][p] != undefined)) {
                                delete fef[ps][p];
                                
                                //if cgemodel has this property, set it back to default
                                if (cgef && cgef[ps] && cgef[ps][p]) {
                                    cgef[ps][p] = 'pru';
                                }
                            }
                            else if (typeof fef[ps][p] != 'undefined'){ //otherwise add to cgeModel
                                cgef = cgef || {};
                                cgef[ps] = cgef[ps] || {};
                                cgef[ps][p] = fef[ps][p];
                            }
                        }
                    }
                    
                    //if there is some data, save it
                    if (cgef) {
                        cgeModel.items[i][which] = cgef;
                    }
                }
                
                //console.dir(cgeModel.items[i])
            }
    }
    
    
    
     /**
      * <p>Simulate a tri-state CheckBox.</p>
      *  - grayed (default - checked or unchecked)
      *  - checked
      *  - unchecked
      *  
      * <p>When Property has default value, it displays as grayed. When clicking on grayed state, it removes gray look & feeel. Further clicking will toggle checked / unchecked states</p>
      * <p>Only initial state can be 'grayed'. Once removing 'gray', it cannot return back to that state</p>
      * 
      * @param {Object} ps Properties to be added to this instance
      * @param {String} ps.alias Alias; Optional
      * @param {String} ps.label Text shown next to checkbox.
      * @param {String} ps.prs Formatting Property Set name
      * @param {String} ps.pr Formatting Property name
      * @private
      */ 
      var _triStateCheckBox = function(ps) {
          var alias = ps.alias,
              label = ps.label,
              prs = ps.prs,
              pr = ps.pr;
          
          return {
              alias : alias,
              scriptClass:'mstrmojo.TristateCheckBox',
              text: label,
              checked: false,
              grayed: false,              
              bindings: {
                  checked: function() {
                      return  mstrmojo.all.feModel.currentFormat[prs][pr] == -1;
                  },
                  grayed: function() {
                      return (typeof mstrmojo.all.feModel.currentFormat[prs][pr] == 'undefined');
                  }
              },
              oncheckedChange: function(evt) {
                  mstrmojo.all.feModel.currentFormat[prs][pr] = this.checked ? -1 : 0;
              }
          };
       };
      
       
       
       

       
//       /**
//        * <p>Right Panel prototype widget</p>
//        * <p>Each right panel widget should extend this widget</p>
//        */
//       mstrmojo._FormatEditorRightPanel = mstrmojo.declare(
//               mstrmojo.Container,
//               null,
//               {
//                   scriptClass: 'mstrmojo.rightPanelWidget', //'mstrmojo.Container',
//                   alias: 'number',
//                   markupString: '<div id={@id} class="mstrmojo-FormatEditor-rightPanel {@cssClass}" style="{@cssText}"></div>',
//                   markupSlots: {
//                   containerNode: function() { return this.domNode; }
//               },
//               markupMethods: {
//                   onvisibleChange: function() { 
//                   if (!this.useAnimate) {
//                       this.domNode.style.display = this.visible ? 'block' : 'none'; 
//                   }
//               }
//               },
//               useAnimate: true,
//               width: '402px',
//               ease: "mstrmojo.ease.linear"
//               });

       /**
        * <p>Create JSON for each Right Panel</p>
        * @param {Object} ps JSON Object to define the right panel to create
        */
       var _createRightPanel = function(ps) {
          return _H.copy(
                  ps,
                 {
                      scriptClass: 'mstrmojo.Container',
                      markupString: '<div id={@id} class="mstrmojo-FormatEditor-rightPanel {@cssClass}" style="{@cssText}"></div>',
                      markupSlots: {
                          containerNode: function() { return this.domNode; }
                      },
                      markupMethods: {
                          onvisibleChange: function() { 
                                  if (!this.useAnimate) {
                                      this.domNode.style.display = this.visible ? 'block' : 'none'; 
                                  }
                          }
                      },
                      useAnimate: true,
                      width: '420px',
                      ease: "mstrmojo.ease.sin"
                  });
       };

       
    //--Font Panel
    var _fontPanelWidget = _createRightPanel(
            {
                alias: 'font',
                cssClass: 'fontPanel',
                cssText: 'z-index:2; overflow:visible;',
                children: [
                           {
                               scriptClass: 'mstrmojo.Table',
                               cssClass: 'mstrmojo-FormatEditor-fontTable',
                               rows: 2,
                               cols: 3,
                               cellPadding: 5,
                               layout: [
                                            //First row
                                            {
                                                cells: [
                                                            {},{},{}
                                                        ]
                                            },
                                            // Second row
                                            {
                                                cells: [
                                                        {},
                                                        {colSpan: 2}
                                                      ]
                                            }
                                        ],
                               children: [
                                          {
                                              scriptClass: 'mstrmojo.Label',
                                              text: mstrmojo.desc(2172), //Descriptor: Font:
                                              slot: '0,0'
                                          },
                                          {
                                              scriptClass: 'mstrmojo.Label',
                                              text: mstrmojo.desc(3059), //Descriptor: Style:
                                              slot: '0,1'
                                          },
                                          {
                                              scriptClass: 'mstrmojo.Label',
                                              text: mstrmojo.desc(2178), //Descriptor: Size
                                              slot: '0,2'
                                          },
                                          
                                        { //Family
                                            scriptClass: 'mstrmojo.List',
                                            alias: 'fontFamily',
                                            cssClass: 'mstrmojo-FormatEditor-fontFamily',
                                            itemCssClass: 'mstrmojo-FormatEditor-bullet',
                                            selectedIndex: 0,
                                            itemMarkup: '<div class="mstrmojo-FormatEditor-bullet">' + 
                                                                '<div class="mstrmojo-text" style="font-family:{@n}">{@n}</div>' + 
                                                         '</div>',
                                            items: _FD.Families,
                                            bindings: {
                                                selectedIndex: function() {
                                                      var idx = mstrmojo.array.find(_FD.Families, 'v', mstrmojo.all.feModel.currentFormat.FormattingFont.Name);
                                                      return idx == -1 ? 0 : idx;
                                                  }
                                            },
                                            onchange: function(evt) {
                                                mstrmojo.all.feModel.currentFormat.FormattingFont.Name = this.selectedItem.v;
                                            },
                                            slot: '0,0'
                                        },
                                        { //Style
                                            scriptClass: 'mstrmojo.List',
                                            alias: 'fontStyle',
                                            cssClass: 'mstrmojo-FormatEditor-fontStyle',
                                            itemCssClass: 'mstrmojo-FormatEditor-bullet',
                                            selectedIndex: 0,
                                            itemMarkup: '<div class="mstrmojo-FormatEditor-bullet">' + 
                                                                '<div class="mstrmojo-text">{@n}</div>' + 
                                                         '</div>',
                                            items: _FD.Styles,
                                            bindings: {
                                                selectedIndex: function() {
                                                    //-1 = yes; 0 = no
                                                    var bold = mstrmojo.all.feModel.currentFormat.FormattingFont.Bold || '',
                                                        italic =  mstrmojo.all.feModel.currentFormat.FormattingFont.Italic || '',
                                                    
                                                        //if both 'bold' and 'italic' are default, select 'default'
                                                        //if both are 0 (NO), select regular
                                                        //if one is -1 (Yes), the other can be 0 or default, eg., the possible value is '-1,' and '-1,0'. both give the same selectedIndex                                                
                                                        style = bold=='' && italic=='' ? '': bold + ',' + italic,
                                                        idx = mstrmojo.array.find(_FD.Styles, 'v', style);
                                                    
                                                        //if style not found, check 'v2'
                                                        idx = idx == -1 ?  mstrmojo.array.find(_FD.Styles, 'v2', style) : idx;
                                                    
                                                    return (idx == -1 ? 0 : idx);
                                                }
                                            },
                                            onchange: function() {
                                                var bold = 'pru',
                                                italic = 'pru';
            
                                                switch (this.selectedIndex) {
                                                case 0: 
                                                    break;
                                                case 1:
                                                    bold = 0;
                                                    italic = 0;
                                                    break;
                                                case 2: 
                                                    bold = -1;
                                                    italic = 0;
                                                    break;
                                                case 3:
                                                    bold = 0;
                                                    italic = -1;
                                                    break;
                                                case 4: 
                                                    bold = -1;
                                                    italic = -1;
                                                    break;
                                                }
            
                                                mstrmojo.all.feModel.currentFormat.FormattingFont.Bold = bold;
                                                mstrmojo.all.feModel.currentFormat.FormattingFont.Italic = italic;
                                            },
                                            slot: '0,1'
                                        },
                                        { //Size
                                            scriptClass: 'mstrmojo.List',
                                            alias: 'fontSize',
                                            cssClass: 'mstrmojo-FormatEditor-fontSize',
                                            itemCssClass: 'mstrmojo-FormatEditor-bullet',
                                            selectedIndex: 0,
                                            itemMarkup: '<div class="mstrmojo-FormatEditor-bullet">' + 
                                                                '<div class="mstrmojo-text">{@n}</div>' + 
                                                         '</div>',
                                            items: _FD.Sizes,
                                            bindings: {
                                                selectedIndex: function() {
                                                    var idx = mstrmojo.array.find(_FD.Sizes, 'v', mstrmojo.all.feModel.currentFormat.FormattingFont.Size);
                                                    return idx == -1 ? 0 : idx;
                                                }
                                            },
                                            onchange: function(evt) {
                                                mstrmojo.all.feModel.currentFormat.FormattingFont.Size = this.selectedItem.v;
                                            },
                                            slot: '0,2'
                                        },
                                        {
                                            scriptClass: 'mstrmojo.Label',
                                            text: mstrmojo.desc(3060), //Descriptor: Effect:
                                            slot: '1,0'
                                        },
                                        {//Effects
                                            scriptClass: 'mstrmojo.VBox',
                                            alias: 'fontEffect',
                                            cssClass: 'mstrmojo-FormatEditor-fontEffect',
                                            children: [
                                                _triStateCheckBox({alias: 'Underline', label: mstrmojo.desc(3061), prs: 'FormattingFont', pr: 'Underline'}), //Descriptor: Underline
                                                _triStateCheckBox({alias: 'Strikeout', label: mstrmojo.desc(3062), prs: 'FormattingFont', pr: 'Strikeout'}) //Descriptor: Strikeout                                           
                                             ],
                                             slot: '1,0'
                                        },
                                        
                                        {
                                            scriptClass: 'mstrmojo.Label',
                                            text: mstrmojo.desc(3063), //Descriptor: Color:
                                            slot: '1,1'
                                        },
                                        
                                        //Color
                                        mstrmojo.ColorPicker.createDropDown(
                                                {
                                                    alias: 'fontColor',
                                                    pr: 'Color',
                                                    bindings: {
                                                        fillColor: function() {
                                                            var color = mstrmojo.all.feModel.currentFormat.FormattingFont[this.pr];
                                                            if (typeof (color) != 'undefined' && /^\d{1,8}$/.test(color)) {
                                                                return _C.decodeColor(color);
                                                            }
                                                            return 'transparent';
                                                        }
                                                    },
                                                    onfillColorChange: function() {
                                                        mstrmojo.all.feModel.currentFormat.FormattingFont[this.pr] = (this.fillColor == 'transparent' ? 'pru': _C.encodeColor(this.fillColor));
                                                    },
                                                    slot: '1,1'
                                                }
                                        ),
                                        
                                        {
                                            scriptClass: 'mstrmojo.Label',
                                            text: mstrmojo.desc(2036), //Descriptor: Sample:
                                            slot: '1,1'
                                        },
                                        {//Preview
                                            scriptClass: 'mstrmojo.Label',
                                            alias: 'fontPreview',
                                            cssClass: 'mstrmojo-FormatEditor-fontPreview',
                                            text: mstrmojo.desc(2037), //Descriptor: ABCabc
                                            bindings: {
                                                cssText: function() {
                                            
                                                    var color = this.parent.fontColor.fillColor,
                                                        size = this.parent.fontSize.selectedItem.v,
                                                        family = this.parent.fontFamily.selectedItem.v;
                                                    
                                                    color = /^#[a-f0-9]{6}$/i.test(color) ? color : _C.decodeColor(_FD.DefaultFormat.FormattingFont.Color); //'#000';
                                                    size  = size || _FD.DefaultFormat.FormattingFont.Size;    //10pt
                                                    family = family ||  _FD.DefaultFormat.FormattingFont.Name;  //'Arial';
                                                    
                                                    return ';font-family:'+ family +
                                                           ';font-style:' + ['default','normal','normal','italic','italic'][this.parent.fontStyle.selectedIndex] +
                                                           ';font-weight:' + ['default','normal','bold','normal','bold'][this.parent.fontStyle.selectedIndex] +
                                                           ';font-size:' + size + 'pt' +
                                                           ';color:' + color + 
                                                           ';text-decoration:' + (this.parent.fontEffect.Underline.checked ? ' underline ' : '') + 
                                                                                 (this.parent.fontEffect.Strikeout.checked ? ' line-through ' : '');
                                                }
                                            },
                                            slot: '1,1'
                                        }
                                        ]
                           }
                 ]
             });
            
    
    
    ////Number Panel/////
    /**
     * <p>Create Decimal Place TextBox</p>
     * @param {Object} ps Extra properties to this widget instance
     * @param {String} ps.negative The corresponding negative List widget instance's alias 
     */
    var createDecimalBox = function(ps) {
        return mstrmojo.hash.copy(ps,
                {//DecimalPlaces
                scriptClass: 'mstrmojo.TextBox',
                alias: 'decimalPlaces',
                //negative: negativeAlias, //To be provided in argument 'ps.negative'
                bindings: {
                    value: function() {
                            return mstrmojo.all.feModel.currentFormat.FormattingNumber.DecimalPlaces || '2';
                        },
                    category: function() {
                            //when switching Category, we need update some default model data
                            var category = mstrmojo.all.feModel.currentFormat.FormattingNumber.Category;
                            
                            //call onkeyup to update model
                            this.onkeyup();
                        }
                },
                onkeyup: function(evt) {
                    if (/^\d{1,2}$/.test(this.value)) {
                        var was = mstrmojo.all.feModel.currentFormat.FormattingNumber.DecimalPlaces,
                            v = this.value;
                        mstrmojo.all.feModel.currentFormat.FormattingNumber.DecimalPlaces = v;
                    
                        if (was != v && this.negative) {

                            var negative = this.parent[this.negative],
                            itms;
                            if(negative && negative.refreshFormatList){
                                negative.refreshFormatList();
                            } else {
                                itms = mstrmojo.hash.clone(_FD[this.negative])
                                if (itms) {
                                    var digits= v > 0 ? '.' : '',  //to update display (item.v)
                                            zeros = digits;  //to update format (item.f)
                                    for (var i = 0; i < Math.min(v, _FD.MaxNegativeDidigts); i ++) {
                                        digits += i % 9;
                                        zeros += '0';
                                    }
    
                                    for (i = 0; i < itms.length; i ++) {
                                        itms[i].n = itms[i].n.replace(/\.\d{2}/g, digits);
                                        itms[i].f = itms[i].f.replace(/\.\d{2}/g, zeros);
                                    }
                                    negative.set('items', itms);
                                }
                            }
                        }
                    }
                }
            }
        );
    } ,
    
    /**
     * <p>Create List widget with given items</p>
     * 
     * @param {Object} ps Extra properties for this widget instance
     * @param {Array} ps.items Array of items to display
     * @alias {String} ps.alias Alias for this widget. It should be the same string used in corresponding defintion in mstrmojo._FormatDefition
     *        - FixedNegative, CurrencyNegative or PercentNegative
     */
    createNegativeList = function(ps){
        return mstrmojo.hash.copy(
                ps, 
                
                {//Negative
                    scriptClass: 'mstrmojo.List',
                    cssClass: 'mstrmojo-FormatEditor-numberFormatList',
                    //alias: //should be provided in argument 'ps.items'
                    //items: //should be provided in argument 'ps.alias'
                    itemMarkupFunction: function(item, idx, widget) {
                                var color = item.r ? 'color: red' : '';
                                
                                return '<div class="mstrmojo-FormatEditor-bullet">' + 
                                            '<div class="mstrmojo-text" style="'+ color + '">' + item.n + '</div>' + 
                                        '</div>';
                    },
                    selectionPolicy: 'reselect',
                    bindings: {
                        selectedIndex: function(){
                            var idx = mstrmojo.array.find(this.items, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.NegativeNumbers);
                            if (idx === -1) {
                                 idx = mstrmojo.array.find(this.items, 'f', mstrmojo.all.feModel.currentFormat.FormattingNumber.Format);
                            }
                            //force to re-select in order to get correct selectedItem.v after 'items' is re-built when decimalPlaces change
                            this.singleSelect(idx);
                            
                            return idx == -1 ? 3: idx;
                        },
                        category: function() {
                            //when switching Category, we need update 'Format' to the selected value in newly selected Category;
                            //And thus Custom Category can also update its display
                            var category = mstrmojo.all.feModel.currentFormat.FormattingNumber.Category;
                            this.onchange();
                        }
                    },
                    onchange: function(evt) {
                        if (this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category) && this.selectedItem) {
                            mstrmojo.all.feModel.currentFormat.FormattingNumber.NegativeNumbers = this.selectedItem.v;
                            mstrmojo.all.feModel.currentFormat.FormattingNumber.set('Format', this.selectedItem.f || this.selectedItem.v);
                        }
                    },
                    postCreate: function() {
                        var d = mstrmojo.all.feModel.currentFormat.FormattingNumber.DecimalPlaces;
                        if (d != 2) {
                            var itms = mstrmojo.hash.clone(_FD[this.alias]);
                            if (itms) {
                                var digits= d > 0 ? '.' : '',  //to update display (item.v)
                                    zeros = digits;  //to update format (item.f)
                                for (var i = 0; i < Math.min(d, _FD.MaxNegativeDidigts); i ++) {
                                    digits += i % 9;
                                    zeros += '0';
                                }
                                
                                for (var i = 0; i < itms.length; i ++) {
                                    itms[i].n = itms[i].n.replace(/\.\d{2}/g, digits);
                                    itms[i].f = itms[i].f.replace(/\.\d{2}/g, zeros);
                                }
                                this.set('items', itms);
                            }
                        }
                    }
                }
        );
    },
    
    //Time, Date, Fraction
    /**
     * <p>create widget instance for Time/Date/Fraction</p>
     * @param {Object} ps Properties for the widget instance
     * @param {Integer} ps.idx The corresponding index in the Category List (4 - Date, 5 - Time, 7 - Fraction)
     * @param {Array} ps.items
     * @param {String} ps.alias Name of the number category - 'Date', 'Time' or 'Fraction'
     */
    createNumberFormatList = function(ps) {
        return mstrmojo.hash.copy(ps,
                       {
                           scriptClass: 'mstrmojo.List',
                           cssClass: 'mstrmojo-FormatEditor-numberFormatList ' + ps.alias,
                           itemMarkupFunction: function(item, idx, widget) {
                                    return '<div class="mstrmojo-FormatEditor-bullet">' + 
                                                '<div class="mstrmojo-text">' + item.n + '</div>' + 
                                            '</div>';
                            },
                            selectedIndex: 0,
                            bindings: {
                                selectedIndex: function(evt){
                                    var idx = mstrmojo.array.find(this.items, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Format);
                                    return idx===-1 ? 0 : idx;
                                },
                                category: function() {
                                    //when switching Category, we need update 'Format' to the selected value in newly selected Category;
                                    //And thus Custom Category can also update its display
                                    var category = mstrmojo.all.feModel.currentFormat.FormattingNumber.Category;
                                    
                                    //if there is no selectedItem, use first one.
                                    this.onchange();
                                }
                            },
                            onchange: function(evt) {
                                if (this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category)) {
                                    mstrmojo.all.feModel.currentFormat.FormattingNumber.set('Format', this.selectedItem.f || this.selectedItem.v);
                                }
                            }
                       }
        );
    };
    
    var _numberPanelWidget =  _createRightPanel(
    {//Number Panel panel
        alias: 'number',
        cssText: 'width:0;',
        cssClass: 'numberPanel',
        children: [
                   {
                       scriptClass: 'mstrmojo.Label',
                       text: mstrmojo.desc(7940), //Descriptor: Category
                       cssClass: 'category',
                       cssText: 'font-weightx: bold'
                   },
                   
                   { //Number Category List
                     scriptClass: 'mstrmojo.List',
                     alias: 'numberCategory',
                     cssClass: 'mstrmojo-FormatEditor-numberCategory',
                     items: _FD.Category,
                     selectionPolicy: 'reselect',
                     bindings: {
                       selectedIndex: function() {
                           var cat = mstrmojo.all.feModel.currentFormat.FormattingNumber.Category,
                               idx = mstrmojo.array.find(this.items, 'v', (cat==='pru' ? -2 : cat)); //if 'Category' equal 'pru', it means it is set from '-2' to 'pru' for later model saving processing
                                                                                                   //so we need change it back from 'pru' to '-2' in order to select correct panel.
                             return (idx == -1) ? 0 : idx; 
                       }
                     },
                     onchange: function(evt) {
                         
                        mstrmojo.all.feModel.currentFormat.FormattingNumber.set('Category', this.selectedIndex===0 ? 'pru': this.selectedItem.v);
                        
                        
//                        var sp = this.parent.numberSubpanelContainer,
//                            ch = sp && sp.children[this.selectedIndex];
//                        if (ch) {
//                            //update some common
//                            switch (this.selectedIndex) {
//                            case 0: //Default
//                            case 1: //General
//                                mstrmojo.all.feModel.currentFormat.FormattingNumber = {Category: _FD.Category[this.selectedIndex].v};
//                                mstrmojo.hash.make(mstrmojo.all.feModel.currentFormat.FormattingNumber, mstrmojo.Obj);
//                                break;
//                            case 2: //Fixed
//                                mstrmojo.all.feModel.currentFormat.FormattingNumber.DecimalPlaces = ch.decimalPlaces.value; 
//                                break;
//                            case 3: //Currency
//                                mstrmojo.all.feModel.currentFormat.FormattingNumber.DecimalPlaces = ch.decimalPlaces.value;
//                                mstrmojo.all.feModel.currentFormat.FormattingNumber.CurrencySymbol = ch.currencySymbol.value;
//                                
//                                break;
//                            }
//                        }
                        
                        //now slide subpanel 
                        //- subpanes are arranged in one row side by side, sliding will move css 'left' of the container to show the selected subpanel.
                        var subPanelContainer = this.parent.numberSubpanelContainer;
                        if (this.hasRendered && subPanelContainer.domNode) { //check domNode ready or not since at this moment 'hasRendered' is not set yet by panleContainer.
                            var width = 300, //subpanel width 300px 
                                start = - (evt.removed[0] || 0 ) * width, //last shown position of subpanel container
                                stop = - this.selectedIndex * width;

                            slideProp(true, subPanelContainer.containerNode, 'left', start, stop, null, null, {duration:20, interval:15});
                        }
                     }
                 },
                 {
                     scriptClass: 'mstrmojo.Container',
                     alias: 'numberSubpanelContainer',
                     width: '300px',
                     markupString: '<div id={@id} class="mstrmojo-FormatEditor-numberPanel-subpanel {@cssClass}">' +
                                         '<div class="mstrmojo-FormatEditor-numberPanel-subpanel-container"></div></div>',
                     markupSlots: {
                         containerNode: function(){return this.domNode.firstChild;}
                     },
                     postBuildRendering: function() {
                         var ret = mstrmojo.Container.prototype.postBuildRendering.apply(this);
                         
                         //slide in the selected number sub-panel by re-select
                         this.parent.numberCategory.singleSelect(this.parent.numberCategory.selectedIndex);
                         return ret;
                     },
                     children: [
                                {//Default
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item',
                                    idx: 0, //subpanel index
                                    rows: 1,
                                    cols: 1,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: '&nbsp;',
                                                   slot: '0,0'
                                               }
                                    ],
                                    bindings: {
                                        category: function() {
                                            //when switching Category, we need update 'Format' to the selected value in newly selected Category;
                                            //And thus Custom Category can also update its display
                                            if (this.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category )) 
                                            {
                                                mstrmojo.all.feModel.currentFormat.FormattingNumber.set('Format', '');
                                            }
                                        }
                                    } 
                                },
                                {//General
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item',
                                    idx: 1, //subpanel index
                                    rows: 1,
                                    cols: 1,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: '&nbsp;',
                                                   slot: '0,0'
                                               }
                                    ],
                                    bindings: {
                                        category: function() {
                                            //when switching Category, we need update 'Format' to the selected value in newly selected Category;
                                            //And thus Custom Category can also update its display
                                            if (this.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category)) {
                                                mstrmojo.all.feModel.currentFormat.FormattingNumber.set('Format', '');
                                            }
                                        }
                                    } 
                                },
                                {//Fixed
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item fixed',
                                    idx: 2, //subpanel index
                                    rows: 3,
                                    cols: 2,
                                    layout: [
                                             {
                                                 cells: [
                                                         {},{}
                                                       ]
                                             },
                                             {
                                                 cells: [
                                                         {},{}
                                                       ]
                                             },
                                             
                                             // 3rd  row
                                             {
                                                 cells: [
                                                         {colSpan: 2}
                                                       ]
                                             }
                                         ],
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2046), //Descriptor: Decimal places
                                                   slot: '0,0'
                                               },
                                               //DecimalPlaces
                                               createDecimalBox({
                                                   negative: 'FixedNegative', 
                                                   alias: 'FixedDecimalPlaces',
                                                   slot: '0,1'
                                                       }),
                                               
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2044), //Descriptor:  Negative Numbers
                                                   slot: '1,0'
                                               },
                                               //NegativeNumbers
                                               createNegativeList({
                                                   items: _FD.FixedNegative, 
                                                   refreshFormatList: function(){
                                                       var p = this.parent,
                                                           fdp = p && p.FixedDecimalPlaces,
                                                           ts = p && p.ThousandSeparator;
                                                       
                                                       if(!fdp || !ts){
                                                           return;
                                                       }
                                                       
                                                       var cd = fdp.value || 0,
                                                           itms =  mstrmojo.hash.clone(_FD.FixedNegative),
                                                           uts = ts.checked,
                                                           dgs = cd > 0 ? '.' : '',
                                                           zrs = dgs,
                                                           ns;
                                                       
                                                       //create the digits string
                                                       for (var d = 0, len = Math.min(cd, _FD.MaxNegativeDidigts); d < len; d++) {
                                                           dgs += d % 9;
                                                           zrs += '0';
                                                       }             
                                                       
                                                       for (var i = 0; i < itms.length; i ++) {
                                                           
                                                           //update name
                                                           ns = itms[i].n.replace(/\.\d{2}/g, dgs);
                                                           if(!uts){
                                                               ns = ns.replace("1,234", "1234");
                                                           }
                                                           itms[i].n = ns;
                                                           
                                                           //update format
                                                           ns = itms[i].f.replace(/\.\d{2}/g, zrs);
                                                           if(!uts){
                                                               ns = ns.replace(/#,##/g, "###");
                                                           }
                                                           itms[i].f = ns;
                                                       }
                                                       this.set('items', itms);
                                               },
                                                   alias:'FixedNegative',
                                                   slot: '1,1'
                                                   }),
                                               
                                               {//1000 Separator
                                                   scriptClass: 'mstrmojo.ImageCheckBox',
                                                   alias: 'ThousandSeparator',
                                                   label: mstrmojo.desc(2049),     //Descriptor: Use 1000 Separator
                                                   cssText: 'width:auto;',
                                                   bindings: {
                                                       checked: function() {
                                                           var ts = mstrmojo.all.feModel.currentFormat.FormattingNumber.ThousandSeparator;
                                                           if(ts == null){
                                                               ts = -1;
                                                           }
                                                           return parseInt(ts, 10) !== 0;
                                                       }
                                                   },
                                                   oncheckedChange: function() {
                                                       //only update when current sub-panel is the selected one
                                                       if (this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category)) {
                                                           mstrmojo.all.feModel.currentFormat.FormattingNumber.ThousandSeparator = this.checked ? -1 : 0;
                                                           this.parent.FixedNegative.refreshFormatList();
                                                       }
                                                   },
                                                   slot: '2,0'
                                               } 
                                   ] 
                                },
                                {//Currency
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item currency',
                                    idx: 3, //subpanel index
                                    rows: 4,
                                    cols: 2,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2046), //Descriptor: Decimal places
                                                   slot: '0,0'
                                               },
                                               //DecimalPlaces
                                               createDecimalBox({
                                                   negative: 'CurrencyNegative',
                                                   alias: 'currencyDecimal',
                                                   slot: '0,1'
                                               }),
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2047), //Descriptor: Currency Symbol
                                                   slot: '1,0'
                                               },
                                               {//CurrencySymbol
                                                   scriptClass: 'mstrmojo.TextBox',
                                                   alias: 'currencySymbol',
                                                   maxLength: 5,
                                                   bindings: {
                                                       value: function() {
                                                               return mstrmojo.all.feModel.currentFormat.FormattingNumber.CurrencySymbol || mstrmojo.desc('2369'); //currency symbol '$';
                                                       },
                                                       category: function() {
                                                               //when switching Category, we need update some default model data
                                                               if (this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category)) {
                                                                   //call onkeyup to update model
                                                                   this.onkeyup();
                                                               }
                                                       }
                                                   },
                                                   onkeyup: function(evt) {
                                                      this._update();
                                                   },
                                                   onvalueChange: function() {
                                                       this._update();
                                                   },
                                                   _update: function() {
                                                       var was = mstrmojo.all.feModel.currentFormat.FormattingNumber.CurrencySymbol;
                                                       mstrmojo.all.feModel.currentFormat.FormattingNumber.CurrencySymbol = this.value;
                                                       
                                                       //update currency format list
                                                       var negative =  this.parent.CurrencyNegative;
                                                       if(negative && (was != this.value)){
                                                           negative.refreshFormatList();
                                                       }
                                                   },
                                                   slot: '1,1'
                                               },
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2048), //Descripotr: Currency Position
                                                   slot: '2,0'
                                               },
                                               {//CurrencyPosition
                                                   scriptClass: 'mstrmojo.List',
                                                   cssClass: 'mstrmojo-FormatEditor-numberFormatList',
                                                   alias: 'CurrencyPosition',
                                                   items: _FD.CurrencyPosition,
                                                   itemMarkupFunction: function(item, idx, widget) {
                                                       return '<div class="mstrmojo-FormatEditor-bullet">' + 
                                                                   '<div class="mstrmojo-text">' + item.n + '</div>' + 
                                                               '</div>';
                                                   },
                                                   bindings: {
                                                       selectedIndex: function(){
                                                           var idx = mstrmojo.array.find(_FD.CurrencyPosition, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.CurrencyPosition);
                                                           return (idx==-1 ? 0 : idx);
                                                       },
                                                       category: function() {
                                                               //when switching Category, we need update some default model data
                                                               if (this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category)) {
                                                                   //call onkeyup to update model
                                                                   this.onchange();
                                                               }
                                                           }
                                                   },
                                                   onchange: function(evt) {
                                                       mstrmojo.all.feModel.currentFormat.FormattingNumber.CurrencyPosition = this.selectedItem.v;

                                                       var negative = this.parent.CurrencyNegative;
                                                       if (negative) {
                                                           negative.refreshFormatList();
                                                       }
                                                   },
                                                   slot: '2,1'
                                                   
                                               },
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2044), //Descriptor: Negative Numbers
                                                   slot: '3,0'
                                               },
                                               //NegativeNumbers
                                               createNegativeList({
                                                   items: _FD.CurrencyNegative, 
                                                   refreshFormatList: function(){
                                                       var p = this.parent,
                                                           cdt = p && p.currencyDecimal,
                                                           cpl = p && p.CurrencyPosition,
                                                           cst = p && p.currencySymbol;
                                                       
                                                       if(!cdt || !cpl || !cst){
                                                           return;
                                                       }
                                                        
                                                       var cd = cdt.value || 0,
                                                           cp = cpl.selectedIndex || 0,
                                                           cs = cst.value || '',
                                                           cs = (cp == 2 ? cs + ' ' : (cp == 3 ? ' ' + cs : cs)),
                                                           itms =  mstrmojo.hash.clone(_FD.CurrencyNegative),
                                                           dgs = cd > 0 ? '.' : '',
                                                           zrs = dgs,
                                                           fa;
                                                       
                                                       //create the digits string
                                                       for (var d = 0, len = Math.min(cd, _FD.MaxNegativeDidigts); d < len; d++) {
                                                           dgs += d % 9;
                                                           zrs += '0';
                                                       }             
                                                       
                                                       for (var i = 0; i < itms.length; i ++) {
                                                           if(cp == 1 || cp == 3){//right or right with space, move symbol to end
                                                               fa = itms[i].f.split(";");
                                                               for(var j=0,len=fa.length;j<len;j++){
                                                                   fa[j] = fa[j].replace(/(\"\$\")(.*)/g, '$2$1');
                                                               }

                                                               itms[i].n = itms[i].n.replace(/(\$)(.*)/g, '$2$1');
                                                               itms[i].f = fa.join(";");
                                                           }
                                                           
                                                           //replace the currency symbol and digits string
                                                           itms[i].n = itms[i].n.replace(/\$/g, cs).replace(/\.\d{2}/g, dgs);
                                                           itms[i].f = itms[i].f.replace(/\$/g, cs).replace(/\.\d{2}/g, zrs);
                                                       }
                                                       this.set('items', itms);
                                                   },
                                                   alias: 'CurrencyNegative',
                                                   slot: '3,1'})
                                     ] 
                                },
                                
                                //Date Format
                                {
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item Date',
                                    idx: 4, //subpanel index
                                    rows: 1,
                                    cols: 2,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2869), //Descriptor: Formatting
                                                   slot: '0,0'
                                               },
                                               
                                               createNumberFormatList({
                                                   items: _FD.Date,
                                                   alias: 'Date',
                                                   slot: '0,1'})
                                           ]
                                },
                                
                                //Time Format
                                {
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item Time',
                                    idx: 5, //subpanel index
                                    rows: 1,
                                    cols: 2,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2869), //Descriptor: Formatting
                                                   slot: '0,0'
                                               },
                                               
                                               createNumberFormatList({
                                                   items: _FD.Time,
                                                   alias: 'Time',
                                                   slot: '0,1'})
                                           ]
                                },
                                
                                
                                {//Percentage
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item percentage',
                                    idx: 6, //subpanel index
                                    rows: 2,
                                    cols: 2,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2046), //Descriptor: Decimal places
                                                   slot: '0,0'
                                               },
                                               //DecimalPlaces
                                               createDecimalBox({
                                                   negative: 'PercentNegative',
                                                   slot: '0,1'}),
                                               
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2044), //Descriptor: Negative numbers
                                                   slot: '1,0'
                                               },
                                               //NegativeNumbers
                                               createNegativeList({
                                                   items: _FD.PercentNegative, 
                                                   alias: 'PercentNegative',
                                                   slot: '1,1'})
                                   ]
                                }, //end percentage

                                //Fraction
                                {
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item Fraction',
                                    idx: 7, //subpanel index
                                    rows: 1,
                                    cols: 2,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2869), //Descriptor: Formatting
                                                   slot: '0,0'
                                               },
                                               
                                               createNumberFormatList({
                                                   items: _FD.Fraction,
                                                   alias: 'Fraction',
                                                   slot: '0,1'})
                                           ]
                                },

                                {//Scientific
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item scientific',
                                    idx: 8, //subpanel index
                                    rows: 1,
                                    cols: 2,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2046), //Descriptor: Decimal places
                                                   slot: '0,0'
                                               },
                                               //DecimalPlaces
                                               createDecimalBox({slot: '0,1'})
                                              ],
                                    bindings: {
                                        category: function() {
                                            //when switching Category, we need update 'Format' to the selected value in newly selected Category;
                                            //And thus Custom Category can also update its display
                                            if (this.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category)) 
                                            {
                                                mstrmojo.all.feModel.currentFormat.FormattingNumber.set('Format', '0.00E+00');
                                            }
                                        }
                                    } 
                                }, //end Scientific

                                {//Custom
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item custom',
                                    idx: 9, //subpanel index
                                    rows: 1,
                                    cols: 2,
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2133), //Descriptor: Custom: 
                                                   slot: '0,0'                                               
                                               },
                                               {//custom format
                                                   scriptClass: 'mstrmojo.TextBox',
                                                   alias: 'custom',
                                                   value: '',
                                                   bindings: {
                                                       value: function() {  
                                                           return mstrmojo.all.feModel.currentFormat.FormattingNumber.Format;
                                                       }
                                                   },
                                                   onvalueChange: function() {
                                                       //only update when current sub-panel is the selected one
                                                       if (this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', mstrmojo.all.feModel.currentFormat.FormattingNumber.Category)) {
                                                           mstrmojo.all.feModel.currentFormat.FormattingNumber.Format = this.value;
                                                       }
                                                   },
                                                   slot: '0,1'
                                               }
                                      ] 
                                } //end Custom
                                ]
                 
                 }
         ]
     });
    
    
    /**
     * @param {Object} ps Properties specific to each padding inputbox
     * @param {String} ps.pr Property name ('LeftPadding', 'RightPadding', 'TopPadding', 'BottomPadding')
     */
//    var createPaddingBox = function(ps) {
//        return mstrmojo.hash.copy(
//                ps,
//                {
//                    scriptClass: 'mstrmojo.TextBoxWithLabel',
//                    cssDisplay: 'block',
//                    rightLabel: 'inches',
//                    valid: true,
//                    bindings: {
//                        value : function() {
//                            return mstrmojo.all.feModel.currentFormat.FormattingPadding[this.pr] || '';
//                        }
//                    },
//                    markupMethods: {
//                        onvalueChange: function() { 
//                            //when model changes, update inputbox display
//                            this.inputNode.value = this.value;
//                        },
//                        onvalidChange: function() {
//                            this.inputNode.style.color = this.valid ? '#000' : '#FF0000';
//                        }
//                    },
//                    onvalueChange: function() {
//                        mstrmojo.all.feModel.currentFormat.FormattingPadding[this.pr] = this.value;
//                    },
//                    onkeyup: function() {
//                        var valid = /^(\s*|\d*([\d\.])\d*)$/.test(this.inputNode.value);
//                        if (valid) {
//                            mstrmojo.all.feModel.currentFormat.FormattingPadding[this.pr] = this.value;
//                        }
//                        this.set('valid', valid);
//                    }
//                });
//    };
    var createPaddingBox = function(ps) {
        return mstrmojo.hash.copy(
                    ps,
                    {
                        scriptClass: 'mstrmojo.ValidationTextBox',
                        maxLength: 6,
                        dtp: 4, //decimal
                        min: 0,
                        max: 100,
                        constraints: {
                            trigger: mstrmojo.validation.TRIGGER.ONKEYUP
                        },
                        bindings: {
                            value : function() {
                                var v = mstrmojo.all.feModel.currentFormat.FormattingPadding[this.pr];
                                return v == null ? '' : this._PT2UserUnits(v).replace(/0{1,}$/, '').replace(/\.$/, '.0').replace(/,$/, ',0');  //trim trailing 0s, and append one 0 if it has multiple before trimming
                            }
                        },
                        postCreate: function() {
                            this.markupMethods = mstrmojo.hash.copy(
                                    {
                                        onvalueChange: function() { 
                                            //when model changes, update inputbox display
                                            this.inputNode.value = this.value;
                                        }
                                    },
                                    mstrmojo.hash.copy(this.markupMethods)
                            );
                        },
                        onValid: function() {
                            mstrmojo.all.feModel.currentFormat.FormattingPadding[this.pr] = this._UserUnits2PT(this.value );
                        },
                        /**
                         * padding is saved as 'pt' in backend, which should be converted to local user units:
                         */
                        _PT2UserUnits: function(v) {
                            return _N.toLocaleString(_N.convertToLocalUnits(_N.toString(v) / 72.0));
                        },
                        /**
                         * convert user input into 'pt'
                         */
                        _UserUnits2PT: function(v) {
                          return _N.toLocaleString(_N.toString(_N.convertToUSUnits(v)) * 72.0);
                      }
                    }
        );
    };
   
    /**
     * <p>Create pefix and suffix label for a TextBox.</p>
     * <p>This label is supposed to be placed in TABLE cell</p>
     * @param {String} text Text to display
     * @param {String} slot Cell Location
     */
    var createPaddingBoxLabel = function(text, slot) {
        return {
            scriptClass: 'mstrmojo.Label',
            text: text,
            slot: slot            
        };
    };
    
    
    //--Alignement Panel
    var _alignmentPanelWidget =  _createRightPanel(
     { 
         alias: 'alignment',
         cssClass: 'alignmentPanel',
         cssText: 'width:0;',
         children: [
                    { //Text Alignment
                        scriptClass: 'mstrmojo.FieldSet',
                        alias: 'textAlignment',
                        cssClass: 'mstrmojo-FormatEditor-textAlignment',
                        legend: mstrmojo.desc(2065), //Descriptor: Text Alignment
                        children: [
                                    {
                                        scriptClass: 'mstrmojo.Table',
                                        rows: 2,
                                        cols: 2,
                                        children: [
                                                   {
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
                                                           value: 'mstrmojo.all.feModel.currentFormat.FormattingAlignment.Horizontal'
                                                       },
                                                       
                                                       onvalueChange: function() {
                                                              mstrmojo.all.feModel.currentFormat.FormattingAlignment.Horizontal = this.value;
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
                                                           value: 'mstrmojo.all.feModel.currentFormat.FormattingAlignment.Vertical'
                                                       },
                                                       onvalueChange: function() {
                                                              mstrmojo.all.feModel.currentFormat.FormattingAlignment.Vertical = this.value;
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
                                    _triStateCheckBox({
                                        alias: 'TextWrap',
                                        label: mstrmojo.desc(2070), //Descriptor: Wrap Text
                                        prs: 'FormattingAlignment',
                                        pr: 'TextWrap'}),
                                    
                                    {//Text Direction
                                        scriptClass: 'mstrmojo.HBox',
                                        children: [
                                                   {
                                                       scriptClass: 'mstrmojo.Label',
                                                       text: mstrmojo.desc(5159) //Descriptor: Text Direction:
                                                   },
                                                   //Text Direction
                                                   {
                                                       scriptClass:'mstrmojo.Pulldown',
                                                       itemIdField: 'v',
                                                       items: _FD.TextDirection,
                                                       bindings: {
                                                           value:'mstrmojo.all.feModel.currentFormat.FormattingAlignment.TextDirection'
                                                       },
                                                       onvalueChange: function() {
                                                              mstrmojo.all.feModel.currentFormat.FormattingAlignment.TextDirection = this.value;
                                                       },
                                                       slot: '1,1'
                                                   }
                                                       
                                                   ]
                                    }
                                          
                         ]
                     } ,
                     
                     { //Padding
                         scriptClass: 'mstrmojo.FieldSet',
                         alias: 'padding',
                         cssClass: 'mstrmojo-FormatEditor-padding',
                         legend: mstrmojo.desc(2883), //Descriptor: Padding
                         children: [
                                    {
                                        scriptClass: 'mstrmojo.HBox',
                                        cssClass: 'paddingBox',
                                        children: [
//                                                   {
//                                                       scriptClass: 'mstrmojo.VBox',
//                                                       children: [
////                                                                  {
////                                                                      scriptClass: 'mstrmojo.Label',
////                                                                      text: 'Left'
////                                                                  },
//                                                                  createPaddingBox({label: 'Left', pr: 'LeftPadding'}),
//                                                                  
////                                                                  {
////                                                                      scriptClass: 'mstrmojo.Label',
////                                                                      text: 'Top'
////                                                                  },
//                                                                  createPaddingBox({label: 'Top', pr: 'TopPadding'})
//                                                                  ]
//                                                   },
//                                                   {
//                                                       scriptClass: 'mstrmojo.VBox',
//                                                       children: [
////                                                                    {
////                                                                        scriptClass: 'mstrmojo.Label',
////                                                                        text: 'Right'
////                                                                    },
//                                                                    createPaddingBox({label: 'Right', pr: 'RightPadding'}),
//                                                                    
////                                                                    {
////                                                                        scriptClass: 'mstrmojo.Label',
////                                                                        text: 'Bottom'
////                                                                    },
//                                                                    createPaddingBox({label: 'Bottom', pr: 'BottomPadding'})
//                                                                  ]
//                                                   }
                                       
                                                    {
                                                       scriptClass: 'mstrmojo.Table',
                                                       rows: 2,
                                                       cols: 3,
                                                       children: [
                                                                  //Left
                                                                  createPaddingBoxLabel(mstrmojo.desc(3528), '0,0'), //Descriptor: Left
                                                                  createPaddingBox({pr: 'LeftPadding', slot: '0,1'}),
                                                                  createPaddingBoxLabel(mstrApp.unitsLabel, '0,2'),
                                                                  
                                                                  //Top
                                                                  createPaddingBoxLabel(mstrmojo.desc(3526), '1,0'),       //Descriptor: Top
                                                                  createPaddingBox({pr: 'TopPadding', slot: '1,1'}),
                                                                  createPaddingBoxLabel(mstrApp.unitsLabel, '1,2')
                                                                  ]
                                                   },
                                                   {
                                                       scriptClass: 'mstrmojo.Table',
                                                       rows: 2,
                                                       cols: 3,
                                                       children: [
                                                                  //Right
                                                                  createPaddingBoxLabel(mstrmojo.desc(3529), '0,0'),         //Descriptor: Right
                                                                  createPaddingBox({pr: 'RightPadding', slot: '0,1'}),
                                                                  createPaddingBoxLabel(mstrApp.unitsLabel, '0,2'),

                                                                  //Bottom
                                                                  createPaddingBoxLabel(mstrmojo.desc(3527), '1,0'),        //Descriptor: Bottom
                                                                  createPaddingBox({pr: 'BottomPadding', slot: '1,1'}),
                                                                  createPaddingBoxLabel(mstrApp.unitsLabel, '1,2')
                                                                  ]
                                                   }
                                                   
                                    ]

                                    }
                          ]
                     }
                                          
                 ]
             }); //end alignmentPanel
            

    //---Color Line Panel
    /**
     * <p>Update all border color/styles</p>
     * @param {String} n Property name - 'Color' or 'Style'
     * @param {String} v Property value
     */
   var  _updateBorder = function(n, v) {
        var labels = ['Left', 'Right', 'Top', 'Bottom'];

        //update all four borderStyle
        for (var i = 0; i < 3; i ++) {
            mstrmojo.all.feModel.currentFormat.FormattingBorder[labels[i] + n] = v;
        }
        //only raise event when update last border
        mstrmojo.all.feModel.currentFormat.FormattingBorder.set(labels[3] + n, v);
    };
    
   var _colorLinePanelWidget =  _createRightPanel(
   {
       alias: 'colorLine',
       cssClass: 'colorLinePanel',
       cssText: 'width:0;',
       children: [
                  { //Fill
                      scriptClass: 'mstrmojo.FieldSet',
                      alias: 'fill',
                      cssClass: 'mstrmojo-FormatEditor-fill',
                      legend: mstrmojo.desc(2885), //Descriptor: Fill
                      children: [
                                 {
                                     scriptClass: 'mstrmojo.Label',
                                     text: mstrmojo.desc(2060), //Descriptor: Color:
                                     cssClass: 'label'
                                 },
                                 //Fill DropDown
                                 mstrmojo.ColorPicker.createDropDown(
                                         {
                                             bindings: {
                                                 fillStyle: function() {
                                                     //0 - solid; 1 - transparent; 2 - gradient; 3 - pattern(Not Supported in Web) 
                                                     var fp = mstrmojo.all.feModel.currentFormat.FormattingPatterns,
                                                     fillStyle = fp.FillStyle;
        
                                                     if (fillStyle == 2) {
                                                         var angle = parseInt(fp.GradientAngle, 10),
                                                         type = angle === 0 ? 1 : 0, // gradient type: 1 - horizontal 0 - vertical,
                                                                 fillColor = _C.decodeColor(fp.FillColor),
                                                                 gradientColor = _C.decodeColor(fp.GradientColor),
                                                                 offsetIndex = parseInt(fp['Gradient'+ (angle === 0 ? 'X' : 'Y') + 'Offset'], 10) == 100 ? 1: 0, //offset: 0, 100, 50 
                                                                         gradientCss = (offsetIndex != 1) ? mstrmojo.css.buildGradient(type, fillColor, gradientColor): mstrmojo.css.buildGradient(type, gradientColor, fillColor);
        
                                                                         //update DropDownButton display
                                                                         this.set('gradientCss', gradientCss.n + ':' + gradientCss.v);
        
                                                                         //just update 'gradient' property which will be passed to GradientEditor when open
                                                                         this._updateGradientInfo();
                                                     } else {
                                                         //non-gradient mode, raise event to update display
                                                         var color = mstrmojo.all.feModel.currentFormat.FormattingPatterns.FillColor;
                                                         if (typeof (color) != 'undefined' && /^\d{1,8}$/.test(color)) {
                                                             color = _C.decodeColor(color);
                                                         } else {
                                                             color = 'transparent';
                                                         }
                                                         this.set('fillColor', color);
                                                     }
        
                                                     return fillStyle || 0;
                                                 }
                                             },
                                             _updateGradientInfo: function() {
                                                 //prepare model for GradientEditor
                                                 var fp = mstrmojo.all.feModel.currentFormat.FormattingPatterns;
                                                 this.gradient = mstrmojo.hash.copy(
                                                         {
                                                             FillColor: _C.decodeColor(fp.FillColor), 
                                                             GradientColor: _C.decodeColor(fp.GradientColor)
                                                         },
                                                         mstrmojo.hash.copy(fp));
                                             },
                                             onfillColorChange: function() {
                                                 mstrmojo.all.feModel.currentFormat.FormattingPatterns.FillColor = (this.fillColor == 'transparent' ? 'pru' : _C.encodeColor(this.fillColor));
                                                 mstrmojo.all.feModel.currentFormat.FormattingPatterns.FillStyle = 0;
                                             },
                                             //Gradient
                                             ongradientChange: function(evt) {
                                                 //update model with gradient info
                                                 var g = ['FillStyle', 'FillColor', 'GradientColor', 'GradientXOffset', 'GradientYOffset', 'GradientAngle'];
                                                 for (var i = 0; i < g.length; i ++) {
                                                     var v = evt.value[g[i]];
                                                     mstrmojo.all.feModel.currentFormat.FormattingPatterns[g[i]] = /Color$/.test(g[i]) ? _C.encodeColor(v) : v;
                                                 }

                                                 //FillStyle info may not be part of 'gradient' object, so set it here.
                                                 mstrmojo.all.feModel.currentFormat.FormattingPatterns.FillStyle = 2;
                                             }
                                         },
                                         {
                                             showGradients: true 
                                         }
                                      )
                                      ]
                       },
                                    
                       { //Borders
                           scriptClass: 'mstrmojo.FieldSet',
                           alias: 'borders',
                           cssClass: 'mstrmojo-FormatEditor-border',
                           legend: mstrmojo.desc(2886), //Descriptor: Borders
                           children: [
                                      { 
                                          scriptClass: 'mstrmojo.Table',
                                          alias: 'borderTable',
                                          cssText: 'width:100%;',
                                          rows: 1,
                                          cols: 2,
                                          children : [
                                                      {//Border types List
                                                          scriptClass: 'mstrmojo.List',
                                                          alias: 'borderTypes',
                                                          pidx: 0, //this panel index
                                                          cssClass: 'borderTypes',
                                                          items: [
                                                                  {n: '<img border="0" align="absmiddle" src="../images/borders_none.gif" alt=""> ' + mstrmojo.desc(2057), v: 1},  //Descriptor: None
                                                                  {n: '<img border="0" align="absmiddle" src="../images/borders_all.gif" alt=""> ' + mstrmojo.desc(2058), v: 2},       //Descriptor: All
                                                                  {n: '<img border="0" align="absmiddle" src="../images/borders_custom.gif" alt=""> ' + mstrmojo.desc(2056), v: 3}  //Descriptor: Custom
                                                           ],
                                                           slot: '0,0',
                                                           oldSI: -1,
                                                           onchange: function(evt) {
                                                                  //update PanelIndex - indicate which panel is visible
                                                                  //each panel should have 'pidx' property to compare with this one to do some update 
                                                                  mstrmojo.all.feModel.set('pidx', this.selectedIndex);
        
                                                                  var widget = this.parent.borderAndColor;
                                                                  if (!widget) {
                                                                      return;
                                                                  }
        
                                                                  var rowHeight = 30,
                                                                  fullHeight = 105,
                                                                  allBordersContainer = widget.allBordersContainer.domNode,
                                                                  customBordersContainer = widget.customBordersContainer.domNode,
                                                                  oldSI = this.oldSI,
                                                                  h1Start,
                                                                  h1Stop,
                                                                  h2Start,
                                                                  h2Stop;
        
                                                                  switch(this.selectedIndex) {
                                                                      case 0:
                                                                          h1Stop = 0;
                                                                          h2Stop = 0;
                                                                          if (oldSI === 1) {
                                                                              h1Start = rowHeight;
                                                                              h2Start = 0;
                                                                          }
                                                                          else {
                                                                              h1Start = 0;
                                                                              h2Start = fullHeight;
                                                                          }
                                                                          break;
                                                                      case 1: 
                                                                          h1Start = 0;
                                                                          h1Stop = rowHeight;
                                                                          if (oldSI === 0) {
                                                                              h2Start = h2Stop = 0;
                                                                          }
                                                                          else {
                                                                              h2Start = fullHeight;
                                                                              h2Stop = 0;
                                                                          }
                                                                          break;
            
                                                                      case 2: 
                                                                          //if (oldSI == -1) break;
            
                                                                          h2Start = 0;
                                                                          h2Stop = fullHeight;
                                                                          if (oldSI === 0) {
                                                                              h1Start = h1Stop = 0;
                                                                          }
                                                                          else {
                                                                              h1Start = rowHeight;
                                                                              h1Stop = 0;
                                                                          }
                                                                          break;
                                                                      }

                                                                      //need display:block to support overflow:hidden
                                                                        allBordersContainer.style.display = 'block';
                                                                      customBordersContainer.style.display = 'block';

                                                                      slideProp(true, allBordersContainer, 'height', h1Start, h1Stop, 
                                                                              function(){widget.allBordersContainer.allBorders.set('show', h1Stop > h1Start);}, null, {durationx:1500});
                                                                      slideProp(true, customBordersContainer, 'height', h2Start, h2Stop, 
                                                                              function(){widget.customBordersContainer.customBorders.set('show', h2Stop > h2Start);}, null, {durationx:1500});
    
                                                                      //cache current panel index
                                                                      this.oldSI = this.selectedIndex;
    
                                                                      //save
                                                                      if (this.selectedIndex === 0) {
                                                                          //change borders to none
                                                                          var labels = ['Left', 'Right', 'Top', 'Bottom'];
                                                                          for (var i = 0; i < 4; i ++) {
                                                                              mstrmojo.all.feModel.currentFormat.FormattingBorder.set(labels[i] + 'Style', '0');
                                                                              mstrmojo.all.feModel.currentFormat.FormattingBorder.set(labels[i] + 'Color', '0');
                                                                          }
                                                                      } 
                                                                  },
                                                                  bindings: {
                                                                      selectedIndex: function() {
                                                                              if (!this.parent.borderAndColor) { return; }
                                                                              var bs = mstrmojo.all.feModel.currentFormat.FormattingBorder;
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
                                                                  }
                                                      },
                                                      { //Borders style container
                                                          scriptClass: 'mstrmojo.Container',
                                                          alias: 'borderAndColor',
                                                          markupString: '<div class="borderStyles"></div>',
                                                          markupSlots: {
                                                              containerNode: function(){return this.domNode;}
                                                          },
                                                          children: [
                                                                { //allBorders container
                                                                    scriptClass: 'mstrmojo.Container',
                                                                    alias: 'allBordersContainer',
                                                                    markupString: '<div class="mstrmojo-FormatEditor-ColorLine-borders"></div>',
                                                                    markupSlots: {
                                                                        containerNode: function(){return this.domNode;}
                                                                    },
                                                                    children:[
                                                                     {
                                                                         scriptClass:'mstrmojo.Table',
                                                                         alias: 'allBorders',
                                                                         rows: 1,
                                                                         cols: 3,
                                                                         onshowChange: function(){
                                                                             if (this.show) {
                                                                                 _updateBorder('Style', this.styles.value);
                                                                                 _updateBorder('Color', _C.encodeColor(this.colors.fillColor));
                                                                             }
                                                                         },
                                                                         postCreate: function() {
                                                                             var labels = ['Left', 'Right', 'Top', 'Bottom'];
                                                                             var children = [
                                                                                             //All Style
                                                                                             {
                                                                                                 scriptClass: 'mstrmojo.Pulldown',
                                                                                                 alias: 'styles',
                                                                                                 pidx: 1, //this widget is in panel #1
                                                                                                 items: _FD.BorderStyles,
                                                                                                 itemIdField: 'v',
                                                                                                 bindings: {
                                                                                                     value: function() {
                                                                                                         //var idx = this.getSelectedIndex && this.getSelectedIndex() || 0;
                                                                                                         var l = mstrmojo.all.feModel.currentFormat.FormattingBorder.LeftStyle,
                                                                                                         r = mstrmojo.all.feModel.currentFormat.FormattingBorder.RightStyle,
                                                                                                         t = mstrmojo.all.feModel.currentFormat.FormattingBorder.TopStyle,
                                                                                                         b = mstrmojo.all.feModel.currentFormat.FormattingBorder.BottomStyle;
                                                                                                         var idx = 0;
                                                                                                         if (l == r && r == b && b == t ) {
                                                                                                             idx = mstrmojo.array.find(_FD.BorderStyles, 'v', l);
                                                                                                         }
                                                                                                         idx = idx==-1 ? 0: idx;
                                                                                                         
                                                                                                         return this.items[idx][this.itemIdField];
                                                                                                     }
                                                                                                 },
                                                                                                 
                                                                                                 onvalueChange: function() {
                                                                                                     if (mstrmojo.all.feModel.pidx == this.pidx) {
                                                                                                         _updateBorder('Style', this.value);
                                                                                                     }
                                                                                                 },
                                                                                                 slot: '0,1'
                                                                                             },
    
                                                                                             mstrmojo.ColorPicker.createDropDown(
                                                                                                     {
                                                                                                         alias: 'colors',
                                                                                                         pidx: 1, //this widget is in panel #1
                                                                                                         pr: 'LeftColor',
                                                                                                         bindings: {
                                                                                                         fillColor: function() {
                                                                                                             var l = mstrmojo.all.feModel.currentFormat.FormattingBorder.LeftColor,
                                                                                                             r = mstrmojo.all.feModel.currentFormat.FormattingBorder.RightColor,
                                                                                                             t = mstrmojo.all.feModel.currentFormat.FormattingBorder.TopColor,
                                                                                                             b = mstrmojo.all.feModel.currentFormat.FormattingBorder.BottomColor;
        
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
                                                                                                         if (mstrmojo.all.feModel.pidx == this.pidx) {
                                                                                                             _updateBorder('Color', this.fillColor == 'transparent' ? 'pru' : _C.encodeColor(this.fillColor));
                                                                                                         }
                                                                                                     },
                                                                                                     slot: '0,2'
                                                                                                     }
                                                                                                     )
                                                                                                  ];
                                                                                               
                                                                             this.addChildren(children);
                                                                         }
                                                                     }
                                                                 ]}, //end allBordersContainer
                                                                
                                                                { //customBorders container
                                                                    scriptClass: 'mstrmojo.Container',
                                                                    alias: 'customBordersContainer',
                                                                    markupString: '<div class="mstrmojo-FormatEditor-ColorLine-borders"></div>',
                                                                    markupSlots: {
                                                                        containerNode: function(){return this.domNode;}
                                                                    },
                                                                    children:[
                                                                     {//custom borders
                                                                         scriptClass:'mstrmojo.Table',
                                                                         alias: 'customBorders',
                                                                         rows: 1,
                                                                         cols: 3,
                                                                         idx: 2, //panel index
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
                                                                                                 pidx: 2,
                                                                                                 items: _FD.BorderStyles,
                                                                                                 itemIdField:'v', 
                                                                                                 pr: label + 'Style',
                                                                                                 bindings: {
                                                                                                         value: function() {
                                                                                                             var l = mstrmojo.all.feModel.currentFormat.FormattingBorder.LeftStyle,
                                                                                                                 r = mstrmojo.all.feModel.currentFormat.FormattingBorder.RightStyle,
                                                                                                                 t = mstrmojo.all.feModel.currentFormat.FormattingBorder.TopStyle,
                                                                                                                 b = mstrmojo.all.feModel.currentFormat.FormattingBorder.BottomStyle;
        
                                                                                                             var idx = mstrmojo.array.find(_FD.BorderStyles, 'v', 
                                                                                                                         mstrmojo.all.feModel.currentFormat.FormattingBorder[this.pr]);
                                                                                                             idx = idx == -1 ? 0: idx;
                                                                                                             
                                                                                                             return this.items[idx][this.itemIdField];
                                                                                                         }
                                                                                                     },
                                                                                                     onvalueChange: function() {
                                                                                                         if (mstrmojo.all.feModel.pidx == this.pidx) {
                                                                                                             mstrmojo.all.feModel.currentFormat.FormattingBorder.set(this.pr, this.value);
                                                                                                         }
                                                                                                     },
                                                                                                     slot: '0,1'
                                                                                             },
                                                                                                                 
                                                                                                 mstrmojo.ColorPicker.createDropDown(
                                                                                                         {
                                                                                                             cssClassx: 'mstrmojo-FormatEditor-colorPicker',
                                                                                                             alias: label + 'Color',
                                                                                                             pidx: 2,
                                                                                                             pr: label + 'Color',
                                                                                                             bindings: {
                                                                                                                 fillColor: function() {
                                                                                                                         var l = mstrmojo.all.feModel.currentFormat.FormattingBorder.LeftColor,
                                                                                                                             r = mstrmojo.all.feModel.currentFormat.FormattingBorder.RightColor,
                                                                                                                             t = mstrmojo.all.feModel.currentFormat.FormattingBorder.TopColor,
                                                                                                                             b = mstrmojo.all.feModel.currentFormat.FormattingBorder.BottomColor;
                                                                                                                         
                                                                                                                         var color = mstrmojo.all.feModel.currentFormat.FormattingBorder[this.pr];
                                                                                                                         if (typeof (color) != 'undefined' && /^\d{1,8}$/.test(color)) {
                                                                                                                             return _C.decodeColor(color);
                                                                                                                         }
                                                                                                                         return 'transparent';
                                                                                                                     }
                                                                                                             },
                                                                                                             onfillColorChange: function() {
                                                                                                                 if (mstrmojo.all.feModel.pidx == this.pidx) {
                                                                                                                     mstrmojo.all.feModel.currentFormat.FormattingBorder.set(this.pr, this.fillColor == 'transparent' ? 'pru' : _C.encodeColor(this.fillColor));
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
                                                           
                                                   },//end TABLE
                                                   
                                                   //Border Preview
                                                   {
                                                       scriptClass: 'mstrmojo.Label',
                                                       cssClass: 'borderPreview',
                                                       text: mstrmojo.desc(7941), //Descripotr: Border preview
                                                       bindings: {
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
                                                                   
                                                                   return ';border-left-style: ' + (borderStyles[mstrmojo.all.feModel.currentFormat.FormattingBorder.LeftStyle] || 'solid') + 
                                                                          ';border-right-style: ' + (borderStyles[mstrmojo.all.feModel.currentFormat.FormattingBorder.RightStyle] || 'solid') +
                                                                          ';border-top-style: ' + (borderStyles[mstrmojo.all.feModel.currentFormat.FormattingBorder.TopStyle] || 'solid') +
                                                                          ';border-bottom-style: ' + (borderStyles[mstrmojo.all.feModel.currentFormat.FormattingBorder.BottomStyle] || 'solid') +
                                                                          ';border-left-color: ' + _C.decodeColor(mstrmojo.all.feModel.currentFormat.FormattingBorder.LeftColor || '0') +
                                                                          ';border-right-color: ' + _C.decodeColor(mstrmojo.all.feModel.currentFormat.FormattingBorder.RightColor || '0') + 
                                                                          ';border-top-color: ' + _C.decodeColor(mstrmojo.all.feModel.currentFormat.FormattingBorder.TopColor || '0') + 
                                                                          ';border-bottom-color: ' + _C.decodeColor(mstrmojo.all.feModel.currentFormat.FormattingBorder.BottomColor || '0') + 
                                                                          ';border-left-width: ' + (borderSizes[mstrmojo.all.feModel.currentFormat.FormattingBorder.LeftStyle] || 'thin') + 
                                                                          ';border-right-width: ' + (borderSizes[mstrmojo.all.feModel.currentFormat.FormattingBorder.RightStyle] || 'thin') +
                                                                          ';border-top-width: ' + (borderSizes[mstrmojo.all.feModel.currentFormat.FormattingBorder.TopStyle] || 'thin') +
                                                                          ';border-bottom-width: ' + (borderSizes[mstrmojo.all.feModel.currentFormat.FormattingBorder.BottomStyle] || 'thin');
                                                       }
                                                   }    
                                               }
                                         ] //end fieldset children
                                    } //end Borders fieldset
                     ] //end widget children
            }); //end colorLInePanel

    
    
    
    /**
     * <p>Common JSON for level0 and level1 DropDownButton</p>
     * <ul>
     * <li>Level 0 - list of Elements, like CustomGroup Elements</li>
     * <li>Level 2 - list of Format Component, like Header, Value etc</li>
     * </ul>
     * @param {Integer} level One of the two levels - 0 or 1
     * @param {Array} levelItems Array of items to be displayed in the popup.
     */
    var _levelDropDownJson = function(level, levelItems, ps) {
        return mstrmojo.hash.copy(
                ps,
                {
                    scriptClass:'mstrmojo.Pulldown',
                    cssClass: ' level' + level + ' mstrmojo-FormatEditor-DropDownButton',
                    popupToBody: true,
                    popupZIndex: 100,
                    items: levelItems,
                    onvalueChange: function(){
                        mstrmojo.all.feModel.set('level'+ level + 'Index', level===0 ? this.selectedIndex : this.selectedItem.p);
                    }
                });
    };
    
    

    
    /**
     * <p>Define content area layout</p>
     * <ul>
     * <li> top - two selectors and one Clear Format button</li>
     * <li> content - left panel and right panel
     *     <ul>
     *          <li>left panel - Formatting Properties Groups</li>
     *          <li>right panel - Formatting Properties</li>
     *     </ul>
     * </li>
     * </ul>
     */
    var _contentLayoutJson = function() {
        return {
            scriptClass: "mstrmojo.VBox",
            children:[
                      // Elements Selectors
                      {
                          scriptClass: "mstrmojo.HBox",
                          children: [
                                     //Level 0 Elements 
                                      _levelDropDownJson(0, mstrmojo.all.feModel.model.items,
                                              {
                                                      itemIdField:'did',
                                                      bindings: {
                                                          items: function() {
                                                              return mstrmojo.all.feModel.model.items ||[];
                                                          },
                                                          value: function(){
                                                              var idx = mstrmojo.all.feModel.level0Index;
                                                              idx = (idx == -1 ? 0: idx);
                                                              return this.items[idx][this.itemIdField];
                                                          }
                                                      }
                                              }
                                      ),
                                     
                                      //Level 1 Format Target
                                     _levelDropDownJson(1, _FD.FormatTarget,{
                                         itemIdField: 'v'
                                     }),
                                     
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
                                     )
                          ]
                      },
                   
                      //center area
                      {
                          scriptClass: 'mstrmojo.HBox',
                          cssClass: 'mstrmojo-FormatEditor-box',
                          children: [
                                     {//Left Panel
                                         scriptClass: 'mstrmojo.VBox',
                                         cssClass: 'mstrmojo-FormatEditor-leftPanel',
                                         children: [
//                                                     {//Formats list Label
//                                                         scriptClass: 'mstrmojo.Label',
//                                                         cssClass: 'mstrmojo-FormatEditor-bullet selected',
//                                                         text: mstrmojo.desc(2116)  //Descriptor: Format
//                                                     },
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
                                                         height: '200px',
                                                         onchange: function(evt) {
                                                             var rpc = this.parent.parent.rightPanelContainer,
                                                                 _rightPanels = rpc && rpc.children;
                                                             
                                                             if (_rightPanels && _rightPanels.length > 0 && this.selectedIndex >=0) {
//                                                                 var rightPanel = _rightPanels[this.selectedIndex],
//                                                                     rightPanelDomNode = rightPanel.domNode,
//                                                                 if (rightPanelDomNode) {
//                                                                     this.parent.zindex = this.parent.zindex || 0;
//                                                                     
//                                                                     rightPanelDomNode.style.zIndex = ++ this.parent.zindex;
//                                                                     
//                                                                     //Get widget width
//                                                                     var w = parseInt(rightPanel.width, 10);
//                                                                         start = -w,
//                                                                         stop = 0,
//
//                                                                         slideProp(true, rightPanel.domNode, 'left', start, stop);
//                                                                 }
                                                                 var rightPanel = _rightPanels[this.selectedIndex],
                                                                     rightPanelDomNode = rightPanel.domNode,
                                                                     oldIndex = evt.removed[0],
                                                                     oldRightPanel = oldIndex > -1 ? _rightPanels[oldIndex]: null,
                                                                     oldRightPanelDomNode = oldRightPanel && oldRightPanel.domNode;
                                                                     
                                                                     
                                                                     //now hide previous panel
                                                                     if (oldRightPanelDomNode) {
//                                                                         this.parent.zindex = this.parent.zindex || 0;
//                                                                         oldRightPanelDomNode.style.zIndex = -- this.parent.zindex;
                                                                         oldRightPanelDomNode.style.overflow = 'hidden';
                                                                         oldRightPanelDomNode.style.zIndex= 8;
                                                                         //Get widget width
                                                                         var w = parseInt(oldRightPanel.width, 10),
                                                                             start = w,
                                                                             stop = 0;

                                                                         slideProp(true, oldRightPanelDomNode, 'width', start, stop, function(){oldRightPanelDomNode.style.zIndex= 0;});
                                                                     }
                                                                     
                                                                     if (rightPanelDomNode) {
//                                                                       this.parent.zindex = this.parent.zindex || 0;
//                                                                       rightPanelDomNode.style.zIndex = ++ this.parent.zindex;
                                                                       
                                                                       //Get widget width
                                                                       var w = parseInt(rightPanel.width, 10);
                                                                       if (evt.removed.length === 0) { //First time loading 
                                                                           rightPanelDomNode.style.overflow = 'hidden';
                                                                           slideProp(true, rightPanelDomNode, 'width', 0, w, function(){
                                                                               rightPanelDomNode.style.overflow='visible';
                                                                               rightPanelDomNode.style.zIndex=7;});

                                                                       } else { //just set to display normally
                                                                           rightPanelDomNode.style.width = w + 'px';
                                                                           rightPanelDomNode.style.zIndex= 7;
                                                                           rightPanelDomNode.style.overflow='visible';
                                                                       }
                                                                   }

                                                             }
                                                         }
                                                     }
                                     ]},
                                         
                                             
                                         //Right Panel container
                                         {
                                             scriptClass: 'mstrmojo.Container',
                                             alias: 'rightPanelContainer',
                                             cssClass: 'mstrmojo-FormatEditor-rightPanel-container',
                                             markupString: '<div id={@id} class="{@cssClass}">' + 
                                                           '</div>',
                                             
                                             markupSlots: {
                                                 containerNode: function() { return this.domNode; }
                                             },
                                             
                                             children: [
                                                            
//                                                            //Font panel
//                                                            mstrmojo.insert(_fontPanelWidget), 
////                                                            _fontPanelWidget,
//                                                             
//                                                            //Number panel
//                                                            mstrmojo.insert(_numberPanelWidget), 
////                                                            _numberPanelWidget,
//                                                            
//                                                            //Alignment panel
//                                                            mstrmojo.insert(_alignmentPanelWidget),
////                                                            _alignmentPanelWidget,
//   
//                                                            //Color and Line panel
//                                                            mstrmojo.insert(_colorLinePanelWidget)
////                                                            _colorLinePanelWidget,
                                                            
                                                            //Font panel
                                                            _fontPanelWidget,
                                                             
                                                            //Number panel
                                                            _numberPanelWidget,
                                                            
                                                            //Alignment panel
                                                            _alignmentPanelWidget,
   
                                                            //Color and Line panel
                                                            _colorLinePanelWidget
                                                           ]
                                             }
                                     ]
                          
                      } //end center area
                     
                     ]
        };
    };
    
    
    
    /**
     * <p>FormatEditor Widget</p>
     * 
     * @class
     * @extends mstrmojo.Editor
     */
    mstrmojo.FormatEditor = mstrmojo.declare (
         
         //superclass
         mstrmojo.Editor,  
          
         //mixins
         null,
         
        /**
         * @lends mstrmojo.FormatEditor.prototype
         */
        {
            scriptClass: "mstrmojo.FormatEditor",
                      
            cssClass: 'mstrmojo-FormatEditor',
            
            id: 'fe',
            
            /**
             * <p>Animation ease effect</p>
             * 
             * @type {String} 
             * @default "mstrmojo.ease.bounce"
             */
            ease: "mstrmojo.ease.bounce",

            /**
             * <p>Flag to indicate whether this widget will display by animation</p>
             * 
             * @type Boolean
             * @default true
             */
            useAnimate: false,
            
            /**
             * <p>Flag to indicate whether custom cssClass provided to instance should replace predefined cssClass for each widget</p>
             * <p>Predefined cssClass define basic CSS rules to make GUI look correct.</p>
             * <p>If custom cssClass is going to replace the predefined one, it should define all necessary CSS rules</p>
             * 
             * <dl>
             *      <dt>true</dt>
             *      <dd>custom cssClass replace predefined value</dd>
             *      <dt>false</dt>
             *      <dd>custom cssClass will be appended to predefined value</p>
             * </dl>
             * 
             * @type {Boolean}
             * @default false
             */
            replacePredefinedCssClass: false,
            
            /**
             * <p>Content Panel height in 'px'</p>
             * 
             * <p>This is required to support sliding in/out animation</p>
             * 
             * @type {String}
             * @default 120px
             */
            cpHeight: '200px',
            
            /**
             * <p>This widget's height<p>
             * <p>This is required to support widget show/hide animation</p>
             * @type String
             * @default 330px
             */
            height: '330px',
            
            title: 'Format Editor',
            
            onOK: function() {
                 mstrmojo.all.feModel._updateModel();
                 _saveModel(this);
             },
             
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
              * <P>Handle property 'show' change to slide in /out this editor</p>
              * @param {MojoEvent} evt
              * @return
              */
            onshowChange: function(evt) {
                var height = parseInt(this.height, 10),
                    start = this.show ? 0 : height,
                    stop = height - start,
                    me = this;
                
                //make overflow:hidden before sliding in/out
                this.editorNode.style.overflow = 'hidden';
                
                //slide in/out 
                //Note: after sliding in, need to set overflow:visible in order to display colorpicker in full
                slideProp(this.show, this.editorNode, 'height', start, stop, 
                            function(){
                                me.set('visible', me.show);
                                if (me.show) {
                                    me.editorNode.style.overflow = 'visible';
                                }
                            });
            },
        
            _initModel: function() {
                if (!mstrmojo.all.feModel) {
                    //setup model
                      var me = this;
                      mstrmojo.all.feModel = new mstrmojo.Model(
                      {
                          level1Index: 'header_format',
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
                              if (this.model.items.length > 0) {
                                  this._setCurrentFormat();
                              } else {
                                  return false
                              }
                          },
                          
                          //When switch level0/1 items, save currentFormat to corresponding model item's format property
                          _updateModel: function(level0Index, level1Index) {
                              level0Index = (typeof level0Index != 'undefined') ? level0Index : this.level0Index;
                              level1Index = level1Index || this.level1Index;
                              
                              var cf = mstrmojo.hash.copy(this.currentFormat);
                              var modelf = this.model.items[level0Index][level1Index] || {};
                              //if (!modelf) return;
                              
                              for (var ps in cf) {
                                  //Property set
                                  var cfps = cf[ps];
                                  
                                  if (!cfps.attachEventListener) {
                                      //not observalbe, just save it
                                      if (!_H.isEmpty(cfps)) {
                                          modelf[ps] = cfps;
                                      }
                                  }
                                  else { 
                                      //Observalbe, save only those defined in DefaultFormat
                                      for (var p in cfps) {
                                          if (_FD.DefaultFormat[ps][p]) {
                                              if (!modelf[ps]) {
                                                  modelf[ps]=  {};
                                              }
                                              modelf[ps][p] = cfps[p];
                                          }
                                      }
                                  }
                              }
                              this.model.items[level0Index].set(level1Index, modelf);
                              
                          },
                          
                          //For a currently selected level0/1 item, prepare its currentFormat
                          _setCurrentFormat: function() {
                              //this.set('currentFormat', mstrmojo.hash.copy(me.model.items[this.level0Index][this.level1Index], mstrmojo.hash.copy(_FD.DefaultFormat)));
                              
                              //make some property sets observable
                              var cf = mstrmojo.hash.copy(this.model.items[this.level0Index||0][this.level1Index]);
                              var df = mstrmojo.hash.clone(_FD.DefaultFormat);
//                              if (cf) {
//                                  for (var ps in df) {
//                                      if (cf[ps]) cf[ps] = mstrmojo.hash.copy(cf[ps], df[ps]);
//                                      else cf[ps] = df[ps];
//                                  }
//                              } else {
//                                  cf = df;
//                              }
//
                              //prepare current format - if it does not have certain property set, make an empty one.
                              cf = cf || {};
                              for (var ps in df) {
                                      cf[ps] = cf[ps] || {};
                              }
                                               
                              for (var ps in cf) {
                                  if (_observableSets[ps] && !cf[ps].attachEventListener) {
                                      cf[ps] = mstrmojo.hash.make(cf[ps], mstrmojo.Obj);
                                  }
                              }
                              
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
                var fem = mstrmojo.all.feModel;
                fem.level0Index = 0; //reset to point to first item if not set yet
                fem.set('model', mstrmojo.hash.clone(this.model));
                

                //set level0 index if provided in model
                var idx = fem.model.selectedIndex;
                fem.set('level0Index', (idx==-1 ? 0 : idx));
            },
            
            onClearFormat: function() {
                var fmts = mstrmojo.all.feModel.currentFormat;
                for (var ps in fmts) { //each level0
//                    var level0 = fmts[g];
//                    for (var c in level0) { //each level1
//                        fmts[g][c] = {};
//                    }
                    delete fmts[ps];
                }

                for (var i = 0; i < 4; i ++ ) {
                    var which = ['header_format', 'grid_format', 'child_header_format', 'child_grid_format'][i];
                    var fem = mstrmojo.all.feModel;
                    delete fem.model.items[fem.level0Index][which];                   
                }
                mstrmojo.all.feModel._setCurrentFormat();
            },
            
            /**
             * <p> flag to record the number of pulldown popup opened</p>
             * <p> This is for IE7 only. It seems that IE7 cannot repaint GUI correctly  if the FormatEditor is closed before the popup is closed by animation.
             *     This flag is used to set a timeout which is equal to the animation duration so to wait till popup is closed then close this FormatEditor.
             * </p>
             * @private
             * @ignore
             */
            _hasPop: 0,
            close: function() {
                var editor = this;
                window.setTimeout(function() {
                    if (editor.useAnimate) {
                        editor.set('show', false);
                    } else {
                        editor.set('visible', false);
                    }}, ((editor._hasPop > 0) && mstrmojo.dom.isIE7) ? _Duration: 0 //if there is some dropdown popup open, wait till it is closed.
                );
            },
            
            postBuildRendering: function(){
                if (this._super) {
                    this._super();
                }
                
                //set level0 index if provided in model
                var idx = mstrmojo.all.feModel.model.selectedIndex;
                mstrmojo.all.feModel.set('level0Index', (idx==-1 ? 0: idx));
            },
            
            preBuildRendering: function() {
                if (this._super) {
                    this._super();
                }
                
                this.addChildren(
                        [
                          _contentLayoutJson(),
                          {//ButtonBar
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
                                                         
                                                         if (editor.onCancel) {
                                                             editor.onCancel();
                                                         }
                                                     }, 
                                                     '#999', 
                                                     { alias: 'btnCancel',cssClass: 'mstrmojo-Editor-button'}
                                             )
                                        ]
                           }]
                  );
                
            }//end postCreate()
            
            
        }
    ); //end declare()
    
})();

