(function () {
     
    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.array",
                         "mstrmojo.color",
                         "mstrmojo.hash",
                         "mstrmojo.num",
                         "mstrmojo.storage.DOMLocalStorage",
                         "mstrmojo.StringBuffer");
                         
    mstrmojo.requiresDescs(1143,7830,7831,7832,7859,7860,7861,7862,8621);                         

    var $A = mstrmojo.array,
        $AFE = $A.forEach,
        _cacheKey = "CacheEnabled",
//        _binaryKey = "BinaryMode",
        _verifyJsonKey = "VerifyJson",
        _diagnosticModeKey = "DiagnosticMode",

        EnumHSButtonType = {
            FOLDER: 1,
            RESULTSET: 2,
            REPORTS: 3,
            SETTINGS: 4,
            SHAREDLIBRARY: 5,
            HELP: 6
        };

    function isObject(o) {
        return (typeof o === 'object');
    }
    
    function getColor(clr) {
        // Is this color an object?
        if (isObject(clr)) {
            // Is it transparent (non-zero type)?
            if (clr.tp) {
                return 'transparent';
            } else {
                // Retrieve color from clr property.
                clr = clr.clr;
            }
        }
        // Add hash and pad with zeros.
        return mstrmojo.color.decodeColor(clr);
    }
    
    function findServer(project) {
        var servers = this.getWebServersList(),
            res = null;
        $AFE(servers, function (server) {
            $AFE(server.pl, function (proj) {
                if ( proj === project) {
                    res = server;;
                    return false;
                }
            });
            return ! res;
        });
        return res;
    }    
    function iterateProjects(searchConfig, serversNode, projectCache) {
        var serverCache = projectCache.servers,
            projectFound = false;
        
        // Iterate the wb servers.
        $AFE(serversNode, function (server) {
            
            // Iterate the projects.
            $AFE(server.pl, function (project) {
                var id = project.pid;

                // does the project have its ID included in the configuration?
                if (typeof id !== "undefined") {
                    // Cache the project and server.  We cache the server within the projects so that
                    // we can easily find a server based on the project ID.
                    projectCache[id] = project; 
                    serverCache[id] = server;
                    
                    // Is this the project we are looking for?
                    if (project[searchConfig.n] === searchConfig.v) {
                        // Set projectFound so we can cancel server iteration.
                        projectFound = true;
                        
                        // Return false to cancel project iteration.
                        return false;
                    }
                }
            });
            
            // Did we find the project in this server?
            if (projectFound) {
                // Return false to halt the server iteration.
                return false;
            }
        });        
    }

    function buildCustomHomeScreen(hsc) {
        var ths = this,
            cst = hsc.cst,
            btns = [];
        
        // Iterate the buttons.
        $AFE(cst.btns, function (btn) {
            // All buttons have captions.           
            
            // TQMS#519592 the default button captions and descriptions must be translated client-size
            //              because the device configuration always contains US-EN strings.  Handle the case
            //              where the user has altered the default caption.
            var xlt = ths.xlat[$A.find(ths.xlat,'act',btn.act)],            
                b = {      
                    
                    // Is this a button that has a translation?  If so, compare the caption from the config. vs. the default US-EN string.
                    // If they are the same, then use the translated version, 
                    // otherwise use the config. caption because the user has messed with it.              
                    txt: xlt ? ( btn.cap == xlt.dcp ? xlt.cap : btn.cap ) : btn.cap,
                    dsc: xlt ? xlt.dsc : btn.dsc
                };
    
            // Does this button have a custom icon?
            var icon = btn.icn;
            if (isObject(icon)) {
                // YES, so retrieve the custom source.
                b.icn = icon.img;
            }
            
            // Check the action.
            var action = btn.act;
    
            // Is the action an object?
            if (isObject(action)) {
                // It's either an open folder or open report/graph/document.
                // TQMS#512017 also look for objInfo from action.rs object, #510746 changed us to
                //              look at the action.rs.oi property - apparently both cases can occur. 
                var objInfo = (action.fd && action.fd.oi) || ( action.rs && action.rs.oi ) || action.rs;
                
                // Add dssId, subtype and project ID.
                b.did = objInfo.did;
                b.st = objInfo.st;
                b.pid = objInfo.pid;
                
                // add the style abbreviation
                b.ab = objInfo.ab;
                //Pass csp (check subscription cache) info as we need to pass it to data service.
                b.csp = !!(action.fd && action.fd.csp);
                
            } else {
                
                // Store the simple action.
                b.act = action;

                // TQMS#505134 is the current button for SETTINGS and settings is not allowed?
                if ( b.act == EnumHSButtonType.SETTINGS && !ths.getGeneralSettings().uas ) {
                    // yes, delete the button
                    b = null;
                }
            }
            
            // Add this button to the collection.
            if ( b ) {
                btns.push(b);                    
            }
        });
    
        var config = {
                btns: btns,
                fmt: {},
                ttl: ""
            },
            
            // TQMS#496200  find the homescreen format node. If we don't have buttons then the server-side transform
            //              of the configuration data will have flattened the JSON to eliminate the extra level.  The lone 'fmt'
            //              property is removed and its contents placed up one level.
            fmt = cst.btns ? cst.fmt : cst;
        
        // do we have a format node, if so then grab bits and pieces to create config.fmt
        if ( fmt ) {
            var bgFmt = fmt.bkg,
                btnFmt = fmt.btn;
                
            config.fmt = {
                bg: {
                    tp: bgFmt.tp,                                                // Type (Color or Image).
                    v: (bgFmt.tp === 1) ? getColor(bgFmt.fll.clr) : bgFmt.img    // Color (or src if type is image).
                },
                btn: {
                    bc: getColor(btnFmt.brd),   // Border color.
                    bg: getColor(btnFmt.fll),   // Background color.
                    c: getColor(btnFmt.fnt),    // Font color.
                    sty: btnFmt.stl             // Style.
                }
            };
            
            config.ttl = fmt.ttl.cap;
        }        
        
        if (this.getDeviceType() === 4) {		// Tablet
            config.hlp = fmt.vw.hlp;			// Help 
        }
        
        return config;
    }    
    
    function _loadConfiguration() {
        
        // Populate config json from mobile app.
        var cfg = mstrMobileApp.getConfiguration();
        
        // Have to use EVAL here because the configuration has data (that we don't even use) that has double slashes which breaks
        // JSON.parse. I tried to remove the slashes with replace, but I couldn't get it to work.
        return eval('(' + cfg + ')');
        // return JSON.parse(cfg);   
    }
    
    /**
     * creates empty data structures for caching host URLs and project information
     * @private
     * @param {String} paramName Describe this parameter
     * @returns Describe what it returns
     * @type String
     */
    
    function _initializePrjCache(cfg) {
        // Initialize server and project maps. 
        cfg._hostUrls = {};
        cfg._projects = {
            servers: {}
        };
    }
    
    /**
     * Clears out values cached from the configuration as they were retrieved.  
     */
    function _clearCachedValues() {
        // delete cached values
        delete this._hsType;
        delete this._hsCfg;
        delete this._wsl;
        delete this._gnl;
    }
    
    /**
     * Wrapper class for working with the MSTR Mobile Configuration.
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.MobileConfiguration = mstrmojo.declare(
        mstrmojo.Obj,
    
        null,
        
        /**
         * @lends mstrmojo.MobileConfiguration.prototype
         */
        {
            scriptClass : 'mstrmojo.MobileConfiguration',
            
            init: function init(props) {
                
                var xl = this.xlat = [],
                    md = mstrmojo.desc;
                xl.push( {   // SHARED LIBRARY
                    act: 5,
                    cap: md(7832),
                    dsc: md(7859),
                    dcp: "Shared Library"
                });
                xl.push( {   // SETTINGS
                    act: 4,
                    cap: md(7831),
                    dsc: md(7861),
                    dcp: "Settings"
                });
                xl.push( {  // HELP
                    act: 6,
                    cap: md(1143),
                    dsc: md(7862),
                    dcp: "Help"
                });
                xl.push( {  // REPORTS
                    act: 3,
                    cap: md(7830),
                    dsc: md(7860),
                    dcp: "Reports"
                });


                this._super(props);
                
                this._cfg = _loadConfiguration();            
                
                // initialize the project caches
                _initializePrjCache(this);
                
                this.cacheEnabled = $LS.getItem(_cacheKey) || false;
                
                // initialize binary mode vs. XML mode connections by asking the native code for it's setting
                this.binaryMode = mstrMobileApp.useBinaryFormat();
                
                this.verifyJson = $LS.getItem(_verifyJsonKey) === true;
                
                this.diagnosticMode = mstrMobileApp.getDiagnosticMode();            
            },
            
            getConfiguration: function () { 
                return this._cfg;  
            },
            
            /**
             * saves current configuration to device
             */
            saveConfiguration: function (silently) {
                
                // clear cached values
                _clearCachedValues.call(this);
                            
                // re-initialize the project cache
                _initializePrjCache(this);
                
                mstrMobileApp.saveConfiguration(JSON.stringify(this._cfg), !!silently);
            },
            
            reloadDefaultConfiguration: function () {                

                // have the native code reload the default configuration and then re-initialize ourselves
                mstrMobileApp.reloadDefaultConfiguration();
                
                this._cfg = _loadConfiguration();            
                // clear cached values
                _clearCachedValues.call(this);

                // re-initialize the project cache
                _initializePrjCache(this);
            },
            
            setWebServerList: function (wsl) {
                this._wsl = this._cfg.cty.wsl = wsl;

                // clear the cache of projects as well since their web server may no longer be configured                
                _initializePrjCache(this);
                
                return this;
            },
            
            /**
             * Returns reference to the web server list.  note that we are NOT returning a copy
             * @returns Array of web servers configured on this device
             * @type Array
             */
            
            getWebServersList: function () {
                if (!this._wsl) {
                    this._wsl = this._cfg.cty.wsl || [];
                }
                return this._wsl;
            },
            
            /**
             * Returns reference to the general settings object.  note that we are NOT returning a copy
             * @returns Object containing the general device settings
             * @type Object
             */
            
            getGeneralSettings: function () {
                if (!this._gnl) {
                    this._gnl = this._cfg.gnl;
                }
                return this._gnl;
            },
            
            getDefaultServerCreds: function () {
                var cty = this._cfg.cty;                
                cty.wsdc = cty.wsdc || {
                    am: 1,
                    lo: '',
                    ps: ''
                };                
                return cty.wsdc;
            },
            
            setDefaultServerCreds: function (sd) {
                var cty = this._cfg.cty;
                
                mstrmojo.hash.copy(sd, cty.wsdc);
                return this;
            },
            
            getCacheEnabled: function () {
                // Turn off all caching for now. 
                return false;
//                return this.cacheEnabled;
            },
            
            setCacheEnabled: function (c) {
                this.cacheEnabled = c; 
                $LS.setItem(_cacheKey, c, -1);
            },
            
            getBinaryMode: function () {
                return this.binaryMode;
            },
            
            setBinaryMode: function (v) {   
                if (this.binaryMode !== v) {
                    this.binaryMode = v;
                    mstrApp.serverProxy.closeAllSessions();
                    mstrApp.useBinaryFormat = v;
                    // update the setting stored in the native code
                    mstrMobileApp.setBinaryFormat(v);
                }
            },
            
            /**
             * Returns the device type as stored in the mobile configuration.
             * 
             * @returns Integer
             */
            getDeviceType: function () {
                return this._cfg.dt;
            },

            
            getVerifyJson: function () {
                return this.verifyJson;
            },

            getDiagnosticMode: function () {
                return this.diagnosticMode;
            },
            
            setDiagnosticMode: function (v) {   
                if (this.diagnosticMode !== v) {
                    this.diagnosticMode = v;
                    
                    $LS.setItem(_diagnosticModeKey, v, -1);

                    mstrApp.diagnosticMode = v;
                    
                    // update the setting stored in the native code
                    mstrMobileApp.setDiagnosticMode(v);
                }
            },
            
            getSettingsAllowed: function getSettingsAllowed() {
                return this.getGeneralSettings().uas;
            },

            /**
             * Reconciles any buttons on the some screen with the available projects and servers.  Any
             * button that references a non-existent project is removed.  If all buttons are removed,
             * a "Shared Library" button is automatically created.
             */
            
            reconcileHomescreen: function reconcileHomescreen() {
                var ths = this,
                    hsType = ths.getHomeScreenType(),
                    hs = this._cfg.hsc;
                    
                switch( hsType ) {
                    case 1:     // default
                    case 2: {   // custom                   
                        var btns = [];
                        
                        // Iterate the buttons - and check the button type:
                        
                        $AFE(hs.cst.btns, function (btn) {
                            var action = btn.act;

                            // Is the action an object?
                            if (isObject(action)) {
                                // get the info for the object
                                var objInfo = (action.fd && action.fd.oi) || ( action.rs && action.rs.oi ) || action.rs;

                                // is the project for this button still available?
                                if ( ths.getProject( objInfo.pid ) != undefined ) {
                                    // yes, retain this button
                                    btns.push(btn);
                                }
                            } else {
                                // keep all other button types
                                btns.push(btn);
                            }
                        });
                        
                        // if we have no buttons remaining then create a "Shared Library" button.
                        if ( btns.length == 0 ) {
                            btns.push( {
                                'act':5,
                                'cap':mstrmojo.desc(7832),
                                'icn':1    
                            } );
                        }
                        hs.cst.btns = btns;
                        break;
                    }
                    case 3: {   // result set
                        break;
                    }
                    case 4: {   // folder
                        break;
                    }
                }            
            },
            
            /**
             * Returns the type of homescreen contained in the device configuration. Values are defined in EnumHomeScreenTypes.java
             * 
             * @returns Type of homescreen
             * @type Number
             */
            getHomeScreenType: function () {
                if (!this._hsType) {
                    var hscNode = this._cfg.hsc;
                    if (hscNode) {
                        // If the homescreen type is "default" the hsc property is flattened to a single scalar value of 1; that is
                        // hsc.tp does not exist in the JSON because it was the only property of this._cfg.hsc.
                        this._hsType = (typeof hscNode === 'number') ? hscNode : hscNode.tp;
                    }                        
                }     
                
                return this._hsType;
            },
            
            getHomeScreen: function () {
                // Do we not have the config cached already?
                if (!this._hsCfg) {
                    var type = this.getHomeScreenType(),
                        hsc = this._cfg.hsc,
                        cfg;
                    
                    // Is this a custom home screen?
                    switch (type) {
                    case 1: // Default
                    case 2: // Custom.
                        cfg = buildCustomHomeScreen.call(this, hsc);
                        break;
                        
                    case 3: // ResultSet.
                        cfg = hsc.rs;
                        //TQMS 538658
                        //The object properties can be eithe on rs itself or on oi element 
                        if ( cfg.oi) {
                            cfg = cfg.oi;
                        }
                        break;
                        
                    case 4: // Folder.
                        cfg = hsc.fd;
                        //force the display of the help menu item. 
                        cfg.hlp = true;
                        break;
                    }
                    
                    this._hsCfg = cfg;
                }
                
                return this._hsCfg;
            
            },
            
            /**
             * Returns the host url for the given project ID.
             * 
             * @param {String} projectId The ID of the project.
             */
            getHostUrlByProject: function (projectId) {
                var urls = this._hostUrls;
                
                // Have we NOT yet created this URL?
                if (!urls[projectId]) {
                    // Get project and server node.
                    var server = this.getServerByProjectId(projectId);
                    
                    if (typeof server === "undefined") {
                        throw new Error("Could not find server for project, pid=" + projectId);
                    }
                    
                    var hostUrl = new mstrmojo.StringBuffer();
                    
                    // Start with http.
                    hostUrl.append('http');
                    
                    // Is it secure?
                    if (server.rt) {
                        // Add the s.
                        hostUrl.append('s');
                    }
                    
                    // Add server name.
                    hostUrl.append('://' + server.nm);
                    
                    // Do we have a port?
                    var port = server.po;
                    if (port) {
                        hostUrl.append(':' + port);
                    }
                    
                    // Add the path.
                    hostUrl.append('/' + server.pt + '/');
                    
                    // Add the servlet path.
                    hostUrl.append(((server.ty === 0) ? 'servlet' : 'asp') + '/');                     
                    
                    // Cache url.
                    urls[projectId] = hostUrl.toString();
                }
                
                // Return url.
                return urls[projectId];
            },
            
            /**
             * Returns the task url for the given project ID.
             * 
             * @param {String} projectId The ID of the project.
             */
            getTaskUrlByProject: function (projectId) {
                // Get project and server node.
                var server = this.getServerByProjectId(projectId);                
                if (typeof server === "undefined") {
                    throw new Error("Could not find server for project, pid=" + projectId);
                }
                return this.getHostUrlByProject(projectId) + mstrConfig.taskURL + ((server.ty === 1) ? '.aspx' : '');
            },
                        
            /**
             * Returns the project node for the supplied project ID or undefined if no such project exists
             * 
             * @param projectId The id of the project to return.
             */
            getProject: function (projectId) {
                // Get project cache.
                var projects = this._projects;
               
                // Have we NOT found this project before?
                if (!projects[projectId]) {
                    // Iterate projects to populate that cache.
                    iterateProjects({
                        n: 'pid',
                        v: projectId                        
                    }, this.getWebServersList(), projects);
                }
                
                // Return project.
                return projects[projectId];
            },
            
            /**
             * Returns the list of projects on all the mobile servers configured on the device.  We build the list of projects by searching for
             * a non-existant project which causes us to iterate over all the web servers and their projects.
             * 
             * @return {Object} Collection of objects keyed with their project ids.
             */
            getProjectHash: function () {
                var _result = {},
                    serverList = this.getWebServersList();
                if (serverList.length < 1) {
                    throw new Error(mstrmojo.desc(8621, "No mobile servers configured."));
                }                
                
                var projects = this._projects,
                    dummyProjectID = mstrmojo.num.generateUniqueID(64);        
                
                // Iterate all web servers and all projects to populate that cache. We are searching for a project that we know does not
                // exist which causes us to iterate every server and project.
                iterateProjects({
                    n: 'pid',
                    v: dummyProjectID
                }, this.getWebServersList(), projects);
                
                // clone our cache of the results to return to the caller
                _result = mstrmojo.hash.clone(projects);
                
                // iterating the projects also creates a cache of the servers in the result set.  The caller didn't ask for that so we remove it
                delete _result.servers;
                
                //return the result
                return _result;
            },
            
            /**
             * Returns the login information saved for the project. If the project does not have
             * login information defined, it resolves it to the default login info for the server.
             * 
             * @param {String} projectId The ID of the project for which we need to retrieve the default login info. 
             * @return {Object} The default login information
             * @return {String} The default project login name
             * @return {String} The default project login password
             */
            getLoginInfo: function (projectId) {
                var cfg = this.getConfiguration(),
                
                    server = this.getServerByProjectId(projectId),
                    serverCreds = server.wsc,
                    wsuid = serverCreds.lo || "",
                    wspwd = serverCreds.ps || "",
                    wsam = serverCreds.am,
                    
                    project = this.getProject(projectId),
                    projectCreds = project.pc,
                    uid = projectCreds.lo || "",
                    pwd = projectCreds.ps || "",
                    am = projectCreds.am;
                
                // does the server use the default login info?
                if ( server.udc ) {
                    var wsdc = cfg.cty.wsdc;
                    wsam = wsdc.am;
                    wsuid = wsdc.lo || "";
                    wspwd = wsdc.ps || "";
                }    
                    
                // does project use the default project login info
                if ( project.udc ) {
                    var pdc = server.pdc;
                    uid = pdc.lo;
                    pwd = pdc.ps;
                    am = pdc.am;
                }                                
                    
                return {
                    wsuid: wsuid,
                    wspwd: wspwd,
                    wsam: wsam,
                    
                    uid: uid,
                    pwd: pwd,
                    am: am
                };
            },
            
            /**
             * Returns the number of projects connected to all the mobile servers configured
             * on the device
             * 
             *   @return {Integer} The total number of projects connected.
             */
            getProjectCount: function () {
                var wsl = this.getWebServersList(),
                    count = 0,
                    i = 0;
                
                for (i = 0; i < wsl.length; i++) {
                    if (wsl[i].pl) {
                        count += wsl[i].pl.length; 
                    }
                }
                
                return count;
            },
            
            /**
             * Returns the server node for the supplied project ID or undefined if no such server exists
             * 
             * @param {Strimg} projectId The ID of the project whose server should be returned.
             */
            getServerByProjectId: function (projectId) {
                var projects = this._projects,
                    servers = projects.servers;
                
                // Have we NOT found this server before?
                if (!servers[projectId]) {
                    // Iterate projects to populate that cache.
                    iterateProjects({
                        n: 'pid',
                        v: projectId                        
                    }, this.getWebServersList(), projects);
                }
                
                // Return server.
                return servers[projectId];
            },
            
            isDefault: function isDefault() {
                return (this._cfg.cid === 'be4dc468-c070-429f-a8f2-f57491b99c36');
            },
            
            setPid: function setPid(project) {
                var oldPid = project.pid,
                    oldRealPid = project.realPid,
                    projCache = this._projects,
                    serverCache = projCache.servers;
                    pid = mstrmojo.num.generateUniqueID(32),
                    server = findServer.call(this, project);
                if ( oldPid  ) {
                    delete projCache[oldPid];
                    delete serverCache[oldPid];
                }
                if ( oldRealPid ) {
                    delete projCache[oldRealPid];
                    delete serverCache[oldRealPid];
                }
                project.pid = pid;
                delete project.realPid;
                
                projCache[pid] = project;
                serverCache[pid] = server; 
            },
            
            setRealPid: function setRealPid(project, value) {
                var oldRealPid = project.realPid,
                    projCache = this._projects,
                    serverCache = projCache.servers;
                    server = findServer.call(this, project);
                //If old real PID was the same as PID we shall not remove
                //cache references because they belong to PID now
                if ( oldRealPid && oldRealPid !== project.pid ) {
                    delete projCache[oldRealPid];
                    delete serverCache[oldRealPid];
                }
                project.realPid = value;
                
                projCache[value] = project;
                serverCache[value] = server; 
                this.saveConfiguration(true);
            }
        }
    );
        
}());
