(function () {

    mstrmojo.requiresCls("mstrmojo.dom");
    
    var $D = mstrmojo.dom;
    
    function _attachHotSlot(me) {
        // After rendering, attach event listeners for mouseover/out on the hotSlot.
        var el = me[me.hotSlot || "domNode"];
        if (el) {
            // Define and cache callbacks.
            if (!me._closeCallback) {
                var id = me.id,
                    fnCallback = function (mthName) {
                        return function (e) {
                            var p = mstrmojo.all[id];
                            if (p && !p.ignoreHover) {
                                p['auto' + mthName](e, self);
                            }
                        };
                    };
                
                // Minor/major cheat: Support for ignoreHover property from _CanLockHover mixin.
                // Ideally, this code shouldn't be aware of that property.
                me._uncloseCallback = fnCallback('Unclose');
                me._closeCallback = fnCallback('Close');
            }
            // Attach callbacks.
            $D.attachEvent(el, "mouseover", me._uncloseCallback);
            $D.attachEvent(el, "mouseout", me._closeCallback);
            // TO DO: to avoid mem leaks, we should detach these handlers when we destroy.
        }
    }
    
    function _detachHotSlot(me) {
        if (me._closeCallback) {
            var el = me[me.hotSlot || "domNode"];
            if (el) {
                $D.detachEvent(el, "mouseover", me._uncloseCallback);
                $D.detachEvent(el, "mouseout", me._closeCallback);
            }
        }
    }

    function _toggleLock(me, lock) {
        var w = me;
        while (w) {
            // If w is either a popup or an opener of popups...
            if (w.open || w.openPopup) {
                // Update its "ignoreHover" property.
                if (w.set) {
                    w.set("ignoreHover", lock);
                } else {
                    w.ignoreHover = lock;
                }
            }
            // Keep walking up the chain of ancestors and openers.
            w = w.opener || w.parent;
        }
    }

    /**
     * <p>A mixin for popups that enables the popup to close itself when the end-user moves the
     * the mouse away from the popup's DOM.</p>
     * 
     * <p>An optional delay can be specified between the mouseout and the call to close the popup.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._CanAutoClose = {

        /**
         * <p>If true, this popup will automatically call its own close() when the end-user moves away
         * from its DOM.</p>
         * 
         * <p>The specified DOM node can be specified by the "hotSlot" property.</p>
         * 
         * @type Boolean
         */
        autoCloses: false,
        
        /**
         * Delay (in millisec) before the popup closes itself after the mouse moves away.
         * 
         * @type Integer
         */
        autoCloseDelay: 100,

        /**
         * If true, when this popup is opened it will tell its opener (and its opener's
         * openers chain) to ignore mouseovers, which otherwise might cause this popup to be auto-closed.
         * 
         * @type Boolean
         */
        locksHover: false,
        
        /**
         * Name of the slot which will trigger an auto-closes when the user moves away from it.
         * If null, "domNode" is assumed.
         * 
         * @type String
         */
        hotSlot: null,
        
        /**
         * <p>If true, this popup will automatically call its own close() when the end-user clicks
         * on the curtainNode.</p>
         * 
         * <p>The specified DOM node can be specified by the "curtainNode" property.</p>
         * 
         * @type Boolean
         */
        closeOnClick: false,
        
        /**
         * Name of the slot which will trigger an auto-closes when the user moves away from it.
         * If null, "domNode" is assumed.
         * 
         * @type String
         */
        curtainNode: null,
        
        /**
         * Extends rendering cycle to attach event listeners to the hotSlot.
         * 
         * @ignore
         */
        postBuildRendering: function postBuildRendering() {
            this._super();

            if (this.autoCloses) {
                _attachHotSlot(this);
            }
            
            this.oncloseOnClickChange();
            
        },
        
        /**
         * Handler for "autoCloses" property; attaches or detaches event listeners to the DOM as needed.
         */
        onautoClosesChange: function onautoClosesChange() {
            var fn = (this.autoCloses) ? _attachHotSlot : _detachHotSlot;
            fn(this);
        },
        
        oncloseOnClickChange: function oncloseOnClickChange() {
            if (!this.curtainNode) {
                return;
            }
            
            var me = this,
                mthName = 'click',
                isTouchApp = (mstrApp && mstrApp.isTouchApp());
            
            if (isTouchApp) {
                mthName = 'touchstart';
            }
            
            $D.attachEvent(me.curtainNode, mthName, function () {
                me.close();
                if (isTouchApp) {
                	mstrmojo.touchManager.notify([]);
                }                
            });
        },
        
        /**
         * Responds to a mouseover by aborting any prior timeout to close this popup.
         */
        autoUnclose: function autUncls() {
            var t = this._autoCloseTimer;
            if (t) {
                self.clearTimeout(t);
                delete this._autoCloseTimer;
            }
        },
    
        /**
         * <p>Responds to a mouseout by starting a timeout to close this popup.</p>
         * 
         * <p>The timeout delay length is determined by the "autoCloseDelay" property; if zero, no timeout is used
         * and the closing is done immediately.</p>
         */
        autoClose: function autCls() {
            if (this.ignoreHover) {
                return;
            }

            // Stop any prior timeout to close the popup.
            if (this._autoCloseTimer) {
                self.clearTimeout(this._autoCloseTimer);
            }
            if (this.opener) {
                if (this.autoCloseDelay) {
                    // If we have a delay, start a timeout.
                    var xid = this.opener.id;
                    this._autoCloseTimer = self.setTimeout(function () {
                        mstrmojo.all[xid].closePopup();
                    }, this.autoCloseDelay);
                } else {
                    // We have no delay, close immediately.
                    this.opener.closePopup();
                }
            }
        },
        
        /**
         * Detaches DOM events.
         * 
         * @param {Boolean} ignoreDom If true we don't need to clear the DOM (meaning it's been done by a parent).
         * 
         * @ignore
         */
        destroy: function destroy(ignoreDom) {
            if (this._lockHoverCallback) {
                $D.detachEvent(document.body, "mousedown", this._lockHoverCallback);
            }

            this._super(ignoreDom);
        },
            
        
        /**
         * Notifies the popup and its opener to ignore mouseovers, and attaches a listener for mousedown
         * anywhere in the document body.
         */
        lockHover: function lockHover() {
            _toggleLock(this, true);
            
            if (!this._lockHoverCallback) {
                var id = this.id;
                this._lockHoverCallback = function (evt) {
                    mstrmojo.all[id]._unlockHoverCheck(evt, self);
                };
            }
            // Minor hack: We want to listen for mousedown events, but NOT including the mousedown event
            // that caused this method to be called (if any). So we record the time for future reference.
            this._lastAttach = new Date();
            $D.attachEvent(
                document.body,
                "mousedown",
                this._lockHoverCallback
            );
        },
        
        /**
         * Notifies the popup and its opener to stop ignoring mouseovers, and detaches mousedown listener.
         */
        unlockHover: function unlockHover() {
            _toggleLock(this, false);
            if (this._lockHoverCallback) {
                $D.detachEvent(
                    document.body,
                    "mousedown",
                    this._lockHoverCallback
                );
            }
        },
        
        /**
         * The callback for the document.body.mousedown event.  If the event occurs outside this popup's domNode,
         * the popup closes itself.
         * 
         * @param {DOMEvent} e The DOM event associated with the mouseover.
         * @param {HTMLWindow} hWin The current window object.
         */
        _unlockHoverCheck: function _unlockHoverCheck(e, hWin) {
            // Minor hack: Ignore the mousedown if it's the same mousedown which caused lockHover to be
            // called in the first place.
            if ((new Date()) - this._lastAttach < 50) {
                return;
            }

            if (!$D.contains(this.domNode, $D.eventTarget(hWin, e), true, document.body)) {
                this.close();
            }
        },
        
        /**
         * <p>Undoes any lingering auto close and (possibly) locks the hover handling.</p>
         * 
         * <p>Assumes _IsPopup is mixed in before this mixin.</p>
         * 
         * @param {mstrmojo.Widget} opener The widget that opened the popup.
         * @param {Object} config
         * 
         * @ignore
         */
        open: function open(opener, config) {
            // Stop any prior timeout to close the popup.
            if (this.autoCloses) {
                this.autoUnclose();
            }

            this._super(opener, config);

            // Do the lock hover AFTER the inherited method has set our opener property.
            if (this.locksHover) {
                this.lockHover();
            }
        },
        
        /**
         * <p>Implements the "locksHover" property.</p>
         * 
         * <p>Assumes _IsPopup is mixed in before this mixin.</p>
         * 
         * @ignore
         */
        close: function close(cfg) {
            // Do the unlock hover BEFORE the inherited method has cleared our opener property.
            if (this.locksHover) {
                this.unlockHover();
            }
            this._super(cfg);
        }
    };
    
}());