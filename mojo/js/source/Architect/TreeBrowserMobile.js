(function(){
    
    mstrmojo.requiresCls(
    	"mstrmojo.WH.TableTree",
    	"mstrmojo._TouchGestures",
    	"mstrmojo._HasTouchScroller"
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
	    $D=mstrmojo.dom;
    
    mstrmojo.Architect.TreeBrowserMobile = mstrmojo.declare(
        // superclass
    	mstrmojo.WH.TableTree,
        // mixins
        [mstrmojo._TouchGestures, mstrmojo._HasTouchScroller ],
        {   
        	   scriptClass:'mstrmojo.Architect.TreeBrowserMobile',
        	   renderOnScroll: false,
        	   
        	 updateScrollerConfig: function updateScrollerConfig() {
             	var cfg=this.scrollerConfig;
             	    cfg.bounces=true;
             	    cfg.showScrollbars=false;
             	    cfg.vScroll=true;
             	    cfg.origin={x:0,y:0};
             	    cfg.scrollEl=this.itemsContainerNode;
             	    cfg.offset = {
                             y: {
                                 start: 0,
                                 end: cfg.scrollEl.clientHeight
                             }
             	    };
                 return cfg;
             },
             shouldTouchBubble: function shouldTouchBubble(touch) {
                 // Default to horizontal.
                 var scroller = this._scroller,
                     isVertical = touch.isVertical,
                     h=scroller.scrollEl.clientHeight-this.domNode.clientHeight;
                     scroller.offset['y']['end']=h;
                 // Does the scroller not scroll in this orientation OR is the scroller at the end in this orientation?
                 return (h<=0||!isVertical || scroller.offset['y'][touch.direction['y'] ? 'end' : 'start']=== scroller.origin['y']);
             },
             
             touchTap: function touchTap(touch) {
	                 try {
	                	    var tn=touch.target.innerText,
	                	        idx=mstrmojo.array.find(this.items,'n', tn),
	                	        tlist=[{n:tn}];
	                	       if (this._model)
	                	        this._model.addTables(tlist,this);
	                 } catch (ex) {
	                     // This is a top level exception handler so we display the error to the user
	                     // and do not re-throw the exception.
	                     mstrApp.onerror(ex);
	                 }
	              },
      
             touchSelectEnd: function touchSelectEnd(touch) {
                 // Call touch tap.
                 this.touchTap(touch);
             },
             
             findDroppable: function(nd, c){
                 var w = $D.findWidget(nd);
                 while (w) {
                     if (w.dropZone) {
                         if (w.allowDrop && w.allowDrop(c)) {
                             return w;
                         }
                     }
                     w = w.parent;
                 }
                 return null;
             },
             touchSwipeBegin:function (touch) {
            	  	if(touch.isVertical&&this._super) {
            		       this._super(touch);
            		       this.isSwiping=true;
            		       return;
            	     }
            		  var a = this.avatar || _createAvatar(this),
            		      fc=a.firstChild;
            		  while(fc) {
 			                	a.removeChild(fc);
 			                	fc = a.firstChild;
 			                 }
            		  var newNode=touch.target.cloneNode(true);
            		  var l = touch.clientX + "px";
            		  var t = touch.clientY+ "px";
            		  a.appendChild(newNode);
            		  _setPosition(a,t,l);
            		  a.style.display = "block";
            		  if(!this.avatar) this.avatar=a;
            		  var w=$D.findWidget(touch.target);
            		  this.tsrc={data:w&&w.data, widget:w, pos:{x:l,y:t}};
             }, 
             touchSwipeMove:function (touch) {
         		if(this.isSwiping&&this._super) {
         		       this._super(touch);
         		       return;
         	     }
            	     var a = this.avatar;
                     if(a){
                    	var l = touch.clientX + 1 + "px";
                        var t = touch.clientY +  1 + "px";
                    	_setPosition(a,t,l);
                    }
             },
             touchSwipeEnd:function(touch) {
           	  if(this.isSwiping&&this._super) {
      		            this._super(touch);
      		            this.isSwiping=false;
      		            return;
      	         }
              	 var w=this.findDroppable(touch.target,{sn:this.alias,tp:26});
              	 if(w&&w.ondrop)  {
              		 touch.src=this.tsrc;
              		 w.ondrop(touch);
              	 }
              	 this.avatar.style.display = "none";
               }
   });
}());