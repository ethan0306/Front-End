(function () {
	
    mstrmojo.requiresCls(  
	 "mstrmojo.WH.WHPanel",
	 "mstrmojo.QB.QBDBTableTree"
	);
    
   
    /************************Private methods*********************************/

    mstrmojo.QB.WHTablePanel = mstrmojo.declare(
        // superclass
    	mstrmojo.WH.WHPanel,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.QB.WHTablePanel",            
        	
            dbt:{
            	scriptClass:"mstrmojo.QB.QBDBTableTree",
		        alias: "DBTableTree",
	        	id:"DBTableTree"
            } 			 
        	
    });

    
})();