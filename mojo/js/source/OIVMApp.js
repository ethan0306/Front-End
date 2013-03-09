/**
 * OIVMApp.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */

(function () {

    mstrmojo.requiresCls("mstrmojo.func",
                         "mstrmojo.ServerProxy",
                         "mstrmojo.XHRServerTransport",
                         "mstrmojo.Doc",
                         "mstrmojo.ExpressDocBuilder",
                         "mstrmojo.ToolBar",
                         "mstrmojo.OIVMPage",
                         "mstrmojo.ToolBarBuilder",
                         "mstrmojo.TabContainer",
                         "mstrmojo.ScrollingTabStrip",
                         "mstrmojo.ToolBarModel",
                         "mstrmojo.OIVMDocController",
                         "mstrmojo.DocModel");
    
    /**
     * Passes the graph request to the {@link mstrmojo.ServerProxy}.
     * 
     * @param {String} key The key of the graph.
     * @param {Boolean} isAdd True if the graph is beginning to process, false if it is complete.
     * 
     * @private
     */
    function passGraphToServerProxy(key, isAdd) {
        var mthName = ((isAdd) ? 'add' : 'remove') + 'LoadingGraph';
        this.serverProxy[mthName](key);
    }

    /**
     * A singleton class representing mobile application. It provides application entry point as
     * well as a bunch of application-level services. Any code within the application can access the
     * instance of this class via mstrApp global variable.
     * 
     * @class
     * @extends mstrmojo.Obj
     * 
     */
    mstrmojo.OIVMApp = mstrmojo.declare(

        mstrmojo.Obj,
        
        null,

        /**
         * @lends mstrmojo.OIVMApp.prototype
         */
        {
            scriptClass: "mstrmojo.OIVMApp",
            
            /**
             * The instance of {@link mstrmojo.ServerProxy} to use for communication with the server.
             * 
             *  @type mstrmojo.ServerProxy
             */
            serverProxy: null,
            
            init: function init(props) {
                this._super(props);
                
                if (!this.serverProxy) {
                    this.serverProxy = new mstrmojo.ServerProxy({
                        transport: mstrmojo.XHRServerTransport
                    });
                }
            },
            
            start: function start() {
                var doc = new mstrmojo.Doc({
                    slot: 'stack'
                });

                // Add builder with parent reference to the doc.
                doc.builder = new mstrmojo.ExpressDocBuilder({
                    parent: doc
                });
                
                //For customizations - cache the doc id
                this.docId = doc.id;

                var tb = new mstrmojo.ToolBar({
                    slot: 'toolbar',
                    cssClass: 'mstrmojo-oivmSprite grouped',
                    builder: mstrmojo.ToolBarBuilder
                });

                // Create page widget.
                var view = new mstrmojo.OIVMPage({
                    placeholder: this.placeholder,
                    error: this.error,
                    children: [
                        tb, 
                        new mstrmojo.TabContainer({
                            slot: 'layout',
                            layoutConfig: {
                                h: {
                                    top: 'auto',
                                    stack: '100%'
                                },
                                w: {
                                    top: '100%',
                                    stack: '100%'
                                }
                            },
                            children: [ 
                                new mstrmojo.ScrollingTabStrip({
                                    slot: 'top',
                                    cssClass: 'mstrmojo-layout-tabs',
                                    visible: false, // Should only be shown when tabs are added.
                                    bindings: {
                                        width: "this.parent.width"
                                    }
                                    
                                }), doc
                            ]
                        })
                    ]
                });
                
                //If the Document has hidden sections, set the toolbar height property to 0px.
                if (this.hasHiddenSections) {
                    view.layoutConfig.h.toolbar = '0px';
                }

                //Declare and render a data-less view first, before parsing thru data JSON.
                //This allows HTML to be shown as early as possible, and lets it resize itself
                //to fit to window before it gets populated with lots of content.
                //This is good for perceived performance.
                view.render();
                
                // Is the doc model in an error state?
                var docModelData = this.docModelData;
                if (docModelData.mstrerr) {
                    mstrmojo.err(docModelData);
                    
                } else if (!this.error) {
                    
                    // Add toolbar data.
                    tb.model = new mstrmojo.ToolBarModel(this.tbModelData);
                    
                    // Set the toolbar's target to the document.
                    tb.target = doc;
                    
                    // Set doc data.
                    var docModel = doc.model = new mstrmojo.DocModel(docModelData);
                    
                    // Add controller to model and doc.
                    doc.controller = docModel.controller = new mstrmojo.OIVMDocController({
                        model: docModel
                    });
                    
                    // session expire handling
                    mstrApp.docModel = docModel;
                    mstrApp.onSessionExpired = function () {
                        var app = mstrApp, 
                            m = app.docModel;
                        mstrmojo.requiresCls("mstrmojo.form");
                        mstrmojo.form.send({
                            evt: 5005,            // PAGE_REFRESH
                            src: app.name + "." + app.pageName + ".5005",
                            rwb: m.bs
                        });
                    };

                    // Temp workaround: copy the features list from the toolbar model to its target's model.
                    mstrmojo.hash.copy(tb.model.features, tb.target.model.features);
    
                    mstrmojo.locales.load(function () {
                        // Now that the data model is ready, build toolbar children and doc children.
                        tb.buildChildren();
                        doc.buildChildren();                
                    });
                }
            },
            
            /**
             * returns TRUE if operating on a mobile device
             */
            onMobileDevice: function onMobileDevice() {
                return false;
            },
            
            isTouchApp: function isTouchApp() {
                return false;
            },
            
            getContentDimensions: function getContentDimensions(supportsFullScreen) {
                return null;
            },
            
            getConfiguration: mstrmojo.emptyFn,
            
            /**
             * Notifies the {@link mstrmojo.ServerProxy} that a graph is currently processing.
             * 
             * @param {String} key The key of the currently processing graph. 
             */
            addLoadingGraph: function addLoadingGraph(key) {
                passGraphToServerProxy.call(this, key, true);
            },
            
            /**
             * Notifies the {@link mstrmojo.ServerProxy} that a graph has finished processing.
             * 
             * @param {String} key The key of the complete graph request. 
             */
            removeLoadingGraph: function removeLoadingGraph(key) {
                passGraphToServerProxy.call(this, key);
            },
            
            serverRequest: function serverRequest(params, callback, config) {
                try {
                    // Initialize callback if missing.
                    callback = callback || {};
                    
                    // Initialize config if missing.
                    config = config || {};
                    
                    var mthName = config.src || (arguments.calle && arguments.calle.caller.name),
                        fnWait = !config.silent && config.fnWait,
                        fnHideWait = !config.silent && config.fnHideWait,
                        app = this;
                        
                    // Add default callback methods.
                    callback = mstrmojo.func.wrapMethods(callback, {
                        submission: function () {
                            if (fnWait) {
                                fnWait();
                            }
                        },
                        
                        // Default failure method.
                        failure: function (res) {
                            // Is this NOT a silent update?
                            if (!config.silent) {
                                res.method = mthName;
                                mstrmojo.err(res);
                            }
                        },
                        
                        complete: function () {
                            if (fnHideWait) {
                                fnHideWait();
                            }
                        }
                    });
                    
                    // Make request within a timeout so the chrome can update.
                    window.setTimeout(function () {
                        app.serverProxy.request(callback, params, !!config.override, config);
                    }, 0);
                    
                } catch (ex) {
                    mstrmojo.err(ex);
                }                
            }
        }
    );
    
    window.$MAPF = function () { return false; };
    
}());