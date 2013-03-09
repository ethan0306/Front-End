(function() {
    
    mstrmojo.requiresCls("mstrmojo.dom", 
                         "mstrmojo.num", 
                         "mstrmojo.array",
                         "mstrmojo.DICFactory");

    var INPUT_VALUES_MANUAL = 1,
        POPUP_INLINE = 0,
        POPUP_ABOVE = 1,
        POPUP_BELOW = 2,
        decimal = '.', 
        $D = mstrmojo.dom, 
        $C = mstrmojo.css,
        $H = mstrmojo.hash,
    
        /**
         * Utility function to convert em to px.
         * @private
         */
        convertEmtoPx = function(dom, v) {
            if ($D.isIE && !/px$/.test(v)) {
                var img = document.createElement('img'), pl;
                img.style.zIndex = -1;
                img.style.left = v;
                
                dom.appendChild(img);
                
                //get the pixel value
                pl = img.style.pixelLeft;
                dom.removeChild(img);
                
                return pl + 'px';
            }
            return v;
        },
        
        _getScaleStyle = function(dom, n){
            return parseInt(convertEmtoPx(dom, $C.getStyleValue(dom, n)), 10) || 0 ;
        },
        
        getPadding = function(dom){
            return {
                lp: _getScaleStyle(dom, 'paddingLeft'),
                rp: _getScaleStyle(dom, 'paddingRight'),
                tp: _getScaleStyle(dom, 'paddingTop'),
                bp: _getScaleStyle(dom, 'paddingBottom')
            };
        },   
        
        //read font related style info from a given dom node    
        getFontStyle = function(dom){ 
            var s = dom.currentStyle;
            if(!s) {//Firefox and Chrome
                s =  document.defaultView.getComputedStyle(dom, null);
            }
            return {
                fontFamily: s.fontFamily,
                fontSize: convertEmtoPx(dom, s.fontSize),
                fontStyle: s.fontStyle,
                fontVariant: s.fontVariant,
                fontWeight: s.fontWeight,
                textAlign: s.textAlign
            };
        };
    
    mstrmojo._IsInputControl = {
            
        _mixinName: '_IsInputControl',
        
        /**
         * dic config object
         */
        dic: null,
        
        /** 
         * Either an EditableXtab or an EditableTextField object
         */
        owner: null,
        
        /** 
         * For popup, retrieve styles(font, offset, etc..) from it.
         * For inline, render the dic as its child.
         */
        openerNode: null,

        /**
         * It could be POPUP_INLINE, POPUP_ABOVE, POPUP_BELOW
         */
        popupStyle: POPUP_INLINE,
        
        /**
         * This should be populated from DIC
         */
        items: null,
        
        /**
         * Whether the changed value gets applied on enter key
         */
        applyOnEnter: true,
        
        /**
         * Last value
         */
        lv: null,
        
        init: function(props){
            if (this._super){
                this._super(props);
            }

            var dic = this.dic, dt = dic.dt, _DTP = mstrmojo.expr.DTP, dtObj, arr = [];
            
            //TQMS 503967: On android, we always get raw value including both date and time part.
            //Need to truncate the unnecessary part off.
            if (mstrApp.useBinaryFormat) {
                if (dt == _DTP.DATE || dt == _DTP.TIME || dt == _DTP.TIMESTAMP){
                    dtObj = mstrmojo.date.parseDateAndOrTime(this.value);
                    
                    if (dtObj){
                        if (dt != _DTP.TIME){
                            arr.push(mstrmojo.date.formatDateInfo(dtObj.date, mstrmojo.locales.datetime.DATEOUTPUTFORMAT));
                        }
                        
                        if (dt != _DTP.DATE){
                            arr.push(mstrmojo.date.formatTimeInfo(dtObj.time, mstrmojo.locales.datetime.TIMEOUTPUTFORMAT));
                        }
                        this.value = arr.join(' ');
                    }
                }
            }
            
            // sync the last value
            this.lv = this.value;
            
            //This is a hack to fix the incorrect DIC config.
            if (dic.wm && dic.w === undefined){
                dic.wm = 0;
            }
        },
        
        /**
         * It tells whether the input control is shown immediately after the document is rendered 
         */
        showByDefault: false,
        
        /**
         * It tells whether we should render a preview inside the grid cell or text field for the popup dic.
         * @return
         */
        hasPreview: false,
        
        /**
         * Get the items objects from dic.vls object. Convert the values into the local string.
         * @returns {Object} The name value pair for the dic.vls object.
         */
        //TODO: save the calculated items on dic object
        getItems: function() {
            var dic = this.dic, m = [], i, v, nm = 0, 
                dv = String(dic.itv),
                dx = dv && dv.indexOf(decimal); //vls always uses '.' as decimal regardless locale
            
            if(dx >= 0) {
                nm = dv.substring(dx+1).length; 
            }
            
            if(!parseInt(dic.ipt, 10)) {
                for(i = 0, v = dic.min; v <= dic.max; i++, v += dic.itv) {
                    m[i] = {'n': mstrmojo.num.toLocaleString(nm > 0? v.toFixed(nm) : v) , 'v': v};
                }
            } else {
                m = dic.vls;
                mstrmojo.array.forEach(m, function(mi) {
                    if(mi.n === undefined) {
                        mi.n = mstrmojo.num.toLocaleString(mi.v);
                    }
                });  
            }
            
            return m; 
        },

        font: null,
        
        //Apply fonts on the control
        onfontChange: function(){
            if (this.getInputNode){
                var node = this.getInputNode(),
                    f = this.font;
                
                $H.forEach(f, function(o, i){
                    node.style[i] = o;
                });
            }
        },
        
        /**
         * Get the css style of the grid cell or doc text field
         */
        getOpenerNodeStyle: function(){
            var s = this.group && this.group.ons,
                p = this.openerNode;
            
            if (!s){
                s = getPadding(p);
                
                //calculate horizontal padding and vertical padding
                s.hp = s.lp + s.rp;
                s.vp = s.tp + s.bp;
                
                //calculate inline width and inline height
                s.iw = p.clientWidth - s.hp;
                s.ih = p.clientHeight - s.vp;
                
                //For xtab, need to store this information on dicgroup for performance optimization
                if (this.group){
                    this.group.ons = s;
                }
            }
            return s;
        },
        
        /**
         * Will be triggered when DIC's value has been changed. Concrete DIC could override this if needed. (See ToggleDIC.js)
         */
        onvalueChange: function(){
            if (this._super){
                this._super();
            }
            
            if (this.showByDefault){
                this.applyChanges();
            }else{
                if (this.popupStyle !== POPUP_INLINE && this.popup && this.popup.enableApply){
                    this.popup.enableApply();
                }
            }
        },
        
        preBuildRendering: function(){
            if (this._super){
                this._super();
            }
            
            // Do we have extraCssText on this DIC? Append it to the cssText property.
            this.cssText += ' ' + this.extraCssText;
            
            this.openerNode = this.openerNode || this.owner.domNode;
            
            if (this.showByDefault){
                this.openerStyle = this.getOpenerNodeStyle();
            }
            
            if (!this.placeholder){
                this.placeholder = document.body.appendChild(document.createElement("div"));
            }
        },        
        
        postBuildRendering: function(){
            var target = this.openerNode;

            if (this._super){
                this._super();
            }
            
            if (this.showByDefault){                
                // Place the rendered inline widget into openerNode to replace the original content. 
                target.replaceChild(this.domNode, target.lastChild);
            }else{
                // Popup DICs need to inherit the font style of the opener node
                this.set('font', getFontStyle(target));
            }
        },
        
        /**
         * This method will attempt to apply the changes. If the value is changed, it will notify its opener to handle it.
         */
        applyChanges: function() {
            var lv = this.lv, v = this.getCurValue ? this.getCurValue() : this.value, d = this.openerNode,
                dv = this.getDisplayValue? this.getDisplayValue() : v,
                dt = this.dic.dt,
                _DTP = mstrmojo.expr.DTP,
                LD = mstrmojo.locales.datetime;
            
            if (String(v) !== String(lv)){
                // Binary side cannot recognize localized AM/PM string. We need to parse them to standard form.
                if (mstrApp.useBinaryFormat){
                    if (dt == _DTP.TIME || dt == _DTP.TIMESTAMP){
                        v = v.replace(new RegExp(LD.AM_NAME), 'AM').replace(new RegExp(LD.PM_NAME), 'PM');
                    }
                }
                
                if(this.owner && this.owner.dataChanged) {
                    this.owner.dataChanged(this.k, lv, {dv: dv, v: v}, d);
                }
                
                this.lv = v;
                this.dv = dv;
            }
            return true;
        },
        
        /**
         * When cancel changes, we set the value back to its last value because if popup apply button is no clicked, the value can be 
         * changed, so if next time the same dic is opened, we should not use changed value.
         */
        cancelChanges: function cancelChanges() {
            this.value = this.lv;
        },
        
        /**
         * This method is called to render the popup DIC and show it inside the DICPopup
         */
        showInPopup: function() {
            
            this.popup = mstrmojo.DICFactory.createDICPopup(this.owner, this);
            
            if (this.focus){
                this.focus();
            }
        },
        
        /**
         * Implement this function to render a preview inside the grid cell or text field for the popup dics 
         */
        renderPreview: null
    };
}());