(function () {
	
    mstrmojo.requiresCls(  
	    "mstrmojo.Box",
        "mstrmojo.QB.QBTableView",
        "mstrmojo.QB.FFsql",
        "mstrmojo.Label",
        "mstrmojo.Table",
        "mstrmojo.Button",
        "mstrmojo.TextArea",
        "mstrmojo.HBox"
	);
    mstrmojo.requiresDescs(1442,221,9130,9137, 9138, 9139, 9140, 9141,9215,9216,9217,9218, 9220); 
    // 9216:Type HiveSQL script 9217:Type SOQL script   9218:Type XQuery script 
    var _S = mstrmojo.string;
    
    var isIE = !!document.all,
        ua = navigator.userAgent,
        isFF = !isIE && !!ua.match(/Firefox/);
  
       

    function _getTokensAsString(its){
        var sa = [],
            i,j;
        for(i=0,len = its.length;i<len;i++){
        	if(its[i].v==='\n'||its[i].v==='\t')
              sa[i] = ' ';
        	else sa[i]=its[i].v;
        }
        return sa.join("");
    }
    
    function _ffemtxt(){
    	return mstrmojo.desc(9215,"Type multi-pass SQL or double-click a table name");
    }
    /************************Private methods*********************************/

    mstrmojo.QB.QBPanel = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.QB.QBPanel",            
        	
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
            
            cssText: 'height:100%',
            
            mode: 1, //1 for QB, 2 for FFSQL            
            
            children: [
                {
                    scriptClass: "mstrmojo.Table",
                    rows: 1,
                    cols: 3,                    
                    cssClass: "mstrmojo-qb-tableview-header",
                    alias:'header',
                    layout: [{cells: [{cssText: "height: 20px; width:20px; padding-left: 10px;"},{cssText: "height:20px;width:20px;padding-left:10px;display:none;"}, {cssText: "height:20px;padding-left: 10px;"}]}],
                    children: [
                        {
			    	         scriptClass: "mstrmojo.Button",                                                      
                             iconClass: "mstrmojo-ArchitectListIconBlock play",                            
                             title: mstrmojo.desc(9130,"Execute SQL"),
                             slot: "0,0",
                             onclick: function (){
                        	     var mdl = mstrmojo.all.QBuilderModel;
                        	     if (!mdl) {
                        	    	return; 
                        	     }
                        	     if (!mdl.FFSQLMode || mdl.isCloud) { //QBMode
				    	            mdl.autoMap();
				    	            return;
                        	     }
                        	     //FFSQL mode
                        		 var pn=this.parent.parent,
        	                         me=this,
        	                         ffbox=mstrmojo.all.FFsql,
                         	         tks=ffbox.items,
                         	         txt=ffbox.txt.replace(/\n/g,' ').replace(/\t/g,' '),
                         	         output=_getTokensAsString(tks); 
                        	     if (output===txt) {
                        	         if (_S.trim(output)!="") {mdl.autoMap();}
                        	     }else{
                            	     var cb = {
	    	                             success: function(res){ 
                                		     if (_S.trim(output)!="") { 
                                		         txt=output;
		    	                                 mdl.autoMap();
                                		     } 
	    	                             },
	    	                             failure: function(res){}           						    	                              
	    	                         };
	    	                         mdl.editFFSQL(cb,output);
                                 }
                             }	
                        },
                                       
			            {
				    	     scriptClass: "mstrmojo.Button",                                                      
                             iconClass: "mstrmojo-ArchitectListIconBlock erase",
                             cssText:"visibility: hidden;position: relative; top:-3px;",
                             title: mstrmojo.desc(9220,"Clear SQL"),
                             slot: "0,1",
                             onclick: function(){
                               	 var ff = mstrmojo.all.FFsql;
                         	     ff.clearTokens();
                         	     ff.updatepasses();
                             }
				        },
				        
						{
						     scriptClass: "mstrmojo.Button",
						     slot: "0,2",
						     iconClass: "mstrmojo-qb-Icons toFFSQL",
						     title: mstrmojo.desc(9137,"Edit SQL"),
	                         onclick: function(){
	                             var pn=this.parent.parent,
            	                     me=this,
            	                     qdl=mstrmojo.all.QBuilderModel;
             	                 if (qdl.FFSQLMode){  
             	                	 var cb = {
             	                		 success: function(res){
             	                		     pn.enterQBMode();
             	                		     qdl.FFSQLMode=false;
             	                	     },
             	                	     failure: function(res){
                  	            	    	 alert(mstrmojo.desc(9140,"Unable to revert back to Query Builder mode"));
                  	            	     } 
             	                	 }
             	                	 if (qdl.isCloud) { //don't convert if this is cloudexp
             	                		 cb.success();
             	                		 return;
             	                	 }             	                	 
             	                	 var ff = mstrmojo.all.FFsql;
             	                	 if (ff.oriSQL === _getTokensAsString(ff.items)){  //if the SQL remains the same, don't prompt
             	                		 mstrmojo.all.QBuilderModel.convertToQueryBuilder(cb);
             	                	 }else {
             	                     var $NIB = mstrmojo.Button.newInteractiveButton;
		                    		     var sql=this.parent.parent;
		                    	         mstrmojo.confirm(mstrmojo.desc(9139,"All changes performed in FFSQL mode will be lost. Do you want to leave FFSQL mode?"), 
		                    	         [
		                    	             $NIB(mstrmojo.desc(1442,"OK"), function yes(){		                    	           
			    	                                             mstrmojo.all.QBuilderModel.convertToQueryBuilder(cb);
		                    	                            },null),
		                    	             $NIB(mstrmojo.desc(221,"Cancel"),  function no(){}, null)
		                    	         ]); 
             	                	 }
             	                 }else{
             	                	 var cb = {
		    	                         success: function(v){
             	                		     var cb2 = {
             	                		    	 success: function(){             	                		                                 
               		    	                          pn.enterFFSQLMode({value:v});
               		    	                     }	 
             	                		     }
             	                		     if (qdl.isCloud) {
             	                		    	 cb2.success();
             	                		     }else {	 
             	                		        qdl.convertToFFSQL(v, cb2);
             	                		     }
                                         },
                                         failure: function(res){
			                    	         alert(mstrmojo.desc(9138,"Unable to change to FFSQL mode"));
			                    	     }       	                	                                                     
	                    	    	 };             	                	 
                                     qdl.updateSQL(cb);
             	                 }
	                         }
                        }          
                    ]   
                },
                
                { 	   
   	 		        scriptClass: "mstrmojo.QB.QBTableView",
   	 		        alias: "tables" ,
   	 		        cssText: "border:0px solid;background-color:white;"       	 		     
   	 		    },
   	 		    
   	 		    {
   	 		        scriptClass:"mstrmojo.Box",       	 		    	  
	 		    	cssText: "border:0px solid gray;overflow:hidden; z-index:1000; display: none;",
	 		        alias: "SQL",
	 		        children:[
	 		            {
	 		            	 scriptClass:"mstrmojo.Table",
                        	 rows: 1,
                             cols: 2,
                     	     alias:'ffsql',
                     	     cssText:"width:100%;height:100%;",
                     	     layout: [{cells: [{cssText: "width:0px; height:100%;"},{cssText: "width:100%;height:100%;"}]}],
                        	 children: [
                        	     {
                        	         scriptClass:"mstrmojo.Box",
                        	         alias:"passlabel",
                        	         slot: "0,0",
                        	         cssText:"width:0px;height:100%;"
                        	     },
                        	     {
							         scriptClass: "mstrmojo.QB.FFsql",
							         alias:"ffbox",
							         id:"FFsql",
							         slot: "0,1",
							         txt:"",
									 cssText:"background-color:white;overflow:auto;border-width:0px;width:100%;height:100%;",
									 dropZone:false,
									 updateSQL: function(e){
                        	    	     var txt=e.value.replace(/\r/g, '');
                        	    	     var _setSQL=function(w){
                        	    	    	 w.clearTokens();
                                    	     w.clipboardNode.value = w.txt=txt; 
                                             w.handlepaste();
                                             w.oriSQL = _getTokensAsString(w.items);
                        	    	     }
                             	         if (!this.candidates){
                                 		     var me=this,
                                 	             success = function(res){
                                                     if (res){
                                                         me.set('candidates', {items:res, isComplete: true});
                                                         _setSQL(me);                                                  
                                                     }
                                                 },   	                	                                                     
                                                 failure = function(res){};   
                                             mstrmojo.all.QBuilderModel.getFFsqlComponents({success: success, failure: failure});
                                 	     }else{
                                 	    	 _setSQL(this);
                                         }
                        	         },
									 postCreate: function (){
                                         this.dropCueNode={};
                                         this.scrollboxNode={};                                           
                                         mstrmojo.all.QBuilderModel.attachEventListener("updateSQL",this.id, this.updateSQL);                                              
                                     }
                        	     }
                        	 ]    
	 		            },
	 		           
	 		            {
                            scriptClass: "mstrmojo.Label",  //text displayed when FFSQL field is blank
                            alias: "emtxt",
                            cssText:"position:absolute;top:120px;left:355px;color:gray;visibility:hidden",
                            text: _ffemtxt(),
                            onclick: function(){
                       	        if (mstrmojo.all.QBuilderModel.SelDBRoleID){
                       	            this.domNode.style.visibility="hidden";
                       	            var ff=this.parent.ffsql.ffbox;
                       	            ff.editNode.contentEditable=true;
                       	            ff.focus();
                       	        }
                            }
                        }
                    ]
   	 		    }    
            ],
            
            enterFFSQLMode: function(e){
                var qbpage = mstrmojo.all.QBuilderPage,
                    tb = qbpage.children[0],
                    conbtn = tb.conbtn,                 
                    viewbtn = tb.viewbtn;
            	var h = this.tables.domNode.clientHeight;
            	this.tables.domNode.style.display = 'none';            	
            	this.SQL.domNode.style.display = 'block';
            	this.SQL.domNode.style.height = h + 'px';
            	
            	var qdl = mstrmojo.all.QBuilderModel;
                var ffbox = mstrmojo.all.FFsql;
            	
            	this.header.children[1].domNode.parentNode.style.display = qdl.isCloud? 'none':'table-cell';
            	this.header.children[1].domNode.style.visibility = qdl.isCloud? 'hidden': 'visible';
            	var icon = this.header.children[2];
            
              
                conbtn.domNode.parentNode.style.display= 'none'; //hide filter menu on toolbar
            	if (qdl.isFFSQL) {  //it means this is from initial loading
        			icon.domNode.style.visibility = 'hidden';  //we do not allow user to switch back to QB mode
        			if (e) {  //display initial sql
        				ffbox.updateSQL(e);
            		}
        		}
        		else{
        		    icon.iconClass="mstrmojo-qb-Icons toQB";
        		    icon.title = mstrmojo.desc(9141,"Convert to QueryBuilder");	                		
        		    icon.render();         	
        		    qdl.FFSQLMode=true;  
        		    mstrmojo.css.toggleClass(viewbtn.domNode, "on", false);
        		    qbpage.main.children[1].set("bottomItemVisible", false); 
        		}
                ffbox.editNode.contentEditable= !qdl.isCloud;      	 
            },
            
            enterQBMode: function(){             
            	this.tables.domNode.style.display = 'block'; 
            	this.tables.scrollBox.linker.drawLinks(); //redraw links to ensure the right position
            	this.SQL.domNode.style.display = 'none';
            	this.header.children[1].domNode.parentNode.style.display = 'none';
            	this.header.children[1].domNode.style.visibility =  'hidden';
            	var icon = this.header.children[2];
            	icon.iconClass="mstrmojo-qb-Icons toFFSQL";
     		    icon.title = mstrmojo.desc(9137,"Edit SQL");              		
     		    icon.render();
     		    var qbpage = mstrmojo.all.QBuilderPage,
                    tb = qbpage.children[0],
                    conbtn = tb.conbtn,                 
                    viewbtn = tb.viewbtn;
     		    conbtn.domNode.parentNode.style.display= 'table-cell'; //show filter menu on toolbar     		  
            },
            
            onRender: function(e){
            	if (this.domNode){
            	    this.tables.set("height", this.domNode.clientHeight - this.header.domNode.clientHeight + 'px');
            	    this.tables.set("width", this.domNode.clientWidth + 'px');
            	    this.SQL.set("height",this.tables.height);
            	    this.SQL.set("width",this.tables.width);
            	}	
            },
            
            onheightChange: function(e){ 
            	if (this.domNode){
            	    this.tables.set("height",parseInt(e.value,10) - this.header.domNode.clientHeight + 'px');
            	    var st = this.SQL.domNode.style;
            	    st.height = this.tables.height;
            	    st.display = mstrmojo.all.QBuilderModel.FFSQLMode? 'block':'none';
            	}	
            	
            },
         
            postCreate: function(e){
            	mstrmojo.all.QBuilderModel.attachEventListener("FFSQLLoaded", this.id,"enterFFSQLMode");
            }
        	
    });

    
})();