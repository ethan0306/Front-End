(function() {
    mstrmojo.requiresCls("mstrmojo.dom", "mstrmojo.registry", "mstrmojo.tooltip");
    var $D = mstrmojo.dom;
    var $R = mstrmojo.all;
    
    /**
     * <p>This is a mixin for Drag and Drop Framework. </p>
     * 
     * <p>All its logics are delegated to 'dnd' component.
     * 
     * @class
     * @public
     */
    mstrmojo._HasDnD = {
            // after building the widget, wire up DnD functionality
            postBuildRendering: function postBuildRendering() {
                if (this._super) {
                    this._super();
                }
        
                // DnD logics are all in 'dnd' namespace.
                var id = this.id;
                this.dnd = new mstrmojo._DnDComponent({
                    target: this
                });
                this.__mouseDownEvt = function (e) {
                    $R[id].dnd.onmousedown(e);
                    return true;
                };
                $D.attachEvent(this.dndNode, 'mousedown', this.__mouseDownEvt);
            },
            
            unrender: function unrn() {
                // Destroy the dom event handler.
                if (this.__mouseDownEvt && this.dndNode) {
                    $D.detachEvent(this.dndNode, 'mousedown', this.__mouseDownEvt);
                }
                
                this._super();
            }          
            
    };
    /**
     * <p>The DnD component which will be used by mstrmojo._HasDnD mixin. </p>
     * 
     * This component will be created and initiated for each component that needs DnD support.
     * It expects the client to setup a property called <b>'dndNode'</b> before _HasDnD.postBuildRendering() is called. 
     * DnD feature will listen to the mousedown event of this <b>'dndNode'</b> to start to drag.
     * It has three empty functions which expect client to plugin real implementation:</p>
     * <ul>
     * <li>afterDragStart -- will be called just before dragging starts;</li>
     * <li>duringDrag    -- will be called for each mouse move during the drag;</li>
     * <li>afterDragEnd -- will be called after mouse up, and drag stops.</li>
     * </ul>
     * 
     * @class
     */
    mstrmojo._DnDComponent = mstrmojo.declare(
        // super class
        null,
        // mixin
        null,
        // instance members
        {
                scriptClass: "mstrmojo._DnDComponent",
                //draggable: true,
                isDragging: null,

                // an object which client can use it to record initial dragging state.
                initD: null,
                // The event starts whole DnD sequence.
                startE: null, 
                // abstract methods for client to implement
                afterDragStart: null,
                duringDrag: null,
                afterDragEnd: null,
                
                // reference back to the object using DnD
                target: null,
                
                // the number of mouse move before dragging start
                mousemoveBuffer: 1,

                // private properties
                _mousemoveCounter: 0,
                /**
                 * Constructor for DnD component
                 */
                init: function init_DnDComp(props) {
                    
                    // Apply the given properties to this instance.
                    mstrmojo.hash.copy(props, this);    // Optimization: use copy rather than mixin, unless truly needed.
                },
                /**
                 * Call back for mousedown to start monitoring mouse move.
                 */
                onmousedown: function onmousedown(e) {
                    // For an FF bug. When attempting to drag, the icon changes to a circle with a slash through it.
                    // Firefox has behavior where it allows you to drag images off to other windows, or on to the desktop. This is likely interfering with the drag operation.
                    // The solution in Firefox is to call event.preventDefault() in the onmousedown event handler to cancel the default image handling.
                    if (e && e.preventDefault) {
                        e.preventDefault();
                    }
                    
                    if (this.dragging) {
                        return true;
                    }
                    
                    var id = this.target.id;
                    if (!this._mousemoveCallback) {
                        this._mousemoveCallback = function(e) {
                            $R[id].dnd.onmousemove(e);
                            return true;
                        };
                    }
                    this._mousemoveCounter = 0;
                    
                    this.startE = mstrmojo.hash.copy(e);
                    
                    $D.attachEvent(document.body, 'mousemove', this._mousemoveCallback); 
                    
                    if (!this._cancelCallback) {
                        this._cancelCallback = function(e) {
                            $R[id].dnd.ondragcancel(e);
                            return true;
                        };
                    }
            
                    $D.attachEvent(document.body, 'mouseup', this._cancelCallback);
                },
                /**
                 * Call back for mouse up after mouse down but before mouse move. So, basically cancel the drag action
                 */
                ondragcancel: function ondragcancel(e) {
                    // This gets called only if you mousedown but never start a drag.
                    $D.detachEvent(document.body, 'mousemove', this._mousemoveCallback); 
                    $D.detachEvent(document.body, 'mouseup', this._cancelCallback);
                },
                /**
                 * Call back for mouse move. When mousemove exceed the limit, then start dragging 
                 */
                onmousemove: function onmousemove(e) {
                    if (this.dragging) {
                        return;
                    }
                    this._mousemoveCounter++;
                    if (this._mousemoveCounter > this.mousemoveBuffer) {
                        $D.detachEvent(document.body, 'mousemove', this._mousemoveCallback);
                        $D.detachEvent(document.body, 'mouseup', this._cancelCallback);
            
                        this.initDrag(e);
                    }
                },
                /**
                 * Initialize dragging.
                 */
                initDrag: function initDrag(e) {
                    this.dragging = true;
                    var id = this.target.id;
                    if (!this._dragCallback) {
                        this._dragCallback = function(e) {
                            $R[id].dnd.ondrag(e);
                            return true;
                        };
                    }
        
                    $D.attachEvent(document.body, 'mousemove', this._dragCallback);
        
                    if (!this._dragEndCallback) {
                        this._dragEndCallback = function(e) {
                            $R[id].dnd.ondragend(e);
                            return true;
                        };
                    }
                    $D.attachEvent(document.body, 'mouseup', this._dragEndCallback);
                    
                    // hookup
                    if (this.afterDragStart) {
                        this.afterDragStart.apply(this.target, [e]);
                    }
                    
                    this._dragCallback(e);
                },
                /**
                 * The call back to handle real dragging action.
                 */
                ondrag: function ondrag(e) {
                    // hookup
                    if (this.duringDrag) {
                        this.duringDrag.apply(this.target, [e]);
                    }
                },
                /**
                 * The call back when dragging ends. 
                 */
                ondragend: function ondragend(e) {
                    this.dragging = false;
                    $D.detachEvent(document.body, 'mousemove', this._dragCallback);
                    $D.detachEvent(document.body, 'mouseup', this._dragEndCallback);
                    // hook up
                    if (this.afterDragEnd) {
                        this.afterDragEnd.apply(this.target, [e]);
                    }
                }    
        }
    );

    mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo._HasDnD", "mstrmojo._ListSelections");
    /**
     * Helper object for single slider calculations.
     * 
     * @private
     * @ignore
     */
    function SingleSlider(sl) {
        this.getUnit = function getUnit() {
            return sl._effLen / (sl.items.length - 1) || 1;
        };
        
        this.calcMinMax = function (pxMin, pxMax) {
            var p = Math.round((pxMin / sl.unit + pxMax / sl.unit) / 2);
            return {
                min: p,
                max: p
            };
        };
        
        this.preUpdateThumb = function () {
            sl.start = Math.min(sl.min * sl.unit, sl._effLen) + 'px';
            sl.sdCssText += sl.orCfg.posCssP + ':' + sl.start + ';';
        };
        
        this.updateThumb = function () {
            sl.containerNode.style[sl.orCfg.posCssP] = sl.start = Math.min(sl.min * sl.unit, sl._effLen) + 'px';
        };
    }
    
    /**
     * Helper object for multi-slider calculations.
     * 
     * @private
     * @ignore
     */
    function MultiSlider(sl) {
        this.getUnit = function () {
            return sl._effLen / sl.items.length; // ?? if length == 0 ??
        };
        
        this.calcMinMax = function (pxMin, pxMax) {
            return {
                min: Math.floor(pxMin / sl.unit + 0.5),
                max: Math.floor(pxMax / sl.unit - 0.5)
            };
        };
        
        this.preUpdateThumb = function () {
            sl.start = (sl.min * sl.unit) + 'px';
            sl.length = Math.max(Math.round((sl.max - sl.min + 1) * sl.unit - sl.gap), 0) + 'px';
            sl.sdCssText += sl.orCfg.posCssP + ':' + sl.start + ';' + sl.orCfg.lenCssP + ':' + sl.length + ';';
        };
        
        this.updateThumb = function () {
            sl.start = sl.min * sl.unit + 'px';
            sl.containerNode.style[sl.orCfg.posCssP] = (sl.min * sl.unit) + 'px';
            sl.length = Math.max(Math.round((sl.max - sl.min + 1) * sl.unit - sl.gap), 1) + 'px';
            sl.containerNode.style[sl.orCfg.lenCssP] = sl.length;
        };
    }
    var _tooltipMarkup = '<span>{@content}</span>';
    /**
     * <p>The widget for vertical Slider.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.Slider = mstrmojo.declare(
            // super class
            mstrmojo.Container,
            
            // mixins
            [mstrmojo._HasDnD, mstrmojo._ListSelections],

            /** 
             * @lends mstrmojo.Slider.prototype
             */
            {
                scriptClass: "mstrmojo.Slider",
                
                markupString: '<div class="mstrmojo-Slider {@cssClass} {@clsType} {@clsOrientation}" style="{@cssText}" >' +
                                '<div class="cont">' +
                                	'<div class="bk" style="{@bkCssText}"></div>' +
                                	'<div class="sdc" style="position:absolute;{@sdcCssText}">' +
	                                    '<div class="sd" style="{@sdCssText}">' + 
	                                        '<div class="t1"></div>' +
	                                        '<div class="t2"></div>' +
	                                        '<div class="t3"></div>' +
	                                    '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>',
                                        
                sdCssText: '',
                
                cssClass: 'sc',
                
                clsType: 'sc2',
                
                clsOrientation: 'sc-v',
                
                /**
                 * Private object to hold orientation configuration parameters.
                 * 
                 * @private
                 * @type Object
                 */
                orCfg: null,
                
                /**
                 * An object that the slider uses for calculating thumb positions.
                 * 
                 * @private
                 * @type Object
                 */
                typeHelper: null,
                /**
                 * How to position the tooltip. refer to mstrmojo.Tooltip.posType
                 * 
                 * @type Integer
                 * @private
                 */
                _tooltip_pos: 0,
                
                useRichTooltip: true,
                
                init: function init(p) {
                    this._super(p);
                    
                    // Setup orientation based configuration parameters.
                    if (p.isHoriz) {
                        this.orCfg = {
                            posCssP : 'left',
                            marginCssP: 'marginLeft',
                            lenCssP : 'width',
                            lenP : 'clientWidth',
                            opPosCssP: 'top',
                            thickP: 'clientHeight',
                            offsetP: 'x'
                        };
                        
                        this.clsOrientation = ' sc-h';
                        this._tooltip_pos = mstrmojo.tooltip.POS_BOTTOMLEFT;
                    } else {
                        this.orCfg = {
                            posCssP : 'top',
                            marginCssP: 'marginTop',
                            lenCssP: 'height',
                            lenP : 'clientHeight',
                            opPosCssP: 'left',
                            thickP: 'clientWidth',
                            offsetP: 'y'
                        };
                        this._tooltip_pos = mstrmojo.tooltip.POS_TOPRIGHT;
                    }
                    // TQMS 394889
                    this._exRoom = this.thumbWidth;
                    if (this.multiSelect) {
                        this._exRoom *= 2;
                    }
                    
                    // Change type class if multi-select.
                    if (p.multiSelect) {
                        this.typeHelper = new MultiSlider(this);
                    } else {
                        this.clsType = 'sc1';
                        
                        this.typeHelper = new SingleSlider(this);
                    }
                },
                
                markupSlots: {
                    dndNode: function() {return this.domNode.childNodes[0];},    // dndNode needed by DnD feature
                    bgNode: function() {return this.domNode.childNodes[0].childNodes[0];},
                    sdcNode: function() {return this.domNode.childNodes[0].childNodes[1];},
                    containerNode: function() {return this.domNode.childNodes[0].childNodes[1].childNodes[0];},
                    frontNode: function() {return this.domNode.childNodes[0].childNodes[1].childNodes[0].childNodes[0];},
                    thumbNode: function() {return this.domNode.childNodes[0].childNodes[1].childNodes[0].childNodes[1];},
                    endNode: function() {return this.domNode.childNodes[0].childNodes[1].childNodes[0].childNodes[2];},
                    tooltipNode: function(){return this.domNode.childNodes[0].childNodes[1];}
                },
                
                markupMethods: {
                    onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block' : 'none'; }
                },                
                
                start: '50px',    // thumb start position
                
                length: '30px',    // thumb middle part length
                
                min: 0,            // lower index of current selection
                
                max: 0,            // upper index of current selection
                
                gap: 1,         // the extra -1 is an extra, so our thumb actually is a little bit shorter than the slot on the slider allocated for a unit
                
                ghost: null,    // the ghost image of the dragging thumb
                
                thumbWidth: 11,
                
                /**
                 * The border width for the slider track element (css rule 'bk').
                 */
                cssBkBW: 1,
                
                //========================= Rendering ============================================================
                preBuildRendering: function preBuildRendering() {
                    

                    // Add the length of the slider track to the css text property.
                    var d = this.orCfg.lenCssP,
                        v = this[d],
                        len = parseInt(v);
                    
                    this._effLen = isNaN(len) ? 0 : (len - this._exRoom);
                    
                    if (v) {
                        this.bkCssText = d + ':' + Math.max(parseInt(v, 10) - (2 * this.cssBkBW), 0) + 'px;';
                        this.sdcCssText = d + ':' + this._effLen + ';' + this.orCfg.posCssP + ':' + this._exRoom /2 + 'px;' + this.orCfg.opPosCssP + ':0px;';
                        
                    }
                    
                    // selection related calculation
                    var idx = this.selectedIndices;
                    if (!mstrmojo.hash.isEmpty(idx)) {
                        this.min = this.items.length - 1;
                        this.max = 0;
                        
                        
                        // Calculate min and max values.
                        for (var i in idx) {
                            if (idx[i]) {
                                this.min = Math.min(this.min, i);
                                this.max = Math.max(this.max, i);
                            }
                        }
                    }                    
                    this.unit = this.typeHelper.getUnit();
                    this.typeHelper.preUpdateThumb();
                },
                
                postBuildRendering: function postBuildRendering() {
                    if (this._super) {
                        this._super();
                    }
                    
                    // set up DnD
                    this.dnd.afterDragStart = this.initDrag;
                    this.dnd.duringDrag = this.ondrag;
                    this.dnd.afterDragEnd = this.ondrop;
                },
                
                //======================= Drag and Drop ======================================
                _initGhost: function _initGhost() {
                    if (!this.ghost) {
                        var cn = this.containerNode.cloneNode(true);
                        mstrmojo.css.addClass(cn, ['gh']);
                        
                        // MH: These names are kind of long, especially 'containerNode'.
                        this.ghost = {
                            containerNode: cn,
                            frontNode: cn.childNodes[0],
                            thumbNode: cn.childNodes[1],
                            endNode: cn.childNodes[2]
                        };
                        
                        this.sdcNode.appendChild(cn);
                    }

                    // initialize the ghost to be the same look and feel as the item it's ghosting.
                    var gSty = this.ghost.containerNode.style,
                        cnSty = this.containerNode.style,
                        oc = this.orCfg;
                    
                    gSty[oc.posCssP] = cnSty[oc.posCssP];
                    gSty[oc.lenCssP] = cnSty[oc.lenCssP];
                    gSty.display = 'block';
                    
                    return this.ghost;
                },
                
                initDrag: function initDrag(e, hWin) {
                    hWin = hWin || window;
                    
                    // create ghost
                    var g = this._initGhost(),
                        oc = this.orCfg;
                    
                    // calculate initial state
                    this.dnd.initD = {
                            tP: parseInt(this.start, 10),                        // start position
                            sL: this._effLen,                 // slider length
                            contL: g.containerNode[oc.lenP],                     // container length
                            offset: $D.getMousePosition(this.dnd.startE, hWin)[oc.offsetP]     // mouse start offset
                        };
                        
                        this.dnd.initD.td = $D.eventTarget(hWin, this.dnd.startE);
                },
                
                ondrag: function ondrag(/*DomEvent*/ e, hWin){
                    hWin = hWin || window;
                    
                    var initD = this.dnd.initD,
                        g = this.ghost,
                        cn = g.containerNode,
                        minPx,
                        maxPx,
                        lenPx,
                        min = this.min,
                        max = this.max,
                        oc = this.orCfg;
                    
                    // mouse position offset from initial state
                    var diff = $D.getMousePosition(e, hWin)[oc.offsetP] - initD.offset;
                    switch (initD.td) {
                        case this.thumbNode:    // move
                            minPx = Math.max(Math.min(initD.tP + diff, initD.sL - initD.contL), 0);
                            maxPx = minPx + initD.contL;
                            
                            cn.style[oc.posCssP] = minPx + 'px';
                            
                            var minmax = this.typeHelper.calcMinMax(minPx, maxPx);
                            min = minmax.min;
                            max = minmax.max;
                            break;
                            
                        case this.frontNode:    // stretch forward
                            minPx = Math.max(Math.min(initD.tP + diff, initD.tP + initD.contL), 0);
                            lenPx = Math.max(Math.min(initD.contL - diff, initD.tP + initD.contL), 0);
                            
                            cn.style[oc.posCssP] =  minPx + 'px';
                            cn.style[oc.lenCssP] =  lenPx + 'px';
                            
                            min = Math.min(Math.floor(minPx / this.unit + 0.5), this.max);
                            break;
                            
                        case this.endNode:        // stretch backward
                            lenPx = Math.max(Math.min(initD.contL + diff, initD.sL - initD.tP), 0);
                            maxPx = initD.tP + lenPx;
                            
                            cn.style[oc.lenCssP] =  lenPx + 'px';
                            
                            max = Math.max(Math.floor(maxPx / this.unit - 0.5), this.min);
                            break;
                            
                        default:
                            return;
                        
                    }
                    
                    // update this.min and this.max according to newly calculated min/max
                    if (min !== this.min || max !== this.max) {
                        this.min = min;
                        this.max = max;
                        
                        // update thumb
                        this.typeHelper.updateThumb();
                    }
                    
                    this._updateTooltip();
                },
                
                ondrop: function ondrop(/*DomEvent*/ e){
                    // update real thumb
                    this.typeHelper.updateThumb();
                    
                    // hide ghost
                    if (this.ghost) {
                        this.ghost.containerNode.style.display = "none";
                    }
                    
                    // hide tooltip
                    this.hideTooltip();
                    
                    // update selection
                    if (this.items && this.items.length){ // TQMS 397884
                    var sel = [];
                    for (var i = this.min; i <= this.max; i ++) {
                        sel.push(i);
                    }
                    
                    this.select(sel);
                    }                    
                    // remove temporary data
                    this.dnd.initD = null; 
                },
                
                //======================= Tooltip ===================================================
                showTooltip: function showTooltip(e, win) {
                    this._updateTooltip();
                    this._super(e, win);
                },
                
                hideTooltip: function hideTooltip(e, win) {
                    // if still dragging, return, we need to keep the tooltip
                    if (this.dnd.dragging) {
                        return;
                    }
                    this._super(e, win);
                },
                /**
                 * Positions tooltip correctly according to current slider's position and style (horizontal/vertical).
                 * Updates tooltip content to current selection.
                 * 
                 * @private
                 */
                _updateTooltip: function _updateTooltip() {
                	
                    var oc = this.orCfg,
	                    tt = {
	                            contentNodeCssClass: 'sc-tooltip',
	                            refNode: this.domNode,
	                            posType: this._tooltip_pos // can be mstrmojo.Tooltip.POS_BOTTOMLEFT or mstrmojo.Tooltip.POS_TOPRIGHT
	                        },
                    	ref = (this.ghost) ? this.ghost.containerNode : this.containerNode;
                    
                    //@TODO length depends on _updateThumb to be called first.
                    tt[oc.opPosCssP] = 0; // this.domNode[oc.thickP];
                    tt[oc.posCssP] = ref.style[oc.posCssP];

                    if (this.items && this.items.length) { // TQMS 397884
	                    var min = this.getItemTooltip(this.items[this.min]);
                    var txt;
                    if (this.min === this.max) {
	                        txt = min;
                    } else {
	                        txt = mstrmojo.desc(146, "From:") + " \'" +
	                            min + 
	                            "\' " + mstrmojo.desc(147, "To:") + " \'" + 
	                            this.getItemTooltip(this.items[this.max]) + '\'';
	                    }
	                    
	                    tt.content = _tooltipMarkup.replace(/\{@content\}/g, txt);
                    } else {
                    	tt.content = '';
                    }
                    // this will trigger tooltip widget to refresh itself. if tooltip has already been rendered.
                    this.set('richTooltip', tt);
                },
                
                /**
                 * Returns the tooltip for an item. Default implementation return the ‘n’ property of the item within single quote
                 */
                getItemTooltip: function(item) {
                    return "'" + item.n + "'"; 
                },
                
                unrender: function unrender() {
                    this.ghost = null;
                    this._super();
                },
                
                //======================= Event handling for selection change =========================
                onselectionChange: function onselChg(evt) {
                    // A hook for custom behavior
                    if (this.onchange) {
                        this.onchange();
                    }
                }
            }
    );
    mstrmojo.Slider.SINGLE_HANDLE_WIDTH = 11;
    mstrmojo.Slider.SCROLLHANDLEWIDTH = 11;
    
})();
