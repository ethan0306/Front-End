(function () {
           
    mstrmojo.requiresCls(
            "mstrmojo.HTMLButton",
            "mstrmojo.HBox",        
            "mstrmojo.Label",
            "mstrmojo.Editor"
           
            );
    
    mstrmojo.requiresDescs(1442,221,5282,9122,9123,9124); 
                               
                               
 var _lop={'In list':' IN ','Not in list':'[Not In]','Exactly':'=','Different from':'<>','Greater than':'>','Less than':'<',
         'Greater than equal':'>=','Less than equal':'<=', 'Like':' LIKE ', 'Not like':'[Not Like]', 'Contains':' Contains ',
         'Does not contain':'[Not Contains]', 'Begins with':'[Begins With]', 'Does not begin with':'[Not Begins With]',
         'Ends with':'[Ends with]','Does not end with':'[Not ends with]', 'Between':' between ','Not between':'[Not Between]',
         'Is null':'[Is Null]', 'Is not null':'[Not Null]'};

 function validate(dbe){
		if (trim(dbe.txtname.text) == ""){
			mstrmojo.alert(mstrmojo.desc(9122,"Name cannot be empty"));
			return false;
		}
		
		if (trim(dbe.txtlogin.text) == ""){
			mstrmojo.alert(mstrmojo.desc(9123,"Login can't be empty"));
			return false;
		}

		return true;
	};
	
  function _preprocessTokenStram(tks){
         var len = tks.length,
            last = tks[tks.length-1];
        if(last && last.tp === -1){//ending token
            tks.pop();
        }
        
        if(tks[0] && (tks[0].tp === 64 ||(tks[0].tp===36&&tks[0].v==='$'))){//starting token
            tks.splice(0,1);
        }
    };
	
function _getWids(tkns, ws, exps){
      var qdl=mstrmojo.all.QBuilderModel;
     _preprocessTokenStram(tkns);
     for(var k=0,len=tkns.length; k<len; k++){
    	var  tkn={}, tk=tkns[k];
   	    if(tk.tknctx)
   	      {   var s=tk.v,
   		          lidx=s.lastIndexOf('.');
   		      if(lidx<1) tkn.oi={rn:s, tp:26};
   		      else {
   			       tkn.oi={tn:s.slice(0,lidx),rn:s.slice(lidx+1), tp:26};
   		      }
   		   var w=qdl.getRowWidget(tkn.oi.tn,tkn.oi.rn);
   		   if(w.state===0||w.state===1){
         	          w.fcount=1;
                      w.state=w.state+2;
                      w.images[1]=w.img[w.state];
 	                  w.render();
           }
           else w.fcount++;
           ws.push(w.id);
   	     }
   	    if(tk.orf){
    		  tkn.oi=tkns[k].orf;
    		  tk.v=' '+tk.v+' ';
           }
   	    tkn.v=(typeof tk.v)==='string'?tk.v:tk.v.toString();
   	    tkn.sta=tk.sta;
   	    exps.push(tkn);
     }
};
	
 mstrmojo.QB.FilterValueEditor = mstrmojo.declare(
        // superclass
        mstrmojo.Editor,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.QB.FilterValueEditor",
            zIndex: 100,
            id: "fve1",
            title: mstrmojo.desc(9124,"Enter Value"),
   		    cssText: "width:200px;",
            DBrow:null,
   		    children: [
   		       { 
   		          scriptClass : 'mstrmojo.HBox',
   		          children: [
   	                      {//Name label
   	                         scriptClass:"mstrmojo.Label",
   	                         cssText: "width:100%; padding: 5px;",
   	                         alias: "filter"   	                         
   	                       },

   	                      {
   	                       scriptClass: "mstrmojo.TextBox",
   	                       alias: "txtname",
   	                       cssText:"width:100px;"
   	                      }
   	                       ]
   		      },
   		      
   		      {
   		    	    scriptClass : 'mstrmojo.Label',
   		    	    alias:'err',
   		    	    cssText: "width:100%; padding: 5px; font-color: red;",
   		    	    text:''
   		      },

   	           { // buttons
   		           scriptClass : 'mstrmojo.HBox',
   		           cssClass : 'mstrmojo-Editor-buttonBox',
   		           slot : 'buttonNode',
   		           children : [ 
     		              {//OK
   			               scriptClass : "mstrmojo.HTMLButton",
   			               cssClass : "mstrmojo-Editor-button",
   			               cssText:"float:right;",
   			               text : mstrmojo.desc(1442, "OK"),
   			               onclick : function(evt) {
   		            	        var me=this,
    				                e = this.parent.parent,
    				                f=e.children[0].filter.text,
   				                    lo= _lop[f],
   				                    w=e.DBRow,
   				                    ws=[],
   				                    exps=[],
    				                qdl=mstrmojo.all.QBuilderModel,
   		            	            strs=new Array('Like','Not like','Contains','Does not contain','Begins with','Does not begin with','Ends with','Does not end with');
   		            	            t=e.children[0].txtname.value;
   		            	        if(t=='') return;
   		            	        if(strs.indexOf(f)>-1) t='"'+t+'"';
   		            	        if(f==='In list'||f==='Not in list') t='('+t+')';
   		            	        var expr=qdl.brackets(w.oriexpr)+' '+lo+' '+t;
   		            	        var success=function(res){  
   		            	    	       if(res && res.mi){
   		            	    		      var err=res.mi.reject_error_description;
   		            	    		    if(err)
   		            	    		        e.err.set('text', err|| '');  
   		            	    		    else{
    		    				            var ret = true;
   		    				                if (e.onOK) { ret = e.onOK(); }
   		    				                if (ret) { e.err.set('text',''); e.close();}
   		    				                 _getWids(res.mi.tknstrm.mi.tkn,ws, exps);
    		    				             qdl.raiseEvent({name:"condChange",tp:1, wid:ws, expr:exps, sqltp:0});
    		            	                 }
   		            	    	        }
   		            	            },
    		            	        
    		            	        failure = function(res){           
    		            	                     mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
    		            	                 };
   			                    
   			                    qdl.validateExpr({expr: expr, qbrex:2, cIndex:1, vo:1},{success: success, failure: failure});
     		              }
   		               }, 
   		             {// cancel
   			           scriptClass : "mstrmojo.HTMLButton",
   			           cssClass : "mstrmojo-Editor-button",
   			           text : mstrmojo.desc(221, "Cancel"),
   			           onclick : function(evt) {
   				            var e = this.parent.parent;
   				            if (e.onCancel) { e.onCancel(); }
   				            e.close();
   			                }
   		            }
   	           ]}
   	       ],
   	      onClose: function() {
        	if(this.err.text!=='')
        	    this.err.set('text','');
        }
        
        });
 
   mstrmojo.QB.FilterValueEditor2 = mstrmojo.declare(
	        // superclass
	        mstrmojo.Editor,
	        // mixins
	        null,
	        // instance members
	        {
	            scriptClass: "mstrmojo.QB.FilterValueEditor2",
	            zIndex: 100,
	            id: "fve2",
	            title: mstrmojo.desc(9124,"Enter Value"),
	   		    cssText: "width:250px;",
	            DBrow:null,
	   		    children: [
	   		       { 
	   		          scriptClass : 'mstrmojo.HBox',
	   		          cssText:"width: 250px;",
	   		          children: [
	   	                      {
	   	                         scriptClass:"mstrmojo.Label",
	   	                         cssText: "width:40px;",
	   	                         alias: "filter"
	   	                      },

	   	                      {
	   	                       scriptClass: "mstrmojo.TextBox",
	   	                       alias: "txtname1",
	   	                       cssText:"width:40px;"
	   	                      },
	   	                      {
		   	                       scriptClass: "mstrmojo.Label",
		   	                       text: mstrmojo.desc(5282,"AND"),
		   	                       cssText:"width:30px;"
		   	                  },
	   	                      {
		   	                       scriptClass: "mstrmojo.TextBox",
		   	                       alias: "txtname2",
		   	                       cssText:"width:40px"
		   	                      }
	   	                       ]
	   		      },
	   		      {
	   		    	    scriptClass : 'mstrmojo.Label',
	   		    	    alias:'err',
	   		    	    cssText: "width:100%; padding: 5px; font-color: red;",
	   		    	    text:''
	   		      },

	   	           { // buttons
	   		           scriptClass : 'mstrmojo.HBox',
	   		           cssClass : 'mstrmojo-Editor-buttonBox',
	   		           slot : 'buttonNode',
	   		           children : [ 
 	   		                 {//OK
	   			               scriptClass : "mstrmojo.HTMLButton",
	   			               cssClass : "mstrmojo-Editor-button",
	   			               cssText:"float:right;",
	   			               text : mstrmojo.desc(1442, "OK"),
	   			               onclick : function(evt) {
	   		            	        var me=this,
	    				                e = this.parent.parent,
	    				                t1=e.children[0].txtname1.value,
	   				                    t2=e.children[0].txtname2.value;
	   		            	        if(t1==''||t2=='') return;
 	   				                var lo= _lop[e.children[0].filter.text],
 	   				                    w=e.DBRow,
 	   				                    ws=[],
 	   				                    exps=[],
 	   				                    qdl=mstrmojo.all.QBuilderModel,
	   				                    expr=qdl.brackets(w.oriexpr)+' '+lo+' '+t1+' AND '+t2,
 	   		            	            success=function(res){  
 	   				                       if(res && res.mi){
 		            	    		            var err=res.mi.reject_error_description;
	   		            	    		    if(err)
	   		            	    		        e.err.set('text',err|| '');  
	   		            	    		    else{
 	   		    				                var ret = true;
	   		    				                if (e.onOK) { ret = e.onOK(); }
	   		    				                if (ret) { e.err.set('text', ''); e.close();}
	   		    				                _getWids(res.mi.tknstrm.mi.tkn, ws, exps);
 	   		    				                qdl.raiseEvent({name:"condChange", tp:1, wid:ws, expr:exps,sqltp:0});
	    		            	                 }
	   		            	    	        }
	   		            	            },
	    		            	        
	    		            	        failure = function(res){           
	    		            	                     mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	    		            	                 };
	   			                   
	   			                    qdl.validateExpr({expr: expr, qbrex:2, cIndex:1,vo:1},{success: success, failure: failure});
 	   		                 }
	   		               }, 
  	   		            {// cancel
	   			          scriptClass : "mstrmojo.HTMLButton",
	   			          cssClass : "mstrmojo-Editor-button",
	   			          text : mstrmojo.desc(221, "Cancel"),
	   			          onclick : function(evt) {
	   				            var e = this.parent.parent;
	   				            if (e.onCancel) { e.onCancel(); }
	   				            e.close();
	   			                }
	   		           }
	   	           ]}
	   	       ],
	   	    onClose: function() {
	        	 if(this.err.text!=='')
	        	    this.err.set('text','');
	         }
 	        });
})();