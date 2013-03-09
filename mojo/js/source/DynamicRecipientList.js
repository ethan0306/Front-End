(function(){
    mstrmojo.requiresCls(
            "mstrmojo.VBox",
            "mstrmojo.Table",
            "mstrmojo._HasPopup",
            "mstrmojo.HBox",
            "mstrmojo.Label",
            "mstrmojo.DataGrid",
            "mstrmojo.DynamicRecipientListDataService",
            "mstrmojo.DynamicRecipientEditor"
            );
    
    var _DS = mstrmojo.DynamicRecipientListDataService,
    _S = mstrmojo.string;
    
    mstrmojo.DynamicRecipientList = mstrmojo.declare(
            mstrmojo.Table,
            [mstrmojo._HasPopup],
            {
                scriptClass: "mstrmojo.DynamicRecipientList"
            }
    );
    
    mstrmojo.prefDRL = mstrmojo.insert({
            scriptClass: 'mstrmojo.DynamicRecipientList',
            id: "prefDRL",
            zIndex: 10,   
            placeholder: "preferenceDRL",
            cssClass: 'mstrmojo-drl mstrPanelPortrait',
            layout: [{cssClass: 'mstrPanelTitleBar', cells: [{}]},
                     {cells: [{}]},
                     {cells: [{}]}],
                     
           refreshData: function(){
                var me = this;
                _DS.getDynamicRecipientLists(null, {
                    success: function(res){
                        me.set('model', (res && res.ctl)? res.ctl : [{drlName: _S.htmlAngles('<' + 'No Dynamic Recipient List' + '>')}]);
                    },
                    failure: function(res){}
                });
           },
            postCreate: function(){
               this.refreshData();
            },
            
            children: [{//title bar
                slot: '0,0',
                scriptClass: 'mstrmojo.HBox',
                children: [{
                    scriptClass: 'mstrmojo.Label',
                    cssClass: 'mstrPanelTitle',
                    text: 'Dynamic Address Lists'
                }]
            }, {//panel content: recipient list 
                slot: '1,0',
                scriptClass: 'mstrmojo.DataGrid',
                alias: 'rlst',
                bindings:{
                    items: 'this.parent.model'
                },
                columns:[
                         { headerText: 'Address List Name', dataField: 'n',colCss: 'adNm'},
                         { headerText: 'Report Name', dataField: 'cntn', colCss: 'rptNm' },
                         { headerText: 'Project Name', dataField: 'pn', colCss: 'pjtNm' },
                         {
                             headerText: 'Actions', 
                             colCss: 'acts',
                             dataWidget: {
                                 scriptClass: 'mstrmojo.HBox',
                                 children: [{
                                     scriptClass: 'mstrmojo.Button',
                                     cssText: 'margin: 0px 3px',
                                     text: 'Edit',
                                     onclick: function(){
                                         var data = this.parent.data,
                                         list = this.parent.dataGrid.parent;
                                         _DS.getDynamicRecipientList({did: data.did}, {
                                             success: function(res){
                                                 list.openPopup('drlEditorRef', {zIndex: list.zIndex + 10, model: res});
                                             },
                                             failure: function(res){}
                                         });
                                     }
                                 }, {
                                     scriptClass: 'mstrmojo.Label',
                                     text: '/'
                                 }, {
                                     scriptClass: 'mstrmojo.Button',
                                     cssText: 'margin: 0px 3px',
                                     text: 'Delete',
                                     onclick: function(){
                                     var data = this.parent.data,
                                     list = this.parent.dataGrid.parent;
                                     _DS.deleteDynamicRecipientList({did: data.did}, {
                                         success: function(res){
                                             list.refreshData();
                                         },
                                         failure: function(res){}
                                     });
                                 }
                                 }]
                             }
                         }
                ]
            }, {//create new button
                slot: '2,0',
                scriptClass: 'mstrmojo.Button',
                cssText: 'margin:0px 0px 20px 20px;font-weight:bold',
                text: 'Add a new Dynamic Address List',
                onclick: function(){
                    this.parent.openPopup('drlEditorRef', {zIndex: this.parent.zIndex + 10, model: null});
                }
            }],
            
            drlEditorRef: {
                scriptClass: "mstrmojo.DynamicRecipientEditor",
                alias: "drlEditor",
                locksHover: true,
                cssText: 'width: 650px'
            }
    }).render();
})();