(function() {
    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.css",
            "mstrmojo.registry",
            "mstrmojo._HasContextMenu",
            "mstrmojo.Widget"
    );

    var _D = mstrmojo.dom,
        _C = mstrmojo.css,
        SCROLLBAR_WIDTH = 16;
    
    /**
     * ContextMenuItem is the widget to render a menu item as a table row. Every menu item can be updated to show/hide, check/uncheck, enable/disable 
     * dynamically if dynamicUpdate is set to true in _HasContextMenu mixin, and related methods queryVisible/queryChecked/queryEnable are 
     * implemented. This widget also is able to position its submenu intelligently in the case that its submenu can not be shown in total inside
     * the browser client window when positioned to the right of this menu item. 
     */
    mstrmojo.ContextMenuItem = mstrmojo.declare(
            // superclass
            mstrmojo.Widget,
            
            // mixins
            [mstrmojo._HasContextMenu],
            {            
                scriptClass: 'mstrmojo.ContextMenuItem',

                SUBMENU_SHIFT: 3, 
                
                visible: true,
                
                checked: false,
                
                enabled: true,
                
                buildDom: function(){
                    var ph = document.createElement('tr'),
                        d = this.data,
                        w = this._cmSource,
                        td,img;
                    
                    ph.id = this.id;
                    ph.className = 'mstrmojo-ContextMenuItem ' + (w.isSeparatorItem(d) ? 'separator' : w.item2textCss(d));

                    var me = this,
                        fo = function(){
                            me.handleMouseOver();
                        },
                        ft = function(){
                            me.handleMouseOut();
                        },
                        fc = function(){
                            me.handleClick();
                        };
                    _D.attachEvent(ph, 'mouseover', fo);
                    _D.attachEvent(ph, 'mouseout', ft);
                    _D.attachEvent(ph, 'click', fc);          
                    
                    //icon td
                    td = document.createElement('td');
                    ph.appendChild(td);
                    td.className = 'mstrmojo-CMI-left';
                    img = document.createElement('img');
                    img.src = '../images/1ptrans.gif';
                    td.appendChild(img);
                    
                    //text td
                    td = document.createElement('td');
                    ph.appendChild(td);
                    td.className = 'mstrmojo-CMI-text';
                    if(w.isSeparatorItem(d)){//need to insert an image for IE7 to show border
                        img = document.createElement('img');
                        img.src = '../images/1ptrans.gif';
                    } else {
                        img = document.createElement('div');
                        img.className = 'mstrmojo-CMI-content';
                        td.innerHTML =  d.itemWidget ? '&nbsp' : d[this.itemField];
                    }
                    td.appendChild(img);
                    
                    //submenu td
                    td = document.createElement('td');
                    ph.appendChild(td);
                    td.className = 'mstrmojo-CMI-right ' + (this.hasSubmenu ? 'sm' : '');
                    img = document.createElement('img');
                    img.src = '../images/1ptrans.gif';
                    td.appendChild(img);                    
                    
                    return ph;
             },
             
             /**
              * Override super implementation to render item widget. 
              */
             buildRendering: function bldRn() {            
                 // Call the inherited method to do the DOM construction.                
                 this._super();  
                 
                 var w = this.data.itemWidget;
                 if(w){
                     w.placeholder = this.domNode.cells[1].firstChild.firstChild; 
                     w.data = this.data;
                     w = mstrmojo.insert(w);
                     w.render();
                     w.parent = this;
                     this.itemWidget = w;
                 }
             },
 
             /**
              * Update the 3 statuses of context menu item: visible/checked/enabled. 
              */
             markupMethods: {
                 onvisibleChange: function(){ this.domNode.style.display = this.visible ? '' : 'none'; },
                 oncheckedChange: function(){ 
                     _C.toggleClass(this.domNode,['checked'], this.checked); 
                 },
                 onenabledChange: function(){ 
                     _C.toggleClass(this.domNode,['disabled'], !this.enabled);
                 }
             },
             
             /**
              * Override _HasContextMenu to show the context menu to the right of menu item.
              */
             getMenuPosition: function getMenuPosition(){
                 var pos = _D.position(this.domNode, true);
                 return {x: Math.round(pos.x + pos.w - this.SUBMENU_SHIFT), y: Math.round(pos.y)};
             },
             
             /**
              * Override _HasContextMenu to return the items for next level context menu. 
              */
             getContextMenuItems: function getContextMenuItems(){
                 return this.data[this.itemChildrenField];
             },
             
             getContextMenuCssClass: function getContextMenuCssClass(){
                 return this.data.cmCssClass || '';
             },
             
             /**
              * Override _HasContextMenu to call the customization hook-up. 
              */
             callOnContextMenuOpen: function callOnContextMenuOpen(){
                 var d = this.data;
                 if(d.onContextMenuOpen){
                     d.onContextMenuOpen.apply(this,[]);
                 }
             },
             
             /**
              * Override _HasContextMenu to call the customization hook-up. 
              */
             callOnContextMenuClose: function callOnContextMenuClose(){
                 var d = this.data;
                 if(d.onContextMenuClose){
                     d.onContextMenuClose.apply(this,[]);
                 }
             },
             
             attachMousedownEvent: function attachMousedownEvent(){
                 //override the _HasContextMenu to do nothing because for context menu item, 
                 //it does not need to monitor the mouse down to close the menu tree.
             },
             
             getContextMenuSource: function getContextMenuSource(){
                 return this._cmSource;
             },
             
             adjustMenuPosition: function adjustMenuPosition(){
                 var cm = this._subMenu,
                     cmd = this._subMenu.domNode,
                     h = cmd.offsetHeight,
                     w = cmd.offsetWidth,
                     wDim = _D.windowDim(),
                     pos = _D.position(cmd,false),
                     posX = _D.position(cmd,true);
                     
                 if((pos.x + w + SCROLLBAR_WIDTH) > wDim.w){//adjust left to move the the left of menu item.
                     cm.set('left', (_D.position(this.domNode, true).x - w) + 'px');
                 }
                 
                 if((pos.y + h + SCROLLBAR_WIDTH) > wDim.h){
                     //adjust top to fit in client window
                     //cm.set('top', (wDim.h - h - SCROLLBAR_WIDTH) + 'px');
                     cm.set('top', (wDim.h - h - SCROLLBAR_WIDTH + (posX.y - pos.y)) + 'px');
                 }
             },
             
             handleMouseOver: function handleMouseOver(){
                 var me = this,
                     of = function(){
                         if(me.hasSubmenu){
                             me.showContextMenu();
                         }
                         me._cmSource.closeMenuTree(me);
                         me._mouseOverTimer = null;
                     };
                 if(this._cmSource.activeMenuItem !== this){
                     this._mouseOverTimer = window.setTimeout(of, 80);
                 }     
             },
             
             handleMouseOut: function handleMouseOut(){
                 //clear open submenu timer
                 if(this._mouseOverTimer){
                     window.clearTimeout(this._mouseOverTimer);
                     this._mouseOverTimer = null;
                 }
             },
             
             closeMenuTree: function closeMenuTree(){
                 this._cmSource.closeMenuTree();
             },
             
             handleClick: function handleClick(){
                 if(this.hasSubmenu){
                     return;
                 }
                 
                 var cms = this._cmSource,
                     d = this.data;
                 if(!this.itemWidget){
                     if(!cms.isSeparatorItem(d) && cms.queryEnabled(d)){
                         if(cms.executeCommand){
                             cms.executeCommand(this.data);
                         }
                         cms.closeMenuTree();
                     }
                 } else {
                     //for a menu item with item widget, it is item widget's responsibility to call to close the context menu
                 }
             }
    }); 
})();