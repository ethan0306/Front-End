/**
  * AppBrowser.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0
  * @fileoverview <p>Widget for displaying project and folder contents on tablet devices.</p>
  * @author <a href="mailto:mhaugen@microstrategy.com">Mark Haugen</a>
  */

(function () {

    mstrmojo.requiresCls("mstrmojo.Container",
                         "mstrmojo._HasLayout",
                         "mstrmojo.android.large.ProjectBrowser",
                         "mstrmojo.android.EnumMenuOptions",
                         "mstrmojo.Label",
                         "mstrmojo.Image",
                         "mstrmojo.array",
                         "mstrmojo.hash",
                         "mstrmojo.dom",
                         "mstrmojo.css");

    mstrmojo.requiresDescs(773, 8385, 8386, 8387, 8388, 8389, 8391, 8392, 8394, 8411, 5088);

    var $ARR = mstrmojo.array,
        $HASH = mstrmojo.hash,
        $MENUS = mstrmojo.android.EnumMenuOptions,
        REFRESH = $MENUS.REFRESH,
        CLASS_NAME = 'AppBrowser',
        PREVIEW_CLS_NAME = mstrmojo.Image.baseCssClass + ' prv';

    var MODE_HOME = 'Home',
        MODE_PROJECT = 'Project',
        MODE_FOLDER = 'Folder';

    /**
     * Cache of previous states used when the application goes backwards.
     *
     * @type Object[]
     * @private
     */
    var stateCache = [];

    /**
     * Toggles the opacity of the preview image node.
     *
     * @param {mstrmojo.Image} preview The preview image control.
     * @param {Number} opacity The new opacity of the image.
     *
     * @private
     */
    function togglePreviewCtrl(preview, opacity) {
        var imgNodeStyle = preview.imgNode.style;
        imgNodeStyle.webkitTransitionDuration = (opacity) ? '300ms' : 0;
        imgNodeStyle.opacity = opacity;
    }

    /**
     * Returns a object with the current state of the {@link mstrmojo.android.large.AppBrowser}.
     *
     * @type Object
     * @private
     */
    function getState() {
        var state = {};

        // Get the title.
        state.ttl = this.parent.getTitle();

        // Get items and selected index.
        var projectBrowser = this.projectBrowser,
            items = projectBrowser.items,
            idx = projectBrowser.selectedIndex;

        state.items = items;
        state.idx = idx;
        state.item = items[idx];
        state.csp = this.csp;

        return state;
    }

    function notifyBinDataService(state) {
        if (mstrApp.useBinaryFormat && mstrApp.getCurrentProjectId()) {
            // If we go back to a folder
            var item = state.item,
                emptyFn = mstrmojo.emptyFn;

            if (item && parseInt(item.st, 10) === 2048) {
                mstrApp.serverRequest({
                    taskId: "setCurrentView",
                    st: item.st,
                    did: item.did || ''
                }, {
                    success: emptyFn,
                    failure: emptyFn
                }, {
                    defaultWait: true,
                    silent: true
                });
            }
        }
    }

    /**
     * Updates the supported default menus based on the current mode of the {@link mstrmojo.android.large.AppBrowser}.
     *
     * @param {Object} currentMode mode that the browser is currently operating in (HOME,FOLDER,PROJECT)
     *
     * @private
     */
    function setSupportedDefaultMenus(currentMode) {
        var menus = $MENUS.SETTINGS + $MENUS.HELP;

        if (currentMode !== MODE_HOME) {
            menus |= $MENUS.HOME;
        }
        this.supportedDefaultMenus = menus;
    }

    function getCachedTime(item) {
        var ct = mstrMobileApp.getCachedTime(item.did, item.st, item.pid || ""),
            dtString;

        if (ct > 0) {
            var $date = mstrmojo.date,
                $l = mstrmojo.locales.datetime,
                d = new Date(parseInt(ct, 10)),
                dateInfo = $date.getDateJson(d),
                dateStr = $date.formatDateInfo(dateInfo, $l.DATEOUTPUTFORMAT),
                timeStr = $date.formatTimeInfo(dateInfo, $l.TIMEOUTPUTFORMAT);

            dtString = dateStr +  ' ' + timeStr;
        } else {
            dtString = mstrmojo.desc(8392, 'Not available');
        }
        return mstrmojo.desc(8391, 'Cached On:') + ' ' + dtString;
    }
    /**
     * Applies the supplied state to the the {@link mstrmojo.android.large.AppBrowser}.
     *
     * @param {Object} state The state object to be applied.
     * @param {Object} [cacheState] An optional state to cache as the previous state.
     *
     * @private
     */
    function applyState(state, cacheState) {
        // Should we cache the current state?
        if (cacheState) {
            // Get current state and add to state cache.
            stateCache.push(cacheState);
        }
        this.csp = !!state.csp;
        // Update title.
        this.parent.updateTitle(state.ttl);

        var items = state.items,
            item = state.item,
            projMsg = mstrmojo.desc(8385, 'Select a project to view contents'),
            imgPreview = this.imgPreview,
            showPreview = false,
            lblName = this.lblName,
            lblDescription = this.lblDesc,
            lblCachedOn = this.lblCachedOn,
            description = '',
            previewClsName = '',
            name = '',
            cachedOn = '',
            currentMode = MODE_HOME,
            btn = false;

        // Do we have an item?
        if (item) {
            // What is the subtype?
            var subType = item.st;
            if (subType) {
                // Is this a project (by subtype or presence of systemFolder)?
                if (subType === 'Project' || item.systemFolder) {
                    description = projMsg;

                    // Set current action to project browsing.
                    currentMode = MODE_PROJECT;

                // Is this a folder?
                } else if (subType === 2048) {
                    description = mstrmojo.desc(8386, 'Select a report, document or folder to view its content');
                    currentMode = MODE_FOLDER;
                    //TQMS 506068 We need to notify controller when we go back to a folder.
                    notifyBinDataService(state);

                } else {
                    // Notify Java application layer that we need a preview.
                    mstrMobileApp.getScreenShot(this.id, mstrApp.getCurrentProjectId(), item.did);

                    // Preview should be visible.
                    showPreview = true;

                    // Is this a different item than the previously selected item?
                    var oldItem = imgPreview.item;
                    if (!oldItem || oldItem.did !== item.did) {
                        // Item is different so set standard subtype based class and we'll wait for the preview source.
                        previewClsName = PREVIEW_CLS_NAME + ' i' + item.st;

                        // Make sure the image preview has no source.
                        imgPreview.set('src', '');
                    }

                    // Cache the current item on the image preview.
                    imgPreview.item = item;

                    // Get name and description from item.
                    name = item.txt || item.n;
                    description = item.desc || '';

                    // Button should be visible.
                    btn = this.projectBrowser.canClick(item);

                    //Set Cached on value
                    cachedOn = getCachedTime(item);

                    currentMode = MODE_FOLDER;
                }

            // Does the item have an action?
            } else if (item.act) {
                // It's a home screen item.
                description = mstrmojo.desc(8387, 'Select an item to view');

                // Set current action to home screen.
                currentMode = MODE_HOME;
            }

        } else if (items) {

            // No item is selected - if the state cache is empty then we are at the HOME view, otherwise
            //                       if there are items being displayed we assume we are browsing a project.
            //                       If no items are being displayed we assume we are looking at an empty folder.
            //                       (although one supposes that it could also be an empty project).


            // is the state cache empty?  If so, we are HOME
            if (stateCache.length === 0) {
                // It's a home screen item.
                description = mstrmojo.desc(8387, 'Select an item to view');
                // Set current action to home screen.
                currentMode = MODE_HOME;
            } else {

                // Are the items NOT empty?
                if (items.length) {
                    // Must be the project browser.
                    description = projMsg;

                    // Set current action to project browsing.
                    currentMode = MODE_PROJECT;

                } else {
                    // Empty folder.
                    description = mstrmojo.desc(8388, 'No items in folder');
                    currentMode = MODE_FOLDER;
                }
            }
        }

        // Set visibility based on presence of preview class name.
        imgPreview.set('visible', showPreview);

        // Do we have a class name?
        if (previewClsName) {
            // Set the cssClass on the preview image.
            imgPreview.set('cssClass', previewClsName);
        }

        // Have we NOT cached preview size and is preview visible?
        if (!this._previewSize && showPreview) {
            // Cache the preview size for later use.
            this._previewSize = imgPreview.getImageSize();
        }

        // Set visiblity and text for name label.
        lblName.set('text', name || '');
        lblName.set('visible', !!name.length);

        // Set visiblity and text for description label.
        lblDescription.set('text', description || '');
        lblDescription.set('visible', !!description.length);

        // Set visiblity and text for Cached On label.
        lblCachedOn.set('text', cachedOn || '');
        lblCachedOn.set('visible', !!cachedOn.length);

        // Set visibility of view button.
        this.btnView.set('visible', btn);

        // Do we have new items?
        if (items) {
            // Replace browser items.
            this.projectBrowser.replaceItems(items, state.idx);
        }

        // Cache current action.
        this._mode = currentMode;

        // Set supported menus.
        setSupportedDefaultMenus.call(this, currentMode);

        // Ask parent (AndroidMainView) to updated menus.
        this.parent.updateActionMenu();
    }

    /**
     * Iteractes through the device config and returns a list of the projects configured.
     *
     * @return Array of projects configured on the device.
     */
    function getProjectList() {
        var deviceConfig = mstrApp.getConfiguration(),
            projectList = [];

        // Iterate project list and create items for project display.
        $HASH.forEach(deviceConfig.getProjectHash(), function (project) {
            projectList.push({
                did: project.pid,
                n: project.pn,
                desc: project.sn,
                st: 'Project',
                t: 8,

                // TQMS#496011 preserve the root folder if specified
                rtf: project.rtf
            });
        });

        return projectList;
    }

    /**
     * Handler for when a item is selected in the {@link mstrmojo.android.large.ProjectBrowser}.
     *
     * @private
     */
    function handleSelectedItem() {
        var projectBrowser = this.projectBrowser,
            item = projectBrowser.items[projectBrowser.selectedIndex],
            currentState = getState.call(this),
            newState = $HASH.copy(currentState);

        // Remove the item from the newState because we don't know which item should be selected.
        delete newState.item;

        // Is this the shared library folder request?
        if (item.act === 5) {

            var projectList = getProjectList.call(this);

            if (projectList.length < 1) {
                // Clear the selection before throwing the error.
                projectBrowser.clearSelect();
                throw new Error(mstrmojo.desc(8394, "No projects configured."));
            }

            // Do we have only on configured project?
            if (projectList.length === 1) {
                // Overwrite selected item with single project item.
                item = projectList[0];

            } else {

                // Add new items, title and description to the newState.
                newState.items = projectList;
                newState.ttl = item.txt;
                newState.item = {
                    st: 'Project'   // Simulate a project item.
                };

                // Reset selected index because no projects should be selected.
                newState.idx = -1;

                // Apply the new state.
                applyState.call(this, newState, currentState);

                // We're done.
                return;
            }
        }

        var subType = item.st,
            projectId = item.pid,
            // Is this a project (by subtype or presence of systemFolder and no root folder specified)?
            isProject = ((subType === 'Project') || item.systemFolder);

        // Are we opening a folder or project?
        if (isProject || subType === 2048) {
            $MAPF(true, CLASS_NAME, 'browseFolder');

            // Are we coming from the shared library?
            if (isProject) {
                // Set project ID from item id.
                projectId = item.did;

                // Set the system folder to shared reports and sub type to folder.
                item.systemFolder = 7;
                item.st = 2048;
            }

            // Did we find a projectId?
            if (projectId) {
                // Notify app that the project ID is changing.
                mstrApp.setCurrentProjectId(projectId);
            }

            var id = this.id;

            //Inherit csp from browser's state
            item.csp = item.csp || this.csp;

            //Remember final csp state
            this.csp = item.csp;

            // Request folder contents from data provider.
            this._folderDataService.getData(item, {
                success: function (res) {
                    // Get new items.
                    var items = res.items || [],
                        newItem;

                    // Add new items and title to the new state.
                    newState.items = items;
                    newState.ttl = res.n;

                    // Default to selected index of 0.
                    newState.idx = 0;
                    newState.csp = item.csp;

                    // Iterate items.
                    $ARR.forEach(items, function (item, idx) {
                        // Is this item NOT a folder?
                        if (item.st !== 2048 && projectBrowser.canClick(item)) {
                            // Cache new item.
                            newItem = item;

                            // Update newState with index of item.
                            newState.idx = idx;

                            // Return false to halt iteration.
                            return false;
                        }
                    });

                    // Set newState item to either the found item, or the first item if none found.
                    newState.item = newItem || items[0];

                    // Apply the new state.
                    applyState.call(mstrmojo.all[id], newState, currentState);

                    $MAPF(false, CLASS_NAME, 'browseFolder');
                },
                failure: function () {
                    // Clear selected indices.
                    projectBrowser.clearSelect();
                }
            });
        } else {
            if (item.rtf) {
                // Are we coming from the shared library?
                if (isProject) {
                    // Set project ID from item id.
                    projectId = item.did;
                }
            }

            // Did we find a projectId?
            if (projectId) {
                // Notify app that the project ID is changing.
                mstrApp.setCurrentProjectId(projectId);
            }

            // Remove items from current state since we are not replacing them.
            delete newState.items;

            // Add item to state.
            newState.item = item;

            // Apply the new state.
            applyState.call(this, newState);
        }
    }

    /**
     * Spawns (and passes control to) a new controller for the view sub type specified.
     *
     * @param {String} subType The sub type of view requested (see {@link mstrmojo.ViewController.getViewKey}).
     * @param {Object} [params] An optional set of parameters to be passed to the new controller.
     */
    function spawnNewView(subType, params) {
        // We need to use a copy of params as subsequent code modifies them.
        params = $HASH.copy(params, {});

        // Spawn new controller.
        var controller = this.controller;
        controller.spawn(mstrApp.viewFactory.newScreenController(controller.getViewKey(subType), params), params);
    }

    //TQMS 526661 We must modify GUI when network connectivity changes
    function onConnectivityChanged(isOnline) {

        var projectBrowser = this.projectBrowser,
            item = projectBrowser.items[projectBrowser.selectedIndex],
            st = item && parseInt(item.st, 10);

        if (st && st !== 'Project' && st !== 2048) {
            this.btnView.set('visible', projectBrowser.canClick(item));
        }

        this.refresh();
    }

    //TQMS 524872. When reconcile cycle finished we need to update the "Cached on" field.
    function onReconcileEnd() {
        var projectBrowser = this.projectBrowser,
            item = projectBrowser.items[projectBrowser.selectedIndex],
            st = item && parseInt(item.st, 10);

        if (st && st !== 'Project' && st !== 2048) {
            this.lblCachedOn.set('text', getCachedTime(item));
        }
    }

    /**
     * Main Widget class for mobile applications.
     *
     * @class
     * @extends mstrmojo.Container
     *
     * @borrows mstrmojo._FillsBrowser
     * @borrows mstrmojo.android._IsRootView
     */
    mstrmojo.android.large.AppBrowser = mstrmojo.declare(
        mstrmojo.Container,

        [ mstrmojo._HasLayout ],

        /**
         * @lends mstrmojo.android.large.AppBrowser.prototype
         */
        {
            scriptClass: "mstrmojo.android.large.AppBrowser",

            supportedDefaultMenus: $MENUS.SETTINGS + $MENUS.HELP,

            markupString: '<div id="{@id}" class="mstrmojo-AppBrowser {@cssClass}" style="{@cssText}">' +
                              '<div>' +
                                  '<div class="nav-panel"></div>' +
                                  '<div class="content-panel"></div>' +
                              '</div>' +
                          '</div>',

            markupSlots: {
                navNode: function () { return this.domNode.firstChild.firstChild; },
                containerNode: function () { return this.domNode.firstChild.lastChild; }
            },

            markupMethods: {
                onvisibleChange: function () { this.domNode.style.display = (this.visible) ? 'table' : 'none'; }
            },

            layoutConfig: {
                w: {
                    navNode: '340px',
                    containerNode: '100%'
                },
                h: {
                    navNode: '100%',
                    containerNode: '100%'
                }
            },

            //TQMS 506068
            //Check subscription cache flag. We set it to true if a configuration folder
            //has corresponding property set to true.
            //We pass it to the data service, which passes it to backend code so they know that they need to check
            //subscription caches for live reports executed from this folder and its subfolders.
            csp: false,

            init: function init(props) {
                this._super(props);

                var publisher = mstrmojo.publisher,
                    noSrc = publisher.NO_SRC,
                    id = this.id;

                //TQMS 526661 We need to know when connectivity changes
                publisher.subscribe(noSrc, publisher.CONNECTIVITY_CHANGED_EVENT, onConnectivityChanged, id);

                //TQMS 524872. Listen to the reconcile cycle finished event to update the "Cached on" field.
                publisher.subscribe(noSrc, publisher.RECONCILE_END_EVENT, onReconcileEnd, id);

                // Is this a micro tablet?
                if (mstrApp.isMicroTablet()) {
                    // Add micro css class.
                    mstrmojo.css.addWidgetCssClass(this, 'micro');
                }
            },

            children: [{
                scriptClass: 'mstrmojo.android.large.ProjectBrowser',
                slot: 'navNode',
                alias: 'projectBrowser',
                postselectionChange: function postselectionChange(evt) {
                    // Where any selections added?
                    var added = evt.added;
                    if (added) {
                        // Handle the selection.
                        handleSelectedItem.call(this.parent);
                    }
                }
            }, {
                scriptClass: 'mstrmojo.Image',
                alias: 'imgPreview',
                cssClass: 'prv',
                ignoreLayout: true,
                visible: false,
                onload: function () {
                    // Image is done loading so toggle opacity to 1.0.
                    togglePreviewCtrl(this, 1);
                }
            }, {
                scriptClass: 'mstrmojo.Label',
                alias: 'lblName',
                cssClass: 'nm',
                ignoreLayout: true,
                visible: false
            }, {
                scriptClass: 'mstrmojo.Label',
                alias: 'lblDesc',
                cssClass: 'ds',
                ignoreLayout: true,
                text: mstrmojo.desc(8389, 'Select a folder to view contents')
            }, {
                scriptClass: 'mstrmojo.Label',
                alias: 'lblCachedOn',
                cssClass: 'ds',
                ignoreLayout: true,
                text: ''
            }, mstrmojo.Button.newAndroidButton('View', function () {
                // Get selected item from project browser.
                var projectBrowser = this.parent.projectBrowser,
                    item = projectBrowser.items[projectBrowser.selectedIndex];

                // Spawn new view.
                spawnNewView.call(this.parent, item.st, item);
            }, {
                alias: 'btnView',
                ignoreLayout: true,
                visible: false
            })],

            start: function start() {
                // Create folder data service to use for folder requests.
                this._folderDataService = mstrApp.viewFactory.newFolderDataService();

                // Get homescreen configuration.
                var cfg = mstrApp.getConfiguration(),
                    hsType = cfg.getHomeScreenType(),
                    hsCfg = cfg.getHomeScreen(),
                    projectBrowser = this.projectBrowser,
                    title = hsCfg.ttl || mstrmojo.desc(5088, "MicroStrategy Mobile"),
                    btns = [];

                // Populate the browser depending on the type of homescreen [#494495]
                switch (hsType) {
                case 1:     // default
                case 2:     // custom
                    // Filter configuration buttons to only show...
                    btns = $ARR.filter(hsCfg.btns, function (btn) {
                        // 'Shared Library' and result set objects.
                        return (btn.act === 5 || btn.st);
                    });

                    // Set text of view button.
                    this.btnView.text = mstrmojo.desc(8411, 'View');
                    break;

                case 3:     // Result Set object
                    // Set the current project ID from the config.
                    mstrApp.setCurrentProjectId(hsCfg.pid);

                    // Spawn the resultset view.
                    spawnNewView.call(this, hsCfg.st, hsCfg);

                    // TQMS #553057: Return false to indicate that the app browser will not be shown.
                    return false;

                case 4:    // folder
                    var oi = hsCfg.oi,
                        defaultBtns = [ oi ],
                        methodName = 'browseFolder';

                    // Get the title from the oi.
                    title = oi.n;

                    // Set current project ID from oi.
                    mstrApp.setCurrentProjectId(oi.pid);

                    // Pass csp to the data service and remember it in our state.
                    this.csp = oi.csp = !!hsCfg.csp;

                    // TQMS #506080: Request folder contents from data provider.
                    this._folderDataService.getData(oi, {
                        submission: function () {
                            $MAPF(true, CLASS_NAME, methodName);
                        },
                        success: function (res) {
                            projectBrowser.set('items', res.items || defaultBtns);
                        },
                        failure: function () {
                            projectBrowser.set('items', defaultBtns);
                        },
                        complete: function () {
                            $MAPF(false, CLASS_NAME, methodName);
                        }
                    });
                    break;
                }

                // Set homescreen items in the Project Browser.
                projectBrowser.set('items', btns);

                // Update root view title.
                this.parent.updateTitle(title);

                // TQMS #553057: Return true to indicate that the app browser will be visible.
                return true;
            },

            beforeViewVisible: function beforeViewVisible() {
                // Refresh the current state (to update previews).
                applyState.call(this, getState.call(this));
            },

            getPreviewSize: function getPreviewSize() {
                return this._previewSize;
            },

            onPreviewReady: function onPreviewReady(src) {
                // Do we have a preview source?
                if (src) {
                    var imgPreview = this.imgPreview;

                    // Does the existing image source not match the new source?
                    if (imgPreview.src !== src) {
                        // Set preview opacity to 0 so the image doesn't flash when we set the source.
                        togglePreviewCtrl(imgPreview, 0);

                        // Reset the class name.
                        imgPreview.domNode.className = PREVIEW_CLS_NAME;

                        // Set the new source.
                        imgPreview.set('src', src);
                    }
                }
            },

            populateActionMenu: function populateActionMenu(config) {
                // Are we currently browsing a folder?
                if (this._mode === MODE_FOLDER) {
                    // Add refresh item to menu.
                    config.addItem(REFRESH, mstrmojo.desc(773, 'Refresh'), REFRESH, true, 5);
                }
            },

            handleMenuItem: function handleMenuItem(group, command) {
                // Is this a refresh command?
                if (group === REFRESH) {
                    /*
                    //Debugging of offline mode
                    if ( ! mstrApp.onMobileDevice() ) {
                        mstrMobileApp.onlineFlag = ! mstrMobileApp.onlineFlag;
                        mstrApp.onConnectivityChanged(mstrMobileApp.onlineFlag);
                        return;
                    }
                    */
                    // Get current state and cache selected item.
                    var state = getState.call(this),
                        selectedId = state.item.did,
                        methodName = 'refreshFolder',
                        me = this,
                        item = stateCache[stateCache.length - 1].item;

                    if (item.act === 5) {
                        var projectList = getProjectList.call(this);

                        // Do we have only one configured project?
                        if (projectList.length === 1) {
                            // Overwrite selected item with single project item.
                            item = projectList[0];

                            // Is this a project (by subtype or presence of systemFolder)?
                            if ((item.st === 'Project') || item.systemFolder) {
                                // Set the system folder to shared reports and sub type to folder.
                                item.systemFolder = 7;
                                item.st = 2048;
                            }
                        }
                    }

                    // Request folder contents from data provider (using item from most recent state).
                    this._folderDataService.getData(item, {
                        submission: function () {
                            $MAPF(true, CLASS_NAME, methodName);
                        },
                        success: function (res) {
                            // Get new items.
                            var items = state.items = res.items || [],
                                foundIdx = -1;

                            // Iterate items.
                            $ARR.forEach(items, function (item, idx) {
                                // Have we not found the item yet, and is this item a folder?
                                if (foundIdx === -1 && item.st !== 2048) {
                                    // Default position will be first non folder object.
                                    foundIdx = idx;
                                }

                                // Does this item match the current item ID?
                                if (item.did === selectedId) {
                                    // Current item is still present so we will select it.
                                    foundIdx = idx;

                                    // Return false to halt iteration.
                                    return false;
                                }
                            });

                            // Did we not find an item but do we have items?
                            if (foundIdx === -1 && items.length) {
                                // Default item will be the first one.
                                foundIdx = 0;
                            }

                            // Set selected index and item on state.
                            state.item = items[foundIdx];
                            state.idx = foundIdx;

                            // Apply the new state (without old state so we don't cache a new state).
                            applyState.call(me, state);
                        },
                        complete: function () {
                            $MAPF(false, CLASS_NAME, methodName);
                        }
                    }, true);
                }
            },

            goBack: function goBack() {
                // Do we have a previous state?
                var state = stateCache.pop();
                if (state) {
                    // Apply the last state.
                    applyState.call(this, state);

                    // Return true to indicate that we handled this back operation.
                    return true;
                }

                // Return false to indicate that we did not handle this back operation.
                return false;
            },

            goHome: function goHome(details) {
                // Retrieve the first state.
                var state = stateCache.shift();
                if (state) {
                    // Remove the item so nothing will be selected.
                    delete state.item;
                    state.idx = -1;

                    // Apply the first state.
                    applyState.call(this, state);

                    // Empty the state cache.
                    stateCache = [];
                }
                if (details && details.connectivityChanged) {
                    this.start();
                }
            }
        }
    );
}());