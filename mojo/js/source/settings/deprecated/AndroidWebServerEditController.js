/**
  * WebServerEditController.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>Controller that drives display and editing of web server.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */

(function() {

    mstrmojo.requiresCls( 
        "mstrmojo.MobileBookletController",
        "mstrmojo.EnumAuthenticationModes",
        "mstrmojo.MobileDialog",
        "mstrmojo.HTMLButton",
        "mstrmojo.num"
     );
     
    mstrmojo.requiresDescs(7904); 
    
    var $auth = mstrmojo.EnumAuthenticationModes,
        $ARR = mstrmojo.array;
    
    // object that serves as a template for a new project
    var _newProject = {
        "pn": "",
        "sn": "",
        "sp": 0,
        "udc": true,
        "pc" : {
            "am": 1,
            "lo": "",
            "ps": ""
        }
    };

    /**
     * 
     * 
     * @classn
     * @extends mstrmojo.MobileBookletController
     * 
     */
    mstrmojo.settings.AndroidWebServerEditController = mstrmojo.declare(
        mstrmojo.MobileBookletController,
        null,

        /**
         * @lends mstrmojo.AndroidWebServerEditController.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidWebServerEditController",

            start: function start(params) {
                // Create new view to display the device settings.
                var frame = this.newView('WebServerEdit',  params );        
                
                // Update the frame's title to be the web server's name
                frame.updateTitle(mstrmojo.desc(7904, "Mobile Server"));
                
                // Get the content view (this should be our WebServerEditView) and pass along the web server details to the view, and display the view.
                frame.getContentView().setData(this.ws);
            
                this.addView(frame);                
            },
            
            getProjectListView: function() {
                return this.firstView.getContentView().projectList;
            },

            /**
             * Handles user interaction with displayed settings; if necessary opens a new controller
             * @param {String} params details on what 
             */            
            handleSettingsAction: function(params) {
                try {
                    var actionType = params.type;
                    var actionData = params.actionData;
                    
                    if ( actionType == 'prjEdit' ) {
                        // user wants to edit a web server settings; fire off a new controller to do the edit
                        this.spawn( mstrApp.viewFactory.newController( "ProjectEdit", 
                                                                        {   prj: actionData, 
                                                                            settingsController: this.settingsController, 
                                                                            is_new: false
                                                                        }
                                                                    ));  
                                                                                          
                    } else if ( actionType == 'add_project' ) {
                        // clone the new project template
                        var     np = mstrmojo.hash.copy( _newProject );
                        
                        // create a unique ID for this project.  This ID is used client-side to locate this project or it's related data in various data structures.
                        // e.g. the session state for this project is stored in a cache using the projectID as the key.
                        np.pid = mstrmojo.num.generateUniqueID(32);

                        // Clone the items array, insert in the new server, and re-set items to update the UI
                        params.actionList = $ARR.insert( params.actionList, $ARR.indexOf(params.actionList,actionData), [ np ] );
                        params.vw.setData( { items: params.actionList } );
                        
                        this.spawn( mstrApp.viewFactory.newController( "ProjectEdit", 
                                                                        {   prj: np,
                                                                            settingsController: this.settingsController,
                                                                            is_new: true
                                                                        } ));
                        
                    } else if ( actionType == 'rmv_project' ) {
                        var ths = this,
                            view = ths.getProjectListView(),
                            pl = view.getItems().concat(),
                            proj = params.actionData;

                            doDeleteProject = function() {
                                if ( $ARR.indexOf(pl,proj) != -1 ) {
                                    // OK to delete project - remove caches, remiove
                                    mstrApp.removeProjectCaches(proj.pid);
                                    $ARR.removeItem(pl, proj);
                                    view.contentChild.unrender();
                                    view.setData( { items: pl } );                                                                                  
                                    mstrApp.goBack();
                                }
                            };
                            
                            if ( params.noconfirm ) {
                                doDeleteProject.apply(this,[]);
                            } else {
                                // confirm the user wants to delete the project and, if so, do it.  Note that we
                                // move the booklet back one page if we delete the project.                   
                                ths.settingsController.confirmBeforeExecFunction( params.vw.projectName.value, doDeleteProject );
                            }

                    } else if ( actionType == 'default_proj_creds' ) {
                        var     ws = this.ws;
                        
                        // the device's default server settings are passed via the actionData's data property
                        this.spawn( mstrApp.viewFactory.newController( "ServerDefault",
                            {
                                sd: actionData.data,
                                settingsController: this.settingsController,
                                
                                /**
                                 * handleWriteSettings extends the new controller to provide the code that updates the configuration
                                 * with any changes made while the controller is active. 
                                 */
                                
                                handleWriteSettings: function() {                                
                                    var cv = this.firstView.getContentView(),    
                                        dam = parseInt(cv.defaultAuth.getSelectedValue(),10),
                                        dpl = cv.userName.value,
                                        dpp = cv.password.value;
                                    
                                    //If default credentials changed we need to delete caches for projects
                                    //that use default credentials.
                                    if ( ws.pdc.am != dam || (dam != $auth.NTCREDENTIAL && dam !=  $auth.PLUGIN) && ws.pdc.ps != dpl ) {
                                        var pl = ws.pl,
                                            i, pr;
                                        for ( i = 0; i < pl.length; i++ ) {
                                            pr = pl[i];
                                            if (pr.udc) {
                                                mstrApp.removeProjectCaches(pr.pid);
                                            }
                                        }
                                        
                                    }
                                    
                                    // update the web server default settings
                                    ws.pdc = {
                                        am: dam,
                                        lo: dpl,
                                        ps: dpp
                                    };
                                }                                    
                            }
                        ), {
                                ttl: "Authentication",
                                // provide the available authMode options
                                authModeOptions: [
                                    { v: $auth.STANDARD, n:"Standard"},
                                    { v: $auth.NTCREDENTIAL, n:"Windows"},
                                    { v: $auth.LDAP, n:"LDAP"},
                                    { v: $auth.DATABASE, n:"Database"},
                                    { v: $auth.PLUGIN, n:"Trusted"} 
                                ],
                                noLoginModes: {}                                
                        });                                
    
                    } else {
                        mstrmojo.err({name:"WebServerSettingsError:",message:"Unknown action type"});
                    }
                                            
                } finally {
                }
            },
            
            handleWriteSettings: function() {
                
                // before performing the back operation, check to see if the user is trying to cancel the addition of a new server.
                
                var cv = this.firstView.getContentView(),
                settingsController = this.settingsController;    
                if ( this.is_new && cv.getServerName() == "" && (this.nextController == null) ) {
                    
                    // this is a newly added server with a blank name - we treat this condition as a "cancel" and delete the new server
                    settingsController.handleSettingsAction( {  vw: cv,  type: 'rmv_server', actionData: this.ws, noconfirm: true } );

                } else {
                    var ws = this.ws,
                        wsc = ws.wsc,
                        nm = cv.serverName.value,
                        po = cv.serverPort.value,
                        pt = cv.serverPath.value,
                        ty = parseInt(cv.serverType.getSelectedValue(),10),
                        rt = parseInt(cv.httpType.getSelectedValue(),10),
                        am = parseInt(cv.authType.getSelectedValue(),10),
                        lo = cv.userName.value,
                        ps = cv.password.value;  
                    
                    //If server connection info changed we need to remove all server caches
                    if ( ws.nm != nm || ws.po != po || ws.pt != pt || ws.ty != ty ) {
                        settingsController.removeWebServerCaches(ws);
                    //If server connection credentials changed we need to remove caches for those
                    //projects that use those credentials for connections   
                    } else if (wsc.am != am || (am == 2/*Basic*/ || am == 3/*Windows*/) && lo != wsc.lo) {
                        var pl = ws.pl,
                            serverDam = ws.pdc.am,
                            proj, projAm, j;
                            for ( j = 0; j < pl.length; j++ ) {
                                proj = pl[j];
                                projAm = proj.udc ? serverDam : proj.pc.am;
                                if ( projAm == $auth.NTCREDENTIAL || projAm ==  $auth.PLUGIN ) {
                                    mstrApp.removeProjectCaches(proj.pid);
                                }
                            }
                    }
                    
                    ws.nm = nm;
                    ws.po = po;
                    ws.pt = pt;
                    ws.ty = ty;
                    ws.rt = rt;
                    
                    // get the authentication type - if "Default" is selected, set the udc property to true;
                    wsc.am = am;
                    ws.udc = ( am === $auth.DEFAULT );
                    
                    if ( am <= $auth.STANDARD ) {
                        // if we're using anonymous or default, delete any old user name and password
                        wsc.lo = "";
                        wsc.ps = "";
                    } else {
                        wsc.lo = lo;
                        wsc.ps = ps;
                    }
        
                    // we operate on a COPY of the web server list because of the need to append the "Add Server" entry.
                    // Before saving, update the configuration object with the updated data (first removing the extra server entry or course)
                    var  pl = this.getProjectListView().getItems().concat();
                    
                    // pop the last item in the list which should be our "Add Server" entry
                    pl.pop();
        
                    this.ws.pl = pl;
                }    
            }            
            
        });
})();

