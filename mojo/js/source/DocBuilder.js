(function () {

    mstrmojo.requiresCls("mstrmojo.EnumRWUnitType",
                         "mstrmojo.DocLayout",
                         "mstrmojo.DocLayoutHoriz",
                         "mstrmojo.DocSection",
                         "mstrmojo.DocSubsection",
                         "mstrmojo.DocTextfield",
                         "mstrmojo.DocXtabModel",
                         "mstrmojo.XtabBase",
                         "mstrmojo.DocPortlet",
                         "mstrmojo.DocResizablePortlet",
                         "mstrmojo.DocXtabGraph",
                         "mstrmojo.DocGridGraph",
                         "mstrmojo.DocLine",
                         "mstrmojo.DocImage",
                         "mstrmojo.DocHTMLContainer",
                         "mstrmojo.DocRectangle",
                         "mstrmojo.DocRoundRectangle",
                         "mstrmojo.DocPanel",
                         "mstrmojo.DocSelector",
                         "mstrmojo.DocActionSelector",
                         "mstrmojo._HasDocLink",
                         "mstrmojo.DocVisualization",
                         "mstrmojo.DynamicClassFactory",
                         "mstrmojo._Formattable",
                         "mstrmojo._IsDocXtab",
                         "mstrmojo._IsSelectorTarget",
                         "mstrmojo.DocInfoWindow",
                         "mstrmojo.AndroidVisList",
                         "mstrmojo.maps.AndroidDocMap",
                         "mstrmojo._CanSupportTransaction",
                         "mstrmojo._IsEditableXtab",
                         "mstrmojo._IsEditableTextfield",
                         "mstrmojo.maps.MapInfoWindowLayoutViewer"
                     );
    /**
     * <p>Define the clsMap property here (so we can use the enumeration for object types).</p>
     *
     * @type Object
     * @private
     * @ignore
     */
    var en = mstrmojo.EnumRWUnitType,
        clsMap = {};

    clsMap[en.LAYOUT] = {n: "Layout"};
    clsMap[en.HEADER] =
        clsMap[en.FOOTER] =
        clsMap[en.PAGEHEADER] =
        clsMap[en.PAGEFOOTER] =
        clsMap[en.DETAILS] =        { n: "Section", scriptClass: "mstrmojo.DocSection" };
    clsMap[en.SUBSECTION] =         { n: "SubSection", scriptClass: "mstrmojo.DocSubsection" };
    clsMap[en.TEXTFIELD] =          { n: "Textfield", scriptClass: "mstrmojo.DocTextfield" };
    clsMap[en.GRID] =               { n: "Xtab", scriptClass: "mstrmojo.DocXtab" };
    clsMap[en.GRAPH] =              { n: "XtabGraph", scriptClass: "mstrmojo.DocXtabGraph" };
    clsMap[en.GRIDGRAPH] =          { n: "GridGraph", scriptClass: "mstrmojo.DocGridGraph" };
    clsMap[en.SELECTOR] =           { n: "Selector", scriptClass: "mstrmojo.DocSelector" };
    clsMap[en.LINE] =               { n: "Line", scriptClass: "mstrmojo.DocLine" };
    clsMap[en.IMAGE] =              { n: "Image", scriptClass: "mstrmojo.DocImage" };
    clsMap[en.HTMLCONTAINER] =      { n: "HTMLContainer", scriptClass: "mstrmojo.HTMLContainer" };
    clsMap[en.RECTANGLE] =          { n: "Rectangle", scriptClass: "mstrmojo.DocRectangle" };
    clsMap[en.ROUNDEDRECTANGLE] =   { n: "RoundedRectangle", scriptClass: "mstrmojo.DocRoundRectangle" };
    clsMap[en.PANEL] =              { n: "Panel", scriptClass: "mstrmojo.DocPanel" };
    clsMap[en.VISUALIZATION] =      { n: "Visualization", scriptClass: "mstrmojo.DocVisualization" };
    clsMap[en.MOJOVISUALIZATION] =   {n: "MojoVisualization"};

    // Map to hold dynamically created link class constructors.
    var linkClsMap = {};

    var EXP_PDF = 3,
    EXP_EXCEL = 4;
    
    var $CFC = mstrmojo.DynamicClassFactory.newComponent;

    var _EH = mstrmojo.elementHelper;
    
    /**
     * Function used by maximize button in portlet to handle onclick event on it,
     * which basically call portlet's onmaximize() method.
     */
    var fMx = function () { return this.parent.parent.onmaximize(); },
        /**
         * Function used by restore button in portlet to handle onclick event on it,
         * which basically call portlet's onrestore() method.
         */
        fRs = function () { return this.parent.parent.onrestore(); },
        /**
         * Function used by minimize button in portlet to handle onclick event on it.
         * which basically call portlet's onminimize() method.
         */
        fMn = function () { return this.parent.parent.onminimize(); };
        /**
         * Function used by collapse button in portlet to handle onclick event on it.
         * which basically call portlet's oncollapse() method.
         */        
        fCo = function() {return this.parent.parent.oncollapse();};
        /**
         * Function used by expand button in portlet to handle onclick event on it.
         * which basically call portlet's onexpand() method.
         */        
        fEx = function() {return this.parent.parent.onexpand();};

    // Create dynamic DocXtab class.
    mstrmojo.DocXtab = $CFC(mstrmojo.XtabBase, [mstrmojo._Formattable, mstrmojo._IsDocXtab], {
        scriptClass: 'mstrmojo.DocXtab'
    });

    /**
     *  helper function to find out which widget can open specific Menu
     */
    var getPopupDelegate = function (/*Widget*/ widget, /*Function name*/ openMenu){
        var w = widget;
        while (w) {
            if (w[openMenu]) {
                return w;
            }
            w = w.parent;
        }
        return null;
    };
    /**
     * Create a button for resizing portlet.
     *
     * @param {String} t The tooltip text to display in the button.
     * @param {String} c The css class(es) used to display the button image.
     * @param {Function} fn The function to execute when the button is clicked.
     * @param {Integer} bds The display state for the button.
     * @param {Boolean} cds The current display state of the portal.
     *
     * @returns {Object} The button config.
     * @private
     *
     * @refactoring Could we tie the visibility to bindings?
     */
    function createResizeButton(t, c, fn, bds, cds) {
        return mstrmojo.Button.newIconButton(t, c, fn, null, {
            ds: bds,
            visible: (cds !== bds)
        });
    }

    /**
     * <p>Builds the document object model based on the supplied {@link mstrmojo.DocModel}.</p>
     *
     * <p>DocBuilder dynamically instantiates DocLayout widgets and their descendant widgets, based upon
     * given data model.  The data model (typically an mstrmojo.DocModel) is assumed to expose the following methods:</p>
     *
     * <dl>
     *     <dt>getChildren(node, onComplete)</dt>
     *     <dl>Fetches the child data nodes of a given data node from the model.  If node is given as null, then the model is assumed to retrieve the
     *         highest-level child nodes, which typically means the list of layouts in a DocModel.  This call may be asynchronous, and so the
     *         caller provides callbacks for the results rather than expecting an immediate synchronous return value. The callbacks are assumed
     *         to be optional.</dl>
     *     <dt>type(node)</dt>
     *     <dd>Returns the type of the given data node; assumed to be a value from the enumeration mstrmojo.EnumRWUnitType, or possibly null.</dd>
     *     <dt>getCurrentLayoutKey()</dt>
     *     <dd>Returns the key of the current layout (if any) in the model.  Assumed to be synchronous.</dd>
     * </dl>
     *
     * @class
     */
    mstrmojo.DocBuilder = mstrmojo.declare(
        // superclass
        mstrmojo.Obj,

        // mixins,
        null,

        /**
         * @lends mstrmojo.DocBuilder.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.DocBuilder",

            destroy: function destroy() {
                var selectorFactory = this.selectorFactory;
                if (selectorFactory) {
                    selectorFactory.destroy();
                }

                this._super();
            },

            /**
             * <p>A hash map of classes to instantiate for each view type.</p>
             *
             * <p>Items are keyed by the DSSXMLObjectType value.  The value for each item will be an object with the following optional properties:</p>
             *
             *  <dl>
             *      <dt>n</dt>
             *      <dd>The name of a custom method on the builder to call for this object type.  The methods are prefixed with "new" but the property value should not
             *          contain the prefix, e.g., to build a layout the property name would be "Layout" but the method name would be "newLayout".</dd>
             *      <dt>sc</dt>
             *      <dd>A string containing the name of the script class to use for this object type.  This property will only be used if the "n" property is not present
             *          or if the method identified in the "n" property is not present on the builder.</dd>
             *  </dl>
             *
             *  <p>Subclasses can either overwrite this map all together, or modify if during construction.</p>
             */
            classMap: clsMap,

            /**
             * Instantiates widgets for a given array of DocModel data nodes (which may each represent either a
             * layout, section, subsection, control, or even the entire DocModel).
             *
             * @param {Object[]} nodes The nodes to build.
             * @param {mstrmojo.DocModel} model The object model for the document.
             */
            build: function build(nodes, model) {
                var arr = [],
                    mthMap = this.classMap,
                    len = ((nodes && nodes.length) || 0),
                    i;

                for (i = 0; i < len; i++) {
                    // Determine which function to call to construct a widget for the given node.
                    var node = nodes[i],
                        // determine the type of object represented by node
                        t = (node && node.defn && node.defn.t) || mstrmojo.EnumRWUnitType.LAYOUT,
                        // determine the method name to build this object
                        config = mthMap[t],
                        fn = (config && config.n) ? "new" + config.n : '',
                        w;

                    // Do we have such a build method?
                    if (this[fn]) {
                        // The build method is defined, so call it to do the construction.
                        w = this[fn](model, node);

                    } else if (config && config.scriptClass) {
                        // No such method; but we do have a constructor name; so call the constructor directly.
                        var Cls = config.cls;
                        if (!Cls) {
                            var clz = config.scriptClass.split('.'),
                                z,
                                cnt;

                            Cls = window;

                            for (z = 0, cnt = clz.length; z < cnt; z++) {
                                Cls = Cls[clz[z]];
                            }
                        }

                        // Is this an image or text field and does it have a url property?
                        if ((t === en.TEXTFIELD || t === en.IMAGE) && (node.data.url || node.defn.url)) {

                            // Figure out if we need to hover as well as link.
                            var dataDlRef = node.data.dl,
                                defnDlRef = node.defn.dl,
                                useHover = (dataDlRef && dataDlRef.items && dataDlRef.items.length) || (defnDlRef && defnDlRef.items && defnDlRef.items.length > 0);

                            // Get dynamic class with links code mixed in.
                            Cls = this.getLinkDrillingClass(Cls, t, useHover);

                        } else if ((t === en.TEXTFIELD) && node.defn.txi) {
                            Cls = $CFC(Cls, [ mstrmojo._CanSupportTransaction, mstrmojo._IsEditableTextfield ]);
                        }

                        // Do we have a class constructor?
                        if (Cls) {

                            // Uncomment to log which widgets are being created during document construction
                            // mstrmojo.dbg("DocBuilder: class="+Cls.prototype.scriptClass + ", id="+node.id);


                            // Instantiate new Widget.
                            w = new Cls({
                                id: node.id,
                                node: node,
                                controller: this.parent.controller,
                                model: model
                            });
                        }
                    }

                    // Did we successfully construct a widget?
                    if (w) {
                        // Set common properties.
                        w.k = node.k;
                        w.formatResolver = model.formatResolver;
                        w.builder = this;
                        w.tooltip = node.data.tooltip || node.defn.tooltip || '';

                        // Does the widget not already have a definition node?
                        if (!w.defn) {
                            // Use defn from node.
                            w.defn = node.defn;
                        }

                        // Call wiget's update method (if any) to handle widget-specific properties.
                        if (w.update) {
                            w.update(node);
                        }

                        // create portlet if necessary
                        if ((node.defn.ttl !== undefined && t !== en.PANEL) || node.defn.qsm) {
                            w = this.createPortlet(t, node, w);
                        }

                        arr.push(w);
                    }
                }
                return arr;
            },

            /**
             * Wraps a supplied {@link mstrmojo.Widget} within a portlet control, that may be interactive through buttons.
             *
             * @param {Integer} t The type of widget as defined in {@link mstrmojo.EnumRWUnitType}.
             * @param {Object} node The data node as sent down in the JSON definition of the document.
             * @param {mstrmojo.Widget} w The Widget that will be contained within the returned portlet.
             *
             * @returns {mstrmojo.DocResizablePortlet|mstrmojo.DocPortlet}
             */
            createPortlet: function createPortlet(t, node, w) {
                var defn = node.defn,
                    ds = defn.ds,
            //If current node is inside a filter panel, we should make it resizable
            resizable = defn.iifp || !(t === en.PANELSTACK || (!defn.ttl && defn.qsm) || t === en.SELECTOR),
                    hasGraph = t === en.GRAPH || t === en.GRIDGRAPH,
                    children = [],
                    $NIB = mstrmojo.Button.newIconButton,
                    leftToolbarNodeCssClass = '',
            toolbarNodeCssClass = '',
            isExportGrid = t === en.GRID || t === en.GRAPH || t=== en.GRIDGRAPH || t === en.VISUALIZATION,
            toolbarNode = [];

                // Does the widget support quick switch?
                if (defn.qsm) {
                    leftToolbarNodeCssClass = 'qks';

                    // Create common button properties for quick switch.
                    var lc = 'mstrmojo-oivmSprite ',
                        lf = function () {
                            return this.parent.parent.content.quickSwitch();
                        },
                        lb = 'this.parent.parent.defn.qsm !== this.qsm';

                    // Add the left toolbar with quick switch view buttons.
                    children.push({
                        scriptClass: 'mstrmojo.ToolBar',
                        slot: 'leftToolbarNode',
                        alias: 'leftToolbar',
                        cssClass: (!resizable) ? 'grouped' : '',
                        children: [
                            $NIB(mstrmojo.desc(3547, 'View: Grid'), lc + 'tbGrid', lf, {
                                visible: lb
                            }, {
                                qsm : 1
                            }),
                            $NIB(mstrmojo.desc(3548, 'View: Graph'), lc + 'tbGraph', lf, {
                                visible: lb
                            }, {
                                qsm : 2
                            })
                        ]
                    });
                }

        if (isExportGrid) { 
            toolbarNodeCssClass = 'grid-menu';
            
            toolbarNode = {
                    scriptClass: 'mstrmojo.ToolBar',
                    slot: 'toolbarNode',  
                    alias: 'rightToolbar',
                    children: [{
                        scriptClass: "mstrmojo.MenuButton",
                        iconClass: "mstrmojo-oivmSprite tbDown",
                        itemIdField: 'did',
                        itemField: 'n',
                        itemChildrenField: 'subItms',
                        executeCommand: function(item){
                            var dl = getPopupDelegate(this, 'exportCmd');
                            dl && dl.exportCmd(item.did, w.k);
                        },
                        cm: [{ n: mstrmojo.desc(5212, "Export to PDF"), did: EXP_PDF }, { n: mstrmojo.desc(5213, "Export to Excel"), did: EXP_EXCEL}]
                    }]
                };
            
             children.push(toolbarNode);
    }
        
        
                // Does the widget support resizing?
                if (resizable) {
            if (defn.iifp) {
                leftToolbarNodeCssClass = 'wrap';
                
                // Add the left toolbar with collapse/expand buttons.
                children.push({
                    scriptClass: 'mstrmojo.ToolBar',
                    slot: 'leftToolbarNode',
                    alias: 'leftToolbar',
                    children: [
                        createResizeButton(mstrmojo.desc(8973, 'Collapse'), 'co', fCo, 1, ds),
                        createResizeButton(mstrmojo.desc(8972, 'Expand'), 'ex', fEx, 0, ds)
                    ]
                });
            } else {
                var btns = [createResizeButton(mstrmojo.desc(4539, 'Minimize'), 'mn', fMn, 1, ds),
                            createResizeButton(mstrmojo.desc(4540, 'Restore'), 'rs', fRs, 0, ds),
                            createResizeButton(mstrmojo.desc(4541, 'Maximize'), 'mx', fMx, 2, ds)];
                if(isExportGrid){
                    toolbarNode.children = toolbarNode.children.concat(btns);
                } else {
                    toolbarNodeCssClass = 'resize';
                    // Add the right toolbar with min/max/restor buttons.
                    children.push({
                        scriptClass: 'mstrmojo.ToolBar',
                        slot: 'toolbarNode',
                        alias: 'toolbar',
                        children: btns
                    });
                }
            }
                }

                // Set the slot on the contained widget.
                w.slot = 'contentNode';
                w.alias = 'content';
                w.title = defn.ttl || '';
        if (defn.iifp && !defn.sos) { // For search box selector, if it search on sever, we don't set element count 
            var es = node.data.elms,
                ces = node.data.ces;
            if (ces && es && es.length > 0) {
                w.count = _EH.buildElemsCountStr(ces, es);
            }
        }

                // Add the contained widget to the children.
                children.push(w);

                // PanelStack - build panel switching toolbar into slot 'leftToolbar'
                if (t === en.PANELSTACK) {
                    var iconCss = 'mstrmojo-oivmSprite ',
                        rc = [];

                    if (node.sw) {
                        leftToolbarNodeCssClass = 'pst-l';

                        // Add the left toolbar with panel switching arrow buttons.
                        children.push(
                            $NIB(mstrmojo.desc(1058, 'Previous'), iconCss + 'tbPrev', function () {
                                //call PanelStack widget's method
                                return this.parent.content.switchToPanel(this.dir);
                            }, {
                                enabled: 'this.parent.prevEnabled'
                            }, {
                                slot: 'leftToolbarNode',
                                alias: 'leftToolbar',
                                dir : -1 //go to previous panel
                            })
                        );
                    }

                    if (node.sw) {
                        rc.push($NIB(mstrmojo.desc(2917, 'Next'), iconCss + 'tbNext', function () {
                            //call PanelStack widget's method
                            return this.parent.parent.content.switchToPanel(this.dir);
                        }, {
                            enabled: 'this.parent.parent.nextEnabled'
                        }, {
                            dir : 1 //go to next panel
                        }));
                    }

                    if (defn.ifw) {
                        rc.push($NIB(mstrmojo.desc(2102, 'Close'), iconCss + 'mstrmojo-DocInfoWindow-close', function () {
                            this.parent.parent.parent.close();
                        }));
                    }

            if(defn.ifp){ // Filter Panel also need to popup the menu    
                rc.push({
                    scriptClass: 'mstrmojo.Button',
                    alias: 'applyNow',
                    title: 'Apply Now', // TODO: add descriptor
                    cssClass: 'mstrmojo-oivmSprite tbApply',
                    bindings: {
                        visible: function() {
                            return !defn.cas;
                        },
                        enabled: function() {
                            return this.parent.parent.applyEnabled;
                        }
                    },
                    onclick: function onclick() {                                      
                        if (w && w.applyBufferedSlices) {
                            w.applyBufferedSlices();
                        }
                    }
                });                
                rc.push({
                    scriptClass: 'mstrmojo.Button',
                    cssClass: 'mstrmojo-oivmSprite tbDown',
                    onclick: function onclick() {                                      
                        var dl = getPopupDelegate(this, 'openPopupMenu');
                        if (dl) {
                            dl.openPopupMenu(
                                    'mstrmojo.FilterPanelMenu',
                                    {
                                        openerButton: this,
                                        fps: w
                                    }
                            );
                        }
                    }                                       
                });
            }
            
            if(defn.ifw || node.sw || defn.ifp){
                toolbarNodeCssClass = (node.sw ? 'pst-r ' : '') + (defn.ifw ? 'ifw ' : '') + (defn.ifp ? 'ifp ' : '') + (!defn.cas ? 'cas ' : '');                
                        children.push({
                            scriptClass: 'mstrmojo.ToolBar',
                            slot: 'toolbarNode',
                            alias: 'toolbar',
                            children: rc
                        });
                    }
                }

                // Selector Control - build pulldown button into slot 'rightToolbar'
                if (t === en.SELECTOR && w.spm) { //if this Selector style supports popup menu
                    toolbarNodeCssClass = 'spm';

                    //create a toolbar to contain the pulldown button
                    children.push({
                        scriptClass: 'mstrmojo.ToolBar',
                        slot: 'toolbarNode',   //right toolbar node
                        alias: 'rightToolbar',
                        children: [{
                            scriptClass: 'mstrmojo.Button',
                            cssClass: 'mstrmojo-oivmSprite tbDown',
                            onclick: function onclick() {
                                       var dl = getPopupDelegate(this, 'openPopupMenu');
                                if (dl) {
                                       dl.openPopupMenu(
                                               'mstrmojo.SelectorMenu',
                                               {
                                                   openerButton: this,
                                                   selector: w
                                    });
                                }
                            }
                        }]
                    });
                }

                // Create the portlet.
                var Cls = 'Doc' + ((resizable) ? 'Resizable' : '') + 'Portlet',
                    props = {
                        defn: w.defn,
                        model: w.model,
                        children: children,
                        title: w.title,
                    count: w.count,
                        floatingTitle: (!defn.ttl && defn.qsm),
                        leftToolbarNodeClass: leftToolbarNodeCssClass,
                        loadDataOnResize: hasGraph,
                        toolbarNodeClass: toolbarNodeCssClass
                    };

                if (t === en.PANELSTACK) {
                    props.bindings = {
                        title: 'this.children[0].title' //'this.content.title' TODO use alias when the alias + binding issue fixed.
                    };

                    // If panel switching toolbar is rendered, setup two binidings to help update the buttons status.
                    // These two properties work as connector between the PanelStack widget and the toolbar widget since
                    // the PanelStack's instance is not available yet when settting up toolbar's bindings.
                    if (node.sw) {
                        props.bindings.prevEnabled = function () {
                            return this.children[0].hasPreviousPanel;
                        };
                        props.bindings.nextEnabled = function () {
                            return this.children[0].hasNextPanel;
                        };
                    }
            
            // add another property binding to control the apply button enable/disbale
            if (defn.ifp) {
                props.bindings.applyEnabled = function() { 
                    return this.children[0].applyEnabled;
                };                
            }
                }

                return new mstrmojo[Cls](props);
            },

            /**
                 * <p>Instantiates and returns a DocLayout widget.</p>
             *
             * @param {mstrmojo.DocModel} model The DocModel the child and container belong to.
             * @param {Object} node The data node for the child widget.
             *
             * @returns {mstrmojo.DocLayoutViewer}
             */
            newLayout: function newLayout(model, node) {

                // Create the layout viewer.
                var isInfoWindow = node.defn.iw,
                    fhds = model.getFixedHeaders(node),
                    ffts = model.getFixedFooters(node),
                    chs = [],
                    infoWindowClass = ((mstrApp.onMobileDevice()) ? "Mobile" : "") + 'MapInfoWindowLayoutViewer',
                    LayoutViewerCls = isInfoWindow ? mstrmojo.maps[infoWindowClass] : (this.classMap.layoutViewer || mstrmojo.DocLayoutViewer),
                    dlv = new LayoutViewerCls({
                        n: node.defn.title,    // If title is missing, don't use the key; leave it null, thus hiding the GUI tab for it.
                        model: model,
                        node: node,
                        controller: this.parent.controller,
                        tbc: node.defn.tbc,
                        slot: 'containerNode',
                        visible: false,        // Assumes stack container will unhide the current layout when selected.
                        ifs: node.data.ifs,    // Incremental fetch settings.
                        gb: node.data.gbys     // Groupd by info.
                    });

                // Create a modified defn node for the DocLayoutViewer based on the node.defn.
                var defn = dlv.defn = mstrmojo.hash.copy(node.defn);
                defn.fmts = mstrmojo.hash.copy(node.defn.fmts);

                //Override the DocLayout class to be a incrementally rendering class
//                mstrmojo.DocLayout = $CFC(mstrmojo.DocLayout, [mstrmojo._CanRenderDocOnScroll], {
//                    scriptClass: 'mstrmojo.DocLayout'
//                });
                var fnHeaders = function (headers, slot) {
                    var cnt = headers.length;
                    if (cnt) {
                        var h, f;
                        for (h = 0; h < cnt; h++) {
                            f = this.build([headers[h]], model)[0];
                            f.slot = slot;
                            chs.push(f);
                        }
                    }
                };

                fnHeaders.call(this, fhds, 'fixedHeaderNode');

                // Resolve whether the layout should be vertical or horizontal layout.
                var LayoutCls = mstrmojo['DocLayout' + ((node.defn.horiz) ? 'Horiz' : '')];

                // Add layout child.
                chs.push(new LayoutCls({
                    slot: "layout",
                    id: node.id,
                    k: node.k,
                    minHeight: node.data.mh,
                    formatResolver: model.formatResolver,
                    rules: node.defn.rules,
                    builder: this,
                    node: node,
                    defn: node.defn,
                    model: model
                }));

                // Add fixed footer as child
                fnHeaders.call(this, ffts, 'fixedFooterNode');

                // Finally add into viewer
                dlv.addChildren(chs);

                return dlv;
            },

            newSection: function (model, node) {
                // If the section is horizontal and it has more than one subsection  use a horizontal section (extends HBox).
                var cls = (node.defn.horiz && node.data.subsections.length > 1) ? 'DocSectionHoriz' : 'DocSection';
                return new mstrmojo[cls]({
                    id: node.id,
                    node: node,
                    model: model
                });
            },

            newHTMLContainer: function (model, node) {
                // Is the HTMLContainer an iframe or just html?
                var cls = (node.defn.ht === 0) ? 'DocHTMLContainer' : 'DocTextfield';
                return new mstrmojo[cls]({
                    id: node.id,
                    node: node,
                    model: model
                });
            },

			
            newMojoVisualization: function (model, node) {
                var visObj = mstrmojo.AndroidVisList.getVis(node.data.visName);
 
                // TQMS#499518 - if we get here but we don't know which visualization to display, fall back to rendering the grid instead.
                if (!visObj) {
               
	                var c = node.data.className;					
					if (!c) {
						return this.newXtab(model, node);
					}
					
					visObj = {dc: c};
					mstrmojo.requiresCls("mstrmojo." + c);
                }

                var pkgc = mstrmojo,
                    pkgm = mstrmojo,
                    vc = (typeof visObj.dc !== "undefined") ? visObj.dc : visObj.c,
                    vm = visObj.m || "DocXtabModel",
                    w;

                if (vc === "maps.AndroidMap") {
                    vc = "maps.AndroidDocMap";
                }

                // check package of the view class
                if (vc.indexOf(".") > 0) {
                    pkgc = pkgc[vc.substring(0, vc.indexOf("."))];
                    vc = vc.substring(vc.indexOf(".") + 1);
                }

                // check package of the model class
                if (vm.indexOf(".") > 0) {
                    pkgm = pkgm[vm.substring(0, vm.indexOf("."))];
                    vm = vm.substring(vm.indexOf(".") + 1);
                }

                mstrmojo.requiresCls(pkgc[vc].prototype.scriptClass);
                
                var Cls = mstrmojo.AndroidVisList.getVisClass(pkgc[vc], node.defn);
				var p = {                
                    id: node.id,
                    node: node,
                    n: node.defn.title,    // Copy the layout title to the visualization.
                    controller: this.parent.controller,
                    gb: node.data.gbys     // Group by info.
                }; 
				// copy extra properties
                var ep = node.data.extProps; 
                if (ep) {
                    p = mstrmojo.hash.copy(p, ep);
				}
                w = new Cls(p);
                
                // Create (and set) the data model for the visualization/grid.
                w.setModel(new pkgm[vm]({
                    xtab: w,
                    controller: this.parent.controller,
                    docModel: model,
					data : node.data
                }));

                return w;
            },

            newInfoWindow: function newInfoWindow(cfg) {
                return new mstrmojo.DocInfoWindow(cfg);
            },

            newRoundedRectangle: function (model, node) {
                var $D = mstrmojo.dom,
                    cls = ($D.supports($D.cssFeatures.ROUND_CORNERS)) ? 'DocRectangle' : 'DocRoundRectangle';

                return new mstrmojo[cls]({
                    id: node.id,
                    node: node,
                    model: model
                });
            },

            newSelector: function newSelector(model, node) {
                var cls = (node.defn.ct === '4' ? 'DocActionSelector' : 'DocSelector');
                return new mstrmojo[cls]({
                    id: node.id,
                    node: node,
                    controller: this.parent.controller,
                    model: model
                });
            },

            newXtab: function newXtab(model, node) {
                var txi = node.defn.txi, xtab,
                    Cls = mstrmojo.DocXtab;

                if (txi) {
                    Cls = $CFC(mstrmojo.DocXtab, [mstrmojo._CanSupportTransaction, mstrmojo._IsEditableXtab], {scriptClass: 'mstrmojo.DocXtab'});
                }

                xtab = new Cls({
                    id: node.id,
                    node: node,
                    controller: this.parent.controller
                });

                xtab.model = new mstrmojo.DocXtabModel({
                    xtab: xtab,
                    docModel: model
                });

                return xtab;
            },

            getLinkDrillingClass: function getLinkDrillingClass(clazz, type, useHover) {
                var className = clsMap[type].n + ((useHover) ? 'Hover' : ''),
                    Cls = linkClsMap[className];

                // Have we NOT previously created this dynamic class?
                if (!Cls) {
                    // All links will have _HasDocLink.
                    var mixins = [ mstrmojo._HasDocLink ];

                    // Do we support hover for multiple links?
                    if (useHover) {
                        // Add _HasHoverButton.
                        mixins[1] = mstrmojo._HasHoverButton;
                    }

                    // Create and cache dynamic class constructor.
                    Cls = linkClsMap[className] = $CFC(clazz, mixins);

                }

                // Return constructor.
                return Cls;
            }
        }
    );

}());