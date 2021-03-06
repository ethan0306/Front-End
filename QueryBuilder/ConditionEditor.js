(function(){

mstrmojo.requiresCls(
            "mstrmojo.WidgetList",
	        "mstrmojo.QB.FilterTree",
 	         "mstrmojo.CustomGroupEl",
	         "mstrmojo._HasPopup",
	         "mstrmojo._IsMovable",
	         "mstrmojo.ConditionNode"
         );

mstrmojo.requiresDescs(1994,2550,3415,3416); 

var _E = mstrmojo.expr,
    _ET = _E.ET,
    _BF = _E.BRANCH_FNS,
    _D = mstrmojo.dom;
  
/* Get string format of the whole filter(where or having) from the tree node structure
 * {@conds} tree node data structure for where or having filter
 */
function _getCondsExpr(conds) { 
	if(!conds) return '';
    var ops={19:' '+_BF[19]+' ',20:' '+_BF[20]+' '},
        s='';
    if(!conds.nds) return conds.n||'';
    else{
    	 s='('+_getCondsExpr(conds.nds[0])+')';
    	 for(var i=1, len=conds.nds.length;i<len; i++)
    	{   if(conds.nds[i].et===2) continue;
    		 var isNot=conds.nds[i].not,
    		   op=ops[conds.fn]+(isNot?'('+_BF[21]+'( ':'');
    	       r=isNot?'))':''
    	      if(!conds.nds[i].nds){
    	        s+=op+conds.nds[i].n+r;
    	      }
    	      else{
    	        s+=op+'('+_getCondsExpr(conds.nds[i])+')'+r;
    	      }
    	}
    	
    	 return s;
  }
 }
/* update where and/or having filters
 * {@t1 bool} need to update where filter
 * {@t2 bool} need to update having filter
 * {@e string}  where filter expression in string format
 * {@ae string}  having filter expression in string format
 */
function  _updatefilters(t1,t2,e,ae){
	var qdl=mstrmojo.all.QBuilderModel;
	 if(t1&&e!==''){
	   var cb1={ 
	              success: function(res){
	            	   if(res.mi.reject_error_code){
	            		   mstrmojo.alert(res.mi.reject_error_description);
	            	   }
	        	       if(!qdl.conditions.hasWhere) qdl.conditions.hasWhere=true;
 		               if(!t2) qdl.updateSQL();
	    	     },
	            failure: function(res){           
	                    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	          }
         };
	   qdl.validateExpr({expr:e,qbrex:2,cIndex: 1,tKnStrm:''},cb1);
    }
	 if(t2&&ae!==''){
		   var cb2={ 
		              success: function(res){
		            	  if(res.mi.reject_error_code){
		            		   mstrmojo.alert(res.mi.reject_error_description);
		            	    }
		        	     if(!qdl.conditions.hasHaving) qdl.conditions.hasHaving=true;
			                    qdl.updateSQL();
		    	    },
		             failure: function(res){           
		               mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
		          }
	         };
		   qdl.validateExpr({expr:ae,qbrex:4,cIndex:1,tKnStrm:''},cb2);
	 }
     if(!t1&&!t2){
			 qdl.updateSQL();
		 }
		   
	   
 }

var CEl={
	scriptClass:"mstrmojo.CustomGroupEl",	
    cssClass: "mstrmojo-charcoalbox",
    cssText:"position: relative; left: 19px; top:3px; width:340px; height:310px; overflow: auto; border:1px solid #CCC; background-color:white",
    alias:'CEl',
    markupString: '<div id="{@id}" class="mstrmojo-onhoverparent mstrmojo-CustomGroupEl {@cssClass}" style="{@cssText}">'
        + '<div class="mstrmojo-qb-cond-details" {@cssClass}">'
        + '<div class="mstrmojo-qb-expr-tools {@cssClass}">'
        + '</div>'
        + '<div class="mstrmojo-CustomGroupEl-expr {@cssClass}"></div>'
       + '<div class="mstrmojo-CustomGroupEl-expr {@cssClass}"></div>'
        + '<div class="mstrmojo-CustomGroupEl-expr {@cssClass}"><br></div>'
       + '<div class="mstrmojo-CustomGroupEl-expr {@cssClass}"></div>'
           
       + '</div>'
       + '</div>',

   markupMethods: {
            onstateChange: function(){ 
               var s = this.stateNode;
              // s.className = "mstrmojo-CustomGroupEl-state " + (this.state ? 'opened' : 'closed');
               this.detailsNode.style.display = this.state ? 'block' : 'none';
           }
        },
    markupSlots: {
           stateNode: function(){return this.domNode.firstChild.firstChild;},
           detailsNode: function(){return this.domNode.lastChild;},
           exprNode: function(){return this.domNode.lastChild.children[2];},
           expr2Node: function(){return this.domNode.lastChild.children[4];},
           exprToolsNode: function(){return this.domNode.lastChild.firstChild;}                
          
       },
    bindings: {
        // Initializes our items by reading them from our parent's data.
	     data: "mstrmojo.all.QBuilderModel.conditions"
       },
    parent: this.parent,
    
    state: true,
    
    update: function update(t){
           var qdl=mstrmojo.all.QBuilderModel,
               expr=qdl.conditions.expr,
               aggexpr=qdl.conditions.aggexpr,
     	       expr_s =_getCondsExpr(expr),
    	       aggexpr_s =_getCondsExpr(aggexpr);
         if(!t){
             if(expr_s===''&&qdl.conditions.hasWhere) {
            	 var cb1={
       	              success: function(res){
            		       qdl.conditions.hasWhere=false;
            		       if(aggexpr_s===''&&qdl.conditions.hasHaving) {
            	            	 var cb2={
            	       	              success: function(res){
            	            		       qdl.conditions.hasHaving=false;
            	            		       qdl.updateSQL();
            	          	    	    },
            	       	              failure: function(res){} 
            	            	 };
            	              	 qdl.removeCondition(false, cb2);
            	             }
            		       else if(aggexpr_s!=='')
            		    	   _updatefilters(false,true,null,aggexpr_s);
            		       else {qdl.updateSQL();}
          	    	    },
       	              failure: function(res){} 
            	 };
              	 qdl.removeCondition(true, cb1);
             }
             else if(aggexpr_s===''&&qdl.conditions.hasHaving) {
            	 var cb={
       	              success: function(res){
            		       qdl.conditions.hasHaving=false;
            		       if(expr_s!=='')
            		    	   _updatefilters(true,false,expr_s, null);
            		       else qdl.updateSQL();
          	    	    },
       	              failure: function(res){} 
            	 };
              	 qdl.removeCondition(false, cb);
             }
             else{
            	 _updatefilters(expr_s!=='',aggexpr_s!=='',expr_s,aggexpr_s);
             }
          }
          else {
            _updatefilters(t===1, t===2,expr_s,aggexpr_s);
          }
       },
    	        
    postCreate: function() {
        var c=[
      {
                scriptClass: "mstrmojo.QB.FilterTree",
                slot: "exprNode",
                alias: "filterExpr",// Hack: Needed to wire up the "Add condition" link in CustomGroupEl
                bindings: {
                            // Initializes our items by reading them from our parent's data.
            	    items: "var ex = this.parent.data.expr; return ex ? [ex] : []"
                }
            },
           {
                scriptClass: "mstrmojo.QB.FilterTree",
                slot: "expr2Node",
                alias: "aggfilterExpr",// Hack: Needed to wire up the "Add condition" link in CustomGroupEl
                bindings: {
                            // Initializes our items by reading them from our parent's data.
            	    items: "var ex = this.parent.data.aggexpr; return ex ? [ex] : []"
                }
            },
                       
               {
                        scriptClass: "mstrmojo.Button",
                        cssClass: "mstrmojo-CGE-addCondition",
                        text: mstrmojo.desc(1994,"Add Condition"),
                        slot: "exprToolsNode",
                        onclick: function(){
                            this.parent.filterExpr.newCondition(null, true);
                        }
                    
                    }
                ];
        this.addChildren(c);
       	mstrmojo.all.QBuilderModel.attachEventListener("condChange", this.children[0].id, "updateCond");
    	mstrmojo.all.QBuilderModel.attachEventListener("condLoad", this.children[0].id, "loadCond");
    	
    	mstrmojo.all.QBuilderModel.attachEventListener("aggcondChange", this.children[1].id, "updateCond");
    	mstrmojo.all.QBuilderModel.attachEventListener("aggcondLoad", this.children[1].id, "loadCond");
            }
    };

mstrmojo.QB.ConditionEditor=mstrmojo.declare(
		mstrmojo.Box,
		[ mstrmojo._HasPopup, mstrmojo._IsMovable],
{
     scriptClass:"mstrmojo.QB.ConditionEditor",
     cssClass:"mstrmojo-qb-CE",
     width:"0px", 
 	 height:"0px",
     children: [   
          {
                    scriptClass: "mstrmojo.Label",
                    cssClass:"mstrmojo-qb-cond-title",
                    text:mstrmojo.desc(2550,"Filters")
           },
           CEl,
           {
               scriptClass: "mstrmojo.Button",
               cssClass: "mstrmojo-qb-button",
               cssText: "position: absolute; top:360px; left:205px;", 
               text:mstrmojo.desc(3415,"OK"),
               onclick: function() {
           	     var e= this.parent,
           	         cel=e.CEl;;
           	         cel.update();
           	         delete e.prev_expr;
        	         delete e.prev_aggexpr;
           	         mstrmojo.all.QBuilderModel.updateFilterLabel(cel);
                       e.hide();
                       mstrmojo.css.toggleClass(mstrmojo.all.QBuilderPage.children[0].children[3].domNode, "on", false);
                }
           },
           {
               scriptClass: "mstrmojo.Button",
               cssClass: "mstrmojo-qb-button",
               cssText: "position: absolute; top:360px; left:285px;", 
               text:mstrmojo.desc(3416,"Cancel"),
               onclick: function() {
        	       var e= this.parent,
	                   cel=e.CEl,
	                   fitems=cel.filterExpr.items[0],
         	           afitems=cel.aggfilterExpr.items[0],
        	           fstr=_getCondsExpr(fitems),
        	           afstr=_getCondsExpr(afitems),
        	           pre_fstr=e.prev_expr.et?_getCondsExpr(e.prev_expr):'',
        	           pre_afstr=e.prev_aggexpr.et?_getCondsExpr(e.prev_aggexpr):'';
        	           if(fstr===pre_fstr&&afstr===pre_afstr) {
        	        	   e.hide();
                           mstrmojo.css.toggleClass(mstrmojo.all.QBuilderPage.children[0].children[3].domNode, "on", false);
                           return;
        	           }
        	           var $NIB = mstrmojo.Button.newInteractiveButton;
        	           mstrmojo.confirm("All your changes on the filter will be lost. Do you want to exit? ", 
                   	      [
                   	           $NIB(mstrmojo.desc(3415,"OK"), function yes(){
                          	        var _H=mstrmojo.hash;
                          	     //Original expressions was moved, add them back.
                      	             // Add where condtions back
                      	            	if(!fitems&&cel.data.hasWhere){
                      	                	var o1=_H.clone(e.prev_expr);
                      	            	    cel.filterExpr.add([o1]);
                      	            	}
                      	            // Add having conditions back
                      	            	if(!afitems&&cel.data.hasHaving){
                      	            		var o2=_H.clone(e.prev_aggexpr);
                      	                	cel.aggfilterExpr.add([o2]);
                                        }
                      	          //Original expressions was modified, change them back.
                      	              if(fitems){ //where condtions
                            	             cel.filterExpr.items[0]=_H.clone(e.prev_expr);
                            	             cel.filterExpr.render();
                            	             cel.data.expr=cel.filterExpr.items[0];
                            	            if(!cel.data.hasWhere) { //if original expression is empty, delete it.
                            	            	cel.filterExpr.ctxtBuilder.itemWidgets[0].del();
                            	            }
                            	          }
                            	          if(afitems){//having condtions
                            	        	 cel.aggfilterExpr.items[0]=_H.clone(e.prev_aggexpr);
                            	             cel.aggfilterExpr.render();
                            	             cel.data.aggexpr=cel.aggfilterExpr.items[0];
                            	               if(!cel.data.hasHaving) {
                            	            	  cel.aggfilterExpr.ctxtBuilder.itemWidgets[0].del();
                            	               }
                            	         }
                                      e.hide();
                   	             },null, {   
                   	            	         onRender: function(){
  	                        	                 if (mdl && mdl.isCloud) {
  	                        	                     mstrmojo.css.addClass(this.domNode, 'cloud');
  	                        	                 }
  	                                         }}),
                   	             $NIB(mstrmojo.desc(3416,"Cancel"),  function no(){}, null, { 
	                   	            	 onRender: function(){
	      	                        	     if (mdl && mdl.isCloud) {
	      	                        	         mstrmojo.css.addClass(this.domNode, 'cloud cancel');
	      	                        	     }
	      	                             }
                   	                 })
                   	             ],'Lose Your Changes?');
                  }
           }
         ],
        getMovingHandle: function getMovingHandle(){
             return this.children[0].domNode;
        },
      
        andOrPopupRef: {
	        scriptClass: "mstrmojo.Editor",
	        cssClass: "mstrmojo-CGE-andOrPopup mstrmojo-ConditionWalk", 
	        cssText: "width: auto;",
	        contentNodeCssClass: "mstrmojo-balloon",
	        left: "250px",
	        top: "15px",
	        slot: "containerNode",
 	        autoClose:true,   
	        showTitle: false,
	        draggable: false,  
	        openEffect: null,
	        closeEffect: null, 
 	        onOpen: function(){
	          
	            var w = this.condition,
	                not = w && w.data && w.data.not,
	                p = w && w.parent,
	                pd = p && p.data,
	                fn = (pd && pd.fn) + (not ? 21 : 0);
	            this.list.opening = true;
	            this.list.set("selectedItem", isNaN(fn) ? null : {did: fn});
	            this.list.opening = false;
	        },
	        children: [
	            {
	                scriptClass: "mstrmojo.Dial",
	                cssClass:"mstrmojo-CGE-andOrDial",
	                alias: "list",
	                //cssText: "height:" + _HEIGHT + "px",
	                itemMarkup: '<div class="dial-item {@css}">{@n}</div>',
	                itemIdField: "did",
	                items: [
	                    {did: 19, n: _BF[19]},
	                    {did: 20, n: _BF[20]},
	                    //{did: 19+21, n: _BF[19] + " " + _BF[21]},
	                   // {did: 20+21, n: _BF[20] + " " + _BF[21]}
	                    {did: 19+21, n: _BF['19_21']},
	                    {did: 20+21, n: _BF['20_21']} 
	                ],
	                onchange: function(){
	                    // If we are initializing the popup, ignore event.
	                    if (this.opening) {
	                        return;
	                    }
	                    // Collect the selection and close this popup.
	                    var pop = this.parent,
	                        w = pop.condition,
	                        sel = this.selectedItem,
	                        did = sel && sel.did,
	                        not = did > 21 ? true : null,
	                        fn = did - (not ? 21 : 0);
	                    pop.close();
	                    
	                    // Update the filter expression.
	                    var bq = w && w.parent;
	                    if (bq && bq.data && bq.data.et === _E.ET.ANDOR) {
	                        // If the condition has a branch qual (AND/OR) parent, assume it can conduct
	                        // the edit+repaint for us. (Note: The edit may require indenting the condition.)
	                        bq.edit(w, fn, not);
	                    } else {
	                        // If the condition has no branch qual parent, just update its data directly,
	                        // and tell it to repaint.
	                        var d = w && w.data;
	                        if (d && (d.not !== not)) {
	                            d.not = not;
	                            w.paint();
	                        }
	                    }
	                }
	            }
	        ]
	    },
	    inlineTextRef: {
	        scriptClass: "mstrmojo.Popup",
	        locksHover: true,
 	        children: [{
	            scriptClass: "mstrmojo.TextBox",
	            alias: "txt",
	            onTab: function(evt){
	                if (this.onEnter) {
	                    this.onEnter();
	                }
	                var w = _D.shiftKey(evt.hWin, evt.e) ?
	                            this.prevTab : this.nextTab;
	                if (w && w.onclick) {
	                    w.onclick();
	                }
	            },
	            onblur: function(){
	                if (this.onEnter) {
	                    this.onEnter();
	                }
	            },
	            onEsc: function(){
	                if (this.onCancel) {
	                    this.onCancel();
	                }
	                this.parent.close({cancel: true});
	            }
	        }],
	        onOpen: function(){
	            var t = this.txt,
	                c = this.txtConfig;
	            if (c) {
	                for (var k in c){
	                    t.set(k, c[k]);
	                }
	            }
	            t.focus();
	        }, 
	        onClose: function(cfg) {
	            if (!cfg || (!cfg.cancel && !cfg.enter)){
	                this.txt.onEnter();
	            }
	        }
	    },
	    preBuildRendering: function(){
	    	var qdl=mstrmojo.all.QBuilderModel;
	    	qdl.conditions.did='Conditions';
			qdl.conditions.n='Filters';
			
	    }
	   
});

 })();