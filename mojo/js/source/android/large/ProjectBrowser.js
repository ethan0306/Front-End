(function () {

    mstrmojo.requiresCls(
            "mstrmojo.android.SimpleList",
            "mstrmojo.android._CanCheckItem"
            );
    
    /**
     * The List for displaying project contents (Home Screen, Projects, and folder contents).
     *
     * @class
     * @extends mstrmojo.android.SimpleList
     */
    mstrmojo.android.large.ProjectBrowser = mstrmojo.declare(

        mstrmojo.android.SimpleList,

        [mstrmojo.android._CanCheckItem],

        /**
         * @lends mstrmojo.android.large.ProjectBrowser.prototype
         */
        {
            scriptClass: "mstrmojo.android.large.ProjectBrowser",

            selectionPolicy: 'reselect',

            /**
             * @see mstrmojo.android.SimpleList
             */
            hasEvenRows: true,

            getItemMarkup: function (item) {
                return '<{@tag} class="item {@cls}" idx="{@idx}" style="{@style}"><div><div><h2>{@n}</h2><h4>{@desc}</h4></div></div></{@tag}>';
            },

            getItemProps: function getItemProps(item, idx) {
                var props = this._super(item, idx),
                    arrow = 'ic2d';                     // Default arrow for icon 2.

                // Is this the shared reports item?
                if (item.act === 5) {
                    // Pull name out of item.
                    props.n = item.txt;

                    // Add folder class to icon 1.
                    props.addCls('ic1f');
                } else {
                    props.n = item.txt || props.n;

                    // Is this a project?
                    if (item.t === 8 || item.st === 2048) {
                        // Add folder class to icon 1.
                        props.addCls('ic1f');

                        // Description is empty by default.
                        props.desc = item.desc || '';

                        // Do we have a description?
                        if (props.desc) {
                            // Add description class.
                            props.addCls('desc');
                        }

                    } else {

                        // Add subtype to icon 1.
                        props.addCls('ic1' + item.st);

                        // Override default arrow with executable object arrow.
                        arrow = 'ic2o';
                    }
                }
                if ( ! this.canClick(item) ) {
                    props.addCls('disabled');
                }

                // Add arrow.
                props.addCls(arrow);

                return props;
            },

            replaceItems: function replaceItems(items, selectedIdx) {
                // Silently set the new items.
                this.items = items;

                // Clear old selections.
                var idxs = {};
                if (selectedIdx !== -1) {
                    idxs[selectedIdx] = true;
                }
                this.selectedIndices = idxs;
                this.selectedIndex = selectedIdx;

                // Refresh list.
                this.refresh();

                // Delete activeNode reference since we just replaced all nodes.
                delete this._activeNode;
            },

            onRender: function onRender() {
                // Is nothing selected?
                var idx = this.selectedIndex,
                    position = 0;               // Default position is zero.

                // Do we have both items and a selected item?
                if (idx > -1 && this.items.length) {
                    //Get the cached row height.
                    var rh = this.rowHeight;

                    //Scroll the selected node to the center of the list by calculating as follows:
                    // (Node's offsetTop) + (Node's height / 2) - (Project Browser's Height)
                    position = (rh * idx) + (rh / 2) - (parseInt(this.height, 10) / 2);
                }

                // Use the scroller to apply position.
                this._scroller.scrollTo(0, position);
            }
            
        }
        
    );
}());