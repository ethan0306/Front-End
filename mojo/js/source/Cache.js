(function() {

    function getDB() {
        try{
            if(!window.openDatabase) {
                alert('not supported');
            } else {
                var shortName = 'mojodb',
                    version = '1.0',
                    displayName = 'Mojo Local Cache Database',
                    maxSize = 65536;

                var myDB = openDatabase(shortName, version, displayName, maxSize);
                return myDB;
            }
        } catch(e) {
            alert("Database error: " + e);
        }
    }
    
    function createTable(db) {
        
        if(!db) {
            alert('no database');
        }
        
        db.transaction(
                function (transaction) {
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS datacache (id INTEGER PRIMARY KEY AUTOINCREMENT, objId NVARCHAR(64), datablob BLOB NOT NULL DEFAULT "");', [], nullDataHandler, errorHandler);
                }
            );        
    }    
    
    /*! When passed as the error handler, this causes a transaction to fail with a warning message. */
    function errorHandler(transaction, error)
    {
        // error.message is a human-readable string.
        // error.code is a numeric error code
        alert('Oops.  Error was '+ error.message +' (Code '+error.code+')');
     
        // Handle errors here
        var we_think_this_error_is_fatal = true;
        if (we_think_this_error_is_fatal) {
            return true;
        }
        return false;
    }
    
    function saveDataIntoDB(db, key, data) {

        if(!db) {
            alert('Could not open database connection.');
        }        
        
        db.transaction(
            function (transaction) {
                transaction.executeSql("INSERT INTO datacache (objId, datablob) VALUES (?, ?);",
                    [ key, data ], // array of values for the ? placeholders
                    nullDataHandler, errorHandler);
                }
        );              
    }
    
    
    /*! This is used as a data handler for a request that should return no data. */
    function nullDataHandler(transaction, results)
    {
        
    }        
    
    function getDataFromDB(db, objId, success, fail) {
        
        if(!db) {
            alert('Could not open database connection.');
        }

        db.transaction(
            function (transaction) {
                var query = "SELECT datablob FROM datacache where objId = '" + objId + "';";
                transaction.executeSql(query, [],
                        function(transaction, results) {
                    
                            if(!results.rows.length) {
                                fail(objId);
                            } else {
                    
                                var data = null;
                                
                                for(var i = 0; i < results.rows.length; i++) {
                                    var row = results.rows.item(i);
                                    data = row.datablob;
                                }
                                success(data);
                            }
                        },
                        errorHandler);
            }
        );
    }
    
    function dropTable(db) {
        if(!db) {
            alert('Could not open database connection.');
        }

        db.transaction(
            function (transaction) {
                transaction.executeSql("DROP TABLE datacache;");
            }
        );
    }
    
    mstrmojo.Cache = mstrmojo.declare(
        null, null,
        {
            scriptClass: "mstrmojo.Cache",
            
            init: function() {
                this.db = getDB();
                createTable(this.db);
            },
                        
            cacheData: function(key, value) {
                saveDataIntoDB(this.db, key, value);
            },
            
            loadFromCache: function(key, cfg) {
                getDataFromDB(this.db, key, cfg.success, cfg.failure);
            },
            
            clearCache: function() {
                dropTable(this.db);
            }
        }
    );

})();