$.validator.addMethod("phone", function(phone_number, element) {
    phone_number = phone_number.replace(/\s+/g, "");
        return this.optional(element) || phone_number.length > 9 &&
                phone_number.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
}, "Please specify a valid phone number");


$.validator.addMethod("postalcode", function(postalcode, element) {
	return this.optional(element) || postalcode.match(/(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXYabceghjklmnpstvxy]{1}\d{1}[A-Za-z]{1} ?\d{1}[A-Za-z]{1}\d{1})$/);
}, "Please specify a valid postal/zip code");

function supports_session_storage() {
  try {
    return 'sessionStorage' in window && window['sessionStorage'] !== null;
  } catch(e){
    return false;
  }
}

var support_sessionStorage=supports_session_storage();

 var cache=function(form){
            if(!support_sessionStorage) return;
		 	if (form.id === "log_as_guest") {
				var guest = $(form).find("#_Email").val().trim();
				sessionStorage["currentGuest"] = guest;
				if (!sessionStorage[guest]) {
					sessionStorage.setItem(guest, JSON.stringify({
						"_Email": guest
					}));
				}
			}
			else {
				var cguest = sessionStorage["currentGuest"];
				if (sessionStorage[cguest]) {
					obj = JSON.parse(sessionStorage[cguest]);
					$(form).find("input").each(function(){
						if (this.id) {
							obj[this.id] = this.value.trim();
						}
					    });
					 $(form).find("select").each(function(){
						if (this.id) {
							obj[this.id] = $(this).val().trim();
						}
					    });
					sessionStorage.setItem(cguest, JSON.stringify(obj));
				}
			}
    },
	
	loadCache=function(page){
		//loading cached form element.
		if(!support_sessionStorage) return;
		var cguest = sessionStorage["currentGuest"];
		if (sessionStorage[cguest]) {
			obj = JSON.parse(sessionStorage[cguest]);
			page.find("input").each(function(){
				if (this.id && obj[this.id] && !this.value) {
					this.value = obj[this.id];
				}
			});
			page.find("select").each(function(){
						if (this.id&&obj[this.id]) {
							$(this).val(obj[this.id]).selectmenu('refresh');;
						}
					    });;
		}
		
	},
 
     chkEmpty=function(u,s){
 	    var empty = false;
			 		u.each(function(){
			 			if ($(this).val() == '') {
			 				empty = true;
			 			}
			 		});
			 		if (empty) {
			 			s.button('disable');
			 			s.buttonMarkup({
			 				theme: 'c'
			 			}); // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
						}
						else {
							s.buttonMarkup({
								theme: 'd'
							});
							s.button('enable');// updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
						}
     },
	enbaleForm=function(form,tgt){
 	   var s = form.find('.button'),
	       u=form.find('.TextBox');
		  if (!tgt) {
					s.button('disable');
					s.buttonMarkup({
						theme: 'c'
					});
					u.val('').textinput('disable').next().remove().end().closest('.val_row').removeClass('error').removeClass('success');
					form.disabled=true;
				}
		 else{
		 	form.disabled=false;
		 	u.textinput('enable');
			tgt.focus();
		 }		
    },
    activeForm = function(form){
			 	var u = form.find('.TextBox'), s = form.find('.button');
			 	u.keyup(function(){
					chkEmpty(u,s);
				});
				form.tap(function(evt){
					var tgt=evt.target,
					    tn=tgt.className;
					    if(tn.indexOf("login-field")<0&&tn.indexOf('TextBox')<0&&!!form.disabled) return;
						var input=$(tgt).find('input:disabled');
						    enbaleForm($(this),input);
							//exclusively disable all element of other forms...
							$("form").filter(function(index){
								return $(this).attr("id") !== form.attr("id");
							}).each(function(i, el){
								enbaleForm($(this));
							});
				 });
				 
	},
	
	hight=function(label){
						var p = $(label).closest('.val_col');
						if (p.length === 0) {
							p = $(label).closest('.val_row');
						}
						p.removeClass('success').addClass('error');
					},
    success=function(label){
						var p, pos, w = label.prev().width();
						
						if ($(label).closest('.val_col').length > 0) {
							p = $(label).closest('.val_col');
							pos = {
								top: '30px',
								left: w - 20 + 'px'
							};
						}
						else {
							p = $(label).closest('.val_row');
							pos = {
								top: '40px',
								left: w - 5 + 'px'
							};
						}
						p.removeClass('error').addClass('success');
						label.text('OK!').addClass('valid').css(pos);
					};
					
	$('#login').live('pageshow', function(event, ui){
		// enbale the submit button when all the required field are filled in the form. 
		   loadCache($(this));
		   $('form').each(function(i,el){
	 	   var u=$(this).find('.TextBox'),
		       s=$(this).find('.button');
		   u.textinput('enable');
		   chkEmpty(u,s);
   	       activeForm($(this));
          });
		   $('#log_as_guest').validate({
					rules: {
						_Email: {
							required: true,
							email: true
						}
					},
					useCache: cache,
					highlight: hight,
					success: success
				});
		$('#log_as_user').submit(function(){
			Sitecatalyst.customer.accountNumber = "accountnumber";
		    sessionStorage["currentGuest"] = null;
		});
	});


  	$('#credit_info').live('pageshow', function(event, ui){
  		//if (ui.prevPage[0]&&ui.prevPage[0].id === "guest_review") { 
  			$('.cardoption').css("display", "none");
  			$('#credit_info .cardinfo').css("display", "block");
  		//}
		Sitecatalyst.sendLinkUpdate("Bill To Credit Card");
  		$('#cardOption').change(function(){
  			if (this.value === "Use a new CARD") {
  				$('#credit_info .cardinfo').css("display", "block");
  			}
  			else {
  				$('#credit_info .cardinfo').css("display", "none");
  			}
  		});
		
		$('#credit_form').validate({
			  			rules: {
			  				bFirstName: {
			  					required: true
			  				},
			  				bLastName: {
			  					required: true
			  				},
			  				
			  				CardNumber: {
			  					required: true,
			  					creditcard: true
			  				},
			  				CardType: {
			  					required: true
			  				},
							/*
							Month:{
								required: true
							},*/
							
							Year:{
								required: true
							},
			  				
			  				/*s_code: {
			  					required: true
			  				},*/
							
							bPhoneNumber: {
							  required: true,
							  phone: true
						     },
						
							_Email: {
									required: true,
									email: true
								}
			  			},
						useCache:cache,
			  		    highlight:hight,
						success: success
			  		});
			loadCache($(this));
  		
  	});
  	
  	
  	$('#ship_info').live('pageshow', function(event, ui){
  		//temp, should be done in jsp....
				if (ui.prevPage[0]&&ui.prevPage[0].id === "user_opt") {
					$('div:jqmData(role="footer") a').attr("href", "order.jsp");
					$('div:jqmData(role="header") h1').text("CHECKOUT");
				}
		//validate should be added here instead of page init					
				$('#ship_form').validate({
					rules: {
						_Email: {
									required: true,
									email: true
								},
						sPhoneNumber: {
							  required: true,
							  phone: true
						     },
								
						sFirstName: {
							required: true
						},
						sLastName: {
							required: true
						},
						sAddress1: {
							required: true
						},
						
						sCity: {
							required: true
						},
					
						sZip: {
							required: true,
							postalcode: true
						}
						
					},
				useCache:cache,
				highlight:hight,
			    success: success
			});
			loadCache($(this));
		 
			});
