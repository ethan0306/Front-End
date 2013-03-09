/*global mstrmojo:false, window:false, document:false */

(function () {

    mstrmojo.requiresCls("mstrmojo.dom",
                         "mstrmojo.Widget",
                         "mstrmojo.tooltip",
                         "mstrmojo.string",
                         "mstrmojo.array");

    /**
     * Counter to make sure every image map name is unique.
     * 
     * @private
     */
    var mapIdx = 0,
        $ARR = mstrmojo.array,
        $STR = mstrmojo.string;

    /**
     * Sets the current graph src or displays a message to the user if unable to display graph. 
     * 
     * @private
     */
    function configureDisplay() {
        var tn = this.textNode,
            img = this.imgNode;

        // Is this an empty graph?
        if (this.eg != null) {
            // Hide the graph image.
            img.style.display = 'none';

            // Display the message (or empty string).
            tn.innerHTML = this.eg || '';

            // Make sure the text node is visible.
            tn.style.display = 'block';

        } else {
            // Hide the message.
            tn.style.display = 'none';

            // Display the image node.
            img.style.display = 'block';

            // Load the image.
            var fmts = this.getFormats();
            this.retrieveGraphSrc(fmts.height, fmts.width);
        }
    }

    /**
     * Map to hold area code to shape conversion values.
     * 
     * @type Object
     * @private
     */
    var areaShapeMap = {
        6: 'poly',
        7: 'rect',
        100: 'circle'
    };

    /**
     * <p>This method generates the image map used for mouseover tooltips.</p>
     *
     * <p>If the widget is already rendered it will replace the map within the dom node.  If not rendered, it will set properties on the widget
     * that will be inserted into the markup during rendering.
     *
     * @private
     */
    function generateImageMap() {
        // Cache server generated area data.
        var areaData = this.as,
            len = areaData && areaData.length;

        // Do we have any area data?
        if (!len) {
            // Nothing to do.
            return;
        }

        var widgetId = this.id,
            mapId = widgetId + '_map' + mapIdx++,
            buf = [],                               // String buffer for map areas.
            x = -1,                                 // Buffer counter.
            i;                                      // Iterator counter.

        // Iterate areas.
        for (i = 0; i < len; i++) {
            // Cache single area.
            var area = areaData[i];

            // Add dynamic properties to area.
            area.id = widgetId;                                                 // Widget id.
            area.aid = i;                                                       // Area index.
            area.tooltip = $STR.multiReplace(area.tooltip || '', {              // Tooltip (with new line "&#13" replaced by "<br />", and space "&#32" replaced by ' ').
                '&#13': '<br />',
                '&#32': ' '
            });

            // Has the shape NOT been converted already?
            if (!isNaN(area.shape)) {
                // Convert the shape code to a name.
                area.shape = this.getAreaShapeName(area.shape);
            }

            // Is the graph acting as a selector?
            if (area.tks || area.tks === '') {
                // Add href attribute to get the hand cursor on area hover.
                area.extra = ' href="#" ';
            }

            // Add area to buffer.
            buf[++x] = $STR.apply(this.areaMarkup, area);
        }

        // Create whole map markup.
        var mapMarkup = '<map id="' + mapId + '" name="' + mapId + '">' + buf.join('') + '</map>';

        // Have we not rendered yet?
        if (!this.domNode) {
            // Add markup and attribute for render.
            this.att = 'usemap="#' + mapId + '" ';
            this.map = mapMarkup;
        } else {
            // Create element from markup and replace existing map.
            var renderContainer = document.createElement('div');
            renderContainer.innerHTML = mapMarkup;
            this.mapNode = mstrmojo.dom.replace(this.mapNode, renderContainer.firstChild);

            // Set "usemap" attribute on image node.
            this.imgNode.setAttribute('usemap', '#' + mapId, 0);        // TQMS #540145: Third parameter is to tell IE7 that the attribute name is case insensitive (doesn't work without it). 
        }
    }

    /**
     * <p>The widget for a single MicroStrategy Graph control.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    var graphBase = mstrmojo.GraphBase = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,

        // mixins,
        null,

        /** 
         * @lends mstrmojo.GraphBase.prototype
         */
        {
            scriptClass: "mstrmojo.GraphBase",

            cssClassPrefix: "mstrmojo-GraphBase",

            markupString: '<div id="{@id}" class="{@cssClassPrefix} {@cssClass}" title="{@tooltip}" style="{@domNodeCssText};">' +
                              '<div class="{@cssClassPrefix}-txt"></div>' +
                              '<img {@att}src="../images/1ptrans.gif" class="{@cssClassPrefix} {@cssImageClass}"/>' +
                              '{@map}' +
                          '</div>',

            /**
             * This property stores the attributes required for the image node.
             * 
             * @type String
             * @default ''
             */
            att: '',

            /**
             * This property stores the calculated map markup string based on the areas property provided 
             * in the data.
             * 
             * @type String
             * @default ''
             */
            map: '',

            /**
             * Denotes the currently highlighted area. -1 denotes that no area is selected.
             * 
             * 
             */
            cAreaIdx: -1, // current mouse on area index. when it is -1 means no area is pointed by mouse

            /**
             * This property denotes whether the graph uses richly styled tooltips
             * 
             * @type Boolean
             * @default true
             */
            useRichTooltip: true,

            markupSlots: {
                imgNode: function () { return this.domNode.childNodes[1]; },
                mapNode: function () {return this.domNode.childNodes.length > 2 ? this.domNode.childNodes[2] : null; },
                textNode: function () { return this.domNode.firstChild; }
            },

            markupMethods: {
                onvisibleChange: function () { this.domNode.style.display = (this.visible) ? 'block' : 'none'; }
            },

            preBuildRendering: function preBuildRendering() {
                // Generate markup and properties for image map use.
                generateImageMap.call(this);

                return this._super();
            },

            postBuildRendering: function postBuildRendering() {
                // Configure whether we need to show an error message or show the graph.
                configureDisplay.call(this);

                //Call super.
                return this._super();
            },

            setModel: function setModel(model) {
                this.model = model;
            },

            /**
             * Positions tooltip correctly according to current slider's position and style (horizontal/vertical).
             * Updates tooltip content to current selection.
             * 
             * @param {HTMLAreaElement} elem The DOM Element for which the tooltip needs to updated.
             * @param {Object} ep An object with the x and y coordinates of the screen event (mouse or touch)
             * @param {boolean} [useGivenCoords=false] Optional argument if set to true do not compute the object position but use the given coords in ep object
             * @private
             */
            updatingTooltipHelper: function updatingTooltipHelper(elem, ep, useGivenCoords) {
                var aid = elem && elem.getAttribute('aid'),
                    ttl = elem && elem.getAttribute('ttl'),
                    borderColor = elem.getAttribute('SC'),
                    ttN = {
                        refNode : this.domNode,
                        posType: mstrmojo.tooltip.POS_BOTTOMLEFT,
                        contentNodeCssClass: 'gp-tooltip'
                    },
                    zoom = (this.model.zf || 1) + 'em';

                // Is the mouse over the currently visible tooltip area?
                if (aid == this.cAreaIdx) {
                    // Nothing to do.
                    return;
                }

                // update current focused area index
                this.cAreaIdx = aid;

                // update tooltip content
                ttN.content = ttl;
                var cssText = 'font-size:' + zoom + ';';

                // update font-size for zoom if area has color property set the border color of tooltip to be the same
                if (borderColor) { // #502810
                    cssText += 'border-color:#' + borderColor;
                }

                ttN.contentNodeCssText = cssText;

                // calculate tooltip position
                var c = elem.getAttribute("coords"),
                    x = 99999,
                    y = 99999;

                if (!useGivenCoords) { //# 502818,502857,502719
                    if (c && c.length > 0) {
                        c = c.split(",");

                        var i = 0;
                        while (i + 1 < c.length) {
                            x = Math.min(x, parseInt(c[i++], 10));
                            y = Math.min(y, parseInt(c[i++], 10));
                        }
                    }
                }

                if (x === 99999) {
                    x = ep.x;
                }
                if (y === 99999) {
                    y = ep.y;
                }

                // show tooltip
                ttN.top = y;
                ttN.left = x;

                this.richTooltip = null;

                this.set('richTooltip', ttN);
            },

            /**
             * Rather than rebuild the graph we can just replace the image source (using a preLoader to avoid flashing).
             * 
             * @see mstrmojo.Widget
             * @ignore
             */
            refresh: function refresh() {
                // Have we not rendered already?
                if (!this.hasRendered) {
                    // Nothing to do.
                    return;
                }

                // Configure the slots for current display.
                configureDisplay.call(this);

                // Do we have a map and is the widget not minimized?
                var f = this.getFormats();
                if (this.mapNode && f.height && f.width) {
                    // Refresh the map.
                    this.refreshMap();
                }
            },

            /**
             * Regenerates the image map associated with the image.
             * 
             */
            refreshMap: function refreshMap() {
                // Do we have a map node?
                if (this.mapNode) {
                    // Regenerate the map.
                    generateImageMap.call(this);
                }
            },

            /**
             * This method returns the name of the shape as understood by the browser, based on the shape type returned 
             * from the server.
             * 
             * @param {Integer} shapeType The integer code for the shape type.
             *
             * @return String The type of area shape.
             */
            getAreaShapeName: function getAreaShapeName(shapeType) {
                return areaShapeMap[parseInt(shapeType, 10)] || 'default';
            }
        }
    );

    var tooltipCls = graphBase.tooltipCLS = "mstrmojo-mobileGraph-Tooltip-content",
        canvasCls = graphBase.canvasCLS = "mobile-graph-highlight-canvas";

    graphBase.hideTooltips = function () {
        // Hide all the tooltips if present.
        $ARR.forEach(document.getElementsByClassName(tooltipCls), function (tooltip) {
            tooltip.style.display = 'none';
        });

        // Clear any markers drawn on the highlight canvas.
        $ARR.forEach(document.getElementsByClassName(canvasCls), function (canvas) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        });
    };

}());