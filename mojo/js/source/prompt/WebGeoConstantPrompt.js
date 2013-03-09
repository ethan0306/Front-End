/**
 * GeoConstant prompt is a collection of Constant prompt.
 * We do not have corresponding class at web server side. 
 */
(function() {
    mstrmojo.requiresCls("mstrmojo.prompt.WebPrompt",
                         "mstrmojo.array");
    
    var $ARR = mstrmojo.array;
    
    /**
     * Geographical Location prompt.
     * 
     * @class
     * @extends mstrmojo.prompt.WebPrompt
     */
    mstrmojo.prompt.WebGeoConstantPrompt = mstrmojo.declare(

        mstrmojo.prompt.WebPrompt,

        null,

        /**
         * @lends mstrmojo.prompt.WebGeoConstantPrompt
         */
        {
            scriptClass: 'mstrmojo.prompt.WebGeoConstantPrompt',
            
            /**
             * Web clinet 
             */
            promptType: 1.5,
            
            /**
             * The collection of Geo Prompts.
             */
            geos: null,
			getStyle: function getStyle() {
				return mstrmojo.prompt.WebPrompt.STYLES.GEO;
			},            
            getDisplayValue: function getDisplayValue() {
                var err = this._isErr;
                if (err) {
                    return 'Error while updating location: ' + err;
                }
                
                // Assume we have already determined the current location.
                var me = this,
                    rtn = '';
                
                // iterate the geo prompts - should be two, one for longitude, one for latitude
                $ARR.forEach(this.geos, function (prompt) {
                    var ans = prompt.answer;
                    
                    // Is this prompt missing the answer?
                    if (ans === '') {
                        // We have not found the current location yet so set message, and stop iteration.
                        rtn = '&lt;Update Current Location&gt;';
                        return false;
                    } else {
                        if ( prompt.title.indexOf("Latitude")>=0) {
                            me.la = ans;
                        } else {
                            me.lo = ans;
                        }
                    }
                }); 
                
                if ( me.displayLoc ) {

                    rtn = me.displayLoc;
                    
                } else {
                    me.mn = "Searching...";
                    if ( me.la != '' && me.lo != '' ) {
    			        // display the (lat/long) pair as the description by default
    			        rtn = '(' + me.la + ',' + me.lo + ')';
			        }
                }
                
                return rtn;
            },
            
            getDisplayLocation: function(list) {
                var me = this,
                    la = this.la,
                    lo = this.lo;
                
                // if we have both coordinates, format them up for display as our item's description
                if ( la != '' && lo != '' ) {                    
                    // try using the geocoding API to find out where we
					mstrmojo.GeoLocation.findAddress(
						{lat: la, lng: lo}, 
						{
							success: function(results) {
							    me.mn = ''
							    me.displayLoc = results[0].formatted_address;
							    list.updateItem(me._renderIdx);
							},
							failure: function(results, status) {
							    me.mn = '';
							}
						}
					);
                }
                
            },
            
            /**
             * For specified data type {@link #getDataType}, validates whether prompt answer
             * is in correct format and within minimun and maximum limits.
             * An exception is thrown if one of the conditions fails - check the error code
             * to see which test failed.
             *
             */
            validate: function validate(latitude, longitude) {
                // @TODO
                return true;
            },
            
            /**
             * Build each Geo prompts. 
             */
            buildShortPa: function buildShortPa(builder) {
                // Serialize prompt collection in builder.
                $ARR.forEach(this.geos, function(g) {
                    g.buildShortPa(builder);
                });
            },
            
            add: function add(p){
                var g = this.geos = this.geos || []; 
                g.push(p);
            },
            
            setAnswerValue: function setAnswerValue(latitude, longitude) {
                try {
                    delete this.displayLoc;
                    
                    this.validate(latitude, longitude);
                    this.setLocation(latitude, longitude);
                } catch (ex) {
                    // Validation failed, for now we set error state.
                    // TODO: Check exception to make sure it's a validation error.
                    this.setError(ex);
                    
                    return false;
                }
                
                return true;
            },
            
            setError: function setError(v) {
                this._isErr = v;
            },
            
            setLocation: function setLocation(latitude, longitude) {
                // Iterate prompts.
                $ARR.forEach(this.geos, function (prompt) {
                    // Which coordinate is this (default to latitude).
                    switch ((prompt.prs && prompt.prs.GeographicCoordinate) || '0') {
                        case '0':
                            // Set latitude.
                            prompt.set('answer', String(latitude));
                            break;
                            
                        case '1':
                            // Set longitude
                            prompt.set('answer', String(longitude));
                            break;
                    }
                });
            }
        });
}());