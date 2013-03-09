/**
  * AndroidView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *    @version 1.0
  */
  /* 
  * @fileoverview <p>Widget for displaying a standard "Android" view with a titleNode slot and containerNode slot.</p>
  */

(function () {

    mstrmojo.requiresCls("mstrmojo.AndroidView",
                         "mstrmojo._HasSysMenu",
                         "mstrmojo.android.EnumMenuOptions",
                         "mstrmojo.Button",
                         "mstrmojo.hash",
                         "mstrmojo.array",
                         "mstrmojo.dom",
                         "mstrmojo.css",
                         "mstrmojo.MobileConfiguration"
                     );
    
    mstrmojo.requiresDescs(1, 1143, 7831);
    
    var $DOM = mstrmojo.dom;
    
    /**
     * Action constants
     *
     * @type Integer
     * @private
     */
    var MENUS = mstrmojo.android.EnumMenuOptions,
        GOTO_HOME = MENUS.HOME,
        GOTO_SETTINGS = MENUS.SETTINGS,
        GOTO_HELP = MENUS.HELP,
        DEFAULT_ALL = -1,
        originalTitleHeight;
    
    /**
     * Returns true if this view supports landscape mode.
     * 
     * @private
     * @type Boolean
     */
    function canDoLandscape() {
        var cc = this.contentChild;
        return (this.supportsLandscape && (!cc || !cc.isLandscapeSupported || cc.isLandscapeSupported()));
    }
    
    /**
     * Checks to see if the content child has the indicated method and calls the method if so.
     * 
     * @param {String} methodName The name of the method to call.
     * @private
     */
    function passCtrlToContent(methodName, args) {
        var contentChild = this.contentChild,
            fn = contentChild[methodName];
    
        if (fn) {
            fn.apply(contentChild, args || []);
        }
    }
    
    /**
     * <p>Widget for displaying a standard "Android" view with a titleNode slot and containerNode slot.</p>
     * 
     * @class
     * @extends mstrmojo.MobileView
     */
    var $AMV = mstrmojo.android.AndroidMainView = mstrmojo.declare(
        mstrmojo.AndroidView,

        [ mstrmojo._HasSysMenu ],

        /**
         * @lends mstrmojo.android.AndroidMainView.prototype
         */
        {
            scriptClass: "mstrmojo.android.AndroidMainView",

            markupString: '<div id="{@id}" class="mstrmojo-AndroidView {@cssClass}" style="{@cssText}">' +
                              '<div></div>' +
                              '<div class="mstrmojo-AndroidView-ContainerNode"></div>' +
                              '<div></div>' +
                          '</div>',

            markupSlots: {
                titleNode: function () { return this.domNode.firstChild; },
                containerNode: function () { return this.domNode.childNodes[1]; },
                bottomNode: function () { return this.domNode.lastChild; }
            },

            layoutConfig: {
                h: {
                    titleNode: '50px',
                    containerNode: '100%',
                    bottomNode: 'auto'
                },
                w: {
                    titleNode: '100%',
                    containerNode: '100%',
                    bottomNode: '100%'
                }
            },
            
            /**
             * Indicates if this view supports landscape orientation.
             * 
             * @type Boolean
             * @default false
             */
            supportsLandscape: false,
            
            /**
             * Indicates whether user may access settings
             *
             * @type Boolean
             * @default true
             */
            
            settingsAllowed: true,
             
             
            /**
             * Custom hook to hide the title bar in landscape mode if supportsLandscape is true.
             * 
             * @ignore
             */
            beforeLayout: function beforeLayout() {
                // Is this a phone device and does this view support full screen mode?
                if (!mstrApp.isTablet() && canDoLandscape.call(this)) {
                    // Get layout config for height.
                    var heightLayout = this.layoutConfig.h;
                    
                    // Is the original title height yet to be defined?
                    if (originalTitleHeight === undefined) {
                        // Store original title height value.
                        originalTitleHeight = heightLayout.titleNode;
                    }
                    
                    // Set height of title node based on whether we are landscape or not.
                    heightLayout.titleNode = (mstrApp.isLandscape()) ? '0px' : originalTitleHeight;
                }
            },
            
            /**
             * <p>Handler to be called directly before this view is made visible.</p>
             * 
             * @ignore
             */
            beforeViewVisible: function beforeViewVisible() {
                // Notify the java shell as to whether this view supports landscape orientation.
//                mstrMobileApp.allowLandscapeOrientation(canDoLandscape.call(this));
                
                passCtrlToContent.call(this, 'beforeViewVisible');
                
                //Are we on a mobile device?
                if (mstrApp.onMobileDevice()) {
                    //Send an empty menu to the java shell in order to prevent the previous view's menu from showing up.
                    this.setSysMenu(this.id, this.newMenuConfig());
                }
            },
            
            /**
             * <p>Handler to be called directly after this view is made visible.</p>
             * 
             * @ignore
             */
            afterViewVisible: function afterViewVisible() {
                // Update the action menu for the new view.
                this.updateActionMenu();
                
                passCtrlToContent.call(this, 'afterViewVisible');
            },
            
            beforeViewHidden: function beforeViewHidden(cmd) {
                passCtrlToContent.call(this, 'beforeViewHidden', [ cmd ]);
            },
            
            /**
             * <p>Creates a configuration object used to define the menu for this view, passes it to the content child for population, and then passes it to the Java application shell via mstrMobileApp.buildMenu.</p>
             * 
             * <p>This configuration object exposes two methods:</p>
             * 
             * <dl>
             *  <dt>addItem(groupId, label, action, checked)</dt>
             *  <dd>Subclasses should use this method to add items to the menu.</dd>
             *  <dt>clear</dt>
             *  <dd>Resets the configuration to empty (no menu items).</dd>
             * </dl>
             * 
             * @private
             */
            updateActionMenu: function updateActionMenu() {

                //Grab the content child.
                var cfg = this.newMenuConfig(),
                    child = this.contentChild,
                    //If the content view doesn't specify which menu option it supports, assign all default options.
                    menus = child.supportedDefaultMenus || DEFAULT_ALL,
                    id = this.id,
                    hsCfg = mstrApp.getConfiguration().getHomeScreen();
                
                if ((menus & GOTO_HOME) > 0) {
                    // Add Home grouping item
                    cfg.addItem(GOTO_HOME, mstrmojo.desc(1, 'Home'), GOTO_HOME, true, 4);
                }
                
                // TQMS#505134 disable settings if not permitted by configuration
                if ( this.settingsAllowed && ((menus & GOTO_SETTINGS) > 0)) {    
                    // Add Settings grouping item
                    cfg.addItem(GOTO_SETTINGS, mstrmojo.desc(7831, 'Settings'), GOTO_SETTINGS, true, 6);
                }

                // If the child has a populateActionMenu method then pass the configuration to it to be updated.
                if (child && child.populateActionMenu) {
                    child.populateActionMenu(cfg);
                }
                
                // Add help if child supports it.
                if ((menus & GOTO_HELP) > 0 && (!mstrApp.isTablet() || hsCfg.hlp)) {
                    cfg.addItem(GOTO_HELP, mstrmojo.desc(1143, 'Help'), GOTO_HELP, false, 9);
                }

                // Pass the new menu to the Java shell.
                this.setSysMenu(id, cfg);
            },            
            
            postBuildRendering: function postBuildRendering() {
                this._super(); 
                
                // Are we in debug mode, on a mobile device and do we have view history?
                if (mstrmojo.debug) {                    
                    // Are we not on a mobile device)?
                    if (!mstrApp.onMobileDevice()) {
                        // Create a button to show Firebug Lite.
                        this.createTitleBarButton('loadFireBugBtn', function () {
                            mstrmojo.debug.load_firebug(mstrConfig.jsLibs);
                        }, 'FireBug');
                        
                        // Create a button that will invoke a goBack call on the application.
                        this.createTitleBarButton('hostedBackBtn', function () {
                            mstrApp.goBack();
                        }, '<- Back');
                        
                    }                
                } else if ($DOM.isPlayBook) {
                    // 04/18/2011 wliao: There is no back button on PlayBook so we need to add one.
                    this.createTitleBarButton('hostedBackBtn', function () {
                        mstrApp.goBack();
                    }, '<- Back');
                }

                // Add main title css class so starburst will appear.
                mstrmojo.css.addClass(this.titleNode, "mstrmojo-AndroidView-MainTitle");
                
                this.settingsAllowed = mstrApp.getConfiguration().getSettingsAllowed();
            },
            
            /**
             * Adds a button to the title bar.
             * 
             * @param {String} className The class name to be applied to the button.
             * @param {Function} fn The function to be called when the button is clicked.
             * @param {String} [title=''] An optional title attribute value for the button.
             */
            createTitleBarButton: function createTitleBarButton(className, fn, title) {
                // Do we NOT have a title node?
                var titleNode = this.titleNode;
                if (!titleNode) {
                    // Can't add a button if title node doesn't exist.
                    return;
                }
                
                // Do we NOT already have a button with this class name?
                var btn = titleNode.querySelector('.' + className);
                if (!btn) {
                    // Create button
                    btn = document.createElement('div');
                    btn.className = className;
                    
                    // Append button to title.
                    titleNode.appendChild(btn);
                }
                
                // Add title and click function.
                btn.setAttribute('title', title || '');
                btn.onclick = fn;
            },            
            
            getContentDimensions: function getContentDimensions() {
                var contentChild = this.contentChild;
                return {
                    h: parseInt(contentChild.height, 10),
                    w: parseInt(contentChild.width, 10)
                };
            },
            
            /**
             * Handles menu item selections from the application shell.
             * 
             * @param {String} cmdId A pipe (|) delimited string of group and command.
             * 
             * @return True if the menu should be regenerated. 
             */
            handleMenuItem: function handleMenuItem(cmdId) {
                var splitCmd = cmdId.split('|'),
                    group = parseInt(splitCmd[0], 10),
                    command = splitCmd[1],
                    contentChild = this.contentChild,
                    childMethod = contentChild.handleMenuItem;
                
                switch (group) {
                case GOTO_HOME:
                    // Give the content child a chance to react to the home command.
                    if (childMethod) {
                        childMethod.call(contentChild, group, command);
                    }
                    mstrApp.goHome();
                    return;
                        
                case GOTO_SETTINGS:
                    this.controller.spawn(mstrApp.viewFactory.newScreenController("Settings", {}), {});
                    return;
                    
                case GOTO_HELP:
                    mstrApp.displayHelp();
                    return;                    
                }

                // Pass to content child and check return.
                if (childMethod.call(contentChild, group, command)) {
                    // handleMenuItem returned true which means we need to regenerate the menu.
                    this.updateActionMenu();
                }
            }            
            
        }
    );

    // Register this class to have the height of the titleNode layout changed for DPI.
    mstrmojo.DPIManager.registerClass($AMV, 'h', 'titleNode', 30, 75);
}());