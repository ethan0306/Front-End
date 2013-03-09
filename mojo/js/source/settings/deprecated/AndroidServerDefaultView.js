/**
  * AndroidServerDefaultView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>Widget for displaying and modifying web server settings settings on Android devices.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */
(function () {
    
    mstrmojo.requiresCls(   "mstrmojo.VBox",
                            "mstrmojo.css",
                            "mstrmojo.android.AndroidSelectBox",
                            "mstrmojo.EnumAuthenticationModes" );
    
    var $auth = mstrmojo.EnumAuthenticationModes;
                            
    /**
     * Widget for displaying folder contents on an Android Device.
     * 
     * @class
     * @extends mstrmojo.VBox
     */
    mstrmojo.settings.AndroidServerDefaultView = mstrmojo.declare(
        mstrmojo.VBox,
        null, /* mixins */

        /**
         * @lends mstrmojo.AndroidServerDefaultView.prototype
         */
        {        
            scriptClass: "mstrmojo.settings.AndroidServerDefaultView",
    
            markupString: '<div id="{@id}" class="mstrmojo-AndroidSettingsView mstrmojo-AndroidServerDefaultView {@cssClass}" style="{@cssText}">' +
                          '</div>',

            markupSlots: {
                containerNode: function () { return this.domNode; }
            },

            layoutConfig: {
                h: {
                    contentNode: '100%'
                },
                w: {
                    contentNode: '100%'
                }
            },
            
            children: [ 
                {                
                    scriptClass: "mstrmojo.android.AndroidSelectBox",
                    label: "Authentication",
                    alias: "defaultAuth",
                    options: [],
                    ondisplayValueChange: function() {
                        var showNameAndPass = (typeof this.parent.noLoginModes[this.getSelectedValue()] === "undefined"),
                            sd = this.parent.sd;
                        
                        this.parent.userName.set('visible', showNameAndPass );
                        this.parent.password.set('visible', showNameAndPass );
                        if ( showNameAndPass ) {
                            // fill out the user name and password if required
                            this.parent.userName.set('value',sd.lo);
                            this.parent.password.set('value',sd.ps);
                        } else {
                            sd.lo = sd.ps = "";
                        }
                    }
                },
                {
                    scriptClass: "mstrmojo.TextBoxWithLabel",
                    label: "User Name",
                    alias: "userName",
                    visible: false,
                    cssDisplay: "block",
                    autoComplete: false,
                    autoCorrect: false,
                    autoCapitalize: false,
                    cssText: "padding-top: 8px;"
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
                }
            ],            
            
            
            /**
             * Passes reference to the general device sdettings to this view for display.
             * @param {Object} gnlSettings object that contains the settings
             */
            setData: function (serverDefaults, authModeOptions, noLoginModes ) {
                this.set("sd", serverDefaults).set("noLoginModes", noLoginModes || {} );

                this.defaultAuth.set("options", authModeOptions ).set('value',this.sd.am);
                
                // if the current auth. mode is NOT in the list of modes that don't require login then show the user name and password
                if ( typeof this.noLoginModes[this.sd.am] === "undefined" ) {
                    this.userName.set('value',this.sd.lo);
                    this.password.set('value',this.sd.ps);
                }              
            }            
                                    
        }
    );
})();


