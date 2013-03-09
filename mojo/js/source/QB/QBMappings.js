(function () {
    mstrmojo.requiresCls(           
        "mstrmojo.Box",
        "mstrmojo.QB.QBPreview"
     );
    
    var _C = mstrmojo.css;
   
    var _MARGIN = 20;
  
    
    /************************Private methods*********************************/

    mstrmojo.QB.QBMappings = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null, 
        // instance members
        {
            scriptClass: "mstrmojo.QB.QBMappings",
              
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
            
            cssText: "overflow-x:hidden;overflow-y:auto;margin-right:1px;",
            
            width: 0,
            height: 0,
            
            dropZone: false,
                       
            active: false,
	        
            children: [
                   {
                     scriptClass: "mstrmojo.QB.QBPreview",
                     alias: 'content',
                     columns: [],
                     cssText: "width:100%",                     
                     postCreate: function(){
                	     this.model = mstrmojo.all.QBuilderModel;
            		     mstrmojo.all.QBuilderModel.attachEventListener("dataPreview",this.id, "populatePreview");
                     }
	                     
                }	
            ],         
         	         	
            onheightChange: function(e){
            	if (this.domNode){
            	    this.domNode.style.height = e.value;	
            	}	
         	//	this.content.set("height",  parseInt(e.value)+'px');         	
            }
                        
        });

})();