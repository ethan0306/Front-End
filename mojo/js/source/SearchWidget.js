(function() {
    mstrmojo.requiresCls("mstrmojo.Widget");

    var $C = mstrmojo.css,
        _KEYCODENAME = {
            9: 'Tab',
            13: 'Enter',
            27: 'Esc',
            38: 'ArrowUp',
            40: 'ArrowDown'        
        };
    
    /**
     * This widget is adapted from SearchBox2 by removing all the application specific logic, like retrieving data, caching, etc. It simply shows
     * the search box, dynamically hide/show the clear button when text is added/remove, and call onsearch/onclear method when the search/clear 
     * buttons are clicked. Any application of this widget needs to implement onsearch/onclear methods of which the logic shall be specific to
     * the application. 
     */
    mstrmojo.SearchWidget = mstrmojo.declare(

            // superclass
            mstrmojo.Widget,
            
            // mixins
            null,
            
            {
                scriptClass: 'mstrmojo.SearchWidget',

                /**
                 * A variable indicating whether the onsearch method shall be called automatically when any text is input. 
                 */
                quickSearch: false,
                
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
                                '</td></tr>'+
                              '</table>',
                                
                markupSlots: {             
                      inputNode: function(){return this.domNode.rows[0].cells[0].firstChild.firstChild;},
                      clearNode: function(){return this.domNode.rows[0].cells[1].firstChild;}
                },
    
                /**
                 * Override this method to provide application specific logic when the search button is clicked or in the case of quickSearch, when
                 * any text is input in the search box. 
                 */
                onsearch: function onsearch(){
                    
                },

                /**
                 * Override this method to provide application specific logic when the clear button is clicked.
                 */
                onclear: function onclear(){
                    
                },
                
                /**
                 * Handle the key up event to call onsearch/clearSearch method if quickSearch is set to be true, etc. 
                 */
                prekeyup: function prekeyup(evt) {
                    var hWin = evt.hWin,
                        e = evt.e || hWin.event;
                    
                    var pattern = this.getSearchPattern(),
                        ep = (pattern.length === 0);
                    
                    $C.toggleClass(this.clearNode, ['show'], !ep);
                    
                    if(this.quickSearch){
                        this[ep ? 'clearSearch' : 'onsearch'](pattern);
                    }
                    
                    // process special keys
                    var n = _KEYCODENAME[e.keyCode];
                    if (this['on'+n]) {
                        this['on'+n](evt);
                    }
                },
                
                /**
                 * Called when the ENTER key is pressed. 
                 */
                onEnter: function onEnter() {               
                    this.onsearch(this.getSearchPattern());
                },
                
                /**
                 * Return the pattern to be used by the search. 
                 */
                getSearchPattern: function getSearchPattern(){
                    return mstrmojo.string.trim(this.inputNode.value);
                },
                
                /**
                 * Handler to be called to handle the click event to call onsearch/onclear methods when search/clear button is clicked. 
                 */
                preclick: function preclick(evt) {
                    var hWin = evt.hWin,
                        e = evt.e || hWin.event,
                        tgt = e.target || e.srcElement,
                        id = tgt && tgt.id;
                    
                    switch (id.replace(this.id, '')) { 
                    case 'sbSearch': //search icon
                        this.onsearch(this.getSearchPattern());
                        break;               
                    case 'sbClear': //clear icon
                        this.clearSearch();
                        break;
                    }
                    
                },
                
                /**
                 * Method to hide the clear icon, clear the search input value and call onclear method. 
                 */
                clearSearch: function(){
                    var pattern = this.getSearchPattern();
                    this.inputNode.value = '';
                    //hide icon
                    $C.removeClass(this.clearNode, ['show']);    
                    if(this.onclear){
                        this.onclear(pattern);
                    }
                }
                
        }); 
    
})();