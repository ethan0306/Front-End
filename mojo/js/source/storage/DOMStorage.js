/**
 * DOMSessionStorage.js 
 * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 *
 * @fileoverview Base class for objects that wrap HTML5 DOM storage APIs.  There is a sub-class for local and session storage.
 * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
 * @version 1.0
 */
 
(function(){
    
    mstrmojo.requiresCls( "mstrmojo.hash" );

    /**
     * @static Local static variable for quick access to globals
     * @private 
     */
    var _H = mstrmojo.hash;
    
    
    /**
     * Returns the elapsed time from specified timestamp until now
     * @private
     * @param {Date} ts Time stamp to measure time from
     * @returns number of milliseconds from timestamp until now
     * @type Integer
     */
    
    var elapsedTm = function(ts) {
        return ( mstrmojo.now() - ts.getTime());
    };
    
     /**
     * Base class for HTML5 DOM storage
     * 
     * @class
     */
    mstrmojo.storage.DOMStorage = mstrmojo.declare( null, null,     
    /**
     *  @lends mstrmojo.storage.DOMStorage.prototype
     */
    {
        scriptClass: "mstrmojo.storage.DOMStorage",
        
        /**
         * indicates whether browser supports HTML5 client-side storage
         * @type Boolean
         */
        mIsSupported: false,
        
        /**
         * Reference to HTML5 storage object; subclasses fill out with the appropriate reference
         * @type HTMLStorage
         */
        mStorageObj: null,
        
        /**
         * time-to-live (in seconds) for items stored in the cache
         * @type integer
         */        
        itemTimeToLive: 3600,

        /**
         * <p>Initializes the object by copying the supplied properties.</p>
         * @returns reference to self to allow for chaining
         * @type mstrmojo.storage.DOMStorage
         */
        init : function init(props) {
            // Apply the given properties to this instance.
            _H.copy(props, this);
            return this;
        },

        /**
         * <p>Returns TRUE if browser supports HTML5 storage</p>
         * @public
         * @returns TRUE if browser supports HTML5 storage.
         * @type Boolean
         */
        isSupported: function isSupported() { return this.mIsSupported; },


        checkVersion: function checkVersion(curVer) {
            
            var  existingVer = this.getItem('__version__');
            // if the data format version is older than we expect then we must clear the cache
            // or convert to the new format.  for now, no conversion is done and we blow away the existing data
            if ( existingVer && existingVer < curVer ) {
                mstrmojo.dbg( "DOMStorage data is old - clearing, v="+existingVer );
                this.clear();
            }
            // store the current version with no expiration
            this.setItem('__version__',curVer,-1);
            
            return this;
        },



        /**
         * <p>Returns the number of items in the HTML5 storage object.  If HTML5 storage is not supported this method returns 0.</p>
         * @public
         * @type Integer
         * @returns Count of name/value pairs in the store.
         */
        length: function() { return ( this.mIsSupported ? this.mStorageObj.length : 0 ); },

    
    
       /**
         * Checks the timestamp of the item data object
         * @private
         * @param {Object} d object containing the item data
         * @returns Returns TRUE if the item has expired and needs to be removed from storage
         * @type Boolean
         */
         
        _keyExpired: function _keyExpired(d) {
            return (d && (d.ts>0) && (mstrmojo.now() > d.ts));
        },
        
        /**
         * <p>Retrieves the key at the specified index in the HTML5 storage object or null if key is not present or HTML5 is not supported.</p>
         * @public

         * @param {Integer} A zero-based index of the list entry, up to the length of the collection.
         * @returns the key at the specified index in the HTML5 storage object
         * @type String 
         */
        key: function(index) { return ( this.mIsSupported ? this.mStorageObj.key(index) : null ); },
        
        /**
         * <p>Returns a string for the specified key or null if the item is not stored or we don't support DOM storage</p>
         *
         * @public
         * @param {String} key value to use as key to find desired data in the storage dictionary
         * @type String
         * @returns returns a JSON string for the data stored with the specfied key
         */     
        getItemAsString: function( key ) {
            var result = this.getItem(key);
            if (result){
                if ( typeof result == "object" ) {
                    // for objects use JSON to do a nice version to something useful
                    result = JSON.stringify(result);    
                } else {
                    // for all other types, appending an empty string will force type conversion
                    result = result + "";
                }
            }
            return result;
        },
        
        /**
         * <p>return a JSON object for the specified key or null if the item is not stored or we don't support DOM storage</p>
         *
         * @public

         * @param {String} key value to use as key to find desired data in the storage dictionary
         * @returns returns a JSON string for the data stored with the specfied key
         * @type Object
        */      

        getItem: function(key) { 
            var result = null;
            if (this.mIsSupported){            
                var d = this.mStorageObj.getItem(key);
                if ( d ) {
                    try { d = JSON.parse(d); } catch(e) { /* eat any parser errors we may come across */ }
                    if ( this._keyExpired( d ) ) {
                        this.removeItem(key);
                    } else {
                        // results are already parsed so we can just return
                        result = d.data;
                    }
                }
            }
            return result;
        },



        /**
         * <p>Adds specified key/value pair into the HTML5 storage.</p>
         *
         * @public

         * @param {String} key value to use as key to find desired data in the storage dictionary
         * @param {any} Data to be associated with the specified key. Data is converted to JSON before being added to the store.
         * @param {Integer} number of seconds that this item is valid in storage or -1 for no expiration
         * @returns reference to self to allow for chaining.
         * @type mstrmojo.storage.DOMStorage
         */     
         
        setItem: function(key,any_data,ttl) {
            ttl = ttl || this.itemTimeToLive;            
            try {
                // NOTE:  May throw QUOTA_EXCEEDED_ERR exceptions if the users storage is full
                if ( this.mIsSupported ) {
                    this.mStorageObj.removeItem(key);
                    
                    // store the caller's data and an expiration date
                    var exp = (ttl > 0) ? (mstrmojo.now() + (ttl*1000)) : -1;
                    var item = { ts: exp, data: any_data };
                    this.mStorageObj.setItem(key,JSON.stringify(item) );
                }
            } catch ( e ) {
                // we silently eat over quota errors and proceed knowing that our code will handle the
                // case where the requested item is not in the store; any other exception is rethrown for the caller to deal with
                if ( e !== QUOTA_EXCEEDED_ERR ) { throw e; }
            } finally {
            }
            return this;
        },


        /**
         * <p>Removes data value associated with specified key from the HTML5 storage.</p>
         *
         * @public

         * @param {String} key value to use as key to find desired data in the storage dictionary
         * @returns reference to self to allow for chaining.
         * @type mstrmojo.storage.DOMStorage
         */     
         
        removeItem: function(key) {
            if ( this.mIsSupported ) { this.mStorageObj.removeItem(key); }
            return this;
        },


        /**
         * <p>Removes all key/value pairs from the DOM Storage.</p>
         *
         * @public
         * @param {String} key value to use as key to find desired data in the storage dictionary
         * @param {any} Data to be associated with the specified key. Data is converted to JSON before being added to the store.
         * @returns reference to self to allow for chaining.
         * @type mstrmojo.storage.DOMStorage
         */     
         
        clear: function() {
            if ( this.mIsSupported ) { this.mStorageObj.clear(); }
            return this;
        }

    } );
    
})();
