(function () {
    /**
     * <p>Determines whether or not to render a section.</p>
     *
     * <p>Section is rendered only if its top y coordinate is above the viewport's bottom and one of the following conditions is met:</p>
     *
     * <ol>
     *     <li>the section is vertical, or</li>
     *     <li>it is a left-most horiz section, or</li>
     *     <li>t is a horiz section directly to the left of the viewport (meaning, its x coordinate is left of the viewport's right edge, and its vertical range intersects the viewport's vertical range).</li>
     * </ol>
     *
     * @param {Integer} x
     * @param {Integer} y
     * @param {Integer} left
     * @param {Integer} right
     * @param {Integer} top
     * @param {Integer} bottom
     * @param {Boolean} orH True if the section is a horizontal section.
     *
     * @private
     * @ignore
     */
    function _shouldRenderSec(x, y, left, right, top, bottom, orH) {
        if (y > bottom) {
            return false;
        }
        return (!orH) ||
            (x === 0) ||
            // TO DO: how can we tell if the section's vertical range intersects the viewport?
            // Do we know the section's height?
            // For now, hack: we assume its height is at most the height of the viewport.
            ((x < right) && (y >= top - (bottom - top)));
    }

    /**
     * <p>Determines whether or not to render a subsection.</p>
     *
     * <p>Subsection is rendered only if its top y coordinate is above the viewport's bottom and one of the following conditions is met:</p>
     * <ol>
     *     <li>the section is vertical, or</li>
     *     <li>it is a horiz section directly to the left of the viewport (meaning, its x coordinate is left of the viewport's right edge, and its vertical range intersects the viewport's vertical range).</li>
     * </ol>
     *
     * @param {mstrmojo.Subsection}
     * @param {Integer} x
     * @param {Integer} y
     * @param {Integer} left
     * @param {Integer} right
     * @param {Integer} top
     * @param {Integer} bottom
     * @param {Boolean} orH True if the section is a horizontal section.
     *
     * @private
     * @ignore
     */
    function _shouldRenderSub(ss, x, y, left, right, top, bottom, orH) {
        if (y > bottom) {
            return false;
        }

        // TO DO: when the subsection height is auto (canShrink/Grow), how can we tell if the vertical range intersects?
        return (!orH) || ((x < right) && (y >= top - ss.height()));
    }

    /**
     * <p>Instructs a given widget (either a section or subsection) to render itself.</p>
     *
     * <p>The widget's renderMode is set to "scroll" before rendering. If requested, the widget is then asked
     * to build its children (without rendering them).  The numChildrenRendered property of the widget and its given parent are updated.</p>
     *
     * @param {mstrmojo.Widget} w The mstrmojo.Widget to render.
     * @param {mstrmojo.Container} parent The widgets parent.
     * @param {Boolean) bBuildCh
     */
    function _fireRender(w, parent, bBuildCh) {
        // By setting the renderMode to 'scroll' we are telling it not to render its children yet.
        w.renderMode = "scroll";
        w.render();
        w.numChildrenRendered = 0;
        parent.numChildrenRendered++;

        // Should we build the widget children, and are children NOT already built?
        if (bBuildCh && !w.builtChildren) {
            w.buildChildren();
        }
    }

    /**
     * Checks if we want to use the scroll buffer while incrementally rendering the document.
     *
     * @return (Integer) Zero for initial rendering and for subsequent scroll renderings - use the defined scroll buffer;
     */
    function getScrollBuffer() {
        return this.useScrollBuffer ? this.scrollBuffer : 0;
    }

    /**
     * <p>A mixin for rendering children as the document is scrolled horizontally and/or vertically.</p>
     *
     * @class
     * @public
     */
    mstrmojo._CanRenderDocOnScroll = mstrmojo.provide(
        "mstrmojo._CanRenderDocOnScroll",
        {
            _mixinName: 'mstrmojo._CanRenderDocOnScroll',

            /**
             * Sets the widget renderMode to "scroll".
             * @type String
             * @ignore
             */
            renderMode: 'scroll',

            /**
             * The scroll buffer allows a buffer of objects to be rendered past the bottom of the scroll position. This allows for content to be pre-rendered as the document is scrolled.
             */
            scrollBuffer: 0,

            /**
             * <p>For non-null renderMode, suppresses the {@link mstrmojo._HasBuilder} code that auto-builds all of a widget's
             * children after that widget is rendered.</p>
             *
             * @ignore
             */
            postBuildRendering: function postBuildRendering() {
                if (this.renderMode === null) {
                    return this._super();
                } else {
                    this.renderChildren();
                    return true;
                }
            },

            /**
             * <p>For non-null renderMode, suppresses the code that auto-renders a child when it is added to this widget.</p>
             *
             * @ignore
             */
            childRenderOnAddCheck: function (children) {
                if (this.renderMode === null) {
                    return this._super(children);
                } else {
                    return false;
                }
            },

            /**
             * <p>Extends the inherited "renderChildren" method to enable this mixin's on-demand rendering system when renderMode is not null.</p>
             *
             * <p>Searches for a scrollbox in this container (or an ancestor thereof) to drive the rendering.
             * If not found, ignores renderMode and defaults to inherited rendering behavior; otherwise if
             * scrollbox found, renders a first block of children and then (possibly) kicks off a thread to
             * handle pending children (if any).</p>
             *
             * @ignore
             */
            renderChildren: function renderChildren() {

                var own;

                if (this.renderMode === "scroll") {
                    // This renderMode requires a scrollbox to drive the rendering. The scrollbox could
                    // belong to this widget, or an ancestor thereof.  Find it.
                    var anc = this;
                    while (anc) {
                        if (anc.scrollboxNode && (anc.scrollboxWidthFixed || anc.scrollboxHeightFixed) && anc.connectScrollbox) {
                            own = anc;
                            break;
                        }
                        anc = anc.parent;
                    }
                }

                // If rendering on scroll is turned off, or we don't have a scrollbox to drive the rendering,
                // then we must fall back to the inherited default rendering behavior.
                if ((this.renderMode !== "scroll") || !own) {
                    this._super();
                    return;
                }

                if (this.containerNode) {
                    // We have a scrollbox to drive this rendering, and we have a slot for rendering children.
                    // Wire up its scroll events to our onscroll handler.
                    this.scrollboxOwner = own;
                    own.connectScrollbox(this);

                    // Record how many children we have.
                    this.numChildrenRendered = 0;
                    var len = this.numChildren;
                    if (len === undefined) {
                        // Ask the model for the total count of children to be built.
                        this.numChildren = len = this._getModelChildNodes(this.node, false, 0, 0, true).total;
                    }

                    // Performance optimization: Keep track of how many sections & subsections have not
                    // been rendered yet.
                    this.sectionsToRender = len;
                    this.subsectionsToRender = 0;

                    // If we have children (either already built or not), let's start rendering them.
                    if (len) {
                        this._startSubsectionThread(false);
                    }
                }
                if (this.resizeOrReposition) {
                    this.resizeOrReposition();
                }
            },

            /**
             * <p>This handler is notified whenever a scroll event is heard from the scrollbox DOM node that is
             * driving this on-demand rendering.</p>
             *
             * <p>It responds by triggering on-demand rendering, if it is not already in progress.</p>
             */
            onscroll: function onscroll() {
                if (!this.renderingSubsections) {
                    //Set a flag to render up to the extra scroll buffer.
                    this.useScrollBuffer = true;

                    this._startSubsectionThread(true);
                }
            },

            /**
             * <p>Fires intervals for rendering.</p>
             *
             * @private
             */
            _startSubsectionThread: function _stSbsThd(/*Boolean*/ bPauseBeforeCtls) {
                // Reference to this for inner functions.
                var me = this;

                // Utility function for clearing an interval or timeout (including the property that contains the handle).
                var fnClearIntv = function (n, bIsTimeout) {
                    if (me[n]) {
                        if (bIsTimeout) {
                            self.clearTimeout(me[n]);
                        } else {
                            self.clearInterval(me[n]);
                        }
                        delete me[n];
                    }
                };

                // Post-processing to be done after the subsections interval has completed.
                // This function will trigger the rendering of the controls within the viewport.
                var fnCleanUp = function (/*Boolean*/ bPause) {
                    me.renderingSubsections = false;
                    var fn = function () {
                            fnClearIntv('renderCtlsTimer');
                            me.showRenderStatus(false);
                            me.renderCtrlsInViewport();
                            //TQMS 490160 For touch scrollers we need to update scroller after incremental rendering as real document size
                            //can change
                            me.raiseEvent({name: 'afterScroll'});
                            me = null;
                        };
                    if (bPause) {
                        me.renderCtlsTimer = self.setTimeout(
                            fn,
                            me.scrollboxOwner.scrollInterval + 1
                        );
                    } else {
                        fn();
                    }
                };

                // If a previous interval or timeout was in progress, kill it first.
                fnClearIntv('renderSubsTimer');
                fnClearIntv('renderCtlsTimer', true);

                this.renderingSubsections = true;

                // Performance optimization: if all sections and subsections are rendered,
                // don't bother walking them; just process the controls.
                if ((this.sectionsToRender || this.subsectionsToRender) && !this._renderSubsectionsToScroll()) {
                    this.showRenderStatus(true);
                    this.renderSubsTimer = self.setInterval(
                        function () {
                            if (me._renderSubsectionsToScroll()) {
                                fnClearIntv('renderSubsTimer');
                                fnCleanUp(bPauseBeforeCtls);
                            } else {
                                me.showRenderStatus(true);
                            }
                        },
                        this.scrollboxOwner.scrollInterval
                    );
                } else {

                    fnCleanUp(bPauseBeforeCtls);
                }
            },

            /**
             * <p>Toggles a GUI to indicate progress of rendering.</p>
             *
             * <p>This implemented by calling a method of the parent, which actually owns the status GUI.  This method simply
             * passes along status data to that GUI in the parent (if any).</p>
             *
             * @param {Boolean} show Whether to show the rendering status message.
             * @param {String} msg The message to display.  Note: this message will be overridden with rendering progress if 'show' parameter was true.
             */
            showRenderStatus: function shwRndrSts(show, msg) {
                var p = this.parent;
                if (!p || !p.showStatus) {
                    return;
                }

                var txt = msg,
                    per;
                if (show) {
                    // Show render status indicator (if any).
                    var num = this.numChildrenRendered,
                        tot = this.numChildren;

                    per = tot && parseInt(100 * num / tot, 10);
                    txt = "*Rendering section " + num + " of " + tot + ".*";    // TODO: Need descriptor.
                }
                p.showStatus(show, txt, per);
            },

            /**
             * <p>Steps through sections and subsections and renders them if they are visible within the scrollbox.</p>
             *
             * @type Boolean
             * @private
             * @returns True if all subsections above (or to the left) of the scroll bottom (or right) are rendered.
             */
            _renderSubsectionsToScroll: function rndSubs2Scll() {
                var own = this.scrollboxOwner,
                    top = own.scrollboxTop,
                    left = own.scrollboxLeft,
                    bottom = own.scrollboxBottom + getScrollBuffer.call(this),
                    right = own.scrollboxRight,
                    height = bottom - top,
                    x = 0,
                    y = 0,
                    yStart = null,
                    yStop = null,
                    forcedH, sidx;

                // Utility that records the y coordinate we started rendering at.
                function _updateStart() {
                    yStart = y;
                    yStop = yStart + height;
                }

                var secsCount = this.numChildren,
                    secs = this.children || [],
                    model = this.model,
                    node = this.node,
                    orH = false;        // Boolean to indicate if the current section is horizontal.

                // Step through all sections.
                for (sidx = 0; sidx < secsCount; sidx++) {

                    // Inspect the next section.
                    var sec = secs[sidx];
                    if (!sec) {
                        // The next section has not been built yet; build it now.
                        sec = this.addChildren(this.builder.build(
                            this._getModelChildNodes(node, false, sidx, 1, true).nodes,
                            model
                        ))[0];
                        // Refresh handle to children array in case the addChildren() call reset the object reference.
                        secs = this.children || [];
                    }

                    // Cache the old orientation.
                    var orWas = orH;

                    // Is it a horizontal section?
                    orH = !!sec.defn.horiz;

                    //Forcing the render of a new horizontal group if the section is marked as the
                    //begining of an horizontal section and it is not the first section.
                    forcedH = (sidx > 0 && sec.node.data.bh);

                    // Is it the first vertical section following a group of horiz sections?
                    //Or is it a new group of horizontal sections after another horizontal section?
                    if ((!orH && orWas) || (forcedH && orWas)) {
                        // Reset the horizontal coordinate.
                        x = 0;

                        // Increment the y coordinate by the previous section's height.
                        y += secs[sidx - 1].height();

                        // Should we stop rendering now?
                        if (y > bottom) {
                            // We've reached the bottom of the viewport, so our walk is done.
                            return true;

                        } else if ((yStop !== null) && (y > yStop)) {
                            // We haven't reached the bottom of the viewport, so our walk is not done,
                            // but we've reached our rendering limit, so we must abort and exit incomplete.
                            return false;
                        }
                    }

                    // It's not below the viewport. Is it not rendered yet?
                    if (!sec.hasRendered) {
                        // Should we render it now?
                        if (!_shouldRenderSec(x, y, left, right, top, bottom, orH)) {
                            // We should not render.  Skip or abort walk altogether?
                            if (orH) {
                                // Section is horiz, so continue to next section (which may be vertical or horiz).
                                continue;
                            } else {
                                // Section is vert, so we are done walking.
                                return true;
                            }
                        }

                        this._renderSection(sec, sidx);

                        this.sectionsToRender--;
                        this.subsectionsToRender += (sec.children && sec.children.length) || 0;

                        // If this is our first render, record the y coordinate we began rendering at.
                        if (yStart === null) {
                            _updateStart();
                        }
                    }

                    // Section has been rendered. Walk the section's subsections.
                    var ssch = sec.children || [],
                        ss = null,
                        ssidx, sslen;

                    for (ssidx = 0, sslen = ssch.length; ssidx < sslen; ssidx++) {
                        // Cache the subsection.
                        ss = ssch[ssidx];
                        // Is the subsection not yet rendered?
                        if (!ss.hasRendered) {
                            if (!_shouldRenderSub(ss, x, y, left, right, top, bottom, orH)) {
                                // Should not render it.  Skip remaining subsections in this section, or abort walk altogether?
                                if (orH) {
                                    // Horiz subsection. Stop walking subsections, move on to next section (possibly vertical).
                                    break;
                                } else {
                                    // Vert subsection. We are done with our walk.
                                    return true;
                                }
                            }
                            // Render the subsection now.
                            _fireRender(ss, sec);
                            this.subsectionsToRender--;
                            // If this is our first render, record the y coordinate we began rendering at.
                            if (yStart === null) {
                                _updateStart();
                            }
                        }
                        // Subsection is rendered.
                        // Increment our coordinate by the subsection's size,
                        // and check if we should continue rendering.
                        if (orH) {
                            x += ss.width();
                            // If we've reached the right edge of the viewport, stop walking these subsections
                            // and continue to the next section (which may be vertical).
                            if (x > right) {
                                break;
                            }
                        } else {
                            y += ss.height();
                            // Should we stop rendering now?
                            if (y > bottom) {
                                // We've reached the bottom of the viewport, so our walk is done.
                                return true;
                            } else if ((yStop !== null) && (y > yStop)) {
                                // We haven't reached the bottom of the viewport, so our walk is not done,
                                // but we've reached our rendering limit, so we must abort and exit incomplete.
                                return false;
                            }
                        }
                    }    // end for-loop walk of subsections
                } // end for-loop walk for sections

                // We've finished our walk, we are done for these viewport coordinates.
                return true;
            },

            _renderSection: function _renderSection(sec, sidx) {
                // Render the section now, and ask it to build (but not render) its children so we can inspect their sizes.
                _fireRender(sec, this, true);
            },

            /**
             * Returns children nodes from model. Default would return all child nodes.
             */
            _getModelChildNodes: function (node, isPartial, start, count, includeTotal) {
                return this.model.getChildren(node, isPartial, start, count, includeTotal);
            },
            /**
             * Renders any controls inside subsections that are within the current viewport that haven't rendered yet.
             *
             */
            renderCtrlsInViewport: function rnCtlsInVw() {
                var own = this.scrollboxOwner,
                    top = own.scrollboxTop,
                    left = own.scrollboxLeft,
                    bottom = own.scrollboxBottom + getScrollBuffer.call(this),
                    right = own.scrollboxRight,
                    x = 0,
                    y = 0,
                    orH = false,
                    secs = this.children || [],
                    orWas,
                    forcedH, sidx, secCount;

                /**
                 * Utility function for updating height or width.
                 *
                 * @param {mstrmojo.Subsection} ss The subsection to be measured.
                 *
                 * @inner
                 * @ignore
                 */
                var fnIncSize = function (ss) {
                    if (orH) {
                        x += ss.width();
                    } else {
                        y += ss.height();
                    }
                };

                /**
                 * Determines if the given control intersects with the part of the subsection that is visible in the viewport.
                 *
                 * @param {Integer} s The beginning point of the subsection (left or top).
                 * @param {String} cx The start point of the control in pixels (left or top).
                 * @param {String} cs The size of the control in pixels (height or width).
                 * @param {Integer} vs The start point of the view port (left or top).
                 * @param {Integer} ve The ending point of the view port (right or bottom).
                 *
                 * @inner
                 * @ignore
                 * @refactoring This function assumes the controls values are in pixels.  We need to look into supporting inches.
                 */
                var fnCtlInt = function (s, cx, cs, vs, ve) {
                    // Convert control properties to integers.
                    cx = parseInt(cx, 10) || 0;
                    cs = parseInt(cs, 10);

                    return (isNaN(cs)) ? (s + cx <= ve) : mstrmojo.boxmodel.rangeIntersect(s + cx, s + cx + cs, vs, ve);
                };

                // Walk the subsections, looking for those within the vertical scroll range of the viewport.
                for (sidx = 0, secCount = (secs && secs.length) || 0; sidx < secCount; sidx++) {
                    var sec = secs[sidx];
                    // Cache the old orientation.
                    orWas = orH;

                    // Is it a horizontal section?
                    orH = !!sec.defn.horiz;

                    //Forcing the render of a new horizontal group if the section is marked as the
                    //begining of an horizontal section and it is not the first section.
                    forcedH = (sidx > 0 && sec.node.data.bh);

                    // Is it the first vertical section following a group of horiz sections?
                    //Or is it a new group of horizontal sections after another horizontal section?
                    if ((!orH && orWas) || (forcedH && orWas)) {
                        // Reset the horizontal coordinate.
                        x = 0;
                        // Increment the y coordinate by the previous section's height.
                        y += secs[sidx - 1].height();
                        // Should we stop rendering now?
                        if (y > bottom) {
                            // We've reached the bottom of the viewport, so our walk is done.
                            return;
                        }
                    }

                    // Is this section rendered? If not, assume it is beyond the viewport.
                    if (!sec.hasRendered) {
                        if (!orH) {
                            return;    // Vertical. Must be too low; we are done rendering.
                        } else {
                            continue;    // Horizontal. Must be too far right; continue on to next section.
                        }
                    }
                    // Section is rendered. Is this a vertical section?
                    var subs = sec.children,
                        ssCount = (subs && subs.length) || 0,
                        ssidx,
                        ss;

                    //  Walk across the subsections, checking each's vertical & horiz range.
                    for (ssidx = 0; ssidx < ssCount; ssidx++) {
                        ss = subs[ssidx];
                        if (!ss.hasRendered) {
                            break;    // Must be beyond range; move on to next section.
                        }

                        // Have all the controls been rendered yet?
                        if (ss.builtChildren && (ss.numChildrenRendered === ((ss.children && ss.children.length) || 0))) {
                            // All children rendered.  Increment move on to next subsection.
                            fnIncSize(ss);

                        } else {
                            // Does the subsection intersect the viewport's range?
                            if ((y + ss.height() >= top) && (!orH || (x + ss.width() >= left))) {

                                // If the subsection's children have not been built yet, built them now.
                                var chdn = ss.children,
                                    chLen = (chdn && chdn.length) || 0;

                                if (!chLen && !ss.builtChildren) {
                                    ss.buildChildren();
                                    chdn = ss.children;    // Reset children collection...
                                    chLen = (chdn && chdn.length) || 0; // and length.
                                }

                                // Collection of children that are being rendered now.
                                var rc = [],
                                    i;

                                // Walk the children, searching for unrendered controls that intersect the viewport.
                                for (i = 0; i < chLen; i++) {
                                    var c = chdn[i];
                                    if (c.hasRendered) {
                                        continue;
                                    }

                                    var cf = c.getFormats() || {};
                                    // Does the control intersect both horizontally and vertically?
                                    if (fnCtlInt(y, cf.top, cf.height, top, bottom) && fnCtlInt(x, cf.left, cf.width, left, right)) {
                                        c.render();
                                        rc.push(c);
                                    }
                                }

                                // Tell the subsection to do CanGrow/CanShrink for the rendered controls.
                                ss.performCanGrowCanShrink(rc, true);
                            }

                            // Increment x coord and move on to next subsection.
                            fnIncSize(ss);
                        }

                        if ((orH && x > right) || (!orH && y > bottom)) {
                            break;    // Too far; move on to next section.
                        }
                    }
                }
            },

            /**
             * Extends the inherited method in order to disconnect from the scrollbox that
             * was connected in the renderChildren method.
             */
            unrender: function unrdr(ignoreDom) {
                var own = this.scrollboxOwner;
                if (own) {
                    own.disconnectScrollbox(this);
                }
                this._super(ignoreDom);
            }
        }
    );
}());