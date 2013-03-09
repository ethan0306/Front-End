(function () {
    mstrmojo.requiresCls(   
        "mstrmojo.dom",
        "mstrmojo.string",
        "mstrmojo.array",
        "mstrmojo.hash",
        "mstrmojo._HasSuggestion",
        "mstrmojo.WidgetList",
        "mstrmojo.List",
        "mstrmojo.Editor");
    
    /**
     * This mixin provides logic to support the case when the set of candidates for ObjectInputBox is not completely cached in the client side.
     * In this case, the list of suggestion are fetched dynamically and the validity of an object item is verified dynamically through
     * web server calls (in addition to the set of candidates cached in the client side), based on what users have typed. To accomplish this, 
     * it maintains a queue of object items waiting for verification and a local cache of response from last task call for suggestion. To apply
     * this class to specific scenario, you may want to provide an implementation for getCandidatesThroughTaskCall method. See UserInputBox 
     * (used to input users/user groups in MSTR system) for an example.
     */
    mstrmojo._DynamicVerify = mstrmojo.provide(
            "mstrmojo._DynamicVerify",
            {
                
                /**
                 * A queue to hold all the verifying request. 
                 */
                _verify_queue: null,
                
                /**
                 * Wehther there is a verifying task call already. 
                 */
                _verify_inprogress: false,
                
                
                getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                    
                },
                
                /**
                 * Override parent implementation to support dynamic verifying of object. 
                 */
                verifyObject: function verifyObject(t,w){
                    //return STATES.VALID;
                    var c = this.candidates,
                        its = c && c.items,
                        ic = c && c.isComplete;
                    
                    if(c){
                        var idx = mstrmojo.array.find(its, this.itemField, t);
                        if(idx>-1){
                            w.updateData(its[idx]);
                            return STATES.VALID;
                        } else if(ic) {
                            return STATES.INVALID;
                        }
                    } 
                    
                    this._verify_queue = this._verify_queue || [];
                    var q = this._verify_queue,
                        info = {pattern:t, id: w.data[this.itemIdField]};
                    
                    q.push(info);
                    
                    if(!this._verify_inprogress){
                        this.verifyNextCandidate();
                    }
                    
                    return STATES.UNDETERMINED;
                }, 
                
                verifyNextCandidate: function verifyNextCandidate(){
                    var q = this._verify_queue;
                    if(!q || q.length === 0){
                        this._verify_inprogress = false;
                        return;
                    }
                    var info = q.shift();
                    this.verifyCandidate(info);
                },
                
                verifyCandidate: function verifyCandidate(info){
                    var me = this,
                        success = function(res){
                            var ws = me.ctxtBuilder.itemWidgets,
                                len = ws && ws.length,
                                target;
                            for(var i=0;i<len;i++){
                                if(ws[i].data[me.itemIdField] == info.id){
                                    target = ws[i];
                                    break;
                                }
                            }
                            if(!target) {
                                return;
                            }
                            var its = res.items;
                            if(its && its.length == 1){
                                target.updateData(its[0]);
                            } else {
                                target.set('state', STATES.INVALID);
                            }
                        },
                        failure = function(res){
                            mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                        },
                        complete = function(){
                            me.verifyNextCandidate();
                        },
                        callbacks = {success: success, failure: failure, complete: complete},
                        params = {pattern: info.pattern, blockBegin: 1, blockCount: this.suggestCount, isVerify: true};
                   
                   this._verify_inprogress = true;
                   this.getCandidatesThroughTaskCall(params, callbacks);
                }      
            }
          );
    
    /**
     * This enum constants list all the possible states of an item/object for ObjectInputBox:
     * -1: undetermined, in the process of verifying the object item's validity.
     * 0: Valid, the object item is valid. 
     * 1: Invalid, the object item is invalid.
     * 2: Editing, the object item is being edited.
     * 3: Adding, the object item is a placeholder item for adding new object.
     * 4: Empty Text, the object item is a dummy item for showing empty text. 
     */
    mstrmojo.Enum_OIB_States = {'UNDETERMINED': -1, 'VALID': 0, 'INVALID': 1, 'EDITING': 2, 'ADDING': 3, 'EMPTY': 4};
    mstrmojo.Enum_OIB_States_CSS = (function(){
        var STATES = mstrmojo.Enum_OIB_States,
            CSS = {};
        for(var s in STATES){
            if(STATES.hasOwnProperty(s)){
                CSS[String(STATES[s])] = s;
            }
        }
        return CSS;
    })();
    
    var D = mstrmojo.dom,
        STATES = mstrmojo.Enum_OIB_States,
        _freeIdCounter = 0,
        _ITEM_ID_FIELD = '_did_',
        KEYS = mstrmojo.Enum_Keys,
        MIN_TEXTINPUT_WIDTH = 80,
        KEY_DELAY = 200;
    
    function _nextId(){
        return _freeIdCounter ++;
    }
    
    function _addingItem() {
        var it = {n:'', state: STATES.ADDING};
        it[_ITEM_ID_FIELD] = -1;
        return it;
    }

    function _isAddingItem(it){
        return (it && it.state === STATES.ADDING);
    }
    
    function _emptyItem(t){
        t = t || '';
        var it = {n:t,state:STATES.EMPTY};
        it[_ITEM_ID_FIELD] = -2;
        return it;
    }
        
    function _isEmptyItem(it){
        return (it && it.state === STATES.EMPTY);
    }
    
    function _isEmpty(w){
        var its = w.items,
            len = its && its.length;
        if(!len) {//if length = 0 or its not exists
            return true;
        }
        return (len == 1 && _isAddingItem(its[0])) || (len == 2 && _isEmptyItem(its[0]) && _isAddingItem(its[1]));
    }
    
    
    /**
     * ObjectInputBox is a widget that allows to input objects which have a fixed set of candidates, like users/user groups
     * in a system, email contacts, or metrics in a project. It shall have the following functionalities:
     * 1) Whenever you input anything, a list of suggestion (filtered by what have been input) shall be shown to select against 
     *    through tab key or enter key or mouse. If you select one from the suggested list, it becomes a valid item; 
     *    and the widget shall be ready for inputing another item.
     * 2) You can always delete or edit any existing item. Whenever it is being edited, a list of suggested values will be shown to end users. 
     * 3) The set of candidates can be incomplete, in other words, browser does not have the whole set of candidates cached in the client side.
     *    In this case, ObjectInputBox shall be able to request the set of suggestion from web server (in addition to the set of candidates 
     *    already cached in the client), and verify whether an object is part of candidates through task calls. Notice that ObjectInputBox itself
     *    only supports the case that all candidates are cached in the client side, to support incomplete candidates, you have to subclass 
     *    ObjectInputBox and mixin _DynamicCandidates class. See UserInputBox (used to input users/user groups in MSTR system) for an example. 
     * 4) Keyboard support:
     *    Tab: create a new item using the highlighted item of the suggestion list;
     *    Enter: create a new item using the highlighted item of the suggestion list;
     *    Esc: close the suggestion list;
     *    Arrow-down: open the suggestion list if not opened, or move the highlight to next item if the suggestion list is already open;
     *    Arrow-up: move the highlight to previous item if the suggestion list is open;
     *    Backspace: remove the previous character if there is some text input, otherwise, delete the previous existing item. 
     */
    
    mstrmojo.ObjectInputBox = mstrmojo.declare(
        // superclass
        mstrmojo.WidgetList,
        // mixins
        [mstrmojo._HasSuggestion, mstrmojo._DynamicVerify],
        // instance members
        {
            scriptClass: 'mstrmojo.ObjectInputBox',
            
            cssClass: 'mstrmojo-ObjectInputBox',
            
            /**
             * <p>Optional text to display when the deactivated ObjectInputBox does not have any selections yet.</p>
             *
             */
            emptyText: '',   
            
            /**
             * The list of selected item. It shall have a field called state, with values as one of 'valid', 'invalid'
             * or 'validating'. 
             */
            items: null,

            itemField: 'n',
            
            dynamicVerify: true,
            
            suggestCount: 10,
            
            candidates: null,
            
            makeObservable: true,
            
            renderOnScroll: false,
            
            editingIdx: null,
            
            isActive: false,
            
            maxObjectCount: null,
            
            isFull: false,
              
            /**
             * The flag indicate whether we only allow user select item from suggest list
             */
            acptSugItemOnly: false,
            
            useKeyDelay: false,
              
            getSuggestionTarget: function getSuggestionTarget(){
                return this.suggestTarget;
            },   
            
            onsuggestTargetChanged: function onsuggestTargetChanged(evt){
                this._request_pattern = null; //clear request pattern when target is changed. 
            },
            
            getSuggestionPos: function getSuggestionPos(){
                return this._pop_cfg;
            },   
            
            onSuggestionItemSelect: function onSuggestionItemSelect(it){
                this.suggestTarget.setItem(it[this.itemField], it, false);
                this.hideSuggestion();
            },
            
            hideEditButton: function(d){
                return !!this.noEditButton;
            },
            
            /**
             * Override to add a input item to the end of the selected list. 
             */
            initItems: function initItems(its){
                its = its || [];
                
                this.set('isFull', this.maxObjectCount && its.length>= this.maxObjectCount);
                
                //adding empty item if empty
                if(its.length === 0){
                    var tx = this.emptyText || '';
                    if(tx.length > 0){
                        its.push(_emptyItem(tx));
                    }
                }
                
                //always add adding item
                its.push(_addingItem()); 
                
                //hide the adding item if the list is already full
                var w = its[its.length - 1];
                if(w && _isAddingItem(w) && this.maxObjectCount && (this.getSelectedObjects().length >= this.maxObjectCount)){
                    this.set('isFull', true);
                    //w.domNode.style.display = 'none';
                } 
                
                //overwrite the itemIdField parameter
                this.itemIdField = _ITEM_ID_FIELD;
                    
                return this._super(its);
            },
            
            add: function add(arr, at){
                var w = this.getAddingInput();    
                
                if(!this.maxObjectCount || this.getSelectedObjects().length < this.maxObjectCount){
                    this._super(arr, at);
                } 
                
                if(!_isEmpty(this) && _isEmptyItem(this.items[0])){
                    this.remove(0);
                }
                
                if(w){
                    w.adjustInputWidth();
                }
                
                if(w && this.maxObjectCount && (this.getSelectedObjects().length == this.maxObjectCount)){
                    this.set('isFull', true);
                } 
                
                // hide the adding item
                w.domNode.style.display = 'none';
            },
            
            remove: function remove(arr){
                this._super(arr);
                
                var w = this.getAddingInput();

                if(w && this.maxObjectCount && (this.getSelectedObjects().length < this.maxObjectCount)){
                    this.set('isFull', false);
                }
                
                if(w){
                    w.adjustInputWidth();
                }
            },
            
            postBuildRendering: function pstBR(){
                if (this._super) {
                    this._super();
                }
                
                var me = this,
                    w = me.getAddingInput();
                // Always hide the input node
                w.domNode.style.display = 'none';
                
                this._clickHandler = function(evt){
                    me.activate();
                };
                
                this._mousedownHandler = function(evt){
                    if(!me.isActive || me.browserShown) {
                        return;
                    }
                    
                    //if it is not clicking on myself, exist editing state, validating, and remove event handler
                    var s = D.eventTarget(self,evt);
                    if(s && s.parentNode && !D.contains(me.domNode,s,false,document.body)){
                        me.deactivate();
                    } 

                };
                
                D.attachEvent(this.domNode, 'click', this._clickHandler);
            },
            
            getAddingInput: function getAddingInput(){
                var ws = this.ctxtBuilder.itemWidgets, 
                    w;                
                w = ws[ws.length-1];
                if(w && w.isAdding){
                    return w;
                }
                return null;
            },
            
            getActiveInput: function getActiveInput(){
                var ws = this.ctxtBuilder.itemWidgets, 
                    w;
                if(this.editingIdx !== null){
                    return ws[this.editingIdx];
                } else {
                    return this.getAddingInput();
                } 
                return null;
            },
            
            activate: function(){
                this.isActive = true;
                
                //remove empty hint
                if(_isEmptyItem(this.items[0])){
                    this.remove(0);
                }
                
                var w = this.getActiveInput();
                if(w) {
                    // show adding item if it is not full
                    if(_isAddingItem(w) && !this.isFull) {
                        w.domNode.style.display = 'block';
                    }
                    this.scrollTo(w.data);                    
                    w.focus();
                }
                D.attachEvent(document.body, 'mousedown', this._mousedownHandler);
            }, 
            
            deactivate: function(){
                this.isActive = false;
                
                //add empty hint if empty
                var tx = this.emptyText || '',
                    its = this.items;
                
                //if empty and first item not empty item, add it
                if(_isEmpty(this) && !_isEmptyItem(its[0]) && (tx.length > 0)){
                    this.add([_emptyItem(tx)], 0);
                }
                    
                //un-focus
                var w = this.getActiveInput();
                if(w) {
                    if(_isAddingItem(w)) {  // hide the ADDING item
                        w.domNode.style.display = 'none';
                    }                   
                    this.scrollTo(this.items[0]);    
                    w.blur();  
                }
                D.detachEvent(document.body, 'mousedown', this._mousedownHandler);  
            },
            
            nextId: _nextId,
            
            /**
             * Create a corresponding ObjectItem widget for each item. 
             */
            itemFunction: function(item, idx, w){
                
                //assign an internal id
                item[w.itemIdField] = _nextId();
                
                var c = new mstrmojo.ObjectItem({
                    parent:w,
                    itemField: w.itemField,
                    cssClass: w.item2textCss(item),
                    data: item
                });
                
                //attach events
                var evts = ['ItemEditBegin', 'ItemEditEnd', 'ItemDeletePrev', 'ItemDelete', 'ItemAdd', 'SuggestionOn', 'SuggestionOff'];
                for(var i=0,len=evts.length;i<len;i++){
                    c.attachEventListener(evts[i], w.id, '_itemChangeHandler');
                }              
                return c;
            },
            
            getSelectedObjects: function getSelectedObjects(){
                if(_isEmpty(this)){
                    return [];
                } else {
                    var its = this.items,
                        len = its.length,
                        last = len - 1;
                    if((last > -1) && (_isAddingItem(its[last]))){
                        return its.slice(0,last);
                    }
                    return its.concat();
                }
            },
            
            isValid: function isValid(){
                var ws = this.ctxtBuilder.itemWidgets,
                    len = ws && ws.length;
                for(var i=0;i<len;i++){
                    if(!ws[i].isValid()){
                        return false;
                    }
                }
                return true;
            },
      
            /**
             * Handler function to handle the event raised by any item widget indicating any state change. 
             */
            _itemChangeHandler: function(evt){
                var en = evt.name,
                    d = evt.d,
                    idx,
                    len = this.items.length,
                    w;
                switch(en){
                case 'ItemEditBegin': //need to remove the addingItem, which is the last one
                    if(this.editingIdx !== null){
                        //bluring the one being edited
                        w = this.getActiveInput();
                        if(w){
                            w.blur();
                        }                       
                    } 
                    idx = this.itemIndex(d);
                    this.editingIdx = idx;
                    this.activate();                    
                    break;
                case 'ItemEditEnd'://need to add the addingItem
                    this.editingIdx = null;
 
                    if(evt.deactivate){
                        this.deactivate();
                    }else{
                        this.activate();
                    }
                    
                    var w = this.getAddingInput();
                    if(w){
                        w.adjustInputWidth();
                    }
                    break;
                case 'ItemDelete'://need to remove the target item
                    if(this.editingIdx !== null){
                        //bluring the one being edited
                        w = this.getActiveInput();
                        if(w){
                            w.blur();
                        }    
                        this.editingIdx = null;
                    }                     
                    idx = this.itemIndex(d);
                    this.remove(idx);
                    if(!evt.deactivate){//from editing
                        this.editingIdx = null;
                        this.activate();
                    } else if(!this.isActive){
                        this.deactivate();
                    } else {
                        this.activate();
                    }
                        
                    break;
                case 'ItemDeletePrev':
                    if(len > 1){
                        this.remove(len - 2);
                    } 
                    break;
                case 'ItemAdd'://need to add a new item before the addingItem
                    var item = mstrmojo.hash.copy(evt.d);
                    this.add([item],len-1);
                    if(evt.deactivate){//from bluring
                        this.deactivate();
                    }else{//from editing
                        this.activate();
                    }                    
                    break;
                case 'SuggestionOn':
                    this.set('suggestTarget', evt.target);
                    this._pop_cfg = {target: evt.target, left:evt.l, top:evt.t, zIndex: 100};
                    //this.updateSuggestion(this.getSuggestion(evt.pattern));
                    this.showSuggestion(evt.pattern);
                    break;
                case 'SuggestionOff':
                    this.set('suggestTarget', null);
                    this.hideSuggestion();
                    break;
                }
                
                // A hook for custom behavior
                if (this.onitemchange && 
                    (en == 'ItemEditEnd' || en == 'ItemAdd' || en == 'ItemDelete' || en == 'ItemDeletePrev')) {
                    this.onitemchange();
                }
                
            },
            
            unrender: function unrender(ignoreDom){
                var pop = this.suggestionPopup;
                if(pop.hasRendered){
                    pop.unrender(false);
                }
                if(this._super){
                    this._super(ignoreDom);
                }
            },
            
            destroy: function destroy(skipCleanup){
                var pop = this.suggestionPopup;
                if(pop && pop.hasRendered){
                    pop.destroy(false);
                }                   
                if(this._super){
                    this._super(skipCleanup);
                }             
            }
            
        });
    
    mstrmojo.requiresCls(   
            "mstrmojo.Widget"
            );
    
    /**
     * Object Item is an item widget created/used by ObjectInputBox. 
     */
    mstrmojo.ObjectItem = mstrmojo.declare(
            // superclass
            mstrmojo.Widget,
            // mixins
            null,
            // instance members
            {  
                scriptClass:'mstrmojo.ObjectItem',
                
                markupString: 
                  '<div id={@id} class="mstrmojo-ObjectItem" style="{@cssText}">' +
                    '<div class="mstrmojo-ObjectItem-displayNode"><span class="mstrmojo-ObjectItem-text {@cssClass}">{@text}</span>' + 
                        '<img class="mstrmojo-ObjectItem-edit" src="../images/1ptrans.gif" title="'+mstrmojo.desc(1088,'Edit')+'" onclick="mstrmojo.all[\'{@id}\'].edit()"/>' +
                        '<img class="mstrmojo-ObjectItem-del" src="../images/1ptrans.gif" title="'+mstrmojo.desc(629,'Delete')+'" onclick="mstrmojo.all[\'{@id}\'].del(arguments[0])"/>' +
                    '</div>' + 
                    '<div class="mstrmojo-ObjectItem-editNode"><input type="text" class="mstrmojo-ObjectItem-input" mstrAttach:keyup,keydown/></div>' +
                  '</div>',
              
                markupSlots: {
                    displayNode: function(){return this.domNode.firstChild;},
                    editNode: function(){return this.domNode.childNodes[1];},
                    textNode: function(){return this.domNode.firstChild.firstChild;},
                    editButtonNode: function(){return this.domNode.firstChild.childNodes[1];},
                    delButonNode: function(){return this.domNode.firstChild.lastChild;},
                    inputNode: function(){return this.domNode.childNodes[1].firstChild;}
                },
                
                markupMethods:{
                    oncssClassChange: function(){
                        var tn = this.textNode;
                        tn.className = "mstrmojo-ObjectItem-text " + this.cssClass;
                    },
                    onstateChange: function(){
                        var s = this.state,
                            css = mstrmojo.Enum_OIB_States_CSS[s],
                            dn = this.domNode;
                        
                        if(s === STATES.EMPTY){
                            dn.innerHTML = '<div class="mstrmojo-ObjectItem-emptyText">' + this.text + '</div>';
                        } else if(s === STATES.EDITING){
                            var w = Math.round(this.displayNode.clientWidth);
                            this.editNode.style.width = w  - 4 + 'px';//clientWidth removing the padding
                            this.inputNode.style.width = w - 9 + 'px'; //remove the padding-left of the input and the padding of edit node
                        }
                        
                        dn.className = "mstrmojo-ObjectItem " + css;
                         
                        if(this.parent.hideEditButton(this.data)){
                            this.editButtonNode.style.display = 'none';
                        }
                    },
                    ontextChange: function(){
                        this.inputNode.value = this.text;
                        this.textNode.innerHTML = this.text;
                    }
                },
                
                state: STATES.VALID,  
                
                onstateChange: function onstateChange(evt){
                    this.data.state = this.state;
                },
                
                ontextChange: function ontextChange(evt){
                    this.data[this.itemField] = this.text;
                },
                
                updateData: function updateData(data){
                    mstrmojo.hash.copy(data, this.data);
                    this.set('state',STATES.VALID);
                    this.set('text',this.data[this.itemField]);
                    this.set('cssClass', this.parent.item2textCss(this.data));      
                },
                
                init: function init(props){
                    this._super(props);
                    var d = this.data,
                        s = d.state,
                        p = this.parent;
                    
                    if(typeof s == 'undefined'){//if state is not defined
                        s = p.dynamicVerify ? p.verifyObject(d[this.itemField], this) : STATES.UNDETERMINED;
                        d.state = s;
                    }
                    
                    this.cssClass = p.item2textCss(d);
                    this.text = d[this.itemField];
                    this.state = s;
                    this.isAdding = _isAddingItem(d);
                    
                },
                
                isValid: function isValid(){
                    return (this.state != STATES.INVALID && this.state != STATES.UNDETERMINED);
                },
                
                /**
                 *  Adding text input to adjust its width accordingly. See TQMS 449432. 
                 */
                adjustInputWidth: function adjustInputWidth(){
                    if(this.isAdding){
                        this.inputNode.style.width = MIN_TEXTINPUT_WIDTH + "px";
                        var wn = this.domNode.parentNode,
                            cw = wn.parentNode.offsetWidth,
                            tw = Math.max(cw - wn.offsetLeft - 20, MIN_TEXTINPUT_WIDTH);//20:  for scroll bar
                        if(!isNaN(tw)){
                            this.inputNode.style.width = tw + 'px';
                        }
                    }
                },
                
                blur: function blur(){
                    
                    this.hideSuggestion();
                    
                    //if not in editing mode, return
                    if(!this.isActive){
                        return;
                    } else {
                        this.isActive = false;
                    }
                    
                   
                    var n = this.inputNode,
                        t = n.value,
                        p = this.parent,
                        f = function(){
                            try{                             
                                n.blur();
                            }catch(e){}
                        };
                    
                    window.setTimeout(f,0);
                        
                    if(!t) {
                        return;
                    }
                    
                    //if acptSugItemOnly is set to true, then we don't accept the user self input out of the suggestion
                    if (p.acptSugItemOnly) {
                        //clear the user input text
                        this.set('text', t);
                        this.set('text', '');
                        this._tWas_ = null;
                        return;
                    }
                    
                    this.setItem(t, null, true);
                },
                
                focus: function focus(){

                    var ti = this.inputNode,
                        wasActive = this.isActive;
                    var f = function(){
                        try{
                            ti.focus();
                            if(ti.createTextRange && !wasActive){//workaround for caret in IE
                                var tr = ti.createTextRange(),
                                    len = ti.value.length;
                                tr.move('character', len);
                                tr.select();
                            }
                        }catch(e){}
                    };
                    window.setTimeout(f,0);
                    this.isActive = true;
                },
                
                /**
                 * Need to catch Tab key in keydown, instead of keyup. Otherwise, the default action for tab is to switch focus to the next
                 * input/button. Handle other special key here as well. 
                 */
                prekeydown: function prekeydown(evt){
                    var t = this.inputNode.value,
                        k = evt.e.keyCode || evt.e.charCode,
                        p = this.parent;
                        
                    if(!t) {
                        return;
                    }
                    
                    if(k == KEYS.TAB || k == KEYS.ENTER){
                        D.preventDefault(evt.hWin, evt.e);                         
                        var it = p.getSelected();
                        if(it){
                            p.handleSuggestionItemSelect(it);                         
                        } else {     
                            this.hideSuggestion();                             
                            //if acptSugItemOnly is set to true, then we don't accept the user self input out of the suggestion    
                            if (!p.acptSugItemOnly) {                                   
                            this.setItem(t, null, false);
                            } else {                                                            
                                // trigger ontextchange function to clear my text
                                this.set('text', t); 
                                this.set('text', ''); 
                            }
                        }
                        return;
                    } else if(k == KEYS.DOWN_ARROW){ 
                        if(!p.noCache) { // if no cache in client, we need to avoid to use t to get candidates again here
                            this.showSuggestion(t);
                        }
                        p.nextHighlight();
                    } else if(k == KEYS.UP_ARROW){ 
                        p.preHighlight();
                    }
                },
                
                /**
                 * Need to show suggestion, Backspace and ESC in keyup, instead of keydown, so that the text value is updated. 
                 */
                prekeyup: function prekeyup(evt){
                    var t = this.inputNode.value,
                        k = evt.e.keyCode || evt.e.charCode,                 
                        isAdding = this.isAdding,
                        me = this,
                        p = this.parent;


                    
                    if(!t){//if empty
                        if(isAdding){
                            if(k == KEYS.BACKSPACE && !this._tWas_){                            
                                this.raiseEvent({name:'ItemDeletePrev'});
                                D.preventDefault(evt.hWin, evt.e); //important, prevent default action of backspace
                            }
                            this._tWas_ = null;  
                        } else {
                            this.raiseEvent({name:'ItemDelete', d: this.data});
                        }
                        
                        this.hideSuggestion();
                        return;
                    }
                    
                    //show (or update if already shown) or hide suggestion
                    if(k == KEYS.ESCAPE){//shall close the suggestion when ESC is pressed
                        this.hideSuggestion();
                        
                        if (p.acptSugItemOnly) {
                            //clear the user input text
                            this.set('text', t);
                            this.set('text', '');
                            this._tWas_ = null;
                            return;
                        }
                    }else{
                        if(this._tWas_ !== t){
                            if(p.useKeyDelay) {
                                if(!this._timerID){
                                    this._timerID = window.setTimeout(function() {
                                        if (me.inputNode.value) {
                                            me.showSuggestion(me.inputNode.value);
                                        }
                                        me._timerID = null;
                                    }, KEY_DELAY); 
                                }
                            } else {
                                this.showSuggestion(t);
                            }
                        }
                    }
                    
                    this._tWas_ = t;
                },
                
                setItem: function(t, data, deactivate){  
                    var isAdding = this.isAdding,                  
                        p = this.parent;
                    
                    this.set('text',t); //update the display node 
                    this._tWas_ = null;  
                    
                    if(isAdding){      
                        this.set('text', ''); //clear my text and update  
                        if(!data){
                            data = {};
                            data[this.itemField] = t;
                        } else {
                            data.state = STATES.VALID;
                        }
                        this.raiseEvent({name:'ItemAdd', d: data, deactivate: deactivate || false});                             
                    } else {
                        this.set('text',t); //update the display node 
                        if(data){
                            this.updateData(data);
                        } else {
                            this.set('state', p.verifyObject(t, this));    
                            this.set('cssClass', p.item2textCss(this.data));
                        }

                        this.isActive = false; //set my active state to be false, so that blur would not be called again.
                        this.raiseEvent({name:'ItemEditEnd', d: data, deactivate: deactivate || false});     
                    }
                },
                
                getSearchPattern: function getSearchPattern(){
                    return this.inputNode.value;
                },
                
                showSuggestion: function showSuggestion(text){
                    var pos = mstrmojo.dom.position(this.domNode, true),
                        l = Math.round(pos.x) + 'px',
                        t = Math.round(pos.y + pos.h) + 'px';
                    this.raiseEvent({name:'SuggestionOn', l:l, t:t, pattern: text, target: this});
                },
                
                hideSuggestion: function hideSuggestion(){
                    this.raiseEvent({name:'SuggestionOff'});
                },
                
                del: function del(e){
                    e = e || self.event;
                    D.stopPropogation(self,e);
                    this.raiseEvent({name:'ItemDelete', d: this.data, deactivate: true});
                },
                
                edit: function edit(){
                    this.showSuggestion(this.text);
                    this.set('state', STATES.EDITING); //editing
                    this.raiseEvent({name:'ItemEditBegin', d: this.data});
                }
            });
     
})();