(function() {
	var cachedCalls = [];
	function cacheCall (func, args) {
		cachedCalls.push({n: func, args: args});
	}
	function checkLoadingStatus (geo, func, args) {
		var ok = false;
		switch (geo._loadingStatus) {
		case 0: // not loaded
			if (google && google.maps && google.maps.Geocoder) {
				// already exists, may from static loading.
				geo._loadingStatus = 2;
				ok = true;
			} else {
				cacheCall(func, args);
				geo._loadScript();
			}
			break;
		case 1: 
			cacheCall(func, args);
			break;
		case 2:
			ok = true;
			break;
		}
		return ok;
	}
	mstrmojo.GeoLocation = mstrmojo.provide(
		'mstrmojo.GeoLocation',
		{
			/**
			 * Most recent value for the altitude
			 */
			_altitude: null,
			/**
			 * most recent value for the latitude
			 */ 
			_latitude: null,
			/**
			 * Most recent value for the longitude
			 */
			_longitude: null,
			/**
			 * Call backs registered for the pending location request.
			 */
			_callbacks: [],
			_getPos: function(){
				if (navigator && navigator.geolocation) {
					mstrmojo.GeoLocation._getPos = function() {
						navigator.geolocation.getCurrentPosition(mstrmojo.GeoLocation.updateLocation);
					};
				} else if (mstrMobileApp && mstrMobileApp.getGeoLocation){
					mstrmojo.GeoLocation._getPos = function() {
						mstrMobileApp.getGeoLocation('mstrmojo.GeoLocation.updateLocation');
					};
				} else {
					mstrmojo.GeoLocation._getPos = function() {
						alert("no available Geo Location service");
					};
				}
				mstrmojo.GeoLocation._getPos();
			},
			/**
			 * Method for JavaScript client to request for current location service, when request comes back, the call back will be invoked
			 * 
			 * If this is the first request for the location, a device based location service will be invoked to get current location.
			 * If when this method is called, there is already a pending request for the device, 
			 * then it will not launch another request for the device, this method will simply add itself
			 * into the callbacks query and listening for the upcoming data.
			 */
			getCurrentLocation: function(callbacks){
				// queue call backs
				this._callbacks.push(callbacks);
				if (!this._pending) {
					this._pending = true;
					this._getPos();
				}
			},
			/**
			 * Method for device native code to call after it finds the location.
			 * 
			 */
			updateLocation: function(info){
				var me = mstrmojo.GeoLocation;
//				var s = 'updateLocation --';
//				for (var n in info){
//					s += (n + ':' + info[n] + ',');
//				}
//				alert (s);
				var p = info && info.coords;
				if (p){
					// update object
					me._latitude = p.latitude;
					me._longitude = p.longitude;
					
					// invoke call backs
					var cbs = me._callbacks;
					for (var i = 0; i < cbs.length; i ++ ){
						cbs[i].success(p.latitude, p.longitude);
					}
				} else {
					// invoke call backs
					var cbs = me._callbacks;
					for (var i = 0; i < cbs.length; i ++ ){
						cbs[i].failure('Error in updating geo location information.');
					}
				}				
				// clear call backs
				me._callbacks = [];
				
				// clear flag
				me._pending = false;
			},
			getCurrentAddress: function(callbacks){
				this.getCurrentLocation({
					success: function(la, lo, al){
						mstrmojo.GeoLocation.findAddress(
								{lat: la, lng: lo}, 
								{
									success: callbacks.success && callbacks.success || mstrmojo.emptyFn,
									failure: callbacks.failure && callbacks.failure || mstrmojo.emptyFn 
							
								}
						);
					}, 
					failure: callbacks.failure && callbacks.failure || mstrmojo.emptyFn
				});
			},
		    findAddress: function findAddress(latLng, callbacks) {          
				if (checkLoadingStatus(this, 'findAddress', [latLng, callbacks])) {
			    	var geocoder = new google.maps.Geocoder();          
			    	geocoder.geocode(
			    			{location:new google.maps.LatLng(latLng.lat, latLng.lng)}, 
			    			function(results, status) {            
			    				if (status == google.maps.GeocoderStatus.OK && results[0]) {
			    					callbacks.success(results);
			    				} else {
			    					callbacks.failure(results, status);
			    				}
			    			}
			    	);        
				}
		    } ,
		    
		    // dynamic loading Google map API script part
			_loadingStatus: 0,	// 0 for not loaded, 1 for loading, 2 for loaded
			
			_loadScriptCallBack: function _loadScriptCallBack() { 
				this._loadingStatus = 2;
				
				// any call before loading, need to perform now
				for (var i = 0; i < cachedCalls.length; i ++) {
					var c = cachedCalls[i];
					mstrmojo.GeoLocation[c.n].apply(mstrmojo.GeoLocation, c.args);
				}
			}, 
			_loadScript: function _loadScript() {
				this._loadingStatus = 1;
				var script = document.createElement("script"); 
				script.type = "text/javascript"; 
				script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=mstrmojo.GeoLocation._loadScriptCallBack"; 
				document.body.appendChild(script); 
			}
			
		}
	);
	//checkLoadingStatus(mstrmojo.GeoLocation, {});

})();