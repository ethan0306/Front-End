(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.TreeBrowser",
            "mstrmojo.fx"
    );
	
	var _H = mstrmojo.hash;
	
	var _t0 = [ {n: 'All', did: 'all'}],
	    _t1 = [ {n: 'Year', did: 'year'},
	            {n: 'Quarter', did: 'quarter'},
	            {n: 'Quarter of Year', did: 'quarter of year'},
	            {n: 'Month', did: 'month'},
	            {n: 'Month of Year', did: 'month of year'},
	            {n: 'Week', did: 'week'},
	            {n: 'Week of Year', did: 'week of year'},
	            {n: 'Day of Month', did: 'day of month'},
	            {n: 'Day of Week', did: 'day of week'}		
		      ],
	    _t2 = [ {n: 'Hour', did: 'hour'},
	            {n: 'Minute', did: 'minute'},
	            {n: 'Second', did: 'second'}
	          ];  
	var _skip = false;
	
	mstrmojo.QB.TimeDimension = mstrmojo.declare(
		mstrmojo.Container,
			
		null,
			
		{
		    scriptClass:  "mstrmojo.QB.TimeDimension",
			
		    markupString: '<div id="{@id}"  class="{@cssClass}" style="top:{@top};left:{@left};width:125px;height:{@height};">' +
				            '<div style="z-index:{@zIndex};{@cssText}" mstrAttach:mousedown,click>' +				               
				                '<div class="mstrmojo-qb-mapping-title">{@title}</div>' +
				                '<div class="mstrmojo-qb-mapping-time"></div>' +				                 
				                '<div class="mstrmojo-qb-mapping-buttons"></div>' +
				            '</div>' +
				        '</div>',
			markupSlots: {
                contentNode: function(){return this.domNode.firstChild.childNodes[1];},
                titleNode: function(){return this.domNode.firstChild.childNodes[0];},
                buttonNode: function(){return this.domNode.firstChild.childNodes[2];}
            },	
            
            top: '0px',
            
            left: '0px',
            
            height: '320px',
			
            title: 'Time Attribute',
            
            mode: 3,
            
            _close: function(){
		            	var p = this.parent;
		        	    if (p && p._cmSource) {
		        	        p._cmSource.closeMenuTree();
		        	    } 
		        	    try {
		        	        p.parent.domNode.parentNode.removeChild(p.parent.domNode);
		        	    }catch (e){
		        	    }
                    },
            
            timeArr: [],       
                   
            onOK: function(){
                	  var sls = this.timebrowser.getTotalSelections();                	
                	  var p = this.parent, cms = p._cmSource;
                	  if (cms.executeCommand){
                	      this.data.geo = false;
                		  this.data.timeArr =[];                		   
                		  this.data.timeArr = sls.slice();
                          cms.executeCommand(this.data);
                      }
            	      this._close();            	
                  },
                   
            onCancel: function(){
            	          this._close();            	
                      },       
            
            children: [                       
			            {
			        	   scriptClass: "mstrmojo.TreeBrowser",
			        	   slot: 'contentNode',
			        	   alias: 'timebrowser',
			        	   cssText: "margin-left: -20px;margin-top: 10px;",
			        	   noCheckBox: false,			        	 
			        	   itemIdField: 'did',
			        	   itemDisplayField: 'n',	
			        	   branchClickPolicy: mstrmojo.TreeBrowserEnum.BRANCH_POLICY_SELECT,
			        	   multiSelect: true,
			        	   cssClass: "mstrmojo-qb-time-tree",
			        	   isBranch: function isBranch(data){
			                   return false;
			               },
			               getContentThroughTaskCall: function getContentThroughTaskCall(params, callbacks){ 				             
			            	   var md = this.parent.mode, items=[];
 				               items=  md&1 ? _t0.concat(_t1): _t0;
 				               items = md&2 ? items.concat(_t2): items;
 				               if (params.isRoot) {
 					               callbacks.success({items: items});
 				               }
 				               this.set("items", items); 
 				               this.render();
 				           }, 				          
 				           items: [],
 				           onchange: function(e){
 				        	   var added = e.added, removed =e.removed;
 				        	   if (_skip) {
 				        		   _skip = false;
 				        		   return;
 				        	   }	   
 				        	   if (added && added[0]===0){
 				        		  _skip = true;
 				        		  this.setSelectedItems(this.items, true); //will trigger onchange event again
 				        		  return;
 				        	   }	  
 				        	   if (removed) { 				        		  
 				        		  if (removed[0]===0){
 				        			 this.clearTreeSelect();
 				        		  }else {
 				        			  if (this.selectedIndices[0]){
 				        				 _skip = true; //will trigger onchange event again
 				        				 this.toggleSelect(0, false);
 				        			  }	  
 				        		  }	  
 				        	   }	   
 				           },
 				           onRender: function(){
 				        	   this.setSelectedItems(this.parent.timeArr,true);   
 				           }
 				           
			            },
			            {
			                scriptClass : 'mstrmojo.HBox',
		             	    cssClass : 'mstrmojo-Editor-buttonBox',
		             	    slot : 'buttonNode',
		             	    children : [ 
		             	        {   //OK
		             	        	scriptClass: "mstrmojo.Button",
	                                cssClass : "mstrmojo-di-button",
		             		        cssText:"width: 46px; float:right;margin-right:10px;",
		             		        text : mstrmojo.desc(1442, "OK"),
		             		        onclick : function(evt) {
		             	        	    var e = this.parent.parent;
		             	        	    if (e.onOK) {
		             	        	        e.onOK();	
		             	        	    }	
			             	        }
		             	        }, 
				             	{   // cancel
		             	        	scriptClass: "mstrmojo.Button",
	                                cssClass : "mstrmojo-di-button",
	                                cssText:"width: 46px;",
				             		text : mstrmojo.desc(221, "Cancel"),
				             		onclick : function(evt) {
		             	        	    var e = this.parent.parent;
		             	        	    if (e.onCancel) {
		             	        	        e.onCancel();	
		             	        	    }
				             		}
				                }
		                    ]
		                }
			            
	                 ] 
			
		}	
			
    );
    
})(); 