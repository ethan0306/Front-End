(function() {

    mstrmojo.requiresCls("mstrmojo.Popup");
    
    /**
     * Window is a Container that can hold other controls.
     * 
     * @class
     * @extends mstrmojo.Popup
     */
    mstrmojo.Window = mstrmojo.declare(

        mstrmojo.Popup,

        null,
        
        /**
         * @lends mstrmojo.Window.prototype
         */
        {
            scriptClass: "mstrmojo.Window",
            
            showEffect: 'mstrmojo.fx.FadeIn',

            hideEffect: 'mstrmojo.fx.FadeOut',
            
            markupString:     '<div id="{@id}" class="mstrmojo-Window {@cssClass}">' + 
                                '<div class="edge t"></div>' +
                                '<div class="cnt">' +
                                    '<div>' +
                                        '<div></div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="edge b"></div>' +
                                '<div class="c tl"></div><div class="c tr"></div><div class="c br"></div><div class="c bl"></div>' +
                            '</div>',
            
            markupSlots: {
                containerNode: function(){ return this.domNode.childNodes[1].firstChild.firstChild; }
			},
        
        	onOpen: function() {
                // Center the popup within it's parent.
                var dn = this.domNode,
                    pn = dn.parentNode,
                    t = Math.round((pn.clientHeight / 2) - (dn.offsetHeight / 2)) + 'px',
                    l = Math.round((pn.clientWidth / 2) - (dn.offsetWidth / 2)) + 'px';
                
                this.set('top', t);
                this.set('left', l);
            }
        

        }
    );
        
})();