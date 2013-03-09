/**
 * Singleton for adjusting layout configurations for consumers of the _HasLayout mixin based on DPI.
 * 
 * @public
 */
mstrmojo.DPIManager = {

    /**
     * Collection of constructors to be modified.
     * 
     * @private
     */
    classes: [],
    
    /**
     * Registers a class that should be updated for DPI settings.
     * 
     * @param {mstrmojo.Widget} clz The widget constructor to be modified.
     * @param {String} dimension The layout dimension to modify (h for height, w for width).
     * @param {String} slot The slot to modify.
     * @param {Integer} lowDPI The unit less value to use for low DPI devices. 
     * @param {Integer} highDPI The unit less value to use for high DPI devices. 
     */
    registerClass: function registerClass(clz, dimension, slot, lowDPI, highDPI) {
        // Add this class to the classes collection.
        this.classes.push({
            c: clz,
            d: dimension,
            s: slot,
            l: lowDPI + 'px',
            h: highDPI + 'px'
        });
    },

    /**
     * Modifies previously registered classes.
     */
    setDPI: function () {
        // Get device DPI.
        var dpi = mstrMobileApp.getDeviceDPI();
        
        // Iterate registered classes.
        mstrmojo.array.forEach(this.classes, function (clz) {
            // Get dimension layout, slot and current value.
            var layout = clz.c.prototype.layoutConfig[clz.d],
                slot = clz.s,
                value = layout[slot];
            
            // Is this a LOW dpi device?
            if (dpi < 160) {
                // Use low value.
                value = clz.l;
                
            // Else, is this a HIGH dpi device?
            } else if (dpi > 240) {
                // Use high value.
                value = clz.h;
            }
            
            // Store modified value back onto layout config.
            layout[slot] = value;
        });
        
        // Reset collection of classes.
        this.classes = [];
    }
};
    
