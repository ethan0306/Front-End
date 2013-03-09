(function() {
    mstrmojo.requiresCls("mstrmojo.registry");
    /**
     * Mixin to support paging in list.
     */
    mstrmojo._PagingList = mstrmojo.provide(
            'mstrmojo._PagingList', {
                /**
                 * Whether to use paging.
                 * @type Boolean
                 */
                usePaging: false,
                /**
                 * The current page index (0-based)
                 * @type Integera
                 */
                page: 0,
                /**
                 * Total page count for the list. Default value is 1.
                 * @type Integer
                 */
                totalPages: 1,
                /**
                 * Setter for page property.
                 * 
                 * When page is changed, we need to validate the new value and we need to rerender the GUI.
                 */
                _set_page: function(n, p){
                    if (this.page !== p && this.usePaging) {
                        if (p >= 0 && p < this.totalPages){
                            this.page = p;
                        }
                        return true;
                    } 
                    return false;
                },
                /**
                 * Flag to identify the scrolling state. When the scrolling is triggered by user, we should not try to scroll again when set the 'page'.
                 * Since setting the page would trigger the list to scroll.
                 * 
                 * @type boolean
                 * @private
                 */
                _inScroll: false,
                /**
                 * Flag to identify the paging state. When paging is triggered by user, we should not try to set 'page' again in onscroll().
                 */
                _inPaging: false,
                /** 
                 * Event listener for scroll event of the scrollbox. When list got scrolled, the current page number should be updated.
                 * 
                 */
                onscroll: function() {
                    if (this.usePaging && !this._inPaging) {
                        // silently update page, if use setter would trigger the list scroll to the top of the page.
                        this._inScroll = true;
                        // determine current page.
                        this.set('page', this.listMapper.whichPage(this));
                        this._inScroll = false;
                    }
                    if (this._super){
                        this._super();
                    }
                }
                
            });
    
})();