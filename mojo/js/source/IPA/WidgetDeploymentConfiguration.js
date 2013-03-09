(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css");
	mstrmojo.requiresDescs(5076,3993,8876,8877,8869,8870,8871,8872,8873,8874,8875);
	
	var description = mstrmojo.desc(5076) + " " + mstrmojo.desc(8876,"To download widgets visit the MicroStrategy Widgets Library available on the Technical Support portal at") + 
			" <a href='https://resource.microstrategy.com/support/' target = '_new'>https://resource.microstrategy.com/support</a>" + ", " +
			mstrmojo.desc(8877,"under Developer Resources.");

	//this is the web server

	mstrmojo.IPA.WidgetDeploymentConfiguration = mstrmojo.insert({
		scriptClass : "mstrmojo.Box",
		cssText : "height: 350px; width: 100%;position: relative;background: white;background-color: #FAFAFA;",
		id : "WidgetDeployment",
		selected : true,		
		n : "Widget Deployment",
		children : [{
			scriptClass : "mstrmojo.Box",
			cssText : "position: absolute; padding: 10px;width: 98%;",
			children : [
			//Description
			{
				scriptClass : "mstrmojo.Label",
				text : description,
				cssText : "padding-bottom: 20px;width:100%;text-align:justify;",
			},
			//Widget Configuration
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8869,"MicroStrategy Widget Configuration"),
				cssText : "font-weight: bold;padding-bottom:10px;"
			}, {
				scriptClass : "mstrmojo.HBox",
				cssText : "margin-left: 10px;",
				children : [{
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8870,"MicroStrategy  Widget SWF File Folder") +  "&nbsp",
				}, {
					scriptClass : "mstrmojo.TextBox",
					cssText : "width:300px",
					id:"WidgetSWFFolder"
				}]
			},{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(3993,'Example: ') + "C:\\GraphMatrixWidget-1.0.0.009\\Graph Matrix Widget\\",
				cssText : "position:relative;left:200px;"
			}, 
			
			//Deployment Configuration
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8871,"Deployment Configuration"),
				cssText : "font-weight: bold;padding-bottom:10px;padding-top:10px;margin-left: 10px;"
			},
			{
				scriptClass : "mstrmojo.HBox",
				cssText : "margin-left: 10px;",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:"WidgetWebCheck"
				}, {
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8872,"MicroStrategy Web (No Path Needed)"),
				}]

			}, {
				scriptClass : "mstrmojo.HBox",
				cssText : "margin-left: 10px;",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:"WidgetDesktopCheck"
				}, {
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8873,"MicroStrategy Desktop (Common Files Path)"),
					cssText : "width:300px",
				},{
					scriptClass : "mstrmojo.TextBox",
					cssText : "width:340px",
					id:"WidgetDesktopPath",
					
					bindings:{
						enabled:"mstrmojo.all.WidgetDesktopCheck.checked"
					}
				}]

			},{
				scriptClass : "mstrmojo.HBox",
				cssText : "margin-left: 10px;",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:"WidgetOfficeCheck"
				}, {
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8874,"MicroStrategy  Office (Web Services  Deployment Path)"),
					cssText : "width:300px",
				},{
					scriptClass : "mstrmojo.TextBox",
					cssText : "width:340px",
					id:"WidgetOfficePath",
					
					bindings:{
						enabled:"mstrmojo.all.WidgetOfficeCheck.checked"
					}
				}]

			},{
				scriptClass : "mstrmojo.HBox",
				cssText : "margin-left: 10px;",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:"WidgetNCSCheck"
				}, {
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8875,"MicroStrategy  Narrowcast Server (Delivery Engine Path)"),
					cssText : "width:300px",
				},{
					scriptClass : "mstrmojo.TextBox",
					cssText : "width:340px",
					id:"WidgetNCSPath",					
					
					bindings:{
						enabled:"mstrmojo.all.WidgetNCSCheck.checked"
					}
				}]

			}]
		}]

	});

})();
