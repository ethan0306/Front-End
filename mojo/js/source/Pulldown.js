(function () {    

    mstrmojo.requiresCls(
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.css",
            "mstrmojo.Popup",
            "mstrmojo.List",            
            "mstrmojo.DropDownButton");
    
    /**
     * Pulldown is a widget that when clicked would show a pull-down list of items/selections from which the user can select a single item.  
     * It works very similarly to the select element in HTML. As an alternative of HTML select element, it is able to provide 
     * some customized behaviors and consistent appearances across browsers, such as, it can provide default text if no item is selected yet. 
     * You can also define a default selection, if no selection can be matched to a provided value. 
     * 
     * To use Pulldown widget, you need to configure it with a list of items, which it will show as a list of selections when clicked. The list 
     * of items shall contains at least two fields, as in the following example:
     * 
     *              {n:'View', rgt:199},
     *              {n:'Modify', rgt:223},
     *              {n:'Full Control', rgt:255},
     *              {n:'Denied All', rgt:255000},
     *              {n:'Custom ...', rgt:-1}  
     *              
     * You need to tell Pulldown how to consume this list of items through two parameters: itemIdField and itemField. The itemField is the field 
     * used to show the description of each item/selection, while itemIdField is the value corresponding to each item/selection.For the items 
     * example shown above, you want to specify itemField as 'n', and itemIdField as 'rgt'. When you retrieve a selected value from Pulldown, 
     * you will get the itemIdField value, corresponding to the selected item.
     * 
     * As in HTML select element, you can also query Pulldown widget for the selectedIndex and selectedItem at any time to get the information
     * about the selected item and index, in addition to the value. However, we do not try to synchronize value, selectedIndex and selectedItem, 
     * it is highly recommended to use 'value' as the only configuration parameter. 
     * 
     * One last note about Pulldown is about its popupToBody configuration parameter. In usual cases, the pull-down list of selections is attached
     * to a popupNode under the domNode of Pulldown widget. However, in some special case, this would cause part of pulldown to be hidden. To 
     * avoid this happen, you can set popupToBody to true, so that the popup is attached to document body and set its z-index in css, so that the
     * whole list would be shown.
     * 
     */
    mstrmojo.Pulldown = mstrmojo.declare(
            // superclass
            mstrmojo.DropDownButton,
            // mixins
            null,
            // instance members
            {
            scriptClass: 'mstrmojo.Pulldown',
            
            cssClass: 'mstrmojo-Pulldown',
            
            items: null,
            
            itemIdField: 'dssid',
            
            itemField: 'n', 
            
            defaultSelection: 0,
            
            defaultText:null,
            
            title:'',
            
            value: null, 
            
            popupToBody: false,
            
            popupCssClass: '',
            
            popupZIndex: null,
            
            // Make sure "items" is an empty string if no value is given.
            _set_items: function(n, v){
                var was = this.items;
                this.items = v || [];
                return was !== this.items;
            },
            
            markupMethods: mstrmojo.hash.copy({
                onvalueChange: function() {
                    var v = this.value, 
                        idx = -1, 
                        its = this.items,
                        selItem, t;
                    
                    // If value is not null
                    if (v !== null) {
                        // find its index inside the items collection
                        idx = mstrmojo.array.find(its, this.itemIdField, v);
                    } 
                    
                    // if not found, fall back to default selection
                    idx = (idx > -1) ? idx : this.defaultSelection;
                    // update the "selectedItem" property
                    this.selectedItem = selItem = its[idx];
                    // update the "selectedIndex" property
                    this.selectedIndex = idx;
                    
                    if (selItem){
                        // use the text from the selected item
                        t = selItem[this.itemField];
                    }else{
                        // fall back to the default text
                        t = this.defaultText || '';
                    }
                    // update the "text" property to trigger the dom refresh
                    this.set('text', t);
                }
            }, mstrmojo.hash.copy(mstrmojo.DropDownButton.prototype.markupMethods)),
             
            prevalueChange: function(evt){
                var v = this.value,
                    idx = -1;
            
                if (v !== null) {
                    idx = mstrmojo.array.find(this.items, this.itemIdField, v);
                } 
                
                //need to set these two items so that it is available when value change event is fired. 
                if(idx > -1){
                    this.selectedItem = this.items[idx];
                    this.selectedIndex = idx;
                }
            },
            
            premousedown: function premousedown(evt) {
                
                if(this.popupToBody){
                    var pos = mstrmojo.dom.position(this.popupNode, true),
                        pr = this.popupRef,  
                        cfg = {
                            left:Math.round(pos.x) + 'px', 
                            top:Math.round(pos.y) + 'px'
                        };
                    
                    if(!pr.hasRendered){
                        delete pr.slot;
                        cfg.placeholder = document.body.appendChild(document.createElement('div'));
                    }
                    
                    this.popupOpenConfig = this.popupOpenConfig || {};
                    
                    mstrmojo.hash.copy(cfg, this.popupOpenConfig);
                } else {
                    this.popupRef.slot = "popupNode";
                }
                
                if(this._super){
                    this._super();
                }
                
                //adjust the width of popup
                var pn = this.popupRef.domNode;
                if(pn){
                    pn.style.minWidth = (this.domNode.offsetWidth - 2) + 'px';
                }
            },
           
           unrender: function unrender(ignoreDom){
                var pr = this.popupRef;
                if(this.popupToBody && pr.hasRendered){
                    pr.unrender(false);
                }
                if(this._super){
                    this._super(ignoreDom);
                }
            },
            
            popupRef: {
                        scriptClass: 'mstrmojo.Popup',
                        slot: "popupNode",
                        cssClass:'mstrmojo-Pulldown-Popup',
                        autoCloses: false,
                        locksHover: true,
                        onOpen: function(){
                            var o = this.opener,
                                z = o && o.popupZIndex,
                                c = o && o.popupCssClass || '',
                                dn = this.domNode;
                            if (z){
                                dn.style.zIndex = z;
                            }
                            if(c){
                                mstrmojo.css.addClass(dn, [c]);
                            }
                        },
                        children: [
                                       {
                                            scriptClass: 'mstrmojo.List', 
                                            alias: 'list',
                                            itemMarkupFunction: function(item, idx, w){
                                                return  '<div class="mstrmojo-Pulldown-listItem">' + 
                                                    '<div class="mstrmojo-text">' + item[w.itemField] + '</div>' + 
                                                '</div>';
                                            },
                                            renderOnScroll: false,
                                            bindings: {
                                               itemIdField: 'this.parent.opener.itemIdField',
                                               itemField: 'this.parent.opener.itemField',
                                               items: 'this.parent.opener.items',
                                               selectionPolicy: 'this.parent.opener.selectionPolicy',
                                               selectedIndex: 'this.parent.opener.selectedIndex'
                                            },
                                            onmousedown: function(){
                                               this.parent.close();
                                            },
                                            onchange: function() {
                                                var p = this.parent,
                                                    visible = p.visible,
                                                    pd = p.opener,
                                                    si = this.selectedItem;
                                                if (!pd || !si || !visible) {
                                                    return;
                                                }
                                                
                                                pd.set('value',si[this.itemIdField]);
                                            }
                                        }
                                   ]
                                    
             }
        }
    );
})();