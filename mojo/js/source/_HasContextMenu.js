(function(){

    mstrmojo.requiresCls(
            "mstrmojo.dom"
            );
    
    var _loaded = false,
        _D = mstrmojo.dom,
        SCROLLBAR_WIDTH = 16;
    
    /**
     * This mixin class shall be implemented by any widget that supports context menu. To support a context menu, first the widget needs to provide
     * a parameter call "cm", which described all context menu items and their sub/grand menus, together with parameters itemField, itemIdField and 
     * itemChildrenField. Secondly, the widget may want to update its menu and sub/grand menu items dynamically so that it can be enabled/disabled 
     * or checked/unchecked or shown/hidden programmatically. In this case, it needs to set dynamicUpdate to be true, and implements queryVisible/
     * queryChecked/queryEnabled methods. Lastly, this mixin provides multiple ways to customize the behavior of the context menu, including 
     * cssClass for each menu item, cssClass for context menu of each level, context menu position, customization hookup functions, etc. 
     * 
     * In general, all widgets need to implement executeCommand method, so that a corresponding command can be carried out when clicking on a 
     * context menu item. 
     */
    mstrmojo._HasContextMenu = mstrmojo.provide(
            "mstrmojo._HasContextMenu", 
            {
                    
                /**
                 * An integer value for the z-index of the context menu. 
                 */
               //menuZIndex: 10, 
 
               /**
                * A list of data for context menu items. 
                */
               cm: null,
               
               /**
                * The field corresponding to the content of item.
                */
               itemField: 'n',
               
               /**
                * The field used to identify the item.
                */
               itemIdField: 'did',
               
               /**
                * The field used to identify children of the item.
                */
               itemChildrenField: 'items',
               
               /**
                * A boolean value indicating whether properties(visible/checked/enabled) of context menu items would be dynamically updated using
                * values returned by queryVisible/queryChecked/queryEnabled calls.
                */
               dynamicUpdate: false,
              
               /**
                * Override/implement this method to dynamically check/uncheck a menu item. 
                */
               queryChecked: function(item){
                  return false;
               },
               
               /**
                * Override/implement this method to dynamically enable/disable a menu item. 
                */
               queryEnabled: function(item){
                  return true;  
               },
               
               /**
                * Override/implement this method to dynamically hide/show a menu item. 
                */
               queryVisible: function(item){
                   return true; 
               },
               
               /**
                * Override/implement this method to execute the command when clicking on a menu item. 
                */
               executeCommand: function executeCommand(item){

               },
               
               /**
                * Override this method to return the cssClass for the context menu item. 
                */
               item2textCss: function item2textCss(item){
                   return item.cssClass || item.cmdId || ('cmd' + item[this.itemIdField]);
               },
               
               /**
                * Show context menu at the position returned by getMenuPosition. 
                */
               showContextMenu: function showContextMenu(){
                
                    if (!_loaded) {
                        mstrmojo.requiresCls("mstrmojo.ContextMenu");
                        _loaded = true;
                    }   
                
                   var cm = this._subMenu,
                       pos = this.getMenuPosition();
                   if(!cm){
                       var zi = (this.menuZIndex || this.zIndex || 10) + 1,
                           cfg = {
                                   left: pos.x + 'px', 
                                   top: pos.y + 'px', 
                                   zIndex: zi, 
                                   visible: false, //initialized to false
                                   dynamicUpdate: this.dynamicUpdate, 
                                   itemField: this.itemField,
                                   itemIdField: this.itemIdField,
                                   itemChildrenField: this.itemChildrenField,
                                   _cmSource: this.getContextMenuSource(),
                                   items: this.getContextMenuItems(),
                                   cssClass: this.getContextMenuCssClass(),
                                   placeholder: document.body.appendChild(document.createElement("div")),
                                   parent: this
                           };
                       
                       cm = new mstrmojo.ContextMenu(cfg);
                       cm.render();
                       this._subMenu = cm;
                   } else {
                       cm.set('left', pos.x + 'px');
                       cm.set('top', pos.y + 'px');
                   }
                   
                   //dynamic update each menu item status
                   if(this.dynamicUpdate){
                       var cmws = cm.ctxtBuilder.itemWidgets,
                           len = cmws && cmws.length,
                           i, w, t = this.getContextMenuSource();
                       for(i=0;i<len;i++){
                           w = cmws[i];
                           if(t.queryVisible){
                               w.set('visible', t.queryVisible(w.data));
                           }
                           if(t.queryChecked){
                               w.set('checked',  t.queryChecked(w.data));
                           }
                           if(t.queryEnabled){
                               w.set('enabled',  t.queryEnabled(w.data));
                           }
                       }
                   }
                   
                   //display the context menu
                   cm.set('visible', true);
                   
                   //call customization hookup
                   this.callOnContextMenuOpen();
                   
                   //adjust menu position to fit the browser window
                   this.adjustMenuPosition();

                   //attach mouse down event to close context menu
                   this.attachMousedownEvent();
                  
               },
               
               /**
                * Hide context menu and then call customization hookup function. 
                */
               hideContextMenu: function hideContextMenu(){
                   var sm = this._subMenu;
                   if(sm && sm.visible){
                       this._subMenu.set('visible', false);
                       
                       //call customization hookup                       
                       this.callOnContextMenuClose();
                   }
               },
               
               /**
                * Adjust context menu position to so that the whole menu would show inside browser client window. 
                */
               adjustMenuPosition: function adjustMenuPosition(){
                   var cm = this._subMenu,
                       cmd = this._subMenu.domNode,
                       h = cmd.offsetHeight,
                       w = cmd.offsetWidth,
                       wDim = _D.windowDim(),
                       pos = _D.position(cmd,false),
                       posX = _D.position(cmd,true);
                       
                   if((pos.x + w + SCROLLBAR_WIDTH) > wDim.w){
                       //adjust left to fit in client window
                       cm.set('left', (wDim.w - w - SCROLLBAR_WIDTH + (posX.x-pos.x)) + 'px');
                   }
                   
                   if((pos.y + h + SCROLLBAR_WIDTH) > wDim.h){
                       //adjust top to fit in client window
                       cm.set('top', (wDim.h - h - SCROLLBAR_WIDTH + (posX.y-pos.y)) + 'px');
                   }
               },
               
               /**
                * Monitor mouse down event to close the context menu tree if mouse down anywhere other than the tree. 
                */
               attachMousedownEvent: function attachMousedownEvent(){               
                   var me = this;
                   
                   if(!this._close_handler){
                       this._close_handler = function(){
                           if (!me.isOnMySubmenu(_D.eventTarget(self, arguments[0]))) {                               
                               me.closeMenuTree();
                           }
                       };
                   }
                   _D.attachEvent(document.body, "mousedown", this._close_handler);  
               },
               
               /**
                * Method to decide whether a node belongs to the current menu tree. 
                */
               isOnMySubmenu: function isOnMySubmenu(t){
                   var cm = this._subMenu;
                   
                   //no submenu, return false
                   if(!cm){
                       return false;
                   } 

                   //on my domNode
                   if(_D.contains(cm.domNode, t, true, document.body)){
                       return true;
                   }
                   
                   //check whether it is on my item widgets' submenu
                   var cmws = cm.ctxtBuilder.itemWidgets,
                       len = cmws && cmws.length,
                       i, w;
                   for(i=0;i<len;i++){
                       w = cmws[i];
                       if(w.isOnMySubmenu(t)){
                           return true;
                       }
                   }
                   return false;
               },
               
               /**
                * Call customization hookup function when menu is open. 
                */
               callOnContextMenuOpen: function callOnContextMenuOpen(){
                   if(this.onContextMenuOpen){
                       this.onContextMenuOpen();
                   }
               },
               
               /**
                * Call customization hookup function when menu is closed. 
                */
               callOnContextMenuClose: function callOnContextMenuClose(){
                   if(this.onContextMenuClose){
                       this.onContextMenuClose();
                   }
               },
               
               /**
                * Return the data used to create the context menu.
                */
               getContextMenuItems: function getContextMenuItems(){
                   return this.cm;
               },
               
               /**
                * Return the cssClass used for the context menu. 
                */
               getContextMenuCssClass: function getContextMenuCssClass(){
                   return this.cmCssClass || '';
               },
               
               /**
                * Return the root source of the context menu.
                */
               getContextMenuSource: function getContextMenuSource(){
                   return this;
               },
               
               /**
                * Return the position to show context menu. 
                */
               getMenuPosition: function getMenuPosition(){
                   var pos = _D.position(this.domNode, true);
                   return {x: Math.round(pos.x), y: Math.round(pos.y + pos.h)};
               },
               
               /**
                * Method to decide whether an item is a separator item or not. 
                */
               isSeparatorItem: function isSeparatorItem(item){
                   return item[this.itemIdField] === -1 || item[this.itemField] === '-';
               },
               
               /**
                * Return whether a menu item has submenu. 
                */
               hasSubmenu: function hasSubmenu(item){
                   return !!item[this.itemChildrenField];
               },
               
               /**
                * Close part or all of the context menu tree. 
                */
               closeMenuTree: function closeMenuTree(newActive){
                   var wasActive = this.activeMenuItem,
                       t = this._cmSource || this;
                   
                   if(!wasActive){
                       if(newActive){
                           //save the new active and return
                           this.activeMenuItem = newActive;
                       } else {
                           t.hideContextMenu();
                       }
                       return;
                   } 

                   //if they are the same, do nothing
                   if(wasActive === newActive){
                       return;
                   }
                   
                   if(newActive){
                       //save new active
                       this.activeMenuItem = newActive;
                       
                       //expanding, no need to close any
                       if(newActive.parent.parent === wasActive){
                           return;
                       }
                       
                       //browsing to another item in the same level
                       if(newActive.parent === wasActive.parent){
                           wasActive.hideContextMenu();
                           return;
                       }
                   } else {
                       newActive = t; //use _cmSource to close all menu
                       this.activeMenuItem = null;
                   }
                   
                   wasActive.hideContextMenu();
                   while(wasActive !== t){
                       wasActive = wasActive.parent.parent;
                       if(wasActive !== newActive || t === newActive){
                           wasActive.hideContextMenu();
                           if(t === newActive){//detach the mouse down listener to the body, if the whole tree is closed.
                               _D.detachEvent(document.body, "mousedown", this._close_handler); 
                           }
                       }
                       if(wasActive.parent === newActive.parent){//reach the same level of previous active item
                           break;
                       }
                   }
               }
            });
})();