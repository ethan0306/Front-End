/**
 *  Edit configuration, contains iPhone tab and connectivity tab. 
 */
(function(){   

    mstrmojo.requiresCls(
            "mstrmojo.mobileConfigUtil",
            "mstrmojo.Table",
            "mstrmojo.ValidationTextBox",
            "mstrmojo.TabContainer",
            "mstrmojo.TabStrip",
            "mstrmojo.StackContainer",
            "mstrmojo.HBox",
            "mstrmojo.HTMLButton",
            "mstrmojo.string",
            "mstrmojo.BlackBerry_tab",
            "mstrmojo.iPhone_tab",
            "mstrmojo.connect_tab",
            "mstrmojo.ipadHomescreen_tab",
            "mstrmojo.iphoneHomescreen_tab"
            );
    
    mstrmojo.requiresDescs(118,221,7765,7896,8453,8454);
            
    //Util
    var util = mstrmojo.mobileConfigUtil;
    
    //UI
    mstrmojo.editConfig = mstrmojo.insert({
        scriptClass: "mstrmojo.VBox",
        id: "editConfig",
        
        /**
         * set model reference for every children
         */
        model: null,
        _set_model: function(n,v) {
            this.model = v;

            mstrmojo.all.BlackBerry_tab.set("model",v);
            mstrmojo.all.iPhone_tab.set("model",v);
            mstrmojo.all.connect_tab.set("model",v);
            mstrmojo.all.iphoneHomescreen_tab.set("model",v);
            mstrmojo.all.ipadHomescreen_tab.set("model",v);
            return true;
        },
        
        toConfList: function() {
              mstrmojo.form.send( {evt: 3004, target: "mobileList"} );
        },
        children: 
        [
          {
             scriptClass: "mstrmojo.HBox",
             cssText: "margin-top:5px",
             children:[
                            //"Configuration Name:"
                            util.propertyName(mstrmojo.desc(7765)+":", null, "padding-left:30px;margin: 5px 0px 0px 5px;width:178px"), 
                            {
                                scriptClass: "mstrmojo.ValidationTextBox",
                                alias: "cnVTB",//config name validation text box
                                cssClass: "mobileconfig-TextBox",
                                required: true,
                                dtp: mstrmojo.expr.DTP.CHAR,
                                constraints: {
                                    trigger: mstrmojo.validation.TRIGGER.ALL
                                },
                                bindings: {
                                    value: "this.parent.parent.model.data.n"
                                },
                                onValid: function() {
                                	var m = this.parent.parent.model;
                                    util.setValidValue(m.data, 'n', this.value);
                                    m.validate();
                                },
                                onInvalid: function(){
                                	var m = this.parent.parent.model;
                                	if(m){
                                		delete m.data.n;
                                		m.set('validFlag', false);
                                	}
                                }
                            }
                       ]
           },
           {
                scriptClass: "mstrmojo.TabContainer",
                alias: "tabCtnr",
                cssClass: "mobileconfig-tabContainer",
                children: [ 
                {
                    scriptClass: "mstrmojo.TabStrip",
                    slot: "top",
                    autoHide: true,
                    target: this.parent.tabsstack
                }, 
                {
                    scriptClass: "mstrmojo.StackContainer",
                    slot: "stack",
                    alias: "tabsstack",
                    cssClass: "mstrmojo-StackContainer-Border",
                    border: "1px solid #AAAAAA",
                    
                    postCreate: function() {
                        var dvc = (mstrApp.device)?mstrApp.device:undefined;//get device requestkey param
                        
                        switch (dvc) {
                            case "3": //util.DEVICE_PHONE_UNIVERSAL
                            	mstrmojo.all.iPhone_tab.set("n", mstrmojo.desc(8453,"Phone Settings") );// Phone Settings
                            	
                            	// NOTE: intentional fall thru
                            	
                            case "1": //util.DEVICE_IPHONE
                                this.set("children", [ mstrmojo.all.iPhone_tab, mstrmojo.all.connect_tab, mstrmojo.all.iphoneHomescreen_tab ]);
                                break;
                                
                            case "4": //util.DEVICE_TABLET_UNIVERSAL
                            case "2": //util.DEVICE_IPAD
                            	mstrmojo.all.iPhone_tab.set("n", dvc == "2" ? mstrmojo.desc(7896) : mstrmojo.desc(8454, "Tablet Settings") );// iPad Settings / Tablet Settings
                                this.set("children", [ mstrmojo.all.iPhone_tab, mstrmojo.all.connect_tab, mstrmojo.all.ipadHomescreen_tab]);
                                break;
                                
                            case "5":
                                this.set("children", [ mstrmojo.all.BlackBerry_tab, mstrmojo.all.connect_tab]);
                                break;
                           default:break;
                        }
                        this.set('selected', this.children[0]);
                    }
                }]
           }, 
           {
                scriptClass: "mstrmojo.HBox",
                cssText: "margin-left:150px;margin-bottom:8px;height:25px",
                save: function(isClose) {
                    var getName = function(n, v, i){
                        if (n == 'pl'){
                            return 'prj';
                        }else if (n == 'tcs'){
                            return 'cer';
                        }else {
                            return n.substr(0, n.length -1);
                        }
                    },
                    
                    r = util.obj2Xml(this.parent.model.data, "cnf", true, false, null, getName);
                    
                    var that = this;
                    if (this.parent.model.data.cid) {
                        /**
                         * update an new configuration
                         */
                        mstrmojo.xhr.request("POST", 
                                mstrConfig.taskURL,
                                {
                                     success: function(response){
                                                    if (isClose) { that.parent.toConfList();}
                                                },
                                     failure: function(response){ 
                                                    util.showErrorMsgBox(response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                                }
                                },
                                {
                                    taskId: "updateMobileConfiguration",
                                    taskEnv: "xhr",
                                    configurationID: this.parent.model.data.cid,
                                    configurationXML: r
                                },
                                null,
                                null
                              );
                    } else {
                        /**
                         * create an new config
                         */
                        mstrmojo.xhr.request("POST", 
                                mstrConfig.taskURL,
                                {
                                     success: function(response){
                                                    if (isClose)  { that.parent.toConfList(); } 
                                                },
                                     failure: function(response){ 
                                                    util.showErrorMsgBox(response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                                }
                                },
                                {
                                    taskId: "createMobileConfiguration",
                                    taskEnv: "xhr",
                                    configurationXML: r
                                },
                                null,
                                null
                              );
                        return;
                    }
                },
                children: [ 
                {
                    scriptClass: "mstrmojo.Button",
                    cssClass: "mobileconfig-Button",
                    cssText: "margin-right:30px;font-weight:bold",
                    text: mstrmojo.desc(118),     //"Save",
                    bindings:{
                        enabled: "this.parent.parent.model.validFlag"
                    },
                    
                    onclick: function(evt) {
                       this.parent.save(true);
                    }
                }, 
                {
                    /**
                     * cancel to return the configuration list screen
                     */
                    scriptClass: "mstrmojo.Button",
                    cssText: "margin-left:30px;font-weight:bold",
                    cssClass: "mobileconfig-Button",
                    text: mstrmojo.desc(221),        //"Cancel",
                    onclick: function(evt) {
                        this.parent.parent.toConfList();
                    }
                }
              ]
           }
       ]
    });
})();