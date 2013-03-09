(function () {

    mstrmojo.requiresCls("mstrmojo.Label",
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo._TouchGestures");

    mstrmojo.android.TextArea = mstrmojo.declare(
        mstrmojo.Label,

        [ mstrmojo._TouchGestures, mstrmojo._HasTouchScroller ],

        {
            scriptClass: "mstrmojo.android.TextArea",

            markupString: '<div id="{@id}" class="mstrmojo-TextArea {@cssClass}" style="{@cssText}">' +
                              '<div>{@text}</div>' +
                          '</div>',

            markupMethods: {
                ontextChange: function () { this.domNode.firstChild.innerHTML = this.text || ''; },
                oncssTextChange: function () { this.domNode.style.cssText = this.cssText || ''; },
                onvisibleChange: function () { this.domNode.style.display = (this.visible) ? this.cssDisplay : 'none'; },
                onheightChange: function () { this.domNode.style.height = this.height || 'auto'; }
            },

            updateScrollerConfig: function updateScrollerConfig() {

                var cfg = this._super(),
                    domNode = this.domNode,
                    scrollEl = domNode.firstChild,
                    h = parseInt(this.height, 10);

                // Is our height specified?
                if (isNaN(h)) {
                    // Height wasn't specified in the properties, so measure.
                    h = domNode.clientHeight;
                }

                // Disable bouncing.
                cfg.bounces = false;

                // Add the scrollEl to the scroll config.
                cfg.scrollEl = scrollEl;

                // Initialize origin to 0,0 (if not already there).
                cfg.origin = cfg.origin || {
                    x: 0,
                    y: 0
                };

                // Calculate offset end (items container node height minus widget height).
                var offsetEnd = Math.max(scrollEl.offsetHeight - h, 0);

                // Should we be able to vertically scroll?
                var enableScroll = cfg.vScroll = (offsetEnd !== 0);
                if (enableScroll) {
                    // Add the computed offset.
                    cfg.offset = {
                        y: {
                            start: 0,
                            end: offsetEnd
                        }
                    };
                }

                return cfg;
            }
        }
    );

}());