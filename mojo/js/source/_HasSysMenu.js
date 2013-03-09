/**
  * _HasSysMenu.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>A mixin for views that use system (device) menu.</p>
  * @author <a href="mailto:ibaskin@microstrategy.com">Ilia Baskin</a>
  */
  
(function () {
    
    var CLASS_NAME = 'mstrmojo._HasSysMenu';
    
    //A stack of menu handler object IDs.
    //We need it to restore previous menu when a dialog with the system menu closes
    var menuHandlerIds = [];
    /**
     * <p>A mixin with methods for making server requests via a proxy.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._HasSysMenu = mstrmojo.provide(
        'mstrmojo._HasSysMenu',
        
        /**
         * @lends mstrmojo._HasSysMenu
         */
        {
            _mixinName: 'mstrmojo._HasSysMenu',
           
            /**
             *  Creates an empty menu config object.
             *  
             */
            newMenuConfig: function newMenuConfig() {
                var cfg = {
                        addItem: function (groupId, label, action, checked, icon) {
                            this.groups.push(String(groupId));
                            this.labels.push(String(label));
                            this.actions.push(String(action));
                            this.checked.push(String(!!checked));
                            this.icons.push(icon || -1);
                        },
                        clear: function() {
                            this.groups = [];
                            this.labels = [];
                            this.actions = [];
                            this.checked = [];
                            this.icons = [];
                        },
                        size: function() {
                            return this.labels.length;
                        }
                    };
                    
                // Call clear to initialize the collections.
                cfg.clear();
                return cfg;
            },
            
            /**
             *  Sets a root system menu.
             *  
             *  @param {String} id The ID of the object responsible for handling menu actions.
             *  @param {Object} cfg The menu configuration.
             */
            setSysMenu: function setSysMenu(id, cfg) {
                menuHandlerIds.length = 0;
                this.pushSysMenu(id, cfg);
                //menuHandlerIds.push(id);
                //mstrMobileApp.setSysMenu(id, cfg.groups, cfg.labels, cfg.actions, cfg.checked, cfg.icons);
            },

            /**
             *  Sets a new system menu and pushes id of the previous menu handler on the stack.
             *  
             *  @param {String} id The ID of the object responsible for handling menu actions.
             *  @param {Object} cfg The menu configuration.
             */
            pushSysMenu: function pushSysMenu(id, cfg) {
                menuHandlerIds.push(id);
                mstrMobileApp.setSysMenu(id, cfg.groups, cfg.labels, cfg.actions, cfg.checked, cfg.icons);
            },
            
            /**
             *  Removes current menu then extracts the previous menu handler from the stack and asks it to
             *  rebuild its menu.
             *  
             */
            popSysMenu: function popSysMenu() {
                menuHandlerIds.pop();
                var  l = menuHandlerIds.length,
                     lastMenuViewId = l && menuHandlerIds[l - 1],
                     updated = false;
                if ( lastMenuViewId ) {
                    var v = mstrmojo.all[lastMenuViewId];
                    if ( v && v.updateActionMenu ) {
                        v.updateActionMenu();
                        updated = true;
                    }
                }
                //Clear menu
                if ( ! updated ) {
                    var cfg = this.newMenuConfig();
                    mstrMobileApp.setSysMenu('', cfg.groups, cfg.labels, cfg.actions, cfg.checked, cfg.icons);
                }
            }
        }
    );
})();