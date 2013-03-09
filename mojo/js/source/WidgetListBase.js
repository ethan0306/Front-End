(function(){

    mstrmojo.requiresCls("mstrmojo.ListBase2");
    
    function _destroyItemWidgets(w){
        var c = w.ctxtBuilder;
        if (c) {
            var iws = c.itemWidgets,
                i;
            for(i=iws.length-1; i>-1; i--) {
                var iw = iws[i];
                if (iw) {
                    iw.destroy(true);
                }
            }
        }
    }
    
    /**
     * <p>A Widget which displays an array of data "items" in a single-column table with vertical orientation.</p>
     *
     * @class
     */
    mstrmojo.WidgetListBase = mstrmojo.declare(
        // superclass
        mstrmojo.ListBase2,
        // mixins
        null,
        // instance members
        /**
         * @lends mstrmojo.WidgetListBase.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.WidgetListBase",
            
            /**
             * <p>Extends the unrendering cycle to ask the item widgets to unrender.</p>
             *
             * <p>The item widgets are asked to ignoreDom, because this WidgetList will be responsible for
             * removing all the DOM in one shot.</p>
             *
             * @ignore
             */
            unrender: function unrn(ignoreDom){
                var c = this.ctxtBuilder;
                if (c) {
                    var iws = c.itemWidgets,i;
                    for (i=iws.length-1; i>-1; i--) {
                        var iw = iws[i];
                        if (iw && iw.hasRendered) {
                            iw.unrender(true);
                        }
                    }
                }
                this._super(ignoreDom);
            },

            refresh: function refresh(postUnrender){
                _destroyItemWidgets(this);
                if(this._super){
                    this._super(postUnrender);
                }
            },
            
            /**
             * <p>Extends the inherited method in order to destroy the item widgets.</p>
             *
             * <p>Item widgets are destroyed before this widget in order to minimize the number of events raised in the process.</p>
             *
             * @param {Boolean} [skipCleanup] If true, this flag indicates that some parent/ancestor of this object
             * will handle some cleanup after this object is destroyed. Used as a performance optimization.
             */
            destroy: function dst(skipCleanup) {
                _destroyItemWidgets(this);

                this._super(skipCleanup);
            }
            
        });


})();