(function() {
    
    mstrmojo.requiresCls("mstrmojo.dom", 
                         "mstrmojo.css",
                         "mstrmojo.fx",
                         "mstrmojo._IsRepeatableWidget",
                         "mstrmojo.TristateCheckBox",
                         "mstrmojo.HBox",
                         "mstrmojo.Box",
                         "mstrmojo.Slider", 
                         "mstrmojo.ValidationTextBox",
                         "mstrmojo.ImageToggle",
                         "mstrmojo.Label");
    
    var SLD = 'mstrmojo.Slider',
        BTN = 'mstrmojo.Button',
        LB = 'mstrmojo.Label',
        $D = mstrmojo.dom,
        $C = mstrmojo.css,
        decimal = '.',
        INPUT_VALUES_MANUAL = 1,
        INTEGER = 1, 
        NUMERIC = 3, //EnumDSSXMLDataType.DssXmlDataTypeNumeric
        REAL_NUM = 5, //EnumDSSXMLDataType.DssXmlDataTypeReal
        DOUBLE = 6,
        FLOAT = 7, //EnumDSSXMLDataType.DssXmlDataTypeFloat
        VALIGN_TOP = 1,
        VALIGN_MIDDLE = 2,
        VALIGN_BOTTOM = 3,
//        VARCHAR = 8, //EnumDSSXMLDataType.DssXmlDataTypeChar

        convertEmtoPx = function(dom, v) {
            if ($D.isIE && !/px$/.test(v)) {
                var img = document.createElement('img');
                img.style.zIndex = -1;
                img.style.left = v;
                
                dom.appendChild(img);
                
                //get the pixel value
                var pl = img.style.pixelLeft;
                dom.removeChild(img);
                
                return pl + 'px';
            }
            return v;
        },
        
        getHorizPadding = function(dom) {
            var pl = convertEmtoPx(dom, $C.getStyleValue(dom, 'paddingLeft')) || 0,
                pr = convertEmtoPx(dom, $C.getStyleValue(dom, 'paddingRight')) || 0;
            
            return parseInt(pl, 10) + parseInt(pr, 10);
        },
        
        getVertPadding = function(dom) {
            var pt = convertEmtoPx(dom, $C.getStyleValue(dom, 'paddingTop')) || 0,
                pb = convertEmtoPx(dom, $C.getStyleValue(dom, 'paddingBottom')) || 0;
        
            return parseInt(pt, 10) + parseInt(pb, 10);
        }, 
        
        getVerticalAlign = function(dom) {
            var va = $C.getStyleValue(dom, 'verticalAlign');
            return {'top': VALIGN_TOP, 'bottom': VALIGN_BOTTOM, 'middle': VALIGN_MIDDLE}[va] || VALIGN_TOP; //default is always top
        },
        
    //===================== StepperEditor =========================
    
        stepperEditor = function(di) {
            return {
                targetWidget: mstrmojo.HBox,
                replace: true,
                props: {
                    children: [{
                        scriptClass: BTN,
                        alias: 'minus',
                        cssText: 'width:16px;text-align:right;margin-right:5px', 
                        onclick: function(e) {
                            var v = parseInt(this.parent.stpValue.value, 10);
                            if(v && (v - di.interval) > di.min) {
                                this.parent.stpValue.set('value', (v - parseInt(di.interval, 10)));
                            }
                        },
                        text: '-'
                    },{
                        scriptClass: 'mstrmojo.ValidationTextBox',
                        cssClass: 'mstrmojo-DataInputControl',
                        cssText: 'text-align:center',
                        alias: 'stpValue',
                        dtp: 3,
                        constraints: {
                            trigger: mstrmojo.validation.TRIGGER.ALL
                        }, 
                        text: ''
                    },{
                        scriptClass: BTN,
                        alias: 'plus',
                        cssText: 'width:16px;text-align:right;margin-right:5px',
                        onclick: function(e) {                        
                            var v = parseInt(this.parent.stpValue.value, 10);
                            if(v && (v + di.interval) < di.max) {
                                this.parent.stpValue.set('value', (v + parseInt(di.interval, 10)));
                            }
                        },
                        text: '+'
                    }]
                },
                
                _preRender: function(w, p) {
                    w.stpValue.set('value', w.lv);
                },
                
                _postRender: function(w, p) {
                    w.stpValue.domNode.style.width = (p.clientWidth - 60) + 'px';
                }
                
            };
        },
        
        
        //===================== TextEditor =========================
        
        textEditor = function(di) { 
            var dt = parseInt(di.dt, 10),
                wm = di.wm;                
            
            return {            
                getMarkup: function(widx, data, style) {
                    var w = di.wm ? di.w : null;
                    this.unitsMap[widx] = data;
                    return '<div id="' + this.id + '_' + widx + '" ' + 'style="' + (w ? 'width:' + w + 'px;': '') + 'background-color:#FFFFCC;padding-left:1px;border-left:2px solid #64666E;border-top:2px solid #64666E;border-bottom:1px solid #E8E9EE;border-right:1px solid #E8E9EE;' + (style || '') + '" ' +
                    'onclick="mstrmojo.all[\'' + this.id + '\'].onclick(arguments[0], ' + widx + ', this);" >' +
                        (data.dv || null) +
                    '</div>';   
                },
                
                onclick: function(evt, widx, dom) {
                    var me = this,
                        v = this.unitsMap[widx].value,
                        w = new mstrmojo.ValidationTextBox({
                            dtp: 9,
                            widx: widx,
                            cssClass: 'mstrmojo-DataInputControl',
                            cssText: 'padding:0;font-size:inherit;font-family:inherit;text-align:inherit;',
                            value: v,
                            lv: v,
                            constraints: {
                                validator: function(v) {
                                        var SC = mstrmojo.validation.STATUSCODE;
                                        if((dt >= INTEGER && dt <= FLOAT) || (dt === BIGDECIMAL)) {
                                            if(mstrmojo.num.isNumeric(v)) {
                                                return {code:SC.VALID};
                                            }
                                            return {code:SC.INVALID, msg:mstrmojo.desc(7901, 'This field contains numeric value with incorrect format')};
                                        } else { //varchars
                                            return {code:SC.VALID};
                                        }
                                },
                                trigger: mstrmojo.validation.TRIGGER.ONKEYUP
                            },
                            onblur: function(e) {
                                e = e.e || e;
                                var t = $D.eventTarget(window, e);
            
                                if(t.value !== this.lv) {
                                    // if updated
                                    me._dataChanged(this.widx, this.lv, t.value, this.containerDOM);
                                    this.set('lv', t.value);
                                }                    
                            }
                        }),
                        p = dom.parentNode;
                    
                    if(di.ml) {
                        w.set('maxLength', di.ml);
                    }
                    if(w.dv) {
                        w.set('value', w.dv);
                    }
                    
                    w.render();
                    
                    if(di.wm) {//fixed
                        w.domNode.style.width = (di.w) + 'px';
                    } else { //inherit
                        if(!this.inlineWidth) {
                            this.inlineWidth = dom.clientWidth - 4;
                        }
                        w.domNode.style.width = this.inlineWidth + 'px';
                    }

                    p.replaceChild(w.domNode, dom);                    
                    w.domNode.onclick = function(e) {
                        $D.stopPropogation(window, e);                        
                    };
                }
                
            };
        },        
        
        /*
        textEditor = function(di) { 
            var dt = parseInt(di.dt, 10);
            
            return {            
                targetWidget: mstrmojo.ValidationTextBox,
                replace: true,
                props: {
                    dtp: 9,
                    cssClass: 'mstrmojo-DataInputControl',
                    constraints: {
                        validator: function(v) {
                                var SC = mstrmojo.validation.STATUSCODE;
                                if(dt === NUMERIC || dt === REAL_NUM) {
                                    if(mstrmojo.num.isNumeric(v)) {
                                        return {code:SC.VALID};
                                    }
                                    return {code:SC.INVALID, msg:'This field must be a valid Number'};
                                } else { //varchars
                                    return {code:SC.VALID};
                                }
                        },
                        trigger: mstrmojo.validation.TRIGGER.ONKEYUP
                    },
                    onfocus: function() {
                        this.set('value', this.lv);
                    },
                    onblur: function(e) {
                        e = e.e || e;
                        var t = $D.eventTarget(window, e);
    
                        if(t.value !== this.lv) {
                            // if updated
                            this.parent._dataChanged(this.widx, this.lv, t.value);
                            this.set('lv', t.value);
                        }                    
                    }
                },
                                
                _preRender: function(w, p) {
                    if(di.ml) {
                        w.set('maxLength', di.ml);
                    }
                    if(w.dv) {
                        w.set('value', w.dv);
                    }
                },
                
                _postRender: function(w, p) {
                    if(di.wm) {//fixed
                        w.domNode.style.width = (di.w) + 'px';
                    } else { //inherit
                        w.domNode.style.width = (p.clientWidth - 4) + 'px';
                    }
                }
            };
        }, */
            
        //===================== SliderEditor =========================
        
        sliderEditor = function(di) {
            var ipt = parseInt(di.ipt, 10),
                max = di.max,
                min = di.min,
                itv = di.itv,
                ldw = (di.ldw !== undefined) ? di.ldw/100 : 0.4,
                dx = (String(itv)).indexOf(decimal),
                nm = dx > 0 ? (String(itv)).substring(dx+1).length : 0,
                items = (function (min, max, interval) {
                    var m = [], i, v, len, vls;
                    if(ipt === INPUT_VALUES_MANUAL) {
                        vls = di.vls;
                        for(i = 0, len = vls.length; i < len; i++) {
                            v = vls[i].v || vls[i];
                            m[i] = {'n': mstrmojo.num.toLocaleString(v), 'v': v };
                        }
                    } else {
                        for(i = 0, v = min; v <= max; i++, v += interval) {
                            m[i] = {'n': mstrmojo.num.toLocaleString(nm > 0? v.toFixed(nm) : v), 'v': v };
                        }
                    }
                    return m;
                }(min, max, itv));    
            
            return {
                targetWidget: mstrmojo.Box,
                replace: true,
                value: di.v,
                props: {
                    cssClass: 'mstrmojo-SliderGroup',
                    onheightChange: function() {
                        if(this.domNode && this.height) {
                            this.domNode.style.height = this.height + 'px';
                        }
                    },  
                    onwidthChange: function() {
                        if(this.domNode && this.width) {
                            this.domNode.style.width = this.width + 'px';
                        }
                    }, 
                    cssText: 'position:relative;width:auto;',
                    children:
                    [
                        {
                            scriptClass: LB,
                            alias: 'valueText',
                            cssText: 'position:absolute;font-size:inherit;width:' + (ldw*100) + '%;text-align:inherit;margin-right:5px;left:0px;',  
                            text: ''
                        },
                        {
                            scriptClass: SLD,
                            cssText: 'width:auto;height:auto;position:absolute;text-align:left',
                            isHoriz: true,
                            alias: 'sliderBar',
                            ontitleChange: function() {
                                if(this.domNode && this.title) {
                                    this.domNode.setAttribute('title', this.title);
                                }
                            },                            
                            onselectionChange: function(sel) {
                                if(!this.hasRendered) {
                                    return ;
                                }
                                
                                var v = this.items[this.selectedIndex].n,
                                    p = this.parent,
                                    w = p.parent;
                                
                                if(w.lv !== v) {
                                    w._dataChanged(p.widx, w.lv, v, p.containerDOM);
                                    w.lv = v;
                                    p.valueText.set('text', v);
                                }
                                
                                if(p.unset) {
                                    $C.removeClass(this.domNode, 'unset');
                                    p.unset = false;
                                }
                            },
                            value: 0,
                            items: []
                        }
                    ]
                },
                
                _preRender: function(w, p) {
                    var idx = 0,
                        v = w.value;
                    w.set('lv', idx);
                    w.valueText.set('text', w.dv || v);

                    if(ipt !== INPUT_VALUES_MANUAL) {
                        idx = Math.floor((Math.max(Math.min(v, max), min) - min) / itv);
                        if(isNaN(idx)) {
                            idx = 0;
                            w.unset = true;
                        }
                    } else {
                        idx = mstrmojo.array.find(items, 'v', v) || 0;
                    }                    
                    
                    if(!this.hp) {
                        this.hp = getHorizPadding(p); 
                    }
                    if(!this.vp) {
                        this.vp = getVertPadding(p);
                    }
                    
                    //slider bar width
                    if(!this.sw) {
                        this.sw = parseInt((p.clientWidth - this.hp) * (1- ldw) - parseInt($C.getStyleValue(p, 'paddingRight'), 10), 10);
                    }
                    //60 is the sum of minText width + minText margin + maxText width + maxText margin
                    w.sliderBar.set('width', this.sw);
                    w.sliderBar.set('items', items);
                    w.sliderBar.select([idx]);
                },
                
                _postRender: function(w, p) {
                    var v = w.value, top;
                    //box height
                    if(!this.bh) {
                        this.bh = p.clientHeight - this.vp;
                    }
                    w.set('height', this.bh);
                    
                    //vertical align
                    if(!this.va) {
                        this.va = getVerticalAlign(p);
                    }
                    
                    if(this.va) {
                        var ws = w.sliderBar.domNode.style,
                            wv = w.valueText.domNode.style;
                        if(this.va === VALIGN_TOP) {
                            ws.top = '0';
                            wv.top = '0';
                        } else if(this.va === VALIGN_BOTTOM) {
                            ws.bottom = '0';
                            wv.bottom = '0';
                        } else {
                            ws.top = Math.max((Math.floor(this.bh/2) - 6), 0) + 'px';;
                            wv.lineHeight = this.bh + 'px';
                        }
                    }
                    
                    //slider left position
                    if(!this.sl) {
                        this.sl = parseInt(p.clientWidth * ldw, 10) + 'px';
                    }
                    w.sliderBar.domNode.style.left = this.sl;
                    
                    if(ipt !== INPUT_VALUES_MANUAL) {
                        w.sliderBar.set('title', mstrmojo.desc(5441, 'Minimum value') + ':' + min + '   ' + mstrmojo.desc(5442, 'Maximum value') + ':' + max);
                        if(parseFloat(v) < min || parseFloat(v) > max) {
                            w.unset = true;
                        }
                    }
                    
                    if(w.unset) {
                        $C.addClass(w.sliderBar.domNode, 'unset');
                    }
                }
            };
        },
        
        //=============================== Checkbox Editor ============================================
        checkBoxEditor = function(di) {
            var VM = di.vls ? di.vls : null,
                checkAll = function(w, v) {
                    var a, wm = w.widgetsMap;
                    for(a in wm) {
                        if((parseInt(a, 10) !== -1) && wm.hasOwnProperty(a)) {
                            var i = wm[a];
                            if(i.checked !== v) {
                                w._dataChanged(parseInt(a, 10), VM[i.checked ? 1 : 0].v, VM[v ? 1 : 0].v, i.domNode.parentNode);
                                i.set('checked', v);
                            }
                        }
                    }
                };
            
                return {
                    targetWidget: mstrmojo.TristateCheckBox,
                    replace: true,
                    props: {
                        cssText: 'width: 0; margin:0 auto; max-height: 18px; cursor: pointer;',
                        onvalueChange: function() {
                            this.grayed = !(VM[1].v === this.value || VM[0].v === this.value);
                            this.checked = VM[1].v === this.value;
                        },
                        checked: false, //initially we set the checked value to be false
                        onclick: function() {
                            //if the status changed from unset to set, we immediatly check the checkbox, to set the checked to be true 
                            //because initial value was false, so oncheckedChange will get triggered.
                            if (this.grayed) {
                                this.set('grayed', !this.grayed);
                                this.set('checked', true);
                            } else {
                                this.set('checked', !this.checked);
                            }
                        },                        
                        oncheckedChange: function(e) {
                            var widx = this.widx,
                                pw = this.parent,
                                v = this.checked;
                            
                            if(parseInt(widx, 0) === -1) {
                                checkAll(pw, v);
                            } else {
                                if(VM) {
                                    pw._dataChanged(widx, VM[!v ? 1 : 0].v, VM[v ? 1 : 0].v, this.containerDOM);
                                } else {
                                    pw._dataChanged(widx, v, !v, this.containerDOM);
                                }
                            }
                        }
                    },
                    
                    _postRender: function(w, p) {
                        // set height
                        var padding = parseInt($C.getStyleValue(p, 'paddingTop'), 10) + parseInt($C.getStyleValue(p, 'paddingBottom'), 10); 
                        if(!di.hm) { //inherit
                            w.domNode.style.height = p.clientHeight - padding + 'px';
                        } else if(di.hm && di.h) { //fixed
                            w.domNode.style.height = di.h + 'px';
                        }
                        
                        //This is used to hilite the row while mouse over the "mark selection" check box.
                        //TODO: We do not assume InlineDataInput Widget is in <tr>, so ideally, 
                        //      we should pass in a dom node or a path to the dom so that InlineDataInput widget 
                        //      can have the access to make hilited.
                        if (this.hiliteWhenHover){
                            $D.attachEvent(p, 'mouseover', function(evt){
                                $C.addClass(p.parentNode, 'markSelection');
                            });
                            $D.attachEvent(p, 'mouseout', function(evt){
                                $C.removeClass(p.parentNode, 'markSelection');
                            });
                        }
                    }
                };
        },
        
        //====================== toggle editor ===============================
        toggleEditor = function(di) {
            
            return {
                targetWidget: mstrmojo.ImageToggle,
                replace: true,
                props: {
                    onblur: function(e) {                
                        var v = this.value,
                            evt = e.e || e;
                            dom = this.domNode,
                            ofst = mstrmojo.boxmodel.offset(dom, document.body);
                        if(evt.clientX > ofst.left && evt.clientX < ofst.left + dom.offsetWidth && evt.clientY > ofst.top && evt.clientY < ofst.top + dom.offsetHeight) {
                            this.domNode.focus();    
                        } else {
                            if(this.lv !== v) {
                                this.parent._dataChanged(this.widx, this.lv, v, this.containerDOM);
                                this.set('lv', v);
                            }
                        } 
                    },
                    unset: di.ust
                },
                _postRender: function(w, p) {
                    w.set('width', p.clientWidth - 4); //considering padding
                    w.set('height', p.clientHeight - 4); //considering padding
                    w.set('imageList', di.vls);
                }                
            };
        },
        
        //===================== text area editor ===========================
        BASEFORM_PICTURE = 4,
        BASEFORM_URL = 5,
        BASEFORM_EMAIL = 6,
        BASEFORM_HTMLTAG = 7,
        BASEFORM_SYMBOL = 10,

        textAreaEditor = function(di) {
            var textAreaProps;
            mstrmojo.requiresCls("mstrmojo.ElasticTextArea");

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
                    },                    
                    onpopupwidthChange: function() {
                        this.etab.set('popupWidth', this.popupwidth || 200);
                    },
                    onheightChange: function() {
                        if(this.height) {
                            this.domNode.style.height = this.height + 'px';
                        }
                    },
                    children: [{
                        alias: 'preview',
                        scriptClass: 'mstrmojo.Label'
                    },{
                        alias: 'etab',
                        popupToBody: true,
                        maxLength: di.ml || 250,
                        cssText: 'position:absolute;right:0;top:0px',
                        onvalueChange: function() {                            
                            if(this.value !== this.parent.value) {
                                var p = this.parent;
             
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
                                p.parent._dataChanged(p.widx, p.lv, this.value, p.containerDOM);
                                p.set('lv', this.value);
                            }
                        },
                        scriptClass: 'mstrmojo.ElasticTextAreaButton'                        
                    }]    
                };
            } else {
                textAreaProps = {   
                    cssText: 'position:relative',
                    onpopupwidthChange: function() {
                        this.eta.set('width', (this.popupwidth - 4) || 200);
                    },
                    onheightChange: function() {
                        if(this.hasRendered && this.height) {
                            this.domNode.style.height = this.height + 'px';
                            this.eta.set('height', this.height - 4);
                        }                        
                    },
                    onvalueChange: function() {
                        if(this.lv !== this.value) {
                            this.parent._dataChanged(this.widx, this.lv, this.value, this.containerDOM);
                            this.set('lv', this.value);
                        }
                    },
//                    children: [{
//                        alias: 'eta',                        
//                        cssText: 'position:absolute;right:6px;top:0px',
//                        maxLength: di.ml || 256,
//                        onblur: function() {
//                            var p = this.parent;
//                            p.set('value', this.value);
//                            p.parent._dataChanged(p.widx, p.lv, this.value, this.containerDOM);
//                            p.set('lv', this.value); 
//                            p.set('dv', this.value); 
//                            
//                        },
//                        bindings: { value: 'this.parent.value' },
//                        scriptClass: 'mstrmojo.ElasticTextArea'
//                    }]
                    children: [{
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
                    }]
                };
            }
            
            return {
                targetWidget: mstrmojo.Box,
                replace: true,
                props: textAreaProps,
                _postRender: function(w, p) {
                    var h = p.clientHeight - ((parseInt($C.getStyleValue(p, 'paddingTop'), 10) + parseInt($C.getStyleValue(p, 'paddingBottom'), 10)) || 0);
                    w.set('height', h || 17); //13 is button hight

                    if(!this.inlineWidth) {
                        this.inlineWidth = p.clientWidth - ((parseInt($C.getStyleValue(p, 'paddingLeft'), 10) + parseInt($C.getStyleValue(p, 'paddingRight'), 10)) || 0);
                    }
                    w.domNode.style.width = this.inlineWidth ? this.inlineWidth + 'px' : 'auto'; //#473394 - use 'auto'
                    
                    if(di.wm && di.w) {
                        w.set('popupwidth', di.w);
                    } else {
                        var p1 = parseInt($C.getStyleValue(p, 'paddingLeft'), 10) || 0,
                            p2 = parseInt($C.getStyleValue(p, 'paddingRight'), 10) || 0;
                        w.set('popupwidth', p.clientWidth - p1 - p2);
                        
                        w.domNode.onclick = function(e) {
                            $D.stopPropogation(window, e);                        
                        };
                    }
                    
                    if (w.etab) {
                        //#473060 - collect font info.
                        var s = p.currentStyle, f = {};
                        if(!s) {//Firefox and Chrome
                            var dv = document.defaultView,
                            cs = dv && dv.getComputedStyle;
                            s = cs && cs(p, null);
                        }
                        f.fontFamily = s.fontFamily;
                        f.fontSize = convertEmtoPx(p, s.fontSize);
                        f.fontStyle = s.fontStyle;
                        f.fontVariant = s.fontVariant;
                        f.fontWeight = s.fontWeight;
                        f.textAlign = s.textAlign;

                        w.etab.set('font', f);

                    }
                }
            };
        },
        
        //========================== list editor =================================
        listEditor = function(di) {
            var items = (function () {
                var m = [], i, v, vs, len;
                if(parseInt(di.ipt, 10) !== INPUT_VALUES_MANUAL) {
                    for(i = 0, v = di.min; v <= di.max; i++, v += di.itv) {
                        m[i] = {'n': mstrmojo.num.toLocaleString(v), 'v': v};
                    }
                } else {
                    m = di.vls;
                    mstrmojo.array.forEach(m, function(mi) {
                        if(mi.n === undefined) {
                            mi.n = '';
                        }
                    });
                }
                return m;
            }());

            return {
                targetWidget: mstrmojo.DropDownList,
                replace: true,
                props: {
                    onselectedChange: function() {
                        var v = this.selected;
                        this.parent._dataChanged(this.widx, this.lv, v, this.containerDOM);
                        this.set('lv', v);
                        this.set('value', v);
                    }
                },
                _preRender: function(w, p) {
                    var value = w.value,
                        options = items;
                    if (mstrmojo.array.find(items, 'v', value) == -1){
                        options = [{n:di.ust, v:value}].concat(options);
                        w.unset = true;
                    }
                    w.set('options', options);
                },
                _postRender: function(w, p) {                    
                    if(!this.inlineWidth) {
                        this.inlineWidth = p.clientWidth - getHorizPadding(p);
                    }
                    if(!this.inlineHeight) {
                        this.inlineHeight = p.clientHeight - getVertPadding(p); 
                    }
                    if(p.clientHeight !== this.clientHeight) {                        
                        var h = p.clientHeight - getVertPadding(p);
                        this.clientHeight = p.clientHeight;
                        w.selectNode.style.height = (h >= 0) ? h + 'px' : '';
                    } else {
                        w.selectNode.style.height = this.inlineHeight ?  this.inlineHeight + 'px' : '';
                    }
                    w.selectNode.style.width = this.inlineWidth + 'px';
                    
                    //stop click event propogation 
                    w.domNode.onclick = function(e) {
                        $D.stopPropogation(window, e);
                    };
                }
            };
        },

        TEXTBOX = 1,
        SWITCH = 2,
        LIST = 3,
        SLIDER = 4,
        CALENDAR = 5,
        TIMEPICKER = 6,
        TOGGLE = 7,
        TEXTAREA = 8;

    /**
     * Mapping the creator functions to the data input type
     * @ignore
     */
        em = {
                1: textEditor,
                2: checkBoxEditor,
                3: listEditor,
                4: sliderEditor,
                5: textEditor, //Calendar , currently do not support it to be inline mode
                6: textEditor,  //Time picker, currently do not support it to be inline mode
                7: toggleEditor,  //toggle
                8: textAreaEditor    
        };
    
    /**
     * Inline data input widget. The widget can include repeated sub-widgets. 
     */
    mstrmojo.InlineDataInput = mstrmojo.declare(
        //baseclass    
        mstrmojo.Widget,
        //minxins
        [mstrmojo._IsRepeatableWidget],
        /**
         * @lends mstrmojo.InlineDataInput.prototype
         */
        {
            scriptClass: "mstrmojo.InlineDataInput",
            
            markupString: '<div id="{@id}"></div>',
            
            init: function init(props) {
                if(this._super) {
                    this._super(props);
                }
                
                var di = props.editor;                
                this.opener = props.opener;
                //copy the extra functions into the instance
                if(di && di.dm) {
                    mstrmojo.hash.copy(em[di.t](di), this);
                }
            },
            
            /**
             * Notify the opener that the target cell value has changed.
             * @param {String} widx Key to the opener to identify the field.
             * @param {String} r Orinigal value
             * @param {String} v Changed value.
             * @param {HTMLElement} [dom] Target DOM node that contains the change  
             */
            _dataChanged: function(widx, r, v, dom) {
                var op = this.opener;
                if(op) {
                    op.dataChanged(widx, r, v, dom);
                }
            }
        }
    );
    
}());