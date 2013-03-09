(function(){
    mstrmojo.requiresCls("mstrmojo.hash",
                         "mstrmojo.array",
                         "mstrmojo.Box",
                         "mstrmojo.mstr.WebElements",
                         "mstrmojo.android.SimpleList",
                         "mstrmojo.android.AndroidSearchBox");

    //Private Variables
    var $H = mstrmojo.hash,
        $A = mstrmojo.array;
    
    mstrmojo.android.AndroidElementsSearchView = mstrmojo.declare(
            
            mstrmojo.Box,
            
            null,
            
            {
                /**
                * @type _ListSelection
                */
                targetList: null, // THE list to update selected items
                
                /**
                 * The WebElements to search on.
                 * 
                 * @type mstrmojo.mstr.WebElements
                 */
                elements: null,
                
                setPattern: function setPattern(value, searchForms) {
                    this.searchForms = searchForms;
                    this.searchBox.setPattern(value);
                },
                
                setMultiSelect: function setMultiSelect() {
                	var ml = this.children[1];
                	if (ml) {
                		ml.multiSelect = true;
                		mstrmojo.css.addWidgetCssClass(ml, [ 'multi' ]);
                	}
                },
                
                children: [{
                    scriptClass: 'mstrmojo.android.AndroidSearchBox',
                    alias: 'searchBox',
                    cssText: 'width:100%;',
                    
                    searchFunc: function(sp) {
                         this.searchPattern = sp;
                         if (sp) {
                             var me = this,
                                 org = this.parent.elements,
                                 search = (org && org.duplicate()) || new mstrmojo.mstr.WebElements(),
                                 bc = search.browseConfig || {};
                                
                             bc.searchPattern = sp;
                             bc.blockBegin = 1;
                             if ( this.parent.searchForms) {
                                 bc.searchForms = this.parent.searchForms;
                             }

                             // retrieve result
                            search.getItems(0, {           
                               success: function(retVal){
                                   me.set('searchResult', search);
                               }
                            });
                            
                         } else {
                             this.clearSearch();
                             
                         }
                    },
                    
                    onsearchResultChange: function() {
                        var searchBox = this,
                            searchView = searchBox.parent,
                            searchList = searchView.cl,
                            searchResult = searchBox.searchResult,
                            resItems = (searchResult && searchResult.items) || [],
                            targetList = searchView.targetList;
                        if ( searchView.searchForms && resItems.length === 1) {
                            if (targetList) {
                                targetList.addSelect($A.findMulti(targetList.items, 'v', resItems).indices || []);
                            }
                        } else {
                            searchList.skipEvent = true;
                            searchList.set('items', resItems);
                            if ( targetList ) {
                                var sel = targetList.getSelectedItems();
                                if ( sel && sel.length > 0 ) {
                                    searchList.addSelectedItems(sel);
                                }
                            }
                            searchList.skipEvent = false;
                            searchList.ifDataHelper = searchResult;
                        }
                        
                        //In order for the list to be scrollable after it's rendered, we need to update the scroller config.
                        searchList.updateScroller();
                    }
                }, {
                    scriptClass: 'mstrmojo.ui.MobileCheckList',
                    alias: 'cl',
                    multiSelect: false,
                    itemIdField: 'v',
                    allowUnlistedValues: false,
                	glow: true,
                    onitemsChange: function onitemsChange() {
                        //TQMS 506039. We need to allow the list to auto-resize before we shrink it to available space.
                        //             Otherwise we will not get correct dialog client height
                        this.set('height', "auto" );
                        //Update the height of the search list so as to enable scrolling.
                        var searchView = this.parent,
                            searchBox = searchView.searchBox,
                            listHeight = this.itemsContainerNode.offsetHeight,
                            availableSpace = Math.min(listHeight, (searchView.parent.getAvailableContentSpace() - searchBox.domNode.offsetHeight));
                        
                        this.set('height', availableSpace + "px" );
                    },
                    
                    postselectionChange: function(evt){
                         if ( this.skipEvent) {
                             return;
                         }
                         var tl = this.parent.targetList;
                         if (tl) {
                         	 // TQMS 513112 User should not be able to select multiple elements through a search for a prompt set up to be single select
                             var isMultiSelect = this.multiSelect;
                             if (!isMultiSelect && evt.added && tl.clearSelect) {
                                tl.clearSelect();
                             }
                             //var newItems = $A.get(this.items, $H.keyarray(this.selectedIndices, true));
                             //tl.addSelectedItems(newItems);
                             var items = this.items,
                                 evtAdded = evt.added,
                                 evtRemoved = evt.removed,
                                 i;
                             if ( evtAdded ) {
                                 var added = [];
                                 for ( i = 0; i < evtAdded.length; i++) {
                                     added.push(items[evtAdded[i]]);
                                 }
                                 tl.addSelectedItems(added);
                             }
                             if ( evtRemoved ) {
                                 var removed = [];
                                 for ( i = 0; i < evtRemoved.length; i++) {
                                     removed.push(items[evtRemoved[i]]);
                                 }
                                 tl.unselectItems(removed);
                             }
                         }
                    }
                }]
            }
    );
}());