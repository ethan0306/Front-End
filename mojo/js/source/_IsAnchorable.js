(function(){

    mstrmojo.requiresCls("mstrmojo.dom");
    
    var $D = mstrmojo.dom,
        $MATH = Math;
    
        /**
         * Amchors a popup (with dynamic tip) to an HTML Element, intelligently positioning it so it will be visible when the anchor is near an edge.
         */
        function anchorPopup() {
        
            var anchor = this.anchor;
            
            if(!anchor){
                return false;
            }
            
            var boundary = this[this.boundaryNodeName],
                popupNode = this[this.popupNodeName],
                tipNode = this[this.tipNodeName],
                baseTipCls = this.baseTipClass,
                editorOffset = this.anchorOffset,
                defaultOrientation = this.anchorOrientation,
                hasScrollbars = this.hasScrollbars(),
                anchorPosition = this.anchorPosition || $D.position(anchor, true),
                boundaryPosition = $D.position(boundary, true),
                boundaryRight = boundaryPosition.w,
                boundaryBottom = boundaryPosition.h,
                popWidth = popupNode.offsetWidth,
                popHeight = popupNode.offsetHeight,
                halfPopWidth =  popWidth / 2,
                halfPopHeight = popHeight / 2,
                tipPosition = $D.position(tipNode),
                tipDimensionShort = $MATH.min(tipPosition.h, tipPosition.w),
                tipHalfLong = $MATH.max(tipPosition.h, tipPosition.w) / 2;
            
            // Should we allow for scrollbars?
            if (hasScrollbars) {
                // Reduce boudary edges by the default scroll bar width.
                boundaryRight -= 15;
                boundaryBottom -= 15;
            }
            
            // Create default values for popup position, tip position and tip css class.
            var popLeft = boundaryRight / 2 - halfPopWidth,      // Default to center horizontally.
                popTop = boundaryBottom / 2 - halfPopHeight,     // Default to center vertically.
                tipLeft = -1000,                                 // Default to tip offscreen.
                tipTop = -1000,                                  // Default to tip offscreen.
                tipClass;
            
            // Reset anchor position to be relative to boundary position.
            anchorPosition.x = anchorPosition.x - boundaryPosition.x;
            anchorPosition.y = anchorPosition.y - boundaryPosition.y;
                
            var anchorBottom = anchorPosition.y + anchorPosition.h,
                anchorRight = anchorPosition.x + anchorPosition.w,
                fitsRight = ((anchorRight + popWidth) < boundaryRight),
                fitsBottom = ((anchorBottom + popHeight) < boundaryBottom),
                fnBounds = function (minVal, maxVal, desiredVal) {                              // Constrains a value to within the given boundaries.
                    return $MATH.min($MATH.max(minVal, desiredVal), $MATH.max(maxVal, 0));
                },
                fnVertFit = function() {
                    // Will the width of the popup fit within the right boundary and will it either fit to the top or bottom of the anchor?
                    if ((anchorPosition.x < boundaryRight) && (fitsBottom || anchorPosition.y > popHeight)) {
                        // Calculate the mid width point of the anchor.
                        var anchorMidWidth = anchorPosition.x + (anchorPosition.w / 2);
                        
                        // Does it fit below the anchor?
                        if (fitsBottom) {
                            // Tip should appear on the top side of the popup and at the bottom edge of the anchor.
                            tipClass = 'top';
                            tipTop = anchorBottom; 
                            
                            // Popup should appear below the tip.
                            popTop = anchorBottom + tipDimensionShort - editorOffset;
                            
                        } else {
                            // Tip should appear on the bottom side of the popup at the top edge of the anchor.
                            tipClass = 'bottom';
                            tipTop = anchorPosition.y - tipDimensionShort;
                            
                            // Popup should appear above the tip.
                            popTop = tipTop - popHeight + editorOffset;
                        }
    
                        // Ideally the popop should appear horizontally centered with the anchor, but bounded by the boundary edges.
                        popLeft = fnBounds(0, boundaryRight - popWidth, anchorMidWidth - halfPopWidth);
    
                        // Ideally the tip should appear horizontally centered within the anchor, but bounded by the popup edges. 
                        tipLeft = fnBounds(anchorPosition.x, anchorRight, anchorMidWidth) - tipHalfLong;
    
                        // We found a vertical fit, so return true.
                        return true; 
                    }
                    
                    // Doesn't fit vertically, so return false.
                    return false;
                },
                fnHorizFit = function() {
                    // Will the height of the popup fit within the bottom boundary and will it either fit to the right or left of the anchor?
                    if ((anchorPosition.y < boundaryBottom) && (fitsRight || anchorPosition.x > popWidth)) {
                        // Calculate the mid height point of the anchor.
                        var anchorMidHeight = anchorPosition.y + (anchorPosition.h / 2);
                        
                        // Does it fit to the right or the anchor??
                        if (fitsRight) {
                            // Tip should appear on the left side of the popup at the right edge of the anchor.
                            tipClass = 'left';
                            tipLeft = anchorRight; 
                            
                            // Popup should appear to the right of the tip.
                            popLeft = anchorRight + tipDimensionShort - editorOffset;
                            
                        } else {
                            // Tip should appear on the right side of the popup at the left edge of the anchor.
                            tipClass = 'right';
                            tipLeft = anchorPosition.x - tipDimensionShort;
                            
                            // Popup should appear to the left of the tip.
                            popLeft = tipLeft - popWidth + editorOffset;
                        }
                        
                        // Ideally the popop should appear vertically centered with the anchor, but bounded by the boundary edges.
                        popTop = fnBounds(0, boundaryBottom - popHeight, anchorMidHeight - halfPopHeight);
                        
                        // Ideally the tip should appear vertically centered within the anchor, but bounded by the popup edges. 
                        tipTop = fnBounds(anchorPosition.y, anchorBottom, anchorMidHeight) - tipHalfLong;
                        
                        // We found a horizontal fit, so return true.
                        return true;
                    }               
                    
                    // Doesn't fit horizontally, so return false.
                    return false;
                },
                testFns = [ fnVertFit, fnHorizFit ],                // Collection of functions to test for fit, default order is vertical orientation first.
                i = 0;
                
            // Should we check horizontal orientations first?
            if (defaultOrientation === 'h') {
                // Reverse the test functions.
                testFns.reverse();
            }
            
            // Iterate test functions.
            for (; i < 2; i++) {
                // Execute test function.  Did it return true?
                if (testFns[i]()) {
                    // We've found a fit so stop iteration.
                    break;
                }
            }
    
            // Add position css class to tip node (default to hidden).
            tipNode.className = baseTipCls + ' ' + (tipClass || 'hidden');
            
            var tipNodeStyle = tipNode.style,
                popupNodeStyle = popupNode.style;
            
            // Position the tip.
            tipNodeStyle.top = $MATH.round(tipTop) + 'px';
            tipNodeStyle.left = $MATH.round(tipLeft) + 'px';
            
            // Position the popup.
            popupNodeStyle.top = $MATH.round(popTop) + 'px';
            popupNodeStyle.left = $MATH.round(popLeft) + 'px';
            
            return true;
        }
    
    /**
     * Mixin to allow a popup or dialog to be anchored.
     * 
     * @class
     * @public
     */    
    mstrmojo._IsAnchorable = {
        
        /**
         * {HTMLElement} anchor The element that anchors the popup.
         * */
        anchor : null,
        
        /**
         * {Object} it takes 4 properties: 'x','y','w','h' which together define a rectangle area that the popup should be anchored at.
         * If its value is null, it'll be calculated by measuring the given anchor element.
         */
        anchorPosition: null,
        
        /**
         * {String} boundaryNodeName, name of the element that comprises the boundary edges for popup display.
         * */
        boundaryNodeName : 'curtainNode',
        
        /**
         * {String} popupNodeName, name of the element to anchor.
         * */
        popupNodeName : 'editorNode',
        
        /**
         * {String} tipNode The element that represents the popup tip (points to the anchor).
         * */
        tipNodeName : 'tipNode',
        
        /**
         * {String} baseTipCls The css class for the tip element (this method will add 'left', 'right', etc. classes to the base class name).
         * */
        baseTipClass : 'mstrmojo-Editor-tip',
        
        /**
         * {Integer} editorOffset The amount to back the editor off the tip so that they line up correctly.
         * */
        anchorOffset : 25,
        
        /**
         * {String} [defaultOrientation=v] The deafult orientation ("v" = vertical, "h" = horizontal) which will be the first position used when trying to fit the popup.
         * */
        anchorOrientation : 'v',
        
        /**
         * {Function} Return boolean for whether the boundary may contain scroll bars.
         * */
        hasScrollbars : function hasScrollbars(){
            return (!mstrApp.isTouchApp || !mstrApp.isTouchApp());
        },
        
        /**
         * Hook to be called before position the dialog
         * */
        prepareAnchor : mstrmojo.emptyFn,
        
        positionDialog : function positionDialog(){
            this.prepareAnchor();
            if (!anchorPopup.apply(this,[])) {
                // NO, Use default positioning
                if ( typeof this._super === "function" ) {
                    this._super();
                }
            }
        }
    };
    
})();