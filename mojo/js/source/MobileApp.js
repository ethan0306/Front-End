/**
 * MobileApp.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */

(function () {

    mstrmojo.requiresCls("mstrmojo.hash", 
                         "mstrmojo.func", 
                         "mstrmojo.Obj",
                         "mstrmojo.dom",
                         "mstrmojo.android.Dialog",
                         "mstrmojo._CanMakeServerProxyRequests");
    
    var $DOM = mstrmojo.dom,

    /**
     * Stack to hold open dialogs.
     * 
     * @private
     * @type {mstrmojo.android.Dialog[]}
     */
        dialogs = [],
    
    /**
     * Hash map of all listeners, keyed by event name. Value of the hash map is a stack of listeners.
     * 
     * @private
     * @type {object}
     */
        lisStacks = {},
        cachedMicroTablet;

    /**
     * Called to handle a negative result from an XHRrequest. Checks for specific HTTP headers,
     * XHR response text, etc.
     * 
     * @param {Object} Results from the XHR request
     * @param {mstrmojo.MobileApp} [app] Optional {@link mstrmojo.MobileApp} that failed.
     * 
     * @private
     */
    function handleError(res, app) {
        var msg = [],
            map = {
                title: '',
                message: mstrmojo.desc(6828) + " ",
                sourceURL: 'Source URL: ',
                fileName: 'File: ',
                lineNumber: 'Line: ',
                line: 'Line: '
            };

        // Make sure res exists.
        res = res || {};

        // Iterate map and create message.
        mstrmojo.hash.forEach(map, function (v, n) {
            if (res[n] !== undefined) {
                msg.push(v + res[n]); 
                
                if (n === 'title') {
                    msg.push('');
                }
            }
        });
        
        // Does the object have a response header?
        if (res.getResponseHeader) {
            // Add the response header.
            msg.push('XHR: ' + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
        }
        
        // Convert to string.
        msg = msg.join('\n');
        
        // Do we have an app?
        if (app && app.rootView) {
            // Make sure the message is hidden.
            app.rootView.hideMessage();
        }
        
        if (!res.handledError && msg.length > 0) {
            mstrmojo.alert(msg);
            res.handledError = true;
        }
        
        mstrmojo.dbg(res.stack || msg);
    }
    
    function onWindowError(errMsg, fName, lineNum) {
        handleError({ 
            message: errMsg, 
            fileName: fName, 
            lineNumber: lineNum 
        });
    }

    /**
     * A singleton class representing mobile application. It provides application entry point as
     * well as a bunch of application-level services. Any code within the application can access the
     * instance of this class via mstrApp global variable.
     * 
     * @class
     * @extends mstrmojo.Obj
     * 
     */
    mstrmojo.MobileApp = mstrmojo.declare(
        mstrmojo.Obj,
        
        [ mstrmojo._CanMakeServerProxyRequests ], // mixins

        /**
         * @lends mstrmojo.MobileApp.prototype
         */
        {
            scriptClass: "mstrmojo.MobileApp",
            
            /**
             * The instance of {@link mstrmojo.ServerProxy} to use for communication with the server.
             * 
             *  @type mstrmojo.ServerProxy
             */
            serverProxy: null,
            
            /**
             * Whether it is a mobile app
             * @type Boolean
             */
            isMobile: true,
            
            init: function init(props) {
                this._super(props);
                var fn = window.onerror;
                window.onerror = (fn) ? mstrmojo.func.composite([ onWindowError, fn ]) : onWindowError;
                //alert("MobileApp.init 2");
                
                // hook up privledged method
                this.handleError = handleError;
            },
            
            /**
             * Application entry point.
             * 
            */
            start: function start() {
                var app = mstrMobileApp;
                app.setTaskServletName(mstrConfig.taskURL);
                
                // read the device specific json text file and than load it to the map
                //
                // Note: Do this ASAP so that other components have access to the translated strings.
                //
                var descriptors = eval(String(app.getResourceBundleJson()));
                //initialize the mojo descriptors map from the descriptors
                if (descriptors && descriptors !== "") {
                    mstrmojo.populateDescriptors(descriptors);
                }
                               
                var cfg = this.getConfiguration(),
                    diagnosticMode = cfg.getDiagnosticMode();
                
                app.setDiagnosticMode(diagnosticMode);
        
                this.diagnosticMode = diagnosticMode;
                this.useBinaryFormat = cfg.getBinaryMode();
                
                // Is the application NOT a tablet?
                if (!this.isTablet()) {
                    // Update for the current DPI.
                    mstrmojo.DPIManager.setDPI();
                }
            
                // Create view...
                var vw = this.rootView = this.viewFactory.newView('Root', {
                    id: "rootView",
                    placeholder: this.placeholder
                }); 
                
                // and render.
                vw.render();
                
                // Create controller...
                var ctlr = this.rootController = this.viewFactory.newRootController({
                    id: "rootController",
                    rootView: vw
                });
                
                // add reference for controller ID in view (use ID instead of instance to avoid leaks)...
                vw.controllerId = ctlr.id;
                
                // and start.
                ctlr.start();
                
            },
            
            restart: function restart() {
                if (this.rootController) {
                    this.rootController.restart();
                } else {
                    this.start();
                }
            },
            
            /**
             * @returns returns TRUE if we are running on a physical device and not a desktop browser.
             * 
             * @type Boolean
             */            
            onMobileDevice: function onMobileDevice() { 
                return mstrConfig.onMobileDevice;
            },
            
            /**
             * Indicates whether the Application is "touch" event enabled.
             * 
             * @type Boolean
             */
            isTouchApp: function isTouchApp() {
                // Willie Liao:  IE9 on Windows Phone does not support touch APIs.
                return ($DOM.isIPad || $DOM.isAndroid || mstrApp.onMobileDevice()) && !$DOM.isWinPhone;
            },
            
            /**
             * @returns TRUE if the root view is in landscape mode.
             */
            isLandscape: function isLandscape() {
                var rv = this.rootView;
                return (parseInt(rv.width, 10) > parseInt(rv.height, 10));
            },

            /**
             * Returns the current mobile configuration for this application.
             * 
             * @returns mstrmojo.MobileConfiguration
             */
            getConfiguration: function getConfiguration() {
                if (!this._cfg) {
                    this._cfg = new mstrmojo.MobileConfiguration();
                }
                
                return this._cfg;
            },
            
            /**
             * Returns true if the current mobile configuration for this application indicates that the device is a table.
             * 
             * @type boolean
             */
            isTablet: function isTablet() {
                return mstrMobileApp.isTablet();
            },
            
            isMicroTablet: function isMicroTablet() {
                // Have we not determined micro tablet status?
                if (cachedMicroTablet === undefined) {
                    // Default to false.
                    cachedMicroTablet = false;
                    
                    // Is this a tablet?
                    if (this.isTablet()) {
                        // Get screen dimensions from device since the browser may not have any content yet, so it will be 0,0.
                        var dimensions = this.getScreenDimensions(),
                        	limit = 700; // TQMS 510759 change limit to 700 for micro tablet
                        
                        cachedMicroTablet = (dimensions.h < limit || dimensions.w < limit);
                    }
                }
                
                return cachedMicroTablet;
            },

            /**
             * <p>Will display the previous view.</p>
             */
            goBack: function goBack() {                
                // Tell booklet to turn back.  If it returns false that means there was nothing to 
                // turn back, so ask the mobile app shell to turn back. 
                return this.rootController.goBack() || mstrMobileApp.goBack();
            },
            
            /**
             * <p>Will display the root view.</p>
             */
            goHome: function goHome(details) {
                this.closeAllDialogs();
                this.rootController.goHome(details);
            },
            
            /**
             * Performs context sensitive search.
             * 
             * Asks current topmost controller to handler search
             */
            doSearch: function doSearch() {
                var s = lisStacks && lisStacks.search;
                if (s && s.length > 0) {
                    var l = s[s.length - 1]; // latest registered listener
                    // Invoke search function in the scope of the listener.
                    if (l.f) {
                        l.f.apply(l.t);
                    }
                }
            },
            
            /**
             * This method should be called before the device menu is shown to cleanup. 
             * 
             */
            menuShown: function menuShown() {
                // Do we have any visible dialogs?
                var dialogCnt = dialogs.length;
                if (dialogCnt) {
                    // Does the current dialog NOT interact with the menu button?
                    if (!dialogs[dialogCnt - 1].useMenu) {
                        // Close all dialogs.
                        this.closeAllDialogs();
                    }
                }
            },
            
            /**
             * Pushes this listener to stack and become current listener
             * 
             * @param name {String} event name
             * @param target {Object} the listener object
             * @param fn {Function} the function to invoke 
             */
            registerListener: function (name, target, fn) {
                var s = lisStacks[name] || [];
                
                s.push({
                    t: target,
                    f: fn
                });
                
                lisStacks[name] = s;
            },
            /**
             * Pops the current listener out
             * 
             * @param name {String} event name
             * @param target {Object} the listener object
             */
            unregisterListener: function (name, target) {
                var s = lisStacks[name],
                    l = s && s.pop();
                if (!l || l.t !== target) {
                    alert("Unregister Search listener out of order.");
                    if (s && l) {
                        s.push(l);
                    }
                }
            },
            getListener: function (name, target) {
                var s = lisStacks[name],
                    l = s && ((s.length) ? s[s.length - 1] : null);
                return ((l && l.t === target) ? l : null);
            },
            /**
             * <p>Cancel one of pending server requests or one of open dialogs.</p>
             * 
             * @returns true if something was canceled or false otherwise.
             */
            cancelPending: function cancelPending(dontCloseDialogs) {
                // Make sure the wait dialog is not visible.
                this.hideMessage();
                
                // tell the controller that we're cancelling pending requests so it can clear any UI
                if (this.rootController) {
                    this.rootController.cancelPending();
                }

                // Do we have a server proxy?
                var serverProxy = this.serverProxy;
                if (serverProxy) {
                    // Cancel all requests.
                    if (serverProxy.cancelRequests()) {
                        // Did we cancel?  YES, so nothing more to do.
                        return true;
                    }
                }
                
                return dontCloseDialogs || this.closeDialog(); // close any visible dialog

            },
            
            /**
             * Handles web window errors.
             */
            onerror: function onerror(res) {
                handleError(res, this);
            },
            
            /**
             * Shows the application level message.
             * 
             * @param {String} [text] A text to display. If missing then the wait message will be displayed.
             */
            showMessage: function showMessage(text) {
                if (this.rootView) {
                    this.rootView.showMessage(text);
                }
            },
            
            /**
             * Hides the application level message.
             */
            hideMessage: function hideMessage() {
                if (this.rootView) {
                    this.rootView.hideMessage();
                }
            },
            
            displayHelp: function displayHelp() {
                // Ask device to open help.
                var err = mstrMobileApp.displayHelp();
                
                // Did device call return an error?
                if (err) {
                    // Handle error.
                    mstrApp.onerror({
                        message: err
                    });
                }
            },
            
            /**
             * Pops up a {@link mstrmojo.android.Dialog} over the {@link mstrmojo.MobileApp}.
             * 
             * @param {Object} [dialogConfig] A configuration object with properties that will be passed to the {@link mstrmojo.android.Dialog}.
             */
            showDialog: function showDialog(dialogConfig) {
                // Add default script class (if needed).
                dialogConfig.scriptClass = dialogConfig.scriptClass || 'mstrmojo.android.Dialog';
                
                var cfg = mstrmojo.func.wrapMethods(dialogConfig, {
                    // Close handler.
                    onClose: function () {
                        dialogs.pop();
                    }
                });
                
                var d = dialogs[dialogs.push(mstrmojo.insert(cfg)) - 1];
                d.render();
				// TQMS 512699 We will trigger the browser to repaint itself to avoid partically painting issue
                window.setTimeout(function() {
                	// Force repaint from java side
                	mstrMobileApp.forceRepaint();
                }, 0);
                return d;
            },
            
            /**
             * Pops up a (@link mstrmojo.android.Popup) over the {@link mstrmojo.MobileApp}.
             * 
             * @param {Object} [popupConfig] A configuration object with properties that will be passed to the {@link mstrmojo.android.Popup}.
             * @param {HTMLElement} [anchor] An optional anchor for the popup.  If present the popup will appear just below the anchor witha callout arrow pointing up.
             */
            showPopup: function showPopup(popupConfig, anchor) {
                // Set script class.
                popupConfig.scriptClass = popupConfig.scriptClass || 'mstrmojo.android.Popup';
                
                // Do we have an anchor?
                if (anchor) {
                    // Add anchor to the config.
                    popupConfig.anchor = anchor;
                }
                
                // Use show dialog to display popup (so it will close on back arrow).
                return this.showDialog(popupConfig);
            },
            
            /**
             * Calls the {@link mstrmojo.android.Dialog.close} method to hides and destroys the current dialog.
             */
            closeDialog: function closeDialog() {
                if (dialogs.length) {
                    dialogs[dialogs.length - 1].close();
                    return true;
                }
                return false;
            },
            
            /**
             * Calls the {@link msrmojo.android.Dialog.close} method for every open dialog.
             * 
             */
            closeAllDialogs: function closeAllDialogs() {
                // Cache collection of dialogs (in case closing dialogs modifies dialog collection).
                var cDialogs = dialogs.slice(0),
                    dialog = cDialogs.pop();
                
                // Iterate dialogs.
                while (dialog) {
                    // Close this dialog.
                    dialog.close();
                    
                    // Get next dialog.
                    dialog = cDialogs.pop();
                }
                
                // Make sure dialogs collection is empty.
                dialogs = [];
            },
            
            setCurrentProjectId: function setCurrentProjectId(id) {
                this._currentProjId = id;
            },
            
            getCurrentProjectId: function getCurrentProjectId() {
                return this._currentProjId;
            },
            
            getSessionState: function getSessionState(projectId) {
                return this.serverProxy.getSession(projectId || this._currentProjId);
            },
            
            getContentDimensions: function getContentDimensions(supportsFullScreen) {
                return this.rootView.getContentDimensions(supportsFullScreen);
            },
            
            getScreenDimensions: function getScreenDimensions() {
                //I.B. On some devices (Samsung Galaxy S for example) strings returned from Java
                //are not absolutely compatible with JS strings. Concatenating them with empty
                //strings solves the problem.
                var deviceDimensions = String(mstrMobileApp.getScreenDimensions()).split('|');
                return {
                    h: parseInt(deviceDimensions[0], 10), 
                    w: parseInt(deviceDimensions[1], 10)
                };
            },
              
            getResSetStore: function getResSetStore() {
                return mstrMobileApp.getResSetStore(this.getCurrentProjectId());
            },
            
            getResSetStoreMgr: function getResSetStoreMgr() {
                return mstrMobileApp.getResSetStoreMgr();
            },
            
            removeProjectCaches: function removeProjectCaches(pid) {
                //TODO. Change code to call removeProjectCaches on the transport. (We probably need to add the 
                //      corresponding method to the JavaScript interface.
                if (this.getConfiguration().getCacheEnabled()) {
                    this.getResSetStoreMgr().removeProjectCaches(pid);
                }
            },
            
            doAfterAnimation: function doAfterAnimation(foo) {
                var fn = function () { 
                    // Kill the controllers views.
                    if (!mstrApp.animating) {
                        foo();
                    } else {
                        window.setTimeout(fn, 100);
                    }
                };
                fn();
            },
            
            getLocaleInfo: function getLocaleInfo(projectId) {
                projectId = projectId || this._currentProjId;
                return this.serverProxy.getLocaleInfo(projectId);
            },
            
            onConnectivityChanged: function onConnectivityChanged(onlineFlag) {
                var publisher = mstrmojo.publisher;
                publisher.publish(publisher.NO_SRC, publisher.CONNECTIVITY_CHANGED_EVENT, onlineFlag);
            },
            
            //TQMS 524872. This method is called from the Java code to notify web that a reconcile 
            //cycle ended
            onReconcileEnd: function onReconcileEnd() {
                var publisher = mstrmojo.publisher;
                publisher.publish(publisher.NO_SRC, publisher.RECONCILE_END_EVENT, null);
            }
        }
    );
    
    /**
     * Shortcut for logging JavaScript method enter and exit for CSPAT Lite.
     * 
     * @param {Boolean} direction True for enter method, False for exit method.
     * @param {String} className The name of the class that owns the method.
     * @param {String} [methodName] An optional name for the the method.  If this parameter is ommited the name will be retrieved using "arguments.callee.caller.name".
     * 
     * @memberOf mstrmojo.MobileApp
     * @static
     */
    mstrmojo.MobileApp.$PF = function (direction, className, methodName) {
        mstrMobileApp[((direction) ? 'enter' : 'exit') + 'JavaScriptMethod'](new Date().getTime(), methodName || arguments.callee.caller.name, className);
    };
    
    window.$MAPF = mstrmojo.MobileApp.$PF;
    
}());