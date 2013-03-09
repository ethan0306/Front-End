(function(){

    mstrmojo.requiresCls(
            "mstrmojo.Container",
            "mstrmojo.Button",
            "mstrmojo.DropDownButton",
            "mstrmojo.Label");
    
    /**
     * <p>The widget for a standard incremental fetch component.</p>
     * 
     * <p>When the user selects a new page this component will raise a 'fetch' event.</p> 
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.IncFetch = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.IncFetch.prototype
         */
        {
            scriptClass: "mstrmojo.IncFetch",
            
            markupString: '<div id="{@id}" class="mstrmojo-IncFetch {@cssClass}" style="{@cssText}">' +
                            '<div></div>' +
                            '<div class="mstrmojo-clearMe"></div>' +    
                          '</div>',
                          
            markupSlots: {
                containerNode: function(){ return this.domNode.firstChild; }
            },
        
            /**
             * Overridden to insert the children based ont the properties of this control.
             * 
             * @ignore
             */
            preBuildRendering: function preBuildRendering() {

                var btns = [],       // Array to hold new child buttons.
                    ds = this.ds,    // Block of descriptors.
                    cp = this.cp,    // Current page.
                    np = this.np,    // Total number of pages.
                    ps = this.ps,    // Block size
                    id = this.id,
                    cnt = 2;
                
                // Button click handler.
                var fnClickHandler = function () {
                    mstrmojo.all[id].set('cp', this.text);
                };                
                
                // Utility object for creating arrows.
                var arw = {
                    f: 1,
                    p: Math.max(cp - 1, 1),
                    n: Math.min(cp + 1, np),
                    l: np
                };
                
                // Create all four buttons.
                for (var a in arw) {
                    btns.push(new mstrmojo.Button({
                        iconClass: 'arrow ' + a,
                        title: ds[a],
                        enabled: (arw[a] !== cp),
                        text: arw[a],
                        onclick: fnClickHandler
                    }));
                }
                
                // Calculate start and ending pages.
                var start = Math.max(Math.min(cp - 2, np - 4), 1),
                    end = Math.min(start + 4, np);
                
                // Insert page buttons into the btn array.
                for (var i = start; i <= end; i++) {
                    var b;
                    
                    // Is this the current page?
                    if (i === cp) {
                        
                        // Are there more than 5 pages?
                        if (end - start === 4 && np !== 5) {
                            
                            // Yes, then insert a drop down button with the goto popup.
                            b = new mstrmojo.DropDownButton({
                                height: '13px',
                                title: ds.a ? ds.a : "",
                                text: i,
                                direction: 'up',    // So that the drop down arrow will point up.
                                popupRef: {
                                    scriptClass: "mstrmojo.Popup",
                                    slot: "popupNode",
                                    contentNodeCssClass: "goto",
                                    autoCloses: false,
                                    locksHover: true,
                                    children: [{
                                        scriptClass: 'mstrmojo.VBox',
                                        children: [{
                                            scriptClass: "mstrmojo.Label",
                                            cssText: 'float:left;',
                                            text: ds.gt                         // Descriptor: Go to:
                                        }, {
                                            scriptClass: "mstrmojo.TextBox",
                                            cssText: 'float:left;',
                                            size: 3,
                                            maxLength: String(np).length,        // Doesn't need to be any bigger than the length of the max page value.
                                            
                                            onEnter: function () {
                                                // Get the entered value.
                                                var t = this.inputNode.value,
                                                    p = this.parent.parent;
                                                
                                                // Did the user enter an empty value?
                                                if (t === '') {
                                                    // Just close.
                                                    p.close();
                                                    return;
                                                }
                                                
                                                // Validate the value.
                                                var v = parseInt(t, 10),
                                                    isValid = !(isNaN(v) || v < 1 || v > np);
                                                
                                                // Did the user enter a valid value? 
                                                if (isValid) {
                                                    // Set the new current page on the inc fetch component.
                                                    mstrmojo.all[id].set('cp', v);
                                                    
                                                    // Close the popup
                                                    p.close();
                                                } else {
                                                    // Set the text box into the error state.
                                                    this.setInvalidState(ds.v.replace('###', np).replace('##', 1).replace(' #', ''));    // Descriptor: This field should be # between ## and ###.
                                                }
                                            }
                                        }, {
                                            scriptClass: "mstrmojo.Button",
                                            cssText: "float:left",
                                            iconClass: "apply",
                                            title: ds.ap ? ds.ap : "",
                                            onclick: function(){
                                                this.parent.children[1].onEnter();
                                            }
                                        }]
                                    }],
                                    
                                    onOpen: function() {
                                        // Add the open class to the dropdown button so that it remains highlighted.
                                        mstrmojo.css.addClass(this.parent.domNode, ['open']);
                                        
                                        // Set focus in the text box.
                                        var tb = this.children[0].children[1].inputNode;
                                        window.setTimeout(function () {
                                            tb.focus();
                                        }, 0);
                                    },
                                    
                                    onClose: function () {
                                        // Remove the open class from the dropdown button so that it is no longer highlighted.
                                        mstrmojo.css.removeClass(this.parent.domNode, ['open']);
                                        
                                        // Clean up the text box.
                                        this.children[0].children[1].cleanUp();
                                    }
                                }                                
                            });
                            
                        } else {
                            
                            // No, then we don't need the goto popup so insert a normal text button.
                            b = new mstrmojo.Button({
                                iconClass: 'pg on',        // "on" class is so that the button looks different then other buttons.
                                text: i
                            });
                        }
                        
                    } else {
                        
                        // Insert a normal text button.
                        b = new mstrmojo.Button({
                            iconClass: 'pg',
                            text: i,
                            onclick: fnClickHandler
                        });
                    }
                    
                    // Insert this button into the buttons array in the correct position.
                    btns.splice(cnt++, 0, b);
                }
                
                // Add the "pages of" label.
                btns.splice(cnt++, 0, new mstrmojo.Label({
                    text: ds.pgs.replace('###', np).replace('##', ''),
                    cssText: 'float:left;margin:1px 1px 1px 3px;'
                }));
                
                /**
                 * The wait icon that appears in this Incremental Fetch component.
                 * 
                 * @type mstrmojo.WaitIcon
                 * @fieldOf mstrmojo.IncFetch
                 * 
                 * @private
                 */
                this._iWait = new mstrmojo.WaitIcon({
                    cssText: 'margin-top:-2px;'
                });
                btns.push(this._iWait);                 
                
                // Add the buttons to this container.
                this.addChildren(btns);
                
                return this._super? this._super() : true;
            },
            
            /**
             * <p>Custom handler for when the 'cp' property is set.</p>
             * 
             * <p>Raises the fetch event whenever the 'cp' (current page) property is changed.</p>
             * 
             * @param {String} n The name of the changed property (always 'cp').
             * @param {Integer} v The new value for the changed property.
             * 
             * @private
             */
            _set_cp: function _set_cp(n, v) {
                // Is the new value different?
                if (parseInt(v, 10) !== this.cp) {
                    // Raise the fetch event.
                    this.raiseEvent({
                        name: 'fetch',
                        v: v,
                        iWait: this._iWait
                    });
                }
            }
        }
    );
    
})();