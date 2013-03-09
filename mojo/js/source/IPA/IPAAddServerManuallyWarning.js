(function(){

	mstrmojo.requiresCls("mstrmojo.Table","mstrmojo.Label","mstrmojo.IPA.IPAAddServerManually");
	mstrmojo.requiresDescs(8648,8942,8943,8944);
    mstrmojo.IPA.IPAAddServerManuallyWarning = mstrmojo.insert({
    	id: "IPAAddServerManuallyWarning",
		scriptClass: "mstrmojo.VBox",		
		children: [		           
		            {  	              
  	                	scriptClass:"mstrmojo.Label",
  	                	cssClass:"mstrmojo-NoEnvLabel",
  	                	id:"BlankAddNamesValidLabel",
  	                	text:mstrmojo.desc(8648,"Blank names are not allowed") + "!",
  	                	visible:false
  	                }, 
  	                {  	       
  	                	scriptClass:"mstrmojo.Label",
  	                	cssClass:"mstrmojo-NoEnvLabel",
  	                	id:"DuplicateServerLabel",
  	                	text:mstrmojo.desc(8942,"Server already present")+"!",
  	                	visible:false
  	                },
  	                {  	                  
  	                	scriptClass:"mstrmojo.Label",
  	                	cssClass:"mstrmojo-NoEnvLabel",
  	                	id:"ServerPortNotValidLabel",
  	                	text:mstrmojo.desc(8943,"Invalid port number")+"!",
  	                	visible:false
  	                },
  	                {
  	                	slot:"4,1",
  	                	scriptClass:"mstrmojo.Label",
  	                	cssClass:"mstrmojo-NoEnvLabel",
  	                	cssText: "color:green;",
  	                	id:"ServerUpdated",
  	                	text:mstrmojo.desc(8944,"Server Updated Successfully"),
  	                	visible:false
  	                },
		]
    });
})();