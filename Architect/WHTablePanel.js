(function () { 
	
    mstrmojo.requiresCls(  
        "mstrmojo.WH.WHPanel",
        "mstrmojo.WH.TableTree"
	);
    
    var $D=mstrmojo.dom,
        $C=mstrmojo.css,
        _select_treeitem = function(evt) {    	   
	      var  _ctrl = $D.ctrlKey(window, evt);		            	    
    	  if (_cachedRow) {
    	    var row = $D.findWidget(_cachedRow);
    	    if (!row) {
    	        return ;
    	    }
    	    var tr = row.tree;
    	    var idx = mstrmojo.array.find(tr.items, "did", row.data.did);
    	    if (_ctrl) {
    	    	tr.addSelect(idx);
    	    }else{
    	    	tr.singleSelect(idx);
    	    }    	    
    	}    	
    };
    
    var _toAdd = new Object();
    /************************Private methods*********************************/

    mstrmojo.Architect.WHTablePanel = mstrmojo.declare(
        // superclass
        mstrmojo.WH.WHPanel,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.Architect.WHTablePanel",            
            
            dbt:[
               {
            	scriptClass:"mstrmojo.WH.TableTree",
		        alias: "DBTableTree",
	        	id:"DBTableTree",
		        multiSelect: true,
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
		            	    },
		            		failure: function (res) {
		            	    	mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
		            	    }
		            	}		
		            	var m = mstrmojo.all.ArchModel;
				        m.getSelectedDBRoleTables(callbacks, this.useCache); 
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
		               	        _cachedRow = null;
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
		               	        	    	left = target.offsetLeft + target.offsetWidth - 27 ;
		               	        	    	top = target.offsetTop - me.domNode.scrollTop - me.domNode.clientHeight;  //take into account of the scrollbar
		               	        	    	_cachedRow = target;
		               	        	    }	
		              	        	};
		               	        	if (isCNode) {
		               	        		isColumnRow = target.className.indexOf("t26") >= 0;
	                        	    	isTableRow = target.className.indexOf("t15") >= 0;
	                        	    	left = target.parentNode.offsetLeft + target.parentNode.offsetWidth - 27 ;
	                        	    	top = target.parentNode.offsetTop - me.domNode.scrollTop - me.domNode.clientHeight + 3 ;
	                        	    	_cachedRow = target.parentNode;
		               	        	}				                	              	
               	       			if (isTableRow) {
		               	            	//var left = target.offsetLeft + target.offsetWidth - 22 , top = target.offsetTop - me.domNode.clientHeight + 1 ; //offset the margin
		               	            	cxtmenu.cssText = "position:relative; height:20px; width:18px; left:" + left + "px; top:" + top + "px;visibility:visible; border:0px; background-color:transparent";					                	            	
               	       			}
		               	        	cxtmenu.render();
		               	        }
		               	    };
		                if (this.domNode){ 
			  	            this.domNode.style.height= parseInt(this.height) + 'px';
			  	            this.domNode.style.width= parseInt(this.width) + 'px';  //set back the width after rendering
			  	           	$D.attachEvent(this.domNode, 'mousemove', _cxtmenu_popup);
			  	           	$D.attachEvent(this.domNode, 'click', _select_treeitem);
			  	            $D.attachEvent(this.domNode, 'mouseout', _cxtmenu_hide);
			 	        }
		            }
	      },
	     {
              scriptClass: "mstrmojo.MenuButton",
          	 cssClass: "mstrmojo-Editor-button function",      	
              cssText: "position:absolute; height:20px; width:20px;visibility:hidden; border:0px solid; background-color:transparent;",
              iconClass: "mstrmojo-ArchitectListIcon addbtn", 
              alias: "cxtmenu",
            	itemIdField: 'did',
          	itemField: 'n',
              text:"",
          	itemChildrenField: 'fns',
          	onclick:function(evt){
          	    //select current row 
          	    _select_treeitem(evt.e);	            	
	            	var tlist = [],item, tr=this.parent.DBTableTree, h= tr.selectedIndices,
	            	mdl=mstrmojo.all.ArchModel, count=0;			            			            	
      	    	if (mdl){
      	    		for (var index in h){
      	    		    item = tr.items[index];
      	    		    if (item.st == 8405){
              	    		tlist[count] = item;
              	    		_toAdd[item.n] = parseInt(index);
              	    		count++;
      	    		    }
          	    	} 
      	    	    mdl.addTables(tlist,tr);
      	    	}
      	    	_cachedRow = null;
      	    	this.cssText = "position:relative;visibility:hidden;";  //hide the add button
      	    	this.render();
              },
              onRender: function(){
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
    });
})();