(function () {

    mstrmojo.requiresCls("mstrmojo.Model");

    mstrmojo.IPA.ConfigModel = mstrmojo.declare(
    // superclass
    mstrmojo.Model,

    // mixins
    null,

    // instance members
    {
        scriptClass: "mstrmojo.IPA.ConfigModel",
        
        refreshMHAConnection: false,
        
        systemCheckConfigurationValue: {}
        
    });
}());