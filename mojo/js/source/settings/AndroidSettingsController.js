/**
  * AndroidSettingsController.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0
  *
  * @fileoverview <p>Controller that drives display and editing of device settings.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */

(function () {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController",
                         "mstrmojo.android.SimpleList",
                         "mstrmojo.android.EnumMenuOptions",
                         "mstrmojo.hash",
                         "mstrmojo.array",
                         "mstrmojo.num");
                         
	mstrmojo.requiresDescs(11,16,17,18,37,187,295,629,702,784,844,845,874,8441,1088,1563,1900,2411,2461,2822,3157,4253,5191,8489,7227,7559,7561,7778,7779,7831,7840,7904,8027,8360,8361,8362,8363,8364,8365,8366,8367,8368,8369,8370,8371,8372,8373,8374,8375,8376,8377,8378,8379,8390,8447,8455,8456,8457,8458,8459,8633,8634,8635,8760);                         

    var $ARR = mstrmojo.array,
        $HASH = mstrmojo.hash,
        MENUS = mstrmojo.android.EnumMenuOptions,
        MENU_DELETE = MENUS.DELETE,
        GOTO_HOME = MENUS.HOME,
        legalText;

    /**
     * Item style constants.
     * 
     * @const
     * @private
     */
    var STYLE_HEADER = 1,
        STYLE_BUTTON = 2,
        STYLE_VIEW_BUTTON = 3,
        STYLE_TEXT = 4,
        STYLE_LIST = 5,
        STYLE_CHECK = 6,
        STYLE_IMAGE = 7,
        STYLE_TEXT_AREA = 8,
        STYLE_NUMBER = 9;
    
    /**
     * Item type constants.
     * 
     * @const
     * @private
     */
    var TYPE_MAIN = 1,
        TYPE_EDIT_SERVER = 2,
        TYPE_SERVER_CREDS = 3,
        TYPE_EDIT_PROJECT = 4,
        TYPE_PROJECT_CREDS = 5,
        TYPE_ADVANCED = 6,
        TYPE_ABOUT = 7,
        TYPE_STATUS = 8,
        TYPE_LEGAL = 9,
        TYPE_CERT = 10,
    	TYPE_CERT_AUTH = 11,
		TYPE_TRUSTED_CERTS = 12;
    
    var DELETE_TXT = {};
    DELETE_TXT[TYPE_EDIT_SERVER] = 5191; //'Server'
    DELETE_TXT[TYPE_EDIT_PROJECT] = 11; //'Project'
    
    /**
     * Static lists for list type controls.
     * 
     * @private
     * @ignore
     */
    var MEMORY_LIMIT_LIST = [{
            v: 25,
            n: '25MB'
        }, {
            v: 50,
            n: '50MB'
        }, {
            v: 100,
            n: '100MB'
        }, {
            v: 250,
            n: '250MB'
        }, {
            v: 500,
            n: '500MB'
        }, {
            v: 1024,
            n: '1GB'
        }, {
            v: 2048,
            n: '2GB'
        }, {
            v: 3072,
            n: '3GB'
        }, {
            v: 4096,
            n: '4GB'
        }];
    
    function getLoggingLevels() {return [{
            v: 16,
            n: mstrmojo.desc(2411, 'Off')
        }, {
            v: 14,
            n: mstrmojo.desc(845, 'Errors')
        }, {
            v: 12,
            n: mstrmojo.desc(844, 'Warnings')
        }, {
            v: 10,
            n: mstrmojo.desc(874, 'Messages')
        }, {
            v: 0,
            n: mstrmojo.desc(2461, 'All')
        }];};
    
    /**
     * A hash collection of modified items, keyed by path.
     * 
     *  @type Object
     */
    var MODIFIED_ITEMS = {};
    
    /**
     * Creates and returns a new server node with default values.
     * 
     * @type Object
     * @private
     */
    function getNewServerNode() {
        return {
            nm: '',
            po: 80,
            pt: 'MicroStrategyMobile',
            ty: 1,
            rt: 0,
            udc: true,
            wsc: {
                am: 1,
                lo: '',
                ps: ''
            },
            pdc: {
                am: 1,
                lo: '',
                ps: ''
            },
            pl: [],
            isNew: true
        };
    }
    
    /**
     * Creates and returns a new project node with default values.
     * 
     * @type Object
     * @private
     */
    function getNewProjectNode() {
        return {
            pc: {
                am: 0,
                lo: '',
                ps: ''
            },
            pn: '',
            sn: '',
            sp: 0,
            udc: false,
            isNew: true
        };
    }
    
    /**
     * Creates a new frame view and displays it in the Settings booklet.
     * 
     * @param {Function} fnView The function used to generate the properties for the new view.
     * @param {Object} [item] An optional item that raised the request for the new view.
     * 
     * @private
     */
    function addNewView(fnView, item) {
        // Get new view properties.
        var viewInfo = fnView.call(this, {
            item: item
        });
        
        // Add the redraw function for this view.
        viewInfo.cfg.fnRedraw = fnView;
        
        // Create new view to display the device settings.
        var frame = this.newView('Settings', {});        
        
        // Update the frame's title
        frame.updateTitle(viewInfo.title);
        
        // Add settings config to frame view.
        frame._cfg = viewInfo.cfg;
        
        // Get the content view (this should be our AndroidSettingsView) and pass along the items.
        frame.getContentView().items = viewInfo.items;
    
        // Display the view.
        this.addView(frame);        
    }
    
    /**
     * Returns the setting configuration for the current view.
     * 
     * @returns Object
     * @private
     */
    function getCurrentConfig() {
        return this.booklet.getCurrentView()._cfg;
    }
    
    /**
     * Deletes a server or project.
     * 
     * @param {Object} item The item for the server or project to be deleted.
     * 
     * @private
     */
    function deleteItem(item) {
        // Verify with the user that they do want to delete this item.
        if (window.confirm(mstrmojo.desc(8390, 'Are you sure you want to delete #?').replace('#', item.nm))) {
            
            // Get the collection to edit (either servers or projects, based on type).
            var mobileConfig = this.mobileConfigObj,
                cfg = getCurrentConfig.call(this),
                servers = mobileConfig.getWebServersList(),
                collection = (cfg.type === TYPE_MAIN) ? servers : servers[cfg.idx].pl;
            
            // Delete item.
            collection.splice(item.idx, 1);
            
            // Reset items in current view.
            this.booklet.getCurrentView().getContentView().set('items', cfg.fnRedraw.call(this, {
                item: cfg.item
            }).items);
            
            this.mobileConfigObj.reconcileHomescreen();
            
            // Save configuration.
            this.mobileConfigObj.saveConfiguration();
            
            // remember that we've 
            this.connectivityChanged = true;
        }
    }
    
    /**
     * Displays the "Edit" and "Delete" popup screen.
     * 
     * @param {Object} item The item that requested the popup.
     * 
     * @param
     */
    function showPopup(item) {
        var controller = this,
            dialog;
        
        // Show the dialog.
        dialog = mstrApp.showDialog({
            title: item.nm,
            cssClass: 'mstrmojo-SimpleOptions',
            children: [{
                scriptClass: 'mstrmojo.android.SimpleList',
                isElastic: true,
                items: [{
                    n: mstrmojo.desc(1088, 'Edit'),
                    v: 1
                }, {
                    n: mstrmojo.desc(629, 'Delete'),
                    v: 2
                }],
                postselectionChange: function (evt) {
                    // Close the dialog.
                    dialog.close();
                    
                    // Was the edit button clicked?
                    if (this.items[evt.added[0]].v === 1) {
                        // Use the items fn to display the new view.
                        item.fn();
                        
                    } else {
                        // Delete the item.
                        deleteItem.call(controller, item);
                    }
                }
            }]
        });
    }
    
    /**
     * Utility function for converting array of items to an array of objects with the item value as the name ('n') and the item index as the value ('v').
     * 
     * @param {String[]} list The array of items.
     * 
     * @returns Object[]
     * @private
     */
    function convertListToItems(list) {
        // Create return array.
        var rtn = [],
            x = -1;
        
        // Iterate list.
        $ARR.forEach(list, function (n, idx) {
            // Is this element not empty?
            if (n) {
                // Add n|v item to return array.
                rtn[++x] = {
                    n: n,
                    v: idx
                };
            }
        });
        
        return rtn;
    }
    
    /**
     * Changes the value of an item in the {@link mstrmojo.MobileConfiguration}.
     * 
     * @param {Object} item The item to be changed.
     * @param {String} value The new value of the item.
     * 
     * @private
     */
    function editItem(item, value, node) {
        var cfg = getCurrentConfig.call(this),
            type = cfg.type,
            path = item.pt.split('.'),
            prop = path.pop(),
            mobileConfig = this.mobileConfigObj,
            servers = mobileConfig.getWebServersList();

        switch (type) {
        case TYPE_EDIT_SERVER:
            // Set node to server node (based on item config index).
            node = servers[cfg.idx];

            // Do we not have a server node?
            if (!node) {
                // This is a new server so create a server node...
                node = getNewServerNode();
                
                // and add it to the servers collection.
                servers.push(node);
                
                // TQMS#516391 adding a project implies a connectivity change
                this.connectivityChanged = true;
            }
            break;
            
        case TYPE_EDIT_PROJECT:
            // Get server node based on config parents config index and collection of projects for server.
            var serverNode = servers[cfg.parent.idx],
                projects = serverNode.pl || [];
            
            // Set node to project (based on item config index).
            node = projects[cfg.idx];
            
            // Do we NOT have a project node?
            if (!node) {
                // This is a new project so create a project node...
                node = getNewProjectNode();
                
                // create a unique ID for this project.  This ID is used client-side to locate this project or it's related data in various data structures.
                // e.g. the session state for this project is stored in a cache using the projectID as the key.
                this.mobileConfigObj.setPid(node);

                // and add it to the projects collection.
                projects.push(node);
                
                // TQMS#516391 adding a project implies a connectivity change
                this.connectivityChanged = true;
            }
            break;
            
        case TYPE_SERVER_CREDS:
            // Set node to default server credentials node.
            node = mobileConfig.getDefaultServerCreds();
            break;
            
        case TYPE_PROJECT_CREDS:
            // Set node to server node.
            node = servers[cfg.parent.idx];
            break;
            
        case TYPE_ADVANCED:
            // Set node to general settings node.
            node = mobileConfig.getGeneralSettings();
            break;
            
        case TYPE_CERT:
        case TYPE_CERT_AUTH:
        case TYPE_TRUSTED_CERTS:
        	break;

        default:
            throw new Error('AndroidSettingsController::editItem -- Unhandled edit action.');
        }
        
        // Do we still have a path (after property name removal)?
        if (path.length) {
            // Walk the node to get the new node.
            node = $HASH.walk(path.join('.'), node);
        }
        
        // Is the new value different from the old value?
        var oldValue = node[prop];
        if (oldValue !== value) {
            // Update value in configuration.
            node[prop] = value;
            
            // Update item value.
            item.v = value;
            
            // Get collection of modified properties for this type.
            var mods = MODIFIED_ITEMS[type] || {};
            
            // Store item in modified collection (with sanitized path).
            mods[item.pt.replace('.', '@')] = item;
            
            // Store collection back in mods.
            MODIFIED_ITEMS[type] = mods;
            
            // Is this an authentication item?
            if (prop === 'am') {
                var hidden = true,
                    items = [];
                
                // Is this a server edit (either specific or default)?
                if (type === TYPE_EDIT_SERVER || type === TYPE_SERVER_CREDS) {
                    var oldHidden = (oldValue <= 1),
                        newHidden = (value <= 1);

                    // Is the visibility based on the old value different from the new value?
                    if (oldHidden !== newHidden) {
                        items = item.dependents;
                        hidden = newHidden;
                    }
                    
                // Is this a project edit and did authentication change either TO or FROM Default?
                } else if (type === TYPE_EDIT_PROJECT || type === TYPE_PROJECT_CREDS ) {
                    items = item.dependents;
                    
                    // TQMS# 496210 hide the user name and password fields for DEFAULT and WINDOWS modes
                    hidden = (value==0 || value==2);                    
                }
                
                // Iterate the items and set their visibility.
                $ARR.forEach(items, function (dependent) {
                    dependent.hidden = hidden;
                });
            }
        }
    }
    
    /**
     * Creates and return a new image item.
     * 
     * @param {String} url URI of the image to display
     * 
     * @returns Object
     * @private
     */
    function newImage(imgCls, props) {
        return $HASH.copy(props, {
            imgCls: imgCls,
            nm: "",
            style: STYLE_IMAGE
        });
    }

    /**
     * Creates and return a new header item.
     * 
     * @param {String} text The text to appear as the header.
     * 
     * @returns Object
     * @private
     */
    function newHeader(text) {
        return {
            nm: text,
            style: STYLE_HEADER
        };
    }
    
    /**
     * Creates and returns a new Settings item with the supplied parameter values.
     * 
     * @param {String} title The title of the item.
     * @param {String} value The current value of the item.
     * @param {Integer} style The style of the item {@see mstrmojo.AndroidSettingsController.STYLES}.
     * @param {Object} [props] An optional collection of properties that will be added to the returned item.
     * 
     * @private
     */
    function newItem(title, value, style, props) {
        return $HASH.copy(props, {
            nm: title,
            v: value,
            style: style
        });
    }
    
    /**
     * Creates and returns a new Settings item designed to show a new view when clicked.
     * 
     * @param {String} title The title of the item.
     * @param {String} value The current value of the item.
     * @param {Function} fnView The function to call when the view button is clicked (will be called within the scope of the controller).
     * @param {Object} [props] An optional collection of properties that will be added to the returned item.
     * 
     * @private
     */
    function newViewItem(title, value, fnView, props) {
        var controller = this;
        
        return newItem(title, value, STYLE_VIEW_BUTTON, $HASH.copy({

            fn: function () {
                // Do we have a function for generating this view?
                if (fnView) {
                    // Show new view.
                    addNewView.call(controller, fnView, this);
                    
                } else {
                    
                    mstrmojo.alert(mstrmojo.desc(8360, 'Not implemented yet.'), mstrmojo.emptyFn, "Status");
                    
                    // clear the selection
                    controller.firstView.contentChild.clearSelect();
                }
            }
        }, props));
    }
    
    /**
     * Creates and returns a new Settings item designed to edit the item value when clicked.
     * 
     * @param {String} title The title of the item.
     * @param {Integer} style The style of the item {@see mstrmojo.AndroidSettingsController.STYLES}.
     * @param {Object} node The node that contains the value.
     * @param {String} path The dot delimited path to the property value within the node.
     * @param {Object} [props] An optional collection of properties that will be added to the returned item.
     * 
     * @private
     */
    function newEditItem(title, style, node, path, props) {
        var controller = this;
        
        return newItem(title, $HASH.walk(path, node), style, $HASH.copy({
            pt: path,
            fn: function (value) {
                editItem.call(controller, this, value, node);
            }
        }, props));
    }
    
    /**
     * Creates and returns a new Settings item designed to edit the item value using a list when clicked.
     * 
     * @param {String} title The title of the item.
     * @param {Object} node The node that contains the value.
     * @param {String} path The dot delimited path to the property value within the node.
     * @param {Object[]} items The items for the list values.
     * @param {Object} [props] An optional collection of properties that will be added to the returned item.
     * 
     * @private
     */
    function newListItem(title, node, path, items, props) {
        return newEditItem.call(this, title, STYLE_LIST, node, path, $HASH.copy({
            items: items
        }, props));
    }
    
    /**
     * Creates and returns a new Settings item with a checkbox style..
     * 
     * @param {String} title The title of the item.
     * @param {Object} node The node that contains the value.
     * @param {String} path The dot delimited path to the property value within the node.
     * @param {String|Integer|Boolean} on The value for when the checkbox is considered checked.
     * @param {String|Integer|Boolean} off The value for when the checkbox is considered unchecked.
     * @param {Object} [props] An optional collection of properties that will be added to the returned item.
     * 
     * @private
     */
    function newCheckItem(title, node, path, on, off, props) {
        return newEditItem.call(this, title, STYLE_CHECK, node, path, $HASH.copy({
            on: on,
            off: off
        }, props));
    }
    
    /**
     * Validates (and adjusts) changes made to a server.
     * 
     * @param {Object} cfg The setting configuration for the current view.
     * @param {Object} mods The modifications for the current view.
     * 
     * @returns Boolean True if the parent view needs to be re-rendered.
     * @private
     */
    function validateServerChanges(cfg, mods) {
        var servers = this.mobileConfigObj.getWebServersList(),
            server = servers[cfg.idx],
            serverCreds = server.wsc,                           // Server credentials.
            serverAuth = serverCreds.am,                        // Server authentication mode.
            projects = server.pl,
            isNewServer = server.isNew;
        
        // Is this a new server and does it not have a name?
        if (isNewServer && !mods.nm) {
            // We treat this condition as a "cancel" so delete the server from the collection.
            servers.splice(cfg.idx, 1);
            
            // Nothing else to do.
            return false;
        }
        
        // Delete the "new" status.
        delete server.isNew;
        
        // Did server connection info change?
        if (mods.nm || mods.po || mods.pt || mods.ty) {
            // Iterate server project list and remove cache for each project.
            $ARR.forEach(projects, function (project) {
                mstrApp.removeProjectCaches(project);
            });
        } else {
            // Did server connection credentials change?
            if (mods['wsc@lo'] && (mods['wsc@am'] || (serverAuth === 2 || serverAuth === 3))) {        // 2 is Default, 3 is Windows.
                var projectDefaultAuth = server.pdc.am;
                
                // Iterate server project list...
                $ARR.forEach(projects, function (project) {
                    // Get project authentication mode (default to project default from server).
                    var projectAuth = (project.udc) ? projectDefaultAuth : project.pc.am;
                    
                    // Is the project authentication mode equal to NT (2) or plugin (64)?
                    if (projectAuth === 2 || projectAuth === 64) {
                        // Remove project cache.
                        mstrApp.removeProjectCaches(project);
                    }
                });
            }
        }
        
        // Set the use default server credentials property.
        server.udc = (!serverAuth);
        
        // Is server authentication set to "Default" (0)?
        if (!serverAuth) {
            // The server is using anonymous or default so make sure there are no user name or password.
            serverCreds.lo = '';
            serverCreds.ps = '';
        }
        
        // re-apply the web server list back into the configuration [TQMS#495995]
        this.mobileConfigObj.setWebServerList(servers);
        
        // Return status to indicate if the next view needs to update itself.
        return (isNewServer || !!mods.nm);
    }
    
    /**
     * Validates (and adjusts) changes made to a project.
     * 
     * @param {Object} cfg The setting configuration for the current view.
     * @param {Object} mods The modifications for the current view.
     * 
     * @returns Boolean True if the parent view needs to be re-rendered.
     * @private
     */
    function validateProjectChanges(cfg, mods) {
        var servers = this.mobileConfigObj.getWebServersList(),
            projects = servers[cfg.parent.idx].pl,
            project = projects[cfg.idx],
            projectCreds = project.pc,                             // Project credentials.
            projectAuth = projectCreds.am,                         // Project authentication mode.
            isNewProject = project.isNew;
        
        // Is this a new project and does it not have a name or server name?
        if (isNewProject && (!mods.pn || !mods.sn)) {
            // We treat this condition as a "cancel" so delete the project from the collection.
            projects.splice(cfg.idx, 1);
            
            // Nothing else to do.
            return false;
        }
        
        // Delete the "new" status.
        delete project.isNew;
        
        // Did project connection credentials change?
        if (!isNewProject && (mods.pn || mods.sn || mods['pc@am'] || (projectAuth > 0 && mods.lo))) {            
            // clear out any caches using the old project id            
            mstrApp.removeProjectCaches(project.pid);

            // the project has been edited in place and now references a different project.  So that we don't
            // use the session state, etc. for the old project we change the project id.
            this.mobileConfigObj.setPid(project);
            
            // since we have changed a project id we must reload the projects
            this.connectivityChanged = true;
        }
        
        // Update use default credentials property.
        project.udc = (!projectAuth);
        
        // Is project authentication set to "Default" (0)?
        if (!projectAuth) {
            // The project is using default so make sure there is no user name or password.
            projectCreds.lo = '';
            projectCreds.ps = '';
        }
        
        // Return status to indicate if the next view needs to update itself (due to new project or new project name or new server name).
        return (isNewProject || !!mods.pn || !!mods.sn);
    }

    /**
     * Validates (and adjusts) changes made to the default server credentials.
     * 
     * @param {Object} cfg The setting configuration for the current view.c
     * @param {Object} mods The modifications for the current view.
     * 
     * @returns Boolean False because the parent view does not need to be re-rendered.
     * @private
     */
    function validateDefaultServerCredentialsChanges(cfg, mods) {
        var mobileConfig = this.mobileConfigObj,
            creds = mobileConfig.getDefaultServerCreds(),
            isAnonymousMode = (creds.am === 1);
        
        // Did the authentication mode change, or did the login change and authentication mode is not equal to "Anonymous"?
        if (mods.am || (mods.lo && !isAnonymousMode)) {
            // Iterate web servers.
            $ARR.forEach(mobileConfig.getWebServersList(), function (server) {
                // Does this server use default server credentials?
                if (server.udc) {
                    // Get default project authentication mode.
                    var defaultProjAuth = server.pdc.am;
                    
                    // Iterate projects.
                    $ARR.forEach(server.pl, function (project) {
                        // Calculate project authentication mode.
                        var projAuthMode = (project.udc) ? defaultProjAuth : project.pc.am;
                        
                        // Is the project authentication mode NT or Plugin?
                        if (projAuthMode === 2 || projAuthMode === 64) {
                            mstrApp.removeProjectCaches(project.pid);
                        }
                    });
                }
            });
        }
        
        // Is authentication set to "Anonymous"?
        if (isAnonymousMode) {
            // The project is using anonymous so make sure there is no user name or password.
            creds.lo = '';
            creds.ps = '';
        }
        
        // Return false to indicate that a parent redraw is not necessary.
        return false;
    }
    

    /**
     * Creates the appropriate items (authentication list, user name and password) for editing credentials.
     * 
     * @param {Integer} type The type of credential edit requested.
     * @param {Object} node The node containing the authentication mode, login ID and password values ('am', 'lo' and 'ps').
     * 
     * @private
     */
    function newAuthenticationItems(type, node) {
        
        var path = '',
            fnHidden = mstrmojo.emptyFn,
            items;
        
        // Are we editing specific server or default server credentials?
        if (type === TYPE_EDIT_SERVER || type === TYPE_SERVER_CREDS) {
            // Create items for server authentication.
            items = convertListToItems([ mstrmojo.desc(8441, 'Default'), mstrmojo.desc(7778, 'Anonymous'), mstrmojo.desc(7227, 'Basic'), mstrmojo.desc(7779, 'Windows') ]);
            
            // Is this credentials for a specific server?
            if (type === TYPE_EDIT_SERVER) {
                // Set correct path.
                path = 'wsc';
            }
            
            // Logon and PWD will be hidden if value is Default or Anonymous.
            fnHidden = function (v) {
                return (v < 2);
            };
            
        } else {
            // Create items for project authentication.
            items = [{
                n: mstrmojo.desc(8441, 'Default'),
                v: 0
            }, {
                n: mstrmojo.desc(3157, 'Standard'),
                v: 1
            }, {
                n: mstrmojo.desc(7779, 'Windows'),
                v: 2
            }, {
                n: 'LDAP',
                v: 16
            }, {
                n: mstrmojo.desc(1563, 'Database'),
                v: 32
            }];
            
            // Set correct path.
            path = (type === TYPE_PROJECT_CREDS) ? 'pdc' : 'pc';
            
            // Logon and PWD will be hidden if value is Default.
            fnHidden = function (v) {
                // TQMS#494753 no user name and password for Windows auth.
                return (!v || v==2 );
            };
            
            // if we are not editing the default project creds (i.e. we are editing a project) AND the project is set
            // to use the default creds, then adjust the authentication mode to DEFAULT (TQMS#489246)
            if ((type !== TYPE_PROJECT_CREDS) && node.udc) {
                node[path].am = 0;
            }
        }
        
        // Are these default credentials (either server or project)?
        if (type === TYPE_SERVER_CREDS || type === TYPE_PROJECT_CREDS) {
            // Remove 'Default' item because it's not supported.
            items.shift();
        }
        
        // Update path.
        path = (path && path + '.') || '';

        // Server Authentication.
        var cfgLogin = {
                hidden: fnHidden($HASH.walk(path + 'am', node))
            },
            userName = newEditItem.call(this, mstrmojo.desc(17, 'User Name'), STYLE_TEXT, node, path + 'lo', cfgLogin),
            //Password field needs to tell the view that it requires a password text field.
            pwd = newEditItem.call(this, mstrmojo.desc(18, 'Password'), STYLE_TEXT, node,  path + 'ps', $HASH.copy(cfgLogin, {
                pwd: true
            })),
            rtn = [];
        
        // Create authentication mode list (with Logon and PWD as dependents).
        rtn.push(newListItem.call(this, mstrmojo.desc(2822, 'Authentication'), node, path + 'am', items, {
            dependents: [ userName, pwd ]
        }));
        
        // Add Logon and PWD.
        rtn.push(userName);
        rtn.push(pwd);
        
        return rtn;
    }
    
    /**
     * Builds and displays the view for editing project properties.
     * 
     * @param {Object} item The server item that requested the project edit.
     * 
     * @private
     */
    function getEditProjectView(cfg) {
        var item = cfg.item,
            idx = item.idx,
            settingsCfg = getCurrentConfig.call(this),
            server = this.mobileConfigObj.getWebServersList()[settingsCfg.idx] || getNewServerNode(),
            project = server.pl[idx] || getNewProjectNode(),
            items = [];
        
        // Project properties.
        items.push(newEditItem.call(this, mstrmojo.desc(11, 'Project'), STYLE_TEXT, project, 'pn'));
        items.push(newEditItem.call(this, mstrmojo.desc(5191, 'Server'), STYLE_TEXT, project, 'sn'));
        
        // Authentication.
        items = items.concat(newAuthenticationItems.call(this, TYPE_EDIT_PROJECT, project));
        
        // Return project view info.
        return {
            title: mstrmojo.desc(11, 'Project'),
            items: items,
            cfg: {
                type: TYPE_EDIT_PROJECT,
                item: item,
                idx: idx,
                parent: settingsCfg,
                fnVal: validateProjectChanges
            }
        };
    }
    
    /**
     * Builds and displays the view for editing default server credentials.
     * 
     * @private
     */
    function getDefaultServerCredentialsView() {
        // Return project view info.
        return {
            title: mstrmojo.desc(8361, 'Mobile Server Default'),
            items: newAuthenticationItems.call(this, TYPE_SERVER_CREDS, this.mobileConfigObj.getDefaultServerCreds()),
            cfg: {
                type: TYPE_SERVER_CREDS,
                fnVal: validateDefaultServerCredentialsChanges
            }
        };
    }
    
    /**
     * Builds and displays the view for editing default project credentials.
     * 
     * @param {Object} item The server item that requested the project credentials edit.
     * 
     * @private
     */
    function getDefaultProjectCredentialsView() {
        var settingsCfg = getCurrentConfig.call(this),
            server = this.mobileConfigObj.getWebServersList()[settingsCfg.idx] || getNewServerNode();
        
        // Return default project credentials.
        return {
            title: mstrmojo.desc(2822, 'Authentication'),
            items: newAuthenticationItems.call(this, TYPE_PROJECT_CREDS, server),
            cfg: {
                type: TYPE_PROJECT_CREDS,
                parent: settingsCfg
            }
        };        
    }
    
    /**
     * Builds and displays the view for editing server properties.
     * 
     * @param {Object} item The item that requested the server edit.
     * 
     * @private
     */
    function getEditServerView(cfg) {
        var controller = this,
            item = cfg.item,
            server = this.mobileConfigObj.getWebServersList()[item.idx] || getNewServerNode(),
            projects = server.pl || [],
            items = [];
        
        // push the project list back onto the server in case we just created it
        server.pl = projects;    
            
        // Server properties.
        items.push(newEditItem.call(this, mstrmojo.desc(7559, 'Name'), STYLE_TEXT, server, 'nm'));
        items.push(newEditItem.call(this, mstrmojo.desc(16, 'Port'), STYLE_NUMBER, server, 'po', {
            limits: {
                min: 0,
                max: 65535
            }
        }));
        items.push(newEditItem.call(this, mstrmojo.desc(8489, 'Path'), STYLE_TEXT, server, 'pt'));
        items.push(newListItem.call(this, mstrmojo.desc(8362, 'Web server type'), server, 'ty', convertListToItems([ 'J2EE', 'ASP.Net' ])));
        items.push(newCheckItem.call(this, mstrmojo.desc(8363, 'Secure HTTP'), server, 'rt', 1, 0));
        
        // Authentication.
        items = items.concat(newAuthenticationItems.call(this, TYPE_EDIT_SERVER, server));
        
        // Projects.
        items.push(newHeader(mstrmojo.desc(37, 'Projects')));
        
        // Configured projects.
        $ARR.forEach(projects, function (project, idx) {
            items.push(newViewItem.call(controller, project.pn, project.sn, getEditProjectView, {
                idx: idx,
                fnPress: showPopup
            }));
        });
        
        // New project.
        items.push(newViewItem.call(this, mstrmojo.desc(4253, 'Add Project...'), '', getEditProjectView, {
            idx: projects.length
        }));
        
        // Default project credentials.
        items.push(newViewItem.call(this, mstrmojo.desc(8364, 'Default Project Credentials'), '', getDefaultProjectCredentialsView));

        // Return edit settings parameters.
        return {
            title: mstrmojo.desc(7904, 'Mobile Server'),
            items: items,
            cfg: {
                type: TYPE_EDIT_SERVER,
                item: item,
                idx: item.idx,
                parent: getCurrentConfig.call(this),
                fnVal: validateServerChanges
            }
        };         
    }

    /**
     * Builds and displays the view for editing advanced settings.
     * 
     * @private
     */
    function getLegalView() {
        var items = [];
        
        if (!legalText) {
            legalText = "<p>" + mstrmojo.desc(8633) + "</p>" + "<p>" + mstrmojo.desc(8634) + "</p>" + "<p>" + mstrmojo.desc(8635) + "</p>";
        }
        items.push(newItem(legalText, "", STYLE_TEXT_AREA, {
            disabled: true
        })); 
        
        // Return advanced settings parameters.
        return {
            title: mstrmojo.desc(8365, 'Legal'),
            items: items,
            cfg: {
                type: TYPE_LEGAL
            }
        };        
    }
    
    /**
     * Builds and displays the view for editing advanced settings.
     * 
     * @private
     */
    function getAboutView() {
        var items = [];

        items.push(newImage.call(this, 'logo', {
            disabled: true
        }));
        items.push(newItem.call(this, 'MicroStrategy Mobile 9.2.1m', mstrmojo.desc(8366, 'Build Number #').replace('#', mstrMobileApp.getAppVersion()), STYLE_BUTTON, {
            textStyle: "center",
            disabled: true
        }));
        items.push(newViewItem.call(this, mstrmojo.desc(8365, 'Legal'), '', getLegalView));
        
        // Return advanced settings parameters.
        return {
            title: mstrmojo.desc(1142, 'About'),
            items: items,
            cfg: {
                type: TYPE_ABOUT
            }
        };        
    }

    // TODO refactor with deleteItem to share common code
    function deleteCertificate(item) {
        if (window.confirm(mstrmojo.desc(8390, 'Are you sure you want to delete #?').replace('#', item.nm))) {
            // This could take awhile so display loading message.
            mstrApp.showMessage('Deleting...');
            
            var controller = this;
            
            window.setTimeout(function () {
                var cfg = getCurrentConfig.call(controller);
                
            // delete certificate on device
        	mstrMobileApp.deleteCertificate();
                
        	// mark "Device Certificate" item as hidden
        	item.hidden = !mstrMobileApp.hasCertificate();
                
        	// mark "Get Certificate" item as not hidden
                $ARR.forEach(item.dependents, function (d) {
                    d.hidden = !item.hidden;
                });
                
    		// refresh/re-render
                controller.booklet.getCurrentView().getContentView().set('items', cfg.fnRedraw.call(controller, {
                    item: cfg.item
                }).items);
                
                // Hide the loading message.
                mstrApp.hideMessage();
            }, 100);
        }
    }
    // TODO refactor with showPopup to share common code
    function showPopupDeleteCertificate(item) {
        var controller = this,
            dialog;

        dialog = mstrApp.showDialog({
            title: item.nm,
            cssClass: 'mstrmojo-SimpleOptions',
            children: [{
                scriptClass: 'mstrmojo.android.SimpleList',
                isElastic: true,
                items: [{
                    n: mstrmojo.desc(1900, 'View'),
                    v: 1
                }, {
                    n: mstrmojo.desc(629, 'Delete'),
                    v: 2
                }],
                postselectionChange: function (evt) {
                    dialog.close();
                    if (this.items[evt.added[0]].v === 1) {
                        item.fn();
                    } else if (this.items[evt.added[0]].v === 2) {
                    	deleteCertificate.call(controller, item);
                    }
                }
            }]
        });
    }
    
    /**
     * Display device certificate details.
     */
    function getCertificateDetailsView(src) {
        var detailsStr = mstrMobileApp.getCertificateDetails(),
        	details = eval('(' + detailsStr + ')'),
        	items = [],
            controller = this,
            result = "";

        if (details.prs) {
	        for (var i = 0; i < details.prs.pr.length; ++i) {
	        	var pr = details.prs.pr[i];
	        	var name;
	
	        	if (pr.n == "edat") {
	        		name = mstrmojo.desc(8457, 'Expiration');
	        	} else if (pr.n == "issr_n") {
	        		name = mstrmojo.desc(8458, 'Issuer');
	        	} else {
	        		name = pr.n;
	        	}
	        	result += name + ": " + pr.v + "<br/>";
	        }
	        items.push(newItem.call(this, result, "", STYLE_TEXT_AREA, {
	            disabled: true
	        }));
	        return {
	            title: mstrmojo.desc(8456, 'Certificate Details'),
	            items: items,
	            cfg: {
	                type: TYPE_CERT
	            }
	        };
        } else {
        	var msg;
        	
        	if (details.message) {
        		msg = details.message;
        	} else {
        		msg = mstrmojo.desc(8455, 'No certificate details available');
        	}
        	throw msg; 
        }
    }
    
    function getTrustedCertificatesView() {
    	var result = mstrMobileApp.getTrustedCertificates(),
    		jsonResult = eval('(' + result + ')'),
    		items = [],
    		controller = this;
    	
    	if (jsonResult && jsonResult.certs) {
    		for (var i = 0; i < jsonResult.certs.length; ++i) {
    			var cert = jsonResult.certs[i].dsc;

    	        items.push(newItem(cert, "", STYLE_TEXT_AREA, {
    	            disabled: true
    	        })); 
    		}
    	}
    	return {
            title: mstrmojo.desc(8447, 'Trusted Certificates'),
            items: items,
            cfg: {
                type: TYPE_TRUSTED_CERTS
            }
    	};
    }

    /**
     * Fetches fields to ask user to authenticate against Certificate Server
     * in order to obtain a device certificate.
     */
    function getCertificateAuthenticationFieldsView(src) {
        var result = mstrMobileApp.getCertificateAuthenticationFields(),
        	jsonResult = eval('(' + result + ')'),
        	items = [],
        	controller = this,
        	i = 0;

        if (jsonResult.login_info != null) {
        	var settings = {},
        	    loginInfoField = jsonResult.login_info.field;
        	
	        for (; i < loginInfoField.length; ++i) {
	        	var field = loginInfoField[i],
	        	    cfgAuth = {};
	        	
	        	settings[field.n] = "";
	        	if (field.pass == true) {
	        		cfgAuth = $HASH.copy(cfgAuth, {
	                    pwd: true
	                });
	        	}
	        	
                items.push(newEditItem.call(this, field.dn, ((field.tp == "numeric") ? STYLE_NUMBER : STYLE_TEXT), settings, field.n, cfgAuth));
	        }
	        // newItem(title, value, style, props)
	        items.push(newItem.call(this, "Submit", "", STYLE_BUTTON, {
	            fn: function() {
	                
	                // This may take a while so display the loading message.
	                mstrApp.showMessage();
	                
	                // Request the new certificate within a timeout so the loading message displays and the selection fades out.
	                window.setTimeout(function () {
	                    // Request the certificate.
	            	var responseStr = mstrMobileApp.getNewCertificate(JSON.stringify(settings));
	                    
	                    // Hide the loading message.
	                    mstrApp.hideMessage();
	                    
	                    // Is the response an error?
	                    var response = eval('(' + responseStr + ')'),
	                        message = response.message;
	                    if (message) {
	                        // Display error to user.
	            		alert(response.message);
	                        
	                    } else {
	                        // Alert that the certificate was obtained.
	            		alert("Certificate obtained");
	                        
	                        // Is there a source item and was it to retrieve a certificate?
	                        var srcItem = src.item;
	                        if (srcItem && srcItem.nm === "Get Certificate") {
	                            // Set it's hidden state.
	                            srcItem.hidden = mstrMobileApp.hasCertificate();
	                            
	                            // Iterate dependents;
	                            $ARR.forEach(srcItem.dependents, function (d) {
	                                d.hidden = !d.hidden;
	                            });
	                        }
	                        
	                        // Back up to previous screen.
		            	controller.goBack();
	            	}
	                    
	                }, 100);
	            }
	        }));
	        
	        return {
	            title: jsonResult.login_info.msg,
	            items: items,
	            cfg: {
	                type: TYPE_CERT_AUTH
	            }
	        };
        } else {
        	throw new Error(jsonResult.message);
        }
    }

    /**
     * Builds and displays the view for editing advanced settings.
     * 
     * @private
     */
    function getAdvancedSettingsView() {
        var mobileConfig = this.mobileConfigObj,
            generalSettings = mobileConfig.getGeneralSettings(),
            items = [],
            controller = this;
        
        items.push(newEditItem.call(this, mstrmojo.desc(8367, 'Network Timeout (seconds)'), STYLE_NUMBER, generalSettings, 'nt', {
            limits: {
                min: 0,
                max: 9999                
            }
        }));

        items.push(newEditItem.call(this, mstrmojo.desc(7840, 'Maximum Columns in Grid'), STYLE_NUMBER, generalSettings, 'mgc', {
            limits: {
                min: 0,
                max: 9999                
            }
        }));

        // TQMS 518555 Special case for canvas size set the default value to 25 for the first run
        if(!generalSettings.mcs) {
        	generalSettings.mcs = 25;
        }
        items.push(newEditItem.call(this, mstrmojo.desc(8762, 'Maximum canvas to screen ratio'), STYLE_NUMBER, generalSettings, 'mcs', {
            limits: {
                min: 1,
                max: 25                
            }
        }));
        
        // Create log JSON check box.
        if ( generalSettings.usd ) {
            var diagnosticMode = newCheckItem.call(this, mstrmojo.desc(8760, 'Diagnostic Mode'), {
                b: mobileConfig.getDiagnosticMode()
            }, 'b', true, false);
    
            // Override fn to update mobileConfig.
            diagnosticMode.fn = function (value) {
                // Update config.
                mobileConfig.setDiagnosticMode(value);
                
                // Update item.
                this.v = value;
            };
            items.push(diagnosticMode);
        }

        // Caching.
        // TQMS#510039 only display cache settings if the admin allows it
        if ( generalSettings.usc ) {
            items.push(newHeader(mstrmojo.desc(8368, 'Caching')));
            items.push(newListItem.call(this, mstrmojo.desc(8369, 'Memory limit'), generalSettings, 'ml', MEMORY_LIMIT_LIST));
            items.push(newCheckItem.call(this, mstrmojo.desc(8370, 'Folder caching'), generalSettings, 'fc', true, false));
            items.push(newCheckItem.call(this, mstrmojo.desc(8371, 'Clear on Close'), generalSettings, 'cc', 2, 1));
        }
        
        // Logging
        
        /*
            disable logging until we actually support it [#]
        
        if ( generalSettings.usl ) {
            items.push(newHeader(mstrmojo.desc(8372, 'Logging')));
            items.push(newListItem.call(this, mstrmojo.desc(7561, 'Level'), generalSettings, 'll', getLoggingLevels()));
            items.push(newEditItem.call(this, mstrmojo.desc(8373, 'Maximum Log Size (entries)'), STYLE_NUMBER, generalSettings, 'mls', {
                limits: {
                    min: 0,
                    max: 9999                
                }
            } ));
        }

        */

/*
        NOTE: To re-enable this item simply uncomment this block of code and rebuild the appliation.  All of the support
                code in the native portion of the application is still in place.
                


        // Connection
        items.push(newHeader(mstrmojo.desc(8374, 'Connection')));
        
        // Create connection mode check box (using getCacheEnabled from mobileConfig).
        var useBinary = newCheckItem.call(this, 'Use Binary?', {
            b: mobileConfig.getBinaryMode()
        }, 'b', true, false);

        // Override fn to update mobileConfig.
        useBinary.fn = function (value) {
            // Update config.
            mobileConfig.setBinaryMode(value);
            
            // Update item.
            this.v = value;
        };
        items.push(useBinary);

*/ 


        items.push(newHeader(mstrmojo.desc(8459, 'Certificates')));
        // Device Certificate
        if (typeof generalSettings.ucs !== undefined && generalSettings.ucs !== '' && generalSettings.ucs) {
        	var cfg = getCurrentConfig.call(this);
        	var hasCert = mstrMobileApp.hasCertificate();
        	var certItem, getCertItem;
        	
	        certItem = newViewItem.call(this, 'Device Certificate', '', getCertificateDetailsView, {
                fnPress: showPopupDeleteCertificate,
                hidden: !hasCert
            });
	        getCertItem = newViewItem.call(this, 'Get Certificate', "", getCertificateAuthenticationFieldsView, {
   	        	hidden: hasCert,
                dependents: [certItem]
   	        });
	        certItem.dependents = [getCertItem];
	        items.push(certItem);
   	        items.push(getCertItem);
        }
        items.push(newViewItem.call(this, mstrmojo.desc(8447, 'Trusted Certificates'), "", getTrustedCertificatesView, {
            hidden: false
        }));
        
        // Device passcode
        if (mstrMobileApp.isDPCEnabled()) {
        	items.push(newHeader('Device Passcode'));
        	items.push(newItem.call(this, "Reset", "", STYLE_BUTTON, {fn: function() {mstrMobileApp.resetDPC();}}));
        }

        // Return advanced settings parameters.
        return {
            title: mstrmojo.desc(702, 'Advanced'),
            items: items,
            cfg: {
                type: TYPE_ADVANCED
            }
        };        
    }    
    
    /**
     * Displays the initial settings page.
     * 
     * @param {Object} params The start parameters as passed in from the controller spawn process.
     * 
     * @private
     */
    function getMainSettingsView() {
        var config = this.mobileConfigObj,
            servers = config.getWebServersList(),
            items = [ newHeader(mstrmojo.desc(8375, 'Mobile Servers')) ],
            controller = this;
        
        // Mobile servers.
        // Iterate existing servers.
        $ARR.forEach(servers, function (server, idx) {
            // Create button to edit this server.
            items.push(newViewItem.call(controller, server.nm, '', getEditServerView, {
                idx: idx,
                fnPress: showPopup
            }));
        });
    
        // Add additional items.
        items = items.concat([ 
            // Add button for new servers.
            newViewItem.call(this, mstrmojo.desc(8376, 'Add Server...'), '', getEditServerView, {
                idx: servers.length
            }),

            // General settings.
            newHeader(mstrmojo.desc(295, 'General')), 
            newViewItem.call(this, mstrmojo.desc(8377, 'Default Server Credentials'), '', getDefaultServerCredentialsView),
            newViewItem.call(this, mstrmojo.desc(8378, 'Advanced Settings'), '', getAdvancedSettingsView), 
            newViewItem.call(this, mstrmojo.desc(1142, 'About'), '', getAboutView)
        ]);

        // Return view info.
        return {
            title: mstrmojo.desc(7831, 'Settings'),
            items: items,
            cfg: {
                type: TYPE_MAIN
            }
        };
    }
    
    /**
     * Booklet-based Settings controller.
     * 
     * @class
     * @extends mstrmojo.MobileBookletController
     */
    mstrmojo.settings.AndroidSettingsController = mstrmojo.declare(
            
        mstrmojo.MobileBookletController,
        
        null,

        /**
         * @lends mstrmojo.AndroidSettingsController.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidSettingsController",

            // keeps track of whether a server or project has been deleted from the configuration            
            connectivityChanged: false,

            init: function (props) {
                this._super(props);
                
                // Cache mobile configuration object for later use.
                this.mobileConfigObj = this.mobileConfigObj || mstrApp.getConfiguration();

            },

            start: function (params, view) {
                // Cancel any pending requests before displaying the settings page.
                mstrApp.cancelPending();
                
                // Show main settings view.
                if (view == null) {
                	addNewView.call(this, getMainSettingsView);
                } else {
                	addNewView.call(this, eval('(' + view + ')'));
                }
            },
            
            populateMenu: function populateMenu(config) {
                // Get configuration and delete text.
                var cfg = getCurrentConfig.call(this),
                    descId = DELETE_TXT[cfg.type];
                
                // Do we support the delete operation?
                if (descId) {
                    mnuText = mstrmojo.desc(descId);
                    // Add menu item.
                    config.addItem(MENU_DELETE, mstrmojo.desc(8379, 'Delete #').replace('#', mnuText), MENU_DELETE, true, 16);
                }
            },
            
            handleMenuItem: function handleMenuItem(group, command) {
                var cfg = getCurrentConfig.call(this),
                    type = cfg.type;

                switch (group) {
                case GOTO_HOME:
                    // do we have modified items?
                    if (MODIFIED_ITEMS[type]) {
                        // save the configuration to persistant storage
                        this.mobileConfigObj.saveConfiguration();
                        // Delete the collection of modified items.
                        delete MODIFIED_ITEMS[type];
                    }
                    return;
                        
                case MENU_DELETE:                
                    var servers = this.mobileConfigObj.getWebServersList(),
                        collection,
                        isServer = (type === TYPE_EDIT_SERVER);

                    // Are we editing a server?
                    if (isServer) {
                        // Set collection to servers node.
                        collection = servers;
                        
                    // Are we editing a project?
                    } else if (type === TYPE_EDIT_PROJECT) {
                        // Set collection to project list node.
                        collection = servers[cfg.parent.idx].pl;
                    }

                    // Do we have a collection to delete from?
                    if (collection) {
                        var item = collection[cfg.idx];
                        
                        // Verify with the user that they do want to delete this item.
                        if (window.confirm(mstrmojo.desc(8390, 'Are you sure you want to delete #?').replace('#', isServer ? item.nm : item.pn ))) {
                            // Delete item from collection.
                            collection.splice(cfg.idx, 1);
                            
                            // TQMS#516389 remove any homescreen buttons that refer to our deleted item
                            this.mobileConfigObj.reconcileHomescreen();
                            
                            // Save configuration.
                            this.mobileConfigObj.saveConfiguration();
        
                            // Reset items in current view.
                            this.booklet.getView(-1).getContentView().set('items', cfg.parent.fnRedraw.call(this, {
                                item: cfg.parent
                            }).items);              
        
                            // Step booklet backward.
                            this.goBack();
                            
                            this.connectivityChanged = true;    
                        }                        
                    }
                    return;
                }
            },
            
            goBack: function goBack() {
                // Get configuration for this view as well as modified collection.
                var cfg = getCurrentConfig.call(this),
                    type = cfg.type,
                    mods = MODIFIED_ITEMS[type];
                
                // Do we have any modifications from this view?
                if (mods) {
                    var fnValidate = cfg.fnVal,                                                                   // Validation function.
                        fnRedraw = ((fnValidate && fnValidate.call(this, cfg, mods)) && cfg.parent.fnRedraw);     // Redraw function (if validation function returned true).
                    
                    // Save configuration.
                    this.mobileConfigObj.saveConfiguration();
                    
                    // Do we have a redraw function?
                    if (fnRedraw) {
                        // Pass the result of the redraw function to the previous view.
                        this.booklet.getView(-1).getContentView().set('items', fnRedraw.call(this, cfg.parent).items);
                    }
                    
                    // Delete the collection of modified items.
                    delete MODIFIED_ITEMS[type];
                }

                // [#487065] if the connectivity has changed and we are on the last page of the settings booklet then when'
                // the user backs out one more time, go to the home screen since any intervening screens may be relying
                // on items that have been deleted
                if ( this.connectivityChanged && ( this.lastView === this.firstView  )) {
                    mstrApp.goHome({
                        connectivityChanged: true
                    });
                    return true;
                }                                

                return this._super();
            }
        }
    );
  
    var controller = mstrmojo.settings.AndroidSettingsController;
    
    /**
     * An enumeration of settings item styles.
     * 
     * @const
     * @type Integer
     */
    controller.STYLES = {
        HEADER: STYLE_HEADER,
        BUTTON: STYLE_BUTTON,
        VIEW_BUTTON: STYLE_VIEW_BUTTON,
        TEXT: STYLE_TEXT,
        LIST: STYLE_LIST,
        CHECK: STYLE_CHECK,
        IMAGE: STYLE_IMAGE,
        TEXT_AREA: STYLE_TEXT_AREA,
        NUMBER: STYLE_NUMBER
    };
    
}());