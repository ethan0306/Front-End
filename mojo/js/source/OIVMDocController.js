(function () {
    
    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.form",
                         "mstrmojo._IsDocController");
        
    var OBJECT_TYPE_REPORT = 3; //EnumDSSXMLObjectTypes.DssXmlTypeReportDefinition
    
    /**
     * RW Document controller in OIV Mode.
     * 
     * @extends mstrmojo.Obj
     */
    mstrmojo.OIVMDocController = mstrmojo.declare(
        mstrmojo.Obj,
        
        [mstrmojo._IsDocController],
        
        /**
         * @lends mstrmojo.OIVMDocController.prototype
         */
        {
            scriptClass: 'mstrmojo.OIVMDocController',
            
            onSort: function onSort(view, action) {
                // Add the tree type.
                action.treeType = view.treeType;
                
                view.model.sort(this._addNodeKeyToAction(view, action), this._getXtabCallback.call(this, view));
            },
            
            onPivot: function onPivot(view, action) {
                view.model.pivot(this._addNodeKeyToAction(view, action), this._getXtabCallback.call(this, view));
            },
            
            onDrill: function onDrill(view, action) {
                if (action.isWithin) {
                	if(!!this.isInRequest()) {
                		view.model.drillGrid(this._addNodeKeyToAction(view, action), this._getXtabCallback.call(this, view));
                	}
                    
                } else {
                    var model = this.model,
                        prefs = this.model.prefs,
                        retainParent = prefs.rtprnt,
                        retainThreshold = prefs.rtthld;
                    
                    // Use a form to drill to a report outside this document.
                    mstrmojo.form.send({
                        evt: 3125, 
                        displayMode: -1,
                        drillPathKey: action.drillPathKey, 
                        elementList: action.drillElements, 
                        rwMesageID: model.mid,
                        retainParent: isNaN(retainParent) ? '' : retainParent,
                        retainThresh: isNaN(retainThreshold) ? '' : retainThreshold,
                        rwGroupByElements: this.getGroupByElements(view).join(','),  
                        sliceId: view.sid || 0
                    }, null, null, ((prefs.drillnw) ? '_blank' : null));
                }
            },
            
            onExecuteNewObject: function onExecuteNewObject(view, params) {
                if(params) {
                    var m = {};
                    if(params.objType === OBJECT_TYPE_REPORT) {//report
                        m.evt = 4001;
                        m.reportID = params.did;
                        m.reportViewMode = 1;
                        if(params.forceExec) {
                            m.execFlags = 16777601;
                        }
                    } else {
                        m.evt = 2048001;
                        m.objectID = params.did;
                        if(params.forceExec) {
                            m.freshExec = true;
                        }
                    }
                    if(params.linkAnswers) {
                        m.linkAnswers = params.linkAnswers;
                    }
                    mstrmojo.form.send(m, null, "POST", null);
                }
            },
            
            onReExecute: function(view, ignoreStatus) {
                if(ignoreStatus) {
                    var md = view.model;
                    mstrmojo.form.send({evt: 2048030, src: md.bp + '.2048030', ignoreStatus:true, rwb: md.bs}, null, "POST", null);
                } else {
                    view.model.raiseEvent({name: 'refresh'});
                }
            },
            
            invalidClientCache: function() {
                //invalid cache currently is only supported in mobile platform
            },
            
            onLink: function onLink(view, action) {
                if ( action.link) {
                    action.linkAnswers = action.link.toXml();
                    delete action.link;
                }
                var target = action.target || action.linkTarget || '_self';
                
                // Is this a url link?
                if (action.url) {
                    window.open(action.url, target);
                } else {
                    mstrmojo.form.send(action, null, 'POST', target);
                }
            },
            
            onTransactionUpdates: function onTransactionUpdates(view, updateObject, autoRefresh) {
                //in OIVM, we do not send the update each time. The transaction changes are submitted
                //along with other manipulations such as incremental fetch.
                
                //trigger data refresh on the view, grid will fire incremental fetch if auto refresh is on
                if(autoRefresh) {
                    view.autoRefresh();
                }
            },
            
            onDownloadGridData: function onDownloadGridData(view, action) {
                // Delegate download to the DocMdoel.
                this.model.downloadGridData(this._addNodeKeyToAction(view, action));
            },
            
            onGroupBy: function onGroupBy(view, params, fnWait) {
                var me = this,
                    model = view.model,
                    groupbyKey = params.groupbyKey,
                    unloadLayouts = false;
                
                //agb values:
                //2 means that we shall apply change to all layouts
            	//1 means that we shall apply changes only to the current layout.
            	//0 (a default value) means that behavior shall be the same as before we introduced this property.
            	//  For web this means the same as value 1 but for Mobile it shall mean the same as 2.
                //flag values:
                //2 means that we shall apply change to all layouts without matching group by paths
                //1 means that we shall apply change to all layouts but only if layouts group by path matches current 
                //  layout group by path. (We don't use this value for Web).
            	//0 means that we shall apply group by changes only to the current layout.
        		params.flags = model.agb == 2 ? 2 : 0;

        		//Remember that we need to unload cached layouts because we are applying group bys to multiple layouts.
        		//We will unload them if the chageDocGroupBy succeeds.
        		unloadLayouts = !!params.flags;
        		
                model.getDataService().changeDocGroupBy(params, {
                    submission: function () {
                        fnWait(true);
                    },
                    success: function (res) {
                    	if ( unloadLayouts ) {
                    		view.parent.parent.unloadGbLayuts(groupbyKey);
                    	}
                        model.loadLayout(res);
                    },
                    complete: function () {
                        fnWait(false);
                    }
                });
            }
        }
    );
})();