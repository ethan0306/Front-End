(function () {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.MetricSlider",
                         "mstrmojo.MetricQualification",
                         "mstrmojo.SearchBoxSelector",
                         "mstrmojo.Label",
                         "mstrmojo.hash",
                         "mstrmojo.array");

    var $HASH = mstrmojo.hash,
        $ARR = mstrmojo.array,
        $FN = mstrmojo.emptyFn;

    var STYLES_PULLDOWN = 0,
        STYLES_SCROLLER = 1,
        STYLES_LIST = 2,
        STYLES_RADIO = 3,
        STYLES_CHECKBOX = 4,
        STYLES_BUTTON = 5,
        STYLES_LINK = 6,
        STYLES_METRIC_SLIDER = 7,
        STYLES_METRIC_QUAL = 8,
        STYLES_SEARCH_BOX = 9;
        
    var _ST_UC_ON_DS = 2;   //control sub type: CONDITION_SELECTOR_ON_DATASET
        

    /**
     * Id for (ALL) element.
     *
     * @const
     * @private
     */
    var ALL_ID = 'u;'; // RWGroupByElements.ALL_ID

    /**
     * JavaScript widget class names for different slider types.
     *
     * @const
     * @private
     */
    var widgetMap = {};
    widgetMap[STYLES_METRIC_SLIDER] = 'MetricSlider';
    widgetMap[STYLES_METRIC_QUAL] = 'MetricQualification';
    widgetMap[STYLES_SEARCH_BOX] = 'SearchBoxSelector';

    /**
     * Updates the selector control with information pertinent to it's operation.
     *
     * @param {mstrmojo.Widget} selectorCtrl The selector control to be updated.
     * @param {Integer} style The style of control.
     * @param {Object} data The data node from the {@link mstrmojo.DocSelector}.
     * @param {Object} idx The selected indices.
     * @param {Object[]} elements The selector elements.
     *
     * @private
     */
    function updateSelectorControl(selectorCtrl, style, data, defn, idx, elements) {
        // Update selector info on control.
        switch (style) {
        case STYLES_PULLDOWN:
            // Update selector info on widget.
            selectorCtrl.idx = $HASH.any(idx, true);

            // TODO: Should we do this elsewhere?
            // Is the selector unset?
            var selectorUnset = (typeof (selectorCtrl.idx) === 'undefined' || selectorCtrl.idx < 0);
            if (selectorUnset) {
                // TQMS 449351: render a blank(dummy) option if the idx is not defined.
                if ($ARR.find(elements, 'v', '-1') < 0) {
                    elements = [{
                        v: '-1',
                        n: ''
                    }].concat(elements);
                }
                selectorCtrl.idx = '0';
            }

            selectorCtrl.unset = !!selectorUnset;
            selectorCtrl.options = elements;
            break;

        case STYLES_METRIC_QUAL:
        case STYLES_METRIC_SLIDER:
            // Refresh the metric selector with new data
            if (selectorCtrl.updateData) {
                selectorCtrl.updateData({
                    low: data.min,
                    high: data.max,
                    cnt: data.cnt,
                    nov: data.nov
                }, {
                    cs: data.cs,
                    f: data.f,
                    ft: data.ft,
                    qua : data.qt
                });
            }

            selectorCtrl.items = elements;
            selectorCtrl.selectedIndices = idx;
            break;

        case STYLES_SEARCH_BOX:

		    if (elements && !defn.sos) {
				selectorCtrl.candidates = {
				    isComplete: true,
				    items: defn.srcid ? elements : []     
				};
		    }
		    if (defn.srcid) {
		        var ca = [];
		        if (data.ces.constructor === Array) {
		            ca = data.ces.concat();
		        }
		        selectorCtrl.items = selectorCtrl.initItems(ca);
		    }
            break;

        default:
            selectorCtrl.items = elements;
            selectorCtrl.selectedIndices = idx;
            break;
        }
    }

    /**
     * Returns a select control configuration to be used for instantiation.
     *
     * @param {mstrmojo.DocSelector} selectorContainer The DocSelector that will host this control.
     * @param {Integer} selectorStyle The style of control.
     * @param {Object} defn The defn node from the {@link mstrmojo.DocSelector}.
     * @param {Object[]} elements The selector elements.
     *
     * @returns Object
     * @private
     */
    function getSelectorCtrlConfig(selectorContainer, selectorStyle, defn, elements) {
        // Get scriptClass and default configuration.
        var isHoriz = defn.horiz,
            fmts = selectorContainer.getFormats(),
            height = fmts && fmts.height,
            copyProps = $HASH.copyProps,
            data = selectorContainer.node.data,
            cfg = {
                scriptClass: this.getSelectorClass(selectorStyle, isHoriz),
                multiSelect: defn.multi,
                isHoriz: isHoriz,
                include: defn.include,
                itemWidthMode: defn.iwm,
                allIdx: $ARR.find(elements, 'v', ALL_ID),
                noneIdx: defn.include ? -1 : $ARR.find(elements, 'v', ALL_ID),
                renderAllItems: !height,               // Turn off incremental rendering if we have a fit to content height.
                onchange: function () {
                    if (!selectorContainer._inSyncPhase) {
                        selectorContainer.selectorControlChange(this);
                    }
                }
            };

        // #485009 if All selector is in exclude mode than set the allIdx to -1 and use the noneIdx property to unselect all
        if (cfg.noneIdx !== -1) {
            cfg.allIdx = -1;
        }

        // Is this a scroller or metric slider?
        if (selectorStyle === STYLES_SCROLLER || selectorStyle === STYLES_METRIC_SLIDER) {
            // Override the text-align set inline on doc selector node with the 'extSlider' css class.
            selectorContainer.extCls = 'extSlider';

            if (defn.cek) {
                defn.include = defn.cek.include;
                data.cs = defn.cek.cs;
                data.f = defn.cek.f;
                data.ft = defn.cek.ft;
                selectorContainer.qua = defn.cek.qua;
            }

        }

        // Is this a scroller?
        if (selectorStyle === STYLES_SCROLLER) {

            // Add height and width from fmts.
            copyProps([ 'height', 'width' ], fmts, cfg);
            
		    if (selectorContainer.isInFilterPanel()) {
		    	cfg.width = selectorContainer.parent.parent.contentWidth;
		    }

        } else if (selectorStyle === STYLES_METRIC_QUAL || selectorStyle === STYLES_METRIC_SLIDER) {

            if (selectorStyle === STYLES_METRIC_SLIDER) {
                cfg.isHoriz = true;
                cfg.include = defn.include;
            }

            copyProps([ 'height', 'width', 'font' ], fmts, cfg);
            copyProps([ 'cs', 'ft' ], defn, cfg);
            cfg.fmts = defn.f;
            cfg.qua = selectorContainer.qua;
            cfg.numFmts = defn.numFmts;
            
		    if (selectorContainer.isInFilterPanel()) {
				cfg.width = selectorContainer.parent.parent.contentWidth;
		    }
        } else if (selectorStyle === STYLES_SEARCH_BOX) {

		    cfg = {
		    	scriptClass: cfg.scriptClass, 
				cssText: fmts.height ? 'height: ' + fmts.height : '',
		    	emptyText: mstrmojo.desc(4325, 'Search') + ' ' + defn.ttl,
				items: defn.srcid ? (data.ces ? data.ces.concat() : []) : [],   // only when it has source (metric and panel type are excluded), we make search box works
				REQUEST_THRESHOLD: 25, //TBD
				suggestCount: 20, //TBD
				srcid: defn.srcid || '',
				dsrc: defn.dsrc || '',
				onitemchange: function() {
								    if(!selectorContainer._inSyncPhase) {
										selectorContainer.selectorControlChange(this);
								    }
								}
				};

		    if (elements && !defn.sos) { //sos stands for "search on server"
				cfg.candidates = {
				    isComplete: true,
				    items:  defn.srcid ? elements : []                          
				};
		    } else {
				cfg.useKeyDelay = true;
				cfg.noCache = true;                                                              
		    }

		    if (!defn.multi) {
			//single select
				cfg.maxObjectCount = 1;
		    }
        }

        return cfg;
    }

    /**
     * <p>A factory for creating Report Services Document selector controls.</p>
     *
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.DocSelectorViewFactory = mstrmojo.declare(

        mstrmojo.Obj,

        null,

        /**
         * @lends mstrmojo.DocSelectorViewFactory.prototype
         */
        {
            scriptClass: 'mstrmojo.DocSelectorViewFactory',

            /**
             * Creates and initializes a pulldown style selector.
             *
             * @param {mstrmojo.DocSelector} selectorContainer The selector container to which the pulldown will be added.
             *
             * @returns mstrmojo.Widget
             */
            newPulldown: $FN,

            attachTargetListeners: $FN,

            getSelectorClass: function getSelectorClass(selectorStyle, isHoriz) {
                // Retrieve script class from widget map.
                var scriptClass = widgetMap[selectorStyle];

                // Is the script class an array?
                if (scriptClass.constructor === Array) {
                    // Orientation is a factor.
                    scriptClass = scriptClass[(isHoriz) ? 0 : 1];
                }

                return scriptClass;
            },

            isSelectorSupported: function isSelectorSupported() {
                // By default, all selectors are supported
                return true;
            },

            /**
             * <p>Creates, initializes and adds a panel selector to the selectorContainer.</p>
             *
             * @param {mstrmojo.DocSelector} selectorContainer The selector container to which the selector GUI will be added.
             */
            newSelector: function newSelector(selectorContainer) {
                var children = selectorContainer.children,
                    selectorCtrl = children && children[0],
                    selectorStyle = selectorContainer.style,
                    selectedIdx = selectorContainer.selIdx,
                    node = selectorContainer.node,
                    defn = node.defn,
                    data = node.data,
                    elements = data.elms,
                    elems;

                if (!this.isSelectorSupported(selectorContainer)) {
                    return null;
                }

                // Does this selector NOT already have a control?
                if (!selectorCtrl) {

                    // Does this selector still NOT have a control?
                    if (!selectorCtrl) {

                        var cekEvtListener = selectorContainer._cekEvtListener,
                            cekContextId = selectorContainer.id,
                            fnCEK;

                        // Do we already have a "CEK" event listener?
                        if (cekEvtListener) {
                            // Detach the old listener.
                            defn.detachEventListener(cekEvtListener);

                            // Remove listener handle.
                            delete selectorContainer._cekEvtListener;
                        }

                        // Is this a pulldown selector (different on every platform so there is no default implementation).
                        if (selectorStyle === STYLES_PULLDOWN) {
                            // Get control from application specific method.
                            selectorCtrl = this.newPulldown(selectorContainer);

                            // Create an event handler to update the selector control with "CEK" changes.
                            fnCEK = function (evt) {
                                // TQMS 484896: Get elements from control options in case the data changed after this control was created.
                                elems = this.options;

                                // TQMS 430786: make sure blank option selected if no option match current selection value.
                                if ($ARR.find(elems, 'v', evt.value) < 0) {
                                    if ($ARR.find(elems, 'v', '-1') < 0) {
                                        // add blank option, if does not exist
                                        elems.unshift({
                                            v: '-1',
                                            n: ''
                                        });
                                    }

                                    selectorCtrl.idx = '0';
                                    selectorCtrl.options = elems;
                                    selectorCtrl.unset = true;

                                    selectorContainer._inSyncPhase = true;
                                    selectorCtrl.refresh();
                                    selectorContainer._inSyncPhase = false;
                                } else {
                                    selectorCtrl.set('value', evt.value);

                                }
                            };

                            // Change context of fnCEK to selector control.
                            cekContextId = selectorCtrl.id;

                        } else {
                            // Get configuration for control.
                            var cfg = getSelectorCtrlConfig.call(this, selectorContainer, selectorStyle, defn, elements),
                                scriptClass = cfg.scriptClass;

                            // Does the configuration NOT have a scriptClass?
                            if (!scriptClass) {
                                // This selector is not supported so set selectorCtrl to a label.
                                selectorCtrl = new mstrmojo.Label({
                                    cssClass: 'unsupported',
                                    text: 'This selector is not supported.'
                                });

                            } else {
                                // Delete script class because it doesn't have the mstrmojo package in it so it will be invalid.
                                delete cfg.scriptClass;

                                // Walk mstrmojo package to find constructor.
                                var Clazz = $HASH.walk(scriptClass, mstrmojo);

                                // Instantiate widget.
                                selectorCtrl = new Clazz(cfg);

                                // Is this a slider style?
                                if (selectorStyle === STYLES_METRIC_SLIDER) {
                                    // Attach event listener to selector container to hear when the "include" value changes.
                                    selectorContainer.attachEventListener('includeChange', selectorCtrl.id, function (evt) {
                                        // Change local include value.
                                        this.set('include', evt.value);

                                        // Select range.
                                        this.selectRange();
                                    });
                                }

                                // Is this a slider or a metric qualification?
                                if (selectorStyle === STYLES_METRIC_SLIDER || selectorStyle === STYLES_METRIC_QUAL) {
                                    // Attach event listener to selector container to hear when the "qua" value changes.
                                    selectorContainer.attachEventListener('quaChange', selectorCtrl.id, function (evt) {
                                        // Change selector control "qua" value.
                                        this.set('qua', evt.value);
                                    });

                                    // Create an event handler to update the selector control with "CEK" changes.
                                    fnCEK = function (evt) {
                                        // TQMS 467964: update metric sliders/qualifications of other group by elements
                                        if (selectorContainer.id !== evt.value.id) {  // preventing refresh the changed selector itself
                                            selectorContainer._inSyncPhase = true;

                                            selectorContainer.updateExpr(evt.value);

                                            if (selectorContainer.style === STYLES_METRIC_SLIDER) {
                                                selectorContainer.set('include', evt.value.include);
                                            }

                                            selectorContainer._inSyncPhase = false;
                                        }
                                    };

                                } else {

                                    // Create an event handler to update the selector control with "CEK" changes.
                                    fnCEK = function (evt) {
                                        var idxs = [];
                                        // TQMS 484896: Get elements from data node in case they change after this control was created.
                                        elems = this.node.data.elms;

                                        // Iterate selected values.
                                        $ARR.forEach(evt.value, function (v) {
                                            var idx = $ARR.find(elems, 'v', v);
                                            if (idx > -1) {
                                                idxs.push(idx);
                                            }
                                        });

                                        this._inSyncPhase = true;
                                        selectorCtrl.select(idxs);
                                        this._inSyncPhase = false;
                                    };
                                }
                            }
                        }

                        // Did we create an event handler for "CEK" change events?
                        if (fnCEK) {
                            // Attach event handler.
                            selectorContainer._cekEvtListener = defn.attachEventListener('cekChange', cekContextId, fnCEK);
                        }
                    }

                    // Add selector control as a child of the selectorContainer.
                    selectorContainer.addChildren(selectorCtrl);
                }

                // Update selector info on control (use style from selectorContainer in case it was changed).
                updateSelectorControl(selectorCtrl, selectorContainer.style, data, defn, selectedIdx, elements);

                return selectorCtrl;
            },

            updateControlStyles: $FN

        }
    );

    var factory = mstrmojo.DocSelectorViewFactory;

    // Store local constants as static field on DocSelectorViewFactory.
    factory.STYLES = {
        PULLDOWN: STYLES_PULLDOWN,
        SCROLLER: STYLES_SCROLLER,
        LIST: STYLES_LIST,
        RADIO: STYLES_RADIO,
        CHECKBOX: STYLES_CHECKBOX,
        BUTTON: STYLES_BUTTON,
        LINK: STYLES_LINK,
        METRIC_SLIDER: STYLES_METRIC_SLIDER,
        METRIC_QUAL: STYLES_METRIC_QUAL,
        SEARCH_BOX: STYLES_SEARCH_BOX
        
    };

    factory.ELEM_ALL = ALL_ID;

    factory.UC_ON_DS = _ST_UC_ON_DS;

}());