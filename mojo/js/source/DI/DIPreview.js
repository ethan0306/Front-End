/**
 * Data preview sub page for Data Import
 */
(function(){
    mstrmojo.requiresCls(
        "mstrmojo.QBPreview"
    );
    
    mstrmojo.DI.DIPreview = mstrmojo.declare(
        mstrmojo.Box,
        null,
        {
            scriptClass: "mstrmojo.DI.DIPreview",
            cssClass: 'mstrmojo-di-pre',
            model: null,

            children: [{    // Title                                           
                scriptClass: "mstrmojo.Label",
                cssClass: 'mstrmojo-di-sub-tb',
                text: mstrmojo.desc(3389)
            },
            {   // Content
                scriptClass: "mstrmojo.Box",
                cssClass: 'content',   
                
                bindings: {
                    model: 'this.parent.model'
                },
                
                children: [{
                    scriptClass: "mstrmojo.HBox",
                    cssClass: '',
                    children: [{
                        scriptClass: "mstrmojo.ImageCheckBox",
                        alias: 'newCH',
                        label: '*Insert New Column Headers*'
                    },
                    {
                        scriptClass: "mstrmojo.HBox",
                        children: [{
                            scriptClass: "mstrmojo.Label",
                            text: '*Sheet Name:*'
                        },
                        {
                            scriptClass: "mstrmojo.Pulldown",
                            alias: 'preShtsPD',
                            
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
                                }
                            },
                            onitemsChange: function(evt) {
                                if (evt.value) {
                                    this.set('value', -1); //selector first item by default, make sure value changed
                                    this.set('value', 0); 
                                }
                            },
                            onvalueChange: function(evt) {
                                var m = this.parent.parent.parent.model;
                                if (this.selectedIndex || this.selectedIndex === 0) {
                                    m.set('curIx', this.selectedIndex);
                                    this._loadData();
                                }                                                                                                                        
                            },
                            _loadData: function _loadData() {
                                //load the data for selected sheet
                                var m = this.parent.parent.parent.model,
                                    preGrid = this.parent.parent.parent.preGrid;
                                    
                                                                                           
                                if (!m.cachedDatas[m.curIx] || !m.cachedMaps[m.curIx]) {
                                    //1. switch the sheet index
                                    var cb1 = {
                                        success: function(res) {
                                            //2. load data for the new sheet
                                            m.set('msgid', res.msg_id);
                                            
                                            var cb2 = {
                                                success: function(res) {
                                                    if (res.datap) {
                                                        m.populatePreview(res.datap.maps, res.datap.data); 
                                                        
                                                        preGrid.populatePreview();
                                                    }
                                                }
                                            };
                                            m.loadRptData(m.BTS.DATA | m.BTS.MAPPING, m.curIx, cb2); 
                                        }
                                    };
                                    
                                    m.editCube(m.riid ? m.riid : null, m.curIx, null, cb1);
                                } else {
                                    m.dataset = m.cachedDatas[m.curIx];
                                    m.mappings = m.cachedMaps[m.curIx];
                                    
                                    preGrid.populatePreview();
                                }
                            }
                        }]
                    }]
                },
                {
                    scriptClass: "mstrmojo.QBPreview",
                    alias: 'preGrid',
                    columns: [],
                    bindings: {
                        model: 'this.parent.model'
                    }                                            
                },
                {   //bottom button
                    scriptClass: "mstrmojo.Table",                                        
                    layout: [{cells: [{cssText: 'width: 70%'}, {cssText: 'width: 15%'}, {}]}],
                    children: [{
                        slot: '0,1',
                        scriptClass: "mstrmojo.Button",
                        cssClass: "button",
                        text: mstrmojo.desc(373),   //Back
                        onclick: function() {
                            var m = this.parent.parent.parent.model; 
                            m.set('curPg', 1); // go to file upload page
                        }
                    },
                    {
                        slot: '0,2',
                        scriptClass: "mstrmojo.Button",
                        cssClass: "button",
                        text: mstrmojo.desc(2917),   //Next
                        onclick: function() {
                            var m = this.parent.parent.parent.model; 
                            m.set('curPg', 3); // go to mapping
                        }
                    }]
                }]
                
            }]
            
                      
           
    });
})();