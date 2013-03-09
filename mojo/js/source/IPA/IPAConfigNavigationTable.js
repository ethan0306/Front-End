(function () {

    mstrmojo.requiresCls("mstrmojo.Table", "mstrmojo.Label", "mstrmojo.TextBox", "mstrmojo.Button");
    mstrmojo.requiresDescs(8583, 8597, 8611, 8612, 8613, 8614, 8615);

    mstrmojo.IPA.IPAConfigNavigationTable = mstrmojo.declare(
    // superclass
    mstrmojo.Table,
    //mixins
    null, {
        scriptClass: "mstrmojo.IPA.IPAConfigNavigationTable",
        cssClass: "mstrmojo-leftcolumn-table",
        cellspacing: 0,
        cellpadding: 0,
        rows: 8,
        cols: 1,
        configModel: null,
        children: [{
            slot: "0,0",
            scriptClass: "mstrmojo.Label",
            cssClass: "mstrmojo-IPA-label",
            text: mstrmojo.desc(8610, "Configure Settings for Cloud Operations Manager")
        }, {
            slot: "1,0",
            scriptClass: "mstrmojo.Label",
            cssClass: "mstrmojo-left-unpad-labels",
            text: mstrmojo.desc(8611, "Topology Configuration")
        }, {
            slot: "2,0",
            scriptClass: "mstrmojo.Button",
            cssClass: "mstrmojo-left-pad-button",
            alias: "envbutton",
            text: mstrmojo.desc(8612, "Configure Environments"),
            onclick: function () {
                this.parent.configModel.set("navTableSelectionIndex", 0);
            },
            bindings: {
                selected: function () {
                    return (this.parent.configModel.navTableSelectionIndex === 0);
                }
            }
        }, {
            slot: "3,0",
            scriptClass: "mstrmojo.Button",
            cssClass: "mstrmojo-left-pad-button",
            alias: "alertsbutton",
            text: mstrmojo.desc(8583, "Configure Alerts"),
            onclick: function () {
                this.parent.configModel.set("navTableSelectionIndex", 1);
            },
            bindings: {
                selected: function () {
                    return (this.parent.configModel.navTableSelectionIndex === 1);
                }
            }
        }, {
            slot: "4,0",
            scriptClass: "mstrmojo.Label",
            cssClass: "mstrmojo-left-unpad-labels",
            text: mstrmojo.desc(8613, "Server Configuration")
        }, {
            slot: "5,0",
            scriptClass: "mstrmojo.Button",
            cssClass: "mstrmojo-left-pad-button",
            text: mstrmojo.desc(8615, "Create Configuration Template"),
            onclick: function () {
                this.parent.configModel.set("navTableSelectionIndex", 3);
            },
            bindings: {
                selected: function () {
                    return (this.parent.configModel.navTableSelectionIndex === 3);
                }
            }
        }, {
            slot: "6,0",
            scriptClass: "mstrmojo.Button",
            cssClass: "mstrmojo-left-pad-button",
            text: mstrmojo.desc(8614, "Apply Templates to Servers"),
            onclick: function () {
        		mstrmojo.all.EnvironmentTreeBrowser.unrender();
        		mstrmojo.all.EnvironmentTreeBrowser.render();
        		var event = {};
				event.src = {};			    	    				
				event.name = "fakeChange";
				event.src.selectedItem = mstrmojo.all.EnvironmentTreeBrowser.selectionParentNode.selectedItem;			    	    				
				mstrmojo.all.EnvironmentTreeBrowser.onnodechange(event);
                this.parent.configModel.set("navTableSelectionIndex", 4);
            },
            bindings: {
                selected: function () {
                    return (this.parent.configModel.navTableSelectionIndex === 4);
                }
            }
        }, {
            slot: "7,0",
            scriptClass: "mstrmojo.Button",
            cssClass: "mstrmojo-left-pad-button",
            text: mstrmojo.desc(8597, "Select Alert Counters"),
            onclick: function () {
                this.parent.configModel.set("navTableSelectionIndex", 2);
            },
            bindings: {
                selected: function () {
                    return (this.parent.configModel.navTableSelectionIndex === 2);
                }
            }
        }] //end of left table children (left column of the page)
    });

}());