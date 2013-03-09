/**
  * AndroidAdvancedView.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
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
                         "mstrmojo.Button",
                         "mstrmojo.hash",
                         "mstrmojo.TextBoxWithLabel",
                         "mstrmojo.ValidationTextBox",
                         "mstrmojo.android.AndroidSelectBox"
                     );
    
    var $C = mstrmojo.css,
        selCssClass = 'selected';                

    /**
     * Widget for displaying folder contents on an Android Device.
     * 
     * @class
     * @extends mstrmojo.VBox
     */
    mstrmojo.settings.AndroidAdvancedView = mstrmojo.declare(
        mstrmojo.ui.TouchScrollableView,

        null, /* mixins */

        /**
         * @lends mstrmojo.AndroidAdvancedView.prototype
         */
         
        {
            scriptClass: "mstrmojo.settings.AndroidAdvancedView",
            
            markupString: '<div id="{@id}" class="mstrmojo-AndroidSettingsView mstrmojo-AndroidAdvancedView {@cssClass}" style="{@cssText}">' +
            
                  '<div>' + 
                      '<div></div>' +
                      '<div></div>' +
                      '<div class="mstrmojo-AndroidView-Title android-settings-list-first-item">Caching</div>' +
                      '<div></div>' +
                      '<div></div>' +
                      '<div></div>' +
                      '<div></div>' +
                      '<div class="mstrmojo-AndroidView-Title android-settings-list-first-item">Logging</div>'  +                            
                      '<div></div>' +
                      '<div></div>' +
                      '<div></div>' +
                      '<div class="mstrmojo-AndroidView-Title android-settings-list-first-item">Connection</div>'  +                            
                      '<div class="android-settings-list-last-item"></div>' +
                  '</div>' +
              '</div>',

            markupSlots: {
                containerNode: function() { return this.domNode.firstChild; },
                scrollboxNode: function() { return this.domNode; },  
                netTimeoutNode: function () { return this.domNode.firstChild.firstChild; },
                maxColsNode: function() { return this.domNode.firstChild.childNodes[1]; },
                reportCachingNode: function() { return this.domNode.firstChild.childNodes[3]; },
                memLimitNode: function() { return this.domNode.firstChild.childNodes[4]; },
                fldrCachingNode: function() { return this.domNode.firstChild.childNodes[5]; },
                clearCloseNode: function() { return this.domNode.firstChild.childNodes[6]; },
                logLvlNode: function() { return this.domNode.firstChild.childNodes[9]; },
                maxLogNode: function() { return this.domNode.firstChild.childNodes[10]; },
                connectionNode: function() { return this.domNode.firstChild.childNodes[12]; }
            },

            layoutConfig: {
                h: {
                    scrollboxNode: '100%'
                },
                w: {
                    scrollboxNode: '100%'
                }
            },
            
            children: [ 
            {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "Network Timeout (seconds)",
                alias: "netTimeout",
                slot: "netTimeoutNode",
                size: 5
            },
            {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "Maximum Columns in Grid",
                alias: "maxGridCols",
                size: 5,
                slot: "maxColsNode"
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Caching",
                alias: "reportCaching",
                slot: "reportCachingNode",
                idx: 0,
                options: [{ v: 0, n:"Off"}, {v:1, n: "On"}]
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Memory limit",
                options: [{ v: 0, n:"J2EE"}, {v:1, n: "ASP.Net"}],
                alias: "memLimit",
                slot: "memLimitNode",
                options: [{ v: 25, n:"25MB"}, {v:50, n: "50MB"}, {v:100, n: "100MB"}, {v:250, n: "250MB"}, {v:500, n: "500MB"}, {v:1024, n: "1GB"}, {v:2048, n: "2GB"}, {v:3072, n: "3GB"}, {v:4096, n: "4GB"}],
                idx: 4
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Clear on Close",
                alias: "clrClose",
                slot: "clearCloseNode",
                idx: 0,
                cssClass: "android-settings-list-last-item",
                options: [{ v: 0, n:"Off"}, {v:1, n: "On"}]
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Folder caching",
                alias: "fldrCaching",
                slot: "fldrCachingNode",
                idx: 0,
                options: [{ v: 0, n:"Off"}, {v:1, n: "On"}]
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Level",
                alias: "logLvl",
                slot: "logLvlNode",
                // see com.microstrategy.web.app.mobile.config.EnumLoggingLevels for values
                options: [{ v: 16, n:"Off"}, {v:14, n: "Errors"}, {v:12, n: "Warnings"}, {v:10, n: "Messages"}, {v:0, n: "All"}]
                
            },
            {
                scriptClass: "mstrmojo.TextBoxWithLabel",
                label: "Maximum Log Size (entries)",
                alias: "maxLog",
                size: 5,
                slot: "maxLogNode"
            },
            {
                scriptClass: "mstrmojo.android.AndroidSelectBox",
                label: "Connection Mode",
                alias: "connection",
                slot: "connectionNode",
                idx: 0,
                options: [{ v: true, n:"Binary"}, {v:false, n: "XML"}]
            }
            ],            
            
            scrollerConfig: {
                bounces: false,
                showScrollbars: false
            },
            
            preConfigScroller: function() {                
                // render our children now before creating the scroller otherwise our containerNode is empty and so no scrolling!
                this.renderChildren();
            },
                
            postBuildRendering: function() {
                
                this._super();
                
                this.netTimeout.set('value',this.gnl.nt);
                this.maxGridCols.set('value',this.gnl.mgc);                
                this.memLimit.set('value',this.gnl.ml);                
                this.fldrCaching.set('value',this.gnl.fc);     
                this.clrClose.set('value',this.gnl.cc);           
                this.logLvl.set('value',this.gnl.ll);                
                this.maxLog.set('value',this.gnl.mls); 
                
                // temporary switch to enable/disable caching
                this.reportCaching.set('value',this.cacheEnabled);
                
                //temporary switch to enable/disable c++ component
                this.connection.set('value',this.connectionMode); 
                 
            },
            
            /**
             * Passes reference to the general device sdettings to this view for display.
             * @param {Object} gnlSettings object that contains the settings
             */
            setData: function (gnlSettings, cacheEnabled, connectionMode) {
                this.set("gnl", gnlSettings);
                this.set("cacheEnabled", cacheEnabled);
                this.set("connectionMode", connectionMode);
            }                                                                                
        }
    );
})();


