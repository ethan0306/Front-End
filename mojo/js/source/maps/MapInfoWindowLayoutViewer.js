(function(){

    mstrmojo.requiresCls("mstrmojo.MobileDocLayoutViewer");
    
    var $CFC = mstrmojo.DynamicClassFactory.newComponent;
    
    // Create a mobile version of the map info layout viewer that fills the entire window.  On mobile, this is desired
    // as the map info windows are displayed in their own WebView
    mstrmojo.maps.MobileMapInfoWindowLayoutViewer = mstrmojo.declare(
        mstrmojo.MobileDocLayoutViewer, 
        null, 
        {
            scriptClass: 'mstrmojo.maps.MobileMapInfoWindowLayoutViewer',
            
            preBuildRendering: function preBuildRendering() {
                //TQMS:508164 set dimension to make the inner content fit to the outside container 
                this.setDimensions(this.height, this.width);
                
                this.set('visible', true);       
            
                return this._super ? this._super() : true;
            }
        }
    );
    
    /**
     * Widget for displaying map info windows.  This class is used in the HOSTED mobile environment only.  It's sole function
     * is to provide a height and width to the layout viewer.  This is necessary because the layout viewer is the root widget
     * and has no parent to provide sizing.
     */
     
    mstrmojo.maps.MapInfoWindowLayoutViewer = mstrmojo.declare(
        // superclass
        mstrmojo.MobileDocLayoutViewer,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.DocLayoutViewer.prototype
         */
        {
            scriptClass: "mstrmojo.maps.MapInfoWindowLayoutViewer",
            
            preBuildRendering: function preBuildRendering() {            
                
                this.set('visible', true);
                
                return this._super ? this._super() : true;
            }        
        }
    );
    
}());