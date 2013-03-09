(function () {

    mstrmojo.requiresCls("mstrmojo.Dialog",
                         "mstrmojo.array",
                         "mstrmojo.dom",
                         "mstrmojo.css",
                         "mstrmojo._IsAnchorable");
    
    var $DOM = mstrmojo.dom,
        $ARR = mstrmojo.array;
    
    /**
     * An extension of {@link mstrmojo.Dialog} designed for the Mobile platform.
     * 
     * @class
     * @extends mstrmojo.Dialog
     */
    mstrmojo.android.Popup = mstrmojo.declare(

        mstrmojo.Dialog,

        [mstrmojo._IsAnchorable],
        
        /**
         * @lends mstrmojo.android.Popup.prototype
         */
        {
            scriptClass: "mstrmojo.android.Popup",
            
            /**
             * Indicates whether the dialog should fade when it is closed, or close immediately. Defaults to false because Android devices 
             * do not have hardware acceleration for CSS transitions. We can enable it if this statement is no longer true.
             * 
             * @type Boolean
             * @default false
             */
            fadeOnClose: false,
            
            /**
             * True if the dialog should close when the user touches outside the dialog.
             * 
             * @type Boolean
             * @default true
             */
            autoClose: true,
            
            /**
             * Overridden to calculate width and max-height based on screen dimensions for phones and set values for tablets. 
             * 
             * @ignore
             */
            init: function init(props) {
                // Call super to initialize.
                this._super(props);
                
                // Is this an anchored popup?
                if (this.anchor) {
                    mstrmojo.css.addWidgetCssClass(this, 'anchor');
                }
            },
            
            addChildren: function addChildren(children, idx, silent) {
                this._super(children, idx, silent);
                
                // Iterate the children.
                $ARR.forEach(this.children, function (child) {
                    // Is this the elastic child?
                    if (child.isElastic) {
                        // Cache the child on the instance.
                        this._elasticChild = child;
                        
                        // Can only have one elastic child so return false to halt iteration.
                        return false;
                    }
                }, this);
            },
            
            resizeDialog: function resizeDialog() {
                // Calculate width and max height.
                var editorNode = this.editorNode,
                    app = mstrApp,
                    dimensions = app.getScreenDimensions(),
                    mh = Math.round(dimensions.h * 0.9), 
                    w = dimensions.w - 30;
                
                // Is this a tablet device?
                if (app.isTablet()) {
                    // Use either the default sizes for tablets, or the calculated height (whichever is smaller).
                    mh = Math.min(488, mh);
                    w = Math.min(550, w);
                }
                
                // Add unit.
                mh += 'px';
                w += 'px';

                // Do we already have an editor node?
                if (editorNode) {
                    // Add max height to editor node.
                    editorNode.style.maxHeight = mh;
                    
                    // Use set for width.
                    this.set('width', w);
                    
                } else {
                    // Set width and add max-height to cssText.
                    this.width = w;
                    this.cssText = (this.cssText || '') + 'max-height:' + mh + ';';
                }
                
                //Raise an event to let all listeners know that the Dialog has resized.
                this.raiseEvent({
                    name: 'popupResized',
                    maxheight: parseInt(mh, 10),
                    height: this.getAvailableContentSpace(),
                    width: parseInt(w, 10)
                });
                
                // Do we have an elastic child?
                var elasticChild = this._elasticChild;
                if (elasticChild) {
                    // Does the child have a non auto (or default) height?
                    var h = elasticChild.height;
                    if (h !== undefined && h !== 'auto') {
                        // Set the childs height to auto so that we don't constrain it prematurely.
                        elasticChild.set('height', 'auto');
                    }
                    
                            // Set height of child to available content height.
                    elasticChild.set('height', this.getAvailableContentSpace() + 'px');
                            
                    // TQMS 467398: Does the child have a scroller? 
                            // Is there a better place to do this? 
                    if (elasticChild.updateScroller) {
                        // Update the scroller to correspond to the new height.
                        elasticChild.updateScroller();
                    }
                }
                
                this._super();
            },
            
            getAvailableContentSpace: function getAvailableContentSpace() {
                return (this.editorNode.clientHeight - this.titleNode.offsetHeight - this.buttonNode.offsetHeight);
            },
            
            close: function close() {
                // Do we have a custom close handler?
                if (this.onClose) {
                    // Call the custom hook.
                    this.onClose();
                }
                
                // Should this popup fade when it's closed?
                if (this.fadeOnClose) {
                    // Attach one time event to destroy dialog after it closes - only if we are still rendered
                    var domNode = this.domNode;
                    if (domNode) {
                        var id = this.id;
                        
                        if (!$DOM.isWinPhone) {

                            $DOM.attachOneTimeEvent(domNode, 'webkitTransitionEnd', function () { 
                                mstrmojo.all[id].destroy();
                            });

                            // Fade the dialog.
                            domNode.style.opacity = 0;
                        
                        } else {

                            (new mstrmojo.fx.FadeOut({
                                onEnd: function () {
                                    mstrmojo.all[id].destroy();
                                },
                                target: domNode,
                                duration: 400
                            })).play();  

                        }                            
                    }
                } else {
                    this.destroy();
                }
            },
            
            onclick: function onclick(evt) {
                // Do we support auto close and did the user click (or touch) the curtain?
                if (this.autoClose && evt.e.target === this.curtainNode) {
                    // Close the dialog.
                    this.close();
                }
            },
            
            ontouchend: function ontouchend(evt) {
                // Simulate a click.
                this.onclick(evt);
            }
        }
    );
}());