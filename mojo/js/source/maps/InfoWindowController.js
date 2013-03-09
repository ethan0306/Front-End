/**
  * InfoWindowController.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>Controller responsible for displaying Map Info window.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */
(function() {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.maps.InfoWindow"
                      );
    
    /**
     * Main controller class for mobile applications.
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.maps.InfoWindowController = mstrmojo.declare(
            
        mstrmojo.Obj,
        
        null,

        /**
         * @lends mstrmojo.maps.InfoWindowController.prototype
         */
        {
            scriptClass: "mstrmojo.maps.InfoWindowController",
            
            start: function start(params) {
                params = params || {};
                
                // Create new view to display the info window.
                var win = this.infoWindow = new mstrmojo.maps.InfoWindow(params);
                win.start();                
            }
        });
})();