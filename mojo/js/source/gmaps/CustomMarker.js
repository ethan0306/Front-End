CustomMarkerScript = true;

function newEventPassthru(obj, event) {
    //console.log("event triggered:"+event);
    return function() {
        google.maps.event.trigger(obj, event);
    };
}


(function(){
    
    
    mstrmojo.requiresCls("google.maps.OverlayView","mstrmojo.hash");
    
    var _H = mstrmojo.hash;
    
    mstrmojo.gmaps.CustomMarker = mstrmojo.declare(
        // superclass
        google.maps.OverlayView,
            
        // mixins
        [mstrmojo._Provider],
        
        {
            scriptClass: 'mstrmojo.gmaps.CustomMarker',
            
            div_:null,
            //hilightDiv_:null,
            position:new google.maps.LatLng(0,0),
            clickable:false,
            onclickableChange: function onclickableChange() {
            },
            draggable:false,
            isHighlighted:false,
            
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
               
                google.maps.event.addDomListener(this.div_, "mouseover", function(event){
                    that.handleMouseOver(event);
                });
                google.maps.event.addDomListener(this.div_, "mouseout", function(event){
                    that.handleMouseOut(event);
                });
            },
            handleMouseOver:function handleMouseOver(event){
                this.set("isHighlighted", true);
            },
            
            handleMouseOut:function handleMouseOut(event) {
                this.set("isHighlighted", false);
            },
            
            
            draw: function draw() {
            },
            
            onRemove: function onRemove() {
                if (this.div_) {
                    google.maps.event.clearInstanceListeners(this.div_);
                    this.div_.parentNode.removeChild(this.div_);
                    this.div_ = null;
                }
            },
            
            getPosition: function getPosition() {
                if (this.position) {
                    return this.position;
                }
                return google.maps.Latlng(0,0);
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
    
    