(function(){
    mstrmojo.requiresCls(
            "mstrmojo.hash",
            "mstrmojo.dom",
            "mstrmojo.css",
            "mstrmojo.color",
            "mstrmojo.mobileConfigUtil",
            "mstrmojo.WidgetTileList",
            "mstrmojo.ColorPicker",
            "mstrmojo.ButtonPreview",
            "mstrmojo.ipadHomescreen_tab");

    var util = mstrmojo.mobileConfigUtil,
        _H = mstrmojo.hash,
        isIphone = "mstrmojo.all.iphoneHomescreen_tab.model.data.dt == 1";
    
    // TODO: hashtable
    var getLayout = function(c) {
        return (c<=4)?{rc: 4, cc: 1}:((c<=6)?{rc: 3, cc: 2}:{rc: 3, cc: 3});
    };
    
    var defaultIcons = {};
    defaultIcons[util.ACT_FAVOURITES] = "../javascript/mojo/css/images/favorites.png";
    defaultIcons[util.ACT_SETTINGS] = "../javascript/mojo/css/images/settings.png";
    defaultIcons[util.ACT_SHAREDLIBRARY] = "../javascript/mojo/css/images/shared_library.png";
    defaultIcons[util.ACT_HELP] = "../javascript/mojo/css/images/help.png";
    defaultIcons[util.ACT_BROWSEFOLDER] = "../javascript/mojo/css/images/folder_hs.png";
    defaultIcons[util.ACT_RUNREPORT] = {"graph": "../javascript/mojo/css/images/graph_hs.png",
                                        "doc": "../javascript/mojo/css/images/document_hs.png",
                                        "default": "../javascript/mojo/css/images/grid_hs.png"};

    mstrmojo.iphoneHomescreen_tab = mstrmojo.insert({
        scriptClass: "mstrmojo.VBox",
        id: "iphoneHomescreen_tab",
        n: mstrmojo.desc(7769),      //"Home Screen"
        model: null
    });
    
    var iphoneHomescreen_tab = mstrmojo.iphoneHomescreen_tab;
    
    var buttonTileList = mstrmojo.insert({
        id: "buttonTileList",
        scriptClass: "mstrmojo.WidgetTileList",
        cssClass: "iphoneTileList",
        usePaging: true,
        makeObservable: true,
        listSelector: mstrmojo.ListSelector,
        renderOnScroll: false,
        bindings:{
            fillColor: function(){
                if (mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.tp === mstrmojo.mobileConfigUtil.BACKGROUND_FILL){
                    if (mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.fll.tp === mstrmojo.mobileConfigUtil.FILL_SOLID){
                        return mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.fll.clr;
                    }
                }
            },
            items: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.btns",
            layout: "{row: mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btnl.rc, col: mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btnl.cc}"
        },
        markupMethods: _H.copy(mstrmojo.WidgetTileList.prototype.markupMethods, {
            onfillColorChange: function(){
                if (this.fillColor !== undefined){
                    this.domNode.style.cssText = "background-color:" + mstrmojo.color.decodeColor(this.fillColor);
                }else{
                    this.domNode.style.cssText = "background-Color: transparent";
                }
            }
        }),
        itemFunction: function(btn, idx, widget) {
            var iconV =  new mstrmojo.ButtonPreview({
                 bindings:{
                     fillColor: "mstrmojo.color.decodeColor(mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.fll.clr)",
                     style: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.stl",
                     border: "mstrmojo.color.decodeColor(mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.brd.clr)",
                     fontColor: "mstrmojo.color.decodeColor(mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.fnt.clr)"
                 },
                 updateCaption: function(evt){
                     var s = btn.cap.txt;
                     this.set("caption", s);
                 },
                 updateIcon: function(evt){
                     var icon;
                     if (btn.icn.tp === mstrmojo.mobileConfigUtil.ICON_DEFAULT){
                         if (btn.act.tp === mstrmojo.mobileConfigUtil.ACT_RUNREPORT){
                             var rsType = "default";
                             if (btn.act.rs && btn.act.rs.oi.t===55){
                                 rsType = "doc";
                             }else if (btn.act.rs && btn.act.rs.oi.t===3 && btn.act.rs.oi.st===769){
                                 rsType = "graph";
                             }
                             icon = defaultIcons[btn.act.tp][rsType];
                         }else{
                             icon = defaultIcons[btn.act.tp];
                         }
                     }else if (btn.icn.tp === mstrmojo.mobileConfigUtil.ICON_IMAGE){
                         icon = btn.icn.img && btn.icn.img.src;
                     }
                     this.set("icon", icon);
                 },
                 onactionChange: function(evt){
                     var cap, 
                         desc,
                         actType = btn.act.tp;
                     
                     switch (actType){
                     case util.ACT_FAVOURITES: cap = mstrmojo.desc(7830);desc = mstrmojo.desc(7860); break;
                     case util.ACT_SETTINGS: cap = mstrmojo.desc(7831); desc = mstrmojo.desc(7861); break;
                     case util.ACT_SHAREDLIBRARY: cap = mstrmojo.desc(7832); desc = mstrmojo.desc(7859); break;
                     case util.ACT_HELP: cap = mstrmojo.desc(1143); desc = mstrmojo.desc(7862); break;
                     case util.ACT_BROWSEFOLDER: desc = mstrmojo.desc(7813); break;
                     case util.ACT_RUNREPORT: desc = mstrmojo.desc(7812); break;
                     }
                     
                     if (actType == util.ACT_BROWSEFOLDER){
                         cap = btn.act.fd && btn.act.fd.oi && btn.act.fd.oi.n;
                     }else if (actType == util.ACT_RUNREPORT){
                         cap = btn.act.rs && btn.act.rs.oi && btn.act.rs.oi.n;
                     }
                     
                     btn.cap.set("txt", cap);
                     btn.dsc.set("txt", desc);
                     this.updateIcon();
                 }
             });
             iconV.updateCaption();
             iconV.updateIcon();
             if (btn.icn.img === undefined){
                 btn.icn.img = new mstrmojo.Obj({src:''});
             }
             btn.cap.attachEventListener("txtChange", iconV.id, "updateCaption");
             btn.icn.img.attachEventListener("srcChange", iconV.id, "updateIcon");
             btn.icn.attachEventListener("tpChange", iconV.id, "updateIcon");
             btn.act.attachEventListener("tpChange", iconV.id, "onactionChange");
             btn.act.attachEventListener("rsChange", iconV.id, "onactionChange");
             btn.act.attachEventListener("fdChange", iconV.id, "onactionChange");
             return iconV;
        },
        onadd: function() {
            this.updateLayout();
        },
        onremove: function() {
            this.updateLayout();
        },
        updateLayout: function(){
            var ly = getLayout(this.items.length);
            if (!_H.equals(iphoneHomescreen_tab.model.data.hsc.cst.fmt.btnl, ly)){
                iphoneHomescreen_tab.model.data.hsc.cst.fmt.set("btnl", ly);
            }
        },
        onchange: function(){
            buttonsSettings.children[0].selector.set("selectedIndex", 1); // switch to action settings
        }
    });
    
    function _createValidationTextBox(prop){
        return _H.copy(prop,
        {
            scriptClass: "mstrmojo.ValidationTextBox", 
            dtp: mstrmojo.expr.DTP.VARCHAR,
            constraints: {trigger:mstrmojo.validation.TRIGGER.ALL},
            required:true,
            onenabledChange: function(){
                this.required = this.enabled;
                this.validate();
            },
            onValid: function(){
                if (iphoneHomescreen_tab.model){
                    if (this.enabled && this.value != null){
                        this.updateModel();
                    }
                    iphoneHomescreen_tab.model.validate();
                }
            },
            onInvalid: function(){
                if (iphoneHomescreen_tab.model){
                    this.invalidateModel();
                    iphoneHomescreen_tab.model.set("validFlag", false);
                }
            },
            updateModel: function(value){}, //override this to update the value on the model
            invalidateModel: function(value){} //override this to in-validate the model
        });
    }
    
    var backgroundSetting = mstrmojo.insert({
        id: "background",
        n: mstrmojo.desc(3905),    //"Background"
        scriptClass: "mstrmojo.VBox",
        children:[
            {
                scriptClass: "mstrmojo.HBox",
                children:[
                    {
                        scriptClass: "mstrmojo.RadioButton",
                        label: mstrmojo.desc(7993),      //"Fill Color:"
                        name: "bgType",
                        value: util.BACKGROUND_FILL,
                        cssClass: "iphoneSetting-radioButton",
                        bindings:{
                            checked: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.tp === this.value"
                        },
                        onclick: function(){
                            var bkg = iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg; 
                            bkg.set("tp", this.value);
                            if (bkg.fll === undefined){
                                bkg.set("fll", new mstrmojo.Obj());
                            }
                        }
                    },
                    mstrmojo.ColorPicker.createDropDown({
                        showUserPalette: false,
                        useAnimate: false,
                        bindings:{
                            enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.tp === mstrmojo.mobileConfigUtil.BACKGROUND_FILL",
                            fillColor: function(){
                                if (mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.fll.tp === mstrmojo.mobileConfigUtil.FILL_SOLID){
                                    return mstrmojo.color.decodeColor(mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.fll.clr);
                                }
                            }
                        },
                        cssText: "margin-left:10px",
                        onfillColorChange: function(evt){
                            if (this.fillColor){
                                iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.fll.set("clr", mstrmojo.color.encodeColor(this.fillColor));
                                iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.fll.set("tp", util.FILL_SOLID);
                            }
                        }
                    })
                ]
            },
            {
                scriptClass: "mstrmojo.RadioButton",
                label: mstrmojo.desc(2922),    //"Image"
                name: "bgType",
                value: 2,
                cssClass: "iphoneSetting-radioButton",
                cssDisplay: "block",
                bindings:{
                    checked: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.tp === mstrmojo.mobileConfigUtil.BACKGROUND_IMAGE"
                },
                onclick: function(){
                    var bkg = iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg;
                    if (bkg.img === undefined){
                        bkg.set("img", new mstrmojo.Obj({src:""}));
                    }
                    bkg.set("tp", util.BACKGROUND_IMAGE);
                }
            },
            {
                scriptClass: "mstrmojo.HBox",
                cssText: "margin-left: 30px",
                children:[
                    {
                        scriptClass: "mstrmojo.Label",
                        cssText: "width: 70px",
                        text: mstrmojo.desc(7801)      //"Image URL:"
                    },
                    _createValidationTextBox({
                        cssText: "margin-left: 5px; width:250px",
                        bindings: {
                            value: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.img.src",
                            enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_CUSTOM && mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.tp === mstrmojo.mobileConfigUtil.BACKGROUND_IMAGE"
                        },
                        constraints: {
                            trigger:mstrmojo.validation.TRIGGER.ALL,
                            validator: function(v){
                                if (this.required && !(/^(https|http)\:\/\//i.test(v))){
                                    return {code: mstrmojo.validation.STATUSCODE.INVALID, msg: ''};
                                }
                                return {code: mstrmojo.validation.STATUSCODE.VALID, msg:''};
                            }
                        },
                        updateModel: function(){
                            if (iphoneHomescreen_tab.model){
                                iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.img.set("src", this.value);
                            }
                        },
                        invalidateModel: function(){
                            if (iphoneHomescreen_tab.model){
                                delete iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.img.src;
                            }
                        }
                    }),
                    {
                        scriptClass: "mstrmojo.Label",
                        cssText: "margin-left:5px",
                        text: "320x416 px"
                    }
                ]
            }
        ]
    });
    
    var titleBarSetting = mstrmojo.insert({
        id: "titleBarSetting",
        n: mstrmojo.desc(7806),      //"Title Bar"
        cssText: "margin-left:-15px",
        scriptClass: "mstrmojo.Table",
        cellSpacing: 10,
        rows:2,
        cols:3,
        children:[
        {
            scriptClass: "mstrmojo.RadioButton",
            label: mstrmojo.desc(6462)+":",    //"Caption:"
            name: "titleType",
            bindings:{
                checked: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.tp === mstrmojo.mobileConfigUtil.TITLEBAR_REGULAR"
            },
            onclick: function(){
                var ttl = iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl;
                ttl.set("tp", util.TITLEBAR_REGULAR);
                if (ttl.cap === undefined){
                    ttl.set("cap",new mstrmojo.Obj());
                }
            },
            slot: "0,0"
        },
        {
            scriptClass: "mstrmojo.TextBox",
            cssText: "width:250px;",
            bindings:{
                value: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.cap.txt",
                enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.tp === mstrmojo.mobileConfigUtil.TITLEBAR_REGULAR"
            },
            onkeyup: function(evt){
                iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.cap.set("txt", this.value);
            },
            slot: "0,1"
        },
        {
            scriptClass: "mstrmojo.RadioButton",
            label: mstrmojo.desc(7801),       //"Image URL:"
            name: "titleType",
            bindings:{
                checked: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.tp === mstrmojo.mobileConfigUtil.TITLEBAR_IMAGE",
                visible: "mstrmojo.all.iphoneHomescreen_tab.model.data.dt!=3"//DEVICE_PHONE_UNIVERSAL
            },
            onclick: function(){
                var ttl = iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl;
                if (ttl.img === undefined){
                    ttl.set("img", new mstrmojo.Obj({src:""}));
                }
                ttl.set("tp", util.TITLEBAR_IMAGE);
            },
            slot: "1,0"
        },
        _createValidationTextBox({
            cssText: "width:250px;",
            bindings:{
                visible: "mstrmojo.all.iphoneHomescreen_tab.model.data.dt!=3",//DEVICE_PHONE_UNIVERSAL
                value: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.img.src",
                enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_CUSTOM && mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.tp === mstrmojo.mobileConfigUtil.TITLEBAR_IMAGE"    
            },
            constraints: {
                trigger:mstrmojo.validation.TRIGGER.ALL,
                validator: function(v){
                    if (this.required && !(/^(https|http)\:\/\//i.test(v))){
                        return {code: mstrmojo.validation.STATUSCODE.INVALID, msg: ''};
                    }
                    return {code: mstrmojo.validation.STATUSCODE.VALID, msg:''};
                }
            },
            updateModel: function(){
                if (iphoneHomescreen_tab.model){
                    iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.img.set("src", this.value);
                }
            },
            invalidateModel: function(){
                if (iphoneHomescreen_tab.model){
                    delete iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.img.src;
                }
            },
            slot: "1,1"
        }),
        {
            scriptClass: "mstrmojo.Label",
            text: mstrmojo.desc(7824), // "(max. 232x44 px)"
            slot: "1,2",
            bindings: {
                visible: "mstrmojo.all.iphoneHomescreen_tab.model.data.dt!=3"//DEVICE_PHONE_UNIVERSAL
            }
        }
        ]
    });
    
    var buttonStyleSetting = mstrmojo.insert({
        id: "buttonStyle",
        n: mstrmojo.desc(7802),                    //"Button Style"
        scriptClass: "mstrmojo.Table",
        cellSpacing: 8,
        rows: 4,
        cols: 2,
        children:[
                {
                    scriptClass: "mstrmojo.Label",
                    text: mstrmojo.desc(7819),      //"Border Color:"
                    slot: "0,0"
                },    
                mstrmojo.ColorPicker.createDropDown({
                    showUserPalette: false,
                    useAnimate: false,
                    bindings:{
                        fillColor: "mstrmojo.color.decodeColor(mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.brd.clr)"
                    },
                    onfillColorChange: function(evt){
                        iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.brd.set("clr", mstrmojo.color.encodeColor(this.fillColor));
                    },
                    slot: "0,1"
                }),
                {
                    scriptClass: "mstrmojo.Label",
                    text: mstrmojo.desc(7993),       //"Fill Color:"
                    slot: "1,0"
                },
                mstrmojo.ColorPicker.createDropDown({
                    showUserPalette: false,
                    useAnimate: false,
                    bindings:{
                        fillColor: "mstrmojo.color.decodeColor(mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.fll.clr)"
                    },
                    onfillColorChange: function(evt){
                        iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.fll.set("clr", mstrmojo.color.encodeColor(this.fillColor));
                    },
                    slot: "1,1"
                }),
                {
                    scriptClass: "mstrmojo.Label",
                    text: mstrmojo.desc(7807)+":",          //"Font Color:"
                    slot: "2,0"
                },
                mstrmojo.ColorPicker.createDropDown({
                    showUserPalette: false,
                    useAnimate: false,
                    bindings:{
                        fillColor: "mstrmojo.color.decodeColor(mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.fnt.clr)"
                    },
                    onfillColorChange: function(evt){
                        iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.fnt.set("clr", mstrmojo.color.encodeColor(this.fillColor));
                    },
                    slot: "2,1"
                }),
                {
                    scriptClass: "mstrmojo.Label",
                    text: mstrmojo.desc(3059),        //"Style:"
                    slot: "3,0"
                },
                {
                    scriptClass: "mstrmojo.SelectBox",
                    cssText: "width: 105px;",
                    size: 1,
                    //Glass, Flat, None
                    items: [{n:mstrmojo.desc(7804),v:util.STYLE_GLASS},{n:mstrmojo.desc(7805), v:util.STYLE_FLAT},{n:mstrmojo.desc(2258), v:util.STYLE_NONE}],
                    bindings:{
                        selectedItem: "{v:mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.stl}"
                    },
                    onchange: function(evt){
                        iphoneHomescreen_tab.model.data.hsc.cst.fmt.btn.set("stl", this.selectedItem.v);
                    },
                    slot: "3,1"
                }
                ]
    });
    
    var captionSetting = mstrmojo.insert({
        id:"caption",
        n:mstrmojo.desc(6462),      //"Caption"
        scriptClass: "mstrmojo.Table",
        cellSpacing: 15,
        rows:3,
        cols:2,
        layout: [{cells:[{},{}]},{cssText:"vertical-align:top;",cells:[{},{}]},{cells:[{},{}]}],
        children:[
            {
                scriptClass: "mstrmojo.Label",
                text: mstrmojo.desc(6462)+":",    //"Caption:"
                slot: "0,0"
            },
            {
                scriptClass: "mstrmojo.TextBox",
                cssText: "width: 300px; ",
                bindings: {
                    value: "mstrmojo.all.buttonTileList.selectedItem.cap.txt"
                },
                onkeyup: function(){
                    if (buttonTileList.selectedItem){
                        buttonTileList.selectedItem.cap.set("txt", this.value);
                    }
                },
                slot: "0,1"
            },
            {
                scriptClass: "mstrmojo.Label",
                text: mstrmojo.desc(1154),       //"Description:"
                slot: "1,0"
            },
            {
                scriptClass: "mstrmojo.TextArea",
                cssText: "width: 300px; height:85px; border: 2px inset #D4D0C8",
                rows: 5,
                bindings:{
                    value: "mstrmojo.all.buttonTileList.selectedItem.dsc.txt"
                },
                onkeyup: function(){
                    if (buttonTileList.selectedItem){
                        buttonTileList.selectedItem.dsc.set("txt", this.value);
                    }
                },
                slot: "1,1"
            },
            {
                scriptClass: "mstrmojo.Label",
                cssText: "width:300px; margin-left:5px;",
                text: "<span style='font-weight:bold;margin-right:5px;'>" + mstrmojo.desc(7829) + "</span>" + mstrmojo.desc(7808),    //Note:
                slot: "2,1"
            }
        ]
    });
    
    var actions = mstrmojo.insert({
        scriptClass: "mstrmojo.StackContainer",
        cssText: "margin:15px 0 0 15px",
        children: [
            mstrmojo.insert({
                v: util.ACT_RUNREPORT,
                n: mstrmojo.desc(7812),        //"Run report or document"
                layout: [{cells: [{},{},{}]},
                         {cells: [{colSpan: 3}]},
                         {cells: [{},{},{}]},
                         {cells: [{},{},{}]}],
                scriptClass: "mstrmojo.Table",
                bindings: {
                    act: "mstrmojo.all.buttonTileList.selectedItem.act"
                },
                children: [
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(3319),         //"Object:"
                        cssText: "width: 40px",
                        slot: "0,0"
                    },
                    _createValidationTextBox({
                        cssText: "margin-left:5px;width:300px; ",
                        readOnly:true,
                        bindings:{
                            enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_CUSTOM && this.parent.act.tp === this.parent.v",
                            value: "this.parent.act.rs.oi.pt"
                        },
                        slot: "0,1"
                    }),
                    util.createObjBrowserDropdown({
                        browsableTypes: "3,8,55", 
                        targetType: "rs",
                        bindings:{
                            target: "this.parent.act"
                        },
                        slot: "0,2"
                    }),
                    {
                        scriptClass: "mstrmojo.CheckBox",
                        label: mstrmojo.desc(8487), // "Pre-cache at startup"
                        bindings: {
                            checked: "this.parent.act.rs.pcc",
                            enabled: "this.parent.act.rs != null"
                        },
                        onclick: function(){
                            this.parent.act.rs.set("pcc", this.checked);
                            this.parent.act.rs.set("pcf", null);
                        },
                        slot: "1,0"
                    },
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(8488),//"Include a folder of supporting objects (Optional)"
                        cssText: "margin: 2px 0 2px 5px",
                        slot: "2,1"
                    },
                    {
                        scriptClass: "mstrmojo.TextBox",
                        cssText: "margin-left:5px;width:300px;",
                        readOnly: true,
                        bindings:{
                            enabled: "this.parent.act.rs != null && this.parent.act.rs.pcc",
                            value: "this.parent.act.rs.pcf.oi.pt"
                        },
                        slot: "3,1"
                    },
                    util.createObjBrowserDropdown({
                        browsableTypes: "8",
                        targetType: "pcf",
                        bindings:{
                            enabled: "this.parent.act.rs != null && this.parent.act.rs.pcc", 
                            target: "this.parent.act.rs"
                        },
                        slot: "3,2"
                    })
                 ]
           }),
           mstrmojo.insert({
               v: util.ACT_BROWSEFOLDER,
               n: mstrmojo.desc(7813),       //"Browse folder"
               scriptClass: "mstrmojo.Table",
               layout: [{cells: [{},{},{}]},
                        {cells: [{colSpan: 3}]},
                        {cells: [{colSpan: 3}]}],
               bindings: {
                   act: "mstrmojo.all.buttonTileList.selectedItem.act"
               },
               children:[
                   {
                       slot: "0,0",
                       scriptClass: "mstrmojo.Label",
                       text: mstrmojo.desc(7818),        //"Root:"
                       cssText: "width: 40px"
                   },
                   _createValidationTextBox({
                       slot: "0,1",
                       cssText: "margin-left:5px;width:300px;",
                       readOnly:true,
                       bindings:{
                           enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_CUSTOM && this.parent.act.tp == this.parent.v",
                           value: "this.parent.act.fd.oi.pt"
                       }
                   }),
                   util.createObjBrowserDropdown({
                       slot: "0,2",
                       browsableTypes: "8", 
                       targetType: "fd",
                       bindings:{
                           target: "this.parent.act"
                       },
                       allowCheckSubscription: true
                   }),
                   {
                       slot: "1,0",
                       scriptClass: "mstrmojo.CheckBox",
                       label: mstrmojo.desc(8333), //"Check subscription"
                       bindings:{
                           enabled: "this.parent.act.fd != null",
                           checked: "this.parent.act.fd.csp"
                       },
                       onclick: function(){
                           this.parent.act.fd.csp = this.checked;
                       }
                   },
                   {
                       scriptClass: "mstrmojo.CheckBox",
                       label: mstrmojo.desc(8485), //Pre-cache contents at startup,
                       bindings:{
                           enabled: "this.parent.act.fd != null",
                           checked: "this.parent.act.fd.pcc"
                       },
                       onclick: function(){
                           this.parent.act.fd.pcc = this.checked;
                       },
                       slot: "2,0"
                   }
               ]
            }),
            mstrmojo.insert({
                v: util.ACT_SETTINGS,
                n: mstrmojo.desc(7814),    //"Go to Settings"
                scriptClass: "mstrmojo.Label"
            }),
            mstrmojo.insert({
                v: util.ACT_SHAREDLIBRARY,
                n: mstrmojo.desc(7816),     //"Go to Shared Library"
                scriptClass: "mstrmojo.Label"
            })        
        ]
    });
    
    if (mstrApp.device == util.DEVICE_IPHONE) {
        actions.addChildren(
            mstrmojo.insert({
                v: util.ACT_FAVOURITES,
                n: mstrmojo.desc(7815),    //"Go to Reports"
                scriptClass: "mstrmojo.Label"
            }), 2
        );
    }
    
    actions.addChildren(
        mstrmojo.insert({
            v: util.ACT_HELP,
            n: mstrmojo.desc(7817),     //"Go to Help"
            scriptClass: "mstrmojo.Label"
        })      
    );


    var actionSetting = mstrmojo.insert({
        id:"action",
        n: mstrmojo.desc(762),    //"Action"
        scriptClass: "mstrmojo.VBox",
        children:[
            {
                scriptClass: "mstrmojo.HBox",
                children:[
                     {
                         scriptClass: "mstrmojo.Label",
                         text: mstrmojo.desc(7820)
                     },
                     {
                         scriptClass: "mstrmojo.SelectBox",
                         size: 1,
                         alias: "selector",
                         cssText: "margin-left: 5px; width:200px;",
                         bindings:{
                             selectedItem: "{v:mstrmojo.all.buttonTileList.selectedItem.act.tp}"
                         },
                         ontargetChange: function(){
                             var stacks = this.target.children;
                             this.items = [];
                             for (var i=0;i<stacks.length;i++){
                                 this.items.push({n:stacks[i].n, v:stacks[i].v});
                             }
                             this.set("selectedIndex", 0);
                         },
                         onchange: function(){
                              if (this.target){
                                  this.target.set("selected", this.target.children[this.selectedIndex]);
                              }
                              
                              if (buttonTileList.selectedItem && buttonTileList.selectedItem.set){
                                  buttonTileList.selectedItem.act.set("tp", this.selectedItem.v);
                              }
                         },
                         postCreate: function(){
                             this.set("target", actions);
                         }
                     }
                ]
            },
            {
                scriptClass: "mstrmojo.FieldSet",
                cssText: "width:430px;height:160px;margin-top:10px",
                alias: "stack",
                children: [actions]
            }
        ]
    });
    
    var iconSetting = mstrmojo.insert({
        id: "icon",
        n: mstrmojo.desc(7809),     //"Icon"
        scriptClass: "mstrmojo.VBox",
        children:[
            {
                scriptClass: "mstrmojo.RadioButton",
                name: "iconType",
                label: mstrmojo.desc(7810),   //"Use default icon"
                value: 1,
                cssDisplay: "block",
                cssClass: "iphoneSetting-radioButton",
                bindings:{
                    checked: "mstrmojo.all.buttonTileList.selectedItem.icn.tp === mstrmojo.mobileConfigUtil.ICON_DEFAULT"
                },
                onclick: function(){
                    buttonTileList.selectedItem.icn.set("tp", util.ICON_DEFAULT);
                }
            },
            {
                scriptClass: "mstrmojo.RadioButton",
                name: "iconType",
                label: mstrmojo.desc(7811),     //"Use my own"
                value: 2,
                cssDisplay: "block",
                cssClass: "iphoneSetting-radioButton",
                bindings:{
                    checked: "mstrmojo.all.buttonTileList.selectedItem.icn.tp === mstrmojo.mobileConfigUtil.ICON_IMAGE"
                },
                onclick: function(){
                    var icn = buttonTileList.selectedItem.icn;
                    icn.set("tp", util.ICON_IMAGE);
                }
            },
            {
                scriptClass: "mstrmojo.HBox",
                cssText: "margin-left: 40px",
                children:[
                     {
                         scriptClass: "mstrmojo.Label",
                         cssText: "width:70px;",
                         text: mstrmojo.desc(7801)     //"Image URL:"
                     },
                     _createValidationTextBox({
                         cssText: "width: 300px;margin-left:5px;",
                         bindings:{
                             value: "mstrmojo.all.buttonTileList.selectedItem.icn.img.src",
                             enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_CUSTOM && mstrmojo.all.buttonTileList.selectedItem.icn.tp === mstrmojo.mobileConfigUtil.ICON_IMAGE"
                         },
                         constraints: {
                             trigger:mstrmojo.validation.TRIGGER.ALL,
                             validator: function(v){
                                 if (this.required && !(/^(https|http)\:\/\//i.test(v))){
                                     return {code: mstrmojo.validation.STATUSCODE.INVALID, msg: ''};
                                 }
                                 return {code: mstrmojo.validation.STATUSCODE.VALID, msg:''};
                             }
                         },
                         updateModel: function(){
                             if (buttonTileList.selectedItem){
                                 buttonTileList.selectedItem.icn.img.set('src', this.value);
                             }
                         },
                         invalidateModel: function(){
                             if (buttonTileList.selectedItem){
                                 delete buttonTileList.selectedItem.icn.img.src;
                             }
                         }
                     })
                ]
            }
        ]
    });
    
    var formatSettings = mstrmojo.insert({
        scriptClass: "mstrmojo.FieldSet",
        id:"formatSettings",
        legend: mstrmojo.desc(1918),   //"Format"
        cssClass: "homescreen-fieldset",
        cssText: "width: 500px;height: 200px;",
        children:[{
                      scriptClass: "mstrmojo.SelectBox",
                      cssText: "width: 185px;",
                      alias: "selector",
                      size: 1,
                      onchange: function(){
                          this.target.set("selected", this.target.children[this.selectedIndex]);
                      },
                      ontargetChange: function(evt){
                          var stacks = this.target.children;
                          this.items = [];
                          for (var i=0;i<stacks.length;i++){
                              this.items.push({n:stacks[i].n, v:stacks[i].id});
                          }
                          this.set("selectedIndex", 0);
                      }
                  },
                  {
                      alias: "stack",
                      scriptClass: "mstrmojo.StackContainer",
                      cssText: "margin: 10px 0 0 35px;",
                      renderMode: null,
                      children: [backgroundSetting, titleBarSetting, buttonStyleSetting],
                      postCreate: function(){
                          this.parent.selector.set("target", this);
                      }
                  }]
    });
    
    var buttonsSettings = mstrmojo.insert({
            scriptClass: "mstrmojo.FieldSet",
            legend: mstrmojo.desc(7821), // "Buttons"
            cssClass: "homescreen-fieldset",
            cssText: "height:300px;width: 500px;",
            children:[
            {
                scriptClass: "mstrmojo.VBox",
                bindings:{
                    visible: "!!mstrmojo.all.buttonTileList.selectedItem"
                },
                children:[    
                {
                    scriptClass: "mstrmojo.SelectBox",
                    alias: "selector",
                    cssText: "margin:5px 10px 0 0; width:185px;",
                    size: 1,
                    onchange: function(){
                        this.target.set("selected", this.target.children[this.selectedIndex]);
                    },
                    ontargetChange: function(evt){
                        var stacks = this.target.children;
                        this.items = [];
                        for (var i=0;i<stacks.length;i++){
                            this.items.push({n:stacks[i].n, v:stacks[i].id});
                        }
                        this.set("selectedIndex", 1); // Show action settings by default
                    }
                },
                {
                    alias: "stack",
                    scriptClass: "mstrmojo.StackContainer",
                    cssText: "margin: 10px 0 0 35px;",
                    children: [captionSetting, actionSetting, iconSetting],
                    postCreate: function(){
                        this.parent.selector.set("target", this);
                    }
                }]
            }]
    });
    
    var previewControl = mstrmojo.insert({
        scriptClass: "mstrmojo.HBox",
        id: "iphoneTileList-controlPanel",
        bindings:{
            totalPages: "(mstrmojo.all.buttonTileList.items.length>0)?Math.ceil(mstrmojo.all.buttonTileList.items.length/9):1", // at most 9 buttons on one page, TODO: make 9 as constant
            currentPage: "mstrmojo.all.buttonTileList.page+1"
        },
        children:[
                  {
                      scriptClass: "mstrmojo.Button",
                      iconClass: "iphoneTileList-addBtn",
                      title: mstrmojo.desc(7822), // "add a button"
                      onclick: function(){
                          if (iphoneHomescreen_tab.model.defaultButton === undefined){
                              var me = this;
                              iphoneHomescreen_tab.model.getDefaultConfig(util.DEFAULT_IPHONE_HOMESCREEN_BUTTON, 
                                      function(response){
                                          iphoneHomescreen_tab.model.defaultButton = response;
                                          me.onclick();
                                      }); 
                          }else{
                              var idx = buttonTileList.add([util.makeButtonHashable(_H.clone(iphoneHomescreen_tab.model.defaultButton))]);
                              buttonTileList.set("selectedIndex", idx);
                              if (Math.floor(idx/9)+1 !== this.parent.currentPage){ 
                                  buttonTileList.set("page", Math.floor(idx/9));// If the new button is not on the current page
                              }
                              iphoneHomescreen_tab.model.validate();
                          }
                        }
                  },
                  {
                      scriptClass: "mstrmojo.Button",
                      iconClass: "iphoneTileList-delBtn",
                      title: mstrmojo.desc(7823), // "remove a button"
                      bindings: {
                          enabled: "mstrmojo.all.buttonTileList.selectedIndex > -1"
                      },
                      onclick: function(){
                          var idx = buttonTileList.selectedIndex;
                          if (idx > -1){
                              buttonTileList.remove(buttonTileList.selectedItem);
                              // If no button is on the currentPage
                              if (idx==buttonTileList.items.length){
                                  idx--;
                              }
                              buttonTileList.set("selectedIndex", idx);
                              if (Math.floor(idx/9)+1 !== this.parent.currentPage){
                                  buttonTileList.set("page", Math.floor(idx/9));//make the selected item on the current page
                              }
                              iphoneHomescreen_tab.model.validate();
                          }
                      }
                  },
                  {
                      scriptClass: "mstrmojo.Button",
                      cssText: "margin-left: 25px", 
                      iconClass: "iphoneTileList-prevPage",
                      alias: "prevPage",
                      bindings:{
                          enabled: "this.parent.currentPage > 1"
                      },
                      onclick: function(){
                          buttonTileList.set("page", buttonTileList.page-1);
                      }
                  },
                  {
                      scriptClass: "mstrmojo.Label",
                      alias: "pageIndicator",
                      bindings: {
                          text: "'"+mstrmojo.desc(7827).replace(/###/, "'+this.parent.totalPages+'").replace(/##/,"'+this.parent.currentPage+'")+"'"
                      }
                  },
                  {
                      scriptClass: "mstrmojo.Button",
                      iconClass: "iphoneTileList-nextPage",
                      alias: "nextPage",
                      bindings:{
                          enabled: "this.parent.currentPage < this.parent.totalPages"
                      },
                      enabled: false,
                      onclick: function(){
                          buttonTileList.set("page", buttonTileList.page+1);
                      }
                  }
         ]

    });
    
    var customHomescreen = mstrmojo.insert({
        scriptClass: "mstrmojo.HBox",
        cssClass: "homescreen-custom",
        cssText: "width:870px",
        id: "customHomescreen",
        bindings:{
            visible: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_CUSTOM"
        },
        children:[{
            scriptClass: "mstrmojo.Container",
            markupString: "<div class='{@cssClass}'></div>",
            markupSlots:{containerNode: function(){return this.domNode;}},
            cssClass: "homescreen-leftPanel",
            cssText: "height:520px;width:325px;",
            children: [
                previewControl,
                {
                   scriptClass: "mstrmojo.Label",
                   id: "textTitle",
                   cssClass: "iphoneTextTitlebar",
                   cssText: "font: bold 20px Arial;",
                   bindings:{
                      visible: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.tp === mstrmojo.mobileConfigUtil.TITLEBAR_REGULAR",   
                      text: function(){
                          var t = mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.cap.txt;
                          if (t && t.length>20){
                              t = t.substring(0, 20)+"...";
                          }
                          return t;
                      }
                   }
                },
                {
                    scriptClass: "mstrmojo.Widget",
                    id: "imgTitle",
                    markupString: "<div class='{@cssClass}'><img src=''></div>",
                    markupSlots: {
                        imgNode: function(){ return this.domNode.firstChild; }
                    },
                    cssClass: "iphoneImageTitlebar",
                    bindings:{
                        visible: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.tp === mstrmojo.mobileConfigUtil.TITLEBAR_IMAGE",
                        bgImg: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.ttl.img.src"
                    },
                    markupMethods: {
                        onbgImgChange: function(){
                            if (this.bgImg){
                                this.imgNode.src = this.bgImg;
                                this.imgNode.style.display = "none";
                                var me = this;
                                // create a new image to get its full size.
                                var i = new Image();
                                i.onload = function(){
                                    var w = 232, h = 44;
                                    var w1 = this.width, h1 = this.height; 
                                    var r1 = (w1<w)?1:(w1/w), r2 = (h1<h)?1:(h1/h);
                                    var ratio = (r1>r2)?r1:r2; 
                                    var imgNode = me.imgNode;
                                    if (imgNode){
                                        imgNode.width = (w1/ratio);
                                        imgNode.height = (h1/ratio);
                                        imgNode.src = me.bgImg; 
                                        if (h1/ratio <= h){
                                            imgNode.style.paddingTop = (h-h1/ratio)/2 + "px"; // make image center-aligned vertically
                                        }
                                        imgNode.style.display = "inline";
                                    }
                                };
                                i.src = me.bgImg;
                            }else{
                                this.imgNode.src = "";
                                this.imgNode.style.display = "none";
                            }
                        },
                        onvisibleChange: function(){
                            this.domNode.style.display = this.visible?"block":"none";
                        }
                    }
                },
                buttonTileList,
                {
                    // background for the button tileList
                    scriptClass: "mstrmojo.Widget",
                    markupString: "<img src='' class='{@cssClass}'></img>",
                    cssClass: "iphoneTileList-background", 
                    bindings:{
                        bgImg: function(){
                            if (mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.tp === mstrmojo.mobileConfigUtil.BACKGROUND_IMAGE){
                                return mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.cst.fmt.bkg.img.src;
                            }
                        }
                    },
                    markupMethods:{
                        onbgImgChange: function(){
                            if (!this.bgImg){
                                this.domNode.style.display = "none";
                            }else{
                                this.domNode.style.display = "block";
                                this.domNode.src = this.bgImg;
                            }
                        }
                    }
                }
            ]
        },
        {
            scriptClass: "mstrmojo.VBox",
            cssText: "width:500px;height:520px;",
            children:[formatSettings, buttonsSettings]
        }]
    });

    function createHSTypeRadioButton(n, text, slot){
        var radioButton = {
            scriptClass: "mstrmojo.RadioButton",
            name: "homescreen",
            label: text,
            cssText: "margin: 5px 10px 5px 0px;",
            cssDisplay: "block",
            value: n,
            bindings:{
                checked: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === this.value"
            },
            onclick: function(){
                iphoneHomescreen_tab.model.data.hsc.set("tp", n);
            }
        };
        if (slot) radioButton.slot = slot;
        return radioButton;
    }

    var homescreenTypeSelector = mstrmojo.insert({
        scriptClass: "mstrmojo.Table",
        layout: [
                 {cells: [{colSpan: 3}]},
                 {cells: [{}, {}, {}]},
                 {cells: [{colSpan:3}]},
                 {cells: [{colSpan:3}]},
                 {cells: [{colSpan:3}]},
                 {cells: [{}, {}, {}]},
                 {cells: [{colSpan:3}]},
                 {cells: [{colSpan:3}]},
                 {cells: [{colSpan:3}]},
                 {cells: [{colSpan:3}]}
        ],
        children:[
                  {
                      scriptClass: "mstrmojo.RadioButton",
                      name: "homescreen",
                      label: mstrmojo.desc(7797),    //"Display the default homescreen"
                      cssText: "margin: 5px 10px 5px 0px;",
                      cssDisplay: "block",
                      value: util.HOMESCREEN_DEFAULT,
                      bindings:{
                          checked: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === this.value"
                      },
                      getDefaultHomeScreen: function() {
                          var hsc = iphoneHomescreen_tab.model.data.hsc,
                              configType = (mstrApp.device == util.DEVICE_IPHONE) ? util.DEFAULT_IPHONE_CUSTOM_HOMESCREEN : util.DEFAULT_PHONE_UNIVERSAL_CUSTOM_HOMESCREEN;

                              iphoneHomescreen_tab.model.getDefaultConfig(configType, 
                                  function(response){ // task callback function
                                      util.makeCSTHomescreenHashable({cst:response});
                                      hsc.set("tp", util.HOMESCREEN_DEFAULT);
                                      hsc.set("cst", response);
                                  });
                      },
                      onclick: function(){
                          this.getDefaultHomeScreen();
                      },
                      slot: "0,0"
                  },
                  createHSTypeRadioButton(util.HOMESCREEN_FOLDER, mstrmojo.desc(7798), "1,0"), //"Display the contents of a folder" 
                  _createValidationTextBox({
                      cssText: "width: 335px;",
                      readOnly:true,
                      bindings:{
                          value: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.fd.oi.pt",
                          enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_FOLDER"
                      },
                      slot: "1,1"
                  }),
                  util.createObjBrowserDropdown({
                      browsableTypes: "8",
                      targetType: "fd",
                      bindings:{
                          target: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc",
                          enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_FOLDER"
                      },
                      allowCheckSubscription: true,
                      slot: "1,2"
                  }),
                  {
                      scriptClass: "mstrmojo.CheckBox",
                      label: mstrmojo.desc(8333), //"Check subscription"
                      cssText: "margin-left: 16px",
                      bindings: {
                          folder: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.fd",
                          enabled: "this.folder != null && mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_FOLDER",
                          checked: "this.folder.csp"
                      },
                      onclick: function(){
                          if (this.folder != null){
                              this.folder.csp = this.checked;
                          }
                      },
                      slot: "2,0"
                  },
                  {
                      scriptClass: "mstrmojo.CheckBox",
                      label: mstrmojo.desc(8485), //"Pre-cache contents at startup"
                      cssText: "margin-left: 16px",
                      bindings: {
                          folder: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.fd",
                          enabled: "this.folder != null && mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_FOLDER",
                          checked: "this.folder.pcc"
                      },
                      onclick: function(){
                          if (this.folder != null){
                              this.folder.pcc = this.checked;
                          }
                      },
                      slot: "3,0"
                  },
                  {
                      scriptClass: "mstrmojo.RadioButton",
                      name: "homescreen_X",
                      label: mstrmojo.desc(7800),    //"Display a custom homescreen"
                      cssDisplay: "block",
                      bindings: {
                          checked: function(){
                              var tp = mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp;
                              return tp === util.HOMESCREEN_RD || tp === util.HOMESCREEN_CUSTOM;
                          } 
                      },
                      onclick: function(){
                          this.parent.rsHSTRadio.onclick(); //delegate to the radio button for custom homescreen
                      },
                      slot: "4,0"
                  },
                  {
                      scriptClass: "mstrmojo.RadioButton",
                      name: "ipadHomescreen",
                      alias: "rsHSTRadio",
                      label: mstrmojo.desc(7799), //"Display a report or document"
                      cssText: "margin: 5px 10px 5px 20px",
                      cssDisplay: "block",
                      value: util.HOMESCREEN_RD,
                      bindings:{
                          visible: function(){
                              var tp = mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp;
                              return tp == util.HOMESCREEN_RD || tp == util.HOMESCREEN_CUSTOM;
                          },
                          checked: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === this.value"
                      },
                      oncheckedChange: function(){
                          if (this.checked !== undefined){
                              var hsc = iphoneHomescreen_tab.model.data.hsc;
                              if (this.checked){
                                  if (!hsc.rs){
                                      hsc.set("rs", new mstrmojo.Obj({sobs:[],pb: new mstrmojo.Obj({iv:false,clr:14540253,pos:1,opa:1.0})}));
                                  }
                              }
                          }
                      },
                      onclick: function(){
                          var hsc = iphoneHomescreen_tab.model.data.hsc;
                          hsc.set("tp", util.HOMESCREEN_RD);
                      },
                      slot: "5,0"
                  },
                  _createValidationTextBox({
                      cssText: "width: 335px;",
                      readOnly:true,
                      bindings:{
                          visible: function(){
                              var tp = mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp;
                              return tp == util.HOMESCREEN_RD || tp == util.HOMESCREEN_CUSTOM;
                          },
                          value: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.rs.oi.pt",
                          enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_RD"
                      },
                      slot: "5,1"
                  }),
                  util.createObjBrowserDropdown({
                      browsableTypes: "3,8,55",
                      targetType:"rs",
                      bindings:{
                          visible: function(){
                              var tp = mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp;
                              return tp == util.HOMESCREEN_RD || tp == util.HOMESCREEN_CUSTOM;
                          },
                          target: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc",
                          enabled: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_RD"
                      },
                      slot: "5,2"
                  }),
                  _H.copy({slot: "6,0"}, mstrmojo.all.ipadHomescreen_tab.createPreCacheHomescreen("iphonePreCacheItemList", "mstrmojo.all.iphoneHomescreen_tab")),
                  _H.copy({slot: "7,0"}, mstrmojo.all.ipadHomescreen_tab.createProgressBarHomescreen("mstrmojo.all.iphoneHomescreen_tab")),
                  {
                      scriptClass: "mstrmojo.RadioButton",
                      name: "homescreen",
                      alias: "customHSTRadio",
                      label: mstrmojo.desc(8629), // "Display a custom list of folders, documents or reports"
                      cssText: "margin: 5px 10px 5px 20px;",
                      cssDisplay: "block",
                      value: util.HOMESCREEN_CUSTOM,
                      bindings:{
                          visible: function(){
                              var tp = mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp;
                              return tp == util.HOMESCREEN_RD || tp == util.HOMESCREEN_CUSTOM;
                          },
                          checked: "mstrmojo.all.iphoneHomescreen_tab.model.data.hsc.tp === this.value"
                      },
                      onclick: function(){
                          var hsc = iphoneHomescreen_tab.model.data.hsc,
                              configType = (mstrApp.device == util.DEVICE_IPHONE) ? util.DEFAULT_IPHONE_CUSTOM_HOMESCREEN : util.DEFAULT_PHONE_UNIVERSAL_CUSTOM_HOMESCREEN;

                          if (hsc.cst === undefined){
                              iphoneHomescreen_tab.model.getDefaultConfig(configType, 
                                      function(response){ // task callback function
                                          util.makeCSTHomescreenHashable({cst:response});
                                          hsc.set("cst", response);
                                          hsc.set("tp", util.HOMESCREEN_CUSTOM);
                                      });
                          }else{
                              hsc.set("tp", util.HOMESCREEN_CUSTOM);
                          }
                      },
                      slot: "8,0"
                  },
                  _H.copy({slot:"9,0"}, customHomescreen)
        ]
    });
    
    iphoneHomescreen_tab.addChildren(homescreenTypeSelector);
})();