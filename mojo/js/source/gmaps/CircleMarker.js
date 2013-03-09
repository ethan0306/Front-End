CircleMarkerScript = true;

function circleMarkerRequires(){
    if (typeof(dojo) != 'undefined')
    {
        dojo.require("dojox.gfx");
    } else {
        window.setTimeout(circleMarkerRequires,300);
    }
}
circleMarkerRequires();

(function(){
    
    mstrmojo.requiresCls('mstrmojo.gmaps.CustomMarker');
    
    mstrmojo.gmaps.CircleMarker = mstrmojo.declare(
        // superclass
        mstrmojo.gmaps.CustomMarker,
            
        // mixins
        null,
        
        {
            scriptClass: 'mstrmojo.gmaps.CircleMarker',
            
            center:new google.maps.LatLng(0,0),
            oncenterChange:function oncenterChange() {
                this.position = this.center;
            },
            nodeName:'circleMarker',
            surface:null,
            radius:20,
            onradiusChange:function onradiusChange() {
                //console.log("Draw Circle");
                var overlayProjection = this.getProjection();
                
                if (overlayProjection == null) {
                	return;
                }
                var overallRadius = this.radius+this.strokeWeight+4;
                var overallDiameter = overallRadius * 2;
                if (this.surface) {
                	this.surface.setDimensions(overallDiameter, overallDiameter);
                }
                
                // Calculate the DIV coordinates of two opposite corners of our bounds to
                // get the size and position of our rectangle
                var p = overlayProjection.fromLatLngToDivPixel(this.center);
                //var z = google.maps.Overlay.getZIndex(this.position.lat());
                
                // Now position our DIV based on the DIV coordinates of our bounds
                this.div_.style.left = (p.x - overallRadius) + "px";
                this.div_.style.top = (p.y - overallRadius) + "px";
                //this.div.style.zIndex = z + 1; // in front of the marker
                
                this.circle.setShape({cx: overallRadius,
                                      cy: overallRadius,
                                      r : this.radius});
                this.outer1.setShape({cx: overallRadius,
                                      cy: overallRadius,
                                      r : this.radius+3});
                this.outer2.setShape({cx: overallRadius,
                	                  cy: overallRadius,
                	                  r : this.radius+1});
                
            },
            labelClass : "circleMarker",
            fillColor : "#FF0000",
            onfillColorChange:function onfillColorChange() {
            	if (this.circle) {
                    this.circle.setFill(this.fillColor);
            	}
            },
            fillOpacity : 0.75,
            strokeColor : "#FFFFFF",
            strokeOpacity : 1,
            strokeWeight : 1,
            circle:null,
            outer1:null,
            outer2:null,
            highlightColor :"#0000FF",
            selectedColor:"#0000FF",
            isSelected : false,
            onisSelectedChange:function onisSelectedChange() {
                if (!this.circle) {
                    
                    return;
                }
                if (this.isSelected) {
                    this.outer1.rawNode.style.display = 'inline';
                    this.outer2.rawNode.style.display = 'inline';
                    /*
                    this.circle.setStroke({color:this.selectedColor,width:this.strokeWeight});
                    */
                } else {
                    this.outer1.rawNode.style.display = 'none';
                    this.outer2.rawNode.style.display = 'none';
                    if (this.isHighlighted){
                    
                        this.circle.setStroke({color:this.highlightColor,width:this.strokeWeight});
                    } else {
                        this.circle.setStroke({color:this.strokeColor,width:this.strokeWeight});
                    }
                }
            },
            //isHighlighted:false,
            onisHighlightedChange:function onisHighlightedChange() {
                if (!this.circle) {
                    return;
                }
                if (this.isHighlighted) {
                    this.circle.setStroke({color:this.highlightColor,width:this.strokeWeight});
                } else if (this.isSelected){
                    this.circle.setStroke({color:this.selectedColor,width:this.strokeWeight});
                } else {
                    this.circle.setStroke({color:this.strokeColor,width:this.strokeWeight});
                }
            },
                
            onAdd: function onAdd() {
                this._super();
                var div = this.div_;
                div.className = this.labelClass;
                  
                var g = dojox.gfx.createSurface(div, (this.radius+this.strokeWeight+4)*2, (this.radius+this.strokeWeight+4)*2);
                  
                this.circle = g.createCircle({cx : (this.radius+this.strokeWeight+4), cy : (this.radius+this.strokeWeight+4), r : this.radius}).setFill(this.fillColor)
                    .setStroke({color:this.strokeColor,width:this.strokeWeight});
                
                this.outer1 = g.createCircle({cx : (this.radius+this.strokeWeight+4), cy : (this.radius+this.strokeWeight+4), r : this.radius+2}).setStroke({color:"white",width:1});
                this.outer2 = g.createCircle({cx : (this.radius+this.strokeWeight+4), cy : (this.radius+this.strokeWeight+4), r : this.radius+1}).setStroke({color:"#F0F0F0",width:1});
                //this.outer2.setAttributeNS(null, 'display', 'none');
                this.outer1.rawNode.style.display = 'none';
                this.outer2.rawNode.style.display = 'none';
                this.surface = g;
            },
                        
            draw: function draw() {
                //console.log("Draw Circle");
                var overlayProjection = this.getProjection();
                
                // Calculate the DIV coordinates of two opposite corners of our bounds to
                // get the size and position of our rectangle
                var p = overlayProjection.fromLatLngToDivPixel(this.center);
                //var z = google.maps.Overlay.getZIndex(this.position.lat());
                
                // Now position our DIV based on the DIV coordinates of our bounds
                this.div_.style.left = (p.x - this.radius-this.strokeWeight-4) + "px";
                this.div_.style.top = (p.y - this.radius-this.strokeWeight-4) + "px";
                //this.div.style.zIndex = z + 1; // in front of the marker
            },
            
            //position:null,
            getPosition: function getPosition() {
                if (this.center) {
                    return this.center;
                }
                return google.maps.Latlng(0,0);
            }
        }
    );
})();
    
    