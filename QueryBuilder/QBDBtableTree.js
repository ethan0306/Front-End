(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.WH.TableTree"
    );
    
    mstrmojo.requiresDescs(9142,773, 9143); 
    
    function _setPosition(av,t,l){
   	 av.style.left = l;
        av.style.top = t;
   }

   /**
    * Create avatar dom structure.
    */
   function _createAvatar(k){
    	var w=k.parent;
    	var d = document.createElement('div'),
           s = d.style,
           dn = w.parent.parent.domNode;
        d.className = "mstrmojo-qb-avatar";
        dn.appendChild(d);
        w.avatar = d;
        return d;
   }
   var  _useCache = true,
	    $D=mstrmojo.dom,
       _dnd=mstrmojo.dnd,
       _R=mstrmojo.range;
    
    mstrmojo.QB.QBDBTableTree = mstrmojo.declare(
        // superclass
        mstrmojo.WH.TableTree,
        // mixins
        null,
        {   
        	 scriptClass:'mstrmojo.QB.QBDBTableTree',
	         draggable: true,			                
	         multiSelect: true,
	         ownAvatar:true,
	         itemFunction: function ifn(item, idx, w){
                 var tree = w.tree || w,
                  iw = new mstrmojo.TreeBrowserNode({
                      data: item,
                      _model:w._model,
                      state: 0,
                      parent: w,
                      tree: tree,
                      multiSelect: w.multiSelect,
                      text: item[w.itemDisplayField],
                      textCssClass: tree.item2textCss(item),
                      items: item[w.itemChildrenField],
                      itemIdField: w.itemIdField,
                      itemDisplayField:'nt',
                      itemIconField: w.itemIconField,
                      itemChildrenField: w.itemChildrenField,
                      itemFunction: w.itemFunction,
                      listSelector: w.listSelector,
                      draggable:true,
                      ownAvatar:true,
              getDragData: function(c){
            	          var w=c.src.widget,
           	              d=w.data,
           	              p=w.parent;
             	        	  d.html=d.n;
              	        	  d.ns=new Array();
            	        	     for(var k in p.selectedIndices){
            	        	    	 /*if(p.text)
            	        	    		d.ns.push(p.text+'.'+p.items[k].did); 
            	        	    	 else*/
            	        	    	    d.ns.push(p.items[k].did);
            	        	     }
	              	           return d;
                         },
              
              onmousedown: function omd(evt) {
                          if(this.selectedIndex>-1)
                            _dnd.startDragCheck(evt.hWin, evt.e);
                        },  
                        
              predblclick: function predblclick(evt){
	                        	var qb=this._model,
	                        	    e = (window.event) ? window.event : evt;
	       	                        target = $D.eventTarget(window.event,$D.isFF?e.e:e),
	       	                        t = evt.src.data;
	                        	if(target.className.indexOf("mstrmojo-TreeNode-state")>-1) return;
	                        	if (qb.FFSQLMode){
	                        		var ff=mstrmojo.all.FFsql,
	                        		    tks=[];
	                        		var st=ff.parent.parent.emtxt.domNode.style;
	                        		if(st.visibility==="visible")st.visibility="hidden";
	                        		if (t && t.tag && t.tag.tbn){
	                        			var cb = {
						            			success: function(res) {
	                        				       var items=ff.items,
	                        				           len=items.length;
	                        				       if(len>0&&items[len-1]!=='\n')
	                        				    	   items.push({isNew:true,v: '\n',isDelimiter:true, did:ff.itemCount++});
		                        			        items=items.concat(res.items);
		                        			       ff.set('items',items);
						            		    },
						            		    failure: function(res){}
						            	};
		                        		qb.getSQLfromTbl(evt.src,cb);
	                        		}
	                        		else{
	                        		     tks.push({isNew:true,v: evt.src.data.did, oi:evt.src.data, did:ff.itemCount++});
	                        		     ff.insertTokens(tks);
	                        		}
	                        	}else{
	                        		if (t && t.tag && t.tag.tbn) { //only if this is a table
	                        			t = t.tag;
		                        		var cb = {
						            			success: function(res) {
		                        			     var fn = function(res){
		                        				     if(!qb.click_tbls) qb.click_tbls=1;
		                        			         else qb.click_tbls++;
				            			    	     qb.raiseEvent({name: 'TableAdded', data:res.items, x:10*qb.click_tbls, y:10*qb.click_tbls, tbn: res.alias});			     	 				     	 							            			    	
				            			    };
						            			    qb.addTable(t, res.items, {success: fn});
						            		    },
						            		    failure: function(res){	return;}
						            	};
		                        		qb.getColumnsForDBTable(evt.src,cb);
	                        		}
	                        	}	
	                        	$D.stopPropogation(evt.hWin, evt.e);
	                        	$D.clearBrowserHighlights(evt.hWin);
		                        return false;
		                 },  
		                        
               postcreate: function(){
                      	 this.scrollboxNode=new Object();
                           this.dropCueNode=new Object();
                        },
              ondragstart: function ondragstart(ctxt){
                      	 var newNode=this.domNode.cloneNode(true);
                      	 var qb=this._model;

                      	 if (!qb.FFSQLMode&&!qb.isFFSQL){
	                    		if((ctxt.src.data) && (ctxt.src.data.cln)){
	                    			return false;
	                    	}
	                     }
                      	 this.parent.ownAvatar = true;
                      	 var a = this.parent.avatar || _createAvatar(this);  
			                 var newNode=this.domNode.cloneNode(true);
			                 var l =  ctxt.src.pos.x + "px";
	                         var t = ctxt.src.pos.y + "px";

			                 if ((ctxt.src.data) && (ctxt.src.data.ns.length > 1)){
				                	 newNode.firstChild.childNodes[2].innerHTML=ctxt.src.data.ns.length;
				                	 newNode.firstChild.childNodes[2].style.cssText="font-size:12px; font-weight:900;color:black;";
				                	
				                 }	 
			                 	
				                 var fc = a.firstChild;
				                 var fs= newNode.childNodes[1];
				                 var fsc=fs.firstChild;
			                 
				                 while( fc ) {
				                	a.removeChild( fc );
				                	fc = a.firstChild;
				                 }
				                 while( fsc) {
				                	fs.removeChild( fsc );
				                	fsc = fs.firstChild;
				                 }
			                 a.appendChild(newNode);
	                    	_setPosition(a,t,l);
			                 a.style.display = "block";
			                 return true;//need to return true to indicate that it is ok to drag. 
			                
			            }, 
			            ondragmove: function ondragmove(ctxt){
			            	var qdl=this._model;
			                    var t = ctxt.tgt,
			                        w=ctxt.tgt.widget,
			                        a = this.parent.avatar;
			                    if(a){
			                    	var l = t.pos.x + 1 + "px";
			                        var t = t.pos.y +  1 + "px";
			                    	_setPosition(a,t,l);
			                    }
			                  if((qdl.FFSQLMode)&&w&&(w.data||w.id=="FFsql")){
			                    var x=ctxt.tgt.pos.x,
			                        y=ctxt.tgt.pos.y;
			                	  if(w.id=="FFsql"){
			                		 var ws=w.ctxtBuilder.itemWidgets,
		                		         len=ws.length;
		                	          if(len===0) return;
			                		  var n=ws[len-1].domNode,
			                		      pos=$D.position(n);
			                		 if(y>pos.y+n.clientHeight){
			                		    w._delaySetCaretPos(n, false);
			                	      }
			                		 else{
			                			 for(var i=len-1; i>-1; i--){
			                				 if(ws[i].data.v=='\n'||ws[i].data.v=='\t') continue;
			                				var node=ws[i].domNode,
			                				    wy=$D.position(node).y;
			                			     if(wy<y && !(wy+14<y)){  //cursor within the row y bounder
			                			     w._delaySetCaretPos(node, false);
			                			     break;
			                			     }
			                			    }
			                		 }
			                	  }
			                			 
			               else{
			                	 var len=w.data.v.length,
			                	     width=w.domNode.offsetWidth,
				                	     pos=$D.position(ctxt.tgt.widget.domNode),
			                	     offset=parseInt((x-pos.x)*len/width+0.5);
			                	     _R.collapseOnTextNode(ctxt.tgt.widget.domNode,offset);
			                  }
			               }
			           },
			            ondragend: function ondragend(ctxt){
			            	var qdl=this._model;
	                    	if ((ctxt.tgt.widget)&&(ctxt.tgt.widget.alias)&&(ctxt.tgt.widget.alias=="canvasbox")){
	                    	}
	                    	else{
	                    		this.parent.avatar.style.display = "none";
	                    		this.parent.ownAvatar = false;
	                    	}
			            }
			            
              });
              return iw;
          	},
     
	            onRender: function onR(){	         	 				            
	                if (this.domNode){ 
		  	            this.domNode.style.height= this.height;  
		  	            this.domNode.style.width= this.width;   
		   	        }	         	 				                	
	            },
	                
	            onheightChange: function heightchange(evt){
	                if (this.domNode){	         	 				            	  
		  	            this.domNode.style.height= parseInt(this.height) + 'px';
		 	        }
	            },
	            
	            dbroleChange: function clear(evt) {
	            	//when dbrole is changed, we want to clear the list then re-populate it	         	 				          
	            	var tr =this;
	            	tr.set("items",[]);			            
	            	callbacks = {
	            	    success: function (res) {
	            		      tr.set("items", res);
	            		      var me=mstrmojo.all.FFsql;
             	          success = function(res){  
                            if(res){
                                 me.set('candidates', {items:res, isComplete: true});	                                                           
                             }
   	    	              },   	                	                                                     
                        failure = function(res){};   
                           m.getFFsqlComponents({success: success, failure: failure});
	            	    },
	            		failure: function (res) {
	            	    	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	            	    }
	            	}		
	            	var m = this._model;
			        m.getSelectedDBRoleTables(callbacks, this.useCache); 
	            }
   });
}());