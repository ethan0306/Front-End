(function () {
    
    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.android.AndroidMainView",
                         "mstrmojo.FolderDataService",
                         "mstrmojo.AndroidResultSetScreenController",
                         "mstrmojo.AndroidXtabController",
                         "mstrmojo.AndroidGraphController",
                         "mstrmojo.AndroidXtab",
                         "mstrmojo.RptXtabModel",
                         "mstrmojo.XtabDataService",
                         "mstrmojo.DocDataServiceXt",
//                         "mstrmojo.XtabCachedDataService",
                         "mstrmojo.MobileGraph",
                         "mstrmojo.GraphModel",
                         "mstrmojo.graph.MobileXtabCanvasGraph",
                         "mstrmojo.maps.AndroidMapModel",                         
                         "mstrmojo.GraphDataService",
                         "mstrmojo.AndroidPromptsController",
                         "mstrmojo.prompt.AndroidPromptsView",
                         "mstrmojo.AndroidDocumentController",
                         "mstrmojo.MobileDoc",
                         "mstrmojo.MobileDocBuilder",
                         "mstrmojo.ResultSetDocumentModel",
//                         "mstrmojo.DocCachedDataService",
                         "mstrmojo.settings.AndroidSettingsController",
                         "mstrmojo.settings.AndroidSettingsView",
                         "mstrmojo.android.LayoutDotStyleSelector",
                         "mstrmojo.android.LayoutTabStyleSelector",
                         "mstrmojo.mstr.ElementDataService",
                         "mstrmojo.prompt.WebPrompts");
    
    /**
     * Creates and returns a data provider based on caching status.
     * 
     * @param {Object} params The parameters for the delegate.
     * @param {String} liveServiceName The class name (within the "mstrmojo" package) for the delegate.
     * @param {String} cachedServiceName The class name (within the "mstrmojo" package) for the data service.
     * 
     * @returns {mstrmojo.Obj} Either the data service (if caching) or the delegate (if no caching).
     * @private
     */
    function newDataService(params, liveServiceName, cachedServiceName) {
        var app = mstrApp,
            store = false,
//            store = (app.getConfiguration().getCacheEnabled() ? app.getResSetStore() : null), CACHING IS DISABLED
            delegate = new mstrmojo[liveServiceName](params);
    
        if (store) {
            return new mstrmojo[cachedServiceName]({
                store: store,
                delegate: delegate
            });
        } else {
            return delegate;
        }
    }
    
    /**
     * <p>A factory for creating {@link mstrmojo.android.AndroidMainView} instances.</p>
     * 
     * @class
     * @extends mstrmojo.Obj
     * @public
     */
    mstrmojo.android.ViewFactory = mstrmojo.declare(

        mstrmojo.Obj,

        null,
        
        /**
         * @lends mstrmojo.android.ViewFactory
         */
        {
            scriptClass: 'mstrmojo.android.ViewFactory',
            
            mobileDoc: mstrmojo.MobileDoc,
            
            /**
             * Creates and returns an mstrmojo.android.AndroidMainView.
             * 
             * @param {Object} params The parameters for this framed view.
             * @param {mstrmojo.ViewController} params.controller The controller for this view.
             * @param {mstrmojo.Widget} [params.bottomChild] An optional child to be added at the bottomChild property of the created AndroidView.
             * @param {mstrmojo.Widget} Constructor The constructor of the contentChild.
             */
            newFramedView: function newFramedView(params, Constructor) {
                return new mstrmojo.android.AndroidMainView({
                    controller: params.controller,
                    contentChild: new Constructor(params),
                    bottomChild: params.bottomChild
                });
            },
            
            /**
             * Creates application root view
             * 
             * @param {String} params.id A view ID.
             * @param {String} params.placeholder A view placeholder.
             * 
             * @returns mstrmojo.Widget
             */
            newRootView: mstrmojo.emptyFn,
            
            /**
             * Creates a new Xtab view
             * 
             * @param {MobileBookletController} params.controller A view controller.
             * @param {String} params.ttl A view title.
             * @param {String} params.did A report ID.
             * @param {String} params.st A report subtype.
             * 
             * @returns {mstrmojo.android.AndroidMainView} Returns a frame view containing {mstrmojo.AndroidXtab} 
             */
            newXtabView: function newXtabView(params) {
                var viz = params.viz,
                    rootObj = mstrmojo,
                    clazz = (viz) ? viz.c : "AndroidXtab";
                 
                // check package
                if (clazz.indexOf(".") > 0) {
                    rootObj = rootObj[clazz.substring(0, clazz.indexOf("."))];
                    clazz = clazz.substring(clazz.indexOf(".") + 1);
                }
                
                var frame = this.newFramedView(params, rootObj[clazz]);
                
                // Indicate that this view supports landscape.
                frame.supportsLandscape = true;
                
                return frame;
            },
            
            newGraphView: function newGraphView(params) {
                var viewClass = (mstrApp.onMobileDevice() && mstrApp.useBinaryFormat) ? mstrmojo.graph.MobileXtabCanvasGraph : mstrmojo.MobileGraph,
                    frame = this.newFramedView(params, viewClass);
                
                // Indicate that this view supports landscape.
                frame.supportsLandscape = true;
                
                return frame;
            },
            
            /**
             * Creates Document view
             * 
             * @param {MobileBookletController} params.controller A view controller.
             * @param {String} params.ttl A view title.
             * @param {String} params.did A document ID.
             * 
             * @returns {mstrmojo.android.AndroidMainView} Returns a frame view containing {mstrmojo.MobileDoc} 
             */
            newDocumentView: function newDocumentView(params) {
                var controller = params.controller,
                    model = controller.model,
                    selectorStyle = (model.tss === 1) ? 'Dot' : 'Tab',
                    selectorPosition = (model.tsp === 0 && selectorStyle === 'Dot') ? 'top' : 'bottom',
                    frame = this.newFramedView(mstrmojo.hash.copy(params, {
                        bottomChild: {
                            scriptClass: 'mstrmojo.android.Layout' + selectorStyle + 'StyleSelector',
                            position: selectorPosition,
                            controller: controller
                        },
                        isFullScreen: !!model.fs
                    }), this.mobileDoc),
                    doc = frame.contentChild;
                
                // Add css class.
                frame.cssClass = 'mstrmojo-DocumentView';
                
                // Add the builder to the doc.
                doc.builder = new mstrmojo.MobileDocBuilder({
                    parent: doc
                });
                
                // Set the target on the tab strip bottom child.
                frame.bottomChild.set('target', doc);
                
                // Indicate that this view supports landscape.
                frame.supportsLandscape = true;

                return frame;
            },
            
            /**
             * Creates Prompts view
             * 
             * @param {MobileBookletController} params.controller A view controller.
             * @param {Object} params.prompts An object representing prompts JSON.
             * 
             * @returns {mstrmojo.prompt.AndroidPromptsView}
             */
            newPromptsView: function newPromptsView(params) {
                var frame = this.newFramedView(params, mstrmojo.prompt.AndroidPromptsView);
                
                // Update the title.
                frame.updateTitle(params.ttl);
                
                return frame;
            },
            
            newSettingsView: function newSettingsView(params) {
                return this.newFramedView(params, mstrmojo.settings.AndroidSettingsView);
            },
            
            newView: function newView(type, params) {
                //var mthName = (isNaN(key) ? key : typeMap[key]);
                return this['new' + type + 'View'](params);
            },
            
            
            //==================================================
            //Controller factory
            
            /**
             * Creates Application root controller
             * 
             * @param {Object} params.
             * 
             * @returns 
             */
            newRootController: mstrmojo.emptyFn,

            
            /**
             * Creates Xtab controller
             * 
             * @param {String} params.ttl A view title.
             * @param {String} params.did A report ID.
             * @param {String} params.st A report subtype.
             * @param {String} params.st A report subtype.
             * 
             * @returns {mstrmojo.prompt.AndroidXtabController}
             */
            newXtabController: function newXtabController(params) {
                return new mstrmojo.AndroidXtabController(params);
            },

            newXtabScreenController: function newXtabScreenController(params) {
                return new mstrmojo.AndroidResultSetScreenController(params);
            },

            /**
            * Creates Xtab controller
            * 
            * @param {String} params.ttl A view title.
            * @param {String} params.did A report ID.
            * @param {String} params.st A report subtype.
            * @param {String} params.st A report subtype.
            * 
            * @returns {mstrmojo.prompt.AndroidXtabController}
            */
            newGraphController: function newXtabController(params) {
                return new mstrmojo.AndroidGraphController(params);
            },

            newGraphScreenController: function newXtabScreenController(params) {
                return new mstrmojo.AndroidResultSetScreenController(params);
            },

            /**
             * Creates Document controller
             * 
             * @param {String} params.ttl A view title.
             * @param {String} params.did A document ID.
             * @param {String} params.st A document subtype.
             * @param {String} params.st A document subtype.
             * 
             * @returns {mstrmojo.prompt.AndroidDocumentController}
             */
            newDocumentController: function newDocumentController(params) {
                return new mstrmojo.AndroidDocumentController(params);
            },

            newDocumentScreenController: function newDocumentScreenController(params) {
                return new mstrmojo.AndroidResultSetScreenController(params);
            },

            /**
             * Creates Prompts controller
             * 
             * @param {Object} params.prompts An object representing prompts JSON.
             * 
             * @returns {mstrmojo.prompt.AndroidPromptsController}
             */
            newPromptsController: function newPromptsController(params) {
                return new mstrmojo.AndroidPromptsController(params);
            },
            

            /**
             * Creates Settings controller
             * 
             * @returns {mstrmojo.settings.AndroidSettingsController}
             */
            newSettingsController: function newSettingsController(params) {
                return new mstrmojo.settings.AndroidSettingsController(params);
            },
            
            newSettingsScreenController: function newSettingsScreenController(params) {
                return this.newSettingsController(params);
            },
            
            /**
             * Creates a view controller of requested type
             * 
             * @param {String} type A controller type.
             * @param {Object} params A controller-specific parameters.
             * 
             * @returns {mstrmojo.prompt.MobileBookletController} Returns a specific subclass of the {mstrmojo.prompt.MobileBookletController} 
             */
            newController: function newController(type, params) {
                return this['new' + type + 'Controller'](params);
            },

            /**
             * Creates a screen controller of requested type
             * 
             * @param {String} type A controller type.
             * @param {Object} params A controller-specific parameters.
             * 
             * @returns {mstrmojo.prompt.MobileBookletController} Returns a specific subclass of the {mstrmojo.prompt.MobileBookletController} 
             */
            newScreenController: function newScreenController(type, params) {
                return this['new' + type + 'ScreenController'](params);
            },

            
            //===================================================================
            // Data providers
            

            /**
             * Creates Xtab data provider.
             * 
             * @param {Object} params.dssId A report Id.
             * 
             * @returns {mstrmojo.XtabDataService}
             */
            newXtabDataService: function newXtabDataService(params) {
                return newDataService(params, 'XtabDataService', 'XtabCachedDataService');
            },
            
            /**
             * Creates Xtab data provider.
             * 
             * @param {Object} params.dssId A report Id.
             * 
             * @returns {mstrmojo.XtabDataService}
             */
            newGraphDataService: function newGraphDataService(params) {
                return newDataService(params, 'GraphDataService', 'XtabCachedDataService');
            },
            
            /**
             * Creates Document data provider.
             * 
             * @param {Object} params.dssId A document Id.
             * 
             * @returns {mstrmojo.DocDataService}
             */
            newDocDataService: function newDocDataService(params) {
                params.useBinaryFormat = mstrApp.useBinaryFormat;
                return newDataService(params, 'DocDataServiceXt', 'DocCachedDataService');
            },
            
            /**
             * Creates Element Data Service.
             * 
             * @return {mstrmojo.mstr.ElementDataService}.
             */
            newElementDataService: function newElementDataService() {
                return mstrmojo.mstr.ElementDataService;
            },
            
            /**
             * Creates Folder data provider.
             * 
             * @param {Object} params.projectId A project Id.
             * 
             * @returns {mstrmojo.FolderDataService}
             */
            newFolderDataService: function newFolderDataService(params) {
                return new mstrmojo.FolderDataService(params);
            },
            
            /**
             * Creates a new Xtab Model
             * 
             * @param {Object} 
             * 
             * @returns {mstrmojo.RptXtabModel}
             */
            newXtabModel: function newXtabModel(params) {
                return new mstrmojo.RptXtabModel(mstrmojo.hash.copy(params, {
                    dataService: this.newXtabDataService(params)
                }));
            },

            /**
             * Creates a new Android Map (Report) Model
             * @returns {mstrmojo.maps.AndroidMapModel}
             */
            newAndroidMapModel: function newAndroidMapModel(params) {
                return new mstrmojo.maps.AndroidMapModel(params);
            },
            
            /**
             * Creates a new Graph Model
             * 
             * @param {Object} 
             * 
             * @returns {mstrmojo.RptXtabModel}
             */
            newGraphModel: function newGraphModel(params) {
                return new mstrmojo.GraphModel(mstrmojo.hash.copy(params, {
                    dataService: this.newGraphDataService()
                }));
            },
            
            newDocumentModel: function newDocumentModel(params) {
                return new mstrmojo.ResultSetDocumentModel(params);
            },
            
            newModel: function newModel(type, params) {
                return this['new' + type + 'Model'](params);
            },

            newPrompts: function newPrompts(prompts, answers) {
                // Instantiate prompts instance.
                var webPrompts = new mstrmojo.prompt.WebPrompts({
                    rsl: prompts
                });
                
                // Do we have answers for the prompts?
                if (answers) {
                    // Popuplate answers.
                    webPrompts.populateAnswers(answers);
                }
                
                // Return prompts.
                return webPrompts;
            }
            
        }
    );

    
}());