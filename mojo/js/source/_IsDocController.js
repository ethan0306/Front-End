(function() {
    
    mstrmojo.requiresCls("mstrmojo.EnumReadystate");
    /**
     * The mixin includes the utility functions for document controller
     */

    var $RS = mstrmojo.EnumReadystate;    
    
    /**
     * Returns a given view's key as set in the document model.
     * 
     * @param A MicroStrategy RSD view widget
     * @return The view's key.
     */
    function getViewKey(view) {
        return (view.getKey && view.getKey()) || view.k;
    }
    
    mstrmojo._IsDocController = {
        _mixinName: 'mstrmojo._IsDocController',
        
        _getXtabCallback: function (xtab) {
            var targetDefinitions = {},
                defn = targetDefinitions[getViewKey(xtab)] = xtab.defn,
                me = this,
                model = me.model;

            return {
                submission: function () {
                    defn.set('readyState', $RS.WAITING);
                },
                
                success: function (res) {
                    if (res.pukeys) {
                        targetDefinitions = model.getUnitDefinitions(res.pukeys);
                    }
                    model.partialUpdate(res.data, targetDefinitions);
                },
                
                failure: function (details) {
                    mstrmojo.alert(details.code + ': ' + details.message);
                },
                
                complete: function () {
                    defn.set('readyState', $RS.IDLE);
                    me.docRequestComplete();
                }
            };
        },
    
        _addNodeKeyToAction: function (view, action) {
            action.nodeKey = getViewKey(view);
            return action;
        },
        
        onGridSelector: function (view, action) {
            // Delegate slice to the DocModel.
            action.sid = view.sid;
            this.model.slice(action);
        },
        
        // TQMS 493914
        /**
         * Method to check if currently any request is in progress.
         */
        isInRequest: function isInRequest() {
        	var inProcess = !!this._inProcess;
        	if (!inProcess) {
        		this._inProcess = true;
        	}
        	
        	return inProcess;
        },
        /**
         * when the request is completed set the in process status to false
         */
        docRequestComplete: function docRequestComplete() {
        	this._inProcess = false;
        },

        /**
         * Retrieve the group by element list. The function will go through each group by item in the current layout,
         * find the selected element, and join them using "," to generate a string.
         * 
         * @param {mstrmojo.Widget} w The widget to which
         *  
         * @returns {String} A comma delimited string containing selected group by element items.   
         */
        getGroupByElements: function getGroupByElements(w) {
            var gbelems = [],
                keys;
            //Find a section containing group by elements.
            while (w ) {
                var keys = w.node && w.node.data && w.node.data.pbes;
                if ( keys ) {
                    break;
                }
                w = w.parent;
            }
            
            if (keys) {
                var dataElems = this.model.data.elems;
                
                for (var i = 0, len = keys.length; i < len; i++) {
                    var idx = keys[i];
                    gbelems.push(isNaN(idx) ? idx : dataElems && dataElems[idx]);
                }
            }
            
            return gbelems;
        }
        
        
    };
    
}());