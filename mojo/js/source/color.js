(function(){

    var DEFAULT_COLOR = "#000000";
        
    /**
     * A utility class for color conversion.
     * 
     * @class
     */
    mstrmojo.color = mstrmojo.provide(
        "mstrmojo.color",
        
        /**
         * @lends mstrmojo.color
         */
        {
            
             
            hexChars: '0123456789ABCDEF',

            /**
             * Converts a decimal value to a hexidecimal value.
             * @param {Integer} n The decimal value.
             * @type String
             * @return The hexidecimal value (without the hash).
             */
            toHex: function C_toHex(n) {
                n = n || 0;
                n = Math.max(Math.min(isNaN(n) ? 0 : parseInt(n, 10), 255), 0);
        
                return this.hexChars.charAt((n - n % 16) / 16)
                        + this.hexChars.charAt(n % 16);
            },

            toDec: function C_toDec(h) {
                return this.hexChars.indexOf(h.toUpperCase());
            },

            /**
             * Converts Mozilla's color string 'rgb(0, 120, 255)' to an Integer array of red, green and blue. 
             * @param {String} color The Mozilla color string to convert.
             * @type Integer[]
             * @return An Integer array of red, green and blue values.
             */
            rgbStr2rgb: function C_rgbStr2rgb(color) {
                var rgb = [ 0, 0, 0 ];
                color = color.replace(/ /g, ''); //get rid of the possible blank space
                var i = color.indexOf('rgb');
                if (i >= 0) {
                    color = color.substring(i + 4, color.length - 1);
                    rgb = color.split(',');
                }
                return rgb;
            },

            /**
             * Converts an RGB color string value like 'rgb(0, 120, 255)' to a hexidecimal color string value.
             * @param {String} color The RBG color value.
             * @type String
             * @return The hexidecimal color value.
             */
            rgbStr2hex: function C_rgbStr2hex(color) {
                //only when color is in rgb(r,g,b) format
                if (color.indexOf('rgb') >= 0) {
                    var rgb = this.rgbStr2rgb(color);
                    return "#" + this.rgb2hex(rgb[0], rgb[1], rgb[2]);
                }
                return color;
            },

            rgb2hex: function C_rgb2hex(r, g, b) {
                return this.toHex(r) + this.toHex(g)
                        + this.toHex(b);
            },

            rgb2hsv: function C_rgb2hsv(r, g, b) {
                var rgb = [ r, g, b ];
                rgb.sort( function(a, b) {
                    return a - b;
                });
        
                var h, s, v = 0;
                var min = rgb[0];
                var max = rgb[2];
        
                v = max / 255.0;
                s = (max != 0) ? (parseFloat(max) - parseFloat(min)) / parseFloat(max)
                        : 0;
        
                if (s == 0) {
                    h = 0;
                } else {
                    var d = max - min;
                    var red = (max - r) / d;
                    var green = (max - g) / d;
                    var blue = (max - b) / d;
        
                    if (r == max)
                        h = blue - green;
                    else if (g == max)
                        h = 2.0 + red - blue;
                    else
                        h = 4.0 + green - red;
        
                    h = h / 6.0;
                    if (h < 0)
                        h = h + 1.0;
                }
        
                return [ Math.round(h * 360), Math.round(s * 100), Math.round(v * 100) ];
            },

            hex2rgb: function C_hex2rgb(s) {
                var color = (s.charAt(0) == '#') ? s.substr(1) : s;
                var l = color.length !== 3;
                var rgb = [ 0, 0, 0 ];
                if (l) {
                    rgb[0] = (this.toDec(color.substr(0, 1)) * 16)
                            + (this.toDec(color.substr(1, 1)));
                    rgb[1] = (this.toDec(color.substr(2, 1)) * 16)
                            + (this.toDec(color.substr(3, 1)));
                    rgb[2] = (this.toDec(color.substr(4, 1)) * 16)
                            + (this.toDec(color.substr(5, 1)));
                } else {
                    rgb[0] = (this.toDec(color.substr(0, 1)) * 16)
        	            + (this.toDec(color.substr(0, 1)));
                    rgb[1] = (this.toDec(color.substr(1, 1)) * 16)
                	    + (this.toDec(color.substr(1, 1)));
                    rgb[2] = (this.toDec(color.substr(2, 1)) * 16)
        		    + (this.toDec(color.substr(2, 1)));
	     }        
                return rgb;
            },

            hex2hsv: function (s) {
                var rgb = this.hex2rgb(s);
                return this.rgb2hsv(rgb[0], rgb[1], rgb[2]);
            },

            hsv2rgb: function (h, s, v) {
                h = h / 360;
                s = s / 100;
                v = v / 100;
        
                var r, g, b;
                if (s == 0) {
                    r = v * 255;
                    g = v * 255;
                    b = v * 255;
                } else {
                    var th = h * 6;
                    if (th == 6)
                        th = 0;
        
                    var i = Math.floor(th);
                    var p = v * (1 - s);
                    var q = v * (1 - s * (th - i));
                    var t = v * (1 - s * (1 - (th - i)));
        
                    var tr, tg, tb;
        
                    switch (i) {
                    case 0:
                        tr = v;
                        tg = t;
                        tb = p;
                        break;
        
                    case 1:
                        tr = q;
                        tg = v;
                        tb = p;
                        break;
        
                    case 2:
                        tr = p;
                        tg = v;
                        tb = t;
                        break;
        
                    case 3:
                        tr = p;
                        tg = q;
                        tb = v;
                        break;
        
                    case 4:
                        tr = t;
                        tg = p;
                        tb = v;
                        break;
        
                    default:
                        tr = v;
                        tg = p;
                        tb = q;
                        break;
                    }
        
                    r = tr * 255;
                    g = tg * 255;
                    b = tb * 255;
                }
                return [ Math.round(r), Math.round(g), Math.round(b) ];
        
            },

            hsv2hex: function (h, s, v) {
                var rgb = this.hsv2rgb(h, s, v);
                return this.rgb2hex(rgb[0], rgb[1], rgb[2]);
            },
            
            getContrastingColor : function C_getContrastingColor(hex, colors) {
                var rgb = this.hex2rgb(hex);
                return (((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000 < 125) ? colors[0] : colors[1];
            },
            
            getHighlightColor: function C_getHighlightColor(rgb, moreDim) {
                var r, g, b, luminosity,
                    refRGB = this.hex2rgb(!moreDim ? '#FFCE7F' : '#EFE6D8'),
                    R1 = parseInt(rgb[0], 10),
                    G1 = parseInt(rgb[1], 10),
                    B1 = parseInt(rgb[2], 10),
                    R2 = parseInt(refRGB[0], 10),
                    G2 = parseInt(refRGB[1], 10),
                    B2 = parseInt(refRGB[2], 10);
                
                    r = (R1 * R2) / 255;
                    g = (G1 * G2) / 255;
                    b = (B1 * B2) / 255;
                    
                    luminosity = R1 * 0.3 + G1 * 0.59 + B1 * 0.11;
                    if (luminosity < 85) {
                        r = r + (63 * (85 - luminosity) / 85); 
                        r = r > 255 ? 255 : r;
                        g = g + (63 * (85 - luminosity) / 85); 
                        g = g > 255 ? 255 : g;
                        b = b + (63 * (85 - luminosity) / 85); 
                        b = b > 255 ? 255 : b;
                    }

                return "#" + this.rgb2hex(Math.round(r), Math.round(g), Math.round(b));
            },
            
            /**
             * Calculates the light color component for 3d borders.
             * @param {Integer[]} rgbColor An array of rgb component colors.
             * @param Integer luminosityColor The luminosity value for the supplied color.
             * @type String
             * @return The hexidecimal value for the light color component.
             * @refactoring This method is only called twice and it's always in conjunction with handed into {@link calculateLuminosity} and {@link calculateDarkColor}.  We should refactor 
             *      all three methods into one and move it to mstr.utils.Color.
             */
            get3DBorderColor: function C_get3DBorderColor(bgRGB, stroke) {
                var lum = parseInt(bgRGB[0],10) * 0.3 + parseInt(bgRGB[1],10) * 0.59
                    + parseInt(bgRGB[2],10) * 0.11;

                var r = parseInt(bgRGB[0],10);
                var g = parseInt(bgRGB[1],10);
                var b = parseInt(bgRGB[2],10);

                switch (stroke) {
                case 'light': //light border color
                    if (lum > 150) {
                        r = r * 0.9;
                        g = g * 0.9;
                        b = b * 0.9;
                    } else {
                        r = r * 0.6 + 102;
                        g = g * 0.6 + 102;
                        b = b * 0.6 + 102;
                    }
                    break;
                case 'dark': //dark border color
                    if (lum > 10) {
                        r = r * 0.4;
                        g = g * 0.4;
                        b = b * 0.4;
                    } else {
                        r = r * 0.8 + 30;
                        g = g * 0.8 + 30;
                        b = b * 0.8 + 30;
                    }
                }

                return "#" + this.rgb2hex(Math.round(r), Math.round(g), Math.round(b));
            },
            
            
            /**
             * <p>Convert Hex color into VB style Decimal required by backend.</p>
             * <li> - first convert #RRGGBB into #BBGGRR </li>
             * <li> - second convert BBGGRR into decimal </Li>
             * 
             * @param {String} v Hex color
             */
            encodeColor: function (v, d) { 
                    if (d != undefined && (v == null || v.length == 0 || v == 'undefined')) {
                        v = d;
                    }
                    if (v == 'transparent') {
                        return -1;
                    } else if (v == -2) {
                        return -2;
                    } else {
                        //remove prefix
                        if (v.substring(0,1) == '#') {
                            v = v.substring(1);
                        }
                        
                        //switch RR with BB and get the decimal value
                        return parseInt(v.substring(4) + v.substring(2,4) + v.substring(0,2), 16); 
                    }
            },
            
            /**
             * <p>Convert VB color from backend into RGB </p> 
             * <pre>
             *   Here is the spec for color in CSS2
             *      EM { color: #f00 }              // #rgb 
             *      EM { color: #ff0000 }           // #rrggbb 
             *      EM { color: rgb(255,0,0) }      // integer range 0 - 255 
             *      EM { color: rgb(100%, 0%, 0%) } // float range 0.0% - 100.0% 
             *   so we have this function to transform the color to #rrggbb style.
             *   current assumption is backend will give me a hexadecimal representation of the color
             *   in VB color in BBGGRR format in hexadecimal, and the value we get from backend is in decimal,
             *   so this function will convert decimal VB color to CSS2 color.
             *   anything wrong in converting, return black color "000000".
             * </p>       
             * @param {Integer} vbColor VB style color value in decimal.
             * @return {String} RGB color
             */
            decodeColor: function(vbColor) {
                var color = parseInt(vbColor, 10);
                
                if (color == 0) {
                    return  DEFAULT_COLOR;
                } 

                //get rgb color in decimal
                var rgb = 0x1000000 + (color & 0xff) * 0x10000 + (color & 0xff00) + (color & 0xff0000) / 0x10000;
                
                //convert to Hex string
                return '#' + rgb.toString(16).substring(1).toUpperCase();
            }
            
        }
    ); //end provide()

 })();
