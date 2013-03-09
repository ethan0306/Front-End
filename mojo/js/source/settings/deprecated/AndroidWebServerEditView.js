/**
  * AndroidWebServerEditView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0
  */
  /* 
  * @fileoverview <p>Widget for displaying and modifying web server settings settings on Android devices.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */
(function () {

    mstrmojo.requiresCls("mstrmojo.ui.TouchScrollableView",
                         "mstrmojo.css",
                         "mstrmojo.array",
                         "mstrmojo.Button",
                         "mstrmojo.hash",
                         "mstrmojo.TextBoxWithLabel",
                         "mstrmojo.ui.ValidationTextBoxWithLabel",
                         "mstrmojo.android.AndroidSelectBox",
                         "mstrmojo.settings.AndroidSettingsListView",
                         "mstrmojo.android._HasHostedDeleteButton"
                      );
    
    var $C = mstrmojo.css,
        $DTP = mstrmojo.expr.DTP,
        DELETE_SERVER = 256,
        selCssClass = 'selected';
        
        
    /**
     * Widget for displaying folder contents on an Android Device.
     * 
     * @class
     * @extends mstrmojo.VBox
     */
    mstrmojo.settings.AndroidWebServerEditView = mstrmojo.declare(
        mstrmojo.ui.TouchScrollableView,
        [ mstrmojo.android._HasHostedDeleteButton ],

        /**
         * @lends mstrmojo.AndroidWebServerEditView.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidWebServerEditView",
            markupString: '<div id="{@id}" class="mstrmojo-AndroidSettingsView mstrmojo-AndroidWebServerEditView {@cssClass}" style="{@cssText}">' +
                            '<div></div>' +
                          '</div>',
            
            children: [ {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "Name",
                alias: "serverName",
                cssDisplay: "block",
                autoComplete: false,
                autoCorrect: false,
                autoCapitalize: false,
                cssText: "margin-top: 10px;"
            },
            {
                scriptClass: "mstrmojo.ui.ValidationTextBoxWithLabel",
                label: "Port",
                alias: "serverPort",
                dtp: $DTP.UNSIGNED,
                min: 0,
                max: 65535,
                constraints: {
                	trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
					validator: function(v) {
							var min = this.min,
								max = this.max;
							
							v = parseInt(v, 10);
							if (v >= min && v <= max) {
    							return {code: mstrmojo.validation.STATUSCODE.VALID};
							} else {
								return { code: mstrmojo.validation.STATUSCODE.INVALID };
							}
					}
                },
                autoComplete: false,
                autoCorrect: false,
                autoCapitalize: false,
                type: "number",
                cssDisplay: "block"            
            },
            {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "Path",
                alias: "serverPath",
                cssDisplay: "block",
                autoComplete: false,
                autoCorrect: false,
                autoCapitalize: false,
                cssText: "margin-bottom: 10px;"
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Web server type",
                alias: "serverType",
                cssClass: "android-settings-list-first-item",
                options: [{ v: 0, n:"J2EE"}, {v:1, n: "ASP.Net"}]
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Secure HTTP",
                alias: "httpType",
                options: [{ v: 0, n:"Off"}, {v:1, n: "On"}]
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Authentication",
                alias: "authType",
                cssClass: "android-settings-list-last-item",
                options: [{ v: 0, n:"Default"}, {v:1, n: "Anonymous"}, {v:2, n: "Basic"}, {v:3, n: "Windows"}],
                ondisplayValueChange: function() {
                    var showNameAndPass = ( this.getSelectedIndex() > 1 ),
                        wsc = this.parent.ws.wsc;
                        
                    this.parent.userName.set('visible', showNameAndPass );
                    this.parent.password.set('visible', showNameAndPass );
                    
                    if ( showNameAndPass ) {
                        var lo = (wsc && wsc.lo) ? wsc.lo : "",
                            ps = (wsc && wsc.ps) ? wsc.ps : "";
                            
                        // fill out the user name and password if required
                        this.parent.userName.set('value',lo || "");
                        this.parent.password.set('value',ps || "");
                    }
                }
            },
            {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "User Name",
                alias: "userName",
                cssDisplay: "block",
                autoComplete: false,
                autoCorrect: false,
                autoCapitalize: false,
                visible: false
            },
            {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "Password",
                alias: "password",
                // type: "password",
                visible: false,
                autoComplete: false,
                autoCorrect: false,
                autoCapitalize: false,
                cssDisplay: "block"
            },
            {
                scriptClass: "mstrmojo.settings.AndroidSettingsListView",
                alias: "projectList",
                ttl: "Projects",
                cssClass: "android-settings-list-first-item",
                cssText: "padding: 0;"
            },
            {
                scriptClass: "mstrmojo.Button",
                text: "Default Project Credentials",
                alias: "projectCreds",
                onclick: function() {
                    var pdc = this.parent.ws.pdc;
                    this.parent.controller.handleSettingsAction({ type: "default_proj_creds", actionData : {
                        data: {
                            am: pdc.am,
                            lo: pdc.lo,
                            ps: pdc.ps
                        }
                    } });
                },
                touchTap: function() {
                    this.onclick();                    
                },
    			cssDisplay: "table",
                cssText: "margin-bottom: 20px;"
            }
            ],
            
            projectRenderer: {
                render: function(item, idx, widget) {
                    return '<div class="item" idx="' + idx + '">' +
                               '<div>' + 
                                   '<h3>' + ((item && item.pn) || "") + '</h3>' +
                                   '<h4>' + ((item && item.sn) || "") + '</h4>' +
                               '</div>' + 
                           '</div>';
                },                
                select: function(el) {
                    // Flash the selected state.
                    $C.addClass(el, selCssClass);
                    window.setTimeout(function () {
                        $C.removeClass(el, selCssClass);
                    }, 100);
                },                    
                unselect: function(el) {
                    $C.removeClass(el, selCssClass);
                }
            },
            
            scrollerConfig: {
                bounces: false,
                showScrollbars: false
            },
            
            preConfigScroller: function() {  
                              
                // setup the item renderer for the web server's list of projects
                this.projectList.setData( {
                    itemRenderer: this.projectRenderer,
                    items: mstrmojo.array.insert( [ { pn: "Add Project...", action: "add_project" } ], 0, this.ws.pl )
                } );

                // render our children now before creating the scroller otherwise our containerNode is empty and so no scrolling!
                this.renderChildren();
            },
                
            postBuildRendering: function() {
                
                // Call the super
                this._super();
                
                // create button on main title bar to simulate device option command DELETE SERVER; only added in debug in hosted app.
                this.createDeleteButton( function(ths) {
                    return function() {
                        ths.controller.settingsController.handleSettingsAction( {  vw: ths,  type: 'rmv_server', actionData: ths.ws } );
                    };
                }(this));   

                var     wsc = this.ws.wsc;
                
                this.serverName.set('value',this.ws.nm);
                this.serverPort.set('value',this.ws.po);                
                this.serverPath.set('value',this.ws.pt);                
                this.serverType.set('value',this.ws.ty);
                this.httpType.set('value',this.ws.rt);    // request_type
                this.authType.set('value',this.ws.udc ? 0 : wsc.am);
                if ( wsc.am > 1 ) {
                    this.userName.set('value',wsc.lo);
                    this.password.set('value',wsc.ps);
                }

                // setup the item renderer for the web server's list of projects
                this.projectList.setData( {
                    itemRenderer: this.projectRenderer,
                    items: mstrmojo.array.insert( [ { pn: "Add Project...", action: "add_project" } ], 0, this.ws.pl )
                } );

            },

            populateActionMenu: function populateActionMenu(config) {            
                // Add grouping menu item.
                config.addItem(DELETE_SERVER, 'Delete Server', DELETE_SERVER, true);
            },
            
            handleMenuItem: function handleMenuItem(group, command) {                

                // What was the action?
                if (group === DELETE_SERVER) {
                    this.controller.settingsController.handleSettingsAction( {  vw: this,  type: 'rmv_server', actionData: this.ws } );
                }
            },


            addChildren: function addChildren(c, idx, silent) {
                var children = this._super(c, idx, silent);
                
                if (children) {
                    // handler for clicks in the settings list; the type of action to perform on a click is 
                    // bound when the handler is installed (along with the 'this' pointer) thanks to the extra closure
                    var clickHandler = function(ths,view,at) {
                        return function(evt) {
                            if ( evt.added ) {
                                // Get the clicked item - notice added should only be a single value b/c we are single selecting
                                var item = evt.src.items[evt.added[0]],
                                    itemAction = at;
                                // use special action if defined
                                if ( item.action ) {
                                    itemAction = item.action;
                                }
                                ths.controller.handleSettingsAction( {  vw: view, 
                                                                        type: itemAction,
                                                                        actionData: item,
                                                                        actionList: view.getItems() } );  
                            }
                        };
                    };
                                    
                    // Attach an event listeners to hear when the user selects a button.
                    this.projectList.contentChild.attachEventListener('selectionChange', this.projectList.id, clickHandler(this,this.projectList,'prjEdit'));                
                }
                
                return children;
            },
            
            getServerName: function() {
                return this.serverName.value;  
            },
            
            /**
             * Passes reference to the device configuration data to this view for display.
             * @param {Object} configObj object that describes the folder's contents
             */
            setData: function (webServer) {
                this.set('ws', webServer);            
            }
        }
    );
})();


