(function () {
	
    mstrmojo.requiresCls(  
       "mstrmojo.Architect.MultiTablePanel",
       "mstrmojo.Architect.RelationPanel"
	);
    
    /************************Private methods*********************************/

    mstrmojo.Architect.MultiTableView = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.Architect.MultiTableView",            
        		   	    
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
            
            cssText: "border:0px; width:100%; height:100%;",            
            width: 0,
            height: 0,
            n: "System Hierarchy",
            layout:{top:0.5, btm:0.5},
            children: [
       	 		    {
       	 		        scriptClass: "mstrmojo.Architect.MultiTablePanel",
       	 		        cssText: "position:absolute;border:0px solid gray;background-color:white;",
       	 		        alias: "tables"
       	 		    },
       	 		    {
       	 		        scriptClass: "mstrmojo.Architect.RelationPanel",
       	 		        alias: "relations",
       	 		        active: true,
       	 		        cssText: "position:absolute;border:0px solid gray;background-color:white;",
       	 			    onsizeChange: function(evt){
       	 		    		var rst=this.domNode.style,
       	 		    			h=evt.value.h,
       	 		    			w=evt.value.w,
       	 		    			h2=parseInt(h,10)-20;
       	 		    		rst.height=h;
       	 		    		this.content.domNode.style.height=h2+'px';
       	 		    		this.content.list.domNode.style.height=h2-15+'px';
       	 		    		rst.width=w;
       	 		    		rst.top=parseInt(h,10)+130+'px';
       	                
       	 		    	},
       	 			postCreate: function (){
   	 		    			var mdl = mstrmojo.all.ArchModel;
   	 		    			if (mdl) {
   	 		    					mdl.attachEventListener("layerChange", this.id, "layerChange");
   	 		    				}	
   	 		    	} 
       	 		    }     
       	   ],
       	   
           postBuildRendering: function onRender(){
	           if (this._super){
            	   this._super();
	           }
	          var h=parseInt(this.parent.parent.height,10)-40,
                  w=this.parent.parent.width;
	              this.tables.set('size', {w:w, h:h*this.layout.top+'px'});
	              this.relations.set('size', {w:w, h:h*this.layout.btm+'px'});
           },
         onwidthChange:function(){
        	   if(this.hasRendered){
                   var h=parseInt(this.parent.parent.height,10)-40,
                       w=this.width;
                       this.tables.set('size', {w:w,  h:h*this.layout.top+'px'});
                       this.relations.set('size', {w:w, h:h*this.layout.btm+'px'});
        	   }
           },
         onheightChange:function(){
        	   if(this.hasRendered){
        		   var h=parseInt(this.parent.parent.height,10)-40,
                   w=this.width;
                   this.tables.set('size', {w:w, h:h*this.layout.top+'px'});
                   this.relations.set('size', {w:w, h:h*this.layout.btm+'px'});
           }
         }
    });

    
})();