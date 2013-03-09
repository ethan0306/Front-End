(function(){

    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.hash",
            "mstrmojo.array",
            "mstrmojo.string",
            "mstrmojo._HasPopup",
            "mstrmojo.List",
            "mstrmojo.Editor",
            "mstrmojo.ObjectBrowser"                  
    );

    /**
     * This mixin class provides common functions related to search suggestion. 
     */
    
    mstrmojo._HasSuggestion = mstrmojo.hash.copy(
            mstrmojo._HasPopup, 
            {
                blockBegin: 1, 
                blockCount: -1,

                /**
                 * The maximum number of suggestion items to show at one time. 
                 */
                suggestCount: 15,
                
                autoSelect: true,
                
                /**
                 * The display field of suggestion items. 
                 */
                itemField: 'n',
                
                /**
                 * A set of candidates for suggestion. 
                 */
                candidates: null,
                
                /**
                 * Whether the suggestion is shown or not. 
                 */
                suggestionShown: false,

                /**
                 * The list of suggestion items to display. 
                 */
                suggestionItems: null,
                
                /**
                 * Caching last hit for performance purpose. 
                 */
                _last_hit: null,
                
                /**
                 * The search pattern used by the requesting call for suggestion candidates. 
                 */
                _request_pattern: null,
                
                /**
                 * Whether to shown a browse... item at the end of the suggestion. If this is set to true, usually we need to also set 
                 * folderLinksContextId and browsableTypes to be proper values.
                 */
                browseItemVisible: false,
                
                /**
                 * Folder context for the object browser.
                 */
                folderLinksContextId: 25,
                
                /**
                 * List of object types exposed by object browser, separated by comma.
                 */
                browsableTypes: '1,8',
                
                
                /**
                 * The threshold to trigger a call to server side to retrieve more candidates. 
                 */
                REQUEST_THRESHOLD: 20, 
                
                noCache: false,
                
                /**
                 * Override this method to make task calls to server to return the list of suggestion candidates
                 * based on parameters(pattern: t, blockBegin: 1, blockCount: -1, isSuggest: true). 
                 */
                getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                    
                },
                
                /**
                 * Call back to implement when a suggestion item is selected by mouse click or keyboard(ENTER or TAB). 
                 * The default behavior is to close the suggestion. Customization implementation shall try to do 
                 * something before closing the suggestion. 
                 */
                onSuggestionItemSelect: function onSuggestionItemSelect(it){
                    this.hideSuggestion();
                },
                
                /**
                 * Override to return the class name for a object item based on its data. 
                 * 
                 * This method shall to be overrode to support all types of objects for specific scenario.
                 */
                item2textCss: function item2textCss(data){
                    if(data.cssClass){
                        return data.cssClass;
                    }
                    return '';
                },
                
                
                /**
                 * Override to return the name pattern for search. 
                 */
                getSearchPattern: function getSearchPattern(){
                    return '';
                },
                
                /**
                 * Override to return the position where the suggestion popup will show up.  The position shall be an object, with values for left and
                 * top coordinate, for example, {'left': '100px', 'top': '100px'}. 
                 */
                getSuggestionPos: function getSuggestionPos(){
                    return {'left': '100px', 'top': '100px'};
                },                
                
                /**
                 * Return the target of the suggestion. By default, it is the widget itself. However, for some widget, ObjectInputBox for example, 
                 * the target could be dynamically changed. 
                 */
                getSuggestionTarget: function getSuggestionTarget(){
                    return this;
                },
                
                /**
                 * This is the method to call when the widget needs to pop up a suggestion based on certain name pattern. 
                 */
                showSuggestion: function showSuggestion(pattern){
                    this.updateSuggestion(this.getSuggestion(pattern));
                },
                
                /**
                 * This is the method to call when the widget needs to close the suggestion. 
                 */
                hideSuggestion: function hideSuggestion(){
                    this.suggestionShown = false;
                    this.closePopup();
                },
                
                /**
                 * This is the method to call to get the selected suggestion item. 
                 */
                getSelected: function getSelected(){
                    if(this.suggestionShown){
                        return this.suggestionPopup.getSelected();
                    } else {
                        return null;
                    }
                },
                
                /** 
                 * This is the method to call to move the suggestion highlight to next item. 
                 */
                nextHighlight: function nextHighlight(){
                    if(this.suggestionShown){
                        this.suggestionPopup.nextHighlight();
                    } 
                },
                
                /** 
                 * This is the method to call to move the suggestion highlight to previous item. 
                 */
                preHighlight: function preHighlight(){
                    if(this.suggestionShown){
                        this.suggestionPopup.preHighlight();
                    } 
                },
                
                
                /**
                 * Return all suggestion based on the pattern (which is what user types). The default implementation is to return the
                 * first n candidates that meet pattern (n = suggestCount). 
                 * 
                 * This method shall be overrode if this default implementation is not desirable for specific scenario. 
                 */
                getSuggestion: function(t){
                    var c = this.candidates,
                        its = c && c.items,
                        ic = c && c.isComplete,
                        lh = this._last_hit;                    
                    
                    if(!this.noCache && (c || lh)){
                        var fcs = this.filterCandidates(its, t, this.REQUEST_THRESHOLD),
                            len = fcs.length,
                            sc = this.suggestCount,
                            hit = false;
    
                        //add items from last hit
                        if(!ic && len < sc){
                            var p = lh && lh.pattern;
                            if(lh && p && (t.indexOf(p) > -1)){
                                hit = true;
                                var lhc = this.filterCandidates(lh.items, t, this.REQUEST_THRESHOLD),
                                    llen = lhc && lhc.length,
                                    A = mstrmojo.array,
                                    ifd = this.itemField,
                                    i;
                                
                                for(i=0;i<llen;i++){
                                    if(A.find(fcs, ifd, lhc[i][ifd]) === -1){
                                        fcs.push(lhc[i]);
                                    }
                                }
                                
                                len = fcs.length;
                            }
                        }
                        
                        
                        //shall make new request if 1) the number of character is 3 or more but the suggestion is not greater than REQUEST_THRESHOLD;
                        // 2) if the suggestion is smaller than suggestCount
                        if(!ic && ((t.length > 2 && len < this.REQUEST_THRESHOLD) || (len < sc))){
                            this.requestCandidates(t);
                        }
                        
                        return (len < sc) ? fcs : fcs.slice(0, sc);
                    }
                    
    
                        
                    //no candidates, make a request for them, and return null
                    this.requestCandidates(t);
                    return null;
                },
                
                requestCandidates: function requestCandidates(t){
                    var rp = this._request_pattern;
//                    if(rp && (t.indexOf(rp) > -1)){//has valid request on going, continue waiting
//                        return;
//                    }
                    
                    this._request_pattern = t;
                    
                    var me = this,
                        targetWas = this.getSuggestionTarget(),
                        success = function(res){
                            var target = me.getSuggestionTarget(); 
                            if(!res || !target || (targetWas !== target)) {//no target or target changed, do not use it
                                return;
                            }
                            
                            var newPattern = target.getSearchPattern(),
                                its = res.items;
                            
                            me._last_hit = {items: its, pattern: t};
                            me.sz = res.sz;
                            
                            if(newPattern && newPattern.indexOf(t) > -1){
                                var fcs = me.filterCandidates(its, newPattern);
                                me.updateSuggestion(fcs);
                            }
                        },
                        failure = function(res){
                            mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                        },
                        callbacks = {success: success, failure: failure},
                        params = {pattern: t, blockBegin: this.blockBegin, blockCount: this.blockCount, isSuggest: true};
                        
                   this.getCandidatesThroughTaskCall(params, callbacks);
                },     
                

                filterCandidates: function filterCandidates(its, t, max){
                    max = max || this.suggestCount;
                    t = mstrmojo.string.regEscape(t);
                    var itf = this.itemField,
                        f = function(it){
                            return (new RegExp('\\s' + t + '|^' + t,'i')).test(it[itf]);
                        },
                        fcs = mstrmojo.array.filter(its, f, {max:max});
                    return fcs;
                }, 

                
                updateSuggestion: function updateSuggestion(its){
                    var len = its && its.length;
                    if(len>0 || this.browseItemVisible){
                        if(this.browseItemVisible){
                            its = its || [];
                            its.push({n:'Browse...', t: -99, cssClass: (len>0 ? 'br' : 'bro')});
                        }
                        if(this.suggestionShown){//just update the suggestion items
                            this.set('suggestionItems', its);
                        } else {
                            this.set('suggestionItems', its);
                            this.openPopup('suggestionPopup',this.getSuggestionPos());
                            this.suggestionShown = true;
                        }
                    } else {
                        this.hideSuggestion();
                    }
                },
                               
                ob: {
                    scriptClass: "mstrmojo.Editor",
                    title: mstrmojo.desc(5298,"Select an Object"),
                    help: "Select_Objects_dialog_box_.htm",
                    onClose: function(){
                        var o = this.opener;
                        if(o && o.onBrowserClose){
                            o.onBrowserClose();
                        }
                    },
                    onOpen: function(){
                        var o = this.opener;
                        if(o && o.onBrowserOpen){
                            o.onBrowserOpen();
                        }
                    },
                    children: [{
                        scriptClass : "mstrmojo.ObjectBrowser", 
                        alias: "browser", 
                        cssText: "width:200px;",
                        fishEyeVisible: false,
                        closeable: false,   
                        closeOnSelect: false
                    }]
                },
                
                onBrowserClose: function onBrowserClose(){
                    this.browserShown = false;
                },
                
                handleSuggestionItemSelect: function handleSuggestionItemSelect(it){
                    if(it.t === -99){//browsing   
                        //close suggestion if it is open
                        this.hideSuggestion();
                        
                        this.openPopup('ob',{zIndex: (this.zIndex && (this.zIndex + 10)) ||110});
                        
                        var ob = this.ob.browser;

                        ob.browse({
                            folderLinksContextId : this.folderLinksContextId,      
                            onSelectCB: [this, 'onSuggestionItemSelect'],
                            browsableTypes: this.browsableTypes
                        });
                        
                        this.browserShown = true;
                        
                    } else {
                        this.onSuggestionItemSelect(it);
                    }
                },
                
                /**
                 * Highlight the searchPattern string in given suggestion item text
                 * @param pattern {String} pattern Text to highlight
                 * @param n {String} Suggestion item name text
                 */
                highlightPattern: true,
                getHighlightedText: function(pattern, n) {
                    if (!this.highlightPattern) return n;
                    
                    if (mstr.$A.find([2,32], parseInt(this.nameWildcards)) > -1) { //Exactly - 2, Begin With Phrase - 32
                        n = n.replace(new RegExp('(' + pattern + ')', 'gi'), '<b>' + '$1' + '</b>');
                    } else {
                        var words = pattern.split(' ');
                        for (var i=0, len = words.length; i < len; i ++) {
                            n = n.replace(new RegExp('(' + words[i] + ')', 'gi'), '<b>' + '$1' + '</b>');
                        }
                    }
                    
                    return n;
                },
                
                
                suggestionPopup: {
                    scriptClass: 'mstrmojo.Editor',
                    cssClass: 'mstrmojo-ObjectInputBox-suggest',
                    showTitle: false,
                    modal: false,
                    autoClose: true,
                    nextHighlight: function(){
                        var l = this.list,
                            idx = l.selectedIndex,
                            len = l.items.length;
                        
                        if(idx === (len -1)){
                            l.clearSelect();
                            return;
                        }
                        
                        if(idx === null || idx < 0){
                            idx = 0;
                        } else {
                            idx ++;
                        }
                        
                        l.singleSelect(idx);
                    },
                    preHighlight: function(){
                        var l = this.list,
                            idx = l.selectedIndex,
                            len = l.items.length;
                        
                        if(idx === 0){
                            l.clearSelect();
                            return;
                        }
                        
                        if(idx === null || idx < 0) {
                            idx = len - 1;
                        } else {
                            idx --;
                        }
                        
                        l.singleSelect(idx); 
                    },
                    getSelected: function(){
                        var l = this.list,
                            idx = l && l.selectedIndex;
                        return l.items[idx];
                    },
                    onOpen: function(){
                        var o = this.opener;
                        if(o && o.autoSelect){
                            this.list.singleSelect(0);
                        }
                    },
                    onClose: function(){
                        this.list.clearSelect();
                        if(this.opener){
                            this.opener.suggestionShown = false;
                        }
                    },
                    children:[{
                        scriptClass: "mstrmojo.List",
                        alias: 'list',
                        cssClass: 'mstrmojo-suggest-list',
                        itemMarkupFunction: function(data, idx, w){
                            var o = w.parent.opener;
                            if (o && o.itemRenderer) {
                                return o.itemRenderer(data, idx, w);
                            }
                            return '<div class="mstrmojo-suggest-text ' + ((o && o.item2textCss(data)) || '') + '">' + o.getHighlightedText(o.getSearchPattern(), data[w.itemField]) + '</div>';
                        },
                        onmousedown: function(evt){
                            var p = this.parent,
                                o = p.opener;
                            mstrmojo.dom.stopPropogation(evt.hWin, evt.e);  
                            o.suggestionShown = false;
                            var it = this.items[this.selectedIndex];
                            //p.target.setItem(it[this.itemField], it, false);
                            if(it){
                                o.handleSuggestionItemSelect(it);
                            }
                            p.close();   
                        },   
                        bindings:{ 
                            itemField: 'this.parent.opener.itemField',
                            items: 'this.parent.opener.suggestionItems'
                        }    
                    }] 
                }
                
            
            }); 

})();