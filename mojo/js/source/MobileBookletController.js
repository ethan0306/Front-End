/**
 * MobileBookletController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */

(function() {

    mstrmojo.requiresCls("mstrmojo.ViewController");

    /**
     * @private
     */
    var CLASS_NAME = 'MobileBookletController',
    	prevCheckTime = 0;
    
    /**
     * Base class for the booklet controllers.
     * 
     * @class
     * @extends mstrmojo.ViewController
     * 
     */
    mstrmojo.MobileBookletController = mstrmojo.declare(
        mstrmojo.ViewController,
        null,

        /**
         * @lends mstrmojo.MobileBookletController.prototype
         */
        {
            scriptClass: "mstrmojo.MobileBookletController",
            
            spawn: function spawn(controller, startParams, view) {
                // Set booklet reference.
                controller.booklet = this.booklet;
                
                this._super(controller, startParams, view);
            },
            
            /**
             * Destroys all views associated with this controller up to and including the last view.
             * 
             */
            destroyViews: function destroyViews() {
                // Do we have a first view?
                var firstView = this.firstView;
                if (firstView) {
                    // Ask the booklet to destroy all views (from the end to the first view).
                    this.booklet.destroyViews(firstView);
                }
                
                // Kill references.
                this.firstView = this.lastView = null;
            },
            
            /**
             * This method notifies the controller that it shall go one view back. Normally the application will call goBack on the
             * root controller in response to the BACK button. The root controller will pass it to the next controller and so on
             * until the call reaches the last controller. If the last controller has views it manages it removes
             * the last view and returns true, which informs its predecessor that request fulfilled. If there is no views to remove 
             * the controller will return false. In this case the predecessor will try removing its view and so on.
             */
            goBack: function goBack() {
                
                var nextController = this.nextController,
                    lastView = this.lastView,
                    booklet = this.booklet;
                
                // Do we have a next controller and can it handle the "Back" command?
                if  (this.delegateGoBack()) {
                    return true;
                } else {
                    // Cancel any pending requests.
                    // TODO: This probably shouldn't happen here because it gets called multiple times when controllers get chained (which is any screen but the home screen).  I think 
                    // it should happen in the mstrmojo.MobileApp.goBack method.
                    if (mstrApp.cancelPending()) {
                        return true;
                    }
                    return this.selfGoBack();
                }
            },
            
            /**
             * Makes given controller a current one. Detaches next controller if present. Makes the last view of this controller 
             * a current view of the booklet.
             */
            makeCurrent: function makeCurrent() {
                var nextController = this.nextController,
                	booklet = this.booklet,
                	lastView = this.lastView;
                if ( nextController ) {
                	if ( lastView != booklet.getCurrentView()) {
	                    // Turn back to our last view.
	                    booklet.goBack(lastView, booklet.ANIMATION_FORWARD);
                	}
                    nextController.detach();
                }
            },

            //Oberridable
            delegateGoBack: function delegateGoBack() {
                
                var nextController = this.nextController;
                
                // Do we have a next controller and can it handle the "Back" command?
                if  (nextController && nextController.goBack()) {
                    // Is our last view the last view in the booklet?
                    if (this.lastView === this.booklet.getCurrentView()) {
                        // Detach the next controller.
                        nextController.destroy();
                    }
                    return true;
                }
                return false;
            },
            
            selfGoBack: function selfGoBack() {
                
                var lastView = this.lastView,
                    booklet = this.booklet,
                    firstView = this.firstView;
                
                if (firstView) {
                	//TQMS 484627 We need to ignore back buttons while we are animating
                	// TQMS 57121 In case webkitTransitionEnd event is not fired in some devices than check the time and allow to go back
                	if(mstrApp.animating) {
                		if(prevCheckTime === 0) {
                			prevCheckTime = mstrmojo.now();
                			return true;
                		} else if( mstrmojo.now() - prevCheckTime > 2000) {
                			mstrApp.animating = false;
                		} else {
                			return true;
                		}
                	}
                	prevCheckTime = 0;

                	// Can the booklet handle the "Back" command?
                    if (booklet.turnBack()) {
                        // Did I only have one view?
                        if (lastView === firstView) {
                            // Kill renference to first and last view.
                            delete this.firstView;
                            delete this.lastView;
                            
                        } else {
                            // Reset last view reference to the current view.
                            this.lastView = booklet.getCurrentView();
                        }
                        
                        return true;
                    }
                }
                return false;
            },

            /**
             * <p>Called by nextController views when they are ready to be displayed in the booklet.</p>
             * 
             * @param {mstrmojo.MobileView} view The view that is ready to be displayed.
             */
            addView: function addView(view, animation) {
                $MAPF(true, CLASS_NAME);
                
                var booklet = this.booklet,
                    afterView = this.lastView,
                    prevController = this.prevController,
                	nextController = this.nextController;
                
                // Is this the first view for this controller but does the previous controller have a last view?
                if (!afterView && prevController && prevController.getLastView) {
                    // Reset after view to the last view from the previous controller.
                    afterView = prevController.getLastView();
                } 
                
                booklet.addView(view, afterView, animation);
                
                // Set first and last view references.
                this.firstView = this.firstView || view;
                this.lastView = view;
                //As we displayed our view we must detach the next controller
	            if ( nextController ) {
	                nextController.detach();
	            }
                
                $MAPF(false, CLASS_NAME);
            },
            
            /**
             * Returns the last view in the booklet.
             * 
             * @type {mstrmojo.Widget}
             */
            getLastView: function getLastView() {
                var previousController = this.prevController;
                return this.lastView || (previousController && previousController.getLastView && previousController.getLastView());
            },         
            
            /**
             * Returns the last chained controller for this booklet.
             * 
             * @type {mstrmojo.ViewController}
             */
            getLastController: function getLastController() {
                var nextController = this.nextController;
                return (nextController && nextController.getLastController()) || this;
            },
               
            /**
             * <p>Called by nextController views if they fail during loading.</p>
             * 
             * @param {mstrmojo.MobileView} view The view that failed.
             * 
             */
            viewFailed: function viewFailed(details) {
                // Did we get details as to why the view failed?
                if (details) {
                    mstrmojo.dbg("details: " + JSON.stringify(details));
                }
                                
                // Hide the wait message.
                mstrApp.hideMessage();
                
                // Handle the error.
                if ( ! this.firstView ) {
	                // View failed during spawn so notify previous controller.
	                var previousController = this.prevController;
	                if (previousController) {
	                    previousController.spawnFailed(details);
	                }
                } else {
                    this.makeCurrent();
                }
                mstrApp.onerror(details);
            }
        });
}());