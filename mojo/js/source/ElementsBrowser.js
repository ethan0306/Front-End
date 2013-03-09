(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.Container",
            "mstrmojo.Box",
            "mstrmojo.List",
            "mstrmojo.SearchBox2",
            "mstrmojo.WaitIcon",
            "mstrmojo.IncFetch");
    
    var _A = mstrmojo.array,
        _H = mstrmojo.hash;
    
    /**
     * <p>Elements Browser Widget</p>
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.ElementsBrowser = mstrmojo.declare(
         
         //superclass
         mstrmojo.Box,  
          
         //mixins
         null,
         
        /**
         * @lends mstrmojo.ElementsBrowser.prototype
         */
        {
            scriptClass: "mstrmojo.ElementsBrowser",

            cssClass: "mstrmojo-ElementBrowser",
                      
            /**
             * <p>Cache flags about which attribute has been cached of its first block</p>
             * <p>When Elements Browser is load for the first time, its list is empty, but its attributeID should have been set already.
             * Then we should load the first block into the list by calling searchbox' fetching function with a empty string as searchPattern.</p>
             * 
             * @type Object
             */
            rootCached: null,
            
            /**
             * <P>The dssid of the Attribute whose elemetns to be browsed in this widget</P>
             */
            attributeID: null,
            
            /**
             * <p>Callback to be called when OK button is clicked</p>
             */
            onOK: null,
            
            init: function(props) {
                this._super(props);
                this.rootCached = {};
            },
            
            postBuildRendering: function(){
                if (this._super) {
                    this._super();
                }

                ////Setup event listeners:
                // Get ref to child widgets
                var incFetch = this.ebIncFetch,
                    searchbox = this.ebSearchBox,
                    list = this.ebList; 
                
                // Attach event handler to update IncFetch GUI and fetch new page of data.
                incFetch.attachEventListener('fetch', searchbox.id, function(evt) {    
                    //'this' is the searchBox instance
                    incFetch.cp = evt.v;
                    incFetch.children = null;
                    incFetch.refresh();
                    
                    //In SearchBox, blocks index is 0-based.
                    this.fetchPage(evt.v - 1);
                });
                
                // Attach event handler to process IncFetchSetting change raised by SearchBox
                searchbox.attachEventListener('ifsChange', incFetch.id, function(evt) {
                    //'this' is the IncFetch instance

                    var old_np = this.np;
                    
                    _H.copy(evt.value, this);
                    
                    //only refresh when there are multiple pages
                   // if ((old_np == 0 && this.np > 0) || this.np > 1) {
                    if (this.np > 1) {
                        this.children = null;
                        this.refresh();
                    }

                    //animate IncFetch's visibility by sliding it in/out
                    if (old_np <= 1 && this.np > 1 || old_np > 1 && this.np <=1 || old_np === 0 && this.np > 0) {
                        this.set('visible', this.np > 1);
                    }
                });
                
                // Attach event handler to process itemsChange raised by SearchBox
                searchbox.attachEventListener('itemsChange', list.id, function(evt) {
                    //'this' is the List instance
                    
                    //update visible to slide in/out
                    this.set('items', evt.value || []);
                });
                
            },
            
            /**
             * <p>When this elementsBrowser is first loaded, it should fill with first block of the complete elements list 
             * and clear search box states.</p>
             */
            initBrowser: function() {
                var searchbox = this.ebSearchBox,
                    attributeID = this.attributeID;
                
                //update target of the searchTask
                searchbox.set('rootID', attributeID);
                searchbox.clear();    
                searchbox.searchPattern = '';
                
                if(attributeID && !this.rootCached[attributeID]) {
                    //clear current List
                    searchbox.set('items', []);
                    searchbox.blockBegin = 1;
                    
                    //fetch first block
                    searchbox.fetch();
                    
                    //set flag that this Attribute has been initialized
                    this.rootCached[attributeID] = true;
                } else if (attributeID){
                    searchbox._notifyContentWidget(searchbox.searchCache[attributeID][attributeID]); 
                    this.ebList.updateSelections();
                }

            },

                                                
            children: [
                           
                       //Optional close button will be added here if this widget is closable.

                       //SearchBox
                       {
                           alias: "ebSearchBox",
                           scriptClass: "mstrmojo.SearchBox2",
                           cssClass: "mstrmojo-ElementsBrowser-SearchBox",
                           taskId: "browseElements",
                           quickSearch : true,
                           getRootID: function() {
                                               this.rootID = this.parent.attributeID;
                                           }
                       },
                           //ElementsList
                       {
                           alias: "ebList",
                           scriptClass: "mstrmojo.List",
                           cssClass: "mstrmojo-ELementsBrowser-List",
                           itemIdField: 'v',
                           allowUnlistedValues: false,
                           itemMarkup: '<div class="mstrmojo-bullet">' + 
                                           '<div class="mstrmojo-ebIcons ae">'+ 
                                               '<div class="mstrmojo-text">{@n}</div>' + 
                                           '</div>' + 
                                       '</div>',
                           
                           updateSelections: function(){
                               var eb = this.parent,
                               sel = eb.selectedItems;
                               if(sel){
                                   this.initializing = true;
                                   this.clearSelect(false);
                                   this.setSelectedItems(sel,false);
                                   this.initializing = false;
                               }                           
                           },
                               
                           onitemsChange: function() {
                                this.updateSelections();
                           },
                              
                           onchange: function(evt){
                               if(this.initializing) return;
                               var its = this.items,
                               eb = this.parent,
                               sel = eb.selectedItems,
                               it,idx;
                               for (var i=0, r = evt.removed, rlen = r&&r.length; i<rlen; i++) {
                                   it = its[r[i]];
                                   idx = _A.find(sel,this.itemIdField, it[this.itemIdField]);
                                   if(idx > -1){
                                       sel.splice(idx, 1);
                                   }
                               }
                               for (var j=0, a = evt.added, alen = a&&a.length; j<alen; j++) {
                                   it = _H.clone(its[a[j]]);
                                   sel.push(it);
                               }
                           },
                           
                           multiSelect: true,
                           selectionPolicy: 'toggle'
                        },
                       
                       //Incremental Fetch
                       {
                           alias: "ebIncFetch",
                           scriptClass: "mstrmojo.IncFetch",
                           cssClass: "mstrmojo-ElementsBrowser-IncFetch",
                           height: '20px', //required to support animation
                           
                           np: 0, //number of pages
                           cp: 0, //current page
                           ds: {  //descriptors
                               f: mstrmojo.desc(4046), // "First"
                               p: mstrmojo.desc(1058), // "Previous"
                               n: mstrmojo.desc(1059), // "Next"
                               l: mstrmojo.desc(4049), // "Last"
                               pgs: mstrmojo.desc(5972), // "## of ### pages"
                               gt: mstrmojo.desc(5878), // "Go to:"
                               v: mstrmojo.desc(6079) // "This field should be # between ## and ###."
                           },
                           
                           onvisibleChange: function(evt){
                               this.domNode.style.display = evt.value ? 'block' : 'none';
                           }
                       }
                       
                   ] //end Children[]
        }
    );

})();