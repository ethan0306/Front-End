/*global mstrmojo:false, window:false, document:false */

(function(){
    
    mstrmojo.requiresCls("mstrmojo.form", 
                         "mstrmojo.hash",
                         "mstrmojo.Button");
    
    var $DESC = mstrmojo.desc,
        $NIB = mstrmojo.Button.newInteractiveButton;
    
    /**
     * Redirects to a page, using the passed in parameters.
     * 
     * @param {Object} params The event parameters.
     * @private
     */
    function toPage(me, params){
        mstrmojo.form.send(params, null, "post");
    }

    /**
     * Redirects to a page in the Page History List.
     * 
     * @param {Object} params The event parameters.
     * @private
     */
    function openHistoryPage(me, relNum){
        var m = me.model;
        toPage(me, {
            evt: 3124, 
            src: mstrApp.name + '.' + mstrApp.pageName + '.3124',
            relativePageNumber: relNum,
            messageID: m.mid,
            rwb: m.bs
        });
    }
    
    /**
     * Changes the document view mode.
     * 
     * @param {mstrmojo.Doc} doc The instance of {@link mstrmojo.Doc} whose view mode should be switched.
     * @param {Integer} mode The new view mode.
     * 
     * @private
     */
    function toMode(doc, mode) {
        var m = doc.model;
        var conf = {
            evt: 2048001,            // setCurrentViewMode
            messageID: m.mid,
            rwb: m.bs
        };
        //Is it a web view mode or IVE?
        if (mode < 50 || mode === 2048) {
            conf.visMode = 0;
            conf.currentViewMedia = mode;
        }
        else {
            conf.visMode = mode;
            conf.currentViewMedia = 1;
        }
        toPage(doc, conf);
    }
    
    /**
     * Redirects to a another view mode if the user came to OIVM by switching view modes (Design, IVM, EVM)
     * Otherwise, redirects the user to the last page in the Page History List.
     * 
     * @private
     */
    function handleClose(me) {
        var prevViewMedia = mstrApp.prevViewMedia;
    
        if ((!prevViewMedia && prevViewMedia !== 0) || prevViewMedia === -1) {
            //If we don't have the previous view media defined, go to the last successful page
            openHistoryPage(me, -1);
        } else {
            //Did we come from Design Mode?
            if (prevViewMedia === 0) {
                //Execute the RWD in Design mode...
                me.designViewMode();
            } else {
                //If not, switch the other view mode.
                toMode(me, prevViewMedia);
            }
        }
    }

    /**
     * Reloads the document.
     * 
     * @param {Boolean} reprompt True to re-prompt the document.
     * @param {Boolean} refresh True to refresh the document data.
     * @param {Boolean} regen True to regenerate the document.
     * 
     * @private
     */
    function reload(doc, reprompt, refresh, regen) {
        var m = doc.model;
        toPage(doc, {
            evt: 2048030,        // RW_REFRESH
            src: m.bp + '.2048030',
            rePrompt: reprompt,
            fresh: refresh,
            regenerate: regen,
//            messageID: m.mid, // TQMS 459779 (reprompt would generate a new message id, when the request is forwarded to anther page, the messageID in request would override the duplicated message id used for reprompting.
            rwb: m.bs
        });
    }
    
    /**
     * Sets the "zoomValue" property of a given doc according to the doc's model's "zf" and "ztp" settings.
     * The "zoomValue" property will be set to the item from the doc's "zoomOptions" list (if any) which matches the model's
     * current settings.  If no such match is found, the "zoomValue" property will be set to a new item.
     */
    function updateZoomValue(doc, bSuppressEvt) {
        var m = doc.model,
            ztp = (m && m.ztp) || 0,
            zf = (m && m.zf) || 1,
            newid = ztp + ':' + zf,
            ops = doc.zoomOptions,
            newv;
        if (ops) {
            var idx = mstrmojo.array.find(ops, 'dssid', newid);
            if (idx > -1) {
                newv = ops[idx];
            }
        }
        if (!newv) {
            newv = {
                    n: parseInt(zf*100, 10) + '%',
                    dssid: newid,
                    f: zf, 
                    tp: ztp};
        }
        if (bSuppressEvt === true) {
            doc.zoomValue = newv;
        } else {
            doc.set('zoomValue', newv);
        }
    }
    
    /**
     * Prompt users to save if there is change in model.
     * 
     * @param String title Confirmation dialog title text
     * @param String msg Confirmation dialog content text
     * @param Function fn Function to execute if no need to save
     * @param Object params Parameter for the function to execute if no need to save
     * @param String saveParam Additional parameter for SaveAs event
     */
    function prompt2save (me, title, msg, fn, params, saveParam) {
        var m = me.model,
            dty = m && m.dty;
        if (!dty) {
            fn(me, params);
            return;
        }
    
        var btnHalo = '#666';
        
        mstrmojo.confirm(
                msg, 
                [ 
                     $NIB($DESC(1442), function() {
                         // Make sure we have the serializer.
                         mstrmojo.requiresCls("mstrmojo.Serializer");

                         // Perform save action.
                         me.save(saveParam);
                     }, btnHalo), 
                     $NIB($DESC(2140), null, btnHalo)
                 ],
                 title);
    }
    
    /**
     * Private constants for export types.
     * 
     * @ignore
     */
    var EXP_HTML = -1,
        EXP_PDF = 3,
        EXP_EXCEL = 4,
        EXP_FLASH = 7;
    
    mstrmojo._DocOIVMMethods = {
        /**
         * These methods are used to request a view mode.
         */
        staticViewMode: function svm() {
            toMode(this, 1);
        },
        
        interactiveViewMode: function ivm() {
            toMode(this, 2);
        },
        
        editableMode: function evm() {
            toMode(this, 4);
        },
        
        flashViewMode: function fvm() {
            toMode(this, 8);
        },
        
        IVEMode: function ive() {
            toMode(this, 2048);
        },
        
        remainExpressViewMode: function remainExpress() {
            //Do nothing. It's attached to a dummy express view icon
        },
        
        /**
         * Changes the current view mode to "Design".
         */
        designViewMode: function dvm() {
            toPage(this,{
                evt: 3104,    // changeDesignMode
                rwDesignMode: 1,
                messageID: this.model.mid,
                rwb: this.model.bs
            });
        },
        
        convertToDoc: function ctd() {
            var me = this;
             mstrmojo.confirm($DESC(8127), 
                     [
                          $NIB(
                              $DESC(1442),
                              function(){
                                  me.designViewMode();
                              },
                              null
                          ),$NIB(
                              $DESC(2140), 
                              null, 
                              null
                          )
                      ]);
        },
        
        /**
         * Redirects to the "Save As" page.
         */
        save: function save(param){
            var m = this.model;
            toPage(this, 
                    mstrmojo.hash.copy(param,
                    {
                        evt: 3102,                            // openRWSaveAs
                        applyChanges: false,
                        executionMode: 2,
                        parentFolderID: m.sfid || m.pfid,    // Use either the save folder ID (if present) or the parent folder ID.
                        saveFromDesignMode: false,
                        rwb: m.bs                            // Add the bean state.
                    }));
        },
        
        /**
         * Redirects to the "Folder Browse" page of the documents parent folder.
         */
        browseParent: function pFldr() {
            var m = this.model,
                params = {evt: 3010};			// TQMS 543178, go up to desktop page when parent folder is hidden
            
            if (!m.pfh) {
            	params.evt = 2001;				// Browse Folder
            	params.folderID = m.pfid;
            	//If the parent folder is a system folder, append the sys folder id.
                if (m.sysFolder) {
                    params.systemFolder = m.sysFolder; 
                }
            }
            
            //xhr call to browse to parent folder
            toPage(this, params);
        },
        
        /**
         * Redirects to another view mode if the user switched view modes
         * Redirects to the last successful page if the user came in from another other way.
         */
        close: function cl() {
            handleClose(this);
        },
        
        /**
         * @param {Integer} relNum
         */
        openPage: function opPg(relNum) {
            openHistoryPage(this, relNum);
        },
        
        saveToInbox: function inbox() {
            var me = this;
            mstrApp.serverRequest({
                    taskId: "addDocToHistoryList",
                    rwb: me.model.bs    
                }, {
                    success: function() {
                        var f = me.model.features;
                        if (f) {
                            if (f.set) {
                                f.set("enable-add-history-list", false);
                            } else {
                                f["enable-add-history-list"] = false;
                            }
                        }
                        mstrmojo.alert($DESC(8047));    // Your document has been added to the History List.
                    }
                });
        },
        
        reprompt: function rpmpt(){
            reload(this, true, false, false);
        },
        
        refresh: function rfsh(){ 
            reload(this, false, false, false);
        },
        
        rerun: function rerun(){
            reload(this, false, true, false);
        },
        
        docVisualizationModeAJAX: function vizAjax(){
            toMode(this, 51);
        },
        
        docVisualizationModeFlash: function vizFlash(){
            toMode(this, 50);
        },
        
        sendNow: function sndNow() {
            prompt2save(this,
                    mstrmojo.desc(2331), //Descriptor: Send Now
                    mstrmojo.desc(2513), //You must save the report/document before you can send it.
                    toPage, //send Now page
                    {
                        evt: 3037, 
                        objectType: 55,
                        objectSubType: 14081,
                        messageID: this.model.mid
                    },
                    { //additional parameter for save()
                        saveAsOrigin: 2
                    }
            );
        },
        
        scheduleHL: function scHL() {
            prompt2save(this,
                    $DESC(5017), //Descriptor: Subscribe to History List
                    $DESC(2510), //You must save the report/document before you can subscribe to it.
                    toPage, //schedule page
                    {
                        evt: 3128, 
                        objectType: 55,
                        objectSubType: 14081,
                        messageID: this.model.mid
                    },
                    { //additional parameter for save()
                        saveAsOrigin: 3
                    }
            );
        },

        /**
         * The current zoom level, calculated from the model.
         */
        zoomValue: null,

        /**
         * Requests a change in the current zoom level.
         */        
        zoom: function zm(/*String*/ dssid) {
            // Get a NumberFormat instance...
            var nf = mstrmojo.NumberFormat.getInstance(mstrConfig.decimalSep, mstrConfig.thousandsSep);
            
            // Validate and parse input ("<type>:<factor>").
            var parts = (dssid !== null) ? String(dssid).split(":") : [],
                ztp = parseInt(parts[0], 10), 
                zfStr = parts[1],
                zf = nf.parse(zfStr);
            if (isNaN(ztp) || (!ztp && isNaN(zf))) {
                return;
            }
            
            var model = this.model;
            
            // Is the selected zoom value 'Fit Width' or 'Fit Page'?
            if (ztp === 1 || ztp === 2) {
                
                // Yes, so we need to calculate the zoom value.
                var lv = this.selected,
                    l = lv && lv.docLayout || null, 
                    d = l && (l.containerNode || l.domNode),
                    docEl = d && d.ownerDocument.documentElement,
                    currzf = (model && model.zf) || 1;
                    
                // This utility method will calculate a zoom factor to fit a given dimension ("Height" or "Width").
                var fnFitDimension = function (/*String*/ dim) {
                    var x = d && d['offset' + dim];
                    if (!x) {
                        return 1;
                    }
                    
                    var xWin = Math.max(1, docEl['client' + dim] - 12);                         // 12 is for the MARGIN.
                    return Math.min(4, Math.max(0.1, Number(currzf * xWin / x).toFixed(2) ) );
                };
                
                // Calculate a zoom factor for 'Width'.
                zf = fnFitDimension('Width');
                
                // Is the selected zoom value 'Fit Page'?
                if (ztp === 2) {
                    // Zoom factor should be the minimum of 'Width' and 'Height'.
                    zf = Math.min(zf, fnFitDimension('Height'));
                }
                
                // Convert the numeric zoom factor to a locale specific string...
                zfStr = nf.format(zf);
            }
            
            // Create new value with zoom type and zoom factor.
            var newid = ztp + ':' + zfStr;
            if (newid !== (this.zoomValue && this.zoomValue.dssid)) {
                var me = this;
                
                model.getDataService().setDocZoom({
                        zoomType: ztp,
                        zoomFactor: zfStr
                    }, {
                        success: function (res) {
                            // Overwrite new zoom values.
                            model.zf = res.zf;
                            model.ztp = res.ztp;
                            
                            // Replace the current data layout node with the new one.
                            model.replaceLayout(res.currlaykey, res);

                            // Raise the rebuildLayout event so the doc will rebuild itself.
                            model.raiseEvent({ 
                                name: 'rebuildLayout' 
                            });

                            // Refresh the "zoomValue".
                            updateZoomValue(me, false);
                            me = null;                                
                        }, 
                        failureName: 'zoom.set'
                    });
            }
        },
        
        /**
         * @param {Integer} mode The mode to export to.
         */
        exportCmd: function(mode, gridKey) {
            
            var m = this.model,
                exEvt = (parseInt(mode, 10) === EXP_HTML) ? 3130 : 3132,                // The event ID for this export operation.
                exOptions = m.exopt,                                                    // Get the export options from the model.
                promptUC = m.huc && mode === EXP_FLASH,                                 // If the UC warning descriptor is present and we are exporting to flash show the prompt
                promptUser = exOptions.s && (mode === EXP_EXCEL || mode === EXP_PDF) && !gridKey,   // Based on export settings property and mode (Excel or PDF) do we need to prompt user?
                bGbAll = false,                                                         // Default to 'false' (will show group by field because single layout has group by not set to 'All' or is a multiple layout document).
                bMulti = false;                                                         // Default to 'false' (will not show layout field because it's a single layout document).
            
            // Should we prompt the user based on export options and mode?
            if (promptUser) {
                
                // Is this a multiple layout document?
                if (!!(m.defn.layouts && m.defn.layouts.length > 1)) {
                    // Need to prompt user for all layouts (or current layout) and group by since we don't know if other layouts have group by.
                    bMulti = true;
                    
                } else {
                    // Retrieve the GroupBy child from the DocLayoutViewer.
                    var lyt = this.selected,
                        gb = lyt && lyt.gb && lyt.children[1];
                    
                    // Consider that group by are all set to 'All' if there is no group by or the group by is actually set to 'All'.
                    bGbAll = (!gb || gb.areUnitsSetToAll()); 
                    
                    // Is the group by set to 'All'?
                    if (bGbAll) {
                        // No need to prompt user since there is only one layout and it's group by is set to 'All' or there is no group by.
                        promptUser = false;
                    }
                }
            }
                
            // Utility function for submitting export action.
            var fnExport = function () {
                // Build the params for the export event.
                var params = {
                    evt: exEvt,
                    src: mstrApp.name + '.' + exEvt
                };
                
                // Add the executionMode for non html exports.
                if (exEvt === 3132) {
                    params.executionMode = mode;
                    if(gridKey != null) {
                        params.gridKey = gridKey;
                    }
                }
                
                // Did we prompt for export options?
                if (!promptUser) {
                    // No, then add the bean state.
                    params.rwb = m.bs;
                    
                } else {
                    // Yes, then we need to serialize multiple events.
                    var s = mstrmojo.Serializer;
                    
                    // Create an array with event values to be serialized.  The first element will be the export options and the second will be the export operation event.
                    var evts = [ [ 2048062, m.bp + '.2048062', 'mode', exOptions.m, 'range', exOptions.r ], [] ];
                    
                    // Add the original export event to serialized events.
                    mstrmojo.hash.forEach(params, function (v, k) {
                        // Is this the executionMode parameter?
                        if (k === 'executionMode') {
                            // Add both the name and the value.
                            evts[1] = evts[1].concat([ k, v ]);
                        } else {
                            // Otherwise, push the value only.
                            evts[1].push(v);
                        }
                    });
                    
                    // Create the multiple events parameters.
                    params.evt = 1024001;
                    params.src = m.bp + '.1024001';
                    params.events = s.serializeValueGroup(evts);
                    params['1024001'] = 1;
                    params.messageId = m.mid;
                }

                // Add a time stamp to prevent caching.
                params.name = Date.parse(new Date());
                
                // Create a function to perform the export.
                var exFn = function () {
                    mstrmojo.form.send(params, null, null, (exOptions.n) ? '_blank' : 'mstrExportWindow');
                };
                
                // Is this not a flash export OR is it not from an IE browser?
                if (!mstrmojo.dom.isIE || mode !== EXP_FLASH) {
                    // Call export function.
                    exFn();
                } else {
                    // Notify the user before exporting.
                    mstrmojo.alert(exOptions.ds[5873], exFn);  // Descriptor: You need to save the exported file locally before you can open it.
                }
            };
            
            var ds = exOptions.ds,  // Export options descriptors.
                btnHalo = '#666',   // Button halo color.
                fnPrompt;
            
            if (promptUser || promptUC) {
                // Utility function for prompting user for export options before exporting.
                fnPrompt = function() {
                    var id = 'mojoExOpx9',
                        fnDestroy = function() {
                            mstrmojo.all.mojoExOpx9.destroy();
                        };
                    
                    mstrmojo.insert({
                        scriptClass: 'mstrmojo.Dialog',
                        id: id,
                        title: ds[971],
                        cssText: 'min-width:225px;max-width:325px;',                        
                        btnAlignment: 'right',
                        buttons: [ 
                            $NIB(ds[1442], function() {
                                // Make sure we have the serializer.
                                mstrmojo.requiresCls("mstrmojo.Serializer");
    
                                // Update values on model.
                                var p = mstrmojo.all[id];
                                if (bMulti) {
                                    exOptions.r = p.ctrlLyt.selected;
                                }
                                if (!bGbAll) {
                                    exOptions.m = (p.ctrlChk.checked) ? 0 : 1;
                                }
                                
                                // Destroy the dialog.
                                fnDestroy();
                                
                                // Perform export action.
                                fnExport();
                                
                            }, btnHalo), 
                            $NIB(ds[2140], fnDestroy, btnHalo)
                        ],
                        children: [{
                            // Alert for UC when in flash
                            scriptClass: 'mstrmojo.Label',
                            text: ds[7482],
                            visible: promptUC
                        }, {
                            // Layouts pulldown
                            scriptClass: 'mstrmojo.DropDownList',
                            title: ds[246],
                            cssClass: 'field',
                            cssDisplay: 'block',
                            alias: 'ctrlLyt',
                            visible: !!bMulti,
                            idx: exOptions.r,
                            options: [{
                                n: ds[5137],
                                v: 0
                            }, {
                                n: ds[5138],
                                v: 1
                            }]
                        }, {
                            // Expand group by checkbox.
                            scriptClass: 'mstrmojo.CheckBox',
                            label: ds[5165],
                            cssClass: 'field',
                            cssDisplay: 'block',
                            alias: 'ctrlChk',
                            visible: !!!bGbAll && promptUser,
                            checked: (exOptions.m === 0)
                        }]
                    }).render();
                };
            }
            
            // Is this an Excel export and do we need to warn them about Office refresh?
            if (mode === EXP_EXCEL && '3809' in ds && !gridKey) {
                // Tell the user that refresh to Office won't work.  If they hit okay then prompt or export.
                mstrmojo.confirm(ds['3809'], [
                    $NIB(ds[1442], fnPrompt || fnExport, btnHalo),
                    $NIB(ds[2140], null, btnHalo)
                ]);
                
            // Should we prompt with export options?
            } else if (fnPrompt) {
                // Prompt (export will happen after prompt is closed).
                fnPrompt();
            
            // No prompt, so perform export.
            } else {
                fnExport();
                
            }
        },
        
        printPDF: function prntPDF(){
            this.exportCmd(EXP_PDF);
        },
        
        openHome: function openHome(me){
            toPage(me, {
                evt: 3010, 
                src: mstrApp.name
            });
        },
        
        updateZoom: function updateZoom () {            
            updateZoomValue(this, false);
        },
        
        __onmixin__: function() {
            // Initialize zoom level.
            updateZoomValue(this, true);
        }
    };

}());