(function() {
    mstrmojo.requiresCls("mstrmojo._IsInputControl", "mstrmojo.Box", "mstrmojo.ElasticTextArea", "mstrmojo.hash", "mstrmojo.css");
    
    var BASEFORM_PICTURE = 4,
        BASEFORM_URL = 5,
        BASEFORM_EMAIL = 6,
        BASEFORM_HTMLTAG = 7,
        BASEFORM_SYMBOL = 10;
    
    var $H = mstrmojo.hash,
        $C = mstrmojo.css;
    
       
    mstrmojo.TextAreaDIC = mstrmojo.declare(
            
        mstrmojo.Box,
        
        [mstrmojo._IsInputControl],
        
        {
            scriptClass: 'mstrmojo.TextAreaDIC',
            
            applyOnEnter: false,
            
            /**
             * @Overrided
             */
            onfontChange: function(){
                var f = this.font;
                if(this.etab) {
                    this.etab.set('font', f);
                }else if (this.eta) {
                    this.eta.set('font', f);
                }
            },
            
            focus: function(){
                if (this.eta){
                    this.eta.focus();
                }
            },
            
            init: function(props) {
                if (this._super){
                    this._super(props);
                }
                
                if (this.showByDefault) {
                    var textAreaProps, di = this.dic;
                    
                    if(di.siwc) {
                        textAreaProps = {
                            cssText: 'position:relative;min-height:18px;',
                            ontextChange: function() {
                                this.preview.set('text', this.text);
                            },    
                            onvalueChange: function() {
                                if(di.sp) {
                                    
                                    //#470993 - update preveiw based on FORM Type
                                    var v = this.value,
                                        dv = this.dv || '',
                                        str = '',    // preview string
                                        prefix = ''; //prefix for url - '' for regular url, 'mailto:' for email address
                                    
                                    switch (this.ts) {
                                    case BASEFORM_EMAIL:
                                        prefix = 'mailto:';
                                        //fall through
                                    case BASEFORM_URL:
                                        str = v.substring(0, di.pl);  //for preview
                                        this.dv = str = dv.replace(/(.*href=['"])(.*)(['"].*>)(.*)(<.*)/i, '$1' + prefix + v + '$3' + str + '$5'); //update display value and preview string
                                        break;
                                        
                                    default: 
                                        str = dv.substring(0, di.pl);  //for preview
                                        break;
                                    }
                                    
                                    this.preview.set('text', di.pl > 0 && str.length > 0 ? str + '...&nbsp;&nbsp;&nbsp;' : '');
                                    
                                }
                                //set the button image
                                if(this.etab.domNode) {
                                    if(this.value && this.value.length !== 0) {
                                        $C.addClass(this.etab.domNode, 'filled');
                                    } else {
                                        //if value is empty, we need to set the button to be an empty callout icon
                                        $C.removeClass(this.etab.domNode, 'filled');
                                    }
                                }
                                this.etab.value = this.value;
                                
                                this.applyChanges();
                            },                    
                            onpopupwidthChange: function() {
                                this.etab.set('popupWidth', this.popupwidth || 200);
                            },
                            onheightChange: function() {
                                if(this.height) {
                                    this.domNode.style.height = this.height + 'px';
                                }
                            }
                        };
                    } else {
                        textAreaProps = {   
                            cssText: 'position:relative',
                            onpopupwidthChange: function() {
                                this.eta.set('width', (this.popupwidth - 4) || 200);
                            },
                            onheightChange: function() {
                                if(this.domNode && this.height) {
                                    this.domNode.style.height = this.height + 'px';
                                    this.eta.set('height', this.height - 4);
                                }                        
                            }
                        };
                    }
                    
                    $H.copy(textAreaProps, this);
                    
                    if (di.siwc){
                        this.addChildren([{
                                alias: 'preview',
                                scriptClass: 'mstrmojo.Label'
                            },{
                                alias: 'etab',
                                popupToBody: true,
                                maxLength: di.ml || 250,
                                cssText: 'position:absolute;right:0;top:0px',
                                onvalueChange: function() {                            
                                    if(this.value !== this.parent.value) {
                                        var p = this.parent, prefix = '';
                     
                                        //#470993- update 'dv' based on 'value'
                                        switch (p.ts) {
                                        case BASEFORM_EMAIL:
                                            prefix = 'mailto:';
                                            //fall through
                                        case BASEFORM_URL:
                                            if (!p.dv) {
                                                p.dv = '<a href="mailto:"></a>';
                                            }
                                            var reg_url = /(.*href=['"])(.*)(['"].*>)(.*)(<.*)/i;
                                            p.set('dv', p.dv.replace(reg_url, '$1' + prefix + this.value + '$3' + this.value + '$5'));
                                            break;
                                        default:
                                            p.set('dv', this.value);
                                            break;
                                        }
                                        
                                        p.set('value', this.value);
                                    }
                                },
                                scriptClass: 'mstrmojo.ElasticTextAreaButton'                        
                            }]);
                    }else{
                        this.addChildren({
                            alias: 'eta',
                            cssText: 'background-color:#FFFFCC',
                            maxLength: di.ml || 250,
                            onheightChange: function() {
                                if(this.hasRendered && this.height) {
                                    this.domNode.style.height = this.height + 'px';
                                }
                            },
                            onblur: function() {
                                this.parent.set('value', this.value);
                            },
                            onwidthChange: function() {
                                if(this.hasRendered && this.width) {
                                    this.domNode.style.width = this.width + 'px';
                                }
                            },
                            bindings: {
                                value: 'this.parent.value'
                            },
                            scriptClass: 'mstrmojo.TextArea'
                        });
                    }
                    
                    this.onvalueChange();
                }else{
                    this.addChildren({
                        alias: 'eta',
                        scriptClass: 'mstrmojo.ElasticTextArea',
                        maxLength: this.dic.ml,
                        value: this.value,
                        onvalueChange: function(){
                            this.parent.set('value', this.value);
                        }
                    });
                    
                    this.onpopupwidthChange = function(){
                        this.eta.set('width', (this.popupwidth - 4) || 200);
                    };
                }
            },
            
            postBuildRendering: function() {
                this._super();

                var d = this.dic;
                //if the text area is inline and the icon is not showing, that means the textarea will be a regular textarea input box. 
                //then the textarea should be expanded to fill its container's size
                if (this.showByDefault && !d.siwc) {
                    this.set('height', this.openerStyle.ih);
                    this.set('popupwidth', this.openerStyle.iw);
                //otherwise, we set the width to the textarea     
                } else if(d.wm && d.w) {
                    this.set('popupwidth', d.w);
                }                
            }
        });
}());