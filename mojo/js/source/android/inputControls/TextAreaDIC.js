(function(){
    
    mstrmojo.requiresCls("mstrmojo.TextArea", "mstrmojo._IsInputControl", "mstrmojo.android._HasPreviewButton");
    
    var BASEFORM_URL = 5,
        BASEFORM_EMAIL = 6,
        INTEGER = 1, 
        FLOAT = 7, //EnumDSSXMLDataType.DssXmlDataTypeFloat
        BIGDECIMAL = 30; //EnumDSSXMLDataType.DssXmlDataTypeBigDecimal
    
    mstrmojo.android.inputControls.TextAreaDIC = mstrmojo.declare(
        
        mstrmojo.TextArea,
        
        [mstrmojo._IsInputControl, mstrmojo.android._HasPreviewButton],
        
        {
            scriptClass: "mstrmojo.android.inputControls.TextAreaDIC",
            
            cssDisplay: 'block',
            
            init: function(props){
                this._super(props);
                
                this.maxLength = this.dic.ml;
                
                if (!this.showByDefault){
                    this.cssClass = 'mstrmojo-TextAreaDIC-Popup';
                    this.rows = 7;
                }
            },
            
            focus: function focus(){
                mstrmojo.dom.setCaret(this.domNode, (this.value && this.value.length) || 0);
            },
            
            onvalueChange: function(){
                if (!this.showByDefault){
                    this._super();
                }
            },
            
            onblur: function(){
                if (this.showByDefault){
                    this.applyChanges();
                }
            },
            
            applyChanges: function(){
                //TQMS 506312: for Chinese or Korean input, the virtual keyboard can input values without triggering
                //key up, therefore, the value will not get changed. So calling the domNode blur function to force the
                //input box value applied to widget value.
                this.domNode.blur();
                if ((this.dic.dt >= INTEGER && this.dic.dt <= FLOAT) || this.dic.dt == BIGDECIMAL){
                    this.value = parseFloat(this.value);
                }
                this._super();
            },
            
            postBuildRendering: function(){
                this._super();
                
                if (this.showByDefault){
                    var os = this.openerStyle,
                        w = os.iw + 'px',
                        h = (os.ih > 15 ? os.ih : 15) + 'px'; // Inline text area should have a minimum height to allow user to input
                    
                    this.domNode.style.width = w;
                    this.domNode.style.height = h;
                }
            },
            
            renderPreview: function renderPreview(){
                var dic = this.dic, 
                    v = this.value, 
                    dv = this.dv,
                    prefix = '',
                    reg4URL = /(.*href=['"])(.*)(['"].*>)(.*)(<.*)/i;
                
                // if show icon when collapsed
                if (dic.siwc){
                    // different css class if the value is empty
                    this.toggleImagesCss = 'mstrmojo-Android-TextAreaPreview' + (v ? '-filled' : '');
                    
                    if (!v || !dic.sp){ // if value is empty or not show preview text
                        this.dv = '&nbsp;';
                    }else{
                        // if show preview, cut off the overflow part of the display text
                        v = (v.length > dic.pl) ? (v.substring(0, dic.pl) + '...') : v;
                        
                        // build up the email or url link if necessary
                        switch (this.ts) {
                        case BASEFORM_EMAIL:
                            prefix = 'mailto:';
                          //fall through
                        case BASEFORM_URL:
                            if (!dv) {
                                dv = '<a href="mailto:"></a>';
                            }
                            dv = dv.replace(reg4URL, '$1' + prefix + this.value.replace(/\$/g, '$$$$') + '$3' + v.replace(/\$/g, '$$$$') + '$5');
                            break;
                        default:
                            dv = v;
                        }
                        this.dv = dv;
                    }
                    
                    this.renderPreviewButton(this.openerNode, this.dv);
                }
            }
        }
    );
}());