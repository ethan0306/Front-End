(function(){
    mstrmojo.requiresCls("mstrmojo.Box", 
                         "mstrmojo.dom");
    
    var $D = mstrmojo.dom,
        $C = mstrmojo.css,
        $NIB = mstrmojo.Button.newIconButton,
        BC = 'mstrmojo-oivmSprite ', //button style prefix
        POPUP_INLINE = 0,
        POPUP_ABOVE = 1,
        POPUP_BELOW = 2,
        cssClassMap = {
            0 : 'inline',
            1 : 'above',
            2 : 'below'
        };
    
    function getPopupBaseConfig(dom) {
        var ofst = mstrmojo.boxmodel.offset(dom, document.body);
        
        return {
            left: ofst.left,
            top: ofst.top,
            width: dom.offsetWidth,
            height: dom.offsetHeight
        };
    }
        
    mstrmojo.OIVMDICPopup = mstrmojo.declare(
        mstrmojo.Popup,
        null,
        {
            scriptClass: "mstrmojo.OIVMDICPopup",
            
            autoCloses: false,

            cssClass: 'inline',
            
            markupString: '<div dic="1" id={@id} class="mstrmojo-OIVMDICPopup {@cssClass}" style="{@cssText}" mstrAttach:keyup>' +
                             '<div class="toolbar"></div>' +
                             '<div class="dataInputControl"></div>' +
                             '<div class="boxtip"></div>' +
                          '</div>',
            
            markupSlots: {
                toolbarNode: function() { return this.domNode.firstChild; },
                containerNode: function() { return this.domNode.children[1]; },
                tipNode: function() { return this.domNode.lastChild; }
            },
            
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block' : 'none'; },
                onheightChange: function() { this.domNode.style.height = this.height || ''; },
                onwidthChange: function() { this.domNode.style.width = this.width || ''; },
                ontopChange: function() { this.domNode.style.top = this.top || ''; },
                onleftChange: function() { this.domNode.style.left = this.left || ''; },
                oncssClassChange: function() { this.domNode.className = 'mstrmojo-OIVMDICPopup ' + this.cssClass;}
            },
            
            /**
             * Set the style of the editor so that it can be displayed without truncating.
             */         
            setStyle: function() {
                var widget = this.widget, 
                    dic = widget.dic,
                    popup = widget.popupStyle,
                    opbox = getPopupBaseConfig(widget.openerNode),
                    dm = this.domNode, //DOM of the DIC popup
                    ds = dm.style,
                    ws = widget.domNode.style, //Style of the DIC widget
                    tipNode = this.tipNode,
                    width = dic.wm ? dic.w : opbox.width, 
                    height = dic.hm ? dic.h : opbox.height,
                    i;

                this.set('cssClass', cssClassMap[popup]);
                
                if(popup === POPUP_INLINE) {
                    for(i in opbox) {
                        ds[i] = opbox[i] + 'px';
                    }
                    widget.set('width', width - 2);
                    ws.width = (width - 8) + 'px';
                    ws.height = (height > 8) ? (height - 8) + 'px': 'auto';
                } else if(popup === POPUP_ABOVE) {
                    var w = width,
                        left = opbox.left + opbox.width/2 - 21,
                        top = opbox.top,
                        tipUp = top < 76;
                    
                    //adjust editor position and tip css class
                    top = tipUp ? top + opbox.height + 15 :  top - 76;
                    tipNode.className = tipUp ? 'boxtip up' : 'boxtip';
                     
                    ds.left = left + 'px';
                    ds.top = top + 'px';
                    ds.width = widget.domNode.scrollWidth + 'px';
                    ds.height = '44px';
                    
                    w = w > 100 ? (w + 70) : 200;
                    //adjust 'left' to make the editor is fully visible in browser window
                    var shift = document.body.offsetWidth - left - w - parseInt($C.getStyleValue(dm, 'paddingLeft'), 10) - parseInt($C.getStyleValue(dm, 'paddingRight'), 10);
                    shift = shift > 0 ? 0 : shift;
                    ds.left = left + shift + 'px';
                    tipNode.style.left = 15 - shift + 'px'; //move tip 15 pixel to the right so that it can be shifted to the right of the round corner
                } else if (popup === POPUP_BELOW){//POPUP_BELOW
                    ds.top = opbox.top + 'px';
                    ds.left = opbox.left + 'px';
                    ds.height = ws.height;
                    ds.width = ws.width;
                }
            },
            
            onOpen: function onOpen() {          
                var w = this.widget, lw = this.lastwidget;
                
                // the dic popup is opened for a new input control widget
                if (lw != w){
                    // remove the last input control widget
                    if (lw){
                        this.removeChildren(lw);
                    }
                    // update reference
                    this.lastwidget = w;
                }
                
                // If the new widget has been rendered, unrender it to force it be rendered again.
                // Have to do it here instead of in onOpen because IE has some weird issues.
                if (w.hasRendered){
                    w.unrender();
                }
                
                this.addChildren([w]);

                this.setStyle();
                
                // attach the DOM event to hide the popup when click outside or mouse scroll.
                var me = this;
                this.md = this.md || function(e) {  
                    var elTarget = $D.eventTarget(self, e),
                        t = $D.findAncestorByAttr(elTarget, 'dic', true);
                    
                    if(!elTarget.getAttribute('dic') && !t) {
                        me.onBlur(); 
                    }
                };
                this.mw = this.mw || function() {  
                    me.onBlur(); 
                };
                $D.attachEvent(document, 'mousedown', this.md);
                $D.attachEvent(document, $D.isFF ? 'DOMMouseScroll' : 'mousewheel', this.mw);
                
                //sorry IE, no animations for you due to a flashing issue and missing images 
                if(!$D.isIE) {
                    var fx = new mstrmojo.fx.FadeIn({target: this.domNode});
                    fx.play();
                }
            },
            
            onBlur: function() {
                if (this.widget.popupStyle === POPUP_INLINE) {
                    this.widget.applyChanges();
                }
                this.close();
            },
            
            onClose: function() {
                //detach the mousedown handler added in setTarget()
                $D.detachEvent(document, 'mousedown', this.md);
                //detach the mouse wheel handler
                $D.detachEvent(document, $D.isFF ? 'DOMMouseScroll' : 'mousewheel', this.mw);
                this.toolbar.apply.set('enabled', false);
            },
            
            /**
             * The function handles the apply action when the apply button is clicked.
             * @private
             */
            onApply: function() {
                this.widget.applyChanges();
                this.close();
            },
       
            /**
             * The function handles the cancel action when the cancel button is clicked
             * @private
             */
            onCancel: function() {
                this.widget.cancelChanges();
                this.close();
            },
            
            onkeyup: function onkeyup(evt) {
                var hWin = evt.hWin,
                    e = evt.e || hWin.event;
                
                //on enter key
                if(this.widget.applyOnEnter && e.keyCode === 13) {
                    // Call the on blur method.
                    this.onApply();
                //on escape key    
                } else if(e.keyCode === 27) {
                    this.onCancel();
                }               
            },
            
            enableApply: function(){
                this.toolbar.apply.set('enabled', true);
            },
            
            preBuildRendering : function preBldRnd() {
                // append the popup to the end of the document DOM
                if (!this.slot && !this.placeholder) {
                    this.placeholder = document.body.appendChild(document.createElement("div"));
                }

                if (this._super) {
                    return this._super();
                } else {
                    return true;
                }
            },
            
            children: [
                {
                    scriptClass: 'mstrmojo.ToolBar',
                    slot: 'toolbarNode',
                    alias: 'toolbar',
                    children: [
                        $NIB(mstrmojo.desc(134, 'Apply'), BC + 'tbApply greyed', function() {
                            this.parent.parent.onApply();
                        }, null, {enabled: false, alias: 'apply', onenabledChange: function(){$C.toggleClass(this.domNode, 'greyed', !this.enabled);}}),
                        $NIB(mstrmojo.desc(221,'Cancel'), BC + 'tbCancel', function() {
                            this.parent.parent.onCancel();
                        })
                    ]
                }
            ]
        }
    );
}());