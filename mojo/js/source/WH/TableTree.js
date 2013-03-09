(function () {
    mstrmojo.requiresCls(  
    	     "mstrmojo.TreeBrowser"
	);
    mstrmojo.requiresDescs(9142,773, 9143); 
 
    /************************Private methods*********************************/

    mstrmojo.WH.TableTree = mstrmojo.declare(
        // superclass
        mstrmojo.TreeBrowser,
        // mixins
        null,
        // instance members
       {   
        	    scriptClass:"mstrmojo.WH.TableTree",
        	    cssClass: "mstrmojo-TreeBrowser mstrmojo-Architect-WarehouseTablesTree",
		        items: [],
		        _model:null,
	            itemDisplayField: 'n',
	            useCache: false,
	            multiSelect:true,
	            noCheckBox: true,
	            itemIdField: 'did',
	            selectionAcrossBranch: false,
	            listSelector: mstrmojo.ListSelector,
	            branchClickPolicy: mstrmojo.TreeBrowserEnum.BRANCH_POLICY_SELECT,
           	    getContentThroughTaskCall: function getContentThroughTaskCall(params, callbacks){
	                //get column content
	                var m = this._model, me=this;
		            if (params.isRoot){
		            	callbacks.success(me.items);
		            }else {
		              if(m){
		                m.getColumnsForDBTable(params, callbacks);
		              }
		            }  			            	
	            },
	            isBranch: function isBranch(data){
	                    return data.items;
	            },
	                
	            item2textCss: function item2textCss(data){
	                return  ("mstrmojo-ArchitectListIcon " +  (data.items ? "t15" : "t26"));
	            },
	  
	            initModel: function(model){    			    
    			    this._model = model;    			
    			}
    });
})();