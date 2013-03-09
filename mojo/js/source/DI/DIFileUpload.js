/**
 * File Upload sub page for Data Import
 */
(function(){
    mstrmojo.requiresCls(
        "mstrmojo.Table",
        "mstrmojo.Box",
        "mstrmojo.Label",
        "mstrmojo.FileUploadBox",
        "mstrmojo.CheckBox"
    );

    mstrmojo.DI.DIFileUpload = mstrmojo.declare(
        mstrmojo.Table,
        null,
        {
            scriptClass: "mstrmojo.DI.DIFileUpload",
            cssClass: "mstrmojo-di-fu",
            model: null,

            layout: [
                 {cells: [{cssText: "height:25px", colSpan: 2}]},
                 {cells: [{cssText: "width: 70%;vertical-align: top"}, {cssText: "background-color: #E5E5E5;vertical-align: top"}]}
            ],
            children: [{
                // Title
                slot: '0,0',
                scriptClass: "mstrmojo.Label",
                cssClass: 'mstrmojo-di-sub-tb',
                text: '*File Upload*'
            },
            {
                // File upload 
                slot: '1,0',
                scriptClass: "mstrmojo.Table",
                cssClass: 'content',
                layout: [
                     {cells: [{}]},
                     {cells: [{}]},
                     {cells: [{}]},
                     {cells: [{}]},
                     {cells: [{}]},
                     {cells: [{}]}
                ],
                children: [{
                    slot: '0,0',
                    scriptClass: "mstrmojo.Box",
                    children: [{
                        scriptClass: "mstrmojo.Label",
                        cssClass: 'bigTxt',
                        text: 'Specify the location of the file you would like to upload'
                    }]
                },
                {
                    slot: '1,0',
                    scriptClass: "mstrmojo.RadioList",
                    cssClass: 'upload-tp',
                    alias: 'ultp',
                    selectedIndex: 0,
                    items: [{ 'did': '0', 'n': '*From My Compute/Network*'},
                            { 'did': '1', 'n': '*From the URL(http://...)*'}]
                },
                {
                    slot: '2,0',
                    scriptClass: "mstrmojo.FileUploadBox",
                    cssClass: 'upload-box',
                    alias: 'fuBox',
                    uploadTaskId: 'importFile'
                },
                {
                    slot: '3,0',
                    scriptClass: "mstrmojo.ImageCheckBox",
                    alias: 'showPrv',
                    label: '*show a preview of the data and display available transformation options for Excel spreadsheets*'
                },
                {
                    slot: '4,0',
                    scriptClass: "mstrmojo.Button",
                    cssClass: 'button',
                    cssText: 'float: right',
                    alias: 'nextBtn',
                    text: mstrmojo.desc(1059),
                    onclick: function() {
                        var fuBox = this.parent.fuBox,
                            showPrv = this.parent.showPrv,
                            m = this.parent.parent.model,
                            ps = {
                                taskContentType: 'json',
                                sessionState: mstrApp.sessionState,
                                fileType: 'application/octet-stream',
                                fileName: fuBox.fileNode.value
                            },
                            cb1 = {
                                success: function (res) {
                                    // get json format report data
                                    var prvFg = m.BTS.SOURCE | m.BTS.SHEETS | (showPrv.checked ? (m.BTS.DATA | m.BTS.MAPPING) : 0),
                                        shtIx = showPrv.checked ? 0 : -1,
                                        cb2 = {
                                            success: function(res) {
                                                if (res.datap) {
                                                    if (prvFg & m.BTS.DATA) {                                                       
                                                        m.populateDataset(res.datap.data);                                          
                                                    }
                                                    if (prvFg & m.BTS.MAPPING) {                                                        
                                                        m.populateMappings(res.datap.maps);                                          
                                                    }
                                                    m.set('srce', res.datap.srce);
                                                    m.set('shts', res.datap.shts);

                                                }
                                                
                                                if (showPrv.checked) {
                                                    m.set('curPg', 2);
                                                    m.set('curIx', 0);
                                                }
                                            },
                                            failure: function(res) {
                                                mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));                 
                                            }
                                        };
                                    
                                    m.set('msgid', res.content.msg_id);
                                    m.loadRptData(prvFg, shtIx, cb2);                                    
                                    
                                },
                                failure: function (res) {
                                    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                }
                            };
                        
                        // clear the current cube data before new upload
                        m.resetModelData();
                        
                        // file upload                       
                        fuBox.submit(ps, cb1);
    
                    }
                },
                {
                    slot: '5,0',
                    scriptClass: "mstrmojo.Table",
                    cssClass: 'sheets-panel',
                    layout: [
                         {cells: [{}, {}]},
                         {cells: [{colSpan: 2}]}
                    ],
                    bindings: {
                        visible: function() {
                            return this.parent.parent.model.shts != null;
                        }
                    },
                    
                    children: [{
                        slot: '0,0',   
                        scriptClass: "mstrmojo.Label",
                        text: '*Select sheet to import:*'
                    },
                    {
                        slot: '0,1',   
                        scriptClass: "mstrmojo.Pulldown",
                        alias: 'shtsPD',
                        
                        bindings: {
                            items: function() {
                                var shts = this.parent.parent.parent.model.shts,
                                    its = [];
                                if (shts) {
                                    for (var i = 0; i<shts.length; i++) {
                                        its.push({dssid: i, n: shts[i]});
                                    }
                                    return its;
                                }                                
                            },
                            value: function(){
                                var shts = this.parent.parent.parent.model.shts;
                                if (shts) {
                                    return 0;
                                } 
                            }
                        },
                        onvalueChange: function(evt) {
                            var m = this.parent.parent.parent.model;
                            if (evt.value || evt.value === 0) {
                                m.set('curIx', evt.value);
                            }                                                                                                                            
                        }
                        
                    },
                    {
                        slot: '1,0',  
                        scriptClass: "mstrmojo.Button",
                        cssClass: 'button',
                        cssText: 'float: right',
                        text: mstrmojo.desc(2397),  //OK
                        onclick: function() {
                            var m = this.parent.parent.parent.model;
                            
                            if (!m.cachedMaps[m.curIx]) {
                                //1. switch the sheet index
                                var cb1 = {
                                    success: function(res) {
                                        //2. load data for the new sheet
                                        m.set('msgid', res.msg_id);
                                        
                                        var cb2 = {
                                            success: function(res) {
                                                if (res.datap) {
                                                    m.populateMappings(res.datap.maps); 
                                                    m.set('curPg',3);
                                                }
                                            }
                                        };
                                        m.loadRptData(m.BTS.MAPPING, m.curIx, cb2); 
                                    }
                                };
                                
                                m.editCube(m.riid ? m.riid : null, m.curIx, null, cb1);
                            } else {
                                m.mappings = m.cachedMaps[m.curIx];
                                m.set('curPg',3);
                            }
                            
                        }
                    }]
                    
                }]
            },
            {
                // Tips
                slot: '1,1',
                scriptClass: "mstrmojo.Box",
                cssClass: 'tips',
                children: [{
                    scriptClass: "mstrmojo.Label",
                    cssClass: 'bigTxt',
                    text: '*Tips*'
                },{
                    scriptClass: "mstrmojo.Label",
                    cssText: 'margin: 10px 0',
                    text: '*Data can be uploaded from Excel or CSV text files.*'
                },{
                    scriptClass: "mstrmojo.Label",
                    cssText: 'margin: 10px 0',
                    text: '*Only one sheet from a workbook can be imported.*'
                },{
                    scriptClass: "mstrmojo.Label",
                    cssText: 'margin: 10px 0',
                    text: '*The preview shows the first 20 rows of data and provides the capability to add Column Headers to the data.*'
                }]
        }]
    });
})();
