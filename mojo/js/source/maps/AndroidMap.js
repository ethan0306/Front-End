/**
  * AndroidMap.js
  * Copyright 2010-2012 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>Widget for displaying Maps rendered by Google Maps JavaScript API.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */
  
(function () {

    mstrmojo.requiresCls("mstrmojo.Vis",
                         "mstrmojo.array",
                         "mstrmojo.hash",
                         "mstrmojo.android.EnumMenuOptions",
                         "mstrmojo.GeoLocation",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.android.DropDownList",
                         "mstrmojo.Label");

	mstrmojo.requiresDescs(7736, 8068, 8069, 8102, 8395, 8954);

    var $A = mstrmojo.array,
        $M = mstrmojo.android.EnumMenuOptions,
        REPROMPT = $M.REPROMPT,
        MAX_MARKERS = 1000; // Max number of markers to display on map

    /*
     * To create bubbles on the map we need to do our own implementation of the google.maps.OverlayView
     * (see http://code.google.com/apis/maps/documentation/javascript/reference.html#OverlayView) according to
     * the google.maps spec we need to implement three methods onAdd(), draw(), and onRemove(). In the add() method,
     * we create DOM objects and append them as children of the panes. In the draw() method, we position these elements.
     * In the onRemove() method, we should remove the objects from the DOM.
     * */
    function CustomMarker(lbl, latlng, rad, index, color) {
        this.title = lbl;
        this._latlng = latlng;
        this._rad = rad;
        this._ix = index;
        this._color = color;
    }

    function initCustomMarker() {

       CustomMarker.prototype = new google.maps.OverlayView();

       CustomMarker.prototype.draw = function() {

           // Check if the div has been created.
           var div = this.div_;
           if (!div) {
               // Create a overlay text DIV
               div = this.div_ = document.createElement('DIV');
               // Create the DIV representing our CustomMarker
               var sty = div.style,
                   rad = this._rad,
                   radD2 = rad / 2,
                   radD2Px = radD2 + "px " + radD2 + "px",
                   panes = this.getPanes(),
                   me = this;

               sty.position = "absolute";
               sty.paddingLeft = "0px";
               sty.cursor = 'pointer';
               sty.backgroundColor = this._color;
               sty.opacity = '.65';
               sty.borderRadius = radD2Px;
               sty.height = sty.width = rad + "px";
               sty.border = "2px solid black";

               google.maps.event.addDomListener(div, "click", function(event) {
                   google.maps.event.trigger(me, "click");
               });

               // Then add the overlay to the DOM
               panes.overlayMouseTarget.appendChild(div);
           }

           // Position the overlay
           var point = this.getProjection().fromLatLngToDivPixel(this._latlng);
           if (point) {
               div.style.left = (point.x - this._rad / 2) + 'px';
               div.style.top = (point.y - this._rad / 2) + 'px';
           }
       };

       CustomMarker.prototype.remove = function() {
           // Check if the overlay was on the map and needs to be removed.
           var dv = this.div_;
           if (dv) {
               dv.parentNode.removeChild(dv);
               this.div_ = null;
           }
       };

       CustomMarker.prototype.getPosition = function() {
           return this._latlng;
       };

   }

    var getBounds = function getBounds(markers){
        var bnds;
        if(markers.length > 0){

            bnds = new google.maps.LatLngBounds();
            for(var i in markers){
                var m = markers[i],
                    p = m.getPosition();



                bnds.extend(p);
            }
        }
        return bnds;
    };

    function getFromPoint(laOrln, value){
        return value.replace(/POINT[ ]?\(|\)/g,"").split(' ')[laOrln == 'lat' ? 1 : 0];
    };

    function _getMapType() {
        return this._mapTypeToGoogleMapTypeId[this.mapType];
    };


    /**
     * <p>A widget to display an Android specific Android Map.</p>
     *
     * This is intended to live inside an AndroidView widget as the contentChild.
     *
     * @class
     * @extends mstrmojo.Box
     */
    mstrmojo.maps.AndroidMap = mstrmojo.declare(
        mstrmojo.Vis,

        [ mstrmojo._TouchGestures ],

        {
            scriptClass: "mstrmojo.maps.AndroidMap",

            cssClass : "mstr-googleMapView",

            markupString: '<div id="{@id}" class="mstrmojo-Box {@cssClass}" style="{@domNodeCssText}">' +
                             '<div></div>' +
                              '<div class="androidMap-metricSelector"><span class="androidMap-toggleHeader"></span></div>' +
                              '<div class="mstr-googleMap" id="map_canvas_{@id}" style="-webkit-transform: translate3d(0px, 0px, 0px);"></div>' +
                          '</div>',

            reRenderOnDimensionChg: false,
            
            noMapsMsg: mstrmojo.desc(8954,"Google Maps have not been configured for this device. Please check with your mobile administrator to enable Google Maps in the mobile configuration."),
            
            /**
             * Overriding this property such that it tells the main view that the Android Settings View only supports the Home menu option.
             *
             * @see mstrmojo.AndroidMainView
             */
            supportedDefaultMenus: 1,

            /*
             * Since the mapped attribute can have several metrics on the grid we need to have a
             * selected one that will be used to show the marker specific details for that mapped
             * attribute, this index will tell us which metric is selected, the default will be 0.
             *
             */
            selMetricIx : 0,

           /*
            * An array of marker arrays
            * When we switch metrics we need to rebuild all the markers, to avoid unnecessary overhead
            * we keep the group of markers cached, this array will store them. The index 0 corresponds
            * to the group of markers for the metric 0, 1 to the 1 and so on.
            *
            */
            markerArr : [],

           /*
            * Internal reference of our google.map object
            *
            */
           googleMap : null,

           /*
            * This will store the maximum raw value of a certain metric, used to build the bubbles. The
            * index 0 corresponds to the metric 0 and so on.
            *
            */
           bubblesMaxInfo : [],

           /*
            * Defines the size of the bigger bubble on the map in pixels, all bubble marker size will be equal or
            * less than this value.
            *
            */
           maxBubbleSize : 50,
           minBubbleSize : 20,

           /**
            * map is the slot for the googleMap object
            * metricSelector is the slot for the metric selector label
            *
            */
           markupSlots : {
               msg : function() { return this.domNode.childNodes[0]; },
               metricSelector : function(){ return this.domNode.childNodes[1];},
               map : function(){ return this.domNode.childNodes[2];}
           },

            markupMethods: {
                onheightChange: function(){
                    this.domNode.style.height = this.getHeight() + 'px';
                },
                onwidthChange: function(){
                    this.domNode.style.width = this.getWidth() + 'px';
                }
            },

           /**
            * Initially the metric selector height is zero, will be updated before
            * rendering in case the map has more than one metric.  This is used by the
            * _HasLayout mixin
            *
            */
           layoutConfig: {
               h: {
                   metricSelector: '32px',
                   map: '100%'
               },
               w: {
                   metricSelector: '200px',
                   map: '100%'
               }
           },

           children: [{
                   scriptClass: 'mstrmojo.android.DropDownList',
                   slot: 'metricSelector',
                   options: null,
                   onidxChange: function(evt) {
                       this._super(evt);
                       this.parent.onselMetricIxChange( evt );
                       this.set('value', this.options[evt.value].v);
                   },
                   visible: false,
                   alias: "metricSel"
                },{
                   scriptClass: 'mstrmojo.Box',
                   slot: 'map'

                }, {
                    scriptClass: 'mstrmojo.Label',
                    cssClass: "androidMap-errorMsg",
                    visible: true,
                    alias: "errorMsg",
                    slot: "msg"
                }
            ],

            setModel: function setModel(model) {
                this.set('model', model);
                if ( model.data ) {
                    this.set('gridData', model.data);
                }
            },

            ongridDataChange: function() {
                this.parser = new mstrmojo.Vis.DataParser(this.gridData);
            },

            update: function update(node) {
                node = node || this.node;
                if (node) { // called from docs
                	if (node.data) {
                	
                	    this.set('gridData', node.data);

                        var gd = this.gridData;
                		if (gd.layoutModel) this.layoutModel = gd.layoutModel;
                		if (gd.layoutNode) this.layoutNode = gd.layoutNode;
                	}
                    var fmts = node.defn.fmts || node.defn.units[this.model.k].fmts;

                    this.width = parseInt(fmts.width, 10);
                    this.height = parseInt(fmts.height, 10);
                    this.top = parseInt(fmts.top,10);
                    this.left = parseInt(fmts.left,10);
                    this.fmts = fmts;
                }

                if (this.model) {
                	this.initFromVisProps(this.gridData.vp);
                }
                this.updated = true;
            },

            getMapModel: function() {
                return this.model;
            },

			initFromVisProps: function initFromVisProps(vp) {
				if(!vp) return;

				// get the type of map we're supposed to display				
				if(vp.dv) {
					this.mapType = parseInt(vp.dv,10);
				}				
                this.usePt = ( vp.gr == "1" );
                this.useAttributes = ( vp.af === "0" );
                this.geoAttr = vp.ga;
                this.markerType = vp.mtp;
                this.attrThresholds = vp.at;
                this.flong = vp.flong;
                this.flat = vp.flat;
                this.fpt = vp.fpt;
                this.mstyl = vp.mstyl;
                this.maxBubbleSize = vp.mbs || 50;
            },

            showErrorMsg: function showErrorMsg(show,msg) {
                this.errorMsg.set("text", msg );
                this.metricSelector.style.display = show ? "none" : "block";
                this.map.style.display = show ? "none" : "block";
                this.msg.style.display = show ? "block" : "none";
            },
			
            postBuildRendering : function postBuildRendering(){

               this._super();

               if ( typeof this.gridData.eg !== "undefined" ) {
                   this.showErrorMsg( true, this.gridData.eg );
               } else if ( typeof google === "undefined" || ( google && typeof google.maps === "undefined" )) {
                   this.showErrorMsg(true,this.noMapsMsg);
               } else {

                   this.showErrorMsg(false);

                    // Update selector info on widget.
                    var selectorCtrl = this.children[0];

                    selectorCtrl.idx = 0;
                    selectorCtrl.unset = true;
                    selectorCtrl.options = [{ v: '-1', n: '' }];

                    if( /* !mstrApp.onMobileDevice() && */
                        ( typeof google !== "undefined" && google.maps ) ) {

                        // if we are NOT an info window then either load the map
                        if ( !mstrApp.isInfoWindow ) {
                            this.markerArr = [];
                            this.bubblesMaxInfo = [];
                        }

                        this._mapTypeToGoogleMapTypeId = [  google.maps.MapTypeId.ROADMAP,
                                                            google.maps.MapTypeId.SATELLITE,
                                                            google.maps.MapTypeId.HYBRID,
                                                            google.maps.MapTypeId.TERRAIN ];

                        //the custom marker requires google.maps API so just create it if present
                        initCustomMarker();
                        /* update the metric selector, once we have the slots and data
                        * we know the contents of the initial label, if there is one.
                        * */
                        if(this.gridData){

                            var showSelector = this.buildMetricSelector(),
                                selectorHeight = showSelector ? parseInt(this.layoutConfig.h.metricSelector,10) : 0;

                            this.metricSel.set('visible',showSelector);

                            this.map.style.height = this.getHeight() + "px";
                           	this.map.style.width = (this.getWidth() - 1) + "px";

                            this.metricSelector.style.height = selectorHeight + "px";
                            this.metricSelector.style.display = showSelector ? "block" : "none";

                            this.initMap();

                            if ( this.map.firstChild ) {
                                this.map.firstChild.style.zIndex = 1;
                            }
                        }
                    }
               }
           },



            gup: function gup(n){
            	n = n.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            	var rxs = "[\\?&]"+n+"=([^&#]*)",
            	    rx = new RegExp(rxs),
            	    r = rx.exec(window.location.href);
            	return r == null ? "" : r[1];
            },

           /*
            * Updates the markers on the map when the selected metric changes
            *
            */
           onselMetricIxChange: function(evt){
               var f = function(map,mks){
                   for(var i in mks){
                       if(mks[i].setMap){
                           mks[i].setMap(map);
                       }
                   }
               };

               //Check if the map has an opened info window, if it does try to close it
               if(this.openedInfoWindow){
                   this.openedInfoWindow.close();
               }
               //Get the old and new set of markers
               var mks = this.getMarkers(evt.value),
                   oldMks = this.getMarkers(evt.valueWas);

               this.selMetricIx = evt.value;

               //Set null map to the old markers, this will remove them from the map
               f(null, oldMks);
               //Set the map to the new marker group, this will place them on the map
               f(this.googleMap, mks);
           },

           /*
            * Creates the label of the metric selector based on the current selected metric
            *
            */
           buildMetricSelector : function buildMetricSelector() {
               var  col = this.gridData.gts.col,
                    useSelector = false;

               if ( col.length > 0 ) {
                   var metrics = col[0].es;

                   if( metrics.length > 1 ) {

                        var  items = [],
                             x = -1;

                        // Iterate list.
                        $A.forEach(metrics, function (m, idx) {
                            // Add n|v item to return array.
                            items[++x] = {
                                n: m.n,
                                v: x,
                                id: m.id
                            };
                        });

                        var selector = this.children[0];

                        selector.set('options',items);
                        selector.set('value', 0 );

                        useSelector = true;
                    }
               }
               return useSelector;
           },

            /**
             * Initializes the googleMap object, sets the initiall group of markers, zoom and center.
             *
             */

            initMap : function () {
                var map,
                    gm = google.maps,
                    gme = gm.event,
                    mapType = _getMapType.call(this) || gm.MapTypeId.ROADMAP,
                   //mapOptions follow the spec from google.maps API http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions
                   mapOptions = {
                       mapTypeControl : true,
                       mapTypeControlOptions: {
                           position: gm.ControlPosition.TOP_LEFT,
                           style: gm.MapTypeControlStyle.HORIZONTAL_BAR // DROPDOWN_MENU
                       },
                       streetViewControl :false,
                       mapTypeId : mapType,
                       navigationControlOptions : {
                         position : gm.ControlPosition.RIGHT_BOTTOM,
                         style : gm.NavigationControlStyle.ANDROID
                       },
                       zoomControlOptions: {
                           style: gm.ZoomControlStyle.LARGE
                       },
                       tilt: 0

                     };

                //Initialize the googleMap object and cache it
                this.googleMap = map = new gm.Map(this.map, mapOptions);

                // use previously selected metric if available
                this.selMetricIx = this.selMetricIx;

                //Get a list of markers for the selected metric that should be 0
                var markers = this.getMarkers(this.selMetricIx);

                if ( markers.length > 0 ) {
                    // Use bounds object computed while generating the markers; the bounds is used to center and zoom the map
                    var bnds = this.mapBounds; // getBounds(markers);

                   // If bounds are available (i.e. we have one or more markers), set the center and zoom (using the fitBounds method)
                   if ( bnds ) {
                       map.fitBounds(bnds);
                       map.setCenter(bnds.getCenter());
                   }
                } else {
                    // we found no valid markers in the grid data; set the center of the map to MSTR HQ if no GPS is available.
                    var mstrHQ = new gm.LatLng(38.893444,77.221648);
                    map.setCenter(mstrHQ);
                }

                // TQMS#494753v2 - map.getZoom() can return "undefined" if we don't wait a bit for the map to initialize.
                //                  wait up to 300ms for the map to get itself together and then set the zoom.
                var INTERVAL = 30,
                    t = 0,
                    mz = map.getZoom(),
                    ti = setInterval(function() {
	                	mz = map.getZoom();	                	
	                    t += INTERVAL;
	                    if ( mz !== undefined ) {
	                        // TQMS#499060 - back off the zoom if we are in too tight
                            // TQMS#494753 - if we are zoomed in too far, then zoom out a bit
			                if ( mz > 20 ) {
			                    map.setZoom(15);			
			                } else if ( mz < 2 ) {
			                    map.setZoom(2);
			                }
	                        clearTimeout(ti);
	                    } else if (t > 10*INTERVAL) {
	                        // exceeded our timeout, clear interval and set default zoom
	                        clearTimeout(ti);
	                        map.setZoom(2);
	                    }
	                }, INTERVAL);
           },

           /**
            * Returns the group of markers for a certain metric, it will return the cached version
            * or it will create the new set if not present on the cache.
            *
            * The marker data contains consists of two or three parts depending on whether the "point" form is being used.
            * In "point" form, the longitude and latitude are combined into a single attribute/attribute form.
            * Otherwise the data consists of three individual parts (label, longitude, and latitude). The minValues
            * variable is set to two or three depending on which form the geolocation data is in.
            *
            *        <option value="0">Use Attribute</option>
            *        <option value="1">Use Attribute Form</option>
            *
            *
            */
            getMarkers : function getMarkers(metricIx){
                // May be cached already, return cached version
                if(!!this.markerArr[metricIx]){
                    return this.markerArr[metricIx];
                }

                var map = this.googleMap,
                    d = this.gridData,
                    vp = d.vp,
                    gts = d.gts,
                    row = gts.row,
                    usePt = this.usePt,
                    minVals = (usePt ? 1 : 2 ),  // minimum number of attribute forms, don't count the label in min values (TQMS#499060)
                    useAttributes = this.useAttributes,
                    geoAttr = this.geoAttr,
                    longs, lats, labels,
                    longIdx = -1, latIdx = -1, labelIdx = -1,
                    mks = [],
                    tIcon = null;

                for( var r = 0, numRows = row.length, totalForms = 0; r < numRows; ++r ) {
                    var curRow = row[r],
                        rid = curRow.id;
					
                    // check if the row ID matches any of our geo IDs

                    // are we using POINT() form?
                    if ( usePt ) {
                        // yes, check the fpt ID
                        if ( rid == this.fpt ) {
                            longs = lats = curRow;
                            longIdx = latIdx = totalForms;
                        }
                    } else {
                        // no, using separate long/lat data
                        // is this the LONGITUDE data?
                        if ( rid == this.flong ) {
                            longs = curRow;
                            longIdx = totalForms;

                        // is this the LATITUDE data?
                        } else if ( rid == this.flat ) {
                            lats = curRow;
                            latIdx = totalForms;
                        }
                    }

                    for( var f = 0, numForms = curRow.fs.length; f < numForms; ++f ) {
                        var curForm = curRow.fs[f],
                            fid = curForm.id;

                        // are we using POINT() form?
                        if ( usePt ) {
                            // yes, check the fpt ID
                            if ( fid == this.fpt ) {
                                longs = lats = curRow;
                                longIdx = latIdx = totalForms + f;
                            }
                        } else {
                            // no, using separate long/lat data
                            // is this the LONGITUDE data?
                            if ( fid == this.flong ) {
                                longs = curRow;
                                longIdx = totalForms + f;
                            // is this the LATITUDE data?
                            } else if ( fid == this.flat ) {
                                lats = curRow;
                                latIdx = totalForms + f;
                            }
                        }

                        // grab the first non-geo data to use as the label
                        if ( labelIdx < 0 ) {
                            labels = curRow;
                            labelIdx = totalForms + f;
                        }
                    }

                    totalForms += numForms;
                }

                // check for minimal requirements for displaying a map;
                if ( Math.min(longIdx,latIdx,labelIdx) < 0 ) {
                    throw new Error(mstrmojo.desc(8395, 'Not enough data to display map.'));
                }

                var rhs = d.ghs.rhs.items,
                    numMarkers = Math.min( rhs.length , MAX_MARKERS ),
                    lat_hi = -90, lat_lo = 90, lng_hi = -180, lng_lo = 180;

                for( var i = 0; i < numMarkers; i++ ) {
                    var vals = rhs[i].items; // set up access to the grid row headers

                    // if this row does not have enough data to display a marker, then skip it.
                    // This can occur on Total and Sub-Total rows
                    if ( vals.length < minVals) {
                        continue;
                    }
                    // get the 'longitude' value for this marker; if we are using the Point form
                    // we must extract the long and lat. data from this value
                    var longV = longs.es[vals[longIdx].idx].n,
                        lon = parseFloat( usePt ? getFromPoint("long", longV ) : longV ),
                        lat = parseFloat( usePt ? getFromPoint("lat", longV ) : lats.es[vals[latIdx].idx].n ),
                        lbl = labels.es[vals[labelIdx].idx].n,
                        marker,
                        metricItem = d.gvs.items[i];

                    // if longitude or latitude is invalid then skip this row
                    if ( isNaN(lat) || isNaN(lon)) {
                        continue;
                    }

                    // track the low and high lat/long values
                    lat_lo = ( lat < lat_lo ) ? lat : lat_lo;
                    lat_hi = ( lat > lat_hi ) ? lat : lat_hi;
                    lng_lo = ( lon < lng_lo ) ? lon : lng_lo;
                    lng_hi = ( lon > lng_hi ) ? lon : lng_hi;

                    //Create a LatLng google.maps object using the latitude and longitud from the data
                    latLng = new google.maps.LatLng(lat, lon);

                    //'mtp' is the marker type, 1-markerStyle 2-DynamicBubbles
                    if ( this.markerType == "2" ) {
                        marker = this.getMetricBubble(d.gvs.items[i], lbl, latLng, i, metricIx);
                    } else {

                        //Use a predefined icon if there is no image as threshold for the marker
                    	tIcon = "../" + this.mstyl;
                    	
                    	var gvsItem = d.gvs.items[i];
	                    if ( gvsItem ) {
	
	                    	var	mitems = gvsItem.items;
	                    	if ( mitems ) {
	                    		var mi = mitems[metricIx];

	                    		//'at' will be 1 if we need to use the thresholds, metricItem value type 'ts' will be 4 for images
		                        if( mi && (mi.ts == 4) && (this.attrThresholds == "1")){
		                            tIcon = this.getImage(mi.v);
		                        }
	                    	}
	                    }

                        //Construct the new gogle.maps.Marker using the API spec http://code.google.com/apis/maps/documentation/javascript/reference.html#Marker
                        marker = new google.maps.Marker({
                            position: latLng,
                            title: lbl,
                            _ix : i,
                            icon : tIcon,
                            zIndex: i       // set the z-index of the markers so they are drawn in order rather than by screen position
                        });
                    }

                    // attach the element id and groupby ids to each marker
                    marker.eid = labels.es[vals[labelIdx].idx].id;
                    marker.attrid = labels.id;

                    marker.setMap(map);

                    //Attach an event listener to the marker to execute the following method when pressed
                    google.maps.event.addListener(marker, 'click', function(ths,m) {
                        return function() {

                            // pan to the marker so that the info window is fully visible (#490587)
                            // map.panTo(m.getPosition());

                            // handle click on a marker
                            ths.handleMarkerClick(map,m);
                        };
                    }(this,marker) );

                    //add the marker to the markers collection
                    mks[mks.length] = marker;
                }

                // mstrmojo.dbg("map bounds: lat_hi="+lat_hi+", lat_lo="+lat_lo + ", lng_hi="+lng_hi + ", lng_lo="+lng_lo);

                this.mapBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(lat_lo,lng_lo),
                    new google.maps.LatLng(lat_hi,lng_hi)
                 );

                //cache this marker collection
                this.markerArr[metricIx] = mks;

               return mks;
           },

           handleMarkerClick: function(map,marker) {
                //Check if we have any other info window already opened, close it.
                if( this.openedInfoWindow){
                    this.openedInfoWindow.close();
                    this.openedInfoWindow = null;
                }
                this.openInfoWindow(map,marker);

                this.postHandleMarkerClick(map,marker);
           },

           /**
            * Called after info window has been displayed in response to user click on map marker
            */
           postHandleMarkerClick: mstrmojo.emptyFn,

           // TODO need to move it other where since there're several copies of this function
           getImage: function getImage(url) {
                var app = mstrApp,
                    config = app.getConfiguration();

                if (config && url && url.indexOf('://') === -1) {

                    url = config.getHostUrlByProject(app.getCurrentProjectId()) + url;
                }

                return (mstrApp.useBinaryFormat) ? String(mstrMobileApp.getImage(url)) : url;
            },


          /**
           * Used to build the custom marker with bubble shape, returns a new CustomMarker (google.maps.OverlayView)
           *
           */

           getMetricBubble : function getMetricBubble(metricItem, lbl, latLng, index, metricIx){

               var d = this.gridData,
                   mValues = d.gvs.items, //metric values
                   maxVal = this.bubblesMaxInfo[metricIx], //see if we have stored a max value for this metric series
                   mv = parseFloat(metricItem.items[metricIx].rv), //the value of this specific bubble
                   color = "red", //default color
                   bubbleRange = Math.abs(this.maxBubbleSize - this.minBubbleSize );

               //If we have not previously calculated the max value of this metric series, iterate through the metrics and get it
               if(!maxVal){
                   for(var i in mValues){
                       var item = mValues[i].items[metricIx],
                           v = parseFloat(item.rv) || 0; //The 'rv' field contains the data non formatted
                       if(!maxVal){
                           maxVal = v;
                       }
                       maxVal = Math.max(maxVal,v);
                   }
                   //after calculating the max value, store it
                   this.bubblesMaxInfo[metricIx] = maxVal;
               }

               //If using thresholds, use the font color for the bubble background color
               if(this.attrThresholds == "1" && (typeof metricItem.items[metricIx].ty !== "undefined" )){
                    // get threshold type
                    var ty = metricItem.items[metricIx].ty;
                    if ( ty == 2 ) {
                        // CLR
                        color = d.th[metricItem.items[metricIx].ti].n;
                    } else {
                        // use white fill if the threshold type is not CLR
                        color = "#FFF";
                    }
               }

               //Construct a new CustomMarker with the position, the bubble size, the index of the bubble and the color
               return new CustomMarker(lbl, latLng, this.minBubbleSize + Math.round((mv/maxVal) * bubbleRange), index, color);
           },

           /**
            * opens info window on specified map for specified marker
            *
            */
           openInfoWindow : function(map,marker){
                var ix = marker._ix,//index of the marker on the rows
                    w = this.getInfoWindow(map,marker);

                // if we have an info window, display it; if we are pulling the info window from a layout
                // or panel stack then it may not be available yet.
                if ( w ) {
                    //store the currently opened infoWindow
                    this.openedInfoWindow = w;
                    w.open(map,marker);
                }
           },

           /*
            * Uses the marker information to generate the info window content,
            * in a perfect world this should be called once for each marker and
            * when clicked.
            * */
           getInfoWindow : function(map,marker){
               return this.getDefaultInfoWindow(this.gridData, marker );
           },

           getDefaultInfoWindow : function getDefaultInfoWindow(d /*Data*/, marker /* marker*/){
                var ix = marker._ix,
                    // find the indexes of the labels and long data
                    mLabels = [],  //metriLabels
                    mValues = d.gvs.items,      //metric values
                    res = document.createElement("div"),
                    innerHTML = '<table><tbody><tr>' +
                                   '<td colspan="2" class="androidMap-infoWindowTitle" style="padding-right: 20px">'+ marker.title +'</td>' +
                               '</tr>';
							   
				if (d.gts.col.length != 0)
					mLabels = d.gts.col[0].es;
							   
               for(var i in mLabels){
                   var item = mValues[ix].items[i];

                   //'ts' will be 4 if using an image instead of a value
                   if(item.ts == 4){
                       var path = item.v;
                       if ( path.indexOf("http") !== 0 ) {
                           path = "../" + path;
                       }
                       innerHTML += '<tr><td class="androidMap-infoWindowText">'+ mLabels[i].n +'</td><td><img src="'+ path +'"></td></tr>';
                   } else {
                       //Default font and background colors
                       var fColor = 'black',
                           bColor = 'white';

                       //If using thresholds, use the background and font color from the data
                       if(d.th && this.attrThresholds == "1" && (typeof item.ti !== "undefined") ){
                           fColor = d.th[item.ti].n;   //font color
                       }
                       innerHTML += '<tr><td class="androidMap-infoWindowText">'+ mLabels[i].n +'</td><td style="background-color:'+ bColor +';color:'+ fColor +';">'+ item.v + '</td></tr>';
                   }
               }

               innerHTML += '</tbody></table>';

               res.innerHTML = innerHTML;

                return new google.maps.InfoWindow({
                    content: res
                });
            },
               		
            /**
             * override of touchBegin to prevent bubbling and cancel further processing of the touch
             */
            touchBegin: function(touch) {
               touch.stop();
               return false;
            },

            rebuildLayout: mstrmojo.emptyFn,

            setDimensions: function setDimensions(h, w) {
                var map = this.googleMap,
                    center = map ? map.getCenter() : null,
                    dimensionChanged = this._super(h, w);

                if ( map ) {
                    this.map.style.height = this.getHeight() + "px";
                   	this.map.style.width = (this.getWidth() - 1) + "px";
                   	map.setCenter(center);
                }
               	
                return dimensionChanged;            	
            },

            unrender: function unrn(ignoreDom) {
                if ( this.googleMap ) {
                    delete this.googleMap;
                }

            	this._super(ignoreDom);
            },
            
            destroy: function destroy() {
                if ( this.googleMap ) {
                    delete this.googleMap;
                }

            	this._super();
            }
        }
    );
})();
