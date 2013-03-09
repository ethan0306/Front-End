(function () {

    mstrmojo.requiresCls(
            "mstrmojo.ObjectBrowser",
            "mstrmojo.HBox");

    /************************Private methods*********************************/
    var updateFields = function (me) {
        var b = me.saveAsPage.boxes;
        b.namebox.name.set('value', me.name ? me.name : mstrmojo.desc(8113,"New Custom Group"));
        b.descbox.desc.set('value', me.desc);
    },

    initSaveAs = function (me) {
            if (!me.sainitialized) {
                me.sainitialized = true;
                //Init the ObjBrowser callbacks
                me.ob.onNewFolderCB = [me, 'onNewFolder'];
                me.ob.onSelectCB = [me, 'onOBSelect'];
                me.saveAsPage.parent = me;
                me.newFolderPage.parent = me;
                saveAsCB.parent = me;
                me.booklet.turnFwd(me.saveAsPage);
                me.ob.browse();
            }
            //Update the name and description fields
            updateFields(me);
        },
    
    //Save as callback methods
    saveAsCB = {
            success: function (res) {

                //#421412 - After saving a CG with the CG editor open, we should keep the name field populated with the current object name
                //then when clicking on 'Save' button, the CG should be just saved.
                var p = this.parent,
                    op = p && p.opener,
                    m = op && op.model;
                    n = p && p.name ? p.name : 'Custom group';
                if (m) {
                    m.set('did', res.did);  //update model with the id of the newly created Object
                    m.set('n', n); //update CG name
                }
                
                mstrmojo.confirm( '"'  + n + '" successfully saved', [
                mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, {  //Descriptor: OK
                    scriptClass: "mstrmojo.HTMLButton",
                    cssClass: 'mstrmojo-lightcharcoalbox',
                    cssText: 'width:72px;'
                })],"Object Saved");
                this.parent.ob._refresh();
                this.parent.close();
            },

            failure: function (res) {
                var ec = parseInt(res.getResponseHeader('X-MSTR-TaskErrorCode'), 10) + 0x100000000,
                	p = this.parent;
                if (ec == 2147749923) {
                        mstrmojo.confirm(mstrmojo.desc(7948).replace('#', this.parent.name), //Descriptor: The Custom Group '#' already exists. Do you want to replace the existing custom group? 
                        [mstrmojo.Button.newInteractiveButton(mstrmojo.desc(219), function(){p.saveAs(true);}, null, { //Descriptor: Yes
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: 'mstrmojo-lightcharcoalbox',
                            cssText: 'width:72px;'
                        }), mstrmojo.Button.newInteractiveButton(mstrmojo.desc(218), null, null, { //Descriptor: No
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: 'mstrmojo-lightcharcoalbox',
                            cssText: 'width:72px;'
                        })], mstrmojo.desc(3179)); //Descriptor: Confirm Overwrite
                    } else {
                        alert('Error while saving: ' + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                    }
            }
        };

    mstrmojo.CGESaveAs = mstrmojo.declare(
        // superclass
        mstrmojo.HBox,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.CGESaveAs",

            /************************CSSVariables*************************************/
            cssClass: "mstrmojo-PopupWalk",

            /************************Markup variables and methods*********************/



            /************************Instance variables*******************************/


            //SessionId if any, for testing
            sId: null,

            rootFolderID: null,

            rootFolderType: null,
            
            folderLinksContextId : null, 

            desc: '',

            name: '',

            children: [{
                scriptClass: "mstrmojo.ObjectBrowser",
                alias: 'ob',
                cssText: 'border-style:none solid none none;border-width:1px;border-color:#DDDDDD;',
                closeable: false,
                browsableTypes: '8,257',
                closeOnSelect: false,
                canCreateNewFolder: true,
                showCompletePath: false,
                useAnimate: false,
                bindings: {
                    rootFolderID: "this.parent.rootFolderID",
                    rootFolderType: "this.parent.rootFolderType",
                    folderLinksContextId : "this.parent.folderLinksContextId",
                    sId: "this.parent.sId"
                }
            },
            {
                scriptClass: "mstrmojo.Booklet",
                alias: 'booklet',
                cssText: 'height:200px;width:380px;'
            }],

            saveAsPage: mstrmojo.insert({
                scriptClass: "mstrmojo.VBox",
                cssText: 'height:185px;',
                children: [{
                    alias: 'boxes',
                    scriptClass: "mstrmojo.VBox",
                    cssText: 'height:175px',
                    children: [{
                        scriptClass: "mstrmojo.Label",
                        text: 'Save As',
                        cssText: "margin: 6px 10px 3px 10px; display: block; font-size: 13pt; font-weight: bold; color: #333333;"
                    },{
                        scriptClass: "mstrmojo.HBox",
                        alias: 'namebox',
                        children: [{
                            scriptClass: "mstrmojo.Label",
                            text: 'Name: ',
                            cssText: "margin: 6px 10px 3px 10px; display: block; width:80px; font-size: 10pt; font-weight: bold; color: #333333;"
                        },
                        {
                            scriptClass: "mstrmojo.TextBox",
                            alias: 'name',
                            cssText: "border:1px solid #DDDDDD;margin: 6px 10px 3px 10px; width:240px; display: block; font-size: 13pt; font-weight: bold; color: #333333;background-color:#fafafa;"
                        }]
                    },
                    {
                        scriptClass: "mstrmojo.HBox",
                        alias: 'descbox',
                        children: [{
                            scriptClass: "mstrmojo.Label",
                            text: 'Description: ',
                            cssText: "margin: 6px 10px 3px 10px; display: block; width:80px; font-size: 10pt; font-weight: bold; color: #333333;"
                        },
                        {
                            scriptClass: "mstrmojo.TextArea",
                            alias: 'desc',
                            cssText: "border:1px solid #DDDDDD;margin: 3px 10px 6px 10px; font-size: 9pt; width:240px; color:#555555;background-color:#fafafa;overflow:auto;",
                            rows: 5
                        }]
                    }]
                },
                {
                    scriptClass: "mstrmojo.HBox",
                    alias: 'btns',
                    cssText: 'float:right;margin-right:8px;vertical-align:bottom;border-collapse:separate;width:150px;',
                    children: [{
                        scriptClass: "mstrmojo.HTMLButton",
                        alias: 'ok',
                        text: 'Save',
                        cssClass: 'mstrmojo-lightcharcoalbox',
                        cssText: 'width:72px;margin-right:2px;',
                        onclick: function () {
                            this.parent.parent.parent.saveAs();
                        }
                    },
                    {
                        scriptClass: "mstrmojo.HTMLButton",
                        alias: 'cancel',
                        text: 'Cancel',
                        cssClass: 'mstrmojo-lightcharcoalbox',
                        cssText: 'width:72px;',
                        onclick: function () {
                            this.parent.parent.parent.close();
                        }
                    }]
                }]
            }),

            newFolderPage: mstrmojo.insert({
                scriptClass: "mstrmojo.VBox",
                cssText: 'height:185px;',
                children: [{
                    alias: 'boxes',
                    scriptClass: "mstrmojo.VBox",
                    cssText: 'height:175px',
                    children: [{
                        scriptClass: "mstrmojo.Label",
                        text: "",
                        cssText: "margin: 6px 10px 3px 10px; display: block; font-size: 13pt; font-weight: bold; color: #333333;"
                    },
                    {
                        scriptClass: "mstrmojo.HBox",
                        alias: 'namebox',
                        children: [{
                            scriptClass: "mstrmojo.Label",
                            text: 'Name: ',
                            cssText: "margin: 6px 10px 3px 10px; display: block; width:80px; font-size: 10pt; font-weight: bold; color: #333333;"
                        },
                        {
                            scriptClass: "mstrmojo.TextBox",
                            value : "",
                            alias: 'name',
                            cssText: "border:1px solid #DDDDDD;margin: 6px 10px 3px 10px; width:240px; display: block; font-size: 13pt; font-weight: bold; color: #333333;background-color:#fafafa;"
                        }]
                    },
                    {
                        scriptClass: "mstrmojo.HBox",
                        alias: 'descbox',
                        children: [{
                            scriptClass: "mstrmojo.Label",
                            text: 'Description: ',
                            cssText: "margin: 6px 10px 3px 10px; display: block; width:80px; font-size: 10pt; font-weight: bold; color: #333333;"
                        },
                        {
                            scriptClass: "mstrmojo.TextArea",
                            alias: 'desc',
                            cssText: "border:1px solid #DDDDDD;margin: 3px 10px 6px 10px; font-size: 9pt; width:240px; color:#555555;background-color:#fafafa;overflow:auto;",
                            rows: 5
                        }]
                    }]
                },
                {
                    scriptClass: "mstrmojo.HBox",
                    alias: 'btns',
                    cssText: 'float:right;margin-right:8px;vertical-align:bottom;border-collapse:separate;width:150px;',
                    children: [{
                        scriptClass: "mstrmojo.HTMLButton",
                        alias: 'ok',
                        text: 'Create',
                        cssClass: 'mstrmojo-lightcharcoalbox',
                        cssText: 'width:72px;margin-right:2px;',
                        onclick: function () {
                            this.parent.parent.parent.createFolder();
                        }
                    },
                    {
                        scriptClass: "mstrmojo.HTMLButton",
                        alias: 'cancel',
                        text: 'Cancel',
                        cssClass: 'mstrmojo-lightcharcoalbox',
                        cssText: 'width:72px;',
                        onclick: function () {
                            this.parent.parent.parent.cancelFolder();
                        }
                    }]
                }]
            }),

            /************************Instance methods*********************************/

            postBuildRendering: function () {
                if (this._super) {
                    this._super();
                }
                updateFields(this);
            },

            open: function (opener, params) {
                this.opener = opener;
                //Copy any parameters
                for (var x in params) {
                    this[x] = params[x];
                }
                initSaveAs(this);
                this.set('visible', true);
                if (!this.hasRendered) {
                    this.render();
                }
            },

            close: function () {
                var cb = this.closeCB;
                if(cb){
                    cb[0][cb[1]]();
                }
                this.set('visible', false);
            },

            onOBSelect: function (item) {
                this.name = item.n;
                updateFields(this);
            },

            saveAs: function (overwrite) {
                var bxs = this.saveAsPage.boxes;
                this.name = bxs.namebox.name.value;

                if(!this.name){
                    mstrmojo.confirm( mstrmojo.desc(8114), [
                                      mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, { //Descriptor: OK
                                          scriptClass: "mstrmojo.HTMLButton",
                                          cssClass: 'mstrmojo-lightcharcoalbox',
                                          cssText: 'width:72px;'
                                      })]);
                    return;
                }
                this.desc = bxs.descbox.desc.value;
                var cge = this.opener,
                    cgmodel = cge.model,
                    cgProps = cgmodel.cgp,
	                params = {
	                    taskId: 'saveCustomGroup',
	                    objectID: cgmodel.did || '',
	                    xml: cge.getXML(),
	                    folderID: this.ob.currentFolder.did,
	                    description: this.desc || '',
	                    name: this.name || '',
	                    saveAs: true,
	                    saveAsOverwrite: !! overwrite,
	                    aggregation: cgProps.agg,
	                    flatten: cgProps.flat,
	                    parentFirst: cgProps.pf,
	                    reportFilterInteraction: cgProps.rfi
	                };
                if (this.sId) {
                    params.sessionState = this.sId;
                }
                mstrmojo.xhr.request('POST', mstrConfig.taskURL, saveAsCB, params);
            },

            onNewFolder: function () {
                this.booklet.turnBack(this.newFolderPage);
                this.ob.set('enabled', false);
            },

            cancelFolder: function () {
                this.booklet.turnFwd(this.saveAsPage);
                this.ob.set('enabled', true);
            },

            createFolder: function () {
                var bxs = this.newFolderPage.boxes,
                    name = bxs.namebox.name.value,
                    desc = bxs.descbox.desc.value;
                this.ob.createFolder(name, desc, [this, "folderCreatedCB"]);
            },

            folderCreatedCB: function (res, ctxt) {
                this.booklet.turnFwd(this.saveAsPage);
                this.ob.set('enabled', true);
                var bxs = this.newFolderPage.boxes;
                bxs.namebox.name.set('value', '');
                bxs.descbox.desc.set('value', '');
            }

        }

        );

})();