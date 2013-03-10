(function(){
    mstrmojo.requiresCls(
    		"mstrmojo.Editor",
    		"mstrmojo.Label", 
    		"mstrmojo.WidgetListMapper"
    		);


    /**
	 * <p>
	 * Widget that represents a DB Table
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Editor
	 */
    mstrmojo.Architect.TablePreview = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins
    		null,
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.Architect.TablePreview",
	  	  		cssClass: "mstrmojo-Architect-TablePreview",
	  	  		tid:'',
		 		children:[
		 		    {
		 		        scriptClass: "mstrmojo.DataGrid",
		 		        alias: "dataview",
				 		cssClass: 'mstrmojo-Architect-TablePreviewGrid',
				 		cssText: "position:relative;background-color:white; border:0px solid #C6C6C6; cursor:pointer;",
	                    itemDisplayField: 20,
				        dropZone: true,
				       // items:6,
				 		columns:[] 	          	         	
			 		}
		 	    ],
		 		  
 	            postBuildRendering: function onRender(){
  	            	 if (this._super){
 	            	      this._super();
  	            	 }
  	            	 var mdl= mstrmojo.all.ArchModel;
 	                 mdl.attachEventListener("SelTableIDChange",this.id, "populateEditor");
 	                // mdl.attachEventListener("ShowPreviewData",this.id, "populateEditor"); 
  	             },
 	        	    
 	             
	             /**
				  * @populate the editor
				 */
	             populateEditor: function(evt){
	            	 var  mdl=mstrmojo.all.ArchModel,
	            	      tid=mdl.SelTableID,
	            	      me=this,
	            	 	  st=this.domNode.style;
	            	 var cb = {
	              	       success: function(res){
	              	    	 me.tid=tid;
	            		     grd = me.dataview;	 
	            		     grd.items=res.length;
	            		     grd.columns=[];
	            		     if (res==""){
	            		    	 grd.render();	   	   	        	      
	  	   	        	         me.postBuildRendering();
	  	   	        	         return;
	            		     }	 
	            		     var rows=res[0].length;;
	            		     var table=[];
	            		     for (var i=0; i<rows;i++){
	            		    	 table[i]=[];
	            		    	 for (var lCol=1; lCol < res.length+1; lCol++)
	                          	   table[i][lCol]=res[lCol-1][i];
	            		     }
	            		    
	   	        	 	     for (var lCol=1; lCol < res.length+1; lCol++)
	   	        	 	 	 {
	   	        	 		 	
	   	        	 		 grd.columns[lCol-1]={	 		          	         	   
	   	        	 	 						dataField:lCol, 
	   	        	 	 						headerText: res[lCol-1][0], 
	   	        	 	 						colCss: 'uidCol'
	   	        	 	 						};	
	   	        	 	   }    
	   	        	 	   table.shift();
	   	        	       grd.items=table;
	   	        	       grd.render();
	               		   },
	               		failure: function(res){
	               			 
	               			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	               		   }
	              	   };
	              	  
	                   mdl.getTableSampleData(tid,cb);
   	        	 }    			
   		}
	    
	    );
})();