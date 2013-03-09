(function () {
    mstrmojo.requiresCls("mstrmojo.SliderBox", "mstrmojo._IsInputControl", "mstrmojo.Box");
    
    var $C = mstrmojo.css,
        $D = mstrmojo.dom,
        INPUT_VALUES_MANUAL = 1;
    
    mstrmojo.SliderDIC = mstrmojo.declare(
        
        mstrmojo.SliderBox,

        [mstrmojo._IsInputControl],
        
        {
            scriptClass: "mstrmojo.SliderDIC",            
         
            popupStyle: 1, //POPUP_ABOVE
            
            init: function(props) {            
                if(this._super) {
                    this._super(props);
                }             
                
                this.cssClass = this.showByDefault ? 'mstrmojo-SliderGroup' : 'mstrmojo-PopupSlider';
                
                this.items = this.getItems();
                
                if (this.dic.ipt !== INPUT_VALUES_MANUAL){
                    this.isSequential = true;
                    this.max = this.dic.max;
                    this.min = this.dic.min;
                    this.interval = this.dic.itv;
                }
                
            },
            
            preBuildRendering: function(){
                this._super();
                
                var dic = this.dic,
                    ldw = (dic.ldw != null) ? dic.ldw/100 : 0.4,
                    width, os = this.openerStyle;
                
                //calculate the sliderbar's width
                if (this.showByDefault){
                    // inlineWidth - [label display width] - rightPadding
                    width = os.iw  *(1-ldw) - os.rp;
                    this.alignSlider(this.openerNode, os.ih);
                }else{
                    width = dic.w;
                }
                
                this.sliderBar.set('width', width);
                
                this.valueText = this.showByDefault ? this.dv : this.value;
                if (!this.showByDefault && this.unset && this.isSequential){
                    //We need to indicate it as "out of range" for popup slider if unset and calculated.
                    this.valueText +=  ' ' + mstrmojo.desc(8316, '(out of range)');
                }
            },
            
            postBuildRendering: function(){
                if (this._super){
                    this._super();
                }
                
                if (this.showByDefault){
                    var dic = this.dic,
                        v = this.value,
                        ldw = (dic.ldw != null) ? dic.ldw : 40,
                        os = this.openerStyle,
                        inlineHeight = os.ih;
                   
                    this.domNode.style.height = inlineHeight + 'px';
                    //width distribution of slider and value label
                    this.valuePartNode.style.width = this.sliderPartNode.style.marginLeft = ldw + '%';
                    
                    //for IE 7, we need set left position for slider bar even it is absoluate position
                    if($D.isIE7) {
                        this.sliderPartNode.style.left = Math.floor(ldw * os.iw /100) + 'px';
                    }
                    
                    if(this.value)
                    
                    if (this.isSequential){
                        this.sliderBar.set('title', mstrmojo.desc(5441, 'Minimum value') + ': ' + this.min + '   ' + mstrmojo.desc(5442, 'Maximum value') + ': ' + this.max);
                    }
                }
            }
        }
    );
})();