(function () {
	
	mstrmojo.requiresCls("mstrmojo.fx");
	
	/**
	 * do animation for expend or collapse
	 * @private 
	 */
	function _animateVertically (iTarget, iStart, iStop, iHeightEnd, iDuration, iOverflow) {
    	var _ease = mstrmojo.ease.sin;
	    (new mstrmojo.fx.AnimateProp({
            target: iTarget,
            props: {
                  height: { isStyle: true, start: iStart, stop: iStop, suffix: 'px', ease: _ease }
            },
            preStart: function() {
            	iTarget.style.overflow = 'hidden'; 
            },
            onEnd: function() {
            	iTarget.style.height =  iHeightEnd;
            	iTarget.style.overflow = iOverflow; 
            },

            duration: iDuration
        })).play();
    }
	
	/**
	 * 
	 * @class
	 * @public 
	 */
	mstrmojo._Collapsible = 
	{
		
	    /**
	     * expand down 
	     * 
	     * @param target a dom node that be able to collapse or expand
	     */
		animate: false,
		
		expandDown: function ( target ){
			
			target.style.visibility = 'hidden'; 
    		target.style.height = 'auto'; 
    		
    		target.style.visibility = 'visible';
    		
    		if (this.animate){
    			var _offsetHeight = target.offsetHeight;
    			_animateVertically(target, 0, _offsetHeight, 'auto', 300,'visible');
    		}
    		else{
    			target.style.height =  'auto';
    			target.style.overflow = 'visible'; 
    		}
		},
	
		/**
		 * collapse up
		 * 
		 * @param target a dom node that be able to collapse or expand
		 */
		collapseUp: function (target ){
			
			if (this.animate){
				var _offsetHeight = target.offsetHeight; 
				_animateVertically(target, _offsetHeight, 0, '0px', 300,'auto'); 
			}
			else{
    			target.style.height =  '0px';
    			target.style.overflow = 'auto'; 
    		}
    		
		}
	};
})();