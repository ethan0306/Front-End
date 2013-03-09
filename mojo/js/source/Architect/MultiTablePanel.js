(function () {
	
    mstrmojo.requiresCls(  
	    "mstrmojo.Box",
	    "mstrmojo.Architect.DBTable"
	  
	);
   
    var _MARGIN = 20,
        $D=mstrmojo.dom;
    
    function _getLayers() {
    	var layers = mstrmojo.all.ArchModel.layers,
            items=[];	       
	    for (var key in layers) {
	        items.push( {n:layers[key].name, rgt:layers[key].id});  	
	    }
	    return items;
    };	
    
    function _invokeLayerChange(v) {
    	var current = mstrmojo.all.ArchModel.currentlayerID;
     	mstrmojo.all.ArchModel.set("currentlayerID",v);
    };
    
    /************************Private methods*********************************/

    mstrmojo.Architect.MultiTablePanel = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.Architect.MultiTablePanel",            
        		   	    
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
            
            cssText: "border:0px;overflow-y:hidden;",            
            width: 0,
            height: 0,
            
            children: [
                {
     		        scriptClass: "mstrmojo.Table",
     		        alias: "subheader",
     	 		    rows: 1,
     	            cols: 2,
     	            layout: [{cells: [{cssText: "padding-left: 5px; padding-right: 10px;"}, {cssText: "height: 20px;"}]}],	 		        	
     	 		    cssClass: "mstrmojo-Architect-Panel-header subheader",
     	 		    children: [     	 		         
     	 		           {
     	 		        	   scriptClass: "mstrmojo.Table",
     	 		        	   slot: "0,0",
     	 		        	   rows: 1,
	       		        	   cols: 2,
	       		        	   layout: [{cells: [{cssText: "height: 20px; width:20px;"}, {cssText: "height: 20px; width:20px;"}, {cssText: "height: 20px; width:20px;"}]}],
     	 		        	   children: [
     						       {
     								   scriptClass: "mstrmojo.Button",
     								   slot: "0,0",
     								   iconClass: "mstrmojo-ArchitectListIcon addbtn",
     								   title: "add",
     								   onclick: function addlayer(evt){
     						    	       var mdl = mstrmojo.all.ArchModel,
     						    	           layers=this.parent.parent.layer,
     						    	           cb = {
     						    	    		      success : function (res){
     						    	    	              layers.items.push({n:res.name, rgt:res.id});     						    	    	              
     						    	    	              layers.set("value",res.id);
     						    	                  }, 
     						    	                  failure: function(res){ 
   				     	           					      mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
   				     	           				      }
     						    	           };
     						    	       mdl.addLayer(cb);
     						           }						      
     							   },
     							   {
     								   scriptClass: "mstrmojo.Button",
     								   slot: "0,1",
     								   iconClass: "mstrmojo-ArchitectListIcon delbtn",
     								   title: "delete",
     								   onclick: function deletelayer(evt){
     								       var mdl = mstrmojo.all.ArchModel,
     								           layers=this.parent.parent.layer,
     								           cb = {
     								    	       success: function(res){     								    	               
     								    	           layers.items= _getLayers();
     								    	           layers.set("value", mdl.currentlayerID);
		     	           						   },
				     	            			   failure: function(res){ 
				     	           					   mstrmojo.alert(res);
				     	           				   }    		   
				     				           };
     								       mdl.delLayer(layers.value, cb);  
     						           }						      
     							   },
     							   {
     			 		        	   scriptClass: "mstrmojo.Button",
     			 		        	   slot: "0,2",
     			 		        	   iconClass: "mstrmojo-ArchitectListIcon edtbtn",
     			 		        	   title: "edit", 
     			 		        	   onclick: function editlayer(evt){
     					    	           //edit current layer
     							       }
     			 		           } 
     	 		        	   ]
     	 		           },
     	 		           {
     	 		        	   scriptClass: "mstrmojo.Pulldown",     	 		        	   
     	 		        	   cssText: "background:transparent;",
     	 		        	   alias: "layer",
     	 		        	   itemIdField: 'rgt',
     	 		        	   slot: "0,1",     	 		        	  
     	 		        	   items: [],
     	 		        	   postCreate: function() {
     	 		        	       this.items= _getLayers();
     	 		               },
     	 		               onvalueChange: function(){
     	 		            	   if (this._super){
     	 		            		   this._super();
     	 		            	   };
     	 		            	   _invokeLayerChange(this.value);     	 		            	
     	 		            	   this.parent.parent.display();
     	 		               }	   
     	 		           }
     	 		    ]
     		    },    		               
     		    {   
     		    	scriptClass: "mstrmojo.Box",
     		    	alias: "tablesection",
     		    	cssText:"overflow:auto; position:absolute; width:100%;",
     		    	children: [
		                {
		                	scriptClass: "mstrmojo.Box", 
		            	    alias: "tlist",
		            	    cssClass: "mstrmojo-Architect-MultiTable-List",
		            	    dropZone: true,
			               /* allowDrop: function allowDrop(ctxt){
			    			    if (ctxt.src && ctxt.src.data && ctxt.src.data.st && ctxt.src.data.st==8405 ) {
			    		            return true;
			    			    }
			    			    return false;
			    		       },  */
		            	    allowDrop: function allowDrop(c){
				                	  if(c.sn==='ProjTableTree'&&c.tp===26){
				    		                  return true;
				    			    }
				    			    return false;
				    		       },
			    		    ondrop: function(c){ 	           	        
			    	 	           var mdl = mstrmojo.all.ArchModel;
			    	 	           //get current layer
			    	 	           var clayer = mdl.getLayer(mdl.currentlayerID); 	           
			    	 	           //var pos=c.tgt.pos, data=c.src.data,cpos=$D.position(this.domNode);
			    	 	          var pos={x:c.clientX, y:c.clientY}, data=c.src.data,cpos=$D.position(this.domNode);
			    	 	           var table=clayer.tables.tid={name:data.n,tag:data.tag,pos:pos,AttrInfos:data.AttrInfos};
			    	 	           //var h = parseInt(this.height) - 2*_MARGIN ;
			    	 	           var tbls=this.children;
			    	 	           var idx=tbls?tbls.length:0;
			    	 	           var DBTable=new mstrmojo.Architect.DBTable({
			    	 	        	    cssText: "position:absolute;width:180px;",
			    	 					left:180*idx+18+'px',
			    	 					top:'0px',
			    	 					title: data.n,
			    	 					visible:true,
			    	 					noCheckBox: true,	         
			    	 			        onClose: function(){
			    	 			        }
			    	 		        });
			    	 	              DBTable.container=this.parent;
			    	 	        	  this.addChildren([DBTable]);		
			    	 	        	  for (var aid in table.AttrInfos) {
			    	 	        		 var att = mdl.getAttribute(aid);
			    						 if (att) {
			    							DBTable.addRow(att.name,0,"12","");
			    						 } 
			    	 	        	  }
			    		 	      // this.parent.subheader.layer.set("value", mdl.currentlayerID);    //set the layer id, required initially
			    		 	    }
		                }
	                ]
     		    }
            ],
             
            display: function(evt){ 	           	        
 	           var tlist = this.tablesection.tlist;
 	           var h = parseInt(this.height) - 2*_MARGIN - this.subheader.domNode.offsetHeight ; 
 	           var mdl = mstrmojo.all.ArchModel;
 	           //get current layer
 	           var clayer = mdl.getLayer(mdl.currentlayerID); 	           
 	           var tables =clayer.tables, idx=0, table;
 	           for (var t in tables) {
 	        	  table = tables[t]; 
 	        	  var DBTable=new mstrmojo.Architect.DBTable({
						cssText: "position:relative;width:180px;height:"+h+"px;margin-top:"+ _MARGIN + "px;margin-left:18px;",
						title: table.name,
						visible:true,
						slot:   "0," + idx.toString() ,
					}); 
 	        	  idx++;
 	        	  tlist.addChildren(DBTable);		
 	        	  for (var aid in table.AttrInfos) {
 	        		 var att = mdl.getAttribute(aid);
					 if (att) {
						DBTable.addRow(att.name,0,"12","");
					 } 
 	        	  }
 	           }			     
	 	       tlist.cols = idx;	 	     
	 	       tlist.render();	
	 	       
	 	       this.subheader.layer.set("value", mdl.currentlayerID);    //set the layer id, required initially
	 	    },   
          
        	postCreate: function (){
        	    var mdl = mstrmojo.all.ArchModel;
        	    if (mdl) {
        	        mdl.attachEventListener("currentlayerID", this.id, "layerChange"); 
        	        mdl.attachEventListener("tblsToAddChange", this.id, "refresh");
        	    }	
        	},
        	
        	layerChange : function (evt){
        		var current = evt.value;        	   		
        		this.subheader.layer.set("value", current);        		
        	},
        	
        	refresh : function (evt){
        		//only have to refresh default layer when adding new objects
        		var mdl = mstrmojo.all.ArchModel;
        		if (mdl.currentlayerID == "xDefaultx") {
        			//only if we are in multi-table view
        			if (this.domNode && mdl.isMultiView) {
        			    this.display();
        			}
        		}
        	},
        	
        	onsizeChange: function(evt){
        		    var tst=this.domNode.style,
        		    	h=evt.value.h,
        		    	w=evt.value.w;
  	                tst.height=h;
	                this.tablesection.domNode.style.height=parseInt(h,10)-this.subheader.domNode.clientHeight+'px';
	                tst.width=w;
        	}
        	
        	
        });

    
})();