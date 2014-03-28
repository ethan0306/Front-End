(function(){
    
	mstrmojo.requiresCls(
            "mstrmojo.Container");
	
	function _makeTable(txt, ind, img, s, h, w){
		// table with 1 row
		var sh = h ? "height:" + h + "px;" : "";
		var sw = w ? "width:" + w + "px;" : "";
 		var table = '<div style="'+ sh + sw + '"> <table style="width: 100%; border-collapse:collapse;border-spacing=0px;table-layout: fixed;"> <tr>';
		
		for (i = 0; i < ind; i++){
			table += '<td width="13px"></td>'; // add empty spaces to the table
		}
 		table += '<td width="20px"><span class="mstrmojo-ArchitectListIconBlock t'+ img[1] + '" ></span></td>';
 		// add the text
		table += '<td  style="overflow:hidden;text-overflow:ellipsis;">' + txt + '</td>';
 		
 		// Close the table
		table += '</tr> </table> </div>';
		
        return table;
	}
	
	var _D = mstrmojo.dom,
	   _doc = mstrmojo.global.document;
	
	var _av,
      _avin,  
      _avs;
	
	var _pos;  //initial position
	
    function _updateAvatar(pos, allowDrop, html){
        if (html != null) { // null or undefined means do not update, empty string means set to blank
            _avin.innerHTML = html;         
        }
        _avs.left = pos.x + 'px';
        _avs.top = pos.y + 'px';
	}
	
    function _showAvatar(html, pos){
        if (!_av) {
            _av = _doc.createElement("div");
            _avs = _av.style; 
            _avs.position = 'absolute';
            _avs['z-index'] = 9999;
            _av.className = 'mstrmojo-Architect-TableRow-avatar';
            _av.innerHTML = '<div></div>';
            _avin = _av.firstChild;
            _doc.body.appendChild(_av);
        }
        _updateAvatar(pos, true, html);
        _avs.display = 'block';
	}
    
	function _hideAvatar(){
        if (_av) {
            _avs.display = 'none';
        }
	}
	
	function _isOver(w, x, y) {
		if (!w.domNode) {
		   return false;	
		}
		var pos = _D.position(w.domNode, true);	
		return  ((pos.y<=y) && (pos.x<=x) && (pos.x+pos.w>=x) && (pos.y+pos.h>=y));
	}	
	
	function _findTouchDroppable(t,x,y) {		
		var el = document.elementFromPoint(x,y);
		var w = _D.findWidget(el);
	    while (w) {
            if (w.dropZone) {
                if (w.allowDrop && w.allowDrop(t)) {
                    return w;
                }
            }
            w = w.parent;
        }
	    return null;	
	}	
	
	
    /**
	 * <p>
	 * Widget that represents a DB Table Row
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Container
	 */
    mstrmojo.Architect.DBTableRow = mstrmojo.declare(
    		// superclass
    		mstrmojo.Container,
    		
    		// mixins
    		[mstrmojo._TouchGestures],
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.Architect.DBTableRow",
    			
     			indent: 0,
    			
	   	        text: '',
	   	        
	   	        checkBox: false,
	   	 
	   	        draggable:true,
	   	        
	   	        ownAvatar:true,
	   	     
	   	      /*  dropZone: true,
	   	        
	            allowDrop: function allowDrop(ctxt){
	                return true;
	            },*/
	        
	   	        _leftPos: 0,
    		
    	        _topPos: 0,
    	        
    	        movable: false,
    	        
    	        dropTarget: null,
    		
	   	        	
    			markupString: '<div id="{@id}" class="mstrmojo-qb-DBTableRow {@cssClass}" style="{@cssText}" mstrAttach:click,dblclick>' +
                				'</div>',
    					 		
                markupMethods: {
                	ontextChange: function(){ this.domNode.innerHTML = _makeTable(this.text, this.indent,this.images,this.selected); }
	            },
	            
	            getDragData: function (c){
	            	var d = new Object();
	            	if (this.domNode) {
	                	d.html =  _makeTable(this.text, this.indent, this.images,this.selected, this.domNode.offsetHeight, this.domNode.offsetWidth);
	                	d.n = this.text;
	            	}
	            	return d;
	            },
	            
	           touchSwipeBegin: function(t) {
	            	 this.dropTarget =null;
	            	 var n = t.target,
	                    tn = this.domNode;
	                    if(_D.contains(tn,n,true,document.body)){
	                          if(_D.isWK){//a workaround to make the cursor taking effect in webkit browsers. 
	                              document.onselectstart = function(e){ e.preventDefault();return false; }
	                          }
	                          this.domNode.style.opacity = 0.3;
	                          _pos =  _D.position(this.domNode);	                       
	                          _showAvatar(_makeTable(this.text, this.indent, this.images, this.selected,this.domNode.offsetHeight, this.domNode.offsetWidth), _pos);	                     	                    
	                         	                                                 
	                          return true;
	                    } else {
	                          return false;
	                    }
	            },
	            
	           touchSwipeMove: function(t) {
	                //  todo, we have to put the avatar outside of the cursor, otherwise ondrop/onmove wont trigger in the container
	                _updateAvatar( {x: t.clientX+5, y: t.clientY+5}, true, _makeTable(this.text, this.indent,  this.images, this.selected,this.domNode.offsetHeight, this.domNode.offsetWidth))
	      
	                var w = _findTouchDroppable(t, t.clientX, t.clientY);	               
	            	// Check if the target has changes since the last time.
	                var tWas = this.dropTarget;
	                this.dropTarget =w;
	                
	                if (tWas !== w) {	
                    	 if (tWas) {
                             // Call the widget's ondragleave 
                             if (tWas.ondragleave) {                            	
                                 tWas.ondragleave(t);                            
                             }
                         }                    	 
                    	 if (w) {
                    		 if (w.ondragenter) {
                                 w.ondragenter(t);
                             }                    		 
                    	 }	 
	                }else if (w) {
	                    // Target widget hasn't changed, call its ondragmove.
	                    // This allows the target to update its display and decide where exactly a drop is allowed.	                
	                    if (w.ondragover) {
	                    	var c = {};
	                    	c.tgt = {};
	                    	c.tgt.pos = {x:t.clientX, y:t.clientY}; 
	                        w.ondragover(c);
	                    }	
	                } 	
	            },
	            
	            touchSwipeEnd: function(t) {
	            	//hide the avatar
	            	this.ondragend(t);	          	
	            
	                var w = _findTouchDroppable(t, t.clientX, t.clientY);	
	            	
	                if (w && w.onTouchDrop) {  //fire the event for droppable
            	        w.onTouchDrop(this,t.clientX,t.clientY);
            	    }	                
	            },
	     
	            
	            ondragstart: function(c){	            
	                var n = c.src.node,
	                    tn = this.domNode;
	                    if(_D.contains(tn,n,true,document.body)){
	                          if(_D.isWK){//a workaround to make the cursor taking effect in webkit browsers. 
	                              document.onselectstart = function(e){ e.preventDefault();return false; }
	                          }
	                          this.domNode.style.cssText="opacity:0.3; filter: alpha(opacity=30);";
	                          _pos =  _D.position(this.domNode);	                       
	                          _showAvatar(_makeTable(this.text, this.indent,  this.images, this.selected, this.domNode.offsetHeight, this.domNode.offsetWidth), _pos);
	                          return true;
	                    } else {
	                          return false;
	                    }
	              },
	              
	              /**
	               * Handler when dragging. 
	               */              
	              ondragmove: function(c){
	                  var e = c.tgt.pos,
	                      s = c.src.pos,
	                      dx = e.x - s.x,
	                      dy = e.y - s.y;	                 
	                  //  todo, we have to put the avatar outside of the cursor, otherwise ondrop/onmove wont trigger in the container
	                  _updateAvatar( {x: e.x+5, y: e.y+5}, true, _makeTable(this.text, this.indent,  this.images,this.selected, this.domNode.offsetHeight, this.domNode.offsetWidth))
	                  
	              },
	              
	              /**
	               * Handler when dragging ends. 
	               */              
	              ondragend: function(c){
	                  if(_D.isWK){
	                      document.onselectstart = function(e){return true; }
	                  }	
	                  if (this.domNode) {
	                      this.domNode.style.cssText="opacity:1; filter: alpha(opacity=100);";
	                  }
	                  _hideAvatar();
	              },
	              
	              onclick : function(evt) {	
            		  var hWin = evt.hWin,
                      e = evt.e || hWin.event,
                      tgt = e.target || e.srcElement;
                      if (tgt.type == "checkbox") {
                    	  if (this.onCheck) {
                    		  this.onCheck(tgt.checked); 
                    	  }	  
                      } 
	              }
	       
    		}	    
	    );
})();