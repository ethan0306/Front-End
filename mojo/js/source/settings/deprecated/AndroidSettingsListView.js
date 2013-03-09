/**
  * AndroidSettingsListView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>Widget for displaying mopbile server list. Note that you must call setData() and provide an item renderer.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */
(function () {

    mstrmojo.requiresCls("mstrmojo.AndroidView",
                         "mstrmojo.MobileList2",
                         "mstrmojo.dom",
                         "mstrmojo.css"
                     );
    
    var $D = mstrmojo.dom;

    /**
     * Widget for displaying folder contents on an Android Device.
     * 
     * @class
     * @extends mstrmojo.VBox
     */
    mstrmojo.settings.AndroidSettingsListView = mstrmojo.declare(
        mstrmojo.AndroidView,

        null, /* mixins */

        /**
         * @lends mstrmojo.AndroidSettingsListView.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidSettingsListView",       
            contentChild: {
                scriptClass: "mstrmojo.MobileList2",
                cssClass: 'android-settings-list',
                scrollerConfig: { 
                    noVScroll: true,
                    bounces: false,
                    showScrollbars: false
                },
                                
                performTouchAction: function(touch) {                    
                    var item = $D.findAncestorByAttr(touch.target, 'idx', true, this.domNode);
                    if (!item) {
                        return;
                    }                    
                    this.singleSelect(item.value);
                },
                
                touchTap: function(touch) {
                    this.performTouchAction(touch);
                }                                
            },
                
            init: function init(props){
                this._super(props);

                // set the title for our list
                this.updateTitle(props.ttl || '');
            },
            
            getItems: function() {
                return this.contentChild.items;
            },

            /**
             * Passes reference to the device configuration data to this view for display.
             * @param {Object} configObj object that describes the folder's contents
             */
            setData: function ( dataObj ) {        
                                    
                // if we've been provided with one, update the list view with a new renderer that has knowledge of how to draw the new list items
                if ( dataObj.itemRenderer ) {
                    this.contentChild.itemRenderer = dataObj.itemRenderer;
                }             
                // set the new items into the list
                this.contentChild.set('items',dataObj.items );   
            }
                        
            
        }
    );
})();