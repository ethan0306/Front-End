(function() {
    
    mstrmojo.requiresCls("mstrmojo.hash");
    
    var $H = mstrmojo.hash;
    
    /**
     * Minxin for editable grid/textfield.
     */
    mstrmojo._CanSupportTransaction = {
            
        _mixinName: "mstrmojo._CanSupportTransaction",
        
        /**
         * A map object storing all the changes.
         * The key that distinguish the grid data row.
         * The value store is an object with three properties: v for new value, r for raw data, and d for domNode of the target field.  
         */
        updatedCellsMap: null,
                        
        /**
         * Returns the update xml string
         */
        getUpdates: mstrmojo.emptyFn, //should be subclassed
        
        /**
         * Returns the update JSON object
         */
        getUpdateObject: mstrmojo.emptyFn, //should be subclassed

        /**
         * Gets the context properties for the given key
         */
        getKeyContext: mstrmojo.emptyFn, //should be subclassed
        
        /**
         * Refresh the data to enable the changes to the data model.
         * It leave the controller to decide whether to call it.
         */
        autoRefresh: mstrmojo.emptyFn, //should be subclassed
        
        /**
         * Applies the changes once the data is changed with the input editor.
         * @param {String} k Key of the cell 
         * @param {String} r Original value
         * @param {Object} v {dv: display_value, v: value}  Changed value
         * @param {HTMLElement} [d] container DOM object that holds the data
         * @param {Boolean} [invalid] whether the changed value is invalid or not
         */
        dataChanged: function dataChanged(k, r, v, d) {
            //apply the changes, and check whether we should refresh the data
            var autoRefresh = this.updateValue(k, v);
            //add changes into um
            this.updatedCellsMap[k] = {r: r, v: v};
            
            //notify the controller to send update changes to server
            this.controller.onTransactionUpdates(this, this.getUpdateObject(), autoRefresh);
        },
        
        /**
         * Attaches the onclick listener if the show control by default is enabled.
         */
        postBuildRendering: function pstBldRnd() {
            if(this._super) {
                this._super();
            }
            
            if (!this.txModel){
            	this.txModel = this.model.docModel || this.model;
            }
            
            this.updatedCellsMap = this.updatedCellsMap || {};           
        },

        /**
         * Change the value on the data model. It returns a flag indicating whether we should do auto refresh.
         * The function should be subclassed to apply the view changes and returns the auto refresh boolean value. 
         * @returns Boolean True if the widget needs to call autoRefresh once the changes are submitted. 
         */
        updateValue: function(k, v) {
            if(this.txModel.deltaUpdate) {
                this.txModel.deltaUpdate(this);
            }
            return false;
        },

        /**
         * Get the key value pairs of updated fields.
         * @returns {Array} An array of updated key value pair.
         */
        getUpdatedValues: function() {
            var um = this.updatedCellsMap,
                i, u, vs = [];
            for(i in um) {
                if(um.hasOwnProperty(i)) {
                    u = {};
                    u.v = um[i].v.v;
                    vs.push($H.copy(this.getKeyContext(i), u));
                }
            }
            return vs;
        },        
        
        /**
         * Clear recorded updated fields
         */
        clear: function() {
            this.updatedCellsMap = {};
            
            if(this.txModel.removeDeltaUpdate) {
                this.txModel.removeDeltaUpdate(this);
            }
        }
    };
}());