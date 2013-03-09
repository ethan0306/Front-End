(function() {
    mstrmojo.requiresCls("mstrmojo.Widget");

    
    /**
     * <p>return params for xhr search request</p>
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
                                rootFolderID: this.rootFolderID, 
                                searchPattern : this.searchPattern,
                                nameWildcards : 1,
                                blockBegin: this.blockBegin || 1,
                                blockCount: this.blockCount,
                                /* totalSize' : totalSize, */
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
                                rootFolderID:  this.rootFolderID,
                                blockBegin: this.blockBegin,
                                blockCount: this.blockCount,
                                /* 'totalSize' : totalSize, */
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
                                attributeID: this.attributeID,
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
     * <p>SearchBox Widget</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.SearchBox = mstrmojo.declare(

            // superclass
            mstrmojo.Widget,
            
            // mixins
            null,
            
            /**
             * @lends mstrmojo.SearchBox.prototype
             */
            {
                scriptClass: 'mstrmojo.SearchBox',
                
                cssClass: "mstrmojo-charcoalbox mstrmojo-dxsprite mstrmojo-search",
                
                label: 'Search for:', //descriptor: Search for:
                //tooltipIcon: 'Search', //Descriptor: Search,
                
                width: '200px', //default seach wrapper width in 'px'
                mWidth: '160px',//default inputbox width in 'px'
                lWidth: '30px', //default left cap width
                rWidth: '10px', //default right cap width
                
                
                /**
                 * <p>The ID of the search task</p>
                 * <ul>
                 *  <li>metatdata search - 'searchMetadata';</li>
                 *  <li>elements search - 'browseElements'</li>
                 *  </ul>
                 *  
                 *  @default 'searchMetadata'
                 */
                taskId: 'searchMetadata',
                
                /**
                 * <p>Style Name for Search</p>
                 */
                searchStyleName: 'MojoFolderStyle',
                
                /**
                 * <p>Objects Types to search</p>
                 * 
                 * @default  '3,14,256,1024,1027,2048,3072,10' for object browser.
                 */
                objectTypes: '3,14,256,1024,1027,2048,3072,10',
                
                /**
                 * <p>This defines RegEx form of a list of special characters that will be interpreted as operators among multiple words by user input.</p>
                 * <p>If user input contains any of them, will not do any filter, instead simply submit a new search</p>
                 */
                token: {
                        searchMetadata: /\\/, 
                        browseElements: /(^-)|(,)|( OR )|( AND)|([<>]=?)|(&)|( )|(["\[\]\/])/
                        },
                        
                /**
                 * <p>Number of results to return </p>
                 * @default 50
                 */
                blockCount: 50,
                
                /**
                 * <p>Minimum number of character to start searching
                 * @default 2
                 */
                minSearchLength: 2,
                
                matchCase: false,
                
                enableMatchCase: true, //Enable matchCase option for this searchbox
                
                
                
                markupString: '<div class="mstrmojo-SearchBox-Wrapper {@cssClass}" style="{@cssText}; width:{@width};">' +
                                '<div class="mstrmojo-SearchBox" mstrAttach:click >' + 
                                    '<span class="mstrmojo-SearchBox-search" id="sbSearch" style="width:{@lWidth};"></span>' +
                                    '<span class="mstrmojo-SearchBox-down" id="sbDown"></span>' +
                                    '<input class="mstrmojo-SearchBox-input" type="text" style="width:{@mWidth};"' + 
                                        ' mstrAttach:keyup,blur ' +      
                                    '/>' +
                                    '<span class="mstrmojo-SearchBox-right" style="width:{@rWidth};"></span>' +
                                    '<span class="mstrmojo-SearchBox-clear" id="sbClear" ></span>' +
                                    '<span class="mstrmojo-SearchBox-spinner" id="sbSpinner"></span>' +
                                '</div>' +
                                '<div class="mstrmojo-SearchBox-options">' +
                                    '<input id="sbMatchCase" type="checkbox"' +
                                        ' mstrAttach:click ' +
                                    '/>' +
                                    '<label for="sbMatchCase">Match Case</label>' +
                                '</div>' +
                              '</div>',

                markupSlots: {
                    inputNode: function(){return this.domNode.firstChild.firstChild.nextSibling.nextSibling;},
                    downNode: function(){return this.domNode.firstChild.firstChild.nextSibling;},
                    optionNode: function(){return this.domNode.lastChild.firstChild;},
                    spinnerNode: function(){return this.domNode.firstChild.lastChild;},
                    clearNode: function(){return this.domNode.firstChild.lastChild.previousSibling;}
                },

                /**
                 * Handles key up events for the inputNode. 
                 * 
                 * @private
                 */
                onkeyup: function onkeyup(evt) {
                    // Do we have an onenter method and did the user hit the enter key?
                    var hWin = evt.hWin,
                        e = evt.e || hWin.event;
                    if (this.onEnter && e.keyCode === 13) {
                        // Call the onenter method.
                        this.onEnter();
                    }
                    
                    //show 'clear' icon
                    this.clearNode.style.display = 'block';
                    
                    //start suggesting
                    this._onsearch(this.inputNode.value);
                },
                
                onclick: function(evt) {
                    var hWin = evt.hWin,
                    e = evt.e || hWin.event,
                    tgt = e.target || e.srcElement,
                    id = tgt && tgt.id;
                    
                    switch (id) {
                    case 'sbDown':
                        if (this.enableMatchCase) {
                            var s = this.optionNode.parentNode.style;
                            s.display = s.display == 'block' ? 'none' : 'block';
                        }
                        break;
                        
                    case 'sbSearch':
                        if (this.onEnter && e.keyCode === 13) {
                            // Call the onenter method.
                            this.onEnter();
                        }
                        this._onsearch();
                        break;
                        
                    case 'sbMatchCase':
                        this.set('matchCase', this.optionNode.checked);
                        break;
                        
                    case 'sbClear':
                        this.inputNode.value = '';
                        
                        //hide icon
                        tgt.style.display = 'none';
                        
                        //restore cache for current folder
                        this.searchPattern = '.';
                        this._onsearch();
                        break;
                    case 'sbSpinner':
                        //TODO: cancel search
                        break;
                    }
                    
                },
                
                /**
                 * <p>Handle Match Case option checkbox status change</p>
                 * 
                 * <p>When Match Case option changes, it simply re-submit the previous search with this updated Match Case property</p>
                 */
                onmatchCaseChange: function(){
                    //trigger cache search or new search
                    this._onsearch();
                    },
                    
                    
                onreadystateChange: function(){
//                        mstr.Enum.Widget.READYSTATE = {
//                                'IDLE' :1,
//                                'WAITING' :3,
//                                'ERROR' :4,
//                                'SUCCESS' :5,
//                                'CANCELLED' :6,
//                                'TIMEOUT' :7
//                            };
                        
                    },
                    
                    
                 postBuildRendering: function() {
                        if (this._super) {
                            this._super();
                        }
                        
                        if (!this.enableMatchCase) {
                            this.downNode.className += ' disabled';
                        }
                        
                        //setup Match Case flag
                        this.matchCase = this.optionNode.checked;
                        
                        //TO BE REMOVED - get some default list
                        //this._onsearch();
                    },
                    
                    /**
                     * <p>Handle RootFolderIDChanged event</p>
                     * <p>When this event happend, the property 'rootFolderCachedItems' should also be set for the first time</p>
                     */
                    onrootFolderIDChange: function(){
                        //set flag
                        this.rootFolderChanged = true;
                        
                      //prepare cache root node which is the default list in the object browser
                        var c = mstrmojo.all[this.id].searchCache, // mstrmojo.all.obdata.searchCache,
                            rfid = this.rootFolderID;
                        
                        if (c && !c[rfid]) {
                            c[rfid] = {};
                            c[rfid][rfid] = (this.contentWidget && this.contentWidget.items || this.rootFolderCacheItems || []).concat();
                        }
                    },
                    
                    /**
                     * <p>Get the Id of the Root Folder to start search</p>
                     * <p>The container widget that includes this SearchBox widget should provide implementation.</p>
                     * 
                     * @abstract
                     */
                    getRootFolderID: function(){},
                    
                    
                    /**
                     * <p>This defines the widget whose 'items' will be updated by search results</p>
                     * <p>The container widget that includes this SearchBox widget should define this property value</p>
                     */
                    contentWidget: null,
                    
                    
                      /**
                     * <p>Notify contentWidget with new Items to display</P>
                     * 
                     * @parma {Array} items 
                     * @private
                     */
                    _notifyContentWidget: function(items){

                       // mstrmojo.all.obdata.set('items', items);
                        if (this.contentWidget ) {
                            //notify contentWidget about this 'items' change
                            this.contentWidget.set('items', items);
                        }
                        else {
                            //OR set it to self's 'item's property, the Widget that will display the 'items' should have listener for this 'itemsChange' event.
                            this.set('items', items);
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
                _onsearch:function(){
                    this.getRootFolderID();
                    
                    //prepare cache root node which is the default list in the object browser
                    var c = mstrmojo.all[this.id].searchCache, // mstrmojo.all.obdata.searchCache,
                        rfid = this.rootFolderID;
                    
                    if (c && !c[rfid]) {
                        c[rfid] = {};
                        c[rfid][rfid] = (this.contentWidget && this.contentWidget.items || this.rootFolderCacheItems || []).concat();
                    }
                        
                        
                    //get user input
                    var input = this.inputNode.value;
//                    //TODO: adjust to make a proper searchPattern by processing special characters, match case option
//                    
//                    //  then check if we can filter on user input && very last search result:
                    var token = this.token[this.taskId];
                    if (token.test(input)) return null;
                    
//                    console.log('searching: ' + input);
//                    
//                    
//                    //TODO:update searchPattern
//                    //- check this searchPattern against cache. if found and filterable, 
//                    //notify listener
//                    //this.set('searchPattern', sp);
//                    
                    
                    
                    
                    
                    //case-sensitivity setting check
                    if (!this.matchCase) {
                        input = input.toLowerCase();
                    }
                    
                    //check whether user input changes by comparing to previous searchPatten, 
                    //and also check whether root folder changed; if not, return.
                    if (this.searchPattern == input && !this.rootFolderChanged) {
                        return;
                    }
                    
                    //update search pattern 
                    this.searchPattern = input;
                    
                    //get cache object at main index
                    var cache = mstrmojo.all[this.id].searchCache[rfid]; //mstrmojo.all.obdata.searchCache[rfid];
                    
                    //check user input length 
                    if (input.length < this.minSearchLength) { 
                        //when input empty, just restore cached data in first page (block).
                        this._notifyContentWidget(cache[rfid]);
                    }
                    else 
                    {
                        
                        //Otherwise, filter cache for current user input
                        var items = this.filterCache(input, cache);
                        if (items === null) {
                            //No match for user input found in cache, just file new search.
                            
                            //reset
                            this.rootFolderChanged = false;
                            
                            //First, show spinner icon
                            this.spinnerNode.style.display = 'block';
                            
                            //create xhr instance and callback interface object
                            var me = this,
                                callback = { //process response
                                    success: function(res) {
                                            
                                                //TO BE REmoved
                                                //console.log(res.items && res.items.length || res.totalSize);
    
                                                //cache this to 'microstrategy.suggests' to avoid re-request when do webpage partial update.
                                                var itms = res.items || []; //if there is no item found, property 'items' does not exist.
                                                mstrmojo.all[me.id].searchCache[me.rootFolderID][(me.searchPattern.length < me.minSearchLength? me.rootFolderID : me.buildIndex(me.searchPattern))] = itms;//[itms, res.totalSize, res.blockBegin];
                                                // this.totalSize = res.totalSize;
    
                                                //update content widget items
                                                me._notifyContentWidget(itms);
                                            },
                                    failure: function(res){
                                                alert(mstrmojo.desc(8117,'Data request failed:') +' \n' + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                                },
                                   complete: function(){
                                                  //hide spinner icon
                                                  me.spinnerNode.style.display = 'none';
                                                }
                                },
                                params = getSearchParams.apply(this, 
                                                             ['searchMetadata', 
                                                              {
                                                                 searchPattern: this.searchPattern + '*' //each result item should begin with user input.
                                                              }
                                                             ]);
                            
                              mstrmojo.xhr.request('GET', mstrConfig.taskURL, callback, params);
                            
                              return;
                            }
                            else
                            {
                                this._notifyContentWidget(items);
                            }
                        }
                    
                    }, //end _onsearch()
                    
                
                    /**
                     * <p>Filter against cache to find items that match current user input</p>
                     * 
                     * @retun {Array} array of items found from cache
                     */
                    filterCache: function() {

                        //@class=mstrFilterSearchSuggest;@method=renderList
                        var input = this.inputNode.value,
                            sc = mstrmojo.all[this.id].searchCache,
                            cached = sc && sc[this.rootFolderID], //mstrmojo.all.obdata.searchCache[this.rootFolderID], //cached object for this search pattern
                            cacheItem = cached && cached[this.buildIndex(input)];   //  cached object for this search pattern 

                        //  first if there is exact match, just use it.
                        if (cacheItem) {
                            return cacheItem;
                        }

                        //  then check if we can filter on user input && very last search result:
                        var token = this.token[this.taskId];
                        if (token.test(input) || this.totalSize > this.blockCount) return null;

                        //  If current input is the string by appending only one keystroke, just filter the right previous cached search result.
                        //  Otherwise, we need look backwards to any existing cache result has the index matching the input from left.
                        //  and the best match from left with maximum length will be chosen.

                        //  first get the previous search results with index being the current input trimming off the last character
                        var subtxt = input.replace(/.$/, '');
                        cacheItem = cached && cached[this.buildIndex(subtxt)];

                        //  check if this is valid object, if not, continue to next sub-string till
                        //  its length reaches 0 or some cache object found
                        while (cacheItem === undefined && (subtxt = subtxt.replace(/.$/, '')).length > 0) {
                            cacheItem = cached && cached[this.buildIndex(subtxt)];
                        }

                        //  if found a match in cache, do filtering;
                        //  otherwise, return null to fire a new search.
                        if (cacheItem !== undefined) {

                            var itms = cacheItem ,
                                r = [];
                            for (var i in itms) {
                                if (itms[i].n.search(new RegExp(input, this.matchCase? '' : 'i')) > -1) {
                                    r.push(itms[i]);
                                }
                            }

                            //update totalSize
                            this.totalSize = r.length;

                            //cache this too to avoid re-filtering
                            return  (cached[this.buildIndex(input)] = r); // [r, r.length, this.blockBegin].concat());
                        }
                        return null;
                    }, //end filterCache()



                    /**
                     * Build a cache index from current user input based on search Match Case setting 
                     * @private
                     */
                    buildIndex: function(txt) {
                      //@class=mstrFilterSearchSuggest;@method=buildIndex
                        if (txt.replace(/^\s|\s$/g, '').length === 0) {
                            return '';
                        }
                        return !this.matchCase ? txt.toLowerCase() : txt + '::0';
                    },
                    
                    
                init: function(props){
                    this._super(props);
                    //initialization xhr request and cache object
                    //
                    this.xhr = new mstrmojo.SimpleXHR();
                    
                    //setup cache
//                    mstrmojo.all.obdata = mstrmojo.all.obdata || new mstrmojo.Model();
//                    mstrmojo.all.obdata.searchCache = mstrmojo.all.obdata.searchCache || {};
                    
                    //each searchbox has its own cache object 'searchCache'
                    mstrmojo.all[this.id].searchCache = mstrmojo.all[this.id].searchCache || {};
                    
                    
                    
                    //cache structure
                    //mstrmojo.all.obdata.searchCache = {
                    //       rootFolderID1: {
                    //                      searchPattern1: items[]
                    //                      searchPattern2: items2[]
                    //                      ......
                    //                      }
                    ////      rootFolderID1: {
                    //                      searchPattern1: items[]
                    //                      searchPattern2: items2[]
                    //                      ......
                    //                      }
                    //          ......
                    //  }
                    //note: searchPattern is case-sensitive
                    // - when matchCase is off, searchPattern is converted to lowercase as hash index
                    // - when matchCase is on, searchPattern is the user input as hash index
                }
                
        });
    

})();