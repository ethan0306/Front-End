(function() {

    mstrmojo.requiresCls(
        "mstrmojo.dnd",
        "mstrmojo.dom", 
        "mstrmojo.fx",    		
        "mstrmojo.DraggableDialog", 
        "mstrmojo._IsPopup",
        "mstrmojo._HasPopup",
        "mstrmojo._IsMovable"
        );
    
    var _D = mstrmojo.dom,
        _FX = mstrmojo.fx;
    
    
    /**
     * Editor is a dialog that has title bar with title and content area.
     * 
     * <p> Users can drag and move the editor through the title bar, which contains other shortcut buttons, such as
     * close, help or menu.</p>
     * 
     * <p> Like mstrmojo.Popup, mstrmojo.Editor is also a Popup. However, compared to Popup, Editor is more complicated and offer couple more
     * configurable features. First, an editor can have a title bar(showTitle is used to configured whether or not show a title bar). 
     * Secondly, it can be dragged and moved around using title bar. Thirdly, an editor can also be configured to have curtain to avoid end users to interact while
     * it is popup/open, using parameter 'modal'. An editor can also be associated with a help topic and auto-closed.</p>
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.Editor = mstrmojo.declare(

        mstrmojo.DraggableDialog,

        [mstrmojo._IsPopup, mstrmojo._HasPopup, mstrmojo._IsMovable],
        
        /**
         * @lends mstrmojo.Editor.prototype
         */
        {
            scriptClass: "mstrmojo.Editor",
            
            /**
             * An optional title for the editor.
             * 
             * @type String
             */
            title: '',
            
            /**
             * The help topic this editor is associated with. 
             */
            help:'',
            
            /**
             * Whether or not autoClose this editor when clicking any place other than the editor. 
             */
            autoClose: false,
            
            /**
             * Whether or not show the title bar. 
             */
            showTitle: true,
            
            /**
             * Effect used to show the curtain and editor when opening them. 
             * Note that this effect shall handle showing of both curtain and editor. 
             * In the case of curtain, the modal of editor has to be considered as well. 
             */
            openEffect: null,

            /**
             * Effect used to close the curtain and editor when closing them. 
             * Note that this effect shall handle closing of both curtain and editor. 
             * In the case of curtain, the modal of editor has to be considered as well.
             */
            closeEffect: null,
            
            /**
             * Which node will be used as handle for the DnD functionality, from Dialog
             * */
            draggableNodeName : "titlebarNode",
            
            draggable: true,
            
            markupString: '<div id="{@id}" class="mstrmojo-Editor-wrapper">' +
                            '<div class="mstrmojo-Editor {@cssClass}" style="z-index:{@zIndex};{@cssText}" mstrAttach:mousedown>{@titlebarHTML}' + 
                                '<div class="mstrmojo-Editor-content"></div>' +
                                '<div class="mstrmojo-Editor-buttons"></div>' +
                            '</div>' +
                            '<div class="mstrmojo-Editor-curtain"></div>' + 
                          '</div>',
            
            titleMarkupString: '<div style="position:absolute;width:100%;"><table cellspacing="0" cellpadding="0" class="mstrmojo-Editor-titlebar"><tr>' +
                          '<td class="mstrmojo-Editor-titleCell"><div class="mstrmojo-Editor-title"></div></td>' +
                          '<td><a href="#" target="_new" class="mstrmojo-Editor-help"><img class="mstrmojo-Editor-help" src="../images/1ptrans.gif" title="' + mstrmojo.desc(1143,"help") + '"></img></a></td>' +
                          '<td><div class="mstrmojo-Editor-close" title="' + mstrmojo.desc(2102,"Close") + '"></div></td>' +
                     '</tr></table></div><div class="mstrmojo-Editor-titleSpacer"></div>',
                               
             markupSlots: {
                 editorNode: function(){ return this.domNode.firstChild;},
                 titlebarNode: function() { return this.showTitle ? this.domNode.firstChild.firstChild.firstChild : null; },
                 titleNode: function(){ return this.showTitle ? this.domNode.firstChild.firstChild.firstChild.rows[0].cells[0].firstChild : null;},                
                 helpNode: function(){ return this.showTitle ? this.domNode.firstChild.firstChild.firstChild.rows[0].cells[1].firstChild : null;},
                 closeNode: function(){ return this.showTitle ? this.domNode.firstChild.firstChild.firstChild.rows[0].cells[2].firstChild : null;},
                 containerNode: function(){ return this.domNode.firstChild.childNodes[2]; },
                 buttonNode: function() { return this.domNode.firstChild.childNodes[3]; },
                 curtainNode: function(){return this.domNode.lastChild;}
             },

            markupMethods: {
                ontitleChange: function(){if(this.showTitle) {this.titleNode.innerHTML = this.title;}},
                onzIndexChange: function(){
                    this.editorNode.style.zIndex = this.zIndex;
                    this.curtainNode.style.zIndex = this.zIndex - 1;
                },
                onvisibleChange: function(init){
                    if(init) {return;}
                    var v = this.visible,
                        fx = v ? 'openEffect' : 'closeEffect',
                        d = v ? 'block' : 'none'; 
                    
                        if(this[fx]){
                            this.playEffect(fx);
                        } else {
                            this.editorNode.style.display = d;
                            if(this.modal) {
                                this.curtainNode.style.display = d;   
                            } 
                        }   
                },                
                onhelpChange: function(){ 
                    if(this.showTitle) {
                        if(this.help === null){
                            this.helpNode.style.display = "none";
                        }
                        this.helpNode.href = '../help/WebUser/WebHelp/Lang_' + mstrApp.localeId + 
                            '/MicroStrategy_Web_Help.htm#' + (this.help ? this.help : '');
                    }
                },
                onleftChange: function(){ this.editorNode.style.left = (this.left != null) ? this.left: ''; },
                ontopChange: function(){ this.editorNode.style.top = (this.top != null) ? this.top: ''; }
            },
            
            /**
             * Override to handle showTitle parameter. 
             */
            preBuildRendering: function preBuildRendering() {
                if(!this.slot && !this.placeholder){
                    this.placeholder = document.body.appendChild(document.createElement("div"));
                    this._curtain_to_body = true;
                }

                this.titlebarHTML = this.showTitle ? this.titleMarkupString : '<div></div><div></div>';

                
                // Call the super.
                if (this._super) {
                    return this._super();
                } else {
                    return true;
                }
            },      

            getMovingHandle: function getMovingHandle(){
                return this.titlebarNode;
            },
            
            getMovingTarget: function getMovingTarget(){
                return this.editorNode;

            }, 
           
            /**
               * Custom setter in order to set up handlers for resize curtain, center editor and auto close editor. 
               */
              _set_visible: function(n,v){
                  var bChanged = false,
                      vWas = this[n];
                  this[n] = v;
                  bChanged = (vWas !== v);
                  if(bChanged){
                      if(v){//visible = true
                          
                              if(this._curtain_to_body){
                            this.resizeDialog();
                            this.positionDialog();
                          }
                          
                          //auto close
                          if(this.autoClose){                  
                              var me = this;
                              
                              if(!this._close_handler){
                                  this._close_handler = function(){
                                      var t = _D.eventTarget(self, arguments[0]); //TQMS 416177: somehow IE7 would return t as an empty object as event target.   
                                      if (t && t.parentNode && !_D.contains(me.editorNode, t , true, document.body)) {
                                          me.close();
                                      }
                                };
                            }
                              _D.attachEvent(document.body, "mousedown", this._close_handler);  
                          }                          
                      }else{//visible = false
                          if(this._curtain_handler){
                              _D.detachEvent(window, 'resize', this._curtain_handler);
                          } 
                          if(this._close_handler){
                              _D.detachEvent(document.body, "mousedown", this._close_handler);
                          } 
                      }
                  }
                  return bChanged;
              }              
              
        }
    );

       
    mstrmojo.Editor.openEffect_fadeIn = {
            scriptClass: "mstrmojo.fx.AnimateProp",
            slot:'curtainNode',
            props:{
                backgroundColor:{
                    start:255,
                    stop:0,
                    //ease: mstrmojo.ease.cos,
                    fn: function(v){
                        v = Math.round(v);
                        return ['rgb(',v,',',v,',',v,')'].join('');
                    }
                }
            },                
            preStart: function() {
                var t = this.target,
                    ts = t.style,
                    w = this.widget;
                
                w.editorNode.style.display = 'block';    
                
                if(w.modal) {
                    ts.display = 'block';
                    if (_D.isIE) {
                        ts.filter = 'alpha(opacity= 60)'; 
                    } else {
                        ts.opacity = 0.6;
                    }                        
                } else {
                    return false;
                }       
            }
        };
        
        mstrmojo.Editor.closeEffect_fadeOut = {
            scriptClass: "mstrmojo.fx.FadeOut",
            slot:'curtainNode',
            start:0.6,
            stop:0,                
            preStart:function(){
                this.widget.editorNode.style.display = 'none';
                if(!this.widget.modal) {
                    return false;
                }
            }
        };    
})();