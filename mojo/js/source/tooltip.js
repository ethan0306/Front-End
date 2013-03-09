(function() {
    mstrmojo.requiresCls("mstrmojo.dom", "mstrmojo.Container", "mstrmojo._IsPopup", "mstrmojo.boxmodel", "mstrmojo.css");

    var _B = mstrmojo.boxmodel,
    _D = mstrmojo.dom,
    _CURSOR_HEGIHT = 20;
    /**
     * Attach listener to opener's parent's scroll event
     */
    function attScrll(o, me) {
        var p = o && o.parent;
        while (p){
            if (p.connectScrollbox){
                p.connectScrollbox(me);
            }
            p = p.parent;
        }
    }
    /**
     * Detach listener to opener's parent's scroll event
     */
    function detScrll(o, me) {
        var p = o && o.parent;
        while (p){
            if (p.disconnectScrollbox){
                p.disconnectScrollbox(me);
            }
            p = p.parent;
        }
    }
    /**
     * Positions the tooltip to desired location.
     * 
     * @param me {mstrmojo.Tooltip} The tooltip to be positioned
     * @param offset {Object} offset has property 'top' and 'left', which is the offset of the reference point in document coordinate. 
     *                 The tooltip's 'top' and 'left' are offsets from reference point.
     * @private
     * @ignore
     */
    var _position = function(me){
        // if tooltip is not visible, we do not need to position it.
        if (me.visible) {
            // update position
            // x and y in event refers to a certain node, we need to calculate the offset corresponding to document
            var ref = me.refNode,
                // if we have reference node, we need to calculate the offset in document
                // if we do not have a reference node, then the left/top are from event, 
                // which is in window coordinate, so we need to calculate the scroll offset
                offset = ref ? _B.offset(ref, document.body) : {
                                                                left: _D.getHorizontalScroll(),
                                                                top: _D.getVerticalScroll()
                                                            },
            s = me.domNode.style, 
            c = me.containerNode,
            l = me.left,
            t = me.top,
            p = me.posType,
            T = mstrmojo.tooltip,
            p_r = (p === T.POS_TOPRIGHT) || (p === T.POS_BOTTOMRIGHT), 
            p_b = (p === T.POS_BOTTOMLEFT) || (p === T.POS_BOTTOMRIGHT) || (p === T.POS_BOTTOMCENTER), 
            offLeft = offset.left,
            offTop = offset.top,
            containerOffWidth = c.offsetWidth;
                                                            
            if (l !== null) {
                
                s.left = Math.max(parseInt(l, 10) + offLeft - (p_r ? (containerOffWidth):
                                                                     ((p===T.POS_BOTTOMCENTER) ? (containerOffWidth / 2) : 0))
                                   , 0) + 'px';                
            }
            if (t !== null){
                
                s.top = Math.max(parseInt(t, 10) + offTop - ((p_b)? (c.offsetHeight):0), 0) + 'px';
            }
        }
    };

    var _repaint = function(me) {
        me.containerNode.className = ('mstrmojo-Tooltip-content ' + me.contentNodeCssClass);
        me.containerNode.style.cssText = me.contentNodeCssText;
        me.containerNode.innerHTML = me.content;
        if (!me.content) {
            me.set('_tempVis', false);
        } else {
            me.set('_tempVis', true);
        }
        _position(me);
    };

    /**
     * Calling _position() with delay.
     */
    function _dlyPaint(me) {
        if (!me._dp){
            me._dp = window.setTimeout(function() {
                me._dp = null;
                _repaint(me);
            }, 50);
        }
    }
    /**
     * Updates current tooltip properties based on opener's properties
     */
    var _update = function(me, w, e, win) {
        // update
        var r = w && (w.richTooltip || w.tooltip),
            mp = e ? _D.getMousePosition(e, win || self) : null,
            isStr = r && (typeof(r) === 'string'),
            l = isStr ? null : (r && r.left || 0),
            t = isStr? null: (r && r.top || 0);
        me.set('contentNodeCssClass', isStr ? '' : (r && r.contentNodeCssClass || ''));
        me.set('contentNodeCssText', isStr ? '' : (r && r.contentNodeCssText || ''));
        me.set('content', (isStr) ? r : (r && r.content || ''));
        me.set('refNode', isStr ? null : r && r.refNode || null);
        me.set('posType', isStr ? 1: r && r.posType || 1);
        me.set('left', (isStr || l === undefined || l === null) ? (mp && mp.x || me.left) : l);
        me.set('top', (isStr || r === undefined || r === null) ? (mp && (mp.y + _CURSOR_HEGIHT) || me.top): t);        // vertical offset is cursor position + cursor height (20px)
    };
    /**
     * This is the tooltip popup to show customized tooltip.
     */
    mstrmojo.Tooltip = mstrmojo.declare(
            mstrmojo.Container,
            [mstrmojo._IsPopup],
            {
                scriptClass: 'mstrmojo.Tooltip',
                /**
                 * Tooltip content
                 */
                content: null,
                /**
                 * Top position of the tooltip. 
                 * 
                 * The final position of the tooltip is decided by (top,left) x refNode x posType.
                 */
                top: null,
                /**
                 * Left position of the tooltip.
                 * 
                 * The final position of the tooltip is decided by (top,left) x refNode x posType.
                 */
                left: null,
                /**
                 * The reference node for top/left. If refNode is null, then left/top is corresponding to window.
                 */
                refNode: null,
                /**
                 * The corner of the tooltip is positioned. 
                 * mstrmojo.tooltip.POS_TOPLEFT: the top left corner of the tooltip would be positioned according to the offset (top, left) of refNode.
                 *                     (top,left)
                 *                         o-----------
                 *                      |  tooltip |
                 *                      ------------
                 *                        --------------------
                 *                        |                  |
                 *                        |    RefNode       |
                 *                        --------------------
                 * mstrmojo.tooltip.POS_BOTTOMLEFT: the bottom left corner of the tooltip would be positioned according to the offset (top, left) of refNode.
                 *                         ------------
                 *                      |  tooltip |
                 *                      o-----------
                 *                  (top,left)
                 *                  
                 *                        
                 *                        --------------------
                 *                        |                  |
                 *                        |    RefNode       |
                 *                        --------------------
                 * mstrmojo.tooltip.POS_TOPRIGHT: the top right corner of the tooltip would be positioned according to the offset (top, left) of refNode.
                 *                     (top,left)
                 *              -----------o
                 *           |  tooltip |
                 *           ------------
                 *                        --------------------
                 *                        |                  |
                 *                        |    RefNode       |
                 *                        --------------------
                 * mstrmojo.tooltip.POS_BOTTOMRIGHT: the bottom right corner of the tooltip would be positioned according to the offset (top, left) of refNode.
                 *           ------------
                 *           |  tooltip |
                 *              -----------o
                 *                     (top,left)
                 * 
                 * 
                 *                        --------------------
                 *                        |                  |
                 *                        |    RefNode       |
                 *                        --------------------
                 * Default value is mstrmojo.tooltip.POS_TOPLEFT.
                 *                        
                 */
                posType: 1, 
                /**
                 * Tooltip popup markup string.
                 * 
                 * @ignore
                 */
                markupString: '<div id="{@id}" class="mstrmojo-Tooltip {@cssClass}" style="{@cssText}">' +
                                '<div class="mstrmojo-Tooltip-shadow {@shadowNodeCssClass}"></div>' + 
                                '<div class="mstrmojo-Tooltip-content {@contentNodeCssClass}" style="{@contentNodeCssText}"></div>' +
                              '</div>',
                /**
                 * Markup slots.
                 * 
                 * @ignore
                 */
                markupSlots: {
                    containerNode: function(){ return this.domNode.lastChild; },
                    shadowNode: function() { return this.domNode.firstChild; }
                },
                /**
                 * Markup methods.
                 * 
                 * @ignore
                 */
                markupMethods: {
                    onvisibleChange: function(){ 
                        if (this.visible){
                            // since some of the positioning part relate to measuring, we may need to do it before tooltip visible.
                            var s = this.domNode.style;
                            s.visibility = 'hidden';
                            s.display = 'block';
                            // now even the tooltip can not be seen by user, we can measure it now
                            _position(this);
                            s.visibility = this.content? 'visible' : 'hidden';
                        } else {
                            this.domNode.style.display = 'none'; 
                        }
                    },
                    on_tempVisChange: function() {
                        this.domNode.style.visibility = this._tempVis ? 'visible' : 'hidden'; 
                    },
                    onleftChange: function(){ _dlyPaint(this); },
                    ontopChange: function(){ _dlyPaint(this); },
                    onrefNodeChange: function() {_dlyPaint(this); },
                    onposTypeChange: function() {_dlyPaint(this); },
                    oncontentNodeCssClassChange: function (){_dlyPaint(this);},
                    oncontentNodeCssTextChange: function() {_dlyPaint(this);},
                    oncontentChange: function() {_dlyPaint(this);}
                },
                /**
                 * If there is no parent node assigned for this tooltip, we need to append it to the document body node.
                 * 
                 * @ignore
                 */
                preBuildRendering: function() {
                    // if no slot or placeholder is assigned, create the placeholder under the body node.
                    if (!this.slot && !this.placeholder) {
                        this.placeholder = document.body.appendChild(document.createElement('div'));
                    }
                    if (this._super) {
                        this._super();
                    }
                },
                _on_tooltip_change: function(evt){
                    _update(this, evt && evt.src);
                },
                /**
                 * Custom setter for 'opener' property. 
                 * 
                 * Since we are going to share the same tooltip instance with different widget, each time when this tooltip associates with a new widget,
                 * we need to perform some cleanup with previous widget and set up some listeners with the new widget.
                 */
                _set_opener: function(n, v) {
                    var ov = this.opener;
                    // if new opener is different from previous opener, 
                    // 1. we need to attach event listeners for scrolling to the new opener
                    // at the same time detach event listeners for scrolling from previous opener
                    // 2. we need to listen to any change of opener's richTooltip and tooltip
                    if ((v !== ov)){
                        if (v) {
                            attScrll(v, this);
                        }
                        if (ov) {
                            detScrll(ov, this);
                        }                        
                        if (ov && ov.detachEventListener) {
                            ov.detachEventListener(this._richSubs);
                            ov.detachEventListener(this._ttpSubs);
                        }
                        if (v && v.attachEventListener) {
                            this._richSubs = v.attachEventListener('richTooltipChange', this.id, '_on_tooltip_change');
                            this._ttpSubs = v.attachEventListener('tooltipChange', this.id, '_on_tooltip_change');
                        }
                        this.opener = v;
                        return true;
                    }
                    return false;
                },
                /**
                 * Updates config for Popup rendering.
                 */
                updatePopupConfig: function(config, opener){
                    _update(this, opener, config && config.e, config && config.win);
                },
                /**
                 * Event handler for scroll event generated from any ancestor of opener.
                 * When any ancestor of opener is scrolled, we need to reposition tooltip. 
                 */
                onscroll: function() {
                    //421475
                    if (this.visible && this.nudge) {
                        this.nudge();
                    }
                }
            }
    );

    // singleton for tooltip widget
    var ttpInst = null;
    mstrmojo.tooltip = {
            // constants
            POS_TOPLEFT: 1,
            POS_BOTTOMLEFT: 2,
            POS_TOPRIGHT: 3,
            POS_BOTTOMRIGHT: 4,
            POS_BOTTOMCENTER: 5,
            /**
             * Asks tooltip singleton to show the tooltip
             */
            open: function(opener, e, win, config) {
                //Create a new tooltip object if either we haven't created the object.
                //OR if the tooltip object has been destroyed...
                if (!ttpInst || !mstrmojo.all[ttpInst.id]) {
                    ttpInst = new mstrmojo.Tooltip();
                }
                
                if (!config) {
                    config = {};
                }
                config.e = e;
                config.win = win;
               ttpInst.open(opener, config);
            },
            /**
             * Asks tooltip singleton to hide the tooltip
             */
            close: function() {
                if (ttpInst) {
                    ttpInst.close();
                }
            }
    };
})();