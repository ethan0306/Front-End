/**
  * DocInfoWindowController.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>Controller responsible for displaying Map Info window.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */
(function() {

    mstrmojo.requiresCls("mstrmojo.AndroidDocumentController",
                         "mstrmojo.maps.InfoWindow",
                         "mstrmojo.hash",
                         "mstrmojo.MobileDoc",
                         "mstrmojo.MobileDocBuilder"
                      );
    
    var $H = mstrmojo.hash; 

    function _createModel(params) {
        var dm = params.docModel;
        
        // Create the model.
        var model = mstrApp.viewFactory['new' + this.modelName + 'Model']( $H.copy ( dm, {
            controller: this
        }));
        if (params.docParams) {
            var dp = params.docParams;
        	model.st = dp.st;
        	model.n = dp.ttl;
        }
        return model;
    }


    /**
     * Controller for Info Windows created from RW Documents.
     * 
     * @class
     * @extends mstrmojo.AndroidDocumentController
     */
    mstrmojo.maps.DocInfoWindowController = mstrmojo.declare(
            
        mstrmojo.AndroidDocumentController,
        
        null,

        /**
         * @lends mstrmojo.maps.InfoWindowController.prototype
         */
        {
            scriptClass: "mstrmojo.maps.DocInfoWindowController",
            
            restart: function start(params) {
                // create our placeholder view since the previous document replaced it
                mstrApp.rootView.rootContainer.render();
                            
                var model = this.model = _createModel.call(this,params);                
                var newDocParams = $H.copy( params.docParams, {
                        controller: this,
                        model: model,
                        renderMode: "normal",
                        placeholder: mstrApp.rootView.rootContainer.domNode
                    }),
                    doc = this.doc;
                    
                $H.copy( newDocParams, doc );
                
                if ( doc.hasRendered ) {
                    doc.unrender();
                }
                
                doc.removeChildren();
                doc.render();  

                this.loadLayout(params, true );    
            },                

            start: function start(params) {
                var model = this.model = _createModel.call(this,params);                
                
                // create the view
                var doc = this.doc = new mstrmojo.maps.AndroidMapDoc( $H.copy ( params.docParams, {
                            controller: this,
                            model: model,
                            renderMode: "normal",
                            placeholder: mstrApp.rootView.rootContainer.domNode
                        }));
                        
                // Add the builder to the doc.
                doc.builder = new mstrmojo.MobileDocBuilder({
                    parent: doc
                });
                
                // NOTE: you can NOT build the map document's children here w/o first removing any layouts that may have already
                //          been rendered in the main document. [Hosted environment only]
                // doc.buildChildren(false);
                
                // render the document (without it's children) so we have a container to place the layout viewer in
                doc.render();
                
                // if a layout is specified then load it, otherwise we assume the info window is coming from a panel stack
                if ( params.model.vp.lyt !== "" ) {
                    this.loadLayout(params);
                } else {
                    this.loadPanelStack(params);
                }
            },   
            
            loadPanelStack: function() {
                var ths = this,
                    d = ths.model,
                    doc = ths.doc,
                    attribute = d.gts.row[0],
                    elemID = attribute.id,
                    dm = ths.model;

                    dm.getDataService().setDocSelectorElements(ths.sc.ck, elemID, ths.sc.ckey, ths.sc.include, {
                        success: function(res) {
                            var id = elemID + "_ifw", 
                                w = mstrmojo.all[id],
                                psId = "*l"+res.currlaykey+"*k"+ths.sc.tks+"*t"+dm.buildTime;
                            
                            if (w) {
                                w.destroy();
                            }
                            
                            ths.doc.builder.newInfoWindow({
                                id: id,
                                parent: ths,
                                builder: ths.builder,
                                model: dm,
                                psKey: ths.sc.tks,
                                psId: psId
                            }).render();
                            
                        },
                        submission: function() {
                            // mstrApp.showMessage();
                        },
                        complete: function() {
                            // mstrApp.hideMessage();
                        }
                } );
            },
                
            loadLayout: function(params, reload) {              
                var d = this.model = params.model,
                    doc = this.doc,
                    initialIdx = params.rowIndex,
                    layouts = doc.getLayouts(),
                    lyt = d.vp.lyt,
                    layout = layouts[mstrmojo.array.find(layouts, 'k', lyt )];  // existing layout
                                   
                    if ( reload ) {
                        layout.defn.loaded = false;
                    }                         
                    // change the current layout on the server so that the groupBy IDs refer to the correct layout
                    // we must wait for the selection to be changed on the server before continuing with the loading of the layout
                    // due to the groupBy specified.
                    doc.selectLayout(layout,true, {
                        success: function() {
                            var sep = "\x1F",
                                dssXmlTypeAttribute = "12", // EnumDSSXMLObjectTypes.DssXmlTypeAttribute
                                attribute = d.gts.row[0],
                                attrID = attribute.id,
                                elemID = attribute.es[initialIdx].id,                    
                                // GROUPBY ID = attribute ID + sep + ObjectType(12) + sep + element ID
                                gbIDs = attrID + sep + dssXmlTypeAttribute + sep + elemID,
                                taskParams = { layoutKey: lyt, groupByIDs: gbIDs };
                            
                            doc.getNewLayout(
                                taskParams,
                                doc.getLayouts(),
                                false, {
                                    complete: function() {
                                        mstrApp.hideMessage();
                                        if ( typeof mapInfoJSInterface !== "undefined" ) {
                                            mapInfoJSInterface.setWaitScreenVisibility(false);
                                        }
                                    },
                                    submisson: function() {
                                        mstrApp.showMessage();
                                    },
                                    success: function(res) {
                                        doc.gb = res.gb;
                                        doc.currentView = doc.replaceView(res,mstrApp.rootView.rootContainer);                  res.set("visible",true);
                                    }
                                },
                                true
                            );
                        } 
                    });
                
                // Note that it is not necessary to update() here as the getNewLayout specifies the initial groupBy
                // this.update(params.rowIndex);
            },
                        
            /**
             * Updates the info window's contents in response to clicks on a map. The update is accomplished by
             * changing the groupBy on the map's document via it's controller. It is assumed that the info window
             * layout has already been selected as the current layout. The controller will take care of updating the 
             * view with the new information by raising a "rebuidLayout" event.  
             */
            update: function(idx) {
                var doc = this.doc,
                    // for maps we assume only one attribute is specified on the groupBy and ignore any others
                    gb = doc.gb.groupbys[0],                    
                    key = gb.k,
                    // the marker index is zero-based, where as groupBy elements are one-based so we add +1 to skip the "All" groupBy
                    elemID = gb.unit.elms[parseInt(idx,10)+1].v;
                                
                doc.controller.onGroupBy(this, {
                    groupbyKey: key,
                    elementId: elemID
                }, {
                    complete: function() {
                        if ( typeof mapInfoJSInterface !== "undefined" ) {
                            mapInfoJSInterface.setWaitScreenVisibility(false);
                        }
                    }
                });
            }
        });
})();