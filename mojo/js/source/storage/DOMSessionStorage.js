/**
 * DOMSessionStorage.js 
 * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
 *
 * @fileoverview wrapper classes around the DOM Session Storage API in HTML5.
 * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
 * @version 1.0
 */

(function(){

    mstrmojo.requiresCls( "mstrmojo.storage.DOMStorage" );

    var     SESSION_STORAGE_DATA_FORMAT_VERSION = 4;

    /**
     * <p>Class that manages DOM session storage. Data stored using this class persists for the current session only.</p>
     *
     * @class
     * @augments mstrmojo.storage.DOMSessionStorage
     */
    
    mstrmojo.storage.DOMSessionStorage = mstrmojo.declare(mstrmojo.storage.DOMStorage, null, 
        /**
         * @lends mstrmojo.storage.DOMSessionStorage.prototype
         */             
        {
        scriptClass : "mstrmojo.storage.DOMSessionStorage",
        
        
        /**
         * Initializes the object with reference to localStorage object if available.\
         * @methodOf mstrmojo.storage.DOMSessionStorage
         * @param {Object} [props] Hash of property values to be applied to this instance.       
         */
        init : function(props) {
            this._super(props);

            // detect the feature watching out for exceptions that can be thrown if the user
            // has disabled storage, etc.
            try {
                this.mIsSupported = ('sessionStorage' in window) && (window['sessionStorage'] !== null);        
                this.mStorageObj = this.mIsSupported ? window.sessionStorage : null;

                this.checkVersion(SESSION_STORAGE_DATA_FORMAT_VERSION);
                
            } catch (e) {
                // eat any exceptions and just turn off the feature
                this.mIsSupported = false;
            }
        }
    });

    $SS = mstrmojo.global.sessionStore = new mstrmojo.storage.DOMSessionStorage();

})();
