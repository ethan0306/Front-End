/**
  * InfoWindowRootController.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>Controller responsible for displaying Map Info window.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */
  
(function() {

    mstrmojo.requiresCls( "mstrmojo.Obj",
                          "mstrmojo.maps.InfoWindowController",
                          "mstrmojo.maps.DocInfoWindowController"
);

    function startController(params) {
        
    }
    
    /**
     * Main controller class for info window applications.
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.maps.InfoWindowRootController = mstrmojo.declare(
            
        mstrmojo.Obj,
        
        null,

        /**
         * @lends mstrmojo.maps.InfoWindowRootController.prototype
         */
        {
            scriptClass: "mstrmojo.maps.InfoWindowRootController",
            
            start: function start(params) {   
                var controllerClass = ( params.isDoc ) ? mstrmojo.maps.DocInfoWindowController : mstrmojo.maps.InfoWindowController;
                
                // Spawn the new controller.
                this.spawn( new controllerClass(params), params);
            },
            
            /**
             * Attaches new controller to the chain and activates it by calling its start method.
             */
            spawn: function spawn(controller, startParams) {
                
                this.nextController = controller;
                controller.prevController = this;
                
                // Start controller.
                controller.start(startParams);
            }
                        
        });
})();