(function(){

    mstrmojo.requiresCls("mstrmojo.dom",
        "mstrmojo.Container",
        "mstrmojo._Formattable",
        "mstrmojo.EnumRWUnitType");
        
    var HTML_CONTAINER = mstrmojo.EnumRWUnitType.HTMLCONTAINER;    
    
    /**
     * <p>The widget for a single MicroStrategy Report Services text control or HTMLContainer (HTMLText type only, not IFrame {@see mstrmojo.DocHTMLContainer}).</p>
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers

     */
    mstrmojo.DocTextfield = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [mstrmojo._Formattable],
        
        /** 
         * @lends mstrmojo.DocTextfield.prototype
         */
        {
            scriptClass: "mstrmojo.DocTextfield",
            
            markupString:   '<div id="{@id}" class="mstrmojo-DocTextfield {@cssClass}" title="{@tooltip}" style="{@domNodeCssText}">' +
                                '<div class="mstrmojo-DocTextfield-valueNode" style="{@valueNodeCssText}" mstrAttach:click >{@v}</div>' + 
                                '{@buttonNodeMarkup}'+ 
                            '</div>',
                            
            markupSlots: {
                valueNode: function() { return this.domNode.firstChild; }
            },
                            
            formatHandlers: {
                domNode:  [ 'T', 'z-index' ],
                valueNode: [ 'D', 'B', 'F', 'P', 'background-color', 'fx', 'text-align', 'white-space', 'overflow' ]
            },
            
            /**
             * Updates the DocTextField data that may change due to a selector action.
             * 
             * @param {Object} node The widget node.
             */
            update: function update(node) {
                var d = node.data,
                    v = d.v || '';
                
                // Is this a text field being used to render an static HTML container?
                if (node.defn.t === HTML_CONTAINER) {
                    // Decode the value.
                    var div = document.createElement('div');
                    div.innerHTML = '<textarea>' + v + '</textarea>';
                    v = '<div style="display:none">&nbsp;</div>' + div.firstChild.value;
                    // Kill element.
                    div = null;
                }
                
                // Store value on instance.
                this.v = v;

                // Is there a threshold?
                if (this.thresholdId || d.tid) {
                    // Kill the format
                    delete this.fmts;
                }

                // Store threshold ID.
                this.thresholdId = d.tid;
                
                if (this._super) {
                    this._super(node);
                }
            },
            
            /**
             * Adjust the position of rotated text for non-IE browsers.
             * 
             * @ignore
             * @refactoring If the textField has a hyperlink, the mouse's cursor shape will be a hand whenever a user moves the 
             *                 cursor over the TextField. 
             *                 The code in this method runs during rendering and likely has poor performance so we should evaluate
             *                 whether we want to support rotated text in non-IE browsers.
             */
            postBuildRendering: function pstBldRnd(){
                
                var $D = mstrmojo.dom,
                    f = this.getFormats(),
                    rotateValue = f.fx && f.fx.rt,
                    i, len;
                
                // Is the text rotated, is this a non IE browser and is text rotation supported?
                if (rotateValue && !$D.isIE && $D.supports($D.cssFeatures.TEXT_ROTATION)) {
                    // We need to adjust the position of the object because IE rotates and 
                    // translates at the same time
                    var dn = this.domNode;

                    // Switch on the type of rotated text...
                    switch(rotateValue) {
                    case 1:    // Are we looking at text which is rotated 90° clockwise?
                        // If so, simply translate the left position by the text height
                        // NOTE: We can remove this call if we enhance the preBuildRendering
                        // to pass the outer text height (saved in the MD as a fixed width)
                        // and add a call to translateX(__text_height__)
                        dn.style.left = (parseInt(f.left, 10) + dn.offsetHeight) + 'px';
                        break;
                        
                    case 3: // Are we looking at text which is rotated 90° counterclockwise?
                        // Otherwise, translate the top position by text width...
                        dn.style.top = (parseInt(f.top, 10) + dn.offsetWidth) + 'px';
                        break;
                    }
                }
                
                // Is this a text field being used to render an static HTML container?
                if (this.defn.t === HTML_CONTAINER && !mstrmojo.dom.isFF) {
                    // Grab collection of script tags within html container.
                    var scripts = this.domNode.getElementsByTagName('script');
                    for (i = 0, len = scripts.length; i < len; i++) {
                        // Eval each script text.
                        eval(scripts[i].innerHTML);
                    }
                }
                
                return this._super();
            }
            
        }
    );
    
}());