(function($) {
	jQuery.extend( jQuery.easing,
	{
		easeBounce: function (x, t, b, c, d) {
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
	});

	var bannerQty, bannerWidth;
  
	$(document).bind("dragstart", function() {
    	 	return false;
	});

	function css3Move(ele, x, y, z){
		x=x?x:0;
		y=y?y:0;
		z=z?z:0;
		ele.css("-webkit-transform", "translate3d(" + x + "px,"+y+"px," +z+"px)");
		ele.css("-moz-transform", "translate3d(" + x + "px,"+y+"px," +z+"px)");
		ele.css("-o-transform", "translate3d(" + x + "px,"+y+"px," +z+"px)");
   	 	ele.css("transform", "translate3d(" + + x + "px,"+y+"px," +z+"px)");			
	}

	$(document).live('pageinit',function(evt){
	  

	//-------------------------- History Back Button -------------------------- (Shared)
	$('.historyBack').bind('click', function(){
		history.back();
            	return false;
	});

	//-------------------------- Banner Swipe Effect	-------------------------- (Home - Category List Page)
	if (evt.target.id === 'accessList')  {

	    bannerQty = $(".bannerWrapper .wrapper").length;
	    bannerWidth = $(".bannerWrapper .wrapper").width;
           var bannerIndex = 0;
		   
		   var start, movable, tap, el = $("#accessList .bannerWrapper");
		  
                 el.bind('touchstart', function(e) {
                      movable=true;
                      start = {
				x: e.originalEvent.targetTouches[0].pageX,
				y: e.originalEvent.targetTouches[0].pageY,
				time: (new Date()).getTime()
	   	   	 };
                 }).bind ("touchmove", function(e) {
	               var diffX = (e.originalEvent.changedTouches[0].pageX) - start.x;
	               if ((bannerIndex === 0 && diffX>0 ) || (bannerIndex === bannerQty - 1 && diffX < 0)) {
				     movable=false;
				 if(Math.abs(diffX)>bannerWidth*0.3){
					return;
				 }
			 }
		        diffX=diffX-bannerIndex*bannerWidth;
		        css3Move(el,diffX);
				 $('#accessList .glassDiv .dot').removeClass('selected');
				 $('#accessList .glassDiv .dot:nth(' + bannerIndex + ')').addClass('selected');
                    }).bind("touchend", function(e) {
			 var diffX = (e.originalEvent.changedTouches[0].pageX) - start.x,
			     diffY = (e.originalEvent.changedTouches[0].pageY) - start.y,
                              t = (new Date()).getTime()-start.time;
			 if(Math.abs(diffX) <5) return;
			 e.preventDefault();
			 if (movable) {
				  if (t < 500 && Math.abs(diffY)<50) { //swipe or tap event....
				     if (diffX < 0) {
						bannerIndex++;
					}else {
						bannerIndex--;
					}
				  }else {
					bannerIndex = bannerIndex - parseInt(diffX * 2 / bannerWidth, 10);
				  }
			  }
			    var mv = -bannerWidth * bannerIndex;
				css3Move(el,mv);
			  	$('#accessList .glassDiv .dot').removeClass('selected');
			  	$('#accessList .glassDiv .dot:nth(' + bannerIndex + ')').addClass('selected');
			  	$(".track3").text(-bannerWidth * bannerIndex);
				 	el.animate({
				 		left: '-30'
				 	}, 400);
				 	el.animate({
				 		left: '0'
				 	}, 1000, 'easeBounce');
                   });

      	
     	}

	//-------------------------- Banner Timer Slider -------------------------- (Home - Category List Page)
	if (evt.target.id === "accessList") {
		window.setInterval(function() {

			if( bannerIndex < 2 ){
				bannerIndex++;
			}else{
				bannerIndex = 0;
			}
			var mv = -bannerWidth * bannerIndex;
		    css3Move(el,mv);
			$('#accessList .glassDiv .dot').removeClass('selected');
			$('#accessList .glassDiv .dot:nth(' + bannerIndex + ')').addClass('selected');

		}, 10000);          

	}

	});
})(jQuery);
