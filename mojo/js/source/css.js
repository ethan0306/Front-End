(function(){

    mstrmojo.requiresCls(
        "mstrmojo.dom",
        "mstrmojo.array",
        "mstrmojo.string");
    
    /**
     * Shortcuts.
     * 
     * @private
     * @ignore
     */
    var $D = mstrmojo.dom,
        $S = mstrmojo.string;

    /**
     * A utility class for browser sniffing.
     * 
     * @class
     */
    mstrmojo.css = mstrmojo.provide(
        "mstrmojo.css",
        /**
         * @lends mstrmojo.css
         */
        {
        
            /**
             * The browser appropriate display property for a table.
             * 
             * @type String
             * @constant
             */
            DISPLAY_TABLE: $D.isIE ? 'block' : 'table',
            
            /**
             * The browser appropriate display property for a table cell.
             * 
             * @type String
             * @constant
             */
            DISPLAY_CELL: $D.isIE ? 'block' : 'table-cell',

            /**
             * The browser appropriate property for min-height.
             * 
             * @type String
             * @constant
             */
            MINHEIGHT: $D.isIE6 ? 'height' : 'minHeight',
                    
            /**
             * <p>Adds one or more of class names to the class name attribute of the supplied element.</p>
             * 
             * <p>If the class name is already present, it will ignore it.</p>
             * 
             * @param {HTMLElement} el The element to receive the classes.
             * @param {String[]} s Array of one or more classes to add.
             */
            addClass: function addClass(el, s) {
                if (!el) {
                    return;
                }
                
                if (s.constructor !== Array) {
                    s = [ s ];
                }
                var cls = el.className || '',
                    start = ' ' + cls +  ' ',
                    bAdded = false;
                for (var i=0, len=s.length; i<len; i++) {
                    var c = s[i];
                    if (!start.match(new RegExp("\\s" + c + "\\s"))) {
                        cls += ' ' + c;
                        bAdded = true;
                    }
                }
                if (bAdded) {
                    el.className = $S.trim(cls);
                }
            },
            
            /**
             * <p>Removes one or more class names from the class name attribute of the supplied element.</p>
             * 
             * <p>If the class name is not present, it will ignore it.</p>
             * 
             * @param {HTMLElement} el The element whose class name is to be edited.
             * @param {String[]} s Array of one or more classes to remove.
             */
            removeClass: function removeClass(el, s) {
                if (!el) {
                    return;
                }
                
                if (s.constructor !== Array) {
                    s = [ s ];
                }
                var cls = ' ' + (el.className || '') + ' ';
                for (var i=0, len=s.length; i<len; i++) {
                    cls = cls.replace(new RegExp("\\s" + s[i] + "\\s", "g"), " ");
                }
                el.className = $S.trim(cls);
            },
            
            /**
             * <p>Adds classes to the space delimited {@link mstrmojo.Widget.cssClass} property.</p>
             * 
             * <p><strong>NOTE:</strong> This is only effective before rendering.  After rendering the {@link mstrmojo.css.addClass} method should be used.</p>
             * 
             * @param {mstrmojo.Widget} widget The widget whose cssClass property should be changed.
             * @param {String|String[]} classes An array of css class names to add (will also work with a single class name). 
             */
            addWidgetCssClass: function addWidgetCssClass(widget, classes) {
                // Split original class names into an array.
                var origClasses = widget.cssClass,
                    existing = (origClasses && origClasses.split(' ')) || [];
                
                // Is the classes param NOT an array?
                if (classes.constructor !== Array) {
                    // Convert to array.
                    classes = [ classes ];
                }

                // Reset cssClass property to new collection of classes.
                widget.cssClass = existing.concat(classes).join(' ');
            },
            
            /**
             * <p>Adds (or removes) one or more class names from the class name attribute of the supplied element.</p>
             * 
             * <p>If the class name is not present, it will ignore it.</p>
             * 
             * @param {HTMLElement} el The element whose class name is to be edited.
             * @param {String[]} s Array of one or more classes to remove.
             * @param {Boolean} b True if the class names should be added. 
             */
            toggleClass: function toggleClass(el, s, b) {
                if (b) {
                    this.addClass(el, s);
                } else {
                    this.removeClass(el, s);
                }
            },
            
            /**
             * Applies a drop shadow to the supplied element.
             * 
             * @param {HTMLElement} el The HTMLElement that will receive the drop shadow.
             * @param {Integer} xOff The offset x value for the drop shadow.
             * @param {Integer} yOff The offset y value for the drop shadow.
             * @param {Integer} spread The spread value for the drop shadow (does not apply to IE).
             * @param {String} color The hexidecimal color value for the drop shadow (must be full 7 digits for IE).
             * 
             */
            applyShadow: function applyShadow(el, xOff, yOff, spread, color) {
                var s = el.style;
                if ($D.isIE) {
                    s.filter += "progid:DXImageTransform.Microsoft.dropshadow(OffX=" + xOff + "px, OffY=" + yOff + "px, Color='" + color + "')";
                } else if ($D.isFF || $D.isWK) {
                    s[(($D.isFF) ? 'MozBoxShadow' : 'WebkitBoxShadow')] = xOff + 'px ' + yOff + 'px ' + spread + 'px ' + color; 
                }
            },
            
            /**
             * Removes any drop shadow from the supplied element.
             * 
             * @param {HTMLElement} el The HTMLElement whose drop shadow should be removed.
             */
            removeShadow: function removeShadow(el) {
                var s = el.style;
                if ($D.isIE) {
//                    s.filter += "progid:DXImageTransform.Microsoft.dropshadow(OffX=" + xOff + "px, OffY=" + yOff + "px, Color='" + color + "')";
                } else if ($D.isFF || $D.isWK) {
                    s[(($D.isFF) ? 'MozBoxShadow' : 'WebkitBoxShadow')] = '';
                }
            },
            
            /**
             * Set opacity value on the given element.
             * NOTE: This method is originated from <code>getFilter</code> and <code>setFilter</code> method in DHTML.js.
             * 
             * @param {HTMLElement} el The target HTMLElement to apply the opacity on.
             * @param {integer} value of opacity(between 0 and 100)
             */
            setOpacity: function setOpacity(el, val) {
                if ($D.isIE && !$D.isIE9){
                    var filterText = el.currentStyle.filter; 
                    var filter = null;
                    if (filterText.length > 0 ) {
                        filter = el.filters['DXImageTransform.Microsoft.Alpha'];
                    }
                    
                    if(filter) {
                        filter.opacity = val;
                        filter.enabled = (val != 100);
                    } else if (val < 100){
                        var filterDefinition = 'progid:DXImageTransform.Microsoft.Alpha(Opacity='+val+')';
                        el.style.filter = (filterText?filterText:"") + " " + filterDefinition;
                    }
                }else {
                    el.style.opacity = val / 100 - ($D.isIE9 ? 0.00001: 0);
                }
            },
            
            /**
             * Builds an object with the browser specific property css name and value for a gradient.
             * 
             * @param {Integer} t The type of gradient (0 = vertical, 1 = horizontal).
             * @param {String} sc The start color.
             * @param {String} ec The end color.
             * 
             * @returns {Object}
             */
            buildGradient: function buildGradient(t, sc, ec) {
                if ($D.supports($D.cssFeatures.GRADIENTS)) {
                    var rtn = {};
                    
                    if ($D.isIE) {
                        rtn.n = 'filter';
                        rtn.v = "progid:DXImageTransform.Microsoft.Gradient(GradientType=" + t + ",StartColorStr='" + sc + "',EndColorStr='" + ec + "')";
                        
                    } else if ($D.isFF) {
                        rtn.n = 'background-image';
                        rtn.v = '-moz-linear-gradient(' + ((t === 0) ? 'top' : 'left') + ',' + sc + ',' + ec + ')';
                        
                    } else if ($D.isWK) {
                        rtn.n = 'background';
                        rtn.v = '-webkit-gradient(linear,' + ((t === 0) ? 'left top, left bottom' : 'left top, right top') + ',from(' + sc + '),to('+ ec + '))';
                    }
                        
                    return rtn;
                }
                
                return null;
            },
            
            /**
             * Returns a String of browser specific css for rounded corners.
             * 
             * @param {Integer} r The single radius value for all borders.
             * @param {Boolean} t True if the top corners are the only rounded corners. 
             * 
             * @returns {String}
             */
            buildRoundCorners: function buildRoundCorners(r, t) {
                if ($D.supports($D.cssFeatures.ROUND_CORNERS)) {
                    var v = r + 'px';
                    var radiusValue = v + ((t) ? ' ' + v + ' 0 0' : '') + ';';
                    
                    if ($D.isFF) {
                        return '-moz-border-radius:' + radiusValue;
                        
                    } else if ($D.isWinPhone) {
                    	return 'border-radius:' + radiusValue;
                    	
                    } else if ($D.isWK) {	
                        // Are all four corners the same?
                        if (!t) {
                            // Send one value.
                            return '-webkit-border-radius:' + v + ';';
                            
                        } else {
                            // Otherwise, send four separate values.
                            var ds = ['left', 'right'],
                                css = [],
                                x = -1;
                            
                            for (var i = 0; i < 2; i++) {
                                css[++x] = '-webkit-border-top-' + ds[i] + '-radius:' + v;    // Top is rounded.
                                css[++x] = '-webkit-border-bottom-' + ds[i] + '-radius:0';    // Bottom is not.
                            }
                            
                            return css.join(';');
                        }
                    }
                }
                
                return '';
            },
            
            /**
             * Converts a css ""border-width" value to an object with individual border width values in pixels.
             * 
             * @param {String} b The value of the "border-width" css property which may have 4, 3, 2 or 1 individual border widths.
             * @param {Integer} dpi The users DPI settings value.
             * 
             * @returns {Object} An object with 't' (top), 'r' (right), 'b' (bottom), 'l' (left), 'h' (top  + bottom) and 'w' (left + right) properties which contain the 
             *  individual border widths (in pixels) for the supplied border-width value.
             */
            getBorderWidths: function getBorderWidths(b, dpi) {
                // Create empty borders object.
                var o = {
                    t: 0,
                    r: 0,
                    b: 0,
                    l: 0,
                    h: 0,
                    w: 0
                };
                
                // Is b undefined or empty?
                if (!b) {
                    return o;
                }

                // Split border value into components.
                var a = b.split(' '),
                    len = a.length;
                
                // Convert point values to pixels.
                for (var i = 0; i < len; i++) {
                    a[i] = Math.round(dpi * parseFloat(a[i], 10) / 72);
                }
                
                // Normalize the components array so there are always four border width values.
                if (len < 4) {
                    // Is there only one value?
                    if (len === 1) {
                        // Add three duplicated values for right, bottom and left.
                        a[1] = a[2] = a[3] = a[0];
                    } else {
                        // Must be 2 or 3 so left border will match right border.
                        a[3] = a[1];
                        // Are there only two values?
                        if (len === 2) {
                            // Bottom border will match top border.
                            a[2] = a[0];
                        }
                    }
                }
                
                // Configure and return borders object.
                o.t = a[0];
                o.r = a[1];
                o.b = a[2];
                o.l = a[3];
                o.h = o.t + o.b; 
                o.w = o.l + o.r;
                
                return o;
            },
            
            /**
             * <p>Parks an element to the left of the viewport after it fades out.</p>
             * 
             * @param {HTMLEvent} evt An event with a "target" property that points to the element that has faded.
             */
            parkAfterFade: function parkAfterFade(evt) {
                // Get the style of the element.
                var elStyle = evt.target.style;

                // Is the element hidden?
                if (elStyle.opacity == 0) {
                    // Park the element off to the left of the viewport so it doesn't mask touch events.
                    elStyle.left = '-10000px';
                    
                    // Restore the opacity after a timeout. (Bugfix - in iPhone we see 2 flashes because 
                    //the opacity changes before the mask has been parked
                    window.setTimeout(function() {
                        elStyle.opacity = 0.99;
                    }, 0);
                }
                
            },
            
            
            /**
             * return computed style property value for specified CSS property, like 'height', etc
             * @param {HTMLDomNode} el - html element
             * @param {String} prop - css property name 
             * @return {String} css property value
             */
            getStyleValue: function getStyleValue(el, prop) {
                if (el.currentStyle){ //IE
                    prop = prop == 'float' ? 'styleFloat' : prop;
                    value = el.currentStyle[prop];
                }
                else if (document.defaultView && document.defaultView.getComputedStyle){ //FF
                    prop = prop == 'float' ? 'cssFloat' : prop; 
                    var styles = document.defaultView.getComputedStyle(el, null); 
                    value = styles ? styles[prop] : null;
                }
                
                return value;           
            },
            
            /**
             * <p>Returns the computed style of current element.</p>
             * 
             * <p>To use, call this method to retrieve the elements style, then query the result for individual properties.</p>
             * 
             * <pre>
             *     var computedStyle = mstrmojo.css.getComputedStyle(elem),
             *         color = cs.color,
             *         vis = cs.visibility;
             * </pre>
             * 
             * @param {HTMLElement} element The HTMLElement for which to get the computed style.
             * @param {String} [pseudoElement] An optional string specifying the pseudo-element to match.  Must be omitted for regular elements.
             * 
             * @returns CSSStyleDeclaration
             */
            getComputedStyle: function(element, pseudoElement) {
                var fn = (window.getComputedStyle) ? 
                        function (element, pseudoElement) {
                            return window.getComputedStyle(element, pseudoElement || null);
                        } : 
                        function (element) {
                            return element.currentStyle || {};
                        };
                        
                mstrmojo.css.getComputedStyle = fn;
                
                return fn(element, pseudoElement);
            }
            
        });
    
})();