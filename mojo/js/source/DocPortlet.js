/*global mstrmojo:false, window:false */

(function () {
    var MOVE_FMTS = ['background-color',
                  'border',
                  'border-color',
                  'border-left',
                  'border-style',
                  'border-top',
                  'border-width',
                  'filter',
                  'top',
                  'left',
                  'z-index',
                  'fx',
                  'normWidth',
                  'normHeight',
                  'normZIndex',
                  'normTop',
                  'normLeft',
                  'tbborder',
                  'lrborder',
                  'ttl'],
        COPY_FMTS = ['width', 'height'],
        P_FMTS = 'p_fmts';
    // strategies for title related dimension calculation
    /** 
     * Embedded Title Strategy.
     */
    var ETS = {
        /**
         * parameters:
         * h for height available for contente without considering title
         * f the format for the portlet
         */
        getContentHeight: function (h, f) {
            var th = f.ttl && f.ttl.height;
            if (h && th && !this.floatingToolbar) {
                // Reduce domNode height by title height (minimum of zero).
                return Math.max(parseInt(h, 10) - parseInt(th, 10), 0) + 'px';
            }
        },
        getPortletMinHeight: function (f) {
            return f.ttl.height;
        },
        adjustTitleCss: function (ptlt) {
            return;
        }
    };
    /** 
     * Floating Title Strategy.
     */
    var FTS = {
        getContentHeight: function (h, f) {
            return h;
        },
        getPortletMinHeight: function () {
            return 0;
        },
        adjustTitleCss: function (ptlt) {
//                var avail = parseInt(ptlt.getFormats().top, 10),
//                    min = ptlt.floatingTitleHeight;
//                ptlt.titlebarNodeCssText += 'top:-' + (avail > min ? min: 0) + 'px;' + 'height:' + min + 'px;' + 'z-index:' + ptlt.getFormats()['z-index'];
            ptlt.titlebarNodeClass += ' floating';
            return;
        }
    };
    mstrmojo.requiresCls("mstrmojo.Container", "mstrmojo.ToolBar");
    
    var _H = mstrmojo.hash;
    
    var ITEM_SPA = 2;
    
    mstrmojo.DocPortlet = mstrmojo.declare(
        // super
        mstrmojo.Container,
        // mixin
        [mstrmojo._Formattable],
        // instance properties and methods
        {
            scriptClass: 'mstrmojo.DocPortlet',
            /**
             * Whether the title bar should be floating or not.
             */
            floatingTitle: false,
            /**
             * To support floating title, this widget needs to know the height of the title bar.
             * Of type of integer, unit in pixels.
             */
            floatingTitleHeight: 30,
            /**
             * To correctly place title (espectially for the long title), we need to correctly size the buttons toolbar.
             * Of type of integer, unit in pixels.
             */
            buttonWidth: 17,
            
            markupString:
                '<div class="mstrmojo-portlet {@borderCss}" style="{@portletNodeCssText}">' +
                    '<div class="mstrmojo-portlet-slot-shadow" style="{@shadowNodeCssText}"></div>' +
                    '<div class="mstrmojo-portlet-container" style="{@portletContainerNodeCssText}">' +
                        '<div class="mstrmojo-portlet-titlebar {@titlebarNodeClass}" style="{@titlebarNodeCssText}">' +
                            '<table style="height:100%;width:100%" class="mstrmojo-portlet-titlebar-table" cellspacing="0" cellpadding="0">' + 
                            '<tr>' +
                                '<td class="mstrmojo-portlet-slot-toolbar-left {@leftToolbarNodeClass}" style="{@leftToolbarNodeCssText}"></td>' + 
                                    '<td class="mstrmojo-portlet-title" style="{@titleNodeCssText}"><div style="overflow: hidden;">{@title} {@count}</div></td>' + 
                                '<td class="mstrmojo-portlet-slot-toolbar {@toolbarNodeClass}" style="{@rightToolbarNodeCssText}"></td>' +
                                '</tr>' + 
                            '</table>' + 
                        '</div>' +
                        '<div class="mstrmojo-portlet-slot-content" style="{@contentNodeCssText}"></div>' + //Xtab/Graph/PanelStack/StackContainer goes here. 
                    '</div>' +
                '</div>',
                
            rightToolbarNodeCssText: '',
            leftToolbarNodeCssText: '',
            titleNodeCssText: '',
            titlebarNodeClass: '',
            titlebarNodeCssText: '',
            contentNodeCssText: '',
            borderCss: 'no-border',
            markupSlots: {
                containerNode: function () {return this.domNode.lastChild; }, // TODO check with GB whether this is right
                portletNode: function () {return this.domNode; },
                portletContainerNode: function () {return this.domNode.lastChild; },
                dimNode: function () {return this.domNode.lastChild; }, // the node really carry the dimension information, sub section needs this information to perform auto shrink/grow.
                shadowNode: function () { return this.domNode.firstChild; },
                titleNode: function () {return this.domNode.lastChild.childNodes[0]; },
                toolbarNode: function () { return this.domNode.lastChild.firstChild.childNodes[0].rows[0].cells[2]; }, // actually this is right toolbar
                toolbarTitleTextNode: function () { return this.domNode.lastChild.firstChild.childNodes[0].rows[0].cells[1].firstChild; },
                leftToolbarNode: function () { return this.domNode.lastChild.firstChild.childNodes[0].rows[0].cells[0]; },
                contentNode: function () { return this.domNode.lastChild.lastChild; }
            },
            
            markupMethods: {
                ontitleChange: function(){
                        this.toolbarTitleTextNode.innerHTML = this.title +  ' ' + (this.count ? this.count : '');
                    },
                    oncountChange: function(){
                        this.toolbarTitleTextNode.innerHTML = this.title + ' ' + (this.count ? this.count : '');
                },
                onfcChange: function(evt){
                    if (this.fc && this.content) {
                        this.updateContentHeight();
                    }
                }
            },
            
            formatHandlers: {
                //portletNode : ['T', 'z-index'],
                portletContainerNode: [ 'RW', 'B', 'background-color'], // must contains D, since contained widget would have absolute position, which can not tell correct size.
                shadowNode: [ 'RW', 'B', 'fx', 'background-color' ], // must contains D, since contained widget would have absolute position, which can not tell correct size.
                titlebarNode: {
                        src: 'ttl',
                        props: ['F', 'B', 'background-color', 'height', 'fx', 'text-align', 'vertical-align']
                    },
                titleNode : {
                    src: 'ttl',
                    props: ['vertical-align', 'P', 'text-decoration']
                }
            },
            
            /**
             * Flag to indicate whether content widget is in Fixed or Fit-to-Content height mode.
             * If Fixed height mode, 'height' comes from 'fmts';
             * If Fit-to-content mode, use content's dimNode to find content height, and set this property to '1' to update portlet container & ahadow nodes. 
             */
            fc: false, //Fix height mode
            
            /**
             * Property points to content widget.
             * 
             */
            content: null,
            /**
             * Property points to the toolbar widget.
             */
            toolbar: null,
            /**
             * Property points to the left toolbar widget.
             */
            leftToolbar: null,
            /**
             * Property indicates whether the toolbar should be embedded in the portlet or floating outside it
             */
            floatingToolbar: false,
            /**
             * The strategy for title related dimension calculation.
             */
            _ts: ETS,
            /**
             * Override getCacheKey to make portlet css cache do not collapse with embedded widget's css cache
             */
            getCacheKey: function getCacheKey(w){
                return this._super(w) + '-portlet';
            },
            /**
             * Override getFormats to return the formats, which we piggy back on content's formats collection
             */
            getFormats: function() {
                var c = this.content,
                f = c && c.getFormats();
                
                return f && f[P_FMTS];
            },
            
                updateContentHeight: function(bHide){
                var pf = this.getFormats(),
                    cnt = this.content,
                    node = cnt.dimNode  || cnt.domNode;
                    
                if (node){
                        var ch;
                        if (bHide) {
                            ch = 0;
                        } else {
                            ch = (this.fc) ? node.offsetHeight : (pf.height ? parseInt(pf.height) : 0);
                        }

                        var  h = ch + ((pf.ttl && parseInt(pf.ttl.height, 10)) || 0) + 'px';
                    this.containerNode.style.height = h;
                    this.shadowNode.style.height = h;
                }
            },
            
            
            /**
             * @see mstrmojo.Obj
             */
            init: function init(props) {
                //Call super
                this._super(props);
                
                var content = this.content;

                //Do we have a content node and does it have a formatting object? Have we not created the portlet's formatting object?
                //**This cannot be done in preBuil Rendering because when we're incrementally rendering documents, we need the formats to determine whether the portlet is in the viewport.
                if (content && content.getFormats() && !this.getFormats()) {
                    // 1. build portlet's formats, if have not done.
                    this._createFormats();
                }
            },
            
            /**
             * In preBuildRendering, we are going to adjust width/height for content widget before it gets rendered
             */
            preBuildRendering: function preBuildRendering() {
                // Choose title related dimension calculation strategy.
                var ts = this._ts = (this.floatingTitle) ? FTS : ETS;
                
                //Call super
                this._super();
                
                // Adjust title appearance.
                ts.adjustTitleCss(this);
                
                var displayNone = "display:none;";

                    if (this.isInFilterPanel()) {
                      f = _H.clone(this.formatHandlers);   
                      f.portletContainerNode = ['z-index', 'height', 'B', 'backgroud-color'];
                      f.shadowNode = ['z-index', 'height', 'B', 'fx', 'background-color'];
                      this.formatHandlers = f;  
                    }
                    
                if (!this.leftToolbar){
                    this.leftToolbarNodeCssText += displayNone;
                }

                if (!this.toolbar){
                    this.toolbarNodeCssText += displayNone;
                }

                // Does the portlet have left, top or right border?
                var borderWidths = mstrmojo._Formattable.getBorderWidths(this);
                if (borderWidths.l || borderWidths.t || borderWidths.r) {
                    // Change border css to indicate that this portlet have a border.
                    this.borderCss = 'has-border';
                }
             },
             
            /** 
             * If this has floating title, we need to move it to under the body node. TQMS #394036
             */
            postBuildRendering: function() {
                if (this.floatingTitle && this.titleNode) {
                    // move whole title under <body>
                    document.body.appendChild(this.titleNode);
                    
                    // attach event listener to mouse over/out the portlet node
                     mstrmojo.requiresCls("mstrmojo.dom", "mstrmojo.css");
                    var dom = mstrmojo.dom,
                        css = mstrmojo.css,
                        d = this.contentNode,
                        t = this.titleNode,
                        me = this;
                    if (!this._onhover){
                        // hover for toolbar
                        this._onhovertt = function() {
                            // make it visible
                            css.addClass(me.titleNode, ['visible']);
                            me._onflt = true;
                            return true;
                        };
                        // hover off for toolbar
                        this._onhoverofftt = function() {
                            css.removeClass(me.titleNode, ['visible']);
                            me._onflt = false;
                            return true;
                        };
                        // hover for portlet
                        this._onhover = function(evt, hWin) {
                            var t = me.titleNode;
                            // make it visible
                            css.addClass(t, ['visible']);
                            // adjust position first
                            var p = dom.position(me.contentNode, true);
                            t.style.top = (p.y - t.clientHeight + 2) + 'px'; // plus 2 to make sure the toolbar connects to the portlet, so moving to toolbar would not close it 
                            t.style.left = p.x + 'px';
                            return true;
                        };
                        // hover off for portlet
                        this._onhoveroff = function(evt, hWin) {
                            css.removeClass(me.titleNode, ['visible']);
                            return true;
                        };
                    }
                    dom.attachEvent(d, 'mouseover', this._onhover);
                    dom.attachEvent(d, 'mouseout', this._onhoveroff);
                    // attach listener for toolbar
                    dom.attachEvent(t, 'mouseover', this._onhovertt);
                    dom.attachEvent(t, 'mouseout', this._onhoverofftt);
                }
                if (this._super) {
                    this._super();
                }
                
                //If content widget is in Fit-to-content height mode, use content height to solve background-color and shadow issue:
                var pf = this.getFormats();
                this.set('fc', pf && !pf.height);
                    
                    if (this.isInFilterPanel()) {
                        this.portletContainerNode.style.width = this.shadowNode.style.width = this.parent.contentWidth + 'px';
                        this.portletContainerNode.style.top = this.shadowNode.style.top = this.parent.topStart + 'px';
                        this.portletContainerNode.style.left = this.shadowNode.style.left = ITEM_SPA + 'px';
                    }
            },
            /**
             * When unrender, we need to detach the event listerners we attached to DOM node.
             */
            unrender: function(ignoreDom) {                    
                
                if (this.floatingTitle && this.titleNode) {
                    var d = this.domNode,
                        t = this.titleNode,
                    dom = mstrmojo.dom;
                    
                    if (d && this._onhover){
                        dom.detachEvent(d, 'mouseover', this._onhover);
                    }
                    if (d && this._onhoveroff) {
                        dom.detachEvent(d, 'mouseout', this._onhoveroff);
                    }
                    // attach listener for toolbar
                    if (t && this._onhovertt) {
                        dom.detachEvent(t, 'mouseover', this._onhovertt);
                    }
                    if (t && this._onhoverofftt) {
                        dom.detachEvent(t, 'mouseout', this._onhoverofftt);
                    }
                    
                    if(t) {
                        document.body.removeChild(t);
                    }
                }
                if (this._super) {
                    this._super(ignoreDom);
                }                    
            },
            
            updateStyle: function (h, w) {
                var snStyle = this.shadowNode.style;
                snStyle.height = h;
                snStyle.width = w;
                var cnStyle = this.containerNode.style;
                cnStyle.height = h;
                cnStyle.width = w;
            },
            /** 
             * Builds portlet formats collection and adjusts content's formats collection
             * 
             * @private
             */
            _createFormats: function() {
                var c_f = this.content && this.content.getFormats(),
                    f;
                // create collection, which is piggy back on content's formats collection
                f = c_f.p_fmts = {};
                var i, p;
                // move certain properties
                for (i in MOVE_FMTS) {
                    p = MOVE_FMTS[i];
                    if (p in c_f) {
                        f[p] = c_f[p];
                        delete c_f[p];
                    }
                }
                // copy certain properties
                for (i in COPY_FMTS) {
                    p = COPY_FMTS[i];
                    if (p in c_f) {
                        f[p] = c_f[p];
                    }
                }
                // Q: Do we need to set top/left to 0?
                
                // adjust content height because of title
                c_f.height = this._ts.getContentHeight(c_f.height, f);
                
                // TQMS 392517, IE shows transparent shadow when the shadow does not have a background color.
                // if shadow exists but no background color, we set a default one on it
                if (mstrmojo.dom.isIE&&f.fx && f.fx.ds && !f['background-color']){
                    f['background-color'] = '#ffffff';
                }
            },
            
            /**
            * Manually calls refresh on all panels within this portlet.
            * @see mstrmojo.Widget
            */
            refresh: function refresh() {
                if (!this.hasRendered) {
                    return;
                }
                                    
                // Manually call refresh on all children rather than rebuild html for PanelStack.
                var c = this.children,
                    i;
                for (i = c.length - 1; i >= 0; i--) {
                    c[i].refresh();
                }
                    this._super();
                },
                
                isInFilterPanel: function() {
                    var p = this.parent,
                        en = mstrmojo.EnumRWUnitType;
                    if (p && p.defn && p.defn.t == en.PANEL) {
                        var ps = p.parent;
                        return (ps && ps.defn && ps.defn.ifp);
                    }
                    return false;
                },
                
                getFilterPanel: function(){
                    var p = this.parent,
                        en = mstrmojo.EnumRWUnitType;
                    if (p && p.defn && p.defn.t == en.PANEL) {
                        var ps = p.parent;
                        return (ps && ps.defn && ps.defn.ifp) ? ps : null;
                    }
                    return null;
                },
                
                
                getContainerHeight: function() {
                    return this.containerNode.clientHeight;
                },
                
                relocate: function(top, width) {
                    if (this.isInFilterPanel()) {
//                        if (parseInt(this.portletContainerNode.style.width) != width) {
//                            // vertical scrollbar show up/off will cause the panel clientWidth changes
//                            this.refresh();
//                        } else {                            
                            this.portletContainerNode.style.top = this.shadowNode.style.top = top + 'px';
//                        }
                    }
            },
            
            /**
             * <p>Resizes the DocPortlet for the new dimensions.</p>
             * 
             * <p>NOTE: This method will modify the passed in dimensions to remove size for borders and titlebar.
             * 
             * @param {Object} d The new dimensions (with "h" property for height and "w" property for width).
             */
            setInfoWindowDimensions: function setInfoWindowDimensions(d) {
                var domNodeStyle = this.domNode.style,
                    shadowStyle = this.shadowNode.style,
                    containerStyle = this.portletContainerNode.style,
                    borderWidths = mstrmojo._Formattable.getBorderWidths(this);
                
                // Adjust dimensions for borders.
                d.h -= borderWidths.h;
                d.w -= borderWidths.w;
                
                // Set adjust dimensions onto the shadow, container and dom node.
                shadowStyle.height = containerStyle.height = domNodeStyle.height = d.h + 'px';
                shadowStyle.height = containerStyle.width = domNodeStyle.width = d.w + 'px';
                
                // Remove title bar from dimension height.
                d.h -= this.titleNode.offsetHeight;
                
                // Hide close button.
                this.toolbarNode.style.display = 'none';
            }
        }
    );
    
    /**
     * State constants for interactive title bars.
     * 
     * @private
     * @ignore
     */
    var ST_RESTORE = 0;
    var ST_MIN = 1;
    var ST_MAX = 2;
    mstrmojo.requiresCls("mstrmojo.DocPortlet", "mstrmojo.boxmodel", "mstrmojo.array");

    mstrmojo.DocResizablePortlet = mstrmojo.declare(
            // super
            mstrmojo.DocPortlet,
            // mixin
            null,
            // instance properties and methods
            {
                scriptClass : 'mstrmojo.DocResizablePortlet',
                /**
                 * Indicates whether load data on resize task
                 */
                loadDataOnResize: false,
                /**
                 * Overrides to keep some format information relates to min/max/restore actions.
                 */
                _createFormats: function() {
                    // call super
                    this._super();
                    
                    var f = this.getFormats();
                    
                    // record normal state value
                    var ds = this.defn.ds;    // WindowState
                    
                    // For min/max mode, the width/height/top/left come in as normWidth/normHeight/normTop/normLeft
                    // Is the current WindowState 'Normal'?
                    if (ds === ST_RESTORE) {
                        // Cache current formatting values for after the portal is maximized or minimized client-side, then restored again.
                        f.normHeight = f.height;
                        f.normWidth = f.width;
                        if (f['z-index'] !== null && f['z-index'] !== undefined) {
                            f.normZIndex = f['z-index'];
                        }
                    }
                    
                    // Is the current WindowState NOT 'Maximized'?
                    if (ds !== ST_MAX) {
                        f.normTop = f.top;
                        f.normLeft = f.left;
                    }
                },
                /**
                 * Maximizes the portlet and its children.
                 */
                onmaximize: function() {
                    
                    var p = this.parent,
                        c = this.content,
                        c_f = c && c.getFormats(),
                        f = this.getFormats(),
                        oh = f.height,
                        ow = f.width,
                        bw = mstrmojo._Formattable.getBorderWidths(this);
                    
                    this.clearCache();
                    c.clearCache();
                                            
                    // portlet height = parent height - component top/bottom border height
                    f.height = (parseInt(p.height(), 10) - bw.h) + 'px';
                    // component height = parent height - title bar height - component top/bottom border height
                    c_f.height = this._ts.getContentHeight(f.height, f);
                    // portlet/component width = parent width - component left/right border width
                    f.width = c_f.width = (p.width() - bw.w) + 'px';
                    f.top = f.left = 0;
                    f['z-index'] = p.getMaxZIndex() + 1;
                    
                    // updates window state
                    this._updateWindowState(ST_MAX, oh, ow);
                },
                /**
                 * Minimizes the portlet and its children, only leaves title bar visible if title bar was visible.
                 */
                onminimize: function() {
                    
                    var c = this.content,
                        node = c.dimNode  || c.domNode,
                        c_f = c && c.getFormats(),
                        f = this.getFormats(),
                        oh = f.height || node.offsetHeight,
                        ow = f.width;

                    this.clearCache();
                    c.clearCache();
                    
                    // portlet's and components' width = normal width 
                    f.width = c_f.width = f.normWidth;
                    // portlet's top = normal top
                    f.top = f.normTop;
                    // portlet's lef = normal left
                    f.left = f.normLeft;
                    // portlet's z-index = normal z-index
                    if (f.normZIndex !== null && f.normZIndex !== undefined) {
                        f['z-index'] = f.normZIndex;
                    }

                    // component's height = 0 
                    c_f.height = 0;
                    // portlet's height = title bar's height
                    f.height = this._ts.getPortletMinHeight(f);

                    // updates window state
                    this._updateWindowState(ST_MIN, oh, ow);
                },
                /**
                 * Restores the portlet and its children from maximized state or minimized state.
                 */
                onrestore: function() {

                    var c = this.content,
                        c_f = c && c.getFormats(),
                        f = this.getFormats(), 
                        oh = f.height,
                        ow = f.width;
                    
                    this.clearCache();
                    c.clearCache();
                    
                    // portlet's normal height
                    f.height = f.normHeight;
                    // component's normal height = portlet's height - title bar height
                    c_f.height = this._ts.getContentHeight(f.height, f);
                    // portlet's and components' width = normal width 
                    f.width = c_f.width = f.normWidth;
                    // portlet's top = normal top
                    f.top = f.normTop;
                    // portlet's lef = normal left
                    f.left = f.normLeft;
                    // portlet's z-index = normal z-index
                    if (f.normZIndex !== null && f.normZIndex !== undefined) {
                        f['z-index'] = f.normZIndex;
                    }

                    // updates window state
                    this._updateWindowState(ST_RESTORE, oh, ow);
                },
                /**
                 * Collapse the portlet, special used for selector                 
                 */
                oncollapse: function() {
                    this._updateWindowState(ST_MIN);                
                },
                /**
                 * Expand the portlet, special used for selector
                 */
                onexpand: function() {
                    // updates window state
                    this._updateWindowState(ST_RESTORE);                    
                },
                /**
                 * Updates window state information in definition. 
                 * This would inform any portlet which listens to 'ds' change event about 
                 * the changed window state, then in turn invoke their onWindowStateChange() handler,
                 * which would update their size according to the new state.
                 */
                _updateWindowState: function(v, oh, ow) {

                    // 3. Save new properties
                    var w = this.content,
                        px = mstrmojo.boxmodel.px2Inches,
                        m = w.model.docModel || w.model,
                        f = this.getFormats(),
                        props = {},
                        callback = {},
                        me = this;

                    // Create the rw unit properties parameters.
                    if (oh !== undefined && ow !== undefined) {
                    props[w.k] = {
                        OldHeight: px(m, oh),
                        OldWidth: px(m, ow),
                        //// component height in saved property includes title height, which we reduced in preBuildRendering
                        Height: px(m, parseInt(f.height, 10)), //(ns === ST_MIN) ? 0 : px(m, parseInt(f.height, 10) + ttlH + borderH),
                        Width: px(m, parseInt(f.width, 10)), //px(m, parseInt(f.width, 10) + borderW),
                        ZIndex: f['z-index'],
                        WindowState: v
                    };
                    
                        callback.success = function(res) {
                            var data = res && res.data;
                            if (data){
                                var w = me.content,
                                    m = w.model;
                                m.loadPartialData(data, me.content && me.content.k);
                                
                            }
                            // 1. Update window state in definition
                            var defn = me.content && me.content.defn;
                            if (defn){
                                defn.set('ds', v); // this will trigger ds_change event
                            }
    
                            // Cache the height and width before we change them.
                            var p = me.parent;
    
                            // 2. Tell the subsection to potentially resize itself to fit the portal.
                            if ('adjustSectionSize' in p) {
                                p.adjustSectionSize();
                            }                            
                        };
                    } else {
                        // for selector portlet collapse/expand, we don't need to save dimention information
                        props[w.k] = {
                                ZIndex: f['z-index'],
                                WindowState: v
                            };
                        
                        // for selector portlet, we can expand/collapse the portlet directly without waiting for task response
                        var defn = this.content && this.content.defn;
                        if (defn){
                            defn.set('ds', v); // this will trigger ds_change event
                        }
                    }
                    
                    // Save the new properties to the server.
                    m.saveRWProps(this.content && this.content.k,
                                props, 
                                1, 
                                this.loadDataOnResize,
                                callback, 
                                true);

                },
                /**
                 * Sets event listeners to hear when the definition WindowState changes as well as whenever one of the interactive title bar buttons is clicked.
                 *
                 * @ignore
                 * @see mstrmojo._HasMarkup
                 */
                postBuildRendering: function postBuildRendering() {
                    // Cache widget id.
                    var id = this.id;

                    // Set an event listener to hear when the portal state changes in the definition.
                    if (!this._sub_dsChange) {
                        this._sub_dsChange = this.defn.attachEventListener('dsChange', id, this.onWindowStateChange);
                    }

                    return this._super();
                },
                
                /**
                 * Handles resizing portlet and its content when window state changed
                 */
                onWindowStateChange: function() {
                    // When window state change, the portlet, which change originated
                    // from, has made changes to both portlet's and content's formats.
                    
                    // 1. Here we need to resize DOM node corresponding to portlet and content.
                    // This portlet maybe and maybe not the portlet which originated the change.
                    if (!this.content) {
                        // if there is no content, we do not have formats collection to 
                        // inform the change.
                        return;
                    }
                    
                    var c = this.content,
                    ubs = function(btns) {
                        mstrmojo.array.forEach(btns, function(b){
                            // for the button whose corresponding window state is current state, should be hidden
                            if ('ds' in b) {
                                b.set('visible', b.ds !== c.defn.ds);
                            }
                        });                    
                    };
                    if (this.isInFilterPanel()) {
                        //2. adjust the component height
                        c.set('visible', this.defn.ds == ST_RESTORE);
                        this.updateContentHeight(this.defn.ds != ST_RESTORE);
                        
                        //3. update buttons' state
                        ubs(this.leftToolbar && this.leftToolbar.children);
                        
                        //4. relocate all the selectors
                        var p = this.parent;
                        if (p.refreshFP) {
                            p.refreshFP();
                        }
                    } else {
                    // Resize the dom node to the new values.
                        var c_f = c.getFormats(), // content formats
                        p_f = this.getFormats(),   // portlet formats
                        ps = this.portletContainerNode.style,
                        ss = this.shadowNode.style,
                        cs = this.contentNode.firstChild.style;
                    
                    // adjust component
                    cs.height = c_f.height;
                    cs.width = c_f.width;
                    
                    // adjust portlet
                    ss.height = ps.height = p_f.height;
                    ss.width = ps.width = p_f.width;
                    ss.top = ps.top = p_f.top;
                    ss.left = ps.left = p_f.left;
                    
                    if ('z-index' in p_f) {
                        ss.zIndex = ps.zIndex = p_f['z-index'];
                    }
                    
                    // 2. We need to update buttons' state
                        ubs(this.toolbar && this.toolbar.children);
                    
                    // 3. ask content to perform any necessary updates for changed size
                    if (c.resize){
                        c.resize();
                    }
                    }
                }
            }
        );
}());