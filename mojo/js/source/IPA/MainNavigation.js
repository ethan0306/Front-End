(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Widget", "mstrmojo.IPA.InlineButton");
	mstrmojo.requiresDescs(8897,8882);

	var prevhashvalue = "#";

	function createnewLink(t, l, s) {

		return mstrmojo.insert({
			scriptClass : "mstrmojo.Widget",
			cssClass : "mstrPathLast",
			markupString : '<span>' + s + '<a href="{@urlLink}" class="{@cssClass}">' + t + '</a></span>',
			urlLink : l,
			text : t
		});

	}

	function readURLParams(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if(results == null)
			return "";
		else
			return results[1];

	}


	window.onhashchange = function() {
		//call the function to read the params and navigate to the approriate link		
		mstrmojo.all.CloudOMMainNavigationLinks.navigateWithURLParams();
		return false;
	}
	function areAllEnvironmentsDisabled() {		
		var m = mstrmojo.all.environmentModel.model.environments;
		var c = 0;

		for(var i = 0; i < m.length; i++) {
			if(m[i].enable == "false")
				c++;
		}
		if(m.length == c)
			return true;
		return false;

	}


	mstrmojo.IPA.MainNavigation = mstrmojo.insert({
		id : "CloudOMMainNavigationLinks",
		placeholder : 'topmainnav',
		cssClass : "mstrPathText",	
		cssText:"margin-bottom: 10px;",
		params : {
			"id" : null,
			"server" : null,
			"monitor" : null
		},
		children : [{
			scriptClass : "mstrmojo.Widget",
			cssClass : "mstrPathLast",
			markupString : '<span>' + "Cloud Operations Manager" + '> <a href="{@urlLink}" class="{@cssClass}">' + mstrmojo.desc(8897,"Environments") +'</a></span>',
			urlLink : "",
		}],
		scriptClass : "mstrmojo.Box",
		markupMethods: {
				onvisibleChange: function() { 
		   			this.domNode.style.display = 'inline-block';
		   			}
		},
		navigateWithURLParams : function() {			
			//if all environments are disabled go back to settings			
			if(areAllEnvironmentsDisabled()) {				
				var a = mstrmojo.confirm(mstrmojo.desc(8882,"No environment is enabled for monitoring. Redirecting to Cloud Operations Manager Configuration Page"),null,mstrmojo.desc(3610));				
				mstrmojo.all.monitorsview.cleanUp();				
				mstrmojo.all.environmentlist.set("visible", false);
				setTimeout('window.location = mstrmojo.all.cfgurl.text;',3000);				
				return;			
			}

			mstrmojo.all.monitorsview.cleanUp();
			mstrmojo.all.environmentlist.set("visible", false);
			/*commenting cancel call to avoid XHR queuing*/
			//mstrmojo.xhr.cancel();

			document.title = "Cloud OM Environments"

			//for each key value pair handle its action
			for(var param in this.params) {
				this.params[param] = readURLParams(param);
			}

			//Monitor View
			if(this.params["server"] && this.params["monitor"]) {
				mstrmojo.all.monitorsview.set("visible", true);
				mstrmojo.all.monitorsview.showMonitor(this.params["server"], this.params["monitor"]);
				return;
			}

			mstrmojo.all.environmentlist.set("items", mstrmojo.all.environmentModel.model.environments);

			//Environment Detail view
			if(this.params["id"]) {
				mstrmojo.all.environmentlist.set("visible", true);
				mstrmojo.all.environmentlist.showDetailedViewForEnvironment(this.params["id"]);
				return;
			}

			//default Environment Listing view
			mstrmojo.all.environmentlist.set("visible", true);
			this.resetToHome(true);
			mstrmojo.all.environmentlist.showListView();
		},
		addLink : function(t, l, b) {
			this.addChildren(createnewLink(t, l, " > "));
			if(b)
				return;
			this.render();
		},
		resetToHome : function(r) {

			this.destroyChildren();
			this.addChildren(createnewLink(mstrmojo.desc(8897,"Environments"), "#", mstrmojo.desc(8841,"Cloud Operations Manager")+ " > "));
			if(r) {
				window.location.hash = "";
				if(r)
					this.render();
			}
		}
	}).render();

})();
