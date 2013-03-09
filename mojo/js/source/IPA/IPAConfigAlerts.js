(function () {

	mstrmojo.requiresCls("mstrmojo.Box", "mstrmojo.Label", "mstrmojo.Wizard", "mstrmojo.IPA.SCCfgSelectionSlide", "mstrmojo.IPA.SCCfgConsolidationSlide", "mstrmojo.IPA.SCCfgConfigurationSlide", "mstrmojo.IPA.SCCfgSummarySlide");

	mstrmojo.requiresDescs(1143, 8583, 8584, 8585);

	mstrmojo.IPA.IPAConfigAlerts = mstrmojo.declare(
			// superclass
			mstrmojo.Box,

			//mixins
			null,

			{
				scriptClass: "mstrmojo.IPA.IPAConfigAlerts",
				configModel: null,
				children: [{
					scriptClass: "mstrmojo.Label",
					cssClass: "mstrmojo-rightcolumn-label",
					alias: "errorPanel",
					text: mstrmojo.desc(8583, "Configure Alerts"),
					visible: false
				}, {
					scriptClass: "mstrmojo.Wizard",
					cssClass: "comAlertConfigWiz",
					titleBar: 
					{
						scriptClass: "mstrmojo.Container",
						cssClass: "mstrmojo-SCConfigWiz-title",
						alias: "titleBar",
						markupString: '<table id="{@id}" class="{@cssClass}" style="{@cssText}"><tbody><tr>' +
						'<td class=""></td>'+
						'<td class=""></td>'+
						'<td class=""></td>'+
						'<td class=""></td>'+
						'<td class=""></td>'+
						'</tr></tbody></table>',
						markupSlots: {
							titleNode: function () {
								return this.domNode.firstChild.firstChild.firstChild;
							},
							restartIconNode: function () {
								return this.domNode.firstChild.firstChild.childNodes[1];
							},
							restartNode: function () {
								return this.domNode.firstChild.firstChild.childNodes[2];
							},
							helpIconNode: function () {
								return this.domNode.firstChild.firstChild.childNodes[3];
							},
							helpNode: function () {
								return this.domNode.firstChild.firstChild.childNodes[4];
							}
						},
						children: [
						           {
						        	   scriptClass: "mstrmojo.Label",
						        	   alias: "title",
						        	   text: mstrmojo.desc(8584, "System Check Configuration Wizard"),
						        	   cssClass: "mstrmojo-SCConfigWiz-titleText",
						        	   slot: "titleNode"
						           }, 
						           {
						        	   scriptClass: "mstrmojo.Label",
						        	   alias: "restartIcon",
						        	   cssClass: "mstrmojo-SCConfigWiz-button RESTART",
						        	   slot: "restartIconNode",
						        	   onclick: function()
						        	   {
						        		   this.parent.parent.onCancelButtonClick();
						        	   }
						           }, 
						           {
						        	   scriptClass: "mstrmojo.Label",
						        	   alias: "restart",
						        	   text: mstrmojo.desc(8585, "Start Again"),
						        	   cssClass: "mstrmojo-SCConfigWiz-label",
						        	   slot: "restartNode",
						        	   onclick: function()
						        	   {
						        		   this.parent.parent.onCancelButtonClick();
						        	   }
						           },
						           {
						        	   scriptClass: "mstrmojo.Label",
						        	   alias: "helpIcon",
						        	   cssClass: "mstrmojo-SCConfigWiz-button HELP",
						        	   slot: "helpIconNode",
						        	   onclick: function()
						        	   {
						        		   window.open("../help/WebAdmin/WebHelp/Lang_1033/MicroStrategy_Web_Administrator_Help.htm");
						        	   }
						           }, 
						           {
						        	   scriptClass: "mstrmojo.Label",
						        	   alias: "help",
						        	   text: mstrmojo.desc(1143, "Help"),
						        	   cssClass: "mstrmojo-SCConfigWiz-label",
						        	   slot: "helpNode",
						        	   onclick: function()
						        	   {
						        		   window.open("../help/WebAdmin/WebHelp/Lang_1033/MicroStrategy_Web_Administrator_Help.htm");
						        	   }
						           }]

					},
					alias: "wizardPanel",
					preBuildRendering: function () {

						this.addSlide(new mstrmojo.IPA.SCCfgSelectionSlide());
						this.addSlide(new mstrmojo.IPA.SCCfgConsolidationSlide());
						this.addSlide(new mstrmojo.IPA.SCCfgConfigurationSlide());
						this.addSlide(new mstrmojo.IPA.SCCfgSummarySlide());

						this.set("startingSlide", "selectionSlide");
						this.showSlide("selectionSlide");

						// Call the super.
						if (this._super) {
							return this._super();
						} else {
							return true;
						}                
					}
				}]
			});

}());