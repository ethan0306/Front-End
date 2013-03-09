(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.hash", 
            "mstrmojo.Container", 
            "mstrmojo._FormatDefinition",
            "mstrmojo.CheckBox");
    
    
    var _H = mstrmojo.hash,
    _FD = mstrmojo._FormatDefinition;
    
    /**
     * <p>Create Decimal Place TextBox</p>
     * @param {String} ps.modelBinding Required The model binding string
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
                    m: ps.modelBinding,
                    value: function() {
                            return this.m.DecimalPlaces || '2';
                        },
                    category: function() {
                        //when switching Category, we need update some default model data
                        var category = this.m.Category;
                        
                        //call onkeyup to update model
                        this.onkeyup();
                    }
                },
                onkeyup: function(evt) {
                    if (/^\d{1,2}$/.test(this.value)) {
                        var was = this.m.DecimalPlaces,
                            v = this.value;
                        this.m.DecimalPlaces = v;
                    
                        if (was != v && this.negative) {
                            
                            var negative = this.parent[this.negative],
                            itms;

                            if(negative && negative.refreshFormatList) {
                                negative.refreshFormatList();
                            } else {
                                itms = mstrmojo.hash.clone(_FD[this.negative]);
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
     * @param {String} ps.modelBinding Required The model binding string
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
                        m: ps.modelBinding,
                        selectedIndex: function(){
                            var idx = mstrmojo.array.find(this.items, 'v', this.m.NegativeNumbers);
                            if (idx === -1) {
                                 idx = mstrmojo.array.find(this.items, 'f', this.m.Format);
                            }
                            //force to re-select in order to get correct selectedItem.v after 'items' is re-built when decimalPlaces change
                            this.singleSelect(idx);
                            
                            return idx == -1 ? 3: idx;
                        },
                        category: function() {
                            //when switching Category, we need update some default model data
                            var category = this.m.Category;
                            
                            //call onkeyup to update model
                            this.onchange();
                        }
                    },
                    onchange: function(evt) {
                        if (this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', this.m.Category) && this.selectedItem) {
                            this.m.NegativeNumbers = this.selectedItem.v;
                            this.m.set('Format', this.selectedItem.f || this.selectedItem.v);
                        }
                    },
                    onmChange: function(evt){                        
                        if(this.m){
                            var d = this.m.DecimalPlaces;
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
                    },
                    postCreate: function() {
                        this.onmChange();
                    }
                }
        );
    },
    
    //Time, Date, Fraction
    /**
     * <p>create widget instance for Time/Date/Fraction</p>
     * 
     * @param {String} ps.modelBinding Required The model binding string
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
                                m: ps.modelBinding,
                                selectedIndex: function(evt){
                                    var idx = mstrmojo.array.find(this.items, 'v', this.m.Format);
                                    return idx===-1 ? 0 : idx;
                                },
                                category: function() {
                                    //when switching Category, we need update some default model data
                                    var category = this.m.Category;
                                    
                                    //call onchange to update model
                                    this.onchange();
                                }
                            },
                            onchange: function(evt) {
                                if (this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', this.m.Category)) {
                                    this.m.set('Format', this.selectedItem.f || this.selectedItem.v);
                                }
                            }
                       }
        );
    };
    
    
 mstrmojo.NumberFormatter = mstrmojo.declare (
            
            //superclass
            mstrmojo.Container,  
             
            //mixins
            null,
            
           {
               scriptClass: "mstrmojo.NumberFormatter",
                         
               cssClass: 'mstrmojo-NumberFormatter',
               
               markupString: '<div id={@id} class="{@cssClass}" style="{@cssText}"></div>',
               
               markupSlots: {
                   containerNode: function() { return this.domNode; }
               },
               
               markupMethods: {
                   onvisibleChange: function() { 
                         this.domNode.style.display = this.visible ? 'block' : 'none'; 
                   }
               },
               
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
                   layout: [{cells: [{colSpan:2}]}, 
                            {cells: [{}, {}]}],
                   children: [{
                       slot: '0,0',
                       scriptClass: 'mstrmojo.Label',
                       text: mstrmojo.desc(7940), //Descriptor: Category
                       cssClass: 'category',
                       cssText: 'font-weight: bold'
                 }, { //Number Category List
                     slot: '1,0',
                     scriptClass: 'mstrmojo.List',
                     alias: 'numberCategory',
                     cssClass: 'mstrmojo-FormatEditor-numberCategory',
                     items: _FD.Category,
                     selectionPolicy: 'reselect',
                     bindings: {
                       m: 'this.parent.parent.model',
                       selectedIndex: function() {
                           var cat = this.m.Category,
                               idx = mstrmojo.array.find(this.items, 'v', (cat==='pru' ? -2 : cat)); //if 'Category' equal 'pru', it means it is set from '-2' to 'pru' for later model saving processing
                                                                                                   //so we need change it back from 'pru' to '-2' in order to select correct panel.
                             return (idx == -1) ? 0 : idx; 
                       }
                     },
                     onchange: function(evt) {
                         if(this.m){
                             this.m.set('Category', this.selectedIndex===0 ? 'pru': this.selectedItem.v);
                         }
                     }
                 },{
                     slot: '1,1',
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
                                    children: [{
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: '&nbsp;',
                                                   slot: '0,0'                                               
                                    }],
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category=="pru"',
                                        category: function() {
                                            //when switching Category, we need update 'Format' to the selected value in newly selected Category;
                                            //And thus Custom Category can also update its display
                                            var m = this.parent.parent.parent.model,
                                            cat = this.parent.parent.parent.model.Category;
                                            if (m && this.idx == mstrmojo.array.find(_FD.Category, 'v', cat )) 
                                            {
                                                m.set('Format', '');
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
                                    children: [{
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: '&nbsp;',
                                                   slot: '0,0'
                                    }],
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category==9',
                                        category: function() {
                                            //when switching Category, we need update 'Format' to the selected value in newly selected Category;
                                            //And thus Custom Category can also update its display
                                            var m = this.parent.parent.parent.model,
                                            cat = this.parent.parent.parent.model.Category;
                                            if (m && this.idx == mstrmojo.array.find(_FD.Category, 'v', cat)) {
                                                m.set('Format', '');
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
                                    layout: [{ cells: [{},{}]},
                                             { cells: [{},{}]},
                                             { cells: [{colSpan: 2}]}],
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category==0'
                                    },
                                    children: [{
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2046), //Descriptor: Decimal places
                                                   slot: '0,0'
                                               },
                                               //DecimalPlaces
                                               createDecimalBox({
                                                   modelBinding: 'this.parent.parent.parent.parent.model',
                                                   negative: 'FixedNegative', 
                                                   alias: 'FixedDecimalPlaces',
                                                   slot: '0,1'
                                               }),{
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2044), //Descriptor:  Negative Numbers
                                                   slot: '1,0'
                                               },
                                               //NegativeNumbers
                                               createNegativeList({
                                                   modelBinding: 'this.parent.parent.parent.parent.model',
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
                                                       m: 'this.parent.parent.parent.parent.model',
                                                       checked: function() {
                                                           var ts = this.m.ThousandSeparator;
                                                           if(ts == null){
                                                               ts = -1;
                                                           }
                                                           return parseInt(ts, 10) !== 0;
                                                       }
                                                   },
                                                   oncheckedChange: function() {
                                                       //only update when current sub-panel is the selected one
                                                       if (this.m && this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', this.m.Category)) {
                                                           this.m.ThousandSeparator = this.checked ? -1 : 0;
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
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category==1'
                                    },
                                    children: [{
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2046), //Descriptor: Decimal places
                                                   slot: '0,0'
                                               },
                                               //DecimalPlaces
                                               createDecimalBox({
                                                   modelBinding: 'this.parent.parent.parent.parent.model',
                                                   negative: 'CurrencyNegative',
                                                   alias: 'currencyDecimal',
                                                   slot: '0,1'
                                               }), {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2047), //Descriptor: Currency Symbol
                                                   slot: '1,0'
                                               }, {//CurrencySymbol
                                                   scriptClass: 'mstrmojo.TextBox',
                                                   alias: 'currencySymbol',
                                                   maxLength: 5,
                                                   bindings: {
                                                       m: 'this.parent.parent.parent.parent.model',
                                                       value: function() {
                                                               return this.m.CurrencySymbol || mstrmojo.desc('2369'); //currency symbol '$';
                                                       },
                                                       category: function() {
                                                           //when switching Category, we need update some default model data
                                                           var category = this.m.Category;
                                                           
                                                           //call onkeyup to update model
                                                           this.onkeyup();
                                                       }
                                                   },
                                                   onkeyup: function(evt) {
                                                      this._update();
                                                   },
                                                   onvalueChange: function() {
                                                       this._update();
                                                   },
                                                   _update: function() {
                                                       if(this.m){
                                                           var was = this.m.CurrencySymbol;
                                                           this.m.CurrencySymbol = this.value;
                                                           
                                                           //update currency format list
                                                           var negative =  this.parent.CurrencyNegative;
                                                           if(negative && (was != this.value)){
                                                               negative.refreshFormatList();
                                                           } 
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
                                                       m: 'this.parent.parent.parent.parent.model',
                                                       selectedIndex: function(){
                                                           var idx = mstrmojo.array.find(_FD.CurrencyPosition, 'v', this.m.CurrencyPosition);
                                                           return (idx==-1 ? 0 : idx);
                                                       },
                                                       category: function() {
                                                           //when switching Category, we need update some default model data
                                                           var category = this.m.Category;
                                                           
                                                           //call onchange to update model
                                                           this.onchange();
                                                       }
                                                   },
                                                   onchange: function(evt) {
                                                       if(this.m){
                                                           this.m.CurrencyPosition = this.selectedItem.v;

                                                           var negative = this.parent.CurrencyNegative;
                                                           if (negative) {
                                                               negative.refreshFormatList();
                                                           }
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
                                                   modelBinding: 'this.parent.parent.parent.parent.model',
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
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category==2'
                                    },
                                    children: [{
                                           scriptClass: 'mstrmojo.Label',
                                           text: mstrmojo.desc(2869), //Descriptor: Formatting
                                           slot: '0,0'
                                       },
                                       createNumberFormatList({
                                           modelBinding: 'this.parent.parent.parent.parent.model',
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
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category==3'
                                    },
                                    children: [{
                                           scriptClass: 'mstrmojo.Label',
                                           text: mstrmojo.desc(2869), //Descriptor: Formatting
                                           slot: '0,0'
                                       },
                                       createNumberFormatList({
                                           modelBinding: 'this.parent.parent.parent.parent.model',
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
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category==4'
                                    },
                                    children: [
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2046), //Descriptor: Decimal places
                                                   slot: '0,0'
                                               },
                                               //DecimalPlaces
                                               createDecimalBox({
                                                   modelBinding: 'this.parent.parent.parent.parent.model',  
                                                   negative: 'PercentNegative',
                                                   slot: '0,1'}),
                                               {
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2044), //Descriptor: Negative numbers
                                                   slot: '1,0'
                                               },
                                               //NegativeNumbers
                                               createNegativeList({
                                                   modelBinding: 'this.parent.parent.parent.parent.model',
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
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category==5'
                                    },
                                    children: [{
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2869), //Descriptor: Formatting
                                                   slot: '0,0'
                                               },
                                               createNumberFormatList({
                                                   modelBinding: 'this.parent.parent.parent.parent.model',
                                                   items: _FD.Fraction,
                                                   alias: 'Fraction',
                                                   slot: '0,1'})
                                      ]
                                },
                                //Scientific
                                {
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item scientific',
                                    idx: 8, //subpanel index
                                    rows: 1,
                                    cols: 2,
                                    children: [{
                                                   scriptClass: 'mstrmojo.Label',
                                                   text: mstrmojo.desc(2046), //Descriptor: Decimal places
                                                   slot: '0,0'
                                               },
                                               //DecimalPlaces
                                               createDecimalBox({
                                                   slot: '0,1',
                                                   modelBinding: 'this.parent.parent.parent.parent.model'})
                                              ],
                                    bindings: {
                                        m: 'this.parent.parent.parent.model',
                                        visible: 'this.m.Category==6',
                                        category: function() {
                                            //when switching Category, we need update 'Format' to the selected value in newly selected Category;
                                            //And thus Custom Category can also update its display
                                            if (this.m && this.idx == mstrmojo.array.find(_FD.Category, 'v', this.m.Category)) 
                                            {
                                                this.m.set('Format', '0.00E+00');
                                            }
                                        }
                                    }
                                }, //end Scientific
                                //Custom
                                {
                                    scriptClass:'mstrmojo.Table',
                                    cssClass: 'mstrmojo-FormatEditor-numberPanel-subpanel-item custom',
                                    idx: 9, //subpanel index
                                    rows: 1,
                                    cols: 2,
                                    bindings: {
                                        visible: 'this.parent.parent.parent.model.Category==7'
                                    },
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
                                                       m: 'this.parent.parent.parent.parent.model',
                                                       value: function() {  
                                                           return this.m.Format;
                                                       }
                                                   },
                                                   onvalueChange: function() {
                                                       //only update when current sub-panel is the selected one
                                                       if (this.m && this.parent.idx == mstrmojo.array.find(_FD.Category, 'v', this.m.Category)) {
                                                           this.m.Format = this.value;
                                                       }
                                                   },
                                                   slot: '0,1'
                                               }
                                      ] 
                                }] //end Custom
                 }]
               }]
           }
       ); //end declare()
})();
