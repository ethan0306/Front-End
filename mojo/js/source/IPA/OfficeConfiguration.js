(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css");
	mstrmojo.requiresDescs(3846,110,5574,8867,8868);
	
	//this is the web server

	mstrmojo.IPA.OfficeConfiguration = mstrmojo.insert({
		scriptClass : "mstrmojo.Box",
		cssText : "height: 350px; width: 100%;position: relative;background: white;background-color: #FAFAFA;",
		alias : "OfficeConfiguration",
		id:"OfficeConfiguration",
		selected : true,
		n : "MicroStrategy Office",
		children : [{
			scriptClass : "mstrmojo.Box",
			cssText : "position: absolute; padding: 10px;width: 100%;",
			children : [
			//Installation Configuration
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8867,"Installation Configuration"),
				cssText : "font-weight: bold;"
			}, {
				scriptClass : "mstrmojo.HBox",
				children : [{
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8868,"MicroStrategy Office Installation Path") + "&nbsp"
				}, {
					scriptClass : "mstrmojo.TextBox",
					cssText : "width:300px",
					id:"OfficeInstllationPath"
				},{
					scriptClass : "mstrmojo.Button",
					cssClass : "mstrmojo-add-button",
					text : mstrmojo.desc(110,"Go"),
					onclick:function(){
//						var a  = window.location.href;
//						a = a.replace("\/servlet\/",mstrmojo.all.OfficeInstllationPath.value);
//						a = a.replace("mstrIPA?evt=3166","");
						window.location = mstrmojo.all.OfficeInstllationPath.value;
					}
		}]

			}, {
				scriptClass : "mstrmojo.HBox",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:"OfficeAppendLocalePath"
				}, {
					scriptClass : "mstrmojo.Label",					
					text : mstrmojo.desc(5574,"Automatically append locale-specific path.")
				}]

			}, {
				scriptClass : "mstrmojo.HBox",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:"OfficeLinkToInstallation"
				}, {
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(3846,"Show link to installation page for all users on the Projects and Login pages.")
				}]

			}]
		}]

	});

})();
