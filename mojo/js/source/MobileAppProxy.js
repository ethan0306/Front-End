/**
 * MobileAppProxy.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 * @fileoverview Proxy object to handle interactions with the native Mobile application shell when running a Mobile Application hosted within a web browser.
 */
(function () {
    
    mstrmojo.requiresCls("mstrmojo.dom",
                         "mstrmojo.storage.DOMLocalStorage",
                         "mstrmojo.DebugResSetStore",
                         "mstrmojo.BarcodeReader",
                         "mstrmojo.SimpleXHR"
                     );
    
    var $D = mstrmojo.dom,
        _cfgKey = "DefaultMobileDeviceConfig",
        _diagnosticModeKey = "DiagnosticMode",
        debug = false,
        startProfile = 0,
        OR_PORTRAIT = 1,
        OR_LANDSCAPE = 2,
        lockedOrientation = 0,
        profileData;    
        

    /**
     * Logs trace logging calls to the window.console.
     * 
     * @param {String} direction 'enter' or 'exit'.
     * @param {String} when The time in milliseconds.
     * @param {String} methodName The name of the method.
     * @param {String} className The name of the class.
     * 
     * @private
     */
    function logJsMethod(direction, when, methodName, className) {
        // Are we debugging?
        if (debug) {
            // Create identifier.
            var id = className + '::' + methodName;
            
            // Is this an entry log?
            if (direction) {
                // Do we have not profile data yet?
                if (!profileData) {
                    // Set start time and initialize profile data.
                    startProfile = when;
                    profileData = {};
                }
                
                // Store current when as method start time.
                profileData[id] = when;
                
                // Log enter item.
                console.log(id + ' enter: ' + (when - startProfile));
                
            } else {
                // Log exit item.
                console.log(id + ' exit: ' + (when - startProfile) + '\t' + (when - profileData[id]));
                
                // Kill profile data for this method.
                delete profileData[id];
                
                // Is profile data empty?
                if (mstrmojo.hash.isEmpty(profileData)) {
                    // Kill profile data.
                    profileData = null;
                }
            }
        }
    }
    
    /**
     * Logs passed arguments to the console if the static debug flag is true.
     * 
     * @private
     */
    function debugLog() {
        if (debug) {
            console.log('Log:', arguments);
        }
    }
    
    /**
     * XHR transport for use in development mode. 
     * 
     * @private
     */
    window.mstrMobileApp = {
        
        /**
         * Flag to indicate that the proxy is being used.
         */
        isProxy: true,
        
        setTaskServletName: mstrmojo.emptyFn,
        putSession:  mstrmojo.emptyFn,
        setBinaryFormat: mstrmojo.emptyFn,
        setDiagnosticMode: mstrmojo.emptyFn,
        
        useBinaryFormat: function () {
            return false;
        },

        getDiagnosticMode: function() {
            return $LS.getItem(_diagnosticModeKey) === true;
        },     
        
        // Stub for CSPAT Lite profiling.
        enterJavaScriptMethod: function (when, methodName, className) {
            logJsMethod(true, when, methodName, className);
        },
        
        // Stub for CSPAT Lite profiling.
        exitJavaScriptMethod: function (when, methodName, className) {
            logJsMethod(false, when, methodName, className);
        },
        
        reloadDefaultConfiguration: function () {
            return true;
        },
        
        takeScreenShot: function () {
            debugLog('take screen shot', arguments);            
        },
        
        getScreenShot: function () {
            debugLog('retrieve screen shot', arguments);
            return '';
        },
        
        getDeviceDPI: function getDeviceDPI() {
            var dimensions = mstrApp.getScreenDimensions(),
                h = dimensions.h,
                w = dimensions.w,
                dpi = 160;
            
            if (h < 400 || w < 400) {
                dpi = 120;
            } else if (h > 1000 || w > 1000) {
                dpi = 320;
            } else if (h > 400 || w > 400) {
                dpi = 240;
            }
            
            return dpi;
        },

        getGeoLocation: function getGeoLocation(callbackName) {
            var cb = mstrmojo.hash.walk(callbackName);
            cb({
                coords: {
                    latitude: 38.916138, 
                    longitude: -77.2183157, 
                    altitude: 0
                }
            });
            //cb({success: false , msg: "blah, blan"});
        },
        
        isTablet: function isTablet() {
            return (mstrApp.deviceType === 4);            
        },
        
        /**
         * Show the wait message on the Mobile App Proxy since we don't have a progress bar. 
         */
        showProgress: function showProgress() {
            mstrApp.showMessage('[Progress]');
        },
        
        /**
         * Hide the message whenever we hide the progress bar.
         */
        hideProgress: function hideProgress() {
            mstrApp.hideMessage();
        },
        
        /**
         * Loads specified URL into web view
         */        
        loadURL: function (url) {
            window.location = url;
        },
        
        setSysMenu: function setSysMenu(id, groups, labels, actions, checked, icons) {
            //debugLog('menu', arguments);
            var view = mstrmojo.all[id],
                dialog,
                items = [];
        
            // Create set of dialog items from menu items.
            mstrmojo.array.forEach(labels, function (txt, idx) {
                items.push({
                    n: txt,
                    v: groups[idx] + '|' + actions[idx]
                });
            });
            
            // Iterate up the parent chain from the current view.
            var menuHostView;
            while (view) {
                // Can this view host a title bar button?
                if (view.createTitleBarButton) {
                    // Cache reference to view and halt iteration.
                    menuHostView = view;
                    break;
                }
                
                // Check parent.
                view = view.parent;
            }
            
            // Did we find a menu host?
            if (menuHostView) {
                // Create the title bar button.
                menuHostView.createTitleBarButton('hostedMenuBtn', function () {
                    // Notify app that menu is about to be shown.
                    mstrApp.menuShown();
                    
                    // Show menu dialog.
                    dialog = mstrApp.showDialog({
                        cssClass: 'mstrmojo-SimpleOptions',
                        buttons: [ mstrmojo.Button.newInteractiveButton('Cancel') ],
                        children: [{
                            scriptClass: 'mstrmojo.android.SimpleList',
                            isElastic: true,
                            items: items,
                            postselectionChange: function (evt) {
                                // Close the dialog.
                                dialog.close();
                                
                                // Handle the menu item.
                                mstrmojo.all[id].handleMenuItem(this.items[evt.added[0]].v);
                            }
                        }]
                    });
                }, 'Menu');
                
            }
        },
        
        allowLandscapeOrientation: function () {
            debugLog('orientation', arguments);
        },
        
        setWaitScreenVisibility: function () {
            debugLog('wait screen visibility', arguments);
        },
        
        resetDPC: function () {
            debugLog('reset device passcode', arguments);
        },
        
        openLink: function (uri, target) {
            debugLog('openLink', arguments);
            window.open(uri, (target || '_blank'));
        },
        
        displayHelp: function () {
            debugLog('help');
            window.open('http://www.microstrategy.com/producthelp/mobile/Android/9.2.1a/en/index.html', 'mstrHelp');
            return '';
        },
                
        getLocaleInfo: function() {
            debugLog('getLocale', arguments);
            // locale support for native environment.  Currently using english us as default.  If want to test for a different locale just update the lan and cntry var values.  
            var lan = "en",
                cntry = "_US";
            return "metadataLocale:" + lan + ",displayLocale:" + lan + ",messagesLocale:" + lan + ",warehouseDataLocale:" + lan + ",numberLocale:" + lan + cntry + ",numberLocaleOverride:true";
        },
        
        getResourceBundleJson: function() {
            debugLog('getResourceBundleJson', arguments);
        },
        
        displaySelectBox: function (cb) {
            debugLog("select_box", arguments);
            cb(1);
        },
        
        getScreenDimensions: function getScreenDimensions() {
            var body = document.body;
            return body.offsetHeight + '|' + body.offsetWidth;
        },
        
        /**
         * Proxy for the method that returns the orientation of the device.
         */
        getOrientation: function() {
            var body = document.body;
            return body.offsetWidth < body.offsetHeight ? OR_PORTRAIT : OR_LANDSCAPE;   
        },
        
        
        /**
         * Proxy for the method that saves the device configuration; in host environment this method updates the config. stored in DOM local storage
         * @param {String} newCfg New configuration data in JSON form
         */
        
        saveConfiguration: function (newCfg) {
            $LS.setItem(_cfgKey, newCfg, -1);
        },
        
        /**
         * Retrieves the device configuration; in hosted environment the device configuration is retrieved from the DOM local storage if exists
         * otherwise returns a hard coded default.
         * @returns Configuration data in JSON form
         * @type String
         */
        getConfiguration: function () {
            var cfg = $LS.getItemAsString(_cfgKey);
            if (!cfg) {
                cfg = '{"n":"Android","cid":"be4dc468-c070-429f-a8f2-f57491b99c36","v":1,"bld":"9.2.300.069J","dt":3,"cntr":0,"lnk":{"am":1,"rt":0,"nm":"","po":-1,"ipo":true},"gnl":{"ml":250,"nt":60,"ll":12,"mls":50,"uas":true,"usc":true,"usl":true,"usd":true,"fc":true,"mgc":10,"plc":2,"cc":1,"pe":-1,"uptc":-1,"cvi":600,"sci":600,"pn":2,"rar":5,"es":true,"efs":true,"art":2,"ucs":false,"cs":"","ipe":false,"dmatp":10,"dcn":4,"dd":0,"dtm":true,"drn":false,"drsc":false,"drcl":false},"cty":{"am":1,"ow":false,"wsl":[{"nm":"10.21.16.91","po":"8080","pt":"mobile","ty":0,"rt":0,"udc":false,"wsc":{"am":1,"lo":"","ps":""},"pdc":{"am":1,"lo":"","ps":""},"pl":[{"pc":{"am":1,"lo":"mhaugen","ps":""},"pn":"MicroStrategy Tutorial (for RW)","sn":"intqe64-1","sp":0,"udc":false,"pid":"51D31B4070ABC9D9A7F7C2A743352574"},{"pc":{"am":1,"lo":"mhaugen","ps":""},"pn":"MicroStrategy Tutorial (for RW)","sn":"intqe64-2","sp":0,"udc":false,"pid":"8766A305D2D235181079A1D2A5A1565D"}]}]},"hsc":{"tp":1,"cst":{"fmt":{"bkg":{"tp":1,"fll":{"tp":0,"clr":0}},"ttl":{"tp":1,"cap":"MicroStrategy Mobile"},"btn":{"fnt":16777215,"stl":2,"brd":16777215,"fll":{"tp":0,"clr":2500134}},"btnl":{"rc":3,"cc":1},"vw":{"rpt":true,"rct":true,"stg":true,"hlp":true}},"btns":[{"act":5,"cap":"Shared Library","dsc":"Navigates to the default folder of the project(s) in the deployment.","icn":1},{"act":4,"cap":"Settings","dsc":"Opens the Application Settings dialog.","icn":1},{"act":6,"cap":"Help","dsc":"Displays the application\'s Help file.","icn":1}]}}}';
                this.saveConfiguration(cfg);
            }
            
            return cfg;            
        },
        
        goBack: mstrmojo.emptyFn,

        getResSetStore: function getResSetStore(projId) {
            //return null;
            return new mstrmojo.DebugResSetStore(projId);
        },
        
        getResSetStoreMgr: function getResSetStoreMgr() {
            if (!this.resSetStoreMgr) {
                this.resSetStoreMgr = {
                    getResSetStore: function getResSetStore(projId) {
                        //return null;
                        return new mstrmojo.DebugResSetStore(projId);
                    },
                    removeProjectCaches: function removeProjectCaches(projId) {
                        var store = new mstrmojo.DebugResSetStore(projId);
                        store.removeProjectCaches(projId);
                    },
                    clear: function clear() {
                        var store = new mstrmojo.DebugResSetStore();
                        store.clear();
                    }
                };
                return this.resSetStoreMgr;
            }
            mstrMobileApp.getResSetStoreMgr();
        },
        
        loadMap: function () {
            debugLog("load map", arguments);
        },
        
        getAppVersion: function () {
            return "9.2.205.049";
        },
        
        getTextAsset: function (path) {
            var xhr = new mstrmojo.SimpleXHR({ 
                    isTask: false, 
                    async: false 
                }),
                results = "";
                
            // Make request to XHR.
            xhr.request('GET', "../assets/" + path, {
                success: function (res) {
                    results = res;
                }                
            });
            return results;
        },

        hasCertificate: function hasCertificate() {
            return false;
        },
        getCertificateAuthenticationFields: function getCertificateAuthenticationFields() {
            return "{\"login_info\":{\"field\":[{\"n\":\"login\",\"tp\":\"text\",\"dn\":\"Login: \"},{\"n\":\"pwd\",\"pass\":true,\"tp\":\"text\",\"dn\":\"Password: \"}],\"msg\":\"Please enter credentials for the certificate server.\"}}";
        },
        getNewCertificate: function getNewCertificate(settings) {
            // alert(JSON.stringify(settings));
            // return "{ \"message\": \"(Incorrect login\\/password.[User not found.])\", \"code\": \"-5\"}";
            return "{\"prs\":{\"pr\":[{\"n\":\"edat\",\"v\":1345242803706},{\"n\":\"issr_n\",\"v\":\"1.2.840.113549.1.9.1=#1616686c6565406d6963726f73747261746567792e636f6d,cn=was-tzlee77.corp.microstrategy.com,o=microstrategy,l=vienna,st=virginia,c=us\"}]}}";
        },
        getCertificateDetails: function getCertificateDetails() {
            return "{\"prs\":{\"pr\":[{\"n\":\"edat\",\"v\":1345242803706},{\"n\":\"issr_n\",\"v\":\"1.2.840.113549.1.9.1=#1616686c6565406d6963726f73747261746567792e636f6d,cn=was-tzlee77.corp.microstrategy.com,o=microstrategy,l=vienna,st=virginia,c=us\"}]}}";
        },
        
        readBarcodes: function readBarcodes(id, paramStr, callbackStr) {
            if (!paramStr) {
                var bv = '28536598';
                alert("Barcode value: " + bv);
                mstrmojo.BarcodeReader.onBarcodeResult(id, -1, bv);
                return;
            }
            
            var params = JSON.parse(paramStr),
                es = mstrApp.viewFactory.newElementDataService();
            
            params.searchPattern = "28536598";
            es.getElements(params, {
                success: function (res) {
                    mstrmojo.BarcodeReader.onBarcodeResult(id, -1, JSON.stringify(res));
                },
                failure: function (details) {
                    alert("---Failed");
                }
            });
        },
        
        uploadPhotos: function(paramstr, callback){
            eval(callback + "('http://www.google.com.hk/intl/zh-CN/images/logo_cn.png', 'google_logo');");
        },
        
        getCachedTime: function getCachedTime(did, st) {
            //For debugging purposes
            return new Date().getTime() - 240000;
        },
        
        isDPCEnabled: function isDPCEnabled() {
            return false;
        },
        
        lockOrientation: function lockOrientation(or) {
            debugLog("lock orientation", arguments);
            lockedOrientation = or;
        },
        
        releaseOrientation: function releaseOrientation() {
            debugLog("release orientation", arguments);
            lockedOrientation = 0;
        },
        
        getLockedOrientation: function getLockedOrientation() {
            return lockedOrientation;
        },
        
        forceRepaint: function forceRepaint() {
            // Do nothing for now.
        },
        
        onlineFlag: true,
        
        isOnline: function isOnline() {
            return this.onlineFlag;
        },
        
        isCached: function isCached(realPid, oid, t) {
            return false;
        }
    };

    // Attach an event handler so that the backspace key will step backwards through the mobile app.
    $D.attachEvent(document.body, 'keydown', function (e) {
        e = e || window.event;
        var kc = e.keyCode || e.which;
        
        if ((kc === 8) && !e.shiftKey) {
            // if the target of the keydown is an INPUT element (but not a SELECT) then
            // use the default behavior.
            if (e.target.nodeName.match(/INPUT/i) && !e.target.type.match(/SELECT/i)) {
                return true;
            }
            
            $D.preventDefault(window, e);
            $D.stopPropogation(window, e);
            mstrmojo.all.mobileApp.goBack();
            return false;
        }
        return true;
    });
    
}());