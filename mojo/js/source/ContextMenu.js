(function() {
    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.ContextMenuItem",
            "mstrmojo.WidgetList",
            "mstrmojo.ListMapperTable"
            );
    
    var _loaded = false,
        scrollStep = 20; 
    
    function _jumpTo (me, p) {
        var sb = me.itemsContainerNode;
        sb.scrollTop = Math.min(Math.max(sb.scrollTop + p , 0), sb.scrollHeight - sb.offsetHeight);
    }
    
    function _fireJumps(me, up){
        if (!me._scrollInter){
            var p = scrollStep * (up ? -1:1);
            me._scrollInter = window.setInterval(
                                    function() {
                                        _jumpTo(me, p);
                                    }, 
                                    50);    // was 100, too sluggish
        }
    }
    
    function _stopJumps(me){
        if (me._scrollInter) {
            window.clearInterval(me._scrollInter);
            me._scrollInter = null;
        }        
    }
    
    /**
     * This widget is a widget that renders a context menu block, delegating the rendering of each menu item to ContextMenuItem. It wraps the 
     * logic to dynamically show/hide scroll up/down buttons if the menu block can not be shown in total inside browser client window and the logic
     * to scroll and show menu items when those buttons are clicked/pressed and held.
     */
    mstrmojo.ContextMenu = mstrmojo.declare(

            // superclass
            mstrmojo.WidgetList,
            
            // mixins
            null,
            
            {
                scriptClass: 'mstrmojo.ContextMenu',

                zIndex: 100,
                                
                visible: true,
                
                makeObservable: true,
                
                markupString: '<div id={@id} class="mstrmojo-ContextMenu {@cssClass}" style="z-index: {@zIndex};{@cssText}">' +
                                   '<div class="mstrmojo-CM-scrollup" ' +
                                       'onmousedown="mstrmojo.all.{@id}.onmousedownarrow(self, arguments[0], true)" ' + 
                                       'onmouseup="mstrmojo.all.{@id}.onmouseuparrow(self, arguments[0], true)"' +       
                                       'onclick="mstrmojo.all.{@id}.onclickarrow(self, arguments[0], true)" ' +                                      
                                   '></div>' +
                                   '<div class="mstrmojo-CM-itemsContainer">{@itemsHtml}</div>' +
                                   '<div class="mstrmojo-CM-scrolldown" ' +
                                       'onmousedown="mstrmojo.all.{@id}.onmousedownarrow(self, arguments[0], false)" ' + 
                                       'onmouseup="mstrmojo.all.{@id}.onmouseuparrow(self, arguments[0], false)"' +    
                                       'onclick="mstrmojo.all.{@id}.onclickarrow(self, arguments[0], false)" ' +                                      
                                   '></div>' +
                              '</div>',
                              
                markupSlots: {
                    scrollupNode: function(){return this.domNode.firstChild;},
                    itemsContainerNode: function(){return this.domNode.childNodes[1];},
                    scrolldownNode: function(){return this.domNode.lastChild;}
                },
    
                markupMethods: {
                    onvisibleChange: function(){ 
                        var dn = this.domNode,
                            icn = this.itemsContainerNode,
                            sun = this.scrollupNode,
                            sdn = this.scrolldownNode;
                        dn.style.display = this.visible ? 'block' : 'none'; 
                        if(this.visible){
                            sun.style.display = 'none';
                            sdn.style.display = 'none';
                            icn.style.overflow = 'auto';
                            icn.style.height = 'auto';
                            
                            //show or hide the scroll up/down nodes
                            var wh = mstrmojo.dom.windowDim().h,
                                dh = dn.offsetHeight,
                                dw = dn.offsetWidth;
                            if(wh < dh){
                                sun.style.display = 'block';
                                sun.style.minWidth = dw + 'px';
                                sdn.style.display = 'block';
                                sdn.style.minWidth = dw + 'px';
                                icn.style.overflow = 'hidden';
                                icn.style.height = (wh - 42) + 'px';
                            }
                        }
                    },
                    onleftChange: function(){ this.domNode.style.left = (this.left != null) ? this.left: ''; },
                    ontopChange: function(){ this.domNode.style.top = (this.top != null) ? this.top: ''; }
                },

                listMapper: mstrmojo.WidgetListMapperTable,
                
                itemFunction: function itemFunction(item, idx, w){
                    if (!_loaded) {
                        mstrmojo.requiresCls("mstrmojo.ContextMenuItem");
                        _loaded = true;
                    }   
                    
                    var cfg = {
                                data: item,
                                parent: w,
                                hasSubmenu: w._cmSource.hasSubmenu(item),
                                dynamicUpdate: w.dynamicUpdate,
                                _cmSource: w._cmSource,
                                zIndex: w.zIndex,
                                itemIdField: w.itemIdField,
                                itemField: w.itemField,
                                itemChildrenField: w.itemChildrenField,
                                itemFunction: w.itemFunction
                        },
                        iw = new mstrmojo.ContextMenuItem(cfg);
                    return iw;
                },
                
                onmousedownarrow: function onmousedownarrow(win, evt, up){
                    _fireJumps(this, up);
                },
                
                onclickarrow: function oca(win, evt, up){
                    _jumpTo(this, scrollStep * (up? -1:1));
                },
                
                onmouseuparrow: function onmouseuparrow(win, evt, up){
                    _stopJumps(this);
                }
    }); //end declare()
    

})();