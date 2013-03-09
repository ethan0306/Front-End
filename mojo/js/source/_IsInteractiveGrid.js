(function () {

    mstrmojo.requiresCls(
        "mstrmojo.dom",
        "mstrmojo.array",
        "mstrmojo.hash",
        "mstrmojo.StickySections"
    );

    var $D = mstrmojo.dom,
        $THEMES = [ 'white', 'black', 'transparent', 'gray'],
        $SELECTED_ROW = "ig-selected-row";

    /**
     * Returns whether the Interactive Grid is displayed as a fullscreen widget. As of now, IG on a layout and reports set up
     * as IG are displayed full screen.
     */
    function isIGFullscreen() {
        return (this.isFullScreenWidget || !this.isDocXtab);
    }


    /**
     * If the Interactive Grid does not have default properties set on it, we need to create default properties. By default, we'll
     * always have two columns. One for the attributes and one for the metrics.
     */
    function setupDefaultProps() {
        var DAF_DELIMITER = ":",
            gd = this.gridData,
            gts = gd.gts,
            row = gts.row,
            firstTitle = row[0],
            vp = {
                // Banding property - Defaults to false
                bn: "0",

                // Grouping property - Defaults to false*
                gr: "0",

                // Automatic Column Resiging - Defaults to true
                ar: "1",

                // Color Theme - Defaults to Black
                ct: "1",

                // Default Attribute form in the form of [title id + ":" + title form id] - Defaults to the first title.
                daf: firstTitle.id + DAF_DELIMITER + firstTitle.fid,

                // The columns property which refers to how the columns on the Interactive Grid are grouped.
                cols: {
                    //Default column widths
                    cws: [{ w: "50"}, {w: "50"}],
                    cg: {
                        cgc: 2
                    }
                }
            },
            cg = vp.cols.cg,
            gdAxis = ['row', 'col'],
            gdES = [gts.row, gts.col[0].es];

        mstrmojo.array.forEach(['0', '1'], function (idx) {
            var axis = gdAxis[idx],
                i;

            //Set the default column properties.
            cg[idx] = {
                //Is the column toggleable? Defaults to true.
                tg: true,

                //Set the number of elements would we have in the column?
                cl: gdES[idx].length,

                //The current column shown in the interactive grid.
                cc: 0,

                //Default show headers to true.
                sh: true
            };

            //For metrics we need to provide the metrics index.
            if (axis === 'col') {
                for (i = 0; i < gdES[idx].length; i++) {
                    cg[idx]['mix' + i] = i;
                }
            } else {
                cg[idx].attForms = [];
                for (i = 0; i < gdES[idx].length; i++) {
                    cg[idx].attForms[i] = {idx: i, n: ''};
                }
            }
        });

        //Set the column groups
        this.gridData.vp = vp;
    }

    /**
     * Returns the table rows that belongs to the same stacked row
     */
    function findStackedCells(tr, trs) {
        var c, i, iLen, cn,
            //using directions to get the tr siblings to find the stacked row css
            findTR = function (direction, row, collection) {
                var j, jLen, r = row[direction + 'Sibling'], cell;
                if (r) {
                    for (j = 0, jLen = r.cells.length; j < jLen; j++) {
                        cell = r.cells[j];
                        if ((direction === 'next' && /stack-bottom/.test(cell.className)) || (direction === 'previous' && /stack-top/.test(cell.className))) {
                            collection.push(r);
                            return;
                        }
                    }

                    collection.push(r);
                    findTR(direction, r, collection);
                }
            };

        //always save the starting tr into the array
        trs.push(tr);
        for (i = 0, iLen = tr.cells.length; i < iLen; i++) {
            c = tr.cells[i];
            cn = c.className;
            //if we have stack css
            if (/stack/.test(cn)) {
                //if the td cell has stack-top css, search next sibling until hits next stack-top
                if (/stack-top/.test(cn)) {
                    findTR('next', tr, trs);
                    break;
                //if the td cell has stack-bottom css, search previous sibling until hits next stack-bottom
                } else if (/stack-bottom/.test(cn)) {
                    findTR('previous', tr, trs);
                    break;
                //if stack-middle, search both directions.
                } else if (/stack-middle/.test(cn)) {
                    findTR('next', tr, trs);
                    findTR('previous', tr, trs);
                    break;
                }
            }
        }

        return trs;
    }

    function addSelection(rows) {
        mstrmojo.array.forEach(rows, function (row) {
            //Add a selected CSS class to the row.
            mstrmojo.css.addClass(row, $SELECTED_ROW);
        });
    }

    function removeSelection() {
        //Remove the selection from the other cells after a 100ms
        var rows = mstrmojo.hash.copy(document.getElementsByClassName($SELECTED_ROW));

        mstrmojo.array.forEach(rows, function (row) {
            mstrmojo.css.removeClass(row, $SELECTED_ROW);
        });
    }

    /**
     * Helper method to perform action on the interactive grid
     *
     * @param target The HTML node being targeted by the user
     *
     * @return Boolean Whether or not we've handled the action.
     */
    function handleAction(target) {
        // Find the cell that was clicked on
        var td = $D.findAncestorByAttr(target, 'ei', true, this.domNode),
            node = td && td.node,
            cell = this.getCellForNode(node);

        //Is it a grouping section? Then we should ignore it. Return true so we don't process it anymore.
        if (node && node.className.indexOf('iggroup') > 0) {
            return true;
        }

        //Is this is an Interactive Grid? Then check if the user wants to toggle
        if (this.isInteractiveGrid() && this.igToggle(cell)) {
            //If yes, then the user clicked on a toggle-able cell.
            return true;
            //If not, we want to continue what we were doing ...
        }

        //Show the selected animation for cell within the data part of the interactive grid.
        if ($D.contains(this._BR, target)) {
            //Remove and lingering selections.
            removeSelection();

            //Select the corresponding IG row.
            addSelection(findStackedCells($D.findAncestorByName(target, 'tr', true), []));
        }

        return false;
    }

    /**
     * This mixin adds as an add-on to mstrmojo.MobileXtab where it converts the regular looking Xtab to an interactive grid.
     * It cannot be used by itself and has to be mixed in to any mobile flavor of Xtab.
     *
     * @class
     * @public
     */
    mstrmojo._IsInteractiveGrid = mstrmojo.provide(
        "mstrmojo._IsInteractiveGrid",
        /**
         * @lends mstrmojo._IsInteractiveGrid
         */
        {
            _mixinName: 'mstrmojo._IsInteractiveGrid',

            /**
             * Custom Class for Interactive Grid.
             */
            cssClass: 'mstrmojo-InteractiveGrid',

            /**
             * Should not show magnifier on interactive grid.
             */
            enableMagnifier: false,
            
            /**
             * Overwrite the scrollerConfig property to ensure we can't scrollPast.
             */
            scrollerConfig: {
                scrollPast: false
            },

            /**
             * This method denotes whether the current grid has has an Interactive Grid visualization
             * set on it.
             *
             *  @return boolean If it is an interactive grid.
             */
            isInteractiveGrid: function () {
                return (this.gridData.vp && this.gridData.vp.cols) ? true : false; // TODO: we should check for the actual vis name as cols can be empty
            },

            preBuildRendering: function preBuildRendering() {
                //if the grid is empty grid, skip the interactive grid configurations.
                if (this.gridData.eg) {
                    return this._super();
                }

                //If we do not have the interactive grid's viz properties, we need to setup default properties that create a default structure.
                if (!this.isInteractiveGrid()) {
                    setupDefaultProps.call(this);
                }

                var me = this,
                    parent = this.parent,
                    setProp = function (propName) {
                        me[propName] = me[propName] || ((parent && parent[propName]) ? parent[propName] : 480);
                    };

                //Set the correct height and width...
                setProp('height');
                setProp('width');

                //Reflect on the Color theme set on the Interactive Grid
                var theme = isNaN(this.gridData.vp.ct) ? 1 : parseInt(this.gridData.vp.ct, 10);

                //Update the cssClass to address the interactive grid's theme.
                this.cssClass = "mstrmojo-InteractiveGrid " + $THEMES[theme];

                //Set the overflow
                this.scrollboxNodeOverflow = 'overflow:hidden;';

                var returnVal = (this._super ? this._super() : true);

                this.cssDefault = (this.cssDefault === "") ? "r-cssDefault" : "";

                return returnVal;
            },

            /**
             * Returns the Xtab's view key if the Interactive Grid visualization is set at the layout level.
             *
             * @returns the Xtab's key.
             */
            getKey: function getKey() {
                return this.gridData.k;
            },

            /**
             * Extends (mstrmojo.Container)
             *
             * This method calculates the column widths for Interactive Grids before calling the Container's render children
             * and then creates a new sticky section widget if the Interactive Grid has grouping sections.
             */
            renderChildren: function renderChildren() {
                //Calculate the column widths based on the widget width...
                this.prepareCWSCalculation();

                //Render children...
                if (this._super) {
                    this._super();
                }

                //Creates sticky sections if we have grouping rows...
                this.createStickySections();
            },

            /**
             * Extends MobileXtab method to enable use dom to calculate offsets when grouping is enabled.
             */
            useDomToCalculateOffsets: function useDomToCalculateOffsets() {
                var cp = this.zones._BR.cp;
                if (cp && (cp.groupEnabled || cp.stackLevels > 1)) {
                    return true;
                } else {
                    return (this._super || this._super()) || false;
                }
            },

            /**
             * The method set the gridWidth property on the zones' content providers
             */
            prepareCWSCalculation: function prepareCWSCalculation() {
                var fmts = this.getFormats && this.getFormats(),
                    //For interactive grid visualization set at the template level in documents, we want to retreive the width from the formats.
                    width = (!isIGFullscreen.call(this)) ? parseInt(fmts.width, 10) : parseInt(this.width, 10);

                //Set the column width to the adjusted column width.
                this.zones._BR.cp.gridWidth = width;
                this.zones._TR.cp.gridWidth = width;
            },

            /**
             * This method creates a new sticky section widget (mstrmojo.StickySections) on the Interactive Grid's TopRight zone only if it has grouping sections
             * That is if there are more than 2 attributes in the row headers.
             */
            createStickySections: function createStickySections() {
                var gd = this.gridData,
                    fmts = this.getFormats && this.getFormats();

                //Do we have grouping sections?
                if (this.isInteractiveGrid() && (gd.vp.gr === '1' && gd.gts.cws.length > 1)) {
                    //Dynamically add the file.
                    mstrmojo.requiresCls("mstrmojo.StickySections");

                    //Yes, then we need a new child which will provide the sticky sections functionality..
                    var node = this._TR,
                        slotName = 'stickySections';

                    //Add a slot for out new widget..
                    this.addSlots({ stickySections: node });

                    //Have we not already created the widget?
                    if (!this.ss) {
                        var cell = this.zones._BR.cp.getResolvedGroupHeader(0, 0),
                            cssClass = "iggroup xtab-td",
                            //For interactive grid visualization set at the template level in documents, we want to retreive the width from the formats.
                            width = (!isIGFullscreen.call(this)) ? (parseInt(fmts.width, 10) + 'px') : '100%',
                            cssText = "width: " + width + ";z-index: 2; position: relative;margin-bottom:-31px;";

                        //Create a new sticky section widget...
                        this.ss = new mstrmojo.StickySections({
                            currentSectionTitle: cell.n || cell.v,
                            cssClass: cssClass,
                            slot: slotName,
                            cssText: cssText
                        });

                        this.addChildren(this.ss);
                    }
                }
            },

            /**
             * Overrides the performAction method. See (mstrmojo.MobileXtab)
             *
             * It lets the grid toggle through it's column headers in addition to what the
             * MobileXtab allows.
             *
             * @return boolean True if it performed the toggle action, false if it did not and wants the
             * child to handle the default action.
             */
            performAction: function performAction(touch) {
                //Handle the action.
                return handleAction.call(this, touch && touch.target) || (this._super && this._super(touch));
            },

            /**
             * This method performs the toggle action for Interactive Grids. It performs the action
             * only on coloumn headers which are metrics (and if they can be toggle-able). It takes
             * in a cell parameter which is a Javascript Object that represents the cell being clicked.
             *
             * @param {Object} cell An Object represenation of the clicked cell.
             *
             * @return boolean True if it performed the toggle action, false if it did not and wants the
             * child to handle the default action.
             */
            igToggle: function igToggle(cell) {
                //Is it an interactive grid?
                if (!this.isInteractiveGrid() || !cell) {
                    return false;
                }

                var e = cell && cell._e,
                    otp = cell.otp || e.otp;

                if (otp) {
                    var i,
                        j,
                        cols = this.gridData.vp.cols,
                        cg = cols.cg,
                        mix = cell.mix,
                        OBJECT_TYPE_METRIC = 4,
                        OBJECT_TYPE_ATTR = 12,

                        /**
                         * This function grabs the collection of columns associated with a single column group and adjusts the column widths
                         * accordingly in order to simulate a toggle effect.
                         */
                        adjCol = function (currentCol, colPos) {
                            var _return = false;

                            //Do we have toggle enabled on the column? We want to goggle only if the clicked column group has more than one column
                            if (currentCol.tg && currentCol.cl > 1) {
                                var cc = currentCol.cc,
                                    cur = currentCol.cc,
                                    start = 0,
                                    end = currentCol.cl,
                                    diff = currentCol.cc = (++cur >= (end + start)) ? start : cur,
                                    colgroup = [this._TR.getElementsByTagName('COLGROUP')[0], this._BR.getElementsByTagName('COLGROUP')[0]];

                                //Loop through colgroup tag nodes in the TopRight and BottomRight zones
                                mstrmojo.array.forEach(colgroup, function (c) {
                                    var wPx = c.childNodes[colPos + cc].style.width;

                                    c.childNodes[colPos + cc].style.width = '1px';
                                    c.childNodes[colPos + diff].style.width = wPx;
                                });

                                _return = true;
                            }

                            return _return;
                        },
                        currentCol,
                        attFm,
                        count = 0,
                        returnVal = false;

                    if (cell && cell.otp === OBJECT_TYPE_ATTR) {
                        for (i = 0; i < cg.cgc; i++) {
                            currentCol = cg[i];
                            attFm = currentCol.attForms;

                            //Find the proper column group where the cell belongs to.
                            if (attFm) {
                                for (j = 0; j < currentCol.cl; j++) {
                                    if (attFm[j] && (attFm[j].idx === (cell.ci || cell.ui))) {
                                        // Update the return value based on whether we adjusted the columns;
                                        returnVal = adjCol.call(this, currentCol, count);
                                    }
                                }
                            }

                            //Update the col position.
                            count += currentCol.tg ? currentCol.cl : 1;
                        }

                    //Are we clicking a metric header?
                    } else if (e && e.otp === OBJECT_TYPE_METRIC) {
                        for (i = 0; i < cg.cgc; i++) {
                            currentCol = cg[i];

                            //Is the clicked cell part of the column's current cell.
                            if (currentCol['mix' + currentCol.cc] === mix) {
                                //Update the return value based on whether we adjusted the columns;
                                returnVal = adjCol.call(this, currentCol, count);
                            }

                            //Update the col position.
                            count += currentCol.tg ? currentCol.cl : 1;
                        }
                    }

                    return returnVal;
                }

                //If we didn't click on a metric header, let the normal code flow continue.
                return false;
            },

            /**
             * Extends (mstrmojo.XtabBase)
             *
             * @return (mstrmojo.InteractiveGridHACP) Returns a new Horizontally aggregated InteractiveGrid content provider.
             */
            getHACP: function getHACP() {
                //Create the right HACP. The condition check is just a safety measure - this mixin should/will only be mixed in for interactive grids.
                var hacp = (this.isInteractiveGrid()) ? new mstrmojo.InteractiveGridHACP({gridData: this.gridData}) : this._super();

                //Set the on demand incremental fetch flag on the interactive grid hacp.
                hacp.onDemandIF = !!(this.onDemandIF && this.gridData.rw);

                return hacp;
            },

            /**
             * Callback when the viewport's dimensions change. Whenever the viewport changes dimension, we need to unrender and rerender
             * the grid so we can fit it correctly.
             */
            onwidthChange: function onwidthChange() {
                if (isIGFullscreen.call(this)) {
                    // Cache the old width;
                    var w = this.width;

                    //Check if the Interactive Grid has rendered.
                    if (this.hasRendered) {
                        // If this interactive grid is rendered in the full screen mode, we need to re-render it to fit contents.
                        this.unrender();

                        //On unrender, the width properties get unset, we need to update the width
                        this.width = w;

                        // Render the grid
                        this.render();
                    }

                } else if (this._super) {
                    this._super();
                }
            },

            /**
             * @see mstrmojo.XtabBase
             */
            defaultAction: function defaultAction(td, tCell) {
                var _returnVal = false;

                if (this._super) {
                    _returnVal = this._super(td, tCell);
                }

                // Since we're handling the selections for the interactive grid, we don't want the doc xtab to highlight cells.
                this.model.sti = null;

                return _returnVal;
            },

            /**
             * FOR DEBUGGING PURPOSES ONLY!
             */
            onclick: function onclick(evt) {
                // Are we in the hosted environment?
                if (!mstrApp.isTouchApp()) {
                    var e = evt.e;

                    // Handle the action.
                    return handleAction.call(this, $D.findAncestorByName(e.target, 'td', true)) || (this._super && this._super(evt));
                }
            },

            /**
             * Override the unrender method.
             *
             * @see mstrmojo._HasMarkup
             */
            unrender: function unrender(ignoreDom) {
                //Have we created sticky sections for this interactive grid, then destroy it.
                if (this.ss) {
                    this.ss.destroy();

                    delete this.ss;
                }

                //Call super.
                this._super(ignoreDom);
            }
        }
    );
}());