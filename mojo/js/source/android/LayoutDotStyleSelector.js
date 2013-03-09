(function () {

    mstrmojo.requiresCls("mstrmojo.Container",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.android._IsLayoutSelector",
                         "mstrmojo.Label");
    
    /**
     * Returns a function for handling (by passing) touch event commands to the target.
     * 
     * @param {String} methodName The name of the method to call on the target (passing the x delta from the touch event as the only parameter).
     * 
     * @private
     */
    function getTouchCmdFn(methodName) {
        return function (touch) {
            this.target[methodName](touch);
        };
    }
    
    /**
     * A Mobile Report Service layout selector "dot" style widget.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.android.LayoutDotStyleSelector = mstrmojo.declare(

        mstrmojo.Container,
        
        [ mstrmojo._TouchGestures, mstrmojo.android._IsLayoutSelector ],
        
        /**
         * @lends mstrmojo.android.LayoutDotStyleSelector.prototype
         */
        {
            scriptClass: "mstrmojo.android.LayoutDotStyleSelector",
            
            markupString: '<div id="{@id}" class="mstrmojo-MobileLayoutSelector DotStyle {@cssClass}" style="{@cssText}">' +
                              '<div></div>' +
                              '<div class="btns">{@_btnMarkup}</div>' +
                          '</div>',

            markupSlots: {
                containerNode: function () { return this.domNode.firstChild; },
                btnNode: function () { return this.domNode.lastChild; }
            },
            
            children: [{
                scriptClass: 'mstrmojo.Label',
                alias: 'selectedTitle'
            }],
            
            /**
             * Builds the layout selector portion of this widget.
             * 
             * @param {mstrmojo.MobileDocLayoutViewer[]} layouts The collection of layouts that can be displayed.
             * @param {mstrmojo.MobileDocLayoutViewer} currentLayout The currently displayed layout.
             */
            renderSelector: function renderSelector(layouts, currentLayout) {
                var length = layouts && layouts.length,
                    btnNode = this.btnNode,
                    btnWidth = 38,
                    dpi = mstrMobileApp.getDeviceDPI(),
                    title, 
                    btnMarkup, 
                    i;
                
                // Is this a low-dpi device?
                if (dpi === 120) {
                    btnWidth = 26;
                } else if (dpi === 320) {
                    btnWidth = 57;
                }
                
                // Do we have more than one layout?
                var multiLayouts = this._super(layouts, currentLayout);
                if (multiLayouts) {
                    title = currentLayout.n || '&nbsp;';
                    
                    // Iterate layouts and create markup.
                    var buttons = new mstrmojo.StringBuffer();
                    for (i = 0; i < length; i++) {
                        buttons.append('<div class="');
                        
                        // Is this the selected layout?
                        if (currentLayout.k === layouts[i].k) {
                            buttons.append('on');
                        }
                        
                        buttons.append('"><div></div></div>');
                    }
                    
                    // Create buttons and button container.
                    btnMarkup = '<div style="width:' + (length * btnWidth) + 'px" class="mstrmojo-SelectorBtns">' + buttons.toString() + '</div>';
                }
                
                // Toggle the selector display.
                this.toggleSelectorDisplay(multiLayouts);
                
                // Set the title from the current model.
                this.selectedTitle.set('text', title || '');
                
                // Cache button markup.
                this._btnMarkup = btnMarkup || '';
                
                // Do we already have a button node?
                if (btnNode) {
                    // Set the inner HTML of the button node to the button markup.
                    btnNode.innerHTML = this._btnMarkup;
                    
                    // Hack for ICS to repaint the selector - there seems to be an issue when updating html using innerHTML causing
                    // the web view to not update. TODO: Should we check for ics so we don't hinder performance on other devices?
                    var table = document.createElement('table'),
                        node = this.domNode;
                    
                    node.appendChild(table);
                    
                    window.setTimeout(function() {
                        node.removeChild(table);
                    }, 100);
                }                
            },
            
            touchBegin: function touchBegin(touch) {
                return !this.target.isAnimating();
            },
            
            touchTap: function () {
                this.target.showNextLayout();
            },
            
            /**
             * Begins the swipe action to select a new layout.
             * 
             * @param {Object} touch The touch event.
             * 
             * @ignore
             */
            touchSwipeBegin: getTouchCmdFn('beginScroll'),
            
            /**
             * Continues the previously initiated swipe action to select a new layout.
             * 
             * @param {Object} touch The touch event.
             * 
             * @ignore
             */
            touchSwipeMove: getTouchCmdFn('scroll'),
            
            /**
             * Completes the previously initiated swipe action to select a new layout.
             * 
             * @param {Object} touch The touch event.
             * 
             * @ignore
             */
            touchSwipeEnd: getTouchCmdFn('endScroll')
        }
    );
}());