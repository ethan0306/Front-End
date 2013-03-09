(function(){

	mstrmojo.requiresCls("mstrmojo.Table","mstrmojo.Label","mstrmojo.Button","mstrmojo.TextBox",
			"mstrmojo.IPA.IPAConnectMHA","mstrmojo.IPA.IPAAddEnvironmentManually");
	mstrmojo.requiresDescs(8945);
    mstrmojo.IPA.IPAConnectionTable = mstrmojo.insert({
    	id: "IPAConnectionTable",
		scriptClass: "mstrmojo.VBox",		
		children: [mstrmojo.all.IPAConnectMHA,
		           mstrmojo.all.IPAAddEnvironmentManually,
		           {			
	    		   		scriptClass:"mstrmojo.Label",
	    		   		id:"NoEnvLabel",
	    		   		cssClass:"mstrmojo-NoEnvLabel",
	    		   		text:mstrmojo.desc(8945,"No environments exist.  " +
	    		   				"Please add environments manually."),
	    		   		visible:false
		           }
		]
    });
})();