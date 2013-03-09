(function () {

    mstrmojo.requiresCls("mstrmojo.Widget",
                         "mstrmojo._Formattable",
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.hash");

    /**
     * <p>A widget to display HTML text (for iFrame {@see mstrmojo.DocHTMLContainer}) in the Android Platform.</p>
     *
     * @class
     * @extends mstrmojo.Widget
     *
     */
    mstrmojo.android.HTMLContainer = mstrmojo.declare(
        mstrmojo.Widget,

        // mixins,
        [ mstrmojo._Formattable, mstrmojo._HasTouchScroller, mstrmojo._TouchGestures ],

        /**
         * @lends mstrmojo.android.HTMLContainer.prototype
         */
        {
            scriptClass: "mstrmojo.android.HTMLContainer",

            markupString:   '<div id="{@id}" class="mstrmojo-HTMLContainer {@cssClass}" title="{@tooltip}" style="{@domNodeCssText}">' +
                                '<div>{@v}</div>' +
                            '</div>',

            markupSlots: {
                valueNode: function () { return this.domNode.firstChild; }
            },

            formatHandlers: {
                domNode:  [ 'RW', 'B', 'F', 'P', 'background-color', 'fx', 'text-align', 'white-space' ]
            },

            /**
             * Updates the DocTextField data that may change due to a selector action.
             *
             * @param {Object} node The widget node.
             */
            update: function update(node) {
                var d = node.data,
                    v = d.v || '';

                // Decode the value.
                var div = document.createElement('div');
                div.innerHTML = '<textarea>' + v + '</textarea>';
                v = '<div style="display:none">&nbsp;</div>' + div.firstChild.value + '&nbsp;';     // Second nbsp; is to ensure that we can scroll to the bottom.

                // Kill element.
                div = null;

                // Store value on instance.
                this.v = v;
                
                // Is there a threshold?
                if (this.thresholdId || d.tid) {
                	// Kill the format
                	delete this.fmts;
                }

                // Store threshold ID.
                this.thresholdId = d.tid;

                // Overwrite scroller config for re-renders.
                this.scrollerConfig = {
                    bounces: false,
                    showScrollbars: false
                };
            },

            /**
             * Overridden to execute scripts.
             *
             * @ignore
             */
            postBuildRendering: function postBuildRendering() {

                // Grab collection of script tags within html container.
                var scripts = this.domNode.getElementsByTagName('script'),
                    len = scripts.length,
                    i;

                for (i = 0; i < len; i++) {
                    // Eval each script text.
                    eval(scripts[i].innerHTML);
                }

                return this._super();
            },

            updateScrollerConfig: function updateScrollerConfig() {
                var cfg = this._super(),
                    scrollEl = this.valueNode,
                    domNode = this.domNode,
                    fmts = this.getFormats(),
                    iterator = {
                        'Height': {
                            a: 'y',
                            s: 'v'
                        },
                        'Width': {
                            a: 'x',
                            s: 'h'
                        }
                    },
                    offset = {};

                // Add the scrollEl to the scroll config.
                cfg.scrollEl = scrollEl;

                mstrmojo.hash.forEach(iterator, function (info, dimension) {
                    // Is scrolling disabled in this direction?
                    if (cfg['no' + info.s.toUpperCase() + 'Scroll']) {   // 'noHScroll' or 'noVScroll'.
                        // Nothing to do.
                        return;
                    }

                    // Get widget size for this dimension.
                    var widgetSize = parseInt(fmts[dimension.toLowerCase()], 10);

                    // Do we not have a fixed widget size?
                    if (isNaN(widgetSize)) {
                        // Retrieve widget size from the domNode.
                        widgetSize = domNode['client' + dimension];
                    }

                    // Calculate offset end (scroll element node dimension size minus widget dimension size).
                    var offsetEnd = Math.max(scrollEl['offset' + dimension] - widgetSize, 0),
                        enableDimensionScroll = cfg[info.s + 'Scroll'] = (offsetEnd !== 0);

                    // Can we scroll in this dimension?
                    if (enableDimensionScroll) {
                        // Add offset value for appropriate axis.
                        offset[info.a] = {
                            start: 0,
                            end: offsetEnd
                        };
                    }
                });

                // Add computed offset to config.
                cfg.offset = offset;

                // Add origin, initializing to 0,0 if we don't have one.
                cfg.origin = cfg.origin || {
                    x: 0,
                    y: 0
                };

                return cfg;
            }

        }
    );

}());