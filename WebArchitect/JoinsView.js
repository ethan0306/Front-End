(function () {
    mstrmojo.requiresCls(  
        "mstrmojo.HBox",
        "mstrmojo.Box",       
        "mstrmojo.Table"
     );
    
    var $C = mstrmojo.css,
        $D = mstrmojo.dom,
         _menuItems = [ 
                       { 'did': 'Rename', 'n': 'Rename'},
                      { 'did': 'Delete', 'n': 'Delete'}];
                      
    /*
     *  check if the widget is visible
     */
    function _isVisible(w) {
    	return (w.domNode && w.domNode.style.display != 'none');
    };	
    
   
    /*
     *  retrieve and display the joins for the attribute 
     */
    function _display(w) {
	   var  mdl = mstrmojo.all.ArchModel,
	        tid = mdl.SelTableID,
		    aid = mdl.SelAttrID;
		if (!tid) {
			w.content.joins.set("items", []);
			return;
		}	
		var tbl= mdl.getTable(tid),
		    cb = { 
			success: function(res) {
			     w.content.joins.set("items", res);
		    },
		    failure: function(res){
		    }
		}
		mdl.getJoinsForTable(tbl, aid, cb);
    };
    
  
    /************************Private methods*********************************/

    mstrmojo.Architect.JoinsView = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.Architect.JoinsView",
            targetTableName: "",
            items: [],
            children: [   
                {
        		    scriptClass: "mstrmojo.Table",
        		    alias: "header",
        	 		rows: 1,
        	        cols: 1,        	  
        	 		cssClass: "mstrmojo-Architect-Panel-header subheader",
        	 		children: [
        	 		    {
        	 		        scriptClass: "mstrmojo.Label",
        	 		        alias: "title",
        	 		        slot: "0,0",
        	 		        cssClass: "mstrmojo-Architect-Panel-header subheader",
        	 		        cssText: "padding-left: 5px; padding-right: 5px;",
        	 		        text: " Join(s)",
        	 		    }
        	 		]
        		},
        		{
        			scriptClass: "mstrmojo.Box",
        			alias: "content",
        			cssText: "margin-left: 5px; background-color:white; height:100%;",
        			children: [
        			    {
        			    	scriptClass: "mstrmojo.WH.TableTree",
        			    	alias: "joins",
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
        			    			tp:'Join t'+item.tp,
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
        			    				 if(item.tp===12)
                                            this.set("state", 1);
        			    			 }
        			    		});
        			    		return iw;
        			    	},
        			        getContentThroughTaskCall: function getContentThroughTaskCall(params, callbacks){
        			        	var me=this;
        			        		if (params.isRoot){
        			        			callbacks.success(me.items);
        			        		}
        			        		else {
	            	                       callbacks.success(params.data);
	                               }
        			        	},
        			      item2textCss: function item2textCss(data){
        			        	  	return  ("mstrmojo-ArchitectJoinList t" + data.tp);
	                       },
	                        onRender: function onR(){
                                	var me = this,
             	                    _cxtmenu_hide = function (evt) {
           	                              var cxtmenu = me.parent.cxtmenu;
           	                              if (cxtmenu) {
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
           	                          cxtmenu.cssText = "position:relative;visibility:hidden;";
           	                          var target = $D.eventTarget(window, evt);
           	                        	  w=$D.findWidget(target);                	              	
           	                        		 if (w&&w.textCssClass&&w.textCssClass.indexOf('t15')>-1) {
           	                        		    var n=w.domNode,
           	                        		        left = n.offsetLeft + target.parentNode.offsetWidth ,
                	                               	top = n.offsetTop - me.domNode.scrollTop - me.domNode.clientHeight;
           	                        		    cxtmenu.w=w;
           	                        		 	cxtmenu.cssText = "position:relative; height:20px; width:18px; left:" + left + "px; top:" + top + "px;visibility:visible; border:0px; background-color:transparent";					                	            	
           	                        	 	    cxtmenu.render();
           	                        	 }
           	                };
           	                if (this.domNode){ 
           	                		$D.attachEvent(this.domNode, 'mousemove', _cxtmenu_popup);
           	                		//	$D.attachEvent(this.domNode, 'click', _select_treeitem);
           	                		$D.attachEvent(this.domNode, 'mouseout', _cxtmenu_hide);
           	                	}
	                        }
        			    },
        			    {
		       	          scriptClass: "mstrmojo.MenuButton",
		       	          cssClass: "mstrmojo-Editor-button function",
		                  cssText: "position:absolute; height:20px; width:20px;visibility:hidden; border:0px solid; background-color:transparent;",
		                  iconClass: "mstrmojo-ArchitectListIcon div", 
		                  alias: "cxtmenu",
		                  executeCommand: function(item){
		                	  var tlist = [],item, tr=this.parent.ProjTableTree, h=tr.selectedIndices,
		                	  		mdl=mstrmojo.all.ArchModel, row=$D.findWidget(tr._cachedRow);
		                	  switch (item.did) {
		                	  			case "Edit": {				        	   
			        	    		   
		                	  					break;
		                	  				}
		   			        
		                	  			case "Delete": {
	                        
		                	  					break;
		                	  				}
		                	  			default: {				 
		                	  				break;
		                	  				}
		   		               }
		   		        },
		   		
		   		    postCreate: function(){		  
		   		        this.cm = _menuItems;
		   		    },
		   
		            onRender: function(){
		              var _cachedRow=this.parent.children[0]._cachedRow;
		           	    var mouseover_handle = function (evt) {		                	               		
		           		    if (_cachedRow) {  //in the case when mouse over the context menu, we still show the background for current row
		           			    $C.toggleClass(_cachedRow, "architect-highlight", true);  
		           		    }	 
		           	    },  mouseout_handle = function (evt) {
		           		    if (_cachedRow) {  //in the case when mouse out of the context menu, we restore the background for current row
		               		    $C.toggleClass(_cachedRow, "architect-highlight", false);  
		               	    }	 
		              	}; 	
		           	    $D.attachEvent(this.domNode, 'mousemove', mouseover_handle);
		           	    $D.attachEvent(this.domNode, 'mouseout', mouseout_handle);
		            }	       		
		        }
        			]
        			
        		}
                		
	        ],
	
        	refresh: function (evt) {
        		//skip if this panel is invisible for performance 
        		if (!_isVisible(this)){
        			return;
        		}
                _display(this);
        	   
        	},
        	postCreate: function(){
        		 var mdl=mstrmojo.all.ArchModel;
        		 mdl.attachEventListener("SelTableIDChange", this.id , "refresh"); 
        		 mdl.attachEventListener("SelAttrIDChange", this.id , "refresh");
        	}
        });

})();