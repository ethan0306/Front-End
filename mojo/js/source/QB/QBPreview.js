(function () {
    mstrmojo.requiresCls(  
        "mstrmojo.HBox",
        "mstrmojo.Box",       
        "mstrmojo.Table",
        "mstrmojo.DataGrid",
        "mstrmojo.QB.AttributeMapping"
     );
    
    mstrmojo.requiresDescs(517,518, 9132,1388,9133,9134, 1088, 629);
    
    var _C = mstrmojo.css;
    var _D = mstrmojo.dom;
    var _S = mstrmojo.string;
    
    var _menus= [
        { did: "QBAttribute",	n: mstrmojo.desc(518, "Attribute") },
        { did: "QBMetric",	n: mstrmojo.desc(517, "Metric") },
        { did: "QBNone",	n: mstrmojo.desc(9132,"Do not map") },
        { did : -1,	n: "-" },
        { did: "QBRename",	n: mstrmojo.desc(1388, "Rename")},
        { did: "QBMap", n: mstrmojo.desc(9133,"Map to project ...") },
        { did: "QBUnMap", n: mstrmojo.desc(9134,"Unmap from project")},
        { did : -1,	n: "-" },
        { did: "QBEdit",	n: mstrmojo.desc(1088, "Edit") },
        { did: "QBRemove",	n: mstrmojo.desc(629, "Delete") }
    ];		
   
    var _cxtMenu = {
         scriptClass: "mstrmojo.MenuButton",
         cssClass: "mstrmojo-di-datapreview-cxtmenu",
         cmCssClass: "mstrmojo-di-datapreview-popmenu",
         postCreate: function(){
    	     this.cm = _menus;
         },
         dataGrid: null,
         widget: null,
         dynamicUpdate:true,
         queryEnabled: function(item){
        	 switch (item.did) {
    		 case 'QBAttribute': 
    			 return  ((this.widget.tp !=12)||(!this.widget.mapped)) && (!this.widget.nochange);
    			 break;
    		 case 'QBMetric':
    			 return  ((this.widget.tp !=4)||(!this.widget.mapped)) && (!this.widget.nochange);
    			 break;
    		 case 'QBNone':
    		     return  this.widget.mapped;
    			 break;
    		 case 'QBEdit':
    		 case 'QBRename':	 
    		 case 'QBMap':
    			 return  !this.widget.nochange;	 
    		     break;
    		 case 'QBUnMap':    	
    		     return  this.widget.nochange;	 
    		     break;
    		 default: 
    			 return true;
        	 } 
         },
         queryVisible: function(item){
        	 var datagrid = this.dataGrid, w = this.widget;
        	 switch (item.did) {
    		 case 'QBAttribute': 
    		 case 'QBMetric':
    		 case 'QBRename':
    			 return  !this.widget.isNew
    			 break;
    		 case 'QBMap':
    		 case 'QBUnMap':
    		     return  !this.widget.isNew && this.widget.tp ==12;
    			 break;
    		 case 'QBEdit':
    		 case 'QBRemove': 
    			 return !!this.widget.isQB;
    		     break;
    		 case 'QBNone':
    			 return !!this.widget.isDI;
    			 break;
    		 default: 
    			 return true;
        	 } 
         },
         executeCommand: function(item){
        	 var did = this.widget.did;  
			 var model = this.dataGrid.model;
			 var m= model.mappings;
			 var idx = mstrmojo.array.find(m, 'did', did);
        	 switch (item.did) {
    		 case 'QBAttribute': 
    			 if (idx != -1) {
    				 m[idx].tp = 12;
    				 m[idx].selected = true;
    				 this.dataGrid.populatePreview();
    				 if (model.remap) {
                   	     model.remap(m[idx].did, null, null, 12);  
                     } 
    		     }
    			 break;
    		 case 'QBMetric':		                    	        			
    			 if (idx != -1) {
    				 m[idx].tp = 4; 
    				 m[idx].selected = true;
    				 this.dataGrid.populatePreview();
    				 if (model.remap) {
                   	     model.remap(m[idx].did, null, null, 4);  
                     } 
    		     }
    			 break;
    		 case 'QBNone':		                    	        			
    			 if (idx != -1) {m[idx].selected = false; this.dataGrid.populatePreview();}
    			 break;
    		 case 'QBRename':
    			 var alias = m[idx].alias;
    			 var datagrid = this.dataGrid, w = this.widget;
    			 var width = w.domNode.clientWidth - 25;   //substract 25px for the padding
    			 width = (width > 0) ? (width+'px'): '20px';
    			 var left =  _D.position(w.domNode).x - _D.position(datagrid.domNode).x + 20 + 'px';  //padding 20px for the icon    		   
    			 datagrid.openPopup(
	                 "inlineTextRef",
	                 {
	                     top : (_D.isIE ? 0 : -1) + 'px',
	                	 left: left,   
	                     txtConfig: {                                                                  
                             value: alias || '',
                             width: width,
                             onEnter: function(){
				                  var v = _S.trim(this.value);	                                  
			                      this.parent.close({enter: true});
			                      if (v && v!=m[idx].alias){
			                    	  m[idx].alias = v;                                 
	                                  this.parent.close({enter: true});
	                                  w.set("text",v.replace(/[<]/g,"&lt;")); //update the text
	                                  if (model.remap) {
	                                	  model.remap(w.did, v);  
	                                  } 	  
			                      }	  	                	          
                             }
                         }
	                 });        	   
    			 break;
    		 case 'QBEdit':
    			 var w = this.widget;
    			 var cIndex = w.ix + 1; //COM cindex is 1-based
    			 if (model.editExpression) {
    				 model.editExpression(cIndex);
    			 }	
    		     break;
    		 case 'QBRemove':
    			 var w = this.widget;
    			 var cIndex = w.ix + 1; //COM cindex is 1-based
    			 if (model.removeSelectedColumn) {
    				 model.removeSelectedColumn(cIndex);
    			 }	 
    			 break;
    			 
    		 case 'QBMap':    			
    			 var datagrid = this.dataGrid, w = this.widget;
    			 var pos = _D.position(w.domNode);    		
    			 _C.toggleClass(w.domNode, "highlight", true); 
    			 datagrid._searchBox= new mstrmojo.QB.AttributeMapping({});
    			 var sb = datagrid._searchBox;
    		     sb.placeholder = document.body.appendChild(document.createElement("div"));
    			 sb.top = pos.y + 22 + 'px';
    			 sb.left = pos.x + 'px';
    			 sb.did = w.did;
    			 sb.target = w;
    			 sb.render();     	   
    			 sb.clearview();
    			 
    			 break;
    			 
    		 case 'QBUnMap':
    			 
    			 break;
    		 default: 
    			 break;	 
        	 } 
         }      
    		
    };	
    
    function _showContextMenu(evt){    	
    	var elem = _D.eventTarget(window, evt);    
    	var src = _D.findWidget(elem); 
    	
    	if (!src || elem.className.indexOf("mstrmojo-di-datapreview-header") < 0) {   	
    		_hideContextMenu(evt);
    	    return ;	
    	}	
    	var datagrid = src.dataGrid; //src.parent.dataGrid;
        	
    	_cxtMenu.widget = src ; //src.parent;
    	_cxtMenu.dataGrid = datagrid;
    	
    	//Calculate the top and left positions
    	var pos = _D.position(elem);  
    	var gridpos = _D.position(datagrid.domNode);
		var lf = pos.x - gridpos.x + elem.offsetWidth - 20;
		var top = elem.offsetTop ;
		
		//Show context menu button on correct position		 
    	_cxtMenu.cssText= "position:absolute;left:"+ lf +"px; top:" + top  + "px; visibility:visible;";
    	
     	if (!_cxtMenu.domNode) {
    		var p = document.createElement('div');
    		datagrid.domNode.appendChild(p);
    		_cxtMenu.placeholder = p;
    		_cxtMenu = mstrmojo.insert(_cxtMenu);
    	}	
    	
    	_cxtMenu.render();
     	if (_cxtMenu.domNode.parentElement) {
    		_cxtMenu.domNode.parentElement.removeChild(_cxtMenu.domNode);    	
     	}     
    	datagrid.domNode.appendChild(_cxtMenu.domNode);    	//refresh  
    	 
    };
    
    
    function _hideContextMenu(evt){
    	var elem =  evt.relatedTarget || evt.toElement || evt.target;  
    	var w = _D.findWidget(elem);
    	if (w && w.id == _cxtMenu.id) {
    	    return;	 //still show the button when moving onto itself
    	} 
    	if (!_cxtMenu.domNode){
    	    return;	
    	}	
    	if (_cxtMenu.domNode.parentElement) {
    		_cxtMenu.domNode.parentElement.removeChild(_cxtMenu.domNode);    	
    	}
    }
    
    
    /************************Private methods*********************************/

    mstrmojo.QB.QBPreview = mstrmojo.declare(
        // superclass
        mstrmojo.DataGrid,
        // mixins
        [mstrmojo._HasPopup],        
        // instance members
        {
            scriptClass: "mstrmojo.QB.QBPreview",
            
            //please supply the data model before rendering
            //the data model must have the following properties:
            //    'dataset' : for the raw data
            //    'mappings': for the attribute/metric mappings            
            model: null,   
              
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
                 
            postBuildRendering: function(evt){
	        	if (this._super) {
                   this._super();
                }
           	    _D.attachEvent(this.domNode, 'mousemove', _showContextMenu);
           	    _D.attachEvent(this.domNode, 'mouseout', _hideContextMenu);
            },
            
            populatePreview: function populatePreview(evt){
                var model = this.model;
                var mappings = model.mappings;
                
                this.columns=[];
                this.unrender();
                //populate header columns
                for (var i = 0, len=mappings.length ; i <len ; i++) {
                	var tag = mappings[i];
                    var hw = {
                       	tag: tag, 
                    	headerWidget:{  
		                    scriptClass: "mstrmojo.Label",	
		     	           // slot: "0,0",
					        cssClass: "mstrmojo-di-datapreview-header mstrmojo-di-datapreview-headerIcon t" + (tag.selected?tag.tp:0).toString(),
					        text:  tag? _S.trim(tag.alias).replace(/[<]/g,"&lt;"):"",   //escape char <
					        did: tag.did,
					        tp: tag.tp,
					        isNew: tag.isNew,         //if this is the query column before the mapping
					        isQB: tag.isQB,           //if this is for QB 
					        mapped: tag.selected,					     				        
					        ix: tag.ix,
					        nochange: tag.nochange
						},						    					    
						colWidth: '60',
						colCss: "mstrmojo-qb-metric",
						dataFunction: function(d,idx, datagrid) {
						    var cls = datagrid.columns;						     
						    var txt = d[this.dataField];
						    var css ="mstrmojo-di-datapreview-DataRow-text";						       
						    if (this.tag.selected) {
						   	    switch (this.tag.tp) {
							        case 12:
							    	   css += " Attribute";
							    	   break;
							        case 4:	   
							    	   css += " Metric";
							    	   break;
							        default:							    	    
						    	       break; 
						        }   
						     }
						     css += (idx%2 == 1) ? ' odd' : ' even';
						     return '<div class="' + css + '">' + txt + '</div>';
						 },							    
						 dataField: i.toString()  
                     }
                     this.columns.push(hw);
                }	
            
                var dataset = model.dataset;
                if (dataset.length ==0 && this.columns.length>0){
                	var _row_height = 21;  //fill with empty rows
                	var count = parseInt(parseInt(this.parent.height)/ _row_height) - 1;
	        		count = count > 0 ? count : 1;  
	        		for (var i=0; i<count; i++) {
	        			var row = [];
	        			for (var j=0, len=this.columns.length; j<len;j++) {
	        				row.push("");
	        			}
	        			dataset.push(row);
	        		} 	
                }                
                this.items = dataset;
                
                this.render();                
               	
            },
            
            inlineTextRef: {
                scriptClass: "mstrmojo.Popup",
                locksHover: true,
                slot: 'headerContainerNode',
                children: [{
                    scriptClass: "mstrmojo.TextBox",
                    alias: "txt",                     
                    onblur: function(){
                        if (this.onEnter) {
                            this.onEnter();
                        }
                    },
                    onEsc: function(){
                        if (this.onCancel) {
                            this.onCancel();
                        }
                        this.parent.close({cancel: true});
                    }
                }],
                onOpen: function(){
                    var t = this.txt,
                        c = this.txtConfig;
                    if (c) {
                        for (var k in c){
                            t.set(k, c[k]);
                        }
                    }                   
                    t.domNode.style.width = t.width;                   
                    t.focus();
                }, 
                onClose: function(dbt) {
                    if (!dbt || (!dbt.cancel && !dbt.enter)){
                        this.txt.onEnter();
                    }
                }
            },
            
            onvisibleChange: function(e) {
            	if (e.value) {
            	    this.populatePreview();           		
            	}	
            }               	        	
                        
        });

})();