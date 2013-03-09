(function () {
    
    mstrmojo.requiresCls(
        "mstrmojo.Button",
        "mstrmojo.HTMLButton",
        "mstrmojo.Label",
        "mstrmojo.TextBox",
        "mstrmojo.TextArea",        
        "mstrmojo.Table",
        "mstrmojo.HBox",
        "mstrmojo.Editor",
        "mstrmojo.ObjectBrowser"
    );
    
    function _makeChildren(){
            //replace close button with a new folder button
            var nf =  {
                    alias: 'newFolder',
                    scriptClass: "mstrmojo.Button",
                    cssClass: 'mstrmojo-OBListItemIcon nf',
                    title: mstrmojo.desc(3245,"Create New Folder"), 
                    onclick: function () {
                        var e = this.parent.parent.parent;
                        e.openPopup('newFolder',{zIndex:e.zIndex + 10});
                    }
                },
                ch = mstrmojo.hash.clone(mstrmojo.ObjectBrowser.prototype.children);
                tc = ch[0].children;
            
            if(tc && tc.length>2){
                tc.splice(2,1,nf);
            }    
            
            return ch;
    }
    
    mstrmojo.SaveAsObjectBrowser = mstrmojo.declare(
            // superclass
            mstrmojo.ObjectBrowser,
            // mixins
            null,
            {
                scriptClass:"mstrmojo.SaveAsObjectBrowser",
                cssClass:"mstrmojo-SaveAs-OB",
                children: _makeChildren()
            }
    );
    
    var saveAsCB = {
            success: function (res) {
    	
                var p = this.parent;
                
                if(p.onObjectSaved){
                	p.onObjectSaved({name:p.name,did:res.did, desc:p.desc});
                }	
                
                mstrmojo.confirm(mstrmojo.desc(7987,"The ## '###' has been saved successfully.").replace('##',p.typeDesc || 'Object').replace('###', p.name), [
                mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, {  //Descriptor: OK
                    scriptClass: "mstrmojo.HTMLButton",
                    cssClass: 'mstrmojo-Editor-button',
                    cssText: 'width:72px;'
                })],mstrmojo.desc(7984,"Object Saved"));
                p.ob.refreshContent();
                p.close();
            },

            failure: function (res) {
                var ec = parseInt(res.getResponseHeader('X-MSTR-TaskErrorCode'), 10) + 0x100000000,
                    p = this.parent;
                if (ec == 2147749923) {
                        mstrmojo.confirm(mstrmojo.desc(7986,"The ## '###' already exists. Do you want to replace the existing one?").replace('##',p.typeDesc || 'Object').replace('###', p.name),  
                        [mstrmojo.Button.newInteractiveButton(mstrmojo.desc(219), function(){p.saveAs(true);}, null, { //Descriptor: Yes
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: 'mstrmojo-Editor-button',
                            cssText: 'width:72px;'
                        }), mstrmojo.Button.newInteractiveButton(mstrmojo.desc(218), null, null, { //Descriptor: No
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: 'mstrmojo-Editor-button',
                            cssText: 'width:72px;'
                        })], mstrmojo.desc(3179)); //Descriptor: Confirm Overwrite
                    } else {
                        alert(mstrmojo.desc(7985,'Error while saving: ') + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                    }
            }
        };

        
    mstrmojo.SaveAsEditor = mstrmojo.declare(
        // superclass
        mstrmojo.Editor,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.SaveAsEditor",

            cssClass: "mstrmojo-SaveAsEditor",
            
            title: mstrmojo.desc(3167, "Save As"),

            //SessionId if any, for testing
            sId: null,

            rootFolderID: null,

            rootFolderType: null,
            
            folderLinksContextId : null, 

            browsableTypes: null,
            
            desc: '',

            name: '',
            
            help: 'Save_As_dialog_box.htm',

            children: [
                {
                    scriptClass: "mstrmojo.Label",
                    text: mstrmojo.desc(3379,'To the folder:'),
                    cssText:"padding-bottom:6px;"
                },                
                {
                    scriptClass: "mstrmojo.SaveAsObjectBrowser",
                    alias: 'ob',
                    closeable: false,
                    closeOnSelect: false,
                    showCompletePath: true,
                    fishEyeVisible: false,
                    searchVisible: false,                  
                    bindings: {
                        rootFolderID: "this.parent.rootFolderID",
                        rootFolderType: "this.parent.rootFolderType",
                        folderLinksContextId : "this.parent.folderLinksContextId",
                        browsableTypes: "this.parent.browsableTypes",
                        sId: "this.parent.sId"
                    },
                    postCreate: function(){
                        //call back when an item is selected
                        this.onSelectCB = [this.parent, 'onOBSelect'];    
                    }
                },
                {
                    scriptClass:"mstrmojo.Table",
                    rows:2,
                    cols:2,
                    alias:'contPanel',
                    children:[
                      {
                          scriptClass: "mstrmojo.Label",
                          slot:'0,0',
                          text: mstrmojo.desc(2211,'Name:')
                      },
                      {
                          scriptClass: "mstrmojo.TextBox",
                          slot:'0,1',
                          value : mstrmojo.desc(8116,'New Folder'),
                          alias: 'name',
                          cssClass:'mstrmojo-SaveAsEditor-nameInput',
                          bindings:{
                              value: "this.parent.parent.name"
                          }
                      },
                      {
                          scriptClass: "mstrmojo.Label",
                          slot:'1,0',
                          text: mstrmojo.desc(1154,'Description:')
                      },
                      {
                          scriptClass: "mstrmojo.TextArea",
                          cssClass:'mstrmojo-SaveAsEditor-descInput',
                          slot:'1,1',
                          alias: 'desc',
                          bindings:{
                              value: "this.parent.parent.desc"
                          },                          
                          rows: 5
                      }]
                 },
                {
                    scriptClass: "mstrmojo.HBox",
                    slot: 'buttonNode',
                    cssClass:"mstrmojo-Editor-buttonBar",                  
                    children: [
                       {
                           scriptClass: "mstrmojo.HTMLButton",
                           alias: 'ok',
                           text: mstrmojo.desc(1442,'OK'),
                           cssClass: 'mstrmojo-Editor-button',
                           onclick: function () {
                               this.parent.parent.saveAs();
                           }
                       },                               
                    {
                        scriptClass: "mstrmojo.HTMLButton",
                        alias: 'cancel',
                        text: mstrmojo.desc(221,'Cancel'),              
                        cssClass: 'mstrmojo-Editor-button',
                        onclick: function () {
                            this.parent.parent.close();
                        }
                    }            
                    ]
                }],

            
            newFolder: {
                scriptClass:"mstrmojo.NewFolderEditor"
            },

            onOpen: function () {
                this.ob.browse();           
            },


            onOBSelect: function (item) {
                this.set('name', item.n);
            },

            saveAsCallback: function saveAsCallback(){
                return saveAsCB;
            },
            
            saveAs: function (overwrite) {
                var panel = this.contPanel;
                this.name = panel.name.value;
                this.desc = panel.desc.value;                

                if(!this.name){
                    mstrmojo.confirm( mstrmojo.desc(8114), [
                                      mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, { //Descriptor: OK
                                          scriptClass: "mstrmojo.HTMLButton",
                                          cssClass: 'mstrmojo-Editor-button',
                                          cssText: 'width:72px;'
                                      })]);
                    return;
                }
                
                var params = this.saveParams || {};
                params.folderID = this.ob.currentFolder.did;
                params.description = this.desc || '';
                params.name = this.name || '';
                params.saveAsOverwrite = !! overwrite;
                if (this.sId) {
                    params.sessionState = this.sId;
                }
                
                var  cb = this.saveAsCallback();
                cb.parent = this;
                
                mstrmojo.xhr.request('POST', mstrConfig.taskURL, cb, params);
            },


            createFolder: function (name, desc) {
                if(!name){
                    mstrmojo.confirm( mstrmojo.desc(3380), [
                                      mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, { //Descriptor: OK
                                          scriptClass: "mstrmojo.HTMLButton",
                                          cssClass: 'mstrmojo-Editor-button',
                                          cssText: 'width:72px;'
                                      })]);
                    return -1;
                }
                var nf = this.newFolder,
                    ob = this.ob,
                    dp = ob && ob.dataProvider,
                    fid = ob && ob.currentFolder.did,
                    cb = {
                        success: function (res) {
                            ob.refreshContent();
                            nf.contPanel.name.set('value', '');
                            nf.contPanel.desc.set('value', '');                            
                        },
                    
                        failure: function (res) {
                            window.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                        }
                    }; 
                dp.newFolder(fid, name, desc, cb);  
            }

        }

    );

    mstrmojo.SaveAsEditor.SAVEAS_CALLBACK = saveAsCB;

    mstrmojo.NewFolderEditor = mstrmojo.declare(
            // superclass
            mstrmojo.Editor,
            // mixins
            null,
            {
                scriptClass: "mstrmojo.NewFolderEditor",
                cssClass: "mstrmojo-NewFolderEditor",
                title: mstrmojo.desc(663,"Create Folder"),
                help: "Create_a_new_folder.htm",

                children: [
                       {
                           scriptClass:"mstrmojo.Table",
                           rows:2,
                           cols:2,
                           alias:'contPanel',
                           children:[
                             {
                                 scriptClass: "mstrmojo.Label",
                                 slot:'0,0',
                                 text: mstrmojo.desc(2211,'Name:')
                             },
                             {
                                 scriptClass: "mstrmojo.TextBox",
                                 slot:'0,1',
                                 value : mstrmojo.desc(8116,'New Folder'),
                                 alias: 'name',
                                 cssClass:'mstrmojo-SaveAsEditor-nameInput'
                             },
                             {
                                 scriptClass: "mstrmojo.Label",
                                 slot:'1,0',
                                 text: mstrmojo.desc(1154,'Description:')
                             },
                             {
                                 scriptClass: "mstrmojo.TextArea",
                                 cssClass:'mstrmojo-SaveAsEditor-descInput',
                                 slot:'1,1',
                                 alias: 'desc',
                                 rows: 5
                             }]
                        },
                       {
                        scriptClass: "mstrmojo.HBox",
                        alias: 'btns',
                        slot: 'buttonNode',
                        cssClass:"mstrmojo-Editor-buttonBar",
                        children: [{
                            scriptClass: "mstrmojo.HTMLButton",
                            alias: 'ok',
                            text: mstrmojo.desc(1442,'OK'),
                            cssClass: 'mstrmojo-Editor-button',
                            onclick: function () {
                                var e = this.parent.parent,
                                    o = e && e.opener,
                                    name = e.contPanel.name.value,
                                    desc = e.contPanel.desc.value;
                                if(o.createFolder(name, desc) != -1){
                                    e.close();
                                }
                            }
                        },
                        {
                            scriptClass: "mstrmojo.HTMLButton",
                            alias: 'cancel',
                            text: mstrmojo.desc(221,'Cancel'),
                            cssClass: 'mstrmojo-Editor-button',
                            onclick: function () {
                                this.parent.parent.close();
                            }
                        }]
                     }]
                           
            }
    );
    
})();