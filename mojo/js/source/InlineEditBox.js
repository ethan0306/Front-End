(function(){

    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.css",
            "mstrmojo.Widget"
    );
    
    var _D = mstrmojo.dom;
    
    /**
     * InlineEditBox is a widget that allows editing a text using an inline text input. You can click the widget to initialize the editing process; 
     * afterward, by clicking anywhere other than the widget, the change would be saved. It has couple configuration parameters: 
     * 1) okSave. This parameter controls whether we will show ok/cancel buttons to save/cancel the change explicitly. By default,
     * it is false, in which case, no ok/cancel button would be shown and there is no way the change would be canceled.
     * 2) emptyHint. This parameter is a hint to users, when the text value of the widget is empty. 
     */
    mstrmojo.InlineEditBox = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.InlineEditBox",
            
            /**
             * The text value of the widget that can be edited/changed inline. 
             */
            text: null,

            /**
             * Internal instance variable indicating whether the text value of the widget is being edited. 
             */
            editMode: false,
            
            /**
             * Whether to show the ok/cancel button to save/cancel change explicitly. 
             */
            okSave: false,
            
            /**
             * A text to be shown when the text value of this widget is empty. 
             */
            emptyHint: 'Enter your text here.',
            
            markupString: '<div id="{@id}" class="mstrmojo-InlineEditBox {@cssClass}" style="{@cssText}" mstrAttach:click>' + 
                            '<div class="mstrmojo-InlineEditBox-text">{@text}</div>' +
                            '<div class="mstrmojo-InlineEditBox-edit">' + 
                                '<input type="text" class="mstrmojo-InlineEditBox-input" mstrAttach:keyup/>'+
                                '<img class="mstrmojo-InlineEditBox-ok" src="../images/1ptrans.gif" title="Save"/>' +
                                '<img class="mstrmojo-InlineEditBox-cancel" src="../images/1ptrans.gif" title="Cancel"/>' +
                            '</div>' +
                          '</div>',
            
            markupSlots: {
                textNode: function(){return this.domNode.firstChild;},
                editNode: function(){return this.domNode.lastChild;},
                inputNode: function(){return this.domNode.lastChild.firstChild;},
                okNode: function(){return this.domNode.lastChild.childNodes[1];},
                cancelNode: function(){return this.domNode.lastChild.lastChild;}
            },
            
            markupMethods: {
                ontextChange: function(){ 
                    this.textNode.innerHTML = this.text || this.emptyHint || ''; 
                },
                oneditModeChange: function(){
                    var em = this.editMode,
                        dn = this.domNode,
                        tn = this.textNode,
                        en = this.editNode;
                    
                    mstrmojo.css.toggleClass(dn,['edit'],em);
                    
                    if(em){
                        tn.style.display = 'none';
                        en.style.display = 'block';
                        
                        //adjust input node value/width/height
                        var tn = this.inputNode,
                            tns = tn.style;
                        tn.value = this.text || '';
                        tns.width = (dn.clientWidth - (this.okSave ? (this.okNode.offsetWidth + this.cancelNode.offsetWidth) : 0)) + 'px';
                        tns.height = dn.clientHeight + 'px';
                        
                        //set caret
                        tn.focus();
                        if(tn.createTextRange){//workaround for caret in IE
                            var tr = tn.createTextRange(),
                                len = tn.value.length;
                            tr.move('character', len);
                            tr.select();
                        }
                    } else {
                        tn.style.display = 'block';
                        en.style.display = 'none';
                    }
                }, 
                onokSaveChange: function(){
                    var s = this.okSave ? 'inline' : 'none';
                    this.okNode.style.display = s;
                    this.cancelNode.style.display = s;
                }
            },
            
            preclick: function(evt){
                var e = evt.e,
                    t = _D.eventTarget(evt.hWin,e);
                if(t === this.okNode){
                    this.save();
                } else if(t === this.cancelNode){
                    this.cancel();
                } else {
                    this.set('editMode', true);
                }
            },
            
            prekeyup: function(evt){
                var  e = evt.e,
                    k = e.keyCode || e.charCode;
                if(k == mstrmojo.Enum_Keys.ENTER){
                    this.save();
                }else if(k == mstrmojo.Enum_Keys.ESCAPE){
                    this.cancel();
                }
            },
            
            _attachEvents: function(){
                var me = this;
                if(this.editMode){
                    if(!this._save_handler){
                        this._save_handler = function(){
                            var t = _D.eventTarget(self, arguments[0]);   
                            if (!_D.contains(me.domNode, t , true, document.body)) {
                                me.save();
                            }
                        };
                    }                    
                    _D.attachEvent(document.body, "mousedown", this._save_handler);  
                } else {
                    if(this._save_handler){
                        _D.detachEvent(document.body, "mousedown", this._save_handler);
                    } 
                }
            },
            
            postBuildRendering: function(){
                if(this._super){
                    this._super();
                }
                this._em_sub = this.attachEventListener('editModeChange', this.id, '_attachEvents');
            },
            
            destroy: function(){
                this.detachEventListener(this._em_sub);
                if(this._super){
                    this._super();
                }
            },
            
            save: function(){
                this.set('text', this.inputNode.value);
                this.set('editMode', false);
            },
            
            cancel: function(){
                this.set('editMode', false);
            }
        }
    );
    
})();