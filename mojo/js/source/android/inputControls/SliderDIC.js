(function(){
    
    mstrmojo.requiresCls("mstrmojo.SliderBox", 
                         "mstrmojo.ui.MobileSlider",
                         "mstrmojo.android.selectors.Slider");
    
    var INPUT_VALUES_MANUAL = 1,
        $NUM = mstrmojo.num;
    
    mstrmojo.android.inputControls.SliderDIC = mstrmojo.declare(
        mstrmojo.SliderBox,
        [mstrmojo._IsInputControl],
        {
            scriptClass: "mstrmojo.android.inputControls.SliderDIC",
            
            popupStyle: 1,
            
            init: function init(props) {
                //as MobileSlider uses min, max interval to set the slider, we
                //set the values based on the items of manual input values.
                var sbMin, sbMax, sbItv, sb;
                
                this._super(props);
                this.items = this.getItems();
                
                this.cssClass = this.showByDefault ? 'mstrmojo-SliderGroup' : 'mstrmojo-PopupSlider';
                
                if (this.dic.ipt !== INPUT_VALUES_MANUAL) {
                    this.isSequential = true;
                    sbMax = this.max = this.dic.max;
                    sbMin = this.min = this.dic.min;
                    sbItv = this.interval = this.dic.itv;
                } else {
                    sbMin = 1;
                    sbMax = this.items.length;
                    sbItv = 1;
                }
                
                sb = this.sliderBar;
                if(sb) {
                    sb.min = sbMin;
                    sb.max = sbMax;
                    sb.interval = sbItv;
                }
            },            
            
            preBuildRendering: function preBuildRendering() {
                //set display value as the value text
                var dic = this.dic,
                    ldw = (dic.ldw != null) ? dic.ldw/100 : 0.4,
                    width, os;

                this.valueText = this.dv;
                this._super();
                
                //if inline, we need to adjust value part width and slider bar width               
                if (this.showByDefault) {
                    //to solve the problem, we set the sliderbox width as the container width * slider bar width percentage
                    //then move the text left to the sliderbox
                    os = this.openerStyle;
                    //set the value part, the left should be the text area percentage * container width 
                    this.valueCssText = 'left:-' + os.iw*ldw + 'px;width:' + os.iw*ldw + 'px';
                    this.cssText = 'width:' + os.iw*(1-ldw) + 'px';
                    
                    this.alignSlider(this.openerNode, os.ih);
                }
            },
            
            onpopupResized: function onpopupResized(e) {
                var sb = this.sliderBar;
                if(sb) {
                    sb.refresh();
                }
            },
            
            /**
             * Create MobileSlider as the child of SliderBox
             */
            sliderRef: {
                scriptClass: "mstrmojo.ui.MobileSlider",
                onslidingValueChange: function() {
                    if(this.hasRendered) {
                        this.selectedIdx = parseInt((this.slidingValue - this.min)/this.interval, 10) || 0;
                        this.parent.selectedIdxChanged(this.selectedIdx);
                    }
                },
                //use selectedIdx to cache the value
                selectedIdx: 0,
                //create select function to set the slidingValue
                select: function(v) {
                    this.selectedIdx = v || 0;
                    this.slidingValue = this.value = this.min + v * this.interval;
                }
            },
            
            /**
             * When the inner slider selected index gets changed, update value and displayed value text.
             */
            selectedIdxChanged: function(v) {
                var sv = this.items[v] && this.items[v].v;
                //TQMS 503056: need to localize the selected value
                this.set('value', $NUM.toLocaleString(sv));
                this.set('valueText', $NUM.toLocaleString(sv));
            }
        }
    );
}());