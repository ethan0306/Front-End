(function () {

    mstrmojo.requiresCls(
            "mstrmojo.css",
            "mstrmojo.dom",  
            "mstrmojo.expr",
            "mstrmojo.range",
            "mstrmojo.WidgetListMapper",
            "mstrmojo._HasSuggestion",
            "mstrmojo.QB.FFsqlToken" 
            );

    var _D = mstrmojo.dom,
        _C = mstrmojo.css,
        KEYS = mstrmojo.Enum_Keys,
        _R = mstrmojo.range,
         EDGE = _R.EDGE,
        E = mstrmojo.expr,
        isDelimiter=mstrmojo.QB.FFsqlToken.isDelimiter;
   

    function getCharacter(e){
        var k = (_D.isIE && !_D.isIE9) ? e.keyCode : e.charCode;
        return (k>0) ? String.fromCharCode(k) : null;
    }
    
    function _dbtbl(tbl){
    	var qdl=mstrmojo.all.QBuilderModel,
    	    tbls=qdl.dbtbls[qdl.SelDBRoleID];
    	   for(var n in tbls)
    		   if(n.toLowerCase()===tbl)
    			   return tbls[n];
    	   return null;
    }
 

    mstrmojo.QB.FFsql = mstrmojo.declare(
            // superclass
            mstrmojo.ME.TokenInputBox,
            null,
            {
                scriptClass: "mstrmojo.QB.FFsql",
                
                renderBlockSize: 10000,
              
                itemFunction: function itemFunction(item, idx, w){
                return new mstrmojo.QB.FFsqlToken({ data: item });
                      },
        
               item2textCss: function item2textCss(data){
                   return {
                	   11: ' mstrmojo-ArchitectListIconSuggest t11 ',
                	   15: ' mstrmojo-ArchitectListIconSuggest t15 ',
                       26: ' mstrmojo-ArchitectListIconSuggest t26 '
                   }[data.t] || '';
               },
               
               itemIdField:'did',
               
               itemCount:0,
               
               ostack:[],
                 
               browseItemVisible: false,
                 
               customFunctionVisible: false,
             
               handlekeydown: function handlekeydown(e){
            	   if(this.editNode.contentEditable=="false") return true;
                    e = e || window.event;
                    var k = e.keyCode || e.charCode,
                        noDefault = false,
                        rInfo = _R.getRangeInfo();
                    switch(k){
                    case KEYS.DELETE:
                        try{
                            this.widgetHandleDelete(rInfo);
                            this.startTokenSuggestion();
                            this.raiseChangeEvent({type:'delete'});
                            this.updatepasses();
                        }catch(ex1){}
                        noDefault = true;
                        break;
                    case KEYS.BACKSPACE:                     
                        try{
                            this.widgetHandleBackspace(rInfo);
                            this.raiseChangeEvent({type:'backspace'});
                            this.startTokenSuggestion();
                        }catch(ex2){}
                        noDefault = true;
                        break;
                    case KEYS.ENTER:
                    	if(this.suggestionShown){
                    		var s=this.getSelected();
                    		if(s){
                               this.handleSuggestionItemSelect(s);
                               if(this.candidates.isCol)
                            	    this.set('candidates', {items:mstrmojo.all.QBuilderModel.FFsqlComp, isComplete: true});
                    		}
                        } else {
                     	  var edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset),
                              ew = _D.findWidget(rInfo.startContainer),
                              idx = this.itemIndex(ew.data),
                              itws = this.ctxtBuilder.itemWidgets,
                              isEnter=itws[idx].data.v==='\n',
                              t = {v:'\n', isDelimiter: true,isNew: true, did:this.itemCount++}
                    	      em= {v:' ', isDelimiter: true,isNew: true, did:this.itemCount++};
                              if(edge === EDGE.EDGE_MIDDLE){
                                  //split, add new delimiter token and insert <br>
                                  var ts = ew.split2Tokens(rInfo.startOffset,this.itemCount++);
                                  this.remove(idx);
                                  this.add([ts[0], t, ts[1]], idx);
                                  idx = idx + 1;
                                  
                              }
                              else if(edge === EDGE.EDGE_BEGIN)
                            		this.add([t],idx);
                              else 
                              {  idx=idx + 1;
                                 if((_D.isFF||_D.isIE)&&isEnter)
                                     this.add([em,t], idx);
                                 else 
                                	 this.add([t,em], idx);
                             }
                              if(_D.isFF||_D.isIE){
                            	  ew = itws[isEnter?idx:idx+1];
                                  this._delaySetCaretPos(ew.domNode,true);
                              }
                              else{
                            	  ew = itws[idx];
                                  this._delaySetCaretPos(ew.domNode, false);
                              }
                              this.updatepasses();
                        }
                              noDefault = true;
                    	   break;
                    case KEYS.TAB: 
                        if(this.suggestionShown){
                        	var s=this.getSelected();
                    		if(s){
                               this.handleSuggestionItemSelect(s);
                               if(this.candidates.isCol)
                            	    this.set('candidates', {items:mstrmojo.all.QBuilderModel.FFsqlComp, isComplete: true});
                    		}
                        } else {
                            this.startTokenSuggestion();
                        }
                        noDefault = true; //do not need default behavior for ENTER.
                        break;
                        
                    case KEYS.ESCAPE:
                        this.endTokenSuggestion();
                        noDefault = true; 
                        break;
                        
                    case 67: // c
                        if(e.ctrlKey){//paste
                        	this.ctrx=false;
                            noDefault = false; //Need browser to work to paste to the textbox.
                        }
                        break;   
                        
                    case 86: //v
                        if(e.ctrlKey){//paste
                            //save range info
                            this._saveRangeInfo = _R.getRangeInfo();
                            this.updatepasses();
                            if(this.ctrx){
                            	this.handlepaste(this.cutstr);
                            }
                            else{
                                this.clipboardNode.focus();
                            }
                            this.raiseChangeEvent({type:'paste'});
                            noDefault = false; //Need browser to work to paste to the textbox.
                        }
                        break;
                        
                    case 88: //x
                        if(e.ctrlKey){//cut
                          try{
                        	this.cutstr=rInfo.range.cloneContents().textContent;
                            this.widgetHandleDelete(rInfo);
                            this.startTokenSuggestion();
                            this.ctrx=true;
                            this.raiseChangeEvent({type:'cut'});
                        }catch(ex2){}
                        noDefault = false;
                        }
                        break;
                        
                    default:
                        //do nothing
                    }
                    if(noDefault){
                        //prevent default behavior
                        _D.stopPropogation(window, e);
                        _D.preventDefault(window,e);
                        return false;
                    } else {//need to let the default behavior do the job of moving caret and others
                        return true;
                    }
                },
           
                handlekeypress: function handlekeypress(e){
                	if(this.editNode.contentEditable=="false") return true;
                    e = e || window.event;
                    var c = getCharacter(e),
                        k = e.keyCode || e.charCode,
                        noDefault = false,
                        ew;
                    if(c && !(c === 'c' && e.ctrlKey)){
                        try{
                            this.widgetHandleInput(_R.getRangeInfo(), c);
                            this.raiseChangeEvent({type:'input', characeter: c});
                            var sat=this._saveActiveToken;
                            if(!isDelimiter(c)){
                            	if(!sat){
                            		w = this.findObjectToken();
                            		if(w && !w.isDelimiter()){
                                        this._saveActiveToken =sat= w;
                            		}
                            	}
                            	if(sat&&c==='.'){
                            		var dbtbl=_dbtbl(sat.data.v.toLowerCase().slice(0,-1));
                            		  if(dbtbl){
                            			if(dbtbl.columns) {
                            				this.set('candidates', {items:dbtbl.columns, isComplete: true,isCol: true});
                            				sat.isCol=true;
                            				sat.col=dbtbl.columns;
                            			    this.startTokenSuggestion();
                            			}
                            			else {
                            				 var me=this,
                            				     qdl=mstrmojo.all.QBuilderModel;
                            				 var cb={
                            						 success: function(res)
                            						 {     var its=res.items;
                            						       dbtbl.columns=its;
                            					           me.set('candidates', {items:its, isComplete: true, isCol: true});
                            					           sat.isCol=true;
                            					           sat.col=its;
                            					           me.startTokenSuggestion();
                            						 },
                            				         failure:function(){}
                            				 };
                            				if(!dbtbl.ns)
                            					 dbtbl.data={n:dbtbl.tbn};
                            				else
                            				     dbtbl.data={n:dbtbl.ns+'.'+dbtbl.tbn};
                            				qdl.getColumnsForDBTable(dbtbl,cb);
                            			}
                            		}
                            	else{
                            		sat.isCol=false;
                    				sat.col=null;
                                    this.startTokenSuggestion();
                            	   }
                            	 }
                            	else
                                    this.startTokenSuggestion();
                            }
                            else {
                                this.endTokenSuggestion();
                            }
                        }catch(ex){}
                        noDefault = true;
                    }
                    
                    if(noDefault){
                        //prevent default behavior
                        _D.stopPropogation(window, e);
                        _D.preventDefault(window,e);
                        return false;
                    } else {//need to let the default behavior do the job of moving caret and others
                        return true;
                    }
                }, 
          
                
                updatepasses: function updatepasses(){
                	var py=[],
                	    its=this.ctxtBuilder.itemWidgets,
                	    len=its.length,
                	    t=true,
                	    n=0;
                 	for(var k=0; k<len; k++){
                 		if(t&&!its[k].data.isDelimiter){
                 			py.push(_D.position(its[k].domNode).y);
                 			t=false;
                 		 }
                 	     if(its[k].data.v===';'){
                 	    	 n++;
                 	    	 t=true;
                 	     }
                 	}
                 	if(n===0) py=[];
                 	var btns=[];
                 	for(var i=0, len2=py.length; i<len2; i++){
                 		var b = {
                 		   scriptClass:"mstrmojo.Button",
                 		   cssClass:"mstrmojo-ArchitectListIconBlock label",
                 		   cssText:"position: absolute; width:10px; top:"+py[i]+"px;"
                             };
         	    		   btns.push(b);
         	    	   }
                      this.parent.passlabel.removeChildren(null,true);
                      this.parent.passlabel.addChildren(btns,0,true);
                      
                  },
                  
                widgetHandleBackspace: function widgetHandleBackspace(rInfo){
                    if(rInfo.collapsed){ //delete previous character or token
                    	var sat=this._saveActiveToken;
                    	   if(sat&&sat.data){
                    	         s=sat.data.v;
                    	         if(s&&s[s.length-1]==='.'&&sat.isCol){
                    		      this.set('candidates', {items:mstrmojo.all.QBuilderModel.FFsqlComp, isComplete: true});
					              sat.isCol=false;
					              sat.col=null;
                    	     }
                    	   }
                        var edge, ew, idx,
                            so = rInfo.startOffset,
                            itws = this.ctxtBuilder.itemWidgets;
                        //if(ew === this){
                        if(!_D.contains(this.editNode, rInfo.startContainer, false, document.body)){
                            if(rInfo.startOffset > 0 && _D.isFF){
                                //only for Firefox, somehow, range would be the end of edit node, even if it has some tokens
                                ew = itws[this.items.length-1];
                                _R.collapseOnNode(ew.domNode, false);
                                rInfo = _R.getRangeInfo();
                                edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset);
                            } else {
                                _R.collapseOnNode(this.editNode, true); 
                                return;
                            }
                        }
                        
                        edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset);
                        ew = _D.findWidget(rInfo.startContainer);
                        idx = this.itemIndex(ew.data);
                        
                        //find prev token if edge begin
                        if(edge === EDGE.EDGE_BEGIN){
                            idx --;
                            ew = itws[idx];
                            so = ew.length();
                        }
                        
                        if(!ew){//Beginning of first token, nothing to delete
                            _R.collapseOnNode(this.editNode, true);  
                            return;
                        }
                        
                        if(ew.length()  ===  1){
                            //single character, we shall remove the whole token
                            this.remove(idx);
                            if(ew.data.v===';'||ew.data.v==='\n') 
                            	this.updatepasses();
                            //position caret
                            ew = itws[idx-1];
                            if(ew){//end of prev token
                                _R.collapseOnNode(ew.domNode, false); 
                                
                                //merge two object tokens if necessary
                                this.checkMergeTwoTokens(idx-1, idx);
                                
                                ew = itws[idx-1];
                                
                            } else {//no more token widgets available 
                                _R.collapseOnNode(this.editNode, true);
                            }      
                        } else {
                            ew.spliceContent(so-1, 1);
                            if(ew.isCol)
                                 this.set('candidates', {items:ew.col, isComplete: true, isCol:true});
                            _R.collapseOnTextNode(ew.domNode, so-1);
                        }
                        
                    } else {
                        //delete every token in the selection and then set the new caret position
                        this.widgetDeleteTokens(rInfo);
                    	this.updatepasses();
                    }
                },
                
                handlepaste: function handlepaste(s){
                	if(!s){
                         var v = this.clipboardNode.value;
                         }
                	else {
                		  var v=s;
                	      }
                    this.clipboardNode.value = "";
                     var ts = [],
                        len = v && v.length,
                        i, t='', c;
                    
                    if(len>0){
                        for(i=0;i<len;i++){
                            c = v.charAt(i);
                            if(isDelimiter(c)){
                                if(!mstrmojo.string.isEmpty(t)){
                                    ts.push({v: t, isNew: true,did: this.itemCount++});
                                    t = '';
                                }
                                ts.push({v: c, isDelimiter: true, isNew: true, did: this.itemCount++});
                            } else {
                                t = t + c;
                            }
                        }
                        if(!mstrmojo.string.isEmpty(t)){
                            ts.push({v: t, isNew: true,did: this.itemCount++});
                            t = '';
                        }
                       
                        this.insertTokens(ts);
                    }
                },
               
                
                insertTokens: function insertTokens(tokens){
                    var rInfo = this._saveRangeInfo;
                    if(!rInfo || !_D.contains(this.editNode, rInfo.startContainer, false, document.body)){
                        this.add(tokens);
                        var its=this.ctxtBuilder.itemWidgets,
                        	ew = its[its.length-1];
                        this._delaySetCaretPos(ew.domNode, false);
                        this.raiseChangeEvent({type:'insert'});
                        return;
                    }
                   
                    var edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset),
                        ew = _D.findWidget(rInfo.startContainer),
                        idx = this.itemIndex(ew.data);
                    
                    if(edge  ===  EDGE.EDGE_MIDDLE){
                        var ts = ew.split2Tokens(rInfo.startOffset,this.itemCount++);
                        this.remove(idx);
                        tokens.unshift(ts[0]);
                        tokens.push(ts[1]);
                        this.add(tokens, idx);
                    } else {
                        idx = (edge === EDGE.EDGE_BEGIN ? idx : idx + 1);
                        this.add(tokens, idx);
                    }     
                    
                    //position caret
                    idx = idx + tokens.length - 1;
                    ew = this.ctxtBuilder.itemWidgets[idx];
                    this._delaySetCaretPos(ew.domNode, false);
                    this.raiseChangeEvent({type:'insert'});
                },
                
                widgetHandleInput: function widgetHandleInput(rInfo,c){
                    if(!rInfo.collapsed){
                        this.widgetDeleteTokens(rInfo);
                        rInfo = _R.getRangeInfo();
                    }
                    
                    //find the insertion point;or create one new token if not found
                    var edge, ew, idx, t, aw, so,
                        itws = this.ctxtBuilder.itemWidgets;
                    
                    if(!_D.contains(this.editNode, rInfo.startContainer, false, document.body)){
                        this.add([{v:c,isDelimiter:isDelimiter(c),isNew: true, did:this.itemCount++}], 0);
                        ew = itws[0];
                        _R.collapseOnTextNode(ew.domNode, 1);                
                        return;
                    }
                    
                    edge = _R.getEdgeInfo(rInfo.startContainer, rInfo.startOffset);
                    ew = _D.findWidget(rInfo.startContainer);
                    idx = this.itemIndex(ew.data);
                    
                    if(isDelimiter(c)){
                    	if(this.candidates.isCol)
                        	this.set('candidates', {items:mstrmojo.all.QBuilderModel.FFsqlComp, isComplete: true});
                        t = {v:c, isDelimiter: true,isNew: true, did:this.itemCount++};
                        if(edge === EDGE.EDGE_MIDDLE){
                            //split and add new delimiter token
                            var ts = ew.split2Tokens(rInfo.startOffset,this.itemCount++);
                            this.remove(idx);
                            this.add([ts[0], t, ts[1]], idx);
                            idx = idx + 1;
                        } else {
                            idx = (edge === EDGE.EDGE_BEGIN) ? idx : idx + 1;
                            this.add([t], idx); 
                        }
                        //position caret to the end of delimiter node
                        ew = itws[idx];
                        _R.collapseOnNode(ew.domNode, false);
                        if(c===';') {
                         	this.updatepasses();
                        }
                     } 
                    else {
                        so = rInfo.startOffset;
                        if(ew.isDelimiter()){
                            aw = itws[(edge === EDGE.EDGE_BEGIN) ? idx - 1 : idx + 1];
                            if(aw && !aw.isDelimiter()){
                                ew = aw;
                                so = (edge === EDGE.EDGE_BEGIN) ? ew.length() : 0;
                            }
                            this.add([{v:c,isNew: true,did:this.itemCount++}], (edge === EDGE.EDGE_BEGIN) ? idx : idx + 1);
                            ew = itws[(edge === EDGE.EDGE_BEGIN) ? idx : idx + 1];
                            _R.collapseOnNode(ew.domNode, false);
                            this.updatepasses();
                        }
                        
                        else {
                              ew.spliceContent(so, 0, c);
                               _R.collapseOnTextNode(ew.domNode, so + 1);
                        } 
                    }
                },
                
                
                getSearchPattern: function getSearchPattern(){
                    var at = this._saveActiveToken;
                       if(at.isCol){
                    	   var s=at.data.v;
                    	   pattern=s.slice(s.lastIndexOf('.')+1,s.length);
                       }
                        else
                            pattern = at && at.data.v;
                        len = pattern && pattern.length;
                    if(len > 2){
                        if(pattern.charAt(0) === '[') {
                            pattern = pattern.substring(1);
                        }
                        if(pattern.charAt(pattern.length-1) === ']') {
                            pattern = pattern.substring(0, pattern.length-1);
                        }
                    } 
                    return pattern;
                },
                
                
                getSuggestionPos: function getSuggestionPos(){
                    var at = this._saveActiveToken,
                        sp = null, p, colp=0;
                    if(at.isCol) colp=at.domNode.offsetWidth;
                    if(at){
                        p = mstrmojo.dom.position(at.domNode,true);
                        var  t=Math.round(p.y + p.h),
                        sh=this.suggestionItems.length*19,
                        ph=parseInt(mstrmojo.all.QBuilderPage.height),
                        ex=ph>t-40+sh;
                        sp = {left:Math.round(p.x) +colp+ 'px', top: ex?t+'px':p.y-sh+'px',zIndex: 100};
                    }
                    return sp;
                },
                
                onSuggestionItemSelect: function onSuggestionItemSelect(it){
                    var ow = this._saveActiveToken;
                    this.endTokenSuggestion();
                    if(it.t==-98){
                    	var items=this.items;
                    	this.clearTokens();
                    	for(var k=0; k<items.length;k++)
                    		items[k].did=this.itemCount++;
                       	this.customFunctionMode=true;
                      	var items=[{v:'{',isDelimiter: true, sta:1, isNew: true, did:this.itemCount++}].concat(items)
                      	 .concat([{v:'}',isDelimiter: true, sta:1, isNew: true, did:this.itemCount++}]);
                      	this.set('items', items);
                      var idx=this.itemIndex({did:this.itemCount-1}),
                          ew = this.ctxtBuilder.itemWidgets[idx-1];
                      this._delaySetCaretPos(ew.domNode, false);
                     }
                    else{
                     if(ow){
                    	 if(ow.isCol){
                    		 var s=ow.data.v,
                    		     c={};
                    		 mstrmojo.hash.copy(it,c);
                    		 c.n=s.slice(0,s.lastIndexOf('.')+1)+it.n;
                    		 ow.setItemInfo(c);
                    	 }
                        //update the token with new selection
                    	 else
                            ow.setItemInfo(it);
                        //position caret to the end
                        this._delaySetCaretPos(ow.domNode, false);
                     }
                    }
                },
                
                dropZone:true,
                allowDrop: function allowDrop(ctxt){
     	                return this.dropZone;
                        },
          
                ondrop:function(e){
                        var ns=e.src.data.ns
                           tks=[];
                       if(!ns) return;
                       for(var i=0,len=ns.length; i<len; i++){
                    	   tks.push({isNew:true,v: ns[i], oi:e.src.data, did:this.itemCount++});
                    	   if(i<len-1)
                     	   tks.push({isNew:true,v: ',',isDelimiter:true, did:this.itemCount++});
                       }
                       this.insertTokens(tks);
                        },
                 postBuildRendering: function(){
                        	if(this._super)
                        		this._super();
                        	  this.itemsContainerNode.style.height='100%';
                        }
          
            }
            );
    


})();            
