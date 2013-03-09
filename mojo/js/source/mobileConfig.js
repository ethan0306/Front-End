/**
 * mobileconfig contains confList and editConfig tabs, and by render(), it can render all its children. 
 */
(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.Table",
            "mstrmojo.HBox",
            "mstrmojo.Label",
            "mstrmojo.Button",
            "mstrmojo.HBox",
            "mstrmojo.editConfig");
    
    //UI
    mstrmojo.mobileConfigView = mstrmojo.insert({
        scriptClass: "mstrmojo.Table",
        id: "mobileConfigView",
        placeholder: "mobileConfigView",
        cssText: "border: 1px solid #808080;width:100%;border-collapse: collapse;padding-left:5px",
        layout: [{ cssClass: "mstrPanelTitleBar",cells: [{}]}, 
                   {cells: [{}]}],
        children: [ {
            slot: "0,0",
            scriptClass: "mstrmojo.HBox",
            cssText: "width:100%",
            children: [ 
            {
                scriptClass: "mstrmojo.Label",
                cssClass: "mstrPanelTitle",
                text: mstrmojo.desc(7764)         //"Mobile Configuration"
            }, 
            {
                scriptClass: "mstrmojo.Widget",
                markupString: '<a href="{@helpRef}" style="float:right" target="_new"><img class="mstrIcon-btn mstrIcon-btnHelp" src="../images/1ptrans.gif"></img></a>',
                title: mstrmojo.desc(1143),        //"Help",
                helpRef: "../help/MobileServer/WebHelp/Lang_1033/mobileserver.htm#Configuring_MicroStrategy_Mobile.htm"
            } 
            ]
        }, 
        {
            slot: "1,0",
            scriptClass: "mstrmojo.HBox",
            children: [mstrmojo.all.editConfig]
        }    
        ]
    }).render();


})();