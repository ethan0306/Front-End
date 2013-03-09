(function(){

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
            this.target[methodName](touch.delta.x);
        }
    }
    
    /**
     * A Mobile Report Service layout selector "dot" style widget.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.MobileRWLayoutSelector = mstrmojo.declare(

        mstrmojo.Container,
        
        [ mstrmojo._TouchGestures, mstrmojo.android._IsLayoutSelector ],
        
        /**
         * @lends mstrmojo.MobileRWLayoutSelector.prototype
         */
        {
            scriptClass: "mstrmojo.MobileRWLayoutSelector",
            
            markupString: '<div id="{@id}" class="mstrmojo-MobileLayoutSelector {@cssClass}" style="{@cssText}">' +
                              '<div></div>' +
                              '<div class="btns">{@_btnMarkup}</div>' +
                          '</div>',

            markupSlots: {
                containerNode: function () { return this.domNode.firstChild; },
                btnNode: function(){ return this.domNode.lastChild; }
            },
            
            children: [{
                scriptClass: 'mstrmojo.Label',
                alias: 'selectedTitle'
            }],
            
            /**
             * Builds the dot markup.
             * 
             * @ignore
             */
            renderSelector: function renderSelector(layouts, currentLayout) {
                var length = layouts && layouts.length,
                    btnNode = this.btnNode,
                    title, btnMarkup, i;
                
                // Do we have more than one layout?
                if (length && length > 1) {
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
                    btnMarkup = '<div style="width:' + (length * 38) + 'px" class="mstrmojo-SelectorBtns">' + buttons.toString() + '</div>';
                }
                
                // Set the title from the current model.
                this.selectedTitle.set('text', title || '');
                
                // Cache button markup.
                this._btnMarkup = btnMarkup || '';
                
                // Do we already have a button node?
                if (btnNode) {
                    // Set the inner HTML of the button node to the button markup.
                    btnNode.innerHTML = this._btnMarkup;
                }                
            },
            
            touchTap: function (touch) {
//                // DEBUG: This code simulates a swipe in the hosted environment.
//                // ********** DO NOT CHECKIN UNCOMMENTED ***********************
//                var x = 1,
//                    me = this,
//                    evt = {
//                        delta: {
//                            x: -20
//                        }
//                    };
//                
//                this.touchSwipeBegin(evt);
//                var h = window.setInterval(function() {
//                    x++;
//                    
//                    evt.delta.x = x * -20;
//                    me.touchSwipeMove(evt);
//                    
//                    if (x > 15) {
//                        window.clearInterval(h);
//                        me.touchSwipeEnd(evt);
//                    }
//                }, 50);
//                return;
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