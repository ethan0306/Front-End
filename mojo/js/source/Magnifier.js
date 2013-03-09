(function(){
    mstrmojo.requiresCls("mstrmojo.Dialog",
                         "mstrmojo._IsAnchorable",
                         "mstrmojo._TouchGestures",
                         "mstrmojo._HasTouchScroller");
    
    mstrmojo.Magnifier = mstrmojo.declare(
        mstrmojo.Dialog,
        [mstrmojo._IsAnchorable, mstrmojo._TouchGestures, mstrmojo._HasTouchScroller],
        {
            scriptClass: "mstrmojo.Magnifier",
            
            cssClass: 'mstrmojo-magnifier anchor',

            anchorOrientation : 'h',
            
            anchorOffset: 0,
            
            baseTipClass: '',

            screenDim: null,
            
            close: function close() {
                // Do we have a custom close handler?
                if (this.onClose) {
                    // Call the custom hook.
                    this.onClose();
                }
                mstrmojo.dom.detachEvent(window, 'resize', this.closeOnResize);
                this.destroy();
            },
            
            onclick: function onclick(evt) {
                if (evt.e.target === this.curtainNode) {
                    this.close();
                }
            },
            
            ontouchend: function ontouchend(evt) {
                // Simulate a click.
                this.onclick(evt);
            },
            
            ontitleChange: function(){
                if (this.hasRendered){
                    this.titleNode.firstChild.innerHTML = this.title;
                }
            },
            
            postBuildRendering: function(){
                this._super();
                
                this.screenDim = mstrApp.getScreenDimensions();
                this.editorNode.style.maxWidth = (this.screenDim.w - 50) + 'px';
                
                if (!this.closeOnResize){
                    var id = this.id,
                        me = this;
                    this.closeOnResize = function(){
                        mstrApp.closeAllDialogs();
                    };
                    // Listen to resize event so that the info viewer could be dismissed if device orientation changes.
                    mstrmojo.dom.attachEvent(window, 'resize', this.closeOnResize);
                }
                
            },
            
            
            /**
             * Update the content displayed in the magnifier. 
             * 
             * @param domNode {DOM} contains the display content
             * @param anchor {DOM} the target grid cell
             * @param anchorPos {Object} it records the position of user's finger.
             * @return
             */
            updateContent: function (domNode, anchor, anchorPos) {
                if (domNode && anchor && anchorPos){
                    var m = this.containerNode,
                        c = m.firstChild;
                    
                    if(c) {
                        m.replaceChild(domNode, c);
                    } else {
                        m.appendChild(domNode);
                    }
                    
                    this.anchor = anchor;
                    this.anchorPosition = anchorPos;
                }
                
                var dimensions = this.screenDim,
                    h = dimensions.h - 60,
                    w = dimensions.w - 60,
                    containerNode = this.containerNode,
                    contentNode = containerNode.firstChild;
                
                if (contentNode){
                    this.contentHeight = contentNode.clientHeight;
                    this.height = Math.min(this.contentHeight, h - this.titleNode.clientHeight);
                    containerNode.style.height = this.height + 'px';
                }
                
                this.positionDialog();
                this.updateScroller();
            },
            
            updateScrollerConfig: function updateScrollerConfig() {

                var cfg = this._super(),
                    scrollEl = this.containerNode.firstChild;

                // Disable bouncing.
                cfg.bounces = false;

                if (scrollEl){
                    // Add the scrollEl to the scroll config.
                    cfg.scrollEl = scrollEl;
    
                    // Initialize origin to 0,0 (if not already there).
                    cfg.origin = cfg.origin || {
                        x: 0,
                        y: 0
                    };
    
                    // Calculate offset end (items container node height minus widget height).
                    var offsetEnd = Math.max(this.contentHeight - this.height, 0);
    
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
                }

                return cfg;
            }
        });
})();