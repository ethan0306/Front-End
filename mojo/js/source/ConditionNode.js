(function(){

    mstrmojo.requiresCls(
            "mstrmojo.expr", 
            "mstrmojo.css",
            "mstrmojo._IsExprNode", 
            "mstrmojo._HasPopup", 
            "mstrmojo.Widget");
    
    var _D = mstrmojo.dom,
        _C = mstrmojo.css,
        _S = mstrmojo.string.htmlAngles,
        _E = mstrmojo.expr,
        _ET = _E.ET,
        _F = _E.FN,
        _NOT = _E.BRANCH_FNS[_F.NOT],
        _BTs = {};
    _BTs[_F.BETWEEN] = 1;
    _BTs[_F.NOT_BETWEEN] = 1;
   
    /**
     * Helper functions that build an (inner) HTML string for the given condition data object.
     * @private
     * @ignore
     */
    var _html = {
        "*": function(d, me){
                return d ?
                    ('<span class="mstrmojo-unknown">' + (_S(d.n || d.xml) || "...") + '</span>')
                    : null;
            }
        
    };
    function _htmlEmbedObj(d, me, n, obj_t){
        return n && ((obj_t ? '<span class="mstrmojo-ListIcon t' + obj_t + '"></span>' : '') +
        					'<span class="mstrmojo-text mstrmojo-embedobj">' +
        				_S(n) + '</span>');
    }
    _html[_ET.R] = function(d, me){
        return _htmlEmbedObj(d, me, d.r && d.r.n, d.r && d.r.t);
    };
    _html[_ET.F] = function(d, me){
        return _htmlEmbedObj(d, me, d.f && d.f.n, d.f && d.f.t);
    };
    _html[_ET.XML] = function(d, me){
        return _htmlEmbedObj(d, me, d.n || d.p && d.p.n || d.xml, d.p && d.p.t);
    };
    _html[_ET.AE] = function(d, me){
        var h = [];
        
        // Display the attribute name.
        if (d && d.a && d.a.n) {
            h.push('<span class="mstrmojo-text mstrmojo-attr">' + _S(d.a.n) + '</span>');
            
            // Display the function if it is not "In List".
            if (d.fn !== _E.FN.IN_LIST) {
                h.push('<span class="mstrmojo-text mstrmojo-fn">' + _S(_E.fnName(d.et, d.fn, d.fnt)) + '</span>');
            }

            // Display the element names.
            var es = d.es,
                l = es && es.length || 0;
            if (l) {
                h.push('<span class="mstrmojo-elems">');
                var k = h.length;
                for (var e=0; e<l; e++) {
                    h[k++] = '<span class="mstrmojo-text mstrmojo-elem">';
                    h[k++] = _S(es[e].n);
                    if (e<l-1){
                        h[k++] = ',';
                    }
                    h[k++] = '</span>';
                }
                h[k++] = '</span>';
            } else {
                h.push('<span class="mstrmojo-text mstrmojo-emptyelems">(Empty)</span>');
            }
        }
        
        return h.join('');        
    };
    _html[_ET.AQ] = function(d, me){
        var h = [];
        // Display the attribute name.
        if (d && d.a && d.a.n) {
            h.push('<span class="mstrmojo-text mstrmojo-attr">' + _S(d.a.n) + '</span>');

            // Display the form name.
            if (d.fm && d.fm.n) {
                h.push('<span class="mstrmojo-text mstrmojo-form">' + _S(d.fm.n) + '</span>');
                
                // Display the function.
                if (d.fn != null) {
                    h.push('<span class="mstrmojo-text mstrmojo-fn">' + _S(_E.fnName(d.et, d.fn, d.fnt, d.fm.dtp)) + '</span>');
                    
                    var cc = _E.fnCstCount(d.fn, d.fnt);
                    // Is this a form comparison?
                    if (d.et === _ET.AC) {
                        if (cc >= 1) {
                            // Display the attribute + form being compared to.
                            if (d.a2 && d.a2.n) {
                                h.push('<span class="mstrmojo-text mstrmojo-attr2">' + _S(d.a2.n) + '</span>');
    
                                if (d.fm2 && d.fm2.n) {
                                    h.push('<span class="mstrmojo-text mstrmojo-form2">' + _S(d.fm2.n) + '</span>');
                                }
                            }
                            if (cc >1) {
                                h.push('<span class="mstrmojo-text mstrmojo-btwn">' + me.betweenText + '</span>');
                                if (d.a3 && d.a3.n) {
                                    h.push('<span class="mstrmojo-text mstrmojo-attr3">' + _S(d.a3.n) + '</span>');
        
                                    if (d.fm3 && d.fm3.n) {
                                        h.push('<span class="mstrmojo-text mstrmojo-form3">' + _S(d.fm3.n) + '</span>');
                                    }
                                }
                            }
                        }
                    } else if(d.et === _ET.AL){
                        var cs = d.cs, t=[];
                        for(var i=0, len=cs.length;i<len;i++){
                            t.push(cs[i].v);
                        }
                        h.push('<span class="mstrmojo-text mstrmojo-c1">' + t.join(mstrConfig.listSep) + '</span>');
                    } else {
                        // Not a form comparison, just standard form qual.
                        // Display the constants.
                        if (cc >= 1) {
                            var cs = d.cs,
                                c0 = cs && cs[0];
                            h.push('<span class="mstrmojo-text mstrmojo-c1">' + _S(c0 && c0.p && c0.p.n || c0 && c0.v) + '</span>');
                            if (cc >1) {
                                var c1= cs && cs[1];
                                h.push('<span class="mstrmojo-text mstrmojo-btwn">' + me.betweenText + '</span>');
                                h.push('<span class="mstrmojo-text mstrmojo-c1">' + _S(c1 && c1.p && c1.p.n || c1 && c1.v) + '</span>');
                            }
                        } 
                    }
                }
            }
        }
        return h.join('');
    };
    _html[_ET.AC] = _html[_ET.AQ];
    _html[_ET.AL] = _html[_ET.AQ];    
    _html[_ET.MQ] = function(d, me){
        var h = [];
        // Display the attribute name.
        if (d && d.m && d.m.n) {
            h.push('<span class="mstrmojo-text mstrmojo-metric">' + _S(d.m.n) + '</span>');
                
            // Display the function.
            if (d.fn != null) {

                // TO DO: use the default metric data type, rather than hard-coding it to REAL
                h.push('<span class="mstrmojo-text mstrmojo-fn">' + _S(_E.fnName(d.et, d.fn, d.fnt, _E.DTP.REAL)) + '</span>');
                
                var cc = _E.fnCstCount(d.fn, d.fnt);
                // Is this a metric comparison?
                if (d.et == _E.ET.MC) {
                    // Yes, show the second metric.
                    // No, just a single metric qual. Display the constants.
                    if (cc >= 1) {
                        var m2n = (d.m2 && d.m2.n) || '?';
                        h.push('<span class="mstrmojo-text mstrmojo-m2">' + _S(m2n) + '</span>');
                        if (cc >1) {
                            h.push('<span class="mstrmojo-text mstrmojo-btwn">' + me.betweenText + '</span>');
                            var m3n = (d.m3 && d.m3.n) || '?';
                            h.push('<span class="mstrmojo-text mstrmojo-m3">' + _S(m3n) + '</span>');
                        }
                    }
                } else {
                    // No, just a single metric qual. Display the constants.
                    if (cc >= 1) {
                        var cs = d.cs,
                            c0 = cs && cs[0];
                        h.push('<span class="mstrmojo-text mstrmojo-c1">' + _S(c0 && c0.p && c0.p.n || c0 && c0.v) + '</span>');
                        
                        if (cc >1) {
                            var c1= cs && cs[1];
                            h.push('<span class="mstrmojo-text mstrmojo-btwn">' + me.betweenText + '</span>');
                            h.push('<span class="mstrmojo-text mstrmojo-c2">' + _S(c1 && c1.p && c1.p.n || c1 && c1.v) + '</span>');
                        }
                    } 
                }
                
                // Show the dimensionality.
                var uts = d.dmy && d.dmy.uts,
                    uLen = uts && uts.length;
                if (uLen) {
                    h.push('<span class="mstrmojo-text mstrmojo-at">' + me.atText + '</span>');
                    h.push('<span class="mstrmojo-dmy">');
                    for (var u=0; u<uLen; u++){
                        var ut = uts[u];
                        h.push('<span class="mstrmojo-text mstrmojo-dmyunit">');
                        h.push(_S(ut.utgt ? ut.utgt.n : ut.n));
                        if (u<uLen-1) {
                            h.push(',');
                        }
                        h.push('</span>');
                    }
                    h.push('</span>');
                }
            }
        }
        return h.join('');
    };
    _html[_ET.MC] = _html[_ET.MQ];

    /**
     * Renders the "NOT" HTML that preceeds the HTML for a condition or branch qual's content.
     * This HTML will go on the same line above the content.  This method assumes that CSS rules will hide this HTML
     * if it should not be visible (for example, if this condition has an AND/OR parent which will display the "NOT" above this condition).
     * @param {mstrmojo.Widget} me The widget representing an expression node.
     */
    function _not(me) {
        var d = me.data;
        if (d.not) {
            return '<span class="mstrmojo-text mstrmojo-not">' + _NOT + '</span>';
        }
        return '';
    }

    function _fn(me){
        var d = me.data,
            f = _html[d && d.et] || _html["*"];
        return _not(me) + (
                    (f && f(d, me)) || ('<span class="mstrmojo-text">' + me.emptyText + '</span>')
                );
    }
    
    /**
     * <p>Generic display for a condition in a filter expression tree.</p>
     *
     * <p>ConditionNode represents either a metric qualification, metric comparison, element list,
     * attribute form qualification, embedded filter, embedded report, or a unknown "xml" filter node.</p>
     *
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.ConditionNode = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        [mstrmojo._IsExprNode, mstrmojo._HasPopup],
        // instance members
        /**
         * @lends mstrmojo.ConditionNode.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.ConditionNode",
            
            /**
             * <p>Data representation of the condition in a filter expression.<p>
             * <p>The data object exposes the following properties:</p>
             * <dl>
             *   <dt>et</dt>
             *   <dd>The expression type (as enumerated in mstrmojo.expr.ET).</dd>
             *   <dt>not</dt>
             *   <dd>If true, indicates that this entire condition should be prefixed with a "NOT" branch qualifier.</dd>
             * </dl>
             * <p>Additional properties of the data object vary according to the data object's expression type ("et").
             * For an attribute element list, the data object should expose the following additional properties:</p>
             * <dl>
             *   <dt>a</dt>
             *   <dd>The attribute of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>fn</dt>
             *   <dd>The id of the function (operator); either In List or Not In List.</dd>
             *   <dt>fnt</dt>
             *   <dd>The type of the function (1=default,2=rank,3=percent; should be 1).</dd>
             *   <dt>es</dt>
             *   <dd>Array of element objects. Each element object has properties: "did" (identifier), "n" (name).</dd>
             * </dl>
             * <p>For an embedded object, the data object should expose one of the following properties:</p>
             * <dl>
             *   <dt>r</dt>
             *   <dd>The embedded report of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>f</dt>
             *   <dd>The embedded filter of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             * </dl>
             * <p>For an attribute elements qualification, the data object should expose the following properties:</p>
             * <dl>
             *   <dt>a</dt>
             *   <dd>The attribute of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>fm</dt>
             *   <dd>The attribute form of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>fn</dt>
             *   <dd>The id of the function (operator).</dd>
             *   <dt>fnt</dt>
             *   <dd>The type of the function (1=default,2=rank,3=percent).</dd>
             *   <dt>cs</dt>
             *   <dd>Array of 0-2 constant objects. Each element object has properties: "v" (value), "dtp" (data type).</dd>
             * </dl>
             * <p>For a metric qualifcation, the data object should expose the following properties:</p>
             * <dl>
             *   <dt>m</dt>
             *   <dd>The metric of the qualification; an object with properties: "did" (identifier), "n" (name).</dd>
             *   <dt>fn</dt>
             *   <dd>The id of the function (operator).</dd>
             *   <dt>fnt</dt>
             *   <dd>The type of the function (1=default,2=rank,3=percent).</dd>
             *   <dt>cs</dt>
             *   <dd>Array of 0-2 constant objects. Each element object has properties: "v" (value), "dtp" (data type).</dd>
             *   <dt>dmty</dt>
             *   <dd>Hashtable of dimensionality properties: "cc" (Boolean, can continue); "fres" (Boolean, filter restriction); 
             *   "uts": Array of units, each unit is an object: {n: String, utp: Integer, utgt: Object, agg: Integer, flt: Integer, gb: Boolean, prs: Integer}.</dd>
             * </dl>
             * @type Object
             */
            data: null,
            
            /**
             * @ignore
             */
            markupString: '<div id="{@id}" class="mstrmojo-cond mstrmojo-ConditionNode {@cssClass}">'
                    + '<div class="mstrmojo-onhoverparent mstrmojo-cond-prefix {@cssClass}" mstrAttach:mousedown>'
                        + '<span class="mstrmojo-textset mstrmojo-cond-prefix-text" mstrAttach:click></span>'
                        + '<span class="mstrmojo-onhover-in mstrmojo-andor-tools {@cssClass}">'
                            + '<img class="mstrmojo-outdent disable" src="../images/1ptrans.gif" title="' + mstrmojo.desc(5896,"Ungroup conditions") + '" />'                                    
                            + '<img class="mstrmojo-outdent" src="../images/1ptrans.gif" title="' + mstrmojo.desc(5896, "Ungroup conditions") + '"'
                                + 'onclick="mstrmojo.all[\'{@id}\'].out()" />'
                            + '<img class="mstrmojo-indent disable" src="../images/1ptrans.gif" title="' + mstrmojo.desc(5895, "Group conditions") + '" />'                                              
                            + '<img class="mstrmojo-indent" src="../images/1ptrans.gif" title="' + mstrmojo.desc(5895, "Group conditions")+ '"'
                                + 'onclick="mstrmojo.all[\'{@id}\'].ind()" />' 
                        + '</span>'                                 
                    + '</div>'
                    + '<div class="mstrmojo-onhoverparent mstrmojo-cond-contents {@cssClass}">'
                        + '<span class="mstrmojo-textset mstrmojo-cond-text {@cssClass}" mstrAttach:click></span>'
                        + '<span class="mstrmojo-rel mstrmojo-cond-popupNode {@cssClass}"></span>'
                        + '<span class="mstrmojo-onhover-bl mstrmojo-abs mstrmojo-topleft mstrmojo-cond-tools {@cssClass}">'
                            + '<img class="mstrmojo-del" src="../images/1ptrans.gif" title="' + mstrmojo.desc(7931, "Delete condition") + '"'
                                + 'onclick="mstrmojo.all[\'{@id}\'].del()" />'
                        + '</span>' 
                    + '</div>'
                + '</div>',
                
            /**
             * @ignore
             */                
            markupSlots: {
                prefixNode: function(){return this.domNode.firstChild.firstChild;},
                condNode: function(){return this.domNode.childNodes[1];},
                textNode: function(){return this.domNode.childNodes[1].firstChild;},
                popupNode: function(){return this.domNode.childNodes[1].childNodes[1];}
            },
            
            /**
             * @ignore
             */                
            markupMethods: {
                oneditableChange: function(){
                    _C.toggleClass(this.textNode, ['editable'], this.editable);
                    _C.toggleClass(this.prefixNode, ['editable'], this.editable);
                },
                onselectedChange: function(){
                    // Toggle highlighting to indicate a selected condition in a list.
                    _C.toggleClass(this.condNode, ['selected'], this.selected);
                },
                ondataChange: function(){
                    // Repaint the branch qual prefix text.
                    this.prefixNode.innerHTML = this.andOrTxt();
                    // Repaint the text to show the current data.
                    this.textNode.innerHTML = _fn(this);
                }
            },
            
            /**
             * HTML string to display between 2 constants in a "between" or "not between" qualification.
             * @type String
             */
            betweenText: mstrmojo.desc(308,"and"),

            /**
             * HTML string to display before dimensionality in a metric qualification/comparison.
             * @type String
             */
            atText: mstrmojo.desc(5923,"at"),

            /**
             * Optional HTML string to display if data is null or empty.
             * @type String
             */
            emptyText: mstrmojo.desc(7930,"Empty condition"),

            /**
             * Deletes this condition from an expression tree.
             */
            del: function del(){
                var p = this.parent;
                if (p && p.remove && this.data) {
                    p.remove(this.data);
                }
            },
            /**
             * Returns whether the current condition is empty.
             */
            isEmpty: function() {
                // if current condition has target assigned, then it is not empty
                var d = this.data,
                    et = d && d.et,
                    tgt = et && mstrmojo.expr.ET2TGT[et];
                return !(tgt && d[tgt]);
            },
	    /**
	     * Mousedown handler to stop event bubbling in order to only select the condition when clicking on the condition node. 
             */
	    premousedown: function pmd(evt){
                _D.stopPropogation(evt.hWin, evt.e);
            },

            /**                        
             * Extends the inherited method in order to record the "part" property of the event, which
             * lets event listeners know which part of this widget's DOM was targeted by the click; either
             * "andor" (if the "AND"/"OR" text was clicked) or "condition" (if the text of the qualification
             * was clicked).
             */
            preclick: function pc(evt){
                var p = null,
                    t = _D.eventTarget(evt.hWin, evt.e);
                if (_D.contains(this.prefixNode, t, true)) {
                    // Clicking on the branch qual text counts.
                    p = 'andor';
                } else if (_D.contains(this.textNode, t, true)) {
                    p = 'condition';
                }
                evt.part = p;
            }
        });
})();
