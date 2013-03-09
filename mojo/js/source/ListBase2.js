(function(){
        
    mstrmojo.requiresCls(
        "mstrmojo.boxmodel",
        "mstrmojo.array",
        "mstrmojo.hash",
        "mstrmojo.dom",
        "mstrmojo.css",
        "mstrmojo.Widget",
        "mstrmojo.Arr",
        "mstrmojo._HasLayout",
        "mstrmojo._ListBase2Selections",
        "mstrmojo.ListSelector",
        "mstrmojo._TouchScrolling",
        "mstrmojo._PagingList");

    var _H = mstrmojo.hash,
        _A = mstrmojo.array,
        _B = mstrmojo.boxmodel,
        _D = mstrmojo.dom;
    /**
     * Helper function to call a method in the listSelector delegate.
     * @private
     */
    function _callSelector(w, fn, evt) {
        var s = w.listSelector;
        if (s) {
            s[fn](w, w.itemsContainerNode, evt);
        }
    }
    
    function _lastPagePos(me, dragId){
        var lpp = me.lastPagePos;
        // If we've already measured before during this same drag, no need to re-measure.
        if (!lpp || lpp.dragId !== dragId) {
            lpp = _B.offset(me.itemsContainerNode);
            lpp.dragId = dragId;
            me.lastPagePos = lpp;
            var sbn = me.scrollboxNode;
            me.lastScrollPos = {
                left: sbn.scrollLeft, 
                top: sbn.scrollTop,
                width: sbn.clientWidth,
                height: sbn.clientHeight
            };
        }
    }
    
    /**
     * Computes the index at which an item would be inserted if it were dropped in the given drag context.
     * @param {mstrmojo.ListBase2} me The list widget.
     * @param {Object} c The dragging context's source or target object (provided by the mstrmojo.dnd controller).
     * @param {Boolean} [cache=true] If not exactly false, this method will attempt to reduce unnecessary changes
     * to dropCuePos by reusing the last one when possible.
     * @private
     */
    function _whereDrop(me, c, cache){
        // Inspect the drop DOM target.
        var el = c && c.node;
            
        // Are we dropping onto the dropCue?
        if (el === me.dropCueNode || el === me.dropCueNode.firstChild) {
            // Leave the dropCue position unchanged.
            return me.dropCuePos;
        }

        // Ask the listMapper to map the drop to a list item index.
        // Provide it with the event pageX,Y and the scrollboxNode's pageX,Y offset.
        var lm = me.listMapper;
        var at = lm && lm.whereDrop(
                        me, 
                        me.itemsContainerNode, 
                        el, 
                        c.pos, 
                        {
                            left: me.lastPagePos.left - me.lastScrollPos.left,
                            top: me.lastPagePos.top - me.lastScrollPos.top,
                            width: me.lastScrollPos.width,
                            height: me.lastScrollPos.height
                        });
        // Performance optimization: Compare the previous drop position; if it hasn't changed, dont modify
        // the object reference, because that will cause an unnecessary repaint.
        var atWas = me.dropCuePos;
        return ((cache !== false) && atWas && at && (atWas.idx === at.idx) && (atWas.left === at.left) && (atWas.top === at.top)) ?
                atWas : at;
    }    

    var _AEL = "attachEventListener";
    
    /**
     * Makes the given items array observable if the given widget's makeObservable property is true.
     * @param {mstrmojo.ListBase2} me The list widget.
     * @param {Array} [its] The items array, possibly null or empty.
     * @return {Array} The given array, made observable. If null was given, an empty observable array is returned.
     */
    function _initItems(me, its) {
        if (me.makeObservable) {
            // Make the items array observable.
            its = its || [];
            if (!its[_AEL]) {
                mstrmojo.hash.make(its, me.itemsScriptClass || mstrmojo.Arr);
            }
        }
        return its;
    }

    /**
     * If the given items list is observable, attaches add/remove listeners.
     * @private
     */
    function _attItems(me, its) {
        if (its && its[_AEL]) {
            me._sub_its = its;
            me._sub_add = its[_AEL]("add", me.id, "preadd");
            me._sub_rmv = its[_AEL]("remove", me.id, "preremove");
        }
    }
    
    /**
     * Detaches the current add/remove item listeners, if any.
     * @private
     */
    function _detItems(me){
        // Assumes the currently attachments are cached in _sub_XXX properties.
        if (me._sub_its) {
            var p = mstrmojo.publisher;
            p.unsubscribe(me._sub_add);
            p.unsubscribe(me._sub_rmv);
            delete me._sub_add;
            delete me._sub_rmv;
            delete me._sub_its;
        }
    }
    
    
    /**
     * <p>A Widget which displays an array of data "items" in a single-column table with vertical orientation.</p>
     *
     * @class
     */
    mstrmojo.ListBase2 = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        [ mstrmojo._ListBase2Selections, mstrmojo._TouchScrolling, mstrmojo._PagingList, mstrmojo._HasLayout ],
        // instance members
        /**
         * @lends mstrmojo.ListBase2.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.ListBase2",
            
            /**
             * <p>The list of data items, each of which may be of any data type. Typically each item is an Object.</p>
             * @type Array
             */
            items: null,

            /**
             * @ignore
             */
            markupString: '<div id="{@id}" class="mstrmojo-ListBase2 {@cssClass}" style="position:relative;{@cssText}" mstrAttach:mousedown,mouseup>'
                            + '<div class="mstrmojo-ListBase2-itemsContainer" style="position:relative;{@itemsContainerCssText}">{@itemsHtml}</div>'
                            + '<div class="mstrmojo-ListBase2-dropCue {@cssClass}"><div class="mstrmojo-ListBase2-dropCue-inner"></div></div>'
                            + '</div>',
            
            /**
             * @ignore
             */
            markupSlots: {
                scrollboxNode: function(){return this.domNode;},
                itemsContainerNode: function(){return this.domNode.firstChild;},
                dropCueNode: function(){return this.domNode.lastChild;}
            },
            
            /**
             * @ignore
             */
            markupMethods: {
                onvisibleChange: function(){this.domNode.style.display = this.visible ? 'block' : 'none';},
                ondropCuePosChange: function(){
                    var dcn = this.dropCueNode,
                        s = dcn && dcn.style;
                    if (!s) {
                        return;
                    }
                    var pos = this.dropCuePos,
                        vis = !!pos;
                    if (vis) {
                        s.left = pos.left + 'px';
                        s.top = pos.top + 'px';
                    }
                    s.display = vis ? 'block' : 'none';
                },
                onpageChange: function() {
                    if (this.usePaging && !this._inScroll) {
                        this._inPaging = true;
                        this.listMapper.toPage(this, this.page);
                        this._inPaging = false;
                    }
                }
            },
            
            /*
             * If true, this widget will automatically hide itself when its items array is empty.
             * @type Boolean
             */
            autoHide: false,
            
            /**
             * <p>If true, List will render the items as they scroll into view; otherwise, all items are
             * rendered immediately when the List is rendered.</p>
             * @type Boolean
             */
            renderOnScroll: false,
                                      
            /**
             * <p>Number of items that are rendered in the initial render.</p>
             *
             * <p>Typically this is set to an estimate of how many items will fit within the scrollboxNode, or more.
             * Since the rendering of the initial set tends to be faster than subsequent sets, this estimate
             * may err on the high side. For the best scrolling experience, use a value of approximately twice the
             * number of items that fit within the scrollbox.</p>
             *
             * @type Integer
             */                      
            firstRenderBlockSize: 50,

            /**
             * <p>Number of items that are rendered at a time during subsequent rendering (i.e., on scroll).</p>
             *
             * <p>Typically this is set to an estimate of how many items will fit within the scrollboxNode.
             * Since rendering during scroll events can make scrolling sluggish, this estimate may
             * err on the low side.</p>
             *
             * @type Integer
             */                      
            renderBlockSize: 50,

            /**
             * <p>The delegate object responsible for arranging the items in space.</p>
             *
             * <p>listMapper is an object which implements the following API:</p>
             * <dl>
             *   <dt>buildItemWrappers(node, items, builder, ctxt, first, last)</dt>
             *   <dd>Generates the markup string for the items container, and optionally fills in the markup for
             *   a given count of items at the start and end of the container.</dd>
             *   <dt>findScrollRange(node, itemCount, top, height, left, width)</dt>
             *   <dd>Computes the range of item indices which are located in the given scroll coordinates.</dd>
             *   <dt>fillItemWrappers(node, items, builder, ctxt, start, end, max)</dt>
             *   <dd>Fills in the markup for a given range of items.</dd>
             * </dl>
             * @type Object
             */
            listMapper: null,
            
            /**
             * <p>The delegate object responsible for generating the markup for an item.</p>
             * 
             * <p>listBuilder is an object which implements the following API:</p>
             * <dl>
             *   <dt>newContext(widget, ctxt, idx)</dt>
             *   <dd>Generates the markup string for a given item index.</dd>
             *   <dt>build(widget, ctxt, idx)</dt>
             *   <dd>Generates the markup string for a given item index.</dd>
             * </dl>
             * @type Object
             */
            listBuilder: null,
            
            /**
             * <p>The optional delegate object responsible for updating this list's selections in response
             * to DOM events in the list items. If not defined, this widget's selections will not respond to DOM events.</p>
             * 
             * <p>listSelector is an object which implements the following API:</p>
             * <dl>
             *   <dt>handleEvent(widget, hWin, e, config)</dt>
             *   <dd>Handles the DOM event and modifies this widget's selections (typically via
             *   an API that this widget exposes.</dd>
             * </dl>
             * @type Object
             */
            listSelector: mstrmojo.ListSelector,

            /**
             * If true, enables optional animation effects defined by the "xxxEffect" properties.
             * Otherwise, those properties are ignored.
             * @type Boolean
             */
            animate: false,

            /**
             * Optional effect to be played whenever items property is set.
             * @type Object
             */            
            itemsEffect: null,
            /**
             * <p>Extends the inherited method in order to initialize selections.</p>
             * @ignore
             */
            init: function init(props) {
                this._super(props);
                
                // Make the items array observable, if requested.
                this.items = this.initItems(this.items);
                
                var h = this.selectedIndices,
                    a = this.selectedIndicesList,
                    i = this.selectedIndex,
                    o = this.selectedItem;
                this.selectedIndices = {};
                this.selectedIndex = -1;
                delete this.selectedIndicesList;
                delete this.selectedItem;
                if (h || a || (i>-1) || o) {
                    this.initSelections(h, a, i, o);
                }
                
                // Customization hook:
                if (this.postInitItems) {
                    this.postInitItems();
                }
            },
                
            initItems: function initItems(its){
                return _initItems(this,its);
            },
            
            /**
             * <p>Extends the inherited rendering cycle to render the data items.</p>
             *
             * <p>Generates the "itemsHtml" property value (String), which will be inserted into the markup. The string
             * includes a wrapper DOM node for each item.  All the item wrappers are rendered at once. However,
             * the "renderOnScroll" property determines which item wrappers will be filled with actual item markup. 
             * If "renderOnScroll" is true, only an initial set of items' wrappers will be filled, and event listeners will 
             * be attached to the scrollbox to trigger subsequent rendering.  Otherwise, if "renderOnScroll" is false,
             * all item wrappers will be filled.</p>
             *
             * <p>To use "renderOnScroll" as true, the List must meet all the following requirements:</p>
             * <ul>
             * <li>It must define a "scrollboxNode" slot.</li>
             * <li>It must set "renderBlockSize" to a positive integer.</li>
             * </ul>
             */
            preBuildRendering: function preBR(){
                
                // Get a new context from the item builder.
                var lb = this.listBuilder,
                    c = lb.newContext(this);
                this.ctxtBuilder = c;

                // Compute how many items should be rendered initially (both at the top and bottom of the list).
                // renderOnScroll is only used if renderOnScroll AND we have a scrollboxNode and a renderBlockSize.
                var ms = this.markupSlots,
                    eros = !!(this.renderOnScroll && this.renderBlockSize && ms && ms.scrollboxNode),
                    its = this.items,
                    len = (its && its.length) || 0,
                    top = eros ? this.firstRenderBlockSize : len,
                    bot = eros ? this.firstRenderBlockSize : 0;
                this._eros = eros;
                this.paused = false;
                    
                // Render items container and possibly the first set of items.
                this.itemsHtml = this.listMapper.buildItemWrappers(
                                    its,
                                    lb,
                                    this,
                                    c,
                                    top,
                                    bot).join('');

                // Hide the items container until we've started the itemsEffect (if any).                
                this.itemsContainerCssText = 'visibility: hidden';
                
                if (this._super) {
                    this._super();
                }
            },
            
            /**
             * <p>Extends the inherited rendering cycle to render the data items.</p>
             *
             * <p>Generates the "itemsHtml" property value (String), which is then inserted into the markup. The string
             * includes a wrapper DOM node for each item.  All the item wrappers are rendered at once. However,
             * the "renderOnScroll" property determines which item wrappers will be filled. If "renderOnScroll" is true and
             * a scrollboxNode slot is specified, then only the item wrappers that are currently visible within the 
             * scrollboxNode will be filled, and event listeners will be attached to the scrollbox to trigger subsequent rendering; 
             * otherwise, if "renderOnScroll" is falsey, all item wrappers will be filled. If scrollboxNode is not defined, 
             * "renderOnScroll" is assumed to be false.</p> 
             */
            postBuildRendering: function pstBR(){
                // Cleanup from preBuildRendering.
                delete this.itemsHtml;

                // Let the listMapper do its cleanup (if any).
                var lm = this.listMapper;
                if (lm && lm.postBuildRendering) {
                    lm.postBuildRendering(
                        this.itemsContainerNode, 
                        this.items,
                        this.listBuilder,
                        this,
                        this.ctxtBuilder);
                }

                // If items list is observable, attach event listeners for add/remove.
                _attItems(this, this.items);
    
                // If rendering on scroll, attach scroll event listener.
                if (this._eros || this.usePaging) {
                    if (!this._cb_scroll) {
                        var id = this.id;
                        this._cb_scroll = function(){
                            var me = mstrmojo.all[id];
                            me.onscroll();
                        };
                    }
                    mstrmojo.dom.attachEvent(this.scrollboxNode, "scroll", this._cb_scroll);
                    // Ensure that the viewport was filled by that first initial render block
                    // after a brief timeout.  TO DO: should we skip the timeout here?
                    this.onscroll();
                }

                // Initialize the options effects for list items render & scroll (one-time only).
                if (this.animate) {
                    for (var i=0, fxs=['itemsEffect', 'scrollEffect'], len=fxs.length; i<len; i++) {
                        var n = fxs[i],
                            fx = this[n];
                        if (fx && fx.constructor === Object) {
                            fx = mstrmojo.insert(mstrmojo.hash.clone(fx));
                            fx.widget = this;
                            this[n] = fx;
                        }
                    }
    
                    // Start the items effect before showing the items.
                    if (this.itemsEffect) {
                        this.itemsEffect.play();
                    }
                }

                // Show the items.
                this.itemsContainerNode.style.visibility = 'inherit';                

                //#426519 - make sure entire item text is visible 
                if (this.itemsContainerNode.scrollWidth < this.domNode.scrollWidth) {
                    this.itemsContainerNode.style.width = this.domNode.scrollWidth + 'px';
                }
                
                if (this._super) {
                    this._super();
                }
            },

            /**
             * Extends the unrendering cycle to detach event listeners.
             */
            unrender: function unrn(ignoreDom){
                // Detach add/remove listener from items array.
                _detItems(this);
                
                // Detach scroll listener from DOM.
                if (this._eros) {
                    mstrmojo.dom.detachEvent(this.scrollboxNode, "scroll", this._cb_scroll);
                    delete this._cb_scroll;
                }
                // Cancel any itemsEffect or scrollEffect that is still playing.
                for (var i=0, ns=['itemsEffect', 'scrollEffect'], len = ns.length; i<len; i++){
                    var fx = this[ns[i]];
                    if (fx && fx.isPlaying) {
                        fx.cancel();
                    }
                }
                
                this._super(ignoreDom);
            },
            
            /**
             * Temporarily suspends the triggering of item rendering from scroll events.
             * Used to suppress rendering during scroll animation.
             * @param {Boolean} [pause=true] If true, pauses rendering on scroll; otherwise, resumes it.
             * @param {Function} [onInterval] Callback to be fired after each block of rendering. Used only when rendering is resumed, not paused.
             * @param {Function} [onComplete] Callback to be fired after final block of rendering. Used only when rendering is resumed, not paused.
             */
            pauseScrollRendering: function pau(pause, onInterval, onComplete) {
                // By default, the arg is true.
                if (pause !== false) {
                    pause = true;
                }
                if (this.paused === !!pause) {
                    return;
                }
                this.paused = !!pause;
                if (pause) {
                    // When starting a pause, clear any pending timeout to fill the viewport.
                    if (this._fillTmr) {
                        window.clearTimeout(this._fillTmr);
                        delete this._fillTmr;
                    }
                } else {
                    // When resuming after a pause, force a check of the viewport.
                    this.fill(onInterval, onComplete);
                }
            },
            
            /**
             * <p>Responds to scroll events in order to update the items DOM.</p>
             *
             * <p>Buffers the event -- meaning, sets up a timeout which will call
             * fire some time after the event. This is done because DOM can raise scroll events
             * repeatedly very quickly, and we dont want to overwhelm the CPU with our handler.</p>
             */
            onscroll: function scll() {
                // If scroll rendering is temporarily supressed, exit.
                if (this.paused) {
                    return;
                }
                if (this._eros) {
                    // If a timeout is already pending, do nothing; otherwise start a timeout.
                    if (!this._fillTmr) {
                        var me = this;
                        this._fillTmr = self.setTimeout(
                                            function(){
                                                me.fill();
                                                me = null;
                                            }, 50);
                    }
                }
                if (this._super) {
                    this._super();
                }
            },
            /**
             * <p>Updates the DOM of the items within the current viewport.</p>
             *
             * <p>Computes the start index and the end index of the items that are currently visible within the
             * scrollboxNode.  Then walks the items in that index range, rendering any item not already rendered, until
             * reaching either (i)the end of the range or (ii) the rendering count limit defined by the "renderBlockSize"
             * property, whichever comes first.</p>
             *
             * <p>Note that this method will render discontiguous items; the "renderBlockSize" limit is applied 
             * to the <i>count</i> of items rendered, not to their <i>index</i>.</p>
             * 
             * <p>After rendering items, this method sets a timeout to repeat the process only if the rendering
             * cycle was stopped by the "renderBlockSize" limit before it could reach the end index.</p>
             * @param {Function} [onInterval] Callback to be fired after each block of rendering.
             * @param {Function} [onComplete] Callback to be fired after final block of rendering.
             */
            fill: function fll(onInterval, onComplete){
                if (this._fillTmr) {
                    window.clearTimeout(this._fillTmr);
                    delete this._fillTmr;
                }
                
                // Determine which item indices to render.
                var len = (this.items && this.items.length)||0;
                if (!len) {
                    if (onComplete) {
                        onComplete();
                    }
                } else {
                    var sbn = this.scrollboxNode,
                    icn = this.itemsContainerNode,
                    off = mstrmojo.boxmodel.offset(icn, sbn),
                    im = this.listMapper,
                    idxs = im.findScrollRange(
                            icn, 
                            len, 

                            // Minor hack: need to send in scrollTop, but if this instance uses touches,
                            // the mstrmojo._TouchScrolling mixin's "pos" property may reflect our true scroll position, so use that instead.
                            (this.usesTouches && this.pos && parseInt(this.pos.y,10)) || sbn.scrollTop,

                            sbn.clientHeight,

                            // Minor hack: need to send in scrollLeft, but if this instance uses touches,
                            // the mstrmojo._TouchScrolling mixin's "pos" property may reflect our true scroll position, so use that instead.
                            (this.usesTouches && this.pos && parseInt(this.pos.x,10)) || sbn.scrollLeft,

                            sbn.clientWidth,
                            off.left,
                            off.top);

                    // Ensure the items are rendered, and if DOM was modified, come back to re-measure.   
                    if (this.fillAt(idxs.start, idxs.end)) {
                        if (onInterval) {
                            onInterval();
                        }
                        var id = this.id;
                        this._fillTmr = window.setTimeout(
                                        function(){mstrmojo.all[id].fill(onInterval, onComplete);},
                                        100);
                    } else {
                        if (onComplete) {
                            onComplete();
                        }
                    }
                }
            },
            
            /**
             * <p>Renders any items in a given range of indices which are not already rendered.</p>
             * @param {Integer} start The first index to be rendered.
             * @param {Integer} end The last index to be rendered.
             * @returns {Boolean} true if any items were newly rendered; false otherwise.
             */
            fillAt: function fllAt(start, end) {
                var im = this.listMapper;
                if (im) {
                    return im.fillItemWrappers(
                            this.itemsContainerNode, 
                            this.items,
                            this.listBuilder,
                            this,
                            this.ctxtBuilder,
                            start, 
                            end, 
                            this.renderBlockSize);
                } else {
                    return false;
                }
            },
            
            /**
             * <p>Adds a given set of items to this list's "items" array.</p>
             *
             * <p>This method ensure an event is raised and a repaint of the widget's UI will occur when the items are added.
             * Typically if the "items" array is not observable, simply inserting objects into the array will not raise an event
             * and therefore not repaint the widget's UI.  Therefore, this method handles that case by inserting the item into
             * a duplicate array, which is then re-set as the widget's "items" property value, thus forcing a repaint.</p>
             *
             * @param {Array} arr The items to be added.
             * @param {Integer} [at] Optional insertion index. If -1, the items are appended. If unspecified, the items are inserted
             * at the lowest selected index if any (otherwise, appended).
             * @return {Integer} The index at which the items were inserted. If not inserted, returns -1.
             */
            add: function add(arr, at){
                if (!arr || !arr.length) {
                    return -1;
                }
                
                var its = this.items;
                
                // Resolve the insertion index.
                if (at == null) {
                    // Find the lowest selected index.
                    at = _H.min(this.selectedIndices, false, true);
                    if (at !== null && at !== undefined) {
                        at ++;
                    }
                    
                }
                if (at == null || at === -1){
                    // Either nothing selected, or caller asks for -1; so append.
                    at = (its && its.length)|| 0;
                }

                if (its && its.add) {
                    // The items array is already observable, use its method.
                    its.add(arr, at);
                } else {
                    // Clone the items array, insert in the clone, and re-set items object reference.
                    this.set(
                        'items', 
                        its ? 
                            _A.insert(its.concat(), at, arr) :
                            arr
                    );
                }
                return at;
            },

            /**
             * <p>Handles an "add" event in this widget's items list.</p>
             *
             * <p>This callback is only triggered when the widget's items list is observable. It allows the widget
             * to insert the newly added items in its GUI.</p>
             *
             * @param {Object} evt The event object.
             * @param {Array} evt.value The newly added items.
             * @param {Integer} evt.index The index at which the new items were inserted.
             */
            preadd: function pa(evt){
                if (this.hasRendered) {
                    // Notify the list mapper, so it can update the item wrapper nodes.
                    var lm = this.listMapper;
                    if (lm) {
                        lm.onadd(this, this.itemsContainerNode, this.ctxtBuilder, evt);
                    }
                        
                    // Notify the list builder, so it can update the context if needed.
                    var lb = this.listBuilder;
                    if (lb) {
                        lb.onadd(this, this.ctxtBuilder, evt);
                    }
                    // Notify the list selector, so it can increment selected indices if needed.
                    var ls = this.listSelector;
                    if (ls) {
                        ls.onadd(this, evt);
                    }                    
                    // Refresh the GUI.
                    if (this._eros) {
                        // For render on scroll, refresh only the viewport.
                        this.onscroll();
                    } else {
                        // Otherwise, render the newly added items immediately.
                        var i = evt.index,
                            len = evt.value.length;
                        this.fillAt(i, i+len-1); 
                    }
                }
                // Customization hook.
                if (this.onadd) {
                    this.onadd(evt);
                }
                if (this._super) {
                    this._super(evt);
                }
            },            

            /**
             * <p>Removes a given set of items from this list's "items" array.</p>
             *
             * <p>This method ensure an event is raised and a repaint of the widget's UI will occur when the items are  removed.
             * Typically if the "items" array is not observable, simply removing objects from the array will not raise an event
             * and therefore not repaint the widget's UI.  Therefore, this method handles that case by removing the items from
             * a duplicate array, which is then re-set as the widget's "items" property value, thus forcing a repaint.</p>
             *
             * @param {Array|Integer|Object} arr Either an array of indices of items to be removed, or a single index, or a
             * single item. If no such items are found within this.items, this method does nothing.
             * @return {Integer} The index at which the first item was found; if not found, -1.
             */
            remove: function rmv(arr) {
                if (arr == null) {
                    return -1;
                }
                if (arr.constructor !== Array) {
                    return this._remove(arr);
                }
                var its = this.items;
                if (its) {
                    var i;
                    if (its.remove) {
                        for (i=arr.length-1; i>-1; i--) {
                            its.remove(arr[i], 1);
                        }
                    } else {
                        its = its.concat();
                        for (i=arr.length-1; i>-1; i--){
                            its.splice(arr[i], 1);
                        }
                        this.set("items", its);
                    }
                    return arr[0];
                }
                return -1;
            },
            
            /**
             * <p>Removes a given items from this list's "items" array.</p>
             *
             * <p>This method ensure an event is raised and a repaint of the widget's UI will occur when the item is removed.
             * Typically if the "items" array is not observable, simply removing objects from the array will not raise an event
             * and therefore not repaint the widget's UI.  Therefore, this method handles that case by removing the item from
             * a duplicate array, which is then re-set as the widget's "items" property value, thus forcing a repaint.</p>
             *
             * @param {Object|Integer} item Either the index of the item to be removed, or the item to be searched for and removed 
             * (if found). If not found, this method does nothing.
             * @return {Integer} The index at which the item was found; if not found, -1.
             */
            _remove: function rmv(item) {
                // TO DO: refactor into remove() method.
                var its = this.items;
                if (!its || (item == null)) {
                    return -1;
                }
                var idx;
                if (!isNaN(item)) {
                    // The given argument is the index.
                    idx = item;
                } else {
                    // The given argument is the item, search for its index.
                    idx = this.itemIndex(item);
                }                            
                if (idx > -1) {
                    // Item was found, now remove it.                
                    if (its.remove) {
                        // The items array is observable; use its method.
                        its.remove(idx, 1);
                    } else {
                        // Clone the items array, remove from the clone, and re-set items object reference.
                        its = its.concat();
                        its.splice(idx, 1);
                        this.set('items', its);
                    }
                }
                return idx;            
            },
            /**
             * <p> Dupicate an item and add it into the list.</p>
             * 
             * <p>This method will perform a deep clone of the item, and then add it into this list at the index specified by newIndex parameter.
             * If there is anything inside the config parameter, it will be copied over to the duplicated item.</p>
             * 
             * @param {Object|Integer} item Either the index of the item to be duplicated or the item to be duplicated.
             * @param {Integer} at Optional insertion index. If -1, the item is appended to the end of the list. If unspecified or null, the item is inserted
             * after the to be duplicated item.
             * @param {Object} config A hash table of properties to be copied over to the duplicated item before the item being inserted into the list.
             * 
             * @return {Integer} The index at which the duplicated item is inserted. Returns -1 when it failed in this method. 
             */
            duplicate: function dup(item, at, config){
                var its = this.items,
                    idx = -1;
                if (!its || (item == null)) {
                    return -1;
                }
                if (!isNaN(item)) {
                    // The given argument is the index.
                    if (at === null || at === undefined) {
                        // calculate the index which is behind the item to duplicate
                        at = item + 1;
                    }
                    item = its[item];
                } else {
                    if (at === null || at === undefined) {
                        // The given argument is the item.
                        at = this.itemIndex(item) + 1;
                    }
                }
                if (item) {
                    var it;
                    // duplicate
                    it = _H.copy(config, _H.clone(item));
                    // insert
                    idx = this.add([it], at);
                } 
                return idx;            
            },
            /**
             * <p>Handles a "remove" event in this widget's items list.</p>
             *
             * <p>This callback is only triggered when the widget's items list is observable. It allows the widget
             * to remove the newly removed items in its GUI.</p>
             *
             * @param {Object} evt The event object.
             * @param {Array} evt.value The newly removed items.
             * @param {Integer} evt.index The index at which the new items were removed.
             */
            preremove: function prm(evt){
                if (this.hasRendered) {
                    // Notify the list mapper, so it can update the item wrapper nodes.
                    var lm = this.listMapper;
                    if (lm) {
                        lm.onremove(this, this.itemsContainerNode, this.ctxtBuilder, evt);
                    }

                    // Notify the list builder, so it can update the context if needed.
                    var lb = this.listBuilder;
                    if (lb) {
                        lb.onremove(this, this.ctxtBuilder, evt);
                    }                        
                        
                    // Notify the list selector, so it can decrement selected indices if needed.
                    var ls = this.listSelector;
                    if (ls) {
                        ls.onremove(this, evt);
                    }                    

                    // Refresh the viewport if needed.
                    if (this._eros) {
                        this.onscroll();
                    }
                }
                // Customization hook.
                if (this.onremove) {
                    this.onremove(evt);
                }
                if (this._super) {
                    this._super(evt);
                }
            },
            
            /**
             * Moves a given set of items from their current location to another index.
             * @param {Array|Integer|Object} arr Either an array of indices of items to be moved, or a single index, or a
             * single item. If no such items are found within this.items, this method does nothing.
             * @param {Integer} idx The index at which the items should be inserted.
             * @return {Boolean} true if a move was performed, false otherwise.
             */
            move: function mv(arr, idx){
                // Helper function determines if the given arr is being moved from and to
                // the same spot. Currently assumes arr is contiguous; TO DO: support discontiguous set.
                function noMove(from, count){
                    return (idx >= from) && (idx <= from+count);
                }
                
                // Validate the given insertion index.
                var max = (this.items && this.items.length)||0;
                if (idx === -1 || idx == null || isNaN(idx)){
                    idx = max;
                } else {
                    idx = Math.min(idx, max);
                }
                
                // Build an array of the indices & items to be moved.
                var its, at, idxs, len;
                if (arr.constructor === Array) {
                    // We have an array of indices.
                    at = arr;
                    idxs = arr;
                    len = (at && at.length)||0;
                    if (noMove(arr[0], arr.length)) {
                        return false;
                    }
                    its = _A.get(this.items, arr);
                } else if (typeof(arr) === 'object') {
                    // We have a single list item object.
                    its = [arr];
                    len = 1;
                    // Search for the item by id field, if possible; otherwise by object reference.
                    at = this.itemIndex(its[0]);
                    idxs = [at];
                    if (noMove(at, 1)){
                        return false;
                    }
                } else {
                    // We have a single list item index.
                    at = arr;
                    idxs = [arr];
                    len = 1;
                    if (noMove(at,1)){
                        return false;
                    }
                    its = [this.items[at]];
                }
                
                // Decrement the insertion index by the number of items removed at or before that index.
                for (var i=0; i<len; i++){
                    if (idxs[i] <= idx){
                        idx--;
                    }
                }
                
                if(its[0] != null){//The moved items should not be empty
                    
                    // Remove the items to be moved.
                    this.remove(at);
                    
                    // Now reinsert the removed items at the adjusted index.
                    this.add(its, idx);
                }

                return true;
            },
            
            /**
             * Searches for a given list item in the "items" array.
             * @param {Object} item The item to be searched for in "items".
             * @return {Integer} The index of the item, if found; -1 otherwise.
             */
            itemIndex: function ix(item){
                if (item == null) { // null or undefined
                    return -1;
                }
                var f = this.itemIdField;
                return f ?
                        _A.find(this.items, f, item[f]) :
                        _A.indexOf(this.items, item);
            },
            
            /**
             * <p>Handler for an event indicating a change in selections.</p>
             *
             * <p>This handler notifies the listBuilder of the event, so that the listBuilder can update the
             * GUI if needed.</p>
             *
             * @param {Object} evt The event object representing the change in selections.
             * @param {Array} [evt.added] Array of indices which were added to the selections.
             * @param {Array} [evt.removed] Array of indices which were removed from the selections.
             * @private
             */
            prechange: function pchg(evt) {
                // Notify the listBuilder, if possible.
                if (this.hasRendered) {
                    var arr = [this.listBuilder, this.listMapper];
                    for (var i=0, len=arr.length; i<len; i++) {
                        var o = arr[i];
                        if (o && o.onchange) {
                            o.onchange(this, this.itemsContainerNode, this.ctxtBuilder, evt);
                        }
                    }
                }
            },
            
            /**
             * <p>If true, this widget will automatically make its "items" array observable whenever the "items" property
             * is set. If it is set to null, an observable empty array will be used.</p>
             *
             * <p>An array is made "observable" via the mstrmojo.hash.make method.  Typically that method is passed in the
             * array and a class constructor.  All the instance properties & methods for that class are then applied to
             * the array.  By default, the mstrmojo.Arr class is used; an alternative class can be specified by setting
             * the "itemsScriptClass" property to a class constructor.</p>
             * @type Boolean
             */
            makeObservable: false,
            
            /**
             * <p>Refreshes the items UI when the "items" property value is reset.</p>
             *
             * <p>This custom setter for "items" will call this widget's refresh method if the reference to the
             * "items" is reset.  It also implements the autoHide feature.</p>
             *
             * @param {String} n="items" The property whose value is to be set.
             * @param {Array} [v] Reference to the new items array, possibly null.
             * @returns {Boolean} true if the items object reference was changed; false otherwise.
             * @private
             */
            _set_items: function stits(n, v) {
                var was = this.items;
                v = this.initItems(v);
                this.items = v;
                if (was !== v) {
                    var me = this,
                        fn = function (){
                            // Setting items clears any prior selections.  Previously we only cleared
                            // selections that are out of bounds, but this breaks lists in popups
                            // that only have 1 item, yet need to have their selectedIndex reset to -1
                            // every time they are opened.
                            // me.clearSelect();

                            if (me.autoHide) {
                                me.set('visible', !!(v && v.length));
                            }
                            me = null;
                        },
                        hr = this.hasRendered;
                    if (hr) {
                        this.refresh(fn);
                    } else {
                        fn();
                    }
                }
                return was !== v;
            },
            
            /**
             * <p>Handles mousedown event by notifying "selector" helper object, which is responsible for updating
             * our selections.</p>
             *
             * @param {Object} evt A manufactured object representing the event.
             * @param {DomWindow} evt.hWin The window containing the clicked element.
             * @param {DomEvent} evt.e The click event.
             * @private
             * @ignore
             */
            premousedown: function pmd(evt){
                _callSelector(this, "premousedown", evt);
            },

            /**
             * <p>Handles mousedown event by notifying "selector" helper object, which is responsible for updating
             * our selections.</p>
             *
             * @param {Object} evt A manufactured object representing the event.
             * @param {DomWindow} evt.hWin The window containing the clicked element.
             * @param {DomEvent} evt.e The click event.
             * @private
             * @ignore
             */
            premouseup: function pmu(evt){
                _callSelector(this, "premouseup", evt);
            },
            /**
             * Scrolls to certain item.
             * @param item The item or index of the item to be shown in scroll area.
             */
            scrollTo: function st(item){
                var idx,
                    lm = this.listMapper;
                if (lm && lm.toItem) {
                    if (!isNaN(item)) {
                        // The given argument is the index.
                        idx = item;
                    } else {
                        // The given argument is the item, search for its index.
                        idx = this.itemIndex(item);
                    }                   
                    if (idx >= 0) {
                        lm.toItem(this, idx);
                    }
                }
            },
            /**
             * <p>If true, enables dragging from this widget.</p>
             * @type Boolean
             */
            draggable: false,
            
            /**
             * <p>Returns the data being dragged for a given drag context. If the drag context originated on a selected list item
             * the data is the selected items (meaning, data items, not GUI items); otherwise it is null.</p>
             *
             * <p>Used by mstrmojo.dnd.</p>
             *
             * @returns {Object} Either an item object, or null, depending on the DOM node dragged.
             */
            getDragData: function(c){
                // Cache the pageX,Y and scroll coords of the scrollbox for faster drag calculations.
                _lastPagePos(this, c.id);
            
                // Compute the index at which to insert the dragged data.
                var at = _whereDrop(this, c.src),
                    idx = at && at.idxActual;
                if ((idx > -1) && this.selectedIndices[idx]) {
                    var idxs = this.sortSelectedIndices(),
                        arr = _A.get(this.items, idxs) || [];
                    switch(arr.length){
                        case 1:
                            // Return a copy of the selected item, plus add "html" and "index" properties
                            // to the copy.
                            return _H.copy(arr[0], {html: arr[0][this.itemDisplayField], index: idxs[0]});
                        case 0:
                            // No items selected, so we have no drag data.
                            return null;
                        default:
                            // Return an array of selected items, plus add "html" and "index" properties
                            // to the array.
                            return _H.copy({html: arr.length + ' selections', indices: idxs}, arr);
                    }
                }
            },

            /**
             * <p>If true, enables dropping on this widget.</p>
             * @type Boolean
             */            
            dropZone: false,
            
            ondragenter: function(c) {
                // Cache the pageX,Y and scroll coords of the scrollbox for faster drag calculations.
                // Warning: if we ever scroll the box during the drag, we need to update lastScrollPos.
                _lastPagePos(this, c.id);

                // Compute where to show the dropCue.
                this.set("dropCuePos", _whereDrop(this, c.tgt));
            },
            
            ondragover: function(c) {
                this.set("dropCuePos", _whereDrop(this, c.tgt));
            },
            
            ondragleave: function(c) {
                // Hide drop cue.
                this.set("dropCuePos", null);
            },
            
            ondragstart: function(c){
                // If there's no drag data, then cancel the drag.
                // For example, if the drag originated in white space away from the list items,
                // then this list will abort the drag (rather than making the entire list widget
                // itself get dragged across the GUI).
                if (!(c && c.src && c.src.data)) {
                    return false;
                }
            },

            /**
             * If true, drag-drop of items within the same list while holding down the
             * CTRL key will allow the items to be duplicated.
             */
            allowCopy: false,
            
            ondragend: function(c){
                // If we are dropping it within ourselves, our within our tree, remove it
                // from its source location.
                // Minor hack: this class shouldn't know anything about tree. We could keep
                // the tree check out of here and move it to a subclass.
                // If the CTRL key was down when the drag ended, that means it was a copy,
                // not a move, so we don't need to remove anything from the source.
                var t = c && c.tgt,
                    w = t && t.widget;
                if (w === this) {
                    // We're moving items within this same widget.
                    // Do nothing here; the ondrop will do the move.
                } else if (this.tree && w && w.tree === this.tree) {
                    // We're moving items across lists but within a tree.
                    // We should remove the items from their original location
                    // unless a CTRL+drag was done to perform a copy.
                    if (!this.allowCopy || !_D.ctrlKey(t.hWin, t.e)) {
                        // Copy was either not allowed or not requested; remove the dragged data (if any).
                        var d = c.src && c.src.data;
                        if (d && (d.indices || (d.index !== null)) ){
                            this.remove(d.indices || d.index);
                        }
                    }
                }
            },
            
            
            ondrop: function(c) {
                // Validate the drag data.
                var s = c && c.src,
                    d = s && s.data;

                if (d) {
                    // Compute the index at which to insert the dragged data.
                    var at = _whereDrop(this, c.tgt, false),
                        idx = at && at.idx,
                        isArr = (d && d.constructor === Array);
                        
                    // If the index goes beyond the list, treat it as append. 
                    // We must repeat this check here, because the list may have
                    // just got items removed when this drag ended.  For example, when
                    // dragging items within the same list widget, the ondragend will
                    // remove those items, and then this ondrop will re-insert them; however
                    // the initial remove will shorten the list, in which case we still want
                    // to append without leaving a gap before these newly re-inserted items.
                    var its = this.items;
                    idx = Math.min(idx, (its && its.length)||0);

                    var chg = true;
                    if (s.widget === this){
                        // We're moving items within this same widget; do a move.
                        // Assumes the drag data is our current selections.
                        // TO DO: can the drag data ever be anything else?
                        chg = this.move(this.sortSelectedIndices(), idx);
                    } else {                    
                        // The items are coming from outside this list; insert the data.
                        this.add(isArr ? d : [d], idx);
                    }
                    
                    // Select the newly inserted data's items.
                    if (chg) {
                        var len = isArr ? d.length : 1,
                            sel = {};
                        for (var i=0; i<len; i++){
                            sel[idx+i] = true;
                        }
                        this.set("selectedIndices", sel);
                    }                    
                }
                                
                // Hide drop cue.
                this.set("dropCuePos", null);
            }
            
        });
        
})();