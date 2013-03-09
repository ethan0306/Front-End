(function(){

    mstrmojo.requiresCls("mstrmojo.Container");
    
    /**
     * The widget for the Landing page IPA.
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     */
    mstrmojo.IPA.IPAView = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.DocLayout.prototype
         */
        {
            scriptClass: "mstrmojo.IPA.IPAView",
            
            markupString: '<div id="{@id}" class="mstrmojo-IPALandingPage {@cssClass}" style="{@cssText}">' +
                              '<div class="mstrmojo-IPALandingPage-Alerts"></div>' +
                              '<div class="mstrmojo-IPALandingPage-LoginBox"></div>' +
                              '<div class="mstrmojo-IPALandingPage-Monitors"></div>' +
                              '<div class="mstrmojo-IPALandingPage-Environments"></div>' +
                          '</div>',
                          
            markupSlots: {
                Alerts: function(){ return this.domNode.firstChild; },
                LoginBox: function(){ return this.domNode.childNodes[1]; },
                Monitors: function(){ return this.domNode.childNodes[2]; },
                Environments: function(){ return this.domNode.lastChild; }
                
            }
            
        }
    );
    
})();