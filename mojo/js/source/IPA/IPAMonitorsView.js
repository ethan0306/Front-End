(function(){

    mstrmojo.requiresCls("mstrmojo.Container");
    
    /**
     * The widget for the Landing page IPA.
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     */
    mstrmojo.IPA.IPAMonitorsView = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.DocLayout.prototype
         */
        {
            scriptClass: "mstrmojo.IPA.IPAMonitorsView",
            
            markupString: '<div id="{@id}" class="mstrmojo-IPAMonitorsPage {@cssClass}" style="{@cssText}">' +
                              '<div class="mstrmojo-IPAMonitorsPage-Alerts"></div>' +
                              '<div class="mstrmojo-IPAMonitorsPage-MonitorCharts"></div>' +
							  '<div class="mstrmojo-IPAMonitorsPage-JobsGrid"></div>' +
                          '</div>',
                          
            markupSlots: {
                Alerts: function(){ return this.domNode.firstChild; },
                MonitorChart: function(){ return this.domNode.childNodes[1]; },
				JobsGrid: function(){ return this.domNode.lastChild; }
            }
            
        }
    );
    
})();