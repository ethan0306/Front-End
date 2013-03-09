(function () {

    mstrmojo.requiresCls("mstrmojo.WizardSlide", "mstrmojo.Label", "mstrmojo.WidgetList", "mstrmojo.IPA.SCConfigInfo");
    mstrmojo.requiresDescs(1020, 8473, 8596);
    /**
     *
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.IPA.SCCfgSummarySlide = mstrmojo.declare(

    //superclass
    mstrmojo.WizardSlide,

    //mixin
    null,

    /**
     * @lends mstrmojo.IPA.SCCfgSummarySlide.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.SCCfgSummarySlide",
	name: "summarySlide",
        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "summaryLabel",
            text: "<B>" + mstrmojo.desc(1020, "Summary") + "</B>:" + mstrmojo.desc(8596, "The following system checks have been configured"),
            cssClass: "mstrmojo-SCCfgWizard-SlideDescription"
        }, {
            scriptClass: "mstrmojo.WidgetList",
            alias: "summarylist",
            itemFunction: function (item, idx, widget) {
                return mstrmojo.insert({
                    scriptClass: "mstrmojo.IPA.SCConfigInfo",
                    cfg: item,
                    idx: idx,
                    parent: widget
                });
            }
        }],

        displayingSlide: function () {
            this.summarylist.set("items", this.wizard.model.cfgs);
        },

        aboutToGoNext: function () {
           this.wizard.model.systemCheckStartingConfigValue = {};
           return true;
        },

        getNextSlide: function () {
            return "selectionSlide";
        },

        getPreviousSlide: function () {
            return "configurationSlide";
        },

        onvisibleChange: function() {
            if (this.visible) {
                this.wizard.buttons.nextButton.set("visible", true);
                this.wizard.buttons.nextButton.set("text", mstrmojo.desc(8473, "Done"));
                this.wizard.buttons.backButton.set("visible", false);
                this.wizard.buttons.cancelButton.set("visible", false);
                this.wizard.titleBar.restart.set("visible", true);
                this.wizard.titleBar.restartIcon.set("visible", true);
            }
        }
    });

}());