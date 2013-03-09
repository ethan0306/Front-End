(function () {

    mstrmojo.requiresCls("mstrmojo.Box", "mstrmojo.Label", "mstrmojo.IPA.CounterList");
    mstrmojo.requiresDescs(8597, 8598);

    mstrmojo.IPA.SelectAlertCounters = mstrmojo.declare(
    // superclass
    mstrmojo.Box,

    //mixins
    null,

    {
        scriptClass: "mstrmojo.IPA.SelectAlertCounters",
        configModel: null,
        children: [{
            scriptClass: "mstrmojo.Label",
            cssClass: "mstrmojo-rightcolumn-label",
            alias: "desc",
            text: mstrmojo.desc(8597, "Select Alerts Counters")
        },{
            scriptClass: "mstrmojo.Label",
            cssClass: "mstrmojo-informative-label",
            alias: "desc",
            text: mstrmojo.desc(8598, "Here you can view all alert counters and their status.  You can also toggle the status of the counters.")
        }, {
            scriptClass: "mstrmojo.IPA.CounterList",
            alias: "counterList",
            handleGetContentFailure: function(res) {
                this.parent.errorLabel.set("text", res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                this.parent.errorLabel.set("visible", true);
            }
        },{
            scriptClass: "mstrmojo.Label",
            cssClass: "mstrmojo-alert-errorlabel",
            alias: "errorLabel",
            visible: false
        }]
    });

}());