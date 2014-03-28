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

var bannerQty, bannerWidth, viewStatus = "listView";
  

$(document).bind("dragstart", function() {
     return false;
});


function resizeBanner(){
 	bannerWidth = $( window ).width();
		$( "#home .bannerWrapper" ).css( "width", bannerWidth * bannerQty );
        	$( "#home .bannerWrapper .wrapper" ).css( "width", bannerWidth );
		$( "#home .bannerWrapper img" ).css( "width", bannerWidth );	
		$( "#home .marketBanner .glassDiv" ).css( "width", bannerWidth );
}

function css3Move(ele, x, y, z){
	x=x?x:0;
	y=y?y:0;
	z=z?z:0;
	ele.css("-webkit-transform", "translate3d(" + x + "px,"+y+"px," +z+"px)");
	ele.css("-moz-transform", "translate3d(" + x + "px,"+y+"px," +z+"px)");
	ele.css("-o-transform", "translate3d(" + x + "px,"+y+"px," +z+"px)");
    ele.css("transform", "translate3d(" + + x + "px,"+y+"px," +z+"px)");			
}
 
$(window).bind('orientationchange', function(ev) {
      	if ($.mobile.activePage.attr('id') === 'home')  {
            	resizeBanner();
      	}
});

$('#viewCart').live('pageshow', function(event, ui){
		$.extend($.fn, {
			delegate: function(selector, types, data, fn){
				return this.on(types, selector, data, fn);
			}
		});
	  $('#viewCart .prodQty').trigger('create');
});

