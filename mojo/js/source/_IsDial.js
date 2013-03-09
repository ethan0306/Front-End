(function(){

    mstrmojo.requiresCls(
        "mstrmojo.css", 
        "mstrmojo.fx.AnimateProp");
    
    var _C = mstrmojo.css;

    /**
     * Creates white space above & below the items list in order to allow the items to scroll to the vertical
     * center.
     * @param {mstrmojo.Dial} me The widget whose padding is to be set.
     * @private
    function _padItems(me) {
        // TO DO: call this function whenever the widget gets resized.
        var h = parseInt(me.scrollboxNode.clientHeight/2,10),
            s = me.spacerNode.style;
        s.marginTop = h+'px';
        s.marginBottom = h+'px';
        me.spacerMargin = h;
    }
     */

    var scrollStep = 10; // when mouse over up/down button, Dial will scroll up/down 10 pixels at one time till mouse out button.

    /**
     * <p>Scrolls the scrollboxNode of a given Dial a given scrollTop coordinate.</p>
     *
     * <p>If the given Dial has "animate" set to true, and has a "scrollEffect" property,
     * then that effect is used to animate the scrolling; otherwise, the scrollTop is
     * simply set directly. Regardless, rendering of items on scroll is temporarily paused
     * while the scrolling occurs, and then resumes after the scrolling is complete.</p>
     *
     * @param {mstrmojo.Dial} me The widget whose scrollboxNode is to be scrolled.
     * @param {Integer} y The scrollTop coordinate to be scrolled to.
     * @param {Function} [callback] A function to call after the scrolling is done.
     * @private
     */
    function _scrollTo(me, y, callback) {
 
        me.pauseScrollRendering(true);
 
        var sbn = me.scrollboxNode,
            fx = me.animate ? me.scrollEffect : null;

        if (fx && fx.play) {
            if (fx.isPlaying) {
                fx.cancel();
            } 
            fx.props = {
                scrollTop: {start: sbn.scrollTop, stop: y, isStyle: false}
            };
            fx.onEnd = function(){
                me.pauseScrollRendering(false, null, callback);
            };
            fx.play();
        } else {
            sbn.scrollTop = y;
            me.pauseScrollRendering(false, null, callback);
        }
    }

    /**
     * <p>Sets the scroll coordinate in order to center the item at the given index vertically.</p>
     *
     * <p>If rendering on scroll is enabled, additional items may be rendered after this scroll,
     * thereby causing the given item to move away from the vertical center. To remedy that,
     * this method sets up a post-scroll callback to itself, which will check if the item
     * has moved away from center, and if so, re-centers it. In order to avoid infinite loops,
     * a counter is kept to limit the number of callback loops.</p>
     *
     * @param {mstrmojo.Dial} me The widget whose list is to be centered.
     * @param {Number} idx The index of the item to center.
     * @param {Integer} [counter=0] Internal track of callbacks; used to limit callbacks by this function to itself.
     * @private
     */
    function _centerItem(me, idx, counter) {
        var LIMIT = 4;
        if (!counter) {
            counter = 0;
        }
        // If incr rendering is used, make sure we have rendered a block of items surrounding
        // the item we are about to center. This improves our chances that re-centering the
        // view will not trigger much incr rendering nearby the item, thus causing it to move
        // away from the center after we scroll to it.
        var half = Math.round(me.renderBlockSize/2);
        me.fillAt(Math.max(0, idx - half), idx + half);
                        
        // Now measure the y-coord of the item to be centered, and scroll to it.    
        var icn = me.itemsContainerNode,
            it = icn.childNodes[idx],
            //itTop = it.offsetTop - icn.firstChild.offsetTop,
            itTop = me.listMapper.itemOffsetTop(me, icn, null, it),
            y = parseInt(me.scrollboxNode.clientHeight/2,10) - it.offsetHeight/2,
            yTo = Math.max(0, me.spacerMargin + itTop - y);
        if (Math.abs(me.scrollboxNode.scrollTop - yTo) > 2) {
            _scrollTo(me, 
                yTo,
                me.renderOnScroll ?
                    function() {
                        if (counter <= LIMIT) {
                            _centerItem(me, idx, counter++);
                        }
                    }
                    : null
                );
        } else {
            // Check if other animation (e.g., from _centerAll) is in progress. If so,
            // it has coincidentally centered the item for us, and we should now abort it before it moves the
            // item any further.
            var fx = me.animate ? me.scrollEffect : null;
            if (fx && fx.isPlaying && fx.cancel) {
                fx.cancel();
                me.pauseScrollRendering(false);
            }
        }
    }

    function _getItemsHeight(me) {
        // Issue: For some reason, itemsContainerNode.offsetHeight includes the padding of the parent (spacerNode),
        // which we don't want.  So to measure the height accurately, we measure the difference between the
        // last and first item plus the last item's height.
        var icn = me.itemsContainerNode,
            l = icn.lastChild,
            h = l ? l.offsetTop + l.offsetHeight - icn.firstChild.offsetTop : 0;
        return h;
}
    /**
     * <p>Sets the scroll coordinate in order to center the list vertically.</p>
     *
     * <p>If the list is too tall to fit within the scrollbox's viewport, we top-align the first item; otherwise
     * we center the list within the viewport. However, if we are rendering the list incrementally, some of the
     * list may not be rendered yet and changing the scrollTop could trigger more rendering.</p>
     *
     * @param {mstrmojo.Dial} me The widget whose list is to be centered.
     * @private
     */
    function _centerAll(me) {
        // Center the items vertically; however, dont let the first item scroll up above the viewport.
        var h = _getItemsHeight(me),
            diff = Math.max(0, 
                    parseInt((me.scrollboxNode.clientHeight-h)/2, 10)
                );
        _scrollTo(me, Math.max(0,me.spacerMargin - diff));
    }
    
    /**
     * <p>Centers the selected item, if any; otherwise, centers the entire list of items.</p>
     *
     * <p>Assumes rendering has been inserted into DOM document & can be measured.</p>
     *
     * @param {mstrmojo.Dial} me The widget whose padding is to be set.
     * @private
     */
    function _center(me) {
        // Set a boolean on the widget indicating whether or not it has a selection.
        // Typically this causes a CSS change, which needs to be applied first before we center the DOM.
        var idx = me.selectedIndex,
            has = idx > -1;
        me.set("hasSelection", has);
        if (!me.domNode) {	// We wish to call this method during rendering cycle, before hasRendered = true.
            return;
        }
        if (has) {
            // Center that item.
            _centerItem(me, idx);
        } else {
            // Center the entire list.
            _centerAll(me);
        }
    }
    
    /**
     * Updates up/down arrow's visibility
     * @private
     */
    function _updateUpDownArrowVis (me){
        var sb = me.scrollboxNode,
            h = _getItemsHeight(me),
            vis = h > sb.clientHeight/2;
            _C.toggleClass(me.upArrowNode, ['enabled'], vis);
            _C.toggleClass(me.downArrowNode, ['enabled'], vis);
    }
    /**
     * scroll the list to jump up/down certain pixels.
     * 
     * @param {mstrmojo.Dial} me The widget which is going to be scrolled.
     * @param {Integer} the number of pixels to scroll. Positive number is to scroll down; negative number is to scroll up.
     */
    function _jumpTo (me, p) {
        var sb = me.scrollboxNode;
        sb.scrollTop = Math.min(Math.max(sb.scrollTop + p , 0), sb.scrollHeight - sb.offsetHeight);
    }
    
    function _fireJumps(me, up){
        if (!me._scrollInter){
            var p = scrollStep * (up ? -1:1);
            me._scrollInter = window.setInterval(
                                    function() {
                                        _jumpTo(me, p);
                                    }, 
                                    50);    // was 100, too sluggish
        }
    }
    
    function _stopJumps(me){
        if (me._scrollInter) {
            window.clearInterval(me._scrollInter);
            me._scrollInter = null;
        }        
    }
    
    /**
     * <p>Mixin that provides a list widget with the properties and methods of a dial widget.</p>
     *
     * <p>A "dial" widget is a single-select list whose items scroll vertically (with animation), and
     * whose selected item is aligned vertically in the middle of the list.  If there is no selection,
     * the entire list is vertically centered, unless it is taller than the viewport, in which case it
     * is aligned with the top of the viewport.</p>
     *
     * @class
     * @public
     */
    mstrmojo._IsDial = mstrmojo.provide(
        "mstrmojo._IsDial",
        /**
         * @lends mstrmojo._IsDial#
         */
        {    
            /**
             * @ignore
             */
            markupString:'<div id="{@id}" class="mstrmojo-Dial {@cssClass}" style="position:relative;">'
                + '<div class="mstrmojo-Dial-uparrow"  ' 
                + 'onmouseover="mstrmojo.all.{@id}.onmouseoverarrow(self, arguments[0], true)" ' 
                + 'onmouseout="mstrmojo.all.{@id}.onmouseoutarrow(self, arguments[0], true)" '
                + 'onclick="mstrmojo.all.{@id}.onclickarrow(self, arguments[0], true)" '
                + 'onmousedown="mstrmojo.all.{@id}.onmousedownarrow(self, arguments[0], true)" '
                + 'onmouseup="mstrmojo.all.{@id}.onmouseuparrow(self, arguments[0], true)"'
                + '></div>'
                +'<div class="mstrmojo-Dial-scrollbox {@cssClass}" style="position:relative;{@cssText}" mstrAttach:mousedown,mouseup>'
                    + '<div class="mstrmojo-Dial-spacer" style="{@spacerCssText}">'
                        + '<div class="mstrmojo-Dial-itemsContainer" style="position:relative;{@itemsContainerCssText}">{@itemsHtml}</div>'
                    + '</div>'
                + '</div>'    
                + '<div class="mstrmojo-Dial-dnarrow" '
                    + 'onmouseover="mstrmojo.all.{@id}.onmouseoverarrow(self, arguments[0], false)" '
                    + 'onmouseout="mstrmojo.all.{@id}.onmouseoutarrow(self, arguments[0], false)" '
                    + 'onclick="mstrmojo.all.{@id}.onclickarrow(self, arguments[0], false)" '
                    + 'onmousedown="mstrmojo.all.{@id}.onmousedownarrow(self, arguments[0], false)" '
                    + 'onmouseup="mstrmojo.all.{@id}.onmouseuparrow(self, arguments[0], false)"'                                
                    + '></div>'
            + '</div>',
            
            /**
             * @ignore
             */
            markupSlots: {
                scrollboxNode: function(){return this.domNode.childNodes[1];},
                spacerNode: function(){return this.domNode.childNodes[1].firstChild;},
                itemsContainerNode: function(){return this.domNode.childNodes[1].firstChild.firstChild;},
                upArrowNode: function() { return this.domNode.childNodes[0];},
                downArrowNode: function() {return this.domNode.childNodes[2];}
            },
            
            /**
             * @ignore
             */
            markupMethods: {
                onvisibleChange: function(){this.domNode.style.display = this.visible ? 'block' : 'none';},
                onhasSelectionChange: function(){_C.toggleClass(this.domNode, ["hasSelection"], !!this.hasSelection);}
            },
            
            /**
             * @ignore
             */
            animate: true,
            
            /**
             * @ignore
             */
            itemsEffect: {
                scriptClass: "mstrmojo.fx.AnimateProp",
                duration: 500,
                interval: 25,
                slot: "itemsContainerNode",
                preStart: function(){
                    var t = this.widget[this.slot],
                        w = (t && t.offsetWidth) || 0;
                    this.props = w ?
                        {
                            left: {start: -w, stop: 0, suffix: 'px', isStyle: true}
                        } : {};
                },
                revertOnCancel: false
            },

            /**
             * @ignore
             */
            scrollEffect: {
                scriptClass: "mstrmojo.fx.AnimateProp",
                duration: 250,
                interval: 25,
                slot: "scrollboxNode",
                revertOnCancel: false
            },
            
            /**
             * Dial centers it selection vertically, and assumes at most one selected index.
             * @ignore
             */
            multiSelect: false,
            
            /** Jump only when mouse over the up/down arrow and hold the left mouse key.
             *  Stop jumping when either mouse out or release the left mouse key. 
             */
            holdJumpOnly: true, //TQMS 416453: scroll only when press and hold mouse.

            /**
             * @ignore
             */
            audibles: {"*": true, hasSelection: false},

            /**
             * <p>Computes sufficient amount of white space needed above & below the list items
             * in order to allow them to scroll to the vertical center of the dial.<p>
             *
             * <p>The result is stored in the properties spacerMargin (as an integer) and spacerCssText
             * (as a CSS margin-top setting so it can be used in the markup string) for future reference.</p>
             */
            initSpacer: function inSp(){
                var m = (this.cssText||'').match(/height:\s*(\d*)px/);
                if (m) {
                    this.spacerMargin = parseInt(Number(m[1])/2,10);
                    var mg = this.spacerMargin + 'px';
                    this.spacerCssText = 'padding-top: ' + mg + '; padding-bottom: ' + mg + ';';
                } else {
                    this.spacerMargin = 0;
                    delete this.spacerCssText;
                }
            },
            
            /**
             * <p>Vertically centers the current selected index, if any; otherwise centers the entire list.</p>
             */
            center: function ctr(){
                _center(this);
            },

            /**
             * <p>Extends the inherited method by creating enough white space above & below the list items
             * in order to allow them to scroll to the vertical center of the dial.</p>
             */
            preBuildRendering: function() {
                this.initSpacer();
                
                return this._super();
            },
            
            /**
             * <p>Extends the inherited method by creating enough white space above & below the list items
             * in order to allow them to scroll to the vertical center of the dial; and centers the items
             * vertically if both the following conditions are met:</p>
             * <ul>
             * <li>all items have been rendered, and</li>
             * <li>there are no selections.</li>
             * </ul>
             */
            postBuildRendering: function pstBR(){
                // Let the inherited method render the first block of items, if needed.
                this._super();

                // Position the list appropriately.
                this.center();
                
                // enable up/down buttons if list is too long.
                _updateUpDownArrowVis(this);
            },
                 
            refreshScroll: function refresh(){
                this.center();                       
                _updateUpDownArrowVis(this);      
            },
            
            /**
             * <p>Extends the inherited method in order to vertically center the selected item, if any.</p>
             */
            prechange: function pchg(evt) {
                // First let the inherited method mark the item as selected/unselected.
                this._super(evt);

                // Position the list appropriately.
                if (this.hasRendered) {
                    // Multiselect lists shouldnt re-center when you only unselect something; it looks weird.
                    if (!this.multiSelect || (evt && evt.added && evt.added.length)) {
                        this.center();
                    }
                }
            },
            onclickarrow: function oca(win, evt, up){
                _jumpTo(this, scrollStep * (up? -1:1));
            },
            onmouseoverarrow: function mov(win, evt, up){
                if(!this.holdJumpOnly) {
                    _fireJumps(this,up);
                }
            },
            onmouseoutarrow: function mou (win, evt, up){
                _stopJumps(this);
            },
            onmousedownarrow: function onmousedownarrow(win, evt, up){
                if(this.holdJumpOnly){
                    _fireJumps(this, up);
                }
            },
            onmouseuparrow: function onmouseuparrow(win, evt, up){
                _stopJumps(this);
            }
        }
    );
})();
