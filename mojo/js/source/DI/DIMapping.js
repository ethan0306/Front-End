/**
 * Data preview sub page for Data Import
 */
(function(){
    mstrmojo.requiresCls(
        "mstrmojo.QB.Mappings",
        "mstrmojo._HasPopup",
        "mstrmojo.SaveAsEditor"
    );
    
    mstrmojo.DI.DIMapping = mstrmojo.declare(
        mstrmojo.Box,
        [mstrmojo._HasPopup],
        {
            scriptClass: "mstrmojo.DI.DIMapping",
            cssClass: 'mstrmojo-di-map',
            model: null,
            
            saveasRef: {
                scriptClass:"mstrmojo.SaveAsEditor",
                typeDesc: "Metric",
                browsableTypes: '776', //cube report
//                onObjectSaved: function(o){
//                    var p = this.opener,
//                    oi = p && p.coi;
//                    if (oi) {
//                        oi.name = o.name;
//                        oi.desc = o.desc;
//                    }
//                },
                saveAs: function (overwrite) {
                    var panel = this.contPanel;
                    this.name = panel.name.value;
                    this.desc = panel.desc.value;                
        
                    if(!this.name){
                        mstrmojo.confirm( mstrmojo.desc(8114), [
                                          mstrmojo.Button.newInteractiveButton('*enter a valid name*', null, null, { //Descriptor: OK
                                              scriptClass: "mstrmojo.HTMLButton",
                                              cssClass: 'mstrmojo-Editor-button',
                                              cssText: 'width:72px;'
                                          })]);
                        return;
                    }
                    
                    var params = this.saveParams || {};
                    params.folderID = this.ob.currentFolder.did;
                    params.objDesc = this.desc || '';
                    params.objName = this.name || '';
                    params.saveAsOverwrite = !! overwrite;
                    
                    var  cb = this.saveAsCallback();
                    cb.parent = this;
                    
                    mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, params);
                }
            },
            
            children: [{
                // Title bar
                scriptClass: "mstrmojo.Label",
                cssClass: 'mstrmojo-di-sub-tb',
                text: '*Column Mapping*'
            },
            {
                // Content
                scriptClass: 'mstrmojo.Box',
                alias: 'content',
                cssClass: 'content',
                children: [{
                    // Notes
                    scriptClass: "mstrmojo.Box",
                    children: [{
                        scriptClass: "mstrmojo.Label",
                        cssText: 'margin: 20px 0 40px 0',
                        text: '*MicroStrategy automatically maps all columns from the data source to attributes and metrics*'
                    }] 
                },
                {
                    // Mapping Cart
                    scriptClass: "mstrmojo.QB.Mappings",
                    alias: 'map',
                    cssClass: '',
                    
                    bindings: {
                        model: 'this.parent.model'
                    }
                },
                {
                    // ReEdit Panel 
                    scriptClass: "mstrmojo.Table",
                    cssClass: "edit-panel",
                    alias: 'editPanel',
                    
                    layout: [
                         {cssText: 'height:30px', cells: [{cssText: 'width:15%'}, {},{}]},
                         {cssText: 'height:30px', cells: [{cssText: 'width:15%'}, {},{}]},
                         {cssText: 'height:30px', cells: [{cssText: 'width:15%'}, {},{}]}
                    ],

                    children: [{
                       slot: '0,0',
                       scriptClass: "mstrmojo.Label",
                       cssText: 'padding-left: 10px',
                       text: mstrmojo.desc(3118) //File Name
                    },
                    {
                        slot: '1,0',
                        scriptClass: "mstrmojo.Label",
                        cssText: 'padding-left: 10px',
                        text: '*Sheet Name*' //Sheet Name
                    },
                    {
                        slot: '2,0',
                        scriptClass: "mstrmojo.Label",
                        cssText: 'padding-left: 10px',
                        text: mstrmojo.desc(3389) //Preview
                    },
                    {
                        slot: '0,1',
                        scriptClass: "mstrmojo.Label",
                        bindings: {
                            text: function() {
                                return this.parent.parent.model.srce.tbn;                                
                            }
                        }
                    },
                    {
                        slot: '1,1',
                        scriptClass: "mstrmojo.Label",
                        bindings: {
                            text: function() {
                                var curIx = this.parent.parent.model.curIx,   //trigger binding    
                                    shts = this.parent.parent.model.shts;
                                return shts[curIx];                         
                            }
                        }
                    },
                    {
                        slot: '0,2',
                        scriptClass: "mstrmojo.Button",
                        cssClass: "button",
                        text: mstrmojo.desc(1088),   //Edit
                        onclick: function() {
                            var m = this.parent.parent.model; 
                            m.set('curPg', 1); // go to file upload page
                        }
                    },
                    {
                        slot: '2,2',
                        scriptClass: "mstrmojo.Button",
                        cssClass: "button",
                        text: mstrmojo.desc(1088),   //Edit
                        onclick: function() {
                            var m = this.parent.parent.model; 
                            m.set('curPg', 2); // go to preview page
                        }
                    }]
                },
                {
                    scriptClass: "mstrmojo.Box",
                    cssText: 'width: 100%',
                    children : [{
                        scriptClass:  "mstrmojo.Button",
                        cssClass: "button",
                        cssText: 'float: right',
                        alias: 'pub',
                        text: mstrmojo.desc(172),   //Publish
                        onclick: function() {
                            // submit column and mapping changes
                        
                            // save and publish the cube
                            var p = this.parent.parent.parent,
                                m = p.model,
                                coi = m.coi; 
                            var params = {
                                    taskId: "saveAndPublishCube",
                                    msgID: p.model.msgid,
                                    sessionState: mstrApp.sessionState
                                },
                                callback = {
                                    success: function (res) {
                                        m.set('curPg', 4); //go to publish page      
                                        m.set('cid', res.objectId); //get the cube report id
                                        
                                        this.parent.close();
                                    },
                                    failure: function (res) {
                                        mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                    }
                                };
                            
                            p.openPopup('saveasRef',{
                                zIndex: 10, 
                                folderLinksContextId: 1, 
                                //name: me.name.text, 
                                saveParams: params,
                                saveAsCallback: function(){return callback;}
                            });
                        }
                    }]
                }],
                
                bindings: {
                    model: 'this.parent.model'
                }
            }],
                                               
            onvisibleChange: function (evt) {
                if (evt.value) {
                    this.content.map.populate();
                }
            }
    });
})();