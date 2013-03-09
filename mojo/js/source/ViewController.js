/**
 * ViewController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */
(function () {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo._Can");

    /**
     * Main Widget class for mobile applications.
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._FillsBrowser
     */
    mstrmojo.ViewController = mstrmojo.declare(
        mstrmojo.Obj,
        
        [ mstrmojo._Can ],

        /**
         * @lends mstrmojo.ViewController.prototype
         */
        {
            scriptClass: "mstrmojo.ViewController",
            
            /**
             * This method is called by a preceding controller's spawn method to notify this controller that it's his
             * turn to be in controller (for the root controller this method is called by the application).
             *
             * @param {Object} startParams The parmeters for this start operation.
             */
            start: mstrmojo.emptyFn,
            
            /**
             * Detaches this controller from the controller chain by clearing appropriate next/previous references.
             * 
             * @returns {mstrmojo.ViewController} Reference to the next controller if it exists or null/undefined if not.
             * @type mstrmojo.ViewController, null, or undefined
             */
            detach: function detach() {
                var me = this,
                    nextController = me.nextController,
                    prevController = me.prevController;

                
                
                //We can destroy views only after animation finished
            	mstrApp.doAfterAnimation(function () {
                    if (prevController) {
                        // Clear the next controller property of the previous controller.
                        delete prevController.nextController;
                    }
                    // Do we have a next controller?
                    if (nextController) {
                        //Destroy it now.
                        nextController.destroy();
                    }
                    
                    // Kill our next and previous controller references.
                    me.nextController = me.prevController = null;
                    me.destroyViews();
                });
            },
            
            /**
             * Extends the mstrmojo.Obj method to destroy the object but before doing so, it destroys all of its child views
             * and detaches itself and its controllers. 
             */
            destroy: function destroy() {
                //Detach the controller
                this.detach();
                
                //Call super so that the widget is then destroyed.
                if (this._super) {
                    this._super();
                }
            },
            
            /**
             * Attaches new controller to the chain and activates it by calling its start method.
             * 
             * @param {mstrmojo.MobileBookletController} controller The controller to spawn.
             * @param {Object} [startParams] An optional object containing parameters that will be passed to the controller in it's start method.
             */
            spawn: function spawn(controller, startParams, view) {
                // Make sure we have params.
                startParams = startParams || {};
                
                this.nextController = controller;
                controller.prevController = this;
                
                // Start controller.
                controller.start(startParams, view);
            },
            
            spawnFailed: mstrmojo.emptyFn,
            
            goBack: mstrmojo.emptyFn,
            
            makeCurrent: mstrmojo.emptyFn,
            
            /**
             * Instantiates the requested {@link mstrmojo.MobileView}.
             * 
             * @param {String} viewKey The key of the view to instantiate (see {@link mstrmojo.MobileViewFactory}.
             * @param {String} [title=''] The text to appear in the title of the new view.
             * @param {Object} [params={}] An object with parameters that will be passed to the view factory for the new view.
             * 
             * @returns {mstrmojo.MobileView} The newly created view.
             */
            newView: function newView(viewKey, params) {
                params = params || {};
                
                params.controller = this;
                var view = mstrApp.viewFactory.newView(viewKey, params);
                
                // Did we not get a view back from the factory?
                if (!view) {
                    alert('This view is not implemented yet.');
                    return;
                }
                
                return view;
            },
            
            destroyViews: mstrmojo.emptyFn,
            
            /**
             * Converts object subtype into view key
             *
             * @param {int} subtype The requested object subtype.
             * 
             * @returns {String} The view key.
             */
            getViewKey: function getViewKey(subtype) {
                return {
                    1: 'Home',
                    2: 'Home',
                    3: 'Subscriptions',
                    4: 'Settings',
                    5: 'Projects',
                    6: 'Help',
                    768: 'Xtab',
                    769: 'Graph',
                    774: 'Xtab',
                    2048: 'Folder',
                    14081: 'Document'
                }[subtype];
            }
        }
    );
}());