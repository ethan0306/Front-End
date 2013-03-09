(function() {
    
    mstrmojo.requiresCls("mstrmojo.ServerProxy",
                         "mstrmojo.Button",
                         "mstrmojo.TextBoxWithLabel",
                         "mstrmojo.Label",
                         "mstrmojo.hash",
                         "mstrmojo.mstr.EnumWebAPIErrorCodes");

    mstrmojo.requiresDescs(17,18,26);

    var $mobileLogin = 'mobileLogin',
        $chgPassword = 'changePassword',
        $BTN = mstrmojo.Button.newAndroidButton,
        $H = mstrmojo.hash,
        sessions = {},
        localeInfoMap = {},
        EnumPasswordDlgType = {
            OLD_PASSWORD: 0,
            NEW_PASSWORD: 1,
            CONFIRM_NEW_PASSWORD: 2
        },
        //Contains boolean values keyed by project Id. The value true for a given project indicates that postLogin was called successfully 
        //for it. This is necessary for off-line mode to prevent calling postLogin multiple times.
        postLoginFlag = {};
            
    /**
     * Get user runtime info after login. Used for drilling when using binary format.
     * 
     * @param {Object} request The request created in the {@link mstrmojo.MobileServerProxy.request} method.
     */
    function getProjectSettings(request) {
        var me = this,
            projectId = request.pid,
            realPid = request.params.projectID,
            requestId = request.id,
            sessionState = sessions[projectId],
            realPid = request.params.projectID,
            params = {
                taskId: 'getProjectSettings'
            };
        
        if ( sessionState ) {
            params.sessionState = sessionState;
        } else {
            //Offline mode
            params.projectID = realPid;
        }
        mstrApp.serverRequest(
            params, 
            { //Callback
                success: function (response) {
                    postLoginFlag[projectId] = true;
                    me.transport.serverRequest(me.id, requestId, request);
                },
                failure: function (response) {
                    var callback = request.callback;                
                    
                    if (callback.failure !== undefined) {
                        callback.failure(response);
                    }
                    
                    callback.complete(requestId);
                }
            },
            { //Config
                //We shall submit it immediately without checking session state otherwise we will
                //get into infinite loop in off-line mode
                skipLogin : true
            });
    }
    
    function setLocaleInfo(params) {
    	var locStr = String(mstrMobileApp.getLocaleInfo());

    	if(locStr) {
    		var locArr = locStr.split(',');

    		for(var i = 0; i < locArr.length; i++) {
    			var locInfo = locArr[i].split(':');
    			params[locInfo[0]] = locInfo[1];
    		}
    	}
    	return params;
    }

    function notifyUserNewPasswordRequired(params,cb) {
        var dialog,
            items = [],
            dialogConfig = {
                id: "new_pwd_reqd",
                title: mstrmojo.desc(5088),
                cssClass: 'mstrmojo-LoginDialog',
                loginInfo: params.loginInfo
            },
            loginInfo = params.loginInfo,
            fnOK = function(p,callback) {
                return function() {
                    callback(p);
                };
            }(params,cb);
            
        // push the edit box item (with label) for the password
        items.push( {
            scriptClass: "mstrmojo.Label",
            cssClass: 'mstrmojo-LoginDialog-Label',
            text: "You must supply a new password."
        });

        dialogConfig.children = items;
        
        // Add Ok and Cancel buttons.
        dialogConfig.buttons = [
            $BTN(mstrmojo.desc(1442, 'OK'), fnOK, { enabled: true } ),
            $BTN(mstrmojo.desc(221, 'Cancel'), function() {
                // user clicked the cancel button; indicate that we are manually closing the dialog
                // as a side effect of cancelling all pending connections
                dialog.manualClose = true;
                mstrApp.cancelPending();
            }  )
        ];
    
        dialog = mstrApp.showDialog(dialogConfig);
    }

    function doPasswordDialog(params,cb) {
        var dialog,
            items = [],
            dialogConfig = {
                id: "password_prompt" + mstrmojo.now(),
                title: params.title,
                cssClass: 'mstrmojo-LoginDialog',
                loginInfo: params.loginInfo
            },
            loginInfo = params.loginInfo,
            fnOK = function(p,callback) {
                return function() {
                    var ch = dialog.children,
                        pe = ch[0];
                    
                    switch( p.dlgType ) {
                        case EnumPasswordDlgType.OLD_PASSWORD:
                            loginInfo.pwd = pe.value;
                            break;
                        case EnumPasswordDlgType.NEW_PASSWORD:
                            loginInfo.npwd = pe.value;
                            break;
                    }
                    if ( pe.value.length > 0 ) {
                        callback(p);
                    }
                };
            }(params,cb);            
            
        // push the edit box item (with label) for the password
        items.push( {
            scriptClass: "mstrmojo.TextBoxWithLabel",
            label: mstrmojo.desc(18) + ":",
            value: loginInfo.pwd,
            type: "password",
            onvalueChange: function() {
                if ( params.dlgType == EnumPasswordDlgType.CONFIRM_NEW_PASSWORD ) {
                    this.parent.children[1].children[0].set("enabled",this.value == loginInfo.npwd );
                }
            }
        });

        dialogConfig.children = items;
        
        // Add Ok and Cancel buttons.
        dialogConfig.buttons = [
            $BTN(mstrmojo.desc(1442, 'OK'), fnOK, { enabled: (params.dlgType != EnumPasswordDlgType.CONFIRM_NEW_PASSWORD) } ),
            $BTN(mstrmojo.desc(221, 'Cancel'), function() {
                mstrApp.cancelPending();
            }  )
        ];
    
        dialog = mstrApp.showDialog(dialogConfig);
    }
    
    
    /**
     * Handles the "password expired" error case when logging in.  Does six things:
     *  1. Alerts user that a new password is required
     *  2. Prompts the user for the old password
     *  3. Prompts the user for the new password
     *  4. Confirms the new password
     *  5. Sends "changePassword" task to the server
     *  6. Updates and saves the device configuration with the new password
     *
     */
    
    function handleExpiredPassword(request) {
        
        var cfg = this._mobileCfg,
            projectId = request.pid,
            project = cfg.getProject(projectId),
		    params = {
                cfg: cfg,
                projectId: projectId,
                project: project,
                transport: this.transport,
                loginInfo: cfg.getLoginInfo(projectId)
             },
             me = this;
        
        // alert the user that a new password is required
        notifyUserNewPasswordRequired( params, function(params) {
            
            // prompt the user for the old password
            doPasswordDialog( $H.copy({ title: "Enter your old password", 
                                        dlgType: EnumPasswordDlgType.OLD_PASSWORD }, params ), function(params) {
    
                // prompt the user for the new password
                doPasswordDialog( $H.copy({ title: "Enter your new password", 
                                            dlgType: EnumPasswordDlgType.NEW_PASSWORD }, params ), function(params) {
                                     
                    // prompt the user to confirm the new password
                    doPasswordDialog( $H.copy( { title: "Confirm your new password", 
                                                dlgType: EnumPasswordDlgType.CONFIRM_NEW_PASSWORD }, params ), function(params) {

                        // success callback - called when password changed on the server                        
                        var fnSuccess = function(p) {
                            return function(res) {
                                var npwd = p.loginInfo.npwd;
                                
                                // update the device configuration with the new password
                                if ( project.udc ) {
                                    var server = cfg.getServerByProjectId(projectId);
                                    server.pdc.ps = npwd;
                                } else {
                                    project.pc.ps = npwd;
                                }
                                cfg.saveConfiguration();
                                
                                // re-attempt the login with the updated password
                                request.params.password = npwd;                            
                                login.call(me,request);
                            };
                        }(params),
                        
                        // failure callback - called when password could not be changed on server, usually due to bad 'old password'
                        fnFailure = function(res) {
                            var callback = request.callback;
                            
                            // Failed so call the original failure callback.
                            if (callback.failure !== undefined) {
                                callback.failure(res);
                            }
                            
                            // Call the complete callback as well.  Don't need to test for handler because the
                            // _super added one in the request method.
                            callback.complete(request.id);
                        };
                        
                        // Invoke "changePassword" task to update the password on the server
                        me.request( {
                            success: fnSuccess,
                            failure: fnFailure
                        }, {
                            taskId: $chgPassword,
                            server: params.project.sn,
                            userid: params.loginInfo.uid,
                            oldPassword: params.loginInfo.pwd,
                            newPassword: params.loginInfo.npwd                        
                        },
                        false, {
                            projectId: projectId,
                            mobileConfig: cfg
                        });
                    });
                     
                });
    
            });
             
        });     
    }

    /**
     * prompts the user for login name and password.  Returns FALSE if user cancels.
     */    
    function promptForCredentials(li,cb) {
        var dialog,
            items = [],
            dialogConfig = {
                id: "user_creds_prompt",
                title: mstrmojo.desc(26),
                cssClass: 'mstrmojo-LoginDialog',
                loginInfo: li
            },
            loginInfo = li,
            callback = cb,
            
            // function called when user clicks OK.  If user name length is non-zero we proceed to call the callback function provided
            fnOK = function() {
                var ch = dialog.children,
                    ne = ch[0], // name edit
                    pe = ch[1];

                loginInfo.uid = ne.value;
                loginInfo.pwd = pe.value;
                if ( ne.value.length > 0 ) {
                	window.setTimeout(function() { //#528431  Please don't change the timeout it should be 100 for this issue
                		callback();
                	},100);
                }
            };
            
        // push the edit box item (with label) for the user name, if the user name length is zero we disable the OK button
        items.push( {
            scriptClass: "mstrmojo.TextBoxWithLabel",
            cssDisplay: "block",
            label: mstrmojo.desc(17) + ":",
            value: loginInfo.uid,
            type: "text",
            onRender: function () {
                // Set focus to input element.
                this.focus();
            },
            onvalueChange: function() {
                this.parent.children[2].children[0].set("enabled",this.value.length > 0);
            }
        });

        // push the edit box item (with label) for the password
        items.push( {
            scriptClass: "mstrmojo.TextBoxWithLabel",
            label: mstrmojo.desc(18) + ":",
            value: loginInfo.pwd,
            type: "password"
        });

        dialogConfig.children = items;
        
        // Add Ok and Cancel buttons.
        dialogConfig.buttons = [
            $BTN(mstrmojo.desc(1442, 'OK'), fnOK, { enabled: false } ),
            $BTN(mstrmojo.desc(221, 'Cancel'), function() {
                // user clicked the cancel button; indicate that we are manually closing the dialog
                // as a side effect of cancelling all pending connections
                dialog.manualClose = true;
                mstrApp.cancelPending();
            }  )
        ];
    
        dialog = mstrApp.showDialog(dialogConfig);
    }
        
    /*
     * Checks if we can use a cache. Called when we cannot get session state
     */
    function canUseCache(request) {
        var cfg = this._mobileCfg,
            pid = request.pid,
            project = cfg.getProject(pid),
            realPid = project.realPid,
            loginInfo = cfg.getLoginInfo(pid);

        //We can use cache if the project has real project ID and if login info contains user ID
        if ( mstrApp.useBinaryFormat && realPid && loginInfo.uid) {
            request.params.projectID = realPid;
            return true;
        }
        return false;
    }
    
    /**
     * Postprocessing after successful login. It is also called in offline mode or
     * if login failed but we can use caches
     */
    function postLogin(request) {
        var me = this,
            cfg = me._mobileCfg,
            projectId = request.pid,
            realPid = request.params.projectID,
            transport = me.transport,
            id = me.id,
            callback = {
                success: function(res){
                    // Cache it for future use
                    var l = localeInfoMap[projectId] = mstrmojo.hash.obj2array(res);
                    mstrmojo.hash.copy(l, mstrmojo.locales);
                    
                    if ( mstrApp.useBinaryFormat ) {
                        // If using binary format, then get user runtime first.
                        getProjectSettings.call(me, request);
                    } else {
                        postLoginFlag[projectId] = true;
                        // Submit the request.
                        transport.serverRequest(id, request.id, request);
                    }
                },
                failure: function(response){
                    var cb = request.callback;
                    
                    if (cb.failure !== undefined) {
                        cb.failure(response);
                    }
                    
                    cb.complete(request.id);
                }
            },
            params = {
                taskId: 'getLocaleInfo'
            },
            config = {
                projectId: projectId,
                mobileConfig: cfg,
                //We shall submit it immediately without checking session state otherwise we will
                //get into infinite loop in off-line mode
                skipLogin : true
            };
        if ( realPid) {
            params.projectID = realPid;
        }
        // Invoke "getLocaleInfo" task to get mstrmojo.locales instance.
        me.request(callback, params, false, config);
    }
    /**
     * Logs into the server/project for the passed in requests and submits the request if login succeeds.
     * 
     * @param {Object} request The request created in the {@link mstrmojo.MobileServerProxy.request} method.
     */
    function login(request) {
        var me = this,
            cfg = me._mobileCfg,
            projectId = request.pid,
            project = cfg.getProject(projectId),
            transport = me.transport,
            id = me.id,
            loginInfo = cfg.getLoginInfo(projectId),
            doLogin = function(){
                project.posLoginFlag = false;
                var loginCallback = {
                        success: function(res) {
                            //Save real project ID
                            cfg.setRealPid(project, res.projectID);
                            // Cache the sessionState.
                            var sessionState = sessions[projectId] = res.sessionState;
                            mstrMobileApp.putSession(projectId, sessionState);
                            
                            // Add the new sessionState to the request.
                            request.params.sessionState = sessionState; 
                            
                            postLogin.call(me, request);
                            
                        },
                        failure: function (res) {
                            var callback = request.callback,
                                canUseCacheFlag = canUseCache.call(me, request);
                            
                            // Failed so call the original failure callback.
                            if (callback.failure !== undefined) {
                                //Suppress error messag
                                res.noErrorMessage = canUseCacheFlag;
                                callback.failure(res);
                            }
                            
                            // Call the complete callback as well.  Don't need to test for handler because the
                            // _super added one in the request method.
                            callback.complete(request.id);
                            
                            //TQMS 515357
                            //If we can use cashes, then we still can submit request.
                            //Otherwise we shall report an error.
                            if ( canUseCacheFlag ) {
                                postLogin.call(me, request);
                            } else {
                                res.method = "login";
                                // Ask the app to handle the error.
                                mstrApp.onerror(res);
                            }
                        }
                    },
                    loginParams = setLocaleInfo({
                        taskId: $mobileLogin,
                        server: project.sn,
                        project: project.pn,
                        userid: loginInfo.uid,
                        password: loginInfo.pwd,
                        //TQMS 491366
                        wsSize: 10,
                        //TQMS 504283
                        authMode: loginInfo.am,
                        
                        //TQMS 507404
                        wsuid: loginInfo.wsuid,
                        wspwd: loginInfo.wspwd,
                        wsam: loginInfo.wsam
    
                        
                    }),
                    loginConfig = {       
                        projectId: projectId,
                        mobileConfig: cfg
                    };
                me.request(loginCallback, loginParams, false, loginConfig); // Submit false so we don't override the current request.       
            };
            
        if ( !loginInfo.uid  ) {
            promptForCredentials.call(this, loginInfo, doLogin);
        } else {
            doLogin();
        }        
    }
    
    /**
     * Proxy object to handle Mobile server requests.
     * 
     * @class
     * @extends mstrmojo.ServerProxy
     */
    mstrmojo.MobileServerProxy = mstrmojo.declare(
        mstrmojo.ServerProxy,

        null,

        /**
         * @lends mstrmojo.MobileServerProxy.prototype
         */
        {
            scriptClass: "mstrmojo.MobileServerProxy",
            
            getSessions: function() {
                return sessions;
            },            
            
            /**
             * @override to cache project id for request object.
             * @ignore
             */
            request: function request(callback, params, override, config) {
                // Store the project Id so it can be added to the request object.
                this._projectId = config.projectId;
                
                // Store the mobile configuration so it can be used to assemble requests.
                this._mobileCfg = config.mobileConfig;

                this._super(callback, params, override, config);
            },

            /**
             * @override To add custom request properties for Mobile applications.
             * @ignore
             */
            createRequest: function createRequest(requestId, callback, params, config) {
                var request;
                try {
                    // Get default request.
                    request = this._super(requestId, callback, params, config);
    
                    // Add mobile specific properties to the default request.
                    var projectId = this._projectId;
                    request.pid = projectId;
                    request.taskURL = this._mobileCfg.getTaskUrlByProject(projectId);
                    request.isLogin = (params.taskId === $mobileLogin);
                    request.isPwdChange = (params.taskId == $chgPassword);
                    
                } catch(ex) {                    
                    // delete the request from the collection since we have failed to create it completely
                    this.deleteRequest(requestId); 
                    throw ex;
                }
                
                // Return request.
                return request;
            },
            
            /**
             * @override To add session state and login automatically is session state is missing.
             * @ignore
             */
            submitRequest: function submitRequest(request) {
                // Is this a login request.
                if (request.isLogin || request.isPwdChange  ) {
                    // Submit request...
                    this._super(request);
                    
                    // and exit, no more to do.
                    return;
                }
                
                // Try to retrieve session based on project Id.
                var state = sessions[request.pid],
                    localeInfo = localeInfoMap[request.pid];
                  
                // Do we already have a session for this project?
                if (state) {
                    // Add session state to params.
                    request.params.sessionState = state;
                    
                    if (localeInfo){
                        mstrmojo.hash.copy(localeInfo, mstrmojo.locales);
                    }
                                              
                      // Submit request using super.
                    this._super(request);
                    
                } else {
                    if ( request.config.skipLogin ) {
                        this._super(request);
                        return;
                    }
                    if ( mstrMobileApp.isOnline() ) {
                        // We don't have session state so we need to login first.  The login method will automatically 
                        // submit the request if the login succeeds.
                        login.call(this, request);
                    } else {
                        //TQMS 515357
                        //If we can use cashes then we still can submit request.
                        if ( canUseCache.call(this, request)) {
                            //If this is the first call in offline mode we must call postLogin to get locale info
                            //and project settings
                            if ( ! postLoginFlag[request.pid] ) {
                                postLogin.call(this, request);
                            } else {
                                this._super(request);
                            }
                        } else {
                            //Let it fail. It will produce a proper message
                            login.call(this, request);
                        }
                    }
                }
            },
            
            /**
             * @override To automatically login if session is stale.
             * @ignore
             */
            response: function response(requestId, status, res) {
                var request = this.getRequest(requestId);
                
                // Do we NOT have a request?
                if (!request) {
                    // Request must have been canceled so there is nothing to do here.
                    return;
                }
                
                var  mstrErrors = mstrmojo.mstr.EnumWebAPIErrorCodes;
                     
                // Did the server request fail?
                if (!status && mstrMobileApp.isOnline()) {
                    switch (parseInt(res.code,10)) {
                        case mstrErrors.AUTHEN_E_LOGIN_FAIL_EXPIRED_PWD:
                            handleExpiredPassword.call(this,request);
                            return;
                            break;

                        case mstrErrors.MSI_INBOX_MSG_NOT_FOUND:
                            // what to do?
                            break;
                            
                        case mstrErrors.E_MSI_USERMGR_USER_NOTFOUND:
                            if (!request.isLogin) {
                                // Delete the stale session.
                                delete request.params.sessionState;
                                
                                // Login.  The login method will automatically submit the request again if the login call succeeds. 
                                login.call(this, request);
                                
                                // Return since the request hasn't really completed yet.
                                return;
                            }
                            break;                        
                    }
                }
                
                // Let the _super handle it.
                this._super(requestId, status, res);
            },
            
            getSession: function getSession(projectId) {
                return sessions[projectId]; 
            },
            
            closeSession: function closeSession(projectId) {
                //To do....
            },
            
            closeAllSessions: function closeAllSessions() {
                //To do...
                sessions = {};
            },
            
            getLocaleInfo: function getLocaleInfo(projectId) {
                return localeInfoMap[projectId];
            }
        });
    
}());
