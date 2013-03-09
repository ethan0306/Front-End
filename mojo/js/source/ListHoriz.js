(function(){

    mstrmojo.requiresCls(
        "mstrmojo.ListBase2",
        "mstrmojo.ListMapperHoriz",
        "mstrmojo.ListBuilder");
    
    /**
     * <p>A Widget which displays an array of data "items" in a single-row table with horizontal orientation.</p>
     *
     * @class
     */
    mstrmojo.ListHoriz = mstrmojo.declare(
        // superclass
        mstrmojo.ListBase2,
        // mixins
        null,
        // instance members
        /**
         * @lends mstrmojo.ListHoriz.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.ListHoriz",
            
            /**
             * @ignore
             */
            renderOnScroll: true,
                          
            /**
             * @ignore
             */
            listMapper: mstrmojo.ListMapperHoriz,

            /**
             * @ignore
             */
            listBuilder: mstrmojo.ListBuilder,

            /**
             * <p>Optional name of the field whose value is to be displayed for each item.</p>
             *
             * <p>Used to generate item markup if neither "itemMarkup" nor "itemMarkupFunction" properties are defined.
             * If either of those two properties is specified, itemField is ignored.</p>
             *
             * @type String|Number
             */
            itemField: "n",

            /**
             * <p>Optional markupString for the item DOM.</P>
             *
             * <p>The "itemMarkup" string is used to specify a template for creating each item DOM.
             * The string should include tokens of the form "{@<prop>}" for dynamic markup, where <prop> is a property of the item.
             * The item markup can alternatively be configured via the "itemMarkupFunction" and "itemField" properties.</p>
             *
             * @type String
             */
            itemMarkup: null,
            
            /**
             * <p>Optional generator for the item DOM markup string.</p>
             *
             * <p>The "itemMarkupFunction" property is an alternative to the "itemMarkup" and "itemField" properties.  It can specify a function which the
             * widget can call to generate the HTML string for each item it renders.  This allows the widget to support more sophisticated
             * markup that relies on conditional logic, lookups, math, etc.  If the "itemMarkupFunction" is specified, the "itemMarkup" and
             * "itemField" properties will be ignored.</p>
             *
             * <p>The call to the itemMarkupFunction will receive two parameters: the item and its current index. The context of the
             * function ("this") will be the widget. The function should return a valid HTML string.</p>
             *
             * @param {Object|Array} item The item whose markup is to be generated.
             * @param {Integer} index The index of the item.
             * @returns {String} The HTML string for the item.
             */
            itemMarkupFunction: null
        });
})();