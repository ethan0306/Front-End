(function () {

    mstrmojo.requiresCls("mstrmojo.ListBase", 
                         "mstrmojo._HasLayout",
                         "mstrmojo._TouchGestures", 
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo.css",
                         "mstrmojo.dom");
    
    /**
     * Widget for displaying a list of folder contents on a Mobile touch enabled device.
     * 
     * @class
     * @extends mstrmojo.List
     */
    mstrmojo.MobileFolderList = mstrmojo.declare(
        mstrmojo.ListBase,

        [ mstrmojo._HasLayout, mstrmojo._TouchGestures, mstrmojo._HasTouchScroller ],
        
        /**
         * @lends mstrmojo.MobileFolderList.prototype
         */
        {
            scriptClass: 'mstrmojo.MobileFolderList',
            
            renderOnScroll: false,
            
            itemRenderer: {
                render: function(item, idx, widget) {
                    return '<div class="item ty' + item.st + '" idx="' + idx + '">' + 
                               '<h3>' + item.n + '</h3>' +
                               '<h4>' + (item.desc || '') + '</h4>' + 
                               '<div></div>' +
                           '</div>';
                },
                
                select: function(el, item, idx, widget) {
                    mstrmojo.css.addClass(el, 'selected');
                },
                
                unselect: function(el, item, idx, widget) {
                    mstrmojo.css.removeClass(el, 'selected');
                }
            },
            
            _getItemNode: function(idx) {
                return this._scrollEl.childNodes[idx];
            },
            
            postBuildRendering: function postBuildRendering() {
                // Populate the _scrollEl property so the _super can create the scroller. 
                var scrollEl = this._scrollEl = this.itemsContainerNode;
                this._super();
                
                // Add the instance properties to the scroller.
                mstrmojo.hash.copy({
                    vScroll: true,
                    bounces: false,
                    offset: {
                        y: {
                            start: 0,
                            end: scrollEl.offsetHeight - parseInt(this.height, 10)
                        }
                    },
                    origin: {   // Always starts at 0 0.
                        x: 0,
                        y: 0
                    }
                }, this._scroller);

            },
            
            onclick: function onclick(evt) {
                this.touchTap({
                    target: evt.e.target    
                });
            },

            touchTap: function touchTap(touch) {
                var item = mstrmojo.dom.findAncestorByAttr(touch.target, 'idx', true, this.domNode);
                if (!item) {
                    return;
                }
                
                this.singleSelect(item.value);
            }
        }
    );
    
})();