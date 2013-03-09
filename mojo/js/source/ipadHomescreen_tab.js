(function(){
    mstrmojo.requiresCls("mstrmojo.hash", "mstrmojo.mobileConfigUtil", "mstrmojo.expr", "mstrmojo.validation", "mstrmojo.Widget","mstrmojo.ColorPicker","mstrmojo.css");
    
    var util = mstrmojo.mobileConfigUtil,
        _H = mstrmojo.hash,
        isIOS = "mstrmojo.all.ipadHomescreen_tab.model.data.dt == 2 || mstrmojo.all.iphoneHomescreen_tab.model.data.dt == 1"; 
    
    var iconURLs = {};
    iconURLs[util.ACT_RUNREPORT] = "../images/icon_report.gif";
    iconURLs[util.ACT_BROWSEFOLDER] = "../images/icon_folder.gif";
    iconURLs[util.ACT_SHAREDLIBRARY] = "../javascript/mojo/css/images/shared_library.png";
    iconURLs[util.ACT_CLOUD] = "../javascript/mojo/css/images/smallCloud.png";
    
    mstrmojo.ipadHomescreen_tab = mstrmojo.insert({
        id: "ipadHomescreen_tab",
        scriptClass: "mstrmojo.VBox",
        n: mstrmojo.desc(7769),      //"Home Screen"
        model: null
    });
    var ipadHomescreen_tab = mstrmojo.ipadHomescreen_tab;

    function _createHSTypeRadioButton(v, text, slot){
        return {
                scriptClass: "mstrmojo.RadioButton",
                name: "ipadHomescreen",
                label: text,
                cssText: "margin: 5px 10px 5px 0",
                cssDisplay: "block",
                value: v,
                bindings:{
                    checked: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === this.value"
                },
                onclick: function(){
                    ipadHomescreen_tab.model.data.hsc.set("tp", v);
                },
                slot: slot
        };
    }
    
    function _createValidationTextBox(prop){
        return _H.copy(prop,
        {
            scriptClass: "mstrmojo.ValidationTextBox", 
            dtp: mstrmojo.expr.DTP.VARCHAR,
            constraints: {trigger:mstrmojo.validation.TRIGGER.ALL},
            required:true,
            readOnly:true,
            onenabledChange: function(){
                this.required = this.enabled;
                this.validate();
                if (!this.required){
                    this.onValid();
                }
            },
            onValid: function(){
                if (ipadHomescreen_tab.model){
                    ipadHomescreen_tab.model.validate();
                }
            },
            onInvalid: function(){
                if (ipadHomescreen_tab){
                    ipadHomescreen_tab.model.set("validFlag", false);
                }
            }
        });
    }
            
    function _createEnableViewCheckBox(name, prop, slot){
        return {
            scriptClass: "mstrmojo.CheckBox",
            name: "enables",
            label: name,
            cssText: "margin-left:10px;",
            bindings:{
                checked: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.cst.fmt.vw."+prop
            },
            onclick: function(){
                ipadHomescreen_tab.model.data.hsc.cst.fmt.vw[prop] = this.checked;
            },
            slot: slot
        };
    }
    
    var ipadGeneralSettings = mstrmojo.insert({
        id: "ipadGeneralSettings",
        scriptClass: "mstrmojo.FieldSet",
        cssClass: "homescreen-fieldset",
        cssText: "height:150px;width:450px",
        legend: mstrmojo.desc(295), // "General"
        children:[{
            scriptClass: "mstrmojo.Table",
            cssText: "margin-left: 20px;",
            cellSpacing: 8,
            rows: 2,
            cols: 1,
            children:[
                      _createEnableViewCheckBox(mstrmojo.desc(9015), "rpt", "0,0"),//Enable Reports tab
                      {
                          scriptClass: "mstrmojo.FieldSet",
                          cssClass: "mstrmojo-FieldSet-noborder",
                          cssText: "margin-left:22px",
                          legend: mstrmojo.desc(9016),//Display additional options
                          children: [{
                              scriptClass: 'mstrmojo.Table',
                              rows: 3,
                              cols: 1,
                              children:[
                                        _createEnableViewCheckBox(mstrmojo.desc(7831), "stg", "0,0"),// Settings
                                        _createEnableViewCheckBox(mstrmojo.desc(1143), "hlp", "1,0"), // Help)
                                        _createEnableViewCheckBox(mstrmojo.desc(9017), "cld", "2,0") //Configure MicroStrategy Cloud Personal Folder
                              ]
                          }],
                          slot: "1,0"           
                      }
            ]
        }]
    });
    
    function createItemList(props){
        return {
            id: props.id,
            scriptClass: "mstrmojo.WidgetList",
            alias: "itemList",
            cssClass: "ipadItemList",
            cssText: "width:250px",
            makeObservable: true,
            renderOnScroll: false,
            bindings: {
                items: props.itemsBinding
            },
            itemFunction: function(btn, idx, widget){
                var act = btn.act || btn;
                
                var item = new mstrmojo.Widget({
                    markupString:  "<div class='ipadItem'>" +
                                        "<img class='ipadItemIcon' src='{@icon}'>" +
                                        "<div class='ipadItemText'>{@text}</div>" +
                                    "</div>",
                    markupSlots: {
                        iconNode: function(){return this.domNode.firstChild;},
                        textNode: function(){return this.domNode.lastChild;}
                    },
                    markupMethods: {
                        oniconChange: function(){
                            this.iconNode.src = this.icon;
                        },
                        ontextChange: function(){
                            this.textNode.innerHTML = this.text;
                        },
                        onselectedChange: function(){
                             mstrmojo.css.toggleClass(this.domNode, ["selected"], this.selected);
                        },
                        ontitleChange: function(){
                            this.textNode.title = this.title;
                        }
                    },
                    update: function(){
                        var cap;
                        
                        switch (act.tp){
                        case util.ACT_BROWSEFOLDER: cap = act.fd && act.fd.oi && act.fd.oi.n; break;
                        case util.ACT_RUNREPORT: cap = act.rs && act.rs.oi && act.rs.oi.n; break;
                        case util.ACT_SHAREDLIBRARY: cap = mstrmojo.desc(7832);break; //Shared Library
                        case util.ACT_CLOUD: cap="MicroStrategy Cloud Personal";break;
                        }
                        this.set("icon", iconURLs[act.tp]);
                        this.set("text", cap || "");
                        this.set("title", cap || "");
                        
                        if (btn.cap){
                            btn.cap.txt = cap;
                        }
                    }
                });
                item.update();
                
                act.attachEventListener("tpChange",item.id,"update");
                act.attachEventListener("rsChange",item.id,"update");
                act.attachEventListener("fdChange",item.id,"update");
                
                if (!act.rs){
                    act.set("rs", new mstrmojo.Obj());
                }
                act.rs.attachEventListener("oiChange",item.id,"update");
                if (!act.fd){
                    act.set("fd", new mstrmojo.Obj());
                }
                act.fd.attachEventListener("oiChange",item.id,"update");
                
                return item;
            }
        };
    }
    
    /**
     * @param props {Object}
     *          -> listTitle {String}
     *          -> defaultButtonType {Integer}
     *          -> itemList {Widget}
     */
    function createItemListPreview(props){
        var listTitle = props.listTitle,
            defaultButtonType = props.defaultButtonType,
            itmList = props.itemList,
            itemListId = itmList.id;
        
        return {
            cssClass: "homescreen-leftPanel",
            cssText: "height:400px;width:auto;",
            scriptClass: "mstrmojo.Table",
            cols: 1,
            rows: 3,
            children:[
                      {
                          scriptClass: "mstrmojo.Label",
                          text: listTitle,
                          cssText: "height:20px;font-size:14px;width:260px;white-space:nowrap;",
                          slot: "0,0"
                      },
                      _H.copy({slot:"2,0"}, itmList),
                      {
                          scriptClass: "mstrmojo.Button",
                          text: "+",
                          title: mstrmojo.desc(7822),
                          cssClass: "ipadItemList-add",
                          onclick: function(){
                              var itemList = mstrmojo.all[itemListId];
                              if (defaultButtonType == util.DEFAULT_IPAD_HOMESCREEN_BUTTON){
                                  if (ipadHomescreen_tab.model.defaultButton === undefined){
                                      var me = this;
                                      ipadHomescreen_tab.model.getDefaultConfig(util.DEFAULT_IPAD_HOMESCREEN_BUTTON, 
                                              function(response){
                                                    ipadHomescreen_tab.model.defaultButton = response;
                                                  me.onclick();
                                              }); 
                                  }else{
                                      var idx = itemList.add([util.makeButtonHashable(_H.clone(ipadHomescreen_tab.model.defaultButton))]);
                                      itemList.set("selectedIndex", idx);
                                  }
                              }else if (defaultButtonType == util.DEFAULT_IPAD_PRECACHE_BUTTON){
                                  var idx = itemList.add([new mstrmojo.Obj({tp: util.ACT_RUNREPORT, rs: new mstrmojo.Obj({pcc: true})})]);
                                  itemList.set("selectedIndex", idx);
                              }
                          },
                          slot: "1,0"
                      },
                      {
                          scriptClass: "mstrmojo.Button",
                          text: "x",
                          title: mstrmojo.desc(7823),
                          cssClass: "ipadItemList-remove",
                          bindings:{
                              enabled: "this.parent.itemList.selectedIndex > -1"
                          },
                          onclick: function(){
                              var itemList = this.parent.itemList,
                                  idx = itemList.selectedIndex;
                              if (itemList.selectedItem){
                                  itemList.remove(itemList.selectedItem);
                              }
                              if (idx === itemList.items.length){
                                  idx--;
                              }
                              itemList.set("selectedIndex", idx);
                          },
                          slot: "1,0"
                      },
                      {
                          scriptClass: "mstrmojo.Button",
                          cssClass: "ipadItemList-movedown",
                          title: mstrmojo.desc(139),
                          bindings:{
                              enabled: "this.parent.itemList.selectedIndex > -1 && this.parent.itemList.selectedIndex < this.parent.itemList.items.length-1"
                          },
                          onclick: function(){
                              var itemList = this.parent.itemList,
                                  selectedIndex = itemList.selectedIndex;
                              if (selectedIndex > -1 && selectedIndex < itemList.items.length-1){
                                  var item = itemList.selectedItem;
                                  itemList.remove(item);
                                  itemList.add([item], selectedIndex+1);
                                  itemList.set("selectedIndex", selectedIndex+1);
                              }    
                          },
                          slot: "1,0"
                      },
                      {
                          scriptClass: "mstrmojo.Button",
                          cssClass: "ipadItemList-moveup",
                          title: mstrmojo.desc(138),
                          bindings:{
                              enabled: "this.parent.itemList.selectedIndex > 0"
                            },
                          onclick: function(){
                              var itemList = this.parent.itemList,
                                  selectedIndex = itemList.selectedIndex;
                              if (selectedIndex > 0 && selectedIndex < itemList.items.length){
                                  var item = itemList.selectedItem;
                                  itemList.remove(item);
                                  itemList.add([item], selectedIndex-1);
                                  itemList.set("selectedIndex", selectedIndex-1);
                              }    
                          },
                          slot: "1,0"
                      },
                      {
                          scriptClass: "mstrmojo.Label",
                          cssText: "clear:both",
                          slot: "1,0"
                      }
            ]
        };
    }
    
    function createActionSettingPanel(props){
        var forcePreCache = props.forcePreCache;
        
        return {
            scriptClass: "mstrmojo.FieldSet",
            cssClass: "homescreen-fieldset",
            cssText: "height:230px; width: 465px",
            legend: mstrmojo.desc(4878), // "Item"
            children:[{
                scriptClass: "mstrmojo.VBox",
                cssText: "margin: 15px 0 0 15px",
                bindings:{
                    action: props.actionBinding,
                    visible: "!!this.action"
                },
                children:[
                    {
                        scriptClass: "mstrmojo.HBox",
                        children:[
                            {
                                scriptClass: "mstrmojo.Label",
                                text: mstrmojo.desc(762)+":" // "Action:"
                            },
                            {
                                scriptClass: "mstrmojo.SelectBox",
                                size: 1,
                                items: props.actionItems,
                                bindings: {
                                    selectedItem: "{v:this.parent.parent.action.tp}"
                                },
                                onchange: function(){
                                    var actionModel = this.parent.parent.action,
                                        tp;
                                    
                                    if (actionModel){
                                        tp = this.selectedItem.v;
                                        actionModel.set("tp", tp);
                                    }
                                }
                            }
                        ]
                    },
                    {
                        scriptClass: "mstrmojo.FieldSet",
                        cssText: "width:430px;height:160px;margin-top:10px",
                        alias: "stack",
                        children: [
                            {
                                v: util.ACT_RUNREPORT,
                                n: mstrmojo.desc(7812), // "Run report or document"
                                layout: [{cells: [{},{},{}]},
                                         {cells: [{colSpan: 3}]},
                                         {cells: [{},{},{}]},
                                         {cells: [{},{},{}]}],
                                scriptClass: "mstrmojo.Table",
                                bindings: {
                                    act: "this.parent.parent.action",
                                    visible: "this.act && this.act.tp === this.v "
                                },
                                onvisibleChange: function(){
                                    if (this.visible){
                                        if (!this.act.rs){
                                            this.act.set("rs", new mstrmojo.Obj());
                                        }
                                        
                                        if (forcePreCache){
                                            this.act.rs.set("pcc", true);
                                        }
                                    }
                                },
                                children: [
                                    {
                                        scriptClass: "mstrmojo.Label",
                                        text: mstrmojo.desc(3319),         //"Object:"
                                        cssText: "width: 40px",
                                        slot: "0,0"
                                    },
                                    _createValidationTextBox({
                                        cssText: "margin-left:5px;width:300px;",
                                        bindings:{
                                            enabled: "this.parent.visible", 
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
                                            enabled: forcePreCache ? "false" : "this.parent.act.rs != null"
                                        },
                                        onclick: function(){
                                            this.parent.act.rs.set("pcc", this.checked);
                                            this.parent.act.rs.set("pcf", undefined);
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
                            },
                            {
                                v: util.ACT_BROWSEFOLDER,
                                n: mstrmojo.desc(7813), // "Browse folder"
                                scriptClass: "mstrmojo.Table",
                                layout: [{cells: [{},{},{}]},
                                         {cells: [{colSpan: 3}]},
                                         {cells: [{colSpan: 3}]}],
                                bindings: {
                                    act: "this.parent.parent.action", //binding to the "action" on the action setting panel
                                    visible: "this.act && this.act.tp == this.v"
                                },
                                onvisibleChange: function(){
                                    if (this.visible){
                                        if (!this.act.fd){
                                            this.act.set("fd", new mstrmojo.Obj());
                                        }
                                        
                                        if (forcePreCache){
                                            this.act.fd.set("pcc", true);
                                        }
                                    }
                                },
                                children:[
                                    {
                                        scriptClass: "mstrmojo.Label",
                                        text: mstrmojo.desc(7818),        //"Root:"
                                        cssText: "width: 40px",
                                        slot: "0,0"
                                    },
                                    _createValidationTextBox({
                                        cssText: "margin-left:5px;width:300px;",
                                        bindings:{
                                            enabled: "this.parent.visible",
                                            value: "this.parent.act.fd.oi.pt"
                                        },
                                        slot: "0,1"
                                    }),
                                    util.createObjBrowserDropdown({
                                        browsableTypes: "8", 
                                        targetType: "fd",
                                        bindings:{
                                            target: "this.parent.act"
                                        },
                                        slot:"0,2",
                                        allowCheckSubscription: true
                                    }),
                                    {
                                        scriptClass: "mstrmojo.CheckBox",
                                        label: mstrmojo.desc(8333), //"Check subscription"
                                        bindings:{
                                            enabled: "this.parent.act.fd != null",
                                            checked: "this.parent.act.fd.csp"
                                        },
                                        onclick: function(){
                                            this.parent.act.fd.csp = this.checked;
                                        },
                                        slot: "1,0"
                                    },
                                    {
                                        scriptClass: "mstrmojo.CheckBox",
                                        label: mstrmojo.desc(8485), //Pre-cache contents at startup,
                                        bindings:{
                                            enabled: forcePreCache ? "false" : "this.parent.act.fd != null",
                                            checked: "this.parent.act.fd.pcc"
                                        },
                                        onclick: function(){
                                            this.parent.act.fd.pcc = this.checked;
                                        },
                                        slot: "2,0"
                                    }
                                ]
                             },
                             {
                                 v: util.ACT_SHAREDLIBRARY,
                                 n: mstrmojo.desc(7816), // "Go to Shared Folder" 
                                 scriptClass: "mstrmojo.Label"
                             },
                             {
                                 v: util.ACT_CLOUD,
                                 n: mstrmojo.desc(9018), // "Browse MicroStrategy Cloud Personal" 
                                 scriptClass: "mstrmojo.Label"
                             }
                         ]
                    }]  
            }]    
        };
    }
    
    function createCustomHomescreen(){
        var ipadItemList = createItemList({id: "ipadItemList", itemsBinding: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.cst.btns"}),
            ipadPreview = createItemListPreview({listTitle: mstrmojo.desc(7891), //"Home View Items"
                                                 defaultButtonType: util.DEFAULT_IPAD_HOMESCREEN_BUTTON,
                                                 itemList: ipadItemList}),
            ipadItemSettings = createActionSettingPanel({actionBinding: "mstrmojo.all.ipadItemList.selectedItem.act", 
                                                         actionItems:   [{v: util.ACT_RUNREPORT, n: mstrmojo.desc(7812)}, // "Run report or document"
                                                                         {v: util.ACT_BROWSEFOLDER, n: mstrmojo.desc(7813)}, // "Browse folder"
                                                                         {v: util.ACT_SHAREDLIBRARY, n: mstrmojo.desc(7816)}, // "Go to Shared Folder"
                                                                         {v: util.ACT_CLOUD, n: mstrmojo.desc(9018)}]});//"Browse MicroStrategy Cloud Personal"
            
            return {
                id: "customIpadHomescreen",
                scriptClass: "mstrmojo.HBox",
                cssClass: "homescreen-custom",
                cssText: "width:auto",
                bindings:{
                    visible: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_CUSTOM"
                },
                children:[
                          ipadPreview, 
                          {
                            scriptClass: "mstrmojo.VBox",
                            children:[ipadGeneralSettings, ipadItemSettings]
                          }
                ]
            };
    }
    
    //Expose it on ipadHomescreen_tab so that it can be reused in iphone homescreen tab
    ipadHomescreen_tab.createPreCacheHomescreen = function(itemListId, homescreenBinding){
        var preCacheItemList = createItemList({id: itemListId, itemsBinding: "this.parent.parent.homescreen.model.data.hsc.rs.sobs"}),
            preCacheItemListPreview = createItemListPreview({listTitle: mstrmojo.desc(8628), // "Pre-cache the following supporting objects at startup(Optional)"
                                                             defaultButtonType: util.DEFAULT_IPAD_PRECACHE_BUTTON,
                                                             itemList: preCacheItemList}),
            preCacheItemSettings = createActionSettingPanel({actionBinding: "mstrmojo.all." + itemListId + ".selectedItem",
                                                             actionItems:   [{v: util.ACT_RUNREPORT, n: mstrmojo.desc(7812)}, // "Run report or document"
                                                                             {v: util.ACT_BROWSEFOLDER, n: mstrmojo.desc(7813)}], // "Browse folder"
                                                             forcePreCache: true});
        return {
            scriptClass: "mstrmojo.HBox",
            cssClass: "homescreen-custom",
            cssText: "width:auto",
            bindings:{
                homescreen: homescreenBinding,
                visible: "this.homescreen.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_RD"
            },
            children:[preCacheItemListPreview, preCacheItemSettings]
        };
    };
    
    //reuse in iphoneHomescreen_tab.js
    ipadHomescreen_tab.createProgressBarHomescreen = function(homescreenBinding) {
    	return {
    		scriptClass: "mstrmojo.Table",
    		cssText: "width:auto;margin-left:25px",
    		bindings:{
    			homescreen: homescreenBinding,
    			visible: "this.homescreen.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_RD"
    		},
    		layout: [
    		         {cells: [{colSpan:2}]},
    		         {cells: [{cssText: "width:90px"},{}]}
        	         ],
        	children: [
        	           {
        	        	   scriptClass: "mstrmojo.CheckBox",
        	        	   label:mstrmojo.desc(9066),     //Display progress bar for subscriptions synchronization and pre-caching
        	        	   bindings: {
        	        	   	   checked: "this.parent.homescreen.model.data.hsc.rs.pb.iv"
        	           	   },
        	           	   onclick: function() {
        	           		   if( this.parent.homescreen.model.data.hsc.rs.pb ) {
        	           			   this.parent.homescreen.model.data.hsc.rs.pb.set("iv", this.checked);
        	           		   }
        	           	   },
        	        	   slot:"0,0"
        	           },
        	           {
        	        	   scriptClass: "mstrmojo.Label",
        	        	   cssText: "margin-left:30px",
        	        	   text: mstrmojo.desc(2060),     //Color
        	        	   slot: "1,0"
        	        	   
        	           },
        	           _H.copy({slot: "1,1"}, mstrmojo.ColorPicker.createDropDown({
                           showUserPalette: false,
                           useAnimate: false,
                           isSimple:true,
                           showNoColor:false,
                           bindings:{
                               enabled: "this.parent.homescreen.model.data.hsc.rs.pb.iv",
                               fillColor: function(){
                               	   return mstrmojo.color.decodeColor(this.parent.homescreen.model.data.hsc.rs.pb.clr);
                               }
                           },
                           onfillColorChange: function(evt){
                               if (this.fillColor){
                            	   this.parent.homescreen.model.data.hsc.rs.pb.clr = mstrmojo.color.encodeColor(this.fillColor);
                               }
                           }
                       }))
        	           ]
    	};
    };
    
    
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
                    name: "ipadHomescreen",
                    label: mstrmojo.desc(7797),    //"Display the default homescreen"
                    cssText: "margin: 5px 10px 5px 0",
                    cssDisplay: "block",
                    value: util.HOMESCREEN_DEFAULT,
                    bindings:{
                        checked: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === this.value"
                    },
                    onclick: function(){
                        ipadHomescreen_tab.model.data.hsc.set("tp", v);
                    },
                    slot: "0,0",
                    
                    getDefaultHomeScreen: function() {
                      var hsc = ipadHomescreen_tab.model.data.hsc,
                          configType = (mstrApp.device == util.DEVICE_IPAD) ? util.DEFAULT_IPAD_CUSTOM_HOMESCREEN : util.DEFAULT_TABLET_UNIVERSAL_CUSTOM_HOMESCREEN;
                    
                      ipadHomescreen_tab.model.getDefaultConfig(configType, 
                          function(response){ // task callback function
                              util.makeCSTHomescreenHashable({cst:response});
                              hsc.set("tp", util.HOMESCREEN_DEFAULT);
                              hsc.set("cst", response);
                          });
                    },
                    onclick: function(){
                      this.getDefaultHomeScreen();
                    }
                  },
                  _createHSTypeRadioButton(util.HOMESCREEN_FOLDER, mstrmojo.desc(7798), "1,0"), //"Display the contents of a folder"
                  _createValidationTextBox({
                      cssText: "margin-left:5px;width:300px;",
                      bindings:{
                            enabled: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_FOLDER",
                            value: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.fd.oi.pt"
                      },
                      slot: "1,1"
                  }),
                  util.createObjBrowserDropdown({
                      browsableTypes: "8",
                      targetType: "fd",
                      bindings:{
                            target: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc",
                            enabled: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_FOLDER"
                      },
                      slot: "1,2",
                      allowCheckSubscription: true
                  }),
                  {
                      scriptClass: "mstrmojo.CheckBox",
                      label: mstrmojo.desc(8333), //"Check subscription"
                      cssText: "margin-left: 16px",
                      bindings: {
                          folder: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.fd",
                          enabled: "this.folder != null && mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_FOLDER",
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
                          folder: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.fd",
                          enabled: "this.folder != null && mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_FOLDER",
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
                      name: "ipadHomescreen_X",
                      label: mstrmojo.desc(7800),    //"Display a custom homescreen"
                      cssDisplay: "block",
                      bindings: {
                          checked: function(){
                              var tp = mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp;
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
                              var tp = mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp;
                              return tp == util.HOMESCREEN_RD || tp == util.HOMESCREEN_CUSTOM;
                          },
                          checked: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === this.value"
                      },
                      oncheckedChange: function(){
                          if (this.checked !== undefined){
                              var hsc = ipadHomescreen_tab.model.data.hsc;
                              if (this.checked){
                                  if (!hsc.rs){
                                	  hsc.set("rs", new mstrmojo.Obj({sobs:[],pb: new mstrmojo.Obj({iv:false,clr:14540253,pos:1,opa:1.0})}));
                                  }
                              }
                          }
                      },
                      onclick: function(){
                          var hsc = ipadHomescreen_tab.model.data.hsc;
                          hsc.set("tp", util.HOMESCREEN_RD);
                      },
                      slot: "5,0"
                  },
                  _createValidationTextBox({
                      cssText: "margin-left:5px;width:300px;",
                      bindings:{
                            visible: function(){
                                var tp = mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp;
                                return tp == util.HOMESCREEN_RD || tp == util.HOMESCREEN_CUSTOM;
                            },
                            enabled: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_RD",
                            value: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.rs.oi.pt"
                      },
                      slot: "5,1"
                  }),
                  util.createObjBrowserDropdown({
                      browsableTypes: "3,8,55",
                      targetType: "rs",
                      bindings:{
                          visible: function(){
                              var tp = mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp;
                              return tp == util.HOMESCREEN_RD || tp == util.HOMESCREEN_CUSTOM;
                          },
                          target: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc",
                          enabled: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === mstrmojo.mobileConfigUtil.HOMESCREEN_RD"
                      },
                      slot: "5,2"
                  }),
                  _H.copy({slot: "6,0"}, ipadHomescreen_tab.createPreCacheHomescreen("ipadPreCacheItemList", "mstrmojo.all.ipadHomescreen_tab")),
                  _H.copy({slot: "7,0"}, ipadHomescreen_tab.createProgressBarHomescreen("mstrmojo.all.ipadHomescreen_tab")),
                  {
                      scriptClass: "mstrmojo.RadioButton",
                      alias: "customHSTRadio",
                      name: "ipadHomescreen",
                      label: mstrmojo.desc(8629), // "Display a custom list of folders, documents or reports"
                      cssText: "margin: 5px 10px 5px 20px",
                      cssDisplay: "block",
                      value: util.HOMESCREEN_CUSTOM,
                      bindings:{
                          visible: function(){
                              var tp = mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp;
                              return tp == util.HOMESCREEN_RD || tp == util.HOMESCREEN_CUSTOM;
                          },
                          checked: "mstrmojo.all.ipadHomescreen_tab.model.data.hsc.tp === this.value"
                      },
                      onclick: function(){
                          var hsc = ipadHomescreen_tab.model.data.hsc;
                          if (hsc.cst === undefined){
                              ipadHomescreen_tab.model.getDefaultConfig(util.DEFAULT_IPAD_CUSTOM_HOMESCREEN, 
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
                  _H.copy({slot: "9,0"}, createCustomHomescreen())
        ]
    });
    
    ipadHomescreen_tab.addChildren(homescreenTypeSelector);
})();