(function(){
    
    mstrmojo.requiresCls("mstrmojo.dom", "mstrmojo.css");
    
    /**
     * <p>A map for common formatting style properties.</p>
     * 
     * <dl>
     *      <dt>T</dt>
     *      <dd>position, i.e. top and left.</dd>
     *      
     *      <dt>D</dt>
     *      <dd>dimension, i.e. height and width.</dd>
     *      
     *      <dt>B</dt>
     *      <dd>border, split into color, style and width components.</dd>
     *      
     *      <dt>F</dt>
     *      <dd>common font formatting.</dd>
     *      
     *      <dt>P</dt>
     *      <dd>padding, with 1, 2, 3 or 4 property values.</dd>
     *      
     * </dl>
     * 
     * @type Object
     * 
     * @private
     * @ignore
     */
    var commonProps = {
        T: [ 'top', 'left' ],
        D: [ 'height', 'width' ],
        B: [ 'border', 'border-color', 'border-style', 'border-width' ],
        F: [ 'font', 'color', 'text-decoration' ],
        P: [ 'padding' ]
    };
    
    /**
     * Combines common rw unit formatting properties top, left, height, width and zIndex.
     *
     * @type String[]
     * 
     * @private
     * @ignore
     */ 
    commonProps.RW = ['z-index'].concat(commonProps.T.concat(commonProps.D));
    
    /**
     * Shortcut to dom class.
     * 
     * @private
     * @ignore
     */
    var $D = mstrmojo.dom;
    
    /**
     * Utility function to initialize and populate effects property array.
     * 
     * @param {Object} An object to hold fx properties and values.
     * @param {String} The name of the fx property.
     * @param {String} The new value.
     * 
     * @private
     * @ignore
     */
    function pushFxProperty(fx, n, v) {
        // Extract or initialize value array.
        var p = fx[n] || [];
        // Set new value.
        p.push(v);
        // Set value array back onto fx object.
        fx[n] = p;
    }
    
    /**
     * <p>A mixin for formatting {@link mstrmojo.Widget}s based on MicroStrategy Report Services document definitions.</p>
     * 
     * @class
     * @public
     */
    mstrmojo._Formattable = 
        /**
         * @lends mstrmojo._Formattable#
         */
        {
            _mixinName: 'mstrmojo._Formattable', 
            
            /**
             * Specifies which formatting properties should be applied to which dom slots.
             * @type Object
             */
            formatHandlers: null,
            
            /**
             * Utility function for generating cache key.
             * 
             * @param {mstrmojo.Widget} w The current widget.
             * 
             * @private
             * @ignore
             */
            getCacheKey: function getCacheKey(w) {
                return 'csscache' + (w.thresholdId || '');
            },
            /**
             * <p>Builds css text for dom slots during rendering.</p>
             * 
             * <p>Extends the widget's preBuildRendering method in order to first build cssText strings
             * from the widget's formatting properties & store the strings in widget properties, 
             * which can then be applied to the rendering.</p>
             * 
             * @returns {Boolean} True
             */            
            preBuildRendering: function preBuildRendering() {
                if (this._super) {
                    this._super();
                }
                
                // Do we have a cache of resolved formatting strings?
                var defn = this.defn;
                if (!defn) {
                    defn = this.defn = {};
                }
                var cacheKey = this.getCacheKey(this),
                    cache = defn[cacheKey];
                if (!cache) {
                    // We don't have a cache. Create and cache formatted strings now.                
                    cache = defn[cacheKey] = {};
                    
                    // Get the formats for this object.
                    var fmts = this.getFormats();
                    if (fmts) {
                    
                        // Step through the collection of slots to be formatted.
                        var fhs = this.formatHandlers;
                        for (var slot in fhs) {
                            var handle = fhs[slot];
                            
                            // Resolve the src (default to format).
                            var src = handle.src? fmts[handle.src] : fmts;
                            if (!src) {
                                return;
                            }
                            
                            // Initialize an array to hold string fragments.
                            var css = [];
                            var x = -1;
                            
                            // Create the name of the slot this will be 
                            var slotCss = slot + 'CssText';
                            
                            // Get the format node.
                            var props = handle.props || handle;
                            if (!props) {
                                continue;
                            }
                            
                            // Step through the collection of properties to apply.
                            for (var bp = props.length-1; bp >= 0; bp--) {
                                var p = props[bp];
                                
                                // If the property is an enumeration from commonProps then use that, otherwise an array with the single property.
                                var c = commonProps[p] || [ p ];
                                
                                // Step through the resolved collection of properties.
                                for (var z = c.length-1; z >= 0; z--) {
                                    // Reset the property name.
                                    p = c[z];
                                    
                                    // Is this property present in the formats?
                                    if (p in src) {
                                        // Is this the 'fx' property?
                                        if (p === 'fx') {
                                            var f = src[p],
                                                fx = {};
                                            
                                            // Format the gradient (if present).
                                            if ('gd' in f) {
                                                this.formatGradient(f.gd, fx);
                                            }
                                            
                                            // Format the text rotation (if present).  We need to do this before drop shadow so the shadow appears in the correct
                                            // position in IE.
                                            if ('rt' in f) {
                                                if(f.rt == 1 || f.rt == 3) this.formatTextRotation(f.rt, fx);
                                            }
                                            
                                            // Format the drop shadow (if present).
                                            if ('ds' in f) {
                                                this.formatDropShadow(f, fx);
                                            }
                                            
                                            // Iterate the fx object.
                                            for (var fp in fx) {
                                                // Join all elements with space (really only needed for IE filter property).
                                                css[++x] = fp + ':' + fx[fp].join(' ');
                                            }
                                        } else {
                                            css[++x] = p + ':' + src[p];
                                        }
                                    }
                                }
                            }
                            
                            // Store the aggregated css style text in the slotCssText property. 
                            this[slotCss] = cache[slotCss] = css.join(';') + ';';
    
                        } // end for each slot in fhs
                    } // if fmts
                } else {
                    // Restore from cache.
                    for (var n in cache) {
                        this[n] = cache[n];
                    }
                }            
                return true;
            },
            
            /**
             * Builds the browser specific css for gradients.
             * 
             * @param {Object} gp The gradient properties node as retrieved from the fx formatting node.
             * @param {Integer} gp.t The type of gradient.
             * @param {String} gp.sc The start color of the gradient.
             * @param {String} gp.ec The end color of the gradient.
             * @param {Object} fx An object to hold the new formatting property values.
             */
            formatGradient: function formatGradient(gp, fx) {
                var gd = mstrmojo.css.buildGradient(gp.t, gp.sc, gp.ec);
                if (gd) {
                    pushFxProperty(fx, gd.n, gd.v);
                }
            },
            
            /**
             * Builds the browser specific css for drop shadows.
             * 
             * @param {Object} f The rw unit format node.
             * @param {Object} fx An object to hold the new formatting property values.
             */
            formatDropShadow: function formatDropShadow(f, fx) {
                if ($D.supports($D.cssFeatures.DROP_SHADOW)) {
                    var ds = f.ds;
                    
                    if ($D.isIE) {
                        pushFxProperty(fx, 'filter', "progid:DXImageTransform.Microsoft.DropShadow(Color='#66000000',Positive='true',OffX=" + ds + ",OffY=" + ds + ")");
                    } else {
                        var v = [ ds, ds ];
                        
                        // Is the text rotated? 
                        if (f.rt == 1 || f.rt == 3) {
                            // Adjust either the first or second value (based on rotation angle) so that shadow appears in the correct position.
                            v[((f.rt === 1) ? 1 : 0)] = -ds;
                        }
                        
                        if ($D.isFF) {
                            pushFxProperty(fx, '-moz-box-shadow', v.join('px ') + 'px 3px 0px #888');
                        } else if ($D.isWK) {
                            pushFxProperty(fx, '-webkit-box-shadow', v.join('px ') + 'px 3px #888');
                        }
                    }
                }
            }, 
            
            /**
             * Builds the browser specific css for text rotation.
             * 
             * @param {Integer} tr The text rotation value (1 or 3).
             * @param {Object} fx An object to hold the new formatting property values.
             */
            formatTextRotation: function formatTextRotation(tr, fx) {
                if ($D.supports($D.cssFeatures.TEXT_ROTATION)) {
                    if ($D.isIE) {
                        pushFxProperty(fx, 'filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + tr + ')');
                    } else {
                        // Our prefix...
                        var pre = ($D.isFF) ? 'moz' : 'webkit';
                        
                        // The number of degrees to rotate (depending on the type of rotation)...
                        var degrees = (tr === 1) ? 90 : -90;
                        
                        // Rotate about the top-left corner of the element...
                        pushFxProperty(fx, '-' + pre + '-transform-origin', 'top left');
                        
                        // Rotate the specified number of degrees...
                        // NOTE: For rt==1, we can omit the postBuildRendering stop of relocating the left
                        // position if we are passed the outer height of the text field (which would
                        // be saved in MD as a text width). Assuming it was present, we could add a 
                        // 'translateX' directive (with the text height as its argument) before the
                        // 'rotate' directive as:
                        //
                        // -moz-transform: translateX(22px) rotate(90deg)
                        pushFxProperty(fx, '-' + pre + '-transform', 'rotate(' + degrees + 'deg)');
                    }
                }
            },
            
            /**
             * Returns the format for this widget from the formatResolver.
             *  
             * @returns {Object} The resolved formats for this widget.
             */
            getFormats: function getFormats() {
                if (!this.fmts) {
                       this.fmts = this.formatResolver.getFormat(this.defn, this.thresholdId);    // formatResolver now expects defn object arg, not key string
                }
                
                return this.fmts;
            },
            
            clearCache: function clearCache() {
                // Clear the format cache for next render.
                delete this.defn[this.getCacheKey(this)];
            },
            
            unrender: function unrender(ignoreDom) {
                // Do we have a thresholdId?
                // TODO: Is this.thresholdId a correct indication ? Should  we use a more specific and persistent boolean instead e.g. what if after a selector action, a textfield doesn't have any conditional formatting applied any more ?
                if (this.thresholdId) {
                    // Clear the cached fmts node.
                    this.fmts = null;
                }
                
                this._super(ignoreDom);
            }
            
        };
    
    /**
     * Returns the individual border width values for the supplied widget (in pixels, but without the unit identifier).
     * 
     * @param {mstrmojo.Widget} w The widget whose border widths should be calculated.
     * 
     * @returns {Object} An object with 't' (top), 'r' (right), 'b' (bottom), 'l' (left), 'h' (top  + bottom) and 'w' (left + right) properties which contain the 
     *  individual border widths (in pixels) for the supplied {@link mstrmojo.Widget}.
     * 
     * @static
     */
    mstrmojo._Formattable.getBorderWidths = function(w) {
        var f = w.getFormats(),
            b = ('border' in f) ? f.border.match(/(\d*|\d*\.\d*)pt/)[0] : f['border-width'],    // Extract border widths from either border or border-width.
            dpi = w.model.docModel ? w.model.docModel.dpi : w.model.dpi; 
        return mstrmojo.css.getBorderWidths(b, dpi);
        };
    
})();