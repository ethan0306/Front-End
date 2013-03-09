(function(){

    mstrmojo.requiresCls("mstrmojo.DocLayout");
    
    /**
     * When in an horizontal layout we need to set the height of all subsections to be
     * equals to the taller subsection of the current horizontal sections group, for each
     * group of horizontal sections get the taller subsection and resize the siblings
     * 
     * @private
     * @ignore
     */
    function resizeForSharedHeight(me) {
        var mh = -1,
            c = me.children,
            sec, six, ssix,
            subsec, 
            subsecArr = [], 
            resizeSection = function(){
                var ci;
                for (ci in subsecArr) {
                    var subsec = subsecArr[ci];
                    if(subsec._fixedHeight !== mh){
                        subsec._fixedHeight = mh;
                        if(subsec.domNode){ //If it exceeds the width of the doc, might not be rendered yet
                            subsec.domNode.style.height = mh + 'px';
                        }
                    }
                }
                mh = -1;
                subsecArr = [];
            };
        
        for (six in c) {
            sec = c[six];
            if (sec.node.data.bh && mh > -1){
                //we are starting a new horizontal section, if the max height is 
                //valid resize the previous horizontal group
                resizeSection();
            }
            if (sec.defn.horiz){
                //look for all horizontal sections
                for (ssix in sec.children){
                    //get the max height of the subsections on this section
                    subsec = sec.children[ssix];
                    mh = Math.max(subsec._fixedHeight || 0, mh);
                    //keep track of the current horizontal group sections
                    subsecArr[subsecArr.length] = subsec;
                }
            }
        }
        resizeSection();
    }
    
    /**
     * The widget for a single MicroStrategy Report Services document layout, which contains horizontally repeating data.
     * 
     * @class
     * @extends mstrmojo.DocLayout
     */
    mstrmojo.DocLayoutHoriz = mstrmojo.declare(
        // superclass
        mstrmojo.DocLayout,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.DocLayoutHoriz.prototype
         */
        {
            scriptClass: "mstrmojo.DocLayoutHoriz",
            
            markupString: '<div id="{@id}">' +
                              '<div class="mstrmojo-DocLayout {@cssClass}" style="{@domNodeCssText}">' +
                              '</div>' +
                          '</div>',
          
            markupSlots: {
                containerNode: function(){ return this.domNode.firstChild; }
            },
            
            
            _renderSection: function _renderSection (sec, index){
                
                // Should we begin horizontal data?
                if (sec.node.data.bh) {
                    
                    // Create the container.
                    var d = document.createElement('div');
                    d.className = 'mstrmojo-DocLayout-HBox';
                    
                    // Create a table...
                    var t = document.createElement('table');
                    t.className = 'mstrmojo-DocLayout-HBox-HorizContainerTable';
                    
                    // with one row...
                    this._hRow = t.insertRow(-1);
                    
                    // and append it to the container.
                    d.appendChild(t);
                    
                    // Append the hbox container to the container node.
                    this.containerNode.appendChild(d);
                }
                
                // Is this widget horizontal?
                if (sec.defn.horiz) {
                    // Create the slot name.
                    var slotName = 'hi' + index;
                    
                    // Set the child widgets slot.
                    sec.slot = slotName;
                    
                    // Create the slot node on the cached hRow.
                    var td = this._hRow.insertCell(-1);
                    
                    // Set vertical align (can't use setAttribute because it fails in IE7).
                    td.vAlign = 'top';
                    
                    // Store in slots collection and indicate that a slot was added..
                    var slots = {};
                    slots[slotName] = td;
                    this.addSlots(slots);
                }
                this._super(sec, index);
            },            
            /**
             * If the layout is set to auto width, we need to set the layout width at least 
             * the size of the visible sections, and a little more in case we have un-rendered
             * sections so the scrolling of the viewport will trigger the rendering and this 
             * method will be called again to calculate again the current width.
             * 
             * @ignore
             */
            getLayoutMinWidth: function getLayoutMinWidth() {
                var minWidth = 0,              // Minimum width of all horizontal section groups. 
                    currentMinWidth = 0,       // Minimum width of the current group of horizontal sections.
                    children = this.children,
                    len = children.length,
                    i, k;
                
                // Iterate trough the children of the horizontal layout (hl), sections.
                for (i = 0; i < len; i++){
                    
                    var sec = children[i],
                        secNode = sec && sec.node,
                        secNodeData = secNode && secNode.data,
                        begin = secNodeData && (String(secNodeData.bh) === 'true' || String(secNodeData.bv) === 'true');
                    
                    // If begining of horizontal or vertical section, store the max width and start again
                    if (begin) {
                        minWidth = Math.max(minWidth, currentMinWidth);
                        currentMinWidth = 0;
                    }
                    
                    if (sec.children) {
                        // If the section has children it is rendered, so try to get the subsections and their widths
                        for (k in sec.children) {
                            currentMinWidth += sec.children[k].width();
                        }
                    } else {
                        // If the section is not rendered, add 10 pixels to the max width so the viewport can do its job when
                        // scrolled to that point.
                        currentMinWidth += 10;
                        break;
                    }
                }

                // Return greater value.
                return Math.max(minWidth, currentMinWidth);
            },
            
            
            /**
             * For DocLayoutHoriz, we need to resize for its height, in addition to its width when finishing rendering/updating 
             * its 'Fit to Content' children. 
             */
            resizeOrReposition: function(){
                if(this._super){
                    this._super();
                }
                
                resizeForSharedHeight(this);
            },
            
            
            /**
             * Adjust the width of the containerNode to account for any 'Fit to Content' objects.
             * 
             * @ignore
             * @see mstrmojo._CanRenderDocOnScroll
             */
            renderCtrlsInViewport: function renderCtrlsInViewport() {
                this._super();
                resizeForSharedHeight(this);
            }
            
        }
    );
    
}());