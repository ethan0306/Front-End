(function () {

    mstrmojo.requiresCls("mstrmojo.android.SimpleList",
                         "mstrmojo.android.selectors._SupportsHoriz",
                         "mstrmojo.css");
    
    /**
     * An Android specific selector check list (or radio list based on the multiSelect property).
     * 
     * @class
     * @extends mstrmojo.android.SimpleList
     */
    mstrmojo.android.selectors.CheckList = mstrmojo.declare(

        mstrmojo.android.SimpleList,
        
        [ mstrmojo.android.selectors._SupportsHoriz ],
        
        /**
         * @lends mstrmojo.android.selectors.CheckList.prototype
         */
        {
            scriptClass: "mstrmojo.android.selectors.CheckList",
            
            hasEvenRows: true,
            
            init: function init(props) {
                this._super(props);
                
                // Default class.
                var cls = [ 'selector-checklist' ];
                
                // Do we support multiselect?
                if (this.multiSelect) {
                    // Add multiselect class.
                    cls.push('multi');
                }
                
                // Add collection of css classes.
                mstrmojo.css.addWidgetCssClass(this, cls);
            },
            
            updateScrollerConfig: function updateScrollerConfig() {
                // Disable vertical scrolling if the selector is horizontal.
                this.scrollerConfig.noVScroll = !!this.isHoriz;
                
                return this._super();
            }
        }
    );
}());