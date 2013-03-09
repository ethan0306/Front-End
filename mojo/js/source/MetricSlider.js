(function() {
    mstrmojo.requiresCls(
            "mstrmojo.Slider",
            "mstrmojo.MetricQualification", 
            "mstrmojo.array");
    
    mstrmojo.requiresDescs(8153,8154,8155,8156,8157,8158,8159,8160,8161,8162,8163,8164,8165,8166,8167,8168,8169,8170,7839,587,2204,2202,2203,7576,7575,7622);
    
    var $D = mstrmojo.dom, $M = mstrmojo.MCSUtil, $DESC = mstrmojo.desc, $C = mstrmojo.css, $NM = mstrmojo.num;
   
    /**
     * Helper object for metric slider calculations and utilities.
     * 
     * @private
     * @ignore
     */
    function MetricSlider(sl) {
        /**
         * Get how many px for one item
         */
        this.getUnit = function () {
            return sl._effLen / Math.max((sl.items.length-1), 1); 
        };
        
        this.calcMinMax = function (pxMin, pxMax) {
            return {
                min: Math.floor(pxMin / sl.unit + 0.5),
                max: Math.floor(pxMax / sl.unit + 0.5) 
            };
        };
        
        this.calcPxIdx = function(px) {
            return Math.floor(px/sl.unit + 0.5);
        };

        /***
         * Get step between each item value 
         * @return
         */
        this.getStep = function() {
            var rng = sl.high - sl.low,
                cat = sl.numFmts.cat,
                adjust = cat == 4 ? 2 : cat == 5 ? 4 : 0;
            rng = rng == 0 ? 1 : rng;
            if (rng > 1) {
                return (rng > (sl._effLen - 2)) ? Number(Number(rng/(sl._effLen - 2)).toFixed(sl.numFmts.dp + adjust)) : 1;
            } else {
                return rng/(sl._effLen - 2);
            }
        };
        
        /***
         * Get the item index with the nearest value for input value
         *  @param len
         * @return
         */
        this.getIdx = function(vl) {
            return Math.min(Math.max(Math.round( (vl - sl.low)/sl.step), 0), sl.items.length - 1);
        };
        
        /**
         * Initialize metric slider 
         */
        this.initialMetricSlider = function() {
            var notNull = function(v){
                return v !== undefined && v !== null;
            },
            validateData = function(sl) {
                return (notNull(sl.da) && notNull(sl.da.low) && notNull(sl.da.high)&& 
                        notNull(sl.da.cnt) && notNull(sl.f) && notNull(sl.ft) && notNull(sl.qua));
            },
            displayInvalid = function(sl){
                var gen = true,
                    rp = true;
            
                //the display for in, not in, null or not null should be as unset
                if(sl.ft == $M._GENERIC) {
                    gen = sl.f != $M.FN.ISNULL && sl.f != $M.FN.ISNOTNULL && sl.f != $M.FN.NOTIN && sl.f != $M.FN.IN;
                } else if(sl.ft == $M._PERCENT || sl.ft == $M._RANK) {
                    rp = sl.f != $M.MRPFN.INASCENDING && sl.f != $M.MRPFN.INDESCENDING && sl.f != $M.MRPFN.NOTINDESCENDING && sl.f != $M.MRPFN.NOTINASCENDING;
                }
                
                return !gen || !rp;
            },
            adjust = 0;
            
            sl.include = sl.parent.include;
            sl.clsType = 'scm ';
            
            sl.staticStatus = !(notNull(sl.da) && notNull(sl.da.low) && notNull(sl.da.high)&& notNull(sl.da.cnt)&& notNull(sl.qua));
            if (sl.staticStatus) { // set default value , hard code
               sl.da.low = 1;
               sl.da.high = 7;
               sl.ft = $M._GENERIC;
               sl.f = $M.FN.BETWEEN;
               sl.qua = $M.Q._G;
               sl.cs = [{n: '', v: 1}, {n: '', v: 7}];
               sl.numFmts = {cat: 9, dp: 0, fm: ''};
            } 
            
            //initial qualify on
            switch(sl.qua) {
                case 0:
                    var cat = sl.numFmts.cat;
                    adjust = cat == 4 ? 2 : cat == 5 ? 4 : 0;
                    sl.low = Number(Number(sl.da.low ).toFixed(sl.numFmts.dp + adjust));
                    sl.high = Number(Number(sl.da.high).toFixed(sl.numFmts.dp + adjust));
                    break;
                case 1:
                case 2: 
                    sl.low = 1;
                    sl.high = sl.da.cnt;
                    break;
                case 3:
                case 4:
                    sl.low = 0;
                    sl.high  = 100;
                    break;
                }
                
                var ept = !sl.staticStatus && !sl.da.nov && sl.dt != 30;
                sl.set('lowText', ept? $M.formatNumber(sl.qua, sl.low, sl.numFmts) : "");
                sl.set('highText', ept? $M.formatNumber(sl.qua, sl.high, sl.numFmts) : "");
                
                //initial step
                sl.step =  (sl.qua == 1 || sl.qua == 2)? 1 : this.getStep();
                
                sl.low -= sl.step;
                sl.high += sl.step;
                
                //initial cs
                sl.cs1Vl = sl.low;
                sl.cs2Vl = sl.high;

                //initial items array
                var l = sl.low,
                    h = sl.high,
                    itms = [],
                    len = 0;
              
                if ( notNull(l) && notNull(h) && sl.dt != 30) {
                    for (var i = 0, j = l; j <= h; i ++, j += sl.step) {
                        itms[i] = {n : $M.formatNumber(sl.qua, j, sl.numFmts), v: Number(Number(j).toFixed(sl.numFmts.dp + adjust))};
                    }
                    len = itms.length;
                    if (len > 0 && itms[len -1].v != h){  itms[len-1] = {n: $M.formatNumber(sl.qua, h, sl.numFmts), v: h}; }
                }
                
                len = itms.length;
                if(len >= 2 ) {
                    itms[0].n = itms[len -1].n = $DESC(7622);
                }
                
                sl.items = itms;
                    
                //update cs index by parsing constants.
                var $O = $M.OP,
                cs = sl.cs,
                c1 = (cs && cs.length > 0)? $NM.parseNumeric(String(cs[0].v).replace('%', '')) : l,
                c2 = (cs && cs.length >1)? $NM.parseNumeric(String(cs[1].v).replace('%', '')) : h;
                
                if(c1 < sl.low) { sl.frtUst = true;}
                if(c2 > sl.high) {sl.ndUst = true;}
                
                sl.opId = (sl.f != null && sl.ft != null)? $M.getOpIdxByfunc(sl.f, sl.ft) : $O._BETWEEN;
                
               switch (sl.opId){
                    case  $O._EQUALS : 
                    case $O._NOT_EQUALS:
                        sl.cs1Vl = sl.cs2Vl = c1;
                        break;
                    case $O._LESS_EQUAL:
                    case $O._GREATER:
                        sl.cs1Vl = l; 
                        sl.cs2Vl = c1; 
                        break;
                    case $O._GREATER_EQUAL:
                    case $O._LESS:
                        sl.cs1Vl = c1; 
                        sl.cs2Vl = h;
                        break;
                    case $O._IN:
                    case $O._NOT_IN:
                    case $O._IS_NULL:
                    case $O._IS_NOT_NULL:
                        break;
                    default:
                        sl.cs1Vl = c1;
                        sl.cs2Vl = c2;
                        break;
                }
               sl.cs1Idx = this.getIdx(sl.cs1Vl);
               sl.cs2Idx = this.getIdx(sl.cs2Vl);
               
               if(sl.dt != 30){
                   //Try to use the constant, the constant holds the correct value of the expression, 
                   //the items collection contains only an approximate value
                   sl.cs1Nm = notNull(sl.cs1Vl) ? $M.formatNumber(sl.qua, sl.cs1Vl, sl.numFmts) : sl.items[sl.cs1Idx].n; 
                   sl.cs2Nm = notNull(sl.cs2Vl) ? $M.formatNumber(sl.qua, sl.cs2Vl, sl.numFmts) : sl.items[sl.cs2Idx].n;
               }
               
               sl.unit = this.getUnit();
               
               sl.set('unSet', (sl.dt == 30 || !validateData(sl) || displayInvalid(sl) || (!sl.cs || sl.cs.length == 0)) && !sl.staticStatus);
        };
        
        /**
         * Update operator and constant list
         */
        this.updateOpCs = function () {
            //update operator
            var i = (sl.cs1Vl > sl.cs2Vl)? sl.cs2Vl : sl.cs1Vl,
            a = (sl.cs1Vl > sl.cs2Vl)? sl.cs1Vl : sl.cs2Vl,
            l = sl.low,
            h = sl.high,
            il = sl.include, 
            $O = $M.OP,
            isPercent = (sl.qua == $M.Q._PT || sl.qua == $M.Q._PB),
            unset,
            cs = [];
            
            if ((i >= l && a <= h) || i < l || a > h) { sl.opId = (il)? $O._BETWEEN : $O._NOT_BETWEEN;}
            if (i == a) { sl.opId = (il)? $O._EQUALS : $O._NOT_EQUALS;}
            if (i == l && a < h ) { sl.opId = (il)? $O._LESS_EQUAL : $O._GREATER;}
            if (i > l && a == h) {sl.opId = (il)? $O._GREATER_EQUAL : $O._LESS;}
            
            unset = l == i && a == h; 
            if(!unset){
                //update cs
                switch (sl.opId){
                case $O._BETWEEN:
                case $O._NOT_BETWEEN:
                    cs.push({dtp:5, v: $NM.toLocaleString(i) + (isPercent? '%' : '')});
                    
                case $O._EQUALS:
                case $O._NOT_EQUALS:
                    cs.push({dtp:5, v: $NM.toLocaleString(a) + (isPercent? '%' : '')});
                    break;
                 default: 
                     if (i > l) { cs.push({dtp:5, v: $NM.toLocaleString(i) + (isPercent? '%' : '')});}
                     if (a < h) { cs.push({dtp:5, v: $NM.toLocaleString(a) + (isPercent? '%' : '')});}
                }
            }
            sl.cs = cs;
            
            //Update the parent constants as well
            sl.parent.node.data.cs = cs;
            sl.set('unSet', unset);
        };
        
        /*---------Update thumbs position--------------*/
        this.preUpdateThumb = function () {             
            if (sl.cs1Idx !== undefined && sl.cs2Idx !== undefined) {
            var c = sl.orCfg,
                  ps = c.posCssP,
                  len = c.lenCssP,
                  thL = sl._exRoom;
                  
            var i = sl.thumb1 =  ((sl.cs1Idx > sl.cs2Idx)? sl.cs2Idx : sl.cs1Idx) * sl.unit - sl.gap,
                   a = sl.thumb2 = ((sl.cs1Idx > sl.cs2Idx)? sl.cs1Idx : sl.cs2Idx)* sl.unit - sl.gap;
                  
                sl.thumb1CssText = ps +':' +  i + 'px';
                sl.thumb2CssText = ps + ':' +  a + 'px';
                
                sl.firstCssText = len + ':' + Math.max(i, 0) + 'px';
                sl.thumbCssText = ps + ':' + (i  + thL)+ 'px;' + 
                    len + ':' + Math.abs(a - i) + 'px';
                sl.lastCssText = ps + ':' + (a  + thL)+ 'px;' +
                    len + ':' + Math.max(sl._effLen - a, 0) + 'px';
                
                sl.lCssText = "margin-top:5px;float:left";
                sl.hCssText = "margin-top:5px;float:right";
            }
        };
        
        this.updateThumb = function () {
            var  c = sl.orCfg,
                ps = c.posCssP,
                len = c.lenCssP,
                gtn = sl.thumbNode.style,
                gln = sl.lastNode.style;
                
                sl.thumb1 = sl.cs1Idx  * sl.unit - sl.gap;
                sl.thumb2 = sl.cs2Idx  * sl.unit - sl.gap;
                
                var t1 = sl.thumb1,
                t2 = sl.thumb2,
                i = (t1 > t2)? t2 : t1,
                a = (t1 < t2)? t2: t1;
                
                sl.frontNode.style[ps] = t1 + 'px';
                sl.endNode.style[ps] = t2 + 'px';

                gtn[ps] = i + 'px';
                gtn[len] = Math.abs(a - i) + 'px';
                
                sl.firstNode.style[len] = Math.max(i, 0)+ 'px';
                
                gln[len] = Math.max(sl._effLen - a, 0) + 'px';
                gln[ps] = (a + sl._exRoom) + 'px';
        };
        
        this.joinConst = function(){
            if(sl.cs){
                var cs = [];
                for(var i in sl.cs){
                    cs.push(sl.cs[i].v);
                }
                return cs.join(',');
            }
        };
    }
    
    var _tooltipMarkup = '<span {@ttpCssText}>{@content}</span>';
    /**
     * <p>The widget for vertical Slider.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.MetricSlider = mstrmojo.declare(
            // super class
            mstrmojo.Slider,
            
            // mixins
            [mstrmojo._HasPopup],

            /** 
             * @lends mstrmojo.Slider.prototype
             */
            {
                scriptClass: "mstrmojo.MetricSlider",
                
                markupString: '<div>' +
                                '<div class="mstrmojo-Slider-summary"></div>'+
                                '<div class="mstrmojo-Slider {@cssClass} {@clsType} {@clsOrientation}" style="{@cssText}" >' +
                                    '<div class="cont" style="position:absolute;">' +
                                        '<div class="bk" style="margin-top: 2px;{@bkCssText}"></div>' +
                                        '<div class="sdc" style="position:absolute;{@sdcCssText}">' +
                                            '<div class="sd" style="{@sdCssText}">' + 
                                                '<div class="bk"  style="{@firstCssText}"></div>' +
                                                '<div class="t1"  style="{@thumb1CssText}" onclick="mstrmojo.all[\'{@id}\'].captureDomEvent(\'Thumb\', self, arguments[0]);" ></div>' +
                                                '<div class="t2 bk" style="{@thumbCssText}"></div>' +
                                                '<div class="t3"  style="{@thumb2CssText}" onclick="mstrmojo.all[\'{@id}\'].captureDomEvent(\'Thumb\', self, arguments[0]);"  ></div>' +
                                                '<div class="bk" style="{@lastCssText}"></div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="mstrmojo-Label" style="{@lCssText}"></div>' + 
                                        '<div class="mstrmojo-Label" style="{@hCssText}"></div>' + 
                                    '</div>' +
                                '</div>'+
                            '</div>',

                markupSlots: {
                    summaryNode: function() {return this.domNode.childNodes[0];},
                    dndNode: function() {return this.domNode.childNodes[1].childNodes[0];}, 
                    bgNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[0];},
                    sdcNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[1];},
                    containerNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[1].childNodes[0];},
                    firstNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0];},
                    frontNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[1];},
                    thumbNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[2];},
                    endNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[3];},
                    lastNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[4];},
                    tooltipNode: function(){return this.domNode.childNodes[1].childNodes[0].childNodes[1];},
                    lowNode: function(){return this.domNode.childNodes[1].childNodes[0].childNodes[2];},
                    highNode: function() {return this.domNode.childNodes[1].childNodes[0].childNodes[3];},
                    editValueNode: function(){return this.domNode;}
                },
                
                markupMethods: {
                    onlowTextChange: function(){ this.lowNode.innerHTML = (this.lowText) ? this.lowText : ''; },
                    onhighTextChange: function(){ this.highNode.innerHTML = (this.highText) ? this.highText : ''; },
                    onfontChange: function() { this.lowNode.style['font'] = this.highNode.style['font'] = String(this.font); },
                    onunSetChange: function() { $C.toggleClass(this.domNode.childNodes[1], 'invalid', this.unSet);}
                },
                
                init: function init(p) {
                    this._super(p);
                    
                    // Setup orientation based configuration parameters.
                    this.orCfg.cPosCssP = (p.isHoriz)? 'right' : 'bottom';
                    this.orCfg.cLenCssP = (p.isHoriz)? 'height': 'width';
                    
                    this._exRoom = mstrmojo.MetricSlider.METRICSLIDERTHUMBWIDTH ;
                    
                    var len = parseInt(this[this.orCfg.lenCssP], 10); 
                    this._effLen = isNaN(len) ? 0 : (len - this._exRoom);
                    if(this._effLen <= 0) {
                        this._effLen = mstrmojo.MetricSlider.METRICSLIDERDEFAULTWIDTH - this._exRoom;//default value
                    }
                    
                    this.clsType = 'scm';
                    this.typeHelper = new MetricSlider(this);
                    this.useRichTooltip = false;
                },
                
                //========================= Rendering ============================================================
                
                unSet : false, //this flag will be set to true when because of some combination of value the slider needs to be set to "unset" state 
                
                preBuildRendering: function preBuildRendering() {
                    
                    var len = this.orCfg.lenCssP,
                    v = this[len];
                    if (v) {
                        this.bkCssText = len + ':' + Math.max(parseInt(v, 10) - (2 * this.cssBkBW), 0) + 'px;';
                        this.sdcCssText =  this.orCfg.posCssP + ':' + '0px;' + len + ':' + this._effLen + ';' + this.orCfg.opPosCssP + ':0px;';
                    } 
                    
                    this.typeHelper.initialMetricSlider();
                    this.typeHelper.preUpdateThumb();
                },
                
                postBuildRendering: function postBuildRendering() {
                    if (this._super) {
                        this._super();
                    }
                    
                    if (!this.staticStatus && !this.da.nov){
                        var ft = this.frontNode,
                            ed = this.endNode,
                            dom = mstrmojo.dom,
                            ln = this.lowNode,
                            hn = this.highNode,
                            zf = this.parent.model.zf,
                            id = this.id,
                        handlers = this._tooltipHandlers = [],
                        ae = dom.attachEvent,
                        me = this,
                            fos,
                        over = function(e) {
                            me.showTooltip(e, self);
                        },
                        out = function(e){
                            me.hideTooltip(e, self);
                        },
                        attach = function () {
                            handlers.push(arguments);
                            ae.apply(ae, arguments);
                        };
        
                        attach(ft, 'mouseover', over);
                        attach(ft, 'mouseout', out);
                        attach(ed, 'mouseover', over);
                        attach(ed, 'mouseout', out);
                        
                        fos = parseInt(ln.style.fontSize);
                        fos = isNaN(fos) ? 8 : fos;
                        ln.style.fontSize = hn.style.fontSize = fos * zf + "pt";
                        this.updateSummary();
                    }
                        
                },
                
                summaryLabels : {db : $DESC(8153, "Between ## and ###"),
                        dnb: $DESC(8154,"Not between ## and ###"),
                        din: $DESC(587,"In"),
                        dnin: $DESC(2204,"Not in"),
                        dnull: $DESC(2202,"Is Null"),
                        dnnull: $DESC(2203,"Is not Null"),
                        
                        req: $DESC(8155,"Rank ="),
                        rneq: $DESC(8156,"Rank <>").replace("<>",String.fromCharCode(0x2260)),
                        rexb: $DESC(8157,"Rank exclude bottom"),
                        rext: $DESC(8158,"Rank exclude top"),
                        rb: $DESC(8159,"Rank bottom"),
                        rt: $DESC(8160,"Rank top"),
                        rbt: $DESC(8161,"Rank between ## and ###"),
                        rnbt: $DESC(8162,"Rank not between ## and ###"),
                        rin: $DESC(8163,"Rank in"),
                        rnin: $DESC(8164,"Rank not in"),
                        
                        peq: $DESC(8165,"Percent ="),
                        pneq: $DESC(8166,"Percent <>").replace("<>",String.fromCharCode(0x2260)),
                        pexb: $DESC(8167,"Exclude bottom"),
                        pext: $DESC(8168,"Exclude top"),
                        pb: $DESC(7576,"Bottom"),
                        pt: $DESC(7575,"Top"),
                        pbt: $DESC(8153,"Between ## and ###"),
                        pnbt: $DESC(8154,"Not between ## and ###"),
                        pin: $DESC(8169,"Percent in"),
                        pnin: $DESC(8170,"Percent not in")
                    },
                
                updateSummary: function updateSummary(){
                    /**
                     * IMPORTANT
                     * if this method is modified please modify mstrScrollerImpl.js so the summary on mojo and dhtml match.
                     * 
                     **/
                        
                    if(this.summaryNode && !this.staticStatus){
                        var f  = this.f,  //mstr.Enum.Nodes.FUNCTION.* || mstr.Enum.Nodes.MRPFUNCTION.*
                            ft = this.ft, //mstr.Enum.Nodes.FUNCTIONTYPE.RANKPERCENT || mstr.Enum.Nodes.FUNCTIONTYPE.RANK ||  mstr.Enum.Nodes.FUNCTIONTYPE.DEFAULT
                            fte = $M,
                            fe = $M.FN,
                            fmrpe = $M.MRPFN,
                            txt = "",
                            fl = (this.cs1Vl < this.cs2Vl)? this.cs1Nm : this.cs2Nm,
                            fr = (this.cs1Vl > this.cs2Vl)? this.cs1Nm : this.cs2Nm,
                            th = this.typeHelper,
                            s = this.summaryLabels,
                            specialCase = (ft == fte._GENERIC && (f == fe.ISNULL || f == fe.ISNOTNULL || f == fe.NOTIN || f == fe.IN)) ||
                                            ((ft == fte._PERCENT || ft == fte._RANK) && (f == fmrpe.INASCENDING || f == fmrpe.INDESCENDING || f == fmrpe.NOTINDESCENDING || f == fmrpe.NOTINASCENDING));
                    
                        //remove the summary if the selector is being updated to unset
                        if(!this.unSet || specialCase){
                            switch(ft){
                                case  fte._GENERIC:
                                    switch(f){
                                    case fe.EQUALS:
                                        txt = "= " + fl;
                                        break;
                                    case fe.NOTEQUALS:
                                        txt = String.fromCharCode(0x2260) + " " + fl;
                                        break;
                                    case fe.GREATERTHAN:
                                        txt = "> " + fr;
                                        break;
                                    case fe.GREATERTHANEQUALS:
                                        txt = String.fromCharCode(0x2265) + " " + fl;
                                        break;
                                    case fe.LESSTHAN:
                                        txt = "< " + fl;
                                        break;
                                    case fe.LESSTHANEQUALS:
                                        txt = String.fromCharCode(0x2264) + " " + fr;
                                        break;
                                    case fe.BETWEEN:
                                        txt = s.db.replace("##",fl).replace("###",fr);
                                        break;
                                    case fe.NOTBETWEEN:
                                        txt = s.dnb.replace("##",fl).replace("###",fr);
                                        break;
                                    case fe.ISNULL:
                                        txt = s.dnull;
                                        break;
                                    case fe.ISNOTNULL:
                                        txt = s.dnnull;
                                        break;
                                    case fe.IN:
                                        txt = s.din + " " + th.joinConst();
                                        break;
                                    case fe.NOTIN:
                                        txt = s.dnin + " " +th.joinConst();
                                        break;
                                    }
                                    break;
                                case fte._PERCENT:
                                case fte._RANK:
                                    
                                    var pr = "r";
                                    if(ft == fte._PERCENT) pr = "p";
                                    
                                    switch(f){
                                    case fmrpe.EQUALSDESCENDING:
                                    case fmrpe.EQUALSASCENDING:
                                        txt = s[pr + "eq"] + " " + fl;
                                        break;
                                    case fmrpe.NOTEQUALSDESCENDING:
                                    case fmrpe.NOTEQUALSASCENDING:
                                        txt = s[pr + "neq"] + " " + fl;
                                        break;
                                    case fmrpe.GREATERTHANEQUALSASCENDING:     
                                        txt = s[pr + "exb"] + " " + fl;
                                        break;
                                    case fmrpe.GREATERTHANASCENDING:
                                        txt = s[pr + "exb"] + " " + fr;
                                        break;
                                    case fmrpe.GREATERTHANEQUALSDESCENDING:
                                        txt = s[pr + "ext"] + " " + fl;
                                        break;
                                    case fmrpe.GREATERTHANDESCENDING:
                                        txt = s[pr + "ext"] + " " + fr;
                                        break;
                                    case fmrpe.LESSTHANASCENDING: 
                                        txt = s[pr + "b"] + " " + fl;
                                        break;
                                    case fmrpe.LESSTHANEQUALSASCENDING:
                                        txt = s[pr + "b"] + " " + fr;
                                        break;
                                    case fmrpe.LESSTHANDESCENDING:
                                        txt = s[pr + "t"] + " " + fl;
                                        break;
                                    case fmrpe.LESSTHANEQUALSDESCENDING:
                                        txt = s[pr + "t"] + " " + fr;
                                        break;
                                    case fmrpe.BETWEENDESCENDING:
                                    case fmrpe.BETWEENASCENDING:
                                        txt = s[pr + "bt"].replace("##",fl).replace("###",fr);
                                        break;
                                    case fmrpe.NOTBETWEENASCENDING:    
                                    case fmrpe.NOTBETWEENDESCENDING:
                                        txt = s[pr + "nbt"].replace("##",fl).replace("###",fr);
                                        break;
                                    case fmrpe.INASCENDING:
                                    case fmrpe.INDESCENDING:
                                        txt = s[pr + "in"] + " " + th.joinConst();
                                        break;
                                    case fmrpe.NOTINDESCENDING:
                                    case fmrpe.NOTINASCENDING:
                                        txt = "";
                                        txt = s[pr + "nin"] + " " + th.joinConst();
                                        break;
                                    }
                                    break;
                            }
                        }
                        
                        this.summaryNode.innerHTML = txt;
                        
                        if (this.hasRendered && this.height == null){
                            this.parent.updateHeight();
                         }
                        
                    }
                },
                
                unrender: function unrender(ignoreDom)  {
                    mstrmojo.array.forEach(this._tooltipHandlers, function (h) {
                        mstrmojo.dom.detachEvent(h[0], h[1], h[2]);
                    });
                    
                    this._super(ignoreDom);
                },
                
                getClientHeight: function getClientHeight(){
                    return this.dndNode.clientHeight + this.summaryNode.clientHeight + 15;//include padding from CSS.
                },

                //======================= Drag and Drop ======================================
                _initGhost: function _initGhost() {
                    if (!this.staticStatus){
                    if (!this.ghost) {
                        var cn = this.containerNode.cloneNode(true),
                        cnc = cn.childNodes;
                        $C.addClass(cn, ['gh']);
                        
                        this.ghost = {
                            containerNode: cn,
                            firstNode: cnc[0],
                            frontNode: cnc[1],
                            thumbNode: cnc[2],
                            endNode: cnc[3],
                            lastNode: cnc[4]
                        };
                        
                        this.sdcNode.appendChild(cn);
                    }
                    
                    var gSty = this.ghost.containerNode.style,
                    cnSty = this.containerNode.style,
                    gtSty = this.ghost.thumbNode.style,
                    tSty = this.thumbNode.style,
                    glSty = this.ghost.lastNode.style,
                    lSty = this.lastNode.style,
                    oc = this.orCfg,
                    ps = oc.posCssP,
                    len = oc.lenCssP;
                
                    gSty[ps] = cnSty[ps];
                    gSty[len] = cnSty[len];
                    
                    this.ghost.firstNode.style[len] = this.firstNode.style[len];
                    
                    gtSty[ps] = tSty[ps];
                    gtSty[len] = tSty[len];
                    
                    glSty[ps] = lSty[ps];
                    glSty[len] = lSty[len];
                    
                    gSty.display = 'block';
                
                    return this.ghost;
                    }
                },
                
                initDrag: function initDrag(e, hWin) {
                    if (!this.staticStatus && !this.da.nov) {
                        hWin = hWin || window;
                        
                        var td = $D.eventTarget(hWin, this.dnd.startE);
                        
                        if (td ==  this.frontNode || td ==  this.endNode) {
                        
                            var g = this._initGhost(),
                                oc = this.orCfg;
                            
                            this.dnd.initD = {
                                    t1: parseFloat(this.thumb1, 10),                     
                                    t2: parseFloat(this.thumb2, 10),
                                    sL: this._effLen,              
                                    contL: g.containerNode[oc.lenP],           
                                    offset: $D.getMousePosition(this.dnd.startE, hWin)[oc.offsetP]    
                                };
                                
                            this.dnd.initD.td = td;
                            
                            $C.removeClass(this.domNode.childNodes[1], ['invalid']);
                            
                        }
                    }
                },
                
                ondrag: function ondrag(e, hWin){
                    if (!this.staticStatus) {
                    hWin = hWin || window;
                    
                    var initD = this.dnd.initD;
                    if (initD){
                        var g = this.ghost,
                        fn = g.firstNode,
                        tn = g.thumbNode,
                        ln = g.lastNode,
                        cs1Px = initD.t1,
                        cs2Px = initD.t2,
                        cs1Idx = this.cs1Idx,
                        cs2Idx = this.cs2Idx,
                        oc = this.orCfg,
                        tWdth = this._exRoom;
                    
                        // mouse position offset from initial state
                        var diff = $D.getMousePosition(e, hWin)[oc.offsetP] - initD.offset;
                        switch (initD.td) {
                            case this.frontNode:    
                                cs1Px = Math.min(Math.max(initD.t1 + diff, 0), initD.sL) - this.gap;
                                cs1Idx = Math.floor(cs1Px/this.unit + 0.5);
                                break;
                                
                            case this.endNode:      
                                cs2Px = Math.min(Math.max(initD.t2 + diff, 0), initD.sL) - this.gap;
                                cs2Idx = Math.floor(cs2Px/this.unit + 0.5);
                                break;
                                
                            default:
                                return;
                        }
                        
                        var i = (cs1Px < cs2Px)? cs1Px : cs2Px,
                                a = (cs1Px > cs2Px)? cs1Px : cs2Px,
                                ps = oc.posCssP,
                                len = oc.lenCssP;
                        
                            g.frontNode.style[ps] = i + 'px';
                            g.endNode.style[ps] = a + 'px';
                            
                            tn.style[len] = Math.abs(a - i - tWdth)+ 'px';
                            tn.style[ps] = (i + tWdth) + 'px';
                            
                            fn.style[len] =  Math.max(i, 0) + 'px';
                            
                            ln.style[len] = Math.max(initD.sL - a, 0)+ 'px';
                            ln.style[ps] = ( a + tWdth) + 'px';
                        
                        if (this.items && this.items.length && 
                                cs1Idx >= 0 && cs1Idx < this.items.length && 
                                cs2Idx >= 0 && cs2Idx < this.items.length){
                            var _changed = false;
                            if(cs1Idx !== this.cs1Idx){
                                this.cs1Idx = cs1Idx;
                                var itm = this.items[cs1Idx];
                                this.cs1Vl = itm.v;
                                this.cs1Nm = itm.n;
                                _changed = true;
                            }
                            if(cs2Idx !== this.cs2Idx){
                                this.cs2Idx = cs2Idx;
                                var itm = this.items[cs2Idx];
                                this.cs2Vl = itm.v;
                                this.cs2Nm = itm.n;
                                _changed = true;
                            }
                            if(_changed){
                                // update thumb and tooltip
                                this.typeHelper.updateThumb();
                                this._updateTooltip(initD.td);
                            }
                        }
                    }
                    }
                },
                
                ondrop: function ondrop(/*DomEvent*/ e){
                    if (!this.staticStatus) {
                        this.typeHelper.updateThumb();
                        
                        if (this.ghost) {
                            this.ghost.containerNode.style.display = "none";  
                        }
                        
                        this.hideTooltip(e, self);
                        
                        if (this.items && this.items.length){ 
                            this[($D.eventTarget(self, e) == this.ghost.frontNode)? 'frtUst' : 'ndUst'] = false;
                            this.selectRange();
                        }                    
                        this.dnd.initD = null; 
                    }
                },
                
                //======================= Select range change ======================================
                selectRange : function slctrng(onlyInclude, changeQual, updateUnset) {
                    var T = this.typeHelper,
                    c1 = this.cs1Vl,
                    c2 = this.cs2Vl,
                    q = this.qua,
                    nf = this.numFmts;
                    
                    this.cs1Idx = T.getIdx(c1);
                    this.cs2Idx = T.getIdx(c2);
                    
                    var isEdge = function(idx, itms){
                        var its = itms || [];
                        return idx == 0 || idx == its.length -1;
                    },
                    unsetStr = $DESC(7622);
                    
                    this.cs1Nm = isEdge(this.cs1Idx, this.items) && !this.frtUst? unsetStr : $M.formatNumber(q, c1, nf);
                    this.cs2Nm = isEdge(this.cs2Idx, this.items) && !this.ndUst? unsetStr : $M.formatNumber(q, c2, nf);
                    
                    T.updateOpCs();
                    
                    //send only the include flag manipulation
                    this.onlyInclude = !!onlyInclude;
                    this.changeQual = !!changeQual;
                    this.unSet = !!updateUnset || this.unSet;
                    
                    this.onselectionChange();
                    this.updateSummary();
                 },
                
                 onincludeChange : function incChange(){
                     if (!this.staticStatus) {
                         this.selectRange(true);
                     }
                 },
                 
                //======================= Tooltip ===================================================
                showTooltip: function showTooltip(e, win) {
                     var tgt = $D.eventTarget(win, e);
                     this._updateTooltip(tgt); 
                     mstrmojo.tooltip.open(this, e, win); 
                },
                
                /**
                 * Positions tooltip correctly according to current slider's position and style (horizontal/vertical).
                 * Updates tooltip content to current selection.
                 * 
                 * @private
                 */
                _updateTooltip: function _updateTooltip(tgt) {
                    var oc = this.orCfg,
                        ps = oc.posCssP,
                        txt,
                        tt = {
                                contentNodeCssClass: 'scm-tooltip',
                                refNode: this.domNode.childNodes[1],
                                posType: this._tooltip_pos
                                };
                    tt[oc.opPosCssP] = - parseInt(this.font)/2; 
                    tt[ps] = tgt.style[ps];
                    txt = String((tgt == this.frontNode)? this.cs1Nm: this.cs2Nm);
                    tt.content = _tooltipMarkup.replace(/\{@content\}/g, txt);
                    
                    this.set('richTooltip', tt);
                },
                
                //======================= Event handling for click on thumbs=========================
                onThumb: function onthmb(evt){
                    if (!this.staticStatus && !this.da.nov) {
                        var tgt = $D.eventTarget(evt.hWin || window, evt.e);
                        this.openEditValue({isfrt:(tgt == this.frontNode)? true : false, tgt: tgt });
                        if (this._onThumb){ this._onThumb(evt); }// A hook for custom behavior
                    }
                },
                
                onquaChange: function onqChg(evt){
                    var oldf = mstrmojo.MCSUtil.getFuncInfo(this.opId, evt.valueWas),
                        newf = mstrmojo.MCSUtil.getFuncInfo(this.opId, evt.value),
                        u;
                    
                    if(oldf.ft != newf.ft){
                        if (!this.staticStatus) {
                            this.items = [];
                            this.cs = [];
                            this.f = this.ft = null;
                            this.refresh();
                            u = true;
                        }
                    }else{
                        this.f = mstrmojo.MCSUtil.getFuncInfo(this.opId, evt.value).f;
                        u = false;
                    }
                    this.selectRange(false, true, u);
                },
                
                updateData: function udtDt(da, props){
                    this.da = da;
                    
                    //TQMS 467964: some properties moved from def block to data block.
                    // TODO: need to refactoring the object structure in the future.                    
                    this.updateExpr(props);
                  
                },
                
                updateExpr: function udtEp(props) {
                    if (props) {
                        this.cs = props.cs;
                        this.f = props.f;
                        this.ft = props.ft;
                        this.qua = props.qua;
                    }
                    this.refresh();
                },
                
                editValueRef:{
                    cssClass: "edvl",
                    slot: "editValueNode",
                    scriptClass: "mstrmojo.Popup",
                    locksHover: true,
                    onOpen: function(){
                        if (this.tgt){
                            var boxWdth = 90,
                            l = parseInt(this.tgt.style.left),
                            opWdth = parseInt(this.opener.width) ;
                            if(l < 0) { l = 0; }
                            if(l + boxWdth > opWdth) { l = opWdth - boxWdth;}
                            this.set("left", l + 'px');
                            this.set("top",this.tgt.style.top);
                        }
                        var op = this.opener,
                        cld = this.children[0];
                        if (op) {
                            var v = this.isfrt ? op.cs1Vl : op.cs2Vl;
                            if (this.isfrt){
                                if ((op.cs1Vl <= op.low || op.cs1Vl >= op.high) && !op.frtUst){ v = '';} 
                            } else {
                                if((op.cs2Vl <= op.low || op.cs2Vl >= op.high) && !op.ndUst){ v = '';}
                            }
                            cld.edt.set('value', $NM.toLocaleString(v));
                        }
                    },
                    children:[{
                              scriptClass : "mstrmojo.Table",
                              rows:1,
                              cols: 2,
                              layout: [{cells: [{cssText: "width: 40px; padding: 3px;"}, {cssText: "width: 16px;padding: 3px;"}]}], 
                              children : [ {
                                    slot: "0,0",
                                    scriptClass : "mstrmojo.ValidationTextBox",
                                    alias: "edt",
                                    cssText: "color:black",
                                    dtp: mstrmojo.expr.DTP.NUMERIC,
                                    constraints: {
                                        trigger: mstrmojo.validation.TRIGGER.ALL
                                    },
                                    onValid: function() {
                                        if (this.parent.apply) {
                                            this.parent.apply.set("enabled", String(this.value).length != 0);
                                        }
                                    },
                                    onInvalid: function(){
                                        if (this.parent.apply) {
                                            this.parent.apply.set("enabled", false);
                                        }
                                    },
                                    onkeyup: function(evt){
                                        if (this.parent.apply.enabled) {
                                            var hWin = evt.hWin,
                                                e = evt.e || hWin.event; 
                                            if (e.keyCode === 13){
                                                this.parent.apply.onclick();
                                            }
                                        }
                                    }
                                }, {
                                    slot: "0,1",
                                    scriptClass : "mstrmojo.Button",
                                    cssClass : 'icn apply',
                                    alias: "apply",
                                    onclick : function() {
                                        var p = this.parent.parent,
                                        op = p.opener,
                                        v = this.parent.edt.value;
                                        
                                        if (p && op && String(v).length > 0){
                                            op[p.isfrt? 'cs1Nm' : 'cs2Nm'] = v;
                                            v = $NM.parseNumeric(v);
                                            op[p.isfrt? 'cs1Vl' : 'cs2Vl'] = v;
                                        }
                                        
                                        op[p.isfrt? 'frtUst' : 'ndUst'] = true;
                                        op.selectRange();
                                        
                                        op.typeHelper.updateThumb();
                                        p.close();
                                    }
                                } ]
                }]
                } ,
                openEditValue: function(/*Object*/ config){
                    this.openPopup("editValueRef", config);
                }
                
            }
    );

    mstrmojo.MetricSlider.METRICSLIDERTHUMBWIDTH = 14;
    mstrmojo.MetricSlider.METRICSLIDERDEFAULTWIDTH = 95;
})();
