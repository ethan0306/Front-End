(function(){

    mstrmojo.requiresCls(
        "mstrmojo.ListBase2",
        "mstrmojo.ListMapper",
        "mstrmojo.MultiColListBuilder");
    
    /**
     * <p>A Widget which displays an array of data "items" in a multi-column table with vertical orientation.</p>
     *
     * @class
     */
    mstrmojo.MultiColList = mstrmojo.declare(
        // superclass
        mstrmojo.ListBase2,
        // mixins
        null,
        // instance members
        /**
         * @lends mstrmojo.MultiColList.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.MultiColList",

            /**
             * @ignore
             */
            renderOnScroll: true,
            
            /**
             * @ignore
             */
            listMapper: mstrmojo.ListMapper,

            /**
             * @ignore
             */
            listBuilder: mstrmojo.MultiColListBuilder,

            /**
             * <p>Configuration of columns.</p>
             *
             * <p>The "cols" array is a list of configuration objects, one per each column. Each configuration object
             * may define the following properties:</p>
             * <dl>
             *  <dt>field:</dt>
             *  <dd>Number or String. Optional item field which this column corresponds to. Used to 
             *  generate item markup if neither "markup" nor "markupFunction" properties are defined for the column.</dd>
             *
             *  <dt>markup:</dt>
             *  <dd>The markup string template for the item DOM in this column.</dd>
             *
             *  <dt>markupFunction:</dt>
             *  <dd>A function that generates the item markup string. If given, "markup" property is ignored. This function
             *  should take three arguments: (item, index, widget).</dd>
             *
             *  <dt>visible:</dt>
             *  <dd>Boolean. If false, the column is hidden; otherwise the column is shown.</dd>
             *
             *  <dt>width:</dt>
             *  <dd>String. Optional column width, in CSS syntax (including units).</dd>
             * </dl>
             *
             * @type Array
             */
            cols: null
            
        });
})();