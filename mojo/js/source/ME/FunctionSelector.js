(function () {

    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.Editor",
            "mstrmojo.SearchWidget",           
            "mstrmojo.SaveAsEditor"
            );

    var _SI = {n: "Search Result", did: -1, fns: []};
    
    mstrmojo.ME.FunctionSelector = mstrmojo.declare(
            // superclass
            mstrmojo.Editor,
            // mixins
            null,
            // instance members
            {
                scriptClass: "mstrmojo.ME.FunctionSelector",

                cssClass: "mstrmojo-FunctionSelector",   
                
                title: 'Select a Function',
                
                functions: null,
                
                selectedCategory: 1, 
                
                selectedIndex: 0,
                
                getFunctionSyntax: function(sc, si){
                    var fcts = this.functions;
                    if(!fcts){
                        return '';
                    }
                    var f = fcts[sc].fns[si],
                        pars = f.pars,
                        sa = [],
                        i, len;
                    sa.push(f.n);
                    sa.push('(');
                    for(i=0,len=pars.length;i<len;i++){
                        sa.push(pars[i].n);
                        if(i !== (len-1)){
                            sa.push(', ');
                        }
                    }
                    sa.push(')');
                    return sa.join('');
                },
                
                getFunctionDesc: function(sc, si){
                    var fcts = this.functions;
                    if(!fcts){
                        return '';
                    }
                    var f = fcts[sc].fns[si];
                    return f.desc; 
                }, 
                
                onOpen: function(){
                    this.selectedCategory = 1;
                    this.set('selectedCategory', 0);
                },
                
                onClose: function(){
                    this.searchWidget.clearSearch();
                },
                
                clearSearchResult: function(){
                    var fcp = this.fcHBox.fcPulldown,
                        fcts = this.functions,
                        li = fcts.length -1;

                    //remove search result and refresh
                    if(fcts[li] === _SI){
                        if(this.selectedCategory === li){
                            this.set('selectedCategory', 0);
                            this.set('selectedIndex', 0);
                        }
                        fcts.remove(li);
                        fcp.refresh();
                    }
                },
                
                children: [
                           {
                               scriptClass: "mstrmojo.Label",
                               cssText:'margin: 5px 0px;',
                               text: "Search for a function:"
                           },
                           {
                               scriptClass: "mstrmojo.SearchWidget",
                               alias: 'searchWidget',
                               cssText:'margin-bottom: 5px;',
                               quickSearch: true,
                               onsearch: function(t){
                                   var p = this.parent,
                                       fl = p.functionList,
                                       fcp = p.fcHBox.fcPulldown,
                                       fcts = p.functions,
                                       f = function(it){
                                           return (new RegExp(t,'i')).test(it.n);
                                           //return it['n'].indexOf(t) > -1;
                                       },
                                       its = [],
                                       i, len;
                                   
                                   //populate with new results
                                   for(i=0,len=fcts.length;i<len;i++){
                                       if(fcts[i] === _SI){
                                            continue;
                                       }
                                       its = its.concat(mstrmojo.array.filter(fcts[i].fns, f));
                                   }
                                   _SI.fns = its;
                                   
                                   //update category pulldown
                                   if(fcts[fcts.length-1] !== _SI){
                                       fcts.add([_SI]);
                                   }
                                   fcp.refresh();
                                   p.set('selectedCategory', 0);
                                   p.set('selectedCategory', fcts.length-1);
                                   p.set('selectedIndex', 0);
                               },
                               onclear: function(t){
                                   this.parent.clearSearchResult();
                               }
                           },
                           {
                               scriptClass: "mstrmojo.HBox",
                               alias: 'fcHBox', 
                               cssText:'margin-bottom: 5px;',
                               children:[
                                         {
                                             scriptClass: "mstrmojo.Label",
                                             text: "Or select a category:"
                                         },
                                         {
                                             scriptClass: "mstrmojo.Pulldown",
                                             alias: 'fcPulldown', 
                                             itemIdField: 'did',
                                             itemField: 'n',
                                             items: [],
                                             bindings: {
                                                items: "this.parent.parent.functions",
                                                selectedIndex: "this.parent.parent.selectedCategory",
                                                value: function(){
                                                    var sc = this.parent.parent.selectedCategory;
                                                    return this.items[sc][this.itemIdField];
                                                }
                                             },
                                             onvalueChange: function(){
                                                 var fe = this.parent.parent;
                                                 //fe.functionList.set('items', this.items[this.selectedIndex].fns);
                                                 fe.set('selectedCategory', this.selectedIndex);
                                                 fe.set('selectedIndex', 0);
                                             }
                                         }
                                         ]
                           },                           
                           {
                               scriptClass: "mstrmojo.Label",
                               cssText:'margin-bottom: 5px;',
                               text: "Select a function:"
                           },
                           {    
                               scriptClass: "mstrmojo.List",
                               alias: 'functionList',
                               itemIdField: 'dssid',
                               itemField: 'n',  
                               cssClass: 'mstrmojo-FE-functionList',
                               itemMarkupFunction: function(data, idx, w){
                                   return '<div class="mstrmojo-suggest-text">' + data[w.itemField] + '</div>';
                               },                               
                               bindings: {
                                   items: function(){
                                       var fcts = this.parent.functions,
                                           sc = this.parent.selectedCategory;
                                       return fcts[sc].fns;
                                   },
                                   selectedIndex: "this.parent.selectedIndex"
                               },     
                               onchange: function(evt){
                                   this.parent.set('selectedIndex', this.selectedIndex);
                               }
                           },
/*                           {
                               scriptClass: "mstrmojo.Label",
                               cssClass: 'mstrmojo-FE-functionSyntax',
                               bindings: {
                                   text: function(){
                                       var p = this.parent,
                                           sc = this.parent.selectedCategory,
                                           si = this.parent.selectedIndex;
                                       return p.getFunctionSyntax(sc, si);
                                   }
                               }
                           },*/
                           {
                               scriptClass: "mstrmojo.Label",
                               cssClass: 'mstrmojo-FE-functionDesc',
                               bindings: {
                                   text: function(){
                                       var p = this.parent,
                                           sc = this.parent.selectedCategory,
                                           si = this.parent.selectedIndex;
                                       return p.getFunctionDesc(sc, si);
                                   }
                               }                               
                           },
                           {
                               scriptClass: 'mstrmojo.HBox',
                               slot:"buttonNode",
                               cssText: "float:right;margin: 5px 0px;",
                               children:[
                                         {
                                             scriptClass: "mstrmojo.HTMLButton",
                                             cssClass: "mstrmojo-Editor-button",
                                             text: "OK",
                                             onclick : function(){
                                                 var fie = this.parent.parent,
                                                     fl = fie.functionList;
                                                 fie.openWizard(fl.items[fl.selectedIndex]);
                                                 fie.close();
                                             }
                                         },
                                         {
                                             scriptClass: "mstrmojo.HTMLButton",
                                             cssClass: "mstrmojo-Editor-button",
                                             text: mstrmojo.desc(221,"Cancel"),
                                             onclick: function(){
                                                 var me = this.parent.parent;
                                                 me.close();
                                             }
                                         }
                                         ]
                           }
                           ]
                           
            }
     );
})();