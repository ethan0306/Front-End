(function(){

    mstrmojo.requiresCls("mstrmojo.ListBase");

    /**
     * <p>SelectBox renders data items as HTML &lt;options&gt;s in a &lt;select&gt; box.</p>
     * 
     * <p>If "size" is set to 1, the GUI is rendered as a dropdown &lt;select&gt;.</p>
     * 
     * @class
     * @extends mstrmojo.ListBase
     */
    mstrmojo.SelectBox = mstrmojo.declare(
        // superclass
        mstrmojo.ListBase,
        
        // mixins
        null,
        
        /**
         * @lends mstrmojo.SelectBox.prototype
         */ 
        {
            scriptClass: "mstrmojo.SelectBox",
            
            size: 10,
            
            cssDisplay: 'inline',
            
            markupString: '<select id="{@id}" class="mstrmojo-SelectBox {@cssClass}" style="{@cssText}" size="{@size}" {@multipleHtml} ' +
                                     'mstrAttach:keyup,change >' + 
                                     '{@itemsHtml}' + 
                                 '</select>',
            
            markupSlots: {
                itemsContainerNode: function(){return this.domNode; },
                scrollboxNode: function(){return this.domNode; }
            },
            
            /**
             * Overwrites inherited onvisibleChange to make the selectbox render inline rather than block. 
             * 
             * @ignore
             */
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? this.cssDisplay : 'none'; },
                onenabledChange: function(){ this.domNode.disabled = !this.enabled;}
            },

            /**
             * CSS class names for unselected and selected items' divs. Used by itemRenderer.
             * 
             * @type String
             */
            itemCssClass: "mstrmojo-selectbox-item",

            /**
             * Name of field from which to read each item's display name. Used by itemRenderer.
             * 
             * @type String
             */
            itemDisplayField: 'n',

            /**
             * Name of field from which to read each item's data value. Used by itemRenderer.
             * 
             * @type String
             */
            itemIdField: 'v',
            
            /**
             * Whether show tooltip for every item. Not supported Safari.
             * 
             * @type Boolean
             */
            showItemTooltip: false,
                        
            /**
             * <p>Renders an HTML &lt;option&gt; for each item. The option's display text is read from the item's field 
             * set as this widget's "itemDisplayField".</p>
             * 
             * <p>Methods for selecting/unselecting items manipulate the option's "selected" HTML attribute.</p>
             * 
             * @type Object
             */
            itemRenderer: {
                render: function(/*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
                    var itemNm = mstrmojo.string.htmlAngles((widget.getItemName) ? widget.getItemName(item, idx) : (widget.itemDisplayField && item[widget.itemDisplayField]));
                    
                    return '<option class="' + widget.itemCssClass + '" ' +
                                'value="' + ((widget.getItemValue) ? widget.getItemValue(item, idx) : (widget.itemIdField && item[widget.itemIdField])) + '" ' + 
                                ((widget.selectedIndices[idx]) ? 'selected="true" ' : '') + ((widget.showItemTooltip)? 'title="' + mstrmojo.string.encodeXMLAttribute(itemNm)+ '"' : '') + '>' +
                                    itemNm + 
                           '</option>';
                },
                select: function(/*DomNode*/ el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
                    el.selected = true;
                },
                unselect: function(/*DomNode*/ el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
                    el.selected = false;
                }
            },
            
            /**
             * Extends the inherited method to support the "multipleHtml" property in the markup string.
             * 
             * @ignore
             */
            buildRendering: function bldRnd(){
                this.multipleHtml = this.multiSelect ? ' multiple="true" ' : '';
                this._super();
                delete this.multipleHtml;
            },
            
            _getItemNode: function(idx) {
                // Assumes the scrollboxNode slot points ot the <select> HTML node.
                var s = this.scrollboxNode;
                return s && s.options[idx];
            },

            /**
             * <p>Updates selectedIndices after the end-user changes the DOM's current selection.</p>
             * 
             * <p>Raises a "selectionChange" event if the selectedIndices are modified.</p>
             * 
             * @param {Object} evt A manufactured object representing the event.
             * @param {DomWindow} evt.hWin The window containing the clicked element.
             * @param {DomEvent} evt.e The click event.
             * @private
             */
            prechange: function prechg(evt) {
                // To avoid repainting the selections in DOM unnecessarily (and even possibly
                // triggering an infinite loop), use a temp flag to indicate that we are
                // synchronizing our selectedIndices with the DOM.
                if (this._syncDom) {
                    return;
                }
                
                this._syncDom = true;

                var el = this.scrollboxNode;
                // Use _ListSelections method to update selectedIndices/Index/Value
                // and raise a selectionChange event.
                if (this.multiSelect) {
                    // We support multiselect, so walk the DOM options to see which are selected.
                    var os = el.options,
                        idxs = [];
                    for (var i=0, len=os.length; i<len; i++) {
                        if (os[i].selected) {
                            idxs.push(i);
                        }
                    }
                    this.select(idxs);
                } else {
                    // We don't support multiselect, so ask DOM for the single selected index.
                    this.singleSelect(el.selectedIndex);
                }
                
                delete this._syncDom;
            },
            
            /**
             * <p>Check if user change the selected.</p>
             * 
             * <p>Call prechange to handle the change</p>
             * 
             * @param {Object} evt A manufactured object representing the event.
             * @param {DomWindow} evt.hWin The window containing the clicked element.
             * @param {DomEvent} evt.e The keyup event.
             * @private
             */
            prekeyup: function(evt) {
                var el = this.scrollboxNode,
                isChanged = false; // flag indicates if the selected is changed.

                if (this.multiSelect) {
                    // walk the DOM options to see if any selected is changed.
                    var os = el.options;
                    for (var i=0, len=os.length; i<len; i++) {
                        if (os[i].selected !== !!this.selectedIndices[i]) {
                            isChanged = true;
                            break;
                        }
                    }

                } else {
                   if (el.selectedIndex !== this.selectedIndex) {
                       isChanged = true;
                   }
                }
                if (isChanged) { //if selected changed, use change() to handle
                    var e = evt;
                    e.name = "change";
                    this.raiseEvent(evt);
                }
            },
            
            /**
             * Extends the inherited method in order to avoid:
             * <ol>
             * <li>repainting the DOM to reflect the new selections, and</li>
             * <li>firing the optional "onchange" handler</li>
             * </ol>
             * if the "selectionChange" event was triggered by a native "change" DOM event.
             * For such an event, these 2 operations are not needed because:
             * <ol>
             * <li>the browser will automatically update the DOM selections, and</li>
             * <li>the onchange handler will be called by the _HasMarkup::captureDomEvent method</li>.
             */
            onselectionChange: function onselchg(evt){
                if (!this._syncDom) {
                    this._super(evt);
                }
            }
            
        }
    );
    
})();            
