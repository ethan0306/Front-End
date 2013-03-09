(function () {

    mstrmojo.requiresCls("mstrmojo.WizardSlide", "mstrmojo.Label", "mstrmojo.IPA.PluginTreeBrowser");

    mstrmojo.requiresDescs(1843, 8590, 8591, 8592, 8593, 8594, 8595, 8608);    

    /**
     *
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.IPA.SCCfgSelectionSlide = mstrmojo.declare(

    //superclass
    mstrmojo.WizardSlide,

    //mixin
    null,

    /**
     * @lends mstrmojo.IPA.SCCfgSelectionSlide.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.SCCfgSelectionSlide",
        name: "selectionSlide",
        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "noConfigLabel",
            text: mstrmojo.desc(8590, "Select one or more System Check(s) from the same machine and product to configure"),
            cssClass: "mstrmojo-SCCfgWizard-SlideDescription"
        }, {
            scriptClass: "mstrmojo.Popup",
            alias: "legend",
            cssClass: "mstrmojo-Menu",
            shadowNodeCssClass: "",
            contentNodeCssClass: "mstrmojo-Menu-content",
            visible:true,
            children: [{
                scriptClass: "mstrmojo.Label",
                text: mstrmojo.desc(8591, "System Checks:"),
                cssText: "padding:5px;text-decoration:underline;font-weight:bold;"
            }, {
                scriptClass: "mstrmojo.Widget",
                markupString: '<div id="{@id}" style="margin:3px">' + 
                    '<span class="" style="margin:3px;padding-left:5px;padding-right:5px;background-color:black"></span>' + 
                    '<span>' + mstrmojo.desc(1843, "Configured") + '</span>' + '</div>'
            }, {
                scriptClass: "mstrmojo.Widget",
                markupString: '<div id="{@id}" style="margin:3px">' + 
                    '<span class="" style="margin:3px;padding-left:5px;padding-right:5px;background-color:red"></span>' + 
                    '<span>' + mstrmojo.desc(8592, "Not Configured") + '</span>' + '</div>'
            }, {
                scriptClass: "mstrmojo.Widget",
                markupString: '<div id="{@id}" style="padding-bottom:5px;margin:3px">' + 
                    '<span class="" style="margin:3px;padding-left:5px;padding-right:5px;background-color:grey"></span>' + 
                    '<span>' + mstrmojo.desc(8593, "Not Configurable") + '</span>' + '</div>'
            }]
        },{
            scriptClass: "mstrmojo.IPA.PluginTreeBrowser",
            cssClass: "mstrmojo-IPA-SystemCheckTree",
            kiType: 33,
            multiSelect: false,
            selectionAcrossBranch: false,
            alias: "tree",
            showAll: false,
            handlenodechange: function () {
                var selection = this.tree.getTotalSelections();
                this.parent.wizard.buttons.nextButton.set("enabled", (selection.length > 0));
            },
            handleGetContentFailure: function (res) {
                if (res) {
                    this.set("visible", false);
                    this.parent.legend.set("visible", false);
                    this.parent.errorLabel.set("text", res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                    this.parent.errorLabel.set("visible", true);
                }
            }
        }, {   
            scriptClass: "mstrmojo.CheckBox",
            alias: "shareCheckBox",
            label: mstrmojo.desc(8594, "Show non-configurable system checks"),
            onclick: function () {
                this.parent.tree.set("showAll",this.isChecked());
            }
        },{
            scriptClass: "mstrmojo.Label",
            alias: "errorLabel",
            cssClass: "mstrmojo-alert-errorlabel",
            visible: false
        }],

        displayingSlide: function () {
            this.tree.clearTreeSelect();
            this.tree.refresh();
        },

        aboutToGoNext: function () {
            var selection = this.tree.getTotalSelections();
            if (selection.length > 0) {
                this.wizard.model.set("selection", selection);
                this.wizard.model.set("cfgs", new Array(selection.length));
                return true;
            }
            throw new Error(mstrmojo.desc(8595, "No system check is selected!"));
        },

        getNextSlide: function () {
            this.wizard.model.set("kiIndex", 0);
            return "consolidationSlide";
        },

        getPreviousSlide: function () {
            return "";
        },

        onvisibleChange: function () {
            if (this.visible) {
                this.wizard.buttons.nextButton.set("visible", true);
                this.wizard.buttons.nextButton.set("text", mstrmojo.desc(8608, "Configure"));
                this.wizard.buttons.backButton.set("visible", false);
                this.wizard.buttons.cancelButton.set("visible", false);
                this.wizard.titleBar.restart.set("visible", false);
                this.wizard.titleBar.restartIcon.set("visible", false);
                this.tree.handlenodechange();
            }
        }
    });

}());