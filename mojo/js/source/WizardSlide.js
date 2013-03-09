(function () {

    mstrmojo.requiresCls("mstrmojo.Container", "mstrmojo.Wizard");

    /**
     *
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.WizardSlide = mstrmojo.declare(

    //superclass
    mstrmojo.Container,

    //mixin
    null,

    /**
     * @lends mstrmojo.WizardSlide.prototype
     */
    {
        scriptClass: "mstrmojo.WizardSlide",
        
	name: "",

        /**
         * mark string
         */
         markupString: '<div id="{@id}" class="mstrmojo-WizardSlide {@cssClass}">' + '<div></div>' + '</div>',

        /** 
         * mark slots
         */
        markupSlots: {

            /**
             * the container node for expand or collapse part
             */
            containerNode: function () {
                return this.domNode.firstChild;
            }
        },
        
	markupMethods: {
    	    onvisibleChange: function(){this.domNode.style.display = this.visible? 'block' : 'none';}
    	},   
        
        displayingSlide: function(){
        
        },
	
	aboutToGoNext: function(){
	
	},
	
	getNextSlide: function(){
	
	},
        
        getPreviousSlide: function() {
        
        }


    });

})();