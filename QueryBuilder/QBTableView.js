(function () {
	
    mstrmojo.requiresCls(  
	    "mstrmojo.Box",
    	"mstrmojo.QB.FilterValueEditor",
    	"mstrmojo.QB.QBTableLinker",
    	"mstrmojo.QB.QContextMenu",
    	"mstrmojo.QB.ConditionEditor",
    	"mstrmojo.QB.DBTable"
 	   );
    mstrmojo.requiresDescs(629,2151,2156,4449,8510,9126,9127,9128,9129,8571,9130,9131);
    
    var _avatarDBTable=null;
   
    var _C = mstrmojo.css;
    var $D = mstrmojo.dom;
    var _DEFAULT_HEIGHT = '264px';
    var _DEFAULT_WIDTH = '264px';
    var _ROW_HEIGHT  = 22;
      
    var _IMGS = [0,'tick',16,'mix']; //mstrmojo-ArchitectListIconBlock icon index
    
    var _menuItems = [
                      { 'did': 'Delete', 'n': mstrmojo.desc(629,'Delete')},
                      { "did": -1,"n": "-"},	
                      { 'did': '0', 'n': 'Inner Join'},
                      { 'did': '1', 'n': 'Left Outer Join'},
                      { 'did': '2', 'n': 'Right Outer Join'},
                      { 'did': '3', 'n': 'Outer Join'},
                      { "did": -1,"n": "-"},
                      { 'did': 'More Options', 'n': mstrmojo.desc(9126,'More Options')},
                      
    ];
    
   var _joinItems=[
                  { 'did': '0', 'n': 'Inner Join'},
                  { 'did': '1', 'n': 'Left Outer Join'},
                  { 'did': '2', 'n': 'Right Outer Join'},
                  { 'did': '3', 'n': 'Outer Join'}];
   
   var _filters=[  { 'did': '-2', 'n': mstrmojo.desc(4449,'Expression')},
                   { "did": -1,"n": "-"},
                   { 'did': '-5', 'n': 'In list'},
                   { 'did': '-5', 'n': 'Not in list'},
                   { "did": -1,"n": "-"},
                   { 'did': '-5', 'n': 'Exactly'},
                   { 'did': '-5', 'n': 'Different from'},
                   { "did": -1,"n": "-"},
                   { 'did': '-5', 'n': 'Greater than'},
                   { 'did': '-5', 'n': 'Less than'},
                   { 'did': '-5', 'n': 'Greater than equal'},
                   { 'did': '-5', 'n': 'Less than equal'},
                   { "did": -1,"n": "-"},
                   { 'did': '-5', 'n': 'Strings', fns:
	                       [  { 'did': '-5', 'n': 'Like'},
                              { 'did': '-5', 'n': 'Not like'},
                              { 'did': '-5', 'n': 'Contains'},
                              { 'did': '-5', 'n': 'Does not contain'},
                              { 'did': '-5', 'n': 'Begins with'},
                              { 'did': '-5', 'n': 'Does not begin with'},
                              { 'did': '-5', 'n': 'Ends with'},
                              { 'did': '-5', 'n': 'Does not end with'},
                           ]
                   },
                   { "did": -1,"n": "-"},
                   { 'did': '-5', 'n': 'Between'},
                   { 'did': '-5', 'n': 'Not between'}
                   /*   { "did": -1,"n": "-"},
                    { 'did': '-5', 'n': 'Is Null'},
                   { 'did': '-5', 'n': 'Is Not Null'}*/
                  
                ];
   
   
           
   var _fctItems=[
                  { 'did': '0', 'n': 'Expression'},
                  
                  { 'did': '1', 'n': 'Aggregation',fns:
                	                   [  { 'did': '-6', 'n': 'Sum', 'idx':1},
                                          { 'did': '-6', 'n': 'Avg','idx':2},
                                          { 'did': '-6', 'n': 'Min','idx':3},
                                          { 'did': '-6', 'n': 'Max','idx':4},
                                          { 'did': '-6', 'n': 'Count','idx':5},
                                          { 'did': '-6', 'n': 'Count Distinct','idx':6}
                                         ]
                  },  
                 { 'did': '2', 'n': mstrmojo.desc(2151,'Filter'), fns:_filters }
               ];
   
   /*  save expression for selected columns from DBtable
    *  @param (w): DB row widget
    *  @param (expr): expression tokens
    *  @param (expr_s): expression string
    *  @param (cIndex): Index for selected column
    */ 
   function _saveExpr(w,expr,expr_s,cIndex){
      var tksXML='',
          qdl=mstrmojo.all.QBuilderModel,
          scl=qdl.selectedClns;
          success = function(res){
        	  w.count++;
        	  w.updateState(1);    	 
              scl[cIndex-1].expr=expr;
              //raise event cIndex for the new added selected column
              qdl.addExpression(cIndex);
              qdl.updateSQL();
           }, 
         failure = function(res){  
        	   mstrmojo.array.removeIndices(scl,cIndex-1,1);
              //mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
           };
         qdl.validateExpr(
        {
           expr: expr_s,
           tKnStrm: tksXML,
           isNew:true,
           qbrex:1,
           vo:0,
           cIndex: cIndex
       }, 
       {
       success: success, 
       failure: failure
       });
   }


   
   var addButton = new mstrmojo.Button(
	        {	

	        	title: mstrmojo.desc(2156,"Add"),
	        	iconClass:"mstrmojo-ArchitectListIcon addbtn",
	        	cssText: "visibility: hidden;",
 	            onclick: function(evt) {
	        		var qdl=mstrmojo.all.QBuilderModel,
	        		    scl=qdl.selectedClns,
	        		    x=this.w,
	        		    cIndex = scl.length,
	        		    tIndex,
	        		    selRows= new Array();
	        		if (!x.srcData){
	        			tIndex=qdl.gettIndex(x.id);
	        			for (var i=0, len=x.Rows.children.length; i<len ;i++){
	        				selRows.push(x.Rows.children[i]);
	        			}
	        		}
	        		else{
	        			var xp=x.parent.children,
	        			    xi=x.parent.parent.selectedIndex;
	        			    tIndex=qdl.gettIndex(x.parent.parent.id);
	        	    if (xi[x.rIndex]==false){
	        					selRows.push(x);
	        				}
	        	    else{
	        			for (var i=0, len=xp.length; i<len ;i++){
 	        				if (xi[i]==true) selRows.push(xp[i]);
	        				}
	        			}
	        		}
	        		
	        		var cb={ 
	        		        success:function(){
        			        	var i=0,
        			        	    len=selRows.length,
        			        	    w;
        			        	cIndex = scl.length;
	        			        for (i; i<len; i++){
	        			        	w=selRows[i];
	        			        	scl.push({wid:[w.id],expr:[{isNew: true, v:qdl.brackets(w.oriexpr), oi:{tIndex:tIndex, rIndex:w.rIndex, t:'26',n: w.oriexpr}}]});
	        			        	cIndex++;
	        			        	if (w.state==0||w.state==2){
	      				        	   w.state++;
	      				               w.images[1]=w.img[w.state];
	       				               w.render();
	       				            }
	      				            w.count++;
	      				            qdl.addExpression(cIndex);
	      				           
	        			        }
	        				},
	        		        failure:function(){
	        		        	mstrmojo.array.removeIndices(scl,scl.length-1,1);
	        		        }
	        		      };
	        		      qdl.addSelectedColumns(selRows,tIndex,null,cb);
 	        		}
	        });
   
  var menuButton= new mstrmojo.MenuButton({
	    cssClass: "mstrmojo-ArchitectListIcon div",
        cssText: "visibility:hidden; border:0px solid; background-color:transparent;",
        iconClass: "mstrmojo-ArchitectListIcon div", 
        alias: "fctmenu",
        itemChildrenField: 'fns',
        itemIdField: 'did',
        itemField: 'n',
        text:"",	
        menuZIndex:100,
        searchItemAdded: true,
        executeCommand: function(item){
          var qdl=mstrmojo.all.QBuilderModel,
              tbl=this.w.parent.parent,
              tIndex=qdl.gettIndex(this.w.srcID);
          // Add selected column from DBtable Row with expression editor
          if(item.did=='0'){
        	       var w=this.w;
        	    	 var cb={
        	    			success: function()
        	    			{ qdl.exprEditor(w,0,null,qdl.selectedClns.length);
        	    			},
        	    	        failure: function(){}
        	    			};
        	      qdl.addSelectedColumn(w,false,cb);
          }
          //Add aggregated selected column from DBtable row
		    else if(item.did=='-6') {
  	        	   var  scl=qdl.selectedClns,
	        		    w=this.w,
	        		    cIndex = scl.length,
 	        		    selRows= new Array();
 	        			rows=w.parent.children,
	        			sIndex=tbl.selectedIndex;
 	        	    if (sIndex[w.rIndex]==false){
	        					selRows.push(w);
	        				}
	        	    else{
	        			for (var i=0, len=rows.length; i<len ;i++){
 	        				if (sIndex[i]==true) selRows.push(rows[i]);
	        				}
	        			}
	        		
 	        		var cb={ 
	        		        success:function(){
        			        	var i=0,
        			        	    len=selRows.length,
        			        	    w;
        			        	cIndex = scl.length;
	        			        for (i; i<len; i++){
	        			        	w=selRows[i];
	        			        	if(item.idx===6)
	        			        		scl.push({wid:[w.id],expr:[{isNew:true,v:'Count' ,oi:{t:'11',n:'Count'}},
	        			        		                           {isNew:true,v:'<Distinct=true>' ,oi:{t:'11',n:'<Distinct=true>'}},
		        				    		    	               {isNew:true,v:'(' , isDelimiter: true},
		        				    		    	               {isNew:true,v:qdl.brackets(w.oriexpr),oi:{tIndex:tIndex, rIndex:w.rIndex,t:'26',n:w.oriexpr}},
		        				    		    	               {isNew:true,v:')' , isDelimiter: true}]
		        				    		    });
	        			        	else
	        			        	    scl.push({wid:[w.id],expr:[{isNew:true,v:item.n ,oi:{t:'11',n:item.n}},
	        				    		    	               {isNew:true,v:'(' , isDelimiter: true},
	        				    		    	               {isNew:true,v:qdl.brackets(w.oriexpr) ,oi:{tIndex:tIndex, rIndex:w.rIndex,t:'26',n:w.oriexpr}},
	        				    		    	               {isNew:true,v:')' , isDelimiter: true}]

	        				    		    });
	        			        	cIndex++;
	        			        	if (w.state==0||w.state==2){
	      				        	   w.state++;
	      				               w.images[1]=w.img[w.state];
	       				               w.render();
	       				            }
	      				            w.count++;
	      				            qdl.addExpression(cIndex);
	      				           
	        			        }
	        				},
	        		        failure:function(){
	        		        	mstrmojo.array.removeIndices(scl,scl.length-1,1);
	        		        }
	        		      };
	        		      qdl.addSelectedColumns(selRows,tIndex,item.idx,cb);
 	        		}
		    // Add filter from DBtable row with expression editor
		       else{
		    	   if (item.did=='-2'){
 		    		   qdl.exprEditor(this.w,1);
		    	   }
		   // Add filter from filter editor
		    	  else{
		    		   if(item.n=='Between'||item.n=='Not between'){
		    			   if(!mstrmojo.all.fve2){
				    		    var fve2=new mstrmojo.QB.FilterValueEditor2({});
				    		   }
				    		  else{
				    			 var fve2=mstrmojo.all.fve2;
				    		  }
				                var me=fve2.children[0];
				    		    me.filter.set('text',item.n);
				    		    me.txtname1.set('value',null);
				    		    me.txtname2.set('value',null);
				    		    fve2.DBRow=this.w;
				    		    fve2.open();
				    		    me.txtname1.focus();
		    		   }
		    		  else if(item.n=='Is null'||item.n=='Is not null'){
		    			        var qdl=mstrmojo.all.QBuilderModel;
		    			        if( this.w.state==0|| this.w.state==1)
		    			        { this.w.state=this.w.state+2;
		    			          this.w.images[1]=this.img[this.w.state];
				                  this.w.fcount=1;
		    			        }
		    			        else this.w.fcount++;
 		                       this.w.cond=[{isNew:true,v:item.n,oi:{t:'26',n:item.n}}];
 				               qdl.raiseEvent({name:"condChange", wid:[this.w.id], expr:this.w.expr.concat(this.w.cond)});
			                   this.w.render();
		    		  } 
		    		 else{  
		    		   if(!mstrmojo.all.fve1){
		    		    var fve1=new mstrmojo.QB.FilterValueEditor({});
		    		    }
		    		   else{
		    			 var fve1=mstrmojo.all.fve1;
		    		    }
		                var me=fve1.children[0];
		    		    me.filter.set('text',item.n);
		    		    me.txtname.set('value',null);
		    		    fve1.DBRow=this.w;
		    		    fve1.open();
		    		    me.txtname.focus();
		    		   
		    		   }
		    	   }
				}	    
     },
		
   postCreate: function(){		  
		        this.cm = _fctItems;
		    }
		 }); 
    // join options editor
   var jopt=new mstrmojo.Editor({ 
	       title: mstrmojo.desc(9127,"Join Options"),
	       alias:"jopt",
	       zIndex:100,
	       cssText:"width:350px;",
	       children: [
              {
                scriptClass:"mstrmojo.Label",
                cssText: "font-weight:bold; width:100%; padding: 5px;",
                text: mstrmojo.desc(9128,"Join")
               },
      
              {
                scriptClass:"mstrmojo.RadioList",
                alias:"radiolist",
                cssText:"padding-left:25px;",
                itemCssClass: "mstrmojo-QB-radiolist-item",
                items:_joinItems
              },
      
    
	          {
	             scriptClass:"mstrmojo.Label",
	             cssText: "font-weight:bold; width:100%; padding-left: 5px;",
	             text: mstrmojo.desc(9129,"Join Operator")
	         },
	         
	         {
	             scriptClass:"mstrmojo.Label",
	             alias:"stext",
	             cssText: "padding-left:100px;"
	             
	        },
	        {
	             scriptClass:"mstrmojo.HBox",
	             alias:"jop",
	             cssText: "position:relative;left:100px;",
	             children:[
	                   {scriptClass:"mstrmojo.Pulldown",
	                	items: [{n:'=', dssid: "0"}, {n:'>', dssid: "1"},{n:'>=', dssid: "2"},{n:'<', dssid: "3"},
		                	         {n:'<=', dssid: "4"},{n:'<>', dssid: "5"}],
                         popupToBody: true
	                   } /*,
	                   {scriptClass:"mstrmojo.Label",
 	    	            text: mstrmojo.desc(8571,"more")
 	    	           }*/
	                   ]
 	    	
	         },
	         {
	             scriptClass:"mstrmojo.Label",
	             alias:"ttext",
	             cssText: "padding-left:100px;"
	             
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
	        	    var e = this.parent.parent;
	        	    var qdl=mstrmojo.all.QBuilderModel,
	        	        jt=e.radiolist.selectedItem.did,
	        	        linkid=e.slink[1],
	        	        jid=e.slink[0],
	        	        expr=qdl.brackets(e.stext.text)+e.jop.children[0].selectedItem.n+qdl.brackets(e.ttext.text);
	        	   
	        	    var cb = {
   				     	    success: function(res){
	        	    	    
	                            e.linker.drawLinks();
	        	               
   				            	
   				     	    },
   				     	    failure: function(res){
   				     			
   				     	    }
   				     	    
   				     	}
   				     	
   				     	qdl.editJoin(jid,linkid,jt,cb,expr);
	        	    
	        	   if (e.onOK) { e.onOK(); }
	    			e.close();
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
               ]
        }]
});
   
   
   /*  construct Table widget on table panel 
    *  @param (widget): container widget
    *  @param (h): table height
    *  @param (x): table x coordinate
    *  @param (y): table y coordinate
    *  @param (tbn): table name   
    */   
    function _constructAvatarDBTable(widget, h, x, y, tbn){
    	var qdl = mstrmojo.all.QBuilderModel;
    	var DBTable=new mstrmojo.QB.DBTable({
			cssText: "opacity:0.3;filter:alpha(opacity=30);left:0px;top:0px;width:180px;height:" + h + "px;",
			title: tbn,
			visible:false,
			noCheckBox: true
        });
	      	
        DBTable.container = widget.parent;  //for drag scroll
        DBTable.selectedIndex=new Array();
        var tIndex=qdl.gettIndex(DBTable.id);
        widget.addChildren([DBTable]);  //render DBTable on the panel
 	     DBTable.maxHeight = DBTable.editorNode.clientHeight;
 	     DBTable.maxWidth = Math.max(DBTable.Rows.domNode.clientWidth, DBTable.titlebarNode.clientWidth);
 	     if (DBTable.maxHeight > parseInt(_DEFAULT_HEIGHT)) {
 	        DBTable.set("height", _DEFAULT_HEIGHT);
 	     }
 	                 	 	        	 
         var vl = x + 'px',
 	         vt = y + 'px',
 	         vr = x  + DBTable.editorNode.clientWidth,
 	         vb = y  + DBTable.editorNode.clientHeight,
	         st = DBTable.editorNode.style; //this is the editor node		            	 	       	      
 	     st.left = vl;
 	     st.top = vt;
 	     st.width = DBTable.titlebarNode.clientWidth + 'px';
 	     DBTable.left=vl;
 	     DBTable.top=vt;
  	 	 return DBTable;
	};	
   
   
   /*  construct Table widget on table panel 
    *  @param (widget): container widget
    *  @param (h): table height
    *  @param (w): table height
    *  @param (x): table x coordinate
    *  @param (y): table y coordinate
    *  @param (tbn): table name
    *  @param (clns): table's column array         	  
    */   
	 function _constructDBTable(widget, h, w, x, y, tbn, clns, tid){
	    	var qdl = mstrmojo.all.QBuilderModel;
	    	var maxh = _ROW_HEIGHT*(clns.length+1);
	    	var DBTable=new mstrmojo.QB.DBTable({
				scriptClass:"mstrmojo.DBTable",
				cssText: "position:absolute;left:0px;top:0px;width:"+(w?w:180)+"px;height:" + maxh + "px;",
				left:x+'px',
	    	    top:y+'px',
				title: tbn,
				visible:true,
				noCheckBox: true,	         
		        onClose: function(){
	           	    var me=this;
	                var cb={
	                       success: function(){	                	        
	 	           	             me.parent.parent.linker.drawLinks();           	    
	                      },
	                      failure: function(){}
	                 };                
	           	     qdl.removeTable(this,cb);
		           	 if (addButton.domNode) { 
	     	             addButton.domNode.style.visibility="hidden";
	     	         }
		        }
	        });
		    qdl.tables[DBTable.id]= {
		    	rows: {},
		    	njoins: 0,
		    	tbn: tbn,
		        alias: ''
		    }		    	
	        qdl.dbtables.push(DBTable.id);//important, to update the table index
		    if (tid){   
		    	qdl.uiids[tid] = DBTable.id;
		    }
		    DBTable.model = qdl;
	        DBTable.container = widget.parent;  //for drag scroll
	        DBTable.selectedIndex=new Array();
	        var tIndex=qdl.gettIndex(DBTable.id);
	        for (var i=0, len=clns.length; i<len ; i++) {
	 		     var rname=clns[i].cln; 
	 		     var imgs = clns[i].state? ["0", _IMGS[clns[i].state]]: ["0","0"]; 
	 			 DBTable.addRow(clns[i].cln,0, imgs, ""); 		
	             DBTable.selectedIndex[i]=false;
	  	         var row = DBTable.Rows.children[i];
		  	     row.cssClass = (i%2)? "odd" : "even"; 
		  	     row.srcTable = tbn;
		  	     row.srcID = DBTable.id;				             	 	        	 
		  	     row.srcData = clns[i];
		  	     row.oriexpr=clns[i].exp? clns[i].exp : (tbn+'.'+clns[i].cln);
		  	     row.expr=[{isNew:true,v:qdl.brackets(row.oriexpr),oi:{tIndex:tIndex, rIndex:i+1,t:'26',n:row.oriexpr}}];
		  	     row.img= _IMGS;
		  	     row.state= !clns[i].state ? 0: clns[i].state;
		  	     qdl.tables[DBTable.id].rows[row.id]=row;
		  	     row.rIndex = i;
		  	     row.count= !clns[i].count ? 0: clns[i].count;
	 	  	     row.dt = {ps: clns[i].dtps, sc: clns[i].dtsc, tp:clns[i].dttp};  //set column data type
	 	  	     row.updateState = function(newstate){
	 	  	    	 if (this.count == 0) {
	 	  	    	     this.state = this.state & 2;
	 	  	    	 }
	 	  	    	 this.state = this.state | newstate; 	  	    	 
	 	  	    	 var imgKey = (this.state & 1) + (this.state & 2);
	 	  	    	 this.images[1]= this.img[imgKey];
	 	      	     this.render(); 	  	    	 
	 	  	     }; 
	 	  	     row.ondblclick = function(evt){
	 	  	    	 var scl=qdl.selectedClns;	 	  	    	
	 	  	    	 var cb = {
	 	  	    		 success: function(w){
	 	  	    		     var cIndex = scl.length;
	 	  	    		     scl.push({wid:[w.id],expr:[{isNew: true, v:qdl.brackets(w.oriexpr), oi:{tIndex:tIndex, rIndex:w.rIndex, t:'26',n: w.oriexpr}}]});	 	  	    		     
					         cIndex++;
					         w.updateState(1);					         
						     w.count++;
						     qdl.addExpression(cIndex);						    
	 	  	    	     },
	 	  	    	     failure: function(res){
	 	  	    	    	 mstrmojo.array.removeIndices(scl,scl.length-1,1);
	 	  	    	     }
	 	  	    	 }
	 	  	         qdl.addSelectedColumns([this],tIndex, null,cb);
	 	  	     };
	             if (tid) {
	                 qdl.uiids[tid + clns[i].did ] = row.id;
	             }
	         }
	         widget.addChildren([DBTable]);  //render DBTable on the panel
	 	     DBTable.maxHeight = maxh; // DBTable.editorNode.clientHeight;
	 	     DBTable.maxWidth = Math.max(DBTable.Rows.domNode.clientWidth, DBTable.titlebarNode.clientWidth);
	 	     if (h<maxh) {
	 	        DBTable.set("height", h + 'px');
	 	     }

	         var vl = x + 'px',
	 	         vt = y + 'px',
	 	         vr = x + DBTable.editorNode.clientWidth,
	 	         vb = y + DBTable.editorNode.clientHeight,
		         st = DBTable.editorNode.style,
	             ts = widget.parent,  //ts is the fixed size box containing linkerbox and canvasbox	
	             cvs_st=widget.domNode.style,
	             linker=ts.linker;
	         DBTable.titlebarNode.style.width=parseInt(st.width, 10) - 38 + 'px'; //20px for padding, 18px 
	         DBTable.titleNode.style.width= DBTable.titlebarNode.style.width;
		 	  // set the maximun width and height for canvas box and linker box; if greater than deault. reset the size of the two box
		 	 if(ts.maxWidth<vr){
		 		 ts.maxWidth=vr;
		 		 if(linker.width<vr){
		 	         cvs_st.width=widget.width=vr+'px';
		 	         linker.width=vr;
		 	         qdl.linkerNeedRender=true;
		 		 }
		 	 } 	 
			 if(ts.maxHeight<vb){
		 		 ts.maxHeight=vb;
		 		if(linker.height<vb){
		 	     cvs_st.height=widget.height=vb+'px';
		 	     linker.height=vb;
		 	     qdl.linkerNeedRender=true;
		 		}
		 	 } 	
		
		 	 return DBTable;
		};	
    /************************Private methods*********************************/

    mstrmojo.QB.QBTableView = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.QB.QBTableView",            
        		   	    
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
                  
          children: [
	            { 
				    scriptClass: "mstrmojo.Box",
				    alias: "scrollBox",				   
					cssText: "position:relative; overflow:auto; width: 100%; height:100%;",
					maxWidth:0,
				    maxHeight:0,
				    children:[
				        {
					        scriptClass: "mstrmojo.QB.QBTableLinker",
					        alias: "linker",
					        // ondrop and onclick For the IE9 
					        dropZone: true,
					        allowDrop: function allowDrop(ctxt){
							    if (ctxt.src && ctxt.src.data && ctxt.src.data.st && ctxt.src.data.st==8405 ) {
						            return true;
							    }
							    return false;
						       },
					   
					        ondrop: function ondrop(c) {
						    	 this.parent.canvasbox.ondrop(c);
					    	 },
					    	 
					        ondragenter:function ondragenter(c){
					    		 this.parent.canvasbox.ondragenter(c);
					    	 },
					    	 
					    	onclick: function onclick(c){
					    		 var qdl=mstrmojo.all.QBuilderModel;
							    	var el = document.elementFromPoint(c.e.clientX,c.e.clientY);
									var w = $D.findWidget(el);
									if(w.alias!="linker") return;
									var pos = $D.position(this.domNode);
							    	var x=c.e.clientX-pos.x;
							    	var y=c.e.clientY-pos.y;
					                var link=qdl.getTouchValue(x,y);
							        if(link){
								    	qdl.selLink=link;
								    	this.drawMarker();
								        var st=this.parent.cxtmenu.domNode.style;
								    	st.visibility='visible';
								        st.left=x+'px';
								    	st.top=y+'px';
								    	this.parent.cxtmenu.showContextMenu();
							       }						       else{
							    	   qdl.selLink=null;
							    	   this.clearHighLightCanvas();
							       }
					    	 },
					    	 
					    	 postCreate:function(){
		                        	if (!mstrmojo.all.QBuilderModel) {
		                     			var x = new mstrmojo.QB.QBuilderModel({});
		                     		} 
		                         	mstrmojo.all.QBuilderModel.attachEventListener("JoinsLoaded", this.id, "drawLinks");		                         	
		                     } 
	                     },
					
					 
					     {   
						 	scriptClass: "mstrmojo.Box",
						 	markupString: '<div id="{@id}" class="mstrmojo-Box {@cssClass}" style="{@cssText}" mstrAttach:click,dblclick,mousemove> </div>',
						 	cssText: "position:absolute;left:0px;top:0px; width:100%; height:100%;",
						 	alias:"canvasbox",				 				    
						    dropZone: true,
			                allowDrop: function allowDrop(ctxt){
							    if (ctxt.src && ctxt.src.data && ctxt.src.data.st && ctxt.src.data.st==8405 ) {
						            return true;
							    }
							    return false;
						       },
						       
				            onclick: function onclick(c){
						    	
						    	var qdl=mstrmojo.all.QBuilderModel;
						    	var el = document.elementFromPoint(c.e.clientX,c.e.clientY);
								var w = $D.findWidget(el);
								if(w.alias!="canvasbox") return;
								var pos = $D.position(this.domNode);
						    	var x=c.e.clientX-pos.x;
						    	var y=c.e.clientY-pos.y;
				                var link=qdl.getTouchValue(x,y);
						        if(link){
							    	qdl.selLink=link;
							    	this.parent.linker.drawMarker();
							        var st=this.parent.cxtmenu.domNode.style;
							    	st.visibility='visible';
							        st.left=x+'px';
							    	st.top=y+'px';
							    	this.parent.cxtmenu.showContextMenu();
						       }						       else{
						    	   qdl.selLink=null;
						    	   this.parent.linker.clearHighLightCanvas();
						       }
						   },
						   
						   displayBindingTable: function(evt){
							   var tables = evt.value, left = 0, _padding=20, top = 20, height=0, width=0, pos, t, prev=0;							  
							   for (var i =0, len =tables.length; i<len; i++) {
								   t = tables[i];
								   pos = t.pos;
								   if (pos){
									   top = pos.t;
									   left = pos.l;
									   height = pos.h;
									   width = pos.w;
								   } else {
									   height = _ROW_HEIGHT*(t.cs.length+1);
									   left += prev + _padding;
								   }	   
								   var DBTable = _constructDBTable(this, height, width, left, top, t.tbn, t.cs, t.did);
								   prev = DBTable.editorNode.clientWidth;
							   }
						   },
						   
						   postCreate:function(){
							    var mdl = mstrmojo.all.QBuilderModel;
	                        	if (!mdl) {
	                     			mdl = new mstrmojo.QB.QBuilderModel({});
	                     		} 
	                         	mdl.attachEventListener("BindingTableLoaded", this.id, "displayBindingTable");
	                         	mdl.attachEventListener("TableAdded", this.id, "drawTable");
	                       },  
					
						  
						  onmousemove:function(evt){
		                        if($D.isFF){
								   evt=evt.e;
					    	       }
		                         var e = (window.event) ? window.event : evt,
       	                 	         target = mstrmojo.dom.eventTarget(window.event,e),
       	 	      		             w=$D.findWidget(target);
		                         	 
       	 	      	             if(w.srcData||w.Rows){
        	 	      	            var wpos=$D.position(w.domNode),
      	 	      		                pos=$D.position(this.domNode),left,top;
       	 	      	                	if (w.srcData){
       	 	      	                        menuButton.w=w;
       	 	      	                        addButton.w=w;
      	 	      		                	left=wpos.x-pos.x+w.parent.parent.containerNode.children[0].clientWidth-22;
      	 	      		                	top=wpos.y-pos.y+2;
     	 	      		                	menuButton.cssText="position:absolute; visibility:visible;left:"+left+"px;top:"+top+"px; border:0px solid; background-color:transparent;z-index:40;";
         	 	      		                addButton.cssText="position:absolute; visibility:visible;left:"+(left-18)+"px;top:"+(top-2)+"px; border:0px solid; background-color:transparent;z-index:40;";
         	 	      		            
       	 	      	                	}
      	 	      		                else{
      	 	      		                    addButton.w=w;
      	 	      		                    left=wpos.x-pos.x+parseInt(w.left)+w.titlebarNode.offsetWidth-36; //+w.containerNode.clientWidth-20;
      	 	      		               		top=wpos.y-pos.y + parseInt(w.top);
     	 	      		                	menuButton.cssText= "visibility:hidden;";
         	 	      		                addButton.cssText="position:absolute; visibility:visible;left:"+left+"px;top:"+top+"px; border:0px solid; background-color:transparent;z-index:40;";
         	 	      		            
      	 	      		                }
     	 	      		                menuButton.render();
       	 	      		                addButton.render();
       	 	      		             }
       	 	      	              else{
       	 	      	                	 menuButton.cssText= "visibility:hidden;";
       	 	      	                	 addButton.cssText="visibility:hidden;"
       	 	      	                	 menuButton.render();
       	 	      	                	 addButton.render();
       	 	      	                	 return
       	 	      	                 }
      		                    },
   					    	ondragenter: function ondragenter(ctxt) {
     		                    	var qdl=mstrmojo.all.QBuilderModel;
     		                    	if (qdl.FFSQLMode==true){
     		                    	return true;
     		                    	}
     		                    	var a=ctxt.src.widget.parent.avatar;
     		                    	var fc = a.firstChild;
     		                    	if (_avatarDBTable==null) _avatarDBTable=_constructAvatarDBTable(this,"105" ,"1", "1" ,ctxt.src.data.n);
     		                    	_avatarDBTable.domNode.style.display='none';
     		                    	var newNode=_avatarDBTable.domNode.cloneNode(true);
     		                    	newNode.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.nextSibling.firstChild.innerHTML=ctxt.src.data.n;
     		                    	newNode.style.display='block';
         			                a.removeChild(fc);
    		                    	a.appendChild(newNode);
    		                      	return true;
     		                    	},
     		               
						    ondrop: function ondrop(c) { 
				            	if (c.src && c.src.data) {
				            		var a=c.src.widget.parent;
				            		 a.avatar.style.display = "none";
	  	 			                 a.ownAvatar = false;
				            		var me=this;				            		
				            		var pos=c.tgt.pos, tgtpos ={x:c.tgt.pos.x, y:c.tgt.pos.y}, tbn = c.src.data.n, t = c.src.data.tag;
				            		var mdl = mstrmojo.all.QBuilderModel;
				            		var callback = {
				            			success: function(res) {				            			    
				            			    mdl.addTable(t, res.items, cb);
				            		    },
				            		    failure: function(res){
				            		    	return;
				            		    }	
				            		};			
				            		var cb= {
				            		    success: function(res){ 
				            			    tbn = res.alias;
				            			    var h = _ROW_HEIGHT*(res.items.length+1);	//original height should be (rowcount+1)*rowheight			            			      
				            			    h = (h > parseInt(_DEFAULT_HEIGHT, 10))? parseInt(_DEFAULT_HEIGHT, 10): h;				            			   
				            			    var pos = $D.position(me.domNode);
				            			    _constructDBTable(me, h, null,  tgtpos.x- pos.x, tgtpos.y-pos.y, tbn, res.items);				            			    
				            			},
				            		    failure: function(res) {
				            			    return;
				            		    }	
				            		};
				            		mdl.getColumnsForDBTable(c.src,callback);
				            	}	
						    },
						    
						    drawTable: function(evt){
						    	var data =evt.data, x = evt.x, y = evt.y, tbn = evt.tbn;
						    	var h = _ROW_HEIGHT*(data.length+1);	//original height should be (rowcount+1)*rowheight			            			      
		            		    h = (h > parseInt(_DEFAULT_HEIGHT, 10))? parseInt(_DEFAULT_HEIGHT, 10): h;	
						    	_constructDBTable(this, h, null,  x, y, tbn, data);	
						    }	
				        },				      
				        {
				       	    scriptClass: "mstrmojo.QB.QContextMenu",				       	 
				            cssText: "visibility:hidden; border:0px solid; background-color:transparent;",				         
				            alias: "cxtmenu",
				            itemChildrenField: 'fns',
				            itemIdField: 'did',
				         	itemField: 'n',
				            text:"",		         
				            searchItemAdded: true,
				            dynamicUpdate:true,
				            
				            queryChecked: function queryChecked(item){
			    			    if (item.did=='Delete'|| item.did==-1||item.did=="More Options") return false;
			    			    var qdl=mstrmojo.all.QBuilderModel;
				        	    var jid=qdl.selLink[0];
				        	    return (qdl.joinsInfo[jid].jt==item.did)		    				
		    			    },  
				   		
				            executeCommand: function(item){
				        	    var linker=this.parent.linker;
				        	    var qdl=mstrmojo.all.QBuilderModel;
				        	    var slink=qdl.selLink,
				        	        did=item.did;
				   		        switch (did) {
				   				    case "Delete": {
				   				   
									    var cb={
											   success:function(){
			   				                         qdl.selLink=null;
			   				 	                     linker.drawLinks();
									                },
									             failure:function(){}
									      };
			   				 	       qdl.removeLink(slink[1],slink[0],cb);
				        	    	    break;
				   			        }
				   				    case '0':  //inner join
				   				    case '1':  //left join
				   				    case '2':  //right join
				   				    case '3':  //outer join					   				     
				   				     	var cb = {
				   				     	    success: function(res){
				   				            	qdl.joinsInfo[slink[0]].jt=did;
				   				            	linker.drawLinks();
				   				     	    },
				   				     	    failure: function(res){
				   				     			
				   				     	    }
				   				     	}				   				     	
				   				     	qdl.editJoin(slink[0],slink[1],did,cb);
				       			        break;
				   			       
				   				    case "More Options": {
				   				    	
				   				    	var link=qdl.joinsInfo[slink[0]].links[slink[1]],
				   				    	    srcText=link.srcw.oriexpr,
				   				    	    tgtText=link.tgtw.oriexpr;
			   				    	        jopt.slink=slink;
			   				    	        jopt.linker=linker;
					        	            jopt.stext.set("text",srcText);
								            jopt.ttext.set("text",tgtText);
								            jopt.radiolist.set('selectedIndex',parseInt(qdl.joinsInfo[slink[0]].jt));
								            var op=link.op;
								            if(op) jopt.jop.children[0].set('value',op);
								            jopt.open();				   					       
				       			        break;
				   			        }				   				
				   				    default: {				 
				   				        break;
				   			        }
				   		        }
				   		    },				   		
				   		    postCreate: function(){		  
				   		        this.cm = _menuItems;
				   		    }    
				        },
				        addButton,
				        menuButton
		            ]   //end children of scrollbox		        	 
				},
				{
					   scriptClass:'mstrmojo.QB.ConditionEditor',
				       id: "CE",
				       alias:"CE",
 				       show:function(){	
					      var d = document.createElement('div'),
					          dn=mstrmojo.all.QBuilderPage.domNode,
					          st=this.domNode.style,
					          _H=mstrmojo.hash;
  					       d.className = "mstrmojo-qb-curtain";
 		                   d.id="curtain";
		                   dn.appendChild(d);
		                    
				            st.width='380px';
				            st.height='400px';
				           	st.left=dn.clientWidth/2-150+'px';
				           	st.top= dn.clientHeight/2-150+'px';
				           	
				           	st.visibility='visible';
				         // if prev_### is not null, cancel button was clicked. Just keep the original expression information
				           	// if not, the expression was updated, reset original expression information
				           	if(!this.prev_expr){ 
				           		this.prev_expr= _H.clone(this.CEl.data.expr)||new Object();
				           	}
				           	if(!this.prev_aggexpr){
				           		this.prev_aggexpr= _H.clone(this.CEl.data.aggexpr)||new Object();
				           	}
 				       },
				               
				       hide: function(){
 				    	   var dn=this.parent.parent.parent.parent.parent.domNode,
 				    	       curtain= document.getElementById("curtain");
			               st=this.domNode.style;
 				           dn.removeChild(curtain);
			               st.width='0px';
			               st.height='0px';
			               st.left='0px';
			               st.visibility='hidden';
                           mstrmojo.css.toggleClass(mstrmojo.all.QBuilderPage.children[0].conbtn.domNode, "on", false);  
					   }
				           
			   }
		   ],
			
		   postBuildRendering: function (){

              	  this.scrollBox.render();
              	  this.CE.render();      
              	  this.scrollBox.linker.render();        
           }, 





            
           onheightChange: function(e) {
            	var h = parseInt(e.value);
        		this.scrollBox.set("height",  h + 'px');        	
        		var cvb = this.scrollBox.canvasbox;
        	 	if ( (!cvb.height) || (cvb.domNode && h > cvb.domNode.clientHeight)) {
	        		cvb.set("height",h + 'px');
	        		this.scrollBox.linker.set("height", h);
        	 	}
        	 	if (this.scrollBox.domNode){
        			this.scrollBox.domNode.style.height = this.scrollBox.height;
        			if(parseInt(this.scrollBox.height)<this.scrollBox.maxHeight){
        				this.scrollBox.linker.set("height",parseInt(this.scrollBox.maxHeight));
        				this.scrollBox.linker.render();
        				this.scrollBox.linker.drawLinks();
        				this.scrollBox.canvasbox.domNode.style.height=parseInt(this.scrollBox.maxHeight)+'px';
        				this.scrollBox.domNode.style['overflow-y']='auto';
        			}
        			else{
        				this.scrollBox.linker.set("height",h);
        				this.scrollBox.linker.render();
        				this.scrollBox.linker.drawLinks();
        				cvb.domNode.style.height=h+'px';
        				cvb.height=cvb.domNode.style.height;
        				this.scrollBox.domNode.style['overflow-y']='hidden';
        			}
        			
        		}	
        	},
        	
        	onwidthChange: function(e) {
        		var w = parseInt(e.value);
        		this.scrollBox.set("width", w + 'px');        		
        		var cvb = this.scrollBox.canvasbox;
        	 	if ( (!cvb.width) || (cvb.domNode && w > cvb.domNode.clientWidth)) {
	        		cvb.set("width",w + 'px');	        	
	        		this.scrollBox.linker.set("width",w);	        		
        	 	}
        		//decide when to show the scrollbar smartly
        		if (this.scrollBox.domNode){
        			this.scrollBox.domNode.style.width = this.scrollBox.width;
        			if(parseInt(this.scrollBox.width)<this.scrollBox.maxWidth){
        				this.scrollBox.linker.width=parseInt(this.scrollBox.maxWidth);
                        this.scrollBox.linker.render();
        				this.scrollBox.linker.drawLinks();
        				this.scrollBox.canvasbox.domNode.style.width=parseInt(this.scrollBox.maxWidth) +'px';
        				this.scrollBox.domNode.style['overflow-x']='auto';
        			}
        			else{
        				this.scrollBox.linker.set("width",w);
        				this.scrollBox.linker.render();
        				this.scrollBox.linker.drawLinks();
        				cvb.domNode.style.width=w+'px';
        				cvb.width=cvb.domNode.style.width;
        				this.scrollBox.domNode.style['overflow-x']='hidden';
        			}
        				
        		}	
        	}	 
        });

    
})();