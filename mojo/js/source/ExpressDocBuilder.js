(function () {
    
    mstrmojo.requiresCls("mstrmojo.DocLayoutViewer",
                         "mstrmojo.DocGroupBy", 
                         "mstrmojo.Xtab",
                         "mstrmojo.IncFetch",
                         "mstrmojo.DocPanelStack",
                         "mstrmojo._IsEditableXtab", 
                         "mstrmojo._CanSupportTransaction",
                         "mstrmojo.OIVMDICConfig",
                         "mstrmojo.OIVMDocSelectorViewFactory",
                         "mstrmojo.OIVMDocXtabGraph");
    
    var $EN = mstrmojo.EnumRWUnitType,
        $CFC = mstrmojo.DynamicClassFactory.newComponent;
    
    // Create dynamic DocXtab class.
    mstrmojo.DocXtab = $CFC(mstrmojo.Xtab, [mstrmojo._Formattable, mstrmojo._IsDocXtab], {
        scriptClass: 'mstrmojo.DocXtab'
    });
    
    /**
     * <p>Builds the document object model based on the supplied {@link mstrmojo.DocModel} for MicroStrategy Express mode.</p>
     * 
     * @class
     * @extends mstrmojo.DocBuilder
     */
    mstrmojo.ExpressDocBuilder = mstrmojo.declare(
        // superclass
        mstrmojo.DocBuilder,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.ExpressDocBuilder.prototype
         */
        {
            scriptClass: "mstrmojo.ExpressDocBuilder",
            
            init: function init(props) {
                this._super(props);
                
                var clsMap = this.classMap;
                
                // Initialize the selector factory.
                this.selectorFactory = new mstrmojo.OIVMDocSelectorViewFactory();
                
                // Overwrite graph to use OIVMDocXtabGraph.
                clsMap[$EN.GRAPH] = {
                    n: 'OIVMDocXtabGraph',
                    scriptClass: 'mstrmojo.OIVMDocXtabGraph'
                };
                
                // Add DocPanelStack using static version.
                clsMap[$EN.PANELSTACK] = {
                    n: 'PanelStack',
                    scriptClass: 'mstrmojo.DocPanelStack'
                };
            },
            
            /**
             * <p>Instantiates a DocLayout widget with incremental fetch and group by (if appropriate).</p>
             * 
             * @param {mstrmojo.DocModel} model The DocModel the child and container belong to.
             * @param {Object} node The data node for the child widget.
             * 
             * @returns {mstrmojo.DocLayoutViewer}
             */
            newLayout: function newLayout(model, node) {

                // Use _super to get the layout viewer class.
                var dlv = this._super(model, node);
                
                // Is there a group by section?
                var gb = node.data.gbys;
                if (gb) {
                    // Add the group by child.
                    dlv.addChildren(new mstrmojo.DocGroupBy({
                        id: gb.k,
                        slot: "groupBy",
                        title: gb.title,
                        model: model,
                        node: node,
                        data: gb.groupbys,
                        controller: this.parent.controller
                    }));
                }
                
                // Is there an incremental fetch node?
                if (node.data.ifs) {
                    // Create an incremental fetch widget.
                    var ifs = new mstrmojo.IncFetch(mstrmojo.hash.copy(node.data.ifs, {
                        slot: 'incFetchNode',
                        model: model
                    }));
                    
                    // Attach an event listener to hear when a fetch is needed.
                    ifs.attachEventListener('fetch', dlv.id, function (evt) {
                        var fnWait = function (v) {
                            if (evt.iWait) {
                                evt.iWait.set('visible', v);
                            }
                        };
                        
                        model.getDataService().fetchDocPage((evt.v - 1) * ifs.ps + 1, {        // TQMS #401757: calculate the Y position of the new page.
                            submission: function () {
                                fnWait(true);
                            },
                            
                            success: function (res) {
                                model.loadLayout(res);
                            },
                            
                            complete: function () {
                                fnWait(false);
                            }
                        });
                    });
                    
                    // Add the incremental fetch component to the DocLayoutViewer.
                    dlv.addChildren(ifs);
                }
                
                return dlv;
            },
            
            newXtab: function newXtab(model, node) {
                var txi = node.defn.txi, 
                    XtabCls = mstrmojo.DocXtab;
                
                if (txi) {
                    mstrmojo.EditableXtab = mstrmojo.DynamicClassFactory.newComponent(mstrmojo.Xtab, [ mstrmojo._CanSupportTransaction, mstrmojo._IsEditableXtab], {scriptClass: 'mstrmojo.EditableXtab'});
                    XtabCls = mstrmojo.EditableXtab;
                }        
                
                var xtab = mstrmojo.all[node.id];
                if(!xtab){
                    xtab = new XtabCls({
                        id: node.id,
                        node: node,
                        controller: this.parent.controller
                    });
                    
                    xtab.model = new mstrmojo.DocXtabModel({
                        xtab: xtab,
                        docModel: model
                    });
                } else {
                    xtab.set('node', node);
                    xtab.model.set('docModel', model);
                }
                return xtab;
            }           
        }
    );
    
}());