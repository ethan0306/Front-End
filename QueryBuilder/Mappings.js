(function() {
	
	mstrmojo.requiresCls(
	    "mstrmojo.DataGrid",
	    "mstrmojo.HBox",
	    "mstrmojo.array"
	);
	
	var _A = mstrmojo.array;
	
	/**
	 * Mapping widget
	 * 
	 * @class
	 * @extends mstrmojo.Box
	 */
	mstrmojo.QB.Mappings = mstrmojo.declare(
	
        mstrmojo.Box,
    		
    	// mixins
    	[mstrmojo._TouchGestures],
    		
    	{
        	scriptClass: "mstrmojo.QB.Mappings",
        	
        	cssClass: "mstrmojo-qb-mappingtable", 
        	
        	//please supply the data model before rendering
            //the data model must have the following properties:
            //    'dataset' : for the raw data
            //    'mappings': for the attribute/metric mappings     
        	model: null,
        	
        	children: [
        	    {           
        	        scriptClass: "mstrmojo.Table",   
        	        layout: [{cells: [{cssText:"width:400px;vertical-align:top;"}, {cssText: "width:54px;vertical-align:middle;padding:0px 10px;"},{cssText: "width:400px;vertical-align:top;"}]}],
                	
                	rows: 1,
                	cols: 3,
                	
                	children: [
                	    {
                	    	scriptClass: "mstrmojo.Box",
                	    	slot: '0,0',
                	        children:[
                	            {
                	                scriptClass: "mstrmojo.Label",
                	                cssClass: "mstrmojo-di-datapreview-header mstrmojo-di-datapreview-headerIcon t12",
                	                text: "Attributes",
                	                cssText: "line-height:20px;text-align:bottom;"
                	            },
                	            {
                	                scriptClass: "mstrmojo.DataGrid",
                	                makeObservable: true,
                	                columns:[
                	                    {
                                            dataWidget: { 
        	                                    scriptClass: 'mstrmojo.ImageCheckBox',
        	                                    cssClass: 'cb-grid',
        	                                    bindings: {
	                                                checked: 'this.data.selected'	                                                
	                                            },
	                                            onclick: function(){
	                                            	var m = this.dataGrid.model.mappings;
	                                            	var idx = mstrmojo.array.find(m, 'did', this.data.did);
	                                            	if (idx != -1) {m[idx].selected = this.checked;}
	                                            }	
                                            },
                                            colCss:'cb',
                                            colWidth: '30'
                                        },
                                        {headerText:'Column Name', dataField: 'n',colCss:'colname',colWidth: '115'},
                                        {
                                    	    dataWidget: {
                          	                   scriptClass: "mstrmojo.InlineEditBox",
                          	                   emptyHint: "",
                          	                   ontextChange: function(e){
		                                           var m = this.dataGrid.model.mappings;
		                                           var idx = mstrmojo.array.find(m, 'did', this.data.did);
		                                           if (idx != -1) {m[idx].alias = this.text;}
                                               },
                                               bindings: {
                                                   text: function(){
                                                       return this.data.alias;
                                                   }
                                               }
                                            },    
                                            headerText:'Alias',
                                            colWidth: '115'                                   	   
                                        }, 
                                        {
                                    	    dataWidget: {
                            	                scriptClass: "mstrmojo.Pulldown",		          	     
        					          	        itemIdField: 'v',        					          	       				          	        
        					          	        popupToBody: true,
        					          	        bindings: {
                                        	        items: 'this.dataGrid.model.datatypes',
                                        	        value: 'this.data.dtp',
                                        	        text: 'this.data.dtp'
                                                },
                                                onvalueChange: function(){
                                                	var m = this.dataGrid.model.mappings;
	                                            	var idx = mstrmojo.array.find(m, 'did', this.data.did);
	                                            	if (idx != -1) {m[idx].dtp = this.value;}
                                                }	
                                            },
                                            headerText:'DataType',
                                            colWidth: '140'
                                    	   
                                       }   
                                   ]
                	            	
                	           }        	            
                	        ]	   
                	    },
                	    {
                	    	scriptClass: "mstrmojo.Box",
                	    	slot: '0,1',
                	    	children:[
        	       	        	{   
        		 		          	scriptClass: "mstrmojo.Button",
        		 		          	alias: "rightarrow",
        		 		          	cssText: "height:28px;width:54px;",
        		 		          	iconClass: "mstrmojo-qb-Icons rightarrow",
        		 		          	onclick: function(){
        	 		          	        var p = this.parent.parent.parent; 
        	 		          	        m = p.model.mappings;
        	 		          	        var gridmetr = p.children[0].children[2].children[1];
        	 		          	        var gridattr = p.children[0].children[0].children[1];
        	 		          	                	 		          	        
        	 		          	        for (var idx in gridattr.selectedIndices) { //remove it from the attributes and add it to the metrics
                                        	var pos = mstrmojo.array.find(m, 'did', gridattr.items[idx].did);
                                        	if (pos != -1) {m[pos].tp = 4;}
                                        	gridmetr.add([gridattr.items[idx]], -1);
        	 		          	        }
        	 		          	        gridattr.removeSelectedItems();        	 		          	   
        	 		          	        gridattr.refresh();
		 	 		          	        gridmetr.refresh();	
		 	 		          	        
        	        	            }
        	 		          	}, 
        	 		          	{ 
        		 		          	scriptClass: "mstrmojo.Button",
        		 		          	alias: "leftarrow",
        		 		          	cssText: "height:28px;width:54px;margin-top:10px;",
        		 		          	iconClass: "mstrmojo-qb-Icons leftarrow",
        		 		          	onclick: function(){																	 		          	
		        	 		          	var p = this.parent.parent.parent; 
		 	 		          	        m = p.model.mappings;
		 	 		          	        var gridmetr = p.children[0].children[2].children[1];
		 	 		          	        var gridattr = p.children[0].children[0].children[1];
		 	 		          	        for (var idx in gridmetr.selectedIndices) { //remove it from the attributes and add it to the metrics   
		 	 		          	            gridattr.add([gridmetr.items[idx]], -1);
			 	 		          	        var pos = mstrmojo.array.find(m, 'did', gridmetr.items[idx].did);
	                                    	if (pos != -1) {m[pos].tp = 12;}
	                                    	
		 	 		          	        }
		 	 		          	        gridmetr.removeSelectedItems();		 	 		          	           	 		          	        
	    	 		          	        gridattr.refresh();	    	 		          	     
		 	 		          	        gridmetr.refresh();		 	 		          	      
        		 		          	}
        	 		          	}
                	        ]
                	    },
                	    {
                	    	scriptClass: "mstrmojo.Box",
                	    	slot: '0,2',
                	        children:[
                	            {
                	                scriptClass: "mstrmojo.Label",
                	                text: "Metrics",
                	                cssClass: "mstrmojo-di-datapreview-header mstrmojo-di-datapreview-headerIcon t4",
                	                cssText: "line-height:20px;text-align:bottom;"
                	            },
                	            
                	            
                	           {
                	                scriptClass: "mstrmojo.DataGrid",
                	                makeObservable: true,
                	                columns:[
                	                    {
                                            dataWidget: { 
        	                                    scriptClass: 'mstrmojo.ImageCheckBox',
        	                                    cssClass: 'cb-grid',
        	                                    bindings: {
	                                                checked: function(){
	                                                    return this.data.selected;
	                                                }
	                                            },
	                                            onclick: function(){
	                                            	var m = this.dataGrid.model.mappings;
	                                            	var idx = mstrmojo.array.find(m, 'did', this.data.did);
	                                            	if (idx != -1) {m[idx].selected = this.checked;}
	                                            }
                                            },
                                            colWidth: '30',
                                            colCss:'cb'
                                        },
                                        {headerText:'Column Name', dataField: 'n',colCss:'colname',colWidth: '115'},                                       
                                        {
                                    	    dataWidget: {
                           	                    scriptClass: "mstrmojo.InlineEditBox",
                           	                    emptyHint: "",
                           	                    bindings: {
                                                    text: function(){
                                                        return this.data.alias;
                                                    }
                                                },
                           	                    ontextChange: function(e){
                                                	var m = this.dataGrid.model.mappings;
  		                                            var idx = mstrmojo.array.find(m, 'did', this.data.did);
  		                                            if (idx != -1) {m[idx].alias = this.text;}                                                	
                                                }
                                            },    
                                            headerText:'Alias',
                                            colWidth: '115'                                   	   
                                        }, 
                                        {
                                    	    dataWidget: {
                            	                scriptClass: "mstrmojo.Pulldown",		          	     
        					          	        itemIdField: 'v',        					          	        					          	        
        					          	        popupToBody: true,
	        					          	    bindings: {
	                                    	        items: 'this.dataGrid.model.datatypes',
	                                    	        value: 'this.data.dtp',
	                                    	        text: 'this.data.dtp'
	                                            },
	                                            onvalueChange: function(){
                                                	var m = this.dataGrid.model.mappings;
	                                            	var idx = mstrmojo.array.find(m, 'did', this.data.did);
	                                            	if (idx != -1) {m[idx].dtp = this.value;}
                                                }	
                                            },
                                            headerText:'DataType',
                                            colWidth: '140'
                                    	   
                                       }   
                                   ]
                	            	
                	           }        	            
                	        ]	   
                	    }      
                	]  
        	    }       
        	],
        	
        	populate: function populate(){        	          	    
        	    var m = this.model.mappings;        	    
        	    var attr=[],metr=[];
        	    
        	    for (var i=0, len= m.length; i<len; i++) {
        	        var map = m[i];
        	        if (map.tp == 12) {
        	            attr.push(map);	
        	        }else {
        	            metr.push(map);	
        	        }        	    	
        	    }	
        	    this.children[0].children[0].children[1].model = this.model;
        	    this.children[0].children[0].children[1].set("items", attr);
        	    this.children[0].children[2].children[1].model =this.model;
        	    this.children[0].children[2].children[1].set("items", metr);
        	    
            },
	
	        postBuildRendering: function(){
                if (this._super) {
                	this._super(); 
                }  	
                if (this.height) {
                	this.domNode.style.height = parseInt(this.height)+ 'px'; 	
                }
            },	
                  
            onheightChange: function(e){
            	if (this.domNode) {
            		this.domNode.style.height = parseInt(e.value) + 'px';
            	}
            },
            
            onvisibleChange: function(e) {
            	if (e.value) {
            	    this.populate();           		
            	}	
            }	
	
    	}
	);	
	
}) ();