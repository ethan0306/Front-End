(function() {
    mstrmojo._HasTooltip = mstrmojo.provide(
            'mstrmojo._HasTooltip',
            {

            /**
             * <p>The tooltip for this widget.</p>
             * 
             * @type String
             */
            tooltip: '',
            
            /**
             * <p>The rich tooltip for this widget. </p>
             * 
             * It can be a string or a JSON object. If it is a JSON object, it can include the following information:
             *     <ul>
             *         <li>content - the content to put into the rich tooltip. It can be HTML code.</li>
             *         <li>cssClass - the css class to be used for the tooltip</li>
             *         <li>top/left - the position of the tooltip </li>
             *     </ul>
             * If it is a string, then the string will be used as content, and rich tooltip will use its default implemenation 
             * for positioning and css class.
             * 
             * @type String|Object
             */
            richTooltip: null,
            /**
             * <p>The flag to control whether to use the rich tooltip.</p>
             * 
             * When this flag is set to true, then rich tooltip will be used. 
             * If richTooltip is defined, then it will be used. If richTooltip is not defined, then tooltip will be used.
             * 
             * @type Boolean
             */
            useRichTooltip: false,
            /**
             * The node which will listen to mouseover/out event for rich tooltip feature. If this node is null, then the domNode will be used.
             */
            tooltipNode: null,
            /**
             * attaches event listener for onmouseover and onmouseout event for tooltip
             * 
             * @ignore
             */
            postBuildRendering: function() {
                var ret;
                if (this._super) {
                    ret = this._super();
                }
                    
                if (this.useRichTooltip){
                    var d = this.tooltipNode || this.domNode,
                        dom = mstrmojo.dom,
                        ttl = d && d.getAttribute('title');
                    // remove the 'title' on domNode if there is any
                    if (ttl) {
                        d.setAttribute('title', '');
                    }
                    // attach event listeners
                    if (!this._ontooltipover){
                        var id = this.id;
                        this._ontooltipover = function(e) {
                            var me = mstrmojo.all[id];
                            me.showTooltip(e, self);
                        };
                        this._ontooltipout = function(e) {
                            var me = mstrmojo.all[id];
                            me.hideTooltip(e, self);
                        };
                    }
                    dom.attachEvent(d, 'mouseover', this._ontooltipover);
                    dom.attachEvent(d, 'mouseout', this._ontooltipout);
                }
                return ret;
            },
            /**
             * <p>Call back funtion for onmouseover to show rich tooltip.</p>
             */
            showTooltip: function(e, win) {
                mstrmojo.requiresCls("mstrmojo.tooltip");
                mstrmojo.tooltip.open(this, e, win);
            },
            /**
             * <p>Call back function for onmouseout to hide rich tooltip.</p>
             */
            hideTooltip: function(e, win) {
                mstrmojo.requiresCls("mstrmojo.tooltip");
                mstrmojo.tooltip.close();
            },
            /**
             * When unrender, we need to detach the event listerners we attached to DOM node.
             */
            unrender: function(ignoreDom) {
                var d = this.tooltipNode || this.domNode,
                dom = mstrmojo.dom;
                
                if (d && this._ontooltipover){
                    dom.detachEvent(d, 'mouseover', this._ontooltipover);
                }
                if (d && this._ontooltipout) {
                    dom.detachEvent(d, 'mouseout', this._ontooltipout);
                }
                if (this._super) {
                    this._super(ignoreDom);
                }
                
            }
    });
})();
