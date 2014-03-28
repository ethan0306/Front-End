(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.List"
    );
	
	var _D = mstrmojo.dom;
	var _C = mstrmojo.css;
	
	var _data = [ {n: 'None', did: 0},
	            {n: 'Country', did: 3},
	            {n: 'State', did: 2, items: [{n:'Country',did: 'state1'}]},
	            {n: 'City', did: 1, items: [{n:'Country', did: 'city1'}, {n:'State', did: 'city2'}]},
	            {n: 'Zip Code', did: 8, items: [{n:'Country', did: 'zipcode1'}, {n:'State', did: 'zipcode2'},{n:'City', did: 'zipcode3'}]},
	            {n: 'Latitude', did: 5},
	            {n: 'Longtitude', did: 6},
	            {n: 'Location', did: 4},
	            {n: 'Other', did: 7}		
		      ];
	var _geoValue = [0,3,2,1,8,5,6,7];
	var _geoIndex = [0,3,2,1,8,5,6,7,4];
	
	
	mstrmojo.QB.GeoRole = mstrmojo.declare(
		mstrmojo.Container,
			
		null,
			
		{
		    scriptClass:  "mstrmojo.QB.GeoRole",
			
		    markupString: '<div id="{@id}"  class="{@cssClass}" style="top:{@top};left:{@left};width:125px;height:{@height};">' +
				            '<div style="z-index:{@zIndex};{@cssText}" mstrAttach:mousedown,click>' +				               
				                '<div class="mstrmojo-qb-mapping-title">{@title}</div>' +
				                '<div class="mstrmojo-qb-mapping-georole"></div>' +				                 
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
			
            title: 'Geography',
            
            georole: 0,
            
            attrs: { 0: false, 1: false, 2: false}, // 0:country, 1:state, 2: city //whether to create these attributes  
            
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
            
            onOK: function(){
                	   var p = this.parent, cms = p._cmSource;
                	   if(cms.executeCommand){
                		   this.data.geo =true;
                		   this.data.georole = _geoValue[this.geolist.selectedIndex];
                		   this.data.attrs = this.attrs;
                           cms.executeCommand(this.data);
                       }
            	       this._close();            	
                   },
                   
            onCancel: function(){
            	       this._close();            	
                   },       
            
            children: [                       
			            {
			        	    scriptClass: "mstrmojo.List",
			        	    slot: 'contentNode',
			        	    alias: 'geolist',
			        	    cssText: "margin-top: 10px;padding-left: 13px;",			        	  		          		          
 				            items: _data,
 				            cssClassItem: '', 				           
 				            onclick: function(win, evt, bool){
			                	var tgt = evt.currentTarget; 	
			                	if  (tgt.className.indexOf("mstrmojo-qb-georole-attribute")>-1) {
			                		var idx = parseInt(tgt.getAttribute('did'), 10);			            	        	
		            	        	var els = [], p = this.domNode.children[0].children;
			                		switch (idx){
			                		case 0:  //locate all the country node
			                			els.push(p[4].children[0].children[1].children[0].children[1]);
			                			els.push(p[3].children[0].children[1].children[0].children[1]);			                			 
			                			els.push(p[2].children[0].children[1].children[0].children[1]);
			                			break;
			                		case 1: //locate all the state node
			                			els.push(p[4].children[0].children[1].children[0].children[2]);
			                			els.push(p[3].children[0].children[1].children[0].children[2]);
			                			break;
			                		case 2:	// this is city node
			                			els.push(tgt);
			                			break;
			                		default:
			                			break;
		            	        	}			                		
			                		if (this.parent.attrs[idx]) {
			                			for (var i=0, len= els.length; i<len; i++) {
		            	        	        _C.removeClass(els[i], "selected");
			                			}
		            	        	}else{
		            	        		for (var i=0, len= els.length; i<len; i++) {
		            	        			_C.addClass(els[i], "selected");
			                			}		            	        		
		            	        	}
		            	        	
		            	        	 
		            	        	this.parent.attrs[idx] = !this.parent.attrs[idx];
			                	}			            	    
			                },
			                onchange: function(e){
			                	var added = e.added;
			                	if (added) {
			                	   	if (added[0]===2 || added[0]===3 || added[0]===4){
			                	   		var p = this.parent.parent;
			                	   		if (p) {
			                	   		    p= p.parent.parent; //menuitem
				                	   		if (p && p.adjustMenuPosition){
				                	   			p.adjustMenuPosition();
				                	   		}
			                	   		}
			                	   	}
			                	}
			                },	
			                
 				            itemMarkupFunction : function(item, index, widget) {
			            	    var cont = [], p = widget.parent;
			            	    if (item.items) {
			            	    	var its =item.items;
			            	    	var act = 'onclick="mstrmojo.all.' + widget.id + '.onclick(self, arguments[0], true)"';
			            	    	cont.push('<div class="mstrmojo-qb-georole-attribute-box"><span>Create attributes for:</span>');
			            	     	for (var i=0,len=its.length; i<len; i++){
			            	    	    cont.push('<div class="mstrmojo-qb-georole-attribute '+ (p.attrs[i]?'selected':'') + '" did="'+ i +'"' + act + '><img class="mstrmojo-qb-georole-checkbox" src="../images/1ptrans.gif"><span style="padding-left:5px;">');
			            	    	    cont.push(its[i].n);
			            	    	    cont.push('</span></div>');	
			            	    	} 
			            	    	cont.push('</div>');
			            	    }	
			            	
                                return '<div class="mstrmojo-qb-georole ' + widget.cssClassItem +  '"' + 
                                          ' idx="' + index + '"' + 
                                          ' did="' + item.did + '"' +
                                      '>' +
	                                      '<div class="mstrmojo-qb-georole-itemtext">' + 
	                                         '<img class="mstrmojo-qb-georole-img" src="../images/1ptrans.gif">' +
	                                         '<span class="mstrmojo-qb-georole-text">' + item.n + '</span>' +
	                                      '</div>' +
	                                      '<div class="mstrmojo-qb-georole-itemcontent">' + cont.join('') +
	                                      '</div>' +
                                      '</div>';
                            },
                            
                            onRender: function(){
                            	this.set('selectedIndex', _geoIndex[this.parent.georole]);
                            	
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