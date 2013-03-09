(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Container",
        "mstrmojo.dom",
        "mstrmojo.css");
        
    var _C = mstrmojo.css;
    var _D = mstrmojo.dom;
  
    function _createAvatar(w){
        var d = document.createElement('div'),
            s = d.style,
            dn = w.domNode;
        d.className = "mstrmojo-SplitPanel-avatar";
        s.height = dn.clientHeight + "px";
        dn.appendChild(d);
        w.avatar = d;
        return d;
    };
    
    
    mstrmojo.QB.SplitPanel = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        //mixin
        [mstrmojo._HasLayout],
        
        
        {
	    	scriptClass: "mstrmojo.QB.SplitPanel",
						
		    draggable: true,
	        dropZone: false,  
	
	        marginSpan: 10,   //margin distance between left and right container
	        
	        minSpan: 200,  //min width of either left or right item
	        
	        leftItemVisible: true,
	        rightItemVisible: true,
	        
	        lp: 25,  //25% initially for left panel	        	
	        
		    markupString: '<div id="{@id}" class="mstrmojo-SplitPanel {@cssClass}" style="{@cssText}" >' +
			          '<table cellpadding=0 cellspacing=0><tr>' +		   
			            '<td><div></div></td>' +			   
				        '<td style="padding-left:{@marginSpan}px;"><div class="mstrmojo-SplitPanel-resizeHandle" style="height:{@height};width:{@marginSpan}px;margin-left:-{@marginSpan}px;" ></div><div></div></td>' +			        
			        '</tr></table></div>',
			
			markupSlots: {            
	            leftItem: function(){return this.domNode.firstChild.firstChild.firstChild.firstChild.firstChild;},
	            rightItem: function(){ return this.domNode.firstChild.firstChild.firstChild.children[1].children[1];}	        
	        },
	        
	        
	        getDragData: function getDragData(ctxt){ 
	            var s = ctxt.src,
	                n = s.node;
	            if(n["className"] && n["className"].indexOf("mstrmojo-SplitPanel-resizeHandle")>=0){//dragging on the resize handle
	            	var pos = _D.position(this.domNode);	            	
	                return {node:n, x: pos.x, y :pos.y, w: pos.w, h:pos.h};
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
        		    	av.style.left = Math.min(Math.max(d.x + this.minSpan, t.pos.x), d.x + d.w - this.minSpan) + "px"; //
        		    }	
	        	}	
	        },	
	        
	        ondragstart: function ondragstart(ctxt){
	            var s = ctxt.src,
	                d = s && s.data;
	            if (d && d.node){
	            	var av = this.avatar || _createAvatar(this);
	            	this.ownAvatar = true;
	                av.style.left = s.pos.x+"px";
	            	av.style.top =  d.y + "px";
                    av.style.display = "block";	
                    av.style.zIndex = "9999";	
                    av.style.height = d.h+ 'px';
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
	    		    	//update the size of leftItem and rightItem
	    		    	var deltaX = parseInt(av.style.left)- d.x - this.marginSpan/2, wid = this.domNode.clientWidth;	    		    	 
	    		    	this.lp = deltaX * 100/wid; 
	    		    	this.layoutConfig.w = {
	    		    	    leftItem: this.lp + '%',
	    		    	    rightItem: 100 - this.lp + '%'
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
	        
	        children: [
				{
					scripClass:"mstrmojo.Box",
					slot: 'leftItem'
				},					
				{
					scripClass:"mstrmojo.Box",
					slot: 'rightItem'					
				}	                   
	        ],
	        
	        layoutConfig: {
                w: {
                    leftItem: '20%',
                    rightItem: '80%'
                },
                h: {
                	leftItem: '100%',
                    rightItem: '100%'
                }
            },
            
            afterLayout: function()  {
                    if (this.domNode) {
                	var st = this.domNode.firstChild.firstChild.firstChild.children[1].children[0].style; //the splitter
                	if (this.leftItemVisible && this.rightItemVisible) {
                		st.display = 'block';
                		this.children[0].set("visible",true) ;  
	                	this.children[1].set("visible", true) ;
	                	st.height = this.height;	                	
	                 	/*this.children[0].set("width", parseInt(this.leftItem.clientWidth) + 'px');
	                 	this.rightItem.style.width = parseInt(this.width) - this.leftItem.clientWidth - this.marginSpan + 'px';
	                 	this.children[1].set("width", this.rightItem.style.width);*/
	                	
	                	var liw=parseInt(this.children[0].width);
	                 	this.children[0].set("width", liw + 'px');
	                 	this.rightItem.style.width = parseInt(this.width) - liw - this.marginSpan + 'px';
	                 	this.children[1].set("width", this.rightItem.style.width);
	                	
                	}else{
                	    st.display = 'none'; 
                	    if (this.leftItemVisible) {
                	        this.children[0].set("width", this.width);
                	        this.children[1].set("visible",false) ;  
                	    }else {
                	    	this.children[1].set("width", this.width);
                	    	this.children[0].set("visible", false) ;
              				var td = this.rightItem.parentNode;
              				td.style["padding-left"]= '0px';   
                	    }	
                	}	
                }	            	
            },
            
            _set_leftItemVisible: function(n,v) {
            	if (this.leftItemVisible != v) { 
            		this.leftItemVisible = v;
            		if (v) {
	        	    	this.layoutConfig.w = {
	    		    	    leftItem: this.lp + '%',
	    		    	    rightItem: 100 - this.lp + '%'
		    		    };
	        	    	if (this.rightItem) {
        				    var td = this.rightItem.parentNode;
        				    td.style["padding-left"]= this.marginSpan +'px';   
	        			}
            		}else {
            			this.layoutConfig.w = {
    	    		    	    leftItem:  '0%',
    	    		    	    rightItem: '100%'
    		    		};
            			if (this.rightItem) {
         				   var td = this.rightItem.parentNode;
         				   td.style["padding-left"]= '0px';   
         			    }
            		}	
        	    	this.doLayout();            	  
            	}	            	
            },
            
            _set_rightItemVisible: function(n,v) {
            	if (this.rightItemVisible != v) {   
            		this.rightItemVisible = v;
            		if (v) {            		   	
        			   this.layoutConfig.w = {
        		    	    leftItem: this.lp + '%',
        		    	    rightItem: 100 - this.lp + '%'
    	    		   };        			   
            		}else {
            		   this.layoutConfig.w = {
	    		    	    leftItem:  '100%',
	    		    	    rightItem: '0%'
    		    		};            		   
            		}        	    	
        	    	this.doLayout();            	  
            	}	            	
            },
            
            
            postBuildRendering: function(){
            	if(this._super)
            		 this._super();
            	this.height=this.domNode.clientHeight + 'px';
            	
            }
	        
	        
        }    
    );
})();    