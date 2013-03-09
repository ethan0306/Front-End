(function () {

    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.css",
            "mstrmojo.dom",  
            "mstrmojo.expr",
            "mstrmojo.range",
            "mstrmojo.Widget",
            "mstrmojo.WidgetList",            
            "mstrmojo.WidgetListMapper",     
            "mstrmojo._HasSuggestion",          
            "mstrmojo.ME.MetricToken",
            "mstrmojo.ME.MetricDataService"
            );

    mstrmojo.ME.SpanListMapper = mstrmojo.provide(
            "mstrmojo.SpanListMapper",
            mstrmojo.mixin(
                /**
                 * @lends mstrmojo.WidgetListMapper
                 */
                {
                    
                    itemWrapperPrefix: function(w){
                        return '<span class="' + this.getWrapperCss(w) + '">';
                    }, 
                    
                    itemWrapperPrefill: '&nbsp;',
                    
                    itemWrapperSuffix:  '</span>',

                    createWrapperNode: function createWrapperNode(p){
                        var d = p.ownerDocument,
                            n = d.createElement('span');
                        return n;
                    }
                
                },
                mstrmojo.hash.copy(mstrmojo.WidgetListMapper)
            )
        );
    
    
    var _D = mstrmojo.dom,
        _C = mstrmojo.css,
        KEYS = mstrmojo.Enum_Keys,
        _R = mstrmojo.range,
        EDGE = _R.EDGE,
        isDelimiter = mstrmojo.ME.MetricToken.isDelimiter,
        E = mstrmojo.expr;
    
    function getCharacter(e){
        var k = (_D.isIE && !_D.isIE9) ? e.keyCode : e.charCode;
        return (k>0) ? String.fromCharCode(k) : null;
    }
    
    /**
     * TokenInputBox shall be a widget that allows you to edit HTML in the following manner: 1) Compared to 
     * TextInput element in HTML, You can set its content as a HTML string, instead of as a text string; 
     * 2) Multiple characters of its content can be grouped, highlighted and edited as a unit or as 
     * an individual character like in TextInput if not grouped. 
     * 
     * For metric editor, it provides multiple necessary support which TextInput does not:
     * 1) Syntax highlighting;
     * 2) Validation error highlighting;
     * 3) Caret positioning while focus shifted;
     * 4) Character grouping (token);
     * 
     * TO-DO: 
     * 1) Use [ to determine whether to create a separate token for delimiter or use it as part of search;
     * 2) Use < and | as indicator to search for filter and transformation;
     * 3) Non-breakable blank space? 
     */
    mstrmojo.ME.TokenInputBox = mstrmojo.declare(
            // superclass
            mstrmojo.WidgetList,
            // mixins
            [mstrmojo._HasSuggestion],
            // instance members
            {
                scriptClass: "mstrmojo.ME.TokenInputBox",
                
                makeObservable: true,
                
                markupString: '<div id={@id} class="mstrmojo-TokenInputBox {@cssClass}" style="{@cssText}">' + 
                                    '<div class="mstrmojo-TokenInputBox-edit" contenteditable="true" tabindex="1" spellcheck="false"' +
                                    'ondragstart = "return false;" ' +
                                    'oncontextmenu = "return false;" ' +
                                    'onkeydown = "return mstrmojo.all.{@id}.handlekeydown(event);" ' + 
                                    'onkeypress = "return mstrmojo.all.{@id}.handlekeypress(event);" ' +   
                                    'onkeyup = "return mstrmojo.all.{@id}.handlekeyup(event);" ' +    
                                    'onmouseup = "return mstrmojo.all.{@id}.handlemouseup(event);" ' +                                      
                                    '>{@itemsHtml}</div>' +
                                    '<textarea class = "mstrmojo-TokenInputBox-clipboard" ' + 
                                        'onkeyup = "return mstrmojo.all.{@id}.handlepaste(event);"></textarea>' +
                              '</div>',
                
                markupSlots: {
                    editNode: function(){return this.domNode.firstChild;},
                    itemsContainerNode: function(){return this.domNode.firstChild;},
                    clipboardNode: function(){return this.domNode.lastChild;}
                },
                
                
                items: null,
                
                itemFunction: function itemFunction(item, idx, w){
                    return new mstrmojo.ME.MetricToken({
                        data: item
                    });
                },
                
                listMapper: mstrmojo.ME.SpanListMapper, 
                
                isDelimiter: isDelimiter,
                
                postBuildRendering: function postBuildRendering() {
                    if(this._super){
                        this._super();
                    }
                    
                    if(_D.isFF){//workaround in firefox to remove spell check
                        document.body.spellCheck = false;
                    }
                },
                
                /**
                 * Respond to keyboard input and add new character as part of content. If the current selection is 
                 * not empty, the newly input character shall replace the current selected unit. 
                 */
                handlekeydown: function handlekeydown(e){
                    e = e || window.event;

                    var k = e.keyCode || e.charCode,
                        noDefault = false,
                        rInfo = _R.getRangeInfo();
                    
                    switch(k){
                    case KEYS.DELETE:
                        try{
                            this.widgetHandleDelete(rInfo);
                            this.startTokenSuggestion();
                            this.raiseChangeEvent({type:'delete'});
                        }catch(ex1){}
                            
                        
                        noDefault = true;
                        break;
                    case KEYS.BACKSPACE:                     
                        try{
                            this.widgetHandleBackspace(rInfo);
                            this.raiseChangeEvent({type:'backspace'});
                            this.startTokenSuggestion();
                        }catch(ex2){}
                        
                        noDefault = true;
                        break;
                    case KEYS.ENTER:
                    case KEYS.TAB: 
                        this._startDebug = true;
                        if(this.suggestionShown){
                            this.handleSuggestionItemSelect(this.getSelected());
                        } else {
                            this.startTokenSuggestion();
                        }
                        noDefault = true; //do not need default behavior for ENTER.
                        break;
                        
                    case KEYS.ESCAPE:
                        this.endTokenSuggestion();
                        noDefault = true; 
                        break;
                        
                    case 86: //v
                        if(e.ctrlKey){//paste
                            //save range info
                            this._saveRangeInfo = _R.getRangeInfo();
                            
                            //move focus to clipboard text area
                            this.clipboardNode.focus();
                            noDefault = false; //Need browser to work to paste to the textbox.
                        }
                        break;
                    default:
                        //do nothing
                    }
                    if(noDefault){
                        //prevent default behavior
                        _D.stopPropogation(window, e);
                        _D.preventDefault(window,e);
                        return false;
                    } else {//need to let the default behavior do the job of moving caret and others
                        return true;
                    }
                }, 
                
                /**
                 * Respond to keyboard input and add new character as part of content. If the current selection is 
                 * not empty, the newly input character shall replace the current selected unit. 
                 */
                handlekeypress: function handlekeypress(e){
                    e = e || window.event;
                   
                    var c = getCharacter(e),
                        k = e.keyCode || e.charCode,
                        noDefault = false,
                        ew;
                    
                    if(c && !(c === 'c' && e.ctrlKey)){
                        try{
                            this.widgetHandleInput(_R.getRangeInfo(), c);
                            this.raiseChangeEvent({type:'input', characeter: c});
                            if(!this.isDelimiter(c)){
                                this.startTokenSuggestion();
                            } else {
                                this.endTokenSuggestion();
                            }
                        }catch(ex){}
                        noDefault = true;
                    }
                    
                    if(noDefault){
                        //prevent default behavior
                        _D.stopPropogation(window, e);
                        _D.preventDefault(window,e);
                        return false;
                    } else {//need to let the default behavior do the job of moving caret and others
                        return true;
                    }
                }, 
                
                handlekeyup: function handlekeyup(e){
                    var k = e.keyCode || e.charCode,
                    ew;
                    
                    //got to handle LEFT/RIGHT arrow in keyup
                    if(k === KEYS.LEFT_ARROW || k === KEYS.RIGHT_ARROW){
                        ew = this.findObjectToken();
                        if(ew && ew === this._saveActiveToken){
                            this.startTokenSuggestion(ew);
                        } else {
                            this.endTokenSuggestion();
                        }
                    } else if(k === KEYS.UP_ARROW){
                        this.preHighlight();
                    } else if(k === KEYS.DOWN_ARROW){
                        this.nextHighlight();
                    }
                        
                       
                    
                    //save range info
                    this._saveRangeInfo = _R.getRangeInfo();
                },
                
                handlemouseup: function handlemouseup(e){
                    var ew = this.findObjectToken();
                    if(ew && ew === this._saveActiveToken){
                        this.startTokenSuggestion(ew);
                    } else {
                        this.endTokenSuggestion();
                    }
                    
                    //save range info
                    this._saveRangeInfo = _R.getRangeInfo();
                },
                
                handlepaste: function handlepaste(e){
                    //retrieve value
                    var v = this.clipboardNode.value;
                    this.clipboardNode.value = "";
                    
                    //parse into token array
                    var ts = [],
                        len = v && v.length,
                        i, t='', c;
                    
                    if(len>0){
                        for(i=0;i<len;i++){
                            c = v.charAt(i);
                            if(this.isDelimiter(c)){
                                if(!mstrmojo.string.isEmpty(t)){
                                    ts.push({v: t, isNew: true});
                                    t = '';
                                }
                                ts.push({v: c, isDelimiter: true, isNew: true});
                            } else {
                                t = t + c;
                            }
                        }
                        if(!mstrmojo.string.isEmpty(t)){
                            ts.push({v: t, isNew: true});
                            t = '';
                        }
                        //insert tokens
                        this.insertTokens(ts);
                    }
                },
                
                raiseChangeEvent: function(params){
                    params.name = 'tokensModify';
                    this.raiseEvent(params);
                },
                
                getTokensAsString: function getTokensAsString(){
                    var sa = [],
                        its = this.items,
                        i;
                    for(i=0,len = its.length;i<len;i++){
                        sa[i] = its[i].v;
                    }
                    return sa.join("| ");
                },
                
                /**
                 * Find the one token with error and replace it with a new token
                 */
                replaceErrorToken: function replaceErrorToken(oi){
                    var its = this.items,
                        ei = mstrmojo.array.find(its, 'sta', -1),
                        nt = {v:oi.n, oi: oi,isNew: true};
                    if(ei > -1){
                        this.remove(ei);
                        this.add([nt],ei);
                    }
                },
                
                widgetHandleDelete: function widgetHandleDelete(rInfo){
                    if(rInfo.collapsed){//delete next character or token
                        var edge, ew, idx,
                            so = rInfo.startOffset,
                            itws = this.ctxtBuilder.itemWidgets;
                        
                        //if(ew === this){
                        if(!_D.contains(this.editNode, rInfo.startContainer, false, document.body)){                        
                            _R.collapseOnNode(this.editNode, false);                            
                            return;
                        }
                        
                        edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset);
                        ew = _D.findWidget(rInfo.startContainer);
                        idx = this.itemIndex(ew.data);
                        
                        //edge end, find the next token widget
                        if(edge === EDGE.EDGE_END){
                            idx ++;
                            ew = itws[idx];
                            so = 0;
                        }
                        
                        if(!ew){//end of last token
                            _R.collapseOnNode(this.editNode, false);
                            return;
                        }
                        
                        if(ew.length()  ===  1){
                            //single character, we shall remove the whole token
                            this.remove(idx);
                            
                            //position caret
                            ew = itws[idx];
                            if(ew){//end of edit node
                                _R.collapseOnNode(ew.domNode, true); 
                            } else {//no more token widgets available 
                                _R.collapseOnNode(this.editNode, false);
                            }      
                            
                            //merge two object tokens if necessary
                            this.checkMergeTwoTokens(idx-1, idx);
                            
                        } else {
                            ew.spliceContent(so, 1);
                            _R.collapseOnTextNode(ew.domNode, so);
                        }
                            
                    } else {
                        //delete every character or token in the selection and then set the new caret position
                        this.widgetDeleteTokens(rInfo);
                    }
                },
                
                
                widgetHandleBackspace: function widgetHandleBackspace(rInfo){
                    if(rInfo.collapsed){//delete previous character or token
                        var edge, ew, idx,
                            so = rInfo.startOffset,
                            itws = this.ctxtBuilder.itemWidgets;
                        //if(ew === this){
                        if(!_D.contains(this.editNode, rInfo.startContainer, false, document.body)){
                            if(rInfo.startOffset > 0 && _D.isFF){
                                //only for Firefox, somehow, range would be the end of edit node, even if it has some tokens
                                ew = itws[this.items.length-1];
                                _R.collapseOnNode(ew.domNode, false);
                                rInfo = _R.getRangeInfo();
                                edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset);
                            } else {
                                _R.collapseOnNode(this.editNode, true); 
                                return;
                            }
                        }
                        
                        edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset);
                        ew = _D.findWidget(rInfo.startContainer);
                        idx = this.itemIndex(ew.data);
                        
                        //find prev token if edge begin
                        if(edge === EDGE.EDGE_BEGIN){
                            idx --;
                            ew = itws[idx];
                            so = ew.length();
                        }
                        
                        if(!ew){//Beginning of first token, nothing to delete
                            _R.collapseOnNode(this.editNode, true);  
                            return;
                        }
                        
                        if(ew.length()  ===  1){
                            //single character, we shall remove the whole token
                            this.remove(idx);
                            
                            //position caret
                            ew = itws[idx-1];
                            if(ew){//end of prev token
                                _R.collapseOnNode(ew.domNode, false); 
                                
                                //merge two object tokens if necessary
                                this.checkMergeTwoTokens(idx-1, idx);
                                
                                ew = itws[idx-1];
                                
                            } else {//no more token widgets available 
                                _R.collapseOnNode(this.editNode, true);
                            }      
                        } else {
                            ew.spliceContent(so-1, 1);
                            _R.collapseOnTextNode(ew.domNode, so-1);
                        }
                        
                    } else {
                        //delete every token in the selection and then set the new caret position
                        this.widgetDeleteTokens(rInfo);
                    }
                },
                
                widgetHandleInput: function widgetHandleInput(rInfo,c){
                    if(!rInfo.collapsed){
                        this.widgetDeleteTokens(rInfo);
                        rInfo = _R.getRangeInfo();
                    }
                    
                    //find the insertion point;or create one new token if not found
                    var edge, ew, idx, t, aw, so,
                        itws = this.ctxtBuilder.itemWidgets;
                    
                    if(!_D.contains(this.editNode, rInfo.startContainer, false, document.body)){
                        this.add([{v:c,isDelimiter:this.isDelimiter(c),isNew: true}], 0);
                        ew = itws[0];
                        _R.collapseOnTextNode(ew.domNode, 1);                
                        return;
                    }
                    
                    edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset);
                    ew = _D.findWidget(rInfo.startContainer);
                    idx = this.itemIndex(ew.data);
                    
                    if(this.isDelimiter(c)){
                        t = {v:c, isDelimiter: true,isNew: true};
                        if(edge === EDGE.EDGE_MIDDLE){
                            //split and add new delimiter token
                            var ts = ew.split2Tokens(rInfo.startOffset);
                            this.remove(idx);
                            this.add([ts[0], t, ts[1]], idx);
                            idx = idx + 1;
                        } else {
                            idx = (edge === EDGE.EDGE_BEGIN) ? idx : idx + 1;
                            this.add([t], idx); 
                        }
                        //position caret to the end of delimiter node
                        ew = itws[idx];
                        _R.collapseOnNode(ew.domNode, false);
                    } else {
                        so = rInfo.startOffset;
                        if(ew.isDelimiter()){
                            aw = itws[(edge === EDGE.EDGE_BEGIN) ? idx - 1 : idx + 1];
                            if(aw && !aw.isDelimiter()){
                                ew = aw;
                                so = (edge === EDGE.EDGE_BEGIN) ? ew.length() : 0;
                            }
                        }
                        
                        if(!ew.isDelimiter()){
                            ew.spliceContent(so, 0, c);
                            _R.collapseOnTextNode(ew.domNode, so + 1);
                        } else {
                            this.add([{v:c,isNew: true}], (edge === EDGE.EDGE_BEGIN) ? idx : idx + 1);
                            ew = itws[(edge === EDGE.EDGE_BEGIN) ? idx : idx + 1];
                            _R.collapseOnNode(ew.domNode, false);
                        }
                    }
                },
                
                findObjectToken: function findObjectToken(){
                    var rInfo = _R.getRangeInfo(),
                        ew = _D.findWidget(rInfo.startContainer);
                    
                    if(!_D.contains(this.editNode, rInfo.startContainer, false, document.body)){
                        return null;
                    }
                        
                    if(!ew || ew === this || !ew.isDelimiter){
                        return null;
                    }
                    if(ew && !ew.isDelimiter()){
                        return ew;
                    }
                    var edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset),
                        itws = this.ctxtBuilder.itemWidgets,
                        idx = this.itemIndex(ew.data);
                    
                    ew = itws[(edge === EDGE.EDGE_BEGIN) ? idx - 1 : idx + 1];
                    if(ew && !ew.isDelimiter()){
                        return ew;
                    } 
                    return null;
                },
                
                
                checkMergeTwoTokens: function checkMergeTwoTokens(idx1, idx2){
                    var itws = this.ctxtBuilder.itemWidgets,
                        w1 = itws[idx1],
                        w2 = itws[idx2];
                    
                    if((w1 && !w1.isDelimiter()) && (w2 && !w2.isDelimiter())){
                        //merge into one
                        this.remove([idx1,idx2]);
                        this.add([w1.mergeTo(w2)], idx1);
                        
                        //position caret after merge
                        _R.collapseOnTextNode(itws[idx1].domNode, w1.length());
                    }
                },
                
                /**
                 * Insert tokens into where the current range is. If not range is found, append to the end.
                 * TO-DO: handle the case that range is not collapsed. 
                 */
                insertTokens: function insertTokens(tokens){
                    var rInfo = this._saveRangeInfo;
                    if(!rInfo || !_D.contains(this.editNode, rInfo.startContainer, false, document.body)){
                        this.add(tokens);
                        this.raiseChangeEvent({type:'insert'});
                        return;
                    }
                    
                    var edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset),
                        ew = _D.findWidget(rInfo.startContainer),
                        idx = this.itemIndex(ew.data);
                    
                    if(edge  ===  EDGE.EDGE_MIDDLE){
                        var ts = ew.split2Tokens(rInfo.startOffset);
                        this.remove(idx);
                        tokens.unshift(ts[0]);
                        tokens.push(ts[1]);
                        this.add(tokens, idx);
                    } else {
                        idx = (edge === EDGE.EDGE_BEGIN ? idx : idx + 1);
                        this.add(tokens, idx);
                    }     
                    
                    //position caret
                    idx = idx + tokens.length - 1;
                    ew = this.ctxtBuilder.itemWidgets[idx];
                    this._delaySetCaretPos(ew.domNode, false);
                        
                    this.raiseChangeEvent({type:'insert'});
                },
                
                /**
                 * Remove all tokens from input box. 
                 */
                clearTokens: function clearTokens(empty){
                    this.set('items', empty || []);
                    this._saveRangeInfo = null;
                    this._delaySetCaretPos(this.editNode, false);
                },
                
                focus: function focus(){
                    var iws = this.ctxtBuilder.itemWidgets,
                        len = iws.length;
                    this._delaySetCaretPos(len > 0 ? iws[len-1].domNode : this.editNode, false);
                },
                
                startTokenSuggestion: function startTokenSuggestion(w){
 
                    //end current token suggestion
                    this.endTokenSuggestion();
                    
                    if(!w){
                        w = this.findObjectToken();
                    }
                    
                    if(w && !w.isDelimiter()){
                        w.set('active', true);
                        this._saveActiveToken = w;
                        
                        //open suggestion
                        this.showSuggestion(this.getSearchPattern());
                    }
                },
                
                browseItemVisible: true,
                
                folderLinksContextId: 25,
                
                browsableTypes: [E.TP.FOLDER, E.TP.FACT, E.TP.ATTR,E.TP.FUNCTION, E.TP.FILTER, E.STP.PROMPT_OBJECTS,E.TP.ATTR, E.TP.DIM, E.TP.METRIC, E.TP.ROLE].join(','),

                getSearchPattern: function getSearchPattern(){
                    var at = this._saveActiveToken,
                        pattern = at && at.data.v,
                        len = pattern && pattern.length;
                    if(len > 2){
                        if(pattern.charAt(0) === '[') {
                            pattern = pattern.substring(1);
                        }
                        if(pattern.charAt(pattern.length-1) === ']') {
                            pattern = pattern.substring(0, pattern.length-1);
                        }
                    } 
                   
                    return pattern;

                },
                
                getSuggestionPos: function getSuggestionPos(){
                    var at = this._saveActiveToken,
                        sp = null, p;
                    if(at){
                        p = mstrmojo.dom.position(at.domNode,true);
                        sp = {left:Math.round(p.x) + 'px', top: Math.round(p.y + p.h) + 'px',zIndex: 100};
                    }
                    return sp;
                },
                
                item2textCss: function item2textCss(data){
                    return (this._super && this._super(data)) || 
                    {
                        4: 'm',
                        11: 'fx',
                        12: 'a',
                        13: 'fc',
                        43: 'tr',
                        '-99': 'br'    //browse....
                    }[data.t] || '';
                },

                onBrowserOpen: function onBrowserOpen(){
                    this.editNode.blur();//IE needs this blur
                },
                
                onSuggestionItemSelect: function onSuggestionItemSelect(it){
                    var ow = this._saveActiveToken;
                    
                    this.endTokenSuggestion();
                    
                    if(ow){
                        //update the token with new selection
                        ow.setItemInfo(it);
                        //position caret to the end
                        this._delaySetCaretPos(ow.domNode, false);
                    }
                },
                
                _delaySetCaretPos: function _delaySetCaretPos(dn, toStart){
                    //Need to use timeout to set focus;otherwise browsers will not work.
                    var en = this.editNode,
                        f = function(){
                            en.focus();
                            en.focus();//Second call needed by IE
                             _R.collapseOnNode(dn, toStart);
                        };
                    window.setTimeout(f,0);
                },
                
                
                getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                    mstrmojo.ME.MetricDataService.getMetricComponents(params, callbacks);
                },
                
                endTokenSuggestion: function endTokenSuggestion(){
                    var ow = this._saveActiveToken;
                    if(ow){
                        //close suggestion if it is open
                        this.hideSuggestion();
                        
                        ow.set('active', false);
                        this._saveActiveToken = null;
                    }
                }, 
                
                
                /**
                 * Delete all tokens selected by the current range. 
                 */
                widgetDeleteTokens: function widgetDeleteTokens(rInfo){
                    var so = rInfo.startOffset,
                        eo = rInfo.endOffset,
                        sw = _D.findWidget(rInfo.startContainer),
                        ew = _D.findWidget(rInfo.endContainer),
                        si = this.itemIndex(sw.data),
                        ei = this.itemIndex(ew.data),
                        arr = [],
                        sEdge = _R.getEdgeInfo(rInfo.startContainer, so),
                        eEdge = _R.getEdgeInfo(rInfo.endContainer, eo),
                        dStart = (sEdge === EDGE.EDGE_BEGIN ? si : si + 1),
                        dEnd = (eEdge === EDGE.EDGE_END ? ei : ei -1),
                        i;
                    
                    if(sw  ===  ew){
                        if((sEdge === EDGE.EDGE_BEGIN) && (eEdge === EDGE.EDGE_END)){
                            this.remove(si);
                            ew = this.ctxtBuilder.itemWidgets[si-1];
                            if(ew){
                                _R.collapseOnNode(ew.domNode, false);
                            } else {
                                _R.collapseOnNode(this.editNode, true); 
                            }
                        } else {
                            sw.spliceContent(so, eo-so);
                            _R.collapseOnTextNode(ew.domNode, so);
                        }
                    } else {
                        
                        //delete whole tokens
                        for(i=dStart;i<=dEnd;i++){
                            arr.push(i);
                        }
                        this.remove(arr);
                        
                        //handle boundary tokens
                        if(sEdge === EDGE.EDGE_MIDDLE){
                            sw.spliceContent(so);
                        }
                        
                        if(eEdge === EDGE.EDGE_MIDDLE){
                            ew.spliceContent(0, eo);
                        }
                    
                    
                        //position caret
                        if(sEdge  ===  EDGE.EDGE_BEGIN){
                            sw = this.ctxtBuilder.itemWidgets[si-1];
                        }
                        if(sw){
                            _R.collapseOnNode(sw.domNode, false);
                            //_R.collapseOnTextNode(sw.domNode, sw.length());
                        } else {//no more token available
                            _R.collapseOnNode(this.editNode, false); 
                        }
                        
                        //merge two object tokens if necessary
                        si = (sEdge === EDGE.EDGE_BEGIN) ? si -1 : si;
                        this.checkMergeTwoTokens(si, si+1);
                    
                    }
                    
                    //need to focus to show the caret
                    this.editNode.focus();
                }
            });
    


})();            