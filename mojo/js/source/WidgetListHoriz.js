(function(){

    mstrmojo.requiresCls(
        "mstrmojo.WidgetListBase",
        "mstrmojo.WidgetListMapperHoriz",
        "mstrmojo.WidgetListBuilder");
    
    /**
     * <p>A Widget which displays an array of data "items" in a single-column table with vertical orientation.</p>
     *
     * @class
     */
    mstrmojo.WidgetListHoriz = mstrmojo.declare(
        // superclass
        mstrmojo.WidgetListBase,
        // mixins
        null,
        // instance members
        /**
         * @lends mstrmojo.WidgetListHoriz.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.WidgetListHoriz",
            
            /**
             * @ignore
             */
            renderOnScroll: true,
            
            /**
             * @ignore
             */
            listMapper: mstrmojo.WidgetListMapperHoriz,

            /**
             * @ignore
             */
            listBuilder: mstrmojo.WidgetListBuilder,
            
            /**
             * <p>Configuration properties for the item widgets.</p>
             *
             * <p>A widget will be created and rendered for each item in the widget's "items" array.  The item widget
             * can be configured by either the "itemConfig" property or "itemFunction" property.  "itemConfig" is used
             * to specify a fixed set of widget properties for a homogeneous list of widgets.  "itemFunction" is used
             * to specify a dynamic set of widget properties for a heterogenenous list of widgets. If "itemFunction"
             * is defined, "itemConfig" is ignored.</p>
             *
             * @type Object
             */
            itemConfig: null,

            /**
             * <p>A function that generates a widget for a given item.</p>
             *
             * <p>A widget will be created and rendered for each item in the widget's "items" array.  The item widget
             * can be configured by either the "itemConfig" property or "itemFunction" property.  "itemConfig" is used
             * to specify a fixed set of widget properties for a homogeneous list of widgets.  "itemFunction" is used
             * to specify a dynamic set of widget properties for a heterogenenous list of widgets. If "itemFunction"
             * is defined, "itemConfig" is ignored.</p>
             *
             * <p>The itemFunction will receive three input arguments: item, index, and widget. It returns a handle
             * to a new widget instance.</p>
             *
             * @param {Object} item The item for which a widget is to be generated.
             * @param (Integer) index The index of the item.
             * @param {mstrmojo.Widget} widget A handle to this WidgetList.
             * @returns {mstrmojo.Widget} The newly created widget for the given item.
             *
             * @type Function
             */
            itemFunction: null
        });
})();