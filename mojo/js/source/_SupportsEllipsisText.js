(function() {
    
    mstrmojo.requiresCls("mstrmojo.css",
                         "mstrmojo.dom");
    
    var $DOM = mstrmojo.dom,
        $POS = $DOM.position,
        $MTH = Math;
    
    /**
     * Returns (or creates if necessary) and clone info object for determining ellipsis position.
     * 
     * @param {String} key A unique key (within this widget) for the type of element being tested.  This will be used to cache one element per type.
     * @param {HTMLElement} srcNode The node to test.
     * @param {Boolean} [isMultiLine=false] Whether the element supports multiple lines or not.  NOTE: If this parameters is true the element should have a max-height value.
     * 
     * @returns A clone info object with the following fields:
     * <dl>
     *  <dt>n</dt>
     *  <dd>The cloned node that will be used for DOM testing.</dd>
     *  <dt>m</dt>
     *  <dd>The maximum dimension value (height or width based on isMultiLink parameter).</dd>
     *  <dt>d</dt>
     *  <dd>The lowercase first letter of the appropriate dimension ('h' or 'w').</dd>
     * </dl>
     * 
     * @private
     */
    function getCloneInfo(key, srcNode, isMultiLine) {
        // Do we not already have a cloned node for this key?
        var ellCollection = this._ellTestNodes || {},
            info = ellCollection[key];
        
        // Do we not have an info, OR is the test node in the info not contained within the DOM node (usually due to a re-render of the host)?
        if (!info || !$DOM.contains(this.domNode, info.n, true, document.body)) {
            // Clone src node.
            var node = srcNode.cloneNode(true),
                i;
            
            // Kill the ID and onclick handler.
            node.removeAttribute('id');
            node.removeAttribute('onclick');
            
            // Ensure that the cloned node is invisible and absolutely positioned. 
            var nodeStyle = node.style;
            nodeStyle.visibility = 'hidden';
            nodeStyle.position = 'absolute';
            
            var compStyle = mstrmojo.css.getComputedStyle(srcNode),
                dimensions = [ 'Height', 'Width' ],
                lcDimension = dimensions[(isMultiLine) ? 0 : 1].toLowerCase(),
                d1 = lcDimension.substr(0, 1);
            
            // Iterate dimensions to setup clone node with proper dimensions and boundaries.
            for (i = 0; i < 2; i++) {
                var d = dimensions[i],
                    lc = d.toLowerCase();
                
                nodeStyle[lc] = (lc === lcDimension) ? 'auto' : compStyle[lc];
                nodeStyle['max' + d] = 'none';
            }

            // Append clone into the DOM tree to that we will be able to measure it. 
            srcNode.parentNode.appendChild(node);
            
            // Calculate max size.
            var max = parseInt(compStyle['max-' + lcDimension], 10);
            
            // Is the max not a number?
            if (isNaN(max)) {
                // Set max from measured dimension value of the source node.
                max = $POS(srcNode)[d1];
            }
            
            // Create info.
            info = ellCollection[key] = {
                n: node,            // The cloned node.
                m: max,             // The maximum allowable size in this dimension.
                d: d1               // The first letter of the dimension ('h' or 'w').
            };
            
            // Store the collection back on the instance.
            this._ellTestNodes = ellCollection;
        } else {
            // Replace the inner text with the new text from the src node.
            info.n.innerHTML = srcNode.innerHTML;
            
        }
        
        // Return info.
        return info;
    }
    
    /**
     * Inserts the ellipsisText at the appropriate position.
     * 
     * @param {String[]} textArray An array containing the text to ellipsize.
     * @param {Integer} length The length of the final string (excluding ellipsis).
     * 
     * @returns {String} The ellipsized string.
     *  
     */
    function addEllipsis(textArray, length) {
        var ellipsisText = this.ellipsisText;
        switch (this.ellipsisPosition) {
            case 'middle':
                // Insert ellipsis into middle of final string.
                var mid = $MTH.floor(length / 2);
                return textArray.slice(0, mid).join('') + ellipsisText + textArray.slice(-mid).join('');

            case 'end':
                // Insert ellipes at end of final string.
                return textArray.slice(0, length).join('') + ellipsisText;
                
            default:
                return textArray.join('');
        }
    }
    
    var COMPARE_THRESHOLD = 4;
    
    /**
     * A mixin to add utility functions for intelligently adding ellipsis to HTML element text within a {@link mstrmojo.Widget}.
     * 
     * @class
     * @public
     */
    mstrmojo._SupportsEllipsisText = mstrmojo.provide(
            
        "mstrmojo._SupportsEllipsisText",
        
        /**
         * @lends mstrmojo._SupportsEllipsisText.prototype
         */
        {
            _mixinName: 'mstrmojo._SupportsEllipsisText',
            
            /**
             * The text to use for ellipsis.
             * 
             * @type String
             * @default ...
             */
            ellipsisText: '&hellip;',
            
            /**
             * The position of the ellipsis (middle or end).
             * 
             * @type String
             * @default end
             */
            ellipsisPosition: 'end',
            
            /**
             * This method will add ellipsis to the text of the passed element (if necessary).
             * 
             * @param {String} key A unique key (within this widget) for the type of element being tested.
             * @param {HTMLElement} element The element to test.
             * @param {Boolean} [isMultiLine=false] Whether the element supports multiple lines or not.  NOTE: If this parameters is true the element should have a max-height value.
             */
            ellipsize: function ellipsize(key, element, isMultiLine) {
                // Does the element contain text?
                var text = element.innerHTML;
                if (!text) {
                    // Nothing to do.
                    return false;
                }
                
                // Get clone info and create test function.
                var info = getCloneInfo.apply(this, arguments),
                    fnTestFit = function () {
                        var cloneDimension = $POS(info.n)[info.d];
                        return (cloneDimension <= info.m);
                    };
                    
                // Does the text already fit in the cloned node?
                if (fnTestFit()) {
                    // Nothing to do.
                    return false;
                }
                
                // Perform binary search to find the best fit for the ellipsisized text.
                var node = info.n,
                    textArray = text.split(''),
                    low = 0,
                    high = textArray.length,
                    ellipsizedText, x;
                
                // Is the low value still lower than the high value?
                while (low < high) {
                    // Calculate new mid value.
                    var mid = $MTH.floor((low + high) / 2);
                    
                    // Apply ellipsisized text to test node.
                    text = node.innerHTML = addEllipsis.call(this, textArray, mid);
                    
                    // Does the ellipsisized text fit within the test node?
                    if (fnTestFit()) {
                        // Increase low and test again.
                        low = mid + 1;
                    } else {
                        // Decrease high and test again.
                        high = mid - 1;
                    }
                    
                    // Is the delta between high and low less than the threshold?
                    if (high - low < COMPARE_THRESHOLD) {
                        // Iterate from low to high checking for the first value that doesn't fit.
                        // We've already adjusted low and high in this iteration so we need to go back to the previous values because they may be the one that fit.
                        for (x = low - 1; x < high + 1; x++) {
                            // Set the innerHTML of test node to ellipsized value.
                            text = node.innerHTML = addEllipsis.call(this, textArray, x);

                            // Does this value NOT fit?
                            if (!fnTestFit()) {
                                // We've found the first value that doesn't fit meaning the ellipsizedText field has the last known value to fit so stop the iteration. 
                                break;
                            } 
                            
                            // Store the current value (since it fits) as the ellipsizedText. 
                            ellipsizedText = text;
                        }
                    }
                    
                    // Have we found the ellipsized text that fits?
                    if (ellipsizedText) {
                        // Set innerHTML of original element to ellipsized text and stop the binary search.
                        element.innerHTML = ellipsizedText;
                        break;
                    }
                }
                
                return true;
            },
            
            /**
             * Overridden to clear collection of test nodes.
             * 
             * @ignore
             */
            unrender: function unrender(ignoreDom) {
                // Clean up the collection of test nodes.
                delete this._ellTestNodes;
                
                this._super(ignoreDom);
            }
        });
}());