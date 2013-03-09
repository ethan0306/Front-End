/*global mstrmojo:false */
(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Container",
        "mstrmojo._Formattable",
        "mstrmojo._ContainsDocObjects",
        "mstrmojo.boxmodel");
    
    /**
     * Private constants for dynamic height and dynamic width (used for CanGrow and CanShrink).
     * 
     * @private
     * @ignore
     */
    var CGS_HEIGHT = 1;
    var CGS_WIDTH = 2;
    
    /**
     * Report Services Document Subsection.
     * @class
     * 
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._Formattable#formatHandlers as #formatHandlers
     * @borrows mstrmojo._Formattable#getFormats as #getFormats
     * 
     * @borrows mstrmojo._ContainsDocObjects#height as height
     * @borrows mstrmojo._ContainsDocObjects#width as width
     * @borrows mstrmojo._ContainsDocObjects#getMaxZIndex as getMaxZIndex
     * 
     * @borrows mstrmojo._HasBuilder#postBuildRendering as #postBuildRendering
     * @borrows mstrmojo._HasBuilder#buildChildren as #buildChildren
     */
    mstrmojo.DocSubsection = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [mstrmojo._Formattable, mstrmojo._ContainsDocObjects, mstrmojo._HasBuilder],
        
        /**
         * @lends mstrmojo.DocSubsection.prototype
         */
        {
            scriptClass: "mstrmojo.DocSubsection",

            markupString: '<div id="{@id}" class="mstrmojo-DocSubsection" style="{@domNodeCssText}"></div>',
            
            markupSlots: {
                containerNode: function() { return this.domNode; }
            },
            
            formatHandlers: {
                domNode: [ 'D', 'B', 'background-color', 'fx' ]
            },
            
            update: function update(node) {
                // if there is a threshold, kill the format
                if(this.thresholdId || node.data.tid) {
                    delete this.fmts;
                }
                
                this.thresholdId = node.data.tid;
                
                if (this._super) {
                    this._super(node);
                }
            },
            
            postBuildRendering: function postBldRndr() {
                var d = this.defn;
            
                // Does this subsection support CanGrow or CanShrink?
                if (d.hc || d.vc) {
                    var dn = this.domNode,
                        f = this.getFormats(),
                        id = this.id,
                        oH = f.height,  // Store original height and width values (pre CanGrow/CanShrink adjustments).
                        oW = f.width;
                    
                    // Set an event listener to hear when the subsection has resized.
                    d.attachEventListener('resized', id, function () {
                        if ('height' in f) {
                            dn.style.height = f.height;
                        }
                        
                        if ('width' in f) {
                            dn.style.width = f.width;
                        }
                    });
                    
                    // Set an event listener to hear when the subsection may need to resize to fit it's contents.
                    d.attachEventListener('adjustSize', id, function (e) {
                        var ds = dn.style,
                        	orgHeight = ds.height;
                        
                        // Is horizontal can shrink or can grow and is the current width different from the original width?
                        if (d.hc && ds.width !== oW) {
                            // Reset width to original width.
                            ds.width = oW;
                        }
                        
                        // Is vertical can shrink or can grow and is the current height different from the original height?
                        if (d.vc && ds.height !== oH) { 
                            // Reset height to original height.
                            ds.height = oH;
                        }
                        
                        this.performCanGrowCanShrink(this.children);

                        //TQMS 479853/436050:  Need to render the objects that are originally not in the viewport.
                        e.heightReduced = (parseInt(orgHeight, 10) > parseInt(ds.height, 10));
                    });
                }
                
                return (this.renderMode !== 'scroll') ? this._super() : true;
            },

            childRenderOnAddCheck: function(children) {
                return (this.renderMode !== 'scroll') ? this._super(children) : false;
            },
            
            /**
             * Calls performCanGrowCanShrink for the single child that was just rendered.
             * 
             * @param {mstrmojo.Event|mstrmojo.Width} obj
             * @ignore
             */
            onchildRenderingChange: function chRnChg(obj) {
                this._super(obj);
                
                // If renderMode is not equal to 'scroll' then perform the CanGrow and CanShrink for the single child that was just rendered. 
                if (this.renderMode !== 'scroll') {
                    this.performCanGrowCanShrink([ (obj && obj.src) || obj ]);
                }
            },
            
            /**
             * Performs the CanGrow and CanShrink operation based on the passed collection of children.
             * 
             * @param {mstrmojo.Widget[]} ch An array of children to be included in the CanGrow and CanShrink calculations.
             * @param {boolean} dontShrink In the event we have to recalculate the section size based on a child and that tries to 
             *          reduce the section height, we do not want to shrink the section. 
             */
            performCanGrowCanShrink: function performCanGrowCanShrink(ch, dontShrink) {
                var defn = this.defn,
                    vc = defn.vc,
                    hc = defn.hc;
            
                // Is CanGrow/CanShrink disabled in both directions?
                if (!ch || ch.length === 0 || (!vc && !hc)) {
                    // Nothing to do.
                    return;
                }
                
                // Cache the formats and subsection DOM node.
                var f = this.getFormats(),
                    ss = this.domNode,
                    me = this;
                
                /**
                 * Iterates through controls to see if subsection height (or width) should be increased.  If so, it will 
                 * set the new size only once, after all controls have been iterated.
                 * 
                 * @param {mstrmojo.Widget[]} ctrls The collection of controls to consider in this operation.
                 * @param {Integer} m The mode to examine (either CGS_HEIGHT or CGS_WIDTH).
                 * @inner
                 * @ignore
                 */
                var fnCalcSize = function (ctrls, m) {
                    var ucProperty = (m === CGS_HEIGHT) ? 'Height' : 'Width', // upper-case property name
                        lcProperty = ucProperty.toLowerCase(), // lower-case property name
                        maxProperty = f['max-' + lcProperty], 
                        maxValue = maxProperty && parseInt(maxProperty, 10), // max-height or max-width value
                        prop = (m === CGS_HEIGHT) ? f.height : f.width, 
                        v = prop && parseInt(prop, 10), // the value to be increased
                        currentValue = parseInt(ss.style[lcProperty], 10), // current size
                        i, l;
                    
                    // Iterate through all the controls.
                    for (i = 0, l = ctrls.length; i < l; i++) {
                        var c = ctrls[i],
                            // For some widget, domNode does not carry the dimention information.  
                            // For those cases, a 'dimNode' should be provided to refer to the node which carries the dimension information.
                            // Otherwise, use the control's domNode.
                            cdn = c && (c.dimNode || c.domNode),    
                            ck = defn.ck && defn.ck[c && (c.k || c.content.k)];
                        
                        // Has the child rendered and is it either dynamic in this direction?
                        if (!cdn || !ck || !(ck & m)) {
                            // If not, then skip it
                            continue;
                        }
                        
                        //Handling some text rotation scenarios, this should only affect fx.rt (rotated) objects
                        var fx = (c.fmts && c.fmts.fx) || {},
                            rm = (!mstrmojo.dom.isIE7 && (fx.rt === 1 || fx.rt === 3)) ? (m === CGS_HEIGHT ? CGS_WIDTH : CGS_HEIGHT) : m, //r(otated)m -> swap if the text field is rotated
                            rucProperty = (rm === CGS_HEIGHT ) ? 'Height' : 'Width', // r(otated)ucProperty
                            t = (ucProperty === 'Height') ? 'top' : 'left';
                        
                        // Adjust for effects on the object, in this case for drop shadow (fx.ds || 0)
                        // Compute the end point of the control.  The end point is the top (or left) plus the offestHeight (or offsetWidth).
                        // For selectors, we have a dimNode (not sure why) which stores the dimensions of the selector widget. However, that node does not have the top and left values.
                        // So, I'm forcing it to always take those values from the domNode. For other widgets, it shouldn't make a difference anyway.
                        var b = parseInt(cdn.style[t], 10) + cdn['offset' + rucProperty] + (fx.ds || 0);

                        //Ugly hack to fix 428944, apparently the problem is that the overflow:hidden of the Xtab-content is making the offsetWidth 
                        //of the xTab to be just the sum of the borders (around 2 or 4), the offset width of the xTab-content is the one that has the correct
                        //offset width, this only happens on IE7 for width another problem is that once the subsection is resized correctly the offsetWidth of 
                        //the xtab is working fine, so just do this while the offsetWidth of the xtab is less than the contentNode offsetWidth, better ideas 
                        //will be appreciated.
                        if(mstrmojo.dom.isIE7 && rucProperty === 'Width' && c instanceof mstrmojo.XtabBase &&  b < c.contentNode.offsetWidth){
                            b += c.contentNode.offsetWidth;
                        }
                        
                        // Is the end point of the control greater than the current value?
                        if (b > v) {
                            // Is there a maximum?
                            if (maxValue) {
                                // Set the end point to the minimum of the calculated end point or the maximum.
                                b = Math.min(b, maxValue);
                            }
                            
                            // Set the running size to the new end point (since it's bigger).
                            v = b;
                            
                            // Is the new value equal to the max?
                            if (v === maxValue) {
                                // Break, since the subsection is as big as it can get.
                                break;
                            }
                        }
                    }

                    //Is the new value different to the currentValue
                    //If we are incrementally rendering, we do not want to update the height of the section if it's smaller than what we
                    //already have.
                    if (v && v !== currentValue && !(v < currentValue && !!dontShrink)) {
                        // Change the size.
                        ss.style[lcProperty] = v + 'px';

                        //#485804 - move this line from outside of 'if' block here - 
                        //  shoult not update '_fixedHeight' with cached vlaue if cached value is smalled than new sectio height
          
                    //Update the cache value to reflect the domNode value
                    me['_fixed' + ucProperty] = parseInt(ss.style[lcProperty],10);
                    }
                };
                
                // Does this section support vertical CanGrow/CanShrink?
                if (vc) {
                    fnCalcSize(ch, CGS_HEIGHT);
                }

                // Does this section support horizontal CanGrow/CanShrink?
                if (hc) {
                    fnCalcSize(ch, CGS_WIDTH);
                }
            },
            
            /**
             * <p>Resizes mstrmojo.DocSubsection elements if CanGrow or CanShrink is enabled and a portal in this section has been maximized.</p>
             * 
             * <p>The resize is done in such a way that all mstrmojo.DocSubsection instances with the same key will also resize.</p>
             * 
             * @returns Object An object with updated properties that should be sent to the server for this subsection. 
             */
            portalMaximized: function portalMaximized() {
                var d = this.defn,
                    vc = d.vc,    // CanGrow/Shrink vertically.
                    hc = d.hc;    // CanGrow/Shrink horizontally.
                
                // Does this subsection support can grow or can shrink?
                if (!hc && !vc) {
                    // If not, then return because there is nothing we need to do.
                    return {};
                }
                
                // Clear all CanGrow and CanShrink properties.
                delete d.vc;
                delete d.hc;
                delete d.ck;    // Collection of id's for dynamically sized objects. 
                
                var f = this.getFormats(),
                    m = this.model,
                    ss = this.domNode,
                    me = this;

                // Create an object to hold server update properties.
                var props = {
                    HideIfEmpty: -1
                };

                /**
                 * Resets height (or width) value, clears associated cache and adds to server properties object.
                 * 
                 * @param {String} h The dimension, either 'Height' or 'Width'.
                 * @param {String} v The suggested subsection height or width as stored in the metadata.
                 * @param {String} [s=''] The suffix to use for the CanGrow and CanShrink server properties, either 'Horizontally' for width or '' for height.
                 * 
                 * @inner
                 * @ignore
                 */
                var fn = function (h, v, s) {
                    var p = h.toLowerCase(),
                        as = parseInt(ss.style[p], 10);    // Current value
                    
                    // If the suggested value is undefined we should use the current value.  Otherwise we should use the maximum of the suggested value or current value.
                    v = ((v === undefined) ? as : Math.max(parseInt(v, 10), as)) + 'px';
                    
                    // Is the suggested value different from the current value?
                    if (f[p] !== v) {
                        // Change the size in the format node.
                        f[p] = v;

                        // Add the new size value to the server properties (needs to be converted to inches).
                        props[h] = mstrmojo.boxmodel.px2Inches(m, v);
                        
                        // Clear the cached height.
                        delete me['_fixed' + h];
                    }
                    
                    // Add server properties.
                    s = s || '';
                    props['Max' + h] = 0;
                    props['CanGrow' + s] = 0;
                    props['CanShrink' + s] = 0;
                };

                // Does this subsection support vertical CanGrow/Shrink?
                if (vc) {
                    fn('Height', f.normHeight);
                }
                
                // Does this subsection support horizontal CanGrow/Shrink?
                if (hc) {
                    fn('Width', f.normWidth, 'Horizontal');
                }
                
                // Raise an event so all instances of this subsection will resized.
                d.raiseEvent({
                    name: 'resized'
                });
                
                return props;
            },
            
            adjustSectionSize: function adjustSectionSize() {
                var d = this.defn;
                
                if (d.vc || d.hc) {
                    return d.raiseEvent({
                        name: 'adjustSize'
                    });
                }
                
                return null;
            },
            
            /**
             * @ignore
             */
            preserveChildDomOrder: false
        }
    );
    
}());