(function(){

    mstrmojo.requiresCls("mstrmojo.Container",
        "mstrmojo._Formattable",
                         "mstrmojo.DocSelectorViewFactory",
                         "mstrmojo.css",
                         "mstrmojo.dom",
                         "mstrmojo.hash",
                         "mstrmojo.array",
                         "mstrmojo._IsSelectorTarget",
"mstrmojo.elementHelper");

    var $ARR = mstrmojo.array,
        $HASH = mstrmojo.hash,
        STYLES = mstrmojo.DocSelectorViewFactory.STYLES,
        ELEM_ALL_ID = mstrmojo.DocSelectorViewFactory.ELEM_ALL,
 _H = mstrmojo.hash,
        _EH = mstrmojo.elementHelper;

    var _ST_UC_ON_DS = mstrmojo.DocSelectorViewFactory.UC_ON_DS;

    /**
     * Create an Event populated with information that is common to all actions.
     *
     * @private
     * @returns Object
     */
    function getEvent() {
        return {
            type: parseInt(this.type, 10),
            src: this.k,
            ck: this.ck,
            ctlKey: this.ckey,      // Control key.
            tks: this.tks,
            include: this.include,
                    disablePU: (this.defn.subTp == _ST_UC_ON_DS) ? true : false  // don't do partial update for UC on dataset selector
        };
    }

    /**
     * <p>A widget for Report Services Selector Controls.</p>
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.DocSelector = mstrmojo.declare(

        mstrmojo.Container,
        

        [mstrmojo._Formattable, mstrmojo._IsSelectorTarget],
        
        /**
         * @lends mstrmojo.DocSelector.prototype
         */
        {
            scriptClass: 'mstrmojo.DocSelector',
            
            markupString: '<div id="{@id}" class="mstrmojo-DocSelector {@extCls}" title="{@tooltip}" style="{@domNodeCssText}">' +
                                '<div class="filter" style="{@filterNodeCssText}"></div>' +
                                '<div class="wait" style="display:none;z-index:100; position:absolute; top:0px; left:0px; width:100%; height:100%"></div>' +
                                '<div class="content" style="{@contentNodeCssText}"></div>' +
                    '</div>',
            
            markupSlots: {
                filterNode: function(){ return this.domNode.firstChild; },
                contentNode: function(){ return this.domNode.lastChild; },
                dimNode: function () { return this.domNode.lastChild; },           // This nodes contains the dimension information, sub section needs this information to perform auto shrink/grow.
                containerNode: function(){ return this.domNode.lastChild; },
                scrollboxNode: function(){ return this.domNode.lastChild; },
                wIconNode: function(){ return this.domNode.childNodes[1]; }
            },

            markupMethods: {
                onincludeChange: function () { mstrmojo.css.toggleClass(this.domNode, 'strikeout', !this.include); },
                onvisibleChange: function () { this.domNode.style.display = ((this.visible) ? this.cssDisplay : 'none'); },
                onwaitChange: function () { this.wIconNode.style.display = ((this.wait) ? 'block' : 'none'); }
            },

            /**
             * @see mstrmojo._Formattable
             * @ignore
             */
            formatHandlers: {
                domNode: [ 'F', 'text-align', 'vertical-align', 'line-height', 'z-index', 'top', 'left' ],
                contentNode: [ 'width', 'B', 'P' ],
                filterNode: [ 'height', 'width', 'B', 'P', 'fx', 'background-color' ],
                item: [ 'color', 'font', 'text-decoration', 'text-align', 'line-height' ]
            },

            /**
             * Control key. 
             */                
             ckey: null,
             
            /**
            * <p>Control key context.</p>
            *
            * <p>This is essentially the control key + some more information needed by event handler so that when we send the selector event, it does not need to load the RWdefinition
            * before submitting the event.</p>
            */                
            ck: null,

            /**
            * <p>This is the list of keys for the targets that the the selector controls.</p>
            *
            * @type String
            *
            * @refactoring This is currently a delimited string. Pretty much like control key context, we should just need to pass this string back as it is.
            * if we do need to parse it, we should change the block definition to have this list come as an array instead. 
            */                
            tks: null,
            
            /**
            * <p>Control Style.</p>
            *
            * @type Integer
            *
            * @refactoring Not of much use right now.
            */
            style: 0,
                            
            /**
            * <p>Selected Element Index.</p>
            *
            * <p>Since the list of available elements and current elements comes disconnected (todo0 - ), we will figure and store the selected element index on the instance.</p>
            */
            selIdx: null,
            
            /**
             * Extra css class apply to this doc selector node.
             * For slider, text align in doc selector node can cause trouble. 
             * We are seeing issue with IE, when text-align is right, it will push slider to the right.
             * For slider, we will insert an extra css class here and in that css rule, we will override the text-align
             */
            extCls: '',

            /**
             * indicate whether we have already fetch the element list for UC on dataset selector
             */
            bGetElems: false, 
            
            /**
             * Overridden to set a property (spm) to indicate whether the Selector Style supports popup menu.
             *
             * @see mstrmojo.Model
             * @ignore
             */
            init: function init(props) {
                this._super(props);

                // Only Attribute Element Selector (type 1) is supported
                // Scroller Selector (style type 1) is not supported
                var s = this.node.defn.style;
                this.spm = (s === STYLES.METRIC_QUAL || s === STYLES.METRIC_SLIDER);
            },
            
            /**
             * Initializes instance variables.
             *
             */
            initControlInfo:function initControlInfo() {

                var node = this.node,
                    data = node.data,
                    defn = node.defn,
                    elements = data.elms,
                    currentSelections = data.ces,
                    style = defn.style;

                // Create array of names of propertie that need to be copied from definition node to instance.
                var defnProps = [ 'include', 'ckey', 'ck', 'tks', 'style', 'multi' ];

                // For UC on dataset selector, 
                // if the elem list is empty, we have to fetch its element list by a separate task call,
                // but for seach box selector, we will postpone the element browsing until user input something.
                if (!this.bGetElems && defn.subTp == _ST_UC_ON_DS && 
                		defn.style != STYLES.SEARCH_BOX) {          
                     this._fetchAllElems();
                     es = n.elms; //reset the local es variable, necessary
                }

                // Is this a metric slider?
                if (style === STYLES.METRIC_QUAL || style === STYLES.METRIC_SLIDER) {
                    // Add definition properties.
                    defnProps = defnProps.concat([ 'srcid', 'srct' ]);

                    // Add qua and dt
                    this.qua = data.qt;
                    this.dt = data.dt;
                }

                // Add type property from definition.
                this.type = defn.ct;

                // Does the definition have a format node?
                var fmts = defn.fmts;
                if (fmts) {
                    var w = fmts.width;
                    if (!w || parseInt(w, 10) <= 0) {
                        // TQMS 501246: Set default value for IVE compatibility.
                        fmts.width = '95px';
                    }
                }

                // Copy definition properties to instance.
                $HASH.copyProps(defnProps, defn, this);

                // Initialize this instance's selected element index array.
                var selectedIndices = this.selIdx = {},
                    multi = defn.multi;

                // 512275 - Removed this code because we should respect the selection value we get from the server. Not deleting it in case
                // we find a case which needs this.
//                // Do we have cek?
//                if (cek) {
//                    if (multi && $ARR.indexOf(cek, ELEM_ALL_ID) > -1) {
//                        $ARR.forEach(elements, function (el, idx) {
//                            selectedIndices[idx] = true;
//                        });
//
//                    } else if (style === STYLES.PULLDOWN) {
//                        ind = $ARR.find(elements, 'v', cek);
//                        if (ind >= 0) {
//                            selectedIndices[ind] = true;
//                        }
//
//                    } else {
//                        $ARR.forEach(cek, function (cekItem) {
//                            ind = $ARR.find(elements, 'v', cekItem);
//                            if (ind >= 0) {
//                                selectedIndices[ind] = true;
//                            }
//                        });
//                    }
//
//                } else {

                // Look for the presence of the (ALL) element in the current selection.if original selection include (ALL), then current selection is the whole available
                if (this.include && multi && $ARR.find(currentSelections, 'v', ELEM_ALL_ID) > -1) {
                    // If found the current selection should be all available elements.
                    currentSelections = elements;
                }

                // Do we have current selections?
                if (currentSelections) {
                    // Iterate elements.
                    $ARR.forEach(elements, function (el, idx) {
                        // Is this element selected?
                        if ($ARR.find(currentSelections, 'v', el.v) >= 0) {
                            // Add to selected indices.
                            selectedIndices[idx] = true;
                        }
                    });
                }
//                }
            },

            /**
             * <p>Resets the format handlers to the bare minimum needed for an RW unit.</p>
             *
             * <p>This method is intended for situations where the child selector will handle all formatting.</p>
             */
            resetFormatHandlers: function resetFormatHandlers() {
                this.formatHandlers = {
                    contentNode: [ 'RW' ]
                };
            },

            /**
             * This method is called when the
             *
             * @param {String|mstrmojo.Widget} value Either the element ID (for pulldowns) or the widget itself (all others).
             *
             */
            selectorControlChange: function selectorControlChange(widget) {
                // Get generic event.
                var rEvt = getEvent.call(this),
                    model = this.model,
                    elementSeparator = '\u001E';

                switch (this.style) {
                case STYLES.PULLDOWN:
                    var value = widget.value;
                    n = null;

					if (widget.selectNode) {
					    var sn = widget.selectNode;
					    n = sn.options[sn.selectedIndex].text;
					}


                    // Add element ID.
                    rEvt.eid = value;
	                if (rEvt.type == 1) {
	                    rEvt.eid = rEvt.eid + (n != null ? (';' + n) : '');   // Element ID, Append "display name" if it has
	                }
                    // Set cek in definition.
                    this.defn.set('cek', value);

                    // Remember the current selected value.
                    this.currSelValue = value;


	                if (this.isInFilterPanel()) {
		                // If the selector is inside the FilterPanel, then add element count on the Portlet title              
	                    this.parent.set('count', _EH.buildElemsCountStr([value], this.node.data.elms));
	                }

                    break;
                case STYLES.SEARCH_BOX:

	                if(widget.getSelectedObjects) {
						var items = widget.getSelectedObjects(),
						    elementIDs = [];
	
	                    if(items && items.length >0){
	                        for (var i in items) {
	                            var item = items[i];
	                            //if (item.state === 0) { //VALID
	                                elementIDs.push(item.v + ';' + item.n);
	                            //}
	                        }        
	                        rEvt.eid = elementIDs.join(elementSeparator);
	                    } else {
	                        rEvt.unset = true;
	                    }  
	                }
                break;
                case STYLES.METRIC_QUAL:
                case STYLES.METRIC_SLIDER:
                    var cs = [];

                    // Iterate widget 'cs' array.
                    $ARR.forEach(widget.cs, function (item) {
                        // Add 'v' property to local cs array.
                        cs.push(item.v);

                        if (rEvt.dtp === undefined) {
                            rEvt.dtp = item.dtp;
                        }
                    });

                    // Did we find any cs values?
                    if (cs.length) {
                        // Add to event.
                        rEvt.cs = cs.join(elementSeparator);
                    }

                    // Copy new function info to event and widget.
                    var fInfo = mstrmojo.MCSUtil.getFuncInfo(widget.opId, widget.qua);
                    rEvt.f = widget.f = fInfo.f;
                    rEvt.ft = widget.ft = fInfo.ft;

                    // Copy include to event and widget.
                    rEvt.include = widget.include = this.include;

                    // Add props to event.
                rEvt.ckey = this.ckey;
                rEvt.srcid = this.srcid;
                rEvt.srct = this.srct;

                    rEvt.unset = widget.unSet;
                    rEvt.onlyInclude = widget.onlyInclude;
                    rEvt.changeQual = widget.changeQual;
                    rEvt.qt = widget.qua;

                    // TQMS 467964: Synchronize the other selectors with the same definition (groupby).
                    this.node.defn.set("cek", {
                  id: this.id,
                        f: widget.f,
                        ft: widget.ft,
                        cs: widget.cs,
                        qua: widget.qua,
                        include: widget.include
                    });
                    break;

                default:
                    var node = this.node,
                        elements = node.data.elms,
                        indices = widget.selectedIndices,
                        allIdx = widget.allIdx,
                        isAll = !!indices[allIdx],
                        elementIDs = [],
eidts = [],     // element id with display text
                        inc = this.include;

                    // Is the ALL case present in the indices?
                    if (isAll) {
                        // Elements should be an array with single ALL element.
                        elementIDs = [ elements[allIdx].v ];
eidts = [ elements[allIdx].v ];

                    } else {
                        if (indices[allIdx]) {
                            indices[allIdx] = false;
                        }
                        
                        //#555555  - make the selectedIndices in the same order as in the elements List inspite of the order of selection action
                        var keyArr = $HASH.keyarray(indices, true).sort($ARR.numSorter),
                            sortedIndices  = {};
                        for (var i in keyArr) {
                            sortedIndices[keyArr[i]] = indices[keyArr[i]];
                        }
                        indices = sortedIndices;

                        // Iterate indices.
                        $HASH.forEach(indices, function (item, idx) {
                            // Is this index selected?
                            if (item) {
                                // Add element.
                                elementIDs.push(elements[idx].v);
eidts.push(elements[idx].v + ';' + elements[idx].n);
                            }
                        });
                    }

	                    // Add element IDs to event.
	                if (rEvt.type == 1) {   //element list, we need to append the display name
		       			rEvt.eid = eidts.join(elementSeparator);
	                } else {
	                    rEvt.eid = elementIDs.join(elementSeparator);
	                }

                    // TQMS 450995: Get the position of the selector, used for info window.
                    var pos = mstrmojo.dom.position(widget.domNode, true);
                    if (pos) {
                        // Add left and top positions to event.
                        rEvt.left = pos.x;
                        rEvt.top = pos.y;
                    }

                    // Is this the all case and multi select?
                    if (isAll && this.multi && inc) {
                        // Iterate elements.
                        $ARR.forEach(elements, function (elem) {
                            var v = elem.v;

                            // Is this not the ALL element?
                            if (elementIDs[0] !== v) {
                                // Add the element to the collection of ID's.
                                elementIDs.push(v);
                            }
                        });
                    }

                    // Set "cek" value.
                    node.defn.set('cek', elementIDs);

	                if (this.isInFilterPanel()) {
		                // If the selector is inside the FilterPanel, then add element count on the Portlet title
	                    this.parent.set('count', _EH.buildElemsCountStr(elementIDs, elements));
	                
	                }
                    break;
                }

                // Submit event to model for slicing within a timeout so the UI can update with the latest selector state.
                var me = this;
                window.setTimeout(function () {
                    me.slice(rEvt);
                }, 0);
            },

            /**
             * Setup the control info properties, style widget before rendering. 
             */
            preBuildRendering: function preBuildRendering() {
                var ret = true,
                    style = this.node.defn.style,
                    formatHandlers = $HASH.clone(this.formatHandlers),
                    contentNodeHandler = formatHandlers.contentNode;

                // For checkbox and radio buttons, when the filter in on content itself, IE can display much nicer shadow.
                // So, we remove filterNode from formatHandlers and add 'fx' and 'background-color' into contentNode.
                // But for other types of selector, they either need scroll bar or need overflow:visible for the overflow pointers.
                // So, for those types, we can not move the filter info into contentNode.
                if (contentNodeHandler) {
                    if ((style === STYLES.RADIO || style === STYLES.CHECKBOX) && formatHandlers.filterNode) {
                        contentNodeHandler.push('fx');
                        contentNodeHandler.push('background-color');

                        delete formatHandlers.filterNode;
                    }

                    if (style === STYLES.LIST) {
                        delete contentNodeHandler.height;
                    }
                    
                    if (style === STYLES.SEARCH_BOX) {
                        //Delete some formats from dom node for search box seletor
                        var domHandler = formatHandlers.domNode;
                        
                        $ARR.removeItem(domHandler, 'color');
                        
                        var idx = $ARR.indexOf(domHandler, 'F');
                        if (idx > -1) {                                
                            $ARR.removeIndices(domHandler, idx, 1);
                            domHandler.push('font');
                        }
                    }
                }

                // Store modified format handlers back on selector.
                this.formatHandlers = formatHandlers;

                // Call the super.
                ret = this._super();

                // Update selector styles after prebuild rendering.
                this.builder.selectorFactory.updateControlStyles(this);

                return ret;
            },

            /**
             * Overrides parent class implementation to take care of fit to content widget for filter node.
             * 
             * @ignore
             */
            postBuildRendering: function postBuildRendering() {
                var style = this.node.defn.style,
                    filterNodeStyle = this.filterNode.style,
                    contentNode = this.contentNode
                    defn = this.node.defn,
                    data = this.node.data,
                    sty = defn.style;

                this._super();

                if (this.formatHandlers.filterNode) {
                    // If this widget does not have fixed width/height, we need to fix filter node to match content node's width/height
                    var f = this.getFormats();

                    if (!f.width){
                        filterNodeStyle.width = contentNode.clientWidth + 'px';
                    }

                    if (!f.height) {
                        filterNodeStyle.height = contentNode.clientHeight + 'px';
                        if (style === STYLES.METRIC_QUAL || style === STYLES.METRIC_SLIDER) {
                            this.updateHeight();
                        }
                    } else {
                    	// TQMS 521125: if height is fixed, need to set it on the content node too.
                    	if (style === STYLES.METRIC_QUAL) {
                    		contentNode.style.height = f.height;
                    	}
                    }

                } else {
                    // If filterNode is not part of the formatHandlers, then we must have merged it into contentNode so we need to hide the filter node.
                    filterNodeStyle.display = 'none';
                }
                
                if (this.isInFilterPanel()) {
                    this.contentNode.style.width = this.parent.parent.contentWidth + 'px';
                    if (this.formatHandlers.filterNode) {
                        this.filterNode.style.width = this.parent.parent.contentWidth + 'px';
                    }
                    this.set('visible', defn.ds == 0); //expanded status
                }               
                
                //Listen to the changes to control group by map from the server, due to a manipulation. 
                this.model.attachEventListener('CGBMapChange', this.id, 'onCGBMapChange');
                
                // Pass instance to selectorFactory to attach any target event listeners.
                this.builder.selectorFactory.attachTargetListeners(this);

                return true;
            },
            
            _fetchAllElems: function _fetchAllElems() {
                var defn = this.node.defn,
                    data = this.node.data;
                
                var taskParams = {
                        taskId: 'browseElements',
                        styleName: 'MojoAttributeStyle',
                        attributeID: defn.srcid || '',
                        dataSourcesXML: defn.dsrc || '',
                        browseFlags: 1
                };
                
                var me = this;
                var callbacks = {
                    success: function (res) {
                        me.bGetElems = true;
                        me.set('wait', false);
                        
                        if (res && res.es) {
                            if (defn.srcid) {
                                data.elms = _EH.buildElemsTerseID(res.es, defn.srcid, true);
                            } else {
                                data.elms = res.es;
                            }
                            

                            if (data.ces && data.elms && data.elms.length > 0) {
                                me.parent.set('count', _EH.buildElemsCountStr(data.ces, data.elms));
                            }
                            
                            if (me.hasRendered) {
                                me.refresh();
                                if (me.isInFilterPanel()) {
                                    if (me.parent && ('ttl' in me.parent.defn)){//DocPortlet
                                        me.parent.updateContentHeight();
                                    }
                                    if (me.parent.parent.refreshFP) {   // DocPanel
                                        me.parent.parent.refreshFP();
                                    }
                                }
                            }
                        }
                    },
                    failure: function (res) {
                        mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                    }                    
                };
                
                this.set('wait', true);
                mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams, false, null, true/*use cache*/);                
            },
            
            //Some styles need to add their height into container after rendered.
            updateHeight: function updateHeight() {
                this.contentNode.style.height = this.filterNode.style.height = this.content.getClientHeight() + 'px';

                var parent = this.parent;
                if (parent && (parent.defn.ttl !== undefined)) {  // DocPortlet
                    parent.updateContentHeight();
                }
            },
            
            /**
             * Updates its 'tks' property based on the the updated values received from the webserver.
             * 
             * @param {Object} The evt object that consists of the cgbMap property
             */
            onCGBMapChange: function onCGBMapChange(evt) {
                //Return if we don't have new values
                var cgbMap = evt.cgbMap;
                if (!cgbMap) {
                    return;
                }

                // Get list of target keys.
                var tks = this.tks;

                // Iterate control group bys.
                $HASH.forEach(this.defn.cgb, function (key) {
                    // Was this group by targeted?
                    var targetKey = cgbMap[key];
                    if (targetKey && tks.indexOf(targetKey) < 0) {
                        // Add the target key.
                        tks += '\u001E' + targetKey;
                    }
                });

                // Store new tks back on instance.
                this.tks = tks;
            },
            
            /**
             * Updates the DocSelector data that may change due to a selector action.
             * 
             * @param {Object} node The widget node.
             */
            update: function update(node) {
                this.node = node;
                
                var defn = this.node.defn,
                    style = defn.style,
                    elements = this.node.data.elms,
                    arrutil = mstrmojo.array,
                    p = this.parent;
                
                // adjust (ALL) for multi version slider. 
                if (style === STYLES.SCROLLER && defn.multi) {
                    // for multi version slider, we are not going to include (ALL) as available
                    var allIdx = $ARR.find(elements, 'v', ELEM_ALL_ID);
                    if (allIdx > -1) {
                        $ARR.removeIndices(elements, allIdx, 1);
                    }
                }
                // update the element count on the title bar
                // For search box selector, if it search on sever, we don't set element count 
                if (defn.iifp && !defn.sos) { 
                    var ces = this.node.data.ces;
                    if (p && p.count && // contained in a portlet
                    		ces && elements && elements.length > 0) {
                        me.parent.set('count', _EH.buildElemsCountStr(data.ces, elements));
                    }
                }

                // Set up the control information on the instance.
                this.initControlInfo();

                // Get selector widget.
                var widget = this.content = this.builder.selectorFactory.newSelector(this);

                // Did we NOT get back a widget?
                if (!widget) {
                    // Set visible to false.
                    this.set('visible', false);
                }
            },

            /**
             * Update DocSelector's target widget data when toggling 'include/exclude'.
             * 
             * @param {Object} The evt object that consists of the include property
             */
            onincludeChange: function onincludeChange(evt) {
                this.node.defn.include = this.include = evt.value;

                if (this.style !== STYLES.METRIC_SLIDER) {
                    this.include = evt.value;

                    // Update the target widgets
                    var rEvt = getEvent.call(this);
                    rEvt.ckey = this.ckey;
                    this.slice(rEvt);
                }
            },
            
            /**
             * Submit the slice event through doc model or if it is inside a filter panel and 
             * the autoApply is false, buffer the event.
             */
            slice: function(rEvt){
                var m = this.model;
                if(this.isInFilterPanel()){
                    var fp = this.getFilterPanel();
                    if(fp && !fp.defn.cas){  //ctl auto submit, if it is set to false, we buffer the user action
                        fp.bufferSlice(rEvt);
                        return;
                    } 
                } 
                
                m.slice(rEvt);    
            },
            
            onquaChange: function onquaChange(evt) {
                this.node.data.qt = evt.value;
            },
            
            isInFilterPanel: function() {
            	  var parent = this.parent;
                  return (parent && parent.isInFilterPanel && parent.isInFilterPanel()) || false;
            },
            
            getFilterPanel: function(){
            	var parent = this.parent;
                return (parent && parent.getFilterPanel && parent.getFilterPanel()) || null;
            }
            
        }
    );

    // Is this not an IE browser?
    if (!mstrmojo.dom.isIE) {
        // Move the filterNode formatHandlers to the content node and delete filterNode handlers.
        var formatHandlers = mstrmojo.DocSelector.prototype.formatHandlers;
        formatHandlers.contentNode = formatHandlers.filterNode;
        delete formatHandlers.filterNode;
    }

}());