(function () {
    
    /**
     * <p>Calculates and returns the new height (or width) for the child.</p>
     * 
     * <p>NOTE: Children in auto slots and percentage slots (if onlyPercentageSlots == true) will return the value from their height or width property.</p>
     * 
     * @param {mstrmojo.Widget} child The child whose dimension should be calculated.
     * @param {String} dimension The dimension to calculate, either 'h' or 'w'.
     * @param {Boolean} onlyPercentageSlots True if the dimensions should be calculated for only percentage slots.
     * 
     * @return String The value for the indicated dimension (in pixels or 'auto').
     */
    function calcChildDimension(child, dimension, onlyPercentageSlots) {
        var dim = this._layoutWidgets[dimension], 
            slot = child.slot,
            fixedSlots = dim.f,
            percentageSlots = dim.p,
            isFixed = (fixedSlots && fixedSlots[slot] !== undefined),
            isPercent = (percentageSlots && percentageSlots[slot] !== undefined);
        
        // Does this child have a fixed or percentage slot, or only a percentage slot if onlyPercentageSlot is true?
        if (slot && ((!onlyPercentageSlots && isFixed) || isPercent)) {
            // Return the calculated size of this widget (either fixed or a percentage of the available height).
            return (isFixed) ? fixedSlots[slot] : (dim.x * parseInt(percentageSlots[slot], 10) / 100) + 'px';
        } else {
            return child[(dimension === 'h') ? 'height' : 'width'];
        }                
    }
    
    /**
     * Applies the height and width to the child.
     * 
     * @param {mstrmojo.Widget} child The child widget whose dimensions will be set.
     * @param {String} h The height of the child (in pixels, e.g. '31px').
     * @param {String} h The width of the child (in pixels, e.g. '31px').
     * 
     */
    function applyChildDimensions(child, h, w) {
        // Does the child wish to ignore layout?
        if (child.ignoreLayout) {
            // Nothing to do.
            return;
        }
        
        // Does the child have a setDimensions method?
        if (child.setDimensions) {
            // Use it.
            child.setDimensions(h, w);
        } else {
            // Child doesn't have a setDimensions method so use "set" method.
            if (child.set) {
                child.set('height', h);
                child.set('width', w);
            }
        }
    }

    /**
     * Applies calculated dimensions to slots, as well as their children
     * 
     * @param {Boolean} onlyPercentageSlots True if dimensions should be applied to percentage slots only, False to apply to both percentage and fixed slots.
     * 
     * @private
     */
    function applyDimensions(onlyPercentageSlots) {
        var ch = this.children,
            i, 
            len;
        
        // Iterate children again.
        for (i = 0, len = (ch && ch.length) || 0; i < len; i++) {
            var child = ch[i],
                slot = child.slot;
            
            // Do we have a slot?
            if (slot) {
                // Get child sizes.
                var h = calcChildDimension.call(this, child, 'h', onlyPercentageSlots),   
                    w = calcChildDimension.call(this, child, 'w', onlyPercentageSlots);
                
                // Apply the sizes.
                applyChildDimensions(child, h, w);
                
                // Calculate child sizes again?
                var zh = calcChildDimension.call(this, child, 'h', onlyPercentageSlots),   
                    zw = calcChildDimension.call(this, child, 'w', onlyPercentageSlots);
                
                // Did either dimension change?  This should only happen if auto slot to repaints when it (or a siblings) dimensions are applied.
                if (zh !== h || zw !== w) {
                    // Apply new sizes.
                    applyChildDimensions(child, zh, zw);
                }
                
                // Set the dimension on the slot (using new dimensions in case they changed).
                this.setSlotDimensions(slot, zh, zw);
            }
        }
        
        // Call the afterLayout handler.
        this.afterLayout();
    }
    
    /**
     * Adjusts the size of any percentage slots in the supplied container to account for newly rendered auto slots.
     * 
     * @param {mstrmojo.Widget} child The newly rendered child.
     * @param {Object} lw The layout widget properties created during calculateDimension.
     * @param {String} d The dimension, either height or width.
     * 
     * @private
     */
    function adjustDimension(child, lw, d) {
        // Which slot?
        var slot = child.slot,
            autoSlots = lw && lw.a;
        
        // Is this NOT an 'auto' slot?
        if (!autoSlots || autoSlots[slot] === undefined) {
            // No, then return.
            return;
        }
        
        // Measure the height of the newly rendered slot.
        var x = this[slot]['offset' + d],
            size = autoSlots[slot];
        
        // Is the new height the same as the old height?
        if (x === size) {
            // No changes.
            return;
        }
        
        // Adjust the current dimension size by the delta of the old height and the new height.
        lw.x -= (x - size);
        
        // Store the new height.
        autoSlots[slot] = x;
    }
    
    /**
     * <p>Adjusts the layout to account for newly rendered children.</p>
     * 
     * @param {mstrmojo.Event} evt The "childrenRendered" event.
     * 
     * @private
     */
    function adjustLayout(evt) {
        // Call the beforeLayout handler.
        this.beforeLayout();
        
        var lw = this._layoutWidgets,
            child = evt.src;
    
        // Calculate adjusted dimensions for the newly rendered child.
        adjustDimension.call(this, child, lw.h, 'Height');
        adjustDimension.call(this, child, lw.w, 'Width');
        
        // Apply the dimensions.
        applyDimensions.call(this, true);        
    }
    
    /**
     * Calculates and returns the dimensions for the containers slots and child widgets.
     * 
     * @param {Object} dimensionConfig The layout config for this dimension.
     * @param {String} dimension The dimension to calculate, either 'Height' or 'Width' (case sensitive).
     * 
     * @private
     * @returns {Object} An object with the following properties:
     * <dl>
     *  <dt>f</dt>
     *  <dd>An object containing fixed slots and their current size value.</dd>
     *  <dt>p</dt>
     *  <dd>An object containing percentage slots and their current size value.</dd>
     *  <dt>a</dt>
     *  <dd>An object containing auto slots and their current size value (zero since they haven't been measured yet).</dd>
     *  <dt>x</dt>
     *  <dd>The current size of this widget that will be devoted to percentage slots.</dd>
     * </dl>
     */
    function calculateDimension(dimensionConfig, dimension) {
        // Do we NOT have layout in this dimension?
        if (!dimensionConfig) {
            // Nothing to do.
            return null;
        }
        
        var ch = this.children,
            lcDimension = dimension.toLowerCase(),
            widgetDimensionValue = parseInt(this[lcDimension], 10),                     // The total size of this widget dimension (height or width).
            fixedSlots, 
            percentageSlots, 
            autoSlots, 
            autoSlotValues, 
            i, 
            len, 
            child, 
            v, 
            slot;
    
        // Step through all slots in the layoutConfig dimension.
        for (slot in dimensionConfig) {

            // The value for this slot.
            v = dimensionConfig[slot];
            
            // Is the value fixed for this slot?
            if (v.match(/px$/)) {
                // Reduce the total size by the amount of this slots fixed size.
                widgetDimensionValue -= parseInt(v, 10);
                
                // Store this slot as fixed. 
                fixedSlots = fixedSlots || {};
                fixedSlots[slot] = v;
                
            // Is the value a percentage for this slot?
            } else if (v.match(/\%$/)) {
                // Store this slot as a percentage.
                percentageSlots = percentageSlots || {};
                percentageSlots[slot] = v;
            
            // Otherwise, it's an auto value.
            } else {
                autoSlots = autoSlots || {};
                autoSlots[slot] = v;
            }
        }
    
        // Where both auto and percentage slots found?
        if (autoSlots && percentageSlots) {
            
            // Iterate the children.
            for (i = 0, len = (ch && ch.length) || 0; i < len; i++) {
                child = ch[i];
                slot = child.slot;
                
                // Does this child have an auto slot and is it not ignoring layout?
                if (child.slot && autoSlots[slot] && !child.ignoreLayout) {
                    
                    autoSlotValues = autoSlotValues || {};
                    
                    // Has it rendered?
                    if (child.hasRendered) {
                        autoSlotValues[slot] = this[child.slot]['offset' + dimension];
                        
                        // Reduce the measured height by the offsetHeight of the slot.
                        widgetDimensionValue -= autoSlotValues[slot];
    
                    } else {
                        // Cache the slot of this widget for later measurement.
                        autoSlotValues[slot] = 0;
                        
                        // Add event listener to hear when this component is done rendering.
                        child.attachEventListener('childrenRendered', this.id, adjustLayout);
                    }
                }
            }
        }
        
        // Return measurements.
        return {
            f: fixedSlots,
            p: percentageSlots,
            a: autoSlotValues,
            x: widgetDimensionValue
        };
    }
    
    /**
     * <p>A mixin for applying "layout" to a widget.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._HasLayout = 
        /**
         * @lends mstrmojo._HasLayout#
         */
        {
            _mixinName: 'mstrmojo._HasLayout',
            
            /**
             * The inner height of the entire widget.
             * 
             * @type String
             * @default auto
             */
            height: 'auto',
            
            /**
             * The inner width of the entire widget.
             * 
             * @type String
             * @default auto
             */
            width: 'auto',
            
            /**
             * A custom hook that will be called before the widget is laid out. 
             */
            beforeLayout: mstrmojo.emptyFn,
            
            /**
             * A custom hook that will be called after the widget is laid out.
             */
            afterLayout: mstrmojo.emptyFn,
            
            /**
             * <p>The configuration object for the layout of this component.</p>
             * 
             * <p>This object has two optional properties: h (for height) and w (for width).  The values of these properties are an Object with any number of properties.  Each
             * property name corresponds to a slot within the component and it's value can either be fixed (in pixels), a percentage or auto.</p>
             * 
             * <p>For example:</p>
             * 
             * <pre>{
             *         h: {
             *             top: '31px',
             *             containerNode: '100%',
             *             bottom: 'auto'
             *         }
             * }</pre>
             * 
             * <p>This configuration would set the top slot to have a height of 31 pixels, the bottom slot would be auto (or fit to content), and the containerNode height would
             * expand to occupy whatever space is not occupied by the top and bottom.  <b>NOTE:</b> To do this, the bottom slot would be measured after it's children render and the height
             * of the container node would be adjusted by the measured height of the bottom slot.</p>
             *  
             * @type Object
             */
            layoutConfig: null,
            
            init: function init(props) {
                this._super(props);

                // Clone the layout config so all instances won't share the same layout config.
                this.layoutConfig = mstrmojo.hash.clone(this.layoutConfig);
            },
            
            preBuildRendering: function preBuildRendering() {
                var cssText = this.cssText || '';
                
                var height = this.height;
                if (height && height !== 'auto') {
                    cssText += 'height:' + this.height + ';';
                }
                
                var width = this.width;
                if (width && width !== 'auto') {
                    cssText += 'width:' + this.width + ';';
                }
                
                this.cssText = cssText;
                
                return (this._super) ? this._super() : true;
            },
            
            postBuildRendering: function postBuildRendering() {
                // Layout all child components.
                this.doLayout();
                
                return this._super();
            },
            
            /**
             * Lays out the children and slots of this widget.
             * 
             */
            doLayout: function doLayout() {
                // Do we have a layout config?
                var lc = this.layoutConfig;
                if (!lc) {
                    return;
                }
                
                // Call the beforeLayout handler.
                this.beforeLayout();
                
                // Initialize the _layoutWidgets collection.
                this._layoutWidgets = {
                    h: calculateDimension.call(this, lc.h, 'Height'),
                    w: calculateDimension.call(this, lc.w, 'Width')
                };

                // Apply the dimensions.
                applyDimensions.call(this, false);
            },
            
            /**
             * Overridden to call use setDimensions for resizing.
             * 
             * @see mstrmojo._FillsBrowser
             * 
             * @ignore
             */
            browserResized: function browserResized(size) {
                this.setDimensions(size.h, size.w);
                return true;
            },
            
            /**
             * Sets the width of the domNode and then calls doLayout.
             * 
             */
            onwidthChange: function widthChg() {
                var dn = this.domNode;
                if (!dn || !this.layoutConfig) {
                    return;
                }
                
                dn.style.width = this.width;
                this.doLayout();
            },
            
            /**
             * Sets the height of the domNode and then calls doLayout.
             */
            onheightChange: function heightChg() {
                var dn = this.domNode;
                if (!dn || !this.layoutConfig) {
                    return;
                }

                dn.style.height = this.height;
                this.doLayout();
            },
            
            /**
             * <p>This method will adjust the layout dimensions of the parent.</p>
             * 
             * <p>This method will NOT reapply the dimensions.  This method is intended to be used during layout when the application of dimension values to this child
             * require that the parent's slot values be adjusted.  Use with care.</p>
             * 
             */
            adjustParentDimensions: function adjustParentDimensions() {
                var p = this.parent,
                    lw = p && p._layoutWidgets;
                
                // Does the parent have widgets to be layed out.
                if (lw) {
                    // Adjust the parents dimensions.
                    adjustDimension.call(p, this, lw.h, 'Height');
                    adjustDimension.call(p, this, lw.w, 'Width');
                }
            },
            
            /**
             * Changes the widget dimensions and calls doLayout.
             * 
             * @param {String} h The height of the widget in pixels, e.g. '31px'.
             * @param {String} w The width of the widget in pixels, e.g. '31px'.
             * 
             * @returns {Boolean} True if either dimension changed, False if neither did.
             */
            setDimensions: function setDimensions(h, w) {
                if (this.height !== h || this.width !== w) {
                    // Set new dimensions.
                    this.height = h;
                    this.width = w;
                    
                    // Resize dom node.
                    var dn = this.domNode;
                    if (dn) {
                        dn.style.height = h;
                        dn.style.width = w;
                        
                        // Layout children.
                        this.doLayout();
                    }

                    return true;
                }
                
                return false;
            },
            
            /**
             * Sets the height and width for the supplied slot.
             * 
             * @param {String} slot The name of the slot whose dimension should be set.
             * @param {String} h The new height value in pixels, e.g. '31px'.
             * @param {String} w The new width value in pixels, e.g. '31px'.
             */
            setSlotDimensions: function setSlotDimensions(slot, h, w) {
                // Does the slot not have a style collection?
                var sl = this[slot] && this[slot].style;
                if (!sl) {
                    // Nothing to do.
                    return;
                }
                
                // Is the height defined (IE compatible required check) and does the height NOT match the current height?
                if (h !== undefined && sl.height !== h) {
                    // Apply the height.
                    sl.height = h;
                }
                
                // Is the width defined (IE compatible required check) and does the width NOT match the current width?
                if (w !== undefined && sl.width !== w) {
                    // Apply the width.
                    sl.width = w;
                }
            }
            
        };
    
}());