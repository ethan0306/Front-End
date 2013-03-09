(function(){

    mstrmojo.requiresCls(
            "mstrmojo.Container",
            "mstrmojo.ME.TokenInputBox"
            );
    
    var _VSTATUS = {VALID: 0, UNKNOWN: 1, VALIDATING: 2, ERROR: 3, AMBIGUITY: 4},
        _VSTATUSCSS = {0: 'valid', 1: 'unknown', 2: 'validating', 3: 'error', 'ambiguity': 4},
        _VSTATUSDESC = {
            0: 'Valid Metric Formula.',
            1: 'Require Validation?',
            2: 'Validation in Progress...',
            3: 'Validation Failed with Syntax Error!',
            4: 'Validation Failed with Object Ambiguity'
        };
    
    function _mapErrorCode(code){
        if(!code){
            return _VSTATUS.VALID;
        }
        return {
                    '-2147214845': _VSTATUS.ERROR,
                    '-2147214846': _VSTATUS.AMBIGUITY
               }[code] || _VSTATUS.ERROR;
    }
    
    mstrmojo.ME.MetricEditBox = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        // mixins
        [mstrmojo._HasPopup],
        // instance members
        {
            scriptClass: "mstrmojo.MetricEditBox",
            
            vStatus: _VSTATUS.VALID, 
            
            iStatus: '',
            
            markupString: '<div id="{@id}" class="mstrmojo-MEBox {@cssClass}" style="{@cssText}">' + 
                            '<div class="mstrmojo-MEBox-edit"></div>' + 
                            '<div class="mstrmojo-MEBox-status">' +
                                '<div class="mstrmojo-MEBox-iStatus"></div>' +                              
                                '<div class="mstrmojo-MEBox-vStatus"></div>' +                          
                            '</div>' + 
                          '</div>',
                     
            markupSlots: {  
                editNode: function(){return this.domNode.firstChild;},
                vStatusNode: function(){return this.domNode.lastChild.lastChild;},
                iStatusNode: function(){return this.domNode.lastChild.firstChild;}
            },
            
            markupMethods: {
                onvStatusChange: function(){
                    var s = this.vStatus,
                        vn = this.vStatusNode;
                    vn.className = "mstrmojo-MEBox-vStatus " + _VSTATUSCSS[s];
                    vn.innerHTML = _VSTATUSDESC[s];
                },
                oniStatusChange: function(){
                    this.iStatusNode.innerHTML = this.iStatus;
                }
            },
            
            children: [
                           {
                               scriptClass: 'mstrmojo.ME.TokenInputBox',
                               alias: 'inputBox',
                               slot: 'editNode'
                           }
                       ],
            
            abiguityDialog: {
                scriptClass: 'mstrmojo.Editor',
                cssClass: 'mstrmojo-ME-ambiguityDialog',
                onOpen: function(){
                    this.set('title', 'Object Ambiguity: \'##\''.replace('##',this.ambiguousName));
                    this.list.clearSelect();
                    this.list.set('items', this.items);
                    this.label.set('text', 'More than one object with the name \'##\' found. Select the object you would like to use:'.replace('##',this.ambiguousName));
                },
                children:[
                   {
                       scriptClass: "mstrmojo.Label",
                       alias: 'label',
                       text: 'More than one object with the name \'##\' found. Select the object you would like to use:'
                   },{
                    scriptClass: "mstrmojo.List",
                    alias: 'list',
                    cssClass: 'mstrmojo-ME-ambiguityList',
                    itemField: 'n',
                    item2textCss: function item2textCss(data){
                        return {
                            4: 'm',
                            7: 'am',//aggregate metric
                            11: 'fx',
                            12: 'a',
                            13: 'fc',
                            43: 'tr',
                            47: 'cs'
                        }[data.t] || '';
                    },
                    itemMarkupFunction: function(data, idx, w){
                        return '<div class="mstrmojo-suggest-text ' + (w && w.item2textCss(data)) + '">' + data[w.itemField] + '</div>';
                    },
                    onmousedown: function(evt){
                        var p = this.parent,
                            it = this.items[this.selectedIndex];
                        mstrmojo.dom.stopPropogation(evt.hWin, evt.e);  
                        if(it){
                            p.onItemSelect(it);
                        }
                        p.close();   
                    }   
                }] 
            },
            
            postBuildRendering: function postBuildRendering(){
                this._super();
                
                var f = function(){
                    this.set('vStatus', _VSTATUS.UNKNOWN);
                    this.set('iStatus', '');
                };
                
                this.inputBox.attachEventListener('tokensModify', this.id, f);
            },
            
            /**
             * This method shall take the following returned token structure:
             * 1) 'vs', A validation result code with the following categories: successful, syntax error, ambiguity;
             * 2) 'vm', A validation result message;
             * 3) 'tks', A token stream listing all tokens in the metric expression;
             * 4) 'srfd', Search result folder if ambiguity. 
             */
            handleValidation: function handleValidation(r){
                if(!r){
                    this.set('vStatus', _VSTATUS.ERROR);
                    return;
                }
                //update the status and token input box
                r.vs = _mapErrorCode(r.rjec);
                this.set('vStatus', r.vs);
                this.set('iStatus', r.rjed || '');
                this.inputBox.set('items', r.items);
                this.inputBox.focus();
                
                //if object ambiguity, popping up editor for selecting one to replace
                if(r.vs === _VSTATUS.AMBIGUITY){
                    var me = this,     
                        its = r.items,
                        ei = mstrmojo.array.find(its, 'sta', -1),
                        ambiguousName = its[ei].v,                   
                        f = function(oi){
                            me.inputBox.replaceErrorToken(oi);
                            me.set('iStatus', '');
                            me.set('vStatus', _VSTATUS.UNKNOWN);
                        };
                    this.openPopup('abiguityDialog',{
                        zIndex: 100, 
                        items: r.srfd.items,
                        ambiguousName: ambiguousName,
                        onItemSelect: f
                    });
                }
            }
        }
    );
  
    mstrmojo.ME.MetricEditBox.VALIDATION_STATUS = _VSTATUS;
    
})();