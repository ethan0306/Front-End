/**
  * AndroidLegalView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>Widget for displaying the Legal page on Android devices.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */
(function () {

    mstrmojo.requiresCls("mstrmojo.VBox");
    
    /**
     * Widget for displaying folder contents on an Android Device.
     * 
     * @class
     * @extends mstrmojo.VBox
     */
    mstrmojo.settings.AndroidLegalView = mstrmojo.declare(
        mstrmojo.VBox,

        null, /* mixins */

        /**
         * @lends mstrmojo.AndroidLegalView.prototype
         */
        {
            scriptClass: "mstrmojo.settings.AndroidLegalView",
            
            markupString: '<div id="{@id}" class="mstrmojo-AndroidSettingsView mstrmojo-AndroidLegalView {@cssClass}" style="{@cssText}">' +
                          '</div>',

            markupSlots: {
                // TBD
            },

            layoutConfig: {
                h: {
                    contentNode: '100%'
                },
                w: {
                    contentNode: '100%'
                }
            },
            
            children: [
                // TBD
            ]
                                                
        }
    );
})();


