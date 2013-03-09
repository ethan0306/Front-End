DensityOverlayScript = true;

function newEventPassthru(obj, event) {
    return function() {
        google.maps.event.trigger(obj, event);
    };
}


(function(){
    
    mstrmojo.requiresCls("google.maps.OverlayView","mstrmojo.hash");
    
    var _H = mstrmojo.hash;
    
    mstrmojo.gmaps.DensityOverlay = mstrmojo.declare(
        // superclass
        google.maps.OverlayView,
            
        // mixins
        [mstrmojo._Provider],
        
        {
            scriptClass: 'mstrmojo.gmaps.DensityOverlay',
            
            div_:null,
            
            /*
            * density map
            */
            canvas:null,
            canvasWidth:0,
            canvasHeight:0,
            latlngArr:null,
           
            /**
             * 
             */
            isDragging:false,
            themeId:null,
            onthemeIdChange:function onthemeIdChange() {
              //this.themeLoaded = false;
              this.themeData = null;
            },
            themeLoaded:false,
            themeData:null,
            bounds:null,
            /**
             * currrent Offset, hack to adjust canvas position and latlng to pixel translation.
             */
            xOffset:0,
            yOffset:0,
            /**
             * pixel (x,y) to data points
             */
            locationMap:null,
          
            init: function init(props) {
                
                // Apply the given properties to this instance.
                _H.copy(props, this);    // Optimization: use copy rather than mixin, unless truly needed.
                if (props.map) {
                    this.setMap(props.map);
                }
                /*
                // Add this instance to the mstrmojo.all collection so it can participate in event publishing/listening.
                _R.add(this);
                                
                // Hook for customizations after getting registered.
                if (this.postCreate) {
                    this.postCreate();        
                }
                */
                
            },
                
            onAdd: function onAdd() {
                var i;
                this.div_ = document.createElement('DIV');
                this.div_.style.border = "none";
                this.div_.style.borderWidth = "0px";
                this.div_.style.position = "absolute";               
                
         
                if (this.clickable) {
                    // Pass through events fired on the text div to the marker.
                    
                    var eventPassthrus = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout'];
                    for(i = 0; i < eventPassthrus.length; i++) {
                        var name = eventPassthrus[i];
                        google.maps.event.addDomListener(this.div_, name, newEventPassthru(this, name));
                    }
                    
                    // Mouseover behaviour for the cursor.
                    this.div_.style.cursor = "pointer";
                }
                
                // We add an overlay to a map via one of the map's panes.
                // We'll add this overlay to the overlayImage pane.
                var panes = this.getPanes();
                panes.floatPane.appendChild(this.div_);
                
                var that = this;
               
                google.maps.event.addListener(this.map, "dragstart", function(event){
                    that.handleDragStart(event);
                });
                google.maps.event.addListener(this.map, "dragend", function(event){
                    that.handleDragEnd(event);
                });
                
                google.maps.event.addListener(this.map,"click", function(event) {
                	that.handleMouseClick(event);
                });
                
                google.maps.event.addListener(this.map,"bounds_changed",function(event) {
                	that.drawDensity();
                });
                this.drawDensity();
            },
            
            drawDensity:function drawDensity() {
            	if (this.isDragging) return;
            	var newBounds = this.map.getBounds();
            	if (this.bounds && this.bounds.equals(newBounds)) {
            		return;
            	} 
            	this.bounds = newBounds;
            	if (this.canvas) {
            		this.clearDensity();
            	} else {
            		this.createCanvas();
            	}
                this.cleanLocationMap();
                this.createDensity();
            },
            handleDragStart:function handleDragStart(event) {
            	this.isDragging = true;
            },
            handleDragEnd:function handleDragEnd(event) {
            	this.isDragging = false;
            	this.drawDensity();
            },
            
            onRemove: function onRemove() {
                if (this.div_) {
                    google.maps.event.clearInstanceListeners(this.div_);
                    this.div_.parentNode.removeChild(this.div_);
                    this.div_ = null;
                }
            },
            
            draw: function draw() {
                //var overlayProjection = this.getProjection();
            },
            /**
             * density map draw and display function
             */
            
            createCanvas:function() {
            	var canvas = document.createElement('canvas');
            	canvas.id = 'heatmapcanvas'
            	canvas.style.position = 'absolute';
            	this.canvasWidth = canvas.width = this.width;
            	this.canvasHeight = canvas.height = this.height;
            	
            	canvas.style.zIndex = 1;
            	//this.map.lastChild.appendChild(canvas);
            	this.div_.appendChild(canvas);
            	this.canvas = canvas;
            },
            
            getThemeUrl:function getThemeUrl() {
            	var theme;
            	switch (this.themeId) {
            	    case "5":
            	    	theme = '../style/images/heatmap5.png'
            			break;
            	    case "4":
            	    	theme = '../style/images/heatmap4.png'
            	    	break;
            	    case "3":
            	    	theme = '../style/images/heatmap3.png'
            	    	break;
            	    case "2":
            	    	theme = '../style/images/heatmap2.png'
            	    	break;
            	    default:
            	    	theme = '../style/images/heatmap1.png';
            	}
            	return theme;
            },

            createThemeColourGradient:function createThemeColourGradient(url) {
            	if (url) {

            		var that = this;
            		var img = new Image();
            		img.onload = function(){
            			that.drawTheme(this);
            		}
            		img.src = url;
            	}
            	return null;
            },
            drawTheme:function drawTheme(image){
            	var can = document.createElement('canvas');
        		var ctx = can.getContext('2d');
        		can.width = image.width;
    		    can.height = image.height;
    		    ctx.drawImage(image, 0, 0, image.width, image.height);
    		    var rawData = ctx.getImageData(0, 3, image.width, 1).data;
    		    
    		    var themeData = ctx.getImageData(0,0,256,1).data;
    		    var rawPos;
    		    for (var p=0; p<themeData.length;) {
    		    	var a =  Math.floor(image.width*(0.1+0.8*p/1020))*4;
    		        
    		    	themeData[p] = rawData[a]; // get the red value from linear gradient that corresponds to this alpha
    		    	themeData[p + 1] = rawData[a + 1]; //get the green value based on alpha
    		    	themeData[p + 2] = rawData[a + 2]; //get the blue value based on alpha
	            	p+=4; // Move on to the next pixel
            	}
    		    
    		    this.themeData = themeData;
    		    this.createDensity();
            },
            
            createColourGradient:function createColourGradient() {
            	if (!this.themeData) {
            		this.createThemeColourGradient(this.getThemeUrl());
            	}
            	return this.themeData;
            },
            
            createDefaultColourGradient:function createDefaultColourGradient() {
            	var ctx = document.createElement('canvas').getContext('2d');
            	var grd = ctx.createLinearGradient(0, 0, 256, 0);
            	grd.addColorStop(0.0, 'magenta');
            	grd.addColorStop(0.25, 'blue');
            	grd.addColorStop(0.5, 'green');
            	grd.addColorStop(0.75, 'yellow');
            	grd.addColorStop(1, 'red');
            	ctx.fillStyle = grd;
            	ctx.fillRect(0, 0, 256, 1);
            	return ctx.getImageData(0, 0, 256, 1).data;
            },
            
            clearDensity:function clearDensity() {
            	var context = this.canvas.getContext('2d');
            	context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            },
            
            zeroLayer:function zeroLayer(origin){
            	this.div_.style.left = Math.floor(origin.x)+"px";
            	this.div_.style.top = Math.floor(origin.y)+"px";
            },
            
            createDensity:function createDensity() {
            	// Create the Intensity Map
            	var locations = this.locations;
            	if (!locations) return;
            	var radius = 10;
            	var intensity = 0.25;
            	var diameter = 2 * radius;
            	
            	var overlayProjection = this.getProjection();
            	if (!overlayProjection) return;
            	var origin = this.getTopLeft();
            	if (origin) {
            		this.zeroLayer(origin);
            	}
            	this.xOffset = Math.floor(origin.x);
            	this.yOffset = Math.floor(origin.y);
                this.canvasWidth = this.canvas.width = this.width;
                this.canvasHeight = this.canvas.height = this.height;
                
                var colourGradient = this.createColourGradient();
            	if (!colourGradient) {
            		return;
            	}
                var context = this.canvas.getContext('2d');
            	
            	for (var i = 0; i < locations.length; i++) {
            		var attr = locations[i];
	            	var loc = attr.position;
	            	 
	            	// Convert lat/long to pixel location
	            	//if (!this.bounds.contains(loc)) continue;
	            	var pixloc = overlayProjection.fromLatLngToDivPixel(loc);
	            	var x = pixloc.x-this.xOffset;
	            	var y = pixloc.y-this.yOffset;
	            	
	            	this.addToLocationMap(attr,x,y)
	            	 
	            	// Create radial gradient centred on this point
	            	var grd = context.createRadialGradient(x, y, 0, x, y, radius);
	            	grd.addColorStop(0.0, 'rgba(0, 0, 0, 0.10)');
	            	grd.addColorStop(1.0, 'transparent');
	            	//grd.addColorStop(0.0,'rgba(0,0,19,1)');
	            	//grd.addColorStop(1.0,'rgba(255,255,255,0)');
	            	 
	            	// Draw the heatpoint onto the canvas
	            	context.fillStyle = grd;
	            	context.fillRect(x - radius, y - radius, diameter, diameter);
            	}
            	
            	var dat = context.getImageData(0, 0 , this.canvasWidth, this.canvasHeight);
            	var pix = dat.data;
            	
            	
            	for (var p = 0; p < pix.length;) {
            		
            	    var a = pix[p + 3]*4; // get the alpha value of this pixel
            	    pix[p] = colourGradient[a]; // get the red value from linear gradient that corresponds to this alpha
            	    pix[p + 1] = colourGradient[a + 1]; //get the green value based on alpha
            	    pix[p + 2] = colourGradient[a + 2]; //get the blue value based on alpha
            	    pix[p + 3] = Math.min(255,pix[p + 3]* 5);
            	    p+=4; // Move on to the next pixel
            	}
            	context.putImageData(dat, 0, 0);
            	
            	// Populate the canvas
            	context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
            },
            getTopLeft:function getTopLeft(){
            	if (!this.map) {
            		return new google.maps.Point(0,0);
            	}
            	var bounds = this.map.getBounds();
            	var ne = bounds.getNorthEast();
            	var north = ne.lat();
            	var sw = bounds.getSouthWest();
            	var west = sw.lng();
            	var nw = new google.maps.LatLng(north,west);
            	var overlayProjection = this.getProjection();
            	var pixloc = overlayProjection.fromLatLngToDivPixel(nw);
            	var a = pixloc.x;
            	var y = pixloc.y;
            	return pixloc;
            },
            
            /**
             * for handling the location map structure
             */
            
            cleanLocationMap:function cleanLocationMap(){
            	this.locationMap = {};
            },
            addToLocationMap:function addToLocationMap(attr,xraw,yraw) {
            	var x = Math.ceil(xraw);
            	var y = Math.ceil(yraw);
            	if (!this.locationMap[x]) {
            		this.locationMap[x] = {};
            	}
            	if (!this.locationMap[x][y]) {
            		this.locationMap[x][y] = [];
            	}
            	this.locationMap[x][y].push(attr);
            },
            getAttrsFromLocationMap:function getAttrFromLocationMap(xin,yin) {
            	var x = xin-this.xOffset
            	var y = yin-this.yOffset
            	if (this.locationMap[x] && this.locationMap[x][y]) {
            		return this.locationMap[x][y];
            	}
            	return [];
            },
            
            getAttrsFromLocationMapRange:function getAttrsFromLocationMapRange(x,y,range) {
            	var ret = [];
            	for (var i=x-range; i< x+range; i++)
            	{
            		for (var j=y-range; j< y+range; j++)
            		{
            			ret = ret.concat(this.getAttrsFromLocationMap(i,j));
            		}
            	}
            	return ret;
            },
            /**
             * Rectangle Search
             */
            searchRect:function searchRect(bounds) {
            	var overlayProjection = this.getProjection();
            	var ne = bounds.getNorthEast();
            	var pixNe = overlayProjection.fromLatLngToDivPixel(ne);
            	var sw = bounds.getSouthWest();
            	var pixSw = overlayProjection.fromLatLngToDivPixel(sw);
            	var ret = [];
            	var minX = Math.ceil(Math.min(pixNe.x, pixSw.x));
            	var maxX = Math.ceil(Math.max(pixNe.x, pixSw.x));
            	var minY = Math.ceil(Math.min(pixNe.y, pixSw.y));
            	var maxY = Math.ceil(Math.max(pixNe.y, pixSw.y));
            	for (var i = minX; i<=maxX; i++ ){
            		for (var j= minY; j<=maxY; j++) {
            			ret = ret.concat(this.getAttrsFromLocationMap(i,j));
            		}
            	}
            	return ret;
            },
            /**
             * handle pop infoWindow
             */
            cluster:null,
            handleMouseClick:function handleMouseClick(event) {
            	var latlng = event.latLng;
            	var overlayProjection = this.getProjection();
            	if (!overlayProjection) return;
            	var pixLL = overlayProjection.fromLatLngToDivPixel(latlng);
            	this.cluster = this.getAttrsFromLocationMapRange(Math.ceil(pixLL.x),Math.ceil(pixLL.y),5);
            	if (this.cluster.length > 0 ){
            		var pixel = this.cluster[0];
            		if (this.mapWidget.enableClickSelect) {
                        this.mapWidget.handleDensitySelections(this.cluster);
                    } else if (this.mapWidget.enablePopup) {
                    	this.mapWidget.showInfoWindow(pixel,pixel.position);
                    }
            		
            	}
            },
            getLastCluster:function getLastCluster(){
            	return this.cluster;
            },
            	
            
            
            /**
             * TQMS 482936: Need to override the mixin set function to call google Map's set function
             */
            set: function set(n, v) {
                this._super(n,v);
                try {
                    if (typeof(google.maps.OverlayView.prototype.set) == 'function') {
                        google.maps.OverlayView.prototype.set.apply(this,[n,v]);
                    }
                } catch(e) {}
            }
        }
    );
}());
    
    