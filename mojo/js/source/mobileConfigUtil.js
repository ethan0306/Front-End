(function(){

    mstrmojo.requiresCls(
            "mstrmojo._CanValidate",
            "mstrmojo.Label",
            "mstrmojo.Obj",
            "mstrmojo.string",
            "mstrmojo.color",
            "mstrmojo.css",
            "mstrmojo.locales");

    // minor Hack for TQMS 431429: mstrmojo.locales.load requires a user session but we don't have one on the admin page. 
    mstrmojo.locales.validation.requiredFieldError = mstrmojo.desc(6078);
    mstrmojo.locales.validation.invalidCharError = mstrmojo.desc(7899);
    mstrmojo.locales.validation.integerDataType = mstrmojo.desc(6076);
    
    // callback function for session expired. This usually will be called while reusing the sessionstate for browsing objects.
    mstrApp.onSessionExpired = function(){
    	loginBox.lastProject = null;
    	loginBox.lastSession = null;
    	mobileConfigPopup.set("mode", POPUP_LOGIN);
    };
    
    var _S = mstrmojo.string,
     _CLR = mstrmojo.color,
    _H = mstrmojo.hash,
    _D = mstrmojo.dom;
    
    //TODO: change name to "autoLogin"
    function isLoginRequired(authMode){
        return (authMode != mstrmojo.mobileConfigUtil.PRJ_AUTHEN_WIN) 
                && (authMode != mstrmojo.mobileConfigUtil.PRJ_AUTHEN_TRUSTED);
    }
    
    // Constants for the mobile config popup
    var POPUP_CLOSED = 0,
        POPUP_LOGIN = 1,
        POPUP_OBJECTBROWSER = 2,
        POPUP_TRIGGERLIST = 3;
    
    // login box widget
    var loginBox = mstrmojo.insert({
        scriptClass: "mstrmojo.Table",
        id: "loginBox",
        alias: "loginBox",
        cssClass: "mobileConfig-loginBox",
        cellPadding: 2,
        cols: 2,
        rows: 5,
        onwaitChange: function(){
            this.waitIcon.set("visible", this.wait);
            mstrmojo.css.toggleClass(this.domNode, ["disabled"], this.wait);
        },
        restoreSession: function(){
        	// if the (pid, iserver name, auth mode) pair matches, we reuse that session.
        	var last = this.lastProject, 
        		curr = this.selectedProject,
        		flag = last && (last.v == curr.v) && (last.iServer == curr.iServer) && (last.authMode == curr.authMode);
        	if (flag){
        		this.sessionID = this.lastSession;
        	}
        	return flag;
        },
        closeSession: function(){
        	if (this.sessionID != null){
		    	if (mobileConfigPopup.opener.reuseSession){
		    		this.lastSession = this.sessionID;
		    		this.lastProject = this.selectedProject;
		    	}else{
		        	//Close the iserver session
		            mstrmojo.xhr.request('GET', mstrConfig.taskURL,
		                    {
		                        success: function(res){},
		                        failure: function(){}
		                    },
		                    {
		                        taskId: "closeSessions",
		                        sessionStates: this.sessionID
		                    },
		                    false, this.selectedProject.webServer);
		    	}
		    	this.sessionID = null;
		    }
        },
        children:[
                  {
                      scriptClass: "mstrmojo.Label",
                      cssText: "width: 80px; margin:0px",
                      text: mstrmojo.desc(4446), //"Project:"
                      slot: "0,0"
                  },
                  {
                      scriptClass: "mstrmojo.SelectBox",
                      alias: "projects",
                      cssText: "width:230px; margin:0px",
                      showItemTooltip: true,
                      size: 1,
                      bindings:{
                          visible: "!this.items || this.items.length != 1"
                      },
                      onitemsChange: function(){
                          if (this.items && this.items.length > 0){
                              this.set("selectedIndex", 0);
                          }
                      },
                      onchange: function(){
                          if (this.selectedItem){
                              var needLogin = isLoginRequired(this.selectedItem.authMode);
                              this.parent.set("selectedProject", this.selectedItem);
                              this.parent.uid.set("enabled", needLogin);
                              this.parent.password.set("enabled", needLogin);
                          }
                      },
                      slot: "0,1"
                  },
                  {
                      scriptClass: "mstrmojo.Label", //This will be shown when there is only one project
                      cssClass: "mobileConfig-loginBox-projectLabel",
                      bindings:{
                            visible: "!this.parent.projects.visible",
                            text: "this.parent.projects.items[0].n"
                        },
                      slot: "0,1"
                  },
                  {
                      scriptClass: "mstrmojo.Label",
                      cssText: "width: 80px; margin:0px",
                      text: mstrmojo.desc(1161), //"User name:"
                      slot: "1,0"
                  },
                  {
                      scriptClass: "mstrmojo.TextBox",
                      cssText: "width:220px; margin:0px",
                      alias: "uid",
                      onkeyup: function(evt){
                          var hWin = evt.hWin,
                              e = evt.e || hWin.event; 
                          if (e.keyCode === 13){
                              this.parent.loginButton.onclick();
                          }
                      },
                      slot: "1,1"
                  },
                  {
                      scriptClass: "mstrmojo.Label",
                      cssText: "width: 80px; margin:0px",
                      text: mstrmojo.desc(1162), //"Password:"
                      slot: "2,0"
                  },
                  {
                	  slot: "2,1",
                      scriptClass: "mstrmojo.TextBox",
                      cssText: "width:220px; margin:0px",
                      type: "password",
                      alias: "password",
                      onkeyup: function(evt){
                          var hWin = evt.hWin,
                              e = evt.e || hWin.event; 
                          if (e.keyCode === 13){
                              this.parent.loginButton.onclick();
                          }
                      }
                  },
                  {
                      slot: "3,1",
                      scriptClass: "mstrmojo.HTMLButton",
                      alias: "loginButton", 
                      text: mstrmojo.desc(4020), //"Login"
                      cssText: "margin-left: 20px;",
                      cssClass: "mstrButton",
                      bindings: {
                          enabled: "this.parent.projects.items.length > 0"
                      },
                      onclick: function(){
                          var objectBrowser = objectBrowserBox.objectBrowser,
                              needLogin = isLoginRequired(loginBox.selectedProject.authMode);
                          
                          mstrmojo.xhr.request('GET', mstrConfig.taskURL,
                                  {
                                      success: function(res){
                                          if (res != null){
                                        	  loginBox.sessionID = res.sessionState;
                                        	  mobileConfigPopup.set("mode", mobileConfigPopup.targetMode);
                                          }
                                      },
                                      failure: function(res){
                                          // TODO: a better way to show login error.
                                          // "Either your user name or password is incorrect. Please try again. Remember that the password is case sensitive."
                                          mstrmojo.mobileConfigUtil.showErrorMsgBox(mstrmojo.desc(422)); 
                                          mobileConfigPopup.close();
                                      },
                                      complete: function(){
                                          loginBox.set("wait", false);
                                      }
                                  }, 
                                  {
                                      taskId:"login",
                                      server: loginBox.selectedProject.iServer,
                                      project: loginBox.selectedProject.project,
                                      userid: (needLogin)? loginBox.uid.value : "", 
                                      password:  (needLogin)? loginBox.password.value : "",
                                      authMode: loginBox.selectedProject.authMode 
                                  }, 
                                  false, loginBox.selectedProject.webServer); // cross web-server request
                          loginBox.set("wait", true);
                      }
                  },
                  {
                      slot: "3,1",
                      scriptClass: "mstrmojo.HTMLButton",
                      cssText: "margin-left: 35px;", 
                      cssClass: "mstrButton",
                      text: mstrmojo.desc(221), //"Cancel"
                      onclick: function(){
                          mobileConfigPopup.close();
                      }
                  },
                  {
                      slot: "4,0",
                      scriptClass: "mstrmojo.WaitIcon",
                      alias: "waitIcon",
                      cssClass: "mobileConfig-waitIcon"
                  }
        ]
    });
    
    var objectBrowserBox = mstrmojo.insert({
            id: "objectBrowserBox",
            alias: "objectBrowserBox",
            scriptClass: "mstrmojo.VBox",
            callbackOnSelect: function(item){ 
                var currentFolder = this.objectBrowser.currentFolder,
                    anc = currentFolder.anc.items[0],
                    path = anc.n,
                    temp = anc.items && anc.items[0];
                
                while (temp){
                    path += "\\"+temp.n;
                    temp = temp.items && temp.items[0];
                }
                if (currentFolder != item){
                    path += "\\"+item.n;
                }
                
                // populate the basic object info
                var objInfo = {oi: {did:item.did, 
                                      pt: path, 
                                      pid: loginBox.selectedProject.v, 
                                      t: item.t,
                                      st: item.st,
                                      n: item.n,
                                      fid: item.pf || currentFolder.did } //item.pf is for the folder object, for other objects, we use their "currentFolder.did"
                                }; 
                
                if (mobileConfigPopup.opener.allowCheckSubscription){
                	objInfo.csp = true;
                }
                
                // get additional properties: abbreviation
            mstrmojo.xhr.request('GET', mstrConfig.taskURL,
                        {
                            success: function(res){
                                if (res!==null){
                                    objInfo.oi.ab = res.objects[0].ab;
                                }
                                // Update the model's value
                                var dropdown = mobileConfigPopup.opener,
                                    target = dropdown.target,
                                    targetType = dropdown.targetType,
                                    targetObj = target[targetType];
                                
                                if (!targetObj){
                                    target.set(targetType, new mstrmojo.Obj(objInfo));
                                }else{
                                    targetObj.set("oi", objInfo.oi);
                                    targetObj.set("csp", objInfo.csp);
                                }
                            },
                            failure: function(){
                            },
                            complete: function(){
                            	mobileConfigPopup.close();
                            }
                        },
                        {
                            taskId: "getObjectInfo",
                            objectIDs: item.did,
                            objectTypes: item.t,
                            sessionState: loginBox.sessionID
                        },
                        false, loginBox.selectedProject.webServer);
            }, //End of callbackOnSelect method
            onvisibleChange: function(){
                if (this.visible){ //when open
                     // Set request info for the object browser
                     var objectBrowser = this.objectBrowser;
                         objBrowserDP = objectBrowser.dataProvider,
                         objBrowserSearch = objectBrowser.searchUpBar.obSearchBox, 
                         config = {method: "GET",
                                     path: mstrConfig.taskURL,
                                  XServer: loginBox.selectedProject.webServer};
                     
                     _H.copy(config, objBrowserDP);
                     _H.copy(config, objBrowserSearch);

                     _H.copy({
                    	 onSelectCB: [objectBrowserBox, "callbackOnSelect"],
                    	 onCloseCB: [mobileConfigPopup, "close"],
                    	 browsableTypes: mobileConfigPopup.opener.browsableTypes
                     }, objectBrowser);
                     
                     objectBrowser.sId = objBrowserSearch.sessionState = loginBox.sessionID;
                     //TQMS 432699: Force to clear the searchBox's cache everytime openning the object browser
                     objBrowserSearch.searchCache = {};
                     objBrowserSearch.objectTypes = mobileConfigPopup.opener.browsableTypes;
                     
                     objectBrowser.browse();
                }
                
                this.objectBrowser.set("visible", this.visible);
                this.choose.set("visible", this.visible && this.objectBrowser.browsableTypes == '8');
                this.switcher.set("visible", this.visible);
            },
            children:[
                      {
                          id: "objectBrowser",
                          scriptClass : "mstrmojo.ObjectBrowser", 
                          alias: "objectBrowser",
                          folderLinksContextId : 14,
                          closeOnSelect: false,
                          useAnimate: false,
                          closeable: false
                      },
                      {
                          scriptClass: "mstrmojo.HTMLButton",
                          alias: "choose",
                          text: mstrmojo.desc(549), //"Current Folder"
                          cssClass: "mstrButton",
                          cssText: "width:100px",
                          onclick: function(){
                              this.parent.callbackOnSelect(this.parent.objectBrowser.currentFolder);
                          }
                       },
                       {
                          scriptClass: "mstrmojo.HTMLButton",
                          alias: "switcher",
                          text: mstrmojo.desc(221), //"Cancel"
                          cssClass: "mstrButton",
                          cssText: "width:80px",
                          onclick: function(){
                              mobileConfigPopup.close(); 
                          }
                      } 
              ]
        }); 
    
    var triggerSelectorBox = mstrmojo.insert({
        scriptClass: "mstrmojo.Table",
        id: "triggerSelectorBox",
        alias: "triggerSelectorBox",
        cssClass: "triggerSelectorBox",
        rows: 3,
        cols: 1,
        onvisibleChange: function(){
            if (this.visible){
                mstrmojo.xhr.request('GET', mstrConfig.taskURL, 
                        {
                            success: function(res){
                				var triggerList = triggerSelectorBox.triggerList;
                                if (res.objList){
                                    var notEmty = res.objList.length > 0;
                                	triggerList.set("items", notEmty? res.objList : []);
                                	triggerList.set("selectedIndex", notEmty? 0 : -1);
                                }
                            },
                            failure: function(){
                            }
                        },
                        {
                            taskId: "getSchedules",
                            sessionState: loginBox.sessionID
                        },
                        false, loginBox.selectedProject.webServer);
            }else{
            	this.set("items", null);
            }
        },
        children:[
                  {
                      slot: "0,0",
                	  scriptClass: "mstrmojo.Label",
                      cssClass: "triggerListTitle",
                      text: mstrmojo.desc(1090, "Choose a schedule:")
                  },
                  {
                	  slot: "1,0",
                	  scriptClass: "mstrmojo.SelectBox",
                	  alias: "triggerList",
                	  cssClass: "triggerList",
                	  size: 1,
                	  showItemTooltip: true,
                	  itemDisplayField: "n",
                	  itemIdField: "id"
                  },
                  {
                	  slot: "2,0",
                	  scriptClass: "mstrmojo.HTMLButton",
                      cssClass: "mstrButton",
                      cssText: "margin-left:10px; width:60px;",
                      text: mstrmojo.desc(1442, "OK"),
                      onclick: function(){
                          var item = this.parent.triggerList.selectedItem;
                          if (item){
                              var dropdown = mobileConfigPopup.opener;
                              dropdown.target.set(dropdown.targetType, {oi: {did:item.id, t: item.t, n: item.n}}); 
                          }
                          mobileConfigPopup.close();
                      }
                  },
                  {
                	  slot: "2,0",
                      scriptClass: "mstrmojo.HTMLButton",
                      cssClass: "mstrButton",
                      cssText: "margin-left:10px; width:80px",
                      text: mstrmojo.desc(221, "Cancel"),
                      onclick: function(){
                          mobileConfigPopup.close();
                      }
                  }]
    });

    var mobileConfigPopup = mstrmojo.insert({
        scriptClass: "mstrmojo.Popup",
        id: "mobileConfigPopup",
        cssClass: "mobileConfigPopup",
        slot: "popupNode",
        locksHover: true,
        mode: POPUP_CLOSED,
        children:[ loginBox, objectBrowserBox, triggerSelectorBox ],
        onOpen: function(){
            // place the popup under the new dropdown button.    
            this.lastOpener = this.lastOpener || this.opener;
            if (this.opener !== this.lastOpener) {
                this.opener.popupNode.appendChild(this.lastOpener.popupRef.domNode);
                this.lastOpener = this.opener;
            }
            
            this.loginBox.projects.set("items", mstrmojo.all.mobileConfig.getProjects(this.opener.target.pid, this.opener.target.sn));

            this.targetMode = this.opener.mode; //Which box(Object browser or trigger list?) to display after user login.
            
            // If reuseSession is configured, we would try to restore the previous session and use it in the task request.
            this.set("mode", (this.opener.reuseSession && loginBox.restoreSession()) ? this.targetMode : POPUP_LOGIN);
        },
        onmodeChange: function(){
            this.set("left", this.mode===POPUP_LOGIN?"-305px":"-175px");
            //TQMS 517663: In Chrome/Safari, we need to lift the popup position so that it could be shown up completely 
            this.set("top", (this.mode !== POPUP_LOGIN && mstrmojo.dom.isWK) ? "-35px":"0px");
            this.objectBrowserBox.set('visible', this.mode===POPUP_OBJECTBROWSER);
            this.loginBox.set('visible', this.mode===POPUP_LOGIN);
            this.triggerSelectorBox.set("visible", this.mode===POPUP_TRIGGERLIST);
        },
        onClose: function(evt){
            this.loginBox.closeSession();
            this.set("mode", POPUP_CLOSED);
        },
        //The popup is a shared widget, so we need to override destroy/unrender to prevent the garbage collection.
        destroy: function(){
            // IE HACK: 1) add the domNode to the document body to avoid being recycled, 
            // 2) change the value of the lastOpener for the future use. 
            document.body.appendChild(this.domNode);
            this.lastOpener = {popupRef:{domNode:this.domNode}};
        },
        unrender: function(){}
    });

    var createDropDown = function(prop, targetMode){
    	return _H.copy(prop, {
            scriptClass: "mstrmojo.DropDownButton",
            cssClass:"mobileConfig-popupButton",
            text:"   ",
            title:"",
            mode: targetMode,
            popupRef: mobileConfigPopup
        });
    };
    
    /**
     * <p>A static utility class for Mobile Config.</p>
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.mobileConfigUtil = mstrmojo.provide(
            "mstrmojo.mobileConfigUtil",
            {
                
                //constants
                /**
                 * Supported device
                 */
                DEVICE_IPHONE: 1,
                DEVICE_IPAD: 2,
                DEVICE_PHONE_UNIVERSAL: 3,
                DEVICE_TABLET_UNIVERSAL: 4,
                DEVICE_BLACKBERRY: 5,
                
                /**
                 * Default configuration types
                 */
                DEFAULT_WEBSERVER: 1,
                DEFAULT_PROJECT: 2,
                DEFAULT_IPHONE_HOMESCREEN_BUTTON: 3,
                DEFAULT_IPHONE_CUSTOM_HOMESCREEN: 4,
                DEFAULT_IPAD_HOMESCREEN_BUTTON: 5,
                DEFAULT_IPAD_CUSTOM_HOMESCREEN:6,
                DEFAULT_PHONE_UNIVERSAL_CUSTOM_HOMESCREEN: 7,
                DEFAULT_TABLET_UNIVERSAL_CUSTOM_HOMESCREEN: 8,
                DEFAULT_IPAD_PRECACHE_BUTTON: 9999, //It doesn't have a corresponding value on the web server, we just populate it on client side. 
            
                /**
                 * Homescreen types
                 */
                HOMESCREEN_DEFAULT: 1,
                HOMESCREEN_CUSTOM: 2,
                HOMESCREEN_RD: 3,
                HOMESCREEN_FOLDER: 4,
            
                /**
                 * Action types
                 */
                ACT_BROWSEFOLDER: 1, 
                ACT_RUNREPORT: 2, 
                ACT_FAVOURITES: 3, 
                ACT_SETTINGS: 4, 
                ACT_SHAREDLIBRARY: 5,
                ACT_HELP: 6, 
                ACT_CLOUD: 7,
            
                /**
                 * Button style value
                 */
                STYLE_GLASS: 3,
                STYLE_FLAT: 2, 
                STYLE_NONE: 1,
                
                /**
                 * Background fill types 
                 */
                FILL_SOLID: 0,
                FILL_TRANSPARENT: 1,
                FILL_GRADIENT: 2,
            
                /**
                 * Background types
                 */
                BACKGROUND_FILL: 1,
                BACKGROUND_IMAGE: 2,
                
                /**
                 * Title bar types
                 */
                TITLEBAR_REGULAR: 1,
                TITLEBAR_IMAGE: 2,
                
                /**
                 * Button icon types
                 */
                ICON_DEFAULT: 1,
                ICON_IMAGE: 2,
                
                /**
                 * Help action types
                 */
                ACT_HELP_DEFAULT: 1,
                ACT_HELP_DOCUMENT: 2,
                
                
                /**
                 * Logging level value
                 */
                LOGGING_LEVEL_WARNING: 12,
                LOGGING_LEVEL_ERROR: 14,
                LOGGING_LEVEL_MESSAGES: 10,
                LOGGING_LEVEL_ALL: 0,
                LOGGING_LEVEL_OFF: 16,
                
                /**
                 * Memory limit unit
                 */
                MEM_UNIT_MB: 1,
                MEM_UNIT_GB: 2,
                
                /**
                 * Password Expiration time unit
                 */
                TIME_UNIT_DAYS: 1,
                TIME_UNIT_HOURS: 2,
                TIME_UNIT_MINUTES: 3,
                
                /**
                 * Web server authentication mode
                 */
                AUTHEN_ANONY: 1,
                AUTHEN_BASIC: 2,
                AUTHEN_WIN: 3,
                
                /**
                 * Project authentication mode
                 */
                PRJ_AUTHEN_STD: 1,
                PRJ_AUTHEN_WIN: 2,
                PRJ_AUTHEN_LDAP: 16, 
                PRJ_AUTHEN_DB: 32,
                PRJ_AUTHEN_TRUSTED: 64,
                
                /**
                 * Web server type
                 */
                SRV_ASP: 1,
                SRV_J2EE: 0,
                
                /**
                 * Request type
                 */
                REQ_HTTP: 0,
                REQ_HTTPS: 1,
                
                /**
                 * Cache PreLoad Modes
                 */
                CACHE_PRELOAD_AUTO: 1,
                CACHE_PRELOAD_OFF: 2,
                
                /**
                 * Cache Clear Modes
                 */
                CACHE_CLEAR_AUTO: 1,
                CACHE_CLEAR_ONCLOSE: 2,
                
                /**
                 * Enable Push Notification
                 */
                PUSH_NOTIFICATION_ON: 1,
                PUSH_NOTIFICATION_OFF: 2,
                
                //util functions
                
                createObjBrowserDropdown: function(prop){
                    return createDropDown(prop, POPUP_OBJECTBROWSER);
                },
                
                createTriggerListDropdown: function(prop){
                    return createDropDown(prop, POPUP_TRIGGERLIST);
                },
                
                makeButtonHashable: function(button){
                    this.makeHashable(button);
                    this.makeHashable(button, ["cap","dsc","act","icn"]);
                    this.makeHashable(button.act,["hlp", "rs", "fd"]);
                    this.makeHashable(button.act.rs, ["pcf"]);
                    this.makeHashable(button.icn,["img"]);
                    return button;
                },
            
                makeCSTHomescreenHashable: function(homescreenSetting){
                    this.makeHashable(homescreenSetting);
                    this.makeHashable(homescreenSetting, ["rs", "fd"]);
                    
                    if (homescreenSetting.cst){
                        var formatSetting = homescreenSetting.cst.fmt;
                        this.makeHashable(formatSetting);
                        this.makeHashable(formatSetting, ["btn","bkg","ttl","vw"]);
                        this.makeHashable(formatSetting.bkg, ["fll", "img"]);
                        this.makeHashable(formatSetting.ttl, ["cap", "img"]);
                        this.makeHashable(formatSetting.btn, ["fnt", "brd", "fll"]);
                        
                        for (var i=0, len=homescreenSetting.cst.btns.length;i<len;i++){
                            this.makeButtonHashable(homescreenSetting.cst.btns[i]);
                        }
                    }else if (homescreenSetting.rs ){
                    	if( homescreenSetting.rs.sobs ) {
	                        var supportObjs = homescreenSetting.rs.sobs;
	                        
	                        for (var i=0, len=supportObjs.length; i < len; i++){
	                            this.makeHashable(supportObjs[i]);
	                            this.makeHashable(supportObjs[i], ["fd", "rs"]);
	                            if (supportObjs[i].rs){
	                                this.makeHashable(supportObjs[i].rs, ["pcf"]);
	                            }
	                        }
                    	}
                    	if( homescreenSetting.rs.pb ) {
                    		this.makeHashable(homescreenSetting.rs,["pb"]);
                    	}
                    }
                },
                
                /**
                 * Use "mstrmojo.hash.make" to make plain object observable.
                 * If properties parameter is presented, make jsonObj's properties observable,
                 * Otherwise, make jsonObj observable.
                 * @param {Object} jsonObj
                 * @param {Array} properties
                 */
                makeHashable: function(jsonObj, properties){
                    if (!jsonObj){
                        return;
                    }else if(properties === undefined){
                        _H.make(jsonObj, mstrmojo.Obj);
                    }else{
                        for (var i=0, len=properties.length; i<len; i++){
                            var p = properties[i];
                            if (p in jsonObj){
                                _H.make(jsonObj[p], mstrmojo.Obj);
                            }
                        }
                    }
                },
                
                /**
                * Convert the gradient(linear vertical only) between its object and css representation.
                * Gradient object: {sclr:#000000, eclr:#FFFFFF}
                * Gradient css: according to the browser type. String format: "style_name:style_value"
                * @param {object/string} gradient
                */
                transformGradient: function(gradient){
                    if (typeof gradient === "object"){
                        var css = mstrmojo.css.buildGradient(0, _CLR.decodeColor(gradient.sclr), _CLR.decodeColor(gradient.eclr));
                        return css.n + ":" + css.v;
                    }else if (typeof gradient == "string"){
                        var colors = gradient.match(/#\w{6}/g);
                        if (colors!==null && colors.length==2){
                            return {sclr: _CLR.encodeColor(colors[0]), eclr: _CLR.encodeColor(colors[1])};
                        }
                    }
                    return "";
                },
                
                /**
                 * Whether to transfer base authentication info
                 */
                getTransferAuth: function getTransferAuth(webSvr){
                    var am = (webSvr.udc === true)? mstrmojo.all.mobileConfig.data.cty.wsdc.am : webSvr.wsc.am;
                    return (am === this.AUTHEN_BASIC)? { transferAuthHeader: "1" }: null;
                },
                
                /**
                 * Show error message in a pop up confirm box.
                 */
                showErrorMsgBox: function showErrorMsgBox(err) {
                       if (!err) {
                           return;
                       }
                        var msgBox = mstrmojo.all.mobileConfigTaskError; //Only one error msg box
                        
                        if (msgBox) {
                            var orgTxt = msgBox.children[0].text;
                            if (orgTxt != err) {
                                msgBox.children[0].set('text', orgTxt + err);
                            }
                            
                        } else { //create a error msgbox
                            
                                // Show the dialog.
                                mstrmojo.insert({
                                    scriptClass: "mstrmojo.Dialog",
                                    id: "mobileConfigTaskError",
                                    title: mstrmojo.desc(3610),
                                    width: "475px",
                                    btnAlignment: "right",
                                    cssText: "border:1px solid #AAAAAA;",
                                    buttons: [
                                              {
                                                  scriptClass: "mstrmojo.HTMLButton",
                                                  cssText: "margin-bottom:2px",
                                                  text: mstrmojo.desc(1442),
                                                  preBuildRendering: function() {
                                                      this.cssClass = "mobileconfig-Button";
                                                  },
                                                  postBuildRendering: function() {
                                                      this.domNode.focus();
                                                  },
                                                  onkeyup: function(evt) {
                                                      var hWin = evt.hWin,
                                                      e = evt.e || hWin.event; 
                                                      if (e.keyCode === 13){
                                                          this.onclick();
                                                      }
                                                  },
                                                  onclick: function(evt){
                                                      mstrmojo.all.mobileConfigTaskError.destroy();
                                                  }
                                              }
                                              ],
                                    children: [{
                                                    scriptClass: 'mstrmojo.Label',
                                                    text: err
                                                }]
                                }).render();
                        }
                },
                
                /**
                 * Check if it's asp server.
                 */
                isASP: function isASP() {
                    return (window.location.pathname.indexOf('/asp/') > 0)? true : false;
                },
                
                /**
                 * generate URL for web server task call 
                 * @param {Object} item 
                 */
                getWebSrvUrl: function getWebSrvUrl(item) {
                        return  ((parseInt(item.rt,10) === 0)? 'http':'https' )+ '://'+item.nm+':'+item.po+'/'+item.pt+((parseInt(item.ty,10) === 0)? '/servlet/taskProc':'/asp/taskProc.aspx');
                },
                
             
                
                /**
                 * set trimed valid value to corresponde property on model for TextBox.
                 * @param {Object} modelProp The reference to parent model object
                 * @param {String} n Property Name
                 * @param {String} v Property value, if it is missed, use input value from text box.
                 * @param {Boolean} raiseEvent Whether an event needs to be raised for this set value change
                 */
                setValidValue: function setValidValue(modelProp, n, v, raiseEvent) {
                    if (!modelProp) {
                        return;//no need to set
                    }
                    
                    v = (v != null)? _S.trim(v) : '';
                    
                    if(raiseEvent && modelProp.set) {
                       modelProp.set(n, v);
                    } else {
                       modelProp[n] =  v;
                    }
                },
                
                /**
                 * Validate server port input, which should be >0 and < 65536.
                 * @param {String} v Input
                 */
                validatePort: function validatePort(v) {
                    v = parseInt(v, 10);
                    if (v < 0 || v > 65535) {
                        return false;
                    }
                },
                
                /**
                 * A general validator for setting constrains: { validator: function {}} for validation TextBox
                 * 
                 * @param {String} v The input from text box
                 * @param {String} type The expect input type, refer to mstrmojo.expr.DTP
                 * @param {Object} custom_expr A custom funtion to indicate invalid by return false
                 * @param {String} invalid_msg The message to tell user that the input is invalid
                 * @return {Object} r An Object for validation TextBox contain validating result
                 */
                generalValidator: function generalValidator(v, type, custom_expr, invalid_msg) {
                    
                    var r = {id: this.id, code : mstrmojo.validation.STATUSCODE.VALID, msg: ''}; 
                    
                    if (type === mstrmojo.expr.DTP.INTEGER) {
                        v = parseInt(v, 10);
                    }
                    
                    if (custom_expr && custom_expr(v) === false) {
                        r.code = mstrmojo.validation.STATUSCODE.INVALID_VALIDATOR;
                        r.msg = invalid_msg;
                    }
                    
                    return r;
                },
                
                
                /**
                 * generate an JSON object for a Label
                 * 
                 * @param {String} text The label text value
                 * @param {String} slot Indicate the slot position for this label to be put into
                 * @param {String } cssText 
                 * @return {Object} r An object for Lable
                 */
                propertyName: function propertyName(text, slot, cssText, bindings) {
                    return {scriptClass:"mstrmojo.Label", text: text, cssText : cssText, slot : slot , bindings: bindings};
                },
                
                /**
                 * Convert mojo obj to unicode encoded  xml
                 * @param v {Object} Required. Obj to be converted.
                 * @param root {String} Required. Root node name
                 * @param hasStatement {Boolean} Required. if contain encoding statement.
                 * @param isSkipNull {Boolean} Required. if skip null value
                 * @param removedProp {Object} Object indicate property name which should not be serialized in xml.
                 * @param getName {Object} Function that return attribute name in xml for a specific property.
                 * @return
                 */
                obj2Xml: function obj2Xml(v, root, hasStatement, isSkipNull, removedProp, getName) {
                    
                    var r = hasStatement? '<?xml version="1.0" encoding="UTF-8"?>' : '',
                    removed = removedProp? removedProp : 
                                        {//model properties which do not want to serialized.
                                                _meta_usesSuper: false,
                                                id: false,
                                                scriptClass: false,
                                                audibles: false,
                                                attachEventListener: false,
                                                destroy: false,
                                                detachEventListener: false,
                                                init: false,
                                                raiseEvent: false,
                                                set: false,
                                                defaultSrv: false, 
                                                defaultPrj: false,
                                                defaultButton: false,
                                                validFlag: false,
                                                dead: false,
                                                pdn: false
                                        },
                    config = {
                            getArrItemName: 
                                getName? getName : 
                                               function(n,v,i) {
                                                   return n.substr(0, n.length -1);
                                                },
                                                
                            isSerializable: function(nodeName, jsons, index) {
                                                        return (removed[nodeName] === false)? false : true;
                                                },
                            skipNull: isSkipNull,
                            convertBoolean: false
                            };
                     
                     r += _S.json2xml(root, v, config);
                     
                     return r;
                }
            }
    );
    
})();
