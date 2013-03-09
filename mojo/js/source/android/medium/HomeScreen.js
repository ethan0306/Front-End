(function () {

    mstrmojo.requiresCls("mstrmojo.android.AndroidMainView",
                         "mstrmojo._SupportsEllipsisText",
                         "mstrmojo.android.SimpleList");
    
    var btnMarkup,
        isLowDPI = false;
    
    
    
    /**
     * Widget for displaying the home screen on an Android medium size factor Device.
     * 
     * @class
     * @extends mstrmojo.android.AndroidMainView
     */

    mstrmojo.android.medium.HomeScreen = mstrmojo.declare(
            
        mstrmojo.android.AndroidMainView,
    
        [ mstrmojo._SupportsEllipsisText ],
        
        /**
         * @lends mstrmojo.android.medium.HomeScreen.prototype
         */
        {
            scriptClass : 'mstrmojo.android.medium.HomeScreen',
            
            contentChild: {
                scriptClass : 'mstrmojo.android.SimpleList',
                cssClass: 'homeScreenList',
                selectionPolicy: 'reselect',
                
                /**
                 * Overriding this property such that it tells the main view that the Android HomeScreen View only supports the Settings menu option.
                 * 
                 * @see mstrmojo.AndroidMainView
                 * @ignore
                 */
                supportedDefaultMenus: 2,
                
                getItemMarkup: function getItemMarkup(item) {
                    // Have we NOT created the markup yet?
                    if (!btnMarkup) {
                        var fmt = this.btnFmt, 
                            btnStyle = '',
                            btnCls = [ 'btn' ],
                            cols = 1;               // Default to one column for low DPI.
                        
                        // Is this NOT a low DPI device?
                        isLowDPI = (mstrMobileApp.getDeviceDPI() === 120);
                        if (!isLowDPI) {
                            // Calculate number of columns.
                            cols = Math.max(1, Math.min(3, Math.round((this.items.length / 5.4) * 2)));;
                        }

                        // Do the buttons have any style associated with them?
                        if (fmt.sty > 1) {
                            // Add border-color and background color.
                            btnStyle = 'border-color:' + fmt.bc + ';background-color:' + fmt.bg + ';';
                            
                            // Add drop shadow.
                            btnCls.push('drop');
                            
                            // Are the buttons glass?
                            if (fmt.sty === 3) {
                                // Add class to show glass effect.
                                btnCls.push('gls');
                            }
                        }

                        // Add number of columns class to the widget DOM node.
                        mstrmojo.css.addWidgetCssClass(this, 'cols' + cols);
                        
                        // Create markup that will be cached and used for all buttons.
                        btnMarkup = '<div class="btnC" idx="{@idx}">' +
                                        '<div class="' + btnCls.join(' ') + '" style="' + btnStyle + '">' +                             // Button (including optional glass effect)
                                            '<div class="{@iconClass}" style="{@iconStyle}">' +                                         // Icon Container
                                                '<div class="ttl" style="color:' + fmt.c + ';">{@txt}</div>' +                          // Title
                                            '</div>' +
                                        '</div>' +
                                    '</div>';
                    }
                    
                    return btnMarkup;
                },
                
                getItemProps: function getItemProps(item, idx) {
                    var iconStyle = '',
                        iconClass = '';
                
                    // Do we have a custom icon?
                    if (item.icn) {
                        // Add the background-image url to the iconStyle.
                        iconStyle = 'background-image: url(' + item.icn + ');';
                    } else {
                        // Add a class to the iconClass.
                        iconClass = ' ic' + (item.act || item.st);
                    }
                    
                    return {
                        idx: idx,
                        txt: item.txt,
                        iconStyle: iconStyle,
                        iconClass: iconClass
                    };
                },
                
                onRender: function onRender() {
                    var itemsContainerNode = this.itemsContainerNode,
                        items = itemsContainerNode.childNodes,
                        cnt = items.length,
                        i = 0;

                    // Do we have more than 4 homescreen items?
                    if (i > 4) {
                        // Iterate items.
                        for (; i < cnt; i++) {
                            // Ellipsize item caption.
                            this.parent.ellipsize('ttl', items[i].firstChild.firstChild.firstChild, true);
                        }
                    }
    
                    // Create clearing DIV.
                    var clearDiv = document.createElement('div');
                    clearDiv.className = 'clear-me';
                    
                    // Append clearing DIV to the items container node.
                    itemsContainerNode.appendChild(clearDiv);
                }
            },
                                 
            addChildren: function addCh(c, idx, silent) {
                var children = this._super(c, idx, silent);
                
                if (children) {
                    // Attach an event listener to hear when the user selects a button.
                    this.contentChild.attachEventListener('selectionChange', this.id, function (evt) {
                        
                        // was an item added to the selection?
                        if ( evt.added ) {
                            // Get the clicked item.
                            var item = this.contentChild.items[evt.added];
    
                            this.controller.execAction({
                                type: item.act || 'Object',
                                st: item.st,
                                did: item.did,
                                pid: item.pid,
                                csp: !!item.csp
                            });
                        }
                    });
                }
                
                return children;
            },
            
            setData: function setData(hsc) {
                // Store the homescreen config silently so that we avoid firing off the handler.
                this.cfg = hsc;
            },
                   
            onRender: function onRender() {
                this.oncfgChange();
            },
            
            /**
             * Updates the title and button list with the new device configuration.
             */
            oncfgChange: function oncfgChange() {
                var cfg = this.cfg,
                    fmt = cfg.fmt,
                    bg = fmt.bg,
                    screenList = this.contentChild;
                
                // Do we NOT have a list dom node?
                if (!screenList.domNode) {
                    // Nothing to do.
                    return;
                }

                // Update the title.
                this.title.set('text', cfg.ttl);
                
                // Update the btn format and items.
                screenList.set('btnFmt', fmt.btn);      // Need to do this before setting items so the newly rendered items will have the correct format.
                screenList.set('items',  cfg.btns);
                
                // Update the background formatting (need to do this after setting the items).
                if (bg) {
                    // Default to solid background color.
                    var background = bg.v,
                        bgStyle = screenList.domNode.style;
                    
                    // Is the background an images?
                    if (bg.tp !== 1) {
                        // Create image background value.
                        background = 'transparent url(' + background + ') no-repeat 0 0';
                        
                        // Set background size.
                        bgStyle.backgroundSize = '100%';
                    }
                    
                    // Set background.
                    bgStyle.background = background;
                }
            }             
        }
    );
        
}());