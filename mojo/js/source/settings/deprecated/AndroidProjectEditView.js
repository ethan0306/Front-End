/**
  * AndroidProjectEditView.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0
  */
  /* 
  * @fileoverview <p>Widget for displaying and modifying web server settings settings on Android devices.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */
(function () {

    mstrmojo.requiresCls("mstrmojo.VBox",
                         "mstrmojo.css",
                         "mstrmojo.Button",
                         "mstrmojo.hash",
                         "mstrmojo.TextBoxWithLabel",
                         "mstrmojo.ValidationTextBox",
                         "mstrmojo.android.AndroidSelectBox",
                         "mstrmojo.settings.AndroidSettingsListView",
                         "mstrmojo.android._HasHostedDeleteButton"
                     );
    
    var $C = mstrmojo.css,
        DELETE_PROJECT = 256,
        selCssClass = 'selected',

        // see com.microstrategy.web.app.mobile.config.EnumAuthenticationModes for values
        STANDARD = 1,
        NTCREDENTIAL = 2,
        ANONYMOUS = 8,
        LDAP = 16,
        DATABASE = 32,
        PLUGIN = 64,
        INTEGRATED = 128;
        
        

    /**
     * Widget for displaying folder contents on an Android Device.
     * 
     * @class
     * @extends mstrmojo.VBox
     */
    mstrmojo.settings.AndroidProjectEditView = mstrmojo.declare(
        mstrmojo.VBox,
        [ mstrmojo.android._HasHostedDeleteButton ],

        /**
         * @lends mstrmojo.AndroidProjectEditView.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidProjectEditView",
            
            markupString: '<div id="{@id}" class="mstrmojo-AndroidSettingsView mstrmojo-AndroidProjectEditView {@cssClass}" style="{@cssText}">' +
                          '</div>',

            markupSlots: {
                containerNode: function () { return this.domNode; }
            },
            
            children: [ 
            {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "Project",
                cssDisplay: "block",
                autoComplete: false,
                autoCorrect: false,
                autoCapitalize: false,
                alias: "projectName"
            },
            {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "Server",
                cssDisplay: "block",
                autoComplete: false,
                autoCorrect: false,
                autoCapitalize: false,
                alias: "prjServer"
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Authentication",
                alias: "authType",
                options: [{ v: 0, n:"Default"}, {v: STANDARD, n: "Standard"}, {v: NTCREDENTIAL, n: "Windows"}, {v: LDAP, n: "LDAP"},{v: DATABASE, n: "Database"},{v: PLUGIN , n: "Trusted"}],
                idx: 0,
                ondisplayValueChange: function() {

                    var showNameAndPass = ( this.getSelectedIndex() != 0 ),
                        pc = this.parent.prj.pc;
                    this.parent.userName.set('visible', showNameAndPass );
                    this.parent.password.set('visible', showNameAndPass );
                    if ( showNameAndPass ) {
                        var lo = (pc && pc.lo) ? pc.lo : "",
                            ps = (pc && pc.ps) ? pc.ps : "";
                            
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
                cssDisplay: "block",
                autoComplete: false,
                autoCorrect: false,
                autoCapitalize: false,
                visible: false
            }
            ],            
                        
            populateActionMenu: function populateActionMenu(config) {            
                // Add DELETE PROJECT menu item.
                config.addItem(DELETE_PROJECT, 'Delete Project', DELETE_PROJECT, true);
            },
            
            handleMenuItem: function handleMenuItem(group, command) {
                // What was the action?
                if (group === DELETE_PROJECT) {
                    // delete the current project and return to the web server edit view
                    this.controller.prevController.handleSettingsAction( {  vw: this,  type: 'rmv_project', actionData: this.prj } );
                }
            },
            
            getProjectName: function() {
                return this.projectName.value;  
            },

            getProjectServer: function() {
                return this.prjServer.value;  
            },

            /**
             * Passes reference to the device configuration data to this view for display.
             * @param {Object} configObj object that describes the folder's contents
             */
            setData: function (project) {
                this.set("prj", project);            
            },
            
            postBuildRendering: function(){
                this._super();
                
                // create button on main title bar to simulate device option command DELETE PROJECT; only added in debug in hosted app.
                this.createDeleteButton( function(ths) {
                    return function() {
                        ths.controller.prevController.handleSettingsAction( {  vw: ths,  type: 'rmv_project', actionData: ths.prj } );
                    };
                }(this));   

                this.projectName.set('value',this.prj.pn);
                this.prjServer.set('value',this.prj.sn);                
                this.authType.set('value',this.prj.udc ? 0 : this.prj.pc.am);                
            }
        }
    );
})();


