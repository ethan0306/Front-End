(function () {

    mstrmojo.requiresCls("mstrmojo.DocXtabGraph",
                         "mstrmojo.TouchScroller",
                         "mstrmojo.graph._MobileGraphAreaHelper",
                         "mstrmojo._TouchGestures");

    var $DOM = mstrmojo.dom;

    /**
     * Invokes the tooltip helper method on mstrmojo.GraphBase and provides it the element being hovered on and the location where it's at.
     *
     * @param graph (mstrmojo.MobileDocXtabGraph)
     * @param x, y The coordinates of the area element for which the user wants to see the tooltips.
     */
    function updateTooltip(graph, x, y) {
        var dpos = mstrmojo.dom.position(graph.domNode, false),
            left = 0,
            top = 0,
            node = graph.node;

        if (dpos) {
            left = dpos.x;
            top = dpos.y;
        }

        graph.model.getDataService().handleUserSingleTap(node.data.sid, node.k, x - left, y - top, false, {
            success: function (res) {
                graph.displayTooltips(res.Areas, left, top);
            }
        });

    }

    //current groupby key for graph caching.

    /**
     * Returns the current groupby key. Used for graph caching key in iphone.
     * The key is in the format
     *      $currentlayoutKey_$x where $x is
     *      $x = $groupbyKey:$groupbyLevel:$groupbyunitSelectedIndex_$x; (recursive for each group by)
     *
     */
    function getGbKey(model) {
        var gbkey = '',
            gba = [],
            currKey,
            layouts,
            currlayout,
            l,
            index,
            gb;

        if (!model) {
            return gbkey;
        }

        currKey = model.currlaykey;
        gbkey = currKey + '_';
        layouts = model.data && model.data.layouts;
        for (index = 0; index < (layouts.length || 0); index++) {
            l = layouts[index];
            if (l.k === currKey) {
                currlayout = l;
                break;
            }
        }

        if (currlayout) {
            if (currlayout.gbys) {
                gba = currlayout.gbys.groupbys;
                for (index = 0; index < (gba.length || 0); index++) {
                    gb = gba[index];
                    gbkey = gbkey + gb.k + ':' + gb.lvl;
                    if (gb.unit) {
                        gbkey = gbkey + ':' + gb.unit.idx;
                    }
                    gbkey = gbkey + '_';
                }
            }
        }
        return gbkey;
    }

    function applySelectionChange(touch) {
        //always hide the tooltip on tap
        this.displayTooltips([], 0, 0);

        var me = this,
            dataService = this.model.getDataService(),
            pos = mstrmojo.dom.position(this.domNode, true),
            x = touch.pageX - pos.x,
            y = touch.pageY - pos.y,
            callback = {
                success: function (res) {
                    var areas = res.Areas;
                    if (areas && areas.length > 0) {
                        if (areas[0].Selectable === 1) {
                            // highlight the selected areas
                            me.highlightArea(me.highlightNode, areas);

                            var defn = me.defn,
                                k = me.k;

                            me.model.slice({
                                type: parseInt(defn.t, 10) || mstrmojo.EnumRWUnitType.GRAPH,
                                src: k,
                                ck: defn.ck,
                                gk: k,
                                sid: me.node.data.sid,
                                x: x, // area.Point.X,
                                y: y,  // area.Point.Y
                                anchor: touch.target
                            });

                        }
                    }
                }
            };

        dataService.handleUserSingleTap(me.node.data.sid, me.k, x, y, true, callback);

    }

    /**
     * Sets the source of the imgNode to the supplied source value.
     * 
     * @param {String} src The new source of the image.
     * 
     * @private
     */
    function setImageNodeSrc(src) {
        var imgNode = this.imgNode;

        // Is the response different then the current src on the image node?
        if (imgNode.src !== src) {
            // Change it.
            imgNode.src = src;

            // Translate to force repaint.
            $DOM.translate(imgNode, 0, 0, 0);
        }
    }

    /**
     * <p>The widget for a single MicroStrategy Report Services Graph control on a mobile device.</p>
     *
     * @class
     * @extends mstrmojo.DocXtabGraph
     */
    mstrmojo.MobileDocXtabGraph = mstrmojo.declare(
        mstrmojo.DocXtabGraph,

        [ mstrmojo._TouchGestures, mstrmojo.graph._MobileGraphAreaHelper ],

        /**
         * @lends mstrmojo.MobileDocXtabGraph.prototype
         */
        {
            scriptClass: "mstrmojo.MobileDocXtabGraph",

            /**
             * This string denotes the markup of each area dom node in the image map.
             *
             * @type String
             */
            areaMarkup: '<area shape="{@shape}" coords="{@coords}" ttl="{@tooltip}" aid="{@aid}" {@extra}/>',

            retrieveGraphSrc: function retrieveGraphSrc(h, w) {
                var id = this.id,
                    model = this.model;

                model.getDataService().getRWGraphImage({
                    w: w,
                    h: h,
                    k: this.k,
                    sid: this.node.data.sid,
                    gbk: getGbKey(model)
                }, {
                    success: function (res) {
                        // Set the image node source to the response.
                        setImageNodeSrc.call(mstrmojo.all[id], res);
                    }
                });
            },

            invalidate: function invalidate() {
                // TQMS #555940: Clear the image node source because when this graph is shown again, it likely won't be the same anymore.
                setImageNodeSrc.call(this, '');
            },

            /**
             * @see mstrmojo._HasTooltip.
             */
            showTooltip: function showTooltip() {
                //Don't do anything. This method is triggered onmouseover and causes the tooltips to show up
                //when we don't need it.
            },

            touchSelectBegin: function touchSelectBegin(touch) {
                // Detach the browser's default touches so we can perform our own touches.
                this.restoreDefaultTouches(false);

                // Update the tooltip
                updateTooltip(this, touch.pageX, touch.pageY);
            },

            touchSelectMove: function touchSelectMove(touch) {
                //Detach the browser's default touches so we can perform our own touches.
                this.restoreDefaultTouches(false);

                //Update the tooltip as we move.
                updateTooltip(this, touch.pageX, touch.pageY);
            },

            touchTap: function touchTap(touch) {
                //Detach the browser's default touches so we can perform our own touches.
                this.restoreDefaultTouches(false);

                applySelectionChange.call(this, touch);
            }
        }
    );
}());