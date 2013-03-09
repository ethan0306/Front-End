/**
  * _HasHostedDeleteButton.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>Widget for displaying and modifying device configuration settings on Android devices.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */

(function () {
    
    var CLASS_NAME = 'mstrmojo.android._HasHostedDeleteButton';
    
    /**
     * <p>A mixin for adding a Delete button to android main title bar</p>
     */
     
    mstrmojo.android._HasHostedDeleteButton = mstrmojo.provide(
        'mstrmojo.android._HasHostedDeleteButton',
        
        /**
         * @lends mstrmojo._HasHostedDeleteButton
         */
        {
            _mixinName: 'mstrmojo.android._HasHostedDeleteButton',
            
            createDeleteButton: function(fn) {
                // Is the app hosted?
                if (!mstrApp.isTouchApp()) {

                    // Create a button that will invoke a goBack call on the app for hosted mode.
                    var titleNode = this.parent.titleNode,
                        bl = document.createElement('div');
                    
                    bl.className = 'hostedDeleteBtn';
                    bl.setAttribute('title', 'Delete');
                    bl.onclick = fn;
                    bl.setAttribute('id',"deleteMe");
                    titleNode.insertBefore(bl,titleNode.firstChild);
                }
            }                        
        }
    );
})();