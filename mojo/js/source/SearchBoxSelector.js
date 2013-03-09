(function(){

    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.elementHelper",
            "mstrmojo.ObjectInputBox"
    );

    var _H = mstrmojo.hash,
        _A = mstrmojo.array,
        _EH = mstrmojo.elementHelper,
        _NM = mstrmojo.num,
        _G = mstrConfig,
        thousand = (_G.thousandsSep !== undefined)? _G.thousandsSep : ',';
    
    var ERR_SDK_E_INVALID = 0x80044033,
        ERR_SDK_E_PROMPT_NUMERICAL_VALUES = 0x80044056,
        ERR_SDK_E_PROMPT_DATE_TIME = 0x8004405D;


    /**
     * A search box style selector
     */     
    mstrmojo.SearchBoxSelector = mstrmojo.declare(
        // superclass
        mstrmojo.ObjectInputBox,
        // mixins
        [mstrmojo._DynamicCandidates],
        
        {
            cssClass: 'mstrmojo-ObjectInputBox mstrmojo-SearchBoxSelector',
            
            acptSugItemOnly: true,
            
            srcid: null,
            
            dataSourcesXML: null,
            
            dynamicVerify: false,

            onRender: function(){
                this.suggestionPopup.cssClass = 'mstrmojo-SearchBoxSelector-suggest';
                
                this.suggestionPopup.children[0].itemMarkupFunction = function(data, idx, w){
                    var o = w.parent.opener;     
                    var disTx = '<span class="name">' + data[w.itemField] + '</span>';
                    if (data.wt) {// if item has weight property
                        disTx += ' <span class="weight">(' + _NM.addSeparators(data.wt, thousand) + ' likes)</span>';
                    }
                    return '<div class="mstrmojo-suggest-text ' + ((o && o.item2textCss(data)) || '') + '">' + disTx + '</div>';
                };
            },
            
            // overwrite original logic, the selected item will not display in the suggestion list
            filterCandidates: function filterCandidates(its, t, max){
                var fcs = its;
                if (!this.noCache) {
                    fcs = this._super(its, t, max);
                }
                                              
                // continue to filter the selected items    
                var selected = this.getSelectedObjects();
                for (var i=0; fcs && fcs.length>0 && selected && i < selected.length; i++) {
                    var si = selected[i];
                    var idx = _A.find(fcs, 'v', si.v);
                    
                    if (idx > -1) {
                        _A.removeIndices(fcs, idx, 1);
                    }
                }
                
                return (fcs.length < this.suggestCount) ? fcs : fcs.slice(0, this.suggestCount);
            }, 
            
            getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                var me = this,
                    targetWas = this.getSuggestionTarget(),
                    t = params.pattern ? params.pattern : '',
                    p = me.parent;
                
                // since we don't support search by ", we have to remove it from user input.
                t = t.replace(/"/, "");
                    
                if (this.srcid) {   // only invoke the browse element task when attribute id is not null
                    var taskParams = {
                        taskId: 'browseElements',
                        styleName: 'MojoAttributeStyle',
                        attributeID: me.srcid,
                        dataSourcesXML: me.dsrc || '',                    
                        blockCount: this.REQUEST_THRESHOLD,
                        searchPattern: t + '*',
                        browseFlags: 1
                    }; 
                    
                    if (p.defn.dsid) {
                    	taskParams.datasetID = p.defn.dsid;
                    	taskParams.messageID = p.model.mid;
                    }
                    
                    callbacks.success = function (res) {                    
                        if (res && res.es) {
                            var target = me.getSuggestionTarget(); 
                            if(!res || !target || (targetWas !== target)) {//no target or target changed, do not use it
                                return;
                            }
                            
                            var newPattern = target.getSearchPattern(),
                                its;
                            
                            if (me.srcid) {
                                its = _EH.buildElemsTerseID(res.es, me.srcid, true); 
                            } else {
                                its = res.es;
                            }
                            
                            me._last_hit = {items: its, pattern: params.pattern};
                            
                            if(newPattern && newPattern.indexOf(params.pattern) > -1){
                                var fcs = me.filterCandidates(its, newPattern);
                                me.updateSuggestion(fcs);
                            }
                        }
                    };
                    
                    // TQMS 536101, 547686
                    // for search scenario, it is finally built as complete filter expression in the web server. 
                    // if the date type of attr-form is not char, or user input some specail string like space, are percent(%), ampersand(&), underscore(_), comma(,), 
                    // will trigger exceptions in web sdk level for expression building.
                    // we can't simply change the search filter expression builder directly, because it is widely used for element search on prompts and many other places.
                    // Current work-around is we swallow these special error messages in client side, to avoid the message box pop up
                    callbacks.failure = function(res){
                        var ec = parseInt(res.getResponseHeader('X-MSTR-TaskErrorCode'), 10) +  + 0x100000000;
                        if (ec == ERR_SDK_E_INVALID ||
                            ec == ERR_SDK_E_PROMPT_NUMERICAL_VALUES ||
                            ec == ERR_SDK_E_PROMPT_DATE_TIME) {
                            return;
                        } else {
                            mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                        }
                    },
                    
                    
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams, false, null, true/*use cache*/);  
                }
            }
   });  
})();
   