(function(){

	mstrmojo.requiresCls("mstrmojo.Table","mstrmojo.Label");
	mstrmojo.requiresDescs(8656,8657,8658,1064,8659,8660);
	
    mstrmojo.IPA.IPACreateEnvHeader = mstrmojo.insert({
    	id: "IPACreateEnvHeader",
    	cssClass:"mstrmojo-IPACreateEnvHeaderTable",
		scriptClass:"mstrmojo.Table",
		rows:2,
		cols:1,
		children:[
			{
				scriptClass:"mstrmojo.Label",
				text:mstrmojo.desc(8656,"Create Environments"),
				cssClass:"mstrmojo-rightcolumn-label",
				slot:"0,0"
			},
			{
				scriptClass:"mstrmojo.Label",
				text: mstrmojo.desc(8657,"This is the area in which you create and edit your Environments. " +
						 "Connecting to the") + 
				      mstrmojo.desc(8658,"Master Health Agent").bold() + ", " + 
				      mstrmojo.desc(1064,"or")  + 
				      mstrmojo.desc(8659,"MHA").bold() + ", " + 
				      mstrmojo.desc(8660,"will build your Environment list " +
					 "automatically. You can also add additional environments manually, if they are not " +
					 "part of the MicroStrategy Health Center Topology. To add an environment manually, " +
					 "connect to an Intelligence Server through the Add Environments Manually in the " +
					 "Environment List."),	
				cssClass:"mstrmojo-informative-label",					
				slot:"1,0"
			}
		]
    });
})();