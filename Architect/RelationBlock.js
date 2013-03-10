(function(){
    mstrmojo.requiresCls(
    		"mstrmojo.Editor",
    		"mstrmojo.Label"
    		);
    
    
    var _C = mstrmojo.css,
        _D = mstrmojo.dom,
        _H=mstrmojo.hash;
    var _dragzone = 10;
    function setPosition(w, vl, vt){
    	var st = w.editorNode.style;
    	vl = (vl<-15)? -15: vl+'px';
        vt = (vt<-30)? -30: vt+'px';
    	st.left = vl;
        w.set('left',vl);
        w.left=vl;
        st.top = vt; 
        w.set('top',vt);
        w.top=vt;	
    }
    
    function _findBlockContainerIdx(w, cpos) {
    	var list = w.children[0].children, pos;
    	for (var idx =0, length = list.length; idx < length; idx++ ) {
    	    pos = _D.position(list[idx].domNode, true);
    	    if ((pos.y + _dragzone <= cpos.y) && (pos.y + pos.h - _dragzone > cpos.y)) {
    	        return idx;  	    	
    	    }    	    
    	}  
    	return null;
    }	
    
    /**	
	 * find the block align to the position of the d&d target
	 * @param {widget} w
	 *        
	 */
    function _findCurrentBlockIndex(w, cpos) {
    	var list = w.children[0].children, pos;
    	for (var idx =0, length = list.length; idx < length; idx++ ) {
    	    pos = _D.position(list[idx].domNode, true);
    	    if ((pos.y + _dragzone > cpos.y) && (pos.y - _dragzone < cpos.y)) {
    	        return idx;    	    	
    	    }    	    
    	}	
    	//if the cursor is at the bottom of last chunk
    	if (((pos.y + pos.h + _dragzone  > cpos.y) && (pos.y + pos.h - _dragzone < cpos.y))) {
    		return -1;
    	}	
    	
    	return null;
    }
    
   
    /**	
	 * find the block align to the position of the d&d target
	 * @param {widget} w
	 *        
	 */
    function _updateheight(w) {
    	if (!w.editorNode) {
    	   return;	
    	}
    	var block = w.children[0].children, h, margin=2; 
    	var length = block.length;
    	var pos1 = _D.position(block[0].domNode);
		var pos2 = _D.position(block[length-1].domNode);
		var dh = ((w.prevblockindex == -1)||(w.prevblockindex == 0)) ? 20 : 0;
		h = pos2.h + pos2.y - pos1.y + margin * 2 + 20 + dh;    			
		h = (h > w.maxheight) ? w.maxheight: h;
 		w.editorNode.style.height = h +10 +  'px';    		 	
 		w.containerNode.style.height = (h - 20) + 'px';
    }
    
 

    
    function _isParent(w, c) {
        if (c.parent && c.parent.parent) {
            return (c.parent.parent.id == w.id);	
        }
    	return false;
    }	
    
    /**
     *  handle the drop event
     *  @param {target widget) w
     *         {source widget) src
     *         {data }         n
     *         {position }     pos  
     */
    function _handledrop(w, src, n, did, pos, tp) {
    	 var mdl=mstrmojo.all.ArchModel;
        _C.toggleClass(w.content.domNode, "mstrmojo-Architect-RelationTable-highlight", false);
        if (mdl.relations[w.id] && mdl.relations[w.id][n] &&!_D.contains(w.domNode, src.domNode, true)) {	   	   	            
               if (w.prevblockindex!=null) {  
                 if (w.prevblockindex >= 0) {
                     var prevblock = w.content.children[w.prevblockindex];
                     _C.toggleClass(prevblock.domNode, "mstrmojo-Architect-RelationTable-Upperspace", false);
                 }
                 w.prevblockindex = null;
               }
            _updateheight(w);
         	mstrmojo.alert("You have added " + n + " before.", null, "Web Architect");
           	return;		                  	   	                	
           }
        var idx;
        if(w.prevblockindex === null) {
        	   idx=_findBlockContainerIdx(w, pos);
        }
          var cb={
        	  success:function(res){
                    if (w.prevblockindex != null) {
        	              if (w.prevblockindex >= 0) {
                          var prevblock = w.content.children[w.prevblockindex];
        	 	          _C.toggleClass(prevblock.domNode, "mstrmojo-Architect-RelationTable-Upperspace", false);
           		         w.addChunk([{icon: 12, 
					                  lvl: 0,
					                  n: n, did:did, sw:w}], w.prevblockindex );
        	            }else {
        		             w.addChunk([{icon: 12, 
					         lvl: 0,
					         n: n, did:did, sw:w}]);
        	            }
        	              	w.prevblockindex = null;
    	          }else {
    		//check if drop within a relation chunk, if so, add it to the chunk
    	        	  var t = w.children[0].children[idx];
    	        	  if (t) {
    	        		  var row={
    	        				  scriptClass:"mstrmojo.Architect.DBTableRow",
    	        				  images: [12], 
    	        				  indent: 0,
    	        				  text: n,
    	        				  did:did,
    	        				  rw:w,
    	        				  movable: true
    	        		  		};
    	        		  t.addChildren([row]);
    		       }
    	          }
                    _updateheight(w);
                    mdl.relations[w.id][n]=n;
           },
         failure:function(){
    	     
    	   }
        };
         var cb1={
    		   success:function(){
    			   w.addRelation(src,idx,cb);
    		   },
    		  failure:function(){
    	    }
         };
         if(tp===0)
               src.rw.remove(src, cb1);
         else{
        	 w.addRelation(src,idx,cb);
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
    mstrmojo.Architect.RelationBlock = mstrmojo.declare(
    		// superclass
    	 	mstrmojo.Editor,
    	    		
    		// mixins
    	 	[ mstrmojo._TouchGestures ],
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.Architect.RelationBlock",
    			title: '',
    			
    	        left: '',    	        
	   	        top: '',
	   	       
	   	        modal:false,
	   	        
	   	        prevblockindex: null,
	   	        
	   	        dropZone: true,
	   	        
	   	        maxheight: 200,
	   	        
	   	        height: 200,
	   	        
	   	        help:null,
	            
   	            allowDrop: function allowDrop(c){  
    	 		    //if we don't have this element yet or the row being dragged is originated from the current block
	    	 		return true;  
	    	 		//return c.src.widget.scriptClass == "mstrmojo.DBTableRow";
	    	 		   // return !_elements[c.src.data.n] || _isParent(this, c.src.widget) || _isParent(this.content, c.src.widget) ;   	               
	   	        },  
	   	        
	   	        onTouchDrop: function onTouchDrop(t,x,y) {
	   	        	_handledrop(this, t, t.text, {x:x, y:y});
	   	        },	
   	            
   	            ondrop: function ondrop(c) {
   	            	var d=c.src.data
	   	        	if(!d) return;
	   	        	  var tp=0,
	   	        	     n= d.n,
	   	        	     did=d.did;
	   	        	if (!n) {
	   	        		n = d.AL;
	   	        		tp=1;
	   	        	} 	
   	                _handledrop(this, c.src.widget, n,did, c.tgt.pos, tp);
   	            },
   	             	            
   	            ondragenter: function ondragenter(c) {
   	                _C.toggleClass(this.content.domNode, "mstrmojo-Architect-RelationTable-highlight", true);
   	            },	
   	            
   	            ondragleave: function ondragleave(c) {
   	                _C.toggleClass(this.content.domNode, "mstrmojo-Architect-RelationTable-highlight", false);
   	                if (this.prevblockindex != null) {  
   	                	if (this.prevblockindex >= 0) {
	   	                	var prevblock = this.content.children[this.prevblockindex];
		            	 	_C.toggleClass(prevblock.domNode, "mstrmojo-Architect-RelationTable-Upperspace", false);
	   	                }
	            	 	this.prevblockindex = null;
	            		_updateheight(this);
	            	}	
   	            },
   	            
   	            remove:function(w,cb){
    	           if (!w.movable) {  //only if the widget is movable
    	             return;	
    	           }
    	           var mdl=mstrmojo.all.ArchModel,
                         p = w.parent;
	               p.removeChildren(w);
	               if (!p.children || !p.children.length) {  //if the chunk contains 0 row now, remove it from its parent
	                    p.parent.removeChildren(p);
	              }
	              delete mdl.relations[this.id][w.text];
	              if(_H.isEmpty(mdl.relations[this.id])) this.close();
	              else
	                    _updateheight(this);
	              cb.success();
                },
                
                 addRelation:function(w,cIdx,cb){
                       var idx=this.prevblockindex, patts=[], catts=[],cblock, pblock,
                           ch=this.content.children, len=ch.length;
                       if(idx===0){
                    	    cblock = ch[idx];
                       }
                       else if(idx>0){
                    	    cblock = ch[idx];
                            pblock = ch[idx-1];
                       }
                       else if(idx===-1){
                    	    pblock = this.content.children[len-1];
                       }
                       else{
                    	   if(len===1){
                    		     cb.success();
                    		     return;
                    	   }
                    	   else if(cIdx===0)
                    		   cblock = ch[cIdx-1];
                    	   else if(cIdx===len)
                    		   pblock = ch[cIdx-1];
                    	   else{
                    		   cblock = ch[cIdx-1];
                    		   pblock = ch[cIdx-1];
                    		   }
                    	   }
                      if(cblock){
                    	  var ch=cblock.children;
                    	  for(var i=0,lenc=ch.length;i<lenc; i++){
                    		  catts.push(ch[i].did)
                    	  }
                      }
                      if(pblock){
                    	  var ch=pblock.children;
                    	  for(var i=0,lenc=ch.length;i<lenc; i++){
                    		  patts.push(ch[i].did);
                    	  }
                      }
	               mstrmojo.all.ArchModel.createAttrRelation(w.did||w.data.did, catts, patts,cb);     
                },
                
   	            ondragover: function ondragover(c) {
   	            	//detect the appropriate block and set the space
   	            	if (this.prevblockindex != null) { 
   	            		if (this.prevblockindex >= 0) {
	   	            		var prevblock = this.content.children[this.prevblockindex];
	   	            	 	_C.toggleClass(prevblock.domNode, "mstrmojo-Architect-RelationTable-Upperspace", false);
	   	            	}
   	            	    this.prevblockindex = null;  
   	            	    _updateheight(this);
   	            	}   	            
   	            	var currentblockindex = _findCurrentBlockIndex(this, c.tgt.pos);
   	            	if (currentblockindex != null) {
   	            		if (currentblockindex >= 0) {
   	            		   _C.toggleClass(this.content.children[currentblockindex].domNode, "mstrmojo-Architect-RelationTable-Upperspace", true);
   	            		}
   	            		this.prevblockindex = currentblockindex;
   	            		_updateheight(this);
   	            	}	   	            	
   	            },	
   	         
   		        ondragmove: function(c){
   	                var e = c.tgt.pos,
   	                    s = c.src.pos,
   	                    dx = e.x - s.x,
   	                    dy = e.y - s.y,
   	                    st = this.getMovingTarget().style,
   	                    vl = this._leftPos + dx,
   	                    vt = this._topPos + dy;
   	                    vl = (vl<-15)? -15: vl;
   	                    vt = (vt<-30)? -30: vt;
   	                    st.left =  this.left= vl+'px';
   	                    st.top =  this.top =vt+'px'; 
   	                   
   	            },
   	     
				children:[{
					scriptClass: "mstrmojo.Box",
					alias: "content",
					cssClass: "mstrmojo-Architect-RelationTable",					
				}],
		 
    			/**
				 * @ignore
				 */
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
    				setPosition(this, touch.delta.x + this._tl , touch.delta.y + this._tt);
    			},
    			
    			onClose:function(){
    				delete mstrmojo.all.ArchModel.relations[this.id];
    			},
    			
    			addChunk: function(chunk, index) {
	                var block = this.content,
	                    mdl=mstrmojo.all.ArchModel;
					var cl, c = new mstrmojo.Table({
						cssClass: "mstrmojo-Architect-RelationChunk"});
					for (var idx = 0, length = chunk.length; idx< length; idx++ ) {
					    cl = chunk[idx];
					    var row = {
	    						scriptClass:"mstrmojo.Architect.DBTableRow",
	    						images: [cl.icon], 
	    						indent:cl.lvl,
	    						text: cl.n,
	    						did:cl.did,
	    						rw:cl.rw,
	    						movable: true
	    					};
					    c.addChildren([row]);
					    var r=mdl.relations;
					    if (!r[this.id]) r[this.id]={};
					    if (!r[this.id][cl.n]) r[this.id][cl.n] = cl.n;
					}						
					block.addChildren([c], index);
    			},
    			
    			addChunks: function(chunks) {
    				for (var index = 0, length = chunks.length; index< length; index++ ) {
					   this.addChunk(chunks[index], index);
					}
    				
    			},
    			
    			postBuildRendering: function pBR() {
    			    if (this._super) {
    			        this._super();	
    			    }
    			    
    			    if (this.isBase) {
    			    	c = new mstrmojo.Box({});
    			    	this.content.addChildren([c]);
    			    	this.editorNode.style.height = this.maxheight +  'px';
    			    	this.containerNode.style.height = this.maxheight -20 + 'px'; 
    			    	return;
    			    }	
    			    
    				//based on the content we have, reset the height of the block accordingly 
    				var margin = 2;
    				var block = this.content.children, h ;    				
    				var length = block.length;
    				
    			 	if (length ==0) {
    			 		this.domNode.style.display = "none";
    				    return;
    				}
    			 	this.domNode.style.display = "block";
    			 	
    				//get first chunk position
    			 	var pos1 = _D.position(block[0].domNode);
    				var pos2 = _D.position(block[length-1].domNode);
    				h = pos2.h + pos2.y - pos1.y + margin * 2 + 20 ;    			
    				h = (h > this.maxheight) ? this.maxheight: h;
    		 		this.editorNode.style.height = h +  'px';    		 	
    		 		this.containerNode.style.height = (h - 20 ) + 'px'; 
    			},
    			
    			postCreate: function (evt) {
    			    //attach to model rename attribute event
    				var am = mstrmojo.all.ArchModel;
    				if (am) {
    				    am.attachEventListener("AttrNameChange", this.id, "attrNameChange");    				  
    				}
    			},
    			
    			attrNameChange: function(evt){
    				var oldvalue =evt.oldvalue, value = evt.value;
    				var block = this.content; 
    				if (block.children) {
    				    for (var i =0 , len= block.children.length; i<len; i++) {
    				    	var chunk = block.children[i];
    				    	for (var j =0;j < chunk.children.length; j++) {
    				    	    if (chunk.children[j].text === oldvalue) {
    				    	        chunk.children[j].set("text", value);
    				    	    }	
    				    	}	
    				    }	
    				}
    			}    			
    		}	
 	    );
})();