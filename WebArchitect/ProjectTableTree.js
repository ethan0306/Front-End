(function(){
    
    mstrmojo.requiresCls(
    	"mstrmojo.WH.TableTree"
    );
    
    mstrmojo.requiresDescs(9142,773, 9143); 
    
    var  _useCache = true,
    _cachedRow,
    $D=mstrmojo.dom,
    $H=mstrmojo.hash,
    model=mstrmojo.all.ArchModel;
    
    function _setPosition(av,t,l){
   	 av.style.left = l;
        av.style.top = t;
   };

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
   };
   
   var _renameTableName = function (tid, n, cb) {
       if (mstrmojo.string.isEmpty(n)){
           mstrmojo.alert("name can't be empty",null,"Table Rename");          
           return false;
       }   
       var callback = {
           success: function(res){
       	    cb.success(res);
           },
           failure: function(res) {            	
           	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));	
           	cb.failure(res);
           }	
       }        
       mstrmojo.all.ArchModel.renameObject(tid, 15, n, callback);
   };  
   
    mstrmojo.Architect.ProjectTableTree = mstrmojo.declare(
        // superclass
    	mstrmojo.WH.TableTree,
        // mixins
        null,
        {   
        	scriptClass:'mstrmojo.Architect.ProjectTableTree',
        	cssClass: "mstrmojo-Architect-WarehouseTablesTree",        
        	itemFunction: function ifn(item, idx, w){
        			    		var tree = w.tree || w,
        			    		iw = new mstrmojo.TreeBrowserNode({
        			    			 markupString: '<li id="{@id}" class="mstrmojo-TreeNode {@cssClass}" style="{@cssText}" mstrAttach:mousedown,click,dblclick>'
                                                     + '<div class="mstrmojo-TreeNode-div {@tp}">'
                                                     + '<img class="mstrmojo-TreeNode-state" src="../images/1ptrans.gif" />'
                                                     + '<img class="mstrmojo-TreeNode-checkBox" src="../images/1ptrans.gif" />'
                                                     + '<span class="mstrmojo-TreeNode-text {@textCssClass}"></span>'
                                                     + '</div>'
                                                      + '<ul class="mstrmojo-TreeNode-itemsContainer">{@itemsHtml}</ul></li>',
        			    			tp:'Proj t'+item.t,
                                    data: item,
        			    			parent: w,
        			    			tree: tree,
        			    			text: item[w.itemDisplayField],
        			    			textCssClass: tree.item2textCss(item),
        			    			items: item[w.itemChildrenField],
        			    			itemDisplayField: w.itemDisplayField,
        			    			itemChildrenField: w.itemChildrenField,
        			    			itemFunction: w.itemFunction,
        			    			onRender: function(){
        			    				if(item.t===29)
                                            this.set("state", 1);
        			    			 }
        			    		});
        			    		return iw;
        			 },
      	 getContentThroughTaskCall: function getContentThroughTaskCall(params, callbacks){
                //get column content
                var m = this._model, me=this, d=params.data;
	            if (params.isRoot){
	            	callbacks.success(me.items);
	            }
	            else if(d.items&&d.t===29) {
	            	callbacks.success(d);
	              }
	            else{
	            	m.getAttributesFactsInTable(d,callbacks);
	            } 			            	
            },
      
        item2textCss: function item2textCss(data){
                      return  ("mstrmojo-ArchitectListIcon t"+data.t+" st"+data.st);
        },
        
       
        
        onnodechange: function onNdChng(evt){
        	           var it=evt.src.selectedItem,
        	               mdl=mstrmojo.all.ArchModel;
        	            mdl.SelAttrID=null;
	                    if (it&&it.t===15){
	                	     mdl.set("SelTableID",evt.src.selectedItem.did);
	                	}
	                    if (it&&it.t===29){
	                	     mdl.set("PrjTblDbr",evt.src.selectedItem.did);
	                	}
	                },
        
        onRender: function onR(){
           	var me = this,
             	_cxtmenu_hide = function (evt) {
           	        var cxtmenu = me.parent.cxtmenu;
           	        if (cxtmenu) {
           	        	//not move onto the context menu itself			               	        	
           	        	var w = $D.findWidget($D.isFF? evt.relatedTarget :evt.toElement);
           	        	if (w && (w.id == cxtmenu.id)) {
           	        	    return;	
           	        	}
               	        cxtmenu.cssText = "position:relative;visibility:hidden;";
               	        cxtmenu.render();			               	        	
           	        }	
           	    },
           	    _cxtmenu_popup = function (evt){
           	        var cxtmenu = me.parent.cxtmenu;
           	        me._cachedRow = null;
           	        if (cxtmenu) {
          	        	//cxtmenu.set("visible",false);
           	        	cxtmenu.cssText = "position:relative;visibility:hidden;";
           	        	//if on table node, show the menu
           	        	var target = $D.eventTarget(window, evt);
           	        	var isTableRow, isColumnRow, isPNode = (target.className.indexOf("mstrmojo-TreeNode-div")>-1), isCNode = (target.tagName.toUpperCase().indexOf("SPAN")>-1);
           	        	var left, top;
           	        	if (isPNode) {
           	        	    if (target.children[2]) {
           	        	    	isColumnRow = target.children[2].className.indexOf("t26") >= 0;
           	        	    	isTableRow = target.children[2].className.indexOf("t15") >= 0;
           	        	    	left = target.offsetLeft + target.offsetWidth - 37 ;
           	        	    	top = target.offsetTop - me.domNode.scrollTop - me.domNode.clientHeight;  //take into account of the scrollbar
           	        	    	me._cachedRow = target;
           	        	    }	
          	        	};
           	        	if (isCNode) {
           	        		isColumnRow = target.className.indexOf("t26") >= 0;
                	    	isTableRow = target.className.indexOf("t15") >= 0;
                	    	left = target.parentNode.offsetLeft + target.parentNode.offsetWidth - 37 ;
                	    	top = target.parentNode.offsetTop - me.domNode.scrollTop - me.domNode.clientHeight + 3 ;
                	    	me._cachedRow = target.parentNode;
           	        	}				                	              	
   	       			if (isTableRow) {
           	            	cxtmenu.cssText = "position:relative; height:20px; width:18px; left:" + left + "px; top:" + top + "px;visibility:visible; border:0px; background-color:transparent";					                	            	
   	       			}
           	        	cxtmenu.render();
           	        }
           	    };
            if (this.domNode){ 
  	           	$D.attachEvent(this.domNode, 'mousemove', _cxtmenu_popup);
  	           //	$D.attachEvent(this.domNode, 'click', _select_treeitem);
  	            $D.attachEvent(this.domNode, 'mouseout', _cxtmenu_hide);
 	        }
        },
        
        load:function(){
            	if(this.items) return;
            	var m=this._model=mstrmojo.all.ArchModel, me=this;
            	/*var cb={
            		success:function(res){
            		    var dbrs=mstrmojo.all.ArchModel.dbrs, index=0, t, d=[];				                        
         		        for (var n in dbrs){	  			                        
         			              t = dbrs[n];
         			              d[index]={
         		                  n: t.n, 
         		                  did: t.did, 
         		                  st: 7424,
         		                  t: 29,
         		                  items:[{n:t.n,t:15,items:[{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26}]},
         		                         {n:t.n,t:15,items:[{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26}]},
         		                         {n:t.n,t:15,items:[{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26}]},
         		                         {n:t.n,t:15,items:[{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26}]}]
         		                  };
         		              index++;	  			                        
         		          }
         		          me.set("items",d);
         		          m.pt_items=$H.clone(d);
            		},
            		failure:function(res){
            		}
            	};
            	m.loadProjectTables(cb);*/
            	var dbrs=mstrmojo.all.ArchModel.dbrs, index=0, t, d=[];				                        
         		        for (var n in dbrs){	  			                        
         			              t = dbrs[n];
         			              d[index]={
         		                  n: t.n, 
         		                  did: t.did, 
         		                  st: 7424,
         		                  t: 29,
         		                  items:[{n:t.n,t:15,items:[{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26}]},
         		                         {n:t.n,t:15,items:[{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26}]},
         		                         {n:t.n,t:15,items:[{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26}]},
         		                         {n:t.n,t:15,items:[{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26},{n:t.n,t:26}]}]
         		                  };
         		              index++;	  			                        
         		          }
         		          me.set("items",[]);
         		          m.pt_items=$H.clone(d);
        }
   });
}());