$(document).live('pageinit',function(evt){
	   if (evt.target.id  === 'ship_info') {
		   	    $.mobile.loadingMessage="This process may take a few seconds";
		     	$.mobile.loadingMessageTextVisible=true;
		    }
		   else{
		   	$.mobile.loadingMessage="Loading...";
		  	$.mobile.loadingMessageTextVisible=false;
		   }
	
	//Use different delegate function for form validation page and other pages.. GL
	 if (evt.target.id === 'credit_info' || evt.target.id === 'ship_info' || evt.target.id === 'login') {
		//overide delegate method when in a form page...
		$.extend($.fn, {
			delegate: function(type, delegate, handler, fn){
				return this.bind(type, function(event){
					var target = $(event.target);
					if (target.is(delegate)) {
						return handler.apply(target, arguments);
					}
				});
			},
			triggerEvent: function(type, target){
				return this.triggerHandler(type, [$.event.fix({
					type: type,
					target: target
				})]);
			}
		});
	}
	else {
		$.extend($.fn, {
			delegate: function(selector, types, data, fn){
				return this.on(types, selector, data, fn);
			}
		});
	}
	
	//If device can be detected, change the close button url back to manufacturer list
	if(evt.target.id === "deviceItemList" || evt.target.id === "deviceItemList2"){
		    $("[data-icon='delete']").bind("click",function(evt){
				  evt.preventDefault();
				  window.location="/mas/deviceChange.jsp";
			});
	   }	

	//-------------------------- Auto Suggest Panel -------------------------- (Shared)
	if (evt.target.id === "home" || evt.target.id === "accessDetail" || evt.target.id === "accessList") {
		var searchInput = $("#" + evt.target.id + " .content .ui-input-search input");
		if (endeca_autosuggest_value) {
			endeca_autosuggest_value.pageTargetId = evt.target.id;
			$("#" + evt.target.id + " #searchText")[0].setAttribute( "autocomplete", "off" );
			$("#" + evt.target.id + " #searchText").endecaSearchSuggest(endeca_autosuggest_value);
		}

		searchInput.bind('click', function(){
			if(!$("#" + evt.target.id).hasClass('searchPanelShowing')){
				$("#" + evt.target.id).addClass('searchPanelShowing');
			}
		});

		searchInput.bind('blur', function(){
			if(searchInput.val() === ''){
				$("#" + evt.target.id).removeClass('searchPanelShowing');
				if( evt.target.id == "home" || evt.target.id == "accessDetail" ){
					$('#' + evt.target.id + ' .search').toggleClass('On');
				}
			}
		});
	}

	//-------------------------- History Back Button -------------------------- (Shared)
	$('.historyBack').bind('click', function(){
		history.back();
            	return false;
	});
	
	//-------------------------- Search Bar Enabler	-------------------------- 
	if( evt.target.id == "home" || evt.target.id == "accessDetail" ){
		$("#" + evt.target.id + " .searchIcon").bind('click', function(){
			$('#' + evt.target.id + ' .search').toggleClass('On');
			$('#' + evt.target.id).addClass('searchPanelShowing');
		});
	}

	//--------------------------- Mini Cart Buttons --------------------------- (Shared)
   	if ($('.openMiniCart').length > 0) {
	   	$('.openMiniCart').bind('click', function(){
	   		$('#miniCart .ui-btn').removeClass('ui-btn-active');
		});
   	
		$('#miniCart .cancel').bind('click', function(){
			$(this).closest('.ui-popup').popup('close');
		});
  	}

	//-------------------------- Recommendation Swipe Effect  -------------------------- 
if (evt.target.id === 'accessDetail')  {
	    recommendQty = $(".recommendation .itemsWrapper .items").length, recommendWidth = 150;
        var re = $(".recommendation .itemsWrapper"), width=recommendWidth * recommendQty, movable=width-$(window).width(); 
	    if (recommendQty > 0) {
			$(".recommendation .itemsWrapper").css("width", width);
			if (movable>0) {
				var reStart, spos = 0, pos, bouncable;
				re.bind('touchstart', function(e){
					e.preventDefault();
					reStart = {
						x: e.originalEvent.targetTouches[0].pageX
					//y: e.originalEvent.targetTouches[0].pageY,
					//time: (new Date()).getTime()
					};
				}).bind("touchmove", function(e){
					e.preventDefault();
					bouncable = false;
					pos = 0;
					var diffX = (e.originalEvent.changedTouches[0].pageX) - reStart.x;
					pos = spos + diffX;
					//$(".txt3").text(bouncable);
					if (pos > 0 || pos < -movable) {
						bouncable = true;
					}
				
					if (pos > 50 || pos < -movable-80) {
						return;
					}
					css3Move(re,pos);
				}).bind("touchend", function(e){
					e.preventDefault();
					spos = pos;
					if (bouncable) {
						if (pos > 0) {
							spos = 0;
							css3Move(re,spos);
							re.animate({
								left: Math.min(pos - 20, 30)
							}, 400, 'easeBounce');
							re.animate({
								left: '0'
							}, 1000, 'easeBounce');
						}
						else {
							spos=-movable;
							css3Move(re,spos);
							re.animate({
								left: Math.max(pos+20-spos, -60)
							}, 400, 'easeBounce');
							re.animate({
								left: 0
							}, 1000, 'easeBounce');
						}
					}
				});
			}
		}
		else {
			re.css("display", "none");
		}
     }


	//-------------------------- Banner Swipe Effect	-------------------------- (Home - Category List Page)
	if (evt.target.id === 'home')  {
		prodName="product name";
	    bannerQty = $(".bannerWrapper .wrapper").length;
           resizeBanner();
           var bannerIndex = 0, dotHtml = "";

	    for( var dotNum = 0; dotNum < bannerQty; dotNum++ ) {
		   console.log(dotNum);
		   var dotState = (dotNum == 0) ? " selected" : "";
		   dotHtml += "<div class='dot" + dotState + "'></div>";
	    }
	    $('#home .marketBanner .glassDiv').html("<div class='dots'>" + dotHtml + "</div>");
		   
		   var start, movable, tap, el = $("#home .bannerWrapper");
		  
                 el.bind('touchstart', function(e) {
                     // e.preventDefault();
                      movable=true;
                      start = {
				x: e.originalEvent.targetTouches[0].pageX,
				y: e.originalEvent.targetTouches[0].pageY,
				time: (new Date()).getTime()
	   	   	 };
                 }).bind ("touchmove", function(e) {
	               e.preventDefault();
	               var diffX = (e.originalEvent.changedTouches[0].pageX) - start.x;
	               if ((bannerIndex === 0 && diffX>0 ) || (bannerIndex === bannerQty - 1 && diffX < 0)) {
				     movable=false;
				 if(Math.abs(diffX)>bannerWidth*0.3){
					return;
				 }
			 }
		        diffX=diffX-bannerIndex*bannerWidth;
		        css3Move(el,diffX);
				 $('#home .glassDiv .dot').removeClass('selected');
				 $('#home .glassDiv .dot:nth(' + bannerIndex + ')').addClass('selected');
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
			  	$('#home .glassDiv .dot').removeClass('selected');
			  	$('#home .glassDiv .dot:nth(' + bannerIndex + ')').addClass('selected');
			  	$(".track3").text(-bannerWidth * bannerIndex);
				 	el.animate({
				 		left: '-30'
				 	}, 400);
				 	el.animate({
				 		left: '0'
				 	}, 1000, 'easeBounce');
                   });
				   
	//-------------------------- Banner Timer Slider -------------------------- (Home - Category List Page)
      	window.setInterval(function() {
			if( bannerIndex < bannerQty-1 ){
				bannerIndex++;
			}else{
				bannerIndex = 0;
			}
			var mv = -bannerWidth * bannerIndex;
    		el.css("-webkit-transition","-webkit-transform 0.2s linear");
			el.css("-moz-transition","-moz-transform 0.2s linear");
			el.css("-o-transition","-o-transform 0.2s linear");
			el.css("transition","transform 0.2s linear");
		    css3Move(el,mv);
			$('#home .glassDiv .dot').removeClass('selected');
			$('#home .glassDiv .dot:nth(' + bannerIndex + ')').addClass('selected');

		}, 10000);  
      	
     }

	
	//-------------------------- Add Item to Cart -------------------------- (Accessories Details Page)
  	/*if (evt.target.id === "accessDetail") {
  		$('.addToCart').click(function(evt){
  			var num = $('.number_in_cart'), i = parseInt(num.text(), 10) + parseInt($('select.prodQty').val(), 10);
  			num.text(i);
  			num.show();
	   		$("[data-position='fixed']").fixedtoolbar('show');
  		});
  	}*/
	
	 if (evt.target.id === "user_opt"){
          Sitecatalyst.action = "Login";
          Sitecatalyst.sendLinkUpdate("Login");
		  Sitecatalyst.customer.loggedin=true;
	  }
	  
	  if(evt.target.id === "BTAorder_info"){
	  	 Sitecatalyst.sendLinkUpdate("Bill to Verizon Account");
	  }
	
	 if (evt.target.id === "customerReview") {
		   function loadReviews(page){
		   	        if (acd) {
						$BV.ui("rr", "show_reviews", {
							productId: "acc_" + acd
						});
					}
        	} 
        	loadReviews(1);
	 }

	if(viewStatus == 'listView'){
		$('#accessList .content').addClass('listView');
		$('#accessList .content').removeClass('gridView');
	}else{
		$('#accessList .content').addClass('gridView');
		$('#accessList .content').removeClass('listView');
	}
	
	//-------------------------- Grid View -------------------------- (Accessory List Page)
	if (evt.target.id === "accessList") {
		Sitecatalyst.categorySelected="category";
		$('#accessList .switchView').click(function(evt){
			$('#accessList .content').toggleClass('listView');
			$('#accessList .content').toggleClass('gridView');
			$('#accessList .switchView .ui-icon').toggleClass('ui-icon-grid');
			$('#accessList .switchView .ui-icon').toggleClass('ui-icon-bars');
			
			if($('#accessList .content').hasClass('listView')){
				viewStatus = 'listView';
			}else{
				viewStatus = 'gridView';
			}
			
		});
	}
         

	//-------------------------- Edit Shopping Cart -------------------------- (Shopping Cart Page)  
   	if (evt.target.id === "viewCart") {
           Sitecatalyst.customer.products=[];
		   var items=$('#viewCart .cartItem');
		   if (items.size() < 1 ) { 
			$('#viewCart .content').addClass('empty'); 
		   }
		   else{
		   	 items.each(function(i,ele){
			 	var p;
			 	Sitecatalyst.customer.addProduct(p);
			 });
		   }
		   

		    items.bind('swiperight', function(e){
			e.preventDefault();
			
			$('#viewCart .removeCheckbox').removeAttr('checked');
			$('#viewCart .removeButton').addClass('swipeOut');
	
			var index = $('#viewCart.ui-page-active .cartItem').index(this);

			$('#viewCart .removeCheckbox:nth(' + index + ')').attr('checked','checked');
			
			$('#viewCart .removeButton:nth(' + index + ')').addClass('swipeIn');
			$('#viewCart .removeButton:nth(' + index + ')').removeClass('swipeOut');
		
		   });

		   items.bind('swipeleft', function(e){
			e.preventDefault();
			
			var index = $('#viewCart.ui-page-active .cartItem').index(this);
			$('#viewCart .removeCheckbox:nth(' + index + ')').removeAttr('checked');

			$('#viewCart .removeButton:nth(' + index + ')').addClass('swipeOut');
			$('#viewCart .removeButton:nth(' + index + ')').removeClass('swipeIn');

		   });


		   $('#viewCart .onEditList').bind('click', function(){
		   	var editControl = $('#viewCart .content');
		   	if (editControl.hasClass('uneditLists')) {
		   		editControl.removeClass('uneditLists').addClass('editLists');
		   		  	
				$('#viewCart .count').toggleClass('On');
				$("#viewCart .editButton").toggleClass('onEdit');

				$('#viewCart .removeCheckbox').removeAttr('checked');
				$('#viewCart .removeButton').addClass('swipeOut');
		
		   	}	   				   	
		   });

		   $('#viewCart .cancelButton').bind('click', function(){

				var editControl = $('#viewCart .content');

				editControl.removeClass('editLists').addClass('uneditLists');
		   		$("#viewCart .updateButton").addClass('ui-disabled');
				$('#viewCart .cartItem').removeClass("on").addClass("off");
				$('#viewCart .count').toggleClass('On');		
				$("#viewCart .editButton").toggleClass('onEdit');
		   	
		   });

		   $('#viewCart .prodQty').change(function(){

			var index = $('#viewCart.ui-page-active .ui-select').index($(this).parent());

			$('#viewCart .updateCheckbox:nth(' + index + ')').attr('checked','checked');
			console.log(index);

			console.log($('#viewCart .updateCheckbox'));
			$('#viewCart .updateButton').removeClass('ui-disabled');
		   });
   	}	
	Sitecatalyst.sendPageUpdate(evt.target.id);
	//-------------------------- xxxxxxxxxxxxxxxxxxxxxxx --------------------------
});
})(jQuery);
