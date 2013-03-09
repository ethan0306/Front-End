/**
 * AndroidDocMap.js
 * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
 * @version 1.0 
 * @fileoverview <p>Android flavour of Map contained in RW documents.</p>
 * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
 */

(function () {
    mstrmojo.requiresCls("mstrmojo.maps.AndroidMap",
                         "mstrmojo.maps.AndroidDocMapInfoWindow",
                         "mstrmojo.Overlay",
                         "mstrmojo.hash",
                         "mstrmojo.array");

    /**
     * <p>A widget to display an Android specific Android Map in RW documents.</p> 
     * 
     * This is intended to live inside an AndroidView widget as the contentChild.
     * 
     * @class
     * @extends mstrmojo.Box
     */
    mstrmojo.maps.AndroidDocMap = mstrmojo.declare(
        mstrmojo.maps.AndroidMap,

        [ mstrmojo._Formattable ],

        {
            scriptClass: "mstrmojo.maps.AndroidDocMap",

            cssClass: "mstr-googleMapView",

            formatHandlers: {
                domNode: ['left', 'top', 'z-index', 'height', 'width', 'border', 'border-color', 'border-style', 'border-width' ]
            },

            sc: null,
            
            getMapModel: function getMapModel() {
                var d = this.doc,
                    m = d.model,
                    pid = mstrApp.getCurrentProjectId(),
                    sessions = mstrApp.serverProxy.getSessions();

                return {
                    pid: pid,
                    sessions: sessions,
                    model: this.model,
                    docData: {
                        did: d.did,
                        ttl: d.ttl,
                        st: d.st,
                        mid: m.mid,
                        bs: m.bs,
                        data: m.data,
                        defn: m.defn
                    },
                    cfg: mstrApp.getConfiguration().getConfiguration()
                };
            },

            setModel: function setModel(d) {
                // our containing mobile doc is assumed to be the controller's content view
                this.doc = d.controller.contentView;
                this._super(d);
            },

            initFromVisProps: function initFromVisProps(vp) {
                this._super(vp);

                if (!vp) {
                    return;
                }

                this.iwDocLayout = (parseInt(vp.dl, 10) === 1);

                // get the type of map we're supposed to display
                if (vp.lyt) {
                    this.iwLayoutKey = vp.lyt;
                }
            },

            /**
             * find info window panel stack defn
             */
            findSelectorTarget: function findSelectorTarget(sc) {
                if (sc && sc.tks) {
                    var dm = this.model.docModel,
                        targets = sc.tks.split('\u001E'),
                        i = 0,
                        len = targets.length;

                    for (; i < len; ++i) {
                        var d = dm.getTargetDefn(targets[i]);
                        if (d[targets[i]].ifw) {
                            return targets[i];
                        }
                    }
                }
            },

            showInfoWindow: function showInfoWindow(mp, mkr, w) {
                this.openedInfoWindow = w;
                w.open(mp, mkr);
            },

            /*
             * Uses the marker information to generate the info window content,
             * in a perfect world this should be called once for each marker and 
             * when clicked.
             **/
            getInfoWindow: function getInfoWindow(map, marker) {
                var gd = this.gridData;

                // is this a doc layout info window?
                if (this.iwDocLayout) {

                    // YES, we must load the layout async. and then display the window
                    this.getInfoWindowFromLayout(gd, map, marker, this.showInfoWindow);

                } else {

                    var sc = this.getInfoWindowSelectorControl(gd),
                        firstInfoWinKey = this.findSelectorTarget(sc);

                    // is there a selector target that is an info window?
                    if (!(!!sc && firstInfoWinKey)) {
                        // no, display the default info window
                        return this.getDefaultInfoWindow(gd, marker);
                    }

                    // NOTE: info windows from panel stacks will be created in postHandleMarkerClick()
                }
            },

            getInfoWindowFromLayout: function getInfoWindowFromLayout(d, map, marker, callback) {
                // Get the attribute id from the marker, we need it for send it to the task
                var ths = this,
                    doc = this.doc,
                    layouts = doc.getLayouts(),
                    lyt = this.iwLayoutKey,
                    layout = layouts[mstrmojo.array.find(layouts, 'k', lyt)],
                    sep = "\x1F",
                    dssXmlTypeAttribute = "12",
                    // EnumDSSXMLObjectTypes.DssXmlTypeAttribute
                    // GROUPBY ID = attribute ID + sep + ObjectType(12) + sep + element ID
                    gbIDs = marker.attrid + sep + dssXmlTypeAttribute + sep + marker.eid;

                var taskParams = {
                    layoutKey: lyt,
                    groupByIDs: gbIDs
                };

                doc.selectLayout(layout, (lyt !== doc.model.currlaykey), {
                    complete: function () {

                        layout.defn.loaded = false;

                        doc.getNewLayout(taskParams, layouts, false, {
                            complete: function () {
                                mstrApp.hideMessage();
                            },
                            submisson: function () {
                                mstrApp.showMessage();
                            },
                            success: function (res) {
                                var node = res.node, overlay,
                                    content = document.createElement('div'),
                                    contentStyle = content.style,
                                    w = node.defn.fmts.width,
                                    h = node.defn.fmts.height || node.data.mh; //get minimum layout height if no format height defined
                                
                                overlay = new mstrmojo.Overlay({
                                    children: [res]
                                });
                                //set the dimensions
                                overlay.set('width', w);
                                overlay.set('height', h);
                                
                                // create element to act as layout containerNode
                                var cn = document.createElement('div');
                                overlay.placeholder = cn;
                                overlay.render();
                                
                                contentStyle.overflow = "hidden";
                                content.appendChild(overlay.domNode);
                                
                                var win = new google.maps.InfoWindow({
                                    content: content
                                });
                                
                                //callback.call(ths, map, marker, win);
                                ths.openedInfoWindow = win;
                                win.open(map, marker);
                                
                                var INTERVAL = 300,
                                    t = 0, 
                                    ti = window.setInterval(function() {
                                        var n = content.parentNode;
                                        if(n) {
                                            var ow = n.offsetWidth,
                                                oh = n.offsetHeight;
                                            if(ow !== parseInt(w, 10) || oh !== parseInt(h, 10)) { 
                                                overlay.setDimensions(oh + 'px', ow + 'px');
                                                window.clearTimeout(ti);
                                            }
                                        }
                                        t += INTERVAL;
                                        //if it exceeds the maximum time we can wait, we assume the google bubble size is the same size
                                        //as we initially set on the layout
                                        if(t > 10*INTERVAL) {
                                            window.clearTimeout(ti);
                                        }
                                    }, INTERVAL); //use interval to check the google bubble height
                            }
                        }, true);
                    }
                });
            },

            getInfoWindowSelectorControl: function getInfoWindowSelectorControl(d) {
                if (!this.sc) {
                    // we assume that the first attribute on the rows has the selector control
                    this.sc = d.gts.row[0].sc;
                }
                return this.sc;
            },

            /**
             * Called after info window has been displayed in response to user click on map marker;
             *
             * For documents, if the info window was generated from a layout or we are using the default window, then
             * we need to also check for any document elements that the grid may be targeting and make sure they get updated.
             * For panel stack info windows, we have already done this when we called setDocSelectorElements(). 
             */
            postHandleMarkerClick: function postHandleMarkerClick(map, marker) {

                var d = this.gridData,
                    sc = this.getInfoWindowSelectorControl(d);

                if (sc && sc.tks) {
                    var ths = this,
                        dataCacheUpdate = null,
                        dm = ths.model.docModel;

                    dm.getDataService().setDocSelectorElements(sc.ck, marker.eid, sc.ckey, sc.include, {
                        success: function (res) {

                            // The collection of target definitions for this slice.
                            var tgtDefs = dm.getTargetDefn(sc.tks);

                            // With new partial update mechanism
                            if (res.pukeys) {
                                tgtDefs = dm.getTargetDefn(res.pukeys);
                            }

                            // Update this DocModel's "dataCache" with a hash of all the partial update nodes which are either targets or descendants of targets.  
                            // Returned is an object with information about widgets that need to be updated as a result of this operation.
                            // update the data cache with the new data for the target
                            dataCacheUpdate = dm.updateDataCache(res.data, tgtDefs);

                            var firstInfoWinKey = ths.findSelectorTarget(sc);

                            // do we have a target that is an info window?
                            if (firstInfoWinKey) {
                                // create the info window for the map marker using the data from the partial update.  We render the first
                                // panel stack with the ifw property set for use as the window's content.

                                var targetDef = dm.getTargetDefn(firstInfoWinKey),
                                    id = firstInfoWinKey + "_ifw";
                                    w = mstrmojo.all[id],
                                    psId = "*l" + res.currlaykey + "*k" + firstInfoWinKey + "*x1*t" + dm.buildTime;

                                // if we have already created an info window then destroy it
                                if (w) {
                                    w.destroy();
                                }

                                // create a map info window.  Note that we don't use the DocInfoWindow because it is anchorable
                                // and we don't have the anchor - Google's map does.
                                var ifw = new mstrmojo.maps.AndroidDocMapInfoWindow({
                                    id: id,
                                    parent: ths,
                                    builder: ths.builder,
                                    model: dm,
                                    psKey: firstInfoWinKey,
                                    psId: psId
                                });

                                // Retrieve formats and create content node.
                                var fmts = targetDef[firstInfoWinKey].fmts,
                                    content = document.createElement('div'),
                                    contentStyle = content.style,
                                    w = fmts.width,
                                    h= fmts.height;

                                //set the dimensions
                                ifw.set('width', w);
                                ifw.set('height', h);

                                // create element to act as containerNode and render the info window.
                                var cn = document.createElement('div');
                                ifw.placeholder = cn;
                                ifw.render();
                                
                                contentStyle.height = h;
                                contentStyle.width = w;
                                contentStyle.overflow = "hidden";                                
                                content.appendChild(ifw.domNode);
                                
                                // create the info window passing the rendered panel stack as the content
                                var iw = new google.maps.InfoWindow({
                                    content: content
                                    // ,
                                    // maxWidth: parseInt(targetDef[firstTargetKey].fmts.width,10)
                                });

                                // call the callback to display the info window
                                // ths.showInfoWindow(map, marker, iw);

                                ths.openedInfoWindow = iw;
                                iw.open(map, marker);
                                
                                var INTERVAL = 300,
                                    t = 0, 
                                    ti = window.setInterval(function() {
                                        var n = content.parentNode;
                                        if(n) {
                                            var ow = n.offsetWidth,
                                                oh = n.offsetHeight;
                                            if(ow !== parseInt(w, 10) || oh !== parseInt(h, 10)) { 
                                                ifw.setDimensions(oh + 'px', ow + 'px');
                                                window.clearTimeout(ti);
                                            }
                                        }
                                        t += INTERVAL;
                                        //if it exceeds the maximum time we can wait, we assume the google bubble size is the same size
                                        //as we initially set on the layout
                                        if(t > 10*INTERVAL) {
                                            window.clearTimeout(ti);
                                        }
                                    }, INTERVAL); //use interval to check the google bubble height






                            }

                            // to update any other targets we have the doc model raise an partialUpdate event.  Other
                            // widgets that need updating will be listening for this event and update accordingly.
                            var ue = {
                                name: 'partialUpdate',
                                tree: res.data,   // Partial update tree.
                                ids: dataCacheUpdate
                            };

                            //if has info window, pass on the position. 
                            if (!mstrmojo.hash.isEmpty(ue.ids.ifws)) {
                                // delete the info window from the array of info windows that need updating
                                delete ue.ids.ifws[firstInfoWinKey];
                            }

                            // Raise the 'partialUpdate' event so the doc widgets will hear it.
                            dm.raiseEvent(ue);
                        }
                    }, dm.zf, true);
                }
            }
        }
    );
}());