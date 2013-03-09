(function(){

    mstrmojo.requiresCls("mstrmojo.VBox", "mstrmojo.Label","mstrmojo.IPA.EnvironmentModel","mstrmojo.IPA.EnvironmentController",
			"mstrmojo.IPA.IPAConfigNavigationTable","mstrmojo.IPA.IPACreateEnvHeader",
			"mstrmojo.IPA.IPAConnectionTable","mstrmojo.IPA.IPABuildEnvironments",
			"mstrmojo.IPA.IPAAddEnvironmentManually","mstrmojo.IPA.IPAConfigEnvironmentGrid");
    
	var environmentController = mstrmojo.insert({
	  	id: "environmentController",
	  	scriptClass: "mstrmojo.IPA.EnvironmentController"
	 });
	  
	environmentController.model = mstrmojo.insert({
	   	id: "environmentModel",
	   	scriptClass: "mstrmojo.IPA.EnvironmentModel",
	   	configEnvGridSuccess : function()
	   	{			
			mstrmojo.all.IPAOverlayBox.set('visible',false);
			//we want to add the create new environment as well
			var items = [];
			if (mstrmojo.all.environmentModel.model.environments){
				items = mstrmojo.all.environmentModel.model.environments.slice(0);
			}
		
			mstrmojo.all.IPAConfigEnvironmentGrid.set("items",items);			

			if(items.length > 0)
				 {
					if(mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex <= 0)
						mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',0);
					mstrmojo.all.IPAConfigEnvironmentGrid.selectedItem = mstrmojo.all.IPAConfigEnvironmentGrid.items[mstrmojo.all.IPAConfigEnvironmentGrid.selectedIndex];
				 }
			 	mstrmojo.all.IPAConfigNavigationTable.children[6].set('enabled',true);
//			else
//				 mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',-1);		
			
			if(items.length == 0){
				mstrmojo.all.IPAConfigEnvironmentGrid.set('visible',false);
				mstrmojo.all.IPABuildEnvironments.set('visible',false);		
				mstrmojo.all.NoEnvLabel.set('visible',true);
				mstrmojo.all.IPAConfigNavigationTable.children[6].set('enabled',false);
			}
			mstrmojo.all.IPAAddEnvironmentManually.set('visible',false);			
	   	},
	   	configEnvGridFailure : function()
	   	{	   		
	   		var items = [];			
			mstrmojo.all.IPAConfigEnvironmentGrid.set("items",items);
			if(items.length > 0)
				mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',0);
			else
			    mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',-1);						
	   	}
	
	 });
	
	environmentController.getEnvironmentList(null,mstrmojo.all.environmentModel.configEnvGridSuccess,mstrmojo.all.environmentModel.configEnvGridFailure
//			function(){
//		mstrmojo.all.IPAOverlayBox.set('visible',false);
//	//we want to add the create new environment as well
//	var items = [];
//	if (mstrmojo.all.environmentModel.model.environments){
//	items = mstrmojo.all.environmentModel.model.environments.slice(0);
//	}
//	
//	mstrmojo.all.IPAConfigEnvironmentGrid.set("items",items);
//	
//// 	items.push({id:-1,name:"Create New Environment"});
//	(items.length > 0)?  mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',0):
//		mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',-1);
//	
//	if(items.length == 0){
//		mstrmojo.all.IPAConfigEnvironmentGrid.set('visible',false);
//		mstrmojo.all.IPABuildEnvironments.set('visible',false);		
//		mstrmojo.all.NoEnvLabel.set('visible',true);
//	}
//	
//	// mstrmojo.all.IPAConfigWebServersGrid.set('items', mstrmojo.all.environmentModel.model.webServers);
//	// mstrmojo.all.IPAConfigMobileServersGrid.set('items', mstrmojo.all.environmentModel.model.mobileServers);	
//	mstrmojo.all.IPAAddEnvironmentManually.set('visible',false);
//	
//	},
//	function(res){
//		var items = [];
//		//items.push({id:-1,name:"Create New Environment"});
//		mstrmojo.all.IPAConfigEnvironmentGrid.set("items",items);
//		if(items.length > 0)
//			mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',0);
//		else
//		    mstrmojo.all.IPAConfigEnvironmentGrid.set('selectedIndex',-1);
//	}

	,function(){mstrmojo.all.IPAOverlayBox.set('visible',false);});    
	
    mstrmojo.IPA.IPAConfigEnvironments = mstrmojo.insert({
        id: "IPAConfigEnvironments",
        scriptClass: "mstrmojo.VBox",
        cssClass: "mstrmojo-rightcolumn-vbox",
        children: [mstrmojo.all.IPACreateEnvHeader,                   
                   mstrmojo.all.IPAConnectionTable,
                   mstrmojo.all.IPAConfigEnvironmentGrid,
                   mstrmojo.all.IPABuildEnvironments],
        visible: false
    });
})();
