(function () {
    
    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.css",
            "mstrmojo.string",
            "mstrmojo.Widget"
    );
    
    var DEL_LIST = ['(',')', '{', '}', '-', '+', '*', '/', '<', '>', '|', '~', ','],
        OTHER_SPECIALS = {
          ' ': true,
          '@': true
        },
        DEL_MAP = null;


    function _isDelimiter(c){
        if(!DEL_MAP){
            DEL_MAP = {};
            var i, len;
            for(i=0,len=DEL_LIST.length; i<len; i++){
                DEL_MAP[DEL_LIST[i]] = true;
            }
        }
        return DEL_MAP[c];
    }

    function _containsSpecials(s){
        if(!s){
            return false;
        }
        var len = s.length,
            i, c;
        for(i=0;i<len;i++){
            c = s.charAt(i);
            if(_isDelimiter(c) || OTHER_SPECIALS[c]){
                return true;
            }
        }
        return false;
    }
    
    function _brackets(s){
        return _containsSpecials(s) ? '[' + s + ']' : s;
    }
    
    /**
     * A MetricToken widget represents a unit recognized by backend parser in metric expression. It has the following 
     * properties:
     * 1) v. The value of each token. This property is used to display the MetricToken in TokenInputBox. 
     * 2) tp. The type of the token. The value comes from EnumDSSTokenType defined in backend com api. When the token is
     *    generated from GUI, this property shall be initialized to DssTokenTypeUnknown = 2. Backend parser may change its 
     *    value during the parsing process, GUI shall not modify it afterward, unless the same token is modified.
     * 3) lv. The (parsing) level of the token. This property reflects the current parsing level the backend parser has
     *    proceeded on this token. When the token is generated from GUI initially, it shall be set to DssTokenLevelClient = 1.
     * 4) dst. The subtype of the object associated with this token. If there is a MicroStrategy object associated with this token,
     *    this property shall correspond to the subtype of such an object;otherwise, it shall be -1. But web can initialize it to -1 or
     *    not send it all at when create it initially (agreed upon by backend engineer). 
     * 5) sta. The state of the token. This property reflects the state of the token reached by backend parser on this token.
     *    When the token is generated from GUI, this value shall be initialized to DssTokenStateInitial = 1. 
     * 6) sps. The start position of the token. This property can be ignored by GUI, since it is not used and not needed to be 
     *    initialized either. 
     * 7) length. The length of the token. This property can be ignored by GUI, since it is not used and not needed to be 
     *    initialized either.  
     */
    mstrmojo.ME.MetricToken = mstrmojo.declare(
            mstrmojo.Widget, 
            null, 
            {
                data:null,
                
                markupString: '<span id={@id} class="mstrmojo-token {@cssClass}"></span>',
                
                active: false,
                
                markupMethods: {
                    ondataChange: function(){
                        var d = this.data;
                        if(d.v===','){
                            this.domNode.innerHTML = mstrmojo.string.encodeHtmlString(String(d.v)) + "&nbsp;";
                        } else {
                            this.domNode.innerHTML = mstrmojo.string.encodeHtmlString(String(d.v));
                        }
                        
                        //whether it is a valid mstr object
                        mstrmojo.css.toggleClass(this.domNode, ['mstr'], this.isMstrO());
                        
                        mstrmojo.css.toggleClass(this.domNode,['invalid'], d.sta === -1);
                    },
                    onactiveChange: function(){
                        mstrmojo.css.toggleClass(this.domNode, ['active'], this.active);
                    }
                },
                
                isMstrO: function isMstrO(){
                    return !!this.data.oi || !!this.data.rfd;
                },
                
                length: function length(){
                    return this.data.v.length;
                },
                
                isDelimiter: function isDelimiter(){
                    return this.data.isDelimiter || (this.length() === 1 && _isDelimiter(this.data.v));
                },
                
                split2Tokens: function split2Tokens(offset){
                    var d = this.data,
                    s = d && d.v,
                    sb = s.substring(0, offset),
                    sa = s.substring(offset);
                    return [{v: sb,isNew: true},{v: sa,isNew: true}];
                },
                
                mergeTo: function mergeTo(w){
                    var d = this.data,
                        s = d && d.v,
                        ws = w.data.v;
                    return {v: s + ws,isNew: true};
                },
                
                brackets:_brackets,
                
                setItemInfo: function setItemInfo(it){
                    var d = this.data;
                    
                    //update value and object info property
                    d.v = this.brackets(it.n);
                    d.oi = it;
                    d.sta = 1;
                    d.isNew = true;
                    
                    //update and refresh
                    this.set('data', d);
                    this.paint();
                },
                
                
                spliceContent: function spliceContent(offset, length, istChar){
                    var d = this.data,
                        s = d && d.v,
                        sb = s.substring(0, offset);
                    
                    //determine new value for the token
                    length = (length === null || length === undefined) ? (s.length - offset) : length;    
                    var sa = s.substring(offset + length),
                        ns = sb + (istChar || '') + sa;
                    d.v = ns;
                    
                    //remove the related object info properties
                    d.isNew = true;
                    d.sta = 1;
                    delete d.oi;
                    
                    //update and refresh
                    this.set('data', d);
                    this.paint();
                }
                
            });
    
    mstrmojo.ME.MetricToken.isDelimiter = _isDelimiter;
    mstrmojo.ME.MetricToken.brackets = _brackets;    
})();