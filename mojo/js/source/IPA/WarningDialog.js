(function() {

    mstrmojo.requiresCls("mstrmojo.Dialog");
    
    /**
     * Warning Dialog is a modal dialog that has title bar, a collection of buttons and can contain other controls within it.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.WarningDialog = mstrmojo.declare(

        mstrmojo.Dialog,

        null,
        
        /**
         * @lends mstrmojo.Dialog.prototype
         */
        {
            scriptClass: "mstrmojo.WarningDialog",
            
            markupString: '<div id="{@id}" class="mstrmojo-Dialog {@cssClass}">' +
                              '<div class="win mstrmojo-Editor" style="{@cssText}">' +
                                              '<div class="mstrmojo-Editor-titlebar"><div class="mstrmojo-Editor-title">{@title}</div></div>' +
                                              '<div class="mstrmojo-Editor-content"><img id="{@id}warningsign" src="{@warningImg}" style="position:relative;left:20px;top:10px;"></img></div>' + 
                                              '<div class="mstrmojo-Editor-buttons"></div>' +
                              '</div>' +                              
                              '<div class="mstrmojo-Editor-curtain"></div>' + 
                              '<div class="mstrmojo-Editor-tip"></div>' +
                          '</div>', 
            
           warningImg: '../style/mstr/images/msgWarning.gif',
        }
    );
        
})();