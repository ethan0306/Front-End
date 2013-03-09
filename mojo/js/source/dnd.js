(function(){

    mstrmojo.requiresCls("mstrmojo.dom");
    
    var _D = mstrmojo.dom,
        _DND,
        _doc = mstrmojo.global.document;
    
    function _onMouseDown(e){        
        _DND.startDragCheck(self, e);
    }
    
    var _av,
        _avin,
        _avCSS = 'mstrmojo-dnd-avatar',
        _avs;
    
    function _updateAvatar(pos, allowDrop, html){
        if (html != null) { // null or undefined means do not update, empty string means set to blank
            _avin.innerHTML = html;         
        }
        _avs.left = pos.x + 'px';
        _avs.top = pos.y + 'px';
    }
    function _showAvatar(html, pos){
        if (!_av) {
            _av = _doc.createElement("div");
            _avs = _av.style;
            _av.className = _avCSS;
            _av.innerHTML = '<div class="'+ _avCSS + '-inner"></div>';
            _avin = _av.firstChild;
            _doc.body.appendChild(_av);
        }
        _updateAvatar(pos, true, html);
        _avs.display = 'block';
    }
    function _hideAvatar(){
        if (_av) {
            _avs.display = 'none';
        }
    }
    
    /**
     * <p>Callback for mousemoves that occur after a mousedown. If sufficient # of mousemoves are
     * captured, a drag is initiated.</p>
     *
     * @param {DomEvent} [e] The mousemove DOM event object; possibly null in some browsers.
     * @private
     */
     function _onMoveDuringCheck(e) {
        var c = ++_DND.ctxt.moveCount;
        if (c >= _DND.minMoves) {
            // Stop checking for a drag; initiate a drag.
            _DND.stopDragCheck(self, e);
            _DND.startDrag(self, e);
        }
    }
    
    /**
     * <p>Callback for mouseup that occurs after a mousedown but before sufficient mousemoves to
     * initiate a drag. Detaches event listeners that were checking for the start of a drag, and
     * clears the context object of the controller.</p>
     *
     * @param {DomEvent} [e] The mouseup DOM event object; possibly null in some browsers.
     * @private
     */
    function _onUpDuringCheck(e) {
        _DND.stopDragCheck(self, e);
    }
    
    /**
     * <p>Callback for mousemove that occurs during a drag.</p>
     * @param {DomEvent} [e] The mouseup DOM event object; possibly null in some browsers.
     * @private
     */
    function _onMoveDuringDrag(e) {
        _DND.onDragMove(self, e);
    }

    /**
     * <p>Callback for mouseup that occurs during a drag, ending it.</p>
     * @param {DomEvent} [e] The mouseup DOM event object; possibly null in some browsers.
     * @private
     */
    function _onUpDuringDrag(e) {
        _DND.stopDrag(self, e);
    }

    /**
     * <p>Captures DOM event info during a drag into the properties of a given hash.</p>
     *
     * <p>The given hash represents the info for either the mousedown, mousemove, or
     * mouseup in a drag. The properties we capture specify what the event target DOM and position were.</p>
     *
     * @param {Object} h The hashtable in which to record event info.
     * @returns {Object} The given hashtable.
     */
    function _capEvtInf(h) {
        if (!h) {
            return;
        }        
        if (!h.hWin) {
            h.hWin = window;
        }
        if (!h.e) {
            h.e = h.hWin.event;
        }

        h.node = _D.eventTarget(h.hWin, h.e);
        h.pos = _D.getMousePosition(h.e, h.hWin);
        
        return h;
    }
    
    /**
     * <p>Given a DOM node, returns the nearest draggable widget that contains that DOM node.</p>
     *
     * <p>Used to determine what widget is being dragged when a mousedown occurs.</p>
     *
     * @param {DomNode} nd The DOM event target node.
     * @returns {mstrmojo.Widget} The corresponding widget, if any; null otherwise.
     */
    function _findDraggable(nd){
        var w = _D.findWidget(nd);
        while (w) {
            if (w.draggable) {
                return w;
            }
            w = w.parent;
        }
        return null;
    }
    
    /**
     * <p>Given a DOM node, returns the nearest widget that contains that DOM node and (1) is a drop zone and 
     * (2) allows a drop with the given dragging context.</p>
     *
     * <p>Used to determine what widget is being dragged when a mousedown occurs.</p>
     *
     * @param {DomNode} nd The DOM event target node.
     * @param {Object} c The dragging context.
     * @returns {mstrmojo.Widget} The corresponding widget, if any; null otherwise.
     */
    function _findDroppable(nd, c){
        var w = _D.findWidget(nd);
        while (w) {
            if (w.dropZone) {
                // Widget is a potential drop zone, check if it allows this drop.
                // TO DO: Before calling its allowDrop, check if widget.cacheAllowDrop is true, which saves us a call.
                if (w.allowDrop && w.allowDrop(c)) {
                    return w;
                }
            }
            w = w.parent;
        }
        return null;
    }
    

    /**
     * The default method applied to a drop zone if that drop zone widget has no ondragenter method.
     * @param {Object} c The dragging context.
     */    
    function _ondragenterDefault(c){
        if (this.set) {
            this.set("allowingDrop", true);
        }
    }

    /**
     * The default method applied to a drop zone if that drop zone widget has no ondragleave method.
     * @param {Object} c The dragging context.
     */    
    function _ondragleaveDefault(c){
        if (this.set) {
            this.set("allowingDrop", false);
        }
    }

    /**
     * The default method applied to a drop zone if that drop zone widget has no ondrop method.
     * @param {Object} c The dragging context.
     */    
    var _ondropDefault = _ondragleaveDefault;

    /**
     * A controller for managing drag-drop events across widgets.
     * @class
     */
    mstrmojo.dnd = mstrmojo.provide(
        "mstrmojo.dnd",
        /**
         * @lends mstrmojo.dnd#
         */
        {
            /**
             * <p>Minimum number of mousemoves required after a mousedown to start a drag.</p>
             * @type Integer
             */
            minMoves: 3,

            /**
             * <p>Attaches mousedown listener to the document in order to start capturing drags.</p>
             */            
            enable: function(){
                if(!mstrmojo.dndEnabled){
                    _D.attachEvent(_doc, "mousedown", _onMouseDown);
                    mstrmojo.dndEnabled = true;
                } 
            },
            
            /**
             * <p>Detaches mousedown listener to the document to stop capturing drags.</p>
             */            
            disable: function(){
                _D.detachEvent(_doc, "mousedown", _onMouseDown);
            },
        
            /**
             * <p>Notifies this controller of a mousedown which may potentially turn into a drag if followed
             * by sufficient number of mousemoves.</p>
             *
             * <p>Attaches listeners for mousemove and mouseup in the document. If enough mousemoves are
             * then heard, the callback initiates a drag.</p>
             *
             * @param {Object} src The info object for the source; stores data about the mousedown of the drag.
             * @param {mstrmojo.Widget} c.widget The widget in which the mousedown originated.
             * @param {Object} [c.data] Any additional information about the data about to be dragged.
             * @param {DomWindow} [c.hWin=window] The DOM window in which the DOM event occurred.
             * @param {DomEvent} [c.e] The original mousedown DOM event (possibly null in some browsers).
             * @param {DomNode} [c.node] The DOM node in which the mousedown originated.
             */
            startDragCheck: function(hWin, e){
                delete this.ctxt;
                                
                var src = _capEvtInf({hWin: hWin, e: e});
                
                this.ctxt = {src: src, moveCount: 0};
                    
                // Do we have some minimum moves threshold?
                if (this.minMoves) {
                    // Attach DOM event listeners to possibly initiate drag soon.
                    _D.attachEvent(_doc, "mousemove", _onMoveDuringCheck);
                    _D.attachEvent(_doc, "mouseup", _onUpDuringCheck);
                } else {
                    // Initiate drag immediately.
                    this.startDrag(hWin, e);
                }
            },

            /**
             * <p>Detaches listeners for mousemove and mouseup in the document that were waiting for
             * sufficient mousemoves after a mousedown to initiate a drag.</p>
             */
            stopDragCheck: function(hWin, e){
                _D.detachEvent(_doc, "mousemove", _onMoveDuringCheck);
                _D.detachEvent(_doc, "mouseup", _onUpDuringCheck);
            },

            /**                        
             * <p>Notifies the widget being dragged that a drag is starting, and attaches listeners for mousemove and
             * mouseup in the document to notify widgets that they are getting dragged-over and dropped-onto.</p>
             */
            startDrag: function(hWin, e){
                // Give this drag context a new id so it can be identified by drop zones.
                var c = this.ctxt;
                c.id = new Date();

                var src = c.src,
                    w = _findDraggable(src.node);
                if (!w) {
                    return;
                }
                
                // Ask the widget for any extra contextual data regarding this drag.
                src.widget = w;
                src.data = w.getDragData && w.getDragData(c);
                
                // Notify the src widget it is getting dragged.
                if (w.ondragstart) {
                    if (w.ondragstart(c) === false) {
                        // Drag was cancelled by the source widget.
                        return;
                    }
                }
                
                // In Firefox, this will stop native browser highlighting of text as we drag.
                // TO DO: IMPORTANT! test in other browsers (Safari, IE, Chrome).
                _D.clearBrowserHighlights();
                _D.preventDefault(self, e);

                _D.attachEvent(_doc, "mousemove", _onMoveDuringDrag);
                _D.attachEvent(_doc, "mouseup", _onUpDuringDrag);
                
                if(w && !w.ownAvatar) {
                    _showAvatar(src.data && src.data.html, src.pos);
                }
            },

            /**                        
             * <p>Detaches listeners for mousemove and mouseup in the document, notifies the widget being dropped upon
             * (if any) and notifies the widget being dragged that a drag is ending.</p>
             * @param {DomNode} hWin The DOM window in which the mouseup occurred.
             * @param {DomNode} [e] The mouseup DOM event (possibly null in some browsers).
             */
            stopDrag: function(hWin, e){                
                // Detach event listeners.
                _D.detachEvent(_doc, "mousemove", _onMoveDuringDrag);
                _D.detachEvent(_doc, "mouseup", _onUpDuringDrag);

                // Compute the targeted widget.
                var c = this.ctxt,
                    ct = _capEvtInf({hWin: hWin, e: e}),
                    w = _findDroppable(ct.node, c);
                ct.widget = w;
                c.tgt = ct;
                
                // If drop is allowed, notify target widget of a drop on it.
                // We do this before calling the drag source widget's
                // ondragend because ondragend might remove the dragged items, which
                // could cause the entire drag target and/or drag source widgets to be
                // removed before we get a chance to do the ondrop!  (For example, in an
                // expression tree, ondragend will remove a node, which in turn consolidates
                // its parent, which could remove in the parent node being removed, as well
                // as some of its ancestors.)
                if (w) {
                    // Call the widget's ondrop, our apply a default ondrop.
                    if (w.ondrop) {
                        w.ondrop(c);
                    } else {
                        _ondropDefault.apply(w, [c]);
                    }
                }

                // Notify source widget that drag is over. 
                var s = c.src.widget;
                if (s && s.ondragend) {
                    s.ondragend(c);
                }

                
                
                if(s && !s.ownAvatar) {
                    _hideAvatar();
                }
            },
            
            /**
             * <p>Notifies drag source and target of a mousemove during a drag.</p>
             * @param {DomNode} hWin The DOM window in which the mousemove occurred.
             * @param {DomNode} [e] The mousemove DOM event (possibly null in some browsers).
             */
            onDragMove: function(hWin, e){
                if (_D.isSafari) {
                    _D.clearBrowserHighlights();
                }

                // Compute the targeted widget.
                var c = this.ctxt,
                    ct = _capEvtInf({hWin: hWin, e: e}),
                    w = _findDroppable(ct.node, c);
                ct.widget = w;      
                                
                // Check if the target has changes since the last time.
                var tWas = c && c.tgt && c.tgt.widget;
                
                c.tgt = ct;
                
                if (tWas !== w) {
                    // Either this is the first drag move, or the target has changed since last drag move.

                    // Call ondragleave on the last target (if possible).
                    if (tWas) {
                        // Call the widget's ondragleave, or if missing, apply a default handler.
                        if (tWas.ondragleave) {
                            tWas.ondragleave(c);
                        } else {
                            _ondragleaveDefault.apply(tWas, [c]);
                        }
                    }
                    
                    // Call ondragenter on the new target (if possible).
                    if (w) {
                        // Call the widget's ondragenter, or if missing, apply a default handler.
                        if (w.ondragenter) {
                            w.ondragenter(c);
                        } else {
                            _ondragenterDefault.apply(w, [c]);
                        }
                    }
                } else if (w) {
                    // Target widget hasn't changed, call its ondragmove.
                    // This allows the target to update its display and decide where exactly a drop is allowed.
                    // TO DO: only call ondragmove if cacheAllowDrop is not exactly true.
                    if (w.ondragover) {
                        w.ondragover(c);
                    }
                } 

                // Let the source know that it is moving.
                var s = c.src.widget;
                if (s && s.ondragmove) {
                    s.ondragmove(c);
                }
                
                if(s && !s.ownAvatar) {
                    _updateAvatar(ct.pos, !!w);                
                }
            }
            
        });
        
    _DND = mstrmojo.dnd;

    // Wire up the document to start listening for drags.    
    _DND.enable();

})();
