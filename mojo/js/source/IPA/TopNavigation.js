(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Widget","mstrmojo.IPA.InlineButton");

	mstrmojo.IPA.TopNavigation = mstrmojo.insert({
		scriptClass : "mstrmojo.Box",
		placeholder : 'logoutspanbutton',
		id: "topNavigation",
		cssText: "position:relative;left: 55%;padding-top: 2px;display: inline-block;",
		 markupMethods: {
				onvisibleChange: function() {
		   				this.domNode.style.display = 'inline-block';
 		   			}
				},				
				
		children : [{
			scriptClass : 'mstrmojo.IPA.InlineButton',
			text : "<a href='#'>Settings</a>",
			cssClass : "mstrLogOut",
			cssText:"margin-right:45px;left:99.5%;",
			
			onmousedown:function(event){
				//For FF: pass event object, event.e contains keyCodes            	
            	var evt = window.event? window.event : event.e;            	
            	var key = evt.which;
            	
            	if(key == 1)
            		window.location = mstrmojo.all.cfgurl.text;
            	else
            		this.set('text',this.text.replace("#",mstrmojo.all.cfgurl.text));
			}						
		},{
			scriptClass : 'mstrmojo.IPA.InlineButton',
			text : "<a>Logout</a>",
			cssClass : "mstrLogOut",
			cssText:"margin-left:10px;left:98.5%;",
			onclick : function() {
				mstrmojo.xhr.request('POST', mstrConfig.taskURL , {
					success : function(res) {
						/*commenting cancel call to avoid XHR queuing*/
						//mstrmojo.xhr.cancel();
						window.location.reload();
					},
					failure : function(res) { 
					}
				}, {
					taskId : 'IPALogoutTask'
				});

			}
		}]

	}).render();

})();
