(function(){

    mstrmojo.requiresCls(
        "mstrmojo.array",
        "mstrmojo.Obj",
        "mstrmojo.string",
        "mstrmojo.hash",
        "mstrmojo.expr");
        
    var A = mstrmojo.array,
        E = mstrmojo.expr,
        ET = E.ET,
        TP = E.TP,
        ET2TGT = E.ET2TGT,
        ET2COND = E.ET2COND,
        MTP = mstrmojo.meta.TP;
    
    /**
     * Helper function to set a ConditionModel's fn and fnt properties
     * given a function (operator) object, whose did has the syntax "<fnt>,<fn>".
     * @param {mstrmojo.ConditionModel} me The model.
     * @param {Object} [fnItem] The object representing an operator, possibly null.
     */
    function _updateFn(me, fnItem){
    
        var did = (fnItem && fnItem.did) ? 
                    fnItem.did.split(E.FN_SEP) : null,
            fnt = did && parseInt(did[0],10),
            fn = did && parseInt(did[1],10),
            et = me.et;
        
        me.fnt = fnt;
        me.fn = fn;
        
        if(et != ET.AE && E.fn_List(fn, fnt)) {
            me.et = ET.AL;
            me.a2 = null;
            me.cs = null;
        }else if(et == ET.AL && !E.fn_List(fn, fnt)){
            me.et = ET.AQ;
            me.cs = null;
        }else if(et == ET.MC && !E.fn_AC_MC(fn, fnt)){
            me.et = ET.MQ;
            me.m2 = null;
        }else if(et == ET.AC && !E.fn_AC_MC(fn, fnt)){
            me.et = ET.AQ;
            me.a2 = null;
        }
    }

    /**
     * Helper function for writing back a constant object into the constants array.
     * @param {mstrmojo.ConditionModel} me The model.
     * @param {Integer} idx The index of the constant to be updated.
     * @param {Object} v The new constant object.
     * @param {Number|String} v.v The scalar value of the constant.
     * @param {Integer} v.dtp The data type of the scalar value.
     */
    function _setCst(me, idx, v){
        var raiseEvent = true,
            _midx = 2 + idx;
        
        switch(v.t) {
        case TP.PROMPT:
            var cs = me.cs,
                c;
            if (!cs) {
                cs = [];
                me.cs = cs;
            }
            
            cs[idx] = {};
            
            c = cs[idx];

            c.p = v;
//            c.dtp = me.fm && me.fm.dtp;

            me['a' + _midx] = null;
            me['m' + _midx] = null;

            switch(me.et){
            case ET.AC: 
                me.et = ET.AQ;
                break;
            case ET.MC:
                me.et = ET.MQ;
                break;
            }
            break;
        case TP.METRIC:
            me['a' + _midx] = null;
            me.cs = null;
            
            me.et = ET.MC;
            me['m' + _midx] = v;
            break;
        case TP.ATTR:
            me['m' + _midx] = null;
            me.cs = null;
            
            me.et = ET.AC;
            me['a' + _midx] = v;
            me['fm' + _midx] = null;           
            break;
        default:
            me['a' + _midx] = null;
            me['m' + _midx] = null;
            
            var cs = me.cs;
            if (!cs) {
                cs = [];
                me.cs = cs;
            }
            if('did' in v) {
                me['a' + _midx] = null;
                me['fm' + _midx] = null; 
                me['m' + _midx] = null; 
                if(cs[idx] && cs[idx].p) {//only clear prompt, instead of all value info.
                	cs[idx].p = null;
                }
            } else {//no need to raise event if it is actual value
                cs[idx] = v;                
                raiseEvent = false;
            }
            switch(me.et) {
            case ET.MC:
                me.et = ET.MQ;
                break;
            case ET.AC:
                me.et = ET.AQ;
                break;
            case ET.AL: //TO-DO: the relationship between AQ/AL/AC? 
                if(!('did' in v) && v.v) {
                    var ca, dtp = v.dtp, cs =[];
                    ca = v.v.split(mstrConfig.listSep);
                    for(var i=0,len=ca.length;i<len;i++){
                        cs.push({v:mstrmojo.string.trim(ca[i]),dtp:dtp});
                    }
                    me.cs = cs;
                }
                break;
            }
        }
        return raiseEvent;
    }

    // Required fields for each type of qualification.
    var REQ = {};
    REQ[ET.AQ] = {target: 1, fm: 1, fn: 1, cs: 1};
    REQ[ET.AL] = {target: 1, fm: 1, fn: 1, cs: 1};    
    REQ[ET.AE] = {target: 1, fn: 1, es: 1};
    REQ[ET.AC] = {target: 1, a2: 1, a3: 1, fm: 1, fm2: 1, fm3: 1, fn: 1};
    REQ[ET.MQ] = {target: 1, fn: 1, cs: 1, dmy: 1};
    REQ[ET.MC] = {target: 1, fn: 1, m2: 1, m3: 1, dmy: 1};        // TODO test
    // For others (e.g., embedded object), show only target.
    REQ[ET.F] = {target: 1};
    REQ[ET.R] = REQ[ET.F];
    REQ[ET.XML] = {target: 1};
    var _isV = function(v){
        return v !== null && v !== undefined;
    };
    /**
     * calculate whether the current condition is completed.
     * @ignore
     * @private
     */
    var _completed = function(me) {
        // if et has not been defined, return false
        if (!me || !_isV(me.et)){
            return false;
        }
        var _c = true,
            r = REQ[me.et],
            cs = me.cs,
            i;
        // check target
        _c = _c && (!r.target || me[ET2TGT[me.et]]);
        // check form
        _c = _c && (!r.fm || me.fm);
        // check function
        _c = _c && (!r.fn || _isV(me.fn));
        
        // check constant // object
        var cstCont = E.fnCstCount(me.fn, me.fnt);
        if (_c && r.cs) {
            for (i = 0; i < cstCont; i ++) {
                _c = _c && cs && _isV(cs[i]);
            }
        }
        if (_c){
            // check m2, m3, a2, a3, fm2, fm3
            var tgt2 = [ET2TGT[me.et], 'fm'];
            for (var ti = 0; ti < 2; ti ++) {
                for (i = 0; i < cstCont; i ++){
                    var fn = tgt2[ti] + (2 + i);
                    _c = _c && ( !r[fn] || me[fn]);
                }
            }
        }        
        // check elements
        _c = _c && (!r.es || me.es && (me.es.length > 0));
        
        // check dimty
        _c = _c && (!r.dmy || me.dmy && me.dmy.uts && (me.dmy.uts.length > 0));
        
        return _c;
    };
    
    /**
     * The data representation of a single condition in a filter expression (e.g., a
     * metric qualification, attribute form qualification, attribute element list, or
     * shortcut to a metadata object.
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.ConditionModel = mstrmojo.declare(
        // superclass
        mstrmojo.Obj,
        // mixins
        null,
        /**
         * @lends mstrmojo.ConditionModel.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.ConditionModel",
            /**
             * Whether the current condition is completed.
             * @type Boolean
             */
            completed: false,
            
            init: function(props) {
                if (this._super) {
                    this._super(props);
                }
                // update completed state
                this._updateCompleted();
            },
            /**
             * <p>Modifies a property value in the model.</p>
             *
             * <p>Unlike the inherited set() method, edit() may result in several property
             * values being modified in batch.  If any property value is changed, a single event 
             * will be raised which specifies which property values were changed.</p>
             *
             * <p>Additionally, edit also supports the "target" property, which is not a real property
             * but instead a generic representation for other properties, such as "a" or "m", depending
             * on the expression type of this model.</p>
             *
             * @param {String} n The name of the property to edit.
             * @param {Object} v The new value of the property.
             */
            edit: function(n, v) {
                var vWas = this[n],
                    re = true;
                switch(n){
                
                    case 'not':
                        // "v" is a list item that corresponds to either "Include" or NOT.
                        v = !!(v && v.did === E.FN.NOT);
                        vWas = !!this.not;
                        if (v === vWas) {
                            return; // No change, dont raise an event.
                        }
                        this.not = !!v || null;
                        break;

                    case 'target':
                        var et = this.et;
                        // ?? should we check whether the new value is different from orginal value?
                        // Update the expression type.
                        if (v) {
                            switch(v[MTP]) {   // renamed "tp" to "t"
                                case TP.ATTR:
                                    vWas = this.a;
                                    if (et !== ET.AQ && et !== ET.AE) {
                                        // TO DO: apply default here
                                        this.et = ET.AQ;
                                        this.m = null;
                                        this.m2 = null;
                                        this.m3 = null;
                                        this.r = null;
                                        this.f = null;                                    
                                    }
                                    // TO DO: must we reset the fn?
                                    this.fn = null;
                                    this.fnt = null;                                        
                                    this.fm = null;
                                    this.fm2 = null;
                                    this.fm3 = null;
                                    this.cs = null;
                                    break;
                                    
                                // TO DO: refactor these 3 cases below
                                case TP.METRIC:
                                    vWas = this.m;
                                    if ((et !== ET.MQ) && (et !== ET.MC)) {
                                        this.et = ET.MQ;
                                        this.fm = null;
                                        this.fm2 = null;
                                        this.fm3 = null;
                                        // TO DO: must we reset the fn?
                                        this.fn = null;
                                        this.fnt = null;
                                        this.a = null;
                                        this.a2 = null;
                                        this.a3 = null;
                                        this.r = null;
                                        this.f = null;
                                        this.cs = null;
                                    }
                                    break;
                                case TP.REPORT:
                                    vWas = this.r;
                                    if (et !== ET.R) {
                                        this.et = ET.R;
                                        this.fm = null;
                                        this.fm2 = null;
                                        this.fm3 = null;
                                        // TO DO: must we reset the fn?
                                        this.fn = null;
                                        this.fnt = null;
                                        this.a = null;
                                        this.a2 = null;
                                        this.a3 = null;
                                        this.m = null;
                                        this.m2 = null;
                                        this.m3 = null;
                                        this.f = null;
                                    }
                                    break;
                                case TP.FILTER:
                                    vWas = this.f;
                                    if (et !== ET.F) {
                                        this.et = ET.F;
                                        this.fm = null;
                                        this.fm2 = null;
                                        this.fm3 = null;
                                        // TO DO: must we reset the fn?
                                        this.fn = null;
                                        this.fnt = null;
                                        this.a = null;
                                        this.a2 = null;
                                        this.a3 = null;
                                        this.m = null;
                                        this.m2 = null;
                                        this.m3 = null;
                                        this.r = null;
                                    }
                                    break;
                                case TP.PROMPT:
                                    vWas = this.prms && this.prms[0];
                                    if (et !== ET.XML) {// @TODO check et type with Venky 
                                        this.et = ET.XML;
                                        this.fm = null;
                                        this.fm2 = null;
                                        this.fm3 = null;
                                        // TO DO: must we reset the fn?
                                        this.fn = null;
                                        this.fnt = null;
                                        this.a = null;
                                        this.a2 = null;
                                        this.a3 = null;
                                        this.m = null;
                                        this.m2 = null;
                                        this.m3 = null;
                                        this.r = null;
                                        this.f = null;
                                    }
                                    break;
                            }
                        }
                        // Clear elems list.
                        this.es = null;
                        // Update the corresponding target property using the latest expression type.
                        this[ET2TGT[this.et]] = v;
                        break;
    
                    case 'fm':
                        // Is the given value a form, or a Elem InList/NotInList function?
                        if (v && v[MTP] === 'fn') {    // renamed "tp" to "t"
                            // Elem InList/NotInList function.
                            this.et = ET.AE;
                            this.fm = null;
                            _updateFn(this, v);
                        } else {
                            // A form.
                            this.fm = v;
                            if (v && (this.et == ET.AE)) {
                                // We're picking a form and we're AE, so switch to AQ.
                                this.et = ET.AQ;
                            }
                            //we shall always clear fnt and fn since the form may have different data types.
                            this.fnt = null;
                            this.fn = null;
                            this.cs = null;   
                            this.a2 = null;
                            this.fm2 = null;
                        }
                        break;
                    case 'fm2':
                    case 'fm3':
                        // A form.
                        this[n] = v;
                        break;
                    case 'fn':
                        _updateFn(this, v);
                        break;
                        
                    case 'es':
                        // The given "v" should be an object with added & removed properties, each of which
                        // is an array of element objects to be added/removed to the model.
                        var es = this.es;
                        if (v && v.removed && es) {
                            A.removeItems(es, v.itemIdField, v.removed);
                        }
                        if (v && v.added) {
                            if (!es) {
                                es = v.added.concat();
                                this.es = es;
                            } else {
                                A.insert(es, es.length, v.added);
                            }
                        }
                        break;
                        
                    case 'c0':
                        re = _setCst(this, 0, v);
                        break;
                        
                    case 'c1':
                        re = _setCst(this, 1, v);                      
                        break;
                        
                    case 'dmy':
                        // The given "v" should be an object with added & removed properties, each of which
                        // is an array of objects to be added/removed to the model.  Each object could
                        // be a standard dmy unit (like Report Level, Metric Level, etc) or could be an attribute or dimension object.
                        var dmy = this.dmy;
                        if (!dmy) {
                            // Dimensionality info is missing/uninitialized, so init it now.
                            // TO DO: populate these properties smartly rather than hard-code.
                            dmy = {
                                cc: true,   // can continue
                                fres: true, // filter restriction
                                uts: []     // units
                            };
                            this.dmy = dmy;
                        }
                        var uts = dmy && dmy.uts;
                        if (!uts) {
                            uts = [];
                            dmy.uts = uts;
                        }

                        var CUSTOM = {};
                        CUSTOM[E.TP.ATTR] = true;
                        CUSTOM[E.TP.DIM] = true;

                        // Are we given any objects to remove?
                        if (v && v.removed) {
                            // Group the objects into two buckets: standard dmy objects (Default/Metric/Report level) and 
                            // custom dmy objects (attributes, dimensions).
                            var toRem = [],
                                bRem = false,
                                toRemCust = [],
                                bRemCust = false;
                            for (var r=0, rArr=v.removed, rLen=rArr.length; r<rLen; r++){
                                var ur = rArr[r],
                                    b = ur[MTP] in CUSTOM; // renamed "tp" to "t"
                                if (b) {
                                    bRemCust = true;
                                } else {
                                    bRem = true;
                                }
                                var arrRem = b ? toRemCust : toRem;
                                arrRem.push(ur);
                            }
                            
                            // Remove the standard dmy objects; search for them by did.
                            if (bRem) {
                                A.removeItems(uts, "did", toRem);
                            }
                            
                            // Remove the custom dmy objects. These won't be found in uts directly; rather uts will
                            // contain wrapper "dmy unit" objects, which nest custom dmy objects in their "utgt" property.
                            // To find them, we build a map of utgt.did to index.
                            if (bRemCust) {
                                var map = {};
                                for (var u=0, uLen=uts && uts.length; u<uLen; u++){
                                    var uo = uts[u];
                                    if (uo && uo.utgt) {
                                        map[uo.utgt.did] = u;
                                    }
                                }
                                // Then we use the map to build a sorted array of indices to remove.
                                var idxs = [];
                                for (var c=0, cLen=toRemCust.length; c<cLen; c++){
                                    var idx = map[toRemCust[c].did];
                                    if (idx >-1) {
                                        idxs.push(idx);
                                    }
                                }
                                idxs.sort(A.numSorter);
                                // Finally, we remove those indices in reverse order.
                                for (var i=idxs.length-1; i>-1; i--){
                                    uts.splice(idxs[i], 1);
                                }
                            }
                        }
                                                
                        // Are we given any objects to add?
                        if (v && v.added) {
                            var toAdd = [],
                                DD = E.DMY_TP.DIM,
                                DA = E.DMY_TP.ATTR;
                            for (var a=0, aArr=v.added, aLen=aArr.length; a<aLen; a++){
                                var ua = aArr[a];
                                toAdd.push(
                                    (ua[MTP] in CUSTOM) ?  // renamed "tp" to "t"
                                        // Wrap the custom object in a dmy unit object. Assign the wrapper did
                                        // to match the custom object did; that will allow us to find objects by did
                                        // rather than by reference. This assumes that someone ensured all the
                                        // model's objects had a did before calling this method.
                                        // TO DO: set these properties correctly rather than hard-code.
                                        {
                                            utgt: ua,
                                            utp: ua[MTP] === TP.DIM ? DD : DA, // renamed "tp" to "t"
                                            agg: 1,
                                            flt: 2,
                                            gb: true,
                                            rps: 0,
                                            n: ua.n
                                        } 
                                        : ua
                                );
                            }
                            A.insert(uts, uts.length, toAdd);
                        }
                        break;
                }

                // update completed state
                this._updateCompleted();

                // TO DO: only raise an event if property values were actually changed.
                // TO DO: raise an event that lists all the properties that were changed by this call.
                // For now, we can get away without this, because our only listener doesn't care anyway.
                if(re) this.raiseEvent({
                    name: "edit",
                    prop: n,
                    value: v,
                    valueWas: vWas
                });
            },
            
            /**
             * Returns an object with the model's current data values. Only those values relevant to the
             * current expression type are returned.
             */
            get: function gt(){
                var ps = ET2COND[this.et] || [];
                ps.push('et');
                return mstrmojo.hash.copyProps(ps, this);
            },
            /**
             * Updates whether the current condition is completed.
             * @private
             */
            _updateCompleted: function() {
                this.set('completed', _completed(this));
            }
            
        });


})();

