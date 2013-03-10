(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Box",
        "mstrmojo.dom",
        "mstrmojo.css");
        
    var _C = mstrmojo.css;
    var _D = mstrmojo.dom;
    
    function _createAvatar(w){
        var d = document.createElement('div'),
            s = d.style,
            dn = w.domNode;
        d.className = "mstrmojo-VSplitPanel-avatar";
        s.width = dn.clientWidth + "px";
        dn.appendChild(d);
        w.avatar = d;
        return d;
    };
    
    mstrmojo.QB.VSplitPanel = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        //mixin
        [mstrmojo._HasLayout],
                
        {
	    	scriptClass: "mstrmojo.QB.VSplitPanel",
						
		    draggable: true,
	        
		    dropZone: false,  
		    
		    width: 0,
		    
		    topP: 40,  //top item percentage 
		    
		    topItemVisible: true,
	        bottomItemVisible: true,		    
		    
		    borderoffset: 0,
		    
		    marginSpan: 20,
		    
		    minSpan: 80,   //minimum height in px that top/bottom container can be
	    		    	
	        markupString: '<div id="{@id}" class="mstrmojo-VSplitPanel {@cssClass}" style="{@cssText}" mstrAttach:mouseup,mousemove >' +
					          '<div></div>' +			   
						      '<div style="padding-top:{@marginSpan}px;"><div class="mstrmojo-VSplitPanel-resizeHandle" style="width:{@width};height:{@marginSpan}px;margin-top:-{@marginSpan}px"></div>' + 
					          '</div>' +			        
	                      '</div>',	    	
	    	
          	markupSlots: {            
  	            topItem: function(){ return this.domNode.children[0];},
  	            bottomItem: function(){ return this.domNode.children[1];}  	         
  	        },              
	                      
	    	children: [	    	            
  				{
  					scripClass:"mstrmojo.Box",
  					slot: 'topItem'
  				},					
  			    {
  					scripClass:"mstrmojo.Box",
  					slot: 'bottomItem'
  				}	                  
	    	],
	    	           
	        getDragData: function getDragData(ctxt){ 
	            var s = ctxt.src,
	                n = s.node;
	            if(n["className"] && n["className"].indexOf("mstrmojo-VSplitPanel-resizeHandle")>=0){//dragging on the resize handle
	            	var pos = _D.position(this.domNode);	            	
	                return {node:n, x: pos.x, y :pos.y, h: pos.h, w: pos.w};
	            } else {
	                if(this._super){
	                    return this.dropZone && this._super(ctxt);
	                }
	            }
            	return null;
	        },
	        
	        allowDrop: function allowDrop(ctxt){
	            var s = ctxt.src,
	            d = s && s.data;
	            if (d && d.node){
	                return true;
	            } else {
	                return this.dropZone; //shall make sure only allow dropping that is meaningful to this panel. 
	            }
	        },
	        
	        ondragmove: function odm(ctxt) {
	        	var s =ctxt.src,
	        	    d = s && s.data;
	        	if (d && d.node){
	        		var t = ctxt.tgt,
	                    av = this.avatar;
	    		    if (av) {
	    		      	av.style.top = Math.min(Math.max(d.y + this.minSpan, t.pos.y), d.y + d.h - this.minSpan) + "px"; //
	    		    }	
	        	}	
	        },	
	        
	        ondragstart: function ondragstart(ctxt){
	            var s = ctxt.src,
	                d = s && s.data;
	            if (d && d.node){
	            	var av = this.avatar || _createAvatar(this);
	            	this.ownAvatar = true;	         
	            	av.style.top =  Math.max(d.y, s.pos.y) + "px";
	            	av.style.left = d.x + "px";
	                av.style.display = "block";	
	                av.style.zIndex = "9999";	
	                av.style.width = d.w + 'px';
	                return true; 
		        } else {
		            if(this._super){
		                return this._super(ctxt);
		            }
		        }
	            return false;
	        },
	    	
	    	
	    	ondragend: function ondragend(ctxt){
		        var s = ctxt.src,
	                d = s && s.data;
		        if (d && d.node){	        		
	                var av = this.avatar;
		    	        if (av) {
		    		    	av.style.display = "none";		    		    
		    		    	var deltaX = parseInt(av.style.top) - d.y, h = this.domNode.clientHeight;
		    		    	this.topP = deltaX * 100/h; 
		    		    	this.layoutConfig.h = {
		    		    	    topItem: this.topP + '%',
		    		    	    bottomItem: 100 - this.topP + '%'
		    		    	};
		    		    	this.doLayout();
		    		    }
		                this.ownAvatar = false;
		           } else {
	                if(this._super){
	                    this._super(ctxt);
	                }
	            }	        	
	        },	    	
	    	
	        
	        layoutConfig: {
                w: {
                    topItem: '100%',
                    bottomItem: '100%'
                },
                h: {
                	topItem: '40%',
                    bottomItem: '60%'
                }
            },
            
            afterLayout: function()  {
            	 if (this.domNode) {
            		var st = this.domNode.children[1].children[0].style; //the splitter
                 	if (this.topItemVisible && this.bottomItemVisible) {
                 		st.display = 'block';
                 		this.children[0].set("visible",true) ;  
 	                	this.children[1].set("visible", true) ;
 	                	st.width = this.width;	
 	                	/*this.children[0].set("height", parseInt(this.topItem.clientHeight)+'px');
 	                	this.bottomItem.style.height = parseInt(this.height) - this.topItem.clientHeight - this.marginSpan + 'px';
 	                	this.children[1].set("height", this.bottomItem.style.height);*/
 	                	var lih=parseInt(this.children[0].height);
 	                	this.children[0].set("height", lih +'px');
 	                	this.bottomItem.style.height = parseInt(this.height) - lih - this.marginSpan + 'px';
	                	this.children[1].set("height", this.bottomItem.style.height);
                 	}else{
                 	    st.display = 'none'; 
                 	    if (this.topItemVisible) {
                 	        this.children[0].set("width", this.width);
                 	        this.children[1].set("visible",false) ;  
                 	    }else {
                 	    	this.children[1].set("width", this.width);
                 	    	this.children[0].set("visible", false) ;  
                 	    }	
                 	}	
                 }	            	
            },
            
            _set_topItemVisible: function(n,v) {
            	if (this.topItemVisible != v) { 
            		this.topItemVisible = v;
            		if (v) {
	        	    	this.layoutConfig.h = {
	    		    	    topItem: this.topP + '%',
	    		    	    bottomItem: 100 - this.topP + '%'
		    		    };
	        	    	if (this.bottomItem) {
        				    var td = this.bottomItem;
        				    td.style["padding-top"]= this.marginSpan +'px';   
	        			}
            		}else {
            			this.layoutConfig.h = {
    	    		    	    topItem:  '0%',
    	    		    	    bottomItem: '100%'
    		    		};
            			if (this.bottomItem) {
         				   var td = this.bottomItem.parentNode;
         				   td.style["padding-top"]= '0px';   
         			    }
            		}	
        	    	this.doLayout();            	  
            	}	            	
            },
            
            _set_bottomItemVisible: function(n,v) {
            	if (this.bottomItemVisible != v) {   
            		this.bottomItemVisible = v;
            		if (v) {            		   	
        			   this.layoutConfig.h = {
        		    	    topItem: this.topP + '%',
        		    	    bottomItem: 100 - this.topP + '%'
    	    		   };        			   
            		}else {
            		   this.layoutConfig.h = {
            				topItem:  '100%',
	    		    	    bottomItem: '0%'
    		    		};            		   
            		}        	    	
        	    	this.doLayout();            	  
            	}	            	
            },
            
            
	        postBuildRendering: function(){
            	if (this._super)
            		this._super();
            	this.width=this.domNode.clientWidth + 'px';
            } 
        }    
    );
})();    