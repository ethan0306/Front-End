(function() {
    mstrmojo.requiresCls("mstrmojo.Widget");

    var $C = mstrmojo.css;
    
    /**
     * <p>Return parameters for xhr request</p>
     * <p>The basic set of properties is defined in SearchBox Widget. Any extra parameters should be provided in second argument.</p>
     * 
     * @param {Object} extraParams  Extra set of parameters to the search task
     * @return {Object}
     */
    function getSearchParams(taskId, extraParams) {
        
        var params = {
            searchMetadata: 
                            {
                                taskId: 'searchMetadata',
                                styleName: this.searchStyleName,
                                rootFolderID: this.rootID, 
                                searchPattern : this.searchPattern + '*', //Each result item should begin with user input
                                nameWildcards : 1,
                                blockBegin: this.blockBegin || 1,
                                blockCount: this.blockCount,
                                recursive: 1,
                                folderBrowserStyle: 0,
                                includeAncestorInfo: 'true',
                                searchXML: this.searchXML || '',
                                dataSourcesXML : this.dataSources || '',
                                objectType: this.objectTypes
                             },
                    
              browseFolder:
                            {
                                 
                                taskId:'searchMetadata',
                                rootFolderID:  this.rootID,
                                blockBegin: this.blockBegin,
                                blockCount: this.blockCount,
                                // if hier -> no recursive, 
                                // if non-hier -> if there is search defined, use recursive flag defined in search
                                //                if no search defined, recursive
                                recursive: this.hierarchical ? 0 : ( this.searchXML ? '' : 1),  
                                folderBrowserStyle: this.hierarchical ? 1 : 0,
                                includeAncestorInfo: String(!!this.hierarchical),
                                searchXML: this.searchXML || '',
                                dataSourcesXML: this.dataSources || '',
                                objectType: this.objectTypes
                            }, 
                            
             browseElements:
                            {
                                taskId: 'browseElements',
                                styleName: 'MojoAttributeStyle',
                                attributeID: this.rootID,
                                blockBegin: this.blockBegin,
                                blockCount: this.blockCount,
                                filterXML: this.filterXML || '',
                                searchPattern: this.searchPattern || '',
                                matchCase : !!this.matchCase,
                                dataSourcesXML: this.dataSourcesXML || '',
                                includeFormNames: !!this.collectForms,
                                includeFormValues : !!this.bIncludeFormValues,
                                displayedForms : this.displayedForms || 1,
                                dimensionID : this.dimensionId || ''
                            }

        }[taskId];
        
        if (typeof extraParams === 'object') {
            mstrmojo.hash.copy(extraParams, params);
        }
        
        return params;
    }
    
    
    /**
     * Index used to cache current searchPattern in each cache object.
     */
    var _spIndex = '##searchPattern';
    

    /**
     * <p>SearchBox Widget</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.SearchBox2 = mstrmojo.declare(

            // superclass
            mstrmojo.Widget,
            
            // mixins
            null,
            
            /**
             * @lends mstrmojo.SearchBox2.prototype
             */
            {
                scriptClass: 'mstrmojo.SearchBox2',
                
                //TODO:
                //Setup tooltip for each icon
                //tooltip: 'Search', //Descriptor: Search,
                
                
                /**
                 * <p>Width of the &lt;INPUT&;gt </p>
                 * @default 160px 
                 */
                width: '100px',
                
                
                /**
                 * <p>The Search Task ID</p>
                 * <ul>
                 *      <li>metatdata search - 'searchMetadata';</li>
                 *      <li>elements search - 'browseElements'</li>
                 * </ul>
                 *  
                 * @default 'searchMetadata'
                 */
                taskId: 'searchMetadata',
                
                /**
                 * <p> The ID of the RootFolder or the Attribute to search on </p>
                 * 
                 * <ul>
                 *      <li> - 'searchMetadata' task - this is the ID of the RootFolder ('rootFolderID') to perform search in.</li>
                 *      <li> - 'browseElements' task - this is the ID of the Attributes ('attributeID') whose elements to be searched.</li>
                 * </ul>
                 *  
                 */
                rootID: null,
                
                /**
                 * <p>Style Name for Search</p>
                 * 
                 * @default 'MojoFolderStyle'
                 */
                searchStyleName: 'MojoFolderStyle',
                
                /**
                 * <p>Objects Types to search in 'searchMetadata' task</p>
                 * 
                 * @default  '3,14,256,257,1024,1027,2048,3072,10'
                 */
                objectTypes: '3,14,256,257,1024,1027,2048,3072,10',
                
                /**
                 * <p>This defines RegEx form of a list of special characters that will be interpreted as operators among multiple words by user input.</p>
                 * <p>If user input contains any of them, will not do any filter, instead simply submit a new search</p>
                 */
                token: {
                        searchMetadata: /\//, 
                        browseElements: /(^-)|(,)|( OR )|( AND)|([<>]=?)|(&)|( )|(["\[\]\/])/
                        },
                        
                /**
                 * <p>Number of results to request in each search</p>
                 * 
                 * @default 50
                 */
                blockCount: 50,
                
                /**
                 * <p>The index of the first item to start search</p>
                 * 
                 * @default 1
                 */
                blockBegin: 1,
                
                /**
                 * <p>Minimum number of character to start searching
                 * @default 2
                 */
                minSearchLength: 2,
                
                /**
                 * <p>Flag for case-sensitive search</p> 
                 * <p>This flag will be updated by clicking the 'Match Case' CheckBox in SearchBox dropdown when 'enableMatchCase' is true.</p>
                 * 
                 * @default false
                 */
                matchCase: false,
                
                /**
                 * <p>Flag to indicate whether to show the tiny popup with CheckBox to toggle case-sensitive search flag</p>
                 * @default true
                 */
                enableMatchCase: true,
                
                /**
                 * <P>Flag to indicate whether this searchbox should support Incremental Fetch</P>
                 * <p>If true, when data changes, it will raise 'ifsChange' event to notify listener about
                 * the data block info which can be applied to update the associated IncFetch</p>
                 */
                supportIncFetch: true,
                
                /**
                 * <p>caching flags</p>
                 * 
                 * TODO: To decide whether we'd need this optional method to cache initial data.  
                 */
                //useContentWidgetItemsAsRootCache: false,
                
                /**
                 * by default quick search is disabled, this increases the load to the server so unless using a fast 
                 * search engine leave it like this.
                 */
                quickSearch : false,
                
                /**
                 * <p>Flag to indicate whether we want to trigger a new search or do nothing when rootIDs are switched among a set</p>
                 * 
                 * @default false
                 */
                searchAfterSearchPatternRestored: false,
//                
//                markupString: '<div id={@id} class="mstrmojo-SearchBox2-Wrapper {@cssClass}" style="{@cssText};">' +
//                                  '<div class="mstrmojo-SearchBox2" mstrAttach:click >' + 
//                                      '<span class="mstrmojo-SearchBox2-search" id="{@id}sbSearch"></span>' +
//                                      '<span class="mstrmojo-SearchBox2-down" id="{@id}sbDown"></span>' +
//                                      '<input class="mstrmojo-SearchBox2-input" type="text" style="width:{@width};"' + 
//                                          ' mstrAttach:keyup,blur ' +      
//                                      '/>' +
//                                      '<span class="mstrmojo-SearchBox2-right" style="width:{@rWidth};">' +
//                                          '<span class="mstrmojo-SearchBox2-clear" id="{@id}sbClear" ></span>' +
//                                          '<span class="mstrmojo-SearchBox2-spinner" id="{@id}sbSpinner"></span>' + 
//                                      '</span>' +
//                                  '</div>' +
//                                  '<div class="mstrmojo-SearchBox2-options">' +
//                                      '<input id="{@id}sbMatchCase" type="checkbox"' +
//                                          ' mstrAttach:click ' +
//                                      '/>' +
//                                      '<label for="{@id}sbMatchCase">Match Case</label>' +
//                                  '</div>' +
//                                '</div>',


                markupString: '<table id={@id} cellspacing=0 cellpadding=0 class="mstrmojo-SearchBox-Wrapper {@cssClass}" style="{@cssText};">' +
				                '<tr><td>' +
				                    '<div class="mstrmojo-SearchBox" mstrAttach:click >' + 
				                        '<input class="mstrmojo-SearchBox-input" type="text" style="width:{@width};"' + 
				                            ' mstrAttach:keyup,blur ' +      
				                        '/>' +
				                    '</div>' + 
						       '</td><td>' +
						       		'<div class="mstrmojo-SearchBox-clear" id="{@id}sbClear" mstrAttach:click></div>' + 
				               '</td><td>' +
				                        '<div class="mstrmojo-SearchBox-bg">' +
				                            '<div class="mstrmojo-SearchBox-search" id="{@id}sbSearch" mstrAttach:click ></div>' +
				                        '</div>' +
				                '</td><td>' +
				                    '<div class="mstrmojo-SearchBox-options" style="{@cssTextShowMC}">' +
				                        '<input id="{@id}sbMatchCase" type="checkbox" mstrAttach:click />' +
				                        '<label for="{@id}sbMatchCase">' + mstrmojo.desc(1049, 'Match case') + '</label>' +
				                    '</div>' +
				                '</td></tr>'+
				              '</table>',
                                
                markupSlots: {
//                    inputNode: function(){return this.domNode.firstChild.firstChild.nextSibling.nextSibling;},
//                    downNode: function(){return this.domNode.firstChild.firstChild.nextSibling;},
//                    optionNode: function(){return this.domNode.lastChild.firstChild;},
//                    spinnerNode: function(){return this.domNode.firstChild.lastChild.lastChild;},
                           
                      inputNode: function(){return this.domNode.rows[0].cells[0].firstChild.firstChild;},
                      clearNode: function(){return this.domNode.rows[0].cells[1].firstChild;},                      
                      optionNode: function(){return this.domNode.rows[0].cells[3].firstChild.firstChild;}
                },

                preBuildRendering: function() {
                    this.cssTextShowMC = this.enableMatchCase ? '' : 'display: none';
                },
                
                postBuildRendering: function() {
                    if (this._super) {
                        this._super();
                    }
                    
//                    if (!this.enableMatchCase) {
//                        this.downNode.className += ' disabled';
//                    } 
                    
                    //setup Match Case flag
                    this.matchCase = this.optionNode.checked;
                },
                
                /**
                 * <p>Handle keyup events</P> 
                 * 
                 * @param {DOMEvent} evt
                 * @private
                 */
                onkeyup: function onkeyup(evt) {
                    var hWin = evt.hWin,
                        e = evt.e || hWin.event;
                    
                    // process Enter key
                    if (this.onEnter && e.keyCode === 13) {
                        this.onEnter();
                    }
                    
                    //get user input by trimming off leading/trailing spaces
                    var input = mstrmojo.string.trim(this.inputNode.value);
                    
                    //show 'clear' icon
                    if (this.clearNode) {
                    	$C.toggleClass(this.clearNode, ['show'], input.length > 0);
                    }
                    
                    //set flag to swallow any task error message.
                    this.showTaskError = false;
                    this.click2Search = false; 
                    
                    //start suggesting or clear the search
                    if(input.length == 0 || this.quickSearch){
                        this._onsearch();
                    }
                },
                
                onEnter: function() {
                    this._onsearch();
                },
                
                /**
                 * <p>Handle click on each SearchBox component</p>
                 * 
                 * @param {DOMEvent} evt
                 * @private
                 */
                onclick: function(evt) {
                    var hWin = evt.hWin,
                        e = evt.e || hWin.event,
                        tgt = e.target || e.srcElement,
                        id = tgt && tgt.id;
                    
                    switch (id.replace(this.id, '')) {
                    case 'sbDown': //dropdown arrow
                        if (this.enableMatchCase) {
                            var s = this.optionNode.parentNode.style;
                            s.display = s.display == 'block' ? 'none' : 'block';
                        }
                        break;
                        
                    case 'sbSearch': //search icon
                        if (this.onEnter && e.keyCode === 13) {
                            this.onEnter();
                        }
                        //set flag to alert message if task call failed.
                        this.showTaskError = true;
                        this.click2Search = true;
                        
                        this._onsearch();
                        break;
                        
                    case 'sbMatchCase': //Match Case checkbox
                        this.set('matchCase', this.optionNode.checked);
                        break;
                        
                    case 'sbClear': //clear icon
                        this.clearSearch();
                        break;
                    case 'sbSpinner': //spinner icon
                        //TODO: should we support cancel search when clicking on this icon?
                        break;
                    }
                    
                },
                
                clearSearch: function(){
                    this.inputNode.value = '';
                    //hide icon
                    $C.removeClass(this.clearNode, ['show']);                   
                    
                    var c = this.searchCache, // mstrmojo.all.obdata.searchCache,
                        rid = this.rootID;
                    
                    if (c && c[rid]) {
                        c[rid][_spIndex] = '';
                    }
                    
                    this._onsearch(true);
                },
                
                /**
                 * <p>Handle Match Case option checkbox status change</p>
                 * 
                 * <p>When Match Case option changes, it simply re-submit the previous search with this updated Match Case property</p>
                 */
                onmatchCaseChange: function(){
                    //update flag
                    this.matchCaseChanged = true;
                    
                    //trigger cache search or new search
                    this._onsearch();
                },
                    
                    
                /**
                 * <p>Handle RootIDChanged event</p>
                 * <p>When this event happend, the property 'rootCachedItems' should also be set for the first time</p>
                 * 
                 * <P>note: this event handler is alternative to the function getRootFolderID()</P>
                 */
                onrootIDChange: function(){
                    //set flag
                    this.rootChanged = true;

                    //prepare cache object
                    this._setupCache();

                    var c = this.searchCache[this.rootID];

                    //check whether we could restore the previous search pattern to the Input Box
                    if (c) {
                        var sp = c[_spIndex] || '';
                        this.inputNode.value = sp;
                        if (sp.length > 0) {
                            //should we re-do search/filtering on this restored input
                            if (sp.length >= this.minSearchLength && this.searchAfterSearchPatternRestored) {
                                this._onsearch();
                            }
                        }
                    }
                },
                    
                
                /**
                 * <p>Get the ID of the target (folder or attribute) to search on.</p>
                 * 
                 * <p>The container widget that includes this SearchBox widget should provide implementation.</p>
                 * 
                 * @abstract
                 */
                getRootID: function(){},


                /**
                 * <p>This defines the widget whose 'items' will be updated by search results</p>
                 * <p>The container widget that includes this SearchBox widget should define this property value</p>
                 * <p>Optional</p>
                 */
                contentWidget: null,
                    

                /**
                 * <p>Notify contentWidget with new Items to display</P>
                 * <p>If property 'contentWidget' is not set, will set 'items' to self (SearchBox)</p>
                 * 
                 * <p>The container widget should setup lister to this 'itemsChange'</p>
                 * 
                 * @param {Array} items Array of three items as : [[list], totalsize, blockbegin]
                 * @private
                 */
                _notifyContentWidget: function(items){
                    var cw = this.contentWidget || this;
                    cw.set('items', items[0]);

                    if (this.supportIncFetch) {
                        var ts = items[1],
                            bb = items[2],
                            bc = this.blockCount;
                        
                        //update IncFetch setting
                        cw.set( 'ifs', 
                                {
                                    np: Math.floor(ts / bc) + ((ts % bc > 0) ? 1 : 0), //total pages
                                    cp: Math.floor(bb / bc) + ((bb % bc > 0) ? 1 : 0)  //current page
                                }
                            );
                    }
                },

                /**
                 * <p>Handle User Input</p>
                 * 
                 * <p>Depends on cached conent, this will request data from server or filter the cache. Then cache this new set of items.
                 *    Last, notify the contentWidget with this new set of items.
                 * </p>
                 * 
                 * @private
                 */
                _onsearch:function(toRoot){
                    //get RootFolderID or AttributeID to search on
                    this.getRootID();
                    
                    this._setupCache();
                        
                    //get user input
                    var input = mstrmojo.string.trim(this.inputNode.value);
                    if(input.length === 0){
                    	toRoot = true;
                    }
                    //TODO: adjust to make a proper searchPattern by processing special characters, match case option
                    
                    //  then check if we can filter on user input && very last search result:
                    var token = this.token[this.taskId];
                    if (token.test(input)) {
                        //TODO: 
                        //Some special characters may cause error message returned. Need to figure out what can be sent and what cannot 
                        //return null;
                    }
                    
                    //case-sensitivity setting check
//                    if (!this.matchCase) {
//                        input = input.toLowerCase();
//                    }
                    
                    //check whether user input changes by comparing to previous searchPatten, 
                    //and also check whether root folder changed; if not, return.
                    if (this.searchPattern == input && !this.rootChanged && !this.matchCaseChanged && !this.click2Search) {
                        return;
                    }

                    //get cache object at main index
                    var rid = this.rootID,
                        cache = this.searchCache[rid]; //mstrmojo.all.obdata.searchCache[rid];
                    
                    //check user input length 
                    if ((input.length < this.minSearchLength && !this.click2Search) && !toRoot) { 
                        //when input is less than minimum searchLegnth, check whether the previous searchPattern is valid 
                        //if so, restore cached data in first page (block);
                        //otherwise, it means there never been a search yet, do nothing
                        if (this.searchPattern && this.searchPattern.length >= this.minSearchLength ){
                            this._notifyContentWidget(cache[rid]);
                            
                            //update search pattern 
                            this.searchPattern = input;
                        }
                    }
                    else 
                    {
                        //update search pattern 
                        this.searchPattern = input;
                        
                        //save searchPattern with root for restore when switching back from other folder
                        cache[_spIndex] = this.searchPattern; 
                        
                        //Otherwise, filter cache for current user input
                        var items = this.filterCache(input, cache, toRoot);
                        if ((this.click2Search || items === null) && !toRoot) {
                            //No match for user input found in cache, just file new search.
                            
                            //should reset blockBegin
                            this.blockBegin = 1;
                            
                            this.fetch();
                            return;
                        }
                        else
                        {
                            this._notifyContentWidget(items);
                        }
                    }
                    
                    //save user input with root for restore when switching back from other root (folder)
                    cache[_spIndex] = input; 
                    
                }, //end _onsearch()
                    
                   
                /**
                 * <p>Prepare cache object for each rootID</p>
                 * 
                 * @private
                 */
                _setupCache: function() {
                    //prepare cache root node which is the default list in the object browser
                    var c = this.searchCache, // mstrmojo.all.obdata.searchCache,
                        rid = this.rootID;

                    if (c) {
                        c[rid] = c[rid] || {};
                        var itms = this.contentWidget && this.contentWidget.items || this.rootCacheItems || [];
                        c[rid][rid] = [itms, this.totalSize || 0, this.blockBegin || 1].concat();
                    }

                },
                
                taskCallId : 0,
                
                path: mstrConfig.taskURL,
                
                method: 'POST',
                
                /**
                 * <p>Send search request</p>
                 */
                fetch: function() {
                    //reset
                    this.rootChanged = false;
                    this.matchCaseChanged = false;

                    //First, show spinner icon
                    if (this.spinnerNode) {
                        this.spinnerNode.style.display = 'block';
                    }

                    if(this.preFetch){
                        this.preFetch();
                    }

                    //create xhr instance and callback interface object
                    var me = this,
                        params = getSearchParams.apply(this, [this.taskId]);
                    params.searchPattern = this.searchPattern;
                        callback = { //xhr response handlers
                            success: function(res) {
                                        //cache this to 'microstrategy.suggests' to avoid re-request when do webpage partial update.
                                        var itms = res.items || res.es || []; //if there is no item found, property 'items' does not exist.
                
                                        //include size info to cache
                                        itms = [itms, res.totalSize || res.sz || 0, res.blockBegin || res.bb];
                                        mstrmojo.all[me.id].searchCache[me.rootID][(params.searchPattern.length == 0 ? me.rootID : me.buildIndex(params.searchPattern))] = itms;
                                        
                                        //update content widget items
                                        me._notifyContentWidget(itms);
                                    },
                             failure: function(res){
                                        if (me.showTaskError) {
                                            mstrmojo.alert(mstrmojo.desc(8117,'Data request failed:') +' \n' + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                        }
                                    },
                             complete: function(){
                                        //hide spinner icon
                                        if (me.spinnerNode) {
                                            me.spinnerNode.style.display = 'none';
                                        }
                                        if(me.postFetch){
                                        	me.postFetch();
                                        }                                        
                                    }
                        };
                        
                        
                    if (this.sessionState !== undefined){
                        params.sessionState = this.sessionState;
                    }
                    mstrmojo.xhr.request(this.method, this.path, callback, params, undefined, this.XServer, this.baseParams);
                },


                /**
                 * <p>Handle IncFetch</p>
                 * <p>Basically this function should be called by 'fetch' event handler which pass in the no. of that page to fetch.</p>
                 * 
                 * @param {Integer} pn Page Number
                 */
                fetchPage: function(pn) {
                    //calculate position of first itme to fetch
                    this.blockBegin = pn * this.blockCount + 1;
                    
                    //send request
                    this.fetch();
                },
                    
                /**
                 * <p>Filter against cache to find items that match current user input</p>
                 * 
                 * <UL>Limitation:
                 *    <li> Client-side filtering can only work on searching one single word
                 *    <li> Any input of the special characters (space, & etc interpreted as operator) will trigger a new search)
                 * </UL> 
                 * 
                 * @return {Array} array of items found from cache
                 */
                filterCache: function(input, cached, toRoot) {

                    var cacheItem = cached && cached[toRoot? this.rootID : this.buildIndex(input)];   //  cached object for this search pattern 

                    // first if there is exact match, just use it.
                    if (cacheItem) {
                        return cacheItem;
                    }

                    // then check if we can filter on user input && very last search result:
                    var token = this.token[this.taskId];
                    if (token.test(input) || this.totalSize > this.blockCount) {
                        return null;
                    }

                    // If current input is the string by appending only one keystroke, just filter the right previous cached search result.
                    // Otherwise, we need look backwards to any existing cache result has the index matching the input from left.
                    // and the best match from left with maximum length will be chosen.

                    // first get the previous search results with index being the current input trimming off the last character
                    var subtxt = input.replace(/.$/, '');
                    cacheItem = cached && cached[this.buildIndex(subtxt)];

                    // check if this is valid object, if not, continue to next sub-string till
                    // its length reaches 0 or some cache object found
                    while (cacheItem === undefined && (subtxt = subtxt.replace(/.$/, '')).length > 0) {
                        cacheItem = cached && cached[this.buildIndex(subtxt)];
                    }

                    // if found a match in cache, do filtering;
                    // otherwise, return null to fire a new search.
                    if (cacheItem !== undefined) {

                        // this cached result has incremental fetch, cannot do filter, need fire new search.
                        if (cacheItem[1] > this.blockCount) {
                            return null;
                        }

                        var itms = cacheItem[0],
                            r = [];
                        for (var i in itms) {
                            if (itms[i].n.search(new RegExp(input, this.matchCase? '' : 'i')) > -1) {
                                r.push(itms[i]);
                            }
                        }

                        //update totalSize
                        this.totalSize = r.length;

                        //cache this too to avoid re-filtering
                        return  (cached[this.buildIndex(input)] = [r, r.length, this.blockBegin].concat());
                    }
                    return null;
                    
                }, //end filterCache()



                /**
                 * <p>Build a cache index from current user input based on search Match Case setting</p>
                 *  
                 * @private
                 */
                buildIndex: function(txt) {
                    if (txt.replace(/^\s|\s$/g, '').length === 0) {
                        return '';
                    }
                    
                    //for case-sensitive, append a special suffix.
                    return !this.matchCase ? txt.toUpperCase() : txt + '::0';
                },
                
                    
                /**
                 * <p>Initialization xhr instance and cache object</p>
                 */
                init: function(props){
                    if (this._super) {
                        this._super(props);
                    }
                    
                    this.xhr = new mstrmojo.SimpleXHR();
                    
                    //setup cache for this SearchBox
                    //each searchbox has its own cache object 'searchCache'
                    this.searchCache = this.searchCache || {};
                    
                    //cache structure
                    //this.searchCache = {
                    //       rootID1: {
                    //                      searchPattern1: [items[],totalsize,blockbegin]
                    //                      searchPattern2: [items2[],totalsize,blockbegin]
                    //                      ......
                    //                      }
                    ////      rootID1: {
                    //                      searchPattern1: [items[],totalsize,blockbegin]
                    //                      searchPattern2: [items2[],totalsize,blockbegin]
                    //                      ......
                    //                      }
                    //          ......
                    //  }
                    //note: searchPattern is case-sensitive
                    // - when matchCase is off, searchPattern is converted to lowercase as hash index
                    // - when matchCase is on, searchPattern is the modified user input as hash index
                },
                
                clear: function(){
                    this.inputNode.value = '';
                    //hide icon
                    $C.removeClass(this.clearNode, ['show']);
                }

                
        }); //end declare()
    
})();