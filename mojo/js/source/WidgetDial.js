(function(){

    mstrmojo.requiresCls(
        "mstrmojo.WidgetList", 
        "mstrmojo._IsDial");
    
    /**
     * <p>A single-select widget list that displays its current selection vertically centered.</p>
     *
     * @class
     * @extends mstrmojo.WidgetList
     */
    mstrmojo.WidgetDial = mstrmojo.declare(
        // superclass
        mstrmojo.WidgetList,
        // mixins
        [mstrmojo._IsDial],
        // instance members
        /**
         * @lends mstrmojo.WidgetDial.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.WidgetDial"
        });
})();