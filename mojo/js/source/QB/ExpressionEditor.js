                        	   
  (function () {

    mstrmojo.requiresCls(
            "mstrmojo.Editor",
            "mstrmojo.List",
            "mstrmojo.SaveAsEditor",
            "mstrmojo.ME.MetricEditBox",
            "mstrmojo.ME.FunctionSelector",
            "mstrmojo.QB.FunctionWizard",
            "mstrmojo.MenuButton"
           );
    mstrmojo.requiresDescs(5891,221,4449,2919,9105,9106,9107,9108,9109,9110,2827); 
    
   var _S = mstrmojo.string,
       _D = mstrmojo.dom,
       _C = mstrmojo.css,
       _H = mstrmojo.hash,
       _R = mstrmojo.range,
       qdl=mstrmojo.all.QBuilderModel;
       
       _VSTATUS = {VALID: 0, UNKNOWN: 1, VALIDATING: 2, ERROR: 3},
       _VSTATUSCSS = {0: 'valid', 1: 'unknown', 2: 'validating', 3: 'error'},
       _VSTATUSDESC = {
       0: mstrmojo.desc(9105,"Valid Expression Formula."),
       1: mstrmojo.desc(9106,"Require Validation?"),
       2: mstrmojo.desc(9107,"Validation in Progress..."),
       3: mstrmojo.desc(9108,"Validation Failed with Syntax Error")
   };


function _mapErrorCode(code){
       if(!code){
           return _VSTATUS.VALID;
       }
       return {
                   '-2147214845': _VSTATUS.ERROR
                   
              }[code] || _VSTATUS.ERROR;
   }

/*  Repaint updated data for one filter expression
 *  @param (wce): filter expression widget
 *  @param (expr_t): expression tokens
 *  @param (expr): expression string
 */ 
function _paint(wce,expr,expr_t)
   {
 	 var cond=new Object();
         cond.et='*';
          cond.n=expr;
          cond.expr=expr_t;
         
          _H.copy( cond,_H.clear(wce.data));
        wce.paint();
   
   }

function _getTokensAsString(its){
    var sa = [],
        i,j;
    for(i=0,len = its.length;i<len;i++){
          sa[i] = its[i].v;
    }
    return sa.join(" ").replace(/<\s/g,"<").replace(/>\s/g,">");
}

/* validate and save expression
 *  @param (w): expression editor
 *  @param (isSaved): need to save expression
 *  @param (cIndex): Index for selected column
 */ 
function _validateExpression(w, isSaved, callbacks, cIndex){
	var   tksXML ='', 
          qbrex=1,
          expr='',
          vo=null;
      if(w.oi.type!==0&&w.oi.type!==3){
     	 expr=_getTokensAsString(w.exprEditBox.inputBox.items);
  	     qbrex=2;
      }
     else{
  	    tksXML=_getTokenStreamXML(w.exprEditBox.inputBox.items);
      }
     if(!isSaved) vo=1;
  	
   var success = function(res){
        if(res && res.mi&& res.mi.tknstrm.mi){
        	var stp=res.mi.exp.sqltp;
         if(stp!=null) w.sqltp=stp;
      	  var tks=res.mi.tknstrm.mi;
            _preprocessTokenStram(tks);
            w.exprEditBox.handleValidation(res.mi,isSaved);
            if (!res.mi.reject_error_code && callbacks && callbacks.success) {
			         callbacks.success();
		        }  
            else{
            	 if ( callbacks && callbacks.failure)
            	callbacks.failure();
            }
        }
      }, 
      failure = function(res){  
    	  if ( callbacks && callbacks.failure)
    	        callbacks.failure();
      }; 
     mstrmojo.all.QBuilderModel.validateExpr(
        {
            expr: expr,
            tKnStrm: tksXML,
            isNew:true,
            qbrex:qbrex,
            vo:vo,
            cIndex: cIndex
        }, 
        {
            success: success, 
            failure: failure
        });
}
   

 function _getTokenStreamXML(tks){
         
        var tks = _postprocessTokenStram(tks);
        
        //generate xml for token stream and formatting infos (if includeFormats is true)
        var xml = '',
            props = {
                v: true,
                tp: true,
                lv: true,
                n: true,
                did: true,
                t: true,
                st: true,
                cn:true,
                mi:true,
                omit:true,
                extra:true,
                tknctx:true,
                sqlti:true,
                tindex:true,
                cli:true,
                sta:true,
                tindex: true,
                ix:true
                
            },
            config = {
                getArrItemName: function(n, v, i){
                    return 'tkn';
                },
                isSerializable: function(nodeName, jsons, index){
                    return (props[nodeName]) ? true: false;
                }
            };
                
        xml = qdl.json2xml('mi', tks, config);
       
        return xml;
    }
    
    /**
     * Remove the starting token and ending token
     */
    function _preprocessTokenStram(tks){
        var its = tks.tkn,
            len = its.length,
            last = its[its.length-1];
        if(last && last.tp === -1){//ending token
            its.pop();
        }
        
        if(its[0] && (its[0].tp === 64 ||(its[0].tp===36&&its[0].v==='$'))){//starting token
            its.splice(0,1);
        }
    }
    
    function _postprocessTokenStram(tks){
        var its = tks,
            len = its.length,
            last = its[its.length-1],
            i,it,newItems = [],newV='';

        //starting token
        if(its[0] && its[0].tp !== 64){
            newItems.push({'v':'','tp':64,'lv':3,'sta':1});
        }
        
        for(i=0,len=its.length;i<len;i++){
            it = its[i];
            if( !it.oi){
                newV += it.v;
              } else {
                if(!_S.isEmpty(newV)){
                	 newItems.push({
                        v:newV, 
                        tp: 2, //DssTokenTypeUnknown = 2
                        lv: 1 //DssTokenLevelClient = 1
                    });
                    newV = '';
                }
        
         	  {
            	 it.lv=1;
            	 it.tp=2;
                 it.sta=1;
             	
          	}
           	    
                newItems.push(it);
            }
        }
        
        //last one set of tokens
        if(!_S.isEmpty(newV)){
            newItems.push({
                v:newV, 
                tp: 2, //DssTokenTypeUnknown = 2
                lv: 1 //DssTokenLevelClient = 1
            });
            newV = '';
        }
        
        //ending token
        if(last && last.tp !== -1){
            newItems.push({'v':'','tp':-1,'lv':2,'sta':1});
        }
        
        return {omit: newItems, cn:newItems.length};
    }
    
    mstrmojo.QB.ExpressionEditor = mstrmojo.declare(
            // superclass
            mstrmojo.Editor,
            // mixins
            null,
            // instance members
            {
                scriptClass: "mstrmojo.QB.ExpressionEditor",

                cssClass: "mstrmojo-MetricEditor",
              
                zIndex:50,
                
                title: mstrmojo.desc(4449,"Expression"),
                
               functionSelector: {
                    scriptClass: "mstrmojo.ME.FunctionSelector"
                },
                
                wizard: {
                    scriptClass: "mstrmojo.QB.FunctionWizard"
                    
                    },
                
                onOpen: function onOpen(){
                     var me = this,
                        oi = this.oi,
                        meb = this.exprEditBox,
                        tib = meb.inputBox,
                        i=0;
                        qdl=mstrmojo.all.QBuilderModel;
                        this.items=[];
                        tib.customFunctionMode=false;
                        oi.isSave=false;
                    	for (var tbl in qdl.tables)
                    	{    
                    		var tblItem=qdl.tables[tbl];
                          for(var col in tblItem.rows)
                          {
                               var colItem=tblItem.rows[col];
                               var colSug=colItem.oriexpr;
                  		       this.items[i]={n:colSug, cmid:colItem.srcData.id, colWID:colItem,  rIndex:colItem.rIndex+1,  t:26, display:'<span class="mstrmojo-ArchitectListIconBlock t26 "></span><span>'+colSug+'</span>'};
                 		        i++;
                         }
                       }
                       var success = function(res){
                            if(res){
                            	if(me.items){ 
                            		var cds = {items:me.items.concat(res), isComplete: true};
                            	}
                             	else{
                             		var cds = {items:res, isComplete:true};	
                             	}
                                tib.set('candidates', cds);
                                me.set('candidates', cds);
                             }
                         },
                        failure = function(res){
                            mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                        };             
                     qdl.getSuggestFunctions({success: success, failure: failure});  
                    //initialize the token input, metric name, metric desc
                    meb.set('iStatus', '');
                    meb.set('vStatus', 0);
                    if(oi.type===0){
                    this.set('title', "Expression: " + oi.n);
                     }
                    else if (oi.type===3){
                    	 this.set('title', mstrmojo.desc(4449,"Expression")+':'+ oi.n);
                     }
                    else if (oi.type===1){
                    	this.set('title', mstrmojo.desc(9109,"Filter Expression")+':'+ oi.n);
                    }
                    else{
                    	this.set('title', oi.n);
                     }
                    if(oi && oi.tks){
                         _preprocessTokenStram(oi.tks);
                        tib.set('items', oi.tks.tkn);
                        oi.oriexp=_H.clone(oi.tks.tkn);
                        //this.name.set('text', oi.n);
                        //this.desc.set('text', oi.desc);
                      }
                },
                
                onClose: function onClose(){
                     var inputbox=this.exprEditBox.inputBox,
                        oi=this.oi,
                        w=mstrmojo.all[oi.did],
                        qdl=mstrmojo.all.QBuilderModel,
                        wce=oi.w;
                        inputbox.set('items', []);
                        inputbox.itemcount=0;
                        //Reset widget expression to original value for expression editor triggered from DBtable
                        if(oi.w&&oi.w.expr&&oi.type!==3) oi.w.expr=oi.oriexp;
                        if(!oi.isSave){
                        	//Reset widget expression to original value for expression editor triggered from filter editor
                        	if(oi.did==='mod'){
                     	         _H.copy(oi.oriexp,_H.clear(wce.data.expr));
                       	        }
                        	//Reset widget expression to original value for expression editor triggered from datapreview
                        	if(oi.type===3){
                        		oi.w.expr=oi.oriexp;
                      	        }
                            if(oi.type===0){
                                    var cb={
	        	    			          success: function()
	        	    			              { 
 	        	    		                     },
	        	    	        failure: function(){}
	        	    			};
	        	           qdl.removeSelectedColumn(oi.cIndex,cb, true);
                         }
                      }
                     if(oi.type===2&&(!oi.w.data.n)){
                                 oi.w.del();
                     }
                     },
                   
               children: [
                            {
                               scriptClass: "mstrmojo.HBox",  
                               cssClass: "mstrmojo-Editor-toolBox",
                               children: [
                                          {
                                              scriptClass: "mstrmojo.Label",
                                              cssText: "font-size: 10pt",
                                              text: mstrmojo.desc(4449,"Expression")+':'
                                          }, {
                                               scriptClass: "mstrmojo.ToolBar",
                                               cssClass: 'mstrmojo-oivmSprite grouped',
                                               children:[
                                                         {
                                                             scriptClass: "mstrmojo.MenuButton",
                                                             iconClass: "tbInsert",
                                                             title: mstrmojo.desc(2919,"Insert"),
                                                             zIndex:60,
                                                             itemIdField: 'did',
                                                             itemField: 'n',
                                                             itemChildrenField: 'fns',
                                                             isSeparatorItem: function isSeparatorItem(item){
                                                                 return item[this.itemIdField] === -1;
                                                             },
                                                             executeCommand: function(item){
                                                                 var me = this.parent.parent.parent,
                                                                     meb = me.exprEditBox.inputBox;
                                                                 if(item.did === -999){//open search dialog
                                                                     me.openPopup('functionSelector',
                                                                         {
                                                                             functions: mstrmojo.ME.MetricDataService.getFunctionCatList(),                                                          
                                                                             zIndex:me.zIndex + 10,
                                                                             openWizard: function(item){
                                                                                 me.openPopup('wizard',
                                                                                 {
                                                                                     fctOi: item,
                                                                                     zIndex:me.zIndex + 10,
                                                                                     insertOnFinish: function(tks){
                                                                                         meb.insertTokens(tks);
                                                                                     }
                                                                                 });   
                                                                             }
                                                                         }    
                                                                     );
                                                                 } 
                                                                 else {//open function editor
                                                                     me.openPopup('wizard',
                                                                         {
                                                                             fctOi: item,
                                                                             zIndex:me.zIndex + 10,
                                                                             insertOnFinish: function(tks){
                                                                                 meb.insertTokens(tks);
                                                                             }
                                                                         }    
                                                                     );
                                                                 }
                                                             },
                                                             postCreate: function(){
                                                                 this.cm = [
                                                                            {n: "Functions", did: -3,
                                                                                fns: mstrmojo.ME.MetricDataService.getFunctionCatList()},
                                                                            {n:'Search Function...', did: -999}];
                                                                 
                                                             }
                                                         }, {
                                                        scriptClass: "mstrmojo.Button",
                                                        title:  mstrmojo.desc(9110,"Syntax Validation"),
                                                        iconClass: "tbValidate",
                                                        
                                                        onclick: function(evt){
                                                          var me = this.parent.parent.parent;
                                                             _validateExpression(me,false,null,1);
                                                              
                                                       }},
                                                       {
                                                           scriptClass: "mstrmojo.Button",
                                                           title: mstrmojo.desc(2827,"Clear"),
                                                           iconClass: "tbClear",
                                                           
                                                           onclick: function(evt){
                                                               var me = this.parent.parent.parent,
                                                                   meb = me.exprEditBox.inputBox,
                                                                   empty = [];
                                                                   me.oi.tks.tkn = empty;
                                                                   meb.clearTokens(empty);
                                                           }
                                                       }                                                       
                                               ]
                                           }]
                           },
                           
                            {
                               scriptClass: "mstrmojo.ME.MetricEditBox",
                               alias: 'exprEditBox',
                               children: [
                                          {
                                              scriptClass: 'mstrmojo.ME.TokenInputBox',
                                              alias: 'inputBox',
                                              slot: 'editNode',
                                              cssText:"height:100px;",
                              	              browseItemVisible:false,
                              	              renderBlockSize:1000,
                              	        	  //suggestionListClass:'mstrmojo.QB.SuggestionList',
                              	        	  item2textCss:function item2textCss(data){
                                                        return {
                                                            11: ' mstrmojo-ArchitectListIconSuggest t11 ',
                                                            26: ' mstrmojo-ArchitectListIconSuggest t26 '
                                                        }[data.t] || '';
                                                    },
                                              itemFunction: function itemFunction(item, idx, w){
                                                        return new mstrmojo.ME.MetricToken({
                                                            data: item,
                                                            brackets:qdl.brackets,
                                                            isDelimiter: function isDelimiter(){
                                                                return this.data.isDelimiter || (this.length() === 1 && mstrmojo.QB.FFsqlToken.isDelimiter(this.data.v));
                                                            }
                                                        });
                                                    },
                                              isDelimiter: mstrmojo.QB.FFsqlToken.isDelimiter
                                          }
                                      ],
                               markupMethods: {
                                   onvStatusChange: function(){
                                       var s = this.vStatus,
                                           vn = this.vStatusNode;
                                       vn.className = "mstrmojo-MEBox-vStatus " + _VSTATUSCSS[s];
                                       vn.innerHTML = _VSTATUSDESC[s];
                                   },
                                   oniStatusChange: function(){
                                       this.iStatusNode.innerHTML = this.iStatus;
                                   }
                               },
                               
                               handleValidation: function handleValidation(r,isSaved){
                               if(!r){
                                   this.set('vStatus', _VSTATUS.ERROR);
                                   return;
                               }
                               //update the status and token input box
                               r.vs = _mapErrorCode(r.reject_error_code);
                               this.set('vStatus', r.vs);
                               this.set('iStatus', r.reject_error_description || '');
                               //transform tkns array for UI
                               var tkns=r.tknstrm.mi.tkn;
                               var n_tkns=[];
                               for(var k=0,len=tkns.length; k<len; k++){
                            	   n_tkns[k]={};
                            	   var tk=tkns[k];
                            	   if(tk.tknctx)
                            	   {   var s=tk.v;
                            		   var lidx=s.lastIndexOf('.');
                            		   if(lidx<1) {
                            			   var tbn=tk.extra.sqlti.als;
                            			   tk.v=qdl.brackets(tbn+'.'+ s);
                            			   n_tkns[k].oi={tn:tbn,rn:s, tp:26};
                            		   }
                            		   else {
                            			   tk.v=qdl.brackets(s);
                            			   n_tkns[k].oi={tn:s.slice(0,lidx),rn:s.slice(lidx+1), tp:26};
                            		   }
                            	   }
                            	    if(tk.orf){
                             		  n_tkns[k].oi=tk.orf;
                             		  tk.v=' '+tk.v+' ';
                                    }
                            	    n_tkns[k].v=(typeof tk.v)==='string'?tk.v:tk.v.toString();
                            	    n_tkns[k].sta=tk.sta;
                                }
                               this.inputBox.set('items', n_tkns);
                               if(!isSaved)
                                    this.inputBox.focus();
                              }
                           },
                                                   
                           {
                               scriptClass: "mstrmojo.HBox",
                               cssText: "float: right; border-collapse: separate;margin:10px 0px;",                    
                               children: [
                                   {
                                       scriptClass: "mstrmojo.HTMLButton",
                                       cssClass: "mstrmojo-Editor-button",
                                       text: mstrmojo.desc(5891,"Save"),
                                       onclick: function() {
                                       var me = this.parent.parent,
                                           oi = me.oi,
                                           t=oi.type,
                                           rw=mstrmojo.all[oi.did],
                                           wce=oi.w,
                                           ib=me.exprEditBox.inputBox,
                                           expr_s=_getTokensAsString(ib.items),
                                           conds=qdl.conditions.expr;
                                           oi.isSave=true;
                                           if(t===0||t===3){ 
                                        	  //Column expression: 0:created 3:Edited;
                                    	    var cb0={
                                                  success:function(){
                                    	    	       var items=ib.items,
                                    	    	           scl=qdl.selectedClns[cIndex-1];
                                    	    	           scl.expr=ib.items;
                                    	    	       var ws=scl.wid,w,oi;
                                     	    	       if (t===3){
                                     	              	   for (var k=0, len=ws.length; k<len; k++){
                                    	              	    	w=mstrmojo.all[ws[k]];
                                    	              	    	if (w) {
	                                    	              	        w.count--;
	                                    	              	        w.updateState(0);
                                    	              	    	}
                                    	              	   }
                                     	    	       }
                                     	    	       scl.wid=[];  //we have to always reset the wid 
                                     	    	       ws=scl.wid;
                                      	    	       for (var k=0, len=items.length; k<len; k++){
                                    	    	           oi=items[k].oi;
                                     	    	           if (oi&&oi.tp===26){
                                    	    	        	   w=qdl.getRowWidget(oi.tn,oi.rn); 
                                    	    	        	   if (w) {
	                                    	    	        	   w.count++;
	                                    	    	        	   w.updateState(1);
	                                    	    	        	   ws.push(w.id);
                                    	    	        	   }
                                     	    	           }
                                     	    	       }
                                     	    	       // reset the expr to original value
                                     	    	        if(rw){
                                        	    	              qdl.addExpression(cIndex);
                                      	    	              }
                                     	    	        else 
                                     	    	            qdl.updateExpression(cIndex);
                                              	        qdl.updateSQL();
                                              	        me.close();
                                                  },
                                                  failure:function(){
                                                	  oi.isSave=false;
                                                  }
                                    	         };
                                             cIndex=oi.cIndex;
                                            _validateExpression(me,true,cb0,cIndex);
                                           }
                                         
                                          else if (t===1){//column filter created
                                        	  var cb1={
                                                      success:function(){
                                        		        var items=ib.items,
                                        		            ws=[];
                              	    	                for(var k=0, len=items.length; k<len; k++){
                           	    	                  	  var oi=items[k].oi;
                            	    	        	      if(oi&&oi.tp===26){
                           	    	        		          var w=qdl.getRowWidget(oi.tn,oi.rn);
                           	    	        		        if(w.state===0||w.state===1){
                           	    	        		        	w.fcount=1;
                                                                w.state=w.state+2;
                                                                w.images[1]=w.img[w.state];
                                                    	        w.render();
                                         	    	        }
                           	    	        		        else w.fcount++;
                           	    	        		        ws.push(w.id);
                            	    	        	      }
                              	    	                }
                              	    	               if(me.sqltp===0)
                                                	      qdl.raiseEvent({name:"condChange", sqltp:0, tp:1,wid:ws, expr:items});
                                                	    else
                                                	       qdl.raiseEvent({name:"aggcondChange", sqltp:1,tp:2, wid:ws, expr:items});
                                         	             me.close();
                                                        },
                                                      failure:function(){
                                                        	oi.isSave=false;
                                                        }
                                        	         };
                                        	       _validateExpression(me,false,cb1);
                                              }
                                          else
                                              { //condition filter created or updated
                                        	         
                                                  	 var cb2={
                                                           success:function(){
                                                     		    if(!qdl.conditions.expr&&me.sqltp===0) qdl.conditions.expr=new Object();
                                                                if(!qdl.conditions.aggexpr&&me.sqltp===1) qdl.conditions.aggexpr=new Object();
                                                                var  items=ib.items, ws=wce.data.wid||[],
                                                    		         conds=me.sqltp===0?qdl.conditions.expr:qdl.conditions.aggexpr;
                                                      		    if(ws.length>0){
                                               	              	
                                               	              	    ws=[];
                                              	    	        }
                                                     		    for(var k=0, len=items.length; k<len; k++){
                                     	    	                  	  var oi=items[k].oi;
                                      	    	        	       if(oi&&oi.tp===26){
                                     	    	        		       var w=qdl.getRowWidget(oi.tn,oi.rn);
                                     	    	        		        ws.push(w.id);
                                      	    	        	      }
                                        	    	            }
                                                     
                                                       if(wce.data.sqltp===me.sqltp){
                                                    	      if(!conds.nds){
                                                		          conds.n=expr_s;
                                                		          conds.expr=items;
                                                                   conds.et='*';
                                                                  }
                                                     		       _paint(wce,expr_s,items);
                                                    		       wce.data.wid=ws;
                                                    		       wce.data.sqltp=me.sqltp;
                                                    		      
                                                              }
                                                          else{
                                                        	    wce.del();
                                                        	    if(me.sqltp===0)
                                                        	      qdl.raiseEvent({name:"condChange", sqltp:0, wid:ws, expr:items});
                                                        	    else
                                                        	       qdl.raiseEvent({name:"aggcondChange", sqltp:1, wid:ws, expr:items});
                                                           }
                                                            me.close();
                                                  	     },
                                                             failure:function(){
                                                  	    	oi.isSave=false;
                                                  	     }
                                               	         };
                                                	 _validateExpression(me,false,cb2);
                                                  }
                                        }
                                    },
                                  
                                   {
                                       scriptClass: "mstrmojo.HTMLButton",
                                       cssClass: "mstrmojo-Editor-button",
                                       text: mstrmojo.desc(221,"Cancel"),
                                       onclick: function(){
                                           var me = this.parent.parent;
                                            me.close();
                                       }
                                   }
                               ]
                           }
                           ]
             });

})();            
