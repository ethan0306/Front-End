(function() {
    
    mstrmojo.requiresCls("mstrmojo.Button", "mstrmojo.date", "mstrmojo.dom", "mstrmojo.HBox", "mstrmojo.VBox");

    var $P = mstrmojo.date,
        $D = mstrmojo.dom,
        $B = mstrmojo.boxmodel,
        _DT = function(){ return mstrmojo.locales.datetime;},
        SELECT_RANGE = Math.PI / 6,
        HH = 1,
        MM = 2,
        TF = 3,
        AM = _DT().AM_NAME,
        PM = _DT().PM_NAME;

    /**
     * Gets the display string for text field of the stepper
     * @param t
     * @param {Boolean} doNotDisplayZero Whether we should display '0' when the value is under 10. If true, we are not going to display 0 
     * @return
     */
    function getDisplayString(t, doNotDisplayZero) {
        if(t === 0) {
            return '00';
        } else if(t < 10) {
            return doNotDisplayZero ? t.toString() : '0' + t;
        } else {
            return t.toString();
        }
    }
    
    /**
     * Parses the time string and returns an object containing hh, mm in 24 hour format and the h12 property indicating whether the original time
     * string is in 12hour mode or 24hour mode.
     * @param {String} time The expect time in string
     * @returns {Object} An object with hour, min property
     */
    function getTimeObject(time) {
        
        if(!time) {
            return null;
        }
        var t = $P.parseTime(time),
            h12 = /.*\ [a|p]m/i.test(time); //check whether time is 12hours or 24hours
        
        if(!t) {
            var m = $P.parseDateAndOrTime(time);
            t = m && m.time;
            if(!t) {
                // not a valid time
                return null;
            }
        }
        
        if(h12) {
            t.h12 = /.*\ am/i.test(time) ? AM : PM;
        }
        return t;
    }
    
    /**
     * Picks the clock handlers to change time
     * @param {Event} evt Mouse click event
     * @param {HTMLElement} canvas The canvas dom node
     */
    function pickHandle(evt, canvas){
        var me = this,
            ofst = $B.offset(canvas, document.body),
            curHH = (me._hh%12)*(Math.PI/6) + (Math.PI/360)*me._mm,
            curMM = (Math.PI/30)*me._mm,
            dHH = 0,
            dMM = 0,
            cx = ofst.left + 80,
            cy = ofst.top + 80,
            curRA = 0,            
            selected = 0,
            getRotationAngle = function(ox, oy, x, y) {
                var tg = 0, ra = 0,
                    dx = x - ox,
                    dy = oy - y;
                
                if(dy === 0){
                    if(dx >= 0) {
                        ra = Math.PI/2;
                    } else {
                        ra = 3*Math.PI/2;
                    }
                } else if(dx === 0) {
                    if(dy >= 0) {
                        ra = 0;
                    } else {
                        ra = Math.PI/2;
                    }
                } else {
                    tg = dx/dy;
                    if(tg > 0 && dx > 0){
                        ra = Math.atan(tg);
                    } else if(tg > 0 && dx < 0){
                        ra = Math.PI + Math.atan(tg);
                    } else if(tg < 0 && dx > 0) {
                        ra = Math.PI + Math.atan(tg);
                    } else {
                        ra = 2*Math.PI + Math.atan(tg);
                    }
                }
                return ra;
            },
            fn = function(evt) {
                var ra = getRotationAngle(cx, cy, evt.pageX, evt.pageY),
                    lst;
                if(selected === HH) {
                    lst = me._hh;
                    me._hh = Math.floor(ra * 6 / Math.PI);
                    if(me._hh === 0) {
                        if(lst === 23) {
                            me._hh = 0;
                        } else if(lst === 11 || lst === 12){
                            me._hh = 12;
                        } else if(lst > 12) {
                            me._hh += 12;
                        }
                    } else if(me._hh === 11) {
                        if(lst === 0) {
                            me._hh = 23;
                        } else if(lst === 13 || lst === 12) {
                            me._hh = 11;
                        } else if(lst > 12) {
                            me._hh += 12;
                        }
                    }else if(lst >= 12) {
                        me._hh += 12;
                    }
                    me._updateValue();
                } else {
                    lst = me._mm;
                    me._mm = Math.floor(ra * 30 / Math.PI);
                    if(me._mm < 15 && lst > 45) {
                        if(me._hh === 23) {
                            me._hh = -1;
                        }
                        me._hh += 1;
                    } else if(me._mm > 45 && lst < 15) {
                        if(me._hh === 0) {
                            me._hh = 24;
                        }
                        me._hh -= 1;
                    }
                    me._updateValue();
                }
            };
        
        curRA = getRotationAngle(cx, cy, evt.pageX, evt.pageY);
        dHH = Math.abs(curHH - curRA);
        dHH = Math.min(dHH, 2*Math.PI - dHH);
        dMM = Math.abs(curMM - curRA);
        dMM = Math.min(dMM, 2*Math.PI - dMM);
        if(dHH < SELECT_RANGE || dMM < SELECT_RANGE ) {
            if(dMM < dHH) {
                selected = MM;
                me.active = MM;
            } else {
                selected = HH;
                me.active = HH;
            }
            $D.attachEvent(canvas, 'mousemove', fn);
            $D.attachEvent(canvas, 'mouseup', function(evt) {
                $D.detachEvent(canvas, 'mousemove', fn);
            });
        }
    }
    
    /**
     * Draw the analog clock face
     * @param {Object} time The time object containing hour, min, and sec property
     * @param {HTMLElement} canvas The cavas DOM node
     */
    function paintClockFace(time, canvas) {
        var ctx = canvas.getContext("2d"),
            hr = time.hour,
            min = time.min;
                
        ctx.save();
        ctx.clearRect(0, 0, 160, 160);
        
        if(time.h12) {
            ctx.save();
            ctx.fillStyle = hr < 12 ? "rgba(191, 223, 255, 1)" : "rgba(246, 200, 126, .5)"; //different background color for am/pm        
            ctx.fillRect(68, 100, 26, 14);
            ctx.font = "bold 14px sans-serif";
            ctx.fillStyle = "black";
            ctx.fillText(hr < 12 ? "AM" : "PM", 70, 112);
            ctx.restore();
        }
        
        ctx.translate(80,80);
        ctx.scale(0.3,0.3);
        ctx.rotate(-Math.PI/2);
        ctx.fillStyle = "rgb(90, 158, 198)";
        
        // write Hours
        ctx.save();
        ctx.rotate( hr*(Math.PI/6) + (Math.PI/360)*min );
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(-28,0);
        ctx.lineTo(105,0);
        ctx.stroke();
        ctx.restore();
    
        // write Minutes
        ctx.save();
        ctx.rotate( (Math.PI/30)*min );
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-35,0);
        ctx.lineTo(162,0);
        ctx.stroke();
        ctx.restore();
        
        ctx.restore();
    }    
    
    /**
     * Checks whether the mouse is over the AM/PM rectangle in the canvas. 
     * @param {Event} e The mouse event.
     * @param {HTMLElement} canvas The canvas object.
     * @returns {Boolean} returns true if the mouse is over the AM/PM rectangle in the canvas.
     */
    function isAboveAMPM(e, canvas) {
        var ofst = $B.offset(canvas, document.body),
        cx = ofst.left,
        cy = ofst.top;        

        if(e.pageX < cx + 68 || e.pageX > cx + 94 || e.pageY < cy + 100 || e.pageY > cy + 114) {
            return false;
        }
        
        return true;
    }
    
    mstrmojo.TimePicker = mstrmojo.declare(
        mstrmojo.Container, 
        null, 
        {
            scriptClass: "mstrmojo.TimePicker",
            
            markupString: '<div class="mstrmojo-TimePicker {@cssClass}" style="{@cssText}">' +
                              '<div></div>' +
                              '<div class="mstrmojo-Clock-time"><canvas width="157" height="157"></canvas></div>' +
                          '</div>',
            
            cssText: 'width:158px; height:' + ($D.isIE ? 28 : 180) + 'px',
                          
            markupSlots: {
                hbNode: function() { return this.domNode.firstChild; },
                canvasNode: function() { return this.domNode.lastChild;}
            },
                          
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block' : 'none'; },
                onintervalChange: function() { this.interval = parseInt(this.interval, 10); },
                onvalueChange: function() {
                    if (this.domNode){
                        var t, tf;
                        t = getTimeObject(this.value);
                        if(!t) {
                            //if we get a invalid time string, we use current day time as the default value
                            var d = new Date(),
                                dj = $P.getDateJson(d);
                            this.set('value', $P.formatTimeInfo(dj, _DT().TIMEINPUTFORMATS[0]));
                            //as we called set value function, the onvalueChange will be called again.
                            //so we can end here to avoid duplicated executions.
                            return ;
                        }
                        this._hh = t.hour;
                        this._mm = t.min;
                        tf = this.ctn.hb && this.ctn.hb.tf;
                        if(t.h12){
                            tf.set('visible', true);
                            this.set('_tf', t.h12);
                            this.set('_HH', getDisplayString(t.hour > 12 ? t.hour - 12 : (t.hour === 0 ? 12 : t.hour), true));
                        } else {
                            tf.set('visible', false);
                            this.set('_HH', getDisplayString(t.hour, true));
                        } 
                        
                        this.set('_MM', getDisplayString(t.min));
                    
                    
                        if(!$D.isIE) {
                            paintClockFace(t, this.canvasNode.firstChild);
                        }
                        
//                        this.focus();
                    }
                }
            },
            
            /**
             * Indicates which field is active, hour or minute
             */
            active: MM,
            
            /**
             * The value of the picking result, in format: "HH:MM AM" or "HH:MM"
             */
            value: null,
            
            /**
             * An object containing the hh,mm,h12 properties
             */
            _hh: null, _HH: null,
            _mm: null, _MM: null,
            _tf: null,
                        
            /**
             * The interval for steppers
             */
            interval: 5,
                        
            children: [
                {
                    scriptClass: 'mstrmojo.HBox',
                    alias: 'ctn',
                    slot: "hbNode",
                    children: [
                        {
                            scriptClass: "mstrmojo.HBox",
                            alias: "hb",
                            cssText: 'border: 1px solid #CECBCE;margin-left: 5px;background-color:#FFFFCC;',
                            children: [
                               {
                                   scriptClass: "mstrmojo.TextBox",
                                   alias: "hh",
                                   cssText: 'width:15px;border:none;text-align:right;',
                                   bindings: {value: 'this.parent.parent.parent._HH'},
                                   onfocus: function() {
                                       this.ov = this.value; //save original value.
                                       this.domNode.select();
                                       this.parent.parent.parent.active = HH;
                                   },
                                   onblur: function() {
                                       var v = parseInt(this.value, 10);
                                       if(parseInt(this.ov, 10) !== v && v >= 0 && v <= 23) { 
                                           this.parent.parent.parent.updateHours(this.value);
                                           this.ov = this.value;
                                       } else { //if user's input is not valid, use the original value
                                           this.set('value', this.ov);
                                       }
                                   }
                               },                   
                               {
                                   scriptClass: "mstrmojo.Label",
                                   cssText: 'width:5px;',
                                   text: ':'
                               },
                               {
                                   scriptClass: "mstrmojo.TextBox",
                                   alias: "mm",
                                   cssText: 'width:16px;border:none;',
                                   bindings: { value: 'this.parent.parent.parent._MM' },
                                   onfocus: function() {
                                       this.ov = this.value; //save original value.
                                       this.domNode.select();
                                       this.parent.parent.parent.active = MM;
                                   },
                                   onblur: function() { 
                                       var v = parseInt(this.value, 10);
                                       if(parseInt(this.ov, 10) !== v && v >= 0 && v <= 60) {    
                                           this.parent.parent.parent.updateMinutes(this.value);
                                           this.ov = this.value;
                                       } else {
                                           this.set('value', this.ov);
                                       }
                                   }
                               },
                               {
                                   scriptClass: "mstrmojo.TextBox",
                                   cssText: 'width:24px;padding-right:2px;border:none;',
                                   alias: 'tf',
                                   visible: false,
                                   onfocus: function() {
                                       this.ov = this.value; //save original value.
                                       this.domNode.select();
                                       this.parent.parent.parent.active = TF;
                                   },
                                   onblur: function() { 
                                       var v = this.value && this.value.toUpperCase(),
                                           me = this.parent.parent.parent;
                                       if((v === _DT().AM_NAME || v === _DT().PM_NAME) && (v !== this.ov)) {
                                           me.updateHours(me._hh >= 12 ? me._hh - 12 : me._hh + 12);
                                           this.value = this.ov = v;
                                       } else {
                                           this.set('value', this.ov);
                                       }
                                   },                                   
                                   value: 'AM',
                                   bindings: { value: 'this.parent.parent.parent._tf' }
                               }
                            ]
                        },
                        {
                            scriptClass: 'mstrmojo.VBox',
                            alias: 'stepper',
                            slot: 'stepperNode',
                            cssText: 'padding-left: 2px; padding-top: 0px;',
                            children: [
                                       {
                                           scriptClass: 'mstrmojo.Button',
                                           title: mstrmojo.desc(8314, 'Increase'),
                                           cssClass: 'stepper up',
                                           text: '',
                                           onclick: function() {
                                                this.parent.parent.parent.incr();
                                            }, 
                                            onmousedown: function(){
                                                var me = this;
                                                this.tmr = window.setInterval(function() {
                                                    me.parent.parent.parent.incr();
                                                }, 200);
                                            }, 
                                            onmouseup: function() {
                                                if(this.tmr) {
                                                    window.clearInterval(this.tmr);
                                                    delete this.tmr;
                                                }
                                            }
                                       },
                                       {
                                           scriptClass: 'mstrmojo.Button',
                                           title: mstrmojo.desc(8315, 'Decrease'),
                                           cssClass: 'stepper down',
                                           text: '',
                                           onclick: function() {
                                                this.parent.parent.parent.decr();
                                            }, 
                                            onmousedown: function(){
                                                var me = this;
                                                this.tmr = window.setInterval(function() {
                                                    me.parent.parent.parent.decr();
                                                }, 200);
                                            }, 
                                            onmouseup: function() {
                                                if(this.tmr) {
                                                    window.clearInterval(this.tmr);
                                                    delete this.tmr;
                                                }
                                            }
                                       }
                            ]
                        }       
                    ]
                }        
            ],
            
            init: function(props) {
                if(this._super) {
                    this._super(props);
                }
                
                this._hh = 0; this._HH = '';
                this._mm = 0; this._MM = '';
            },
            
            //When focus on the widget is called, focus the mm input field by default.
            focus: function fc(){
                var ctn = this.ctn,
                    hb = ctn && ctn.hb;
                    
                if(!hb || !this.visible) {
                    return ;
                }
                
                if(this.active === HH) {
                    hb.hh.focus();
                } else if(this.active === TF) {
                    hb.tf.focus();
                } else {
                    hb.mm.focus();
                }
            },            
            
            postBuildRendering: function pstBldRnd() {
            	var cvs = this.canvasNode.firstChild,
                    me = this;
                
                if(this._super) {
                    this._super();
                }
                
                if(!this.value) {
                    this.value = "12:00 AM";
                }
                
                if($D.isIE) {
                    this.canvasNode.style.display = 'none';
                } else {
                    paintClockFace({hour: this._hh, min: this._mm}, cvs);
                    cvs.onmousedown = function(e) {
                        pickHandle.call(me, e, cvs);
                    };
                    
                    cvs.onclick = function(e) {
                        if(!isAboveAMPM(e, cvs)) {
                            return ;
                        }
                        me.active = TF;
                        me._hh += me._hh < 12 ? 12 : -12;
                        me._updateValue();                        
                    };
                }
            },            
            
            _updateValue: function() {
                var s;
                
                if(this._tf) {
                    s = _DT().TIMEINPUTFORMATS[0]; // "hh:mm a"
                } else {
                    s = _DT().TIMEINPUTFORMATS[1]; // "hh:mm"
                }
                
                this.set('value', $P.formatTimeInfo({hour: this._hh, min: this._mm}, s));
            },
            
            incr: function() {
                var t;
                if(this.active === HH) {
                    t = this._hh;
                    if(t === 23) {
                        t = -1;
                    }
                    this._hh = t + 1;                    
                } else if(this.active === TF) {
                    if(this._hh > 12) {
                        this._hh -= 12;
                    } else {
                        this._hh += 12;
                    }
                } else {
                    t = parseInt(this._mm, 10) + this.interval;
                    if(t>= 60) {
                        if(this._hh === 23) {
                            this._hh = -1;
                        }
                        this._hh += 1;
                        t = t - 60;
                    }
                    this._mm = t;
                }
                this._updateValue();
            },
            
            decr: function() {
                var t;
                if(this.active === HH) {
                    t = this._hh;
                    t = (t === 0) ? 24 : t;
                    this._hh = t - 1;
                } else if(this.active === TF) {
                    if(this._hh > 12) {
                        this._hh -= 12;
                    } else {
                        this._hh += 12;
                    }
                } else {
                    t = parseInt(this._mm, 10) - this.interval;
                    if(t < 0) {
                        if(this._hh === 0) {
                            this._hh = 24;
                        }
                        this._hh -= 1;
                        t += 60;
                    }
                    this._mm = t;
                }                
                this._updateValue();
            },            
            
            updateHours: function(hh) {
                var v = parseInt(hh, 10);
                
                if(this._tf) {
                    //if originally the hour is for PM, we should keep PM value for the hour
                    if(this._hh >= 12 && v < 12) {
                        this._hh = v + 12;
                    } else {
                        this._hh = v;
                    }
                } else {
                    this._hh = v;
                }
                this._updateValue();
            },            
            
            updateMinutes: function(mm) { 
                this._mm = parseInt(mm, 10);
                this._updateValue();
            }
        }
    );
}());