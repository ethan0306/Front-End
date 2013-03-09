(function(){

    mstrmojo.requiresCls(
            "mstrmojo.List", 
    "mstrmojo._IsDial");

    /**
     * <p>A single-select list that displays its current selection vertically centered.</p>
     *
     * @class
     * @extends mstrmojo.List
     */
    mstrmojo.Dial = mstrmojo.declare(
        // superclass
        mstrmojo.List,
        // mixins
        [mstrmojo._IsDial],
        // instance members
        /**
         * @lends mstrmojo.Dial.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.Dial",

            /**
             * @ignore
             */
            markupMethods: {
                onvisibleChange: function(){this.domNode.style.display = this.visible ? 'block' : 'none';},
                onhasSelectionChange: function(){mstrmojo.css.toggleClass(this.domNode, ["hasSelection"], !!this.hasSelection);},
                hideIfEmpty : function(){this.onadd();}
            },
            
            /**
             * Hide the dial if there are no items on it, default false for backwards compatibility TQMS#431425
             * */
            hideIfEmpty: false,
            
            /**
             * Use this customization hook to hide the dial in case that the hideIfEmpty flag is true and the list is empty
             * */
            onadd : function(evt){
                if(this._super) {
                    this._super(evt);
                }
                if(this.hideIfEmpty){
                    if(this.domNode){
                        this.domNode.style.display = (!this.items || this.items.length == 0) ? "none" : "block";
                    }
                }
            }

        });
})();