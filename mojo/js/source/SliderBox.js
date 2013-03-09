(function() {
    mstrmojo.requiresCls("mstrmojo.dom", "mstrmojo.registry", "mstrmojo.tooltip","mstrmojo.HBox");
    var $D = mstrmojo.dom,
        $C = mstrmojo.css,
        VALIGN_TOP = 1,
        VALIGN_MIDDLE = 2,
        VALIGN_BOTTOM = 3,
        getVerticalAlign = function(dom) {
            var va = $C.getStyleValue(dom, 'verticalAlign');
            return {'top': VALIGN_TOP, 'bottom': VALIGN_BOTTOM, 'middle': VALIGN_MIDDLE}[va] || VALIGN_TOP; //default is always top
        };
    
    mstrmojo.SliderBox = mstrmojo.declare(
        mstrmojo.Container,
        
        null,
        
        {
            scriptClass: 'mstrmojo.SliderBox',

            markupString: '<div id="{@id}" class="{@cssClass}" style="{@cssText}">' +
                              '<div class="valuePart" style="{@valueCssText}">' +
                                  '<span class="valueLabel">{@valueLabel}</span>' +
                                  '<span class="valueText">{@valueText}</span>' +
                              '</div>' +
                              '<table class="sliderPart" style="{@sliderCssText}">' +
                                  '<tbody><tr>' + 
                                      '<td class="minText">{@min}</td>' +
                                      '<td class="sliderWrapper"></td>' +
                                      '<td class="maxText">{@max}</td>' +
                                  '</tr></tbody>' + 
                              '</table>' +
                          '</div>',

            markupSlots: {
                valuePartNode: function(){ return this.domNode.firstChild; },
                valueLabelNode: function(){ return this.domNode.firstChild.firstChild; },
                valueTextNode: function(){ return this.domNode.firstChild.lastChild; },
                sliderPartNode: function() { return this.domNode.lastChild; },
                minTextNode: function(){ return this.domNode.lastChild.rows[0].cells[0]; },
                maxTextNode: function(){ return this.domNode.lastChild.rows[0].cells[2]; },
                sliderNode: function(){ return this.domNode.lastChild.rows[0].cells[1]; }
            },
            
            markupMethods: {
                onmaxChange: function(){ this.maxTextNode.innerHTML = this.max; },
                onminChange: function(){ this.minTextNode.innerHTML = this.min; },
                onvalueTextChange: function(){ this.valueTextNode.innerHTML = this.valueText; },
                onunsetChange: function() {
                    var sliderNode = this.sliderBar.domNode;
                    if (sliderNode){
                        mstrmojo.css.toggleClass(sliderNode, 'unset', this.unset); 
                    }
                }
            },
            
            sliderRef: null,
            
            valueLabel: mstrmojo.desc(4104, 'Value:'),
            
            valueText: '',
            
            min: '',
            
            max: '',
            
            interval: 0,
            
            isSequential: false, //Whether the values are sequential

            unset: false,
            
            cssClass: 'mstrmojo-SliderGroup',
            
            postCreate: function postCreate() {
                //add the slider reference class object as its child
                if(!this.sliderRef) {
                    this.sliderRef = {
                        scriptClass: 'mstrmojo.Slider', 
                        isHoriz: true, 
                        ontitleChange: function() {
                            if(this.domNode && this.title) {
                                this.domNode.setAttribute('title', this.title);
                            }
                        },
                        onselectionChange: function() {
                            if(!this.hasRendered) {
                                return ;
                            }
                            var v = this.items[this.selectedIndex] && this.items[this.selectedIndex].n,
                                w = this.parent;
                            
                            if (w.unset){
                                w.unset = false;
                                $C.removeClass(this.domNode, 'unset');
                            }
                            
                            w.set('valueText', v);
                            w.set('value', v);
                            this.typeHelper.updateThumb();
                        }
                    };
                }
                
                this.sliderRef.slot = 'sliderNode'; 
                this.sliderRef.alias = 'sliderBar';
                this.addChildren(this.sliderRef);
            },
            
            preBuildRendering: function(){
                this._super();
                
                var min = this.min, 
                    max = this.max, 
                    v = parseInt(this.value, 10), 
                    items = this.items,
                    idx,
                    sliderBar = this.sliderBar;
                
                if (this.isSequential){
                    //Try to locate the nearest spot inside the range. Mark it unset if out of the range
                    idx = Math.floor((Math.max(Math.min(v, max), min) - min) / this.interval);
                    if(isNaN(v) || v < min || v > max) {
                        this.unset = true;
                    }
                }else{
                    //If the value is not found in the items collection, mark it unset
                    idx = mstrmojo.array.find(items, 'v', v);
                    if (idx == -1){
                        this.unset = true;
                        idx = 0;
                    }
                }
                
                sliderBar.set('items', items);
                sliderBar.select(idx || 0);
            },
            
            postBuildRendering: function(){
                this._super();
                
                if (this.unset){
                    $C.addClass(this.sliderBar.domNode, 'unset');
                }
            },
            
            //align the value and position of slider 
            alignSlider: function(baseNode, height) {

                var va = getVerticalAlign(baseNode),
                    ws, wv;

                //if not rendered yet
                if(!this.valuePartNode) {
                    wv = this.valueCssText || '';
                    ws = this.sliderCssText || ''; 
                    
                    if(va === VALIGN_TOP) {
                        this.valueCssText = 'top:0;' + wv;
                        this.sliderCssText = 'top:0;' + ws;
                    }else if(va === VALIGN_BOTTOM) {
                        this.valueCssText = 'bottom:0;' + wv;
                        this.sliderCssText = 'bottom:0;' + ws;
                    } else {
                        this.valueCssText = 'top:' + Math.max((Math.floor(height/2) - 7), 0) + 'px;' + wv;
                        this.sliderCssText = 'lineHeight:' + height + 'px;' + ws;
                    }
                
                //if already rendered
                } else {
                    ws = this.sliderPartNode.style;
                    wv = this.valuePartNode.style;
                    
                    //vertical align
                    if(va) {
                        if(va === VALIGN_TOP) {
                            ws.top = wv.top ='0';
                        } else if(va === VALIGN_BOTTOM) {
                            ws.bottom = wv.bottom = '0';
                        } else {
                            ws.top = Math.max((Math.floor(height/2) - 7), 0) + 'px';
                            wv.lineHeight = inlineHeight + 'px';
                        }
                    }
                }
            }
        }
    );
})();
