                        	   
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
       mdl=mstrmojo.all.ArchModel;
       
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


function _getTokensAsString(its){
    var sa = [],
        i,j;
    for(i=0,len = its.length;i<len;i++){
          sa[i] = its[i].v;
    }
    return sa.join(" ").replace(/<\s/g,"<").replace(/>\s/g,">");
}


var DEL_LIST = ['(',')', '{', '}', '-', '+', '*', '/', '<', '>','=', '|', '~',',' , ' ','\t', '\n',';'],
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
  };


function _brackets(s){
	return '['+s+']';
};

function _preprocessTokenStram(tks){
    var its = tks.tkn,
        len = its.length,
        last = its[its.length-1];
    if(last && last.tp === -1){//ending token
        its.pop();
    }
    
    if(its[0] && (its[0].tp === 64 ||(its[0].tp===33&&its[0].v==='!'))){//starting token
        its.splice(0,1);
    }
};

/* validate and save expression
 *  @param (w): expression editor
 *  @param (isSaved): need to save expression
 *  @param (cIndex): Index for selected column
 */ 
function _validateExpression(w, isSaved, callbacks){
	 
        var  vo=null,
     	     expr=_getTokensAsString(w.exprEditBox.inputBox.items);
     if(!isSaved) vo=1;
    var success = function(res){
        if(res && res.mi.oi.tknstrm.mi){
      	  var tks=res.mi.oi.tknstrm.mi;
            _preprocessTokenStram(tks);
            w.exprEditBox.handleValidation(res.mi.oi,isSaved);
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
     mstrmojo.all.ArchModel.validateExpr(
        {
            expr: expr,
           // tKnStrm: tksXML,
           // isNew:true,
           // qbrex:qbrex,
            vo:vo
           // cIndex: cIndex
        }, 
        {
            success: success, 
            failure: failure
        });
}
   

 
    
    mstrmojo.Architect.ExpressionEditor = mstrmojo.declare(
            // superclass
            mstrmojo.Editor,
            // mixins
            null,
            // instance members
            {
                scriptClass: "mstrmojo.Architect.ExpressionEditor",

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
                        mdl=mstrmojo.all.ArchModel;
                        this.items=[];
                        tib.customFunctionMode=false;
                        oi.isSave=false;
                        var tbl=mdl.getTable(mdl.SelTableID),
                        clns=tbl.tag.clis.cli;
                        for(var i=0,len=clns.length;i<len;i++)
                          {
                               var col=clns[i];
                  		       this.items[i]={n:col.cln, cmid:col.cmid, t:26, dt:col.dt,display:'<span class="mstrmojo-ArchitectListIconBlock t26 "></span><span>'+col.cln+'</span>'};
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
                     mdl.getSuggestFunctions({success: success, failure: failure});  
                    //initialize the token input, metric name, metric desc
                    meb.set('iStatus', '');
                    meb.set('vStatus', 0);
                    this.set('title', oi.n);
                    if(oi && oi.tks){
                         _preprocessTokenStram(oi.tks);
                        tib.set('items', oi.tks.tkn);
                       // oi.oriexp=_H.clone(oi.tks.tkn);
                      }
                },
                
                onClose: function onClose(){
                    
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
                                          }, 
                                          {
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
                                                                             functions: mstrmojo.all.ArchModel.getFunctionCatList(),                                                          
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
                                                                                fns: mstrmojo.all.ArchModel.getFunctionCatList()},
                                                                            {n:'Search Function...', did: -999}];
                                                                 
                                                             }
                                                         }, {
                                                        scriptClass: "mstrmojo.Button",
                                                        title:  mstrmojo.desc(9110,"Syntax Validation"),
                                                        iconClass: "tbValidate",
                                                        onclick: function(evt){
                                                          var me = this.parent.parent.parent;
                                                             _validateExpression(me,false,null);
                                                          }
                                                         },
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
                                                            brackets:_brackets,
                                                            isDelimiter: function isDelimiter(){
                                                                return this.data.isDelimiter || (this.length() === 1 &&_isDelimiter(this.data.v));
                                                            }
                                                        });
                                                    },
                                              isDelimiter:_isDelimiter
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
                                   var tkns=r.tknstrm.mi.tkn, oi=r.tknstrm.mi['in'].oi,len2=oi.length,n_tkns=[],cmid;
                                   if(len2){
                                	   for(var k=0;k<len2; k++){
                                		   if(oi[len2].tp===26) {
                                			   cmid=oi[len2].did;
                                			   break;
                                		   }
                                	   }
                                   }
                                   else{
                                	   if(oi.tp===26) cmid=oi.did;
                                   }
                                   if(cmid)
                                       this.oi.cmid=cmid;
                                   else this.oi.cmid='68AC1409417D6232E6DADFB198A8A245';//temp hard code for constant!
                                   for(var k=0,len=tkns.length; k<len; k++){
                                	   n_tkns[k]={};
                                	   var tk=tkns[k],s;
                                	   if(tk.orf)
                                	   {   if(tk.orf.c)
                                			    s=_brackets(tk.v);
                                		   else 
                                			    s=' '+tk.v+' ';
                                	       n_tkns[k].v=s;
                                	       n_tkns[k].oi=tk.orf;
                                	   }
                                	   else{
                                	       n_tkns[k].v=tk.v?tk.v.toString():'';
                                      }
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
                                           w=mstrmojo.all.aflist,
                                           ib=me.exprEditBox.inputBox,
                                           expr_s=_getTokensAsString(ib.items);
                                           oi.isSave=true,n;
                                    	    var cb={
                                                  success:function(){
                                                	  if(typeof oi.idx==='number'){
                                                		    var cb1={
                                                			  success:function(res){
                                                				  mstrmojo.all.aflist.ctxtBuilder.itemWidgets[oi.idx].children[0].set('text',expr_s);//temp can use raising an evnt later
                                                				  me.close();
                                                			  },
                                                			  failure:function(){ 
                                                				  mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                                			  }  
                                                			  };
                                                		  if(oi.TP===12)
                                                		      mdl.updateAttributeInfo(oi.FRMNo,oi.FRM, oi.did, expr_s,oi.cmid, mdl.SelTableID,cb1);
                                                		  else
                                                		      mdl.updateFactInfo(oi.did, expr_s, oi.cmid, mdl.SelTableID,cb1);
                                                	  }
                                                	  else{
                                                	     var cb1={
                                                			  success:function(res){
                                                			   var cb2={
                                                			            success:function(res){
                                                			               mdl.raiseEvent({name:'SelTableIDChange'});//re-populate editor. temp. Can raise an event which just add the latest objects
                                                                           me.close();
                                                			           },
                                                			  failure:function(){ 
                                                				      mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                                			      }  
                                                			     };
                                                				  if(oi.TP===13)
                                                				     mdl.addFactInfo(res.did, expr_s, oi.cmid, mdl.SelTableID,cb2);
                                                				  else
                                                				     mdl.addAttributeInfo(0,res.did, expr_s, oi.cmid, mdl.SelTableID,cb2);
                                                			  },
                                                			  failure:function(){ }
                                                            
                                                	      };
                                                	     if(oi.TP===12){
                                                	    	 n='New Attribute('+mdl.attrIdx+')';
                                                	    	 mdl.attrIdx++;
                                                	     }
                                                	     if(oi.TP===13){
                                                	    	 n='New Fact('+mdl.fctIdx+')';
                                                	    	 mdl.fctIdx++;
                                                	     }
                                                	     mdl.createObject(oi.TP, n, oi.cmid, cb1);
                                                	 }
                                                  },
                                                  failure:function(){
                                                	  oi.isSave=false;
                                                  }
                                    	         };
                                            _validateExpression(me,true,cb);
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

                      	   
