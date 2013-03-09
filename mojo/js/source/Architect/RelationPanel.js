(function () {
    mstrmojo.requiresCls(  
        "mstrmojo.HBox",
        "mstrmojo.Box",       
        "mstrmojo.Table",
        "mstrmojo.WidgetList",
        "mstrmojo.WidgetListMapperHoriz"
     );
    
    var _C = mstrmojo.css;
   
    var _MARGIN = 20;
    
    /************************Private methods*********************************/

    mstrmojo.Architect.RelationPanel = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null,        
        // instance members
        {
            scriptClass: "mstrmojo.Architect.RelationPanel",
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
         
            chunks:0,
            dropZone: true,
            
            allowDrop: function allowDrop(ctxt){
                return true;
            },
            
            active: false,
            /*
            onTouchDrop: function onTouchDrop(src,x,y) {            	
            	var rlist = this.content.list;
	  	        var h = parseInt(this.height) - 2*_MARGIN - this.subheader.domNode.offsetHeight ;
	  	        var t = new mstrmojo.Architect.RelationBlock({  	        		  
				   cssText: "position:absolute;width:180px;margin-top:"+ _MARGIN + "px;margin-left:18px;",	
				   left:180*this.chunks+'px',
				   top:'-10px',
				   visible:true,
				   title:'Relation_'+this.chunks,
				   maxheight: h,
				   p:this
	        	});
  	        	t.addChunks([[{icon: 12, lvl: 0, n: src.text}]]);
  	        	this.chunks++;
	 	 	    rlist.items.add([t]);	 	 	   
	 	 	    rlist.set("width", (180* rlist.items.length + 40) + 'px');
	 	 	    rlist.fill();
            },*/		
            
	        ondrop: function ondrop(c) {
	        	var d=c.src.data;
            	if(!d) return;
            	var rlist = this.content.list;
	  	        var h = parseInt(this.height) - 2*_MARGIN - this.subheader.domNode.offsetHeight ;
	            var t = new mstrmojo.Architect.RelationBlock({  	        		  
					   cssText: "position:absolute;width:180px;margin-top:"+ _MARGIN + "px;margin-left:18px;",	
					   left:180*this.chunks+'px',
					   top:'-10px',
					   visible:true,
					   title:'Relation_'+this.chunks,
					   maxheight: h,
					   p:this
  	        	});  
	            var n = d.n? d.n:d.AL,
	                did= d.did;
	                
  	        	t.addChunks([[{icon: 12, lvl: 0, n: n, did: did, rw:t}]]); 
  	        	 this.chunks++;
	 	 	    rlist.items.add([t]);	 	 	   
	 	 	    rlist.set("width", (180* rlist.items.length + 40) + 'px');
	 	 	    rlist.fill();
	        },	
	   
	        
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
        	 		        scriptClass: "mstrmojo.Label",
        	 		        slot: "0,0",
        	 		        cssClass: "mstrmojo-Architect-Panel-header subheader",
        	 		        text: "Parent-Child Relationship",
        	 		    },
        	 		    {
        	 		        scriptClass: "mstrmojo.Table",
        	 		        slot: "0,1",
        	 		        rows: 1,
        	 		        cssText: "float:right;",
          		        	cols: 2,
          		        	layout: [{cells: [{cssText: "height: 20px; width:20px;"}, {cssText: "height: 20px; width:20px;"}]}],
        	 		            children: [
        						{
        						    scriptClass: "mstrmojo.Button",
        						    slot: "0,0",
        						    iconClass: "mstrmojo-ArchitectListIcon addbtn",
        						    title: "add",  
        						},
        						{
        			 		        scriptClass: "mstrmojo.Button",
        			 		        slot: "0,1",
        			 		        iconClass: "mstrmojo-ArchitectListIcon edtbtn",
        			 		        title: "edit",  
        			 		    } 
        	 		        ]
        	 		    }     
        	 		]
        		},
        		{
        			scriptClass: "mstrmojo.Box",
        			alias: "content",
        			cssText: "overflow:auto",
        			children: [
        			    {
        			    	scriptClass: "mstrmojo.Label",
        			    	cssText: "margin-left: 15px;",
        			    	text: "Drag and drop attributes to build relationships..."
        			    },
        			    {        			  
		                	scriptClass: "mstrmojo.WidgetListHoriz", 
		            	    alias: "list",		            	   
		            	    makeObservable: true,
		            	    cssClass: "mstrmojo-Relation-Panel-content",
		            	    itemFunction: function (item, idx, widget) {
        			    	    return item;
        			        },
        			        postBuildRendering:function(){
        			          		if(this._super) this._super();
        			          		this.domNode.style.height=parseInt(this.parent.domNode.style.height)-20+'px';
        			            }
        			    }        		             
        			]
        		}
        		
	        ],
	        
	        clearContents:function(c){
	        	this.content.list.lenght=0;
	        	this.content.list.render();
	        },
	        
	        addRelation: function (c) {
            	this.content.list.addChildren([c]);
            	//this.content.list.render();            	
            },
            
           onheightChange: function hchange(){ 
          		if(this.domNode){
          			var h=parseInt(this.height,10),
          			    c=this.content;
          			this.domNode.style.height=h-35+'px';
          			c.domNode.style.height=h-40+'px';
          			c.list.domNode.style.height=h-55+'px';
          		}
          	},
          	
          	postBuildRendering:function(){
          		if(this._super) this._super();
          		var h=parseInt(this.height,10);
          			this.domNode.style.height=h-35+'px';
          	},
         
            layerChange: function layerChange(){ 	           	        
  	           var rlist = this.content.list;
  	           var h = parseInt(this.height) - 2*_MARGIN - this.subheader.domNode.offsetHeight ; 
  	           return; 	        
  	       
 	 	    }  
 	 	 	        
        });

})();