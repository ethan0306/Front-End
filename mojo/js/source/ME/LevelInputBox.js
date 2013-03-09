(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.Label",
            "mstrmojo.Pulldown",
            "mstrmojo.ObjectInputBox",
            "mstrmojo.ME.MetricDataService"
    );

    var E = mstrmojo.expr;
    
    mstrmojo.ME.LevelInputBox = mstrmojo.declare(
            // superclass
            mstrmojo.ObjectInputBox,
            // mixins
            null,
            { 
                cssClass: 'mstrmojo-ObjectInputBox level',
                
                browseItemVisible: true,

                folderLinksContextId : 16, 
                
                browsableTypes: [E.TP.FOLDER, E.TP.ATTR].join(','),

                item2textCss: function item2textCss(data){
                    return (this._super && this._super(data)) || 
                    {
                        12: 'a',
                        '-1': 'rl',
                        '-99': 'br'    //browse....
                    }[data.t] || '';//default is report level
                },
                getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                    mstrmojo.ME.MetricDataService.getAttributes(params, callbacks);
                },
                itemFunction: function(item, idx, w){
                    
                    //assign an internal id
                    item[w.itemIdField] = w.nextId();
                    
                    //initialize filtering and grouping
                    item.filtering = item.filtering || 1;
                    item.grouping = item.grouping || 1;
                    
                    var c = new mstrmojo.ME.LevelObjectItem({
                        parent:w,
                        itemField: w.itemField,
                        cssClass: w.item2textCss(item),
                        data: item
                    });
                    
                    //attach events
                    var evts = ['ItemEditBegin', 'ItemEditEnd', 'ItemDeletePrev', 'ItemDelete', 'ItemAdd', 'SuggestionOn', 'SuggestionOff'],
                        i, len;
                    for(i=0,len=evts.length;i<len;i++){
                        c.attachEventListener(evts[i], w.id, '_itemChangeHandler');
                    }              
                    return c;
                }
   });
 
    
    mstrmojo.ME.LevelObjectItem = mstrmojo.declare(
            mstrmojo.ObjectItem,
            [mstrmojo._HasPopup],
            {
                markupString: 
                    '<div id={@id} class="mstrmojo-ObjectItem" style="{@cssText}">' +
                      '<div class="mstrmojo-ObjectItem-displayNode"><span class="mstrmojo-ObjectItem-text {@cssClass}">{@text}</span>' + 
                          '<img class="mstrmojo-ObjectItem-opts" src="../images/1ptrans.gif" title="Level Options" onclick="mstrmojo.all[\'{@id}\'].options(arguments[0])"/>' +
                          '<img class="mstrmojo-ObjectItem-del" src="../images/1ptrans.gif" title="'+mstrmojo.desc(629,'Delete')+'" onclick="mstrmojo.all[\'{@id}\'].del(arguments[0])"/>' +
                      '</div>' + 
                      '<div class="mstrmojo-ObjectItem-editNode"><input type="text" class="mstrmojo-ObjectItem-input" mstrAttach:keyup,keydown/></div>' +
                    '</div>',
                
                optsRef: {
                    scriptClass: "mstrmojo.Editor",
                    title: "Level Options", 
                    cssText: "width: 450px;",
                    onOpen: function onOpen(){
                        var d = this.opener.data;
                        this.filterOption.set('value', d.filtering);
                        this.groupOption.set('value', d.grouping);
                    },
                    children: [{
                        scriptClass: 'mstrmojo.Label',
                        text: "Relationship with Report Filter: "
                    },{
                        scriptClass: 'mstrmojo.Pulldown',
                        alias:'filterOption', 
                        itemField:'n',
                        itemIdField: 'did',
                        items:[{n:"Standard - Metric calculates only for elements found in the filter",did:1},
                               {n:"Absolute - Raises the calculation to the selected level, if possible", did:2},
                               {n:"Ignore - Omit filtering criteria based on selected level and its related attributes", did:3},
                               {n:"None - Unspecified - the selected level and group components define the filter", did:4}                                
                               ]
                    },{
                        scriptClass: 'mstrmojo.Label',
                        text: "Metric Aggregations: "
                    },{                        
                        scriptClass: 'mstrmojo.Pulldown',
                        alias: 'groupOption',
                        itemField:'n',
                        itemIdField: 'did',                        
                        items:[{n:"Standard - Metric calculates at the selected level, if possible",did:1},
                               {n:"None - Exclude the selected level and children from the GROUP BY clause in the SQL", did: 2},
                               {n:"Beginning lookup - Use the first value of the lookup table",did:3},
                               {n:"Ending lookup - Use the last value of the lookup table", did: 4},
                               {n:"Beginning fact - Use the first value of the fact table",did:5},
                               {n:"Ending fact - Use the last value of the fact table", did: 6}                               
                               ]                            
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
                                          var e = this.parent.parent,
                                              o = e.opener;
                                          if(o.saveOnClose){
                                              o.saveOnClose(e.filterOption.value, e.groupOption.value);
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
                    }]
                }, 
                
                saveOnClose: function saveOnClose(fv, gv){
                    var d = this.data;
                    d.filtering = fv;
                    d.grouping = gv;
                },
                
                options: function options(){
                    this.openPopup('optsRef',{
                            title: '"' + this.data[this.itemField] + '"' + ' Level Options', 
                            zIndex: 40
                        });
                }
            });
    
            
})();