(function () {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.DocBuilder",
                         "mstrmojo.MobileDocLayoutViewer",
                         "mstrmojo.MobileDocXtabGraph",
                         "mstrmojo._XtabSeamlessIncrementalFetch",
                         "mstrmojo._HasScrollbox",
                         "mstrmojo.MobileXtab",
                         "mstrmojo.graph.MobileDocXtabCanvasGraph",
                         "mstrmojo.DynamicClassFactory",
                         "mstrmojo.android.DocSelectorViewFactory",
                         "mstrmojo.android.DocPanelStack",
                         "mstrmojo.android.HTMLContainer",
                         "mstrmojo._HasRelativeUrls",
                         "mstrmojo._Formattable",
                         "mstrmojo._IsDocXtab",
                         "mstrmojo._IsSelectorTarget",
                         "mstrmojo._IsInteractiveGrid",
                         "mstrmojo.android.AndroidDICConfig",
                         "mstrmojo.array",
                         "mstrmojo.hash",
                         "mstrmojo.maps.MapInfoWindowLayoutViewer");

    var $CFC = mstrmojo.DynamicClassFactory.newComponent,
        $HRU = mstrmojo._HasRelativeUrls,
        $FREE = mstrmojo.Obj.free,
        $EN = mstrmojo.EnumRWUnitType,
        $ARR = mstrmojo.array,
        $HASH = mstrmojo.hash;

    // Create dynamic DocXtab class.
    mstrmojo.DocXtab = $CFC(mstrmojo.MobileXtab, [ mstrmojo._Formattable, mstrmojo._IsSelectorTarget, mstrmojo._IsDocXtab ], {
        scriptClass: 'mstrmojo.DocXtab',
        /**
         * Overwrite the scrollerConfig property to ensure we can't scrollPast.
         */
        scrollerConfig: {
            scrollPast: false
        }
    });

    // Create dynamic document full screen map visualization class.
    mstrmojo.maps.AndroidDocLayoutMap = $CFC(mstrmojo.maps.AndroidDocMap, [ mstrmojo.android._IsAndroidDocument ], {
        scriptClass: 'mstrmojo.maps.AndroidDocLayoutMap'
    });

    // Create dynamic MobileDocImage class to update image src url for mobile.
    mstrmojo.MobileDocImage = $CFC(mstrmojo.DocImage, [ $HRU ], {
        scriptClass: 'mstrmojo.MobileDocImage',
        relativeUrls: [ 'v' ]
    });

    mstrmojo.MobileDocHTMLContainer = $CFC(mstrmojo.DocHTMLContainer, [ $HRU ], {
        scriptClass: 'mstrmojo.MobileDocHTMLContainer',
        relativeUrls: [ 'v' ]
    });

    // Remove border and background color from DocLayout format handlers.
    var fh = mstrmojo.DocLayout.prototype.formatHandlers.domNode;
    $ARR.removeItem(fh, 'border');
    $ARR.removeItem(fh, 'background-color');

    /**
     * <p>Builds the document object model based on the supplied {@link mstrmojo.DocModel} for Mobile devices.</p>
     *
     * @class
     * @extends mstrmojo.DocBuilder
     */
    mstrmojo.MobileDocBuilder = mstrmojo.declare(
        // superclass
        mstrmojo.DocBuilder,

        // mixins,
        null,

        /**
         * @lends mstrmojo.MobileDocBuilder.prototype
         */
        {
            scriptClass: "mstrmojo.MobileDocBuilder",

            init: function init(props) {
                this._super(props);

                // Initialize the selector factory.
                this.selectorFactory = new mstrmojo.android.DocSelectorViewFactory();

                var clsMap = this.classMap;

                // Add script class for mobile document layout viewer.
                clsMap.layoutViewer = mstrmojo.MobileDocLayoutViewer;

                // Overwrite graph to use MobileDocXtabGraph.
                clsMap[$EN.GRAPH] = (mstrApp.onMobileDevice() && mstrApp.useBinaryFormat) ? {
                    n: 'graph.MobileDocXtabCanvasGraph',
                    scriptClass: 'mstrmojo.graph.MobileDocXtabCanvasGraph'
                } : {
                    n: 'MobileDocXtabGraph',
                    scriptClass: 'mstrmojo.MobileDocXtabGraph'
                };

                // Overwrite graph to use MobileDocXtabGraph.
                clsMap[$EN.IMAGE] = {
                    n: 'MobileDocImage',
                    scriptClass: 'mstrmojo.MobileDocImage'
                };

                // Add DocPanelStack using mobile version.
                clsMap[$EN.PANELSTACK] = {
                    n: 'PanelStack',
                    scriptClass: 'mstrmojo.android.DocPanelStack'
                };
            },

            /**
             * <p>Checks if the layout has a visualization property set and creates the visualization
             * as the only element on that layout. If not, instantiates and returns a DocLayout widget.</p>
             *
             *
             * @param {mstrmojo.DocModel} model The DocModel the child and container belong to.
             * @param {Object} node The data node for the child widget.
             *
             */
            newLayout: function newLayout(model, node) {
                var vis = node.defn.visName;

                //Does the layout have the interactive grid visualization property set?
                if (vis) {
                    // Get only the Visualization Grid node from the layout and cache the group by node from the original node.
                    var groupByInfo = node.data.gbys;

                    // Since the Doc is tightly coupled to the layout, we let it remain a layout node but change it's
                    // data to point to the Visualization Grid's data and render it as a visualization...
                    // - cache layout data
                    var layoutModel = model,
                        layoutNode = $HASH.clone(node);

                    // - reset data to point to the grid's data
                    var visGrid = mstrmojo.Vis.getVisGrid(model, node, node.defn.visGK);
                    if (visGrid) {
                        node.data = visGrid.data;

                        if (node.defn.vp && Object.keys(node.defn.vp).length > 0) { // copy them to template
                            visGrid.data.vp = node.defn.vp;
                        }

                        // - add a reference to the original data Model so the visualization can find other objects (i.e. grids, panel stacks)
                        node.data.layoutModel = layoutModel;
                        node.data.layoutNode = layoutNode;

                        // - add group by info.
                        node.data.gbys = groupByInfo;
                    }

                    //Make the node definition observable
                    node.defn = model.makeObservable(node.defn);

                    // Get Vis Object to find out the visualization's view and model classes
                    var visObj = mstrmojo.AndroidVisList.getVis(vis),
                        viewClassName = (typeof visObj.dc !== "undefined") ? visObj.dc : visObj.c,
                        xtab,
                        xtabModel;

                    // create the view and model objects.  Errors building or rendering the view and/or creating
                    // the data model object are caught here so we can clean up any allocated objects before
                    // passing the error up.
                    try {
                        
                        // Is this a map visualization?
                        if (viewClassName === "maps.AndroidDocMap") {
                            // Change view class name to the full screen layout map visualization.
                            viewClassName = 'maps.AndroidDocLayoutMap';
                        }
                        
                        var ViewClass = $HASH.walk(viewClassName, mstrmojo),                // Vis class constructor.
                            ModelClass = $HASH.walk(visObj.m || "DocXtabModel", mstrmojo),  // Model class constructor.
                            controller = this.parent.controller;                            // controller.

                        // Create the view that to display our data.
                        xtab = new ViewClass({
                            id: (visGrid && visGrid.id) || node.id,
                            node: node,
                            n: node.defn.title,             // Copy the layout title to the visualization.
                            controller: controller,
                            gb: node.data.gbys,             // Group by info.
                            isFullScreenWidget: true        // Since this is a layout it's always full screen.
                        });

                        // Create the data model for the visualization/grid.
                        xtabModel = new ModelClass({
                            xtab: xtab,
                            controller: controller,
                            docModel: model
                        });

                        //Set the model
                        xtab.setModel(xtabModel);
                        
                    } catch (e) {
                        // Destroy the view and model if we encounter problems.
                        xtab = $FREE(xtab);
                        xtabModel = $FREE(xtabModel);
                        
                        throw e;
                    }

                    return xtab;
                } else {
                    return this._super(model, node);
                }
            },

            /**
             * Overridden to use composite HTML Container that will adjust relative iframe URLs.
             *
             * @ignore
             */
            newHTMLContainer: function (model, node) {
                // Get constructor based on html container type (iFrame versus static html.
                var clsName = (node.defn.ht === 0) ? 'MobileDocHTMLContainer' : 'android.HTMLContainer',
                    Cls = mstrmojo.hash.walk(clsName, mstrmojo);

                // Return instance.
                return new Cls({
                        id: node.id,
                        node: node,
                        model: model
                    });
            },

            getLinkDrillingClass: function getLinkDrillingClass(clazz, type, useHover) {
                // Don't support hover menu in Mobile.
                return this._super(clazz, type, false);
            },

            createPortlet: function createPortlet(t, node, w) {
                // Are we NOT on a tablet and IS the node an info window?
                if (!mstrApp.isTablet() && node.defn.ifw) {
                    // Set the title on the widget and...
                    w.title = w.defn.ttl || '';

                    // return the widget instead of a portlet.
                    return w;
                }

                return this._super(t, node, w);
            }
        }
    );

}());