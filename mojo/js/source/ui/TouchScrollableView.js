/**
  * TouchScrollableView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>Widget that wraps up all the necessary bits and pieces for a touch scrollable view.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */

(function () {

    mstrmojo.requiresCls("mstrmojo.VBox",
                         "mstrmojo._HasLayout",
                         "mstrmojo._TouchGestures",
                         "mstrmojo._HasTouchScroller",
                         "mstrmojo.dom");

    /**
     * Widget for displaying help contents on an Android Device.
     * 
     * @class
     * @extends mstrmojo.VBox
     */
    mstrmojo.ui.TouchScrollableView = mstrmojo.declare(
        mstrmojo.VBox,

        [ mstrmojo._HasLayout, mstrmojo._TouchGestures, mstrmojo._HasTouchScroller ],

        /**
         * @lends mstrmojo.TouchScrollableView.prototype
         */
        {
            scriptClass: "mstrmojo.ui.TouchScrollableView",
            markupSlots: {
                containerNode: function() { return this.domNode.firstChild; },
                scrollboxNode: function() { return this.domNode; }                
            },
            
            markupString: '<div id="{@id}" class="mstrmojo-TouchScrollableView {@cssClass}" style="{@cssText}">' +
                            '<div></div>' +
                          '</div>',

            layoutConfig: {
                h: {
                    containerNode: '100%'
                },
                w: {
                    containerNode: '100%'
                }
            },
            
            scrollerConfig: {
                bounces: false,
                showScrollbars: false
            },
                        
            preConfigScroller: function() {
            },
            
            updateScrollerConfig: function updateScrollerConfig() {
                var cfg = this.scrollerConfig,
                    icn = this.containerNode,
                    offsetEnd = Math.max(icn.offsetHeight - parseInt(this.height, 10), 0);
                
                // Add the scrollEl to the scroll config.
                cfg.scrollEl = icn;
                
                // Do we NOT already have an origin?
                if (!cfg.origin) {
                    // Initialize origin to 0,0.
                    cfg.origin = {
                        x: 0,
                        y: 0
                    };
                }
                
                // Should we be able to vertically scroll?
                var enableScroll = cfg.vScroll = (offsetEnd !== 0 && cfg.noVScroll !== true);
                if (enableScroll) {
                    // Add the computed offset.
                    cfg.offset = {
                        y: {
                            start: 0,
                            end: offsetEnd
                        }
                    };
                }
                
                // Store the modified config back on the instance.
                this.scrollerConfig = cfg;
                
                // Call the super
                return this._super();
            },
            
            postBuildRendering: function postBuildRendering() {

                // call the preConfig. hook to allow sub-classes a chance to install markup before the scroller is setup
                this.preConfigScroller();

                // Call the super - this will actually create the scroller
                this._super();
            }
        }
    );
})();




