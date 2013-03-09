(function () {
    
    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.css",
            "mstrmojo.string",
            "mstrmojo.Widget"
    );
    

    var DEL_LIST = ['(',')', '{', '}', '-', '+', '*', '/', '<', '>','=', '|', '~',',' , ' ','\t', '\n',';'],
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
    
    mstrmojo.QB.FFsqlToken = mstrmojo.declare(
            mstrmojo.Widget, 
            null, 
            {
            	scriptClass: "mstrmojo.QB.FFsqlToken",
            	
                data:null,
                
                markupString: '<span id={@id} class="mstrmojo-token {@cssClass}"></span>',
                
                active: false,
               
                dropZone:true,
                allowDrop: function allowDrop(ctxt){
     	                 return this.dropZone; 
                        },
                ondrop:function(e){
                      mstrmojo.all.FFsql.ondrop(e);
                },
                
                markupMethods: {
                ondataChange: function(){
                	
                    var d = this.data;
                    if(d.v===','){
                        this.domNode.innerHTML = mstrmojo.string.encodeHtmlString(String(d.v));
                    }
                    else if(d.v=='\n'){
                     	this.domNode.innerHTML = "<br>";
                    }
                    else {
                        this.domNode.innerHTML = mstrmojo.string.encodeHtmlString(String(d.v));
                    }
                  
                               mstrmojo.css.toggleClass(this.domNode, ['mstr'], this.isMstrO());
                               mstrmojo.css.toggleClass(this.domNode, ['sql'], this.isSql());
                               mstrmojo.css.toggleClass(this.domNode,['invalid'], d.sta === -1);
                   
                   
                },
                onactiveChange: function(){
                    mstrmojo.css.toggleClass(this.domNode, ['active'], this.active);
                    if(!this.active){
                    	var ff=mstrmojo.all.FFsql;
                    	if(!this.isMstrO()&&!this.isDelimiter()){
                    	      var items=ff.candidates.items;
                    	      for(var i=0,len=items.length; i<len; i++){
                    		     if(this.data.v.toLowerCase()==items[i].n.toLowerCase()){
                    		    	 this.data.oi=items[i];
                    		    	// this.data.v=items[i].n;
                    		    	// this.paint();
                    		    	 break;
                    		     }
                    	      }
                    	 }
                    mstrmojo.css.toggleClass(this.domNode, ['mstr'], this.isMstrO());
                    mstrmojo.css.toggleClass(this.domNode, ['sql'], this.isSql());
                    }
                }
            },
                
                isMstrO: function isMstrO(){
                    return !!this.data.oi || !!this.data.rfd;
                },
                
                isSql: function isSql(){
                    return this.data.oi&&this.data.oi.sta===100;
                },
                
                length: function length(){
                    return this.data.v.length;
                },
                
                isDelimiter: function isDelimiter(){
                    return this.data.isDelimiter || (this.length() === 1 && _isDelimiter(this.data.v));
                },
                
                split2Tokens: function split2Tokens(offset, ic){
                    var d = this.data,
                    s = d && d.v,
                    sb = s.substring(0, offset),
                    sa = s.substring(offset);
                    return [{v: sb,isNew: true, did: d.did},{v: sa,isNew: true, did:ic}];
                },
                
                mergeTo: function mergeTo(w){
                    var d = this.data,
                        s = d && d.v,
                        ws = w.data.v;
                    return {v: s + ws,isNew: true};
                },
                
                setItemInfo: function setItemInfo(it){
                    var d = this.data;
                    //update value and object info property
                    d.v = it.n;
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
    
    mstrmojo.QB.FFsqlToken.isDelimiter = _isDelimiter;
  //  mstrmojo.ME.MetricToken.brackets = _brackets;
      
    
})();