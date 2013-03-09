(function(){

    mstrmojo.requiresCls("mstrmojo.hash");
    var _H = mstrmojo.hash;
    
    mstrmojo.ConditionPopup = mstrmojo.registry.ref({
        id: "mstrConditionPopup",
        slot: "popupNode",
        scriptClass: "mstrmojo.Popup",
        contentNodeCssClass: "",    // mstrmojo-PopupWalk",
        locksHover: true,
        onOpen: function(){
            this.walk.set("model", _H.clone(this.model));
        },
        children: [
            {
                scriptClass: "mstrmojo.ConditionWalk",
                cssClass: "mstrmojo-PopupWalk",
                alias: "walk",
                cssText: "height:200px",
                targets: null,
                ets: null
            }
        ]
    });

})();