/**
 * DOMLocalStorage.js 
 * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
 *
 * @fileoverview wrapper classes around the DOM Local Storage API in HTML5.
 * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
 * @version 1.0
 */

(function(){

    mstrmojo.requiresCls( "mstrmojo.storage.DOMStorage" );

    var LOCAL_STORAGE_DATA_FORMAT_VERSION = 4;

    /**
     * <p>Class that manages DOM local storage.</p>
     * @class
     * @augments mstrmojo.storage.DOMStorage
     */
    mstrmojo.storage.DOMLocalStorage = mstrmojo.declare(mstrmojo.storage.DOMStorage, null, 
        /**
         * @lends mstrmojo.storage.DOMLocalStorage.prototype
         */     
        {
            scriptClass : "mstrmojo.storage.DOMLocalStorage",
        
                
            /**
             * Initializes the object with reference to localStorage object if available.\
             * @memberOf mstrmojo.storage.DOMLocalStorage
             * @param {Object} [props] Hash of property values to be applied to this instance.       
             */
             
            init : function(props) {
                this._super(props);
                
                // detect the feature watching out for exceptions that can be thrown if the user
                // has disabled storage, etc.
                try {
                    this.mIsSupported = ('localStorage' in window) && (window['localStorage'] !== null);        
                    this.mStorageObj = this.mIsSupported ? window.localStorage : null;

                    this.checkVersion(LOCAL_STORAGE_DATA_FORMAT_VERSION);                

                } catch (e) {
                    // eat any exceptions and just turn off the feature
                    this.mIsSupported = false;
                }
            }
        });

    /**
     * Alias to the singleton object that manages the DOM local storage. We increase the ttl for local storage items to 24 hours.
     * @static
     */
    $LS = mstrmojo.global.localStore = new mstrmojo.storage.DOMLocalStorage({ itemTimeToLive: (3600 * 24) });

})();
