(function () {
    mstrmojo.requiresCls("mstrmojo.dom", "mstrmojo.Widget");

    /**
     * This widget emulates a semi-locked section header for scrollable lists. It remains locked until all elements within
     * it's grouping have been scrolled and then animates to make space for the next section title.
     *
     * The widget is typically used at the top of the list so as to create a a grouping effect.
     *
     * It assumes that the list has constant row height.
     *
     * @class
     * @extends mstrmojo.Widget
     *
     */
    mstrmojo.StickySections = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.StickySections",

            markupString: '<div id="{@id}" style="{@cssText};overflow:hidden">' +
                              '<div class="mstrmojo-StickySections {@cssClass}">{@currentSectionTitle}</div>' +
                          '</div>',

            /**
             * Callback whenever the widget's section title changes. It changes the innerHTML of the widget
             * to reflect the next HTML.
             *
             * @param evt The event object.
             */
            oncurrentSectionTitleChange: function oncurrentTitleChange(evt) {
                this.domNode.lastChild.innerHTML = this.currentSectionTitle;
            },


            /**
             * This method needs to be called whenever the List is scrolled so as to ensure that the necessary animation
             * whenever a new section is encountered. It expects the following info object
             *
             * {
             *   isNextRowNewSection: Boolean,
             *   position: Integer
             *   sectionName: String
             * }
             *
             * @param {Object} info An object passed in to help with the animation
             * @param {Boolean} info.isNewSection Tells the widget whether the current location of the list is at a new section.
             * @param {Boolean} info.isNextRowNewSection Tells the widget whether the next row moving to the top is a new section row.
             * @param {Integer} info.position Tells the widget the position of the list being scrolled
             * @param {String} info.sectionName Tells the widget the current section name for display.
             *
             */
            onMove: function onMove(info) {
                var value = 0;

                //Do we need to animate moving to the next section? Calculate where the section node is going to be next
                if (info.isNextRowNewSection) {
                    //When moving down, the widget has to animation from the top. Use row height in our calculations
                    var position = info.position,
                        rowStart = info.rowStart,
                        directionValue = (rowStart > position) ? (this.domNode.offsetHeight + 1) : 0;

                    //Calculate where the sticky section is going to be next..
                    value = (rowStart - position) - directionValue;
                }
                
                //Move the node to animate the push, pull or to reset back on top...
                mstrmojo.dom.translate(this.domNode.lastChild, 0, value, 0, "", true);
                
                //Set the current title name
                if (info.sectionName && info.sectionName !== this.currentSectionTitle) {
                    this.set('currentSectionTitle', info.sectionName);
                }
            }
        }
    );

}());