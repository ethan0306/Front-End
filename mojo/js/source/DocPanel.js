(function(){

    mstrmojo.requiresCls("mstrmojo.Container",
        "mstrmojo._Formattable",
        "mstrmojo._ContainsDocObjects",
                         "mstrmojo._HasBuilder",
                         "mstrmojo.css");

    var $CSS = mstrmojo.css;

    var ITEM_SPA = 2;
    /**
     * Get for containing panel.
     * @private
     */
    function getAncestorPanel(pnl) {
        var p = pnl.parent.parent;
        return (p && p instanceof mstrmojo.DocPanel) ? p : null;
    }

    /**
     * Report Services Document Panel.
     * @class
     * 
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
     * @borrows mstrmojo._Formattable#getFormats as #getFormats
     * 
     * @borrows mstrmojo._ContainsDocObjects#height as height
     * @borrows mstrmojo._ContainsDocObjects#width as width
     * @borrows mstrmojo._ContainsDocObjects#getMaxZIndex as getMaxZIndex
     * 
     * @borrows mstrmojo._HasBuilder#postBuildRendering as #postBuildRendering
     * @borrows mstrmojo._HasBuilder#buildChildren as #buildChildren
     */
    mstrmojo.DocPanel = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [mstrmojo._Formattable, mstrmojo._ContainsDocObjects, mstrmojo._HasBuilder],
        
        /**
         * @lends mstrmojo.DocPanel.prototype
         */
        {
            scriptClass: "mstrmojo.DocPanel",
                        
            /**
             * Whether this panel is visible.
             *
             * @type boolean
             * @default false
             */
            visible: false,
            
            /**
             * Whether this panel is selected in it's parent panel stack.
             *
             * @type boolean
             * @default false
             */
            selected: false,

            cssDisplay: 'block',
                        
            // record the top start point for next child, only used for filter panel
            // start at 2 because we want to spacing between the first selector and the panel title bar 
            topStart: ITEM_SPA,
            
            // special used for filter panel, record the width for chlid items
            contentWidth: 0,
            
            markupString: '<div id="{@id}" class="mstrmojo-DocPanel" style="{@cssText}{@domNodeCssText}">' +
                              '<div class="mstrmojo-DocSubPanel-content" style="height:100%;width:100%;position:absolute;{@containerNodeCssText}"></div>' +
                              '<div class="mstrmojo-DocSubPanel-title">{@title}</div>' +
                          '</div>',

            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? this.cssDisplay : 'none'; }
            },
            
            markupSlots: {
                containerNode: function () { return this.domNode.firstChild; },
                titleNode: function () { return this.domNode.lastChild; }
            },
            
            formatHandlers: {
                containerNode: [ 'background-color', 'fx', 'overflow']
            },

            title: '',
            
            /**
             * Sets this panel's title according to the given node definition, if any.
             *
             * @ignore
             */
            init: function init(props) {
                this._super(props);
                
                // Do we have a title?
                if (!this.title) {
                    // No, then retrieve it from the definition.
                    this.title = this.node.defn.ttl || '';
                }
            },
            
            /**
             * Only render children for selected panels.
             *
             * @ignore
             */
            childRenderCheck: function childRenderCheck(c) {
                return (this._super(c) && this.selected);
            },

            postBuildRendering: function postBuildRendering() {
                // Is the panel NOT loaded and is this render NOT the result of a forced render?
                if (!this.defn.l && !this._forceRender) {
                    // Add placeholder class.
                    $CSS.addClass(this.domNode, 'placeholder');
                }

                return this._super();
            },

            onselectedChange: function onselectedChange(evt) {
                // Is the panel newly selected?
                if (evt.value) {
                    // Make sure the children are rendered.
                    this.renderChildren();
                }
            },

            /**
             * Manually calls refresh on all objects within this panel.
             * 
             * @ignore
             * @see mstrmojo.Widget
             */
            refresh: function refresh() {
                // Have we NOT already rendered?
                if (!this.hasRendered) {
                    // Nothing to do.
                    return;
                }
                
                // If the panel is not selected now it means it was just requested from the server (lazy loading) so we need to force a render to
                // build children.
                if (!this.selected) {
                    // Clear built children flag...
                    if (!this.children) {
                        this.builtChildren = false;
                    }

                    // cache forced status...
                    this._forceRender = true;

                    // let super handle the refresh...
                    this._super();

                    // and clear forced status.
                    delete this._forceRender;

                } else {
                // Manually call refresh on all children rather than rebuild html for PanelStack.
                    var c = this.children || [],
                        i;

                    for (i = c.length - 1; i >= 0; i--) {
                    c[i].refresh();
                }
                }
            },

            /**
             * Updates the dimensions and position of the panel.
             *
             * @param {Integer} left The left position of the panel.
             * @param {Integer} height The height of the panel.
             * @param {Integer} width The width of the panel.
             *
             */
            updatePanelDimensions: function updatePanelDimensions(left, height, width) {
                // Replace the cssText property with the new values.
                this.cssText = 'left:' + left + 'px;top:0;height:' + height + 'px;width:' + width + 'px;';

                // Have we already rendered?
                if (this.hasRendered) {
                    // Grab the style collection from the domNode.
                    var ps = this.domNode.style;

                    // Set left height and width for the panel to the new values.
                    ps.left = left + 'px';
                    ps.height = height + 'px';
                    ps.width = width + 'px';
                }
            },
            
            /**
             * Adds (or removes) this panels key to it's own store of dirty keys.
             * 
             * @param {Boolean} isDirty Whether this panel is dirty or not.
             */
            setDirty: function setDirty(isDirty) {
                var mth = ((isDirty) ? 'add' : 'remove') + 'DirtyKey';
                this[mth](this.k);
            },
            
            /**
             * Adds the supplied key to this panels dirty key collection.  This method also raises the key to any ancestor panels.
             * 
             * @param {String} key The key of the dirty widget.
             */
            addDirtyKey: function addDirtyKey(key) {
                // Cache the dirtyKeys (or empty object).
                var d = this.defn;
                var hash = d.dirtyKeys || {};
                
                // Add the passed in key.
                hash[key] = true;
                
                // Store the dirtyKeys back on the definition.
                d.dirtyKeys = hash;
                
                // Pass to parent of parent (if Panel).
                var p = getAncestorPanel(this);
                if (p) {
                    p.addDirtyKey(key);
                }
            },
            
            /**
             * Removes the supplied key from this panels dirty key collection.  This method also raises the key to any ancestor panels.
             * 
             * @param {String} key The key of the clean widget.
             */
            removeDirtyKey: function removeDirtyKey(key) {
                // Is there an ancestor that is also a Panel?
                var p = getAncestorPanel(this);
                if (p) {
                    // Yes, then tell that panel to remove the dirty key as well.
                    p.removeDirtyKey(key);
                }
                
                // Grab the dirty keys collection.
                var d = this.defn.dirtyKeys;
                
                // Did we find any dirty keys?  
                if (!d) {
                    // Dirty keys may not be there if the panel was not previously downloaded when the slice occurred, so return.
                    return;
                }
                
                // Delete this key from the collection.
                delete d[key];
                
                // Do any keys remain?
                if (!mstrmojo.hash.isEmpty(d)) {
                    // Yes, then return.
                    return;
                }
                
                // No dirty keys left so delete the collection.
                delete this.defn.dirtyKeys;
            },
            
            renderChildren: function rnCh() {   
                var ch = this.children;
                if (ch && (this._isFP() || this._isFSP())) {
                    // adjust the children items by z-index
                    ch.sort(function(l,r) {
                        l = (l.content) ? l.content : l;
                        r = (r.content) ? r.content : r;
                        var lz = (l.getFormats() && l.getFormats()['z-index']) ? l.getFormats()['z-index'] : 0,
                            rz = (r.getFormats() && r.getFormats()['z-index']) ? r.getFormats()['z-index'] : 0;
                        return lz - rz;
                    });                    
                }
                
                if (this._isFP()) {     //Is Filter Panel
                    if (ch) {
                        // render each children and sum the current children height for next child rendering top start point
                        // TODO: we need to consider the vertical scrollbar width if it show up
                        var ocw = this.domNode.clientWidth - 2 * ITEM_SPA
                        for (var i=0,len=ch&&ch.length||0; i<len; i++) {
                            var cw = this.domNode.clientWidth - 2 * ITEM_SPA;
                            this.contentWidth = (cw > 0) ? cw : 0;
                            
                            if (cw != ocw) {    
                                //vertical scrollbar show up, we need to redraw previous rendered children
                                this.topStart = ITEM_SPA;
                                for (var j=0; j<i; j++) {
                                    var oc = ch[j];
                                    oc.refresh();                                                                  
                                    if (oc.getContainerHeight) {
                                        this.topStart += oc.getContainerHeight() + ITEM_SPA;
                                    }
                                }
                            }
                            
                            var c = ch[i];
                            if (this.childRenderCheck(c)) {
                                c.render(null);    
                                                           
                                if (c.getContainerHeight) {
                                    this.topStart += c.getContainerHeight() + ITEM_SPA;
                                }
                            }
                        }
                    }
                } else {
                    this._super();
                } 
            },

            
            refreshFP: function() {
                if (!this.hasRendered) {
                    return;
                }
                
                var ch = this.children;
                this.topStart = ITEM_SPA;  //2px gap between each selectors
                var cw = this.domNode.clientWidth - 2 * ITEM_SPA;
                this.contentWidth = (cw > 0) ? cw : 0;
                
                // reset the top of each children
                for (var i=0,len=ch&&ch.length||0; i<len; i++) {
                    var c = ch[i];
                    if (c.relocate) {
                        c.relocate(this.topStart, this.contentWidth);
                    }
                                                   
                    if (c.getContainerHeight) {
                        this.topStart += c.getContainerHeight() + ITEM_SPA;
                    }
                }
            },
            
            getChildren: function getChildren(){                
                var ch = this.model.getChildren(this.node, false);
                
                if (this._isFP() || this._isFSP()) {
                    for (var i=0,len=ch&&ch.length||0; i<len; i++) {
                        var c = ch[i];
                        if (this._isFP() && !c.defn.iifp) {
                            c.defn.iifp = true; //iifp: is inside the filter panel
                        }
                        if (this._isFSP() && !c.defn.iifs) {
                            c.defn.iifs = true; //iifs: is inside the filter summary
                        }
                    }
                }
                
                return ch;
            },
            
            // is a filter panel
            _isFP: function() { 
                return this.parent.defn.ifp;
            },
            
            // is a filter summary panel
            _isFSP: function() {
                return this.parent.defn.ifsp;
            }
                
        }
    );
    
}());