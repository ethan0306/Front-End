(function(){
    
    var $MATH = Math;

    /**
     * Private utility that return a native DOM event object.  Used to get a handle
     * to the event while encapsulating cross-browser differences.
     */
    function _evt(/*DomWindow?*/ hWin, /*DomEvent?*/ e) {
         return e || (hWin || window).event;
    }

    /**
     * @private
     * @ignore
     */
    var isIE = !!document.all,
        ua = navigator.userAgent,
        isFF = !isIE && !!ua.match(/Firefox/),
        bv = 0,
        isAndroid = !!ua.match(/Android/),
        isIPad = !!ua.match(/iPad/),
        tch = !!document.createTouch || isAndroid,
        isPlayBook = !!ua.match(/PlayBook/),
        isWinPhone = !!ua.match(/Windows Phone/);
        
    /**
     * Private function for extracting the Firefox browser version number.
     * 
     * @private
     * @ignore
     */
    function getBrowserVersion() {
        // Have we cached the browser version already?
        if (!bv && isFF) {
            // If not, we only need this for Firefox.
            // Retrieve the Firefox version number from the user agent.
            var nav = ua.match(/.*Firefox\/([\d|\.]*).*/);
            // Did we find it?
            if (nav) {
                // Store this in the browser version and return it.
                bv = parseFloat(nav[1], 10);
            }
        }
    
        return bv;
    }
    
    function _docScroll() {
        var x = 0, 
            y = 0, 
            w = window, 
            d = document,
            b = d.body, 
            de = d.documentElement;
        if( typeof(w.pageYOffset ) == 'number' ) {
              y =w.pageYOffset;
              x =w.pageXOffset;
        } else if( b && ( b.scrollLeft || b.scrollTop ) ) {
              y = b.scrollTop;
              x = b.scrollLeft;
        } else if( de && ( de.scrollLeft || de.scrollTop ) ) {
              y = de.scrollTop;
              x = de.scrollLeft;
        }
        return {x:x, y:y};
    }
    
    function setTranslateValue(num){

        //Validate for null or undefined
        num = num || 0;
        
        //Convert to string
        num = String(num);
        
        return ((num.indexOf("%", 0)) != -1) ? num : (num + 'px');      
    }
    
    function createTransformationString(x, y, z, use3d, translateString){

        if(!mstrmojo.dom.isWinPhone) {   
            use3d = (use3d || false || this.isHWAccelerated);
        } else {                
            use3d = false;
        } 
        
        var translateOpen = translateString + (use3d ? '3d' : '') + '(',
            translateClose = use3d ? (',' + z + ')') : ')';            
        
        return translateOpen + x + ',' + y + translateClose;        
    }    

    mstrmojo.Enum_Keys = {
        // summary:
        //      Definitions for common key values
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        CTRL: 17,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        INSERT: 45,
        DELETE: 46
    };
        
    mstrmojo.dom = mstrmojo.provide(
       "mstrmojo.dom",
       {
        userAgent: ua,
        
        isIE: isIE,
        
        isIE6: isIE && !!ua.match(/MSIE 6/),
        isIE7: isIE && !!ua.match(/MSIE 7/),
        isIE8: isIE && !!ua.match(/MSIE 8/),
        isIE9: isIE && !!ua.match(/MSIE 9/),
        
        isFF: isFF,
        
        isWK: !!ua.match(/AppleWebKit/),
        
        isSafari: !!ua.match(/Safari/) && !ua.match(/Chrome/),
        
        isHWAccelerated: !isAndroid,
        
        isAndroid: isAndroid,
        
        isIPad: isIPad,
        
        isPlayBook: isPlayBook,
        
        isWinPhone: isWinPhone,
        
        supportsTouches: tch,

        TOUCHSTART: tch ? 'touchstart' : 'mousedown',
        TOUCHMOVE: tch ? 'touchmove' : 'mousemove',
        TOUCHEND: tch ? 'touchend' : 'mouseup',
        TOUCHCANCEL: tch ? 'touchcancel' : '',
        RESIZE: tch ? 'orientationchange' : 'resize',        

        cssFeatures: {
            GRADIENTS: 'gd',
            ROUND_CORNERS: 'rc',
            TEXT_ROTATION: 'tr',
            DROP_SHADOW: 'sh'
        },
        
        /**
         * Determines if the users browser supports a particular feature.
         * 
         * @param {String} f The feature to check using the constants defined on this object.
         * 
         * @returns Boolean
         */
        supports: function supports(f) {
            var ffVer = this.isFF && getBrowserVersion();
            switch (f) {
                case this.cssFeatures.GRADIENTS:
                    return (this.isIE || this.isWK || ffVer >= 3.6 || this.isWinPhone);
                    
                case this.cssFeatures.ROUND_CORNERS:
                    return (this.isWK || this.isFF || this.isWinPhone);
                    
                case this.cssFeatures.TEXT_ROTATION:
                case this.cssFeatures.DROP_SHADOW:
                    return (this.isIE || this.isWK || ffVer >= 3.5 || this.isWinPhone);
            }
            
            return false;
        },
        
        /**
         * Replaces one Dom node in a DOM Doc with another.
         */        
        replace: function dom_repl(/*DomNode*/ target, /*DomNode*/ replacement) {
            if (!target || !replacement) {
                return;
            }
            var p = target.parentNode;
            if (p) {
                p.replaceChild(replacement, target);
            }
        },
        
        /**
         * Cross-browser wrapper for DOM2's addEventListener method, which in IE is called attachEvent.
         * 
         * @param {HTMLElement} el The HTMLElement to attach an event listener to.
         * @param {String} eventName The name of event to listen for.
         * @param {Function} f The function to execute when the event occurs.
         * @param {Boolean} [phase=false] The event phase to capture (false for bubbles, true for capture).
         */
        attachEvent: function dom_attch(el, eventName, f, phase) {
            if (el.addEventListener) {
                return el.addEventListener(eventName, f, !!phase);
            } else {
                return el.attachEvent("on"+eventName, f);
            }
        },

        /**
         * Cross-browser wrapper for DOM2's removeEventListener method, which in IE is called detachEvent.
         * 
         * @param {HTMLElement} el The HTMLElement to attach an event listener to.
         * @param {String} eventName The name of event to listen for.
         * @param {Function} f The function to execute when the event occurs.
         * @param {Boolean} [phase=false] The event phase to capture (false for bubbles, true for capture).
         */
        detachEvent: function dom_detach(/*DomNode*/ el, /*String*/ eventName, /*Function*/ f, phase) {
            if (!el) {
                return;
            }
            
            if (el.removeEventListener) {
                el.removeEventListener(eventName, f, !!phase);
            } else {
                el.detachEvent("on" + eventName, f);
            }
        },
        
        attachOneTimeEvent: function attachOneTimeEvent(el, eventName, f) {
            // Create wrapper function so we can detach later.
            var fn = function(evt) {
                // Call supplied function.
                f(evt);
                
                // Detach event.
                mstrmojo.dom.detachEvent(this, eventName, fn);
            };
            
            // Attach event.
            this.attachEvent(el, eventName, fn);
            
            // Kill 'el' reference to avoid memory leaks.
            el = null;
            
            return fn;
        },   
    
        /**
         * captures and processes a DOM event; usually called from event handler attached to DOM element.
         * event is passed to the object in the mstrmojo.all collection referenced by the id parameter.
         */                
        captureDomEvent: function captureDomEvent(id, type, hWin, e, config) {
            var x = mstrmojo.all[id];
            if (x) {
                x.captureDomEvent(type, hWin, e, config);            
            }
        },
             
        
        /**
         * This method uses the Webkit's transform property to translate a DOM node. Based on whether the browser has been HW accelerated,
         * the method decides whether to use 'translate' or 'translate3d'.
         * 
         * @param (HTMLElement) el The HTML DOM element that needs to be translated
         * @param (Integer) x The number of pixels (or percentage) to be moved along the x axis
         * @param (Integer) y The number of pixels (or percentage) to be moved along the y axis
         * @param (Integer) z The number of pixels (or percentage) to be moved along the z axis
         * @param (String) extra Optional parameter: Any other extra CSS transform properties.
         * @param (Boolean) useTranslate3d Optional parameter helps in overriding the default device/browser behavior in using 
         *                  webkitTransforms
         */
        translate: function translate(el, x, y, z, extra, useTranslate3d) {
            extra = (extra && ' ' + extra) || '';            
                                        
            el.style[((mstrmojo.dom.isWinPhone) ? 'ms' : 'webkit') + 'Transform'] = this.createTranslateString(x, y, z, useTranslate3d) + extra;
        },
        
        
        createTranslateString: function createTranslateString(x, y, z, useTranslate3d) {                               
                    
            //Set the property to fit the transform string.
            x = setTranslateValue(x);
            y = setTranslateValue(y);
            z = setTranslateValue(z);                       
            
            return createTransformationString(x, y, z, useTranslate3d, 'translate');
        },
        
        createScaleString: function createScaleString(x, y, z, useScale3d){
                    
            //Set the property to fit the transform string.
            x = x || 0;
            y = y || 0;
            z = z || 0; 
                                    
            return createTransformationString(x, y, z, useScale3d, 'scale');
        },
        
        /**
         * Number of milliseconds that an event is buffered by attachBufferedEvent methods.
         */
        _bufferSize: 200,
        
        /** 
         * A lookup hash of buffer DOM attachments (plus timeout ids, listeners, etc) keyed by "<nodeid>-<event name>".
         */
        _bufferConnects: {},
        
        /**
         * Warning: this method assumes a single namespace for all node ids. Need to enhance it to support
         * nodes from different frames/windows with the same id.
         * Warning: this method assumes the given node has an id. That's done for performance reasons; it allows
         * us to cache info by node id in a hash; otherwise, we'd have to cache the node handle, which could be
         * risky for memory leaks, and would require using a cache array instead of hash, which would mean
         * slower performance for cache lookups.
         * Warning: buffered events will callback the given function with no arguments, so only use for
         * specific cases when your callback doen't need the native DOM event object (because it will be long gone).
         */
        attachBufferedEvent: function dom_attchbuf(/*DomNode*/ el, /*String*/ eventName, /*Function*/ f, /*Integer?*/ bufferSize) {
            
            var key = el.id+"-"+eventName,
                info = this._bufferConnects[key];
            if (!info) {
                info = this._bufferConnects[key] = {
                    elId: el.id,
                    eventName: eventName,
                    timer: null, 
                    bufferSize: bufferSize,
                    listeners: [],
                    callback:     function(e){
                                    mstrmojo.dom._callback(e, mstrmojo.global, key);
                                    return true;
                                }
                };
                this.attachEvent(el, eventName, info.callback);
            }
            info.listeners.push(f);
        },
        
        _callback: function dom_callback(/*DomEvent?*/ e, /*DomWindow*/ hWin, /*String*/ key) {
            // TO DO: does this actually get called correctly with the right hWin? Test in IE.
            if (!e) {
                e = hWin.event;
            }
            var info = this._bufferConnects[key],
                timer = info && info.timer;
            if (info && !timer) {
                var ms = (info.bufferSize === null) ? this._bufferSize : info.bufferSize;
                
                if(info.bufferSize) {
                    info.timer = hWin.setTimeout(
                                    function(){mstrmojo.dom.updateBuffers(key);},
                                    ms
                                );
                } else {
                    // instant callback.
                    mstrmojo.dom.updateBuffers(key);
                }
            }
        },
        
        updateBuffers: function dom_updateBuffers(/*String*/ key) {
            var info = this._bufferConnects[key],
                ls = info && info.listeners;
            for (var i=0, len=ls && ls.length || 0; i<len; i++) {
                ls[i]();
            }
            if (info && info.timer) {
                delete info.timer;
            }
        },
        
        detachBufferedEvent: function dom_dtchbuf(/*DomNode*/ el, /*String*/ eventName, /*Function*/ f) {
            if (!el) {
                return;
            }
            
            var key = el.id+"-"+eventName,
                info = this._bufferConnects[key],
                ls = info && info.listeners,
                len = (ls && ls.length) || 0;
            if (len) {
                for (var i=len-1; i>-1; i--) {
                    if (ls[i] == f) {
                        ls.splice(i,1);
                    }
                }
                // if no listeners left, detach the callback and
                // remove its entry in our lookup so we can reconnect in the future if needed.
                if (!ls.length) {
                    this.detachEvent(el, eventName, info.callback);
                    delete this._bufferConnects[key];
                    if (info.timer) {
                        mstrmojo.global.clearTimeout(info.timer);
                    }
                }
            }
        },
        
        /**
         * Returns the target DOM node of a given DOM event.
         */
        eventTarget: function evtTgt(/*DomWindow?*/ hWin, /*DomEvent?*/ e) {
            e = _evt(hWin, e);
            return e.target || e.srcElement;
        },
        
        /**
         * Returns true if the CTRL key was pressed during given DOM event.
         */
        ctrlKey: function ctrl(/*DomWindow?*/ hWin, /*DomEvent?*/ e) {
            return _evt(hWin, e).ctrlKey;
        },
        
        /**
         * Returns true if the SHIFT key was pressed during given DOM event.
         */
        shiftKey: function shift(/*DomWindow?*/ hWin, /*DomEvent?*/ e) {
            return _evt(hWin, e).shiftKey;
        },
        
        getMousePosition: function getMousePosition(e, hWin){
            hWin = hWin || window;
            
            var x, y;
            if (mstrmojo.dom.isIE){
                e = e || hWin.event;
                // In IE, clientX and clientY are relative to the current scroll position, not to the document.
                var d = document,
                    b = d.body,
                    de = d.documentElement;
                x = e.clientX + b.scrollLeft + (de.scrollLeft || 0);
                y = e.clientY + b.scrollTop + (de.scrollTop || 0);
            } else {
                // In other browsers, pageX & pageY are relative to the document, independent of the scroll position.
                x = e.pageX;
                y = e.pageY;
            }
            
            return { "x" : x, "y" : y };
        },

        /**
         * Return the position and size of a dom node. 
         * The position is relative to its owner document, if includeScroll = true. 
         * Otherwise, relative to its client view port. 
         * TO-DO: Consider move it to boxmodel.js.
         */
        position: function(/*DomNode*/ el, includeScroll){
            //assuming IE6+, FF3+, super-modern WebKit
            var p = {x:0,y:0};
            if (el.getBoundingClientRect){
               p = el.getBoundingClientRect();   
               p = {x:p.left, y:p.top, w: p.right - p.left, h: p.bottom - p.top};
               if(this.isIE && !this.isIE8){//IE7 and below
                   var de = el.ownerDocument.documentElement,
                       deo = de.getBoundingClientRect();
                   p.x -= deo.left;
                   p.y -= deo.top;
               }
            }
            if(includeScroll){//adjust for scroll
                var ds = _docScroll();
                p.x += ds.x;
                p.y += ds.y;
            }
            return p;
        },
        
        /**
         * Measures the delta position of one DOM node relative to another.
         * Note: compared to offset, this one consider scroll. 
         * TO-DO: Consider move it to boxmodel.js.
         */
        delta: function delta(/*DomNode*/ el, /*DomNode?*/ elLimit) {
            elLimit = elLimit || document.body;
            var pe = this.position(el),
                pr = this.position(elLimit);
        
            return {x: Math.round(pe.x - pr.x), y: Math.round(pe.y - pr.y)};            
        },
        
        /**
         * Calculate the dimension of browser window. 
         */
        windowDim: function _winDim(){
            var w = 0, 
                h = 0,
                win = window,
                d = document,
                de = d.documentElement,
                db = d.body;
            if(typeof(win.innerWidth ) == 'number'){
              w = win.innerWidth;
              h = win.innerHeight;
            } else if(de  && (de.clientWidth || de.clientHeight)){
              w = de.clientWidth;
              h = de.clientHeight;
            } else if(db && (db.clientWidth || db.clientHeight)){
              w = db.clientWidth;
              h = db.clientHeight;
            }
            return {w:w,h:h};
        },
        
        /**
         * Position an element to the center of browser window. 
         */
        center: function center(e){
            var es = e.style,
                eds = es.display,
                wdim = this.windowDim(),
                ds = _docScroll();  
            
            es.display = 'block';
            es.left = (wdim.w - e.clientWidth)/2 + ds.x + 'px';
            es.top = (wdim.h - e.clientHeight)/2 + ds.y + 'px';  
            es.display = eds;
        },
        
        /**
         * Removes the native text highlight that browsers tend to do whenever
         * end-users do a SHIFT+click or CTRL+click.
         */
        clearBrowserHighlights: function clrHiLits(/*DomWindow?*/ hWin) {
            hWin = hWin || self;
            if (isIE) {
                var doc = hWin.document,
                    sel = doc && doc.selection,
                    em = sel && sel.empty;
                if (em) {
                    try {
                        sel.empty();
                    } catch(ex){
                        // TQMS# 337503: It seems that for an unknown reason the empty property sometimes can generate Runtime error, so swallow any errors.
                    }
                }
            }
            else {
                var gs = hWin.getSelection,
                    s = gs && hWin.getSelection();
                if (s && !s.isCollapsed) {
                    if (s.empty) {
                        s.empty();
                    } else if (s.removeAllRanges) {
                        s.removeAllRanges();
                    }
                }
            }
        },
        
        /**
         * Searches for an ancestor of a given DOM node with a given HTML attribute.
         * The attribute value may be any non-null value.   If a boolean flag is true,
         * the given DOM node is included in the search along with its ancestors.
         * If a limit node is given, the search stops when that limit is encountered (and
         * the limit itself is not tested).
         */
        findAncestorByAttr: function fndAncAttr(/*DomNode*/ el, /*String*/ attr, /*Boolean*/ inclusive, /*DomNode?*/ elLimit) {
            var node = inclusive ? el : el && el.parentNode;
            while (node && (node != elLimit)) {
                var v = node.getAttribute && node.getAttribute(attr);
                if (v != null) {
                    return {
                            node: node,
                            value: v
                    };
                }
                node = node.parentNode;
            }
            return null;
        },
        
        /**
         * Searches for an ancestor of a given DOM node with a given node name.
         * The attribute value may be any non-null value.   If a boolean flag is true,
         * the given DOM node is included in the search along with its ancestors.
         * If a limit node is given, the search stops when that limit is encountered (and
         * the limit itself is not tested).
         */
        findAncestorByName: function fndAncNm(/*DomNode*/ el, /*String*/ nodeName, /*Boolean*/ inclusive, /*DomNode?*/ elLimit) {
            nodeName = nodeName && nodeName.toLowerCase();
            var node = inclusive ? el : el && el.parentNode;
            while (node && (node != elLimit)) {
                var n = node.nodeName;
                if (n && (n.toLowerCase() == nodeName)) {
                    return node;
                }
                node = node.parentNode;
            }
            return null;
        },
        
        /**
         * Returns true if a given DOM node is an ancestor of another given node.
         * If a boolean flag is true, the latter node is included in the search.
         * If a limit node is given, the search stops when that limit is encountered (and
         * the limit itself is not tested).
         */
        contains: function cntns(/*DomNode*/ elP, /*DomNode*/ elC, /*Boolean*/ inclusive, /*DomNode?*/ elLimit) {
            var node = elC;
            
            // Should we exclude the elC?
            if (!inclusive) {
                // Start the search with the parent of elC.
                node = node.parentNode;
            }

            while (node) {
                // Is this node the target node?
                if (node == elP) {
                    return true;
                }

                // Is the node the limit?
                if (node === elLimit) {
                    break;
                }

                // Check the parent.
                node = node.parentNode;
            }
            
            return false;
        },
        
        preventDefault: function prvDft(hWin, e) {
            if (!e) {
                e = hWin.event;
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
        },

        stopPropogation: function stpPrg(hWin, e){
            if (!e) {
                e = hWin.event;
            }
            if (e.stopPropogation) {
                e.stopPropogation();
            } else {
                e.cancelBubble = true;
            }
        },

        firstTouch: function fstTch(hWin, e) {
            return e && e.touches && e.touches.length ? e.touches[0] : (e || hWin.event);
        },
        
        firstChangedTouch: function fstChTch(hWin, e) {
            return e && e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : (e || hWin.event);
        },
        
        isLandscape: function isLandscape() {
            return !this.supportsTouches || (Math.abs(window.orientation) === 90);
        },        
        
        /**
         * <p>Finds the corresponding widget for a given DOM node.</p>
         *
         * <p>Searches the DOM node and its ancestors for an mstrmojoId expando property, which is assumed to
         * be set in the domNode of every widget to the widget's id.</p>
         *
         * @param {DomNode} el The DOM node.
         * @returns {mstrmojo.Widget} The corresponding widget, if any; null otherwise.
         */
        findWidget: function(el) {
            while (el) {
                var id = el.mstrmojoId;
                if (id != null) {
                    return mstrmojo.all[id];
                }
                el = el.parentNode;
            }
            return null;
        },

        /**
         * Move caret to the specified position
         * @param {DOMNode} el DOMNode to move its caret, like <INPUT>, <TextArea>
         * @param {Integer} pos  The number of charater of the node's text content from the beginning
         */
        setCaret: function (el, pos) {
            if (el.setSelectionRange) {  
                el.focus();  
                el.setSelectionRange(pos, pos);
            }
            else if (el.createTextRange) { //IE7,8
                var tr = el.createTextRange();
                tr.move("character", pos);  
                tr.select(); 
            } 
        }
        
    });
    /**
     * utilities which provide the functions for querying window and document geometry. 
     */
    var G = mstrmojo.dom,
        w = window,
        d = document,
        de = d && d.documentElement,
        b = d && d.body ;
    /**
     * getWindowX/Y(): return the position of hte window on the screen.
     */
//    if (w.screenLeft){ // IE and others
//        G.getWindowX = function() { return w.screenLeft;};
//        G.getWindowY = function() { return w.screenTop;};
//    } else if (w.screenX){ // Firefox and others
//        G.getWindowX = function() { return w.screenX;};
//        G.getWindowY = function() { return w.screenY;};
//    }
    /**
     * getViewportWidth/Height(): return the size of the browser viewport area.
     * getHorizontal/VerticalScroll(): return the position of the horizontal/vertical scrollbar
     */
    if (w.innerWidth) { // All brosers but IE
//        G.getViewportWidth = function() { return w.innerWidth;};
//        G.getViewportHeight = function() { return w.innerHeight;};
        G.getHorizontalScroll = function() { return w.pageXOffset;};
        G.getVerticalScroll = function() { return w.pageYOffset;};
    } else if (de && de.clientWidth) {
    // for IE 6 when there is a DOCTYPE
//        G.getViewportWidth = function() { return de.clientWidth;};
//        G.getViewportHeight = function() { return de.clientHeight;};
        G.getHorizontalScroll = function() { return de.scrollLeft;};
        G.getVerticalScroll = function() { return de.scrollTop;};
    } else if (b.clientWidth) {
    // for IE 4, IE 5 and IE 6 without DOCTYPE
//        G.getViewportWidth = function() { return b.clientWidth;};
//        G.getViewportHeight = function() { return b.clientHeight;};
        G.getHorizontalScroll = function() { return b.scrollLeft;};
        G.getVerticalScroll = function() { return b.scrollTop;};
    }
    /**
     * getDocumentWidth/Height(): return the size of the document.
     */
//    if (de && de.scrollWidth) {
//        G.getDocumentWidth = function() { return de.scrollWidth;};
//        G.getDocumentHeight = function() { return de.scrollHeight;};
//    } else if (b.scrollWidth) {
//        G.getDocumentWidth = function() { return b.scrollWidth;};
//        G.getDocumentHeight = function() { return b.scrollHeight;};
//    }
    
})();