(function() {

    mstrmojo.requiresCls("mstrmojo.array", "mstrmojo.locales");

    var _A = mstrmojo.array, MTP = mstrmojo.meta.TP, H = mstrmojo.hash, 
    _ET = {
        ANDOR : 14,
        MQ : 10,
        MC : 12,
        AQ : 2,
        AL : 6,
        AC : 9,
        AE : 5,
        F : 13,
        R : 21,
        B : 20,
        XML : 1
    }, _ETvals = {};
    for ( var k in _ET) {
        _ETvals[_ET[k]] = true;
    }

    /**
     * <p>
     * Maps expression type to a ConditionModel property that specifies the
     * expression target (if any).
     * </p>
     * 
     * @private
     */
    var ET2TGT = {};
    ET2TGT[_ET.AQ] = 'a';
    ET2TGT[_ET.AL] = 'a';    
    ET2TGT[_ET.AC] = 'a';
    ET2TGT[_ET.AE] = 'a';
    ET2TGT[_ET.MQ] = 'm';
    ET2TGT[_ET.MC] = 'm';
    ET2TGT[_ET.F] = 'f';
    ET2TGT[_ET.R] = 'r';
    ET2TGT[_ET.XML] = 'p';

    /**
     * <p>
     * Maps expression type to a list of relevant ConditionModel properties.
     * </p>
     * 
     * @private
     */
    var ET2C = {};
    ET2C[_ET.MQ] = [ 'not', 'm', 'fn', 'fnt', 'cs', 'dmy' ];
    ET2C[_ET.MC] = [ 'not', 'm', 'fn', 'fnt', 'm2', 'm3', 'p', 'dmy' ]; 
    ET2C[_ET.AE] = [ 'not', 'a', 'fn', 'es', 'a2', 'fm2', 'p']; 
    ET2C[_ET.AQ] = [ 'not', 'a', 'fm', 'fn', 'cs'];
    ET2C[_ET.AL] = [ 'not', 'a', 'fm', 'fn', 'cs'];    
    ET2C[_ET.AC] = [ 'not', 'a', 'fm', 'a2', 'fm2', 'a3', 'fm3', 'fn', 'cs'];
    ET2C[_ET.R] = [ 'not', 'r' ];
    ET2C[_ET.F] = [ 'not', 'f' ];
    ET2C[_ET.XML] = [ 'not', 'n', 'p' ]; // only prompt in generic type is editable

    /**
     * <p>
     * Maps expression type to an mstrmojo.expr property that specifies the
     * function lookup array.
     * </p>
     * 
     * @private
     */

    var _ET2FNS = {};
    _ET2FNS[_ET.MQ] = "METRIC_FNS";
    _ET2FNS[_ET.MC] = "METRIC_FNS";
    _ET2FNS[_ET.AQ] = "FORM_FNS";
    _ET2FNS[_ET.AL] = "FORM_FNS";    
    _ET2FNS[_ET.AC] = "FORM_FNS";
    _ET2FNS[_ET.AE] = "ELEM_FNS";

    var _TP = {
        FILTER : 1,
        REPORT : 3,        
        METRIC : 4,
        FOLDER : 8,        
        PROMPT : 10,
        FUNCTION: 11,
        ATTR : 12,
        FACT: 13,
        DIM:14,
        FORM : 21,
        ROLE: 43 //transformation
    }, _STP = {
        FILTER : 256,
        CUSTOMGROUP : 257,
        PROMPT : 2560,
        PROMPT_BOOLEAN : 2561,
        PROMPT_LONG : 2562,
        PROMPT_STRING : 2563,
        PROMPT_DOUBLE : 2564,
        PROMPT_DATE : 2565,
        PROMPT_OBJECTS : 2566,
        PROMPT_ELEMENTS : 2567,
        PROMPT_EXPRESSION : 2568,
        PROMPT_EXPRESSION_DRAFT : 2569,
        PROMPT_DIMTY : 2570,
        PROMPT_BIGDECIMAL : 2571,
        REPORT_GRID : 768,
        REPORT_GRAPH : 769,
        REPORT_ENGINE : 770,
        REPORT_TEXT : 771,
        REPORT_DATAMART : 772,
        REPORT_BASE : 773,
        REPORT_GRIDGRAPH : 774,
        REPORT_NONINTERACTIVE : 775,
        REPORT_CUBE : 776
    }, OBJKEY2TP = {
        a : _TP.ATTR,
        a2 : _TP.ATTR,
        m : _TP.METRIC,
        m2 : _TP.METRIC,
        r : _TP.REPORT,
        f : _TP.FILTER,
        p : _TP.PROMPT
    };

    /**
     * <p>
     * Maps expression type to allowed target types.
     * </p>
     * 
     * @private
     */
    var ET2TP = {};
    ET2TP[_ET.MQ] = _TP.METRIC;
    ET2TP[_ET.MC] = _TP.METRIC;
    ET2TP[_ET.AQ] = _TP.ATTR;
    ET2TP[_ET.AL] = _TP.ATTR;    
    ET2TP[_ET.AC] = _TP.ATTR;
    ET2TP[_ET.AE] = _TP.ATTR;
    ET2TP[_ET.F] = _TP.FILTER;
    ET2TP[_ET.R] = _TP.REPORT;

    // NOTE, can not pre-process anything in locales here, 
    // since at this time, locales may still have pre-set default values,
    // we only can keep the reference, later locales maybe updated by task to have real
    // locale related strings.
    var _funcTrans = function(funs){
            var len = funs.length,
            r = {};
            for (var i = 0; i < len; i ++){
                var f = funs[i];
                r[f.did] = f.n;
            }
            return r;
        },
        _tpTrans = function(funs){
            var len = funs.length;
            for (var i = 0; i < len; i ++){
                var fun = funs[i];
                if ('tp' in fun) {
                    fun.t = fun.tp;
                }
            }
            return funs;
        },
        _fnTrans = function(funs, t){
            var len = funs.length;
            for (var i = 0; i < len; i ++){
                var fun = funs[i];
                if ('tp' in fun) {
                    if (t) {
                        fun.t = t;
                    } else {
                        delete fun.t;
                    }
                }
            }
            return funs;
        },
        _arrRep = function(funs, desc){
            if (!desc) {
                desc = [];
            }
            // clean
            desc.length = 0;
            for (var i = 0, len = funs.length; i < len; i ++){
                desc[i] = funs [i];
            }
            return desc;
        },
        FORM_PROHIBITED = {
            0: [ // DTP.NUM
                 {
                     'did' :'1,76'
                 }, {
                     'did' :'1,79'
                 }, {
                     'did' :'1,77'
                 }, {
                     'did' :'1,80'
                 }, {
                     'did' :'1,78'
                 }, {
                     'did' :'1,81'
                 }, {
                     'did' :'1,18'
                 }, {
                     'did' :'1,43'
                 } ],
            1: [ // DTP.CHAR
                 {
                     'did' :'2,1'
                 }, {
                     'did' :'2,2'
                 }, {
                     'did' :'3,1'
                 }, {
                     'did' :'3,2'
                 }]
            // 2: Date is FORM_PROHIBITED['2'] = FORM_PROHIBITED[0].concat(FORM_PROHIBITED[1]) 
        };
        METRIC_PROHIBITED = {
                0:[
                       {
                           'did':'1,22'
                       },{
                            'did':'1,57'
                        }
                  ]
        };
       

    /**
     * <p>
     * Utility of functions related to filter expressions.
     * </p>
     * 
     * @class
     */
    mstrmojo.expr = mstrmojo.provide("mstrmojo.expr",
    /**
     * @lends mstrmojo.expr#
     */
    {
        /**
         * <p>
         * Enumeration of expression types.
         * </p>
         * 
         * @type String
         */
        ET : _ET,

        ETs : _ETvals,

        ET2TGT : ET2TGT,

        ET2COND : ET2C,

        ET2TP : ET2TP,

        /**
         * Enumeration of function ids (Integers).
         * 
         * @type Object
         */
        FN : {
            EQUAL: 6,
            NOT_EQUAL: 7,
            GREATER: 8,
            LESS: 9,
            GREATER_EQUAL: 10,
            LESS_EQUAL: 11,
            IN_LIST : 22,
            NOT_IN_LIST : 57,
            BETWEEN : 17,
            NOT_BETWEEN : 44,
            IS_NULL : 54,
            IS_NOT_NULL : 55,
            AND : 19,
            OR : 20,
            NOT : 21
        },

        /**
         * Enumeration of function types (Integers).
         * 
         * @type Object
         */
        FNT : {
            DEF : 1,
            RANK : 2,
            PER : 3
        },

        /**
         * Delimiter used in function keys to separate function type and id.
         * 
         * @type String
         */
        FN_SEP : ",",

        /**
         * <p>
         * Enumeration of object types (Integers).
         * </p>
         * 
         * @type Object
         */
        TP : _TP,

        /**
         * <p>
         * Enumeration of object sub-types (Integers).
         * </p>
         * 
         * @type Object
         */
        STP : _STP,

        /**
         * <p>
         * Enumeration of metric dimensionality unit types (Integers).
         * </p>
         * 
         * @type Object
         */
        DMY_TP : {
            ATTR : -1,
            DIM : -2
        },

        /**
         * <p>
         * Enumeration of data types (Integers).
         * </p>
         * 
         * @type Object
         */
        DTP : {
            UNKNOWN : -1,
            INTEGER : 1,
            UNSIGNED : 2,
            NUMERIC : 3,
            DECIMAL : 4,
            REAL : 5,
            DOUBLE : 6,
            FLOAT : 7,
            CHAR : 8,
            VARCHAR : 9,
            LONGVARCHAR : 10,
            BINARY : 11,
            VARBIN : 12,
            LONGVARBIN : 13,
            DATE : 14,
            TIME : 15,
            TIMESTAMP : 16,
            SHORT : 21,
            LONG : 22,
            MBCHAR : 23,
            BOOLEAN : 24,
            PATTERN : 25,
            BIGDECIMAL : 30
        },

        /**
         * <p>
         * The default metric data type.
         * </p>
         * 
         * @type Integer
         */
        METRIC_DTP : 3, // TO DO: move to mstrmojo.locales?

        /**
         * <p>
         * Enumeration of function data types (Integers).
         * </p>
         * 
         * @type Object
         */
        FN_DTP : {
            NUM : 0,
            CHAR : 1,
            DATE : 2
        },

        /**
         * <Mapping of data types to prompt object sub types.
         * </p>
         * 
         * @type Object
         */
        DTP2PROMPT_STP : {
            "-1" : _STP.PROMPT,
            1 : _STP.PROMPT_LONG,
            2 : _STP.PROMPT_LONG,
            3 : _STP.PROMPT_LONG,
            4 : _STP.PROMPT_DOUBLE,
            5 : _STP.PROMPT_DOUBLE,
            6 : _STP.PROMPT_DOUBLE,
            7 : _STP.PROMPT_DOUBLE,
            8 : _STP.PROMPT_STRING,
            9 : _STP.PROMPT_STRING,
            10 : _STP.PROMPT_STRING,
            14 : _STP.PROMPT_DATE,
            15 : _STP.PROMPT_DATE,
            16 : _STP.PROMPT_DATE,
            21 : _STP.PROMPT_LONG,
            22 : _STP.PROMPT_LONG,
            23 : _STP.PROMPT_STRING,
            24 : _STP.PROMPT_BOOLEAN,
            30 : _STP.PROMPT_BIGDECIMAL
        },

        /**
         * <Mapping of data types to function data types.
         * </p>
         * 
         * @type Object
         */
        DTP2FN_DTP : {
            "-1" : 0,
            1 : 0,
            2 : 0,
            3 : 0,
            4 : 0,
            5 : 0,
            6 : 0,
            7 : 0,
            8 : 1,
            9 : 1,
            10 : 1,
            11 : 0,
            12 : 0,
            13 : 0,
            14 : 0, // was: 2; temp: use numeric functions for date forms,
            15 : 0, // was: 2; temp: use numeric functions for date forms,
            16 : 0, // was: 2; temp: use numeric functions for date forms,
            21 : 0,
            22 : 0,
            23 : 1,
            24 : 0,
            25 : 1,
            30 : 0
        },
        /**
         * <p>
         * Computes the number of constants supported by a given function.
         * </p>
         * 
         * @param {Number}
         *            fn The function id.
         * @param {Number}
         *            fnt The function type.
         * @returns {Integer} The number of constants supported by a given
         *          function.
         */
        fnCstCount : function fcc(fn, fnt) {
                // if (fnt === this.FNT.DEF) {
            var f = this.FN;
            switch (fn) {
            case f.BETWEEN: // between
            case f.NOT_BETWEEN: // not between
                return 2;
            case f.IS_NULL: // is null
            case f.IS_NOT_NULL: // is not null
                return 0;
            default:
                return 1;
            }
            // }
            // return 1;
        },

        /**
         * Return true if the function is either IN_LIST or NOT_IN_LIST. 
         */
        fn_List: function fn_List(fn, fnt){
            var f = this.FN;
            return fn == f.IN_LIST || fn == f.NOT_IN_LIST;
        },
        
        /**
         * Return true for the function/function type that allows AC or MC expression. 
         */
        fn_AC_MC: function fn_AC_MC(fn, fnt){
            var f = this.FN;
            return (fn == f.EQUAL) || (fn == f.NOT_EQUAL) || (fn == f.GREATER) || (fn == f.LESS) || (fn == f.GREATER_EQUAL) || (fn == f.LESS_EQUAL);      
        },
        
        
        /**
         * Looks up the name for a given function.
         */
        fnName : function fnn(et, fn, fnt, dtp) {
            var arr = this[_ET2FNS[et]];
            if (arr && arr.constructor === Object) {
                arr = arr[this.DTP2FN_DTP[dtp]] || arr["*"];
            }
            var i = _A.find(arr, "did", (fnt || 1) + this.FN_SEP + fn);
            if (i > -1) {
                return arr[i].n;
            }
            return '';
        },

    
        /**
         * Searches a given expression node and its subnodes for conditions with
         * a target (attribute, metric, embedded object).
         * 
         * @param {Object}
         *            nd The expression node.
         * @param {String}
         *            idField The name of the property which specifies a
         *            target's id. Used to filter our duplicate targets from the
         *            result.
         * @param {Object}
         *            h The hashtable in which to record results; if missing,
         *            one is created. Useful for building up results from
         *            separate searches in multiple expression trees.
         * @return {Object} Hashtable of all unique targets found; keyed by the
         *         given idField.
         */
        findTargets : function fndT(nd, idField, h) {
            if (!h) {
                h = {};
            }
            if (nd) {
                // Walk the targets (attributes, metrics).
                for ( var k in OBJKEY2TP) {
                    var t = nd[k];
                    if (t) {
                        if (!t[MTP]) { // renamed "tp" to "t"
                            t[MTP] = OBJKEY2TP[k]; // renamed "tp" to "t"
                        }
                        h[t[idField]] = t;
                    }
                }
        // Walk the dimensionality units (attributes; ignore dimensions).
                if (nd.dmy) {
                    var A = this.TP.ATTR, DA = this.DMY_TP.ATTR, uts = nd.dmy.uts;
                    for ( var u = 0, uLen = (uts && uts.length) || 0; u < uLen; u++) {
                        var ut = uts[u];
                        if (ut && ut.utp === DA) {
                            var dt = ut.utgt;
                            if (!dt.t) {
                                dt.t = A;
                            }
                            h[dt[idField]] = dt;
                        }
                    }
                }

                // If we have children, walk them (recursively).
                var ch = nd.nds, i, len;
                for ( i = 0, len = (ch && ch.length) || 0; i < len; i++) {
                    this.findTargets(ch[i], idField, h);
                }
                var cs = nd.cs,
                    clen = cs && cs.length;
                if (clen){
                    for (i = 0; i < clen; i ++){
                        this.findTargets(cs[i], idField, h);
                    }
                }
            }
            return h;
        },
        onLocaleUpdated : function() {
            var _STRS = mstrmojo.locales.expression,
                _E = mstrmojo.expr;
        /**
         * Lookup of branch qual function names.
         */
            _E.BRANCH_FNS = H.copy(_funcTrans(_STRS.BranchQual), _E.BRANCH_FNS); 
        /*{
            19 : "AND",
            20 : "OR",
            21 : "NOT"
        },*/
    
        /**
         * <p>
         * Lookup of element list functions (operators).
         * </p>
         */
            _E.ELEM_FNS = _arrRep(_fnTrans(_STRS.Element, 'fn'), _E.ELEM_FNS); 
            /*[ {
            did : '1,22',
            n : 'In List',
            t : 'fn'
        }, // renamed "tp" to "t"; assumes mstrmojo.meta.TP is "t"
                {
                    did : '1,57',
                    n : 'Not In List',
                    t : 'fn'
                } // renamed "tp" to "t"
            ],*/
    
            /**
             * <p>
             * Lookup for metric functions (operators), keyed by metric's data type
             * ("*" = default).
             * </p>
             */
            _E.METRIC_FNS = {
                "*" : _fnTrans(_A.filter(_STRS.Metric, function(item){
                        return item.did && (_A.find(METRIC_PROHIBITED['0'], 'did', item.did) < 0);}))
                    /*[ {
                    did : '1,6',
                    'n' : 'Equal to'
                }, {
                    did : '1,7',
                    'n' : 'Not Equal to'
                }, {
                    did : '1,8',
                    'n' : 'Greater than'
                }, {
                    did : '1,10',
                    'n' : 'Greater than or equal to'
                }, {
                    did : '1,9',
                    'n' : 'Less than'
                }, {
                    did : '1,11',
                    'n' : 'Less than or equal to'
                }, {
                    did : '1,17',
                    'n' : 'Between'
                }, {
                    did : '1,44',
                    'n' : 'Not between'
                }, {
                    did : '1,54',
                    'n' : 'Is Null'
                }, {
                    did : '1,55',
                    'n' : 'Is not null'
                }, {
                    did : '1,22',
                    'n' : 'In'
                }, {
                    did : '1,57',
                    'n' : 'Not in'
                }, {
                    did : '2,1',
                    'n' : 'Highest'
                }, {
                    did : '2,2',
                    'n' : 'Lowest'
                }, {
                    did : '3,1',
                    'n' : 'Highest (%)'
                }, {
                    did : '3,2',
                    'n' : 'Lowest (%)'
                } ]*/
            };
            /**
             * <p>
             * Lookup for attribute form functions (operators), keyed by form's data
             * type ("*" = default).
             * </p>
             */
            _E.FORM_FNS = {
                0 : // DTP.NUM
                    _fnTrans(_A.filter(_STRS.Attribute, function(item){
                        return item.did && (_A.find(FORM_PROHIBITED['0'], 'did', item.did) < 0);})),
                1 : // DTP.CHAR
                    _fnTrans(_A.filter(_STRS.Attribute, function(item){
                        return item.did && (_A.find(FORM_PROHIBITED['1'], 'did', item.did) < 0);})),
                2 : // DTP.DATE
                    _fnTrans(_A.filter(_STRS.Attribute, function(item){
                        return item.did && (_A.find(FORM_PROHIBITED['0'], 'did', item.did) < 0) && (_A.find(FORM_PROHIBITED['1'], 'did', item.did) < 0);}))
                    
                    /*[ // DTP.NUM
                {
                    did : '1,6',
                    n : 'Equal to'
                }, {
                    did : '1,7',
                    'n' : 'Not Equal to'
                }, {
                    did : '1,8',
                    'n' : 'Greater than'
                }, {
                    did : '1,10',
                    'n' : 'Greater than or equal to'
                }, {
                    did : '1,9',
                    'n' : 'Less than'
                }, {
                    did : '1,11',
                    'n' : 'Less than or equal to'
                }, {
                    did : '1,17',
                    'n' : 'Between'
                }, {
                    did : '1,44',
                    'n' : 'Not between'
                } ],
                1 : [ // DTP.CHAR
                {
                    did : '1,6',
                    n : 'Equal to'
                }, {
                    did : '1,7',
                    'n' : 'Not Equal to'
                }, {
                    did : '1,8',
                    'n' : 'Greater than'
                }, {
                    did : '1,10',
                    'n' : 'Greater than or equal to'
                }, {
                    did : '1,9',
                    'n' : 'Less than'
                }, {
                    did : '1,11',
                    'n' : 'Less than or equal to'
                }, {
                    did : '1,17',
                    'n' : 'Between'
                }, {
                    did : '1,44',
                    'n' : 'Not between'
                }, {
                    did : '1,76',
                    'n' : 'Contains'
                }, {
                    did : '1,79',
                    'n' : 'Does not contain'
                }, {
                    did : '1,77',
                    'n' : 'Begins with'
                }, {
                    did : '1,80',
                    'n' : 'Does not begin with'
                }, {
                    did : '1,78',
                    'n' : 'Ends with'
                }, {
                    did : '1,81',
                    'n' : 'Does not end with'
                }, {
                    did : '1,18',
                    'n' : 'Like'
                }, {
                    did : '1,43',
                    'n' : 'Not like'
                }, {
                    did : '1,54',
                    'n' : 'Is Null'
                }, {
                    did : '1,55',
                    'n' : 'Is not null'
                }, {
                    did : '1,22',
                    'n' : 'In'
                }, {
                    did : '1,57',
                    'n' : 'Not in'
                } ]*/
            };
    
            _E.DIMTYLEVELS = _arrRep(_fnTrans(_STRS.DimtyLevels), _E.DIMTYLEVELS) ;
                /*[ {
                did : 0,
                n : 'Default level'
            }, {
                did : 1,
                n : 'Metric level'
            }, {
                did : 2,
                n : 'Report level'
            } ],*/
        }
    });
    
    mstrmojo.expr.onLocaleUpdated();

})();