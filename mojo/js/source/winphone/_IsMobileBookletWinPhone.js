(function() {
    
    mstrmojo.requiresCls("mstrmojo.Obj");
    
    var $DOM = mstrmojo.dom;

    /**
     * Removes every children of a node
     * 
     * @param {Object} node. Node whose children will be removed 
     * 
     * @private
     */    
    function removeChildren(node) {

        if ( node.hasChildNodes() )
        {
            while ( node.childNodes.length >= 1 )
            {
                node.removeChild( node.firstChild );       
            } 
        }       
    }
    
    /**
     * Animate page using fx animation package
     * 
     * @param {Integer} cmdCode Indicates whether we are showing a new view, or hiding the current view (turning backward).
     * @param {Integer} duration Duration of the animation
     * 
     * @private
     */      
    function animatePageTurn(cmdCode, duration) {               

        var pages = this.getPages.call(this),
        curVisPage = pages.current,
        nextVisPage = pages.next,
        me = this;

        var curPageOffset = 0, 
        nextPageOffset = 0,
        nextPageInit = 0, 
        nextPageEnd = 0,
        nextOffsetWidth = nextVisPage.offsetWidth;          

        if(cmdCode.an === this.ANIMATION_FORWARD) {
            nextPageEnd = -nextOffsetWidth;
            nextPageOffset = nextOffsetWidth;

        } else {

            nextPageInit = -nextOffsetWidth;
            curPageOffset = nextOffsetWidth;
        }                

        $DOM.translate(curVisPage, curPageOffset, 0, 0);
        $DOM.translate(nextVisPage, nextPageOffset, 0, 0);

        animatePage(nextPageInit, nextPageEnd, duration, {
            target: me.sliderNode,
            duration: duration,
            onEnd: function(){
                me.finishTurn.call(me);
            },                
            preStart : function(){
                this.target.style.overflowY = "hidden";
            }
        });                  
    }
      
    function animatePage(start, stop, duration, props) {
        var cfg = mstrmojo.hash.copy(props, {
            props: {
                left: { 
                    isStyle: true, 
                    start: start, 
                    stop: stop, 
                    suffix: 'px', 
                    ease: mstrmojo.ease.linear
                }
            },
            duration: duration
        });

        (new mstrmojo.fx.AnimateProp(cfg)).play();     
    }       

    /**
     * A mixin to add common Mobile Booklet animation functionality
     */
    mstrmojo.winphone._IsMobileBookletWinPhone = {
            
        _mixinName: 'mstrmojo.winphone._IsMobileBookletWinPhone',
        
        cleanCurrentPage: function cleanCurrentPage(page) {
            removeChildren(page);
        },  
        
        /**
         * Turn to next page
         */
        turnPageAnimation: function turnPageAnimation(position, command, className) {                
            
            animatePageTurn.call(this, command, 500);
        },  
        
        /**
         * <p>Empty hook</p>
         */           
        moveNextView: function moveNextView(nextVisPage, sliderPosition) {                

        },        
        
        /**
         * Hides the application level wait message.
         */
        hideMessage: function hideMessage() {

            var msgNode = this.msg.domNode;

            (new mstrmojo.fx.FadeOut({
                target: msgNode
            })).play();
            mstrmojo.css.parkAfterFade({
                target: msgNode
            });
        }
    };
}());