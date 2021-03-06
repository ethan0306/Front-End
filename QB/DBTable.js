(function(){
    mstrmojo.requiresCls(
    		"mstrmojo.Editor",
    		"mstrmojo.Label", 
    		"mstrmojo.QB.DBTableRow",
    		"mstrmojo._TouchGestures"
    		);
    
    
    var _S = mstrmojo.string,
        _D = mstrmojo.dom,
        _C = mstrmojo.css;
    function setPosition(w, vl, vt){
    	var st = w.editorNode.style;
    	vl = (vl<0)? 0: vl+'px';
        vt = (vt<0)? 0: vt+'px';
    	st.left = vl;
        w.set('left',vl);
        w.left=vl;
        st.top = vt; 
        w.set('top',vt);
        w.top=vt;	
    }
    
    function _updateRows(w)
    {  var rows=w.children[0].children;
       var len=rows.length;
    	for(var i=0;i<len;i++){
    		if(w.selectedIndex[i])
    			_C.addClass(rows[i].domNode,['selected']);
    		else
    			_C.removeClass(rows[i].domNode,['selected']);
    	}
    }
    	
  
    
    /**
	 * <p>
	 * Widget that represents a DB Table
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Editor
	 */
    mstrmojo.QB.DBTable = mstrmojo.declare(
    		// superclass
    		mstrmojo.Editor,
    		
    		// mixins
    		null,//[mstrmojo._TouchGestures],
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.QB.DBTable",
    			title: '',
    			
    	        left: '',    	        
	   	        top: '',
	   	        minWidth: 80,
	   	        maxWidth: 250,
	   	        
	   	        maxHeight: 300,
	   	        minHeight: 20,
	   	        
	   	        model: null,
	   	        
	   	        prevPos: {},

	   	        container: null, //for drag scrolling purpose
	   	        
	   	        selectedIndex: [],
	   	        draggable: true,
	   	        
	   	        noCheckBox: true,
	   	        
	   	        topAnchor 	: function ta(){return (this.titlebarNode) ? parseInt(this.top) + (this.titlebarNode.clientHeight / 2)+ "px" : "0px";},
	   	        leftAnchor	: function la(){return this.left;},
	   	        rightAnchor	: function ra(){return (this.editorNode) ? parseInt(this.left) + this.editorNode.clientWidth + "px" : "0px";},
    			
	   	        modal:false,
	   	        
	   	        markupString: 	'<div id="{@id}" class="mstrmojo-Editor-wrapper">' +
	   	        					'<div class="mstrmojo-Editor {@cssClass}" style="z-index:{@zIndex};{@cssText}" mstrAttach:mousedown,mouseup,click>' + 
		   	        					   '<div style="position:absolute;background-color:LightSteelBlue;border-top-left-radius: 5px;border-top-right-radius: 5px; height: 20px;">' +
													'<table cellspacing="0" cellpadding="0" class="mstrmojo-qb-DBTable-titlebar">' +
														'<tr>' +
														    '<td><input id="{@id}check" type="checkbox" mstrAttach:click></td>' +
															'<td class="mstrmojo-Editor-titleCell">' +												    
																'<div id="{@id}title" class="mstrmojo-qb-DBTable-title"  mstrAttach:dblclick>' +
																'</div>' +
															'</td>' +
															'<td><div class="mstrmojo-qb-DBTable-close" title="delete"></div></td>' +															
															'<td>' +
															   '<div style="display:none;"></div>'+  //dummy node
															'</td>' +
														'</tr>' +
													'</table>' +
									      '</div>' +
									      '<div class="mstrmojo-Editor-titleSpacer"></div>{@titlebarHTML}' +
	   	        					      '<div class="mstrmojo-Editor-content" style="overflow-x:hidden; overflow-y:auto; padding:0px;" mstrAttach:scroll></div>' +
	   	        					      '<div class="mstrmojo-qb-table-resize-handle north" id="{@id}north" ></div>' +
		   	        					  '<div class="mstrmojo-qb-table-resize-handle east" id="{@id}east"></div>' +
		   	        					  '<div class="mstrmojo-qb-table-resize-handle south" id="{@id}south"></div>' +
		   	        					  '<div class="mstrmojo-qb-table-resize-handle west" id="{@id}west"></div>' +
	   	        					'</div>' +
	   	        				'</div>',
         
	   	 
	   	        titleMarkupString: 	'',	
	   	        				
	   	        children:[{
		 			scriptClass: "mstrmojo.Box",
		 			alias: 'Rows',
		 			cssText: "width:100%; background-color:white; border: 1px solid #C6C6C6; height:100%;white-space: nowrap;"
 		 		}],
		 		
		 		markupSlots: {
	                 editorNode: function(){ return this.domNode.firstChild;},
	                 titlebarNode: function() { return this.showTitle ? this.domNode.firstChild.firstChild.firstChild : null; },
	                 checkBoxNode: function(){ return this.showTitle ? this.domNode.firstChild.firstChild.firstChild.rows[0].cells[0].firstChild : null;},                
	                 titleNode: function(){ return this.showTitle ? this.domNode.firstChild.firstChild.firstChild.rows[0].cells[1].firstChild : null;},                
	                 helpNode: function(){ return this.showTitle ? this.domNode.firstChild.firstChild.firstChild.rows[0].cells[3].firstChild : null;},
	                 closeNode: function(){ return this.showTitle ? this.domNode.firstChild.firstChild.firstChild.rows[0].cells[2].firstChild : null;},
	                 containerNode: function(){ return this.domNode.firstChild.childNodes[2]; },
	                 buttonNode: function() { return this.domNode.firstChild.childNodes[3]; },
	                 curtainNode: function(){return this.domNode.lastChild;},
	                 leftanchor: function(){ return this.left; }
	             },
	             
		 	
	            
		            
		        onscroll:function(){
		            	this.parent.parent.linker.drawLinks();
		            },
		            
		       onmousedown: function(evt){
		            	this.editorNode.style.zIndex=35;
 		            },
		            
		        onmouseup: function(evt){
		            	this.editorNode.style.zIndex=10;
		            	
		            },
		            
		          toggleSelect: function(idx) {
				    	var add, rmv;
				        if (this.selectedIndex[idx]) { 
				        	this.selectedIndex[idx]=false;
				        	
				        } else {
				        	this.selectedIndex[idx]=true;
				        	
				        }
				        _updateRows(this);
				    },
				    // shift+click
				    rangeSelect: function(idx) {
				     	// to do later
				    },
				    singleSelect: function (idx){
				      
				    	for(var i=0, len=this.selectedIndex.length; i<len ;i++)
				    		this.selectedIndex[i]=false;
				    	
				    	    this.selectedIndex[idx]=true;
				    	    _updateRows(this);
				    },
				   
				    clearSelect: function(){
				    	for(var i=0, len=this.selectedIndex.length; i<len;i++)
				    		this.selectedIndex[i]=false;
				             _updateRows(this);
				    }, 
				    
                onmouseover: function(evt) {
    				if(!this.isAndroid) {
    					handleTouchBegin(this, evt.e.pageX, evt.e.pageY);
    				}
                },
                
              

            
                touchBegin: function touchBegin(touch) {
          			var s = this.editorNode.style;
          			this._tl = parseInt(s.left);
          			this._tt = parseInt(s.top);
    			},
    			
    			touchSwipeMove: function touchSwipeBegin(touch) {
    				var qdl=mstrmojo.all.QBuilderModel,
    				    ts=this.container,
    				    tbl=qdl.tables[this.id];
    				setPosition(this, touch.delta.x + this._tl , touch.delta.y + this._tt);
    				 if(tbl&&tbl.njoins>0)
	                	  ts.linker.drawLinks();
    			},
    			
                /**
				 * Add rows to the table
				 */
	     		addRow: function AddRow(txt, level, icons, rid){
    				
    				var table = this.children[0];    				
    				var row = {
    						scriptClass:"mstrmojo.QB.DBTableRow",
    						images: icons, 
    						indent: level,
    						text: txt						
    					};						
					table.addChildren([row]);
					
    			},
    			
    			onclick: function (evt){
    				 var hWin = evt.hWin,
                     e = evt.e || hWin.event,
                     tgt = e.target || e.srcElement,
                     el = document.elementFromPoint(e.clientX,e.clientY),
                     id = tgt && tgt.id;
                 
                     if (id.replace(this.id, '')== 'check') {
                    	  if (this.onCheck) {
                    		  this.onCheck(tgt.checked); 
                    	  }	  
                     }
                  
                     
					var w = _D.findWidget(el);
		            if(!w||!w.srcData){
		            	    this.clearSelect();
  		                    return;
  		             }
                    
                     var idx = w.rIndex,
                         c = _D.ctrlKey(hWin, e),
                         s = _D.shiftKey(hWin, e);
                    if (c || s) {
                        _D.clearBrowserHighlights(hWin);
                    }

                    if (c) {
                        this.toggleSelect(idx);
                    } else if (m && s) {
                        this.rangeSelect(idx);
                    } else {
                        this.singleSelect(idx);
                    }
                  
    			},
    			
    			ondblclick: function(evt) {
    				var hWin = evt.hWin,
                    e = evt.e || hWin.event,
                    tgt = e.target || e.srcElement,
                    id = tgt && tgt.id;    				
                   
    				if (id.replace(this.id, '')== 'title') {
	    			 	var off = _D.delta(this.titleNode, this.titlebarNode);
	    				var title = this.title, width = this.titleNode.clientWidth - 6 ; //deduct the offset of inputbox padding,border width
	                    this.openPopup(
	                       "inlineTextRef",
	                       {
	                    	   left: off.x + 'px',
	                           top : (_D.isIE ? 0 : -1) + 'px',
	                           txtConfig: {
	                               cssClass: "mstrmojo-qb-tablealias-edit",
	                               width: width + 'px',	                       
	                               value: title || '',
	                               onEnter: function(){
	                                   var v = _S.trim(this.value);
	                                   this.parent.close({enter: true});
	                                   if(v){	                                	  
	                                	   var dbt = this.parent.parent;
	                                	   if (v !== dbt.title ){
	                                		   var m = dbt.model;
	                                		   if (m && m.tbns) {
	                                			   var msg = '';
	                                			   if (v.match(/^[0-9]/)){
		                                			   v = v.replace(/^[0-9]/, 'L'); //618711 replace leading digit by 'L'
		                                			   msg = "Table name starting with digit will be replaced with the character L.";
		                                		   }
	                                			   if (m.tbns[v] && (v !== dbt.title)) { //duplicated table alias	                                				   
	                                				   msg += "'" + v + "' has been used as the alias of another table. Please give a new name.";
                                                       mstrmojo.alert(msg);
	                                				   return;
	                                			   }	  
	                                			   if (msg){
	                                				   mstrmojo.alert(msg);
	                                			   }
	                                		   }
		                                	   var old = dbt.title;
		                                	   if (m && m.renameTable){		                                		 	   
		                                		   m.renameTable(dbt.id, old, v);		                                		   
		                                	   }	   
		                                	   dbt.set("title", v);       
		                                       if (dbt.onHeaderChange){
			                                	  dbt.onHeaderChange(old,v);
			                                   }	
		                                       
	                                	   }
	                                   }
	                                   
	                               },
	                               onCancel: function(){
	                                   this.set("value", this.parent.title);
	                               }
	                           }
	                       }
	                   ); 
    			   }     
    				
    			},	
    			
    			onCheck: function(checked) {
    				 //custom override to handle the checkbox click event
    			},
    			
    			
    			postBuildRendering: function postBuildRendering(){
    	               if(this._super){
    	                   this._super();
    	               }
    	                	               
    	               //hide the checkBox if not for display
    	               if(this.noCheckBox){
    	                   this.checkBoxNode.style.display = 'none';
    	               }
    	               
    	               //set the element style for titleNode
    	               if (this.titleNode) {
    	            	   this.titleNode.style.width = this.titleNode.clientWidth - 20 + 'px'; //offset margin
    	               }	   
    	        },
    	        
    	        
    	        getDragData: function getDragData(ctxt){ 
                    var s = ctxt.src,
                        n = s.node,
                        id= n.id;
                    if(id){ //dragging on the resize handle
                    	switch (id.replace(this.id, '')) {
                    	case 'north':
                    	case 'east':
                    	case 'south':
                    	case 'west':
                    		return { dir: id.replace(this.id, ''), startX: s.pos.x, startY: s.pos.y};
                    		break;
                    	default:
                    		break;
                    	}  
                    } else {
                        if(this._super){
                            return this.dropZone && this._super(ctxt);
                        }
                    }
                    return null;
                },
    	        
                /**
                 * Judge whether or not it is dragging the resize handle. If so, return true;otherwise, return this._super if any.              
                 */
                ondragstart: function ondragstart(ctxt){
                	var s = ctxt.src,
                	    d = s && s.data,
                	    dir = d && d.dir;
                    if(dir){ 
                    	this.prevPos ={x: s.pos.x, y : s.pos.y}
                        return true;  
                    } else {
                        if(this._super){
                            return this._super(ctxt);
                        }
                    }
                }, 
                
                
    	        /**
                 * Need to resize the table  
                 */
                ondragmove: function ondragmove(ctxt){
                	
                    var s = ctxt.src,
                        d = s && s.data,
                        dir = d && d.dir;
                      
                    if (dir) { //dragging on the resize handle                   
                    	switch (dir) {
                    	case 'north':                    		
                    	case 'south':	
                    		var tgt =ctxt.tgt;
                    		var dy= tgt.pos.y -  this.prevPos.y;
                    		dy = (dir == 'north')? dy : -dy;
                    		this.prevPos = tgt.pos;
                    		var st = this.editorNode.style; 
                    		if (parseInt(st.height)- dy >= this.minHeight && parseInt(st.height) - dy <= this.maxHeight ){
                    			this.containerNode.style['overflow-y']='auto';
                    			if (dir == 'north') {st.top = parseInt(st.top) + dy + 'px';this.top=st.top;}
            	 	        	st.height = parseInt(st.height) - dy + 'px';
            	 	        	this.containerNode.style.height = parseInt(st.height) - this.titlebarNode.clientHeight + 'px';
                    		}
                    		else { 
                    			   this.containerNode.style['overflow-y']='hidden';
                    			 }
                    		break;
                    	case 'east':
                    	case 'west':
                    		var tgt =ctxt.tgt, offset = this.noCheckBox? 39: 59;  //title node padding plus offset
                    		var dx= tgt.pos.x -  this.prevPos.x;
                    		dx = (dir == 'east')? dx : -dx;
                    		this.prevPos = tgt.pos;
                    		var st = this.editorNode.style;
                     		if (parseInt(st.width) + dx >= this.minWidth && parseInt(st.width) + dx <= this.maxWidth ){
                    			if (dir == 'west') {st.left = parseInt(st.left) - dx + 'px'; this.left=st.left;}
            	 	        	st.width = parseInt(st.width) + dx + 'px';
             	 	        	this.titleNode.style.width = parseInt(st.width) -offset + 'px';
             	 	        	this.titlebarNode.style.width = parseInt(st.width) + 'px';
            	 	        	
                    		}	
                    		break; 
                    		break; 
                    	}  
                    	this.parent.parent.linker.drawLinks();
                    	
                    }else {
                          var qdl=mstrmojo.all.QBuilderModel,
                          ts=this.container,
                          h=parseInt(ts.domNode.clientHeight),
                          w=parseInt(ts.domNode.clientWidth),
                          e = ctxt.tgt.pos,
	                      s = ctxt.src.pos,
	                      dx = e.x - s.x,
	                      dy = e.y - s.y,
	                      st = this.getMovingTarget().style,
	                      vl = this._leftPos + dx ,
	                      vt = this._topPos + dy;
                          
	                      vl = (vl<0)? 0: vl;
	                      vt = (vt<0)? 0: vt;
	                     
	                      if(ts.maxWidth>w) ts.domNode.style['overflow-x']='auto';
	                      else ts.domNode.style['overflow-x']='hidden';
	                      if(ts.maxHeight>h) ts.domNode.style['overflow-y']='auto';
	                      else ts.domNode.style['overflow-y']='hidden';
	                      
	                      var mw=true,mh=true,tbls=ts.canvasbox.children;
	                      // Renew the maxWidth value for all tables
	                      for(var i=0, len=tbls.length; i<len; i++)
	                        {  
	                    	  if( this.id!=tbls[i].id && vl + this.editorNode.clientWidth<parseInt(tbls[i].left)+tbls[i].editorNode.clientWidth)
	                           {mw=false;
	                            break;}
	                        
	                        }
	                      if(mw) {
	                    	   ts.maxWidth= vl + this.editorNode.clientWidth;
	                    	 if(ts.maxWidth>w){
	                           ts.canvasbox.domNode.style.width=ts.maxWidth+'px';
	                    	   ts.canvasbox.width  = ts.maxWidth+'px';
	                    	   ts.linker.width= ts.maxWidth;
	                    	   qdl.linkerNeedRender=true;
	                    	   ts.linker.drawLinks();
                              }
	                      }
	                    	  
	                   // Renew the maxHeight value for all tables
	                      for(var i=0, len=tbls.length; i<len; i++)
	                        { if(this.id!=tbls[i].id && vt + this.editorNode.clientHeight<parseInt(tbls[i].top)+tbls[i].editorNode.clientHeight)
	                        	{mh=false;
	                             break;
	                        	}
	                        }
	                      if(mh) {
	                    	  
	                    	  ts.maxHeight= vt + this.editorNode.clientHeight+10;
	                    	 if(ts.maxHeight>h){
	                    	  ts.canvasbox.domNode.style.height=ts.maxHeight+'px';
	                    	  ts.canvasbox.height =ts.maxHeight+'px';
	                    	  ts.linker.height= ts.maxHeight;
	                    	  qdl.linkerNeedRender=true;
	                    	  ts.linker.drawLinks();
	                    	 }
	                      } 
	                  
	                      st.left = vl+"px";
	                      st.top = vt+"px"; 
	                      this.top=vt+"px";;
	                      this.left= vl+"px";
	                      var tbl=qdl.tables[this.id];
	                      if(tbl&&tbl.njoins>0)
	                	  ts.linker.drawLinks();
                    }
                    
                },
                
                
                inlineTextRef: {
                    scriptClass: "mstrmojo.Popup",
                    locksHover: true,
                    slot: "containerNode",
                    children: [{
                        scriptClass: "mstrmojo.TextBox",
                        alias: "txt", 
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
                
                _set_height: function(n,value){
                	if (this.editorNode && parseInt(value)>this.titlebarNode.clientHeight){
	                	var st = this.editorNode.style; 
	                	st.height = parseInt(value) + 'px';
		 	        	this.containerNode.style.height = parseInt(st.height) - this.titlebarNode.clientHeight + 'px';
                	}                	
                }	
                
    	        
    		}
	    
	    );
})();