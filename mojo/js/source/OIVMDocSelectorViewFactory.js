(function(){

    mstrmojo.requiresCls("mstrmojo.DocSelectorViewFactory",
                         "mstrmojo.RadioList",
                         "mstrmojo.CheckList",
                         "mstrmojo.ListBoxHoriz",
                         "mstrmojo.ListBoxSelector",
                         "mstrmojo.LinkList",
                         "mstrmojo.ButtonList",
                         "mstrmojo.DropDownList",
                         "mstrmojo.Slider");
    
    var STYLES = mstrmojo.DocSelectorViewFactory.STYLES;
    
    /**
     * JavaScript widget class names for different selector types.
     * 
     * @const
     * @private
     */ 
    var widgetMap = {};
    widgetMap[STYLES.RADIO] = [ 'RadioListHoriz', 'RadioList' ];
    widgetMap[STYLES.CHECKBOX] = [ 'CheckListHoriz', 'CheckList' ];
    widgetMap[STYLES.LIST] = [ 'ListBoxHoriz', 'ListBoxSelector' ];
    widgetMap[STYLES.LINK] = [ 'LinkListHoriz', 'LinkList' ];
    widgetMap[STYLES.BUTTON] = [ 'ButtonListHoriz','ButtonList' ];
    widgetMap[STYLES.SCROLLER] = 'Slider' ;
    widgetMap[STYLES.METRIC_SLIDER] = 'MetricSlider' ;
    widgetMap[STYLES.METRIC_QUAL] = 'MetricQualification' ;
    widgetMap[STYLES.SEARCH_BOX] = 'SearchBoxSelector' ;
    
    /**
     * <p>A factory for creating Report Services Document selector controls for Express mode.</p>
     * 
     * @class
     * @extends mstrmojo.DocSelectorViewFactory
     */
    mstrmojo.OIVMDocSelectorViewFactory = mstrmojo.declare(

        mstrmojo.DocSelectorViewFactory,

        null,

        /**
         * @lends mstrmojo.OIVMDocSelectorViewFactory.prototype
         */
        {
            scriptClass: 'mstrmojo.OIVMDocSelectorViewFactory',
            
            /**
             * Creates, initializes and adds a pulldown style selector to the selectorContainer.
             * 
             * @param {mstrmojo.DocSelector} selectorContainer The selector container to which the pulldown will be added.
             * 
             * @returns mstrmojo.Widget
             */
            newPulldown: function newPulldown(selectorContainer) {
                return new mstrmojo.DropDownList({
                    k: selectorContainer.ck,
                    cssDisplay: 'block',
                    cssClass: 'mstrmojo-DocSelector-DropDownList',
                    selectCssClass: 'mstrmojo-DocSelector-DropDownList-select',       // Needed so the DropDownList will be 100% width.
                    onvalueChange: function () {
                        // Is the selector NOT synchronizing?
                        if (!selectorContainer._inSyncPhase) {
                            // Tell the selector we've changed the value.
                            selectorContainer.selectorControlChange(this);
                        }
                    }
                });
            },
            
            updateControlStyles: function updateControlStyles(selectorContainer) {
                var selectorStyle = selectorContainer.style,
                    ctrl = selectorContainer.children[0],
                    node = selectorContainer.node,
                    defn = node.defn,
                    isHoriz = defn.horiz,
                    fmts = selectorContainer.getFormats(),
                    color, height, backgroundColor;
                
                // Is height mode fixed and is this selector NOT a slider?
                if (defn.hm === 0 && selectorStyle !== STYLES.SCROLLER) {
                    // Adjust the overflow of the DOM node.  The overflow-y is hidden for vertical orientation, and overlow-x for horizontal orientation.
                    selectorContainer.contentNodeCssText += 'overflow-' + ((isHoriz) ? 'x' : 'y') + ':hidden;';
                }
                
                // Do we have formats?
                if (fmts) {
                    // Retrieve formatting values.
                    ctrl.color = color = fmts.color;
                    height = fmts.height;
                    backgroundColor = fmts['background-color'];
                }
                
                // Is the selector a pulldown?
                if (selectorStyle === STYLES.PULLDOWN) {
                    // Do we have formats?
                    if (fmts) {
                        // Do we have color?
                        if (color) {
                            // Update item css text with color.
                            selectorContainer.itemCssText += 'color:' + color + ';';
                        }                    
                        
                        // TQMS 521125: Don't set height on PULLDOWN style
                        // Do we have a height?
                        /*if (height) {
                            // Update item css text with height.
                            selectorContainer.itemCssText += 'height:' + height + ';';
                        }*/
                    }
                    
                    ctrl.cssText = selectorContainer.itemCssText;
                    
                } else {
                    
                    ctrl.cellCssClass = '';
                    ctrl.tableCssText = 'table-layout:' + ((defn.iwm === 0) ? 'fixed' : 'auto') + ';';         // Item Width Mode.
                    
                    // TQMS 521125: Don't set height on METRIC_QUAL style
                    if(selectorStyle === STYLES.METRIC_QUAL) {
                    	ctrl.cssText = '';
                    } else if (height !== undefined) {
                        ctrl.cssText = 'height:' + height + ';';
                    }
                    
                    if (selectorStyle === STYLES.LIST && backgroundColor) {
                        ctrl.cssText += 'background-color:' + backgroundColor + ';';
                    }
                    
                    switch (selectorStyle) {
                        case STYLES.RADIO:
                        case STYLES.CHECKBOX:
                            ctrl.labelCssText = selectorContainer.itemCssText;
                            break;
                            
                        case STYLES.BUTTON:
                        case STYLES.LINK:
                        case STYLES.LIST:
                            
                            if (selectorStyle === STYLES.BUTTON) {
                                // In IE, link list and button list having trouble to inherit color from <td> to <input>
                                // pass color down to <input>
                                if (color) {
                                    selectorContainer.itemCssText += 'color:' + color + ';';
                                }
                            }
                            
                            // Is this a horizontal selector?
                            if (isHoriz) {
                                // Need to fix height for horizontal case so the button will fill the whole area.
                                selectorContainer.itemCssText += 'height:' + height + ';';
                            }
                            
                            ctrl.itemCssText = selectorContainer.itemCssText;
                            
                            // This is actually only used by link bar for now for its calculating the hover/selected colors.
                            selectorContainer['background-color'] = backgroundColor;
                            break;
                    }
                    
                    this._super(selectorContainer);
                } 
            },            
            
            getSelectorClass: function getSelectorClass(selectorStyle, isHoriz) {
                // Retrieve script class from widget map.
                var scriptClass = widgetMap[selectorStyle];
                
                // Do we handle this style in this factory?
                if (scriptClass) {
                    // Is the script class an array?
                    if (scriptClass.constructor === Array) {
                        // Orientation is a factor.
                        scriptClass = scriptClass[(isHoriz) ? 0 : 1];
                    }
                    
                    return scriptClass;
                } else {
                    return this._super(selectorStyle, isHoriz);
                }
            }
        }
    );

}());