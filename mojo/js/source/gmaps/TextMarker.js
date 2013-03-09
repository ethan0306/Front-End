TextMarkerScript = true;


(function(){
    
    mstrmojo.requiresCls('mstrmojo.gmaps.CustomMarker');
    
    mstrmojo.gmaps.TextMarker = mstrmojo.declare(
        // superclass
        mstrmojo.gmaps.CustomMarker,
            
        // mixins
        null,
        
        {
            scriptClass: 'mstrmojo.gmaps.TextMarker',
            
            div_:null,
            position:null,
            labelOffset : new google.maps.Size(0, 0),
            labelClass : "textMarker",
            labelText : "",
                
            onAdd: function onAdd() {
              // Note: an overlay's receipt of onAdd() indicates that
              // the map's panes are now available for attaching
              // the overlay to the map via the DOM.
            
              this._super();
        
              // Create the DIV and set some basic attributes.
              var div = this.div_;
              div.className = this.labelClass;
              div.innerHTML = this.labelText;
              
            },
            
            draw: function draw() {
                // We only need to do anything if the coordinate system has changed
                //if (!force) return;
                var overlayProjection = this.getProjection();
                
                // Calculate the DIV coordinates of two opposite corners of our bounds to
                // get the size and position of our rectangle
                var p = overlayProjection.fromLatLngToDivPixel(this.position);
                //var z = google.maps.Overlay.getZIndex(this.position.lat());
                
                // Now position our DIV based on the DIV coordinates of our bounds
                this.div_.style.left = (p.x + this.labelOffset.width) + "px";
                this.div_.style.top = (p.y + this.labelOffset.height) + "px";
            }
        }
    );
})();
    
